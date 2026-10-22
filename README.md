# 수어역

수어역 모바일 웹 시제품의 코드 협업 기준 저장소입니다. 당근 SEED Design과 Meta Astryx의 실제 React 컴포넌트 키트를 사용해 같은 화면 흐름을 비교합니다. 현재 기본 갤러리는 왼쪽 `그림 라인`(SEED, outline line=1), 오른쪽 `Astryx`(sage 색상)이며, 모바일 앱 화면의 기본 시스템은 Astryx입니다.

## 실행

Node.js 24와 npm이 필요합니다.

```sh
npm ci
npm run dev
```

개발 서버는 `http://127.0.0.1:8097`에서 열립니다.

## 화면

- `/` — 디자인 비교 갤러리
- `/?view=app&system=astryx&color=sage&screen=home` — Astryx 앱 홈
- `/?view=app&system=seed&color=sage&screen=home&line=1` — 그림 라인 앱 홈
- `/planning/index.html` — 기획·리서치 문서
- `/admin.html` — 별도 콘텐츠 관리 시안

## 검증

```sh
npm test
npm run build
```

## 범위

이 저장소는 브라우저에서 확인하는 로컬 시제품입니다. 실제 OAuth 인증, 서버, 사용자 간 공유 데이터, AI 추론은 연결되어 있지 않습니다. 카메라와 MediaPipe 관련 자산·코드가 포함되어 있지만 인식 API endpoint는 설정되지 않았습니다. 화면 입력과 관리 데이터는 실제 서비스 저장소로 전송되지 않습니다.

기획·리서치의 `논의필요 범위`는 확정된 제품 요구사항이나 운영 정책이 아닙니다. 실제 수어 교육 영상·점수·사용자 활동 등 확인되지 않은 결과를 시제품 데이터로 꾸며내지 않습니다. 정적 에셋과 모델, 폰트, PDF 자료는 실행에 필요하므로 저장소에서 유지합니다.
