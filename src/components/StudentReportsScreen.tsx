import React, { useState, useMemo } from 'react';
import { ScrollText, FileText, Download, Printer } from 'lucide-react';
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

  }, [records, selectedGrade, selectedClassNum, selectedMonthId]);

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
          <button onClick={handleExportExcel} disabled={reportData.length === 0} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={handlePrint} disabled={reportData.length === 0} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportData.map((data, idx) => (
            <div key={data.student.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-800 text-lg">{data.student.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-bold">
                    الصف {data.student.grade} - فصل {data.student.class_num}
                  </p>
                </div>
                <div className={`text-xl font-black ${data.attendanceRate >= 80 ? 'text-emerald-600' : data.attendanceRate >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {data.attendanceRate}%
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-emerald-50 text-emerald-700 rounded-lg p-2">
                  <span className="block text-xs font-bold opacity-80 mb-1">حضور</span>
                  <strong className="text-lg">{data.presentCount}</strong>
                </div>
                <div className="bg-rose-50 text-rose-700 rounded-lg p-2">
                  <span className="block text-xs font-bold opacity-80 mb-1">غياب</span>
                  <strong className="text-lg">{data.absentCount}</strong>
                </div>
                <div className="bg-amber-50 text-amber-700 rounded-lg p-2">
                  <span className="block text-xs font-bold opacity-80 mb-1">بعذر</span>
                  <strong className="text-lg">{data.excusedCount}</strong>
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">الملاحظات</h4>
                {data.notes.length > 0 ? (
                  <ul className="space-y-1.5 list-disc list-inside text-sm text-slate-700">
                    {data.notes.map((note, i) => (
                      <li key={i} className="line-clamp-2" title={note}>{note}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 italic">لا توجد ملاحظات مسجلة</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
