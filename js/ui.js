/* Pixel Brawl Arena - js/ui.js
 * UI: menus, settings screens, stage backgrounds, HUD.
 * Classic script (no modules): everything here is global. Load order: audio, input, combat, characters, net, ui, main.
 */
function T(s,x,y,c='#fff',al='left',sz=8){X.font='bold '+sz+'px monospace';X.textAlign=al;X.fillStyle='#000';X.fillText(s,x+1,y+1);X.fillStyle=c;X.fillText(s,x,y)}
function bg(){if(!mp)return bg0();if(mp==4)return bgT();
 const P6=[0,['#2a1a4a','#6a2a5a','#a8403a','#d8683a','#f0903a','#f8c04a'],['#1c120c','#2a1a10','#3a2416','#3a2416','#2a1a10','#1c120c'],['#5a7aa8','#7a9ac0','#9ab8d4','#b8d0e4','#d0e0ee','#e4eef6']][mp];
 P6.forEach((c,i)=>{X.fillStyle=c;X.fillRect(-40,i*26,W+80,26)});
 if(mp==1){X.fillStyle='#ffe08a';X.fillRect(220,70,22,22);X.fillStyle='#fff6';for(let i=0;i<20;i++)X.fillRect((i*97)%W,(i*31)%40,1,1);
  for(let l=0;l<3;l++){X.fillStyle=['#b8683a','#9a5030','#7a3c26'][l];for(let x=0;x<W+4;x+=4){const h=G-34+l*12+Math.sin(x*.025+l*2)*10;X.fillRect(x,h,4,G-h)}}
  X.fillStyle='#2a5a2a';for(const cx of[40,250]){X.fillRect(cx,G-26,4,26);X.fillRect(cx-5,G-18,5,3);X.fillRect(cx-5,G-22,2,7);X.fillRect(cx+4,G-14,5,3);X.fillRect(cx+7,G-19,2,8)}
  X.fillStyle='#d8a860';X.fillRect(-40,G,W+80,H-G+40);X.fillStyle='#c09048';for(let x=0;x<W;x+=12)X.fillRect(x,G+4+(x%5),6,1)}
 else if(mp==2){X.fillStyle='#e0d0a8';X.fillRect(0,26,W,G-26);X.fillStyle='#c8b888';for(let x=0;x<W;x+=32)X.fillRect(x,26,1,G-26);for(let y=40;y<G;y+=28)X.fillRect(0,y,W,1);
  for(let i=0;i<5;i++){const x=i*80-4;X.fillStyle='#4a2812';X.fillRect(x,18,8,G-18);X.fillStyle='#6a3c1c';X.fillRect(x,18,2,G-18);X.fillStyle='#e84a2a';X.fillRect(x+10,34,10,14);X.fillStyle='#ffd070';X.fillRect(x+12,37,6,8);X.fillStyle='rgba(255,200,80,.18)';X.fillRect(x+3,28,24,30)}
  X.fillStyle='#3a2010';X.fillRect(0,18,W,6);X.fillStyle='#6a4426';X.fillRect(-40,G,W+80,H-G+40);X.fillStyle='#4a2c14';for(let x=0;x<W;x+=20)X.fillRect(x,G,1,H-G);X.fillRect(-40,G+8,W+80,1)}
 else{const MT=[[30,80],[120,100],[220,90],[300,70]];X.fillStyle='#8aa0bc';for(const[m_,h]of MT)for(let y=0;y<h;y+=3)X.fillRect(m_-y*.45,G-h+y,y*.9,3);
  X.fillStyle='#f4f8ff';for(const[m_,h]of MT)for(let y=0;y<h*.3;y+=3)X.fillRect(m_-y*.45,G-h+y,y*.9,3);
  X.fillStyle='#e8f0fa';X.fillRect(-40,G,W+80,H-G+40);X.fillStyle='#c0d0e4';for(let x=0;x<W;x+=14)X.fillRect(x,G+3+(x%4),7,1);
  X.fillStyle='#fff';for(let i=0;i<40;i++)X.fillRect((i*53+frame*(.3+i%3*.2))%W,(i*37+frame*(.6+i%4*.3))%G,1,1)}}
