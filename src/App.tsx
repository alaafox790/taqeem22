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
import { MultiAssessmentModal } from './components/MultiAssessmentModal';
import { DuplicateConfirmModal } from './components/DuplicateConfirmModal';
import { TeacherProfileModal } from './components/TeacherProfileModal';
import { RemindersModal } from './components/RemindersModal';
import { TeacherMessagesModal } from './components/TeacherMessagesModal';
import { Toast, ToastMessage } from './components/Toast';
import { SnackbarReminder } from './components/SnackbarReminder';
import { LoginScreen, ManagementLoginData, StudentLoginData } from './components/LoginScreen';
import { StudentPortal } from './components/StudentPortal';

import { HomeScreen } from './components/HomeScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SplashScreen } from './components/SplashScreen';
import { ArchiveManagerModal } from './components/ArchiveManagerModal';
import { ClearAssessmentsModal, ClearAssessmentsOptions, isRecordInMonth, isRecordInMonthRange } from './components/ClearAssessmentsModal';
import { AnnualReportPdfModal } from './components/AnnualReportPdfModal';

import { TeacherProfile, AssessmentRecord, MonthInfo, TermId, AppTab, StatusColors, Reminder, Student, ArchivedTermItem } from './types';
import { playSuccessSoundAndVibrate, playAlertSoundAndVibrate } from './lib/sound';
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
  saveFirebaseReminder,
  fetchFirebaseReminders,
  deleteFirebaseReminder,
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
  const [studentSession, setStudentSession] = useState<StudentLoginData | null>(null);

  // Navigation tab state (4 screens + countdown)
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [hasShownCompleteToast, setHasShownCompleteToast] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

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

  // Archive state & Vault storage
  const ARCHIVED_TERMS_STORAGE_KEY = 'school_assessments_archived_terms_v1';
  const [archivedTermsList, setArchivedTermsList] = useState<ArchivedTermItem[]>(() => {
    try {
      const saved = localStorage.getItem(ARCHIVED_TERMS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState<boolean>(false);

  const handleArchiveTerm = (year: string, termId: TermId, grade?: string, classNum?: number) => {
    const isClassSpecific = !!grade && classNum !== undefined;
    const archivedId = isClassSpecific
      ? `${year}_${termId}_${grade}_${classNum}`
      : `${year}_${termId}`;

    const title = isClassSpecific
      ? `أرشيف الصف ${grade} (فصل ${classNum}) - ${termId === 'term1' ? 'الترم الأول' : 'الترم الثاني'}`
      : `أرشيف ${termId === 'term1' ? 'الفصل الدراسي الأول' : 'الفصل الدراسي الثاني'} (${year})`;

    const recordsToArchive = records.filter((r) => {
      if (r.academic_year !== year || r.term_id !== termId || r.is_archived) return false;
      if (isClassSpecific) {
        return r.grade === grade && r.class_num === classNum;
      }
      return true;
    });

    const updatedRecords = records.map((r) => {
      if (r.academic_year === year && r.term_id === termId && !r.is_archived) {
        if (!isClassSpecific || (r.grade === grade && r.class_num === classNum)) {
          const archivedRec = { ...r, is_archived: true, archived_at: new Date().toLocaleDateString('ar-EG') };
          saveFirebaseAssessmentRecord(archivedRec).catch(console.error);
          return archivedRec;
        }
      }
      return r;
    });

    setRecords(updatedRecords);

    const newItem: ArchivedTermItem = {
      id: archivedId,
      academicYear: year,
      termId,
      grade,
      classNum,
      archivedAt: new Date().toLocaleDateString('ar-EG'),
      title,
      recordsCount: recordsToArchive.length,
    };

    const updatedList = [newItem, ...archivedTermsList.filter((item) => item.id !== archivedId)];
    setArchivedTermsList(updatedList);
    localStorage.setItem(ARCHIVED_TERMS_STORAGE_KEY, JSON.stringify(updatedList));
  };

  const handleUnarchiveTerm = (archivedItemId: string, year: string, termId: TermId, grade?: string, classNum?: number) => {
    const isClassSpecific = !!grade && classNum !== undefined;

    const updatedRecords = records.map((r) => {
      if (r.academic_year === year && r.term_id === termId && r.is_archived) {
        if (!isClassSpecific || (r.grade === grade && r.class_num === classNum)) {
          const restoredRec = { ...r, is_archived: false };
          saveFirebaseAssessmentRecord(restoredRec).catch(console.error);
          return restoredRec;
        }
      }
      return r;
    });

    setRecords(updatedRecords);

    const updatedList = archivedTermsList.filter((item) => item.id !== archivedItemId);
    setArchivedTermsList(updatedList);
    localStorage.setItem(ARCHIVED_TERMS_STORAGE_KEY, JSON.stringify(updatedList));
  };

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
  const [isTeacherMessagesModalOpen, setIsTeacherMessagesModalOpen] = useState(false);
  const [isAppAnnualReportOpen, setIsAppAnnualReportOpen] = useState(false);
  const [appAnnualGrade, setAppAnnualGrade] = useState<string>('الأول');
  const [appAnnualClassNum, setAppAnnualClassNum] = useState<number | ''>(1);

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
    saveFirebaseReminder(reminder, teacher.id || 'default_teacher').catch(console.error);
    showToast('success', 'تم إضافة التنبيه', 'تم جدولة التنبيه بنجاح ونشره للطالب والمعلم.');
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updated));
    deleteFirebaseReminder(id).catch(console.error);
    showToast('info', 'تم حذف التنبيه', 'تم إزالة التنبيه من القائمة.');
  };

  const handleToggleReminderComplete = (id: string) => {
    let updatedItem: Reminder | undefined;
    const updated = reminders.map(r => {
      if (r.id === id) {
        updatedItem = { ...r, isCompleted: !r.isCompleted };
        return updatedItem;
      }
      return r;
    });
    setReminders(updated);
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updated));
    if (updatedItem) {
      saveFirebaseReminder(updatedItem, teacher.id || 'default_teacher').catch(console.error);
    }
  };

  // Modal UI states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeAssessNum, setActiveAssessNum] = useState<number | null>(null);
  const [activeMultiAssessNums, setActiveMultiAssessNums] = useState<number[] | null>(null);
  const [multiActionMode, setMultiActionMode] = useState<'record' | 'delete' | null>(null);

  // Duplicate Check Modal state
  const [duplicateModal, setDuplicateModal] = useState<{
    isOpen: boolean;
    existingRecord?: AssessmentRecord;
    pendingRecord?: Partial<AssessmentRecord>;
  }>({ isOpen: false });

  // Toast Notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  // Test Firebase on startup
  const loadData = useCallback(async () => {
    try {
      const firebaseData = await fetchFirebaseRecords(teacher.id, teacher.phone);
      if (firebaseData) {
        setRecords(firebaseData);
      }
      
      const firebaseReminders = await fetchFirebaseReminders(teacher.id, teacher.phone);
      if (firebaseReminders && firebaseReminders.length > 0) {
        setReminders(prev => {
          const map = new Map<string, Reminder>();
          prev.forEach(r => map.set(r.id, r));
          firebaseReminders.forEach(r => map.set(r.id, r));
          const merged = Array.from(map.values());
          localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        });
      }
    } catch (err) {
      console.error('Error fetching records or reminders:', err);
    }

    setIsFirebaseConnected(true);
  }, [teacher.id, teacher.phone]);
  useEffect(() => {
    const handlePromptReady = () => setIsInstallable(true);
    const handleAppInstalled = () => setIsInstallable(false);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    } else if ((window as any).deferredPrompt) {
      setIsInstallable(true);
    }

    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

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
    if (type === 'success') {
      playSuccessSoundAndVibrate();
    } else if (type === 'error' || title.includes('تنبيه') || title.includes('مكرر') || title.includes('متأخر')) {
      playAlertSoundAndVibrate();
    }
  };

  // Handler: Attempting to save an assessment record
  const handleAssessmentSubmit = (
    partialRecord: Partial<AssessmentRecord>,
    isExceptionalConfirmed?: boolean,
    keepOpen?: boolean
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

    executeSaveRecord(partialRecord, undefined, isExceptionalConfirmed, keepOpen);
  };

  // Execute Save Record
  const executeSaveRecord = async (
    recordData: Partial<AssessmentRecord>,
    existingIdToReplace?: string,
    isExceptionalConfirmed?: boolean,
    keepOpen?: boolean
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
      if (!keepOpen) {
        setActiveAssessNum(null);
      }
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

  const handleExecuteCustomClearAssessmentRecords = async (
    options: ClearAssessmentsOptions,
    countToDelete: number
  ) => {
    try {
      const { clearScope, singleMonthId, startMonthId, endMonthId, termFilter, gradeFilter } = options;

      // Filter matching assessment records to delete
      const recordsToDelete = records.filter((r) => {
        if (termFilter !== 'all' && r.term_id !== termFilter) return false;
        if (gradeFilter !== 'all' && r.grade !== gradeFilter) return false;

        if (clearScope === 'all') return true;
        if (clearScope === 'single') return isRecordInMonth(r, singleMonthId);
        if (clearScope === 'range') return isRecordInMonthRange(r, startMonthId, endMonthId);

        return true;
      });

      const idsToDelete = new Set(recordsToDelete.map((r) => r.id));
      const newRecords = records.filter((r) => !idsToDelete.has(r.id));
      setRecords(newRecords);

      // Save updated records in localStorage
      const ARCHIVE_STORAGE_KEY = 'school_assessments_archive_v1';
      localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(newRecords));

      // Delete matching attendance entries
      const ATTENDANCE_STORAGE_KEY = 'school_assessments_attendance_v1';
      let localAttendance: any[] = [];
      try {
        const saved = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
        if (saved) localAttendance = JSON.parse(saved);
      } catch (e) {}

      const targetMonthIds = new Set<string>();
      if (clearScope === 'single') {
        targetMonthIds.add(singleMonthId);
      } else if (clearScope === 'range') {
        const sIdx = MONTHS_DATA.findIndex((m) => m.id === startMonthId);
        const eIdx = MONTHS_DATA.findIndex((m) => m.id === endMonthId);
        if (sIdx !== -1 && eIdx !== -1) {
          const minIdx = Math.min(sIdx, eIdx);
          const maxIdx = Math.max(sIdx, eIdx);
          MONTHS_DATA.slice(minIdx, maxIdx + 1).forEach((m) => targetMonthIds.add(m.id));
        }
      }

      const attendanceToDelete = localAttendance.filter((a) => {
        if (gradeFilter !== 'all' && a.grade !== gradeFilter) return false;

        if (clearScope === 'all') return true;

        if (clearScope === 'single' || clearScope === 'range') {
          if (targetMonthIds.has(a.month_id)) return true;
          const matchedMonth = MONTHS_DATA.find((m) => targetMonthIds.has(m.id));
          if (matchedMonth && matchedMonth.assessments.includes(a.assess_num)) return true;
        }
        return false;
      });

      const attIdsToDelete = new Set(attendanceToDelete.map((a) => a.id).filter(Boolean));
      const newAttendance = localAttendance.filter((a) => !a.id || !attIdsToDelete.has(a.id));
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(newAttendance));

      window.dispatchEvent(new Event('roster_updated'));

      // Firebase Firestore deletions
      for (const r of recordsToDelete) {
        await deleteFirebaseAssessmentRecord(r.id);
      }
      for (const a of attendanceToDelete) {
        if (a.id) {
          await deleteFirebaseAttendance(a.id);
        }
      }

      setShowResetConfirmModal(false);

      let scopeLabel = 'كافة الشهور والتقييمات';
      if (clearScope === 'single') {
        const mName = MONTHS_DATA.find((m) => m.id === singleMonthId)?.name || 'المحدد';
        scopeLabel = `شهر ${mName}`;
      } else if (clearScope === 'range') {
        const sName = MONTHS_DATA.find((m) => m.id === startMonthId)?.name.split(' ')[0] || '';
        const eName = MONTHS_DATA.find((m) => m.id === endMonthId)?.name.split(' ')[0] || '';
        scopeLabel = `المدة من ${sName} إلى ${eName}`;
      }

      showToast(
        'success',
        'تم مسح وتصفير التقييمات بنجاح 🗑️',
        `تم مسح (${recordsToDelete.length}) سجل تقييم وحضور لـ (${scopeLabel}) نهائياً.`
      );
    } catch (e) {
      console.error('Failed to execute custom clear:', e);
      showToast('error', 'خطأ في المسح', 'حدث خطأ أثناء محاولة مسح التقييمات.');
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

  const handleMultiAssessmentSubmit = async (recordsToSave: Partial<AssessmentRecord>[]) => {
    let successCount = 0;
    for (const record of recordsToSave) {
      const finalRecord: AssessmentRecord = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        teacher_id: record.teacher_id!,
        academic_year: record.academic_year!,
        term_id: record.term_id!,
        month_id: record.month_id!,
        assess_num: record.assess_num!,
        grade: record.grade!,
        class_num: record.class_num!,
        assess_date: record.assess_date!,
        notes: record.notes || '',
        created_at: new Date().toISOString(),
        timing_status: record.timing_status || 'normal',
        timing_period: record.timing_period || 'start',
        model_form: record.model_form || 'أ',
      };
      
      const fbRes = await saveFirebaseAssessmentRecord(finalRecord);
      if (fbRes.success) successCount++;
    }

    await loadData();
    setActiveMultiAssessNums(null);
    setMultiActionMode(null);
    
    if (successCount > 0) {
      showToast('success', 'تم التسجيل المتعدد', `تم حفظ ${successCount} تقييم(ات) بنجاح.`);
    } else {
      showToast('error', 'فشل التسجيل المتعدد', 'تعذر حفظ التقييمات.');
    }
  };

  const handleMultiDeleteAssessment = async (grade: string, classNum: number, assessNums: number[]) => {
    try {
      const recordsToDelete = records.filter(
        r => r.grade === grade && r.class_num === classNum && assessNums.includes(r.assess_num) && r.term_id === selectedTerm
      );
      
      if (recordsToDelete.length === 0) {
        showToast('info', 'لا يوجد ما يُحذف', 'التقييمات المحددة غير مسجلة لهذا الفصل.');
        setActiveMultiAssessNums(null);
        setMultiActionMode(null);
        return;
      }

      const newRecords = records.filter(
        r => !(r.grade === grade && r.class_num === classNum && assessNums.includes(r.assess_num) && r.term_id === selectedTerm)
      );
      setRecords(newRecords);

      const ARCHIVE_STORAGE_KEY = 'school_assessments_archive_v1';
      localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(newRecords));

      for (const r of recordsToDelete) {
        await deleteFirebaseAssessmentRecord(r.id);
      }
      
      showToast('info', 'تم التراجع الجماعي', `تم مسح ${recordsToDelete.length} تقييم(ات) للصف ${grade} فصل ${classNum} بنجاح.`);
    } catch (e) {
      console.error('Failed to delete multiple assessments:', e);
      showToast('error', 'خطأ في المسح المتعدد', 'حدث خطأ أثناء محاولة التراجع عن التقييمات.');
    } finally {
      setActiveMultiAssessNums(null);
      setMultiActionMode(null);
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

      // Show in-app custom Snackbar Reminder
      setReminderMessage(message);

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

  const handleLogin = (
    phone: string, 
    managementData?: ManagementLoginData,
    studentData?: StudentLoginData
  ) => {
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');

    if (studentData?.isStudent) {
      setStudentSession(studentData);
      setManagementSession(null);
    } else if (managementData?.isManagement) {
      setStudentSession(null);
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
      setStudentSession(null);
      setManagementSession(null);
      if (!teacher.phone) {
        setTeacher({ ...teacher, phone });
        localStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify({ ...teacher, phone }));
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setManagementSession(null);
    setStudentSession(null);
    localStorage.setItem(AUTH_STORAGE_KEY, 'false');
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (studentSession) {
    return (
      <StudentPortal
        phone={studentSession.phone}
        studentCode={studentSession.studentCode}
        teacher={teacher}
        academicYear={academicYear}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#fafcff] text-slate-800 font-['Tajawal',sans-serif] pb-16 dir-rtl transition-colors duration-200">
      
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
          onOpenArchive={() => setIsArchiveModalOpen(true)}
          onOpenStudentMessages={() => setIsTeacherMessagesModalOpen(true)}
          isFirebaseConnected={isFirebaseConnected}
          onLogout={handleLogout}
          isInstallable={isInstallable}
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
            onOpenArchive={() => setIsArchiveModalOpen(true)}
            onOpenStudentMessages={() => setIsTeacherMessagesModalOpen(true)}
            records={records}
            selectedTerm={selectedTerm}
            academicYear={academicYear}
            isInstallable={isInstallable}
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
                showToast={showToast}
                onMultiAction={(nums, action) => {
                  setActiveMultiAssessNums(nums);
                  setMultiActionMode(action);
                }}
              />
              
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-rose-50/50 rounded-b-xl">
                <div className="flex items-center gap-2.5 text-rose-900 font-bold text-sm">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-rose-900">مسح وتصفير التقييمات المخصص</p>
                    <p className="text-xs font-medium text-rose-700">مسح الشهور بالكامل، شهر معين، أو نطاق شهور مخصص من وإلى</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>تصفير ومسح التقييمات...</span>
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
              onAddReminder={handleAddReminder}
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
              teacher={teacher}
              onOpenStudentMessages={() => setIsTeacherMessagesModalOpen(true)}
            />
          </div>
        )}

        {/* SCREEN 5: تخصيص الألوان والنسخ الاحتياطي (Settings & Cloud Sync) */}
        {activeTab === 'settings' && (
          <div className="animate-fadeIn">
            <SettingsScreen 
              statusColors={statusColors}
              onSaveStatusColors={handleSaveStatusColors}
              onOpenArchive={() => setIsArchiveModalOpen(true)}
              onOpenCustomClearModal={() => setShowResetConfirmModal(true)}
              archivedCount={archivedTermsList.length}
              showToast={(type, title, message) => setToast({ id: Date.now().toString(), type, title, message })}
              records={records}
              teacher={teacher}
              isFirebaseConnected={isFirebaseConnected}
              onManualCloudSync={async () => {
                await testFirebaseConnection();
              }}
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

      {activeMultiAssessNums && multiActionMode && (
        <MultiAssessmentModal
          isOpen={true}
          onClose={() => {
            setActiveMultiAssessNums(null);
            setMultiActionMode(null);
          }}
          assessNums={activeMultiAssessNums}
          mode={multiActionMode}
          selectedMonth={dynamicSelectedMonth}
          academicYear={academicYear}
          selectedTerm={selectedTerm}
          teacherId={teacher.id}
          teacher={teacher}
          records={records}
          onSaveMultiple={handleMultiAssessmentSubmit}
          onDeleteMultiple={handleMultiDeleteAssessment}
        />
      )}

      {/* Modal for Custom Clear Assessments */}
      <ClearAssessmentsModal
        isOpen={showResetConfirmModal}
        onClose={() => setShowResetConfirmModal(false)}
        records={records}
        selectedTerm={selectedTerm}
        defaultMonthId={selectedMonth.id}
        onConfirmClear={handleExecuteCustomClearAssessmentRecords}
      />

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

      {/* Modal: Archive Vault & Manager */}
      <ArchiveManagerModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        academicYear={academicYear}
        selectedTerm={selectedTerm}
        records={records}
        archivedTermsList={archivedTermsList}
        onArchiveTerm={handleArchiveTerm}
        onUnarchiveTerm={handleUnarchiveTerm}
        showToast={(type, title, message) => setToast({ id: Date.now().toString(), type, title, message })}
      />

      {/* Modal: Teacher In-App Student Messages */}
      <TeacherMessagesModal
        isOpen={isTeacherMessagesModalOpen}
        onClose={() => setIsTeacherMessagesModalOpen(false)}
        teacher={teacher}
      />

      {/* Modal: Annual Cumulative PDF Report */}
      <AnnualReportPdfModal
        isOpen={isAppAnnualReportOpen}
        onClose={() => setIsAppAnnualReportOpen(false)}
        selectedGrade={appAnnualGrade}
        selectedClassNum={appAnnualClassNum}
        records={records}
        teacher={teacher}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      {reminderMessage && (
        <SnackbarReminder 
          message={reminderMessage} 
          onDismiss={() => setReminderMessage(null)} 
          duration={15000} 
        />
      )}

    </div>
  );
}
