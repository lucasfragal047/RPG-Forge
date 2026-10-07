
// Névoa: nuvem gigante animada, arrastável, redimensionável e com visão dinâmica dos tokens.
(function(){
  const fog=document.getElementById('rpgFogLayer'),cloud=document.getElementById('rpgFogCloud'),toggle=document.getElementById('rpgFogToggle'),range=document.getElementById('rpgFogOpacity'),value=document.getElementById('rpgFogValue'),color=document.getElementById('rpgFogColor'),colorValue=document.getElementById('rpgFogColorValue');
  const resize=document.getElementById('rpgFogResize'),center=document.getElementById('rpgFogCenter'),big=document.getElementById('rpgFogBig'),small=document.getElementById('rpgFogSmall'),lock=document.getElementById('rpgFogLock');
  const sizeValue=document.getElementById('rpgFogSizeValue'),visionRadius=document.getElementById('rpgFogVisionRadius'),visionValue=document.getElementById('rpgFogVisionValue');
  const gmView=document.getElementById('rpgFogGMView');
  function applyScenarioFogState(st){
    st=st||{};
    const currentFog=document.getElementById('rpgFogLayer'), currentCloud=document.getElementById('rpgFogCloud');
    if(!currentFog||!currentCloud)return;
    closeFogEditor();
    fogMoveMode=false;
    if(st.cloudStyle) currentCloud.setAttribute('style',st.cloudStyle);
    if(st.color && color) color.value=st.color;
    if(st.opacity!=='' && range) range.value=String(Math.max(0,Math.min(100,Number(st.opacity)||72)));
    if(st.visionRadius && visionRadius) visionRadius.value=String(st.visionRadius);
    currentFog.classList.toggle('active',!!st.active);
    if(toggle){toggle.textContent=st.active?'☀️ Desativar fumaça':'🌫️ Ativar fumaça';toggle.classList.toggle('active',!!st.active);}
    window.rpgForgeFogLocked=!!st.locked;
    if(typeof setOpacity==='function') setOpacity(false);
    if(typeof setColor==='function') setColor();
    fogLocked=!!st.locked;
    currentCloud.classList.toggle('locked',fogLocked);
    if(lock){lock.textContent=fogLocked?'🔒 Destravar névoa':'🔓 Travar névoa';lock.classList.toggle('active',fogLocked);}
    if(st.gmSeeThrough!==undefined) gmSeeThrough=!!st.gmSeeThrough;
    if(typeof applyGMView==='function') applyGMView();
    if(typeof updateFogMoveUI==='function') updateFogMoveUI();
    if(typeof updateVision==='function') updateVision();
  }
  window.addEventListener('rpgforge:apply-fog-state',e=>applyScenarioFogState(e.detail));
  let mask=document.getElementById('rpgFogMask');
  if(!fog||!cloud||!toggle||!range||!value)return;
  // A máscara é criada aqui para que a visão acompanhe os tokens mesmo quando
  // o conteúdo do mapa é restaurado ao trocar de aba.
  function ensureMask(){
    if(mask && document.body.contains(mask)) return mask;
    let svg=document.getElementById('rpgFogVisionSvg');
    if(!svg){
      svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.id='rpgFogVisionSvg';
      svg.setAttribute('width','1');svg.setAttribute('height','1');
      svg.style.position='absolute';svg.style.width='1px';svg.style.height='1px';
      svg.style.left='-99999px';svg.style.top='-99999px';svg.style.pointerEvents='none';
      const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
      mask=document.createElementNS('http://www.w3.org/2000/svg','mask');
      mask.id='rpgFogMask';
      mask.setAttribute('maskUnits','userSpaceOnUse');
      const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
      rect.setAttribute('x','0');rect.setAttribute('y','0');rect.setAttribute('fill','white');
      mask.appendChild(rect);defs.appendChild(mask);svg.appendChild(defs);document.body.appendChild(svg);
    } else {
      mask=svg.querySelector('#rpgFogMask');
    }
    return mask;
  }
  const map=document.getElementById('map');
  function gridSize(){const grid=map&&map.querySelector('.grid');return {w:grid?grid.offsetWidth:map.clientWidth,h:grid?grid.offsetHeight:map.clientHeight,left:grid?grid.offsetLeft:0,top:grid?grid.offsetTop:0}}
  const fogPageIndex=(()=>{try{return Number(localStorage.getItem('rpgForgePageIndexV5')||localStorage.getItem('rpgForgePageIndexV4')||0)||0}catch(e){return 0}})();
  const FOG_OPACITY_KEY='rpgForgeFogOpacityV4_'+fogPageIndex;
  const FOG_GM_VIEW_KEY='rpgForgeFogGMViewV1_'+fogPageIndex;
  function fogGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function fogSet(k,v){try{localStorage.setItem(k,String(v))}catch(e){}}
  const savedOpacity=fogGet(FOG_OPACITY_KEY);
  const pageSnap=window.rpgForgePageSnapshot||null;
  const fogSnap=pageSnap&&pageSnap.fog?pageSnap.fog:null;
  if(savedOpacity!==null){
    const ov=Math.max(0,Math.min(100,Number(savedOpacity)||72));
    range.value=String(ov);
  }
  if(fogSnap){
    if(fogSnap.opacity!=='') range.value=String(Math.max(0,Math.min(100,Number(fogSnap.opacity)||72)));
    if(fogSnap.color){color.value=fogSnap.color;}
    if(fogSnap.visionRadius && visionRadius) visionRadius.value=String(Number(fogSnap.visionRadius)===3?2:fogSnap.visionRadius);
    if(fogSnap.active) fog.classList.add('active'); else fog.classList.remove('active');
    window.rpgForgeFogLocked=!!fogSnap.locked;
  }
  const savedGMView=fogGet(FOG_GM_VIEW_KEY)==='1';
  let gmSeeThrough=savedGMView;
  function applyGMView(){
    if(gmSeeThrough){cloud.classList.add('gmSeeThrough');if(gmView){gmView.textContent='👁 Mestre: névoa transparente';gmView.classList.add('active')}}
    else{cloud.classList.remove('gmSeeThrough');if(gmView){gmView.textContent='👁 Mestre: ver através';gmView.classList.remove('active')}}
  }
  if(gmView){gmView.addEventListener('click',()=>{gmSeeThrough=!gmSeeThrough;fogSet(FOG_GM_VIEW_KEY,gmSeeThrough?'1':'0');applyGMView()});}
  function setOpacity(save=true){const v=Math.max(0,Math.min(100,Number(range.value)||0));cloud.style.opacity=String(v/100);value.textContent=v+'%';if(save)fogSet(FOG_OPACITY_KEY,v)}
  range.addEventListener('input',()=>setOpacity(true));setOpacity(false);
  applyGMView();
  function setColor(){cloud.style.setProperty('--fog-color',color.value);colorValue.textContent=color.value.toUpperCase()}
  color.addEventListener('input',setColor);setColor();
  toggle.addEventListener('click',()=>{fog.classList.toggle('active');const on=fog.classList.contains('active');toggle.textContent=on?'☀️ Desativar fumaça':'🌫️ Ativar fumaça';toggle.classList.toggle('active',on);updateVision()});
  function updateSizeLabel(){if(sizeValue){const g=gridSize();sizeValue.textContent=Math.round((cloud.offsetWidth/Math.max(1,g.w))*100)+'%'}}
  function setSizePercent(percent){
    const p=Math.max(10,Math.min(100,Number(percent)||100)),g=gridSize(),oldW=cloud.offsetWidth,oldH=cloud.offsetHeight;
    const w=Math.max(260,g.w*p/100),h=Math.max(180,g.h*p/100),oldLeft=parseFloat(cloud.style.left)||g.left,oldTop=parseFloat(cloud.style.top)||g.top;
    cloud.style.width=w+'px';cloud.style.height=h+'px';cloud.style.left=(oldLeft+(oldW-w)/2)+'px';cloud.style.top=(oldTop+(oldH-h)/2)+'px';updateSizeLabel();updateVision();
  }
  function currentSize(){const g=gridSize();return Math.round((cloud.offsetWidth/Math.max(1,g.w))*100)}
  function scale(f){setSizePercent(currentSize()*f)}
  big.onclick=e=>{e.stopPropagation();scale(1.15)};
  small.onclick=e=>{e.stopPropagation();scale(.87)};
  center.onclick=e=>{e.stopPropagation();const g=gridSize();cloud.style.left=(g.left+(g.w-cloud.offsetWidth)/2)+'px';cloud.style.top=(g.top+(g.h-cloud.offsetHeight)/2)+'px';updateVision()};
  let fogLocked=false;window.rpgForgeFogLocked=false;let drag=false,dx=0,dy=0,resizing=false,startX=0,startY=0,startW=0,startH=0, fogMoveMode=false;
  // Editor da névoa: abre com duplo clique, como o editor do mapa.
  let fogEditor=null;
  function closeFogEditor(){if(fogEditor){fogEditor.remove();fogEditor=null;}}
  function pointInsideFog(e){
    const r=cloud.getBoundingClientRect();
    return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
  }
  function updateFogMoveUI(){
    if(fogEditor){
      const b=fogEditor.querySelector('.fogMoveToggle');
      if(b)b.textContent=fogMoveMode?'⛔ Parar de mover':'↔ Mover névoa';
    }
    cloud.style.cursor=(fogMoveMode&&!fogLocked)?'grab':'default';
  }
  lock.addEventListener('click',()=>{fogLocked=!fogLocked;window.rpgForgeFogLocked=fogLocked;if(fogLocked)fogMoveMode=false;lock.textContent=fogLocked?'🔒 Destravar névoa':'🔓 Travar névoa';lock.classList.toggle('active',fogLocked);cloud.classList.toggle('locked',fogLocked);updateFogMoveUI();syncFogPointer();});
  function openFogEditor(e){
    closeFogEditor();
    const box=document.createElement('div');
    box.className='imageEditor fogEditor';
    box.innerHTML='<div class="title">🌫️ Névoa selecionada</div>';
    const b=document.createElement('button');
    b.type='button'; b.className='fogMoveToggle';
    b.textContent=fogMoveMode?'⛔ Parar de mover':'↔ Mover névoa';
    b.onclick=ev=>{ev.preventDefault();ev.stopPropagation();if(fogLocked){fogMoveMode=false}else{fogMoveMode=!fogMoveMode}syncFogPointer();updateFogMoveUI();};
    box.appendChild(b);
    const l=document.createElement('button');
    l.type='button'; l.textContent=fogLocked?'🔓 Destravar névoa':'🔒 Travar névoa';
    l.onclick=ev=>{ev.preventDefault();ev.stopPropagation();fogLocked=!fogLocked;window.rpgForgeFogLocked=fogLocked;if(fogLocked)fogMoveMode=false;lock.textContent=fogLocked?'🔒 Destravar névoa':'🔓 Travar névoa';lock.classList.toggle('active',fogLocked);cloud.classList.toggle('locked',fogLocked);syncFogPointer();updateFogMoveUI();openFogEditor({clientX:e.clientX,clientY:e.clientY});};
    box.appendChild(l);
    const r=cloud.getBoundingClientRect(), gap=10;
    let left=r.right+gap, top=r.top;
    if(left+205>window.innerWidth)left=Math.max(8,r.left-215);
    if(top+170>window.innerHeight)top=Math.max(8,window.innerHeight-178);
    box.style.left=left+'px'; box.style.top=top+'px';
    document.body.appendChild(box); fogEditor=box; updateFogMoveUI();
  }
  // Duplo clique na área da névoa abre o editor.
  // Usamos captura no documento porque a névoa normalmente fica com
  // pointer-events:none para não bloquear tokens/objetos por baixo.
  function handleFogDoubleClick(e){
    if(fogEditor && fogEditor.contains(e.target))return;
    // A névoa só assume o duplo clique quando o clique foi realmente no
    // fundo do mapa/grade. Elementos do mapa continuam recebendo o próprio
    // duplo clique normalmente (imagem, objeto, token, sala etc.).
    const target=e.target;
    const interactive=target.closest?.('.token,.mapImageObject,.forgeObj,.spellArea,.room,.rpgFogCloudTools,.rpgFogResize,.imageEditor,.toolbar,.forgePanel');
    if(interactive)return;
    const mapSurface=target.closest?.('#map,.grid,.rpgFogLayer');
    if(!mapSurface)return;
    if(!fog.classList.contains('active'))return;
    if(!pointInsideFog(e))return;
    e.preventDefault();
    e.stopPropagation();
    openFogEditor(e);
  }
  document.addEventListener('dblclick',handleFogDoubleClick,true);
  document.addEventListener('pointerdown',e=>{if(fogEditor && !fogEditor.contains(e.target) && !pointInsideFog(e))closeFogEditor();});
  // A névoa nunca captura ponteiros diretamente. Assim ela não desativa o editor do mapa,
  // mesmo quando está por cima de uma imagem. No modo 'Mover', o documento faz o hit-test
  // apenas quando o clique realmente cai dentro da névoa.
  cloud.style.pointerEvents='none';
  function syncFogPointer(){cloud.style.pointerEvents='none';}
  document.addEventListener('pointerdown',e=>{
    if(fogLocked||!fogMoveMode||e.button!==0)return;
    if(e.target.closest?.('.token,.mapImageObject,.forgeObj,.spellArea,.room,.toolbar,.imageEditor,.forgePanel'))return;
    if(!pointInsideFog(e))return;
    const r=cloud.getBoundingClientRect();
    drag=true; dx=e.clientX-r.left; dy=e.clientY-r.top;
    e.preventDefault(); e.stopPropagation();
  },true);
  cloud.addEventListener('pointermove',e=>{if(!drag)return;const lr=fog.getBoundingClientRect(),nx=e.clientX-lr.left-dx,ny=e.clientY-lr.top-dy,g=gridSize();const minX=g.left-cloud.offsetWidth*.35,maxX=g.left+g.w-cloud.offsetWidth*.65,minY=g.top-cloud.offsetHeight*.35,maxY=g.top+g.h-cloud.offsetHeight*.65;cloud.style.left=Math.min(maxX,Math.max(minX,nx))+'px';cloud.style.top=Math.min(maxY,Math.max(minY,ny))+'px';updateVision()});
  cloud.addEventListener('pointerup',()=>drag=false);cloud.addEventListener('pointercancel',()=>drag=false);
  resize.addEventListener('pointerdown',e=>{if(fogLocked)return;resizing=true;startX=e.clientX;startY=e.clientY;startW=cloud.offsetWidth;startH=cloud.offsetHeight;resize.setPointerCapture(e.pointerId);e.stopPropagation();e.preventDefault()});
  resize.addEventListener('pointermove',e=>{if(!resizing)return;const f=Math.max((startW+(e.clientX-startX))/startW,(startH+(e.clientY-startY))/startH);scale(Math.max(.25,Math.min(3,f)))});
  resize.addEventListener('pointerup',()=>resizing=false);resize.addEventListener('pointercancel',()=>resizing=false);
  function getRadius(){return (Number(visionRadius&&visionRadius.value)||2)*50}
  function clearVisionHoles(){
    if(!mask)return;
    mask.querySelectorAll('circle').forEach(c=>c.remove());
  }
  function updateVision(){
    mask=ensureMask();
    if(!mask)return;
    clearVisionHoles();
    // Somente tokens dos jogadores revelam a névoa. Monstros/NPCs continuam ocultos.
    const tokens=map.querySelectorAll('.token.player');
    const g=gridSize(), radius=getRadius();
    // Calcula a posição pela tela e converte para o espaço interno da névoa.
    // Assim a visão fica exatamente centrada no token mesmo com zoom/pan do mapa.
    const cloudRect=cloud.getBoundingClientRect();
    const cloudScaleX=cloud.offsetWidth/Math.max(1,cloudRect.width);
    const cloudScaleY=cloud.offsetHeight/Math.max(1,cloudRect.height);
    if(visionValue)visionValue.textContent=String(Math.round(radius/50));
    const maskEl=mask;
    maskEl.setAttribute('maskUnits','userSpaceOnUse');
    maskEl.setAttribute('x','0');maskEl.setAttribute('y','0');
    maskEl.setAttribute('width',String(Math.max(1,cloud.offsetWidth)));
    maskEl.setAttribute('height',String(Math.max(1,cloud.offsetHeight)));
    const base=maskEl.querySelector('rect');
    if(base){base.setAttribute('x','0');base.setAttribute('y','0');base.setAttribute('width',String(Math.max(1,cloud.offsetWidth)));base.setAttribute('height',String(Math.max(1,cloud.offsetHeight)));base.setAttribute('fill','white');}
    tokens.forEach(t=>{
      const tr=t.getBoundingClientRect();
      const tx=tr.left+tr.width/2, ty=tr.top+tr.height/2;
      const cx=(tx-cloudRect.left)*cloudScaleX;
      const cy=(ty-cloudRect.top)*cloudScaleY;
      const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('cx',String(cx));
      c.setAttribute('cy',String(cy));
      // 1 bloco = 50px no mapa; o raio acompanha a escala da própria névoa.
      c.setAttribute('r',String(radius*cloudScaleX));
      c.setAttribute('fill','black');
      maskEl.appendChild(c);
    });
    // Branco = névoa visível; círculos pretos = área revelada pelos jogadores.
    cloud.style.webkitMaskImage='url(#rpgFogMask)';
    cloud.style.maskImage='url(#rpgFogMask)';
    cloud.style.webkitMaskRepeat='no-repeat';
    cloud.style.maskRepeat='no-repeat';
    cloud.style.webkitMaskSize=cloud.offsetWidth+'px '+cloud.offsetHeight+'px';
    cloud.style.maskSize=cloud.offsetWidth+'px '+cloud.offsetHeight+'px';
  }
  if(visionRadius)visionRadius.addEventListener('change',updateVision);
  setSizePercent(100);const g=gridSize();cloud.style.left=g.left+'px';cloud.style.top=g.top+'px';updateVision();
  // Atualiza a visão enquanto qualquer token existente ou criado é arrastado.
  // Observa apenas tokens. Nunca observe a própria máscara da névoa,
  // pois updateVision() altera a máscara e isso causaria um loop infinito.
  const tokenObservers=new Map();
  function watchToken(t){
    if(!t||!t.classList?.contains('token')||tokenObservers.has(t))return;
    const ob=new MutationObserver(()=>updateVision());
    ob.observe(t,{attributes:true,attributeFilter:['style','class']});
    tokenObservers.set(t,ob);
  }
  map.querySelectorAll('.token').forEach(watchToken);
  const observer=new MutationObserver(muts=>{
    for(const m of muts){
      if(m.target?.closest?.('.rpgFogVisionMask')) continue;
      m.addedNodes?.forEach(n=>{
        if(n.nodeType===1){
          if(n.classList?.contains('token')) watchToken(n);
          n.querySelectorAll?.('.token').forEach(watchToken);
        }
      });
      m.removedNodes?.forEach(n=>{
        if(n.nodeType===1){
          if(tokenObservers.has(n)){tokenObservers.get(n).disconnect();tokenObservers.delete(n)}
          n.querySelectorAll?.('.token').forEach(t=>{if(tokenObservers.has(t)){tokenObservers.get(t).disconnect();tokenObservers.delete(t)}});
        }
      });
    }
    if(muts.some(m=>m.addedNodes?.length||m.removedNodes?.length)) updateVision();
  });
  observer.observe(map,{childList:true,subtree:true});
  window.rpgForgeUpdateFogVision=updateVision;
  window.addEventListener('resize',()=>{updateSizeLabel();updateVision()});
})();
