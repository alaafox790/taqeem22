import React from 'react';
import {
  Award,
  Database,
  GraduationCap,
  Settings,
  ScrollText,
  
  FileText,
  CheckCircle2,
  Users,
  BarChart3,
  LayoutGrid,
  Home,
  Search,
  Shield,
  Wifi,
  WifiOff
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
          <div className="flex items-start justify-between md:justify-start gap-4">
            <button 
              onClick={() => onSelectTab('home')}
              className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-200 shrink-0 shadow-sm"
              title="العودة للرئيسية"
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 bg-indigo-50/50 pr-2 pl-4 py-1.5 rounded-2xl border border-indigo-100/50">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-100 shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-sm sm:text-lg font-black bg-gradient-to-l from-violet-600 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent leading-tight tracking-tight">
                  سجل التقييمات
                </h1>
                <span className="text-[10px] sm:text-xs font-extrabold text-slate-500 tracking-wide mt-0.5">
                  المدرسية الأسبوعية
                </span>
              </div>
            </div>

            {/* Mobile Connection Status Indicator */}
            <div 
              className={`flex md:hidden items-center justify-center w-8 h-8 rounded-lg border transition-colors ${
                isFirebaseConnected 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}
              title={isFirebaseConnected ? 'متصل بالإنترنت' : 'غير متصل - يتم الحفظ مؤقتاً'}
            >
              {isFirebaseConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>

            {/* Teacher Info Button - Mobile & Desktop */}
            <button
              onClick={onOpenProfile}
              className="flex md:hidden items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white transition-all text-xs font-bold shrink-0 shadow-sm border border-slate-200"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-extrabold text-[11px] flex items-center justify-center">
                {teacher.name.charAt(0) || 'م'}
              </div>
              <span className="max-w-[80px] truncate">{teacher.name}</span>
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Center / Bottom: Navigation Tabs Bar */}
          <div className="flex items-center justify-between md:justify-center gap-0.5 sm:gap-1.5 w-full md:w-auto bg-slate-50/80 backdrop-blur-md p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-inner overflow-hidden">
            {/* Tab 1: Assessments */}
            <button
              onClick={() => onSelectTab('assessments')}
              className={`flex-1 md:flex-none px-1.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 shrink-0 cursor-pointer ${
                activeTab === 'assessments'
                  ? 'bg-white text-rose-600 shadow-[0_4px_15px_rgb(225,29,72,0.1)] border border-rose-100 ring-1 ring-rose-50/50 sm:scale-105'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <LayoutGrid className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-colors ${activeTab === 'assessments' ? 'text-rose-500' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">التقييمات</span>
            </button>

            {/* Tab 2: Students Roster */}
            <button
              onClick={() => onSelectTab('students')}
              className={`flex-1 md:flex-none px-1.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 shrink-0 cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-white text-blue-600 shadow-[0_4px_15px_rgb(37,99,235,0.1)] border border-blue-100 ring-1 ring-blue-50/50 sm:scale-105'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <Users className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-colors ${activeTab === 'students' ? 'text-blue-500' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">سجل الطلاب</span>
            </button>

            {/* Tab 3: Class Stats */}
            <button
              onClick={() => onSelectTab('stats')}
              className={`flex-1 md:flex-none px-1.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 shrink-0 cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-white text-emerald-600 shadow-[0_4px_15px_rgb(16,185,129,0.1)] border border-emerald-100 ring-1 ring-emerald-50/50 sm:scale-105'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <BarChart3 className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-colors ${activeTab === 'stats' ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">الإحصائيات</span>
            </button>

            {/* Tab 4: Reports */}
            <button
              onClick={() => onSelectTab('reports')}
              className={`flex-1 md:flex-none px-1.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 shrink-0 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-white text-violet-600 shadow-[0_4px_15px_rgb(124,58,237,0.1)] border border-violet-100 ring-1 ring-violet-50/50 sm:scale-105'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <ScrollText className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-colors ${activeTab === 'reports' ? 'text-violet-500' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">التقارير</span>
            </button>
          </div>

          {/* Left side: Teacher Profile & Status */}
          <div className="hidden md:flex items-center gap-2">
            
            {/* Connection Status Indicator */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                isFirebaseConnected 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
              title={isFirebaseConnected ? 'متصل بالإنترنت' : 'غير متصل - يتم الحفظ مؤقتاً'}
            >
              {isFirebaseConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">متصل</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">غير متصل</span>
                </>
              )}
            </div>

            {/* Teacher Info Pill */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white transition-all cursor-pointer shadow-sm border border-slate-200"
              title="اضغط لتعديل اسم المعلم والمادة"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-extrabold text-xs flex items-center justify-center">
                {teacher.name.charAt(0) || 'م'}
              </div>
              <div className="text-right leading-tight">
                <div className="text-xs font-bold text-slate-700 max-w-[130px] truncate">
                  {teacher.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
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

