import { MonthInfo, TermId } from '../types';

export const DEFAULT_TEACHER: { id: string; name: string; subject: string; school: string } = {
  id: 'T-1001',
  name: 'معلم المادة (اضغط للتعديل)',
  subject: 'الرياضيات',
  school: 'المدرسة الابتدائية',
};

export const DEFAULT_ACADEMIC_YEAR = '2026/2027';

export const ACADEMIC_YEAR_SUGGESTIONS = [
  '2025/2026',
  '2026/2027',
  '2027/2028',
];

export const GRADES = [
  'الأول',
  'الثاني',
  'الثالث',
] as const;

export const CLASSES_COUNT = 15; // 1 to 15

export const MONTHS_DATA: MonthInfo[] = [
  // Term 1 Months
  {
    id: 'm1_sep',
    name: 'سبتمبر (الشهر الأول)',
    monthNumber: 9,
    termId: 'term1',
    assessments: [1, 2, 3],
    color: 'bg-orange-600 hover:bg-orange-700'
  },
  {
    id: 'm2_oct',
    name: 'أكتوبر (الشهر الثاني)',
    monthNumber: 10,
    termId: 'term1',
    assessments: [4, 5, 6],
    color: 'bg-emerald-600 hover:bg-emerald-700'
  },
  {
    id: 'm3_nov',
    name: 'نوفمبر (الشهر الثالث)',
    monthNumber: 11,
    termId: 'term1',
    assessments: [7, 8, 9],
    color: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    id: 'm4_dec',
    name: 'ديسمبر (الشهر الرابع)',
    monthNumber: 12,
    termId: 'term1',
    assessments: [10, 11, 12],
    color: 'bg-purple-600 hover:bg-purple-700'
  },
  {
    id: 'm5_jan',
    name: 'يناير (الشهر الخامس)',
    monthNumber: 1,
    termId: 'term1',
    assessments: [13, 14, 15],
    color: 'bg-teal-600 hover:bg-teal-700'
  },
  // Term 2 Months
  {
    id: 'm1_feb',
    name: 'فبراير (الشهر الأول)',
    monthNumber: 2,
    termId: 'term2',
    assessments: [1, 2, 3],
    color: 'bg-rose-600 hover:bg-rose-700'
  },
  {
    id: 'm2_mar',
    name: 'مارس (الشهر الثاني)',
    monthNumber: 3,
    termId: 'term2',
    assessments: [4, 5, 6],
    color: 'bg-indigo-600 hover:bg-indigo-700'
  },
  {
    id: 'm3_apr',
    name: 'أبريل (الشهر الثالث)',
    monthNumber: 4,
    termId: 'term2',
    assessments: [7, 8, 9],
    color: 'bg-pink-600 hover:bg-pink-700'
  },
  {
    id: 'm4_may',
    name: 'مايو (الشهر الرابع)',
    monthNumber: 5,
    termId: 'term2',
    assessments: [10, 11, 12],
    color: 'bg-cyan-600 hover:bg-cyan-700'
  },
  {
    id: 'm5_jun',
    name: 'يونيو (الشهر الخامس)',
    monthNumber: 6,
    termId: 'term2',
    assessments: [13, 14, 15],
    color: 'bg-amber-600 hover:bg-amber-700'
  },
];

/**
 * Strategy function to automatically assign Form A / B / C based on assessment number
 */
export function getFormModel(assessNum: number): 'أ' | 'ب' | 'ج' {
  const rem = assessNum % 3;
  if (rem === 1) return 'أ';
  if (rem === 2) return 'ب';
  return 'ج';
}

export function getFormDescription(form: 'أ' | 'ب' | 'ج'): string {
  switch (form) {
    case 'أ':
      return 'نموذج أ: قياس المهارات الأساسية والمفاهيم الأولية';
    case 'ب':
      return 'نموذج ب: قياس التطبيق والتحليل الرياضي';
    case 'ج':
      return 'نموذج ج: قياس التفكير الناقد والمهارات العليا';
  }
}
