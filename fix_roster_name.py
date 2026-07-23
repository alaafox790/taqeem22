import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

helper = """
  // Helper to get first two words of a name
  const getShortName = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 2) return name;
    return `${parts[0]} ${parts[1]}`;
  };
"""

# Insert helper before return statement of the component
# Need to find a good place. How about before `const renderAttendanceButton`?
content = content.replace("  const renderAttendanceButton", helper + "\n  const renderAttendanceButton")

old_td = """<td className="p-2 text-sm sticky right-[50px] bg-white group-hover:bg-slate-50 z-20 border-b border-l border-slate-200 shadow-[-2px_0_4px_rgba(0,0,0,0.02)] min-w-[120px] max-w-[120px] w-[120px] truncate">{student.name}</td>"""
new_td = """<td className="p-2 text-xs sticky right-[50px] bg-white group-hover:bg-slate-50 z-20 border-b border-l border-slate-200 shadow-[-2px_0_4px_rgba(0,0,0,0.02)] min-w-[90px] max-w-[90px] w-[90px] truncate" title={student.name}>{getShortName(student.name)}</td>"""

content = content.replace(old_td, new_td)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

