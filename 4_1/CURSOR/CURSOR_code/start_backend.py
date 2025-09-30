#!/usr/bin/env python3
"""
CleanBoost Backend Server 시작 스크립트
"""
import os
import sys
import subprocess
import time

def check_python_version():
    """Python 버전 확인"""
    if sys.version_info < (3, 8):
        print("Python 3.8 이상이 필요합니다.")
        sys.exit(1)

def install_requirements():
    """필요한 패키지 설치 (이미 설치된 경우 건너뛰기)"""
    try:
        # 먼저 패키지가 이미 설치되어 있는지 확인
        print("패키지 설치 상태를 확인하고 있습니다...")
        result = subprocess.run([
            sys.executable, "-m", "pip", "check"
        ], capture_output=True, text=True)
        
        # requirements.txt의 패키지들이 설치되어 있는지 확인
        with open("backend/requirements.txt", "r") as f:
            requirements = f.read().strip().split('\n')
        
        missing_packages = []
        for req in requirements:
            if req.strip() and not req.startswith('#'):
                package_name = req.split('>=')[0].split('==')[0].split('[')[0]
                try:
                    subprocess.run([
                        sys.executable, "-c", f"import {package_name.replace('-', '_')}"
                    ], check=True, capture_output=True)
                except subprocess.CalledProcessError:
                    missing_packages.append(req)
        
        if missing_packages:
            print(f"누락된 패키지 {len(missing_packages)}개를 설치하고 있습니다...")
            subprocess.run([
                sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"
            ], check=True)
            print("패키지 설치가 완료되었습니다.")
        else:
            print("모든 패키지가 이미 설치되어 있습니다.")
            
    except subprocess.CalledProcessError as e:
        print(f"패키지 설치 실패: {e}")
        print("수동으로 패키지를 설치해주세요: pip install -r backend/requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"패키지 확인 중 오류: {e}")
        print("패키지 설치를 건너뛰고 서버를 시작합니다...")

def start_server():
    """백엔드 서버 시작"""
    try:
        print("CleanBoost 백엔드 서버를 시작합니다...")
        print("서버 주소: http://localhost:8000")
        print("API 문서: http://localhost:8000/docs")
        print("종료하려면 Ctrl+C를 누르세요.")
        
        # 백엔드 디렉토리로 이동
        os.chdir("backend")
        
        # 서버 시작
        subprocess.run([
            sys.executable, "main.py"
        ])
        
    except KeyboardInterrupt:
        print("\n서버를 종료합니다.")
    except Exception as e:
        print(f"서버 시작 오류: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check_python_version()
    install_requirements()
    start_server()


