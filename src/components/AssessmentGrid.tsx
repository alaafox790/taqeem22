import React, { useState } from 'react';
import { Award, Lock, AlertCircle, ShieldCheck, Unlock, ArrowRight } from 'lucide-react';
import { MonthInfo, AssessmentRecord, TeacherProfile } from '../types';
import { getAdjustedDueDate } from '../lib/validation';
import { playAlertSoundAndVibrate } from '../lib/sound';

interface AssessmentGridProps {
  teacher: TeacherProfile;
  selectedMonth: MonthInfo;
  records: AssessmentRecord[];
  onSelectAssessment: (assessNum: number) => void;
  academicYear: string;
  teacherId: string;
  showToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AssessmentGrid: React.FC<AssessmentGridProps> = ({
  selectedMonth,
  records,
  onSelectAssessment,
  academicYear,
  teacherId,
  teacher,
  showToast,
}) => {
  const [showAllAssessments, setShowAllAssessments] = useState(false);

  // Sequential Unlock Rule State (Default to true as requested)
  const [enforceSequential, setEnforceSequential] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('school_enforce_sequential_assessments');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      // default to true
    }
    return true;
  });

  const handleToggleSequential = (val: boolean) => {
    setEnforceSequential(val);
    try {
      localStorage.setItem('school_enforce_sequential_assessments', JSON.stringify(val));
    } catch (e) {
      // ignore
    }
  };

  // Array 1 to 15 or current month assessments
  const assessmentsList = showAllAssessments 
    ? Array.from({ length: 15 }, (_, i) => i + 1)
    : selectedMonth.assessments;

  return (
    <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-4 sm:p-6 pt-4 space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            تقييمات {selectedMonth.name}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {enforceSequential 
              ? 'نظام الفتح التتابع الأسبوعي مفعل: يُفتح كل تقييم تلقائياً بعد توثيق التقييم السابق.' 
              : 'جميع تقييمات الشهر مفتوحة للمعاينة والإدخال المباشر.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Sequential Toggle Switch */}
          <label className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={enforceSequential}
              onChange={(e) => handleToggleSequential(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
            />
            <span className="text-xs font-extrabold text-slate-700 select-none flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>القفل التتابعي (فتح التقييم تلو الآخر)</span>
            </span>
          </label>

          {/* Show All 15 Assessments Option */}
          <label className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={showAllAssessments}
              onChange={(e) => setShowAllAssessments(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
            />
            <span className="text-xs font-extrabold text-slate-700 select-none">إظهار كل التقييمات (15)</span>
          </label>
        </div>
      </div>

      {/* Grid of Assessments */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
        {assessmentsList.map((num) => {
          // Check if part of the active month
          const isMonthAllowed = selectedMonth.assessments.includes(num);

          // Calculate recorded count for this assessment
          const recordedCount = records.filter(
            (r) => 
              r.assess_num === num && 
              r.academic_year === academicYear && 
              r.term_id === selectedMonth.termId
          ).length;

          // Determine sequential position inside month's assessments
          const idxInMonth = selectedMonth.assessments.indexOf(num);
          const prevNum = idxInMonth > 0 ? selectedMonth.assessments[idxInMonth - 1] : (num > 1 ? num - 1 : null);

          // Check if previous assessment is recorded
          const prevRecordedCount = prevNum 
            ? records.filter(
                (r) => 
                  r.assess_num === prevNum && 
                  r.academic_year === academicYear && 
                  r.term_id === selectedMonth.termId
              ).length
            : 0;

          // Sequential Lock Condition:
          // Unlocked if:
          // 1) First assessment in month (or num === 1)
          // 2) OR previous assessment has at least 1 record
          // 3) OR this assessment already has records
          // 4) OR enforceSequential is turned OFF
          const isSequentiallyUnlocked = 
            !enforceSequential || 
            idxInMonth <= 0 || 
            num === 1 ||
            prevRecordedCount > 0 || 
            recordedCount > 0;

          // If not part of the active month (and showAll is on)
          if (!isMonthAllowed) {
            return (
              <div
                key={num}
                className="relative aspect-square bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 select-none transition-all border border-slate-200 p-2"
              >
                {recordedCount > 0 && (
                  <div className="absolute top-2 right-2 bg-slate-400 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {recordedCount}
                  </div>
                )}
                <Lock className="w-5 h-5 mb-1.5 text-slate-400 opacity-60" />
                <span className="text-xs font-bold">تقييم {num}</span>
                <span className="text-[9px] text-slate-400 font-medium">شهر آخر</span>
              </div>
            );
          }

          // If locked sequentially
          if (!isSequentiallyUnlocked) {
            return (
              <button
                key={num}
                type="button"
                onClick={() => {
                  playAlertSoundAndVibrate();
                  if (showToast) {
                    showToast(
                      'info',
                      `التقييم ${num} مغلق تتابعياً 🔒`,
                      `يرجى إدخال وتوثيق نتائج (تقييم ${prevNum}) أولاً لفتح التقييم التالي تلقائياً، أو قم بإيقاف خيار (القفل التتابعي) بأعلى الشاشة.`
                    );
                  }
                }}
                className="relative aspect-square bg-slate-100 hover:bg-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-slate-500 cursor-pointer transition-all border-2 border-dashed border-slate-300 p-2 group shadow-inner"
              >
                <div className="absolute top-2 right-2 bg-slate-300 text-slate-700 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>مغلق</span>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-black text-slate-700">تقييم {num}</span>
                <span className="text-[10px] text-slate-500 font-bold mt-0.5 text-center line-clamp-1">
                  ينتظر تقييم {prevNum}
                </span>
              </button>
            );
          }

          // Check if Overdue
          let isOverdue = false;
          if (recordedCount === 0) {
            try {
              const [year1, year2] = academicYear.split('/').map(Number);
              if (year1 && year2) {
                const yearForMonth = selectedMonth.monthNumber >= 8 ? year1 : year2;
                
                const today = new Date();
                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth() + 1;
                const currentDay = today.getDate();
                
                if (
                  currentYear > yearForMonth || 
                  (currentYear === yearForMonth && currentMonth > selectedMonth.monthNumber)
                ) {
                  isOverdue = true;
                } else if (currentYear === yearForMonth && currentMonth === selectedMonth.monthNumber) {
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

          // Unlocked & Available Card UI
          const colorClass = selectedMonth.color || 'bg-[#ea580c] hover:bg-[#d97706]';
          const weekText = idxInMonth >= 0 ? `الأسبوع ${idxInMonth + 1}` : '';

          return (
            <button
              key={num}
              type="button"
              onClick={() => onSelectAssessment(num)}
              className={`relative aspect-square ${colorClass} transition-all rounded-2xl flex flex-col items-center justify-center text-white cursor-pointer shadow-md hover:shadow-lg active:scale-95 p-2 group`}
            >
              {recordedCount > 0 ? (
                <div className="absolute top-2 right-2 bg-white text-slate-900 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                  {recordedCount}
                </div>
              ) : (
                weekText && (
                  <div className="absolute top-2 right-2 bg-black/20 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    {weekText}
                  </div>
                )
              )}

              {isOverdue && recordedCount === 0 && (
                <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-md shadow-sm animate-pulse flex items-center gap-1 font-bold z-10 border border-rose-400">
                  <AlertCircle className="w-3 h-3" /> متأخر
                </div>
              )}

              <Award className="w-7 h-7 mb-1 opacity-95 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-black">تقييم {num}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

