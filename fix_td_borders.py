import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Add border-b to td elements instead of tr
content = content.replace('<tr key={student.id} className="hover:bg-slate-50 transition-colors group border-b border-slate-100 last:border-b-0">', '<tr key={student.id} className="hover:bg-slate-50 transition-colors group">')

# Add border-b to all tds
content = content.replace('border-l border-slate-200', 'border-b border-l border-slate-200')
content = content.replace('border-r border-slate-200', 'border-b border-r border-slate-200')

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

