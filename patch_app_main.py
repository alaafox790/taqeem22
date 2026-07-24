import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">',
    '<main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-3 sm:pt-6 space-y-3 sm:space-y-6">'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
