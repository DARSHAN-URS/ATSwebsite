import { Locale } from "./types";

export interface TermsTranslations {
  title: string;
  lastUpdated: string;
  s1Title: string; s1Content: string;
  s2Title: string; s2Content: string;
  s3Title: string; s3Items: string[];
  s4Title: string; s4Content: string;
  s5Title: string; s5Content: string;
  s6Title: string; s6Content: string;
  s7Title: string; s7Content: string;
  s8Title: string; s8Content: string;
  s9Title: string; s9Content: string;
  backToHome: string;
}

const en: TermsTranslations = {
  title: "Terms of Service",
  lastUpdated: "Last updated:",
  s1Title: "1. Acceptance of Terms", s1Content: "By accessing and using ATS Pro Resume Builder, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to update these terms at any time, and continued use constitutes acceptance of any modifications.",
  s2Title: "2. Description of Service", s2Content: "ATS Pro Resume Builder provides AI-powered resume building, resume grading, job application tracking, cover letter generation, and job search tools. Our platform uses artificial intelligence to help optimize your career documents for Applicant Tracking Systems (ATS) and improve your job search outcomes.",
  s3Title: "3. User Accounts", s3Items: ["You must provide accurate and complete information when creating an account", "You are responsible for maintaining the security of your account credentials", "You must be at least 16 years old to use our services", "One person may not maintain more than one account", "You are responsible for all activity that occurs under your account"],
  s4Title: "4. User Content", s4Content: "You retain ownership of all content you upload to ATS Pro Resume Builder, including resume data, cover letters, and personal information. By using our AI features, you grant us a limited license to process your content for the purpose of providing our services. We do not claim ownership of your content.",
  s5Title: "5. Acceptable Use", s5Content: "You agree not to use ATS Pro Resume Builder to create fraudulent or misleading resumes, impersonate others, upload malicious content, attempt to gain unauthorized access to our systems, or use our services for any unlawful purpose. We reserve the right to suspend or terminate accounts that violate these terms.",
  s6Title: "6. AI-Generated Content", s6Content: "Our AI tools provide suggestions and optimizations based on industry best practices. While we strive for accuracy, AI-generated content should be reviewed by you before use. ATS Pro Resume Builder is not responsible for hiring outcomes or decisions made based on AI-generated suggestions.",
  s7Title: "7. Limitation of Liability", s7Content: "ATS Pro Resume Builder is provided \"as is\" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount you paid for our services in the preceding 12 months.",
  s8Title: "8. Termination", s8Content: "You may terminate your account at any time through your account settings. We may suspend or terminate your access if you violate these terms. Upon termination, your data will be deleted within 30 days unless retention is required by law.",
  s9Title: "9. Contact", s9Content: "For questions about these Terms of Service, contact us at",
  backToHome: "Back to Home",
};

const ar: TermsTranslations = {
  title: "شروط الخدمة",
  lastUpdated: "آخر تحديث:",
  s1Title: "1. قبول الشروط", s1Content: "باستخدامك لـ ATS Pro Resume Builder، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا لم توافق، يرجى عدم استخدام منصتنا. نحتفظ بحق تحديث هذه الشروط في أي وقت.",
  s2Title: "2. وصف الخدمة", s2Content: "يوفر ATS Pro Resume Builder بناء السير الذاتية بالذكاء الاصطناعي وتقييمها وتتبع الطلبات وإنشاء خطابات التقديم وأدوات البحث عن وظائف.",
  s3Title: "3. حسابات المستخدمين", s3Items: ["يجب تقديم معلومات دقيقة وكاملة عند إنشاء الحساب", "أنت مسؤول عن الحفاظ على أمان بيانات حسابك", "يجب أن يكون عمرك 16 عامًا على الأقل", "لا يجوز لشخص واحد امتلاك أكثر من حساب", "أنت مسؤول عن جميع الأنشطة تحت حسابك"],
  s4Title: "4. محتوى المستخدم", s4Content: "تحتفظ بملكية جميع المحتويات التي ترفعها. باستخدام ميزات الذكاء الاصطناعي، تمنحنا ترخيصًا محدودًا لمعالجة محتواك لتقديم خدماتنا.",
  s5Title: "5. الاستخدام المقبول", s5Content: "توافق على عدم استخدام المنصة لإنشاء سير ذاتية احتيالية أو انتحال هوية الآخرين أو رفع محتوى ضار.",
  s6Title: "6. المحتوى المُنشأ بالذكاء الاصطناعي", s6Content: "أدوات الذكاء الاصطناعي تقدم اقتراحات. يجب مراجعة المحتوى المُنشأ بالذكاء الاصطناعي قبل استخدامه. نحن غير مسؤولين عن نتائج التوظيف.",
  s7Title: "7. تحديد المسؤولية", s7Content: "يتم تقديم ATS Pro Resume Builder \"كما هو\" بدون ضمانات. لا نتحمل مسؤولية أي أضرار غير مباشرة.",
  s8Title: "8. الإنهاء", s8Content: "يمكنك إنهاء حسابك في أي وقت. سيتم حذف بياناتك خلال 30 يومًا.",
  s9Title: "9. اتصل بنا", s9Content: "للأسئلة حول شروط الخدمة، اتصل بنا على",
  backToHome: "العودة للرئيسية",
};

