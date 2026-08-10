import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

replacement = """          )}
          <InstallPWA />"""

content = content.replace("          )}", replacement, 1)

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)

