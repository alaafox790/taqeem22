import re

with open('src/components/TeacherProfileModal.tsx', 'r') as f:
    content = f.read()

# Regular expression to match the entire grid block
pattern = r'(<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">)(.*?)(</div>\s*</div>\s*\{/\* Action Footer \*/\})'

new_fields = """              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">اسم المعلم *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                  placeholder="مثال: د. أحمد محمود"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">كود / رقم المعلم *</label>
                <input
                  type="text"
                  required
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                  placeholder="مثال: T-1001"
                />
              </div>

              <div>
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
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">اسم المدرسة</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                  placeholder="مثال: مدرسة الأمل النموذجية"
                />
              </div>
              
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم هاتف مدير المدرسة (للربط)</label>
                <input
                  type="tel"
                  value={principalPhone}
                  onChange={(e) => setPrincipalPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                  placeholder="05xxxxxxxxx"
                  dir="ltr"
                />
              </div>
              
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم هاتف وكيل شئون الطلاب (للربط)</label>
                <input
                  type="tel"
                  value={deputyPhone}
                  onChange={(e) => setDeputyPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                  placeholder="05xxxxxxxxx"
                  dir="ltr"
                />
              </div>
              
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم هاتف مشرف المادة (للربط)</label>
                <input
                  type="tel"
                  value={supervisorPhone}
                  onChange={(e) => setSupervisorPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                  placeholder="05xxxxxxxxx"
                  dir="ltr"
                />
              </div>
            """

content = re.sub(pattern, r'\g<1>\n' + new_fields + r'\n\g<3>', content, flags=re.DOTALL)

with open('src/components/TeacherProfileModal.tsx', 'w') as f:
    f.write(content)
