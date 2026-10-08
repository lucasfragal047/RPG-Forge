
/* Páginas/mapas locais — sem sistema de salas. O modo Mestre/Jogador é escolhido no botão lateral. */
(function(){
  const map=document.getElementById('map'), toolBtn=document.getElementById('rpgPageTool'), panel=document.getElementById('rpgPagePanel');
  const roleBtn=document.getElementById('toggleRole'), roleDesc=document.getElementById('roleDescription'), modeBadge=document.getElementById('modeBadge');
  if(!map||!toolBtn||!panel)return;
  const PAGE_KEY='rpgForgeLocalPageIdV2', ROLE_KEY='rpgForgeLocalRoleV2', DATA_KEY='rpgForgeLocalPagesV2';
  const baseHTML=map.innerHTML;
  let role=localStorage.getItem(ROLE_KEY)==='gm'?'gm':'player';
  let pages=[];
  let currentPageId=localStorage.getItem(PAGE_KEY)||'page-1';
  let saveTimer=null;
  let applyingSnapshot=false;
  function id(){return 'page-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
  function valid(s){return s&&typeof s.html==='string'&&s.html.includes('class="grid"')&&s.html.length>500}
  function snapshot(){
    const fog=document.getElementById('rpgFogLayer'), cloud=document.getElementById('rpgFogCloud'), color=document.getElementById('rpgFogColor'), vision=document.getElementById('rpgFogVisionRadius');
    let weather=null; try{weather=window.rpgForge?.weather?window.rpgForge.weather():null}catch(e){}
    const htmlClone=map.cloneNode(true); htmlClone.querySelectorAll('.spellResizeHandle').forEach(h=>h.remove()); htmlClone.querySelectorAll('.spellArea').forEach(el=>el.classList.remove('spellEditing','spellMoving')); return {version:8,html:htmlClone.innerHTML,mapStyle:map.getAttribute('style')||'',weather,fog:{opacity:document.getElementById('rpgFogOpacity')?.value||'',color:color?.value||'',visionRadius:vision?.value||'',active:!!fog?.classList.contains('active'),locked:!!window.rpgForgeFogLocked,cloudStyle:cloud?.getAttribute('style')||'',gmSeeThrough:!!cloud?.classList.contains('gmSeeThrough')}};
  }
  function applySnapshot(st){
    applyingSnapshot=true;
    try{
      const liveFog=document.getElementById('rpgFogLayer');
      if(!valid(st)){
        if(liveFog)liveFog.remove();
        map.innerHTML=baseHTML;
        window.rpgForgePageSnapshot=st||null;
      }else{
        // A névoa possui listeners próprios; nunca a recriamos com innerHTML.
        // Trocamos somente o restante do cenário e mantemos a mesma instância da névoa.
        if(liveFog)liveFog.remove();
        const holder=document.createElement('div');
        holder.innerHTML=st.html;
        holder.querySelector('#rpgFogLayer')?.remove();
        map.innerHTML=holder.innerHTML;
        if(liveFog)map.insertBefore(liveFog,map.firstChild);
        if(typeof st.mapStyle==='string')map.setAttribute('style',st.mapStyle);
        window.rpgForgePageSnapshot=st;
      }
      window.rpgForgePageApplying=true;
      window.dispatchEvent(new CustomEvent('rpgforge:apply-fog-state',{detail:(st&&st.fog)||null}));
      if(typeof window.rpgForgeRebindAfterRemoteState==='function')window.rpgForgeRebindAfterRemoteState();
      if(typeof window.rpgForgeRebindObjects==='function')window.rpgForgeRebindObjects(); if(typeof window.rpgForgeRebindMagics==='function')window.rpgForgeRebindMagics();
    }finally{
      setTimeout(()=>{applyingSnapshot=false;window.rpgForgePageApplying=false},0);
    }
  }
  function loadPages(){
    try{pages=JSON.parse(localStorage.getItem(DATA_KEY)||'[]')}catch(e){pages=[]}
    if(!Array.isArray(pages)||!pages.length){
      pages=[{id:'page-1',name:'Mapa 1',locked:false,state:null}];
      localStorage.setItem(DATA_KEY,JSON.stringify(pages));
    }
    if(!pages.some(p=>p.id===currentPageId))currentPageId=pages[0].id;
  }
  function persist(){try{localStorage.setItem(DATA_KEY,JSON.stringify(pages));localStorage.setItem(PAGE_KEY,currentPageId);localStorage.setItem(ROLE_KEY,role)}catch(e){}}
  function currentPage(){return pages.find(p=>p.id===currentPageId)||pages[0]}
  function updateRoleUI(){
    if(modeBadge)modeBadge.textContent=role==='gm'?'● Mestre':'● Jogador';
    if(roleDesc)roleDesc.textContent=role==='gm'?'Você está como Mestre. Você pode controlar mapas, névoa e ferramentas do Mestre.':'Você está como Jogador. Recursos exclusivos do Mestre ficam protegidos.';
    if(roleBtn)roleBtn.textContent=role==='gm'?'Voltar para Jogador':'Tornar-se Mestre';
    const gmView=document.getElementById('rpgFogGMView');
    if(gmView)gmView.disabled=role!=='gm';
    render();
  }
  function saveNow(){
    const pg=currentPage(); if(!pg)return;
    pg.state=snapshot();
    persist();
  }
  function save(){
    const pg=currentPage(); if(!pg)return;
    clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>{
      if(applyingSnapshot)return;
      saveNow();
    },100);
  }
  function openPage(id){
    const pg=pages.find(p=>p.id===id); if(!pg||pg.id===currentPageId)return;
    if(role!=='gm'&&pg.locked){alert('Este mapa está bloqueado pelo Mestre.');return;}
    // Salva o cenário que está saindo de forma imediata.
    clearTimeout(saveTimer);
    saveNow();
    currentPageId=id;
    persist();
    // Carrega somente o estado pertencente ao cenário escolhido.
    if(pg.state)applySnapshot(pg.state);else applySnapshot(null);
    render();
  }
  function render(){
    panel.innerHTML=''; const pg=currentPage();
    const title=document.createElement('div');title.className='rpgPageStatus';title.innerHTML='<b>📍 '+(pg?.name||'Mapa')+'</b> · '+(role==='gm'?'Mestre':'Jogador');panel.appendChild(title);
    pages.forEach(p=>{
      const row=document.createElement('div');row.className='rpgPageRow';
      const b=document.createElement('button');b.type='button';b.className='rpgPageChoice'+(p.id===currentPageId?' active':'');b.textContent=(p.locked?'🔒 ':'🗺️ ')+p.name;b.onclick=()=>openPage(p.id);row.appendChild(b);
      if(role==='gm'){
        const lock=document.createElement('button');lock.type='button';lock.className='rpgPageLock'+(p.locked?' locked':'');lock.textContent=p.locked?'🔒':'🔓';lock.title=p.locked?'Destravar':'Travar';lock.onclick=e=>{e.stopPropagation();p.locked=!p.locked;persist();render()};row.appendChild(lock);
        const ren=document.createElement('button');ren.type='button';ren.className='rpgPageLock';ren.textContent='✏️';ren.onclick=e=>{e.stopPropagation();const n=prompt('Nome do mapa:',p.name);if(n){p.name=n.slice(0,40);persist();render()}};row.appendChild(ren);
        if(pages.length>1){const del=document.createElement('button');del.type='button';del.className='rpgPageLock';del.textContent='🗑️';del.onclick=e=>{e.stopPropagation();if(confirm('Excluir '+p.name+'?')){pages=pages.filter(x=>x.id!==p.id);if(currentPageId===p.id){currentPageId=pages[0].id;applySnapshot(pages[0].state)}persist();render()}};row.appendChild(del)}
      }
      panel.appendChild(row);
    });
    if(role==='gm'){
      const add=document.createElement('button');
      add.type='button';
      add.className='rpgPageNew';
      add.textContent='＋ Novo cenário';
      add.title='Criar outro cenário independente';
      add.onclick=()=>{
        // Não usa prompt: cria imediatamente e evita bloqueios do navegador/preview.
        const current=currentPage();
        if(current){ clearTimeout(saveTimer); current.state=snapshot(); }
        const fresh={id:id(),name:'Cenário '+(pages.length+1),locked:false,state:null};
        pages.push(fresh);
        currentPageId=fresh.id;
        persist();
        applySnapshot(null);
        render();
      };
      panel.appendChild(add);
      const renameHint=document.createElement('div');
      renameHint.className='rpgPageStatus';
      renameHint.textContent='Use ✏️ para renomear cada cenário.';
      panel.appendChild(renameHint);
    }else{
      const st=document.createElement('div');st.className='rpgPageStatus';st.textContent='Mapas desbloqueados podem ser escolhidos. Mapas bloqueados ficam sob controle do Mestre.';panel.appendChild(st);
    }
  }
  roleBtn?.addEventListener('click',()=>{save();role=role==='gm'?'player':'gm';localStorage.setItem(ROLE_KEY,role);updateRoleUI()});
  toolBtn.onclick=()=>{panel.hidden=!panel.hidden;document.querySelectorAll('.tool').forEach(q=>q.classList.remove('active'));if(!panel.hidden)toolBtn.classList.add('active');render()};
  window.rpgForgePageAccess={getPages:()=>pages,isLocked:id=>!!pages.find(p=>p.id===id)?.locked,canEnter:(id,r=role)=>r==='gm'||!!pages.find(p=>p.id===id&&!p.locked),getRole:()=>role};
  window.rpgForgeRole={get:()=>role,isGM:()=>role==='gm',set:r=>{role=r==='gm'?'gm':'player';persist();updateRoleUI()}};
  window.rpgForgeSaveCurrentPage=save;
  window.rpgForgeSaveCurrentPageNow=saveNow;
  window.addEventListener('beforeunload',()=>{try{save()}catch(e){}});
  loadPages();
  const pg=currentPage(); if(pg?.state)applySnapshot(pg.state);
  updateRoleUI();
  setInterval(()=>{if(!document.hidden)save()},1500);
})();
