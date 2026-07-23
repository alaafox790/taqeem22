import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

unused_block = """  // Determine which assessments are recorded by the teacher for this class
  const unlockedAssessments = useMemo(() => {
    const unlocked = new Set<number>();
    if (records) {
      records.forEach(r => {
        if (r.term_id === selectedTerm && r.grade === selectedGrade && r.class_num === selectedClassNum) {
          unlocked.add(r.assess_num);
        }
      });
    }
    return unlocked;
  }, [records, selectedTerm, selectedGrade, selectedClassNum]);"""

content = content.replace(unused_block, '')

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

