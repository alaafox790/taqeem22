import re

with open('src/components/LateAssessments.tsx', 'r') as f:
    content = f.read()

content = content.replace("interface LateAssessmentsProps {\\n  officialHolidays?: string[];", "interface LateAssessmentsProps {\n  officialHolidays?: string[];")

with open('src/components/LateAssessments.tsx', 'w') as f:
    f.write(content)
