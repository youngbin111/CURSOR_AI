import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  HardDrive,
  FileText,
  Clock,
  Shield,
  Download,
  RefreshCw
} from 'lucide-react';

const DiskCleaner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanResults, setCleanResults] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 스캔 시작
  const startScan = async () => {
    setIsScanning(true);
    setScanResults(null);
    setCleanResults(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/scan/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + generateAuthToken()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.scanId) {
          // 스캔 진행 상태 확인
          checkScanProgress(data.scanId);
        }
      }
    } catch (error) {
      console.error('스캔 시작 실패:', error);
      setIsScanning(false);
    }
  };

  // 스캔 진행 상태 확인
  const checkScanProgress = async (scanId) => {
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/scan/results', {
          headers: {
            'Authorization': 'Bearer ' + generateAuthToken()
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'SUCCESS') {
            setScanResults(data);
            setIsScanning(false);
            clearInterval(checkInterval);
          }
        }
      } catch (error) {
        console.error('스캔 결과 확인 실패:', error);
        setIsScanning(false);
        clearInterval(checkInterval);
      }
    }, 2000);
  };

  // 정리 실행
  const executeClean = async () => {
    setIsCleaning(true);
    setShowConfirmModal(false);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/clean/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + generateAuthToken()
        },
        body: JSON.stringify({
          items_to_delete: selectedItems
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCleanResults(data);
        setIsCleaning(false);
        
        // 정리 후 다시 스캔
        setTimeout(() => {
          startScan();
        }, 2000);
      }
    } catch (error) {
      console.error('정리 실행 실패:', error);
      setIsCleaning(false);
    }
  };

  // 인증 토큰 생성 (실제로는 더 안전한 방식 사용)
  const generateAuthToken = () => {
    return 'demo-token-' + Date.now();
  };

  // 항목 선택/해제
  const toggleItem = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.path === item.path);
      if (isSelected) {
        return prev.filter(selected => selected.path !== item.path);
      } else {
        return [...prev, item];
      }
    });
  };

  // 전체 선택/해제
  const toggleAllItems = (type) => {
    if (!scanResults) return;
    
    const items = scanResults.scan_results.filter(item => item.type === type);
    const allSelected = items.every(item => 
      selectedItems.some(selected => selected.path === item.path)
    );
    
    if (allSelected) {
      // 전체 해제
      setSelectedItems(prev => 
        prev.filter(selected => 
          !items.some(item => item.path === selected.path)
        )
      );
    } else {
      // 전체 선택
      setSelectedItems(prev => {
        const newItems = items.filter(item => 
          !prev.some(selected => selected.path === item.path)
        );
        return [...prev, ...newItems];
      });
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 선택된 항목의 총 크기 계산
  const getSelectedSize = () => {
    return selectedItems.reduce((total, item) => total + item.size, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">디스크 정리</h2>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-600" />
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
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>스캔 중...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>스캔 시작</span>
              </>
            )}
          </button>
        </div>
        
        {isScanning && (
          <div className="mt-4">
            <div className="flex items-center space-x-2 text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
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
          {/* 확보 가능 용량 요약 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  {formatFileSize(scanResults.total_scannable_size)} 확보 가능
                </h3>
                <p className="text-green-600">
                  안전하게 삭제할 수 있는 파일들을 찾았습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 대용량 임시 파일 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">대용량 임시 파일</h3>
              </div>
              <button
                onClick={() => toggleAllItems('TEMP_FILES')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                전체 선택/해제
              </button>
            </div>
            
            <div className="space-y-3">
              {scanResults.scan_results
                .filter(item => item.type === 'TEMP_FILES')
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.some(selected => selected.path === item.path)}
                        onChange={() => toggleItem(item)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.path}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatFileSize(item.size)}</p>
                      <p className="text-sm text-gray-500">삭제 가능</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 프로그램 잔여물 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">프로그램 잔여물</h3>
              </div>
              <button
                onClick={() => toggleAllItems('PROGRAM_REMAINS')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                전체 선택/해제
              </button>
            </div>
            
            <div className="space-y-3">
              {scanResults.scan_results
                .filter(item => item.type === 'PROGRAM_REMAINS')
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.some(selected => selected.path === item.path)}
                        onChange={() => toggleItem(item)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.path}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatFileSize(item.size)}</p>
                      <p className="text-sm text-gray-500">삭제 가능</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 정리 실행 버튼 */}
          {selectedItems.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">
                    {selectedItems.length}개 항목 선택됨
                  </h3>
                  <p className="text-yellow-600">
                    {formatFileSize(getSelectedSize())} 확보 예상
                  </p>
                </div>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isCleaning}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-red-700 disabled:opacity-50"
                >
                  {isCleaning ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>정리 중...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      <span>정리하기</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 정리 결과 */}
      {cleanResults && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                정리 완료!
              </h3>
              <p className="text-green-600">
                {cleanResults.deleted_count}개 파일을 삭제하여 {formatFileSize(cleanResults.total_cleaned_size)}를 확보했습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">정리 확인</h3>
            </div>
            <p className="text-gray-600 mb-6">
              선택한 {selectedItems.length}개 항목을 삭제하시겠습니까?<br/>
              <strong>이 작업은 되돌릴 수 없습니다.</strong>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg flex-1 hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={executeClean}
                className="bg-red-600 text-white px-4 py-2 rounded-lg flex-1 hover:bg-red-700"
              >
                삭제 실행
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiskCleaner;