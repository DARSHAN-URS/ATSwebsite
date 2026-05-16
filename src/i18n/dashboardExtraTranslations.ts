import { Locale } from "./types";

const en = {
  responseRate: "Response Rate",
  fromTrackedApps: "From tracked apps",
  resumeHealth: "Resume Health",
  resumeHealthDesc: "Completion scores for your recent resumes",
  viewAllResumes: "View all resumes →",
  applicationStatus: "Application Status",
  statusBreakdown: "Breakdown by current status",
  noAppsYet: "No applications yet. Start tracking to see stats.",
  weeklyActivity: "Weekly Activity",
  weeklyActivityDesc: "Applications over the last 8 weeks",
  noActivityYet: "No activity to display yet.",
};

type DashboardExtra = typeof en;

const ar: DashboardExtra = {
  responseRate: "معدل الاستجابة",
  fromTrackedApps: "من التطبيقات المتعقبة",
  resumeHealth: "صحة السيرة الذاتية",
  resumeHealthDesc: "نتائج الإكمال لسيرك الذاتية الأخيرة",
  viewAllResumes: "عرض جميع السير الذاتية →",
  applicationStatus: "حالة الطلب",
  statusBreakdown: "التوزيع حسب الحالة الحالية",
  noAppsYet: "لا توجد طلبات بعد. ابدأ التتبع لرؤية الإحصائيات.",
  weeklyActivity: "النشاط الأسبوعي",
  weeklyActivityDesc: "الطلبات خلال آخر 8 أسابيع",
  noActivityYet: "لا يوجد نشاط لعرضه بعد.",
};

const es: DashboardExtra = {
  responseRate: "Tasa de respuesta",
  fromTrackedApps: "De aplicaciones rastreadas",
  resumeHealth: "Salud del currículum",
  resumeHealthDesc: "Puntuaciones de completitud de tus currículos recientes",
  viewAllResumes: "Ver todos los currículos →",
  applicationStatus: "Estado de la solicitud",
  statusBreakdown: "Desglose por estado actual",
  noAppsYet: "Aún no hay solicitudes. Empieza a rastrear para ver estadísticas.",
  weeklyActivity: "Actividad semanal",
  weeklyActivityDesc: "Solicitudes en las últimas 8 semanas",
  noActivityYet: "Aún no hay actividad para mostrar.",
};

const fr: DashboardExtra = {
  responseRate: "Taux de réponse",
  fromTrackedApps: "Des candidatures suivies",
  resumeHealth: "Santé du CV",
  resumeHealthDesc: "Scores de complétion de vos CV récents",
  viewAllResumes: "Voir tous les CV →",
  applicationStatus: "Statut des candidatures",
  statusBreakdown: "Répartition par statut actuel",
  noAppsYet: "Aucune candidature pour le moment. Commencez à suivre pour voir les statistiques.",
  weeklyActivity: "Activité hebdomadaire",
  weeklyActivityDesc: "Candidatures au cours des 8 dernières semaines",
  noActivityYet: "Aucune activité à afficher pour le moment.",
};

const hi: DashboardExtra = {
  responseRate: "प्रतिक्रिया दर",
  fromTrackedApps: "ट्रैक किए गए आवेदनों से",
  resumeHealth: "रिज़्यूमे स्वास्थ्य",
  resumeHealthDesc: "आपके हाल के रिज़्यूमे की पूर्णता स्कोर",
  viewAllResumes: "सभी रिज़्यूमे देखें →",
  applicationStatus: "आवेदन की स्थिति",
  statusBreakdown: "वर्तमान स्थिति के अनुसार वितरण",
  noAppsYet: "अभी तक कोई आवेदन नहीं। आंकड़े देखने के लिए ट्रैकिंग शुरू करें।",
  weeklyActivity: "साप्ताहिक गतिविधि",
  weeklyActivityDesc: "पिछले 8 सप्ताह के आवेदन",
  noActivityYet: "अभी तक कोई गतिविधि प्रदर्शित करने के लिए नहीं है।",
};

const pt: DashboardExtra = {
  responseRate: "Taxa de resposta",
  fromTrackedApps: "Das candidaturas rastreadas",
  resumeHealth: "Saúde do currículo",
  resumeHealthDesc: "Pontuações de completude dos seus currículos recentes",
  viewAllResumes: "Ver todos os currículos →",
  applicationStatus: "Status da candidatura",
  statusBreakdown: "Distribuição por status atual",
  noAppsYet: "Nenhuma candidatura ainda. Comece a rastrear para ver estatísticas.",
  weeklyActivity: "Atividade semanal",
  weeklyActivityDesc: "Candidaturas nas últimas 8 semanas",
  noActivityYet: "Nenhuma atividade para exibir ainda.",
};

const de: DashboardExtra = {
  responseRate: "Rücklaufquote",
  fromTrackedApps: "Von verfolgten Bewerbungen",
  resumeHealth: "Lebenslauf-Gesundheit",
  resumeHealthDesc: "Vollständigkeitsbewertungen Ihrer letzten Lebensläufe",
  viewAllResumes: "Alle Lebensläufe anzeigen →",
  applicationStatus: "Bewerbungsstatus",
  statusBreakdown: "Aufschlüsselung nach aktuellem Status",
  noAppsYet: "Noch keine Bewerbungen. Beginnen Sie mit dem Tracking, um Statistiken zu sehen.",
  weeklyActivity: "Wöchentliche Aktivität",
  weeklyActivityDesc: "Bewerbungen der letzten 8 Wochen",
  noActivityYet: "Noch keine Aktivität vorhanden.",
};

const zh: DashboardExtra = {
  responseRate: "回复率",
  fromTrackedApps: "来自已跟踪的申请",
  resumeHealth: "简历健康度",
  resumeHealthDesc: "您最近简历的完成度评分",
  viewAllResumes: "查看所有简历 →",
  applicationStatus: "申请状态",
  statusBreakdown: "按当前状态分布",
  noAppsYet: "暂无申请。开始跟踪以查看统计数据。",
  weeklyActivity: "每周活动",
  weeklyActivityDesc: "最近 8 周的申请",
  noActivityYet: "暂无活动可显示。",
};

const ja: DashboardExtra = {
  responseRate: "応答率",
  fromTrackedApps: "追跡中の応募から",
  resumeHealth: "履歴書の健全性",
  resumeHealthDesc: "最近の履歴書の完成度スコア",
  viewAllResumes: "すべての履歴書を表示 →",
  applicationStatus: "応募状況",
  statusBreakdown: "現在のステータス別内訳",
  noAppsYet: "まだ応募がありません。統計を表示するにはトラッキングを開始してください。",
  weeklyActivity: "週間アクティビティ",
  weeklyActivityDesc: "過去8週間の応募",
  noActivityYet: "表示するアクティビティがまだありません。",
};

const ko: DashboardExtra = {
  responseRate: "응답률",
  fromTrackedApps: "추적된 지원서에서",
  resumeHealth: "이력서 건강도",
  resumeHealthDesc: "최근 이력서의 완성도 점수",
  viewAllResumes: "모든 이력서 보기 →",
  applicationStatus: "지원 상태",
  statusBreakdown: "현재 상태별 분포",
  noAppsYet: "아직 지원이 없습니다. 통계를 보려면 추적을 시작하세요.",
  weeklyActivity: "주간 활동",
  weeklyActivityDesc: "최근 8주간 지원 현황",
  noActivityYet: "아직 표시할 활동이 없습니다.",
};

export const dashboardExtraTranslations: Record<Locale, DashboardExtra> = { en, ar, es, fr, hi, pt, de, zh, ja, ko };
