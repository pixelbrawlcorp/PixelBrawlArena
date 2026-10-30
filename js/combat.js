/* Pixel Brawl Arena - js/combat.js
 * COMBAT: fighter factory, hit/damage, projectiles, base moves (m1/sk/ultimate), update + AI, visual-effect helpers (VFX), start().
 * Classic script (no modules): everything here is global. Load order: audio, input, combat, characters, net, ui, main.
 */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function mk(ci,x,f,human){return{ci,x,y:G,vx:0,vy:0,f,hp:MAXHP,ult:0,stun:0,act:null,cd:[0,0,0],combo:0,ct:0,bl:false,bh:3,dash:0,dcd:0,slam:0,human,in:{},flash:0,t:0,noarm:0,hide:0,aim:0,dn:0,dd:1,dv:0,rec:0,inv:0,sp:[0,0,0,0]}}
const inF=(f,o,r)=>{const d=(o.x-f.x)*f.f;return d>-4&&d<r&&Math.abs(o.y-f.y)<32};
const spark=(x,y,c,n=6)=>{for(let i=0;i<n;i++)fx.push({x,y,vx:(Math.random()-.5)*3,vy:(Math.random()-.8)*3,l:14,c})};
/* true while f is in/using an ultimate: transformation forms, ult moves (act id 9), Boxer cutscene, Dio time stop / road roller, Domain */
function ultOn(f){return !!(f.g5||f.sk||f.sdt>0||(f.act&&f.act.id==9)||(cut&&cut.a==f)||(ts&&ts.own==f)||(rr&&rr.a==f)||(DM&&DM.own==f))}
function mvFX(f){const ci=f.ci;if(ci<4||ci>6)return;const sk=ci==5&&f.sk,C=ci==6?'#6af':ci==4?'#f84':sk?'#c02040':'#d0283c',C2=ci==6?'#cfe8ff':ci==4?'#ffd23f':sk?'#222':'#fff',fw=f.f,air=f.y<G-3,dn=f.dash>0,st=dn&&!f._pd,tk=!f._pa&&air&&f.vy<0&&!dn,rnd=Math.random,bk=fw>0?3.1416:0;f._pd=dn;f._pa=air;
 if(st){ring(f.x,f.y-12,2,C,{l:12,dr:3});for(let i=0;i<3;i++)trl({x:f.x-fw*4,y:f.y-6-i*6,a:bk,len:24,l:8,l0:8,w:2-(i%2),c:i?C2:C});if(!air)burst(f.x-fw*4,f.y-1,[ci==6?'#9cf':'#cfc8b8','#9a9488'],6,1.8,.2);else if(ci==4)ring(f.x,f.y+1,2,'#fff',{l:10,dr:3})}
 if(dn){if(frame%2==0)f.aiq=C;
  if(ci==6){if(frame%3==0)fx.push({x:f.x-fw*6+rnd()*4,y:f.y-4-rnd()*20,vx:-fw*.5,vy:-.3,l:12,c:C2,w:1,h:3})}
  else if(ci==4)fx.push({x:f.x-fw*5,y:f.y-3,vx:-fw*1.2,vy:-.5-rnd(),l:12,c:rnd()<.5?'#f84':'#ffd23f',w:2,h:2});
  else if(!sk){if(frame%2==0)trl({x:f.x,y:f.y-8-rnd()*16,a:bk,len:16,l:5,l0:5,w:1,c:rnd()<.5?'#fff':'#d0283c'})}
  else if(frame%2==0)trl({x:f.x+(rnd()-.5)*18,y:f.y-6-rnd()*20,a:rnd()*6.28,len:12,l:6,l0:6,w:1,c:rnd()<.5?'#f33':'#fff'})}
 if(f._pdd&&!dn&&ci==6)trl({x:f.x,y:f.y-4,a:-1.5708,len:30,l:10,l0:10,w:1,c:'#fff'});f._pdd=dn;
 if(tk){if(ci==6){ring(f.x,f.y-1,2,C,{l:12,dr:2.6});for(let i=0;i<4;i++)trl({x:f.x-6+i*4,y:f.y,a:-1.5708,len:10+rnd()*8,l:10,l0:10,w:1,c:C})}
  else if(ci==4)burst(f.x,f.y,['#f84','#ffd23f','#fff'],8,2,.3);
  else if(!sk){burst(f.x,f.y-1,['#cfc8b8','#9a9488'],6,1.6,.2);ring(f.x,f.y-1,2,'#d0283c',{l:9,dr:2.2})}
  else{burst(f.x,f.y,['#e03','#222','#a5f'],8,2,0);ring(f.x,f.y-1,2,'#e03',{l:12,dr:2.8})}}
 if(air&&f.vy<0&&frame%3==0){if(ci==6)trl({x:f.x+(rnd()-.5)*8,y:f.y-10,a:1.5708,len:14,l:8,l0:8,w:1,c:'#8cf'});else if(ci==4)fx.push({x:f.x+(rnd()-.5)*4,y:f.y-2,vx:0,vy:.6,l:10,c:'#f84',w:2,h:2});else if(sk)fx.push({x:f.x+(rnd()-.5)*10,y:f.y-4,vx:0,vy:-.5,l:14,c:rnd()<.5?'#e03':'#222',w:2,h:2})}}
