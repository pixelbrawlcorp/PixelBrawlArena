/* Pixel Brawl Arena - js/input.js
 * INPUT: key bindings + settings persistence, keyboard/mouse handlers, mobile touch controls and touch layout.
 * Classic script (no modules): everything here is global. Load order: audio, input, combat, characters, net, ui, main.
 */
/* ---- settings state (defaults, saved to localStorage) ---- */
const KD={l:'KeyA',r:'KeyD',jump:'Space',block:'KeyF',dash:'ShiftLeft',m1:'Mouse0',up:'KeyW',dn:'KeyS',s0:'KeyZ',s1:'KeyX',s2:'KeyC',ult:'KeyG'},VD={m:1,s:1,u:.7},SKEY='pba_settings_v6';
let KB={...KD},VOL={...VD},sSel=0,sCap=-1,sWarn='',sDrag=-1,LOC=0,AF=[];
const inp=()=>({l:K[KB.l],r:K[KB.r],jump:K[KB.jump],block:K[KB.block],w:K[KB.up],s:K[KB.dn],ax:mx,ay:my,m1:E.m1>0,dash:E.dash>0,s0:E.s0>0,s1:E.s1>0,s2:E.s2>0,ult:E.ult>0});
onkeydown=e=>{const c=nk(e.code);K[c]=1;if(c=='Space'||c.startsWith('Arrow')||(state=='fight'&&isBound(c)))e.preventDefault();if(state=='set'){setKey(e,c);return}
 if(state=='menu'){if(c=='KeyW'||c=='ArrowUp'){menu=(menu+3)%4;sfx('m')}if(c=='KeyS'||c=='ArrowDown'){menu=(menu+1)%4;sfx('m')}if(c=='Enter'||c=='Space')pick();return}
 if(state=='select'){if(c=='KeyA'||c=='ArrowLeft')sel=(sel+CH.length-1)%CH.length;if(c=='KeyD'||c=='ArrowRight')sel=(sel+1)%CH.length;if(c=='Enter'||c=='Space')go();if(c=='Escape')state='menu';return}
 if(state=='code'){if(c=='Escape')state='menu';else if(c=='Backspace')codeIn=codeIn.slice(0,-1);else if(c=='Enter'&&codeIn.length==4){code=codeIn;goOnline('guest')}else if(/^[a-z0-9]$/i.test(e.key)&&codeIn.length<4)codeIn+=e.key.toUpperCase();return}
 if(state=='opts'){if(c=='KeyW'||c=='ArrowUp')orow=(orow+2)%3;if(c=='KeyS'||c=='ArrowDown')orow=(orow+1)%3;const d=(c=='KeyD'||c=='ArrowRight')?1:(c=='KeyA'||c=='ArrowLeft')?-1:0;if(d)optCh(d);if(c=='Enter'||c=='Space')beginMatch();if(c=='Escape')state='select';return}
 if(state=='wait'){if(c=='Escape')back();return}
 if(state=='over'){if(c=='Enter')back();return}
 if(e.repeat)return;if(state=='fight')press(c)};
