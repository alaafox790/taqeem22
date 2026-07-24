import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

import_statement = "import { TermProgress } from './components/TermProgress';\n"
if "TermProgress" not in content:
    content = content.replace("import { AssessmentSearch } from './components/AssessmentSearch';", 
                              "import { AssessmentSearch } from './components/AssessmentSearch';\n" + import_statement)

old_block = """        {activeTab === 'assessments' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="max-w-4xl mx-auto shadow-sm rounded-xl">"""

new_block = """        {activeTab === 'assessments' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="max-w-4xl mx-auto">
              <TermProgress
                selectedTerm={selectedTerm}
                academicYear={academicYear}
                monthAssessmentCounts={monthAssessmentCounts}
                records={records}
              />
            </div>
            <div className="max-w-4xl mx-auto shadow-sm rounded-xl">"""

if old_block in content:
    content = content.replace(old_block, new_block)
    print("Patched successfully")
else:
    print("Could not find block in App.tsx")

with open('src/App.tsx', 'w') as f:
    f.write(content)
