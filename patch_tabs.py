import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

old_tabs = """          {/* Center / Bottom: Navigation Tabs Bar */}
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

            {/* Tab 4: Reports */}
            <button
              onClick={() => onSelectTab('reports')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-white text-rose-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5 text-rose-600" />
              <span>تقارير الطلاب</span>
            </button>
          </div>"""

new_tabs = """          {/* Center / Bottom: Navigation Tabs Bar */}
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

if old_tabs in content:
    content = content.replace(old_tabs, new_tabs)
    with open('src/components/Navbar.tsx', 'w') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Could not find old tabs to replace")

