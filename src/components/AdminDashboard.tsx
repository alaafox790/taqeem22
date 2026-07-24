import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Lock, Users, LogOut, ChevronLeft, Search, Building2, BookOpen, Clock, Activity, FileText, BarChart3, Phone, ChevronRight, Book, AlertTriangle, Calculator, Globe, FlaskConical, Languages, Music, Palette, PenTool, Dna, Code } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { fetchAllFirebaseTeachers, fetchFirebaseStudents, fetchFirebaseAttendance, fetchFirebaseRecords } from '../lib/firebase';
import { TeacherProfile } from '../types';

export interface ManagementSessionData {
  isManagement: boolean;
  role: 'principal' | 'deputy' | 'supervisor';
  pinCode: string;
  subject: string;
  phone?: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
  managementData?: ManagementSessionData | null;
}

const SUBJECTS = ['اللغة العربية', 'اللغة الانجليزية', 'الدراسات الاجتماعية', 'العلوم', 'الرياضيات', 'أخرى'];

const getSubjectIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Book': return <Book className="w-3 h-3 text-indigo-500" />;
    case 'Calculator': return <Calculator className="w-3 h-3 text-rose-500" />;
    case 'Globe': return <Globe className="w-3 h-3 text-teal-500" />;
    case 'FlaskConical': return <FlaskConical className="w-3 h-3 text-sky-500" />;
    case 'Languages': return <Languages className="w-3 h-3 text-orange-500" />;
    case 'Music': return <Music className="w-3 h-3 text-purple-500" />;
    case 'Palette': return <Palette className="w-3 h-3 text-pink-500" />;
    case 'PenTool': return <PenTool className="w-3 h-3 text-slate-500" />;
    case 'Dna': return <Dna className="w-3 h-3 text-green-500" />;
    case 'Code': return <Code className="w-3 h-3 text-slate-700" />;
    default: return <BookOpen className="w-3 h-3 text-slate-400" />;
  }
};


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, managementData }) => {
  const [adminPhone, setAdminPhone] = useState(managementData?.phone || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!managementData?.isManagement);
  const [adminRole, setAdminRole] = useState<'principal' | 'deputy' | 'supervisor' | null>(
    managementData?.role || null
  );
  const [globalTeachers, setGlobalTeachers] = useState<TeacherProfile[]>([]);
  const [activeMainTab, setActiveMainTab] = useState<'teachers' | 'tracking'>('teachers');
  const [trackingRecords, setTrackingRecords] = useState<any[]>([]);
  const [loadingTracking, setLoadingTracking] = useState(false);
  
  const [allTeachers, setAllTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedSubject, setSelectedSubject] = useState<string | null>(
    managementData?.role === 'supervisor' ? managementData.subject : null
  );
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(null);

  useEffect(() => {
    if (managementData && managementData.isManagement) {
      const initFromManagement = async () => {
        setLoading(true);
        try {
          const teachers = await fetchAllFirebaseTeachers();
          setGlobalTeachers(teachers);
          setAdminPhone(managementData.phone || '05XXXXXXXX');
          setAdminRole(managementData.role);
          setAllTeachers(teachers);
          if (managementData.role === 'supervisor' && managementData.subject) {
            setSelectedSubject(managementData.subject);
          }
          setIsAuthenticated(true);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      initFromManagement();
    }
  }, [managementData]);
  
  const [teacherStudents, setTeacherStudents] = useState<any[]>([]);
  const [teacherRecords, setTeacherRecords] = useState<any[]>([]);
  const [teacherAttendance, setTeacherAttendance] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (isAuthenticated && allTeachers.length > 0) {
      const fetchAllRecords = async () => {
        setLoadingTracking(true);
        try {
          const promises = allTeachers.map(t => fetchFirebaseRecords(t.id));
          const results = await Promise.all(promises);
          // Combine all records
          const combined = results.flat();
          setTrackingRecords(combined);
        } catch(e) {
          console.error(e);
        } finally {
          setLoadingTracking(false);
        }
      };
      fetchAllRecords();
    }
  }, [isAuthenticated, allTeachers]);

  const [viewMode, setViewMode] = useState<'cards' | 'charts'>('charts');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPhone.trim()) return;
    
    setLoading(true);
    try {
      const teachers = await fetchAllFirebaseTeachers();
      setGlobalTeachers(teachers);
      
      let isPrincipal = false;
      let isDeputy = false;
      let isSupervisor = false;
      
      const filteredTeachers = teachers.filter(t => {
        if (t.principalPhone === adminPhone) {
          isPrincipal = true;
          return true;
        }
        if (t.deputyPhone === adminPhone) {
          isDeputy = true;
          return true;
        }
        if (t.supervisorPhone === adminPhone) {
          isSupervisor = true;
          return true;
        }
        return false;
      });

      if (filteredTeachers.length > 0) {
        if (isPrincipal) setAdminRole('principal');
        else if (isDeputy) setAdminRole('deputy');
        else setAdminRole('supervisor');
        
        setAllTeachers(filteredTeachers);
        setIsAuthenticated(true);
      } else {
        alert('رقم الهاتف غير مسجل لدى أي معلم كمدير أو وكيل أو مشرف.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeacher = async (teacher: TeacherProfile) => {
    setSelectedTeacher(teacher);
    setLoadingDetails(true);
    try {
      const [students, records, attendance] = await Promise.all([
        fetchFirebaseStudents(teacher.id),
        fetchFirebaseRecords(teacher.id),
        fetchFirebaseAttendance(teacher.id)
      ]);
      setTeacherStudents(students);
      setTeacherRecords(records);
      setTeacherAttendance(attendance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const classChartData = useMemo(() => {
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
    
    // Also consider max recorded in case the teacher is ahead or catching up on previous term
    const termRecords = teacherRecords.filter(r => r.term_id === currentTerm);
    const maxRecorded = termRecords.length > 0 ? Math.max(...termRecords.map(r => r.assess_num)) : 0;
    expectedAssessments = Math.max(expectedAssessments, maxRecorded);

    const classSet = new Set<string>(teacherStudents.map(s => `${s.grade}-${s.class_num}`));
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
  }, [teacherStudents, teacherRecords, teacherAttendance]);

  const trackingData = useMemo(() => {
    // 1. Unlinked Teachers
    const schoolsManaged = Array.from(new Set(allTeachers.map(t => t.school)));
    const unlinkedTeachers = globalTeachers.filter(t => {
      if (!schoolsManaged.includes(t.school)) return false;
      if (adminRole === 'principal') return !t.principalPhone;
      if (adminRole === 'deputy') return !t.deputyPhone;
      if (adminRole === 'supervisor') return !t.supervisorPhone;
      return false;
    });

    // 2. Late Teachers
    const currentMonth = new Date().getMonth() + 1;
    let expectedAssessments = 15;
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
      expectedAssessments = 15; 
    }
    const currentTerm = [9, 10, 11, 12, 1].includes(currentMonth) ? 'term1' : 'term2';

    const teachersWithLate = allTeachers.map(teacher => {
      const tRecords = trackingRecords.filter(r => r.teacher_id === teacher.id && r.term_id === currentTerm);
      const classSet = new Set<string>();
      tRecords.forEach(r => classSet.add(`${r.grade}-${r.class_num}`));
      
      let missedTotal = 0;
      classSet.forEach(classId => {
        const classRecords = tRecords.filter(r => `${r.grade}-${r.class_num}` === classId);
        const uniqueAssessments = new Set(classRecords.map(r => r.assess_num));
        const completedCount = uniqueAssessments.size;
        const missedCount = Math.max(0, expectedAssessments - completedCount);
        missedTotal += missedCount;
      });
      
      return {
        teacher,
        missedTotal,
        classesCount: classSet.size
      };
    }).filter(t => t.missedTotal > 0).sort((a, b) => b.missedTotal - a.missedTotal);

    return { unlinkedTeachers, teachersWithLate };
  }, [globalTeachers, allTeachers, trackingRecords, adminRole]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 w-full max-w-md animate-fadeIn text-center">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center text-emerald-400 shadow-lg shadow-slate-900/20 mb-6">
            <Shield className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">بوابة الإدارة المدرسية</h2>
          <p className="text-sm text-slate-500 mb-8 font-medium">سجل الدخول برقم هاتف المدير، الوكيل، أو المشرف</p>
          
          <form onSubmit={handleLogin} className="space-y-4 text-right">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">رقم الهاتف</label>
              <div className="relative">
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-left font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="05xxxxxxxxx"
                  dir="ltr"
                />
                <Phone className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>
      </div>
    );
  }



  // Get teachers to display
  let displayedTeachers = allTeachers;
  if ((adminRole === 'principal' || adminRole === 'deputy') && selectedSubject) {
    if (selectedSubject === 'أخرى') {
      displayedTeachers = allTeachers.filter(t => !SUBJECTS.slice(0, 5).includes(t.subject));
    } else {
      displayedTeachers = allTeachers.filter(t => t.subject === selectedSubject);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-emerald-400 shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {adminRole === 'principal' ? 'لوحة تحكم مدير المدرسة' : 
               adminRole === 'deputy' ? 'لوحة تحكم وكيل شئون الطلاب' : 
               'لوحة تحكم مشرف المادة'}
            </h2>
            <p className="text-slate-500 font-medium mt-1">متابعة سجلات التقييم للمعلمين</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveMainTab('teachers')}
            className={`px-4 py-2 rounded-xl font-bold transition-colors ${activeMainTab === 'teachers' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            المعلمين
          </button>
          <button 
            onClick={() => {
              setActiveMainTab('tracking');
              setSelectedSubject(null);
              setSelectedTeacher(null);
            }}
            className={`px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 ${activeMainTab === 'tracking' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <AlertTriangle className="w-4 h-4" />
            المتابعة الإدارية
          </button>
          
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setAdminPhone('');
              setSelectedSubject(null);
              setSelectedTeacher(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-xl transition-colors mr-2"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </div>

      {activeMainTab === 'teachers' && (
        <>
          {/* Principal/Deputy Subject Selection */}

      {(adminRole === 'principal' || adminRole === 'deputy') && !selectedSubject && !selectedTeacher && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SUBJECTS.map((subject) => {
            const count = subject === 'أخرى' 
              ? allTeachers.filter(t => !SUBJECTS.slice(0, 5).includes(t.subject)).length
              : allTeachers.filter(t => t.subject === subject).length;
              
            return (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all text-center group"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto flex items-center justify-center mb-4 group-hover:bg-emerald-50 transition-colors">
                  <BookOpen className="w-8 h-8 text-slate-400 group-hover:text-emerald-500" />
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">{subject}</h3>
                <p className="text-sm text-slate-500 font-medium">{count} معلمين</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Teachers List & Details View */}
      {((adminRole === 'supervisor') || ((adminRole === 'principal' || adminRole === 'deputy') && selectedSubject)) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teachers List */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(adminRole === 'principal' || adminRole === 'deputy') && (
                  <button onClick={() => { setSelectedSubject(null); setSelectedTeacher(null); }} className="text-slate-500 hover:text-slate-800 p-1 bg-white rounded-md border border-slate-200">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  المعلمين ({displayedTeachers.length})
                </h3>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {displayedTeachers.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium">لا يوجد معلمين متاحين</div>
              ) : (
                displayedTeachers.map(teacher => (
                  <button
                    key={teacher.id}
                    onClick={() => handleViewTeacher(teacher)}
                    className={`w-full text-right p-4 rounded-xl border transition-all ${
                      selectedTeacher?.id === teacher.id
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{teacher.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">{getSubjectIcon(teacher.subjectIcon)} <span className="font-medium">{teacher.subject}</span></span>
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {teacher.school}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Details View */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px]">
            {!selectedTeacher ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">اختر معلماً</h3>
                <p className="text-sm">قم باختيار أحد المعلمين من القائمة الجانبية لعرض تقاريره وطلابه</p>
              </div>
            ) : loadingDetails ? (
              <div className="flex-1 flex items-center justify-center text-emerald-600 font-bold animate-pulse">
                جاري تحميل بيانات المعلم...
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">{selectedTeacher.name}</h3>
                    <div className="flex gap-3 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> مادة {selectedTeacher.subject}</span>
                      <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {selectedTeacher.school}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
                      <div className="text-xs text-slate-500 font-bold mb-1">عدد الطلاب</div>
                      <div className="text-xl font-black text-teal-600">{teacherStudents.length}</div>
                    </div>
                    <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
                      <div className="text-xs text-slate-500 font-bold mb-1">عدد التقييمات</div>
                      <div className="text-xl font-black text-[#0284c7]">{teacherRecords.length}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Section: Classes Summary with Charts */}
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
                  </div>

                  {/* Section: Recent Records */}
                  <div>
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      أحدث سجلات التقييم
                    </h4>
                    <div className="space-y-3">
                      {teacherRecords.length > 0 ? (
                        [...teacherRecords].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 10).map((record, idx) => (
                          <div key={record.id || idx} className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <div>
                              <div className="font-bold text-slate-700 text-sm mb-1">
                                الصف {record.grade} - فصل {record.class_num}
                              </div>
                              <div className="text-xs text-slate-500">
                                تقييم {record.assess_num}
                                {record.notes && ` • ${record.notes}`}
                              </div>
                            </div>
                            <div className="text-left">
                              <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md inline-block mb-1">
                                أسبوع {record.week_number} - فترة {record.timing_period === 'start' ? 'بداية' : 'نهاية'} الحصة
                              </div>
                              <div className="text-[10px] text-slate-400">{record.created_at ? new Date(record.created_at).toLocaleDateString('ar-EG') : record.assess_date}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-sm text-slate-400 py-4 bg-slate-50 rounded-xl border border-slate-100">
                          لم يقم المعلم برصد أي تقييمات بعد
                        </div>
                      )}
                    </div>
                  </div>
                  
                </div>
              </>
            )}
          </div>
        </div>
      )}
        </>
      )}

      {activeMainTab === 'tracking' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Unlinked Teachers */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-100 bg-amber-50 flex items-center justify-between">
                <h3 className="font-bold text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  معلمون لم يكملوا الربط ({trackingData.unlinkedTeachers.length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {trackingData.unlinkedTeachers.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-medium">الجميع قاموا بالربط بنجاح</div>
                ) : (
                  trackingData.unlinkedTeachers.map(teacher => (
                    <div key={teacher.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">{teacher.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">{getSubjectIcon(teacher.subjectIcon)} {teacher.subject}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> الكود: {teacher.id}</span>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">غير مرتبط</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Late Teachers */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-100 bg-rose-50 flex items-center justify-between">
                <h3 className="font-bold text-rose-800 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  معلمون متأخرون في التقييم ({trackingData.teachersWithLate.length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {loadingTracking ? (
                  <div className="text-center py-10 text-slate-400 font-medium animate-pulse">جاري جلب البيانات...</div>
                ) : trackingData.teachersWithLate.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-medium">جميع المعلمين ملتزمين بالتقييمات</div>
                ) : (
                  trackingData.teachersWithLate.map(({ teacher, missedTotal, classesCount }) => (
                    <div key={teacher.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">{teacher.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">{getSubjectIcon(teacher.subjectIcon)} {teacher.subject}</span>
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {classesCount} فصول مسجلة</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="block text-xl font-black text-rose-500">{missedTotal}</span>
                        <span className="block text-[10px] text-rose-400 font-bold">تقييم متأخر</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
