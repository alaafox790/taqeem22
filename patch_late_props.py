import re

with open('src/components/LateAssessments.tsx', 'r') as f:
    content = f.read()

content = content.replace("interface LateAssessmentsProps {", "interface LateAssessmentsProps {\\n  officialHolidays?: string[];")
content = content.replace("export const LateAssessments: React.FC<LateAssessmentsProps> = ({ teacherId, records, selectedTerm, academicYear, onOpenAssessment }) => {", "export const LateAssessments: React.FC<LateAssessmentsProps> = ({ teacherId, records, selectedTerm, academicYear, onOpenAssessment, officialHolidays = [] }) => {")

with open('src/components/LateAssessments.tsx', 'w') as f:
    f.write(content)
