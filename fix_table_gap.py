import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Change border-collapse to border-separate border-spacing-0 to avoid sticky gaps
content = content.replace('border-collapse whitespace-nowrap', 'border-separate border-spacing-0 whitespace-nowrap')

# Since border-separate doesn't collapse borders, we need to ensure we don't get double borders.
# Currently, it uses border-l on most th/td, and border-r on the last one.
# So border-separate is mostly fine if we only have border-l.
# But we might need border-b on the header.
content = content.replace('<tr className="bg-[#1e3a8a] text-white text-sm font-bold">', '<tr className="bg-[#1e3a8a] text-white text-sm font-bold shadow-sm">')

# Also, to make sure there's absolutely no gap, let's just make the "م" column have right-0, and the "الاسم" have right-[50px].
content = content.replace('right-[49px]', 'right-[50px]')

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)

