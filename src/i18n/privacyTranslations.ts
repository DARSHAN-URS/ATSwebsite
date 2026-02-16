import type { Locale } from "./translations";

export interface PrivacyTranslations {
  title: string;
  lastUpdated: string;
  s1Title: string; s1Content: string;
  s2Title: string; s2Items: string[];
  s3Title: string; s3Content: string;
  s4Title: string; s4Content: string;
  s5Title: string; s5Content: string;
  s6Title: string; s6Content: string;
  s7Title: string; s7Content: string;
  backToHome: string;
}

const en: PrivacyTranslations = {
  title: "Privacy Policy",
  lastUpdated: "Last updated:",
  s1Title: "1. Information We Collect",
  s1Content: "When you use ATS Pro Resume Builder, we collect information you provide directly, including your name, email address, and resume content. We also automatically collect usage data such as pages visited, features used, and device information to improve our services.",
  s2Title: "2. How We Use Your Information",
  s2Items: ["To provide, maintain, and improve our resume building and job tracking services", "To process your resume data through our AI-powered optimization tools", "To send you account-related notifications and updates", "To analyze usage patterns and improve user experience", "To protect against fraud and unauthorized access"],
  s3Title: "3. Data Storage & Security",
  s3Content: "Your data is stored securely using industry-standard encryption. Resume data and personal information are stored in encrypted databases. We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, or destruction.",
  s4Title: "4. Data Sharing",
  s4Content: "We do not sell your personal information to third parties. We may share data with trusted service providers who assist in operating our platform, subject to strict confidentiality agreements. We may also disclose information when required by law or to protect our rights.",
  s5Title: "5. Your Rights",
  s5Content: "You have the right to access, correct, or delete your personal data at any time. You can export your resume data or request account deletion through your account settings. We will respond to all data-related requests within 30 days.",
  s6Title: "6. Cookies",
  s6Content: "We use essential cookies for authentication and session management. We may also use analytics cookies to understand how our platform is used. You can control cookie preferences through your browser settings.",
  s7Title: "7. Contact Us",
  s7Content: "If you have questions about this Privacy Policy or our data practices, please contact us at",
  backToHome: "Back to Home",
};

const ar: PrivacyTranslations = {
  title: "سياسة الخصوصية",
  lastUpdated: "آخر تحديث:",
  s1Title: "1. المعلومات التي نجمعها",
  s1Content: "عند استخدامك لـ ATS Pro Resume Builder، نجمع المعلومات التي تقدمها مباشرة، بما في ذلك اسمك وبريدك الإلكتروني ومحتوى سيرتك الذاتية. كما نجمع تلقائيًا بيانات الاستخدام لتحسين خدماتنا.",
  s2Title: "2. كيف نستخدم معلوماتك",
  s2Items: ["لتقديم وصيانة وتحسين خدمات بناء السيرة الذاتية وتتبع الوظائف", "لمعالجة بيانات سيرتك الذاتية من خلال أدوات التحسين بالذكاء الاصطناعي", "لإرسال إشعارات وتحديثات متعلقة بالحساب", "لتحليل أنماط الاستخدام وتحسين تجربة المستخدم", "للحماية من الاحتيال والوصول غير المصرح به"],
  s3Title: "3. تخزين البيانات والأمان",
  s3Content: "يتم تخزين بياناتك بشكل آمن باستخدام تشفير قياسي. نطبق تدابير تقنية وتنظيمية مناسبة لحماية بياناتك الشخصية.",
  s4Title: "4. مشاركة البيانات",
  s4Content: "لا نبيع معلوماتك الشخصية لأطراف ثالثة. قد نشارك البيانات مع مزودي خدمات موثوقين يساعدون في تشغيل منصتنا، بموجب اتفاقيات سرية صارمة.",
  s5Title: "5. حقوقك",
  s5Content: "لديك الحق في الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها في أي وقت. يمكنك تصدير بيانات سيرتك الذاتية أو طلب حذف الحساب.",
  s6Title: "6. ملفات تعريف الارتباط",
  s6Content: "نستخدم ملفات تعريف الارتباط الأساسية للمصادقة وإدارة الجلسات. يمكنك التحكم في تفضيلات ملفات تعريف الارتباط من خلال إعدادات المتصفح.",
  s7Title: "7. اتصل بنا",
  s7Content: "إذا كانت لديك أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا على",
  backToHome: "العودة للرئيسية",
};

