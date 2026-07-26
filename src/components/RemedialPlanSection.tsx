import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Plus, 
  UserCheck, 
  Calendar, 
  FileText, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Bell, 
  Trash2, 
  Sparkles,
  Check,
  User,
  Activity,
  Edit3,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Square
} from 'lucide-react';
import { Student, StudentAttendance, RemedialPlan, RemedialReason, TeacherProfile, TermId, AssessmentRecord } from '../types';
import { RemedialPlanPrintModal } from './RemedialPlanPrintModal';

interface RemedialPlanSectionProps {
  records: AssessmentRecord[];
  selectedTerm: TermId;
  teacher: TeacherProfile;
  onAddReminder?: (reminder: { title: string; description?: string; targetType: 'student' | 'class' | 'general'; targetName?: string; reminderDate: string }) => void;
}

const REMEDIAL_PLANS_STORAGE_KEY = 'school_assessments_remedial_plans_v1';

export const RemedialPlanSection: React.FC<RemedialPlanSectionProps> = ({
  records,
  selectedTerm,
  teacher,
  onAddReminder
}) => {
  // Local storage state for customized plans
  const [savedPlans, setSavedPlans] = useState<Record<string, RemedialPlan>>(() => {
    try {
      const saved = localStorage.getItem(REMEDIAL_PLANS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Failed to parse saved remedial plans:', e);
      return {};
    }
  });

  // Filter & Search states
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Print modal states
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printPlan, setPrintPlan] = useState<RemedialPlan | null>(null);

  // Manual Add Student modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [manualStudentId, setManualStudentId] = useState<string>('');

  // Expanded card state
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Web Speech API Voice Synthesis States
  const [speakingPlanId, setSpeakingPlanId] = useState<string | null>(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState<boolean>(false);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = (p: RemedialPlan) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('خاصية القراءة الصوتية غير مدعومة في هذا المتصفح');
      return;
    }

    const synth = window.speechSynthesis;

    if (speakingPlanId === p.id) {
      if (synth.speaking && !synth.paused) {
        synth.pause();
        setIsSpeechPaused(true);
      } else if (synth.paused) {
        synth.resume();
        setIsSpeechPaused(false);
      } else {
        synth.cancel();
        setSpeakingPlanId(null);
        setIsSpeechPaused(false);
      }
      return;
    }

    // Stop any existing speech
    synth.cancel();

    const reasonsText = p.reasons.map(r => {
      if (r === 'frequent_absence') return 'غياب متكرر وتجاوز حد الغياب المسموح';
      if (r === 'consecutive_absence') return 'غياب متتابع في أيام التقييم المستمر';
      if (r === 'low_performance') return 'انخفاض مستوى المشاركة الحضور والتقييمات';
      return 'توصية خاصة من معلم المادة';
    }).join('، و ');

    const textReport = `تقرير حالة الطالب: ${p.studentName}. الصف ${p.grade} فصل ${p.class_num}. عدد أيام الغياب المرصودة: ${p.absenceCount} أيام. نسبة الحضور التراكمية: ${p.attendanceRate} بالمائة. تشخيص الحالة: ${reasonsText}. مجال التعثر والهدف العلاجي: ${p.targetArea}. الهدف المتوقع: ${p.expectedOutcome}. ملاحظات المعلم: ${p.teacherNotes || 'لا توجد ملاحظات إضافية'}.`;

    const utterance = new SpeechSynthesisUtterance(textReport);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;

    // Pick best Arabic voice if available
    const voices = synth.getVoices();
    const arVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arVoice) {
      utterance.voice = arVoice;
    }

    utterance.onend = () => {
      setSpeakingPlanId(null);
      setIsSpeechPaused(false);
    };

    utterance.onerror = () => {
      setSpeakingPlanId(null);
      setIsSpeechPaused(false);
    };

    setSpeakingPlanId(p.id);
    setIsSpeechPaused(false);
    synth.speak(utterance);
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingPlanId(null);
      setIsSpeechPaused(false);
    }
  };

  // Read Students and Attendance from localStorage
  const { students, attendance } = useMemo(() => {
    let stList: Student[] = [];
    let attList: StudentAttendance[] = [];
    try {
      stList = JSON.parse(localStorage.getItem('school_assessments_students_roster_v1') || '[]');
      attList = JSON.parse(localStorage.getItem('school_assessments_attendance_v1') || '[]');
    } catch (e) {
      console.error(e);
    }
    return { students: stList, attendance: attList };
  }, [records, selectedTerm]);

  // Available unique classes list
  const uniqueClasses = useMemo(() => {
    const classSet = new Set<string>();
    students.forEach(s => classSet.add(`الصف ${s.grade} - فصل ${s.class_num}`));
    return Array.from(classSet);
  }, [students]);

  // Compute all automatic & manually saved remedial plans
  const computedPlans = useMemo(() => {
    const planList: RemedialPlan[] = [];

    students.forEach(student => {
      // Find student attendance records
      const studentAtt = attendance.filter(a => a.student_id === student.id);
      
      const totalPresent = studentAtt.filter(a => a.status === 'present').length;
      const totalAbsent = studentAtt.filter(a => a.status === 'absent').length;
      const totalExcused = studentAtt.filter(a => a.status === 'excused').length;
      const totalSessions = totalPresent + totalAbsent + totalExcused;

      const attendanceRate = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 100;

      // Calculate consecutive absences
      const sortedAtt = [...studentAtt].sort((a, b) => a.assess_num - b.assess_num);
      let maxConsecutive = 0;
      let currentConsecutive = 0;
      sortedAtt.forEach(a => {
        if (a.status === 'absent') {
          currentConsecutive++;
          if (currentConsecutive > maxConsecutive) maxConsecutive = currentConsecutive;
        } else {
          currentConsecutive = 0;
        }
      });

      // Detect reasons
      const reasons: RemedialReason[] = [];
      if (totalAbsent >= 3 || (totalSessions >= 3 && attendanceRate < 75)) {
        reasons.push('frequent_absence');
      }
      if (maxConsecutive >= 2) {
        reasons.push('consecutive_absence');
      }
      if (totalAbsent > 0 && attendanceRate < 80) {
        reasons.push('low_performance');
      }

      // Check if saved plan exists for this student
      const saved = savedPlans[student.id];

      if (saved) {
        // Use saved plan with updated metrics
        planList.push({
          ...saved,
          absenceCount: totalAbsent,
          consecutiveAbsences: maxConsecutive,
          attendanceRate
        });
      } else if (reasons.length > 0) {
        // Create automatic plan draft
        const defaultTarget = reasons.includes('frequent_absence') || reasons.includes('consecutive_absence')
          ? 'تكرار الغياب والانقطاع عن التقييمات المستمرة'
          : 'انخفاض معدل الحضور والتقييمات التراكمية';

        const defaultOutcome = 'رفع نسبة الحضور إلى 90% فأكثر واجتياز كافة التقييمات التعويضية بنجاح.';

        const defaultSteps = [
          { id: '1', title: 'تواصل مباشر مع ولي الأمر وإبلاغه بسجل الغياب والتقييمات', isCompleted: false },
          { id: '2', title: 'إعداد جدول تعويضي لإعادة التقييمات والاختبارات الفائتة', isCompleted: false },
          { id: '3', title: 'تحويل الطالب للمرشد الطلابي / الأخصائي الاجتماعي لبحث الأسباب', isCompleted: false },
          { id: '4', title: 'توفير تدريبات وأوراق عمل علاجية للمفاهيم التراكمية الأساسية', isCompleted: false },
          { id: '5', title: 'متابعة أسبوعية مستمرة وتقديم تقرير تحسّن مستوى الطالب', isCompleted: false }
        ];

        planList.push({
          id: `plan_${student.id}`,
          studentId: student.id,
          studentName: student.name,
          grade: student.grade,
          class_num: student.class_num,
          reasons,
          absenceCount: totalAbsent,
          consecutiveAbsences: maxConsecutive,
          attendanceRate,
          targetArea: defaultTarget,
          expectedOutcome: defaultOutcome,
          status: 'pending',
          actionSteps: defaultSteps,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });

    return planList;
  }, [students, attendance, savedPlans]);

  // Save changes to local storage
  const handleUpdatePlan = (updatedPlan: RemedialPlan) => {
    const updatedDict = { ...savedPlans, [updatedPlan.studentId]: updatedPlan };
    setSavedPlans(updatedDict);
    localStorage.setItem(REMEDIAL_PLANS_STORAGE_KEY, JSON.stringify(updatedDict));
  };

  // Toggle step completion inside a plan
  const handleToggleStep = (planItem: RemedialPlan, stepId: string) => {
    const updatedSteps = planItem.actionSteps.map(s => 
      s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s
    );

    const allDone = updatedSteps.every(s => s.isCompleted);
    const anyDone = updatedSteps.some(s => s.isCompleted);

    const newStatus = allDone ? 'completed' : anyDone ? 'in_progress' : 'pending';

    handleUpdatePlan({
      ...planItem,
      actionSteps: updatedSteps,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  };

  // Status Change
  const handleStatusChange = (planItem: RemedialPlan, newStatus: 'pending' | 'in_progress' | 'completed') => {
    handleUpdatePlan({
      ...planItem,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  };

  // Manual add student to plans
  const handleAddManualStudent = () => {
    if (!manualStudentId) return;
    const st = students.find(s => s.id === manualStudentId);
    if (!st) return;

    const studentAtt = attendance.filter(a => a.student_id === st.id);
    const totalAbsent = studentAtt.filter(a => a.status === 'absent').length;

    const newPlan: RemedialPlan = {
      id: `plan_${st.id}`,
      studentId: st.id,
      studentName: st.name,
      grade: st.grade,
      class_num: st.class_num,
      reasons: ['manual_flag'],
      absenceCount: totalAbsent,
      consecutiveAbsences: 0,
      attendanceRate: 100,
      targetArea: 'متابعة ورعاية خاصة بطلب من معلم المادة',
      expectedOutcome: 'تحسين الأداء العام ورفع الكفاءة التعليمية للطلاب.',
      status: 'pending',
      actionSteps: [
        { id: '1', title: 'تواصل مباشر مع ولي الأمر وإبلاغه بالبرنامج العلاجي', isCompleted: false },
        { id: '2', title: 'تقديم أنشطة إثرائية وتقوية فردية في المفاهيم الأساسية', isCompleted: false },
        { id: '3', title: 'متابعة أسبوعية لمدى الالتزام وتحسن النتاجات التعليمية', isCompleted: false }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    handleUpdatePlan(newPlan);
    setIsAddModalOpen(false);
    setManualStudentId('');
  };

  // Schedule Reminder for Teacher
  const handleScheduleReminder = (planItem: RemedialPlan) => {
    if (!onAddReminder) return;

    onAddReminder({
      title: `متابعة الخطة العلاجية: ${planItem.studentName}`,
      description: `تذكير بمتابعة الخطوات التنفيذية للخطة العلاجية للطالب ${planItem.studentName} (الصف ${planItem.grade} / فصل ${planItem.class_num}). نسبة الحضور: ${planItem.attendanceRate}%.`,
      targetType: 'student',
      targetName: planItem.studentName,
      reminderDate: new Date().toISOString().split('T')[0]
    });
  };

  // Filtered plans list
  const filteredPlans = useMemo(() => {
    return computedPlans.filter(p => {
      // Class Filter
      if (selectedClassFilter !== 'all') {
        const clsName = `الصف ${p.grade} - فصل ${p.class_num}`;
        if (clsName !== selectedClassFilter) return false;
      }

      // Reason / Status Filter
      if (reasonFilter === 'frequent_absence' && !p.reasons.includes('frequent_absence')) return false;
      if (reasonFilter === 'consecutive_absence' && !p.reasons.includes('consecutive_absence')) return false;
      if (reasonFilter === 'low_performance' && !p.reasons.includes('low_performance')) return false;
      if (reasonFilter === 'completed' && p.status !== 'completed') return false;
      if (reasonFilter === 'pending' && p.status === 'completed') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return p.studentName.toLowerCase().includes(q) || String(p.class_num).includes(q) || p.grade.includes(q);
      }

      return true;
    });
  }, [computedPlans, selectedClassFilter, reasonFilter, searchQuery]);

  // Overall statistics for remedial plans
  const totalNeedingPlans = computedPlans.length;
  const frequentAbsenceCount = computedPlans.filter(p => p.reasons.includes('frequent_absence')).length;
  const consecutiveAbsenceCount = computedPlans.filter(p => p.reasons.includes('consecutive_absence')).length;
  const completedPlansCount = computedPlans.filter(p => p.status === 'completed').length;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 w-full space-y-6">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300/40 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
              <span>تحليل الأداء التراكمي والخطط العلاجية</span>
              <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {totalNeedingPlans} طالب يتطلب التدخل
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              رصد تلقائي للطلاب مكرري الغياب والمنخفضة تقييماتهم مع خطوات علاجية قابلة للطباعة والاعتماد.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setPrintPlan(null);
              setIsPrintModalOpen(true);
            }}
            disabled={filteredPlans.length === 0}
            className="disabled:opacity-50 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كشف جميع الخطط ({filteredPlans.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة طالب يدوياً</span>
          </button>
        </div>
      </div>

      {/* Active Speech Synthesis Player Banner */}
      {speakingPlanId && (() => {
        const currentSpeakingPlan = computedPlans.find(p => p.id === speakingPlanId);
        return (
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-lg border border-indigo-500/30 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0 animate-pulse">
                <Volume2 className="w-5 h-5 text-indigo-200" />
              </div>
              <div className="truncate">
                <p className="text-xs font-black text-indigo-200 flex items-center gap-1.5">
                  <span>جاري القراءة الصوتية لتقرير الطالب (Web Speech API)</span>
                  <span className="bg-indigo-400/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {isSpeechPaused ? 'موقوف مؤقتاً' : 'قيد النطق 🔊'}
                  </span>
                </p>
                <p className="text-sm font-bold text-white truncate mt-0.5">
                  {currentSpeakingPlan?.studentName} - الصف {currentSpeakingPlan?.grade} (فصل {currentSpeakingPlan?.class_num})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentSpeakingPlan && (
                <button
                  type="button"
                  onClick={() => handleToggleSpeech(currentSpeakingPlan)}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  {isSpeechPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                  <span className="hidden sm:inline">{isSpeechPaused ? 'استئناف' : 'إيقاف مؤقت'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleStopSpeech}
                className="bg-rose-500/80 hover:bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>إغلاق ⏹️</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Total Requiring Plan */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-800">إجمالي الحالات المكتشفة</p>
            <h3 className="text-2xl font-black text-amber-950 mt-0.5">{totalNeedingPlans}</h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center font-bold text-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Frequent Absence */}
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-rose-800">تكرار وتجاوز الغياب</p>
            <h3 className="text-2xl font-black text-rose-950 mt-0.5">{frequentAbsenceCount}</h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-200/80 text-rose-800 flex items-center justify-center font-bold text-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Consecutive Absence */}
        <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-purple-800">غياب متتابع بالتقييمات</p>
            <h3 className="text-2xl font-black text-purple-950 mt-0.5">{consecutiveAbsenceCount}</h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-200/80 text-purple-800 flex items-center justify-center font-bold text-xs">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Completed Plans */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-800">الخطط المكتملة الإنجاز</p>
            <h3 className="text-2xl font-black text-emerald-950 mt-0.5">{completedPlansCount}</h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-200/80 text-emerald-800 flex items-center justify-center font-bold text-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        
        {/* Class Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="w-full sm:w-48 bg-white border border-slate-300 text-slate-800 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            <option value="all">جميع الفصول ({students.length} طالب)</option>
            {uniqueClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        {/* Reason / Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'الجميع' },
            { id: 'frequent_absence', label: '🚨 غياب متكرر' },
            { id: 'consecutive_absence', label: '⚠️ غياب متتابع' },
            { id: 'low_performance', label: '📉 أداء منخفض' },
            { id: 'completed', label: '✅ مكتملة' },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setReasonFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                reasonFilter === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-60">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الطالب..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* Plans List */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-700 text-base">لا توجد حالات متعثرة أو مكررة الغياب مطابقة للفلتر</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            جميع الطلاب ملتزمون بنسب الحضور والتقييمات، أو يمكنك استخدام زر "إضافة طالب يدوياً" لإعداد خطة علاجية مخصصة.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlans.map(p => {
            const isExpanded = expandedPlanId === p.id;
            const completedStepsCount = p.actionSteps.filter(s => s.isCompleted).length;
            const stepsProgressPercent = Math.round((completedStepsCount / p.actionSteps.length) * 100) || 0;

            return (
              <div 
                key={p.id}
                className={`bg-white border rounded-2xl transition-all shadow-xs overflow-hidden ${
                  p.status === 'completed'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : p.reasons.includes('frequent_absence')
                    ? 'border-rose-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Main Card Summary Bar */}
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      p.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-slate-800 text-base">{p.studentName}</h3>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                          الصف {p.grade} - فصل {p.class_num}
                        </span>

                        {/* Reason Badges */}
                        {p.reasons.includes('frequent_absence') && (
                          <span className="text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span>🚨 غياب متكرر ({p.absenceCount} أيام)</span>
                          </span>
                        )}
                        {p.reasons.includes('consecutive_absence') && (
                          <span className="text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 rounded-md">
                            ⚠️ غياب متتابع ({p.consecutiveAbsences} تقييمات)
                          </span>
                        )}
                        {p.reasons.includes('low_performance') && (
                          <span className="text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
                            📉 نسبة الحضور: {p.attendanceRate}%
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-bold mt-1">
                        مجال التعثر: <span className="text-slate-800">{p.targetArea}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Side Stats & Actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    
                    {/* Progress Bar Badge */}
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end text-[11px] font-bold text-slate-600">
                        <span>إنجاز الإجراءات:</span>
                        <span className="text-indigo-600 font-black">{completedStepsCount}/{p.actionSteps.length}</span>
                      </div>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden mt-1 border border-slate-200">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300" 
                          style={{ width: `${stepsProgressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Web Speech API Read Aloud Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleSpeech(p)}
                      className={`font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                        speakingPlanId === p.id
                          ? isSpeechPaused
                            ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                            : 'bg-rose-600 hover:bg-rose-700 text-white animate-bounce'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                      title="قراءة تقرير الحالة والتوصيات العلاجية بصوت مسموع (Web Speech API)"
                    >
                      {speakingPlanId === p.id ? (
                        isSpeechPaused ? (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>استئناف القراءة ⏸️</span>
                          </>
                        ) : (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>إيقاف الصوت 🔊</span>
                          </>
                        )
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>قراءة التقرير صوتياً 🔊</span>
                        </>
                      )}
                    </button>

                    {/* Print Individual Plan Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setPrintPlan(p);
                        setIsPrintModalOpen(true);
                      }}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                      title="طباعة الخطة العلاجية الفردية للطالب"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-600" />
                      <span>طباعة الخطة 🖨️</span>
                    </button>

                    {/* Expand Details Toggle */}
                    <button
                      type="button"
                      onClick={() => setExpandedPlanId(isExpanded ? null : p.id)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'إغلاق' : 'التفاصيل والإجراءات'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="bg-slate-50/80 p-4 sm:p-5 border-t border-slate-200 space-y-4 animate-in fade-in">
                    
                    {/* Status & Reminder Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">حالة تنفيذ الخطة العلاجية:</span>
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusChange(p, e.target.value as any)}
                          className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value="pending">⏳ قيد الانتظار</option>
                          <option value="in_progress">⚙️ قيد التنفيذ والمتابعة</option>
                          <option value="completed">✅ مكتملة بنجاح</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleScheduleReminder(p)}
                        className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>جدولة تذكير بمتابعة الطالب 🔔</span>
                      </button>
                    </div>

                    {/* Action Steps Checklist */}
                    <div className="space-y-2">
                      <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>الخطوات الإجرائية والتنفيذية (قم بالتعليم عند الإنجاز):</span>
                      </h4>

                      <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                        {p.actionSteps.map((step) => (
                          <label 
                            key={step.id}
                            className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              step.isCompleted 
                                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 font-bold' 
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={step.isCompleted}
                              onChange={() => handleToggleStep(p, step.id)}
                              className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer shrink-0"
                            />
                            <span className={`text-xs ${step.isCompleted ? 'line-through text-slate-500' : 'font-bold'}`}>
                              {step.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Teacher Notes Area */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">ملاحظات المعلم وتوصيات المتابعة:</label>
                      <textarea
                        rows={2}
                        value={p.teacherNotes || ''}
                        onChange={(e) => handleUpdatePlan({ ...p, teacherNotes: e.target.value })}
                        placeholder="دون هنا أي ملاحظات إضافية حول تجاوب الطالب أو التواصل مع ولي الأمر..."
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Manual Student Selection Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              <span>إضافة طالب يدوياً للخطة العلاجية</span>
            </h3>

            <p className="text-slate-500 text-xs">
              اختر اسماً من قائمة الطلاب المعتمدة لإعداد خطة علاجية ومتابعة فردية خاصة له.
            </p>

            <select
              value={manualStudentId}
              onChange={(e) => setManualStudentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">-- اختر الطالب --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (الصف {s.grade} - فصل {s.class_num})
                </option>
              ))}
            </select>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={!manualStudentId}
                onClick={handleAddManualStudent}
                className="disabled:opacity-50 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                إضافة الطالب للخطة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Modal */}
      <RemedialPlanPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        plan={printPlan}
        batchPlans={filteredPlans}
        teacher={teacher}
        selectedTerm={selectedTerm}
      />

    </div>
  );
};
