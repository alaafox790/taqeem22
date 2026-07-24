import re

new_content = """import React, { useMemo } from 'react';
import { MonthInfo, AssessmentRecord, TermId } from '../types';
import { FileStack } from 'lucide-react';

interface TermProgressProps {
  selectedTerm: TermId;
  academicYear: string;
  monthAssessmentCounts: Record<string, number>;
  records: AssessmentRecord[];
  selectedMonth: MonthInfo;
}

export const TermProgress: React.FC<TermProgressProps> = ({
  selectedTerm,
  academicYear,
  records,
  selectedMonth
}) => {
  const currentMonthCount = useMemo(() => {
    return records.filter(
      r => r.term_id === selectedTerm && 
           r.academic_year === academicYear && 
           r.month_id === selectedMonth.id
    ).length;
  }, [selectedTerm, academicYear, records, selectedMonth]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
          <FileStack className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm md:text-base">تقييمات {selectedMonth.name.split(' ')[0]}</h3>
          <p className="text-xs font-bold text-slate-500 mt-0.5">إجمالي التقييمات المسجلة لهذا الشهر</p>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
        <span className="text-2xl font-black text-indigo-600 leading-none">{currentMonthCount}</span>
        <span className="text-[10px] font-bold text-slate-400 mt-1">تقييم</span>
      </div>
    </div>
  );
};
"""

with open('src/components/TermProgress.tsx', 'w') as f:
    f.write(new_content)
