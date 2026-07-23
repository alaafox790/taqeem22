import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Add imports
if 'import * as XLSX' not in content:
    content = content.replace("import { Cloud, CloudOff, Loader2 } from 'lucide-react';", "import { Cloud, CloudOff, Loader2, Download, Printer } from 'lucide-react';\nimport * as XLSX from 'xlsx';\nimport jsPDF from 'jspdf';\nimport autoTable from 'jspdf-autotable';")

export_funcs = """  const assessmentsCount = 15;

  const handleExportExcel = () => {
    if (displayedStudents.length === 0) return;
    
    // Create header row
    const headers = ['م', 'اسم الطالب', ...Array.from({ length: assessmentsCount }, (_, i) => `تقييم ${i + 1}`)];
    
    // Create data rows
    const rows = displayedStudents.map((s, idx) => {
      const rowData: any[] = [s.serialNumber, s.name];
      for (let i = 1; i <= assessmentsCount; i++) {
        const status = getAttendanceStatus(s.id, i);
        let statusText = '-';
        if (status === 'present') statusText = 'حاضر';
        else if (status === 'absent') statusText = 'غائب';
        else if (status === 'excused') statusText = 'بعذر';
        rowData.push(statusText);
      }
      return rowData;
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    // Set RTL
    if(!worksheet['!views']) worksheet['!views'] = [];
    worksheet['!views'].push({ rightToLeft: true });
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل الحضور');
    
    XLSX.writeFile(workbook, `سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.xlsx`);
  };

  const handleExportPDF = () => {
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
  };
"""

content = content.replace("  const assessmentsCount = 15;", export_funcs)

export_buttons = """        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">"""

new_export_buttons = """        <div className="flex justify-end gap-2 mb-2">
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">"""

content = content.replace(export_buttons, new_export_buttons)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
