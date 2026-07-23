import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Replace classStudents and add displayedStudents
old_class_students = """  const classStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.grade === selectedGrade &&
        s.class_num === selectedClassNum
    );
  }, [students, selectedGrade, selectedClassNum]);"""

new_class_students = """  const classStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.grade === selectedGrade &&
        s.class_num === selectedClassNum
    ).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [students, selectedGrade, selectedClassNum]);

  const displayedStudents = useMemo(() => {
    let filtered = classStudents.map((student, originalIndex) => ({
      ...student,
      serialNumber: originalIndex + 1
    }));

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const isNum = !isNaN(Number(query));
      if (isNum) {
        const targetNumber = Number(query);
        filtered = filtered.filter(s => s.serialNumber === targetNumber);
      } else {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(query));
      }
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => {
        return attendance.some(a => 
          a.student_id === s.id && 
          a.month_id === selectedTerm && 
          a.status === filterStatus
        );
      });
    }

    return filtered;
  }, [classStudents, searchQuery, filterStatus, attendance, selectedTerm]);"""

content = content.replace(old_class_students, new_class_students)

# replace classStudents.map with displayedStudents.map
content = content.replace("classStudents.length > 0 ? (", "displayedStudents.length > 0 ? (")
content = content.replace("classStudents.map((student, idx)", "displayedStudents.map((student, idx)")
content = content.replace("{idx + 1}</td>", "{student.serialNumber}</td>")

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
