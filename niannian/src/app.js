import { artwork, navIcon, animateContent, installMotion } from './materials.js';
import { WORDS, BOOKS, byId } from './data.js';
import { STORAGE_KEY, GOALS, initialState, normalizeState, dateKey, addDays, stats, dueWords, startSession, recordAnswer, advanceSession } from './core.js';

const app=document.querySelector('#app');
const modal=document.querySelector('#modal');
const toastEl=document.querySelector('#toast');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let storageAvailable=true, corruptedBackup=null;
let state=initialState();
try { const raw=localStorage.getItem(STORAGE_KEY);if(raw)state=normalizeState(JSON.parse(raw)); }
catch { storageAvailable=false;try{corruptedBackup=localStorage.getItem(STORAGE_KEY);}catch{} }
let filter='all', search='', pendingImport=null, deferredInstall=null, toastTimer, audioWatchdog;
let route=['home','books','review','growth','settings','learn'].includes(location.hash.slice(1))?location.hash.slice(1):'home';
const icons={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 book:'<path d="M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1zm0 0v15"/>',
 repeat:'<path d="M20 7a9 9 0 0 0-15-2L2 8m0-5v5h5m-3 9a9 9 0 0 0 15 2l3-3m0 5v-5h-5"/>',
 grow:'<path d="M5 21v-7m7 7V8m7 13V3"/>',
 settings:'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="m10 2 4 0 1 3 3 1 3 2-1 4 1 4-3 2-3 1-1 3h-4l-1-3-3-1-3-2 1-4-1-4 3-2 3-1z"/>',
 arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
 sound:'<path d="m11 4-6 5H2v6h3l6 5zm4 4c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',
 star:'<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
 check:'<path d="m5 12 5 5L20 7"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 back:'<path d="m14 5-7 7 7 7"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v5m10-5v5M3 11h18"/>',
 heart:'<path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-5 5 2 11 8 15 6-4 13-10 8-15z"/>',
 leaf:'<path d="M20 3c-15-2-19 10-12 15 6 4 14-2 12-15zM5 21 16 9"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>'
};
const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.star}</svg>`;
const btn=(label,action,cls='button primary',extra='')=>`<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
const puppy=(cls='')=>artwork('mascot',`puppy ${cls}`);
function persist(){
  if(corruptedBackup) return;
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));storageAvailable=true;}
  catch{storageAvailable=false;toast('本机存储不可用，请导出备份以免进度丢失。');}
}
function toast(message){clearTimeout(toastTimer);toastEl.textContent=message;toastEl.classList.add('visible');toastTimer=setTimeout(()=>toastEl.classList.remove('visible'),3600);}
function navigate(next){if(route===next){render();return;}location.hash=next;}
window.addEventListener('hashchange',()=>{route=location.hash.slice(1);if(!['home','books','review','growth','settings','learn'].includes(route))route='home';render();window.scrollTo({top:0});});
function showModal(content){modal.innerHTML=`${btn(icon('close'),'close-modal','icon-button modal-close','aria-label="关闭弹窗"')}${content}`;if(!modal.open)modal.showModal();}
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});
let introStep=0;
function welcome(step=0){
 introStep=step;
 const titles=['念念有词','来，念念有词','相信自己'];
 const subtitles=['每一个单词，都是新的相遇。','不用着急，按自己的节奏慢慢来。','小小的你，也有大大的能量。'];
 showModal(`<div class="intro-screen intro-${step}"><span class="intro-kicker">A LITTLE EVERY DAY</span><div class="intro-art">${artwork(['mascot','sleepy','hand'][step])}</div><h2 id="modal-title">${titles[step]}</h2><p>${subtitles[step]}</p><div class="intro-dots">${titles.map((_,i)=>`<span class="${i===step?'active':''}"></span>`).join('')}</div>${btn((step===2?'开始你的旅程':'下一页')+'<span class="journey-dot">'+icon('arrow')+'</span>',step===2?'onboard':'intro-next','button primary journey-button')}${step<2?btn('直接开始','onboard','text-button intro-skip'):''}</div>`);
}

