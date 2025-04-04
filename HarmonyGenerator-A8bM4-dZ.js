import{d as a,e as p,r as l,w as c,W as P,b as m,X as T,a as o,Y as O,c as d,T as $,Z as R,$ as H,a0 as E,a1 as Y,a2 as J,a3 as N,f as s,J as Q,U as X,h as v,o as x,j as b,q as k,m as A,p as C,s as h,H as M,x as U,t as F,k as _,B as z,L as Z,a4 as ee,O as ae,D as B,a5 as oe,F as L,v as S,a6 as le,a7 as te,K as ne,a8 as se,a9 as re,u as t,R as ce,aa as de,E as G,l as V,y as w,_ as q,ab as ie,ac as ue,N as me,ad as pe,P as _e,ae as ke,Q as fe}from"./index-BYO-e2Kd.js";import{_ as D}from"./VDialog.vue_vue_type_style_index_0_lang-CL33Fiw9.js";const e={genDialog:"_genDialog_6a0eddf",palette:"_palette_4678db8",numbers:"_numbers_83c6648"},ve={class:"color-picker__pickers"},he={class:"color-picker__canvas"},ye={key:0,class:"color-picker__mask"},be={class:"color-picker__edits"},ge={class:"color-picker__hex-input"},Ve={class:"color-picker__hsb-inputs"},we=["name","max","onUpdate:modelValue"],xe={class:"color-picker__variants"},g=a({__name:"ColorPicker",props:{show:{type:Boolean,default:!1},showModifiers:{},modelValue:{},modelModifiers:{}},emits:["update:show","update:modelValue"],setup(e){const a=p(e,"show"),t=l("wheel"),n=l(),r=l(),i=l(),u=l(0),f=()=>{var e;"wheel"===m(t)&&m(r)?u.value=le(te(null==(e=m(n))?void 0:e.overlayContentRef,"--wheel-width")/(2*T),2):u.value=0};c(t,(()=>f()),{flush:"post"}),P((()=>{var e,a;null==(a=null==(e=m(n))?void 0:e.overlayContentRef)||a.style.setProperty("--canvas-size",`${T}px`),f()}));const y=o([0,O.hsl[1],O.hsl[2]]),g=(e,a=!0)=>{e=m(e);const o=ne("string"==typeof e?se(e):e,a?e=>H(e,2):e=>e);Object.assign(y,o)},V=d({get:()=>R(y),set(e){e!==m(V)&&$(e)&&g(e)}}),w=d((()=>R([y[0],O.hsl[1],O.hsl[2]]))),j=o({top:"0",left:"0",background:""}),q=d((()=>({background:`linear-gradient(0deg, #000, #0000), linear-gradient(90deg, #ffff, #fff0), ${m(w)}`}))),K=l({}),G=d((()=>"rect"===m(t)?{u:e=>{y[1]=E(e.x,0,100,0,O.hsl[1],2),y[2]=E(e.y,0,100,O.hsl[2],0,2)},m:()=>({top:O.hsl[2]-y[2]+"%",left:y[1]+"%",background:R(y)}),p:e=>{y[0]=H(e,2)},k:()=>({background:m(w)})}:"rounded"===m(t)?{u:e=>{const{deg:a,radius:o}=J(E(e.y,0,100,-1,1,4),E(e.x,0,100,-1,1,4));y[0]=N(a+90,360),y[1]=E(o,0,1,0,O.hsl[1],2)},m:()=>{const{x:e,y:a}=Y(y[1],y[0]-90,2);return{top:E(a,-O.hsl[1],O.hsl[1],0,100,1)+"%",left:E(e,-O.hsl[1],O.hsl[1],0,100,1)+"%",background:R(y)}},p:e=>{y[2]=H(e,2)},k:()=>({background:R([0,0,y[2]])})}:{u:e=>{const{deg:a}=J(E(e.y,0,100,-1,1,4),E(e.x,0,100,-1,1,4),2);y[0]=N(a+90,360)},m:()=>{const{x:e,y:a}=Y(50-m(u),y[0]-90);return{top:a+50+"%",left:e+50+"%",background:m(w)}},v:e=>{y[1]=E(e.x,0,100,0,O.hsl[1],2),y[2]=E(e.y,0,100,O.hsl[2],0,2)},k:()=>({left:E(y[1],0,O.hsl[1],0,100,2)+"%",top:E(y[2],0,O.hsl[2],100,0,2)+"%",background:m(V)})})),W={};P((()=>{var e;const a=null==(e=m(r))?void 0:e.getContext("2d");if(!a)return;const o=a.createLinearGradient(0,0,T,0);o.addColorStop(0,"#fff"),o.addColorStop(1,"#fff0"),W.h=o;const l=a.createLinearGradient(0,0,0,T);l.addColorStop(0,"#0000"),l.addColorStop(1,"#000"),W.V=l;const t=a.createConicGradient(-Math.PI/2,T/2,T/2),n=["#f00","#ff0","#0f0","#0ff","#00f","#f0f","#f00"];s(n,((e,a,o)=>t.addColorStop(o/(n.length-1),a))),W.F=t}));const I=()=>{var e;const a=null==(e=m(r))?void 0:e.getContext("2d");a&&a.clearRect(0,0,T,T)},re=e=>{var a;const o=null==(a=m(r))?void 0:a.getContext("2d");o&&(o.fillStyle=m(e),o.fillRect(0,0,T,T))},ce=d((()=>{var e;const a=null==(e=m(r))?void 0:e.getContext("2d");if(a)return"rect"===m(t)?()=>{I(),re(w),re(W.h),re(W.V)}:"rounded"===m(t)?()=>{I(),re(W.F),re("#000000"+E(y[2],0,O.hsl[2],255,0,0).toString(16));const e=T/2,o=a.createRadialGradient(e,e,0,e,e,e),l=R([0,0,y[2]]);o.addColorStop(0,l),o.addColorStop(1,l+"00"),re(o)}:(I(),re(W.F),null)})),de=()=>{var e;Object.assign(j,m(G).m()),K.value=m(G).k(),null==(e=m(ce))||e()};c((()=>[m(t),y]),de,{deep:!0,flush:"post"}),P((()=>{de()}));const ie=(()=>{const e=e=>{m(G).u(e)},{start:a}=Q(r,{U:r,C:e,P:e});return a})(),ue=(()=>{const e=e=>{m(G).v(e)},{start:a}=Q(i,{U:i,C:e,P:e});return a})(),me=p(e,"modelValue");return X(m(me))||g(me,!1),c(y,(e=>{me.value=e}),{immediate:!0}),c(me,(e=>{g(e)}),{deep:!0}),(e,o)=>(x(),v(D,{ref_key:"dialogRef",ref:n,overlayProps:{contentClass:["color-picker",`color-picker--${t.value}`]},title:"Color Picker",modelValue:a.value,"onUpdate:modelValue":o[7]||(o[7]=e=>a.value=e)},{content:b((()=>[k("div",ve,[k("div",he,[o[0]||(h(-1),(o[0]=k("canvas",{ref_key:"canvasPickerRef",ref:r,width:m(T),height:m(T)},null,8,["width","height"])).cacheIndex=0,h(1),o[0]),"wheel"===t.value?(x(),A("div",ye)):C("",!0),k("div",{class:"color-picker__thumb",style:M(j),onPointerdown:o[1]||(o[1]=(...e)=>m(ie)&&m(ie)(...e))},null,36)]),"wheel"!==t.value?(x(),v(U,{key:0,showRange:!1,min:"0",max:"rect"===t.value?m(O).hsl[0]:m(O).hsl[2],trackerBackground:"rect"===t.value?"linear-gradient(to right, #F00, #FF0, #0F0, #0FF, #00F, #F0F, #F00)":"linear-gradient(to right, #000, #fff)",thumbBackground:K.value.background,"model-value":"rect"===t.value?y[0]:y[2],"onUpdate:modelValue":G.value.p},null,8,["max","trackerBackground","thumbBackground","model-value","onUpdate:modelValue"])):(x(),A("div",{key:1,ref_key:"secondPickerRef",ref:i,class:"color-picker__rect-picker",style:M(q.value)},[k("div",{class:"color-picker__thumb",rectPickerThumeStyle:"",style:M(K.value),onPointerdown:o[2]||(o[2]=(...e)=>m(ue)&&m(ue)(...e))},null,36)],4))]),k("div",be,[k("div",{class:"color-picker__preview",style:M({background:V.value})},null,4),k("label",ge,[o[8]||(o[8]=F(" Hex ")),_(z,{modelValue:V.value,"onUpdate:modelValue":o[3]||(o[3]=e=>V.value=e),modelModifiers:{lazy:!0},name:"color-piker-hex"},null,8,["modelValue"])]),k("div",Ve,[(x(),A(L,null,Z([["hue","色調"],["sat","彩度"],["bri","亮度"]],(([e,a],o,l,t)=>{const n=[y[o]];if(t&&t.key===e&&ee(t,n))return t;const s=(x(),A("label",{key:e},[F(B(a)+" ",1),ae(k("input",{name:`color-piker-${e}`,type:"number",inputmode:"decimal",min:"0",max:m(O).hsb[o],step:"any","onUpdate:modelValue":e=>y[o]=e},null,8,we),[[oe,y[o],void 0,{lazy:!0}]])]));return s.memo=n,s}),o,4),64))]),k("div",xe,[o[9]||(o[9]=F(" 樣式 ")),_(S,{items:["rect","rounded","wheel"],modelValue:t.value,"onUpdate:modelValue":o[6]||(o[6]=e=>t.value=e)},null,8,["modelValue"])])])])),_:1},8,["overlayProps","modelValue"]))}}),Fe=["analogous","shades","tints","tones","triad","square","complement","split complement","tetradic1","tetradic2","tetradic3"],Ue=(e,a,o,l)=>s(l-1,(l=>(l.push(re(e,a)),a+=o,l)),[e]),Ce=e=>Ue(e,180,180,2),Pe=e=>Ue(e,150,60,3),Se=e=>Ue(e,120,120,3),Be=e=>Ue(e,90,90,4),Te=e=>[e,re(e,30),re(e,-30)],Me=e=>{const a=Ce(e);return a.push(...Ce(re(e,30))),a},Oe=e=>{const a=Ce(e);return a.push(...Ce(re(e,60))),a},$e=e=>{const a=Ce(e);return a.push(re(e,30)),a.push(re(a[1],-30)),a},je=(e,a=6)=>{const[o,l,t]=e,n=t/a;return ne(a,((e,a)=>[o,l,t-a*n]))},Re=(e,a=6)=>{const[o,l,t]=e,n=l/a;return ne(a,((e,a)=>[o,l-a*n,t]))},ze=(e,a=6)=>{const[o,l,t]=e,n=l/a,s=t/a;return ne(a,((e,a)=>[o,l-a*n,t-a*s]))},De=["aria-label","onClick"],He=["min","max"],K=a({__name:"HarmonyGenerator",props:{modelValue:{type:Boolean},modelModifiers:{}},emits:["update:modelValue"],setup(a){const n=p(a,"modelValue"),s=l(!1),r=t(),i=l([0,O.hsl[1],O.hsl[2]]),u=o({l:0,S:6}),f=d((()=>{const e=(e=>{const a=Fe.indexOf(e);return 0===a?Te:1===a?je:2===a?Re:3===a?ze:4===a?Se:5===a?Be:6===a?Ce:7===a?Pe:8===a?Me:9===a?Oe:$e})(Fe[u.l]);return ne(e([...m(i)],u.S),(e=>ce(de(e))))})),y=l(!0),U=()=>{r.B(m(y)?m(f):m(B))};c((()=>[m(y),m(f)]),U);const P=()=>{r.B(m(f)),T(),fe(n)},B=l([[]]),T=()=>{B.value=ne(r.T,(e=>e.M))};return c(n,(e=>{e?(T(),U()):r.B(m(B))}),{immediate:!0}),(a,o)=>(x(),v(D,{"overlay-props":{contentClass:m(e).genDialog},title:"調和調色盤",modelValue:n.value,"onUpdate:modelValue":o[10]||(o[10]=e=>n.value=e)},{actions:b((()=>[k("label",null,[ae(k("input",{type:"checkbox",name:"preview","onUpdate:modelValue":o[8]||(o[8]=e=>y.value=e)},null,512),[[_e,y.value]]),o[14]||(o[14]=F(" 預覽 "))]),o[9]||(h(-1),(o[9]=_(q,{onClick:P,text:"確定"})).cacheIndex=9,h(1),o[9])])),default:b((()=>[G(f.value,(()=>(x(),A("div",{class:V(m(e).palette)},[_(w,{location:"top",text:"Copied",openOnHover:!1,openOnClick:"",eager:!1},{activator:b((({handleClick:e})=>[(x(!0),A(L,null,Z(f.value,((a,l)=>(x(),A("button",{key:l,type:"button",style:M({background:a}),"aria-label":`color ${a}`,onClick:a=>{var o;o=l,ke(m(f)[o]),e(a)}},o[11]||(o[11]=[k("div",{class:"btn__overlay"},null,-1)]),12,De)))),128))])),_:1})],2))),o,0),G([f.value[0]],(()=>_(q,{style:M({color:m(ie)(m(ue)(f.value[0]))>127?"#000":"#FFF",background:f.value[0]}),"prepend-icon":"eyedropper",text:"開啟color picker",onClick:o[1]||(o[1]=e=>s.value=!s.value)},null,8,["style"])),o,2),_(g,{modelValue:i.value,"onUpdate:modelValue":o[3]||(o[3]=e=>i.value=e),show:s.value,"onUpdate:show":o[4]||(o[4]=e=>s.value=e)},null,8,["modelValue","show"]),k("div",null,[o[12]||(o[12]=F(" 調和方法 ")),_(S,{items:m(Fe),idx:u.l,"onUpdate:idx":o[5]||(o[5]=e=>u.l=e)},null,8,["items","idx"])]),1<=u.l&&u.l<=3?G([u],(()=>(x(),A("div",{key:0,class:V(m(e).numbers)},[o[13]||(o[13]=k("label",{for:"harmony-num"},"數量",-1)),ae(k("input",{id:"harmony-num",name:"harmony-num",type:"number",min:m(pe),max:m(me),"onUpdate:modelValue":o[6]||(o[6]=e=>u.S=e)},null,8,He),[[oe,u.S,void 0,{lazy:!0,number:!0}]])],2))),o,7):C("",!0)])),_:1},8,["overlay-props","modelValue"]))}});export{K as default};