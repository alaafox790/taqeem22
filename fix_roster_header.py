import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

old_header = """      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">الطلاب والغياب</h2>
          <p className="text-xs text-slate-500 font-bold mt-1">سجل التقييمات والحضور</p>
        </div>
      </div>"""

new_header = """      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              الطلاب والغياب
              {/* Sync Status Indicator */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 mt-0.5">
                {syncStatus === 'syncing' ? (
                  <>
                    <Loader2 className="w-3 h-3 text-cyan-600 animate-spin" />
                    <span className="text-[10px] text-slate-500 font-medium">جاري الحفظ...</span>
                  </>
                ) : syncStatus === 'error' ? (
                  <>
                    <CloudOff className="w-3 h-3 text-rose-500" />
                    <span className="text-[10px] text-rose-600 font-medium">خطأ في المزامنة</span>
                  </>
                ) : isFirebaseConnected ? (
                  <>
                    <Cloud className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] text-emerald-600 font-medium">متصل ومحفوظ</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] text-slate-500 font-medium">محفوظ محلياً فقط</span>
                  </>
                )}
              </div>
            </h2>
            <p className="text-xs text-slate-500 font-bold mt-1">سجل التقييمات والحضور (الحفظ تلقائي)</p>
          </div>
        </div>
      </div>"""

content = content.replace(old_header, new_header)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

