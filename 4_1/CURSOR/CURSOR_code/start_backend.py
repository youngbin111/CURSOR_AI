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
    """필요한 패키지 설치"""
    try:
        print("필요한 패키지를 설치하고 있습니다...")
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"
        ], check=True)
        print("패키지 설치가 완료되었습니다.")
    except subprocess.CalledProcessError as e:
        print(f"패키지 설치 실패: {e}")
        sys.exit(1)

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


