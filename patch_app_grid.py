import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_grid = """              <AssessmentGrid
                selectedMonth={dynamicSelectedMonth}
                records={records}
                onSelectAssessment={(num) => setActiveAssessNum(num)}
                academicYear={academicYear}
                teacherId={teacher.id}
              />"""
new_grid = """              <AssessmentGrid
                selectedMonth={dynamicSelectedMonth}
                records={records}
                onSelectAssessment={(num) => setActiveAssessNum(num)}
                academicYear={academicYear}
                teacherId={teacher.id}
                teacher={teacher}
              />"""
content = content.replace(old_grid, new_grid)

with open('src/App.tsx', 'w') as f:
    f.write(content)