onkeyup=e=>{K[nk(e.code)]=0};
onblur=()=>{for(const k in K)K[k]=0};
onmouseup=e=>{K['Mouse'+e.button]=0;sDrag=-1};
function mpos(e){const r=C.getBoundingClientRect();mx=(e.clientX-r.left)/r.width*W;my=(e.clientY-r.top)/r.height*H}
/* ===== v6 : SETTINGS + per-character dash / jump ===== */
const nk=c=>c=='ShiftRight'?'ShiftLeft':c=='ControlRight'?'ControlLeft':c=='AltRight'?'AltLeft':c;
const isBound=c=>Object.values(KB).includes(c);
function kn(c,sh){if(!c)return'-';
 const M={Space:['SPACE','SPC'],ShiftLeft:['SHIFT','SHF'],ControlLeft:['CTRL','CTL'],AltLeft:['ALT','ALT'],ArrowLeft:['LEFT','LFT'],ArrowRight:['RIGHT','RGT'],ArrowUp:['UP','UP'],ArrowDown:['DOWN','DWN'],Backspace:['BACKSPACE','BSP'],CapsLock:['CAPS','CAP'],Tab:['TAB','TAB'],Enter:['ENTER','ENT'],Backquote:['`','`'],Minus:['-','-'],Equal:['=','='],BracketLeft:['[','['],BracketRight:[']',']'],Semicolon:[';',';'],Quote:["'","'"],Comma:[',',','],Period:['.','.'],Slash:['/','/'],Backslash:['\\','\\'],NumpadEnter:['NUM ENTER','NEN'],Delete:['DEL','DEL'],Insert:['INS','INS'],Home:['HOME','HOM'],End:['END','END'],PageUp:['PGUP','PGU'],PageDown:['PGDN','PGD']};
 const m=c.match(/^Mouse(\d)$/);if(m)return sh?(['LMB','MMB','RMB'][+m[1]]||'M'+(+m[1]+1)):(['LEFT CLICK','MIDDLE CLICK','RIGHT CLICK'][+m[1]]||'MOUSE '+(+m[1]+1));
 if(M[c])return M[c][sh?1:0];if(/^Key[A-Z]$/.test(c))return c[3];if(/^Digit\d$/.test(c))return c[5];
 if(/^Numpad/.test(c))return(sh?'N':'NUM ')+c.slice(6).replace('Multiply','*').replace('Add','+').replace('Subtract','-').replace('Decimal','.').replace('Divide','/');
 if(/^F\d+$/.test(c))return c;return c.toUpperCase().slice(0,sh?3:10)}
const ks=(k,s)=>kn(KB[k],1)+s.slice(1);
const ACT=[['l','MOVE LEFT'],['r','MOVE RIGHT'],['jump','JUMP'],['block','BLOCK'],['dash','DASH'],['m1','LIGHT ATTACK (M1)'],['up','M1 + UP: UPPERCUT'],['dn','M1 + DOWN: SLAM'],['s0','SKILL 1'],['s1','SKILL 2'],['s2','SKILL 3'],['ult','ULTIMATE']],VK=['m','s','u'];
function saveSet(){try{localStorage.setItem(SKEY,JSON.stringify({kb:KB,vol:VOL}))}catch(e){}}
function loadSet(){try{const s=JSON.parse(localStorage.getItem(SKEY)||'null');if(!s)return;
 if(s.kb){const u=new Set();let ok=1;for(const k in KD){const v=s.kb[k];if(typeof v!='string'||v.length>24||u.has(v)){ok=0;break}u.add(v)}if(ok)KB={...KD,...s.kb}}
 if(s.vol)for(const k in VD)if(typeof s.vol[k]=='number'&&s.vol[k]>=0&&s.vol[k]<=1)VOL[k]=s.vol[k]}catch(e){}}
function press(c){const b=KB;if(c==b.m1)E.m1=8;if(c==b.s0)E.s0=8;if(c==b.s1)E.s1=8;if(c==b.s2)E.s2=8;if(c==b.ult)E.ult=8;if(c==b.dash||((c==b.l||c==b.r)&&K[b.dash]))E.dash=6}
function setVol(k,v){v=clamp(Math.round(v*20)/20,0,1);if(VOL[VK[k]]!=v){VOL[VK[k]]=v;saveSet();if(k<2)sfx('m')}}
function setReset(){KB={...KD};VOL={...VD};saveSet();sCap=-1;sWarn='DEFAULTS RESTORED'}
function setBack(){sCap=-1;sDrag=-1;saveSet();state='menu';sfx('m')}
function bindKey(c){const a=ACT[sCap][0];
 if(c=='Escape'){sCap=-1;sWarn='';return}
 if(['Enter','MetaLeft','MetaRight','ContextMenu','Tab'].includes(c)){sWarn='THAT KEY CANNOT BE USED';sfx('b');return}
 const o=ACT.find(([k])=>k!=a&&KB[k]==c);if(o){sWarn=kn(c,1)+' IS ALREADY USED BY '+o[1];sfx('b');return}
 KB[a]=c;sCap=-1;sWarn='';saveSet();sfx('m')}
