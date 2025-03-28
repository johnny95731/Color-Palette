import{d as a,c as n,ad as ie,ae as ue,a5 as Z,ah as Ou,ab as re,m as y,o as x,k as b,q as k,j as g,_ as j,H as S,b as m,ag as ke,ac as G,N as ce,l as h,L as oe,a6 as ee,f as l,u as s,t as D,B,J as A,e as c,r as e,w as r,n as p,h as f,p as V,F as U,D as M,I as q}from"./index-C9bz2lB4.js";import{_ as de}from"./VDialog.vue_vue_type_style_index_0_lang-Clt_uVCS.js";const E={bookmarkers:"_bookmarkers_d319836",pageContent:"_pageContent_67ce6da",delWrapper:"_delWrapper_1c89be3",paletteBlock:"_paletteBlock_dbd98a9",colorBlock:"_colorBlock_fe3c75e",caretWrapper:"_caretWrapper_815895c",appendPlt:"_appendPlt_eb9ea18"},F=a({__name:"ColorBlock",props:{hex:{}},setup(a){const e=a,l=n((()=>ie(ue(e.hex))>127.5)),t=n((()=>({filter:Z(l)?"invert(1)":void 0}))),o=Ou(),s=()=>{o.ve(e.hex)};return(a,l)=>re([a.hex],(()=>(x(),y("li",{class:h(m(E).colorBlock),style:S({backgroundColor:e.hex})},[b(G,{location:"top",text:"Copied",openOnHover:!1,openOnClick:"",eager:!1},{activator:g((({handleClick:a})=>[b(j,{class:"ripple",style:S(t.value),"prepend-icon":"copy",text:e.hex,"aria-label":`複製HEX碼${e.hex}`,variant:"flat",onClick:l=>{m(ke)(e.hex),a(l)}},null,8,["style","text","aria-label","onClick"])])),_:1}),k("span",{class:h(m(E).delWrapper)},[k("button",{type:"button","aria-label":"刪除書籤",onClick:s},[b(ce,{type:"trash3-fill"})])],2)],6))),l,0)}}),De=["onClick"],v=a({__name:"PaletteBlock",props:{plt:{}},setup(a){const e=a,t=oe(e.plt.split("-"),(a=>`#${a}`)),o=n((()=>ee(1/t.length,2))),r=n((()=>`linear-gradient(90deg, ${l(t,((a,e,l)=>a+=`${e} ${l*Z(o)}%,${e} ${(l+1)*Z(o)}%,`),"").slice(0,-1)})`)),p=s(),i=Ou(),c=()=>{for(const a of t)if(!A(a))return;p.B(t)},d=()=>i.ye(e.plt);return(a,e)=>(x(),y("li",{class:h(m(E).paletteBlock)},[k("div",{style:S({background:r.value})},[k("div",{class:h(m(E).caretWrapper)},[k("button",{type:"button","aria-label":"開啟書籤",onClick:c},[b(ce,{type:"caret-left-fill"})])],2),k("span",{class:h(m(E).delWrapper)},[k("button",{type:"button","aria-label":"刪除書籤",onClick:d},[b(ce,{type:"trash3-fill"})])],2)],4),b(G,{location:"top",text:"Copied",openOnHover:!1,openOnClick:"",eager:!1},{activator:g((({handleClick:l})=>[k("button",{type:"button",class:"btn ripple","aria-label":"複製調色盤HEX碼",onClick:e=>{m(ke)(a.plt),l(e)}},[e[0]||(e[0]=k("div",{class:"btn__overlay"},null,-1)),D(" "+B(a.plt),1)],8,De)])),_:1})],2))}}),J=a({__name:"VBookmarks",props:{modelValue:{type:Boolean},modelModifiers:{}},emits:["update:modelValue"],setup(a){const l=c(a,"modelValue"),t=e(),o=["Colors","Palettes"],i=e(0);r(l,(async a=>{var e,l;await p(),a?null==(l=null==(e=m(t))?void 0:e.tabRefs[m(i)])||l.$el.focus():u.Pt()}));const d=a=>{var e,s;q(a)&&(a.preventDefault(),Z(i)!==o.length-1?null==(s=null==(e=m(t))?void 0:e.tabRefs[++i.value])||s.$el.focus():l.value=!1)},u=s(),_=Ou(),C=n((()=>oe(u.T,(({yt:a})=>a.slice(1))).join("-"))),B=n((()=>{const a=_.de.includes(Z(C));return{aa:"bookmark-"+(a?"dash":"plus"),ea:(a?"Remove":"Append")+" Pallete"}})),$=()=>{_.ye(Z(C)),i.value=1};return(a,e)=>(x(),f(de,{ref_key:"dialogRef",ref:t,overlayProps:{contentClass:m(E).bookmarkers},title:"書籤",tabs:o,transparent:!1,transition:"slide-x",modelValue:l.value,"onUpdate:modelValue":e[0]||(e[0]=a=>l.value=a),"tab-idx":i.value,"onUpdate:tabIdx":e[1]||(e[1]=a=>i.value=a)},{actions:g((()=>[b(j,{class:h(m(E).appendPlt),"prepend-icon":B.value.aa,text:B.value.ea,onKeydown:d,onClick:$},null,8,["class","prepend-icon","text"])])),default:g((()=>[k("ul",{class:h(m(E).pageContent)},[0===i.value?(x(!0),y(U,{key:0},M(m(_).fe,(a=>(x(),f(F,{key:`favColor ${a}`,hex:a},null,8,["hex"])))),128)):1===i.value?(x(!0),y(U,{key:1},M(m(_).de,(a=>(x(),f(v,{key:`favPlt ${a}`,plt:a},null,8,["plt"])))),128)):V("",!0)],2)])),_:1},8,["overlayProps","modelValue","tab-idx"]))}});export{J as default};