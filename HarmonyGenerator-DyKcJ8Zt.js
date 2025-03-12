import{d as e,u as a,r as o,w as l,I as n,J as t,K as s,L as r,N as c,B as d,O as i,c as u,P as m,Q as p,R as f,S as _,T as k,U as v,b as h,z as y,e as b,o as g,f as V,g as x,h as w,l as F,s as U,j as C,V as P,x as S,v as T,W as B,i as M,F as z,k as $,X as j,Y as O,Z as R,m as D,$ as H,a0 as E,t as A,a as G,a1 as I,a2 as J,C as K,a3 as L,a4 as N,n as Q,a5 as W,_ as X,a6 as Y,a7 as Z,M as q,a8 as ee,y as ae,a9 as oe,A as le}from"./index-Blx-l8EN.js";import{_ as ne}from"./VDialog.vue_vue_type_style_index_0_lang-BP1l6pfz.js";const te={genDialog:"_genDialog_e91fb18",palette:"_palette_813f3fa",numbers:"_numbers_fe9ef90"},se={class:"color-picker__pickers"},re={class:"color-picker__canvas"},ce={key:0,class:"color-picker__mask"},de={class:"color-picker__edits"},ie={class:"color-picker__hex-input"},ue={class:"color-picker__hsb-inputs"},me=["name","max","onUpdate:modelValue"],pe={class:"color-picker__variants"},fe=e({__name:"ColorPicker",props:{show:{type:Boolean,default:!1},showModifiers:{},modelValue:{},modelModifiers:{}},emits:["update:show","update:modelValue"],setup(e){const G=a(e,"show"),I=o("wheel"),J=o(),K=o(),L=o(),N=o(0),Q=()=>{var e;"wheel"===u(I)&&K.value?N.value=O(R(null==(e=J.value)?void 0:e.overlayContentRef,"--wheel-width")/(2*t),2):N.value=0};l(I,(()=>Q()),{flush:"post"}),n((()=>{var e,a;null==(a=null==(e=J.value)?void 0:e.overlayContentRef)||a.style.setProperty("--canvas-size",`${t}px`),Q()}));const W=s([0,r[1],r[2]]),X=(e,a=!0)=>{e=u(e);const o=D("string"==typeof e?H(e):e,a?e=>m(e,2):e=>e);Object.assign(W,o)},Y=c({get:()=>i(W),set(e){e!==Y.value&&d(e)&&X(e)}}),Z=c((()=>i([W[0],r[1],r[2]]))),q=s({top:"0",left:"0",background:""}),ee=c((()=>({background:`linear-gradient(0deg, #000, #0000), linear-gradient(90deg, #ffff, #fff0), ${Z.value}`}))),ae=o({}),oe=c((()=>"rect"===u(I)?{o:e=>{W[1]=p(e.x,0,100,0,r[1],2),W[2]=p(e.y,0,100,r[2],0,2)},l:()=>({top:r[2]-W[2]+"%",left:W[1]+"%",background:i(W)}),t:e=>{W[0]=m(e,2)},i:()=>({background:Z.value})}:"rounded"===u(I)?{o:e=>{const{deg:a,radius:o}=_(p(e.y,0,100,-1,1,4),p(e.x,0,100,-1,1,4));W[0]=k(a+90,360),W[1]=p(o,0,1,0,r[1],2)},l:()=>{const{x:e,y:a}=f(W[1],W[0]-90,2);return{top:p(a,-r[1],r[1],0,100,1)+"%",left:p(e,-r[1],r[1],0,100,1)+"%",background:i(W)}},t:e=>{W[2]=m(e,2)},i:()=>({background:i([0,0,W[2]])})}:{o:e=>{const{deg:a}=_(p(e.y,0,100,-1,1,4),p(e.x,0,100,-1,1,4),2);W[0]=k(a+90,360)},l:()=>{const{x:e,y:a}=f(50-N.value,W[0]-90);return{top:a+50+"%",left:e+50+"%",background:Z.value}},u:e=>{W[1]=p(e.x,0,100,0,r[1],2),W[2]=p(e.y,0,100,r[2],0,2)},i:()=>({left:p(W[1],0,r[1],0,100,2)+"%",top:p(W[2],0,r[2],100,0,2)+"%",background:Y.value})})),le={};n((()=>{var e;const a=null==(e=K.value)?void 0:e.getContext("2d");if(!a)return;const o=a.createLinearGradient(0,0,t,0);o.addColorStop(0,"#fff"),o.addColorStop(1,"#fff0"),le.m=o;const l=a.createLinearGradient(0,0,0,t);l.addColorStop(0,"#0000"),l.addColorStop(1,"#000"),le.p=l;const n=a.createConicGradient(-Math.PI/2,t/2,t/2),s=["#f00","#ff0","#0f0","#0ff","#00f","#f0f","#f00"];s.forEach(((e,a)=>n.addColorStop(a/(s.length-1),e))),le._=n}));const te=()=>{var e;const a=null==(e=K.value)?void 0:e.getContext("2d");a&&a.clearRect(0,0,t,t)},fe=e=>{var a;const o=null==(a=K.value)?void 0:a.getContext("2d");o&&(o.fillStyle=u(e),o.fillRect(0,0,t,t))},_e=c((()=>{var e;const a=null==(e=K.value)?void 0:e.getContext("2d");if(a)return"rect"===u(I)?()=>{te(),fe(Z),fe(le.m),fe(le.p)}:"rounded"===u(I)?()=>{te(),fe(le._),fe("#000000"+p(W[2],0,r[2],255,0,0).toString(16));const e=t/2,o=a.createRadialGradient(e,e,0,e,e,e),l=i([0,0,W[2]]);o.addColorStop(0,l),o.addColorStop(1,l+"00"),fe(o)}:(te(),fe(le._),null)})),ke=()=>{var e;Object.assign(q,oe.value.l()),ae.value=oe.value.i(),null==(e=_e.value)||e.call(_e)};l((()=>[u(I),W]),ke,{deep:!0,flush:"post"}),n((()=>{ke()}));const ve=v((()=>{const e=e=>{oe.value.o(e)},{start:a}=h(K,{containerElement:K,onStart:e,onMove:e});return a})),he=v((()=>{const e=e=>{oe.value.u(e)},{start:a}=h(L,{containerElement:L,onStart:e,onMove:e});return a})),ye=a(e,"modelValue");return y(u(ye))||X(ye,!1),l(W,(e=>{ye.value=e}),{immediate:!0}),l(ye,(e=>{X(e)}),{deep:!0}),(e,a)=>(g(),b(ne,{ref_key:"dialogRef",ref:J,overlayProps:{contentClass:["color-picker",`color-picker--${I.value}`]},title:"Color Picker",modelValue:G.value,"onUpdate:modelValue":a[7]||(a[7]=e=>G.value=e)},{content:V((()=>[x("div",se,[x("div",re,[a[0]||(U(-1),(a[0]=x("canvas",{ref_key:"canvasPickerRef",ref:K,width:u(t),height:u(t)},null,8,["width","height"])).cacheIndex=0,U(1),a[0]),"wheel"===I.value?(g(),w("div",ce)):F("",!0),x("div",{class:"color-picker__thumb",style:C(q),onPointerdown:a[1]||(a[1]=(...e)=>u(ve)&&u(ve)(...e))},null,36)]),"wheel"!==I.value?(g(),b(P,{key:0,showRange:!1,min:"0",max:"rect"===I.value?u(r)[0]:u(r)[2],trackerBackground:"rect"===I.value?"linear-gradient(to right, #F00, #FF0, #0F0, #0FF, #00F, #F0F, #F00)":"linear-gradient(to right, #000, #fff)",thumbBackground:ae.value.background,"model-value":"rect"===I.value?W[0]:W[2],"onUpdate:modelValue":oe.value.t},null,8,["max","trackerBackground","thumbBackground","model-value","onUpdate:modelValue"])):(g(),w("div",{key:1,ref_key:"secondPickerRef",ref:L,class:"color-picker__rect-picker",style:C(ee.value)},[x("div",{class:"color-picker__thumb",rectPickerThumeStyle:"",style:C(ae.value),onPointerdown:a[2]||(a[2]=(...e)=>u(he)&&u(he)(...e))},null,36)],4))]),x("div",de,[x("div",{class:"color-picker__preview",style:C({background:Y.value})},null,4),x("label",ie,[a[8]||(a[8]=S(" Hex ")),T(x("input",{name:"color-piker-hex",maxlength:"7",size:"7","onUpdate:modelValue":a[3]||(a[3]=e=>Y.value=e)},null,512),[[B,Y.value,void 0,{lazy:!0}]])]),x("div",ue,[(g(),w(z,null,M([["hue","色調"],["sat","彩度"],["bri","亮度"]],(([e,a],o,l,n)=>{const t=[W[o]];if(n&&n.key===e&&E(n,t))return n;const s=(g(),w("label",{key:e},[S(A(a)+" ",1),T(x("input",{name:`color-piker-${e}`,type:"number",inputmode:"decimal",min:"0",max:u(r)[o],step:"any","onUpdate:modelValue":e=>W[o]=e},null,8,me),[[B,W[o],void 0,{lazy:!0}]])]));return s.memo=t,s}),a,4),64))]),x("div",pe,[a[9]||(a[9]=S(" 樣式 ")),$(j,{items:["rect","rounded","wheel"],modelValue:I.value,"onUpdate:modelValue":a[6]||(a[6]=e=>I.value=e)},null,8,["modelValue"])])])])),k:1},8,["overlayProps","modelValue"]))}}),_e=["aria-label","onClick"],ke=["min","max"],ve=e({__name:"HarmonyGenerator",props:{modelValue:{type:Boolean},modelModifiers:{}},emits:["update:modelValue"],setup(e){const n=a(e,"modelValue"),t=o(!1),d=G(),i=o([0,r[1],r[2]]),m=s({method:0,num:6}),p=c((()=>{const e=I(J[m.method]);return D(e([...u(i)],m.num),(e=>K(L(e))))})),f=o(!0),_=()=>{d.v(u(f)?u(p):u(v))};l((()=>[u(f),u(p)]),_);const k=()=>{d.v(u(p)),h(),le(n)},v=o([[]]),h=()=>{v.value=D(d.h,(e=>e.V))};return l(n,(e=>{e?(h(),_()):d.v(u(v))}),{immediate:!0}),(e,a)=>(g(),b(ne,{"overlay-props":{contentClass:u(te).genDialog},title:"調和調色盤",modelValue:n.value,"onUpdate:modelValue":a[10]||(a[10]=e=>n.value=e)},{actions:V((()=>[x("label",null,[T(x("input",{type:"checkbox",name:"preview","onUpdate:modelValue":a[8]||(a[8]=e=>f.value=e)},null,512),[[ae,f.value]]),a[14]||(a[14]=S(" 預覽 "))]),a[9]||(U(-1),(a[9]=$(X,{onClick:k,text:"確定"})).cacheIndex=9,U(1),a[9])])),default:V((()=>[N(p.value,(()=>(g(),w("div",{class:Q(u(te).palette)},[$(W,{location:"top",text:"Copied",openOnHover:!1,openOnClick:"",eager:!1},{activator:V((({handleClick:e})=>[(g(!0),w(z,null,M(p.value,((o,l)=>(g(),w("button",{key:l,type:"button",style:C({background:o}),"aria-label":`color ${o}`,onClick:a=>{var o;o=l,oe(u(p)[o]),e(a)}},a[11]||(a[11]=[x("div",{class:"btn__overlay"},null,-1)]),12,_e)))),128))])),k:1})],2))),a,0),N([p.value[0]],(()=>$(X,{style:C({color:u(Y)(u(Z)(p.value[0]))>127?"#000":"#FFF",background:p.value[0]}),"prepend-icon":"eyedropper",text:"開啟color picker",onClick:a[1]||(a[1]=e=>t.value=!t.value)},null,8,["style"])),a,2),$(fe,{modelValue:i.value,"onUpdate:modelValue":a[3]||(a[3]=e=>i.value=e),show:t.value,"onUpdate:show":a[4]||(a[4]=e=>t.value=e)},null,8,["modelValue","show"]),x("div",null,[a[12]||(a[12]=S(" 調和方法 ")),$(j,{items:u(J),index:m.method,"onUpdate:index":a[5]||(a[5]=e=>m.method=e)},null,8,["items","index"])]),1<=m.method&&m.method<=3?N([m],(()=>(g(),w("div",{key:0,class:Q(u(te).numbers)},[a[13]||(a[13]=x("label",{for:"harmony-num"},"數量",-1)),T(x("input",{id:"harmony-num",name:"harmony-num",type:"number",min:u(ee),max:u(q),"onUpdate:modelValue":a[6]||(a[6]=e=>m.num=e)},null,8,ke),[[B,m.num,void 0,{lazy:!0,number:!0}]])],2))),a,7):F("",!0)])),k:1},8,["overlay-props","modelValue"]))}});export{ve as default};
