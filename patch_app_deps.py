import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_use_effect = """  useEffect(() => {
    testFirebaseConnection();
    
    // Listen for online/offline status
    const handleOnline = () => {
      setIsFirebaseConnected(true);
      // Auto-sync when coming back online
      if (isAuthenticated) {
        loadData();
      }
    };
    const handleOffline = () => setIsFirebaseConnected(false);
    
    // Initial check
    setIsFirebaseConnected(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);"""

new_use_effect = """  useEffect(() => {
    testFirebaseConnection();
    setIsFirebaseConnected(navigator.onLine);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsFirebaseConnected(true);
      if (isAuthenticated) {
        loadData();
      }
    };
    const handleOffline = () => setIsFirebaseConnected(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, loadData]);"""

content = content.replace(old_use_effect, new_use_effect)

with open('src/App.tsx', 'w') as f:
    f.write(content)
