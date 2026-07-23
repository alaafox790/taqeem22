import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# 1. Change assessmentsCount
content = re.sub(r'const assessmentsCount = 12;', r'const assessmentsCount = 15;', content)

# 2. Add studentToDelete state
state_block = """  const [religion, setReligion] = useState<'مسلم' | 'مسيحي'>('مسلم');
  const [status, setStatus] = useState<'مستجد' | 'باق'>('مستجد');

  // Delete Modal State
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);"""

content = re.sub(r'  const \[religion, setReligion\] = useState<\'مسلم\' \| \'مسيحي\'>\(\'مسلم\'\);\n  const \[status, setStatus\] = useState<\'مستجد\' \| \'باق\'>\(\'مستجد\'\);', state_block, content)

# 3. Update handleDeleteStudent
old_delete = """  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الطالب ${name}؟`)) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setAttendance((prev) => prev.filter((a) => a.student_id !== id));
    }
  };"""

new_delete = """  const handleDeleteStudent = (id: string, name: string) => {
    setStudentToDelete({ id, name });
  };

  const confirmDeleteStudent = () => {
    if (studentToDelete) {
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      setAttendance((prev) => prev.filter((a) => a.student_id !== studentToDelete.id));
      setStudentToDelete(null);
    }
  };"""

content = content.replace(old_delete, new_delete)

# 4. Change table header text
old_th = r'<th key={num} className="p-3 text-center w-14 border-l border-slate-700">ت {num}</th>'
new_th = r'<th key={num} className="p-3 text-center w-14 border-l border-slate-700 whitespace-nowrap px-4"><span className="text-slate-300 text-[10px] block mb-0.5">الأسبوع</span>{num}</th>'
content = content.replace(old_th, new_th)

# 5. Add Delete Modal at the bottom
old_end = r'    </div>\n  );\n};'
new_end = """      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200 shadow-xl">
            <h2 className="text-center text-xl font-black text-rose-600 mb-2">تأكيد الحذف</h2>
            <p className="text-center text-slate-600 font-bold mb-6">
              هل أنت متأكد من حذف الطالب {studentToDelete.name}؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteStudent}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};"""
content = re.sub(r'    </div>\n  \);\n};\s*$', new_end, content)

# 6. Make icons interactive (hover effects)
old_btn = r'let btnClass = "w-8 h-8 rounded-md flex items-center justify-center transition-colors shadow-sm mx-auto cursor-pointer border";'
new_btn = r'let btnClass = "w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 shadow-sm mx-auto cursor-pointer border group-hover/btn:scale-110 active:scale-95";'
content = content.replace(old_btn, new_btn)

# Add group/btn to the button
content = content.replace('className={btnClass}', 'className={`${btnClass} group/btn`}')

# And maybe make the Check/X/Minus animate
old_check = r'<Check className="w-5 h-5 text-emerald-600" strokeWidth={3} />'
new_check = r'<Check className="w-5 h-5 text-emerald-600 group-hover/btn:rotate-6 transition-transform" strokeWidth={3} />'
content = content.replace(old_check, new_check)

old_x = r'<X className="w-5 h-5 text-rose-600" strokeWidth={3} />'
new_x = r'<X className="w-5 h-5 text-rose-600 group-hover/btn:rotate-6 transition-transform" strokeWidth={3} />'
content = content.replace(old_x, new_x)

old_minus = r'<Minus className="w-5 h-5 text-amber-600" strokeWidth={3} />'
new_minus = r'<Minus className="w-5 h-5 text-amber-600 group-hover/btn:rotate-6 transition-transform" strokeWidth={3} />'
content = content.replace(old_minus, new_minus)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
