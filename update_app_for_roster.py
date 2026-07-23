import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_roster = """            <ClassRosterManager records={records}
              selectedTerm={selectedTerm}
              selectedMonthId={selectedMonth.id}
            />"""

new_roster = """            <ClassRosterManager 
              records={records}
              selectedTerm={selectedTerm}
              selectedMonthId={selectedMonth.id}
              teacherId={teacher.id}
              isFirebaseConnected={isFirebaseConnected}
            />"""
content = content.replace(old_roster, new_roster)

with open('src/App.tsx', 'w') as f:
    f.write(content)

