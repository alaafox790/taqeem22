import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Add Mic import
if "Mic" not in content:
    content = content.replace("Edit3\n} from 'lucide-react';", "Edit3,\n  Mic\n} from 'lucide-react';")
    if "Mic\n" not in content and "Mic," not in content:
        content = content.replace("Edit3,", "Edit3,\n  Mic,")

# Add state variables for mic
old_state = """  const [errorMessage, setErrorMessage] = useState<string | null>(null);"""
new_state = """  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isListeningAdd, setIsListeningAdd] = useState(false);
  const [isListeningEdit, setIsListeningEdit] = useState(false);

  const handleVoiceInput = (setter: (val: string) => void, setListening: (val: boolean) => void) => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('متصفحك لا يدعم إدخال الصوت');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setter(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error(event.error);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    
    recognition.start();
  };"""

content = content.replace(old_state, new_state)

# Add mic button to Add Student Modal
old_add_input = """              {/* Name Input */}
              <input
                type="text"
                placeholder="الاسم رباعي"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="w-full text-center bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent placeholder-slate-400 transition-all"
                autoFocus
              />"""
new_add_input = """              {/* Name Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="الاسم رباعي"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full pr-10 pl-10 text-center bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent placeholder-slate-400 transition-all"
                  autoFocus
                />
                <button
                  onClick={() => handleVoiceInput(setNewStudentName, setIsListeningAdd)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                    isListeningAdd ? 'bg-rose-100 text-rose-600 animate-pulse' : 'text-slate-400 hover:text-[#0284c7] hover:bg-slate-100'
                  }`}
                  title="إدخال بالصوت"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>"""

content = content.replace(old_add_input, new_add_input)

# Add mic button to Edit Student Modal
old_edit_input = """              <input
                type="text"
                placeholder="الاسم رباعي"
                value={editStudentName}
                onChange={(e) => setEditStudentName(e.target.value)}
                className="w-full text-center bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                autoFocus
              />"""
new_edit_input = """              <div className="relative">
                <input
                  type="text"
                  placeholder="الاسم رباعي"
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full pr-10 pl-10 text-center bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  autoFocus
                />
                <button
                  onClick={() => handleVoiceInput(setEditStudentName, setIsListeningEdit)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                    isListeningEdit ? 'bg-rose-100 text-rose-600 animate-pulse' : 'text-slate-400 hover:text-teal-600 hover:bg-slate-100'
                  }`}
                  title="إدخال بالصوت"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>"""

content = content.replace(old_edit_input, new_edit_input)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
