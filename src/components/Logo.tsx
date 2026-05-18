interface LogoProps {
  className?: string;
  variant?: "auto" | "light" | "dark";
}

export default function Logo({ className = "h-12", variant = "auto" }: LogoProps) {
  return (
    <div className={`relative flex items-center select-none ${className}`}>
      {/* Dark variant for light backgrounds (logo-main.png with white background knocked out via multiply) */}
      <img
        src="/images/logo-main.png"
        alt="ATS Pro"
        className={`h-full w-auto object-contain ${
          variant === 'light' 
            ? 'hidden' 
            : variant === 'auto' 
              ? 'dark:hidden' 
              : ''
        }`}
        style={{
          mixBlendMode: 'multiply',
        }}
      />

      {/* Light variant for dark backgrounds (logo-white.png with black background knocked out via screen) */}
      <img
        src="/images/logo-white.png"
        alt="ATS Pro"
        className={`h-full w-auto object-contain ${
          variant === 'dark' 
            ? 'hidden' 
            : variant === 'auto' 
              ? 'hidden dark:block' 
              : variant === 'light' 
                ? 'block' 
                : 'hidden'
        }`}
        style={{
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
}

