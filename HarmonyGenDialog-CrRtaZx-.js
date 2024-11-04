import{d as e,u as a,r as l,w as o,o as n,C as s,a as t,H as r,c,h as d,i,b as u,e as m,f as p,g as _,m as k,p as f,j as h,k as v,l as b,n as y,q as g,s as x,t as V,v as w,x as F,y as U,_ as $,z as C,A as S,B as M,F as T,D as A,E as B,G as z,I as D,J as E,K as P,L as R,M as j,N as H,O,P as G,Q as q,R as I,S as J,T as K,U as L,V as N,W as Q,X as W,Y as X,Z as Y,$ as Z,a0 as ee,a1 as ae,a2 as le}from"./index-Biu7bRIp.js";const oe={class:"color-picker__pickers"},ne={class:"color-picker__canvas"},se={key:0,class:"color-picker__mask"},te={class:"color-picker__edits"},re={class:"color-picker__hex-input"},ce={class:"color-picker__hsb-inputs"},de=["name","max","onUpdate:modelValue"],ie={class:"color-picker__variants"},ue=e({__name:"ColorPicker",props:{show:{type:Boolean,default:!1},showModifiers:{},modelValue:{},modelModifiers:{}},emits:["update:show","update:modelValue"],setup(e){const O=a(e,"show"),G=l("wheel"),q=l(),I=l(),J=l(),K=l(0),L=()=>{var e;"wheel"===u(G)&&I.value?K.value=R(j(null==(e=q.value)?void 0:e.contentRef,"--wheel-width")/(2*s),2):K.value=0};o(G,(()=>L()),{flush:"post"}),n((()=>{q.value.contentRef.style.setProperty("--canvas-size",`${s}px`),L()}));const N=t([0,r[1],r[2]]),Q=(e,a=!0)=>{let l="string"==typeof(e=u(e))?H(e):e;a&&(l=l.map((e=>p(e,2)))),Object.assign(N,l)},W=c({get:()=>d(N),set(e){e!==W.value&&i(e)&&Q(e)}}),X=c((()=>d([N[0],r[1],r[2]]))),Y=t({top:"0",left:"0",background:""}),Z=c((()=>({background:`linear-gradient(0deg, #000, #0000), linear-gradient(90deg, #ffff, #fff0), ${X.value}`}))),ee=l({}),ae=c((()=>"rect"===u(G)?{l:e=>{N[1]=m(e.x,0,100,0,r[1],2),N[2]=m(e.y,0,100,r[2],0,2)},o:()=>({top:r[2]-N[2]+"%",left:`${N[1]}%`,background:d(N)}),t:e=>{N[0]=p(e,2)},i:()=>({background:X.value})}:"rounded"===u(G)?{l:e=>{const{deg:a,radius:l}=_(m(e.y,0,100,-1,1,4),m(e.x,0,100,-1,1,4));N[0]=k(a+90,360),N[1]=m(l,0,1,0,r[1],2)},o:()=>{const{x:e,y:a}=f(N[1],N[0]-90,2);return{top:`${m(a,-r[1],r[1],0,100,1)}%`,left:`${m(e,-r[1],r[1],0,100,1)}%`,background:d(N)}},t:e=>{N[2]=p(e,2)},i:()=>({background:d([0,0,N[2]])})}:{l:e=>{const{deg:a}=_(m(e.y,0,100,-1,1,4),m(e.x,0,100,-1,1,4),2);N[0]=k(a+90,360)},o:()=>{const{x:e,y:a}=f(50-K.value,N[0]-90);return{top:`${a+50}%`,left:`${e+50}%`,background:X.value}},u:e=>{N[1]=m(e.x,0,100,0,r[1],2),N[2]=m(e.y,0,100,r[2],0,2)},i:()=>({left:`${p(m(N[1],0,r[1],0,100),2)}%`,top:`${p(m(N[2],0,r[2],100,0),2)}%`,background:W.value})})),le={};n((()=>{var e;const a=null==(e=I.value)?void 0:e.getContext("2d"),l=a.createLinearGradient(0,0,s,0);l.addColorStop(0,"#fff"),l.addColorStop(1,"#fff0"),le.m=l;const o=a.createLinearGradient(0,0,0,s);o.addColorStop(0,"#0000"),o.addColorStop(1,"#000"),le.p=o;const n=a.createConicGradient(-Math.PI/2,s/2,s/2),t=["#f00","#ff0","#0f0","#0ff","#00f","#f0f","#f00"];t.forEach(((e,a)=>n.addColorStop(a/(t.length-1),e))),le._=n}));const ue=()=>{var e;const a=null==(e=I.value)?void 0:e.getContext("2d");a&&a.clearRect(0,0,s,s)},me=e=>{var a;const l=null==(a=I.value)?void 0:a.getContext("2d");l&&(l.fillStyle=u(e),l.fillRect(0,0,s,s))},pe=c((()=>{var e;const a=null==(e=I.value)?void 0:e.getContext("2d");return"rect"===u(G)?()=>{ue(),me(X),me(le.m),me(le.p)}:"rounded"===u(G)?()=>{ue(),me(le._),me("#000000"+m(N[2],0,r[2],255,0,0).toString(16));const e=s/2,l=a.createRadialGradient(e,e,0,e,e,e),o=d([0,0,N[2]]);l.addColorStop(0,o),l.addColorStop(1,o+"00"),me(l)}:(ue(),me(le._),null)})),_e=()=>{var e;Object.assign(Y,ae.value.o()),ee.value=ae.value.i(),null==(e=pe.value)||e.call(pe)};o((()=>[u(G),N]),_e,{deep:!0,flush:"post"}),n(_e),(()=>{const e=e=>{ae.value.l(e)};h(I,{containerElement:I,onStart:e,onMove:e})})(),(()=>{const e=e=>{ae.value.u(e)};h(J,{containerElement:J,onStart:e,onMove:e})})();const ke=a(e,"modelValue");return v(u(ke))||Q(ke,!1),o(N,(e=>{ke.value=e}),{immediate:!0}),o(ke,(e=>Q(e)),{deep:!0}),(e,a)=>(b(),y(P,{ref_key:"containerRef",ref:q,role:"dialog",eager:!0,transition:"slide-y",transparent:"","content-class":["color-picker",`color-picker--${G.value}`],modelValue:O.value,"onUpdate:modelValue":a[5]||(a[5]=e=>O.value=e)},{default:g((()=>[x("div",oe,[x("div",ne,[a[0]||(V(-1),(a[0]=x("canvas",{ref_key:"canvasPickerRef",ref:I,width:u(s),height:u(s)},null,8,["width","height"])).cacheIndex=0,V(1),a[0]),"wheel"===G.value?(b(),w("div",se)):F("",!0),x("div",{class:"color-picker__thumb",style:U(Y)},null,4)]),"wheel"!==G.value?(b(),y($,{key:0,showRange:!1,min:"0",max:"rect"===G.value?u(r)[0]:u(r)[2],trackerBackground:"rect"===G.value?"linear-gradient(to right, #F00, #FF0, #0F0, #0FF, #00F, #F0F, #F00)":"linear-gradient(to right, #000, #fff)",thumbBackground:ee.value.background,"model-value":"rect"===G.value?N[0]:N[2],"onUpdate:modelValue":ae.value.t},null,8,["max","trackerBackground","thumbBackground","model-value","onUpdate:modelValue"])):(b(),w("div",{key:1,ref_key:"secondPickerRef",ref:J,class:"color-picker__rect-picker",style:U(Z.value)},[x("div",{class:"color-picker__thumb",rectPickerThumeStyle:"",style:U(ee.value)},null,4)],4))]),x("div",te,[x("div",{class:"color-picker__preview",style:U({background:W.value})},null,4),x("label",re,[a[6]||(a[6]=C(" Hex ")),S(x("input",{name:"color-piker-hex",maxlength:"7",size:"7","onUpdate:modelValue":a[1]||(a[1]=e=>W.value=e)},null,512),[[M,W.value,void 0,{lazy:!0}]])]),x("div",ce,[(b(),w(T,null,A([["hue","色調"],["sat","彩度"],["bri","亮度"]],(([e,a],l,o,n)=>{const s=[N[l]];if(n&&n.key===e&&B(n,s))return n;const t=(b(),w("label",{key:e},[C(z(a)+" ",1),S(x("input",{name:`color-piker-${e}`,type:"number",inputmode:"decimal",min:"0",max:u(r)[l],step:"any","onUpdate:modelValue":e=>N[l]=e},null,8,de),[[M,N[l],void 0,{lazy:!0}]])]));return t.memo=s,t}),a,2),64))]),x("div",ie,[a[7]||(a[7]=C(" 樣式 ")),D(E,{options:["rect","rounded","wheel"],modelValue:G.value,"onUpdate:modelValue":a[4]||(a[4]=e=>G.value=e)},null,8,["modelValue"])])])])),k:1},8,["content-class","modelValue"]))}}),me=["min","max"],pe=((e,a)=>{const l=e.__vccOpts||e;for(const[o,n]of a)l[o]=n;return l})(e({__name:"HarmonyGenDialog",props:{modelValue:{type:Boolean},modelModifiers:{}},emits:["update:modelValue"],setup(e){const n=a(e,"modelValue"),s=l(!1),d=O(),i=l([[]]),m=()=>{i.value=d.cards.map((e=>e.color))};o(n,(()=>{u(n)?m():d.setPlt(u(i))}),{immediate:!0});const p=l([0,r[1],r[2]]),_=t({method:0,num:6}),k=c((()=>G(q[_.method])([...u(p)],_.num).map((e=>I(J(e)))))),f=l(!0),h=()=>{d.setPlt(u(f)?u(k):u(i))};K(h);const v=()=>{h(),m(),le(n)};return(e,a)=>(b(),y(P,{"content-class":e.$style.genDialog,role:"dialog",eager:!0,transition:"slide-y",transparent:"",modelValue:n.value,"onUpdate:modelValue":a[12]||(a[12]=e=>n.value=e)},{default:g((()=>[a[0]||(V(-1),(a[0]=x("header",{class:L(e.$style.header)},[a[13]||(a[13]=x("h2",null,"調和調色盤",-1)),D(N,{icon:"close","aria-label":"關閉",onClick:e=>n.value=!1},null,8,["onClick"])],2)).cacheIndex=0,V(1),a[0]),x("div",{class:L(e.$style.content)},[Q(k.value,(()=>(b(),w("div",{class:L(e.$style.palette)},[(b(!0),w(T,null,A(k.value,((e,a)=>(b(),y(N,{key:a,style:U({background:e}),ripple:!1,onClick:e=>{return l=a,void ae(u(k)[l]);var l}},null,8,["style","onClick"])))),128))],2))),a,1),Q([k.value[0]],(()=>D(N,{style:U({color:u(W)(u(X)(k.value[0]))>127?"#000":"#FFF",background:k.value[0]}),"prepend-icon":"eyedropper",text:"開啟color picker",onClick:a[2]||(a[2]=e=>s.value=!s.value)},null,8,["style"])),a,3),D(ue,{modelValue:p.value,"onUpdate:modelValue":a[4]||(a[4]=e=>p.value=e),show:s.value,"onUpdate:show":a[5]||(a[5]=e=>s.value=e)},null,8,["modelValue","show"]),x("div",null,[a[14]||(a[14]=C(" 調和方法 ")),D(E,{options:u(q),index:_.method,"onUpdate:index":a[6]||(a[6]=e=>_.method=e)},null,8,["options","index"])]),1<=_.method&&_.method<=3?Q([_],(()=>(b(),w("div",{key:0,class:L(e.$style.numbers)},[a[15]||(a[15]=x("label",{for:"harmony-num"},"數量",-1)),S(x("input",{id:"harmony-num",name:"harmony-num",type:"number",min:u(Y),max:u(Z),"onUpdate:modelValue":a[7]||(a[7]=e=>_.num=e)},null,8,me),[[M,_.num,void 0,{lazy:!0,number:!0}]])],2))),a,8):F("",!0),a[9]||(V(-1),(a[9]=x("div",{class:"spacer"})).cacheIndex=9,V(1),a[9]),x("div",{class:L(e.$style.buttons)},[x("label",null,[S(x("input",{type:"checkbox",name:"preview","onUpdate:modelValue":a[10]||(a[10]=e=>f.value=e)},null,512),[[ee,f.value]]),a[16]||(a[16]=C(" 預覽 "))]),a[11]||(V(-1),(a[11]=D(N,{onClick:v,text:"確定"})).cacheIndex=11,V(1),a[11])],2)],2)])),k:1},8,["content-class","modelValue"]))}}),[["__cssModules",{$style:{color1:"#FAFAFA",color2:"#EAEAEA",color3:"#C0C0C0",color4:"#707070",color5:"#1D1D57",genDialog:"_genDialog_3bxm9_9",header:"_header_3bxm9_19",content:"_content_3bxm9_43",palette:"_palette_3bxm9_57",numbers:"_numbers_3bxm9_73",buttons:"_buttons_3bxm9_83"}}]]);export{pe as default};
