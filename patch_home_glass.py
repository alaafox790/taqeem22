import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

old_header = """      {/* Header */}
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

new_header = """      {/* Header */}
      <div className="text-center space-y-3 flex flex-col items-center relative">
        {/* Glow blobs to make the glass effect visible */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative inline-flex items-center justify-center px-10 py-5 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg overflow-hidden"
        >
          {/* Shiny sweep effect (auto running) */}
          <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12 w-[150%]"></div>
          <h1 className="relative text-5xl md:text-6xl font-black bg-gradient-to-r from-[#1e3a8a] to-[#0284c7] bg-clip-text text-transparent drop-shadow-md">
            تقييماتي
          </h1>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-slate-500 font-bold tracking-wider relative z-10"
        >
          مدمرة حياتي
        </motion.p>
      </div>"""

content = content.replace(old_header, new_header)

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
