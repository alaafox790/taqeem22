import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { AssessmentRecord, Student, StudentAttendance, TermId } from '../types';

interface ClassStatsProps {
  records: AssessmentRecord[];
  selectedTerm: TermId;
}

export const ClassStats: React.FC<ClassStatsProps> = ({ records, selectedTerm }) => {
  const chartData = useMemo(() => {
    // Read local storage for students and attendance
    let students: Student[] = [];
    let attendance: StudentAttendance[] = [];
    try {
      students = JSON.parse(localStorage.getItem('school_assessments_students_roster_v1') || '[]');
      attendance = JSON.parse(localStorage.getItem('school_assessments_attendance_v1') || '[]');
    } catch (e) {
      console.error(e);
    }

    // Filter attendance and records by selectedTerm (optional, but good for context)
    const termRecords = records.filter(r => r.term_id === selectedTerm);
    
    // Determine unique classes
    const classSet = new Set<string>();
    
    // We can get classes from records, students, and attendance to be safe
    termRecords.forEach(r => classSet.add(`${r.grade}/${r.class_num}`));
    students.forEach(s => classSet.add(`${s.grade}/${s.class_num}`));
    attendance.forEach(a => {
      if (a.month_id === selectedTerm) classSet.add(`${a.grade}/${a.class_num}`);
    });

    const data = Array.from(classSet).map(classId => {
      const [grade, classNumStr] = classId.split('/');
      const classNum = Number(classNumStr);

      // Total assessments for this class
      const classRecords = termRecords.filter(r => r.grade === grade && r.class_num === classNum);
      const assessmentsCount = classRecords.length;

      // Attendance rate for this class
      const classAttendance = attendance.filter(a => a.grade === grade && a.class_num === classNum && a.month_id === selectedTerm);
      const totalAttendance = classAttendance.length;
      const presentCount = classAttendance.filter(a => a.status === 'present').length;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      return {
        name: `الصف ${grade} - فصل ${classNum}`,
        assessmentsCount,
        attendanceRate,
        sortKey: grade + String(classNum).padStart(2, '0')
      };
    });

    // Sort by name roughly
    return data.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [records, selectedTerm]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px] animate-in fade-in">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-700">لا توجد بيانات للعرض</h3>
        <p className="text-slate-500 mt-2 text-center max-w-sm">
          قم بتسجيل الطلاب وإضافة تقييمات وحضور في الفصول لظهور الإحصائيات هنا.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 w-full animate-in fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">إحصائيات الفصول</h2>
          <p className="text-sm text-slate-500 font-bold mt-1">مقارنة معدل الحضور وتراكم التقييمات لكل فصل</p>
        </div>
      </div>

      <div className="h-[400px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              yAxisId="left" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dx={-10}
              domain={[0, 'auto']}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dx={10}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'inherit', textAlign: 'right', direction: 'rtl' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="font-bold text-slate-700 ml-2">{value === 'assessmentsCount' ? 'عدد التقييمات' : 'معدل الحضور (%)'}</span>}
            />
            <Bar 
              yAxisId="left" 
              dataKey="assessmentsCount" 
              name="assessmentsCount"
              fill="#0ea5e9" 
              radius={[6, 6, 0, 0]} 
              barSize={40}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="attendanceRate" 
              name="attendanceRate"
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
