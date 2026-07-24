import re

with open('src/components/TermProgress.tsx', 'r') as f:
    content = f.read()

new_content = """import React, { useMemo } from 'react';
import { MonthInfo, AssessmentRecord, TermId } from '../types';
import { MONTHS_DATA } from '../lib/constants';
import { FileStack } from 'lucide-react';

interface TermProgressProps {
  selectedTerm: TermId;
  academicYear: string;
  monthAssessmentCounts: Record<string, number>;
  records: AssessmentRecord[];
}

export const TermProgress: React.FC<TermProgressProps> = ({
  selectedTerm,
  academicYear,
  records
}) => {
  const monthStats = useMemo(() => {
    const termMonths = MONTHS_DATA.filter(m => m.termId === selectedTerm);
    
    return termMonths.map(month => {
      // Count all assessment records for this month in the current term/year
      const count = records.filter(
        r => r.term_id === selectedTerm && 
             r.academic_year === academicYear && 
             r.month_id === month.id
      ).length;
      
      return {
        ...month,
        count
      };
    });
  }, [selectedTerm, academicYear, records]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
          <FileStack className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm md:text-base">عداد تقييمات الشهور</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {monthStats.map(stat => (
          <div key={stat.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{stat.name.split(' ')[0]}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-indigo-600">{stat.count}</span>
              <span className="text-[10px] font-bold text-slate-400">تقييم</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
"""

with open('src/components/TermProgress.tsx', 'w') as f:
    f.write(new_content)
