import { cn } from '@/lib/utils';

export function Logo({
  className,
  size = 'md',
  variant = 'default',
  showText = true,
}) {
  const sizeClasses = {
    xs: 'h-6 w-6', // Very small mobile
    sm: 'h-8 w-8', // Mobile
    md: 'h-12 w-12', // Tablet
    lg: 'h-16 w-16', // Desktop
    xl: 'h-20 w-20', // Large mobile hero
    '2xl': 'h-24 w-24', // Desktop hero
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 sm:gap-3 cursor-pointer group',
        className
      )}
    >
      {/* Logo Image với hiệu ứng hover */}
      <img
        src="/logo.png"
        alt="ChargeEVDN Logo"
        className={cn(
          sizeClasses[size],
          'object-contain transition-transform duration-200 group-hover:scale-105'
        )}
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
