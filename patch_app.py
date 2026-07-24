import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "<TermProgress\n                selectedTerm={selectedTerm}\n                academicYear={academicYear}\n                monthAssessmentCounts={monthAssessmentCounts}\n                records={records}\n              />",
    "<TermProgress\n                selectedTerm={selectedTerm}\n                academicYear={academicYear}\n                monthAssessmentCounts={monthAssessmentCounts}\n                records={records}\n                selectedMonth={selectedMonth}\n              />"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