function setKey0(e,c){e.preventDefault();
 if(sCap>=0){if(!e.repeat)bindKey(c);return}
 if(c=='Escape'){setBack();return}
 if(c=='KeyW'||c=='ArrowUp'){sSel=(sSel+16)%17;sfx('m');return}
 if(c=='KeyS'||c=='ArrowDown'){sSel=(sSel+1)%17;sfx('m');return}
 const d=(c=='KeyD'||c=='ArrowRight')?1:(c=='KeyA'||c=='ArrowLeft')?-1:0;
 if(d){if(sSel>=12&&sSel<=14)setVol(sSel-12,VOL[VK[sSel-12]]+d*.05);else if(d>0&&sSel<12)sSel=12;else if(d<0&&sSel>=15)sSel=11;return}
 if(e.repeat)return;
 if(c=='Enter'||c=='Space'){sfx('m');if(sSel<12){sCap=sSel;sWarn=''}else if(sSel==15)setReset();else if(sSel==16)setBack()}}
const RY=i=>Math.round(33+i*10.5);
function setHit(){if(mx>=6&&mx<182&&my>=33&&my<33+12*10.5)return Math.min(11,Math.floor((my-33)/10.5));
 if(mx>=188&&mx<314)for(let k=0;k<3;k++)if(my>=36+k*28-2&&my<36+k*28+24)return 12+k;
 if(mx>=196&&mx<306){if(my>=122&&my<135)return 15;if(my>=141&&my<154)return 16}return-1}
function setMove0(){if(sDrag>=0){setVol(sDrag,(mx-196)/110);return}const h=setHit();if(h>=0&&sCap<0)sSel=h}
function setMouse0(e){if(sCap>=0){bindKey('Mouse'+e.button);return}if(e.button!=0)return;const h=setHit();if(h<0)return;sSel=h;
 if(h<12){sCap=h;sWarn='';sfx('m')}else if(h<15){sDrag=h-12;setVol(sDrag,(mx-196)/110)}else if(h==15){setReset();sfx('m')}else setBack()}
/* ===================== MOBILE / TOUCH CONTROLS ===================== */
const TKEY='pba_touch_v1';
const TC={pad:{x:.16,y:.80,w:176,h:84,lab:'MOVE',t:'pad',c:'#9ab'},block:{x:.30,y:.57,s:54,lab:'BLOCK',c:'#6cf',key:'block'},jump:{x:.37,y:.78,s:62,lab:'JUMP',c:'#9f9',key:'jump'},dash:{x:.31,y:.91,s:50,lab:'DASH',c:'#fc6',t:'dash'},
 aim:{x:.57,y:.80,s:74,lab:'AIM',c:'#f8c',t:'aim'},m1:{x:.89,y:.79,s:84,lab:'M1',c:'#ffd23f',key:'m1',ad:1},upper:{x:.77,y:.90,s:46,lab:'UP+M1',c:'#ffd23f',t:'upper'},slam:{x:.965,y:.91,s:44,lab:'DN+M1',c:'#ffd23f',t:'slam'},
 s0:{x:.75,y:.68,s:58,lab:'S1',c:'#6cf',key:'s0',ad:1},s1:{x:.79,y:.48,s:58,lab:'S2',c:'#6cf',key:'s1',ad:1},s2:{x:.91,y:.47,s:58,lab:'S3',c:'#6cf',key:'s2',ad:1},ult:{x:.975,y:.62,s:56,lab:'ULT',c:'#f8c',key:'ult',ad:1},
 menu:{x:.965,y:.07,s:36,lab:'II',c:'#ccc',t:'menu',fix:1},fs:{x:.905,y:.07,s:36,lab:'[ ]',c:'#ccc',t:'fs',fix:1}};
let CT=(typeof matchMedia=='function'&&matchMedia('(pointer:coarse)').matches)?1:0,TAIM=0,TAS=2,TSZ=1,TOP=.7,TLAY={},TLS={},THID={},TEDIT=0,TSEL='m1',mSel=0,overAt=0;
const MA={raw:null,until:0,abs:null};
function tSave(){try{localStorage.setItem(TKEY,JSON.stringify({ct:CT,aim:TAIM,as:TAS,sz:TSZ,op:TOP,lay:TLAY,ls:TLS,hid:THID,set:1,v:2}))}catch(e){}}
function tLoad(){try{const s=JSON.parse(localStorage.getItem(TKEY)||'null');if(!s)return;if(s.ct===0||s.ct===1)CT=s.ct;if([0,1,2].includes(s.aim))TAIM=s.aim;if([0,1,2].includes(s.as))TAS=s.as;
 if(typeof s.sz=='number')TSZ=clamp(s.sz,.5,1.7);if(typeof s.op=='number')TOP=clamp(s.op,.2,1);if(s.v===2&&s.lay&&typeof s.lay=='object')TLAY=s.lay;if(s.v===2&&s.ls&&typeof s.ls=='object')TLS=s.ls;if(s.hid&&typeof s.hid=='object')THID=s.hid}catch(e){}}
