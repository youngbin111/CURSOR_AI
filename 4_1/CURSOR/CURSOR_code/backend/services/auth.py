import time
import hashlib
import secrets
from typing import Optional, Dict, Any

class AuthService:
    """인증 서비스"""
    
    def __init__(self):
        self.tokens = {}  # 간단한 토큰 저장소 (실제로는 데이터베이스 사용)
        self.token_expiry = 3600  # 토큰 만료 시간 (1시간)
    
    def generate_token(self, user_id: str = "default") -> str:
        """인증 토큰 생성"""
        try:
            # 현재 시간과 랜덤 값을 조합하여 토큰 생성
            timestamp = str(int(time.time()))
            random_data = secrets.token_hex(16)
            token_data = f"{user_id}:{timestamp}:{random_data}"
            
            # SHA-256 해시로 토큰 생성
            token = hashlib.sha256(token_data.encode()).hexdigest()
            
            # 토큰 저장
            self.tokens[token] = {
                'user_id': user_id,
                'created_at': time.time(),
                'expires_at': time.time() + self.token_expiry
            }
            
            return token
            
        except Exception as e:
            print(f"토큰 생성 오류: {e}")
            return None
    
    def verify_token(self, token: str) -> bool:
        """토큰 검증"""
        try:
            if not token or token not in self.tokens:
                return False
            
            token_info = self.tokens[token]
            current_time = time.time()
            
            # 토큰 만료 확인
            if current_time > token_info['expires_at']:
                # 만료된 토큰 삭제
                del self.tokens[token]
                return False
            
            return True
            
        except Exception as e:
            print(f"토큰 검증 오류: {e}")
            return False
    
    def get_user_from_token(self, token: str) -> Optional[str]:
        """토큰에서 사용자 ID 추출"""
        try:
            if self.verify_token(token):
                return self.tokens[token]['user_id']
            return None
        except Exception as e:
            print(f"사용자 ID 추출 오류: {e}")
            return None
    
    def revoke_token(self, token: str) -> bool:
        """토큰 무효화"""
        try:
            if token in self.tokens:
                del self.tokens[token]
                return True
            return False
        except Exception as e:
            print(f"토큰 무효화 오류: {e}")
            return False
    
    def cleanup_expired_tokens(self):
        """만료된 토큰 정리"""
        try:
            current_time = time.time()
            expired_tokens = [
                token for token, info in self.tokens.items()
                if current_time > info['expires_at']
            ]
            
            for token in expired_tokens:
                del self.tokens[token]
                
        except Exception as e:
            print(f"만료된 토큰 정리 오류: {e}")
    
    def get_token_info(self, token: str) -> Optional[Dict[str, Any]]:
        """토큰 정보 조회"""
        try:
            if self.verify_token(token):
                return self.tokens[token]
            return None
        except Exception as e:
            print(f"토큰 정보 조회 오류: {e}")
            return None
    
    def refresh_token(self, token: str) -> Optional[str]:
        """토큰 갱신"""
        try:
            if self.verify_token(token):
                # 새 토큰 생성
                user_id = self.tokens[token]['user_id']
                new_token = self.generate_token(user_id)
                
                # 기존 토큰 무효화
                self.revoke_token(token)
                
                return new_token
            return None
        except Exception as e:
            print(f"토큰 갱신 오류: {e}")
            return None



