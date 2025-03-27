import{d as a,c as e,ad as l,ae as t,a5 as o,ah as s,ab as n,m as r,o as p,k as i,q as c,j as d,_ as u,H as k,e as _,ag as b,ac as y,N as m,l as v,L as f,a6 as C,f as x,u as g,t as h,B,J as P,b as $,r as V,w as H,n as O,h as W,p as j,F as w,D,I as E}from"./index-DpNDWNaK.js";import{_ as I}from"./VDialog.vue_vue_type_style_index_0_lang-BDYtSdYt.js";const R={bookmarkers:"_bookmarkers_d319836",pageContent:"_pageContent_67ce6da",delWrapper:"_delWrapper_1c89be3",paletteBlock:"_paletteBlock_dbd98a9",colorBlock:"_colorBlock_fe3c75e",caretWrapper:"_caretWrapper_815895c",appendPlt:"_appendPlt_eb9ea18"},U=a({__name:"ColorBlock",props:{hex:{}},setup(a){const f=a,C=e((()=>l(t(f.hex))>127.5)),x=e((()=>({filter:o(C)?"invert(1)":void 0}))),g=s(),h=()=>{g.favColorsChanged(f.hex)};return(a,e)=>n([a.hex],(()=>(p(),r("li",{class:v(_(R).colorBlock),style:k({backgroundColor:f.hex})},[i(y,{location:"top",text:"Copied",openOnHover:!1,openOnClick:"",eager:!1},{activator:d((({handleClick:a})=>[i(u,{class:"ripple",style:k(x.value),"prepend-icon":"copy",text:f.hex,"aria-label":`複製HEX碼${f.hex}`,variant:"flat",onClick:e=>{_(b)(f.hex),a(e)}},null,8,["style","text","aria-label","onClick"])])),l:1}),c("span",{class:v(_(R).delWrapper)},[c("button",{type:"button","aria-label":"刪除書籤",onClick:h},[i(m,{type:"trash3-fill"})])],2)],6))),e,0)}}),X=["onClick"],q=a({__name:"PaletteBlock",props:{plt:{}},setup(a){const l=a,t=f(l.plt.split("-"),(a=>`#${a}`)),n=e((()=>C(1/t.length,2))),u=e((()=>`linear-gradient(90deg, ${x(t,((a,e,l)=>a+=`${e} ${l*o(n)}%,${e} ${(l+1)*o(n)}%,`),"").slice(0,-1)})`)),$=g(),V=s(),H=()=>{for(const a of t)if(!P(a))return;$.setPlt(t)},O=()=>V.favPltsChanged(l.plt);return(a,e)=>(p(),r("li",{class:v(_(R).paletteBlock)},[c("div",{style:k({background:u.value})},[c("div",{class:v(_(R).caretWrapper)},[c("button",{type:"button","aria-label":"開啟書籤",onClick:H},[i(m,{type:"caret-left-fill"})])],2),c("span",{class:v(_(R).delWrapper)},[c("button",{type:"button","aria-label":"刪除書籤",onClick:O},[i(m,{type:"trash3-fill"})])],2)],4),i(y,{location:"top",text:"Copied",openOnHover:!1,openOnClick:"",eager:!1},{activator:d((({handleClick:l})=>[c("button",{type:"button",class:"btn ripple","aria-label":"複製調色盤HEX碼",onClick:e=>{_(b)(a.plt),l(e)}},[e[0]||(e[0]=c("div",{class:"btn__overlay"},null,-1)),h(" "+B(a.plt),1)],8,X)])),l:1})],2))}}),A=a({__name:"VBookmarks",props:{modelValue:{type:Boolean},modelModifiers:{}},emits:["update:modelValue"],setup(a){const l=$(a,"modelValue"),t=V(),n=["Colors","Palettes"],k=V(0);H(l,(async a=>{var e,l;await O(),a?null==(l=null==(e=_(t))?void 0:e.tabRefs[_(k)])||l.$el.focus():y.setEditingIdx()}));const b=a=>{var e,s;E(a)&&(a.preventDefault(),o(k)!==n.length-1?null==(s=null==(e=_(t))?void 0:e.tabRefs[++k.value])||s.$el.focus():l.value=!1)},y=g(),m=s(),C=e((()=>f(y.cards,(({hex:a})=>a.slice(1))).join("-"))),x=e((()=>m.plts.includes(o(C))?{icon:"bookmark-dash",text:"Remove Pallete"}:{icon:"bookmark-plus",text:"Append Pallete"})),h=()=>{m.favPltsChanged(o(C)),k.value=1};return(a,e)=>(p(),W(I,{ref_key:"dialogRef",ref:t,overlayProps:{contentClass:_(R).bookmarkers},title:"書籤",tabs:n,transparent:!1,transition:"slide-x",modelValue:l.value,"onUpdate:modelValue":e[0]||(e[0]=a=>l.value=a),"tab-idx":k.value,"onUpdate:tabIdx":e[1]||(e[1]=a=>k.value=a)},{actions:d((()=>[i(u,{class:v(_(R).appendPlt),"prepend-icon":x.value.icon,text:x.value.text,onKeydown:b,onClick:h},null,8,["class","prepend-icon","text"])])),default:d((()=>[c("ul",{class:v(_(R).pageContent)},[0===k.value?(p(!0),r(w,{key:0},D(_(m).colors,(a=>(p(),W(U,{key:`favColor ${a}`,hex:a},null,8,["hex"])))),128)):1===k.value?(p(!0),r(w,{key:1},D(_(m).plts,(a=>(p(),W(q,{key:`favPlt ${a}`,plt:a},null,8,["plt"])))),128)):j("",!0)],2)])),l:1},8,["overlayProps","modelValue","tab-idx"]))}});export{A as default};
