import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ControlBar } from './components/ControlBar';
import { AssessmentGrid } from './components/AssessmentGrid';
import { ClassRosterManager } from './components/ClassRosterManager';
import { ClassStats } from './components/ClassStats';
import { AssessmentModal } from './components/AssessmentModal';
import { DuplicateConfirmModal } from './components/DuplicateConfirmModal';
import { TeacherProfileModal } from './components/TeacherProfileModal';
import { Toast, ToastMessage } from './components/Toast';
import { LoginScreen } from './components/LoginScreen';

import { HomeScreen } from './components/HomeScreen';

import { TeacherProfile, AssessmentRecord, MonthInfo, TermId, AppTab } from './types';
import { DEFAULT_TEACHER, DEFAULT_ACADEMIC_YEAR, MONTHS_DATA } from './lib/constants';
import {
  fetchFirebaseRecords,
  saveFirebaseAssessmentRecord,
  deleteFirebaseAssessmentRecord,
  testFirebaseConnection,
  fetchFirebaseAttendance,
  fetchFirebaseStudents,
} from './lib/firebase';

const AUTH_STORAGE_KEY = 'school_assessments_auth_v1';
const TEACHER_STORAGE_KEY = 'school_assessments_teacher_profile';
const YEAR_STORAGE_KEY = 'school_assessments_academic_year';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });

  // Navigation tab state (4 screens + countdown)
  const [activeTab, setActiveTab] = useState<AppTab>('home');

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
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  // Load records from Firebase
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
    loadData();
  }, [loadData]);

  // Handler: Update teacher profile
  const handleSaveTeacher = (updated: TeacherProfile) => {
    setTeacher(updated);
    localStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify(updated));
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

  // Auto-Reminder for upcoming assessments (Toast & Local Push Notification)
  useEffect(() => {
    const checkAndShowReminders = async () => {
      const lastReminderDate = localStorage.getItem('last_assessment_reminder_date');
      const today = new Date().toDateString();

      if (lastReminderDate === today) return; // Already shown today

      // Request browser notification permission if not determined
      if (window.Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        try {
          await Notification.requestPermission();
        } catch (e) {
          console.error('Notification permission error:', e);
        }
      }

      // Show in-app Toast
      setToast({
        type: 'info',
        message: '🔔 تذكير: لديك تقييمات قادمة يجب إنجازها خلال الـ 48 ساعة القادمة للحفاظ على مؤشر الالتزام.',
      });

      // Show Browser Push Notification
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('سجل التقييمات المدرسية', {
          body: 'تذكير: لديك تقييمات قادمة يرجى إنجازها خلال الـ 48 ساعة القادمة للفصول غير المنجزة.',
          icon: 'https://cdn-icons-png.flaticon.com/512/3234/3234972.png', // Fallback generic icon
        });
      }

      localStorage.setItem('last_assessment_reminder_date', today);
    };

    const timer = setTimeout(checkAndShowReminders, 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (phone: string) => {
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    // Save phone to profile optionally if wanted, or just skip
    if (!teacher.phone) {
      setTeacher({ ...teacher, phone });
      localStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify({ ...teacher, phone }));
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-slate-800 font-['Tajawal',sans-serif] pb-16 dir-rtl transition-colors duration-200">
      
      {/* Top Navbar with Screen Tabs - Hide on Home Screen */}
      {activeTab !== 'home' && (
        <Navbar
          teacher={teacher}
          totalRecordsCount={records.length}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenProfile={() => setIsProfileOpen(true)}
          isFirebaseConnected={isFirebaseConnected}
        />
      )}

      {/* Main Screen Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* HOME SCREEN */}
        {activeTab === 'home' && (
          <HomeScreen onNavigate={setActiveTab} />
        )}

        {/* SCREEN 1: التقييمات (Assessments View) */}
        {activeTab === 'assessments' && (
          <div className="space-y-6 animate-fadeIn">
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
              />
            </div>

            {/* Dashboard Stats */}
            

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
            />
          </div>
        )}


        {/* SCREEN 3: الإحصائيات (Stats View) */}
        {activeTab === 'stats' && (
          <div className="animate-fadeIn">
            <ClassStats 
              records={records}
              selectedTerm={selectedTerm}
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
          onSave={handleAssessmentSubmit}
        />
      )}

      {/* Modal: Teacher Profile & DB Settings */}
      <TeacherProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        teacher={teacher}
        onSaveTeacher={handleSaveTeacher}
        onRefreshData={loadData}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

    </div>
  );
}