const es: TermsTranslations = {
  title: "Términos de Servicio",
  lastUpdated: "Última actualización:",
  s1Title: "1. Aceptación de Términos", s1Content: "Al acceder y usar ATS Pro Resume Builder, aceptas estos Términos de Servicio. Si no estás de acuerdo, no uses nuestra plataforma. Nos reservamos el derecho de actualizar estos términos.",
  s2Title: "2. Descripción del Servicio", s2Content: "ATS Pro Resume Builder proporciona creación de CV con IA, calificación, seguimiento de solicitudes, generación de cartas de presentación y herramientas de búsqueda de empleo.",
  s3Title: "3. Cuentas de Usuario", s3Items: ["Debes proporcionar información precisa y completa al crear una cuenta", "Eres responsable de mantener la seguridad de tus credenciales", "Debes tener al menos 16 años", "Una persona no puede tener más de una cuenta", "Eres responsable de toda la actividad bajo tu cuenta"],
  s4Title: "4. Contenido del Usuario", s4Content: "Mantienes la propiedad de todo el contenido que subes. Al usar nuestras funciones de IA, nos otorgas una licencia limitada para procesar tu contenido.",
  s5Title: "5. Uso Aceptable", s5Content: "Aceptas no usar la plataforma para crear CVs fraudulentos, suplantar identidades, subir contenido malicioso o usar nuestros servicios para fines ilegales.",
  s6Title: "6. Contenido Generado por IA", s6Content: "Las herramientas de IA proporcionan sugerencias. El contenido generado por IA debe ser revisado antes de usarse. No somos responsables de los resultados de contratación.",
  s7Title: "7. Limitación de Responsabilidad", s7Content: "ATS Pro Resume Builder se proporciona \"tal cual\" sin garantías. No somos responsables de daños indirectos.",
  s8Title: "8. Terminación", s8Content: "Puedes terminar tu cuenta en cualquier momento. Tus datos se eliminarán en 30 días.",
  s9Title: "9. Contacto", s9Content: "Para preguntas sobre estos Términos de Servicio, contáctanos en",
  backToHome: "Volver al Inicio",
};

const fr: TermsTranslations = {
  title: "Conditions d'Utilisation",
  lastUpdated: "Dernière mise à jour :",
  s1Title: "1. Acceptation des Conditions", s1Content: "En accédant à ATS Pro Resume Builder, vous acceptez ces Conditions d'Utilisation. Si vous n'êtes pas d'accord, n'utilisez pas notre plateforme.",
  s2Title: "2. Description du Service", s2Content: "ATS Pro Resume Builder fournit la création de CV avec IA, l'évaluation, le suivi des candidatures, la génération de lettres de motivation et des outils de recherche d'emploi.",
  s3Title: "3. Comptes Utilisateurs", s3Items: ["Vous devez fournir des informations exactes et complètes", "Vous êtes responsable de la sécurité de vos identifiants", "Vous devez avoir au moins 16 ans", "Une personne ne peut avoir qu'un seul compte", "Vous êtes responsable de toute activité sous votre compte"],
  s4Title: "4. Contenu Utilisateur", s4Content: "Vous conservez la propriété de tout contenu téléchargé. En utilisant nos fonctionnalités IA, vous nous accordez une licence limitée pour traiter votre contenu.",
  s5Title: "5. Utilisation Acceptable", s5Content: "Vous acceptez de ne pas utiliser la plateforme pour créer des CV frauduleux, usurper l'identité d'autrui ou télécharger du contenu malveillant.",
  s6Title: "6. Contenu Généré par l'IA", s6Content: "Les outils IA fournissent des suggestions. Le contenu généré par l'IA doit être vérifié avant utilisation. Nous ne sommes pas responsables des résultats d'embauche.",
  s7Title: "7. Limitation de Responsabilité", s7Content: "ATS Pro Resume Builder est fourni « en l'état » sans garanties. Nous ne sommes pas responsables des dommages indirects.",
  s8Title: "8. Résiliation", s8Content: "Vous pouvez résilier votre compte à tout moment. Vos données seront supprimées sous 30 jours.",
  s9Title: "9. Contact", s9Content: "Pour toute question sur ces Conditions d'Utilisation, contactez-nous à",
  backToHome: "Retour à l'Accueil",
};

