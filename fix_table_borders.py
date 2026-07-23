import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Add border-b to rows
content = content.replace('<tr key={student.id} className="hover:bg-slate-50 transition-colors group">', '<tr key={student.id} className="hover:bg-slate-50 transition-colors group border-b border-slate-100 last:border-b-0">')

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

