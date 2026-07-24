import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# I will replace everything after "{/* Principal/Deputy Subject Selection */}"
# to the end of the file, then re-add the updated structure.

import sys
parts = content.split("      {/* Principal/Deputy Subject Selection */}")
if len(parts) < 2:
    print("Could not find the split point")
    sys.exit(1)

top_part = parts[0]
bottom_part = parts[1]

# Now, we need to carefully wrap bottom_part inside {activeMainTab === 'teachers' && ( ... )}
# However, bottom_part ends with:
#     </div>
#   );
# };
# We need to strip those lines to append our tracking view.

# Find the last </div> and remove it, along with the component closing.
# The bottom_part currently has:
# ... (all the original rendering logic)
#     </div>
#   );
# };

# Let's write the tracking view string:
tracking_view = """
      {activeMainTab === 'tracking' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Unlinked Teachers */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-100 bg-amber-50 flex items-center justify-between">
                <h3 className="font-bold text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  معلمون لم يكملوا الربط ({trackingData.unlinkedTeachers.length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {trackingData.unlinkedTeachers.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-medium">الجميع قاموا بالربط بنجاح</div>
                ) : (
                  trackingData.unlinkedTeachers.map(teacher => (
                    <div key={teacher.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">{teacher.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">{getSubjectIcon(teacher.subjectIcon)} {teacher.subject}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> الكود: {teacher.id}</span>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">غير مرتبط</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Late Teachers */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-100 bg-rose-50 flex items-center justify-between">
                <h3 className="font-bold text-rose-800 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  معلمون متأخرون في التقييم ({trackingData.teachersWithLate.length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {loadingTracking ? (
                  <div className="text-center py-10 text-slate-400 font-medium animate-pulse">جاري جلب البيانات...</div>
                ) : trackingData.teachersWithLate.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-medium">جميع المعلمين ملتزمين بالتقييمات</div>
                ) : (
                  trackingData.teachersWithLate.map(({ teacher, missedTotal, classesCount }) => (
                    <div key={teacher.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">{teacher.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">{getSubjectIcon(teacher.subjectIcon)} {teacher.subject}</span>
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {classesCount} فصول مسجلة</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="block text-xl font-black text-rose-500">{missedTotal}</span>
                        <span className="block text-[10px] text-rose-400 font-bold">تقييم متأخر</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}
"""

# Let's isolate the original views to wrap them.
# The original starts right after "{/* Principal/Deputy Subject Selection */}"
# We just need to wrap the whole bottom_part in {activeMainTab === 'teachers' && ( <>{bottom_part}</> )}
# But we have to handle the closing tags properly.

# bottom_part looks like:
# \n      {(adminRole === 'principal' || adminRole === 'deputy') && !selectedSubject && !selectedTeacher && ( ... )}
# \n      {((adminRole === 'supervisor') || ((adminRole === 'principal' || adminRole === 'deputy') && selectedSubject)) && ( ... )}
# \n    </div>\n  );\n};

lines = bottom_part.split('\n')
# Remove the last 3 lines which are typically:
#     </div>
#   );
# };
while lines and lines[-1].strip() in ['};', ');', '</div>', '']:
    lines.pop()

wrapped_teachers_view = "      {activeMainTab === 'teachers' && (\n        <>\n          {/* Principal/Deputy Subject Selection */}\n" + '\n'.join(lines) + "\n        </>\n      )}\n"

final_content = top_part + wrapped_teachers_view + tracking_view + "    </div>\n  );\n};\n"

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(final_content)