function ugain(x,v){if(x.sk)x.om=Math.min(100,(x.om||0)+v*.55);else if(x.ci==1&&x.doom>0){}else x.ult=Math.min(100,x.ult+v)}
function hit(f,o,d){if(f.sdt>0&&f.ci==6&&!d._v){d={...d,dmg:d.dmg*1.15,_v:1}}if(f.ci==2&&!d._i)d={...d,dmg:d.dmg*DIOS,_i:1};if(f.ci==5&&f.sk&&!d._s)d={...d,dmg:d.dmg*SUKS,_s:1};if((f.ci==4||f.ci==5)&&!d._b){d={...d,dmg:d.dmg>=25?d.dmg*.8:d.dmg>=9?d.dmg*.7:d.dmg,_b:1}}/* Sanji/Yuji balance: heavy hits trimmed */const dr=d.dir||f.f,fa=(f.x>o.x?1:-1)==o.f;
 if(o.fz){o.def=Math.min(Math.round(30*DIOS),(o.def||0)+d.dmg);spark(o.x,o.y-12,'#fff',3);blood(o.x,o.y-14,3);sfx('h');return 1}
 if(o.ci==5&&!o.sk&&o.act&&o.act.id==3&&o.act.cw&&yjCounter(o,f,d))return 0;
 if(o.inv>0)return 0;
 if(o.bl&&fa&&!d.brk&&!d.grab){o.bh--;o.gs=6;o.vx=dr*1.2;spark(o.x+o.f*6,o.y-12,'#9cf');sfx('b');if(net=='host')ev.push([Math.round(o.x),Math.round(o.y),2,0]);ugain(o,3);
  if(o.bh<=0){o.bh=3;o.bl=false;o.stun=50;tx.push({x:o.x,y:o.y-30,s:'GUARD BREAK',l:50})}return 0}
 if(o.bl&&d.brk){o.bh=3;tx.push({x:o.x,y:o.y-30,s:'GUARD BREAK',l:50})}
 o.bl=false;o.dash=0;o.inv=0;o.rec=0;if(d.cut){o.noarm=240;armfx(o)}o.hp=Math.max(0,o.hp-d.dmg);if(!d.ult&&!ultOn(f))ugain(f,d.dmg*2.1);ugain(o,d.dmg*1.1);
 o.stun=Math.max(o.stun,d.st||(d.heavy?44:16));o.act=null;o.vx=dr*(d.kb||(d.heavy?2:.8));
 if(d.lift)o.vy=d.lift;else if(d.heavy&&o.y>=G)o.vy=-1.2;
 o.flash=8;spark(o.x,o.y-12,d.heavy?'#ffd23f':'#fff',d.heavy?10:5);shake=Math.max(shake,d.heavy?5:2);if(d.lift||(d.heavy&&(d.kb||2)>=2))o.kd=1;if(!d.nohs)hs=Math.max(hs,Math.round((d.heavy?HSC.heavy+(d.dmg>=8?HSC.big:0):HSC.light)*HSC.scale));sl.push({x:o.x,y:o.y-14,l:9,l0:9,h:d.heavy?1:0,d:dr,a:Math.random()});sfx(d.heavy?'H':'h');if(d.heavy){ring(o.x,o.y-14,2,f.ci==0?'#fff':f.ci==3?(f.g5?'#8ef':'#f66'):'#ffd23f',{l:9,dr:2.2});fl_=Math.max(fl_,d.dmg>=8?4:2)}if(d.c=='#fb4'){ring(o.x,o.y-14,3,'#fd6',{l:10,dr:2.6});ring(o.x,o.y-14,1,'#fff',{l:7,dr:1.8});burst(o.x,o.y-14,['#fff','#fd6','#f93'],16,2.8,.5);fl_=Math.max(fl_,3)}if(d.zol){for(let i=0;i<3;i++)ring(o.x,o.y-14,3+i*3,i?'#c9f':'#fff',{l:14+i*3,dr:3.4});burst(o.x,o.y-14,['#fff','#c9f','#a5f'],28,4.4,1);fl_=7;shake=Math.max(shake,18);hs=Math.max(hs,10)}if(net=='host')ev.push([Math.round(o.x),Math.round(o.y),d.heavy?1:0,Math.round(d.dmg)]);
 tx.push({x:o.x,y:o.y-26,s:''+Math.round(d.dmg),l:30});if(d.blood)blood(o.x,o.y-14,d.heavy?14:6);else if(d.heavy)blood(o.x,o.y-14,4);if(d.wall)o.wl=1;if(d.th){o.vy=9;o.slam=1;f.x=o.x;f.y=Math.min(f.y,G-2);f.vy=9;GF.push({k:'c',x:o.x,t:0,own:f,d:{dmg:5,heavy:1,st:70}})}if(f.ci==4||d.fire!=null)sjBurn(f,o,d);if(d.elec){o.shk=Math.max(o.shk||0,d.elec);zapFx(o)}if(d.expl)yjBoom(o,d);if(d.bf)yjBF(f,o);if(d.dis)yjCutFx(o.x,o.y-14,d.heavy?[-.8,.8]:[(Math.random()-.5)*2.2],d.heavy?34:24,10);return 1}
function proj(f,d,tx_,ty_){const y=f.y-14,a=Math.atan2((ty_==null?f.in.ay:ty_)-y,(tx_==null?f.in.ax:tx_)-f.x);PJ.push({x:f.x+f.f*8,y,vx:Math.cos(a)*d.sp,vy:Math.sin(a)*d.sp,own:f,d,l:240})}
function shock(x,y){RG.push({x,y:G,r:2,l:16});CK.push({x,l:220});for(let i=0;i<16;i++)fx.push({x:x+(Math.random()-.5)*8,y:G,vx:(Math.random()-.5)*5,vy:-Math.random()*3.5,l:30+(Math.random()*20|0),c:['#6a5a7a','#8a7a9a','#4a3a5a'][i%3],w:2+i%2,h:2});if(net=='host')ev.push([Math.round(x),Math.round(y),3,0])}
function armfx(o){fl_=5;shake=Math.max(shake,8);hs=Math.max(hs,8);ring(o.x,o.y-14,2,'#9ef',{l:12,dr:3.2});trl({x:o.x,y:o.y-14,a:-.7,len:46,l:20,l0:20,w:3,c:'#fff'});trl({x:o.x,y:o.y-14,a:.8,len:30,l:15,l0:15,w:2,c:'#9ef'});burst(o.x,o.y-14,['#fff','#9ef','#8cf'],14,3.4,.5);spark(o.x,o.y-14,'#9ef',8);for(let i=0;i<2;i++)fx.push({x:o.x,y:o.y-16,vx:(i?1.6:-1.2)*(1+Math.random()),vy:-2.4-Math.random(),l:100,c:'#f2c9a0',w:7,h:3});tx.push({x:o.x,y:o.y-40,s:'ARMS CUT',l:60})}
function beam(f,o,ang,d){const x=f.x+f.f*8,y=f.y-22,dx=o.x-x,dy=o.y-14-y,c=Math.cos(ang),s=Math.sin(ang);GF.push({k:'l',x,y,ang,t:0,own:f});return dx*c+dy*s>0&&Math.abs(-dx*s+dy*c)<12?hit(f,o,d):0}
function drawGF(){X.save();X.beginPath();X.rect(-40,-40,W+80,G+42);X.clip();const R=(x,y,w,h,c)=>{X.fillStyle=c;X.fillRect(Math.round(x),Math.round(y),w,h)};
 for(const q of GF){if(q.k=='l'){X.save();X.translate(q.x,q.y);X.rotate(q.ang);X.globalAlpha=(8-q.t)/8;for(const oy of[-2,2]){X.fillStyle='#f33';X.fillRect(0,oy-1.5,420,3);X.fillStyle='#fff';X.fillRect(0,oy-.5,420,1)}X.restore();continue}
  if(q.k=='c'){const x=q.x,t=q.t;R(x-16,6,32,10,t<16?'#8a90a8':'#e6e9f4');R(x-10,2,20,8,t<16?'#a0a6bc':'#fff');if(t>=16&&t<26){g5bolt(x,14,x,G,t%2?5:4,t);g5bolt(x-8,14,x-2,G,2,t+3);g5bolt(x+8,14,x+2,G,2,t+6);if(t<20){X.fillStyle='rgba(255,255,255,.18)';X.fillRect(0,0,W,H)}}continue}
  if(q.s){X.save();X.translate(q.x,G);X.scale(q.s,q.s);X.translate(-q.x,-G)}const x=q.x,t=q.t,u=q.k=='u',w=u?15:12;if(t<16){X.fillStyle=t%6<3?'rgba(255,80,80,.7)':'rgba(255,200,80,.5)';X.fillRect(x-14,G-2,28,2)}
  const y=u?(t<16?G+50-98*Math.min(1,t/12):t<24?G-48:G-48+(t-24)*8):(t<16?-60+(G+56)*Math.pow(t/16,2):G-4+Math.max(0,t-22)*3);
  if(u){R(x-w+3,y+28,w*2-6,80,'#5a5a6e');R(x-w,y,w*2,30,'#7a7a8e');R(x-w,y,w*2,3,'#a8a8bc');for(let i=0;i<3;i++)R(x-w+1+i*9,y-4,7,6,'#8a8a9e');R(x-3,y+10,6,3,'#9ef');R(x-1,y+14,1,10,'#444')}
  else{R(x-9,y-95,18,68,'#5a5a6e');R(x-w,y-28,w*2,28,'#7a7a8e');R(x-w,y-28,w*2,3,'#a8a8bc');for(let i=0;i<3;i++)R(x-w+1+i*8,y-6,6,6,'#5a5a6e');R(x-3,y-18,6,3,'#9ef');R(x+2,y-12,1,10,'#444')}if(q.s)X.restore()}X.restore()}
