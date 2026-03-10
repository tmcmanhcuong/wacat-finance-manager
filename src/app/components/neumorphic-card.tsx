import { ReactNode } from 'react';

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
  onClick 
}: NeumorphicCardProps) {
  const variants = {
    extruded: 'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,0.6)]',
    inset: 'shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)]',
    flat: 'shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)]',
  };

  return (
    <div
      className={`bg-[#E0E5EC] rounded-[32px] ${variants[variant]} ${className} ${onClick ? 'cursor-pointer transition-all hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.5)]' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

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
  disabled = false
}: NeumorphicButtonProps) {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variants = {
    primary: 'bg-[#6C63FF] text-white shadow-[4px_4px_12px_rgba(108,99,255,0.3),-2px_-2px_8px_rgba(255,255,255,0.5)]',
    secondary: 'bg-[#E0E5EC] text-[#3D4852] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.6)]',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl ${variants[variant]} ${sizes[size]} ${className} transition-all ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-[0.98] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.4)]'
      } min-h-[44px]`}
    >
      {children}
    </button>
  );
}

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
  className = ''
}: NeumorphicInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full bg-[#E0E5EC] text-[#3D4852] placeholder:text-[#8B92A0] rounded-2xl px-6 py-3 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 min-h-[44px] ${className}`}
    />
  );
}

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
  className = ''
}: NeumorphicSelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full bg-[#E0E5EC] text-[#3D4852] rounded-2xl px-6 py-3 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 min-h-[44px] ${className}`}
    >
      {children}
    </select>
  );
}
