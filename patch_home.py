import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

old_header = """    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-12 relative">
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

      {/* Header */}
      <div className="text-center space-y-3">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-black bg-gradient-to-r from-[#1e3a8a] to-[#0284c7] bg-clip-text text-transparent pb-2 drop-shadow-sm"
        >
          تقييماتي
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-slate-500 font-medium tracking-wider"
        >
          مدمرة حياتي
        </motion.p>
      </div>"""

new_header = """    <div className="min-h-[80vh] flex flex-col items-center justify-start p-4 sm:p-6 space-y-8 sm:space-y-12">
      {/* Top Bar for Settings */}
      <div className="w-full max-w-2xl flex justify-end">
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 backdrop-blur-md shadow-sm border border-white/80 hover:bg-white transition-all active:scale-95 text-slate-700"
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

      {/* Header */}
      <div className="text-center space-y-3 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative inline-flex items-center justify-center px-10 py-5 rounded-[2rem] bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden group"
        >
          {/* Shiny sweep effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12"></div>
          <h1 className="relative text-5xl md:text-6xl font-black bg-gradient-to-r from-[#1e3a8a] to-[#0284c7] bg-clip-text text-transparent drop-shadow-sm">
            تقييماتي
          </h1>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-slate-500 font-medium tracking-wider"
        >
          مدمرة حياتي
        </motion.p>
      </div>"""

# Remove invisible characters just in case
content = content.replace(old_header, new_header)

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