const hi: TermsTranslations = {
  title: "सेवा की शर्तें",
  lastUpdated: "अंतिम अपडेट:",
  s1Title: "1. शर्तों की स्वीकृति", s1Content: "ATS Pro Resume Builder का उपयोग करके, आप इन सेवा की शर्तों से बंधे होने के लिए सहमत हैं। यदि आप सहमत नहीं हैं, तो कृपया हमारे प्लेटफॉर्म का उपयोग न करें।",
  s2Title: "2. सेवा का विवरण", s2Content: "ATS Pro Resume Builder AI-संचालित रिज्यूमे निर्माण, ग्रेडिंग, आवेदन ट्रैकिंग, कवर लेटर जनरेशन और जॉब सर्च टूल्स प्रदान करता है।",
  s3Title: "3. उपयोगकर्ता खाते", s3Items: ["खाता बनाते समय सटीक और पूर्ण जानकारी प्रदान करें", "आप अपने खाते की सुरक्षा के लिए जिम्मेदार हैं", "आपकी उम्र कम से कम 16 वर्ष होनी चाहिए", "एक व्यक्ति एक से अधिक खाता नहीं रख सकता", "आप अपने खाते की सभी गतिविधि के लिए जिम्मेदार हैं"],
  s4Title: "4. उपयोगकर्ता सामग्री", s4Content: "आप अपलोड की गई सभी सामग्री के स्वामी बने रहते हैं। AI सुविधाओं का उपयोग करके, आप हमें सेवाएं प्रदान करने के लिए सीमित लाइसेंस देते हैं।",
  s5Title: "5. स्वीकार्य उपयोग", s5Content: "आप सहमत हैं कि धोखाधड़ी वाले रिज्यूमे बनाने, दूसरों का प्रतिरूपण करने या हानिकारक सामग्री अपलोड करने के लिए प्लेटफॉर्म का उपयोग नहीं करेंगे।",
  s6Title: "6. AI-जनित सामग्री", s6Content: "AI उपकरण सुझाव प्रदान करते हैं। AI-जनित सामग्री की उपयोग से पहले समीक्षा करें। हम भर्ती परिणामों के लिए जिम्मेदार नहीं हैं।",
  s7Title: "7. दायित्व की सीमा", s7Content: "ATS Pro Resume Builder \"जैसा है\" प्रदान किया जाता है। हम अप्रत्यक्ष क्षति के लिए उत्तरदायी नहीं हैं।",
  s8Title: "8. समाप्ति", s8Content: "आप किसी भी समय अपना खाता समाप्त कर सकते हैं। आपका डेटा 30 दिनों में हटा दिया जाएगा।",
  s9Title: "9. संपर्क", s9Content: "सेवा की शर्तों के बारे में प्रश्नों के लिए, हमसे संपर्क करें",
  backToHome: "होम पर वापस जाएं",
};

const pt: TermsTranslations = {
  title: "Termos de Serviço",
  lastUpdated: "Última atualização:",
  s1Title: "1. Aceitação dos Termos", s1Content: "Ao acessar e usar o ATS Pro Resume Builder, você concorda com estes Termos de Serviço. Se não concordar, não use nossa plataforma.",
  s2Title: "2. Descrição do Serviço", s2Content: "ATS Pro Resume Builder fornece criação de CV com IA, avaliação, rastreamento de candidaturas, geração de cartas de apresentação e ferramentas de busca de vagas.",
  s3Title: "3. Contas de Usuário", s3Items: ["Você deve fornecer informações precisas e completas", "Você é responsável pela segurança das suas credenciais", "Você deve ter pelo menos 16 anos", "Uma pessoa não pode ter mais de uma conta", "Você é responsável por toda atividade na sua conta"],
  s4Title: "4. Conteúdo do Usuário", s4Content: "Você mantém a propriedade de todo conteúdo enviado. Ao usar recursos de IA, você nos concede uma licença limitada para processar seu conteúdo.",
  s5Title: "5. Uso Aceitável", s5Content: "Você concorda em não usar a plataforma para criar CVs fraudulentos, falsificar identidades ou enviar conteúdo malicioso.",
  s6Title: "6. Conteúdo Gerado por IA", s6Content: "As ferramentas de IA fornecem sugestões. O conteúdo gerado por IA deve ser revisado antes do uso. Não somos responsáveis por resultados de contratação.",
  s7Title: "7. Limitação de Responsabilidade", s7Content: "ATS Pro Resume Builder é fornecido \"como está\" sem garantias. Não somos responsáveis por danos indiretos.",
  s8Title: "8. Rescisão", s8Content: "Você pode encerrar sua conta a qualquer momento. Seus dados serão excluídos em 30 dias.",
  s9Title: "9. Contato", s9Content: "Para perguntas sobre estes Termos de Serviço, entre em contato em",
  backToHome: "Voltar ao Início",
};

