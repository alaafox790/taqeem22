import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

content = content.replace("دخول المدير، الوكيل، ومشرف المادة", "دخول المدير، الوكيل، والمشرف برقم الهاتف")

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
