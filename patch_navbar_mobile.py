import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

old_mobile = """            {/* Teacher Info Button - Mobile & Desktop */}
            <button
              onClick={onOpenProfile}
              className="flex md:hidden items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all text-xs font-bold shrink-0"
            >"""

new_mobile = """            {/* Mobile Connection Status Indicator */}
            <div 
              className={`flex md:hidden items-center justify-center w-8 h-8 rounded-lg border transition-colors ${
                isFirebaseConnected 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}
              title={isFirebaseConnected ? 'متصل بالإنترنت' : 'غير متصل - يتم الحفظ مؤقتاً'}
            >
              {isFirebaseConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>

            {/* Teacher Info Button - Mobile & Desktop */}
            <button
              onClick={onOpenProfile}
              className="flex md:hidden items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all text-xs font-bold shrink-0"
            >"""

content = content.replace(old_mobile, new_mobile)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
