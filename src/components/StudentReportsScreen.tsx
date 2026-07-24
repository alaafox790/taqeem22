import React, { useState, useMemo } from 'react';
import { ScrollText, FileText, Download, Printer, Phone, MessageCircle, Edit2, Check, X, Palette, Settings } from 'lucide-react';
import { AssessmentRecord, Student, StudentAttendance, TermId, MonthInfo } from '../types';
import { GRADES, CLASSES_COUNT, MONTHS_DATA } from '../lib/constants';
import * as XLSX from 'xlsx';

interface StudentReportsScreenProps {
  records: AssessmentRecord[];
  selectedTerm: TermId;
}

export const StudentReportsScreen: React.FC<StudentReportsScreenProps> = ({ records, selectedTerm }) => {
  const [selectedMonthId, setSelectedMonthId] = useState<string>(MONTHS_DATA.find(m => m.termId === selectedTerm)?.id || '');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClassNum, setSelectedClassNum] = useState<number | ''>('');

  
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [editPhoneValue, setEditPhoneValue] = useState('');
  const [triggerRender, setTriggerRender] = useState(0);

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
    // Attendance was historically saved with month_id = selectedTerm, so we filter by selectedTerm and the assessments that belong to the selected month
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

      // Collect notes from records and attendance
      const recordNotes = classRecords.map(r => r.notes).filter(n => n && n.trim() !== '');
      const attendanceNotes = studentAttendance.map(a => a.notes).filter(n => n && n.trim() !== '');
      
      const allNotes = [...recordNotes, ...attendanceNotes];

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

  }, [records, selectedGrade, selectedClassNum, selectedMonthId, triggerRender]);

  
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
  
  const getWhatsAppMessage = (data: any) => {
    return encodeURIComponent(`مرحباً ولي أمر الطالب ${data.student.name}،
نود إعلامكم بأن نسبة حضور الطالب في التقييمات هي ${data.attendanceRate}% (حضر ${data.presentCount} وغاب ${data.absentCount}).
يرجى المتابعة.`);
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
            <h2 className="text-2xl font-black text-slate-800">تقارير الطلاب</h2>
            <p className="text-sm text-slate-500 font-bold mt-1">توليد تقارير موجزة لكل طالب</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <select
            value={selectedMonthId}
            onChange={(e) => setSelectedMonthId(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none"
          >
            {currentTermMonths.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none"
          >
            <option value="" disabled>اختر الصف...</option>
            {GRADES.map((grade) => (
              <option key={grade} value={grade}>الصف {grade}</option>
            ))}
          </select>
          <select
            value={selectedClassNum}
            onChange={(e) => setSelectedClassNum(e.target.value === '' ? '' : Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none"
          >
            <option value="" disabled>اختر الفصل...</option>
            {Array.from({ length: CLASSES_COUNT }, (_, i) => i + 1).map((cNum) => (
              <option key={cNum} value={cNum}>فصل {cNum}</option>
            ))}
          </select>
          <button onClick={() => setShowColorSettings(!showColorSettings)} className={`p-2 rounded-lg transition-colors ${showColorSettings ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
            <Palette className="w-4 h-4" />
          </button>
          <button onClick={handleExportExcel} disabled={reportData.length === 0} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={handlePrint} disabled={reportData.length === 0} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50">
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
                      className={`w-6 h-6 rounded-full border-2 ${colors[tier.key as keyof typeof colors] === c ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent hover:scale-110'} transition-transform bg-${c}-100 text-${c}-700 flex items-center justify-center`}
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
          <p className="text-slate-500 font-bold">يرجى تحديد الصف والفصل لعرض التقارير</p>
        </div>
      ) : reportData.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-slate-500 font-bold">لا توجد بيانات للطلاب في هذا الفصل</p>
        </div>
      ) : (
        <div className="animate-in fade-in">
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
            <h3 className="font-bold text-slate-700">إجمالي الطلاب: {reportData.length} طالب</h3>
            <p className="text-sm text-slate-500 font-medium">مرتبة أبجدياً</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
            {reportData.map((data) => (
              <div key={data.student.id} className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group">
                <div className="text-center mb-1">
                  <h3 className="font-bold text-slate-800 text-[11px] leading-tight line-clamp-1" title={data.student.name}>{data.student.name}</h3>
                  <div className={`mt-1.5 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${getColorClasses(data.attendanceRate)}`}>
                    حضور {data.attendanceRate}%
                  </div>
                </div>
                
                <div className="mt-2 space-y-1">
                  {editingPhoneId === data.student.id ? (
                    <div className="flex flex-col gap-1">
                      <input 
                        type="tel" 
                        value={editPhoneValue}
                        onChange={(e) => setEditPhoneValue(e.target.value)}
                        placeholder="رقم الهاتف"
                        className="w-full text-[10px] p-1 border border-emerald-500 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
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
                      <a href={`tel:${data.student.parentPhone}`} className="flex-1 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 rounded-lg text-[10px] font-bold transition-colors" title="اتصال">
                        <Phone className="w-3 h-3" />
                      </a>
                      <a href={`https://wa.me/${data.student.parentPhone.replace(/^0/, '20')}?text=${getWhatsAppMessage(data)}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-1.5 rounded-lg text-[10px] font-bold transition-colors" title="واتساب">
                        <MessageCircle className="w-3 h-3" />
                      </a>
                      <button onClick={() => { setEditPhoneValue(data.student.parentPhone || ''); setEditingPhoneId(data.student.id); }} className="flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-colors" title="تعديل الرقم">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setEditPhoneValue(''); setEditingPhoneId(data.student.id); }}
                      className="w-full flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-500 py-1.5 rounded-lg text-[10px] font-bold transition-colors"
                    >
                      <Phone className="w-3 h-3" /> إضافة رقم
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
