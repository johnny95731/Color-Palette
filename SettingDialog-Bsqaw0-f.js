import{d as e,ad as a,r as l,N as o,ae as t,I as s,U as n,w as i,u as d,h as r,o as u,v as c,g as m,l as p,y as b,af as v,ag as f,n as h,t as y,A as _,a as x,ah as V,ab as k,c as w,K as g,a2 as U,ai as C,aj as B,ak as D,e as K,al as j,f as I,k as M,_ as P,F as R,V as S,am as F,X as N,an as T,ao as q,ap as A,aq as L,ar as O,s as W,x as X,ac as z}from"./index-RGG_pGlF.js";import{_ as E}from"./VDialog.vue_vue_type_style_index_0_lang-DiEi_vEX.js";const G={settingDialog:"_settingDialog_9bb1593",region:"_region_59377cb",applyBtn:"_applyBtn_a9422a6"},H={class:"switch"},J=["id","value","checked"],Q=["aria-checked","value"],Y=["for"],Z=e({__name:"VSwitch",props:a({inputId:{},label:{},hideLabel:{type:Boolean},value:{}},{modelValue:{type:Boolean},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const a=e,x=l(),V=l(),k=o((()=>a.inputId??t("slider"))),w=o((()=>{var e;return a.label?(null==(e=a.label)?void 0:e.startsWith("#"))?{"aria-labelledby":a.label.slice(1)}:{"aria-label":a.label}:{}}));s((()=>{var e;if(!(null==(e=a.label)?void 0:e.startsWith("#")))return;const l=document.getElementById(a.label.slice(1));l&&(l.htmlFor=n(k))})),i((()=>[a.label,n(k)]),((e,a)=>{var l;const o=e[0]===a[0],t=e[1]===a[1];if(o||[a[0],e[0]].forEach(((a,l)=>{if(a&&a.startsWith("#")){const o=document.getElementById(a.slice(1));o&&(0===l?o.removeAttribute("for"):o.setAttribute("for",e[1]))}})),!t&&(null==(l=e[0])?void 0:l.startsWith("#"))){const a=document.getElementById(e[0].slice(1));a&&(a.htmlFor=e[1])}}));const g=d(e,"modelValue");function U(){_(g)}function C(e){" "===e.key.toLowerCase()&&_(g)}return(e,a)=>(u(),r("div",H,[c(m("input",v({class:"field",ref_key:"inputRef",ref:x},w.value,{id:k.value,type:"checkbox",value:e.value,checked:g.value,"onUpdate:modelValue":a[0]||(a[0]=e=>g.value=e),onFocus:a[1]||(a[1]=e=>{var a;null==(a=V.value)||a.focus()})}),null,16,J),[[b,g.value]]),m("div",v({ref_key:"switchRef",ref:V},w.value,{class:"switch__slider",tabindex:"0",role:"switch","aria-checked":g.value,value:e.value,onClick:U,onKeydown:C}),null,16,Q),w.value["aria-label"]?(u(),r("label",{key:0,class:h([e.hideLabel&&"field"]),for:k.value,onClick:a[2]||(a[2]=f((e=>{var a;U(),null==(a=V.value)||a.focus()}),["prevent"]))},y(w.value["aria-label"]),11,Y)):p("",!0)]))}}),$=e({__name:"SettingDialog",props:{modelValue:{type:Boolean},modelModifiers:{}},emits:["update:modelValue"],setup(e){const a=d(e,"modelValue"),t=l(),s=x(),n=V(),c=["Card","Contrast"],b=l(0);function v(e){z(e)&&(e.preventDefault(),a.value=!1)}i(a,(async e=>{var a,l;await k(),e&&1===b.value?(s.l("start"),J()):!e&&s.o&&s.l("cancel"),null==(l=null==(a=t.value)?void 0:a.tabRefs[w(b)])||l.$el.focus()})),i(b,((e,a)=>{1===e?(s.l("start"),J()):1===a&&s.l("cancel")}));const f=g({pos:n.transition.pos,color:n.transition.color}),y=(e,a)=>{"pos"===a?f.pos=e:f.color=e,n.t(a,e)},_=g(U(C,((e,a,l)=>(e[l]=1,e)),{method:0})),H=o((()=>_.method?B:D));function J(){s.i(_.method,_[_.method])}const Q=e=>{s.l(e),_[_.method]=1,J()};return(e,l)=>(u(),K(E,{ref_key:"dialogRef",ref:t,overlayProps:{contentClass:w(G).settingDialog},title:"設定",tabs:c,modelValue:a.value,"onUpdate:modelValue":l[12]||(l[12]=e=>a.value=e),"tab-idx":b.value,"onUpdate:tabIdx":l[13]||(l[13]=e=>b.value=e)},j({default:I((()=>[0===b.value?(u(),r(R,{key:0},[m("div",{class:h(w(G).region),"aria-labelledby":"title-border"},[l[16]||(l[16]=m("h3",{id:"title-border"}," Border ",-1)),l[17]||(l[17]=m("span",null,"Show",-1)),M(Z,{label:"show border","hide-label":"","model-value":w(n).border.show,"onUpdate:modelValue":l[0]||(l[0]=e=>w(n).u("show",e))},null,8,["model-value"]),w(n).border.show?(u(),r(R,{key:0},[l[14]||(l[14]=m("label",{id:"border-width"},"Width(px)",-1)),M(S,{label:"#border-width",max:w(F),"model-value":w(n).border.width,"onUpdate:modelValue":l[1]||(l[1]=e=>w(n).u("width",e))},null,8,["max","model-value"]),l[15]||(l[15]=m("label",{id:"border-color"},"Color",-1)),M(N,{label:"#border-color",items:w(T),"letter-case":"start","model-value":w(n).border.color,"onUpdate:modelValue":l[2]||(l[2]=e=>w(n).u("color",e))},null,8,["items","model-value"])],64)):p("",!0)],2),m("div",{class:h(w(G).region),"aria-labelledby":"title-transition"},[l[18]||(l[18]=m("h3",{id:"title-transition"}," Transition ",-1)),l[19]||(l[19]=m("label",{id:"transition-position"},"Position(ms)",-1)),M(S,{label:"#transition-position",max:w(q),step:"50","model-value":w(n).transition.pos,"onUpdate:modelValue":l[3]||(l[3]=e=>y(e,"pos"))},null,8,["max","model-value"]),l[20]||(l[20]=m("label",{id:"transition-color"},"Color(ms)",-1)),M(S,{label:"#transition-color",max:w(A),step:"50","model-value":f.color,"onUpdate:modelValue":l[4]||(l[4]=e=>y(e,"color"))},null,8,["max","model-value"])],2),m("div",{class:h(w(G).region),"aria-labelledby":"title-Transition"},[l[21]||(l[21]=m("h3",{id:"title-others"}," Others ",-1)),l[22]||(l[22]=m("label",{id:"color-notation"},"Color Notation",-1)),M(N,{modelValue:w(n).m,"onUpdate:modelValue":l[5]||(l[5]=e=>w(n).m=e),label:"#color-notation",items:w(O),"letter-case":"start",onKeydown:l[6]||(l[6]=L((e=>b.value=1),["tab"]))},null,8,["modelValue","items"])],2)],64)):1===b.value?(u(),r("div",{key:1,class:h(w(G).region)},[l[7]||(W(-1),(l[7]=m("label",{id:"contrast-method"},[l[23]||(l[23]=X("Method"))])).cacheIndex=7,W(1),l[7]),M(N,{label:"#contrast-method",items:w(C),index:_.method,"onUpdate:index":l[8]||(l[8]=e=>{return a=e,_.method=a,s.l("reset"),void J();var a})},null,8,["items","index"]),2!==_.method?(u(),r(R,{key:0},[l[24]||(l[24]=m("label",{id:"contrast-coeff-name"},"Coeff.",-1)),M(S,{label:"#contrast-coeff-name",max:H.value,step:"0.001","model-value":_[_.method],"onUpdate:modelValue":l[9]||(l[9]=e=>{_[_.method]=e,J()})},null,8,["max","model-value"])],64)):p("",!0)],2)):p("",!0)])),p:2},[1===b.value?{name:"actions",fn:I((()=>[M(P,{text:"重置",onClick:l[10]||(l[10]=e=>Q("reset"))}),M(P,{class:h(w(G).applyBtn),text:"套用",onKeydown:v,onClick:l[11]||(l[11]=e=>Q("start"))},null,8,["class"])])),key:"0"}:void 0]),1032,["overlayProps","modelValue","tab-idx"]))}});export{$ as default};
