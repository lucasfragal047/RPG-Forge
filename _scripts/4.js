
// Central de campanha: salas, jogadores, fichas, inventário, mapas, combate, visão e efeitos
(function(){
  const style=document.createElement('style');
  style.textContent='.magicSideItem:hover{transform:translateY(-1px)}.forgePanel{position:fixed;z-index:50;inset:10%;background:#171a20;border:1px solid #444b57;border-radius:12px;padding:18px;box-shadow:0 20px 70px #000b;overflow:auto}.pf2eSheetPanel{position:fixed;z-index:100;right:0;top:0;bottom:0;width:min(520px,94vw);background:#15181e;border-left:1px solid #454c58;box-shadow:-18px 0 60px #000b;display:flex;flex-direction:column;color:#eee}.pf2eSheetHead{position:sticky;top:0;z-index:2;padding:15px 16px;background:#1d222a;border-bottom:1px solid #353c47;display:flex;justify-content:space-between;gap:10px}.pf2eSheetHead h2{margin:0 0 4px;font-size:20px}.pf2eSheetBody{overflow:auto;padding:14px 16px 30px}.pf2eSec{border:1px solid #303641;background:#1b2027;border-radius:9px;padding:10px;margin-bottom:11px}.pf2eSec h3{margin:0 0 9px;font-size:15px}.pf2eGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.pf2eSix{grid-template-columns:repeat(3,minmax(0,1fr))}.pf2eFieldWrap,.pf2eTextWrap{position:relative;display:block}.pf2eFieldWrap span,.pf2eTextWrap span{display:block;font-size:11px;color:#aeb6c3;margin-bottom:3px}.pf2eInput,.pf2eTextarea{box-sizing:border-box;width:100%;background:#111419;color:#f2f2f2;border:1px solid #3b424d;border-radius:5px;padding:7px 27px 7px 7px;outline:none}.pf2eInput:focus,.pf2eTextarea:focus{border-color:#7589ad}.pf2eRemove{position:absolute;right:3px;top:19px;border:0;background:transparent;color:#aeb6c3;cursor:pointer;font-size:16px;padding:2px 5px}.pf2eTextWrap{margin-top:8px}.pf2eTextWrap .pf2eRemove{top:20px}.pf2eList{display:flex;flex-direction:column;gap:5px}.pf2eRow{display:grid;grid-template-columns:1.1fr 1fr 1fr 26px;gap:5px;position:relative}.pf2eRow .pf2eRemove{position:static;background:#252b34;border-radius:5px}.pf2eAdd{width:100%;margin-top:7px}.pf2eSheetPanel .small{color:#aeb6c3}@media(max-width:600px){.pf2eGrid,.pf2eSix{grid-template-columns:1fr 1fr}.pf2eRow{grid-template-columns:1fr 1fr 1fr 26px}}.forgeGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}.forgeStat{padding:10px;background:#20252e;border:1px solid #303641;border-radius:8px}.forgePanel h2{margin:0 0 14px}.forgeClose{float:right}.visionRing{position:absolute;border:2px solid #d6a85d;border-radius:50%;background:#0005;pointer-events:none;z-index:5}.playerList div{padding:7px;border-bottom:1px solid #303641}@media(max-width:900px){.forgePanel{inset:3%;font-size:13px}}';
  document.head.appendChild(style);
  function addControls(){
    const h=document.querySelector('header'),tb=document.querySelector('.toolbar'),r=document.querySelector('.right'),side=document.querySelector('.side');
    const main=document.querySelector('.main');
    const addSideCollapse=(el,isRight)=>{
      if(!el||el.querySelector(':scope > .sideCollapse'))return;
      const b=document.createElement('button');
      b.className='sideCollapse';
      b.type='button';
      b.title=isRight?'Minimizar barra lateral direita':'Minimizar barra lateral esquerda';
      b.textContent=isRight?'›':'‹';
      el.insertBefore(b,el.firstChild);
      const key=isRight?'rpgForgeRightSideCollapsedV1':'rpgForgeLeftSideCollapsedV1';
      const apply=(collapsed)=>{
        el.classList.toggle('collapsed',collapsed);
        main.classList.toggle(isRight?'rightCollapsed':'leftCollapsed',collapsed);
        b.textContent=collapsed?(isRight?'‹':'›'):(isRight?'›':'‹');
        b.title=collapsed?(isRight?'Expandir barra lateral direita':'Expandir barra lateral esquerda'):(isRight?'Minimizar barra lateral direita':'Minimizar barra lateral esquerda');
      };
      let collapsed=false;try{collapsed=localStorage.getItem(key)==='1'}catch(e){}
      b.onclick=()=>{collapsed=!collapsed;try{localStorage.setItem(key,collapsed?'1':'0')}catch(e){};apply(collapsed)};
      apply(collapsed);
    };
    addSideCollapse(side,false);
    addSideCollapse(r,true);
    const mk=(id,label,parent)=>{if(document.querySelector('#'+id))return;const b=document.createElement('button');b.id=id;b.className='btn';b.textContent=label;parent.appendChild(b)};
    mk('roomBtn','🔐 Sala privada',h);mk('online','👥 0 jogadores',h);
    mk('saveCampaign','💾 Salvar campanha',side);mk('newMap','🗺️ Mapas da campanha',side);
    mk('sheet','📜 Ficha completa',r);mk('inventory','📦 Inventário',r);mk('sound','🔊 Som / efeito',r);
    mk('turnBadge','⚔️ Turno: Laxus',tb);
    ['20','12','10','6'].forEach(n=>{const b=document.createElement('button');b.className='btn';b.dataset.sharedDie=n;b.textContent='🎲 d'+n;tb.appendChild(b)});
    const vision=document.createElement('button');vision.className='tool';vision.dataset.tool='vision';vision.textContent='👁 Visão individual';document.querySelector('.toolgrid').appendChild(vision);
    const inv=document.createElement('div');inv.id='inventoryList';inv.className='card';inv.style.display='none';r.appendChild(inv);
  }
  addControls();
  const side=document.querySelector('.side');
  const colorSection=document.createElement('div');colorSection.className='section';colorSection.innerHTML='<h3>Magias</h3><div class="small">Escolha a cor de quase tudo que você coloca no mapa.</div><label class="small">Névoa</label><input id="fogColor" type="color" value="#050608"><label class="small">Magia</label><input id="effectColor" type="color" value="#7c4dff"><label class="small">Marcação</label><input id="pingColor" type="color" value="#d6a85d"><label class="small">Visão</label><input id="visionColor" type="color" value="#d6a85d"><label class="small">Token novo</label><input id="tokenColor" type="color" value="#536fd2"><div id="magicList" style="margin-top:8px"></div>';side.appendChild(colorSection);
  const bindColor=(id,fn)=>document.querySelector('#'+id).oninput=e=>fn(e.target.value);bindColor('fogColor',v=>fogColor=v);bindColor('effectColor',v=>effectColor=v);bindColor('pingColor',v=>pingColor=v);bindColor('visionColor',v=>visionColor=v);bindColor('tokenColor',v=>tokenColor=v);
  const magicEffects=[['🔥','Explosão de fogo','explosion'],['❄️','Raio de gelo','iceBeam'],['⚡','Relâmpago','lightning'],['🟣','Círculo arcano','circle'],['🌀','Portal mágico','portal'],['✨','Aura de cura','aura'],['🌪️','Vórtice','vortex'],['☠️','Nuvem tóxica','cloud'],['🌑','Campo sombrio','dark'],['💥','Onda de energia','shock']];
  magicEffects.push(['🌨️','Nevasca','blizzard'],['🔥','Chamas animadas','fire'],['🌧️','Chuva mágica','rain'],['☣️','Nuvem venenosa persistente','poison'],['💚','Área de cura','heal'],['🌊','Parede de água','waterWall']);
  const pf2eSpells=[
    ['⚡','Arco elétrico (Electric Arc)','pf-electric'],
    ['💠','Rajada de força (Force Barrage)','pf-force'],
    ['😨','Medo (Fear)','pf-fear'],
    ['💚','Curar (Heal)','pf-heal'],
    ['🫧','Graxa (Grease)','pf-grease'],
    ['🫥','Invisibilidade (Invisibility)','pf-invisible'],
    ['🌑','Escuridão (Darkness)','pf-darkness'],
    ['💨','Acelerar (Haste)','pf-haste'],
    ['🐌','Lentidão (Slow)','pf-slow'],
    ['🔥','Bola de fogo (Fireball)','pf-fireball'],
    ['⚡','Raio (Lightning Bolt)','pf-lightningbolt'],
    ['🪽','Voar (Fly)','pf-fly'],
    ['🔥','Parede de fogo (Wall of Fire)','pf-walloffire'],
    ['⚡','Relâmpagos encadeados (Chain Lightning)','pf-chain'],
    ['❄️','Cone de frio (Cone of Cold)','pf-cone'],
    ['🌀','Teleporte (Teleport)','pf-teleport']
  ];
  let pendingMagic=null,magicEditor=null,magicMoveMode=false,activeMagic=null;
  const magicListEl=document.querySelector('#magicList');
  const magicButtonStyle='display:flex;align-items:center;gap:8px;width:100%;padding:9px 10px;margin-top:6px;border:1px solid #303641;border-radius:8px;background:#1d2129;color:#eef1f5;cursor:pointer;text-align:left;font-size:13px;transition:.12s ease';
  function renderMagicSidebar(){
    if(!magicListEl)return;
    magicListEl.innerHTML='';
    const heading=(text)=>{const h=document.createElement('div');h.textContent=text;h.style.cssText='margin:11px 0 5px;color:#9ca5b3;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px';magicListEl.appendChild(h)};
    const add=(m)=>{
      const b=document.createElement('button');
      b.type='button';b.className='magicSideItem';b.style.cssText=magicButtonStyle;
      b.innerHTML='<span style="font-size:18px;line-height:1">'+m[0]+'</span><span style="min-width:0;white-space:normal">'+m[1]+'</span>';
      b.title='Clique e depois clique no grid para colocar a magia';
      b.addEventListener('mouseenter',()=>{b.style.borderColor='#555e6d';b.style.background='#232832'});
      b.addEventListener('mouseleave',()=>{if(pendingMagic!==m){b.style.borderColor='#303641';b.style.background='#1d2129'}});
      b.onclick=()=>{
        pendingMagic=m;
        document.querySelectorAll('.magicSideItem').forEach(x=>{x.style.borderColor='#303641';x.style.background='#1d2129'});
        b.style.borderColor='#d6a85d';b.style.background='#2a251b';
        logMsg('Magia selecionada: '+m[1]+'. Clique no grid para colocar.');
      };
      magicListEl.appendChild(b);
    };
    heading('Magias');magicEffects.forEach(add);
    heading('Pathfinder 2e');pf2eSpells.forEach(add);
    const hint=document.createElement('div');hint.style.cssText='margin-top:8px;color:#9ca5b3;font-size:10px;line-height:1.35';hint.textContent='Clique em uma magia e depois no grid. Depois de colocada, dê duplo clique nela para editar tamanho e posição.';magicListEl.appendChild(hint);
  }
  renderMagicSidebar();
  const magicHandles=['nw','n','ne','w','e','sw','s','se'];
  function currentMapScale(){return (typeof scale==='number'&&scale>0)?scale:1}
  function saveMagicState(){try{window.rpgForgeSaveCurrentPage?.()}catch(_){}}
  function closeMagicEditor(){
    if(magicEditor){magicEditor.remove();magicEditor=null;}
    if(activeMagic){activeMagic.classList.remove('spellEditing','spellMoving');activeMagic.querySelectorAll('.spellResizeHandle').forEach(h=>h.remove());}
    activeMagic=null;magicMoveMode=false;
  }
  function refreshMagicEditorPosition(){
    if(!magicEditor||!activeMagic)return;
    const r=activeMagic.getBoundingClientRect(),gap=10;
    let left=r.right+gap,top=r.top;
    const w=magicEditor.offsetWidth||330,h=magicEditor.offsetHeight||230;
    if(left+w>window.innerWidth)left=Math.max(8,r.left-w-gap);
    if(top+h>window.innerHeight)top=Math.max(8,window.innerHeight-h-8);
    magicEditor.style.left=Math.round(left)+'px';magicEditor.style.top=Math.round(top)+'px';
  }
  function updateMagicInputs(){
    if(!magicEditor||!activeMagic)return;
    const w=magicEditor.querySelector('.spellWidth'),h=magicEditor.querySelector('.spellHeight');
    if(w)w.value=Math.round(activeMagic.offsetWidth);
    if(h)h.value=Math.round(activeMagic.offsetHeight);
    const mv=magicEditor.querySelector('.moveSpellBtn');
    if(mv)mv.textContent=magicMoveMode?'⛔ Parar de mover':'↔ Mover magia';
    magicEditor.classList.toggle('activeMove',magicMoveMode);
    if(activeMagic)activeMagic.classList.toggle('spellMoving',magicMoveMode);
  }
  function buildMagicHandles(e){
    e.querySelectorAll('.spellResizeHandle').forEach(h=>h.remove());
    magicHandles.forEach(dir=>{
      const h=document.createElement('span');h.className='spellResizeHandle '+dir;h.dataset.dir=dir;h.title='Arraste para redimensionar';
      h.addEventListener('pointerdown',ev=>startMagicResize(ev,e,dir),true);
      e.appendChild(h);
    });
  }
  function startMagicResize(ev,e,dir){
    ev.preventDefault();ev.stopPropagation();
    const s=currentMapScale(),sl=parseFloat(e.style.left)||e.offsetLeft||0,st=parseFloat(e.style.top)||e.offsetTop||0,sw=e.offsetWidth,sh=e.offsetHeight;
    const sx=ev.clientX,sy=ev.clientY,min=28;
    const move=mv=>{
      mv.preventDefault();
      const dx=(mv.clientX-sx)/s,dy=(mv.clientY-sy)/s;
      let l=sl,t=st,w=sw,h=sh;
      if(dir.includes('e'))w=sw+dx;
      if(dir.includes('s'))h=sh+dy;
      if(dir.includes('w')){w=sw-dx;l=sl+dx}
      if(dir.includes('n')){h=sh-dy;t=st+dy}
      if(w<min){if(dir.includes('w'))l=sl+sw-min;w=min}
      if(h<min){if(dir.includes('n'))t=st+sh-min;h=min}
      e.style.left=Math.round(l)+'px';e.style.top=Math.round(t)+'px';e.style.width=Math.round(w)+'px';e.style.height=Math.round(h)+'px';
      updateMagicInputs();refreshMagicEditorPosition();
    };
    const up=()=>{document.removeEventListener('pointermove',move,true);document.removeEventListener('pointerup',up,true);document.removeEventListener('pointercancel',up,true);saveMagicState()};
    document.addEventListener('pointermove',move,true);document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);
  }
  function bindMagicElement(e){
    if(!e)return;
    e.removeAttribute('data-magic-bound');
    if(!e.querySelector('.spellVisual')){
      const visual=document.createElement('div');
      visual.className='spellVisual';
      const fx=e.querySelector('.spellFx'),parts=e.querySelector('.spellParticles');
      if(fx)visual.appendChild(fx);
      if(parts)visual.appendChild(parts);
      e.appendChild(visual);
    }
    e.dataset.magicBound='1';
    const savedRotation=parseFloat(e.dataset.rotation)||parseFloat(getComputedStyle(e).getPropertyValue('--spell-rotation'))||0;
    e.dataset.rotation=String(savedRotation);
    e.style.setProperty('--spell-rotation',savedRotation+'deg');
    e.addEventListener('dblclick',ev=>{ev.preventDefault();ev.stopPropagation();openMagicEditor(e)});
    e.addEventListener('pointerdown',ev=>{
      if(ev.button!==0)return;
      // O mapa usa pointer capture para arrastar/panar. A magia precisa impedir
      // que esse gesto seja capturado pelo palco, senão o duplo clique se perde.
      if(!ev.target.closest('.spellClose,.spellResizeHandle'))ev.stopPropagation();
      if(ev.target.closest('.spellClose,.spellResizeHandle'))return;
      if(activeMagic!==e||(!magicMoveMode&&!magicEditor))return;
      magicMoveMode=true;updateMagicInputs();
      ev.preventDefault();ev.stopPropagation();
      const s=currentMapScale(),startX=ev.clientX,startY=ev.clientY,sl=parseFloat(e.style.left)||0,st=parseFloat(e.style.top)||0;
      const move=mv=>{const dx=(mv.clientX-startX)/s,dy=(mv.clientY-startY)/s;e.style.left=Math.round(sl+dx)+'px';e.style.top=Math.round(st+dy)+'px';refreshMagicEditorPosition()};
      const up=()=>{document.removeEventListener('pointermove',move,true);document.removeEventListener('pointerup',up,true);document.removeEventListener('pointercancel',up,true);saveMagicState()};
      document.addEventListener('pointermove',move,true);document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);
    },true);
    e.querySelector('.spellClose')?.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();if(activeMagic===e)closeMagicEditor();e.remove();saveMagicState()});
  }
  function rotateMagic(deg){
    if(!activeMagic)return;
    const cur=parseFloat(activeMagic.dataset.rotation)||0;
    const next=(cur+deg)%360;
    activeMagic.dataset.rotation=String(next);
    activeMagic.style.setProperty('--spell-rotation',next+'deg');
    saveMagicState();
  }
  function openMagicEditor(e){
    closeMagicEditor();
    activeMagic=e;
    e.classList.add('spellEditing');
    buildMagicHandles(e);
    const box=document.createElement('div');
    box.className='spellEditor';
    box.innerHTML='<div class="spellEditorHead"><span>✨ Editar magia</span><button class="btn spellEditorClose" type="button">✕</button></div><div class="spellEditorBody"><div class="small" style="margin-bottom:8px"><b>'+(e.dataset.effect||'Magia')+'</b><br>Esta aba edita a magia que já está colocada no grid.</div><div class="spellEditorGrid"><label>Largura<input class="spellWidth" type="number" min="28" step="1"></label><label>Altura<input class="spellHeight" type="number" min="28" step="1"></label></div><div class="spellEditorBtns"><button class="btn moveSpellBtn" type="button">↔ Mover magia</button><button class="btn spellSizeDown" type="button">− Diminuir</button><button class="btn spellSizeUp" type="button">＋ Aumentar</button><button class="btn spellApplySize" type="button">Aplicar tamanho</button></div><div class="spellEditorRotate"><button class="btn spellRotateLeft" type="button">↺ Girar 45°</button><button class="btn spellRotateRight" type="button">↻ Girar 45°</button></div><div class="spellEditorHint">Arraste qualquer borda ou canto dourado para redimensionar livremente. Com a edição aberta, você também pode arrastar a magia livremente pelo grid. Use os botões para girar 45° por vez.</div><button class="btn spellEditorSave" type="button" style="width:100%">Salvar</button><button class="btn spellEditorClose2" type="button" style="width:100%;margin-top:7px">Fechar</button></div>';
    document.body.appendChild(box);
    magicEditor=box;
    box.querySelector('.spellEditorClose').onclick=ev=>{ev.preventDefault();ev.stopPropagation();closeMagicEditor()};
    box.querySelector('.spellEditorClose2').onclick=ev=>{ev.preventDefault();ev.stopPropagation();saveMagicState();closeMagicEditor()};
    box.querySelector('.spellEditorSave').onclick=ev=>{ev.preventDefault();ev.stopPropagation();saveMagicState();closeMagicEditor()};
    box.querySelector('.moveSpellBtn').onclick=ev=>{ev.preventDefault();ev.stopPropagation();magicMoveMode=!magicMoveMode;updateMagicInputs()};
    box.querySelector('.spellRotateLeft').onclick=ev=>{ev.preventDefault();ev.stopPropagation();rotateMagic(-45)};
    box.querySelector('.spellRotateRight').onclick=ev=>{ev.preventDefault();ev.stopPropagation();rotateMagic(45)};
    const scaleMagic=f=>{
      const w=Math.max(28,Math.round(e.offsetWidth*f)),h=Math.max(28,Math.round(e.offsetHeight*f));
      const cx=(parseFloat(e.style.left)||0)+e.offsetWidth/2,cy=(parseFloat(e.style.top)||0)+e.offsetHeight/2;
      e.style.width=w+'px';e.style.height=h+'px';
      e.style.left=Math.round(cx-w/2)+'px';e.style.top=Math.round(cy-h/2)+'px';
      updateMagicInputs();refreshMagicEditorPosition();saveMagicState();
    };
    box.querySelector('.spellSizeDown').onclick=ev=>{ev.preventDefault();ev.stopPropagation();scaleMagic(.88)};
    box.querySelector('.spellSizeUp').onclick=ev=>{ev.preventDefault();ev.stopPropagation();scaleMagic(1.14)};
    box.querySelector('.spellApplySize').onclick=ev=>{
      ev.preventDefault();ev.stopPropagation();
      const w=Math.max(28,parseInt(box.querySelector('.spellWidth').value)||e.offsetWidth);
      const h=Math.max(28,parseInt(box.querySelector('.spellHeight').value)||e.offsetHeight);
      const cx=(parseFloat(e.style.left)||0)+e.offsetWidth/2,cy=(parseFloat(e.style.top)||0)+e.offsetHeight/2;
      e.style.width=w+'px';e.style.height=h+'px';
      e.style.left=Math.round(cx-w/2)+'px';e.style.top=Math.round(cy-h/2)+'px';
      updateMagicInputs();refreshMagicEditorPosition();saveMagicState();
    };
    box.querySelectorAll('.spellWidth,.spellHeight').forEach(inp=>inp.addEventListener('input',()=>updateMagicInputs()));
    updateMagicInputs();
    requestAnimationFrame(refreshMagicEditorPosition);
  }
  function rebindMagics(){document.querySelectorAll('#map .spellArea').forEach(bindMagicElement)}
  // Fallback em captura para duplo clique/toque mesmo quando outro handler do palco
  // já tiver interferido no alvo do clique.
  document.addEventListener('dblclick',ev=>{
    const target=ev.target?.closest?.('.spellArea');
    if(!target||ev.target.closest?.('.spellClose,.spellResizeHandle'))return;
    ev.preventDefault(); ev.stopPropagation();
    openMagicEditor(target);
  },true);
  function addMagic(m,p){
    if(!p){p=window.rpgForge?.lastMagicPoint||[800,450]}
    const e=document.createElement('div');e.className='spellArea spell-'+m[2];e.dataset.magic=m[2];e.dataset.effect=m[1];e.style.setProperty('--effect-color',(document.querySelector('#effectColor')?.value||'#7c4dff'));e.style.left=(p[0]-75)+'px';e.style.top=(p[1]-75)+'px';e.style.width='150px';e.style.height='150px';e.style.borderRadius=m[2]==='waterWall'?'14px':'50%';
    const close=document.createElement('button');close.className='spellClose';close.textContent='×';close.title='Remover efeito';e.appendChild(close);
    const label=document.createElement('div');label.className='spellLabel';label.textContent=m[1];e.appendChild(label);
    const visual=document.createElement('div');visual.className='spellVisual';e.appendChild(visual);
    const fx=document.createElement('div');fx.className='spellFx';visual.appendChild(fx);
    const particles=document.createElement('div');particles.className='spellParticles';visual.appendChild(particles);
    if(m[2]==='fire'){for(let i=0;i<11;i++){const f=document.createElement('i');f.className='fireFlame';f.style.setProperty('--left',(6+Math.random()*84)+'%');f.style.setProperty('--bottom',(4+Math.random()*72)+'%');f.style.setProperty('--rot',(-22+Math.random()*44)+'deg');particles.appendChild(f)}}
    else if(m[2]==='blizzard'){for(let i=0;i<32;i++){const q=document.createElement('i');q.className='spellParticle';q.style.setProperty('--left',Math.random()*100+'%');q.style.setProperty('--dur',(1.4+Math.random()*2.4)+'s');q.style.animationDelay=(-Math.random()*3)+'s';q.textContent=['❄','✦','·'][i%3];q.style.width='auto';q.style.height='auto';q.style.background='transparent';q.style.boxShadow='none';q.style.color='#dffaff';q.style.fontSize=(8+Math.random()*10)+'px';particles.appendChild(q)}}
    else if(m[2]==='rain'){for(let i=0;i<25;i++){const q=document.createElement('i');q.className='spellParticle';q.style.setProperty('--left',Math.random()*100+'%');q.style.setProperty('--dur',(0.5+Math.random()*0.7)+'s');q.style.animationDelay=(-Math.random()*1.2)+'s';q.textContent='';q.style.width='2px';q.style.height=(10+Math.random()*11)+'px';q.style.background='#8ed1ff';q.style.boxShadow='0 0 7px #70baff';particles.appendChild(q)}}
    else if(m[2]==='poison'){for(let i=0;i<16;i++){const q=document.createElement('i');q.className='spellParticle';q.style.setProperty('--left',(10+Math.random()*80)+'%');q.style.setProperty('--dur',(1.1+Math.random()*1.3)+'s');q.style.animationDelay=(-Math.random()*2)+'s';q.style.width=(4+Math.random()*5)+'px';q.style.height=q.style.width;q.style.background='#b6ff65';q.style.boxShadow='0 0 8px #8cff58';q.style.top=(35+Math.random()*45)+'%';particles.appendChild(q)}}
    else if(m[2]==='waterWall'){e.style.width='260px';e.style.height='70px';e.style.left=(p[0]-130)+'px';e.style.top=(p[1]-35)+'px'}
    else if(m[2]==='heal'){for(let i=0;i<8;i++){const q=document.createElement('i');q.className='spellParticle';q.style.setProperty('--left',(15+Math.random()*70)+'%');q.style.setProperty('--dur',(1.2+Math.random()*1.2)+'s');q.style.animationDelay=(-Math.random()*2)+'s';q.textContent='✦';q.style.width='auto';q.style.height='auto';q.style.background='transparent';q.style.boxShadow='none';q.style.color='#baffd1';q.style.fontSize=(10+Math.random()*7)+'px';q.style.top=(40+Math.random()*35)+'%';particles.appendChild(q)}}
    else if(m[2]==='explosion'||m[2]==='shock'){for(let i=0;i<12;i++){const q=document.createElement('i');q.className='spellParticle';q.style.setProperty('--left',Math.random()*100+'%');q.style.setProperty('--dur',(0.4+Math.random()*0.8)+'s');q.style.animationDelay=(-Math.random())+'s';q.style.width='4px';q.style.height='4px';q.style.background=m[2]==='explosion'?'#ffd76a':'#dff7ff';q.style.top=(40+Math.random()*20)+'%';particles.appendChild(q)}}
    else if(m[2]==='vortex'){for(let i=0;i<14;i++){const q=document.createElement('i');q.className='spellParticle';q.style.setProperty('--left',Math.random()*100+'%');q.style.setProperty('--dur',(0.7+Math.random()*1.1)+'s');q.style.animationDelay=(-Math.random()*1.5)+'s';q.style.width='3px';q.style.height='3px';q.style.background='#d4baff';q.style.boxShadow='0 0 7px #a56cff';q.style.top=(20+Math.random()*60)+'%';particles.appendChild(q)}}
    map.appendChild(e);bindMagicElement(e);logMsg(m[1]+' criada com animação própria na cor '+effectColor+'. Dê duplo clique para editar tamanho e posição.');return e
  }
  function sanitizeMagicMarkup(){
    const clone=map.cloneNode(true);
    clone.querySelectorAll('.spellResizeHandle').forEach(h=>h.remove());
    clone.querySelectorAll('.spellArea').forEach(el=>{el.classList.remove('spellEditing','spellMoving');el.removeAttribute('data-magic-bound');});
    return clone.innerHTML;
  }
  window.rpgForgeRebindMagics=rebindMagics;
  stage.addEventListener('click',e=>{if(!pendingMagic||e.target.closest('.token')||e.target.closest('.toolbar')||e.target.closest('.spellArea')||e.target.closest('.spellEditor'))return;const p=pos(e);window.rpgForge.lastMagicPoint=p;addMagic(pendingMagic,p);pendingMagic=null});
  document.addEventListener('pointerdown',e=>{if(magicEditor&&!magicEditor.contains(e.target)&&!e.target.closest('.spellArea'))closeMagicEditor()},true);
  window.addEventListener('resize',refreshMagicEditorPosition);
  rebindMagics();
  window.rpgForge=window.rpgForge||{};window.rpgForge.effectColor=()=>effectColor;window.rpgForge.createMagic=addMagic;window.rpgForge.sanitizeMagicMarkup=sanitizeMagicMarkup;
  window.rpgForge=window.rpgForge||{};window.rpgForge.effectColor=()=>effectColor;window.rpgForge.createMagic=addMagic;
  const logMsg=m=>{const l=document.querySelector('#log');l.innerHTML='<div><b>Sistema:</b> '+m+'</div>'+l.innerHTML};
  function panel(title,body){const p=document.createElement('div');p.className='forgePanel';p.innerHTML='<button class="btn forgeClose">✕</button><h2>'+title+'</h2>'+body;document.body.appendChild(p);p.querySelector('.forgeClose').onclick=()=>p.remove();return p}
  document.querySelector('#roomBtn').onclick=()=>panel('🔐 Sala privada','<div class="forgeGrid"><div class="forgeStat"><b>Código</b><div style="font-size:24px;margin-top:8px">KR7X</div><small>Compartilhe somente com seus jogadores.</small></div><div class="forgeStat"><b>Permissão</b><div style="margin-top:8px">Mestre controla NPCs e monstros</div><div>Jogadores controlam seus personagens</div></div></div><button class="btn" style="margin-top:12px" onclick="navigator.clipboard?.writeText(location.href+\'#sala-KR7X\')">Copiar convite</button>');
  
  document.querySelector('#online').onclick=()=>{const badge=document.querySelector('#online')?.textContent||'👥 0 jogadores';panel('👥 Jogadores conectados','<div class="playerList"><div style="padding:10px;border:1px solid #303641;border-radius:8px;background:#1b2027"><b>'+badge.replace(/</g,'&lt;')+'</b><div class="small" style="margin-top:4px">Quantidade de pessoas conectadas a este servidor agora.</div></div></div><p class="small">A contagem é atualizada automaticamente quando alguém entra ou sai.</p>')};
  // Ficha completa PF2e: painel lateral editável, com campos removíveis e adicionáveis.
  function openCharacterSheet(){
    document.querySelector('.pf2eSheetPanel')?.remove();
    const p=document.createElement('aside');
    p.className='pf2eSheetPanel';
    p.innerHTML=`
      <div class="pf2eSheetHead"><div><h2>📜 Ficha completa — Laxus</h2><div class="small">Pathfinder 2e · clique nos campos para editar</div></div><button class="btn pf2eClose">✕</button></div>
      <div class="pf2eSheetBody">
        <section class="pf2eSec"><h3>Identidade</h3><div class="pf2eGrid">
          ${sheetField('Nome','Laxus','text')}${sheetField('Jogador','Lucas','text')}${sheetField('Ancestralidade','Humano','text')}${sheetField('Herança','Versátil','text')}${sheetField('Background','Soldado','text')}${sheetField('Classe','Paladino','text')}${sheetField('Nível','6','number')}${sheetField('XP','0','number')}
        </div></section>
        <section class="pf2eSec"><h3>Atributos</h3><div class="pf2eGrid pf2eSix">
          ${sheetField('Força','+4','text')}${sheetField('Destreza','+4','text')}${sheetField('Constituição','+3','text')}${sheetField('Inteligência','+1','text')}${sheetField('Sabedoria','+2','text')}${sheetField('Carisma','+4','text')}
        </div></section>
        <section class="pf2eSec"><h3>Defesas e percepção</h3><div class="pf2eGrid">
          ${sheetField('PV atual','38','number')}${sheetField('PV máximo','42','number')}${sheetField('CA','21','number')}${sheetField('Percepção','+8','text')}${sheetField('Fortitude','+9','text')}${sheetField('Reflexos','+7','text')}${sheetField('Vontade','+8','text')}${sheetField('Velocidade','25 pés','text')}
        </div></section>
        <section class="pf2eSec"><h3>Perícias</h3><div class="pf2eList" data-list="skills">
          ${sheetRow('Acrobacia','Treinado','+10')}${sheetRow('Arcanismo','Não treinado','+1')}${sheetRow('Atletismo','Treinado','+12')}${sheetRow('Enganação','Não treinado','+4')}${sheetRow('Diplomacia','Treinado','+11')}${sheetRow('Intimidação','Treinado','+12')}${sheetRow('Medicina','Treinado','+10')}${sheetRow('Natureza','Treinado','+8')}${sheetRow('Ocultismo','Não treinado','+1')}${sheetRow('Perícia de Ofício','Treinado','+8')}${sheetRow('Religião','Treinado','+10')}${sheetRow('Sociedade','Não treinado','+1')}${sheetRow('Furtividade','Treinado','+10')}${sheetRow('Sobrevivência','Treinado','+10')}${sheetRow('Ladinagem','Não treinado','+4')}
        </div><button class="btn pf2eAdd" data-add="skill">＋ Adicionar perícia</button></section>
        <section class="pf2eSec"><h3>Ataques e armas</h3><div class="pf2eList" data-list="attacks">
          ${sheetRow('Espada longa','Ataque','+13 · 1d8+4 cortante')}${sheetRow('Arco longo','Ataque','+11 · 1d8 perfurante')}${sheetRow('Ataque desarmado','Ataque','+12 · 1d4+4 contundente')}
        </div><button class="btn pf2eAdd" data-add="attack">＋ Adicionar ataque/arma</button></section>
        <section class="pf2eSec"><h3>Magia</h3><div class="pf2eGrid">
          ${sheetField('Habilidade de conjuração','Carisma','text')}${sheetField('CD de classe/magia','22','number')}${sheetField('Ataque mágico','+12','text')}${sheetField('Pontos de foco','1','number')}
        </div><div class="pf2eList" data-list="spells">${sheetRow('Truque','Nome do truque','')}${sheetRow('1º círculo','—','')}${sheetRow('2º círculo','—','')}${sheetRow('3º círculo','—','')}</div><button class="btn pf2eAdd" data-add="spell">＋ Adicionar magia</button></section>
        <section class="pf2eSec"><h3>Talentos e habilidades</h3><div class="pf2eList" data-list="feats">${sheetRow('Ancestralidade','Humano','')}${sheetRow('Classe','Paladino','')}${sheetRow('Perícia','—','')}${sheetRow('Geral','—','')}</div><button class="btn pf2eAdd" data-add="feat">＋ Adicionar talento/habilidade</button></section>
        <section class="pf2eSec"><h3>Equipamento e recursos</h3><div class="pf2eGrid">
          ${sheetField('Ouro (PO)','0','number')}${sheetField('Prata (PP)','0','number')}${sheetField('Cobre (PC)','0','number')}${sheetField('Carga','0 / 6','text')}
        </div><div class="pf2eList" data-list="inventory">${sheetRow('Armadura','Armadura de couro','CA +2')}${sheetRow('Escudo','Escudo','—')}${sheetRow('Item','Poção','1')}</div><button class="btn pf2eAdd" data-add="item">＋ Adicionar item</button></section>
        <section class="pf2eSec"><h3>Condições e efeitos</h3><div class="pf2eList" data-list="conditions">${sheetRow('Condição','Nenhuma','')}</div><button class="btn pf2eAdd" data-add="condition">＋ Adicionar condição</button></section>
        <section class="pf2eSec"><h3>Idiomas, sentidos e outros</h3><div class="pf2eGrid">
          ${sheetField('Idiomas','Comum, Élfico','text')}${sheetField('Sentidos','Visão na penumbra','text')}${sheetField('Resistências','—','text')}${sheetField('Imunidades','—','text')}${sheetField('Fraquezas','—','text')}${sheetField('Classe DC','22','number')}
        </div></section>
        <section class="pf2eSec"><h3>Descrição e notas</h3>${sheetTextarea('Aparência','')}${sheetTextarea('Personalidade','')}${sheetTextarea('História','')}${sheetTextarea('Anotações','')}</section>
        <section class="pf2eSec"><h3>Campos personalizados</h3><div class="pf2eList" data-list="custom"></div><button class="btn pf2eAdd" data-add="custom">＋ Adicionar campo</button></section>
      </div>`;
    document.body.appendChild(p);
    p.querySelector('.pf2eClose').onclick=()=>p.remove();
    p.querySelectorAll('.pf2eInput,.pf2eTextarea').forEach(i=>i.addEventListener('input',()=>saveSheet()));
    p.querySelectorAll('.pf2eRemove').forEach(b=>b.onclick=()=>{b.closest('.pf2eRow,.pf2eFieldWrap')?.remove();saveSheet()});
    p.querySelectorAll('.pf2eAdd').forEach(b=>b.onclick=()=>addSheetRow(b.dataset.add,p));
  }
  function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
  function sheetField(label,value,type){return `<label class="pf2eFieldWrap"><span>${label}</span><input class="pf2eInput" type="${type}" value="${esc(value)}"><button class="pf2eRemove" title="Excluir campo">×</button></label>`}
  function sheetTextarea(label,value){return `<label class="pf2eTextWrap"><span>${label}</span><textarea class="pf2eTextarea" rows="3">${esc(value)}</textarea><button class="pf2eRemove" title="Excluir campo">×</button></label>`}
  function sheetRow(a,b,c){return `<div class="pf2eRow"><input class="pf2eInput" value="${esc(a)}"><input class="pf2eInput" value="${esc(b)}"><input class="pf2eInput" value="${esc(c)}"><button class="pf2eRemove" title="Excluir">×</button></div>`}
  function addSheetRow(type,p){const map={skill:['Nova perícia','Treinado','+0'],attack:['Novo ataque','Ataque','+0 · dano'],spell:['Novo espaço','Nome da magia',''],feat:['Novo talento','Descrição',''],item:['Novo item','Quantidade',''],condition:['Nova condição','Efeito',''],custom:['Campo','Valor','']};const v=map[type]||map.custom;const list=p.querySelector(`[data-list="${type==='attack'?'attacks':type==='spell'?'spells':type==='feat'?'feats':type==='item'?'inventory':type==='condition'?'conditions':type==='custom'?'custom':'skills'}"]`);if(list){list.insertAdjacentHTML('beforeend',sheetRow(...v));const row=list.lastElementChild;row.querySelector('.pf2eRemove').onclick=()=>{row.remove();saveSheet()};row.querySelectorAll('input').forEach(i=>i.oninput=saveSheet);}}
  function saveSheet(){const p=document.querySelector('.pf2eSheetPanel');if(!p)return;localStorage.setItem('rpgForgePF2eSheet',p.querySelector('.pf2eSheetBody').innerHTML)}
  document.querySelector('#sheet').onclick=openCharacterSheet;
  document.querySelector('#inventory').onclick=()=>panel('📦 Inventário de Laxus','<div class="forgeGrid"><div class="forgeStat">⚔️ Espada larga ×1</div><div class="forgeStat">🛡️ Escudo ×1</div><div class="forgeStat">🧪 Poção ×2</div><div class="forgeStat">🗝️ Chave antiga ×1</div><div class="forgeStat">🪙 35 moedas</div></div><button class="btn" style="margin-top:12px" onclick="this.textContent=\'Item adicionado\';">＋ Adicionar item</button>');
  document.querySelectorAll('[data-shared-die]').forEach(b=>b.onclick=()=>{const n=+b.dataset.sharedDie,r=Math.floor(Math.random()*n)+1;document.querySelector('#roll').textContent='d'+n+' → '+r;logMsg('Rolagem compartilhada: d'+n+' = '+r)});
  // Sons / efeitos do YouTube sincronizados pelo servidor.
  (function(){
    const soundBtn=document.querySelector('#sound');
    if(!soundBtn)return;
    const storageKey='rpgForgeYoutubeSoundsV2';
    const syncKey='rpgForgeYoutubeSoundSyncEnabledV1';
    let sounds=[];
    let activeSoundPanel=null;
    let playerFrame=null;
    let lastSyncSeq=0;
    let latestSyncEvent=null;
    let syncEnabled=localStorage.getItem(syncKey)==='1';
    let syncConnected=false;
    let syncSource=null;
    let syncRequestBusy=false;
    let lastLocalPlayItemId=null;
    let lastLocalStopAt=0;
    try{sounds=JSON.parse(localStorage.getItem(storageKey)||localStorage.getItem('rpgForgeYoutubeSoundsV1')||'[]');if(!Array.isArray(sounds))sounds=[]}catch(e){sounds=[]}
    const escHtml=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    function save(){try{localStorage.setItem(storageKey,JSON.stringify(sounds))}catch(e){}}
    function youtubeId(value){
      const raw=String(value||'').trim();if(!raw)return null;
      try{
        const u=new URL(raw),host=u.hostname.replace(/^www\./,'').toLowerCase();
        if(host==='youtu.be')return u.pathname.split('/').filter(Boolean)[0]||null;
        if(host.endsWith('youtube.com')){
          const byQuery=u.searchParams.get('v');if(byQuery)return byQuery;
          const m=u.pathname.match(/^\/(?:embed|shorts|live)\/([^\/?#]+)/i);if(m)return m[1];
        }
      }catch(e){}
      const m=raw.match(/(?:v=|youtu\.be\/|youtube\.com\/(?:embed|shorts|live)\/)([A-Za-z0-9_-]{6,})/i);return m?m[1]:null;
    }
    function isServerMode(){return location.protocol==='http:'||location.protocol==='https:'}
    function roleIsMaster(){return localStorage.getItem('rpgForgeLocalRoleV2')==='gm'}
    function syncUrl(path){return new URL(path,location.href).toString()}
    async function postSync(payload){
      if(!isServerMode()||syncRequestBusy)return false;
      syncRequestBusy=true;
      try{
        const res=await fetch(syncUrl('/api/sound'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true});
        return res.ok;
      }catch(e){return false}
      finally{syncRequestBusy=false}
    }
    function stopPlayer(){if(playerFrame){playerFrame.src='about:blank';playerFrame=null}}
    function currentPlayerUrl(id,autoplay){
      const params=new URLSearchParams({autoplay:autoplay?'1':'0',rel:'0',playsinline:'1',enablejsapi:'1',controls:'1'});
      params.set('origin',location.origin);
      params.set('widget_referrer',location.href);
      return 'https://www.youtube.com/embed/'+encodeURIComponent(id)+'?'+params.toString();
    }
    function showSyncBanner(panel,kind,msg){
      const box=panel?.querySelector('.ytSyncStatus');if(!box)return;
      box.style.display='block';box.innerHTML='';
      const line=document.createElement('div');line.style.cssText='font-size:11px;line-height:1.45';line.textContent=msg;box.appendChild(line);
      if(kind==='activate'){
        const b=document.createElement('button');b.type='button';b.className='btn ytEnableSync';b.style.cssText='width:100%;margin-top:7px';b.textContent='🔊 Ativar áudio sincronizado';
        b.onclick=()=>{syncEnabled=true;localStorage.setItem(syncKey,'1');updateSyncStatus(panel);if(latestSyncEvent?.action==='play')playEvent(latestSyncEvent,true)};
        box.appendChild(b);
      }
    }
    function updateSyncStatus(panel){
      const p=panel||activeSoundPanel;if(!p)return;
      const s=p.querySelector('.ytSyncStatus');if(!s)return;
      const label=p.querySelector('.ytSyncLabel');
      if(label)label.textContent=syncConnected?'● Servidor conectado':'○ Servidor não conectado';
      s.style.display='block';
      if(syncConnected&&syncEnabled){s.style.borderColor='#3e7a54';s.style.background='#132219';s.textContent='🔊 Áudio sincronizado ativo. O Mestre controla a reprodução para todos.'}
      else if(syncConnected){s.style.borderColor='#6f6339';s.style.background='#221f14';showSyncBanner(p,'activate','O servidor está conectado. Cada jogador precisa ativar o áudio uma vez neste navegador para permitir a reprodução automática do YouTube.')}
      else {s.style.borderColor='#4a5260';s.style.background='#101318';s.textContent='○ Modo servidor não conectado. Inicie o RPG pelo servidor para sincronizar o som.'}
    }
    function openSoundPanel(auto){
      if(activeSoundPanel){updateSyncStatus(activeSoundPanel);render();return activeSoundPanel}
      const panel=document.createElement('div');activeSoundPanel=panel;panel.className='youtubeSoundPanel';
      panel.style.cssText='position:fixed;z-index:130;right:24px;top:96px;width:min(430px,calc(100vw - 48px));max-height:78vh;overflow:auto;background:#171a20;border:1px solid #555e6d;border-radius:12px;padding:14px;box-shadow:0 18px 55px #000c;color:#fff;';
      panel.innerHTML=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><h2 style="margin:0;font-size:16px;flex:1">🔊 Som / efeito</h2><button class="btn ytClose">✕</button></div>
        <div class="ytSyncStatus" style="display:block;border:1px solid #4a5260;background:#101318;border-radius:8px;padding:9px;margin-bottom:9px"><b class="ytSyncLabel">○ Conectando ao servidor...</b><div class="ytSyncText" style="font-size:11px;color:#aeb7c5;margin-top:4px">O Mestre pode sincronizar a reprodução para todos os jogadores.</div></div>
        <div style="font-size:11px;color:#aeb7c5;margin-bottom:9px">Cole um link do YouTube e adicione à lista. Em modo servidor, <b>Tocar</b> envia o comando para todos os clientes conectados.</div>
        <div class="ytAddRow" style="display:grid;grid-template-columns:1fr;gap:6px;margin-bottom:10px">
          <input class="ytName" placeholder="Nome do som (opcional)" style="background:#101318;color:#fff;border:1px solid #3b424e;border-radius:7px;padding:8px;box-sizing:border-box">
          <input class="ytUrl" placeholder="Cole aqui o link do YouTube" style="background:#101318;color:#fff;border:1px solid #3b424e;border-radius:7px;padding:8px;box-sizing:border-box">
          <button class="btn ytAdd">＋ Adicionar som</button>
        </div>
        <div class="ytPlayerWrap" style="display:none;margin-bottom:10px">
          <div class="small" style="margin-bottom:5px">Reproduzindo</div>
          <div class="ytNowPlaying" style="background:#101318;border:1px solid #343b46;border-radius:8px;padding:10px;font-size:12px;line-height:1.45"></div>
          <iframe class="ytPlayer" style="display:block;width:100%;height:240px;border:0;border-radius:8px;background:#000;margin-top:7px" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" title="Player do YouTube"></iframe>
          <div class="ytLocalFallback" style="display:none;background:#101318;border:1px solid #343b46;border-radius:8px;padding:10px;margin-top:7px;font-size:12px;line-height:1.4"></div>
          <button class="btn ytStop" style="width:100%;margin-top:6px">⏹ Parar</button>
        </div>
        <div class="ytList"></div>`;
      document.body.appendChild(panel);
      updateSyncStatus(panel);
      const list=panel.querySelector('.ytList'),playerWrap=panel.querySelector('.ytPlayerWrap'),fallback=panel.querySelector('.ytLocalFallback'),nowPlaying=panel.querySelector('.ytNowPlaying');
      const close=()=>{stopPlayer();panel.remove();activeSoundPanel=null};
      panel.querySelector('.ytClose').onclick=close;
      panel.querySelector('.ytStop').onclick=async()=>{
        if(roleIsMaster()&&isServerMode()){await postSync({action:'stop'});return}
        stopPlayer();playerWrap.style.display='none';fallback.style.display='none';nowPlaying.textContent='';
      };
      function localPlay(item,remote){
        const id=youtubeId(item.url);if(!id)return;
        latestSyncEvent=remote?latestSyncEvent:latestSyncEvent;
        playerWrap.style.display='block';
        nowPlaying.innerHTML='<b>'+escHtml(item.name||'Som do YouTube')+'</b><div style="color:#9ca5b3;margin-top:3px">'+(remote?'Reprodução sincronizada pelo servidor.':'Reproduzindo neste cliente.')+'</div>';
        fallback.style.display='none';
        playerFrame=panel.querySelector('.ytPlayer');
        playerFrame.src=currentPlayerUrl(id,true);
      }
      function playEvent(ev,fromActivation){
        latestSyncEvent=ev;
        if(!ev?.item)return;
        if(!activeSoundPanel)openSoundPanel(true);
        const p=activeSoundPanel;if(!p)return;
        const frame=p.querySelector('.ytPlayer'),wrap=p.querySelector('.ytPlayerWrap'),now=p.querySelector('.ytNowPlaying');
        const id=youtubeId(ev.item.url);if(!id)return;
        wrap.style.display='block';now.innerHTML='<b>'+escHtml(ev.item.name||'Som do YouTube')+'</b><div style="color:#9ca5b3;margin-top:3px">Som sincronizado pelo Mestre.</div>';
        playerFrame=frame;
        frame.style.display='block';frame.src=currentPlayerUrl(id,fromActivation||syncEnabled);
        if(!syncEnabled){showSyncBanner(p,'activate','O Mestre iniciou um som. Clique em “Ativar áudio sincronizado” para este navegador poder reproduzir os próximos comandos automaticamente.');return;}
        showSyncBanner(p,null,'🔊 Reproduzindo som sincronizado.');
      }
      function render(){
        list.innerHTML='';
        if(!sounds.length){list.innerHTML='<div style="padding:14px;border:1px dashed #4a5260;border-radius:8px;color:#9ca5b3;text-align:center">Nenhum som adicionado ainda.</div>';return;}
        sounds.forEach(item=>{
          const row=document.createElement('div');row.style.cssText='display:grid;grid-template-columns:1fr auto;gap:7px;align-items:center;padding:8px;margin:6px 0;background:#1d222a;border:1px solid #343b46;border-radius:8px';
          const title=document.createElement('div');title.style.cssText='min-width:0';title.innerHTML='<b>'+escHtml(item.name||'Som do YouTube')+'</b><div style="font-size:10px;color:#8f99a8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">YouTube</div>';
          const actions=document.createElement('div');actions.style.cssText='display:flex;gap:5px';
          const play=document.createElement('button');play.className='btn';play.textContent='▶ Tocar';
          const del=document.createElement('button');del.className='btn';del.textContent='🗑';del.title='Excluir som';
          play.onclick=async()=>{
            const id=youtubeId(item.url);if(!id){alert('Link do YouTube inválido.');return;}
            if(isServerMode()&&roleIsMaster()){
              latestSyncEvent={action:'play',item,local:true};lastLocalPlayItemId=item.id;
              const ok=await postSync({action:'play',item:{id:item.id,name:item.name,url:item.url}});
              if(!ok){localPlay(item,false);showSyncBanner(panel,null,'⚠️ O servidor não respondeu; este cliente está reproduzindo sozinho.')}
              return;
            }
            localPlay(item,false);
          };
          del.onclick=()=>{sounds=sounds.filter(x=>x.id!==item.id);save();render()};
          actions.append(play,del);row.append(title,actions);list.appendChild(row);
        });
      }
      const add=()=>{
        const name=panel.querySelector('.ytName').value.trim(),url=panel.querySelector('.ytUrl').value.trim(),id=youtubeId(url);
        if(!id){alert('Cole um link válido do YouTube.');return;}
        const item={id:'yt-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:name||'Som do YouTube',url,id};
        sounds.push(item);save();panel.querySelector('.ytName').value='';panel.querySelector('.ytUrl').value='';render();logMsg('Som do YouTube adicionado: '+item.name);
      };
      panel.querySelector('.ytAdd').onclick=add;panel.querySelector('.ytUrl').onkeydown=e=>{if(e.key==='Enter')add()};render();
      if(latestSyncEvent?.action==='play'&&latestSyncEvent.item&&!syncEnabled)showSyncBanner(panel,'activate','Há um som sincronizado ativo. Ative o áudio deste navegador para ouvi-lo.');
      if(latestSyncEvent?.action==='play'&&latestSyncEvent.item&&syncEnabled)playEvent(latestSyncEvent,true);
      return panel;
    }
    function updateOnlineCount(count){
      const b=document.querySelector('#online');
      if(!b)return;
      const n=Math.max(0,Number(count)||0);
      b.textContent='👥 '+n+' '+(n===1?'jogador':'jogadores');
    }

    function connectSync(){
      if(!isServerMode()){syncConnected=false;return}
      try{syncSource=new EventSource(syncUrl('/api/sound/events'))}catch(e){syncConnected=false;return}
      syncSource.onopen=()=>{syncConnected=true;updateSyncStatus(activeSoundPanel);};
      syncSource.onerror=()=>{syncConnected=false;updateSyncStatus(activeSoundPanel)};
      syncSource.addEventListener('presence',ev=>{
        try{const data=JSON.parse(ev.data||'{}');updateOnlineCount(data.count)}catch(e){}
      });
      syncSource.addEventListener('sound-sync',ev=>{
        try{
          const data=JSON.parse(ev.data||'{}');
          if((Number(data.seq)||0)<=lastSyncSeq)return;
          lastSyncSeq=Number(data.seq)||lastSyncSeq;latestSyncEvent=data;
          if(data.action==='stop'){
            if(activeSoundPanel){const f=activeSoundPanel.querySelector('.ytPlayer');if(f)f.src='about:blank';const w=activeSoundPanel.querySelector('.ytPlayerWrap');if(w)w.style.display='none';showSyncBanner(activeSoundPanel,null,'⏹ Reprodução parada pelo Mestre.')}
            return;
          }
          if(data.action==='play'&&data.item){
            if(lastLocalPlayItemId===data.item.id){lastLocalPlayItemId=null;return}
            playEvent(data,false);
          }
        }catch(e){}
      });
    }
    connectSync();
    soundBtn.onclick=()=>openSoundPanel(false);
  })();
  document.querySelector('#saveCampaign').onclick=()=>{const save={campaign:'Ruínas de Arkhon',room:'KR7X',date:new Date().toISOString(),mapBackground:map.style.backgroundImage};localStorage.setItem('rpgForgeCampaign',JSON.stringify(save));logMsg('Campanha salva neste dispositivo.')};
  document.querySelector('#newMap').onclick=()=>panel('🗺️ Mapas da campanha','<div class="forgeGrid"><div class="forgeStat">🏚️ Salão Norte<br><small>Mapa ativo</small></div><div class="forgeStat">🕯️ Cripta<br><small>Mapa pronto</small></div><div class="forgeStat">🌲 Floresta<br><small>Mapa pronto</small></div><div class="forgeStat">➕ Novo mapa<br><small>Importe uma imagem para começar</small></div></div>');
  function closeVisionPicker(){document.querySelectorAll('.visionPicker').forEach(v=>v.remove());}
  function openVisionPicker(){
    closeVisionPicker();
    const box=document.createElement('div');
    box.className='visionPicker';
    box.style.cssText='position:fixed;right:24px;top:96px;width:250px;max-height:70vh;overflow:auto;z-index:120;background:#171a20;border:1px solid #555e6d;border-radius:10px;padding:10px;box-shadow:0 12px 35px #000c;color:#fff;';
    const title=document.createElement('div');
    title.innerHTML='<b>👁 Visão individual</b><div style="font-size:11px;color:#9ca5b3;margin-top:4px">Escolha o token que poderá ser movimentado.</div>';
    box.appendChild(title);
    const tokens=[...map.querySelectorAll('.token')];
    if(!tokens.length){const empty=document.createElement('div');empty.style.cssText='padding:12px 4px;color:#9ca5b3;font-size:12px';empty.textContent='Nenhum token no cenário.';box.appendChild(empty);}
    tokens.forEach(t=>{
      const b=document.createElement('button');
      b.type='button'; b.className='btn'; b.style.cssText='display:block;width:100%;margin-top:7px;text-align:left';
      const kind=t.classList.contains('player')?'🧙':t.classList.contains('npc')?'🧑':'👹';
      b.textContent=kind+' '+(t.title||t.dataset.name||t.textContent.trim()||'Token');
      b.onclick=()=>{
        visionFocusTokenId=t.id||null;
        map.querySelectorAll('.visionRing').forEach(v=>v.remove());
        const left=parseFloat(t.style.left)||0, top=parseFloat(t.style.top)||0;
        const v=document.createElement('div'); v.className='visionRing';
        v.style.cssText='left:'+(left-150)+'px;top:'+(top-150)+'px;width:342px;height:342px';
        map.appendChild(v);
        t.classList.add('selected');
        map.querySelectorAll('.token').forEach(q=>{if(q!==t)q.classList.remove('selected')});
        tool='select';
        document.querySelectorAll('.tool').forEach(q=>q.classList.remove('active'));
        closeVisionPicker();
        logMsg('Visão individual de '+(t.title||t.textContent)+' selecionada. Somente este token pode ser movimentado.');
        updateVisionFocusRing();
        if(typeof window.rpgForgeUpdateFogVision==='function')window.rpgForgeUpdateFogVision();
      };
      box.appendChild(b);
    });
    const close=document.createElement('button'); close.type='button'; close.className='btn'; close.style.cssText='width:100%;margin-top:9px'; close.textContent='✕ Cancelar'; close.onclick=()=>{closeVisionPicker();document.querySelectorAll('.tool').forEach(q=>q.classList.remove('active'));tool='select';}; box.appendChild(close);
    document.body.appendChild(box);
  }
  document.querySelector('[data-tool="vision"]').onclick=()=>{
    tool='vision';
    visionFocusTokenId=null;
    map.querySelectorAll('.visionRing').forEach(v=>v.remove());
    document.querySelectorAll('.tool').forEach(q=>q.classList.remove('active'));
    document.querySelector('[data-tool="vision"]').classList.add('active');
    openVisionPicker();
  };
  // A iniciativa é configurada no bloco que cria os botões de adicionar/remover,
  // depois que initSection já existe. O botão #next recebe o controlador lá.
  window.rpgForge=Object.assign(window.rpgForge||{},{players:['Laxus','Benzuke'],gm:['Goblin','Guarda'],privateRoom:true,sharedRolls:true,fogOfWar:true,individualVision:true,combat:true,sheets:true,inventory:true,maps:['Salão Norte','Cripta','Floresta'],mobile:true});
  const mobs=[['goblin','👹','Goblin',12,15,5],['orc','👺','Orc',18,16,7],['skeleton','💀','Esqueleto',10,14,4],['zombie','🧟','Zumbi',20,12,3],['wolf','🐺','Lobo',14,15,6],['spider','🕷️','Aranha gigante',16,13,5],['bat','🦇','Morcego',8,16,4],['slime','🟢','Slime',22,11,2],['troll','👹','Troll',45,18,10],['ogre','👹','Ogro',55,17,9],['dragon','🐉','Dragão',180,25,14],['hydra','🐲','Hidra',120,22,12],['bandit','🏹','Bandido',16,15,5],['cultist','🧙','Cultista',14,14,4],['guard','🛡️','Guarda',20,18,6],['giant','🗿','Gigante',90,20,11]];
  const ml=document.querySelector('#mobList'); if(ml)mobs.forEach(m=>{const b=document.createElement('button');b.className='tokenItem';b.style.width='100%';b.innerHTML='<span style="font-size:20px">'+m[1]+'</span>'+m[2]+' <span class="small">PV '+m[3]+' · CA '+m[4]+'</span>';b.ondblclick=()=>addMob(m);ml.appendChild(b)});
  function addMob(m){const el=document.createElement('div');el.className='token monster';el.textContent=m[1];el.title=m[2];el.dataset.mob=m[0];el.dataset.hp=m[3];el.dataset.ac=m[4];el.dataset.attack=m[5];el.style.cssText='left:'+(560+Math.random()*600)+'px;top:'+(280+Math.random()*420)+'px;width:48px;height:48px;font-size:22px;z-index:4';el.onclick=e=>{e.stopPropagation();document.querySelectorAll('.mobMenu').forEach(x=>x.remove());const menu=document.createElement('div');menu.className='mobMenu card';menu.style.cssText='position:absolute;z-index:30;left:'+(parseFloat(el.style.left)+52)+'px;top:'+parseFloat(el.style.top)+'px;min-width:180px';menu.innerHTML='<b>'+m[1]+' '+m[2]+'</b><div class="small">PV '+el.dataset.hp+' · CA '+el.dataset.ac+' · Ataque +'+el.dataset.attack+'</div>';['Atacar','Aplicar 5 dano','Adicionar à iniciativa','Remover mob'].forEach(a=>{const q=document.createElement('button');q.className='btn';q.style.cssText='width:100%;margin-top:5px;text-align:left';q.textContent=a;q.onclick=()=>{if(a==='Aplicar 5 dano'){el.dataset.hp=Math.max(0,+el.dataset.hp-5);q.textContent='PV agora: '+el.dataset.hp}if(a==='Remover mob')el.remove();logMsg(m[2]+' → '+a);menu.remove()};menu.appendChild(q)});map.appendChild(menu)};el.onpointerdown=e=>{if(tool!=='select')return;e.stopPropagation();dragging=el;const p=pos(e);offset=[p[0]-parseFloat(el.style.left),p[1]-parseFloat(el.style.top)];el.setPointerCapture(e.pointerId)};el.onpointermove=e=>{if(dragging!==el)return;const p=pos(e);el.style.left=(p[0]-offset[0])+'px';el.style.top=(p[1]-offset[1])+'px'};el.onpointerup=()=>dragging=null;map.appendChild(el)}
  window.rpgForge.mobs=mobs.map(m=>m[2]);
})();
