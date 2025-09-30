import React from 'react';

const Progress = ({ 
  value = 0, 
  max = 100, 
  className = '',
  ...props 
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div 
      className={`w-full bg-white/10 rounded-full overflow-hidden ${className}`}
      {...props}
    >
      <div 
        className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00ff88] transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default Progress;
