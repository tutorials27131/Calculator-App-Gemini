
import React from 'react';

interface CalculatorButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  variant?: 'number' | 'operator' | 'action' | 'special';
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ 
  label, 
  onClick, 
  className = '', 
  variant = 'number' 
}) => {
  const baseStyles = "calc-button flex items-center justify-center text-xl font-medium rounded-2xl h-16 w-full shadow-sm";
  
  const variantStyles = {
    number: "bg-slate-700 hover:bg-slate-600 text-white",
    operator: "bg-blue-600 hover:bg-blue-500 text-white",
    action: "bg-slate-800 hover:bg-slate-700 text-blue-400",
    special: "bg-amber-500 hover:bg-amber-400 text-white"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {label}
    </button>
  );
};

export default CalculatorButton;