function m1(f,o){if(f.ci==4)return m1S(f,o);if(f.ci==5)return m1Y(f,o);if(f.ci==6)return m1V(f,o);const n=f.combo,last=n==3,w=f.in.w,s=f.in.s,ci=f.ci,k=last?(w?'u':s?'d':'b'):'n',sp=last&&(ci==1||ci>=2&&(w||s));
 f.act={t:0,dur:last?(sp?24:17):12,id:0,n,k,run:(f,o,a)=>{if(a.t<5)f.vx=f.f*.55;if(ci==1&&a.t==5&&k=='n')sfx('f');const t=a.t,sd=f.sd;
  if(k=='n'||k=='b'){if(t==6){const ok=inF(f,o,ci==1?28:ci==3?(last?38:28):sd?30:last?24:19),bl=(ci==2&&!sd)?1:0;let r=0;
    if(ci==1&&last){proj(f,{dmg:5,r:4,sp:6.5,st:36,c:'#c9f',heavy:1,kb:4,mb:1});sfx('s');r=1}
    else if(ok){r=hit(f,o,last?{dmg:5,heavy:1,kb:4,st:36,blood:bl}:{dmg:4,kb:.6,st:14,blood:bl});if(ci==1&&r){sfx('q');spark(o.x-f.f*6,o.y-16,'#fc6',4)}}
    if(!r){a.dur+=last?8:5;if(!ok)f.combo=0}}}
  else if(ci==3){if(k=='d'){if(t==6){if(inF(f,o,30)&&hit(f,o,{dmg:6,heavy:1,kb:.3,st:70})){o.vy=7;o.slam=1}else a.dur+=8}}
   else{if(t==4){if(inF(f,o,26)&&hit(f,o,{dmg:2,heavy:1,grab:1,kb:.01,st:60}))a.g=1;else a.dur=12}
    if(a.g){if(t<18){o.stun=Math.max(o.stun,20);o.vx=o.vy=0;const an=t*.6;o.x=clamp(f.x+f.f*Math.cos(an)*14,8,W-8);o.y=f.y-8-Math.sin(an)*8}if(t==18)hit(f,o,{dmg:4,heavy:1,lift:-6,kb:2,st:90})}}}
  else if(ci==0){if(t==6){const ok=inF(f,o,24),air=o.y<G-4;let r=0;if(ok){if(k=='u'){if(r=hit(f,o,{dmg:5,heavy:1,lift:-4.2,st:80,kb:.3}))f.vy=-2.2}else if(r=hit(f,o,{dmg:air?5:3,heavy:1,kb:.5,st:30})){o.vy=6;o.slam=1;o.stun=90}}if(!r){a.dur+=8;f.combo=0}}}
  else if(ci==1){if(t==6){GF.push({k:k=='u'?'u':'d',x:clamp(o.x,12,W-12),t:0,own:f});sfx('H')}}
  else if(sd){if(k=='d'){if(t==4){f.hide=1;spark(f.x,f.y-14,'#fe6',8)}if(t==9){f.hide=0;f.x=clamp(o.x,8,W-8);f.y=Math.min(o.y,G)-46;f.vy=0;f.vx=0;spark(f.x,f.y,'#fe6',12);sfx('s')}if(t==13&&Math.abs(o.x-f.x)<22&&hit(f,o,{dmg:5,heavy:1,kb:.3,st:60,blood:1})){o.vy=7;o.slam=1}}
   else{if(t==3){f.hide=1;dust(f.x)}if(t==8){f.hide=0;f.x=clamp(o.x-f.f*8,8,W-8);f.y=G;f.vy=0;f.vx=0;shock(f.x,G)}if(t==9&&Math.abs(o.x-f.x)<24&&hit(f,o,{dmg:5,heavy:1,lift:-4.2,st:80,kb:.3,blood:1}))f.vy=-2.2}}
  else if(k=='d'){if(t==6){if(inF(f,o,24)&&hit(f,o,{dmg:3,heavy:1,grab:1,kb:.01,st:50,blood:1}))a.g=1;else a.dur=14}
   if(a.g){if(t<14){o.stun=Math.max(o.stun,20);o.vx=o.vy=0;o.x=f.x+f.f*10;o.y=f.y}if(t==14){hit(f,o,{dmg:5,heavy:1,grab:1,kb:.01,st:90,blood:1});o.vy=10;o.slam=1;o.kd=1}}}
  else if(t==6){if(!beam(f,o,f.aim,{dmg:5,heavy:1,lift:-3,kb:.5,st:60,blood:1,brk:1}))a.dur+=6;sfx('s')}
 }};
 f.combo=(n+1)%4;f.ct=55;return 1}