function render(){
  const previousIndex=Number(document.querySelector('.nav-lens')?.dataset.index||0);
  const s=stats(state), book=BOOKS.find(b=>b.id===state.book);
  const nav=[['home','home','首页'],['growth','plan','成长'],['review','review','复习'],['books','books','词书'],['settings','cat','我的']];
  app.innerHTML=`<aside class="sidebar"><a href="#home" class="brand">${artwork('avatar','brand-avatar')}<span>念念有词<small>A LITTLE EVERY DAY</small></span></a><div class="side-label">我的学习天地</div><nav aria-label="主导航">${nav.map(([id,ic,title])=>`<a href="#${id}" class="nav-link ${route===id?'active':''}" ${route===id?'aria-current="page"':''}>${navIcon(ic)}<span>${title}</span>${id==='review'&&s.due?`<span class="nav-count">${s.due}</span>`:''}</a>`).join('')}</nav><div class="sidebar-note"><span class="tiny-spark">✦</span><h3>慢慢来，也很棒。</h3><p>每一次小小的坚持，<br>都在悄悄发芽。</p>${icon('leaf')}</div><a href="#settings" class="nav-link settings-link ${route==='settings'?'active':''}">${icon('settings')}<span>学习设置</span></a><p class="sidebar-footer">MADE FOR LITTLE WONDERS</p></aside>
  <div class="main-shell"><header class="topbar"><span class="top-crumb">${icon('leaf')} 每天一小步，英语会进步</span><div class="top-actions"><span class="date-label">${new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</span><button class="profile-button" data-action="navigate" data-route="settings" aria-label="学习设置">${artwork('avatar')}</button></div></header>
  <main id="main" tabindex="-1">${!storageAvailable?`<div class="notice" role="alert">${corruptedBackup?'检测到旧进度文件异常，已保留原数据。请到设置导出原始数据后再处理。':'浏览器无法保存进度。离开前请在设置中导出备份。'}</div>`:''}${route==='home'?home(s,book):route==='books'?books():route==='review'?review(s):route==='growth'?growth(s):route==='settings'?settings():learn()}</main>
  <footer class="page-footer"><span>小小单词，大大世界。</span><span>念念有词 · ${WORDS.length} 个发现</span></footer></div>
  <nav class="mobile-nav liquid" aria-label="手机导航"><span class="nav-lens" data-index="${Math.max(0,nav.findIndex(n=>n[0]===route))}" style="--index:${Math.max(0,nav.findIndex(n=>n[0]===route))}"></span>${nav.map(([id,ic,title])=>`<a href="#${id}" class="${route===id?'active':''}" ${route===id?'aria-current="page"':''}>${navIcon(ic)}<span>${title}</span></a>`).join('')}</nav>`;
  document.body.dataset.route=route;
  animateContent(previousIndex);
  document.title=`${({home:'学习小屋',books:'我的词书',review:'温习时光',growth:'成长足迹',settings:'学习设置',learn:'一起学习'})[route]} · 念念有词`;
}
function home(s,book){
 const unfinished=state.session&&!state.session.finished;
 const remaining=WORDS.filter(w=>w.book===book.id&&!state.progress[w.id]).length;
 return `<div class="reference-layout"><aside class="brand-story"><div class="story-label">NIANNIAN WORDS · 每天念念</div><h1>念念有<span>词</span></h1><p>It's a pleasure to learn English with you.</p><div class="story-mascot">${artwork('mascot')}</div>${btn('遇见念念 '+icon('arrow'),'intro','button story-button liquid')}<small>小小单词，大大世界。</small></aside><section class="reference-main"><header class="home-greeting"><div><span class="eyebrow">HELLO, LITTLE FRIEND</span><h1>今天，也要相信自己。</h1></div>${btn(artwork('avatar'),'intro','avatar-button','aria-label="遇见念念"')}</header><div class="reference-grid"><section class="achievement-card paper-card"><div class="card-title"><h2>今日成就</h2><span>${String(new Date().getMonth()+1).padStart(2,'0')} / ${String(new Date().getDate()).padStart(2,'0')}</span></div><div class="achievement-row"><span>今日学习</span><strong>${s.today}</strong><small>词</small></div><button class="achievement-row" data-action="favorites"><span>收藏单词</span><strong>${state.favorites.length}</strong><small>词 ${icon('arrow')}</small></button><div class="achievement-row"><span>累计学习</span><strong>${s.learned}</strong><small>词</small></div><div class="achievement-caption">一点点积累，都是了不起的进步。</div></section><section class="goal-companion paper-card"><div class="goal-copy"><span>离今日的小目标</span><p>${s.today>=state.goal?'已经完成 <strong>✓</strong>':`还差 <strong>${Math.max(0,state.goal-s.today)}</strong> 个词`}</p><button class="text-button" data-action="goal">每天 ${state.goal} 词 · 调整计划 ${icon('arrow')}</button></div><div class="sleepy-art">${artwork('nap')}</div></section><section class="practice-pair paper-card"><button class="practice-tile study-tile" data-action="${unfinished?'resume':'start-learn'}"><span class="practice-label">${unfinished?'继续学习':'学习'}<strong>${unfinished?Math.max(0,state.session.queue.length-state.session.index):Math.min(remaining,state.goal)}<small> 词</small></strong></span><div class="rabbit-art">${artwork('cheer')}</div><span class="tile-action">${unfinished?'接着上次的进度':'认识新的小伙伴'} ${icon('arrow')}</span></button><button class="practice-tile review-tile" data-action="start-review"><span class="practice-label">复习<strong>${s.due}<small> 词</small></strong></span><div class="rabbit-art">${artwork('praise')}</div><span class="tile-action">${s.due?'和老朋友再见一面':'今日没有到期词'} ${icon('arrow')}</span></button></section><div class="quick-pair">${btn(navIcon('plan')+'<span>学习计划<small>找到舒服的节奏</small></span>'+icon('arrow'),'goal','quick-card liquid')}${btn(navIcon('books')+'<span>我的词书<small>'+book.title+'</small></span>'+icon('arrow'),'navigate','quick-card liquid','data-route="books"')}</div><div class="home-footnote">${icon('heart')} 已坚持 ${s.streak} 天 · 每一次认真都值得被看见</div></div></section></div>`;
}
function weekDays(){const today=dateKey();return Array.from({length:7},(_,i)=>{const day=addDays(today,i-6);const [y,m,d]=day.split('-').map(Number);return{day,label:['日','一','二','三','四','五','六'][new Date(y,m-1,d,12).getDay()]};});}
function bookCard(book,compact=false){
 const count=WORDS.filter(w=>w.book===book.id&&state.progress[w.id]).length;
 return `<button class="book-card ${compact?'compact':''} ${state.book===book.id?'selected':''}" data-action="select-book" data-book="${book.id}" style="--book-color:${book.color}"><div class="book-art"><span class="book-emoji">${book.emoji}</span><span class="book-english">${book.en}</span><span class="book-corner">${state.book===book.id?'正在学':'16 WORDS'}</span><span class="book-orbit"></span></div><div class="book-info"><h3>${book.title}</h3><span>${count} / 16 词 ${icon('arrow')}</span></div>${compact?'':`<p>${book.description}</p><div class="progress-track"><span style="width:${count/16*100}%"></span></div>`}</button>`;
}
function books(){return `<div class="page-heading"><div><span class="eyebrow">YOUR WORD WORLDS</span><h1>把好奇心，翻开一页。</h1><p>6 个主题，96 个小发现。选一本喜欢的，慢慢学。</p></div></div><div class="books-grid">${BOOKS.map(b=>bookCard(b)).join('')}</div><section class="word-library panel"><div class="section-heading"><h2>单词口袋</h2><span class="muted">${WORDS.length} 个基础词</span></div><div class="library-controls"><div class="filter-tabs" role="group" aria-label="单词筛选">${[['all','全部'],['favorites','我的收藏'],['learned','已学过']].map(([id,label])=>btn(label,'filter',`filter-tab ${filter===id?'active':''}`,`data-filter="${id}" aria-pressed="${filter===id}"`)).join('')}</div><label class="search-field">${icon('search')}<input id="word-search" type="search" placeholder="找一个单词或中文…" aria-label="搜索单词" value="${esc(search)}"></label></div><div id="word-list">${wordList()}</div></section>`;}
function wordList(){
 const list=WORDS.filter(w=>(filter!=='favorites'||state.favorites.includes(w.id))&&(filter!=='learned'||state.progress[w.id])&&(!search||`${w.word} ${w.meaning}`.toLowerCase().includes(search.toLowerCase())));
 return list.length?`<div class="word-list">${list.map(w=>`<div class="word-row"><button class="word-open" data-action="word" data-id="${w.id}"><span class="word-emoji">${w.emoji}</span><span><strong>${w.word}</strong><small>${w.meaning}</small></span></button><span class="word-status">${state.progress[w.id]?'已学过':BOOKS.find(b=>b.id===w.book).title}</span><button class="icon-button ${state.favorites.includes(w.id)?'is-favorite':''}" data-action="favorite" data-id="${w.id}" aria-label="${state.favorites.includes(w.id)?'取消收藏':'收藏'} ${w.word}" aria-pressed="${state.favorites.includes(w.id)}">${icon('star')}</button><button class="icon-button" data-action="speak" data-id="${w.id}" aria-label="听 ${w.word} 的发音">${icon('sound')}</button></div>`).join('')}</div>`:`<div class="empty-state"><span>🧺</span><h3>${search?'没有找到这个单词':filter==='favorites'?'口袋里还没有收藏':'还没有学过的单词'}</h3><p>${search?'试试英文或中文，当前内置96个基础词。':'从喜欢的主题开始，留下第一个小发现吧。'}</p>${btn('开始学习','start-learn')}</div>`;
}
function review(s){const due=dueWords(state);return `<div class="page-heading"><div><span class="eyebrow">HELLO AGAIN, OLD FRIENDS</span><h1>再见一次，就更熟悉。</h1><p>学过的词会按答题情况，在 1、3、7、14、30 天后回来见你。</p></div></div><section class="review-hero panel"><div><span class="pill">今天的温习清单</span><h2>${s.due?`${s.due} 个老朋友，等你说声 Hi。`:'今天没有到期的单词。'}</h2><p>${s.due?'先回想，再选择。答错也没关系，我们会一起再练一次。':'今天新学的词，最早明天回来见你。现在可以学点新的。'}</p>${btn(s.due?'开始温习 '+icon('arrow'):'去学新单词 '+icon('arrow'),s.due?'start-review':'start-learn')}</div><div class="review-art">${puppy()}</div></section>${due.length?`<div class="section-heading"><h2>待温习的单词</h2><span class="muted">每轮最多 ${state.goal} 个</span></div><div class="review-grid">${due.map(w=>`<button class="review-word panel" data-action="word" data-id="${w.id}"><span>${w.emoji}</span><strong>${w.word}</strong><small>${w.meaning}</small></button>`).join('')}</div>`:''}<section class="soft-info">${icon('leaf')}<p>复习间隔会随着正确回答逐步增加。答错的词会在本轮末尾再练一次，明天也会再出现。</p></section>`;}
function growth(s){return `<div class="page-heading"><div><span class="eyebrow">SMALL STEPS, BIG WONDERS</span><h1>你的小进步，都在这里。</h1><p>不用和别人比较，每一片叶子都有自己的生长节奏。</p></div></div><div class="growth-stats">${[[s.learned,'学过的单词','book'],[s.mastered,'逐渐记牢','check'],[s.streak,'连续学习天数','bolt'],[Object.values(state.history).filter(h=>h.ids.length).length,'留下足迹的日子','calendar']].map(([n,l,i])=>`<div class="panel">${icon(i)}<strong>${n}</strong><span>${l}</span></div>`).join('')}</div><div class="growth-grid"><section class="panel"><div class="section-heading"><h2>这一周的小脚印</h2><span class="muted">每日不同单词数</span></div><div class="week-chart">${weekDays().map(({day,label})=>{const count=state.history[day]?.ids.length||0;return`<div class="chart-column"><span>${count}</span><div class="chart-slot"><i style="height:${count?Math.max(8,count/96*100):2}%" class="${day===dateKey()?'today':''}"></i></div><small>周${label}</small></div>`;}).join('')}</div><p class="muted caption">同一天重练同一个词，只计作一个学习单词。</p></section><section class="panel sticker-panel"><div class="section-heading"><h2>念念的鼓励贴纸</h2></div><div class="stickers">${[[1,'🌱','第一颗种子'],[5,'🌼','小小花园'],[20,'🦋','勇敢探索'],[50,'🌈','彩虹收藏家'],[96,'🏕️','小小旅行家']].map(([n,emoji,title])=>`<div class="sticker ${s.learned>=n?'earned':''}"><span>${emoji}</span><strong>${title}</strong><small>${s.learned>=n?'已点亮':`学过 ${n} 词`}</small></div>`).join('')}</div></section></div><section class="soft-info">${icon('heart')}<p>“逐渐记牢”指已经连续答对、复习阶段达到第三级的词，只是学习提示，不是能力测评。</p></section>`;}
function settings(){return `<div class="page-heading"><div><span class="eyebrow">MAKE YOURSELF AT HOME</span><h1>找到舒服的学习节奏。</h1><p>目标小一点没关系，坚持和快乐更重要。</p></div></div><div class="settings-grid"><section class="panel settings-card"><h2>每天，学几个？</h2><p>新学和复习都算今日学习，每轮最多按这个数量安排。</p><div class="goal-options">${GOALS.map(g=>btn(`<strong>${g}</strong><span>个单词</span>`,'set-goal',`goal-option ${state.goal===g?'active':''}`,`data-goal="${g}" aria-pressed="${state.goal===g}"`)).join('')}</div><h2>听一听英语</h2><div class="setting-row"><label for="accent">发音偏好</label><select id="accent"><option value="en-GB" ${state.accent==='en-GB'?'selected':''}>英式英语</option><option value="en-US" ${state.accent==='en-US'?'selected':''}>美式英语</option></select></div><div class="setting-row"><label for="slow">念慢一点</label><input type="checkbox" id="slow" role="switch" ${state.slow?'checked':''}></div>${btn(icon('sound')+' 试听 Hello, friend!','test-audio','button secondary')}<p class="small muted">发音使用设备提供的英语语音。可用口音、效果和离线能力取决于浏览器与已安装语音包；无声音时仍可阅读音标和例句。</p></section><section class="panel settings-card"><h2>把小进步好好收起来</h2><p>学习进度只保存在当前浏览器，没有账号或云同步。清除网站数据、更换设备或使用无痕模式可能丢失进度。</p><div class="backup-actions">${btn(icon('download')+' 导出学习备份','export','button secondary')}${btn('导入学习备份','import','button secondary')}</div><input id="import-file" type="file" accept=".json,application/json" hidden>${corruptedBackup?btn('下载保留的原始数据','export-raw','button secondary wide'):''}<h2>装进手机主屏幕</h2><p>像小应用一样打开念念，首次加载后也能离线学词。</p>${btn('安装 / 查看安装方法','install','button secondary')}<hr><h2>关于念念有词</h2><p class="small">以朱婷作品集中的“念念有词”为界面灵感开发。96个基础词、项目自编短例句、设备发音。没有广告、排行榜或应用内购买。</p><p class="small muted">v1.1.0 · 本地优先 · MIT 开源代码</p>${btn('清除本机学习记录','reset-prompt','text-button danger')}</section></div>`;}
function learn(){
 const s=state.session;
 if(!s)return `<div class="empty-state large"><span>🌱</span><h1>一起学第一个单词吧。</h1><p>先从你选的主题开始。</p>${btn('开始学习','start-learn')}</div>`;
 if(s.finished){const results=Object.values(s.results),count=results.length,correct=results.filter(Boolean).length;return `<section class="completion panel"><span class="eyebrow">YOU DID SOMETHING WONDERFUL</span><div class="completion-art">${puppy()}<span>✦</span></div><h1>今天的你，又进步了一点！</h1><p>这一轮遇见了 ${count} 个单词。<br>${correct===count?'每个词都一次答对，真棒！':'有些词还需要再见面，念念已经帮你记下啦。'}</p><div class="completion-stats"><div><strong>${count}</strong><span>练习单词</span></div><div><strong>${count?Math.round(correct/count*100):0}%</strong><span>首次答对</span></div><div><strong>${stats(state).streak}</strong><span>连续学习天数</span></div></div><div class="completion-words">${Object.keys(s.results).map(id=>`<button data-action="word" data-id="${id}" class="word-chip">${byId[id].emoji} ${byId[id].word} ${s.results[id]?'✓':'↻'}</button>`).join('')}</div><div class="completion-actions">${btn('回学习小屋','navigate','button primary','data-route="home"')}${btn('再学一组','start-learn','button secondary')}</div><p class="small muted">进度${storageAvailable?'已保存在本机':'暂未保存，请导出备份'} · 记得休息一下眼睛</p></section>`;}
 const w=byId[s.queue[s.index]],book=BOOKS.find(b=>b.id===w.book),isFeedback=s.phase==='feedback',selected=s.selected,correct=selected===w.id;
 const currentNo=Math.min(s.index+1,s.queue.length);
 return `<div class="lesson-top"><button class="text-button" data-action="navigate" data-route="home">${icon('back')} 暂停，回小屋</button><span>${s.mode==='review'?'温习时光':book.title} <b>${currentNo} / ${s.queue.length}</b></span><button class="icon-button ${state.favorites.includes(w.id)?'is-favorite':''}" data-action="favorite" data-id="${w.id}" aria-label="${state.favorites.includes(w.id)?'取消收藏':'收藏'} ${w.word}" aria-pressed="${state.favorites.includes(w.id)}">${icon('star')}</button></div><div class="lesson-trail"><div class="runner" style="left:${Math.min(90,s.index/s.queue.length*100)}%">${artwork('run')}</div><div class="trail-track"><span style="width:${s.index/s.queue.length*100}%"></span></div><div class="trail-labels"><span>出发</span><span>${currentNo} / ${s.queue.length}</span><span>又进步啦</span></div></div><div class="lesson-wrap"><section class="lesson-card panel"><span class="eyebrow">${s.phase==='learn'?'MEET A NEW FRIEND':Object.hasOwn(s.results,w.id)&&!isFeedback?'LET’S TRY AGAIN':'A LITTLE MEMORY GAME'}</span><p class="lesson-hint">${s.phase==='learn'?'先认识它，再试着记住它。':'选一选，这个单词是什么意思？'}</p>${s.phase==='learn'||isFeedback?`<div class="lesson-emoji">${w.emoji}</div>`:'<div class="quiz-mark">想一想</div>'}<div class="word-heading"><h1>${w.word}</h1><button class="icon-button sound-button" data-action="speak" data-id="${w.id}" aria-label="听 ${w.word} 的发音">${icon('sound')}</button></div><div class="ipa">${w.ipa}</div>${s.phase==='learn'?`<h2 class="word-meaning">${w.meaning}</h2><div class="example"><button class="icon-button" data-action="speak-example" data-id="${w.id}" aria-label="朗读例句">${icon('sound')}</button><p>${w.example}<span>${w.translation}</span></p></div>${btn('记住啦，考考我 '+icon('arrow'),'advance','button primary wide')}`:`<div class="quiz-options">${s.options.map((id,i)=>`<button data-action="answer" data-id="${id}" ${isFeedback?'disabled':''} class="quiz-option ${isFeedback&&id===w.id?'correct':''} ${isFeedback&&id===selected&&id!==w.id?'incorrect':''}"><span>${String.fromCharCode(65+i)}</span><strong>${byId[id].meaning}</strong>${isFeedback&&id===w.id?icon('check'):''}</button>`).join('')}</div>${isFeedback?`<div class="answer-feedback ${correct?'right':'wrong'}" role="status"><strong>${correct?'答对啦！又认识了一位朋友。':`没关系，${w.word} 是“${w.meaning}”。`}</strong><span>${w.example}</span><small>${w.translation}</small></div>${btn(s.index===s.queue.length-1&&!s.retries.length?'完成本轮 '+icon('check'):'继续 '+icon('arrow'),'advance','button primary wide')}`:`<p class="small muted">想一想再选择，答错也可以再练。</p>`}`}</section><div class="lesson-footer companion-note">${artwork('rest')}<p>加油，又积累了一个小单词呢。</p></div></div>`;
}

