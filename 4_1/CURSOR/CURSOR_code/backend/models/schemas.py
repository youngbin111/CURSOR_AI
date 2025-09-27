from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ScanRequest(BaseModel):
    """스캔 요청 모델"""
    pass

class ScanResponse(BaseModel):
    """스캔 응답 모델"""
    message: str
    scanId: str

class CleanItem(BaseModel):
    """정리 항목 모델"""
    type: str = Field(..., description="항목 유형 (TEMP_FILES, PROGRAM_REMAINS)")
    name: str = Field(..., description="항목 이름")
    path: str = Field(..., description="파일 경로")
    size: int = Field(..., description="파일 크기 (바이트)")

class CleanRequest(BaseModel):
    """정리 요청 모델"""
    items_to_delete: List[CleanItem] = Field(..., description="삭제할 항목 목록")

class CleanResponse(BaseModel):
    """정리 응답 모델"""
    message: str
    total_cleaned_size: int = Field(..., description="정리된 총 크기 (바이트)")
    deleted_count: int = Field(..., description="삭제된 파일 개수")
    error_count: int = Field(..., description="오류 발생 개수")

class SystemStatus(BaseModel):
    """시스템 상태 모델"""
    cpu_percent: float = Field(..., description="CPU 사용률 (%)")
    ram_percent: float = Field(..., description="RAM 사용률 (%)")
    ram_used_gb: float = Field(..., description="사용 중인 RAM (GB)")
    ram_total_gb: float = Field(..., description="총 RAM (GB)")
    gpu_percent: float = Field(..., description="GPU 사용률 (%)")
    storage_percent: float = Field(..., description="스토리지 사용률 (%)")
    storage_used_gb: float = Field(..., description="사용 중인 스토리지 (GB)")
    storage_total_gb: float = Field(..., description="총 스토리지 (GB)")

class WarningTrigger(BaseModel):
    """경고 트리거 모델"""
    type: str = Field(..., description="경고 유형")
    message: str = Field(..., description="경고 메시지")
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)

class ScanResult(BaseModel):
    """스캔 결과 모델"""
    type: str = Field(..., description="항목 유형")
    name: str = Field(..., description="항목 이름")
    path: str = Field(..., description="파일 경로")
    size: int = Field(..., description="파일 크기 (바이트)")
    safe_to_delete: bool = Field(default=True, description="안전하게 삭제 가능한지 여부")

