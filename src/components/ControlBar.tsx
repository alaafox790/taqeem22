import React from 'react';
import { MonthInfo, TermId } from '../types';
import { MONTHS_DATA } from '../lib/constants';

interface ControlBarProps {
  academicYear: string;
  onAcademicYearChange: (year: string) => void;
  selectedTerm: TermId;
  onTermChange: (term: TermId) => void;
  selectedMonth: MonthInfo;
  onMonthChange: (month: MonthInfo) => void;
  selectedMonthCount: number;
  onMonthCountChange: (count: number) => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  academicYear,
  onAcademicYearChange,
  selectedTerm,
  onTermChange,
  selectedMonth,
  onMonthChange,
  selectedMonthCount,
  onMonthCountChange,
}) => {
  const currentTermMonths = MONTHS_DATA.filter((m) => m.termId === selectedTerm);

  return (
    <div className="bg-white rounded-t-xl border border-b-0 border-slate-200 p-4 sm:p-6 pb-4 space-y-4 md:space-y-6">
      {/* Title */}
      <h2 className="text-center text-slate-800 font-bold text-lg md:text-xl">سجل التقييمات</h2>

      <div className="flex flex-col md:flex-row md:items-end gap-4">
      {/* Academic Year Row */}
      <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-2 bg-slate-50/50 md:flex-1 md:h-[42px]">
        <input
          type="text"
          value={academicYear}
          onChange={(e) => onAcademicYearChange(e.target.value)}
          placeholder="2026/2027"
          className="flex-1 bg-transparent border border-teal-500 rounded-md py-1.5 text-center text-sm font-bold text-slate-900 focus:outline-none"
        />
        <label className="text-sm font-bold text-slate-700 whitespace-nowrap px-2">
          العام الدراسي:
        </label>
      </div>

      {/* Term Selector */}
      <div className="space-y-1 md:flex-1">
        <label className="block text-sm font-bold text-slate-800 text-right">
          اختر الترم الدراسي:
        </label>
        <select
          value={selectedTerm}
          onChange={(e) => {
            const val = e.target.value as TermId;
            onTermChange(val);
            const firstMonth = MONTHS_DATA.find((m) => m.termId === val);
            if (firstMonth) onMonthChange(firstMonth);
          }}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none appearance-none bg-no-repeat bg-[left_10px_center] bg-[length:16px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23000000'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
          }}
        >
          <option value="term1">الترم الأول</option>
          <option value="term2">الترم الثاني</option>
        </select>
      </div>

      {/* Month and Count Selector row */}
      <div className="flex items-center gap-2 md:flex-[2]">
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
      </div>
      </div>
    </div>
  );
};

