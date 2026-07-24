import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

old_props = """interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  teacher: TeacherProfile;
  onOpenProfile: () => void;
  records: AssessmentRecord[];
  onOpenAssessment: (month: MonthInfo, assessNum: number, termId: TermId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, teacher, onOpenProfile, records, onOpenAssessment }) => {"""
new_props = """interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  teacher: TeacherProfile;
  onOpenProfile: () => void;
  records: AssessmentRecord[];
  selectedTerm: TermId;
  academicYear: string;
  onOpenAssessment: (month: MonthInfo, assessNum: number, termId: TermId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, teacher, onOpenProfile, records, selectedTerm, academicYear, onOpenAssessment }) => {"""
content = content.replace(old_props, new_props)

content = content.replace(
    "<LateAssessments teacherId={teacher.id} records={records} onOpenAssessment={onOpenAssessment} />",
    "<LateAssessments teacherId={teacher.id} records={records} selectedTerm={selectedTerm} academicYear={academicYear} onOpenAssessment={onOpenAssessment} />"
)

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