const tIsTouch=()=>('ontouchstart' in window)||(navigator.maxTouchPoints>0);
function tK(){const vw=innerWidth,vh=innerHeight;return clamp(Math.min(vw/800,vh/360),.7,1.6)*TSZ}
const TEL={};
let tcBox=null,tcPan=null,tcRot=null,tcBack=null,tcAimDot=null;
function tcCSS(){const s=document.createElement('style');s.textContent=`
#tc,#tp,#tr,#tback{position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:20;pointer-events:none;display:none;font-family:monospace;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:none}
#tc .tb{position:absolute;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border:3px solid var(--c);background:rgba(12,6,28,calc(var(--op)*.8));color:#fff;font-weight:bold;font-size:calc(var(--fs)*1px);border-radius:50%;pointer-events:auto;touch-action:none;opacity:var(--op);overflow:hidden;text-shadow:0 1px 0 #000;text-align:center;line-height:1.05}
#tc .tb.pad{border-radius:22px;justify-content:space-between;padding:0 14px}
#tc .tb.pad b{font-size:calc(var(--fs)*1.6px);opacity:.5}#tc .tb.pad.L b:first-child,#tc .tb.pad.R b:last-child{opacity:1;color:#ffd23f}
#tc .tb.on{background:rgba(255,210,63,.45)}#tc .tb .cd{position:absolute;left:0;bottom:0;width:100%;height:0;background:rgba(0,0,0,.65)}
#tc .tb.rdy{box-shadow:0 0 14px 3px var(--c);animation:pulse .8s infinite alternate}@keyframes pulse{to{box-shadow:0 0 22px 7px var(--c)}}
#tc .tb span{position:relative}#tc.edit .tb{border-style:dashed;opacity:1;cursor:move}#tc.edit .tb.sel{outline:3px solid #ffd23f;outline-offset:3px}#tc.edit .tb.hid{opacity:.28}
#tp{display:none;align-items:flex-start;justify-content:center}#tp .pn{pointer-events:auto;margin-top:6px;background:rgba(14,8,32,.94);border:2px solid #ffd23f;border-radius:10px;padding:8px 12px;color:#fff;font-size:12px;max-width:94vw;text-align:center}
#tp .pn b{color:#ffd23f}#tp button{font:bold 12px monospace;margin:3px;padding:7px 11px;border:2px solid #ffd23f;background:#2a1848;color:#ffd23f;border-radius:6px;touch-action:manipulation}#tp input{vertical-align:middle;width:120px}
#tr{background:#0b0b14;color:#ffd23f;align-items:center;justify-content:center;text-align:center;font-size:20px;pointer-events:auto}
#tback{pointer-events:none}#tback button{pointer-events:auto;position:absolute;left:10px;top:10px;font:bold 14px monospace;padding:10px 14px;border:2px solid #ffd23f;background:rgba(18,10,34,.85);color:#ffd23f;border-radius:8px}
#tc .aimdot{position:absolute;width:18px;height:18px;margin:-9px;border:2px solid #f8c;border-radius:50%;pointer-events:none;display:none}`;document.head.appendChild(s)}
function tcBuild(){tcCSS();
 tcBox=document.createElement('div');tcBox.id='tc';tcBox.style.setProperty('--op',TOP);document.body.appendChild(tcBox);
 for(const id in TC){const d=TC[id],el=document.createElement('div');el.className='tb'+(d.t=='pad'?' pad':'');el.dataset.id=id;el.style.setProperty('--c',d.c);
  el.innerHTML=d.t=='pad'?'<b>&#9664;</b><b>&#9654;</b>':'<i class="cd"></i><span>'+d.lab+'</span>';tcBox.appendChild(el);TEL[id]=el;tcBind(id,el)}
 tcAimDot=document.createElement('div');tcAimDot.className='aimdot';tcBox.appendChild(tcAimDot);
 tcPan=document.createElement('div');tcPan.id='tp';tcPan.innerHTML='<div class="pn"><div><b>EDIT BUTTONS</b> &mdash; drag to move &bull; tap to select</div><div>SIZE <input id="tpz" type="range" min="50" max="170"> OPACITY <input id="tpo" type="range" min="20" max="100"></div><div id="tpsel">-</div><div><button id="tpm">&minus;</button><button id="tpp">+</button><button id="tph">HIDE</button><button id="tpr">RESET</button><button id="tpd">DONE</button></div></div>';document.body.appendChild(tcPan);
 tcRot=document.createElement('div');tcRot.id='tr';tcRot.innerHTML='<div>&#8635;<br>ROTATE YOUR DEVICE<br>TO LANDSCAPE</div>';document.body.appendChild(tcRot);
 tcBack=document.createElement('div');tcBack.id='tback';tcBack.innerHTML='<button>&#9664; BACK</button>';document.body.appendChild(tcBack);
 tcBack.firstChild.addEventListener('pointerdown',e=>{e.preventDefault();dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}));dispatchEvent(new KeyboardEvent('keyup',{code:'Escape',key:'Escape'}))});
 const q=i=>document.getElementById(i);
 q('tpz').oninput=e=>{TSZ=e.target.value/100;tcLay();tSave()};q('tpo').oninput=e=>{TOP=e.target.value/100;tcBox.style.setProperty('--op',TOP);tSave()};
 q('tpm').onclick=()=>{TLS[TSEL]=clamp((TLS[TSEL]||1)-.1,.5,2);tcLay();tSave()};q('tpp').onclick=()=>{TLS[TSEL]=clamp((TLS[TSEL]||1)+.1,.5,2);tcLay();tSave()};
 q('tph').onclick=()=>{if(!TC[TSEL].fix){THID[TSEL]=THID[TSEL]?0:1;tcLay();tSave();tcSelUI()}};
 q('tpr').onclick=()=>{TLAY={};TLS={};THID={};TSZ=1;TOP=.7;q('tpz').value=100;q('tpo').value=70;tcBox.style.setProperty('--op',TOP);tcLay();tSave();tcSelUI()};
 q('tpd').onclick=()=>tcEdit(0);tcLay()}
