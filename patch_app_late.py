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
          <div className="animate-fadeIn space-y-6">
            <ClassStats 
              records={records}
              selectedTerm={selectedTerm}
            />
            
            <LateAssessments 
              teacherId={teacher.id} 
              records={records} 
              selectedTerm={selectedTerm} 
              academicYear={teacher.academicYear || '2024/2025'} 
              onOpenAssessment={(month, assessNum, term) => {
                const found = records.find(r => r.month_id === month.id && r.assessment_number === assessNum && r.term === term);
                if (found) {
                  setDuplicateModal({
                    isOpen: true,
                    existingRecord: found,
                    pendingRecord: {
                      term: term,
                      month_id: month.id,
                      assessment_number: assessNum
                    }
                  });
                } else {
                  // If it doesn't exist, we'd normally just let them create it, but in the LateAssessments view, 
                  // onOpenAssessment was triggering the edit flow.
                  // Actually, let's see how HomeScreen did it. 
                  // We need to implement a simple handler or reuse the existing one.
                }
              }} 
              officialHolidays={teacher.officialHolidays || []} 
            />
          </div>
        )}"""

# Wait, how was `onOpenAssessment` defined in App.tsx to pass to HomeScreen?
