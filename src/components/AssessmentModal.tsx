import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle, Save, Sparkles, CheckCircle2, Layers, BookOpen, Clock, FileText, Mic, MicOff, Loader2 } from 'lucide-react';
import { MonthInfo, AssessmentRecord, TermId } from '../types';
import { GRADES, CLASSES_COUNT, getFormModel, getFormDescription } from '../lib/constants';
import { validateAssessmentTiming } from '../lib/validation';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessNum: number;
  selectedMonth: MonthInfo;
  academicYear: string;
  selectedTerm: TermId;
  teacherId: string;
  onSave: (recordData: Partial<AssessmentRecord>, isExceptionalConfirmed?: boolean) => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  assessNum,
  selectedMonth,
  academicYear,
  selectedTerm,
  teacherId,
  onSave,
}) => {
  if (!isOpen) return null;

  const modelForm = getFormModel(assessNum);
  const formDesc = getFormDescription(modelForm);

  const [grade, setGrade] = useState<string>('الأول');
  const [classNum, setClassNum] = useState<number>(1);
  
  // Calculate exact year and limits based on academicYear and selectedMonth
  const getYearForMonth = () => {
    try {
      const [year1, year2] = academicYear.split('/').map(Number);
      if (selectedMonth.monthNumber >= 9) {
        return year1;
      } else {
        return year2 || (year1 + 1);
      }
    } catch {
      return new Date().getFullYear();
    }
  };

  const targetYear = getYearForMonth();
  const monthStr = String(selectedMonth.monthNumber).padStart(2, '0');
  
  // Create first and last days of the month
  const firstDay = `${targetYear}-${monthStr}-01`;
  const lastDayObj = new Date(targetYear, selectedMonth.monthNumber, 0);
  const lastDay = `${targetYear}-${monthStr}-${String(lastDayObj.getDate()).padStart(2, '0')}`;

  const todayStr = new Date().toISOString().split('T')[0];
  
  const [assessDate, setAssessDate] = useState<string>(() => {
    // If today is within the month, use today, else use the 1st of the month
    if (todayStr >= firstDay && todayStr <= lastDay) {
      return todayStr;
    }
    return firstDay;
  });
  const [notes, setNotes] = useState<string>('');
  const [isHoliday, setIsHoliday] = useState<boolean>(false);
  const [holidayDesc, setHolidayDesc] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('عذراً، متصفحك لا يدعم تسجيل الصوت.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setNotes(prev => prev ? prev + ' ' + finalTranscript : finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error !== 'no-speech') {
        setSpeechError('حدث خطأ أثناء التسجيل. حاول مرة أخرى.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (e) {
        setIsListening(false);
        setSpeechError('تعذر بدء التسجيل.');
      }
    }
  };
  const [isRandomDistribution, setIsRandomDistribution] = useState<boolean>(false);
  
  const [validationError, setValidationError] = useState<string | null>(null);
  const [timingResult, setTimingResult] = useState(() =>
    validateAssessmentTiming(todayStr, selectedMonth)
  );

  // Re-evaluate timing when assessDate or selectedMonth changes
  useEffect(() => {
    if (assessDate) {
      const res = validateAssessmentTiming(assessDate, selectedMonth);
      setTimingResult(res);
    }
  }, [assessDate, selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation checks
    if (!academicYear || !academicYear.trim()) {
      setValidationError('يرجى إدخال العام الدراسي أولاً في القائمة الرئيسية (مثال: 2026/2027).');
      return;
    }

    if (!grade) {
      setValidationError('يرجى اختيار الصف الدراسي.');
      return;
    }

    if (!classNum || classNum < 1 || classNum > 15) {
      setValidationError('يرجى اختيار رقم الفصل بين 1 و 15.');
      return;
    }

    if (!assessDate) {
      setValidationError('يرجى تحديد تاريخ التقييم.');
      return;
    }
    
    // Friday validation
    const dateObj = new Date(assessDate);
    if (!isHoliday && dateObj.getDay() === 5) { // 5 is Friday
      setValidationError('لا يمكن تسجيل تقييم يوم الجمعة. يرجى تفعيل خيار تأجيل التقييم.');
      return;
    }

    if (isHoliday && !holidayDesc) {
      setValidationError('يرجى تحديد سبب تأجيل التقييم.');
      return;
    }

    const partialRecord: Partial<AssessmentRecord> = {
      teacher_id: teacherId,
      academic_year: academicYear.trim(),
      term_id: selectedTerm,
      month_id: selectedMonth.id,
      assess_num: assessNum,
      grade,
      class_num: classNum,
      assess_date: assessDate,
      notes: notes.trim(),
      timing_status: timingResult.isExceptional ? 'exceptional' : 'normal',
      timing_period: timingResult.period,
      model_form: isRandomDistribution ? 'عشوائي' : modelForm,
      is_holiday: isHoliday,
      holiday_desc: isHoliday ? holidayDesc : undefined
    };

    onSave(partialRecord, timingResult.isExceptional);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 relative my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="text-center mb-5">
          <h2 className="text-lg font-bold text-slate-800">
            تسجيل تقييم رقم {assessNum}
          </h2>
        </div>

        {/* Validation error notification banner */}
        {validationError && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-center">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1: Grade Selector */}
          <div>
            <div className="relative">
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-10 py-2.5 text-sm font-bold text-slate-800 focus:outline-none appearance-none"
              >
                <option value="" disabled>اختر الصف</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>الصف {g}</option>
                ))}
              </select>

              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Section 2: Class Number Selector */}
          <div>
            <div className="relative">
              <select
                value={classNum}
                onChange={(e) => setClassNum(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-10 py-2.5 text-sm font-bold text-slate-800 focus:outline-none appearance-none"
              >
                {Array.from({ length: CLASSES_COUNT }, (_, i) => i + 1).map((c) => (
                  <option key={c} value={c}>فصل {c}</option>
                ))}
              </select>

              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

                    {/* Form Model Strategy Banner */}
          <div className="bg-emerald-50 border border-dashed border-emerald-400 rounded-xl p-3 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-emerald-700">
              <BookOpen className="w-4 h-4" />
              <span className="font-bold text-xs">توزيع النماذج المقترح:</span>
            </div>
            
            <p className="text-sm font-bold text-emerald-800">
              {isRandomDistribution ? 'توزيع عشوائي للنماذج على الطلاب' : 
               modelForm === 'أ' ? '1-20 (أ) ، 21-35 (ب) ، الآخر (ج)' : 
               modelForm === 'ب' ? '1-20 (ب) ، 21-35 (ج) ، الآخر (أ)' : 
               '1-20 (ج) ، 21-35 (أ) ، الآخر (ب)'}
            </p>

            <label className="flex items-center justify-center gap-2 cursor-pointer text-sm font-bold text-emerald-700 hover:text-emerald-900 transition-colors pt-1">
              <input 
                type="checkbox" 
                checked={isRandomDistribution}
                onChange={(e) => setIsRandomDistribution(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600 border-emerald-300"
              />
              توزيع عشوائي
            </label>
          </div>

          {/* Date Input */}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-800 text-right">
              تاريخ التقييم:
            </label>
            <input
              type="date"
              required
              min={firstDay}
              max={lastDay}
              value={assessDate}
              onChange={(e) => setAssessDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500 text-sm font-bold text-slate-900 bg-white dir-ltr text-left"
            />
          </div>

          {/* Holiday/Absence Section */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isHoliday}
                onChange={(e) => {
                  setIsHoliday(e.target.checked);
                  if (!e.target.checked) setHolidayDesc('');
                }}
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 border-slate-300"
              />
              <span className="text-sm font-bold text-slate-700">تأجيل التقييم بسبب</span>
            </label>
            
            {isHoliday && (
              <div className="pl-6 animate-fadeIn">
                <select
                  value={holidayDesc}
                  onChange={(e) => setHolidayDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-rose-300"
                  required={isHoliday}
                >
                  <option value="" disabled>اختر السبب</option>
                  <option value="عطلة رسمية">عطلة رسمية</option>
                  <option value="إجازة الجمعة / السبت">إجازة الجمعة / السبت</option>
                  <option value="غياب معلم">غياب معلم</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
            )}
          </div>

          {/* Notes Field */}
          <div>
            <div className="relative">
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات (اختياري)..."
                className="w-full px-3 py-2.5 pl-12 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500 text-sm font-medium text-slate-800 bg-white resize-none"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute left-2 bottom-2 p-2 rounded-full transition-all ${
                  isListening 
                    ? 'bg-rose-100 text-rose-600 animate-pulse' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                }`}
                title="تسجيل صوتي"
              >
                {isListening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            {speechError && <p className="text-xs text-rose-500 font-bold mt-1 px-1">{speechError}</p>}
          </div>

          {/* Actions Footer */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>حفظ</span>
              <Save className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors"
            >
              إلغاء
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
