import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I will just insert the AssessmentModal right before TeacherProfileModal
modal_code = """
      {activeAssessNum && (
        <AssessmentModal
          isOpen={true}
          onClose={() => setActiveAssessNum(null)}
          assessNum={activeAssessNum}
          selectedMonth={selectedMonth}
          academicYear={academicYear}
          selectedTerm={selectedTerm}
          teacherId={teacher.id}
          onSave={handleAssessmentSubmit}
        />
      )}

      {/* Modal: Teacher Profile & DB Settings */}"""

content = content.replace("{/* Modal: Teacher Profile & DB Settings */}", modal_code)

with open('src/App.tsx', 'w') as f:
    f.write(content)

