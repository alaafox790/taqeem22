import re

with open('src/components/ClassStats.tsx', 'r') as f:
    content = f.read()

content = content.replace("<Pie\n                data={chartData}", "<Pie\n                data={chartData.classData}")
content = content.replace("{chartData.map((entry, index) => (", "{chartData.classData.map((entry, index) => (")

with open('src/components/ClassStats.tsx', 'w') as f:
    f.write(content)
