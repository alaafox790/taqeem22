import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

content = content.replace('const assessmentsCount = 15; // Assuming 12 assessments per term', 'const assessmentsCount = 20;')

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