function tcSelUI(){const e=document.getElementById('tpsel');if(!e)return;const d=TC[TSEL];e.innerHTML='SELECTED: <b>'+d.lab+'</b> &nbsp; scale '+Math.round((TLS[TSEL]||1)*100)+'%'+(THID[TSEL]?' (HIDDEN)':'');document.getElementById('tph').textContent=THID[TSEL]?'SHOW':'HIDE';for(const id in TEL)TEL[id].classList.toggle('sel',id==TSEL)}
/* ---- side-zone layout: while fighting on a touch device the canvas shrinks and the controls live in the black bars left/right of it ---- */
let TSAFE=[0,0],tZon=0;
function tcSafeU(){try{const e=document.createElement('div');e.style.cssText='position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;padding:0 env(safe-area-inset-right,0px) 0 env(safe-area-inset-left,0px)';document.body.appendChild(e);const cs=getComputedStyle(e);TSAFE=[parseFloat(cs.paddingLeft)||0,parseFloat(cs.paddingRight)||0];e.remove()}catch(_){}}
function tcZ(){const vw=innerWidth,vh=innerHeight;if(!(CT==1&&vw>vh*1.05&&(state=='fight'||TEDIT)))return{on:0};
 const sl=TSAFE[0],sr=TSAFE[1],sm=Math.max(sl,sr),zmin=clamp(vw*.2,118,236),cw=Math.max(260,Math.min(vw-2*zmin-2*sm,vh*16/9*.96)),bl=(vw-cw)/2,zw=Math.max(60,Math.min(bl-sl,bl-sr));
 return{on:1,cw,zw,l0:sl+(bl-sl-zw)/2,r0:vw/2+cw/2+(bl-sr-zw)/2}}
