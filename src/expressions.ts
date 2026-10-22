export type Expression = {id: string; title: string; category: string; hint: string; example: string; related: string[]};

// Meaning and context examples, not instructions for performing a sign.
export const words: Expression[] = [
  {id:'hello',title:'안녕하세요',category:'일상',hint:'만났을 때 건네는 인사',example:'안녕하세요. 처음 뵙겠습니다.',related:['meet','thanks','friend']},
  {id:'thanks',title:'감사합니다',category:'마음',hint:'고마운 마음을 전하는 말',example:'도와주셔서 감사합니다.',related:['happy','hello','meet']},
  {id:'friend',title:'친구',category:'사람',hint:'가깝게 지내는 사람',example:'오늘 친구와 함께 왔어요.',related:['family','school','meet']},
  {id:'meet',title:'반갑습니다',category:'마음',hint:'만나서 기쁜 마음을 전하는 말',example:'만나서 반갑습니다.',related:['hello','happy','friend']},
  {id:'family',title:'가족',category:'사람',hint:'함께 살아가는 소중한 사람들',example:'주말에 가족을 만나요.',related:['friend','happy','meet']},
  {id:'school',title:'학교',category:'장소',hint:'배우고 친구를 만나는 곳',example:'내일 학교에서 만나요.',related:['friend','hello','again']},
  {id:'happy',title:'기쁘다',category:'마음',hint:'좋은 일이 있을 때의 마음',example:'다시 만나서 기뻐요.',related:['meet','thanks','family']},
  {id:'again',title:'다시',category:'일상',hint:'한 번 더 보고 싶을 때',example:'다시 한 번 보여 주세요.',related:['hello','school','thanks']},
  {id:'yes',title:'네',category:'일상',hint:'동의하거나 대답할 때',example:'네, 함께 갈게요.',related:['no','thanks','help']},
  {id:'no',title:'아니요',category:'일상',hint:'부정하거나 거절할 때',example:'아니요, 괜찮아요.',related:['yes','sorry','help']},
  {id:'sorry',title:'미안합니다',category:'마음',hint:'미안한 마음을 전하는 말',example:'늦어서 미안합니다.',related:['thanks','help','meet']},
  {id:'love',title:'사랑합니다',category:'마음',hint:'사랑하는 마음을 전하는 말',example:'가족 여러분, 사랑합니다.',related:['family','friend','happy']},
  {id:'home',title:'집',category:'장소',hint:'생활하고 쉬는 곳',example:'오늘은 집에서 쉬어요.',related:['family','work','school']},
  {id:'work',title:'회사',category:'장소',hint:'함께 일하는 곳',example:'내일 회사에 가요.',related:['home','tomorrow','today']},
  {id:'meal',title:'밥',category:'일상',hint:'끼니로 먹는 음식',example:'함께 밥을 먹어요.',related:['water','friend','today']},
  {id:'water',title:'물',category:'일상',hint:'마시거나 씻을 때 쓰는 것',example:'물 한 잔 주세요.',related:['meal','help','thanks']},
  {id:'today',title:'오늘',category:'일상',hint:'지금 지나고 있는 날',example:'오늘 친구를 만나요.',related:['tomorrow','friend','happy']},
  {id:'tomorrow',title:'내일',category:'일상',hint:'오늘의 다음 날',example:'내일 다시 만나요.',related:['today','again','school']},
  {id:'goodbye',title:'안녕히 가세요',category:'일상',hint:'떠나는 사람에게 건네는 인사',example:'조심해서 안녕히 가세요.',related:['hello','meet','again']},
  {id:'help',title:'도와주세요',category:'일상',hint:'도움이 필요할 때 하는 부탁',example:'이것을 찾을 수 있게 도와주세요.',related:['thanks','sorry','water']},
];

const initials = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase('ko').replace(/\s/g, '');
const initialOf = (value: string) => [...value].map(char => {
  const code = char.charCodeAt(0) - 0xac00;
  return code >= 0 && code <= 11171 ? initials[Math.floor(code / 588)] : char;
}).join('');

export function matchesExpression(word: Expression, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return true;
  if (/^[ㄱ-ㅎ]+$/.test(trimmed.replace(/\s/g, ''))) return initialOf(word.title).includes(trimmed.replace(/\s/g, ''));
  return normalize(`${word.title} ${word.hint} ${word.category}`).includes(normalize(trimmed));
}
