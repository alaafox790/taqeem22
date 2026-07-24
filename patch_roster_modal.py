import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

old_end = """      )}
    </div>
  );
};"""

new_end = """      )}

      {/* Class Appearance Modal */}
      {isAppearanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">تخصيص مظهر الفصل</h3>
              <button onClick={() => setIsAppearanceModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">اختر الأيقونة</label>
                <div className="grid grid-cols-5 gap-2">
                  {appearanceIcons.map(iconName => (
                    <button
                      key={iconName}
                      onClick={() => setClassAppearances(prev => ({ ...prev, [classKey]: { ...currentAppearance, icon: iconName } }))}
                      className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                        currentAppearance.icon === iconName 
                          ? 'bg-slate-800 text-white shadow-md' 
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {renderIcon(iconName, "w-5 h-5")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">اختر اللون</label>
                <div className="grid grid-cols-4 gap-2">
                  {appearanceColors.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setClassAppearances(prev => ({ ...prev, [classKey]: { ...currentAppearance, color: c.id } }))}
                      className={`p-3 rounded-xl text-center text-xs font-bold transition-all border ${c.id} ${
                        currentAppearance.color === c.id ? 'ring-2 ring-slate-800 ring-offset-2' : ''
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsAppearanceModalOpen(false)}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};"""

content = content.replace(old_end, new_end)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
