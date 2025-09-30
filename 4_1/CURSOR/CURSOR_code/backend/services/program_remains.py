import os
import subprocess
import winreg
from pathlib import Path
from typing import List, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)

class ProgramRemainsService:
    """프로그램 잔여물 검색 및 정리 서비스"""
    
    def __init__(self):
        self.appdata_paths = [
            os.path.expanduser("~\\AppData\\Local"),
            os.path.expanduser("~\\AppData\\Roaming"),
            os.path.expanduser("~\\AppData\\LocalLow")
        ]
        
        # 주요 레지스트리 경로
        self.registry_paths = [
            (winreg.HKEY_CURRENT_USER, "Software"),
            (winreg.HKEY_LOCAL_MACHINE, "Software"),
            (winreg.HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall"),
            (winreg.HKEY_LOCAL_MACHINE, "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall")
        ]
    
    async def search_program_remains(self, program_name: str) -> Dict[str, Any]:
        """프로그램 잔여물 검색"""
        try:
            logger.info(f"프로그램 잔여물 검색 시작: {program_name}")
            
            # 더미 데이터 제거 - 실제 검색만 수행
            
            # 실제 검색 로직
            logger.info("AppData 폴더 검색 시작...")
            appdata_items = await self._search_appdata_remains(program_name)
            logger.info(f"AppData 검색 결과: {len(appdata_items)}개 항목")
            
            # 레지스트리 검색
            logger.info("레지스트리 검색 시작...")
            registry_items = await self._search_registry_remains(program_name)
            logger.info(f"레지스트리 검색 결과: {len(registry_items)}개 항목")
            
            # 총 크기 계산
            total_size = sum(item.get('size', 0) for item in appdata_items + registry_items)
            
            result = {
                "program_name": program_name,
                "appdata_items": appdata_items,
                "registry_items": registry_items,
                "total_size": total_size
            }
            
            logger.info(f"검색 완료: 총 {len(appdata_items + registry_items)}개 항목, {total_size} bytes")
            return result
            
        except Exception as e:
            logger.error(f"프로그램 잔여물 검색 실패: {e}")
            # 빈 결과 반환하여 프론트엔드에서 오류 처리 가능하도록
            return {
                "program_name": program_name,
                "appdata_items": [],
                "registry_items": [],
                "total_size": 0,
                "error": str(e)
            }
    
    async def _search_appdata_remains(self, program_name: str) -> List[Dict[str, Any]]:
        """AppData 폴더에서 프로그램 잔여물 검색"""
        items = []
        
        # 더 유연한 검색을 위한 키워드 변형
        search_keywords = [
            program_name.lower(),
            program_name.lower().replace(' ', ''),
            program_name.lower().replace(' ', '-'),
            program_name.lower().replace(' ', '_'),
        ]
        
        # 일반적인 프로그램 이름 변형 추가
        # 부분 매칭을 위한 키워드 확장
        if len(program_name) > 3:  # 3글자 이상인 경우에만 부분 매칭
            # 첫 3글자로 시작하는 키워드
            search_keywords.append(program_name.lower()[:3])
            # 마지막 3글자로 끝나는 키워드
            search_keywords.append(program_name.lower()[-3:])
        
        # 특정 프로그램에 대한 추가 키워드
        if program_name.lower() in ['visualstudio', 'visual studio', 'vs']:
            search_keywords.extend(['microsoft visual studio', 'microsoft', 'visualstudio', 'vs'])
        elif program_name.lower() in ['cursor']:
            search_keywords.extend(['cursor', 'cursor-ai', 'cursorai'])
        elif program_name.lower() in ['chrome']:
            search_keywords.extend(['google chrome', 'chrome', 'google'])
        elif program_name.lower() in ['firefox']:
            search_keywords.extend(['mozilla firefox', 'firefox', 'mozilla'])
        elif program_name.lower() in ['notepad']:
            search_keywords.extend(['notepad++', 'notepad', 'notepad.exe'])
        elif program_name.lower() in ['calculator']:
            search_keywords.extend(['calc', 'calculator', 'windows calculator'])
        elif program_name.lower() in ['paint']:
            search_keywords.extend(['mspaint', 'paint', 'microsoft paint'])
        # 개발 도구 특화 키워드
        elif program_name.lower() in ['node', 'nodejs']:
            search_keywords.extend(['nodejs', 'node', 'npm', 'nvm', 'npx'])
        elif program_name.lower() in ['python']:
            search_keywords.extend(['python', 'pip', 'conda', 'anaconda', 'py'])
        elif program_name.lower() in ['java']:
            search_keywords.extend(['java', 'jdk', 'jre', 'maven', 'gradle'])
        elif program_name.lower() in ['git']:
            search_keywords.extend(['git', 'github', 'gitlab', 'gitkraken'])
        elif program_name.lower() in ['docker']:
            search_keywords.extend(['docker', 'docker desktop', 'docker desktop'])
        elif program_name.lower() in ['mysql']:
            search_keywords.extend(['mysql', 'mariadb', 'mysql workbench'])
        elif program_name.lower() in ['postgresql', 'postgres']:
            search_keywords.extend(['postgresql', 'postgres', 'pgadmin'])
        
        for appdata_path in self.appdata_paths:
            if not os.path.exists(appdata_path):
                logger.warning(f"AppData 경로가 존재하지 않음: {appdata_path}")
                continue
                
            try:
                logger.info(f"AppData 폴더 검색 중: {appdata_path}")
                # 폴더명에 프로그램 이름이 포함된 항목 검색
                for item in os.listdir(appdata_path):
                    item_lower = item.lower()
                    
                    # 키워드 중 하나라도 포함되면 검색 결과에 추가
                    if any(keyword in item_lower for keyword in search_keywords if keyword):
                        item_path = os.path.join(appdata_path, item)
                        
                        if os.path.isdir(item_path):
                            try:
                                size = await self._get_directory_size(item_path)
                                items.append({
                                    "name": item,
                                    "path": item_path,
                                    "size": size,
                                    "type": "folder"
                                })
                                logger.info(f"폴더 발견: {item} ({size} bytes)")
                            except Exception as e:
                                logger.warning(f"폴더 크기 계산 실패: {item_path} - {e}")
                        elif os.path.isfile(item_path):
                            try:
                                size = os.path.getsize(item_path)
                                items.append({
                                    "name": item,
                                    "path": item_path,
                                    "size": size,
                                    "type": "file"
                                })
                                logger.info(f"파일 발견: {item} ({size} bytes)")
                            except Exception as e:
                                logger.warning(f"파일 크기 계산 실패: {item_path} - {e}")
                            
            except PermissionError:
                logger.warning(f"AppData 폴더 접근 권한 없음: {appdata_path}")
                continue
            except Exception as e:
                logger.warning(f"AppData 폴더 검색 오류: {e}")
                continue
        
        logger.info(f"AppData 검색 완료: {len(items)}개 항목 발견")
        return items
    
    async def _search_registry_remains(self, program_name: str) -> List[Dict[str, Any]]:
        """레지스트리에서 프로그램 잔여물 검색"""
        items = []
        
        # 더 유연한 검색을 위한 키워드 변형
        search_keywords = [
            program_name.lower(),
            program_name.lower().replace(' ', ''),
            program_name.lower().replace(' ', '-'),
            program_name.lower().replace(' ', '_'),
        ]
        
        # 특정 프로그램에 대한 추가 키워드
        if program_name.lower() in ['visualstudio', 'visual studio', 'vs']:
            search_keywords.extend(['microsoft visual studio', 'microsoft', 'visualstudio', 'vs'])
        elif program_name.lower() in ['cursor']:
            search_keywords.extend(['cursor', 'cursor-ai', 'cursorai'])
        elif program_name.lower() in ['chrome']:
            search_keywords.extend(['google chrome', 'chrome', 'google'])
        elif program_name.lower() in ['firefox']:
            search_keywords.extend(['mozilla firefox', 'firefox', 'mozilla'])
        
        for hkey, subkey in self.registry_paths:
            try:
                logger.info(f"레지스트리 검색 중: {hkey}\\{subkey}")
                with winreg.OpenKey(hkey, subkey) as key:
                    # 하위 키 검색
                    for i in range(winreg.QueryInfoKey(key)[0]):
                        try:
                            subkey_name = winreg.EnumKey(key, i)
                            subkey_lower = subkey_name.lower()
                            
                            # 키워드 중 하나라도 포함되면 검색 결과에 추가
                            if any(keyword in subkey_lower for keyword in search_keywords if keyword):
                                full_path = f"{hkey}\\{subkey}\\{subkey_name}"
                                items.append({
                                    "name": subkey_name,
                                    "path": full_path,
                                    "size": 0,  # 레지스트리 키는 크기가 없음
                                    "type": "registry_key"
                                })
                                logger.info(f"레지스트리 키 발견: {subkey_name}")
                        except OSError as e:
                            logger.warning(f"레지스트리 키 열기 실패: {subkey_name} - {e}")
                            continue
                            
            except PermissionError:
                logger.warning(f"레지스트리 접근 권한 없음: {hkey}\\{subkey}")
                continue
            except Exception as e:
                logger.warning(f"레지스트리 검색 오류: {e}")
                continue
        
        logger.info(f"레지스트리 검색 완료: {len(items)}개 항목 발견")
        return items
    
    async def _get_directory_size(self, directory: str) -> int:
        """디렉토리 크기 계산"""
        total_size = 0
        try:
            for dirpath, dirnames, filenames in os.walk(directory):
                for filename in filenames:
                    try:
                        filepath = os.path.join(dirpath, filename)
                        total_size += os.path.getsize(filepath)
                    except (OSError, IOError):
                        continue
        except Exception as e:
            logger.warning(f"디렉토리 크기 계산 오류: {e}")
        
        return total_size
    
    async def clean_remains(self, items_to_delete: List[Dict[str, Any]]) -> Dict[str, Any]:
        """잔여물 정리 실행"""
        deleted_count = 0
        error_count = 0
        total_cleaned_size = 0
        
        for item in items_to_delete:
            try:
                item_type = item.get('type', '')
                item_path = item.get('path', '')
                item_size = item.get('size', 0)
                
                if item_type == 'folder':
                    # 폴더 삭제
                    await self._delete_directory(item_path)
                    deleted_count += 1
                    total_cleaned_size += item_size
                    
                elif item_type == 'file':
                    # 파일 삭제
                    os.remove(item_path)
                    deleted_count += 1
                    total_cleaned_size += item_size
                    
                elif item_type == 'registry_key':
                    # 레지스트리 키 삭제 (주의: 관리자 권한 필요)
                    await self._delete_registry_key(item_path)
                    deleted_count += 1
                    
            except Exception as e:
                logger.error(f"잔여물 삭제 실패: {item_path} - {e}")
                error_count += 1
        
        return {
            "deleted_count": deleted_count,
            "error_count": error_count,
            "total_cleaned_size": total_cleaned_size
        }
    
    async def _delete_directory(self, directory_path: str):
        """디렉토리 재귀적 삭제"""
        import shutil
        shutil.rmtree(directory_path)
    
    async def _delete_registry_key(self, registry_path: str):
        """레지스트리 키 삭제"""
        # 레지스트리 경로 파싱
        parts = registry_path.split('\\')
        if len(parts) < 3:
            raise ValueError("잘못된 레지스트리 경로")
        
        # HKEY 매핑
        hkey_map = {
            "HKEY_CURRENT_USER": winreg.HKEY_CURRENT_USER,
            "HKEY_LOCAL_MACHINE": winreg.HKEY_LOCAL_MACHINE,
            "HKEY_USERS": winreg.HKEY_USERS,
            "HKEY_CLASSES_ROOT": winreg.HKEY_CLASSES_ROOT
        }
        
        hkey_name = parts[0]
        if hkey_name not in hkey_map:
            raise ValueError(f"지원하지 않는 레지스트리 루트: {hkey_name}")
        
        hkey = hkey_map[hkey_name]
        subkey = '\\'.join(parts[1:])
        
        # 레지스트리 키 삭제
        try:
            winreg.DeleteKey(hkey, subkey)
        except FileNotFoundError:
            # 키가 이미 삭제됨
            pass
        except PermissionError:
            # 관리자 권한 필요
            logger.warning(f"레지스트리 키 삭제 권한 없음: {registry_path}")
            raise
