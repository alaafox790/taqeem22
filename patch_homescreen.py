import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

# Add import for MONTHS_DATA
content = content.replace(
    "import { AppTab, TeacherProfile, AssessmentRecord, MonthInfo, TermId } from '../types';",
    "import { AppTab, TeacherProfile, AssessmentRecord, MonthInfo, TermId } from '../types';\nimport { MONTHS_DATA } from '../lib/constants';"
)

# Add logic for current month and count
logic = """export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, teacher, onOpenProfile, records, selectedTerm, academicYear, onOpenAssessment }) => {
  const currentMonthNumber = new Date().getMonth() + 1;
  let activeMonth = MONTHS_DATA.find(m => m.monthNumber === currentMonthNumber);
  if (!activeMonth) {
    activeMonth = MONTHS_DATA.find(m => m.termId === selectedTerm);
  }
  
  const currentMonthRecords = records.filter(r => activeMonth && r.month_id === activeMonth.id);
  const assessmentsCount = currentMonthRecords.length;
"""

content = content.replace(
    "export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, teacher, onOpenProfile, records, selectedTerm, academicYear, onOpenAssessment }) => {",
    logic
)

old_p = """        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-slate-500 font-bold tracking-wider relative z-10"
        >
          مدمرة حياتي
        </motion.p>"""

new_p = """        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 mt-3"
        >
          <div className="bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
            <span className="text-xs font-bold text-indigo-800">سجلت هذا الشهر ({activeMonth?.name.split(' ')[0]}):</span>
            <span className="bg-indigo-600 text-white text-xs font-black px-2 py-0.5 rounded-full">{assessmentsCount} تقييم</span>
          </div>
        </motion.div>"""

content = content.replace(old_p, new_p)

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)