const es: PrivacyTranslations = {
  title: "Política de Privacidad",
  lastUpdated: "Última actualización:",
  s1Title: "1. Información que Recopilamos",
  s1Content: "Al usar ATS Pro Resume Builder, recopilamos información que proporcionas directamente, incluyendo tu nombre, correo electrónico y contenido de tu CV. También recopilamos automáticamente datos de uso para mejorar nuestros servicios.",
  s2Title: "2. Cómo Usamos Tu Información",
  s2Items: ["Para proporcionar, mantener y mejorar nuestros servicios de creación de CV y seguimiento de empleos", "Para procesar tus datos de CV a través de herramientas de optimización con IA", "Para enviarte notificaciones y actualizaciones de tu cuenta", "Para analizar patrones de uso y mejorar la experiencia del usuario", "Para proteger contra fraude y acceso no autorizado"],
  s3Title: "3. Almacenamiento y Seguridad de Datos",
  s3Content: "Tus datos se almacenan de forma segura usando cifrado estándar de la industria. Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales.",
  s4Title: "4. Compartir Datos",
  s4Content: "No vendemos tu información personal a terceros. Podemos compartir datos con proveedores de servicios de confianza que ayudan a operar nuestra plataforma, sujetos a acuerdos de confidencialidad estrictos.",
  s5Title: "5. Tus Derechos",
  s5Content: "Tienes derecho a acceder, corregir o eliminar tus datos personales en cualquier momento. Puedes exportar tus datos de CV o solicitar la eliminación de tu cuenta.",
  s6Title: "6. Cookies",
  s6Content: "Usamos cookies esenciales para autenticación y gestión de sesiones. Puedes controlar las preferencias de cookies a través de la configuración de tu navegador.",
  s7Title: "7. Contáctanos",
  s7Content: "Si tienes preguntas sobre esta Política de Privacidad, contáctanos en",
  backToHome: "Volver al Inicio",
};

const fr: PrivacyTranslations = {
  title: "Politique de Confidentialité",
  lastUpdated: "Dernière mise à jour :",
  s1Title: "1. Informations que Nous Collectons",
  s1Content: "Lors de l'utilisation d'ATS Pro Resume Builder, nous collectons les informations que vous fournissez directement, y compris votre nom, adresse e-mail et contenu de CV. Nous collectons également automatiquement des données d'utilisation pour améliorer nos services.",
  s2Title: "2. Comment Nous Utilisons Vos Informations",
  s2Items: ["Pour fournir, maintenir et améliorer nos services de création de CV et de suivi d'emploi", "Pour traiter vos données de CV via nos outils d'optimisation IA", "Pour vous envoyer des notifications et mises à jour liées à votre compte", "Pour analyser les modèles d'utilisation et améliorer l'expérience utilisateur", "Pour protéger contre la fraude et l'accès non autorisé"],
  s3Title: "3. Stockage et Sécurité des Données",
  s3Content: "Vos données sont stockées de manière sécurisée avec un chiffrement standard. Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles.",
  s4Title: "4. Partage de Données",
  s4Content: "Nous ne vendons pas vos informations personnelles à des tiers. Nous pouvons partager des données avec des prestataires de confiance qui aident à exploiter notre plateforme, soumis à des accords de confidentialité stricts.",
  s5Title: "5. Vos Droits",
  s5Content: "Vous avez le droit d'accéder, de corriger ou de supprimer vos données personnelles à tout moment. Vous pouvez exporter vos données de CV ou demander la suppression de votre compte.",
  s6Title: "6. Cookies",
  s6Content: "Nous utilisons des cookies essentiels pour l'authentification et la gestion des sessions. Vous pouvez contrôler les préférences de cookies via les paramètres de votre navigateur.",
  s7Title: "7. Contactez-nous",
  s7Content: "Si vous avez des questions sur cette Politique de Confidentialité, contactez-nous à",
  backToHome: "Retour à l'Accueil",
};

