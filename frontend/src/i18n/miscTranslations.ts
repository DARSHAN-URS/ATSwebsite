import type { Locale } from "./translations";

export interface MiscTranslations {
  // Blog page UI
  blog: {
    heroTag: string;
    heroTitle1: string;
    heroTitle2: string;
    heroSubPrefix: string;
    heroSubAts: string;
    heroSubInterviews: string;
    heroSubSuffix: string;
    searchPlaceholder: string;
    searchBtn: string;
    freeArticles: string;
    featured: string;
    readArticle: string;
    allGuides: string;
    articles: string;
    articleSingle: string;
    inCategory: string;
    matching: string;
    noArticles: string;
    noArticlesSub: string;
    clearFilters: string;
    ctaH2: string;
    ctaSub: string;
    startFree: string;
    atsBuilder: string;
    templates: string;
    interviewPrep: string;
    fresherResume: string;
  };
  // Blog article page
  blogArticle: {
    blog: string;
    getStarted: string;
    backToBlog: string;
    relatedH2: string;
    moreArticles: string;
  };
  // NotFound
  notFound: {
    title: string;
    subtitle: string;
    returnHome: string;
  };
  // ResetPassword
  resetPw: {
    title: string;
    subtitle: string;
    invalidTitle: string;
    invalidDesc: string;
    goHome: string;
    newPassword: string;
    confirmPassword: string;
    minLength: string;
    uppercase: string;
    number: string;
    match: string;
    noMatch: string;
    updating: string;
    updateBtn: string;
    successTitle: string;
    successDesc: string;
  };
  // Auth extras (hardcoded strings)
  authExtra: {
    forgotPassword: string;
    resetTitle: string;
    resetDesc: string;
    sending: string;
    sendReset: string;
    checkEmail: string;
    checkEmailDesc: string;
  };
  // RoleSelection
  role: {
    title: string;
    subtitle: string;
    jobSeekerTitle: string;
    jobSeekerDesc: string;
    jobSeekerBtn: string;
    recruiterTitle: string;
    recruiterDesc: string;
    recruiterBtn: string;
    errorTitle: string;
    errorDesc: string;
  };
}

const en: MiscTranslations = {
  blog: {
    heroTag: "Career Blog",
    heroTitle1: "Career Insights",
    heroTitle2: "& Expert Tips",
    heroSubPrefix: "Expert advice on",
    heroSubAts: "ATS resumes",
    heroSubInterviews: "interviews",
    heroSubSuffix: ", salary negotiation, and landing your dream job — written by career experts.",
    searchPlaceholder: "Search articles…",
    searchBtn: "Search",
    freeArticles: "free articles · Updated 2026",
    featured: "Featured",
    readArticle: "Read Article",
    allGuides: "All Guides",
    articles: "articles",
    articleSingle: "article",
    inCategory: "in",
    matching: "matching",
    noArticles: "No articles found",
    noArticlesSub: "Try a different search term or category.",
    clearFilters: "Clear filters",
    ctaH2: "Ready to Build Your ATS Resume?",
    ctaSub: "Put this advice into action with our free AI-powered tools.",
    startFree: "Start for Free",
    atsBuilder: "ATS Resume Builder",
    templates: "Resume Templates",
    interviewPrep: "Interview Prep",
    fresherResume: "Fresher Resume",
  },
  blogArticle: {
    blog: "Blog",
    getStarted: "Get Started",
    backToBlog: "Back to Blog",
    relatedH2: "Explore Related Resources",
    moreArticles: "More Articles",
  },
  notFound: { title: "404", subtitle: "Oops! Page not found", returnHome: "Return to Home" },
  resetPw: {
    title: "Reset Password",
    subtitle: "Enter your new password below.",
    invalidTitle: "Invalid Link",
    invalidDesc: "This password reset link is invalid or has expired.",
    goHome: "Go Home",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    minLength: "At least 6 characters",
    uppercase: "One uppercase letter",
    number: "One number",
    match: "Passwords match",
    noMatch: "Passwords don't match",
    updating: "Updating...",
    updateBtn: "Update Password",
    successTitle: "Password updated",
    successDesc: "Your password has been reset successfully.",
  },
  authExtra: {
    forgotPassword: "Forgot password?",
    resetTitle: "Reset Password",
    resetDesc: "Enter your email and we'll send you a reset link.",
    sending: "Sending...",
    sendReset: "Send Reset Link",
    checkEmail: "Check your email",
    checkEmailDesc: "We sent you a password reset link.",
  },
  role: {
    title: "Welcome! How will you use the platform?",
    subtitle: "Choose your role to get started. This determines your experience.",
    jobSeekerTitle: "Job Seeker",
    jobSeekerDesc: "Browse jobs, build resumes, and track applications",
    jobSeekerBtn: "I'm looking for a job",
    recruiterTitle: "Recruiter",
    recruiterDesc: "Post job openings and find candidates",
    recruiterBtn: "I'm hiring talent",
    errorTitle: "Error",
    errorDesc: "Failed to set role. Please try again.",
  },
};

