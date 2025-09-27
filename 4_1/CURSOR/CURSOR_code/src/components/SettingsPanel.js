import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Monitor,
  HardDrive,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const SettingsPanel = () => {
  const [settings, setSettings] = useState({
    autoScan: false,
    warningThreshold: 90,
    monitoringInterval: 1000,
    autoClean: false,
    safeMode: true,
    notifications: true
  });

  const [appInfo, setAppInfo] = useState({
    version: '1.0.0',
    platform: 'win32',
    adminPrivileges: false
  });

  useEffect(() => {
    // 앱 정보 가져오기
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(version => {
        setAppInfo(prev => ({ ...prev, version }));
      });
      
      window.electronAPI.getPlatform().then(platform => {
        setAppInfo(prev => ({ ...prev, platform }));
      });
      
      window.electronAPI.checkAdminPrivileges().then(adminPrivileges => {
        setAppInfo(prev => ({ ...prev, adminPrivileges }));
      });
    }
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getPlatformName = (platform) => {
    switch (platform) {
      case 'win32': return 'Windows';
      case 'darwin': return 'macOS';
      case 'linux': return 'Linux';
      default: return platform;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">설정</h2>
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 모니터링 설정 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Monitor className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">모니터링 설정</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">자동 스캔</label>
                <p className="text-xs text-gray-500">앱 시작 시 자동으로 시스템 스캔</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoScan}
                  onChange={(e) => handleSettingChange('autoScan', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                경고 임계값: {settings.warningThreshold}%
              </label>
              <input
                type="range"
                min="70"
                max="95"
                value={settings.warningThreshold}
                onChange={(e) => handleSettingChange('warningThreshold', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>70%</span>
                <span>95%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                모니터링 간격: {settings.monitoringInterval}ms
              </label>
              <select
                value={settings.monitoringInterval}
                onChange={(e) => handleSettingChange('monitoringInterval', parseInt(e.target.value))}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value={500}>500ms (빠름)</option>
                <option value={1000}>1000ms (기본)</option>
                <option value={2000}>2000ms (절전)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 정리 설정 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <HardDrive className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">정리 설정</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">자동 정리</label>
                <p className="text-xs text-gray-500">스캔 후 자동으로 안전한 파일 정리</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoClean}
                  onChange={(e) => handleSettingChange('autoClean', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">안전 모드</label>
                <p className="text-xs text-gray-500">시스템 파일 보호 강화</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.safeMode}
                  onChange={(e) => handleSettingChange('safeMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">알림 설정</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">시스템 알림</label>
                <p className="text-xs text-gray-500">경고 및 완료 알림 표시</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 보안 설정 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">보안 설정</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {appInfo.adminPrivileges ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">관리자 권한</p>
                  <p className="text-sm text-gray-500">
                    {appInfo.adminPrivileges ? '활성화됨' : '비활성화됨'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">안전 경로 모드</p>
                  <p className="text-sm text-gray-500">시스템 파일 보호 활성화</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 앱 정보 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Info className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">앱 정보</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">버전</p>
            <p className="font-semibold text-gray-900">{appInfo.version}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">플랫폼</p>
            <p className="font-semibold text-gray-900">{getPlatformName(appInfo.platform)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">권한</p>
            <p className={`font-semibold ${appInfo.adminPrivileges ? 'text-green-600' : 'text-yellow-600'}`}>
              {appInfo.adminPrivileges ? '관리자' : '일반 사용자'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;