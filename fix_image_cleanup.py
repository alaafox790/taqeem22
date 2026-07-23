import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Replace the messy try block
old_try_block = """    try {
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
      
      const link = document.createElement('a');
      link.download = `سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.png`;
      link.href = imgData2;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء تصدير PDF");
    } finally {
      document.body.removeChild(clone);
    }"""

new_try_block = """    try {
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
    }"""

content = content.replace(old_try_block, new_try_block)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
