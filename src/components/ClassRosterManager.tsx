import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Trash2,
  Check,
  X,
  Minus,
  Lock,
  AlertTriangle,
  Search,
  Filter,
  Edit3,
  Mic,
  Settings,
  Palette,
  Star,
  Heart,
  Target,
  Flag,
  Book,
  BookOpen,
  Award,
  Sparkles,
  Smile,
  UserPlus,
  Maximize2,
  Minimize2,
  Zap,
  Cloud,
  CloudOff,
  Loader2,
  Download,
  Printer,
  Image,
  Eye,
  EyeOff,
  Users,
  CheckCircle2,
  User
} from 'lucide-react';
import { Student, TermId, StudentAttendance, AttendanceStatus, AssessmentRecord, StatusColors } from '../types';
import { GRADES, CLASSES_COUNT, MONTHS_DATA } from '../lib/constants';
import { DEFAULT_STATUS_COLORS } from '../lib/statusColors';
import { saveFirebaseAttendance, saveFirebaseStudent, deleteFirebaseStudent, deleteFirebaseAttendance, deleteFirebaseAssessmentRecord } from '../lib/firebase';
import * as XLSX from 'xlsx';
import { toPng } from 'html-to-image';
import { StudentProfileDashboard } from './StudentProfileDashboard';

interface ClassRosterManagerProps {
  selectedTerm: TermId;
  records: AssessmentRecord[];
  selectedMonthId: string;
  teacherId: string;
  isFirebaseConnected?: boolean;
  onDeleteRecordsForClass?: (grade: string, classNum: number) => void;
  statusColors?: StatusColors;
  onAddReminder?: (reminder: { title: string; description?: string; targetType: 'student' | 'class' | 'general'; targetName?: string; reminderDate: string }) => void;
}

const ROSTER_STORAGE_KEY = 'school_assessments_students_roster_v1';
const ATTENDANCE_STORAGE_KEY = 'school_assessments_attendance_v1';


