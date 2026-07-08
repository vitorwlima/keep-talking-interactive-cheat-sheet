/* Module: Senhas (Passwords)
   Manual: "A Respeito das Senhas" — pt-BR v2.
   Each of the 5 positions cycles through several letters. Exactly one
   combination of the available letters spells one of the 35 words below.
   Type the letters you can see in each column; the tool filters to the match. */
(function(){
  "use strict";
  window.CHEATSHEET_MODULES = window.CHEATSHEET_MODULES || [];

  // The complete pt-BR password list from the manual (35 words, all 5 letters).
  const WORDS = [
    'acesa','ajuda','amigo','antes','arcos',
    'baile','balas','bispo','chefe','cheio',
    'cinto','cravo','etapa','etnia','flora',
    'lazer','legal','lugar','parte','parto',
    'perto','porta','regra','resto','salve',
    'sente','setor','sexta','tecla','tinta',
    'torta','touro','trato','valer','veado'
  ];
  const ORD = ['1ª','2ª','3ª','4ª','5ª'];

  const HTML = `
    <div class="layout">
      <section class="controls">
        <div class="field">
          <label>Letras de cada posição <span class="lbl-note">as que você consegue rodar</span></label>
          <div class="pw-cols" id="pwCols"></div>
        </div>

        <div class="answer" id="pwAnswer" style="--lc:var(--accent)">
          <div class="glyph" id="pwGlyph">35</div>
          <div class="a-text">
            <div class="verb" id="pwVerb">Candidatas</div>
            <p class="instr" id="pwInstr">Informe as letras que aparecem em cada posição.</p>
          </div>
        </div>

        <button type="button" class="pw-clear" id="pwClear">Limpar tudo</button>
        <p class="state-line" id="pwState">Dica: digite todas as letras que consegue rodar numa posição. Uma posição vazia aceita qualquer letra.</p>
      </section>

      <section>
        <p class="pw-count" id="pwCount"></p>
        <div class="pw-results" id="pwResults"></div>
        <p class="caption">As palavras vão se filtrando conforme você digita. Verde = única senha possível.</p>
      </section>
    </div>`;

  function init(root){
    const $=s=>root.querySelector(s);
    const colsWrap=$('#pwCols');
    const cols=[]; // array of {set:Set<char>}

    // build 5 letter inputs
    for(let i=0;i<5;i++){
      const wrap=document.createElement('div'); wrap.className='pw-col';
      const lab=document.createElement('label'); lab.textContent=ORD[i];
      const inp=document.createElement('input');
      inp.className='pw-slot'; inp.type='text'; inp.autocapitalize='off';
      inp.autocomplete='off'; inp.spellcheck=false; inp.setAttribute('aria-label',`Letras da posição ${i+1}`);
      inp.placeholder='—';
      inp.addEventListener('input',()=>{
        const clean=inp.value.toLowerCase().replace(/[^a-z]/g,'');
        const seen=[...new Set(clean.split(''))];
        inp.value=seen.join('').toUpperCase();
        cols[i].set=new Set(seen);
        inp.classList.toggle('filled',seen.length>0);
        render();
      });
      wrap.appendChild(lab); wrap.appendChild(inp);
      colsWrap.appendChild(wrap);
      cols.push({inp, set:new Set()});
    }

    // results chips
    const chips = WORDS.map(w=>{
      const el=document.createElement('div'); el.className='pw-word'; el.textContent=w.toUpperCase();
      $('#pwResults').appendChild(el);
      return {w, el};
    });

    function matches(w){
      for(let i=0;i<5;i++){ const s=cols[i].set; if(s.size && !s.has(w[i])) return false; }
      return true;
    }

    function render(){
      const hits=[];
      chips.forEach(c=>{
        const ok=matches(c.w);
        c.el.classList.toggle('match',ok);
        c.el.classList.remove('sole');
        if(ok) hits.push(c);
      });
      const n=hits.length;
      const anyInput = cols.some(c=>c.set.size>0);
      $('#pwCount').textContent = anyInput ? `${n} de ${WORDS.length} possíveis` : `${WORDS.length} senhas no total`;

      const answer=$('#pwAnswer'), glyph=$('#pwGlyph'), verb=$('#pwVerb'), instr=$('#pwInstr');
      glyph.textContent=n;
      if(n===1){
        hits[0].el.classList.add('sole');
        answer.style.setProperty('--lc','var(--green)');
        verb.textContent='Senha encontrada';
        instr.textContent=hits[0].w.toUpperCase();
      } else if(n===0){
        answer.style.setProperty('--lc','var(--red)');
        verb.textContent='Nenhuma senha';
        instr.textContent='Nenhuma combinação bate. Revise as letras.';
      } else {
        answer.style.setProperty('--lc','var(--accent)');
        verb.textContent='Candidatas';
        instr.textContent = anyInput
          ? 'Rode mais letras nas posições e digite-as para restringir.'
          : 'Informe as letras que aparecem em cada posição.';
      }
    }

    $('#pwClear').addEventListener('click',()=>{
      cols.forEach(c=>{ c.set=new Set(); c.inp.value=''; c.inp.classList.remove('filled'); });
      cols[0].inp.focus();
      render();
    });

    render();
  }

  window.CHEATSHEET_MODULES.push({
    id:'passwords',
    name:'Senhas',
    color:'var(--blue)',
    title:'Senhas',
    subtitle:'Digite as letras disponíveis em cada posição. A senha correspondente é destacada.',
    mount(root){ root.innerHTML=HTML; init(root); }
  });
})();
