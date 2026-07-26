import React, { useState, useRef, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  X, 
  Check, 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  FileText, 
  Trash2, 
  HelpCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Layers,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student } from '../types';
import { GRADES, CLASSES_COUNT } from '../lib/constants';
import { generateStudentCode } from '../lib/codeGenerator';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade: string;
  defaultClassNum: number | '';
  existingStudents: Student[];
  onImportStudents: (importedStudents: Student[], replaceExisting: boolean) => void;
  showToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

interface ParsedStudentRow {
  id: string;
  name: string;
  studentNumber?: string;
  parentPhone?: string;
  religion?: 'مسلم' | 'مسيحي';
  status?: 'مستجد' | 'باق';
  grade: string;
  class_num: number;
  isSelected: boolean;
  isDuplicate: boolean;
  rawRowData?: Record<string, any>;
  hasError?: boolean;
  errorMessage?: string;
}

interface ColumnMapping {
  name: string;
  studentNumber: string;
  parentPhone: string;
  religion: string;
  status: string;
  grade: string;
  class_num: string;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  defaultGrade,
  defaultClassNum,
  existingStudents,
  onImportStudents,
  showToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Target Class Settings
  const [targetGrade, setTargetGrade] = useState<string>(defaultGrade || GRADES[0]);
  const [targetClassNum, setTargetClassNum] = useState<number>(typeof defaultClassNum === 'number' ? defaultClassNum : 1);
  const [useFileGradeClass, setUseFileGradeClass] = useState<boolean>(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  // File & Excel State
  const [fileName, setFileName] = useState<string>('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewSearch, setPreviewSearch] = useState<string>('');

  // Column Headers & Mapping State
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [raw2DData, setRaw2DData] = useState<any[][]>([]);
  const [headerRowIndex, setHeaderRowIndex] = useState<number>(0);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    name: '',
    studentNumber: '',
    parentPhone: '',
    religion: '',
    status: '',
    grade: '',
    class_num: ''
  });

  const [showMappingPanel, setShowMappingPanel] = useState<boolean>(false);
  const [mappingWarning, setMappingWarning] = useState<string | null>(null);

