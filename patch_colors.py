import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

# Assessments
content = content.replace(
    'bg-indigo-50/80 group-hover:bg-indigo-100 flex items-center justify-center mb-1 transition-colors',
    'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30 flex items-center justify-center mb-1 transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/40'
)
content = content.replace(
    'text-indigo-400 group-hover:text-indigo-500 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300',
    'text-white group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300'
)

# Students
content = content.replace(
    'bg-teal-50/80 group-hover:bg-teal-100 flex items-center justify-center mb-1 transition-colors',
    'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/30 flex items-center justify-center mb-1 transition-all group-hover:shadow-lg group-hover:shadow-emerald-500/40'
)
content = content.replace(
    'text-teal-400 group-hover:text-teal-500 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300',
    'text-white group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300'
)

# Stats
content = content.replace(
    'bg-sky-50/80 group-hover:bg-sky-100 flex items-center justify-center mb-1 transition-colors',
    'bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md shadow-sky-500/30 flex items-center justify-center mb-1 transition-all group-hover:shadow-lg group-hover:shadow-sky-500/40'
)
content = content.replace(
    'text-sky-400 group-hover:text-sky-500 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300',
    'text-white group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300'
)

# Search
content = content.replace(
    'bg-violet-50/80 group-hover:bg-violet-100 flex items-center justify-center mb-1 transition-colors',
    'bg-gradient-to-br from-fuchsia-400 to-pink-500 text-white shadow-md shadow-fuchsia-500/30 flex items-center justify-center mb-1 transition-all group-hover:shadow-lg group-hover:shadow-fuchsia-500/40'
)
content = content.replace(
    'text-violet-400 group-hover:text-violet-500 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300',
    'text-white group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300'
)

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
