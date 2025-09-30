import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import GlassPanel from './GlassPanel';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <GlassPanel delay={0.1} glow="blue">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>⚙️ 설정</h2>
            <p style={{ color: '#9ca3af' }}>앱 설정과 정보를 관리합니다</p>
          </div>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Settings size={32} style={{ color: '#00d4ff' }} />
          </motion.div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 모니터링 설정 */}
        <GlassPanel delay={0.2} glow="blue">
          <div className="flex items-center space-x-2 mb-4">
            <Monitor className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">모니터링 설정</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-200">자동 스캔</label>
                <p className="text-xs text-gray-400">앱 시작 시 자동으로 시스템 스캔</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoScan}
                  onChange={(e) => handleSettingChange('autoScan', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                경고 임계값: {settings.warningThreshold}%
              </label>
              <input
                type="range"
                min="70"
                max="95"
                value={settings.warningThreshold}
                onChange={(e) => handleSettingChange('warningThreshold', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>70%</span>
                <span>95%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                모니터링 간격: {settings.monitoringInterval}ms
              </label>
              <select
                value={settings.monitoringInterval}
                onChange={(e) => handleSettingChange('monitoringInterval', parseInt(e.target.value))}
                className="w-full h-10 rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white"
              >
                <option value={500}>500ms (빠름)</option>
                <option value={1000}>1000ms (기본)</option>
                <option value={2000}>2000ms (절전)</option>
              </select>
            </div>
          </div>
        </GlassPanel>

        {/* 정리 설정 */}
        <GlassPanel delay={0.3} glow="green">
          <div className="flex items-center space-x-2 mb-4">
            <HardDrive className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">정리 설정</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-200">자동 정리</label>
                <p className="text-xs text-gray-400">스캔 후 자동으로 안전한 파일 정리</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoClean}
                  onChange={(e) => handleSettingChange('autoClean', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-200">안전 모드</label>
                <p className="text-xs text-gray-400">시스템 파일 보호 강화</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.safeMode}
                  onChange={(e) => handleSettingChange('safeMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </GlassPanel>

        {/* 알림 설정 */}
        <GlassPanel delay={0.4} glow="purple">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">알림 설정</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-200">시스템 알림</label>
                <p className="text-xs text-gray-400">경고 및 완료 알림 표시</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </GlassPanel>

        {/* 보안 설정 */}
        <GlassPanel delay={0.5} glow="orange">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">보안 설정</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center space-x-3">
                {appInfo.adminPrivileges ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                )}
                <div>
                  <p className="font-medium text-white">관리자 권한</p>
                  <p className="text-sm text-gray-400">
                    {appInfo.adminPrivileges ? '활성화됨' : '비활성화됨'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-medium text-white">안전 경로 모드</p>
                  <p className="text-sm text-gray-400">시스템 파일 보호 활성화</p>
                </div>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* 앱 정보 */}
      <GlassPanel delay={0.6} glow="blue">
        <div className="flex items-center space-x-2 mb-4">
          <Info className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">앱 정보</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-sm text-gray-400">버전</p>
            <p className="font-semibold text-white">{appInfo.version}</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-sm text-gray-400">플랫폼</p>
            <p className="font-semibold text-white">{getPlatformName(appInfo.platform)}</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-sm text-gray-400">권한</p>
            <p className={`font-semibold ${appInfo.adminPrivileges ? 'text-green-400' : 'text-yellow-400'}`}>
              {appInfo.adminPrivileges ? '관리자' : '일반 사용자'}
            </p>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};

export default SettingsPanel;