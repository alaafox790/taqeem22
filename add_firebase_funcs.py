import re

with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

# I will add attendance/students sync functions
funcs = """
// ----------------- ATTENDANCE SYNC -----------------

export async function saveFirebaseAttendance(attendanceRec: any): Promise<boolean> {
  try {
    await setDoc(doc(db, 'attendance', attendanceRec.id), attendanceRec);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `attendance/${attendanceRec.id}`);
    return false;
  }
}

export async function fetchFirebaseAttendance(teacherId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'attendance'), where('teacher_id', '==', teacherId));
    const querySnapshot = await getDocs(q);
    const fetched: any[] = [];
    querySnapshot.forEach((docSnap) => {
      fetched.push(docSnap.data());
    });
    return fetched;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'attendance');
    return [];
  }
}

// ----------------- STUDENTS SYNC -----------------

export async function saveFirebaseStudent(student: any, teacherId: string): Promise<boolean> {
  try {
    await setDoc(doc(db, 'students', student.id), { ...student, teacher_id: teacherId });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `students/${student.id}`);
    return false;
  }
}

export async function fetchFirebaseStudents(teacherId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'students'), where('teacher_id', '==', teacherId));
    const querySnapshot = await getDocs(q);
    const fetched: any[] = [];
    querySnapshot.forEach((docSnap) => {
      fetched.push(docSnap.data());
    });
    return fetched;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'students');
    return [];
  }
}

export async function deleteFirebaseStudent(studentId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'students', studentId));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `students/${studentId}`);
    return false;
  }
}
"""

content += funcs

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
