import React from 'react';

const CircularGauge = ({ 
  value, 
  max, 
  label, 
  color = 'blue', 
  size = 120, 
  emoji = '📊',
  subtitle = '',
  tooltip = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColorByType = (colorType) => {
    const colors = {
      green: '#00ff88',
      blue: '#00d4ff',
      purple: '#a855f7'
    };
    return colors[colorType] || colors.blue;
  };

  const strokeColor = getColorByType(color);

  return (
    <div 
      style={{ position: 'relative', width: size, height: size }}
      title={tooltip}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'all 1s ease-out' }}
        />
      </svg>
      
      {/* Center content - 퍼센트만 중앙에 */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: strokeColor,
          margin: 0
        }}>
          {percentage.toFixed(0)}%
        </div>
      </div>
    </div>
  );
};

export default CircularGauge;
