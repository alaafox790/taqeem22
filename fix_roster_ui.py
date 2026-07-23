import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Replace handleExportImage
old_export_image = """  const handleExportImage = async () => {
    if (displayedStudents.length === 0) return;
    
    const tableEl = document.getElementById('roster-table-container');
    if (!tableEl) {
      alert("تعذر العثور على الجدول");
      return;
    }

    try {
      // Create a wrapper for the table to render it fully
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '-9999px';
      wrapper.style.width = 'max-content';
      wrapper.style.backgroundColor = '#ffffff';
      wrapper.style.padding = '20px';
      wrapper.style.direction = 'rtl';
      wrapper.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      
      const title = document.createElement('h2');
      title.innerText = `سجل الطلاب - الصف ${selectedGrade} - فصل ${selectedClassNum}`;
      title.style.textAlign = 'center';
      title.style.marginBottom = '20px';
      title.style.color = '#1e293b';
      title.style.fontSize = '18px';
      title.style.fontWeight = 'bold';
      wrapper.appendChild(title);

      const clone = tableEl.cloneNode(true) as HTMLElement;
      
      // Fix sticky elements for rendering
      const stickies = clone.querySelectorAll('.sticky');
      stickies.forEach(el => {
        (el as HTMLElement).style.position = 'static';
        (el as HTMLElement).style.boxShadow = 'none';
      });

      // Fix buttons to simple text
      const cells = clone.querySelectorAll('td');
      cells.forEach(td => {
        const btn = td.querySelector('button') || td.querySelector('.w-6.h-6');
        if (btn) {
          let text = '-';
          const btnClass = btn.className;
          if (btnClass.includes('emerald-100')) text = 'حاضر';
          else if (btnClass.includes('rose-100') && !btnClass.includes('rose-50')) text = 'غائب';
          else if (btnClass.includes('amber-100')) text = 'عذر';
          
          td.innerHTML = `<div style="text-align:center; padding:4px; font-weight:bold; color:#334155;">${text}</div>`;
        }
      });

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      const dataUrl = await toPng(wrapper, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: false,
      });
      
      document.body.removeChild(wrapper);

      const link = document.createElement('a');
      link.download = `سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء تصدير الصورة");
    }
  };"""

new_export_image = """  const handleExportImage = async () => {
    if (displayedStudents.length === 0) return;
    
    const tableEl = document.getElementById('roster-table-container');
    if (!tableEl) {
      alert("تعذر العثور على الجدول");
      return;
    }

    try {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '-9999px';
      wrapper.style.width = 'max-content';
      wrapper.style.backgroundColor = '#ffffff';
      wrapper.style.padding = '20px';
      wrapper.style.direction = 'rtl';
      wrapper.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      
      const title = document.createElement('h2');
      title.innerText = `سجل الطلاب - الصف ${selectedGrade} - فصل ${selectedClassNum}`;
      title.style.textAlign = 'center';
      title.style.marginBottom = '20px';
      title.style.color = '#1e293b';
      title.style.fontSize = '18px';
      title.style.fontWeight = 'bold';
      wrapper.appendChild(title);

      const clone = tableEl.cloneNode(true) as HTMLElement;
      
      const stickies = clone.querySelectorAll('.sticky');
      stickies.forEach(el => {
        (el as HTMLElement).style.position = 'static';
        (el as HTMLElement).style.boxShadow = 'none';
      });

      const cells = clone.querySelectorAll('td');
      cells.forEach(td => {
        const btn = td.querySelector('button') || td.querySelector('.w-6.h-6');
        if (btn) {
          let text = '-';
          const btnClass = btn.className;
          if (btnClass.includes('emerald-100')) text = 'حاضر';
          else if (btnClass.includes('rose-100') && !btnClass.includes('rose-50')) text = 'غائب';
          else if (btnClass.includes('amber-100')) text = 'عذر';
          
          td.innerHTML = `<div style="text-align:center; padding:4px; font-weight:bold; color:#334155;">${text}</div>`;
        }
      });

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      const canvas = await html2canvas(wrapper, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      document.body.removeChild(wrapper);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء تصدير الصورة");
    }
  };"""

content = content.replace(old_export_image, new_export_image)


# 2. Modify search and filter area to include buttons and compact the UI
old_selectors = """      {/* Selectors Row */}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent block pr-10 p-2.5 transition-all outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 left-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="relative min-w-[140px]">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-400" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent block pr-10 p-2.5 appearance-none outline-none"
              >
                <option value="all">الكل</option>
                <option value="present">الحاضرين فقط</option>
                <option value="absent">الغائبين فقط</option>
                <option value="excused">المعذورين فقط</option>
                <option value="warning">إنذار الغياب</option>
              </select>
            </div>
          </div>
        )}"""

new_selectors = """      {/* Top Bar: Controls */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex flex-wrap sm:flex-nowrap gap-2 animate-in fade-in slide-in-from-top-2 duration-200 items-center w-full">
          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={handleExportImage}
              className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              title="تصدير كصورة">
              <Image className="w-3.5 h-3.5" /> صورة
            </button>
            <button 
              onClick={handleExportExcel}
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              title="تصدير إكسل">
              <Download className="w-3.5 h-3.5" /> إكسل
            </button>
            {classStudents.length > 0 && (
              <button
                onClick={() => {
                  if(window.confirm('هل أنت متأكد من حذف جميع طلاب هذا الفصل؟')) {
                    setStudents(prev => prev.filter(s => !(s.grade === selectedGrade && s.class_num === selectedClassNum)));
                    setAttendance(prev => prev.filter(a => !(a.grade === selectedGrade && a.class_num === selectedClassNum)));
                  }
                }}
                className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> حذف الكل
              </button>
            )}
          </div>

          <div className="flex-1 min-w-[200px] relative">
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرقم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-transparent block pr-7 p-1.5 transition-all outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 left-2 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="relative shrink-0 w-[120px]">
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-transparent block pr-7 p-1.5 appearance-none outline-none"
            >
              <option value="all">الكل</option>
              <option value="present">الحاضرين</option>
              <option value="absent">الغائبين</option>
              <option value="excused">المعذورين</option>
              <option value="warning">إنذار غياب</option>
            </select>
          </div>
        </div>"""

content = content.replace(old_selectors, new_selectors)


# 3. Remove the old action buttons row
old_buttons_row = """        <div className="flex gap-2 w-full sm:w-auto">
          <label className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-center border border-slate-200">
            <input 
              type="checkbox"
              checked={showSearch}
              onChange={() => setShowSearch(!showSearch)}
              className="hidden"
            />
            <Search className="w-3.5 h-3.5 md:w-4 md:h-4" />
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

new_table_container = """      </div>

      {/* Table Container - Compact for minimal scrolling */}
      <div id="roster-table-container" className="rounded-lg overflow-hidden border border-slate-200 shadow-sm overflow-x-auto w-full max-h-[70vh] overflow-y-auto">"""

content = content.replace(old_buttons_row, new_table_container)


# 4. Remove the <div className="mt-6 rounded-xl... if the above replace didn't catch it properly
# Let's ensure old_buttons_row actually matches what's in the file.
with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
