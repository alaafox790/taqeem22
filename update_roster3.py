import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Add Delete All button
old_buttons = r'<button className="md:w-32 bg-\[#15803d\] hover:bg-\[#166534\] text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">\s*إكسل <FileSpreadsheet className="w-4 h-4" />\s*</button>'

new_buttons = """<button className="md:w-32 bg-[#15803d] hover:bg-[#166534] text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
          إكسل <FileSpreadsheet className="w-4 h-4" />
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
        )}"""

content = re.sub(old_buttons, new_buttons, content)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
