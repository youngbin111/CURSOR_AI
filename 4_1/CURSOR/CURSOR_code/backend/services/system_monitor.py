import asyncio
import psutil
import time
from typing import Dict, Any

class SystemMonitor:
    """시스템 모니터링 서비스"""
    
    def __init__(self):
        self.last_cpu_times = None
        self.last_cpu_time = None
        
    async def get_system_status(self) -> Dict[str, Any]:
        """시스템 상태 정보 수집"""
        try:
            # CPU 사용률 계산
            cpu_percent = await self._get_cpu_usage()
            
            # 메모리 정보
            memory = psutil.virtual_memory()
            ram_percent = memory.percent
            ram_used_gb = memory.used / (1024**3)
            ram_total_gb = memory.total / (1024**3)
            
            # GPU 사용률 (기본값, 실제로는 GPU 라이브러리 필요)
            gpu_percent = await self._get_gpu_usage()
            gpu_used_mb = 0  # GPU 메모리 사용량 (MB)
            gpu_total_mb = 0  # GPU 총 메모리 (MB)
            
            # 디스크 사용률
            disk = psutil.disk_usage('/')
            storage_percent = (disk.used / disk.total) * 100
            storage_used_gb = disk.used / (1024**3)
            storage_total_gb = disk.total / (1024**3)
            
            return {
                'cpu_percent': round(cpu_percent, 1),
                'ram_percent': round(ram_percent, 1),
                'ram_used_gb': round(ram_used_gb, 2),
                'ram_total_gb': round(ram_total_gb, 2),
                'gpu_percent': round(gpu_percent, 1),
                'gpu_used_mb': round(gpu_used_mb, 2),
                'gpu_total_mb': round(gpu_total_mb, 2),
                'storage_percent': round(storage_percent, 1),
                'storage_used_gb': round(storage_used_gb, 2),
                'storage_total_gb': round(storage_total_gb, 2),
                'timestamp': time.time()
            }
            
        except Exception as e:
            print(f"시스템 상태 수집 오류: {e}")
            return {
                'cpu_percent': 0.0,
                'ram_percent': 0.0,
                'ram_used_gb': 0.0,
                'ram_total_gb': 0.0,
                'gpu_percent': 0.0,
                'gpu_used_mb': 0.0,
                'gpu_total_mb': 0.0,
                'storage_percent': 0.0,
                'storage_used_gb': 0.0,
                'storage_total_gb': 0.0,
                'timestamp': time.time()
            }
    
    async def _get_cpu_usage(self) -> float:
        """CPU 사용률 계산 (작업 관리자와 동일한 실시간 방법)"""
        try:
            # 작업 관리자와 동일한 실시간 측정
            # interval=0.1로 짧은 간격 측정하여 정확한 값 얻기
            cpu_percent = psutil.cpu_percent(interval=0.1, percpu=False)
            return cpu_percent
        except Exception:
            return 0.0
    
    async def _get_gpu_usage(self) -> float:
        """GPU 사용률 계산"""
        try:
            # Windows의 경우 nvidia-ml-py 또는 다른 GPU 모니터링 라이브러리 사용
            # 여기서는 기본값 반환
            return 0.0
        except Exception:
            return 0.0
    
    def get_process_info(self) -> Dict[str, Any]:
        """프로세스 정보 수집"""
        try:
            processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    proc_info = proc.info
                    if proc_info['cpu_percent'] > 0.1:  # CPU 사용률이 0.1% 이상인 프로세스만
                        processes.append(proc_info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            # CPU 사용률 기준으로 정렬
            processes.sort(key=lambda x: x['cpu_percent'], reverse=True)
            return processes[:10]  # 상위 10개 프로세스만 반환
            
        except Exception as e:
            print(f"프로세스 정보 수집 오류: {e}")
            return []
    
    def get_network_info(self) -> Dict[str, Any]:
        """네트워크 정보 수집"""
        try:
            net_io = psutil.net_io_counters()
            return {
                'bytes_sent': net_io.bytes_sent,
                'bytes_recv': net_io.bytes_recv,
                'packets_sent': net_io.packets_sent,
                'packets_recv': net_io.packets_recv
            }
        except Exception as e:
            print(f"네트워크 정보 수집 오류: {e}")
            return {}
    
    def get_disk_io_info(self) -> Dict[str, Any]:
        """디스크 I/O 정보 수집"""
        try:
            disk_io = psutil.disk_io_counters()
            return {
                'read_count': disk_io.read_count,
                'write_count': disk_io.write_count,
                'read_bytes': disk_io.read_bytes,
                'write_bytes': disk_io.write_bytes
            }
        except Exception as e:
            print(f"디스크 I/O 정보 수집 오류: {e}")
            return {}
