
try{
const map=document.querySelector('#map'),stage=document.querySelector('#stage');let scale=1,x=0,y=0,tool='select',dragging=null,offset=[0,0],pan=false,panStart=[0,0],origin=[0,0],effectColor='#7c4dff',fogColor='#050608',pingColor='#d6a85d',visionColor='#d6a85d',tokenColor='#536fd2';
let visionFocusTokenId=null;
function canMoveVisionToken(t){return !visionFocusTokenId || t?.id===visionFocusTokenId;}
function updateVisionFocusRing(){const t=visionFocusTokenId&&document.getElementById(visionFocusTokenId),r=map.querySelector('.visionRing');if(!t||!r)return;const left=parseFloat(t.style.left)||0,top=parseFloat(t.style.top)||0;r.style.left=(left-150)+'px';r.style.top=(top-150)+'px';}
function render(){map.style.transform=`translate(${x}px,${y}px) scale(${scale})`;document.querySelector('#zoomLabel').textContent=Math.round(scale*100)+'%'}render();
document.querySelectorAll('.tool:not(#rpgPageTool)').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tool').forEach(q=>q.classList.remove('active'));b.classList.add('active');tool=b.dataset.tool});
function pos(e){let r=stage.getBoundingClientRect();return [(e.clientX-r.left-x)/scale,(e.clientY-r.top-y)/scale]}
map.querySelectorAll('.token').forEach(t=>{t.onpointerdown=e=>{if(tool!=='select'||!canMoveVisionToken(t))return;e.stopPropagation();dragging=t;let p=pos(e),left=parseFloat(t.style.left),top=parseFloat(t.style.top);offset=[p[0]-left,p[1]-top];t.classList.add('selected');document.querySelectorAll('.token').forEach(q=>{if(q!==t)q.classList.remove('selected')});t.setPointerCapture(e.pointerId)};t.onpointermove=e=>{if(!dragging||dragging!==t)return;let p=pos(e),nx=p[0]-offset[0],ny=p[1]-offset[1];if(document.querySelector('#snap').classList.contains('on')){nx=Math.round(nx/50)*50;ny=Math.round(ny/50)*50}t.style.left=nx+'px';t.style.top=ny+'px';updateVisionFocusRing()};t.onpointerup=()=>dragging=null});
stage.onpointerdown=e=>{if(e.target.closest('.token')||e.target.closest('.toolbar'))return;if(tool==='select'){pan=true;panStart=[e.clientX,e.clientY];origin=[x,y];stage.setPointerCapture(e.pointerId)}else if(tool==='ping'){let p=pos(e),m=document.createElement('div');m.textContent='✦';m.style.cssText=`position:absolute;left:${p[0]}px;top:${p[1]}px;z-index:8;color:${pingColor};font-size:30px;text-shadow:0 0 12px ${pingColor};pointer-events:none`;map.appendChild(m);setTimeout(()=>m.remove(),1000)}else if(tool==='fog'){let p=pos(e),f=document.createElement('div');f.className='fog';f.style.cssText=`left:${p[0]-75}px;top:${p[1]-75}px;width:150px;height:150px;border-radius:50%;background:${fogColor}dd;box-shadow:0 0 18px ${fogColor}88`;map.appendChild(f)}};stage.onpointermove=e=>{if(pan){x=origin[0]+e.clientX-panStart[0];y=origin[1]+e.clientY-panStart[1];render()}};stage.onpointerup=()=>pan=false;stage.addEventListener('wheel',e=>{e.preventDefault();zoom(scale+(e.deltaY<0?.1:-.1))},{passive:false});
function zoom(z){scale=Math.max(.25,Math.min(3,z));render()}document.querySelector('#zoomIn').onclick=()=>zoom(scale+.1);document.querySelector('#zoomOut').onclick=()=>zoom(scale-.1);document.querySelector('#zoomLabel').onclick=()=>zoom(1);document.querySelector('#reset').onclick=()=>{scale=1;x=0;y=0;render()};document.querySelector('#snap').onclick=e=>e.currentTarget.classList.toggle('on');
// Importar/exportar mapa funcional
(function(){
  const importBtn=document.querySelector('#importMap'), exportBtn=document.querySelector('#exportMap'), file=document.querySelector('#mapFile');
  if(importBtn&&file){
    importBtn.onclick=()=>file.click();
    file.onchange=()=>{const f=file.files&&file.files[0];if(!f)return;
      if(f.type.startsWith('image/')){
        const reader=new FileReader(); reader.onload=()=>{
          let bg=document.querySelector('#customMapBackground');
          if(!bg){bg=document.createElement('img');bg.id='customMapBackground';bg.style.cssText='position:absolute;left:0;top:0;width:2400px;height:1600px;object-fit:contain;z-index:0;pointer-events:none';map.insertBefore(bg,map.firstChild);}
          bg.src=reader.result; logMsg2('Mapa de imagem importado: '+f.name);
        }; reader.readAsDataURL(f);
      } else if(f.name.toLowerCase().endsWith('.json')){
        const reader=new FileReader(); reader.onload=()=>{try{const d=JSON.parse(reader.result); if(d.tokens) d.tokens.forEach(t=>{let el=document.getElementById(t.id)||map.querySelector('[data-export-id="'+t.id+'"]'); if(el){el.style.left=t.left;el.style.top=t.top;}}); if(d.zoom){scale=d.zoom.scale||scale;x=d.zoom.x||x;y=d.zoom.y||y;render();} if(d.background){let bg=document.querySelector('#customMapBackground');if(!bg){bg=document.createElement('img');bg.id='customMapBackground';bg.style.cssText='position:absolute;left:0;top:0;width:2400px;height:1600px;object-fit:contain;z-index:0;pointer-events:none';map.insertBefore(bg,map.firstChild)}bg.src=d.background;} logMsg2('Mapa/estado importado com sucesso.');}catch(e){alert('Arquivo de mapa inválido.')}}; reader.readAsText(f);
      }
      file.value='';
    };
  }
  if(exportBtn) exportBtn.onclick=()=>{
    const tokens=[...map.querySelectorAll('.token,.forgeObj')].map((el,i)=>({id:el.id||('obj-'+i),left:el.style.left,top:el.style.top,text:el.textContent,title:el.title,className:el.className,dataset:Object.fromEntries(Object.entries(el.dataset))}));
    const bg=document.querySelector('#customMapBackground');
    const data={version:2,exportedAt:new Date().toISOString(),zoom:{scale,x,y},background:bg?bg.src:null,tokens};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}), url=URL.createObjectURL(blob), a=document.createElement('a');a.href=url;a.download='rpg-forge-mapa.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);logMsg2('Mapa exportado para rpg-forge-mapa.json');
  };
})();
document.querySelectorAll('[data-die]').forEach(b=>b.onclick=()=>{let n=+b.dataset.die,r=Math.floor(Math.random()*n)+1;document.querySelector('#roll').textContent='d'+n+' → '+r});document.querySelector('#damage').onclick=()=>{let hp=document.querySelector('.hpbar i');hp.style.width=Math.max(0,parseFloat(hp.style.width)-12)+'%';};document.querySelector('#next').onclick=()=>{let log=document.querySelector('#log');log.innerHTML='<div><b>Sistema:</b> Turno avançou para Goblin.</div>'+log.innerHTML};
function send(){let i=document.querySelector('#chat'),v=i.value.trim();if(!v)return;document.querySelector('#log').innerHTML+='<div><b>Você:</b> '+v.replaceAll('<','&lt;')+'</div>';i.value='';}document.querySelector('#send').onclick=send;document.querySelector('#chat').onkeydown=e=>{if(e.key==='Enter')send()};
// drag from palette creates token
 document.querySelectorAll('.tokenItem').forEach(it=>it.ondblclick=()=>{let kind=it.dataset.kind,t=document.createElement('div');t.className='token '+kind;t.textContent=kind==='player'?'P':kind==='npc'?'N':'M';t.style.left=(600+Math.random()*300)+'px';t.style.top=(300+Math.random()*300)+'px';map.appendChild(t);location.reload()});
}catch(e){document.body.innerHTML='<div style="padding:30px;font:16px system-ui;color:#fff;background:#101216;height:100vh"><b>RPG Forge não conseguiu iniciar.</b><div style="margin-top:10px;color:#df7474">'+String(e&&e.message||e).replaceAll('<','&lt;')+'</div></div>'}