import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Add AlertTriangle to lucide-react imports if not there
if 'AlertTriangle' not in content:
    content = content.replace("  Lock\n} from 'lucide-react';", "  Lock,\n  AlertTriangle\n} from 'lucide-react';")

helper = """
  // Helper to get first two words of a name
  const getShortName = (name: string) => {
    const parts = name.trim().split(/\\s+/);
    if (parts.length <= 2) return name;
    return `${parts[0]} ${parts[1]}`;
  };

  const hasConsecutiveAbsences = (studentId: string) => {
    const studentRecords = attendance.filter(a => a.student_id === studentId && a.month_id === selectedTerm);
    studentRecords.sort((a, b) => a.assess_num - b.assess_num);
    
    let currentConsecutive = 0;
    let maxConsecutive = 0;
    
    for (const record of studentRecords) {
      if (record.status === 'absent') {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    }
    
    return maxConsecutive > 3;
  };
"""

content = content.replace("""  // Helper to get first two words of a name
  const getShortName = (name: string) => {
    const parts = name.trim().split(/\\s+/);
    if (parts.length <= 2) return name;
    return `${parts[0]} ${parts[1]}`;
  };""", helper)

old_td = """<td className="p-2 text-xs sticky right-[50px] bg-white group-hover:bg-slate-50 z-20 border-b border-l border-slate-200 shadow-[-2px_0_4px_rgba(0,0,0,0.02)] min-w-[90px] max-w-[90px] w-[90px] truncate" title={student.name}>{getShortName(student.name)}</td>"""

new_td = """<td className="p-2 text-xs sticky right-[50px] bg-white group-hover:bg-slate-50 z-20 border-b border-l border-slate-200 shadow-[-2px_0_4px_rgba(0,0,0,0.02)] min-w-[90px] max-w-[90px] w-[90px] truncate" title={student.name}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate">{getShortName(student.name)}</span>
                      {hasConsecutiveAbsences(student.id) && (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" title="تجاوز 3 غيابات متتالية" />
                      )}
                    </div>
                  </td>"""

content = content.replace(old_td, new_td)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