function m1_old(f,o){const n=f.combo,last=n==3,w=f.in.w,s=f.in.s;
 f.act={t:0,dur:last?24:18,id:0,n,run:(f,o,a)=>{if(a.t<7)f.vx=f.f*.55;
  if(a.t==9){const ok=inF(f,o,last?24:19),air=o.y<G-4;let r=0;
   if(ok){if(!last)r=hit(f,o,{dmg:4,kb:.6,st:16});
    else if(w){if(r=hit(f,o,{dmg:5,heavy:1,lift:-4.2,st:80,kb:.3}))f.vy=-2.2}
    else if(s){if((r=hit(f,o,{dmg:5,heavy:1,kb:.5,st:30}))&&air){o.vy=6;o.slam=1;o.stun=90}}
    else r=hit(f,o,{dmg:5,heavy:1,kb:4,st:36})}
   if(!r){a.dur+=last?8:5;if(!ok)f.combo=0}}}};
 f.combo=(n+1)%4;f.ct=55;return 1}
function sk(f,o,k){if(f.cd[k]>0)return 0;if(f.ci==6&&k==1&&!vgCan(f))return 0;const S=SK[f.ci][k];f.cd[k]=typeof S.cd=='function'?S.cd(f):S.cd;f.act={t:0,dur:typeof S.dur=='function'?S.dur(f):S.dur,run:S.run,id:k+1};if(f.ci==6)vgOnSk(f,k);sfx('s');if(f.ci!=1)wind(f.x,f.y,f.f,['#fff','#9ef','#fe6',f.g5?'#8ef':'#f66','#fa4','#f88','#6cf'][f.ci]);return 1}
function blood(x,y,n=10){for(let i=0;i<n;i++)fx.push({x,y,vx:(Math.random()-.5)*4,vy:-Math.random()*3.5,l:30+(Math.random()*30|0),c:['#a00','#c11','#700'][i%3],w:1+i%2,h:1+(i%3?1:0),bd:1})}
function dust(x,s){for(let i=0;i<(s?2:5);i++)fx.push({x:x+(Math.random()-.5)*8,y:G,vx:(Math.random()-.5)*1.6,vy:-Math.random()*1.2,l:14+(Math.random()*8|0),c:'#9a8aaa',w:2,h:2})}
function ultimate(f,o){const u0=f.ult;f.ult=0;sfx('u');if(f.ci==6)return vgUlt(f,o);if(f.ci==5)return yjUlt(f,o);if(f.ci==4)return sjUlt(f,o);if(f.ci==3){f.ult=u0;return luffyUlt(f,o)}if(f.ci==2)return dioUlt(f,o);
 if(f.ci==0){f.f=o.x>f.x?1:-1;f.x=clamp(o.x-f.f*16,8,W-8);f.y=o.y;o.f=-f.f;o.stun=400;o.act=null;o.bl=false;f.act=null;f.vx=f.vy=0;o.vx=o.vy=0;cut={t:0,dur:190,a:f,o}}
 else f.act={t:0,dur:120,ult:1,id:9,run:(f,o,a)=>{f.vx=0;
  if(a.t<44&&a.t%2==0){const qx=f.x+f.f*12,qy=f.y-18,px=qx+(Math.random()-.5)*60,py=qy+(Math.random()-.5)*50;fx.push({x:px,y:py,vx:(qx-px)/14,vy:(qy-py)/14-.1,l:14,c:'#c9f'})}
  if(a.t==20||a.t==32)ring(f.x+f.f*17,f.y-45,18,'#c9f',{l:12,dr:-1.5});if(a.t==44){BM.push({own:f,t:0,dur:56,ang:f.aim});shake=14;sfx('H');fl_=6;ring(f.x+f.f*10,f.y-18,3,'#fff',{l:14,dr:3.5});burst(f.x+f.f*10,f.y-18,['#fff','#c9f','#a5f'],22,4,0)}
  if(a.t>44&&a.t<100){f.vx=-f.f*.12;shake=Math.max(shake,3)}}}}
function upd(f,o){const i=f.in;f.t++;sjTick(f);if(f.ci==5)yjTick(f,o);if(f.ci==6)vgTick(f,o);f.sq=Math.max(0,(f.sq||0)-1);f.gu=Math.max(0,(f.gu||0)-1);f.gs=Math.max(0,(f.gs||0)-1);f.inv=Math.max(0,f.inv-1);if(f.g5){f.ult-=.11;if(f.ult<=0){f.ult=0;f.g5=0}}f.noarm=Math.max(0,f.noarm-1);if(!f.act&&f.hide)f.hide=0;f.aim=Math.atan2((i.ay==null?f.y-14:i.ay)-(f.y-16),(i.ax==null?f.x+f.f*50:i.ax)-f.x);f.cd=f.cd.map(v=>Math.max(0,v-1));f.flash=Math.max(0,f.flash-1);f.dcd=Math.max(0,f.dcd-1);f.bh=Math.min(3,f.bh+.004);
 if(f.ct>0&&!f.act&&--f.ct==0)f.combo=0;
 if(f.act&&f.dash>0){f.dash=0;f.inv=0}
 if(f.dash>0&&f.stun<=0){const D=DS[f.ci];f.vx=f.dd*f.dv*D.c(1-f.dash/f.dn);if(f.y<G-1)f.vy*=D.fl}
 {let g=GR;if(f.stun<=0){const jp=JP[f.ci];g*=jp.g;if(jp.gl&&f.vy>0&&i.jump&&f.y<G-2&&!f.act)g*=jp.gl}f.vy+=g}
 f.x+=f.vx;f.y+=f.vy;
 if(f.y>=G){if(f.vy>2.5&&f.stun>0)dust(f.x);f.y=G;let bv=0;if(f.slam){f.slam=0;f.kd=1;sfx('H');f.hp=Math.max(0,f.hp-6);f.stun=Math.max(f.stun,70);shake=14;hs=Math.max(hs,5);shock(f.x,G);bv=-2}else if(f.stun>0&&f.vy>3){spark(f.x,G,'#aaa',7);sfx('h');shake=Math.max(shake,3);bv=-f.vy*.25}else if(JP[f.ci].bn&&f.vy>3.2&&f.stun<=0&&!f.act)bv=-.75;f.vy=bv;f.vx*=.8}else f.vx*=.985;
 if((f.x<8||f.x>W-8)&&f.stun>0&&Math.abs(f.vx)>1.5){f.vx*=-.45;if(f.wl){f.wl=0;f.stun+=70;tx.push({x:f.x,y:f.y-30,s:'WALL STUN',l:40});shake=Math.max(shake,9)}spark(f.x,f.y-12,'#ccc',4);shake=Math.max(shake,3)}f.x=clamp(f.x,8,W-8);
 if(f.stun>0){if(--f.stun==0){if(f.kd)f.gu=14;f.kd=0;f.wl=0}f.bl=false;return}
 const air=f.y<G&&!f.pv,dir=(i.r?1:0)-(i.l?1:0);if(f.dash>0&&--f.dash==0)f.rec=DS[f.ci].rec;
 if(!f.act){f.f=i.ax>f.x?1:-1;f.bl=!!i.block&&!air&&f.noarm<=0;
  if(f.rec>0){f.rec--;f.bl=false;if(air)f.vx*=.85}
  else if(!f.bl){
   if(i.dash&&dir&&!f.dcd){const D=DS[f.ci];f.dash=f.dn=D.dur;f.dd=dir;f.dv=D.v*(air?1.8:1);f.inv=D.inv;f.dcd=D.cd;f.vx=dir*f.dv*D.c(0);if(f.human)E.dash=0}
   else if(!f.dash){if(!air){f.vx=dir*1.3;if(dir&&f.t%9==0)dust(f.x,1)}else f.vx+=(dir*1.3-f.vx)*.15}
   if(i.jump&&!air)f.vy=JP[f.ci].v;
   if(f.noarm>0){}else if(i.m1&&m1(f,o)&&f.human)E.m1=0;
   else for(let k=0;k<3;k++)if(i['s'+k]&&sk(f,o,k)){if(f.human)E['s'+k]=0;break}
   if(i.ult&&(f.ult>=100||f.g5&&f.ult>0||f.sk&&(f.om||0)>=100)&&f.noarm<=0){if(f.human)E.ult=0;ultimate(f,o)}
  }else{f.vx*=.5;f.dash=0;f.inv=0}
 }else{f.bl=false;const a=f.act;a.t++;a.run(f,o,a);if(a.t>=a.dur&&f.act==a)f.act=null}}
