import re

with open('src/components/TeacherProfileModal.tsx', 'r') as f:
    content = f.read()

# Fix handle save
old_submit = """    onSaveTeacher({
      id: id.trim() || 'T-1001',
      name: name.trim() || 'المعلم الفاضل',
      subject: subject.trim() || 'العامة',
      school: school.trim() || 'المدرسة',
      supervisorPhone: supervisorPhone.trim(),
      principalPhone: principalPhone.trim(),
      deputyPhone: deputyPhone.trim(),
    });"""

new_submit = """    onSaveTeacher({
      id: id.trim() || 'T-1001',
      name: name.trim() || 'المعلم الفاضل',
      subject: subject.trim() || 'العامة',
      school: school.trim() || 'المدرسة',
      supervisorPhone: supervisorPhone.trim(),
      principalPhone: principalPhone.trim(),
      deputyPhone: deputyPhone.trim(),
      subjectIcon: subjectIcon,
      officialHolidays: officialHolidays,
    });"""

content = content.replace(old_submit, new_submit)

# Add icon UI
old_subject_field = """              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">المادة الدراسية</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                >
                  <option value="اللغة العربية">اللغة العربية</option>
                  <option value="اللغة الانجليزية">اللغة الانجليزية</option>
                  <option value="الدراسات الاجتماعية">الدراسات الاجتماعية</option>
                  <option value="العلوم">العلوم</option>
                  <option value="الرياضيات">الرياضيات</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>"""

new_subject_field = """              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">المادة الدراسية</label>
                <div className="flex gap-2">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                  >
                    <option value="اللغة العربية">اللغة العربية</option>
                    <option value="اللغة الانجليزية">اللغة الانجليزية</option>
                    <option value="الدراسات الاجتماعية">الدراسات الاجتماعية</option>
                    <option value="العلوم">العلوم</option>
                    <option value="الرياضيات">الرياضيات</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                  
                  <div className="relative group">
                    <select
                      value={subjectIcon}
                      onChange={(e) => setSubjectIcon(e.target.value)}
                      className="w-14 appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50 text-center"
                      title="أيقونة المادة"
                    >
                      <option value="Book">📖</option>
                      <option value="Calculator">➗</option>
                      <option value="Globe">🌍</option>
                      <option value="FlaskConical">🧪</option>
                      <option value="Languages">🔤</option>
                      <option value="Music">🎵</option>
                      <option value="Palette">🎨</option>
                      <option value="PenTool">✒️</option>
                      <option value="Dna">🧬</option>
                      <option value="Code">💻</option>
                    </select>
                  </div>
                </div>
              </div>"""

content = content.replace(old_subject_field, new_subject_field)

with open('src/components/TeacherProfileModal.tsx', 'w') as f:
    f.write(content)
