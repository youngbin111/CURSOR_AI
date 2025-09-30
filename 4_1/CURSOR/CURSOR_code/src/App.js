import React, { useState, useEffect } from 'react';
import './index.css';
import SystemMonitorNew from './components/SystemMonitorNew';
import PerformanceDashboardNew from './components/PerformanceDashboardNew';
import DiskCleaner from './components/DiskCleanerNew';
import SettingsPanel from './components/SettingsPanel';
import HeaderNew from './components/HeaderNew';
import NavigationBarNew from './components/NavigationBarNew';

function App() {
  const [activeTab, setActiveTab] = useState('grafana');
  const [systemData, setSystemData] = useState({
    cpu: 0,
    ram: 0,
    storage: 0,
    ramUsed: 0,
    ramTotal: 0,
    storageUsed: 0,
    storageTotal: 0
  });
  const [isLoading, setIsLoading] = useState(true);

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
        } else {
          console.error('API 응답 오류:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('데이터 가져오기 실패:', error);
        // 백엔드 서버가 실행되지 않은 경우 기본값 설정
        setSystemData({
          cpu: 0,
          ram: 0,
          storage: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 500); // 0.5초마다 업데이트 (실시간)
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">시스템 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0b',
        backgroundImage: `
          linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        display: 'flex',
        height: '100vh'
      }}
    >
      {/* Sidebar Navigation */}
      <NavigationBarNew 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden' 
      }}>
        <HeaderNew />
        
        <main style={{ 
          flex: 1, 
          overflow: 'auto', 
          padding: '24px' 
        }}>
          {activeTab === 'grafana' && <PerformanceDashboardNew />}
          {activeTab === 'storage' && <DiskCleaner systemData={systemData} />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>
      </div>
    </div>
  );
}

// 시스템 모니터 컴포넌트
const SystemMonitor = ({ systemData }) => {
  const getStatusColor = (value) => {
    if (value > 90) return 'text-red-600';
    if (value > 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (value) => {
    if (value > 90) return '🔴';
    if (value > 70) return '🟡';
    return '🟢';
  };

  return (
    <div className="space-y-6">
      {/* 강제 디버깅 정보 */}
      <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-bold text-yellow-800">🚨 강제 디버깅 정보</h3>
        <p className="text-sm text-yellow-700">
          ramUsed: {systemData.ramUsed || 'undefined'} | ramTotal: {systemData.ramTotal || 'undefined'}
        </p>
        <p className="text-sm text-yellow-700">
          전체 데이터: {JSON.stringify(systemData)}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">실시간 시스템 모니터링</h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600">실시간 모니터링 중</span>
        </div>
      </div>

      {/* 시스템 리소스 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CPU */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🖥️</span>
              <h3 className="font-semibold text-gray-900">CPU</h3>
            </div>
            <span className="text-2xl">{getStatusIcon(systemData.cpu)}</span>
          </div>
          <div className={`text-3xl font-bold mb-2 ${getStatusColor(systemData.cpu)}`}>
            {systemData.cpu.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">
            실시간 CPU 사용률 (0.1초 측정)
          </div>
          <div className="text-xs text-green-600">
            ✅ 정확한 CPU 사용률 표시
          </div>
          <div className="text-xs text-blue-600 mt-1">
            • 0.5초마다 업데이트 | 0.1초 측정 간격
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
              <span className="text-2xl">💾</span>
              <h3 className="font-semibold text-gray-900">RAM</h3>
            </div>
            <span className="text-2xl">{getStatusIcon(systemData.ram)}</span>
          </div>
          <div className={`text-3xl font-bold mb-2 ${getStatusColor(systemData.ram)}`}>
            {systemData.ram.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {systemData.ramUsed.toFixed(1)}GB / {systemData.ramTotal.toFixed(1)}GB 사용 중
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

        {/* 스토리지 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💿</span>
              <h3 className="font-semibold text-gray-900">스토리지</h3>
            </div>
            <span className="text-2xl">{getStatusIcon(systemData.storage)}</span>
          </div>
          <div className={`text-3xl font-bold mb-2 ${getStatusColor(systemData.storage)}`}>
            {systemData.storage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {systemData.storageUsed.toFixed(1)}GB / {systemData.storageTotal.toFixed(1)}GB 사용 중
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

        {/* 상태 요약 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📊</span>
              <h3 className="font-semibold text-gray-900">시스템 상태</h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">CPU 상태</span>
              <span className={`text-sm font-medium ${getStatusColor(systemData.cpu)}`}>
                {systemData.cpu > 90 ? '위험' : systemData.cpu > 70 ? '주의' : '양호'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">RAM 상태</span>
              <span className={`text-sm font-medium ${getStatusColor(systemData.ram)}`}>
                {systemData.ram > 90 ? '위험' : systemData.ram > 70 ? '주의' : '양호'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">스토리지 상태</span>
              <span className={`text-sm font-medium ${getStatusColor(systemData.storage)}`}>
                {systemData.storage > 90 ? '위험' : systemData.storage > 70 ? '주의' : '양호'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default App;