function optCh(d){if(orow==0)oc=(oc+8+d)%8;else if(orow==1)mp=(mp+MAPS.length+d)%MAPS.length;else ad=(ad+4+d)%4}
function beginMatch(){aiD=ad;aiMode=ad>=2?1:0;start(sel,oc?oc-1:(sel+1+(Math.random()*6|0))%7)}
function optsDraw(){bg();T('MATCH SETUP',W/2,24,'#ffd23f','center',12);
 [['OPPONENT',oc?CH[oc-1].n:'RANDOM'],['MAP',MAPS[mp]],['AI',['OFF (dummy)','EASY','NORMAL','HARD'][ad]]].forEach((r,i)=>{const y=52+i*26;X.fillStyle=orow==i?'#ffd23f':'#333';X.fillRect(60,y,200,20);X.fillStyle='#120a22';X.fillRect(61,y+1,198,18);T(r[0],72,y+13,'#9ab','left',7);T('< '+r[1]+' >',250,y+13,'#fff','right',8)});
 T('W/S select   A/D change   Enter: FIGHT   Esc: back',W/2,150,'#fff','center',6);T('(click a row to change, click below to fight)',W/2,160,'#9ab','center',5)}
function bgT(){const cx=P&&O&&state=='fight'?(P.x+O.x)/2-160:0,R=(x,y,w,h,c)=>{X.fillStyle=c;X.fillRect(Math.round(x),Math.round(y),w,h)};
 ['#16142a','#2a2144','#44305a','#664070','#8a5078','#b07088'].forEach((c,i)=>R(-40,i*26,W+80,26,c));
 R(60-cx*.03,22,16,16,'#f4e8c8');R(64-cx*.03,26,5,5,'#d8c8a0');X.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<34;i++)X.fillRect((i*89)%W,(i*47)%64,1,1);
 for(let x=-20;x<W+20;x+=4){const h=G-62-(Math.sin((x-cx*.08)*.021)*.5+.5)*30;R(x,h,4,G-h,'#2a1f40')}
 for(let i=0;i<6;i++){const x=i*72-28-cx*.22,h=58+(i*37)%32;R(x,G-h,14,h,'#3a2c52');R(x,G-h,3,h,'#4c3a68');R(x-2,G-h,18,4,'#4c3a68');R(x-2,G-8,18,8,'#34264a');if(i%2==0)R(x+14,G-h,44,4,'#3a2c52');else R(x+2,G-h-5,6,5,'#3a2c52')}
 R(-40,G,W+80,H-G+40,'#4a3a5c');R(-40,G,W+80,2,'#6a5880');X.fillStyle='#38284a';for(let x=0;x<W;x+=24)X.fillRect(x+((x/24|0)%2)*8,G+2,1,H-G);R(-40,G+9,W+80,1,'#38284a');R(-40,G+20,W+80,1,'#38284a')}
