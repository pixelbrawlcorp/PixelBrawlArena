/* Pixel Brawl Arena - js/main.js
 * MAIN: global state + canvas, per-frame step(), draw(), main loop, and startup wiring (event listeners / initial loads). Loaded LAST.
 * Classic script (no modules): everything here is global. Load order: audio, input, combat, characters, net, ui, main.
 */
const SC=4,MAXHP=200,SUKS=.75/* Sukuna damage multiplier (1 = old damage) */,DIOS=1.25/* Dio damage multiplier (1 = old damage) */;
const C=document.getElementById('c');
let X=C.getContext('2d');
X.imageSmoothingEnabled=false;
const W=320,H=180,G=150,GR=.18,K={},E={};
let mx=200,my=80,shake=0,state='menu',sel=0,fx=[],tx=[],PJ=[],PL=[],cut=null,P,O,ME,ko=0,frame=0,msg='';
let BM=[],RG=[],CK=[],VR=[],TR=[],fl_=0,wk={l:0},mode=0,menu=0,aiMode=1,hs=0,sl=[],ev=[],net=0,room=null,code='',codeIn='',peerIn={},lastIn=-99,err='',hi=0;
let BS=[],ts=null,rr=null,GF=[],gc=null;
const MAPS=['NEON CITY','DESERT','DOJO','SNOW PEAKS','TEMPLE RUINS'];
let aiD=2,oc=0,mp=0,ad=2,orow=0;
function step(){frame++;shake*=.85;mobAim();
 if(net=='guest'&&state=='fight'&&frame-lastSnap>600){err='CONNECTION LOST';back();return}
 if(state=='over'&&net=='host'&&frame%6==0)send();
 if(state!='fight')return;
 if(net=='guest'){room.emit('inp',inp()).catch(()=>{});for(const k in E)if(E[k]>0)E[k]--;sjFx(P);sjFx(O);fxs();return}
 if(hs>0){hs--;if(net=='host'&&frame%2==0)send();return}
 if(gc){const f=gc.f;gc.t++;f.flash=0;if(gc.t<40){shake=Math.max(shake,gc.t/12);if(gc.t%8==0)sfx('m');if(gc.t%2==0)fx.push({x:f.x+(Math.random()-.5)*14,y:f.y,vx:0,vy:-1-Math.random()*2,l:20,c:'#fff'})}if(gc.t==40){f.g5=1;f.ult=100;shake=14;sfx('u');spark(f.x,f.y-14,'#fff',30);spark(f.x,f.y-14,'#4ef',20)}if(gc.t>=100)gc=null;fxs();return}
 if(rr){const r=rr,a=r.a,o=r.o;r.t++;a.vx=o.vx=o.vy=0;o.stun=999;o.y=G;
  if(r.t==44){o.hp=Math.max(0,o.hp-Math.round(30*DIOS));o.flash=12;shake=22;hs=8;blood(o.x,o.y-10,44);shock(o.x,G);sfx('k')}
  if(r.t>44&&r.t%4==0)blood(o.x,o.y-4,3);
  if(r.t>=84){o.stun=60;o.kd=1;o.vx=a.f*1.5;o.vy=-1.5;a.act=null;rr=null}
  fxs();return}
 if(cut){const c=cut,a=c.a,o=c.o,w=a.f>0?W-8:8;if(c.t>=66||(c.z=(c.z||0)+1)%2==0)c.t++;a.t++;o.t++;a.flash=Math.max(0,a.flash-1);o.flash=Math.max(0,o.flash-1);
  if(c.t<66){shake=Math.max(shake,c.t/22);if(c.t%2==0)fx.push({x:a.x+(Math.random()-.5)*16,y:a.y,vx:(Math.random()-.5)*.6,vy:-1.4-Math.random()*1.5,l:24,c:c.t%4?'#fa3':'#ff6'});if(c.t==30)sfx('m');if(c.t==60)sfx('u')}
  if(c.t==68){o.hp=Math.max(0,o.hp-Math.round(34*(a.rm>0?1.25:1)));o.flash=10;shake=28;spark(o.x,o.y-14,'#ffd23f',40);spark(o.x,o.y-14,'#fff',24);sfx('H');sfx('k',.8);shock(o.x,o.y);ring(o.x,o.y-14,4,'#fff',{l:18,dr:5});ring(o.x,o.y-14,2,'#ffd23f',{l:14,dr:3.4});fl_=10;burst(o.x,o.y-14,['#fff','#ffd23f','#f33'],40,6,1);c.fly=1;hs=11;tx.push({x:o.x,y:o.y-46,s:'DEATH PUNCH!',l:70})}
  if(c.fly){const k=c.t-68;o.x+=a.f*(k<3?4:14);o.y=a.y-Math.min(k,8)*2.5;if(c.t%2==0)spark(o.x-a.f*6,o.y-12,'#fff',2);
   if((w-o.x)*a.f<=0){o.x=w;c.fly=0;c.pin=c.t;o.hp=Math.max(0,o.hp-12);o.flash=10;shake=24;hs=8;spark(w,o.y-14,'#ffd23f',24);sfx('k');wk={x:w,y:o.y-14,l:300};for(let i=0;i<18;i++)fx.push({x:w,y:o.y-14+(Math.random()-.5)*24,vx:-a.f*(1+Math.random()*2.5),vy:-2+Math.random()*2,l:45,c:'#8a7a9a',w:3,h:3})}}
  if(c.pin){o.x=w;o.vx=o.vy=0;o.stun=400}
  if(c.pin&&c.t>=c.pin+55||c.t>=c.dur){o.stun=70;o.kd=1;o.vx=-a.f*1.2;o.vy=-1;cut=null}
  fxs();if(net=='host'&&frame%2==0)send();return}
 P.in=inp();for(const k in E)if(E[k]>0)E[k]--;
 O.in=net=='host'?(peerIn&&lastIn>-99?peerIn:{ax:O.x+O.f*50,ay:O.y-12}):(aiD?ai(O,P):{ax:P.x,ay:P.y-12});if(ts){ts.t++;const z=ts.own,v=ts.tg;upd(z,v);if(ts.t>=ts.dur){v.fz=0;const dm=v.def||0;v.def=0;ts=null;if(dm>0){v.hp=Math.max(0,v.hp-dm);v.flash=12;v.stun=70;v.kd=1;v.vx=z.f*3;v.vy=-2;blood(v.x,v.y-14,36);spark(v.x,v.y-14,'#ffd23f',18);shake=18;hs=9;sfx('H');tx.push({x:v.x,y:v.y-34,s:'TIME RESUMES -'+Math.round(dm),l:60})}}}else{upd(P,O);upd(O,P)}
 for(const p of PJ){if(ts&&p.own==ts.tg)continue;p.x+=p.vx;p.y+=p.vy;p.l--;const t=p.own==P?O:P;
  if(Math.abs(p.x-t.x)<p.d.r+5&&p.y>t.y-26&&p.y<t.y+2&&!(t.inv>0)){hit(p.own,t,{...p.d,dir:Math.sign(p.vx)||1});p.l=0}
  if(p.d.th&&p.y>G-4&&p.l>0){p.l=0;GF.push({k:'c',x:p.x,t:0,own:p.own,d:{dmg:4,heavy:1,st:110}})}if(p.x<-20||p.x>W+20||p.y>G+10||p.y<-30)p.l=0}
 PJ=PJ.filter(p=>p.l>0);
 for(const b of BM){b.t++;const f=b.own,t=f==P?O:P,fin=b.t==b.dur-1;const da=Math.atan2(Math.sin(f.aim-b.ang),Math.cos(f.aim-b.ang));b.ang+=clamp(da,-.025,.025);b.x=f.x+f.f*10;b.y=f.y-18;
  if((b.t%4==0||fin)&&!t.hide){const dx=t.x-b.x,dy=t.y-14-b.y,c=Math.cos(b.ang),s=Math.sin(b.ang);if(dx*c+dy*s>0&&Math.abs(-dx*s+dy*c)<14)hit(f,t,fin?{dmg:5,heavy:1,brk:1,lift:-2,kb:5,st:60,zol:1,dir:Math.sign(c)||1}:{dmg:1.2,brk:1,st:20,kb:1.2,nohs:1,dir:Math.sign(c)||1})}}
 BM=BM.filter(b=>b.t<b.dur);
 for(const q of PL){q.t++;const t=q.own==P?O:P;if(q.t==36&&Math.abs(t.x-q.x)<13&&t.y>G-30)hit(q.own,t,{fire:5,dmg:10,heavy:1,brk:1,lift:-2.5,kb:1,st:50,dir:Math.sign(t.x-q.x)||1});if(q.t==36){shake=10;fl_=4;sfx('H');ring(q.x,G-2,4,'#fc6',{l:16,dr:2.6,e:1});ring(q.x,G-2,2,'#ffa',{l:12,dr:3.4,e:1});debris(q.x);burst(q.x,G-10,['#fff','#fc6','#f60'],14,3,1.5)}if(q.t>36&&q.t<48&&q.t%4==0)ring(q.x,G-6-(q.t-36)*7,7,'#fe9',{l:8,dr:.9,e:1})}
 PL=PL.filter(q=>q.t<62);for(const q of GF){q.t++;if(q.k!='l'&&q.t==16){const t=q.own==P?O:P;if(Math.abs(t.x-q.x)<18*(q.s||1)){const r=hit(q.own,t,q.d?q.d:q.k=='d'?{dmg:6,heavy:1,brk:1,kb:.3,st:80}:{dmg:6,heavy:1,brk:1,lift:-5,kb:.3,st:80});if(r&&q.k=='d'){t.vy=7;t.slam=1}}shake=Math.max(shake,9);shock(q.x,G)}}GF=GF.filter(q=>q.t<(q.k=='l'?8:34));fxs();
 if(!ko&&(P.hp<=0||O.hp<=0)){const L=P.hp<=0?P:O,Wn=L==P?O:P;ko=110;msg=P.hp<=0?'YOU LOSE':'YOU WIN';FIN={t:0,l:L,w:Wn};L.hp=0;L.act=null;L.bl=false;L.stun=999;L.kd=1;L.vy=-3.6;L.vx=Wn.f*3.4;hs=Math.max(hs,14);shake=26;fl_=8;sfx('k');sfx('H',.6);burst(L.x,L.y-14,['#fff','#ffd23f','#f33'],54,6,1);ring(L.x,L.y-14,3,'#fff',{l:18,dr:4});ring(L.x,L.y-14,2,'#ffd23f',{l:14,dr:3})}
 if(FIN)FIN.t++;if(ko&&--ko==0)state='over';
 if(net=='host'&&frame%2==0)send()}
