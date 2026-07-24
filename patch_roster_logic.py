import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Replace assessmentsCount definition
old_assessmentsCount = "  const assessmentsCount = 15;"
new_assessmentsCount = """  const assessmentsToDisplay = useMemo(() => {
    if (showAllAssessments) {
      return Array.from({ length: 15 }, (_, i) => i + 1);
    }
    return MONTHS_DATA.find(m => m.id === selectedMonthId)?.assessments || [];
  }, [showAllAssessments, selectedMonthId]);"""

content = content.replace(old_assessmentsCount, new_assessmentsCount)

# Fix export logic
old_headers = "    const headers = ['م', 'اسم الطالب', ...Array.from({ length: assessmentsCount }, (_, i) => `تقييم ${i + 1}`)];"
new_headers = "    const headers = ['م', 'اسم الطالب', ...assessmentsToDisplay.map(num => `تقييم ${num}`)];"
content = content.replace(old_headers, new_headers)

old_loop = "      for (let i = 1; i <= assessmentsCount; i++) {\n        const status = getAttendanceStatus(s.id, i);"
new_loop = "      for (const num of assessmentsToDisplay) {\n        const status = getAttendanceStatus(s.id, num);"
content = content.replace(old_loop, new_loop)

# Fix rendering arrays
old_th_map = "              {Array.from({ length: assessmentsCount }, (_, i) => i + 1).map(num => ("
new_th_map = "              {assessmentsToDisplay.map(num => ("
content = content.replace(old_th_map, new_th_map)

old_td_map = "                  {Array.from({ length: assessmentsCount }, (_, i) => i + 1).map(num => ("
new_td_map = "                  {assessmentsToDisplay.map(num => ("
content = content.replace(old_td_map, new_td_map)

old_colspan = "                <td colSpan={assessmentsCount + 4} className=\"p-8 text-center text-slate-400\">"
new_colspan = "                <td colSpan={assessmentsToDisplay.length + 4} className=\"p-8 text-center text-slate-400\">"
content = content.replace(old_colspan, new_colspan)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
