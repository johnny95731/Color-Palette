import{$ as e}from"./SettingDialog.module-VQ_Dx6mv.js";import{d as a,ai as Yr,r as l,aj as ic,ak as jr,f as p,q as h,o as _,v as F,s as k,h as x,al as Tl,I as B,S as he,am as Bu,b as d,w as f,i as b,k as g,p as C,ac as ue,l as V,t as D,x as L,y as U,an as Eu,ao as xu,F as S,A as j,ap as wu,aq as ku,ar as Fu,as as Su,K as M}from"./index-Wmeap9qK.js";import{_ as q}from"./VDialog.vue_vue_type_style_index_0_lang-BqZADGa7.js";const He={class:"switch"},Ae={class:"field"},ge=["for"],Ve=["id","aria-label","aria-labelledby","checked"],xe=["aria-checked","aria-labelledby"],A=a({__name:"VSwitch",props:Yr({label:{}},{modelValue:{type:Boolean},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const a=e,o=l(),{rt:s,cleanup:t}=ic(a.label,"switch");jr(t);const d=p(e,"modelValue"),i=()=>{he(d)},r=e=>{" "===e.key.toLowerCase()&&he(d)};return(e,a)=>(_(),h("div",He,[F("div",Ae,[x(s).ot?(_(),h("label",{key:0,for:x(s).et,onClick:a[0]||(a[0]=Tl((e=>{var a;i(),null==(a=o.value)||a.focus()}),["prevent"]))},B(x(s).ot),9,ge)):k("",!0),F("input",{id:x(s).et,"aria-label":x(s).ot,"aria-labelledby":x(s).nt,type:"checkbox",inputmode:"none",checked:d.value,onFocus:a[1]||(a[1]=e=>{var a;null==(a=o.value)||a.focus()})},null,40,Ve)]),F("div",{ref_key:"switchRef",ref:o,class:"switch__slider",tabindex:"0",role:"switch","aria-checked":d.value,"aria-labelledby":x(s).ot,onClick:i,onKeydown:r},null,40,xe)]))}}),E=a({__name:"SettingDialog",props:{modelValue:{type:Boolean},modelModifiers:{}},emits:["update:modelValue"],setup(a){const o=p(a,"modelValue"),s=l(),t=e=>{M(e)&&(e.preventDefault(),o.value=!1)},i=["展示","卡片"],r=l(0),n=Bu(),m=d({ce:n.transition.pos,O:n.transition.color}),u=(e,a)=>{"pos"===a?m.ce=e:m.O=e,n.gt(a,e)};return f(n.$state,n.Ct,{deep:!0}),(a,l)=>(_(),b(q,{ref_key:"dialogRef",ref:s,overlayProps:{contentClass:x(e).settingDialog},title:"設定",tabs:i,modelValue:o.value,"onUpdate:modelValue":l[23]||(l[23]=e=>o.value=e),"tab-idx":r.value,"onUpdate:tabIdx":l[24]||(l[24]=e=>r.value=e)},{default:g((()=>[0===r.value?(_(),h("div",{key:0,class:C(x(e).region),"aria-label":"調色盤"},[l[0]||(D(-1),(l[0]=F("label",{id:"color-syntax"},[l[25]||(l[25]=L("顯示"))])).cacheIndex=0,D(1),l[0]),ue([x(n).paletteDisplay],(()=>V(U,{modelValue:x(n).paletteDisplay,"onUpdate:modelValue":l[1]||(l[1]=e=>x(n).paletteDisplay=e),label:"#color-syntax",items:x(Eu),"letter-case":"start"},null,8,["modelValue","items"])),l,2),l[3]||(D(-1),(l[3]=F("label",{id:"color-syntax"},[l[26]||(l[26]=L("色彩語法"))])).cacheIndex=3,D(1),l[3]),ue([x(n).colorSyntax],(()=>V(U,{modelValue:x(n).colorSyntax,"onUpdate:modelValue":l[4]||(l[4]=e=>x(n).colorSyntax=e),label:"#color-syntax",items:x(xu),"letter-case":"start"},null,8,["modelValue","items"])),l,5),l[6]||(D(-1),(l[6]=F("span",{id:"auto-sort"},[l[27]||(l[27]=L("自動排序"))])).cacheIndex=6,D(1),l[6]),V(A,{label:"#auto-sort",modelValue:x(n).autoSort,"onUpdate:modelValue":l[7]||(l[7]=e=>x(n).autoSort=e)},null,8,["modelValue"])],2)):1===r.value?(_(),h(S,{key:1},[F("div",{class:C(x(e).region),"aria-labelledby":"title-border"},[l[8]||(D(-1),(l[8]=F("h3",{id:"title-border"},[l[28]||(l[28]=L(" 邊界(Border) "))])).cacheIndex=8,D(1),l[8]),l[9]||(D(-1),(l[9]=F("span",null,[l[29]||(l[29]=L("顯示"))])).cacheIndex=9,D(1),l[9]),V(A,{label:"show border","model-value":x(n).border.show,"onUpdate:modelValue":l[10]||(l[10]=e=>x(n)._t("show",e))},null,8,["model-value"]),x(n).border.show?(_(),h(S,{key:0},[l[11]||(D(-1),(l[11]=F("label",{id:"border-width"},[l[30]||(l[30]=L("寬度(px)"))])).cacheIndex=11,D(1),l[11]),ue([x(n).border.width],(()=>V(j,{label:"#border-width",max:x(wu),"model-value":x(n).border.width,"onUpdate:modelValue":l[12]||(l[12]=e=>x(n)._t("width",e))},null,8,["max","model-value"])),l,13),l[14]||(D(-1),(l[14]=F("label",{id:"border-color"},[l[31]||(l[31]=L("顏色"))])).cacheIndex=14,D(1),l[14]),ue([x(n).border.color],(()=>V(U,{label:"#border-color",items:x(ku),"letter-case":"start","model-value":x(n).border.color,"onUpdate:modelValue":l[15]||(l[15]=e=>x(n)._t("color",e))},null,8,["items","model-value"])),l,16)],64)):k("",!0)],2),F("div",{class:C(x(e).region),"aria-labelledby":"title-transition"},[l[17]||(D(-1),(l[17]=F("h3",{id:"title-transition"},[l[32]||(l[32]=L(" 轉場(Transition) "))])).cacheIndex=17,D(1),l[17]),l[18]||(D(-1),(l[18]=F("label",{id:"transition-position"},[l[33]||(l[33]=L("Position(ms)"))])).cacheIndex=18,D(1),l[18]),V(j,{label:"#transition-position",max:x(Fu),step:"50","model-value":x(n).transition.pos,"onUpdate:modelValue":l[19]||(l[19]=e=>u(e,"pos"))},null,8,["max","model-value"]),l[20]||(D(-1),(l[20]=F("label",{id:"transition-color"},[l[34]||(l[34]=L("Color(ms)"))])).cacheIndex=20,D(1),l[20]),ue([m.O],(()=>V(j,{label:"#transition-color",max:x(Su),step:"50","model-value":m.O,"onUpdate:modelValue":l[21]||(l[21]=e=>u(e,"color")),onKeydown:t},null,8,["max","model-value"])),l,22)],2)],64)):k("",!0)])),_:1},8,["overlayProps","modelValue","tab-idx"]))}});export{E as default};