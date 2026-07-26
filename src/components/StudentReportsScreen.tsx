import React, { useState, useMemo } from 'react';
import { ScrollText, FileText, Download, Printer, Phone, MessageCircle, Edit2, Check, X, Palette, Settings, Share2, Copy, Send, Sparkles, MessageSquare } from 'lucide-react';
import { AssessmentRecord, Student, StudentAttendance, TermId, MonthInfo, TeacherProfile } from '../types';
import { GRADES, CLASSES_COUNT, MONTHS_DATA } from '../lib/constants';
import * as XLSX from 'xlsx';

interface StudentReportsScreenProps {
  records: AssessmentRecord[];
  selectedTerm: TermId;
  teacher?: TeacherProfile;
  onOpenStudentMessages?: () => void;
}

export const StudentReportsScreen: React.FC<StudentReportsScreenProps> = ({ records, selectedTerm, teacher, onOpenStudentMessages }) => {
  const [selectedMonthId, setSelectedMonthId] = useState<string>(MONTHS_DATA.find(m => m.termId === selectedTerm)?.id || '');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClassNum, setSelectedClassNum] = useState<number | ''>('');

  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [editPhoneValue, setEditPhoneValue] = useState('');
  const [triggerRender, setTriggerRender] = useState(0);

  // Share Modal State
  const [selectedShareData, setSelectedShareData] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  React.useEffect(() => {
    const handleUpdate = () => setTriggerRender(prev => prev + 1);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('roster_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('roster_updated', handleUpdate);
    };
  }, []);

  const [showColorSettings, setShowColorSettings] = useState(false);
  const [colors, setColors] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('report_colors_v1') || '{"excellent":"emerald","average":"amber","weak":"rose"}');
    } catch {
      return { excellent: 'emerald', average: 'amber', weak: 'rose' };
    }
  });

  const saveColors = (newColors: any) => {
    setColors(newColors);
    localStorage.setItem('report_colors_v1', JSON.stringify(newColors));
  };

  const currentTermMonths = MONTHS_DATA.filter((m) => m.termId === selectedTerm);
  const selectedMonth = MONTHS_DATA.find(m => m.id === selectedMonthId);

  // Teacher Profile fallback from localStorage
  const activeTeacherProfile: TeacherProfile = useMemo(() => {
    if (teacher) return teacher;
    try {
      const saved = localStorage.getItem('school_assessments_teacher_profile');
      return saved ? JSON.parse(saved) : { name: 'معلم المادة', subject: '', school: '' };
    } catch {
      return { name: 'معلم المادة', subject: '', school: '' };
    }
  }, [teacher]);

  const reportData = useMemo(() => {
    if (!selectedGrade || !selectedClassNum || !selectedMonthId) return [];

    let students: Student[] = [];
    let attendance: StudentAttendance[] = [];
    try {
      students = JSON.parse(localStorage.getItem('school_assessments_students_roster_v1') || '[]');
      attendance = JSON.parse(localStorage.getItem('school_assessments_attendance_v1') || '[]');
    } catch (e) {
      console.error(e);
    }

    const classStudents = students.filter(s => s.grade === selectedGrade && s.class_num === selectedClassNum);
    const classRecords = records.filter(r => r.grade === selectedGrade && r.class_num === selectedClassNum && r.month_id === selectedMonthId);
    
    const validAssessments = selectedMonth?.assessments || [];
    const classAttendance = attendance.filter(a => 
      a.grade === selectedGrade && 
      a.class_num === selectedClassNum && 
      a.month_id === selectedTerm && 
      validAssessments.includes(a.assess_num)
    );

    return classStudents.map(student => {
      const studentAttendance = classAttendance.filter(a => a.student_id === student.id);
      const presentCount = studentAttendance.filter(a => a.status === 'present').length;
      const absentCount = studentAttendance.filter(a => a.status === 'absent').length;
      const excusedCount = studentAttendance.filter(a => a.status === 'excused').length;
      
      const totalDays = studentAttendance.length;
      const attendanceRate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

      const recordNotes = classRecords.map(r => r.notes).filter(n => n && n.trim() !== '');
      const attendanceNotes = studentAttendance.map(a => a.notes).filter(n => n && n.trim() !== '');
      const allNotes = Array.from(new Set([...recordNotes, ...attendanceNotes]));

      return {
        student,
        presentCount,
        absentCount,
        excusedCount,
        attendanceRate,
        notes: allNotes,
        totalAssessments: classRecords.length
      };
    }).sort((a, b) => a.student.name.localeCompare(b.student.name));

  }, [records, selectedGrade, selectedClassNum, selectedMonthId, triggerRender, selectedMonth, selectedTerm]);

  const handleSavePhone = (studentId: string) => {
    try {
      const students: Student[] = JSON.parse(localStorage.getItem('school_assessments_students_roster_v1') || '[]');
      const updated = students.map(s => s.id === studentId ? { ...s, parentPhone: editPhoneValue } : s);
      localStorage.setItem('school_assessments_students_roster_v1', JSON.stringify(updated));
      setEditingPhoneId(null);
      setTriggerRender(prev => prev + 1);
    } catch(e) {
      console.error(e);
    }
  };

  // Helper to generate elegant formatted plain text report for messaging
  const generateFormattedReportText = (data: any) => {
    const teacherName = activeTeacherProfile?.name || 'معلم المادة';
    const subjectName = activeTeacherProfile?.subject || '';
    const schoolName = activeTeacherProfile?.school || '';
    const termName = selectedTerm === 'term1' ? 'الفصل الدراسي الأول' : 'الفصل الدراسي الثاني';
    const monthNameStr = selectedMonth?.name || '';
    
    const ratingText = data.attendanceRate >= 85 
      ? 'ممتاز 🌟' 
      : data.attendanceRate >= 70 
      ? 'جيد جداً 👍' 
      : data.attendanceRate >= 50 
      ? 'جيد ⚠️' 
      : 'ضعيف - يتطلب المتابعة العاجلة 🚨';

    let msg = `📜 *تقرير التقييم والمتابعة الشهرية*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *اسم الطالب:* ${data.student.name}\n`;
    msg += `🏫 *الصف والفصل:* الصف ${selectedGrade} - فصل ${selectedClassNum}\n`;
    if (monthNameStr) msg += `📅 *الفترة والتاريخ:* ${monthNameStr} (${termName})\n`;
    if (teacherName) msg += `👨‍🏫 *معلم المادة:* ${teacherName}${subjectName ? ` (${subjectName})` : ''}\n\n`;

    msg += `📊 *نتائج التقييم والحضور:*\n`;
    msg += `• التقدير العام: *${ratingText}*\n`;
    msg += `• نسبة الحضور والالتزام: *${data.attendanceRate}%*\n`;
    msg += `• الأيام التي تم التقييم فيها: ${data.presentCount} أيام\n`;
    msg += `• مرات الغياب المرصودة: ${data.absentCount} أيام${data.excusedCount > 0 ? ` (بعذر: ${data.excusedCount})` : ''}\n`;

    if (data.notes && data.notes.length > 0) {
      msg += `\n💬 *ملاحظات وتوصيات المعلم:*\n`;
      data.notes.forEach((n: string) => {
        msg += `• ${n}\n`;
      });
    }

    msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `نشكركم على حسن التعاون والمتابعة لمصلحة الطالب.\n`;
    if (schoolName) msg += `مدرسة: ${schoolName}\n`;

    return msg;
  };

  const getWhatsAppMessage = (data: any) => {
    const text = generateFormattedReportText(data);
    return encodeURIComponent(text);
  };

  const handleShareSystem = async (data: any) => {
    const text = generateFormattedReportText(data);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `تقرير تقييم الطالب ${data.student.name}`,
          text: text,
        });
      } catch (err) {
        console.log('Share dismissed or failed:', err);
      }
    } else {
      setSelectedShareData(data);
    }
  };

  const handleCopyFormattedText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const getColorClasses = (rate: number) => {
    const tier = rate >= 80 ? colors.excellent : rate >= 50 ? colors.average : colors.weak;
    const map: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',
      amber: 'bg-amber-100 text-amber-700',
      rose: 'bg-rose-100 text-rose-700',
      indigo: 'bg-indigo-100 text-indigo-700',
      purple: 'bg-purple-100 text-purple-700',
      blue: 'bg-blue-100 text-blue-700',
      teal: 'bg-teal-100 text-teal-700',
    };
    return map[tier] || map.emerald;
  };

  const handleExportExcel = () => {
    if (reportData.length === 0) return;
    const exportData = reportData.map((data, idx) => ({
      'م': idx + 1,
      'الاسم': data.student.name,
      'الحضور (%)': `${data.attendanceRate}%`,
      'أيام الحضور': data.presentCount,
      'أيام الغياب': data.absentCount,
      'غياب بعذر': data.excusedCount,
      'الملاحظات': data.notes.join(' | ') || 'لا توجد ملاحظات'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "التقرير الشهري");
    XLSX.writeFile(wb, `تقرير_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}_${selectedMonth?.name}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 w-full animate-in fade-in printable-area">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            <ScrollText className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">تقارير الطلاب ومشاركة النتائج</h2>
            <p className="text-sm text-slate-500 font-bold mt-1">توليد ومشاركة تقارير تقييم الطلاب عبر واتساب وتطبيقات التواصل</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {onOpenStudentMessages && (
            <button
              onClick={onOpenStudentMessages}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 border border-emerald-500"
              title="استعراض واستجابة رسائل الطلاب بداخل المنصة"
            >
              <MessageSquare className="w-4 h-4" />
              <span>رسائل واستفسارات الطلاب</span>
            </button>
          )}

          <select
            value={selectedMonthId}
            onChange={(e) => setSelectedMonthId(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            {currentTermMonths.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="" disabled>اختر الصف...</option>
            {GRADES.map((grade) => (
              <option key={grade} value={grade}>الصف {grade}</option>
            ))}
          </select>
          <select
            value={selectedClassNum}
            onChange={(e) => setSelectedClassNum(e.target.value === '' ? '' : Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="" disabled>اختر الفصل...</option>
            {Array.from({ length: CLASSES_COUNT }, (_, i) => i + 1).map((cNum) => (
              <option key={cNum} value={cNum}>فصل {cNum}</option>
            ))}
          </select>
          <button onClick={() => setShowColorSettings(!showColorSettings)} className={`p-2 rounded-lg transition-colors cursor-pointer ${showColorSettings ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
            <Palette className="w-4 h-4" />
          </button>
          <button onClick={handleExportExcel} disabled={reportData.length === 0} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer" title="تصدير Excel">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={handlePrint} disabled={reportData.length === 0} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer" title="طباعة مباشرة">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showColorSettings && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 print:hidden animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
            <Settings className="w-4 h-4" />
            <h3>تخصيص ألوان التقييم</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'excellent', label: 'المتفوق (حضور 80%+)' },
              { key: 'average', label: 'المتوسط (حضور 50%-79%)' },
              { key: 'weak', label: 'الضعيف (حضور < 50%)' }
            ].map(tier => (
              <div key={tier.key} className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-2">{tier.label}</p>
                <div className="flex flex-wrap gap-2">
                  {['emerald', 'amber', 'rose', 'indigo', 'purple', 'blue', 'teal'].map(c => (
                    <button
                      key={c}
                      onClick={() => saveColors({ ...colors, [tier.key]: c })}
                      className={`w-6 h-6 rounded-full border-2 ${colors[tier.key as keyof typeof colors] === c ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent hover:scale-110'} transition-transform bg-${c}-100 text-${c}-700 flex items-center justify-center cursor-pointer`}
                      style={{
                        backgroundColor: c === 'emerald' ? '#d1fae5' : c === 'amber' ? '#fef3c7' : c === 'rose' ? '#ffe4e6' : c === 'indigo' ? '#e0e7ff' : c === 'purple' ? '#f3e8ff' : c === 'blue' ? '#dbeafe' : '#ccfbf1',
                        color: c === 'emerald' ? '#047857' : c === 'amber' ? '#b45309' : c === 'rose' ? '#be123c' : c === 'indigo' ? '#4338ca' : c === 'purple' ? '#7e22ce' : c === 'blue' ? '#1d4ed8' : '#0f766e'
                      }}
                    >
                      {colors[tier.key as keyof typeof colors] === c && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedGrade || !selectedClassNum ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-bold">يرجى تحديد الصف والفصل لعرض التقارير وتوليد مشاركة النتائج</p>
        </div>
      ) : reportData.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-slate-500 font-bold">لا توجد بيانات للطلاب في هذا الفصل</p>
        </div>
      ) : (
        <div className="animate-in fade-in">
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
            <h3 className="font-bold text-slate-700">إجمالي الطلاب: {reportData.length} طالب</h3>
            <p className="text-sm text-slate-500 font-medium">مرتبة أبجدياً | اضغط على "مشاركة التقرير" لإرساله مباشرة عبر الواتساب</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {reportData.map((data) => (
              <div key={data.student.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between relative group">
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <h3 className="font-bold text-slate-800 text-xs leading-tight line-clamp-1" title={data.student.name}>{data.student.name}</h3>
                    <div className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${getColorClasses(data.attendanceRate)}`}>
                      {data.attendanceRate}%
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 font-medium">
                    حضور: <strong className="text-emerald-700">{data.presentCount}</strong> | غياب: <strong className="text-rose-700">{data.absentCount}</strong>
                  </p>
                </div>
                
                <div className="mt-3 space-y-1.5">
                  {/* Share Report Main Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedShareData(data)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-[11px] py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>مشاركة التقرير 📲</span>
                  </button>

                  {/* Phone / WhatsApp Quick Row */}
                  {editingPhoneId === data.student.id ? (
                    <div className="flex flex-col gap-1">
                      <input 
                        type="tel" 
                        value={editPhoneValue}
                        onChange={(e) => setEditPhoneValue(e.target.value)}
                        placeholder="رقم الهاتف"
                        className="w-full text-[10px] p-1 border border-emerald-500 rounded focus:outline-none text-center"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button onClick={() => handleSavePhone(data.student.id)} className="flex-1 py-1 bg-emerald-100 text-emerald-700 rounded flex items-center justify-center hover:bg-emerald-200">
                          <Check className="w-3 h-3" />
                        </button>
                        <button onClick={() => setEditingPhoneId(null)} className="flex-1 py-1 bg-rose-100 text-rose-700 rounded flex items-center justify-center hover:bg-rose-200">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : data.student.parentPhone ? (
                    <div className="flex gap-1">
                      <a 
                        href={`https://wa.me/${data.student.parentPhone.replace(/^0/, '20')}?text=${getWhatsAppMessage(data)}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-1 rounded-lg text-[10px] font-bold transition-colors" 
                        title="إرسال عبر واتساب مباشر"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>واتساب</span>
                      </a>

                      <a 
                        href={`tel:${data.student.parentPhone}`} 
                        className="flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1 px-2 rounded-lg text-[10px] font-bold transition-colors" 
                        title="اتصال تلفوني"
                      >
                        <Phone className="w-3 h-3" />
                      </a>

                      <button 
                        onClick={() => { setEditPhoneValue(data.student.parentPhone || ''); setEditingPhoneId(data.student.id); }} 
                        className="flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer" 
                        title="تعديل رقم الهاتف"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setEditPhoneValue(''); setEditingPhoneId(data.student.id); }}
                      className="w-full flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-500 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      <Phone className="w-3 h-3" /> إضافة رقم هاتف
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Report Modal */}
      {selectedShareData && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">مشاركة التقرير عبر تطبيقات التواصل</h3>
                  <p className="text-xs text-slate-500 font-bold">الطالب: {selectedShareData.student.name}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedShareData(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formatted Text Box Preview */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">معاينة الرسالة النصية المنسقة للتقرير:</label>
              <textarea
                readOnly
                rows={10}
                value={generateFormattedReportText(selectedShareData)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-medium text-slate-800 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Action Buttons inside Modal */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              {/* WhatsApp Button */}
              {selectedShareData.student.parentPhone ? (
                <a
                  href={`https://wa.me/${selectedShareData.student.parentPhone.replace(/^0/, '20')}?text=${getWhatsAppMessage(selectedShareData)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال عبر واتساب (مباشر)</span>
                </a>
              ) : (
                <a
                  href={`https://wa.me/?text=${getWhatsAppMessage(selectedShareData)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال عبر واتساب</span>
                </a>
              )}

              {/* Native System Share */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={() => handleShareSystem(selectedShareData)}
                  className="w-full sm:w-auto bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>تطبيقات أخرى</span>
                </button>
              )}

              {/* Copy Text Button */}
              <button
                type="button"
                onClick={() => handleCopyFormattedText(generateFormattedReportText(selectedShareData))}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">تم النسخ! ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ النص</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