const FW=240*SC,FH=130*SC,FB=document.createElement('canvas');
FB.width=FW;
FB.height=FH;
const FX=FB.getContext('2d',{willReadFrequently:true}),OB=document.createElement('canvas');
OB.width=FW;
OB.height=FH;
const OX=OB.getContext('2d'),OID=OX.createImageData(FW,FH),SM=new Uint8Array(FW*FH);
function draw(){X.setTransform(SC,0,0,SC,0,0);X.fillStyle='#000';X.fillRect(0,0,W,H);
 if(state=='opts'){optsDraw();return}if(state=='set'){setDraw();return}if(state=='select'){selDraw();return}if(state=='menu'){menuDraw();return}if(state=='wait'||state=='code'){waitDraw();return}
 X.save();if(shake>.3)X.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 if(cut){const z=cut.t<66?2.1-cut.t*.003:1.9-Math.min(cut.t-66,10)*.075;X.translate(W/2,H/2+10);X.scale(z,z);X.translate(-(cut.a.x+cut.o.x)/2,-(cut.a.y-14))}
 if(FIN&&FIN.t<46){const q=FIN.t,z=1+.85*Math.sin(Math.min(1,q/10)*1.5708)*(q<34?1:(46-q)/12);X.translate(W/2,H/2+10);X.scale(z,z);X.translate(-FIN.l.x,-(FIN.l.y-14))}
 if(gc){const z=1.6+Math.min(gc.t,40)*.01;X.translate(W/2,H/2+10);X.scale(z,z);X.translate(-gc.f.x,-(gc.f.y-14))}bg();yjBack();for(const k of CK){X.fillStyle='rgba(10,5,20,'+Math.min(1,k.l/60)+')';for(let i=1;i<9;i++){X.fillRect(k.x+i*3,G+2+(i*5%7),3,1);X.fillRect(k.x-i*3,G+2+(i*3%7),3,1)}X.fillRect(k.x-1,G,2,6)}
 if(wk.l>0){X.fillStyle='rgba(8,4,16,'+Math.min(1,wk.l/50)+')';for(let i=0;i<8;i++)for(let r=4;r<10+(i%3)*7;r+=2)X.fillRect(Math.round(wk.x+Math.cos(i*.785)*r),Math.round(wk.y+Math.sin(i*.785)*r+(r%4?1:0)),2,2)}
 if((P.act&&P.act.ult)||(O.act&&O.act.ult)){X.fillStyle='rgba(20,0,40,.4)';X.fillRect(-40,-40,W+80,H+80)}
 for(const q of PL){const t=q.t;
  if(t<36){const u=Math.min(1,t/8);mcircle(q.x,G-1,26*u,t,'#c9f','#fff');
   if(t>6){const g=Math.min(1,(t-6)/24),pu=.65+.35*Math.sin(t*.55);
    for(let i=0;i<5;i++){const w=Math.round((8+i*6)*g);X.fillStyle='rgba(255,'+(235-i*28)+','+(170-i*30)+','+((.5-i*.08)*g*pu).toFixed(3)+')';X.fillRect(q.x-w,G-2-i*2,w*2,2+i*2)}
    X.fillStyle='rgba(255,200,120,'+(.16*g*pu).toFixed(3)+')';X.fillRect(q.x-7,G-110*g,14,110*g);X.fillStyle='rgba(255,240,200,'+(.45*g*pu).toFixed(3)+')';X.fillRect(q.x-2,G-80*g,4,80*g)}}
  else{const k=t-36,rise=Math.min(1,k/7),e=Math.min(1,.6+k/5)*Math.min(1,(62-t)/12),top=Math.round(G-(G+8)*rise);
   for(let y=top;y<G;y+=3){const dy=(G-y)/G,tp=Math.min(1,(y-top)/14),fl=1+Math.max(0,(y-(G-26))/26)*.8,w=Math.round((9*(1-dy*.45)*fl+Math.sin(y*.35+frame*.6)*2)*e*(.35+.65*tp));if(w<1)continue;
    X.fillStyle='rgba(220,40,20,.45)';X.fillRect(q.x-w-3,y,w*2+6,3);X.fillStyle=y%6?'#f60':'#fa2';X.fillRect(q.x-w,y,w*2,3);X.fillStyle='#fd5';X.fillRect(q.x-Math.round(w*.62),y,Math.round(w*1.24),3);X.fillStyle='#ffe';X.fillRect(q.x-Math.round(w*.26),y,Math.max(1,Math.round(w*.52)),3)}
   X.fillStyle='rgba(255,170,70,'+(.3*e).toFixed(3)+')';X.fillRect(q.x-22,G-5,44,5);X.fillStyle='rgba(255,230,160,'+(.5*e).toFixed(3)+')';X.fillRect(q.x-14,G-3,28,3)}}
 X.fillStyle='#7a0a0a';for(const s of BS)X.fillRect(s.x,G+1+s.o,s.w,1);
 for(const q of AF){X.globalAlpha=.5*q.l/q.l0;X.drawImage(q.c,q.x,q.y,100,68)}X.globalAlpha=1;outl(P);outl(O);drawF(P);drawF(O);swoosh(P);swoosh(O);drawGF();if(rr&&rr.t>=12){const q=rr.t,y=q<22?-60:q<44?-60+Math.pow((q-22)/22,2)*(G+60):G;roller(rr.o.x,y,q)}
 for(const r of RG){X.strokeStyle='rgba(255,255,255,'+r.l/16+')';X.beginPath();X.ellipse(r.x,G+1,r.r,r.r*.22,0,0,6.3);X.stroke()}
 drawVF();drawBeams();yjFront();vgFront();
 for(const p of PJ){const r=p.d.r;if(p.d.wv||p.d.c=='#f83'){sjWave(p);continue}if(p.d.c=='#e0112a'){yjSlash(p);continue}if(p.d.c=='#ff6a14'){yjArrow(p);continue}if(p.d.th||p.d.c=='#8ef'){g5boltProj(p);continue;X.fillStyle='#8ef';X.fillRect(p.x-3,p.y-3,6,6);X.fillStyle='#fff';X.fillRect(p.x-1,p.y-1,2,2);for(let i=1;i<6;i++)X.fillRect(p.x-p.vx*i*1.5+(i%2?2:-2),p.y-p.vy*i*1.5,2,2);continue}if(p.d.mb){X.save();X.translate(p.x,p.y);X.rotate(Math.atan2(p.vy,p.vx));X.fillStyle='rgba(180,100,255,.35)';X.fillRect(-34,-4,34,8);X.fillStyle='#a5f';X.fillRect(-30,-2,30,4);X.fillStyle='#fff';X.fillRect(-26,-1,26,2);X.restore();continue}if(p.d.kn){X.save();X.translate(p.x,p.y);X.rotate(frame*.6);X.fillStyle='#dde';X.fillRect(-4,-1,8,2);X.fillStyle='#fff';X.fillRect(0,-1,4,1);X.fillStyle='#531';X.fillRect(-5,-1,2,2);X.restore();continue}if(p.d.c=='#fb4'){boltDraw(p);continue}if(p.d.bl){bladeDraw(p);continue}if(0){X.save();X.translate(p.x,p.y);X.rotate(Math.atan2(p.vy||0,p.vx));X.fillStyle='rgba(120,230,255,.4)';X.fillRect(-24,-2,24,4);X.fillStyle='#9ef';X.fillRect(-4,-6,3,12);X.fillRect(-1,-5,3,10);X.fillRect(2,-3,3,6);X.fillRect(5,-1,3,2);X.fillStyle='#fff';X.fillRect(-2,-3,3,6);X.restore();continue}X.fillStyle=p.d.c;X.fillRect(p.x-r,p.y-r,r*2,r*2);X.fillStyle='#fff';X.fillRect(p.x-r/2,p.y-r/2,r,r);if(r>6){X.fillStyle='rgba(180,100,255,.4)';X.fillRect(p.x-p.vx*6-r,p.y-r,r*2,r*2)}}
 for(const p of fx){X.fillStyle=p.c;X.fillRect(Math.round(p.x),Math.round(p.y),p.w||2,p.h||2)}
 for(const q of sl){const t=1-q.l/q.l0,r=4+t*(q.h?18:10),z=q.h?3:2;X.fillStyle=q.h?'#ffd23f':'#fff';for(let k=0;k<8;k++){const an=k*.785+q.a;X.fillRect(Math.round(q.x+Math.cos(an)*r),Math.round(q.y+Math.sin(an)*r),z,z)}for(let k=-7;k<=7;k++)X.fillRect(Math.round(q.x+k*q.d),Math.round(q.y+k*.7),q.l>4?2:1,1)}
 for(const t of tx)T(t.s,t.x,t.y,'#ffd23f','center',7);
 if(ts){X.globalCompositeOperation='difference';X.fillStyle=ts.t<10?'#fff':'rgba(255,255,255,.55)';X.fillRect(-40,-40,W+80,H+80);X.globalCompositeOperation='source-over'}if(gc&&gc.t>30){const c=gc.f;X.fillStyle='rgba(255,255,255,.7)';for(let k=0;k<16;k++){const an=k*.39+gc.t*.02;X.save();X.translate(c.x,c.y-14);X.rotate(an);X.fillRect(10,-1,60+(gc.t-30)*3,2);X.restore()}if(gc.t<62){X.fillStyle='rgba(255,255,255,'+Math.max(0,1-Math.abs(gc.t-42)/20)+')';X.fillRect(-40,-40,W+80,H+80)}}distort();X.restore();hud();if(ts)T(((ts.dur-ts.t)/60).toFixed(1)+'s',W/2,42,'#ffd23f','center',10);
 if(FIN&&state=='fight'){const t=FIN.t;if(t<8){X.fillStyle='rgba(255,255,255,'+((1-t/8)*.8).toFixed(2)+')';X.fillRect(0,0,W,H)}if(t<46){X.fillStyle='rgba(0,0,0,'+(Math.min(1,t/10)*.9).toFixed(2)+')';X.fillRect(0,0,W,20);X.fillRect(0,H-20,W,20)}if(t>=5&&t<100){const k=Math.min(1,(t-5)/6);T('FINISH!',W/2+(t<40?(Math.random()-.5)*3:0),84,t%8<4?'#fff':'#ffd23f','center',Math.round(36-10*k))}}
 if(cut||rr||gc){X.fillStyle='#000';X.fillRect(0,0,W,22);X.fillRect(0,H-22,W,22);T(gc?'GEAR 5':rr?'ROAD ROLLER DA!':'DEATH PUNCH',W/2,15,'#ffd23f','center',10)}
 if(state=='over'){X.fillStyle='rgba(0,0,0,.6)';X.fillRect(0,0,W,H);T(msg,W/2,85,msg=='YOU WIN'?'#4c4':'#e53','center',20);T('Enter: main menu',W/2,105,'#fff','center',8)}}
