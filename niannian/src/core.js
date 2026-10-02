import { WORDS, BOOKS, byId } from './data.js';
export const STORAGE_KEY = 'niannian-state-v1';
export const GOALS = [5, 10, 15, 20];
export const INTERVALS = [1, 3, 7, 14, 30];
export const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function addDays(day, days) {
  const [y,m,d] = day.split('-').map(Number);
  return dateKey(new Date(y,m-1,d+days,12));
}
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y,m,d] = value.split('-').map(Number);
  return y >= 2000 && y <= 2200 && dateKey(new Date(y,m-1,d,12)) === value;
}
export function initialState() {
  return { version:1, goal:5, book:'animals', accent:'en-GB', slow:false, onboarded:false, favorites:[], progress:{}, history:{}, session:null };
}
export function shuffle(items, rng = Math.random) {
  const a = [...items];
  for (let i=a.length-1;i>0;i--) { const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
export function choicesFor(word, rng = Math.random) {
  const pool = WORDS.filter(x => x.book===word.book && x.id!==word.id && x.meaning!==word.meaning);
  return shuffle([word, ...shuffle(pool,rng).slice(0,3)],rng).map(x => x.id);
}
export function dueWords(state, today = dateKey()) {
  return WORDS.filter(w => state.progress[w.id]?.due <= today).sort((a,b) => state.progress[a.id].due.localeCompare(state.progress[b.id].due));
}
export function stats(state, today = dateKey()) {
  const seen = WORDS.filter(w => state.progress[w.id]);
  const count = state.history[today]?.ids.length || 0;
  let streak=0; let day=state.history[today]?.ids.length ? today : addDays(today,-1);
  while (state.history[day]?.ids.length) { streak++;day=addDays(day,-1); }
  return { learned:seen.length, mastered:seen.filter(w => state.progress[w.id].stage>=3).length, today:count, due:dueWords(state,today).length, streak };
}
export function startSession(state, mode='learn', today=dateKey(), ids=null) {
  const pool = ids ? ids.map(id=>byId[id]).filter(Boolean) : mode==='review' ? dueWords(state,today) : WORDS.filter(w => w.book===state.book && !state.progress[w.id]);
  const queue = pool.slice(0, state.goal).map(w=>w.id);
  if (!queue.length) return null;
  return { mode, queue, index:0, phase:mode==='review'?'quiz':'learn', options:choicesFor(byId[queue[0]]), selected:null, results:{}, retries:[], started:today, finished:false };
}
export function recordAnswer(state, correct, today=dateKey()) {
  const s=state.session;
  if (!s || s.finished || s.phase!=='quiz') return false;
  const id=s.queue[s.index];
  if (!byId[id]) return false;
  const first = !Object.hasOwn(s.results,id);
  if (first) {
    const old=state.progress[id];
    const stage=correct ? Math.min((old?.stage || 0)+1,5) : 0;
    state.progress[id]={ stage, due:addDays(today, INTERVALS[Math.max(stage-1,0)]), last:today, attempts:(old?.attempts||0)+1, correct:(old?.correct||0)+(correct?1:0) };
    s.results[id]=correct;
    if (!correct) s.retries.push(id);
  }
  const h=state.history[today] ||= { ids:[], answers:0, correct:0 };
  if (!h.ids.includes(id)) h.ids.push(id);
  h.answers++;if(correct) h.correct++;
  s.phase='feedback';
  return true;
}
export function advanceSession(state) {
  const s=state.session;if(!s||s.finished)return;
  if(s.phase==='learn'){s.phase='quiz';return;}
  if(s.phase!=='feedback')return;
  s.index++;
  if(s.index===s.queue.length && s.retries.length){s.queue.push(...s.retries);s.retries=[];}
  if(s.index>=s.queue.length){s.finished=true;return;}
  s.phase=Object.hasOwn(s.results,s.queue[s.index])||s.mode==='review'?'quiz':'learn';
  s.selected=null;s.options=choicesFor(byId[s.queue[s.index]]);
}
export function normalizeState(input) {
  if(!input || typeof input!=='object' || Array.isArray(input) || input.version!==1) throw new Error('这不是支持的念念有词备份文件。');
  const out=initialState();
  out.goal=GOALS.includes(input.goal)?input.goal:5;
  out.book=BOOKS.some(b=>b.id===input.book)?input.book:'animals';
  out.accent=input.accent==='en-US'?'en-US':'en-GB';out.slow=input.slow===true;out.onboarded=input.onboarded===true;
  out.favorites=Array.isArray(input.favorites)?[...new Set(input.favorites.filter(id=>Object.hasOwn(byId,id)))]:[];
  for(const w of WORDS){
    const p=input.progress?.[w.id];
    if(p && validDate(p.due) && validDate(p.last) && Number.isInteger(p.stage) && p.stage>=0 && p.stage<=5){
      const attempts=Math.max(1, Math.min(Number.isSafeInteger(p.attempts)?p.attempts:1,1000000));
      out.progress[w.id]={ stage:p.stage,due:p.due,last:p.last,attempts,correct:Math.max(0,Math.min(attempts,Number.isSafeInteger(p.correct)?p.correct:0)) };
    }
  }
  const history = input.history && typeof input.history==='object' ? Object.entries(input.history) : [];
  for(const [day,h] of history.slice(-10000)){
    if(!validDate(day)||!h||!Array.isArray(h.ids))continue;
    const ids=[...new Set(h.ids.filter(id=>Object.hasOwn(byId,id)))];
    const answers=Math.max(ids.length,Math.min(Number.isSafeInteger(h.answers)?h.answers:ids.length,1000000));
    out.history[day]={ids,answers,correct:Math.max(0,Math.min(answers,Number.isSafeInteger(h.correct)?h.correct:0))};
  }
  const s=input.session;
  if(s && ['learn','review'].includes(s.mode) && Array.isArray(s.queue) && s.queue.length>0 && s.queue.length<=40 && s.queue.every(id=>Object.hasOwn(byId,id)) && Number.isInteger(s.index) && s.index>=0 && s.index<=s.queue.length && ['learn','quiz','feedback'].includes(s.phase) && validDate(s.started)){
    const results=Object.fromEntries(Object.entries(s.results||{}).filter(([id,v])=>s.queue.includes(id)&&typeof v==='boolean'));
    const active=byId[s.queue[s.index]];
    const opts=Array.isArray(s.options)?[...new Set(s.options.filter(id=>Object.hasOwn(byId,id)))]:[];
    out.session={mode:s.mode,queue:s.queue,index:s.index,phase:s.phase,options:active&&(opts.length!==4||!opts.includes(active.id))?choicesFor(active):opts,selected:opts.includes(s.selected)?s.selected:null,results,retries:Array.isArray(s.retries)?[...new Set(s.retries.filter(id=>results[id]===false))]:[],started:s.started,finished:s.finished===true||s.index>=s.queue.length};
  }
  return out;
}
