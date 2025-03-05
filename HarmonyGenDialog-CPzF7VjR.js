import{d as e,u as a,r as l,w as o,o as n,C as s,a as t,H as r,c,h as d,i,b as u,e as m,f as p,g as _,m as k,p as f,t as h,j as v,k as y,l as g,n as b,q as V,s as x,v as w,x as F,y as U,z,_ as C,A as S,B as P,D as T,F as q,E as B,G as M,I as O,J as R,K as $,L as j,M as D,N as H,O as E,P as G,Q as A,R as I,S as J,T as K,U as L,V as N,W as Q,X as W,Y as X,Z as Y,$ as Z,a0 as ee,a1 as ae,a2 as le,a3 as oe,a4 as ne}from"./index-DM-sCobm.js";const se={genDialog:"_genDialog_zqo81_1",header:"_header_zqo81_10",content:"_content_zqo81_34",palette:"_palette_zqo81_48",numbers:"_numbers_zqo81_63",buttons:"_buttons_zqo81_73"},te={class:"color-picker__pickers"},re={class:"color-picker__canvas"},ce={key:0,class:"color-picker__mask"},de={class:"color-picker__edits"},ie={class:"color-picker__hex-input"},ue={class:"color-picker__hsb-inputs"},me=["name","max","onUpdate:modelValue"],pe={class:"color-picker__variants"},_e=e({__name:"ColorPicker",props:{show:{type:Boolean,default:!1},showModifiers:{},modelValue:{},modelModifiers:{}},emits:["update:show","update:modelValue"],setup(e){const A=a(e,"show"),I=l("wheel"),J=l(),K=l(),L=l(),N=l(0),Q=()=>{var e;"wheel"===u(I)&&K.value?N.value=D(H(null==(e=J.value)?void 0:e.contentRef,"--wheel-width")/(2*s),2):N.value=0};o(I,(()=>Q()),{flush:"post"}),n((()=>{J.value.contentRef.style.setProperty("--canvas-size",`${s}px`),Q()}));const W=t([0,r[1],r[2]]),X=(e,a=!0)=>{e=u(e);const l=E("string"==typeof e?G(e):e,a?e=>p(e,2):e=>e);Object.assign(W,l)},Y=c({get:()=>d(W),set(e){e!==Y.value&&i(e)&&X(e)}}),Z=c((()=>d([W[0],r[1],r[2]]))),ee=t({top:"0",left:"0",background:""}),ae=c((()=>({background:`linear-gradient(0deg, #000, #0000), linear-gradient(90deg, #ffff, #fff0), ${Z.value}`}))),le=l({}),oe=c((()=>"rect"===u(I)?{l:e=>{W[1]=m(e.x,0,100,0,r[1],2),W[2]=m(e.y,0,100,r[2],0,2)},o:()=>({top:r[2]-W[2]+"%",left:W[1]+"%",background:d(W)}),t:e=>{W[0]=p(e,2)},i:()=>({background:Z.value})}:"rounded"===u(I)?{l:e=>{const{deg:a,radius:l}=_(m(e.y,0,100,-1,1,4),m(e.x,0,100,-1,1,4));W[0]=k(a+90,360),W[1]=m(l,0,1,0,r[1],2)},o:()=>{const{x:e,y:a}=f(W[1],W[0]-90,2);return{top:m(a,-r[1],r[1],0,100,1)+"%",left:m(e,-r[1],r[1],0,100,1)+"%",background:d(W)}},t:e=>{W[2]=p(e,2)},i:()=>({background:d([0,0,W[2]])})}:{l:e=>{const{deg:a}=_(m(e.y,0,100,-1,1,4),m(e.x,0,100,-1,1,4),2);W[0]=k(a+90,360)},o:()=>{const{x:e,y:a}=f(50-N.value,W[0]-90);return{top:a+50+"%",left:e+50+"%",background:Z.value}},u:e=>{W[1]=m(e.x,0,100,0,r[1],2),W[2]=m(e.y,0,100,r[2],0,2)},i:()=>({left:m(W[1],0,r[1],0,100,2)+"%",top:m(W[2],0,r[2],100,0,2)+"%",background:Y.value})})),ne={};n((()=>{var e;const a=null==(e=K.value)?void 0:e.getContext("2d");if(!a)return;const l=a.createLinearGradient(0,0,s,0);l.addColorStop(0,"#fff"),l.addColorStop(1,"#fff0"),ne.m=l;const o=a.createLinearGradient(0,0,0,s);o.addColorStop(0,"#0000"),o.addColorStop(1,"#000"),ne.p=o;const n=a.createConicGradient(-Math.PI/2,s/2,s/2),t=["#f00","#ff0","#0f0","#0ff","#00f","#f0f","#f00"];t.forEach(((e,a)=>n.addColorStop(a/(t.length-1),e))),ne._=n}));const se=()=>{var e;const a=null==(e=K.value)?void 0:e.getContext("2d");a&&a.clearRect(0,0,s,s)},_e=e=>{var a;const l=null==(a=K.value)?void 0:a.getContext("2d");l&&(l.fillStyle=u(e),l.fillRect(0,0,s,s))},ke=c((()=>{var e;const a=null==(e=K.value)?void 0:e.getContext("2d");if(a)return"rect"===u(I)?()=>{se(),_e(Z),_e(ne.m),_e(ne.p)}:"rounded"===u(I)?()=>{se(),_e(ne._),_e("#000000"+m(W[2],0,r[2],255,0,0).toString(16));const e=s/2,l=a.createRadialGradient(e,e,0,e,e,e),o=d([0,0,W[2]]);l.addColorStop(0,o),l.addColorStop(1,o+"00"),_e(l)}:(se(),_e(ne._),null)})),fe=()=>{var e;Object.assign(ee,oe.value.o()),le.value=oe.value.i(),null==(e=ke.value)||e.call(ke)};o((()=>[u(I),W]),fe,{deep:!0,flush:"post"}),n(fe);const he=h((()=>{const e=e=>{oe.value.l(e)},{start:a}=v(K,{containerElement:K,onStart:e,onMove:e});return a})),ve=h((()=>{const e=e=>{oe.value.u(e)},{start:a}=v(L,{containerElement:L,onStart:e,onMove:e});return a})),ye=a(e,"modelValue");return y(u(ye))||X(ye,!1),o(W,(e=>{ye.value=e}),{immediate:!0}),o(ye,(e=>X(e)),{deep:!0}),(e,a)=>(g(),b(j,{ref_key:"containerRef",ref:J,role:"dialog",eager:!0,transition:"slide-y",transparent:"","content-class":["color-picker",`color-picker--${I.value}`],modelValue:A.value,"onUpdate:modelValue":a[7]||(a[7]=e=>A.value=e)},{default:V((()=>[x("div",te,[x("div",re,[a[0]||(w(-1),(a[0]=x("canvas",{ref_key:"canvasPickerRef",ref:K,width:u(s),height:u(s)},null,8,["width","height"])).cacheIndex=0,w(1),a[0]),"wheel"===I.value?(g(),F("div",ce)):U("",!0),x("div",{class:"color-picker__thumb",style:z(ee),onPointerdown:a[1]||(a[1]=(...e)=>u(he)&&u(he)(...e))},null,36)]),"wheel"!==I.value?(g(),b(C,{key:0,showRange:!1,min:"0",max:"rect"===I.value?u(r)[0]:u(r)[2],trackerBackground:"rect"===I.value?"linear-gradient(to right, #F00, #FF0, #0F0, #0FF, #00F, #F0F, #F00)":"linear-gradient(to right, #000, #fff)",thumbBackground:le.value.background,"model-value":"rect"===I.value?W[0]:W[2],"onUpdate:modelValue":oe.value.t},null,8,["max","trackerBackground","thumbBackground","model-value","onUpdate:modelValue"])):(g(),F("div",{key:1,ref_key:"secondPickerRef",ref:L,class:"color-picker__rect-picker",style:z(ae.value)},[x("div",{class:"color-picker__thumb",rectPickerThumeStyle:"",style:z(le.value),onPointerdown:a[2]||(a[2]=(...e)=>u(ve)&&u(ve)(...e))},null,36)],4))]),x("div",de,[x("div",{class:"color-picker__preview",style:z({background:Y.value})},null,4),x("label",ie,[a[8]||(a[8]=S(" Hex ")),P(x("input",{name:"color-piker-hex",maxlength:"7",size:"7","onUpdate:modelValue":a[3]||(a[3]=e=>Y.value=e)},null,512),[[T,Y.value,void 0,{lazy:!0}]])]),x("div",ue,[(g(),F(q,null,B([["hue","色調"],["sat","彩度"],["bri","亮度"]],(([e,a],l,o,n)=>{const s=[W[l]];if(n&&n.key===e&&M(n,s))return n;const t=(g(),F("label",{key:e},[S(O(a)+" ",1),P(x("input",{name:`color-piker-${e}`,type:"number",inputmode:"decimal",min:"0",max:u(r)[l],step:"any","onUpdate:modelValue":e=>W[l]=e},null,8,me),[[T,W[l],void 0,{lazy:!0}]])]));return t.memo=s,t}),a,4),64))]),x("div",pe,[a[9]||(a[9]=S(" 樣式 ")),R($,{items:["rect","rounded","wheel"],modelValue:I.value,"onUpdate:modelValue":a[6]||(a[6]=e=>I.value=e)},null,8,["modelValue"])])])])),k:1},8,["content-class","modelValue"]))}}),ke=["min","max"],fe=e({__name:"HarmonyGenDialog",props:{modelValue:{type:Boolean},modelModifiers:{}},emits:["update:modelValue"],setup(e){const n=a(e,"modelValue"),s=l(!1),d=A(),i=l([0,r[1],r[2]]),m=t({method:0,num:6}),p=c((()=>{const e=I(J[m.method]);return E(e([...u(i)],m.num),(e=>K(L(e))))})),_=l(!0),k=()=>{d.h(u(_)?u(p):u(h))};o((()=>[u(_),u(p)]),k);const f=()=>{d.h(u(p)),v(),ne(n)},h=l([[]]),v=()=>{h.value=E(d.v,(e=>e.V))};return o(n,(e=>{e?(v(),k()):d.h(u(h))}),{immediate:!0}),(e,a)=>(g(),b(j,{"content-class":u(se).genDialog,role:"dialog",eager:!0,transition:"slide-y",transparent:"",modelValue:n.value,"onUpdate:modelValue":a[12]||(a[12]=e=>n.value=e)},{default:V((()=>[a[0]||(w(-1),(a[0]=x("header",{class:N(u(se).header)},[a[13]||(a[13]=x("h2",null,"調和調色盤",-1)),R(Q,{icon:"x-lg","aria-label":"關閉",onClick:e=>n.value=!1},null,8,["onClick"])],2)).cacheIndex=0,w(1),a[0]),x("div",{class:N(u(se).content)},[W(p.value,(()=>(g(),F("div",{class:N(u(se).palette)},[R(X,{location:"top",text:"Copied",openOnHover:!1,openOnClick:"",eager:!1},{activator:V((({handleClick:e})=>[(g(!0),F(q,null,B(p.value,((a,l)=>(g(),b(Q,{key:l,style:z({background:a}),ripple:!1,onClick:a=>{var o;o=l,oe(u(p)[o]),e(a)}},null,8,["style","onClick"])))),128))])),k:1})],2))),a,1),W([p.value[0]],(()=>R(Q,{style:z({color:u(Y)(u(Z)(p.value[0]))>127?"#000":"#FFF",background:p.value[0]}),"prepend-icon":"eyedropper",text:"開啟color picker",onClick:a[2]||(a[2]=e=>s.value=!s.value)},null,8,["style"])),a,3),R(_e,{modelValue:i.value,"onUpdate:modelValue":a[4]||(a[4]=e=>i.value=e),show:s.value,"onUpdate:show":a[5]||(a[5]=e=>s.value=e)},null,8,["modelValue","show"]),x("div",null,[a[14]||(a[14]=S(" 調和方法 ")),R($,{items:u(J),index:m.method,"onUpdate:index":a[6]||(a[6]=e=>m.method=e)},null,8,["items","index"])]),1<=m.method&&m.method<=3?W([m],(()=>(g(),F("div",{key:0,class:N(u(se).numbers)},[a[15]||(a[15]=x("label",{for:"harmony-num"},"數量",-1)),P(x("input",{id:"harmony-num",name:"harmony-num",type:"number",min:u(ee),max:u(ae),"onUpdate:modelValue":a[7]||(a[7]=e=>m.num=e)},null,8,ke),[[T,m.num,void 0,{lazy:!0,number:!0}]])],2))),a,8):U("",!0),a[9]||(w(-1),(a[9]=x("div",{class:"spacer"})).cacheIndex=9,w(1),a[9]),x("div",{class:N(u(se).buttons)},[x("label",null,[P(x("input",{type:"checkbox",name:"preview","onUpdate:modelValue":a[10]||(a[10]=e=>_.value=e)},null,512),[[le,_.value]]),a[16]||(a[16]=S(" 預覽 "))]),a[11]||(w(-1),(a[11]=R(Q,{onClick:f,text:"確定"})).cacheIndex=11,w(1),a[11])],2)],2)])),k:1},8,["content-class","modelValue"]))}});export{fe as default};
