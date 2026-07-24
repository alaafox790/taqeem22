import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

old_search = """            {/* Tab 5: Search */}
            <button
              onClick={() => onSelectTab('search')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-white text-amber-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-amber-600" />
              <span>البحث</span>
            </button>
          </div>"""

new_admin = """            {/* Tab 5: Search */}
            <button
              onClick={() => onSelectTab('search')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-white text-amber-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-amber-600" />
              <span>البحث</span>
            </button>
            
            {/* Tab 6: Admin */}
            <button
              onClick={() => onSelectTab('admin')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-emerald-400 shadow-xs border border-slate-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>الإدارة المدرسية</span>
            </button>
          </div>"""
content = content.replace(old_search, new_admin)
content = content.replace("  Search\n} from 'lucide-react';", "  Search,\n  Shield\n} from 'lucide-react';")

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
