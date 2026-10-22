const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createRequire}=require('node:module');
const {chromium}=createRequire('C:/Users/2610/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json')('playwright');
const base='http://127.0.0.1:8095';
const ids=['login','recover','signup','profileSetup','terms','welcome','home','wiki','term','record','videoDetail','learn','community','post','compose','profile','notifications','points','wardrobe','collection','settings','account','withdraw','withdrawConfirm','withdrawDone'];
const results=[];
async function run(name,task){await task();results.push({name,result:'PASS'});console.log('PASS',name)}
async function current(page,id){await page.locator(`.mobile-app[data-screen="${id}"]`).waitFor()}
async function noOverflow(page){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'root horizontal overflow');assert(await page.locator('.app-content').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'content horizontal overflow')}
(async()=>{const browser=await chromium.launch({headless:true});const errors=[],mutations=[];try{
const context=await browser.newContext({viewport:{width:390,height:844}});
context.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))mutations.push(r.method()+' '+r.url())})});
for(const system of ['seed','astryx']){
 const page=await context.newPage();await page.goto(`${base}/?view=app&system=${system}`);await current(page,'signup');
 await run(`${system}: login recovery and password visibility`,async()=>{
  await page.goto(`${base}/?view=app&system=${system}&screen=login`);await current(page,'login');
  const password=page.getByLabel('비밀번호',{exact:true});await password.fill('sample-pass-1');assert.equal(await password.getAttribute('type'),'password');
  await page.getByRole('button',{name:'비밀번호 표시',exact:true}).click();assert.equal(await page.getByLabel('비밀번호',{exact:true}).getAttribute('type'),'text');
  await page.getByRole('button',{name:'비밀번호 숨기기',exact:true}).click();assert.equal(await page.getByLabel('비밀번호',{exact:true}).getAttribute('type'),'password');
  await page.getByRole('button',{name:'비밀번호를 잊으셨나요?',exact:true}).click();await current(page,'recover');
  assert(await page.getByRole('button',{name:'재설정 링크 받기',exact:true}).isDisabled());
  await page.getByLabel('이메일',{exact:true}).fill('recovery@example.com');await page.getByRole('button',{name:'재설정 링크 받기',exact:true}).click();
  await page.getByRole('status').getByText('비밀번호 재설정을 준비하고 있어요.').waitFor();
  await page.getByRole('button',{name:'로그인으로 돌아가기',exact:true}).click();await current(page,'login');
 });
 await page.goto(`${base}/?view=app&system=${system}`);await current(page,'signup');
 await run(`${system}: signup validation, back navigation and consent`,async()=>{
  await page.getByLabel('이메일',{exact:true}).fill('review@example.com');await page.getByLabel('비밀번호',{exact:true}).fill('short');await page.getByRole('button',{name:'계속',exact:true}).click();assert.equal(await page.locator('.mobile-app').getAttribute('data-screen'),'signup');
  await page.getByLabel('비밀번호',{exact:true}).fill('sample-pass-1');await page.getByRole('button',{name:'계속',exact:true}).click();await current(page,'profileSetup');
  await page.getByRole('button',{name:'뒤로',exact:true}).click();await current(page,'signup');assert.equal(await page.getByLabel('비밀번호',{exact:true}).inputValue(),'sample-pass-1');
  await page.getByRole('button',{name:'계속',exact:true}).click();await page.getByLabel('닉네임',{exact:true}).fill('푸른손');await page.getByRole('button',{name:'계속',exact:true}).click();await current(page,'terms');
  assert(await page.getByRole('button',{name:'가입하기',exact:true}).isDisabled());
  await page.getByText('이용약관 동의 (필수)',{exact:true}).click();await page.getByText('개인정보 수집·이용 동의 (필수)',{exact:true}).click();await page.getByRole('button',{name:'가입하기',exact:true}).click();await current(page,'welcome');await page.getByRole('button',{name:'수어역 시작하기'}).click();await current(page,'home');
  await page.screenshot({path:`artifacts/${system}-home.png`});
 });
 await run(`${system}: wiki search and bookmark`,async()=>{
  await page.getByRole('button',{name:'위키',exact:true}).click();await current(page,'wiki');await page.getByLabel('수어 검색',{exact:true}).fill('감사');assert.equal(await page.locator('.dp-expression').count(),1);await page.locator('.dp-expression').click();await current(page,'term');await page.getByRole('button',{name:'표현 저장',exact:true}).click();assert.equal(await page.getByRole('button',{name:'표현 저장 취소'}).getAttribute('aria-pressed'),'true');await page.getByRole('button',{name:'뒤로',exact:true}).click();await page.getByLabel('수어 검색',{exact:true}).fill('');await page.screenshot({path:`artifacts/${system}-wiki.png`});
  await page.getByRole('button',{name:'마이',exact:true}).click();await current(page,'profile');await page.getByRole('button',{name:/저장한 표현/}).click();await current(page,'collection');assert.equal(await page.locator('.dp-expression').count(),1);assert.match(await page.locator('.dp-expression').innerText(),/감사합니다/);await page.getByRole('button',{name:'뒤로',exact:true}).click();await current(page,'profile');
 });
 await run(`${system}: compose, comment, edit and delete`,async()=>{
  await page.getByRole('button',{name:'커뮤니티',exact:true}).click();await page.getByRole('button',{name:'글 쓰기',exact:true}).click();await current(page,'compose');await page.getByLabel('제목',{exact:true}).fill('함께 인사해요');await page.getByLabel('내용',{exact:true}).fill('오늘 배운 표현을 나눠요.');await page.getByRole('button',{name:'저장하기',exact:true}).click();await current(page,'post');await page.getByLabel('댓글',{exact:true}).fill('반가워요');await page.getByRole('button',{name:'댓글 남기기'}).click();assert.equal(await page.locator('.comment').count(),1);await page.getByRole('button',{name:'수정',exact:true}).click();await page.getByLabel('제목',{exact:true}).fill('수정한 이야기');await page.getByRole('button',{name:'수정 저장'}).click();assert.equal(await page.locator('.post-title').innerText(),'수정한 이야기');await page.getByRole('button',{name:'삭제',exact:true}).click();await current(page,'community');assert.equal(await page.getByText('수정한 이야기',{exact:true}).count(),0);
 });
 await run(`${system}: withdrawal guards, completion and memory reset`,async()=>{
  await page.getByRole('button',{name:'마이',exact:true}).click();await page.getByRole('button',{name:'설정',exact:true}).first().click();await page.getByRole('button',{name:'계정 관리',exact:true}).click();await page.getByRole('button',{name:'회원탈퇴',exact:true}).click();await current(page,'withdraw');assert(await page.getByRole('button',{name:'탈퇴하기',exact:true}).isDisabled());await page.getByText('탈퇴 안내를 확인했어요',{exact:true}).click();await page.screenshot({path:`artifacts/${system}-withdraw.png`});await page.getByRole('button',{name:'탈퇴하기',exact:true}).click();await current(page,'withdrawConfirm');assert(await page.getByRole('button',{name:'회원탈퇴',exact:true}).isDisabled());await page.getByLabel('비밀번호',{exact:true}).fill('sample-pass-1');await page.getByRole('button',{name:'회원탈퇴',exact:true}).click();await current(page,'withdrawDone');await page.getByRole('button',{name:'처음으로',exact:true}).click();await current(page,'signup');assert.equal(await page.getByLabel('이메일',{exact:true}).inputValue(),'');assert.equal(await page.getByLabel('비밀번호',{exact:true}).inputValue(),'');assert.deepEqual(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length})),{local:0,session:0});
 });
 await run(`${system}: 25 screens at 360, 390 and 430px`,async()=>{
  for(const width of [360,390,430]){await page.setViewportSize({width,height:844});for(const id of ids){await page.evaluate(id=>postMessage({type:'sua-go',screen:id},location.origin),id);await current(page,id);await noOverflow(page)}}
 });await page.close();
}
const gallery=await context.newPage();await gallery.setViewportSize({width:1440,height:1120});await gallery.goto(base);
await run('gallery: initial frames and 25-screen ready handshake',async()=>{
 for(const title of ['seed','astryx'])await gallery.frameLocator(`iframe[title^="${title}" i]`).locator('.mobile-app[data-screen="signup"]').waitFor({timeout:60000});
 for(const id of ids){await gallery.getByLabel('화면 선택').selectOption(id);for(const f of gallery.frames().slice(1))await f.locator(`.mobile-app[data-screen="${id}"]`).waitFor()}
 await gallery.getByLabel('화면 선택').selectOption('home');for(const f of gallery.frames().slice(1))await f.locator('.page-home').waitFor();await gallery.screenshot({path:'artifacts/comparison-home.png',fullPage:true});
});
await run('gallery: all eight palette/system combinations',async()=>{
 await gallery.getByRole('button',{name:'색상 한눈에',exact:true}).click();await gallery.locator('iframe').nth(7).waitFor();assert.equal(await gallery.locator('iframe').count(),8);
 const brands=[];for(const f of gallery.frames().slice(1)){await f.locator('.page-home').waitFor({timeout:60000});brands.push(await f.locator('.mobile-app').evaluate(e=>getComputedStyle(e).getPropertyValue('--brand').trim()));}
 assert.equal(new Set(brands).size,4);await gallery.screenshot({path:'artifacts/eight-versions.png',fullPage:true});
});
await run('gallery: full flow and 360px layout',async()=>{
 await gallery.getByRole('button',{name:'전체 화면',exact:true}).click();assert.equal(await gallery.locator('iframe').count(),25);for(const f of gallery.frames().slice(1))await f.locator('.mobile-app').waitFor({timeout:60000});
 const visibleScreens=[];for(const f of gallery.frames().slice(1))visibleScreens.push(await f.locator('.mobile-app').getAttribute('data-screen'));assert.deepEqual(visibleScreens,ids);
 await gallery.getByRole('button',{name:'두 시스템 비교',exact:true}).click();await gallery.setViewportSize({width:360,height:900});assert(await gallery.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'gallery overflow');await gallery.screenshot({path:'artifacts/gallery-mobile.png',fullPage:true});
});
assert.deepEqual(errors,[]);assert.deepEqual(mutations,[]);results.push({name:'browser errors / network writes',result:'PASS',errors,mutations});
fs.writeFileSync('artifacts/qa-results.json',JSON.stringify({checkedAt:new Date().toISOString(),results},null,2));
console.log(`${results.length} checks passed`);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
