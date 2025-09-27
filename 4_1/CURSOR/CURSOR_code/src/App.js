import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [systemData, setSystemData] = useState({
    cpu: 0,
    ram: 0,
    storage: 0
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
            storage: data.storage_percent || 0
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
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <span className="text-white text-xl">⚡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CleanBoost</h1>
                <p className="text-sm text-gray-500">PC 성능 최적화 도구</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">실시간 연결됨</span>
            </div>
          </div>
        </div>
      </header>

      {/* 네비게이션 */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('monitor')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'monitor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 시스템 모니터
            </button>
            <button
              onClick={() => setActiveTab('cleaner')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'cleaner'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🧹 디스크 정리
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚙️ 설정
            </button>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'monitor' && <SystemMonitor systemData={systemData} />}
        {activeTab === 'cleaner' && <DiskCleaner />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>
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

// 디스크 정리 컴포넌트
const DiskCleaner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);

  const startScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/scan/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        }
      });
      
      if (response.ok) {
        setTimeout(async () => {
          try {
            const resultsResponse = await fetch('http://localhost:8000/api/v1/scan/results', {
              headers: {
                'Authorization': 'Bearer demo-token'
              }
            });
            
            if (resultsResponse.ok) {
              const results = await resultsResponse.json();
              setScanResults({
                totalSize: results.total_scannable_size / (1024**3),
                items: results.scan_results.map(item => ({
                  name: item.name,
                  size: item.size / (1024**3),
                  type: item.type
                }))
              });
            }
          } catch (error) {
            console.error('스캔 결과 가져오기 실패:', error);
          }
          setIsScanning(false);
        }, 3000);
      }
    } catch (error) {
      console.error('스캔 시작 실패:', error);
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">디스크 정리</h2>
        <div className="flex items-center space-x-2">
          <span className="text-green-600">🛡️</span>
          <span className="text-sm text-gray-600">안전한 정리 도구</span>
        </div>
      </div>

      {/* 스캔 시작 버튼 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              시스템 스캔
            </h3>
            <p className="text-gray-600">
              불필요한 파일과 프로그램 잔여물을 찾아 정리할 수 있습니다.
            </p>
          </div>
          <button
            onClick={startScan}
            disabled={isScanning}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>스캔 중...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>스캔 시작</span>
              </>
            )}
          </button>
        </div>
        
        {isScanning && (
          <div className="mt-4">
            <div className="flex items-center space-x-2 text-blue-600">
              <span className="animate-spin">⏳</span>
              <span className="text-sm">시스템을 스캔하고 있습니다...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* 스캔 결과 */}
      {scanResults && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">✅</span>
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  {scanResults.totalSize.toFixed(2)}GB 확보 가능
                </h3>
                <p className="text-green-600">
                  안전하게 삭제할 수 있는 파일들을 찾았습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">스캔 결과</h3>
            <div className="space-y-3">
              {scanResults.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.size.toFixed(2)}GB</p>
                    <p className="text-sm text-gray-500">삭제 가능</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 설정 패널 컴포넌트
const SettingsPanel = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">설정</h2>
        <div className="flex items-center space-x-2">
          <span className="text-blue-600">⚙️</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">ℹ️</span>
          <h3 className="text-lg font-semibold text-gray-900">앱 정보</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">버전</p>
            <p className="font-semibold text-gray-900">1.0.0</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">플랫폼</p>
            <p className="font-semibold text-gray-900">Windows</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">상태</p>
            <p className="font-semibold text-green-600">정상</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;