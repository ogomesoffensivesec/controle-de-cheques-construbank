import{M as ae,r as s,P as A,j as f,S as L,V as O,U as C,aL as P,aM as ie,H as $}from"./index-bemzWiEF.js";import{u as de,c as ue}from"./index-CL9-UuGV.js";function he(e,o){return s.useReducer((r,n)=>o[r][n]??r,e)}var U="ScrollArea",[q,Le]=ae(U),[fe,m]=q(U),G=s.forwardRef((e,o)=>{const{__scopeScrollArea:r,type:n="hover",dir:t,scrollHideDelay:l=600,...c}=e,[a,i]=s.useState(null),[h,d]=s.useState(null),[b,u]=s.useState(null),[S,v]=s.useState(null),[T,X]=s.useState(null),[x,_]=s.useState(0),[Y,D]=s.useState(0),[j,y]=s.useState(!1),[N,H]=s.useState(!1),p=A(o,R=>i(R)),w=de(t);return f.jsx(fe,{scope:r,type:n,dir:w,scrollHideDelay:l,scrollArea:a,viewport:h,onViewportChange:d,content:b,onContentChange:u,scrollbarX:S,onScrollbarXChange:v,scrollbarXEnabled:j,onScrollbarXEnabledChange:y,scrollbarY:T,onScrollbarYChange:X,scrollbarYEnabled:N,onScrollbarYEnabledChange:H,onCornerWidthChange:_,onCornerHeightChange:D,children:f.jsx(L.div,{dir:w,...c,ref:p,style:{position:"relative","--radix-scroll-area-corner-width":x+"px","--radix-scroll-area-corner-height":Y+"px",...e.style}})})});G.displayName=U;var J="ScrollAreaViewport",K=s.forwardRef((e,o)=>{const{__scopeScrollArea:r,children:n,nonce:t,...l}=e,c=m(J,r),a=s.useRef(null),i=A(o,a,c.onViewportChange);return f.jsxs(f.Fragment,{children:[f.jsx("style",{dangerouslySetInnerHTML:{__html:"[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}"},nonce:t}),f.jsx(L.div,{"data-radix-scroll-area-viewport":"",...l,ref:i,style:{overflowX:c.scrollbarXEnabled?"scroll":"hidden",overflowY:c.scrollbarYEnabled?"scroll":"hidden",...e.style},children:f.jsx("div",{ref:c.onContentChange,style:{minWidth:"100%",display:"table"},children:n})})]})});K.displayName=J;var g="ScrollAreaScrollbar",V=s.forwardRef((e,o)=>{const{forceMount:r,...n}=e,t=m(g,e.__scopeScrollArea),{onScrollbarXEnabledChange:l,onScrollbarYEnabledChange:c}=t,a=e.orientation==="horizontal";return s.useEffect(()=>(a?l(!0):c(!0),()=>{a?l(!1):c(!1)}),[a,l,c]),t.type==="hover"?f.jsx(be,{...n,ref:o,forceMount:r}):t.type==="scroll"?f.jsx(Se,{...n,ref:o,forceMount:r}):t.type==="auto"?f.jsx(Q,{...n,ref:o,forceMount:r}):t.type==="always"?f.jsx(B,{...n,ref:o}):null});V.displayName=g;var be=s.forwardRef((e,o)=>{const{forceMount:r,...n}=e,t=m(g,e.__scopeScrollArea),[l,c]=s.useState(!1);return s.useEffect(()=>{const a=t.scrollArea;let i=0;if(a){const h=()=>{window.clearTimeout(i),c(!0)},d=()=>{i=window.setTimeout(()=>c(!1),t.scrollHideDelay)};return a.addEventListener("pointerenter",h),a.addEventListener("pointerleave",d),()=>{window.clearTimeout(i),a.removeEventListener("pointerenter",h),a.removeEventListener("pointerleave",d)}}},[t.scrollArea,t.scrollHideDelay]),f.jsx(O,{present:r||l,children:f.jsx(Q,{"data-state":l?"visible":"hidden",...n,ref:o})})}),Se=s.forwardRef((e,o)=>{const{forceMount:r,...n}=e,t=m(g,e.__scopeScrollArea),l=e.orientation==="horizontal",c=M(()=>i("SCROLL_END"),100),[a,i]=he("hidden",{hidden:{SCROLL:"scrolling"},scrolling:{SCROLL_END:"idle",POINTER_ENTER:"interacting"},interacting:{SCROLL:"interacting",POINTER_LEAVE:"idle"},idle:{HIDE:"hidden",SCROLL:"scrolling",POINTER_ENTER:"interacting"}});return s.useEffect(()=>{if(a==="idle"){const h=window.setTimeout(()=>i("HIDE"),t.scrollHideDelay);return()=>window.clearTimeout(h)}},[a,t.scrollHideDelay,i]),s.useEffect(()=>{const h=t.viewport,d=l?"scrollLeft":"scrollTop";if(h){let b=h[d];const u=()=>{const S=h[d];b!==S&&(i("SCROLL"),c()),b=S};return h.addEventListener("scroll",u),()=>h.removeEventListener("scroll",u)}},[t.viewport,l,i,c]),f.jsx(O,{present:r||a!=="hidden",children:f.jsx(B,{"data-state":a==="hidden"?"hidden":"visible",...n,ref:o,onPointerEnter:C(e.onPointerEnter,()=>i("POINTER_ENTER")),onPointerLeave:C(e.onPointerLeave,()=>i("POINTER_LEAVE"))})})}),Q=s.forwardRef((e,o)=>{const r=m(g,e.__scopeScrollArea),{forceMount:n,...t}=e,[l,c]=s.useState(!1),a=e.orientation==="horizontal",i=M(()=>{if(r.viewport){const h=r.viewport.offsetWidth<r.viewport.scrollWidth,d=r.viewport.offsetHeight<r.viewport.scrollHeight;c(a?h:d)}},10);return E(r.viewport,i),E(r.content,i),f.jsx(O,{present:n||l,children:f.jsx(B,{"data-state":l?"visible":"hidden",...t,ref:o})})}),B=s.forwardRef((e,o)=>{const{orientation:r="vertical",...n}=e,t=m(g,e.__scopeScrollArea),l=s.useRef(null),c=s.useRef(0),[a,i]=s.useState({content:0,viewport:0,scrollbar:{size:0,paddingStart:0,paddingEnd:0}}),h=te(a.viewport,a.content),d={...n,sizes:a,onSizesChange:i,hasThumb:h>0&&h<1,onThumbChange:u=>l.current=u,onThumbPointerUp:()=>c.current=0,onThumbPointerDown:u=>c.current=u};function b(u,S){return xe(u,c.current,a,S)}return r==="horizontal"?f.jsx(pe,{...d,ref:o,onThumbPositionChange:()=>{if(t.viewport&&l.current){const u=t.viewport.scrollLeft,S=F(u,a,t.dir);l.current.style.transform=`translate3d(${S}px, 0, 0)`}},onWheelScroll:u=>{t.viewport&&(t.viewport.scrollLeft=u)},onDragScroll:u=>{t.viewport&&(t.viewport.scrollLeft=b(u,t.dir))}}):r==="vertical"?f.jsx(ve,{...d,ref:o,onThumbPositionChange:()=>{if(t.viewport&&l.current){const u=t.viewport.scrollTop,S=F(u,a);l.current.style.transform=`translate3d(0, ${S}px, 0)`}},onWheelScroll:u=>{t.viewport&&(t.viewport.scrollTop=u)},onDragScroll:u=>{t.viewport&&(t.viewport.scrollTop=b(u))}}):null}),pe=s.forwardRef((e,o)=>{const{sizes:r,onSizesChange:n,...t}=e,l=m(g,e.__scopeScrollArea),[c,a]=s.useState(),i=s.useRef(null),h=A(o,i,l.onScrollbarXChange);return s.useEffect(()=>{i.current&&a(getComputedStyle(i.current))},[i]),f.jsx(ee,{"data-orientation":"horizontal",...t,ref:h,sizes:r,style:{bottom:0,left:l.dir==="rtl"?"var(--radix-scroll-area-corner-width)":0,right:l.dir==="ltr"?"var(--radix-scroll-area-corner-width)":0,"--radix-scroll-area-thumb-width":I(r)+"px",...e.style},onThumbPointerDown:d=>e.onThumbPointerDown(d.x),onDragScroll:d=>e.onDragScroll(d.x),onWheelScroll:(d,b)=>{if(l.viewport){const u=l.viewport.scrollLeft+d.deltaX;e.onWheelScroll(u),le(u,b)&&d.preventDefault()}},onResize:()=>{i.current&&l.viewport&&c&&n({content:l.viewport.scrollWidth,viewport:l.viewport.offsetWidth,scrollbar:{size:i.current.clientWidth,paddingStart:z(c.paddingLeft),paddingEnd:z(c.paddingRight)}})}})}),ve=s.forwardRef((e,o)=>{const{sizes:r,onSizesChange:n,...t}=e,l=m(g,e.__scopeScrollArea),[c,a]=s.useState(),i=s.useRef(null),h=A(o,i,l.onScrollbarYChange);return s.useEffect(()=>{i.current&&a(getComputedStyle(i.current))},[i]),f.jsx(ee,{"data-orientation":"vertical",...t,ref:h,sizes:r,style:{top:0,right:l.dir==="ltr"?0:void 0,left:l.dir==="rtl"?0:void 0,bottom:"var(--radix-scroll-area-corner-height)","--radix-scroll-area-thumb-height":I(r)+"px",...e.style},onThumbPointerDown:d=>e.onThumbPointerDown(d.y),onDragScroll:d=>e.onDragScroll(d.y),onWheelScroll:(d,b)=>{if(l.viewport){const u=l.viewport.scrollTop+d.deltaY;e.onWheelScroll(u),le(u,b)&&d.preventDefault()}},onResize:()=>{i.current&&l.viewport&&c&&n({content:l.viewport.scrollHeight,viewport:l.viewport.offsetHeight,scrollbar:{size:i.current.clientHeight,paddingStart:z(c.paddingTop),paddingEnd:z(c.paddingBottom)}})}})}),[me,Z]=q(g),ee=s.forwardRef((e,o)=>{const{__scopeScrollArea:r,sizes:n,hasThumb:t,onThumbChange:l,onThumbPointerUp:c,onThumbPointerDown:a,onThumbPositionChange:i,onDragScroll:h,onWheelScroll:d,onResize:b,...u}=e,S=m(g,r),[v,T]=s.useState(null),X=A(o,p=>T(p)),x=s.useRef(null),_=s.useRef(""),Y=S.viewport,D=n.content-n.viewport,j=P(d),y=P(i),N=M(b,10);function H(p){if(x.current){const w=p.clientX-x.current.left,R=p.clientY-x.current.top;h({x:w,y:R})}}return s.useEffect(()=>{const p=w=>{const R=w.target;(v==null?void 0:v.contains(R))&&j(w,D)};return document.addEventListener("wheel",p,{passive:!1}),()=>document.removeEventListener("wheel",p,{passive:!1})},[Y,v,D,j]),s.useEffect(y,[n,y]),E(v,N),E(S.content,N),f.jsx(me,{scope:r,scrollbar:v,hasThumb:t,onThumbChange:P(l),onThumbPointerUp:P(c),onThumbPositionChange:y,onThumbPointerDown:P(a),children:f.jsx(L.div,{...u,ref:X,style:{position:"absolute",...u.style},onPointerDown:C(e.onPointerDown,p=>{p.button===0&&(p.target.setPointerCapture(p.pointerId),x.current=v.getBoundingClientRect(),_.current=document.body.style.webkitUserSelect,document.body.style.webkitUserSelect="none",S.viewport&&(S.viewport.style.scrollBehavior="auto"),H(p))}),onPointerMove:C(e.onPointerMove,H),onPointerUp:C(e.onPointerUp,p=>{const w=p.target;w.hasPointerCapture(p.pointerId)&&w.releasePointerCapture(p.pointerId),document.body.style.webkitUserSelect=_.current,S.viewport&&(S.viewport.style.scrollBehavior=""),x.current=null})})})}),W="ScrollAreaThumb",re=s.forwardRef((e,o)=>{const{forceMount:r,...n}=e,t=Z(W,e.__scopeScrollArea);return f.jsx(O,{present:r||t.hasThumb,children:f.jsx(we,{ref:o,...n})})}),we=s.forwardRef((e,o)=>{const{__scopeScrollArea:r,style:n,...t}=e,l=m(W,r),c=Z(W,r),{onThumbPositionChange:a}=c,i=A(o,b=>c.onThumbChange(b)),h=s.useRef(),d=M(()=>{h.current&&(h.current(),h.current=void 0)},100);return s.useEffect(()=>{const b=l.viewport;if(b){const u=()=>{if(d(),!h.current){const S=Pe(b,a);h.current=S,a()}};return a(),b.addEventListener("scroll",u),()=>b.removeEventListener("scroll",u)}},[l.viewport,d,a]),f.jsx(L.div,{"data-state":c.hasThumb?"visible":"hidden",...t,ref:i,style:{width:"var(--radix-scroll-area-thumb-width)",height:"var(--radix-scroll-area-thumb-height)",...n},onPointerDownCapture:C(e.onPointerDownCapture,b=>{const S=b.target.getBoundingClientRect(),v=b.clientX-S.left,T=b.clientY-S.top;c.onThumbPointerDown({x:v,y:T})}),onPointerUp:C(e.onPointerUp,c.onThumbPointerUp)})});re.displayName=W;var k="ScrollAreaCorner",oe=s.forwardRef((e,o)=>{const r=m(k,e.__scopeScrollArea),n=!!(r.scrollbarX&&r.scrollbarY);return r.type!=="scroll"&&n?f.jsx(ge,{...e,ref:o}):null});oe.displayName=k;var ge=s.forwardRef((e,o)=>{const{__scopeScrollArea:r,...n}=e,t=m(k,r),[l,c]=s.useState(0),[a,i]=s.useState(0),h=!!(l&&a);return E(t.scrollbarX,()=>{var b;const d=((b=t.scrollbarX)==null?void 0:b.offsetHeight)||0;t.onCornerHeightChange(d),i(d)}),E(t.scrollbarY,()=>{var b;const d=((b=t.scrollbarY)==null?void 0:b.offsetWidth)||0;t.onCornerWidthChange(d),c(d)}),h?f.jsx(L.div,{...n,ref:o,style:{width:l,height:a,position:"absolute",right:t.dir==="ltr"?0:void 0,left:t.dir==="rtl"?0:void 0,bottom:0,...e.style}}):null});function z(e){return e?parseInt(e,10):0}function te(e,o){const r=e/o;return isNaN(r)?0:r}function I(e){const o=te(e.viewport,e.content),r=e.scrollbar.paddingStart+e.scrollbar.paddingEnd,n=(e.scrollbar.size-r)*o;return Math.max(n,18)}function xe(e,o,r,n="ltr"){const t=I(r),l=t/2,c=o||l,a=t-c,i=r.scrollbar.paddingStart+c,h=r.scrollbar.size-r.scrollbar.paddingEnd-a,d=r.content-r.viewport,b=n==="ltr"?[0,d]:[d*-1,0];return ne([i,h],b)(e)}function F(e,o,r="ltr"){const n=I(o),t=o.scrollbar.paddingStart+o.scrollbar.paddingEnd,l=o.scrollbar.size-t,c=o.content-o.viewport,a=l-n,i=r==="ltr"?[0,c]:[c*-1,0],h=ue(e,i);return ne([0,c],[0,a])(h)}function ne(e,o){return r=>{if(e[0]===e[1]||o[0]===o[1])return o[0];const n=(o[1]-o[0])/(e[1]-e[0]);return o[0]+n*(r-e[0])}}function le(e,o){return e>0&&e<o}var Pe=(e,o=()=>{})=>{let r={left:e.scrollLeft,top:e.scrollTop},n=0;return function t(){const l={left:e.scrollLeft,top:e.scrollTop},c=r.left!==l.left,a=r.top!==l.top;(c||a)&&o(),r=l,n=window.requestAnimationFrame(t)}(),()=>window.cancelAnimationFrame(n)};function M(e,o){const r=P(e),n=s.useRef(0);return s.useEffect(()=>()=>window.clearTimeout(n.current),[]),s.useCallback(()=>{window.clearTimeout(n.current),n.current=window.setTimeout(r,o)},[r,o])}function E(e,o){const r=P(o);ie(()=>{let n=0;if(e){const t=new ResizeObserver(()=>{cancelAnimationFrame(n),n=window.requestAnimationFrame(r)});return t.observe(e),()=>{window.cancelAnimationFrame(n),t.unobserve(e)}}},[e,r])}var se=G,Ce=K,Re=oe;const Ee=s.forwardRef(({className:e,children:o,...r},n)=>f.jsxs(se,{ref:n,className:$("relative overflow-hidden",e),...r,children:[f.jsx(Ce,{className:"h-full w-full rounded-[inherit]",children:o}),f.jsx(ce,{}),f.jsx(Re,{})]}));Ee.displayName=se.displayName;const ce=s.forwardRef(({className:e,orientation:o="vertical",...r},n)=>f.jsx(V,{ref:n,orientation:o,className:$("flex touch-none select-none transition-colors",o==="vertical"&&"h-full w-2.5 border-l border-l-transparent p-[1px]",o==="horizontal"&&"h-2.5 flex-col border-t border-t-transparent p-[1px]",e),...r,children:f.jsx(re,{className:"relative flex-1 rounded-full bg-border"})}));ce.displayName=V.displayName;export{Ee as S};
