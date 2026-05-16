import type { Locale } from "./translations";

const en = {
  seoTitle: "Email Outreach — ResumePro",
  seoDesc: "Connect with recruiters using AI-powered emails.",
  engineActive: "Communication Engine Active",
  title: "Outreach.",
  subtitle: "Autonomous messaging protocols and direct recruiter synchronization with mission-critical precision.",
  sentToday: "Sent Today",
  avgReplyRate: "Avg. Reply Rate",
  parameters: "Parameters",
  missionConfig: "Mission Configuration",
  targetEntity: "Target Entity",
  functionalArea: "Functional Area",
  contextReference: "Context Reference",
  selectResume: "Select Resume",
  tonePersona: "Tone & Persona",
  synthesizeDraft: "Synthesize Draft",
  safetyProtocols: "Safety Protocols",
  active: "Active",
  spamAnalysis: "Spam Analysis",
  atsCompatible: "ATS Compatible",
  intelligenceComposer: "Intelligence Composer",
  draftMode: "DRAFT MODE",
  recipient: "Recipient",
  subject: "Subject",
  startDrafting: "Start drafting or use AI to synthesize...",
  initializeOutreach: "Initialize Outreach",
  readabilityScore: "Readability Score",
  premium: "PREMIUM",
  recentCommunications: "Recent Communications",
  viewFullHistory: "View Full History",
  optimised: "Optimised",
  tones: {
    professional: "Professional",
    friendly: "Friendly",
    confident: "Confident",
    technical: "Technical"
  },
  moreInfoNeeded: "More info needed",
  enterCompanyJob: "Please enter the company and job title.",
  draftCreated: "Draft Created",
  failedDraft: "Failed to create draft",
  fillFields: "Please fill in all fields",
  emailSent: "Email Sent",
  failedSend: "Failed to send email",
};

type OutreachTranslations = typeof en;

const ar: OutreachTranslations = {
  seoTitle: "التواصل عبر البريد الإلكتروني — ResumePro",
  seoDesc: "تواصل مع مسؤولي التوظيف باستخدام رسائل البريد الإلكتروني المدعومة بالذكاء الاصطناعي.",
  engineActive: "محرك الاتصال نشط",
  title: "التواصل.",
  subtitle: "بروتوكولات مراسلة مستقلة ومزامنة مباشرة لمسؤولي التوظيف بدقة بالغة الأهمية للمهمة.",
  sentToday: "أرسل اليوم",
  avgReplyRate: "متوسط معدل الرد",
  parameters: "المعايير",
  missionConfig: "تكوين المهمة",
  targetEntity: "الكيان المستهدف",
  functionalArea: "المجال الوظيفي",
  contextReference: "مرجع السياق",
  selectResume: "اختر السيرة الذاتية",
  tonePersona: "النبرة والشخصية",
  synthesizeDraft: "توليد مسودة",
  safetyProtocols: "بروتوكولات الأمان",
  active: "نشط",
  spamAnalysis: "تحليل البريد العشوائي",
  atsCompatible: "متوافق مع ATS",
  intelligenceComposer: "مؤلف الذكاء",
  draftMode: "وضع المسودة",
  recipient: "المستلم",
  subject: "الموضوع",
  startDrafting: "ابدأ الصياغة أو استخدم الذكاء الاصطناعي للتوليد...",
  initializeOutreach: "بدء التواصل",
  readabilityScore: "درجة القراءة",
  premium: "ممتاز",
  recentCommunications: "الاتصالات الأخيرة",
  viewFullHistory: "عرض السجل الكامل",
  optimised: "محسن",
  tones: {
    professional: "مهني",
    friendly: "ودود",
    confident: "واثق",
    technical: "تقني"
  },
  moreInfoNeeded: "مزيد من المعلومات مطلوبة",
  enterCompanyJob: "يرجى إدخال الشركة والمسمى الوظيفي.",
  draftCreated: "تم إنشاء المسودة",
  failedDraft: "فشل إنشاء المسودة",
  fillFields: "يرجى ملء جميع الحقول",
  emailSent: "تم إرسال البريد الإلكتروني",
  failedSend: "فشل إرسال البريد الإلكتروني",
};

const es: OutreachTranslations = { ...en, seoTitle: "Alcance de Correo — ResumePro" };
const fr: OutreachTranslations = { ...en, seoTitle: "Campagne d'E-mail — ResumePro" };
const hi: OutreachTranslations = { ...en, seoTitle: "ईमेल आउटरीच — ResumePro" };
const pt: OutreachTranslations = { ...en, seoTitle: "Alcance de E-mail — ResumePro" };
const de: OutreachTranslations = { ...en, seoTitle: "E-Mail-Outreach — ResumePro" };
const zh: OutreachTranslations = { ...en, seoTitle: "邮件推广 — ResumePro" };
const ja: OutreachTranslations = { ...en, seoTitle: "メールアウトリーチ — ResumePro" };
const ko: OutreachTranslations = { ...en, seoTitle: "이메일 아웃리치 — ResumePro" };

export const outreachTranslations: Record<Locale, OutreachTranslations> = { en, ar, es, fr, hi, pt, de, zh, ja, ko };
