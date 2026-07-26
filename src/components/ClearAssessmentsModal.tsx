import React, { useState, useMemo } from 'react';
import { AlertTriangle, Trash2, X, Calendar, Check, Layers, Filter } from 'lucide-react';
import { AssessmentRecord, TermId } from '../types';
import { MONTHS_DATA, GRADES } from '../lib/constants';

export interface ClearAssessmentsOptions {
  clearScope: 'all' | 'single' | 'range';
  singleMonthId: string;
  startMonthId: string;
  endMonthId: string;
  termFilter: 'all' | 'term1' | 'term2';
  gradeFilter: 'all' | string;
}

interface ClearAssessmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: AssessmentRecord[];
  selectedTerm: TermId;
  defaultMonthId?: string;
  onConfirmClear: (options: ClearAssessmentsOptions, countToDelete: number) => Promise<void>;
}

export const isRecordInMonth = (r: AssessmentRecord, monthId: string): boolean => {
  const month = MONTHS_DATA.find(m => m.id === monthId);
  if (!month) return false;

  // 1. Direct month_id match
  if (r.month_id === monthId || r.month_id === month.name) return true;

  // 2. Term & assessment number match
  if ((!r.term_id || r.term_id === month.termId) && month.assessments.includes(r.assess_num)) return true;

  // 3. Date month match if assess_date exists
  if (r.assess_date) {
    const parts = r.assess_date.split('-');
    if (parts.length >= 2) {
      const recMonthNum = parseInt(parts[1], 10);
      if (!isNaN(recMonthNum) && recMonthNum === month.monthNumber) return true;
    }
  }

  return false;
};

export const isRecordInMonthRange = (r: AssessmentRecord, startMonthId: string, endMonthId: string): boolean => {
  const startIdx = MONTHS_DATA.findIndex(m => m.id === startMonthId);
  const endIdx = MONTHS_DATA.findIndex(m => m.id === endMonthId);
  if (startIdx === -1 || endIdx === -1) return false;

  const minIdx = Math.min(startIdx, endIdx);
  const maxIdx = Math.max(startIdx, endIdx);

  const targetMonths = MONTHS_DATA.slice(minIdx, maxIdx + 1);
  return targetMonths.some(m => isRecordInMonth(r, m.id));
};

