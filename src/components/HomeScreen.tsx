import React, { useState, useEffect } from 'react';
import { Award, GraduationCap, BarChart3, Search, Shield,
  MessageCircle, LogOut, Settings, AlertTriangle, CheckCircle2, UserCheck, Lock, Calendar, BellRing, Check, User, Users, Plus, ScrollText, FolderArchive, MessageSquare } from 'lucide-react';
import { AppTab, TeacherProfile, AssessmentRecord, MonthInfo, TermId, Reminder } from '../types';
import { MONTHS_DATA } from '../lib/constants';
import { motion, AnimatePresence } from 'motion/react';
import { isTeacherProfileComplete } from '../lib/validation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LateAssessments } from './LateAssessments';
import { InstallButton } from './InstallButton';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  teacher: TeacherProfile;
  onOpenProfile: () => void;
  onOpenArchive?: () => void;
  onOpenStudentMessages?: () => void;
  records: AssessmentRecord[];
  selectedTerm: TermId;
  academicYear: string;
  onOpenAssessment: (month: MonthInfo, assessNum: number, termId: TermId) => void;
  onLogout?: () => void;
  reminders: Reminder[];
  onOpenRemindersModal: () => void;
  onToggleReminderComplete: (id: string) => void;
  isInstallable?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  teacher,
  onOpenProfile,
  onOpenArchive,
  onOpenStudentMessages,
  records,
  selectedTerm,
  academicYear,
  onOpenAssessment,
  onLogout,
  reminders,
  onOpenRemindersModal,
  onToggleReminderComplete
}) => {
  const [showAltText, setShowAltText] = useState(false);
  const [showIncompleteNotice, setShowIncompleteNotice] = useState(false);

  const isComplete = isTeacherProfileComplete(teacher);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowAltText(prev => !prev);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleCardClick = (targetTab: AppTab) => {
    if (!isComplete) {
      setShowIncompleteNotice(true);
      onOpenProfile();
      return;
    }
    onNavigate(targetTab);
  };

  const currentMonthNumber = new Date().getMonth() + 1;
  let activeMonth = MONTHS_DATA.find(m => m.monthNumber === currentMonthNumber);
  if (!activeMonth) {
    activeMonth = MONTHS_DATA.find(m => m.termId === selectedTerm);
  }
  
  const currentMonthRecords = records.filter(r => activeMonth && r.month_id === activeMonth.id);
  const assessmentsCount = currentMonthRecords.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAssessmentsCount = records.filter(r => r.assess_date === todayStr || (r.created_at && r.created_at.startsWith(todayStr))).length;
  const activeReminders = reminders.filter(r => !r.isCompleted && r.reminderDate <= todayStr);

  const classesList = teacher.classesTaught ? teacher.classesTaught.split(/[,،]/).map(s => s.trim()).filter(Boolean) : ['1/1', '1/2'];
  const totalClassesCount = Math.max(1, classesList.length);
  const assessmentsInActiveMonth = activeMonth ? activeMonth.assessments.length : 4;
  const totalExpectedMonthAssessments = totalClassesCount * assessmentsInActiveMonth;
  const recordedMonthAssessments = currentMonthRecords.length;
  const remainingMonthAssessments = Math.max(0, totalExpectedMonthAssessments - recordedMonthAssessments);

  const chartData = activeMonth ? activeMonth.assessments.map(assessNum => {
    const count = currentMonthRecords.filter(r => r.assess_num === assessNum).length;
    return {
      name: `ت ${assessNum}`,
      المسجل: count,
    };
  }) : [];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-start p-3 sm:p-4 space-y-4 sm:space-y-6">
      {/* Top Bar for Profile and Logout */}
      <div className="w-full max-w-2xl flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-xl shadow-sm border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
              title="تسجيل الخروج والعودة لشاشة الدخول"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          )}
          {isInstallable && <InstallButton />}
        </div>

        <button
          onClick={onOpenProfile}
          className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/80 backdrop-blur-xl shadow-lg transition-all active:scale-95 text-slate-700 cursor-pointer ${
            !isComplete ? 'border-2 border-amber-400 ring-2 ring-amber-300/50' : 'border border-white'
          }`}
          title="تعديل بيانات المعلم"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-extrabold text-xs flex items-center justify-center">
            {teacher.name.charAt(0) || 'م'}
          </div>
          <div className="text-right hidden sm:block leading-tight">
            <div className="text-xs font-bold text-slate-800 max-w-[130px] truncate">
              {teacher.name}
            </div>
            <div className="text-xs text-slate-500 font-medium truncate max-w-[130px]">
              {teacher.subject}
            </div>
          </div>
          <Settings className="w-5 h-5 text-indigo-500" />
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-2.5 flex flex-col items-center relative w-full max-w-2xl">
        {/* Glow blobs for book palette atmosphere */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
        <div className="absolute top-20 left-0 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
        <div className="absolute -bottom-20 left-20 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative inline-flex flex-col items-center justify-center px-8 py-5 sm:px-12 sm:py-6 rounded-3xl bg-white/90 backdrop-blur-2xl border border-sky-100 shadow-[0_15px_40px_rgba(15,43,92,0.12)] overflow-hidden w-full"
        >
          {/* Shiny sweep effect */}
          <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_3.5s_infinite] bg-gradient-to-r from-transparent via-amber-200/40 to-transparent skew-x-12 w-[150%]"></div>
          
          <h1 className="relative text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#0f2b5c] via-[#059669] to-[#0f2b5c] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(15,43,92,0.2)] font-serif tracking-tight">
            تقييماتي
          </h1>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#0f2b5c] via-[#059669] to-[#0f2b5c] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 tracking-wide">
              {teacher.educationalStage || 'المرحلة الابتدائية'}
            </span>

          </div>

          <div className="w-full border-t border-sky-100 mt-2.5 pt-1.5 min-h-[28px] flex items-center justify-center cursor-pointer select-none" onClick={() => setShowAltText(prev => !prev)}>
            <AnimatePresence mode="wait">
              {showAltText ? (
                <motion.p
                  key="alt-text"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.4 }}
                  className="text-xs sm:text-sm font-bold text-rose-600 tracking-widest text-center"
                >
                  مدمرة حياتي
                </motion.p>
              ) : (
                <motion.p
                  key="main-text"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.4 }}
                  className="text-xs sm:text-sm font-extrabold text-[#0f2b5c]/90 tracking-widest text-center"
                >
                  منصة التقييمات المدرسية الشاملة
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Main Feature Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-2xl px-1 sm:px-0">
        {/* Assessments */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => handleCardClick('assessments')}
          className="group relative bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center gap-2 sm:gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {!isComplete && (
            <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
              <Lock className="w-3 h-3" />
            </div>
          )}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 text-white shadow-lg shadow-rose-400/30 flex items-center justify-center transition-all group-hover:shadow-rose-400/50 group-hover:scale-110 duration-300">
            <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-xs sm:text-base font-bold text-slate-700 group-hover:text-rose-500 transition-colors">التقييمات</span>
        </motion.button>

        {/* Students */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleCardClick('students')}
          className="group relative bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center gap-2 sm:gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {!isComplete && (
            <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
              <Lock className="w-3 h-3" />
            </div>
          )}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-400/30 flex items-center justify-center transition-all group-hover:shadow-blue-400/50 group-hover:scale-110 duration-300">
            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-xs sm:text-base font-bold text-slate-700 group-hover:text-blue-500 transition-colors">الطلاب</span>
        </motion.button>

        {/* Custom Reminders - Dedicated Icon Card */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => {
            if (!isComplete) {
              setShowIncompleteNotice(true);
              onOpenProfile();
              return;
            }
            onOpenRemindersModal();
          }}
          className="group relative bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center gap-2 sm:gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {!isComplete ? (
            <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
              <Lock className="w-3 h-3" />
            </div>
          ) : activeReminders.length > 0 ? (
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-xs shadow-xs animate-pulse">
              {activeReminders.length} تنبيه
            </div>
          ) : null}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-400/30 flex items-center justify-center transition-all group-hover:shadow-amber-400/50 group-hover:scale-110 duration-300">
            <BellRing className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-xs sm:text-base font-bold text-slate-700 group-hover:text-amber-600 transition-colors">إدارة التنبيهات</span>
        </motion.button>

        {/* Archive - Dedicated Icon Card */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          onClick={() => {
            if (!isComplete) {
              setShowIncompleteNotice(true);
              onOpenProfile();
              return;
            }
            if (onOpenArchive) onOpenArchive();
          }}
          className="group relative bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center gap-2 sm:gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {!isComplete && (
            <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
              <Lock className="w-3 h-3" />
            </div>
          )}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-500/30 flex items-center justify-center transition-all group-hover:shadow-amber-500/50 group-hover:scale-110 duration-300">
            <FolderArchive className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-xs sm:text-base font-bold text-slate-700 group-hover:text-amber-700 transition-colors">أرشيف الفصول</span>
        </motion.button>

        {/* Reports */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => handleCardClick('reports')}
          className="group relative bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center gap-2 sm:gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {!isComplete && (
            <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
              <Lock className="w-3 h-3" />
            </div>
          )}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 flex items-center justify-center transition-all group-hover:shadow-violet-500/50 group-hover:scale-110 duration-300">
            <ScrollText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-xs sm:text-base font-bold text-slate-700 group-hover:text-violet-600 transition-colors">التقارير</span>
        </motion.button>

        {/* Stats */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => handleCardClick('stats')}
          className="group relative bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center gap-2 sm:gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {!isComplete && (
            <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
              <Lock className="w-3 h-3" />
            </div>
          )}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 text-white shadow-lg shadow-emerald-400/30 flex items-center justify-center transition-all group-hover:shadow-emerald-400/50 group-hover:scale-110 duration-300">
            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-xs sm:text-base font-bold text-slate-700 group-hover:text-emerald-500 transition-colors">الإحصاء</span>
        </motion.button>

        {/* Search */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => handleCardClick('search')}
          className="group relative bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center gap-2 sm:gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {!isComplete && (
            <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
              <Lock className="w-3 h-3" />
            </div>
          )}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-400 text-white shadow-lg shadow-violet-400/30 flex items-center justify-center transition-all group-hover:shadow-violet-400/50 group-hover:scale-110 duration-300">
            <Search className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-xs sm:text-base font-bold text-slate-700 group-hover:text-violet-500 transition-colors">البحث</span>
        </motion.button>

        {/* Student Messages - Dedicated Feature Card */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55 }}
          onClick={() => {
            if (!isComplete) {
              setShowIncompleteNotice(true);
              onOpenProfile();
              return;
            }
            if (onOpenStudentMessages) onOpenStudentMessages();
          }}
          className="group relative bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center gap-2 sm:gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {!isComplete && (
            <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
              <Lock className="w-3 h-3" />
            </div>
          )}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all group-hover:shadow-emerald-500/50 group-hover:scale-110 duration-300">
            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-xs sm:text-base font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">رسائل الطلاب</span>
        </motion.button>

        {/* Admin Dashboard */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => handleCardClick('admin')}
          className="group relative col-span-2 sm:col-span-1 bg-gradient-to-r from-[#0f2b5c] via-[#113264] to-[#059669] rounded-3xl sm:rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-[#0f2b5c]/25 hover:shadow-2xl hover:shadow-[#0f2b5c]/35 transition-all duration-300 active:scale-95 border border-emerald-400/30 cursor-pointer"
        >
          {!isComplete && (
            <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-amber-400/30 border border-amber-300 flex items-center justify-center text-amber-300 shadow-xs">
              <Lock className="w-3 h-3" />
            </div>
          )}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center transition-colors shrink-0 border border-white/20">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-xs sm:text-base font-bold text-white transition-colors">الإدارة المدرسية</span>
        </motion.button>
      </div>

      {/* Footer / Tech Support */}
      <div className="flex flex-col items-center gap-4 pt-6 pb-2 w-full mt-auto">
        <a 
          href="https://wa.me/201030302005" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gradient-to-r from-[#059669] to-[#0f2b5c] text-white px-6 py-3 rounded-full shadow-lg shadow-emerald-700/25 hover:shadow-emerald-700/40 transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <MessageCircle className="w-5 h-5 text-amber-300" />
          <span className="font-bold text-sm">الدعم الفني</span>
        </a>
        <div className="text-sm font-bold text-[#0f2b5c] tracking-wide">
          إعداد وتصميم / علاء الوكيل
        </div>
      </div>
    </div>
  );
};

