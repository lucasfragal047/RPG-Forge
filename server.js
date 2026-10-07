const http=require('http'),fs=require('fs'),path=require('path'),url=require('url'),WebSocket=require('ws');
const PORT=process.env.PORT||3000;
const publicDir=path.join(__dirname,'public');
const rooms=new Map();
const server=http.createServer((req,res)=>{let p=url.parse(req.url).pathname;if(p==='/'||p==='/index.html')p='/index.html';const file=path.join(publicDir,p);if(!file.startsWith(publicDir)||!fs.existsSync(file)){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':p.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res)});
const wss=new WebSocket.Server({server});
function roomState(room){if(!rooms.has(room))rooms.set(room,{html:null,clients:new Set()});return rooms.get(room)}
function broadcast(r,msg,except){const s=JSON.stringify(msg);for(const c of r.clients)if(c!==except&&c.readyState===WebSocket.OPEN)c.send(s)}
wss.on('connection',(ws,req)=>{const q=new URL(req.url,'http://localhost').searchParams;const room=(q.get('room')||'TEST').toUpperCase().slice(0,12);const role=q.get('role')==='gm'?'gm':'player';const name=(q.get('name')||'Jogador').slice(0,24);const r=roomState(room);ws.room=room;ws.role=role;ws.name=name;r.clients.add(ws);ws.send(JSON.stringify({type:'hello',room,role,name}));if(r.html)ws.send(JSON.stringify({type:'state',html:r.html}));broadcast(r,{type:'presence',count:r.clients.size});ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch{return}if(m.type==='state'){if(role!=='gm'&&r.clients.size>0){/* jogadores também podem movimentar fichas; estado compartilhado */}if(typeof m.html==='string'&&m.html.length<5_000_000){r.html=m.html;broadcast(r,{type:'state',html:m.html},ws)}}});ws.on('close',()=>{r.clients.delete(ws);broadcast(r,{type:'presence',count:r.clients.size});if(!r.clients.size)rooms.delete(room)})});
server.listen(PORT,()=>console.log(`RPG Forge online em http://localhost:${PORT}`));
