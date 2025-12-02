import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="CoverME Logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
