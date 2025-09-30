import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  HardDrive, 
  Cpu, 
  Activity, 
  Settings, 
  Shield,
  Gauge,
  Zap,
  Heart,
  BarChart3
} from 'lucide-react';

const navItems = [
  { id: 'grafana', icon: BarChart3, label: '시스템 모니터링', color: 'purple' },
  { id: 'storage', icon: HardDrive, label: '디스크 정리', color: 'green' },
  { id: 'settings', icon: Settings, label: '설정', color: 'blue' }
];

const NavigationBarNew = ({ activeTab, onTabChange }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const getColorStyles = (color, isActive, isHovered) => {
    const colors = {
      blue: {
        text: isActive ? '#00d4ff' : '#9ca3af',
        glow: isActive || isHovered ? '0 0 20px rgba(0, 212, 255, 0.3)' : 'none',
        bg: isActive ? 'rgba(0, 212, 255, 0.2)' : isHovered ? 'rgba(0, 212, 255, 0.1)' : 'transparent'
      },
      green: {
        text: isActive ? '#00ff88' : '#9ca3af',
        glow: isActive || isHovered ? '0 0 20px rgba(0, 255, 136, 0.3)' : 'none',
        bg: isActive ? 'rgba(0, 255, 136, 0.2)' : isHovered ? 'rgba(0, 255, 136, 0.1)' : 'transparent'
      },
      purple: {
        text: isActive ? '#a855f7' : '#9ca3af',
        glow: isActive || isHovered ? '0 0 20px rgba(168, 85, 247, 0.3)' : 'none',
        bg: isActive ? 'rgba(168, 85, 247, 0.2)' : isHovered ? 'rgba(168, 85, 247, 0.1)' : 'transparent'
      }
    };
    return colors[color];
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        width: '256px',
        height: '100%',
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
        padding: '24px'
      }}
    >
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Clean Boost 🚀</h2>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>초보자도 쉽게 PC 관리</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item, index) => {
          const isActive = activeTab === item.id;
          const isHovered = hoveredItem === item.id;
          const colorStyles = getColorStyles(item.color, isActive, isHovered);
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onClick={() => onTabChange(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: colorStyles.bg,
                border: '1px solid transparent',
                color: colorStyles.text,
                boxShadow: colorStyles.glow,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.05) translateX(8px)' : 'scale(1) translateX(0)'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'transparent';
              }}
            >
              <motion.div
                animate={{ 
                  rotate: isHovered ? 360 : 0,
                  scale: isActive ? 1.2 : 1
                }}
                transition={{ duration: 0.3 }}
              >
                <Icon size={20} />
              </motion.div>
              
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                flex: 1,
                textAlign: 'left'
              }}>{item.label}</span>
              
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'currentColor',
                    marginLeft: 'auto',
                    animation: 'pulse 2s infinite'
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        style={{
          marginTop: '32px',
          padding: '16px',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px'
        }}
      >
        <div style={{ 
          fontSize: '12px', 
          color: '#9ca3af', 
          marginBottom: '8px' 
        }}>바이탈 사인 ⚡</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '12px' 
          }}>
            <span style={{ color: '#d1d5db' }}>체온</span>
            <span style={{ color: '#00ff88' }}>42°C 😎</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '12px' 
          }}>
            <span style={{ color: '#d1d5db' }}>심박수</span>
            <span style={{ color: '#00d4ff' }}>1200 BPM</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '12px' 
          }}>
            <span style={{ color: '#d1d5db' }}>에너지</span>
            <span style={{ color: '#a855f7' }}>65W ⚡</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NavigationBarNew;
