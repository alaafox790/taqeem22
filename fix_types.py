import re

with open('src/types.ts', 'r') as f:
    content = f.read()

content = content.replace('unlockedAssessments: number[]; // e.g. [1, 2, 3]', 'assessments: number[];\n  color: string;')

with open('src/types.ts', 'w') as f:
    f.write(content)

