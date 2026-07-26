import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Calendar, Award, CheckCircle2, XCircle, AlertCircle, 
  LogOut, User, Phone, BookOpen, ShieldCheck, FileText, Sparkles, 
  ChevronLeft, Clock, Activity, Star, School, Bell, BellRing, Megaphone, HeartHandshake,
  MessageCircle, Send, AlertTriangle, Check, RefreshCw, MessageSquare, CheckCheck, X
} from 'lucide-react';
import { Student, StudentAttendance, AssessmentRecord, TeacherProfile, TermId, Reminder, ChatMessage } from '../types';
import { 
  fetchFirebaseStudents, 
  fetchFirebaseAttendance, 
  fetchFirebaseRecords, 
  fetchFirebaseReminders,
  fetchFirebaseMessagesForStudent,
  saveFirebaseMessage
} from '../lib/firebase';
import { MONTHS_DATA } from '../lib/constants';

interface StudentPortalProps {
  phone: string;
  studentCode: string;
  teacher: TeacherProfile;
  academicYear: string;
  onLogout: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  phone,
  studentCode,
  teacher,
  academicYear,
  onLogout
}) => {
  const [selectedTerm, setSelectedTerm] = useState<TermId>('term1');
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'contact' | 'attendance' | 'assessments' | 'notes'>('overview');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendance[]>([]);
  const [classRecords, setClassRecords] = useState<AssessmentRecord[]>([]);
  const [teacherReminders, setTeacherReminders] = useState<Reminder[]>([]);
  const [refreshingReminders, setRefreshingReminders] = useState<boolean>(false);
  
  // Custom message to teacher state
  const [studentMessage, setStudentMessage] = useState<string>('');
  const [messageSentStatus, setMessageSentStatus] = useState<boolean>(false);

  // In-App Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inAppMessageText, setInAppMessageText] = useState<string>('');
  const [isSendingInAppMsg, setIsSendingInAppMsg] = useState<boolean>(false);
  const [loadingChat, setLoadingChat] = useState<boolean>(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);

  const loadChatMessages = async () => {
    if (!studentCode || !teacher.id) return;
    setLoadingChat(true);
    try {
      const msgs = await fetchFirebaseMessagesForStudent(studentCode, teacher.id);
      setChatMessages(msgs);
    } catch (err) {
      console.error('Error loading in-app chat messages:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendInAppMessage = async () => {
    if (!inAppMessageText.trim() || !studentInfo || !teacher.id) return;
    setIsSendingInAppMsg(true);
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentCode: studentCode,
      studentName: studentInfo.name,
      grade: studentInfo.grade,
      class_num: studentInfo.class_num,
      teacher_id: teacher.id,
      sender: 'student',
      text: inAppMessageText.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const success = await saveFirebaseMessage(newMsg);
    if (success) {
      setChatMessages((prev) => [...prev, newMsg]);
      setInAppMessageText('');
    }
    setIsSendingInAppMsg(false);
  };

  const filterRemindersForStudent = (remindersList: Reminder[], matchedStudent: Student) => {
    return remindersList.filter(r => {
      if (r.targetType === 'general') return true;
      if (r.targetType === 'class') {
        if (!r.targetName || r.targetName === 'الكل') return true;
        return (
          r.targetName.includes(`${matchedStudent.grade}`) || 
          r.targetName.includes(`${matchedStudent.class_num}`) ||
          r.targetName.includes(`${matchedStudent.grade}/${matchedStudent.class_num}`)
        );
      }
      if (r.targetType === 'student') {
        return r.targetName?.includes(matchedStudent.name) || r.targetName?.includes(studentCode);
      }
      return true;
    });
  };

  const handleRefreshReminders = async () => {
    if (!teacher.id) return;
    setRefreshingReminders(true);
    try {
      const firestoreReminders = await fetchFirebaseReminders(teacher.id, teacher.phone);
      if (studentInfo) {
        const filtered = filterRemindersForStudent(firestoreReminders, studentInfo);
        setTeacherReminders(filtered);
      }
    } catch (err) {
      console.error('Error refreshing reminders from Firestore:', err);
    } finally {
      setRefreshingReminders(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadStudentData = async () => {
      setLoading(true);
      try {
        // Fetch all students to find matching student code or phone
        const allStudents = await fetchFirebaseStudents(teacher.id);
        const matched = allStudents.find(
          (s) => 
            (s.studentNumber && s.studentNumber.trim().toLowerCase() === studentCode.trim().toLowerCase()) ||
            (s.parentPhone && s.parentPhone.includes(phone)) ||
            s.id.includes(studentCode)
        ) || {
          id: `st_${studentCode}`,
          name: `الطالب (${studentCode})`,
          grade: 'الأول',
          class_num: 1,
          studentNumber: studentCode,
          parentPhone: phone
        };

        if (isMounted) {
          setStudentInfo(matched);
        }

        // Fetch attendance
        const att = await fetchFirebaseAttendance(teacher.id);
        if (isMounted && att) {
          const studentAtt = att.filter((a) => a.student_id === matched.id || a.student_name === matched.name);
          setAttendanceRecords(studentAtt);
        }

        // Fetch assessment records for teacher
        const recs = await fetchFirebaseRecords(teacher.id);
        if (isMounted && recs) {
          setClassRecords(recs);
        }

        // Fetch reminders / announcements directly from Firestore
        try {
          let rawReminders: Reminder[] = [];
          try {
            rawReminders = await fetchFirebaseReminders(teacher.id, teacher.phone);
          } catch (e) {
            console.warn("Could not fetch reminders from Firestore, attempting local fallback:", e);
          }

          if (!rawReminders || rawReminders.length === 0) {
            const savedReminders = localStorage.getItem('school_assessments_custom_reminders_v1');
            if (savedReminders) {
              rawReminders = JSON.parse(savedReminders);
            }
          }

          if (isMounted && rawReminders) {
            const filtered = filterRemindersForStudent(rawReminders, matched);
            setTeacherReminders(filtered);
          }
        } catch (err) {
          console.error("Error loading reminders:", err);
        }

        // Fetch in-app chat messages
        try {
          const msgs = await fetchFirebaseMessagesForStudent(studentCode, teacher.id);
          if (isMounted) {
            setChatMessages(msgs);
          }
        } catch (err) {
          console.error("Error loading chat messages:", err);
        }

      } catch (e) {
        console.error("Error loading student portal data:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStudentData();
    return () => { isMounted = false; };
  }, [studentCode, phone, teacher.id, teacher.phone]);

  // Attendance stats
  const presentCount = attendanceRecords.filter((a) => a.status === 'present').length;
  const absentCount = attendanceRecords.filter((a) => a.status === 'absent').length;
  const excusedCount = attendanceRecords.filter((a) => a.status === 'excused').length;
  const totalAttEntries = attendanceRecords.length;
  const attendanceRate = totalAttEntries > 0 ? Math.round((presentCount / totalAttEntries) * 100) : 100;

  // Filter records by selected term
  const termRecords = classRecords.filter((r) => r.academic_year === academicYear && r.term_id === selectedTerm);

  // Send message to teacher via WhatsApp
  const handleSendWhatsAppToTeacher = () => {
    if (!teacher.phone) {
      alert('لم يسجل معلم المادة رقم جوال للتواصل المباشر بعد');
      return;
    }
    const cleanPhone = teacher.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '966' + cleanPhone.slice(1) : cleanPhone;
    
    const bodyText = studentMessage.trim() 
      ? studentMessage.trim() 
      : `السلام عليكم ورحمة الله أستاذ ${teacher.name}، أنا ولي أمر الطالب/ة (${studentInfo?.name || 'الطالب'}) - كود (${studentCode}). أود الاستفسار عن مستوى الطالب والمتابعة.`;

    const message = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته\n` +
      `الأستاذ الفاضل: ${teacher.name} (${teacher.subject || 'معلم المادة'})\n` +
      `ولي أمر الطالب/ة: ${studentInfo?.name || ''} - كود: ${studentCode}\n` +
      `الصف: ${studentInfo?.grade || ''} (فصل ${studentInfo?.class_num || 1})\n\n` +
      `💬 نص الرسالة:\n${bodyText}`
    );

    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    setMessageSentStatus(true);
    setTimeout(() => setMessageSentStatus(false), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-['Tajawal',sans-serif] dir-rtl pb-24 select-none">
      
      {/* Student Portal Header Bar */}
      <header className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 text-amber-300 flex items-center justify-center shadow-md shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">بوابة الطالب الإلكترونية</h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> حساب نشط
                </span>
              </div>
              <p className="text-xs text-sky-200/80 font-bold mt-0.5 truncate max-w-xs sm:max-w-md">
                أ. {teacher.name || 'معلم الفصل'} ({teacher.subject || 'المادة'}) | مدرسة {teacher.school || 'المدرسة'}
              </p>
            </div>
          </div>

          {/* Header Quick Actions: Direct Message Icon Trigger & Logout */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setIsChatModalOpen(true);
                loadChatMessages();
              }}
              className="message-icon-trigger relative px-3.5 py-2 bg-emerald-600 hover:bg-slate-100 hover:text-slate-900 hover:scale-105 text-white rounded-xl border border-emerald-500 hover:border-slate-300 font-black text-xs transition-all duration-200 flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              title="مراسلة واستفسار مباشر للمعلم"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">مراسلة المعلم</span>
              {chatMessages.some(m => m.sender === 'teacher' && !m.isRead) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
              )}
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl border border-rose-500 font-black text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              title="تسجيل الخروج من البوابة الإلكترونية"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Student Portal Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* Student Profile Identity Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-md relative overflow-hidden">
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-sky-50 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shrink-0 border-2 border-white">
                {studentInfo?.photoUrl ? (
                  <img src={studentInfo.photoUrl} alt="Student" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  studentInfo?.name?.charAt(0) || 'ط'
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {studentInfo?.name || 'اسم الطالب غير مسجل'}
                  </h2>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-mono font-black">
                    كود الطالب: {studentCode}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-bold mt-1.5">
                  <span className="flex items-center gap-1">
                    <School className="w-4 h-4 text-sky-600" />
                    الصف {studentInfo?.grade || 'الأول'} - فصل {studentInfo?.class_num || 1}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    جوال ولي الأمر: <span className="dir-ltr font-mono font-bold text-slate-700">{phone}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    العام الدراسي: {academicYear}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions inside Card: Contact & Logout */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => setActiveTab('contact')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>تواصل مع المعلم</span>
              </button>

              <button
                onClick={onLogout}
                className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-2xl border border-slate-200 hover:border-rose-300 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>

        {/* Term Switcher */}
        <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTerm('term1')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedTerm === 'term1'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              الفصل الدراسي الأول
            </button>
            <button
              onClick={() => setSelectedTerm('term2')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedTerm === 'term2'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              الفصل الدراسي الثاني
            </button>
          </div>

          <span className="text-xs font-bold text-slate-500 hidden sm:block">
            إجمالي تقييمات الفصل: <span className="text-sky-600 font-black">{termRecords.length} تقييماً</span>
          </span>
        </div>

        {/* Tab Navigation Menu */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>الملخص العام</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-3 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 border relative cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>التنبيهات الإشعارات</span>
            {teacherReminders.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {teacherReminders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`py-3 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>تواصل مع المعلم</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>سجل الحضور</span>
          </button>

          <button
            onClick={() => setActiveTab('assessments')}
            className={`py-3 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              activeTab === 'assessments'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>التقييمات الأسبوعية</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>توصيات المتابعة</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Dedicated News & Alerts Section */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50/50 p-5 rounded-3xl border-2 border-amber-200/80 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm">
                    <BellRing className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-amber-950 flex items-center gap-2">
                      <span>قسم الأخبار والتنبيهات العامة والخاصة</span>
                      <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[11px] rounded-full font-black">
                        {teacherReminders.length} تنبيهات
                      </span>
                    </h3>
                    <p className="text-xs text-amber-800/80 font-bold">
                      التنبيهات المباشرة المرسلة من المعلم (أ. {teacher.name}) المحفوظة بـ Firestore
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefreshReminders}
                    disabled={refreshingReminders}
                    className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-black border border-amber-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshingReminders ? 'animate-spin text-amber-600' : ''}`} />
                    <span>تحديث</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <span>عرض الكل</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {teacherReminders.length === 0 ? (
                <div className="p-4 bg-white/80 rounded-2xl border border-amber-100 text-center flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>لا توجد تنبيهات عاجلة جديدة من المعلم حالياً. ستظهر أي إعلانات جديدة هنا فور إرسالها.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {teacherReminders.slice(0, 4).map((rem) => (
                    <div
                      key={rem.id}
                      className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-2 hover:border-amber-400 transition-all"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 w-full">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-black text-xs text-slate-900">{rem.title}</h4>
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-mono font-black px-2 py-0.5 rounded-md shrink-0">
                              {rem.reminderDate}
                            </span>
                          </div>
                          {rem.description && (
                            <p className="text-xs text-slate-600 font-bold line-clamp-2 leading-relaxed">{rem.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 font-bold text-slate-500">
                        <span>
                          🎯 موجه إلى: {rem.targetType === 'general' ? 'جميع الطلاب' : rem.targetName || 'الفصل'}
                        </span>
                        <span className="text-amber-700 font-black">نشط 🔔</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-1">أيام الحضور الموثقة</span>
                  <span className="text-2xl font-black text-emerald-600">{presentCount} يوماً</span>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-1">أيام الغياب</span>
                  <span className="text-2xl font-black text-rose-600">{absentCount} يوماً</span>
                </div>
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-200">
                  <XCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-1">نسبة الانضباط بالحضور</span>
                  <span className={`text-2xl font-black ${attendanceRate >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    %{attendanceRate}
                  </span>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-200">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Assessment Timeline Overview */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-600" />
                <span>حالة التقييمات المنجزة لفصل الطالب ({selectedTerm === 'term1' ? 'الفصل الأول' : 'الفصل الثاني'})</span>
              </h3>

              {termRecords.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600">لا توجد تقييمات مسجلة بعد لهذا الفصل الدراسي</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {termRecords.map((rec) => (
                    <div key={rec.id} className="p-3 bg-sky-50/60 rounded-2xl border border-sky-200 text-center space-y-1">
                      <span className="text-[10px] font-black text-sky-700 bg-sky-200/60 px-2 py-0.5 rounded-full inline-block">
                        تقييم {rec.assess_num}
                      </span>
                      <p className="text-xs font-black text-slate-800">{rec.assess_date}</p>
                      <p className="text-[10px] text-slate-500 font-bold truncate">{rec.notes || 'موثق ومعتمد'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Teacher Notifications & Alerts */}
        {activeTab === 'alerts' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">تنبيهات وإشعارات المعلم الموجهة للطالب</h3>
                  <p className="text-xs text-slate-500 font-bold">تنبيهات مواعيد التقييمات القادمة والإعلانات المدرسية (مزامنة فورية مع Firestore)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshReminders}
                  disabled={refreshingReminders}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-black border border-amber-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingReminders ? 'animate-spin text-amber-600' : ''}`} />
                  <span>تحديث البيانات</span>
                </button>

                <span className="px-3 py-1.5 bg-amber-100 text-amber-900 rounded-xl text-xs font-black border border-amber-200">
                  {teacherReminders.length} تنبيهات مسجلة
                </span>
              </div>
            </div>

            {teacherReminders.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-black text-slate-800">لا توجد تنبيهات عاجلة حالياً</h4>
                <p className="text-xs text-slate-500 font-bold">
                  سيتم إدراج أي إشعار أو تنبيه جديد يرسله معلم المادة (أ. {teacher.name}) في هذه الصفحة فور إصداره.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {teacherReminders.map((rem) => (
                  <div 
                    key={rem.id}
                    className="p-4 bg-amber-50/60 rounded-2xl border-2 border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-amber-950">{rem.title}</h4>
                          <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-2 py-0.5 rounded-md">
                            تاريخ: {rem.reminderDate}
                          </span>
                        </div>
                        {rem.description && (
                          <p className="text-xs text-amber-900/90 font-bold leading-relaxed">{rem.description}</p>
                        )}
                        <p className="text-[10px] text-amber-700/80 font-bold">
                          الموجّه إلى: {rem.targetType === 'general' ? 'جميع الطلاب' : rem.targetName || 'الفصل'}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-white text-amber-900 rounded-xl text-xs font-black border border-amber-300 self-start sm:self-auto shadow-xs">
                      تنبيه نشط 🔔
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Contact Teacher directly (In-App Messaging & External) */}
        {activeTab === 'contact' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">المراسلة المباشرة والتواصل بداخل التطبيق</h3>
                  <p className="text-xs text-slate-500 font-bold">تواصل مباشر ومحفوظ مع أ. {teacher.name || 'معلم المادة'}</p>
                </div>
              </div>

              <button
                onClick={loadChatMessages}
                disabled={loadingChat}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black border border-emerald-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingChat ? 'animate-spin text-emerald-600' : ''}`} />
                <span>تحديث المحادثة</span>
              </button>
            </div>

            {/* Teacher Info Card */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 p-4 rounded-2xl border border-emerald-200/80 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div>
                <span className="text-[10px] text-emerald-800 font-black block">معلم المادة:</span>
                <h4 className="text-sm font-black text-slate-900">أ. {teacher.name || 'معلم الفصل'}</h4>
                <p className="text-xs text-slate-600 font-bold">{teacher.subject || 'المادة الدراسية'}</p>
              </div>

              <div>
                <span className="text-[10px] text-emerald-800 font-black block">المدرسة والمركز:</span>
                <p className="text-xs font-black text-slate-800">{teacher.school || 'المدرسة الابتدائية'}</p>
                <p className="text-[10px] text-slate-500 font-bold">{teacher.educationalSector || 'الإدارة التعليمية'}</p>
              </div>

              <div>
                <span className="text-[10px] text-emerald-800 font-black block">حالة التواصل بداخل التطبيق:</span>
                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  نشط ومحفوظ بـ Firestore
                </span>
              </div>
            </div>

            {/* In-App Interactive Chat Box */}
            <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 text-white space-y-4 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <h4 className="text-xs sm:text-sm font-black text-white">
                    صندوق المحادثة المباشرة مع المعلم (In-App Chat)
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  {chatMessages.length} رسائل
                </span>
              </div>

              {/* Chat Thread Container */}
              <div className="bg-slate-950/70 rounded-2xl p-4 min-h-[200px] max-h-[350px] overflow-y-auto space-y-3 border border-slate-800">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-600" />
                    <p className="text-xs font-black text-slate-400">لا توجد رسائل سابقة بداخل التطبيق</p>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      اكتب استفسارك أو ملاحظتك في المربع أدناه وسيتلقاها معلم المادة مباشرة في لوحته بداخل التطبيق!
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isStudent = msg.sender === 'student';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${
                            isStudent
                              ? 'bg-emerald-600 text-white rounded-tl-none'
                              : 'bg-indigo-600 text-white rounded-tr-none'
                          }`}
                        >
                          <div className="text-[10px] opacity-80 mb-1 flex items-center justify-between gap-3 font-black">
                            <span>{isStudent ? 'أنت (الطالب)' : `أ. ${teacher.name}`}</span>
                            <span className="font-mono text-[9px]">
                              {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold px-1 mt-0.5">
                          {new Date(msg.timestamp).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Composer Inside App */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <textarea
                    value={inAppMessageText}
                    onChange={(e) => setInAppMessageText(e.target.value)}
                    rows={2}
                    placeholder="اكتب استفسارك أو ملاحظتك للمعلم هنا لإرسالها بداخل التطبيق..."
                    className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />

                  <button
                    onClick={handleSendInAppMessage}
                    disabled={isSendingInAppMsg || !inAppMessageText.trim()}
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0 h-full"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال داخل التطبيق</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold">
                  🔒 يتم حفظ المحادثة بداخل قاعدة بيانات Firestore وتكون مرئية فقط للمعلم والطالب.
                </p>
              </div>
            </div>

            {/* Optional External Contact Buttons (WhatsApp & Phone) */}
            <div className="pt-2 space-y-3 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-800">
                أو التواصل خارج التطبيق عبر الواتساب أو الهاتف:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleSendWhatsAppToTeacher}
                  className="p-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>فتح تطبيق الواتساب (WhatsApp)</span>
                </button>

                {teacher.phone ? (
                  <a
                    href={`tel:${teacher.phone}`}
                    className="p-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all text-center shadow-2xs"
                  >
                    <Phone className="w-4 h-4 text-indigo-600" />
                    <span>اتصال هاتفي مباشر</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="p-3.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Phone className="w-4 h-4" />
                    <span>لا يوجد رقم جوال مسجل للمعلم</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Attendance Details */}
        {activeTab === 'attendance' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>تفاصيل سجل الحضور والغياب اليومي</span>
            </h3>

            {attendanceRecords.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">سجل الانضباط نظيف تماماً ولم تسجل أي حالات غياب</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {attendanceRecords.map((att) => (
                  <div key={att.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        att.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                        att.status === 'absent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {att.status === 'present' ? <CheckCircle2 className="w-5 h-5" /> :
                         att.status === 'absent' ? <XCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800">
                          {att.status === 'present' ? 'حاضر' : att.status === 'absent' ? 'غائب' : 'غائب بعذر'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">{att.updated_at || 'تاريخ التسجيل'}</p>
                      </div>
                    </div>

                    {att.notes && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-xl font-bold">
                        {att.notes}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Detailed Assessments */}
        {activeTab === 'assessments' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>قائمة تقييمات المادة الموثقة</span>
            </h3>

            <div className="space-y-3">
              {termRecords.map((r) => (
                <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0">
                      {r.assess_num}
                    </div>
                    <div>
                      <h4 className="font-black text-xs sm:text-sm text-slate-800">
                        التقييم الأسبوعي رقم {r.assess_num} - {r.grade} (فصل {r.class_num})
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold">
                        تاريخ التقييم: {r.assess_date} | النموذج: ({r.model_form || 'أ'})
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold text-center self-start sm:self-auto">
                    تمت المعاينة والتوثيق
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Teacher Notes & Recommendations */}
        {activeTab === 'notes' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-rose-500" />
              <span>توصيات وملاحظات معلم المادة للتطوير</span>
            </h3>

            <div className="p-5 bg-gradient-to-r from-sky-50 to-indigo-50/50 rounded-2xl border border-sky-200/80 space-y-3">
              <div className="flex items-center gap-2 text-sky-900 font-black text-xs">
                <Bell className="w-4 h-4 text-sky-600" />
                <span>إرشادات المتابعة اليومية من الأستاذ/ {teacher.name}:</span>
              </div>
              <ul className="text-xs text-slate-700 font-bold space-y-2 list-disc list-inside leading-relaxed">
                <li>الحرص على إحضار كشكول التقييمات والمتابعة اليومية داخل الفصل.</li>
                <li>حل التقييمات والواجبات الأسبوعية في المواعيد المحددة دون تأخير.</li>
                <li>التواصل المستمر مع معلم المادة عبر جوال ولي الأمر عند الحاجة لأي استفسار.</li>
              </ul>
            </div>
          </div>
        )}

      </main>

      {/* Floating Bottom Bar for Student Portal with Clear Logout & Messaging */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-black text-xs">
              {studentInfo?.name?.charAt(0) || 'ط'}
            </div>
            <span className="text-xs font-black text-slate-800 truncate max-w-[150px] sm:max-w-none">
              {studentInfo?.name || 'حساب الطالب'} ({studentCode})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsChatModalOpen(true);
                loadChatMessages();
              }}
              className="message-icon-trigger px-3 py-2 bg-emerald-600 hover:bg-slate-100 hover:text-slate-900 hover:scale-105 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>رسائل المعلم</span>
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Direct Messaging Popup Modal */}
      {isChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 dir-rtl animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black flex items-center gap-2">
                    <span>المراسلة المباشرة مع أ. {teacher.name || 'المعلم'}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">
                    تواصل لحظي ومباشر محفوظ بـ Firestore
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadChatMessages}
                  disabled={loadingChat}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                  title="تحديث الرسائل"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingChat ? 'animate-spin text-emerald-400' : ''}`} />
                </button>
                <button
                  onClick={() => setIsChatModalOpen(false)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-[220px]">
              {chatMessages.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-bold space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                  <p>لا توجد رسائل سابقة. أرسل استفسارك لمعلم المادة هنا!</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isStudent = msg.sender === 'student';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStudent ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs font-bold leading-relaxed shadow-2xs ${
                          isStudent
                            ? 'bg-emerald-600 text-white rounded-tr-none'
                            : 'bg-slate-900 text-white rounded-tl-none'
                        }`}
                      >
                        <div className="text-[9px] opacity-80 mb-1 flex items-center justify-between gap-3 font-black">
                          <span>{isStudent ? 'أنت (الطالب)' : `أ. ${teacher.name}`}</span>
                          <span className="font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Input */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inAppMessageText}
                  onChange={(e) => setInAppMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendInAppMessage()}
                  placeholder="اكتب استفسارك المباشر هنا..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <button
                  onClick={handleSendInAppMessage}
                  disabled={isSendingInAppMsg || !inAppMessageText.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

