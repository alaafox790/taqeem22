import React, { useState, useRef } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  FileText, 
  CheckCircle2, 
  Users, 
  Calendar, 
  Eye, 
  Sparkles,
  Award,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Student, StudentAttendance } from '../types';
import { MONTHS_DATA } from '../lib/constants';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrade: string;
  selectedClassNum: number | '';
  selectedTerm: string;
  selectedMonthId: string;
  students: Student[];
  attendanceRecords: StudentAttendance[];
  teacherName?: string;
  schoolName?: string;
  showToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  selectedGrade,
  selectedClassNum,
  selectedTerm,
  selectedMonthId,
  students,
  attendanceRecords,
  teacherName = 'معلم المادة',
  schoolName = 'مدرسة الأوائل الحديثة',
  showToast,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Export options
  const [reportType, setReportType] = useState<'comprehensive' | 'attendance' | 'assessments'>('comprehensive');
  const [paperOrientation, setPaperOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [includeStats, setIncludeStats] = useState<boolean>(true);
  const [includeSignatures, setIncludeSignatures] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  // Active Month Data
  const activeMonth = MONTHS_DATA.find(m => m.id === selectedMonthId) || MONTHS_DATA[0];
  const assessmentsToDisplay = activeMonth.assessments || [1, 2, 3, 4];

  // Helper to get attendance status
  const getAttendanceStatus = (studentId: string, assessNum: number) => {
    const rec = attendanceRecords.find(
      r => r.student_id === studentId && 
           r.month_id === selectedTerm && 
           r.assess_num === assessNum
    );
    return rec ? rec.status : undefined;
  };

  // Calculate Student Stats
  const studentStats = students.map((student, idx) => {
    let presentCount = 0;
    let absentCount = 0;
    let excusedCount = 0;

    assessmentsToDisplay.forEach(num => {
      const st = getAttendanceStatus(student.id, num);
      if (st === 'present') presentCount++;
      else if (st === 'absent') absentCount++;
      else if (st === 'excused') excusedCount++;
    });

    return {
      student,
      serial: idx + 1,
      presentCount,
      absentCount,
      excusedCount,
      attendanceRate: Math.round((presentCount / assessmentsToDisplay.length) * 100) || 0
    };
  });

  // Overall Class Stats
  const totalStudents = students.length;
  const totalPresentRecords = studentStats.reduce((acc, s) => acc + s.presentCount, 0);
  const totalPossibleRecords = totalStudents * assessmentsToDisplay.length;
  const classAttendanceRate = totalPossibleRecords > 0 
    ? Math.round((totalPresentRecords / totalPossibleRecords) * 100) 
    : 0;

  // Direct Browser Print
  const handleDirectPrint = () => {
    window.print();
  };

  // Export PDF using html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsGenerating(true);

    try {
      const element = printAreaRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: paperOrientation,
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `كشف_الطلاب_صف_${selectedGrade}_فصل_${selectedClassNum}_${activeMonth.name}.pdf`;
      pdf.save(fileName);

      if (showToast) {
        showToast('success', 'تم تصدير ملف PDF بنجاح 📄', 'يمكنك فتح الملف وطباعته في أي وقت.');
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      if (showToast) {
        showToast('error', 'خطأ في التصدير', 'حدث خطأ أثناء إنشاء ملف PDF.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen max-w-full overflow-y-auto bg-slate-950/75 backdrop-blur-md p-3 sm:p-5 dir-rtl flex items-center justify-center min-h-full animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] my-auto shrink-0 print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Modal Top Header (Hidden on print) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-4 shrink-0 print:hidden relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shadow-lg text-indigo-300 shrink-0">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>تصدير وطباعة كشف الصف (PDF)</span>
              </h2>
              <p className="text-indigo-200/80 text-xs font-medium">
                الصف {selectedGrade} - فصل {selectedClassNum} | {activeMonth.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar (Hidden on print) */}
        <div className="bg-slate-100/90 p-3 sm:p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Report Type */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 mb-0.5">نوع الكشف:</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="comprehensive">كشف شامل (حضور + تقييمات)</option>
                <option value="attendance">كشف الحضور والغياب فقط</option>
                <option value="assessments">كشف الدرجات والتقييمات فقط</option>
              </select>
            </div>

            {/* Paper Orientation */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 mb-0.5">اتجاه الورقة:</label>
              <select
                value={paperOrientation}
                onChange={(e) => setPaperOrientation(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="landscape">أفقي (Landscape)</option>
                <option value="portrait">رأسي (Portrait)</option>
              </select>
            </div>

            {/* Include Stats Checkbox */}
            <label className="flex items-center gap-1.5 cursor-pointer mt-4 select-none font-bold text-slate-700">
              <input
                type="checkbox"
                checked={includeStats}
                onChange={(e) => setIncludeStats(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
              <span>إحصائيات ملخصة</span>
            </label>

            {/* Include Signatures Checkbox */}
            <label className="flex items-center gap-1.5 cursor-pointer mt-4 select-none font-bold text-slate-700">
              <input
                type="checkbox"
                checked={includeSignatures}
                onChange={(e) => setIncludeSignatures(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
              <span>خانة الاعتماد والتوقيع</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDirectPrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة مباشرة</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'جاري التحضير...' : 'تحميل PDF'}</span>
            </button>
          </div>
        </div>

        {/* Printable PDF Preview Canvas Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-200/50 print:bg-white print:p-0">
          
          <div 
            ref={printAreaRef}
            id="pdf-printable-roster"
            className={`bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-200/80 mx-auto transition-all print:shadow-none print:border-none print:rounded-none print:p-4 text-slate-900 font-['Tajawal',sans-serif] ${
              paperOrientation === 'landscape' ? 'max-w-4xl' : 'max-w-2xl'
            }`}
          >
            {/* PDF School Official Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-6 flex items-center justify-between gap-4">
              <div className="text-right space-y-1">
                <h3 className="font-black text-slate-900 text-base sm:text-lg">{schoolName}</h3>
                <p className="text-slate-600 text-xs font-bold">العام الدراسي 2025/2026 م - الفصل الدراسي الأول</p>
                <p className="text-slate-500 text-[11px] font-medium">اسم المعلم: <strong className="text-slate-800">{teacherName}</strong></p>
              </div>

              <div className="text-center px-4 py-2 bg-slate-100 rounded-2xl border border-slate-300">
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  كشف رصد {reportType === 'attendance' ? 'الحضور والغياب' : reportType === 'assessments' ? 'التقييمات والدرجات' : 'شامل'}
                </h2>
                <div className="mt-1 flex items-center justify-center gap-2 text-xs font-bold text-indigo-900">
                  <span>الصف {selectedGrade}</span>
                  <span>•</span>
                  <span>فصل {selectedClassNum}</span>
                </div>
              </div>

              <div className="text-left space-y-1 text-xs font-medium text-slate-500">
                <p>الشهر: <strong className="text-slate-800 font-bold">{activeMonth.name}</strong></p>
                <p>تاريخ الطباعة: <strong className="text-slate-800 font-bold">{new Date().toLocaleDateString('ar-EG')}</strong></p>
                <p>عدد الطلاب: <strong className="text-slate-800 font-bold">{totalStudents} طالب</strong></p>
              </div>
            </div>

            {/* Summary Statistics Cards (Optional) */}
            {includeStats && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] font-extrabold text-slate-500 block">إجمالي المقيدين</span>
                  <span className="text-lg font-black text-slate-900">{totalStudents}</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <span className="text-[10px] font-extrabold text-emerald-700 block">إجمالي الحضور</span>
                  <span className="text-lg font-black text-emerald-900">{totalPresentRecords}</span>
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
                  <span className="text-[10px] font-extrabold text-indigo-700 block">نسبة الحضور العامة</span>
                  <span className="text-lg font-black text-indigo-900">{classAttendanceRate}%</span>
                </div>
              </div>
            )}

            {/* Printable Students Table */}
            <div className="border border-slate-800 rounded-lg overflow-hidden mb-6">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-black text-[11px]">
                    <th className="p-2 text-center border-l border-slate-700 w-8">م</th>
                    <th className="p-2 border-l border-slate-700 w-24">كود الطالب</th>
                    <th className="p-2 border-l border-slate-700">اسم الطالب</th>

                    {/* Attendance Columns */}
                    {(reportType === 'comprehensive' || reportType === 'attendance') && (
                      assessmentsToDisplay.map((num) => (
                        <th key={num} className="p-2 text-center border-l border-slate-700 w-12">
                          أسبوع {num}
                        </th>
                      ))
                    )}

                    {/* Assessment Scores Columns */}
                    {(reportType === 'comprehensive' || reportType === 'assessments') && (
                      <th className="p-2 text-center border-l border-slate-700 w-16">إجمالي الحضور</th>
                    )}

                    <th className="p-2 text-center w-24">ملاحظات المعلم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-bold text-slate-800">
                  {studentStats.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-slate-400">
                        لا يوجد طلاب مسجلين بهذا الفصل
                      </td>
                    </tr>
                  ) : (
                    studentStats.map(({ student, serial, presentCount, absentCount, excusedCount }) => (
                      <tr key={student.id} className="hover:bg-slate-50 border-b border-slate-200">
                        <td className="p-2 text-center font-bold text-slate-600 border-l border-slate-300">{serial}</td>
                        <td className="p-2 font-mono text-slate-600 border-l border-slate-300 text-[11px]">
                          {student.studentNumber || '-'}
                        </td>
                        <td className="p-2 font-extrabold text-slate-900 border-l border-slate-300">
                          {student.name}
                        </td>

                        {/* Attendance Columns */}
                        {(reportType === 'comprehensive' || reportType === 'attendance') && (
                          assessmentsToDisplay.map((num) => {
                            const status = getAttendanceStatus(student.id, num);
                            let label = '—';
                            let colorClass = 'text-slate-400';

                            if (status === 'present') {
                              label = 'حاضر';
                              colorClass = 'text-emerald-700 font-black';
                            } else if (status === 'absent') {
                              label = 'غائب';
                              colorClass = 'text-rose-700 font-black';
                            } else if (status === 'excused') {
                              label = 'بعذر';
                              colorClass = 'text-amber-700 font-black';
                            }

                            return (
                              <td key={num} className={`p-2 text-center border-l border-slate-300 ${colorClass}`}>
                                {label}
                              </td>
                            );
                          })
                        )}

                        {/* Summary Score */}
                        {(reportType === 'comprehensive' || reportType === 'assessments') && (
                          <td className="p-2 text-center border-l border-slate-300 font-black text-indigo-900">
                            {presentCount} / {assessmentsToDisplay.length}
                          </td>
                        )}

                        <td className="p-2 border-slate-300"></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Signatures Section */}
            {includeSignatures && (
              <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs font-bold text-slate-700">
                <div>
                  <p className="mb-8">مدرس المادة</p>
                  <p className="text-slate-400">التوقيع: ....................</p>
                </div>
                <div>
                  <p className="mb-8">معلم أول المادة</p>
                  <p className="text-slate-400">التوقيع: ....................</p>
                </div>
                <div>
                  <p className="mb-8">يعتمد / مدير المدرسة</p>
                  <p className="text-slate-400">التوقيع والخاتم: ....................</p>
                </div>
              </div>
            )}

            {/* Footer Watermark */}
            <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-medium">
              <span>تطبيق الأوائل لإدارة الفصول المدرسية ®</span>
              <span>صفحة 1 من 1</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
