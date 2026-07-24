import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# Add AlertTriangle to imports
content = content.replace("Activity, FileText, BarChart3, Phone, ChevronRight, Book", "Activity, FileText, BarChart3, Phone, ChevronRight, Book, AlertTriangle")

header_old = """      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-emerald-400 shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {adminRole === 'principal' ? 'لوحة تحكم مدير المدرسة' : 
               adminRole === 'deputy' ? 'لوحة تحكم وكيل شئون الطلاب' : 
               'لوحة تحكم مشرف المادة'}
            </h2>
            <p className="text-slate-500 font-medium mt-1">متابعة سجلات التقييم للمعلمين</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            setIsAuthenticated(false);
            setAdminPhone('');
            setSelectedSubject(null);
            setSelectedTeacher(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>"""

header_new = """      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-emerald-400 shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {adminRole === 'principal' ? 'لوحة تحكم مدير المدرسة' : 
               adminRole === 'deputy' ? 'لوحة تحكم وكيل شئون الطلاب' : 
               'لوحة تحكم مشرف المادة'}
            </h2>
            <p className="text-slate-500 font-medium mt-1">متابعة سجلات التقييم للمعلمين</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveMainTab('teachers')}
            className={`px-4 py-2 rounded-xl font-bold transition-colors ${activeMainTab === 'teachers' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            المعلمين
          </button>
          <button 
            onClick={() => {
              setActiveMainTab('tracking');
              setSelectedSubject(null);
              setSelectedTeacher(null);
            }}
            className={`px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 ${activeMainTab === 'tracking' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <AlertTriangle className="w-4 h-4" />
            المتابعة الإدارية
          </button>
          
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setAdminPhone('');
              setSelectedSubject(null);
              setSelectedTeacher(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-xl transition-colors mr-2"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </div>"""

content = content.replace(header_old, header_new)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
