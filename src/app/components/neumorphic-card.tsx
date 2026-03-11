import { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────
// NeumorphicCard
// ─────────────────────────────────────────────
interface NeumorphicCardProps {
  children: ReactNode;
  variant?: 'extruded' | 'inset' | 'flat';
  className?: string;
  onClick?: () => void;
}

export function NeumorphicCard({
  children,
  variant = 'extruded',
  className = '',
  onClick,
}: NeumorphicCardProps) {
  const variants = {
    extruded: [
      'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,0.6)]',
      'dark:shadow-[8px_8px_16px_rgba(14,18,28,0.9),-8px_-8px_16px_rgba(42,49,68,0.7)]',
    ].join(' '),
    inset: [
      'shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)]',
      'dark:shadow-[inset_6px_6px_12px_rgba(14,18,28,0.9),inset_-6px_-6px_12px_rgba(42,49,68,0.6)]',
    ].join(' '),
    flat: [
      'shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)]',
      'dark:shadow-[4px_4px_8px_rgba(14,18,28,0.7),-4px_-4px_8px_rgba(42,49,68,0.5)]',
    ].join(' '),
  };

  const hoverShadow = onClick
    ? [
        'hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.5)]',
        'dark:hover:shadow-[6px_6px_12px_rgba(14,18,28,0.8),-6px_-6px_12px_rgba(42,49,68,0.6)]',
      ].join(' ')
    : '';

  return (
    <div
      className={cn(
        'bg-[#E0E5EC] dark:bg-[#1E2330] rounded-[32px]',
        variants[variant],
        onClick && `cursor-pointer transition-all ${hoverShadow}`,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// NeumorphicButton
// ─────────────────────────────────────────────
interface NeumorphicButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function NeumorphicButton({
  children,
  onClick,
  className = '',
  variant = 'secondary',
  size = 'md',
  disabled = false,
}: NeumorphicButtonProps) {
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg' };

  const variants = {
    primary:
      'bg-[#6C63FF] text-white shadow-[4px_4px_12px_rgba(108,99,255,0.3),-2px_-2px_8px_rgba(255,255,255,0.5)] dark:shadow-[4px_4px_12px_rgba(108,99,255,0.4)]',
    secondary: [
      'bg-[#E0E5EC] text-[#3D4852]',
      'shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.6)]',
      'dark:bg-[#252C3E] dark:text-[#E2E8F0]',
      'dark:shadow-[6px_6px_12px_rgba(14,18,28,0.9),-6px_-6px_12px_rgba(42,49,68,0.7)]',
    ].join(' '),
  };

  const activeClass = disabled
    ? 'opacity-50 cursor-not-allowed'
    : [
        'hover:scale-[0.98]',
        'active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.4)]',
        'dark:active:shadow-[inset_4px_4px_8px_rgba(14,18,28,0.9),inset_-4px_-4px_8px_rgba(42,49,68,0.6)]',
      ].join(' ');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-2xl transition-all min-h-[44px]',
        variants[variant],
        sizes[size],
        activeClass,
        className
      )}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// NeumorphicInput
// ─────────────────────────────────────────────
interface NeumorphicInputProps {
  placeholder?: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function NeumorphicInput({
  placeholder,
  type = 'text',
  value,
  onChange,
  className = '',
}: NeumorphicInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(
        'w-full rounded-2xl px-6 py-3 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30',
        'bg-[#E0E5EC] text-[#3D4852] placeholder:text-[#8B92A0]',
        'shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)]',
        'dark:bg-[#252C3E] dark:text-[#E2E8F0] dark:placeholder:text-[#8892A0]',
        'dark:shadow-[inset_4px_4px_8px_rgba(14,18,28,0.9),inset_-4px_-4px_8px_rgba(42,49,68,0.6)]',
        className
      )}
    />
  );
}

// ─────────────────────────────────────────────
// NeumorphicSelect
// ─────────────────────────────────────────────
interface NeumorphicSelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  className?: string;
}

export function NeumorphicSelect({
  value,
  onChange,
  children,
  className = '',
}: NeumorphicSelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className={cn(
          'w-full appearance-none rounded-2xl pl-4 pr-10 py-3 min-h-[44px] cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30',
          'bg-[#E0E5EC] text-[#3D4852]',
          'shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)]',
          'dark:bg-[#252C3E] dark:text-[#E2E8F0]',
          'dark:shadow-[inset_4px_4px_8px_rgba(14,18,28,0.9),inset_-4px_-4px_8px_rgba(42,49,68,0.6)]',
          className
        )}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <ChevronDown size={16} className="text-[#8B92A0] dark:text-[#8892A0]" />
      </div>
    </div>
  );
}
