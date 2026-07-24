import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

old_checkbox = """          {/* Pin Checkbox */}
          <div className="flex items-center gap-1.5 col-span-2 md:col-span-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
              <input 
                type="checkbox" 
                checked={isPinned}
                onChange={handlePinChange}
                className="w-3.5 h-3.5 rounded text-[#0284c7] focus:ring-[#0284c7] border-slate-300"
              />
              تثبيت الفصل
            </label>"""

new_checkbox = """          {/* Pin & Show All Checkboxes */}
          <div className="flex items-center gap-4 col-span-2 md:col-span-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors shrink-0">
              <input 
                type="checkbox" 
                checked={isPinned}
                onChange={handlePinChange}
                className="w-3.5 h-3.5 rounded text-[#0284c7] focus:ring-[#0284c7] border-slate-300"
              />
              تثبيت
            </label>
            
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors shrink-0">
              <input 
                type="checkbox" 
                checked={showAllAssessments}
                onChange={(e) => setShowAllAssessments(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#0284c7] focus:ring-[#0284c7] border-slate-300"
              />
              كل التقييمات
            </label>"""

content = content.replace(old_checkbox, new_checkbox)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
