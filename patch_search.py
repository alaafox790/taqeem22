import re

with open('src/components/AssessmentSearch.tsx', 'r') as f:
    content = f.read()

old_header = """  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#0284c7]/10 flex items-center justify-center text-[#0284c7]">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">البحث في السجلات</h2>
          <p className="text-sm text-slate-500 font-medium">ابحث عن سجلات التقييم لطالب معين أو فصل دراسي</p>
        </div>
      </div>"""

new_header = """  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Search className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">محرك البحث</h2>
            <p className="text-slate-500 font-medium mt-1">ابحث عن الطلاب بالاسم أو الحرف، أو استعرض فصولاً محددة</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">"""

content = content.replace(old_header, new_header)
content = content.replace("    </div>\n  );\n};", "    </div>\n    </div>\n  );\n};")

with open('src/components/AssessmentSearch.tsx', 'w') as f:
    f.write(content)
