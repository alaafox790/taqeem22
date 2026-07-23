import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Replace the specific lines
old_section = """      {/* Selectors Row */}
      <div className="flex flex-col gap-3 mb-4">
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
        )}


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grade Selector */}
        <div>
          <div className="relative">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-10 py-2.5 text-sm font-bold text-slate-800 focus:outline-none appearance-none text-right"
            >
              <option value="" disabled>اختر الصف...</option>
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>الصف {grade}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>


        {/* Class Selector */}
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
        </div>
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
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          onClick={() => {
            if (!selectedGrade || !selectedClassNum) {
              alert('يرجى اختيار الصف والفصل أولاً.');
              return;
            }
            setIsModalOpen(true);
          }}
          className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold py-3 rounded-lg text-sm transition-colors"
        >
          تسجيل طالب جديد +
        </button>
        
        <div className="flex flex-wrap gap-2">
          <label className="flex-1 min-w-[110px] flex items-center justify-center gap-2 cursor-pointer text-xs md:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg transition-colors">
            <input 
              type="checkbox" 
              checked={showSearch}
              onChange={(e) => setShowSearch(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
            />
            خيارات البحث
          </label>
          
          <button 
            onClick={handleExportImage}
            className="flex-1 min-w-[80px] bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 transition-colors">
            صورة <Image className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
          
          <button 
            onClick={handleExportExcel}
            className="flex-1 min-w-[80px] bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 transition-colors">
            إكسل <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
          
          {classStudents.length > 0 && (
            <button
              onClick={() => {
                if(window.confirm('هل أنت متأكد من حذف جميع طلاب هذا الفصل؟ لا يمكن التراجع عن هذا الإجراء.')) {
                  setStudents(prev => prev.filter(s => !(s.grade === selectedGrade && s.class_num === selectedClassNum)));
                  setAttendance(prev => prev.filter(a => !(a.grade === selectedGrade && a.class_num === selectedClassNum)));
                }
              }}
              className="flex-1 min-w-[100px] bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              حذف الكل <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table Container - Overflow for horizontal scrolling */}
      <div className="mt-6 rounded-xl overflow-hidden border border-slate-200 shadow-sm overflow-x-auto w-full">"""

new_section = """      {/* Top Bar: Controls */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center w-full">
          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={handleExportImage}
              className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              title="تصدير كصورة">
              <Image className="w-3.5 h-3.5" /> صورة
            </button>
            <button 
              onClick={handleExportExcel}
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              title="تصدير إكسل">
              <Download className="w-3.5 h-3.5" /> إكسل
            </button>
            <button
              onClick={() => {
                if (!selectedGrade || !selectedClassNum) {
                  alert('يرجى اختيار الصف والفصل أولاً.');
                  return;
                }
                setIsModalOpen(true);
              }}
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              طالب جديد +
            </button>
          </div>

          <div className="flex-1 min-w-[150px] relative">
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرقم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-transparent block pr-7 p-1.5 transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 left-2 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="relative shrink-0 w-[100px]">
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-transparent block pr-7 p-1.5 appearance-none outline-none"
            >
              <option value="all">الكل</option>
              <option value="present">الحاضرين</option>
              <option value="absent">الغائبين</option>
              <option value="excused">المعذورين</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Grade Selector */}
          <div className="relative">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-2 pr-8 py-1.5 text-xs font-bold text-slate-800 focus:outline-none appearance-none text-right"
            >
              <option value="" disabled>الصف...</option>
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>الصف {grade}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
              <svg className="w-3 h-3 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Class Selector */}
          <div className="relative">
            <select
              value={selectedClassNum}
              onChange={(e) => setSelectedClassNum(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg pl-2 pr-8 py-1.5 text-xs font-bold text-slate-800 focus:outline-none appearance-none text-right"
            >
              <option value="" disabled>الفصل...</option>
              {Array.from({ length: CLASSES_COUNT }, (_, i) => i + 1).map((cNum) => (
                <option key={cNum} value={cNum}>فصل {cNum}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
              <svg className="w-3 h-3 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          
          {/* Pin Checkbox */}
          <div className="flex items-center gap-1.5 col-span-2 md:col-span-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
              <input 
                type="checkbox" 
                checked={isPinned}
                onChange={handlePinChange}
                className="w-3.5 h-3.5 rounded text-[#0284c7] focus:ring-[#0284c7] border-slate-300"
              />
              تثبيت الفصل
            </label>
            {classStudents.length > 0 && (
              <button
                onClick={() => {
                  if(window.confirm('هل أنت متأكد من حذف جميع طلاب هذا الفصل؟')) {
                    setStudents(prev => prev.filter(s => !(s.grade === selectedGrade && s.class_num === selectedClassNum)));
                    setAttendance(prev => prev.filter(a => !(a.grade === selectedGrade && a.class_num === selectedClassNum)));
                  }
                }}
                className="ml-auto bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> حذف الكل
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Container - Compact for minimal scrolling */}
      <div id="roster-table-container" className="mt-2 rounded-lg overflow-hidden border border-slate-200 shadow-sm overflow-x-auto w-full max-h-[70vh] overflow-y-auto">"""

if old_section in content:
    content = content.replace(old_section, new_section)
    print("Replaced section successfully.")
else:
    print("Could not find the section to replace.")

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
