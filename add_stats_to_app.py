import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# add import
content = content.replace(
    "import { ClassRosterManager } from './components/ClassRosterManager';",
    "import { ClassRosterManager } from './components/ClassRosterManager';\nimport { ClassStats } from './components/ClassStats';"
)

# add to render
stats_render = """
        {/* SCREEN 3: الإحصائيات (Stats View) */}
        {activeTab === 'stats' && (
          <div className="animate-fadeIn">
            <ClassStats 
              records={records}
              selectedTerm={selectedTerm}
            />
          </div>
        )}
      </main>"""

content = content.replace("      </main>", stats_render)

with open('src/App.tsx', 'w') as f:
    f.write(content)