export const ClassRosterManager: React.FC<ClassRosterManagerProps> = ({ selectedTerm, records, selectedMonthId, teacherId, isFirebaseConnected, onDeleteRecordsForClass, statusColors = DEFAULT_STATUS_COLORS, onAddReminder }) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Search and Filter
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');

  // Selected Grade & Class
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    return localStorage.getItem('school_pinned_grade') || '';
  });
  const [selectedClassNum, setSelectedClassNum] = useState<number | ''>(() => {
    const pinned = localStorage.getItem('school_pinned_class');
    return pinned ? Number(pinned) : '';
  });
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    return localStorage.getItem('school_is_pinned') === 'true';
  });

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsPinned(checked);
    if (checked) {
      localStorage.setItem('school_is_pinned', 'true');
      localStorage.setItem('school_pinned_grade', selectedGrade);
      localStorage.setItem('school_pinned_class', selectedClassNum.toString());
    } else {
      localStorage.setItem('school_is_pinned', 'false');
      localStorage.removeItem('school_pinned_grade');
      localStorage.removeItem('school_pinned_class');
    }
  };

  useEffect(() => {
    if (isPinned) {
      localStorage.setItem('school_pinned_grade', selectedGrade);
      localStorage.setItem('school_pinned_class', selectedClassNum.toString());
    }
  }, [selectedGrade, selectedClassNum, isPinned]);

  // Class Appearance state
  const [classAppearances, setClassAppearances] = useState<Record<string, { color: string, icon: string }>>(() => {
    try {
      const saved = localStorage.getItem('school_class_appearances');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);

  useEffect(() => {
    localStorage.setItem('school_class_appearances', JSON.stringify(classAppearances));
  }, [classAppearances]);

  const classKey = `${selectedGrade}_${selectedClassNum}`;
  const currentAppearance = classAppearances[classKey] || { color: 'bg-slate-100 text-slate-800', icon: 'FileText' };

  // Helper to render icon
  const renderIcon = (iconName: string, className: string = "w-4 h-4") => {
    switch(iconName) {
      case 'Star': return <Star className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Target': return <Target className={className} />;
      case 'Flag': return <Flag className={className} />;
      case 'Book': return <Book className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Smile': return <Smile className={className} />;
      default: return <FileText className={className} />;
    }
  };

  const appearanceColors = [
    { id: 'bg-slate-100 text-slate-800 border-slate-200', label: 'رمادي' },
    { id: 'bg-blue-100 text-blue-800 border-blue-200', label: 'أزرق' },
    { id: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'أخضر' },
    { id: 'bg-amber-100 text-amber-800 border-amber-200', label: 'برتقالي' },
    { id: 'bg-rose-100 text-rose-800 border-rose-200', label: 'أحمر' },
    { id: 'bg-purple-100 text-purple-800 border-purple-200', label: 'بنفسجي' },
    { id: 'bg-pink-100 text-pink-800 border-pink-200', label: 'وردي' },
    { id: 'bg-teal-100 text-teal-800 border-teal-200', label: 'فيروزي' },
  ];

  const appearanceIcons = ['FileText', 'Star', 'Heart', 'Target', 'Flag', 'Book', 'Award', 'Sparkles', 'Smile'];

  // Students list state
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(ROSTER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Attendance state
  const [attendance, setAttendance] = useState<StudentAttendance[]>(() => {
    try {
      const saved = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Modal & Focus Mode State
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [showModelDistribution, setShowModelDistribution] = useState(false);
  const [showAllAssessments, setShowAllAssessments] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [religion, setReligion] = useState<'مسلم' | 'مسيحي'>('مسلم');
  const [status, setStatus] = useState<'مستجد' | 'باق'>('مستجد');

  // Delete Modal State
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isListeningAdd, setIsListeningAdd] = useState(false);
  const [isListeningEdit, setIsListeningEdit] = useState(false);

  type ControlTab = 'students' | 'display' | 'tools';
  const [activeControlTab, setActiveControlTab] = useState<ControlTab>('students');

  // Clear All Assessments Checkbox & Warning Modal State
  const [isClearAssessmentsChecked, setIsClearAssessmentsChecked] = useState(false);
  const [showClearAssessmentsWarning, setShowClearAssessmentsWarning] = useState(false);

  // Model Distribution States
  const [isRandomDistribution, setIsRandomDistribution] = useState<boolean>(() => {
    return localStorage.getItem('school_is_random_model_distribution') === 'true';
  });
  const [showModelsInTable, setShowModelsInTable] = useState<boolean>(() => {
    const saved = localStorage.getItem('school_show_models_in_table');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('school_is_random_model_distribution', isRandomDistribution.toString());
  }, [isRandomDistribution]);

  useEffect(() => {
    localStorage.setItem('school_show_models_in_table', showModelsInTable.toString());
  }, [showModelsInTable]);

  // Model calculation helper
  const getStudentModel = (studentId: string, serialNumber: number, assessNum: number, isRandom: boolean) => {
    if (!isRandom) {
      if (serialNumber <= 20) return 'أ';
      if (serialNumber <= 35) return 'ب';
      return 'ج';
    } else {
      let hash = 0;
      const key = `${studentId}_assess_${assessNum}`;
      for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash |= 0;
      }
      const models = ['أ', 'ب', 'ج'];
      return models[Math.abs(hash) % 3];
    }
  };

  // Batch Attendance Actions State
  const [batchTargetAssessNum, setBatchTargetAssessNum] = useState<number>(1);

  const handleBatchAttendance = async (targetStatus: 'present' | 'absent') => {
    if (!selectedGrade || !selectedClassNum || classStudents.length === 0) {
      setErrorMessage('يرجى اختيار الصف والفصل والتأكد من وجود طلاب أولاً.');
      return;
    }

    const targetNum = batchTargetAssessNum;
    const updatedRecordsToSave: StudentAttendance[] = [];

    setAttendance((prev) => {
      let updated = [...prev];

      classStudents.forEach((student) => {
        const existingIdx = updated.findIndex(
          (a) =>
            a.student_id === student.id &&
            a.assess_num === targetNum &&
            a.month_id === selectedTerm
        );

        const recId = existingIdx >= 0 ? updated[existingIdx].id : crypto.randomUUID();
        const record: StudentAttendance = {
          id: recId,
          student_id: student.id,
          student_name: student.name,
          grade: selectedGrade,
          class_num: Number(selectedClassNum),
          month_id: selectedTerm,
          assess_num: targetNum,
          status: targetStatus,
          updated_at: new Date().toISOString(),
          teacher_id: teacherId,
        };

        updatedRecordsToSave.push(record);

        if (existingIdx >= 0) {
          updated[existingIdx] = record;
        } else {
          updated.push(record);
        }
      });

      return updated;
    });

    if (isFirebaseConnected && updatedRecordsToSave.length > 0) {
      setSyncStatus('syncing');
      try {
        await Promise.all(updatedRecordsToSave.map((r) => saveFirebaseAttendance(r)));
        setSyncStatus('idle');
      } catch (e) {
        console.error('Failed batch sync', e);
        setSyncStatus('error');
      }
    }
  };

  const handleClearAssessmentsCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      if (!selectedGrade || !selectedClassNum) {
        setErrorMessage('يرجى اختيار الصف والفصل أولاً قبل إلغاء التقييمات.');
        return;
      }
      setShowClearAssessmentsWarning(true);
    } else {
      setIsClearAssessmentsChecked(false);
    }
  };

  const confirmClearAllAssessments = async () => {
    const classNum = Number(selectedClassNum);
    const recordsToDelete = attendance.filter(
      (a) => a.grade === selectedGrade && a.class_num === classNum
    );
    const assessmentDocsToDelete = records.filter(
      (r) => r.grade === selectedGrade && r.class_num === classNum
    );

    setAttendance((prev) =>
      prev.filter(
        (a) =>
          !(a.grade === selectedGrade && a.class_num === classNum)
      )
    );
    setIsClearAssessmentsChecked(true);
    setShowClearAssessmentsWarning(false);

    if (onDeleteRecordsForClass) {
      onDeleteRecordsForClass(selectedGrade, classNum);
    }

    if (isFirebaseConnected) {
      setSyncStatus('syncing');
      try {
        await Promise.all([
          ...recordsToDelete.map((r) => deleteFirebaseAttendance(r.id)),
          ...assessmentDocsToDelete.map((doc) => deleteFirebaseAssessmentRecord(doc.id))
        ]);
        setSyncStatus('idle');
      } catch (e) {
        console.error('Failed to delete attendance from Firebase', e);
        setSyncStatus('error');
      }
    }

    window.dispatchEvent(new Event('roster_updated'));
  };

  const cancelClearAllAssessments = () => {
    setIsClearAssessmentsChecked(false);
    setShowClearAssessmentsWarning(false);
  };

  const handleVoiceInput = (setter: (val: string) => void, setListening: (val: boolean) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('متصفحك لا يدعم إدخال الصوت');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setter(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error(event.error);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    
    recognition.start();
  };

  // Save students roster to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(students));
      window.dispatchEvent(new Event('roster_updated'));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  // Save attendance to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendance));
      window.dispatchEvent(new Event('roster_updated'));
    } catch (e) {
      console.error(e);
    }
  }, [attendance]);

  // Filter students for current Grade & Class
  const classStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.grade === selectedGrade &&
        s.class_num === selectedClassNum
    ).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [students, selectedGrade, selectedClassNum]);

  const displayedStudents = useMemo(() => {
    let filtered = classStudents.map((student, originalIndex) => ({
      ...student,
      serialNumber: originalIndex + 1
    }));

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const isNum = !isNaN(Number(query));
      if (isNum) {
        const targetNumber = Number(query);
        filtered = filtered.filter(s => s.serialNumber === targetNumber);
      } else {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(query));
      }
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => {
        return attendance.some(a => 
          a.student_id === s.id && 
          a.month_id === selectedTerm && 
          a.status === filterStatus
        );
      });
    }

    return filtered;
  }, [classStudents, searchQuery, filterStatus, attendance, selectedTerm]);



  const assessmentsToDisplay = useMemo(() => {
    if (showAllAssessments) {
      return Array.from({ length: 15 }, (_, i) => i + 1);
    }
    return MONTHS_DATA.find(m => m.id === selectedMonthId)?.assessments || [];
  }, [showAllAssessments, selectedMonthId]);

  const handleExportExcel = () => {
    if (displayedStudents.length === 0) return;
    
    // Create header row
    const headers = ['م', 'اسم الطالب', ...assessmentsToDisplay.map(num => `تقييم ${num}`)];
    
    // Create data rows
    const rows = displayedStudents.map((s, idx) => {
      const rowData: any[] = [s.serialNumber, s.name];
      for (const num of assessmentsToDisplay) {
        const isHoliday = records.some(r => 
          r.grade === selectedGrade && 
          r.class_num.toString() === selectedClassNum && 
          r.term_id === selectedTerm && 
          r.assess_num === num && 
          r.is_holiday
        );
        
        if (isHoliday) {
          rowData.push('مؤجل');
          continue;
        }

        const status = getAttendanceStatus(s.id, num);
        let statusText = '-';
        if (status === 'present') statusText = 'حاضر';
        else if (status === 'absent') statusText = 'غائب';
        else if (status === 'excused') statusText = 'بعذر';
        rowData.push(statusText);
      }
      return rowData;
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    // Set RTL
    if(!worksheet['!views']) worksheet['!views'] = [];
    worksheet['!views'].push({ rightToLeft: true });
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل الحضور');
    
    XLSX.writeFile(workbook, `سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.xlsx`);
  };

  const handleExportImage = async () => {
    if (displayedStudents.length === 0) return;
    
    const tableEl = document.getElementById('roster-table-container');
    if (!tableEl) {
      setErrorMessage("تعذر العثور على الجدول");
      return;
    }

    try {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.style.width = 'max-content';
      wrapper.style.backgroundColor = '#ffffff';
      wrapper.style.padding = '20px';
      wrapper.style.direction = 'rtl';
      wrapper.dir = 'rtl';
      wrapper.style.fontFamily = 'Cairo, Tajawal, system-ui, -apple-system, sans-serif';
      
      const title = document.createElement('h2');
      title.innerText = `سجل الطلاب - الصف ${selectedGrade} - فصل ${selectedClassNum}`;
      title.style.textAlign = 'center';
      title.style.marginBottom = '20px';
      title.style.color = '#1e293b';
      title.style.fontSize = '18px';
      title.style.fontWeight = 'bold';
      wrapper.appendChild(title);

      const clone = tableEl.cloneNode(true) as HTMLElement;
      
      // Fix overflow on clone to prevent clipping
      clone.style.overflow = 'visible';
      clone.style.maxHeight = 'none';
      clone.style.height = 'auto';
      clone.classList.remove('overflow-y-auto', 'overflow-x-auto', 'max-h-[70vh]');
      
      const stickies = clone.querySelectorAll('.sticky');
      stickies.forEach(el => {
        (el as HTMLElement).style.position = 'static';
        (el as HTMLElement).style.boxShadow = 'none';
      });

      const cells = clone.querySelectorAll('td');
      cells.forEach(td => {
        const btn = td.querySelector('button') || td.querySelector('.w-6.h-6');
        if (btn) {
          let text = '-';
          const btnClass = btn.className;
          if (btnClass.includes('emerald-100')) text = 'حاضر';
          else if (btnClass.includes('rose-100') && !btnClass.includes('rose-50')) text = 'غائب';
          else if (btnClass.includes('amber-100')) text = 'عذر';
          
          td.innerHTML = `<div style="text-align:center; padding:4px; font-weight:bold; color:#334155; font-family: Cairo, Tajawal, system-ui, sans-serif;">${text}</div>`;
        }
      });

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);
      
      // wait for next tick to ensure styles are applied
      await new Promise(resolve => setTimeout(resolve, 150));

      const dataUrl = await toPng(wrapper, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: false,
      });
      
      document.body.removeChild(wrapper);
      const link = document.createElement('a');
      link.download = `سجل_الطلاب_الصف_${selectedGrade}_فصل_${selectedClassNum}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      setErrorMessage("حدث خطأ أثناء تصدير الصورة");
    }
  };


  // Handle Save (Add Next or Finish)
  const handleSaveStudent = async (addNext: boolean) => {
    if (!newStudentName.trim() || !selectedGrade || !selectedClassNum) return;

    const nameToSave = newStudentName.trim();
    
    // Check if student exists in any class
    const existingStudent = students.find(s => s.name === nameToSave);
    if (existingStudent) {
      setErrorMessage(`الطالب "${nameToSave}" مسجل بالفعل في الصف ${existingStudent.grade} - فصل ${existingStudent.class_num}`);
      return;
    }

    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: nameToSave,
      grade: selectedGrade,
      class_num: Number(selectedClassNum),
      religion,
      status,
    };

    setStudents((prev) => [...prev, newStudent]);
    setNewStudentName('');

    if (isFirebaseConnected) {
      setSyncStatus('syncing');
      try {
        const success = await saveFirebaseStudent(newStudent, teacherId);
        setSyncStatus(success ? 'idle' : 'error');
      } catch {
        setSyncStatus('error');
      }
    }

    if (!addNext) {
      setIsModalOpen(false);
    }
  };

  const handleDeleteStudent = (id: string, name: string) => {
    setStudentToDelete({ id, name });
  };

  const handleEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setEditStudentName(student.name);
  };

  const handleUpdateStudent = async () => {
    if (!studentToEdit || !editStudentName.trim()) return;

    const nameToUpdate = editStudentName.trim();
    
    const existingStudent = students.find(s => s.name === nameToUpdate && s.id !== studentToEdit.id);
    if (existingStudent) {
      setErrorMessage(`الطالب "${nameToUpdate}" مسجل بالفعل في الصف ${existingStudent.grade} - فصل ${existingStudent.class_num}`);
      return;
    }

    const updatedStudent = { ...studentToEdit, name: nameToUpdate };

    setStudents(prev => prev.map(s => s.id === studentToEdit.id ? updatedStudent : s));
    setStudentToEdit(null);
    setEditStudentName('');

    if (isFirebaseConnected) {
      setSyncStatus('syncing');
      try {
        const success = await saveFirebaseStudent(updatedStudent, teacherId);
        setSyncStatus(success ? 'idle' : 'error');
      } catch {
        setSyncStatus('error');
      }
    }
  };

  const confirmDeleteStudent = async () => {
    if (studentToDelete) {
      const studentId = studentToDelete.id;
      const attendanceToDelete = attendance.filter((a) => a.student_id === studentId);

      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setAttendance((prev) => prev.filter((a) => a.student_id !== studentId));
      setStudentToDelete(null);

      if (isFirebaseConnected) {
        setSyncStatus('syncing');
        try {
          await deleteFirebaseStudent(studentId);
          await Promise.all(attendanceToDelete.map((a) => deleteFirebaseAttendance(a.id)));
          setSyncStatus('idle');
        } catch (e) {
          console.error('Failed to delete student from Firebase', e);
          setSyncStatus('error');
        }
      }
    }
  };

  const toggleAttendance = async (studentId: string, studentName: string, assessNum: number) => {
    let finalRecord: any = null;
    
    setAttendance((prev) => {
      const existing = prev.find((a) => a.student_id === studentId && a.assess_num === assessNum && a.month_id === selectedTerm);
      let newStatus: AttendanceStatus = 'present';
      let idToUse = crypto.randomUUID();
      
      if (existing) {
        if (existing.status === 'present') newStatus = 'absent';
        else if (existing.status === 'absent') newStatus = 'excused';
        else newStatus = 'present';
        idToUse = existing.id; // Preserve ID if updating
      }

      const otherAttendance = prev.filter(
        (a) => !(a.student_id === studentId && a.assess_num === assessNum && a.month_id === selectedTerm)
      );

      finalRecord = {
        id: idToUse,
        student_id: studentId,
        student_name: studentName,
        grade: selectedGrade,
        class_num: Number(selectedClassNum),
        month_id: selectedTerm,
        assess_num: assessNum,
        status: newStatus,
        updated_at: new Date().toISOString(),
        teacher_id: teacherId, // Add teacherId for Firebase rules
      };

      return [...otherAttendance, finalRecord];
    });

    // Auto-save to Firebase
    if (finalRecord && isFirebaseConnected) {
      setSyncStatus('syncing');
      try {
        const success = await saveFirebaseAttendance(finalRecord);
        setSyncStatus(success ? 'idle' : 'error');
      } catch (e) {
        console.error('Failed to sync attendance', e);
        setSyncStatus('error');
      }
    }
  };

  const getAttendanceStatus = (studentId: string, assessNum: number): AttendanceStatus | null => {
    const record = attendance.find(
      (a) => a.student_id === studentId && a.assess_num === assessNum && a.month_id === selectedTerm
    );
    return record ? record.status : null;
  };



  // Helper to get first two words of a name
  const getShortName = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 2) return name;
    return `${parts[0]} ${parts[1]}`;
  };

  const hasConsecutiveAbsences = (studentId: string) => {
    const studentRecords = attendance.filter(a => a.student_id === studentId && a.month_id === selectedTerm);
    studentRecords.sort((a, b) => a.assess_num - b.assess_num);
    
    let currentConsecutive = 0;
    let maxConsecutive = 0;
    
    for (const record of studentRecords) {
      if (record.status === 'absent') {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    }
    
    return maxConsecutive > 3;
  };


  const renderAttendanceButton = (studentId: string, studentName: string, assessNum: number, serialNumber: number) => {
    const assignedModel = getStudentModel(studentId, serialNumber, assessNum, isRandomDistribution);

    // Check if this assessment is a holiday for this class
    const isHoliday = records.some(r => 
      r.grade === selectedGrade && 
      r.class_num.toString() === selectedClassNum && 
      r.term_id === selectedTerm && 
      r.assess_num === assessNum && 
      r.is_holiday
    );

    if (isHoliday) {
      return (
        <div 
          className="w-6 h-6 rounded-md flex items-center justify-center bg-rose-50 border border-rose-200 text-rose-400 mx-auto cursor-help"
          title="تأجيل التقييم"
        >
          <span className="text-xs font-bold leading-none">مؤجل</span>
        </div>
      );
    }

    const status = getAttendanceStatus(studentId, assessNum);
    
    let btnClass = "w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 shadow-sm mx-auto cursor-pointer border group-hover/btn:scale-110 group-hover/btn:-rotate-6 group-hover/btn:shadow-md active:scale-95";
    let icon = <Minus className="w-3 h-3 text-slate-500" />;
    let customBtnStyle: React.CSSProperties = {};

    if (status === 'present') {
      const c = statusColors.present;
      customBtnStyle = {
        backgroundColor: `${c}22`,
        borderColor: `${c}60`,
      };
      icon = <Check className="w-3.5 h-3.5 transition-colors" strokeWidth={3} style={{ color: c }} />;
    } else if (status === 'absent') {
      const c = statusColors.absent;
      customBtnStyle = {
        backgroundColor: `${c}22`,
        borderColor: `${c}60`,
      };
      icon = <X className="w-3.5 h-3.5 transition-colors" strokeWidth={3} style={{ color: c }} />;
    } else if (status === 'excused') {
      const c = statusColors.excused;
      customBtnStyle = {
        backgroundColor: `${c}22`,
        borderColor: `${c}60`,
      };
      icon = <Minus className="w-3.5 h-3.5 transition-colors" strokeWidth={3} style={{ color: c }} />;
    } else {
      btnClass += " bg-slate-50 border-slate-200 group-hover/btn:bg-slate-100";
      icon = <Check className="w-3.5 h-3.5 text-transparent group-hover/btn:text-slate-300 transition-colors" strokeWidth={3} />; 
    }

    return (
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={() => toggleAttendance(studentId, studentName, assessNum)}
          className={`${btnClass} group/btn`}
          style={customBtnStyle}
          title={status === 'present' ? `حاضر (نموذج ${assignedModel})` : status === 'absent' ? `غائب (نموذج ${assignedModel})` : status === 'excused' ? `بعذر (نموذج ${assignedModel})` : `غير مسجل (نموذج ${assignedModel})`}
        >
          {icon}
        </button>
        {showModelsInTable && (
          <span 
            className={`text-xs font-bold px-1 py-0.5 rounded border text-center min-w-[18px] leading-none shadow-2xs select-none ${
              assignedModel === 'أ' 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : assignedModel === 'ب' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}
            title={`نموذج الاختبار: ${assignedModel}`}
          >
            {assignedModel}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={
      isFocusMode 
        ? "fixed inset-0 z-50 bg-[#fafcff] text-slate-800 p-3 sm:p-5 overflow-y-auto flex flex-col w-full h-full animate-in fade-in zoom-in-95 duration-200" 
        : "bg-white rounded-xl p-3 shadow-sm border border-slate-100 w-full max-w-full overflow-hidden animate-in fade-in"
    }>
      {/* Focus Mode Clean Minimal Header */}
      {isFocusMode ? (
        <div className="bg-white border border-sky-200/60 rounded-2xl p-3 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500"></span>
            </span>
            <div>
              <span className="font-bold text-sm sm:text-base text-sky-700 flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-500 fill-sky-500" />
                🎯 وضع التركيز - جدول رصد التقييمات
              </span>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                جدول الرصد المباشر فقط لتقليل التشتت أثناء إدخال درجات التقييم
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Grade & Class Selector in Focus Mode */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="" disabled>الصف...</option>
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>الصف {grade}</option>
              ))}
            </select>

            <select
              value={selectedClassNum}
              onChange={(e) => setSelectedClassNum(e.target.value === '' ? '' : Number(e.target.value))}
              className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="" disabled>الفصل...</option>
              {Array.from({ length: CLASSES_COUNT }, (_, i) => i + 1).map((cNum) => (
                <option key={cNum} value={cNum}>فصل {cNum}</option>
              ))}
            </select>

            <button
              onClick={() => setIsFocusMode(false)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            >
              <Minimize2 className="w-4 h-4" />
              <span>إلغاء التركيز</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Top Bar: Organized Tab System */}
          <div className="flex flex-col mb-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveControlTab('students')}
                className={`flex-1 sm:flex-none px-4 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-[120px] whitespace-nowrap ${activeControlTab === 'students' ? 'bg-sky-50 text-sky-800 border-b-2 border-sky-600' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <Users className="w-4 h-4" /> الطلاب والفصل
              </button>
              <button 
                onClick={() => setActiveControlTab('display')}
                className={`flex-1 sm:flex-none px-4 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-[120px] whitespace-nowrap ${activeControlTab === 'display' ? 'bg-violet-50 text-violet-800 border-b-2 border-violet-600' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <Eye className="w-4 h-4" /> العرض والتركيز
              </button>
              <button 
                onClick={() => setActiveControlTab('tools')}
                className={`flex-1 sm:flex-none px-4 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-[120px] whitespace-nowrap ${activeControlTab === 'tools' ? 'bg-amber-50 text-amber-900 border-b-2 border-amber-600' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <Sparkles className="w-4 h-4" /> أدوات متقدمة
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-3.5 sm:p-4">
              {activeControlTab === 'students' && (
                <div className="flex flex-col sm:flex-row items-end justify-between gap-4 animate-in fade-in duration-200">
                  {classStudents.length > 0 ? (
                    <button
                      onClick={() => {
                        setErrorMessage('هل أنت متأكد من حذف جميع طلاب هذا الفصل؟|DELETE_ALL');
                      }}
                      className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors w-full sm:w-auto cursor-pointer shrink-0"
                    >
                      <span>حذف الفصل</span>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="hidden sm:block"></div>
                  )}

                  <div className="flex flex-col gap-3 w-full sm:w-auto">
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full justify-end">
                      {/* Grade Selector */}
                      <div className="relative shrink-0 flex-1 sm:flex-none sm:w-[130px]">
                        <select
                          value={selectedGrade}
                          onChange={(e) => setSelectedGrade(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-7 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 appearance-none text-right cursor-pointer"
                        >
                          <option value="" disabled>اختر الصف...</option>
                          {GRADES.map((grade) => (
                            <option key={grade} value={grade}>الصف {grade}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>

                      {/* Class Selector */}
                      <div className="relative shrink-0 flex-1 sm:flex-none sm:w-[120px]">
                        <select
                          value={selectedClassNum}
                          onChange={(e) => setSelectedClassNum(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-7 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 appearance-none text-right cursor-pointer"
                        >
                          <option value="" disabled>اختر الفصل...</option>
                          {Array.from({ length: CLASSES_COUNT }, (_, i) => i + 1).map((cNum) => (
                            <option key={cNum} value={cNum}>فصل {cNum}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Add Student Button */}
                    <button
                      onClick={() => {
                        if (!selectedGrade || !selectedClassNum) {
                          alert('يرجى اختيار الصف والفصل أولاً.');
                          return;
                        }
                        setIsModalOpen(true);
                      }}
                      className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer w-full"
                    >
                      <span>إضافة طالب</span>
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeControlTab === 'display' && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors select-none">
                        <input 
                          type="checkbox" 
                          checked={isPinned}
                          onChange={handlePinChange}
                          className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300 cursor-pointer"
                        />
                        <span>تثبيت الصف والفصل الحالي</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors select-none">
                        <input 
                          type="checkbox" 
                          checked={showAllAssessments}
                          onChange={(e) => setShowAllAssessments(e.target.checked)}
                          className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300 cursor-pointer"
                        />
                        <span>إظهار جميع التقييمات في الجدول</span>
                      </label>
                    </div>

                    <button 
                      onClick={() => setIsFocusMode(!isFocusMode)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 shrink-0"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>تفعيل وضع التركيز 🎯</span>
                    </button>
                  </div>

                  {selectedGrade && selectedClassNum && (
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50 border-slate-200">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-700">مظهر الفصل:</span>
                        <div className={`px-2 py-1 rounded text-xs font-bold border ${currentAppearance.color}`}>
                          {renderIcon(currentAppearance.icon, "w-3.5 h-3.5 inline-block ml-1")}
                          الصف {selectedGrade} - فصل {selectedClassNum}
                        </div>
                      </div>
                      <button
                        onClick={() => setIsAppearanceModalOpen(true)}
                        className="text-xs font-bold text-violet-600 hover:text-violet-700 cursor-pointer underline underline-offset-4"
                      >
                        تغيير المظهر
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeControlTab === 'tools' && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  {/* Danger Zone */}
                  <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-200 flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors select-none">
                      <input 
                        type="checkbox" 
                        checked={isClearAssessmentsChecked}
                        onChange={handleClearAssessmentsCheckbox}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-300 cursor-pointer"
                      />
                      <span>إلغاء وتصفير كل التقييمات للطلاب (خطر)</span>
                    </label>
                  </div>

                  {/* Batch Tools */}
                  {selectedGrade && selectedClassNum && classStudents.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Attendance Batch */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none border-b border-slate-200 pb-2">
                          <input
                            type="checkbox"
                            checked={showBatchActions}
                            onChange={(e) => setShowBatchActions(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>أداة تسجيل التقييم الجماعي</span>
                          </span>
                        </label>
                        
                        {showBatchActions && (
                          <div className="flex flex-col gap-2 animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500">رقم التقييم:</span>
                              <select
                                value={batchTargetAssessNum}
                                onChange={(e) => setBatchTargetAssessNum(Number(e.target.value))}
                                className="bg-white text-slate-800 font-bold text-xs rounded-lg px-2 py-1.5 border border-slate-300 focus:outline-none cursor-pointer flex-1"
                              >
                                {assessmentsToDisplay.map((num) => (
                                  <option key={num} value={num}>تقييم {num}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() => handleBatchAttendance('present')}
                                style={{ backgroundColor: statusColors.present }}
                                className="flex-1 hover:opacity-90 active:scale-95 text-white font-bold text-xs sm:text-xs py-2 rounded-lg shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" /> حضور للكل
                              </button>
                              <button
                                onClick={() => handleBatchAttendance('absent')}
                                style={{ backgroundColor: statusColors.absent }}
                                className="flex-1 hover:opacity-90 active:scale-95 text-white font-bold text-xs sm:text-xs py-2 rounded-lg shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" /> غياب للكل
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Models Distribution Batch */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none border-b border-slate-200 pb-2">
                          <input
                            type="checkbox"
                            checked={showModelDistribution}
                            onChange={(e) => setShowModelDistribution(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                            <span>أداة توزيع النماذج (أ، ب، ج)</span>
                          </span>
                        </label>
                        
                        {showModelDistribution && (
                          <div className="flex flex-col gap-2.5 animate-in slide-in-from-top-2">
                            <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 cursor-pointer group hover:border-blue-300 transition-colors">
                              <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900:text-white">توزيع عشوائي للنماذج</span>
                              <input 
                                type="checkbox" 
                                checked={isRandomDistribution}
                                onChange={(e) => setIsRandomDistribution(e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                              />
                            </label>
                            
                            <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 cursor-pointer group hover:border-blue-300 transition-colors">
                              <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900:text-white">إظهار النموذج في الجدول</span>
                              <input 
                                type="checkbox" 
                                checked={showModelsInTable}
                                onChange={(e) => setShowModelsInTable(e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-xs font-bold text-slate-500">
                      يرجى اختيار الصف والفصل لتفعيل الأدوات الإضافية.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Table Container - Compact for minimal scrolling, expanded in Focus Mode */}
      <div 
        id="roster-table-container" 
        className={`mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-sm overflow-x-auto w-full transition-all ${
          isFocusMode 
            ? 'flex-1 min-h-[60vh] max-h-[calc(100vh-170px)] bg-white border-2 border-indigo-500/40 shadow-2xl' 
            : 'max-h-[70vh] bg-white'
        } overflow-y-auto`}
      >
        <table className="w-full text-right border-separate border-spacing-0 whitespace-nowrap">
          <thead>
            <tr className="bg-[#1e3a8a] text-white text-sm font-bold shadow-sm">
              <th className="py-2 px-1 text-xs min-w-[36px] max-w-[36px] w-[36px] text-center sticky top-0 right-0 bg-[#1e3a8a] z-40 border-b border-l border-slate-700 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">م</th>
              <th className="p-2 min-w-[90px] max-w-[90px] w-[90px] sticky top-0 right-[36px] bg-[#1e3a8a] z-40 border-b border-l border-slate-700 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">الاسم</th>
              
              {assessmentsToDisplay.map(num => (
                <th key={num} className="py-2 px-1 text-center sticky top-0 bg-[#1e3a8a] z-30 border-b border-l border-slate-700 whitespace-nowrap min-w-[38px]">
                  <div className="flex flex-col items-center justify-center leading-none gap-1">
                    <span className="[writing-mode:vertical-rl] text-xs text-slate-300 font-bold tracking-tight py-0.5">أسبوع</span>
                    <span className="text-xs font-bold text-white bg-slate-800/80 px-1 py-0.5 rounded border border-slate-600/80">{num}</span>
                  </div>
                </th>
              ))}
              <th className="p-3 text-center sticky top-0 bg-[#1e3a8a] z-30 w-14 border-b border-r border-slate-700">تحكم</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white text-sm font-bold text-slate-800">
            {displayedStudents.length > 0 ? (
              displayedStudents.map((student, idx) => {
                const isOdd = idx % 2 !== 0;
                const rowBgClass = isOdd ? 'bg-sky-50/50 hover:bg-amber-50/80' : 'bg-white hover:bg-amber-50/80';
                const stickyBgClass = isOdd ? 'bg-[#f0f9ff] group-hover:bg-[#fef3c7]' : 'bg-white group-hover:bg-[#fef3c7]';

                return (
                  <tr key={student.id} className={`${rowBgClass} transition-colors group`}>
                    <td className={`py-1.5 px-1 text-xs text-center sticky right-0 ${stickyBgClass} z-20 border-b border-l border-slate-200 shadow-[-2px_0_4px_rgba(0,0,0,0.02)] min-w-[36px] max-w-[36px] w-[36px] font-bold text-slate-700`}>{student.serialNumber}</td>
                    <td className={`p-2 text-xs sticky right-[36px] ${stickyBgClass} z-20 border-b border-l border-slate-200 shadow-[-2px_0_4px_rgba(0,0,0,0.02)] min-w-[90px] max-w-[90px] w-[90px] truncate`} title={student.name}>
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate">{getShortName(student.name)}</span>
                        {hasConsecutiveAbsences(student.id) && (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" title="تجاوز 3 غيابات متتالية" />
                        )}
                      </div>
                    </td>

                    {assessmentsToDisplay.map(num => (
                      <td key={num} className="p-1.5 border-b border-l border-slate-200">
                        {renderAttendanceButton(student.id, student.name, num, student.serialNumber)}
                      </td>
                    ))}
                    <td className="p-3 text-center border-b border-r border-slate-200">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedStudentForProfile(student)}
                          className="text-slate-500 hover:text-sky-600 p-1.5 rounded-md hover:bg-sky-50 transition-colors inline-block"
                          title="الملف الشخصي"
                        >
                          <User className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="text-slate-500 hover:text-teal-600 p-1.5 rounded-md hover:bg-teal-50 transition-colors inline-block"
                          title="تعديل"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id, student.name)}
                          className="text-slate-500 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors inline-block"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={assessmentsToDisplay.length + 4} className="p-8 text-center text-slate-500">
                  لا يوجد طلاب مسجلين في هذا الفصل
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200 shadow-xl">
            <h2 className="text-center text-xl font-bold text-slate-900 mb-6">تسجيل طالب</h2>
            <div className="space-y-5">
              {/* Name Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="الاسم رباعي"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full pr-10 pl-10 text-center bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent placeholder-slate-400 transition-all"
                  autoFocus
                />
                <button
                  onClick={() => handleVoiceInput(setNewStudentName, setIsListeningAdd)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                    isListeningAdd ? 'bg-rose-100 text-rose-600 animate-pulse' : 'text-slate-500 hover:text-[#0284c7] hover:bg-slate-100'
                  }`}
                  title="إدخال بالصوت"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Toggles Row */}
              <div className="flex gap-3">
                {/* Religion Toggle */}
                <div className="flex flex-1 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setReligion('مسلم')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                      religion === 'مسلم'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    مسلم
                  </button>
                  <button
                    onClick={() => setReligion('مسيحي')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                      religion === 'مسيحي'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    مسيحي
                  </button>
                </div>

                {/* Status Toggle */}
                <div className="flex flex-1 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setStatus('مستجد')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                      status === 'مستجد'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    مستجد
                  </button>
                  <button
                    onClick={() => setStatus('باق')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                      status === 'باق'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    باق
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="space-y-2 pt-4">
                <button
                  onClick={() => handleSaveStudent(true)}
                  className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                >
                  حفظ وإضافة التالي
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition-colors"
                >
                  إنهاء التسجيل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Student Modal */}
      {studentToEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200 shadow-xl">
            <h2 className="text-center text-xl font-bold text-slate-900 mb-6">تعديل اسم الطالب</h2>
            <div className="space-y-5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="الاسم رباعي"
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full pr-10 pl-10 text-center bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  autoFocus
                />
                <button
                  onClick={() => handleVoiceInput(setEditStudentName, setIsListeningEdit)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                    isListeningEdit ? 'bg-rose-100 text-rose-600 animate-pulse' : 'text-slate-500 hover:text-teal-600 hover:bg-slate-100'
                  }`}
                  title="إدخال بالصوت"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateStudent}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                >
                  حفظ التعديل
                </button>
                <button
                  onClick={() => {
                    setStudentToEdit(null);
                    setEditStudentName('');
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error/Alert Modal */}
      {errorMessage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200 shadow-xl">
            <h2 className="text-center text-xl font-bold text-rose-600 mb-2">تنبيه</h2>
            <p className="text-center text-slate-600 font-bold mb-6">
              {errorMessage.split('|')[0]}
            </p>
            <div className="flex gap-3">
              {errorMessage.includes('|DELETE_ALL') ? (
                <>
                  <button
                    onClick={async () => {
                      const classNum = selectedClassNum as number;
                      const studentsToDelete = students.filter(s => s.grade === selectedGrade && s.class_num === classNum);
                      const attendanceToDelete = attendance.filter(a => a.grade === selectedGrade && a.class_num === classNum);
                      const assessmentDocsToDelete = records.filter(r => r.grade === selectedGrade && r.class_num === classNum);

                      setStudents(prev => prev.filter(s => !(s.grade === selectedGrade && s.class_num === classNum)));
                      setAttendance(prev => prev.filter(a => !(a.grade === selectedGrade && a.class_num === classNum)));
                      setErrorMessage(null);

                      if (onDeleteRecordsForClass) {
                        onDeleteRecordsForClass(selectedGrade, classNum);
                      }

                      if (isFirebaseConnected) {
                        setSyncStatus('syncing');
                        try {
                          await Promise.all([
                            ...studentsToDelete.map(s => deleteFirebaseStudent(s.id)),
                            ...attendanceToDelete.map(a => deleteFirebaseAttendance(a.id)),
                            ...assessmentDocsToDelete.map(doc => deleteFirebaseAssessmentRecord(doc.id))
                          ]);
                          setSyncStatus('idle');
                        } catch (e) {
                          console.error('Failed to delete class data from Firebase', e);
                          setSyncStatus('error');
                        }
                      }

                      window.dispatchEvent(new Event('roster_updated'));
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                  >
                    نعم، احذف الكل
                  </button>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition-colors"
                  >
                    إلغاء
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setErrorMessage(null)}
                  className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                >
                  حسناً
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200 shadow-xl">
            <h2 className="text-center text-xl font-bold text-rose-600 mb-2">تأكيد الحذف</h2>
            <p className="text-center text-slate-600 font-bold mb-6">
              هل أنت متأكد من حذف الطالب {studentToDelete.name}؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteStudent}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Appearance Modal */}
      {isAppearanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">تخصيص مظهر الفصل</h3>
              <button onClick={() => setIsAppearanceModalOpen(false)} className="text-slate-500 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">اختر الأيقونة</label>
                <div className="grid grid-cols-5 gap-2">
                  {appearanceIcons.map(iconName => (
                    <button
                      key={iconName}
                      onClick={() => setClassAppearances(prev => ({ ...prev, [classKey]: { ...currentAppearance, icon: iconName } }))}
                      className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                        currentAppearance.icon === iconName 
                          ? 'bg-slate-800 text-white shadow-md' 
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {renderIcon(iconName, "w-5 h-5")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">اختر اللون</label>
                <div className="grid grid-cols-4 gap-2">
                  {appearanceColors.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setClassAppearances(prev => ({ ...prev, [classKey]: { ...currentAppearance, color: c.id } }))}
                      className={`p-3 rounded-xl text-center text-xs font-bold transition-all border ${c.id} ${
                        currentAppearance.color === c.id ? 'ring-2 ring-slate-800 ring-offset-2' : ''
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsAppearanceModalOpen(false)}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Assessments Warning Modal */}
      {showClearAssessmentsWarning && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative shadow-2xl border border-rose-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                تحذير: إلغاء كل التقييمات
              </h3>
              <p className="text-sm font-bold text-slate-600 mt-2 leading-relaxed">
                هل أنت متأكد من إلغاء ومسح جميع سجلات تقييمات الطلاب لهذا الفصل (الصف {selectedGrade} - فصل {selectedClassNum})؟
              </p>
              <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3 mt-3 text-right text-xs font-bold text-rose-800 space-y-1">
                <p>⚠️ تنبيه هام:</p>
                <ul className="list-disc list-inside space-y-1 text-rose-700 font-medium">
                  <li>سيتم مسح كافة درجات/حالات الحضور والغياب للـ 15 تقييماً المعتمدة.</li>
                  <li>لا يمكن التراجع عن هذا الإجراء بعد التأكيد.</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={confirmClearAllAssessments}
                className="flex-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، إلغاء كافة التقييمات</span>
              </button>

              <button
                onClick={cancelClearAllAssessments}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer"
              >
                إلغاء / تراجع
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {selectedStudentForProfile && (
        <StudentProfileDashboard
          student={selectedStudentForProfile}
          attendance={attendance.filter(a => a.student_id === selectedStudentForProfile.id)}
          records={records}
          onAddReminder={onAddReminder}
          onClose={() => setSelectedStudentForProfile(null)}
          onUpdateStudent={(updated) => {
            const updatedStudents = students.map(s => s.id === updated.id ? updated : s);
            setStudents(updatedStudents);
            if (isFirebaseConnected) {
              saveFirebaseStudent(updated, teacherId).catch(e => console.error(e));
            }
            setSelectedStudentForProfile(updated);
          }}
        />
      )}
    </div>
  );
};