export const screens=[
 ['login','로그인'],['recover','비밀번호 찾기'],
 ['signup','회원가입'],['profileSetup','프로필·사용자 유형'],['knowledge','수어 경험'],['purpose','가입 목적'],['terms','약관 동의'],['welcome','가입 완료'],
 ['home','홈'],['wiki','위키'],['signSearch','수어로 찾기'],['questions','수어 질문'],['questionCompose','질문 올리기'],['question','질문·답변'],['term','표현 상세'],['record','수어 기록'],['videoDetail','수어 영상'],['learn','배움역'],
 ['community','커뮤니티'],['post','게시글·댓글'],['compose','글 쓰기'],['profile','마이페이지'],
 ['notifications','알림'],['points','포인트'],['wardrobe','프로필 꾸미기'],['collection','내 보관함'],['settings','설정'],['account','계정 관리'],['withdraw','회원탈퇴'],['withdrawConfirm','탈퇴 확인'],['withdrawDone','탈퇴 완료']
] as const;
export type ScreenId=typeof screens[number][0]|'policy';
export const isScreen=(x:unknown):x is ScreenId=>typeof x==='string'&&(screens.some(([id])=>id===x)||x==='policy');
