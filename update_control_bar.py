import re

with open('src/components/ControlBar.tsx', 'r') as f:
    content = f.read()

# Add props
old_interface = """interface ControlBarProps {
  academicYear: string;
  onAcademicYearChange: (year: string) => void;
  selectedTerm: TermId;
  onTermChange: (term: TermId) => void;
  selectedMonth: MonthInfo;
  onMonthChange: (month: MonthInfo) => void;
}"""

new_interface = """interface ControlBarProps {
  academicYear: string;
  onAcademicYearChange: (year: string) => void;
  selectedTerm: TermId;
  onTermChange: (term: TermId) => void;
  selectedMonth: MonthInfo;
  onMonthChange: (month: MonthInfo) => void;
  selectedMonthCount: number;
  onMonthCountChange: (count: number) => void;
}"""

content = content.replace(old_interface, new_interface)

old_args = """export const ControlBar: React.FC<ControlBarProps> = ({
  academicYear,
  onAcademicYearChange,
  selectedTerm,
  onTermChange,  
  selectedMonth,
  onMonthChange,
}) => {"""

# Fix potential formatting differences
old_args_regex = r'export const ControlBar: React\.FC<ControlBarProps> = \(\{.*?\}\) => \{'
new_args = """export const ControlBar: React.FC<ControlBarProps> = ({
  academicYear,
  onAcademicYearChange,
  selectedTerm,
  onTermChange,
  selectedMonth,
  onMonthChange,
  selectedMonthCount,
  onMonthCountChange,
}) => {"""
content = re.sub(old_args_regex, new_args, content, flags=re.DOTALL)

old_month_selector = """      {/* Month Selector */}
      <div className="space-y-1">
        <label className="block text-sm font-bold text-slate-800 text-right">
          اختر الشهر:
        </label>
        <select
          value={selectedMonth.id}
          onChange={(e) => {
            const m = MONTHS_DATA.find((m) => m.id === e.target.value);
            if (m) onMonthChange(m);
          }}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none appearance-none bg-no-repeat bg-[left_10px_center] bg-[length:16px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23000000'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
          }}
        >
          {currentTermMonths.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name.split(' ')[0]}
            </option>
          ))}
        </select>
      </div>"""

new_month_selector = """      {/* Month and Count Selector row */}
      <div className="flex items-center gap-2">
        <div className="flex-1 space-y-1">
          <label className="block text-sm font-bold text-slate-800 text-right">
            اختر الشهر:
          </label>
          <select
            value={selectedMonth.id}
            onChange={(e) => {
              const m = MONTHS_DATA.find((m) => m.id === e.target.value);
              if (m) onMonthChange(m);
            }}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none appearance-none bg-no-repeat bg-[left_10px_center] bg-[length:16px]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23000000'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
            }}
          >
            {currentTermMonths.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>
        
        <div className="w-[100px] space-y-1">
          <label className="block text-sm font-bold text-slate-800 text-right whitespace-nowrap">
            عدد التقييمات:
          </label>
          <select
            value={selectedMonthCount}
            onChange={(e) => onMonthCountChange(Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none appearance-none bg-no-repeat bg-[left_10px_center] bg-[length:16px]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23000000'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
            }}
          >
            {Array.from({ length: 9 }, (_, i) => i).map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      </div>"""

content = content.replace(old_month_selector, new_month_selector)

with open('src/components/ControlBar.tsx', 'w') as f:
    f.write(content)

