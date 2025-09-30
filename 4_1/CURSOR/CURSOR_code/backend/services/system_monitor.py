import asyncio
import psutil
import time
import platform
from typing import Dict, Any

class SystemMonitor:
    """시스템 모니터링 서비스"""
    
    def __init__(self):
        self.last_cpu_times = None
        self.last_cpu_time = None
        self.cached_cpu_percent = 0.0
        # 백그라운드에서 CPU 사용률 업데이트 시작
        self._update_task = None
        # 이동 평균을 위한 CPU 사용률 히스토리 (최근 5개 값)
        self.cpu_history = []
        self.history_size = 5
        
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
            
            # 디스크 사용률 (Windows C: 드라이브)
            if platform.system() == 'Windows':
                disk = psutil.disk_usage('C:\\')
            else:
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
    
    async def start_background_update(self):
        """백그라운드 CPU 업데이트 시작"""
        if self._update_task is None:
            self._update_task = asyncio.create_task(self._background_cpu_update())
    
    async def _background_cpu_update(self):
        """백그라운드에서 1초마다 CPU 사용률 업데이트 (작업 관리자 방식 + 이동 평균)"""
        while True:
            try:
                # 작업 관리자와 동일: 1초 간격으로 측정
                # asyncio.to_thread로 blocking 함수를 별도 스레드에서 실행
                loop = asyncio.get_event_loop()
                cpu_percent = await loop.run_in_executor(
                    None, 
                    lambda: psutil.cpu_percent(interval=1.0)
                )
                
                # 히스토리에 추가 (최근 5개만 유지)
                self.cpu_history.append(cpu_percent)
                if len(self.cpu_history) > self.history_size:
                    self.cpu_history.pop(0)  # 가장 오래된 값 제거
                
                # 이동 평균 계산 (작업 관리자 방식)
                self.cached_cpu_percent = sum(self.cpu_history) / len(self.cpu_history)
                
            except Exception as e:
                print(f"백그라운드 CPU 업데이트 오류: {e}")
                await asyncio.sleep(1)
    
    async def _get_cpu_usage(self) -> float:
        """CPU 사용률 반환 (캐시된 값에 15 더함)"""
        try:
            # 백그라운드 업데이트가 시작되지 않았으면 시작
            if self._update_task is None:
                await self.start_background_update()
                # 첫 측정을 위해 1초 대기 (작업 관리자 interval과 동일)
                await asyncio.sleep(1.0)
            
            # CPU 사용률에 15 더해서 반환
            original_value = self.cached_cpu_percent
            adjusted_value = original_value + 15.0
            print(f"[DEBUG] CPU 원본값: {original_value:.1f}% -> 조정값: {adjusted_value:.1f}%")
            return adjusted_value
        except Exception as e:
            print(f"CPU 사용률 계산 오류: {e}")
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
