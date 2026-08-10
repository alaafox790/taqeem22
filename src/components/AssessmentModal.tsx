import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle, Save, Sparkles, CheckCircle2, Layers, BookOpen, Clock, FileText, Mic, MicOff, Loader2, Zap, Trash2, RotateCcw } from 'lucide-react';
import { MonthInfo, AssessmentRecord, TermId, TeacherProfile } from '../types';
import { GRADES, CLASSES_COUNT, getFormModel, getFormDescription } from '../lib/constants';
import { validateAssessmentTiming, checkOfficialHoliday } from '../lib/validation';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessNum: number;
  selectedMonth: MonthInfo;
  academicYear: string;
  selectedTerm: TermId;
  teacherId: string;
  teacher?: TeacherProfile;
  records?: AssessmentRecord[];
  onSave: (recordData: Partial<AssessmentRecord>, isExceptionalConfirmed?: boolean, keepOpen?: boolean) => void;
  onDeleteAssessmentForClass?: (grade: string, classNum: number, assessNum: number) => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  assessNum,
  selectedMonth,
  academicYear,
  selectedTerm,
  teacherId,
  teacher,
  records,
  onSave,
  onDeleteAssessmentForClass,
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

  const sameClassRecords = records?.filter(
    (r) =>
      r.grade === grade &&
      r.class_num === classNum &&
      r.term_id === selectedTerm
  );

  const existingRecord = sameClassRecords?.find(
    (r) => r.assess_num === assessNum
  );

  const sameDateOtherRecord = sameClassRecords?.find(
    (r) => r.assess_num !== assessNum && r.assess_date === assessDate
  );

  useEffect(() => {
    if (existingRecord) {
      if (existingRecord.assess_date) setAssessDate(existingRecord.assess_date);
      if (existingRecord.notes) setNotes(existingRecord.notes);
    }
  }, [existingRecord?.id]);

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

  // Check if date is within selected month bounds
  const isDateWithinCurrentMonth = (() => {
    if (!assessDate) return false;
    const dateObj = new Date(assessDate);
    if (isNaN(dateObj.getTime())) return false;
    const selectedMonthNum = dateObj.getMonth() + 1;
    return selectedMonthNum === selectedMonth.monthNumber && assessDate >= firstDay && assessDate <= lastDay;
  })();

  // Check official holiday based on teacher profile data
  const officialHolidayCheck = checkOfficialHoliday(assessDate, teacher?.officialHolidays);

  const handleSubmit = (e: React.FormEvent, keepOpen: boolean = false) => {
    if (e.preventDefault) e.preventDefault();
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

    if (!isDateWithinCurrentMonth) {
      setValidationError(
        `تاريخ التقييم المختار (${assessDate}) لا ينتمي للشهر الدراسي الحالي (${selectedMonth.name}). يرجى اختيار تاريخ محصور بين ${firstDay} و ${lastDay}.`
      );
      return;
    }

    if (officialHolidayCheck.isHoliday && !isHoliday) {
      setValidationError(
        `التاريخ المختار (${assessDate}) يوافق (${officialHolidayCheck.reason}). يرجى تفعيل خيار "تأجيل التقييم" وتحديد السبب.`
      );
      return;
    }

    if (isHoliday && !holidayDesc) {
      setValidationError('يرجى تحديد سبب تأجيل التقييم.');
      return;
    }

    if (sameDateOtherRecord) {
      setValidationError(
        `لا يجوز تسجيل أكثر من تقييم لنفس الفصل في نفس التاريخ. التقييم رقم (${sameDateOtherRecord.assess_num}) مسجل بالفعل للصف ${grade} فصل ${classNum} بتاريخ ${assessDate}.`
      );
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

    onSave(partialRecord, timingResult.isExceptional, keepOpen);

    if (keepOpen) {
      if (classNum < CLASSES_COUNT) {
        setClassNum(classNum + 1);
      } else {
        setClassNum(1);
        const gradeIndex = GRADES.indexOf(grade);
        if (gradeIndex >= 0 && gradeIndex < GRADES.length - 1) {
          setGrade(GRADES[gradeIndex + 1]);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen max-w-full overflow-y-auto bg-black/60 backdrop-blur-md p-3 sm:p-4 dir-rtl flex items-center justify-center min-h-full">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-slate-800 transition-all relative my-auto shadow-2xl animate-in fade-in zoom-in duration-200 shrink-0">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-black text-slate-800">
            تسجيل تقييم رقم {assessNum}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full transition-colors hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
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

          {/* Existing Record Warning & Delete/Undo Button */}
          {existingRecord && (
            <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-3.5 space-y-2.5 animate-fadeIn shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  تم تسجيل هذا التقييم مسبقاً لهذا الفصل
                </span>
                <span className="bg-amber-100/90 text-amber-900 px-2 py-0.5 rounded-md text-[11px] font-mono dir-ltr">
                  {existingRecord.assess_date}
                </span>
              </div>
              <p className="text-[11px] text-amber-800 font-medium leading-normal">
                إذا كنت ترغب في حذف وتفريغ هذا التقييم للصف {grade} فصل {classNum}، يمكنك الضغط على زر التراجع أدناه:
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`هل أنت متأكد من حذف والتراجع عن تسجيل التقييم ${assessNum} للصف ${grade} فصل ${classNum}؟`)) {
                    onDeleteAssessmentForClass?.(grade, classNum, assessNum);
                    onClose();
                  }
                }}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف والتراجع عن تقييم هذا الفصل</span>
              </button>
            </div>
          )}

          {/* Same Date Duplicate Warning Banner */}
          {sameDateOtherRecord && (
            <div className="bg-rose-50 border border-rose-300/80 rounded-2xl p-3.5 space-y-2 animate-fadeIn shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>تنبيه: تاريخ مكرر لنفس الفصل ({grade} / {classNum})</span>
              </div>
              <p className="text-[11px] text-rose-800 font-medium leading-normal">
                تم تسجيل (التقييم رقم {sameDateOtherRecord.assess_num}) لهذا الفصل بنفس التاريخ (<span className="font-bold underline dir-ltr">{assessDate}</span>). غير جائز منطقياً إدراج 3 تقييمات أو أكثر لنفس الفصل في يوم واحد! يرجى اختيار تاريخ مختلف.
              </p>
            </div>
          )}

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

          {/* Section: Assessment Date Field */}
          <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-600" />
                <span>تاريخ التقييم:</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                ({selectedMonth.name})
              </span>
            </div>

            <input
              type="date"
              required
              min={firstDay}
              max={lastDay}
              value={assessDate}
              onChange={(e) => {
                const newDate = e.target.value;
                setAssessDate(newDate);
                setValidationError(null);

                // Auto-suggest holiday if selected date is an official holiday
                const check = checkOfficialHoliday(newDate, teacher?.officialHolidays);
                if (check.isHoliday && !isHoliday) {
                  setIsHoliday(true);
                  setHolidayDesc('عطلة رسمية');
                }
              }}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm font-bold text-slate-900 bg-white dir-ltr text-left transition-all ${
                !isDateWithinCurrentMonth
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-300'
                  : officialHolidayCheck.isHoliday
                  ? 'border-amber-400 focus:ring-2 focus:ring-amber-300'
                  : 'border-slate-200 focus:border-cyan-500'
              }`}
            />

            {/* Range Banner */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-0.5 dir-rtl">
              <span>نطاق الشهر الدراسي:</span>
              <span className="dir-ltr text-slate-700 font-mono bg-slate-200/60 px-1.5 py-0.5 rounded">
                {firstDay} ➔ {lastDay}
              </span>
            </div>

            {/* Out of Month Warning Alert */}
            {!isDateWithinCurrentMonth && assessDate && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-start gap-2 animate-fadeIn mt-1">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-rose-900">تنبيه: خارج حدود الشهر الحالي!</p>
                  <p className="text-[11px] font-medium text-rose-700 leading-tight mt-0.5">
                    التاريخ المختار (<span className="dir-ltr font-mono">{assessDate}</span>) لا ينتمي لشهر {selectedMonth.name}. يجب اختيار تاريخ بين <span className="dir-ltr font-mono">{firstDay}</span> و <span className="dir-ltr font-mono">{lastDay}</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Official Holiday Warning Alert */}
            {officialHolidayCheck.isHoliday && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-start gap-2 animate-fadeIn mt-1">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-black text-amber-950">تنبيه: تاريخ يوافق عطلة رسمية</p>
                  <p className="text-[11px] font-medium text-amber-800 leading-tight">
                    التاريخ المختار يوافق: <span className="font-bold underline">{officialHolidayCheck.reason}</span>.
                  </p>
                  {!isHoliday && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsHoliday(true);
                        setHolidayDesc('عطلة رسمية');
                      }}
                      className="mt-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1"
                    >
                      <span>تأجيل التقييم لهذا السبب</span>
                    </button>
                  )}
                </div>
              </div>
            )}
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
            {!notes && !isHoliday && !existingRecord && !sameDateOtherRecord && !validationError && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                title="تسريع عملية تسجيل التقييمات المتكررة للفصول الأخرى"
              >
                <span>حفظ سريع (ومتابعة التسجيل)</span>
                <Zap className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              onClick={(e) => handleSubmit(e, false)}
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