const de: TermsTranslations = {
  title: "Nutzungsbedingungen",
  lastUpdated: "Letzte Aktualisierung:",
  s1Title: "1. Annahme der Bedingungen", s1Content: "Durch die Nutzung von ATS Pro Resume Builder stimmen Sie diesen Nutzungsbedingungen zu. Wenn Sie nicht einverstanden sind, nutzen Sie unsere Plattform bitte nicht.",
  s2Title: "2. Beschreibung des Dienstes", s2Content: "ATS Pro Resume Builder bietet KI-gestützte Lebenslauf-Erstellung, Bewertung, Bewerbungsverfolgung, Anschreiben-Generierung und Job-Suche-Tools.",
  s3Title: "3. Benutzerkonten", s3Items: ["Geben Sie genaue und vollständige Informationen bei der Kontoerstellung an", "Sie sind für die Sicherheit Ihrer Zugangsdaten verantwortlich", "Sie müssen mindestens 16 Jahre alt sein", "Eine Person darf nur ein Konto haben", "Sie sind für alle Aktivitäten unter Ihrem Konto verantwortlich"],
  s4Title: "4. Benutzerinhalte", s4Content: "Sie behalten das Eigentum an allen hochgeladenen Inhalten. Durch die Nutzung unserer KI-Funktionen gewähren Sie uns eine eingeschränkte Lizenz zur Verarbeitung Ihrer Inhalte.",
  s5Title: "5. Akzeptable Nutzung", s5Content: "Sie verpflichten sich, die Plattform nicht für betrügerische Lebensläufe, Identitätsdiebstahl oder schädliche Inhalte zu nutzen.",
  s6Title: "6. KI-generierte Inhalte", s6Content: "KI-Tools liefern Vorschläge. KI-generierte Inhalte sollten vor der Verwendung überprüft werden. Wir sind nicht verantwortlich für Einstellungsergebnisse.",
  s7Title: "7. Haftungsbeschränkung", s7Content: "ATS Pro Resume Builder wird \"wie besehen\" ohne Gewährleistung bereitgestellt. Wir haften nicht für indirekte Schäden.",
  s8Title: "8. Kündigung", s8Content: "Sie können Ihr Konto jederzeit kündigen. Ihre Daten werden innerhalb von 30 Tagen gelöscht.",
  s9Title: "9. Kontakt", s9Content: "Bei Fragen zu diesen Nutzungsbedingungen kontaktieren Sie uns unter",
  backToHome: "Zurück zur Startseite",
};

const zh: TermsTranslations = {
  title: "服务条款",
  lastUpdated: "最后更新：",
  s1Title: "1. 条款接受", s1Content: "使用ATS Pro简历生成器即表示您同意这些服务条款。如不同意，请勿使用我们的平台。",
  s2Title: "2. 服务描述", s2Content: "ATS Pro简历生成器提供AI简历创建、评分、求职追踪、求职信生成和职位搜索工具。",
  s3Title: "3. 用户账户", s3Items: ["创建账户时需提供准确完整的信息", "您有责任维护账户安全", "您必须年满16岁", "每人只能拥有一个账户", "您对账户下的所有活动负责"],
  s4Title: "4. 用户内容", s4Content: "您保留上传内容的所有权。使用AI功能即授予我们处理内容的有限许可。",
  s5Title: "5. 可接受的使用", s5Content: "您同意不使用平台创建虚假简历、冒充他人或上传恶意内容。",
  s6Title: "6. AI生成内容", s6Content: "AI工具提供建议。AI生成的内容应在使用前审查。我们不对招聘结果负责。",
  s7Title: "7. 责任限制", s7Content: "ATS Pro简历生成器按\"原样\"提供，不作任何担保。我们不对间接损害负责。",
  s8Title: "8. 终止", s8Content: "您可以随时终止账户。您的数据将在30天内删除。",
  s9Title: "9. 联系我们", s9Content: "如对服务条款有疑问，请联系我们",
  backToHome: "返回首页",
};

