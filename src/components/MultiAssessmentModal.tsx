import React, { useState, useEffect } from 'react';
import { X, Calendar, Save, Trash2, Edit } from 'lucide-react';
import { MonthInfo, AssessmentRecord, TermId, TeacherProfile } from '../types';
import { GRADES, CLASSES_COUNT } from '../lib/constants';

interface MultiAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessNums: number[];
  mode: 'record' | 'delete';
  selectedMonth: MonthInfo;
  academicYear: string;
  selectedTerm: TermId;
  teacherId: string;
  teacher?: TeacherProfile;
  records?: AssessmentRecord[];
  onSaveMultiple: (recordsToSave: Partial<AssessmentRecord>[]) => void;
  onDeleteMultiple: (grade: string, classNum: number, assessNums: number[]) => void;
}

export const MultiAssessmentModal: React.FC<MultiAssessmentModalProps> = ({
  isOpen,
  onClose,
  assessNums,
  mode,
  selectedMonth,
  academicYear,
  selectedTerm,
  teacherId,
  teacher,
  records,
  onSaveMultiple,
  onDeleteMultiple,
}) => {
  if (!isOpen || assessNums.length === 0) return null;

  const [grade, setGrade] = useState<string>('الأول');
  const [classNum, setClassNum] = useState<number>(1);
  const [assessDate, setAssessDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'record') {
      const recordsToSave: Partial<AssessmentRecord>[] = assessNums.map(num => ({
        teacher_id: teacherId,
        academic_year: academicYear,
        term_id: selectedTerm,
        month_id: selectedMonth.id,
        assess_num: num,
        grade,
        class_num: classNum,
        assess_date: assessDate,
        notes,
        timing_status: 'normal',
        timing_period: 'start',
        model_form: 'أ', // Default
      }));
      onSaveMultiple(recordsToSave);
    } else {
      onDeleteMultiple(grade, classNum, assessNums);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md rounded-t-2xl z-10 ${mode === 'delete' ? 'bg-rose-50/80' : 'bg-indigo-50/80'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${mode === 'delete' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {mode === 'delete' ? <Trash2 className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800">
                {mode === 'delete' ? 'حذف متعدد' : 'تسجيل متعدد'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {assessNums.length} تقييمات محددة: {assessNums.sort((a,b) => a-b).join('، ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الصف الدراسي</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {GRADES.map(g => (
                    <option key={g} value={g}>الصف {g}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الفصل</label>
                <select
                  value={classNum}
                  onChange={(e) => setClassNum(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {Array.from({ length: CLASSES_COUNT }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>فصل {num}</option>
                  ))}
                </select>
              </div>
            </div>

            {mode === 'record' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    تاريخ التنفيذ للجميع
                  </label>
                  <input
                    type="date"
                    value={assessDate}
                    onChange={(e) => setAssessDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">ملاحظة عامة (اختياري)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ملاحظة تنطبق على كافة التقييمات المحددة..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors ${
                mode === 'delete' 
                  ? 'bg-rose-600 hover:bg-rose-700' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {mode === 'delete' ? <Trash2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              <span>{mode === 'delete' ? 'تأكيد الحذف' : 'تأكيد التسجيل'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
