import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Replace handleExportPDF with handleExportImage
old_export_pdf = """      const imgData2 = canvasWithTitle.toDataURL('image/png');
      const pdfHeight2 = (canvasWithTitle.height * pdfWidth) / canvasWithTitle.width;
      
      pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, pdfHeight2);
      pdf.save(`سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.pdf`);"""

new_export_image = """      const imgData2 = canvasWithTitle.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.png`;
      link.href = imgData2;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);"""

content = content.replace(old_export_pdf, new_export_image)
content = content.replace("const handleExportPDF = async () => {", "const handleExportImage = async () => {")

# Also, there's `import jsPDF from 'jspdf';` and `import autoTable from 'jspdf-autotable';` we can leave them or remove them.
# The button:
old_button = """          <button 
            onClick={handleExportPDF}
            className="flex-1 min-w-[80px] bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 transition-colors">
            PDF <Printer className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>"""

new_button = """          <button 
            onClick={handleExportImage}
            className="flex-1 min-w-[80px] bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 transition-colors">
            صورة <Image className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>"""

content = content.replace(old_button, new_button)

# Also update the import from lucide-react to include Image
lucide_import = "import { Cloud, CloudOff, Loader2, Download, Printer } from 'lucide-react';"
new_lucide_import = "import { Cloud, CloudOff, Loader2, Download, Printer, Image } from 'lucide-react';"
content = content.replace(lucide_import, new_lucide_import)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
