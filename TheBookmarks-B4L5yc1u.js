import{d as e,c as a,W as l,X as t,a2 as s,a3 as o,V as n,l as r,v as c,I as p,y as i,b as u,a0 as d,U as _,s as f,a4 as k,T as y,O as b,G as m,a5 as v,i as C,a6 as x,u as g,r as j,w as B,a7 as $,n as h,q as P,F as V,D as W,x as w,z as D,K as X,a8 as E}from"./index-3Ykjcyu_.js";const H={container:"_container_8eeje_1",header:"_header_8eeje_16",menuBar:"_menuBar_8eeje_37",selected:"_selected_8eeje_48",pageContent:"_pageContent_8eeje_53",delWrapper:"_delWrapper_8eeje_63",paletteBlock:"_paletteBlock_8eeje_85",colorBlock:"_colorBlock_8eeje_85",caretWrapper:"_caretWrapper_8eeje_137",appendPlt:"_appendPlt_8eeje_160"},K=e({__name:"ColorBlock",props:{hex:{}},setup(e){const b=e,m=a((()=>l(t(b.hex))>127.5)),v=a((()=>({filter:s(m)?"invert(1)":void 0}))),C=o(),x=()=>{C.favColorsChanged(b.hex)};return(e,a)=>n([e.hex],(()=>(r(),c("li",{class:y(u(H).colorBlock),style:i({backgroundColor:b.hex})},[p(_,{class:"ripple",style:i(v.value),"prepend-icon":"copy",text:b.hex,"aria-label":`複製HEX碼${b.hex}`,variant:"flat",onClick:a[0]||(a[0]=e=>u(d)(b.hex))},null,8,["style","text","aria-label"]),f("span",{class:y(u(H).delWrapper)},[f("button",{type:"button","aria-label":"刪除書籤",onClick:x},[p(k,{type:"delete"})])],2)],6))),a,1)}}),M=e({__name:"PaletteBlock",props:{plt:{}},setup(e){const l=e,t=l.plt.split("-").map((e=>`#${e}`)),n=a((()=>Math.round(1e4/t.length)/100)),d=a((()=>`linear-gradient(90deg, ${t.reduce(((e,a,l)=>e+=`${a} ${l*s(n)}%,${a} ${(l+1)*s(n)}%,`),"").slice(0,-1)})`)),_=b(),x=o(),g=()=>{for(const e of t)if(!C(e))return;_.setPlt(t)},j=()=>x.favPltsChanged(l.plt);return(e,a)=>(r(),c("li",{class:y(u(H).paletteBlock)},[f("div",{style:i({background:d.value})},[f("div",{class:y(u(H).caretWrapper)},[f("button",{type:"button","aria-label":"開啟書籤",onClick:g},[p(k,{type:"caretLeft"})])],2),f("span",{class:y(u(H).delWrapper)},[f("button",{type:"button","aria-label":"刪除書籤",onClick:j},[p(k,{type:"delete"})])],2)],4),f("button",{type:"button",class:"ripple","aria-label":"複製調色盤HEX碼",onClick:a[0]||(a[0]=(...e)=>u(v)&&u(v)(...e))},m(e.plt),1)],2))}}),T=e({__name:"TheBookmarks",props:{modelValue:{type:Boolean},modelModifiers:{}},emits:x(["focusoutDialog"],["update:modelValue"]),setup(e,{emit:l}){const t=l,n=g(e,"modelValue"),i=["Colors","Palettes"],d=j(0),k=j([]);function v(e){var a;E(e)&&(e.preventDefault(),s(d)!==i.length-1?null==(a=s(k)[++d.value])||a.$el.focus():(n.value=!1,t("focusoutDialog")))}B(n,(async e=>{var a;await $(),e?null==(a=s(k)[s(d)])||a.$el.focus():C.setEditingIdx()}));const C=b(),x=o(),T=a((()=>C.cards.map((e=>e.hex.slice(1))).join("-"))),U=a((()=>x.plts.includes(s(T))?{icon:"unfavPallete",text:"Remove Pallete"}:{icon:"favPallete",text:"Append Pallete"}));function q(){x.favPltsChanged(s(T)),d.value=1}return(e,a)=>(r(),h(X,{"content-class":u(H).container,role:"dialog",type:"offcanvas",eager:!0,transition:"slide-x",modelValue:n.value,"onUpdate:modelValue":a[1]||(a[1]=e=>n.value=e)},{default:P((()=>[f("header",{class:y(u(H).header)},[a[2]||(a[2]=f("h2",null,"書籤",-1)),p(_,{icon:"close","aria-label":"關閉",onClick:a[0]||(a[0]=e=>n.value=!1)})],2),f("div",{class:y(u(H).menuBar)},[(r(),c(V,null,W(i,((e,a)=>p(_,{key:`page ${e}`,ref_for:!0,ref:e=>k.value[a]=e,text:e,class:y(a===d.value?u(H).selected:void 0),onClick:e=>d.value=a},null,8,["text","class","onClick"]))),64))],2),f("ul",{class:y(u(H).pageContent)},[0===d.value?(r(!0),c(V,{key:0},W(u(x).colors,(e=>(r(),h(K,{key:`favColor ${e}`,hex:e},null,8,["hex"])))),128)):1===d.value?(r(!0),c(V,{key:1},W(u(x).plts,(e=>(r(),h(M,{key:`favPlt ${e}`,plt:e},null,8,["plt"])))),128)):w("",!0)],2),p(_,{"prepend-icon":U.value.icon,class:y(u(H).appendPlt),onKeydown:v,onClick:q},{default:P((()=>[D(m(U.value.text),1)])),l:1},8,["prepend-icon","class"])])),l:1},8,["content-class","modelValue"]))}});export{T as default};