interface LogoProps {
  className?: string;
  variant?: "auto" | "light" | "dark";
}

export default function Logo({ className = "h-12", variant = "auto" }: LogoProps) {
  return (
    <div className={`relative flex items-center select-none ${className}`}>
      {/* Dark variant for light backgrounds (removes white bg via multiply) */}
      <div className={`h-full ${variant === 'light' ? 'hidden' : variant === 'auto' ? 'dark:hidden' : ''}`}>
        <img 
          src="/images/logo-main.png" 
          alt="ATS Pro" 
          className="h-full w-auto object-contain mix-blend-multiply"
        />
      </div>

      {/* Light variant for dark backgrounds (removes black bg via screen) */}
      <div className={`h-full ${variant === 'dark' ? 'hidden' : variant === 'auto' ? 'hidden dark:block' : variant === 'light' ? 'block' : 'hidden'}`}>
        <img 
          src="/images/logo-white.png" 
          alt="ATS Pro" 
          className="h-full w-auto object-contain mix-blend-screen"
        />
      </div>
    </div>
  );
}
