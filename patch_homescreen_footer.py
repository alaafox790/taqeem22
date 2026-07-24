import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

# add MessageCircle to imports
if "MessageCircle" not in content:
    content = content.replace("Shield", "Shield,\n  MessageCircle")

old_footer = """      </div>
    </div>
  );
};"""

new_footer = """      </div>

      {/* Footer / Tech Support */}
      <div className="flex flex-col items-center gap-4 pt-6 pb-2 w-full mt-auto">
        <a 
          href="https://wa.me/201030302005" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-md shadow-emerald-500/20 transition-transform hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-bold text-sm">الدعم الفني</span>
        </a>
        <div className="text-sm font-black text-slate-400/80 tracking-wide">
          إعداد وتصميم / علاء الوكيل
        </div>
      </div>
    </div>
  );
};"""

content = content.replace(old_footer, new_footer)

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
