import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

old_save = """  // Handle Save (Add Next or Finish)
  const handleSaveStudent = (addNext: boolean) => {
    if (!newStudentName.trim() || !selectedGrade || !selectedClassNum) return;

    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: newStudentName.trim(),
      grade: selectedGrade,
      class_num: Number(selectedClassNum),
      religion,
      status,
    };

    setStudents((prev) => [...prev, newStudent]);
    setNewStudentName('');

    if (!addNext) {
      setIsModalOpen(false);
    }
  };"""

new_save = """  // Handle Save (Add Next or Finish)
  const handleSaveStudent = async (addNext: boolean) => {
    if (!newStudentName.trim() || !selectedGrade || !selectedClassNum) return;

    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: newStudentName.trim(),
      grade: selectedGrade,
      class_num: Number(selectedClassNum),
      religion,
      status,
    };

    setStudents((prev) => [...prev, newStudent]);
    setNewStudentName('');

    if (isFirebaseConnected) {
      setSyncStatus('syncing');
      try {
        const success = await saveFirebaseStudent(newStudent, teacherId);
        setSyncStatus(success ? 'idle' : 'error');
      } catch {
        setSyncStatus('error');
      }
    }

    if (!addNext) {
      setIsModalOpen(false);
    }
  };"""
content = content.replace(old_save, new_save)

old_confirm_del = """  const confirmDelete = () => {
    if (studentToDelete) {
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      setAttendance((prev) => prev.filter((a) => a.student_id !== studentToDelete.id));
    }
    setStudentToDelete(null);
  };"""

new_confirm_del = """  const confirmDelete = async () => {
    if (studentToDelete) {
      const idToDelete = studentToDelete.id;
      setStudents((prev) => prev.filter((s) => s.id !== idToDelete));
      setAttendance((prev) => prev.filter((a) => a.student_id !== idToDelete));
      
      if (isFirebaseConnected) {
        setSyncStatus('syncing');
        try {
          const success = await deleteFirebaseStudent(idToDelete);
          setSyncStatus(success ? 'idle' : 'error');
        } catch {
          setSyncStatus('error');
        }
      }
    }
    setStudentToDelete(null);
  };"""
content = content.replace(old_confirm_del, new_confirm_del)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

