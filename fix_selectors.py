import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Remove the broken checkbox block
broken_block = """        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
            <input 
              type="checkbox" 
              checked={isPinned}
              onChange={handlePinChange}
              className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] border-slate-300"
            />
            تثبيت الفصل (حفظ الاختيار)
          </label>
        </div>
      </div>"""

content = content.replace(broken_block, '')

# And now place it after the class selector correctly
target_class_selector_end = """        {/* Class Selector */}
        <div>
          <div className="relative">
            <select
              value={selectedClassNum}
              onChange={(e) => setSelectedClassNum(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-10 py-2.5 text-sm font-bold text-slate-800 focus:outline-none appearance-none text-right"
            >
              <option value="" disabled>اختر الفصل...</option>
              {Array.from({ length: CLASSES_COUNT }, (_, i) => i + 1).map((cNum) => (
                <option key={cNum} value={cNum}>فصل {cNum}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>"""

correct_replacement = target_class_selector_end + """
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
            <input 
              type="checkbox" 
              checked={isPinned}
              onChange={handlePinChange}
              className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] border-slate-300"
            />
            تثبيت الفصل (حفظ الاختيار)
          </label>
        </div>
      </div>"""

content = content.replace(target_class_selector_end, correct_replacement)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

