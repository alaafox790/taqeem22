import re

with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

old_func = """export async function fetchFirebaseRecords(teacherId: string): Promise<AssessmentRecord[]> {
  const localList = getLocalRecords();
  try {
    const q = query(collection(db, 'assessments'), where('teacher_id', '==', teacherId));
    const querySnapshot = await getDocs(q);
    const fetched: AssessmentRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      fetched.push(docSnap.data() as AssessmentRecord);
    });

    if (fetched.length > 0) {
      // Merge local and fetched if needed, or update local
      saveLocalRecords(fetched);
      return fetched;
    }
    return localList;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'assessments');
    return localList;
  }
}"""

new_func = """export async function fetchFirebaseRecords(teacherId: string): Promise<AssessmentRecord[]> {
  const localList = getLocalRecords();
  const localTeacherRecords = localList.filter(r => r.teacher_id === teacherId);

  try {
    const q = query(collection(db, 'assessments'), where('teacher_id', '==', teacherId));
    const querySnapshot = await getDocs(q);
    const fetched: AssessmentRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      fetched.push(docSnap.data() as AssessmentRecord);
    });

    const mergedMap = new Map<string, AssessmentRecord>();

    // 1. Add all fetched records to map
    fetched.forEach(record => {
      // Basic completeness check: ensure critical fields exist
      if (record.id && record.teacher_id) {
        mergedMap.set(record.id, record);
      }
    });

    // 2. Check local records for any that are missing or incomplete in Firebase
    let hasMissingRecords = false;
    for (const localRecord of localTeacherRecords) {
      if (!mergedMap.has(localRecord.id)) {
        // Record is in local but missing in Firebase (due to offline or failed upload)
        mergedMap.set(localRecord.id, localRecord);
        hasMissingRecords = true;
      }
    }

    const finalRecords = Array.from(mergedMap.values());

    // 3. Update localStorage to ensure it has the most complete set
    const allOtherLocal = localList.filter(r => r.teacher_id !== teacherId);
    saveLocalRecords([...allOtherLocal, ...finalRecords]);

    // 4. If we found missing records, attempt a background sync to Firebase
    if (hasMissingRecords) {
      syncOfflineRecords(teacherId).catch(err => {
        console.warn("Background sync failed, records will remain in local storage for next retry.", err);
      });
    }

    return finalRecords;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'assessments');
    // On network failure, fallback to the local list safely to avoid data loss
    return localTeacherRecords;
  }
}"""

content = content.replace(old_func, new_func)

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
