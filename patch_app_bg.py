import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="min-h-screen bg-[#f8fbfe]',
    '<div className="min-h-screen bg-[#fafcff]'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
