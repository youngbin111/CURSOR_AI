import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trash2, 
  FolderOpen, 
  FileText, 
  Image, 
  Video, 
  Music,
  Download,
  Archive,
  AlertTriangle,
  CheckCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import GlassPanel from './GlassPanel';
import CircularGauge from './CircularGauge';
import Button from './ui/Button';
import Progress from './ui/Progress';

const DiskCleaner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupProgress, setCleanupProgress] = useState(0);
  const [totalDiskSpace] = useState(512); // GB
  const [usedSpace, setUsedSpace] = useState(387);
  const [categories, setCategories] = useState([
    { id: 'temp', name: '임시 파일', icon: FileText, size: 2.4, count: 1247, color: 'blue', selected: true },
    { id: 'cache', name: '캐시 파일', icon: Archive, size: 1.8, count: 895, color: 'green', selected: true },
    { id: 'downloads', name: '다운로드', icon: Download, size: 15.2, count: 156, color: 'purple', selected: false },
    { id: 'images', name: '중복 이미지', icon: Image, size: 3.7, count: 284, color: 'blue', selected: true },
    { id: 'videos', name: '대용량 비디오', icon: Video, size: 8.9, count: 23, color: 'green', selected: false },
    { id: 'music', name: '음악 파일', icon: Music, size: 4.3, count: 567, color: 'purple', selected: false },
  ]);

  const scanDisk = async () => {
    setIsScanning(true);
    // 스캔 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsScanning(false);
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

  // 파일 확장자별 그룹화
  const groupFilesByExtension = (files) => {
    const groups = {};
    files.forEach(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'no-extension';
      if (!groups[extension]) {
        groups[extension] = {
          files: [],
          totalSize: 0,
          count: 0
        };
      }
      groups[extension].files.push(file);
      groups[extension].totalSize += file.size;
      groups[extension].count += 1;
    });
    return groups;
  };

  // 파일 타입별 아이콘
  const getFileIcon = (extension) => {
    const iconMap = {
      'tmp': '🗂️',
      'log': '📄',
      'cache': '💾',
      'temp': '🗂️',
      'bak': '📦',
      'old': '📦',
      'no-extension': '📄',
      'txt': '📄',
      'dat': '💾',
      'db': '🗄️',
      'sqlite': '🗄️',
      'json': '📋',
      'xml': '📋',
      'html': '🌐',
      'css': '🎨',
      'js': '⚡',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️',
      'mp4': '🎬',
      'avi': '🎬',
      'mp3': '🎵',
      'wav': '🎵',
      'pdf': '📕',
      'doc': '📘',
      'docx': '📘',
      'xls': '📊',
      'xlsx': '📊',
      'ppt': '📽️',
      'pptx': '📽️',
      'zip': '📦',
      'rar': '📦',
      '7z': '📦',
      'exe': '⚙️',
      'msi': '⚙️',
      'dll': '🔧',
      'sys': '🔧'
    };
    return iconMap[extension] || '📄';
  };

  // 파일 타입별 색상
  const getFileTypeColor = (extension) => {
    const colorMap = {
      'tmp': 'text-orange-600',
      'log': 'text-blue-600',
      'cache': 'text-purple-600',
      'temp': 'text-orange-600',
      'bak': 'text-yellow-600',
      'old': 'text-yellow-600',
      'no-extension': 'text-gray-600',
      'txt': 'text-blue-600',
      'dat': 'text-green-600',
      'db': 'text-indigo-600',
      'sqlite': 'text-indigo-600',
      'json': 'text-green-600',
      'xml': 'text-green-600',
      'html': 'text-red-600',
      'css': 'text-blue-600',
      'js': 'text-yellow-600',
      'jpg': 'text-pink-600',
      'jpeg': 'text-pink-600',
      'png': 'text-pink-600',
      'gif': 'text-pink-600',
      'mp4': 'text-red-600',
      'avi': 'text-red-600',
      'mp3': 'text-purple-600',
      'wav': 'text-purple-600',
      'pdf': 'text-red-600',
      'doc': 'text-blue-600',
      'docx': 'text-blue-600',
      'xls': 'text-green-600',
      'xlsx': 'text-green-600',
      'ppt': 'text-orange-600',
      'pptx': 'text-orange-600',
      'zip': 'text-yellow-600',
      'rar': 'text-yellow-600',
      '7z': 'text-yellow-600',
      'exe': 'text-gray-600',
      'msi': 'text-gray-600',
      'dll': 'text-gray-600',
      'sys': 'text-gray-600'
    };
    return colorMap[extension] || 'text-gray-600';
  };

  // 선택된 항목의 총 크기 계산
  const getSelectedSize = () => {
    return selectedItems.reduce((total, item) => total + item.size, 0);
  };

  // 섹션 접기/펼치기 토글
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 긴 경로를 줄여서 표시하는 함수
  const truncatePath = (path, maxLength = 50) => {
    if (path.length <= maxLength) return path;
    const parts = path.split('\\');
    if (parts.length > 3) {
      return `...\\${parts.slice(-2).join('\\')}`;
    }
    return path.substring(0, maxLength - 3) + '...';
  };

  // 파일명만 추출하는 함수
  const getFileName = (path) => {
    return path.split('\\').pop() || path.split('/').pop() || path;
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

          {/* 대용량 임시 파일 - 확장자별 그룹화 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleSection('tempFiles')}
                  className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">대용량 임시 파일</h3>
                  <span className="text-gray-500">
                    {expandedSections.tempFiles ? '▼' : '▶'}
                  </span>
                </button>
              </div>
              <button
                onClick={() => toggleAllItems('TEMP_FILES')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                전체 선택/해제
              </button>
            </div>
            
            {expandedSections.tempFiles && (() => {
              const tempFiles = scanResults.scan_results.filter(item => item.type === 'TEMP_FILES');
              const groupedFiles = groupFilesByExtension(tempFiles);
              const sortedGroups = Object.entries(groupedFiles).sort((a, b) => b[1].totalSize - a[1].totalSize);
              
              return (
                <div className="space-y-4">
                  {sortedGroups.map(([extension, group]) => (
                    <div key={extension} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getFileIcon(extension)}</span>
                          <div>
                            <h4 className={`font-semibold ${getFileTypeColor(extension)}`}>
                              .{extension.toUpperCase()} 파일
                            </h4>
                            <p className="text-sm text-gray-500">
                              {group.count}개 파일 • {formatFileSize(group.totalSize)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const allSelected = group.files.every(file => 
                              selectedItems.some(selected => selected.path === file.path)
                            );
                            if (allSelected) {
                              setSelectedItems(prev => 
                                prev.filter(selected => 
                                  !group.files.some(file => file.path === selected.path)
                                )
                              );
                            } else {
                              setSelectedItems(prev => {
                                const newItems = group.files.filter(file => 
                                  !prev.some(selected => selected.path === file.path)
                                );
                                return [...prev, ...newItems];
                              });
                            }
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {group.files.every(file => 
                            selectedItems.some(selected => selected.path === file.path)
                          ) ? '전체 해제' : '전체 선택'}
                        </button>
                      </div>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {group.files.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={selectedItems.some(selected => selected.path === item.path)}
                                onChange={() => toggleItem(item)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate" title={getFileName(item.path)}>
                                  {getFileName(item.path)}
                                </p>
                                <p className="text-sm text-gray-500 truncate" title={item.path}>
                                  {truncatePath(item.path)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className="font-semibold text-gray-900">{formatFileSize(item.size)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* 프로그램 잔여물 - 확장자별 그룹화 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleSection('programRemains')}
                  className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <HardDrive className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">프로그램 잔여물</h3>
                  <span className="text-gray-500">
                    {expandedSections.programRemains ? '▼' : '▶'}
                  </span>
                </button>
              </div>
              <button
                onClick={() => toggleAllItems('PROGRAM_REMAINS')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                전체 선택/해제
              </button>
            </div>
            
            {expandedSections.programRemains && (() => {
              const programFiles = scanResults.scan_results.filter(item => item.type === 'PROGRAM_REMAINS');
              const groupedFiles = groupFilesByExtension(programFiles);
              const sortedGroups = Object.entries(groupedFiles).sort((a, b) => b[1].totalSize - a[1].totalSize);
              
              return (
                <div className="space-y-4">
                  {sortedGroups.map(([extension, group]) => (
                    <div key={extension} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getFileIcon(extension)}</span>
                          <div>
                            <h4 className={`font-semibold ${getFileTypeColor(extension)}`}>
                              .{extension.toUpperCase()} 파일
                            </h4>
                            <p className="text-sm text-gray-500">
                              {group.count}개 파일 • {formatFileSize(group.totalSize)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const allSelected = group.files.every(file => 
                              selectedItems.some(selected => selected.path === file.path)
                            );
                            if (allSelected) {
                              setSelectedItems(prev => 
                                prev.filter(selected => 
                                  !group.files.some(file => file.path === selected.path)
                                )
                              );
                            } else {
                              setSelectedItems(prev => {
                                const newItems = group.files.filter(file => 
                                  !prev.some(selected => selected.path === file.path)
                                );
                                return [...prev, ...newItems];
                              });
                            }
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {group.files.every(file => 
                            selectedItems.some(selected => selected.path === file.path)
                          ) ? '전체 해제' : '전체 선택'}
                        </button>
                      </div>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {group.files.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={selectedItems.some(selected => selected.path === item.path)}
                                onChange={() => toggleItem(item)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate" title={getFileName(item.path)}>
                                  {getFileName(item.path)}
                                </p>
                                <p className="text-sm text-gray-500 truncate" title={item.path}>
                                  {truncatePath(item.path)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className="font-semibold text-gray-900">{formatFileSize(item.size)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
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