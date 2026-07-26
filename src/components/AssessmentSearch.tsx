import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, BookOpen, Clock, AlertTriangle, User, Users, Mic, MicOff, Sparkles, Volume2 } from 'lucide-react';
import { AssessmentRecord, Student, StudentAttendance, TermId, StatusColors } from '../types';
import { GRADES, CLASSES_COUNT } from '../lib/constants';
import { fetchFirebaseStudents, fetchFirebaseAttendance } from '../lib/firebase';
import { DEFAULT_STATUS_COLORS } from '../lib/statusColors';

interface AssessmentSearchProps {
  teacherId: string;
  records: AssessmentRecord[];
  selectedTerm: TermId;
  statusColors?: StatusColors;
}

const ROSTER_STORAGE_KEY = 'school_assessments_students_roster_v1';
const ATTENDANCE_STORAGE_KEY = 'school_assessments_attendance_v1';

export const AssessmentSearch: React.FC<AssessmentSearchProps> = ({ records, selectedTerm, teacherId, statusColors = DEFAULT_STATUS_COLORS }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('');
  const [filterClassNum, setFilterClassNum] = useState<number | ''>('');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);

  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [selectedAssessNumFilter, setSelectedAssessNumFilter] = useState<number | null>(null);

  useEffect(() => {
    let hasLoadedFromLocal = false;
    try {
      const savedRoster = localStorage.getItem(ROSTER_STORAGE_KEY);
      if (savedRoster) {
        setStudents(JSON.parse(savedRoster));
        hasLoadedFromLocal = true;
      }
      
      const savedAtt = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (savedAtt) setAttendance(JSON.parse(savedAtt));
    } catch (e) {
      console.error(e);
    }

    // Background sync
    const syncFromFirebase = async () => {
      try {
        const fbStudents = await fetchFirebaseStudents(teacherId);
        if (fbStudents && fbStudents.length > 0) {
          setStudents(fbStudents);
          localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(fbStudents));
        }
        
        const fbAtt = await fetchFirebaseAttendance(teacherId);
        if (fbAtt && fbAtt.length > 0) {
          setAttendance(fbAtt);
          localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(fbAtt));
        }
      } catch (e) {
        console.error("Failed to sync from firebase", e);
      }
    };
    
    syncFromFirebase();
  }, [teacherId]);

  // Handle Voice Search Command Processing
  const processSpokenCommand = (text: string) => {
    const trimmed = text.trim();
    
    // Check if user spoke an assessment number command e.g. "تقييم 5" or "التقييم 12"
    const assessNumMatch = trimmed.match(/(?:تقييم|التقييم|رقم)\s*(\d+)/i) || trimmed.match(/^(\d+)$/);
    
    if (assessNumMatch) {
      const num = parseInt(assessNumMatch[1], 10);
      if (num >= 1 && num <= 15) {
        setSelectedAssessNumFilter(num);
        setSearchQuery(`تقييم ${num}`);
        return;
      }
    }

    // Spelled-out Arabic numbers matching
    const wordsMap: Record<string, number> = {
      'الأول': 1, 'الاول': 1, 'واحد': 1,
      'الثاني': 2, 'اثنان': 2,
      'الثالث': 3, 'ثلاثة': 3,
      'الرابع': 4, 'أربعة': 4, 'اربعة': 4,
      'الخامس': 5, 'خمسة': 5,
      'السادس': 6, 'ستة': 6,
      'السابع': 7, 'سبعة': 7,
      'الثامن': 8, 'ثمانية': 8,
      'التاسع': 9, 'تسعة': 9,
      'العاشر': 10, 'عشرة': 10,
      'الحادي عشر': 11,
      'الثاني عشر': 12,
      'الثالث عشر': 13,
      'الرابع عشر': 14,
      'الخامس عشر': 15,
    };

    let foundAssessNum: number | null = null;
    if (trimmed.includes('تقييم') || trimmed.includes('التقييم')) {
      for (const [word, num] of Object.entries(wordsMap)) {
        if (trimmed.includes(word)) {
          foundAssessNum = num;
          break;
        }
      }
    }

    if (foundAssessNum) {
      setSelectedAssessNumFilter(foundAssessNum);
      setSearchQuery(`تقييم ${foundAssessNum}`);
    } else {
      // Clean up common voice command prefixes
      const cleanName = trimmed
        .replace(/^(ابحث عن|بحث عن|طالب|الطالب)\s*/gi, '')
        .trim();
      setSelectedAssessNumFilter(null);
      setSearchQuery(cleanName);
    }
  };

  // Start Voice Recognition
  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('عذراً، خاصية التعرف الصوتي غير مدعومة في متصفحك الحالي. يرجى استخدام Google Chrome.');
      return;
    }

    try {
      setSpeechError(null);
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-EG';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('جاري الاستماع لقولك...');
      };

      recognition.onresult = (event: any) => {
        const currentResult = event.results[event.resultIndex];
        const spokenText = currentResult[0].transcript;
        setTranscript(spokenText);

        if (currentResult.isFinal) {
          processSpokenCommand(spokenText);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('يرجى السماح بصلاحيات الميكروفون لاستخدام البحث الصوتي.');
        } else if (event.error === 'no-speech') {
          setSpeechError('لم يتم سماع أي صوت. يرجى المحاولة مرة أخرى.');
        } else {
          setSpeechError('حدث خطأ أثناء الاتصال بخدمة الصوت.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setSpeechError('تعذر تشغيل الميكروفون.');
    }
  };

  // Normalized search query for matching names/codes
  const cleanSearchQuery = useMemo(() => {
    if (!searchQuery) return '';
    return searchQuery
      .replace(/^(ابحث عن|بحث عن|طالب|الطالب|تقييم|التقييم|رقم)\s*/gi, '')
      .trim();
  }, [searchQuery]);

  // Filter students based on search criteria
  const filteredStudents = useMemo(() => {
    if (!searchQuery && !filterGrade && !filterClassNum && !selectedAssessNumFilter) return [];
    
    return students.filter(s => {
      const matchName = cleanSearchQuery 
        ? s.name.toLowerCase().includes(cleanSearchQuery.toLowerCase()) || 
          (s.studentNumber && s.studentNumber.includes(cleanSearchQuery)) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchGrade = filterGrade ? s.grade === filterGrade : true;
      const matchClass = filterClassNum ? s.class_num === Number(filterClassNum) : true;

      // Filter by assessment number if selected
      let matchAssess = true;
      if (selectedAssessNumFilter) {
        const studentRecords = attendance.filter(a => a.student_id === s.id);
        matchAssess = studentRecords.some(r => r.assess_num === selectedAssessNumFilter);
      }

      return matchName && matchGrade && matchClass && matchAssess;
    });
  }, [searchQuery, cleanSearchQuery, filterGrade, filterClassNum, selectedAssessNumFilter, students, attendance]);

  // If no student search but class is selected, show class records
  const classRecords = useMemo(() => {
    if (!searchQuery && filterGrade && filterClassNum && !selectedAssessNumFilter) {
      return records.filter(r => r.grade === filterGrade && r.class_num === Number(filterClassNum) && r.term_id === selectedTerm)
                    .sort((a, b) => a.assess_num - b.assess_num);
    }
    return [];
  }, [searchQuery, filterGrade, filterClassNum, selectedAssessNumFilter, records, selectedTerm]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Search className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>محرك البحث والبحث الصوتي</span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200">
                أوامر صوتية 🎤
              </span>
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              ابحث عن الطلاب بالاسم، كود الطالب، أو تحدث بالميكروفون للبحث بالصوت عن التقييمات
            </p>
          </div>
        </div>

        {/* Quick Voice Search Button */}
        <button
          onClick={startVoiceSearch}
          disabled={isListening}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0 ${
            isListening 
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>{isListening ? 'جاري الاستماع...' : 'استخدام الميكروفون للبحث'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Search Input with Microphone */}
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (selectedAssessNumFilter) setSelectedAssessNumFilter(null);
            }}
            placeholder="اسم الطالب، كود الطالب، أو رقم التقييم..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-11 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={startVoiceSearch}
            disabled={isListening}
            className={`absolute left-2 p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
            title="انقر للتحدث والبحث بالصوت"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Grade Filter */}
        <div className="relative">
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="">كل الصفوف</option>
            {GRADES.map(g => (
              <option key={g} value={g}>الصف {g}</option>
            ))}
          </select>
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Class Filter */}
        <div className="relative">
          <select
            value={filterClassNum}
            onChange={(e) => setFilterClassNum(e.target.value ? Number(e.target.value) : '')}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="">كل الفصول</option>
            {Array.from({ length: CLASSES_COUNT }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>فصل {num}</option>
            ))}
          </select>
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Voice Listening Banner */}
      {isListening && (
        <div className="bg-gradient-to-r from-rose-500 via-indigo-600 to-sky-600 text-white p-3.5 rounded-xl shadow-md flex items-center justify-between gap-3 animate-pulse mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-black">جاري الاستماع للبحث الصوتي...</p>
              <p className="text-[11px] text-rose-100 font-medium">{transcript || 'تحدث الآن مثل: "أحمد علي" أو "تقييم 5"'}</p>
            </div>
          </div>
          <button
            onClick={() => setIsListening(false)}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      )}

      {/* Speech Error Alert */}
      {speechError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-bold flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button onClick={() => setSpeechError(null)} className="text-rose-500 hover:text-rose-700 font-black cursor-pointer">✕</button>
        </div>
      )}

      {/* Active Assessment Filter Badge */}
      {selectedAssessNumFilter && (
        <div className="flex items-center gap-2 mb-4 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-indigo-900 w-fit">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>تصفية بحسب التقييم رقم {selectedAssessNumFilter}</span>
          <button
            onClick={() => setSelectedAssessNumFilter(null)}
            className="mr-2 text-indigo-500 hover:text-indigo-800 font-black cursor-pointer"
            title="إلغاء التصفية"
          >
            ✕
          </button>
        </div>
      )}

      {/* Voice Suggestions Tips */}
      <div className="flex flex-wrap items-center gap-2 mb-6 text-[11px] text-slate-500 font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
        <span className="text-indigo-600 font-black flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          أمثلة للأوامر الصوتية:
        </span>
        <button 
          onClick={() => { setSearchQuery('أحمد'); setSelectedAssessNumFilter(null); }}
          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
        >
          "طالب أحمد"
        </button>
        <button 
          onClick={() => { setSelectedAssessNumFilter(5); setSearchQuery('تقييم 5'); }}
          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
        >
          "تقييم 5"
        </button>
        <button 
          onClick={() => { setSelectedAssessNumFilter(10); setSearchQuery('تقييم 10'); }}
          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
        >
          "تقييم 10"
        </button>
      </div>

      {/* Results Area */}
      <div className="space-y-4">
        {(!searchQuery && !filterGrade && !filterClassNum && !selectedAssessNumFilter) ? (
          <div className="text-center py-8 text-slate-400 text-sm font-medium">
            استخدم حقول البحث أو انقر على الميكروفون للتحدث والبحث مباشرة
          </div>
        ) : searchQuery || filteredStudents.length > 0 || selectedAssessNumFilter ? (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm font-medium bg-slate-50 rounded-xl">
                لا توجد نتائج مطابقة لبحثك
              </div>
            ) : (
              <>
                {/* Legend Bar */}
                <div className="flex flex-wrap items-center justify-center gap-3 py-2 px-4 bg-slate-100/80 rounded-xl text-xs font-bold text-slate-600 border border-slate-200/60 shadow-xs">
                  <span className="text-slate-400 text-[11px]">دليل التقييمات الـ 15:</span>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: statusColors.present, boxShadow: `0 2px 4px ${statusColors.present}60` }}></span>
                    <span>حاضر</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: statusColors.absent, boxShadow: `0 2px 4px ${statusColors.absent}60` }}></span>
                    <span>غائب</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: statusColors.excused, boxShadow: `0 2px 4px ${statusColors.excused}60` }}></span>
                    <span>بعذر / تأجيل</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400/50 inline-block"></span>
                    <span>سادة (لم يُقيّم)</span>
                  </div>
                </div>

                {filteredStudents.map(student => {
                  const studentRecords = attendance.filter(a => a.student_id === student.id);
                  const recordByNum: Record<number, StudentAttendance> = {};
                  studentRecords.forEach(r => {
                    if (r.assess_num) recordByNum[r.assess_num] = r;
                  });

                  const presentCount = studentRecords.filter(r => r.status === 'present').length;
                  const absentCount = studentRecords.filter(r => r.status === 'absent').length;

                  return (
                    <div key={student.id} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3">
                      {/* Student Info Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold shrink-0">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-800 text-base leading-tight">{student.name}</h3>
                            <div className="text-xs text-slate-500 font-bold mt-0.5 flex items-center gap-2">
                              <span>الصف {student.grade} - فصل {student.class_num}</span>
                              {student.studentNumber && (
                                <span className="text-[11px] font-mono bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700">
                                  كود: {student.studentNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Counts */}
                        <div className="flex items-center gap-1.5 text-xs font-black">
                          <span
                            className="px-2.5 py-1 rounded-full border"
                            style={{ backgroundColor: `${statusColors.present}1a`, color: statusColors.present, borderColor: `${statusColors.present}40` }}
                          >
                            حاضر: {presentCount}
                          </span>
                          <span
                            className="px-2.5 py-1 rounded-full border"
                            style={{ backgroundColor: `${statusColors.absent}1a`, color: statusColors.absent, borderColor: `${statusColors.absent}40` }}
                          >
                            غائب: {absentCount}
                          </span>
                        </div>
                      </div>

                      {/* 15 Circles Container */}
                      <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs">
                        <div className="grid grid-cols-5 sm:flex sm:items-center sm:justify-between gap-2 sm:gap-1 p-1 bg-slate-50/50 rounded-xl dir-rtl justify-items-center">
                          {Array.from({ length: 15 }, (_, idx) => {
                            const assessNum = idx + 1;
                            const rec = recordByNum[assessNum];
                            const isHighlighted = selectedAssessNumFilter === assessNum;
                            
                            let customCircleStyle: React.CSSProperties = {
                              backgroundColor: '#e2e8f0',
                              color: '#334155',
                              border: isHighlighted ? '3px solid #6366f1' : '1px solid #cbd5e1',
                              transform: isHighlighted ? 'scale(1.15)' : 'none',
                            };
                            let statusText = "لم يُقيم بعد";

                            if (rec) {
                              if (rec.status === 'present') {
                                customCircleStyle = {
                                  backgroundColor: statusColors.present,
                                  color: '#ffffff',
                                  boxShadow: `0 2px 6px ${statusColors.present}60`,
                                  border: isHighlighted ? '3px solid #1e1b4b' : 'none',
                                  transform: isHighlighted ? 'scale(1.15)' : 'none',
                                };
                                statusText = "حاضر";
                              } else if (rec.status === 'absent') {
                                customCircleStyle = {
                                  backgroundColor: statusColors.absent,
                                  color: '#ffffff',
                                  boxShadow: `0 2px 6px ${statusColors.absent}60`,
                                  border: isHighlighted ? '3px solid #1e1b4b' : 'none',
                                  transform: isHighlighted ? 'scale(1.15)' : 'none',
                                };
                                statusText = "غائب";
                              } else if (rec.status === 'excused') {
                                customCircleStyle = {
                                  backgroundColor: statusColors.excused,
                                  color: '#ffffff',
                                  boxShadow: `0 2px 6px ${statusColors.excused}60`,
                                  border: isHighlighted ? '3px solid #1e1b4b' : 'none',
                                  transform: isHighlighted ? 'scale(1.15)' : 'none',
                                };
                                statusText = "بعذر / تأجيل";
                              }
                            }

                            return (
                              <div
                                key={assessNum}
                                title={`تقييم ${assessNum}: ${statusText}${rec?.notes ? ` (${rec.notes})` : ''}`}
                                className="w-8 h-8 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs sm:text-[11px] md:text-xs font-black shrink-0 transition-transform hover:scale-110 cursor-pointer select-none"
                                style={customCircleStyle}
                              >
                                {assessNum}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        ) : classRecords.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#0284c7]" />
              سجلات التقييم للصف {filterGrade} - فصل {filterClassNum}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {classRecords.map(rec => (
                <div key={rec.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-[#0284c7] text-sm">تقييم {rec.assess_num}</span>
                    <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {rec.assess_date}
                    </span>
                  </div>
                  {rec.notes && (
                    <p className="text-xs text-slate-600 bg-white p-2 rounded-md border border-slate-100 mt-2">
                      {rec.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm font-medium bg-slate-50 rounded-xl">
            لا توجد سجلات للفصل المحدد
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

