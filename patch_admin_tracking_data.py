import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

tracking_memo = """
  const trackingData = useMemo(() => {
    // 1. Unlinked Teachers
    const schoolsManaged = Array.from(new Set(allTeachers.map(t => t.school)));
    const unlinkedTeachers = globalTeachers.filter(t => {
      if (!schoolsManaged.includes(t.school)) return false;
      if (adminRole === 'principal') return !t.principalPhone;
      if (adminRole === 'deputy') return !t.deputyPhone;
      if (adminRole === 'supervisor') return !t.supervisorPhone;
      return false;
    });

    // 2. Late Teachers
    const currentMonth = new Date().getMonth() + 1;
    let expectedAssessments = 15;
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
      expectedAssessments = 15; 
    }
    const currentTerm = [9, 10, 11, 12, 1].includes(currentMonth) ? 'term1' : 'term2';

    const teachersWithLate = allTeachers.map(teacher => {
      const tRecords = trackingRecords.filter(r => r.teacher_id === teacher.id && r.term_id === currentTerm);
      const classSet = new Set<string>();
      tRecords.forEach(r => classSet.add(`${r.grade}-${r.class_num}`));
      
      let missedTotal = 0;
      classSet.forEach(classId => {
        const classRecords = tRecords.filter(r => `${r.grade}-${r.class_num}` === classId);
        const uniqueAssessments = new Set(classRecords.map(r => r.assess_num));
        const completedCount = uniqueAssessments.size;
        const missedCount = Math.max(0, expectedAssessments - completedCount);
        missedTotal += missedCount;
      });
      
      return {
        teacher,
        missedTotal,
        classesCount: classSet.size
      };
    }).filter(t => t.missedTotal > 0).sort((a, b) => b.missedTotal - a.missedTotal);

    return { unlinkedTeachers, teachersWithLate };
  }, [globalTeachers, allTeachers, trackingRecords, adminRole]);

"""

content = content.replace(
    "  // Get teachers to display",
    tracking_memo + "  // Get teachers to display"
)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)

