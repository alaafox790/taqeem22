import re

with open('src/lib/constants.ts', 'r') as f:
    content = f.read()

old_months = re.search(r'export const MONTHS_DATA: MonthInfo\[\] = \[.*?\n\];', content, re.DOTALL)

new_months = """export const MONTHS_DATA: MonthInfo[] = [
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
];"""

if old_months:
    content = content.replace(old_months.group(0), new_months)
    with open('src/lib/constants.ts', 'w') as f:
        f.write(content)

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

content = content.replace('const assessmentsCount = 20;', 'const assessmentsCount = 15;')

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

