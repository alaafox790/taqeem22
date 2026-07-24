import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import { GRADES, CLASSES_COUNT } from '../lib/constants';",
    "import { GRADES, CLASSES_COUNT, MONTHS_DATA } from '../lib/constants';"
)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
