import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';

const SystemMonitor = () => {
  const [systemData, setSystemData] = useState({
    cpu: 0,
    ram: 0,
    gpu: 0,
    storage: 0,
    ramUsed: 0,
    ramTotal: 0,
    storageUsed: 0,
    storageTotal: 0
  });
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const socketRef = useRef(null);

  // Socket.IO 연결
  useEffect(() => {
    const connectSocket = () => {
      try {
        // Socket.IO 연결 시도
        const io = require('socket.io-client');
        socketRef.current = io('http://localhost:8000', {
          transports: ['websocket'],
          timeout: 5000
        });

        socketRef.current.on('connect', () => {
          console.log('Socket.IO 연결됨');
          setIsMonitoring(true);
        });

        socketRef.current.on('disconnect', () => {
          console.log('Socket.IO 연결 끊김');
          setIsMonitoring(false);
        });

        // 실시간 시스템 데이터 수신
        socketRef.current.on('system_status', (data) => {
          setSystemData(prev => ({
            ...prev,
            cpu: data.cpu_percent || 0,
            ram: data.ram_percent || 0,
            gpu: data.gpu_percent || 0,
            storage: data.storage_percent || 0,
            ramUsed: data.ram_used_gb || 0,
            ramTotal: data.ram_total_gb || 0,
            storageUsed: data.storage_used_gb || 0,
            storageTotal: data.storage_total_gb || 0
          }));
        });

        // 경고 메시지 수신
        socketRef.current.on('warning_trigger', (data) => {
          setWarnings(prev => [...prev, {
            id: Date.now(),
            type: data.type,
            message: data.message,
            timestamp: new Date()
          }]);
        });

        // 모니터링 시작
        socketRef.current.emit('monitor_toggle', { active: true });

      } catch (error) {
        console.error('Socket.IO 연결 실패:', error);
        setIsMonitoring(false);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('monitor_toggle', { active: false });
        socketRef.current.disconnect();
      }
    };
  }, []);

  // 경고 메시지 자동 제거 (5초 후)
  useEffect(() => {
    if (warnings.length > 0) {
      const timer = setTimeout(() => {
        setWarnings(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [warnings]);

  const getStatusColor = (value) => {
    if (value > 90) return 'text-red-600';
    if (value > 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (value) => {
    if (value > 90) return <AlertTriangle className="w-5 h-5 text-red-600" />;
    if (value > 70) return <TrendingUp className="w-5 h-5 text-yellow-600" />;
    return <TrendingDown className="w-5 h-5 text-green-600" />;
  };

  return (
    <div className="space-y-6">
      {/* 경고 메시지 */}
      {warnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">
              {warnings[0].message}
            </span>
          </div>
        </div>
      )}

      {/* 연결 상태 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">실시간 시스템 모니터링</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isMonitoring ? '실시간 모니터링 중' : '연결 끊김'}
          </span>
        </div>
      </div>

      {/* 시스템 리소스 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CPU */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Cpu className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">CPU</h3>
            </div>
            {getStatusIcon(systemData.cpu)}
          </div>
          <div className="text-3xl font-bold mb-2">
            <span className={getStatusColor(systemData.cpu)}>
              {systemData.cpu.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                systemData.cpu > 90 ? 'bg-red-500' : 
                systemData.cpu > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${systemData.cpu}%` }}
            ></div>
          </div>
        </div>

        {/* RAM */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MemoryStick className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">RAM</h3>
            </div>
            {getStatusIcon(systemData.ram)}
          </div>
          <div className="text-3xl font-bold mb-2">
            <span className={getStatusColor(systemData.ram)}>
              {systemData.ram.toFixed(1)}%
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {systemData.ramUsed.toFixed(1)}GB / {systemData.ramTotal.toFixed(1)}GB
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                systemData.ram > 90 ? 'bg-red-500' : 
                systemData.ram > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${systemData.ram}%` }}
            ></div>
          </div>
        </div>

        {/* GPU */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">GPU</h3>
            </div>
            {getStatusIcon(systemData.gpu)}
          </div>
          <div className="text-3xl font-bold mb-2">
            <span className={getStatusColor(systemData.gpu)}>
              {systemData.gpu.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                systemData.gpu > 90 ? 'bg-red-500' : 
                systemData.gpu > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${systemData.gpu}%` }}
            ></div>
          </div>
        </div>

        {/* 스토리지 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">스토리지</h3>
            </div>
            {getStatusIcon(systemData.storage)}
          </div>
          <div className="text-3xl font-bold mb-2">
            <span className={getStatusColor(systemData.storage)}>
              {systemData.storage.toFixed(1)}%
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {systemData.storageUsed.toFixed(1)}GB / {systemData.storageTotal.toFixed(1)}GB
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                systemData.storage > 90 ? 'bg-red-500' : 
                systemData.storage > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${systemData.storage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;