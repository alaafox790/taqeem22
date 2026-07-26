import React, { useState, useRef } from 'react';
import { Student, StudentAttendance, AssessmentRecord, TermId } from '../types';
import { 
  X, User, Upload, Calendar, FileText, Check, Minus, AlertTriangle, 
  ChevronRight, CheckCircle2, Camera, ChevronDown, ChevronUp, 
  TrendingDown, AlertOctagon, Activity, Sparkles, ShieldAlert, BellRing 
} from 'lucide-react';
import { getStoredStatusColors } from '../lib/statusColors';
import { MONTHS_DATA } from '../lib/constants';

interface StudentProfileDashboardProps {
  student: Student;
  attendance: StudentAttendance[];
  records: AssessmentRecord[];
  onClose: () => void;
  onUpdateStudent: (updated: Student) => void;
  onAddReminder?: (reminder: { title: string; description?: string; targetType: 'student' | 'class' | 'general'; targetName?: string; reminderDate: string; notifyStudents?: boolean }) => void;
}

export const StudentProfileDashboard: React.FC<StudentProfileDashboardProps> = ({
  student, attendance, records, onClose, onUpdateStudent, onAddReminder
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(student.photoUrl);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecentExpanded, setIsRecentExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusColors = getStoredStatusColors();

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert('تعذر الوصول إلى الكاميرا. يرجى التأكد من منح الصلاحيات.');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const base64String = canvasRef.current.toDataURL('image/jpeg');
        setPhotoUrl(base64String);
        onUpdateStudent({ ...student, photoUrl: base64String });
        stopCamera();
      }
    }
  };

  // Handle Photo Upload (Base64)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setPhotoUrl(base64String);
      onUpdateStudent({ ...student, photoUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  // Group attendance by term
  const term1Attendance = attendance.filter(a => MONTHS_DATA.some(m => m.termId === 'term1' && m.id === a.month_id));
  const term2Attendance = attendance.filter(a => MONTHS_DATA.some(m => m.termId === 'term2' && m.id === a.month_id));

  // Compute stats
  const totalPresent = attendance.filter(a => a.status === 'present').length;
  const totalAbsent = attendance.filter(a => a.status === 'absent').length;
  const totalExcused = attendance.filter(a => a.status === 'excused').length;
  const totalSessions = totalPresent + totalAbsent + totalExcused;
  const attendancePercentage = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 0;
  
  const ABSENCE_LIMIT = 3;
  const hasExceededAbsence = totalAbsent >= ABSENCE_LIMIT;

  // Analytics: 1. Detect Consecutive Absences (تقييمين متتاليين أو أكثر)
  const sortedByAssessNum = [...attendance].sort((a, b) => a.assess_num - b.assess_num);
  const consecutiveAbsenceGroups: number[][] = [];
  let currentGroup: number[] = [];

  sortedByAssessNum.forEach((record) => {
    if (record.status === 'absent') {
      currentGroup.push(record.assess_num);
    } else {
      if (currentGroup.length >= 2) {
        consecutiveAbsenceGroups.push([...currentGroup]);
      }
      currentGroup = [];
    }
  });
  if (currentGroup.length >= 2) {
    consecutiveAbsenceGroups.push([...currentGroup]);
  }

  const hasConsecutiveAbsence = consecutiveAbsenceGroups.length > 0;

  // Analytics: 2. Detect Participation / Attendance Drop (انخفاض مستوى المشاركة)
  let participationTrend = {
    hasDrop: false,
    earlyRate: 0,
    recentRate: 0,
    dropAmount: 0,
  };

  if (sortedByAssessNum.length >= 3) {
    const halfIndex = Math.floor(sortedByAssessNum.length / 2);
    const earlyRecords = sortedByAssessNum.slice(0, halfIndex);
    const recentRecords = sortedByAssessNum.slice(halfIndex);

    const earlyPresent = earlyRecords.filter((r) => r.status === 'present').length;
    const recentPresent = recentRecords.filter((r) => r.status === 'present').length;

    const earlyRate = Math.round((earlyPresent / (earlyRecords.length || 1)) * 100);
    const recentRate = Math.round((recentPresent / (recentRecords.length || 1)) * 100);
    const dropAmount = earlyRate - recentRate;

    if (dropAmount >= 20) {
      participationTrend = {
        hasDrop: true,
        earlyRate,
        recentRate,
        dropAmount,
      };
    }
  }

  React.useEffect(() => {
    if (hasExceededAbsence && onAddReminder) {
      const alertKey = `absence_alert_sent_${student.id}_${totalAbsent}`;
      if (!localStorage.getItem(alertKey)) {
        onAddReminder({
          title: `تنبيه تجاوز حد الغياب: ${student.name}`,
          description: `تجاوز الطالب ${student.name} الحد المسموح للغياب (${totalAbsent} أيام غياب). نسبة الحضور الحالية: ${attendancePercentage}%. الرجاء متابعة حالة الطالب.`,
          targetType: 'student',
          targetName: student.name,
          reminderDate: new Date().toISOString().split('T')[0],
          notifyStudents: false
        });
        localStorage.setItem(alertKey, 'true');
      }
    }

    if (hasConsecutiveAbsence && onAddReminder) {
      const consecutiveKey = `consecutive_alert_${student.id}_${consecutiveAbsenceGroups.flat().join('_')}`;
      if (!localStorage.getItem(consecutiveKey)) {
        onAddReminder({
          title: `تنبيه غياب متتالي: ${student.name}`,
          description: `سجل الطالب ${student.name} غياباً متتابعاً في التقييمات (${consecutiveAbsenceGroups.flat().join(' و ')}). يُوصى بالتواصل المباشر مع ولي الأمر.`,
          targetType: 'student',
          targetName: student.name,
          reminderDate: new Date().toISOString().split('T')[0],
          notifyStudents: false
        });
        localStorage.setItem(consecutiveKey, 'true');
      }
    }
  }, [hasExceededAbsence, hasConsecutiveAbsence, totalAbsent, student.id, student.name, attendancePercentage, onAddReminder, consecutiveAbsenceGroups]);

  const recentAssessments = [...attendance].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen max-w-full overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-3 sm:p-5 dir-rtl flex items-center justify-center min-h-full animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full max-w-4xl h-full sm:h-[90vh] max-h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative my-auto shrink-0">
        
        {/* Header (Minimal & Clean) */}
        <div className="bg-white border-b border-slate-200 px-5 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">الملف الشخصي للطالب</h2>
              <p className="text-xs text-slate-500">متابعة الأداء والحضور والبيانات الأساسية</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Top Section: Photo & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Profile Photo Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-4">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-slate-50 overflow-hidden shadow-md bg-slate-100 flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                
                <div className="absolute bottom-0 inset-x-0 flex justify-center gap-2 translate-y-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 bg-sky-600 hover:bg-sky-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer border-2 border-white"
                    title="تحميل صورة"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={startCamera}
                    className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer border-2 border-white"
                    title="التقاط صورة بالكاميرا"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{student.name}</h3>
                {student.studentNumber && (
                  <p className="text-xs font-bold text-sky-700 mb-1.5 font-mono">
                    رقم الطالب: {student.studentNumber}
                  </p>
                )}
                {student.parentPhone && (
                  <p className="text-xs font-medium text-slate-500 mb-1.5 font-mono">
                    هاتف ولي الأمر: {student.parentPhone}
                  </p>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  الفصل {student.class_num} - الصف {student.grade}
                </span>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center gap-2">
                <span className="text-xs font-bold text-slate-500">نسبة الحضور</span>
                <span className="text-2xl font-black text-sky-600">{attendancePercentage}%</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center gap-2">
                <span className="text-xs font-bold text-emerald-700">مرات الحضور</span>
                <span className="text-2xl font-black text-emerald-600">{totalPresent}</span>
              </div>
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-center gap-2">
                <span className="text-xs font-bold text-rose-700">مرات الغياب</span>
                <span className="text-2xl font-black text-rose-600">{totalAbsent}</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-center gap-2">
                <span className="text-xs font-bold text-amber-700">تأجيل بعذر</span>
                <span className="text-2xl font-black text-amber-600">{totalExcused}</span>
              </div>
            </div>
          </div>

          {/* Absence Alert Banner */}
          {hasExceededAbsence && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-4 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-800 mb-1">تنبيه تجاوز حد الغياب</h4>
                <p className="text-xs text-rose-600 leading-relaxed font-medium">
                  تجاوز هذا الطالب الحد المسموح به للغياب ({ABSENCE_LIMIT} أيام). إجمالي الغياب الحالي هو <span className="font-bold">{totalAbsent}</span> أيام. تم إرسال تنبيه تلقائي للمعلم في قائمة التنبيهات.
                </p>
              </div>
            </div>
          )}

          {/* Smart Attendance Analytics & Trend Alerts */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-900/50 space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-indigo-800/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <span>تحليلات الحضور ومؤشرات الالتزام</span>
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  </h3>
                  <p className="text-xs text-indigo-200/80 font-medium">مقارنة تلقائية لأداء الطالب وتتبع نمط الغياب</p>
                </div>
              </div>

              {/* Quick Action Button */}
              {onAddReminder && (hasConsecutiveAbsence || participationTrend.hasDrop || hasExceededAbsence) && (
                <button
                  onClick={() => {
                    onAddReminder({
                      title: `متابعة الطالب ${student.name}`,
                      description: `متابعة خاصة بالطالب ${student.name} بسبب ملاحظات الحضور والمشاركة.`,
                      targetType: 'student',
                      targetName: student.name,
                      reminderDate: new Date().toISOString().split('T')[0],
                      notifyStudents: false
                    });
                    alert(`تم إضافة تذكير لمتابعة الطالب ${student.name} بنجاح.`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">جدولة تذكير للمعلم</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Alert 1: Consecutive Absences */}
              <div className={`p-4 rounded-2xl border transition-all ${
                hasConsecutiveAbsence 
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-100 shadow-md shadow-rose-950/40' 
                  : 'bg-indigo-900/30 border-indigo-800/40 text-indigo-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    hasConsecutiveAbsence ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {hasConsecutiveAbsence ? <AlertOctagon className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold mb-1 flex items-center gap-1.5">
                      <span>الغياب المتتالي (تقييمين متتاليين أو أكثر)</span>
                    </h4>
                    {hasConsecutiveAbsence ? (
                      <p className="text-[11px] leading-relaxed text-rose-200 font-medium">
                        🚨 <strong className="text-white font-black">تنبيه خطر:</strong> سجل الطالب غياباً متتابعاً في التقييمات{' '}
                        <span className="font-mono font-bold bg-rose-900/80 px-1.5 py-0.5 rounded text-white">
                          ({consecutiveAbsenceGroups.map(g => g.join(' و ')).join('، ')})
                        </span>. ينصح بالتواصل مع ولي الأمر فوراً.
                      </p>
                    ) : (
                      <p className="text-[11px] leading-relaxed text-indigo-300 font-medium">
                        ✅ لا يوجد أي غياب متتالي أو متتابع في التقييمات المسجلة حتى الآن.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Alert 2: Participation Drop Trend */}
              <div className={`p-4 rounded-2xl border transition-all ${
                participationTrend.hasDrop 
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-100 shadow-md shadow-amber-950/40' 
                  : 'bg-indigo-900/30 border-indigo-800/40 text-indigo-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    participationTrend.hasDrop ? 'bg-amber-500 text-white' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {participationTrend.hasDrop ? <TrendingDown className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold mb-1 flex items-center gap-1.5">
                      <span>مؤشر تغير مستوى المشاركة والالتزام</span>
                    </h4>
                    {participationTrend.hasDrop ? (
                      <p className="text-[11px] leading-relaxed text-amber-200 font-medium">
                        📉 <strong className="text-white font-black">تنبيه انخفاض المشاركة:</strong> انخفضت نسبة حضور الطالب من{' '}
                        <span className="font-bold text-emerald-300">{participationTrend.earlyRate}%</span> في التقييمات الأولى إلى{' '}
                        <span className="font-bold text-rose-300">{participationTrend.recentRate}%</span> في التقييمات الأخيرة (انخفاض قدره {participationTrend.dropAmount}%).
                      </p>
                    ) : (
                      <p className="text-[11px] leading-relaxed text-indigo-300 font-medium">
                        ✨ مستوى المشاركة والحضور مستقر أو متصاعد بشكل جيد بين التقييمات السابقة والحديثة.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent 5 Assessments (Expandable) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setIsRecentExpanded(!isRecentExpanded)}
              className="w-full p-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-sky-500" />
                آخر 5 تقييمات للطالب
              </h3>
              {isRecentExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {isRecentExpanded && (
              <div className="p-4 border-t border-slate-100 bg-white space-y-2">
                {recentAssessments.length > 0 ? (
                  recentAssessments.map(att => (
                    <AttendanceRow key={`recent_${att.id}`} att={att} statusColors={statusColors} />
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-400 text-xs font-bold">لا يوجد تقييمات حديثة</div>
                )}
              </div>
            )}
          </div>

          {/* Detailed Attendance History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                سجل التقييمات والحضور
              </h3>
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Term 1 */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 mb-3 px-2">الفصل الدراسي الأول</h4>
                {term1Attendance.length > 0 ? (
                  <div className="space-y-2">
                    {term1Attendance.sort((a,b) => a.assess_num - b.assess_num).map(att => (
                      <AttendanceRow key={att.id} att={att} statusColors={statusColors} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs font-bold">
                    لا يوجد سجلات تقييم
                  </div>
                )}
              </div>
              
              {/* Term 2 */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 mb-3 px-2">الفصل الدراسي الثاني</h4>
                {term2Attendance.length > 0 ? (
                  <div className="space-y-2">
                    {term2Attendance.sort((a,b) => a.assess_num - b.assess_num).map(att => (
                      <AttendanceRow key={att.id} att={att} statusColors={statusColors} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs font-bold">
                    لا يوجد سجلات تقييم
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Camera Overlay */}
        {isCameraOpen && (
          <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl bg-black border border-slate-700">
              <video ref={videoRef} className="w-full h-auto aspect-[3/4] object-cover" autoPlay playsInline />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-6">
                <button
                  onClick={stopCamera}
                  className="w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center backdrop-blur-sm transition-all"
                  title="إلغاء"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full border-4 border-white bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 active:scale-95"
                  title="التقاط الصورة"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AttendanceRow: React.FC<{ att: StudentAttendance, statusColors: any }> = ({ att, statusColors }) => {
  const monthInfo = MONTHS_DATA.find(m => m.id === att.month_id);
  
  let icon = <Minus className="w-3.5 h-3.5 text-slate-400" />;
  let colorClass = "bg-slate-100 text-slate-600";
  let statusText = "غير محدد";
  
  if (att.status === 'present') {
    icon = <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />;
    colorClass = "bg-emerald-500 text-white";
    statusText = "حاضر / مقيّم";
  } else if (att.status === 'absent') {
    icon = <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />;
    colorClass = "bg-rose-500 text-white";
    statusText = "غائب";
  } else if (att.status === 'excused') {
    icon = <Minus className="w-3.5 h-3.5 text-white" strokeWidth={3} />;
    colorClass = "bg-amber-500 text-white";
    statusText = "تأجيل بعذر";
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors bg-white shadow-xs">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${colorClass}`}>
          {icon}
        </div>
        <div>
          <h5 className="text-xs font-bold text-slate-800">التقييم رقم {att.assess_num}</h5>
          <span className="text-[10px] text-slate-500">{monthInfo?.name} • {new Date(att.updated_at).toLocaleDateString('ar-EG')}</span>
        </div>
      </div>
      <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
        att.status === 'present' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
        att.status === 'absent' ? 'bg-rose-50 border-rose-100 text-rose-700' :
        'bg-amber-50 border-amber-100 text-amber-700'
      }`}>
        {statusText}
      </div>
    </div>
  );
}
