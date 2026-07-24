import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# Find the trackingData block
tracking_data_match = re.search(r"  const trackingData = useMemo\(\(\) => \{.*?\n  \}, \[globalTeachers, allTeachers, trackingRecords, adminRole\]\);\n", content, re.DOTALL)

if tracking_data_match:
    tracking_data_str = tracking_data_match.group(0)
    
    # Remove it from its original place
    content = content.replace(tracking_data_str, "")
    
    # Add it before the early return
    early_return_str = "  if (!isAuthenticated) {"
    content = content.replace(early_return_str, tracking_data_str + "\n" + early_return_str)
    
    with open('src/components/AdminDashboard.tsx', 'w') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Could not find trackingData block")

