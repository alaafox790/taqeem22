import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Update <th> for name to be 90px
old_th_name = """<th className="p-2 min-w-[120px] max-w-[120px] w-[120px] sticky right-[50px] bg-[#1e3a8a] z-20 border-b border-l border-slate-700 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">الاسم</th>"""
new_th_name = """<th className="p-2 min-w-[90px] max-w-[90px] w-[90px] sticky right-[50px] bg-[#1e3a8a] z-20 border-b border-l border-slate-700 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">الاسم</th>"""
content = content.replace(old_th_name, new_th_name)

# Remove Class/Grade <th>
old_th_class = """<th className="p-2 text-center text-xs whitespace-nowrap border-b border-l border-slate-700 text-slate-300 font-medium">{selectedGrade ? `${selectedGrade} / ${selectedClassNum}` : 'الفصل'}</th>"""
content = content.replace(old_th_class, "")

# Remove Class/Grade <td>
old_td_class = """                  <td className="p-1 px-2 text-center text-[10px] text-slate-500 border-b border-l border-slate-200">\n                    {selectedGrade} / {selectedClassNum}\n                  </td>"""
content = content.replace(old_td_class, "")

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

