import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trash2, AlertTriangle, X } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ControlBar } from './components/ControlBar';
import { AssessmentGrid } from './components/AssessmentGrid';
import { AssessmentSearch } from './components/AssessmentSearch';
import { TermProgress } from './components/TermProgress';


import { ClassRosterManager } from './components/ClassRosterManager';
import { ClassStats } from './components/ClassStats';
import { LateAssessments } from './components/LateAssessments';
import { AdminDashboard, ManagementSessionData } from './components/AdminDashboard';
import { StudentReportsScreen } from './components/StudentReportsScreen';
import { AssessmentModal } from './components/AssessmentModal';
import { DuplicateConfirmModal } from './components/DuplicateConfirmModal';
import { TeacherProfileModal } from './components/TeacherProfileModal';
import { RemindersModal } from './components/RemindersModal';
import { Toast, ToastMessage } from './components/Toast';
import { LoginScreen, ManagementLoginData } from './components/LoginScreen';

import { HomeScreen } from './components/HomeScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SplashScreen } from './components/SplashScreen';

import { TeacherProfile, AssessmentRecord, MonthInfo, TermId, AppTab, StatusColors, Reminder, Student } from './types';
import { getAdjustedDueDate, isTeacherProfileComplete } from './lib/validation';
import { DEFAULT_TEACHER, DEFAULT_ACADEMIC_YEAR, MONTHS_DATA } from './lib/constants';
import { getStoredStatusColors, saveStoredStatusColors } from './lib/statusColors';
import {
  fetchFirebaseRecords,
  saveFirebaseAssessmentRecord,
  deleteFirebaseAssessmentRecord,
  testFirebaseConnection,
  fetchFirebaseAttendance,
  deleteFirebaseAttendance,
  fetchFirebaseStudents,
  saveFirebaseTeacher,
} from './lib/firebase';

