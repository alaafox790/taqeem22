import React, { useMemo } from 'react';
import { MonthInfo, AssessmentRecord, TermId } from '../types';
import { MONTHS_DATA } from '../lib/constants';
import { Trophy, Target } from 'lucide-react';

interface TermProgressProps {
  selectedTerm: TermId;
  academicYear: string;
  monthAssessmentCounts: Record<string, number>;
  records: AssessmentRecord[];
}

export const TermProgress: React.FC<TermProgressProps> = ({
  selectedTerm,
  academicYear,
  monthAssessmentCounts,
  records
}) => {
  const { totalTarget, completedTarget, percentage } = useMemo(() => {
    const termMonths = MONTHS_DATA.filter(m => m.termId === selectedTerm);
    const total = termMonths.reduce((acc, m) => acc + (monthAssessmentCounts[m.id] || 0), 0);
    
    const uniqueAssessmentsDone = new Set(
      records
        .filter(r => r.term_id === selectedTerm && r.academic_year === academicYear)
        .map(r => r.assess_num)
    ).size;

    const completed = Math.min(uniqueAssessmentsDone, total); // Cap at total just in case
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { totalTarget: total, completedTarget: completed, percentage: pct };
  }, [selectedTerm, academicYear, monthAssessmentCounts, records]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${percentage === 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-[#0284c7]/10 text-[#0284c7]'}`}>
            {percentage === 100 ? <Trophy className="w-5 h-5" /> : <Target className="w-5 h-5" />}
          </div>
          <h3 className="font-bold text-slate-800 text-sm md:text-base">إنجاز تقييمات الفصل الدراسي</h3>
        </div>
        <div className="text-sm font-black text-slate-700">
          {completedTarget} / {totalTarget}
        </div>
      </div>
      
      <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 right-0 h-full rounded-full transition-all duration-1000 ease-out ${
            percentage === 100 ? 'bg-emerald-500' : 'bg-gradient-to-l from-[#0284c7] to-[#38bdf8]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs font-bold text-slate-500">
          {percentage}% مكتمل
        </span>
        <span className="text-xs font-bold text-slate-500">
          {totalTarget - completedTarget > 0 
            ? `متبقي ${totalTarget - completedTarget} تقييمات`
            : 'اكتملت جميع التقييمات!'}
        </span>
      </div>
    </div>
  );
};
