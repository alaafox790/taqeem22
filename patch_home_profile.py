import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

old_interface = """import { AppTab } from '../types';
import { motion } from 'motion/react';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-12">
      {/* Header */}"""

new_interface = """import { AppTab, TeacherProfile } from '../types';
import { motion } from 'motion/react';
import { Settings } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  teacher: TeacherProfile;
  onOpenProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, teacher, onOpenProfile }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-12 relative">
      {/* Settings Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 text-slate-700"
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

      {/* Header */}"""

content = content.replace(old_interface, new_interface)

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
