import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, ArrowLeft, Calendar, FileText, ChevronLeft } from 'lucide-react';
import { fetchFirebaseStudents } from '../lib/firebase';
import { getAdjustedDueDate } from '../lib/validation';
import { AssessmentRecord, MonthInfo, TermId } from '../types';
import { MONTHS_DATA } from '../lib/constants';

interface LateAssessmentsProps {
  officialHolidays?: string[];
  teacherId: string;
  records: AssessmentRecord[];
  selectedTerm: TermId;
  academicYear: string;
  onOpenAssessment: (month: MonthInfo, assessNum: number, termId: TermId) => void;
}

export const LateAssessments: React.FC<LateAssessmentsProps> = ({ teacherId, records, selectedTerm, academicYear, onOpenAssessment, officialHolidays = [] }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadClasses = async () => {
      setLoading(true);
      try {
        const data = await fetchFirebaseStudents(teacherId);
        if (mounted) {
          setStudents(data);
        }
      } catch (err) {
        console.error("Error loading students:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (teacherId) {
      loadClasses();
    }
    return () => { mounted = false; };
  }, [teacherId]);

  const lateAssessments = useMemo(() => {
    if (!students.length) return [];

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthNum = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate();

    let y1 = currentYear, y2 = currentYear + 1;
    try {
      const parts = academicYear.split('/').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        y1 = parts[0];
        y2 = parts[1];
      }
    } catch (e) {}

    const termRecords = records.filter(r => r.academic_year === academicYear && r.term_id === selectedTerm);

    // Get unique classes the teacher has
    const classSet = new Set<string>(students.map(s => `${s.grade}-${s.class_num}`));
    const classes = Array.from(classSet).map(c => {
      const [grade, classNum] = c.split('-');
      return { grade, classNum: parseInt(classNum, 10) };
    });

    const lateList: any[] = [];

    classes.forEach(cls => {
      // Find records for this class in current term
      const classRecords = termRecords.filter(r => r.grade === cls.grade && r.class_num === cls.classNum);
      const completedSet = new Set(classRecords.map(r => r.assess_num));
      const maxRecorded = classRecords.length > 0 ? Math.max(...classRecords.map(r => r.assess_num)) : 0;

      for (let i = 1; i <= 15; i++) {
        if (!completedSet.has(i)) {
          // Find which month this assessment belongs to
          const monthInfo = MONTHS_DATA.find(m => m.termId === selectedTerm && m.assessments.includes(i));
          if (monthInfo) {
            let isOverdue = false;
            
            // 1. Is it skipped (i.e., teacher recorded a later assessment but skipped this one)?
            if (i < maxRecorded) {
              isOverdue = true;
            } else {
              // 2. Is it past its due date based on precise month periods?
              const yearForMonth = monthInfo.monthNumber >= 8 ? y1 : y2;
              
              if (currentYear > yearForMonth || (currentYear === yearForMonth && currentMonthNum > monthInfo.monthNumber)) {
                isOverdue = true;
              } else if (currentYear === yearForMonth && currentMonthNum === monthInfo.monthNumber) {
                const count = monthInfo.assessments.length;
                const index = monthInfo.assessments.indexOf(i);
                if (count > 0 && index !== -1) {
                  const daysInMonth = new Date(yearForMonth, monthInfo.monthNumber, 0).getDate();
                  const periodLength = daysInMonth / count;
                  const originalDueDate = Math.round(periodLength * (index + 1));
                  const dueDateDay = getAdjustedDueDate(yearForMonth, monthInfo.monthNumber, originalDueDate, officialHolidays);
                  
                  if (currentDay > dueDateDay) {
                    isOverdue = true;
                  }
                }
              }
            }

            if (isOverdue) {
              lateList.push({
                grade: cls.grade,
                classNum: cls.classNum,
                assessNum: i,
                monthInfo,
                termId: selectedTerm
              });
            }
          }
        }
      }
    });

    // Sort by assessNum then grade then classNum
    return lateList.sort((a, b) => {
      if (a.assessNum !== b.assessNum) return a.assessNum - b.assessNum;
      if (a.grade !== b.grade) return a.grade.localeCompare(b.grade);
      return a.classNum - b.classNum;
    });

  }, [students, records]);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mt-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (lateAssessments.length === 0) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 mt-6 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">لا توجد تقييمات متأخرة!</h3>
          <p className="text-sm text-slate-500">عمل رائع، جميع سجلاتك محدثة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-rose-100 mt-6 overflow-hidden">
      <div className="p-5 border-b border-rose-50 bg-rose-50/30 flex items-center gap-3">
        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shadow-sm shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-black text-rose-700">التقييمات المتأخرة</h3>
          <p className="text-xs text-rose-500 font-medium">{lateAssessments.length} تقييم يحتاج إلى إدخال</p>
        </div>
      </div>

      <div className="p-2 max-h-[300px] overflow-y-auto space-y-2">
        {lateAssessments.map((late, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-black shrink-0">
                {late.assessNum}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-0.5">
                  الصف {late.grade} - فصل {late.classNum}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {late.monthInfo.name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> التقييم رقم {late.assessNum}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onOpenAssessment(late.monthInfo, late.assessNum, late.termId)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shrink-0 w-full sm:w-auto"
            >
              تسجيل سريع
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
