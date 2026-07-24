import re

with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

new_sync_logic = """
    if (syncCount > 0) {
      console.log(`Synced ${syncCount} offline records to Firebase.`);
    }
    // Update last sync time
    localStorage.setItem(`last_sync_time_${teacherId}`, new Date().toISOString());
    return true;
"""

content = content.replace("""    if (syncCount > 0) {
      console.log(`Synced ${syncCount} offline records to Firebase.`);
    }
    return true;""", new_sync_logic)

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
