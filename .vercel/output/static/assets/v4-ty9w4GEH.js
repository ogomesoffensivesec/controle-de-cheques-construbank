import{c}from"./index-1L3QXtjl.js";/**
 * @license lucide-react v0.456.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=c("Pen",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]]),e=[];for(let n=0;n<256;++n)e.push((n+256).toString(16).slice(1));function i(n,t=0){return(e[n[t+0]]+e[n[t+1]]+e[n[t+2]]+e[n[t+3]]+"-"+e[n[t+4]]+e[n[t+5]]+"-"+e[n[t+6]]+e[n[t+7]]+"-"+e[n[t+8]]+e[n[t+9]]+"-"+e[n[t+10]]+e[n[t+11]]+e[n[t+12]]+e[n[t+13]]+e[n[t+14]]+e[n[t+15]]).toLowerCase()}let d;const p=new Uint8Array(16);function a(){if(!d){if(typeof crypto>"u"||!crypto.getRandomValues)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");d=crypto.getRandomValues.bind(crypto)}return d(p)}const y=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto),o={randomUUID:y};function g(n,t,m){if(o.randomUUID&&!t&&!n)return o.randomUUID();n=n||{};const u=n.random||(n.rng||a)();return u[6]=u[6]&15|64,u[8]=u[8]&63|128,i(u)}export{U as P,g as v};
