import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

# Replace the entire Header section
old_header = """      {/* Header */}
      <div className="text-center space-y-2 flex flex-col items-center relative">
        {/* Glow blobs to make the glass effect visible */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative inline-flex items-center justify-center px-6 py-3 sm:px-10 sm:py-5 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg overflow-hidden"
        >
          {/* Shiny sweep effect (auto running) */}
          <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12 w-[150%]"></div>
          <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-[#1e3a8a] to-[#0284c7] bg-clip-text text-transparent drop-shadow-md">
            تقييماتي
          </h1>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 mt-3"
        >
          <div className="bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
            <span className="text-xs font-bold text-indigo-800">سجلت هذا الشهر ({activeMonth?.name.split(' ')[0]}):</span>
            <span className="bg-indigo-600 text-white text-xs font-black px-2 py-0.5 rounded-full">{assessmentsCount} تقييم</span>
          </div>
        </motion.div>
      </div>"""

new_header = """      {/* Monthly Stats Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div className="text-right">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">تقييمات {activeMonth?.name.split(' ')[0] || 'الشهر الحالي'}</h2>
            <p className="text-sm font-bold text-slate-500 mt-1">إجمالي التقييمات المسجلة في جميع الفصول</p>
          </div>
        </div>
        <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-md flex flex-col items-center justify-center min-w-[100px]">
          <span className="text-3xl font-black leading-none">{assessmentsCount}</span>
          <span className="text-[10px] font-bold opacity-90 mt-1 uppercase tracking-wider">تقييم</span>
        </div>
      </motion.div>"""

content = content.replace(old_header, new_header)

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
