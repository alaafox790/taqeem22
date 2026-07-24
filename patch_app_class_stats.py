import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "<ClassStats \n              records={records}\n              selectedTerm={selectedTerm}\n            />",
    "<ClassStats \n              records={records}\n              selectedTerm={selectedTerm}\n              teacher={teacher}\n            />"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
