import asyncio
import os
import sys
import time
import uuid
from typing import Dict, List, Optional
from pathlib import Path

import psutil
import socketio
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import uvicorn

# 현재 디렉토리를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.system_monitor import SystemMonitor
from services.disk_cleaner import DiskCleaner
from services.auth import AuthService
from models.schemas import (
    ScanRequest, ScanResponse, CleanRequest, CleanResponse,
    SystemStatus, WarningTrigger
)

# FastAPI 앱 초기화
app = FastAPI(
    title="CleanBoost API",
    description="PC 성능 모니터링 및 디스크 정리 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 오리진 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SocketIO 서버 초기화
sio = socketio.AsyncServer(
    cors_allowed_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    logger=True,
    engineio_logger=True
)

# 서비스 초기화
system_monitor = SystemMonitor()
disk_cleaner = DiskCleaner()
auth_service = AuthService()

# 인증 스키마
security = HTTPBearer()

# 전역 상태
monitoring_active = False
active_connections = set()
scan_results_cache = {}

# 인증 의존성
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if not auth_service.verify_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 인증 토큰"
        )
    return token

# SocketIO 이벤트 핸들러
@sio.event
async def connect(sid, environ):
    """클라이언트 연결 시"""
    print(f"클라이언트 연결됨: {sid}")
    active_connections.add(sid)
    await sio.emit('connected', {'message': 'CleanBoost 서버에 연결되었습니다.'}, room=sid)

@sio.event
async def disconnect(sid):
    """클라이언트 연결 해제 시"""
    print(f"클라이언트 연결 해제됨: {sid}")
    active_connections.discard(sid)

@sio.event
async def monitor_toggle(sid, data):
    """모니터링 시작/중지"""
    global monitoring_active
    monitoring_active = data.get('active', False)
    print(f"모니터링 상태 변경: {monitoring_active}")
    
    if monitoring_active:
        await sio.emit('monitoring_started', {'message': '실시간 모니터링이 시작되었습니다.'}, room=sid)
        # 모니터링 루프 시작
        asyncio.create_task(monitoring_loop())
    else:
        await sio.emit('monitoring_stopped', {'message': '실시간 모니터링이 중지되었습니다.'}, room=sid)

@sio.event
async def ping(sid, data):
    """핑 요청 처리"""
    await sio.emit('pong', {'timestamp': data.get('timestamp', time.time())}, room=sid)

# 모니터링 루프
async def monitoring_loop():
    """실시간 시스템 모니터링 루프"""
    global monitoring_active
    
    while monitoring_active and active_connections:
        try:
            # 시스템 데이터 수집
            system_data = await system_monitor.get_system_status()
            
            # 모든 연결된 클라이언트에게 데이터 전송
            if active_connections:
                await sio.emit('system_status', system_data)
                
                # 경고 체크
                if system_data['cpu_percent'] > 90:
                    warning = WarningTrigger(
                        type="CPU_OVERLOAD",
                        message="CPU 사용량이 90%를 초과했습니다!"
                    )
                    await sio.emit('warning_trigger', warning.dict())
                    
        except Exception as e:
            print(f"모니터링 루프 오류: {e}")
            
        await asyncio.sleep(1)  # 1초 간격

# REST API 엔드포인트
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {"message": "CleanBoost API 서버가 실행 중입니다."}

@app.get("/api/v1/system/status")
async def get_system_status():
    """시스템 상태 조회"""
    try:
        system_data = await system_monitor.get_system_status()
        return system_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"시스템 상태 조회 실패: {str(e)}"
        )

@app.post("/api/v1/scan/start", response_model=ScanResponse)
async def start_scan(current_user: str = Depends(get_current_user)):
    """잔여물 스캔 시작"""
    try:
        scan_id = str(uuid.uuid4())
        
        # 스캔 작업을 백그라운드에서 실행
        asyncio.create_task(perform_scan(scan_id))
        
        return ScanResponse(
            message="스캔 요청이 시작되었습니다.",
            scanId=scan_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"스캔 엔진 초기화에 실패했습니다: {str(e)}"
        )

@app.get("/api/v1/scan/results", response_model=Dict)
async def get_scan_results(current_user: str = Depends(get_current_user)):
    """스캔 결과 조회"""
    if not scan_results_cache:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="진행 중인 스캔 결과를 찾을 수 없습니다."
        )
    
    return scan_results_cache

@app.post("/api/v1/clean/execute", response_model=CleanResponse)
async def execute_clean(clean_request: CleanRequest, current_user: str = Depends(get_current_user)):
    """선택 항목 삭제 실행"""
    try:
        # 안전성 검증
        if not disk_cleaner.validate_clean_paths(clean_request.items_to_delete):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="유효하지 않은 파일 경로가 포함되어 있습니다."
            )
        
        # 정리 실행
        result = await disk_cleaner.execute_clean(clean_request.items_to_delete)
        
        return CleanResponse(
            message="삭제 작업이 완료되었습니다.",
            total_cleaned_size=result['total_size'],
            deleted_count=result['deleted_count'],
            error_count=result['error_count']
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"정리 작업 실행에 실패했습니다: {str(e)}"
        )

async def perform_scan(scan_id: str):
    """스캔 작업 수행"""
    try:
        # 스캔 실행
        results = await disk_cleaner.scan_system()
        
        # 결과 캐시에 저장
        scan_results_cache.update({
            "status": "SUCCESS",
            "total_scannable_size": results['total_size'],
            "scan_results": results['items']
        })
        
    except Exception as e:
        print(f"스캔 작업 오류: {e}")
        scan_results_cache.update({
            "status": "ERROR",
            "error": str(e)
        })

# 앱 시작 시 SocketIO 마운트
@app.on_event("startup")
async def startup_event():
    """앱 시작 시 실행"""
    print("CleanBoost API 서버가 시작되었습니다.")

@app.on_event("shutdown")
async def shutdown_event():
    """앱 종료 시 실행"""
    global monitoring_active
    monitoring_active = False
    print("CleanBoost API 서버가 종료되었습니다.")

# SocketIO를 FastAPI에 마운트
sio_app = socketio.ASGIApp(sio, app)

if __name__ == "__main__":
    uvicorn.run(
        "main:sio_app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
