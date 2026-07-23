import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# 1. Update lucide-react imports
if 'Search' not in content:
    content = content.replace("  AlertTriangle\n} from 'lucide-react';", "  AlertTriangle,\n  Search,\n  Filter\n} from 'lucide-react';")

# 2. Add state for search and filter
state_str = """  // Selected Grade & Class
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    return localStorage.getItem('school_pinned_grade') || '';
  });"""
new_state_str = """  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');

  // Selected Grade & Class
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    return localStorage.getItem('school_pinned_grade') || '';
  });"""
content = content.replace(state_str, new_state_str)

# 3. Add search bar to the selectors row
selectors_row = """      {/* Selectors Row */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">"""
new_selectors_row = """      {/* Selectors Row */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرقم المسلسل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-8 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none text-right"
            >
              <option value="all">جميع الحالات</option>
              <option value="present">حاضر</option>
              <option value="absent">غائب</option>
              <option value="excused">بعذر</option>
            </select>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">"""
content = content.replace(selectors_row, new_selectors_row)

# 4. Modify currentStudents array to apply search and filter
current_students_old = """  const currentStudents = useMemo(() => {
    return students.filter(
      (s) => s.grade === selectedGrade && s.class_num === selectedClassNum
    ).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [students, selectedGrade, selectedClassNum]);"""

current_students_new = """  const currentStudents = useMemo(() => {
    let filtered = students.filter(
      (s) => s.grade === selectedGrade && s.class_num === selectedClassNum
    ).sort((a, b) => a.name.localeCompare(b.name, 'ar'));

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      // If query is a number, search by 1-based index
      const isNum = !isNaN(Number(query));
      if (isNum) {
        const targetIndex = Number(query) - 1;
        filtered = filtered.filter((_, idx) => idx === targetIndex);
      } else {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(query));
      }
    }

    if (filterStatus !== 'all') {
      // We need to filter by attendance status. 
      // This is slightly complex because status depends on the specific assessment number.
      // But we can filter if the student has the requested status in ANY of the visible columns.
      // Or we can filter based on the MOST RECENT assessment, but that might be confusing.
      // Let's filter students who have the selected status in ANY of the current term's month assessments.
      
      filtered = filtered.filter(s => {
        // Find if this student has this status in this term
        const hasStatus = attendance.some(a => 
          a.student_id === s.id && 
          a.month_id === selectedTerm && 
          a.status === filterStatus
        );
        return hasStatus;
      });
    }

    return filtered;
  }, [students, selectedGrade, selectedClassNum, searchQuery, filterStatus, attendance, selectedTerm]);"""

content = content.replace(current_students_old, current_students_new)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
