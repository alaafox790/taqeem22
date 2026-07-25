import React, { useState } from 'react';
import { Bell, BellRing, Calendar, Plus, Check, Trash2, X, Clock, User, Users, AlertCircle, AlertTriangle } from 'lucide-react';
import { Reminder, Student, TeacherProfile, AssessmentRecord, MonthInfo, TermId } from '../types';
import { LateAssessments } from './LateAssessments';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: Reminder[];
  onAddReminder: (reminder: { title: string; description?: string; targetType: 'student' | 'class' | 'general'; targetName?: string; reminderDate: string; notifyStudents?: boolean }) => void;
  onDeleteReminder: (id: string) => void;
  onToggleComplete: (id: string) => void;
  students: Student[];
  teacher: TeacherProfile;
  records?: AssessmentRecord[];
  selectedTerm?: TermId;
  academicYear?: string;
  onOpenAssessment?: (month: MonthInfo, assessNum: number, termId: TermId) => void;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({
  isOpen,
  onClose,
  reminders,
  onAddReminder,
  onDeleteReminder,
  onToggleComplete,
  students,
  teacher,
  records = [],
  selectedTerm = 'term1',
  academicYear = '2025/2026',
  onOpenAssessment
}) => {
  const [activeTab, setActiveTab] = useState<'late' | 'custom'>('late');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState<'student' | 'class' | 'general'>('class');
  const [targetName, setTargetName] = useState('');
  const [reminderDate, setReminderDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notifyStudents, setNotifyStudents] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const classesList = teacher.classesTaught 
    ? teacher.classesTaught.split(/[,،]/).map(s => s.trim()).filter(Boolean)
    : ['1/1', '1/2'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddReminder({
      title: title.trim(),
      description: description.trim() || undefined,
      targetType,
      targetName: targetType === 'general' ? undefined : targetName,
      reminderDate,
      notifyStudents
    });
    setTitle('');
    setDescription('');
    setNotifyStudents(false);
    setShowAddForm(false);
  };

  const activeRemindersCount = reminders.filter(r => !r.isCompleted).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-white text-slate-800 flex items-center justify-between border-b border-amber-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800">قسم التنبيهات والتقييمات المنسية</h2>
              <p className="text-xs text-slate-500 font-bold">متابعة التقييمات المتأخرة والتنبيهات المخصصة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-100 p-2 flex items-center justify-center gap-2 border-b border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('late')}
            className={`flex-1 py-2.5 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'late'
                ? 'bg-white text-rose-600 shadow-sm border border-rose-100'
                : 'text-slate-600 hover:text-slate-800:text-white'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>التقييمات المنسية (المتأخرة)</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2.5 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
              activeTab === 'custom'
                ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100'
                : 'text-slate-600 hover:text-slate-800:text-white'
            }`}
          >
            <Bell className="w-4 h-4 text-indigo-500" />
            <span>تنبيهات مخصصة</span>
            {activeRemindersCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {activeRemindersCount}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'late' ? (
            <div className="space-y-3">
              <LateAssessments
                teacherId={teacher.id}
                records={records}
                selectedTerm={selectedTerm}
                academicYear={academicYear}
                officialHolidays={teacher.officialHolidays || []}
                onOpenAssessment={(month, assessNum, termId) => {
                  if (onOpenAssessment) {
                    onOpenAssessment(month, assessNum, termId);
                  }
                  onClose();
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add Button / Form Toggle */}
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة تنبيه مخصص جديد</span>
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-600">تنبيه جديد</span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-xs text-slate-500 hover:text-slate-700:text-slate-300 font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">عنوان التنبيه *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="مثال: متابعة واجب الطالب / امتحان قصير"
                      required
                      className="w-full bg-white text-slate-800 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نوع التنبيه</label>
                      <select
                        value={targetType}
                        onChange={(e) => {
                          const val = e.target.value as 'student' | 'class' | 'general';
                          setTargetType(val);
                          setTargetName('');
                        }}
                        className="w-full bg-white text-slate-800 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="class">فصل دراسي كامل</option>
                        <option value="student">طالب محدد</option>
                        <option value="general">عام (للمعلم)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التنبيه *</label>
                      <input
                        type="date"
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                        required
                        className="w-full bg-white text-slate-800 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {targetType === 'class' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">اختر الفصل</label>
                      <select
                        value={targetName}
                        onChange={(e) => setTargetName(e.target.value)}
                        className="w-full bg-white text-slate-800 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="">اختر الفصل...</option>
                        {classesList.map(c => (
                          <option key={c} value={c}>فصل {c}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {targetType === 'student' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">اختر الطالب</label>
                      <select
                        value={targetName}
                        onChange={(e) => setTargetName(e.target.value)}
                        className="w-full bg-white text-slate-800 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="">اختر الطالب...</option>
                        {students.map(s => (
                          <option key={s.id} value={s.name}>{s.name} (فصل {s.class_num})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل أو ملاحظات (اختياري)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      placeholder="ملاحظات إضافية حول التنبيه..."
                      className="w-full bg-white text-slate-800 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="notifyStudents"
                      checked={notifyStudents}
                      onChange={(e) => setNotifyStudents(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="notifyStudents" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                      إرسال تنبيه للطلاب بموعد التقييم
                    </label>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs shadow-sm transition-all cursor-pointer"
                    >
                      حفظ التنبيه
                    </button>
                  </div>
                </form>
              )}

              {/* List of Reminders */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black text-slate-600">قائمة التنبيهات المحفوظة ({reminders.length})</h3>

                {reminders.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Bell className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold text-slate-500">لا توجد تنبيهات مخصصة حالياً</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">اضغط على زر الإضافة أعلاه لإعداد تنبيه جديد</p>
                  </div>
                ) : (
                  reminders.map((rem) => {
                    const isToday = rem.reminderDate === new Date().toISOString().split('T')[0];
                    const isOverdue = rem.reminderDate < new Date().toISOString().split('T')[0] && !rem.isCompleted;

                    return (
                      <div
                        key={rem.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                          rem.isCompleted
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : isToday
                            ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                            : isOverdue
                            ? 'bg-rose-50/80 border-rose-300'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => onToggleComplete(rem.id)}
                            className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                              rem.isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 bg-white hover:border-indigo-500'
                            }`}
                            title={rem.isCompleted ? 'إلغاء التحديد' : 'تحديد كمكتمل'}
                          >
                            {rem.isCompleted && <Check className="w-3.5 h-3.5" />}
                          </button>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className={`text-xs sm:text-sm font-black ${rem.isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                {rem.title}
                              </h4>
                              {rem.targetType !== 'general' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                                  {rem.targetType === 'student' ? <User className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                  <span>{rem.targetName}</span>
                                </span>
                              )}
                              {rem.notifyStudents && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <BellRing className="w-3 h-3" />
                                  <span>تنبيه للطلاب</span>
                                </span>
                              )}
                            </div>

                            {rem.description && (
                              <p className="text-xs text-slate-600 font-medium">{rem.description}</p>
                            )}

                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {rem.reminderDate}
                              </span>
                              {isToday && !rem.isCompleted && (
                                <span className="text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded font-black">مطلوب اليوم</span>
                              )}
                              {isOverdue && (
                                <span className="text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded font-black">متأخر</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteReminder(rem.id)}
                          className="text-slate-400 hover:text-rose-600:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50:bg-rose-950/50 transition-all cursor-pointer"
                          title="حذف التنبيه"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-200 hover:bg-slate-300:bg-slate-600 text-slate-800 rounded-xl font-bold text-xs transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
