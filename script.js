const grid=document.querySelector('#projects'),dialog=document.querySelector('#detail');
function projectCard(p,entry,index,ai=false){
 return `<article class="project-card ${ai?'ai-entry-card':''}" data-category="${p.category}" data-project-group="${p.id}"><button class="project-open" data-project="${p.id}" data-variant="${index}" aria-label="查看${p.title} ${entry.label||''}项目详情"><div class="image-wrap"><img loading="lazy" src="assets/${entry.cover}" alt="${p.title} ${entry.label||''}作品展示"><span class="image-label">${entry.label||(ai?'男模 / Male':'查看项目 / VIEW PROJECT')}</span></div></button><p class="card-meta">${p.en}</p><h3>${p.title}<i>${p.english}</i></h3><p class="card-tags">${p.tags}</p></article>`;
}
function render(filter='全部'){
 const selected=projects.filter(p=>filter==='全部'||p.category===filter);
 const regular=selected.filter(p=>p.category!=='AI人物');
 const ai=selected.filter(p=>p.category==='AI人物');
 grid.innerHTML=regular.map(p=>projectCard(p,{cover:p.cover},0)).join('')+
 (ai.length?`<div class="ai-project-grid" role="group" aria-label="AI 人物项目">${ai.map(p=>(p.variants||[{cover:p.cover}]).map((entry,i)=>projectCard(p,entry,i,true)).join('')).join('')}</div>`:'');
}
render();document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')});render(b.dataset.filter)}));
grid.addEventListener('click',e=>{const b=e.target.closest('[data-project]');if(!b)return;const original=projects.find(x=>x.id===b.dataset.project);const variant=original.variants?.[Number(b.dataset.variant||0)];const p=variant?{...original,images:variant.images}:original;document.querySelector('#detail-content').innerHTML=`<div class="detail-heading"><p class="small">${p.en}</p><h2>${p.title}<i>${p.english}</i></h2></div><div class="detail-desc"><p>${p.desc}</p><p class="english">${p.translation}</p><p class="card-tags">${p.tags}</p></div>${p.id==='ai'?'<div class="ai-tabs" role="tablist" aria-label="AI人物切换"><button role="tab" id="male-tab" aria-controls="ai-panel" aria-selected="true" data-ai-tab="male">男模 / Male</button><button role="tab" id="female-tab" aria-controls="ai-panel" aria-selected="false" tabindex="-1" data-ai-tab="female">女模 / Female</button></div>':''}<div class="detail-images ${p.id==='socks'?'sock-gallery':''} ${p.id==='ai'?'ai-gallery':''}" ${p.id==='ai'?'id="ai-panel" role="tabpanel" aria-labelledby="male-tab"':''}>${p.images.map((img,i)=>`<figure ${p.id==='ai'?`data-ai-group="${i<3?'male':'female'}" ${i>=3?'hidden':''}`:''} class="${img.startsWith('page')||img.includes('extra-08')||img.includes('extra-07')?'wide':''}"><img loading="lazy" src="assets/${img}" alt="${p.title} — 作品与过程 ${i+1}"><figcaption>${p.category==='AI人物'?'AI 人物视觉 / AI CHARACTER VISUAL':'作品与过程 / WORK & PROCESS'} · ${String(i+1).padStart(2,'0')}</figcaption></figure>`).join('')}</div>`;dialog.showModal();dialog.scrollTop=0;document.body.classList.add('modal-open')});function closeDetail(){dialog.close();document.body.classList.remove('modal-open')}document.querySelector('.close').addEventListener('click',closeDetail);dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDetail()}});

function switchAI(tab){document.querySelector('#ai-panel')?.setAttribute('aria-labelledby',tab+'-tab');document.querySelectorAll('[data-ai-tab]').forEach(b=>{const selected=b.dataset.aiTab===tab;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1});document.querySelectorAll('[data-ai-group]').forEach(f=>f.hidden=f.dataset.aiGroup!==tab)}
dialog.addEventListener('click',e=>{const b=e.target.closest('[data-ai-tab]');if(b)switchAI(b.dataset.aiTab)});
dialog.addEventListener('keydown',e=>{if(e.target.matches('[data-ai-tab]')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tab=e.key==='Home'?'male':e.key==='End'?'female':e.target.dataset.aiTab==='male'?'female':'male';switchAI(tab);document.querySelector(`[data-ai-tab="${tab}"]`).focus()}});

// Reveal complete works as they enter either the page or project gallery.
const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
const revealObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}})},{threshold:0.08}):null;
function revealWorks(){document.querySelectorAll('.project-card,.detail-images figure').forEach(el=>{if(el.classList.contains('motion-ready'))return;if(!motionQuery.matches&&revealObserver){el.classList.add('motion-ready');revealObserver.observe(el)}})}
new MutationObserver(revealWorks).observe(grid,{childList:true});
new MutationObserver(revealWorks).observe(document.querySelector('#detail-content'),{childList:true});
revealWorks();
const music=document.querySelector('#background-music'),musicButton=document.querySelector('#music-toggle');
music.volume=0.35;
let userPaused=false;
function syncMusic(){const playing=!music.paused;musicButton.setAttribute('aria-pressed',String(playing));musicButton.setAttribute('aria-label',playing?'暂停背景音乐':'播放背景音乐');musicButton.querySelector('.music-text').textContent=playing?'暂停音乐 / Pause':'播放音乐 / Play';musicButton.classList.toggle('is-playing',playing)}
function startMusic(){if(userPaused)return;music.play().catch(()=>syncMusic())}
musicButton.addEventListener('click',()=>{if(music.paused){userPaused=false;startMusic()}else{userPaused=true;music.pause()}});
music.addEventListener('play',syncMusic);music.addEventListener('pause',syncMusic);
music.addEventListener('error',()=>{musicButton.querySelector('.music-text').textContent='音乐暂不可用';musicButton.disabled=true});
// If autoplay is blocked, retry on the visitor's first interaction.
function firstInteraction(event){if(event.target.closest('#music-toggle'))return;startMusic();document.removeEventListener('pointerdown',firstInteraction);document.removeEventListener('keydown',firstInteraction)}
document.addEventListener('pointerdown',firstInteraction);document.addEventListener('keydown',firstInteraction);
startMusic();
