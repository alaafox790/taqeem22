import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Add error state
old_state = """  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [editStudentName, setEditStudentName] = useState('');"""
new_state = """  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);"""

content = content.replace(old_state, new_state)

# Replace alerts in handleSaveStudent
old_save_alert = """      alert(`الطالب "${nameToSave}" مسجل بالفعل في الصف ${existingStudent.grade} - فصل ${existingStudent.class_num}`);"""
new_save_alert = """      setErrorMessage(`الطالب "${nameToSave}" مسجل بالفعل في الصف ${existingStudent.grade} - فصل ${existingStudent.class_num}`);"""
content = content.replace(old_save_alert, new_save_alert)

# Replace alerts in handleUpdateStudent
old_update_alert = """      alert(`الطالب "${nameToUpdate}" مسجل بالفعل في الصف ${existingStudent.grade} - فصل ${existingStudent.class_num}`);"""
new_update_alert = """      setErrorMessage(`الطالب "${nameToUpdate}" مسجل بالفعل في الصف ${existingStudent.grade} - فصل ${existingStudent.class_num}`);"""
content = content.replace(old_update_alert, new_update_alert)


# Also handle window.confirm in delete all
old_confirm = """                  if(window.confirm('هل أنت متأكد من حذف جميع طلاب هذا الفصل؟')) {
                    setStudents(prev => prev.filter(s => !(s.grade === selectedGrade && s.class_num === selectedClassNum)));
                    setAttendance(prev => prev.filter(a => !(a.grade === selectedGrade && a.class_num === selectedClassNum)));
                  }"""
new_confirm = """                  setErrorMessage('هل أنت متأكد من حذف جميع طلاب هذا الفصل؟|DELETE_ALL');"""
content = content.replace(old_confirm, new_confirm)

# Add the Error Modal at the bottom
old_footer = """      {/* Delete Confirmation Modal */}"""
new_footer = """      {/* Error/Alert Modal */}
      {errorMessage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200 shadow-xl">
            <h2 className="text-center text-xl font-black text-rose-600 mb-2">تنبيه</h2>
            <p className="text-center text-slate-600 font-bold mb-6">
              {errorMessage.split('|')[0]}
            </p>
            <div className="flex gap-3">
              {errorMessage.includes('|DELETE_ALL') ? (
                <>
                  <button
                    onClick={() => {
                      setStudents(prev => prev.filter(s => !(s.grade === selectedGrade && s.class_num === selectedClassNum)));
                      setAttendance(prev => prev.filter(a => !(a.grade === selectedGrade && a.class_num === selectedClassNum)));
                      setErrorMessage(null);
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                  >
                    نعم، احذف الكل
                  </button>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition-colors"
                  >
                    إلغاء
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setErrorMessage(null)}
                  className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                >
                  حسناً
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}"""
content = content.replace(old_footer, new_footer)

# Replace alert in image export
old_image_alert_1 = """      alert("تعذر العثور على الجدول");"""
new_image_alert_1 = """      setErrorMessage("تعذر العثور على الجدول");"""
content = content.replace(old_image_alert_1, new_image_alert_1)

old_image_alert_2 = """      alert("حدث خطأ أثناء تصدير الصورة");"""
new_image_alert_2 = """      setErrorMessage("حدث خطأ أثناء تصدير الصورة");"""
content = content.replace(old_image_alert_2, new_image_alert_2)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
