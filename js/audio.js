/* Pixel Brawl Arena - js/audio.js
 * AUDIO: Web Audio engine (sfx), music tracks/sequencer, volume handling.
 * Classic script (no modules): everything here is global. Load order: audio, input, combat, characters, net, ui, main.
 */
let AC;
let SFXC=null;
const sfxInit=()=>{AC=AC||new AudioContext();if(SFXC&&SFXC.ac===AC)return SFXC;const ac=AC,cp=ac.createDynamicsCompressor();cp.threshold.value=-16;cp.knee.value=12;cp.ratio.value=5;cp.attack.value=.003;cp.release.value=.15;const mg=ac.createGain();mg.gain.value=.8;const rv=ac.createConvolver(),L=ac.sampleRate*.45|0,ib=ac.createBuffer(2,L,ac.sampleRate);for(let c=0;c<2;c++){const d=ib.getChannelData(c);for(let k=0;k<L;k++)d[k]=(Math.random()*2-1)*Math.pow(1-k/L,3.2)}rv.buffer=ib;const rg=ac.createGain();rg.gain.value=.2;mg.connect(cp);mg.connect(rv);rv.connect(rg);rg.connect(cp);cp.connect(ac.destination);const nb=ac.createBuffer(1,ac.sampleRate,ac.sampleRate),nd=nb.getChannelData(0);for(let k=0;k<nd.length;k++)nd[k]=Math.random()*2-1;return SFXC={ac,mg,nb}};
const sfx=(t,pm=1,ty)=>{try{const vv=VOL.m*VOL.s;if(vv<=0)return;const C=sfxInit(),ac=C.ac,n=ac.currentTime,V=vv*.4;
const N=(a,b,q,d,v,ft='bandpass',dl=0)=>{const s=ac.createBufferSource();s.buffer=C.nb;s.loop=true;const f=ac.createBiquadFilter(),g=ac.createGain(),t0=n+dl;f.type=ft;f.Q.value=q;f.frequency.setValueAtTime(a*pm,t0);f.frequency.exponentialRampToValueAtTime(Math.max(20,b*pm),t0+d);g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(v*V,t0+Math.min(.006,d/4));g.gain.exponentialRampToValueAtTime(.0001,t0+d);s.connect(f);f.connect(g);g.connect(C.mg);s.start(t0,Math.random());s.stop(t0+d+.02)};
const T=(a,b,d,v,w='sine',dl=0)=>{const o=ac.createOscillator(),g=ac.createGain(),t0=n+dl;o.type=w;o.frequency.setValueAtTime(a*pm,t0);o.frequency.exponentialRampToValueAtTime(Math.max(20,b*pm),t0+d);g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(v*V,t0+.004);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(C.mg);o.start(t0);o.stop(t0+d+.02)};
switch(t){
case'h':N(3000,900,1.2,.07,.6);N(320,150,.8,.1,.6,'lowpass');T(180,60,.12,.7);break;
case'H':N(2800,500,.8,.12,.6);N(1200,200,.7,.3,1,'lowpass');T(110,32,.32,1.1);N(4500,1500,1,.05,.5);break;
case'b':T(1800,1750,.28,.3);T(2650,2600,.22,.2);T(4200,4100,.14,.14);N(6000,3000,2,.04,.5);T(200,90,.08,.4);break;
case's':N(500,3200,1.5,.17,.7);T(300,800,.12,.14,'triangle');break;
case'u':N(200,4500,1,.6,.7);T(80,420,.6,.55,'sawtooth');T(160,820,.6,.3);T(60,40,.7,.7);break;
case'm':T(660,990,.16,.4);T(1320,1980,.12,.2);N(5000,8000,3,.06,.2);break;
case'k':T(200,28,.75,1.1);N(900,60,.6,.65,1,'lowpass');N(3000,500,1,.15,.5);break;
case'd':N(800,2600,1,.15,.6);T(220,90,.1,.35,'triangle');break;
case'j':N(400,1500,1.2,.11,.35);T(120,210,.1,.4);break;
case'l':T(100,40,.13,.8);N(500,120,.8,.09,.5,'lowpass');break;
case'e':T(170,700,.22,.35);T(340,1400,.2,.18);N(1000,4200,3,.2,.25);break;
case'w':T(880,900,.32,.35);T(1320,1340,.3,.22,'sine',.06);T(1760,1780,.25,.12,'sine',.12);break;
case'v':N(1500,6500,2.5,.11,.8);N(3500,9000,3,.06,.5,'bandpass',.025);T(2400,2300,.35,.12,'sine',.07);break;
case'x':N(2600,900,1.5,.09,.7);T(2200,2100,.22,.22);T(3300,3200,.15,.12);T(150,60,.1,.6);break;
case'f':N(700,2600,1.2,.1,.4);T(240,420,.08,.12,'triangle');break;
case'q':T(260,110,.09,.8,'triangle');N(2500,800,1.5,.05,.7);T(520,500,.09,.25);T(90,45,.1,.5);break;
case'bk':N(4000,1500,2,.03,1);T(1200,300,.05,.6,'square');N(600,200,1,.12,.6,'lowpass');T(90,40,.15,.8);break;
default:T(400,200,.1,.3)}}catch(e){}};
const MUSIC_URLS=[null,null,null,null,null];
const MU={id:-1,s:0,nt:0,bus:null,mg:null,au:null,fu:null,nb:null};
const mf=n=>440*Math.pow(2,(n-69)/12);
function muNoiseBuf(){if(!MU.nb){const b=AC.createBuffer(1,AC.sampleRate,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;MU.nb=b}return MU.nb}
function mO(f,tm,d,ty,v,o){o=o||{};const A=AC,os=A.createOscillator(),g=A.createGain();os.type=ty;os.frequency.setValueAtTime(f,tm);if(o.sl)os.frequency.exponentialRampToValueAtTime(o.sl,tm+d);let n=os;
 if(o.lp){const b=A.createBiquadFilter();b.type='lowpass';b.frequency.value=o.lp;os.connect(b);n=b}
 const a=o.a||.004;g.gain.setValueAtTime(.0001,tm);g.gain.linearRampToValueAtTime(v,tm+Math.min(a,d*.6));g.gain.exponentialRampToValueAtTime(.0001,tm+d);n.connect(g);g.connect(MU.bus);os.start(tm);os.stop(tm+d+.05);
 if(o.vib){const l=A.createOscillator(),lg=A.createGain();l.frequency.value=o.vib[0];lg.gain.value=o.vib[1];l.connect(lg);lg.connect(os.frequency);l.start(tm);l.stop(tm+d+.05)}}
function mN(tm,d,v,hp,q){const A=AC,s=A.createBufferSource(),g=A.createGain(),h=A.createBiquadFilter();s.buffer=muNoiseBuf();h.type=q?'bandpass':'highpass';h.frequency.value=hp;if(q)h.Q.value=q;g.gain.setValueAtTime(v,tm);g.gain.exponentialRampToValueAtTime(.0001,tm+d);s.connect(h);h.connect(g);g.connect(MU.bus);s.start(tm,Math.random()*.4);s.stop(tm+d+.02)}
const mKick=(tm,v)=>mO(150,tm,.16,'sine',v,{sl:42});
const mHat=(tm,v,d)=>mN(tm,d||.04,v,7000);
const mSnare=(tm,v)=>{mN(tm,.13,v,1800,.8);mO(220,tm,.08,'triangle',v*.6,{sl:120})};
const mTaiko=(tm,v,p)=>{p=p||1;mO(110*p,tm,.35,'sine',v,{sl:48*p});mN(tm,.1,v*.3,400,.6)};
/* NEON CITY : driving electronic (A minor, 128 bpm) */
const T0=(s,tm,sp)=>{const st=s&15,bar=s>>4,pr=bar&3,root=[45,41,48,43][pr],ch=[[57,60,64],[53,57,60],[60,64,67],[55,59,62]][pr];
 if(st%4==0)mKick(tm,.34);if(st%4==2)mHat(tm,.07);else if(st&1)mHat(tm,.022,.025);if(st==4||st==12)mSnare(tm,.1);
 if(!(st&1))mO(mf(root+((st>>1)==3||(st>>1)==7?12:0)),tm,sp*1.7,'sawtooth',.1,{lp:650});
 const ar=[0,1,2,1,2,1,0,2,1,2,0,1,2,0,1,2][st];mO(mf(ch[ar]+12+(st%8>3?12:0)),tm,sp*.9,'square',.03,{lp:3000});
 if(st==0)for(const n of ch)mO(mf(n),tm,sp*15,'sawtooth',.016,{lp:900,a:.25});
 if((bar>>2)&1){const H=bar&1?{0:72,3:74,6:76,8:74,10:72,12:69}:{0:76,3:79,6:81,8:79,10:76,12:74};if(H[st])mO(mf(H[st]),tm,sp*2.6,'sawtooth',.045,{lp:2600,vib:[6,3]})}};
/* DESERT : menacing phrygian-dominant theme, drone + taiko + duduk-like lead (D, 92 bpm) */
const T1=(s,tm,sp)=>{const st=s&15,bar=s>>4,b8=bar&7;
 if(st==0&&!(bar&1)){mO(mf(38),tm,sp*31,'sawtooth',.03,{lp:420,a:.4});mO(mf(45),tm,sp*31,'sawtooth',.02,{lp:420,a:.4})}
 if(st==0||st==8)mTaiko(tm,.3);if(st==6||st==14)mTaiko(tm,.1,1.3);if((bar&3)==3&&st>=12)mTaiko(tm,.12+(st-12)*.03,1.2);
 if(!(st&1)){const o=[0,0,0,1,0,0,4,3][st>>1];mO(mf(50+o),tm,sp*1.5,'sawtooth',.04,{lp:900})}
 if(st==0&&(bar&3)==0)for(const n of[62,69,74])mO(mf(n),tm,sp*62,'sine',.02,{a:.9});
 if(b8>=2){const P=[[[0,74,6],[8,75,4],[12,78,4]],[[0,79,8],[8,78,4],[12,75,4]],[[0,74,6],[8,72,4],[12,70,4]],[[0,69,10],[12,74,4]]][bar&3],n=P.find(x=>x[0]==st);if(n)mO(mf(n[1]),tm,sp*n[2]*.95,'triangle',.07,{lp:2200,a:.06,vib:[5.2,5]})}
 if(st==0&&b8==0)mN(tm,1.2,.06,3000)};
/* DOJO : serene japanese-scale piece, koto plucks + shakuhachi-like flute (D hirajoshi, 80 bpm) */
const T2=(s,tm,sp)=>{const st=s&15,bar=s>>4;
 if(!(st&1)){const n=(bar&1?[62,70,65,70,64,70,65,69]:[62,69,65,69,64,69,65,69])[st>>1];mO(mf(n),tm,.55,'triangle',.07,{lp:2400});mO(mf(n)*2,tm,.2,'sine',.02)}
 const P=[[[0,74,8],[8,70,4],[12,69,4]],[[0,65,6],[8,64,4],[12,62,4]],[[0,69,8],[8,70,4],[12,74,4]],[[0,77,12],[12,74,4]]][bar&3],n=P.find(x=>x[0]==st);
 if(n&&bar>=2){mO(mf(n[1]),tm,sp*n[2],'sine',.06,{a:.1,vib:[4.8,4]});mN(tm,sp*n[2],.014,2500,1.2)}
 if(st==0&&!(bar&1))mTaiko(tm,.2,.8);if(st==8&&(bar&1))mTaiko(tm,.12,.9);
 if((st==6||st==14)&&(bar&3)==3)mO(1200,tm,.05,'square',.025,{lp:2000});
 if(st==0&&!(bar&1)){mO(mf(50),tm,sp*31,'sine',.03,{a:.5});mO(mf(57),tm,sp*31,'sine',.02,{a:.5})}
 if(st==10)mO(mf([86,89,93,89][bar&3]),tm,.9,'sine',.025)};
/* SNOW PEAKS : cold, ancestral calm - choir pad, frame drum, bell echoes, flute (A minor, 72 bpm) */
const T3=(s,tm,sp)=>{const st=s&15,bar=s>>4,pr=bar&3,ch=[[57,60,64],[55,59,62],[53,57,60],[52,56,59]][pr];
 if(st==0){for(const n of ch){mO(mf(n),tm,sp*15,'sine',.022,{a:.8});mO(mf(n+12),tm,sp*15,'triangle',.01,{a:.9,lp:1500})}mO(mf(ch[0]-24),tm,sp*15,'sine',.07,{a:.3});if(!(bar&3))mN(tm,sp*40,.012,900,.5)}
 if(st==0)mTaiko(tm,.2,1.4);if(st==6||st==10)mTaiko(tm,.11,1.5);if(st==3||st==13)mTaiko(tm,.04,1.6);
 if(!(st&1)){const n=ch[(st>>1)%3]+24+(st%8>3?5:0)*0;mO(mf(n),tm,.6,'sine',.035);mO(mf(n),tm+sp*3,.5,'sine',.012)}
 if((bar>>2)&1){const P=[[[0,81,8],[8,79,4],[12,76,4]],[[0,76,6],[8,72,4],[12,74,4]],[[0,72,8],[8,74,4],[12,76,4]],[[0,69,12]]][bar&3],n=P.find(x=>x[0]==st);if(n){mO(mf(n[1]),tm,sp*n[2],'triangle',.05,{a:.12,lp:2500,vib:[5,3]});mN(tm,sp*n[2],.01,3000,1.5)}}};
/* TEMPLE RUINS : dark gothic grandeur - organ, heartbeat, strings, piano motif, choir (E harmonic minor, 96 bpm) */
const T4=(s,tm,sp)=>{const st=s&15,bar=s>>4,pr=bar&3,root=[40,36,45,47][pr],ch=[[52,55,59],[48,52,55],[57,60,64],[59,63,66]][pr],b8=bar&7;
 if(st==0){for(const n of ch){mO(mf(n),tm,sp*15,'sawtooth',.018,{lp:1100,a:.15});mO(mf(n-12),tm,sp*15,'sawtooth',.012,{lp:700,a:.15})}}
 if(st==0)mKick(tm,.38);if(st==3)mKick(tm,.26);if(st==8)mKick(tm,.3);if(st==11)mKick(tm,.2);
 if(st%2==0||st%4==3)mO(mf(root+24+(st&4?7:0)),tm,sp*.9,'sawtooth',.028,{lp:700});
 const M=bar&1?{0:79,2:76,4:75,6:71,8:67,12:64}:{0:64,2:67,4:71,6:75,8:76,12:71};if(M[st]!==undefined){mO(mf(M[st]),tm,sp*3,'triangle',.06,{lp:3500});mO(mf(M[st]+12),tm,sp*2,'sine',.015)}
 if(st==0&&!(bar&3)){mN(tm,1.5,.07,2500);for(const n of[64,67,71,76])mO(mf(n),tm,sp*62,'sine',.016,{a:1})}
 if(b8>=4&&(st==4||st==12))mSnare(tm,.08)};
const TRK=[{bpm:128,f:T0,g:1.3},{bpm:92,f:T1,g:1},{bpm:80,f:T2,g:1.2},{bpm:72,f:T3,g:1.8},{bpm:96,f:T4,g:1.2}];
function muSwitch(id){const A=AC,t=A.currentTime;if(MU.bus){const b=MU.bus;try{b.gain.cancelScheduledValues(t);b.gain.setValueAtTime(b.gain.value,t);b.gain.linearRampToValueAtTime(0,t+.35)}catch(e){}setTimeout(()=>{try{b.disconnect()}catch(e){}},600)}
 MU.bus=A.createGain();MU.bus.gain.setValueAtTime(0,t);MU.bus.gain.linearRampToValueAtTime(TRK[id].g||1,t+.4);MU.bus.connect(MU.mg);MU.id=id;MU.s=0;MU.nt=t+.1}
function muFile(u){if(MU.fu!=u){muFileStop();const a=new Audio(u);a.loop=true;MU.au=a;MU.fu=u;a.play().catch(()=>{})}MU.au.volume=clamp(VOL.m*VOL.u,0,1)}
function muFileStop(){if(MU.au){MU.au.pause();MU.au=null;MU.fu=null}}
function muTick(){try{if(!AC||AC.state!='running')return;if(!MU.mg){MU.mg=AC.createGain();MU.mg.connect(AC.destination)}
 const k=mp%TRK.length,u=MUSIC_URLS[k];MU.mg.gain.value=VOL.m*VOL.u*1.0*(FIN&&FIN.t<40?.35:1);
 if(u){if(MU.id!=-1){MU.id=-1;if(MU.bus){MU.bus.gain.value=0}}muFile(u);return}else muFileStop();
 if(MU.id!=k)muSwitch(k);const sp=60/TRK[k].bpm/4,la=document.hidden?1.4:.25;while(MU.nt<AC.currentTime+la){TRK[k].f(MU.s,MU.nt,sp);MU.s++;MU.nt+=sp}}catch(e){}}
const muInit=()=>{try{AC=AC||new AudioContext();if(AC.state!='running')AC.resume()}catch(e){}};
addEventListener('pointerdown',muInit);
addEventListener('keydown',muInit);
setInterval(muTick,50);
