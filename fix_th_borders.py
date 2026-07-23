import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

content = content.replace('border-l border-slate-700', 'border-b border-l border-slate-700')
content = content.replace('border-r border-slate-700', 'border-b border-r border-slate-700')

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