  // Parsed Rows Output
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);

  if (!isOpen) return null;

  // Generate Sample CSV (UTF-8 BOM)
  const handleDownloadSampleCsv = () => {
    const csvHeader = 'اسم الطالب,رقم الطالب,رقم الهاتف,الديانة,الحالة,الصف,الفصل\n';
    const sampleRows = [
      'أحمد محمد علي,101,01012345678,مسلم,مستجد,الأول,1',
      'سارة محمود حسن,102,01123456789,مسلم,مستجد,الأول,1',
      'مارينا يوسف حنا,103,01234567890,مسيحي,باق,الأول,1',
      'عمر خالد مصطفى,104,01598765432,مسلم,مستجد,الأول,1'
    ].join('\n');

    const csvContent = '\uFEFF' + csvHeader + sampleRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'نموذج_قائمة_الطلاب.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Sample XLSX file
  const handleDownloadSampleXlsx = () => {
    try {
      const data = [
        ['اسم الطالب', 'رقم الطالب / الكود', 'رقم هاتف ولي الأمر', 'الديانة', 'الحالة', 'الصف', 'الفصل'],
        ['أحمد محمد علي', '101', '01012345678', 'مسلم', 'مستجد', 'الأول', 1],
        ['سارة محمود حسن', '102', '01123456789', 'مسلم', 'مستجد', 'الأول', 1],
        ['مارينا يوسف حنا', '103', '01234567890', 'مسيحي', 'باق', 'الأول', 1],
        ['عمر خالد مصطفى', '104', '01598765432', 'مسلم', 'مستجد', 'الأول', 1],
        ['فريدة كريم أحمد', '105', '01011223344', 'مسلم', 'مستجد', 'الأول', 1]
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      // Set column widths for pretty display
      ws['!cols'] = [
        { wch: 25 }, // Name
        { wch: 18 }, // Number
        { wch: 20 }, // Phone
        { wch: 12 }, // Religion
        { wch: 12 }, // Status
        { wch: 12 }, // Grade
        { wch: 10 }  // Class
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'قائمة الطلاب');
      XLSX.writeFile(wb, 'نموذج_قائمة_الطلاب.xlsx');
    } catch (err) {
      console.error('Failed to export sample XLSX:', err);
      // Fallback to CSV
      handleDownloadSampleCsv();
    }
  };

  // Auto-Detect Header Row and Columns from 2D Array
  const autoDetectHeaderAndMapping = (matrix: any[][]) => {
    if (!matrix || matrix.length === 0) return;

    // Scan top 10 rows to locate the header row (row containing keywords like 'اسم', 'طالب', 'كود', 'هاتف')
    let bestRowIdx = 0;
    let maxMatchCount = 0;

    const keywords = ['اسم', 'طالب', 'تلميذ', 'كود', 'رقم', 'هاتف', 'تليفون', 'دين', 'ديانة', 'صف', 'فصل', 'حالة', 'name', 'student', 'phone', 'id'];

    for (let r = 0; r < Math.min(10, matrix.length); r++) {
      const row = matrix[r];
      if (!Array.isArray(row)) continue;

      let matches = 0;
      row.forEach((cell) => {
        if (cell) {
          const str = cell.toString().trim().toLowerCase();
          if (keywords.some(k => str.includes(k))) {
            matches++;
          }
        }
      });

      if (matches > maxMatchCount) {
        maxMatchCount = matches;
        bestRowIdx = r;
      }
    }

    setHeaderRowIndex(bestRowIdx);

    const headerRow = matrix[bestRowIdx] || [];
    const cols = headerRow.map((c: any, i: number) => {
      const trimmed = c ? c.toString().trim() : '';
      return trimmed || `عمود ${i + 1}`;
    });

    setAvailableColumns(cols);

    // Perform Fuzzy Matching for Columns
    const mapping: ColumnMapping = {
      name: '',
      studentNumber: '',
      parentPhone: '',
      religion: '',
      status: '',
      grade: '',
      class_num: ''
    };

    cols.forEach((colName) => {
      const clean = colName.toLowerCase();

      // Name
      if (!mapping.name) {
        if (
          clean.includes('اسم') || 
          clean.includes('طالب') || 
          clean.includes('تلميذ') || 
          clean.includes('name') || 
          clean === 'student'
        ) {
          mapping.name = colName;
        }
      }

      // Student Number / ID / Code
      if (!mapping.studentNumber) {
        if (
          (clean.includes('رقم') || clean.includes('كود') || clean.includes('جلوس') || clean.includes('قيد') || clean.includes('مسلسل') || clean.includes('id') || clean.includes('code') || clean.includes('number')) &&
          !clean.includes('هاتف') && !clean.includes('تليفون') && !clean.includes('موبايل') && !clean.includes('phone') && !clean.includes('فصل') && !clean.includes('class')
        ) {
          mapping.studentNumber = colName;
        }
      }

      // Parent Phone
      if (!mapping.parentPhone) {
        if (
          clean.includes('هاتف') || 
          clean.includes('تليفون') || 
          clean.includes('موبايل') || 
          clean.includes('محمول') || 
          clean.includes('phone') || 
          clean.includes('اتصال') ||
          clean.includes('ولي')
        ) {
          mapping.parentPhone = colName;
        }
      }

      // Religion
      if (!mapping.religion) {
        if (clean.includes('دين') || clean.includes('ديانة') || clean.includes('مذهب') || clean.includes('religion')) {
          mapping.religion = colName;
        }
      }

      // Status
      if (!mapping.status) {
        if (clean.includes('حالة') || clean.includes('قيد') || clean.includes('status')) {
          mapping.status = colName;
        }
      }

      // Grade
      if (!mapping.grade) {
        if (clean.includes('صف') || clean.includes('مرحلة') || clean.includes('grade')) {
          mapping.grade = colName;
        }
      }

      // Class Number
      if (!mapping.class_num) {
        if (clean.includes('فصل') || clean.includes('رقم الفصل') || clean.includes('class')) {
          mapping.class_num = colName;
        }
      }
    });

    // Fallback: If 'name' was not detected, assign first non-numeric header
    if (!mapping.name && cols.length > 0) {
      mapping.name = cols[0];
      setMappingWarning('تم تعيين العمود الأول تلقائياً كاسم الطالب. يرجى مراجعة تعيين الأعمدة أدناه للتأكد.');
      setShowMappingPanel(true);
    } else {
      setMappingWarning(null);
    }

    setColumnMapping(mapping);
    parseRowsFromMatrix(matrix, bestRowIdx, cols, mapping);
  };

  // Convert 2D Matrix to Structured ParsedStudentRow[] based on mapping
  const parseRowsFromMatrix = (
    matrix: any[][],
    hIdx: number,
    cols: string[],
    mapping: ColumnMapping
  ) => {
    if (!matrix || matrix.length <= hIdx + 1) {
      setParsedRows([]);
      return;
    }

    const rows: ParsedStudentRow[] = [];
    const nameColIdx = cols.indexOf(mapping.name);
    const numColIdx = cols.indexOf(mapping.studentNumber);
    const phoneColIdx = cols.indexOf(mapping.parentPhone);
    const religionColIdx = cols.indexOf(mapping.religion);
    const statusColIdx = cols.indexOf(mapping.status);
    const gradeColIdx = cols.indexOf(mapping.grade);
    const classNumColIdx = cols.indexOf(mapping.class_num);

    for (let r = hIdx + 1; r < matrix.length; r++) {
      const row = matrix[r];
      if (!row || row.length === 0) continue;

      // Extract raw values
      const nameVal = nameColIdx >= 0 && row[nameColIdx] ? row[nameColIdx].toString().trim() : '';
      
      // Skip empty or header-repeat rows
      if (!nameVal || nameVal === mapping.name || nameVal.includes('اسم الطالب')) continue;

      const numVal = numColIdx >= 0 && row[numColIdx] ? row[numColIdx].toString().trim() : '';
      const phoneVal = phoneColIdx >= 0 && row[phoneColIdx] ? row[phoneColIdx].toString().trim() : '';
      
      // Religion
      let religionVal: 'مسلم' | 'مسيحي' = 'مسلم';
      if (religionColIdx >= 0 && row[religionColIdx]) {
        const relStr = row[religionColIdx].toString().trim();
        if (relStr.includes('مسيح')) religionVal = 'مسيحي';
      }

      // Status
      let statusVal: 'مستجد' | 'باق' = 'مستجد';
      if (statusColIdx >= 0 && row[statusColIdx]) {
        const statStr = row[statusColIdx].toString().trim();
        if (statStr.includes('باق')) statusVal = 'باق';
      }

      // Grade
      let gradeVal = targetGrade;
      if (useFileGradeClass && gradeColIdx >= 0 && row[gradeColIdx]) {
        const gStr = row[gradeColIdx].toString().trim();
        const foundG = GRADES.find(g => gStr.includes(g));
        if (foundG) gradeVal = foundG;
      }

      // Class Num
      let classNumVal = targetClassNum;
      if (useFileGradeClass && classNumColIdx >= 0 && row[classNumColIdx]) {
        const cParsed = parseInt(row[classNumColIdx].toString().trim(), 10);
        if (!isNaN(cParsed) && cParsed >= 1 && cParsed <= CLASSES_COUNT) {
          classNumVal = cParsed;
        }
      }

      // Duplicate Check against existing students
      const isDup = existingStudents.some(
        (s) => s.name.trim().toLowerCase() === nameVal.toLowerCase()
      );

      // Data Error Checks
      let hasError = false;
      let errorMessage = '';

      if (nameVal.length < 2) {
        hasError = true;
        errorMessage = 'اسم الطالب قصير جداً';
      }

      rows.push({
        id: crypto.randomUUID(),
        name: nameVal,
        studentNumber: numVal || (rows.length + 1).toString(),
        parentPhone: phoneVal,
        religion: religionVal,
        status: statusVal,
        grade: gradeVal,
        class_num: classNumVal,
        isSelected: !hasError,
        isDuplicate: isDup,
        hasError,
        errorMessage,
      });
    }

    setParsedRows(rows);
  };

  // Process File Upload (XLSX, XLS, CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    setMappingWarning(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: 'binary', cellDates: true, cellText: false });
        
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);

        const initialSheet = wb.SheetNames[0];
        setSelectedSheet(initialSheet);

        // Convert worksheet to 2D Array
        const ws = wb.Sheets[initialSheet];
        const matrix: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (!matrix || matrix.length === 0) {
          if (showToast) showToast('error', 'الملف فارغ', 'لم يتم العثور على أي بيانات داخل هذا الملف.');
          setIsLoading(false);
          return;
        }

        setRaw2DData(matrix);
        autoDetectHeaderAndMapping(matrix);

        if (showToast) showToast('success', 'تم تحميل الملف', `تم قراءة الملف ${file.name} بنجاح.`);
      } catch (err) {
        console.error('File reading error:', err);
        if (showToast) showToast('error', 'خطأ في قراءة الملف', 'تعذر قراءة صيغة هذا الملف. يرجى التأكد من اختيار ملف Excel أو CSV صحيح.');
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Change Sheet in Excel
  const handleSheetChange = (newSheet: string) => {
    if (!workbook) return;
    setSelectedSheet(newSheet);
    
    const ws = workbook.Sheets[newSheet];
    if (!ws) return;

    const matrix: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    setRaw2DData(matrix);
    autoDetectHeaderAndMapping(matrix);
  };

  // Update Specific Column Mapping
  const handleMappingChange = (field: keyof ColumnMapping, selectedCol: string) => {
    const updated = { ...columnMapping, [field]: selectedCol };
    setColumnMapping(updated);
    
    if (raw2DData.length > 0) {
      parseRowsFromMatrix(raw2DData, headerRowIndex, availableColumns, updated);
    }
  };

  // Toggle Selection
  const toggleSelectRow = (id: string) => {
    setParsedRows(prev => prev.map(r => r.id === id ? { ...r, isSelected: !r.isSelected } : r));
  };

  const toggleSelectAll = (select: boolean) => {
    setParsedRows(prev => prev.map(r => ({ ...r, isSelected: select })));
  };

  // Filtered preview rows
  const filteredPreviewRows = useMemo(() => {
    return parsedRows.filter(r => {
      if (!previewSearch.trim()) return true;
      const query = previewSearch.toLowerCase().trim();
      return (
        r.name.toLowerCase().includes(query) ||
        (r.studentNumber && r.studentNumber.includes(query)) ||
        (r.parentPhone && r.parentPhone.includes(query))
      );
    });
  }, [parsedRows, previewSearch]);

  const selectedCount = parsedRows.filter(r => r.isSelected).length;

  // Confirm Import
  const handleConfirmImport = () => {
    const selectedRows = parsedRows.filter(r => r.isSelected);
    if (selectedRows.length === 0) {
      if (showToast) showToast('error', 'تنبيه', 'يرجى تحديد طالب واحد على الأقل للاستيراد.');
      return;
    }

    const existingCodes = new Set(
      existingStudents.map((s) => s.studentNumber).filter(Boolean) as string[]
    );

    const newStudents: Student[] = selectedRows.map((r) => {
      let code = r.studentNumber ? r.studentNumber.trim().toUpperCase() : '';
      if (!code) {
        code = generateStudentCode(existingCodes);
        existingCodes.add(code);
      }
      return {
        id: r.id,
        name: r.name,
        studentNumber: code,
        parentPhone: r.parentPhone,
        religion: r.religion || 'مسلم',
        status: r.status || 'مستجد',
        grade: useFileGradeClass ? r.grade : targetGrade,
        class_num: useFileGradeClass ? r.class_num : targetClassNum,
      };
    });

    onImportStudents(newStudents, importMode === 'replace');
    
    if (showToast) {
      showToast(
        'success',
        'تم استيراد الطلاب بنجاح! 🎉',
        `تم إضافة ${newStudents.length} طالب إلى سجل الصف ${targetGrade} - فصل ${targetClassNum}.`
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen max-w-full overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-5 dir-rtl flex items-center justify-center min-h-full animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto shrink-0 transition-all">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 text-white p-5 sm:p-6 flex items-center justify-between gap-4 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg shadow-sky-950/30 shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>استيراد كشوفات الطلاب (XLSX / XLS / CSV)</span>
                <span className="bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  معالجة ذكية للأعمدة ✨
                </span>
              </h2>
              <p className="text-sky-200/80 text-xs font-medium mt-0.5">
                دعم كامل لجميع ملفات Excel وCSV مع مطابقة ذكية للترويسات وتحديد ورقة العمل.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 z-10 active:scale-95"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          
          {/* Top Controls: Target Grade & Class Selection */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <span className="text-xs font-black text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span>إعدادات الفصل المستهدف للاستيراد:</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSampleXlsx}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  title="تحميل نموذج ملف Excel محضر بجداول ملونة"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل نموذج Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="text-[11px] font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>نموذج CSV</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Grade Selector */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">الصف الدراسي</label>
                <select
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  disabled={useFileGradeClass}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer disabled:opacity-50"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>الصف {g}</option>
                  ))}
                </select>
              </div>

              {/* Class Num Selector */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">رقم الفصل</label>
                <select
                  value={targetClassNum}
                  onChange={(e) => setTargetClassNum(Number(e.target.value))}
                  disabled={useFileGradeClass}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer disabled:opacity-50"
                >
                  {Array.from({ length: CLASSES_COUNT }, (_, i) => i + 1).map((c) => (
                    <option key={c} value={c}>فصل {c}</option>
                  ))}
                </select>
              </div>

              {/* Import Mode */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">طريقة الإدراج</label>
                <select
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value as 'append' | 'replace')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="append">إضافة إلى الطلاب الحاليين</option>
                  <option value="replace">استبدال كامل لطلاب هذا الفصل</option>
                </select>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-extrabold text-slate-700 hover:text-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={useFileGradeClass}
                  onChange={(e) => setUseFileGradeClass(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                />
                <span>استخراج بيانات الصف والفصل تلقائياً من أعمدة الملف إذا كانت مدونة بكل صف</span>
              </label>
            </div>
          </div>

          {/* File Upload Drop Zone */}
          {parsedRows.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv, .tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-white border border-sky-200 flex items-center justify-center text-sky-600 shadow-md group-hover:scale-110 group-hover:shadow-sky-200 transition-all">
                {isLoading ? (
                  <RefreshCw className="w-8 h-8 animate-spin text-sky-600" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">اضغط هنا لاختيار ملف Excel (XLSX, XLS) أو CSV</h3>
                <p className="text-slate-500 text-xs mt-1">يتعرف النظام الذكي على الأعمدة تلقائياً حتى وإن اختلفت المسميات والتنسيقات</p>
              </div>
              <span className="mt-2 px-5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs font-black rounded-xl shadow-md group-hover:shadow-sky-300 transition-all">
                اختر ملف الكشف من جهازك
              </span>
            </div>
          ) : (
            /* Parsed File Preview Section */
            <div className="space-y-4">
              
              {/* File Info Bar & Sheet Selector */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                      <span>الملف: {fileName}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        جاهز للمراجعة
                      </span>
                    </h4>
                    <p className="text-slate-500 text-[11px] font-medium">
                      إجمالي الطلاب المكتشفين: <strong className="text-slate-800 font-bold">{parsedRows.length}</strong> | المحدد للاستيراد: <strong className="text-sky-700 font-bold">{selectedCount}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                  {/* Sheet Selector if multiple sheets exist */}
                  {sheetNames.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                      <Layers className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-[11px] font-bold text-slate-700">ورقة العمل:</span>
                      <select
                        value={selectedSheet}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        className="bg-white border border-slate-300 text-slate-800 rounded-lg text-xs font-bold px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                      >
                        {sheetNames.map((sheet) => (
                          <option key={sheet} value={sheet}>{sheet}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Toggle Column Mapping Button */}
                  <button
                    type="button"
                    onClick={() => setShowMappingPanel(!showMappingPanel)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      showMappingPanel
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{showMappingPanel ? 'إخفاء تعيين الأعمدة' : 'تخصيص تعيين الأعمدة ⚙️'}</span>
                  </button>

                  {/* Change File Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setParsedRows([]);
                      setFileName('');
                      setWorkbook(null);
                      setSheetNames([]);
                      setAvailableColumns([]);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-rose-600 hover:text-rose-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تغيير الملف</span>
                  </button>
                </div>
              </div>

              {/* Header Auto-Detection Warning / Alert if needed */}
              {mappingWarning && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3.5 text-xs flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium">{mappingWarning}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMappingPanel(true)}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-[11px] shrink-0 cursor-pointer"
                  >
                    تعديل الأعمدة الآن
                  </button>
                </div>
              )}

              {/* Interactive Column Mapping Panel */}
              {showMappingPanel && (
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-indigo-800/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-indigo-700/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                      <h4 className="font-black text-xs sm:text-sm text-white">معالج ربط الأعمدة التفاعلي (Header Mapping)</h4>
                    </div>
                    <span className="text-[10px] text-indigo-200 font-medium">اختر اسم العمود المناسب من ملفك لكل بيان</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    {/* Name Mapping */}
                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">
                        اسم الطالب <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={columnMapping.name}
                        onChange={(e) => handleMappingChange('name', e.target.value)}
                        className="w-full bg-slate-800 text-white border border-indigo-600 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                      >
                        <option value="">-- اختر عمود اسم الطالب --</option>
                        {availableColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    {/* Student Number Mapping */}
                    <div>
                      <label className="block text-[11px] font-bold text-indigo-200 mb-1">كود / رقم الطالب</label>
                      <select
                        value={columnMapping.studentNumber}
                        onChange={(e) => handleMappingChange('studentNumber', e.target.value)}
                        className="w-full bg-slate-800 text-white border border-indigo-600 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                      >
                        <option value="">-- اختياري (توليد تلقائي) --</option>
                        {availableColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    {/* Parent Phone Mapping */}
                    <div>
                      <label className="block text-[11px] font-bold text-indigo-200 mb-1">هاتف ولي الأمر</label>
                      <select
                        value={columnMapping.parentPhone}
                        onChange={(e) => handleMappingChange('parentPhone', e.target.value)}
                        className="w-full bg-slate-800 text-white border border-indigo-600 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                      >
                        <option value="">-- اختياري --</option>
                        {availableColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    {/* Religion Mapping */}
                    <div>
                      <label className="block text-[11px] font-bold text-indigo-200 mb-1">الديانة</label>
                      <select
                        value={columnMapping.religion}
                        onChange={(e) => handleMappingChange('religion', e.target.value)}
                        className="w-full bg-slate-800 text-white border border-indigo-600 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                      >
                        <option value="">-- اختياري (افتراضي: مسلم) --</option>
                        {availableColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Duplicate Warning if any */}
              {parsedRows.some(r => r.isDuplicate) && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    تنبيه: يوجد أسماء بالملف متطابقة مع طلاب مقيدين حالياً بالنظام (محددة بعلامة برتقالية). يمكنك إلغاء تحديدها إذا كنت لا ترغب في تكرارها.
                  </span>
                </div>
              )}

              {/* Live Preview Table Header & Search */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSelectAll(true)}
                      className="text-xs font-bold text-sky-700 hover:text-sky-800 underline underline-offset-2 cursor-pointer"
                    >
                      تحديد الكل ({parsedRows.length})
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => toggleSelectAll(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700 underline underline-offset-2 cursor-pointer"
                    >
                      إلغاء تحديد الكل
                    </button>
                  </div>

                  {/* Preview Search */}
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      value={previewSearch}
                      onChange={(e) => setPreviewSearch(e.target.value)}
                      placeholder="بحث في القائمة المستوردة..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                  </div>
                </div>

                {/* Live Preview Table */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-black sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 text-center w-10">
                          <input
                            type="checkbox"
                            checked={parsedRows.length > 0 && parsedRows.every(r => r.isSelected)}
                            onChange={(e) => toggleSelectAll(e.target.checked)}
                            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                          />
                        </th>
                        <th className="p-2.5">م</th>
                        <th className="p-2.5">اسم الطالب</th>
                        <th className="p-2.5">رقم الطالب / الكود</th>
                        <th className="p-2.5">هاتف ولي الأمر</th>
                        <th className="p-2.5">الديانة</th>
                        <th className="p-2.5">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPreviewRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-400 font-bold">
                            لا توجد نتائج مطابقة للبحث
                          </td>
                        </tr>
                      ) : (
                        filteredPreviewRows.map((row, idx) => (
                          <tr 
                            key={row.id}
                            className={`hover:bg-sky-50/50 transition-colors ${
                              row.isDuplicate ? 'bg-amber-50/40' : row.hasError ? 'bg-rose-50/50' : ''
                            }`}
                          >
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={row.isSelected}
                                onChange={() => toggleSelectRow(row.id)}
                                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                              />
                            </td>
                            <td className="p-2.5 font-bold text-slate-400 text-[11px]">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-800">
                              {row.name}
                              {row.isDuplicate && (
                                <span className="mr-2 text-[10px] bg-amber-200 text-amber-900 font-black px-1.5 py-0.5 rounded border border-amber-300">
                                  مُسجل مسبقاً
                                </span>
                              )}
                              {row.hasError && (
                                <span className="mr-2 text-[10px] bg-rose-200 text-rose-900 font-black px-1.5 py-0.5 rounded border border-rose-300">
                                  {row.errorMessage}
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-slate-600 font-mono font-bold">{row.studentNumber || '-'}</td>
                            <td className="p-2.5 text-slate-600 font-mono">{row.parentPhone || '-'}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.religion === 'مسلم' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-purple-50 text-purple-800 border-purple-200'}`}>
                                {row.religion || 'مسلم'}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.status === 'مستجد' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                                {row.status || 'مستجد'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Quick Instructions / Help Box */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 text-xs space-y-2">
            <h4 className="font-black text-sky-900 flex items-center gap-1.5 text-xs">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>مميزات استيراد الكشوفات الذكي (XLSX, XLS, CSV):</span>
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1 font-medium text-[11px] pr-1">
              <li>يدعم قراءة جميع صيغ ملفات أوفيس اكسل الحديثة (.xlsx) والقديمة (.xls) وملفات CSV.</li>
              <li>يتجاوز تلقائياً الصفوف العلوية المخصصة لعناوين المدارس أو العبارات الترحيبية للوصول إلى جدول البيانات.</li>
              <li>إذا كانت أسماء الأعمدة مختلفة في ملفك، استخدم زر <strong className="text-indigo-800">"تخصيص تعيين الأعمدة ⚙️"</strong> لتحديد أي عمود هو الاسم أو الكود مباشرة.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-bold text-slate-600 text-center sm:text-right">
            {parsedRows.length > 0 ? (
              <span>
                سيتم استيراد <strong className="text-sky-700 font-extrabold">{selectedCount}</strong> طالب إلى <strong className="text-slate-800">الصف {targetGrade} - فصل {targetClassNum}</strong>
              </span>
            ) : (
              <span>يرجى اختيار ملف كشف الطلاب للبدء</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleConfirmImport}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد استيراد ({selectedCount}) طالب</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

