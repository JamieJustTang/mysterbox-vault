import React from 'react';

type Variant = 'primary' | 'ghost' | 'danger' | 'outline' | 'emerald';
type Size = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: string; // material-symbols name
  iconRight?: string;
}

const variantCls: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-hover text-white shadow-md shadow-red-500/20 hover:shadow-red-500/30',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  danger: 'text-red-500 hover:bg-red-50 hover:text-red-600',
  outline: 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700',
  emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20',
};

const sizeCls: Record<Size, string> = {
  xs: 'px-2 py-1 text-[11px] rounded-lg',
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-4 py-2 text-xs rounded-xl',
  lg: 'px-5 py-3 text-sm rounded-xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-1.5 font-semibold
        transition-all active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantCls[variant]} ${sizeCls[size]} ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {loading && (
        <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
      )}
      {!loading && icon && (
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
      )}
      {children}
      {!loading && iconRight && (
        <span className="material-symbols-outlined text-[16px]">{iconRight}</span>
      )}
    </button>
  );
};