function bgFx(){const f=frame,R=(x,y,w,h,c)=>{X.fillStyle=c;X.fillRect(Math.round(x),Math.round(y),w,h)};
 if(mp==0){[[2,'#ff3fa4'],[6,'#3fe8ff'],[11,'#ffe03f']].map(([k,c])=>[k*24,G-(30+(k*37)%50)-9,c]).forEach(([x,y,c],i)=>{const on=(f+i*23)%110<96;R(x-2,y-2,24,10,on?'rgba(255,255,255,.08)':'rgba(0,0,0,0)');R(x,y,20,6,on?c:'#2a2040');R(x+3,y+6,2,3,'#150a26');R(x+15,y+6,2,3,'#150a26');if(on)R(x+2,y+2,16,2,'rgba(255,255,255,.55)')});
  for(let i=0;i<36;i++)R((i*37+f*.6)%W,(i*53+f*4.5)%G,1,4,'rgba(170,200,255,.3)');
  R(30,G+3,50,2,'rgba(255,63,164,.14)');R(140,G+4,50,2,'rgba(63,232,255,.14)');R(250,G+3,50,2,'rgba(255,224,63,.12)')}
 else if(mp==1){for(let i=0;i<3;i++){const x=((f*.08*(i+1)+i*150)%(W+100))-50;R(x,18+i*13,46,4,'rgba(255,236,210,.35)');R(x+8,15+i*13,28,3,'rgba(255,236,210,.35)')}
  for(let i=0;i<22;i++)R((i*53+f*(1.2+i%3*.4))%W,G-4-(i%6)*7+Math.sin(f*.05+i)*2,2,1,'rgba(240,200,140,.7)');
  for(let y=G-30;y<G;y+=4)R(0,y+Math.sin(f*.06+y)*1.2,W,1,'rgba(255,220,160,.07)')}
 else if(mp==2){R(0,18,W,G-18,'rgba(255,190,80,'+(.04+.03*Math.sin(f*.09))+')');
  for(let i=0;i<12;i++)R((i*61+Math.sin(f*.01+i)*14+W)%W,(i*43+f*(.25+i%3*.1))%G,2,1,i%2?'rgba(255,184,200,.85)':'rgba(255,230,160,.5)')}
 else if(mp==3){for(let x=0;x<W;x+=6)R(x,24+Math.sin(x*.03+f*.015)*8,6,8+Math.sin(x*.04+f*.02)*6,'rgba(120,255,200,.07)');
  for(let i=0;i<2;i++)R(((f*.07*(i+1)+i*170)%(W+100))-50,30+i*16,50,4,'rgba(255,255,255,.4)')}
 else if(mp==4){for(let i=0;i<3;i++)R(((f*.18*(i+1)+i*130)%(W+140))-140,G-18-i*13,140,5,'rgba(200,170,225,.10)');
  for(let i=0;i<16;i++)R((i*47+Math.sin(f*.03+i)*10+W)%W,G-((f*.5+i*29)%110),1,1,i%3?'rgba(255,170,90,.8)':'rgba(255,230,160,.9)')}}
{const _b=bg;bg=function(){_b();bgFx()}}
function bg_(){}
function bg0(){['#1a1033','#2a1448','#3d1a5e','#5a2470','#7d2f80','#a3447f'].forEach((c,i)=>{X.fillStyle=c;X.fillRect(-40,i*26,W+80,26)});
 X.fillStyle='#ffe9a822';X.beginPath();X.arc(160,46,13,0,6.283);X.fill();X.fillStyle='#ffe9a8';X.beginPath();X.arc(160,46,8,0,6.283);X.fill();X.fillStyle='#e8cf8a';X.fillRect(157,43,2,2);X.fillRect(162,48,2,2);X.fillRect(158,49,1,1);X.fillStyle='#fff8';for(let i=0;i<30;i++)X.fillRect((i*97)%W,(i*53)%70,1,1);
 for(let i=0;i<14;i++){const h=30+(i*37)%50;X.fillStyle='#150a26';X.fillRect(i*24,G-h,20,h);X.fillStyle='#ffd23f66';for(let y=G-h+4;y<G-4;y+=8)X.fillRect(i*24+4+((y+i)%3)*4,y,2,3)}
 X.fillStyle='#2b1d3a';X.fillRect(-40,G,W+80,H-G+40);X.fillStyle='#3a2850';for(let x=0;x<W;x+=16)X.fillRect(x,G,8,3)}
