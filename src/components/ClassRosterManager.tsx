import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Trash2,
  Check,
  X,
  Minus,
  Lock,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';
import { Student, TermId, StudentAttendance, AttendanceStatus, AssessmentRecord } from '../types';
import { GRADES, CLASSES_COUNT } from '../lib/constants';

interface ClassRosterManagerProps {
  selectedTerm: TermId;
  records: AssessmentRecord[];
  selectedMonthId: string;
  teacherId: string;
  isFirebaseConnected?: boolean;
}

const ROSTER_STORAGE_KEY = 'school_assessments_students_roster_v1';
const ATTENDANCE_STORAGE_KEY = 'school_assessments_attendance_v1';

import { saveFirebaseAttendance, saveFirebaseStudent, deleteFirebaseStudent } from '../lib/firebase';
import { Cloud, CloudOff, Loader2, Download, Printer, Image } from 'lucide-react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';


export const ClassRosterManager: React.FC<ClassRosterManagerProps> = ({ selectedTerm, records, selectedMonthId, teacherId, isFirebaseConnected }) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Search and Filter
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');

  // Selected Grade & Class
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    return localStorage.getItem('school_pinned_grade') || '';
  });
  const [selectedClassNum, setSelectedClassNum] = useState<number | ''>(() => {
    const pinned = localStorage.getItem('school_pinned_class');
    return pinned ? Number(pinned) : '';
  });
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    return localStorage.getItem('school_is_pinned') === 'true';
  });

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsPinned(checked);
    if (checked) {
      localStorage.setItem('school_is_pinned', 'true');
      localStorage.setItem('school_pinned_grade', selectedGrade);
      localStorage.setItem('school_pinned_class', selectedClassNum.toString());
    } else {
      localStorage.setItem('school_is_pinned', 'false');
      localStorage.removeItem('school_pinned_grade');
      localStorage.removeItem('school_pinned_class');
    }
  };

  useEffect(() => {
    if (isPinned) {
      localStorage.setItem('school_pinned_grade', selectedGrade);
      localStorage.setItem('school_pinned_class', selectedClassNum.toString());
    }
  }, [selectedGrade, selectedClassNum, isPinned]);

  // Students list state
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(ROSTER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Attendance state
  const [attendance, setAttendance] = useState<StudentAttendance[]>(() => {
    try {
      const saved = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [religion, setReligion] = useState<'مسلم' | 'مسيحي'>('مسلم');
  const [status, setStatus] = useState<'مستجد' | 'باق'>('مستجد');

  // Delete Modal State
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);

  // Save students roster to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  // Save attendance to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendance));
    } catch (e) {
      console.error(e);
    }
  }, [attendance]);

  // Filter students for current Grade & Class
  const classStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.grade === selectedGrade &&
        s.class_num === selectedClassNum
    ).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [students, selectedGrade, selectedClassNum]);

  const displayedStudents = useMemo(() => {
    let filtered = classStudents.map((student, originalIndex) => ({
      ...student,
      serialNumber: originalIndex + 1
    }));

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const isNum = !isNaN(Number(query));
      if (isNum) {
        const targetNumber = Number(query);
        filtered = filtered.filter(s => s.serialNumber === targetNumber);
      } else {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(query));
      }
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => {
        return attendance.some(a => 
          a.student_id === s.id && 
          a.month_id === selectedTerm && 
          a.status === filterStatus
        );
      });
    }

    return filtered;
  }, [classStudents, searchQuery, filterStatus, attendance, selectedTerm]);



  const assessmentsCount = 15;

  const handleExportExcel = () => {
    if (displayedStudents.length === 0) return;
    
    // Create header row
    const headers = ['م', 'اسم الطالب', ...Array.from({ length: assessmentsCount }, (_, i) => `تقييم ${i + 1}`)];
    
    // Create data rows
    const rows = displayedStudents.map((s, idx) => {
      const rowData: any[] = [s.serialNumber, s.name];
      for (let i = 1; i <= assessmentsCount; i++) {
        const status = getAttendanceStatus(s.id, i);
        let statusText = '-';
        if (status === 'present') statusText = 'حاضر';
        else if (status === 'absent') statusText = 'غائب';
        else if (status === 'excused') statusText = 'بعذر';
        rowData.push(statusText);
      }
      return rowData;
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    // Set RTL
    if(!worksheet['!views']) worksheet['!views'] = [];
    worksheet['!views'].push({ rightToLeft: true });
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل الحضور');
    
    XLSX.writeFile(workbook, `سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.xlsx`);
  };

  const handleExportImage = async () => {
    if (displayedStudents.length === 0) return;
    
    const tableEl = document.getElementById('roster-table-container');
    if (!tableEl) {
      alert("تعذر العثور على الجدول");
      return;
    }

    try {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.style.width = 'max-content';
      wrapper.style.backgroundColor = '#ffffff';
      wrapper.style.padding = '20px';
      wrapper.style.direction = 'rtl';
      wrapper.dir = 'rtl';
      wrapper.style.fontFamily = 'Cairo, Tajawal, system-ui, -apple-system, sans-serif';
      
      const title = document.createElement('h2');
      title.innerText = `سجل الطلاب - الصف ${selectedGrade} - فصل ${selectedClassNum}`;
      title.style.textAlign = 'center';
      title.style.marginBottom = '20px';
      title.style.color = '#1e293b';
      title.style.fontSize = '18px';
      title.style.fontWeight = 'bold';
      wrapper.appendChild(title);

      const clone = tableEl.cloneNode(true) as HTMLElement;
      
      // Fix overflow on clone to prevent clipping
      clone.style.overflow = 'visible';
      clone.style.maxHeight = 'none';
      clone.style.height = 'auto';
      clone.classList.remove('overflow-y-auto', 'overflow-x-auto', 'max-h-[70vh]');
      
      const stickies = clone.querySelectorAll('.sticky');
      stickies.forEach(el => {
        (el as HTMLElement).style.position = 'static';
        (el as HTMLElement).style.boxShadow = 'none';
      });

      const cells = clone.querySelectorAll('td');
      cells.forEach(td => {
        const btn = td.querySelector('button') || td.querySelector('.w-6.h-6');
        if (btn) {
          let text = '-';
          const btnClass = btn.className;
          if (btnClass.includes('emerald-100')) text = 'حاضر';
          else if (btnClass.includes('rose-100') && !btnClass.includes('rose-50')) text = 'غائب';
          else if (btnClass.includes('amber-100')) text = 'عذر';
          
          td.innerHTML = `<div style="text-align:center; padding:4px; font-weight:bold; color:#334155; font-family: Cairo, Tajawal, system-ui, sans-serif;">${text}</div>`;
        }
      });

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);
      
      // wait for next tick to ensure styles are applied
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await html2canvas(wrapper, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: wrapper.scrollWidth + 50,
        windowHeight: wrapper.scrollHeight + 50
      });
      
      document.body.removeChild(wrapper);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء تصدير الصورة");
    }
  };


  // Handle Save (Add Next or Finish)
  const handleSaveStudent = async (addNext: boolean) => {
    if (!newStudentName.trim() || !selectedGrade || !selectedClassNum) return;

    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: newStudentName.trim(),
      grade: selectedGrade,
      class_num: Number(selectedClassNum),
      religion,
      status,
    };

    setStudents((prev) => [...prev, newStudent]);
    setNewStudentName('');

    if (isFirebaseConnected) {
      setSyncStatus('syncing');
      try {
        const success = await saveFirebaseStudent(newStudent, teacherId);
        setSyncStatus(success ? 'idle' : 'error');
      } catch {
        setSyncStatus('error');
      }
    }

    if (!addNext) {
      setIsModalOpen(false);
    }
  };

  const handleDeleteStudent = (id: string, name: string) => {
    setStudentToDelete({ id, name });
  };

  const confirmDeleteStudent = () => {
    if (studentToDelete) {
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      setAttendance((prev) => prev.filter((a) => a.student_id !== studentToDelete.id));
      setStudentToDelete(null);
    }
  };

  const toggleAttendance = async (studentId: string, studentName: string, assessNum: number) => {
    let finalRecord: any = null;
    
    setAttendance((prev) => {
      const existing = prev.find((a) => a.student_id === studentId && a.assess_num === assessNum && a.month_id === selectedTerm);
      let newStatus: AttendanceStatus = 'present';
      let idToUse = crypto.randomUUID();
      
      if (existing) {
        if (existing.status === 'present') newStatus = 'absent';
        else if (existing.status === 'absent') newStatus = 'excused';
        else newStatus = 'present';
        idToUse = existing.id; // Preserve ID if updating
      }

      const otherAttendance = prev.filter(
        (a) => !(a.student_id === studentId && a.assess_num === assessNum && a.month_id === selectedTerm)
      );

      finalRecord = {
        id: idToUse,
        student_id: studentId,
        student_name: studentName,
        grade: selectedGrade,
        class_num: Number(selectedClassNum),
        month_id: selectedTerm,
        assess_num: assessNum,
        status: newStatus,
        updated_at: new Date().toISOString(),
        teacher_id: teacherId, // Add teacherId for Firebase rules
      };

      return [...otherAttendance, finalRecord];
    });

    // Auto-save to Firebase
    if (finalRecord && isFirebaseConnected) {
      setSyncStatus('syncing');
      try {
        const success = await saveFirebaseAttendance(finalRecord);
        setSyncStatus(success ? 'idle' : 'error');
      } catch (e) {
        console.error('Failed to sync attendance', e);
        setSyncStatus('error');
      }
    }
  };

  const getAttendanceStatus = (studentId: string, assessNum: number): AttendanceStatus | null => {
    const record = attendance.find(
      (a) => a.student_id === studentId && a.assess_num === assessNum && a.month_id === selectedTerm
    );
    return record ? record.status : null;
  };



  // Helper to get first two words of a name
  const getShortName = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 2) return name;
    return `${parts[0]} ${parts[1]}`;
  };

  const hasConsecutiveAbsences = (studentId: string) => {
    const studentRecords = attendance.filter(a => a.student_id === studentId && a.month_id === selectedTerm);
    studentRecords.sort((a, b) => a.assess_num - b.assess_num);
    
    let currentConsecutive = 0;
    let maxConsecutive = 0;
    
    for (const record of studentRecords) {
      if (record.status === 'absent') {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    }
    
    return maxConsecutive > 3;
  };


  const renderAttendanceButton = (studentId: string, studentName: string, assessNum: number) => {

    const status = getAttendanceStatus(studentId, assessNum);
    
    let btnClass = "w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 shadow-sm mx-auto cursor-pointer border group-hover/btn:scale-110 group-hover/btn:-rotate-6 group-hover/btn:shadow-md active:scale-95";
    let icon = <Minus className="w-3 h-3 text-slate-400" />;

    if (status === 'present') {
      btnClass += " bg-emerald-100 border-emerald-300 group-hover/btn:bg-emerald-500 group-hover/btn:border-emerald-600";
      icon = <Check className="w-3.5 h-3.5 text-emerald-600 group-hover/btn:text-white transition-colors" strokeWidth={3} />;
    } else if (status === 'absent') {
      btnClass += " bg-rose-100 border-rose-300 group-hover/btn:bg-rose-500 group-hover/btn:border-rose-600";
      icon = <X className="w-3.5 h-3.5 text-rose-600 group-hover/btn:text-white transition-colors" strokeWidth={3} />;
    } else if (status === 'excused') {
      btnClass += " bg-amber-100 border-amber-300 group-hover/btn:bg-amber-500 group-hover/btn:border-amber-600";
      icon = <Minus className="w-3.5 h-3.5 text-amber-600 group-hover/btn:text-white transition-colors" strokeWidth={3} />;
    } else {
      btnClass += " bg-slate-50 border-slate-200 group-hover/btn:bg-emerald-50 group-hover/btn:border-emerald-200";
      icon = <Check className="w-3.5 h-3.5 text-transparent group-hover/btn:text-emerald-200 transition-colors" strokeWidth={3} />; 
    }

    return (
      <button
        onClick={() => toggleAttendance(studentId, studentName, assessNum)}
        className={`${btnClass} group/btn`}
        title={status === 'present' ? 'حاضر' : status === 'absent' ? 'غائب' : status === 'excused' ? 'بعذر' : 'غير مسجل'}
      >
        {icon}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 w-full max-w-full overflow-hidden animate-in fade-in">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Sync Status Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100">
            {syncStatus === 'syncing' ? (
              <>
                <Loader2 className="w-3 h-3 text-cyan-600 animate-spin" />
                <span className="text-[10px] text-slate-500 font-medium">حفظ...</span>
              </>
            ) : syncStatus === 'error' ? (
              <>
                <CloudOff className="w-3 h-3 text-rose-500" />
                <span className="text-[10px] text-rose-600 font-medium">خطأ</span>
              </>
            ) : isFirebaseConnected ? (
              <>
                <Cloud className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] text-emerald-600 font-medium">متصل</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] text-slate-500 font-medium">محلي</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Top Bar: Controls */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center w-full">
          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={handleExportImage}
              className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              title="تصدير كصورة">
              <Image className="w-3.5 h-3.5" /> صورة
            </button>
            <button 
              onClick={handleExportExcel}
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              title="تصدير إكسل">
              <Download className="w-3.5 h-3.5" /> إكسل
            </button>
            <button
              onClick={() => {
                if (!selectedGrade || !selectedClassNum) {
                  alert('يرجى اختيار الصف والفصل أولاً.');
                  return;
                }
                setIsModalOpen(true);
              }}
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              طالب جديد +
            </button>
          </div>

          <div className="flex-1 min-w-[150px] relative">
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرقم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-transparent block pr-7 p-1.5 transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 left-2 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="relative shrink-0 w-[100px]">
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-transparent block pr-7 p-1.5 appearance-none outline-none"
            >
              <option value="all">الكل</option>
              <option value="present">الحاضرين</option>
              <option value="absent">الغائبين</option>
              <option value="excused">المعذورين</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Grade Selector */}
          <div className="relative">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-2 pr-8 py-1.5 text-xs font-bold text-slate-800 focus:outline-none appearance-none text-right"
            >
              <option value="" disabled>الصف...</option>
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>الصف {grade}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
              <svg className="w-3 h-3 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Class Selector */}
          <div className="relative">
            <select
              value={selectedClassNum}
              onChange={(e) => setSelectedClassNum(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg pl-2 pr-8 py-1.5 text-xs font-bold text-slate-800 focus:outline-none appearance-none text-right"
            >
              <option value="" disabled>الفصل...</option>
              {Array.from({ length: CLASSES_COUNT }, (_, i) => i + 1).map((cNum) => (
                <option key={cNum} value={cNum}>فصل {cNum}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
              <svg className="w-3 h-3 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          
          {/* Pin Checkbox */}
          <div className="flex items-center gap-1.5 col-span-2 md:col-span-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
              <input 
                type="checkbox" 
                checked={isPinned}
                onChange={handlePinChange}
                className="w-3.5 h-3.5 rounded text-[#0284c7] focus:ring-[#0284c7] border-slate-300"
              />
              تثبيت الفصل
            </label>
            {classStudents.length > 0 && (
              <button
                onClick={() => {
                  if(window.confirm('هل أنت متأكد من حذف جميع طلاب هذا الفصل؟')) {
                    setStudents(prev => prev.filter(s => !(s.grade === selectedGrade && s.class_num === selectedClassNum)));
                    setAttendance(prev => prev.filter(a => !(a.grade === selectedGrade && a.class_num === selectedClassNum)));
                  }
                }}
                className="ml-auto bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> حذف الكل
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Container - Compact for minimal scrolling */}
      <div id="roster-table-container" className="mt-2 rounded-lg overflow-hidden border border-slate-200 shadow-sm overflow-x-auto w-full max-h-[70vh] overflow-y-auto">
        <table className="w-full text-right border-separate border-spacing-0 whitespace-nowrap">
          <thead>
            <tr className="bg-[#1e3a8a] text-white text-sm font-bold shadow-sm">
              <th className="p-3 min-w-[50px] max-w-[50px] w-[50px] text-center sticky right-0 bg-[#1e3a8a] z-20 border-b border-l border-slate-700 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">م</th>
              <th className="p-2 min-w-[90px] max-w-[90px] w-[90px] sticky right-[50px] bg-[#1e3a8a] z-20 border-b border-l border-slate-700 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">الاسم</th>
              
              {Array.from({ length: assessmentsCount }, (_, i) => i + 1).map(num => (
                <th key={num} className="p-3 text-center w-8 border-b border-l border-slate-700 whitespace-nowrap px-1"><span className="text-slate-300 text-[10px] block mb-0.5">س</span>{num}</th>
              ))}
              <th className="p-3 text-center w-14 border-b border-r border-slate-700">تحكم</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white text-sm font-bold text-slate-800">
            {displayedStudents.length > 0 ? (
              displayedStudents.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-3 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-20 border-b border-l border-slate-200 shadow-[-2px_0_4px_rgba(0,0,0,0.02)] min-w-[50px] max-w-[50px] w-[50px]">{student.serialNumber}</td>
                  <td className="p-2 text-xs sticky right-[50px] bg-white group-hover:bg-slate-50 z-20 border-b border-l border-slate-200 shadow-[-2px_0_4px_rgba(0,0,0,0.02)] min-w-[90px] max-w-[90px] w-[90px] truncate" title={student.name}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate">{getShortName(student.name)}</span>
                      {hasConsecutiveAbsences(student.id) && (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" title="تجاوز 3 غيابات متتالية" />
                      )}
                    </div>
                  </td>

                  {Array.from({ length: assessmentsCount }, (_, i) => i + 1).map(num => (
                    <td key={num} className="p-1.5 border-b border-l border-slate-200">
                      {renderAttendanceButton(student.id, student.name, num)}
                    </td>
                  ))}
                  <td className="p-3 text-center border-b border-r border-slate-200">
                    <button
                      onClick={() => handleDeleteStudent(student.id, student.name)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors inline-block"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={assessmentsCount + 4} className="p-8 text-center text-slate-400">
                  لا يوجد طلاب مسجلين في هذا الفصل
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200 shadow-xl">
            <h2 className="text-center text-xl font-black text-slate-900 mb-6">تسجيل طالب</h2>
            <div className="space-y-5">
              {/* Name Input */}
              <input
                type="text"
                placeholder="الاسم رباعي"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="w-full text-center bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent placeholder-slate-400 transition-all"
                autoFocus
              />

              {/* Toggles Row */}
              <div className="flex gap-3">
                {/* Religion Toggle */}
                <div className="flex flex-1 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setReligion('مسلم')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                      religion === 'مسلم'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    مسلم
                  </button>
                  <button
                    onClick={() => setReligion('مسيحي')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                      religion === 'مسيحي'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    مسيحي
                  </button>
                </div>

                {/* Status Toggle */}
                <div className="flex flex-1 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setStatus('مستجد')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                      status === 'مستجد'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    مستجد
                  </button>
                  <button
                    onClick={() => setStatus('باق')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                      status === 'باق'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    باق
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="space-y-2 pt-4">
                <button
                  onClick={() => handleSaveStudent(true)}
                  className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                >
                  حفظ وإضافة التالي
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition-colors"
                >
                  إنهاء التسجيل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200 shadow-xl">
            <h2 className="text-center text-xl font-black text-rose-600 mb-2">تأكيد الحذف</h2>
            <p className="text-center text-slate-600 font-bold mb-6">
              هل أنت متأكد من حذف الطالب {studentToDelete.name}؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteStudent}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};