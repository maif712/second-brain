// src/components/ui/Button.tsx  (v2)
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { useMagnetic } from '@/hooks/useMagnetic';

interface ButtonProps {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'md' | 'lg';
  magnetic?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  children, to, href, onClick, type = 'button',
  variant = 'primary', size = 'md', magnetic, disabled, className,
}: ButtonProps) {
  const magRef = useMagnetic<HTMLAnchorElement>(magnetic ? 0.35 : 0);

  const classes = cn(
    'group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300',
    size === 'lg' ? 'px-8 py-4 text-base' : 'px-5 py-2.5 text-sm',
    variant === 'primary' &&
      'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_40px_-10px] shadow-violet-500/60 hover:shadow-violet-400/80 hover:brightness-110',
    variant === 'ghost' &&
      'border border-white/10 bg-white/5 text-slate-200 backdrop-blur hover:border-white/25 hover:bg-white/10',
    variant === 'danger' &&
      'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30 hover:bg-rose-500/25',
    disabled && 'pointer-events-none opacity-50',
    className,
  );

  if (to) return <Link to={to} ref={magRef} className={classes}>{children}</Link>;
  if (href) return <a href={href} ref={magRef} className={classes}>{children}</a>;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}