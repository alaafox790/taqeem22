import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# 1. Update Props and Imports
content = content.replace(
    'import { Student, TermId, StudentAttendance, AttendanceStatus } from \'../types\';',
    'import { Student, TermId, StudentAttendance, AttendanceStatus, AssessmentRecord } from \'../types\';'
)
content = content.replace(
    'interface ClassRosterManagerProps {\n  selectedTerm: TermId;\n}',
    'interface ClassRosterManagerProps {\n  selectedTerm: TermId;\n  records: AssessmentRecord[];\n}'
)
content = content.replace(
    'export const ClassRosterManager: React.FC<ClassRosterManagerProps> = ({ selectedTerm }) => {',
    'export const ClassRosterManager: React.FC<ClassRosterManagerProps> = ({ selectedTerm, records }) => {'
)

# 2. Add unlocked assessments logic
unlocked_logic = """  // Determine which assessments are recorded by the teacher for this class
  const unlockedAssessments = useMemo(() => {
    const unlocked = new Set<number>();
    if (records) {
      records.forEach(r => {
        if (r.term_id === selectedTerm && r.grade === selectedGrade && r.class_num === selectedClassNum) {
          unlocked.add(r.assess_num);
        }
      });
    }
    return unlocked;
  }, [records, selectedTerm, selectedGrade, selectedClassNum]);"""

content = content.replace('  // Generate 12 assessments columns based on term\n  const assessmentsCount = 15;', unlocked_logic + '\n\n  const assessmentsCount = 15;')

# 3. Update renderAttendanceButton to check unlocked
old_render_btn = 'const renderAttendanceButton = (studentId: string, studentName: string, assessNum: number) => {'
new_render_btn = """const renderAttendanceButton = (studentId: string, studentName: string, assessNum: number) => {
    const isUnlocked = unlockedAssessments.has(assessNum);
    if (!isUnlocked) {
      return <div className="text-center text-slate-300 font-bold w-8 h-8 flex items-center justify-center mx-auto">-</div>;
    }
"""
content = content.replace(old_render_btn, new_render_btn)

# 4. Fix table sticky columns widths and gap
old_th_1 = '<th className="p-3 w-10 text-center sticky right-0 bg-[#1e3a8a] z-10 border-l border-slate-700 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">م</th>'
new_th_1 = '<th className="p-3 min-w-[50px] max-w-[50px] w-[50px] text-center sticky right-0 bg-[#1e3a8a] z-20 border-l border-slate-700 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">م</th>'
content = content.replace(old_th_1, new_th_1)

old_th_2 = '<th className="p-3 min-w-[150px] sticky right-10 bg-[#1e3a8a] z-10 border-l border-slate-700 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">الاسم</th>'
new_th_2 = '<th className="p-3 min-w-[150px] max-w-[150px] w-[150px] sticky right-[50px] bg-[#1e3a8a] z-20 border-l border-slate-700 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">الاسم</th>'
content = content.replace(old_th_2, new_th_2)

old_td_1 = '<td className="p-3 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-2px_0_4px_rgba(0,0,0,0.02)]">{idx + 1}</td>'
new_td_1 = '<td className="p-3 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-20 border-l border-slate-200 shadow-[-2px_0_4px_rgba(0,0,0,0.02)] min-w-[50px] max-w-[50px] w-[50px]">{idx + 1}</td>'
content = content.replace(old_td_1, new_td_1)

old_td_2 = '<td className="p-3 sticky right-10 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-[-2px_0_4px_rgba(0,0,0,0.02)]">{student.name}</td>'
new_td_2 = '<td className="p-3 sticky right-[50px] bg-white group-hover:bg-slate-50 z-20 border-l border-slate-200 shadow-[-2px_0_4px_rgba(0,0,0,0.02)] min-w-[150px] max-w-[150px] w-[150px] truncate">{student.name}</td>'
content = content.replace(old_td_2, new_td_2)

# 5. Make sure the table does not have weird gaps by removing whitespace-nowrap from table if it conflicts, but keep it for layout.

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
