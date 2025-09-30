import React, { useState } from 'react';
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
  CheckCircle,
  Play,
  RotateCcw,
  HardDrive,
  AlertTriangle,
  Search,
  Settings,
  Database,
  X
} from 'lucide-react';
import GlassPanel from './GlassPanel';
import CircularGauge from './CircularGauge';
import Button from './ui/Button';
import Progress from './ui/Progress';

const DiskCleaner = ({ systemData }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupProgress, setCleanupProgress] = useState(0);
  const [scanResults, setScanResults] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    tempFiles: false,
    programRemains: false
  });
  
  // 파일 유형별 확장 상태
  const [expandedFileTypes, setExpandedFileTypes] = useState({});
  
  // 프로그램 잔여물 파일 유형별 확장 상태
  const [expandedRemainsFileTypes, setExpandedRemainsFileTypes] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cleanResults, setCleanResults] = useState(null);
  
  // 프로그램 잔여물 정리 상태
  const [programName, setProgramName] = useState('');
  const [isSearchingRemains, setIsSearchingRemains] = useState(false);
  const [remainsResults, setRemainsResults] = useState(null);
  const [selectedRemains, setSelectedRemains] = useState([]);
  const [expandedRemainsSections, setExpandedRemainsSections] = useState({
    appData: false,
    registry: false
  });
  
  // 실제 시스템 데이터 사용
  const totalDiskSpace = systemData.storageTotal || 512; // GB
  const usedSpace = systemData.storageUsed || 387;
  // 더미 데이터 제거 - 실제 스캔 결과만 사용

  // 프로그램 잔여물 검색
  const searchProgramRemains = async () => {
    if (!programName.trim()) {
      alert('프로그램 이름을 입력해주세요.');
      return;
    }
    
    setIsSearchingRemains(true);
    setRemainsResults(null);
    setSelectedRemains([]);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/scan/remains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + generateAuthToken()
        },
        body: JSON.stringify({ program_name: programName.trim() })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('검색 결과:', data);
        setRemainsResults(data);
        
        // 검색 결과가 없는 경우 메시지 표시
        if (data.appdata_items.length === 0 && data.registry_items.length === 0) {
          alert(`'${programName}'에 대한 잔여물을 찾을 수 없습니다.\n\n다른 프로그램 이름으로 시도해보세요.`);
        }
      } else {
        const errorData = await response.json();
        console.error('프로그램 잔여물 검색 실패:', errorData);
        alert(`프로그램 잔여물 검색에 실패했습니다: ${errorData.detail || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('프로그램 잔여물 검색 오류:', error);
      alert('프로그램 잔여물 검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearchingRemains(false);
    }
  };

  // 실제 스캔 시작
  const startScan = async () => {
    setIsScanning(true);
    setScanResults(null);
    setSelectedItems([]);
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
        checkScanProgress(data.scan_id);
      } else {
        console.error('스캔 시작 실패:', response.status);
        setIsScanning(false);
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

  // 인증 토큰 생성
  const generateAuthToken = () => {
    return 'demo-token-' + Date.now();
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
      'tmp': '🗂️', 'log': '📄', 'cache': '💾', 'temp': '🗂️', 'bak': '📦', 'old': '📦',
      'no-extension': '📄', 'txt': '📄', 'dat': '💾', 'db': '🗄️', 'sqlite': '🗄️',
      'json': '📋', 'xml': '📋', 'html': '🌐', 'css': '🎨', 'js': '⚡',
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
      'mp4': '🎬', 'avi': '🎬', 'mp3': '🎵', 'wav': '🎵',
      'pdf': '📕', 'doc': '📘', 'docx': '📘', 'xls': '📊', 'xlsx': '📊',
      'ppt': '📽️', 'pptx': '📽️', 'zip': '📦', 'rar': '📦', '7z': '📦',
      'exe': '⚙️', 'msi': '⚙️', 'dll': '🔧', 'sys': '🔧'
    };
    return iconMap[extension] || '📄';
  };

  // 파일 타입별 색상
  const getFileTypeColor = (extension) => {
    const colorMap = {
      'tmp': '#ff6b35', 'log': '#3b82f6', 'cache': '#8b5cf6', 'temp': '#ff6b35',
      'bak': '#f59e0b', 'old': '#f59e0b', 'no-extension': '#6b7280', 'txt': '#3b82f6',
      'dat': '#10b981', 'db': '#6366f1', 'sqlite': '#6366f1', 'json': '#10b981',
      'xml': '#10b981', 'html': '#ef4444', 'css': '#3b82f6', 'js': '#f59e0b',
      'jpg': '#ec4899', 'jpeg': '#ec4899', 'png': '#ec4899', 'gif': '#ec4899',
      'mp4': '#ef4444', 'avi': '#ef4444', 'mp3': '#8b5cf6', 'wav': '#8b5cf6',
      'pdf': '#ef4444', 'doc': '#3b82f6', 'docx': '#3b82f6', 'xls': '#10b981',
      'xlsx': '#10b981', 'ppt': '#ff6b35', 'pptx': '#ff6b35', 'zip': '#f59e0b',
      'rar': '#f59e0b', '7z': '#f59e0b', 'exe': '#6b7280', 'msi': '#6b7280',
      'dll': '#6b7280', 'sys': '#6b7280'
    };
    return colorMap[extension] || '#6b7280';
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
      setSelectedItems(prev => 
        prev.filter(selected => 
          !items.some(item => item.path === selected.path)
        )
      );
    } else {
      setSelectedItems(prev => {
        const newItems = items.filter(item => 
          !prev.some(selected => selected.path === item.path)
        );
        return [...prev, ...newItems];
      });
    }
  };

  // 섹션 접기/펼치기 토글
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 파일 유형별 접기/펼치기 토글
  const toggleFileType = (fileType) => {
    setExpandedFileTypes(prev => ({
      ...prev,
      [fileType]: !prev[fileType]
    }));
  };

  // 프로그램 잔여물 파일 유형별 접기/펼치기 토글
  const toggleRemainsFileType = (fileType) => {
    setExpandedRemainsFileTypes(prev => ({
      ...prev,
      [fileType]: !prev[fileType]
    }));
  };

  // 잔여물 섹션 접기/펼치기 토글
  const toggleRemainsSection = (section) => {
    setExpandedRemainsSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 잔여물 항목 선택/해제
  const toggleRemainsItem = (item) => {
    setSelectedRemains(prev => {
      const isSelected = prev.some(selected => selected.path === item.path);
      if (isSelected) {
        return prev.filter(selected => selected.path !== item.path);
      } else {
        return [...prev, item];
      }
    });
  };

  // 잔여물 전체 선택/해제
  const toggleAllRemainsItems = (type) => {
    if (!remainsResults) return;
    
    const items = type === 'appData' ? remainsResults.appdata_items : remainsResults.registry_items;
    const allSelected = items.every(item => 
      selectedRemains.some(selected => selected.path === item.path)
    );
    
    if (allSelected) {
      setSelectedRemains(prev => 
        prev.filter(selected => 
          !items.some(item => item.path === selected.path)
        )
      );
    } else {
      setSelectedRemains(prev => {
        const newItems = items.filter(item => 
          !prev.some(selected => selected.path === item.path)
        );
        return [...prev, ...newItems];
      });
    }
  };

  // 선택된 잔여물의 총 크기 계산
  const getSelectedRemainsSize = () => {
    return selectedRemains.reduce((total, item) => total + (item.size || 0), 0);
  };

  // 잔여물 삭제 실행
  const executeRemainsClean = async () => {
    if (selectedRemains.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedRemains.length}개 잔여물을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/clean/remains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + generateAuthToken()
        },
        body: JSON.stringify({
          items_to_delete: selectedRemains
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`정리 완료! ${data.deleted_count}개 항목을 삭제하여 ${formatFileSize(data.total_cleaned_size)}를 확보했습니다.`);
        setSelectedRemains([]);
        setRemainsResults(null);
        setProgramName('');
      } else {
        alert('잔여물 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('잔여물 삭제 실패:', error);
      alert('잔여물 삭제 중 오류가 발생했습니다.');
    }
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

  // 선택된 항목의 총 크기 계산
  const getSelectedSize = () => {
    return selectedItems.reduce((total, item) => total + item.size, 0);
  };

  // 실제 정리 실행
  const executeClean = async () => {
    setIsCleaning(true);
    setShowConfirmModal(false);
    setCleanupProgress(0);
    
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
        
        // 정리 진행률 시뮬레이션
        for (let i = 0; i <= 100; i += 10) {
          setCleanupProgress(i);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        setIsCleaning(false);
        setCleanupProgress(0);
        
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

  // 사용하지 않는 함수들 제거

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
              background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>📦 짐 정리</h2>
            <p style={{ color: '#9ca3af' }}>필요 없는 짐들을 버려서 공간을 만들어볼까요?</p>
          </div>
          <motion.div
            animate={{ rotate: isScanning ? 360 : 0 }}
            transition={{ duration: 2, repeat: isScanning ? Infinity : 0, ease: "linear" }}
          >
            <Trash2 size={32} style={{ color: '#00d4ff' }} />
          </motion.div>
        </div>
      </GlassPanel>

      {/* Disk Usage Overview */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px' 
      }}>
        <GlassPanel delay={0.2} glow="green">
          <div className="flex items-center" style={{ marginBottom: '16px', gap: '12px' }}>
            <div style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 255, 136, 0.2)',
              border: '1px solid rgba(0, 255, 136, 0.3)'
            }}>
              <HardDrive size={20} style={{ color: '#00ff88' }} />
            </div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: 'white',
              margin: 0
            }}>창고 현황</h3>
          </div>
              <div className="flex justify-center">
                <CircularGauge
                  value={(usedSpace / totalDiskSpace) * 100}
                  max={100}
                  color="green"
                  size={160}
                  tooltip="💾 디스크 사용률: 실제 시스템의 저장공간 사용량을 표시합니다"
                />
              </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">전체 용량</span>
              <span className="text-white">{totalDiskSpace.toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">사용 중</span>
              <span className="text-[#00ff88]">{usedSpace.toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">사용 가능</span>
              <span className="text-[#00d4ff]">{(totalDiskSpace - usedSpace).toFixed(1)} GB</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              💡 실제 시스템의 디스크 정보를 표시합니다
            </div>
          </div>
        </GlassPanel>

        {/* Cleanup Categories */}
        <GlassPanel delay={0.3} glow="purple" className="lg:col-span-2">
            <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
              <div className="flex items-center" style={{ gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  border: '1px solid rgba(168, 85, 247, 0.3)'
                }}>
                  <FolderOpen size={20} style={{ color: '#a855f7' }} />
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: 'white',
                  margin: 0
                }}>정리 가능한 파일</h3>
              </div>
              <Button
                onClick={startScan}
                disabled={isScanning || isCleaning}
                className="border-0 font-semibold text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #0099cc 0%, #00cc66 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(0, 153, 204, 0.3)',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #0088bb 0%, #00bb55 100%)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 153, 204, 0.5)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #0099cc 0%, #00cc66 100%)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 153, 204, 0.3)';
                  e.target.style.transform = 'translateY(0px)';
                }}
              >
                <div className="flex items-center justify-center" style={{ gap: '12px' }}>
                  {isScanning ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RotateCcw size={18} />
                    </motion.div>
                  ) : (
                    <Search size={18} />
                  )}
                  <span>{isScanning ? '스캔 중...' : (scanResults ? '다시 스캔' : '스캔 시작')}</span>
                </div>
              </Button>
            </div>

            {/* 스캔 결과 표시 */}
            {scanResults ? (
              <div style={{ padding: '0 24px' }}>
                {/* 확보 가능 용량 요약 */}
                <div style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  marginTop: '30px',
                  marginBottom: '30px'
                }}>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <h4 className="text-lg font-semibold text-green-400">
                        {formatFileSize(scanResults.total_scannable_size)} 확보 가능
                      </h4>
                      <p className="text-green-300 text-sm">
                        안전하게 삭제할 수 있는 파일들을 찾았습니다.
                      </p>
                    </div>
                  </div>
                </div>

              {/* 대용량 임시 파일 - 확장자별 그룹화 */}
              <div style={{ marginBottom: '15px' }}>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => toggleSection('tempFiles')}
                    className="flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor: '#333333',
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      color: '#FFFFFF',
                      boxShadow: expandedSections.tempFiles 
                        ? '0 0 15px rgba(0, 212, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                        : '0 0 5px rgba(0, 212, 255, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#444444';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#333333';
                    }}
                  >
                    <FileText className="w-5 h-5" style={{ color: '#00d4ff', marginRight: '10px' }} />
                    <span className="text-lg font-semibold" style={{ color: '#FFFFFF', marginRight: '10px' }}>대용량 임시 파일</span>
                    <span className="transition-transform duration-200" style={{
                      transform: expandedSections.tempFiles ? 'rotate(90deg)' : 'rotate(0deg)',
                      color: '#00d4ff'
                    }}>
                      ▶
                    </span>
                  </button>
                </div>
                
                {/* 목록 분리선 */}
                {expandedSections.tempFiles && (
                  <div style={{
                    height: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    margin: '16px 0',
                    borderRadius: '1px'
                  }} />
                )}
                
                {expandedSections.tempFiles && (() => {
                  const tempFiles = scanResults.scan_results.filter(item => item.type === 'TEMP_FILES');
                  const groupedFiles = groupFilesByExtension(tempFiles);
                  const sortedGroups = Object.entries(groupedFiles).sort((a, b) => b[1].totalSize - a[1].totalSize);
                  
                  return (
                    <div className="grid grid-cols-1 gap-3">
                      {sortedGroups.map(([extension, group]) => (
                        <div key={extension} style={{
                          padding: '16px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.3s ease',
                          marginBottom: '16px'
                        }} onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }} onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            width: '100%'
                          }}>
                            <div className="flex items-center space-x-3" style={{ maxWidth: '70%', minWidth: 0, flex: 1 }}>
                              <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${getFileTypeColor(extension)}20`, border: `1px solid ${getFileTypeColor(extension)}30` }}>
                                <span className="text-lg">{getFileIcon(extension)}</span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
                                <h5 style={{ 
                                  fontWeight: '400', 
                                  color: '#9CA3AF',
                                  fontSize: '14px',
                                  margin: '0 0 8px 0',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '100%'
                                }}>
                                  .{extension.toUpperCase()} 파일
                                </h5>
                                <div style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  gap: '8px',
                                  maxWidth: '100%'
                                }}>
                                  <p style={{ 
                                    fontSize: '16px', 
                                    fontWeight: '600',
                                    color: '#FFFFFF',
                                    margin: '0',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: '1',
                                    minWidth: 0,
                                    maxWidth: '60%'
                                  }}>
                                    {group.count}개 파일
                                  </p>
                                  <p style={{ 
                                    fontSize: '16px', 
                                    fontWeight: '600',
                                    color: '#FFFFFF',
                                    margin: '0',
                                    flexShrink: 0,
                                    maxWidth: '40%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {formatFileSize(group.totalSize)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleFileType(extension)}
                              className="rounded-lg transition-all duration-200 hover:bg-white/10"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '8px',
                                margin: '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                flexShrink: 0
                              }}
                            >
                              <span className="transition-transform duration-200" style={{
                                transform: expandedFileTypes[extension] ? 'rotate(90deg)' : 'rotate(0deg)',
                                color: '#9CA3AF',
                                fontSize: '16px',
                                margin: '0',
                                padding: '0'
                              }}>
                                ▶
                              </span>
                            </button>
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
                              className="text-sm px-4 py-1 rounded transition-all duration-200"
                              style={{
                                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                                border: '1px solid rgba(0, 212, 255, 0.3)',
                                color: '#00d4ff',
                                borderRadius: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(0, 212, 255, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'rgba(0, 212, 255, 0.1)';
                              }}
                            >
                              {group.files.every(file => 
                                selectedItems.some(selected => selected.path === file.path)
                              ) ? '전체 해제' : '전체 선택'}
                            </button>
                          </div>
                          
                          {expandedFileTypes[extension] && (
                            <div className="space-y-2 max-h-48 overflow-y-auto mt-3">
                            {group.files.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded hover:bg-white/10">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.some(selected => selected.path === item.path)}
                                    onChange={() => toggleItem(item)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                                  />
                                  <div 
                                    className="min-w-0 flex-1" 
                                    style={{ 
                                      maxWidth: 'calc(100% - 120px)',
                                      minWidth: '0',
                                      flex: '1 1 0%'
                                    }}
                                  >
                                    <p 
                                      className="font-medium text-white" 
                                      title={getFileName(item.path)}
                                      style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '100%'
                                      }}
                                    >
                                      {getFileName(item.path)}
                                    </p>
                                    <p 
                                      className="text-sm text-gray-400" 
                                      title={item.path}
                                      style={{ 
                                        width: '300px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        margin: '0'
                                      }}
                                    >
                                      {truncatePath(item.path)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                  <p className="font-semibold text-white">{formatFileSize(item.size)}</p>
                                </div>
                              </div>
                            ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* 프로그램 잔여물 - 확장자별 그룹화 */}
              <div style={{ marginBottom: '15px' }}>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => toggleSection('programRemains')}
                    className="flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor: '#333333',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      color: '#FFFFFF',
                      boxShadow: expandedSections.programRemains 
                        ? '0 0 15px rgba(0, 255, 136, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                        : '0 0 5px rgba(0, 255, 136, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#444444';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#333333';
                    }}
                  >
                    <HardDrive className="w-5 h-5" style={{ color: '#00ff88', marginRight: '10px' }} />
                    <span className="text-lg font-semibold" style={{ color: '#FFFFFF', marginRight: '10px' }}>프로그램 잔여물</span>
                    <span className="transition-transform duration-200" style={{
                      transform: expandedSections.programRemains ? 'rotate(90deg)' : 'rotate(0deg)',
                      color: '#00ff88'
                    }}>
                      ▶
                    </span>
                  </button>
                </div>
                
                {/* 목록 분리선 */}
                {expandedSections.programRemains && (
                  <div style={{
                    height: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    margin: '16px 0',
                    borderRadius: '1px'
                  }} />
                )}
                
                {expandedSections.programRemains && (() => {
                  const programFiles = scanResults.scan_results.filter(item => item.type === 'PROGRAM_REMAINS');
                  const groupedFiles = groupFilesByExtension(programFiles);
                  
                  // 파일이 1개인 분류들을 기타로 묶기
                  const mainGroups = {};
                  const otherFiles = [];
                  
                  Object.entries(groupedFiles).forEach(([extension, group]) => {
                    if (group.count > 1) {
                      mainGroups[extension] = group;
                    } else {
                      otherFiles.push(...group.files);
                    }
                  });
                  
                  // 기타 파일들이 있으면 기타 그룹 생성
                  if (otherFiles.length > 0) {
                    const otherGroup = {
                      files: otherFiles,
                      count: otherFiles.length,
                      totalSize: otherFiles.reduce((sum, file) => sum + file.size, 0)
                    };
                    mainGroups['기타'] = otherGroup;
                  }
                  
                  const sortedGroups = Object.entries(mainGroups).sort((a, b) => b[1].totalSize - a[1].totalSize);
                  
                  return (
                    <div className="grid grid-cols-1 gap-3">
                      {sortedGroups.map(([extension, group]) => (
                        <div key={extension} style={{
                          padding: '16px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.3s ease',
                          marginBottom: '16px'
                        }} onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }} onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            width: '100%'
                          }}>
                            <div className="flex items-center space-x-3" style={{ maxWidth: '70%', minWidth: 0, flex: 1 }}>
                              <div className="p-2 rounded-lg flex-shrink-0" style={{ 
                                backgroundColor: extension === '기타' ? '#6B728020' : `${getFileTypeColor(extension)}20`, 
                                border: extension === '기타' ? '1px solid #6B728030' : `1px solid ${getFileTypeColor(extension)}30` 
                              }}>
                                <span className="text-lg">{extension === '기타' ? '📁' : getFileIcon(extension)}</span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
                                <h5 style={{ 
                                  fontWeight: '400', 
                                  color: '#9CA3AF',
                                  fontSize: '14px',
                                  margin: '0 0 8px 0',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '100%'
                                }}>
                                  {extension === '기타' ? '기타 파일' : `.${extension.toUpperCase()} 파일`}
                                </h5>
                                <div style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  gap: '8px',
                                  maxWidth: '100%'
                                }}>
                                  <p style={{ 
                                    fontSize: '16px', 
                                    fontWeight: '600',
                                    color: '#FFFFFF',
                                    margin: '0',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: '1',
                                    minWidth: 0,
                                    maxWidth: '60%'
                                  }}>
                                    {group.count}개 파일
                                  </p>
                                  <p style={{ 
                                    fontSize: '16px', 
                                    fontWeight: '600',
                                    color: '#FFFFFF',
                                    margin: '0',
                                    flexShrink: 0,
                                    maxWidth: '40%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {formatFileSize(group.totalSize)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleRemainsFileType(extension)}
                              className="rounded-lg transition-all duration-200 hover:bg-white/10"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '8px',
                                margin: '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                flexShrink: 0
                              }}
                            >
                              <span className="transition-transform duration-200" style={{
                                transform: expandedRemainsFileTypes[extension] ? 'rotate(90deg)' : 'rotate(0deg)',
                                color: '#9CA3AF',
                                fontSize: '16px',
                                margin: '0',
                                padding: '0'
                              }}>
                                ▶
                              </span>
                            </button>
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
                              className="text-sm px-4 py-1 rounded transition-all duration-200"
                              style={{
                                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                border: '1px solid rgba(0, 255, 136, 0.3)',
                                color: '#00ff88',
                                borderRadius: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(0, 255, 136, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'rgba(0, 255, 136, 0.1)';
                              }}
                            >
                              {group.files.every(file => 
                                selectedItems.some(selected => selected.path === file.path)
                              ) ? '전체 해제' : '전체 선택'}
                            </button>
                          </div>
                          
                          {expandedRemainsFileTypes[extension] && (
                            <div className="space-y-2 max-h-48 overflow-y-auto mt-3">
                            {group.files.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded hover:bg-white/10">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.some(selected => selected.path === item.path)}
                                    onChange={() => toggleItem(item)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                                  />
                                  <div 
                                    className="min-w-0 flex-1" 
                                    style={{ 
                                      maxWidth: 'calc(100% - 120px)',
                                      minWidth: '0',
                                      flex: '1 1 0%'
                                    }}
                                  >
                                    <p 
                                      className="font-medium text-white" 
                                      title={getFileName(item.path)}
                                      style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '100%'
                                      }}
                                    >
                                      {getFileName(item.path)}
                                    </p>
                                    <p 
                                      className="text-sm text-gray-400" 
                                      title={item.path}
                                      style={{ 
                                        width: '300px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        margin: '0'
                                      }}
                                    >
                                      {truncatePath(item.path)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                  <p className="font-semibold text-white">{formatFileSize(item.size)}</p>
                                </div>
                              </div>
                            ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">스캔을 시작하여 정리 가능한 파일을 찾아보세요</p>
              </div>
            )}
        </GlassPanel>
      </div>

      {/* 정리 실행 버튼 */}
      {selectedItems.length > 0 && (
        <GlassPanel delay={0.5} className="p-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-400">
                  {selectedItems.length}개 항목 선택됨
                </h3>
                <p className="text-yellow-300">
                  {formatFileSize(getSelectedSize())} 확보 예상
                </p>
              </div>
              <Button
                onClick={() => setShowConfirmModal(true)}
                disabled={isCleaning}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isCleaning ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RotateCcw size={16} />
                    </motion.div>
                    <span className="ml-2">정리 중...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span className="ml-2">정리하기</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* 정리 결과 */}
      {cleanResults && (
        <GlassPanel delay={0.6} className="p-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-green-400">
                  정리 완료!
                </h3>
                <p className="text-green-300">
                  {cleanResults.deleted_count}개 파일을 삭제하여 {formatFileSize(cleanResults.total_cleaned_size)}를 확보했습니다.
                </p>
              </div>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 max-w-md w-full mx-4 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">정리 확인</h3>
            </div>
            <p className="text-gray-300 mb-6">
              선택한 {selectedItems.length}개 항목을 삭제하시겠습니까?<br/>
              <strong className="text-red-400">이 작업은 되돌릴 수 없습니다.</strong>
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white flex-1"
              >
                취소
              </Button>
              <Button
                onClick={executeClean}
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                삭제 실행
              </Button>
            </div>
          </div>
        </div>
      )}

       {/* 프로그램 잔여물 정리 */}
       <GlassPanel delay={0.6} glow="orange">
         <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
           <div className="flex items-center" style={{ gap: '12px' }}>
             <div style={{
               padding: '8px',
               borderRadius: '8px',
               backgroundColor: 'rgba(255, 165, 0, 0.2)',
               border: '1px solid rgba(255, 165, 0, 0.3)'
             }}>
               <Settings size={20} style={{ color: '#ffa500' }} />
             </div>
             <h3 style={{
               fontSize: '18px',
               fontWeight: 'bold',
               color: 'white',
               margin: 0
             }}>프로그램 잔여물 정리</h3>
           </div>
         </div>

         {/* 프로그램 이름 입력 */}
         <div style={{ padding: '0 24px', marginBottom: '20px' }}>
           <div className="flex items-center gap-3 mb-4">
             <input
               type="text"
               value={programName}
               onChange={(e) => setProgramName(e.target.value)}
               placeholder="삭제할 프로그램 이름을 입력하세요 (예: Chrome, Firefox, Discord)"
               className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
               style={{
                 backgroundColor: 'rgba(255, 255, 255, 0.1)',
                 border: '1px solid rgba(255, 255, 255, 0.2)',
                 color: '#FFFFFF'
               }}
             />
             <Button
               onClick={searchProgramRemains}
               disabled={isSearchingRemains || !programName.trim()}
               className="border-0 font-semibold text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg"
               style={{
                 background: 'linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)',
                 color: '#FFFFFF',
                 boxShadow: '0 4px 15px rgba(255, 165, 0, 0.3)',
                 fontSize: '16px',
                 fontWeight: '600'
               }}
               onMouseEnter={(e) => {
                 e.target.style.background = 'linear-gradient(135deg, #ff9500 0%, #ff7f00 100%)';
                 e.target.style.boxShadow = '0 6px 20px rgba(255, 165, 0, 0.5)';
                 e.target.style.transform = 'translateY(-2px)';
               }}
               onMouseLeave={(e) => {
                 e.target.style.background = 'linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)';
                 e.target.style.boxShadow = '0 4px 15px rgba(255, 165, 0, 0.3)';
                 e.target.style.transform = 'translateY(0px)';
               }}
             >
               <div className="flex items-center justify-center" style={{ gap: '8px' }}>
                 {isSearchingRemains ? (
                   <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                   >
                     <RotateCcw size={18} />
                   </motion.div>
                 ) : (
                   <Search size={18} />
                 )}
                 <span>{isSearchingRemains ? '검색 중...' : '잔여물 검색'}</span>
               </div>
             </Button>
           </div>
         </div>

         {/* 검색 결과 표시 */}
         {remainsResults && (
           <div style={{ padding: '0 24px' }}>
             {/* AppData 폴더 잔여물 */}
             {remainsResults.appdata_items && remainsResults.appdata_items.length > 0 && (
               <div style={{ marginBottom: '20px' }}>
                 <button
                   onClick={() => toggleRemainsSection('appData')}
                   className="flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-300 w-full"
                   style={{
                     backgroundColor: '#333333',
                     border: '1px solid rgba(255, 165, 0, 0.3)',
                     color: '#FFFFFF',
                     boxShadow: expandedRemainsSections.appData 
                       ? '0 0 15px rgba(255, 165, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                       : '0 0 5px rgba(255, 165, 0, 0.2)'
                   }}
                   onMouseEnter={(e) => {
                     e.target.style.backgroundColor = '#444444';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.backgroundColor = '#333333';
                   }}
                 >
                   <FolderOpen className="w-5 h-5" style={{ color: '#ffa500', marginRight: '10px' }} />
                   <span className="text-lg font-semibold" style={{ color: '#FFFFFF', marginRight: '10px' }}>
                     AppData 폴더 잔여물 ({remainsResults.appdata_items.length}개)
                   </span>
                   <span className="transition-transform duration-200" style={{
                     transform: expandedRemainsSections.appData ? 'rotate(90deg)' : 'rotate(0deg)',
                     color: '#ffa500'
                   }}>
                     ▶
                   </span>
                 </button>
                 
                 {expandedRemainsSections.appData && (
                   <>
                     <div style={{
                       height: '1px',
                       backgroundColor: 'rgba(255, 255, 255, 0.1)',
                       margin: '16px 0',
                       borderRadius: '1px'
                     }} />
                     
                     <div className="space-y-2 max-h-64 overflow-y-auto">
                       {remainsResults.appdata_items.map((item, index) => (
                         <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10">
                           <div className="flex items-center space-x-3 flex-1 min-w-0">
                             <input
                               type="checkbox"
                               checked={selectedRemains.some(selected => selected.path === item.path)}
                               onChange={() => toggleRemainsItem(item)}
                               className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 flex-shrink-0"
                             />
                             <div className="min-w-0 flex-1">
                               <p className="font-medium text-white" style={{
                                 overflow: 'hidden',
                                 textOverflow: 'ellipsis',
                                 whiteSpace: 'nowrap',
                                 maxWidth: '100%'
                               }}>
                                 {item.name}
                               </p>
                               <p className="text-sm text-gray-400" style={{ 
                                 width: '300px',
                                 overflow: 'hidden',
                                 textOverflow: 'ellipsis',
                                 whiteSpace: 'nowrap',
                                 margin: '0'
                               }}>
                                 {truncatePath(item.path)}
                               </p>
                             </div>
                           </div>
                           <div className="text-right flex-shrink-0 ml-2">
                             <p className="font-semibold text-white">{formatFileSize(item.size || 0)}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </>
                 )}
               </div>
             )}

             {/* 레지스트리 잔여물 */}
             {remainsResults.registry_items && remainsResults.registry_items.length > 0 && (
               <div style={{ marginBottom: '20px' }}>
                 <button
                   onClick={() => toggleRemainsSection('registry')}
                   className="flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-300 w-full"
                   style={{
                     backgroundColor: '#333333',
                     border: '1px solid rgba(255, 165, 0, 0.3)',
                     color: '#FFFFFF',
                     boxShadow: expandedRemainsSections.registry 
                       ? '0 0 15px rgba(255, 165, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                       : '0 0 5px rgba(255, 165, 0, 0.2)'
                   }}
                   onMouseEnter={(e) => {
                     e.target.style.backgroundColor = '#444444';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.backgroundColor = '#333333';
                   }}
                 >
                   <Database className="w-5 h-5" style={{ color: '#ffa500', marginRight: '10px' }} />
                   <span className="text-lg font-semibold" style={{ color: '#FFFFFF', marginRight: '10px' }}>
                     레지스트리 잔여물 ({remainsResults.registry_items.length}개)
                   </span>
                   <span className="transition-transform duration-200" style={{
                     transform: expandedRemainsSections.registry ? 'rotate(90deg)' : 'rotate(0deg)',
                     color: '#ffa500'
                   }}>
                     ▶
                   </span>
                 </button>
                 
                 {expandedRemainsSections.registry && (
                   <>
                     <div style={{
                       height: '1px',
                       backgroundColor: 'rgba(255, 255, 255, 0.1)',
                       margin: '16px 0',
                       borderRadius: '1px'
                     }} />
                     
                     <div className="space-y-2 max-h-64 overflow-y-auto">
                       {remainsResults.registry_items.map((item, index) => (
                         <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10">
                           <div className="flex items-center space-x-3 flex-1 min-w-0">
                             <input
                               type="checkbox"
                               checked={selectedRemains.some(selected => selected.path === item.path)}
                               onChange={() => toggleRemainsItem(item)}
                               className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 flex-shrink-0"
                             />
                             <div className="min-w-0 flex-1">
                               <p className="font-medium text-white" style={{
                                 overflow: 'hidden',
                                 textOverflow: 'ellipsis',
                                 whiteSpace: 'nowrap',
                                 maxWidth: '100%'
                               }}>
                                 {item.name}
                               </p>
                               <p className="text-sm text-gray-400" style={{ 
                                 width: '300px',
                                 overflow: 'hidden',
                                 textOverflow: 'ellipsis',
                                 whiteSpace: 'nowrap',
                                 margin: '0'
                               }}>
                                 {truncatePath(item.path)}
                               </p>
                             </div>
                           </div>
                           <div className="text-right flex-shrink-0 ml-2">
                             <p className="font-semibold text-white">{formatFileSize(item.size || 0)}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </>
                 )}
               </div>
             )}

             {/* 선택된 항목 삭제 버튼 */}
             {selectedRemains.length > 0 && (
               <div className="mt-6 p-4 rounded-lg" style={{
                 backgroundColor: 'rgba(255, 165, 0, 0.1)',
                 border: '1px solid rgba(255, 165, 0, 0.3)'
               }}>
                 <div className="flex items-center justify-between">
                   <div>
                     <h4 className="text-lg font-semibold text-orange-400">
                       {selectedRemains.length}개 잔여물 선택됨
                     </h4>
                     <p className="text-orange-300">
                       {formatFileSize(getSelectedRemainsSize())} 확보 예상
                     </p>
                   </div>
                   <Button
                     onClick={executeRemainsClean}
                     className="bg-red-600 hover:bg-red-700 text-white"
                   >
                     <Trash2 size={16} />
                     <span className="ml-2">선택 항목 삭제</span>
                   </Button>
                 </div>
               </div>
             )}
           </div>
         )}
       </GlassPanel>

       {/* Cleanup History */}
       <GlassPanel delay={0.6} className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">최근 정리 기록</h3>
        <div className="space-y-3">
          {[
            { date: '2024-01-15', freed: '3.2 GB', files: 1584 },
            { date: '2024-01-10', freed: '1.8 GB', files: 892 },
            { date: '2024-01-05', freed: '4.1 GB', files: 2156 },
          ].map((record, index) => (
            <motion.div
              key={record.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle size={16} className="text-[#00ff88]" />
                <span className="text-sm text-gray-300">{record.date}</span>
              </div>
              <div className="text-right text-xs">
                <div className="text-[#00d4ff]">{record.freed} 확보</div>
                <div className="text-gray-400">{record.files.toLocaleString()} 파일</div>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
};

export default DiskCleaner;
