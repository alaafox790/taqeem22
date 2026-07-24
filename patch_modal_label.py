import re

with open('src/components/AssessmentModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("تسجيل كعطلة / غياب (تخطي التقييم)", "تأجيل التقييم بسبب")

with open('src/components/AssessmentModal.tsx', 'w') as f:
    f.write(content)
