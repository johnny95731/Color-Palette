import{$ as e}from"./SettingDialog.module-VQ_Dx6mv.js";import{d as a,r as l,u as t,a as s,f as o,C as n,c as d,G as i,M as r,g as u,b as m,e as p,w as c,n as f,h as v,o as x,i as y,j as b,k as _,_ as g,l as V,m as C,p as A,s as h,q as k,t as D,v as F,F as L,x as S,y as U,z,A as j,B as w,D as B,E as G,H as I,I as M}from"./index-CJnITSmN.js";import{_ as T}from"./VDialog.vue_vue_type_style_index_0_lang-C4prB6s9.js";const W={contrastDialog:"_contrastDialog_1ae27ea",example:"_example_4d8b657"},q=a({__name:"ContrastDialog",props:{modelValue:{type:Boolean},modelModifiers:{}},emits:["update:modelValue"],setup(a){const q=l(),P=t(),E=["調整","計算"],H=l(0),J=e=>{M(e)&&(e.preventDefault(),Y.value=!1)},K=s(o(n,((e,a,l)=>(e[l]=1,e)),{l:0})),N=d((()=>K.l?i:r)),Q=()=>{P.t(K.l,K[K.l])},R=e=>{P.o(e),K[K.l]=1,Q()},$=l("#FFFFFF"),O=l("#000000"),X=d((()=>u(m($),m(O)))),Y=p(a,"modelValue");return c(Y,(async e=>{var a,l;await f(),e&&0===m(H)?(P.o("start"),Q()):!e&&P.i&&P.o("cancel"),null==(l=null==(a=m(q))?void 0:a.tabRefs[m(H)])||l.$el.focus()}),{flush:"post"}),c(H,((e,a)=>{0===e?(P.o("start"),Q()):0===a&&P.o("cancel")}),{flush:"post",immediate:!0}),(a,l)=>(x(),v(T,{ref_key:"dialogRef",ref:q,overlayProps:{contentClass:m(W).contrastDialog},title:"對比",tabs:E,modelValue:Y.value,"onUpdate:modelValue":l[16]||(l[16]=e=>Y.value=e),"tab-idx":H.value,"onUpdate:tabIdx":l[17]||(l[17]=e=>H.value=e)},y({default:b((()=>[0===H.value?(x(),C("div",{key:0,class:V(m(e).region)},[l[0]||(h(-1),(l[0]=k("label",{id:"contrast-method"},[l[18]||(l[18]=D("Method"))])).cacheIndex=0,h(1),l[0]),_(F,{label:"#contrast-method",items:m(n),index:K.l,"onUpdate:idx":l[1]||(l[1]=e=>{return a=e,K.l=a,P.o("reset"),void Q();var a})},null,8,["items","index"]),2!==K.l?(x(),C(L,{key:0},[l[19]||(l[19]=k("label",{id:"contrast-coeff-name"},"Coeff.",-1)),_(S,{label:"#contrast-coeff-name",max:N.value,step:"0.001","model-value":K[K.l],"onUpdate:modelValue":l[2]||(l[2]=e=>{K[K.l]=e,Q()})},null,8,["max","model-value"])],64)):A("",!0)],2)):1===H.value?(x(),C(L,{key:1},[k("div",{class:V(m(e).region)},[l[3]||(h(-1),(l[3]=k("h3",null,[l[22]||(l[22]=D(" 對比值計算 ")),_(U,null,{activator:b((({props:e})=>[_(z,j(e,{type:"info-circle"}),null,16)])),text:b((()=>l[20]||(l[20]=[D(" WCAG一般文字標準"),k("br",null,null,-1),D(" Level AA  : ≥4.5"),k("br",null,null,-1),D(" Level AAA  : ≥7"),k("br",null,null,-1)]))),_:1}),_(U,null,{activator:b((({props:e})=>[_(z,j(e,{type:"info-square",style:{"margin-left":"4px"}}),null,16)])),text:b((()=>l[21]||(l[21]=[D(" WCAG大型文字標準"),k("br",null,null,-1),D(" Level AA  : ≥3"),k("br",null,null,-1),D(" Level AAA  : ≥4.5 "),k("div",{style:{opacity:"0.8"}}," 文字≥18pt或粗體且≥14pt稱為大型文字。 ",-1)]))),_:1})])).cacheIndex=3,h(1),l[3]),l[4]||(h(-1),(l[4]=k("label",{for:"contrast-ratio-bg"},[l[23]||(l[23]=D("背景顏色"))])).cacheIndex=4,h(1),l[4]),_(w,{modelValue:$.value,"onUpdate:modelValue":l[5]||(l[5]=e=>$.value=e),id:"contrast-ratio-bg"},null,8,["modelValue"]),l[6]||(h(-1),(l[6]=k("label",{for:"contrast-ratio-text"},[l[24]||(l[24]=D("文字顏色"))])).cacheIndex=6,h(1),l[6]),_(w,{modelValue:O.value,"onUpdate:modelValue":l[7]||(l[7]=e=>O.value=e),id:"contrast-ratio-text"},null,8,["modelValue"]),l[25]||(l[25]=k("span",null,"對比值",-1)),k("div",null,B(X.value),1)],2),k("div",{class:V([m(W).example])},[l[8]||(h(-1),(l[8]=k("h3",null,[l[26]||(l[26]=D(" 範例 "))])).cacheIndex=8,h(1),l[8]),G([$.value,O.value],(()=>(x(),C("div",{style:I({background:$.value,color:O.value}),"aria-hidden":"true"},[l[9]||(h(-1),(l[9]=k("div",{textContent:"Text",style:{fontSize:"10pt"}})).cacheIndex=9,h(1),l[9]),l[10]||(h(-1),(l[10]=k("div",{textContent:"Text",style:{fontSize:"14pt"}})).cacheIndex=10,h(1),l[10]),l[11]||(h(-1),(l[11]=k("div",{textContent:"Large",style:{fontSize:"14pt",fontWeight:"bold"}})).cacheIndex=11,h(1),l[11]),l[12]||(h(-1),(l[12]=k("div",{textContent:"Large",style:{fontSize:"18pt"}})).cacheIndex=12,h(1),l[12])],4))),l,13)],2)],64)):A("",!0)])),_:2},[0===H.value?{name:"actions",fn:b((()=>[_(g,{text:"重置",onClick:l[14]||(l[14]=e=>R("reset"))}),_(g,{class:V(m(W).applyBtn),text:"套用",onKeydown:J,onClick:l[15]||(l[15]=e=>R("start"))},null,8,["class"])])),key:"0"}:void 0]),1032,["overlayProps","modelValue","tab-idx"]))}});export{q as default};