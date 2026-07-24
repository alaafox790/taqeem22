import re

with open('src/components/StudentReportsScreen.tsx', 'r') as f:
    content = f.read()

old_logic = """    const classRecords = records.filter(r => r.grade === selectedGrade && r.class_num === selectedClassNum && r.month_id === selectedMonthId);
    const classAttendance = attendance.filter(a => a.grade === selectedGrade && a.class_num === selectedClassNum && a.month_id === selectedMonthId);"""

new_logic = """    const classRecords = records.filter(r => r.grade === selectedGrade && r.class_num === selectedClassNum && r.month_id === selectedMonthId);
    // Attendance was historically saved with month_id = selectedTerm, so we filter by selectedTerm and the assessments that belong to the selected month
    const validAssessments = selectedMonth?.assessments || [];
    const classAttendance = attendance.filter(a => 
      a.grade === selectedGrade && 
      a.class_num === selectedClassNum && 
      a.month_id === selectedTerm && 
      validAssessments.includes(a.assess_num)
    );"""

content = content.replace(old_logic, new_logic)

with open('src/components/StudentReportsScreen.tsx', 'w') as f:
    f.write(content)
