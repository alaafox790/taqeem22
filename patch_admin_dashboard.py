import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

new_imports = """import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Lock, Users, LogOut, ChevronLeft, Search, Building2, BookOpen, Clock, Activity, FileText, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { fetchAllFirebaseTeachers, fetchFirebaseStudents, fetchFirebaseAttendance, fetchFirebaseRecords } from '../lib/firebase';"""

content = re.sub(r"import React,.*?from '../lib/firebase';", new_imports, content, flags=re.DOTALL)

old_state = """  const [teacherStudents, setTeacherStudents] = useState<any[]>([]);
  const [teacherRecords, setTeacherRecords] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);"""

new_state = """  const [teacherStudents, setTeacherStudents] = useState<any[]>([]);
  const [teacherRecords, setTeacherRecords] = useState<any[]>([]);
  const [teacherAttendance, setTeacherAttendance] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'charts'>('charts');"""

content = content.replace(old_state, new_state)

old_fetch = """      const [students, records] = await Promise.all([
        fetchFirebaseStudents(teacher.id),
        fetchFirebaseRecords(teacher.id)
      ]);
      setTeacherStudents(students);
      setTeacherRecords(records);"""

new_fetch = """      const [students, records, attendance] = await Promise.all([
        fetchFirebaseStudents(teacher.id),
        fetchFirebaseRecords(teacher.id),
        fetchFirebaseAttendance(teacher.id)
      ]);
      setTeacherStudents(students);
      setTeacherRecords(records);
      setTeacherAttendance(attendance);"""

content = content.replace(old_fetch, new_fetch)

chart_data_logic = """
  const classChartData = useMemo(() => {
    const classSet = new Set(teacherStudents.map(s => `${s.grade}-${s.class_num}`));
    
    // Also include classes from records even if no students are added yet
    teacherRecords.forEach(r => classSet.add(`${r.grade}-${r.class_num}`));

    return Array.from(classSet).map(classId => {
      const [grade, classNum] = classId.split('-');
      
      const studentsInClass = teacherStudents.filter(s => `${s.grade}-${s.class_num}` === classId);
      const recordsInClass = teacherRecords.filter(r => `${r.grade}-${r.class_num}` === classId);
      
      // Calculate attendance rate for this class
      const attendanceInClass = teacherAttendance.filter(a => `${a.grade}-${a.class_num}` === classId);
      const presentCount = attendanceInClass.filter(a => a.status === 'present').length;
      const totalAttendance = attendanceInClass.length;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      return {
        name: `الصف ${grade} - ${classNum}`,
        studentsCount: studentsInClass.length,
        assessmentsCount: recordsInClass.length,
        attendanceRate
      };
    });
  }, [teacherStudents, teacherRecords, teacherAttendance]);
"""

old_classes_section = """                {/* Section: Classes Summary */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    إحصائيات الفصول
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from(new Set(teacherStudents.map(s => `${s.grade}-${s.class_num}`))).map(classId => {
                      const classStudents = teacherStudents.filter(s => `${s.grade}-${s.class_num}` === classId);
                      const [grade, classNum] = classId.split('-');
                      return (
                        <div key={classId} className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                          <div className="text-sm font-bold text-slate-700 mb-1">الصف {grade} - فصل {classNum}</div>
                          <div className="text-xs text-slate-500 font-medium">{classStudents.length} طالب مسجل</div>
                        </div>
                      );
                    })}
                    {teacherStudents.length === 0 && (
                      <div className="col-span-full text-center text-sm text-slate-400 py-4">لم يقم المعلم بإضافة طلاب بعد</div>
                    )}
                  </div>
                </div>"""

new_classes_section = """                {/* Section: Classes Summary with Charts */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      مقارنة أداء الفصول
                    </h4>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button 
                        onClick={() => setViewMode('charts')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${viewMode === 'charts' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        رسوم بيانية
                      </button>
                      <button 
                        onClick={() => setViewMode('cards')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${viewMode === 'cards' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        بطاقات
                      </button>
                    </div>
                  </div>

                  {viewMode === 'cards' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fadeIn">
                      {classChartData.map((data, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">{data.name}</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">الطلاب:</span>
                              <span className="font-bold text-slate-700">{data.studentsCount}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">التقييمات:</span>
                              <span className="font-bold text-slate-700">{data.assessmentsCount}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">الحضور:</span>
                              <span className={`font-bold ${data.attendanceRate >= 80 ? 'text-emerald-600' : data.attendanceRate >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                {data.attendanceRate}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {classChartData.length === 0 && (
                        <div className="col-span-full text-center text-sm text-slate-400 py-8 bg-slate-50 rounded-xl border border-slate-100">
                          لا توجد فصول مسجلة بعد
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm animate-fadeIn">
                      {classChartData.length > 0 ? (
                        <div className="h-[300px] w-full" dir="ltr">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={classChartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} dy={10} />
                              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dx={-10} />
                              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dx={10} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', textAlign: 'right', direction: 'rtl' }}
                              />
                              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                              <Bar yAxisId="left" dataKey="assessmentsCount" name="عدد التقييمات" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                              <Line yAxisId="right" type="monotone" dataKey="attendanceRate" name="معدل الحضور %" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-sm text-slate-400">
                          لا توجد بيانات كافية لرسم المخطط
                        </div>
                      )}
                    </div>
                  )}
                </div>"""

content = content.replace(old_classes_section, new_classes_section)

# Insert the hook before the return statement inside the main render
content = content.replace("  if (!isAuthenticated) {", chart_data_logic + "\n  if (!isAuthenticated) {")

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