function ai(f,o){const i={},d=o.x-f.x,ad=Math.abs(d);i.ax=o.x;i.ay=o.y-12;if(f.ci==6&&f.jc&&!f.jc.dead&&f.jc.t>=17&&f.jc.t<=40&&Math.random()<.12){i.s1=1;return i}f.ait=(f.ait||0)-1;f.abl=(f.abl||0)-1;
 if(o.act&&ad<40&&f.abl<-30&&Math.random()<(aiD==3?.14:aiMode?.06:.1))f.abl=aiMode?20:30;
 if(f.abl>0){i.block=1;return i}
 const A=aiMode,want=A?(f.ci==1||f.sk?70:18):(f.ci==1||f.sk?100:40);
 if(ad>want+12){d>0?i.r=1:i.l=1}else if((f.ci==1||f.sk||!A)&&ad<want-(A?30:15)){d>0?i.l=1:i.r=1}
 if(f.ait<=0){f.ait=aiD==3?4+(Math.random()*10|0):aiMode?8+(Math.random()*20|0):45+(Math.random()*60|0);const r=Math.random();
  if((f.ult>=100||f.g5&&f.ult<60||f.sk&&(f.om||0)>=100)&&r<.5)i.ult=1;
  else if(ad<(A?26:30)){if(r<.6){i.m1=1;i.w=Math.random()<.3;i.s=!i.w&&Math.random()<.3}else i['s'+(Math.random()*3|0)]=1}
  else if(f.ci==1&&ad<130)i['s'+(Math.random()*2|0)]=1;
  else if(f.sk&&ad<170){if(r<.55)i.m1=1;else i['s'+(Math.random()*3|0)]=1}
  else if(f.ci>=2&&ad<120&&Math.random()<.5)i['s'+(Math.random()*(f.ci>=3?3:2)|0)]=1;
  else if(Math.random()<.2)i.jump=1}
 return i}
function start(a=sel,b=(sel+1+(Math.random()*6|0))%7,me=0){P=mk(a,70,1,me===0);O=mk(b,250,-1,me===1);ME=me?O:P;VR=[];TR=[];fl_=0;hs=0;sl=[];ev=[];fx=[];tx=[];PJ=[];PL=[];cut=null;BM=[];RG=[];CK=[];BS=[];GF=[];AF=[];gc=null;ts=null;rr=null;wk={l:0};DM=null;KM=null;YB=[];YC=[];YW=[];YF=[];ko=0;FIN=null;state='fight'}
/* ===== VFX v4 : halkalar, kesik izleri, bolt/blade/beam çizimleri ===== */
const VE=[];
function ring(x,y,r,c,o={}){if(net=='host'&&!LOC)VE.push(['r',x,y,r,c,o]);VR.push({x,y,r,c,l:o.l||14,l0:o.l||14,dr:o.dr==null?2.4:o.dr,e:o.e||0})}
function burst(x,y,cs,n,sp,up){if(net=='host'&&!LOC)VE.push(['b',x,y,cs,n,sp,up]);for(let i=0;i<n;i++){const a=6.283*i/n+Math.random()*.5,v=sp*(.45+Math.random()*.8);fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(up||0),l:14+(Math.random()*12|0),c:cs[i%cs.length],w:2,h:i%3?2:1})}}
function trl(o){TR.push(o);if(net=='host'&&!LOC)VE.push(['t',o])}
function wind(x,y,fd,cs){if(net=='host')VE.push(['w',x,y,fd,cs]);VR.push({x:x+fd*8,y:y-16,r:12,c:cs,l:8,l0:8,dr:-1.4,e:0});for(let i=0;i<5;i++)fx.push({x:x-fd*(4+i*3),y:y-8-i*3,vx:-fd*1.2,vy:0,l:8,c:cs,w:3,h:1})}
function debris(x){if(net=='host'&&!LOC)VE.push(['d',x]);for(let i=0;i<12;i++)fx.push({x:x+(Math.random()-.5)*10,y:G-2,vx:(Math.random()-.5)*4.4,vy:-2-Math.random()*3.4,l:36,c:['#6a4a2a','#8a6a3a','#3a2a1a','#fc4'][i%4],w:2+i%2,h:2})}
function veApply(e){const[k,...a]=e;if(k=='r')ring(a[0],a[1],a[2],a[3],a[4]);else if(k=='b')burst(...a);else if(k=='t')TR.push(a[0]);else if(k=='w')wind(...a);else if(k=='d')debris(a[0]);else if(k=='L')YB.push(a[0]);else if(k=='K')YC.push(a[0]);else if(k=='W')YW.push(a[0]);else if(k=='F')YF.push(a[0])}
function mcircle(x,y,r,t,c1,c2){for(let k=0;k<28;k++){const g=k*.2244+t*.12;X.fillStyle=k%4?c1:c2;X.fillRect(Math.round(x+Math.cos(g)*r),Math.round(y+Math.sin(g)*r*.22),2,1)}for(let k=0;k<10;k++){const g=k*.628-t*.2;X.fillStyle=k%2?c2:c1;X.fillRect(Math.round(x+Math.cos(g)*r*.6),Math.round(y+Math.sin(g)*r*.6*.22),2,1)}for(let k=0;k<5;k++){const g=k*2.513+t*.08;X.fillStyle=c2;X.fillRect(Math.round(x+Math.cos(g)*r*.85),Math.round(y+Math.sin(g)*r*.85*.22)-1,1,3)}}
function boltDraw(p){const a=Math.atan2(p.vy||0,p.vx),px=Math.round(p.x),py=Math.round(p.y+Math.sin(frame*.35)*1.5);X.save();X.translate(px,py);X.rotate(a);X.fillStyle='rgba(255,150,40,.28)';X.fillRect(-18,-3,18,6);X.fillRect(-7,-7,14,14);X.fillStyle='#f83';X.fillRect(-12,-2,10,4);X.fillStyle='#fd6';X.fillRect(-5,-4,10,8);X.fillStyle='#fff';X.fillRect(-2,-2,6,4);X.restore();
 for(let k=0;k<4;k++){const g=k*1.57+frame*.35;X.fillStyle=k%2?'#fff':'#fc4';X.fillRect(Math.round(px+Math.cos(g)*6)-1,Math.round(py+Math.sin(g)*6)-1,2,2)}}
