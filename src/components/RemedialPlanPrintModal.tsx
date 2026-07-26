import React, { useRef, useState } from 'react';
import { Printer, Download, X, ShieldAlert, CheckCircle2, FileText, User, Sparkles, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { RemedialPlan, TeacherProfile } from '../types';

interface RemedialPlanPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: RemedialPlan | null; // If null, can print batch
  batchPlans?: RemedialPlan[];
  teacher: TeacherProfile;
  academicYear?: string;
  selectedTerm?: string;
}

export const RemedialPlanPrintModal: React.FC<RemedialPlanPrintModalProps> = ({
  isOpen,
  onClose,
  plan,
  batchPlans = [],
  teacher,
  academicYear = '2025/2026',
  selectedTerm = 'term1'
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen) return null;

  const plansToPrint = plan ? [plan] : batchPlans;
  const isSingle = !!plan;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = isSingle 
        ? `خطة_علاجية_${plan.studentName.replace(/\s+/g, '_')}.pdf`
        : `تقرير_الخطط_العلاجية_الشامل.pdf`;

      pdf.save(fileName);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('حدث خطأ أثناء تصدير ملف PDF. يمكنك استخدام زر الطباعة المباشرة.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'frequent_absence': return 'غياب متكرر وتجاوز الحدود';
      case 'consecutive_absence': return 'غياب متتابع في التقييمات';
      case 'low_performance': return 'انخفاض مستوى التقييم والمشاركة';
      default: return 'توجيه المعلم للرعاية المباشرة';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm p-3 sm:p-5 dir-rtl flex items-center justify-center min-h-full animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] my-auto shrink-0 print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Modal Top Header (Hidden on print) */}
        <div className="bg-gradient-to-r from-amber-600 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-4 shrink-0 print:hidden relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shadow-lg text-amber-300 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>معاينة الخطة العلاجية للطباعة والاعتماد</span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-300/30 font-bold">
                  {isSingle ? 'خطة فردية' : `شاملة (${plansToPrint.length} طالب)`}
                </span>
              </h2>
              <p className="text-amber-100/80 text-xs mt-0.5 font-medium">
                نموذج رسمي مجهز للطباعة والتوقيع من المعلم والمرشد الطلابي وولي الأمر.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة مباشرة</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'جاري التحضير...' : 'تصدير PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Preview Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 bg-slate-50 print:bg-white print:p-0 print:overflow-visible">
          <div ref={printRef} className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 space-y-8">
            
            {plansToPrint.map((p, idx) => (
              <div key={p.id} className={`${idx > 0 ? 'pt-8 border-t-2 border-dashed border-slate-300 page-break-before-always' : ''} space-y-6`}>
                
                {/* Official School Header */}
                <div className="border-b-2 border-slate-800 pb-4 text-slate-800">
                  <div className="flex justify-between items-start text-xs font-bold">
                    <div className="space-y-1">
                      <p>المملكة العربية السعودية</p>
                      <p>وزارة التعليم</p>
                      <p>مدرسة: <span className="font-black text-slate-900">{teacher.school || 'المدرسة النموذجية'}</span></p>
                    </div>

                    <div className="text-center space-y-1">
                      <h1 className="text-lg font-black text-indigo-950 underline underline-offset-4 decoration-amber-500">
                        خطة علاجية للطلاب المتعثرين ومكرري الغياب
                      </h1>
                      <p className="text-xs font-bold text-slate-600">
                        المادة: {teacher.subject || 'جميع المواد'} | العام الدراسي: {academicYear} ({selectedTerm === 'term1' ? 'الفصل الدراسي الأول' : 'الفصل الدراسي الثاني'})
                      </p>
                    </div>

                    <div className="text-left space-y-1">
                      <p>تاريخ الاصدار: {new Date(p.createdAt).toLocaleDateString('ar-EG')}</p>
                      <p>معلم المادة: {teacher.name || 'معلم المادة'}</p>
                      <p>حالة الخطة: <span className="font-black underline">{p.status === 'completed' ? 'مكتملة' : p.status === 'in_progress' ? 'قيد التنفيذ' : 'معلقة'}</span></p>
                    </div>
                  </div>
                </div>

                {/* Student Info Card */}
                <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[11px]">اسم الطالب:</span>
                    <span className="text-sm font-black text-indigo-950">{p.studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">الصف والفصل:</span>
                    <span>الصف {p.grade} - فصل {p.class_num}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">هاتف ولي الأمر:</span>
                    <span className="font-mono">{p.parentPhone || 'غير مدون'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">مؤشرات الغياب والأداء:</span>
                    <span className="text-rose-700 font-black">
                      غياب: {p.absenceCount} أيام ({p.attendanceRate}%)
                    </span>
                  </div>
                </div>

                {/* Reasons & Target Diagnosis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
                    <h3 className="font-black text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>تشخيص أسباب التعثر:</span>
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-amber-950 font-medium">
                      {p.reasons.map((r) => (
                        <li key={r}>{getReasonLabel(r)}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-3.5 space-y-1.5">
                    <h3 className="font-black text-sky-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      <span>مجال التعثر والهدف العلاجي:</span>
                    </h3>
                    <p className="font-bold text-sky-950">{p.targetArea}</p>
                    <p className="text-sky-800 font-medium mt-1">الهدف المتوقع: {p.expectedOutcome}</p>
                  </div>
                </div>

                {/* Executive Remedial Actions Table */}
                <div className="space-y-2">
                  <h3 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>جدول الإجراءات والخطوات العلاجية المعتمدة:</span>
                  </h3>

                  <table className="w-full border-collapse text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-300">
                        <th className="p-2 border-l border-slate-300 text-center w-10">م</th>
                        <th className="p-2 border-l border-slate-300 text-right">الإجراء العلاجي / الخطوة التنفيذية</th>
                        <th className="p-2 border-l border-slate-300 text-center w-32">المسؤول عن التنفيذ</th>
                        <th className="p-2 border-l border-slate-300 text-center w-28">حالة التنفيذ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {p.actionSteps.map((step, sIdx) => (
                        <tr key={step.id || sIdx} className={step.isCompleted ? 'bg-emerald-50/50' : ''}>
                          <td className="p-2 border-l border-slate-300 text-center font-bold text-slate-500">{sIdx + 1}</td>
                          <td className="p-2 border-l border-slate-300 font-bold">
                            {step.title}
                            {step.notes && <p className="text-[11px] text-slate-500 mt-0.5 font-normal">{step.notes}</p>}
                          </td>
                          <td className="p-2 border-l border-slate-300 text-center font-bold text-slate-600">
                            {sIdx === 0 ? 'المعلم + ولي الأمر' : sIdx === 2 ? 'المرشد الطلابي' : 'معلم المادة'}
                          </td>
                          <td className="p-2 border-l border-slate-300 text-center font-bold">
                            {step.isCompleted ? (
                              <span className="text-emerald-700 font-black">✓ تم الإنجاز</span>
                            ) : (
                              <span className="text-amber-700">قيد المتابعة</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Teacher Notes & Recommendations */}
                {p.teacherNotes && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                    <span className="font-black text-slate-700 block mb-1">ملاحظات وتوصيات المعلم:</span>
                    <p className="text-slate-800 font-medium whitespace-pre-line">{p.teacherNotes}</p>
                  </div>
                )}

                {/* Official Signatures Block */}
                <div className="pt-6 border-t border-slate-300">
                  <p className="text-center font-bold text-xs text-slate-600 mb-6">
                    تعهد واعتماد الخطة العلاجية الرسمية للمدرسة
                  </p>
                  <div className="grid grid-cols-4 gap-4 text-center text-xs font-bold text-slate-800">
                    <div className="space-y-8">
                      <p>معلم المادة</p>
                      <p className="text-slate-400 font-normal">........................</p>
                    </div>
                    <div className="space-y-8">
                      <p>المرشد الطلابي / الأخصائي</p>
                      <p className="text-slate-400 font-normal">........................</p>
                    </div>
                    <div className="space-y-8">
                      <p>توقيع ولي الأمر</p>
                      <p className="text-slate-400 font-normal">........................</p>
                    </div>
                    <div className="space-y-8">
                      <p>اعتماد مدير المدرسة</p>
                      <p className="text-slate-400 font-normal">........................</p>
                    </div>
                  </div>
                </div>

              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
};
