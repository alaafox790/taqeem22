import re

with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

new_test = """// Connection test on boot
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection successful');
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('client is offline')) {
        console.warn('Firebase client is offline, using local cache.');
      } else if (error.message.includes('unavailable') || error.message.includes('Could not reach')) {
        console.warn('Firebase backend unreachable. Operating in offline mode.');
      } else {
        console.warn('Firebase connection test warning:', error.message);
      }
    } else {
       console.warn('Firebase connection test warning:', error);
    }
  }
}"""

content = re.sub(
    r"// Connection test on boot\nexport async function testFirebaseConnection\(\) \{.*?\n\}",
    new_test,
    content,
    flags=re.DOTALL
)

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
