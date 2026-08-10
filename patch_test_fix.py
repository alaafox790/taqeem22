import re

with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

content = content.replace("await getDocFromServer,\n  setLogLevel(doc(db, 'test', 'connection'));", "await getDocFromServer(doc(db, 'test', 'connection'));")

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
