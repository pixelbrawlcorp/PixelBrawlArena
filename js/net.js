/* Pixel Brawl Arena - js/net.js
 * NET: online play (relay WebSocket client, room join/host, state snapshots fp/up/send/snap).
 * Classic script (no modules): everything here is global. Load order: audio, input, combat, characters, net, ui, main.
 */
const r1=v=>Math.round(v*10)/10;
const fp=f=>[r1(f.x),r1(f.y),f.f,r1(f.hp),Math.round(f.ult),f.stun,f.ci,f.flash,f.bl?1:0,f.act?[f.act.t,f.act.id||0,f.act.ult||0,f.act.n||0,f.act.k||0]:0,f.kd||0,f.slam||0,r1(f.vx),f.t,f.cd,f.noarm,f.hide|0,r1(f.aim||0),f.dash|0,f.sd|0,f.g5|0,f.fm|0,f.pf|0,f.brn|0,r1(f.ltx||0),f.sk|0,r1(f.om||0),f.sdt|0,f.mb?[f.mb.s,f.mb.t,f.mb.n,r1(f.mb.tx||0),r1(f.mb.x0||0)]:0,f.jg|0,f.shk|0,f.doom|0,frBH&&frBH.own==f?r1(frBH.x):0];
const up=(f,a)=>{[f.x,f.y,f.f,f.hp,f.ult,f.stun,,f.flash,,,f.kd,f.slam,f.vx,f.t,f.cd,f.noarm,f.hide,f.aim,f.dash,f.sd,f.g5,f.fm,f.pf,f.brn,f.ltx,f.sk,f.om,f.sdt,f.mbA,f.jg,f.shk,f.doom,f.bhx]=a;f.mb=f.mbA?{s:f.mbA[0],t:f.mbA[1],n:f.mbA[2],tx:f.mbA[3],x0:f.mbA[4]}:null;f.bl=!!a[8];if(f.ci==1)frSyncBH(f);f.act=a[9]?{t:a[9][0],id:a[9][1],ult:a[9][2],n:a[9][3],k:a[9][4]||undefined}:null};
const send=()=>{if(room)room.emit('st',{p:fp(P),o:fp(O),j:PJ.map(p=>[r1(p.x),r1(p.y),p.d.r,p.d.c,r1(p.vx),r1(p.vy),p.d.bl|0]),b:BM.map(b=>[r1(b.x),r1(b.y),r1(b.ang),b.t,b.dur]),l:PL.map(q=>[q.x,q.t]),c:cut?[cut.t,cut.a==P?0:1]:0,e:ev.splice(0),ve:VE.splice(0),fl:fl_,dm:DM?[DM.t,DM.own==P?0:1]:0,km:KM?[r1(KM.x),KM.t,KM.own==P?0:1]:0,v:state=='over'?(P.hp<=0?2:1):0}).catch(()=>{})};
function snap(d){if(state!='fight')return;lastSnap=frame;for(const e of d.ve||[])veApply(e);if(d.fl>fl_)fl_=d.fl;up(P,d.p);up(O,d.o);for(const f of[P,O])if(f.ci==3&&f.act&&f.act.id==9&&f.act.t>=41&&f.act.t<47)shake=Math.max(shake,18-(f.act.t-41)*3);PJ=d.j.map(a=>({x:a[0],y:a[1],vx:a[4],vy:a[5],d:{r:a[2],c:a[3],bl:a[6]}}));BM=(d.b||[]).map(a=>({x:a[0],y:a[1],ang:a[2],t:a[3],dur:a[4]}));PL=d.l.map(a=>({x:a[0],t:a[1]}));cut=d.c?{t:d.c[0],a:d.c[1]?O:P,o:d.c[1]?P:O}:null;DM=d.dm?{t:d.dm[0],own:d.dm[1]?O:P,dur:420}:null;KM=d.km?{x:d.km[0],t:d.km[1],own:d.km[2]?O:P}:null;if(cut&&cut.t>=70&&(cut.o.x<=8.5||cut.o.x>=W-8.5)&&wk.l<=0)wk={x:cut.o.x,y:cut.o.y-14,l:300};
 for(const[x,y,t,m]of d.e){if(t==2){spark(x,y-12,'#9cf');sfx('b')}else if(t==3)shock(x,y);else{spark(x,y-12,t?'#ffd23f':'#fff',t?10:5);shake=Math.max(shake,t?5:2);tx.push({x,y:y-26,s:''+m,l:30});sl.push({x,y:y-14,l:9,l0:9,h:t,d:1,a:Math.random()});sfx(t?'H':'h')}}
 if(d.v){state='over';msg=d.v==2?'YOU WIN':'YOU LOSE';sfx('k')}}