export const ClearAssessmentsModal: React.FC<ClearAssessmentsModalProps> = ({
  isOpen,
  onClose,
  records,
  selectedTerm,
  defaultMonthId,
  onConfirmClear,
}) => {
  const [clearScope, setClearScope] = useState<'all' | 'single' | 'range'>('single');
  const [singleMonthId, setSingleMonthId] = useState<string>(defaultMonthId || MONTHS_DATA[0].id);
  const [startMonthId, setStartMonthId] = useState<string>(MONTHS_DATA[0].id);
  const [endMonthId, setEndMonthId] = useState<string>(MONTHS_DATA[2].id);
  const [termFilter, setTermFilter] = useState<'all' | 'term1' | 'term2'>('all');
  const [gradeFilter, setGradeFilter] = useState<'all' | string>('all');

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);

  // Filter records matching current selections
  const matchingRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Term Filter
      if (termFilter !== 'all' && r.term_id && r.term_id !== termFilter) {
        return false;
      }

      // 2. Grade Filter
      if (gradeFilter !== 'all' && r.grade && r.grade !== gradeFilter) {
        return false;
      }

      // 3. Scope / Month Filter
      if (clearScope === 'all') {
        return true;
      }

      if (clearScope === 'single') {
        return isRecordInMonth(r, singleMonthId);
      }

      if (clearScope === 'range') {
        return isRecordInMonthRange(r, startMonthId, endMonthId);
      }

      return true;
    });
  }, [records, clearScope, singleMonthId, startMonthId, endMonthId, termFilter, gradeFilter]);

  if (!isOpen) return null;

  const handleExecute = async () => {
    if (!confirmStep) {
      setConfirmStep(true);
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirmClear(
        {
          clearScope,
          singleMonthId,
          startMonthId,
          endMonthId,
          termFilter,
          gradeFilter,
        },
        matchingRecords.length
      );
      setConfirmStep(false);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const currentTermMonths = termFilter === 'all' 
    ? MONTHS_DATA 
    : MONTHS_DATA.filter(m => m.termId === termFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto dir-rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-5 sm:p-7 relative border border-slate-100 my-auto animate-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              مسح وتصفير التقييمات المخصص
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              تصفير السجلات حسب شهر محدد، مدة معينة، أو مسح شامل لكل الشهور
            </p>
          </div>
        </div>

        {/* Options Form */}
        <div className="space-y-4 text-xs font-bold text-slate-800">
          
          {/* 1. Clear Scope Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-700 flex items-center gap-1.5 font-extrabold">
              <Layers className="w-4 h-4 text-rose-600" />
              <span>اختر نطاق المسح المطلوب:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setClearScope('single');
                  setConfirmStep(false);
                }}
                className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer font-extrabold ${
                  clearScope === 'single'
                    ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-200'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                📅 شهر معين
              </button>

              <button
                type="button"
                onClick={() => {
                  setClearScope('range');
                  setConfirmStep(false);
                }}
                className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer font-extrabold ${
                  clearScope === 'range'
                    ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-200'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                📆 مدة معينة (نطاق)
              </button>

              <button
                type="button"
                onClick={() => {
                  setClearScope('all');
                  setConfirmStep(false);
                }}
                className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer font-extrabold ${
                  clearScope === 'all'
                    ? 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ⚠️ كل الشهور
              </button>
            </div>
          </div>

          {/* 2. Specific Scope Selectors */}
          {clearScope === 'single' && (
            <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2 animate-in fade-in">
              <label className="block text-slate-800">اختر الشهر المراد مسح تقييماته:</label>
              <select
                value={singleMonthId}
                onChange={(e) => {
                  setSingleMonthId(e.target.value);
                  setConfirmStep(false);
                }}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {MONTHS_DATA.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.termId === 'term1' ? 'الترم الأول' : 'الترم الثاني'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {clearScope === 'range' && (
            <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-3 animate-in fade-in">
              <label className="block text-slate-800 font-extrabold">حدد نطاق الشهور (من شهر .. إلى شهر):</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">من شهر:</label>
                  <select
                    value={startMonthId}
                    onChange={(e) => {
                      setStartMonthId(e.target.value);
                      setConfirmStep(false);
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {MONTHS_DATA.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name.split(' ')[0]} ({m.termId === 'term1' ? 'ت1' : 'ت2'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">إلى شهر:</label>
                  <select
                    value={endMonthId}
                    onChange={(e) => {
                      setEndMonthId(e.target.value);
                      setConfirmStep(false);
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {MONTHS_DATA.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name.split(' ')[0]} ({m.termId === 'term1' ? 'ت1' : 'ت2'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 3. Term & Grade Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-slate-700 flex items-center gap-1 font-bold">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>الترم الدراسي:</span>
              </label>
              <select
                value={termFilter}
                onChange={(e) => {
                  setTermFilter(e.target.value as any);
                  setConfirmStep(false);
                }}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">جميع الأترام (الترم 1 + 2)</option>
                <option value="term1">الترم الأول فقط</option>
                <option value="term2">الترم الثاني فقط</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 flex items-center gap-1 font-bold">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>تحديد الصف (اختياري):</span>
              </label>
              <select
                value={gradeFilter}
                onChange={(e) => {
                  setGradeFilter(e.target.value);
                  setConfirmStep(false);
                }}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">جميع الصفوف والفصول</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>الصف {g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Real-time Matching Summary Box */}
          <div className={`p-4 rounded-2xl border transition-colors ${
            matchingRecords.length > 0 
              ? 'bg-amber-50 border-amber-200 text-amber-900' 
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`w-4 h-4 ${matchingRecords.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
              <span className="font-black text-xs">معاينة نتيجة المسح الحالية:</span>
            </div>
            
            {matchingRecords.length > 0 ? (
              <p className="text-xs font-bold leading-relaxed">
                سيتم مسح <span className="text-rose-700 text-sm font-black underline mx-1">{matchingRecords.length}</span> سجل تقييم وحضور ينطبق عليها الشروط المحددة أعلاه.
              </p>
            ) : (
              <p className="text-xs font-bold text-slate-500">
                لا توجد سجلات تقييم مخزنة حالياً تنطبق عليها الخيارات المحددة.
              </p>
            )}
          </div>

          {confirmStep && (
            <div className="p-3 bg-rose-100 border border-rose-300 rounded-2xl text-rose-950 text-xs font-black animate-in fade-in flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>تأكيد أخير: عملية مسح التقييمات لا يمكن التراجع عنها. هل أنت متأكد تماماً من التنفيذ؟</span>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={isDeleting}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
              confirmStep
                ? 'bg-rose-700 hover:bg-rose-800 shadow-rose-700/30 animate-pulse'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
            }`}
          >
            {isDeleting ? (
              <span>جاري المسح والتنظيف...</span>
            ) : confirmStep ? (
              <>
                <Check className="w-4 h-4" />
                <span>
                  {matchingRecords.length > 0
                    ? `نعم، تأكيد مسح الـ (${matchingRecords.length}) سجل فوراً`
                    : 'نعم، تأكيد وتصفير التقييمات الآن'}
                </span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>
                  {matchingRecords.length > 0
                    ? `مسح التقييمات المطابقة (${matchingRecords.length})`
                    : 'مسح وتصفير التقييمات الآن'}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
