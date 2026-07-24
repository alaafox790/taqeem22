import re

with open('src/components/TeacherProfileModal.tsx', 'r') as f:
    content = f.read()

# Add getLastSyncTime import
content = content.replace(
    "import { fetchRawFirebaseRecords, getLocalRecords, saveLocalRecords, syncOfflineRecords } from '../lib/firebase';",
    "import { fetchRawFirebaseRecords, getLocalRecords, saveLocalRecords, syncOfflineRecords, getLastSyncTime } from '../lib/firebase';"
)

content = content.replace(
    "import { X, User, Check, Save, Calendar, Plus, Trash2, Database, AlertCircle, RefreshCw } from 'lucide-react';",
    "import { X, User, Check, Save, Calendar, Plus, Trash2, Database, AlertCircle, RefreshCw, Clock } from 'lucide-react';"
)

# Update activeTab type and initial state
content = content.replace(
    "const [activeTab, setActiveTab] = useState<'profile' | 'database'>('profile');",
    "const [activeTab, setActiveTab] = useState<'profile' | 'database' | 'sync'>('profile');"
)

# Add state for sync time and manual sync progress
state_vars = """
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
"""

content = content.replace(
    "const [isFixingDB, setIsFixingDB] = useState(false);",
    "const [isFixingDB, setIsFixingDB] = useState(false);\n" + state_vars
)

# Add Sync tab button
sync_btn = """
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
"""

content = content.replace(
    """            <button
              onClick={() => setActiveTab('database')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'database' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
            >
              قاعدة البيانات
            </button>""", sync_btn
)

# Add Sync Tab Content
sync_tab_content = """
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
"""

content = content.replace(
    "        {activeTab === 'profile' && (",
    sync_tab_content + "\n        {activeTab === 'profile' && ("
)

with open('src/components/TeacherProfileModal.tsx', 'w') as f:
    f.write(content)

print("Added Sync History successfully.")
