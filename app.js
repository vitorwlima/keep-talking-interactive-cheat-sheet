/* Shell: builds the tab bar from the registered modules and mounts each one.
   Modules self-register into window.CHEATSHEET_MODULES (see modules/*.js and
   docs/CONTEXT.md for the contract). Add a module by dropping a <script> in
   index.html — no changes needed here. */
(function(){
  "use strict";
  const mods = window.CHEATSHEET_MODULES || [];
  const tabsEl = document.getElementById('tabs');
  const panelsEl = document.getElementById('panels');
  const titleEl = document.getElementById('pageTitle');
  const subEl = document.getElementById('pageSub');

  const tabs=[], panels=[];

  mods.forEach((m,i)=>{
    const btn=document.createElement('button');
    btn.type='button'; btn.role='tab'; btn.id=`tab-${m.id}`;
    btn.setAttribute('aria-controls',`panel-${m.id}`);
    btn.setAttribute('aria-selected','false');
    if(m.color) btn.style.setProperty('--tabc',m.color);
    btn.innerHTML=`<span class="dot"></span>${m.name}`;
    btn.addEventListener('click',()=>activate(i));
    btn.addEventListener('keydown',e=>{
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
        e.preventDefault();
        const d=e.key==='ArrowRight'?1:-1;
        activate((i+d+mods.length)%mods.length,true);
      }
    });
    tabsEl.appendChild(btn); tabs.push(btn);

    const panel=document.createElement('div');
    panel.className='panel'; panel.id=`panel-${m.id}`;
    panel.role='tabpanel'; panel.setAttribute('aria-labelledby',`tab-${m.id}`);
    panel.hidden=true;
    panelsEl.appendChild(panel); panels.push(panel);
    m.mount(panel);
  });

  function activate(i,focus){
    mods.forEach((m,j)=>{
      const on=j===i;
      tabs[j].setAttribute('aria-selected',on?'true':'false');
      tabs[j].tabIndex = on?0:-1;
      panels[j].hidden=!on;
    });
    titleEl.textContent=mods[i].title;
    subEl.textContent=mods[i].subtitle;
    if(focus) tabs[i].focus();
  }

  if(mods.length) activate(0);
})();
