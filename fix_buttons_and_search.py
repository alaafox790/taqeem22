import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# 1. Add showSearch state
state_str = """  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');"""
new_state_str = """  // Search and Filter
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');"""
content = content.replace(state_str, new_state_str)

# 2. Modify search and filter UI block
search_block = """      {/* Selectors Row */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرقم المسلسل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-8 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none text-right"
            >
              <option value="all">جميع الحالات</option>
              <option value="present">حاضر</option>
              <option value="absent">غائب</option>
              <option value="excused">بعذر</option>
            </select>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>"""

new_search_block = """      {/* Selectors Row */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search and Filter */}
        {showSearch && (
          <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="ابحث بالاسم أو الرقم المسلسل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-400" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-8 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none text-right"
              >
                <option value="all">جميع الحالات</option>
                <option value="present">حاضر</option>
                <option value="absent">غائب</option>
                <option value="excused">بعذر</option>
              </select>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        )}"""
content = content.replace(search_block, new_search_block)

# 3. Remove old export buttons at lines 473-488
old_export_buttons_1 = """        <div className="flex justify-end gap-2 mb-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            تصدير Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            تصدير PDF
          </button>
        </div>"""
content = content.replace(old_export_buttons_1, "")

# 4. Replace dummy buttons and add search checkbox
old_action_buttons = """      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-3 pt-2">
        <button
          onClick={() => {
            if (!selectedGrade || !selectedClassNum) {
              alert('يرجى اختيار الصف والفصل أولاً.');
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex-1 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold py-3 rounded-lg text-sm transition-colors"
        >
          تسجيل طالب جديد +
        </button>
        <button className="md:w-32 bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
          PDF <FileText className="w-4 h-4" />
        </button>
        <button className="md:w-32 bg-[#15803d] hover:bg-[#166534] text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
          إكسل <FileSpreadsheet className="w-4 h-4" />
        </button>"""

new_action_buttons = """      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-3 pt-2">
        <button
          onClick={() => {
            if (!selectedGrade || !selectedClassNum) {
              alert('يرجى اختيار الصف والفصل أولاً.');
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex-1 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold py-3 rounded-lg text-sm transition-colors"
        >
          تسجيل طالب جديد +
        </button>
        
        <label className="flex items-center justify-center md:w-32 gap-2 cursor-pointer text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg transition-colors">
          <input 
            type="checkbox" 
            checked={showSearch}
            onChange={(e) => setShowSearch(e.target.checked)}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
          />
          خيارات البحث
        </label>
        
        <button 
          onClick={handleExportPDF}
          className="md:w-32 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
          PDF <Printer className="w-4 h-4" />
        </button>
        <button 
          onClick={handleExportExcel}
          className="md:w-32 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
          إكسل <Download className="w-4 h-4" />
        </button>"""
content = content.replace(old_action_buttons, new_action_buttons)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

