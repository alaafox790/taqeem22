import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# 1. Add html2canvas import
if 'import html2canvas' not in content:
    content = content.replace("import autoTable from 'jspdf-autotable';", "import autoTable from 'jspdf-autotable';\nimport html2canvas from 'html2canvas';")

# 2. Fix handleExportPDF
old_export_pdf = """  const handleExportPDF = () => {
    if (displayedStudents.length === 0) return;
    
    const doc = new jsPDF('l', 'pt', 'a4');
    // Using default font, might not support Arabic perfectly without custom font, but we'll try to provide a clean table
    // For Arabic support in jsPDF, we usually need a VFS font. As a fallback we use autoTable.
    
    const headers = [['م', 'اسم الطالب', ...Array.from({ length: assessmentsCount }, (_, i) => `${i + 1}`)]];
    const data = displayedStudents.map((s, idx) => {
      const rowData: any[] = [s.serialNumber, s.name];
      for (let i = 1; i <= assessmentsCount; i++) {
        const status = getAttendanceStatus(s.id, i);
        let statusText = '-';
        if (status === 'present') statusText = 'ح';
        else if (status === 'absent') statusText = 'غ';
        else if (status === 'excused') statusText = 'ع';
        rowData.push(statusText);
      }
      return rowData;
    });

    // reverse for RTL
    const reversedHeaders = [headers[0].reverse()];
    const reversedData = data.map(row => row.reverse());

    autoTable(doc, {
      head: reversedHeaders,
      body: reversedData,
      theme: 'grid',
      styles: { halign: 'center', font: 'helvetica' },
      headStyles: { fillColor: [15, 118, 110] },
      margin: { top: 40 },
    });
    
    doc.save(`سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.pdf`);
  };"""

new_export_pdf = """  const handleExportPDF = async () => {
    if (displayedStudents.length === 0) return;
    
    const tableEl = document.getElementById('roster-table-container');
    if (!tableEl) {
      alert("تعذر العثور على الجدول");
      return;
    }

    // Clone the table container
    const clone = tableEl.cloneNode(true) as HTMLElement;
    
    // Modify clone for better printing
    clone.style.width = 'max-content';
    clone.style.height = 'auto';
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.backgroundColor = '#ffffff';
    clone.style.direction = 'rtl';
    clone.style.overflow = 'visible';
    
    // Find all buttons inside clone and replace them with text
    const buttons = clone.querySelectorAll('td');
    buttons.forEach(td => {
      // Find the button inside td
      const btn = td.querySelector('div.w-6.h-6');
      if (btn) {
        // Based on classes, determine status text for PDF
        let statusText = '-';
        if (btn.classList.contains('bg-emerald-100')) statusText = 'حاضر';
        else if (btn.classList.contains('bg-rose-100')) statusText = 'غائب';
        else if (btn.classList.contains('bg-amber-100')) statusText = 'عذر';
        
        td.innerHTML = `<div style="font-weight:bold; color:#333; text-align:center; padding:4px;">${statusText}</div>`;
      }
    });

    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add title
      pdf.setFontSize(14);
      // Wait, jsPDF doesn't support Arabic text drawing well. 
      // It's better to add the title inside the HTML clone before screenshot.
      
      const titleDiv = document.createElement('div');
      titleDiv.innerHTML = `<h2 style="text-align:center; font-family:sans-serif; margin-bottom: 20px; color: #1e293b;">سجل الطلاب - الصف ${selectedGrade} - فصل ${selectedClassNum}</h2>`;
      clone.insertBefore(titleDiv, clone.firstChild);
      
      // Recapture after adding title
      const canvasWithTitle = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData2 = canvasWithTitle.toDataURL('image/png');
      const pdfHeight2 = (canvasWithTitle.height * pdfWidth) / canvasWithTitle.width;
      
      pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, pdfHeight2);
      pdf.save(`سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.pdf`);
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء تصدير PDF");
    } finally {
      document.body.removeChild(clone);
    }
  };"""

content = content.replace(old_export_pdf, new_export_pdf)

# 3. Add id="roster-table-container" to the table wrapper
old_table_wrapper = """      {/* Table Section */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm relative">"""
new_table_wrapper = """      {/* Table Section */}
      <div id="roster-table-container" className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm relative bg-white">"""
content = content.replace(old_table_wrapper, new_table_wrapper)

# 4. Fix buttons layout
old_buttons = """      {/* Action Buttons */}
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
        </button>
        {classStudents.length > 0 && (
          <button
            onClick={() => {
              if(window.confirm('هل أنت متأكد من حذف جميع طلاب هذا الفصل؟ لا يمكن التراجع عن هذا الإجراء.')) {
                setStudents(prev => prev.filter(s => !(s.grade === selectedGrade && s.class_num === selectedClassNum)));
                setAttendance(prev => prev.filter(a => !(a.grade === selectedGrade && a.class_num === selectedClassNum)));
              }
            }}
            className="md:w-32 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            حذف الكل <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>"""

new_buttons = """      {/* Action Buttons */}
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
            onClick={handleExportPDF}
            className="flex-1 min-w-[80px] bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 transition-colors">
            PDF <Printer className="w-3.5 h-3.5 md:w-4 md:h-4" />
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
      </div>"""

content = content.replace(old_buttons, new_buttons)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

