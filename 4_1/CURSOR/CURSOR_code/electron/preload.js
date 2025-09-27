const { contextBridge, ipcRenderer } = require('electron');

// 보안을 위해 노출할 API만 제한적으로 제공
contextBridge.exposeInMainWorld('electronAPI', {
  // 앱 정보
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // 권한 확인
  checkAdminPrivileges: () => ipcRenderer.invoke('check-admin-privileges'),
  
  // 플랫폼별 경로 처리
  getPath: (name) => {
    const { app } = require('electron');
    return app.getPath(name);
  }
});

// 보안: Node.js API 직접 접근 차단
window.require = undefined;
window.exports = undefined;
window.module = undefined;

