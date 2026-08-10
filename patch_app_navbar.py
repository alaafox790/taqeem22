import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("          isFirebaseConnected={isFirebaseConnected}\n          onLogout={handleLogout}", "          isFirebaseConnected={isFirebaseConnected}\n          onLogout={handleLogout}\n          isInstallable={isInstallable}")

with open('src/App.tsx', 'w') as f:
    f.write(content)
