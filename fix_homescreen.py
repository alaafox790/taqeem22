import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

# Revert the bad JSX
content = content.replace("""<Shield,
  MessageCircle className=""", """<Shield className=""")

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
