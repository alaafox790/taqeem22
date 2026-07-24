import React, { useState } from 'react';
import { Award, Lock, AlertCircle } from 'lucide-react';
import { MonthInfo, AssessmentRecord, TeacherProfile } from '../types';
import { getAdjustedDueDate } from '../lib/validation';

interface AssessmentGridProps {
  teacher: TeacherProfile;
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
  teacher,
}) => {
  const [showAllAssessments, setShowAllAssessments] = useState(false);

  // Array 1 to 15 or current month assessments
  const assessmentsList = showAllAssessments 
    ? Array.from({ length: 15 }, (_, i) => i + 1)
    : selectedMonth.assessments;

  return (
    <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-4 sm:p-6 pt-4">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <Award className="w-5 h-5 text-slate-400" />
          تقييمات {selectedMonth.name}
        </h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={showAllAssessments}
            onChange={(e) => setShowAllAssessments(e.target.checked)}
            className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] border-slate-300"
          />
          <span className="text-sm font-bold text-slate-600 select-none">إظهار كل التقييمات (15)</span>
        </label>
      </div>

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

          // Is Overdue Logic
          let isOverdue = false;
          if (isUnlocked && recordedCount === 0) {
            try {
              const [year1, year2] = academicYear.split('/').map(Number);
              if (year1 && year2) {
                const yearForMonth = selectedMonth.monthNumber >= 8 ? year1 : year2;
                
                // Get today's date in local time
                const today = new Date();
                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth() + 1;
                const currentDay = today.getDate();
                
                // If we are past the month completely
                if (
                  currentYear > yearForMonth || 
                  (currentYear === yearForMonth && currentMonth > selectedMonth.monthNumber)
                ) {
                  isOverdue = true;
                } 
                // If we are in the same month, check by period
                else if (currentYear === yearForMonth && currentMonth === selectedMonth.monthNumber) {
                  const count = selectedMonth.assessments.length;
                  const index = selectedMonth.assessments.indexOf(num);
                  if (count > 0 && index !== -1) {
                    const daysInMonth = new Date(yearForMonth, selectedMonth.monthNumber, 0).getDate();
                    const periodLength = daysInMonth / count;
                    const originalDueDate = Math.round(periodLength * (index + 1));
                    const dueDateDay = getAdjustedDueDate(yearForMonth, selectedMonth.monthNumber, originalDueDate, teacher?.officialHolidays || []);
                    
                    if (currentDay > dueDateDay) {
                      isOverdue = true;
                    }
                  }
                }
              }
            } catch (e) {
              console.error(e);
            }
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
              {isOverdue && recordedCount === 0 && (
                 <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-md shadow-sm animate-pulse flex items-center gap-1 font-bold z-10 border border-rose-400">
                   <AlertCircle className="w-3 h-3" /> متأخر
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