function tcFit(){const Z=tcZ(),v=Z.on?Math.round(Z.cw)+'px':'';if(C.style.width!==v)C.style.width=v}
/* default spot of every button inside its zone: [side, x (0-1 of zone width), y (0-1 of screen height), size (fraction of zone width)] */
const ZL={pad:['L',.5,.86,.86],block:['L',.27,.16,.30],dash:['L',.73,.16,.30],jump:['L',.5,.41,.42],aim:['L',.5,.64,.52],
 fs:['R',.28,.075,.19],menu:['R',.72,.075,.19],s0:['R',.28,.235,.34],s1:['R',.72,.235,.34],s2:['R',.28,.405,.34],ult:['R',.72,.405,.35],m1:['R',.5,.675,.52],upper:['R',.27,.9,.27],slam:['R',.73,.9,.27]};
function tcLay(){if(!tcBox)return;tcFit();const vw=innerWidth,vh=innerHeight,k=tK(),Z=tcZ();
 for(const id in TC){const d=TC[id],el=TEL[id],sc=TLS[id]||1,p=TLAY[id];let w,h,cx,cy;
  if(Z.on){const z=ZL[id],kz=Math.min(1,vh/(Z.zw*2.35)),b=Z.zw*z[3]*kz*(d.fix?1:TSZ)*sc;w=b;h=d.t=='pad'?b*.42:b;cx=p?p[0]*vw:(z[0]=='L'?Z.l0:Z.r0)+z[1]*Z.zw;cy=p?p[1]*vh:z[2]*vh}
  else{const q=p||[d.x,d.y];w=(d.t=='pad'?d.w:d.s)*k*sc;h=(d.t=='pad'?d.h:d.s)*k*sc;cx=q[0]*vw;cy=q[1]*vh}
  el.style.width=w+'px';el.style.height=h+'px';el.style.left=(cx-w/2)+'px';el.style.top=(cy-h/2)+'px';el.style.setProperty('--fs',Math.max(8,Math.min(w,h)*(d.t=='pad'?.3:.27)));
  el.classList.toggle('hid',!!THID[id]);el.style.display=(THID[id]&&!TEDIT)||(id=='aim'&&TAIM!=1&&!TEDIT)?'none':'flex'}}
addEventListener('resize',()=>{tcSafeU();tcLay()});
addEventListener('orientationchange',()=>setTimeout(()=>{tcSafeU();tcLay()},120));
function tcEdit(on){TEDIT=on?1:0;if(!tcBox)return;tcBox.classList.toggle('edit',!!on);tcPan.style.display=on?'flex':'none';tcLay();if(on){document.getElementById('tpz').value=Math.round(TSZ*100);document.getElementById('tpo').value=Math.round(TOP*100);tcSelUI()}tSave()}
/* ---- input helpers ---- */
const tHeld={};
function kdown(k){const c=KB[k];if(!K[c]){K[c]=1;press(c)}}
function kup(k){K[KB[k]]=0}
function mdash(){const me=ME||P;const d=K[KB.l]?KB.l:K[KB.r]?KB.r:(me&&me.f<0?KB.l:KB.r),set=!K[d];if(set)K[d]=1;press(KB.dash);setTimeout(()=>{if(set)K[d]=0},150)}
function tcAimFrom(el,e,ad){const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,len=Math.hypot(dx,dy),R=r.width/2;
 if(len>R*.22){MA.raw={a:Math.atan2(dy,dx),d:30+clamp((len-R*.22)/(R*1.7),0,1)*115};MA.until=Infinity;MA.abs=null}}
function tcBind(id,el){const d=TC[id];let pid=-1,ox=0,oy=0,moved=0;
 el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();
  if(TEDIT){pid=e.pointerId;try{el.setPointerCapture(pid)}catch(_){}TSEL=id;tcSelUI();const r=el.getBoundingClientRect();ox=e.clientX-(r.left+r.width/2);oy=e.clientY-(r.top+r.height/2);return}
  if(pid>=0)return;pid=e.pointerId;try{el.setPointerCapture(pid)}catch(_){}el.classList.add('on');
  if(d.t=='pad')padSet(el,e);
  else if(d.t=='dash')mdash();
  else if(d.t=='upper'||d.t=='slam'){const kk=d.t=='upper'?'up':'dn';kdown(kk);kdown('m1');setTimeout(()=>{kup(kk);kup('m1')},170)}
  else if(d.t=='aim')tcAimFrom(el,e);
  else if(d.t=='menu')tcMenu();
  else if(d.t=='fs'){try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch(_){}}
  else if(d.key){kdown(d.key);if(d.ad)MA.raw=null}});
 el.addEventListener('pointermove',e=>{if(pid!=e.pointerId)return;
  if(TEDIT){const vw=innerWidth,vh=innerHeight;TLAY[id]=[clamp((e.clientX-ox)/vw,.02,.98),clamp((e.clientY-oy)/vh,.04,.97)];tcLay();return}
  if(d.t=='pad')padSet(el,e);else if(d.t=='aim')tcAimFrom(el,e);else if(d.ad)tcAimFrom(el,e)});
 const end=e=>{if(pid!=e.pointerId)return;pid=-1;el.classList.remove('on');if(TEDIT){tSave();return}
  if(d.t=='pad'){kup('l');kup('r');el.classList.remove('L','R')}
  else if(d.t=='aim'){MA.until=performance.now()+700}
  else if(d.key){kup(d.key);if(d.ad&&MA.until==Infinity)MA.until=performance.now()+450}};
 el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('lostpointercapture',end)}
