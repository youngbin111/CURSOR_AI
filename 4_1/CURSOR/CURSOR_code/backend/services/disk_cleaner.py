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
        """시스템 스캔 실행 - 실제 존재하는 파일만 탐색"""
        try:
            print("\n" + "="*60)
            print("📦 찌꺼기 파일 스캔 시작")
            print("="*60)
            
            scan_results = {
                'total_size': 0,
                'items': []
            }
            
            # 대용량 임시 파일 스캔
            print("\n1️⃣ 임시 파일 스캔 중...")
            temp_files = await self._scan_temp_files()
            scan_results['items'].extend(temp_files)
            temp_size = sum(item['size'] for item in temp_files)
            scan_results['total_size'] += temp_size
            print(f"✅ 임시 파일: {len(temp_files)}개 항목, {self._format_size(temp_size)}")
            
            # 프로그램 잔여물 스캔
            print("\n2️⃣ 프로그램 잔여물 스캔 중...")
            program_remains = await self._scan_program_remains()
            scan_results['items'].extend(program_remains)
            program_size = sum(item['size'] for item in program_remains)
            scan_results['total_size'] += program_size
            print(f"✅ 프로그램 잔여물: {len(program_remains)}개 항목, {self._format_size(program_size)}")
            
            # 브라우저 캐시 스캔
            print("\n3️⃣ 브라우저 캐시 스캔 중...")
            browser_cache = await self._scan_browser_cache()
            scan_results['items'].extend(browser_cache)
            browser_size = sum(item['size'] for item in browser_cache)
            scan_results['total_size'] += browser_size
            print(f"✅ 브라우저 캐시: {len(browser_cache)}개 항목, {self._format_size(browser_size)}")
            
            # 휴지통 스캔
            print("\n4️⃣ 휴지통 스캔 중...")
            recycle_bin = await self._scan_recycle_bin()
            scan_results['items'].extend(recycle_bin)
            recycle_size = sum(item['size'] for item in recycle_bin)
            scan_results['total_size'] += recycle_size
            print(f"✅ 휴지통: {len(recycle_bin)}개 항목, {self._format_size(recycle_size)}")
            
            print("\n" + "="*60)
            print(f"🎯 스캔 완료: 총 {len(scan_results['items'])}개 항목, {self._format_size(scan_results['total_size'])} 확보 가능")
            print("="*60 + "\n")
            
            return scan_results
            
        except Exception as e:
            print(f"❌ 시스템 스캔 오류: {e}")
            return {'total_size': 0, 'items': []}
    
    def _format_size(self, bytes_size: int) -> str:
        """파일 크기를 읽기 쉬운 형식으로 포맷"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.2f} {unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.2f} PB"
    
    async def _scan_temp_files(self) -> List[Dict[str, Any]]:
        """임시 파일 스캔 - 실제 존재하는 임시 파일만"""
        temp_items = []
        
        try:
            # 시스템 임시 디렉토리 - 중복 제거
            temp_dirs = set()
            
            # Windows 임시 폴더
            if os.environ.get('TEMP'):
                temp_dirs.add(os.environ.get('TEMP'))
            if os.environ.get('TMP'):
                temp_dirs.add(os.environ.get('TMP'))
            
            # 시스템 임시 디렉토리 추가
            temp_dirs.add(tempfile.gettempdir())
            
            # Windows 시스템 Temp 폴더
            if os.path.exists('C:\\Windows\\Temp'):
                temp_dirs.add('C:\\Windows\\Temp')
            
            print(f"임시 파일 스캔 디렉토리: {temp_dirs}")
            
            for temp_dir in temp_dirs:
                if temp_dir and os.path.exists(temp_dir) and os.path.isdir(temp_dir):
                    print(f"스캔 중: {temp_dir}")
                    items = await self._scan_directory(temp_dir, 'TEMP_FILES')
                    temp_items.extend(items)
                    print(f"{temp_dir}에서 {len(items)}개 파일 발견")
                    
        except Exception as e:
            print(f"임시 파일 스캔 오류: {e}")
            
        return temp_items
    
    async def _scan_program_remains(self) -> List[Dict[str, Any]]:
        """프로그램 잔여물 스캔 - 오래된 임시/캐시 파일만 (30일 이상)"""
        program_items = []
        
        try:
            import time
            
            # 30일 이상 오래된 파일만 스캔
            days_old = 30
            current_time = time.time()
            cutoff_time = current_time - (days_old * 24 * 60 * 60)
            
            # 안전한 스캔 대상 폴더들 - Temp 폴더만!
            safe_scan_paths = []
            
            # 1. Windows Temp 폴더
            windows_temp = 'C:\\Windows\\Temp'
            if os.path.exists(windows_temp):
                safe_scan_paths.append(windows_temp)
            
            # 2. 사용자 Temp 폴더만
            user_temp = os.path.expanduser('~/AppData/Local/Temp')
            if os.path.exists(user_temp):
                safe_scan_paths.append(user_temp)
            
            print(f"프로그램 잔여물 스캔 (30일 이상 오래된 파일만)")
            print(f"스캔 대상 디렉토리: {safe_scan_paths}")
            
            for scan_path in safe_scan_paths:
                if os.path.exists(scan_path) and os.path.isdir(scan_path):
                    print(f"스캔 중: {scan_path}")
                    items = await self._scan_directory_with_age_filter(
                        scan_path, 
                        'PROGRAM_REMAINS',
                        cutoff_time
                    )
                    program_items.extend(items)
                    print(f"{scan_path}에서 {len(items)}개 오래된 파일 발견")
                    
        except Exception as e:
            print(f"프로그램 잔여물 스캔 오류: {e}")
            
        return program_items
    
    async def _scan_browser_cache(self) -> List[Dict[str, Any]]:
        """브라우저 캐시 스캔 - 7일 이상 오래된 캐시만"""
        cache_items = []
        
        try:
            import time
            
            # 7일 이상 오래된 캐시만 스캔
            days_old = 7
            current_time = time.time()
            cutoff_time = current_time - (days_old * 24 * 60 * 60)
            
            # 브라우저 캐시 디렉토리들
            browser_cache_paths = [
                {
                    'name': 'Chrome',
                    'paths': [
                        os.path.expanduser('~/AppData/Local/Google/Chrome/User Data/Default/Cache'),
                        os.path.expanduser('~/AppData/Local/Google/Chrome/User Data/Default/Code Cache')
                    ]
                },
                {
                    'name': 'Edge',
                    'paths': [
                        os.path.expanduser('~/AppData/Local/Microsoft/Edge/User Data/Default/Cache'),
                        os.path.expanduser('~/AppData/Local/Microsoft/Edge/User Data/Default/Code Cache')
                    ]
                },
                {
                    'name': 'Firefox',
                    'paths': [
                        os.path.expanduser('~/AppData/Local/Mozilla/Firefox/Profiles')
                    ]
                }
            ]
            
            print(f"브라우저 캐시 스캔 (7일 이상 오래된 파일만)")
            
            scanned_browsers = []
            for browser in browser_cache_paths:
                for cache_path in browser['paths']:
                    if os.path.exists(cache_path) and os.path.isdir(cache_path):
                        if browser['name'] not in scanned_browsers:
                            scanned_browsers.append(browser['name'])
                        print(f"{browser['name']} 캐시 스캔 중: {cache_path}")
                        items = await self._scan_directory_with_age_filter(
                            cache_path, 
                            'BROWSER_CACHE',
                            cutoff_time
                        )
                        cache_items.extend(items)
                        print(f"{cache_path}에서 {len(items)}개 오래된 파일 발견")
            
            if scanned_browsers:
                print(f"브라우저 캐시 스캔 완료: {', '.join(scanned_browsers)}")
            else:
                print("설치된 브라우저를 찾을 수 없습니다.")
                    
        except Exception as e:
            print(f"브라우저 캐시 스캔 오류: {e}")
            
        return cache_items
    
    async def _scan_recycle_bin(self) -> List[Dict[str, Any]]:
        """휴지통 스캔 - 실제 존재하는 드라이브만"""
        recycle_items = []
        
        try:
            # 모든 드라이브의 휴지통 검색
            import string
            scanned_drives = []
            
            for drive_letter in string.ascii_uppercase:
                recycle_path = f'{drive_letter}:\\$Recycle.Bin'
                if os.path.exists(recycle_path):
                    scanned_drives.append(drive_letter)
                    print(f"{drive_letter}: 드라이브 휴지통 스캔 중: {recycle_path}")
                    items = await self._scan_directory(recycle_path, 'RECYCLE_BIN')
                    recycle_items.extend(items)
                    print(f"{recycle_path}에서 {len(items)}개 파일 발견")
            
            if scanned_drives:
                print(f"휴지통 스캔 완료: {', '.join(scanned_drives)} 드라이브")
            else:
                print("휴지통에서 파일을 찾을 수 없습니다.")
                    
        except Exception as e:
            print(f"휴지통 스캔 오류: {e}")
            
        return recycle_items
    
    async def _scan_directory(self, directory: str, item_type: str) -> List[Dict[str, Any]]:
        """디렉토리 스캔 - 실제 존재하는 파일만"""
        items = []
        scanned_count = 0
        skipped_count = 0
        
        try:
            # 디렉토리 깊이 제한 (성능 향상)
            max_depth = 3
            dir_depth = directory.count(os.sep)
            
            for root, dirs, files in os.walk(directory):
                # 깊이 제한 체크
                current_depth = root.count(os.sep) - dir_depth
                if current_depth > max_depth:
                    dirs.clear()  # 더 깊이 들어가지 않음
                    continue
                
                for file in files:
                    try:
                        file_path = os.path.join(root, file)
                        
                        # 파일 존재 여부 확인
                        if not os.path.isfile(file_path):
                            continue
                        
                        file_size = os.path.getsize(file_path)
                        scanned_count += 1
                        
                        # 최소 크기 필터링 (1MB 이상 - 안전하게)
                        if file_size > 1024 * 1024:  # 1MB
                            items.append({
                                'type': item_type,
                                'name': file,
                                'path': file_path,
                                'size': file_size,
                                'safe_to_delete': True
                            })
                        else:
                            skipped_count += 1
                            
                    except (OSError, PermissionError) as e:
                        # 권한 없는 파일은 조용히 스킵
                        continue
                    except Exception as e:
                        # 기타 오류도 조용히 스킵
                        continue
            
            if scanned_count > 0:
                print(f"  → {scanned_count}개 파일 스캔 완료, {len(items)}개 항목 추가 (1MB 이상), {skipped_count}개 스킵")
                        
        except Exception as e:
            print(f"디렉토리 스캔 오류 {directory}: {e}")
            
        return items
    
    async def _scan_directory_with_age_filter(self, directory: str, item_type: str, cutoff_time: float) -> List[Dict[str, Any]]:
        """디렉토리 스캔 - 마지막 수정 시각 필터링 적용"""
        items = []
        scanned_count = 0
        skipped_by_size = 0
        skipped_by_age = 0
        
        try:
            import time
            from datetime import datetime
            
            # 디렉토리 깊이 제한
            max_depth = 3
            dir_depth = directory.count(os.sep)
            
            for root, dirs, files in os.walk(directory):
                # 깊이 제한 체크
                current_depth = root.count(os.sep) - dir_depth
                if current_depth > max_depth:
                    dirs.clear()
                    continue
                
                for file in files:
                    try:
                        file_path = os.path.join(root, file)
                        
                        # 파일 존재 여부 확인
                        if not os.path.isfile(file_path):
                            continue
                        
                        # 파일 정보 가져오기
                        file_stat = os.stat(file_path)
                        file_size = file_stat.st_size
                        file_mtime = file_stat.st_mtime
                        
                        scanned_count += 1
                        
                        # 최소 크기 필터링 (1MB 이상)
                        if file_size < 1024 * 1024:  # 1MB
                            skipped_by_size += 1
                            continue
                        
                        # 마지막 수정 시각 필터링 (30일 이상 된 파일만)
                        if file_mtime > cutoff_time:
                            skipped_by_age += 1
                            continue
                        
                        # 마지막 수정 날짜 계산
                        days_old = int((time.time() - file_mtime) / (24 * 60 * 60))
                        
                        items.append({
                            'type': item_type,
                            'name': file,
                            'path': file_path,
                            'size': file_size,
                            'safe_to_delete': True,
                            'days_old': days_old,
                            'last_modified': datetime.fromtimestamp(file_mtime).strftime('%Y-%m-%d')
                        })
                            
                    except (OSError, PermissionError):
                        continue
                    except Exception:
                        continue
            
            if scanned_count > 0:
                print(f"  → {scanned_count}개 파일 스캔, {len(items)}개 항목 추가 (1MB 이상 & 30일 이상)")
                print(f"     스킵: 크기 {skipped_by_size}개, 최근 수정 {skipped_by_age}개")
                        
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