function bladeDraw(p){const a=Math.atan2(p.vy||0,p.vx);X.save();X.translate(Math.round(p.x),Math.round(p.y));X.rotate(a);X.fillStyle='rgba(120,230,255,.3)';X.fillRect(-26,-3,26,6);X.fillRect(-14,-7,14,14);
 for(let k=-9;k<=9;k++){const x=Math.round(6-k*k*.12),y=k*1.3|0,t=Math.abs(k)<5?3:Math.abs(k)<8?2:1;X.fillStyle='#8cf';X.fillRect(x-t,y,t+1,2);X.fillStyle='#fff';X.fillRect(x,y,1,2)}
 X.fillStyle=(frame>>1)%2?'#fff':'#bff';X.fillRect(8,-1,2,2);X.restore()}
function drawVF(){
 for(const t of TR){const u=t.l/t.l0,c=Math.cos(t.a),s=Math.sin(t.a),n=Math.round(t.len*(u>.5?1:u*2));X.fillStyle=u>.5?t.c:'#8cf';for(let k=-n/2;k<n/2;k++){const w=Math.max(1,Math.round(t.w*Math.sin(3.1416*(k+n/2)/n)*(u>.4?1:.5)));X.fillRect(Math.round(t.x+c*k),Math.round(t.y+s*k),w,1)}}
 for(const r of VR){if(r.r<=0)continue;const u=r.l/r.l0,n=Math.max(10,Math.round(r.r*1.6)),fy=r.e?.28:1,z=u>.4?2:1;X.fillStyle=r.c;for(let k=0;k<n;k++){const g=k/n*6.283;X.fillRect(Math.round(r.x+Math.cos(g)*r.r),Math.round(r.y+Math.sin(g)*r.r*fy),z,z)}}
 for(const f of[P,O]){const a=f&&f.act;if(!a||a.id!=9||f.ci!=1||a.t>=44)continue;const ox=Math.round(f.x+f.f*17.5),oy=Math.round(f.y-45),r=Math.round(1+a.t/44*8),q=a.t/44;
  mcircle(f.x,G-1,10+a.t*.4,a.t,'#a5f','#fff');
  X.fillStyle='rgba(190,120,255,.3)';X.fillRect(ox-r-3,oy-r-3,r*2+6,r*2+6);X.fillStyle='#b6f';X.fillRect(ox-r,oy-r,r*2,r*2);X.fillStyle='#e6d0ff';X.fillRect(ox-(r>>1)-1,oy-(r>>1)-1,r+2,r+2);X.fillStyle='#fff';X.fillRect(ox-1,oy-1,3,3);
  for(let k=0;k<4;k++){const g=k*1.57+a.t*.25,l=r+3+Math.sin(a.t*.5+k)*2;X.fillRect(Math.round(ox+Math.cos(g)*l),Math.round(oy+Math.sin(g)*l),2,2)}
  if(a.t>=22){const ag=f.aim||0,bx=f.x+f.f*10,by=f.y-18;X.fillStyle=(frame>>2)%2?'#fff':'#c9f';for(let k=1;k<34;k++)if(k%2==0)X.fillRect(Math.round(bx+Math.cos(ag)*k*8),Math.round(by+Math.sin(ag)*k*8),2,2)}}}
function drawBeams(){for(const b of BM){const g=Math.min(1,b.t/5)*Math.min(1,(b.dur-b.t)/8);if(g<=0)continue;const w=Math.round((13+Math.sin(frame*1.7)*2)*g);X.save();X.translate(Math.round(b.x),Math.round(b.y));X.rotate(b.ang);
 X.fillStyle='rgba(120,40,255,.22)';X.fillRect(0,-w*2,420,w*4);X.fillStyle='rgba(160,70,255,.35)';X.fillRect(0,-Math.round(w*1.5),420,w*3);
 for(let x=0;x<420;x+=6){const j=Math.round(Math.sin(x*.15-frame*1.3)*w*.14);X.fillStyle='#a5f';X.fillRect(x,-w+j,6,w*2-2*j)}
 X.fillStyle='#e6d0ff';X.fillRect(0,-Math.round(w*.6),420,Math.round(w*1.2));X.fillStyle='#fff';X.fillRect(0,-Math.round(w*.25),420,Math.round(w*.5));
 for(let i=0;i<26;i++){const x=(i*17+frame*24)%420,y=Math.round(Math.sin(x*.07-frame*.5+i)*w*1.1);X.fillStyle=i%3?'#fff':'#c9f';X.fillRect(x,y,i%2?3:2,2)}
 X.fillStyle='rgba(255,255,255,.5)';for(let k=0;k<3;k++)X.fillRect((frame*13+k*140)%420,-Math.round(w*1.4),2,Math.round(w*2.8));
 X.fillStyle='#fff';for(let k=0;k<8;k++){const an=k*.785+frame*.2,l=(k%2?10:18)*g;X.fillRect(Math.round(Math.cos(an)*l),Math.round(Math.sin(an)*l),3,3)}X.fillRect(-4,-Math.round(w*1.2),10,Math.round(w*2.4));X.restore()}}
function distort(){const bm=BM.find(b=>b.t>4&&b.t<b.dur-6);if(bm){const a=Math.min(1,(bm.t-4)/6)*Math.min(1,(bm.dur-6-bm.t)/8);X.save();X.setTransform(1,0,0,1,0,0);const K=SC/2;for(let y=0;y<C.height;y+=6*K){const o=Math.round(Math.sin(y/K*.45+frame*.9)*2.2*a*K);if(o)X.drawImage(C,0,y,C.width,6*K,o,y,C.width,6*K)}X.restore()}
 if(fl_>0){X.fillStyle='rgba(255,255,255,'+Math.min(.34,fl_*.06)+')';X.fillRect(0,0,W,H)}}
