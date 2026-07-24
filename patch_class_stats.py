import re

with open('src/components/ClassStats.tsx', 'r') as f:
    content = f.read()

# 1. Update ClassStatsProps to accept teacher
content = content.replace("interface ClassStatsProps {\n  records: AssessmentRecord[];\n  selectedTerm: TermId;\n}", "import { TeacherProfile } from '../types';\n\ninterface ClassStatsProps {\n  records: AssessmentRecord[];\n  selectedTerm: TermId;\n  teacher: TeacherProfile;\n}")
content = content.replace("export const ClassStats: React.FC<ClassStatsProps> = ({ records, selectedTerm }) => {", "export const ClassStats: React.FC<ClassStatsProps> = ({ records, selectedTerm, teacher }) => {")

with open('src/components/ClassStats.tsx', 'w') as f:
    f.write(content)
