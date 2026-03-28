import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1 w-full ${className}`}>
        {label && <label className="text-sm font-medium text-white/80 ml-1">{label}</label>}
        <input
          ref={ref}
          className={`glass-input w-full ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
          {...props}
        />
        {error && <span className="text-xs text-red-400 ml-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
