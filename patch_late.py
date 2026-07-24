import re

with open('src/components/LateAssessments.tsx', 'r') as f:
    content = f.read()

if "import { getAdjustedDueDate }" not in content:
    content = content.replace("import { AssessmentRecord", "import { getAdjustedDueDate } from '../lib/validation';\nimport { AssessmentRecord")

with open('src/components/LateAssessments.tsx', 'w') as f:
    f.write(content)
