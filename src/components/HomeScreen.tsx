import React from 'react';
import { Award, GraduationCap, BarChart3 } from 'lucide-react';
import { AppTab } from '../types';
import { motion } from 'motion/react';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black text-[#1e3a8a]"
        >
          المنصة الذكية
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-600 font-bold"
        >
          بوابتك المتكاملة | 2
        </motion.p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl">
        {/* Assessments */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => onNavigate('assessments')}
          className="group bg-white rounded-3xl p-8 flex flex-col items-center justify-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center mb-2 transition-colors">
            <Award className="w-10 h-10 text-purple-500 group-hover:text-purple-600 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-xl font-bold text-[#1e3a8a]">التقييمات</span>
        </motion.button>

        {/* Students */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => onNavigate('students')}
          className="group bg-white rounded-3xl p-8 flex flex-col items-center justify-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-16 h-16 rounded-2xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center mb-2 transition-colors">
            <GraduationCap className="w-10 h-10 text-orange-500 group-hover:text-orange-600 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-xl font-bold text-[#1e3a8a]">الطلاب</span>
        </motion.button>

        {/* Stats */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => onNavigate('class_stats')}
          className="group bg-white rounded-3xl p-8 flex flex-col items-center justify-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center mb-2 transition-colors">
            <BarChart3 className="w-10 h-10 text-rose-500 group-hover:text-rose-600 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-xl font-bold text-[#1e3a8a]">الإحصاء</span>
        </motion.button>

      </div>
    </div>
  );
};
