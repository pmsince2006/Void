import React from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'pill' | 'pill-invert' | 'editorial';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  href?: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'solid',
  size = 'md',
  to,
  href,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-heading font-medium tracking-wider uppercase transition-all duration-200 select-none disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-xs tracking-widest px-5 py-2.5 gap-2',
    lg: 'text-sm tracking-widest px-7 py-3.5 gap-2.5'
  }[size];

  const variantStyles = {
    solid: 'bg-[#111111] text-[#F4F2ED] hover:bg-[#282828] active:bg-[#000000] border border-[#111111]',
    outline: 'border border-[#111111] text-[#111111] bg-transparent hover:bg-[#111111] hover:text-[#F4F2ED]',
    ghost: 'text-[#111111] hover:bg-black/5 active:bg-black/10',
    pill: 'rounded-full border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#F4F2ED] py-2 px-6 text-xs tracking-widest font-mono',
    'pill-invert': 'rounded-full border border-[#F4F2ED] text-[#F4F2ED] hover:bg-[#F4F2ED] hover:text-[#111111] py-2 px-6 text-xs tracking-widest font-mono',
    editorial: 'bg-transparent text-[#111111] border-b border-[#111111] hover:border-[#777777] hover:text-[#777777] px-0 py-1'
  }[variant];

  const content = (
    <>
      {isLoading ? (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </>
  );

  const combinedClasses = `${baseStyles} ${sizeStyles} ${variantStyles} ${className}`.trim();

  if (to && !disabled) {
    return (
      <Link to={to} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} className={combinedClasses} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <button className={combinedClasses} disabled={disabled || isLoading} {...props}>
      {content}
    </button>
  );
};
