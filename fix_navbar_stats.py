import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

old_tab3 = """            {/* Tab 3: Class Stats */}
            
          </div>"""

new_tab3 = """            {/* Tab 3: Class Stats */}
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
          </div>"""
content = content.replace(old_tab3, new_tab3)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
