import React from 'react';
import {
  Award,
  Database,
  GraduationCap,
  Settings,
  
  FileText,
  CheckCircle2,
  Users,
  BarChart3,
  LayoutGrid,
  Home
} from 'lucide-react';
import { TeacherProfile, AppTab } from '../types';

interface NavbarProps {
  teacher: TeacherProfile;
  totalRecordsCount: number;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenProfile: () => void;
  onOpenArchive: () => void;
  isFirebaseConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  teacher,
  totalRecordsCount,
  activeTab,
  onSelectTab,
  onOpenProfile,
  onOpenArchive,
  isFirebaseConnected = true,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs dir-rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Right side: Logo & Teacher Name */}
          <div className="flex items-center justify-between md:justify-start gap-3">
            <button 
              onClick={() => onSelectTab('home')}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-200"
              title="العودة للرئيسية"
            >
              <Home className="w-5 h-5" />
            </button>
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onSelectTab('home')}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-4 ring-emerald-50 shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                    سجل التقييمات المدرسية الأسبوعية
                  </h1>
                </div>
              </div>
            </div>

            {/* Teacher Info Button - Mobile & Desktop */}
            <button
              onClick={onOpenProfile}
              className="flex md:hidden items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all text-xs font-bold shrink-0"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-black text-[11px] flex items-center justify-center">
                {teacher.name.charAt(0) || 'م'}
              </div>
              <span className="max-w-[80px] truncate">{teacher.name}</span>
            </button>
          </div>

          {/* Center / Bottom: Navigation Tabs Bar */}
          <div className="flex items-center justify-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 overflow-x-auto">
            {/* Tab 1: Assessments */}
            <button
              onClick={() => onSelectTab('assessments')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'assessments'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
              <span>التقييمات</span>
            </button>

            {/* Tab 2: Students Roster */}
            <button
              onClick={() => onSelectTab('students')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-white text-teal-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>سجل الطلاب</span>
            </button>

            {/* Tab 3: Class Stats */}
            <button
              onClick={() => onSelectTab('stats')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-white text-indigo-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>الإحصائيات</span>
            </button>
          </div>

          {/* Left side: Teacher Profile & Status */}
          <div className="hidden md:flex items-center gap-2">
            
            {/* Teacher Info Pill */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xs border border-slate-800"
              title="اضغط لتعديل اسم المعلم والمادة"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center justify-center">
                {teacher.name.charAt(0) || 'م'}
              </div>
              <div className="text-right leading-tight">
                <div className="text-xs font-bold text-slate-100 max-w-[130px] truncate">
                  {teacher.name}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium truncate max-w-[130px]">
                  {teacher.subject} - {teacher.school}
                </div>
              </div>
              <Settings className="w-4 h-4 text-slate-400 mr-0.5" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

