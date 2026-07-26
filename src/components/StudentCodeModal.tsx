import React, { useState } from 'react';
import { 
  X, Key, RefreshCw, Printer, Copy, Check, MessageCircle, Sparkles, 
  Search, ShieldCheck, GraduationCap, School, Phone, Share2, Download, AlertCircle 
} from 'lucide-react';
import { Student, TeacherProfile } from '../types';
import { autoAssignStudentCodes, regenerateAllStudentCodes, generateStudentCode } from '../lib/codeGenerator';

interface StudentCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onUpdateStudents: (updatedStudents: Student[]) => void;
  teacher?: TeacherProfile;
  selectedGrade?: string;
  selectedClassNum?: number | '';
  showToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const StudentCodeModal: React.FC<StudentCodeModalProps> = ({
  isOpen,
  onClose,
  students,
  onUpdateStudents,
  teacher,
  selectedGrade = '',
  selectedClassNum = '',
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'cards' | 'share'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [filterClassOnly, setFilterClassOnly] = useState(true);

  if (!isOpen) return null;

  // Filter students based on current selection or search
  const filteredStudents = students.filter((s) => {
    if (filterClassOnly && selectedGrade && selectedClassNum) {
      if (s.grade !== selectedGrade || s.class_num !== Number(selectedClassNum)) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.studentNumber && s.studentNumber.toLowerCase().includes(q)) ||
        (s.parentPhone && s.parentPhone.includes(q))
      );
    }
    return true;
  });

  // Auto assign missing codes on load if any
  const handleAutoGenerateMissing = () => {
    const { updatedStudents, generatedCount } = autoAssignStudentCodes(students);
    onUpdateStudents(updatedStudents);
    if (showToast) {
      if (generatedCount > 0) {
        showToast('success', 'تم توليد الأكواد بنجاح 🔑', `تم توليد أكواد دخول جديدة لـ ${generatedCount} طالب/طالبة`);
      } else {
        showToast('info', 'جميع الطلاب لديهم أكواد بالفعل', 'لم يتم العثور على طلاب بدون أكواد دخول');
      }
    }
  };

  // Regenerate all codes
  const handleRegenerateAll = () => {
    if (window.confirm('هل أنت تأكد من إعادة توليد أكواد جديدة لجميع الطلاب؟ سيلزم إعطاء الأكواد الجديدة للطلاب للدخول بها.')) {
      const updated = regenerateAllStudentCodes(students);
      onUpdateStudents(updated);
      if (showToast) {
        showToast('success', 'تم تحديث جميع الأكواد 🎲', 'تم توليد أكواد فريدة جديدة لكل الطلاب بنجاح');
      }
    }
  };

  // Edit single student code
  const handleSingleCodeChange = (studentId: string, newCode: string) => {
    const updated = students.map((s) => (s.id === studentId ? { ...s, studentNumber: newCode.trim().toUpperCase() } : s));
    onUpdateStudents(updated);
  };

  // Copy single student code info
  const handleCopySingle = (student: Student) => {
    const text = `عزيزي ولي أمر الطالب/ة (${student.name}) - الصف ${student.grade} فصل ${student.class_num}
كود دخول بوابة الطالب الإلكترونية: ${student.studentNumber || 'لم ينشأ بعد'}
رقم الجوال المعتمد: ${student.parentPhone || 'غير مسجل'}
معلم المادة: أ. ${teacher?.name || 'معلم الفصل'}`;

    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy all students text report
  const handleCopyAllText = () => {
    const lines = filteredStudents.map(
      (s, idx) => `${idx + 1}. ${s.name} (صف ${s.grade}/${s.class_num}) | الكود: ${s.studentNumber || '---'} | الجوال: ${s.parentPhone || 'غير مسجل'}`
    );
    const text = `📋 قائمة أكواد دخول الطلاب - ${teacher?.school || 'المدرسة'}\nالمعلم: أ. ${teacher?.name || ''} (${teacher?.subject || ''})\n` +
      `===============================\n` +
      lines.join('\n');

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    if (showToast) {
      showToast('success', 'تم النسخ بنجاح 📋', 'تم نسخ أكواد جميع الطلاب المسجلين للحافظة');
    }
  };

  // Send WhatsApp message to parent
  const handleWhatsAppShare = (student: Student) => {
    if (!student.parentPhone) {
      alert('لا يوجد رقم جوال مسجل لولي أمر هذا الطالب');
      return;
    }
    const cleanPhone = student.parentPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '966' + cleanPhone.slice(1) : cleanPhone;
    
    const message = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته\n` +
      `ولي أمر الطالب/ة: ${student.name}\n` +
      `الصف: ${student.grade} - فصل: ${student.class_num}\n\n` +
      `🔑 كود الدخول الخاص بالطالب لبوابة التقييمات: *${student.studentNumber || 'غير كود'}*\n` +
      `📱 رقم الجوال المسجل: ${student.parentPhone}\n\n` +
      `يرجى الدخول للرابط التالي واختيار (بوابة الطالب) لمتابعة تقارير الحضور والتقييمات اليومية:\n` +
      `مع تحيات معلم المادة: أ. ${teacher?.name || ''}`
    );

    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  // Print cards
  const handlePrintCards = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 dir-rtl select-none overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 text-amber-300 flex items-center justify-center shadow-inner">
              <Key className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                مولد أكواد الدخول وكروت الطلاب
                <span className="bg-amber-400/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-400/30">
                  ربط المعلم والطالب
                </span>
              </h2>
              <p className="text-xs text-sky-200/80 font-bold mt-0.5">
                توليد وطباعة أكواد الدخول الفردية للطلاب للتسجيل في بوابة المتابعة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl border border-slate-300/60">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'table' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-300/60'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>إدارة الأكواد ({filteredStudents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'cards' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-300/60'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>كروت الدخول للطباعة 🖨️</span>
            </button>

            <button
              onClick={() => setActiveTab('share')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'share' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-300/60'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>إرسال وتصدير للواتساب</span>
            </button>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoGenerateMissing}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>توليد للأكواد المفقودة</span>
            </button>

            <button
              onClick={handleRegenerateAll}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة توليد للكل 🎲</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الطالب، الكود، أو الجوال..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>

          {selectedGrade && selectedClassNum && (
            <label className="flex items-center gap-2 text-xs font-black text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filterClassOnly}
                onChange={(e) => setFilterClassOnly(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded-md focus:ring-sky-500"
              />
              <span>تصفية حسب الصف {selectedGrade} - فصل {selectedClassNum} فقط</span>
            </label>
          )}
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">

          {/* TAB 1: CODES TABLE */}
          {activeTab === 'table' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  💡 <b>كيف يعمل كود الطالب؟</b> كل طالب يحصل على كود فريد مكون من أرقام فقط (مثل 41712). عند دخول الطالب للبوابة الإلكترونية، يدخل رقم جوال ولي الأمر المسجل مع الكود ليتم ربطه بالفصل والتقييمات.
                </span>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Key className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500">لا يوجد طلاب مطابقون للبحث الحالي</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-12 text-center">م</th>
                        <th className="p-3">اسم الطالب</th>
                        <th className="p-3">الصف والفصل</th>
                        <th className="p-3">جوال ولي الأمر</th>
                        <th className="p-3">كود الطالب للدخول</th>
                        <th className="p-3 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold">
                      {filteredStudents.map((student, idx) => (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                          <td className="p-3 text-slate-900 font-black">{student.name}</td>
                          <td className="p-3 text-slate-600">الصف {student.grade} ({student.class_num})</td>
                          <td className="p-3 font-mono text-slate-700 dir-ltr text-right">
                            {student.parentPhone || <span className="text-slate-300 font-sans">غير مسجل</span>}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={student.studentNumber || ''}
                                onChange={(e) => handleSingleCodeChange(student.id, e.target.value)}
                                placeholder="00000"
                                className="w-28 px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs font-mono font-black text-center focus:ring-2 focus:ring-amber-500"
                              />
                              <button
                                onClick={() => {
                                  const existingCodes = new Set(students.map((s) => s.studentNumber).filter(Boolean) as string[]);
                                  const newCode = generateStudentCode(existingCodes);
                                  handleSingleCodeChange(student.id, newCode);
                                }}
                                title="توليد كود عشوائي جديد لهذا الطالب"
                                className="p-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleCopySingle(student)}
                                className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[11px] font-black flex items-center gap-1 border border-sky-200 cursor-pointer"
                              >
                                {copiedId === student.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedId === student.id ? 'تم النسخ' : 'نسخ'}</span>
                              </button>

                              <button
                                onClick={() => handleWhatsAppShare(student)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-black flex items-center gap-1 border border-emerald-200 cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>واتساب</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRINTABLE ACCESS CARDS */}
          {activeTab === 'cards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-sky-50 p-3 rounded-2xl border border-sky-200">
                <p className="text-xs font-extrabold text-sky-900">
                  🖨️ معاينة كروت الطلاب الجاهزة للطباعة والتقطيع التسليم في الفصل
                </p>
                <button
                  onClick={handlePrintCards}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة جميع الكروت</span>
                </button>
              </div>

              {/* Grid of Student Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-white rounded-2xl border-2 border-indigo-200 p-4 shadow-sm relative overflow-hidden space-y-3 print:break-inside-avoid print:border-slate-800"
                  >
                    {/* Top Header Card */}
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                          <School className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-xs text-slate-900">{teacher?.school || 'المدرسة الابتدائية'}</h4>
                          <p className="text-[10px] font-bold text-slate-500">معلم المادة: أ. {teacher?.name || 'معلم الفصل'}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                        بطاقة دخول ولي الأمر
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">اسم الطالب/ة</span>
                        <span className="font-black text-slate-900 truncate block">{student.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">الصف / الفصل</span>
                        <span className="font-extrabold text-slate-800">الصف {student.grade} (فصل {student.class_num})</span>
                      </div>
                    </div>

                    {/* Highlighted Login Code Box */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-amber-800 font-black block">كود الدخول لبوابة الطالب:</span>
                        <span className="text-xl font-mono font-black text-amber-900 tracking-wider">
                          {student.studentNumber || '----'}
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-amber-800 font-black block">جوال ولي الأمر:</span>
                        <span className="text-xs font-mono font-bold text-slate-800 dir-ltr">
                          {student.parentPhone || 'غير مسجل'}
                        </span>
                      </div>
                    </div>

                    {/* Footer instructions */}
                    <p className="text-[9px] text-slate-500 font-bold text-center pt-1 border-t border-slate-100">
                      💡 ادخل المنصة واختر (بوابة الطالب) وأدخل رقم الجوال وكود الطالب لمتابعة الحضور والتقييمات.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SHARE & WHATSAPP BROADCAST */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    <span>مشاركة قائمة الأكواد وإرسالها لأولياء الأمور</span>
                  </div>

                  <button
                    onClick={handleCopyAllText}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAll ? 'تم النسخ بالكامل' : 'نسخ الرسالة الشاملة للواتساب'}</span>
                  </button>
                </div>

                <p className="text-xs text-emerald-800 font-bold leading-relaxed">
                  يمكنك إما نسخ القائمة كاملة ولصقها في مجموعة الواتساب الخاصة بالفصل، أو الضغط على زر "إرسال فردي" لإرسال رسالة خاصة لكل ولي أمر تحتوي كود طالبه فقط.
                </p>
              </div>

              {/* Direct Individual WhatsApp List */}
              <div className="space-y-2">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-900">{student.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold">
                          الصف {student.grade} - فصل {student.class_num} | الجوال: {student.parentPhone || 'غير مسجل'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-xl font-mono text-xs font-black border border-amber-300">
                        {student.studentNumber || '----'}
                      </span>

                      <button
                        onClick={() => handleWhatsAppShare(student)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>إرسال واتساب</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-bold">
            إجمالي الطلاب المعروضين: <span className="text-slate-900 font-black">{filteredStudents.length} طالب</span>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