/* ===== ONLINE TRANSPORT: works inside Claude (room API) AND on the open web (WebSocket relay, see server.js) =====
   PBA_SERVER: leave '' when the game is served by server.js itself (same address). If the html is hosted somewhere else
   (itch.io, GitHub Pages, ...) put the relay address here, e.g. 'wss://pba-relay.example.com'. ?server=... in the url overrides it. */
const PBA_SERVER='';
let cTok=0,lastSnap=0;
function relayBase(){let b=new URLSearchParams(location.search).get('server')||PBA_SERVER;
 if(!b){if(location.protocol=='http:'||location.protocol=='https:')b=location.host;else return''}
 if(!/^(wss?|https?):\/\//.test(b))b=(location.protocol=='https:'?'wss://':'ws://')+b;
 return b.replace(/^http/,'ws').replace(/\/+$/,'')}
function wsJoin(name,role){return new Promise((res,rej)=>{const base=relayBase();if(!base)return rej(new Error('noserver'));let ws;
 try{ws=new WebSocket(base+'/ws?room='+encodeURIComponent(name)+'&role='+role)}catch(e){return rej(new Error('noserver'))}
 const h={};let ok=0,done=0,tm=0;const fail=m=>{if(done)return;done=1;clearTimeout(tm);try{ws.close()}catch(e){}rej(new Error(m))};
 const room={on(e,cb){(h[e]=h[e]||[]).push(cb)},emit(e,d){if(ws.readyState!=1||ws.bufferedAmount>131072)return Promise.resolve();ws.send(JSON.stringify({e,d}));return Promise.resolve()},leave(){room.onclose=null;try{ws.close()}catch(e){}},onclose:null,onleft:null};
 tm=setTimeout(()=>fail('timeout'),60000);
 ws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data)}catch(e){return}
  if(m.e=='__ok'){if(!done){done=1;ok=1;clearTimeout(tm);res(room)}return}
  if(m.e=='__err'){fail(m.d);return}
  if(m.e=='__left'){room.onleft&&room.onleft();return}
  if(m.e=='__peer')return;
  const l=h[m.e];if(l)for(const cb of l)cb({data:m.d})};
 ws.onerror=()=>fail('net');ws.onclose=()=>{if(!ok)fail('net');else room.onclose&&room.onclose()}})}
async function joinRoom(name,role){
 if(window.claude&&window.claude.use){try{const R=await claude.use('room');if(R)return await R.join(name)}catch(e){}}
 return wsJoin(name,role)}
async function goOnline(role){err='';const my=++cTok;net=role;state='wait';room=null;
 try{let r;
  for(let k=0;;k++){try{r=await joinRoom('pba-'+code.toLowerCase(),role);break}catch(e){if(my!=cTok)return;if(role=='host'&&e&&e.message=='taken'&&k<6){code=Math.random().toString(36).slice(2,6).toUpperCase().padEnd(4,'X');continue}throw e}}
  if(my!=cTok){try{r.leave()}catch(e){}return}
  room=r;lastSnap=frame;
  if(role=='host'){room.on('inp',m=>{peerIn=m.data||{};lastIn=frame});room.on('hello',m=>{if(state=='wait')start(sel,(+m.data.ci)|0);if(state=='fight')room.emit('go',{a:P.ci,b:O.ci}).catch(()=>{})})}
  else{room.on('go',m=>{if(state!='wait')return;clearInterval(hi);start(m.data.a,m.data.b,1);lastSnap=frame});room.on('st',m=>snap(m.data));const hello=()=>state=='wait'&&room.emit('hello',{ci:sel}).catch(()=>{});hello();hi=setInterval(hello,1000)}
  room.onclose=()=>{if(net){err='CONNECTION LOST';back()}};
  room.onleft=()=>{if(!net||(role=='host'&&state=='wait'))return;err='OPPONENT LEFT';back()};
 }catch(e){if(my!=cTok)return;const m=e&&e.message;err=m=='noroom'?'ROOM NOT FOUND':m=='full'?'ROOM IS FULL':m=='noserver'?'ONLINE SERVER NOT SET':'CANNOT REACH SERVER';net=0;room=null;state='menu'}}
function back(){cTok++;clearInterval(hi);try{room&&room.leave()}catch(e){}room=null;net=0;state='menu'}
