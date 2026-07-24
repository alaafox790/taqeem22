import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

if "import { LateAssessments } from './components/LateAssessments';" not in content:
    content = content.replace("import { ClassStats } from './components/ClassStats';", "import { ClassStats } from './components/ClassStats';\nimport { LateAssessments } from './components/LateAssessments';")

old_stats = """        {activeTab === 'stats' && (
          <div className="animate-fadeIn">
            <ClassStats 
              records={records}
              selectedTerm={selectedTerm}
            />
          </div>
        )}"""

new_stats = """        {activeTab === 'stats' && (
          <div className="animate-fadeIn space-y-6 pb-20">
            <ClassStats 
              records={records}
              selectedTerm={selectedTerm}
            />
            
            <div className="flex justify-center w-full">
              <div className="w-full max-w-2xl">
                <LateAssessments 
                  teacherId={teacher.id} 
                  records={records} 
                  selectedTerm={selectedTerm} 
                  academicYear={academicYear} 
                  onOpenAssessment={(month, num, term) => {
                    setSelectedTerm(term);
                    setSelectedMonth(month);
                    setActiveAssessNum(num);
                    setActiveTab('assessments');
                  }} 
                  officialHolidays={teacher.officialHolidays || []} 
                />
              </div>
            </div>
          </div>
        )}"""

content = content.replace(old_stats, new_stats)

with open('src/App.tsx', 'w') as f:
    f.write(content)
