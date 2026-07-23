import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Fix sticky right offsets
content = content.replace('right-[49px]', 'right-[50px]')

# They want the column that was "البيانات" to show the class name in the cells?
# "الغى كلمة البيانات وحط مكانه اسم الفصل"
# So instead of `{student.religion || '-'} / {student.status || '-'}`, they probably want `{selectedGrade} / {selectedClassNum}` or something?
# Or maybe they want nothing in the cells and just the header?
# No, if they want "اسم الفصل" in place of "البيانات", it implies the column is for the class name. Let's make the cells show `{selectedGrade} / {selectedClassNum}`.
# But wait, we already set the header to `{selectedGrade ? \`${selectedGrade} / ${selectedClassNum}\` : 'الفصل'}`
# Let's change the cells to show the same, or maybe the user meant the *column itself* should show the class name for each student?
# Let's make the cells show `{selectedGrade} / {selectedClassNum}` and reduce padding to make them closer.
# Actually, I'll just change the cell content to `{selectedGrade} / {selectedClassNum}`.
content = content.replace('{student.religion || \'-\'} / {student.status || \'-\'}', '{selectedGrade} / {selectedClassNum}')

# The user said "وقلل المسافة بين اسم الطالب واسم الفصل". The name column is w-[140px]. Let's reduce it to w-[120px] maybe, so it's closer?
# Or wait, the column itself has `min-w-[140px]`. Let's reduce to `min-w-[110px] max-w-[110px] w-[110px]`.
# If I change w-[140px] to w-[110px], I must also change the sticky right of the next columns? No, the next column is NOT sticky!
# So the distance between student name and class name is just determined by the padding and the width of the name column.
content = content.replace('min-w-[140px] max-w-[140px] w-[140px]', 'min-w-[120px] max-w-[120px] w-[120px]')

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

