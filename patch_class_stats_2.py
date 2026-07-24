import re

with open('src/components/ClassStats.tsx', 'r') as f:
    content = f.read()

# Imports
content = content.replace(
    "import { MONTHS_DATA } from '../lib/constants';",
    "import { MONTHS_DATA } from '../lib/constants';\nimport { Book, Calculator, Globe, FlaskConical, Languages, Music, Palette, PenTool, Dna, Code, TrendingUp } from 'lucide-react';"
)

# Colors
content = content.replace(
    "const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];",
    """const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#f43f5e', '#8b5cf6', '#0ea5e9', '#10b981', '#d946ef'];

const getSubjectIcon = (iconName?: string, className: string = "w-6 h-6 text-indigo-600") => {
  switch (iconName) {
    case 'Book': return <Book className={className} />;
    case 'Calculator': return <Calculator className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'FlaskConical': return <FlaskConical className={className} />;
    case 'Languages': return <Languages className={className} />;
    case 'Music': return <Music className={className} />;
    case 'Palette': return <Palette className={className} />;
    case 'PenTool': return <PenTool className={className} />;
    case 'Dna': return <Dna className={className} />;
    case 'Code': return <Code className={className} />;
    default: return <TrendingUp className={className} />;
  }
};
"""
)

# Replace the icon in the header
old_header = """      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">إحصائيات الفصول</h2>
          <p className="text-sm text-slate-500 font-bold mt-1">مقارنة معدل الحضور وتراكم التقييمات لكل فصل</p>
        </div>
      </div>"""

new_header = """      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100">
          {getSubjectIcon(teacher.subjectIcon, "w-5 h-5 sm:w-6 sm:h-6 text-indigo-600")}
        </div>
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-800">إحصائيات الفصول</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-bold mt-0.5 sm:mt-1">مقارنة الحضور والتقييمات</p>
        </div>
      </div>"""

content = content.replace(old_header, new_header)

# Reduce paddings and gaps
content = content.replace('className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 w-full animate-in fade-in"', 'className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm border border-slate-100 w-full animate-in fade-in"')
content = content.replace('className="grid grid-cols-1 lg:grid-cols-3 gap-8"', 'className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"')

# Adjust charts heights to reduce empty spaces
content = content.replace('className="lg:col-span-2 h-[400px] w-full"', 'className="lg:col-span-2 h-[250px] sm:h-[300px] w-full"')
content = content.replace('className="h-[400px] w-full flex flex-col"', 'className="h-[250px] sm:h-[300px] w-full flex flex-col"')

content = content.replace('className="mt-8 border-t border-slate-100 pt-8"', 'className="mt-4 sm:mt-6 border-t border-slate-100 pt-4 sm:pt-6"')
content = content.replace('className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"', 'className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2"')

content = content.replace('className="h-[350px] w-full"', 'className="h-[200px] sm:h-[250px] w-full"')

with open('src/components/ClassStats.tsx', 'w') as f:
    f.write(content)
