import{d as a,ai as e,c as s,as as l,b as t,r as o,w as n,n as d,h as r,o as c,at as i,ak as u,j as f,ab as _,m as b,p as v,au as p,q as k,k as m,B as y,_ as g,F as x,D as V,E as C,l as R,av as h}from"./index-zpM2CxNx.js";const I={key:0},B={key:0,class:"dialog__tabs"},j={key:1,class:"dialog__actions"},w=a({__name:"VDialog",props:e({overlayProps:{},title:{},tabs:{},contentTag:{default:"div"},contentClass:{}},{modelValue:{type:Boolean},modelModifiers:{},tabIdx:{},tabIdxModifiers:{}}),emits:["update:modelValue","update:tabIdx"],setup(a,{expose:e}){const w=a,D=s((()=>{var a;const e=["dialog",null==(a=w.overlayProps)?void 0:a.contentClass];return{...l,...w.overlayProps,contentClass:e}})),M=t(a,"modelValue"),$=o(),q=o(),E=o([]),F=t(a,"tabIdx");F.value??(F.value=0);const P=o();return n(M,(async a=>{var e;await d(),a&&(null==(e=P.value)?void 0:e.$el).focus()})),e({tabRefs:E,overlayContentRef:s((()=>{var a;return null==(a=$.value)?void 0:a.contentRef})),contentRef:q}),(a,e)=>(c(),r(i,u({ref_key:"overlayRef",ref:$},D.value,{modelValue:M.value,"onUpdate:modelValue":e[4]||(e[4]=a=>M.value=a)}),{default:f((()=>[_([a.title],(()=>(c(),b("header",{class:"dialog__header"},[a.title?(c(),b("h2",I,y(a.title),1)):v("",!0),e[5]||(e[5]=k("div",{class:"spacer"},null,-1)),m(g,{ref_key:"closeBtnRef",ref:P,icon:"x-lg","aria-label":"close",onClick:e[0]||(e[0]=a=>M.value=!1)},null,512)]))),e,1),a.tabs?(c(),b("div",B,[(c(!0),b(x,null,V(a.tabs,((a,e,s,l)=>{const t=[F.value];if(l&&l.key===`tab-${e}`&&C(l,t))return l;const o=(c(),r(g,{key:`tab-${e}`,ref_for:!0,ref:a=>E.value[e]=a,class:R(["dialog__tab",e===F.value&&"dialog__tab--selected"]),text:a,onClick:a=>F.value=e},null,8,["class","text","onClick"]));return o.memo=t,o}),e,2),128))])):v("",!0),p(a.$slots,"content",{},(()=>[(c(),r(h(a.contentTag),{ref_key:"contentRef",ref:q,class:R(["dialog__content",a.contentClass])},{default:f((()=>[p(a.$slots,"default")])),l:3},8,["class"]))])),a.$slots.actions?(c(),b("div",j,[p(a.$slots,"actions")])):v("",!0)])),l:3},16,["modelValue"]))}});export{w as _};