const hi: PrivacyTranslations = {
  title: "गोपनीयता नीति",
  lastUpdated: "अंतिम अपडेट:",
  s1Title: "1. हम कौन सी जानकारी एकत्र करते हैं",
  s1Content: "ATS Pro Resume Builder का उपयोग करते समय, हम आपके द्वारा सीधे प्रदान की गई जानकारी एकत्र करते हैं, जिसमें आपका नाम, ईमेल पता और रिज्यूमे सामग्री शामिल है। हम सेवाओं को बेहतर बनाने के लिए उपयोग डेटा भी स्वचालित रूप से एकत्र करते हैं।",
  s2Title: "2. हम आपकी जानकारी का उपयोग कैसे करते हैं",
  s2Items: ["रिज्यूमे निर्माण और जॉब ट्रैकिंग सेवाएं प्रदान करने के लिए", "AI ऑप्टिमाइज़ेशन टूल्स के माध्यम से रिज्यूमे डेटा प्रोसेस करने के लिए", "खाता संबंधित सूचनाएं भेजने के लिए", "उपयोग पैटर्न का विश्लेषण करने के लिए", "धोखाधड़ी से बचाव के लिए"],
  s3Title: "3. डेटा स्टोरेज और सुरक्षा",
  s3Content: "आपका डेटा उद्योग-मानक एन्क्रिप्शन का उपयोग करके सुरक्षित रूप से संग्रहीत किया जाता है। हम आपके व्यक्तिगत डेटा की सुरक्षा के लिए उचित तकनीकी उपाय लागू करते हैं।",
  s4Title: "4. डेटा साझाकरण",
  s4Content: "हम आपकी व्यक्तिगत जानकारी तीसरे पक्ष को नहीं बेचते हैं। हम सख्त गोपनीयता समझौतों के तहत विश्वसनीय सेवा प्रदाताओं के साथ डेटा साझा कर सकते हैं।",
  s5Title: "5. आपके अधिकार",
  s5Content: "आपको किसी भी समय अपने व्यक्तिगत डेटा तक पहुंचने, सुधारने या हटाने का अधिकार है। आप अपना रिज्यूमे डेटा निर्यात कर सकते हैं या खाता हटाने का अनुरोध कर सकते हैं।",
  s6Title: "6. कुकीज़",
  s6Content: "हम प्रमाणीकरण और सत्र प्रबंधन के लिए आवश्यक कुकीज़ का उपयोग करते हैं। आप ब्राउज़र सेटिंग्स के माध्यम से कुकी प्राथमिकताओं को नियंत्रित कर सकते हैं।",
  s7Title: "7. हमसे संपर्क करें",
  s7Content: "इस गोपनीयता नीति के बारे में प्रश्न हों तो हमसे संपर्क करें",
  backToHome: "होम पर वापस जाएं",
};

const pt: PrivacyTranslations = {
  title: "Política de Privacidade",
  lastUpdated: "Última atualização:",
  s1Title: "1. Informações que Coletamos",
  s1Content: "Ao usar o ATS Pro Resume Builder, coletamos informações fornecidas diretamente, incluindo nome, e-mail e conteúdo do currículo. Também coletamos automaticamente dados de uso para melhorar nossos serviços.",
  s2Title: "2. Como Usamos Suas Informações",
  s2Items: ["Para fornecer, manter e melhorar nossos serviços de criação de CV e rastreamento de vagas", "Para processar seus dados de CV através de ferramentas de otimização com IA", "Para enviar notificações e atualizações da conta", "Para analisar padrões de uso e melhorar a experiência", "Para proteção contra fraudes e acesso não autorizado"],
  s3Title: "3. Armazenamento e Segurança de Dados",
  s3Content: "Seus dados são armazenados com segurança usando criptografia padrão da indústria. Implementamos medidas técnicas e organizacionais para proteger seus dados pessoais.",
  s4Title: "4. Compartilhamento de Dados",
  s4Content: "Não vendemos suas informações pessoais a terceiros. Podemos compartilhar dados com provedores de serviços confiáveis que ajudam a operar nossa plataforma, sujeitos a acordos de confidencialidade.",
  s5Title: "5. Seus Direitos",
  s5Content: "Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento. Pode exportar dados do CV ou solicitar a exclusão da conta.",
  s6Title: "6. Cookies",
  s6Content: "Usamos cookies essenciais para autenticação e gerenciamento de sessão. Você pode controlar as preferências de cookies nas configurações do navegador.",
  s7Title: "7. Contato",
  s7Content: "Se tiver perguntas sobre esta Política de Privacidade, entre em contato em",
  backToHome: "Voltar ao Início",
};

export const privacyTranslations: Record<Locale, PrivacyTranslations> = { en, ar, es, fr, hi, pt };
