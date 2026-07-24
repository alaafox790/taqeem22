import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# Add imports
content = content.replace("import { Shield, Lock, Users, LogOut, ChevronLeft, Search, Building2, BookOpen, Clock, Activity, FileText, BarChart3, Phone, ChevronRight } from 'lucide-react';",
"import { Shield, Lock, Users, LogOut, ChevronLeft, Search, Building2, BookOpen, Clock, Activity, FileText, BarChart3, Phone, ChevronRight, Book, Calculator, Globe, FlaskConical, Languages, Music, Palette, PenTool, Dna, Code } from 'lucide-react';")

# Add getIconComponent function inside or outside component
# Wait, I can just add it outside the component
icon_mapper = """
const getSubjectIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Book': return <Book className="w-3 h-3 text-indigo-500" />;
    case 'Calculator': return <Calculator className="w-3 h-3 text-rose-500" />;
    case 'Globe': return <Globe className="w-3 h-3 text-teal-500" />;
    case 'FlaskConical': return <FlaskConical className="w-3 h-3 text-sky-500" />;
    case 'Languages': return <Languages className="w-3 h-3 text-orange-500" />;
    case 'Music': return <Music className="w-3 h-3 text-purple-500" />;
    case 'Palette': return <Palette className="w-3 h-3 text-pink-500" />;
    case 'PenTool': return <PenTool className="w-3 h-3 text-slate-500" />;
    case 'Dna': return <Dna className="w-3 h-3 text-green-500" />;
    case 'Code': return <Code className="w-3 h-3 text-slate-700" />;
    default: return <BookOpen className="w-3 h-3 text-slate-400" />;
  }
};
"""

content = content.replace("const SUBJECTS = ['اللغة العربية', 'اللغة الانجليزية', 'الدراسات الاجتماعية', 'العلوم', 'الرياضيات', 'أخرى'];",
"const SUBJECTS = ['اللغة العربية', 'اللغة الانجليزية', 'الدراسات الاجتماعية', 'العلوم', 'الرياضيات', 'أخرى'];\n" + icon_mapper)

old_teacher_row = """                    <h4 className="font-bold text-slate-800 text-sm mb-1">{teacher.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {teacher.subject}</span>
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {teacher.school}</span>
                    </div>"""

new_teacher_row = """                    <h4 className="font-bold text-slate-800 text-sm mb-1">{teacher.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">{getSubjectIcon(teacher.subjectIcon)} <span className="font-medium">{teacher.subject}</span></span>
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {teacher.school}</span>
                    </div>"""

content = content.replace(old_teacher_row, new_teacher_row)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)

