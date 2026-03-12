interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  /** Use "light" to force white logo (e.g. on always-dark backgrounds like sidebar) */
  variant?: "auto" | "light";
}

export default function Logo({ className = "h-10 w-auto", width = 160, height = 48, loading, fetchPriority, variant = "auto" }: LogoProps) {
  const filterClass = variant === "light"
    ? "brightness-0 invert"
    : "dark:brightness-0 dark:invert";

  // React 18 doesn't recognise fetchPriority on <img>; spread conditionally
  const extraProps: Record<string, string> = {};
  if (fetchPriority) extraProps.fetchpriority = fetchPriority;

  return (
    <picture>
      <source srcSet="/images/logo-main.webp" type="image/webp" />
      <img
        alt="ATS Pro Resume Builder"
        className={`${className} object-contain ${filterClass}`}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        src="/images/logo-main.png"
        {...extraProps}
      />
    </picture>
  );
}