function padSet(el,e){const r=el.getBoundingClientRect(),dx=(e.clientX-(r.left+r.width/2))/r.width,l=dx<-.1,rr=dx>.1;K[KB.l]=l?1:0;K[KB.r]=rr?1:0;el.classList.toggle('L',l);el.classList.toggle('R',rr)}
function tcMenu(){if(confirm('Leave the match and go back to the menu?')){for(const k of['l','r','jump','block','m1','s0','s1','s2','ult','up','dn'])kup(k);back()}}
/* ---- aim (with assist) ---- */
function tapAim(t){const r=C.getBoundingClientRect(),x=(t.clientX-r.left)/r.width*W,y=(t.clientY-r.top)/r.height*H;MA.abs={x,y};MA.until=performance.now()+1800;MA.raw=null}
function mobAim(){if(!(CT==1)||state!='fight')return;const me=ME||P,op=me==P?O:P;if(!me||!op)return;const px=me.x,py=me.y-14,ox=op.x,oy=op.y-14,now=performance.now();
 let raw=null;if(now<MA.until){if(MA.raw)raw=MA.raw;else if(MA.abs)raw={a:Math.atan2(MA.abs.y-py,MA.abs.x-px),d:Math.hypot(MA.abs.x-px,MA.abs.y-py)}}
 const dOp=Math.hypot(ox-px,oy-py),aOp=Math.atan2(oy-py,ox-px);let ax,ay;
 if(raw){let a=raw.a,d=raw.d;if(TAS>0){const df=Math.atan2(Math.sin(aOp-a),Math.cos(aOp-a)),cone=TAS==2?.62:.3;if(Math.abs(df)<cone){if(TAS==2){a=aOp;d=dOp}else a=a+df*.6}}ax=px+Math.cos(a)*d;ay=py+Math.sin(a)*d}
 else if(TAS==2||(TAS==1&&dOp<160)){ax=ox;ay=oy}else{ax=px+(ox>=px?1:-1)*60;ay=py}
 mx=clamp(ax,0,W);my=clamp(ay,0,H)}
/* ---- per-frame UI update ---- */
let tPrev='';
function tcTick(){requestAnimationFrame(tcTick);if(!tcBox)return;{const on=tcZ().on;if(on!==tZon){tZon=on;tcLay()}}const fight=state=='fight',vis=(CT==1&&fight)||TEDIT;tcBox.style.display=vis?'block':'none';
 if(state=='over'&&tPrev!='over')overAt=performance.now();tPrev=state;
 const portrait=CT==1&&innerHeight>innerWidth*1.05&&state!='set';tcRot.style.display=portrait?'flex':'none';
 const nb=CT==1&&['select','opts','code','wait'].includes(state);tcBack.style.display=nb?'block':'none';
 if(vis&&fight&&!TEDIT){const me=ME||P;if(me&&me.cd){for(let k=0;k<3;k++){const el=TEL['s'+k],cd=typeof cdOf=='function'?cdOf(me,k):1,r=cd>0?clamp(me.cd[k]/cd,0,1):0;el.firstChild.style.height=(r*100)+'%'}
  const rdy=me.ult>=100||(me.sk&&(me.om||0)>=100)||(me.g5&&me.ult>0);TEL.ult.classList.toggle('rdy',!!rdy);TEL.ult.firstChild.style.height=rdy?'0%':(100-clamp(me.ult,0,100))+'%'}
  if(tcAimDot){const raw=performance.now()<MA.until&&(MA.raw||MA.abs);if(raw&&me){const r=C.getBoundingClientRect();tcAimDot.style.display='block';tcAimDot.style.left=(r.left+mx/W*r.width)+'px';tcAimDot.style.top=(r.top+my/H*r.height)+'px'}else tcAimDot.style.display='none'}}}
