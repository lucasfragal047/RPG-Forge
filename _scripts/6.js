
// Camada de edição e ferramentas funcionais
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const logMsg2=m=>{const l=$('#log');if(l){l.innerHTML='<div><b>Sistema:</b> '+String(m).replaceAll('<','&lt;')+'</div>'+l.innerHTML;l.scrollTop=0}};

  // Grade: alternar visibilidade e tamanho
  const grid=$('.grid');
  const snap=$('#snap');
  const gridBtn=document.createElement('button');
  gridBtn.className='btn';gridBtn.id='gridToggle';gridBtn.textContent='Grade: ligada';
  snap.parentNode.insertBefore(gridBtn,snap);
  gridBtn.onclick=()=>{
    const off=grid.style.display==='none';
    grid.style.display=off?'block':'none';
    gridBtn.textContent='Grade: '+(off?'ligada':'desligada');
  };
  snap.title='Ativa/desativa encaixe dos tokens na grade';
  const sizeBtn=document.createElement('button');
  sizeBtn.className='btn';sizeBtn.textContent='Grade 50px';
  snap.parentNode.insertBefore(sizeBtn,snap.nextSibling);
  sizeBtn.onclick=()=>{
    const sizes=[25,50,75,100],cur=parseInt(grid.style.backgroundSize)||50;
    const n=sizes[(sizes.indexOf(cur)+1)%sizes.length];
    grid.style.backgroundSize=n+'px '+n+'px';sizeBtn.textContent='Grade '+n+'px';
  };
  // A grade pode ficar por cima do cenário, sem bloquear cliques.
  const overlayBtn=document.createElement('button');
  overlayBtn.className='btn';overlayBtn.id='gridOverlayToggle';
  function updateGridOverlay(){
    const on=grid.dataset.overlay==='1';
    grid.style.zIndex=on?'8':'0';
    grid.style.pointerEvents='none';
    // No modo sobrepor, somente as linhas da grade ficam sobre o cenário.
    // O fundo da grade precisa ficar transparente para não cobrir o mapa.
    grid.style.backgroundColor=on?'transparent':'';
    overlayBtn.textContent='Grade sobrepor: '+(on?'ligada':'desligada');
    overlayBtn.classList.toggle('active',on);
  }
  overlayBtn.onclick=()=>{grid.dataset.overlay=grid.dataset.overlay==='1'?'0':'1';updateGridOverlay()};
  updateGridOverlay();
  const toolsWrap=$('#mapToolsWrap'),toolsPanel=$('#mapToolsPanel'),toolsToggle=$('#mapToolsToggle');
  toolsToggle.onclick=e=>{e.stopPropagation();toolsWrap.classList.toggle('open');toolsToggle.title=toolsWrap.classList.contains('open')?'Fechar ferramentas do mapa':'Abrir ferramentas do mapa'};
  [gridBtn,snap,sizeBtn,overlayBtn].forEach(b=>{if(b)toolsPanel.appendChild(b)});

  // Medição: ativa a ferramenta, clique no ponto A, mova o mouse para visualizar a reta e clique no ponto B. Cada quadrado = 1,5 m.
  let measureStart=null,measureEl=null,measureLabel=null;
  const GRID_SIZE=50, METERS_PER_SQUARE=1.5;
  const oldToolButtons=$$('.tool');
  oldToolButtons.forEach(b=>b.addEventListener('click',()=>{
    if(b.dataset.tool!=='measure'){
      measureStart=null;
      if(measureEl)measureEl.remove();
      measureEl=measureLabel=null;
    }else{
      clearMeasure();
    }
  }));
  function clearMeasure(){
    measureStart=null;
    if(measureEl)measureEl.remove();
    measureEl=measureLabel=null;
  }
  function snapMeasurePoint(e){
    const raw=pos(e);
    return [Math.round((raw[0]-GRID_SIZE/2)/GRID_SIZE)*GRID_SIZE+GRID_SIZE/2,
            Math.round((raw[1]-GRID_SIZE/2)/GRID_SIZE)*GRID_SIZE+GRID_SIZE/2];
  }
  function updateMeasure(p,final){
    if(!measureStart||!measureEl)return;
    const dx=p[0]-measureStart[0],dy=p[1]-measureStart[1];
    const gridX=Math.abs(Math.round(dx/GRID_SIZE));
    const gridY=Math.abs(Math.round(dy/GRID_SIZE));
    // Em Pathfinder 2e, cada quadrado percorrido vale 1,5 m, inclusive nas diagonais.
    const squares=Math.max(gridX,gridY);
    const meters=squares*METERS_PER_SQUARE;
    const px=Math.hypot(dx,dy);
    measureEl.style.width=px+'px';
    measureEl.style.transform='rotate('+Math.atan2(dy,dx)+'rad)';
    measureLabel.textContent=final
      ? squares+' quadrados · '+meters.toFixed(1)+' m'
      : 'Ponto A → '+squares+' quadrados · '+meters.toFixed(1)+' m';
  }
  stage.addEventListener('pointermove',e=>{
    if(tool!=='measure'||!measureStart)return;
    e.preventDefault();
    updateMeasure(snapMeasurePoint(e),false);
  },true);
  stage.addEventListener('pointerdown',e=>{
    if(tool!=='measure'||e.target.closest('.toolbar')||e.target.closest('.token'))return;
    e.preventDefault();
    e.stopPropagation();
    const p=snapMeasurePoint(e);
    // Se já existe uma medição concluída, um novo clique começa outra no ponto A.
    if(!measureStart && measureEl){
      measureEl.remove();
      measureEl=null;measureLabel=null;
    }
    if(!measureStart){
      measureStart=p;
      measureEl=document.createElement('div');
      measureEl.className='measure';
      measureEl.style.left=p[0]+'px';
      measureEl.style.top=p[1]+'px';
      measureEl.style.width='0px';
      map.appendChild(measureEl);
      measureLabel=document.createElement('span');
      measureLabel.className='badge';
      measureLabel.textContent='Ponto A — mova o mouse e clique no ponto B';
      measureEl.appendChild(measureLabel);
      return;
    }
    updateMeasure(p,true);
    logMsg2('Distância medida: '+measureLabel.textContent+'.');
    measureStart=null;
  },true);

  // Campos numéricos editáveis: transforma valores de fichas, iniciativa e PV em inputs.
  function editableText(el,parser,apply){
    if(!el||el.dataset.editable)return;
    el.dataset.editable='1';el.title='Clique para editar';
    el.addEventListener('dblclick',e=>{
      e.stopPropagation();
      const old=el.textContent.trim(),input=document.createElement('input');
      input.type='number';input.value=parser(old);input.style.cssText='width:80px;padding:3px;text-align:center';
      el.textContent='';el.appendChild(input);input.focus();input.select();
      const finish=()=>{const n=Number(input.value);if(Number.isFinite(n))apply(n);else el.textContent=old;el.dataset.editable='1'};
      input.onkeydown=e=>{if(e.key==='Enter')finish();if(e.key==='Escape'){el.textContent=old;el.dataset.editable='1'}};
      input.onblur=finish;
    });
  }
  $$('.init strong').forEach(el=>editableText(el,s=>parseInt(s)||0,n=>el.textContent=n));
  $$('.forgeStat b').forEach(el=>{
    const t=el.textContent.trim();
    if(/^[-+]?\d+(?:\s*\/\s*[-+]?\d+)?$/.test(t)){
      editableText(el,s=>parseInt(s)||0,n=>{
        if(t.includes('/')){const max=t.split('/')[1].trim();el.textContent=n+' / '+max}else el.textContent=n;
      });
    }
  });
  $$('.card .row span:last-child').forEach(el=>{
    const t=el.textContent.trim();
    if(/^[-+]?\d+(?:\s*\/\s*[-+]?\d+)?$/.test(t))editableText(el,s=>parseInt(s)||0,n=>{el.textContent=t.includes('/')?n+' / '+t.split('/')[1].trim():n});
  });
  $$('.hpbar i').forEach(el=>{el.title='Duplo clique para definir PV em %';el.ondblclick=e=>{
    e.stopPropagation();const n=prompt('PV em porcentagem (0 a 100):',parseFloat(el.style.width)||100);
    if(n!==null&&!isNaN(n))el.style.width=Math.max(0,Math.min(100,+n))+'%';
  }});

  // Iniciativa completa: adicionar/remover participantes e editar nomes/números.
  const initSection=$$('.section').find(s=>s.querySelector('h3')?.textContent.trim()==='Iniciativa');
  if(initSection){
    const add=document.createElement('button');add.id='addInitiativeBtn';add.className='btn';add.style.cssText='width:100%;margin-top:7px';add.textContent='+ Adicionar iniciativa';
    initSection.appendChild(add);
    const remove=document.createElement('button');remove.id='removeInitiativeBtn';remove.className='btn';remove.style.cssText='width:100%;margin-top:7px';remove.textContent='− Remover iniciativa';
    initSection.appendChild(remove);
    initSection.querySelectorAll('.init').forEach(card=>{
      card.title='Duplo clique no nome ou número para editar · botão direito para remover';
      const name=card.querySelector('span:nth-child(2)');
      editableText(name,s=>s,n=>name.textContent=String(n));
      card.addEventListener('contextmenu',e=>{e.preventDefault();if(confirm('Remover '+name.textContent+' da iniciativa?'))card.remove()});
    });
    add.onclick=()=>{
      const name=prompt('Nome do participante:','Novo participante');if(!name)return;
      const val=prompt('Iniciativa:','10');if(val===null)return;
      const c=document.createElement('div');c.className='card init';
      c.innerHTML='<span class="dot player">?</span><span></span><strong></strong>';
      c.querySelector('span:nth-child(2)').textContent=name;c.querySelector('strong').textContent=Number(val)||0;
      initSection.insertBefore(c,add);editableText(c.querySelector('strong'),s=>parseInt(s)||0,n=>c.querySelector('strong').textContent=n);
      logMsg2(name+' adicionado à iniciativa.');
      window.rpgForge?.refreshInitiative?.();
    };
    remove.onclick=()=>{
      const cards=[...initSection.querySelectorAll('.init')];
      if(!cards.length){alert('Não há participantes na iniciativa.');return;}
      const list=cards.map((c,i)=>(i+1)+'. '+(c.querySelector('span:nth-child(2)')?.textContent.trim()||'Sem nome')).join('\n');
      const answer=prompt('Qual participante deseja remover?\n\n'+list+'\n\nDigite o número da lista ou o nome:');
      if(answer===null)return;
      const n=Number(answer);
      let target=Number.isInteger(n)&&n>=1&&n<=cards.length ? cards[n-1] : cards.find(c=>(c.querySelector('span:nth-child(2)')?.textContent.trim()||'').toLowerCase()===answer.trim().toLowerCase());
      if(!target){alert('Participante não encontrado.');return;}
      const name=target.querySelector('span:nth-child(2)')?.textContent.trim()||'Sem nome';
      target.remove();
      logMsg2(name+' removido da iniciativa.');
      window.rpgForge?.refreshInitiative?.();
    };
  }  // Controlador real de turnos: sempre segue a maior iniciativa para a menor.
  if(initSection){
    const nextBtn=document.querySelector('#next');
    const badge=document.querySelector('#turnBadge');
    let currentCard=null;
    const getCards=()=>Array.from(initSection.querySelectorAll('.init')).filter(c=>c.querySelector('span:nth-child(2)')&&c.querySelector('strong'));
    const getValue=c=>Number.parseFloat((c.querySelector('strong')?.textContent||'0').trim().replace(',','.'))||0;
    const getName=c=>(c.querySelector('span:nth-child(2)')?.textContent||'Sem nome').trim()||'Sem nome';
    const sortInitiative=()=>{
      const cards=getCards();
      cards.sort((a,b)=>getValue(b)-getValue(a));
      const addBtn=initSection.querySelector('#addInitiativeBtn');
      cards.forEach(c=>initSection.insertBefore(c,addBtn||null));
      return cards;
    };
    const markCurrent=(card,writeLog)=>{
      const cards=getCards();
      cards.forEach(c=>{c.dataset.current='0';c.style.outline='';c.style.boxShadow='';});
      if(!card){currentCard=null;if(badge)badge.textContent='⚔️ Turno: —';return;}
      currentCard=card; card.dataset.current='1';
      card.style.outline='2px solid #d6a85d';
      card.style.boxShadow='0 0 0 3px rgba(214,168,93,.18)';
      const name=getName(card);
      if(badge)badge.textContent='⚔️ Turno: '+name;
      if(writeLog)logMsg2('Turno avançou para '+name+'.');
    };
    const refreshInitiative=()=>{
      const cards=sortInitiative();
      if(!cards.length){markCurrent(null,false);return;}
      if(currentCard && cards.includes(currentCard)){
        markCurrent(currentCard,false);
      }else{
        const saved=cards.find(c=>c.dataset.current==='1');
        markCurrent(saved||cards[0],false);
      }
    };
    const advanceTurn=()=>{
      const cards=sortInitiative();
      if(!cards.length)return;
      let index=currentCard?cards.indexOf(currentCard):-1;
      if(index<0) index=cards.findIndex(c=>c.dataset.current==='1');
      const next=cards[(index+1+cards.length)%cards.length];
      markCurrent(next,true);
    };
    window.rpgForge=Object.assign(window.rpgForge||{}, {refreshInitiative, advanceTurn});
    if(nextBtn)nextBtn.onclick=advanceTurn;
    // Editar iniciativa também mantém a ordem e o participante atual.
    const bindEdit=(card)=>{
      if(card.dataset.turnBound==='1')return;
      card.dataset.turnBound='1';
      const strong=card.querySelector('strong');
      ['input','change','blur'].forEach(ev=>strong?.addEventListener(ev,refreshInitiative));
    };
    getCards().forEach(bindEdit);
    new MutationObserver(()=>{
      // Observa apenas novas cartas. Não chama refreshInitiative aqui,
      // porque refreshInitiative reorganiza o DOM e isso causaria um loop infinito.
      getCards().forEach(bindEdit);
    }).observe(initSection,{childList:true});
    refreshInitiative();
  }



  // Botão de dano permite escolher o valor; PV do selecionado pode ser alterado diretamente.
  const damage=$('#damage');
  if(damage)damage.onclick=()=>{
    const n=prompt('Quanto de dano aplicar?','5');if(n===null||isNaN(n))return;
    const hp=$('.hpbar i');hp.style.width=Math.max(0,(parseFloat(hp.style.width)||0)-Number(n)*100/42)+'%';
    damage.textContent='Aplicar dano';logMsg2('Dano aplicado: '+n);
  };

  // Nome e valores do painel selecionado ficam editáveis com duplo clique.
  const selected=$('#selected');
  if(selected){
    selected.querySelectorAll('.row span:last-child').forEach(el=>{
      if(/\d/.test(el.textContent))editableText(el,s=>parseInt(s)||0,n=>el.textContent=String(n));
    });
    const title=selected.querySelector('b');
    if(title){title.title='Duplo clique para renomear';title.ondblclick=()=>{const n=prompt('Nome:',title.textContent);if(n)title.textContent=n}};
  }

  // Ferramentas: apagar névoa, marcações, medições e efeitos com clique direito.
  stage.addEventListener('contextmenu',e=>{
    const target=e.target.closest('.fog,.spellArea,.visionRing,.measure');
    if(target){e.preventDefault();target.remove();logMsg2('Elemento removido do mapa.')}
  });
  logMsg2('Edição livre ativada: números com duplo clique, grade e medição funcionais.');
})();
