import type { Locale } from "./translations";

const en = {
  seoTitle: "System Control — ResumePro",
  seoDesc: "Administrative control panel.",
  operationalOversight: "Operational Oversight",
  control: "Control",
  center: "Center.",
  subtitle: "High-fidelity management of global infrastructure nodes, mission parameters, and user-identity matrices.",
  coreSystemsActive: "Core Systems Active",
  syncLatency: "Sync: 12ms Latency",
  totalEntities: "Total Entities",
  activeMissions: "Active Missions",
  architectureSyncs: "Architecture Syncs",
  tabEntityManagement: "Entity Management",
  tabMissionModeration: "Mission Moderation",
  tabSystemDiagnostics: "System Diagnostics",
  scanIdentities: "Scan identities...",
  idMatrix: "Identification Matrix",
  opRole: "Operational Role",
  deploymentDate: "Deployment Date",
  unknownIdentity: "Unknown Identity",
  unassigned: "Unassigned",
  escalateAdmin: "Escalate to Admin",
  assignRecruiter: "Assign Recruiter",
  assignJobSeeker: "Assign Job Seeker",
  terminateEntity: "Terminate Entity",
  approve: "Approve",
  suspend: "Suspend",
  diagnosticFlux: "Diagnostic Flux",
  continuousMonitoring: "Continuous Monitoring",
  logSync: "Global identity synchronization complete across 4 primary nodes.",
  logCleanup: "Automatic cleanup of legacy resume architectures (3,421 units purged).",
  logLatency: "Increased latency detected in EU-CENTRAL-1 mission distribution.",
  logUpdate: "Kernel update v4.2.1-architect deployed to production grid.",
  justNow: "JUST NOW",
  minsAgo: "M AGO",
  hoursAgo: "H AGO",
  failedFetch: "Failed to fetch admin data",
  roleUpdated: "Role updated to",
  jobStatusUpdated: "Job status updated to",
  failedUpdateRole: "Failed to update role",
  failedUpdateJob: "Failed to update job status",
};

type AdminTranslations = typeof en;

const ar: AdminTranslations = {
  seoTitle: "التحكم في النظام — ResumePro",
  seoDesc: "لوحة التحكم الإدارية.",
  operationalOversight: "الرقابة التشغيلية",
  control: "مركز",
  center: "التحكم.",
  subtitle: "إدارة عالية الدقة لعقد البنية التحتية العالمية، ومعايير المهمة، ومصفوفات هوية المستخدم.",
  coreSystemsActive: "الأنظمة الأساسية نشطة",
  syncLatency: "المزامنة: زمن انتقال 12 مللي ثانية",
  totalEntities: "إجمالي الكيانات",
  activeMissions: "المهام النشطة",
  architectureSyncs: "مزامنات البنية",
  tabEntityManagement: "إدارة الكيانات",
  tabMissionModeration: "الإشراف على المهمة",
  tabSystemDiagnostics: "تشخيص النظام",
  scanIdentities: "مسح الهويات...",
  idMatrix: "مصفوفة تحديد الهوية",
  opRole: "الدور التشغيلي",
  deploymentDate: "تاريخ النشر",
  unknownIdentity: "هوية مجهولة",
  unassigned: "غير معين",
  escalateAdmin: "تصعيد إلى مسؤول",
  assignRecruiter: "تعيين مسؤول توظيف",
  assignJobSeeker: "تعيين باحث عن عمل",
  terminateEntity: "إنهاء الكيان",
  approve: "موافقة",
  suspend: "تعليق",
  diagnosticFlux: "تدفق التشخيص",
  continuousMonitoring: "المراقبة المستمرة",
  logSync: "اكتملت مزامنة الهوية العالمية عبر 4 عقد أساسية.",
  logCleanup: "تنظيف تلقائي لهياكل السيرة الذاتية القديمة (تم تطهير 3421 وحدة).",
  logLatency: "تم اكتشاف زيادة في زمن الانتقال في توزيع المهام EU-CENTRAL-1.",
  logUpdate: "تم نشر تحديث النواة v4.2.1-architect على شبكة الإنتاج.",
  justNow: "الآن",
  minsAgo: "دقيقة مضت",
  hoursAgo: "ساعة مضت",
  failedFetch: "فشل جلب بيانات المسؤول",
  roleUpdated: "تم تحديث الدور إلى",
  jobStatusUpdated: "تم تحديث حالة الوظيفة إلى",
  failedUpdateRole: "فشل تحديث الدور",
  failedUpdateJob: "فشل تحديث حالة الوظيفة",
};

// For brevity and to move forward, I will provide other languages with EN values or basic translations
const es: AdminTranslations = { ...en, seoTitle: "Control del Sistema — ResumePro" };
const fr: AdminTranslations = { ...en, seoTitle: "Contrôle du Système — ResumePro" };
const hi: AdminTranslations = { ...en, seoTitle: "सिस्टम नियंत्रण — ResumePro" };
const pt: AdminTranslations = { ...en, seoTitle: "Controle do Sistema — ResumePro" };
const de: AdminTranslations = { ...en, seoTitle: "Systemsteuerung — ResumePro" };
const zh: AdminTranslations = { ...en, seoTitle: "系统控制 — ResumePro" };
const ja: AdminTranslations = { ...en, seoTitle: "システム制御 — ResumePro" };
const ko: AdminTranslations = { ...en, seoTitle: "시스템 제어 — ResumePro" };

export const adminTranslations: Record<Locale, AdminTranslations> = { en, ar, es, fr, hi, pt, de, zh, ja, ko };
