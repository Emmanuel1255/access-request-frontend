import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-africell-primary to-africell-dark text-white hover:from-africell-dark hover:to-africell-primary focus:ring-africell-primary shadow-africell',
    secondary: 'bg-gradient-to-r from-africell-secondary to-orange-600 text-white hover:from-orange-600 hover:to-africell-secondary focus:ring-africell-secondary',
    outline: 'border-2 border-africell-primary text-africell-primary hover:bg-africell-primary hover:text-white focus:ring-africell-primary',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm gap-2',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-3',
    xl: 'px-8 py-4 text-lg gap-3'
  };

  const classes = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    {
      'opacity-50 cursor-not-allowed': disabled || loading,
      'hover:scale-105 active:scale-95': !disabled && !loading
    },
    className
  );

  const content = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />
      )}
      {children}
      {Icon && iconPosition === 'right' && !loading && <Icon className="w-4 h-4" />}
    </>
  );

  return (
    <motion.button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...props}
    >
      {content}
    </motion.button>
  );
};

export default Button;