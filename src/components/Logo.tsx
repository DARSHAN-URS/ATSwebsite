interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}

export default function Logo({ className = "h-10 w-auto", width = 160, height = 48, loading, fetchPriority }: LogoProps) {
  return (
    <img
      alt="ATS Pro Resume Builder"
      className={`${className} object-contain dark:brightness-0 dark:invert`}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      src="/images/logo-main.png"
    />
  );
}