function hud(){[[P,8,1],[O,W-8,-1]].forEach(([f,x,d])=>{const w=118,hw=w*f.hp/MAXHP;X.fillStyle='#000';X.fillRect(d>0?x-1:x-w-1,5,w+2,9);X.fillStyle='#511';X.fillRect(d>0?x:x-w,6,w,7);
 X.fillStyle=f.hp>MAXHP*.3?'#4c4':'#e53';X.fillRect(d>0?x:x-hw,6,hw,7);
 X.fillStyle='#000';X.fillRect(d>0?x-1:x-w-1,15,w+2,5);{const uv=f.sk?(f.om||0):f.ult;X.fillStyle=uv>=100&&frame%20<10?'#fff':uv>=100?'#ffd23f':f.sk?'#c01830':'#b6f';const uw=w*uv/100;X.fillRect(d>0?x:x-uw,16,uw,3)}
 T(CH[f.ci].n+(f.sdt>0?' [SDT]':'')+(f.jg?' [JC!]':'')+(f.sk?' [SUKUNA]':'')+(f.sd?' [STAND]':'')+(f.g5?' [G5]':'')+(f.pf?' [FLAME]':f.fm>0?' [BLUE FLAME]':'')+(f.brn?' [BURN]':''),x,28,'#fff',d>0?'left':'right',7)});
 if(net=='host')T('IN '+(frame-lastIn)+' L:'+(peerIn.l?1:0)+' R:'+(peerIn.r?1:0),8,12,'#0f0','left',6);for(let k=0;k<4;k++){const x=8+k*20,y=H-20,rd=k<3?1-ME.cd[k]/cdOf(ME,k):(ME.sk?(ME.om||0):ME.ult)/100;X.fillStyle='#000';X.fillRect(x,y,17,17);X.fillStyle=k<3?'#46a':(rd>=1?'#ffd23f':'#639');X.fillRect(x+1,y+16-15*rd,15,15*rd);T(kn(KB[['s0','s1','s2','ult'][k]],1),x+8,y+12,'#fff','center',kn(KB[['s0','s1','s2','ult'][k]],1).length>2?6:8)}
 T(kn(KB.l,1)+'/'+kn(KB.r,1)+' move '+kn(KB.jump,1)+' jump '+kn(KB.block,1)+' block '+kn(KB.dash,1)+' dash | '+kn(KB.m1,1)+'(+'+kn(KB.up,1)+'/'+kn(KB.dn,1)+') | '+kn(KB.s0,1)+' '+kn(KB.s1,1)+' '+kn(KB.s2,1)+' skills | '+kn(KB.ult,1)+' ult',W-4,H-4,'#ccc','right',5);yjHud()}
function selDraw0(){bg();T('PIXEL BRAWL ARENA',W/2,20,'#ffd23f','center',12);T('Choose your fighter  (A/D + Enter or click)',W/2,32,'#fff','center',7);
 const n=CH.length,cw=Math.floor(312/n)-1;
 CH.forEach((c,i)=>{const x=4+i*(cw+1),on=sel==i;X.fillStyle=on?'#ffd23f':'#555';X.fillRect(x-1,36,cw+2,70);X.fillStyle='#120a22';X.fillRect(x,37,cw,68);X.fillStyle=on?'#2a1848':'#1a1030';X.fillRect(x+1,38,cw-2,46);
  const d=mk(i,x+cw/2,1);d.y=82;d.pv=1;d.t=frame;d.sd=on&&i==2?1:0;d.g5=on&&i==3?1:0;d.sk=on&&i==5&&frame%300>150?1:0;drawF(d);
  T(c.n,x+cw/2,96,'#fff','center',7);T(c.d,x+cw/2,103,'#9ab','center',4)});
 const c=CH[sel];X.fillStyle='#ffd23f';X.fillRect(3,109,314,47);X.fillStyle='#120a22';X.fillRect(4,110,312,45);
 T(c.n,10,121,'#ffd23f','left',9);c.sk.forEach((k,j)=>T(ks('s'+j,k),10,131+j*8,'#fff','left',5.5));T(ks('ult',c.u),10,155,'#ffd23f','left',5.5);
 if(c.sk2){T('SUKUNA FORM',170,121,'#f08a8c','left',7);c.sk2.forEach((k,j)=>T(ks('s'+j,k),170,131+j*8,'#fff','left',5.5));T(ks('ult',c.u2),170,155,'#ffd23f','left',5.5)}else T(c.d,170,121,'#9ab','left',7)}
