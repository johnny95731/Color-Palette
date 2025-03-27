import{$ as e}from"./SettingDialog.module-CCwlQrj3.js";import{d as a,ai as l,r as o,aj as s,ak as t,b as d,m as i,o as r,q as n,p as m,e as u,al as b,B as c,Q as p,am as y,a as V,w as v,h as x,j as h,l as f,ab as _,k,s as w,t as U,v as g,an as j,ao as B,F as C,x as D,ap as P,aq as S,ar as q,as as F,I}from"./index-DpNDWNaK.js";import{_ as K}from"./VDialog.vue_vue_type_style_index_0_lang-BDYtSdYt.js";const M={class:"switch"},R={class:"field"},Q=["for"],T=["id","aria-label","aria-labelledby","checked"],$=["aria-checked","aria-labelledby"],z=a({__name:"VSwitch",props:l({label:{}},{modelValue:{type:Boolean},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const a=e,l=o(),{state:y,cleanup:V}=s(a.label,"switch");t(V);const v=d(e,"modelValue"),x=()=>{p(v)},h=e=>{" "===e.key.toLowerCase()&&p(v)};return(e,a)=>(r(),i("div",M,[n("div",R,[u(y).ariaLabel?(r(),i("label",{key:0,for:u(y).id,onClick:a[0]||(a[0]=b((e=>{var a;x(),null==(a=l.value)||a.focus()}),["prevent"]))},c(u(y).ariaLabel),9,Q)):m("",!0),n("input",{id:u(y).id,"aria-label":u(y).ariaLabel,"aria-labelledby":u(y).ariaLabelledby,type:"checkbox",inputmode:"none",checked:v.value,onFocus:a[1]||(a[1]=e=>{var a;null==(a=l.value)||a.focus()})},null,40,T)]),n("div",{ref_key:"switchRef",ref:l,class:"switch__slider",tabindex:"0",role:"switch","aria-checked":v.value,"aria-labelledby":u(y).ariaLabel,onClick:x,onKeydown:h},null,40,$)]))}}),A=a({__name:"SettingDialog",props:{modelValue:{type:Boolean},modelModifiers:{}},emits:["update:modelValue"],setup(a){const l=d(a,"modelValue"),s=o(),t=e=>{I(e)&&(e.preventDefault(),l.value=!1)},b=["展示","卡片"],c=o(0),p=y(),M=V({pos:p.transition.pos,color:p.transition.color}),R=(e,a)=>{"pos"===a?M.pos=e:M.color=e,p.setTransition(a,e)};return v(p.$state,p.updateStorage,{deep:!0}),(a,o)=>(r(),x(K,{ref_key:"dialogRef",ref:s,overlayProps:{contentClass:u(e).settingDialog},title:"設定",tabs:b,modelValue:l.value,"onUpdate:modelValue":o[23]||(o[23]=e=>l.value=e),"tab-idx":c.value,"onUpdate:tabIdx":o[24]||(o[24]=e=>c.value=e)},{default:h((()=>[0===c.value?(r(),i("div",{key:0,class:f(u(e).region),"aria-label":"調色盤"},[o[0]||(w(-1),(o[0]=n("label",{id:"color-syntax"},[o[25]||(o[25]=U("顯示"))])).cacheIndex=0,w(1),o[0]),_([u(p).paletteDisplay],(()=>k(g,{modelValue:u(p).paletteDisplay,"onUpdate:modelValue":o[1]||(o[1]=e=>u(p).paletteDisplay=e),label:"#color-syntax",items:u(j),"letter-case":"start"},null,8,["modelValue","items"])),o,2),o[3]||(w(-1),(o[3]=n("label",{id:"color-syntax"},[o[26]||(o[26]=U("色彩語法"))])).cacheIndex=3,w(1),o[3]),_([u(p).colorSyntax],(()=>k(g,{modelValue:u(p).colorSyntax,"onUpdate:modelValue":o[4]||(o[4]=e=>u(p).colorSyntax=e),label:"#color-syntax",items:u(B),"letter-case":"start"},null,8,["modelValue","items"])),o,5),o[6]||(w(-1),(o[6]=n("span",{id:"auto-sort"},[o[27]||(o[27]=U("自動排序"))])).cacheIndex=6,w(1),o[6]),k(z,{label:"#auto-sort",modelValue:u(p).autoSort,"onUpdate:modelValue":o[7]||(o[7]=e=>u(p).autoSort=e)},null,8,["modelValue"])],2)):1===c.value?(r(),i(C,{key:1},[n("div",{class:f(u(e).region),"aria-labelledby":"title-border"},[o[8]||(w(-1),(o[8]=n("h3",{id:"title-border"},[o[28]||(o[28]=U(" 邊界(Border) "))])).cacheIndex=8,w(1),o[8]),o[9]||(w(-1),(o[9]=n("span",null,[o[29]||(o[29]=U("顯示"))])).cacheIndex=9,w(1),o[9]),k(z,{label:"show border","model-value":u(p).border.show,"onUpdate:modelValue":o[10]||(o[10]=e=>u(p).l("show",e))},null,8,["model-value"]),u(p).border.show?(r(),i(C,{key:0},[o[11]||(w(-1),(o[11]=n("label",{id:"border-width"},[o[30]||(o[30]=U("寬度(px)"))])).cacheIndex=11,w(1),o[11]),_([u(p).border.width],(()=>k(D,{label:"#border-width",max:u(P),"model-value":u(p).border.width,"onUpdate:modelValue":o[12]||(o[12]=e=>u(p).l("width",e))},null,8,["max","model-value"])),o,13),o[14]||(w(-1),(o[14]=n("label",{id:"border-color"},[o[31]||(o[31]=U("顏色"))])).cacheIndex=14,w(1),o[14]),_([u(p).border.color],(()=>k(g,{label:"#border-color",items:u(S),"letter-case":"start","model-value":u(p).border.color,"onUpdate:modelValue":o[15]||(o[15]=e=>u(p).l("color",e))},null,8,["items","model-value"])),o,16)],64)):m("",!0)],2),n("div",{class:f(u(e).region),"aria-labelledby":"title-transition"},[o[17]||(w(-1),(o[17]=n("h3",{id:"title-transition"},[o[32]||(o[32]=U(" 轉場(Transition) "))])).cacheIndex=17,w(1),o[17]),o[18]||(w(-1),(o[18]=n("label",{id:"transition-position"},[o[33]||(o[33]=U("Position(ms)"))])).cacheIndex=18,w(1),o[18]),k(D,{label:"#transition-position",max:u(q),step:"50","model-value":u(p).transition.pos,"onUpdate:modelValue":o[19]||(o[19]=e=>R(e,"pos"))},null,8,["max","model-value"]),o[20]||(w(-1),(o[20]=n("label",{id:"transition-color"},[o[34]||(o[34]=U("Color(ms)"))])).cacheIndex=20,w(1),o[20]),_([M.color],(()=>k(D,{label:"#transition-color",max:u(F),step:"50","model-value":M.color,"onUpdate:modelValue":o[21]||(o[21]=e=>R(e,"color")),onKeydown:t},null,8,["max","model-value"])),o,22)],2)],64)):m("",!0)])),o:1},8,["overlayProps","modelValue","tab-idx"]))}});export{A as default};
