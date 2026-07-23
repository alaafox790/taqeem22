import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# 1. Re-add isUnlocked
unlocked_check = """const renderAttendanceButton = (studentId: string, studentName: string, assessNum: number) => {
    const isUnlocked = unlockedAssessments.has(assessNum);
    if (!isUnlocked) {
      return <div className="text-center text-slate-200 font-bold w-6 h-6 flex items-center justify-center mx-auto text-xs" title="لم يتم تسجيل التقييم">-</div>;
    }"""
content = content.replace('const renderAttendanceButton = (studentId: string, studentName: string, assessNum: number) => {', unlocked_check)

# 2. Make buttons and icons smaller
# Change button sizes
content = content.replace('let btnClass = "w-8 h-8 ', 'let btnClass = "w-6 h-6 ')
# Change icon sizes
content = content.replace('<Minus className="w-4 h-4 text-slate-400" />', '<Minus className="w-3 h-3 text-slate-400" />')
content = content.replace('<Check className="w-5 h-5 ', '<Check className="w-3.5 h-3.5 ')
content = content.replace('<X className="w-5 h-5 ', '<X className="w-3.5 h-3.5 ')
content = content.replace('<Minus className="w-5 h-5 ', '<Minus className="w-3.5 h-3.5 ')

# 3. Update table header "البيانات" to dynamic title
old_header = '<th className="p-3 text-center min-w-[100px] border-l border-slate-700">البيانات</th>'
new_header = '<th className="p-2 text-center text-xs whitespace-nowrap border-l border-slate-700 text-slate-300 font-medium">{selectedGrade ? `${selectedGrade} / ${selectedClassNum}` : \'الفصل\'}</th>'
content = content.replace(old_header, new_header)

# 4. Reduce space between Name and Data
old_td_name = '<td className="p-3 sticky right-[49px] bg-white group-hover:bg-slate-50 z-20 border-l border-slate-200 shadow-[-2px_0_4px_rgba(0,0,0,0.02)] min-w-[150px] max-w-[150px] w-[150px] truncate">{student.name}</td>'
new_td_name = '<td className="p-2 text-sm sticky right-[49px] bg-white group-hover:bg-slate-50 z-20 border-l border-slate-200 shadow-[-2px_0_4px_rgba(0,0,0,0.02)] min-w-[140px] max-w-[140px] w-[140px] truncate">{student.name}</td>'
content = content.replace(old_td_name, new_td_name)

old_th_name = '<th className="p-3 min-w-[150px] max-w-[150px] w-[150px] sticky right-[49px] bg-[#1e3a8a] z-20 border-l border-slate-700 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">الاسم</th>'
new_th_name = '<th className="p-2 min-w-[140px] max-w-[140px] w-[140px] sticky right-[49px] bg-[#1e3a8a] z-20 border-l border-slate-700 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">الاسم</th>'
content = content.replace(old_th_name, new_th_name)

old_td_data = '<td className="p-3 text-center text-[10px] text-slate-500 border-l border-slate-200">'
new_td_data = '<td className="p-1 px-2 text-center text-[10px] text-slate-500 border-l border-slate-200">'
content = content.replace(old_td_data, new_td_data)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