function selDraw(){selDraw0();T(mode==0?'Enter: choose opponent, map and AI':mode==1?'Room will be created':'You will join a code',W/2,166,'#ffd23f','center',7)}
function menuDraw(){bg();T('PIXEL BRAWL ARENA',W/2,40+Math.sin(frame*.05)*2,'#ffd23f','center',16);T('BETA',W/2,52,'#fff','center',7);
 ['OFFLINE  (vs AI)','ONLINE  CREATE ROOM','ONLINE  JOIN ROOM','SETTINGS'].forEach((t,i)=>{X.fillStyle=menu==i?'#ffd23f':'#333';X.fillRect(90,70+i*20,140,16);X.fillStyle='#120a22';X.fillRect(91,71+i*20,138,14);T(t,W/2,82+i*20,menu==i?'#ffd23f':'#fff','center',8)});
 [0,2].forEach(i=>{const d=mk(i,i?285:35,i?-1:1);d.pv=1;d.t=frame;outl(d);drawF(d)});T('W/S + Enter or click',W/2,H-8,'#ccc','center',6);if(err)T(err,W/2,162,'#e53','center',7)}
function waitDraw(){bg();const c=state=='code';T(c?'ENTER ROOM CODE':net=='host'&&room?'ROOM CODE':'CONNECTING...',W/2,60,'#fff','center',10);T(c?codeIn+'_':code,W/2,95,'#ffd23f','center',24);T(c?'Enter: join   Esc: back':net=='host'&&room?'Waiting for opponent...  (Esc: cancel)':'Esc: cancel',W/2,120,'#9ab','center',8)}
const pick=()=>{sfx('m');if(menu==3){state='set';sSel=0;sCap=-1;sWarn='';sDrag=-1;err='';return}mode=menu;state='select';err=''};
const go=()=>{sfx('m');if(mode==0){state='opts';orow=0}else if(mode==1){code=Math.random().toString(36).slice(2,6).toUpperCase().padEnd(4,'X');goOnline('host')}else{state='code';codeIn=''}};
function panel(x,y,w,h,t){X.fillStyle='#554';X.fillRect(x-1,y-1,w+2,h+2);X.fillStyle='#120a22';X.fillRect(x,y,w,h);X.fillStyle='#2a1848';X.fillRect(x,y,w,9);T(t,x+w/2,y+7,'#ffd23f','center',6)}
function setDraw0(){bg();X.fillStyle='rgba(8,4,20,.74)';X.fillRect(0,0,W,H);
 T('SETTINGS',W/2,16,'#ffd23f','center',11);panel(6,22,176,142,'CONTROLS');panel(188,22,126,142,'AUDIO');
 for(let i=0;i<12;i++){const y=RY(i),s=sSel==i,cp=sCap==i;
  if(s){X.fillStyle='#ffd23f';X.fillRect(8,y-1,172,10);X.fillStyle='#2a1848';X.fillRect(9,y,170,8)}
  T(ACT[i][1],13,y+6.5,s?'#ffd23f':'#fff','left',6);
  X.fillStyle=cp?'#f8c':s?'#ffd23f':'#555';X.fillRect(124,y,52,8);X.fillStyle=cp?'#3a1030':'#120a22';X.fillRect(125,y+1,50,6);
  T(cp?(frame%30<18?'PRESS KEY':''):kn(KB[ACT[i][0]]),150,y+6.5,cp?'#f8c':'#fff','center',6)}
 ['MASTER VOLUME','SFX VOLUME','MUSIC VOLUME'].forEach((n,k)=>{const y=36+k*28,s=sSel==12+k,v=VOL[VK[k]];
  T(n,196,y+6,s?'#ffd23f':'#fff','left',6);T(Math.round(v*100)+'%',306,y+6,s?'#ffd23f':'#9ab','right',6);
  X.fillStyle=s?'#ffd23f':'#555';X.fillRect(195,y+10,112,9);X.fillStyle='#120a22';X.fillRect(196,y+11,110,7);
  X.fillStyle=['#ffd23f','#4cc','#b6f'][k];X.fillRect(196,y+11,Math.round(110*v),7);X.fillStyle='#fff';X.fillRect(195+Math.round(110*v),y+9,3,11);
  if(k==2)T('(no music in the game yet)',196,y+26,'#789','left',4)});
 [['RESET TO DEFAULTS',122,15],['BACK',141,16]].forEach(([t,y,i])=>{const s=sSel==i;X.fillStyle=s?'#ffd23f':'#555';X.fillRect(196,y,110,13);X.fillStyle=s?'#2a1848':'#120a22';X.fillRect(197,y+1,108,11);T(t,251,y+9,s?'#ffd23f':'#fff','center',7)});
 if(sWarn)T(sWarn,W/2,171,sWarn[0]=='D'?'#6e6':'#e53','center',6);
 T(sCap>=0?'PRESS A KEY OR MOUSE BUTTON   (Esc: cancel)':'W/S select   Enter / click: rebind   A/D: adjust   Esc: back',W/2,sWarn?178:174,sCap>=0?'#f8c':'#9ab','center',5)}
