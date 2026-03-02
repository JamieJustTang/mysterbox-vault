import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixIcon?: string;   // material-symbols name
  suffixSlot?: React.ReactNode;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  prefixIcon,
  suffixSlot,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      <div className="relative">
        {prefixIcon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[17px] pointer-events-none">
            {prefixIcon}
          </span>
        )}
        <input
          {...props}
          className={`
            w-full bg-gray-50 border rounded-xl py-2.5 text-sm text-gray-900
            placeholder-gray-400 focus:outline-none focus:ring-2 transition-all
            ${prefixIcon ? 'pl-9' : 'pl-3'}
            ${suffixSlot ? 'pr-10' : 'pr-3'}
            ${error
              ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
              : 'border-gray-200 focus:ring-primary/20 focus:border-primary'}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
        />
        {suffixSlot && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {suffixSlot}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-[11px] text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ error, className = '', ...props }) => (
  <div className="w-full">
    <textarea
      {...props}
      className={`
        w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-sm text-gray-900
        placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-y
        ${error
          ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
          : 'border-gray-200 focus:ring-primary/20 focus:border-primary'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    />
    {error && (
      <p className="mt-1 text-[11px] text-red-500 font-medium">{error}</p>
    )}
  </div>
);
