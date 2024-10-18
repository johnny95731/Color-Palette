import{d as e,m as a,r as l,a as t,H as o,c as n,b as s,h as r,t as u,i,e as c,o as d,w as m,u as p,f,g as h,j as v,k as b,l as y,n as _,p as g,q as k,s as C,v as x,F as w,x as V,y as $,z as D,A as R,B as S,C as U,D as A,E as M,G as E,I as z,J as P,K as F,L as G,M as j,N as H,_ as L,O,P as B,Q as I,R as T,S as Y,T as q,U as J}from"./index-BnVAz0mL.js";const K=["width","height"],N={class:"hex-input"},Q={class:"hsb-inputs"},X=["name","max","onUpdate:modelValue"],W=e({__name:"ColorPicker",props:a({width:{default:270},height:{default:135}},{hsb:{},hsbModifiers:{},modelValue:{},modelModifiers:{}}),emits:["update:hsb","update:modelValue"],setup(e){const a=e,A=l(),M=l(),E=l(),z=t([0,.8*o[1],.8*o[2]]),P=(e,a=1)=>{let l="string"==typeof(e=u(e))?D(R(e)):e;a&&(l=l.map((e=>S(e,2)))),Object.assign(z,l)},F=n({get:()=>s(r(u(z))),set(e){i(e)&&e!==F.value&&P(e)}}),G=n((()=>s(r([u(z)[0],o[1],o[2]])))),j=n((()=>({top:o[2]-u(z)[2]+"%",left:`${u(z)[1]}%`,backgroundColor:s(r(u(z)))}))),H=n((()=>`${c(u(z)[0],0,o[0],0,100)}%`)),L=n((()=>{var e;return null==(e=M.value)?void 0:e.getContext("2d")}));function O(){const e=u(L);if(!e)return;const{width:l,height:t}=a;e.clearRect(0,0,+l,+t),e.fillStyle=u(G),e.fillRect(0,0,+l,+t);const o=e.createLinearGradient(0,0,+l,0);o.addColorStop(0,"rgba(255,255,255,1)"),o.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=o,e.fillRect(0,0,+l,+t);const n=e.createLinearGradient(0,0,0,+t);n.addColorStop(0,"rgba(0,0,0,0)"),n.addColorStop(1,"rgba(0,0,0,1)"),e.fillStyle=n,e.fillRect(0,0,+l,+t)}d(O),m(G,O);const B=(()=>{let e=0,a=[];const{rect:l,update:t}=p(M),n=e=>{const a=S(c(e.clientX,l.left,l.right,0,o[1]),2);u(z)[1]=a;const t=S(c(e.clientY,l.top,l.bottom,o[2],0),2);u(z)[2]=t};function s(a){if(e)return n(a),0}function r(){e=0,a.forEach((e=>e()))}return function(l){l.preventDefault(),a=[U("mousemove",s,{capture:1}),U("mouseup",r,{capture:1})],t(),n(l),e=1}})(),I=(()=>{let e=0,a=[];const{rect:l,update:t}=p(E,{filter:["top","bottom"]}),n=e=>{const a=S(c(e.clientY,l.top,l.bottom,0,o[0]),2);u(z)[0]=a};function s(a){if(e)return n(a),0}function r(){e=0,a.forEach((e=>e()))}return function(l){l.preventDefault(),a=[U("mousemove",s,{capture:1}),U("mouseup",r,{capture:1})],t(),n(l),e=1}})(),T=f(e,"hsb"),Y=f(e,"modelValue");return(()=>{const e=h(u(T)),a=h(u(Y));e&&!a?P(Y,0):!e&&a&&P(T,0)})(),m(z,(e=>{T.value=e,Y.value=u(j).backgroundColor}),{deep:1,immediate:1}),m(T,(e=>P(e)),{deep:1}),m(Y,(e=>{e!==u(F)&&P(e)})),(e,a)=>(v(),b("div",{ref_key:"containerRef",ref:A,class:"color-picker-container"},[y("div",{ref_key:"containerRef",ref:A,class:"pickers"},[y("div",{class:"color-picker",onMousedown:a[0]||(a[0]=(...e)=>_(B)&&_(B)(...e))},[y("canvas",{ref_key:"colorPickerCanvasRef",ref:M,width:e.width,height:e.height},null,8,K),y("div",{class:"color-pointer",style:g(j.value)},null,4)],32),y("div",{class:"hue-picker",onMousedown:a[1]||(a[1]=(...e)=>_(I)&&_(I)(...e))},[y("div",{ref_key:"hueTrackRef",ref:E,class:"hue-track"},null,512),y("div",{class:"hue-pointer",style:g({top:H.value,backgroundColor:G.value})},null,4)],32)],512),y("label",N,[a[3]||(a[3]=k(" Hex ")),C(y("input",{name:"color-piker-hex",maxlength:"7",size:"7","onUpdate:modelValue":a[2]||(a[2]=e=>F.value=e)},null,512),[[x,F.value,void 0,{lazy:1}]])]),y("div",Q,[(v(),b(w,null,V([["hue","色調"],["sat","彩度"],["bri","亮度"]],(([e,a],l)=>y("label",{key:e},[k($(a)+" ",1),C(y("input",{name:`color-piker-${e}`,type:"number",inputmode:"decimal",min:"0",max:_(o)[l],step:"any","onUpdate:modelValue":e=>z[l]=e},null,8,X),[[x,z[l],void 0,{lazy:1}]])]))),64))])],512))}}),Z=["min","max"],ee=((e,a)=>{const l=e.__vccOpts||e;for(const[t,o]of a)l[t]=o;return l})(e({__name:"HarmonyGenDialog",props:{modelValue:{type:Boolean},modelModifiers:{}},emits:["update:modelValue"],setup(e){const a=f(e,"modelValue"),u=A(),i=l([[]]),c=()=>{i.value=u.cards.map((e=>e.color))};m(a,(()=>{M(a)?c():u.setPlt(M(i))}));const d=l([0,.85*o[1],.85*o[2]]),p=t({method:0,num:6}),h=n((()=>E(z[p.method])([...M(d)],p.num).map((e=>s(r(e)))))),$=()=>u.setPlt(M(h)),D=()=>{$(),c(),J(a)};return(e,l)=>(v(),P(q,{"content-class":e.$style.genDialog,role:"dialog",eager:1,transition:"slide-y",transparent:"",modelValue:a.value,"onUpdate:modelValue":l[5]||(l[5]=e=>a.value=e)},{default:F((()=>[l[0]||(G(-1),(l[0]=y("header",{class:j(e.$style.header)},[l[6]||(l[6]=y("h2",null,"調和調色盤",-1)),H(L,{icon:"close","aria-label":"close",onClick:e=>a.value=0},null,8,["onClick"])],2)).cacheIndex=0,G(1),l[0]),y("div",{class:j(e.$style.content)},[y("div",{class:j(e.$style.palette)},[(v(1),b(w,null,V(h.value,(e=>(v(),b("div",{key:e,style:g({background:e})},null,4)))),128))],2),H(W,{hsb:d.value,"onUpdate:hsb":l[1]||(l[1]=e=>d.value=e)},null,8,["hsb"]),H(O,{options:_(z),index:p.method,"onUpdate:index":l[2]||(l[2]=e=>p.method=e)},null,8,["options","index"]),1<=p.method&&p.method<=3?B([p],(()=>(v(),b("div",{key:0,class:j(e.$style.numbers)},[l[7]||(l[7]=y("label",{for:"harmony-num"},"數量",-1)),C(y("input",{id:"harmony-num",name:"harmony-num",type:"number",min:_(I),max:_(T),"onUpdate:modelValue":l[3]||(l[3]=e=>p.num=e)},null,8,Z),[[x,p.num,void 0,{lazy:1,number:1}]])],2))),l,4):Y("",1),l[10]||(l[10]=y("div",{class:"spacer"},null,-1)),y("div",{class:j(e.$style.buttons)},[H(L,{onClick:$},{default:F((()=>l[8]||(l[8]=[k(" 預覽 ")]))),_:1}),H(L,{onClick:D},{default:F((()=>l[9]||(l[9]=[k(" 確定 ")]))),_:1})],2)],2)])),_:1},8,["content-class","modelValue"]))}}),[["__cssModules",{$style:{color1:"#FAFAFA",color2:"#EAEAEA",color3:"#C0C0C0",color4:"#707070",color5:"#1D1D57",genDialog:"_genDialog_fn43w_9",header:"_header_fn43w_21",content:"_content_fn43w_42",palette:"_palette_fn43w_51",numbers:"_numbers_fn43w_66",buttons:"_buttons_fn43w_77"}}]]);export{ee as default};
