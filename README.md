# 수어역

수어역 모바일 웹 앱의 코드 협업 기준 저장소입니다. 기본 화면은 Meta Astryx의 실제 React 컴포넌트와 그린·라임 소프트(sage) 테마를 사용하는 로그인 화면입니다. Vercel은 이 앱을 브라우저와 모바일 기기에서 테스트하는 배포 환경으로 사용합니다. 별도 비교 페이지에는 왼쪽 `그림 라인`(실제 SEED, outline line=1), 오른쪽 `Astryx`를 유지합니다.

## 실행

Node.js 24와 npm이 필요합니다.

```sh
npm ci
npm run dev
```

개발 서버는 `http://127.0.0.1:8097`에서 열립니다.

## 화면

- `/` — Astryx 그린 앱 로그인
- `/?view=gallery` — 그림 라인·Astryx 디자인 비교 갤러리
- `/?view=app&system=astryx&color=sage&screen=home` — Astryx 앱 홈
- `/?view=app&system=seed&color=sage&screen=home&line=1` — 그림 라인 앱 홈
- `/planning/index.html` — 기획·리서치 문서
- `/admin.html` — 별도 콘텐츠 관리 시안

## 검증

```sh
npm test
npm run build
```

## Vercel 배포

저장소 루트의 `vercel.json`에 Vite 정적 배포 설정을 관리합니다. Node.js 24에서 `npm ci`로 설치하고 `npm test && npm run build`가 통과한 `dist`를 배포합니다. 기획서, PDF, 별도 관리자 HTML 경로를 유지하며 `/admin`도 관리자 화면으로 연결합니다.

Vercel 프로젝트를 `Hariuncle/sueoyeok` GitHub 저장소에 연결하고 Production Branch를 `main`으로 지정해야 자동 배포가 활성화됩니다. 연결 후 `main`의 커밋·머지는 운영 배포, 다른 브랜치와 PR은 미리보기 배포를 만듭니다. 파일 추가만으로 계정 연결이 완료되지는 않습니다. 토큰을 GitHub 저장소에 넣을 필요는 없습니다.

배포 후 `/`, `/planning/`, `/planning/pdf/sueoyeok-combined.pdf`, `/admin.html`과 앱 화면을 확인합니다. 기존 `chatgpt.site`는 별도 배포이므로 Vercel의 업데이트가 해당 주소에 반영되지는 않습니다.

테스트 흐름과 현재 연결 범위는 [테스트 앱 안내](docs/test-app.md)를 참고합니다.

## 범위

이 저장소는 브라우저에서 확인하는 로컬 시제품입니다. 실제 OAuth 인증, 서버, 사용자 간 공유 데이터, AI 추론은 연결되어 있지 않습니다. 카메라와 MediaPipe 관련 자산·코드가 포함되어 있지만 인식 API endpoint는 설정되지 않았습니다. 화면 입력과 관리 데이터는 실제 서비스 저장소로 전송되지 않습니다.

기획·리서치의 `논의필요 범위`는 확정된 제품 요구사항이나 운영 정책이 아닙니다. 실제 수어 교육 영상·점수·사용자 활동 등 확인되지 않은 결과를 시제품 데이터로 꾸며내지 않습니다. 정적 에셋과 모델, 폰트, PDF 자료는 실행에 필요하므로 저장소에서 유지합니다.
