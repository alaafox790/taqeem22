import re

with open('src/components/AssessmentModal.tsx', 'r') as f:
    content = f.read()

old_jsx = """          {/* Date Input */}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-800 text-right">
              تاريخ التقييم:
            </label>
            <input
              type="date"
              required
              min={firstDay}
              max={lastDay}
              value={assessDate}
              onChange={(e) => setAssessDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500 text-sm font-bold text-slate-900 bg-white dir-ltr text-left"
            />
          </div>"""

new_jsx = """          {/* Date Input */}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-800 text-right">
              تاريخ التقييم:
            </label>
            <input
              type="date"
              required
              min={firstDay}
              max={lastDay}
              value={assessDate}
              onChange={(e) => setAssessDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500 text-sm font-bold text-slate-900 bg-white dir-ltr text-left"
            />
          </div>

          {/* Holiday/Absence Section */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isHoliday}
                onChange={(e) => {
                  setIsHoliday(e.target.checked);
                  if (!e.target.checked) setHolidayDesc('');
                }}
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 border-slate-300"
              />
              <span className="text-sm font-bold text-slate-700">تسجيل كعطلة / غياب (تخطي التقييم)</span>
            </label>
            
            {isHoliday && (
              <div className="pl-6 animate-fadeIn">
                <select
                  value={holidayDesc}
                  onChange={(e) => setHolidayDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-rose-300"
                  required={isHoliday}
                >
                  <option value="" disabled>اختر السبب</option>
                  <option value="عطلة رسمية">عطلة رسمية</option>
                  <option value="إجازة الجمعة / السبت">إجازة الجمعة / السبت</option>
                  <option value="غياب معلم">غياب معلم</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
            )}
          </div>"""

content = content.replace(old_jsx, new_jsx)

with open('src/components/AssessmentModal.tsx', 'w') as f:
    f.write(content)
