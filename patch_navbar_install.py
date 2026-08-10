import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { TeacherProfile, AppTab } from '../types';", "import { TeacherProfile, AppTab } from '../types';\nimport { InstallPWA } from './InstallPWA';")
content = content.replace("  onLogout?: () => void;\n}", "  onLogout?: () => void;\n  isInstallable?: boolean;\n}")
content = content.replace("  isFirebaseConnected = true,\n  onLogout,\n}) => {", "  isFirebaseConnected = true,\n  onLogout,\n  isInstallable,\n}) => {")

install_btn = """          <div className="flex items-center gap-1.5 sm:gap-3">
            {isInstallable && <InstallPWA />}"""
content = content.replace("""          <div className="flex items-center gap-1.5 sm:gap-3">""", install_btn)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