const _bg=bg;
bg=function(){if(state=='fight'&&P&&O&&(P.doom>0||O.doom>0))return frDoomBg();_bg()};
const _hud=hud;
hud=function(){_hud();for(const[f,x,d]of[[P,8,1],[O,W-8,-1]]){const w=118;let v=-1,c='#fff',l='';
 if(f.ci==0){if(f.rm>0){v=f.rm/540;c='#ff3a1a';l='RAGE MODE'}else{v=(f.rg||0)/100;c='#e0701a';l='RAGE'}}
 else if(f.ci==1&&f.doom>0){v=f.doom/480;c='#a5f';l='DOOM'}
 if(v>=0){X.fillStyle='#000';X.fillRect(d>0?x-1:x-w-1,30,w+2,5);X.fillStyle='#2a1208';X.fillRect(d>0?x:x-w,31,w,3);X.fillStyle=c;X.fillRect(d>0?x:x-w*v,31,w*v,3);T(l,x,41,'#ffb',d>0?'left':'right',5)}}};
function tabDraw(){[['KEYBOARD',0,6],['MOBILE',1,62]].forEach(([n,v,x])=>{const on=CT==v;X.fillStyle=on?'#ffd23f':'#555';X.fillRect(x,3,54,14);X.fillStyle=on?'#2a1848':'#120a22';X.fillRect(x+1,4,52,12);T(n,x+27,13,on?'#ffd23f':'#9ab','center',6)});T('Tab: switch',W-8,13,'#789','right',5)}
function setDraw(){if(CT==0){setDraw0();tabDraw();return}
 bg();X.fillStyle='rgba(8,4,20,.74)';X.fillRect(0,0,W,H);T('SETTINGS',W/2,16,'#ffd23f','center',11);panel(6,22,308,142,'MOBILE CONTROLS');tabDraw();
 MROWS.forEach(([n,t],i)=>{const y=mRY(i),s=mSel==i;if(s){X.fillStyle='#ffd23f';X.fillRect(8,y-2,304,14);X.fillStyle='#2a1848';X.fillRect(9,y-1,302,12)}T(n,14,y+7,s?'#ffd23f':'#fff','left',6.5);
  if(i==0)T('< '+TAIMN[TAIM]+' >',306,y+7,s?'#ffd23f':'#9cf','right',6.5);
  else if(i==1)T('< '+TASN[TAS]+' >',306,y+7,s?'#ffd23f':'#9cf','right',6.5);
  else if(t=='s'){const v=i==2?(TSZ-.5)/1.2:(TOP-.2)/.8;X.fillStyle=s?'#ffd23f':'#555';X.fillRect(179,y+1,98,8);X.fillStyle='#120a22';X.fillRect(180,y+2,96,6);X.fillStyle='#4cc';X.fillRect(180,y+2,Math.round(96*clamp(v,0,1)),6);X.fillStyle='#fff';X.fillRect(179+Math.round(96*clamp(v,0,1)),y,3,10);T(Math.round((i==2?TSZ:TOP)*100)+'%',306,y+7,s?'#ffd23f':'#9ab','right',6)}});
 T(CT==1?'ON-SCREEN BUTTONS ARE SHOWN DURING MATCHES':'SWITCH TO MOBILE TO USE ON-SCREEN BUTTONS',W/2,148,CT==1?'#6e6':'#e53','center',5.5);
 T('AIM: drag a skill button (or the AIM stick) to aim. ASSIST snaps aim to the enemy.',W/2,156,'#9ab','center',5);
 T('W/S select   A/D change   Enter: open   Tab: keyboard page   Esc: back',W/2,174,'#9ab','center',5)}
