import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_home = """        {activeTab === 'home' && (
          <HomeScreen 
            onNavigate={setActiveTab} 
            teacher={teacher} 
            onOpenProfile={() => setIsProfileOpen(true)}
            records={records}
            onOpenAssessment={(month, num, term) => {
              setSelectedTerm(term);
              setSelectedMonth(month);
              setActiveAssessNum(num);
              setActiveTab('assessments');
            }}
          />
        )}"""

new_home = """        {activeTab === 'home' && (
          <HomeScreen 
            onNavigate={setActiveTab} 
            teacher={teacher} 
            onOpenProfile={() => setIsProfileOpen(true)}
            records={records}
            selectedTerm={selectedTerm}
            academicYear={academicYear}
            onOpenAssessment={(month, num, term) => {
              setSelectedTerm(term);
              setSelectedMonth(month);
              setActiveAssessNum(num);
              setActiveTab('assessments');
            }}
          />
        )}"""

content = content.replace(old_home, new_home)

with open('src/App.tsx', 'w') as f:
    f.write(content)
