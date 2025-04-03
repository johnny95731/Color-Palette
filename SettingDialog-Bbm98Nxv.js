import{$ as e}from"./SettingDialog.module-VQ_Dx6mv.js";import{d as a,ah as Kr,r as l,ai as pc,aj as jr,e as p,m as A,o as x,q as k,p as C,b as m,ak as zl,D as B,Q as ve,al as Lu,a as o,w as c,h as v,j as b,l as V,E as G,k as _,s as h,t as D,v as F,am as ju,an as $u,F as L,x as U,ao as Mu,ap as Au,aq as Du,ar as Ou,I as K}from"./index-C6ci0KaB.js";import{_ as j}from"./VDialog.vue_vue_type_style_index_0_lang-DfIKtjuN.js";const He={class:"switch"},Ee={class:"field"},be=["for"],ge=["id","aria-label","aria-labelledby","checked"],Ve=["aria-checked","aria-labelledby"],g=a({__name:"VSwitch",props:Kr({label:{}},{modelValue:{type:Boolean},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const a=e,o=l(),{ot:s,cleanup:t}=pc(a.label,"switch");jr(t);const d=p(e,"modelValue"),i=()=>{ve(d)},r=e=>{" "===e.key.toLowerCase()&&ve(d)};return(e,a)=>(x(),A("div",He,[k("div",Ee,[m(s).nt?(x(),A("label",{key:0,for:m(s).tt,onClick:a[0]||(a[0]=zl((e=>{var a;i(),null==(a=o.value)||a.focus()}),["prevent"]))},B(m(s).nt),9,be)):C("",!0),k("input",{id:m(s).tt,"aria-label":m(s).nt,"aria-labelledby":m(s).et,type:"checkbox",inputmode:"none",checked:d.value,onFocus:a[1]||(a[1]=e=>{var a;null==(a=o.value)||a.focus()})},null,40,ge)]),k("div",{ref_key:"switchRef",ref:o,class:"switch__slider",tabindex:"0",role:"switch","aria-checked":d.value,"aria-labelledby":m(s).nt,onClick:i,onKeydown:r},null,40,Ve)]))}}),q=a({__name:"SettingDialog",props:{modelValue:{type:Boolean},modelModifiers:{}},emits:["update:modelValue"],setup(a){const s=p(a,"modelValue"),t=l(),d=e=>{K(e)&&(e.preventDefault(),s.value=!1)},i=["展示","卡片"],r=l(0),n=Lu(),u=o({$:n.transition.pos,M:n.transition.color}),y=(e,a)=>{"pos"===a?u.$=e:u.M=e,n.gt(a,e)};return c(n.$state,n._t,{deep:!0}),(a,l)=>(x(),v(j,{ref_key:"dialogRef",ref:t,overlayProps:{contentClass:m(e).settingDialog},title:"設定",tabs:i,modelValue:s.value,"onUpdate:modelValue":l[23]||(l[23]=e=>s.value=e),"tab-idx":r.value,"onUpdate:tabIdx":l[24]||(l[24]=e=>r.value=e)},{default:b((()=>[0===r.value?(x(),A("div",{key:0,class:V(m(e).region),"aria-label":"調色盤"},[l[0]||(h(-1),(l[0]=k("label",{id:"color-syntax"},[l[25]||(l[25]=D("顯示"))])).cacheIndex=0,h(1),l[0]),G([m(n).paletteDisplay],(()=>_(F,{modelValue:m(n).paletteDisplay,"onUpdate:modelValue":l[1]||(l[1]=e=>m(n).paletteDisplay=e),label:"#color-syntax",items:m(ju),"letter-case":"start"},null,8,["modelValue","items"])),l,2),l[3]||(h(-1),(l[3]=k("label",{id:"color-syntax"},[l[26]||(l[26]=D("色彩語法"))])).cacheIndex=3,h(1),l[3]),G([m(n).colorSyntax],(()=>_(F,{modelValue:m(n).colorSyntax,"onUpdate:modelValue":l[4]||(l[4]=e=>m(n).colorSyntax=e),label:"#color-syntax",items:m($u),"letter-case":"start"},null,8,["modelValue","items"])),l,5),l[6]||(h(-1),(l[6]=k("span",{id:"auto-sort"},[l[27]||(l[27]=D("自動排序"))])).cacheIndex=6,h(1),l[6]),_(g,{label:"#auto-sort",modelValue:m(n).autoSort,"onUpdate:modelValue":l[7]||(l[7]=e=>m(n).autoSort=e)},null,8,["modelValue"])],2)):1===r.value?(x(),A(L,{key:1},[k("div",{class:V(m(e).region),"aria-labelledby":"title-border"},[l[8]||(h(-1),(l[8]=k("h3",{id:"title-border"},[l[28]||(l[28]=D(" 邊界(Border) "))])).cacheIndex=8,h(1),l[8]),l[9]||(h(-1),(l[9]=k("span",null,[l[29]||(l[29]=D("顯示"))])).cacheIndex=9,h(1),l[9]),_(g,{label:"show border","model-value":m(n).border.show,"onUpdate:modelValue":l[10]||(l[10]=e=>m(n).bt("show",e))},null,8,["model-value"]),m(n).border.show?(x(),A(L,{key:0},[l[11]||(h(-1),(l[11]=k("label",{id:"border-width"},[l[30]||(l[30]=D("寬度(px)"))])).cacheIndex=11,h(1),l[11]),G([m(n).border.width],(()=>_(U,{label:"#border-width",max:m(Mu),"model-value":m(n).border.width,"onUpdate:modelValue":l[12]||(l[12]=e=>m(n).bt("width",e))},null,8,["max","model-value"])),l,13),l[14]||(h(-1),(l[14]=k("label",{id:"border-color"},[l[31]||(l[31]=D("顏色"))])).cacheIndex=14,h(1),l[14]),G([m(n).border.color],(()=>_(F,{label:"#border-color",items:m(Au),"letter-case":"start","model-value":m(n).border.color,"onUpdate:modelValue":l[15]||(l[15]=e=>m(n).bt("color",e))},null,8,["items","model-value"])),l,16)],64)):C("",!0)],2),k("div",{class:V(m(e).region),"aria-labelledby":"title-transition"},[l[17]||(h(-1),(l[17]=k("h3",{id:"title-transition"},[l[32]||(l[32]=D(" 轉場(Transition) "))])).cacheIndex=17,h(1),l[17]),l[18]||(h(-1),(l[18]=k("label",{id:"transition-position"},[l[33]||(l[33]=D("Position(ms)"))])).cacheIndex=18,h(1),l[18]),_(U,{label:"#transition-position",max:m(Du),step:"50","model-value":m(n).transition.pos,"onUpdate:modelValue":l[19]||(l[19]=e=>y(e,"pos"))},null,8,["max","model-value"]),l[20]||(h(-1),(l[20]=k("label",{id:"transition-color"},[l[34]||(l[34]=D("Color(ms)"))])).cacheIndex=20,h(1),l[20]),G([u.M],(()=>_(U,{label:"#transition-color",max:m(Ou),step:"50","model-value":u.M,"onUpdate:modelValue":l[21]||(l[21]=e=>y(e,"color")),onKeydown:d},null,8,["max","model-value"])),l,22)],2)],64)):C("",!0)])),_:1},8,["overlayProps","modelValue","tab-idx"]))}});export{q as default};