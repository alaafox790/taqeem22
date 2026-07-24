import re

with open('src/components/TeacherProfileModal.tsx', 'r') as f:
    content = f.read()

# Add imports
content = content.replace(
    "import { X, User, Check, Save, Calendar, Plus, Trash2 } from 'lucide-react';",
    "import { X, User, Check, Save, Calendar, Plus, Trash2, Database, AlertCircle, RefreshCw } from 'lucide-react';\nimport { fetchRawFirebaseRecords, getLocalRecords, saveLocalRecords, syncOfflineRecords } from '../lib/firebase';"
)

state_vars = """
  const [activeTab, setActiveTab] = useState<'profile' | 'database'>('profile');
  
  // Database Checker states
  const [isCheckingDB, setIsCheckingDB] = useState(false);
  const [dbCheckStatus, setDbCheckStatus] = useState<'idle' | 'checking' | 'done'>('idle');
  const [missingInFirebase, setMissingInFirebase] = useState<any[]>([]);
  const [missingLocally, setMissingLocally] = useState<any[]>([]);
  const [isFixingDB, setIsFixingDB] = useState(false);
"""

content = content.replace("const [savedSuccess, setSavedSuccess] = useState(false);", "const [savedSuccess, setSavedSuccess] = useState(false);\n" + state_vars)

checker_logic = """
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
"""

content = content.replace("const handleAddHoliday = () => {", checker_logic + "\n  const handleAddHoliday = () => {")

# Header Tabs
header_old = """        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-800 text-emerald-400 flex items-center justify-center shadow-md">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">بيانات المعلم وإعدادات قاعدة البيانات</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">قم بتحديث معلومات الملف الشخصي وضبط الربط مع قاعدة البيانات</p>
          </div>
        </div>"""

header_new = """        {/* Modal Header */}
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
          </div>
        </div>"""

content = content.replace(header_old, header_new)

form_start = '        <form onSubmit={handleSubmit} className="space-y-6">'

parts = content.split(form_start)
if len(parts) == 2:
    top_part = parts[0]
    bottom_part = parts[1]
    
    db_checker_view = """
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
"""

    bottom_part_mod = bottom_part.replace("        </form>", "          </form>\n        )}")
    new_bottom = "        {activeTab === 'profile' && (\n          <form onSubmit={handleSubmit} className=\"space-y-6\">\n" + bottom_part_mod
    
    final_content = top_part + db_checker_view + new_bottom
    with open('src/components/TeacherProfileModal.tsx', 'w') as f:
        f.write(final_content)
    print("Patched successfully!")
else:
    print("Could not split form")
