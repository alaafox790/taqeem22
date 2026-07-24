import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
if "getAdjustedDueDate" not in content:
    content = content.replace("import { DEFAULT_TEACHER", "import { getAdjustedDueDate } from './lib/validation';\nimport { DEFAULT_TEACHER")

content = re.sub(
    r"const dueDateDay = Math\.round\(periodLength \* \(i \+ 1\)\);\s*const daysLeft = dueDateDay - currentDay;",
    r"const originalDueDate = Math.round(periodLength * (i + 1));\n          const dueDateDay = getAdjustedDueDate(currentYear, currentMonthNum, originalDueDate, teacher.officialHolidays || []);\n          const daysLeft = dueDateDay - currentDay;",
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
