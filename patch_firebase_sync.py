import re

with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

# Let's add a sync function
sync_func = """
// Sync offline local records to Firebase
export async function syncOfflineRecords(teacherId: string): Promise<boolean> {
  if (!navigator.onLine) return false;
  
  const localList = getLocalRecords();
  if (localList.length === 0) return true;
  
  try {
    // Get existing from Firebase to avoid duplicate work if possible, but simplest is just setDoc for all local records
    // since setDoc will overwrite with same ID (upsert)
    let syncCount = 0;
    for (const record of localList) {
      // Assuming all local records belong to this teacher, or we filter
      if (record.teacher_id === teacherId) {
        await setDoc(doc(db, 'assessments', record.id), record);
        syncCount++;
      }
    }
    if (syncCount > 0) {
      console.log(`Synced ${syncCount} offline records to Firebase.`);
    }
    return true;
  } catch (err) {
    console.error('Error syncing offline records:', err);
    return false;
  }
}
"""

if "syncOfflineRecords" not in content:
    content = content + sync_func

old_fetch = """export async function fetchFirebaseRecords(teacherId: string): Promise<AssessmentRecord[]> {
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

# Merge local and fetched: Create a Map by ID to merge them. We prefer newer records, but since we don't track update time properly, we can just use local if it doesn't exist in fetched, and write them to firebase. But since we have syncOfflineRecords, we can call it first? No, we should do it in fetch to make it seamless.

new_fetch = """export async function fetchFirebaseRecords(teacherId: string): Promise<AssessmentRecord[]> {
  const localList = getLocalRecords();
  try {
    const q = query(collection(db, 'assessments'), where('teacher_id', '==', teacherId));
    const querySnapshot = await getDocs(q);
    const fetched: AssessmentRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      fetched.push(docSnap.data() as AssessmentRecord);
    });
    
    // Merge: If local has records not in fetched, it means they were created offline
    const fetchedIds = new Set(fetched.map(r => r.id));
    const offlineRecords = localList.filter(r => r.teacher_id === teacherId && !fetchedIds.has(r.id));
    
    // Push offline records to Firebase
    for (const record of offlineRecords) {
      try {
        await setDoc(doc(db, 'assessments', record.id), record);
        fetched.push(record); // Add to our resulting array
      } catch (e) {
        console.error("Failed to sync offline record:", record.id);
      }
    }
    
    if (fetched.length > 0) {
      // Keep other teachers' local records, just replace this teacher's
      const otherTeachers = localList.filter(r => r.teacher_id !== teacherId);
      saveLocalRecords([...fetched, ...otherTeachers]);
      return fetched;
    }
    
    return localList;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'assessments');
    return localList;
  }
}"""

content = content.replace(old_fetch, new_fetch)

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
