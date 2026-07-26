import { Student } from '../types';

/**
 * Generates a unique student login code in format ST-XXXX (e.g. ST-4821)
 */
export function generateStudentCode(existingCodes: Set<string>): string {
  let code = '';
  let attempts = 0;
  do {
    const num = Math.floor(10000 + Math.random() * 90000);
    code = `${num}`;
    attempts++;
  } while (existingCodes.has(code) && attempts < 1000);
  return code;
}

/**
 * Ensures all students have a valid studentNumber (login code).
 * Generates missing codes for any student that doesn't have one.
 */
export function autoAssignStudentCodes(students: Student[]): { updatedStudents: Student[]; generatedCount: number } {
  const existingCodes = new Set<string>();
  
  students.forEach((s) => {
    if (s.studentNumber && s.studentNumber.trim()) {
      existingCodes.add(s.studentNumber.trim().toUpperCase());
    }
  });

  let generatedCount = 0;
  const updatedStudents = students.map((s) => {
    if (!s.studentNumber || !s.studentNumber.trim()) {
      const newCode = generateStudentCode(existingCodes);
      existingCodes.add(newCode);
      generatedCount++;
      return { ...s, studentNumber: newCode };
    }
    return s;
  });

  return { updatedStudents, generatedCount };
}

/**
 * Forces regeneration of new unique codes for all students.
 */
export function regenerateAllStudentCodes(students: Student[]): Student[] {
  const existingCodes = new Set<string>();
  return students.map((s) => {
    const newCode = generateStudentCode(existingCodes);
    existingCodes.add(newCode);
    return { ...s, studentNumber: newCode };
  });
}
