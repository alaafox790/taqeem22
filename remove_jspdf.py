import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

content = content.replace("import jsPDF from 'jspdf';\n", "")
content = content.replace("import autoTable from 'jspdf-autotable';\n", "")

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
