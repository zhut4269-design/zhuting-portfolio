// Display original portfolio artwork through SVG viewports without modifying pixels.
const frames={
 mascot:['welcome',1015,2200,'150 540 800 750'],
 avatar:['welcome',1015,2200,'180 700 610 580'],
 sleepy:['guide',1015,2200,'0 855 1015 760'],
 nap:['home',1147,2200,'660 855 365 325'],
 hand:['hand',1015,2200,'0 650 1015 1000'],
 run:['lesson',1015,2200,'182 755 185 167'],
 rest:['lesson',1015,2200,'34 1770 300 215'],
 cheer:['home',1147,2200,'255 1375 242 280'],
 praise:['home',1147,2200,'644 1342 259 315']
};
export function artwork(name,cls=''){
 const [file,w,h,box]=frames[name]||frames.mascot;
 const cut=name==='cheer'?'polygon(30% 7%,100% 7%,100% 100%,0 100%,0 27%,30% 27%)':name==='praise'?'polygon(27% 0,100% 0,100% 100%,0 100%,0 34%,27% 34%)':'';
 return `<svg class="original-art art-${name} ${cls}" ${cut?`style="clip-path:${cut}"`:''} viewBox="${box}" aria-hidden="true" focusable="false"><image href="./assets/original-${file}.png" width="${w}" height="${h}"/></svg>`;
}
const paths={
 home:'<path d="M4 15 19 3 35 15h-5v19H10V15z" fill="#f8e7a0"/><path d="m3 15 8-9 4 1L7 19z" fill="#eaaa77"/><path d="M15 20v11" stroke="#926033" stroke-width="3"/>',
 plan:'<rect x="7" y="4" width="25" height="31" rx="4"/><path d="m16 21 10-11M14 29h12" stroke="#926033" stroke-width="3" stroke-linecap="round"/>',
 review:'<path d="M6 6h28v24H21l-5 7v-7H6z"/><path d="M13 16q7 12 14 0" fill="none" stroke="#926033" stroke-width="3" stroke-linecap="round"/>',
 books:'<path d="M5 7h30l-5 21H10z"/><path d="M3 4l5 5m6 5h14m-12 6h9" fill="none" stroke="#926033" stroke-width="2.7" stroke-linecap="round"/><circle cx="14" cy="34" r="3"/><circle cx="28" cy="34" r="3"/>',
 cat:'<path d="M7 17Q1 1 14 8q7-4 13 0Q40 1 33 18q5 17-13 18Q1 35 7 17z"/><path d="m11 20 5-2m9 0 5 2" stroke="#926033" stroke-width="2.5" stroke-linecap="round"/>'
};
export const navIcon=name=>`<svg viewBox="0 0 40 40" class="portfolio-icon" fill="#f7e5a0" aria-hidden="true">${paths[name]||paths.cat}</svg>`;

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
export function animateContent(previousIndex){
 if(reduced.matches)return;
 document.querySelectorAll('#main > *, .reference-grid > *').forEach((el,i)=>{
  el.animate([{opacity:0,transform:'translateY(12px) scale(.99)'},{opacity:1,transform:'none'}],{duration:440,delay:Math.min(i,5)*35,easing:'cubic-bezier(.2,.8,.2,1)'});
 });
 const lens=document.querySelector('.nav-lens');
 if(lens&&previousIndex!==undefined){const next=Number(lens.dataset.index),width=lens.getBoundingClientRect().width;lens.animate([{transform:`translateX(${(previousIndex-next)*width}px) scaleX(1.15)`},{transform:'translateX(0) scaleX(.96)',offset:.78},{transform:'none'}],{duration:520,easing:'cubic-bezier(.22,.8,.2,1)'});}
}
export function installMotion(){
 document.addEventListener('pointerdown',e=>{
  const el=e.target.closest('button:not(:disabled),.mobile-nav a');if(!el||reduced.matches)return;
  el.animate([{transform:'scale(1)'},{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:380,easing:'cubic-bezier(.2,.8,.2,1)'});
 },{passive:true});
 let frame;
 document.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||reduced.matches||frame)return;
  const el=e.target.closest('.liquid,.mobile-nav,dialog');if(!el)return;
  frame=requestAnimationFrame(()=>{const r=el.getBoundingClientRect();el.style.setProperty('--light-x',`${e.clientX-r.left}px`);el.style.setProperty('--light-y',`${e.clientY-r.top}px`);frame=null;});
 },{passive:true});
 reduced.addEventListener('change',()=>{if(reduced.matches)document.getAnimations().forEach(a=>a.cancel());});
}
