import re

# Update types.ts
with open('src/types.ts', 'r') as f:
    content = f.read()
content = content.replace("export type AppTab = 'home' | 'assessments' | 'students' | 'class_stats';", "export type AppTab = 'home' | 'assessments' | 'students';")
with open('src/types.ts', 'w') as f:
    f.write(content)

# Update App.tsx
with open('src/App.tsx', 'r') as f:
    content = f.read()

# remove import
content = content.replace("import { ClassStatsDashboard } from './components/ClassStatsDashboard';\n", "")

# remove rendering block
stats_block_pattern = re.compile(r'\{\/\* SCREEN 3: إحصائيات الفصول المتعددة.*?<\/div>\n\s*\}\)', re.DOTALL)
content = stats_block_pattern.sub('', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

# Update Navbar.tsx
with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

# remove the button for class_stats
stats_btn_pattern2 = re.compile(r'<button\s+onClick=\{\(\) => onSelectTab\(\'class_stats\'\)\}.*?<\/button>', re.DOTALL)
content = stats_btn_pattern2.sub('', content)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)

