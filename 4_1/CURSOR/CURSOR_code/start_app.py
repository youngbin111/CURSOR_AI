#!/usr/bin/env python3
"""
CleanBoost 앱 시작 스크립트
"""
import os
import sys
import subprocess
import time
import threading

def check_node_version():
    """Node.js 버전 확인"""
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode != 0:
            print("Node.js가 설치되어 있지 않습니다.")
            print("https://nodejs.org에서 Node.js를 설치해주세요.")
            sys.exit(1)
        print(f"Node.js 버전: {result.stdout.strip()}")
    except FileNotFoundError:
        print("Node.js가 설치되어 있지 않습니다.")
        print("https://nodejs.org에서 Node.js를 설치해주세요.")
        sys.exit(1)

def install_frontend_dependencies():
    """프론트엔드 의존성 설치"""
    try:
        print("프론트엔드 의존성을 설치하고 있습니다...")
        # Windows에서 npm 명령어를 직접 실행
        if os.name == 'nt':  # Windows
            subprocess.run(["cmd", "/c", "npm", "install"], check=True, shell=True)
        else:  # Unix-like systems
            subprocess.run(["npm", "install"], check=True)
        print("프론트엔드 의존성 설치가 완료되었습니다.")
    except subprocess.CalledProcessError as e:
        print(f"프론트엔드 의존성 설치 실패: {e}")
        sys.exit(1)

def start_backend():
    """백엔드 서버 시작"""
    try:
        print("백엔드 서버를 시작합니다...")
        subprocess.run([sys.executable, "start_backend.py"])
    except Exception as e:
        print(f"백엔드 서버 시작 오류: {e}")

def start_frontend():
    """프론트엔드 서버 시작"""
    try:
        print("프론트엔드 서버를 시작합니다...")
        if os.name == 'nt':  # Windows
            subprocess.run(["cmd", "/c", "npm", "start"], shell=True)
        else:  # Unix-like systems
            subprocess.run(["npm", "start"])
    except Exception as e:
        print(f"프론트엔드 서버 시작 오류: {e}")

def start_electron():
    """Electron 앱 시작"""
    try:
        print("Electron 앱을 시작합니다...")
        if os.name == 'nt':  # Windows
            subprocess.run(["cmd", "/c", "npm", "run", "dev:electron"], shell=True)
        else:  # Unix-like systems
            subprocess.run(["npm", "run", "dev:electron"])
    except Exception as e:
        print(f"Electron 앱 시작 오류: {e}")

if __name__ == "__main__":
    print("CleanBoost 앱을 시작합니다...")
    
    # Node.js 버전 확인
    check_node_version()
    
    # 프론트엔드 의존성 설치
    install_frontend_dependencies()
    
    print("\n백엔드와 프론트엔드를 동시에 시작합니다...")
    print("브라우저에서 http://localhost:3000으로 접속하거나")
    print("Electron 앱이 자동으로 시작됩니다.")
    print("\n종료하려면 Ctrl+C를 누르세요.")
    
    try:
        # 백엔드를 별도 스레드에서 시작
        backend_thread = threading.Thread(target=start_backend, daemon=True)
        backend_thread.start()
        
        # 잠시 대기 (백엔드 서버 시작 시간)
        time.sleep(3)
        
        # Electron 앱 시작
        start_electron()
        
    except KeyboardInterrupt:
        print("\n앱을 종료합니다.")
    except Exception as e:
        print(f"앱 시작 오류: {e}")
        sys.exit(1)
