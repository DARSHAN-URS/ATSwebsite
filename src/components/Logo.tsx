interface LogoProps {
  className?: string;
  variant?: "auto" | "light" | "dark";
}

export default function Logo({ className = "h-12", variant = "auto" }: LogoProps) {
  return (
    <div className={`relative flex items-center select-none ${className}`}>
      {/* Dark variant for light backgrounds (logo-main.png) */}
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
      />

      {/* Light variant for dark backgrounds (logo-white.png) */}
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
      />
    </div>
  );
}


