import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

old_logo_area = """          <div className="flex items-center justify-between md:justify-start gap-3">
            <button 
              onClick={() => onSelectTab('home')}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-200"
              title="العودة للرئيسية"
            >
              <Home className="w-5 h-5" />
            </button>
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onSelectTab('home')}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-4 ring-emerald-50 shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                    سجل التقييمات المدرسية الأسبوعية
                  </h1>
                </div>
              </div>
            </div>"""

new_logo_area = """          <div className="flex items-start justify-between md:justify-start gap-4">
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
                <h1 className="text-sm sm:text-lg font-black bg-gradient-to-l from-indigo-800 to-violet-800 bg-clip-text text-transparent leading-tight tracking-tight">
                  سجل التقييمات
                </h1>
                <span className="text-[10px] sm:text-xs font-extrabold text-slate-500 tracking-wide mt-0.5">
                  المدرسية الأسبوعية
                </span>
              </div>
            </div>"""

content = content.replace(old_logo_area, new_logo_area)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
