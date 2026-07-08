/* Module: Fios Complicados (Complicated Wires)
   Manual: "A Respeito dos Fios Complicados" — pt-BR v2.
   Each wire is described by up to 4 traits (red, blue, ★ symbol, LED lit);
   the trait combination maps to one instruction letter (C/N/S/P/B).
   See docs/complicated-wires.md for the full rule table. */
(function(){
  "use strict";
  window.CHEATSHEET_MODULES = window.CHEATSHEET_MODULES || [];

  const HTML = `
    <div class="layout">
      <section class="controls">
        <div class="field">
          <label>Cor do fio <span class="lbl-note">até 2</span></label>
          <div class="seg" id="colorSeg" role="group" aria-label="Cor do fio, até duas"></div>
        </div>
        <div class="field">
          <label>Características</label>
          <div class="toggles" id="toggles"></div>
        </div>

        <div class="answer" style="--lc:var(--accent)">
          <div class="glyph" id="glyph">C</div>
          <div class="a-text">
            <div class="verb" id="verb">Corte</div>
            <p class="instr" id="instr">Corte o fio.</p>
          </div>
        </div>
        <p class="state-line" id="stateLine"></p>
      </section>

      <section>
        <div class="stage" id="stage">
          <canvas id="hl" width="1060" height="790"></canvas>
          <svg id="svg" viewBox="0 0 1060 790" aria-hidden="true"></svg>
        </div>
        <p class="caption">Clique numa área do diagrama para carregá-la nos controles.</p>
      </section>
    </div>`;

  function init(root){
    const COLORS=[
      {id:'branco',  name:'Branco',   color:'var(--wire-white)'},
      {id:'vermelho',name:'Vermelho', color:'var(--red)'},
      {id:'azul',    name:'Azul',     color:'var(--blue)'},
    ];
    const RINGS=[
      {id:'V', color:'var(--red)',  dash:'22 9 4 9', w:3.5},
      {id:'A', color:'var(--blue)', dash:'',         w:4},
      {id:'Y', color:'var(--gold)', dash:'0.5 13',   w:4.5},
      {id:'L', color:'var(--green)',dash:'16 12',    w:8},
    ];
    const RULES={
      C:{verb:'Corte',       instr:'Corte o fio.',                                         color:'var(--green)'},
      N:{verb:'Não corte',   instr:'Não corte o fio.',                                     color:'var(--red)'},
      S:{verb:'Se série par',instr:'Corte se o último dígito do número de série for par.',  color:'var(--blue)'},
      P:{verb:'Se paralela', instr:'Corte se a bomba tem uma entrada paralela.',            color:'var(--violet)'},
      B:{verb:'Se 2+ pilhas',instr:'Corte se a bomba tem duas ou mais pilhas.',             color:'var(--gold)'},
    };
    const MAP={
      '0000':'C','1000':'S','0100':'S','0010':'C','0001':'N',
      '1100':'S','1010':'C','1001':'B','0110':'N','0101':'P','0011':'B',
      '1110':'P','1101':'S','1011':'B','0111':'P','1111':'N'
    };
    const LABELS=[
      {x:300,y:135,k:'1000'},{x:715,y:120,k:'0100'},{x:250,y:255,k:'1010'},
      {x:510,y:225,k:'1100'},{x:760,y:255,k:'0101'},{x:150,y:375,k:'0010'},
      {x:395,y:375,k:'1110'},{x:625,y:380,k:'1101'},{x:855,y:375,k:'0001'},
      {x:505,y:490,k:'1111'},{x:340,y:545,k:'0110'},{x:660,y:545,k:'1001'},
      {x:430,y:585,k:'0111'},{x:585,y:585,k:'1011'},{x:505,y:657,k:'0011'},
      {x:500,y:45,k:'0000'}
    ];
    const ELL={
      V:{cx:444.13,cy:314.00,rx:200.40,ry:314.82,rot:137.70},
      A:{cx:588.95,cy:330.28,rx:244.96,ry:298.11,rot:47.40},
      Y:{cx:330.57,cy:443.19,rx:208.25,ry:315.67,rot:149.09},
      L:{cx:682.60,cy:437.91,rx:211.60,ry:323.28,rot:-135.40}
    };
    const CON={
      V:[-8.312688436300188e-06,6.736900377025684e-06,-7.67514039716028e-06,0.005268451598717808,0.0018279638196387342,-1],
      A:[-2.159171668207587e-06,-8.481469107078647e-07,-2.2304842031733703e-06,0.0028234251444104724,0.0019728915710526575,-1],
      Y:[-9.305226905858379e-06,5.443138751460241e-06,-6.3885817538167595e-06,0.0037396691888329334,0.0038634284551362905,-1],
      L:[-1.2032290652821433e-06,-9.575011718193816e-07,-1.1898733887160036e-06,0.00206193604736094,0.001695691514744591,-1]
    };
    const inside=(c,x,y)=>c[0]*x*x+c[1]*x*y+c[2]*y*y+c[3]*x+c[4]*y+c[5]>0;
    const bitsAt=(x,y)=>(inside(CON.V,x,y)?'1':'0')+(inside(CON.A,x,y)?'1':'0')+(inside(CON.Y,x,y)?'1':'0')+(inside(CON.L,x,y)?'1':'0');

    const state={colors:['branco'], Y:false, L:false};
    const $=s=>root.querySelector(s);

    // wire-color multi-select (max 2; branco is a no-op alongside a color)
    const seg=$('#colorSeg');
    COLORS.forEach(c=>{
      const b=document.createElement('button'); b.type='button'; b.dataset.id=c.id;
      b.setAttribute('aria-pressed','false'); b.style.setProperty('--bc',c.color);
      b.innerHTML=`<span class="bead"></span>${c.name}`;
      b.addEventListener('click',()=>toggleColor(c.id));
      seg.appendChild(b);
    });
    function toggleColor(id){
      const i=state.colors.indexOf(id);
      if(i>=0) state.colors.splice(i,1);
      else { state.colors.push(id); if(state.colors.length>2) state.colors.shift(); }
      render();
    }

    // feature toggles
    const togs=[{id:'Y',name:'Símbolo ★',color:'var(--gold)'},{id:'L',name:'LED',color:'var(--green)'}];
    const togWrap=$('#toggles');
    togs.forEach(t=>{
      const b=document.createElement('button'); b.type='button'; b.className='toggle'; b.dataset.id=t.id;
      b.setAttribute('aria-pressed','false'); b.style.setProperty('--tc',t.color);
      b.innerHTML=`<span class="sw"></span>${t.name}`;
      b.addEventListener('click',()=>{state[t.id]=!state[t.id]; render();});
      togWrap.appendChild(b);
    });

    // SVG diagram
    const svg=$('#svg'), NS='http://www.w3.org/2000/svg';
    RINGS.forEach(r=>{
      const e=ELL[r.id], el=document.createElementNS(NS,'ellipse');
      el.setAttribute('class','ring'); el.dataset.id=r.id;
      el.setAttribute('cx',e.cx); el.setAttribute('cy',e.cy); el.setAttribute('rx',e.rx); el.setAttribute('ry',e.ry);
      el.setAttribute('transform',`rotate(${e.rot} ${e.cx} ${e.cy})`);
      el.setAttribute('stroke',r.color); el.setAttribute('stroke-width',r.w); el.setAttribute('stroke-linecap','round');
      if(r.dash) el.setAttribute('stroke-dasharray',r.dash);
      svg.appendChild(el);
    });
    const labelEls=LABELS.map(L=>{
      const ch=document.createElementNS(NS,'circle');
      ch.setAttribute('class','lchip'); ch.setAttribute('cx',L.x); ch.setAttribute('cy',L.y); ch.setAttribute('r',26);
      svg.appendChild(ch);
      const t=document.createElementNS(NS,'text');
      t.setAttribute('class','rlabel'); t.setAttribute('x',L.x); t.setAttribute('y',L.y);
      t.setAttribute('font-size', L.k==='0000'?'30':'34'); t.textContent=MAP[L.k];
      svg.appendChild(t);
      return {L,t,ch};
    });

    // highlight canvas
    const cv=$('#hl'), ctx=cv.getContext('2d'), W=cv.width, H=cv.height, img=ctx.createImageData(W,H);
    function fillColor(){
      const s=getComputedStyle(document.documentElement).getPropertyValue('--hlfill').trim();
      const m=s.match(/rgba?\(([^)]+)\)/); if(!m) return [196,124,26,80];
      const p=m[1].split(',').map(parseFloat); return [p[0],p[1],p[2],Math.round((p[3]??1)*255)];
    }
    function drawHighlight(key){
      const d=img.data; d.fill(0);
      if(key!=='0000'){
        const [r,g,b,a]=fillColor();
        for(let y=0;y<H;y++) for(let x=0;x<W;x++){
          if(bitsAt(x+.5,y+.5)===key){ const i=(y*W+x)*4; d[i]=r; d[i+1]=g; d[i+2]=b; d[i+3]=a; }
        }
      }
      ctx.putImageData(img,0,0);
    }

    function render(){
      const V=state.colors.includes('vermelho'), A=state.colors.includes('azul');
      const key=(V?'1':'0')+(A?'1':'0')+(state.Y?'1':'0')+(state.L?'1':'0');
      const letter=MAP[key], rule=RULES[letter];

      [...seg.children].forEach(b=>b.setAttribute('aria-pressed', state.colors.includes(b.dataset.id)?'true':'false'));
      [...togWrap.children].forEach(b=>b.setAttribute('aria-pressed', state[b.dataset.id]?'true':'false'));

      const on={V,A,Y:state.Y,L:state.L};
      svg.querySelectorAll('ellipse.ring').forEach(el=>{
        const r=RINGS.find(x=>x.id===el.dataset.id), lit=on[el.dataset.id];
        el.style.opacity=lit?1:0.22; el.style.strokeWidth=lit?r.w*1.15:r.w;
      });

      root.querySelector('.answer').style.setProperty('--lc',rule.color);
      $('#glyph').textContent=letter; $('#verb').textContent=rule.verb; $('#instr').textContent=rule.instr;

      const names=(state.colors.length?state.colors:['branco']).map(id=>COLORS.find(c=>c.id===id).name.toLowerCase());
      $('#stateLine').innerHTML=`Fio <b>${names.join(' e ')}</b> · <b>${state.Y?'com':'sem'}</b> símbolo · LED <b>${state.L?'ligado':'desligado'}</b>`;

      labelEls.forEach(o=>{ const act=o.L.k===key; o.t.classList.toggle('active',act); o.ch.classList.toggle('active',act); });

      drawHighlight(key);
    }

    $('#stage').addEventListener('click',ev=>{
      const r=ev.currentTarget.getBoundingClientRect();
      const b=bitsAt((ev.clientX-r.left)/r.width*W,(ev.clientY-r.top)/r.height*H);
      const cols=[]; if(b[0]==='1')cols.push('vermelho'); if(b[1]==='1')cols.push('azul');
      state.colors = cols.length?cols:['branco'];
      state.Y=b[2]==='1'; state.L=b[3]==='1';
      render();
    });

    new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',render);
    render();
  }

  window.CHEATSHEET_MODULES.push({
    id:'complicated-wires',
    name:'Fios Complicados',
    color:'var(--red)',
    title:'Corte de fios',
    subtitle:'Descreva o fio. A área correspondente acende e a instrução aparece ao lado.',
    mount(root){ root.innerHTML=HTML; init(root); }
  });
})();
