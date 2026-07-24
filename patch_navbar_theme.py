import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

# Logo text gradient
content = content.replace(
    'bg-gradient-to-l from-indigo-800 to-violet-800',
    'bg-gradient-to-l from-violet-600 via-fuchsia-600 to-orange-500'
)

# Tab 1: Assessments -> Rose
content = content.replace(
    "'bg-white text-emerald-800 shadow-sm border border-emerald-100 ring-1 ring-emerald-50/50 sm:scale-105'",
    "'bg-white text-rose-600 shadow-[0_4px_15px_rgb(225,29,72,0.1)] border border-rose-100 ring-1 ring-rose-50/50 sm:scale-105'"
)
content = content.replace(
    "activeTab === 'assessments' ? 'text-emerald-600' : 'text-slate-400'",
    "activeTab === 'assessments' ? 'text-rose-500' : 'text-slate-400'"
)

# Tab 2: Students -> Blue
content = content.replace(
    "'bg-white text-teal-800 shadow-sm border border-teal-100 ring-1 ring-teal-50/50 sm:scale-105'",
    "'bg-white text-blue-600 shadow-[0_4px_15px_rgb(37,99,235,0.1)] border border-blue-100 ring-1 ring-blue-50/50 sm:scale-105'"
)
content = content.replace(
    "activeTab === 'students' ? 'text-teal-600' : 'text-slate-400'",
    "activeTab === 'students' ? 'text-blue-500' : 'text-slate-400'"
)

# Tab 3: Stats -> Emerald
content = content.replace(
    "'bg-white text-indigo-800 shadow-sm border border-indigo-100 ring-1 ring-indigo-50/50 sm:scale-105'",
    "'bg-white text-emerald-600 shadow-[0_4px_15px_rgb(16,185,129,0.1)] border border-emerald-100 ring-1 ring-emerald-50/50 sm:scale-105'"
)
content = content.replace(
    "activeTab === 'stats' ? 'text-indigo-600' : 'text-slate-400'",
    "activeTab === 'stats' ? 'text-emerald-500' : 'text-slate-400'"
)

# Tab 4: Reports -> Violet
content = content.replace(
    "'bg-white text-rose-800 shadow-sm border border-rose-100 ring-1 ring-rose-50/50 sm:scale-105'",
    "'bg-white text-violet-600 shadow-[0_4px_15px_rgb(124,58,237,0.1)] border border-violet-100 ring-1 ring-violet-50/50 sm:scale-105'"
)
content = content.replace(
    "activeTab === 'reports' ? 'text-rose-600' : 'text-slate-400'",
    "activeTab === 'reports' ? 'text-violet-500' : 'text-slate-400'"
)

# Active tab bg container
content = content.replace(
    'bg-slate-50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm',
    'bg-slate-50/80 backdrop-blur-md p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-inner'
)

# Teacher Info Pill (Right & Left)
content = content.replace(
    'bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xs border border-slate-800',
    'bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white transition-all cursor-pointer shadow-sm border border-slate-200'
)
content = content.replace(
    'text-xs font-bold text-slate-100',
    'text-xs font-bold text-slate-700'
)
content = content.replace(
    'text-[10px] text-emerald-400',
    'text-[10px] text-slate-500'
)
content = content.replace(
    'bg-emerald-500 text-slate-950 font-extrabold',
    'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-extrabold'
)
content = content.replace(
    'bg-slate-900 text-white hover:bg-slate-800 transition-all text-xs font-bold shrink-0',
    'bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white transition-all text-xs font-bold shrink-0 shadow-sm border border-slate-200'
)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
