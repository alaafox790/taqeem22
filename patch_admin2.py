import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

old_logic = """  const classChartData = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    let expectedAssessments = 15;
    
    // Determine expected assessments based on current month
    if ([9, 10, 11, 12, 1].includes(currentMonth)) {
      if (currentMonth === 9) expectedAssessments = 3;
      if (currentMonth === 10) expectedAssessments = 6;
      if (currentMonth === 11) expectedAssessments = 9;
      if (currentMonth === 12) expectedAssessments = 12;
      if (currentMonth === 1) expectedAssessments = 15;
    } else if ([2, 3, 4, 5, 6].includes(currentMonth)) {
      if (currentMonth === 2) expectedAssessments = 3;
      if (currentMonth === 3) expectedAssessments = 6;
      if (currentMonth === 4) expectedAssessments = 9;
      if (currentMonth === 5) expectedAssessments = 12;
      if (currentMonth === 6) expectedAssessments = 15;
    } else {
      expectedAssessments = 15; // Summer break
    }

    const currentTerm = [9, 10, 11, 12, 1].includes(currentMonth) ? 'term1' : 'term2';

    const classSet = new Set<string>(teacherStudents.map(s => `${s.grade}-${s.class_num}`));
    teacherRecords.forEach(r => classSet.add(`${r.grade}-${r.class_num}`));"""

new_logic = """  const classChartData = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    let expectedAssessments = 15;
    
    // Determine expected assessments based on current month
    if ([9, 10, 11, 12, 1].includes(currentMonth)) {
      if (currentMonth === 9) expectedAssessments = 3;
      if (currentMonth === 10) expectedAssessments = 6;
      if (currentMonth === 11) expectedAssessments = 9;
      if (currentMonth === 12) expectedAssessments = 12;
      if (currentMonth === 1) expectedAssessments = 15;
    } else if ([2, 3, 4, 5, 6].includes(currentMonth)) {
      if (currentMonth === 2) expectedAssessments = 3;
      if (currentMonth === 3) expectedAssessments = 6;
      if (currentMonth === 4) expectedAssessments = 9;
      if (currentMonth === 5) expectedAssessments = 12;
      if (currentMonth === 6) expectedAssessments = 15;
    } else {
      expectedAssessments = 15; // Summer break
    }

    const currentTerm = [9, 10, 11, 12, 1].includes(currentMonth) ? 'term1' : 'term2';
    
    // Also consider max recorded in case the teacher is ahead or catching up on previous term
    const termRecords = teacherRecords.filter(r => r.term_id === currentTerm);
    const maxRecorded = termRecords.length > 0 ? Math.max(...termRecords.map(r => r.assess_num)) : 0;
    expectedAssessments = Math.max(expectedAssessments, maxRecorded);

    const classSet = new Set<string>(teacherStudents.map(s => `${s.grade}-${s.class_num}`));
    teacherRecords.forEach(r => classSet.add(`${r.grade}-${r.class_num}`));"""

content = content.replace(old_logic, new_logic)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
