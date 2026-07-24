import re

with open('src/types.ts', 'r') as f:
    content = f.read()

old_profile = """export interface TeacherProfile {
  id: string;
  name: string;
  subject: string;
  school: string;
  phone?: string;
  supervisorCode?: string;
  supervisorPhone?: string;
  principalPhone?: string;
  deputyPhone?: string;
}"""

new_profile = """export interface TeacherProfile {
  id: string;
  name: string;
  subject: string;
  school: string;
  phone?: string;
  supervisorCode?: string;
  supervisorPhone?: string;
  principalPhone?: string;
  deputyPhone?: string;
  officialHolidays?: string[];
}"""

content = content.replace(old_profile, new_profile)

with open('src/types.ts', 'w') as f:
    f.write(content)
