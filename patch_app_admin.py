import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Make sure AdminDashboard is imported
import_line = "import { ClassStats } from './components/ClassStats';"
new_import_line = "import { ClassStats } from './components/ClassStats';\nimport { AdminDashboard } from './components/AdminDashboard';"
content = content.replace(import_line, new_import_line)

# Add admin tab
old_search_tab = """        {/* SCREEN 5: البحث (Search View) */}
        {activeTab === 'search' && (
          <div className="animate-fadeIn">
            <AssessmentSearch records={records} selectedTerm={selectedTerm} teacherId={teacher.id} />
          </div>
        )}
      </main>"""

new_admin_tab = """        {/* SCREEN 5: البحث (Search View) */}
        {activeTab === 'search' && (
          <div className="animate-fadeIn">
            <AssessmentSearch records={records} selectedTerm={selectedTerm} teacherId={teacher.id} />
          </div>
        )}
        
        {/* SCREEN 6: الإدارة المدرسية (Admin View) */}
        {activeTab === 'admin' && (
          <div className="animate-fadeIn">
            <AdminDashboard onLogout={() => setActiveTab('home')} />
          </div>
        )}
      </main>"""
content = content.replace(old_search_tab, new_admin_tab)

with open('src/App.tsx', 'w') as f:
    f.write(content)