C.onmousemove=e=>{mpos(e);if(state=='set'){setMove();return}if(state=='select'){const i=selAt(mx,my);if(i>=0)sel=i}if(state=='menu')for(let i=0;i<4;i++)if(mx>90&&mx<230&&my>70+i*20&&my<86+i*20)menu=i};
C.onmousedown=e=>{mpos(e);if(state=='set'){setMouse(e);return}if(state=='opts'){for(let i=0;i<3;i++)if(mx>60&&mx<260&&my>52+i*26&&my<72+i*26){orow=i;optCh(1);sfx('m')}if(my>138)beginMatch();return}if(state=='menu'){for(let i=0;i<4;i++)if(mx>90&&mx<230&&my>70+i*20&&my<86+i*20){menu=i;pick()}}
 else if(state=='select'){if(0){}else if(selAt(mx,my)>=0){sel=selAt(mx,my);go()}}else if(state=='fight'){const c='Mouse'+e.button;K[c]=1;press(c)}};
C.oncontextmenu=e=>e.preventDefault();
/* mobile long-press: block the native Save/Download/Copy menu and text/image selection (canvas + whole page) */
for(const t of[C,document])for(const ev_ of['contextmenu','selectstart','dragstart'])t.addEventListener(ev_,e=>e.preventDefault(),{passive:false});
{const d0=draw;draw=()=>{d0();X.fillStyle='rgba(0,0,0,.1)';for(let y=0;y<H;y+=2)X.fillRect(0,y,W,1);const g=X.createRadialGradient(W/2,H/2,60,W/2,H/2,200);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');X.fillStyle=g;X.fillRect(0,0,W,H)}}
loadSet();
/* ===================== v13 : MUSIC ENGINE + FINISH ===================== */
/* Original compositions rendered live with Web Audio (no audio files needed).
   To use your own licensed tracks instead, fill MUSIC_URLS (same order as MAPS), e.g. 'music/neon.mp3'. */
let FIN=null;
tLoad();
tcSafeU();
C.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];
 if(state=='fight'){if(CT==1){if(TAIM==2)tapAim(t)}else{C.onmousemove(tpos(t));C.onmousedown(tpos(t));setTimeout(()=>onmouseup({button:0}),90)}return}
 if(state=='over'){if(performance.now()-overAt>900)back();return}if(state=='wait'){back();return}if(state=='code'){mcode();return}
 C.onmousemove(tpos(t));C.onmousedown(tpos(t))},{passive:false});
C.addEventListener('touchmove',e=>{e.preventDefault();const t=e.changedTouches[0];if(state=='fight'){if(CT==1&&TAIM==2)tapAim(t);return}C.onmousemove(tpos(t))},{passive:false});
C.addEventListener('touchend',e=>{e.preventDefault();onmouseup({button:0})},{passive:false});
tcBuild();
requestAnimationFrame(tcTick);
let last=0,acc=0;
function loop(t){acc+=Math.min(t-last,100)*(FIN&&FIN.t<40?.3:1);last=t;while(acc>=16.67){step();acc-=16.67}draw();requestAnimationFrame(loop)}
requestAnimationFrame(loop);
