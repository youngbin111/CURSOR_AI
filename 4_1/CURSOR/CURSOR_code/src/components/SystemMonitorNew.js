import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassPanel from './GlassPanel';
import { 
  Monitor, 
  Cpu, 
  HardDrive, 
  Activity, 
  Server,
  Database,
  Network,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const SystemMonitorNew = () => {
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [coreUsageData, setCoreUsageData] = useState([]);
  const [diskData, setDiskData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemData, setSystemData] = useState({
    cpu: 0,
    ram: 0,
    storage: 0,
    ramUsed: 0,
    ramTotal: 0,
    storageUsed: 0,
    storageTotal: 0
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
          storage: data.storage_percent || 0,
          ramUsed: data.ram_used_gb || 0,
          ramTotal: data.ram_total_gb || 0,
          storageUsed: data.storage_used_gb || 0,
          storageTotal: data.storage_total_gb || 0
        });
        }
      } catch (error) {
        console.error('데이터 가져오기 실패:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  // 초기 데이터 생성
  useEffect(() => {
    const generateInitialData = () => {
      const data = [];
      const now = new Date();
      
      for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 1000);
        data.push({
          time: time.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          cpu: Math.random() * 80 + 10,
          memory: Math.random() * 70 + 20,
          disk: Math.random() * 30 + 40,
          requests: Math.random() * 500 + 100,
          network: Math.random() * 100 + 50
        });
      }
      setTimeSeriesData(data);
    };

    const generateCoreData = () => {
      const cores = [];
      for (let i = 0; i < 8; i++) {
        cores.push({
          core: `Core ${i}`,
          usage: Math.random() * 90 + 5,
          temperature: Math.random() * 30 + 40
        });
      }
      setCoreUsageData(cores);
    };

    const generateDiskData = () => {
      setDiskData([
        { name: 'C: System', used: 156, total: 250, percentage: 62, color: '#00d4ff' },
        { name: 'D: Data', used: 89, total: 500, percentage: 18, color: '#00ff88' },
        { name: 'E: Backup', used: 340, total: 1000, percentage: 34, color: '#a855f7' }
      ]);
    };

    generateInitialData();
    generateCoreData();
    generateDiskData();
  }, []);

  // 실시간 데이터 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      setTimeSeriesData(prev => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        newData.push({
          time: now.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          cpu: systemData.cpu || Math.random() * 80 + 10,
          memory: systemData.ram || Math.random() * 70 + 20,
          disk: systemData.storage || Math.random() * 30 + 40,
          requests: Math.random() * 500 + 100,
          network: Math.random() * 100 + 50
        });
        return newData;
      });

      setCoreUsageData(prev => 
        prev.map(core => ({
          ...core,
          usage: Math.max(5, Math.min(95, core.usage + (Math.random() - 0.5) * 20)),
          temperature: Math.max(35, Math.min(75, core.temperature + (Math.random() - 0.5) * 5))
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [systemData]);

  const getStatusColor = (value) => {
    if (value > 90) return '#ff2d5a';
    if (value > 70) return '#f59e0b';
    return '#00ff88';
  };

  const getStatusIcon = (value) => {
    if (value > 90) return '🔴';
    if (value > 70) return '🟡';
    return '🟢';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>시스템 모니터링</h1>
          <p style={{ color: '#9ca3af', margin: 0 }}>실시간 시스템 메트릭 대시보드</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 12px',
            border: '1px solid #00ff88',
            borderRadius: '20px',
            color: '#00ff88',
            fontSize: '12px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#00ff88',
              borderRadius: '50%',
              marginRight: '8px',
              animation: 'pulse 2s infinite'
            }}></div>
            실시간
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
            <Clock size={16} style={{ marginRight: '4px' }} />
            {currentTime.toLocaleTimeString('ko-KR')}
        </div>
      </div>
      </motion.div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(12, 1fr)', 
        gap: '24px' 
      }}>
        {/* 상단: CPU & 메모리 트렌드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ gridColumn: 'span 8' }}
        >
          <GlassPanel glow="blue">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <Activity size={20} style={{ color: '#00d4ff', marginRight: '8px' }} />
                CPU & 메모리 사용률 트렌드
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#00d4ff', borderRadius: '50%', marginRight: '8px' }}></div>
                  <span style={{ color: '#d1d5db' }}>CPU</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#00ff88', borderRadius: '50%', marginRight: '8px' }}></div>
                  <span style={{ color: '#d1d5db' }}>메모리</span>
                </div>
            </div>
          </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(time) => {
                      const parts = time.split(':');
                      return `${parts[1]}:${parts[2]}`;
                    }}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{
                            backgroundColor: 'rgba(15, 15, 20, 0.95)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid #4b5563',
                            borderRadius: '8px',
                            padding: '12px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                          }}>
                            <p style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '4px' }}>{`시간: ${label}`}</p>
                            {payload.map((entry, index) => (
                              <p key={index} style={{ color: entry.color, fontSize: '14px', fontWeight: '500', margin: 0 }}>
                                {`${entry.name}: ${entry.value.toFixed(1)}%`}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="#00d4ff" 
                    strokeWidth={2}
                    dot={false}
                    name="CPU"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="#00ff88" 
                    strokeWidth={2}
                    dot={false}
                    name="메모리"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </motion.div>

        {/* 디스크 사용량 게이지 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <GlassPanel glow="purple">
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: 'white', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <HardDrive size={18} style={{ color: '#a855f7', marginRight: '8px' }} />
              디스크 사용량
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {diskData.map((disk, index) => (
                <div key={disk.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#d1d5db' }}>{disk.name}</span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {disk.used}GB / {disk.total}GB
            </span>
          </div>
                  <div style={{ width: '100%', backgroundColor: 'rgba(55, 65, 81, 0.5)', borderRadius: '4px', height: '8px' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${disk.percentage}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                      style={{ 
                        height: '8px', 
                        borderRadius: '4px',
                        backgroundColor: disk.color 
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'right' }}>
                    {disk.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* 시스템 상태 요약 */}
          <GlassPanel>
            <h4 style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              color: 'white', 
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Monitor size={16} style={{ color: '#00d4ff', marginRight: '8px' }} />
              시스템 상태
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>가동 시간</span>
                <span style={{ color: '#00ff88' }}>12:34:56</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>프로세스</span>
                <span style={{ color: 'white' }}>247</span>
          </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>네트워크 I/O</span>
                <span style={{ color: '#00d4ff' }}>↑ 1.2 MB/s ↓ 3.4 MB/s</span>
          </div>
        </div>
          </GlassPanel>
        </motion.div>

        {/* 실시간 메트릭 카드들 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ gridColumn: 'span 12' }}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            {/* CPU 카드 */}
            <GlassPanel>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(0, 212, 255, 0.2)',
                    marginRight: '12px'
                  }}>
                    <Cpu size={16} style={{ color: '#00d4ff' }} />
                  </div>
                  <div>
                    <p 
                      style={{ 
                        fontSize: '12px !important', 
                        color: '#9ca3af !important', 
                        margin: '0 !important',
                        cursor: 'help !important',
                        display: 'block !important'
                      }} 
                      title="컴퓨터의 두뇌인 CPU가 얼마나 바쁘게 일하고 있는지 보여줍니다. 높을수록 컴퓨터가 더 열심히 일하고 있다는 뜻이에요!"
                    >
                      두뇌(CPU) 사용률
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                      {systemData.cpu.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: getStatusColor(systemData.cpu),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {getStatusIcon(systemData.cpu)}
            </div>
          </div>
            </GlassPanel>

            {/* RAM 카드 */}
            <GlassPanel>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(0, 255, 136, 0.2)',
                    marginRight: '12px'
                  }}>
                    <Activity size={16} style={{ color: '#00ff88' }} />
                  </div>
                  <div>
                    <p 
                      style={{ 
                        fontSize: '12px !important', 
                        color: '#9ca3af !important', 
                        margin: '0 !important',
                        cursor: 'help !important',
                        display: 'block !important'
                      }} 
                      title="컴퓨터의 기억력인 RAM이 얼마나 사용되고 있는지 보여줍니다. 높을수록 컴퓨터가 더 많은 일을 기억하고 있다는 뜻이에요!"
                    >
                      기억력(RAM) 사용률
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0 }}>
              {systemData.ram.toFixed(1)}%
                    </p>
          </div>
          </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: getStatusColor(systemData.ram),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {getStatusIcon(systemData.ram)}
          </div>
        </div>
            </GlassPanel>

            {/* 스토리지 카드 */}
            <GlassPanel>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    marginRight: '12px'
                  }}>
                    <HardDrive size={16} style={{ color: '#a855f7' }} />
                  </div>
                  <div>
                    <p 
                      style={{ 
                        fontSize: '12px !important', 
                        color: '#9ca3af !important', 
                        margin: '0 !important',
                        cursor: 'help !important',
                        display: 'block !important'
                      }} 
                      title="컴퓨터의 창고인 하드디스크가 얼마나 가득 차 있는지 보여줍니다. 높을수록 창고가 더 가득 차 있다는 뜻이에요!"
                    >
                      창고(디스크) 사용률
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                      {systemData.storage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: getStatusColor(systemData.storage),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {getStatusIcon(systemData.storage)}
            </div>
          </div>
            </GlassPanel>

            {/* 네트워크 카드 */}
            <GlassPanel>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    marginRight: '12px'
                  }}>
                    <Network size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>네트워크</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                      ↑ 1.2 MB/s
                    </p>
          </div>
          </div>
                <div style={{ fontSize: '12px', color: '#00ff88' }}>
                  +12%
          </div>
        </div>
            </GlassPanel>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SystemMonitorNew;
