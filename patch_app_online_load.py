import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_use_effect = """  useEffect(() => {
    testFirebaseConnection();
    
    // Listen for online/offline status
    const handleOnline = () => setIsFirebaseConnected(true);
    const handleOffline = () => setIsFirebaseConnected(false);"""

new_use_effect = """  useEffect(() => {
    testFirebaseConnection();
    
    // Listen for online/offline status
    const handleOnline = () => {
      setIsFirebaseConnected(true);
      // Auto-sync when coming back online
      if (isAuthenticated) {
        loadData();
      }
    };
    const handleOffline = () => setIsFirebaseConnected(false);"""

content = content.replace(old_use_effect, new_use_effect)

with open('src/App.tsx', 'w') as f:
    f.write(content)
