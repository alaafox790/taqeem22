import React from 'react';
import { Award, Lock } from 'lucide-react';
import { MonthInfo, AssessmentRecord } from '../types';

interface AssessmentGridProps {
  selectedMonth: MonthInfo;
  records: AssessmentRecord[];
  onSelectAssessment: (assessNum: number) => void;
  academicYear: string;
  teacherId: string;
}

export const AssessmentGrid: React.FC<AssessmentGridProps> = ({
  selectedMonth,
  records,
  onSelectAssessment,
  academicYear,
  teacherId,
}) => {
  // Array 1 to 15
  const assessmentsList = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-4 sm:p-6 pt-4">
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
        {assessmentsList.map((num) => {
          // Check if unlocked
          const isUnlocked = selectedMonth.assessments.includes(num);

          // Calculate how many times this assessment was recorded across all classes in the selected academic year and term/month
          const recordedCount = records.filter(
            (r) => 
              r.assess_num === num && 
              r.academic_year === academicYear && 
              r.term_id === selectedMonth.termId
          ).length;

          if (!isUnlocked) {
            // Locked Card UI (Light Gray)
            return (
              <div
                key={num}
                className="relative aspect-square bg-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 select-none transition-all border border-slate-300"
              >
                {recordedCount > 0 && (
                  <div className="absolute top-2 right-2 bg-slate-400 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                    {recordedCount}
                  </div>
                )}
                <Lock className="w-6 h-6 mb-2 text-slate-400" />
                <span className="text-sm font-bold">تقييم {num}</span>
              </div>
            );
          }

          // Unlocked Card UI
          const colorClass = selectedMonth.color || 'bg-[#ea580c] hover:bg-[#d97706]';

          return (
            <button
              key={num}
              onClick={() => onSelectAssessment(num)}
              className={`relative aspect-square ${colorClass} transition-colors rounded-xl flex flex-col items-center justify-center text-white cursor-pointer shadow-sm active:scale-95`}
            >
              {recordedCount > 0 && (
                <div className="absolute top-2 right-2 bg-white text-slate-900 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                  {recordedCount}
                </div>
              )}
              <Award className="w-8 h-8 mb-2 opacity-90" />
              <span className="text-sm font-bold">تقييم {num}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