const ar: MiscTranslations = {
  blog: {
    heroTag: "مدونة المهنة", heroTitle1: "رؤى مهنية", heroTitle2: "ونصائح خبراء",
    heroSubPrefix: "نصائح خبراء حول", heroSubAts: "سير ATS الذاتية", heroSubInterviews: "المقابلات",
    heroSubSuffix: "، التفاوض على الراتب، والحصول على وظيفة أحلامك.",
    searchPlaceholder: "ابحث في المقالات…", searchBtn: "بحث", freeArticles: "مقالة مجانية · محدثة 2026",
    featured: "مميز", readArticle: "اقرأ المقال", allGuides: "جميع الأدلة",
    articles: "مقالات", articleSingle: "مقال", inCategory: "في", matching: "مطابقة",
    noArticles: "لا توجد مقالات", noArticlesSub: "جرب مصطلح بحث أو فئة مختلفة.", clearFilters: "مسح الفلاتر",
    ctaH2: "هل أنت مستعد لبناء سيرتك الذاتية ATS؟", ctaSub: "طبق هذه النصائح مع أدواتنا المجانية.",
    startFree: "ابدأ مجاناً", atsBuilder: "منشئ سيرة ATS", templates: "قوالب السيرة الذاتية",
    interviewPrep: "التحضير للمقابلة", fresherResume: "سيرة الخريجين",
  },
  blogArticle: { blog: "المدونة", getStarted: "ابدأ", backToBlog: "العودة للمدونة", relatedH2: "استكشف الموارد ذات الصلة", moreArticles: "المزيد من المقالات" },
  notFound: { title: "404", subtitle: "عذراً! الصفحة غير موجودة", returnHome: "العودة للرئيسية" },
  resetPw: { title: "إعادة تعيين كلمة المرور", subtitle: "أدخل كلمة المرور الجديدة.", invalidTitle: "رابط غير صالح", invalidDesc: "رابط إعادة التعيين غير صالح أو منتهي.", goHome: "الرئيسية", newPassword: "كلمة مرور جديدة", confirmPassword: "تأكيد كلمة المرور", minLength: "6 أحرف على الأقل", uppercase: "حرف كبير واحد", number: "رقم واحد", match: "كلمات المرور متطابقة", noMatch: "كلمات المرور غير متطابقة", updating: "جاري التحديث...", updateBtn: "تحديث كلمة المرور", successTitle: "تم تحديث كلمة المرور", successDesc: "تمت إعادة تعيين كلمة المرور بنجاح." },
  authExtra: { forgotPassword: "نسيت كلمة المرور؟", resetTitle: "إعادة تعيين كلمة المرور", resetDesc: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.", sending: "جاري الإرسال...", sendReset: "إرسال رابط إعادة التعيين", checkEmail: "تحقق من بريدك الإلكتروني", checkEmailDesc: "أرسلنا لك رابط إعادة تعيين كلمة المرور." },
  role: { title: "مرحباً! كيف ستستخدم المنصة؟", subtitle: "اختر دورك للبدء. هذا يحدد تجربتك.", jobSeekerTitle: "باحث عن عمل", jobSeekerDesc: "تصفح الوظائف وأنشئ السير الذاتية وتتبع الطلبات", jobSeekerBtn: "أبحث عن وظيفة", recruiterTitle: "مسؤول توظيف", recruiterDesc: "انشر فرص عمل وابحث عن مرشحين", recruiterBtn: "أوظف مواهب", errorTitle: "خطأ", errorDesc: "فشل تعيين الدور. حاول مرة أخرى." },
};

const es: MiscTranslations = {
  blog: {
    heroTag: "Blog de Carrera", heroTitle1: "Perspectivas de Carrera", heroTitle2: "y Consejos de Expertos",
    heroSubPrefix: "Consejos de expertos sobre", heroSubAts: "CVs ATS", heroSubInterviews: "entrevistas",
    heroSubSuffix: ", negociación salarial y conseguir tu trabajo soñado.",
    searchPlaceholder: "Buscar artículos…", searchBtn: "Buscar", freeArticles: "artículos gratis · Actualizado 2026",
    featured: "Destacado", readArticle: "Leer Artículo", allGuides: "Todas las Guías",
    articles: "artículos", articleSingle: "artículo", inCategory: "en", matching: "coincidiendo con",
    noArticles: "No se encontraron artículos", noArticlesSub: "Prueba con otro término de búsqueda o categoría.", clearFilters: "Limpiar filtros",
    ctaH2: "¿Listo para Crear Tu CV ATS?", ctaSub: "Pon estos consejos en acción con nuestras herramientas gratuitas.",
    startFree: "Comenzar Gratis", atsBuilder: "Constructor ATS", templates: "Plantillas de CV",
    interviewPrep: "Preparación Entrevista", fresherResume: "CV para Recién Graduados",
  },
  blogArticle: { blog: "Blog", getStarted: "Comenzar", backToBlog: "Volver al Blog", relatedH2: "Explorar Recursos Relacionados", moreArticles: "Más Artículos" },
  notFound: { title: "404", subtitle: "¡Ups! Página no encontrada", returnHome: "Volver al Inicio" },
  resetPw: { title: "Restablecer Contraseña", subtitle: "Ingresa tu nueva contraseña.", invalidTitle: "Enlace Inválido", invalidDesc: "Este enlace ha expirado o es inválido.", goHome: "Ir al Inicio", newPassword: "Nueva Contraseña", confirmPassword: "Confirmar Contraseña", minLength: "Al menos 6 caracteres", uppercase: "Una letra mayúscula", number: "Un número", match: "Las contraseñas coinciden", noMatch: "Las contraseñas no coinciden", updating: "Actualizando...", updateBtn: "Actualizar Contraseña", successTitle: "Contraseña actualizada", successDesc: "Tu contraseña se restableció exitosamente." },
  authExtra: { forgotPassword: "¿Olvidaste tu contraseña?", resetTitle: "Restablecer Contraseña", resetDesc: "Ingresa tu correo y te enviaremos un enlace.", sending: "Enviando...", sendReset: "Enviar Enlace", checkEmail: "Revisa tu correo", checkEmailDesc: "Te enviamos un enlace para restablecer." },
  role: { title: "¡Bienvenido! ¿Cómo usarás la plataforma?", subtitle: "Elige tu rol para comenzar.", jobSeekerTitle: "Buscador de Empleo", jobSeekerDesc: "Busca empleos, crea CVs y rastrea solicitudes", jobSeekerBtn: "Busco empleo", recruiterTitle: "Reclutador", recruiterDesc: "Publica ofertas y encuentra candidatos", recruiterBtn: "Estoy contratando", errorTitle: "Error", errorDesc: "No se pudo asignar el rol. Intenta de nuevo." },
};

const fr: MiscTranslations = {
  blog: {
    heroTag: "Blog Carrière", heroTitle1: "Perspectives de Carrière", heroTitle2: "& Conseils d'Experts",
    heroSubPrefix: "Conseils d'experts sur", heroSubAts: "les CV ATS", heroSubInterviews: "les entretiens",
    heroSubSuffix: ", la négociation salariale et décrocher votre emploi de rêve.",
    searchPlaceholder: "Rechercher des articles…", searchBtn: "Rechercher", freeArticles: "articles gratuits · Mis à jour 2026",
    featured: "En vedette", readArticle: "Lire l'Article", allGuides: "Tous les Guides",
    articles: "articles", articleSingle: "article", inCategory: "dans", matching: "correspondant à",
    noArticles: "Aucun article trouvé", noArticlesSub: "Essayez un autre terme de recherche.", clearFilters: "Effacer les filtres",
    ctaH2: "Prêt à Créer Votre CV ATS ?", ctaSub: "Mettez ces conseils en pratique avec nos outils gratuits.",
    startFree: "Commencer Gratuitement", atsBuilder: "Constructeur ATS", templates: "Modèles de CV",
    interviewPrep: "Préparation Entretien", fresherResume: "CV Débutant",
  },
  blogArticle: { blog: "Blog", getStarted: "Commencer", backToBlog: "Retour au Blog", relatedH2: "Ressources Connexes", moreArticles: "Plus d'Articles" },
  notFound: { title: "404", subtitle: "Oups ! Page introuvable", returnHome: "Retour à l'Accueil" },
  resetPw: { title: "Réinitialiser le Mot de Passe", subtitle: "Entrez votre nouveau mot de passe.", invalidTitle: "Lien Invalide", invalidDesc: "Ce lien est invalide ou a expiré.", goHome: "Accueil", newPassword: "Nouveau Mot de Passe", confirmPassword: "Confirmer le Mot de Passe", minLength: "Au moins 6 caractères", uppercase: "Une lettre majuscule", number: "Un chiffre", match: "Les mots de passe correspondent", noMatch: "Les mots de passe ne correspondent pas", updating: "Mise à jour...", updateBtn: "Mettre à Jour", successTitle: "Mot de passe mis à jour", successDesc: "Votre mot de passe a été réinitialisé." },
  authExtra: { forgotPassword: "Mot de passe oublié ?", resetTitle: "Réinitialiser le Mot de Passe", resetDesc: "Entrez votre e-mail pour recevoir un lien.", sending: "Envoi...", sendReset: "Envoyer le Lien", checkEmail: "Vérifiez votre e-mail", checkEmailDesc: "Nous vous avons envoyé un lien." },
  role: { title: "Bienvenue ! Comment utiliserez-vous la plateforme ?", subtitle: "Choisissez votre rôle pour commencer.", jobSeekerTitle: "Chercheur d'Emploi", jobSeekerDesc: "Parcourez les offres, créez des CV et suivez vos candidatures", jobSeekerBtn: "Je cherche un emploi", recruiterTitle: "Recruteur", recruiterDesc: "Publiez des offres et trouvez des candidats", recruiterBtn: "Je recrute", errorTitle: "Erreur", errorDesc: "Impossible de définir le rôle." },
};

const hi: MiscTranslations = {
  blog: {
    heroTag: "करियर ब्लॉग", heroTitle1: "करियर इनसाइट्स", heroTitle2: "और विशेषज्ञ सुझाव",
    heroSubPrefix: "विशेषज्ञ सलाह", heroSubAts: "ATS रिज्यूमे", heroSubInterviews: "साक्षात्कार",
    heroSubSuffix: ", वेतन बातचीत, और सपनों की नौकरी पाने पर।",
    searchPlaceholder: "लेख खोजें…", searchBtn: "खोजें", freeArticles: "मुफ्त लेख · 2026 अपडेटेड",
    featured: "विशेष", readArticle: "लेख पढ़ें", allGuides: "सभी गाइड",
    articles: "लेख", articleSingle: "लेख", inCategory: "में", matching: "मिलान",
    noArticles: "कोई लेख नहीं मिला", noArticlesSub: "कोई अलग खोज शब्द आज़माएं।", clearFilters: "फ़िल्टर साफ़ करें",
    ctaH2: "अपना ATS रिज्यूमे बनाने के लिए तैयार?", ctaSub: "हमारे मुफ्त AI टूल्स से इन सुझावों को अमल में लाएं।",
    startFree: "मुफ्त शुरू करें", atsBuilder: "ATS रिज्यूमे बिल्डर", templates: "रिज्यूमे टेम्पलेट्स",
    interviewPrep: "साक्षात्कार तैयारी", fresherResume: "फ्रेशर रिज्यूमे",
  },
  blogArticle: { blog: "ब्लॉग", getStarted: "शुरू करें", backToBlog: "ब्लॉग पर वापस", relatedH2: "संबंधित संसाधन", moreArticles: "और लेख" },
  notFound: { title: "404", subtitle: "ओह! पेज नहीं मिला", returnHome: "होम पर लौटें" },
  resetPw: { title: "पासवर्ड रीसेट करें", subtitle: "अपना नया पासवर्ड दर्ज करें।", invalidTitle: "अमान्य लिंक", invalidDesc: "यह लिंक अमान्य या समाप्त हो गया है।", goHome: "होम", newPassword: "नया पासवर्ड", confirmPassword: "पासवर्ड की पुष्टि", minLength: "कम से कम 6 अक्षर", uppercase: "एक बड़ा अक्षर", number: "एक अंक", match: "पासवर्ड मेल खाते हैं", noMatch: "पासवर्ड मेल नहीं खाते", updating: "अपडेट हो रहा है...", updateBtn: "पासवर्ड अपडेट करें", successTitle: "पासवर्ड अपडेट हुआ", successDesc: "आपका पासवर्ड सफलतापूर्वक रीसेट हो गया।" },
  authExtra: { forgotPassword: "पासवर्ड भूल गए?", resetTitle: "पासवर्ड रीसेट", resetDesc: "अपना ईमेल दर्ज करें, हम रीसेट लिंक भेजेंगे।", sending: "भेज रहे हैं...", sendReset: "रीसेट लिंक भेजें", checkEmail: "अपना ईमेल जांचें", checkEmailDesc: "हमने आपको रीसेट लिंक भेजा है।" },
  role: { title: "स्वागत है! आप प्लेटफ़ॉर्म कैसे उपयोग करेंगे?", subtitle: "शुरू करने के लिए अपनी भूमिका चुनें।", jobSeekerTitle: "नौकरी खोजने वाला", jobSeekerDesc: "नौकरियां ब्राउज़ करें, रिज्यूमे बनाएं, और आवेदन ट्रैक करें", jobSeekerBtn: "मैं नौकरी ढूंढ रहा हूं", recruiterTitle: "रिक्रूटर", recruiterDesc: "नौकरी पोस्ट करें और उम्मीदवार खोजें", recruiterBtn: "मैं भर्ती कर रहा हूं", errorTitle: "त्रुटि", errorDesc: "भूमिका सेट करने में विफल।" },
};

const pt: MiscTranslations = {
  blog: {
    heroTag: "Blog de Carreira", heroTitle1: "Perspectivas de Carreira", heroTitle2: "& Dicas de Especialistas",
    heroSubPrefix: "Conselhos de especialistas sobre", heroSubAts: "CVs ATS", heroSubInterviews: "entrevistas",
    heroSubSuffix: ", negociação salarial e como conquistar o emprego dos seus sonhos.",
    searchPlaceholder: "Buscar artigos…", searchBtn: "Buscar", freeArticles: "artigos grátis · Atualizado 2026",
    featured: "Destaque", readArticle: "Ler Artigo", allGuides: "Todos os Guias",
    articles: "artigos", articleSingle: "artigo", inCategory: "em", matching: "correspondendo a",
    noArticles: "Nenhum artigo encontrado", noArticlesSub: "Tente outro termo de busca.", clearFilters: "Limpar filtros",
    ctaH2: "Pronto para Criar Seu CV ATS?", ctaSub: "Coloque estes conselhos em prática com nossas ferramentas gratuitas.",
    startFree: "Começar Grátis", atsBuilder: "Construtor ATS", templates: "Modelos de CV",
    interviewPrep: "Preparação para Entrevista", fresherResume: "CV para Recém-Formados",
  },
  blogArticle: { blog: "Blog", getStarted: "Começar", backToBlog: "Voltar ao Blog", relatedH2: "Recursos Relacionados", moreArticles: "Mais Artigos" },
  notFound: { title: "404", subtitle: "Ops! Página não encontrada", returnHome: "Voltar ao Início" },
  resetPw: { title: "Redefinir Senha", subtitle: "Digite sua nova senha.", invalidTitle: "Link Inválido", invalidDesc: "Este link expirou ou é inválido.", goHome: "Início", newPassword: "Nova Senha", confirmPassword: "Confirmar Senha", minLength: "Pelo menos 6 caracteres", uppercase: "Uma letra maiúscula", number: "Um número", match: "Senhas coincidem", noMatch: "Senhas não coincidem", updating: "Atualizando...", updateBtn: "Atualizar Senha", successTitle: "Senha atualizada", successDesc: "Sua senha foi redefinida com sucesso." },
  authExtra: { forgotPassword: "Esqueceu a senha?", resetTitle: "Redefinir Senha", resetDesc: "Digite seu e-mail para receber um link.", sending: "Enviando...", sendReset: "Enviar Link", checkEmail: "Verifique seu e-mail", checkEmailDesc: "Enviamos um link de redefinição." },
  role: { title: "Bem-vindo! Como usará a plataforma?", subtitle: "Escolha seu papel para começar.", jobSeekerTitle: "Candidato", jobSeekerDesc: "Busque vagas, crie CVs e acompanhe candidaturas", jobSeekerBtn: "Estou procurando emprego", recruiterTitle: "Recrutador", recruiterDesc: "Publique vagas e encontre candidatos", recruiterBtn: "Estou contratando", errorTitle: "Erro", errorDesc: "Falha ao definir o papel." },
};

const de: MiscTranslations = {
  blog: {
    heroTag: "Karriere-Blog", heroTitle1: "Karriere-Einblicke", heroTitle2: "& Expertentipps",
    heroSubPrefix: "Expertenrat zu", heroSubAts: "ATS-Lebensläufen", heroSubInterviews: "Interviews",
    heroSubSuffix: ", Gehaltsverhandlung und wie Sie Ihren Traumjob finden.",
    searchPlaceholder: "Artikel suchen…", searchBtn: "Suchen", freeArticles: "kostenlose Artikel · Aktualisiert 2026",
    featured: "Empfohlen", readArticle: "Artikel lesen", allGuides: "Alle Anleitungen",
    articles: "Artikel", articleSingle: "Artikel", inCategory: "in", matching: "passend zu",
    noArticles: "Keine Artikel gefunden", noArticlesSub: "Versuchen Sie einen anderen Suchbegriff.", clearFilters: "Filter löschen",
    ctaH2: "Bereit für Ihren ATS-Lebenslauf?", ctaSub: "Setzen Sie diese Tipps mit unseren kostenlosen Tools um.",
    startFree: "Kostenlos starten", atsBuilder: "ATS-Builder", templates: "Lebenslauf-Vorlagen",
    interviewPrep: "Interview-Vorbereitung", fresherResume: "Berufseinsteiger-CV",
  },
  blogArticle: { blog: "Blog", getStarted: "Starten", backToBlog: "Zurück zum Blog", relatedH2: "Verwandte Ressourcen", moreArticles: "Mehr Artikel" },
  notFound: { title: "404", subtitle: "Oops! Seite nicht gefunden", returnHome: "Zurück zur Startseite" },
  resetPw: { title: "Passwort zurücksetzen", subtitle: "Geben Sie Ihr neues Passwort ein.", invalidTitle: "Ungültiger Link", invalidDesc: "Dieser Link ist ungültig oder abgelaufen.", goHome: "Startseite", newPassword: "Neues Passwort", confirmPassword: "Passwort bestätigen", minLength: "Mindestens 6 Zeichen", uppercase: "Ein Großbuchstabe", number: "Eine Zahl", match: "Passwörter stimmen überein", noMatch: "Passwörter stimmen nicht überein", updating: "Wird aktualisiert...", updateBtn: "Passwort aktualisieren", successTitle: "Passwort aktualisiert", successDesc: "Ihr Passwort wurde erfolgreich zurückgesetzt." },
  authExtra: { forgotPassword: "Passwort vergessen?", resetTitle: "Passwort zurücksetzen", resetDesc: "Geben Sie Ihre E-Mail ein für einen Reset-Link.", sending: "Wird gesendet...", sendReset: "Link senden", checkEmail: "Prüfen Sie Ihre E-Mail", checkEmailDesc: "Wir haben Ihnen einen Link gesendet." },
  role: { title: "Willkommen! Wie werden Sie die Plattform nutzen?", subtitle: "Wählen Sie Ihre Rolle.", jobSeekerTitle: "Jobsuchender", jobSeekerDesc: "Jobs suchen, Lebensläufe erstellen und Bewerbungen verfolgen", jobSeekerBtn: "Ich suche einen Job", recruiterTitle: "Recruiter", recruiterDesc: "Stellen ausschreiben und Kandidaten finden", recruiterBtn: "Ich stelle ein", errorTitle: "Fehler", errorDesc: "Rolle konnte nicht gesetzt werden." },
};

const zh: MiscTranslations = {
  blog: {
    heroTag: "职业博客", heroTitle1: "职业洞察", heroTitle2: "和专家建议",
    heroSubPrefix: "关于", heroSubAts: "ATS简历", heroSubInterviews: "面试",
    heroSubSuffix: "、薪资谈判和找到理想工作的专家建议。",
    searchPlaceholder: "搜索文章…", searchBtn: "搜索", freeArticles: "篇免费文章 · 2026更新",
    featured: "精选", readArticle: "阅读文章", allGuides: "所有指南",
    articles: "篇文章", articleSingle: "篇文章", inCategory: "在", matching: "匹配",
    noArticles: "未找到文章", noArticlesSub: "尝试其他搜索词。", clearFilters: "清除筛选",
    ctaH2: "准备好创建ATS简历了吗？", ctaSub: "使用我们的免费AI工具将这些建议付诸实践。",
    startFree: "免费开始", atsBuilder: "ATS简历构建器", templates: "简历模板",
    interviewPrep: "面试准备", fresherResume: "应届生简历",
  },
  blogArticle: { blog: "博客", getStarted: "开始", backToBlog: "返回博客", relatedH2: "相关资源", moreArticles: "更多文章" },
  notFound: { title: "404", subtitle: "哎呀！页面未找到", returnHome: "返回首页" },
  resetPw: { title: "重置密码", subtitle: "输入新密码。", invalidTitle: "无效链接", invalidDesc: "此链接无效或已过期。", goHome: "首页", newPassword: "新密码", confirmPassword: "确认密码", minLength: "至少6个字符", uppercase: "一个大写字母", number: "一个数字", match: "密码匹配", noMatch: "密码不匹配", updating: "更新中...", updateBtn: "更新密码", successTitle: "密码已更新", successDesc: "您的密码已成功重置。" },
  authExtra: { forgotPassword: "忘记密码？", resetTitle: "重置密码", resetDesc: "输入您的邮箱以获取重置链接。", sending: "发送中...", sendReset: "发送重置链接", checkEmail: "检查邮箱", checkEmailDesc: "我们已发送重置链接。" },
  role: { title: "欢迎！您将如何使用平台？", subtitle: "选择您的角色以开始。", jobSeekerTitle: "求职者", jobSeekerDesc: "浏览职位、创建简历、跟踪申请", jobSeekerBtn: "我在找工作", recruiterTitle: "招聘者", recruiterDesc: "发布职位、寻找候选人", recruiterBtn: "我在招聘", errorTitle: "错误", errorDesc: "设置角色失败。" },
};

const ja: MiscTranslations = {
  blog: {
    heroTag: "キャリアブログ", heroTitle1: "キャリアインサイト", heroTitle2: "＆専門家のアドバイス",
    heroSubPrefix: "専門家のアドバイス：", heroSubAts: "ATS履歴書", heroSubInterviews: "面接",
    heroSubSuffix: "、給与交渉、理想の仕事を見つけるコツ。",
    searchPlaceholder: "記事を検索…", searchBtn: "検索", freeArticles: "件の無料記事 · 2026年更新",
    featured: "注目", readArticle: "記事を読む", allGuides: "すべてのガイド",
    articles: "件の記事", articleSingle: "件の記事", inCategory: "の", matching: "に一致",
    noArticles: "記事が見つかりません", noArticlesSub: "別の検索語をお試しください。", clearFilters: "フィルターをクリア",
    ctaH2: "ATS履歴書を作成する準備はできましたか？", ctaSub: "無料のAIツールでこのアドバイスを実践しましょう。",
    startFree: "無料で始める", atsBuilder: "ATS履歴書ビルダー", templates: "履歴書テンプレート",
    interviewPrep: "面接準備", fresherResume: "新卒履歴書",
  },
  blogArticle: { blog: "ブログ", getStarted: "始める", backToBlog: "ブログに戻る", relatedH2: "関連リソース", moreArticles: "その他の記事" },
  notFound: { title: "404", subtitle: "ページが見つかりません", returnHome: "ホームに戻る" },
  resetPw: { title: "パスワードリセット", subtitle: "新しいパスワードを入力してください。", invalidTitle: "無効なリンク", invalidDesc: "このリンクは無効または期限切れです。", goHome: "ホーム", newPassword: "新しいパスワード", confirmPassword: "パスワード確認", minLength: "6文字以上", uppercase: "大文字1つ", number: "数字1つ", match: "パスワードが一致", noMatch: "パスワードが不一致", updating: "更新中...", updateBtn: "パスワードを更新", successTitle: "パスワード更新完了", successDesc: "パスワードが正常にリセットされました。" },
  authExtra: { forgotPassword: "パスワードを忘れた？", resetTitle: "パスワードリセット", resetDesc: "メールアドレスを入力してリセットリンクを送信します。", sending: "送信中...", sendReset: "リセットリンクを送信", checkEmail: "メールを確認", checkEmailDesc: "リセットリンクを送信しました。" },
  role: { title: "ようこそ！プラットフォームをどのように使いますか？", subtitle: "役割を選択して始めましょう。", jobSeekerTitle: "求職者", jobSeekerDesc: "求人を探し、履歴書を作成し、応募を追跡", jobSeekerBtn: "仕事を探しています", recruiterTitle: "採用担当者", recruiterDesc: "求人を掲載し、候補者を見つける", recruiterBtn: "採用しています", errorTitle: "エラー", errorDesc: "役割の設定に失敗しました。" },
};

const ko: MiscTranslations = {
  blog: {
    heroTag: "커리어 블로그", heroTitle1: "커리어 인사이트", heroTitle2: "& 전문가 팁",
    heroSubPrefix: "전문가 조언:", heroSubAts: "ATS 이력서", heroSubInterviews: "면접",
    heroSubSuffix: ", 연봉 협상, 꿈의 직장 찾기.",
    searchPlaceholder: "기사 검색…", searchBtn: "검색", freeArticles: "개 무료 기사 · 2026 업데이트",
    featured: "추천", readArticle: "기사 읽기", allGuides: "모든 가이드",
    articles: "개 기사", articleSingle: "개 기사", inCategory: "의", matching: "일치",
    noArticles: "기사를 찾을 수 없습니다", noArticlesSub: "다른 검색어를 시도하세요.", clearFilters: "필터 지우기",
    ctaH2: "ATS 이력서를 만들 준비가 되셨나요?", ctaSub: "무료 AI 도구로 이 조언을 실천하세요.",
    startFree: "무료로 시작", atsBuilder: "ATS 이력서 빌더", templates: "이력서 템플릿",
    interviewPrep: "면접 준비", fresherResume: "신입 이력서",
  },
  blogArticle: { blog: "블로그", getStarted: "시작하기", backToBlog: "블로그로 돌아가기", relatedH2: "관련 리소스", moreArticles: "더 많은 기사" },
  notFound: { title: "404", subtitle: "이런! 페이지를 찾을 수 없습니다", returnHome: "홈으로 돌아가기" },
  resetPw: { title: "비밀번호 재설정", subtitle: "새 비밀번호를 입력하세요.", invalidTitle: "유효하지 않은 링크", invalidDesc: "이 링크는 유효하지 않거나 만료되었습니다.", goHome: "홈", newPassword: "새 비밀번호", confirmPassword: "비밀번호 확인", minLength: "최소 6자", uppercase: "대문자 1개", number: "숫자 1개", match: "비밀번호 일치", noMatch: "비밀번호 불일치", updating: "업데이트 중...", updateBtn: "비밀번호 업데이트", successTitle: "비밀번호 업데이트됨", successDesc: "비밀번호가 성공적으로 재설정되었습니다." },
  authExtra: { forgotPassword: "비밀번호를 잊으셨나요?", resetTitle: "비밀번호 재설정", resetDesc: "이메일을 입력하면 재설정 링크를 보내드립니다.", sending: "전송 중...", sendReset: "재설정 링크 보내기", checkEmail: "이메일을 확인하세요", checkEmailDesc: "비밀번호 재설정 링크를 보냈습니다." },
  role: { title: "환영합니다! 플랫폼을 어떻게 사용하시겠습니까?", subtitle: "역할을 선택하여 시작하세요.", jobSeekerTitle: "구직자", jobSeekerDesc: "채용 공고 탐색, 이력서 작성, 지원 추적", jobSeekerBtn: "일자리를 찾고 있습니다", recruiterTitle: "채용 담당자", recruiterDesc: "채용 공고 게시 및 후보자 찾기", recruiterBtn: "인재를 채용하고 있습니다", errorTitle: "오류", errorDesc: "역할 설정에 실패했습니다." },
};

export const miscTranslations: Record<Locale, MiscTranslations> = { en, ar, es, fr, hi, pt, de, zh, ja, ko };
