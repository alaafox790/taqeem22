import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

old_search = """        {/* Search */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => onNavigate('search')}
          className="group bg-white rounded-3xl p-8 flex flex-col items-center justify-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center mb-2 transition-colors">
            <Search className="w-10 h-10 text-amber-500 group-hover:text-amber-600 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-xl font-bold text-[#1e3a8a]">البحث</span>
        </motion.button>
      </div>"""

new_admin = """        {/* Search */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => onNavigate('search')}
          className="group bg-white rounded-3xl p-8 flex flex-col items-center justify-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center mb-2 transition-colors">
            <Search className="w-10 h-10 text-amber-500 group-hover:text-amber-600 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-xl font-bold text-[#1e3a8a]">البحث</span>
        </motion.button>

        {/* Admin Dashboard */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => onNavigate('admin')}
          className="group col-span-2 md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-center gap-6 shadow-md hover:shadow-lg transition-all active:scale-95 border border-slate-700"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center transition-colors">
            <Shield className="w-10 h-10 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="text-center sm:text-right">
            <span className="block text-2xl font-black text-white mb-1">الإدارة المدرسية</span>
            <span className="block text-sm text-slate-400 font-medium">دخول المدير، الوكيل، ومشرف المادة</span>
          </div>
        </motion.button>
      </div>"""
content = content.replace(old_search, new_admin)
content = content.replace("import { Award, GraduationCap, BarChart3, Search } from 'lucide-react';", "import { Award, GraduationCap, BarChart3, Search, Shield } from 'lucide-react';")

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
