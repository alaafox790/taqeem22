import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_home = """        {/* HOME SCREEN */}
        {activeTab === 'home' && (
          <HomeScreen onNavigate={setActiveTab} />
        )}"""

new_home = """        {/* HOME SCREEN */}
        {activeTab === 'home' && (
          <HomeScreen 
            onNavigate={setActiveTab} 
            teacher={teacher} 
            onOpenProfile={() => setIsProfileOpen(true)} 
          />
        )}"""

content = content.replace(old_home, new_home)

with open('src/App.tsx', 'w') as f:
    f.write(content)
