import { MonthInfo, TimingCheckResult } from '../types';

/**
 * Checks selected date against the month configuration and determines period (start, mid, end)
 */
export function validateAssessmentTiming(
  dateString: string,
  monthInfo: MonthInfo
): TimingCheckResult {
  if (!dateString) {
    return {
      isValidMonth: false,
      period: 'start',
      periodLabel: 'غير محدد',
      isExceptional: true,
      warningMessage: 'يرجى اختيار تاريخ التقييم.',
    };
  }

  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) {
    return {
      isValidMonth: false,
      period: 'start',
      periodLabel: 'تاريخ غير صالح',
      isExceptional: true,
      warningMessage: 'صيغة التاريخ غير صحيحة.',
    };
  }

  const dayNumber = dateObj.getDate();
  const dateMonthNum = dateObj.getMonth() + 1; // 1-12

  // Determine period in month
  let period: 'start' | 'mid' | 'end' = 'start';
  let periodLabel = 'أول الشهر (1 - 10)';

  if (dayNumber <= 10) {
    period = 'start';
    periodLabel = 'أول الشهر (1 - 10)';
  } else if (dayNumber <= 20) {
    period = 'mid';
    periodLabel = 'منتصف الشهر (11 - 20)';
  } else {
    period = 'end';
    periodLabel = 'آخر الشهر (21 - 31)';
  }

  // Check if month matches selected monthInfo
  const isValidMonth = dateMonthNum === monthInfo.monthNumber;
  
  let isExceptional = false;
  let warningMessage: string | undefined = undefined;

  if (!isValidMonth) {
    isExceptional = true;
    warningMessage = `التاريخ المختار ينتمي لشهر (${dateMonthNum}) بينما الشهر المختار في السجل هو (${monthInfo.name}).`;
  }

  return {
    isValidMonth,
    period,
    periodLabel,
    isExceptional,
    warningMessage,
  };
}

/**
 * Validates academic year format, e.g. 2026/2027
 */
export function isValidAcademicYear(yearStr: string): boolean {
  if (!yearStr || !yearStr.trim()) return false;
  const regex = /^\d{4}\/\d{4}$/;
  return regex.test(yearStr.trim());
}

export function isTeacherProfileComplete(teacher: any): boolean {
  if (!teacher) return false;

  const name = teacher.name?.trim();
  const school = teacher.school?.trim();
  const subject = teacher.subject?.trim();
  const phone = teacher.phone?.trim();
  const principalPhone = teacher.principalPhone?.trim();
  const deputyPhone = teacher.deputyPhone?.trim();
  const supervisorPhone = teacher.supervisorPhone?.trim();

  // Name check: must exist and not be placeholder
  if (!name || name.includes('اضغط للتعديل') || name.length < 3) {
    return false;
  }

  // School and Subject
  if (!school || school.length < 2) return false;
  if (!subject || subject.length < 2) return false;

  // Phones must exist and be at least 8 digits
  if (!phone || phone.length < 8) return false;
  if (!principalPhone || principalPhone.length < 8) return false;
  if (!deputyPhone || deputyPhone.length < 8) return false;
  if (!supervisorPhone || supervisorPhone.length < 8) return false;

  return true;
}

/**
 * Calculates adjusted due date by pushing the due date forward for each official holiday
 */
export function getAdjustedDueDate(year: number, month: number, originalDueDate: number, officialHolidays: string[]): number {
  if (!officialHolidays || officialHolidays.length === 0) return originalDueDate;
  
  const holidaysInMonth = officialHolidays
    .map(d => new Date(d))
    .filter(d => d.getFullYear() === year && d.getMonth() + 1 === month)
    .map(d => d.getDate())
    .sort((a, b) => a - b);
    
  let adjustedDueDate = originalDueDate;
  for (const hDay of holidaysInMonth) {
    if (hDay <= adjustedDueDate) {
      adjustedDueDate++;
    }
  }
  
  return adjustedDueDate;
}

/**
 * Checks if a given date string falls on an official holiday, weekend, or teacher-registered holiday
 */
export function checkOfficialHoliday(
  dateString: string,
  teacherHolidays?: string[]
): { isHoliday: boolean; reason: string } {
  if (!dateString) return { isHoliday: false, reason: '' };

  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return { isHoliday: false, reason: '' };

  const dayOfWeek = dateObj.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat

  if (dayOfWeek === 5) {
    return { isHoliday: true, reason: 'يوم الجمعة (إجازة أسبوعية رسمية)' };
  }
  if (dayOfWeek === 6) {
    return { isHoliday: true, reason: 'يوم السبت (إجازة أسبوعية)' };
  }

  // Check teacher's configured official holidays
  if (teacherHolidays && teacherHolidays.length > 0) {
    const matched = teacherHolidays.find(
      (h) => h === dateString || (h && h.trim() && dateString.includes(h.trim()))
    );
    if (matched) {
      return {
        isHoliday: true,
        reason: `عطلة رسمية مسجلة في بيانات المعلم (${matched})`,
      };
    }
  }

  return { isHoliday: false, reason: '' };
}
