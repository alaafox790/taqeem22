import re

with open('src/components/AssessmentGrid.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { MonthInfo, AssessmentRecord } from '../types';", "import { MonthInfo, AssessmentRecord, TeacherProfile } from '../types';\nimport { getAdjustedDueDate } from '../lib/validation';")

content = content.replace("interface AssessmentGridProps {", "interface AssessmentGridProps {\n  teacher: TeacherProfile;")

old_params = """export const AssessmentGrid: React.FC<AssessmentGridProps> = ({
  selectedMonth,
  records,
  onSelectAssessment,
  academicYear,
  teacherId,
}) => {"""

new_params = """export const AssessmentGrid: React.FC<AssessmentGridProps> = ({
  selectedMonth,
  records,
  onSelectAssessment,
  academicYear,
  teacherId,
  teacher,
}) => {"""
content = content.replace(old_params, new_params)

old_logic = """                    const daysInMonth = new Date(yearForMonth, selectedMonth.monthNumber, 0).getDate();
                    const periodLength = daysInMonth / count;
                    const dueDateDay = Math.round(periodLength * (index + 1));
                    
                    if (currentDay > dueDateDay) {
                      isOverdue = true;
                    }"""

new_logic = """                    const daysInMonth = new Date(yearForMonth, selectedMonth.monthNumber, 0).getDate();
                    const periodLength = daysInMonth / count;
                    const originalDueDate = Math.round(periodLength * (index + 1));
                    const dueDateDay = getAdjustedDueDate(yearForMonth, selectedMonth.monthNumber, originalDueDate, teacher?.officialHolidays || []);
                    
                    if (currentDay > dueDateDay) {
                      isOverdue = true;
                    }"""
content = content.replace(old_logic, new_logic)

with open('src/components/AssessmentGrid.tsx', 'w') as f:
    f.write(content)
