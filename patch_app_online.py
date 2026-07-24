import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_use_effect = """  useEffect(() => {
    testFirebaseConnection();
  }, []);"""

new_use_effect = """  useEffect(() => {
    testFirebaseConnection();
    
    // Listen for online/offline status
    const handleOnline = () => setIsFirebaseConnected(true);
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

content = content.replace(old_use_effect, new_use_effect)

# Update loadData to not overwrite isFirebaseConnected blindly, but still fallback to local data.
# The user wants "data caching to enable the teacher to continue recording in case of network disconnection".
# Actually, our `saveFirebaseAssessmentRecord` already saves locally and returns a success with a message.

old_load_data = """  const loadData = useCallback(async () => {
    try {
      const firebaseData = await fetchFirebaseRecords(teacher.id);
      if (firebaseData) {
        setRecords(firebaseData);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    }
    setIsFirebaseConnected(true);
  }, [teacher.id]);"""

new_load_data = """  const loadData = useCallback(async () => {
    try {
      const firebaseData = await fetchFirebaseRecords(teacher.id);
      if (firebaseData) {
        setRecords(firebaseData);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    }
  }, [teacher.id]);"""

content = content.replace(old_load_data, new_load_data)

with open('src/App.tsx', 'w') as f:
    f.write(content)
