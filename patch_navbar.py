import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

# Replace imports
old_import = """import {
  Award,
  Database,
  GraduationCap,
  Settings,
  ScrollText,
  
  FileText,
  CheckCircle2,
  Users,
  BarChart3,
  LayoutGrid,
  Home,
  Search,
  Shield
} from 'lucide-react';"""
new_import = """import {
  Award,
  Database,
  GraduationCap,
  Settings,
  ScrollText,
  
  FileText,
  CheckCircle2,
  Users,
  BarChart3,
  LayoutGrid,
  Home,
  Search,
  Shield,
  Wifi,
  WifiOff
} from 'lucide-react';"""
content = content.replace(old_import, new_import)

# Insert WiFi indicator before teacher pill
old_left_side = """          {/* Left side: Teacher Profile & Status */}
          <div className="hidden md:flex items-center gap-2">
            
            {/* Teacher Info Pill */}"""
new_left_side = """          {/* Left side: Teacher Profile & Status */}
          <div className="hidden md:flex items-center gap-2">
            
            {/* Connection Status Indicator */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                isFirebaseConnected 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
              title={isFirebaseConnected ? 'متصل بالإنترنت' : 'غير متصل - يتم الحفظ مؤقتاً'}
            >
              {isFirebaseConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">متصل</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">غير متصل</span>
                </>
              )}
            </div>

            {/* Teacher Info Pill */}"""
content = content.replace(old_left_side, new_left_side)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
