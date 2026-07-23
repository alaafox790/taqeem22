import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

# Update Assessments Button
content = content.replace(
    'className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"',
    'className="group bg-white rounded-3xl p-8 flex flex-col items-center justify-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"'
)
content = content.replace(
    '<div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-2">',
    '<div className="w-16 h-16 rounded-2xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center mb-2 transition-colors">'
)
content = content.replace(
    '<Award className="w-10 h-10 text-purple-500" />',
    '<Award className="w-10 h-10 text-purple-500 group-hover:text-purple-600 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />'
)

# Update Students Button
content = content.replace(
    '<div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-2">',
    '<div className="w-16 h-16 rounded-2xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center mb-2 transition-colors">'
)
content = content.replace(
    '<GraduationCap className="w-10 h-10 text-orange-500" />',
    '<GraduationCap className="w-10 h-10 text-orange-500 group-hover:text-orange-600 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />'
)

# Update Stats Button
content = content.replace(
    '<div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-2">',
    '<div className="w-16 h-16 rounded-2xl bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center mb-2 transition-colors">'
)
content = content.replace(
    '<BarChart3 className="w-10 h-10 text-rose-500" />',
    '<BarChart3 className="w-10 h-10 text-rose-500 group-hover:text-rose-600 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />'
)

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
