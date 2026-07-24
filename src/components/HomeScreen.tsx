import React, { useState, useEffect } from 'react';
import { Award, GraduationCap, BarChart3, Search, Shield,
  MessageCircle, LogOut, Settings, AlertTriangle, CheckCircle2, UserCheck, Lock } from 'lucide-react';
import { AppTab, TeacherProfile, AssessmentRecord, MonthInfo, TermId } from '../types';
import { MONTHS_DATA } from '../lib/constants';
import { motion, AnimatePresence } from 'motion/react';
import { isTeacherProfileComplete } from '../lib/validation';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  teacher: TeacherProfile;
  onOpenProfile: () => void;
  records: AssessmentRecord[];
  selectedTerm: TermId;
  academicYear: string;
  onOpenAssessment: (month: MonthInfo, assessNum: number, termId: TermId) => void;
  onLogout?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, teacher, onOpenProfile, records, selectedTerm, academicYear, onOpenAssessment, onLogout }) => {
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

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-start p-3 sm:p-4 space-y-4 sm:space-y-6">
      {/* Top Bar for Settings and Logout */}
      <div className="w-full max-w-2xl flex justify-between items-center gap-2">
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
            <div className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
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
          
          <h1 className="relative text-5xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-[#0f2b5c] via-[#059669] to-[#0f2b5c] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(15,43,92,0.2)] font-serif tracking-tight">
            تقييماتي
          </h1>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#0f2b5c] via-[#059669] to-[#0f2b5c] text-white text-xs sm:text-sm font-black shadow-md shadow-emerald-700/20 tracking-wide">
              {teacher.educationalStage || 'المرحلة الإعدادية'}
            </span>
            {teacher.classesTaught && (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200/80 text-xs font-bold shadow-xs">
                فصول المعلم: {teacher.classesTaught}
              </span>
            )}
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
                  className="text-xs sm:text-sm font-black text-rose-600 tracking-widest text-center"
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

      {/* Mandatory Registration Notice Banner */}
      {!isComplete ? (
        <div className="w-full max-w-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shrink-0 mt-0.5 shadow-md shadow-amber-500/30">
              <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-amber-950 flex items-center gap-1.5">
                <span>⚠️ تنبيه إجباري: تسجيل كافة البيانات قبل العمل</span>
              </h3>
              <p className="text-xs sm:text-sm font-bold text-amber-900 leading-relaxed mt-1">
                يلزم تسجيل وتسجيل كافة بيانات المعلم وأرقام هواتف (المدير، الوكيل، والمشرف) لتفعيل أزرار وأيقونات التطبيق.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenProfile}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-600 via-emerald-600 to-amber-600 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
          >
            <UserCheck className="w-5 h-5 text-amber-200" />
            <span>تسجيل البيانات الآن ✏️</span>
          </button>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-emerald-50/90 border border-emerald-200/80 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2 text-emerald-900 text-xs sm:text-sm font-black shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>جميع بيانات المعلم والقيادة المدرسية مسجلة وموثقة (جميع الأيقونات مفعلة)</span>
          </div>
          <button
            onClick={onOpenProfile}
            className="text-emerald-700 underline hover:text-emerald-900 text-xs font-black cursor-pointer shrink-0"
          >
            تعديل البيانات
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full max-w-2xl px-1 sm:px-0">
        {/* Assessments */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleCardClick('assessments')}
          className="group relative bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {!isComplete && (
            <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
              <Lock className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 text-white shadow-lg shadow-rose-400/30 flex items-center justify-center transition-all group-hover:shadow-rose-400/50 group-hover:scale-110 duration-300">
            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <span className="text-sm sm:text-lg font-black text-slate-700 group-hover:text-rose-500 transition-colors">التقييمات</span>
        </motion.button>

        {/* Students */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => handleCardClick('students')}
          className="group relative bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {!isComplete && (
            <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
              <Lock className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-400/30 flex items-center justify-center transition-all group-hover:shadow-blue-400/50 group-hover:scale-110 duration-300">
            <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <span className="text-sm sm:text-lg font-black text-slate-700 group-hover:text-blue-500 transition-colors">الطلاب</span>
        </motion.button>

        {/* Stats */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => handleCardClick('stats')}
          className="group relative bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {!isComplete && (
            <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
              <Lock className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 text-white shadow-lg shadow-emerald-400/30 flex items-center justify-center transition-all group-hover:shadow-emerald-400/50 group-hover:scale-110 duration-300">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <span className="text-sm sm:text-lg font-black text-slate-700 group-hover:text-emerald-500 transition-colors">الإحصاء</span>
        </motion.button>

        {/* Search */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => handleCardClick('search')}
          className="group relative bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {!isComplete && (
            <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
              <Lock className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-400 text-white shadow-lg shadow-violet-400/30 flex items-center justify-center transition-all group-hover:shadow-violet-400/50 group-hover:scale-110 duration-300">
            <Search className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <span className="text-sm sm:text-lg font-black text-slate-700 group-hover:text-violet-500 transition-colors">البحث</span>
        </motion.button>

        {/* Admin Dashboard */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => handleCardClick('admin')}
          className="group relative col-span-2 bg-gradient-to-r from-[#0f2b5c] via-[#113264] to-[#059669] rounded-3xl sm:rounded-[2rem] p-5 sm:p-6 flex flex-row items-center justify-start sm:justify-center gap-4 sm:gap-6 shadow-xl shadow-[#0f2b5c]/25 hover:shadow-2xl hover:shadow-[#0f2b5c]/35 transition-all duration-300 active:scale-95 border border-emerald-400/30 cursor-pointer"
        >
          {!isComplete && (
            <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-amber-400/30 border border-amber-300 flex items-center justify-center text-amber-300 shadow-xs">
              <Lock className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center transition-colors shrink-0 border border-white/20">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="text-right">
            <span className="block text-base sm:text-2xl font-black text-white mb-0.5">الإدارة المدرسية</span>
            <span className="block text-[10px] sm:text-sm text-emerald-100 font-medium">دخول المدير، الوكيل، والمشرف برقم الهاتف</span>
          </div>
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
        <div className="text-sm font-black text-[#0f2b5c] tracking-wide">
          إعداد وتصميم / علاء الوكيل
        </div>
      </div>
    </div>
  );
};

