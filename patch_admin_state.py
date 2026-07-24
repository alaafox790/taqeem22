import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# Add states
content = content.replace(
    "const [adminRole, setAdminRole] = useState<'principal' | 'deputy' | 'supervisor' | null>(null);",
    "const [adminRole, setAdminRole] = useState<'principal' | 'deputy' | 'supervisor' | null>(null);\n  const [globalTeachers, setGlobalTeachers] = useState<TeacherProfile[]>([]);\n  const [activeMainTab, setActiveMainTab] = useState<'teachers' | 'tracking'>('teachers');\n  const [trackingRecords, setTrackingRecords] = useState<any[]>([]);\n  const [loadingTracking, setLoadingTracking] = useState(false);"
)

# Store globalTeachers on login
content = content.replace(
    "const teachers = await fetchAllFirebaseTeachers();",
    "const teachers = await fetchAllFirebaseTeachers();\n      setGlobalTeachers(teachers);"
)

# Trigger fetching records when authenticated
effect_code = """
  useEffect(() => {
    if (isAuthenticated && allTeachers.length > 0) {
      const fetchAllRecords = async () => {
        setLoadingTracking(true);
        try {
          const promises = allTeachers.map(t => fetchFirebaseRecords(t.id));
          const results = await Promise.all(promises);
          // Combine all records
          const combined = results.flat();
          setTrackingRecords(combined);
        } catch(e) {
          console.error(e);
        } finally {
          setLoadingTracking(false);
        }
      };
      fetchAllRecords();
    }
  }, [isAuthenticated, allTeachers]);
"""
content = content.replace(
    "const [loadingDetails, setLoadingDetails] = useState(false);",
    "const [loadingDetails, setLoadingDetails] = useState(false);\n" + effect_code
)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
