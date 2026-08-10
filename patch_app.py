import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

state_hook = """  // Navigation tab state (4 screens + countdown)
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [hasShownCompleteToast, setHasShownCompleteToast] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);"""

content = content.replace("  // Navigation tab state (4 screens + countdown)\n  const [activeTab, setActiveTab] = useState<AppTab>('home');\n  const [hasShownCompleteToast, setHasShownCompleteToast] = useState(false);", state_hook)

effect_hook = """  useEffect(() => {
    const handlePromptReady = () => setIsInstallable(true);
    const handleAppInstalled = () => setIsInstallable(false);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    } else if (window.deferredPrompt) {
      setIsInstallable(true);
    }

    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    testFirebaseConnection();"""

content = content.replace("  useEffect(() => {\n    testFirebaseConnection();", effect_hook)

home_screen_props = """          <HomeScreen 
            onNavigate={setActiveTab} 
            teacher={teacher} 
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenArchive={() => setIsArchiveModalOpen(true)}
            onOpenStudentMessages={() => setIsTeacherMessagesModalOpen(true)}
            records={records}
            selectedTerm={selectedTerm}
            academicYear={academicYear}
            isInstallable={isInstallable}
            onOpenAssessment={(month, num, term) => {"""

content = content.replace("""          <HomeScreen 
            onNavigate={setActiveTab} 
            teacher={teacher} 
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenArchive={() => setIsArchiveModalOpen(true)}
            onOpenStudentMessages={() => setIsTeacherMessagesModalOpen(true)}
            records={records}
            selectedTerm={selectedTerm}
            academicYear={academicYear}
            onOpenAssessment={(month, num, term) => {""", home_screen_props)

with open('src/App.tsx', 'w') as f:
    f.write(content)
