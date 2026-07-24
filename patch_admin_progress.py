import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

old_chart_data = """  const classChartData = useMemo(() => {
    const classSet = new Set(teacherStudents.map(s => `${s.grade}-${s.class_num}`));
    
    teacherRecords.forEach(r => classSet.add(`${r.grade}-${r.class_num}`));

    return Array.from(classSet).map(classId => {
      const [grade, classNum] = classId.split('-');
      
      const studentsInClass = teacherStudents.filter(s => `${s.grade}-${s.class_num}` === classId);
      const recordsInClass = teacherRecords.filter(r => `${r.grade}-${r.class_num}` === classId);
      
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
  }, [teacherStudents, teacherRecords, teacherAttendance]);"""

new_chart_data = """  const classChartData = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    let expectedAssessments = 15;
    
    // Determine expected assessments based on current month
    if ([9, 10, 11, 12, 1].includes(currentMonth)) {
      if (currentMonth === 9) expectedAssessments = 3;
      if (currentMonth === 10) expectedAssessments = 6;
      if (currentMonth === 11) expectedAssessments = 9;
      if (currentMonth === 12) expectedAssessments = 12;
      if (currentMonth === 1) expectedAssessments = 15;
    } else if ([2, 3, 4, 5, 6].includes(currentMonth)) {
      if (currentMonth === 2) expectedAssessments = 3;
      if (currentMonth === 3) expectedAssessments = 6;
      if (currentMonth === 4) expectedAssessments = 9;
      if (currentMonth === 5) expectedAssessments = 12;
      if (currentMonth === 6) expectedAssessments = 15;
    } else {
      expectedAssessments = 15; // Summer break
    }

    const currentTerm = [9, 10, 11, 12, 1].includes(currentMonth) ? 'term1' : 'term2';

    const classSet = new Set(teacherStudents.map(s => `${s.grade}-${s.class_num}`));
    teacherRecords.forEach(r => classSet.add(`${r.grade}-${r.class_num}`));

    return Array.from(classSet).map(classId => {
      const [grade, classNum] = classId.split('-');
      
      const studentsInClass = teacherStudents.filter(s => `${s.grade}-${s.class_num}` === classId);
      
      // Filter records for this class in the current term to count completed
      const recordsInClassTerm = teacherRecords.filter(r => `${r.grade}-${r.class_num}` === classId && r.term_id === currentTerm);
      
      // Unique assess_num to avoid duplicate counting if any
      const uniqueAssessments = new Set(recordsInClassTerm.map(r => r.assess_num));
      const completedAssessmentsCount = uniqueAssessments.size;
      
      const missedCount = Math.max(0, expectedAssessments - completedAssessmentsCount);
      
      const attendanceInClass = teacherAttendance.filter(a => `${a.grade}-${a.class_num}` === classId);
      const presentCount = attendanceInClass.filter(a => a.status === 'present').length;
      const totalAttendance = attendanceInClass.length;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      return {
        name: `الصف ${grade} - ${classNum}`,
        studentsCount: studentsInClass.length,
        assessmentsCount: completedAssessmentsCount, // for charts and cards
        expectedAssessments,
        missedCount,
        attendanceRate,
        isBehind: missedCount > 0
      };
    });
  }, [teacherStudents, teacherRecords, teacherAttendance]);"""

content = content.replace(old_chart_data, new_chart_data)

# Update the cards to show missing
old_cards = """                        {classChartData.map((data, idx) => (
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
                        ))}"""

new_cards = """                        {classChartData.map((data, idx) => (
                          <div key={idx} className={`bg-white border ${data.isBehind ? 'border-rose-200 shadow-rose-100' : 'border-slate-200'} p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}>
                            {data.isBehind && (
                              <div className="absolute top-0 right-0 w-1 h-full bg-rose-500"></div>
                            )}
                            <div className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100 flex justify-between items-center">
                              <span>{data.name}</span>
                              {data.isBehind ? (
                                <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">متأخر</span>
                              ) : (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">منتظم</span>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">المتوقع إنجازه:</span>
                                <span className="font-bold text-slate-700">{data.expectedAssessments} تقييم</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">ما تم إنجازه:</span>
                                <span className={`font-bold ${data.isBehind ? 'text-rose-600' : 'text-emerald-600'}`}>{data.assessmentsCount} تقييم</span>
                              </div>
                              {data.isBehind && (
                                <div className="flex justify-between text-xs bg-rose-50 p-1.5 rounded-md mt-1">
                                  <span className="text-rose-600 font-bold">التقييمات المتأخرة:</span>
                                  <span className="font-bold text-rose-700">{data.missedCount} تقييم</span>
                                </div>
                              )}
                              <div className="flex justify-between text-xs mt-2 pt-2 border-t border-slate-50">
                                <span className="text-slate-500">الحضور:</span>
                                <span className={`font-bold ${data.attendanceRate >= 80 ? 'text-emerald-600' : data.attendanceRate >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                  {data.attendanceRate}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}"""

content = content.replace(old_cards, new_cards)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