const ja: TermsTranslations = {
  title: "利用規約",
  lastUpdated: "最終更新日：",
  s1Title: "1. 規約の承諾", s1Content: "ATS Pro履歴書ビルダーを利用することにより、本利用規約に同意したものとみなされます。同意されない場合は、プラットフォームをご利用にならないでください。",
  s2Title: "2. サービスの説明", s2Content: "ATS Pro履歴書ビルダーは、AI履歴書作成、評価、応募追跡、カバーレター生成、求人検索ツールを提供します。",
  s3Title: "3. ユーザーアカウント", s3Items: ["アカウント作成時に正確で完全な情報を提供してください", "アカウント資格情報のセキュリティはお客様の責任です", "16歳以上である必要があります", "1人につき1アカウントのみ", "アカウントで行われるすべての活動はお客様の責任です"],
  s4Title: "4. ユーザーコンテンツ", s4Content: "アップロードしたすべてのコンテンツの所有権はお客様にあります。AI機能を使用することで、サービス提供のための限定的なライセンスを付与します。",
  s5Title: "5. 許容される利用", s5Content: "詐欺的な履歴書の作成、なりすまし、悪意のあるコンテンツのアップロードに本プラットフォームを使用しないことに同意するものとします。",
  s6Title: "6. AI生成コンテンツ", s6Content: "AIツールは提案を提供します。AI生成コンテンツは使用前にご確認ください。採用結果について責任を負いません。",
  s7Title: "7. 責任の制限", s7Content: "ATS Pro履歴書ビルダーは「現状有姿」で保証なく提供されます。間接的な損害について責任を負いません。",
  s8Title: "8. 解約", s8Content: "いつでもアカウントを解約できます。データは30日以内に削除されます。",
  s9Title: "9. お問い合わせ", s9Content: "本利用規約についてご質問がある場合は、こちらまでご連絡ください",
  backToHome: "ホームに戻る",
};

const ko: TermsTranslations = {
  title: "이용약관",
  lastUpdated: "최종 업데이트:",
  s1Title: "1. 약관 동의", s1Content: "ATS Pro 이력서 빌더를 사용함으로써 본 이용약관에 동의하는 것으로 간주됩니다. 동의하지 않으시면 플랫폼을 사용하지 마세요.",
  s2Title: "2. 서비스 설명", s2Content: "ATS Pro 이력서 빌더는 AI 이력서 작성, 평가, 지원 추적, 자기소개서 생성 및 구직 도구를 제공합니다.",
  s3Title: "3. 사용자 계정", s3Items: ["계정 생성 시 정확하고 완전한 정보를 제공해야 합니다", "계정 보안 유지는 귀하의 책임입니다", "16세 이상이어야 합니다", "1인당 1개의 계정만 허용됩니다", "계정의 모든 활동은 귀하의 책임입니다"],
  s4Title: "4. 사용자 콘텐츠", s4Content: "업로드한 모든 콘텐츠의 소유권은 귀하에게 있습니다. AI 기능을 사용함으로써 서비스 제공을 위한 제한적 라이선스를 부여합니다.",
  s5Title: "5. 허용되는 사용", s5Content: "사기성 이력서 작성, 타인 사칭, 악성 콘텐츠 업로드에 플랫폼을 사용하지 않을 것에 동의합니다.",
  s6Title: "6. AI 생성 콘텐츠", s6Content: "AI 도구는 제안을 제공합니다. AI 생성 콘텐츠는 사용 전 검토해야 합니다. 채용 결과에 대해 책임지지 않습니다.",
  s7Title: "7. 책임 제한", s7Content: "ATS Pro 이력서 빌더는 어떠한 보증 없이 \"있는 그대로\" 제공됩니다. 간접적인 손해에 대해 책임지지 않습니다.",
  s8Title: "8. 해지", s8Content: "언제든지 계정을 해지할 수 있습니다. 데이터는 30일 이내에 삭제됩니다.",
  s9Title: "9. 문의", s9Content: "이용약관에 대한 질문은 다음으로 연락해 주세요",
  backToHome: "홈으로 돌아가기",
};

export const termsTranslations: Record<Locale, TermsTranslations> = { en, ar, es, fr, hi, pt, de, zh, ja, ko };
