import React from 'react';

interface FieldLabelProps {
    children: React.ReactNode;
    required?: boolean;
    className?: string;
}

export const FieldLabel: React.FC<FieldLabelProps> = ({ children, required, className = '' }) => (
    <label className={`block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-0.5 ${className}`}>
        {children}
        {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
);
