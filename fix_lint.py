import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { toPng } from 'html-to-image';", "")

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
