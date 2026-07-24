import re

with open('src/components/StudentReportsScreen.tsx', 'r') as f:
    content = f.read()

# Add icons: Phone, MessageCircle, Edit2
content = content.replace(
    "import { ScrollText, FileText, Download, Printer } from 'lucide-react';",
    "import { ScrollText, FileText, Download, Printer, Phone, MessageCircle, Edit2, Check, X } from 'lucide-react';"
)

state_vars = """
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [editPhoneValue, setEditPhoneValue] = useState('');
  const [triggerRender, setTriggerRender] = useState(0);
"""

content = content.replace(
    "const currentTermMonths = MONTHS_DATA.filter((m) => m.termId === selectedTerm);",
    state_vars + "\n  const currentTermMonths = MONTHS_DATA.filter((m) => m.termId === selectedTerm);"
)

# Replace the try-catch to not be inside useMemo directly if we want to mutate, wait, it's better to read it in useMemo, but we need to update it.
# Actually we can just add `triggerRender` to useMemo dependencies.

use_memo_deps = "}, [records, selectedGrade, selectedClassNum, selectedMonthId]);"
new_use_memo_deps = "}, [records, selectedGrade, selectedClassNum, selectedMonthId, triggerRender]);"
content = content.replace(use_memo_deps, new_use_memo_deps)

update_phone_logic = """
  const handleSavePhone = (studentId: string) => {
    try {
      const students: Student[] = JSON.parse(localStorage.getItem('school_assessments_students_roster_v1') || '[]');
      const updated = students.map(s => s.id === studentId ? { ...s, parentPhone: editPhoneValue } : s);
      localStorage.setItem('school_assessments_students_roster_v1', JSON.stringify(updated));
      setEditingPhoneId(null);
      setTriggerRender(prev => prev + 1);
    } catch(e) {
      console.error(e);
    }
  };
  
  const getWhatsAppMessage = (data: any) => {
    return encodeURIComponent(`مرحباً ولي أمر الطالب ${data.student.name}،\nنود إعلامكم بأن نسبة حضور الطالب في التقييمات هي ${data.attendanceRate}% (حضر ${data.presentCount} وغاب ${data.absentCount}).\nيرجى المتابعة.`);
  };
"""

content = content.replace(
    "const handleExportExcel = () => {",
    update_phone_logic + "\n  const handleExportExcel = () => {"
)

# New grid layout
old_grid = """      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportData.map((data, idx) => (
            <div key={data.student.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-800 text-lg">{data.student.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-bold">
                    الصف {data.student.grade} - فصل {data.student.class_num}
                  </p>
                </div>
                <div className={`text-xl font-black ${data.attendanceRate >= 80 ? 'text-emerald-600' : data.attendanceRate >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {data.attendanceRate}%
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-emerald-50 text-emerald-700 rounded-lg p-2">
                  <span className="block text-xs font-bold opacity-80 mb-1">حضور</span>
                  <strong className="text-lg">{data.presentCount}</strong>
                </div>
                <div className="bg-rose-50 text-rose-700 rounded-lg p-2">
                  <span className="block text-xs font-bold opacity-80 mb-1">غياب</span>
                  <strong className="text-lg">{data.absentCount}</strong>
                </div>
                <div className="bg-amber-50 text-amber-700 rounded-lg p-2">
                  <span className="block text-xs font-bold opacity-80 mb-1">بعذر</span>
                  <strong className="text-lg">{data.excusedCount}</strong>
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">الملاحظات</h4>
                {data.notes.length > 0 ? (
                  <ul className="space-y-1.5 list-disc list-inside text-sm text-slate-700">
                    {data.notes.map((note, i) => (
                      <li key={i} className="line-clamp-2" title={note}>{note}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 italic">لا توجد ملاحظات مسجلة</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}"""


new_grid = """      ) : (
        <div className="animate-in fade-in">
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
            <h3 className="font-bold text-slate-700">إجمالي الطلاب: {reportData.length} طالب</h3>
            <p className="text-sm text-slate-500 font-medium">مرتبة أبجدياً</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {reportData.map((data) => (
              <div key={data.student.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between aspect-square relative group">
                <div className="text-center mb-2">
                  <h3 className="font-black text-slate-800 text-sm md:text-base line-clamp-2 min-h-[2.5rem]">{data.student.name}</h3>
                  <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${data.attendanceRate >= 80 ? 'bg-emerald-100 text-emerald-700' : data.attendanceRate >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                    حضور {data.attendanceRate}%
                  </div>
                </div>
                
                <div className="mt-auto space-y-2">
                  {editingPhoneId === data.student.id ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="tel" 
                        value={editPhoneValue}
                        onChange={(e) => setEditPhoneValue(e.target.value)}
                        placeholder="رقم الهاتف"
                        className="w-full text-xs p-1.5 border border-emerald-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                        autoFocus
                      />
                      <button onClick={() => handleSavePhone(data.student.id)} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingPhoneId(null)} className="p-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : data.student.parentPhone ? (
                    <>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1 px-1">
                        <span dir="ltr">{data.student.parentPhone}</span>
                        <button onClick={() => { setEditPhoneValue(data.student.parentPhone || ''); setEditingPhoneId(data.student.id); }} className="text-slate-400 hover:text-emerald-600">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <a href={`tel:${data.student.parentPhone}`} className="flex-1 flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-xl text-xs font-bold transition-colors">
                          <Phone className="w-3.5 h-3.5" /> اتصال
                        </a>
                        <a href={`https://wa.me/${data.student.parentPhone.replace(/^0/, '20')}?text=${getWhatsAppMessage(data)}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-xl text-xs font-bold transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" /> واتس
                        </a>
                      </div>
                    </>
                  ) : (
                    <button 
                      onClick={() => { setEditPhoneValue(''); setEditingPhoneId(data.student.id); }}
                      className="w-full flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-500 py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> إضافة رقم ولي الأمر
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}"""

content = content.replace(old_grid, new_grid)

with open('src/components/StudentReportsScreen.tsx', 'w') as f:
    f.write(content)
