import os
import shutil
import tempfile
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional
import psutil

class DiskCleaner:
    """디스크 정리 서비스"""
    
    def __init__(self):
        self.safe_paths = {
            'temp': [
                os.environ.get('TEMP', ''),
                os.environ.get('TMP', ''),
                '/tmp',
                '/var/tmp',
                'C:\\Windows\\Temp',
                'C:\\Users\\{username}\\AppData\\Local\\Temp'
            ],
            'cache': [
                'C:\\Users\\{username}\\AppData\\Local\\Microsoft\\Windows\\INetCache',
                'C:\\Users\\{username}\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache',
                'C:\\Users\\{username}\\AppData\\Local\\Mozilla\\Firefox\\Profiles',
                'C:\\Users\\{username}\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache'
            ],
            'logs': [
                'C:\\Windows\\Logs',
                'C:\\Users\\{username}\\AppData\\Local\\Temp'
            ]
        }
        
        self.unsafe_paths = [
            'C:\\Windows\\System32',
            'C:\\Program Files',
            'C:\\Program Files (x86)',
            'C:\\Users\\{username}\\Documents',
            'C:\\Users\\{username}\\Desktop',
            'C:\\Users\\{username}\\Pictures',
            'C:\\Users\\{username}\\Videos',
            'C:\\Users\\{username}\\Music'
        ]
    
    async def scan_system(self) -> Dict[str, Any]:
        """시스템 스캔 실행"""
        try:
            scan_results = {
                'total_size': 0,
                'items': []
            }
            
            # 대용량 임시 파일 스캔
            temp_files = await self._scan_temp_files()
            scan_results['items'].extend(temp_files)
            scan_results['total_size'] += sum(item['size'] for item in temp_files)
            
            # 프로그램 잔여물 스캔
            program_remains = await self._scan_program_remains()
            scan_results['items'].extend(program_remains)
            scan_results['total_size'] += sum(item['size'] for item in program_remains)
            
            # 브라우저 캐시 스캔
            browser_cache = await self._scan_browser_cache()
            scan_results['items'].extend(browser_cache)
            scan_results['total_size'] += sum(item['size'] for item in browser_cache)
            
            # 휴지통 스캔
            recycle_bin = await self._scan_recycle_bin()
            scan_results['items'].extend(recycle_bin)
            scan_results['total_size'] += sum(item['size'] for item in recycle_bin)
            
            return scan_results
            
        except Exception as e:
            print(f"시스템 스캔 오류: {e}")
            return {'total_size': 0, 'items': []}
    
    async def _scan_temp_files(self) -> List[Dict[str, Any]]:
        """임시 파일 스캔"""
        temp_items = []
        
        try:
            # 시스템 임시 디렉토리
            temp_dirs = [
                os.environ.get('TEMP', ''),
                os.environ.get('TMP', ''),
                tempfile.gettempdir()
            ]
            
            for temp_dir in temp_dirs:
                if temp_dir and os.path.exists(temp_dir):
                    items = await self._scan_directory(temp_dir, 'TEMP_FILES')
                    temp_items.extend(items)
                    
        except Exception as e:
            print(f"임시 파일 스캔 오류: {e}")
            
        return temp_items
    
    async def _scan_program_remains(self) -> List[Dict[str, Any]]:
        """프로그램 잔여물 스캔"""
        program_items = []
        
        try:
            # AppData 디렉토리들
            appdata_dirs = [
                os.path.expanduser('~/AppData/Local'),
                os.path.expanduser('~/AppData/Roaming')
            ]
            
            for appdata_dir in appdata_dirs:
                if os.path.exists(appdata_dir):
                    items = await self._scan_directory(appdata_dir, 'PROGRAM_REMAINS')
                    program_items.extend(items)
                    
        except Exception as e:
            print(f"프로그램 잔여물 스캔 오류: {e}")
            
        return program_items
    
    async def _scan_browser_cache(self) -> List[Dict[str, Any]]:
        """브라우저 캐시 스캔"""
        cache_items = []
        
        try:
            # 브라우저 캐시 디렉토리들
            cache_dirs = [
                os.path.expanduser('~/AppData/Local/Google/Chrome/User Data/Default/Cache'),
                os.path.expanduser('~/AppData/Local/Mozilla/Firefox/Profiles'),
                os.path.expanduser('~/AppData/Local/Microsoft/Edge/User Data/Default/Cache')
            ]
            
            for cache_dir in cache_dirs:
                if os.path.exists(cache_dir):
                    items = await self._scan_directory(cache_dir, 'BROWSER_CACHE')
                    cache_items.extend(items)
                    
        except Exception as e:
            print(f"브라우저 캐시 스캔 오류: {e}")
            
        return cache_items
    
    async def _scan_recycle_bin(self) -> List[Dict[str, Any]]:
        """휴지통 스캔"""
        recycle_items = []
        
        try:
            # Windows 휴지통 경로
            recycle_paths = [
                'C:\\$Recycle.Bin',
                'D:\\$Recycle.Bin'
            ]
            
            for recycle_path in recycle_paths:
                if os.path.exists(recycle_path):
                    items = await self._scan_directory(recycle_path, 'RECYCLE_BIN')
                    recycle_items.extend(items)
                    
        except Exception as e:
            print(f"휴지통 스캔 오류: {e}")
            
        return recycle_items
    
    async def _scan_directory(self, directory: str, item_type: str) -> List[Dict[str, Any]]:
        """디렉토리 스캔"""
        items = []
        
        try:
            for root, dirs, files in os.walk(directory):
                for file in files:
                    try:
                        file_path = os.path.join(root, file)
                        file_size = os.path.getsize(file_path)
                        
                        # 최소 크기 필터링 (1MB 이상)
                        if file_size > 1024 * 1024:
                            items.append({
                                'type': item_type,
                                'name': file,
                                'path': file_path,
                                'size': file_size,
                                'safe_to_delete': True
                            })
                            
                    except (OSError, PermissionError):
                        continue
                        
        except Exception as e:
            print(f"디렉토리 스캔 오류 {directory}: {e}")
            
        return items
    
    def validate_clean_paths(self, items: List[Dict[str, Any]]) -> bool:
        """정리 경로 안전성 검증"""
        try:
            for item in items:
                path = item.get('path', '')
                
                # 절대 경로인지 확인
                if not os.path.isabs(path):
                    return False
                
                # 안전하지 않은 경로 체크
                for unsafe_path in self.unsafe_paths:
                    if unsafe_path.replace('{username}', os.getenv('USERNAME', '')).lower() in path.lower():
                        return False
                
                # 파일 존재 여부 확인
                if not os.path.exists(path):
                    return False
                    
            return True
            
        except Exception as e:
            print(f"경로 검증 오류: {e}")
            return False
    
    async def execute_clean(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """정리 실행"""
        result = {
            'total_size': 0,
            'deleted_count': 0,
            'error_count': 0
        }
        
        try:
            for item in items:
                try:
                    path = item.get('path', '')
                    size = item.get('size', 0)
                    
                    if os.path.exists(path):
                        # 파일 삭제
                        if os.path.isfile(path):
                            os.remove(path)
                        elif os.path.isdir(path):
                            shutil.rmtree(path)
                        
                        result['deleted_count'] += 1
                        result['total_size'] += size
                        
                except Exception as e:
                    print(f"파일 삭제 오류 {item.get('path', '')}: {e}")
                    result['error_count'] += 1
                    
        except Exception as e:
            print(f"정리 실행 오류: {e}")
            
        return result
    
    def get_disk_usage(self) -> Dict[str, Any]:
        """디스크 사용량 정보"""
        try:
            disk_usage = psutil.disk_usage('/')
            return {
                'total': disk_usage.total,
                'used': disk_usage.used,
                'free': disk_usage.free,
                'percent': (disk_usage.used / disk_usage.total) * 100
            }
        except Exception as e:
            print(f"디스크 사용량 정보 오류: {e}")
            return {}
    
    def get_large_files(self, min_size_mb: int = 100) -> List[Dict[str, Any]]:
        """대용량 파일 찾기"""
        large_files = []
        
        try:
            # 주요 디렉토리들
            search_dirs = [
                os.path.expanduser('~'),
                'C:\\',
                'D:\\'
            ]
            
            for search_dir in search_dirs:
                if os.path.exists(search_dir):
                    for root, dirs, files in os.walk(search_dir):
                        for file in files:
                            try:
                                file_path = os.path.join(root, file)
                                file_size = os.path.getsize(file_path)
                                
                                if file_size > min_size_mb * 1024 * 1024:
                                    large_files.append({
                                        'path': file_path,
                                        'size': file_size,
                                        'name': file
                                    })
                                    
                            except (OSError, PermissionError):
                                continue
                                
        except Exception as e:
            print(f"대용량 파일 검색 오류: {e}")
            
        return large_files

