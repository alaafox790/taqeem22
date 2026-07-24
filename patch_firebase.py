import re

with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

new_functions = """
export async function saveFirebaseTeacher(teacher: any): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, 'teachers', teacher.id);
    await setDoc(docRef, {
      ...teacher,
      updated_at: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `teachers/${teacher.id}`);
    return false;
  }
}

export async function fetchAllFirebaseTeachers(): Promise<any[]> {
  if (!db) return [];
  try {
    const collRef = collection(db, 'teachers');
    const qSnapshot = await getDocs(collRef);
    return qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'teachers');
    return [];
  }
}

export async function fetchAllFirebaseStudentsForAdmin(): Promise<any[]> {
  if (!db) return [];
  try {
    const collRef = collection(db, 'students');
    const qSnapshot = await getDocs(collRef);
    return qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'students');
    return [];
  }
}
"""

content += new_functions

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
