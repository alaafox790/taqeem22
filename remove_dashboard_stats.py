import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { DashboardStats } from './components/DashboardStats';\n", "")
content = content.replace("<DashboardStats records={records} academicYear={academicYear} />", "")

with open('src/App.tsx', 'w') as f:
    f.write(content)

