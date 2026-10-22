# 실시간 수어 검색 연동

사용자 정정(2026-10-22): 카메라 → 기기 MediaPipe → 외부 서버 추론 → 결과. 영상 파일 업로드는 별도 ‘수어 기록’ 기능이다.

현재 프런트는 카메라 권한 요청(음성 제외), 미리보기, Holistic 좌표 추출, 손/상체 오버레이, 종료·페이지 이탈·백그라운드 시 정지를 구현한다. MediaPipe는 수어의 뜻을 판별하지 않는다. 모델은 손 각 21개·상체를 포함한 pose 33개·face 478개를 추출하며, 미검출 배열은 비워 둔다. 프리뷰만 좌우 반전한다. 외부 서버 입력은 원래 방향이며 좌표는 학습 데이터와 동일한 방식으로 서버가 전처리해야 한다.

원본 영상·음성은 저장하거나 외부 추론 서버에 보내지 않는다. 좌표는 화면 세션 메모리의 최대 24프레임만 유지한다. 프런트 목표 샘플링은 최대 8Hz이며 처리 시간에 따라 느려질 수 있다. Worker가 초기화되지 않으면 메인 스레드 제한 모드로 전환하므로 저사양 실기기 성능 검증이 필요하다.

## 미확정 외부 계약

서버 URL과 모델 규격은 제공되지 않았다. 아래 HTTP JSON 형식은 **어댑터 제안**이며, 서버가 이미 이 형식을 받는다고 가정하지 않는다. WebSocket 또는 다른 전처리 규격이 있다면 어댑터를 맞춰야 한다. 서버 어휘 ID·신뢰도 의미·판정 임계값·발화 구간 분할·정규화·빈 좌표 마스크를 합의한 뒤 운영 연결한다.

`.env.example`을 참고해 공개 endpoint만 `VITE_SIGN_INFERENCE_URL`로 지정한다. 프런트 환경 변수에는 비밀 API 키를 넣지 않는다. 인증이 필요하면 별도 서버 프록시·짧은 세션 권한을 설계한다. endpoint 미설정 시 요청을 보내지 않으며, UI에 검색 불가를 알린다. 설정한 경우 사용자의 좌표 전송 선택 후 카메라를 시작한다.

```json
{"schemaVersion":1,"sessionId":"...","requestId":"...","image":{"width":640,"height":480},"coordinates":{"space":"normalized","mirrored":false},"frames":[{"timestampMs":1234,"leftHand":[],"rightHand":[],"pose":[],"face":[]}]}
```

응답 제안: `{"requestId":"같은 요청 ID","candidates":[{"id":"hello","label":"안녕하세요","score":0.9}]}`. UI는 일치한 ID·유효한 이름·0~1 범위의 유한 score만 받아 상위 3개를 표시한다. 실제 후보가 없으면 빈 상태이며 임의 정답을 만들지 않는다. 등록된 표현 ID면 상세로, 그 외에는 해당 이름의 텍스트 검색으로 이동한다. 신뢰도 점수의 보정·표시는 서버와 추가 합의가 필요하다.

24프레임이 모이면 최대 1초 간격으로 전송하며 동시에 한 요청만 진행한다. 8초 타임아웃, HTTP 실패·잘못된 응답·오래된 세션 결과 거부, 종료 시 abort가 적용된다. 실패 후 자동 반복 요청은 중단하고 사용자가 카메라를 다시 켜도록 한다. HTTPS·CORS 허용 origin·요청 크기·보관 금지·동의 철회·rate limit·서버 로그 개인정보 제한은 실제 서버에서 확정해야 한다.

## 모델·라이브러리 근거

- [Google Holistic Web 가이드](https://developers.google.com/edge/mediapipe/solutions/vision/holistic_landmarker/web_js)
- [모델과 좌표 구성](https://developers.google.com/edge/mediapipe/solutions/vision/holistic_landmarker)
- `@mediapipe/tasks-vision` 1.1.1. WASM과 공식 Holistic 모델은 `public/mediapipe/`에서 같은 origin으로 제공한다. 원본 주소와 SHA256은 해당 폴더 기록을 참고한다.

실제 서버 정확도·실제 수어의 end-to-end 결과는 서버 연결 후 검증한다. 합성 영상 모델 실행은 수어 인식 정확도 검증이 아니다.