function fxs(){for(const p of fx){p.x+=p.vx;p.y+=p.vy;p.vy+=p.gv==null?.1:p.gv;if(p.y>G+3&&p.vy>0){if(p.bd){if(BS.length<90)BS.push({x:Math.round(p.x),w:1+(Math.random()*3|0),o:Math.random()*4|0});p.l=0}p.y=G+3;p.vy*=-.3;p.vx*=.6}p.l--}fx=fx.filter(p=>p.l>0);for(const q of AF)q.l--;AF=AF.filter(q=>q.l>0);for(const t of tx){t.y-=.4;t.l--}tx=tx.filter(t=>t.l>0);for(const q of sl)q.l--;sl=sl.filter(q=>q.l>0);for(const r of RG){r.r+=2.6;r.l--}RG=RG.filter(r=>r.l>0);for(const k of CK)k.l--;CK=CK.filter(k=>k.l>0);wk.l--;for(const r of VR){r.r+=r.dr;r.l--}VR=VR.filter(r=>r.l>0);for(const t of TR)t.l--;TR=TR.filter(t=>t.l>0);if(fl_>0)fl_--;
 for(const q of PL){if(q.t>=4&&q.t<36&&q.t%2==0)fx.push({x:q.x+(Math.random()-.5)*(14+q.t*.6),y:G-1,vx:(Math.random()-.5)*.3,vy:-.8-Math.random()*1.8,l:20,c:q.t%6?'#fc6':'#fff',w:1,h:2});if(q.t>=36&&q.t<56&&q.t%2==0)fx.push({x:q.x+(Math.random()-.5)*26,y:G-Math.random()*40,vx:(Math.random()-.5)*.6,vy:-1.4-Math.random()*2.2,gv:-.02,l:26,c:['#fff','#fd6','#f93','#f52'][q.t%4],w:2,h:2})}
 for(const f of[P,O]){if(!f)continue;const a=f.act;LOC=1;try{moveFx(f)}finally{LOC=0}
  if(a&&f.ci==1&&a.id==1&&a.t<10&&a.t%2==0){const an=f.aim||0,ox=f.x+Math.cos(an)*22,oy=f.y-14+Math.sin(an)*22,px=ox+(Math.random()-.5)*34,py=oy+(Math.random()-.5)*26;fx.push({x:px,y:py,vx:(ox-px)/9,vy:(oy-py)/9-.1,l:9,c:a.t%4?'#fd6':'#fff',w:2,h:2})}
  if(net=='guest'&&a&&f.ci==1&&a.id==9&&a.t<44&&a.t%2==0){const qx=f.x+f.f*12,qy=f.y-18,px=qx+(Math.random()-.5)*60,py=qy+(Math.random()-.5)*50;fx.push({x:px,y:py,vx:(qx-px)/14,vy:(qy-py)/14-.1,l:14,c:'#c9f'})}
  if(f.wa&&!a&&f.stun<=0&&f.y>=G-1)dust(f.x,1);f.wa=!!a}
 for(const p of PJ){if(p.d.bl)TR.push({x:p.x,y:p.y,a:Math.atan2(p.vy||0,p.vx)+1.57,len:20,l:22,l0:22,w:2,c:'#bff'});else if(p.d.c=='#fb4'&&frame%2==0)fx.push({x:p.x-p.vx*.6,y:p.y+(Math.random()-.5)*4,vx:-p.vx*.08,vy:(Math.random()-.5)*.5,l:12,c:['#fff','#fd6','#f93','#f62'][frame%4],w:2,h:2})}}
const AFP=[];
let afi=0;
function addAF(col,ox,oy){const c=AFP[afi]||(AFP[afi]=(()=>{const k=document.createElement('canvas');k.width=100*SC;k.height=68*SC;return k})());afi=(afi+1)%48;
 const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='copy';g.drawImage(OB,70*SC,40*SC,100*SC,68*SC,0,0,100*SC,68*SC);
 g.globalCompositeOperation='source-atop';g.globalAlpha=.8;g.fillStyle=col;g.fillRect(0,0,100*SC,68*SC);g.globalAlpha=1;g.globalCompositeOperation='source-over';
 AF.push({c,x:ox+70,y:oy+40,l:10,l0:10})}
