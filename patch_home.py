import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

content = content.replace("  onToggleReminderComplete: (id: string) => void;\n}", "  onToggleReminderComplete: (id: string) => void;\n  isInstallable?: boolean;\n}")
content = content.replace("  onToggleReminderComplete,\n}) => {", "  onToggleReminderComplete,\n  isInstallable,\n}) => {")
content = content.replace("<InstallPWA />", "{isInstallable && <InstallPWA />}")

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
