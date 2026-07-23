import React from 'react';
import { AlertTriangle, RefreshCw, X, Check, Calendar, User, FileText } from 'lucide-react';
import { AssessmentRecord } from '../types';

interface DuplicateConfirmModalProps {
  isOpen: boolean;
  existingRecord: AssessmentRecord;
  newRecord: Partial<AssessmentRecord>;
  onConfirmOverwrite: () => void;
  onCancel: () => void;
}

export const DuplicateConfirmModal: React.FC<DuplicateConfirmModalProps> = ({
  isOpen,
  existingRecord,
  newRecord,
  onConfirmOverwrite,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-slate-100 my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Warning Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Title & Message */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl font-black text-slate-900">
            تم تسجيل هذا التقييم مسبقاً، هل تريد استبداله؟
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            يوجد سجل سابق بنفس البيانات للعام الدراسي ({newRecord.academic_year}) للصف ({newRecord.grade}) الفصل ({newRecord.class_num}) للتقييم رقم ({newRecord.assess_num}).
          </p>
        </div>

        {/* Comparison Details */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 mb-6 text-xs">
          <div className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center justify-between">
            <span>مقارنة البيانات:</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-extrabold">
              سجل مكرر
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold">السجل السابق المخزن:</div>
              <div className="font-bold text-slate-800">التاريخ: {existingRecord.assess_date}</div>
              <div className="text-[11px] text-slate-500 truncate">
                الملاحظات: {existingRecord.notes || 'بدون ملاحظات'}
              </div>
            </div>

            <div className="space-y-1 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <div className="text-[10px] text-emerald-600 font-bold">التسجيل الجديد الحالي:</div>
              <div className="font-bold text-emerald-900">التاريخ: {newRecord.assess_date}</div>
              <div className="text-[11px] text-emerald-700 truncate">
                الملاحظات: {newRecord.notes || 'بدون ملاحظات'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
          >
            إلغاء الأمر
          </button>
          
          <button
            type="button"
            onClick={onConfirmOverwrite}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>نعم، استبدال التقييم السابق</span>
          </button>
        </div>

      </div>
    </div>
  );
};
