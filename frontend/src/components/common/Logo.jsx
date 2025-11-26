import { cn } from '@/lib/utils';

export function Logo({
  className,
  size = 'md',
  variant = 'default',
  showText = true,
}) {
  // Fixed size: w-80 = 20rem, h-32 = 8rem
  return (
    <div
      className={cn(
        'flex items-center justify-center cursor-pointer group',
        className
      )}
    >
      {/* Logo Image với kích thước cố định 20rem x 8rem */}
      <img
        src="/logo.png"
        alt="ChargeEVDN Logo"
        className="w-80 h-32 object-contain transition-transform duration-200 group-hover:scale-105"
      />
    </div>
  );
}

export function LogoIcon({ className, size = 'md' }) {
  return (
    <Logo
      className={className}
      size={size}
      variant="icon-only"
      showText={false}
    />
  );
}
