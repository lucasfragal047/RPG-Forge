
(function(){
  const coarse=window.matchMedia && window.matchMedia('(pointer:coarse)');
  const isMobile=()=>window.innerWidth<=900 || !!(coarse&&coarse.matches);
  function syncSideState(el){
    if(!el)return;
    el.dataset.mobile='1';
    el.classList.toggle('mobileExpanded',!el.classList.contains('collapsed'));
  }
  function setup(){
    document.querySelectorAll('.side').forEach(el=>{
      syncSideState(el);
      const btn=el.querySelector(':scope > .sideCollapse');
      if(btn && !btn.dataset.mobileBound){
        btn.dataset.mobileBound='1';
        btn.addEventListener('click',()=>setTimeout(()=>syncSideState(el),0));
      }
    });
    if(isMobile()){
      // No primeiro acesso ao celular, o mapa fica livre; o usuário abre cada lateral pela aba da borda.
      ['rpgForgeLeftSideCollapsedV1','rpgForgeRightSideCollapsedV1'].forEach((key,i)=>{
        try{
          if(localStorage.getItem(key)===null){
            localStorage.setItem(key,'1');
            const el=document.querySelector(i===0?'.side:not(.right) .sideCollapse':'.side.right .sideCollapse');
            if(el && !el.closest('.side').classList.contains('collapsed')) el.click();
          }
        }catch(_){ }
      });
      document.querySelectorAll('.side').forEach(syncSideState);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
  window.addEventListener('resize',()=>document.querySelectorAll('.side').forEach(syncSideState));

  // Pinch-to-zoom no mapa, sem interferir no zoom/arrasto existente.
  const stage=document.querySelector('#stage');
  if(stage){
    let pinchStart=null;
    const dist=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
    const center=(a,b)=>({x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2});
    stage.addEventListener('touchstart',e=>{
      if(e.touches.length!==2)return;
      e.preventDefault();
      pinchStart={distance:dist(e.touches[0],e.touches[1]),scale:typeof scale==='number'?scale:1,cx:center(e.touches[0],e.touches[1]).x,cy:center(e.touches[0],e.touches[1]).y};
    },{passive:false});
    stage.addEventListener('touchmove',e=>{
      if(!pinchStart||e.touches.length!==2)return;
      e.preventDefault();
      const nowD=dist(e.touches[0],e.touches[1]);
      const c=center(e.touches[0],e.touches[1]);
      const oldScale=pinchStart.scale;
      const next=Math.max(.25,Math.min(3,oldScale*(nowD/Math.max(1,pinchStart.distance))));
      const ratio=next/oldScale;
      // Mantém o ponto sob o centro do gesto aproximadamente no mesmo lugar.
      if(typeof x==='number'&&typeof y==='number'){
        x=c.x-(pinchStart.cx-x)*ratio;
        y=c.y-(pinchStart.cy-y)*ratio;
      }
      scale=next;
      if(typeof render==='function')render();
    },{passive:false});
    stage.addEventListener('touchend',e=>{if(e.touches.length<2)pinchStart=null},{passive:true});
    stage.addEventListener('touchcancel',()=>{pinchStart=null},{passive:true});
  }
})();
