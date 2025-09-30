import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassPanel from './GlassPanel';
import CircularGauge from './CircularGauge';
import { 
  Thermometer, 
  Fan, 
  Zap, 
  Wifi, 
  Battery,
  HardDrive,
  Trash2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Shield,
  Heart
} from 'lucide-react';

const PerformanceDashboardNew = () => {
  const [cpuUsage, setCpuUsage] = useState(45);
  const [ramUsage, setRamUsage] = useState(62);
  const [diskUsage, setDiskUsage] = useState(78);
  const [cpuTemp, setCpuTemp] = useState(42);
  const [fanSpeed, setFanSpeed] = useState(1200);
  const [powerConsumption, setPowerConsumption] = useState(65);
  const [junkFilesSize, setJunkFilesSize] = useState(2.4);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [systemData, setSystemData] = useState({
    cpu: 0,
    ram: 0,
    storage: 0
  });

  // 실제 시스템 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/system/status');
        if (response.ok) {
          const data = await response.json();
          setSystemData({
            cpu: data.cpu_percent || 0,
            ram: data.ram_percent || 0,
            storage: data.storage_percent || 0
          });
          setCpuUsage(data.cpu_percent || 45);
          setRamUsage(data.ram_percent || 62);
          setDiskUsage(data.storage_percent || 78);
        }
      } catch (error) {
        console.error('데이터 가져오기 실패:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // 실시간 데이터 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuTemp(prev => Math.max(30, Math.min(75, prev + (Math.random() - 0.5) * 4)));
      setFanSpeed(prev => Math.max(800, Math.min(2000, prev + (Math.random() - 0.5) * 200)));
      setPowerConsumption(prev => Math.max(35, Math.min(85, prev + (Math.random() - 0.5) * 6)));
      setJunkFilesSize(prev => Math.max(0.1, prev + Math.random() * 0.05));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const vitals = [
    {
      icon: Thermometer,
      label: 'CPU 온도',
      value: cpuTemp.toFixed(0),
      unit: '°C',
      color: cpuTemp > 65 ? 'red' : cpuTemp > 55 ? 'orange' : 'blue',
      trend: cpuTemp > 60 ? 'up' : cpuTemp < 45 ? 'down' : 'stable',
      status: cpuTemp > 70 ? 'critical' : cpuTemp > 60 ? 'warning' : 'good'
    },
    {
      icon: Fan,
      label: '팬 속도',
      value: fanSpeed.toFixed(0),
      unit: 'RPM',
      color: 'green',
      trend: fanSpeed > 1500 ? 'up' : 'stable',
      status: 'good'
    },
    {
      icon: Zap,
      label: '전력 소비',
      value: powerConsumption.toFixed(0),
      unit: 'W',
      color: 'purple',
      trend: powerConsumption > 70 ? 'up' : 'stable',
      status: powerConsumption > 75 ? 'warning' : 'good'
    },
    {
      icon: Wifi,
      label: '네트워크',
      value: '125',
      unit: 'Mbps',
      color: 'blue',
      trend: 'stable',
      status: 'good'
    },
    {
      icon: Battery,
      label: '배터리',
      value: '87',
      unit: '%',
      color: 'green',
      trend: 'down',
      status: 'good'
    },
    {
      icon: Shield,
      label: '보안 상태',
      value: '활성',
      unit: '',
      color: 'green',
      trend: 'stable',
      status: 'good'
    },
    {
      icon: Clock,
      label: '업타임',
      value: '4h 32m',
      unit: '',
      color: 'blue',
      trend: 'up',
      status: 'good'
    },
    {
      icon: Activity,
      label: '네트워크 사용률',
      value: '12',
      unit: '%',
      color: 'purple',
      trend: 'stable',
      status: 'good'
    }
  ];

  const handleCleanup = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setJunkFilesSize(0.2);
      setIsOptimizing(false);
    }, 3000);
  };

  const getColorByUsage = (usage) => {
    if (usage < 50) return 'green';
    if (usage < 75) return 'blue';
    return 'purple';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#00ff88';
      case 'warning': return '#00d4ff';
      case 'critical': return '#ff2d5a';
      default: return '#9ca3af';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp size={12} style={{ color: '#ff2d5a' }} />;
      case 'down': return <TrendingDown size={12} style={{ color: '#00ff88' }} />;
      case 'stable': return <div style={{ width: '12px', height: '2px', backgroundColor: '#9ca3af', borderRadius: '1px' }}></div>;
      default: return null;
    }
  };

  const getVitalWidgetColor = (color) => {
    const colors = {
      blue: { border: 'rgba(0, 212, 255, 0.3)', background: 'rgba(0, 212, 255, 0.05)' },
      green: { border: 'rgba(0, 255, 136, 0.3)', background: 'rgba(0, 255, 136, 0.05)' },
      purple: { border: 'rgba(168, 85, 247, 0.3)', background: 'rgba(168, 85, 247, 0.05)' },
      orange: { border: 'rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' },
      red: { border: 'rgba(255, 45, 90, 0.3)', background: 'rgba(255, 45, 90, 0.05)' }
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color) => {
    const colors = {
      blue: '#00d4ff',
      green: '#00ff88',
      purple: '#a855f7',
      orange: '#f59e0b',
      red: '#ff2d5a'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(12, 1fr)', 
      gap: '24px',
      height: '100%'
    }}>
      {/* 메인 성능 지표 영역 */}
      <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>성능 모니터링</h1>
          <p style={{ color: '#9ca3af', margin: 0 }}>실시간 시스템 상태 및 리소스 사용량</p>
        </motion.div>

        {/* 원형 게이지 패널 */}
        <GlassPanel delay={0.2} glow="blue">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '32px',
            padding: '32px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ textAlign: 'center' }}
            >
              <CircularGauge
                value={cpuUsage}
                max={100}
                color="green"
                size={180}
                tooltip="🧠 두뇌 (CPU): 컴퓨터의 두뇌 역할을 하는 중앙처리장치입니다. 프로그램을 실행하고 계산을 처리합니다. 사용률이 높을수록 컴퓨터가 바쁘게 일하고 있다는 뜻이에요!"
              />
              {/* 라벨을 게이지 아래 중앙에 크게 */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: 'white',
                  margin: 0,
                  marginBottom: '12px'
                }}>
                  CPU 사용률
                </h3>
                {/* 상태 표시를 라벨 아래에 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {cpuUsage > 80 ? 
                    <AlertTriangle size={16} style={{ color: '#ff2d5a' }} /> :
                    <CheckCircle size={16} style={{ color: '#00ff88' }} />
                  }
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: cpuUsage > 80 ? '#ff2d5a' : '#00ff88'
                  }}>
                    {cpuUsage > 80 ? '높음' : cpuUsage > 50 ? '보통' : '낮음'}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{ textAlign: 'center' }}
            >
              <CircularGauge
                value={ramUsage}
                max={100}
                color="blue"
                size={180}
                tooltip="🖥️ 작업대 (RAM): 컴퓨터의 작업대 역할을 하는 메모리입니다. 프로그램이 실행될 때 필요한 공간을 제공해요. 작업대가 가득 차면 새로운 프로그램을 실행하기 어려워집니다!"
              />
              {/* 라벨을 게이지 아래 중앙에 크게 */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: 'white',
                  margin: 0,
                  marginBottom: '12px'
                }}>
                  RAM 사용률
                </h3>
                {/* 상태 표시를 라벨 아래에 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {ramUsage > 85 ? 
                    <AlertTriangle size={16} style={{ color: '#ff2d5a' }} /> :
                    <CheckCircle size={16} style={{ color: '#00ff88' }} />
                  }
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: ramUsage > 85 ? '#ff2d5a' : '#00ff88'
                  }}>
                    {ramUsage > 85 ? '높음' : ramUsage > 60 ? '보통' : '낮음'}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{ textAlign: 'center' }}
            >
              <CircularGauge
                value={diskUsage}
                max={100}
                color="purple"
                size={180}
                tooltip="📁 파일 보관함 (디스크): 컴퓨터의 파일 보관함 역할을 하는 저장공간입니다. 사진, 문서, 프로그램 등을 저장해요. 보관함이 가득 차면 새로운 파일을 저장할 수 없어요!"
              />
              {/* 라벨을 게이지 아래 중앙에 크게 */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: 'white',
                  margin: 0,
                  marginBottom: '12px'
                }}>
                  디스크 사용률
                </h3>
                {/* 상태 표시를 라벨 아래에 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {diskUsage > 90 ? 
                    <AlertTriangle size={16} style={{ color: '#ff2d5a' }} /> :
                    <CheckCircle size={16} style={{ color: '#00ff88' }} />
                  }
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: diskUsage > 90 ? '#ff2d5a' : '#00ff88'
                  }}>
                    {diskUsage > 90 ? '높음' : diskUsage > 75 ? '보통' : '낮음'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </GlassPanel>

        {/* 노트북 건강 점수 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <GlassPanel glow="green">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(0, 255, 136, 0.2)',
                  border: '1px solid rgba(0, 255, 136, 0.3)'
                }}>
                  <Heart size={24} style={{ color: '#00ff88' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0 }}>노트북 건강 점수</h3>
                  <p style={{ color: '#9ca3af', margin: 0 }}>
                    현재 상태: <span style={{ color: '#00ff88', fontWeight: '500' }}>양호</span>
                  </p>
                </div>
                <div style={{
                  padding: '4px 12px',
                  border: '1px solid #00ff88',
                  borderRadius: '20px',
                  color: '#00ff88',
                  fontSize: '12px'
                }}>
                  건강함
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '48px', 
                  fontWeight: 'bold', 
                  color: '#00ff88',
                  margin: 0
                }}>
                  85
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#9ca3af',
                  margin: 0
                }}>
                  점
                </div>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </div>

      {/* 바이탈 사인 사이드바 */}
      <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Activity size={20} style={{ color: '#00ff88', marginRight: '8px' }} />
            시스템 바이탈 사인
          </h2>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {vitals.map((vital, index) => {
            const Icon = vital.icon;
            const widgetColor = getVitalWidgetColor(vital.color);
            return (
              <motion.div
                key={vital.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05, duration: 0.4 }}
              >
                <div style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${widgetColor.border}`,
                  backgroundColor: widgetColor.background,
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        padding: '8px', 
                        borderRadius: '8px', 
                        backgroundColor: `${getIconColor(vital.color)}20`
                      }}>
                        <Icon size={16} style={{ color: getIconColor(vital.color) }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{vital.label}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                            {vital.value} {vital.unit}
                          </span>
                          {vital.trend && getTrendIcon(vital.trend)}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      {vital.status && (
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: '500',
                          color: getStatusColor(vital.status)
                        }}>
                          {vital.status === 'good' ? '정상' : vital.status === 'warning' ? '주의' : '위험'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboardNew;
