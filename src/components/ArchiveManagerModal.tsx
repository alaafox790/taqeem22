import React, { useState } from 'react';
import {
  Archive,
  X,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  Printer,
  Trash2,
  FolderArchive,
  Info,
  ChevronRight,
  ShieldAlert,
  FileText,
  Users,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { AssessmentRecord, TermId, ArchivedTermItem, Student } from '../types';
import { GRADES, CLASSES_COUNT } from '../lib/constants';

interface ArchiveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  academicYear: string;
  selectedTerm: TermId;
  records: AssessmentRecord[];
  archivedTermsList: ArchivedTermItem[];
  onArchiveTerm: (academicYear: string, termId: TermId, grade?: string, classNum?: number) => void;
  onUnarchiveTerm: (archivedItemId: string, academicYear: string, termId: TermId, grade?: string, classNum?: number) => void;
  onDeleteArchivedRecord?: (recordId: string) => void;
  showToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ArchiveManagerModal: React.FC<ArchiveManagerModalProps> = ({
  isOpen,
  onClose,
  academicYear,
  selectedTerm,
  records,
  archivedTermsList,
  onArchiveTerm,
  onUnarchiveTerm,
  onDeleteArchivedRecord,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'archive_now' | 'inspect'>('vault');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');

  // New archive form state
  const [archiveTargetType, setArchiveTargetType] = useState<'term' | 'class'>('term');
  const [targetGrade, setTargetGrade] = useState<string>('الأول');
  const [targetClassNum, setTargetClassNum] = useState<number>(1);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);

  if (!isOpen) return null;

  // Active records for current term/year
  const currentActiveRecords = records.filter(
    (r) => r.academic_year === academicYear && r.term_id === selectedTerm && !r.is_archived
  );

  // All archived records
  const archivedRecords = records.filter((r) => r.is_archived);

  // Filtered archived records for inspection
  const filteredArchivedRecords = archivedRecords.filter((r) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      r.grade.includes(searchQuery) ||
      r.class_num.toString().includes(searchQuery) ||
      r.assess_date.includes(searchQuery) ||
      (r.notes && r.notes.includes(searchQuery));

    const matchesGrade = selectedGradeFilter === 'all' || r.grade === selectedGradeFilter;
    const matchesYear = selectedYearFilter === 'all' || r.academic_year === selectedYearFilter;

    return matchesSearch && matchesGrade && matchesYear;
  });

  const handleExecuteArchive = () => {
    if (archiveTargetType === 'term') {
      onArchiveTerm(academicYear, selectedTerm);
      if (showToast) {
        showToast(
          'success',
          'تمت الأرشفة بنجاح 📁',
          `تم أرشفة جميع تقييمات ${selectedTerm === 'term1' ? 'الفصل الدراسي الأول' : 'الفصل الدراسي الثاني'} للعام ${academicYear}.`
        );
      }
    } else {
      onArchiveTerm(academicYear, selectedTerm, targetGrade, targetClassNum);
      if (showToast) {
        showToast(
          'success',
          'تمت أرشفة الفصل بنجاح 📁',
          `تم أرشفة تقييمات الصف ${targetGrade} / فصل ${targetClassNum} بنجاح.`
        );
      }
    }
    setArchiveConfirmOpen(false);
    setActiveTab('vault');
  };

  const handlePrintArchivedSummary = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = filteredArchivedRecords
      .map(
        (r, index) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${r.academic_year}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${r.term_id === 'term1' ? 'الترم الأول' : 'الترم الثاني'}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">الصف ${r.grade} / فصل ${r.class_num}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">تقييم رقم (${r.assess_num})</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; direction: ltr;">${r.assess_date}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">${r.notes || 'لا توجد ملاحظات'}</td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>تقرير الأرشيف التاريخي للتقييمات</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; direction: rtl; }
          h1 { text-align: center; color: #0f172a; margin-bottom: 5px; }
          p.subtitle { text-align: center; color: #64748b; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th { background-color: #f1f5f9; color: #334155; padding: 10px; border: 1px solid #cbd5e1; }
        </style>
      </head>
      <body>
        <h1>تقرير البيانات والتقييمات المؤرشفة</h1>
        <p class="subtitle">تم التصدير بتاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>العام الدراسي</th>
              <th>الترم</th>
              <th>الصف والفصل</th>
              <th>رقم التقييم</th>
              <th>التاريخ</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="7" style="text-align:center; padding: 20px;">لا توجد سجلات مؤرشفة</td></tr>'}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm dir-rtl animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between gap-4 shrink-0 relative overflow-hidden">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 shrink-0">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>مركز أرشفة الفصول والتقييمات</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  سجل تاريخي
                </span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm font-medium mt-0.5">
                حفظ وإخفاء تقييمات الفصول المنتهية لتقليل زحام الواجهة مع سهولة استرجاعها واستعراضها بأي وقت.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 p-2 flex items-center justify-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Archive className="w-4 h-4 text-amber-600" />
            <span>السجلات المؤرشفة ({archivedTermsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('archive_now')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'archive_now'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>أرشفة الفصل / الترم الحالي</span>
          </button>

          <button
            onClick={() => setActiveTab('inspect')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'inspect'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-600" />
            <span>استعراض جميع التقييمات المؤرشفة ({archivedRecords.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">

          {/* TAB 1: ARCHIVED VAULT LIST */}
          {activeTab === 'vault' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/80 border border-amber-200 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-950 text-sm">كيف تعمل الأرشفة؟</h4>
                    <p className="text-amber-800 text-xs font-medium leading-relaxed mt-0.5">
                      تساعدك الأرشفة على نقل بيانات الفصول أو الأترام المنتهية إلى الأرشيف التاريخي حتى لا تشغل حيزاً في شبكة التقييمات اليومية، مع إمكانية استعادتها بكامل بياناتها بنقرة زر.
                    </p>
                  </div>
                </div>
              </div>

              {archivedTermsList.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <FolderArchive className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">لا توجد عناصر مؤرشفة حالياً</h3>
                  <p className="text-slate-500 text-xs max-w-md mx-auto">
                    يمكنك أرشفة الفصل الدراسي الأول أو الثاني، أو أرشفة فصل دراسي معين بعد انتهاء تقييماته.
                  </p>
                  <button
                    onClick={() => setActiveTab('archive_now')}
                    className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>أرشفة الفصل الدراسي الحالي الآن</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {archivedTermsList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all space-y-3 relative group"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                            <FolderArchive className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">{item.title}</h4>
                            <span className="text-[11px] font-bold text-slate-500 block mt-0.5 dir-ltr text-right">
                              تاريخ الأرشفة: {item.archivedAt}
                            </span>
                          </div>
                        </div>

                        <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-amber-200">
                          مؤرشف 📁
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-500 text-[10px] font-bold block">العام الدراسي:</span>
                          <span className="font-extrabold text-slate-800 dir-ltr block text-right">{item.academicYear}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-500 text-[10px] font-bold block">عدد التقييمات:</span>
                          <span className="font-extrabold text-amber-700 block">{item.recordsCount} تقييمات</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            onUnarchiveTerm(item.id, item.academicYear, item.termId, item.grade, item.classNum);
                            if (showToast) {
                              showToast('success', 'تمت استعادة البيانات', 'تم إلغاء أرشفة هذه التقييمات وإعادتها للواجهة الرئيسية بنجاح.');
                            }
                          }}
                          className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                          <span>إلغاء الأرشفة واستعادة</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ARCHIVE NOW FORM */}
          {activeTab === 'archive_now' && (
            <div className="space-y-5 animate-in fade-in duration-200 max-w-2xl mx-auto">
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <span>تحديد نطاق الأرشفة:</span>
                </h3>

                {/* Scope selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setArchiveTargetType('term')}
                    className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                      archiveTargetType === 'term'
                        ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${archiveTargetType === 'term' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block">أرشفة الفصل الدراسي كاملاً</span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        ({selectedTerm === 'term1' ? 'الترم الأول' : 'الترم الثاني'} - {academicYear})
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setArchiveTargetType('class')}
                    className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                      archiveTargetType === 'class'
                        ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${archiveTargetType === 'class' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs block">أرشفة فصل دراسي معين</span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        (اختيار الصف والفصل فقط)
                      </span>
                    </div>
                  </button>
                </div>

                {/* Class selector if target is class */}
                {archiveTargetType === 'class' && (
                  <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">اختر الصف الدراسي:</label>
                      <select
                        value={targetGrade}
                        onChange={(e) => setTargetGrade(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800"
                      >
                        {GRADES.map((g) => (
                          <option key={g} value={g}>
                            الصف {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">اختر رقم الفصل:</label>
                      <select
                        value={targetClassNum}
                        onChange={(e) => setTargetClassNum(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800"
                      >
                        {CLASSES_COUNT.map((num) => (
                          <option key={num} value={num}>
                            فصل {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Stats Preview */}
                <div className="bg-amber-500/10 border border-amber-300/80 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-950 font-bold">
                  <span>التقييمات النشطة التي سيتم نقلها للأرشيف:</span>
                  <span className="bg-amber-600 text-white px-3 py-1 rounded-lg text-sm font-black">
                    {archiveTargetType === 'term'
                      ? currentActiveRecords.length
                      : currentActiveRecords.filter(
                          (r) => r.grade === targetGrade && r.class_num === targetClassNum
                        ).length}{' '}
                    سجل
                  </span>
                </div>

                {/* Action Trigger */}
                <button
                  type="button"
                  onClick={() => setArchiveConfirmOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs rounded-xl shadow-lg shadow-amber-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <Archive className="w-4 h-4" />
                  <span>
                    تأكيد وتنفيذ أرشفة {archiveTargetType === 'term' ? 'الفصل الدراسي' : `الصف ${targetGrade} فصل ${targetClassNum}`} الآن
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: INSPECT ARCHIVED RECORDS */}
          {activeTab === 'inspect' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث في التقييمات المؤرشفة (رقم، تاريخ، ملاحظات...)"
                    className="w-full pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedGradeFilter}
                    onChange={(e) => setSelectedGradeFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="all">جميع الصفوف</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        الصف {g}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handlePrintArchivedSummary}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>طباعة التقرير</span>
                  </button>
                </div>
              </div>

              {/* Records list table */}
              {filteredArchivedRecords.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs font-bold">
                  لا توجد تقييمات مؤرشفة تطابق شروط البحث.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                        <tr>
                          <th className="p-3 text-center">#</th>
                          <th className="p-3">العام الدراسي</th>
                          <th className="p-3">الترم</th>
                          <th className="p-3">الصف والفصل</th>
                          <th className="p-3 text-center">رقم التقييم</th>
                          <th className="p-3 text-center">تاريخ التقييم</th>
                          <th className="p-3">ملاحظات والتفاصيل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {filteredArchivedRecords.map((r, idx) => (
                          <tr key={r.id} className="hover:bg-amber-50/40 transition-colors">
                            <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-3 font-bold text-slate-700 dir-ltr text-right">{r.academic_year}</td>
                            <td className="p-3">
                              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold text-[11px]">
                                {r.term_id === 'term1' ? 'الترم الأول' : 'الترم الثاني'}
                              </span>
                            </td>
                            <td className="p-3 font-black text-slate-900">
                              الصف {r.grade} / فصل {r.class_num}
                            </td>
                            <td className="p-3 text-center font-bold text-amber-700">
                              تقييم ({r.assess_num})
                            </td>
                            <td className="p-3 text-center dir-ltr font-mono font-bold text-slate-700">
                              {r.assess_date}
                            </td>
                            <td className="p-3 text-slate-600 max-w-xs truncate">
                              {r.notes || 'لا توجد ملاحظات'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
            <Archive className="w-4 h-4 text-amber-600" />
            <span>إجمالي التقييمات المؤرشفة: {archivedRecords.length} سجل</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>

      {/* Confirmation Dialog Modal */}
      {archiveConfirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs dir-rtl animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-amber-300">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <FolderArchive className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-900 text-lg">تأكيد عملية الأرشفة</h3>
            </div>

            <p className="text-slate-700 text-xs font-medium leading-relaxed">
              هل أنت أصل متأكد من أرشفة{' '}
              <strong className="text-amber-800">
                {archiveTargetType === 'term'
                  ? `تقييمات ${selectedTerm === 'term1' ? 'الفصل الدراسي الأول' : 'الفصل الدراسي الثاني'} (${academicYear})`
                  : `تقييمات الصف ${targetGrade} / فصل ${targetClassNum}`}
              </strong>
              ؟ سيتم إخفاء هذه السجلات من شبكة التقييمات الرئيسية وتخزينها بأمان في حافطة الأرشيف التاريخي.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setArchiveConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleExecuteArchive}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              >
                تأكيد الأرشفة الآن
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
