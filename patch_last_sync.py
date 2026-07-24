with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

new_func = """
export function getLastSyncTime(teacherId: string): string | null {
  return localStorage.getItem(`last_sync_time_${teacherId}`);
}
"""

content += new_func

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
