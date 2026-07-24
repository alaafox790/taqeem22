import re

with open('src/components/LateAssessments.tsx', 'r') as f:
    content = f.read()

old_logic = """  const lateAssessments = useMemo(() => {
    if (!students.length) return [];

    // Calculate maximum expected assessments up to current date for the SELECTED term
    let expectedAssessments = 15;
    const today = new Date();
    const currentMonthNum = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();
    
    try {
      const [y1, y2] = academicYear.split('/').map(Number);
      
      // If we are looking at a past academic year, expected is always 15
      if (currentYear > (y2 || y1 + 1)) {
        expectedAssessments = 15;
      } 
      // If we are looking at a future academic year, expected is 0 (or up to the current date if it's started)
      else if (currentYear < y1) {
        expectedAssessments = 0;
      }
      // We are in the current academic year
      else {
        // If viewing term 1
        if (selectedTerm === 'term1') {
          if ([9, 10, 11, 12, 1].includes(currentMonthNum) && currentYear === (currentMonthNum >= 9 ? y1 : (y2 || y1 + 1))) {
            if (currentMonthNum === 9) expectedAssessments = 3;
            else if (currentMonthNum === 10) expectedAssessments = 6;
            else if (currentMonthNum === 11) expectedAssessments = 9;
            else if (currentMonthNum === 12) expectedAssessments = 12;
            else if (currentMonthNum === 1) expectedAssessments = 15;
          } else if ([2, 3, 4, 5, 6, 7, 8].includes(currentMonthNum) && currentYear === (y2 || y1 + 1)) {
            // Past term 1
            expectedAssessments = 15;
          } else {
            expectedAssessments = 0;
          }
        } 
        // If viewing term 2
        else if (selectedTerm === 'term2') {
          if ([2, 3, 4, 5, 6].includes(currentMonthNum) && currentYear === (y2 || y1 + 1)) {
            if (currentMonthNum === 2) expectedAssessments = 3;
            else if (currentMonthNum === 3) expectedAssessments = 6;
            else if (currentMonthNum === 4) expectedAssessments = 9;
            else if (currentMonthNum === 5) expectedAssessments = 12;
            else if (currentMonthNum === 6) expectedAssessments = 15;
          } else if ([7, 8].includes(currentMonthNum) && currentYear === (y2 || y1 + 1)) {
            // Past term 2
            expectedAssessments = 15;
          } else if ([9, 10, 11, 12, 1].includes(currentMonthNum) && currentYear === y1) {
            // Term 2 hasn't started yet
            expectedAssessments = 0;
          } else {
             expectedAssessments = 15; // default fallback if past year
          }
        }
      }
    } catch (e) {
      expectedAssessments = 15;
    }

    // However, if the teacher has manually recorded an assessment BEYOND the expected (e.g. testing),
    // we should consider everything up to that max as expected, so skipped ones are caught.
    // We get the max assessment number across all records for the selected term and academic year.
    const termRecords = records.filter(r => r.academic_year === academicYear && r.term_id === selectedTerm);
    const maxRecorded = termRecords.length > 0 ? Math.max(...termRecords.map(r => r.assess_num)) : 0;
    expectedAssessments = Math.max(expectedAssessments, maxRecorded);

    // Get unique classes the teacher has
    const classSet = new Set<string>(students.map(s => `${s.grade}-${s.class_num}`));
    const classes = Array.from(classSet).map(c => {
      const [grade, classNum] = c.split('-');
      return { grade, classNum: parseInt(classNum, 10) };
    });

    const lateList: any[] = [];

    classes.forEach(cls => {
      // Find records for this class in current term
      const classRecords = termRecords.filter(r => r.grade === cls.grade && r.class_num === cls.classNum);
      const completedSet = new Set(classRecords.map(r => r.assess_num));

      for (let i = 1; i <= expectedAssessments; i++) {
        if (!completedSet.has(i)) {
          // Find which month this assessment belongs to
          const monthInfo = MONTHS_DATA.find(m => m.termId === selectedTerm && m.assessments.includes(i));
          if (monthInfo) {
            lateList.push({
              grade: cls.grade,
              classNum: cls.classNum,
              assessNum: i,
              monthInfo,
              termId: selectedTerm
            });
          }
        }
      }
    });"""

new_logic = """  const lateAssessments = useMemo(() => {
    if (!students.length) return [];

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthNum = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate();

    let y1 = currentYear, y2 = currentYear + 1;
    try {
      const parts = academicYear.split('/').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        y1 = parts[0];
        y2 = parts[1];
      }
    } catch (e) {}

    const termRecords = records.filter(r => r.academic_year === academicYear && r.term_id === selectedTerm);

    // Get unique classes the teacher has
    const classSet = new Set<string>(students.map(s => `${s.grade}-${s.class_num}`));
    const classes = Array.from(classSet).map(c => {
      const [grade, classNum] = c.split('-');
      return { grade, classNum: parseInt(classNum, 10) };
    });

    const lateList: any[] = [];

    classes.forEach(cls => {
      // Find records for this class in current term
      const classRecords = termRecords.filter(r => r.grade === cls.grade && r.class_num === cls.classNum);
      const completedSet = new Set(classRecords.map(r => r.assess_num));
      const maxRecorded = classRecords.length > 0 ? Math.max(...classRecords.map(r => r.assess_num)) : 0;

      for (let i = 1; i <= 15; i++) {
        if (!completedSet.has(i)) {
          // Find which month this assessment belongs to
          const monthInfo = MONTHS_DATA.find(m => m.termId === selectedTerm && m.assessments.includes(i));
          if (monthInfo) {
            let isOverdue = false;
            
            // 1. Is it skipped (i.e., teacher recorded a later assessment but skipped this one)?
            if (i < maxRecorded) {
              isOverdue = true;
            } else {
              // 2. Is it past its due date based on precise month periods?
              const yearForMonth = monthInfo.monthNumber >= 8 ? y1 : y2;
              
              if (currentYear > yearForMonth || (currentYear === yearForMonth && currentMonthNum > monthInfo.monthNumber)) {
                isOverdue = true;
              } else if (currentYear === yearForMonth && currentMonthNum === monthInfo.monthNumber) {
                const count = monthInfo.assessments.length;
                const index = monthInfo.assessments.indexOf(i);
                if (count > 0 && index !== -1) {
                  const daysInMonth = new Date(yearForMonth, monthInfo.monthNumber, 0).getDate();
                  const periodLength = daysInMonth / count;
                  const dueDateDay = Math.round(periodLength * (index + 1));
                  
                  if (currentDay > dueDateDay) {
                    isOverdue = true;
                  }
                }
              }
            }

            if (isOverdue) {
              lateList.push({
                grade: cls.grade,
                classNum: cls.classNum,
                assessNum: i,
                monthInfo,
                termId: selectedTerm
              });
            }
          }
        }
      }
    });"""

content = content.replace(old_logic, new_logic)

with open('src/components/LateAssessments.tsx', 'w') as f:
    f.write(content)
