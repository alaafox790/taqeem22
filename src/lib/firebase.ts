import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  query,
  where,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AssessmentRecord } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Pass firestoreDatabaseId when initializing getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const STORAGE_KEY = 'school_assessments_archive_v1';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

// Connection test on boot
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection successful');
  } catch (error) {
    if (error instanceof Error && error.message.includes('client is offline')) {
      console.warn('Firebase client is offline, using local cache.');
    }
  }
}

// LocalStorage helpers
export function getLocalRecords(): AssessmentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local records:', e);
    return [];
  }
}

export function saveLocalRecords(records: AssessmentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving local records:', e);
  }
}

// Fetch records from Firestore with local fallback

export async function fetchRawFirebaseRecords(teacherId: string): Promise<AssessmentRecord[]> {
  try {
    const q = query(collection(db, 'assessments'), where('teacher_id', '==', teacherId));
    const querySnapshot = await getDocs(q);
    const fetched: AssessmentRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      fetched.push(docSnap.data() as AssessmentRecord);
    });
    return fetched;
  } catch (err) {
    console.error("Error fetching raw records:", err);
    return [];
  }
}

export async function fetchFirebaseRecords(teacherId: string): Promise<AssessmentRecord[]> {
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
}

// Save or Replace record in Firestore + LocalStorage
export async function saveFirebaseAssessmentRecord(
  newRecord: AssessmentRecord,
  existingIdToReplace?: string
): Promise<{ success: boolean; record: AssessmentRecord; message?: string }> {
  let records = getLocalRecords();

  if (existingIdToReplace && existingIdToReplace !== newRecord.id) {
    records = records.filter((r) => r.id !== existingIdToReplace);
  } else {
    records = records.filter((r) => r.id !== newRecord.id);
  }

  records.unshift(newRecord);
  saveLocalRecords(records);

  try {
    if (existingIdToReplace && existingIdToReplace !== newRecord.id) {
      await deleteDoc(doc(db, 'assessments', existingIdToReplace));
    }
    await setDoc(doc(db, 'assessments', newRecord.id), newRecord);
    return { success: true, record: newRecord };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `assessments/${newRecord.id}`);
    return {
      success: true,
      record: newRecord,
      message: 'تم الحفظ محلياً (تعذر الاتصال بـ Firebase حالياً)',
    };
  }
}

// Delete record in Firestore + LocalStorage
export async function deleteFirebaseAssessmentRecord(id: string): Promise<boolean> {
  const records = getLocalRecords().filter((r) => r.id !== id);
  saveLocalRecords(records);

  try {
    await deleteDoc(doc(db, 'assessments', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `assessments/${id}`);
  }
  return true;
}

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

export async function deleteFirebaseAttendance(attendanceId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'attendance', attendanceId));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `attendance/${attendanceId}`);
    return false;
  }
}

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
    // Update last sync time
    localStorage.setItem(`last_sync_time_${teacherId}`, new Date().toISOString());
    return true;

  } catch (err) {
    console.error('Error syncing offline records:', err);
    return false;
  }
}

export function getLastSyncTime(teacherId: string): string | null {
  return localStorage.getItem(`last_sync_time_${teacherId}`);
}
