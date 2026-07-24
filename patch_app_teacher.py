import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Make sure saveFirebaseTeacher is imported
import_line = "  fetchFirebaseStudents,\n} from './lib/firebase';"
new_import_line = "  fetchFirebaseStudents,\n  saveFirebaseTeacher,\n} from './lib/firebase';"
content = content.replace(import_line, new_import_line)

old_handle = """  const handleSaveTeacher = (updated: TeacherProfile) => {
    setTeacher(updated);
    localStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify(updated));
    showToast('success', 'تم تحديث البيانات', 'تم حفظ ملف المعلم بنجاح.');
  };"""

new_handle = """  const handleSaveTeacher = async (updated: TeacherProfile) => {
    setTeacher(updated);
    localStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify(updated));
    if (isFirebaseConnected) {
      await saveFirebaseTeacher(updated);
    }
    showToast('success', 'تم تحديث البيانات', 'تم حفظ ملف المعلم بنجاح.');
  };"""
content = content.replace(old_handle, new_handle)

with open('src/App.tsx', 'w') as f:
    f.write(content)
