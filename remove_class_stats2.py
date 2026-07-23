import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

stats_block_pattern = re.compile(r'\{\/\* SCREEN 3: إحصائيات الفصول المتعددة \(Class Analytics\) \*\/.*?\}\)', re.DOTALL)
content = stats_block_pattern.sub('', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

