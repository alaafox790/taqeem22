import re

with open('src/components/LateAssessments.tsx', 'r') as f:
    content = f.read()

if "import { getAdjustedDueDate }" not in content:
    content = content.replace("import { MonthInfo } from '../types';", "import { MonthInfo } from '../types';\nimport { getAdjustedDueDate } from '../lib/validation';")

with open('src/components/LateAssessments.tsx', 'w') as f:
    f.write(content)
