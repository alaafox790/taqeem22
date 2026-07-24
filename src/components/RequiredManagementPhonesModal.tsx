import React, { useState } from 'react';
import { Shield, Phone, UserCheck, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { TeacherProfile } from '../types';
import { saveFirebaseTeacher } from '../lib/firebase';

interface RequiredManagementPhonesModalProps {
  isOpen: boolean;
  teacher: TeacherProfile;
  onSave: (updatedTeacher: TeacherProfile) => void;
}

export const RequiredManagementPhonesModal: React.FC<RequiredManagementPhonesModalProps> = ({
  isOpen,
  teacher,
  onSave,
}) => {
  const [principalPhone, setPrincipalPhone] = useState(teacher.principalPhone || '');
  const [deputyPhone, setDeputyPhone] = useState(teacher.deputyPhone || '');
  const [supervisorPhone, setSupervisorPhone] = useState(teacher.supervisorPhone || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = principalPhone.trim();
    const d = deputyPhone.trim();
    const s = supervisorPhone.trim();

    if (!p || p.length < 8) {
      setError('يرجى إدخال رقم جوال مدير المدرسة صحيح (8 أرقام على الأقل)');
      return;
    }
    if (!d || d.length < 8) {
      setError('يرجى إدخال رقم جوال وكيل المدرسة صحيح (8 أرقام على الأقل)');
      return;
    }
    if (!s || s.length < 8) {
      setError('يرجى إدخال رقم جوال المشرف التربوي صحيح (8 أرقام على الأقل)');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const updated: TeacherProfile = {
      ...teacher,
      principalPhone: p,
      deputyPhone: d,
      supervisorPhone: s,
    };

    try {
      // Save locally & to Firebase
      await saveFirebaseTeacher(updated);
      onSave(updated);
    } catch (err) {
      console.error(err);
      onSave(updated);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto dir-rtl font-['Tajawal',sans-serif] select-none">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-amber-200 animate-in fade-in zoom-in duration-300">
        
        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center text-amber-600 shadow-md mb-4">
          <Shield className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="text-center space-y-2 mb-6">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black tracking-wide">
            شرط أساسي لتشغيل التطبيق 🛑
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            أرقام جوالات القيادات المدرسية
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed px-2">
            يتوجب إدخال أرقام جوال (المدير، الوكيل، والمشرف التربوي) لربط حساب المعلم لتمكين متابعة التقييمات والسجلات المدرسية.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Principal Phone */}
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 hover:border-amber-400 transition-colors">
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5 text-right flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-600" />
                رقم جوال مدير المدرسة <span className="text-rose-500 font-bold">*</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold">إجباري</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                required
                value={principalPhone}
                onChange={(e) => {
                  setPrincipalPhone(e.target.value);
                  setError('');
                }}
                className="block w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white font-mono text-right dir-ltr placeholder:text-right placeholder:font-sans placeholder:text-slate-400 font-bold text-slate-800"
                placeholder="05X XXX XXXX"
                dir="ltr"
              />
            </div>
          </div>

          {/* Deputy Phone */}
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 hover:border-sky-400 transition-colors">
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5 text-right flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-sky-600" />
                رقم جوال وكيل المدرسة <span className="text-rose-500 font-bold">*</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold">إجباري</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                required
                value={deputyPhone}
                onChange={(e) => {
                  setDeputyPhone(e.target.value);
                  setError('');
                }}
                className="block w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm bg-white font-mono text-right dir-ltr placeholder:text-right placeholder:font-sans placeholder:text-slate-400 font-bold text-slate-800"
                placeholder="05X XXX XXXX"
                dir="ltr"
              />
            </div>
          </div>

          {/* Supervisor Phone */}
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 hover:border-emerald-400 transition-colors">
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5 text-right flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                رقم جوال المشرف التربوي <span className="text-rose-500 font-bold">*</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold">إجباري</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                required
                value={supervisorPhone}
                onChange={(e) => {
                  setSupervisorPhone(e.target.value);
                  setError('');
                }}
                className="block w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white font-mono text-right dir-ltr placeholder:text-right placeholder:font-sans placeholder:text-slate-400 font-bold text-slate-800"
                placeholder="05X XXX XXXX"
                dir="ltr"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>تأكيد البيانات وفتح التطبيق</span>
            </button>
          </div>
        </form>

        <p className="text-center text-[11px] text-slate-400 font-bold mt-4">
          تضمن هذه الخطوة دقة المتابعة التقويمية المباشرة من الإدارة المدرسية.
        </p>
      </div>
    </div>
  );
};
