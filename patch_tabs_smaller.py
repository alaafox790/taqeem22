import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

old_tabs = """          {/* Center / Bottom: Navigation Tabs Bar */}
          <div className="flex items-center justify-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            {/* Tab 1: Assessments */}
            <button
              onClick={() => onSelectTab('assessments')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'assessments'
                  ? 'bg-white text-emerald-800 shadow-md border border-emerald-100 ring-1 ring-emerald-50/50 scale-105'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <LayoutGrid className={`w-5 h-5 transition-colors ${activeTab === 'assessments' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>التقييمات</span>
            </button>

            {/* Tab 2: Students Roster */}
            <button
              onClick={() => onSelectTab('students')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-white text-teal-800 shadow-md border border-teal-100 ring-1 ring-teal-50/50 scale-105'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <Users className={`w-5 h-5 transition-colors ${activeTab === 'students' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>سجل الطلاب</span>
            </button>

            {/* Tab 3: Class Stats */}
            <button
              onClick={() => onSelectTab('stats')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-white text-indigo-800 shadow-md border border-indigo-100 ring-1 ring-indigo-50/50 scale-105'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <BarChart3 className={`w-5 h-5 transition-colors ${activeTab === 'stats' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>الإحصائيات</span>
            </button>

            {/* Tab 4: Reports */}
            <button
              onClick={() => onSelectTab('reports')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-white text-rose-800 shadow-md border border-rose-100 ring-1 ring-rose-50/50 scale-105'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <ScrollText className={`w-5 h-5 transition-colors ${activeTab === 'reports' ? 'text-rose-600' : 'text-slate-400'}`} />
              <span>تقارير الطلاب</span>
            </button>
          </div>"""

new_tabs = """          {/* Center / Bottom: Navigation Tabs Bar */}
          <div className="flex items-center justify-between md:justify-center gap-0.5 sm:gap-1.5 w-full md:w-auto bg-slate-50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Tab 1: Assessments */}
            <button
              onClick={() => onSelectTab('assessments')}
              className={`flex-1 md:flex-none px-1.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 shrink-0 cursor-pointer ${
                activeTab === 'assessments'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100 ring-1 ring-emerald-50/50 sm:scale-105'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <LayoutGrid className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-colors ${activeTab === 'assessments' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">التقييمات</span>
            </button>

            {/* Tab 2: Students Roster */}
            <button
              onClick={() => onSelectTab('students')}
              className={`flex-1 md:flex-none px-1.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 shrink-0 cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-white text-teal-800 shadow-sm border border-teal-100 ring-1 ring-teal-50/50 sm:scale-105'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <Users className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-colors ${activeTab === 'students' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">سجل الطلاب</span>
            </button>

            {/* Tab 3: Class Stats */}
            <button
              onClick={() => onSelectTab('stats')}
              className={`flex-1 md:flex-none px-1.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 shrink-0 cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-white text-indigo-800 shadow-sm border border-indigo-100 ring-1 ring-indigo-50/50 sm:scale-105'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <BarChart3 className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-colors ${activeTab === 'stats' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">الإحصائيات</span>
            </button>

            {/* Tab 4: Reports */}
            <button
              onClick={() => onSelectTab('reports')}
              className={`flex-1 md:flex-none px-1.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 shrink-0 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-white text-rose-800 shadow-sm border border-rose-100 ring-1 ring-rose-50/50 sm:scale-105'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <ScrollText className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-colors ${activeTab === 'reports' ? 'text-rose-600' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">التقارير</span>
            </button>
          </div>"""

if old_tabs in content:
    content = content.replace(old_tabs, new_tabs)
    with open('src/components/Navbar.tsx', 'w') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Could not find old tabs to replace")

