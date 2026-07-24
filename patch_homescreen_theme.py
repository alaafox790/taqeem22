import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

# 1. Update glowing blobs for a joyful vibrant look
content = content.replace(
    '<div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>',
    '<div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-400/20 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>\n        <div className="absolute top-20 left-0 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>'
)
content = content.replace(
    '<div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>',
    '<div className="absolute -bottom-20 left-20 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>'
)

# 2. Header text gradient
content = content.replace(
    'from-[#1e3a8a] to-[#0284c7]',
    'from-violet-600 via-fuchsia-600 to-orange-500'
)

# 3. Subtext color
content = content.replace(
    'className="text-sm text-slate-500 font-bold tracking-wider relative z-10"',
    'className="text-sm text-fuchsia-600/80 font-black tracking-widest relative z-10"'
)

# 4. Settings button (teacher profile)
content = content.replace(
    'bg-white/70 backdrop-blur-md shadow-sm border border-white/80 hover:bg-white transition-all active:scale-95 text-slate-700',
    'bg-white/80 backdrop-blur-xl shadow-lg shadow-violet-500/5 border border-white hover:bg-white hover:shadow-violet-500/10 transition-all active:scale-95 text-slate-700'
)
content = content.replace(
    'bg-emerald-100 text-emerald-700',
    'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
)

# 5. Grid button base classes (glassmorphism)
old_grid_btn = 'className="group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-center gap-1 sm:gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"'
new_grid_btn = 'className="group bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-4 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 transition-all duration-300 active:scale-95"'
content = content.replace(old_grid_btn, new_grid_btn)

# 6. Icons and Colors
# Assessments (Rose/Orange)
content = content.replace(
    '<div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30 flex items-center justify-center mb-1 transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/40">',
    '<div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 text-white shadow-lg shadow-rose-400/30 flex items-center justify-center transition-all group-hover:shadow-rose-400/50 group-hover:scale-110 duration-300">'
)
content = content.replace(
    '<span className="text-sm sm:text-lg font-bold text-[#1e3a8a]">التقييمات</span>',
    '<span className="text-sm sm:text-lg font-black text-slate-700 group-hover:text-rose-500 transition-colors">التقييمات</span>'
)

# Students (Blue/Indigo)
content = content.replace(
    '<div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/30 flex items-center justify-center mb-1 transition-all group-hover:shadow-lg group-hover:shadow-emerald-500/40">',
    '<div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-400/30 flex items-center justify-center transition-all group-hover:shadow-blue-400/50 group-hover:scale-110 duration-300">'
)
content = content.replace(
    '<span className="text-sm sm:text-lg font-bold text-[#1e3a8a]">الطلاب</span>',
    '<span className="text-sm sm:text-lg font-black text-slate-700 group-hover:text-blue-500 transition-colors">الطلاب</span>'
)

# Stats (Emerald/Teal)
content = content.replace(
    '<div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md shadow-sky-500/30 flex items-center justify-center mb-1 transition-all group-hover:shadow-lg group-hover:shadow-sky-500/40">',
    '<div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 text-white shadow-lg shadow-emerald-400/30 flex items-center justify-center transition-all group-hover:shadow-emerald-400/50 group-hover:scale-110 duration-300">'
)
content = content.replace(
    '<span className="text-sm sm:text-lg font-bold text-[#1e3a8a]">الإحصاء</span>',
    '<span className="text-sm sm:text-lg font-black text-slate-700 group-hover:text-emerald-500 transition-colors">الإحصاء</span>'
)

# Search (Purple/Pink)
content = content.replace(
    '<div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-fuchsia-400 to-pink-500 text-white shadow-md shadow-fuchsia-500/30 flex items-center justify-center mb-1 transition-all group-hover:shadow-lg group-hover:shadow-fuchsia-500/40">',
    '<div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-400 text-white shadow-lg shadow-violet-400/30 flex items-center justify-center transition-all group-hover:shadow-violet-400/50 group-hover:scale-110 duration-300">'
)
content = content.replace(
    '<span className="text-sm sm:text-lg font-bold text-[#1e3a8a]">البحث</span>',
    '<span className="text-sm sm:text-lg font-black text-slate-700 group-hover:text-violet-500 transition-colors">البحث</span>'
)

# 7. Admin Dashboard (Dark blue/gray -> Vibrant Violet/Fuchsia)
content = content.replace(
    'className="group col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-row items-center justify-start sm:justify-center gap-3 sm:gap-5 shadow-md hover:shadow-lg transition-all active:scale-95 border border-slate-700"',
    'className="group col-span-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl sm:rounded-[2rem] p-5 sm:p-6 flex flex-row items-center justify-start sm:justify-center gap-4 sm:gap-6 shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 active:scale-95 border border-indigo-400/30"'
)
content = content.replace(
    '<div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-800/80 flex items-center justify-center transition-colors shrink-0">',
    '<div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center transition-colors shrink-0 border border-white/20">'
)
content = content.replace(
    'text-cyan-400 group-hover:scale-110',
    'text-white group-hover:scale-110'
)
content = content.replace(
    'text-slate-400',
    'text-indigo-200'
)

# 8. Tech Support Button
content = content.replace(
    'bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-md shadow-emerald-500/20 transition-transform hover:scale-105 active:scale-95',
    'bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-6 py-3 rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5 active:scale-95'
)

# 9. Clean up rotation in icons (since we scale the whole box now)
content = content.replace('text-white group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300', 'text-white')
content = content.replace('text-white group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300', 'text-white')


with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
