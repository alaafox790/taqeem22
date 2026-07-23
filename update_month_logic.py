import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add state
old_records_state = """  // Records archive state
  const [records, setRecords] = useState<AssessmentRecord[]>([]);"""

new_state = """  // Month Assessment Counts state
  const [monthAssessmentCounts, setMonthAssessmentCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('monthAssessments');
    if (saved) return JSON.parse(saved);
    return {
      'm1_sep': 4,
      'm2_oct': 4,
      'm3_nov': 4,
      'm4_dec': 3,
      'm5_jan': 0,
      'm1_feb': 4,
      'm2_mar': 4,
      'm3_apr': 4,
      'm4_may': 3,
      'm5_jun': 0,
    };
  });

  const handleMonthCountChange = (count: number) => {
    const newCounts = { ...monthAssessmentCounts, [selectedMonth.id]: count };
    setMonthAssessmentCounts(newCounts);
    localStorage.setItem('monthAssessments', JSON.stringify(newCounts));
  };

  const dynamicSelectedMonth = React.useMemo(() => {
    const termMonths = MONTHS_DATA.filter(m => m.termId === selectedTerm);
    let currentStart = 1;
    for (const m of termMonths) {
      const count = monthAssessmentCounts[m.id] || 0;
      if (m.id === selectedMonth.id) {
        return {
          ...selectedMonth,
          assessments: Array.from({ length: count }, (_, i) => currentStart + i)
        };
      }
      currentStart += count;
    }
    return selectedMonth;
  }, [selectedMonth, selectedTerm, monthAssessmentCounts]);

  // Records archive state
  const [records, setRecords] = useState<AssessmentRecord[]>([]);"""

content = content.replace(old_records_state, new_state)

# 2. Update ControlBar usage
old_control_bar = """              <ControlBar
                academicYear={academicYear}
                onAcademicYearChange={handleAcademicYearChange}
                selectedTerm={selectedTerm}
                onTermChange={setSelectedTerm}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />"""

new_control_bar = """              <ControlBar
                academicYear={academicYear}
                onAcademicYearChange={handleAcademicYearChange}
                selectedTerm={selectedTerm}
                onTermChange={setSelectedTerm}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                selectedMonthCount={monthAssessmentCounts[selectedMonth.id] || 0}
                onMonthCountChange={handleMonthCountChange}
              />"""
content = content.replace(old_control_bar, new_control_bar)

# 3. Update AssessmentGrid usage
old_assessment_grid = """              <AssessmentGrid
                selectedMonth={selectedMonth}
                records={records}
                onSelectAssessment={(num) => setActiveAssessNum(num)}
                academicYear={academicYear}
                teacherId={teacher.id}
              />"""

new_assessment_grid = """              <AssessmentGrid
                selectedMonth={dynamicSelectedMonth}
                records={records}
                onSelectAssessment={(num) => setActiveAssessNum(num)}
                academicYear={academicYear}
                teacherId={teacher.id}
              />"""
content = content.replace(old_assessment_grid, new_assessment_grid)

# 4. Update AssessmentModal usage
old_modal = """        <AssessmentModal
          isOpen={true}
          onClose={() => setActiveAssessNum(null)}
          assessNum={activeAssessNum}
          selectedMonth={selectedMonth}
          academicYear={academicYear}
          selectedTerm={selectedTerm}
          teacherId={teacher.id}
          onSave={handleAssessmentSubmit}
        />"""

new_modal = """        <AssessmentModal
          isOpen={true}
          onClose={() => setActiveAssessNum(null)}
          assessNum={activeAssessNum}
          selectedMonth={dynamicSelectedMonth}
          academicYear={academicYear}
          selectedTerm={selectedTerm}
          teacherId={teacher.id}
          onSave={handleAssessmentSubmit}
        />"""
content = content.replace(old_modal, new_modal)

with open('src/App.tsx', 'w') as f:
    f.write(content)

