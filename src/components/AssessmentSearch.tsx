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
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm font-medium bg-slate-50 rounded-xl">
                لا توجد نتائج مطابقة لبحثك
              </div>
            ) : (
              filteredStudents.map(student => {
                const studentRecords = attendance.filter(a => a.student_id === student.id)
                  .sort((a, b) => a.assess_num - b.assess_num);
                
                return (
                  <div key={student.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-[#0284c7]" />
                        <h3 className="font-bold text-slate-800">{student.name}</h3>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                        الصف {student.grade} - فصل {student.class_num}
                      </span>
                    </div>
                    
                    {studentRecords.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-2">لا توجد سجلات تقييم لهذا الطالب</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {studentRecords.map(rec => (
                          <div key={rec.id} className="bg-white border border-slate-200 rounded-lg p-2 text-center shadow-sm">
                            <div className="text-xs font-black text-slate-700 mb-1">تقييم {rec.assess_num}</div>
                            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block ${
                              rec.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                              rec.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {rec.status === 'present' ? 'حاضر' : rec.status === 'absent' ? 'غائب' : 'عذر'}
                            </div>
                            {rec.notes && <div className="text-[10px] text-slate-500 mt-1 truncate" title={rec.notes}>{rec.notes}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
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
