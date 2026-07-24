import re

with open('src/components/LateAssessments.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import { MonthInfo } from '../types';", "import { MonthInfo } from '../types';\nimport { getAdjustedDueDate } from '../lib/validation';")
content = content.replace("import { MonthInfo, AssessmentRecord } from '../types';", "import { MonthInfo, AssessmentRecord } from '../types';\nimport { getAdjustedDueDate } from '../lib/validation';")


# Find the loop logic
old_logic = """                  const daysInMonth = new Date(yearForMonth, monthInfo.monthNumber, 0).getDate();
                  const periodLength = daysInMonth / count;
                  const dueDateDay = Math.round(periodLength * (index + 1));
                  
                  if (currentDay > dueDateDay) {
                    isOverdue = true;
                  }"""

new_logic = """                  const daysInMonth = new Date(yearForMonth, monthInfo.monthNumber, 0).getDate();
                  const periodLength = daysInMonth / count;
                  const originalDueDate = Math.round(periodLength * (index + 1));
                  const dueDateDay = getAdjustedDueDate(yearForMonth, monthInfo.monthNumber, originalDueDate, officialHolidays);
                  
                  if (currentDay > dueDateDay) {
                    isOverdue = true;
                  }"""

content = content.replace(old_logic, new_logic)

with open('src/components/LateAssessments.tsx', 'w') as f:
    f.write(content)
