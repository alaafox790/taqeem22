import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Add import for html-to-image
if 'import { toPng }' not in content:
    content = content.replace("import html2canvas from 'html2canvas';", "import html2canvas from 'html2canvas';\nimport { toPng } from 'html-to-image';")

old_export_image = """  const handleExportImage = async () => {
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
      const titleDiv = document.createElement('div');
      titleDiv.innerHTML = `<h2 style="text-align:center; font-family:sans-serif; margin-bottom: 20px; color: #1e293b; padding: 20px;">سجل الطلاب - الصف ${selectedGrade} - فصل ${selectedClassNum}</h2>`;
      clone.insertBefore(titleDiv, clone.firstChild);
      
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء تصدير الصورة");
    } finally {
      document.body.removeChild(clone);
    }
  };"""

new_export_image = """  const handleExportImage = async () => {
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

content = content.replace(old_export_image, new_export_image)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
