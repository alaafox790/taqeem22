import re

with open('src/components/StudentReportsScreen.tsx', 'r') as f:
    content = f.read()

old_grid = """          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {reportData.map((data) => (
              <div key={data.student.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between aspect-square relative group">
                <div className="text-center mb-2">
                  <h3 className="font-black text-slate-800 text-sm md:text-base line-clamp-2 min-h-[2.5rem]">{data.student.name}</h3>
                  <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${getColorClasses(data.attendanceRate)}`}>
                    حضور {data.attendanceRate}%
                  </div>
                </div>
                
                <div className="mt-auto space-y-2">
                  {editingPhoneId === data.student.id ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="tel" 
                        value={editPhoneValue}
                        onChange={(e) => setEditPhoneValue(e.target.value)}
                        placeholder="رقم الهاتف"
                        className="w-full text-xs p-1.5 border border-emerald-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                        autoFocus
                      />
                      <button onClick={() => handleSavePhone(data.student.id)} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingPhoneId(null)} className="p-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : data.student.parentPhone ? (
                    <>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1 px-1">
                        <span dir="ltr">{data.student.parentPhone}</span>
                        <button onClick={() => { setEditPhoneValue(data.student.parentPhone || ''); setEditingPhoneId(data.student.id); }} className="text-slate-400 hover:text-emerald-600">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <a href={`tel:${data.student.parentPhone}`} className="flex-1 flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-xl text-xs font-bold transition-colors">
                          <Phone className="w-3.5 h-3.5" /> اتصال
                        </a>
                        <a href={`https://wa.me/${data.student.parentPhone.replace(/^0/, '20')}?text=${getWhatsAppMessage(data)}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-xl text-xs font-bold transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" /> واتس
                        </a>
                      </div>
                    </>
                  ) : (
                    <button 
                      onClick={() => { setEditPhoneValue(''); setEditingPhoneId(data.student.id); }}
                      className="w-full flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-500 py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> إضافة رقم ولي الأمر
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>"""

new_grid = """          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
            {reportData.map((data) => (
              <div key={data.student.id} className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group">
                <div className="text-center mb-1">
                  <h3 className="font-bold text-slate-800 text-[11px] leading-tight line-clamp-1" title={data.student.name}>{data.student.name}</h3>
                  <div className={`mt-1.5 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${getColorClasses(data.attendanceRate)}`}>
                    حضور {data.attendanceRate}%
                  </div>
                </div>
                
                <div className="mt-2 space-y-1">
                  {editingPhoneId === data.student.id ? (
                    <div className="flex flex-col gap-1">
                      <input 
                        type="tel" 
                        value={editPhoneValue}
                        onChange={(e) => setEditPhoneValue(e.target.value)}
                        placeholder="رقم الهاتف"
                        className="w-full text-[10px] p-1 border border-emerald-500 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button onClick={() => handleSavePhone(data.student.id)} className="flex-1 py-1 bg-emerald-100 text-emerald-700 rounded flex items-center justify-center hover:bg-emerald-200">
                          <Check className="w-3 h-3" />
                        </button>
                        <button onClick={() => setEditingPhoneId(null)} className="flex-1 py-1 bg-rose-100 text-rose-700 rounded flex items-center justify-center hover:bg-rose-200">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : data.student.parentPhone ? (
                    <div className="flex gap-1">
                      <a href={`tel:${data.student.parentPhone}`} className="flex-1 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 rounded-lg text-[10px] font-bold transition-colors" title="اتصال">
                        <Phone className="w-3 h-3" />
                      </a>
                      <a href={`https://wa.me/${data.student.parentPhone.replace(/^0/, '20')}?text=${getWhatsAppMessage(data)}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-1.5 rounded-lg text-[10px] font-bold transition-colors" title="واتساب">
                        <MessageCircle className="w-3 h-3" />
                      </a>
                      <button onClick={() => { setEditPhoneValue(data.student.parentPhone || ''); setEditingPhoneId(data.student.id); }} className="flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-colors" title="تعديل الرقم">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setEditPhoneValue(''); setEditingPhoneId(data.student.id); }}
                      className="w-full flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-500 py-1.5 rounded-lg text-[10px] font-bold transition-colors"
                    >
                      <Phone className="w-3 h-3" /> إضافة رقم
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>"""

content = content.replace(old_grid, new_grid)

with open('src/components/StudentReportsScreen.tsx', 'w') as f:
    f.write(content)
