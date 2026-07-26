import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Palette, 
  RotateCcw, 
  Check, 
  RefreshCw, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FolderArchive, 
  ArrowLeft,
  Cloud,
  Download,
  Database,
  Upload,
  HardDrive,
  FileJson,
  ShieldCheck,
  Zap,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarCheck,
  Plus,
  Trash2,
  Bell,
  GraduationCap,
  AlertTriangle,
  Info,
  Volume2,
  VolumeX,
  Smartphone
} from 'lucide-react';
import { StatusColors, AssessmentRecord, TeacherProfile, Reminder } from '../types';
import { COLOR_PRESETS, DEFAULT_STATUS_COLORS } from '../lib/statusColors';
import { isAudioMuted, setAudioMuted, playSuccessSoundAndVibrate, playAlertSoundAndVibrate } from '../lib/sound';

export interface CalendarHolidayItem {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  type: 'official' | 'midterm_break' | 'national' | 'exam' | 'other';
  description?: string;
}

export interface CustomAcademicCalendar {
  academicYear: string;
  term1Start: string;
  term1End: string;
  term2Start: string;
  term2End: string;
  weeklyOffDays: number[]; // 5=Friday, 6=Saturday (JS getDay())
  holidays: CalendarHolidayItem[];
}

const DEFAULT_ACADEMIC_CALENDAR: CustomAcademicCalendar = {
  academicYear: '2025/2026',
  term1Start: '2025-09-21',
  term1End: '2026-01-22',
  term2Start: '2026-02-08',
  term2End: '2026-06-18',
  weeklyOffDays: [5, 6],
  holidays: [
    { id: 'h1', title: 'عطلة المولد النبوي الشريف', startDate: '2025-09-16', endDate: '2025-09-16', type: 'official' },
    { id: 'h2', title: 'عيد النصر (6 أكتوبر)', startDate: '2025-10-06', endDate: '2025-10-06', type: 'national' },
    { id: 'h3', title: 'إجازة منتصف العام الدراسي', startDate: '2026-01-25', endDate: '2026-02-05', type: 'midterm_break' },
    { id: 'h4', title: 'إجازة عيد الفطر المبارك', startDate: '2026-03-20', endDate: '2026-03-24', type: 'official' },
    { id: 'h5', title: 'إجازة عيد تحرير سيناء', startDate: '2026-04-25', endDate: '2026-04-25', type: 'national' },
    { id: 'h6', title: 'إجازة عيد الأضحى المبارك', startDate: '2026-05-26', endDate: '2026-05-31', type: 'official' },
    { id: 'h7', title: 'ذكرى ثورة 30 يونيو', startDate: '2026-06-30', endDate: '2026-06-30', type: 'national' }
  ]
};

const GULF_ACADEMIC_CALENDAR: CustomAcademicCalendar = {
  academicYear: '2025/2026',
  term1Start: '2025-08-24',
  term1End: '2025-11-20',
  term2Start: '2025-11-30',
  term2End: '2026-03-05',
  weeklyOffDays: [5, 6],
  holidays: [
    { id: 'gh1', title: 'إجازة اليوم الوطني', startDate: '2025-09-23', endDate: '2025-09-23', type: 'national' },
    { id: 'gh2', title: 'إجازة الخريف', startDate: '2025-10-20', endDate: '2025-10-24', type: 'midterm_break' },
    { id: 'gh3', title: 'إجازة منتصف العام الدراسي', startDate: '2025-12-21', endDate: '2026-01-01', type: 'midterm_break' },
    { id: 'gh4', title: 'إجازة يوم التأسيس', startDate: '2026-02-22', endDate: '2026-02-22', type: 'national' },
    { id: 'gh5', title: 'إجازة عيد الفطر المبارك', startDate: '2026-03-20', endDate: '2026-04-05', type: 'official' },
    { id: 'gh6', title: 'إجازة عيد الأضحى المبارك', startDate: '2026-05-24', endDate: '2026-06-02', type: 'official' }
  ]
};

