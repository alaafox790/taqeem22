import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

old_loop = """      for (const num of assessmentsToDisplay) {
        const status = getAttendanceStatus(s.id, num);
        let statusText = '-';
        if (status === 'present') statusText = 'حاضر';
        else if (status === 'absent') statusText = 'غائب';
        else if (status === 'excused') statusText = 'بعذر';
        rowData.push(statusText);
      }"""

new_loop = """      for (const num of assessmentsToDisplay) {
        const isHoliday = records.some(r => 
          r.grade === selectedGrade && 
          r.class_num.toString() === selectedClassNum && 
          r.term_id === selectedTerm && 
          r.assess_num === num && 
          r.is_holiday
        );
        
        if (isHoliday) {
          rowData.push('عطلة');
          continue;
        }

        const status = getAttendanceStatus(s.id, num);
        let statusText = '-';
        if (status === 'present') statusText = 'حاضر';
        else if (status === 'absent') statusText = 'غائب';
        else if (status === 'excused') statusText = 'بعذر';
        rowData.push(statusText);
      }"""

content = content.replace(old_loop, new_loop)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
