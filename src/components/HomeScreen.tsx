import React from 'react';
import { Award, GraduationCap, BarChart3, Search, Shield } from 'lucide-react';
import { AppTab, TeacherProfile, AssessmentRecord, MonthInfo, TermId } from '../types';
import { motion } from 'motion/react';
import { Settings } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  teacher: TeacherProfile;
  onOpenProfile: () => void;
  records: AssessmentRecord[];
  selectedTerm: TermId;
  academicYear: string;
  onOpenAssessment: (month: MonthInfo, assessNum: number, termId: TermId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, teacher, onOpenProfile, records, selectedTerm, academicYear, onOpenAssessment }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-start p-3 sm:p-4 space-y-4 sm:space-y-6">
      {/* Top Bar for Settings */}
      <div className="w-full max-w-2xl flex justify-end">
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/70 backdrop-blur-md shadow-sm border border-white/80 hover:bg-white transition-all active:scale-95 text-slate-700"
          title="تعديل بيانات المعلم"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center">
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
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-2 flex flex-col items-center relative">
        {/* Glow blobs to make the glass effect visible */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative inline-flex items-center justify-center px-6 py-3 sm:px-10 sm:py-5 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg overflow-hidden"
        >
          {/* Shiny sweep effect (auto running) */}
          <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12 w-[150%]"></div>
          <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-[#1e3a8a] to-[#0284c7] bg-clip-text text-transparent drop-shadow-md">
            تقييماتي
          </h1>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-slate-500 font-bold tracking-wider relative z-10"
        >
          مدمرة حياتي
        </motion.p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full max-w-2xl px-1 sm:px-0">
        {/* Assessments */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => onNavigate('assessments')}
          className="group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-center gap-1 sm:gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-indigo-50/80 group-hover:bg-indigo-100 flex items-center justify-center mb-1 transition-colors">
            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400 group-hover:text-indigo-500 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-sm sm:text-lg font-bold text-[#1e3a8a]">التقييمات</span>
        </motion.button>

        {/* Students */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => onNavigate('students')}
          className="group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-center gap-1 sm:gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-teal-50/80 group-hover:bg-teal-100 flex items-center justify-center mb-1 transition-colors">
            <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400 group-hover:text-teal-500 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-sm sm:text-lg font-bold text-[#1e3a8a]">الطلاب</span>
        </motion.button>

        {/* Stats */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => onNavigate('stats')}
          className="group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-center gap-1 sm:gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-sky-50/80 group-hover:bg-sky-100 flex items-center justify-center mb-1 transition-colors">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-sky-400 group-hover:text-sky-500 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-sm sm:text-lg font-bold text-[#1e3a8a]">الإحصاء</span>
        </motion.button>

        {/* Search */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => onNavigate('search')}
          className="group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-center gap-1 sm:gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-violet-50/80 group-hover:bg-violet-100 flex items-center justify-center mb-1 transition-colors">
            <Search className="w-6 h-6 sm:w-8 sm:h-8 text-violet-400 group-hover:text-violet-500 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-sm sm:text-lg font-bold text-[#1e3a8a]">البحث</span>
        </motion.button>

        {/* Admin Dashboard */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => onNavigate('admin')}
          className="group col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-row items-center justify-start sm:justify-center gap-3 sm:gap-5 shadow-md hover:shadow-lg transition-all active:scale-95 border border-slate-700"
        >
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-800/80 flex items-center justify-center transition-colors shrink-0">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="text-right">
            <span className="block text-base sm:text-2xl font-black text-white mb-0.5">الإدارة المدرسية</span>
            <span className="block text-[10px] sm:text-sm text-slate-400 font-medium">دخول المدير، الوكيل، والمشرف برقم الهاتف</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

