import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, LineChart, PieChart, Pie, Cell } from 'recharts';
import { AssessmentRecord, Student, StudentAttendance, TermId } from '../types';
import { MONTHS_DATA } from '../lib/constants';
import { Book, Calculator, Globe, FlaskConical, Languages, Music, Palette, PenTool, Dna, Code, TrendingUp } from 'lucide-react';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#f43f5e', '#8b5cf6', '#0ea5e9', '#10b981', '#d946ef'];

const getSubjectIcon = (iconName?: string, className: string = "w-6 h-6 text-indigo-600") => {
  switch (iconName) {
    case 'Book': return <Book className={className} />;
    case 'Calculator': return <Calculator className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'FlaskConical': return <FlaskConical className={className} />;
    case 'Languages': return <Languages className={className} />;
    case 'Music': return <Music className={className} />;
    case 'Palette': return <Palette className={className} />;
    case 'PenTool': return <PenTool className={className} />;
    case 'Dna': return <Dna className={className} />;
    case 'Code': return <Code className={className} />;
    default: return <TrendingUp className={className} />;
  }
};


import { TeacherProfile } from '../types';

interface ClassStatsProps {
  records: AssessmentRecord[];
  selectedTerm: TermId;
  teacher: TeacherProfile;
}

export const ClassStats: React.FC<ClassStatsProps> = ({ records, selectedTerm, teacher }) => {
  const [localStorageKey, setLocalStorageKey] = React.useState(0);

  // Re-read local storage on mount, tab activation, or roster updates
  React.useEffect(() => {
    const handleUpdate = () => setLocalStorageKey(prev => prev + 1);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('roster_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('roster_updated', handleUpdate);
    };
  }, [records, selectedTerm]);

  const chartData = useMemo(() => {
    // Read local storage for students and attendance
    let students: Student[] = [];
    let rawAttendance: StudentAttendance[] = [];
    try {
      students = JSON.parse(localStorage.getItem('school_assessments_students_roster_v1') || '[]');
      rawAttendance = JSON.parse(localStorage.getItem('school_assessments_attendance_v1') || '[]');
    } catch (e) {
      console.error(e);
    }

    // Keep attendance only for existing students in the current roster
    const validStudentIds = new Set(students.map(s => s.id));
    const attendance = rawAttendance.filter(a => validStudentIds.has(a.student_id));

    // Filter attendance and records by selectedTerm
    const termRecords = records.filter(r => r.term_id === selectedTerm);
    
    // Determine unique classes that currently exist (ONLY classes with registered students)
    const classSet = new Set<string>();
    students.forEach(s => classSet.add(`${s.grade}/${s.class_num}`));

    const monthlyData = MONTHS_DATA.filter(m => m.termId === selectedTerm).map(month => {
      const monthRecords = termRecords.filter(r => r.month_id === month.id);
      
      const monthAttendance = attendance.filter(a => a.month_id === month.id);
      const presentCount = monthAttendance.filter(a => a.status === 'present').length;
      const totalAttendance = monthAttendance.length;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;
      
      const evaluatedInMonth = new Set(monthAttendance.map(a => `${a.grade}_${a.class_num}_${a.assess_num}`)).size;
      const assessmentsCount = Math.max(monthRecords.length, evaluatedInMonth);

      return {
        name: month.name.split(' ')[0],
        assessmentsCount,
        attendanceRate
      };
    });

    const data = Array.from(classSet).map(classId => {
      const [grade, classNumStr] = classId.split('/');
      const classNum = Number(classNumStr);

      // Total assessments for this class
      const classRecords = termRecords.filter(r => r.grade === grade && r.class_num === classNum);
      const classAttendance = attendance.filter(a => a.grade === grade && a.class_num === classNum && a.month_id === selectedTerm);
      
      const evaluatedAssessNums = new Set(classAttendance.map(a => a.assess_num)).size;
      const assessmentsCount = Math.max(classRecords.length, evaluatedAssessNums);

      // Attendance rate for this class
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
    return { classData: data.sort((a, b) => a.sortKey.localeCompare(b.sortKey)), monthlyData };
  }, [records, selectedTerm, localStorageKey]);

  if (chartData.classData.length === 0) {
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
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm border border-slate-100 w-full animate-in fade-in">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100">
          {getSubjectIcon(teacher.subjectIcon, "w-5 h-5 sm:w-6 sm:h-6 text-indigo-600")}
        </div>
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-800">إحصائيات الفصول ({teacher.subject})</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-bold mt-0.5 sm:mt-1">مقارنة الحضور والتقييمات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 h-[250px] sm:h-[300px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData.classData}
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

        <div className="h-[250px] sm:h-[300px] w-full flex flex-col" dir="ltr">
          <h3 className="text-lg font-bold text-slate-700 mb-2 self-end">توزيع التقييمات</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.classData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="assessmentsCount"
              >
                {chartData.classData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'inherit', textAlign: 'right', direction: 'rtl' }}
                formatter={(value) => [value, 'عدد التقييمات']}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value, entry: any) => <span className="font-bold text-slate-700 ml-2">{entry.payload.name}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 border-t border-slate-100 pt-4 sm:pt-6">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          تطور الأداء عبر الشهور
        </h3>
        <div className="h-[200px] sm:h-[250px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData.monthlyData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
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
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'inherit', textAlign: 'right', direction: 'rtl' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span className="font-bold text-slate-700 ml-2">{value === 'assessmentsCount' ? 'عدد التقييمات' : 'معدل الحضور (%)'}</span>}
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="assessmentsCount" 
                name="assessmentsCount"
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="attendanceRate" 
                name="attendanceRate"
                stroke="#ec4899" 
                strokeWidth={3}
                dot={{ r: 6, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
