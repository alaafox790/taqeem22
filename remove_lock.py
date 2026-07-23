import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

old_lock = """const renderAttendanceButton = (studentId: string, studentName: string, assessNum: number) => {
    const isUnlocked = unlockedAssessments.has(assessNum);
    if (!isUnlocked) {
      return (
        <div 
          className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto cursor-not-allowed" 
          title="برجاء تسجيل تقييمات هذا الأسبوع أولاً"
        >
          <Lock className="w-3 h-3 text-slate-300" />
        </div>
      );
    }"""

new_lock = """const renderAttendanceButton = (studentId: string, studentName: string, assessNum: number) => {"""

content = content.replace(old_lock, new_lock)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

