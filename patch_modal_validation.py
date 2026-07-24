import re

with open('src/components/AssessmentModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("لا يمكن تسجيل تقييم يوم الجمعة. إذا كان عطلة يرجى تفعيل خيار العطلة.", "لا يمكن تسجيل تقييم يوم الجمعة. يرجى تفعيل خيار تأجيل التقييم.")
content = content.replace("يرجى تحديد سبب العطلة / الغياب.", "يرجى تحديد سبب تأجيل التقييم.")

with open('src/components/AssessmentModal.tsx', 'w') as f:
    f.write(content)
