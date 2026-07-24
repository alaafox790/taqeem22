import re

with open('src/components/TermProgress.tsx', 'r') as f:
    content = f.read()

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
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 rounded-3xl shadow-md p-8 mb-6 flex flex-col items-center justify-center text-center text-white border border-indigo-400/30">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-900/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center gap-4 w-full">
        <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-sm">
          <FileStack className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        
        <div className="space-y-1">
          <h3 className="font-black text-2xl sm:text-3xl tracking-wide drop-shadow-sm">
            تقييمات {selectedMonth.name.split(' ')[0]}
          </h3>
          <p className="text-indigo-100 font-bold text-sm sm:text-base max-w-xs mx-auto">
            إجمالي التقييمات المسجلة لهذا الشهر
          </p>
        </div>
        
        <div className="mt-2 flex flex-col items-center justify-center bg-white text-indigo-600 min-w-[140px] py-5 px-8 rounded-2xl shadow-xl border border-indigo-100 transform transition-transform hover:scale-105">
          <span className="text-6xl sm:text-7xl font-black leading-none tracking-tighter">{currentMonthCount}</span>
          <span className="text-sm font-black opacity-80 mt-2 uppercase tracking-widest text-indigo-400">تقييم مسجل</span>
        </div>
      </div>
    </div>
  );
};
"""

with open('src/components/TermProgress.tsx', 'w') as f:
    f.write(new_content)
