import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, BookOpen, Clock, AlertTriangle, User, Users } from 'lucide-react';
import { AssessmentRecord, Student, StudentAttendance, TermId } from '../types';
import { GRADES, CLASSES_COUNT } from '../lib/constants';
import { fetchFirebaseStudents, fetchFirebaseAttendance } from '../lib/firebase';

interface AssessmentSearchProps {
  teacherId: string;
  records: AssessmentRecord[];
  selectedTerm: TermId;
}

const ROSTER_STORAGE_KEY = 'school_assessments_students_roster_v1';
const ATTENDANCE_STORAGE_KEY = 'school_assessments_attendance_v1';

export const AssessmentSearch: React.FC<AssessmentSearchProps> = ({ records, selectedTerm, teacherId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('');
  const [filterClassNum, setFilterClassNum] = useState<number | ''>('');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);

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

  // Filter students based on search criteria
  const filteredStudents = useMemo(() => {
    if (!searchQuery && !filterGrade && !filterClassNum) return [];
    
    return students.filter(s => {
      const matchName = searchQuery ? s.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      const matchGrade = filterGrade ? s.grade === filterGrade : true;
      const matchClass = filterClassNum ? s.class_num === Number(filterClassNum) : true;
      return matchName && matchGrade && matchClass;
    });
  }, [searchQuery, filterGrade, filterClassNum, students]);

  // If no student search but class is selected, show class records
  const classRecords = useMemo(() => {
    if (!searchQuery && filterGrade && filterClassNum) {
      return records.filter(r => r.grade === filterGrade && r.class_num === Number(filterClassNum) && r.term_id === selectedTerm)
                    .sort((a, b) => a.assess_num - b.assess_num);
    }
    return [];
  }, [searchQuery, filterGrade, filterClassNum, records, selectedTerm]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Search className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">محرك البحث</h2>
            <p className="text-slate-500 font-medium mt-1">ابحث عن الطلاب بالاسم أو الحرف، أو استعرض فصولاً محددة</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="اسم الطالب..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent transition-all"
          />
        </div>

        {/* Grade Filter */}
        <div className="relative">
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent transition-all appearance-none"
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
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent transition-all appearance-none"
          >
            <option value="">كل الفصول</option>
            {Array.from({ length: CLASSES_COUNT }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>فصل {num}</option>
            ))}
          </select>
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Results Area */}
      <div className="space-y-4">
        {(!searchQuery && !filterGrade && !filterClassNum) ? (
          <div className="text-center py-8 text-slate-400 text-sm font-medium">
            استخدم حقول البحث لعرض السجلات
          </div>
        ) : searchQuery || filteredStudents.length > 0 ? (
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
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/40 inline-block"></span>
                    <span>حاضر</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs shadow-rose-500/40 inline-block"></span>
                    <span>غائب</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs shadow-amber-500/40 inline-block"></span>
                    <span>عذر</span>
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
                            <div className="text-xs text-slate-500 font-bold mt-0.5">
                              الصف {student.grade} - فصل {student.class_num}
                            </div>
                          </div>
                        </div>

                        {/* Counts */}
                        <div className="flex items-center gap-1.5 text-xs font-black">
                          <span className="bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200/80">
                            حاضر: {presentCount}
                          </span>
                          <span className="bg-rose-100/80 text-rose-800 px-2.5 py-1 rounded-full border border-rose-200/80">
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
                            
                            let circleStyle = "bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300"; // Plain/sada (not taken)
                            let statusText = "لم يُقيم بعد";

                            if (rec) {
                              if (rec.status === 'present') {
                                circleStyle = "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xs shadow-emerald-500/40 ring-1 ring-emerald-300";
                                statusText = "حاضر";
                              } else if (rec.status === 'absent') {
                                circleStyle = "bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-xs shadow-rose-500/40 ring-1 ring-rose-300";
                                statusText = "غائب";
                              } else if (rec.status === 'excused') {
                                circleStyle = "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xs shadow-amber-500/40 ring-1 ring-amber-300";
                                statusText = "بعذر";
                              }
                            }

                            return (
                              <div
                                key={assessNum}
                                title={`تقييم ${assessNum}: ${statusText}${rec?.notes ? ` (${rec.notes})` : ''}`}
                                className={`w-8 h-8 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs sm:text-[11px] md:text-xs font-black shrink-0 transition-transform hover:scale-110 cursor-pointer select-none ${circleStyle}`}
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
