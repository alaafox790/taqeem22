import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Add Edit3 to lucide-react imports
if "Edit3" not in content:
    content = content.replace("Filter\n} from 'lucide-react';", "Filter,\n  Edit3\n} from 'lucide-react';")
elif "Edit," not in content and "Edit\n" not in content:
    content = content.replace("Filter\n} from 'lucide-react';", "Filter,\n  Edit\n} from 'lucide-react';")

# Add the edit button and edit modal
# First, the button
old_button = """                  <td className="p-3 text-center border-b border-r border-slate-200">
                    <button
                      onClick={() => handleDeleteStudent(student.id, student.name)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors inline-block"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>"""
new_button = """                  <td className="p-3 text-center border-b border-r border-slate-200">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-slate-400 hover:text-teal-600 p-1.5 rounded-md hover:bg-teal-50 transition-colors inline-block"
                        title="تعديل"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id, student.name)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors inline-block"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>"""

content = content.replace(old_button, new_button)

# Second, the Edit Modal. We'll append it near the Delete Modal.
old_delete_modal = """      {/* Delete Confirmation Modal */}"""
new_edit_modal = """      {/* Edit Student Modal */}
      {studentToEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200 shadow-xl">
            <h2 className="text-center text-xl font-black text-slate-900 mb-6">تعديل اسم الطالب</h2>
            <div className="space-y-5">
              <input
                type="text"
                placeholder="الاسم رباعي"
                value={editStudentName}
                onChange={(e) => setEditStudentName(e.target.value)}
                className="w-full text-center bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                autoFocus
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateStudent}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                >
                  حفظ التعديل
                </button>
                <button
                  onClick={() => {
                    setStudentToEdit(null);
                    setEditStudentName('');
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}"""

content = content.replace(old_delete_modal, new_edit_modal)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
