import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

old_interface = """interface ClassRosterManagerProps {
  selectedTerm: TermId;
  records: AssessmentRecord[];
}"""

new_interface = """interface ClassRosterManagerProps {
  selectedTerm: TermId;
  records: AssessmentRecord[];
  selectedMonthId: string;
  teacherId: string;
  isFirebaseConnected?: boolean;
}"""
content = content.replace(old_interface, new_interface)

# Just checking if selectedMonthId was not in the original interface... wait, in the grep output it wasn't there! Let me fix the arguments in the component definition.

old_def = """export const ClassRosterManager: React.FC<ClassRosterManagerProps> = ({ selectedTerm, records }) => {"""
new_def = """import { saveFirebaseAttendance, saveFirebaseStudent, deleteFirebaseStudent } from '../lib/firebase';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';

export const ClassRosterManager: React.FC<ClassRosterManagerProps> = ({ selectedTerm, records, selectedMonthId, teacherId, isFirebaseConnected }) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
"""
content = content.replace(old_def, new_def)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
