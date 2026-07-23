import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Make sure fetchFirebaseAttendance, fetchFirebaseStudents are imported.
imports_old = """  fetchFirebaseRecords,
  saveFirebaseAssessmentRecord,
  deleteFirebaseAssessmentRecord,
  testFirebaseConnection,
} from './lib/firebase';"""

imports_new = """  fetchFirebaseRecords,
  saveFirebaseAssessmentRecord,
  deleteFirebaseAssessmentRecord,
  testFirebaseConnection,
  fetchFirebaseAttendance,
  fetchFirebaseStudents,
} from './lib/firebase';"""
content = content.replace(imports_old, imports_new)

# Modify loadData
load_data_old = """  const loadData = async () => {
    if (!teacher.id || teacher.id === DEFAULT_TEACHER.id) return;
    
    try {
      const firebaseData = await fetchFirebaseRecords(teacher.id);
      setRecords(firebaseData);
      setIsFirebaseConnected(true);
    } catch (e) {
      console.warn("Failed to load records from Firebase, using local cache");
      setIsFirebaseConnected(false);
      // Local is already loaded by default state
    }
  };"""

load_data_new = """  const loadData = async () => {
    if (!teacher.id || teacher.id === DEFAULT_TEACHER.id) return;
    
    try {
      const firebaseData = await fetchFirebaseRecords(teacher.id);
      setRecords(firebaseData);
      
      // Sync Attendance and Students too
      const fbAttendance = await fetchFirebaseAttendance(teacher.id);
      if (fbAttendance && fbAttendance.length > 0) {
        localStorage.setItem('school_assessments_attendance_v1', JSON.stringify(fbAttendance));
      }
      
      const fbStudents = await fetchFirebaseStudents(teacher.id);
      if (fbStudents && fbStudents.length > 0) {
        localStorage.setItem('school_assessments_students_roster_v1', JSON.stringify(fbStudents));
      }
      
      setIsFirebaseConnected(true);
    } catch (e) {
      console.warn("Failed to load records from Firebase, using local cache");
      setIsFirebaseConnected(false);
      // Local is already loaded by default state
    }
  };"""
content = content.replace(load_data_old, load_data_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)

