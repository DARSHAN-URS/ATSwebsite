import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { miscTranslations } from "@/i18n/miscTranslations";

const NotFound = () => {
  const location = useLocation();
  const { locale } = useLanguage();
  const mt = miscTranslations[locale].notFound;

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <SEOHead
        title="Page Not Found — ATS Pro Resume Builder"
        description="The page you're looking for doesn't exist."
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{mt.title}</h1>
        <p className="mb-4 text-xl text-muted-foreground">{mt.subtitle}</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          {mt.returnHome}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
