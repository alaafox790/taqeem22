import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

content = content.replace("rowData.push('عطلة');", "rowData.push('مؤجل');")
content = content.replace("title=\"عطلة / غياب (تم تخطي التقييم)\"", "title=\"تأجيل التقييم\"")
content = content.replace(">عطلة</span>", ">مؤجل</span>")

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