/* ---- canvas touch -> mouse (menus / settings / tap aim) ---- */
const tpos=t=>({clientX:t.clientX,clientY:t.clientY,button:0,preventDefault(){}});
function mcode(){const v=prompt('ROOM CODE (4 characters)');if(v===null){state='menu';return}const c=v.trim().toUpperCase();if(/^[A-Z0-9]{4}$/.test(c)){codeIn=c;code=c;goOnline('guest')}}
/* ---- settings: tabs + mobile page ---- */
const TAIMN=['DRAG ON BUTTONS','AIM STICK','TAP SCREEN'],TASN=['OFF','LOW','HIGH'];
const MROWS=[['AIM MODE','c'],['AIM ASSIST','c'],['BUTTON SIZE','s'],['BUTTON OPACITY','s'],['EDIT BUTTON LAYOUT','a'],['RESET MOBILE SETTINGS','a'],['BACK','a']];
const mRY=i=>36+i*15.5;
function tabHit(){if(my>=3&&my<17){if(mx>=6&&mx<60)return 0;if(mx>=62&&mx<116)return 1}return-1}
function setCT(v){if(CT!=v){CT=v;tSave();sfx('m');tcLay()}}
function mHit(){if(mx>=8&&mx<312)for(let i=0;i<MROWS.length;i++)if(my>=mRY(i)-2&&my<mRY(i)+12)return i;return-1}
function mSlider(i,v){if(i==2)TSZ=clamp(Math.round((.5+clamp(v,0,1)*1.2)*20)/20,.5,1.7);else TOP=clamp(Math.round((.2+clamp(v,0,1)*.8)*20)/20,.2,1);tSave();tcLay();tcBox&&tcBox.style.setProperty('--op',TOP)}
function mAct(i,d){sfx('m');if(i==0){TAIM=(TAIM+d+3)%3;tSave();tcLay()}else if(i==1){TAS=(TAS+d+3)%3;tSave()}else if(i==2||i==3){mSlider(i,((i==2?(TSZ-.5)/1.2:(TOP-.2)/.8))+d*.05)}
 else if(i==4){CT=1;tcEdit(1)}else if(i==5){TAIM=0;TAS=2;TSZ=1;TOP=.7;TLAY={};TLS={};THID={};tSave();tcLay();sWarn='MOBILE SETTINGS RESET'}else if(i==6)setBack()}
function setKey(e,c){if(c=='Tab'&&sCap<0){e.preventDefault();setCT(CT?0:1);return}
 if(CT==0){setKey0(e,c);return}e.preventDefault();if(TEDIT)return;
 if(c=='Escape'){setBack();return}if(c=='KeyW'||c=='ArrowUp'){mSel=(mSel+MROWS.length-1)%MROWS.length;sfx('m');return}if(c=='KeyS'||c=='ArrowDown'){mSel=(mSel+1)%MROWS.length;sfx('m');return}
 const d=(c=='KeyD'||c=='ArrowRight')?1:(c=='KeyA'||c=='ArrowLeft')?-1:0;if(d&&mSel<4){mAct(mSel,d);return}if(e.repeat)return;if((c=='Enter'||c=='Space')&&mSel>=4)mAct(mSel,1)}
function setMove(){if(CT==0){setMove0();return}if(sDrag>=100){mSlider(sDrag-100,(mx-180)/96);return}const h=mHit();if(h>=0)mSel=h}
function setMouse(e){if(e.button==0&&sCap<0){const t=tabHit();if(t>=0){setCT(t);return}}if(CT==0){setMouse0(e);return}if(TEDIT||e.button!=0)return;const h=mHit();if(h<0)return;mSel=h;
 if(h==2||h==3){sDrag=100+h;mSlider(h,(mx-180)/96)}else if(h<2){mAct(h,mx<200?-1:1)}else mAct(h,1)}
