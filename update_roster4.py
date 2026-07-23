import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# 1. Add Lock import
content = content.replace(
    '} from \'lucide-react\';',
    '  Lock\n} from \'lucide-react\';'
)

# 2. Update renderAttendanceButton disabled state
old_unlocked = """const renderAttendanceButton = (studentId: string, studentName: string, assessNum: number) => {
    const isUnlocked = unlockedAssessments.has(assessNum);
    if (!isUnlocked) {
      return <div className="text-center text-slate-200 font-bold w-6 h-6 flex items-center justify-center mx-auto text-xs" title="لم يتم تسجيل التقييم">-</div>;
    }"""
new_unlocked = """const renderAttendanceButton = (studentId: string, studentName: string, assessNum: number) => {
    const isUnlocked = unlockedAssessments.has(assessNum);
    if (!isUnlocked) {
      return (
        <div 
          className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto cursor-not-allowed" 
          title="برجاء تسجيل تقييمات هذا الأسبوع أولاً"
        >
          <Lock className="w-3 h-3 text-slate-300" />
        </div>
      );
    }"""
content = content.replace(old_unlocked, new_unlocked)

# 3. Change "الأسبوع {num}" to "س {num}"
content = content.replace('<span className="text-slate-300 text-[10px] block mb-0.5">الأسبوع</span>{num}', '<span className="text-slate-300 text-[10px] block mb-0.5">س</span>{num}')

# 4. Reduce width of assessment column header
# currently: <th key={num} className="p-3 text-center w-14 border-b border-l border-slate-700 whitespace-nowrap px-4">
content = content.replace('w-14 border-b border-l border-slate-700 whitespace-nowrap px-4', 'w-8 border-b border-l border-slate-700 whitespace-nowrap px-1')

# 5. LocalStorage pinning state for Grade and Class
# First, find the state declarations
old_states = """  // Selected Grade & Class
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClassNum, setSelectedClassNum] = useState<number | ''>('');"""

new_states = """  // Selected Grade & Class
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    return localStorage.getItem('school_pinned_grade') || '';
  });
  const [selectedClassNum, setSelectedClassNum] = useState<number | ''>(() => {
    const pinned = localStorage.getItem('school_pinned_class');
    return pinned ? Number(pinned) : '';
  });
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    return localStorage.getItem('school_is_pinned') === 'true';
  });

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsPinned(checked);
    if (checked) {
      localStorage.setItem('school_is_pinned', 'true');
      localStorage.setItem('school_pinned_grade', selectedGrade);
      localStorage.setItem('school_pinned_class', selectedClassNum.toString());
    } else {
      localStorage.setItem('school_is_pinned', 'false');
      localStorage.removeItem('school_pinned_grade');
      localStorage.removeItem('school_pinned_class');
    }
  };

  useEffect(() => {
    if (isPinned) {
      localStorage.setItem('school_pinned_grade', selectedGrade);
      localStorage.setItem('school_pinned_class', selectedClassNum.toString());
    }
  }, [selectedGrade, selectedClassNum, isPinned]);"""
content = content.replace(old_states, new_states)

# 6. Add checkbox UI
old_selectors = """      {/* Selectors Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">"""

new_selectors = """      {/* Selectors Row */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">"""

# Close the grid div and add the checkbox
old_class_select_end = """              <svg className="w-4 h-4 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>"""

new_class_select_end = """              <svg className="w-4 h-4 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
            <input 
              type="checkbox" 
              checked={isPinned}
              onChange={handlePinChange}
              className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] border-slate-300"
            />
            تثبيت الفصل (حفظ الاختيار)
          </label>
        </div>
      </div>"""

content = content.replace(old_selectors, new_selectors)
content = content.replace(old_class_select_end, new_class_select_end, 1)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

