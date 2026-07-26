import React, { useState, useRef, useMemo } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  FileText, 
  Sparkles, 
  Award, 
  Share2, 
  MessageCircle, 
  Check, 
  Copy, 
  Calendar, 
  Users, 
  BookOpen, 
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Student, StudentAttendance, AssessmentRecord, TeacherProfile } from '../types';
import { MONTHS_DATA, DEFAULT_ACADEMIC_YEAR } from '../lib/constants';

interface AnnualReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrade: string;
  selectedClassNum: number | '';
  records: AssessmentRecord[];
  students?: Student[];
  attendanceRecords?: StudentAttendance[];
  teacher?: TeacherProfile;
  initialStudentId?: string;
}

export const AnnualReportPdfModal: React.FC<AnnualReportPdfModalProps> = ({
  isOpen,
  onClose,
  selectedGrade,
  selectedClassNum,
  records = [],
  students: propStudents,
  attendanceRecords: propAttendance,
  teacher: propTeacher,
  initialStudentId
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>(initialStudentId || 'all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Active Teacher Profile
  const activeTeacher = useMemo<TeacherProfile>(() => {
    if (propTeacher) return propTeacher;
    try {
      const saved = localStorage.getItem('school_assessments_teacher_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { name: 'معلم المادة', subject: 'الرياضيات', school: 'مدرسة الأوائل الحديثة' };
  }, [propTeacher]);

  // Load Students and Attendance if not passed
  const allStudents = useMemo<Student[]>(() => {
    if (propStudents && propStudents.length > 0) return propStudents;
    try {
      return JSON.parse(localStorage.getItem('school_assessments_students_roster_v1') || '[]');
    } catch {
      return [];
    }
  }, [propStudents]);

  const allAttendance = useMemo<StudentAttendance[]>(() => {
    if (propAttendance && propAttendance.length > 0) return propAttendance;
    try {
      return JSON.parse(localStorage.getItem('school_assessments_attendance_v1') || '[]');
    } catch {
      return [];
    }
  }, [propAttendance]);

  // Filter students by Grade and Class Number
  const classStudents = useMemo(() => {
    if (!selectedGrade || !selectedClassNum) return [];
    return allStudents.filter(s => s.grade === selectedGrade && s.class_num === selectedClassNum)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allStudents, selectedGrade, selectedClassNum]);

  // Filter students based on selection (All or specific student)
  const displayStudents = useMemo(() => {
    if (selectedStudentFilter === 'all') return classStudents;
    return classStudents.filter(s => s.id === selectedStudentFilter);
  }, [classStudents, selectedStudentFilter]);

  // Compute Term 1, Term 2, and Annual Cumulative Stats per Student
  const annualCumulativeData = useMemo(() => {
    const term1MonthIds = MONTHS_DATA.filter(m => m.termId === 'term1').map(m => m.id);
    const term2MonthIds = MONTHS_DATA.filter(m => m.termId === 'term2').map(m => m.id);

    return displayStudents.map((student, idx) => {
      // Student attendance
      const studentAtt = allAttendance.filter(a => a.student_id === student.id);

      // Term 1 attendance
      const t1Att = studentAtt.filter(a => a.month_id === 'term1' || term1MonthIds.includes(a.month_id));
      const t1Present = t1Att.filter(a => a.status === 'present').length;
      const t1Absent = t1Att.filter(a => a.status === 'absent').length;
      const t1Excused = t1Att.filter(a => a.status === 'excused').length;
      const t1TotalDays = t1Att.length;
      const t1Rate = t1TotalDays > 0 ? Math.round((t1Present / t1TotalDays) * 100) : 0;

      // Term 2 attendance
      const t2Att = studentAtt.filter(a => a.month_id === 'term2' || term2MonthIds.includes(a.month_id));
      const t2Present = t2Att.filter(a => a.status === 'present').length;
      const t2Absent = t2Att.filter(a => a.status === 'absent').length;
      const t2Excused = t2Att.filter(a => a.status === 'excused').length;
      const t2TotalDays = t2Att.length;
      const t2Rate = t2TotalDays > 0 ? Math.round((t2Present / t2TotalDays) * 100) : 0;

      // Annual Totals
      const totalPresent = t1Present + t2Present;
      const totalAbsent = t1Absent + t2Absent;
      const totalExcused = t1Excused + t2Excused;
      const annualTotalDays = t1TotalDays + t2TotalDays;
      const annualRate = annualTotalDays > 0 ? Math.round((totalPresent / annualTotalDays) * 100) : 0;

      // Student Assessment Records across whole year
      const studentRecords = records.filter(
        r => r.grade === selectedGrade && r.class_num === selectedClassNum
      );
      const t1RecordsCount = studentRecords.filter(r => r.term_id === 'term1').length;
      const t2RecordsCount = studentRecords.filter(r => r.term_id === 'term2').length;

      // Collect unique notes
      const recordNotes = studentRecords.map(r => r.notes).filter(n => n && n.trim());
      const attNotes = studentAtt.map(a => a.notes).filter(n => n && n.trim());
      const allNotes = Array.from(new Set([...recordNotes, ...attNotes]));

      // Determine Overall Rating
      let ratingText = 'ممتاز 🌟';
      let ratingBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      if (annualRate >= 85) {
        ratingText = 'ممتاز 🌟';
        ratingBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      } else if (annualRate >= 70) {
        ratingText = 'جيد جداً 👍';
        ratingBadge = 'bg-blue-100 text-blue-800 border-blue-300';
      } else if (annualRate >= 50) {
        ratingText = 'جيد ⚠️';
        ratingBadge = 'bg-amber-100 text-amber-800 border-amber-300';
      } else {
        ratingText = 'ضعيف - يتطلب المتابعة 🚨';
        ratingBadge = 'bg-rose-100 text-rose-800 border-rose-300';
      }

      return {
        student,
        serial: idx + 1,
        t1Present,
        t1Absent,
        t1Excused,
        t1TotalDays,
        t1Rate,
        t1RecordsCount,
        t2Present,
        t2Absent,
        t2Excused,
        t2TotalDays,
        t2Rate,
        t2RecordsCount,
        totalPresent,
        totalAbsent,
        totalExcused,
        annualTotalDays,
        annualRate,
        annualRecordsCount: studentRecords.length,
        ratingText,
        ratingBadge,
        notes: allNotes
      };
    });
  }, [displayStudents, allAttendance, records, selectedGrade, selectedClassNum]);

  if (!isOpen) return null;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Download PDF function using html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsGenerating(true);

    try {
      const element = printAreaRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
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

      const fileName = `تقرير_الأداء_السنوي_التراكمي_الصف_${selectedGrade}_فصل_${selectedClassNum}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Formatted Text for WhatsApp
  const generateWhatsAppSummary = () => {
    const teacherName = activeTeacher?.name || 'معلم المادة';
    const schoolName = activeTeacher?.school || '';
    const subjectName = activeTeacher?.subject || '';

    let text = `📜 *التقرير السنوي التراكمي لتقييم الحضور والأداء*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🏫 *الصف والفصل:* الصف ${selectedGrade} - فصل ${selectedClassNum}\n`;
    if (schoolName) text += `📍 *المدرسة:* ${schoolName}\n`;
    if (teacherName) text += `👨‍🏫 *المعلم:* ${teacherName} (${subjectName})\n\n`;

    annualCumulativeData.forEach((d) => {
      text += `👤 *الطالب:* ${d.student.name}\n`;
      text += `• التقدير السنوي: *${d.ratingText}*\n`;
      text += `• نسبة الحضور التراكمية: *${d.annualRate}%*\n`;
      text += `• الترم الأول: حضور ${d.t1Present} أيام (${d.t1Rate}%)\n`;
      text += `• الترم الثاني: حضور ${d.t2Present} أيام (${d.t2Rate}%)\n`;
      if (d.notes.length > 0) {
        text += `• الملاحظات: ${d.notes.join(' | ')}\n`;
      }
      text += `------------------------------------\n`;
    });

    return text;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateWhatsAppSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = generateWhatsAppSummary();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 dir-rtl flex items-center justify-center overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] my-auto print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Top Header (Hidden on Print) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between gap-4 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>التقرير السنوي التراكمي (Term 1 & Term 2)</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">PDF جاهز</span>
              </h2>
              <p className="text-emerald-200/80 text-xs font-medium">
                تجميع شامل لنتائج التقييمات والحضور لكافة أشهر العام الدراسي (الترمين الأول والثاني)
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

        {/* Toolbar (Hidden on Print) */}
        <div className="bg-slate-100 p-3 sm:p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Student */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-700">تصفية التقرير:</span>
              <select
                value={selectedStudentFilter}
                onChange={(e) => setSelectedStudentFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="all">كافة طلاب الفصل (كشف تراكمي موحد)</option>
                {classStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="مشاركة الملخص عبر واتساب"
            >
              <MessageCircle className="w-4 h-4" />
              <span>واتساب</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating || annualCumulativeData.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'جاري الإنشاء...' : 'تنزيل PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={annualCumulativeData.length === 0}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة مباشرة</span>
            </button>
          </div>
        </div>

        {/* Printable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 font-sans print:p-0 print:bg-white">
          <div
            ref={printAreaRef}
            className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0 print:max-w-none"
          >
            {/* Formal Report Banner */}
            <div className="border-b-2 border-slate-800 pb-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    تقرير الأداء والتقييم السنوي التراكمي
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-1">
                    حصيلة المتابعة والتقييم للعام الدراسي الكامل (الترم الأول + الترم الثاني)
                  </p>
                </div>

                <div className="text-left font-mono text-xs text-slate-500 font-bold border-r-2 border-emerald-500 pr-3">
                  <div>المملكة المصرية / وزارة التربية والتعليم</div>
                  <div>مدرسة: {activeTeacher.school || 'المدرسة'}</div>
                  <div>العام الدراسي: {DEFAULT_ACADEMIC_YEAR}</div>
                </div>
              </div>

              {/* Class & Teacher Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">الصف والفصل:</span>
                  <span className="text-sm font-black text-slate-900">الصف {selectedGrade} - فصل {selectedClassNum}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">المادة الدراسية:</span>
                  <span className="text-slate-900">{activeTeacher.subject || 'الرياضيات'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">معلم المادة:</span>
                  <span className="text-slate-900">{activeTeacher.name || 'معلم المادة'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">إجمالي الطلاب التراكمي:</span>
                  <span className="text-emerald-700 font-black">{annualCumulativeData.length} طالب</span>
                </div>
              </div>
            </div>

            {annualCumulativeData.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold">
                لا توجد بيانات متاحة لعرض التقرير التراكمي
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Cumulative Class Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white font-black text-[11px]">
                        <th className="p-2.5 border-b border-slate-700 text-center w-10">م</th>
                        <th className="p-2.5 border-b border-slate-700">اسم الطالب</th>
                        <th className="p-2.5 border-b border-slate-700 text-center">حضور الترم 1</th>
                        <th className="p-2.5 border-b border-slate-700 text-center">حضور الترم 2</th>
                        <th className="p-2.5 border-b border-slate-700 text-center">إجمالي الحضور السنوي</th>
                        <th className="p-2.5 border-b border-slate-700 text-center">نسبة الحضور التراكمية</th>
                        <th className="p-2.5 border-b border-slate-700 text-center">التقدير التراكمي السنوي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                      {annualCumulativeData.map((row) => (
                        <tr key={row.student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-2.5 text-center font-bold text-slate-500">{row.serial}</td>
                          <td className="p-2.5 font-black text-slate-900">{row.student.name}</td>
                          <td className="p-2.5 text-center font-mono">
                            <span className="text-emerald-700 font-bold">{row.t1Present} أيام</span>
                            <span className="text-[10px] text-slate-400 block">({row.t1Rate}%)</span>
                          </td>
                          <td className="p-2.5 text-center font-mono">
                            <span className="text-emerald-700 font-bold">{row.t2Present} أيام</span>
                            <span className="text-[10px] text-slate-400 block">({row.t2Rate}%)</span>
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold text-slate-900">
                            {row.totalPresent} / {row.annualTotalDays || (row.totalPresent + row.totalAbsent + row.totalExcused)}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="font-mono font-black text-sm text-slate-900">{row.annualRate}%</span>
                          </td>
                          <td className="p-2.5 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black border ${row.ratingBadge}`}>
                              {row.ratingText}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Individual Student Detail Cards if Single Student Selected or Detailed View */}
                {annualCumulativeData.map((d) => (
                  <div key={`card-${d.student.id}`} className="bg-slate-50/60 border border-slate-200 rounded-2xl p-5 space-y-3 break-inside-avoid">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <h3 className="font-black text-sm text-slate-900">{d.student.name}</h3>
                        <p className="text-[10px] text-slate-500 font-bold">
                          رقم القيد: {d.student.studentNumber || d.student.id} | الحالة: {d.student.status || 'مستجد'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-xl text-xs font-black border ${d.ratingBadge}`}>
                          التقدير السنوي العام: {d.ratingText}
                        </span>
                      </div>
                    </div>

                    {/* Term 1 vs Term 2 Breakdown Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between font-black text-xs text-indigo-900">
                          <span>📘 الفصل الدراسي الأول (Term 1)</span>
                          <span className="font-mono text-emerald-700">{d.t1Rate}%</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">
                          أيام الحضور: <strong className="text-emerald-700">{d.t1Present}</strong> | الغياب: <strong className="text-rose-700">{d.t1Absent}</strong> {d.t1Excused > 0 ? `(بعذر: ${d.t1Excused})` : ''}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">عدد التقييمات المسجلة: {d.t1RecordsCount} تقييمات</p>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between font-black text-xs text-teal-900">
                          <span>📗 الفصل الدراسي الثاني (Term 2)</span>
                          <span className="font-mono text-emerald-700">{d.t2Rate}%</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">
                          أيام الحضور: <strong className="text-emerald-700">{d.t2Present}</strong> | الغياب: <strong className="text-rose-700">{d.t2Absent}</strong> {d.t2Excused > 0 ? `(بعذر: ${d.t2Excused})` : ''}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">عدد التقييمات المسجلة: {d.t2RecordsCount} تقييمات</p>
                      </div>
                    </div>

                    {/* Teacher Notes & Observations */}
                    {d.notes && d.notes.length > 0 && (
                      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs font-bold text-amber-900 space-y-1">
                        <span className="block text-[10px] text-amber-700 font-black">💬 ملاحظات وتوصيات المعلم خلال العام:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          {d.notes.map((note, i) => (
                            <li key={i}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}

                {/* Official Signatures Block */}
                <div className="pt-8 border-t-2 border-slate-800 grid grid-cols-3 gap-4 text-center text-xs font-bold text-slate-800 break-inside-avoid">
                  <div>
                    <p className="text-slate-500 text-[10px] mb-6">مُعد التقرير (معلم المادة):</p>
                    <p className="font-black border-b border-dashed border-slate-400 pb-1">{activeTeacher.name}</p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-[10px] mb-6">يعتمد (مدير المدرسة):</p>
                    <p className="font-black border-b border-dashed border-slate-400 pb-1">..............................</p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-[10px] mb-6">خاتم المدرسة الرسمي:</p>
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-400 mx-auto flex items-center justify-center text-[9px] text-slate-400 font-bold">
                      خاتم المدرسة
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
