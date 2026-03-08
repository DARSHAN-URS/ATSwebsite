interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}

export default function Logo({ className = "h-12" }: LogoProps) {
  // Logo placeholder — waiting for new logo asset
  return null;
}
