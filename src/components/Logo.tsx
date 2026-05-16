interface LogoProps {
  className?: string;
  variant?: "auto" | "light" | "dark";
}

export default function Logo({ className = "h-12", variant = "auto" }: LogoProps) {
  return (
    <div className={`relative flex items-center select-none ${className}`}>
      {/* Dark variant for light backgrounds (Knocks out white background) */}
      <div 
        className={`h-full w-48 ${variant === 'light' ? 'hidden' : variant === 'auto' ? 'dark:hidden' : ''}`}
        style={{
          backgroundColor: 'currentColor',
          WebkitMaskImage: 'url(/images/logo-main.png)',
          maskImage: 'url(/images/logo-main.png)',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'left center',
          maskPosition: 'left center',
        }}
      />

      {/* Light variant for dark backgrounds (Knocks out black background) */}
      <div 
        className={`h-full w-48 ${variant === 'dark' ? 'hidden' : variant === 'auto' ? 'hidden dark:block' : variant === 'light' ? 'block' : 'hidden'}`}
        style={{
          backgroundColor: 'white',
          WebkitMaskImage: 'url(/images/logo-white.png)',
          maskImage: 'url(/images/logo-white.png)',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'left center',
          maskPosition: 'left center',
        }}
      />
    </div>
  );
}