function start(mode,ids=null){
 if(state.session&&!state.session.finished){showModal(`<span class="eyebrow">ONE LITTLE THING AT A TIME</span><h2 id="modal-title">还有一轮没学完哦</h2><p>继续上次的学习吧。已经答过的单词都保留着。</p>${btn('继续上次学习','resume','button primary wide')}${btn('结束这轮，重新选择','abandon','button secondary wide')}`);return;}
 const s=startSession(state,mode,dateKey(),ids);
 if(!s){showModal(`<h2 id="modal-title">${mode==='review'?'今天的温习完成啦':'这本词书已经学完啦'}</h2><p>${mode==='review'?'还可以探索一本新词书，或者明天再来。':'可以换一个主题继续探索，也可以到温习时光巩固记忆。'}</p>${btn('去看看词书','navigate','button primary wide','data-route="books"')}`);return;}
 state.session=s;persist();modal.close();navigate('learn');
}
function wordModal(id){const w=byId[id];if(!w)return;showModal(`<div class="detail-emoji">${w.emoji}</div><span class="eyebrow">${BOOKS.find(b=>b.id===w.book).en}</span><h2 id="modal-title" class="detail-word">${w.word}</h2><p class="ipa">${w.ipa} · ${w.meaning}</p><div class="example"><p>${w.example}<span>${w.translation}</span></p></div><div class="modal-actions">${btn(icon('sound')+' 听发音','speak','button secondary',`data-id="${id}"`)}${btn(icon('star')+(state.favorites.includes(id)?' 已收藏':' 收藏'),'favorite-modal','button secondary',`data-id="${id}"`)}</div>${btn('练习这个词','practice-word','button primary wide',`data-id="${id}"`)}`);}
function speak(text){
 if(!('speechSynthesis' in window)){toast('这个浏览器暂不支持发音，请参考音标，或用系统浏览器打开。');return;}
 clearTimeout(audioWatchdog);speechSynthesis.cancel();
 const voices=speechSynthesis.getVoices();const u=new SpeechSynthesisUtterance(text);u.lang=state.accent;u.rate=state.slow?0.65:0.85;
 u.voice=voices.find(v=>v.lang===state.accent&&v.localService)||voices.find(v=>v.lang===state.accent)||voices.find(v=>v.lang.startsWith('en'))||null;
 u.onstart=()=>clearTimeout(audioWatchdog);u.onerror=e=>{clearTimeout(audioWatchdog);if(!['canceled','interrupted'].includes(e.error))toast('发音暂不可用。请检查设备音量和英语语音包。');};
 audioWatchdog=setTimeout(()=>toast('如果没有听到声音，请检查设备英语语音包，或换系统浏览器。'),5000);
 speechSynthesis.speak(u);
}
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
document.addEventListener('click',e=>{
 if(e.target.closest('.skip-link')){e.preventDefault();const main=document.querySelector('#main');main?.focus();main?.scrollIntoView();return;}
 const el=e.target.closest('[data-action]');if(!el||el.disabled)return;const a=el.dataset.action,id=el.dataset.id;
 if(a==='navigate'){modal.close();navigate(el.dataset.route);}
 else if(a==='close-modal')modal.close();
 else if(a==='intro')welcome();
 else if(a==='intro-next')welcome(Math.min(2,introStep+1));
 else if(a==='favorites'){filter='favorites';navigate('books');}
 else if(a==='onboard'){state.onboarded=true;persist();modal.close();}
 else if(a==='start-learn')start('learn');
 else if(a==='start-review')start('review');
 else if(a==='practice-word')start(state.progress[id]?'review':'learn',[id]);
 else if(a==='resume'){modal.close();navigate('learn');}
 else if(a==='abandon'){state.session=null;persist();modal.close();navigate('home');}
 else if(a==='advance'){advanceSession(state);persist();render();document.querySelector('.lesson-card h1, .completion h1')?.setAttribute('tabindex','-1');document.querySelector('.lesson-card h1, .completion h1')?.focus({preventScroll:true});}
 else if(a==='answer'){
  const s=state.session;if(!s||s.phase!=='quiz'||!s.options.includes(id))return;
  s.selected=id;recordAnswer(state,id===s.queue[s.index]);persist();render();document.querySelector('[data-action="advance"]')?.focus({preventScroll:true});
 }
 else if(a==='select-book'){
  state.book=el.dataset.book;persist();const b=BOOKS.find(b=>b.id===state.book);showModal(`<div class="detail-emoji">${b.emoji}</div><span class="eyebrow">${b.en}</span><h2 id="modal-title">${b.title}</h2><p>${b.description}<br>已设为当前词书，准备认识新朋友吗？</p>${btn('开始学这本','start-learn','button primary wide')}`);render();
 }
 else if(a==='filter'){filter=el.dataset.filter;render();}
 else if(a==='word')wordModal(id);
 else if(a==='favorite'||a==='favorite-modal'){
  if(!byId[id])return;state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];persist();
  if(a==='favorite-modal')wordModal(id);render();toast(state.favorites.includes(id)?'已经装进单词口袋啦':'已取消收藏');
 }
 else if(a==='speak'&&byId[id])speak(byId[id].word);
 else if(a==='speak-example'&&byId[id])speak(byId[id].example);
 else if(a==='test-audio')speak('Hello, friend! Let us learn together.');
 else if(a==='goal'){showModal(`<h2 id="modal-title">每天，学几个？</h2><p>从小目标开始，也能走得很远。</p><div class="goal-options">${GOALS.map(g=>btn(`<strong>${g}</strong><span>个单词</span>`,'set-goal',`goal-option ${state.goal===g?'active':''}`,`data-goal="${g}"`)).join('')}</div><p class="small muted">调整目标不会改变正在进行的这一轮。</p>`);}
 else if(a==='set-goal'){const n=Number(el.dataset.goal);if(!GOALS.includes(n))return;state.goal=n;persist();modal.close();render();toast(`每天 ${n} 个，慢慢来就好。`);}
 else if(a==='export')download(JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2),`念念有词-学习备份-${dateKey()}.json`);
 else if(a==='export-raw'&&corruptedBackup)download(corruptedBackup,`念念有词-原始数据-${dateKey()}.json`);
 else if(a==='import')document.querySelector('#import-file').click();
 else if(a==='confirm-import'&&pendingImport){state=pendingImport;pendingImport=null;corruptedBackup=null;persist();modal.close();render();toast('学习进度已恢复');}
 else if(a==='reset-prompt'){showModal(`<h2 id="modal-title">清除本机学习记录？</h2><p>这会清除学词进度、收藏和设置。建议先导出备份；清除后无法直接撤销。</p>${btn('先导出备份','export','button secondary wide')}${btn('确认清除','confirm-reset','button danger-button wide')}`);}
 else if(a==='confirm-reset'){state=initialState();state.onboarded=true;corruptedBackup=null;persist();modal.close();navigate('home');toast('已清除本机记录，可以重新开始啦');}
 else if(a==='install'){
  if(deferredInstall){deferredInstall.prompt();deferredInstall.userChoice.finally(()=>{deferredInstall=null;});}
  else showModal(`<h2 id="modal-title">把念念装进口袋</h2><p><strong>iPhone / iPad：</strong>在 Safari 打开部署后的网址，点“分享”，选择“添加到主屏幕”。</p><p><strong>Android / 电脑：</strong>在支持安装的浏览器中打开网址，使用菜单里的“安装应用”或“添加到主屏幕”。</p><p class="small muted">正式部署需要 HTTPS。普通局域网 HTTP 地址可浏览，但不支持完整安装与离线能力。若浏览器没有安装选项，仍可直接使用网页版。</p>`);
 }
});
document.addEventListener('input',e=>{if(e.target.id==='word-search'){search=e.target.value;document.querySelector('#word-list').innerHTML=wordList();}});
document.addEventListener('change',async e=>{
 if(e.target.id==='accent'){state.accent=e.target.value;persist();}
 if(e.target.id==='slow'){state.slow=e.target.checked;persist();}
 if(e.target.id==='import-file'){
  const file=e.target.files[0];e.target.value='';if(!file)return;
  if(file.size>1024*1024){toast('备份文件过大，请选择1MB以内的JSON文件。');return;}
  try{pendingImport=normalizeState(JSON.parse(await file.text()));const st=stats(pendingImport);showModal(`<h2 id="modal-title">恢复这份学习记录？</h2><p>备份包含 ${st.learned} 个已学词、${pendingImport.favorites.length} 个收藏。恢复后会替换本机当前进度。</p>${btn('先备份当前记录','export','button secondary wide')}${btn('确认恢复','confirm-import','button primary wide')}`);}catch{pendingImport=null;toast('无法读取备份：请选择念念有词导出的有效JSON文件。');}
 }
});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;});
window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY&&e.newValue){try{state=normalizeState(JSON.parse(e.newValue));render();toast('已同步另一个页面保存的进度');}catch{}}});
if('speechSynthesis' in window)speechSynthesis.getVoices();
if('serviceWorker' in navigator && (location.protocol==='https:' || ['localhost','127.0.0.1'].includes(location.hostname))){
 navigator.serviceWorker.register('./sw.js').then(reg=>{
   if(reg.waiting)toast('新版本已准备好，关闭所有念念页面后重新打开即可更新。');
   reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)toast('新版已缓存，关闭所有念念页面后重新打开即可更新。');});});
 }).catch(()=>toast('离线缓存未能启用，当前仍可在线学习。'));
}
installMotion();
render();
if(!state.onboarded)welcome();

