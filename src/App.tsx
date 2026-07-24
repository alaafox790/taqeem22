import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ControlBar } from './components/ControlBar';
import { AssessmentGrid } from './components/AssessmentGrid';
import { AssessmentSearch } from './components/AssessmentSearch';
import { TermProgress } from './components/TermProgress';


import { ClassRosterManager } from './components/ClassRosterManager';
import { ClassStats } from './components/ClassStats';
import { LateAssessments } from './components/LateAssessments';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentReportsScreen } from './components/StudentReportsScreen';
import { AssessmentModal } from './components/AssessmentModal';
import { DuplicateConfirmModal } from './components/DuplicateConfirmModal';
import { TeacherProfileModal } from './components/TeacherProfileModal';
import { Toast, ToastMessage } from './components/Toast';
import { LoginScreen } from './components/LoginScreen';

import { HomeScreen } from './components/HomeScreen';

import { TeacherProfile, AssessmentRecord, MonthInfo, TermId, AppTab } from './types';
import { getAdjustedDueDate } from './lib/validation';
import { DEFAULT_TEACHER, DEFAULT_ACADEMIC_YEAR, MONTHS_DATA } from './lib/constants';
import {
  fetchFirebaseRecords,
  saveFirebaseAssessmentRecord,
  deleteFirebaseAssessmentRecord,
  testFirebaseConnection,
  fetchFirebaseAttendance,
  fetchFirebaseStudents,
  saveFirebaseTeacher,
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
    <div className="min-h-screen bg-[#fafcff] text-slate-800 font-['Tajawal',sans-serif] pb-16 dir-rtl transition-colors duration-200">
      
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

        {/* SCREEN 5: البحث (Search View) */}
        {activeTab === 'search' && (
          <div className="animate-fadeIn">
            <AssessmentSearch records={records} selectedTerm={selectedTerm} teacherId={teacher.id} />
          </div>
        )}
        
        {/* SCREEN 6: الإدارة المدرسية (Admin View) */}
        {activeTab === 'admin' && (
          <div className="animate-fadeIn">
            <AdminDashboard onLogout={() => setActiveTab('home')} />
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
