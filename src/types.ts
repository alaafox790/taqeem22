export type TermId = 'term1' | 'term2';

export type AppTab = 'home' | 'assessments' | 'students' | 'stats' | 'reports' | 'search' | 'admin';

export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface Student {
  id: string;
  name: string;
  grade: string; // "الأول", "الثاني", "الثالث"
  class_num: number;
  religion?: 'مسلم' | 'مسيحي';
  status?: 'مستجد' | 'باق';
  parentPhone?: string;
}

export interface StudentAttendance {
  id: string;
  student_id: string;
  student_name: string;
  grade: string;
  class_num: number;
  month_id: string;
  assess_num: number;
  status: AttendanceStatus;
  notes?: string;
  updated_at: string;
  teacher_id?: string;
}

export interface MonthInfo {
  id: string;
  name: string;
  monthNumber: number; // 1 to 12 in year
  termId: TermId;
  assessments: number[];
  color: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  subject: string;
  school: string;
  phone?: string;
  supervisorCode?: string;
  supervisorPhone?: string;
  principalPhone?: string;
  deputyPhone?: string;
  officialHolidays?: string[];
  subjectIcon?: string;
}

export interface AssessmentRecord {
  id: string;
  teacher_id: string;
  academic_year: string;
  term_id: TermId;
  month_id: string;
  assess_num: number; // 1 - 12
  grade: string; // "الأول", "الثاني", "الثالث"
  class_num: number; // 1 - 15
  assess_date: string; // YYYY-MM-DD
  notes: string;
  created_at: string;
  timing_status?: 'normal' | 'exceptional';
  timing_period?: 'start' | 'mid' | 'end';
  model_form?: 'أ' | 'ب' | 'ج' | 'عشوائي';
  is_holiday?: boolean;
  holiday_desc?: string;
}

export interface TimingCheckResult {
  isValidMonth: boolean;
  period: 'start' | 'mid' | 'end';
  periodLabel: string; // "أول الشهر", "منتصف الشهر", "آخر الشهر"
  isExceptional: boolean;
  warningMessage?: string;
}