/* runs on host AND guest (derived only from synced state: x,y,vx,dash,stun,act) so online players see the same effects */
function moveFx(f){if(f.hide)return;
 const ci=f.ci,D=DS[ci],sp=f.sp||(f.sp=[0,0,0,0]),air=f.y<G-.5,d0=f.py==null?0:f.y-f.py,dy=Math.abs(d0)>14?0:d0,dsh=f.dash||0,pd=f.pd||0,pg=f.py==null||f.py>=G-.5,st=f.stun>0,
  dr=f.vx>.2?1:f.vx<-.2?-1:f.f,r=Math.random,lu=ci==3,g5=lu&&f.g5;
 f.py=f.y;f.pd=dsh;f.fv=Math.max(dy,(f.fv||0)*.85);
 const Kk=lu?(g5?.11:.16):.34,Dd=lu?.09:.8;
 sp[1]+=-Kk*sp[0]-Dd*sp[1];sp[0]+=sp[1];sp[3]+=-Kk*sp[2]-Dd*sp[3];sp[2]+=sp[3];
 if(dsh>0&&!st){sp[0]+=(D.sh[0]-sp[0])*.4;sp[2]+=(D.sh[1]-sp[2])*.4;sp[1]=sp[3]=0}
 sp[0]=clamp(sp[0],-.5,.7);sp[2]=clamp(sp[2],-.5,.7);
 const gy=air?f.y-2:G-1,dc=['#9a8aaa','#b8a8c8','#6a5a7a'];
 const dst=(n,sx,vs,w)=>{for(let i=0;i<n;i++)fx.push({x:f.x+sx*(1+i*1.3)+(r()-.5)*4,y:gy,vx:sx*vs*(.3+r()*.9),vy:-r()*1.4,l:18+(r()*14|0),c:dc[i%3],w,h:w>2?3:2})};
 const flat=(c,rr,l,dd)=>{if(!air)ring(f.x,G-1,rr,c,{l,dr:dd,e:1})};
 if(f.aic>0){f.aic--;f.aiq='#fe6'}
 if(dsh>pd&&!st){ /* ---- dash start ---- */
  if(ci==0){if(!air)dst(9,-dr,2.2,3);else burst(f.x,f.y-14,dc,8,1.6,0);flat('#b8a8c8',3,10,1.9);shake=Math.max(shake,2.2);f.aiq='#e03a32';sfx('d',.55)}
  else if(ci==1){ring(f.x,f.y-14,4,'#c9f',{l:10,dr:1.6});burst(f.x,f.y-14,['#fff','#c9f','#fd6'],10,1.3,.3);sfx('w',1.1)}
  else if(ci==2){trl({x:f.x-dr*6,y:f.y-14,a:dr>0?0:Math.PI,len:34,l:9,l0:9,w:3,c:'#fe6'});ring(f.x,f.y-14,3,'#fe6',{l:7,dr:2.2});burst(f.x-dr*4,f.y-14,['#fff','#fe6','#4c8'],8,2.4,0);f.aiq='#fe6';sfx('d',1.5)}
  else{ring(f.x,f.y-14,3,g5?'#8ef':'#f66',{l:8,dr:1.6});if(!air)dst(4,-dr,1.6,2);sfx('e',1.1)}}
 if(dsh>0&&!st){ /* ---- dash frames ---- */
  if(ci==0){if(dsh%2==0&&!air)fx.push({x:f.x-dr*4,y:G-1,vx:-dr*.6+(r()-.5),vy:-.5-r()*.8,l:18,c:'#9a8aaa',w:3,h:3});if(dsh%3==0)f.aiq='#e03a32'}
  else if(ci==1){for(let k=0;k<2;k++)fx.push({x:f.x-dr*(2+r()*6),y:f.y-6-r()*20,vx:-dr*.3+(r()-.5)*.4,vy:-.2-r()*.4,gv:-.004,l:22+(r()*10|0),c:['#fff','#c9f','#fd6','#e6d0ff'][r()*4|0],w:r()<.3?1:2,h:r()<.3?1:2});if(dsh%2==0)f.aiq='#c9f'}
  else if(ci==2){f.aiq=dsh%2?'#fe6':'#4c8';fx.push({x:f.x-dr*(8+r()*10),y:f.y-4-r()*22,vx:-dr*2,vy:0,gv:0,l:8,c:r()<.5?'#fe6':'#fff',w:7,h:1})}
  else{if(dsh%3==0)f.aiq=g5?'#8ef':'#f55';if(dsh%2==0)fx.push({x:f.x-dr*(6+r()*12),y:f.y-4-r()*22,vx:-dr*2.2,vy:0,gv:0,l:7,c:'#fff',w:8,h:1});if(!air&&dsh%3==0)dst(1,-dr,1,2)}}
 if(dsh==0&&pd>0&&!st){ /* ---- dash end ---- */
  if(ci==0){if(!air)dst(7,dr,1.8,3);flat('#b8a8c8',3,9,1.7)}
  else if(ci==1)burst(f.x,f.y-12,['#fff','#c9f'],6,.9,.3);
  else if(ci==2)burst(f.x,f.y-14,['#fe6','#fff'],6,1.8,0);
  else{sp[0]=.42;sp[1]=-.1;if(!air)dst(4,dr,1.4,2)}}
 if(pg&&air&&dy<-1.2&&!f.act&&!st){ /* ---- takeoff ---- */
  if(ci==0){dst(5,1,1.8,3);dst(5,-1,1.8,3);flat('#b8a8c8',3,10,1.8);sp[2]=-.18;sfx('j',.6)}
  else if(ci==1){ring(f.x,G-1,3,'#c9f',{l:12,dr:1.4,e:1});burst(f.x,G-6,['#fff','#c9f','#fd6'],8,.9,.9);sfx('w',1.4)}
  else if(ci==2){ring(f.x,G-1,3,'#fe6',{l:9,dr:2.2,e:1});burst(f.x,G-4,['#fff','#fe6'],8,2,1.2);f.aic=3;sp[2]=.25;sfx('j',1.4)}
  else{sp[2]=.45;sp[3]=0;dst(3,1,1,2);dst(3,-1,1,2);sfx('e',1.3)}}
 if(!pg&&!air&&f.fv>2.2&&!st){ /* ---- landing ---- */
  const m=clamp((f.fv-2)/2.2,.25,1);
  if(ci==0){const n=5+(9*m|0);dst(n,1,2.4*m+.6,3);dst(n,-1,2.4*m+.6,3);ring(f.x,G-1,3,'#b8a8c8',{l:10,dr:2+m,e:1});ring(f.x,G-1,1,'#fff',{l:7,dr:2.6,e:1});shake=Math.max(shake,2+4*m);sp[2]=-.4*m;sp[3]=0;sfx('l',.8);if(m>.7)debris(f.x)}
  else if(ci==1){burst(f.x,G-2,['#fff','#c9f','#fd6'],5,.8,.7);ring(f.x,G-1,2,'#c9f',{l:9,dr:1,e:1});sp[2]=-.1;sfx('l',2)}
  else if(ci==2){ring(f.x,G-1,3,'#fe6',{l:10,dr:2.6,e:1});burst(f.x,G-3,['#fff','#fe6'],6+(6*m|0),2.4,1);dst(3,1,1.6,2);dst(3,-1,1.6,2);shake=Math.max(shake,1.5+2*m);sp[2]=-.25*m;sfx('l',1.2)}
  else{sp[2]=-.5*m;sp[3]=0;dst(3,1,1.2,2);dst(3,-1,1.2,2);sfx('e',.8)}}
 if(ci==1&&air&&dy>0&&dy<1.5&&f.t%4==0)fx.push({x:f.x+(r()-.5)*8,y:f.y-r()*6,vx:0,vy:.1,gv:-.004,l:20,c:r()<.5?'#e6d0ff':'#fff',w:1,h:1})}
/* ===================== v17 : BALANCE PASS + BOXER RAGE/DEATH PUNCH + FRIEREN DOOM ===================== */
/* Per-character damage multiplier (tuned with AI-vs-AI simulation).  1 = unchanged */
const BAL=[1.12,1.0,1,.92,1.1,1,.85];
const _hit=hit;
hit=function(f,o,d){
 if(!d._bl){let m=BAL[f.ci]||1;if(f.ci==0&&f.rm>0)m*=1.3;if(f.ci==3&&f.g5&&d.dmg>=20)m*=.75;if(f.ci==5&&f.sk&&d.dmg>=8)m*=1.25;d={...d,dmg:d.dmg*m,_bl:1}}
 const r=_hit(f,o,d);
 if(r){if(f.ci==0&&!(f.rm>0))rgAdd(f,d.dmg*.8);if(o.ci==0&&!(o.rm>0))rgAdd(o,d.dmg*1.5)}
 return r};