interface SettingsScreenProps {
  statusColors: StatusColors;
  onSaveStatusColors: (newColors: StatusColors) => void;
  onOpenArchive?: () => void;
  onOpenCustomClearModal?: () => void;
  archivedCount?: number;
  showToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  records?: AssessmentRecord[];
  teacher?: TeacherProfile;
  isFirebaseConnected?: boolean;
  onManualCloudSync?: () => Promise<void>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  statusColors,
  onSaveStatusColors,
  onOpenArchive,
  onOpenCustomClearModal,
  archivedCount = 0,
  showToast,
  records = [],
  teacher,
  isFirebaseConnected = true,
  onManualCloudSync,
}) => {
  const [colors, setColors] = useState<StatusColors>(statusColors);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(() => isAudioMuted());
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return localStorage.getItem('school_assessments_last_manual_sync_v1') || 'لم تتم المزامنة اليدوية بعد';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const calendarFileInputRef = useRef<HTMLInputElement>(null);

  // Academic Calendar State
  const [academicCalendar, setAcademicCalendar] = useState<CustomAcademicCalendar>(() => {
    try {
      const saved = localStorage.getItem('school_assessments_academic_calendar_v1');
      return saved ? JSON.parse(saved) : DEFAULT_ACADEMIC_CALENDAR;
    } catch {
      return DEFAULT_ACADEMIC_CALENDAR;
    }
  });

  // Form states for adding custom holiday
  const [newHolidayTitle, setNewHolidayTitle] = useState('');
  const [newHolidayStart, setNewHolidayStart] = useState('');
  const [newHolidayEnd, setNewHolidayEnd] = useState('');
  const [newHolidayType, setNewHolidayType] = useState<CalendarHolidayItem['type']>('official');

  const handleReset = () => {
    setColors(DEFAULT_STATUS_COLORS);
    onSaveStatusColors(DEFAULT_STATUS_COLORS);
    if (showToast) {
      showToast('info', 'تمت إعادة ضبط الألوان', 'تمت استعادة ألوان مؤشرات الحالة الافتراضية بنجاح.');
    }
  };

  const handleSave = () => {
    onSaveStatusColors(colors);
    if (showToast) {
      showToast('success', 'تم حفظ الألوان بنجاح', 'تم تطبيقه على جميع شاشات التطبيق وأزرار الطلاب وشاشة البحث.');
    }
  };

  const updateColor = (key: keyof StatusColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  // Save Calendar State
  const saveCalendarState = (updated: CustomAcademicCalendar) => {
    setAcademicCalendar(updated);
    localStorage.setItem('school_assessments_academic_calendar_v1', JSON.stringify(updated));

    // Also update teacher profile holidays
    try {
      const existingTeacherStr = localStorage.getItem('school_assessments_teacher_profile');
      if (existingTeacherStr) {
        const existingTeacher = JSON.parse(existingTeacherStr);
        existingTeacher.officialHolidays = updated.holidays.map(h => `${h.title} (${h.startDate})`);
        localStorage.setItem('school_assessments_teacher_profile', JSON.stringify(existingTeacher));
      }
    } catch (e) {
      console.error('Error syncing holidays to teacher profile:', e);
    }
  };

  // Add Custom Holiday
  const handleAddCustomHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayTitle.trim() || !newHolidayStart) {
      alert('يرجى كتابة عنوان العطلة وتحديد تاريخ البداية على الأقل.');
      return;
    }

    const newItem: CalendarHolidayItem = {
      id: Date.now().toString(),
      title: newHolidayTitle.trim(),
      startDate: newHolidayStart,
      endDate: newHolidayEnd || newHolidayStart,
      type: newHolidayType,
    };

    const updated = {
      ...academicCalendar,
      holidays: [...academicCalendar.holidays, newItem].sort((a, b) => a.startDate.localeCompare(b.startDate))
    };

    saveCalendarState(updated);

    setNewHolidayTitle('');
    setNewHolidayStart('');
    setNewHolidayEnd('');
    setNewHolidayType('official');

    if (showToast) {
      showToast('success', 'تمت إضافة العطلة بنجاح', `تم تسجيل "${newItem.title}" ضمن التقويم المعتمد.`);
    }
  };

  // Delete Holiday
  const handleDeleteHoliday = (holidayId: string) => {
    const updated = {
      ...academicCalendar,
      holidays: academicCalendar.holidays.filter(h => h.id !== holidayId)
    };
    saveCalendarState(updated);
    if (showToast) {
      showToast('info', 'تم حذف العطلة', 'تم تحديث قائمة العطلات الرسمية بالتقويم.');
    }
  };

  // Calculate Calendar Statistics
  const calendarStats = React.useMemo(() => {
    let totalStudyDays = 0;
    let totalHolidayDays = 0;
    let totalWeekendDays = 0;

    const countPeriodDays = (startStr: string, endStr: string) => {
      if (!startStr || !endStr) return;
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return;

      let curr = new Date(start);
      while (curr <= end) {
        const dateStr = curr.toISOString().split('T')[0];
        const dayOfWeek = curr.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat

        const isWeekend = academicCalendar.weeklyOffDays.includes(dayOfWeek);
        const isHoliday = academicCalendar.holidays.some(h => dateStr >= h.startDate && dateStr <= h.endDate);

        if (isHoliday) {
          totalHolidayDays++;
        } else if (isWeekend) {
          totalWeekendDays++;
        } else {
          totalStudyDays++;
        }

        curr.setDate(curr.getDate() + 1);
      }
    };

    countPeriodDays(academicCalendar.term1Start, academicCalendar.term1End);
    countPeriodDays(academicCalendar.term2Start, academicCalendar.term2End);

    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingHolidays = academicCalendar.holidays
      .filter(h => h.endDate >= todayStr)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    const nextHoliday = upcomingHolidays[0] || null;

    return {
      totalStudyDays,
      totalHolidayDays,
      totalWeekendDays,
      nextHoliday,
      upcomingHolidaysCount: upcomingHolidays.length
    };
  }, [academicCalendar]);

  // Auto-Sync & Generate System Reminders from Academic Calendar
  const handleAutoSyncRemindersFromCalendar = () => {
    try {
      let existingReminders: Reminder[] = [];
      try {
        existingReminders = JSON.parse(localStorage.getItem('school_assessments_reminders_v1') || '[]');
      } catch {
        existingReminders = [];
      }

      // Filter out old auto-generated calendar reminders to avoid duplication
      const manualReminders = existingReminders.filter(r => !r.id.startsWith('auto_cal_'));

      const newAutoReminders: Reminder[] = [];

      // Add reminders for upcoming holidays
      academicCalendar.holidays.forEach(h => {
        newAutoReminders.push({
          id: `auto_cal_holiday_${h.id}`,
          title: `🌴 عطلة رسمية: ${h.title}`,
          description: `تنبيه تلقائي من التقويم الدراسي: تبدأ الإجازة الرسمية من ${h.startDate} حتى ${h.endDate}. يرجى تنظيم جداول التقييمات.`,
          targetType: 'general',
          reminderDate: h.startDate,
          isCompleted: false,
          created_at: new Date().toISOString(),
          notifyStudents: true
        });
      });

      // Add reminders for term exams / deadlines
      if (academicCalendar.term1End) {
        newAutoReminders.push({
          id: `auto_cal_term1_end`,
          title: `📝 نهاية التقييمات وامتحانات الفصل الأول`,
          description: `ينتهي الفصل الدراسي الأول بتاريخ ${academicCalendar.term1End}. يرجى رصد جميع التقييمات المتبقية والخطط العلاجية.`,
          targetType: 'general',
          reminderDate: academicCalendar.term1End,
          isCompleted: false,
          created_at: new Date().toISOString()
        });
      }

      if (academicCalendar.term2End) {
        newAutoReminders.push({
          id: `auto_cal_term2_end`,
          title: `🎓 نهاية العام الدراسي والتقييمات الختامية`,
          description: `ينتهي الفصل الدراسي الثاني بتاريخ ${academicCalendar.term2End}. يرجى إقفال السجلات واستخراج التقارير النهائية.`,
          targetType: 'general',
          reminderDate: academicCalendar.term2End,
          isCompleted: false,
          created_at: new Date().toISOString()
        });
      }

      const mergedReminders = [...manualReminders, ...newAutoReminders];
      localStorage.setItem('school_assessments_reminders_v1', JSON.stringify(mergedReminders));

      if (showToast) {
        showToast(
          'success',
          'تم تحديث التنبيهات بناءً على التقويم 🔔',
          `تم احتساب ${calendarStats.totalStudyDays} يوم دراسة فعلي، و${calendarStats.totalHolidayDays} يوم عطلة رسمية. تم إنشاء ${newAutoReminders.length} تنبيهات دراسية تلقائياً!`
        );
      }
    } catch (err) {
      console.error('Error auto syncing reminders:', err);
      if (showToast) {
        showToast('error', 'فشل تحديث التنبيهات', 'حدث خطأ أثناء المزامنة مع قائمة التنبيهات.');
      }
    }
  };

  // Upload Custom Calendar JSON
  const handleUploadCalendarJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed.term1Start || !parsed.term2End || !Array.isArray(parsed.holidays)) {
          alert('ملف التقويم الدراسي غير صالح! يجب أن يحتوي على تواريخ الفصول الدراسية وقائمة العطلات.');
          return;
        }

        const formatted: CustomAcademicCalendar = {
          academicYear: parsed.academicYear || '2025/2026',
          term1Start: parsed.term1Start,
          term1End: parsed.term1End,
          term2Start: parsed.term2Start,
          term2End: parsed.term2End,
          weeklyOffDays: Array.isArray(parsed.weeklyOffDays) ? parsed.weeklyOffDays : [5, 6],
          holidays: parsed.holidays
        };

        saveCalendarState(formatted);

        if (showToast) {
          showToast('success', 'تم رفع التقويم السنوي بنجاح 📅', `تم تحميل تقويم العام الدراسي ${formatted.academicYear} وتحديث أيام العطل والدراسة.`);
        }
      } catch (err) {
        console.error('Failed to parse calendar JSON:', err);
        alert('حدث خطأ أثناء قراءة ملف التقويم JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Download Calendar JSON
  const handleExportCalendarJson = () => {
    const jsonStr = JSON.stringify(academicCalendar, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقويم_مدرسي_${academicCalendar.academicYear.replace('/', '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Manual Cloud Sync & Local JSON Backup Trigger
  const handleManualCloudSyncAndBackup = async () => {
    setIsSyncing(true);

    try {
      // 1. Run cloud sync callback if provided
      if (onManualCloudSync) {
        await onManualCloudSync();
      }

      // 2. Read all local data
      let rosterData = [];
      let attendanceData = [];
      let remedialPlansData = {};
      let archiveData = [];
      let remindersData = [];

      try {
        rosterData = JSON.parse(localStorage.getItem('school_assessments_students_roster_v1') || '[]');
        attendanceData = JSON.parse(localStorage.getItem('school_assessments_attendance_v1') || '[]');
        remedialPlansData = JSON.parse(localStorage.getItem('school_assessments_remedial_plans_v1') || '{}');
        archiveData = JSON.parse(localStorage.getItem('school_assessments_archived_terms_v1') || '[]');
        remindersData = JSON.parse(localStorage.getItem('school_assessments_reminders_v1') || '[]');
      } catch (e) {
        console.error('Error parsing local storage for backup:', e);
      }

      // 3. Construct backup JSON bundle
      const exportTimestamp = new Date().toISOString();
      const backupBundle = {
        appName: 'نظام تقييمات وسجلات المدرسة',
        backupVersion: '1.0',
        exportDate: exportTimestamp,
        teacherProfile: teacher || JSON.parse(localStorage.getItem('school_assessments_teacher_profile') || '{}'),
        statsSummary: {
          totalStudents: rosterData.length,
          totalAssessmentRecords: records.length,
          totalAttendanceEntries: attendanceData.length,
          totalRemedialPlans: Object.keys(remedialPlansData).length
        },
        data: {
          studentsRoster: rosterData,
          attendance: attendanceData,
          assessmentRecords: records,
          remedialPlans: remedialPlansData,
          archivedTerms: archiveData,
          reminders: remindersData,
          statusColors: colors
        }
      };

      // 4. Download local JSON backup file
      const jsonStr = JSON.stringify(backupBundle, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const schoolNameStr = (teacher?.school || 'المدرسة').replace(/\s+/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `نسخة_احتياطية_مدرسية_${schoolNameStr}_${dateStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 5. Update timestamp & Toast
      const formattedTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
      setLastSyncTime(formattedTime);
      localStorage.setItem('school_assessments_last_manual_sync_v1', formattedTime);

      if (showToast) {
        showToast(
          'success',
          'تمت المزامنة وتنزيل النسخة الاحتياطية بنجاح ☁️💾',
          `تم ضغط ${records.length} سجل تقييم و${rosterData.length} طالب في ملف JSON وحفظه بنجاح على جهازك.`
        );
      }
    } catch (err) {
      console.error('Failed manual sync and backup:', err);
      if (showToast) {
        showToast('error', 'فشلت المزامنة اليدوية', 'حدث خطأ أثناء تجميع البيانات أو المزامنة مع Firebase.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Restore/Import backup from JSON
  const handleImportJsonBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const bundle = JSON.parse(content);

        if (!bundle.data) {
          alert('ملف النسخة الاحتياطية غير صالح أو تنسيقه غير مدعوم.');
          return;
        }

        if (confirm(`هل أنت تأكد من استعادة النسخة الاحتياطية المدرسية؟\nتاريخ النسخة: ${bundle.exportDate || 'غير مدون'}\nعدد الطلاب: ${bundle.data.studentsRoster?.length || 0}`)) {
          if (bundle.data.studentsRoster) localStorage.setItem('school_assessments_students_roster_v1', JSON.stringify(bundle.data.studentsRoster));
          if (bundle.data.attendance) localStorage.setItem('school_assessments_attendance_v1', JSON.stringify(bundle.data.attendance));
          if (bundle.data.remedialPlans) localStorage.setItem('school_assessments_remedial_plans_v1', JSON.stringify(bundle.data.remedialPlans));
          if (bundle.data.archivedTerms) localStorage.setItem('school_assessments_archived_terms_v1', JSON.stringify(bundle.data.archivedTerms));
          if (bundle.data.reminders) localStorage.setItem('school_assessments_reminders_v1', JSON.stringify(bundle.data.reminders));
          if (bundle.data.statusColors) onSaveStatusColors(bundle.data.statusColors);

          if (showToast) {
            showToast('success', 'تمت استعادة البيانات بنجاح', 'تم تحديث السجلات المحلية وإعادة تنظيم النظام. يرجى إعادة تنشيط الصفحة.');
          }
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (err) {
        console.error('Failed to parse import backup:', err);
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 dir-rtl animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
            <Palette className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">إعدادات ألوان المؤشرات</h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1">
              خصص وتعديل ألوان حالات الطلاب (حضور، غياب، تأجيل) لتظهر بشكل موحد في شاشة البحث وأزرار التقييمات.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer active:scale-95"
            title="إعادة ضبط الألوان إلى الوضع الافتراضي"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>إعادة الضبط</span>
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>حفظ الألوان والتطبيق</span>
          </button>
        </div>
      </div>

      {/* Audio & Haptic Feedback Settings Card */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 border border-sky-500/30 text-white rounded-3xl p-5 sm:p-6 shadow-md space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-sky-500/20 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center shadow-md shrink-0">
              {soundMuted ? <VolumeX className="w-6 h-6 text-rose-400" /> : <Volume2 className="w-6 h-6 text-sky-300 animate-pulse" />}
            </div>
            <div>
              <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                <span>التنبيهات الصوتية والاهتزاز</span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  soundMuted 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {soundMuted ? 'الصوت مكتوم' : 'التنبيهات مفعلة'}
                </span>
              </h3>
              <p className="text-xs text-sky-200/80 font-medium mt-0.5">
                تفعيل النغمات والاهتزاز التفاعلي عند تسجيل تقييم جديد بنجاح أو عند ظهور تنبيهات النظام الخاصة بالتقييمات المتأخرة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const next = !soundMuted;
                setSoundMuted(next);
                setAudioMuted(next);
                if (!next) {
                  playSuccessSoundAndVibrate();
                }
              }}
              className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                soundMuted
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{soundMuted ? 'تفعيل الصوت' : 'كتم الصوت'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>تجربة النغمات التفاعلية والاهتزاز الآن:</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => playSuccessSoundAndVibrate()}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>🔔 نغمة نجاح التقييم</span>
            </button>
            <button
              type="button"
              onClick={() => playAlertSoundAndVibrate()}
              className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold text-xs rounded-xl border border-rose-400/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>⚠️ نغمة تنبيه المتأخرات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Cloud Sync & Local Backup Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-500/30 text-white rounded-3xl p-5 sm:p-6 shadow-md space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shadow-md shrink-0">
              <Cloud className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                <span>المزامنة السحابية والنسخ الاحتياطي اليدوي</span>
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>تزامن مع Firebase + JSON</span>
                </span>
              </h3>
              <p className="text-slate-300 text-xs font-medium mt-0.5">
                تنزيل جميع سجلات الطلاب والتقييمات والخطط العلاجية في ملف JSON مضغوط محلياً، مع تنشيط المزامنة السحابية الفورية.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportJsonBackup} 
              accept=".json" 
              className="hidden" 
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="استعادة البيانات من ملف JSON أوفلاين"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>استعادة من ملف JSON</span>
            </button>

            <button
              type="button"
              onClick={handleManualCloudSyncAndBackup}
              disabled={isSyncing}
              className="disabled:opacity-50 px-5 py-2.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري المزامنة والتنزيل...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>مزامنة سحابية وتنزيل Backup ☁️💾</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sync Info Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 pt-1">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>سجلات التقييم: <strong className="text-white font-mono">{records.length}</strong></span>
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>حالة خادم Firebase: <strong className="text-emerald-300 font-bold">{isFirebaseConnected ? 'متصل ومزامن 🟢' : 'يعمل محلياً 🟠'}</strong></span>
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            آخر مزامنة ونسخ احتياطي: <span className="text-amber-300 font-bold">{lastSyncTime}</span>
          </div>
        </div>
      </div>

      {/* Archive Management Banner */}
      {onOpenArchive && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-300 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <span>أرشفة الفصول والتقييمات التاريخية</span>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                  ميزة هامة
                </span>
              </h3>
              <p className="text-slate-600 text-xs font-medium mt-0.5">
                يمكنك أرشفة الفصول الدراسية المنتهية لتقليل زحام الواجهة، مع إمكانية البحث والاطلاع على الأرشيف واسترجاعه في أي وقت.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenArchive}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <FolderArchive className="w-4 h-4" />
            <span>فتح حافظة الأرشيف</span>
          </button>
        </div>
      )}

      {/* 🗑️ Custom Clear Assessments Section */}
      <div className="bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 border border-rose-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-rose-950 text-base sm:text-lg flex items-center gap-2">
                <span>إدارة وتصفير التقييمات المخصص</span>
                <span className="bg-rose-200 text-rose-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-300">
                  تحكم مخصص
                </span>
              </h3>
              <p className="text-rose-800 text-xs font-medium mt-0.5">
                تصفير كافة الشهور، مسح شهر معين محدد، أو تحديد مدة مخصصة من شهر كذا إلى شهر كذا بمرونة كاملة.
              </p>
            </div>
          </div>

          {onOpenCustomClearModal && (
            <button
              onClick={onOpenCustomClearModal}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>مسح وتصفير التقييمات...</span>
            </button>
          )}
        </div>
      </div>

      {/* 📅 Academic Calendar & Study Days Section */}
      <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-md space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>التقويم المدرسي السنوي وتحديد أيام الدراسة والعطل</span>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200">
                  حسابات آلية ⚡
                </span>
              </h3>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                تعيين أو رفع التقويم الدراسي لتحديد أيام الدراسة الفعلية والعطل الرسمية تلقائياً وتحديث تنبيهات جدول التقييمات.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end">
            <input 
              type="file" 
              ref={calendarFileInputRef} 
              onChange={handleUploadCalendarJson} 
              accept=".json" 
              className="hidden" 
            />

            <button
              type="button"
              onClick={() => calendarFileInputRef.current?.click()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="رفع تقويم سنوي خاص بصيغة JSON"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>رفع تقويم JSON</span>
            </button>

            <button
              type="button"
              onClick={handleExportCalendarJson}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="تصدير التقويم الحالي كملف JSON"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>تصدير التقويم</span>
            </button>

            <button
              type="button"
              onClick={handleAutoSyncRemindersFromCalendar}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              <span>تحديث التنبيهات تلقائياً 🔔</span>
            </button>
          </div>
        </div>

        {/* 4 Calculated Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 block">أيام الدراسة الفعلية</span>
              <div className="text-xl font-black text-emerald-950 mt-0.5">
                {calendarStats.totalStudyDays} <span className="text-xs font-bold text-emerald-700">يوم دراسي</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-700 block">أيام العطل الرسمية</span>
              <div className="text-xl font-black text-amber-950 mt-0.5">
                {calendarStats.totalHolidayDays} <span className="text-xs font-bold text-amber-700">يوم عطلة</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-sky-700 block">العام الدراسي</span>
              <div className="text-lg font-black text-sky-950 mt-0.5">
                {academicCalendar.academicYear}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-purple-700 block">العطلة الرسمية القادمة</span>
              <div className="text-xs font-black text-purple-950 truncate mt-1">
                {calendarStats.nextHoliday ? (
                  <>
                    <span>{calendarStats.nextHoliday.title}</span>
                    <span className="block text-[10px] text-purple-600 font-mono mt-0.5 dir-ltr text-right">{calendarStats.nextHoliday.startDate}</span>
                  </>
                ) : (
                  <span className="text-slate-400">لا توجد عطلات قادمة</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Term Dates & Presets Configuration */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              <span>مخطط العام الدراسي وتاريخ الفصلين الأول والثاني</span>
            </h4>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500">تحميل تقويم جاهز:</span>
              <button
                type="button"
                onClick={() => {
                  saveCalendarState(DEFAULT_ACADEMIC_CALENDAR);
                  if (showToast) showToast('info', 'تم تحميل التقويم المعتمد', 'تمت استعادة تقويم المدارس الحكومية والرسمية.');
                }}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-200 transition-all cursor-pointer"
              >
                التقويم المعتمد (عام)
              </button>
              <button
                type="button"
                onClick={() => {
                  saveCalendarState(GULF_ACADEMIC_CALENDAR);
                  if (showToast) showToast('info', 'تم تحميل تقويم الخليج', 'تم تطبيق تقويم السعودية والخليج.');
                }}
                className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-700 text-[11px] font-bold rounded-lg border border-amber-200 transition-all cursor-pointer"
              >
                تقويم المدارس السعودية/الخليج
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">العام الدراسي:</label>
              <input
                type="text"
                value={academicCalendar.academicYear}
                onChange={(e) => saveCalendarState({ ...academicCalendar, academicYear: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="2025/2026"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">بداية الفصل الأول:</label>
              <input
                type="date"
                value={academicCalendar.term1Start}
                onChange={(e) => saveCalendarState({ ...academicCalendar, term1Start: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">نهاية الفصل الأول:</label>
              <input
                type="date"
                value={academicCalendar.term1End}
                onChange={(e) => saveCalendarState({ ...academicCalendar, term1End: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">بداية الفصل الثاني:</label>
              <input
                type="date"
                value={academicCalendar.term2Start}
                onChange={(e) => saveCalendarState({ ...academicCalendar, term2Start: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">نهاية الفصل الثاني:</label>
              <input
                type="date"
                value={academicCalendar.term2End}
                onChange={(e) => saveCalendarState({ ...academicCalendar, term2End: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Official Holidays Management List & Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>جدول العطلات والإجازات الرسمية المعتمدة ({academicCalendar.holidays.length} عطلة)</span>
            </h4>
            <span className="text-[11px] font-bold text-slate-500">تتأثر بها حسابات أيام الدراسة الآلية والتنبيهات</span>
          </div>

          {/* Add Holiday Form */}
          <form onSubmit={handleAddCustomHoliday} className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-indigo-900 block mb-1">اسم العطلة / المناسبة:</label>
              <input
                type="text"
                value={newHolidayTitle}
                onChange={(e) => setNewHolidayTitle(e.target.value)}
                placeholder="مثال: إجازة عيد الفطر المبارك"
                className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-[11px] font-bold text-indigo-900 block mb-1">تاريخ البداية:</label>
              <input
                type="date"
                value={newHolidayStart}
                onChange={(e) => setNewHolidayStart(e.target.value)}
                className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-[11px] font-bold text-indigo-900 block mb-1">تاريخ النهاية:</label>
              <input
                type="date"
                value={newHolidayEnd}
                onChange={(e) => setNewHolidayEnd(e.target.value)}
                placeholder="اتركه نفس البداية إذا يوم واحد"
                className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة عطلة</span>
              </button>
            </div>
          </form>

          {/* Holidays List Grid */}
          {academicCalendar.holidays.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs font-bold">
              لا توجد عطلات رسمية مسجلة حالياً. استخدم النموذج أعلاه لإضافة عطلة جديدة أو اختر تقويماً جاهزاً.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {academicCalendar.holidays.map((h) => {
                const isSingleDay = !h.endDate || h.startDate === h.endDate;
                return (
                  <div key={h.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <h5 className="font-extrabold text-slate-800 text-xs truncate">{h.title}</h5>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                        <span>{h.startDate}</span>
                        {!isSingleDay && <span>← {h.endDate}</span>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteHoliday(h.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="حذف العطلة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 1. Presence Color Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full shadow-xs inline-block shrink-0"
                style={{ backgroundColor: colors.present, boxShadow: `0 0 10px ${colors.present}60` }}
              ></span>
              <h3 className="font-black text-slate-800 text-base">مؤشر الحضور</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              (حاضر)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={colors.present}
              onChange={(e) => updateColor('present', e.target.value)}
              className="w-12 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-slate-50 shrink-0"
            />
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 block mb-1">كود اللون Hex:</label>
              <input
                type="text"
                value={colors.present}
                onChange={(e) => updateColor('present', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 dir-ltr focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-2">نماذج ألوان سريعة:</label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.slice(0, 6).map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => updateColor('present', preset.hex)}
                  className={`w-6 h-6 rounded-lg transition-transform hover:scale-110 relative ${
                    colors.present.toLowerCase() === preset.hex.toLowerCase() ? 'ring-2 ring-indigo-600 scale-110' : ''
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                ></button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Absence Color Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full shadow-xs inline-block shrink-0"
                style={{ backgroundColor: colors.absent, boxShadow: `0 0 10px ${colors.absent}60` }}
              ></span>
              <h3 className="font-black text-slate-800 text-base">مؤشر الغياب</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              (غائب)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={colors.absent}
              onChange={(e) => updateColor('absent', e.target.value)}
              className="w-12 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-slate-50 shrink-0"
            />
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 block mb-1">كود اللون Hex:</label>
              <input
                type="text"
                value={colors.absent}
                onChange={(e) => updateColor('absent', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 dir-ltr focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-2">نماذج ألوان سريعة:</label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.slice(4, 10).map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => updateColor('absent', preset.hex)}
                  className={`w-6 h-6 rounded-lg transition-transform hover:scale-110 relative ${
                    colors.absent.toLowerCase() === preset.hex.toLowerCase() ? 'ring-2 ring-indigo-600 scale-110' : ''
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                ></button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Postponement / Excused Color Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full shadow-xs inline-block shrink-0"
                style={{ backgroundColor: colors.excused, boxShadow: `0 0 10px ${colors.excused}60` }}
              ></span>
              <h3 className="font-black text-slate-800 text-base">مؤشر التأجيل / العذر</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              (تأجيل)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={colors.excused}
              onChange={(e) => updateColor('excused', e.target.value)}
              className="w-12 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-slate-50 shrink-0"
            />
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 block mb-1">كود اللون Hex:</label>
              <input
                type="text"
                value={colors.excused}
                onChange={(e) => updateColor('excused', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 dir-ltr focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-2">نماذج ألوان سريعة:</label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.slice(6, 11).map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => updateColor('excused', preset.hex)}
                  className={`w-6 h-6 rounded-lg transition-transform hover:scale-110 relative ${
                    colors.excused.toLowerCase() === preset.hex.toLowerCase() ? 'ring-2 ring-indigo-600 scale-110' : ''
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                ></button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Live Preview Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-slate-800 text-lg">معاينة مباشرة لشكل الألوان بالتطبيق</h3>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            تحديث مباشر مع التغييرات
          </span>
        </div>

        {/* 1. Preview Student Buttons in Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500">1. شكل أزرار الطلاب في جدول التقييمات:</h4>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-around gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white shadow-sm"
                style={{ backgroundColor: colors.present, boxShadow: `0 2px 6px ${colors.present}50` }}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-slate-700">حاضر</span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white shadow-sm"
                style={{ backgroundColor: colors.absent, boxShadow: `0 2px 6px ${colors.absent}50` }}
              >
                <XCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">غائب</span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white shadow-sm"
                style={{ backgroundColor: colors.excused, boxShadow: `0 2px 6px ${colors.excused}50` }}
              >
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">تأجيل / بعذر</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-400">
                -
              </div>
              <span className="text-xs font-bold text-slate-500">سادة (لم يُقيّم)</span>
            </div>
          </div>
        </div>

        {/* 2. Preview Search Screen Circles & Legend */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500">2. شكل دوائر التقييم الـ 15 ودليل الألوان في شاشة البحث:</h4>
          
          {/* Legend preview */}
          <div className="p-3 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-700">
            <span className="text-slate-400 text-[11px]">دليل التقييمات:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: colors.present, boxShadow: `0 2px 4px ${colors.present}60` }}></span>
              <span>حاضر</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: colors.absent, boxShadow: `0 2px 4px ${colors.absent}60` }}></span>
              <span>غائب</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: colors.excused, boxShadow: `0 2px 4px ${colors.excused}60` }}></span>
              <span>تأجيل / بعذر</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-300 border border-slate-400/50 inline-block"></span>
              <span>لم يُقيّم</span>
            </div>
          </div>

          {/* 15 Circles preview */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between gap-1.5 overflow-x-auto p-1">
              {Array.from({ length: 15 }, (_, i) => {
                const num = i + 1;
                let bg = '#e2e8f0'; // default sada
                let colorText = '#334155';
                let shadow = 'none';

                if ([1, 2, 4, 5, 7, 8, 10, 11, 13].includes(num)) {
                  bg = colors.present;
                  colorText = '#ffffff';
                  shadow = `0 2px 6px ${colors.present}60`;
                } else if ([3, 9, 14].includes(num)) {
                  bg = colors.absent;
                  colorText = '#ffffff';
                  shadow = `0 2px 6px ${colors.absent}60`;
                } else if ([6, 12].includes(num)) {
                  bg = colors.excused;
                  colorText = '#ffffff';
                  shadow = `0 2px 6px ${colors.excused}60`;
                }

                return (
                  <div
                    key={num}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all cursor-pointer"
                    style={{ backgroundColor: bg, color: colorText, boxShadow: shadow }}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>إعادة الضبط للافتراضي</span>
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>حفظ التطبيق والتغييرات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
