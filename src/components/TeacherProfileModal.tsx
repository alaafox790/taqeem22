import React, { useState } from 'react';
import { X, User, Check, Save, Calendar, Plus, Trash2, Database, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { fetchRawFirebaseRecords, getLocalRecords, saveLocalRecords, syncOfflineRecords, getLastSyncTime } from '../lib/firebase';
import { TeacherProfile } from '../types';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherProfile;
  onSaveTeacher: (updated: TeacherProfile) => void;
  onRefreshData: () => void;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onSaveTeacher,
  onRefreshData,
}) => {
  const [name, setName] = useState(teacher.name);
  const [id, setId] = useState(teacher.id);
  const [subject, setSubject] = useState(teacher.subject);
  const [school, setSchool] = useState(teacher.school);
  const [subjectIcon, setSubjectIcon] = useState(teacher.subjectIcon || "Book");
  const [supervisorPhone, setSupervisorPhone] = useState(teacher.supervisorPhone || '');
  const [principalPhone, setPrincipalPhone] = useState(teacher.principalPhone || '');
  const [deputyPhone, setDeputyPhone] = useState(teacher.deputyPhone || '');
  const [officialHolidays, setOfficialHolidays] = useState<string[]>(teacher.officialHolidays || []);
  const [newHoliday, setNewHoliday] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState<'profile' | 'database' | 'sync'>('profile');
  
  // Database Checker states
  const [isCheckingDB, setIsCheckingDB] = useState(false);
  const [dbCheckStatus, setDbCheckStatus] = useState<'idle' | 'checking' | 'done'>('idle');
  const [missingInFirebase, setMissingInFirebase] = useState<any[]>([]);
  const [missingLocally, setMissingLocally] = useState<any[]>([]);
  const [isFixingDB, setIsFixingDB] = useState(false);

  const [lastSync, setLastSync] = useState<string | null>(getLastSyncTime(teacher.id));
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [manualSyncResult, setManualSyncResult] = useState<'idle' | 'success' | 'error'>('idle');
  
  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setManualSyncResult('idle');
    try {
      const success = await syncOfflineRecords(teacher.id);
      if (success) {
        setLastSync(getLastSyncTime(teacher.id));
        setManualSyncResult('success');
      } else {
        setManualSyncResult('error');
      }
    } catch(e) {
      setManualSyncResult('error');
    } finally {
      setIsManualSyncing(false);
      setTimeout(() => setManualSyncResult('idle'), 3000);
    }
  };



  
  const handleCheckDatabase = async () => {
    setIsCheckingDB(true);
    setDbCheckStatus('checking');
    try {
      const local = getLocalRecords().filter(r => r.teacher_id === teacher.id);
      const remote = await fetchRawFirebaseRecords(teacher.id);
      
      const localMap = new Map(local.map(r => [r.id, r]));
      const remoteMap = new Map(remote.map(r => [r.id, r]));
      
      const missingRemote = local.filter(r => !remoteMap.has(r.id));
      const missingLocal = remote.filter(r => !localMap.has(r.id));
      
      setMissingInFirebase(missingRemote);
      setMissingLocally(missingLocal);
      setDbCheckStatus('done');
    } catch (e) {
      console.error(e);
      setDbCheckStatus('idle');
    } finally {
      setIsCheckingDB(false);
    }
  };

  const handleFixDatabase = async () => {
    setIsFixingDB(true);
    try {
      // 1. Upload missing in firebase
      if (missingInFirebase.length > 0) {
        await syncOfflineRecords(teacher.id);
      }
      
      // 2. Save missing locally
      if (missingLocally.length > 0) {
        const allLocal = getLocalRecords();
        saveLocalRecords([...allLocal, ...missingLocally]);
      }
      
      // Re-check
      await handleCheckDatabase();
      onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsFixingDB(false);
    }
  };

  const handleAddHoliday = () => {
    if (newHoliday && !officialHolidays.includes(newHoliday)) {
      setOfficialHolidays([...officialHolidays, newHoliday].sort());
      setNewHoliday('');
    }
  };

  const handleRemoveHoliday = (date: string) => {
    setOfficialHolidays(officialHolidays.filter(d => d !== date));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTeacher({
      id: id.trim() || 'T-1001',
      name: name.trim() || 'المعلم الفاضل',
      subject: subject.trim() || 'العامة',
      school: school.trim() || 'المدرسة',
      supervisorPhone: supervisorPhone.trim(),
      principalPhone: principalPhone.trim(),
      deputyPhone: deputyPhone.trim(),
      subjectIcon: subjectIcon,
      officialHolidays: officialHolidays,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onRefreshData();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative border border-slate-100 dark:border-slate-800 my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-800 text-emerald-400 flex items-center justify-center shadow-md">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">الإعدادات والملف الشخصي</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">تحديث البيانات أو فحص قاعدة البيانات</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
            >
              البيانات الشخصية
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'database' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
            >
              قاعدة البيانات
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'sync' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
            >
              سجل المزامنة
            </button>

          </div>
        </div>


        {activeTab === 'database' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">فحص ومزامنة السجلات</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
                    تقوم هذه الأداة بمطابقة التقييمات المحفوظة على جهازك مع السحابة (Firebase) للبحث عن أي سجلات مفقودة أو متضاربة وإصلاحها.
                  </p>
                  
                  <button
                    type="button"
                    onClick={handleCheckDatabase}
                    disabled={isCheckingDB}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isCheckingDB ? 'animate-spin' : ''}`} />
                    {isCheckingDB ? 'جاري الفحص...' : 'بدء الفحص'}
                  </button>
                </div>
              </div>
            </div>

            {dbCheckStatus === 'done' && (
              <div className="space-y-4 animate-in zoom-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border ${missingInFirebase.length > 0 ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50'}`}>
                    <h4 className={`font-bold flex items-center gap-2 mb-2 ${missingInFirebase.length > 0 ? 'text-amber-800 dark:text-amber-400' : 'text-emerald-800 dark:text-emerald-400'}`}>
                      {missingInFirebase.length > 0 ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      سجلات مفقودة في السحابة
                    </h4>
                    <p className={`text-3xl font-black ${missingInFirebase.length > 0 ? 'text-amber-700 dark:text-amber-500' : 'text-emerald-700 dark:text-emerald-500'}`}>
                      {missingInFirebase.length}
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${missingLocally.length > 0 ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50'}`}>
                    <h4 className={`font-bold flex items-center gap-2 mb-2 ${missingLocally.length > 0 ? 'text-amber-800 dark:text-amber-400' : 'text-emerald-800 dark:text-emerald-400'}`}>
                      {missingLocally.length > 0 ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      سجلات مفقودة في الجهاز
                    </h4>
                    <p className={`text-3xl font-black ${missingLocally.length > 0 ? 'text-amber-700 dark:text-amber-500' : 'text-emerald-700 dark:text-emerald-500'}`}>
                      {missingLocally.length}
                    </p>
                  </div>
                </div>

                {(missingInFirebase.length > 0 || missingLocally.length > 0) && (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium text-center sm:text-right">
                      تم العثور على اختلافات. يمكنك النقر على زر الإصلاح لدمج السجلات بشكل آمن.
                    </p>
                    <button
                      onClick={handleFixDatabase}
                      disabled={isFixingDB}
                      className="shrink-0 flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold rounded-xl transition-all disabled:opacity-50 w-full sm:w-auto"
                    >
                      <RefreshCw className={`w-4 h-4 ${isFixingDB ? 'animate-spin' : ''}`} />
                      {isFixingDB ? 'جاري الإصلاح...' : 'إصلاح السجلات'}
                    </button>
                  </div>
                )}
                
                {missingInFirebase.length === 0 && missingLocally.length === 0 && (
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                    قاعدة البيانات متزامنة بالكامل! لا توجد سجلات مفقودة.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">سجل المزامنة مع السحابة</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
                    يمكنك هنا مراجعة آخر وقت تمت فيه مزامنة بياناتك مع السحابة، وإعادة المحاولة يدوياً في حال فشل إرسال بعض البيانات سابقاً.
                  </p>
                  
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">آخر عملية مزامنة ناجحة</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {lastSync ? new Date(lastSync).toLocaleString('ar-SA') : 'لم تتم أي مزامنة بعد'}
                      </p>
                    </div>
                    {lastSync && (
                      <Check className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isManualSyncing}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isManualSyncing ? 'animate-spin' : ''}`} />
                    {isManualSyncing ? 'جاري المزامنة...' : 'مزامنة البيانات الآن'}
                  </button>
                  
                  {manualSyncResult === 'success' && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mt-3 flex items-center gap-1">
                      <Check className="w-4 h-4" /> تمت المزامنة بنجاح!
                    </p>
                  )}
                  {manualSyncResult === 'error' && (
                    <p className="text-sm text-rose-600 dark:text-rose-400 font-bold mt-3 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> فشلت عملية المزامنة. يرجى التحقق من اتصالك بالإنترنت.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit} className="space-y-6">

          
          {/* Section 1: Teacher Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              البيانات الشخصية والمهنية
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">اسم المعلم *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                  placeholder="مثال: د. أحمد محمود"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">كود / رقم المعلم *</label>
                <input
                  type="text"
                  required
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                  placeholder="مثال: T-1001"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">المادة الدراسية</label>
                <div className="flex gap-2">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                  >
                    <option value="اللغة العربية">اللغة العربية</option>
                    <option value="اللغة الانجليزية">اللغة الانجليزية</option>
                    <option value="الدراسات الاجتماعية">الدراسات الاجتماعية</option>
                    <option value="العلوم">العلوم</option>
                    <option value="الرياضيات">الرياضيات</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                  
                  <div className="relative group">
                    <select
                      value={subjectIcon}
                      onChange={(e) => setSubjectIcon(e.target.value)}
                      className="w-14 appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50 text-center"
                      title="أيقونة المادة"
                    >
                      <option value="Book">📖</option>
                      <option value="Calculator">➗</option>
                      <option value="Globe">🌍</option>
                      <option value="FlaskConical">🧪</option>
                      <option value="Languages">🔤</option>
                      <option value="Music">🎵</option>
                      <option value="Palette">🎨</option>
                      <option value="PenTool">✒️</option>
                      <option value="Dna">🧬</option>
                      <option value="Code">💻</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">اسم المدرسة</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                  placeholder="مثال: مدرسة الأمل النموذجية"
                />
              </div>
              
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم هاتف مدير المدرسة (للربط)</label>
                <input
                  type="tel"
                  value={principalPhone}
                  onChange={(e) => setPrincipalPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                  placeholder="05xxxxxxxxx"
                  dir="ltr"
                />
              </div>
              
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم هاتف وكيل شئون الطلاب (للربط)</label>
                <input
                  type="tel"
                  value={deputyPhone}
                  onChange={(e) => setDeputyPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                  placeholder="05xxxxxxxxx"
                  dir="ltr"
                />
              </div>
              
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم هاتف مشرف المادة (للربط)</label>
                <input
                  type="tel"
                  value={supervisorPhone}
                  onChange={(e) => setSupervisorPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50"
                  placeholder="05xxxxxxxxx"
                  dir="ltr"
                />
              </div>
            
</div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  تم الحفظ بنجاح
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ البيانات
                </>
              )}
            </button>
          </div>

          </form>
        )}
      </div>
    </div>
  );
};
