import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# 1. Reduce padding and remove header text
old_header = """  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 w-full max-w-full overflow-hidden animate-in fade-in">
      {/* Header */}
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
      </div>
      
      {/* Selectors Row */}
      <div className="flex flex-col gap-4 mb-6">"""

new_header = """  return (
    <div className="bg-white rounded-2xl p-2 md:p-3 shadow-sm w-full max-w-full overflow-hidden animate-in fade-in">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100">
          {syncStatus === 'syncing' ? (
            <>
              <Loader2 className="w-3 h-3 text-cyan-600 animate-spin" />
              <span className="text-[10px] text-slate-500 font-medium">حفظ...</span>
            </>
          ) : syncStatus === 'error' ? (
            <>
              <CloudOff className="w-3 h-3 text-rose-500" />
              <span className="text-[10px] text-rose-600 font-medium">خطأ</span>
            </>
          ) : isFirebaseConnected ? (
            <>
              <Cloud className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-emerald-600 font-medium">متصل</span>
            </>
          ) : (
            <>
              <CloudOff className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] text-slate-500 font-medium">محلي</span>
            </>
          )}
        </div>
      </div>
      
      {/* Selectors Row */}
      <div className="flex flex-col gap-2 mb-3">"""

content = content.replace(old_header, new_header)

# 2. Fix handleExportImage
old_export_image = """  const handleExportImage = async () => {
    if (displayedStudents.length === 0) return;
    
    const tableEl = document.getElementById('roster-table-container');
    if (!tableEl) {
      alert("تعذر العثور على الجدول");
      return;
    }

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = 'max-content';
    container.style.backgroundColor = '#ffffff';
    container.style.padding = '20px';
    container.style.direction = 'rtl';
    
    const title = document.createElement('h2');
    title.style.textAlign = 'center';
    title.style.fontFamily = 'sans-serif';
    title.style.marginBottom = '20px';
    title.style.color = '#1e293b';
    title.innerText = `سجل الطلاب - الصف ${selectedGrade} - فصل ${selectedClassNum}`;
    container.appendChild(title);

    const clone = tableEl.cloneNode(true) as HTMLElement;
    
    const stickyEls = clone.querySelectorAll('.sticky');
    stickyEls.forEach(el => {
      (el as HTMLElement).style.position = 'static';
      (el as HTMLElement).style.boxShadow = 'none';
    });
    
    const buttons = clone.querySelectorAll('td');
    buttons.forEach(td => {
      const btn = td.querySelector('div.w-6.h-6');
      if (btn) {
        let statusText = '-';
        if (btn.classList.contains('bg-emerald-100')) statusText = 'حاضر';
        else if (btn.classList.contains('bg-rose-100')) statusText = 'غائب';
        else if (btn.classList.contains('bg-amber-100')) statusText = 'عذر';
        td.innerHTML = `<div style="font-weight:bold; color:#333; text-align:center; padding:4px;">${statusText}</div>`;
      }
    });

    container.appendChild(clone);
    document.body.appendChild(container);

    try {
      const dataUrl = await toPng(container, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: false
      });
      
      const link = document.createElement('a');
      link.download = `سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء تصدير الصورة");
    } finally {
      document.body.removeChild(container);
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
      // Temporarily expand table to full width for capture
      const originalStyle = tableEl.style.cssText;
      tableEl.style.width = 'max-content';
      tableEl.style.overflow = 'visible';
      tableEl.style.maxWidth = 'none';

      // We'll use html2canvas directly as it has better support for SVGs in some cases
      const canvas = await html2canvas(tableEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      tableEl.style.cssText = originalStyle;

      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء تصدير الصورة");
    }
  };"""

content = content.replace(old_export_image, new_export_image)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