const AUTH_STORAGE_KEY = 'school_assessments_auth_v1';
const TEACHER_STORAGE_KEY = 'school_assessments_teacher_profile';
const YEAR_STORAGE_KEY = 'school_assessments_academic_year';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });
  const [managementSession, setManagementSession] = useState<ManagementSessionData | null>(null);

  // Navigation tab state (4 screens + countdown)
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [hasShownCompleteToast, setHasShownCompleteToast] = useState(false);

  // Teacher profile state
  const [teacher, setTeacher] = useState<TeacherProfile>(() => {
    try {
      const saved = localStorage.getItem(TEACHER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TEACHER;
  });

  // Status colors state for indicators (present, absent, excused)
  const [statusColors, setStatusColors] = useState<StatusColors>(getStoredStatusColors);

  const handleSaveStatusColors = (newColors: StatusColors) => {
    setStatusColors(newColors);
    saveStoredStatusColors(newColors);
  };


  // Academic year state
  const [academicYear, setAcademicYear] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(YEAR_STORAGE_KEY);
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ACADEMIC_YEAR;
  });

  // Term & Month state
  const [selectedTerm, setSelectedTerm] = useState<TermId>('term1');
  const [selectedMonth, setSelectedMonth] = useState<MonthInfo>(
    () => MONTHS_DATA.find((m) => m.termId === 'term1') || MONTHS_DATA[0]
  );

  // Month Assessment Counts state
  const [monthAssessmentCounts, setMonthAssessmentCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('monthAssessments');
    if (saved) return JSON.parse(saved);
    return {
      'm1_sep': 4,
      'm2_oct': 4,
      'm3_nov': 4,
      'm4_dec': 3,
      'm5_jan': 0,
      'm1_feb': 4,
      'm2_mar': 4,
      'm3_apr': 4,
      'm4_may': 3,
      'm5_jun': 0,
    };
  });

  const handleMonthCountChange = (count: number) => {
    const newCounts = { ...monthAssessmentCounts, [selectedMonth.id]: count };
    setMonthAssessmentCounts(newCounts);
    localStorage.setItem('monthAssessments', JSON.stringify(newCounts));
  };

  const dynamicSelectedMonth = React.useMemo(() => {
    const termMonths = MONTHS_DATA.filter(m => m.termId === selectedTerm);
    let currentStart = 1;
    for (const m of termMonths) {
      const count = monthAssessmentCounts[m.id] || 0;
      if (m.id === selectedMonth.id) {
        return {
          ...selectedMonth,
          assessments: Array.from({ length: count }, (_, i) => currentStart + i)
        };
      }
      currentStart += count;
    }
    return selectedMonth;
  }, [selectedMonth, selectedTerm, monthAssessmentCounts]);

  // Records archive state
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  // Custom Reminders state
  const REMINDERS_STORAGE_KEY = 'school_assessments_custom_reminders_v1';
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const saved = localStorage.getItem(REMINDERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);

  const handleAddReminder = (newRem: { title: string; description?: string; targetType: 'student' | 'class' | 'general'; targetName?: string; reminderDate: string; notifyStudents?: boolean }) => {
    const reminder: Reminder = {
      id: `rem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...newRem,
      isCompleted: false,
      created_at: new Date().toISOString()
    };
    const updated = [reminder, ...reminders];
    setReminders(updated);
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updated));
    showToast('success', 'تم إضافة التنبيه', 'تم جدولة التنبيه بنجاح وسيظهر في موعده المحدد.');
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updated));
    showToast('info', 'تم حذف التنبيه', 'تم إزالة التنبيه من القائمة.');
  };

  const handleToggleReminderComplete = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r);
    setReminders(updated);
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updated));
  };

  // Modal UI states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeAssessNum, setActiveAssessNum] = useState<number | null>(null);

  // Duplicate Check Modal state
  const [duplicateModal, setDuplicateModal] = useState<{
    isOpen: boolean;
    existingRecord?: AssessmentRecord;
    pendingRecord?: Partial<AssessmentRecord>;
  }>({ isOpen: false });

  // Toast Notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Test Firebase on startup
  const loadData = useCallback(async () => {
    try {
      const firebaseData = await fetchFirebaseRecords(teacher.id);
      if (firebaseData) {
        setRecords(firebaseData);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    }

    setIsFirebaseConnected(true);
  }, [teacher.id]);
  useEffect(() => {
    testFirebaseConnection();
    setIsFirebaseConnected(navigator.onLine);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsFirebaseConnected(true);
      if (isAuthenticated) {
        loadData();
      }
    };
    const handleOffline = () => setIsFirebaseConnected(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, loadData]);

  // Load records from Firebase

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Prompt teacher to complete profile if incomplete (only once ever)
  useEffect(() => {
    if (isAuthenticated && !managementSession) {
      const hasShownAccountStatusToast = localStorage.getItem('has_shown_complete_account_toast_v2');
      if (!isTeacherProfileComplete(teacher)) {
        const hasPromptedProfile = localStorage.getItem('has_prompted_profile_v2');
        if (!hasPromptedProfile) {
          setIsProfileOpen(true);
          localStorage.setItem('has_prompted_profile_v2', 'true');
        }
      } else if (!hasShownAccountStatusToast) {
        showToast('success', 'حالة الحساب', 'جميع بيانات المعلم والقيادة المدرسية مسجلة وموثقة (جميع الأيقونات مفعلة)');
        localStorage.setItem('has_shown_complete_account_toast_v2', 'true');
      }
    }
  }, [isAuthenticated, managementSession, teacher]);

  // Handler: Update teacher profile
  const handleSaveTeacher = async (updated: TeacherProfile) => {
    setTeacher(updated);
    localStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify(updated));
    if (isFirebaseConnected) {
      await saveFirebaseTeacher(updated);
    }
    showToast('success', 'تم تحديث البيانات', 'تم حفظ ملف المعلم بنجاح.');
  };

  // Handler: Update academic year
  const handleAcademicYearChange = (year: string) => {
    setAcademicYear(year);
    localStorage.setItem(YEAR_STORAGE_KEY, year);
  };

  // Toast Trigger Helper
  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
      message,
    });
  };

  // Handler: Attempting to save an assessment record
  const handleAssessmentSubmit = (
    partialRecord: Partial<AssessmentRecord>,
    isExceptionalConfirmed?: boolean
  ) => {
    // Check if an assessment record already exists for the exact same grade, class, and assessment number
    const duplicate = records.find(
      (r) =>
        r.teacher_id === teacher.id &&
        r.academic_year === academicYear &&
        r.grade === partialRecord.grade &&
        r.class_num === partialRecord.class_num &&
        r.assess_num === partialRecord.assess_num
    );

    if (duplicate) {
      setDuplicateModal({
        isOpen: true,
        existingRecord: duplicate,
        pendingRecord: partialRecord,
      });
      return;
    }

    // Check if another assessment was already recorded on the SAME DATE for the same class
    const sameDateDuplicate = records.find(
      (r) =>
        r.teacher_id === teacher.id &&
        r.academic_year === academicYear &&
        r.grade === partialRecord.grade &&
        r.class_num === partialRecord.class_num &&
        r.assess_date === partialRecord.assess_date &&
        r.assess_num !== partialRecord.assess_num &&
        r.term_id === selectedTerm
    );

    if (sameDateDuplicate) {
      showToast(
        'error',
        'تاريخ مكرر لنفس الفصل ⚠️',
        `تم تسجيل التقييم رقم (${sameDateDuplicate.assess_num}) للصف ${partialRecord.grade} فصل ${partialRecord.class_num} بنفس التاريخ (${partialRecord.assess_date}). لا يجوز تسجيل أكثر من تقييم لنفس الفصل في نفس اليوم!`
      );
      return;
    }

    executeSaveRecord(partialRecord, undefined, isExceptionalConfirmed);
  };

  // Execute Save Record
  const executeSaveRecord = async (
    recordData: Partial<AssessmentRecord>,
    existingIdToReplace?: string,
    isExceptionalConfirmed?: boolean
  ) => {
    const finalRecord: AssessmentRecord = {
      id: existingIdToReplace || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      teacher_id: teacher.id,
      academic_year: academicYear.trim(),
      term_id: recordData.term_id || selectedTerm,
      month_id: recordData.month_id || selectedMonth.id,
      assess_num: recordData.assess_num!,
      grade: recordData.grade!,
      class_num: recordData.class_num!,
      assess_date: recordData.assess_date!,
      notes: recordData.notes || '',
      created_at: new Date().toISOString(),
      timing_status: recordData.timing_status || 'normal',
      timing_period: recordData.timing_period || 'start',
      model_form: recordData.model_form || 'أ',
    };

    const fbRes = await saveFirebaseAssessmentRecord(finalRecord, existingIdToReplace);

    if (fbRes.success) {
      await loadData();
      setActiveAssessNum(null);
      setDuplicateModal({ isOpen: false });

      if (existingIdToReplace) {
        showToast('success', 'تم استبدال التقييم بنجاح', `تم تحديث سجل التقييم ${finalRecord.assess_num} للصف ${finalRecord.grade} فصل ${finalRecord.class_num}`);
      } else {
        showToast('success', 'تم تسجيل التقييم بنجاح', `تم حفظ التقييم ${finalRecord.assess_num} بالسجل المدرسي${isExceptionalConfirmed ? ' (علامة توقيت استثنائي ⚠️)' : ''}`);
      }
    } else {
      showToast('error', 'فشل الحفظ', fbRes.message || 'تعذر إتمام عملية الحفظ بالسجل.');
    }
  };

  // Handler: Confirm overwrite duplicate
  const handleConfirmOverwrite = () => {
    if (duplicateModal.pendingRecord && duplicateModal.existingRecord) {
      executeSaveRecord(
        duplicateModal.pendingRecord,
        duplicateModal.existingRecord.id
      );
    }
  };

  // Handler: Delete record
  const handleDeleteRecord = async (id: string) => {
    await deleteFirebaseAssessmentRecord(id);
    await loadData();
    showToast('info', 'تم حذف التقييم', 'تم إزالة التقييم المحدد من أرشيف السجلات.');
  };

  const handleResetAssessmentsForMonth = async () => {
    try {
      const assessmentsToReset = dynamicSelectedMonth.assessments;

      // Filter records matching selected term AND (selected month ID or assessment numbers of this month)
      const recordsToDelete = records.filter(
        r => r.term_id === selectedTerm && (r.month_id === selectedMonth.id || assessmentsToReset.includes(r.assess_num))
      );
      
      const newRecords = records.filter(
        r => !(r.term_id === selectedTerm && (r.month_id === selectedMonth.id || assessmentsToReset.includes(r.assess_num)))
      );
      setRecords(newRecords);

      // Clean local records storage
      const ARCHIVE_STORAGE_KEY = 'school_assessments_archive_v1';
      localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(newRecords));
      
      // Clean up localStorage attendance
      const ATTENDANCE_STORAGE_KEY = 'school_assessments_attendance_v1';
      let localAttendance: any[] = [];
      try {
        const saved = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
        if (saved) localAttendance = JSON.parse(saved);
      } catch(e) {}
      
      const attendanceToDelete = localAttendance.filter(a => a.month_id === selectedTerm && assessmentsToReset.includes(a.assess_num));
      const newAttendance = localAttendance.filter(a => !(a.month_id === selectedTerm && assessmentsToReset.includes(a.assess_num)));
      
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(newAttendance));
      window.dispatchEvent(new Event('roster_updated'));

      // Delete from Firebase (Firestore handles offline caching automatically)
      for (const r of recordsToDelete) {
        await deleteFirebaseAssessmentRecord(r.id);
      }
      for (const a of attendanceToDelete) {
        if (a.id) {
          await deleteFirebaseAttendance(a.id);
        }
      }
      setShowResetConfirmModal(false);
      showToast('success', 'تم تصفير التقييمات', `تم مسح كافة التقييمات وحضورها المسجل لشهر ${dynamicSelectedMonth.name} بنجاح.`);
    } catch (e) {
      console.error("Failed to reset assessments", e);
      showToast('error', 'خطأ في المسح', 'حدث خطأ أثناء محاولة مسح التقييمات. حاول مرة أخرى.');
    }
  };

  const handleDeleteAssessmentForClass = async (grade: string, classNum: number, assessNum: number) => {
    try {
      const recordsToDelete = records.filter(
        r => r.grade === grade && r.class_num === classNum && r.assess_num === assessNum && r.term_id === selectedTerm
      );
      
      const newRecords = records.filter(
        r => !(r.grade === grade && r.class_num === classNum && r.assess_num === assessNum && r.term_id === selectedTerm)
      );
      setRecords(newRecords);

      const ARCHIVE_STORAGE_KEY = 'school_assessments_archive_v1';
      localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(newRecords));

      // Clean attendance
      const ATTENDANCE_STORAGE_KEY = 'school_assessments_attendance_v1';
      let localAttendance: any[] = [];
      try {
        const saved = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
        if (saved) localAttendance = JSON.parse(saved);
      } catch(e) {}

      const attendanceToDelete = localAttendance.filter(
        a => a.grade === grade && a.class_num === classNum && a.assess_num === assessNum && a.month_id === selectedTerm
      );
      const newAttendance = localAttendance.filter(
        a => !(a.grade === grade && a.class_num === classNum && a.assess_num === assessNum && a.month_id === selectedTerm)
      );

      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(newAttendance));
      window.dispatchEvent(new Event('roster_updated'));

      for (const r of recordsToDelete) {
        await deleteFirebaseAssessmentRecord(r.id);
      }
      for (const a of attendanceToDelete) {
        if (a.id) {
          await deleteFirebaseAttendance(a.id);
        }
      }

      showToast('info', 'تم التراجع عن التقييم', `تم مسح تقييم ${assessNum} للصف ${grade} فصل ${classNum} بنجاح.`);
    } catch (e) {
      console.error('Failed to delete assessment for class:', e);
      showToast('error', 'خطأ في المسح', 'حدث خطأ أثناء محاولة التراجع عن التقييم.');
    }
  };

  // Auto-Reminder for upcoming assessments (Toast & Local Push Notification)
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkAndShowReminders = async () => {
      const lastReminderDate = localStorage.getItem('last_assessment_reminder_date');
      const todayDate = new Date();
      const todayStr = todayDate.toDateString();

      if (lastReminderDate === todayStr) return; // Already shown today

      // Calculate upcoming/overdue assessments for current month
      const currentYear = todayDate.getFullYear();
      const currentMonthNum = todayDate.getMonth() + 1;
      const currentDay = todayDate.getDate();

      const currentMonthInfo = MONTHS_DATA.find(m => m.monthNumber === currentMonthNum);
      
      let upcomingOrOverdue = null;

      if (currentMonthInfo && currentMonthInfo.assessments.length > 0) {
        const count = currentMonthInfo.assessments.length;
        const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
        const periodLength = daysInMonth / count;

        for (let i = 0; i < count; i++) {
          const assessNum = currentMonthInfo.assessments[i];
          const originalDueDate = Math.round(periodLength * (i + 1));
          const dueDateDay = getAdjustedDueDate(currentYear, currentMonthNum, originalDueDate, teacher.officialHolidays || []);
          const daysLeft = dueDateDay - currentDay;

          // Find if this assessment has been recorded for ANY class in the current term/month
          const hasRecords = records.some(r => r.month_id === currentMonthInfo.id && r.assess_num === assessNum);

          if (!hasRecords) {
            if (daysLeft < 0) {
              upcomingOrOverdue = `التقييم ${assessNum} متأخر (كان مستحقاً يوم ${dueDateDay})`;
              break;
            } else if (daysLeft <= 3) {
              upcomingOrOverdue = `التقييم ${assessNum} مستحق قريباً (يوم ${dueDateDay})`;
              break;
            }
          }
        }
      }

      if (!upcomingOrOverdue) {
        // No urgent reminders today, mark as checked so we don't keep polling unnecessarily
        // Only set if we actually have records loaded, so we don't accidentally silence it if records took long to load
        if (records.length > 0) {
          localStorage.setItem('last_assessment_reminder_date', todayStr);
        }
        return;
      }

      // Request browser notification permission if not determined
      if (window.Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        try {
          await Notification.requestPermission();
        } catch (e) {
          console.error('Notification permission error:', e);
        }
      }

      const message = `🔔 تنبيه استباقي: ${upcomingOrOverdue}. يرجى إنجازه في أقرب وقت.`;

      // Show in-app Toast
      setToast({
        type: 'info',
        message: message,
      });

      // Show Browser Push Notification
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('سجل التقييمات المدرسية', {
          body: message,
          icon: 'https://cdn-icons-png.flaticon.com/512/3234/3234972.png',
        });
      }

      localStorage.setItem('last_assessment_reminder_date', todayStr);
    };

    const timer = setTimeout(checkAndShowReminders, 4000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, records]);

  const handleLogin = (phone: string, managementData?: ManagementLoginData) => {
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    if (!teacher.phone) {
      setTeacher({ ...teacher, phone });
      localStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify({ ...teacher, phone }));
    }

    if (managementData?.isManagement) {
      const sessionData: ManagementSessionData = {
        isManagement: true,
        role: managementData.role,
        pinCode: managementData.pinCode,
        subject: managementData.subject,
        phone,
      };
      setManagementSession(sessionData);
      setActiveTab('admin');
    } else {
      setManagementSession(null);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setManagementSession(null);
    localStorage.setItem(AUTH_STORAGE_KEY, 'false');
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#fafcff] text-slate-800 font-['Tajawal',sans-serif] pb-16 dir-rtl transition-colors duration-200">
      
      {/* Opening Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Top Navbar with Screen Tabs - Hide on Home Screen */}
      {activeTab !== 'home' && (
        <Navbar
          teacher={teacher}
          totalRecordsCount={records.length}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenProfile={() => setIsProfileOpen(true)}
          isFirebaseConnected={isFirebaseConnected}
          onLogout={handleLogout}
        />
      )}

      {/* Main Screen Container */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-3 sm:pt-6 space-y-3 sm:space-y-6">
        
        {/* HOME SCREEN */}
        {activeTab === 'home' && (
          <HomeScreen 
            onNavigate={setActiveTab} 
            teacher={teacher} 
            onOpenProfile={() => setIsProfileOpen(true)}
            records={records}
            selectedTerm={selectedTerm}
            academicYear={academicYear}
            onOpenAssessment={(month, num, term) => {
              setSelectedTerm(term);
              setSelectedMonth(month);
              setActiveAssessNum(num);
              setActiveTab('assessments');
            }}
            onLogout={handleLogout}
            reminders={reminders}
            onOpenRemindersModal={() => setIsRemindersModalOpen(true)}
            onToggleReminderComplete={handleToggleReminderComplete}
          />
        )}

        {/* SCREEN 1: التقييمات (Assessments View) */}
        {activeTab === 'assessments' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="max-w-4xl mx-auto">
              <TermProgress
                selectedTerm={selectedTerm}
                academicYear={academicYear}
                monthAssessmentCounts={monthAssessmentCounts}
                records={records}
                selectedMonth={selectedMonth}
              />
            </div>
            <div className="max-w-4xl mx-auto shadow-sm rounded-xl">
              {/* Academic Year, Term & Month Selector Bar */}
              <ControlBar
                academicYear={academicYear}
                onAcademicYearChange={handleAcademicYearChange}
                selectedTerm={selectedTerm}
                onTermChange={setSelectedTerm}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                selectedMonthCount={monthAssessmentCounts[selectedMonth.id] || 0}
                onMonthCountChange={handleMonthCountChange}
              />

              {/* 12 Assessment Cards Grid */}
              <AssessmentGrid
                selectedMonth={dynamicSelectedMonth}
                records={records}
                onSelectAssessment={(num) => setActiveAssessNum(num)}
                academicYear={academicYear}
                teacherId={teacher.id}
                teacher={teacher}
              />
              
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-rose-50/50 rounded-b-xl">
                <div className="flex items-center gap-2.5 text-rose-900 font-bold text-sm">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-rose-900">تصفير تقييمات الشهر</p>
                    <p className="text-xs font-medium text-rose-700">مسح كافة التقييمات وحضور الطلاب المسجل لشهر {dynamicSelectedMonth.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>تصفير تقييمات {dynamicSelectedMonth.name}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: الفصل وحضور الطلاب (Students & Classroom Roster) */}
        {activeTab === 'students' && (
          <div className="animate-fadeIn">
            <ClassRosterManager 
              records={records}
              selectedTerm={selectedTerm}
              selectedMonthId={selectedMonth.id}
              teacherId={teacher.id}
              isFirebaseConnected={isFirebaseConnected}
              onAddReminder={handleAddReminder}
              statusColors={statusColors}
              onDeleteRecordsForClass={(grade, classNum) => {
                setRecords(prev => prev.filter(r => !(r.grade === grade && r.class_num === classNum)));
              }}
            />
          </div>
        )}

        {/* SCREEN 3: الإحصائيات (Stats View) */}
        {activeTab === 'stats' && (
          <div className="animate-fadeIn space-y-6 pb-20">
            <ClassStats 
              records={records}
              selectedTerm={selectedTerm}
              teacher={teacher}
            />
            
            <div className="flex justify-center w-full">
              <div className="w-full max-w-2xl">
                <LateAssessments 
                  teacherId={teacher.id} 
                  records={records} 
                  selectedTerm={selectedTerm} 
                  academicYear={academicYear} 
                  onOpenAssessment={(month, num, term) => {
                    setSelectedTerm(term);
                    setSelectedMonth(month);
                    setActiveAssessNum(num);
                    setActiveTab('assessments');
                  }} 
                  officialHolidays={teacher.officialHolidays || []} 
                />
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 4: التقارير (Reports View) */}
        {activeTab === 'reports' && (
          <div className="animate-fadeIn">
            <StudentReportsScreen 
              records={records}
              selectedTerm={selectedTerm}
            />
          </div>
        )}

        {/* SCREEN 5: تخصيص الألوان (Settings & Color Customization) */}
        {activeTab === 'settings' && (
          <div className="animate-fadeIn">
            <SettingsScreen 
              statusColors={statusColors}
              onSaveStatusColors={handleSaveStatusColors}
              showToast={(type, title, message) => setToast({ id: Date.now().toString(), type, title, message })}
            />
          </div>
        )}

        {/* SCREEN 6: البحث (Search View) */}
        {activeTab === 'search' && (
          <div className="animate-fadeIn">
            <AssessmentSearch 
              records={records} 
              selectedTerm={selectedTerm} 
              teacherId={teacher.id}
              statusColors={statusColors}
            />
          </div>
        )}
        
        {/* SCREEN 6: الإدارة المدرسية (Admin View) */}
        {activeTab === 'admin' && (
          <div className="animate-fadeIn">
            <AdminDashboard
              onLogout={() => {
                setManagementSession(null);
                setActiveTab('home');
              }}
              managementData={managementSession}
            />
          </div>
        )}
      </main>

      
      {activeAssessNum && (
        <AssessmentModal
          isOpen={true}
          onClose={() => setActiveAssessNum(null)}
          assessNum={activeAssessNum}
          selectedMonth={dynamicSelectedMonth}
          academicYear={academicYear}
          selectedTerm={selectedTerm}
          teacherId={teacher.id}
          teacher={teacher}
          records={records}
          onSave={handleAssessmentSubmit}
          onDeleteAssessmentForClass={handleDeleteAssessmentForClass}
        />
      )}

      {/* Confirmation Modal for Resetting Month Assessments */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowResetConfirmModal(false)}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-2">
              تصفير تقييمات شهر {dynamicSelectedMonth.name}
            </h3>

            <p className="text-sm font-medium text-slate-600 mb-6 leading-relaxed">
              هل أنت متأكد من مسح جميع التقييمات المسجلة وحضور الطلاب لهذا الشهر (شهر {dynamicSelectedMonth.name})؟ سيتم حذف كافة السجلات التابعة من قاعدة البيانات المحلية والمزامنة، ولا يمكن التراجع عن هذه الخطوة.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetAssessmentsForMonth}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، مسح وتصفير الكل</span>
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Teacher Profile & DB Settings */}
      <TeacherProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        teacher={teacher}
        onSaveTeacher={handleSaveTeacher}
        onRefreshData={loadData}
      />

      {/* Modal: Custom Reminders & Overdue Assessments */}
      <RemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        reminders={reminders}
        onAddReminder={handleAddReminder}
        onDeleteReminder={handleDeleteReminder}
        onToggleComplete={handleToggleReminderComplete}
        students={(() => {
          try {
            const saved = localStorage.getItem('school_assessments_students_roster_v1');
            if (saved) return JSON.parse(saved);
          } catch (e) {}
          return [];
        })()}
        teacher={teacher}
        records={records}
        selectedTerm={selectedTerm}
        academicYear={academicYear}
        onOpenAssessment={(month, num, term) => {
          setSelectedTerm(term);
          setSelectedMonth(month);
          setActiveAssessNum(num);
          setActiveTab('assessments');
          setIsRemindersModalOpen(false);
        }}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

    </div>
  );
}
