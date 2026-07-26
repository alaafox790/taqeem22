import React, { useState, useEffect } from 'react';
import { 
  X, MessageSquare, Send, RefreshCw, User, Search, 
  CheckCheck, Check, Clock, GraduationCap, Sparkles 
} from 'lucide-react';
import { ChatMessage, TeacherProfile } from '../types';
import { 
  fetchFirebaseMessagesForTeacher, 
  saveFirebaseMessage, 
  markFirebaseMessageAsRead 
} from '../lib/firebase';

interface TeacherMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherProfile;
}

export const TeacherMessagesModal: React.FC<TeacherMessagesModalProps> = ({
  isOpen,
  onClose,
  teacher,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedStudentCode, setSelectedStudentCode] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadTeacherMessages = async () => {
    if (!teacher.id) return;
    setLoading(true);
    try {
      const fetched = await fetchFirebaseMessagesForTeacher(teacher.id, teacher.phone);
      setMessages(fetched);
    } catch (err) {
      console.error('Failed to load teacher messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTeacherMessages();
    }
  }, [isOpen, teacher.id]);

  if (!isOpen) return null;

  // Group messages by studentCode
  const studentGroups: { [code: string]: { name: string; grade: string | number; class_num: string | number; messages: ChatMessage[]; unreadCount: number; lastTime: string } } = {};

  messages.forEach((msg) => {
    if (!studentGroups[msg.studentCode]) {
      studentGroups[msg.studentCode] = {
        name: msg.studentName || `طالب (${msg.studentCode})`,
        grade: msg.grade || '',
        class_num: msg.class_num || '',
        messages: [],
        unreadCount: 0,
        lastTime: msg.timestamp,
      };
    }
    studentGroups[msg.studentCode].messages.push(msg);
    if (msg.sender === 'student' && !msg.isRead) {
      studentGroups[msg.studentCode].unreadCount += 1;
    }
    if (new Date(msg.timestamp).getTime() > new Date(studentGroups[msg.studentCode].lastTime).getTime()) {
      studentGroups[msg.studentCode].lastTime = msg.timestamp;
    }
  });

  const studentList = Object.keys(studentGroups).map((code) => ({
    studentCode: code,
    ...studentGroups[code],
  })).sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());

  const filteredStudents = studentList.filter((s) => 
    s.name.includes(searchQuery) || 
    s.studentCode.includes(searchQuery) ||
    `${s.grade}/${s.class_num}`.includes(searchQuery)
  );

  const activeGroup = selectedStudentCode ? studentGroups[selectedStudentCode] : (studentList.length > 0 ? studentList[0] : null);
  const activeStudentCode = selectedStudentCode || (studentList.length > 0 ? studentList[0].studentCode : null);

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeStudentCode || !activeGroup || !teacher.id) return;
    setIsSending(true);

    const newReply: ChatMessage = {
      id: `msg_t_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentCode: activeStudentCode,
      studentName: activeGroup.name,
      grade: activeGroup.grade,
      class_num: activeGroup.class_num,
      teacher_id: teacher.id,
      sender: 'teacher',
      text: replyText.trim(),
      timestamp: new Date().toISOString(),
      isRead: true,
    };

    const success = await saveFirebaseMessage(newReply);
    if (success) {
      setMessages((prev) => [...prev, newReply]);
      setReplyText('');
    }
    setIsSending(false);
  };

  const handleSelectStudent = (code: string) => {
    setSelectedStudentCode(code);
    // Mark unread messages as read
    const group = studentGroups[code];
    if (group) {
      group.messages.forEach((m) => {
        if (m.sender === 'student' && !m.isRead) {
          markFirebaseMessageAsRead(m.id).catch(console.error);
        }
      });
      setMessages((prev) =>
        prev.map((m) => (m.studentCode === code && m.sender === 'student' ? { ...m, isRead: true } : m))
      );
    }
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return ts;
    }
  };

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 dir-rtl animate-fadeIn">
      <div className="bg-white w-full max-w-4xl h-[90vh] sm:h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>رسائل واستفسارات الطلاب</span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">
                  تواصل مباشر
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-bold">
                استقبال ردود واستفسارات الطلاب بداخل التطبيق وتوثيق المحادثات بـ Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadTeacherMessages}
              disabled={loading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
              title="تحديث الرسائل"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {studentList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
            <div className="w-16 h-16 rounded-3xl bg-slate-200 text-slate-400 flex items-center justify-center mb-3">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-800">لا توجد رسائل من الطلاب حالياً</h3>
            <p className="text-xs text-slate-500 font-bold max-w-sm mt-1">
              عندما يقوم أي طالب بإرسال ملاحظة أو استفسار عبر بوابته الخاصة بداخل التطبيق، ستظهر المحادثة هنا مباشرة.
            </p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            
            {/* Left/Sidebar: Student Conversations List */}
            <div className="md:col-span-4 border-b md:border-b-0 md:border-l border-slate-200 bg-slate-50 flex flex-col h-full overflow-hidden">
              
              {/* Search Box */}
              <div className="p-3 border-b border-slate-200 bg-white">
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="بحث باسم الطالب أو الكود..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-9 pl-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60 p-2 space-y-1">
                {filteredStudents.map((st) => {
                  const isSelected = activeStudentCode === st.studentCode;
                  const lastMsg = st.messages[st.messages.length - 1];
                  return (
                    <button
                      key={st.studentCode}
                      onClick={() => handleSelectStudent(st.studentCode)}
                      className={`w-full p-3 rounded-2xl text-right transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected 
                          ? 'bg-emerald-600 text-white shadow-md' 
                          : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/80'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        <User className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {st.name}
                          </h4>
                          {st.unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                              {st.unreadCount}
                            </span>
                          )}
                        </div>

                        <div className={`text-[10px] flex items-center justify-between mt-0.5 font-bold ${
                          isSelected ? 'text-emerald-100' : 'text-slate-500'
                        }`}>
                          <span>كود: {st.studentCode}</span>
                          <span>{st.grade ? `الصف ${st.grade}/${st.class_num}` : ''}</span>
                        </div>

                        {lastMsg && (
                          <p className={`text-[11px] truncate mt-1 font-bold ${
                            isSelected ? 'text-emerald-50' : 'text-slate-600'
                          }`}>
                            {lastMsg.sender === 'teacher' ? 'أنت: ' : ''}{lastMsg.text}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right/Main Chat Area */}
            <div className="md:col-span-8 flex flex-col h-full bg-slate-100/50 overflow-hidden">
              {activeGroup && activeStudentCode ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                        {activeGroup.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{activeGroup.name}</h3>
                        <p className="text-[11px] text-slate-500 font-bold">
                          كود الطالب: <span className="font-mono text-emerald-700">{activeStudentCode}</span> 
                          {activeGroup.grade ? ` | الصف: ${activeGroup.grade}/${activeGroup.class_num}` : ''}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-xl border border-emerald-200">
                      محادثة فورية
                    </span>
                  </div>

                  {/* Message Thread */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activeGroup.messages.map((m) => {
                      const isTeacher = m.sender === 'teacher';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isTeacher ? 'items-start' : 'items-end'}`}
                        >
                          <div className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs font-bold leading-relaxed shadow-xs ${
                            isTeacher 
                              ? 'bg-slate-900 text-white rounded-tr-none' 
                              : 'bg-emerald-600 text-white rounded-tl-none'
                          }`}>
                            <div className="text-[10px] font-black opacity-80 mb-1 flex items-center justify-between gap-3">
                              <span>{isTeacher ? `أنت (أ. ${teacher.name})` : m.studentName}</span>
                              <span className="font-mono">{formatTime(m.timestamp)}</span>
                            </div>
                            <p className="whitespace-pre-wrap">{m.text}</p>
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold px-1 mt-0.5">
                            {formatDate(m.timestamp)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Input Composer */}
                  <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                        placeholder="اكتب ردك للطالب وسيصل فوراً بداخل بوابته..."
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />

                      <button
                        onClick={handleSendReply}
                        disabled={isSending || !replyText.trim()}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                      >
                        <Send className="w-4 h-4" />
                        <span>إرسال الرد</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6 text-slate-400 font-bold text-xs">
                  اختر طالباً من القائمة للبدء بالمحادثة
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
