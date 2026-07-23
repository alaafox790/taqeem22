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
export async function fetchFirebaseRecords(teacherId: string): Promise<AssessmentRecord[]> {
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
