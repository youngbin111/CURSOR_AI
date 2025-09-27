# CleanBoost - PC 성능 모니터링 및 디스크 정리 앱

CleanBoost는 Windows 기반 PC 사용자가 복잡한 기술 지식 없이도 성능 상태를 실시간 모니터링하고, 불필요한 파일을 안전하게 정리할 수 있도록 돕는 크로스 플랫폼 애플리케이션입니다.

## 🚀 주요 기능

### 실시간 시스템 모니터링
- CPU, RAM, GPU, 스토리지 사용량을 1초 단위로 실시간 모니터링
- 원형 및 막대 그래프로 시각화
- 임계치 초과 시 자동 경고 알림

### 스마트 디스크 정리
- **대용량 임시 파일**: %TEMP%, 브라우저 캐시, 휴지통 등
- **프로그램 잔여물**: AppData 내 불필요한 프로그램 데이터
- 안전한 경로만 스캔하여 개인 데이터 보호
- 선택적 삭제로 사용자 제어

### 보안 및 안전성
- 관리자 권한 최소화 (POLP)
- 안전 경로만 접근하여 시스템 파일 보호
- 삭제 전 사용자 승인 및 되돌릴 수 없음 경고
- 파일 경로 유효성 검사

## 🛠 기술 스택

### 프론트엔드
- **Electron**: 크로스 플랫폼 데스크톱 앱
- **React.js**: UI 컴포넌트 및 상태 관리
- **TailwindCSS**: 반응형 스타일링
- **Chart.js**: 실시간 데이터 시각화
- **Socket.IO Client**: 실시간 통신

### 백엔드
- **FastAPI**: 고성능 REST API
- **Python-SocketIO**: 실시간 WebSocket 통신
- **psutil**: 시스템 리소스 모니터링
- **Uvicorn**: ASGI 서버

## 📋 시스템 요구사항

- **운영체제**: Windows 10/11, macOS, Linux
- **Node.js**: 16.0 이상
- **Python**: 3.8 이상
- **메모리**: 최소 4GB RAM
- **디스크**: 500MB 여유 공간

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd cleanboost-app
```

### 2. 자동 설치 및 실행
```bash
# Python으로 자동 설치 및 실행
python start_app.py
```

### 3. 수동 설치 및 실행

#### 백엔드 서버 시작
```bash
# 백엔드 의존성 설치
pip install -r backend/requirements.txt

# 백엔드 서버 시작
python start_backend.py
```

#### 프론트엔드 시작
```bash
# 프론트엔드 의존성 설치
npm install

# 개발 모드 실행
npm run dev
```

## 📖 API 문서

백엔드 서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔧 주요 API 엔드포인트

### REST API
- `POST /api/v1/scan/start` - 잔여물 스캔 시작
- `GET /api/v1/scan/results` - 스캔 결과 조회
- `POST /api/v1/clean/execute` - 선택 항목 삭제 실행

### Socket.IO 이벤트
- `system_status` - 실시간 시스템 상태 데이터
- `warning_trigger` - 임계치 초과 경고
- `monitor_toggle` - 모니터링 시작/중지

## 🏗 프로젝트 구조

```
cleanboost-app/
├── backend/                 # FastAPI 백엔드
│   ├── main.py             # 메인 서버 파일
│   ├── models/              # 데이터 모델
│   ├── services/           # 비즈니스 로직
│   └── requirements.txt    # Python 의존성
├── src/                    # React.js 프론트엔드
│   ├── components/         # UI 컴포넌트
│   ├── App.js             # 메인 앱 컴포넌트
│   └── index.js           # 진입점
├── electron/               # Electron 설정
│   ├── main.js            # 메인 프로세스
│   └── preload.js         # 보안 스크립트
├── public/                 # 정적 파일
├── package.json           # Node.js 의존성
└── README.md              # 프로젝트 문서
```

## 🔒 보안 기능

- **권한 최소화**: 관리자 권한을 최소한의 작업에만 사용
- **경로 검증**: 안전한 경로만 접근하여 시스템 파일 보호
- **입력 검증**: 모든 API 입력값에 대한 유효성 검사
- **토큰 인증**: JWT 기반 API 인증

## 📊 성능 지표

- **앱 실행**: 3초 이내
- **데이터 업데이트**: 100ms 이하 지연
- **파일 스캔**: 30초 이내 완료
- **CPU 점유율**: 1% 미만 유지

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.

---

**CleanBoost** - PC 성능 최적화의 새로운 표준 🚀


