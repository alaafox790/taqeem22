import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

# Update container spacing
content = content.replace(
    'className="min-h-[80vh] flex flex-col items-center justify-start p-4 sm:p-6 space-y-8 sm:space-y-12"',
    'className="min-h-[80vh] flex flex-col items-center justify-start p-3 sm:p-4 space-y-4 sm:space-y-6"'
)

# Top Bar
content = content.replace(
    'className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 backdrop-blur-md shadow-sm border border-white/80 hover:bg-white transition-all active:scale-95 text-slate-700"',
    'className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/70 backdrop-blur-md shadow-sm border border-white/80 hover:bg-white transition-all active:scale-95 text-slate-700"'
)

# Header spacing
content = content.replace(
    'className="text-center space-y-3 flex flex-col items-center relative"',
    'className="text-center space-y-2 flex flex-col items-center relative"'
)

content = content.replace(
    'className="relative inline-flex items-center justify-center px-10 py-5 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg overflow-hidden"',
    'className="relative inline-flex items-center justify-center px-6 py-3 sm:px-10 sm:py-5 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg overflow-hidden"'
)

content = content.replace(
    'className="relative text-5xl md:text-6xl font-black bg-gradient-to-r from-[#1e3a8a] to-[#0284c7] bg-clip-text text-transparent drop-shadow-md"',
    'className="relative text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-[#1e3a8a] to-[#0284c7] bg-clip-text text-transparent drop-shadow-md"'
)

# Grid spacing
content = content.replace(
    'className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full max-w-2xl px-2 sm:px-0"',
    'className="grid grid-cols-2 gap-2 sm:gap-4 w-full max-w-2xl px-1 sm:px-0"'
)

# Card 1: Assessments
old_card1 = """        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => onNavigate('assessments')}
          className="group bg-white rounded-[1.25rem] sm:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center gap-2 sm:gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center mb-1 sm:mb-2 transition-colors">
            <Award className="w-7 h-7 sm:w-10 sm:h-10 text-purple-500 group-hover:text-purple-600 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-base sm:text-lg md:text-xl font-bold text-[#1e3a8a]">التقييمات</span>
        </motion.button>"""

new_card1 = """        <motion.button
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
        </motion.button>"""

content = content.replace(old_card1, new_card1)

# Card 2: Students
old_card2 = """        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => onNavigate('students')}
          className="group bg-white rounded-[1.25rem] sm:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center gap-2 sm:gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center mb-1 sm:mb-2 transition-colors">
            <GraduationCap className="w-7 h-7 sm:w-10 sm:h-10 text-orange-500 group-hover:text-orange-600 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-base sm:text-lg md:text-xl font-bold text-[#1e3a8a]">الطلاب</span>
        </motion.button>"""

new_card2 = """        <motion.button
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
        </motion.button>"""

content = content.replace(old_card2, new_card2)

# Card 3: Stats
old_card3 = """        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => onNavigate('stats')}
          className="group bg-white rounded-[1.25rem] sm:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center gap-2 sm:gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center mb-1 sm:mb-2 transition-colors">
            <BarChart3 className="w-7 h-7 sm:w-10 sm:h-10 text-rose-500 group-hover:text-rose-600 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-base sm:text-lg md:text-xl font-bold text-[#1e3a8a]">الإحصاء</span>
        </motion.button>"""

new_card3 = """        <motion.button
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
        </motion.button>"""

content = content.replace(old_card3, new_card3)


# Card 4: Search
old_card4 = """        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => onNavigate('search')}
          className="group bg-white rounded-[1.25rem] sm:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center gap-2 sm:gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center mb-1 sm:mb-2 transition-colors">
            <Search className="w-7 h-7 sm:w-10 sm:h-10 text-amber-500 group-hover:text-amber-600 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-base sm:text-lg md:text-xl font-bold text-[#1e3a8a]">البحث</span>
        </motion.button>"""

new_card4 = """        <motion.button
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
        </motion.button>"""

content = content.replace(old_card4, new_card4)

# Card 5: Admin
old_card5 = """        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => onNavigate('admin')}
          className="group col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-[1.25rem] sm:rounded-3xl p-5 sm:p-8 flex flex-row items-center justify-start sm:justify-center gap-4 sm:gap-6 shadow-md hover:shadow-lg transition-all active:scale-95 border border-slate-700"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 flex items-center justify-center transition-colors shrink-0">
            <Shield className="w-7 h-7 sm:w-10 sm:h-10 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="text-right">
            <span className="block text-lg sm:text-2xl font-black text-white mb-0.5 sm:mb-1">الإدارة المدرسية</span>
            <span className="block text-[11px] sm:text-sm text-slate-400 font-medium">دخول المدير، الوكيل، والمشرف برقم الهاتف</span>
          </div>
        </motion.button>"""

new_card5 = """        <motion.button
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
        </motion.button>"""

content = content.replace(old_card5, new_card5)

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
