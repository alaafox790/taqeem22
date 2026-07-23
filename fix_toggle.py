import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

old_toggle = """  const toggleAttendance = (studentId: string, studentName: string, assessNum: number) => {
    setAttendance((prev) => {
      const existing = prev.find((a) => a.student_id === studentId && a.assess_num === assessNum && a.month_id === selectedTerm);
      let newStatus: AttendanceStatus = 'present';
      if (existing) {
        if (existing.status === 'present') newStatus = 'absent';
        else if (existing.status === 'absent') newStatus = 'excused';
        else newStatus = 'present';
      }

      const otherAttendance = prev.filter(
        (a) => !(a.student_id === studentId && a.assess_num === assessNum && a.month_id === selectedTerm)
      );

      return [
        ...otherAttendance,
        {
          id: crypto.randomUUID(),
          student_id: studentId,
          student_name: studentName,
          grade: selectedGrade,
          class_num: Number(selectedClassNum),
          month_id: selectedTerm,
          assess_num: assessNum,
          status: newStatus,
          updated_at: new Date().toISOString(),
        },
      ];
    });
  };"""

new_toggle = """  const toggleAttendance = async (studentId: string, studentName: string, assessNum: number) => {
    let finalRecord: any = null;
    
    setAttendance((prev) => {
      const existing = prev.find((a) => a.student_id === studentId && a.assess_num === assessNum && a.month_id === selectedTerm);
      let newStatus: AttendanceStatus = 'present';
      let idToUse = crypto.randomUUID();
      
      if (existing) {
        if (existing.status === 'present') newStatus = 'absent';
        else if (existing.status === 'absent') newStatus = 'excused';
        else newStatus = 'present';
        idToUse = existing.id; // Preserve ID if updating
      }

      const otherAttendance = prev.filter(
        (a) => !(a.student_id === studentId && a.assess_num === assessNum && a.month_id === selectedTerm)
      );

      finalRecord = {
        id: idToUse,
        student_id: studentId,
        student_name: studentName,
        grade: selectedGrade,
        class_num: Number(selectedClassNum),
        month_id: selectedTerm,
        assess_num: assessNum,
        status: newStatus,
        updated_at: new Date().toISOString(),
        teacher_id: teacherId, // Add teacherId for Firebase rules
      };

      return [...otherAttendance, finalRecord];
    });

    // Auto-save to Firebase
    if (finalRecord && isFirebaseConnected) {
      setSyncStatus('syncing');
      try {
        const success = await saveFirebaseAttendance(finalRecord);
        setSyncStatus(success ? 'idle' : 'error');
      } catch (e) {
        console.error('Failed to sync attendance', e);
        setSyncStatus('error');
      }
    }
  };"""

content = content.replace(old_toggle, new_toggle)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

