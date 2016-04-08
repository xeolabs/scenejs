/*
 * SceneJS V4.2.2
 *
 * A WebGL-based 3D scene graph from xeoLabs
 * http://scenejs.org/
 *
 * Built on 2016-04-08
 *
 * MIT License
 * Copyright 2016, Lindsay Kay
 * http://xeolabs.com/
 *
 */

/*
 * SceneJS Latest
 *
 * A WebGL-based 3D scene graph from xeoLabs
 * http://scenejs.org/
 *
 * MIT License
 * Copyright 2015, Lindsay Kay
 * http://xeolabs.com/
 *
 */

;// Only define RequireJS if not already present
if (undefined === require) {;/*
 RequireJS 2.1.6 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
 */
var requirejs,require,define;
(function(ba){function J(b){return"[object Function]"===N.call(b)}function K(b){return"[object Array]"===N.call(b)}function z(b,c){if(b){var d;for(d=0;d<b.length&&(!b[d]||!c(b[d],d,b));d+=1);}}function O(b,c){if(b){var d;for(d=b.length-1;-1<d&&(!b[d]||!c(b[d],d,b));d-=1);}}function t(b,c){return ha.call(b,c)}function m(b,c){return t(b,c)&&b[c]}function H(b,c){for(var d in b)if(t(b,d)&&c(b[d],d))break}function S(b,c,d,m){c&&H(c,function(c,l){if(d||!t(b,l))m&&"string"!==typeof c?(b[l]||(b[l]={}),S(b[l],
    c,d,m)):b[l]=c});return b}function v(b,c){return function(){return c.apply(b,arguments)}}function ca(b){throw b;}function da(b){if(!b)return b;var c=ba;z(b.split("."),function(b){c=c[b]});return c}function B(b,c,d,m){c=Error(c+"\nhttp://requirejs.org/docs/errors.html#"+b);c.requireType=b;c.requireModules=m;d&&(c.originalError=d);return c}function ia(b){function c(a,f,C){var e,n,b,c,d,T,k,g=f&&f.split("/");e=g;var l=j.map,h=l&&l["*"];if(a&&"."===a.charAt(0))if(f){e=m(j.pkgs,f)?g=[f]:g.slice(0,g.length-
    1);f=a=e.concat(a.split("/"));for(e=0;f[e];e+=1)if(n=f[e],"."===n)f.splice(e,1),e-=1;else if(".."===n)if(1===e&&(".."===f[2]||".."===f[0]))break;else 0<e&&(f.splice(e-1,2),e-=2);e=m(j.pkgs,f=a[0]);a=a.join("/");e&&a===f+"/"+e.main&&(a=f)}else 0===a.indexOf("./")&&(a=a.substring(2));if(C&&l&&(g||h)){f=a.split("/");for(e=f.length;0<e;e-=1){b=f.slice(0,e).join("/");if(g)for(n=g.length;0<n;n-=1)if(C=m(l,g.slice(0,n).join("/")))if(C=m(C,b)){c=C;d=e;break}if(c)break;!T&&(h&&m(h,b))&&(T=m(h,b),k=e)}!c&&
    T&&(c=T,d=k);c&&(f.splice(0,d,c),a=f.join("/"))}return a}function d(a){A&&z(document.getElementsByTagName("script"),function(f){if(f.getAttribute("data-requiremodule")===a&&f.getAttribute("data-requirecontext")===k.contextName)return f.parentNode.removeChild(f),!0})}function p(a){var f=m(j.paths,a);if(f&&K(f)&&1<f.length)return d(a),f.shift(),k.require.undef(a),k.require([a]),!0}function g(a){var f,b=a?a.indexOf("!"):-1;-1<b&&(f=a.substring(0,b),a=a.substring(b+1,a.length));return[f,a]}function l(a,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          f,b,e){var n,D,i=null,d=f?f.name:null,l=a,h=!0,j="";a||(h=!1,a="_@r"+(N+=1));a=g(a);i=a[0];a=a[1];i&&(i=c(i,d,e),D=m(r,i));a&&(i?j=D&&D.normalize?D.normalize(a,function(a){return c(a,d,e)}):c(a,d,e):(j=c(a,d,e),a=g(j),i=a[0],j=a[1],b=!0,n=k.nameToUrl(j)));b=i&&!D&&!b?"_unnormalized"+(O+=1):"";return{prefix:i,name:j,parentMap:f,unnormalized:!!b,url:n,originalName:l,isDefine:h,id:(i?i+"!"+j:j)+b}}function s(a){var f=a.id,b=m(q,f);b||(b=q[f]=new k.Module(a));return b}function u(a,f,b){var e=a.id,n=m(q,
    e);if(t(r,e)&&(!n||n.defineEmitComplete))"defined"===f&&b(r[e]);else if(n=s(a),n.error&&"error"===f)b(n.error);else n.on(f,b)}function w(a,f){var b=a.requireModules,e=!1;if(f)f(a);else if(z(b,function(f){if(f=m(q,f))f.error=a,f.events.error&&(e=!0,f.emit("error",a))}),!e)h.onError(a)}function x(){U.length&&(ja.apply(I,[I.length-1,0].concat(U)),U=[])}function y(a){delete q[a];delete W[a]}function G(a,f,b){var e=a.map.id;a.error?a.emit("error",a.error):(f[e]=!0,z(a.depMaps,function(e,c){var d=e.id,
    g=m(q,d);g&&(!a.depMatched[c]&&!b[d])&&(m(f,d)?(a.defineDep(c,r[d]),a.check()):G(g,f,b))}),b[e]=!0)}function E(){var a,f,b,e,n=(b=1E3*j.waitSeconds)&&k.startTime+b<(new Date).getTime(),c=[],i=[],g=!1,l=!0;if(!X){X=!0;H(W,function(b){a=b.map;f=a.id;if(b.enabled&&(a.isDefine||i.push(b),!b.error))if(!b.inited&&n)p(f)?g=e=!0:(c.push(f),d(f));else if(!b.inited&&(b.fetched&&a.isDefine)&&(g=!0,!a.prefix))return l=!1});if(n&&c.length)return b=B("timeout","Load timeout for modules: "+c,null,c),b.contextName=
    k.contextName,w(b);l&&z(i,function(a){G(a,{},{})});if((!n||e)&&g)if((A||ea)&&!Y)Y=setTimeout(function(){Y=0;E()},50);X=!1}}function F(a){t(r,a[0])||s(l(a[0],null,!0)).init(a[1],a[2])}function L(a){var a=a.currentTarget||a.srcElement,b=k.onScriptLoad;a.detachEvent&&!Z?a.detachEvent("onreadystatechange",b):a.removeEventListener("load",b,!1);b=k.onScriptError;(!a.detachEvent||Z)&&a.removeEventListener("error",b,!1);return{node:a,id:a&&a.getAttribute("data-requiremodule")}}function M(){var a;for(x();I.length;){a=
    I.shift();if(null===a[0])return w(B("mismatch","Mismatched anonymous define() module: "+a[a.length-1]));F(a)}}var X,$,k,P,Y,j={waitSeconds:7,baseUrl:"./",paths:{},pkgs:{},shim:{},config:{}},q={},W={},aa={},I=[],r={},V={},N=1,O=1;P={require:function(a){return a.require?a.require:a.require=k.makeRequire(a.map)},exports:function(a){a.usingExports=!0;if(a.map.isDefine)return a.exports?a.exports:a.exports=r[a.map.id]={}},module:function(a){return a.module?a.module:a.module={id:a.map.id,uri:a.map.url,config:function(){var b=
    m(j.pkgs,a.map.id);return(b?m(j.config,a.map.id+"/"+b.main):m(j.config,a.map.id))||{}},exports:r[a.map.id]}}};$=function(a){this.events=m(aa,a.id)||{};this.map=a;this.shim=m(j.shim,a.id);this.depExports=[];this.depMaps=[];this.depMatched=[];this.pluginMaps={};this.depCount=0};$.prototype={init:function(a,b,c,e){e=e||{};if(!this.inited){this.factory=b;if(c)this.on("error",c);else this.events.error&&(c=v(this,function(a){this.emit("error",a)}));this.depMaps=a&&a.slice(0);this.errback=c;this.inited=
    !0;this.ignore=e.ignore;e.enabled||this.enabled?this.enable():this.check()}},defineDep:function(a,b){this.depMatched[a]||(this.depMatched[a]=!0,this.depCount-=1,this.depExports[a]=b)},fetch:function(){if(!this.fetched){this.fetched=!0;k.startTime=(new Date).getTime();var a=this.map;if(this.shim)k.makeRequire(this.map,{enableBuildCallback:!0})(this.shim.deps||[],v(this,function(){return a.prefix?this.callPlugin():this.load()}));else return a.prefix?this.callPlugin():this.load()}},load:function(){var a=
    this.map.url;V[a]||(V[a]=!0,k.load(this.map.id,a))},check:function(){if(this.enabled&&!this.enabling){var a,b,c=this.map.id;b=this.depExports;var e=this.exports,n=this.factory;if(this.inited)if(this.error)this.emit("error",this.error);else{if(!this.defining){this.defining=!0;if(1>this.depCount&&!this.defined){if(J(n)){if(this.events.error&&this.map.isDefine||h.onError!==ca)try{e=k.execCb(c,n,b,e)}catch(d){a=d}else e=k.execCb(c,n,b,e);this.map.isDefine&&((b=this.module)&&void 0!==b.exports&&b.exports!==
    this.exports?e=b.exports:void 0===e&&this.usingExports&&(e=this.exports));if(a)return a.requireMap=this.map,a.requireModules=this.map.isDefine?[this.map.id]:null,a.requireType=this.map.isDefine?"define":"require",w(this.error=a)}else e=n;this.exports=e;if(this.map.isDefine&&!this.ignore&&(r[c]=e,h.onResourceLoad))h.onResourceLoad(k,this.map,this.depMaps);y(c);this.defined=!0}this.defining=!1;this.defined&&!this.defineEmitted&&(this.defineEmitted=!0,this.emit("defined",this.exports),this.defineEmitComplete=
    !0)}}else this.fetch()}},callPlugin:function(){var a=this.map,b=a.id,d=l(a.prefix);this.depMaps.push(d);u(d,"defined",v(this,function(e){var n,d;d=this.map.name;var g=this.map.parentMap?this.map.parentMap.name:null,C=k.makeRequire(a.parentMap,{enableBuildCallback:!0});if(this.map.unnormalized){if(e.normalize&&(d=e.normalize(d,function(a){return c(a,g,!0)})||""),e=l(a.prefix+"!"+d,this.map.parentMap),u(e,"defined",v(this,function(a){this.init([],function(){return a},null,{enabled:!0,ignore:!0})})),
    d=m(q,e.id)){this.depMaps.push(e);if(this.events.error)d.on("error",v(this,function(a){this.emit("error",a)}));d.enable()}}else n=v(this,function(a){this.init([],function(){return a},null,{enabled:!0})}),n.error=v(this,function(a){this.inited=!0;this.error=a;a.requireModules=[b];H(q,function(a){0===a.map.id.indexOf(b+"_unnormalized")&&y(a.map.id)});w(a)}),n.fromText=v(this,function(e,c){var d=a.name,g=l(d),i=Q;c&&(e=c);i&&(Q=!1);s(g);t(j.config,b)&&(j.config[d]=j.config[b]);try{h.exec(e)}catch(D){return w(B("fromtexteval",
    "fromText eval for "+b+" failed: "+D,D,[b]))}i&&(Q=!0);this.depMaps.push(g);k.completeLoad(d);C([d],n)}),e.load(a.name,C,n,j)}));k.enable(d,this);this.pluginMaps[d.id]=d},enable:function(){W[this.map.id]=this;this.enabling=this.enabled=!0;z(this.depMaps,v(this,function(a,b){var c,e;if("string"===typeof a){a=l(a,this.map.isDefine?this.map:this.map.parentMap,!1,!this.skipMap);this.depMaps[b]=a;if(c=m(P,a.id)){this.depExports[b]=c(this);return}this.depCount+=1;u(a,"defined",v(this,function(a){this.defineDep(b,
    a);this.check()}));this.errback&&u(a,"error",v(this,this.errback))}c=a.id;e=q[c];!t(P,c)&&(e&&!e.enabled)&&k.enable(a,this)}));H(this.pluginMaps,v(this,function(a){var b=m(q,a.id);b&&!b.enabled&&k.enable(a,this)}));this.enabling=!1;this.check()},on:function(a,b){var c=this.events[a];c||(c=this.events[a]=[]);c.push(b)},emit:function(a,b){z(this.events[a],function(a){a(b)});"error"===a&&delete this.events[a]}};k={config:j,contextName:b,registry:q,defined:r,urlFetched:V,defQueue:I,Module:$,makeModuleMap:l,
    nextTick:h.nextTick,onError:w,configure:function(a){a.baseUrl&&"/"!==a.baseUrl.charAt(a.baseUrl.length-1)&&(a.baseUrl+="/");var b=j.pkgs,c=j.shim,e={paths:!0,config:!0,map:!0};H(a,function(a,b){e[b]?"map"===b?(j.map||(j.map={}),S(j[b],a,!0,!0)):S(j[b],a,!0):j[b]=a});a.shim&&(H(a.shim,function(a,b){K(a)&&(a={deps:a});if((a.exports||a.init)&&!a.exportsFn)a.exportsFn=k.makeShimExports(a);c[b]=a}),j.shim=c);a.packages&&(z(a.packages,function(a){a="string"===typeof a?{name:a}:a;b[a.name]={name:a.name,
        location:a.location||a.name,main:(a.main||"main").replace(ka,"").replace(fa,"")}}),j.pkgs=b);H(q,function(a,b){!a.inited&&!a.map.unnormalized&&(a.map=l(b))});if(a.deps||a.callback)k.require(a.deps||[],a.callback)},makeShimExports:function(a){return function(){var b;a.init&&(b=a.init.apply(ba,arguments));return b||a.exports&&da(a.exports)}},makeRequire:function(a,f){function d(e,c,g){var i,j;f.enableBuildCallback&&(c&&J(c))&&(c.__requireJsBuild=!0);if("string"===typeof e){if(J(c))return w(B("requireargs",
        "Invalid require call"),g);if(a&&t(P,e))return P[e](q[a.id]);if(h.get)return h.get(k,e,a,d);i=l(e,a,!1,!0);i=i.id;return!t(r,i)?w(B("notloaded",'Module name "'+i+'" has not been loaded yet for context: '+b+(a?"":". Use require([])"))):r[i]}M();k.nextTick(function(){M();j=s(l(null,a));j.skipMap=f.skipMap;j.init(e,c,g,{enabled:!0});E()});return d}f=f||{};S(d,{isBrowser:A,toUrl:function(b){var d,f=b.lastIndexOf("."),g=b.split("/")[0];if(-1!==f&&(!("."===g||".."===g)||1<f))d=b.substring(f,b.length),b=
        b.substring(0,f);return k.nameToUrl(c(b,a&&a.id,!0),d,!0)},defined:function(b){return t(r,l(b,a,!1,!0).id)},specified:function(b){b=l(b,a,!1,!0).id;return t(r,b)||t(q,b)}});a||(d.undef=function(b){x();var c=l(b,a,!0),d=m(q,b);delete r[b];delete V[c.url];delete aa[b];d&&(d.events.defined&&(aa[b]=d.events),y(b))});return d},enable:function(a){m(q,a.id)&&s(a).enable()},completeLoad:function(a){var b,c,e=m(j.shim,a)||{},d=e.exports;for(x();I.length;){c=I.shift();if(null===c[0]){c[0]=a;if(b)break;b=!0}else c[0]===
        a&&(b=!0);F(c)}c=m(q,a);if(!b&&!t(r,a)&&c&&!c.inited){if(j.enforceDefine&&(!d||!da(d)))return p(a)?void 0:w(B("nodefine","No define call for "+a,null,[a]));F([a,e.deps||[],e.exportsFn])}E()},nameToUrl:function(a,b,c){var d,g,l,i,k,p;if(h.jsExtRegExp.test(a))i=a+(b||"");else{d=j.paths;g=j.pkgs;i=a.split("/");for(k=i.length;0<k;k-=1)if(p=i.slice(0,k).join("/"),l=m(g,p),p=m(d,p)){K(p)&&(p=p[0]);i.splice(0,k,p);break}else if(l){a=a===l.name?l.location+"/"+l.main:l.location;i.splice(0,k,a);break}i=i.join("/");
        i+=b||(/\?/.test(i)||c?"":".js");i=("/"===i.charAt(0)||i.match(/^[\w\+\.\-]+:/)?"":j.baseUrl)+i}return j.urlArgs?i+((-1===i.indexOf("?")?"?":"&")+j.urlArgs):i},load:function(a,b){h.load(k,a,b)},execCb:function(a,b,c,d){return b.apply(d,c)},onScriptLoad:function(a){if("load"===a.type||la.test((a.currentTarget||a.srcElement).readyState))R=null,a=L(a),k.completeLoad(a.id)},onScriptError:function(a){var b=L(a);if(!p(b.id))return w(B("scripterror","Script error for: "+b.id,a,[b.id]))}};k.require=k.makeRequire();
    return k}var h,x,y,E,L,F,R,M,s,ga,ma=/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,na=/[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,fa=/\.js$/,ka=/^\.\//;x=Object.prototype;var N=x.toString,ha=x.hasOwnProperty,ja=Array.prototype.splice,A=!!("undefined"!==typeof window&&navigator&&window.document),ea=!A&&"undefined"!==typeof importScripts,la=A&&"PLAYSTATION 3"===navigator.platform?/^complete$/:/^(complete|loaded)$/,Z="undefined"!==typeof opera&&"[object Opera]"===opera.toString(),G={},u={},U=[],Q=
    !1;if("undefined"===typeof define){if("undefined"!==typeof requirejs){if(J(requirejs))return;u=requirejs;requirejs=void 0}"undefined"!==typeof require&&!J(require)&&(u=require,require=void 0);h=requirejs=function(b,c,d,p){var g,l="_";!K(b)&&"string"!==typeof b&&(g=b,K(c)?(b=c,c=d,d=p):b=[]);g&&g.context&&(l=g.context);(p=m(G,l))||(p=G[l]=h.s.newContext(l));g&&p.configure(g);return p.require(b,c,d)};h.config=function(b){return h(b)};h.nextTick="undefined"!==typeof setTimeout?function(b){setTimeout(b,
    4)}:function(b){b()};require||(require=h);h.version="2.1.6";h.jsExtRegExp=/^\/|:|\?|\.js$/;h.isBrowser=A;x=h.s={contexts:G,newContext:ia};h({});z(["toUrl","undef","defined","specified"],function(b){h[b]=function(){var c=G._;return c.require[b].apply(c,arguments)}});if(A&&(y=x.head=document.getElementsByTagName("head")[0],E=document.getElementsByTagName("base")[0]))y=x.head=E.parentNode;h.onError=ca;h.load=function(b,c,d){var h=b&&b.config||{},g;if(A)return g=h.xhtml?document.createElementNS("http://www.w3.org/1999/xhtml",
    "html:script"):document.createElement("script"),g.type=h.scriptType||"text/javascript",g.charset="utf-8",g.async=!0,g.setAttribute("data-requirecontext",b.contextName),g.setAttribute("data-requiremodule",c),g.attachEvent&&!(g.attachEvent.toString&&0>g.attachEvent.toString().indexOf("[native code"))&&!Z?(Q=!0,g.attachEvent("onreadystatechange",b.onScriptLoad)):(g.addEventListener("load",b.onScriptLoad,!1),g.addEventListener("error",b.onScriptError,!1)),g.src=d,M=g,E?y.insertBefore(g,E):y.appendChild(g),
    M=null,g;if(ea)try{importScripts(d),b.completeLoad(c)}catch(l){b.onError(B("importscripts","importScripts failed for "+c+" at "+d,l,[c]))}};A&&O(document.getElementsByTagName("script"),function(b){y||(y=b.parentNode);if(L=b.getAttribute("data-main"))return s=L,u.baseUrl||(F=s.split("/"),s=F.pop(),ga=F.length?F.join("/")+"/":"./",u.baseUrl=ga),s=s.replace(fa,""),h.jsExtRegExp.test(s)&&(s=L),u.deps=u.deps?u.deps.concat(s):[s],!0});define=function(b,c,d){var h,g;"string"!==typeof b&&(d=c,c=b,b=null);
    K(c)||(d=c,c=null);!c&&J(d)&&(c=[],d.length&&(d.toString().replace(ma,"").replace(na,function(b,d){c.push(d)}),c=(1===d.length?["require"]:["require","exports","module"]).concat(c)));if(Q){if(!(h=M))R&&"interactive"===R.readyState||O(document.getElementsByTagName("script"),function(b){if("interactive"===b.readyState)return R=b}),h=R;h&&(b||(b=h.getAttribute("data-requiremodule")),g=G[h.getAttribute("data-requirecontext")])}(g?g.defQueue:U).push([b,c,d])};define.amd={jQuery:!0};h.exec=function(b){return eval(b)};
    h(u)}})(this);;};
WebGLDebugUtils = function() {

/**
 * Wrapped logging function.
 * @param {string} msg Message to log.
 */
var log = function(msg) {
  if (window.console && window.console.log) {
    window.console.log(msg);
  }
};

/**
 * Which arguements are enums.
 * @type {!Object.<number, string>}
 */
var glValidEnumContexts = {

  // Generic setters and getters

  'enable': { 0:true },
  'disable': { 0:true },
  'getParameter': { 0:true },

  // Rendering

  'drawArrays': { 0:true },
  'drawElements': { 0:true, 2:true },

  // Shaders

  'createShader': { 0:true },
  'getShaderParameter': { 1:true },
  'getProgramParameter': { 1:true },

  // Vertex attributes

  'getVertexAttrib': { 1:true },
  'vertexAttribPointer': { 2:true },

  // Textures

  'bindTexture': { 0:true },
  'activeTexture': { 0:true },
  'getTexParameter': { 0:true, 1:true },
  'texParameterf': { 0:true, 1:true },
  'texParameteri': { 0:true, 1:true, 2:true },
  'texImage2D': { 0:true, 2:true, 6:true, 7:true },
  'texSubImage2D': { 0:true, 6:true, 7:true },
  'copyTexImage2D': { 0:true, 2:true },
  'copyTexSubImage2D': { 0:true },
  'generateMipmap': { 0:true },

  // Buffer objects

  'bindBuffer': { 0:true },
  'bufferData': { 0:true, 2:true },
  'bufferSubData': { 0:true },
  'getBufferParameter': { 0:true, 1:true },

  // Renderbuffers and framebuffers

  'pixelStorei': { 0:true, 1:true },
  'readPixels': { 4:true, 5:true },
  'bindRenderbuffer': { 0:true },
  'bindFramebuffer': { 0:true },
  'checkFramebufferStatus': { 0:true },
  'framebufferRenderbuffer': { 0:true, 1:true, 2:true },
  'framebufferTexture2D': { 0:true, 1:true, 2:true },
  'getFramebufferAttachmentParameter': { 0:true, 1:true, 2:true },
  'getRenderbufferParameter': { 0:true, 1:true },
  'renderbufferStorage': { 0:true, 1:true },

  // Frame buffer operations (clear, blend, depth test, stencil)

  'clear': { 0:true },
  'depthFunc': { 0:true },
  'blendFunc': { 0:true, 1:true },
  'blendFuncSeparate': { 0:true, 1:true, 2:true, 3:true },
  'blendEquation': { 0:true },
  'blendEquationSeparate': { 0:true, 1:true },
  'stencilFunc': { 0:true },
  'stencilFuncSeparate': { 0:true, 1:true },
  'stencilMaskSeparate': { 0:true },
  'stencilOp': { 0:true, 1:true, 2:true },
  'stencilOpSeparate': { 0:true, 1:true, 2:true, 3:true },

  // Culling

  'cullFace': { 0:true },
  'frontFace': { 0:true },
};

/**
 * Map of numbers to names.
 * @type {Object}
 */
var glEnums = null;

/**
 * Initializes this module. Safe to call more than once.
 * @param {!WebGLRenderingContext} ctx A WebGL context. If
 *    you have more than one context it doesn't matter which one
 *    you pass in, it is only used to pull out constants.
 */
function init(ctx) {
  if (glEnums == null) {
    glEnums = { };
    for (var propertyName in ctx) {
      if (typeof ctx[propertyName] == 'number') {
        glEnums[ctx[propertyName]] = propertyName;
      }
    }
  }
}

/**
 * Checks the utils have been initialized.
 */
function checkInit() {
  if (glEnums == null) {
    throw 'WebGLDebugUtils.init(ctx) not called';
  }
}

/**
 * Returns true or false if value matches any WebGL enum
 * @param {*} value Value to check if it might be an enum.
 * @return {boolean} True if value matches one of the WebGL defined enums
 */
function mightBeEnum(value) {
  checkInit();
  return (glEnums[value] !== undefined);
}

/**
 * Gets an string version of an WebGL enum.
 *
 * Example:
 *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
 *
 * @param {number} value Value to return an enum for
 * @return {string} The string version of the enum.
 */
function glEnumToString(value) {
  checkInit();
  var name = glEnums[value];
  return (name !== undefined) ? name :
      ("*UNKNOWN WebGL ENUM (0x" + value.toString(16) + ")");
}

/**
 * Returns the string version of a WebGL argument.
 * Attempts to convert enum arguments to strings.
 * @param {string} functionName the name of the WebGL function.
 * @param {number} argumentIndx the index of the argument.
 * @param {*} value The value of the argument.
 * @return {string} The value as a string.
 */
function glFunctionArgToString(functionName, argumentIndex, value) {
  var funcInfo = glValidEnumContexts[functionName];
  if (funcInfo !== undefined) {
    if (funcInfo[argumentIndex]) {
      return glEnumToString(value);
    }
  }
  if (value === null) {
    return "null";
  } else if (value === undefined) {
    return "undefined";
  } else {
    return value.toString();
  }
}

/**
 * Converts the arguments of a WebGL function to a string.
 * Attempts to convert enum arguments to strings.
 *
 * @param {string} functionName the name of the WebGL function.
 * @param {number} args The arguments.
 * @return {string} The arguments as a string.
 */
function glFunctionArgsToString(functionName, args) {
  // apparently we can't do args.join(",");
  var argStr = "";
  for (var ii = 0; ii < args.length; ++ii) {
    argStr += ((ii == 0) ? '' : ', ') +
        glFunctionArgToString(functionName, ii, args[ii]);
  }
  return argStr;
};


function makePropertyWrapper(wrapper, original, propertyName) {
  //log("wrap prop: " + propertyName);
  wrapper.__defineGetter__(propertyName, function() {
    return original[propertyName];
  });
  // TODO(gmane): this needs to handle properties that take more than
  // one value?
  wrapper.__defineSetter__(propertyName, function(value) {
    //log("set: " + propertyName);
    original[propertyName] = value;
  });
}

// Makes a function that calls a function on another object.
function makeFunctionWrapper(original, functionName) {
  //log("wrap fn: " + functionName);
  var f = original[functionName];
  return function() {
    //log("call: " + functionName);
    var result = f.apply(original, arguments);
    return result;
  };
}

/**
 * Given a WebGL context returns a wrapped context that calls
 * gl.getError after every command and calls a function if the
 * result is not gl.NO_ERROR.
 *
 * @param {!WebGLRenderingContext} ctx The webgl context to
 *        wrap.
 * @param {!function(err, funcName, args): void} opt_onErrorFunc
 *        The function to call when gl.getError returns an
 *        error. If not specified the default function calls
 *        console.log with a message.
 * @param {!function(funcName, args): void} opt_onFunc The
 *        function to call when each webgl function is called.
 *        You can use this to log all calls for example.
 */
function makeDebugContext(ctx, opt_onErrorFunc, opt_onFunc) {
  init(ctx);
  opt_onErrorFunc = opt_onErrorFunc || function(err, functionName, args) {
        // apparently we can't do args.join(",");
        var argStr = "";
        for (var ii = 0; ii < args.length; ++ii) {
          argStr += ((ii == 0) ? '' : ', ') +
              glFunctionArgToString(functionName, ii, args[ii]);
        }
        log("WebGL error "+ glEnumToString(err) + " in "+ functionName +
            "(" + argStr + ")");
      };

  // Holds booleans for each GL error so after we get the error ourselves
  // we can still return it to the client app.
  var glErrorShadow = { };

  // Makes a function that calls a WebGL function and then calls getError.
  function makeErrorWrapper(ctx, functionName) {
    return function() {
      if (opt_onFunc) {
        opt_onFunc(functionName, arguments);
      }
      var result = ctx[functionName].apply(ctx, arguments);
      var err = ctx.getError();
      if (err != 0) {
        glErrorShadow[err] = true;
        opt_onErrorFunc(err, functionName, arguments);
      }
      return result;
    };
  }

  // Make a an object that has a copy of every property of the WebGL context
  // but wraps all functions.
  var wrapper = {};
  for (var propertyName in ctx) {
    if (typeof ctx[propertyName] == 'function') {
       wrapper[propertyName] = makeErrorWrapper(ctx, propertyName);
     } else {
       makePropertyWrapper(wrapper, ctx, propertyName);
     }
  }

  // Override the getError function with one that returns our saved results.
  wrapper.getError = function() {
    for (var err in glErrorShadow) {
      if (glErrorShadow.hasOwnProperty(err)) {
        if (glErrorShadow[err]) {
          glErrorShadow[err] = false;
          return err;
        }
      }
    }
    return ctx.NO_ERROR;
  };

  return wrapper;
}

function resetToInitialState(ctx) {
  var numAttribs = ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS);
  var tmp = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, tmp);
  for (var ii = 0; ii < numAttribs; ++ii) {
    ctx.disableVertexAttribArray(ii);
    ctx.vertexAttribPointer(ii, 4, ctx.FLOAT, false, 0, 0);
    ctx.vertexAttrib1f(ii, 0);
  }
  ctx.deleteBuffer(tmp);

  var numTextureUnits = ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS);
  for (var ii = 0; ii < numTextureUnits; ++ii) {
    ctx.activeTexture(ctx.TEXTURE0 + ii);
    ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, null);
    ctx.bindTexture(ctx.TEXTURE_2D, null);
  }

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.useProgram(null);
  ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
  ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
  ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
  ctx.disable(ctx.BLEND);
  ctx.disable(ctx.CULL_FACE);
  ctx.disable(ctx.DEPTH_TEST);
  ctx.disable(ctx.DITHER);
  ctx.disable(ctx.SCISSOR_TEST);
  ctx.blendColor(0, 0, 0, 0);
  ctx.blendEquation(ctx.FUNC_ADD);
  ctx.blendFunc(ctx.ONE, ctx.ZERO);
  ctx.clearColor(0, 0, 0, 0);
  ctx.clearDepth(1);
  ctx.clearStencil(-1);
  ctx.colorMask(true, true, true, true);
  ctx.cullFace(ctx.BACK);
  ctx.depthFunc(ctx.LESS);
  ctx.depthMask(true);
  ctx.depthRange(0, 1);
  ctx.frontFace(ctx.CCW);
  ctx.hint(ctx.GENERATE_MIPMAP_HINT, ctx.DONT_CARE);
  ctx.lineWidth(1);
  ctx.pixelStorei(ctx.PACK_ALIGNMENT, 4);
  ctx.pixelStorei(ctx.UNPACK_ALIGNMENT, 4);
  ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);
  ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  // TODO: Delete this IF.
  if (ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL) {
    ctx.pixelStorei(ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL, ctx.BROWSER_DEFAULT_WEBGL);
  }
  ctx.polygonOffset(0, 0);
  ctx.sampleCoverage(1, false);
  ctx.scissor(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.stencilFunc(ctx.ALWAYS, 0, 0xFFFFFFFF);
  ctx.stencilMask(0xFFFFFFFF);
  ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);
  ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT);

  // TODO: This should NOT be needed but Firefox fails with 'hint'
  while(ctx.getError());
}

function makeLostContextSimulatingCanvas(canvas) {
  var unwrappedContext_;
  var wrappedContext_;
  var onLost_ = [];
  var onRestored_ = [];
  var wrappedContext_ = {};
  var contextId_ = 1;
  var contextLost_ = false;
  var resourceId_ = 0;
  var resourceDb_ = [];
  var numCallsToLoseContext_ = 0;
  var numCalls_ = 0;
  var canRestore_ = false;
  var restoreTimeout_ = 0;

  // Holds booleans for each GL error so can simulate errors.
  var glErrorShadow_ = { };

  canvas.getContext = function(f) {
    return function() {
      var ctx = f.apply(canvas, arguments);
      // Did we get a context and is it a WebGL context?
      if (ctx instanceof WebGLRenderingContext) {
        if (ctx != unwrappedContext_) {
          if (unwrappedContext_) {
            throw "got different context"
          }
          unwrappedContext_ = ctx;
          wrappedContext_ = makeLostContextSimulatingContext(unwrappedContext_);
        }
        return wrappedContext_;
      }
      return ctx;
    }
  }(canvas.getContext);

  function wrapEvent(listener) {
    if (typeof(listener) == "function") {
      return listener;
    } else {
      return function(info) {
        listener.handleEvent(info);
      }
    }
  }

  var addOnContextLostListener = function(listener) {
    onLost_.push(wrapEvent(listener));
  };

  var addOnContextRestoredListener = function(listener) {
    onRestored_.push(wrapEvent(listener));
  };


  function wrapAddEventListener(canvas) {
    var f = canvas.addEventListener;
    canvas.addEventListener = function(type, listener, bubble) {
      switch (type) {
        case 'webglcontextlost':
          addOnContextLostListener(listener);
          break;
        case 'webglcontextrestored':
          addOnContextRestoredListener(listener);
          break;
        default:
          f.apply(canvas, arguments);
      }
    };
  }

  wrapAddEventListener(canvas);

  canvas.loseContext = function() {
    if (!contextLost_) {
      contextLost_ = true;
      numCallsToLoseContext_ = 0;
      ++contextId_;
      while (unwrappedContext_.getError());
      clearErrors();
      glErrorShadow_[unwrappedContext_.CONTEXT_LOST_WEBGL] = true;
      var event = makeWebGLContextEvent("context lost");
      var callbacks = onLost_.slice();
      setTimeout(function() {
          //log("numCallbacks:" + callbacks.length);
          for (var ii = 0; ii < callbacks.length; ++ii) {
            //log("calling callback:" + ii);
            callbacks[ii](event);
          }
          if (restoreTimeout_ >= 0) {
            setTimeout(function() {
                canvas.restoreContext();
              }, restoreTimeout_);
          }
        }, 0);
    }
  };

  canvas.restoreContext = function() {
    if (contextLost_) {
      if (onRestored_.length) {
        setTimeout(function() {
            if (!canRestore_) {
              throw "can not restore. webglcontestlost listener did not call event.preventDefault";
            }
            freeResources();
            resetToInitialState(unwrappedContext_);
            contextLost_ = false;
            numCalls_ = 0;
            canRestore_ = false;
            var callbacks = onRestored_.slice();
            var event = makeWebGLContextEvent("context restored");
            for (var ii = 0; ii < callbacks.length; ++ii) {
              callbacks[ii](event);
            }
          }, 0);
      }
    }
  };

  canvas.loseContextInNCalls = function(numCalls) {
    if (contextLost_) {
      throw "You can not ask a lost contet to be lost";
    }
    numCallsToLoseContext_ = numCalls_ + numCalls;
  };

  canvas.getNumCalls = function() {
    return numCalls_;
  };

  canvas.setRestoreTimeout = function(timeout) {
    restoreTimeout_ = timeout;
  };

  function isWebGLObject(obj) {
    //return false;
    return (obj instanceof WebGLBuffer ||
            obj instanceof WebGLFramebuffer ||
            obj instanceof WebGLProgram ||
            obj instanceof WebGLRenderbuffer ||
            obj instanceof WebGLShader ||
            obj instanceof WebGLTexture);
  }

  function checkResources(args) {
    for (var ii = 0; ii < args.length; ++ii) {
      var arg = args[ii];
      if (isWebGLObject(arg)) {
        return arg.__webglDebugContextLostId__ == contextId_;
      }
    }
    return true;
  }

  function clearErrors() {
    var k = Object.keys(glErrorShadow_);
    for (var ii = 0; ii < k.length; ++ii) {
      delete glErrorShadow_[k];
    }
  }

  function loseContextIfTime() {
    ++numCalls_;
    if (!contextLost_) {
      if (numCallsToLoseContext_ == numCalls_) {
        canvas.loseContext();
      }
    }
  }

  // Makes a function that simulates WebGL when out of context.
  function makeLostContextFunctionWrapper(ctx, functionName) {
    var f = ctx[functionName];
    return function() {
      // log("calling:" + functionName);
      // Only call the functions if the context is not lost.
      loseContextIfTime();
      if (!contextLost_) {
        //if (!checkResources(arguments)) {
        //  glErrorShadow_[wrappedContext_.INVALID_OPERATION] = true;
        //  return;
        //}

        var result = f.apply(ctx, arguments);
        return result;
      }
    };
  }

  function freeResources() {
    for (var ii = 0; ii < resourceDb_.length; ++ii) {
      var resource = resourceDb_[ii];
      if (resource instanceof WebGLBuffer) {
        unwrappedContext_.deleteBuffer(resource);
      } else if (resource instanceof WebGLFramebuffer) {
        unwrappedContext_.deleteFramebuffer(resource);
      } else if (resource instanceof WebGLProgram) {
        unwrappedContext_.deleteProgram(resource);
      } else if (resource instanceof WebGLRenderbuffer) {
        unwrappedContext_.deleteRenderbuffer(resource);
      } else if (resource instanceof WebGLShader) {
        unwrappedContext_.deleteShader(resource);
      } else if (resource instanceof WebGLTexture) {
        unwrappedContext_.deleteTexture(resource);
      }
    }
  }

  function makeWebGLContextEvent(statusMessage) {
    return {
      statusMessage: statusMessage,
      preventDefault: function() {
          canRestore_ = true;
        }
    };
  }

  return canvas;

  function makeLostContextSimulatingContext(ctx) {
    // copy all functions and properties to wrapper
    for (var propertyName in ctx) {
      if (typeof ctx[propertyName] == 'function') {
         wrappedContext_[propertyName] = makeLostContextFunctionWrapper(
             ctx, propertyName);
       } else {
         makePropertyWrapper(wrappedContext_, ctx, propertyName);
       }
    }

    // Wrap a few functions specially.
    wrappedContext_.getError = function() {
      loseContextIfTime();
      if (!contextLost_) {
        var err;
        while (err = unwrappedContext_.getError()) {
          glErrorShadow_[err] = true;
        }
      }
      for (var err in glErrorShadow_) {
        if (glErrorShadow_[err]) {
          delete glErrorShadow_[err];
          return err;
        }
      }
      return wrappedContext_.NO_ERROR;
    };

    var creationFunctions = [
      "createBuffer",
      "createFramebuffer",
      "createProgram",
      "createRenderbuffer",
      "createShader",
      "createTexture"
    ];
    for (var ii = 0; ii < creationFunctions.length; ++ii) {
      var functionName = creationFunctions[ii];
      wrappedContext_[functionName] = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return null;
          }
          var obj = f.apply(ctx, arguments);
          obj.__webglDebugContextLostId__ = contextId_;
          resourceDb_.push(obj);
          return obj;
        };
      }(ctx[functionName]);
    }

    var functionsThatShouldReturnNull = [
      "getActiveAttrib",
      "getActiveUniform",
      "getBufferParameter",
      "getContextAttributes",
      "getAttachedShaders",
      "getFramebufferAttachmentParameter",
      "getParameter",
      "getProgramParameter",
      "getProgramInfoLog",
      "getRenderbufferParameter",
      "getShaderParameter",
      "getShaderInfoLog",
      "getShaderSource",
      "getTexParameter",
      "getUniform",
      "getUniformLocation",
      "getVertexAttrib"
    ];
    for (var ii = 0; ii < functionsThatShouldReturnNull.length; ++ii) {
      var functionName = functionsThatShouldReturnNull[ii];
      wrappedContext_[functionName] = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return null;
          }
          return f.apply(ctx, arguments);
        }
      }(wrappedContext_[functionName]);
    }

    var isFunctions = [
      "isBuffer",
      "isEnabled",
      "isFramebuffer",
      "isProgram",
      "isRenderbuffer",
      "isShader",
      "isTexture"
    ];
    for (var ii = 0; ii < isFunctions.length; ++ii) {
      var functionName = isFunctions[ii];
      wrappedContext_[functionName] = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return false;
          }
          return f.apply(ctx, arguments);
        }
      }(wrappedContext_[functionName]);
    }

    wrappedContext_.checkFramebufferStatus = function(f) {
      return function() {
        loseContextIfTime();
        if (contextLost_) {
          return wrappedContext_.FRAMEBUFFER_UNSUPPORTED;
        }
        return f.apply(ctx, arguments);
      };
    }(wrappedContext_.checkFramebufferStatus);

    wrappedContext_.getAttribLocation = function(f) {
      return function() {
        loseContextIfTime();
        if (contextLost_) {
          return -1;
        }
        return f.apply(ctx, arguments);
      };
    }(wrappedContext_.getAttribLocation);

    wrappedContext_.getVertexAttribOffset = function(f) {
      return function() {
        loseContextIfTime();
        if (contextLost_) {
          return 0;
        }
        return f.apply(ctx, arguments);
      };
    }(wrappedContext_.getVertexAttribOffset);

    wrappedContext_.isContextLost = function() {
      return contextLost_;
    };

    return wrappedContext_;
  }
}

return {
    /**
     * Initializes this module. Safe to call more than once.
     * @param {!WebGLRenderingContext} ctx A WebGL context. If
    }
   *    you have more than one context it doesn't matter which one
   *    you pass in, it is only used to pull out constants.
   */
  'init': init,

  /**
   * Returns true or false if value matches any WebGL enum
   * @param {*} value Value to check if it might be an enum.
   * @return {boolean} True if value matches one of the WebGL defined enums
   */
  'mightBeEnum': mightBeEnum,

  /**
   * Gets an string version of an WebGL enum.
   *
   * Example:
   *   WebGLDebugUtil.init(ctx);
   *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
   *
   * @param {number} value Value to return an enum for
   * @return {string} The string version of the enum.
   */
  'glEnumToString': glEnumToString,

  /**
   * Converts the argument of a WebGL function to a string.
   * Attempts to convert enum arguments to strings.
   *
   * Example:
   *   WebGLDebugUtil.init(ctx);
   *   var str = WebGLDebugUtil.glFunctionArgToString('bindTexture', 0, gl.TEXTURE_2D);
   *
   * would return 'TEXTURE_2D'
   *
   * @param {string} functionName the name of the WebGL function.
   * @param {number} argumentIndx the index of the argument.
   * @param {*} value The value of the argument.
   * @return {string} The value as a string.
   */
  'glFunctionArgToString': glFunctionArgToString,

  /**
   * Converts the arguments of a WebGL function to a string.
   * Attempts to convert enum arguments to strings.
   *
   * @param {string} functionName the name of the WebGL function.
   * @param {number} args The arguments.
   * @return {string} The arguments as a string.
   */
  'glFunctionArgsToString': glFunctionArgsToString,

  /**
   * Given a WebGL context returns a wrapped context that calls
   * gl.getError after every command and calls a function if the
   * result is not NO_ERROR.
   *
   * You can supply your own function if you want. For example, if you'd like
   * an exception thrown on any GL error you could do this
   *
   *    function throwOnGLError(err, funcName, args) {
   *      throw WebGLDebugUtils.glEnumToString(err) +
   *            " was caused by call to " + funcName;
   *    };
   *
   *    ctx = WebGLDebugUtils.makeDebugContext(
   *        canvas.getContext("webgl"), throwOnGLError);
   *
   * @param {!WebGLRenderingContext} ctx The webgl context to wrap.
   * @param {!function(err, funcName, args): void} opt_onErrorFunc The function
   *     to call when gl.getError returns an error. If not specified the default
   *     function calls console.log with a message.
   * @param {!function(funcName, args): void} opt_onFunc The
   *     function to call when each webgl function is called. You
   *     can use this to log all calls for example.
   */
  'makeDebugContext': makeDebugContext,

  /**
   * Given a canvas element returns a wrapped canvas element that will
   * simulate lost context. The canvas returned adds the following functions.
   *
   * loseContext:
   *   simulates a lost context event.
   *
   * restoreContext:
   *   simulates the context being restored.
   *
   * lostContextInNCalls:
   *   loses the context after N gl calls.
   *
   * getNumCalls:
   *   tells you how many gl calls there have been so far.
   *
   * setRestoreTimeout:
   *   sets the number of milliseconds until the context is restored
   *   after it has been lost. Defaults to 0. Pass -1 to prevent
   *   automatic restoring.
   *
   * @param {!Canvas} canvas The canvas element to wrap.
   */
  'makeLostContextSimulatingCanvas': makeLostContextSimulatingCanvas,

  /**
   * Resets a context to the initial state.
   * @param {!WebGLRenderingContext} ctx The webgl context to
   *     reset.
   */
  'resetToInitialState': resetToInitialState
};

}();
;/**
 * @class Generic map of IDs to items - can generate own IDs or accept given IDs. IDs should be strings in order to not
 * clash with internally generated IDs, which are numbers.
 * @private
 */
var SceneJS_Map = function(items, _baseId) {

    /**
     * @property Items in this map
     */
    this.items = items || [];


    var baseId = _baseId || 0;
    var lastUniqueId = baseId + 1;

    /**
     * Adds an item to the map and returns the ID of the item in the map. If an ID is given, the item is
     * mapped to that ID. Otherwise, the map automatically generates the ID and maps to that.
     *
     * id = myMap.addItem("foo") // ID internally generated
     *
     * id = myMap.addItem("foo", "bar") // ID is "foo"
     *
     */
    this.addItem = function() {

        var item;

        if (arguments.length == 2) {

            var id = arguments[0];

            item = arguments[1];

            if (this.items[id]) { // Won't happen if given ID is string
                throw SceneJS_error.fatalError(SceneJS.errors.ID_CLASH, "ID clash: '" + id + "'");
            }

            this.items[id] = item;

            return id;

        } else {

            while (true) {

                item = arguments[0];
                var findId = lastUniqueId++;

                if (!this.items[findId]) {
                    this.items[findId] = item;
                    return findId;
                }
            }
        }
    };

    /**
     * Removes the item of the given ID from the map
     */
    this.removeItem = function(id) {
        delete this.items[id];
    };
};;/**
 * The SceneJS object.
 */
var SceneJS = new (function () {

    /**
     * This SceneJS version
     */
    this.VERSION = '3.2';

    this._baseStateId = 0;

    // Pub/sub support
    this._handleMap = new SceneJS_Map(); // Subscription handle pool
    this._topicSubs = {}; // A [handle -> callback] map for each topic name
    this._handleTopics = {}; // Maps handles to topic names
    this._topicPubs = {}; // Maps topics to publications

    /**
     * @property {SceneJS_Engine} Engines currently in existance
     */
    this._engines = {};

    this._engineIds = new SceneJS_Map();

    this.WEBGL_INFO = (function() {
        var info = {
            WEBGL: false
        };

        var canvas = document.createElement("canvas");

        if (!canvas) {
            return info;
        }

        var gl = canvas.getContext("webgl", { antialias: true }) || canvas.getContext("experimental-webgl", { antialias: true });

        info.WEBGL = !!gl;

        if (!info.WEBGL) {
            return info;
        }

        info.ANTIALIAS = gl.getContextAttributes().antialias;

        if (gl.getShaderPrecisionFormat) {
            if (gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0) {
                info.FS_MAX_FLOAT_PRECISION = "highp";
            } else if (gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {
                info.FS_MAX_FLOAT_PRECISION = "mediump";
            } else {
                info.FS_MAX_FLOAT_PRECISION = "lowp";
            }
        } else {
            info.FS_MAX_FLOAT_PRECISION = "mediump";
        }

        info.DEPTH_BUFFER_BITS = gl.getParameter(gl.DEPTH_BITS);
        info.MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        info.MAX_CUBE_MAP_SIZE = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
        info.MAX_RENDERBUFFER_SIZE = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        info.MAX_TEXTURE_UNITS =  gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        info.MAX_VERTEX_ATTRIBS = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        info.MAX_VERTEX_UNIFORM_VECTORS = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        info.MAX_FRAGMENT_UNIFORM_VECTORS = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        info.MAX_VARYING_VECTORS = gl.getParameter(gl.MAX_VARYING_VECTORS);

        info.SUPPORTED_EXTENSIONS = {};

        gl.getSupportedExtensions().forEach(function(ext) {
            info.SUPPORTED_EXTENSIONS[ext] = true;
        });

        return info;
    })();


    /**
     * Publishes to a topic.
     *
     * Immediately notifies existing subscriptions to that topic, retains the publication to give to
     * any subsequent notifications on that topic as they are made.
     *
     * @param {String} topic Publication topic
     * @param {Object} pub The publication
     * @param {Boolean} [forget] When true, the publication will be sent to subscribers then forgotten, so that any
     * subsequent subscribers will not receive it
     * @private
     */
    this.publish = function (topic, pub, forget) {
        if (!forget) {
            this._topicPubs[topic] = pub; // Save notification
        }
        var subsForTopic = this._topicSubs[topic];
        if (subsForTopic) { // Notify subscriptions
            for (var handle in subsForTopic) {
                if (subsForTopic.hasOwnProperty(handle)) {
                    subsForTopic[handle].call(this, pub);
                }
            }
        }
    };

    /**
     * Removes a topic publication
     *
     * Immediately notifies existing subscriptions to that topic, sending them each a null publication.
     *
     * @param topic Publication topic
     * @private
     */
    this.unpublish = function (topic) {
        var subsForTopic = this._topicSubs[topic];
        if (subsForTopic) { // Notify subscriptions
            for (var handle in subsForTopic) {
                if (subsForTopic.hasOwnProperty(handle)) {
                    subsForTopic[handle].call(this, null);
                }
            }
        }
        delete this._topicPubs[topic];
    };


    /**
     * Listen for data changes at a particular location
     *
     * <p>Your callback will be triggered for
     * the initial data and again whenever the data changes. Use {@link #off} to stop receiving updates.</p>
     *
     * <p>The callback is be called with SceneJS as scope.</p>
     *
     * @param {String} location Publication location
     * @param {Function(data)} callback Called when fresh data is available at the location
     * @return {String} Handle to the subscription, which may be used to unsubscribe with {@link #off}.
     */
    this.on = function (topic, callback) {
        var subsForTopic = this._topicSubs[topic];
        if (!subsForTopic) {
            subsForTopic = {};
            this._topicSubs[topic] = subsForTopic;
        }
        var handle = this._handleMap.addItem(); // Create unique handle
        subsForTopic[handle] = callback;
        this._handleTopics[handle] = topic;
        var pub = this._topicPubs[topic];
        if (pub) { // A publication exists, notify callback immediately
            callback.call(this, pub);
        }
        return handle;
    };

    /**
     * Unsubscribes from a publication that was previously made with {@link #on}.
     * @param handle Publication handle
     */
    this.off = function (handle) {
        var topic = this._handleTopics[handle];
        if (topic) {
            delete this._handleTopics[handle];
            var topicSubs = this._topicSubs[topic];
            if (topicSubs) {
                delete topicSubs[handle];
            }
            this._handleMap.removeItem(handle); // Release handle
            if (topic == "rendered") {
                this._engine.branchDirty(this);
            }
        }
    };

    /**
     * Listens for exactly one data update at the specified location, and then stops listening.
     * <p>This is equivalent to calling {@link #on}, and then calling {@link #off} inside the callback function.</p>
     * @param {String} location Data location to listen to
     * @param {Function(data)} callback Called when fresh data is available at the location
     */
    this.once = function (topic, callback) {
        var self = this;
        var sub = this.on(topic,
            function (pub) {
                self.off(sub);
                callback(pub);
            });
    };

    /**
     * Creates a new scene from the given JSON description and begins rendering it
     *
     * @param {String} json JSON scene description
     * @param {*} options Optional options
     * @param {Boolean} options.simulateWebGLContextLost Set true to enable simulation of lost WebGL context (has performance impact)
     * @returns {SceneJS.Scene} New scene
     */
    this.createScene = function (json, options) {

       json = json || {};

        if (json.id) {
            if (this._engines[json.id]) {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Scene already exists with this ID: '" + json.id + "'");
            }
            this._engineIds.addItem(json.id, {});
        } else {
            json.id = this._engineIds.addItem({});
        }

        var engine = new SceneJS_Engine(json, options);

        this._engines[json.id] = engine;

        SceneJS_events.fireEvent(SceneJS_events.SCENE_CREATED, {    // Notify modules that need to know about new scene
            engine:engine
        });

        engine.scene.start(options);

        return engine.scene;
    };

    /**
     * Gets an existing scene
     *
     * @param {String} sceneId ID of target scene
     * @deprecated
     * @returns {SceneJS.Scene} The selected scene
     */
    this.scene = function (sceneId) {

        var engine = this._engines[sceneId];

        return engine ? engine.scene : null;
    };

    /**
     * Gets an existing scene.
     *
     * When no scene ID is given, the first scene found is returned. This is a shorthand convenience for
     * easy scripting when only one scene is defined.
     *
     * @param {String} [sceneId] ID of target scene
     * @returns {SceneJS.Scene} The selected scene
     */
    this.getScene = function (sceneId) {

        if (!sceneId) {
            for (var sceneId in this._engines) {
                if (this._engines.hasOwnProperty(sceneId)) {
                    return this._engines[sceneId].scene;
                }
            }
        }

        var engine = this._engines[sceneId];

        return engine ? engine.scene : null;
    };

    /**
     * Gets existing scenes
     *
     * @returns  Existing scenes, mapped to their IDs
     */
    this.getScenes = function () {

        var scenes = {};

        for (var sceneId in this._engines) {
            if (this._engines.hasOwnProperty(sceneId)) {
                scenes[sceneId] = this._engines[sceneId].scene;
            }
        }

        return scenes;
    };

    /**
     * Tests if the given object is an array
     * @private
     */
    this._isArray = function (testObject) {
        return testObject && !(testObject.propertyIsEnumerable('length'))
            && typeof testObject === 'object' && typeof testObject.length === 'number';
    };

    /**
     *
     */
    this._shallowClone = function (o) {
        var o2 = {};
        for (var name in o) {
            if (o.hasOwnProperty(name)) {
                o2[name] = o[name];
            }
        }
        return o2;
    };

    /**
     * Add properties of o to o2 where undefined or null on o2
     * @private
     */
    this._applyIf = function (o, o2) {
        for (var name in o) {
            if (o.hasOwnProperty(name)) {
                if (o2[name] == undefined || o2[name] == null) {
                    o2[name] = o[name];
                }
            }
        }
        return o2;
    };

    /**
     * Add properties of o to o2, overwriting them on o2 if already there.
     * The optional clear flag causes properties on o2 to be cleared first
     * @private
     */
    this._apply = function (o, o2, clear) {
        var name;
        if (clear) {
            for (name in o2) {
                if (o2.hasOwnProperty(name)) {
                    delete o2[name];
                }
            }
        }
        for (name in o) {
            if (o.hasOwnProperty(name) && o[name] != undefined) {
                o2[name] = o[name];
            }
        }
        return o2;
    };

    var hasOwnProperty = Object.prototype.hasOwnProperty;

    /**
     * Tests is an object is empty
     * @param obj
     * @returns {boolean}
     * @private
     */
    this._isEmpty =function(obj) {
        // null and undefined are "empty"
        if (obj == null) return true;
        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;
        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }
        return true;
    };

    /**
     * Tests if the given value is a number
     * @param value
     * @returns {boolean}
     * @private
     */
    this._isNumeric = function (value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    };

    /**
     * Resets SceneJS, destroying all existing scenes
     */
    this.reset = function () {

        var temp = [];

        for (var id in this._engines) { // Collect engines to destroy
            if (this._engines.hasOwnProperty(id)) {

                temp.push(this._engines[id]);

                delete this._engines[id];

                this._engineIds.removeItem(id);
            }
        }

        while (temp.length > 0) { // Destroy the engines
            temp.pop().destroy();
        }

        SceneJS_events.fireEvent(SceneJS_events.RESET);
    };

})();
;// Configure RequireJS to find plugins relative to plugins location
(function () {

    var pluginPath;

    SceneJS.on("configs",
        function (configs) {
            if (configs.pluginPath != pluginPath) {
                pluginPath = configs.pluginPath;
                var libPath = pluginPath + "/lib";
                require.config({
                    paths:{
                        "scenejsPluginDeps":libPath
                    }
                });
            }
        });
})();;/**
 *  @private
 */
var SceneJS_eventManager = function () {

    this._handlerIds = new SceneJS_Map();

    this.typeHandlers = {};
};

/**
 *
 */
SceneJS_eventManager.prototype.createEvent = function (type) {

    if (this.typeHandlers[type]) {
        return;
    }

    this.typeHandlers[type] = {
        handlers:{},
        numSubs:0
    };
};

/**
 * Subscribes to an event defined on this event manager
 *
 * @param {String} type Event type one of the values in SceneJS_events
 * @param {Function} callback Handler function that will accept whatever parameter object accompanies the event
 * @return {String} handle Handle to the event binding
 */
SceneJS_eventManager.prototype.onEvent = function (type, callback) {

    var handlersForType = this.typeHandlers[type] || (this.typeHandlers[type] = {
        handlers:{},
        numSubs:0
    });

    var handlerId = this._handlerIds.addItem(type);

    var handlers = handlersForType.handlers;
    handlers[handlerId] = callback;
    handlersForType.numSubs++;

    return handlerId;
};

/**
 *
 */
SceneJS_eventManager.prototype.fireEvent = function (type, params) {

    var handlersForType = this.typeHandlers[type] || (this.typeHandlers[type] = {
        handlers:{},
        numSubs:0
    });

    if (handlersForType.numSubs > 0) {

        var handlers = handlersForType.handlers;

        for (var handlerId in handlers) {
            if (handlers.hasOwnProperty(handlerId)) {
                handlers[handlerId](params);
            }
        }
    }
};

/**
 * Unsubscribes to an event previously subscribed to on this manager
 *
 * @param {String} handlerId Subscription handle
 */
SceneJS_eventManager.prototype.unEvent = function (handlerId) {

    var type = this._handlerIds.items[handlerId];
    if (!type) {
        return;
    }

    this._handlerIds.removeItem(handlerId);

    var handlers = this.typeHandlers[type];

    if (!handlers) {
        return;
    }

    delete handlers[handlerId];
    this.typeHandlers[type].numSubs--;
};
;/**
 * SceneJS plugin registry
 */
SceneJS.Plugins = new (function () {

    // Plugin map for each node type
    var nodePlugins = {};

    // Subscribers to plugins
    var pluginSubs = {};

    /**
     * Installs a plugin into SceneJS
     * @param {String} nodeType Node type name
     * @param {String} pluginType Plugin type name
     * @param [{String}] deps List of URLs of JavaScript files that the plugin depends on
     * @param {Function} plugin Plugin constructor
     */
    this.addPlugin = function () {
        var nodeType = arguments[0];
        var pluginType = arguments[1];
        var deps;
        var plugin;
        if (arguments.length == 4) {
            deps = arguments[2];
            plugin = arguments[3];
        } else {
            plugin = arguments[2];
        }
        addPlugin(nodeType, pluginType, deps, plugin);
    };

    function addPlugin(nodeType, pluginType, deps, plugin) {
        var plugins = nodePlugins[nodeType] || (nodePlugins[nodeType] = {});
        plugins[pluginType] = plugin;
        // Load dependencies, if any
        loadDeps(deps,
            0,
            function () {
                // Notify and unsubscribe subscribers
                var subId = nodeType + pluginType;
                var subs = pluginSubs[subId] || (pluginSubs[subId] = []);
                while (subs.length > 0) {
                    subs.pop()(plugin);
                }
                delete pluginSubs[subId];
            });
    }

    // Loads list of dependencies, synchronously and in order
    function loadDeps(deps, i, ok) {
        if (!deps || i >= deps.length) {
            ok();
            return;
        }
        var src = deps[i];
        var pluginPath = SceneJS_configsModule.configs.pluginPath;
        if (!pluginPath) {
            throw "no pluginPath config"; // Build script error - should create this config
        }
        src = pluginPath + "/" + src;
        loadScript(src,
            function () {
                loadDeps(deps, i + 1, ok);
            });
    }

    /**
     * Tests if given plugin is installed
     */
    this.hasPlugin = function (nodeType, pluginType) {
        var plugins = nodePlugins[nodeType];
        return (plugins && !!plugins[pluginType]);
    };

    /**
     * Returns installed plugin of given type and ID
     */
    this.getPlugin = function (nodeType, pluginType, ok) {
        var plugins = nodePlugins[nodeType];
        if (plugins) {
            var plugin = plugins[pluginType];
            if (plugin) {
                ok(plugin);
                return;
            }
        }
        var subId = nodeType + pluginType;
        var subs = pluginSubs[subId] || (pluginSubs[subId] = []);
        subs.push(ok);
        if (subs.length > 1) { // Not first sub
            return;
        }
        var self = this;
        var pluginPath = SceneJS_configsModule.configs.pluginPath;
        if (!pluginPath) {
            throw "no pluginPath config"; // Build script error - should create this config
        }
        var pluginFilePath = pluginPath + "/" + nodeType + "/" + pluginType + ".js";
        loadScript(pluginFilePath);
    };

    function loadScript(src, ok) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (script.readyState) {  //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" ||
                    script.readyState == "complete") {
                    script.onreadystatechange = null;
                    if (ok) {
                        ok();
                    }
                }
            };
        } else {  //Others
            script.onload = function () {
                if (ok) {
                    ok();
                }
            };
        }
        script.src = src;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

})();;/**
 *  @private
 */
var SceneJS_events = new (function () {

    this.ERROR = 0;
    this.RESET = 1;                         // SceneJS framework reset
    this.NODE_CREATED = 2;                 // Scene has just been created
    this.SCENE_CREATED = 3;                 // Scene has just been created
    this.SCENE_COMPILING = 4;               // Scene about to be compiled and drawn
    this.SCENE_DESTROYED = 5;               // Scene just been destroyed
    this.OBJECT_COMPILING = 6;
    this.WEBGL_CONTEXT_LOST = 7;
    this.WEBGL_CONTEXT_RESTORED = 8;
    this.RENDER = 9;

    /* Priority queue for each type of event
     */
    var events = [];

    /**
     * Registers a handler for the given event and returns a subscription handle
     *
     * The handler can be registered with an optional priority number which specifies the order it is
     * called among the other handler already registered for the event.
     *
     * So, with n being the number of commands registered for the given event:
     *
     * (priority <= 0)      - command will be the first called
     * (priority >= n)      - command will be the last called
     * (0 < priority < n)   - command will be called at the order given by the priority
     * @private
     * @param type Event type - one of the values in SceneJS_events
     * @param command - Handler function that will accept whatever parameter object accompanies the event
     * @param priority - Optional priority number (see above)
     * @return {String} - Subscription handle
     */
    this.addListener = function (type, command, priority) {

        var list = events[type];

        if (!list) {
            list = [];
            events[type] = list;
        }

        var handler = {
            command:command,
            priority:(priority == undefined) ? list.length : priority
        };

        var index = -1;

        for (var i = 0, len = list.length; i < len; i++) {
            if (!list[i]) {
                index = i;
                break;
            }
        }

        if (index < 0) {
            list.push(handler);
            index = list.length - 1;
        }

//
//        for (var i = 0; i < list.length; i++) {
//            if (list[i].priority > handler.priority) {
//                list.splice(i, 0, handler);
//                return i;
//            }
//        }


        var handle = type + "." + index;

        return handle;
    };

    /**
     * Removes a listener
     * @param handle Subscription handle
     */
    this.removeListener = function (handle) {

        var lastIdx = handle.lastIndexOf(".");

        var type = parseInt(handle.substr(0, lastIdx));
        var index = parseInt(handle.substr(lastIdx + 1));

        var list = events[type];

        if (!list) {
            return;
        }

        delete list[index];
    };

    /**
     * @private
     */
    this.fireEvent = function (type, params) {

        var list = events[type];

        if (list) {
            params = params || {};
            for (var i = 0; i < list.length; i++) {
                if (list[i]) {
                    list[i].command(params);
                }
            }
        }
    };

})();


/**
 * Subscribe to SceneJS events
 * @deprecated
 */
SceneJS.bind = function (name, func) {
    switch (name) {

        case "error" :

            return SceneJS_events.addListener(SceneJS_events.ERROR, func);
            break;

        case "reset" :

            return SceneJS_events.addListener(
                SceneJS_events.RESET,
                function () {
                    func();
                });
            break;

        case "webglcontextlost" :

            return SceneJS_events.addListener(
                SceneJS_events.WEBGL_CONTEXT_LOST,
                function (params) {
                    func(params);
                });
            break;

        case "webglcontextrestored" :

            return SceneJS_events.addListener(
                SceneJS_events.WEBGL_CONTEXT_RESTORED,
                function (params) {
                    func(params);
                });
            break;

        default:
            throw SceneJS_error.fatalError("SceneJS.bind - this event type not supported: '" + name + "'");
    }
};

/* Subscribe to SceneJS events
 * @deprecated
 */
SceneJS.onEvent = SceneJS.bind;

/* Unsubscribe from event
 */
SceneJS.unEvent = function (handle) {
    return SceneJS_events.removeListener(handle);
};

SceneJS.subscribe = SceneJS.addListener = SceneJS.onEvent = SceneJS.bind;

SceneJS.unsubscribe = SceneJS.unEvent;


SceneJS.on = SceneJS.onEvent;
SceneJS.off = SceneJS.unEvent;



;/**
 *
 */
var SceneJS_Canvas = function (id, canvasId, contextAttr, options) {

    /**
     * ID of this canvas
     */
    this.canvasId;

    if (!canvasId) {
        // Automatic default canvas
        canvasId = "canvas-" + id;
        var body = document.getElementsByTagName("body")[0];
        var div = document.createElement('div');
        var style = div.style;
        style.height = "100%";
        style.width = "100%";
        style.padding = "0";
        style.margin = "0";
        style.left = "0";
        style.top = "0";
        style.position = "absolute";
        // style["z-index"] = "10000";
        div.innerHTML += '<canvas id="' + canvasId + '" style="width: 100%; height: 100%; margin: 0; padding: 0;"></canvas>';
        body.appendChild(div);
    }

    // Bind to canvas
    var canvas = document.getElementById(canvasId);
    if (!canvas) {
        throw SceneJS_error.fatalError(SceneJS.errors.CANVAS_NOT_FOUND,
            "SceneJS.Scene attribute 'canvasId' does not match any elements in the page");
    }
    this.canvasId = canvasId;

    /**
     * WebGL context options
     */
    this.options = options || {};

    this.canvas = (this.options.simulateWebGLContextLost)
        ? WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas)
        : canvas;

    this.resolutionScaling = this.options.resolutionScaling || 1;

    // If the canvas uses css styles to specify the sizes make sure the basic
    // width and height attributes match or the WebGL context will use 300 x 150

    this.canvas.width = this.canvas.clientWidth * this.resolutionScaling;
    this.canvas.height = this.canvas.clientHeight * this.resolutionScaling;

    /**
     * Attributes given when initialising the WebGL context
     */
    this.contextAttr = contextAttr || {};
    this.contextAttr.alpha = true;

    /**
     * The WebGL context
     */
    this.gl = null;

    this.initWebGL();
};

/**
 * Names of recognised WebGL contexts
 */
SceneJS_Canvas.prototype._WEBGL_CONTEXT_NAMES = [
    "webgl",
    "experimental-webgl",
    "webkit-3d",
    "moz-webgl",
    "moz-glweb20"
];

/**
 * Initialise the WebGL context

 */
SceneJS_Canvas.prototype.initWebGL = function () {

    for (var i = 0; !this.gl && i < this._WEBGL_CONTEXT_NAMES.length; i++) {
        try {
            this.gl = this.canvas.getContext(this._WEBGL_CONTEXT_NAMES[i], this.contextAttr);
        } catch (e) { // Try with next context name
        }
    }

    if (!this.gl) {
        throw SceneJS_error.fatalError(
            SceneJS.errors.WEBGL_NOT_SUPPORTED,
            'Failed to get a WebGL context');
    }
};


/**
 * Simulate a lost WebGL context.
 * Only works if the simulateWebGLContextLost was given as an option to the canvas' constructor.
 */
SceneJS_Canvas.prototype.loseWebGLContext = function () {
    if (this.options.simulateWebGLContextLost) {
        this.canvas.loseContext();
    }
};

/**
 * Set canvas size multiplier for supersample anti-aliasing
 */
SceneJS_Canvas.prototype.setResolutionScaling = function (resolutionScaling) {
    this.resolutionScaling = resolutionScaling;
    this.canvas.width = this.canvas.clientWidth * resolutionScaling;
    this.canvas.height = this.canvas.clientHeight * resolutionScaling;
};


;/**
 * @class A container for a scene graph and its display
 *
 *
 * @private
 */
var SceneJS_Engine = function (json, options) {
    json.type = "scene"; // The type property supplied by user on the root JSON node is ignored - would always be 'scene'

    /**
     * ID of this engine, also the ID of this engine's {@link SceneJS.Scene}
     * @type String
     */
    this.id = json.id;


    /**
     * Number of times the scene is drawn each time it's rendered.
     * <p>This is useful for when we need to do things like render for left and right eyes.
     * @type {*|number}
     */
    this._numPasses = json.numPasses || 1;

    /**
     * Canvas and GL context for this engine
     */
    this.canvas = new SceneJS_Canvas(this.id, json.canvasId, json.contextAttr, options);

    /**
     * Manages firing of and subscription to events
     */
    this.events = new SceneJS_eventManager();

    /**
     * State core factory - creates, stores, shares and destroys cores
     */
    this._coreFactory = new SceneJS_CoreFactory();

    /**
     * Manages creation, recycle and destruction of {@link SceneJS.Node} instances for this engine's scene graph
     */
    this._nodeFactory = new SceneJS_NodeFactory();

    /**
     * The engine's scene renderer
     * @type SceneJS_Display
     */
    this.display = new SceneJS_Display({
        canvas: this.canvas,
        transparent: json.transparent,
        dof: json.dof
    });

    /**
     * Flags the entirety of the scene graph as needing to be (re)compiled into the display
     */
    this.sceneDirty = false;

    /**
     * Flag set when at least one branch of the scene graph needs recompilation
     */
    this._sceneBranchesDirty = false;

    /**
     * List of nodes scheduled for destruction by #destroyNode
     * Destructions are done in a batch at the end of each render so as not to disrupt the render.
     */
    this._nodesToDestroy = [];

    /**
     * Number of nodes in destruction list
     */
    this._numNodesToDestroy = 0;

    /**
     * Frame rate. 0 means as fast as the browser will render.
     */
    this.fps = json.fps || 0;

    /**
     * Flag which is set while this engine is running - set after call to #start, unset after #stop or #pause
     */
    this.running = false;

    /**
     * Flag which is set while this engine is paused - set after call to #pause, unset after #stop or #start
     */
    this.paused = false;

    /**
     * Flag set once this engine has been destroyed
     */
    this.destroyed = false;

    /**
     * The current scene graph status
     */
    this.sceneStatus = {
        nodes: {}, // Status for each node
        numTasks: 0  // Number of loads currently in progress
    };

    var self = this;


    // Create scene root first, then create its subnodes
    // This way nodes can access the scene in their constructors
    var nodes = json.nodes;
    json.nodes = null;
    this.scene = this.createNode(json); // Create scene root

    if (nodes) {
        json.nodes = nodes;
        this.scene.addNodes(nodes); // then create sub-nodes
    }

    SceneJS_events.addListener(SceneJS_events.RENDER, function (event) {
        self.scene.publish("render", event);
    });

    this.canvas.canvas.addEventListener(// WebGL context lost
        "webglcontextlost",
        function (event) {
            event.preventDefault();
            self.stop();
            SceneJS_events.fireEvent(SceneJS_events.WEBGL_CONTEXT_LOST, {scene: self.scene});
        },
        false);

    this.canvas.canvas.addEventListener(// WebGL context recovered
        "webglcontextrestored",
        function (event) {
            self.canvas.initWebGL();
            self._coreFactory.webglRestored();  // Reallocate WebGL resources for node state cores
            self.display.webglRestored(); // Reallocate shaders and re-cache shader var locations for display state chunks
            SceneJS_events.fireEvent(SceneJS_events.WEBGL_CONTEXT_RESTORED, {scene: self.scene});
            self.start();
        },
        false);
};

/**
 * Sets the number of times the scene is drawn on each render.
 * <p>This is useful for when we need to do things like render for left and right eyes.
 * @param {Number} numPasses The number of times the scene is drawn on each frame.
 * @see #getTagMask
 * @see SceneJS.Tag
 */
SceneJS_Engine.prototype.setNumPasses = function (numPasses) {
    this._numPasses = numPasses;
};

/**
 * Simulate a lost WebGL context.
 * Only works if the simulateWebGLContextLost was given as an option to the engine's constructor.
 */
SceneJS_Engine.prototype.loseWebGLContext = function () {
    this.canvas.loseWebGLContext();
};

/**
 * Gets/loads the given node type
 *
 * @param {String} type Node type name
 * @param {Function(Function)} ok Callback fired when type loaded, returns the type constructor
 */
SceneJS_Engine.prototype.getNodeType = function (type, ok) {
    SceneJS_NodeFactory.getNodeType(type, ok);
};

/**
 * Returns true if the given node type is currently loaded (ie. load not required)
 * @param type
 */
SceneJS_Engine.prototype.hasNodeType = function (type) {
    return !!SceneJS_NodeFactory.nodeTypes[type];
};

/**
 * Recursively parse the given JSON scene graph representation and return a scene (sub)graph.
 *
 * @param {Object} json JSON definition of a scene graph or subgraph
 * @param {Function} ok Callback fired when node created, with the node as argument
 */
SceneJS_Engine.prototype.createNode = function (json, ok) {

    // Do buffered node destroys - don't want olds nodes
    // hanging around whose IDs may clash with the new node
    this._doDestroyNodes();

    json.type = json.type || "node"; // Nodes are SceneJS.Node type by default
    var core = this._coreFactory.getCore(json.type, json.coreId); // Create or share a core
    var self = this;

    return this._nodeFactory.getNode(
        this,
        json,
        core,
        function (node) {

            // Create child nodes
            if (!node._fromPlugin && json.nodes) {
                var numNodes = 0;
                for (var i = 0, len = json.nodes.length; i < len; i++) {
                    self.createNode(
                        json.nodes[i],
                        function (childNode) {
                            node.addNode(childNode);
                            if (++numNodes == len) {
                                if (ok) {
                                    ok(node);
                                }
                                self.scene.publish("nodes/" + node.id, node);
                            }
                        });
                }
            } else {
                if (ok) {
                    ok(node);
                    self.scene.publish("nodes/" + node.id, node);
                }
            }
        });
};

/**
 * Performs pending node destructions. When destroyed, each node and its core is released back to the
 * node and core pools for reuse, respectively.
 */
SceneJS_Engine.prototype._doDestroyNodes = function () {
    var node;
    while (this._numNodesToDestroy > 0) {
        --this._numNodesToDestroy;
        node = this._nodesToDestroy[this._numNodesToDestroy];
        this._nodesToDestroy[this._numNodesToDestroy] = null; // Don't retain the node
        node._doDestroy();
        this._coreFactory.putCore(node._core);    // Release state core for reuse
        this._nodeFactory.putNode(node);         // Release node for reuse
    }
};

/**
 * Finds the node with the given ID in this engine's scene graph
 * @return {SceneJS.Node} The node if found, else null
 */
SceneJS_Engine.prototype.findNode = function (nodeId) {
    return this._nodeFactory.nodes.items[nodeId];
};

/** Finds nodes in this engine's scene graph that have nodes IDs matching the given regular expression
 * @param {String} nodeIdRegex Regular expression to match on node IDs
 * @return {[SceneJS.Node]} Array of nodes whose IDs match the given regex
 */
SceneJS_Engine.prototype.findNodes = function (nodeIdRegex) {

    var regex = new RegExp(nodeIdRegex);
    var nodes = [];
    var nodeMap = this._nodeFactory.nodes.items;

    for (var nodeId in nodeMap) {
        if (nodeMap.hasOwnProperty(nodeId)) {

            if (regex.test(nodeId)) {
                nodes.push(nodeMap[nodeId]);
            }
        }
    }

    return nodes;
};

/**
 * Tests whether a core of the given ID exists for the given node type
 * @param {String} type Node type
 * @param {String} coreId
 * @returns Boolean
 */
SceneJS_Engine.prototype.hasCore = function (type, coreId) {
    return this._coreFactory.hasCore(type, coreId);
};

/**
 * Schedules the given subtree of this engine's {@link SceneJS.Scene} for recompilation
 *
 * @param {SceneJS.Node} node Root node of the subtree to recompile
 */
SceneJS_Engine.prototype.branchDirty = function (node) {

    if (this.sceneDirty) {
        return; // Whole scene will recompile anyway
    }

    /* Dealing with some weirdness with the embedded window and iframe / window fascism.
     */
    if (node == window) {
        return;
    }

    node.branchDirty = true;
    node.dirty = true;

    for (var n = node.parent; n && !(n.dirty || n.branchDirty); n = n.parent) { // Flag path down to this node
        n.dirty = true;
    }

    this._sceneBranchesDirty = true;
};

/**
 * Renders a single frame. Does any pending scene compilations or draw graph updates first.
 * Ordinarily the frame is rendered only if compilations or draw graph updates were performed,
 * but may be forced to render the frame regardless.
 *
 * @param {*} params Rendering parameters
 * @param {Boolean} params.clear True to clear the display first (default)
 */
SceneJS_Engine.prototype.renderFrame = function (params) {

    var rendered = false;

    if (this._needCompile() || (params && params.force)) {

//        // Render display graph
//        this.display.render(params);

        var time = Date.now();

        var force = params && params.force;

        // Render the scene once for each pass
        for (var i = 0; i < this._numPasses; i++) {

            // Notify that render is upcoming
            this.scene.publish("rendering", {
                pass: i
            });

            // Compile scene graph to display graph, if necessary
            this.compile();

            // Render display graph
            // Clear buffers only on first frame
            this.display.render({
                clear: i == 0,
                force: force,
                opaqueOnly: params && params.opaqueOnly
            });

            // Notify that render completed
            this.scene.publish("rendered", {
                sceneId: this.id,
                time: time,
                pass: i
            });

            rendered = true;
        }
    }

    return rendered;
};

/**
 * Starts the render loop on this engine.
 */
SceneJS_Engine.prototype.start = function () {

    if (!this.running) { // Do nothing if already started

        this.running = true;
        this.paused = false;
        this.sceneDirty = true;

        var self = this;
        var fnName = "__scenejs_sceneLoop" + this.id;
        var sleeping = false;
        var time = Date.now();
        var prevTime = time;
        var startTime = time;
        var scene = this.scene;
        var rendered = false;
        var canvas = this.canvas.canvas;
        var width;
        var height;
        var lastWidth = null;
        var lastHeight = null;

        // Notify started
        this.events.fireEvent("started", {
            sceneId: self.id,
            startTime: startTime
        });

        var renderingEvent = {
            pass: 0
        };
        var renderOptions = {
            clear: true
        };
        var renderedEvent = {
            sceneId: self.id,
            time: time,
            pass: 0
        };
        var sleepEvent = {
            sceneId: self.id,
            startTime: time,
            prevTime: time,
            time: time
        };
        var canvasSizeEvent = {
            width: 0,
            height: 0,
            aspect: 1
        };
        var tickEvent = {
            sceneId: self.id,
            startTime: time,
            prevTime: time,
            time: time
        };

        function draw() {
            rendered = false;

            // Render the scene once for each pass
            for (var i = 0; i < self._numPasses; i++) {

                if (self._needCompile() || rendered) {

                    sleeping = false;

                    // Notify we're about to do a render
                    renderingEvent.pass = i;
                    scene.publish("rendering", renderingEvent);

                    // Compile scene graph to display graph, if necessary
                    self.compile();

                    // Render display graph
                    // Clear buffers only on first frame
                    renderOptions.clear = i == 0;
                    self.display.render(renderOptions);

                    // Notify that we've just done a render
                    renderedEvent.sceneId = self.id;
                    renderedEvent.time = time;
                    renderedEvent.pass = i;
                    scene.publish("rendered", renderedEvent);

                    rendered = true;
                }
            }

            // If any of the passes did not render anything, then put the render loop to sleep again
            if (!rendered) {
                if (!sleeping) {
                    sleepEvent.sceneId = self.id;
                    sleepEvent.startTime = startTime;
                    sleepEvent.prevTime = time;
                    sleepEvent.time = time;
                    scene.publish("sleep", sleepEvent);
                }
                sleeping = true;
            }
        }

        // Animation frame callback
        window[fnName] = function () {

            var resolutionScaling = self.canvas.resolutionScaling || 1;

            width = canvas.width = canvas.clientWidth * resolutionScaling;
            height = canvas.height = canvas.clientHeight * resolutionScaling;

            if (width != lastWidth || height != lastHeight) {
                canvasSizeEvent.width = width;
                canvasSizeEvent.height = height;
                canvasSizeEvent.aspect = width / height;
                scene.publish("canvasSize", canvasSizeEvent);
                self.display.imageDirty = true;
                lastWidth = width;
                lastHeight = height;
            }

            if (self.running && !self.paused) {

                time = Date.now();

                tickEvent.sceneId = self.id;
                tickEvent.startTime = startTime;
                tickEvent.prevTime = time;
                tickEvent.time = time;
                scene.publish("tick", tickEvent);

                prevTime = time;

                if (!self.running) { // "tick" handler have destroyed scene
                    return;
                }

                if (self.fps > 0) {
                    requestAnimationFrame(draw);
                } else {
                    draw();  // Already at an animation frame.
                }
            }

            if (self.running) {
                if (self.fps > 0) {
                    setTimeout(window[fnName], 1000 / self.fps);
                } else {
                    requestAnimationFrame(window[fnName]);
                }
            }
        };

        setTimeout(window[fnName], 0);
    }
};

/**
 * Performs a pick on this engine and returns a hit record containing at least the name of the picked
 * scene object (as configured by SceneJS.Name nodes) and the canvas pick coordinates. Ordinarily, picking
 * is the simple GPU color-name mapped method, but this method can instead perform a ray-intersect pick
 * when the 'rayPick' flag is set on the options parameter for this method. For that mode, this method will
 * also find the intersection point on the picked object's near surface with a ray cast from the eye that passes
 * through the mouse position on the projection plane.
 *
 * @param {Number} canvasX X-axis canvas pick coordinate
 * @param {Number} canvasY Y-axis canvas pick coordinate
 * @param options Pick options
 * @param options.rayPick Performs additional ray-intersect pick when true
 * @param options.regionPick Performs additional region-intersect pick when true
 * @returns The pick record
 */
SceneJS_Engine.prototype.pick = function (canvasX, canvasY, options) {

    // Do any pending scene compilations
    if (this._needCompile()) {
        this.compile();
    }

    var hit = this.display.pick({
        canvasX: canvasX,
        canvasY: canvasY,
        pickTriangle: options ? options.rayPick : false,
        pickRegion: options ? options.regionPick : false
    });

    return hit;
};

/**
 * Reads colors of pixels from the last rendered frame.
 */
SceneJS_Engine.prototype.readPixels = function (entries, size, opaqueOnly) {

    // Do any pending scene compilations
    if (this._needCompile()) {
        this.compile();
    }

    return this.display.readPixels(entries, size, opaqueOnly);
};

/**
 * Returns true if view needs refreshing from scene
 * @returns {Boolean}
 * @private
 */
SceneJS_Engine.prototype._needCompile = function () {
    return (this.display.imageDirty // Frame buffer needs redraw
    || this.display.drawListDirty // Draw list needs rebuild
    || this.display.stateSortDirty // Draw list needs to redetermine state order
    || this.display.stateOrderDirty // Draw list needs state sort
    || this.display.objectListDirty // Draw list needs to be rebuilt
    || this._sceneBranchesDirty // One or more branches in scene graph need (re)compilation
    || this.sceneDirty); // Whole scene needs recompilation
};

/**
 * Performs any pending scene compilations or display rebuilds
 */
SceneJS_Engine.prototype.compile = function () {
    if (this._sceneBranchesDirty || this.sceneDirty) { // Need scene graph compilation
        this._sceneBranchesDirty = false;
        SceneJS_events.fireEvent(SceneJS_events.SCENE_COMPILING, {  // Notify compilation support start
            engine: this                                            // Compilation support modules get ready
        });
        this.pubSubProxy = new SceneJS_PubSubProxy(this.scene, null);
        var ctx = {
            pubSubProxy: this.pubSubProxy
        };
        this.scene._compileNodes(ctx); // Begin depth-first compilation descent into scene sub-nodes
        this.sceneDirty = false;
    }
    this._doDestroyNodes(); // Garbage collect destroyed nodes - node destructions set imageDirty true
};

/**
 * Pauses/unpauses the render loop
 * @param {Boolean} doPause Pauses or unpauses the render loop
 */
SceneJS_Engine.prototype.pause = function (doPause) {
    this.paused = doPause;
};

/**
 * Stops the render loop
 */
SceneJS_Engine.prototype.stop = function () {
    if (this.running) {
        this.running = false;
        this.paused = false;
        window["__scenejs_sceneLoop" + this.id] = null;
        //   this.events.fireEvent("stopped", { sceneId: this.id });
    }
};

/**
 * Destroys a node within this engine's {@link SceneJS.Scene}
 *
 * @param {SceneJS.Node} node Node to destroy
 */
SceneJS_Engine.prototype.destroyNode = function (node) {

    /* The node is actually scheduled for lazy destruction within the next invocation of #_tryCompile
     */
    this._nodesToDestroy[this._numNodesToDestroy++] = node;

    /* Stop tracking node's status
     */
    var nodeStatus = this.sceneStatus.nodes[node.id];

    if (nodeStatus) {
        this.sceneStatus.numTasks -= nodeStatus.numTasks;
        delete this.sceneStatus.nodes[node.id];
    }
};

/**
 * Destroys this engine
 */
SceneJS_Engine.prototype.destroy = function () {
    this.destroyed = true;
    // this.events.fireEvent("destroyed", { sceneId: this.id });
};

/*---------------------------------------------------------------------------------------------------------------------
 * JavaScript augmentations to support render loop
 *--------------------------------------------------------------------------------------------------------------------*/

if (!self.Int32Array) {
    self.Int32Array = Array;
    self.Float32Array = Array;
}

// Ripped off from THREE.js - https://github.com/mrdoob/three.js/blob/master/src/Three.js
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'RequestCancelAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());
;/**
 * Backend module that provides single point through which exceptions may be raised
 *
 * @class SceneJS_error
 * @private
 */
var SceneJS_error = new (function() {

    var activeSceneId;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING, // Set default logging for scene root
            function(params) {
                activeSceneId = params.engine.id;
            });

    SceneJS_events.addListener(
            SceneJS_events.RESET,
            function() {
                activeSceneId = null;
            },
            100000);  // Really low priority - must be reset last

    this.fatalError = function(code, message) {
        if (typeof code == "string") {
            message = code;
            code = SceneJS.errors.ERROR;
        }
        var error = {
            errorName: SceneJS.errors._getErrorName(code) || "ERROR",
            code: code,
            exception: message,
            fatal: true
        };
        if (activeSceneId) {
            error.sceneId = activeSceneId;
        }
        SceneJS_events.fireEvent(SceneJS_events.ERROR, error);
        return message;
    };

    this.error = function(code, message) {
        var error = {
            errorName: SceneJS.errors._getErrorName(code) || "ERROR",
            code: code,
            exception: message,
            fatal: false
        };
        if (activeSceneId) {
            error.sceneId = activeSceneId;
        }
        SceneJS_events.fireEvent(SceneJS_events.ERROR, error);
    };
})();

(function() {
    SceneJS.errors = {};

    var n = 0;
    SceneJS.errors.ERROR = n++;
    SceneJS.errors.INVALID_FRAMEBUFFER = n++;
    SceneJS.errors.WEBGL_NOT_SUPPORTED = n++;
    SceneJS.errors.WEBGL_CONTEXT_LOST = n++;
    SceneJS.errors.NODE_CONFIG_EXPECTED = n++;
    SceneJS.errors.ILLEGAL_NODE_CONFIG = n++;
    SceneJS.errors.SHADER_COMPILATION_FAILURE = n++;
    SceneJS.errors.SHADER_LINK_FAILURE = n++;
    SceneJS.errors.CANVAS_NOT_FOUND = n++;
    SceneJS.errors.OUT_OF_VRAM = n++;
    SceneJS.errors.WEBGL_UNSUPPORTED_NODE_CONFIG = n++;
    SceneJS.errors.NODE_NOT_FOUND = n++;
    SceneJS.errors.NODE_ILLEGAL_STATE = n++;
    SceneJS.errors.ID_CLASH = n++;
    SceneJS.errors.PLUGIN_INVALID = n++;
})();

SceneJS.errors._getErrorName = function(code) {
    for (var key in SceneJS.errors) {
        if (SceneJS.errors.hasOwnProperty(key) && SceneJS.errors[key] == code) {
            return key;
        }
    }
    return null;
};

;/**
 * Backend that manages configurations.
 *
 * @class SceneJS_configsModule
 * @private
 */
var SceneJS_configsModule = new (function () {

    this.configs = {};
    var subs = {};

    /**
     * Set a config
     * @param path
     * @param data
     */
    this.setConfigs = function (path, data) {
        // Update configs
        if (!path) {
            this.configs = data;
        } else {
            var parts = path.split(".");
            var cfg = this.configs;
            var subCfg;
            var name;
            for (var i = 0; i < parts.length - 1; i++) {
                name = parts[i];
                subCfg = cfg[name];
                if (!subCfg) {
                    subCfg = cfg[name] = {};
                }
                cfg = subCfg;
            }
            cfg[parts.length - 1] = data;
        }
        // Notify subscribers
        var list = subs[path || "_all"];
        if (list) {
            for (var i = 0, len = list.length; i < len; i++) {
                list[i](cfg);
            }
        }

        SceneJS.publish("configs", this.configs);
    };

    /**
     * Get a config
     * @param path
     * @return {*}
     */
    this.getConfigs = function (path) {
        if (!path) {
            return this.configs;
        } else {
            var cfg = this.configs;
            var parts = path.split(".");
            for (var i = 0; cfg && i < parts.length; i++) {
                cfg = cfg[parts[i]];
            }
            return (cfg != undefined) ? cfg : {};
        }
    };

    /**
     * Subscribe to updates to a config
     * @param path
     * @param ok
     */
    this.on = function (path, ok) {
        path = path || "_all";
        (subs[path] || (subs[path] = [])).push(ok);
        ok(this.getConfigs(path));
    };

})();

/** Sets configurations.
 */
SceneJS.configure = SceneJS.setConfigs = SceneJS.setDebugConfigs = function () {
    if (arguments.length == 1) {
        SceneJS_configsModule.setConfigs(null, arguments[0]);
    } else if (arguments.length == 2) {
        SceneJS_configsModule.setConfigs(arguments[0], arguments[1]);
    } else {
        throw SceneJS_error.fatalError("Illegal arguments given to SceneJS.setDebugs - should be either ({String}:name, {Object}:cfg) or ({Object}:cfg)");
    }
};

/** Gets configurations
 */
SceneJS.getConfigs = SceneJS.getDebugConfigs = function (path) {
    return SceneJS_configsModule.getConfigs(path);
};

;/**
 * @class Manages logging
 *  @private
 */
SceneJS.log = new (function() {

    var activeSceneId;
    var funcs = null;
    var queues = {};
    var indent = 0;
    var indentStr = "";

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING, // Set default logging for scene root
            function(params) {
                activeSceneId = params.engine.id;
            });

    SceneJS_events.addListener(
            SceneJS_events.RESET,
            function() {
                queues = {};
                funcs = null;
                activeSceneId = null;
            },
            100000);  // Really low priority - must be reset last

    this._setIndent = function(_indent) {
        indent = _indent;
        var indentArray = [];
        for (var i = 0; i < indent; i++) {
            indentArray.push("----");
        }
        indentStr = indentArray.join("");
    };

    this.error = function(msg) {
        this._log("error", msg);
    };

    this.warn = function(msg) {
        this._log("warn", msg);
    };

    this.info = function(msg) {
        this._log("info", msg);
    };

    this.debug = function(msg) {
        this._log("debug", msg);
    };

    this.setFuncs = function(l) {
        if (l) {
            funcs = l;
            for (var channel in queues) {
                this._flush(channel);
            }
        }
    };

    this._flush = function(channel) {
        var queue = queues[channel];
        if (queue) {
            var func = funcs ? funcs[channel] : null;
            if (func) {
                for (var i = 0; i < queue.length; i++) {
                    func(queue[i]);
                }
                queues[channel] = [];
            }
        }
    };

    this._log = function(channel, message) {
        if (SceneJS._isArray(message)) {
            for (var i = 0; i < message.length; i++) {
                this.__log(channel, message[i]);
            }
        } else {
            this.__log(channel, message);
        }
    };

    this.__log = function(channel, message) {
        message = indentStr + message;

        if (funcs && funcs[channel]) {
            funcs[channel](message);

        } else if (console && console[channel]) {
            console[channel](message);
        }
    };

    this.getFuncs = function() {
        return funcs;
    };

})();;(function () {

    /*
     * Optimizations made based on glMatrix by Brandon Jones
     */

    /*
     * Copyright (c) 2010 Brandon Jones
     *
     * This software is provided 'as-is', without any express or implied
     * warranty. In no event will the authors be held liable for any damages
     * arising from the use of this software.
     *
     * Permission is granted to anyone to use this software for any purpose,
     * including commercial applications, and to alter it and redistribute it
     * freely, subject to the following restrictions:
     *
     *    1. The origin of this software must not be misrepresented; you must not
     *    claim that you wrote the original software. If you use this software
     *    in a product, an acknowledgment in the product documentation would be
     *    appreciated but is not required.
     *
     *    2. Altered source versions must be plainly marked as such, and must not
     *    be misrepresented as being the original software.
     *
     *    3. This notice may not be removed or altered from any source
     *    distribution.
     */


    // Some temporary vars to help avoid garbage collection

    var tempMat1 = new Float32Array(16);
    var tempMat2 = new Float32Array(16);
    var tempVec3 = new Float32Array(3);
    var tempVec3b = new Float32Array(3);
    var tempVec3c = new Float32Array(3);
    var tempVec3d = new Float32Array(3);
    var tempVec3e = new Float32Array(3);
    var tempVec3f = new Float32Array(3);
    var tempVec3g = new Float32Array(3);
    var tempVec3h = new Float32Array(3);
    var tempVec4 = new Float32Array(4);

    /**
     * Returns a new, uninitialized two-element vector.
     * @method vec2
     * @static
     * @returns {Float32Array}
     */
    window.SceneJS_math_vec2 = function () {
        return new Float32Array(2);
    };

    /**
     * Returns a new, uninitialized three-element vector.
     * @method vec3
     * @static
     * @returns {Float32Array}
     */
    window.SceneJS_math_vec3 = function () {
        return new Float32Array(3);
    };

    /**
     * Returns a new, uninitialized four-element vector.
     * @method vec4
     * @static
     * @returns {Float32Array}
     */
    window.SceneJS_math_vec4 = function () {
        return new Float32Array(4);
    };

    /**
     * Returns a new, uninitialized 3x3 matrix.
     * @method mat3
     * @static
     * @returns {Float32Array}
     */
    window.SceneJS_math_mat3 = function () {
        return new Float32Array(9);
    };

    /**
     * Returns a new, uninitialized 4x4 matrix.
     * @method mat4
     * @static
     * @returns {Float32Array}
     */
    window.SceneJS_math_mat4 = function () {
        return new Float32Array(16);
    };

    /**
     * @param u vec3
     * @param v vec3
     * @param dest vec3 - optional destination
     * @return {vec3} dest if specified, u otherwise
     * @private
     */
    window.SceneJS_math_divVec3 = function (u, v, dest) {
        if (!dest) {
            dest = u;
        }

        dest[0] = u[0] / v[0];
        dest[1] = u[1] / v[1];
        dest[2] = u[2] / v[2];

        return dest;
    };

    /**
     * @param v vec4
     * @param dest vec4 - optional destination
     * @return {vec4} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_negateVector4 = function (v, dest) {
        if (!dest) {
            dest = v;
        }
        dest[0] = -v[0];
        dest[1] = -v[1];
        dest[2] = -v[2];
        dest[3] = -v[3];

        return dest;
    };

    /**
     * @param u vec4
     * @param v vec4
     * @param dest vec4 - optional destination
     * @return {vec4} dest if specified, u otherwise
     * @private
     */
    window.SceneJS_math_addVec4 = function (u, v, dest) {
        if (!dest) {
            dest = u;
        }

        dest[0] = u[0] + v[0];
        dest[1] = u[1] + v[1];
        dest[2] = u[2] + v[2];
        dest[3] = u[3] + v[3];

        return dest;
    };


    /**
     * @param v vec4
     * @param s scalar
     * @param dest vec4 - optional destination
     * @return {vec4} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_addVec4s = function (v, s, dest) {
        if (!dest) {
            dest = v;
        }

        dest[0] = v[0] + s;
        dest[1] = v[1] + s;
        dest[2] = v[2] + s;
        dest[3] = v[3] + s;

        return dest;
    };

    /**
     * @param u vec3
     * @param v vec3
     * @param dest vec3 - optional destination
     * @return {vec3} dest if specified, u otherwise
     * @private
     */
    window.SceneJS_math_addVec3 = function (u, v, dest) {
        if (!dest) {
            dest = u;
        }

        dest[0] = u[0] + v[0];
        dest[1] = u[1] + v[1];
        dest[2] = u[2] + v[2];

        return dest;
    };

    /**
     * @param v vec3
     * @param s scalar
     * @param dest vec3 - optional destination
     * @return {vec3} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_addVec3s = function (v, s, dest) {
        if (!dest) {
            dest = v;
        }

        dest[0] = v[0] + s;
        dest[1] = v[1] + s;
        dest[2] = v[2] + s;

        return dest;
    };

    /** @private */
    window.SceneJS_math_addScalarVec4 = function (s, v, dest) {
        return SceneJS_math_addVec4s(v, s, dest);
    };

    /**
     * @param u vec4
     * @param v vec4
     * @param dest vec4 - optional destination
     * @return {vec4} dest if specified, u otherwise
     * @private
     */
    window.SceneJS_math_subVec4 = function (u, v, dest) {
        if (!dest) {
            dest = u;
        }

        dest[0] = u[0] - v[0];
        dest[1] = u[1] - v[1];
        dest[2] = u[2] - v[2];
        dest[3] = u[3] - v[3];

        return dest;
    };

    /**
     * @param u vec3
     * @param v vec3
     * @param dest vec3 - optional destination
     * @return {vec3} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_subVec3 = function (u, v, dest) {
        if (!dest) {
            dest = u;
        }

        dest[0] = u[0] - v[0];
        dest[1] = u[1] - v[1];
        dest[2] = u[2] - v[2];

        return dest;
    };

    window.SceneJS_math_lerpVec3 = function (t, t1, t2, p1, p2, dest) {
        dest = dest || SceneJS_math_vec3();
        var f2 = (t - t1) / (t2 - t1);
        var f1 = 1.0 - f2;
        dest[0] = p1[0] * f1 + p2[0] * f2;
        dest[1] = p1[1] * f1 + p2[1] * f2;
        dest[2] = p1[2] * f1 + p2[2] * f2;
        return dest;
    };

    /**
     * @param u vec2
     * @param v vec2
     * @param dest vec2 - optional destination
     * @return {vec2} dest if specified, u otherwise
     * @private
     */
    window.SceneJS_math_subVec2 = function (u, v, dest) {
        if (!dest) {
            dest = u;
        }

        dest[0] = u[0] - v[0];
        dest[1] = u[1] - v[1];

        return dest;
    };

    /**
     * @param v vec4
     * @param s scalar
     * @param dest vec4 - optional destination
     * @return {vec4} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_subVec4Scalar = function (v, s, dest) {
        if (!dest) {
            dest = v;
        }

        dest[0] = v[0] - s;
        dest[1] = v[1] - s;
        dest[2] = v[2] - s;
        dest[3] = v[3] - s;

        return dest;
    };

    /**
     * @param v vec4
     * @param s scalar
     * @param dest vec4 - optional destination
     * @return {vec4} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_subScalarVec4 = function (v, s, dest) {
        if (!dest) {
            dest = v;
        }

        dest[0] = s - v[0];
        dest[1] = s - v[1];
        dest[2] = s - v[2];
        dest[3] = s - v[3];

        return dest;
    };

    /**
     * @param u vec4
     * @param v vec4
     * @param dest vec4 - optional destination
     * @return {vec4} dest if specified, u otherwise
     * @private
     */
    window.SceneJS_math_mulVec4 = function (u, v, dest) {
        if (!dest) {
            dest = u;
        }

        dest[0] = u[0] * v[0];
        dest[1] = u[1] * v[1];
        dest[2] = u[2] * v[2];
        dest[3] = u[3] * v[3];

        return dest;
    };

    /**
     * @param v vec4
     * @param s scalar
     * @param dest vec4 - optional destination
     * @return {vec4} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_mulVec4Scalar = function (v, s, dest) {
        if (!dest) {
            dest = v;
        }

        dest[0] = v[0] * s;
        dest[1] = v[1] * s;
        dest[2] = v[2] * s;
        dest[3] = v[3] * s;

        return dest;
    };


    /**
     * @param v vec3
     * @param s scalar
     * @param dest vec3 - optional destination
     * @return {vec3} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_mulVec3Scalar = function (v, s, dest) {
        if (!dest) {
            dest = v;
        }

        dest[0] = v[0] * s;
        dest[1] = v[1] * s;
        dest[2] = v[2] * s;

        return dest;
    };

    /**
     * @param v vec2
     * @param s scalar
     * @param dest vec2 - optional destination
     * @return {vec2} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_mulVec2Scalar = function (v, s, dest) {
        if (!dest) {
            dest = v;
        }

        dest[0] = v[0] * s;
        dest[1] = v[1] * s;

        return dest;
    };


    /**
     * @param u vec4
     * @param v vec4
     * @param dest vec4 - optional destination
     * @return {vec4} dest if specified, u otherwise
     * @private
     */
    window.SceneJS_math_divVec4 = function (u, v, dest) {
        if (!dest) {
            dest = u;
        }

        dest[0] = u[0] / v[0];
        dest[1] = u[1] / v[1];
        dest[2] = u[2] / v[2];
        dest[3] = u[3] / v[3];

        return dest;
    };

    /**
     * @param v vec3
     * @param s scalar
     * @param dest vec3 - optional destination
     * @return {vec3} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_divScalarVec3 = function (s, v, dest) {
        if (!dest) {
            dest = v;
        }

        dest[0] = s / v[0];
        dest[1] = s / v[1];
        dest[2] = s / v[2];

        return dest;
    };

    /**
     * @param v vec3
     * @param s scalar
     * @param dest vec3 - optional destination
     * @return {vec3} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_divVec3s = function (v, s, dest) {
        if (!dest) {
            dest = v;
        }

        dest[0] = v[0] / s;
        dest[1] = v[1] / s;
        dest[2] = v[2] / s;

        return dest;
    };

    /**
     * @param v vec4
     * @param s scalar
     * @param dest vec4 - optional destination
     * @return {vec4} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_divVec4s = function (v, s, dest) {
        if (!dest) {
            dest = v;
        }

        dest[0] = v[0] / s;
        dest[1] = v[1] / s;
        dest[2] = v[2] / s;
        dest[3] = v[3] / s;

        return dest;
    };


    /**
     * @param s scalar
     * @param v vec4
     * @param dest vec4 - optional destination
     * @return {vec4} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_divScalarVec4 = function (s, v, dest) {
        if (!dest) {
            dest = v;
        }

        dest[0] = s / v[0];
        dest[1] = s / v[1];
        dest[2] = s / v[2];
        dest[3] = s / v[3];

        return dest;
    };


    /** @private */
    window.SceneJS_math_dotVector4 = function (u, v) {
        return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3]);
    };

    /** @private */
    window.SceneJS_math_cross3Vec4 = function (u, v) {
        var u0 = u[0], u1 = u[1], u2 = u[2];
        var v0 = v[0], v1 = v[1], v2 = v[2];
        return [
            u1 * v2 - u2 * v1,
            u2 * v0 - u0 * v2,
            u0 * v1 - u1 * v0,
            0.0];
    };

    /**
     * @param u vec3
     * @param v vec3
     * @param dest vec3 - optional destination
     * @return {vec3} dest if specified, u otherwise
     * @private
     */
    window.SceneJS_math_cross3Vec3 = function (u, v, dest) {
        if (!dest) {
            dest = u;
        }

        var x = u[0], y = u[1], z = u[2];
        var x2 = v[0], y2 = v[1], z2 = v[2];

        dest[0] = y * z2 - z * y2;
        dest[1] = z * x2 - x * z2;
        dest[2] = x * y2 - y * x2;

        return dest;
    };

    /**
     * Returns the dot product of two three-element vectors.
     * @method dotVec4
     * @static
     * @param {Array(Number)} u First vector
     * @param {Array(Number)} v Second vector
     * @return The dot product
     */
    window.SceneJS_math_dotVec3 = function (u, v) {
        return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]);
    };

    /** @private */
    window.SceneJS_math_sqLenVec4 = function (v) {
        return SceneJS_math_dotVector4(v, v);
    };

    /** @private */
    window.SceneJS_math_lenVec4 = function (v) {
        return Math.sqrt(SceneJS_math_sqLenVec4(v));
    };

    /** @private */
    window.SceneJS_math_dotVector3 = function (u, v) {
        return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]);
    };

    /** @private */
    window.SceneJS_math_dotVector2 = function (u, v) {
        return (u[0] * v[0] + u[1] * v[1]);
    };

    /** @private */
    window.SceneJS_math_sqLenVec3 = function (v) {
        return SceneJS_math_dotVector3(v, v);
    };

    /** @private */
    window.SceneJS_math_sqLenVec2 = function (v) {
        return SceneJS_math_dotVector2(v, v);
    };

    /** @private */
    window.SceneJS_math_lenVec3 = function (v) {
        return Math.sqrt(SceneJS_math_sqLenVec3(v));
    };

    /** @private */
    window.SceneJS_math_lenVec2 = function (v) {
        return Math.sqrt(SceneJS_math_sqLenVec2(v));
    };

    /**
     * @param v vec3
     * @param dest vec3 - optional destination
     * @return {vec3} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_rcpVec3 = function (v, dest) {
        return SceneJS_math_divScalarVec3(1.0, v, dest);
    };

    /**
     * @param v vec4
     * @param dest vec4 - optional destination
     * @return {vec4} dest if specified, v otherwise
     * @private
     */
    window.SceneJS_math_normalizeVec4 = function (v, dest) {
        var f = 1.0 / SceneJS_math_lenVec4(v);
        return SceneJS_math_mulVec4Scalar(v, f, dest);
    };

    /** @private */
    window.SceneJS_math_normalizeVec3 = function (v, dest) {
        var f = 1.0 / SceneJS_math_lenVec3(v);
        return SceneJS_math_mulVec3Scalar(v, f, dest);
    };

// @private
    window.SceneJS_math_normalizeVec2 = function (v, dest) {
        var f = 1.0 / SceneJS_math_lenVec2(v);
        return SceneJS_math_mulVec2Scalar(v, f, dest);
    };

    /** @private */
    window.SceneJS_math_mat4 = function () {
        return new Array(16);
    };

    /** @private */
    window.SceneJS_math_dupMat4 = function (m) {
        return m.slice(0, 16);
    };

    /** @private */
    window.SceneJS_math_getCellMat4 = function (m, row, col) {
        return m[row + col * 4];
    };

    /** @private */
    window.SceneJS_math_setCellMat4 = function (m, row, col, s) {
        m[row + col * 4] = s;
    };

    /** @private */
    window.SceneJS_math_getRowMat4 = function (m, r) {
        return [m[r], m[r + 4], m[r + 8], m[r + 12]];
    };

    /** @private */
    window.SceneJS_math_setRowMat4 = function (m, r, v) {
        m[r] = v[0];
        m[r + 4] = v[1];
        m[r + 8] = v[2];
        m[r + 12] = v[3];
    };

    /** @private */
    window.SceneJS_math_setRowMat4c = function (m, r, x, y, z, w) {
        SceneJS_math_setRowMat4(m, r, [x, y, z, w]);
    };

    /** @private */
    window.SceneJS_math_setRowMat4s = function (m, r, s) {
        SceneJS_math_setRowMat4c(m, r, s, s, s, s);
    };

    /** @private */
    window.SceneJS_math_getColMat4 = function (m, c) {
        var i = c * 4;
        return [m[i], m[i + 1], m[i + 2], m[i + 3]];
    };

    /** @private */
    window.SceneJS_math_setColMat4v = function (m, c, v) {
        var i = c * 4;
        m[i] = v[0];
        m[i + 1] = v[1];
        m[i + 2] = v[2];
        m[i + 3] = v[3];
    };

    /** @private */
    window.SceneJS_math_setColMat4c = function (m, c, x, y, z, w) {
        SceneJS_math_setColMat4v(m, c, [x, y, z, w]);
    };

    /** @private */
    window.SceneJS_math_setColMat4Scalar = function (m, c, s) {
        SceneJS_math_setColMat4c(m, c, s, s, s, s);
    };

    /** @private */
    window.SceneJS_math_mat4To3 = function (m) {
        return [
            m[0], m[1], m[2],
            m[4], m[5], m[6],
            m[8], m[9], m[10]
        ];
    };

    /** @private */
    window.SceneJS_math_m4s = function (s) {
        return [
            s, s, s, s,
            s, s, s, s,
            s, s, s, s,
            s, s, s, s
        ];
    };

    /** @private */
    window.SceneJS_math_setMat4ToZeroes = function () {
        return SceneJS_math_m4s(0.0);
    };

    /** @private */
    window.SceneJS_math_setMat4ToOnes = function () {
        return SceneJS_math_m4s(1.0);
    };

    /** @private */
    window.SceneJS_math_diagonalMat4v = function (v) {
        return [
            v[0], 0.0, 0.0, 0.0,
            0.0, v[1], 0.0, 0.0,
            0.0, 0.0, v[2], 0.0,
            0.0, 0.0, 0.0, v[3]
        ];
    };

    /** @private */
    window.SceneJS_math_diagonalMat4c = function (x, y, z, w) {
        return SceneJS_math_diagonalMat4v([x, y, z, w]);
    };

    /** @private */
    window.SceneJS_math_diagonalMat4s = function (s) {
        return SceneJS_math_diagonalMat4c(s, s, s, s);
    };

    /** @private */
    window.SceneJS_math_identityMat4 = function () {
        return SceneJS_math_diagonalMat4v([1.0, 1.0, 1.0, 1.0]);
    };

    /** @private */
    window.SceneJS_math_isIdentityMat4 = function (m) {
        if (m[0] !== 1.0 || m[1] !== 0.0 || m[2] !== 0.0 || m[3] !== 0.0 ||
            m[4] !== 0.0 || m[5] !== 1.0 || m[6] !== 0.0 || m[7] !== 0.0 ||
            m[8] !== 0.0 || m[9] !== 0.0 || m[10] !== 1.0 || m[11] !== 0.0 ||
            m[12] !== 0.0 || m[13] !== 0.0 || m[14] !== 0.0 || m[15] !== 1.0) {
            return false;
        }

        return true;
    };

    /**
     * @param m mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     * @private
     */
    window.SceneJS_math_negateMat4 = function (m, dest) {
        if (!dest) {
            dest = m;
        }

        dest[0] = -m[0];
        dest[1] = -m[1];
        dest[2] = -m[2];
        dest[3] = -m[3];
        dest[4] = -m[4];
        dest[5] = -m[5];
        dest[6] = -m[6];
        dest[7] = -m[7];
        dest[8] = -m[8];
        dest[9] = -m[9];
        dest[10] = -m[10];
        dest[11] = -m[11];
        dest[12] = -m[12];
        dest[13] = -m[13];
        dest[14] = -m[14];
        dest[15] = -m[15];

        return dest;
    };

    /**
     * @param a mat4
     * @param b mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, a otherwise
     * @private
     */
    window.SceneJS_math_addMat4 = function (a, b, dest) {
        if (!dest) {
            dest = a;
        }

        dest[0] = a[0] + b[0];
        dest[1] = a[1] + b[1];
        dest[2] = a[2] + b[2];
        dest[3] = a[3] + b[3];
        dest[4] = a[4] + b[4];
        dest[5] = a[5] + b[5];
        dest[6] = a[6] + b[6];
        dest[7] = a[7] + b[7];
        dest[8] = a[8] + b[8];
        dest[9] = a[9] + b[9];
        dest[10] = a[10] + b[10];
        dest[11] = a[11] + b[11];
        dest[12] = a[12] + b[12];
        dest[13] = a[13] + b[13];
        dest[14] = a[14] + b[14];
        dest[15] = a[15] + b[15];

        return dest;
    };

    /**
     * @param m mat4
     * @param s scalar
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     * @private
     */
    window.SceneJS_math_addMat4Scalar = function (m, s, dest) {
        if (!dest) {
            dest = m;
        }

        dest[0] = m[0] + s;
        dest[1] = m[1] + s;
        dest[2] = m[2] + s;
        dest[3] = m[3] + s;
        dest[4] = m[4] + s;
        dest[5] = m[5] + s;
        dest[6] = m[6] + s;
        dest[7] = m[7] + s;
        dest[8] = m[8] + s;
        dest[9] = m[9] + s;
        dest[10] = m[10] + s;
        dest[11] = m[11] + s;
        dest[12] = m[12] + s;
        dest[13] = m[13] + s;
        dest[14] = m[14] + s;
        dest[15] = m[15] + s;

        return dest;
    };

    /** @private */
    window.SceneJS_math_addScalarMat4 = function (s, m, dest) {
        return SceneJS_math_addMat4Scalar(m, s, dest);
    };

    /**
     * @param a mat4
     * @param b mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, a otherwise
     * @private
     */
    window.SceneJS_math_subMat4 = function (a, b, dest) {
        if (!dest) {
            dest = a;
        }

        dest[0] = a[0] - b[0];
        dest[1] = a[1] - b[1];
        dest[2] = a[2] - b[2];
        dest[3] = a[3] - b[3];
        dest[4] = a[4] - b[4];
        dest[5] = a[5] - b[5];
        dest[6] = a[6] - b[6];
        dest[7] = a[7] - b[7];
        dest[8] = a[8] - b[8];
        dest[9] = a[9] - b[9];
        dest[10] = a[10] - b[10];
        dest[11] = a[11] - b[11];
        dest[12] = a[12] - b[12];
        dest[13] = a[13] - b[13];
        dest[14] = a[14] - b[14];
        dest[15] = a[15] - b[15];

        return dest;
    };

    /**
     * @param m mat4
     * @param s scalar
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     * @private
     */
    window.SceneJS_math_subMat4Scalar = function (m, s, dest) {
        if (!dest) {
            dest = m;
        }

        dest[0] = m[0] - s;
        dest[1] = m[1] - s;
        dest[2] = m[2] - s;
        dest[3] = m[3] - s;
        dest[4] = m[4] - s;
        dest[5] = m[5] - s;
        dest[6] = m[6] - s;
        dest[7] = m[7] - s;
        dest[8] = m[8] - s;
        dest[9] = m[9] - s;
        dest[10] = m[10] - s;
        dest[11] = m[11] - s;
        dest[12] = m[12] - s;
        dest[13] = m[13] - s;
        dest[14] = m[14] - s;
        dest[15] = m[15] - s;

        return dest;
    };

    /**
     * @param s scalar
     * @param m mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     * @private
     */
    window.SceneJS_math_subScalarMat4 = function (s, m, dest) {
        if (!dest) {
            dest = m;
        }

        dest[0] = s - m[0];
        dest[1] = s - m[1];
        dest[2] = s - m[2];
        dest[3] = s - m[3];
        dest[4] = s - m[4];
        dest[5] = s - m[5];
        dest[6] = s - m[6];
        dest[7] = s - m[7];
        dest[8] = s - m[8];
        dest[9] = s - m[9];
        dest[10] = s - m[10];
        dest[11] = s - m[11];
        dest[12] = s - m[12];
        dest[13] = s - m[13];
        dest[14] = s - m[14];
        dest[15] = s - m[15];

        return dest;
    };

    /**
     * @param a mat4
     * @param b mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, a otherwise
     * @private
     */
    window.SceneJS_math_mulMat4 = function (a, b, dest) {
        if (!dest) {
            dest = a;
        }

        // Cache the matrix values (makes for huge speed increases!)
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        var b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
        var b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7];
        var b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
        var b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

        dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
        dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
        dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
        dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
        dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
        dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
        dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
        dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
        dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
        dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
        dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
        dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

        return dest;
    };

    /**
     * @param m mat4
     * @param s scalar
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, m otherwise
     * @private
     */
    window.SceneJS_math_mulMat4s = function (m, s, dest) {
        if (!dest) {
            dest = m;
        }

        dest[0] = m[0] * s;
        dest[1] = m[1] * s;
        dest[2] = m[2] * s;
        dest[3] = m[3] * s;
        dest[4] = m[4] * s;
        dest[5] = m[5] * s;
        dest[6] = m[6] * s;
        dest[7] = m[7] * s;
        dest[8] = m[8] * s;
        dest[9] = m[9] * s;
        dest[10] = m[10] * s;
        dest[11] = m[11] * s;
        dest[12] = m[12] * s;
        dest[13] = m[13] * s;
        dest[14] = m[14] * s;
        dest[15] = m[15] * s;

        return dest;
    };

    /**
     * @param m mat4
     * @param v vec4
     * @return {vec4}
     * @private
     */
    window.SceneJS_math_mulMat4v4 = function (m, v) {
        var v0 = v[0], v1 = v[1], v2 = v[2], v3 = v[3];

        return [
            m[0] * v0 + m[4] * v1 + m[8] * v2 + m[12] * v3,
            m[1] * v0 + m[5] * v1 + m[9] * v2 + m[13] * v3,
            m[2] * v0 + m[6] * v1 + m[10] * v2 + m[14] * v3,
            m[3] * v0 + m[7] * v1 + m[11] * v2 + m[15] * v3
        ];
    };

    /**
     * @param mat mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, mat otherwise
     * @private
     */
    window.SceneJS_math_transposeMat4 = function (mat, dest) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        var m4 = mat[4], m14 = mat[14], m8 = mat[8];
        var m13 = mat[13], m12 = mat[12], m9 = mat[9];
        if (!dest || mat == dest) {
            var a01 = mat[1], a02 = mat[2], a03 = mat[3];
            var a12 = mat[6], a13 = mat[7];
            var a23 = mat[11];

            mat[1] = m4;
            mat[2] = m8;
            mat[3] = m12;
            mat[4] = a01;
            mat[6] = m9;
            mat[7] = m13;
            mat[8] = a02;
            mat[9] = a12;
            mat[11] = m14;
            mat[12] = a03;
            mat[13] = a13;
            mat[14] = a23;
            return mat;
        }

        dest[0] = mat[0];
        dest[1] = m4;
        dest[2] = m8;
        dest[3] = m12;
        dest[4] = mat[1];
        dest[5] = mat[5];
        dest[6] = m9;
        dest[7] = m13;
        dest[8] = mat[2];
        dest[9] = mat[6];
        dest[10] = mat[10];
        dest[11] = m14;
        dest[12] = mat[3];
        dest[13] = mat[7];
        dest[14] = mat[11];
        dest[15] = mat[15];
        return dest;
    };

    /** @private */
    window.SceneJS_math_determinantMat4 = function (mat) {
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
        var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
        var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
        var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

        return a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 +
            a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 +
            a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 +
            a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 +
            a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 +
            a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33;
    };

    /**
     * @param mat mat4
     * @param dest mat4 - optional destination
     * @return {mat4} dest if specified, mat otherwise
     * @private
     */
    window.SceneJS_math_inverseMat4 = function (mat, dest) {
        if (!dest) {
            dest = mat;
        }

        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
        var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
        var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
        var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

        var b00 = a00 * a11 - a01 * a10;
        var b01 = a00 * a12 - a02 * a10;
        var b02 = a00 * a13 - a03 * a10;
        var b03 = a01 * a12 - a02 * a11;
        var b04 = a01 * a13 - a03 * a11;
        var b05 = a02 * a13 - a03 * a12;
        var b06 = a20 * a31 - a21 * a30;
        var b07 = a20 * a32 - a22 * a30;
        var b08 = a20 * a33 - a23 * a30;
        var b09 = a21 * a32 - a22 * a31;
        var b10 = a21 * a33 - a23 * a31;
        var b11 = a22 * a33 - a23 * a32;

        // Calculate the determinant (inlined to avoid double-caching)
        var invDet = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);

        dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
        dest[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
        dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
        dest[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
        dest[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
        dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
        dest[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
        dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
        dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
        dest[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
        dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
        dest[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
        dest[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
        dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
        dest[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
        dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;

        return dest;
    };

    /** @private */
    window.SceneJS_math_traceMat4 = function (m) {
        return (m[0] + m[5] + m[10] + m[15]);
    };

    /** @private */
    window.SceneJS_math_translationMat4v = function (v) {
        var m = SceneJS_math_identityMat4();
        m[12] = v[0];
        m[13] = v[1];
        m[14] = v[2];
        return m;
    };

    /** @private */
    window.SceneJS_math_translationMat4c = function (x, y, z) {
        return SceneJS_math_translationMat4v([x, y, z]);
    };

    /** @private */
    window.SceneJS_math_translationMat4s = function (s) {
        return SceneJS_math_translationMat4c(s, s, s);
    };

    /** @private */
    window.SceneJS_math_rotationMat4v = function (anglerad, axis) {
        var ax = SceneJS_math_normalizeVec4([axis[0], axis[1], axis[2], 0.0]);
        var s = Math.sin(anglerad);
        var c = Math.cos(anglerad);
        var q = 1.0 - c;

        var x = ax[0];
        var y = ax[1];
        var z = ax[2];

        var xy, yz, zx, xs, ys, zs;

        //xx = x * x; used once
        //yy = y * y; used once
        //zz = z * z; used once
        xy = x * y;
        yz = y * z;
        zx = z * x;
        xs = x * s;
        ys = y * s;
        zs = z * s;

        var m = SceneJS_math_mat4();

        m[0] = (q * x * x) + c;
        m[1] = (q * xy) + zs;
        m[2] = (q * zx) - ys;
        m[3] = 0.0;

        m[4] = (q * xy) - zs;
        m[5] = (q * y * y) + c;
        m[6] = (q * yz) + xs;
        m[7] = 0.0;

        m[8] = (q * zx) + ys;
        m[9] = (q * yz) - xs;
        m[10] = (q * z * z) + c;
        m[11] = 0.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = 0.0;
        m[15] = 1.0;

        return m;
    };

    /** @private */
    window.SceneJS_math_rotationMat4c = function (anglerad, x, y, z) {
        return SceneJS_math_rotationMat4v(anglerad, [x, y, z]);
    };

    /** @private */
    window.SceneJS_math_scalingMat4v = function (v) {
        var m = SceneJS_math_identityMat4();
        m[0] = v[0];
        m[5] = v[1];
        m[10] = v[2];
        return m;
    };

    /** @private */
    window.SceneJS_math_scalingMat4c = function (x, y, z) {
        return SceneJS_math_scalingMat4v([x, y, z]);
    };

    /** @private */
    window.SceneJS_math_scalingMat4s = function (s) {
        return SceneJS_math_scalingMat4c(s, s, s);
    };

    /**
     * Default lookat properties - eye at 0,0,1, looking at 0,0,0, up vector pointing up Y-axis
     */
    window.SceneJS_math_LOOKAT_OBJ = {
        eye: {x: 0, y: 0, z: 10.0},
        look: {x: 0, y: 0, z: 0.0},
        up: {x: 0, y: 1, z: 0.0}
    };

    /**
     * Default lookat properties in array form - eye at 0,0,1, looking at 0,0,0, up vector pointing up Y-axis
     */
    window.SceneJS_math_LOOKAT_ARRAYS = {
        eye: [0, 0, 10.0],
        look: [0, 0, 0.0],
        up: [0, 1, 0.0]
    };

    /**
     * Default orthographic projection properties
     */
    window.SceneJS_math_ORTHO_OBJ = {
        left: -1.0,
        right: 1.0,
        bottom: -1.0,
        near: 0.1,
        top: 1.0,
        far: 5000.0
    };

    /**
     * @param pos vec3 position of the viewer
     * @param target vec3 point the viewer is looking at
     * @param up vec3 pointing "up"
     * @param dest mat4 Optional, mat4 frustum matrix will be written into
     *
     * @return {mat4} dest if specified, a new mat4 otherwise
     */
    window.SceneJS_math_lookAtMat4v = function (pos, target, up, dest) {
        if (!dest) {
            dest = SceneJS_math_mat4();
        }

        var posx = pos[0],
            posy = pos[1],
            posz = pos[2],
            upx = up[0],
            upy = up[1],
            upz = up[2],
            targetx = target[0],
            targety = target[1],
            targetz = target[2];

        if (posx == targetx && posy == targety && posz == targetz) {
            return SceneJS_math_identityMat4();
        }

        var z0, z1, z2, x0, x1, x2, y0, y1, y2, len;

        //vec3.direction(eye, center, z);
        z0 = posx - targetx;
        z1 = posy - targety;
        z2 = posz - targetz;

        // normalize (no check needed for 0 because of early return)
        len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;

        //vec3.normalize(vec3.cross(up, z, x));
        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        } else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }

        //vec3.normalize(vec3.cross(z, x, y));
        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;

        len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        if (!len) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        } else {
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len;
        }

        dest[0] = x0;
        dest[1] = y0;
        dest[2] = z0;
        dest[3] = 0;
        dest[4] = x1;
        dest[5] = y1;
        dest[6] = z1;
        dest[7] = 0;
        dest[8] = x2;
        dest[9] = y2;
        dest[10] = z2;
        dest[11] = 0;
        dest[12] = -(x0 * posx + x1 * posy + x2 * posz);
        dest[13] = -(y0 * posx + y1 * posy + y2 * posz);
        dest[14] = -(z0 * posx + z1 * posy + z2 * posz);
        dest[15] = 1;

        return dest;
    };

    /** @private */
    window.SceneJS_math_lookAtMat4c = function (posx, posy, posz, targetx, targety, targetz, upx, upy, upz) {
        return SceneJS_math_lookAtMat4v([posx, posy, posz], [targetx, targety, targetz], [upx, upy, upz]);
    };

    /** @private */
    window.SceneJS_math_orthoMat4c = function (left, right, bottom, top, near, far, dest) {
        if (!dest) {
            dest = SceneJS_math_mat4();
        }
        var rl = (right - left);
        var tb = (top - bottom);
        var fn = (far - near);

        dest[0] = 2.0 / rl;
        dest[1] = 0.0;
        dest[2] = 0.0;
        dest[3] = 0.0;

        dest[4] = 0.0;
        dest[5] = 2.0 / tb;
        dest[6] = 0.0;
        dest[7] = 0.0;

        dest[8] = 0.0;
        dest[9] = 0.0;
        dest[10] = -2.0 / fn;
        dest[11] = 0.0;

        dest[12] = -(left + right) / rl;
        dest[13] = -(top + bottom) / tb;
        dest[14] = -(far + near) / fn;
        dest[15] = 1.0;

        return dest;
    };

    /** @private */
    window.SceneJS_math_frustumMat4v = function (fmin, fmax) {
        var fmin4 = [fmin[0], fmin[1], fmin[2], 0.0];
        var fmax4 = [fmax[0], fmax[1], fmax[2], 0.0];
        var vsum = SceneJS_math_mat4();
        SceneJS_math_addVec4(fmax4, fmin4, vsum);
        var vdif = SceneJS_math_mat4();
        SceneJS_math_subVec4(fmax4, fmin4, vdif);
        var t = 2.0 * fmin4[2];

        var m = SceneJS_math_mat4();
        var vdif0 = vdif[0], vdif1 = vdif[1], vdif2 = vdif[2];

        m[0] = t / vdif0;
        m[1] = 0.0;
        m[2] = 0.0;
        m[3] = 0.0;

        m[4] = 0.0;
        m[5] = t / vdif1;
        m[6] = 0.0;
        m[7] = 0.0;

        m[8] = vsum[0] / vdif0;
        m[9] = vsum[1] / vdif1;
        m[10] = -vsum[2] / vdif2;
        m[11] = -1.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = -t * fmax4[2] / vdif2;
        m[15] = 0.0;

        return m;
    };

    /** @private */
    window.SceneJS_math_frustumMatrix4 = function (left, right, bottom, top, near, far, dest) {
        if (!dest) {
            dest = SceneJS_math_mat4();
        }
        var rl = (right - left);
        var tb = (top - bottom);
        var fn = (far - near);
        dest[0] = (near * 2) / rl;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = (near * 2) / tb;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = (right + left) / rl;
        dest[9] = (top + bottom) / tb;
        dest[10] = -(far + near) / fn;
        dest[11] = -1;
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = -(far * near * 2) / fn;
        dest[15] = 0;
        return dest;
    };


    /** @private */
    window.SceneJS_math_perspectiveMatrix4 = function (fovyrad, aspectratio, znear, zfar) {
        var pmin = [];
        var pmax = [];

        pmin[2] = znear;
        pmax[2] = zfar;

        pmax[1] = pmin[2] * Math.tan(fovyrad / 2.0);
        pmin[1] = -pmax[1];

        pmax[0] = pmax[1] * aspectratio;
        pmin[0] = -pmax[0];

        return SceneJS_math_frustumMat4v(pmin, pmax);
    };

    /** @private */
    window.SceneJS_math_transformPoint3 = function (m, p) {
        var p0 = p[0], p1 = p[1], p2 = p[2];
        return [
            (m[0] * p0) + (m[4] * p1) + (m[8] * p2) + m[12],
            (m[1] * p0) + (m[5] * p1) + (m[9] * p2) + m[13],
            (m[2] * p0) + (m[6] * p1) + (m[10] * p2) + m[14],
            (m[3] * p0) + (m[7] * p1) + (m[11] * p2) + m[15]
        ];
    };


    /** @private */
    window.SceneJS_math_transformPoints3 = function (m, points) {
        var result = new Array(points.length);
        var len = points.length;
        var p0, p1, p2;
        var pi;

        // cache values
        var m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3];
        var m4 = m[4], m5 = m[5], m6 = m[6], m7 = m[7];
        var m8 = m[8], m9 = m[9], m10 = m[10], m11 = m[11];
        var m12 = m[12], m13 = m[13], m14 = m[14], m15 = m[15];

        for (var i = 0; i < len; ++i) {
            // cache values
            pi = points[i];
            p0 = pi[0];
            p1 = pi[1];
            p2 = pi[2];

            result[i] = [
                (m0 * p0) + (m4 * p1) + (m8 * p2) + m12,
                (m1 * p0) + (m5 * p1) + (m9 * p2) + m13,
                (m2 * p0) + (m6 * p1) + (m10 * p2) + m14,
                (m3 * p0) + (m7 * p1) + (m11 * p2) + m15
            ];
        }

        return result;
    };

    /** @private */
    window.SceneJS_math_transformVector3 = function (m, v, dest) {
        var v0 = v[0], v1 = v[1], v2 = v[2];
        dest = dest || SceneJS_math_vec3();
        dest[0] = (m[0] * v0) + (m[4] * v1) + (m[8] * v2);
        dest[1] = (m[1] * v0) + (m[5] * v1) + (m[9] * v2);
        dest[2] = (m[2] * v0) + (m[6] * v1) + (m[10] * v2);
        return dest;
    };

    window.SceneJS_math_transformVector4 = function (m, v, dest) {
        var v0 = v[0], v1 = v[1], v2 = v[2], v3 = v[3];
        dest = dest || SceneJS_math_vec4();
        dest[0] = m[0] * v0 + m[4] * v1 + m[8] * v2 + m[12] * v3;
        dest[1] = m[1] * v0 + m[5] * v1 + m[9] * v2 + m[13] * v3;
        dest[2] = m[2] * v0 + m[6] * v1 + m[10] * v2 + m[14] * v3;
        dest[3] = m[3] * v0 + m[7] * v1 + m[11] * v2 + m[15] * v3;
        return dest;
    };

    /** @private */
    window.SceneJS_math_projectVec4 = function (v) {
        var f = 1.0 / v[3];
        return [v[0] * f, v[1] * f, v[2] * f, 1.0];
    };


    /** @private */
    window.SceneJS_math_Plane3 = function (normal, offset, normalize) {
        this.normal = [0.0, 0.0, 1.0];

        this.offset = 0.0;
        if (normal && offset) {
            var normal0 = normal[0], normal1 = normal[1], normal2 = normal[2];
            this.offset = offset;

            if (normalize) {
                var s = Math.sqrt(
                    normal0 * normal0 +
                    normal1 * normal1 +
                    normal2 * normal2
                );
                if (s > 0.0) {
                    s = 1.0 / s;
                    this.normal[0] = normal0 * s;
                    this.normal[1] = normal1 * s;
                    this.normal[2] = normal2 * s;
                    this.offset *= s;
                }
            }
        }
    };

    /** @private */
    window.SceneJS_math_MAX_DOUBLE = Number.POSITIVE_INFINITY;
    /** @private */
    window.SceneJS_math_MIN_DOUBLE = Number.NEGATIVE_INFINITY;

    /** @private
     *
     */
    window.SceneJS_math_Box3 = function (min, max) {
        this.min = min || [SceneJS_math_MAX_DOUBLE, SceneJS_math_MAX_DOUBLE, SceneJS_math_MAX_DOUBLE];
        this.max = max || [SceneJS_math_MIN_DOUBLE, SceneJS_math_MIN_DOUBLE, SceneJS_math_MIN_DOUBLE];

        /** @private */
        this.init = function (min, max) {
            this.min[0] = min[0];
            this.min[1] = min[1];
            this.min[2] = min[2];
            this.max[0] = max[0];
            this.max[1] = max[1];
            this.max[2] = max[2];
            return this;
        };

        /** @private */
        this.fromPoints = function (points) {
            var pointsLength = points.length;

            for (var i = 0; i < pointsLength; ++i) {
                var points_i3 = points[i][3];
                var pDiv0 = points[i][0] / points_i3;
                var pDiv1 = points[i][1] / points_i3;
                var pDiv2 = points[i][2] / points_i3;

                if (pDiv0 < this.min[0]) {
                    this.min[0] = pDiv0;
                }
                if (pDiv1 < this.min[1]) {
                    this.min[1] = pDiv1;
                }
                if (pDiv2 < this.min[2]) {
                    this.min[2] = pDiv2;
                }

                if (pDiv0 > this.max[0]) {
                    this.max[0] = pDiv0;
                }
                if (pDiv1 > this.max[1]) {
                    this.max[1] = pDiv1;
                }
                if (pDiv2 > this.max[2]) {
                    this.max[2] = pDiv2;
                }
            }
            return this;
        };

        /** @private */
        this.isEmpty = function () {
            return (
                (this.min[0] >= this.max[0]) &&
                (this.min[1] >= this.max[1]) &&
                (this.min[2] >= this.max[2])
            );
        };

        /** @private */
        this.getCenter = function () {
            return [
                (this.max[0] + this.min[0]) / 2.0,
                (this.max[1] + this.min[1]) / 2.0,
                (this.max[2] + this.min[2]) / 2.0
            ];
        };

        /** @private */
        this.getSize = function () {
            return [
                (this.max[0] - this.min[0]),
                (this.max[1] - this.min[1]),
                (this.max[2] - this.min[2])
            ];
        };

        /** @private */
        this.getFacesAreas = function () {
            var s = this.size;
            return [
                (s[1] * s[2]),
                (s[0] * s[2]),
                (s[0] * s[1])
            ];
        };

        /** @private */
        this.getSurfaceArea = function () {
            var a = this.getFacesAreas();
            return ((a[0] + a[1] + a[2]) * 2.0);
        };

        /** @private */
        this.getVolume = function () {
            var s = this.size;
            return (s[0] * s[1] * s[2]);
        };

        /** @private */
        this.getOffset = function (half_delta) {
            this.min[0] -= half_delta;
            this.min[1] -= half_delta;
            this.min[2] -= half_delta;
            this.max[0] += half_delta;
            this.max[1] += half_delta;
            this.max[2] += half_delta;
            return this;
        };
    };

    /** @private
     *
     * @param min
     * @param max
     */
    window.SceneJS_math_AxisBox3 = function (min, max) {
        var min0 = min[0], min1 = min[1], min2 = min[2];
        var max0 = max[0], max1 = max[1], max2 = max[2];

        this.verts = [
            [min0, min1, min2],
            [max0, min1, min2],
            [max0, max1, min2],
            [min0, max1, min2],

            [min0, min1, max2],
            [max0, min1, max2],
            [max0, max1, max2],
            [min0, max1, max2]
        ];

        /** @private */
        this.toBox3 = function () {
            var box = new SceneJS_math_Box3();
            for (var i = 0; i < 8; ++i) {
                var v = this.verts[i];
                for (var j = 0; j < 3; ++j) {
                    if (v[j] < box.min[j]) {
                        box.min[j] = v[j];
                    }
                    if (v[j] > box.max[j]) {
                        box.max[j] = v[j];
                    }
                }
            }
        };
    };

    /** @private
     *
     * @param center
     * @param radius
     */
    window.SceneJS_math_Sphere3 = function (center, radius) {
        this.center = [center[0], center[1], center[2]];
        this.radius = radius;

        /** @private */
        this.isEmpty = function () {
            return (this.radius === 0.0);
        };

        /** @private */
        this.surfaceArea = function () {
            return (4.0 * Math.PI * this.radius * this.radius);
        };

        /** @private */
        this.getVolume = function () {
            var thisRadius = this.radius;
            return ((4.0 / 3.0) * Math.PI * thisRadius * thisRadius * thisRadius);
        };
    };

    /** Creates billboard matrix from given view matrix
     * @private
     */
    window.SceneJS_math_billboardMat = function (viewMatrix) {
        var rotVec = [
            SceneJS_math_getColMat4(viewMatrix, 0),
            SceneJS_math_getColMat4(viewMatrix, 1),
            SceneJS_math_getColMat4(viewMatrix, 2)
        ];

        var scaleVec = [
            SceneJS_math_lenVec4(rotVec[0]),
            SceneJS_math_lenVec4(rotVec[1]),
            SceneJS_math_lenVec4(rotVec[2])
        ];

        var scaleVecRcp = SceneJS_math_mat4();
        SceneJS_math_rcpVec3(scaleVec, scaleVecRcp);
        var sMat = SceneJS_math_scalingMat4v(scaleVec);
        //var sMatInv = SceneJS_math_scalingMat4v(scaleVecRcp);

        SceneJS_math_mulVec4Scalar(rotVec[0], scaleVecRcp[0]);
        SceneJS_math_mulVec4Scalar(rotVec[1], scaleVecRcp[1]);
        SceneJS_math_mulVec4Scalar(rotVec[2], scaleVecRcp[2]);

        var rotMatInverse = SceneJS_math_identityMat4();

        SceneJS_math_setRowMat4(rotMatInverse, 0, rotVec[0]);
        SceneJS_math_setRowMat4(rotMatInverse, 1, rotVec[1]);
        SceneJS_math_setRowMat4(rotMatInverse, 2, rotVec[2]);

        //return rotMatInverse;
        //return SceneJS_math_mulMat4(sMatInv, SceneJS_math_mulMat4(rotMatInverse, sMat));
        return SceneJS_math_mulMat4(rotMatInverse, sMat);
        // return SceneJS_math_mulMat4(sMat, SceneJS_math_mulMat4(rotMatInverse, sMat));
        //return SceneJS_math_mulMat4(sMatInv, SceneJS_math_mulMat4(rotMatInverse, sMat));
    };

    /** @private */
    window.SceneJS_math_FrustumPlane = function (nx, ny, nz, offset) {
        var s = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz);
        this.normal = [nx * s, ny * s, nz * s];
        this.offset = offset * s;
        this.testVertex = [
            (this.normal[0] >= 0.0) ? (1) : (0),
            (this.normal[1] >= 0.0) ? (1) : (0),
            (this.normal[2] >= 0.0) ? (1) : (0)];
    };

    /** @private */
    window.SceneJS_math_OUTSIDE_FRUSTUM = 3;
    /** @private */
    window.SceneJS_math_INTERSECT_FRUSTUM = 4;
    /** @private */
    window.SceneJS_math_INSIDE_FRUSTUM = 5;

    /** @private */
    window.SceneJS_math_Frustum = function (viewMatrix, projectionMatrix, viewport) {
        var m = SceneJS_math_mat4();
        SceneJS_math_mulMat4(projectionMatrix, viewMatrix, m);

        // cache m indexes
        var m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3];
        var m4 = m[4], m5 = m[5], m6 = m[6], m7 = m[7];
        var m8 = m[8], m9 = m[9], m10 = m[10], m11 = m[11];
        var m12 = m[12], m13 = m[13], m14 = m[14], m15 = m[15];

        //var q = [ m[3], m[7], m[11] ]; just reuse m indexes instead of making new var
        var planes = [
            new SceneJS_math_FrustumPlane(m3 - m0, m7 - m4, m11 - m8, m15 - m12),
            new SceneJS_math_FrustumPlane(m3 + m0, m7 + m4, m11 + m8, m15 + m12),
            new SceneJS_math_FrustumPlane(m3 - m1, m7 - m5, m11 - m9, m15 - m13),
            new SceneJS_math_FrustumPlane(m3 + m1, m7 + m5, m11 + m9, m15 + m13),
            new SceneJS_math_FrustumPlane(m3 - m2, m7 - m6, m11 - m10, m15 - m14),
            new SceneJS_math_FrustumPlane(m3 + m2, m7 + m6, m11 + m10, m15 + m14)
        ];

        /* Resources for LOD
         */
        var rotVec = [
            SceneJS_math_getColMat4(viewMatrix, 0),
            SceneJS_math_getColMat4(viewMatrix, 1),
            SceneJS_math_getColMat4(viewMatrix, 2)
        ];

        var scaleVec = [
            SceneJS_math_lenVec4(rotVec[0]),
            SceneJS_math_lenVec4(rotVec[1]),
            SceneJS_math_lenVec4(rotVec[2])
        ];

        var scaleVecRcp = SceneJS_math_rcpVec3(scaleVec);
        var sMat = SceneJS_math_scalingMat4v(scaleVec);
        var sMatInv = SceneJS_math_scalingMat4v(scaleVecRcp);

        SceneJS_math_mulVec4Scalar(rotVec[0], scaleVecRcp[0]);
        SceneJS_math_mulVec4Scalar(rotVec[1], scaleVecRcp[1]);
        SceneJS_math_mulVec4Scalar(rotVec[2], scaleVecRcp[2]);

        var rotMatInverse = SceneJS_math_identityMat4();

        SceneJS_math_setRowMat4(rotMatInverse, 0, rotVec[0]);
        SceneJS_math_setRowMat4(rotMatInverse, 1, rotVec[1]);
        SceneJS_math_setRowMat4(rotMatInverse, 2, rotVec[2]);

        if (!this.matrix) {
            this.matrix = SceneJS_math_mat4();
        }
        SceneJS_math_mulMat4(projectionMatrix, viewMatrix, this.matrix);
        if (!this.billboardMatrix) {
            this.billboardMatrix = SceneJS_math_mat4();
        }
        SceneJS_math_mulMat4(sMatInv, SceneJS_math_mulMat4(rotMatInverse, sMat), this.billboardMatrix);
        this.viewport = viewport.slice(0, 4);

        /** @private */
        this.textAxisBoxIntersection = function (box) {
            var ret = SceneJS_math_INSIDE_FRUSTUM;
            var bminmax = [box.min, box.max];
            var plane = null;

            for (var i = 0; i < 6; ++i) {
                plane = planes[i];
                if (((plane.normal[0] * bminmax[plane.testVertex[0]][0]) +
                    (plane.normal[1] * bminmax[plane.testVertex[1]][1]) +
                    (plane.normal[2] * bminmax[plane.testVertex[2]][2]) +
                    (plane.offset)) < 0.0) {
                    return SceneJS_math_OUTSIDE_FRUSTUM;
                }
                if (((plane.normal[0] * bminmax[1 - plane.testVertex[0]][0]) +
                    (plane.normal[1] * bminmax[1 - plane.testVertex[1]][1]) +
                    (plane.normal[2] * bminmax[1 - plane.testVertex[2]][2]) +
                    (plane.offset)) < 0.0) {
                    ret = SceneJS_math_INTERSECT_FRUSTUM;
                }
            }
            return ret;
        };

        /** @private */
        this.getProjectedSize = function (box) {
            var diagVec = SceneJS_math_mat4();
            SceneJS_math_subVec3(box.max, box.min, diagVec);

            var diagSize = SceneJS_math_lenVec3(diagVec);

            var size = Math.abs(diagSize);

            var p0 = [
                (box.min[0] + box.max[0]) * 0.5,
                (box.min[1] + box.max[1]) * 0.5,
                (box.min[2] + box.max[2]) * 0.5,
                0.0];

            var halfSize = size * 0.5;
            var p1 = [-halfSize, 0.0, 0.0, 1.0];
            var p2 = [halfSize, 0.0, 0.0, 1.0];

            p1 = SceneJS_math_mulMat4v4(this.billboardMatrix, p1);
            p1 = SceneJS_math_addVec4(p1, p0);
            p1 = SceneJS_math_projectVec4(SceneJS_math_mulMat4v4(this.matrix, p1));

            p2 = SceneJS_math_mulMat4v4(this.billboardMatrix, p2);
            p2 = SceneJS_math_addVec4(p2, p0);
            p2 = SceneJS_math_projectVec4(SceneJS_math_mulMat4v4(this.matrix, p2));

            return viewport[2] * Math.abs(p2[0] - p1[0]);
        };


        this.getProjectedState = function (modelCoords) {
            var viewCoords = SceneJS_math_transformPoints3(this.matrix, modelCoords);

            //var canvasBox = {
            //    min: [10000000, 10000000 ],
            //    max: [-10000000, -10000000]
            //};
            // separate variables instead of indexing an array
            var canvasBoxMin0 = 10000000, canvasBoxMin1 = 10000000;
            var canvasBoxMax0 = -10000000, canvasBoxMax1 = -10000000;

            var v, x, y;

            var arrLen = viewCoords.length;
            for (var i = 0; i < arrLen; ++i) {
                v = SceneJS_math_projectVec4(viewCoords[i]);
                x = v[0];
                y = v[1];

                if (x < -0.5) {
                    x = -0.5;
                }

                if (y < -0.5) {
                    y = -0.5;
                }

                if (x > 0.5) {
                    x = 0.5;
                }

                if (y > 0.5) {
                    y = 0.5;
                }


                if (x < canvasBoxMin0) {
                    canvasBoxMin0 = x;
                }
                if (y < canvasBoxMin1) {
                    canvasBoxMin1 = y;
                }

                if (x > canvasBoxMax0) {
                    canvasBoxMax0 = x;
                }
                if (y > canvasBoxMax1) {
                    canvasBoxMax1 = y;
                }
            }

            canvasBoxMin0 += 0.5;
            canvasBoxMin1 += 0.5;
            canvasBoxMax0 += 0.5;
            canvasBoxMax1 += 0.5;

            // cache viewport indexes
            var viewport2 = viewport[2], viewport3 = viewport[3];

            canvasBoxMin0 = (canvasBoxMin0 * (viewport2 + 15));
            canvasBoxMin1 = (canvasBoxMin1 * (viewport3 + 15));
            canvasBoxMax0 = (canvasBoxMax0 * (viewport2 + 15));
            canvasBoxMax1 = (canvasBoxMax1 * (viewport3 + 15));

            var diagCanvasBoxVec = SceneJS_math_mat4();
            SceneJS_math_subVec2([canvasBoxMax0, canvasBoxMax1],
                [canvasBoxMin0, canvasBoxMin1],
                diagCanvasBoxVec);
            var diagCanvasBoxSize = SceneJS_math_lenVec2(diagCanvasBoxVec);

            if (canvasBoxMin0 < 0) {
                canvasBoxMin0 = 0;
            }
            if (canvasBoxMax0 > viewport2) {
                canvasBoxMax0 = viewport2;
            }

            if (canvasBoxMin1 < 0) {
                canvasBoxMin1 = 0;
            }
            if (canvasBoxMax1 > viewport3) {
                canvasBoxMax1 = viewport3;
            }
            return {
                canvasBox: {
                    min: [canvasBoxMin0, canvasBoxMin1],
                    max: [canvasBoxMax0, canvasBoxMax1]
                },
                canvasSize: diagCanvasBoxSize
            };
        };
    };

    window.SceneJS_math_identityQuaternion = function () {
        return [0.0, 0.0, 0.0, 1.0];
    };

    window.SceneJS_math_angleAxisQuaternion = function (x, y, z, degrees) {
        var angleRad = (degrees / 180.0) * Math.PI;
        var halfAngle = angleRad / 2.0;
        var fsin = Math.sin(halfAngle);
        return [
            fsin * x,
            fsin * y,
            fsin * z,
            Math.cos(halfAngle)
        ];
    };

    window.SceneJS_math_mulQuaternions = function (p, q) {
        var p0 = p[0], p1 = p[1], p2 = p[2], p3 = p[3];
        var q0 = q[0], q1 = q[1], q2 = q[2], q3 = q[3];
        return [
            p3 * q0 + p0 * q3 + p1 * q2 - p2 * q1,
            p3 * q1 + p1 * q3 + p2 * q0 - p0 * q2,
            p3 * q2 + p2 * q3 + p0 * q1 - p1 * q0,
            p3 * q3 - p0 * q0 - p1 * q1 - p2 * q2
        ];
    };

    window.SceneJS_math_newMat4FromQuaternion = function (q) {
        var q0 = q[0], q1 = q[1], q2 = q[2], q3 = q[3];
        var tx = 2.0 * q0;
        var ty = 2.0 * q1;
        var tz = 2.0 * q2;
        var twx = tx * q3;
        var twy = ty * q3;
        var twz = tz * q3;
        var txx = tx * q0;
        var txy = ty * q0;
        var txz = tz * q0;
        var tyy = ty * q1;
        var tyz = tz * q1;
        var tzz = tz * q2;
        var m = SceneJS_math_identityMat4();
        SceneJS_math_setCellMat4(m, 0, 0, 1.0 - (tyy + tzz));
        SceneJS_math_setCellMat4(m, 0, 1, txy - twz);
        SceneJS_math_setCellMat4(m, 0, 2, txz + twy);
        SceneJS_math_setCellMat4(m, 1, 0, txy + twz);
        SceneJS_math_setCellMat4(m, 1, 1, 1.0 - (txx + tzz));
        SceneJS_math_setCellMat4(m, 1, 2, tyz - twx);
        SceneJS_math_setCellMat4(m, 2, 0, txz - twy);
        SceneJS_math_setCellMat4(m, 2, 1, tyz + twx);
        SceneJS_math_setCellMat4(m, 2, 2, 1.0 - (txx + tyy));
        return m;
    };

    window.SceneJS_math_slerp = function (t, q1, q2) {
        //var result = SceneJS_math_identityQuaternion();
        var q13 = q1[3] * 0.0174532925;
        var q23 = q2[3] * 0.0174532925;
        var cosHalfAngle = q13 * q23 + q1[0] * q2[0] + q1[1] * q2[1] + q1[2] * q2[2];
        if (Math.abs(cosHalfAngle) >= 1) {
            return [q1[0], q1[1], q1[2], q1[3]];
        } else {
            var halfAngle = Math.acos(cosHalfAngle);
            var sinHalfAngle = Math.sqrt(1 - cosHalfAngle * cosHalfAngle);
            if (Math.abs(sinHalfAngle) < 0.001) {
                return [
                    q1[0] * 0.5 + q2[0] * 0.5,
                    q1[1] * 0.5 + q2[1] * 0.5,
                    q1[2] * 0.5 + q2[2] * 0.5,
                    q1[3] * 0.5 + q2[3] * 0.5
                ];
            } else {
                var a = Math.sin((1 - t) * halfAngle) / sinHalfAngle;
                var b = Math.sin(t * halfAngle) / sinHalfAngle;
                return [
                    q1[0] * a + q2[0] * b,
                    q1[1] * a + q2[1] * b,
                    q1[2] * a + q2[2] * b,
                    (q13 * a + q23 * b) * 57.295779579
                ];
            }
        }
    };

    window.SceneJS_math_normalizeQuaternion = function (q) {
        var len = SceneJS_math_lenVec4([q[0], q[1], q[2], q[3]]);
        return [q[0] / len, q[1] / len, q[2] / len, q[3] / len];
    };

    window.SceneJS_math_conjugateQuaternion = function (q) {
        return [-q[0], -q[1], -q[2], q[3]];
    };

    window.SceneJS_math_angleAxisFromQuaternion = function (q) {
        q = SceneJS_math_normalizeQuaternion(q);
        var q3 = q[3];
        var angle = 2 * Math.acos(q3);
        var s = Math.sqrt(1 - q3 * q3);
        if (s < 0.001) { // test to avoid divide by zero, s is always positive due to sqrt
            return {
                x: q[0],
                y: q[1],
                z: q[2],
                angle: angle * 57.295779579
            };
        } else {
            return {
                x: q[0] / s,
                y: q[1] / s,
                z: q[2] / s,
                angle: angle * 57.295779579
            };
        }
    };

    /**
     * Builds vertex and index arrays needed by color-indexed triangle picking.
     *
     * @method getPickPrimitives
     * @static
     * @param {Array of Number} positions One-dimensional flattened array of positions.
     * @param {Array of Number} indices One-dimensional flattened array of indices.
     * @returns {*} Object containing the arrays, created by this method or reused from 'pickTris' parameter.
     */
    window.SceneJS_math_getPickPrimitives = function (positions, indices) {

        var numIndices = indices.length;

        var pickPositions = new Float32Array(numIndices * 3);
        var pickColors = new Float32Array(numIndices * 4);

        var primIndex = 0;

        // Positions array index
        var vi;

        // Picking positions array index
        var pvi;

        // Picking color array index
        var pci;

        // Triangle indices

        var i;
        var r;
        var g;
        var b;
        var a;

        for (var location = 0; location < numIndices; location += 3) {

            pvi = location * 3;
            pci = location * 4;

            // Primitive-indexed triangle pick color

            a = (primIndex >> 24 & 0xFF) / 255.0;
            b = (primIndex >> 16 & 0xFF) / 255.0;
            g = (primIndex >> 8 & 0xFF) / 255.0;
            r = (primIndex & 0xFF) / 255.0;

            // A

            i = indices[location];
            vi = i * 3;

            pickPositions[pvi]     = positions[vi];
            pickPositions[pvi + 1] = positions[vi + 1];
            pickPositions[pvi + 2] = positions[vi + 2];

            pickColors[pci]     = r;
            pickColors[pci + 1] = g;
            pickColors[pci + 2] = b;
            pickColors[pci + 3] = a;


            // B

            i = indices[location + 1];
            vi = i * 3;

            pickPositions[pvi + 3] = positions[vi];
            pickPositions[pvi + 4] = positions[vi + 1];
            pickPositions[pvi + 5] = positions[vi + 2];

            pickColors[pci + 4] = r;
            pickColors[pci + 5] = g;
            pickColors[pci + 6] = b;
            pickColors[pci + 7] = a;


            // C

            i = indices[location + 2];
            vi = i * 3;

            pickPositions[pvi + 6] = positions[vi];
            pickPositions[pvi + 7] = positions[vi + 1];
            pickPositions[pvi + 8] = positions[vi + 2];

            pickColors[pci + 8]  = r;
            pickColors[pci + 9]  = g;
            pickColors[pci + 10] = b;
            pickColors[pci + 11] = a;

            primIndex++;
        }

        return {
            positions: pickPositions,
            colors: pickColors
        };
    };

    /**
     * Builds vertex array needed by color-indexed triangle picking (for morph target positions).
     *
     * @method getPickPositions
     * @static
     * @param {Array of Number} positions One-dimensional flattened array of positions.
     * @param {Array of Number} indices One-dimensional flattened array of indices.
     * @returns {Array of Number} The pick positions.
     */
    window.SceneJS_math_getPickPositions = function (positions, indices) {

        var numIndices = indices.length;

        var pickPositions = new Float32Array(numIndices * 3);
        var pvi, vi;
        var i;

        for (var location = 0; location < numIndices; location++) {

            // Picking position array index
            pvi = location * 3;

            i = indices[location];

            // Drawing position index
            vi = i * 3;

            pickPositions[pvi]     = positions[vi];
            pickPositions[pvi + 1] = positions[vi + 1];
            pickPositions[pvi + 2] = positions[vi + 2];

        }

        return pickPositions;
    };

    /**
     * Builds color arrays needed by color-indexed triangle picking.
     *
     * @method getPickPrimitives
     * @static
     * @param {Array of Number} indices One-dimensional flattened array of indices.
     * @returns {Array of Number} The pick colors
     */
    window.SceneJS_math_getPickColors = function (indices) {

        var numIndices = indices.length;

        var pickColors = new Float32Array(numIndices * 4);

        var primIndex = 0;
        var pci;

        // Triangle indices

        var r;
        var g;
        var b;
        var a;

        for (var location = 0; location < numIndices; location += 3) {

            // Picking color array index;
            pci = location * 4;

            // Primitive-indexed triangle pick color

            a = (primIndex >> 24 & 0xFF) / 255.0;
            b = (primIndex >> 16 & 0xFF) / 255.0;
            g = (primIndex >> 8 & 0xFF) / 255.0;
            r = (primIndex & 0xFF) / 255.0;

            // A

            pickColors[pci]     = r;
            pickColors[pci + 1] = g;
            pickColors[pci + 2] = b;
            pickColors[pci + 3] = a;

            // B

            pickColors[pci + 4] = r;
            pickColors[pci + 5] = g;
            pickColors[pci + 6] = b;
            pickColors[pci + 7] = a;

            // C

            pickColors[pci + 8]  = r;
            pickColors[pci + 9]  = g;
            pickColors[pci + 10] = b;
            pickColors[pci + 11] = a;

            primIndex++;
        }

        return pickColors;
    };


    /**
     * Finds the intersection of a 3D ray with a 3D triangle.
     *
     * @method rayTriangleIntersect
     * @static
     * @param {Array of Number} origin Ray origin.
     * @param {Array of Number} dir Ray direction.
     * @param {Array of Number} a First triangle vertex.
     * @param {Array of Number} b Second triangle vertex.
     * @param {Array of Number} c Third triangle vertex.
     * @param {Array of Number} [isect] Intersection point.
     * @returns {Array of Number} The intersection point, or null if no intersection found.
     */
    window.SceneJS_math_rayTriangleIntersect = function (origin, dir, a, b, c, isect) {

        isect = isect || SceneJS_math_vec3();

        var EPSILON = 0.000001;

        var edge1 = SceneJS_math_subVec3(b, a, tempVec3);
        var edge2 = SceneJS_math_subVec3(c, a, tempVec3b);

        var pvec = SceneJS_math_cross3Vec3(dir, edge2, tempVec3c);
        var det = SceneJS_math_dotVec3(edge1, pvec);
        if (det < EPSILON) {
            return null;
        }

        var tvec = SceneJS_math_subVec3(origin, a, tempVec3d);
        var u = SceneJS_math_dotVec3(tvec, pvec);
        if (u < 0 || u > det) {
            return null;
        }

        var qvec = SceneJS_math_cross3Vec3(tvec, edge1, tempVec3e);
        var v = SceneJS_math_dotVec3(dir, qvec);
        if (v < 0 || u + v > det) {
            return null;
        }

        var t = SceneJS_math_dotVec3(edge2, qvec) / det;
        isect[0] = origin[0] + t * dir[0];
        isect[1] = origin[1] + t * dir[1];
        isect[2] = origin[2] + t * dir[2];

        return isect;
    };

    /**
     * Finds the intersection of a 3D ray with a plane defined by 3 points.
     *
     * @method rayPlaneIntersect
     * @static
     * @param {Array of Number} origin Ray origin.
     * @param {Array of Number} dir Ray direction.
     * @param {Array of Number} a First point on plane.
     * @param {Array of Number} b Second point on plane.
     * @param {Array of Number} c Third point on plane.
     * @param {Array of Number} [isect] Intersection point.
     * @returns {Array of Number} The intersection point.
     */
    window.SceneJS_math_rayPlaneIntersect = function (origin, dir, a, b, c, isect) {

        isect = isect || SceneJS_math_vec3();
        dir = SceneJS_math_normalizeVec3(dir, tempVec3);

        var edge1 = SceneJS_math_subVec3(b, a, tempVec3b);
        var edge2 = SceneJS_math_subVec3(c, a, tempVec3c);

        var n = SceneJS_math_cross3Vec3(edge1, edge2, tempVec3d);
        SceneJS_math_normalizeVec3(n, n);

        var d = -SceneJS_math_dotVec3(a, n);

        var t = -(SceneJS_math_dotVec3(origin, n) + d) / SceneJS_math_dotVec3(dir, n);
        isect[0] = origin[0] + t * dir[0];
        isect[1] = origin[1] + t * dir[1];
        isect[2] = origin[2] + t * dir[2];

        return isect;
    };


    /**
     * Gets barycentric coordinates from cartesian coordinates within a triangle.
     *
     * @method cartesianToBaryCentric
     * @static
     * @param {Array of Number} cartesian Cartesian coordinates.
     * @param {Array of Number} a First triangle vertex.
     * @param {Array of Number} b Second triangle vertex.
     * @param {Array of Number} c Third triangle vertex.
     * @param {Array of Number} [bary] The barycentric coordinates.
     * @returns {Array of Number} The barycentric coordinates, or null if the triangle was invalid.
     * @returns {*}
     */
    window.SceneJS_math_cartesianToBarycentric = function (cartesian, a, b, c, bary) {

        var f1 = SceneJS_math_subVec3(a, cartesian, tempVec3);
        var f2 = SceneJS_math_subVec3(b, cartesian, tempVec3b);
        var f3 = SceneJS_math_subVec3(c, cartesian, tempVec3c);

        var t1 = SceneJS_math_subVec3(a, b, tempVec3d);
        var t2 = SceneJS_math_subVec3(a, c, tempVec3e);

        var a0 = SceneJS_math_lenVec3(SceneJS_math_cross3Vec3(t1, t2, tempVec3f));

        bary[0] = SceneJS_math_lenVec3(SceneJS_math_cross3Vec3(f2, f3, tempVec3f)) / a0;
        bary[1] = SceneJS_math_lenVec3(SceneJS_math_cross3Vec3(f3, f1, tempVec3f)) / a0;
        bary[2] = SceneJS_math_lenVec3(SceneJS_math_cross3Vec3(f1, f2, tempVec3f)) / a0;

        return bary;
    };

    window.SceneJS_math_cartesianToBarycentric2 = function (cartesian, a, b, c, dest) {

        var v0 = SceneJS_math_subVec3(c, a, tempVec3);
        var v1 = SceneJS_math_subVec3(b, a, tempVec3b);
        var v2 = SceneJS_math_subVec3(cartesian, a, tempVec3c);

        var dot00 = SceneJS_math_dotVector3(v0, v0);
        var dot01 = SceneJS_math_dotVector3(v0, v1);
        var dot02 = SceneJS_math_dotVector3(v0, v2);
        var dot11 = SceneJS_math_dotVector3(v1, v1);
        var dot12 = SceneJS_math_dotVector3(v1, v2);

        var denom = ( dot00 * dot11 - dot01 * dot01 );

        // Colinear or singular triangle

        if (denom === 0) {

            // Arbitrary location outside of triangle

            return null;
        }

        var invDenom = 1 / denom;

        var u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
        var v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

        dest[0] = 1 - u - v;
        dest[1] = v;
        dest[2] = u;

        return dest;
    };

    /**
     * Returns true if the given barycentric coordinates are within their triangle.
     *
     * @method barycentricInsideTriangle
     * @static
     * @param {Array of Number} bary Barycentric coordinates.
     * @returns {Boolean} True if the barycentric coordinates are inside their triangle.
     * @returns {*}
     */
    window.SceneJS_math_barycentricInsideTriangle = function (bary) {

        var v = bary[1];
        var u = bary[2];

        return (u >= 0) && (v >= 0) && (u + v < 1);
    };

    /**
     * Gets cartesian coordinates from barycentric coordinates within a triangle.
     *
     * @method barycentricToCartesian
     * @static
     * @param {Array of Number} bary The barycentric coordinate.
     * @param {Array of Number} a First triangle vertex.
     * @param {Array of Number} b Second triangle vertex.
     * @param {Array of Number} c Third triangle vertex.
     * @param {Array of Number} [cartesian] Cartesian coordinates.
     * @returns {Array of Number} The cartesian coordinates, or null if the triangle was invalid.
     * @returns {*}
     */
    window.SceneJS_math_barycentricToCartesian = function (bary, a, b, c, cartesian) {

        cartesian = cartesian || SceneJS_math_vec3();

        var u = bary[0];
        var v = bary[1];
        var w = bary[2];

        cartesian[0] = a[0] * u + b[0] * v + c[0] * w;
        cartesian[1] = a[1] * u + b[1] * v + c[1] * w;
        cartesian[2] = a[2] * u + b[2] * v + c[2] * w;

        return cartesian;
    };


    /**
     * Builds vertex tangent vectors from positions, UVs and indices
     *
     * @method buildTangents
     * @static
     * @param {Array of Number} positions One-dimensional flattened array of positions.
     * @param {Array of Number} indices One-dimensional flattened array of indices.
     * @param {Array of Number} uv One-dimensional flattened array of UV coordinates.
     * @returns {Array of Number} One-dimensional flattened array of tangents.
     */
    window.SceneJS_math_buildTangents = function (positions, indices, uv) {

        var tangents = new Float32Array(positions.length);

        // The vertex arrays needs to be calculated
        // before the calculation of the tangents

        for (var location = 0; location < indices.length; location += 3) {

            // Recontructing each vertex and UV coordinate into the respective vectors

            var index = indices[location];

            var v0 = positions.subarray(index * 3, index * 3 + 3);
            var uv0 = uv.subarray(index * 2, index * 2 + 2);

            index = indices[location + 1];

            var v1 = positions.subarray(index * 3, index * 3 + 3);
            var uv1 = uv.subarray(index * 2, index * 2 + 2);

            index = indices[location + 2];

            var v2 = positions.subarray(index * 3, index * 3 + 3);
            var uv2 = uv.subarray(index * 2, index * 2 + 2);

            var deltaPos1 = SceneJS_math_subVec3(v1, v0, tempVec3);
            var deltaPos2 = SceneJS_math_subVec3(v2, v0, tempVec3b);

            var deltaUV1 = SceneJS_math_subVec2(uv1, uv0, tempVec3c);
            var deltaUV2 = SceneJS_math_subVec2(uv2, uv0, tempVec3d);

            var r = 1 / ((deltaUV1[0] * deltaUV2[1]) - (deltaUV1[1] * deltaUV2[0]));

            var tangent = SceneJS_math_mulVec3Scalar(
                SceneJS_math_subVec3(
                    SceneJS_math_mulVec3Scalar(deltaPos1, deltaUV2[1], tempVec3e),
                    SceneJS_math_mulVec3Scalar(deltaPos2, deltaUV1[1], tempVec3f),
                    tempVec3g
                ),
                r,
                tempVec3f
            );

            // Average the value of the vectors outs
            for (var v = 0; v < 3; v++) {
                var addTo = indices[location + v] * 3;

                tangents[addTo]     += tangent[0];
                tangents[addTo + 1] += tangent[1];
                tangents[addTo + 2] += tangent[2];
            }
        }

        return tangents;
    }

})();;/**
 * Backend that tracks statistics on loading states of nodes during scene traversal.
 *
 * This supports the "loading-status" events that we can listen for on scene nodes.
 *
 * When a node with that listener is pre-visited, it will call getStatus on this module to
 * save a copy of the status. Then when it is post-visited, it will call diffStatus on this
 * module to find the status for its sub-nodes, which it then reports through the "loading-status" event.
 *
 * @private
 */
var SceneJS_sceneStatusModule = new (function () {

    // Public activity summary
    this.sceneStatus = {};

    // IDs of all tasks
    var taskIds = new SceneJS_Map();
    var tasks = {};

    var sceneStates = {};

    var self = this;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_DESTROYED,
        function (params) {
            var sceneId = params.engine.id;
            delete self.sceneStatus[sceneId];
            delete sceneStates[sceneId];
        });

    /** Notifies that a node has begun loading some data
     */
    this.taskStarted = function (node, description) {

        var popups = SceneJS_configsModule.configs.statusPopups !== false;

        var scene = node.getScene();
        var sceneId = scene.getId();
        var nodeId = node.getId();
        var canvas = scene.getCanvas();

        var taskId = taskIds.addItem();

        // Update public info
        var status = this.sceneStatus[sceneId];
        if (!status) {
            status = this.sceneStatus[sceneId] = {
                numTasks: 0
            };
        }
        status.numTasks++;

        // Track node
        var sceneState = sceneStates[sceneId];
        if (!sceneState) {
            sceneState = sceneStates[sceneId] = {
                sceneId: sceneId,
                nodeStates: {},
                scene: scene,
                popupContainer: popups ? createPopupContainer(canvas) : null,
                descCounts: {}
            };
        }
        var descCount = sceneState.descCounts[description];
        if (descCount == undefined) {
            descCount = sceneState.descCounts[description] = 0;
        }
        sceneState.descCounts[description]++;
        var nodeState = sceneState.nodeStates[nodeId];
        if (!nodeState) {
            nodeState = sceneState.nodeStates[nodeId] = {
                nodeId: nodeId,
                numTasks: 0,
                tasks: {}
            };
        }
        description = description + " " + sceneState.descCounts[description] + "...";
        nodeState.numTasks++;
        var task = {
            sceneState: sceneState,
            nodeState: nodeState,
            description: description,
            element: popups ? createPopup(sceneState.popupContainer, description) : null
        };
        nodeState.tasks[taskId] = task;
        tasks[taskId] = task;
        return taskId;
    };

    function createPopupContainer(canvas) {
        var body = document.getElementsByTagName("body")[0];
        var div = document.createElement('div');
        var style = div.style;
        style.position = "absolute";
        style.width = "200px";
        style.right = "10px";
        style.top = "0";
        style.padding = "10px";
        style["z-index"] = "10000";
        body.appendChild(div);
        return div;
    }

    function createPopup(popupContainer, description) {
        var div = document.createElement('div');
        var style = div.style;
        style["font-family"] = "Helvetica";
        style["font-size"] = "14px";
        style.padding = "5px";
        style.margin = "4px";
        style["padding-left"] = "12px";
        style["border"] = "1px solid #000055";
        style.color = "black";
        style.background = "#AAAAAA";
        style.opacity = "0.8";
        style["border-radius"] = "3px";
        style["-moz-border-radius"] = "3px";
        style["box-shadow"] = "3px 3px 3px #444444";
        div.innerHTML = description;
        popupContainer.appendChild(div);
        return div;
    }

    /** Notifies that a load has finished loading some data
     */
    this.taskFinished = function (taskId) {
        if (taskId == -1 || taskId == null) {
            return null;
        }
        var task = tasks[taskId];
        if (!task) {
            return null;
        }
        var sceneState = task.sceneState;
        this.sceneStatus[sceneState.sceneId].numTasks--;
        if (task.element) {
            dismissPopup(task.element);
        }
        var nodeState = task.nodeState;
        if (--nodeState.numTasks < 0) {
            nodeState.numTasks = 0;
        }
        delete nodeState.tasks[taskId];
        if (nodeState.numTasks == 0) {
            delete sceneState.nodeStates[nodeState.nodeId];
        }
        return null;
    };

    function dismissPopup(element) {
        element.style.background = "#AAFFAA";
        var opacity = 0.8;
        var interval = setInterval(function () {
            if (opacity <= 0) {
                element.parentNode.removeChild(element);
                clearInterval(interval);
            } else {
                element.style.opacity = opacity;
                opacity -= 0.1;
            }
        }, 100);
    }

    /** Notifies that a task has failed
     */
    this.taskFailed = function (taskId) {
        if (taskId == -1 || taskId == null) {
            return null;
        }
        var task = tasks[taskId];
        if (!task) {
            return null;
        }
        var popups = !!SceneJS_configsModule.configs.statusPopups;
        var sceneState = task.sceneState;
        this.sceneStatus[sceneState.sceneId].numTasks--;
        if (popups) {
            failPopup(task.element);
        }
        var nodeState = task.nodeState;
        nodeState.numTasks--;
        delete nodeState.tasks[taskId];
        if (nodeState.numTasks == 0) {
            delete task.sceneState.nodeStates[nodeState.nodeId];
        }
        return null;
    };

    function failPopup(element) {
        element.style.background = "#FFAAAA";
    }
})();;SceneJS._webgl = {};
;/** Buffer for vertices and indices
 *
 * @private
 * @param gl  WebGL gl
 * @param type     Eg. ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER
 * @param values   WebGL array wrapper
 * @param numItems Count of items in array wrapper
 * @param itemSize Size of each item
 * @param usage    Eg. STATIC_DRAW
 */

SceneJS._webgl.ArrayBuffer = function (gl, type, values, numItems, itemSize, usage) {

    /**
     * True when this buffer is allocated and ready to go
     * @type {boolean}
     */
    this.allocated = false;

    var itemType = values.constructor == Uint8Array   ? gl.UNSIGNED_BYTE :
                   values.constructor == Uint16Array  ? gl.UNSIGNED_SHORT :
                   values.constructor == Uint32Array  ? gl.UNSIGNED_INT :
                                                        gl.FLOAT;

    this.gl = gl;
    this.type = type;
    this.itemType = itemType;
    this.numItems = numItems;
    this.itemSize = itemSize;
    this.usage = usage;
    this._allocate(values, numItems);
};

/**
 * Allocates this buffer
 *
 * @param values
 * @param numItems
 * @private
 */
SceneJS._webgl.ArrayBuffer.prototype._allocate = function (values, numItems) {
    this.allocated = false;
    this.handle = this.gl.createBuffer();
    if (!this.handle) {
        throw SceneJS_error.fatalError(SceneJS.errors.OUT_OF_VRAM, "Failed to allocate WebGL ArrayBuffer");
    }
    if (this.handle) {
        this.gl.bindBuffer(this.type, this.handle);
        this.gl.bufferData(this.type, values, this.usage);
        this.gl.bindBuffer(this.type, null);
        this.numItems = numItems;
        this.length = values.length;
        this.allocated = true;
    }
};

/**
 * Updates values within this buffer, reallocating if needed
 *
 * @param data
 * @param offset
 */
SceneJS._webgl.ArrayBuffer.prototype.setData = function (data, offset) {
    if (!this.allocated) {
        return;
    }
    if (data.length > this.length) {
        // Needs reallocation
        this.destroy();
        this._allocate(data, data.length);
    } else {
        // No reallocation needed
        if (offset || offset === 0) {
            this.gl.bufferSubData(this.type, offset, data);
        } else {
            this.gl.bufferData(this.type, data);
        }
    }
};

/**
 * Unbinds this buffer on WebGL
 */
SceneJS._webgl.ArrayBuffer.prototype.unbind = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.bindBuffer(this.type, null);
};

/**
 * Destroys this buffer
 */
SceneJS._webgl.ArrayBuffer.prototype.destroy = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.deleteBuffer(this.handle);
    this.handle = null;
    this.allocated = false;
};


SceneJS._webgl.ArrayBuffer.prototype.bind = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.bindBuffer(this.type, this.handle);
};


;
/** An attribute within a shader
 */
SceneJS._webgl.Attribute = function (gl, program, name, type, size, location) {

    this.gl = gl;
    this.location = location;

    this.bindFloatArrayBuffer = function (buffer) {
        if (buffer) {
            buffer.bind();
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, buffer.itemSize, gl.FLOAT, false, 0, 0);   // Vertices are not homogeneous - no w-element
        }
    };
};

SceneJS._webgl.Attribute.prototype.bindInterleavedFloatArrayBuffer = function (components, stride, byteOffset) {
    this.gl.enableVertexAttribArray(this.location);
    this.gl.vertexAttribPointer(this.location, components, this.gl.FLOAT, false, stride, byteOffset);   // Vertices are not homogeneous - no w-element
};
;
/** Maps SceneJS node parameter names to WebGL enum names
 * @private
 */
SceneJS._webgl.enumMap = {
    funcAdd: "FUNC_ADD",
    funcSubtract: "FUNC_SUBTRACT",
    funcReverseSubtract: "FUNC_REVERSE_SUBTRACT",
    zero: "ZERO",
    one: "ONE",
    srcColor: "SRC_COLOR",
    oneMinusSrcColor: "ONE_MINUS_SRC_COLOR",
    dstColor: "DST_COLOR",
    oneMinusDstColor: "ONE_MINUS_DST_COLOR",
    srcAlpha: "SRC_ALPHA",
    oneMinusSrcAlpha: "ONE_MINUS_SRC_ALPHA",
    dstAlpha: "DST_ALPHA",
    oneMinusDstAlpha: "ONE_MINUS_DST_ALPHA",
    contantColor: "CONSTANT_COLOR",
    oneMinusConstantColor: "ONE_MINUS_CONSTANT_COLOR",
    constantAlpha: "CONSTANT_ALPHA",
    oneMinusConstantAlpha: "ONE_MINUS_CONSTANT_ALPHA",
    srcAlphaSaturate: "SRC_ALPHA_SATURATE",
    front: "FRONT",
    back: "BACK",
    frontAndBack: "FRONT_AND_BACK",
    never: "NEVER",
    less: "LESS",
    equal: "EQUAL",
    lequal: "LEQUAL",
    greater: "GREATER",
    notequal: "NOTEQUAL",
    gequal: "GEQUAL",
    always: "ALWAYS",
    cw: "CW",
    ccw: "CCW",
    linear: "LINEAR",
    nearest: "NEAREST",
    linearMipMapNearest: "LINEAR_MIPMAP_NEAREST",
    nearestMipMapNearest: "NEAREST_MIPMAP_NEAREST",
    nearestMipMapLinear: "NEAREST_MIPMAP_LINEAR",
    linearMipMapLinear: "LINEAR_MIPMAP_LINEAR",
    repeat: "REPEAT",
    clampToEdge: "CLAMP_TO_EDGE",
    mirroredRepeat: "MIRRORED_REPEAT",
    alpha: "ALPHA",
    rgb: "RGB",
    rgba: "RGBA",
    luminance: "LUMINANCE",
    luminanceAlpha: "LUMINANCE_ALPHA",
    textureBinding2D: "TEXTURE_BINDING_2D",
    textureBindingCubeMap: "TEXTURE_BINDING_CUBE_MAP",
    compareRToTexture: "COMPARE_R_TO_TEXTURE", // Hardware Shadowing Z-depth,
    unsignedByte: "UNSIGNED_BYTE"
};

;SceneJS._webgl.RenderBuffer = function (cfg) {

    /**
     * True as soon as this buffer is allocated and ready to go
     */
    this.allocated = false;

    /**
     * The canvas, to synch buffer size with when its dimensions change
     */
    this.canvas = cfg.canvas;

    /**
     * WebGL context
     */
    this.gl = cfg.canvas.gl;

    /**
     * Buffer resources, set up in #_touch
     */
    this.buf = null;

    /**
     * True while this buffer is bound
     * @type {boolean}
     */
    this.bound = false;
};

/**
 * Called after WebGL context is restored.
 */
SceneJS._webgl.RenderBuffer.prototype.webglRestored = function (_gl) {
    this.gl = _gl;
    this.buf = null;
    this.allocated = false;
    this.bound = false;
};

/**
 * Binds this buffer
 */
SceneJS._webgl.RenderBuffer.prototype.bind = function () {
    this._touch();
    if (this.bound) {
        return;
    }
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buf.framebuf);
    this.bound = true;
};

SceneJS._webgl.RenderBuffer.prototype._touch = function () {
    var width = this.canvas.canvas.width;
    var height = this.canvas.canvas.height;
    if (this.buf) { // Currently have a buffer
        if (this.buf.width == width && this.buf.height == height) { // Canvas size unchanged, buffer still good
            return;
        } else { // Buffer needs reallocation for new canvas size
            this.gl.deleteTexture(this.buf.texture);
            this.gl.deleteFramebuffer(this.buf.framebuf);
            this.gl.deleteRenderbuffer(this.buf.renderbuf);
        }
    }

    this.buf = {
        framebuf: this.gl.createFramebuffer(),
        renderbuf: this.gl.createRenderbuffer(),
        texture: this.gl.createTexture(),
        width: width,
        height: height
    };

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buf.framebuf);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.buf.texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    try {
        // Do it the way the spec requires
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    } catch (exception) {
        // Workaround for what appears to be a Minefield bug.
        var textureStorage = new WebGLUnsignedByteArray(width * height * 3);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureStorage);
    }

    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.buf.renderbuf);
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.buf.texture, 0);
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.buf.renderbuf);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

    // Verify framebuffer is OK
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buf.framebuf);

    if (!this.gl.isFramebuffer(this.buf.framebuf)) {
        throw SceneJS_error.fatalError(SceneJS.errors.INVALID_FRAMEBUFFER, "Invalid framebuffer");
    }

    var status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);

    switch (status) {

        case this.gl.FRAMEBUFFER_COMPLETE:
            break;

        case this.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");

        case this.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");

        case this.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");

        case this.gl.FRAMEBUFFER_UNSUPPORTED:
            throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");

        default:
            throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: " + status);
    }

    this.bound = false;
};

/**
 * Clears this renderbuffer
 */
SceneJS._webgl.RenderBuffer.prototype.clear = function () {
    if (!this.bound) {
        throw "Render buffer not bound";
    }
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.disable(this.gl.BLEND);
};

/**
 * Reads buffer pixel at given coordinates
 */
SceneJS._webgl.RenderBuffer.prototype.read = function (pickX, pickY) {
    var x = pickX;
    var y = this.canvas.canvas.height - pickY;
    var pix = new Uint8Array(4);
    this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pix);
    return pix;
};

/**
 * Unbinds this renderbuffer
 */
SceneJS._webgl.RenderBuffer.prototype.unbind = function () {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.bound = false;
};

/** Returns the texture
 */
SceneJS._webgl.RenderBuffer.prototype.getTexture = function () {
    var self = this;
    return {
        bind: function (unit) {
            if (self.buf && self.buf.texture) {
                self.gl.activeTexture(self.gl["TEXTURE" + unit]);
                self.gl.bindTexture(self.gl.TEXTURE_2D, self.buf.texture);
                return true;
            }
            return false;
        },
        unbind: function (unit) {
            if (self.buf && self.buf.texture) {
                self.gl.activeTexture(self.gl["TEXTURE" + unit]);
                self.gl.bindTexture(self.gl.TEXTURE_2D, null);
            }
        }
    };
};

/** Destroys this buffer
 */
SceneJS._webgl.RenderBuffer.prototype.destroy = function () {
    if (this.buf) {
        this.gl.deleteTexture(this.buf.texture);
        this.gl.deleteFramebuffer(this.buf.framebuf);
        this.gl.deleteRenderbuffer(this.buf.renderbuf);
        this.buf = null;
        this.bound = false;
    }
};;/**
 * @class Wrapper for a WebGL program
 *
 * @param hash SceneJS-managed ID for program
 * @param gl WebGL gl
 * @param vertexSources Source codes for vertex shaders
 * @param fragmentSources Source codes for fragment shaders
 * @param logging Program and shaders will write to logging's debug channel as they compile and link
 */
SceneJS._webgl.Program = function (gl, vertexSources, fragmentSources) {

    /**
     * True as soon as this program is allocated and ready to go
     * @type {boolean}
     */
    this.allocated = false;

    this.gl = gl;

    this._uniforms = {};
    this._samplers = {};
    this._attributes = {};

    this.uniformValues = [];

    this.materialSettings = {
        specularColor: [0, 0, 0],
        specular: 0,
        shine: 0,
        emit: 0,
        alpha: 0
    };

    // Create shaders from sources

    this._shaders = [];

    var a, i, u, u_name, location, shader;

    for (i = 0; i < vertexSources.length; i++) {
        this._shaders.push(new SceneJS._webgl.Shader(gl, gl.VERTEX_SHADER, vertexSources[i]));
    }

    for (i = 0; i < fragmentSources.length; i++) {
        this._shaders.push(new SceneJS._webgl.Shader(gl, gl.FRAGMENT_SHADER, fragmentSources[i]));
    }

    // Create program, attach shaders, link and validate program

    this.handle = gl.createProgram();

    if (this.handle) {

        for (i = 0; i < this._shaders.length; i++) {
            shader = this._shaders[i];
            if (shader.valid) {
                gl.attachShader(this.handle, shader.handle);
            }
        }

        gl.linkProgram(this.handle);

        // Discover uniforms and samplers

        var numUniforms = gl.getProgramParameter(this.handle, gl.ACTIVE_UNIFORMS);
        var valueIndex = 0;
        for (i = 0; i < numUniforms; ++i) {
            u = gl.getActiveUniform(this.handle, i);
            if (u) {
                u_name = u.name;
                if (u_name[u_name.length - 1] == "\u0000") {
                    u_name = u_name.substr(0, u_name.length - 1);
                }
                location = gl.getUniformLocation(this.handle, u_name);
                if ((u.type == gl.SAMPLER_2D) || (u.type == gl.SAMPLER_CUBE) || (u.type == 35682)) {
                    this._samplers[u_name] = new SceneJS._webgl.Sampler(gl, this.handle, u_name, u.type, u.size, location);
                } else {
                    this._uniforms[u_name] = new SceneJS._webgl.Uniform(gl, this.handle, u_name, u.type, u.size, location, valueIndex);
                    this.uniformValues[valueIndex] = null;
                    ++valueIndex;
                }
            }
        }

        // Discover attributes

        var numAttribs = gl.getProgramParameter(this.handle, gl.ACTIVE_ATTRIBUTES);
        for (i = 0; i < numAttribs; i++) {
            a = gl.getActiveAttrib(this.handle, i);
            if (a) {
                location = gl.getAttribLocation(this.handle, a.name);
                this._attributes[a.name] = new SceneJS._webgl.Attribute(gl, this.handle, a.name, a.type, a.size, location);
            }
        }

        // Program allocated
        this.allocated = true;

    } // if (this.handle)
};


SceneJS._webgl.Program.prototype.bind = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.useProgram(this.handle);
    this.uniformValues.length = 0;
};

SceneJS._webgl.Program.prototype.getUniformLocation = function (name) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        return u.getLocation();
    }
};

SceneJS._webgl.Program.prototype.getUniform = function (name) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        return u;
    }
};

SceneJS._webgl.Program.prototype.getAttribute = function (name) {
    if (!this.allocated) {
        return;
    }
    var attr = this._attributes[name];
    if (attr) {
        return attr;
    }
};

SceneJS._webgl.Program.prototype.bindFloatArrayBuffer = function (name, buffer) {
    if (!this.allocated) {
        return;
    }
    var attr = this._attributes[name];
    if (attr) {
        attr.bindFloatArrayBuffer(buffer);
    }
};

SceneJS._webgl.Program.prototype.bindTexture = function (name, texture, unit) {
    if (!this.allocated) {
        return false;
    }
    var sampler = this._samplers[name];
    if (sampler) {
        return sampler.bindTexture(texture, unit);
    } else {
        return false;
    }
};

SceneJS._webgl.Program.prototype.destroy = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.deleteProgram(this.handle);
    for (var s in this._shaders) {
        this.gl.deleteShader(this._shaders[s].handle);
    }
    this.handle = null;
    this._attributes = null;
    this._uniforms = null;
    this._samplers = null;
    this.allocated = false;
};


SceneJS._webgl.Program.prototype.setUniform = function (name, value) {
    if (!this.allocated) {
        return;
    }
    var u = this._uniforms[name];
    if (u) {
        if (this.uniformValues[u.index] !== value || !u.numberValue) {
            u.setValue(value);
            this.uniformValues[u.index] = value;
        }
    }
};
;SceneJS._webgl.Sampler = function (gl, program, name, type, size, location) {

    this.bindTexture = function (texture, unit) {
        if (texture.bind(unit)) {
            gl.uniform1i(location, unit);
            return true;
        }
        return false;
    };
};
;/**
 * A vertex/fragment shader in a program
 *
 * @private
 * @param gl WebGL gl
 * @param gl.VERTEX_SHADER | gl.FRAGMENT_SHADER
 * @param source Source code for shader
 * @param logging Shader will write logging's debug channel as it compiles
 */
SceneJS._webgl.Shader = function (gl, type, source) {

    /**
     * True as soon as this shader is allocated and ready to go
     * @type {boolean}
     */
    this.allocated = false;

    this.handle = gl.createShader(type);

    if (!this.handle) {
        throw SceneJS_error.fatalError(SceneJS.errors.OUT_OF_VRAM, "Failed to create WebGL shader");
    }

    gl.shaderSource(this.handle, source);
    gl.compileShader(this.handle);

    this.valid = (gl.getShaderParameter(this.handle, gl.COMPILE_STATUS) != 0);

    if (!this.valid) {

        if (!gl.isContextLost()) { // Handled explicitely elsewhere, so wont rehandle here

            SceneJS.log.error("Shader program failed to compile: " + gl.getShaderInfoLog(this.handle));
            SceneJS.log.error("Shader source:");
            var lines = source.split('\n');
            for (var j = 0; j < lines.length; j++) {
                SceneJS.log.error((j + 1) + ": " + lines[j]);
            }

            throw SceneJS_error.fatalError(
                SceneJS.errors.SHADER_COMPILATION_FAILURE, "Shader program failed to compile");
        }
    }

    this.allocated = true;
};
;
SceneJS._webgl.Texture2D = function (gl, cfg) {
    /**
     * True as soon as this texture is allocated and ready to go
     * @type {boolean}
     */
    this.allocated = false;

    this.target = cfg.target || gl.TEXTURE_2D;
    this.minFilter = cfg.minFilter;
    this.magFilter = cfg.magFilter;
    this.wrapS = cfg.wrapS;
    this.wrapT = cfg.wrapT;
    this.update = cfg.update;  // For dynamically-sourcing textures (ie movies etc)
    this.texture = cfg.texture;
    this.format = gl.RGBA;
    this.isDepth = false;
    this.depthMode = 0;
    this.depthCompareMode = 0;
    this.depthCompareFunc = 0;

    try {
        gl.bindTexture(this.target, this.texture);

        if (cfg.minFilter) {
            gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, cfg.minFilter);
        }

        if (cfg.magFilter) {
            gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, cfg.magFilter);
        }

        if (cfg.wrapS) {
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, cfg.wrapS);
        }

        if (cfg.wrapT) {
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, cfg.wrapT);
        }

        if (cfg.minFilter == gl.NEAREST_MIPMAP_NEAREST ||
            cfg.minFilter == gl.LINEAR_MIPMAP_NEAREST ||
            cfg.minFilter == gl.NEAREST_MIPMAP_LINEAR ||
            cfg.minFilter == gl.LINEAR_MIPMAP_LINEAR) {
            gl.generateMipmap(this.target);
        }

        gl.bindTexture(this.target, null);

        this.allocated = true;

    } catch (e) {
        throw SceneJS_error.fatalError(SceneJS.errors.OUT_OF_VRAM, "Failed to create texture: " + e.message || e);
    }

    this.bind = function (unit) {
        if (!this.allocated) {
            return;
        }
        if (this.texture) {
            gl.activeTexture(gl["TEXTURE" + unit]);
            gl.bindTexture(this.target, this.texture);
            if (this.update) {
                this.update(gl);
            }
            return true;
        }
        return false;
    };

    this.unbind = function (unit) {
        if (!this.allocated) {
            return;
        }
        if (this.texture) {
            gl.activeTexture(gl["TEXTURE" + unit]);
            gl.bindTexture(this.target, null);
        }
    };

    this.destroy = function () {
        if (!this.allocated) {
            return;
        }
        if (this.texture) {
            gl.deleteTexture(this.texture);
            this.texture = null;
        }
    };
};

SceneJS._webgl.clampImageSize = function (image, numPixels) {
    var n = image.width * image.height;
    if (n > numPixels) {
        var ratio = numPixels / n;

        var width = image.width * ratio;
        var height = image.height * ratio;

        var canvas = document.createElement("canvas");

        canvas.width = SceneJS._webgl.nextHighestPowerOfTwo(width);
        canvas.height = SceneJS._webgl.nextHighestPowerOfTwo(height);

        var ctx = canvas.getContext("2d");

        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

        image = canvas;
    }
    return image;
};

SceneJS._webgl.ensureImageSizePowerOfTwo = function (image) {
    if (!SceneJS._webgl.isPowerOfTwo(image.width) || !SceneJS._webgl.isPowerOfTwo(image.height)) {
        var canvas = document.createElement("canvas");
        canvas.width = SceneJS._webgl.nextHighestPowerOfTwo(image.width);
        canvas.height = SceneJS._webgl.nextHighestPowerOfTwo(image.height);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image,
            0, 0, image.width, image.height,
            0, 0, canvas.width, canvas.height);
        image = canvas;
    }
    return image;
};

SceneJS._webgl.isPowerOfTwo = function (x) {
    return (x & (x - 1)) == 0;
};

SceneJS._webgl.nextHighestPowerOfTwo = function (x) {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
};

;SceneJS._webgl.Uniform = function (gl, program, name, type, size, location, index, logging) {

    var func = null;

    var value = null;

    if (type === gl.BOOL) {

        func = function (v) {
            if (value === v) {
                return;
            }
            value = v;
            gl.uniform1i(location, v);
        };

    } else if (type === gl.BOOL_VEC2) {
        value = new Array(2);

        func = function (v) {
            if (value !== null && value[0] === v[0] && value[1] === v[1]) {
                return;
            }
            value[0] = v[0];
            value[1] = v[1];
            gl.uniform2iv(location, v);
        };

    } else if (type === gl.BOOL_VEC3) {
        value = new Array(3);

        func = function (v) {
            if (value !== null && value[0] === v[0] && value[1] === v[1] && value[2] === v[2]) {
                return;
            }
            value[0] = v[0];
            value[1] = v[1];
            value[2] = v[2];
            gl.uniform3iv(location, v);
        };

    } else if (type === gl.BOOL_VEC4) {
        value = new Array(4);

        func = function (v) {
            if (value !== null && value[0] === v[0] && value[1] === v[1] && value[2] === v[2] && value[3] === v[3]) {
                return;
            }
            value[0] = v[0];
            value[1] = v[1];
            value[2] = v[2];
            value[3] = v[3];
            gl.uniform4iv(location, v);
        };

    } else if (type === gl.INT) {

        func = function (v) {
            if (value === v) {
                return;
            }
            value = v;
            gl.uniform1iv(location, v);
        };

    } else if (type === gl.INT_VEC2) {
        value = new Uint32Array(2);

        func = function (v) {
            if (value !== null && value[0] === v[0] && value[1] === v[1]) {
                return;
            }
            value.set(v);
            gl.uniform2iv(location, v);
        };

    } else if (type === gl.INT_VEC3) {
        value = new Uint32Array(3);

        func = function (v) {
            if (value !== null && value[0] === v[0] && value[1] === v[1] && value[2] === v[2]) {
                return;
            }
            value.set(v);
            gl.uniform3iv(location, v);
        };

    } else if (type === gl.INT_VEC4) {
        value = new Uint32Array(4);

        func = function (v) {
            if (value !== null && value[0] === v[0] && value[1] === v[1] && value[2] === v[2] && value[3] === v[3]) {
                return;
            }
            value.set(v);
            gl.uniform4iv(location, v);
        };

    } else if (type === gl.FLOAT) {

        func = function (v) {
            if (value === v) {
                return;
            }
            value = v;
            gl.uniform1f(location, v);
        };

    } else if (type === gl.FLOAT_VEC2) {
        value = new Float32Array(2);

        func = function (v) {
            if (value !== null && value[0] === v[0] && value[1] === v[1]) {
                return;
            }
            value.set(v);
            gl.uniform2fv(location, v);
        };

    } else if (type === gl.FLOAT_VEC3) {
        value = new Float32Array(3);

        func = function (v) {
            if (value !== null && value[0] === v[0] && value[1] === v[1] && value[2] === v[2]) {
                return;
            }
            value.set(v);
            gl.uniform3fv(location, v);
        };

    } else if (type === gl.FLOAT_VEC4) {
        value = new Float32Array(4);

        func = function (v) {
            if (value !== null && value[0] === v[0] && value[1] === v[1] && value[2] === v[2] && value[3] === v[3]) {
                return;
            }
            value.set(v);
            gl.uniform4fv(location, v);
        };

    } else if (type === gl.FLOAT_MAT2) {

        func = function (v) {
            gl.uniformMatrix2fv(location, gl.FALSE, v);
        };

    } else if (type === gl.FLOAT_MAT3) {

        func = function (v) {
            gl.uniformMatrix3fv(location, gl.FALSE, v);
        };

    } else if (type === gl.FLOAT_MAT4) {

        func = function (v) {

            // Caching this matrix is actually slower than not caching

            gl.uniformMatrix4fv(location, gl.FALSE, v);
        };

    } else {
        throw "Unsupported shader uniform type: " + type;
    }

    this.setValue = func;

    this.getLocation = function () {
        return location;
    };

    // This is just an integer key for caching the uniform's value, more efficient than caching by name.
    this.index = index;
};










;/**
 * Manages scene node event listeners
 * @private
 */
var SceneJS_nodeEventsModule = new (function () {

    var idStack = [];
    var listenerStack = [];
    var stackLen = 0;
    var dirty;

    var defaultCore = {
        type:"listeners",
        stateId:SceneJS._baseStateId++,
        empty:true,
        listeners:[]
    };

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function () {
            stackLen = 0;
            dirty = true;
        });

    SceneJS_events.addListener(
        SceneJS_events.OBJECT_COMPILING,
        function (params) {
            if (dirty) {
                if (stackLen > 0) {
                    var core = {
                        type:"listeners",
                        stateId:idStack[stackLen - 1],
                        listeners:listenerStack.slice(0, stackLen)
                    };
                    params.display.renderListeners = core;
                } else {
                    params.display.renderListeners = defaultCore;
                }
                dirty = false;
            }
        });


    this.preVisitNode = function (node) {

        var renderedSubs = node._topicSubs["rendered"]; // DEPRECATED in V3.2
        var worldPosSubs = node._topicSubs["worldPos"];
        var viewPosSubs = node._topicSubs["viewPos"];
        var cameraPosSubs = node._topicSubs["cameraPos"];
        var projPosSubs = node._topicSubs["projPos"];
        var canvasPosSubs = node._topicSubs["canvasPos"];

        if (renderedSubs || worldPosSubs || viewPosSubs || cameraPosSubs || projPosSubs || canvasPosSubs) {
            idStack[stackLen] = node.id;

            listenerStack[stackLen] = function (event) {

                // Don't retain - callback must get positions for
                // required coordinate via methods on the event object.
                // That's dirty, therefore deprecated.
                if (renderedSubs) {
                    node.publish("rendered", event, true); // DEPRECATED in V3.2
                }

                // Publish retained positions for coordinate systems where subscribed
                if (worldPosSubs) {
                    node.publish("worldPos", event.getWorldPos());
                }
                if (viewPosSubs) {
                    node.publish("viewPos", event.getViewPos());
                }
                if (cameraPosSubs) {
                    node.publish("cameraPos", event.getCameraPos());
                }
                if (projPosSubs) {
                    node.publish("projPos", event.getProjPos());
                }
                if (canvasPosSubs) {
                    node.publish("canvasPos", event.getCanvasPos());
                }
            };

            stackLen++;
            dirty = true;
        }
    };

    this.postVisitNode = function (node) {
        if (node.id == idStack[stackLen - 1]) {
            stackLen--;
            dirty = true;
        }
    };

})();

;/**
 * @class Holds state for one or more {@link SceneJS.Node}s.
 *
 * <p>Each {@link SceneJS.Node} has a state core to hold its state, and the core may be shared by other
 * {@link SceneJS.Nodes}s of the same type.</p>
 *
 * <p>The state held by core is rendered by a {@link SceneJS_Chunk}  
 *
 * @private
 */
var SceneJS_Core = function(type) {

    /**
     * The state core type, which will be the same value as the type property on the {@link SceneJS.Node}s that use the core
     * @type String
     * @see SceneJS.Node#type
     */
    this.type = type;

    /**
     * The state core ID, unique within the scene. This ID may be either a string assigned by the application layer via
     * scene node configs, or a number that is automatically generated by the {@link SceneJS_CoreFactory} managing
     * this core instance.
     * @type String|Number
     */
    this.coreId = null;

    /**
     * Uniquely identifies this state core within a {@link SceneJS_Display}.
     *
     * This ID is used by a {@link SceneJS_Display} to reduce redundant state changes when rendering a sequence of cores, 
     * where as a {@link SceneJS_Display} renders a frame it avoids applying consecutive cores that have the
     * same value for this ID.
     *
     * @type Number
     */
    this.stateId = null;

    /**
     * Count of {@link SceneJS.Node} instances this core holds state for
     */
    this.useCount = 0;
};;/**
 * @class Manages creation, recycle and destruction of {@link SceneJS_Core} instances
 * @private
 */
var SceneJS_CoreFactory = function () {

    this._stateMap = new SceneJS_Map(null, SceneJS._baseStateId);  // For creating unique state IDs for cores

    this._cores = {}; // Map of cores for each type
};

/**
 * State core classes provided by this factory
 * @type {SceneJS.Core}
 */
SceneJS_CoreFactory.coreTypes = {};    // Supported core classes, installed by #createCoreType

/**
 * Creates a core class for instantiation by this factory
 * @param {String} type Name of type, eg. "camera"
 * @param {Node} [superType] Class of super type - SceneJS.Node by default
 * @returns The new node class
 */
SceneJS_CoreFactory.createCoreType = function (type, superType) {
    //
    //    var supa = SceneJS_CoreFactory.coreTypes[superType];
    //
    //    if (!supa) {
    //        supa = SceneJS.Core; // Super class is Core by default
    //    }
    //
    //    var nodeType = function() { // Create the class
    //        supa.apply(this, arguments);
    //        this.type = type;
    //    };
    //
    //    nodeType.prototype = new supa();            // Inherit from base class
    //    nodeType.prototype.constructor = nodeType;
    //
    //    SceneJS_CoreFactory.nodeTypes[type] = nodeType;
    //
    //    return nodeType;
};

SceneJS_CoreFactory.addCoreBuilder = function (type, factory) {

};

/* HACK - allows different types of node to have same type of core, eg. "rotate" and "translate" nodes can both have an "xform" core    
 */
SceneJS_CoreFactory.coreAliases = {
    "rotate":"xform",
    "translate":"xform",
    "scale":"xform",
    "matrix":"xform",
    "xform":"xform"
};

/**
 * Gets a core of the given type from this factory. Reuses any existing existing core of the same type and ID.
 *
 * The caller (a scene node) will then augment the core with type-specific attributes and methods.
 *
 * @param {String} type Type name of core, e.g. "material", "texture"
 * @param {String} coreId ID for the core, unique among all cores of the given type within this factory
 * @returns {Core} The core
 */
SceneJS_CoreFactory.prototype.getCore = function (type, coreId) {

    /* HACK - allows different types of node to have same type of core, eg. "rotate" and "translate" nodes can both have an "xform" core    
     */
    var alias = SceneJS_CoreFactory.coreAliases[type];
    if (alias) {
        type = alias;
    }

    var cores = this._cores[type];

    if (!cores) {
        cores = this._cores[type] = {};
    }

    var core;

    if (coreId) { // Attempt to reuse a core

        core = cores[coreId];

        if (core) {
            core.useCount++;
            return core;
        }
    }

    core = new SceneJS_Core(type);
    core.useCount = 1;  // One user so far

    core.stateId = this._stateMap.addItem(core);
    core.coreId = (coreId != undefined && coreId != null) ? coreId : core.stateId; // Use state ID as core ID by default

    cores[core.coreId] = core;

    return core;
};


/**
 * Tests if a core of the given type and ID currently exists within this factory.
 *
 * @param {String} type Type name of core, e.g. "material", "texture"
 * @param {String} coreId ID for the core, unique among all cores of the given type within this factory
 * @returns {Boolean} True if the core exists
 */
SceneJS_CoreFactory.prototype.hasCore = function (type, coreId) {
    // HACK - allows different types of node to have same type of core, eg. "rotate" and "translate" nodes can both have an "xform" core
    var alias = SceneJS_CoreFactory.coreAliases[type];
    if (alias) {
        type = alias;
    }
    var cores = this._cores[type];
    return cores && cores[coreId];
};

/**
 * Releases a state core back to this factory, destroying it if the core's use count is then zero.
 * @param {Core} core Core to release
 */
SceneJS_CoreFactory.prototype.putCore = function (core) {

    if (core.useCount == 0) {
        return; // In case of excess puts
    }

    if (--core.useCount <= 0) {                    // Release shared core if use count now zero

        var cores = this._cores[core.type];

        delete cores[core.coreId];

        this._stateMap.removeItem(core.stateId);  // Release state ID for reuse
    }
};

/**
 * Reallocates WebGL resources for cores within this factory
 */
SceneJS_CoreFactory.prototype.webglRestored = function () {

    var cores;
    var core;

    for (var type in this._cores) {
        if (this._cores.hasOwnProperty(type)) {

            cores = this._cores[type];

            if (cores) {

                for (var coreId in cores) {
                    if (cores.hasOwnProperty(coreId)) {

                        core = cores[coreId];

                        if (core && core.webglRestored) { // Method augmented on core by user
                            core.webglRestored();
                        }
                    }
                }
            }
        }
    }
};
;/**
 * @class The basic scene graph node type
 */
SceneJS.Node = function () {
};

/**
 * @class Basic scene graph node
 */
SceneJS.Node.prototype.constructor = SceneJS.Node;

/**
 * Called by SceneJS_Engine after it has instantiated the node
 *
 * @param {SceneJS_Engine} engine The engine which will manage this node
 * @param {SceneJS_Core} core The core which will hold state for this node, may be shared with other nodes of the same type
 * @param cfg Configuration for this node
 * @param {String} cfg.id ID for the node, unique among all nodes in the scene
 * @param {String} cfg.type type Type of this node (eg. "material", "texture" etc)
 * @param {Object} cfg.data Optional arbitrary JSON object to attach to node
 * @param {String} nodeId Optional ID for node
 */
SceneJS.Node.prototype._construct = function (engine, core, cfg, nodeId) {

    /**
     * Engine that manages this node
     * @type SceneJS_Engine
     */
    this._engine = engine;

    /**
     * The core which holds state for this node, may be shared with other nodes of the same type
     * @type SceneJS_Core
     */
    this._core = core;

    /**
     * The core ID
     * @type {String|Number}
     */
    this.coreId = core.coreId;

    /**
     * ID of this node, unique within its scene. The ID is a string if it was defined by the application
     * via the node's JSON configuration, otherwise it is a number if it was left to SceneJS to automatically create.
     * @type String|Number
     */
    this.id = cfg.id || cfg.nodeId || nodeId;

    /**
     * Type of this node (eg. "material", "texture" etc)
     * @type String
     */
    this.type = cfg.type || "node";

    /**
     * Optional arbitrary JSON object attached to this node
     * @type JSON
     */
    this.data = cfg.data;

    /**
     * Parent node
     * @type SceneJS.Node
     */
    this.parent = null;

    /**
     * Child nodes
     * @type SceneJS.Node[]
     */
    this.nodes = [];

    // Pub/sub support
    this._handleMap = new SceneJS_Map(); // Subscription handle pool
    this._topicSubs = {}; // A [handle -> callback] map for each topic name
    this._handleTopics = {}; // Maps handles to topic names
    this._topicPubs = {}; // Maps topics to publications

    /**
     *
     */
    this._listeners = {};

    /**
     *
     */
    this._numListeners = 0; // Useful for quick check whether node observes any events

    /**
     *
     */
    this.dirty = false;

    /**
     *
     */
    this.branchDirty = false;

    if (this._init) {
        this._init(cfg);
    }
};

/**
 * Notifies that an asynchronous task has started on this node
 * @param {String} [description] Description - will be "Task" by default
 * @return {String} Unique ID for the task, which may be given to {@link #taskFinished} or {@link #taskFailed}
 */
SceneJS.Node.prototype.taskStarted = function (description) {
    return SceneJS_sceneStatusModule.taskStarted(this, description || "Task");
};

/**
 * Notifies that a task, whose initiation was previously notified with {@link #taskStarted},
 * has now completed successfully.
 * @param {String} taskId Unique ID for the task, which was got with {@link #taskStarted}
 * @return null
 */
SceneJS.Node.prototype.taskFinished = function (taskId) {
    return SceneJS_sceneStatusModule.taskFinished(taskId);
};

/**
 * Notifies that a task, whose initiation was previously notified with {@link #taskStarted},
 * has failed.
 * @param {String} taskId Unique ID for the task, which was got with {@link #taskStarted}
 * @return null
 */
SceneJS.Node.prototype.taskFailed = function (taskId) {
    return SceneJS_sceneStatusModule.taskFailed(taskId);
};

/**
 * Logs a message in the context of this node
 * @param {String} [channel] Logging channel - "error", "warn" or "info" (default)
 * @param {String} msg Message to log
 */
SceneJS.Node.prototype.log = function () {
    var channel;
    var msg;
    if (arguments.length == 1) {
        channel = "info";
        msg = arguments[0];
    } else if (arguments.length == 2) {
        channel = arguments[0];
        msg = arguments[1];
    }
    switch (channel) {
        case "warn":
            msg = "WARN;  [SceneJS.Node type=" + this.type + ", id=" + this.id + "] : " + msg;
            break;
        case "error":
            msg = "ERROR; [SceneJS.Node type=" + this.type + ", id=" + this.id + "] : " + msg;
            break;
        default:
            msg = "INFO;  [SceneJS.Node type=" + this.type + ", id=" + this.id + "] : " + msg;
            break;
    }

    if (console[channel]) {
        console[channel](msg);
    } else {
        console.log(msg);
    }
};

/**
 * Publishes to a topic on this node.
 *
 * Immediately notifies existing subscriptions to that topic, and unless the "forget' parameter is
 * true, retains the publication to give to any subsequent notifications on that topic as they are made.
 *
 * @param {String} topic Publication topic
 * @param {Object} pub The publication
 * @param {Boolean} [forget] When true, the publication will be sent to subscribers then forgotten, so that any
 * subsequent subscribers will not receive it
 */
SceneJS.Node.prototype.publish = function (topic, pub, forget) {
    if (!forget) {
        this._topicPubs[topic] = pub; // Save notification
    }
    if (this._topicSubs[topic]) { // Notify subscriptions
        var subsForTopic = this._topicSubs[topic];
        for (var handle in subsForTopic) {
            if (subsForTopic.hasOwnProperty(handle)) {
                subsForTopic[handle].call(this, pub);
            }
        }
    }
};

/**
 * Removes a topic publication
 *
 * Immediately notifies existing subscriptions to that topic, sending them each a null publication.
 *
 * @param topic Publication topic
 * @private
 */
SceneJS.Node.prototype.unpublish = function (topic) {
    var subsForTopic = this._topicSubs[topic];
    if (subsForTopic) { // Notify subscriptions
        for (var handle in subsForTopic) {
            if (subsForTopic.hasOwnProperty(handle)) {
                subsForTopic[handle].call(this, null);
            }
        }
    }
    delete this._topicPubs[topic];
};


/**
 * Listen for data changes at a particular location on this node
 *
 * <p>Your callback will be triggered for
 * the initial data and again whenever the data changes. Use {@link #off} to stop receiving updates.</p>
 *
 * <p>The callback is be called with this node as scope.</p>
 *
 * @param {String} location Publication location
 * @param {Function(data)} callback Called when fresh data is available at the location
 * @return {String} Handle to the subscription, which may be used to unsubscribe with {@link #off}.
 */
SceneJS.Node.prototype.on = function (topic, callback) {
    var subsForTopic = this._topicSubs[topic];
    if (!subsForTopic) {
        subsForTopic = {};
        this._topicSubs[topic] = subsForTopic;
    }
    var handle = this._handleMap.addItem(); // Create unique handle
    subsForTopic[handle] = callback;
    this._handleTopics[handle] = topic;
    var pub = this._topicPubs[topic];
    if (pub) { // A publication exists, notify callback immediately
        callback.call(this, pub);
    }
    //else {
    if (topic == "rendered") {
        this._engine.branchDirty(this);
    }
//    if (topic == "tick") {
//        this._engine.scene.on("tick",callback);
//    }
    // }
    return handle;
};

/**
 * Unsubscribes from a publication on this node that was previously made with {@link #on}.
 * @param handle Publication handle
 */
SceneJS.Node.prototype.off = function (handle) {
    var topic = this._handleTopics[handle];
    if (topic) {
        delete this._handleTopics[handle];
        var topicSubs = this._topicSubs[topic];
        if (topicSubs) {
            delete topicSubs[handle];
        }
        this._handleMap.removeItem(handle); // Release handle
        if (topic == "rendered") {
            this._engine.branchDirty(this);
        }
    }
//    else {
//        this._engine.scene.off(handle);
//    }
};

/**
 * Listens for exactly one data update at the specified location on this node, and then stops listening.
 * <p>This is equivalent to calling {@link #on}, and then calling {@link #off} inside the callback function.</p>
 * @param {String} location Data location to listen to
 * @param {Function(data)} callback Called when fresh data is available at the location
 */
SceneJS.Node.prototype.once = function (topic, callback) {
    var self = this;
    var sub = this.on(topic,
        function (pub) {
            self.off(sub);
            callback(pub);
        });
};

/**
 * Returns this node's {@link SceneJS.Scene}
 */
SceneJS.Node.prototype.getScene = function () {
    return this._engine.scene;
};

/**
 * Returns the ID of this node's core
 */
SceneJS.Node.prototype.getCoreId = function () {
    return this._core.coreId;
};

/**
 * Get the node's ID
 *
 */
SceneJS.Node.prototype.getID = function () {
    return this.id;
};

/**
 * Alias for getID
 *  @function
 */
SceneJS.Node.prototype.getId = function () {
    return this.id;
};

/**
 * Alias for getID
 *  @function
 */
SceneJS.Node.prototype.getNodeId = function () {
    return this.id;
};


/**
 * Returns the node's type. For the Node base class, it is "node", overridden in sub-classes.
 */
SceneJS.Node.prototype.getType = function () {
    return this.type;
};

/**
 * Returns the data object attached to this node.
 */
SceneJS.Node.prototype.getData = function () {
    return this.data;
};

/**
 * Sets a data object on this node.
 */
SceneJS.Node.prototype.setData = function (data) {
    this.data = data;
    return this;
};

/**
 * Returns the number of child nodes
 */
SceneJS.Node.prototype.getNumNodes = function () {
    return this.nodes.length;
};

/** Returns child nodes
 * @returns {Array} Child nodes
 */
SceneJS.Node.prototype.getNodes = function () {
    return this.nodes.slice(0);
};

/** Returns child node at given index. Returns null if no node at that index.
 * @param {Number} index The child index
 * @returns {Node} Child node, or null if not found
 */
SceneJS.Node.prototype.getNodeAt = function (index) {
    if (index < 0 || index >= this.nodes.length) {
        return null;
    }
    return this.nodes[index];
};

/** Returns first child node. Returns null if no child nodes.
 * @returns {Node} First child node, or null if not found
 */
SceneJS.Node.prototype.getFirstNode = function () {
    if (this.nodes.length == 0) {
        return null;
    }
    return this.nodes[0];
};

/** Returns last child node. Returns null if no child nodes.
 * @returns {Node} Last child node, or null if not found
 */
SceneJS.Node.prototype.getLastNode = function () {
    if (this.nodes.length == 0) {
        return null;
    }
    return this.nodes[this.nodes.length - 1];
};

/** Returns child node with the given ID.
 * Returns null if no such child node found.
 */
SceneJS.Node.prototype.getNode = function (id) {
    for (var i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].id == id) {
            return this.nodes[i];
        }
    }
    return null;
};

/** Disconnects the child node at the given index from its parent node
 * @param {int} index Child node index
 * @returns {Node} The disconnected child node if located, else null
 */
SceneJS.Node.prototype.disconnectNodeAt = function (index) {
    var r = this.nodes.splice(index, 1);
    if (r.length > 0) {
        r[0].parent = null;
        this._engine.branchDirty(this);
        return r[0];
    } else {
        return null;
    }
};

/** Disconnects the child node from its parent, given as a node object
 * @param {String | Node} id The target child node, or its ID
 * @returns {Node} The removed child node if located
 */
SceneJS.Node.prototype.disconnect = function () {
    if (this.parent) {
        for (var i = 0; i < this.parent.nodes.length; i++) {
            if (this.parent.nodes[i] === this) {
                var node = this.parent.disconnectNodeAt(i);
                this.parent = null;
                return node;
            }
        }
        this.parent = null;
    }
    return null;
};

/** Removes the child node at the given index
 * @param {int} index Child node index
 */
SceneJS.Node.prototype.removeNodeAt = function (index) {
    var child = this.disconnectNodeAt(index);
    if (child) {
        child.destroy();
    }
};

/** Removes the child node, given as either a node object or an ID string.
 * @param {String | Node} id The target child node, or its ID
 * @returns {Node} The removed child node if located
 */
SceneJS.Node.prototype.removeNode = function (node) {

    if (!node) {
        throw SceneJS_error.fatalError(
            SceneJS.errors.ILLEGAL_NODE_CONFIG,
            "Node#removeNode - node argument undefined");
    }

    if (!node._compile) {
        if (typeof node == "string") {
            var gotNode = this._engine.findNode(node);
            if (!gotNode) {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.NODE_NOT_FOUND,
                    "Node#removeNode - node not found anywhere: '" + node + "'");
            }
            node = gotNode;
        }
    }

    if (node._compile) { //  instance of node
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i] === node) {
                var removedNode = this.removeNodeAt(i);
                return removedNode;
            }
        }
    }

    throw SceneJS_error.fatalError(
        SceneJS.errors.NODE_NOT_FOUND,
        "Node#removeNode - child node not found: " + (node._compile ? ": " + node.id : node));
};

/** Disconnects all child nodes from their parent node and returns them in an array.
 */
SceneJS.Node.prototype.disconnectNodes = function () {
    var len = this.nodes.length;
    for (var i = 0; i < len; i++) {  // Unlink nodes from this
        this.nodes[i].parent = null;
    }
    var nodes = this.nodes;
    this.nodes = [];
    this._engine.branchDirty(this);
    return nodes;
};

/** Removes all child nodes and returns them in an array.
 */
SceneJS.Node.prototype.removeNodes = function () {
    var nodes = this.disconnectNodes();
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].destroy();
    }
};

/** Destroys this node and moves children up to parent, inserting them where this node resided.
 */
SceneJS.Node.prototype.splice = function () {

    var i, len;

    if (this.parent == null) {
        return null;
    }
    var parent = this.parent;
    var nodes = this.disconnectNodes();
    for (i = 0, len = nodes.length; i < len; i++) {  // Link this node's nodes to new parent
        nodes[i].parent = this.parent;
    }
    for (i = 0, len = parent.nodes.length; i < len; i++) { // Replace node on parent's nodes with this node's nodes
        if (parent.nodes[i] === this) {

            parent.nodes.splice.apply(parent.nodes, [i, 1].concat(nodes));

            this.nodes = [];
            this.parent = null;

            this.destroy();

            this._engine.branchDirty(parent);

            return parent;
        }
    }
};

/** Appends multiple child nodes
 */
SceneJS.Node.prototype.addNodes = function (nodes, ok) {

    if (!nodes) {
        throw SceneJS_error.fatalError(
            SceneJS.errors.ILLEGAL_NODE_CONFIG,
            "Node#addNodes - nodes argument is undefined");
    }

    var node;
    var result = [];
    var numNodes = nodes.length;

    for (var i = nodes.length - 1; i >= 0; i--) {
        var nodeAttr = nodes[i];
        if (nodeAttr.type == "node" || this._engine.hasNodeType(nodeAttr.type)) {

            // Add loaded node type synchronously

            node = this.addNode(nodeAttr);
            result[i] = node;
            if (--numNodes == 0) {
                if (ok) {
                    ok(nodes);
                }
                return nodes;
            }
        } else {

            // Load node type and instantiate it asynchronously

            var self = this;
            (function () {
                var nodei = i;
                self.addNode(nodeAttr,
                    function (node) {
                        result[nodei] = node;
                        if (--numNodes == 0) {
                            if (ok) {
                                ok(nodes);
                            }
                        }
                    });
            })();
        }
    }
    return null;
};

/** Appends a child node
 */
SceneJS.Node.prototype.addNode = function (node, ok) {

    node = node || {};

    // Graft node object
    if (node._compile) {
        if (node.parent != null) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#addNode - node argument is still attached to another parent");
        }
        this.nodes.push(node);
        node.parent = this;
        this._engine.branchDirty(node);
        if (ok) {
            ok(node);
        }
        return node;
    }

    // Graft node object by ID reference
    if (typeof node == "string") {
        var gotNode = this._engine.findNode(node);
        if (!gotNode) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#addNode - node not found: '" + node + "'");
        }
        node = gotNode;
        if (node.parent != null) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Node#addNode - node argument is still attached to another parent");
        }
        this.nodes.push(node);
        node.parent = this;
        this._engine.branchDirty(node);
        if (ok) {
            ok(node);
        }
        return node;
    }

    // Create node

    node.type = node.type || "node";

    if (node.type == "node" || this._engine.hasNodeType(node.type)) {

        // Root node's type is already loaded, so we are able
        // to create the root synchronously. When the caller
        // is creating a core node type, then by this contract
        // it can rely on the return value

        node = this._engine.createNode(node);
        this.nodes.push(node);
        node.parent = this;
        this._engine.branchDirty(node);
        if (ok) {
            ok(node);
        }
        return node;

    } else {

        // Otherwise the root node's type needs to be loaded,
        // so we need to create it asynchronously. By this contract,
        // the Caller would not rely on synchronous creation of
        // non-core types.
        var self = this;
        this._engine.createNode(node,
            function (node) {
                self.nodes.push(node);
                node.parent = self;
                self._engine.branchDirty(node);
                if (ok) {
                    ok(node);
                }
            });
        return null;
    }
};

/** Inserts a subgraph into child nodes
 * @param {Node} node Child node
 * @param {int} i Index for new child node
 * @return {Node} The child node
 */
SceneJS.Node.prototype.insertNode = function (node, i) {

    if (!node) {
        throw SceneJS_error.fatalError(
            SceneJS.errors.ILLEGAL_NODE_CONFIG,
            "SceneJS.Node#insertNode - node argument is undefined");
    }

    if (!node._compile) { // JSON node definition
        node = this._engine.createNode(node); // Create node
    }

    if (!node._compile) {
        throw SceneJS_error.fatalError(
            SceneJS.errors.ILLEGAL_NODE_CONFIG,
            "SceneJS.Node#insertNode - node argument is not a SceneJS.Node");
    }

    if (node.parent != null) {
        throw SceneJS_error.fatalError(
            SceneJS.errors.ILLEGAL_NODE_CONFIG,
            "SceneJS.Node#insertNode - node argument is still attached to another parent");
    }

    if (i === undefined || i === null) {
        node.addNodes(this.disconnectNodes());
        this.addNode(node);

    } else if (i < 0) {

        throw SceneJS_error.fatalError(
            SceneJS.errors.ILLEGAL_NODE_CONFIG,
            "SceneJS.Node#insertNode - node index out of range: -1");

    } else if (i >= this.nodes.length) {
        this.nodes.push(node);
    } else {
        this.nodes.splice(i, 0, node);
    }

    node.parent = this;
    return node;
};

/** Calls the given function on each node in the subgraph rooted by this node, including this node.
 * The callback takes each node as it's sole argument and traversal stops as soon as the function returns
 * true and returns the node.
 * @param {function(Node)} func The function
 */
SceneJS.Node.prototype.mapNodes = function (func) {
    if (func(this)) {
        return this;
    }
    var result;
    for (var i = 0; i < this.nodes.length; i++) {
        result = this.nodes[i].mapNodes(func);
        if (result) {
            return result;
        }
    }
    return null;
};

/**
 * Registers a listener for a given event on this node. If the event type
 * is not supported by this node type, then the listener will never be called.
 * <p><b>Example:</b>
 * <pre><code>
 * var node = new Node();
 *
 * node.addListener(
 *
 *              // eventName
 *              "some-event",
 *
 *              // handler
 *              function(node,      // Node we are listening to
 *                       params) {  // Whatever params accompany the event type
 *
 *                     // ...
 *              }
 * );
 *
 *
 * </code></pre>
 *
 * @param {String} eventName One of the event types supported by this node
 * @param {Function} fn - Handler function that be called as specified
 * @param options - Optional options for the handler as specified
 * @return {Node} this
 */
SceneJS.Node.prototype.addListener = function (eventName, fn, options) {
    var list = this._listeners[eventName];
    if (!list) {
        list = [];
        this._listeners[eventName] = list;
    }
    list.push({
        eventName:eventName,
        fn:fn,
        options:options || {}
    });
    this._numListeners++;
    return this;
};

/**
 * Fires an event at this node, immediately calling listeners registered for the event
 */
SceneJS.Node.prototype._fireEvent = function (eventName, params, options) {
    var list = this._listeners[eventName];
    if (list) {
        if (!params) {
            params = {};
        }
        var event = {
            name:eventName,
            params:params,
            options:options || {}
        };
        var listener;
        for (var i = 0, len = list.length; i < len; i++) {
            listener = list[i];
            if (listener.options.scope) {
                listener.fn.call(listener.options.scope, event);
            } else {
                listener.fn.call(this, event);
            }
        }
    }
};

/**
 * Removes a handler that is registered for the given event on this node.
 * Does nothing if no such handler registered.
 */
SceneJS.Node.prototype.removeListener = function (eventName, fn) {
    var list = this._listeners[eventName];
    if (!list) {
        return null;
    }
    for (var i = 0; i < list.length; i++) {
        if (list[i].fn == fn) {
            list.splice(i, 1);
            return fn;
        }
    }
    this._numListeners--;
    return null;
};

/**
 * Returns true if this node has any listeners for the given event
 */
SceneJS.Node.prototype.hasListener = function (eventName) {
    return this._listeners[eventName];
};

/**
 * Returns true if this node has any listeners at all.
 */
SceneJS.Node.prototype.hasListeners = function () {
    return (this._numListeners > 0);
};

/** Removes all listeners registered on this node.
 */
SceneJS.Node.prototype.removeListeners = function () {
    this._listeners = {};
    this._numListeners = 0;
    return this;
};

/**
 * Returns the parent node
 * @return {SceneJS.Node}
 */
SceneJS.Node.prototype.getParent = function (type) {
    return this.parent;
};

/**
 * Finds the first node of given type on path to root.
 * @param {String} type Parent type to find on path to root
 * @return {SceneJS.Node}
 */
SceneJS.Node.prototype.getParentOfType = function (type) {
    var parent = this.parent;
    while (parent && parent.type != type) {
        parent = parent.parent;
    }
    return parent;
};

/**
 * Iterates over parent nodes on the path from the selected node to the root, executing a function
 * for each.
 * If the function returns true at any node, then traversal stops and a selector is
 * returned for that node.
 * @param {Function(node, index)} fn Function to execute on each instance node
 * @return {Object} Selector for selected node, if any
 */
SceneJS.Node.prototype.eachParent = function (fn) {

    if (!fn) {
        throw "SceneJS.Node.eachParent param 'fn' is null or undefined";
    }

    var count = 0;
    var node = this;

    while (node.parent) {
        if (fn.call(node.parent, count++) === true) {
            return node.parent;
        }
        node = node.parent;
    }

    return null;
};

/** Returns true if a child node matching given ID or index exists on this node
 * @param {Number|String} node Child node index or ID
 */
SceneJS.Node.prototype.hasNode = function (node) {

    if (node === null || node === undefined) {
        throw "SceneJS.Node.hasNode param 'node' is null or undefined";
    }

    var type = typeof node;
    var nodeGot;

    if (type == "number") {
        nodeGot = this.getNodeAt(node);

    } else if (type == "string") {
        nodeGot = this.getNode(node);

    } else {
        throw "SceneJS.Node.hasNode param 'node' should be either an index number or an ID string";
    }

    return (nodeGot != undefined && nodeGot != null);
};

/** Selects a child node matching given ID or index
 * @param {Number|String} node Child node index or ID
 */
SceneJS.Node.prototype.node = function (node) {

    if (node === null || node === undefined) {
        throw "SceneJS.Node.node param 'node' is null or undefined";
    }

    var type = typeof node;
    var nodeGot;

    if (type == "number") {
        nodeGot = this.getNodeAt(node);

    } else if (type == "string") {
        nodeGot = this.getNode(node);

    } else {
        throw "SceneJS.Node.node param 'node' should be either an index number or an ID string";
    }

    if (!nodeGot) {
        throw "SceneJS.Node.node - node not found: '" + node + "'";
    }

    return nodeGot;
};

/**
 * Iterates over sub-nodes of the selected node, executing a function
 * for each. With the optional options object we can configure is depth-first or breadth-first order.
 * If neither, then only the child nodes are iterated.
 * If the function returns true at any node, then traversal stops and a selector is
 * returned for that node.
 * @param {Function(index, node)} fn Function to execute on each child node
 * @return {Object} Selector for selected node, if any
 */
SceneJS.Node.prototype.eachNode = function (fn, options) {

    if (!fn) {
        throw "SceneJS.Node.eachNode param 'fn' is null or undefined";
    }

    if (typeof fn != "function") {
        throw "SceneJS.Node.eachNode param 'fn' should be a function";
    }

    var stoppedNode;
    options = options || {};
    var count = 0;

    if (options.andSelf) {
        if (fn.call(this, count++) === true) {
            return this;
        }
    }

    if (!options.depthFirst && !options.breadthFirst) {
        stoppedNode = this._iterateEachNode(fn, this, count);

    } else if (options.depthFirst) {
        stoppedNode = this._iterateEachNodeDepthFirst(fn, this, count, false); // Not below root yet

    } else {
        // TODO: breadth-first
    }

    if (stoppedNode) {
        return stoppedNode;
    }

    return undefined; // IDE happy now
};

SceneJS.Node.prototype.numNodes = function () {
    return this.nodes.length;
};

SceneJS.Node.prototype._iterateEachNode = function (fn, node, count) {

    var len = node.nodes.length;
    var child;

    for (var i = 0; i < len; i++) {
        child = node.nodes[i];

        if (fn.call(child, count++) === true) {
            return child;
        }
    }

    return null;
};

SceneJS.Node.prototype._iterateEachNodeDepthFirst = function (fn, node, count, belowRoot) {

    if (belowRoot) {

        /* Visit this node - if we are below root, because entry point visits the root
         */
        if (fn.call(node, count++) === true) {
            return node;
        }
    }

    belowRoot = true;

    /* Iterate nodes
     */
    var len = node.nodes.length;
    var child;
    for (var i = 0; i < len; i++) {
        child = this._iterateEachNodeDepthFirst(fn, node.nodes[i], count, belowRoot);
        if (child) {
            return child;
        }
    }

    return null;
};

/** Returns either all child or all sub-nodes of the given type, depending on whether search is recursive or not.
 */
SceneJS.Node.prototype.findNodesByType = function (type, recursive) {
    return this._findNodesByType(type, [], recursive);
};

SceneJS.Node.prototype._findNodesByType = function (type, list, recursive) {
    var i;
    for (i = 0; i < this.nodes.length; i++) {
        var node = this.nodes[i];
        if (node.type == type) {
            list.push(node);
        }
    }
    if (recursive) {
        for (i = 0; i < this.nodes.length; i++) {
            this.nodes[i]._findNodesByType(type, list, recursive);
        }
    }
    return list;
};

/** Finds the first node on path up to root whose type equals that given
 */
SceneJS.Node.prototype.findParentByType = function (type) {
    var parent = this.parent;
    while (parent && parent.type != type) {
        parent = parent.parent;
    }
    return parent;
};

/** Binds a listener to an event on the selected node
 *
 * @param {String} name Event name
 * @param {Function} handler Event handler
 */
SceneJS.Node.prototype.bind = function (name, handler) {

    if (!name) {
        throw "SceneJS.Node.bind param 'name' null or undefined";
    }

    if (typeof name != "string") {
        throw "SceneJS.Node.bind param 'name' should be a string";
    }

    if (!handler) {
        throw "SceneJS.Node.bind param 'handler' null or undefined";
    }

    if (typeof handler != "function") {
        throw "SceneJS.Node.bind param 'handler' should be a function";
    }

    this.addListener(name, handler, { scope:this });

    this._engine.branchDirty(this);

    return handler;
};

/**
 * Returns an object containing the attributes that were given when creating the node. Obviously, the map will have
 * the current values, plus any attributes that were later added through set/add methods on the node
 *
 */
SceneJS.Node.prototype.getJSON = function () {
    return this;
};


SceneJS.Node.prototype._compile = function (ctx) {
    if (this.preCompile) {
        this.preCompile();
    }
    this._compileNodes(ctx);
    if (this.postCompile) {
        this.postCompile();
    }
};

SceneJS.Node.prototype._compileNodes = function (ctx) {

    var renderSubs = this._topicSubs["rendered"];

    if (renderSubs) {
        SceneJS_nodeEventsModule.preVisitNode(this);
    }

//    var tickSubs = this._topicSubs["tick"];
//
//    if (tickSubs) {
//        ctx.pubSubProxy.on("tick", function(event) {
//            this.publish("tick", event);
//        });
//    }

    var child;

    for (var i = 0, len = this.nodes.length; i < len; i++) {

        child = this.nodes[i];

        child.branchDirty = child.branchDirty || this.branchDirty; // Compile subnodes if scene branch dirty

        if (child.dirty || child.branchDirty || this._engine.sceneDirty) {  // Compile nodes that are flagged dirty
            child._compile(ctx);
            child.dirty = false;
            child.branchDirty = false;
        }
    }

    if (renderSubs) {
        SceneJS_nodeEventsModule.postVisitNode(this);
    }
};



/**
 * Destroys this node. It is marked for destruction; when the next scene traversal begins (or the current one ends)
 * it will be destroyed and removed from it's parent.
 */
SceneJS.Node.prototype.destroy = function () {

    if (!this.destroyed) {

        if (this.parent) {

            // Remove from parent's child node list

            var parentNodes = this.parent.nodes;
            var len = parentNodes.length;
            for (var i = 0; i < len; i++) {
                if (parentNodes[i].id === this.id) {
                    parentNodes.splice(i, 1);
                    break;
                }
            }
        }

        // Remove publication
        this._engine.scene.unpublish("nodes/" + this.id);

        /* Recusrsively destroy child nodes without
         * bothering to remove them from their parents
         */
        this._destroyTree();

        /* Need object list recompilation on display
         */
        this._engine.display.objectListDirty = true;
    }

    return this;
};

SceneJS.Node.prototype._destroyTree = function () {

    this.destroyed = true;

    this._engine.destroyNode(this); // Release node object

    var childNode;
    for (var i = 0, len = this.nodes.length; i < len; i++) {
        childNode = this.nodes[i];
        this._engine.scene.unpublish("nodes/" + childNode.id);
        childNode._destroyTree();
    }
};

/**
 * Performs the actual destruction of this node, calling the node's optional template destroy method
 */
SceneJS.Node.prototype._doDestroy = function () {

    if (this._destroy) {  // Call destruction handler for each node subclass
        this._destroy();
    }

    return this;
};;SceneJS_PubSubProxy = function (scene, proxy) {
    this.scene = scene;
    this.proxy = proxy;

};



;/**
 * @class Manages creation, recycle and destruction of {@link SceneJS.Node} instances
 * @private
 */
var SceneJS_NodeFactory = function () {

    /** Nodes created by this factory
     * @type {SceneJS_Map}
     */
    this.nodes = new SceneJS_Map({});
};

/**
 * Scene graph node classes provided by the SceneJS_NodeFactory class
 *
 * @type {[SceneJS.Node]}
 */
SceneJS_NodeFactory.nodeTypes = {};

/**
 * Subscribers waiting for node types
 * @type {Object}
 * @private
 */
SceneJS_NodeFactory._subs = {};

/**
 * Creates a node class for instantiation by this factory
 *
 * @param {String} typeName Name of type, eg. "rotate"
 * @param {String} coreTypeName Optional name of core type for the node, eg. "xform" - defaults to type name of node
 * @param {Function} [augment] Augments the basic node type with our custom node methods
 * @returns The new node class
 */
SceneJS_NodeFactory.createNodeType = function (typeName, coreTypeName, augment) {
    if (SceneJS_NodeFactory.nodeTypes[typeName]) {
        throw "Node type already defined: " + typeName;
    }
    var nodeType = function () { // Create the class
        SceneJS.Node.apply(this, arguments);
        this.type = typeName;
    };
    nodeType.prototype = new SceneJS.Node();            // Inherit from base class
    nodeType.prototype.constructor = nodeType;
    SceneJS_NodeFactory.nodeTypes[typeName] = nodeType;

    var type = SceneJS_NodeFactory.nodeTypes[typeName]; // Type has installed itself
    if (!type) {
        throw "Node type plugin did not install itself correctly";
    }
    // Augment the basic node type
    if (augment) {
        augment(nodeType);
    }
    // Notify subscribers waiting for the type
    var subs = SceneJS_NodeFactory._subs[typeName];
    if (subs) {
        while (subs.length > 0) {
            subs.pop()(type);
        }
        delete subs[typeName];
    }
    return nodeType;
};

/**
 *
 */
SceneJS_NodeFactory.prototype.getNode = function (engine, json, core, ok) {
    json.type = json.type || "node"; // Nodes are SceneJS.Node type by default
    var nodeType;
    if (json.type == "node") {
        nodeType = SceneJS.Node;
    } else {
        nodeType = SceneJS_NodeFactory.nodeTypes[json.type];
    }
    if (nodeType) {
        return this._createNode(nodeType, engine, json, core, ok);
    } else {
        var self = this;
        this._getType(
            engine,
            json.type,
            function (nodeType) {
                self._createNode(nodeType, engine, json, core, ok);
            });
    }
};

SceneJS_NodeFactory.prototype._createNode = function (nodeType, engine, json, core, ok) {
    var node = new nodeType();
    var id = json.id || json.nodeId; // 'id' and 'nodeId' are aliases
    if (id) {
        this.nodes.addItem(id, node);
    } else {
        id = this.nodes.addItem(node);
    }
    node._construct(engine, core, json, id); // Instantiate node
    if (ok) {
        ok(node);
    }
    return node;
};

/**
 * Returns installed type of given type and ID
 */
SceneJS_NodeFactory.prototype._getType = function (engine, typeName, ok) {
    var type = SceneJS_NodeFactory.nodeTypes[typeName];
    if (type) {
        ok(type);
        return;
    }
    var subs = SceneJS_NodeFactory._subs[typeName] || (SceneJS_NodeFactory._subs[typeName] = []);
    subs.push(ok);
    if (subs.length > 1) { // Not first sub
        return;
    }
    var taskId = SceneJS_sceneStatusModule.taskStarted(engine.scene, "Loading plugin");
    subs.push(function () {
        SceneJS_sceneStatusModule.taskFinished(taskId);
    });
    var self = this;
    var typePath = SceneJS_configsModule.configs.pluginPath;
    if (!typePath) {
        throw "no typePath config"; // Build script error - should create this config
    }
    this._loadScript(typePath + "/node/" + typeName + ".js",
        function () {
            SceneJS_sceneStatusModule.taskFailed(taskId);
        });
};

SceneJS_NodeFactory.prototype._loadScript = function (url, error) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.onerror = error;
    document.getElementsByTagName("head")[0].appendChild(script);
};

/**
 * Releases a node back to this factory
 */
SceneJS_NodeFactory.prototype.putNode = function (node) {
    this.nodes.removeItem(node.id);
};
;/**
 * @class Scene graph node which defines a billboard transform to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
new (function () {

    // The default state core singleton for {@link SceneJS.Billboard} nodes
    var defaultCore = {
        type: "billboard",
        stateId: SceneJS._baseStateId++,
        empty: true,
        hash: ""
    };

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.billboard = defaultCore;
            stackLen = 0;
        });

    var coreStack = [];
    var stackLen = 0;

    /**
     * @class Scene graph node which defines a billboard transform for nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Billboard = SceneJS_NodeFactory.createNodeType("billboard");

    SceneJS.Billboard.prototype._init = function (params) {
        if (this._core.useCount == 1) { // This node is the resource definer
            this._core.spherical = (params.spherical !== false);
        }
        this._core.hash = "bb;";
    };

    /** Sets whether this billboard is spherical (default), where it "rotates" about the X and Y-axis,
     * if required, to face the viewpoint, or cylindrical, where it only rotates about the Y-axis.
      * @param spherical
     */
    SceneJS.Billboard.prototype.setSpherical = function (spherical) {
        this._core.spherical = spherical;
        this._engine.branchDirty(this);
        this._engine.display.imageDirty = true;
    };

    SceneJS.Billboard.prototype.getSpherical = function () {
        return this._core.spherical;
    };

    SceneJS.Billboard.prototype._compile = function (ctx) {
        coreStack[stackLen++] = this._core;
        this._engine.display.billboard = this._core;
        this._compileNodes(ctx);
        this._engine.display.billboard = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

    SceneJS.Billboard.prototype._destroy = function () {
        if (this._core) {
            this._engine._coreFactory.putCore(this._core);
        }
    };

})();;(function () {

    var defaultMatrix = SceneJS_math_perspectiveMatrix4(
        45, // fovy
        1, // aspect
        0.1, // near
        10000); // far

    var defaultMat = new Float32Array(defaultMatrix);

    // The default state core singleton for {@link SceneJS.Camera} nodes
    var defaultCore = {
        type: "camera",
        stateId: SceneJS._baseStateId++,
        matrix: defaultMatrix,
        mat: defaultMat,
        optics: {
            type: "perspective",
            fovy: 45.0,
            aspect: 1.0,
            near: 0.1,
            far: 10000.0
        },
        checkAspect: function (core, aspect) {
            if (core.optics.aspect != aspect) {
                core.optics.aspect = aspect;
                rebuildCore(this);
            }
        }
    };

    var coreStack = [];
    var stackLen = 0;

    // Set default core on the display at the start of each new scene compilation
    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.projTransform = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which defines the projection transform to apply to the {@link SceneJS.Geometry} nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Camera = SceneJS_NodeFactory.createNodeType("camera");

    SceneJS.Camera.prototype._init = function (params) {
        if (this._core.useCount == 1) {

            params.optics = params.optics || {};
            var canvas = this.getScene().getCanvas();
            params.optics.aspect = canvas.width / canvas.height;
            this.setOptics(params.optics); // Can be undefined

            if (params.pan) {
                this.setPan(params.pan);
            }

            var self = this;

            this._canvasSizeSub = this.getScene().on("canvasSize",
                function (c) {
                    self._core.optics.aspect = c.aspect;
                    rebuildCore(self._core);
                    self._engine.display.imageDirty = true;
                });
        }
    };

    /**
     * Returns the default camera projection matrix
     * @return {Float32Array}
     */
    SceneJS.Camera.getDefaultMatrix = function () {
        return defaultMat;
    };

    SceneJS.Camera.prototype.setOptics = function (optics) {
        var core = this._core;
        if (!optics) {
            core.optics = {
                type: "perspective",
                fovy: 60.0,
                aspect: 1.0,
                near: 0.1,
                far: 10000.0
            };
        } else {
            var type = optics.type;
            if (!type) {
                if (core.optics) {
                    type = core.optics.type;
                }
            }
            type = type || "perspective";
            if (type == "ortho") {
                core.optics = SceneJS._applyIf(SceneJS_math_ORTHO_OBJ, {
                    type: type,
                    left: optics.left,
                    bottom: optics.bottom,
                    near: optics.near,
                    right: optics.right,
                    top: optics.top,
                    far: optics.far
                });
            } else if (type == "frustum") {
                core.optics = {
                    type: type,
                    left: optics.left || -1.0,
                    bottom: optics.bottom || -1.0,
                    near: optics.near || 0.1,
                    right: optics.right || 1.00,
                    top: optics.top || 1.0,
                    far: optics.far || 10000.0
                };
            } else if (type == "perspective") {
                core.optics = {
                    type: type,
                    fovy: optics.fovy || 60.0,
                    aspect: optics.aspect == undefined ? 1.0 : optics.aspect,
                    near: optics.near || 0.1,
                    far: optics.far || 10000.0
                };
            } else if (!optics.type) {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "SceneJS.Camera configuration invalid: optics type not specified - " +
                    "supported types are 'perspective', 'frustum' and 'ortho'");
            } else {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "SceneJS.Camera configuration invalid: optics type not supported - " +
                    "supported types are 'perspective', 'frustum' and 'ortho'");
            }
        }
        this._core.optics.pan = optics.pan;
        rebuildCore(this._core);
        this.publish("matrix", this._core.matrix);
        this._engine.display.imageDirty = true;
    };

    SceneJS.Camera.prototype.setPan = function (pan) {
        this._core.pan = pan;
        rebuildCore(this._core);
        this.publish("matrix", this._core.matrix);
        this._engine.display.imageDirty = true;
    };

    function rebuildCore(core) {
        var optics = core.optics;
        if (optics.type == "ortho") {
            core.matrix = SceneJS_math_orthoMat4c(
                optics.left,
                optics.right,
                optics.bottom,
                optics.top,
                optics.near,
                optics.far);

        } else if (optics.type == "frustum") {
            core.matrix = SceneJS_math_frustumMatrix4(
                optics.left,
                optics.right,
                optics.bottom,
                optics.top,
                optics.near,
                optics.far);

        } else if (optics.type == "perspective") {
            core.matrix = SceneJS_math_perspectiveMatrix4(
                optics.fovy * Math.PI / 180.0,
                optics.aspect,
                optics.near,
                optics.far);
        }

        if (core.pan) {
            // Post-multiply a screen-space pan
            var pan = core.pan;
            var panMatrix = SceneJS_math_translationMat4v([pan.x || 0, pan.y || 0, pan.z || 0]);
            core.matrix = SceneJS_math_mulMat4(panMatrix, core.matrix, []);
        }

        if (!core.mat) {
            core.mat = new Float32Array(core.matrix);
        } else {
            core.mat.set(core.matrix);
        }
    }

    SceneJS.Camera.prototype.getOptics = function () {
        var optics = {};
        for (var key in this._core.optics) {
            if (this._core.optics.hasOwnProperty(key)) {
                optics[key] = this._core.optics[key];
            }
        }
        return optics;
    };

    SceneJS.Camera.prototype.getMatrix = function () {
        return this._core.matrix.slice(0);
    };

    /**
     * Compiles this camera node, setting this node's state core on the display, compiling sub-nodes,
     * then restoring the previous camera state core back onto the display on exit.
     */
    SceneJS.Camera.prototype._compile = function (ctx) {
        this._engine.display.projTransform = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.projTransform = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

    SceneJS.Camera.prototype._destroy = function () {
        this.getScene().off(this._canvasSizeSub);
    };
})();;(function() {

    /**
     * The default state core singleton for {@link SceneJS.Clips} nodes
     */
    var defaultCore = {
        type: "clips",
        stateId: SceneJS._baseStateId++,
        empty: true,        
        hash: "",
        clips : []
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {
                params.engine.display.clips = defaultCore;
                stackLen = 0;
            });

    /**
     * @class Scene graph node which defines one or more arbitrarily-aligned clip planes to clip the {@link SceneJS.Geometry} nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Clips = SceneJS_NodeFactory.createNodeType("clips");

    SceneJS.Clips.prototype._init = function(params) {

        if (this._core.useCount == 1) { // This node defines the resource

            var clips = params.clips;

            if (!clips) {
                throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "clips node attribute missing : 'clips'");
            }

            this._core.clips = this._core.clips || [];

            for (var i = 0, len = clips.length; i < len; i++) {
                this._setClip(i, clips[i]);
            }
        }
    };

    SceneJS.Clips.prototype.setClips = function(clips) {
        var indexNum;
        for (var index in clips) {
            if (clips.hasOwnProperty(index)) {
                if (index != undefined || index != null) {
                    indexNum = parseInt(index);
                    if (indexNum < 0 || indexNum >= this._core.clips.length) {
                        throw SceneJS_error.fatalError(
                                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                                "Invalid argument to set 'clips': index out of range (" + this._core.clips.length + " clips defined)");
                    }
                    this._setClip(indexNum, clips[index] || {});
                }
            }
        }
        this._engine.display.imageDirty = true;
    };

    SceneJS.Clips.prototype._setClip = function(index, cfg) {

        var clip = this._core.clips[index] || (this._core.clips[index] = {});

        clip.normalAndDist = [cfg.x || 0,  cfg.y || 0, cfg.z || 0, cfg.dist || 0];

        var mode = cfg.mode || clip.mode || "disabled";

        if (mode != "inside" && mode != "outside" && mode != "disabled") {
            throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "clips node invalid value for property 'mode': should be 'inside' or 'outside' or 'disabled'");
        }
        clip.mode = mode;

        this._core.hash = null;
    };

    SceneJS.Clips.prototype._compile = function(ctx) {

        if (!this._core.hash) {
            this._core.hash = this._core.clips.length;
        }

        this._engine.display.clips = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.clips = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };


})();;(function () {

    // The default state core singleton for {@link SceneJS.Enable} nodes
    var defaultCore = {
        stateId:SceneJS._baseStateId++,
        type:"enable",
        enabled:true
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.enable = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which enables or disables rendering for its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Enable = SceneJS_NodeFactory.createNodeType("enable");

    SceneJS.Enable.prototype._init = function (params) {
        if (this._core.useCount == 1) {   // This node is first to reference the state core, so sets it up
            this._core.enabled = true;
            if (params.enabled != undefined) {
                this.setEnabled(params.enabled);
            }
        }
    };

    SceneJS.Enable.prototype.setEnabled = function (enabled) {
        if (enabled !== this._core.enabled) {
            this._core.enabled = enabled;
            this._engine.display.drawListDirty = true;
            this.publish("enabled", enabled);
        }
        return this;
    };

    SceneJS.Enable.prototype.getEnabled = function () {
        return this._core.enabled;
    };

    SceneJS.Enable.prototype._compile = function (ctx) {
        this._engine.display.enable = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.enable = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

})();;(function () {

    /**
     * The default state core singleton for {@link SceneJS.Flags} nodes
     */
    var defaultCore = {

        stateId: SceneJS._baseStateId++,
        type: "flags",

        picking: true,              // Picking enabled
        clipping: true,             // User-defined clipping enabled
        enabled: true,              // Node not culled from traversal
        transparent: false,         // Node transparent - works in conjunction with matarial alpha properties
        backfaces: true,            // Show backfaces
        frontface: "ccw",           // Default vertex winding for front face
        reflective: true,           // Reflects reflection node cubemap, if it exists, by default.
        solid: false,               // When true, renders backfaces without texture or shading, for a cheap solid cross-section effect
        solidColor: [1.0, 1.0, 1.0],// Solid cap color
        skybox: false,              // Treat as a skybox
        hash: "refl;;;"
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.flags = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which sets rendering mode flags for its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Flags = SceneJS_NodeFactory.createNodeType("flags");

    SceneJS.Flags.prototype._init = function (params) {

        if (this._core.useCount == 1) {         // This node is first to reference the state core, so sets it up

            this._core.picking = true;           // Picking enabled
            this._core.clipping = true;          // User-defined clipping enabled
            this._core.enabled = true;           // Node not culled from traversal
            this._core.transparent = false;      // Node transparent - works in conjunction with matarial alpha properties
            this._core.backfaces = true;         // Show backfaces
            this._core.frontface = "ccw";        // Default vertex winding for front face
            this._core.reflective = true;        // Reflects reflection node cubemap, if it exists, by default.
            this._core.solid = false;            // Renders backfaces without texture or shading, for a cheap solid cross-section effect
            this._core.solidColor = [1.0, 1.0, 1.0 ]; // Solid cap color
            this._core.skybox = false;              // Treat as a skybox
            if (params.flags) {                  // 'flags' property is actually optional in the node definition
                this.setFlags(params.flags);
            }
        }
    };

    SceneJS.Flags.prototype.setFlags = function (flags) {

        var core = this._core;

        if (flags.picking != undefined) {
            core.picking = !!flags.picking;
            this._engine.display.drawListDirty = true;
        }

        if (flags.clipping != undefined) {
            core.clipping = !!flags.clipping;
            this._engine.display.imageDirty = true;
        }

        if (flags.enabled != undefined) {
            core.enabled = !!flags.enabled;
            this._engine.display.drawListDirty = true;
        }

        if (flags.transparent != undefined) {
            core.transparent = !!flags.transparent;
            this._engine.display.stateSortDirty = true;
        }

        if (flags.backfaces != undefined) {
            core.backfaces = !!flags.backfaces;
            this._engine.display.imageDirty = true;
        }

        if (flags.frontface != undefined) {
            core.frontface = flags.frontface;
            this._engine.display.imageDirty = true;
        }

        if (flags.reflective != undefined) {
            core.reflective = flags.reflective;
            this._engine.branchDirty(this);
            this._engine.display.imageDirty = true;
        }

        if (flags.solid != undefined) {
            core.solid = flags.solid;
            this._engine.branchDirty(this);
            this._engine.display.imageDirty = true;
        }

        if (flags.solidColor != undefined) {
            var defaultSolidColor = defaultCore.solidColor;
            var color = flags.solidColor;
            core.solidColor = color ? [
                color.r != undefined && color.r != null ? color.r : defaultSolidColor[0],
                color.g != undefined && color.g != null ? color.g : defaultSolidColor[1],
                color.b != undefined && color.b != null ? color.b : defaultSolidColor[2]
            ] : defaultCore.solidColor;
            this._engine.display.imageDirty = true;
        }

        if (flags.skybox != undefined) {
            core.skybox = flags.skybox;
            this._engine.branchDirty(this);
            this._engine.display.imageDirty = true;
        }

        core.hash = getHash(core);

        return this;
    };

    SceneJS.Flags.prototype.getFlags = function () {
        var core = this._core;
        return {
            picking: core.picking,
            clipping: core.clipping,
            enabled: core.enabled,
            transparent: core.transparent,
            backfaces: core.backfaces,
            frontface: core.frontface,
            reflective: core.reflective,
            solid: core.solid,
            solidColor: core.solidColor
        };
    };

    SceneJS.Flags.prototype.setPicking = function (picking) {
        picking = !!picking;
        if (this._core.picking != picking) {
            this._core.picking = picking;
            this._engine.display.drawListDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getPicking = function () {
        return this._core.picking;
    };

    SceneJS.Flags.prototype.setClipping = function (clipping) {
        clipping = !!clipping;
        if (this._core.clipping != clipping) {
            this._core.clipping = clipping;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getClipping = function () {
        return this._core.clipping;
    };

    SceneJS.Flags.prototype.setEnabled = function (enabled) {
        enabled = !!enabled;
        if (this._core.enabled != enabled) {
            this._core.enabled = enabled;
            this._engine.display.drawListDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getEnabled = function () {
        return this._core.enabled;
    };

    SceneJS.Flags.prototype.setTransparent = function (transparent) {
        transparent = !!transparent;
        if (this._core.transparent != transparent) {
            this._core.transparent = transparent;
            this._engine.display.stateOrderDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getTransparent = function () {
        return this._core.transparent;
    };

    SceneJS.Flags.prototype.setBackfaces = function (backfaces) {
        backfaces = !!backfaces;
        if (this._core.backfaces != backfaces) {
            this._core.backfaces = backfaces;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getBackfaces = function () {
        return this._core.backfaces;
    };

    SceneJS.Flags.prototype.setFrontface = function (frontface) {
        if (this._core.frontface != frontface) {
            this._core.frontface = frontface;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getFrontface = function () {
        return this._core.frontface;
    };

    SceneJS.Flags.prototype.setReflective = function (reflective) {
        reflective = !!reflective;
        if (this._core.reflective != reflective) {
            this._core.reflective = reflective;
            this._core.hash = getHash(this._core);
            this._engine.branchDirty(this);
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getReflective = function () {
        return this._core.reflective;
    };

    SceneJS.Flags.prototype.setSolid = function (solid) {
        solid = !!solid;
        if (this._core.solid != solid) {
            this._core.solid = solid;
            this._core.hash = getHash(this._core);
            this._engine.branchDirty(this);
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getSolid = function () {
        return this._core.solid;
    };

    SceneJS.Flags.prototype.setSolidColor = function (color) {
        var defaultSolidColor = defaultCore.solidColor;
        this._core.solidColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultSolidColor[0],
            color.g != undefined && color.g != null ? color.g : defaultSolidColor[1],
            color.b != undefined && color.b != null ? color.b : defaultSolidColor[2]
        ] : defaultCore.solidColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Flags.prototype.getSolidColor = function () {
        return {
            r: this._core.solidColor[0],
            g: this._core.solidColor[1],
            b: this._core.solidColor[2]
        };
    };

    SceneJS.Flags.prototype.setSkybox = function (skybox) {
        skybox = !!skybox;
        if (this._core.skybox != skybox) {
            this._core.skybox = skybox;
            this._core.hash = getHash(this._core);
            this._engine.branchDirty(this);
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getSkybox = function () {
        return this._core.skybox;
    };

    SceneJS.Flags.prototype._compile = function (ctx) {
        this._engine.display.flags = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.flags = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

    function getHash(core) {
        return (core.reflective ? "refl" : "") + ";" +
                (core.solid ? "s" : "") + ";" +
                (core.skybox ? "sky" : "") + ";";
    }

})();
;new (function () {

    var defaultCore = {
        type: "renderTarget",
        stateId: SceneJS._baseStateId++,
        targets: null
    };

    // Map of  nodes to cores, for reallocation on WebGL context restore
    var nodeCoreMap = {};

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.renderTarget = defaultCore;
            stackLen = 0;
        });

    // Reallocate VBOs when context restored after loss
    SceneJS_events.addListener(
        SceneJS_events.WEBGL_CONTEXT_RESTORED,
        function () {
            for (var nodeId in nodeCoreMap) {
                if (nodeCoreMap.hasOwnProperty(nodeId)) {
                    nodeCoreMap[nodeId]._core.renderBuf.webglRestored();
                }
            }
        });

    SceneJS.ColorTarget = SceneJS_NodeFactory.createNodeType("colorTarget");

    SceneJS.ColorTarget.prototype._init = function (params) {
        nodeCoreMap[this._core.coreId] = this;
        this._core.bufType = "color";
        this._core.renderBuf = new SceneJS._webgl.RenderBuffer({ canvas: this._engine.canvas });
    };

    SceneJS.ColorTarget.prototype._compile = function (ctx) {
        if (!this.__core) {
            this.__core = this._engine._coreFactory.getCore("renderTarget");
        }
        var parentCore = this._engine.display.renderTarget;
        if (!this._core.empty) {
            this.__core.targets = (parentCore && parentCore.targets) ? parentCore.targets.concat([this._core]) : [this._core];
        }
        coreStack[stackLen++] = this.__core;
        this._engine.display.renderTarget = this.__core;
        this._compileNodes(ctx);
        this._engine.display.renderTarget = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };


    SceneJS.ColorTarget.prototype._destroy = function () {
        if (this._core) {
            if (this._core.renderBuf) {
                this._core.renderBuf.destroy();
            }
            delete nodeCoreMap[this._core.coreId];
        }
    };
})();;new (function () {

    var defaultCore = {
        type: "renderTarget",
        stateId: SceneJS._baseStateId++,
        targets: null
    };

    // Map of  nodes to cores, for reallocation on WebGL context restore
    var nodeCoreMap = {};

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.renderTarget = defaultCore;
            stackLen = 0;
        });

    // Reallocate VBOs when context restored after loss
    SceneJS_events.addListener(
        SceneJS_events.WEBGL_CONTEXT_RESTORED,
        function () {
            for (var nodeId in nodeCoreMap) {
                if (nodeCoreMap.hasOwnProperty(nodeId)) {
                    nodeCoreMap[nodeId]._buildNodeCore();
                }
            }
        });

    SceneJS.DepthTarget = SceneJS_NodeFactory.createNodeType("depthTarget");

    SceneJS.DepthTarget.prototype._init = function (params) {
        nodeCoreMap[this._core.coreId] = this;
        this._core.bufType = "depth";
        this._core.renderBuf = new SceneJS._webgl.RenderBuffer({ canvas: this._engine.canvas });
    };

    SceneJS.DepthTarget.prototype._compile = function (ctx) {
        if (!this.__core) {
            this.__core = this._engine._coreFactory.getCore("renderTarget");
        }
        var parentCore = this._engine.display.renderTarget;
        if (!this._core.empty) {
            this.__core.targets = (parentCore && parentCore.targets) ? parentCore.targets.concat([this._core]) : [this._core];
        }
        coreStack[stackLen++] = this.__core;
        this._engine.display.renderTarget = this.__core;
        this._compileNodes(ctx);
        this._engine.display.renderTarget = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };


    SceneJS.DepthTarget.prototype._destroy = function () {
        if (this._core) {
            if (this._core.renderBuf) {
                this._core.renderBuf.destroy();
            }
            delete nodeCoreMap[this._core.coreId];
        }
    };
})();;new (function () {

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function () {
            stackLen = 0;
        });

    /**
     * @class Scene graph node that defines geometry.
     * @extends SceneJS.Node
     * When this node is at a leaf, it defines a scene object which inherits the state set up by all the nodes above it
     * on the path up to the root. These nodes can be nested, so that child geometries inherit arrays
     * defined by parent geometries.
     */
    SceneJS.Geometry = SceneJS_NodeFactory.createNodeType("geometry");

    SceneJS.Geometry.prototype._init = function (params) {

        if (this._core.useCount == 1) { // This node defines the core

            this._initNodeCore(params, {
                origin: params.origin,
                scale: params.scale,
                autoNormals: params.normals == "auto"
            });

            this._buildNodeCore(this._engine.canvas.gl, this._core);

            var self = this;

            this._core.webglRestored = function () {

                // Ensure that we recreate these in subsequent calls to
                // core.getTangents and core.getPickPositions
                self._core.tangentBufs = null;
                self._core.pickPositionsBuf = null;

                self._buildNodeCore(self._engine.canvas.gl, self._core);
            };

        }
    };

    /**
     * Convert JSON arrays into typed arrays,
     * apply optional baked Model-space transforms to positions
     */
    SceneJS.Geometry.prototype._initNodeCore = function (data, options) {

        var self = this;

        options = options || {};

        var primitive = data.primitive || "triangles";
        var core = this._core;
        var IndexArrayType = SceneJS.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"] ? Uint32Array : Uint16Array;

        core.primitive = this._getPrimitiveType(primitive);
        core.primitiveName = primitive;

        // Generate normals
        if (data.normals) {
            if (primitive == "triangles") {
                if (data.normals === "auto" || data.normals === true) {
                    if (data.positions && data.indices) {
                        this._buildNormals(data); // Auto normal generation - build normals array
                    }
                }
            }
        }

        // Create typed arrays, apply any baked transforms
        core.arrays = {};

        if (data.positions) {
            if (data.positions.constructor != Float32Array) {
                data.positions = new Float32Array(data.positions);
            }

            if (options.scale || options.origin) {
                this._applyOptions(data.positions, options)
            }

            core.arrays.positions = data.positions;
        }

        if (data.normals) {
            if (data.normals.constructor != Float32Array) {
                data.normals = new Float32Array(data.normals);
            }

            core.arrays.normals = data.normals;
        }

        if (data.uvs) {
            var uvs = data.uvs;
            var uv;
            for (var i = 0, len = uvs.length; i < len; i++) {
                uv = uvs[i];
                if (uv.constructor != Float32Array) {
                    uvs[i] = new Float32Array(uvs[i]);
                }
            }
            core.arrays.uvs = uvs;
        }

        // ---------------- Backward-compatibility -------------------

        if (data.uv) {
            if (data.uv.constructor != Float32Array) {
                data.uv = new Float32Array(data.uv);
            }
            if (!core.arrays.uvs) {
                core.arrays.uvs = [];
            }
            core.arrays.uvs[0] = data.uv;
        }

        if (data.uv1) {
            if (data.uv1.constructor != Float32Array) {
                data.uv1 = new Float32Array(data.uv1);
            }
            if (!core.arrays.uvs) {
                core.arrays.uvs = [];
            }
            core.arrays.uvs[1] = data.uv2;
        }

        if (data.uv2) {
            if (data.uv2.constructor != Float32Array) {
                data.uv2 = new Float32Array(data.uv2);
            }
            if (!core.arrays.uvs) {
                core.arrays.uvs = [];
            }
            core.arrays.uvs[2] = data.uv2;
        }

        if (data.uv3) {
            if (data.uv3.constructor != Float32Array) {
                data.uv3 = new Float32Array(data.uv3);
            }
            if (!core.arrays.uvs) {
                core.arrays.uvs = [];
            }
            core.arrays.uvs[3] = data.uv3;
        }

        // ----------------------------------------------------------

        if (core.arrays.normals && core.arrays.uvs) {
            core.arrays.tangents = [];
        }

        if (data.colors) {
            if (data.colors.constructor != Float32Array) {
                data.colors = new Float32Array(data.colors);
            }

            core.arrays.colors = data.colors;
        }

        if (data.indices) {
            if (data.indices.constructor != Uint16Array && data.indices.constructor != Uint32Array) {
                data.indices = new IndexArrayType(data.indices);
            }

            core.arrays.indices = data.indices;
        }

        // Lazy-build tangents, only when needed as rendering
        core.getTangents = function (uvLayerIdx) {

            // We're only allowed one normal map per drawable, but we'll
            // cache tangents for each UV layer. In practice the cache would
            // only contain one array of tangents, for the UV layer that
            // happens to be used for normal mapping.

            if (!core.tangentBufs) {
                core.tangentBufs = [];
            }
            if (core.tangentBufs[uvLayerIdx]) {
                return core.tangentBufs[uvLayerIdx];
            }
            var arrays = core.arrays;
            var tangents = core.arrays.tangents[uvLayerIdx];
            if (!tangents) {
                // Retaining tangents data after WebGL context recovery
                if (arrays.positions && arrays.indices && arrays.uvs && arrays.uvs[uvLayerIdx]) {
                    var gl = self._engine.canvas.gl;
                    tangents = new Float32Array(SceneJS_math_buildTangents(arrays.positions, arrays.indices, arrays.uvs[uvLayerIdx])); // Build tangents array;
                    core.arrays.tangents[uvLayerIdx] = tangents;
                }
            }
            if (tangents) {
                return core.tangentBufs[uvLayerIdx] = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, tangents, tangents.length, 3, gl.STATIC_DRAW);
            } else {
                return null;
            }
        };

        // Buffers for primitive-pick rendering

        core.getPickPositions = function () {
            if (core.pickPositionsBuf) {
                return core.pickPositionsBuf;
            }
            
            createPickArrays();

            return core.pickPositionsBuf;
        };

        core.getPickColors = function () {
            if (core.pickColorsBuf) {
                return core.pickColorsBuf;
            }
            
            createPickArrays();

            return core.pickColorsBuf;
        };

        function createPickArrays() {
            var gl = self._engine.canvas.gl;

            var pickArrays, pickPositions, pickColors;

            if (core.arrays.positions) {
                pickArrays = SceneJS_math_getPickPrimitives(core.arrays.positions, core.arrays.indices);
                pickPositions = pickArrays.positions;
                pickColors = pickArrays.colors;
                core.pickPositionsBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, pickPositions, pickPositions.length, 3, gl.STATIC_DRAW);
            } else {
                pickColors = SceneJS_math_getPickColors(core.arrays.indices);
            }

            core.pickColorsBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, pickColors, pickColors.length, 4, gl.STATIC_DRAW);
        } 
    };


    /**
     * Returns WebGL constant for primitive name
     */
    SceneJS.Geometry.prototype._getPrimitiveType = function (primitive) {

        var gl = this._engine.canvas.gl;

        switch (primitive) {

            case "points":
                return gl.POINTS;

            case "lines":
                return gl.LINES;

            case "line-loop":
                return gl.LINE_LOOP;

            case "line-strip":
                return gl.LINE_STRIP;

            case "triangles":
                return gl.TRIANGLES;

            case "triangle-strip":
                return gl.TRIANGLE_STRIP;

            case "triangle-fan":
                return gl.TRIANGLE_FAN;

            default:
                throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "geometry primitive unsupported: '" +
                    primitive +
                    "' - supported types are: 'points', 'lines', 'line-loop', " +
                    "'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'");
        }
    };

    /**
     * Apply baked Model-space transformations to give position array
     */
    SceneJS.Geometry.prototype._applyOptions = function (positions, options) {

        if (options.scale) {

            var scaleX = options.scale.x != undefined ? options.scale.x : 1.0;
            var scaleY = options.scale.y != undefined ? options.scale.y : 1.0;
            var scaleZ = options.scale.z != undefined ? options.scale.z : 1.0;

            for (var i = 0, len = positions.length; i < len; i += 3) {
                positions[i] *= scaleX;
                positions[i + 1] *= scaleY;
                positions[i + 2] *= scaleZ;
            }
        }

        if (options.origin) {

            var originX = options.origin.x != undefined ? options.origin.x : 0.0;
            var originY = options.origin.y != undefined ? options.origin.y : 0.0;
            var originZ = options.origin.z != undefined ? options.origin.z : 0.0;

            for (var i = 0, len = positions.length; i < len; i += 3) {
                positions[i] -= originX;
                positions[i + 1] -= originY;
                positions[i + 2] -= originZ;
            }
        }

        return positions;
    };

    /**
     * Destroy vertex buffers associated with given core
     */
    var destroyBuffers = function (core) {
        if (core.vertexBuf) {
            core.vertexBuf.destroy();
            core.vertexBuf = null;
        }

        if (core.normalBuf) {
            core.normalBuf.destroy();
            core.normalBuf = null;
        }

        if (core.uvBufs) {
            var uvBufs = core.uvBufs;
            var uvBuf;
            for (var i = 0, len = uvBufs.length; i < len; i++) {
                uvBuf = uvBufs[i];
                if (uvBuf) {
                    uvBuf.destroy();
                }
            }
            core.uvBufs = null;
        }

        if (core.colorBuf) {
            core.colorBuf.destroy();
            core.colorBuf = null;
        }

        if (core.tangentBufs) {
            var tangentBufs = core.tangentBufs;
            var tangentBuf;
            for (var j = 0, lenj = tangentBufs.length; j < lenj; j++) {
                tangentBuf = tangentBufs[j];
                if (tangentBuf) {
                    tangentBuf.destroy();
                }
            }
            core.tangentBufs = null;
        }

        if (core.indexBuf) {
            core.indexBuf.destroy();
            core.indexBuf = null;
        }

        if (core.interleavedBuf) {
            core.interleavedBuf.destroy();
            core.interleavedBuf = null;
        }
    };

    /**
     * Allocates WebGL buffers for geometry arrays
     *
     * In addition to initially allocating those, this is called to reallocate them after
     * WebGL context is regained after being lost.
     */
    SceneJS.Geometry.prototype._buildNodeCore = function (gl, core) {

        var usage = gl.STATIC_DRAW; //var usage = (!arrays.fixed) ? gl.STREAM_DRAW : gl.STATIC_DRAW;

        try { // TODO: Modify usage flags in accordance with how often geometry is evicted

            var arrays = core.arrays;
            var canInterleave = (SceneJS.getConfigs("enableInterleaving") !== false);
            var dataLength = 0;
            var interleavedValues = 0;
            var interleavedArrays = [];
            var interleavedArrayStrides = [];

            var prepareInterleaveBuffer = function (array, strideInElements) {
                if (dataLength == 0) {
                    dataLength = array.length / strideInElements;
                } else if (array.length / strideInElements != dataLength) {
                    canInterleave = false;
                }
                interleavedArrays.push(array);
                interleavedArrayStrides.push(strideInElements);
                interleavedValues += strideInElements;
                return (interleavedValues - strideInElements) * 4;
            };

            if (arrays.positions) {
                if (canInterleave) {
                    core.interleavedPositionOffset = prepareInterleaveBuffer(arrays.positions, 3);
                }
                core.vertexBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, arrays.positions, arrays.positions.length, 3, usage);
            }

            if (arrays.normals) {
                if (canInterleave) {
                    core.interleavedNormalOffset = prepareInterleaveBuffer(arrays.normals, 3);
                }
                core.normalBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, arrays.normals, arrays.normals.length, 3, usage);
            }

            if (arrays.uvs) {

                var uvs = arrays.uvs;
                var offsets;
                var i;
                var len;
                var uv;

                if (canInterleave) {
                    core.interleavedUVOffsets = [];
                    offsets = core.interleavedUVOffsets;
                    for (i = 0, len = uvs.length; i < len; i++) {
                        offsets.push(prepareInterleaveBuffer(arrays.uvs[i], 2));
                    }
                }

                core.uvBufs = [];

                for (i = 0, len = uvs.length; i < len; i++) {
                    uv = arrays.uvs[i];
                    if (uv.length > 0) {
                        core.uvBufs.push(new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, uv, uv.length, 2, usage));
                    }
                }
            }

            if (arrays.colors) {
                if (canInterleave) {
                    core.interleavedColorOffset = prepareInterleaveBuffer(arrays.colors, 4);
                }
                core.colorBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, arrays.colors, arrays.colors.length, 4, usage);
            }

            if (arrays.indices) {
                core.indexBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, arrays.indices, arrays.indices.length, 1, usage);
            }

            if (interleavedValues > 0 && canInterleave) {
                // We'll place the vertex attribute data interleaved in this array.
                // This will enable us to use less bindBuffer calls and make the data
                // efficient to address on the GPU.
                var interleaved = [];

                var arrayCount = interleavedArrays.length;
                for (var i = 0; i < dataLength; ++i) {
                    for (var j = 0; j < arrayCount; ++j) {
                        var stride = interleavedArrayStrides[j];
                        for (var k = 0; k < stride; ++k) {
                            interleaved.push(interleavedArrays[j][i * stride + k]);
                        }
                    }
                }
                core.interleavedStride = interleavedValues * 4; // in bytes
                core.interleavedBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(interleaved), interleaved.length, interleavedValues, usage);
                core.interleavedBuf.dirty = false;
            }

        } catch (e) { // Allocation failure - delete whatever buffers got allocated
            destroyBuffers(core);
            throw SceneJS_error.fatalError(
                SceneJS.errors.ERROR,
                "Failed to allocate geometry: " + e);
        }
    };

    SceneJS.Geometry.prototype._updateArray = function (array, items, offset) {

        var arrayLen = array.length;
        var itemsLen = items.length;

        if (itemsLen + offset > arrayLen) {
            itemsLen -= (itemsLen + offset) - arrayLen;
        }

        for (var i = offset, j = 0; j < itemsLen; i++, j++) {
            array[i] = items[j];
        }

    };

    /** Builds normal vectors from positions and indices
     * @private
     */
    SceneJS.Geometry.prototype._buildNormals = function (data) {

        var positions = data.positions;
        var indices = data.indices;
        var nvecs = new Array(positions.length / 3);
        var j0;
        var j1;
        var j2;
        var v1;
        var v2;
        var v3;

        for (var i = 0, len = indices.length - 3; i < len; i += 3) {
            j0 = indices[i + 0];
            j1 = indices[i + 1];
            j2 = indices[i + 2];

            v1 = [positions[j0 * 3 + 0], positions[j0 * 3 + 1], positions[j0 * 3 + 2]];
            v2 = [positions[j1 * 3 + 0], positions[j1 * 3 + 1], positions[j1 * 3 + 2]];
            v3 = [positions[j2 * 3 + 0], positions[j2 * 3 + 1], positions[j2 * 3 + 2]];

            v2 = SceneJS_math_subVec4(v2, v1, [0, 0, 0, 0]);
            v3 = SceneJS_math_subVec4(v3, v1, [0, 0, 0, 0]);

            var n = SceneJS_math_normalizeVec4(SceneJS_math_cross3Vec4(v2, v3, [0, 0, 0, 0]), [0, 0, 0, 0]);

            if (!nvecs[j0]) nvecs[j0] = [];
            if (!nvecs[j1]) nvecs[j1] = [];
            if (!nvecs[j2]) nvecs[j2] = [];

            nvecs[j0].push(n);
            nvecs[j1].push(n);
            nvecs[j2].push(n);
        }

        var normals = new Float32Array(positions.length);

        // now go through and average out everything
        for (var i = 0, len = nvecs.length; i < len; i++) {
            var nvec = nvecs[i];
            if (!nvec) {
                continue;
            }
            var count = nvec.length;
            var x = 0;
            var y = 0;
            var z = 0;
            for (var j = 0; j < count; j++) {
                x += nvec[j][0];
                y += nvec[j][1];
                z += nvec[j][2];
            }
            normals[i * 3 + 0] = (x / count);
            normals[i * 3 + 1] = (y / count);
            normals[i * 3 + 2] = (z / count);
        }

        data.normals = normals;
    };

    SceneJS.Geometry.prototype.setSource = function (sourceConfigs) {
        this._sourceConfigs = sourceConfigs;
        var source = this._source;
        if (source && source.configure) {
            source.configure(sourceConfigs);
        }
    };

    SceneJS.Geometry.prototype.getSource = function () {
        return this._sourceConfigs || {};
    };

    SceneJS.Geometry.prototype.setPositions = function (data) {
        if (data.positions && this._core.vertexBuf) {
            this._boundary = null;
            var core = this._core;
            core.vertexBuf.bind();
            core.vertexBuf.setData(new Float32Array(data.positions), data.positionsOffset || 0);
            core.arrays.positions.set(data.positions, data.positionsOffset || 0);
            this._engine.display.imageDirty = true;
            if (core.interleavedBuf) {
                core.interleavedBuf.dirty = true;
            }
        }
    };

    SceneJS.Geometry.prototype.getPositions = function () {
        return this._core.arrays ? this._core.arrays.positions : null;
    };

    SceneJS.Geometry.prototype.setNormals = function (data) {
        if (data.normals && this._core.normalBuf) {
            var core = this._core;
            core.normalBuf.bind();
            core.normalBuf.setData(new Float32Array(data.normals), data.normalsOffset || 0);
            core.arrays.normals.set(data.normals, data.normalsOffset || 0);
            this._engine.display.imageDirty = true;
            if (core.interleavedBuf) {
                core.interleavedBuf.dirty = true;
            }
        }
    };

    SceneJS.Geometry.prototype.getNormals = function () {
        return this._core.arrays ? this._core.arrays.normals : null;
    };

    SceneJS.Geometry.prototype.setColors = function (data) {
        if (data.colors && this._core.colorBuf) {
            var core = this._core;
            core.colorBuf.bind();
            core.colorBuf.setData(new Float32Array(data.colors), data.colorsOffset || 0);
            core.arrays.colors.set(data.colors, data.colorsOffset || 0);
            this._engine.display.imageDirty = true;
            if (core.interleavedBuf) {
                core.interleavedBuf.dirty = true;
            }
        }
    };

    SceneJS.Geometry.prototype.getColors = function () {
        return this._core.arrays ? this._core.arrays.colors : null;
    };

    SceneJS.Geometry.prototype.setIndices = function (data) {
        if (data.indices && this._core.indexBuf) {
            this._boundary = null;
            var core = this._core;
            core.indexBuf.bind();
            var IndexArrayType = this._engine.canvas.UINT_INDEX_ENABLED ? Uint32Array : Uint16Array;
            core.indexBuf.setData(new IndexArrayType(data.indices), data.indicesOffset || 0);
            core.arrays.indices.set(data.indices, data.indicesOffset || 0);
            this._engine.display.imageDirty = true;
        }
    };

    SceneJS.Geometry.prototype.getIndices = function () {
        return this._core.arrays ? this._core.arrays.indices : null;
    };

    SceneJS.Geometry.prototype.getUV = function () {
        return this._core.arrays ? this._core.arrays.uvs[0] : null;
    };

    SceneJS.Geometry.prototype.getUV2 = function () {
        return this._core.arrays ? this._core.arrays.uvs[1] : null;
    };

    SceneJS.Geometry.prototype.getUV2 = function () {
        return this._core.arrays ? this._core.arrays.uvs[2] : null;
    };

    SceneJS.Geometry.prototype.getUv3 = function () {
        return this._core.arrays ? this._core.arrays.uvs[3] : null;
    };

    SceneJS.Geometry.prototype.getPrimitive = function () {
        return this.primitive;
    };

    /** Returns the Model-space boundary of this geometry
     *
     * @returns {*}
     */
    SceneJS.Geometry.prototype.getBoundary = function () {
        if (this._boundary) {
            return this._boundary;
        }

        var arrays = this._core.arrays;

        if (!arrays) {
            return null;
        }

        var positions = arrays.positions;

        if (!positions) {
            return null;
        }

        this._boundary = {
            xmin: SceneJS_math_MAX_DOUBLE,
            ymin: SceneJS_math_MAX_DOUBLE,
            zmin: SceneJS_math_MAX_DOUBLE,
            xmax: SceneJS_math_MIN_DOUBLE,
            ymax: SceneJS_math_MIN_DOUBLE,
            zmax: SceneJS_math_MIN_DOUBLE
        };

        var x, y, z;

        for (var i = 0, len = positions.length - 2; i < len; i += 3) {

            x = positions[i];
            y = positions[i + 1];
            z = positions[i + 2];

            if (x < this._boundary.xmin) {
                this._boundary.xmin = x;
            }
            if (y < this._boundary.ymin) {
                this._boundary.ymin = y;
            }
            if (z < this._boundary.zmin) {
                this._boundary.zmin = z;
            }
            if (x > this._boundary.xmax) {
                this._boundary.xmax = x;
            }
            if (y > this._boundary.ymax) {
                this._boundary.ymax = y;
            }
            if (z > this._boundary.zmax) {
                this._boundary.zmax = z;
            }
        }

        return this._boundary;
    };

    SceneJS.Geometry.prototype._compile = function (ctx) {

        if (this._core._loading) { // TODO: Breaks with asynch loaded cores - this node needs to recompile when target core is loaded
            this._compileNodes(ctx);
            return;
        }

        var core = this._core;

        if (!core.vertexBuf) {

            /* SceneJS.Geometry has no vertex buffer - it must be therefore be indexing a vertex/uv buffers defined
             * by a higher Geometry, as part of a composite geometry:
             *
             * It must therefore inherit the vertex buffer, along with UV coord buffers.
             *
             * We'll leave it to the render state graph traversal to ensure that the
             * vertex and UV buffers are not needlessly rebound for this geometry.
             */
            core = this._inheritVBOs(core);
        }

        if (core.indexBuf) { // Can only render when we have indices

            var parts = [                           // Safe to build geometry hash here - geometry is immutable
                core.normalBuf ? "t" : "f",
                core.arrays && core.arrays.tangents ? "t" : "f",
                core.colorBuf ? "t" : "f",
                core.primitive
            ];

            // Hash parts for UVs

            parts.push(";uvs");
            var uvBufs = core.uvBufs;
            if (uvBufs) {
                for (var i = 0, len = uvBufs.length; i < len; i++) {
                    parts.push(uvBufs[i] ? "t" : "f");
                }
            }

            core.hash = parts.join("");

            core.stateId = this._core.stateId;
            core.type = "geometry";

            this._engine.display.geometry = coreStack[stackLen++] = core;

            SceneJS_events.fireEvent(SceneJS_events.OBJECT_COMPILING, { // Pull in state updates from scenes nodes
                display: this._engine.display
            });

            this._engine.display.buildObject(this.id); // Use node ID since we may inherit from many cores

        } else {
            coreStack[stackLen++] = this._core;
        }

        this._compileNodes(ctx);

        stackLen--;
        coreStack[stackLen] = null; // Release memory
    };

    SceneJS.Geometry.prototype._inheritVBOs = function (core) {

        var core2 = {
            arrays: core.arrays,
            primitive: core.primitive,
            primitiveName: core.primitiveName,
            boundary: core.boundary,
            normalBuf: core.normalBuf,
            uvBufs: core.uvBufs,
            colorBuf: core.colorBuf,
            interleavedBuf: core.interleavedBuf,
            indexBuf: core.indexBuf,
            interleavedStride: core.interleavedStride,
            interleavedPositionOffset: core.interleavedPositionOffset,
            interleavedNormalOffset: core.interleavedNormalOffset,
            interleavedUVOffsets: core.interleavedUVOffsets,
            interleavedColorOffset: core.interleavedColorOffset,
            getPickIndices: core.getPickIndices,
            getPickPositions: core.getPickPositions,
            getPickColors: core.getPickColors
        };

        for (var i = stackLen - 1; i >= 0; i--) {
            if (coreStack[i].vertexBuf) {
                core2.vertexBuf = coreStack[i].vertexBuf;
                core2.boundary = coreStack[i].boundary;
                core2.normalBuf = coreStack[i].normalBuf;
                core2.uvBufs = coreStack[i].uvBufs;           // Vertex and UVs are a package
                core2.colorBuf = coreStack[i].colorBuf;
                core2.interleavedBuf = coreStack[i].interleavedBuf;
                core2.interleavedStride = coreStack[i].interleavedStride;
                core2.interleavedPositionOffset = coreStack[i].interleavedPositionOffset;
                core2.interleavedNormalOffset = coreStack[i].interleavedNormalOffset;
                core2.interleavedUVOffsets = coreStack[i].interleavedUVOffsets;
                core2.interleavedColorOffset = coreStack[i].interleavedColorOffset;
                return core2;
            }
        }

        return core2;
    };

    SceneJS.Geometry.prototype._destroy = function () {

        this._engine.display.removeObject(this.id);

        /* Destroy core if no other references
         */
        if (this._core.useCount == 1) {

            this._destroyNodeCore();

            if (this._source && this._source.destroy) {
                this._source.destroy();
            }
        }
    };

    SceneJS.Geometry.prototype._destroyNodeCore = function () {

        if (document.getElementById(this._engine.canvas.canvasId)) { // Context won't exist if canvas has disappeared
            destroyBuffers(this._core);
        }
    };

})();
;(function() {

    /**
     * The default state core singleton for {@link SceneJS.Stage} nodes
     */
    var defaultCore = {
        type: "stage",
        stateId: SceneJS._baseStateId++,
        priority: 0,
        pickable: true,
        enabled: true
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {
                params.engine.display.stage = defaultCore;
                stackLen = 0;
            });

    /**
     * @class Scene graph node which assigns the {@link SceneJS.Geometry}s within its subgraph to a prioritised render bin
     * @extends SceneJS.Node
     */
    SceneJS.Stage = SceneJS_NodeFactory.createNodeType("stage");

    SceneJS.Stage.prototype._init = function(params) {
        if (this._core.useCount == 1) { // This node defines the resource
            this._core.priority = params.priority || 0;
            this._core.enabled = params.enabled !== false;
            this._core.pickable = !!params.pickable;
        }
    };

    SceneJS.Stage.prototype.setPriority = function(priority) {
        priority = priority || 0;
        if (this._core.priority != priority) {
            this._core.priority = priority;
            this._engine.display.stateOrderDirty = true;
        }
    };

    SceneJS.Stage.prototype.getPriority = function() {
        return this._core.priority;
    };

    SceneJS.Stage.prototype.setEnabled = function(enabled) {
        enabled = !!enabled;
        if (this._core.enabled != enabled) {
            this._core.enabled = enabled;
            this._engine.display.drawListDirty = true;
        }
    };

    SceneJS.Stage.prototype.getEnabled = function() {
        return this._core.enabled;
    };

    SceneJS.Stage.prototype.getEnabled = function() {
        return this._core.enabled;
    };

    SceneJS.Stage.prototype._compile = function(ctx) {
        this._engine.display.stage = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.stage = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

})();

;(function () {

    /**
     * The default state core singleton for {@link SceneJS.Layer} nodes
     */
    var defaultCore = {
        type: "layer",
        stateId: SceneJS._baseStateId++,
        priority: 0,
        enabled: true
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.layer = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which assigns the {@link SceneJS.Geometry}s within its subgraph to a prioritised render bin
     * @extends SceneJS.Node
     */
    SceneJS.Layer = SceneJS_NodeFactory.createNodeType("layer");

    SceneJS.Layer.prototype._init = function (params) {
        if (this._core.useCount == 1) { // This node defines the resource
            this._core.priority = params.priority || 0;
            this._core.enabled = params.enabled !== false;
        }
    };

    SceneJS.Layer.prototype.setPriority = function (priority) {
        priority = priority || 0;
        if (this._core.priority != priority) {
            this._core.priority = priority;
            this._engine.display.stateOrderDirty = true;
        }
    };

    SceneJS.Layer.prototype.getPriority = function () {
        return this._core.priority;
    };

    SceneJS.Layer.prototype.setEnabled = function (enabled) {
        enabled = !!enabled;
        if (this._core.enabled != enabled) {
            this._core.enabled = enabled;
            this._engine.display.drawListDirty = true;
        }
    };

    SceneJS.Layer.prototype.getEnabled = function () {
        return this._core.enabled;
    };

    SceneJS.Layer.prototype.getEnabled = function () {
        return this._core.enabled;
    };

    SceneJS.Layer.prototype.setClearDepth = function (clearDepth) {
        clearDepth = clearDepth || 0;
        if (this._core.clearDepth != clearDepth) {
            this._core.clearDepth = clearDepth;
            this._engine.display.drawListDirty = true;
        }
    };

    SceneJS.Layer.prototype.getClearDepth = function () {
        return this._core.clearDepth;
    };

    SceneJS.Layer.prototype._compile = function(ctx) {
        this._engine.display.layer = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.layer = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

})();

;/**
 * @class Scene graph node which assigns nodes in its subgraph to a library
 * @extends SceneJS.Node
 */
SceneJS.Library = SceneJS_NodeFactory.createNodeType("library");
SceneJS.Library.prototype._compile = function(ctx) { // Bypass child nodes
};

;(function () {

    /**
     * The default state core singleton for {@link SceneJS.Lights} nodes
     */
    var defaultCore = {
        type: "lights",
        stateId: SceneJS._baseStateId++,
        hash: null,
        empty: false,
        lights: [
            {
                mode: "ambient",
                color: [0.7, 0.7, 0.8 ],
                diffuse: true,
                specular: false
            },
            {
                mode: "dir",
                color: [1.0, 1.0, 1.0 ],
                diffuse: true,
                specular: true,
                dir: [-0.5, -0.5, -1.0 ],
                space: "view"
            },
            {
                mode: "dir",
                color: [1.0, 1.0, 1.0 ],
                diffuse: false,
                specular: true,
                dir: [1.0, -0.9, -0.7 ],
                space: "view"
            }
        ]
    };

    makeHash(defaultCore);

    function makeHash(core) {
        if (core.lights && core.lights.length > 0) {
            var lights = core.lights;
            var parts = [];
            var light;
            for (var i = 0, len = lights.length; i < len; i++) {
                light = lights[i];
                parts.push(light.mode);
                if (light.specular) {
                    parts.push("s");
                }
                if (light.diffuse) {
                    parts.push("d");
                }
                parts.push((light.space == "world") ? "w" : "v");
            }
            core.hash = parts.join("");

        } else {
            core.hash = "";
        }
    }

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.lights = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which defines light sources to illuminate the {@link SceneJS.Geometry}s within its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Lights = SceneJS_NodeFactory.createNodeType("lights");

    SceneJS.Lights.prototype._init = function (params) {

        if (this._core.useCount == 1) { // This node defines the resource

            var lights = params.lights;

            if (!lights) {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.NODE_CONFIG_EXPECTED,
                    "lights node attribute missing : 'lights'");
            }

            this._core.lights = this._core.lights || [];

            for (var i = 0, len = lights.length; i < len; i++) {
                this._initLight(i, lights[i]);
            }
        }
    };

    SceneJS.Lights.prototype._initLight = function (index, cfg) {

        var light = {};
        this._core.lights[index] = light;

        var mode = cfg.mode || "dir";
        if (mode != "dir" && mode != "point" && mode != "ambient" && mode != "spot") {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Light mode not supported - should be 'dir' or 'point' or 'spot' or 'ambient'");
        }

        var pos = cfg.pos;
        var dir = cfg.dir;

        var color = cfg.color;
        light.color = [
                color.r != undefined ? color.r : 1.0,
                color.g != undefined ? color.g : 1.0,
                color.b != undefined ? color.b : 1.0
        ];

        // Ambient lights hardwired to contribute to diffuse lighting
        light.mode = mode;
        light.diffuse = (mode == "ambient") ? true : ((cfg.diffuse != undefined) ? cfg.diffuse : true);
        light.specular = (mode == "ambient") ? false : ((cfg.specular != undefined) ? cfg.specular : true);
        light.pos = cfg.pos ? [pos.x || 0, pos.y || 0, pos.z || 0 ] : [0, 0, 0];
        light.dir = cfg.dir ? [dir.x || 0, dir.y || 0, dir.z || 0] : [0, 0, 1];
        light.innerCone = cfg.innerCone != undefined ? cfg.innerCone : 0.25;
        light.outerCone = cfg.outerCone != undefined ? cfg.outerCone : 0;
        light.attenuation = [
                cfg.constantAttenuation != undefined ? cfg.constantAttenuation : 0.0,
                cfg.linearAttenuation || 0.0,
                cfg.quadraticAttenuation || 0.0
        ];

        var space = cfg.space;

        if (!space) {

            space = "world";

        } else if (space != "view" && space != "world") {

            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "lights node invalid value for property 'space': '" + space + "' - should be 'view' or 'world'");
        }

        light.space = space;

        this._core.hash = null;
    };


    SceneJS.Lights.prototype.setLights = function (lights) {
        var indexNum;
        for (var index in lights) {
            if (lights.hasOwnProperty(index)) {
                if (index != undefined || index != null) {
                    indexNum = parseInt(index);
                    if (indexNum < 0 || indexNum >= this._core.lights.length) {
                        throw SceneJS_error.fatalError(
                            SceneJS.errors.ILLEGAL_NODE_CONFIG,
                                "Invalid argument to set 'lights': index out of range (" + this._core.lights.length + " lights defined)");
                    }
                    this._setLight(indexNum, lights[index] || {});
                }
            }
        }
        this._engine.branchDirty(this); // Schedule recompilation of this subgraph
    };

    SceneJS.Lights.prototype._setLight = function (index, cfg) {

        var light = this._core.lights[index];

        // Impact of light update
        var imageDirty = false; // Redraw display list?
        var branchDirty = false; // Recompile scene branch?

        if (cfg.mode && cfg.mode != light.mode) {
            var mode = cfg.mode;
            if (mode != "dir" && mode != "point" && mode != "ambient") {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Light mode not supported - should be 'dir' or 'point' or 'ambient'");
            }
            light.mode = mode;
            light.diffuse = (mode == "ambient") ? true : ((cfg.diffuse != undefined) ? cfg.diffuse : true);
            light.specular = (mode == "ambient") ? false : ((cfg.specular != undefined) ? cfg.specular : true);
            branchDirty = true;
        }

        if (cfg.color) {
            var color = cfg.color;
            light.color = [
                    color.r != undefined ? color.r : 1.0,
                    color.g != undefined ? color.g : 1.0,
                    color.b != undefined ? color.b : 1.0
            ];
            imageDirty = true;
        }

        var pos = cfg.pos;
        if (pos) {
            light.pos = [ pos.x || 0, pos.y || 0, pos.z || 0 ];
            imageDirty = true;
        }

        var dir = cfg.dir;
        if (dir) {
            light.dir = [dir.x || 0, dir.y || 0, dir.z || 0];
            imageDirty = true;
        }

        if (cfg.innerCone != undefined && cfg.innerCone != light.innerCone) {
            light.innerCone = cfg.innerCone;
            imageDirty = true;
        }

        if (cfg.outerCone != undefined && cfg.outerCone != light.outerCone) {
            light.outerCone = cfg.outerCone;
            imageDirty = true;
        }

        if (cfg.constantAttenuation != undefined) {
            light.attenuation[0] = cfg.constantAttenuation;
            imageDirty = true;
        }
        if (cfg.linearAttenuation != undefined) {
            light.attenuation[1] = cfg.linearAttenuation;
            imageDirty = true;
        }
        if (cfg.quadraticAttenuation != undefined) {
            light.attenuation[2] = cfg.quadraticAttenuation;
            imageDirty = true;
        }

        if (cfg.space && cfg.space != light.space) {
            var space = cfg.space;
            if (space != "view" && space != "world") {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                        "lights node invalid value for property 'space': '" + space + "' - should be 'view' or 'world'");
            }
            light.space = space;
            this._core.hash = null;
            branchDirty = true;
        }

        if (cfg.specular != undefined && cfg.specular != light.specular) {
            light.specular = cfg.specular;
            branchDirty = true;
        }
        if (cfg.diffuse != undefined && cfg.diffuse != light.diffuse) {
            light.diffuse = cfg.diffuse;
            branchDirty = true;
        }

        if (branchDirty) {
            this._engine.branchDirty(this); // Schedule recompilation of this subgraph
        } else if (imageDirty) {
            this._engine.display.imageDirty = true;
        }

        this._core.hash = null;
    };

    SceneJS.Lights.prototype._compile = function (ctx) {

        if (!this._core.hash) {
            makeHash(this._core);
        }

        this._engine.display.lights = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.lights = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

})();
;(function () {

    var defaultMatrix = SceneJS_math_lookAtMat4c(0, 0, 10, 0, 0, 0, 0, 1, 0);
    var defaultMat = new Float32Array(defaultMatrix);
    var normalMat = SceneJS_math_transposeMat4(SceneJS_math_inverseMat4(defaultMat, SceneJS_math_mat4()));
    var defaultNormalMat = new Float32Array(normalMat);

    /**
     * The default state core singleton for {@link SceneJS.Lookat} nodes
     */
    var defaultCore = {
        type:"lookAt",
        stateId:SceneJS._baseStateId++,
        matrix:defaultMatrix,
        mat:defaultMat,
        normalMatrix:normalMat,
        normalMat:defaultNormalMat,
        lookAt:SceneJS_math_LOOKAT_ARRAYS
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.viewTransform = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which defines the viewing transform for the {@link SceneJS.Geometry}s within its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Lookat = SceneJS_NodeFactory.createNodeType("lookAt");

    SceneJS.Lookat.prototype._init = function (params) {

        this._mat = null;

        this._xf = {
            type:"lookat"
        };

        if (this._core.useCount == 1) { // This node is the resource definer

            this._core.eyeX = 0;
            this._core.eyeY = 0;
            this._core.eyeZ = 10.0;

            this._core.lookX = 0;
            this._core.lookY = 0;
            this._core.lookZ = 0;

            this._core.upX = 0;
            this._core.upY = 1;
            this._core.upZ = 0;

            if (!params.eye && !params.look && !params.up) {
                this.setEye({x:0, y:0, z:10.0 });
                this.setLook({x:0, y:0, z:0 });
                this.setUp({x:0, y:1.0, z:0 });
            } else {
                this.setEye(params.eye);
                this.setLook(params.look);
                this.setUp(params.up);
            }

            var core = this._core;

            var self = this;

            this._core.rebuild = function () {

                core.matrix = SceneJS_math_lookAtMat4c(
                    core.eyeX, core.eyeY, core.eyeZ,
                    core.lookX, core.lookY, core.lookZ,
                    core.upX, core.upY, core.upZ);

                core.lookAt = {
                    eye:[core.eyeX, core.eyeY, core.eyeZ ],
                    look:[core.lookX, core.lookY, core.lookZ ],
                    up:[core.upX, core.upY, core.upZ ]
                };

                if (!core.mat) { // Lazy-create arrays
                    core.mat = new Float32Array(core.matrix);
                    core.normalMat = new Float32Array(
                        SceneJS_math_transposeMat4(SceneJS_math_inverseMat4(core.matrix, SceneJS_math_mat4())));

                } else { // Insert into arrays
                    core.mat.set(core.matrix);
                    core.normalMat.set(SceneJS_math_transposeMat4(SceneJS_math_inverseMat4(core.matrix, SceneJS_math_mat4())));
                }

                self.publish("matrix", core.matrix);

                core.dirty = false;
            };

            this._core.dirty = true;

            // Rebuild on every scene tick
            // https://github.com/xeolabs/scenejs/issues/277
            this._tick = this.getScene().on("tick", function () {
                if (self._core.dirty) {
                    self._core.rebuild();
                }
            });
        }
    };

    /**
     * Returns the default view transformation matrix
     * @return {Float32Array}
     */
    SceneJS.Lookat.getDefaultMatrix = function () {
        return defaultMat;
    };

    SceneJS.Lookat.prototype.setEye = function (eye) {

        eye = eye || {};

        if (eye.x != undefined && eye.x != null) {
            this._core.eyeX = eye.x;
        }

        if (eye.y != undefined && eye.y != null) {
            this._core.eyeY = eye.y;
        }

        if (eye.z != undefined && eye.z != null) {
            this._core.eyeZ = eye.z;
        }

        this._core.dirty = true;
        this._engine.display.imageDirty = true;

        return this;
    };

    SceneJS.Lookat.prototype.incEye = function (eye) {
        eye = eye || {};
        this._core.eyeX += (eye.x != undefined && eye.x != null) ? eye.x : 0;
        this._core.eyeY += (eye.y != undefined && eye.y != null) ? eye.y : 0;
        this._core.eyeZ += (eye.z != undefined && eye.z != null) ? eye.z : 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setEyeX = function (x) {
        this._core.eyeX = x || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setEyeY = function (y) {
        this._core.eyeY = y || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setEyeZ = function (z) {
        this._core.eyeZ = z || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incEyeX = function (x) {
        this._core.eyeX += x;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incEyeY = function (y) {
        this._core.eyeY += y;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incEyeZ = function (z) {
        this._core.eyeZ += z;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.getEye = function () {
        return {
            x:this._core.eyeX,
            y:this._core.eyeY,
            z:this._core.eyeZ
        };
    };

    SceneJS.Lookat.prototype.setLook = function (look) {
        look = look || {};

        if (look.x != undefined && look.x != null) {
            this._core.lookX = look.x;
        }

        if (look.y != undefined && look.y != null) {
            this._core.lookY = look.y;
        }

        if (look.z != undefined && look.z != null) {
            this._core.lookZ = look.z;
        }

        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incLook = function (look) {
        look = look || {};
        this._core.lookX += (look.x != undefined && look.x != null) ? look.x : 0;
        this._core.lookY += (look.y != undefined && look.y != null) ? look.y : 0;
        this._core.lookZ += (look.z != undefined && look.z != null) ? look.z : 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setLookX = function (x) {
        this._core.lookX = x || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setLookY = function (y) {
        this._core.lookY = y || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setLookZ = function (z) {
        this._core.lookZ = z || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incLookX = function (x) {
        this._core.lookX += x;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incLookY = function (y) {
        this._core.lookY += y;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incLookZ = function (z) {
        this._core.lookZ += z;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.getLook = function () {
        return {
            x:this._core.lookX,
            y:this._core.lookY,
            z:this._core.lookZ
        };
    };

    SceneJS.Lookat.prototype.setUp = function (up) {
        up = up || {};

        if (up.x != undefined && up.x != null) {
            this._core.upX = up.x;
        }

        if (up.y != undefined && up.y != null) {
            this._core.upY = up.y;
        }

        if (up.z != undefined && up.z != null) {
            this._core.upZ = up.z;
        }

        this._core.dirty = true;
        this._engine.display.imageDirty = true;

        return this;
    };

    SceneJS.Lookat.prototype.incUp = function (up) {
        up = up || {};
        this._core.upX += (up.x != undefined && up.x != null) ? up.x : 0;
        this._core.upY += (up.y != undefined && up.y != null) ? up.y : 0;
        this._core.upZ += (up.z != undefined && up.z != null) ? up.z : 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setUpX = function (x) {
        this._core.upX = x || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setUpY = function (y) {
        this._core.upY = y || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setUpZ = function (z) {
        this._core.upZ = z || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incUpX = function (x) {
        this._core.upX += x;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incUpY = function (y) {
        this._core.upY += y;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incUpZ = function (z) {
        this._core.upZ += z;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.getUp = function () {
        return {
            x:this._core.upX,
            y:this._core.upY,
            z:this._core.upZ
        };
    };

    /**
     * Returns a copy of the matrix as a 1D array of 16 elements
     * @returns {Number[16]}
     */
    SceneJS.Lookat.prototype.getMatrix = function () {

        if (this._core.dirty) {
            this._core.rebuild();
        }

        return  this._core.matrix.slice(0);
    };

    SceneJS.Lookat.prototype.getAttributes = function () {
        return {
            look:{
                x:this._core.lookX,
                y:this._core.lookY,
                z:this._core.lookZ
            },
            eye:{
                x:this._core.eyeX,
                y:this._core.eyeY,
                z:this._core.eyeZ
            },
            up:{
                x:this._core.upX,
                y:this._core.upY,
                z:this._core.upZ
            }
        };
    };

    SceneJS.Lookat.prototype._compile = function (ctx) {
        this._engine.display.viewTransform = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.viewTransform = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

    SceneJS.Lookat.prototype._destroy = function () {
        // Stop publishing matrix on each tick
        this.getScene().off(this._tick);
    };

})();;/*

 TODO: material system from virtualworldframework:

 "color":
 "ambient":
 "specColor":
 "shininess":
 "reflect":
 "specular":
 "emit":
 "alpha":
 "binaryAlpha":
 */
new (function () {

    /**
     * The default state core singleton for {@link SceneJS.Material} nodes
     */
    var defaultCore = {
        type:"material",
        stateId:SceneJS._baseStateId++,
        baseColor:[ 1.0, 1.0, 1.0 ],
        specularColor:[ 1.0, 1.0, 1.0 ],
        emitColor:[ 1.0, 1.0, 1.0 ],
        specular:1.0,
        shine:70.0,
        alpha:1.0,
        emit:0.0
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.material = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which defines surface material properties for the {@link SceneJS.Geometry}s within its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Material = SceneJS_NodeFactory.createNodeType("material");

    SceneJS.Material.prototype._init = function (params) {
        if (this._core.useCount == 1) {
            this.setBaseColor(params.color || params.baseColor);
            this.setSpecularColor(params.specularColor);
            this.setEmitColor(params.emitColor);
            this.setSpecular(params.specular);
            this.setShine(params.shine);
            this.setEmit(params.emit);
            this.setAlpha(params.alpha);
        }
    };

    /**
     * @deprecated
     * @param color
     * @return {*}
     */
    SceneJS.Material.prototype.setBaseColor = function (color) {
        var defaultBaseColor = defaultCore.baseColor;
        this._core.baseColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultBaseColor[0],
            color.g != undefined && color.g != null ? color.g : defaultBaseColor[1],
            color.b != undefined && color.b != null ? color.b : defaultBaseColor[2]
        ] : defaultCore.baseColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Material.prototype.setColor = SceneJS.Material.prototype.setBaseColor;

    /**
     * @deprecated
     * @return {Object}
     */
    SceneJS.Material.prototype.getBaseColor = function () {
        return {
            r:this._core.baseColor[0],
            g:this._core.baseColor[1],
            b:this._core.baseColor[2]
        };
    };

    SceneJS.Material.prototype.getColor = SceneJS.Material.prototype.getBaseColor;

    SceneJS.Material.prototype.setSpecularColor = function (color) {
        var defaultSpecularColor = defaultCore.specularColor;
        this._core.specularColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultSpecularColor[0],
            color.g != undefined && color.g != null ? color.g : defaultSpecularColor[1],
            color.b != undefined && color.b != null ? color.b : defaultSpecularColor[2]
        ] : defaultCore.specularColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Material.prototype.getSpecularColor = function () {
        return {
            r:this._core.specularColor[0],
            g:this._core.specularColor[1],
            b:this._core.specularColor[2]
        };
    };

    SceneJS.Material.prototype.setEmitColor = function (color) {
        var defaultEmitColor = defaultCore.emitColor;
        this._core.emitColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultEmitColor[0],
            color.g != undefined && color.g != null ? color.g : defaultEmitColor[1],
            color.b != undefined && color.b != null ? color.b : defaultEmitColor[2]
        ] : defaultCore.emitColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Material.prototype.getEmitColor = function () {
        return {
            r:this._core.emitColor[0],
            g:this._core.emitColor[1],
            b:this._core.emitColor[2]
        };
    };

    SceneJS.Material.prototype.setSpecular = function (specular) {
        this._core.specular = (specular != undefined && specular != null) ? specular : defaultCore.specular;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Material.prototype.getSpecular = function () {
        return this._core.specular;
    };

    SceneJS.Material.prototype.setShine = function (shine) {
        this._core.shine = (shine != undefined && shine != null) ? shine : defaultCore.shine;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Material.prototype.getShine = function () {
        return this._core.shine;
    };

    SceneJS.Material.prototype.setEmit = function (emit) {
        this._core.emit = (emit != undefined && emit != null) ? emit : defaultCore.emit;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Material.prototype.getEmit = function () {
        return this._core.emit;
    };

    SceneJS.Material.prototype.setAlpha = function (alpha) {
        this._core.alpha = (alpha != undefined && alpha != null) ? alpha : defaultCore.alpha;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Material.prototype.getAlpha = function () {
        return this._core.alpha;
    };

    SceneJS.Material.prototype._compile = function (ctx) {
        this._engine.display.material = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.material = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

})();;new (function () {

    /**
     * The default state core singleton for {@link SceneJS.MorphGeometry} nodes
     */
    var defaultCore = {
        type: "morphGeometry",
        stateId: SceneJS._baseStateId++,
        hash: "",
        //         empty: true,
        morph: null
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.morphGeometry = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which defines morphing behaviour for the {@link SceneJS.Geometry}s within its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.MorphGeometry = SceneJS_NodeFactory.createNodeType("morphGeometry");

    SceneJS.MorphGeometry.prototype._init = function (params) {

        if (this._core.useCount == 1) { // This node defines the resource

            this._pickPositionsDirty = true;

            this._buildNodeCore(params);

            this._core.webglRestored = function () {
                //self._buildNodeCore(self._engine.canvas.gl, self._core);
            };

            var self = this;

            // For the morph target at the given index,
            // returns a positions VBO for triangle-picking,
            // lazy-generated from the given indices if not yet existing.

            this._core.getPickPositions = function (index, indices) {
                if (self._pickPositionsDirty) {
                    self._buildPickPositions(indices);
                }
                return self._core.targets[index].pickPositionsBuf;
            };

            // For the morph target at the given index,
            // returns tangents for normal mapping
            // lazy-generated from the given indices if not yet existing.

            this._core.getTangents = function (index, indices, uv) {
                var core = self._core;
                var target = core.targets[index];
                if (target.tangentBuf) {
                    return target.tangentBuf;
                }
                var positions = target.positions;
                uv = target.uv || uv;
                if (positions && indices && uv) {
                    var gl = self._engine.canvas.gl;
                    var tangents = new Float32Array(SceneJS_math_buildTangents(positions, indices, uv));
                    target.tangents = tangents;
                    var usage = gl.STATIC_DRAW;
                    target.tangentBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, tangents, tangents.length, 3, usage);
                    return target.tangentBuf;
                }
            };

            this.setFactor(params.factor);
        }

        this._core.factor = params.factor || 0;
        this._core.clamp = !!params.clamp;
    };

    SceneJS.MorphGeometry.prototype._buildNodeCore = function (data) {

        var targetsData = data.targets || [];
        if (targetsData.length < 2) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "morphGeometry node should have at least two targets");
        }

        var keysData = data.keys || [];
        if (keysData.length != targetsData.length) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "morphGeometry node mismatch in number of keys and targets");
        }

        var core = this._core;
        var gl = this._engine.canvas.gl;
        var usage = gl.STATIC_DRAW; //var usage = (!arrays.fixed) ? gl.STREAM_DRAW : gl.STATIC_DRAW;

        core.keys = keysData;
        core.targets = [];
        core.key1 = 0;
        core.key2 = 1;

        /* First target's arrays are defaults for where not given on previous and subsequent targets.
         * When target does have array, subsequent targets without array inherit it.
         */

        var positions;
        var normals;
        var uv;
        var uv2;

        var targetData;

        for (var i = 0, len = targetsData.length; i < len; i++) {
            targetData = targetsData[i];
            if (!positions && targetData.positions) {
                positions = targetData.positions;
            }
            if (!normals && targetData.normals) {
                normals = targetData.normals;
            }
            if (!uv && targetData.uv) {
                uv = targetData.uv;
            }
            if (!uv2 && targetData.uv2) {
                uv2 = targetData.uv2;
            }
        }

        try {
            var target;
            var arry;

            for (var i = 0, len = targetsData.length; i < len; i++) {
                targetData = targetsData[i];
                target = {};

                arry = targetData.positions || positions;
                if (arry) {
                    target.positions = (arry.constructor == Float32Array) ? arry : new Float32Array(arry);
                    target.vertexBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, target.positions, arry.length, 3, usage);
                    positions = arry;
                }

                arry = targetData.normals || normals;
                if (arry) {
                    target.normals = (arry.constructor == Float32Array) ? arry : new Float32Array(arry);
                    target.normalBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, target.normals, arry.length, 3, usage);
                    normals = arry;
                }

                arry = targetData.uv || uv;
                if (arry) {
                    target.uv = (arry.constructor == Float32Array) ? arry : new Float32Array(arry);
                    target.uvBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, target.uv, arry.length, 2, usage);
                    uv = arry;
                }

                arry = targetData.uv2 || uv2;
                if (arry) {
                    target.uv2 = (arry.constructor == Float32Array) ? arry : new Float32Array(arry);
                    target.uvBuf2 = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, target.uv2, arry.length, 2, usage);
                    uv2 = arry;
                }

                core.targets.push(target);  // We'll iterate this to destroy targets when we recover from error
            }

        } catch (e) {

            /* Allocation failure - deallocate target VBOs
             */
            for (var i = 0, len = core.targets.length; i < len; i++) {

                target = core.targets[i];

                if (target.vertexBuf) {
                    target.vertexBuf.destroy();
                }
                if (target.normalBuf) {
                    target.normalBuf.destroy();
                }
                if (target.uvBuf) {
                    target.uvBuf.destroy();
                }
                if (target.uvBuf2) {
                    target.uvBuf2.destroy();
                }
            }

            throw SceneJS_error.fatalError(
                SceneJS.errors.ERROR,
                "Failed to allocate VBO(s) for morphGeometry: " + e);
        }

        this._pickPositionsDirty = true;
    };

    SceneJS.MorphGeometry.prototype._buildPickPositions = function (indices) {

        var core = this._core;
        var target = null;
        var pickPositions;
        var gl = this._engine.canvas.gl;
        var usage = gl.STATIC_DRAW;

        // On each morph target, build a positions array for
        // color-indexed triangle-picking.

        for (var i = 0, len = core.targets.length; i < len; i++) {

            target = core.targets[i];

            if (target.positions) {

                if (target.pickPositionsBuf) {
                    target.pickPositionsBuf.destroy();
                    target.pickPositionsBuf = null;
                }

                pickPositions = SceneJS_math_getPickPositions(target.positions, indices);

                target.pickPositionsBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, pickPositions, pickPositions.length, 3, usage);
            }
        }

        this._pickPositionsDirty = false;
    };

    SceneJS.MorphGeometry.prototype.setFactor = function (factor) {
        factor = factor || 0.0;

        var core = this._core;

        var keys = core.keys;
        var key1 = core.key1;
        var key2 = core.key2;

        var oldFactor = core.factor;

        if (factor < keys[0]) {
            key1 = 0;
            key2 = 1;

        } else if (factor > keys[keys.length - 1]) {
            key1 = keys.length - 2;
            key2 = key1 + 1;

        } else {
            while (keys[key1] > factor) {
                key1--;
                key2--;
            }
            while (keys[key2] < factor) {
                key1++;
                key2++;
            }
        }

        var frameUpdate = key1 != core.key1;

        /* Normalise factor to range [0.0..1.0] for the target frame
         */
        core.factor = (factor - keys[key1]) / (keys[key2] - keys[key1]);

        this._factor = factor;

        var morphUpdate = frameUpdate || oldFactor != core.factor;

        core.key1 = key1;
        core.key2 = key2;

        if (morphUpdate) {
            var currentFrame = this.getCurrentFrame();
            this.publish("update", currentFrame);
            if (frameUpdate) {
                this.publish("frameUpdate", currentFrame);
            }
        }

        this._engine.display.imageDirty = true;
    };

    SceneJS.MorphGeometry.prototype.getFactor = function () {
        return this._factor;
    };

    SceneJS.MorphGeometry.prototype.getKeys = function () {
        return this._core.keys;
    };

    SceneJS.MorphGeometry.prototype.getTargets = function () {
        return this._core.targets;
    };

    SceneJS.MorphGeometry.prototype.getCurrentFrame = function () {
        var core = this._core;
        var key1 = core.key1;
        var key2 = core.key2;
        return {
            key1: key1,
            key2: key2,
            factor: core.factor,
            target1: core.targets[key1],
            target2: core.targets[key2]
        }
    };

    SceneJS.MorphGeometry.prototype._compile = function (ctx) {

        if (!this._core.hash) {
            this._makeHash();
        }

        this._engine.display.morphGeometry = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.morphGeometry = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

    SceneJS.MorphGeometry.prototype._makeHash = function () {
        var core = this._core;
        if (core.targets.length > 0) {
            var target0 = core.targets[0];  // All targets have same arrays
            var t = "t";
            var f = "f";
            core.hash = ([
                target0.vertexBuf ? t : f,
                target0.normalBuf ? t : f,
                target0.uvBuf ? t : f,
                target0.uvBuf2 ? t : f
            ]).join("");
        } else {
            core.hash = "";
        }
    };

    SceneJS.MorphGeometry.prototype._destroy = function () {
        if (this._core.useCount == 1) { // Destroy core if no other references
            if (document.getElementById(this._engine.canvas.canvasId)) { // Context won't exist if canvas has disappeared
                var core = this._core;
                var target;
                for (var i = 0, len = core.targets.length; i < len; i++) {
                    target = core.targets[i];
                    if (target.vertexBuf) {
                        target.vertexBuf.destroy();
                    }
                    if (target.pickPositionsBuf) {
                        target.pickPositionsBuf.destroy();
                    }
                    if (target.normalBuf) {
                        target.normalBuf.destroy();
                    }
                    if (target.uvBuf) {
                        target.uvBuf.destroy();
                    }
                    if (target.uvBuf2) {
                        target.uvBuf2.destroy();
                    }
                }
            }
        }
    };

})();;(function () {

    /**
     * The default state core singleton for {@link SceneJS.Name} nodes
     */
    var defaultCore = {
        type:"name",
        stateId:SceneJS._baseStateId++,
        name:null
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.name = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which assigns a pick name to the {@link SceneJS.Geometry} nodes in its subgraph.
     * @extends SceneJS.Node
     */
    SceneJS.Name = SceneJS_NodeFactory.createNodeType("name");

    SceneJS.Name.prototype._init = function (params) {
        this.setName(params.name);
        this._core.nodeId = this.id;
    };

    SceneJS.Name.prototype.setName = function (name) {
        this._core.name = name || "unnamed";
        this._engine.branchDirty(this); // Need to recompile name path
    };

    SceneJS.Name.prototype.getName = function () {
        return this._core.name;
    };

    SceneJS.Name.prototype._compile = function (ctx) {

        this._engine.display.name = coreStack[stackLen++] = this._core;

        // (Re)build name path
        var path = [];
        var name;
        for (var i = 0; i < stackLen; i++) {
            name = coreStack[i].name;
            if (name) {
                path.push(name);
            }
        }
        this._core.path = path.join(".");

        this._compileNodes(ctx);
        this._engine.display.name = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };
})();;new (function () {

    /**
     * The default state core singleton for {@link SceneJS.Renderer} nodes
     */
    var defaultCore = {
        type: "renderer",
        stateId: SceneJS._baseStateId++,
        props: null
    };

    var canvas;         // Currently active canvas
    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {

            canvas = params.engine.canvas;

//                // TODO: Below is a HACK
//
//                defaultCore.props = createProps({  // Dont set props - just define for restoring to on props pop
//                    clear: {
//                        depth : true,
//                        color : true
//                    },
//                    // clearColor: {r: 0, g : 0, b : 0 },
//                    clearDepth: 1.0,
//                    enableDepthTest:true,
//                    enableCullFace: false,
//                    frontFace: "ccw",
//                    cullFace: "back",
//                    depthFunc: "less",
//                    depthRange: {
//                        zNear: 0,
//                        zFar: 1
//                    },
//                    enableScissorTest: false,
//                    viewport:{
//                        x : 1,
//                        y : 1,
//                        width: canvas.canvas.width,
//                        height: canvas.canvas.height
//                    },
//                    enableClip: undefined,
//                    enableBlend: false,
//                    blendFunc: {
//                        sfactor: "srcAlpha",
//                        dfactor: "one"
//                    }
//                });

            stackLen = 0;

            params.engine.display.renderer = coreStack[stackLen++] = defaultCore;
        });

    function createProps(props) {

        var restore;
        if (stackLen > 0) {  // can't restore when no previous props set
            restore = {};
            for (var name in props) {
                if (props.hasOwnProperty(name)) {
                    if (!(props[name] == undefined)) {
                        restore[name] = getSuperProperty(name);
                    }
                }
            }
        }

        processProps(props.props);

        return {

            props: props,

            setProps: function (gl) {
                setProperties(gl, props);
            },

            restoreProps: function (gl) {
                if (restore) {
                    restoreProperties(gl, restore);
                }
            }
        };
    }

    var getSuperProperty = function (name) {
        var props;
        var prop;
        for (var i = stackLen - 1; i >= 0; i--) {
            props = coreStack[i].props;
            if (props) {
                prop = props[name];
                if (prop != undefined && prop != null) {
                    return props[name];
                }
            }
        }
        return null; // Cause default to be set
    };

    function processProps(props) {
        var prop;
        for (var name in props) {
            if (props.hasOwnProperty(name)) {
                prop = props[name];
                if (prop != undefined && prop != null) {
                    if (glModeSetters[name]) {
                        props[name] = glModeSetters[name](null, prop);
                    } else if (glStateSetters[name]) {
                        props[name] = glStateSetters[name](null, prop);
                    }
                }
            }
        }
    }

    var setProperties = function (gl, props) {

        for (var key in props) {        // Set order-insensitive properties (modes)
            if (props.hasOwnProperty(key)) {
                var setter = glModeSetters[key];
                if (setter) {
                    setter(gl, props[key]);
                }
            }
        }

        if (props.viewport) {           // Set order-sensitive properties (states)
            glStateSetters.viewport(gl, props.viewport);
        }

        if (props.scissor) {
            glStateSetters.clear(gl, props.scissor);
        }

        if (props.clear) {
            glStateSetters.clear(gl, props.clear);
        }
    };

    /**
     * Restores previous renderer properties, except for clear - that's the reason we
     * have a seperate set and restore semantic - we don't want to keep clearing the buffer.
     */
    var restoreProperties = function (gl, props) {

        var value;

        for (var key in props) {            // Set order-insensitive properties (modes)
            if (props.hasOwnProperty(key)) {
                value = props[key];
                if (value != undefined && value != null) {
                    var setter = glModeSetters[key];
                    if (setter) {
                        setter(gl, value);
                    }
                }
            }
        }

        if (props.viewport) {               //  Set order-sensitive properties (states)
            glStateSetters.viewport(gl, props.viewport);
        }

        if (props.scissor) {
            glStateSetters.clear(gl, props.scissor);
        }
    };


    /**
     * Maps renderer node properties to WebGL gl enums
     * @private
     */
    var glEnum = function (gl, name) {
        if (!name) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Null SceneJS.State node config: \"" + name + "\"");
        }
        var result = SceneJS._webgl.enumMap[name];
        if (!result) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Unrecognised SceneJS.State node config value: \"" + name + "\"");
        }
        var value = gl[result];
        if (!value) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "This browser's WebGL does not support renderer node config value: \"" + name + "\"");
        }
        return value;
    };


    /**
     * Order-insensitive functions that set WebGL modes ie. not actually causing an
     * immediate change.
     *
     * These map to renderer properties and are called in whatever order their
     * property is found on the renderer config.
     *
     * Each of these wrap a state-setter function on the WebGL gl. Each function
     * also uses the glEnum map to convert its renderer node property argument to the
     * WebGL enum constant required by its wrapped function.
     *
     * When called with undefined/null gl, will condition and return the value given
     * ie. set it to default if value is undefined. When called with a gl, will
     * set the value on the gl using the wrapped function.
     *
     * @private
     */
    var glModeSetters = {

        enableBlend: function (gl, flag) {
            if (!gl) {
                if (flag == null || flag == undefined) {
                    flag = false;
                }
                return flag;
            }
            if (flag) {
                gl.enable(gl.BLEND);
            } else {
                gl.disable(gl.BLEND);
            }
        },

        blendColor: function (gl, color) {
            if (!gl) {
                color = color || {};
                return {
                    r: color.r || 0,
                    g: color.g || 0,
                    b: color.b || 0,
                    a: (color.a == undefined || color.a == null) ? 1 : color.a
                };
            }
            gl.blendColor(color.r, color.g, color.b, color.a);
        },

        blendEquation: function (gl, eqn) {
            if (!gl) {
                return eqn || "funcAdd";
            }
            gl.blendEquation(gl, glEnum(gl, eqn));
        },

        /** Sets the RGB blend equation and the alpha blend equation separately
         */
        blendEquationSeparate: function (gl, eqn) {
            if (!gl) {
                eqn = eqn || {};
                return {
                    rgb: eqn.rgb || "funcAdd",
                    alpha: eqn.alpha || "funcAdd"
                };
            }
            gl.blendEquation(glEnum(gl, eqn.rgb), glEnum(gl, eqn.alpha));
        },

        blendFunc: function (gl, funcs) {
            if (!gl) {
                funcs = funcs || {};
                return  {
                    sfactor: funcs.sfactor || "srcAlpha",
                    dfactor: funcs.dfactor || "oneMinusSrcAlpha"
                };
            }
            gl.blendFunc(glEnum(gl, funcs.sfactor || "srcAlpha"), glEnum(gl, funcs.dfactor || "oneMinusSrcAlpha"));
        },

        blendFuncSeparate: function (gl, func) {
            if (!gl) {
                func = func || {};
                return {
                    srcRGB: func.srcRGB || "zero",
                    dstRGB: func.dstRGB || "zero",
                    srcAlpha: func.srcAlpha || "zero",
                    dstAlpha: func.dstAlpha || "zero"
                };
            }
            gl.blendFuncSeparate(
                glEnum(gl, func.srcRGB || "zero"),
                glEnum(gl, func.dstRGB || "zero"),
                glEnum(gl, func.srcAlpha || "zero"),
                glEnum(gl, func.dstAlpha || "zero"));
        },

        clearColor: function (gl, color) {
            if (!gl) {
                color = color || {};
                return {
                    r: color.r || 0,
                    g: color.g || 0,
                    b: color.b || 0,
                    a: (color.a == undefined || color.a == null) ? 1 : color.a
                };
            }
            gl.clearColor(color.r, color.g, color.b, color.a);
        },

        clearDepth: function (gl, depth) {
            if (!gl) {
                return (depth == null || depth == undefined) ? 1 : depth;
            }
            gl.clearDepth(depth);
        },

        clearStencil: function (gl, clearValue) {
            if (!gl) {
                return  clearValue || 0;
            }
            gl.clearStencil(clearValue);
        },

        colorMask: function (gl, color) {
            if (!gl) {
                color = color || {};
                return {
                    r: color.r || 0,
                    g: color.g || 0,
                    b: color.b || 0,
                    a: (color.a == undefined || color.a == null) ? 1 : color.a
                };

            }
            gl.colorMask(color.r, color.g, color.b, color.a);
        },

        enableCullFace: function (gl, flag) {
            if (!gl) {
                return flag;
            }
            if (flag) {
                gl.enable(gl.CULL_FACE);
            } else {
                gl.disable(gl.CULL_FACE);
            }
        },

        cullFace: function (gl, mode) {
            if (!gl) {
                return mode || "back";
            }
            gl.cullFace(glEnum(gl, mode));
        },

        enableDepthTest: function (gl, flag) {
            if (!gl) {
                if (flag == null || flag == undefined) {
                    flag = true;
                }
                return flag;
            }
            if (flag) {
                gl.enable(gl.DEPTH_TEST);
            } else {
                gl.disable(gl.DEPTH_TEST);
            }
        },

        depthFunc: function (gl, func) {
            if (!gl) {
                return func || "less";
            }
            gl.depthFunc(glEnum(gl, func));
        },

        enableDepthMask: function (gl, flag) {
            if (!gl) {
                if (flag == null || flag == undefined) {
                    flag = true;
                }
                return flag;
            }
            gl.depthMask(flag);
        },

        depthRange: function (gl, range) {
            if (!gl) {
                range = range || {};
                return {
                    zNear: (range.zNear == undefined || range.zNear == null) ? 0 : range.zNear,
                    zFar: (range.zFar == undefined || range.zFar == null) ? 1 : range.zFar
                };
            }
            gl.depthRange(range.zNear, range.zFar);
        },

        frontFace: function (gl, mode) {
            if (!gl) {
                return mode || "ccw";
            }
            gl.frontFace(glEnum(gl, mode));
        },

        lineWidth: function (gl, width) {
            if (!gl) {
                return width || 1;
            }
            gl.lineWidth(width);
        },

        enableScissorTest: function (gl, flag) {
            if (!gl) {
                return flag;
            }
            if (flag) {
                gl.enable(gl.SCISSOR_TEST);
            } else {
                flag = false;
                gl.disable(gl.SCISSOR_TEST);
            }
        }
    };

    /**
     * Order-sensitive functions that immediately effect WebGL state change.
     *
     * These map to renderer properties and are called in a particular order since they
     * affect one another.
     *
     * Each of these wrap a state-setter function on the WebGL gl. Each function
     * also uses the glEnum map to convert its renderer node property argument to the
     * WebGL enum constant required by its wrapped function.
     *
     * @private
     */
    var glStateSetters = {

        /** Set viewport on the given gl
         */
        viewport: function (gl, v) {
            if (!gl) {
                v = v || {};
                return {
                    x: v.x || 1,
                    y: v.y || 1,
                    width: v.width || canvas.canvas.width,
                    height: v.height || canvas.canvas.height
                };
            }
            gl.viewport(v.x, v.y, v.width, v.height);
        },

        /** Sets scissor region on the given gl
         */
        scissor: function (gl, s) {
            if (!gl) {
                s = s || {};
                return {
                    x: s.x || 0,
                    y: s.y || 0,
                    width: s.width || 1.0,
                    height: s.height || 1.0
                };
            }
            gl.scissor(s.x, s.y, s.width, s.height);
        },

        /** Clears buffers on the given gl as specified in mask
         */
        clear: function (gl, mask) {
            if (!gl) {
                mask = mask || {};
                return mask;
            }
            var m;
            if (mask.color) {
                m = gl.COLOR_BUFFER_BIT;
            }
            if (mask.depth) {
                m = m | gl.DEPTH_BUFFER_BIT;
            }
            if (mask.stencil) {
                m = m | gl.STENCIL_BUFFER_BIT;
            }
            if (m) {
               //     gl.clear(m);
            }
        }
    };

    SceneJS.Renderer = SceneJS_NodeFactory.createNodeType("renderer");

    SceneJS.Renderer.prototype._init = function (params) {
        if (this._core.useCount == 1) { // This node defines the resource
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    this._core[key] = params[key];
                }
            }
            this._core.dirty = true;
        }
    };

    SceneJS.Renderer.prototype.setViewport = function (viewport) {
        this._core.viewport = viewport ? {
            x: viewport.x || 1,
            y: viewport.y || 1,
            width: viewport.width || 1000,
            height: viewport.height || 1000
        } : undefined;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getViewport = function () {
        return this._core.viewport ? {
            x: this._core.viewport.x,
            y: this._core.viewport.y,
            width: this._core.viewport.width,
            height: this._core.viewport.height
        } : undefined;
    };

    SceneJS.Renderer.prototype.setScissor = function (scissor) {
        this._core.scissor = scissor ? {
            x: scissor.x || 1,
            y: scissor.y || 1,
            width: scissor.width || 1000,
            height: scissor.height || 1000
        } : undefined;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getScissor = function () {
        return this._core.scissor ? {
            x: this._core.scissor.x,
            y: this._core.scissor.y,
            width: this._core.scissor.width,
            height: this._core.scissor.height
        } : undefined;
    };

    SceneJS.Renderer.prototype.setClear = function (clear) {
        this._core.clear = clear ? {
            r: clear.r || 0,
            g: clear.g || 0,
            b: clear.b || 0
        } : undefined;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getClear = function () {
        return this._core.clear ? {
            r: this._core.clear.r,
            g: this._core.clear.g,
            b: this._core.clear.b
        } : null;
    };

    SceneJS.Renderer.prototype.setEnableBlend = function (enableBlend) {
        this._core.enableBlend = enableBlend;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getEnableBlend = function () {
        return this._core.enableBlend;
    };

    SceneJS.Renderer.prototype.setBlendColor = function (color) {
        this._core.blendColor = color ? {
            r: color.r || 0,
            g: color.g || 0,
            b: color.b || 0,
            a: (color.a == undefined || color.a == null) ? 1 : color.a
        } : undefined;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getBlendColor = function () {
        return this._core.blendColor ? {
            r: this._core.blendColor.r,
            g: this._core.blendColor.g,
            b: this._core.blendColor.b,
            a: this._core.blendColor.a
        } : undefined;
    };

    SceneJS.Renderer.prototype.setBlendEquation = function (eqn) {
        this._core.blendEquation = eqn;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getBlendEquation = function () {
        return this._core.blendEquation;
    };

    SceneJS.Renderer.prototype.setBlendEquationSeparate = function (eqn) {
        this._core.blendEquationSeparate = eqn ? {
            rgb: eqn.rgb || "funcAdd",
            alpha: eqn.alpha || "funcAdd"
        } : undefined;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getBlendEquationSeparate = function () {
        return this._core.blendEquationSeparate ? {
            rgb: this._core.rgb,
            alpha: this._core.alpha
        } : undefined;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.setBlendFunc = function (funcs) {
        this._core.blendFunc = funcs ? {
            sfactor: funcs.sfactor || "srcAlpha",
            dfactor: funcs.dfactor || "one"
        } : undefined;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getBlendFunc = function () {
        return this._core.blendFunc ? {
            sfactor: this._core.sfactor,
            dfactor: this._core.dfactor
        } : undefined;
    };

    SceneJS.Renderer.prototype.setBlendFuncSeparate = function (eqn) {
        this._core.blendFuncSeparate = eqn ? {
            srcRGB: eqn.srcRGB || "zero",
            dstRGB: eqn.dstRGB || "zero",
            srcAlpha: eqn.srcAlpha || "zero",
            dstAlpha: eqn.dstAlpha || "zero"
        } : undefined;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getBlendFuncSeparate = function () {
        return this._core.blendFuncSeparate ? {
            srcRGB: this._core.blendFuncSeparate.srcRGB,
            dstRGB: this._core.blendFuncSeparate.dstRGB,
            srcAlpha: this._core.blendFuncSeparate.srcAlpha,
            dstAlpha: this._core.blendFuncSeparate.dstAlpha
        } : undefined;
    };

    SceneJS.Renderer.prototype.setEnableCullFace = function (enableCullFace) {
        this._core.enableCullFace = enableCullFace;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getEnableCullFace = function () {
        return this._core.enableCullFace;
    };


    SceneJS.Renderer.prototype.setCullFace = function (cullFace) {
        this._core.cullFace = cullFace;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getCullFace = function () {
        return this._core.cullFace;
    };

    SceneJS.Renderer.prototype.setEnableDepthTest = function (enableDepthTest) {
        this._core.enableDepthTest = enableDepthTest;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getEnableDepthTest = function () {
        return this._core.enableDepthTest;
    };

    SceneJS.Renderer.prototype.setDepthFunc = function (depthFunc) {
        this._core.depthFunc = depthFunc;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getDepthFunc = function () {
        return this._core.depthFunc;
    };

    SceneJS.Renderer.prototype.setEnableDepthMask = function (enableDepthMask) {
        this._core.enableDepthMask = enableDepthMask;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getEnableDepthMask = function () {
        return this._core.enableDepthMask;
    };

    SceneJS.Renderer.prototype.setClearDepth = function (clearDepth) {
        this._core.clearDepth = clearDepth;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getClearDepth = function () {
        return this._core.clearDepth;
    };

    SceneJS.Renderer.prototype.setDepthRange = function (range) {
        this._core.depthRange = range ? {
            zNear: (range.zNear == undefined || range.zNear == null) ? 0 : range.zNear,
            zFar: (range.zFar == undefined || range.zFar == null) ? 1 : range.zFar
        } : undefined;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getDepthRange = function () {
        return this._core.depthRange ? {
            zNear: this._core.depthRange.zNear,
            zFar: this._core.depthRange.zFar
        } : undefined;
    };

    SceneJS.Renderer.prototype.setFrontFace = function (frontFace) {
        this._core.frontFace = frontFace;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getFrontFace = function () {
        return this._core.frontFace;
    };

    SceneJS.Renderer.prototype.setLineWidth = function (lineWidth) {
        this._core.lineWidth = lineWidth;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getLineWidth = function () {
        return this._core.lineWidth;
    };

    SceneJS.Renderer.prototype.setEnableScissorTest = function (enableScissorTest) {
        this._core.enableScissorTest = enableScissorTest;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getEnableScissorTest = function () {
        return this._core.enableScissorTest;
    };

    SceneJS.Renderer.prototype.setClearStencil = function (clearStencil) {
        this._core.clearStencil = clearStencil;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getClearStencil = function () {
        return this._core.clearStencil;
    };

    SceneJS.Renderer.prototype.setColorMask = function (color) {
        this._core.colorMask = color ? {
            r: color.r || 0,
            g: color.g || 0,
            b: color.b || 0,
            a: (color.a == undefined || color.a == null) ? 1 : color.a
        } : undefined;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getColorMask = function () {
        return this._core.colorMask ? {
            r: this._core.colorMask.r,
            g: this._core.colorMask.g,
            b: this._core.colorMask.b,
            a: this._core.colorMask.a
        } : undefined;
    };

    SceneJS.Renderer.prototype._compile = function (ctx) {
        if (this._core.dirty) {
            this._core.props = createProps(this._core);
            this._core.dirty = false;
        }
        this._engine.display.renderer = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.renderer = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };
})();;(function () {

    var lookup = {
        less:"LESS",
        equal:"EQUAL",
        lequal:"LEQUAL",
        greater:"GREATER",
        notequal:"NOTEQUAL",
        gequal:"GEQUAL"
    };

    // The default state core singleton for {@link SceneJS.DepthBuf} nodes
    var defaultCore = {
        type:"depthBuffer",
        stateId:SceneJS._baseStateId++,
        enabled:true,
        clearDepth:1,
        depthFunc:null, // Lazy init depthFunc when we can get a context
        _depthFuncName:"less"
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            if (defaultCore.depthFunc === null) { // Lazy-init depthFunc now we can get a context
                defaultCore.depthFunc = params.engine.canvas.gl.LESS;
            }
            params.engine.display.depthBuffer = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which configures the depth buffer for its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.DepthBuf = SceneJS_NodeFactory.createNodeType("depthBuffer");

    SceneJS.DepthBuf.prototype._init = function (params) {

        if (params.enabled != undefined) {
            this.setEnabled(params.enabled);
        } else if (this._core.useCount == 1) { // This node defines the core
            this.setEnabled(true);
        }

        if (params.clearDepth != undefined) {
            this.setClearDepth(params.clearDepth);
        } else if (this._core.useCount == 1) {
            this.setClearDepth(1);
        }

        if (params.depthFunc != undefined) {
            this.setDepthFunc(params.depthFunc);
        } else if (this._core.useCount == 1) {
            this.setDepthFunc("less");
        }

        if (params.clear != undefined) {
            this.setClear(params.clear);
        } else if (this._core.useCount == 1) {
            this.setClear(true);
        }
    };

    /**
     * Enable or disable the depth buffer
     *
     * @param enabled Specifies whether depth buffer is enabled or not
     * @return {*}
     */
    SceneJS.DepthBuf.prototype.setEnabled = function (enabled) {
        if (this._core.enabled != enabled) {
            this._core.enabled = enabled;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Get whether or not the depth buffer is enabled
     *
     * @return Boolean
     */
    SceneJS.DepthBuf.prototype.getEnabled = function () {
        return this._core.enabled;
    };

    /**
     * Sets whether or not to clear the depth buffer before each render
     *
     * @param clear
     * @return {*}
     */
    SceneJS.DepthBuf.prototype.setClear = function (clear) {
        if (this._core.clear != clear) {
            this._core.clear = clear;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Get whether or not the depth buffer is cleared before each render
     *
     * @return Boolean
     */
    SceneJS.DepthBuf.prototype.getClear = function () {
        return this._core.clear;
    };
    
    /**
     * Specify the clear value for the depth buffer.
     * Initial value is 1, and the given value will be clamped to [0..1].
     * @param clearDepth
     * @return {*}
     */
    SceneJS.DepthBuf.prototype.setClearDepth = function (clearDepth) {
        if (this._core.clearDepth != clearDepth) {
            this._core.clearDepth = clearDepth;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Get the clear value for the depth buffer
     *
     * @return Number
     */
    SceneJS.DepthBuf.prototype.getClearDepth = function () {
        return this._core.clearDepth;
    };

    /**
     * Sets the depth comparison function.
     * Supported values are 'less', 'equal', 'lequal', 'greater', 'notequal' and 'gequal'
     * @param {String} depthFunc The depth comparison function
     * @return {*}
     */
    SceneJS.DepthBuf.prototype.setDepthFunc = function (depthFunc) {
        if (this._core._depthFuncName != depthFunc) {
            var enumName = lookup[depthFunc];
            if (enumName == undefined) {
                throw "unsupported value for 'clearFunc' attribute on depthBuffer node: '" + depthFunc
                    + "' - supported values are 'less', 'equal', 'lequal', 'greater', 'notequal' and 'gequal'";
            }
            this._core.depthFunc = this._engine.canvas.gl[enumName];
            this._core._depthFuncName = depthFunc;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Returns the depth comparison function
     * @return {*}
     */
    SceneJS.DepthBuf.prototype.getDepthFunc = function () {
        return this._core._depthFuncName;
    };

    SceneJS.DepthBuf.prototype._compile = function (ctx) {
        this._engine.display.depthBuffer = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.depthBuffer = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

})();;(function () {

    // The default state core singleton for {@link SceneJS.ColorBuffer} nodes
    var defaultCore = {
        type: "colorBuffer",
        stateId: SceneJS._baseStateId++,
        blendEnabled: false,
        colorMask: { r: true, g: true, b: true, a: true }
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.colorBuffer = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which configures the color buffer for its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.ColorBuffer = SceneJS_NodeFactory.createNodeType("colorBuffer");

    SceneJS.ColorBuffer.prototype._init = function (params) {
        if (params.blendEnabled != undefined) {
            this.setBlendEnabled(params.blendEnabled);
        } else if (this._core.useCount == 1) { // This node defines the core
            this.setBlendEnabled(false);
        }
        this.setColorMask(params);
    };

    /**
     * Enable or disable blending
     *
     * @param blendEnabled Specifies whether depth buffer is blendEnabled or not
     */
    SceneJS.ColorBuffer.prototype.setBlendEnabled = function (blendEnabled) {
        if (this._core.blendEnabled != blendEnabled) {
            this._core.blendEnabled = blendEnabled;
            this._engine.display.imageDirty = true;
        }
        this._engine.display.imageDirty = true;
    };

    /**
     * Get whether or not blending is enabled
     * @return Boolean
     */
    SceneJS.ColorBuffer.prototype.getBlendEnabled = function () {
        return this._core.blendEnabled;
    };

    /**
     * Enable and disable writing of buffer's color components.
     * Components default to true where not given.
     * @param mask The mask
     */
    SceneJS.ColorBuffer.prototype.setColorMask = function (mask) {
        this._core.colorMask =  {
            r: mask.r != undefined && mask.r != null ? mask.r : true,
            g: mask.g != undefined && mask.g != null ? mask.g : true,
            b: mask.b != undefined && mask.b != null ? mask.b : true,
            a: mask.a != undefined && mask.a != null ? mask.a : true
        };
        this._engine.display.imageDirty = true;
    };

    /**
     * Gets the color mask
     * @return {{}}
     */
    SceneJS.ColorBuffer.prototype.getColorMask = function () {
        return this._core.colorMask;
    };

    SceneJS.ColorBuffer.prototype._compile = function (ctx) {
        this._engine.display.colorBuffer = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.colorBuffer = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
        this._engine.display.imageDirty = true;
    };

})();;(function () {

    // The default state core singleton for {@link SceneJS.View} nodes
    var defaultCore = {
        type:"view",
        stateId:SceneJS._baseStateId++,
        scissorTestEnabled:false
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.view = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which configures view parameters such as depth range, scissor test and viewport
     * @extends SceneJS.Node
     * void depthRange(floatzNear, floatzFar)
     zNear: Clamped to the range 0 to 1 Must be <= zFar
     zFar: Clamped to the range 0 to 1.
     void scissor(int x, int y, long width, long height)
     void viewport(int x, int y, long width, long height)
     */
    SceneJS.View = SceneJS_NodeFactory.createNodeType("view");

    SceneJS.View.prototype._init = function (params) {

        if (params.scissorTestEnabled != undefined) {
            this.setScissorTestEnabled(params.scissorTestEnabled);
        } else if (this._core.useCount == 1) { // This node defines the core
            this.setScissorTestEnabled(false);
        }
    };

    /**
     * Enable or disables scissor test.
     *
     * When enabled, the scissor test will discards fragments that are outside the scissor box.
     *
     * Scissor test is initially disabled.
     *
     * @param scissorTestEnabled Specifies whether scissor test is enabled or not
     * @return {*}
     */
    SceneJS.View.prototype.setScissorTestEnabled = function (scissorTestEnabled) {
        if (this._core.scissorTestEnabled != scissorTestEnabled) {
            this._core.scissorTestEnabled = scissorTestEnabled;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Get whether or not scissor test is enabled.
     * Initial value will be false.
     *
     * @return Boolean
     */
    SceneJS.View.prototype.getScissorTestEnabled = function () {
        return this._core.scissorTestEnabled;
    };

    SceneJS.View.prototype._compile = function (ctx) {
        this._engine.display.view = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.view = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

})();;/**
 * @class The root node of a scenegraph
 * @extends SceneJS.Node
 *
 */

SceneJS.Scene = SceneJS_NodeFactory.createNodeType("scene");

SceneJS.Scene.prototype._init = function (params) {

    if (params.tagMask) {
        this.setTagMask(params.tagMask);
    }

    this._tagSelector = null;

    /**
     * Set false when canvas is to be transparent.
     * @type {boolean}
     */
    this.transparent = (params.transparent === true);
};


/**
 * Simulate a lost WebGL context for testing purposes.
 * Only works if the simulateWebGLLost was given as an option to {@link SceneJS.createScene}.
 */
SceneJS.Scene.prototype.loseWebGLContext = function () {
    this._engine.loseWebGLContext();
};


/**
 * Returns the HTML canvas for this scene
 * @return {HTMLCanvas} The canvas
 */
SceneJS.Scene.prototype.getCanvas = function () {
    return this._engine.canvas.canvas;
};

/**
 * Returns the WebGL context for this scene
 */
SceneJS.Scene.prototype.getGL = function () {
    return this._engine.canvas.gl;
};

/** Returns the Z-buffer depth in bits of the webgl context that this scene is to bound to.
 */
SceneJS.Scene.prototype.getZBufferDepth = function () {
    var gl = this._engine.canvas.gl;
    return gl.getParameter(gl.DEPTH_BITS);
};

/**
 * Set canvas size multiplier for supersample anti-aliasing
 */
SceneJS.Scene.prototype.setResolutionScaling = function (resolutionScaling) {
    return this._engine.canvas.setResolutionScaling(resolutionScaling);
};

/**
 * Sets a regular expression to select which of the scene subgraphs that are rooted by {@link SceneJS.Tag} nodes are included in scene renders
 * @param {String} [tagMask] Regular expression string to match on the tag attributes of {@link SceneJS.Tag} nodes. Nothing is selected when this is omitted.
 * @see #getTagMask
 * @see SceneJS.Tag
 */
SceneJS.Scene.prototype.setTagMask = function (tagMask) {
    tagMask = tagMask || "XXXXXXXXXXXXXXXXXXXXXXXXXX"; // HACK to select nothing by default
    if (!this._tagSelector) {
        this._tagSelector = {};
    }
    this._tagSelector.mask = tagMask;
    this._tagSelector.regex = tagMask ? new RegExp(tagMask) : null;
    this._engine.display.selectTags(this._tagSelector);
};

/**
 * Gets the regular expression which will select which of the scene subgraphs that are rooted by {@link SceneJS.Tag} nodes are included in scene renders
 * @see #setTagMask
 * @see SceneJS.Tag
 * @returns {String} Regular expression string that will be matched on the tag attributes of {@link SceneJS.Tag} nodes
 */
SceneJS.Scene.prototype.getTagMask = function () {
    return this._tagSelector ? this._tagSelector.mask : null;
};

/**
 * Sets the number of times this scene is drawn on each render.
 * <p>This is useful for when we need to do things like render for left and right eyes.
 * @param {Number} numPasses The number of times the scene is drawn on each frame.
 * @see #getTagMask
 * @see SceneJS.Tag
 */
SceneJS.Scene.prototype.setNumPasses = function (numPasses) {
    this._engine.setNumPasses(numPasses);
};

/**
 * Render a single frame if new frame pending, or force a new frame
 * Returns true if frame rendered
 */
SceneJS.Scene.prototype.renderFrame = function (params) {
    return this._engine.renderFrame(params);
};

/**
 * Force compilation of the scene graph.
 */
SceneJS.Scene.prototype.compile = function (params) {
    return this._engine.compile();
};

/**
 * Signals that a new frame will be needed
 * @param params
 */
SceneJS.Scene.prototype.needFrame = function () {
    this._engine.display.imageDirty = true;
};

/**
 * Starts the render loop for this scene
 */
SceneJS.Scene.prototype.start = function (params) {
    this._engine.start(params);
};

/**
 * Set refresh rate for the scene
 */
SceneJS.Scene.prototype.setFPS = function (fps) {
    this._engine.fps = fps;
};

/**
 * Pauses/unpauses current render loop that was started with {@link #start}. After this, {@link #isRunning} will return false.
 * @param {Boolean} doPause Indicates whether to pause or unpause the render loop
 */
SceneJS.Scene.prototype.pause = function (doPause) {
    this._engine.pause(doPause);
};

/**
 * Returns true if the scene's render loop is currently running.
 * @returns {Boolean} True when scene render loop is running
 */
SceneJS.Scene.prototype.isRunning = function () {
    return this._engine.running;
};

/**
 * Picks whatever geometry will be rendered at the given canvas coordinates.
 */
SceneJS.Scene.prototype.pick = function (canvasX, canvasY, options) {
    var result = this._engine.pick(canvasX, canvasY, options);
    this.renderFrame({force: true }); // HACK: canvas blanks after picking
    if (result) {
        this.publish("pick", result);
        return result;
    } else {
        this.publish("nopick");
    }
};


/**
 * Reads colors of pixels from the last rendered frame.
 *
 * <p>Call this method like this:</p>
 *
 * <pre>
 *
 * // Ignore transparent pixels (default is false)
 * var opaqueOnly = true;
 *
 * #readPixels([
 *      { x: 100, y: 22,  r: 0, g: 0, b: 0 },
 *      { x: 120, y: 82,  r: 0, g: 0, b: 0 },
 *      { x: 12,  y: 345, r: 0, g: 0, b: 0 }
 * ], 3, opaqueOnly);
 * </pre>
 *
 * Then the r,g,b components of the entries will be set to the colors at those pixels.
 */
SceneJS.Scene.prototype.readPixels = function (entries, size, opaqueOnly) {
    return this._engine.readPixels(entries, size, opaqueOnly);
};

/**
 * Scene node's destroy handler, called by {@link SceneJS_node#destroy}
 * @private
 */
SceneJS.Scene.prototype._destroy = function () {
    if (!this.destroyed) {
        delete SceneJS._engines[this.id];  // HACK: circular dependency
        SceneJS._engineIds.removeItem(this.id); // HACK: circular dependency
        this.destroyed = true;
    }
};

/**
 * Returns true if scene active, ie. not destroyed. A destroyed scene becomes active again
 * when you render it.
 */
SceneJS.Scene.prototype.isActive = function () {
    return !this._engine.destroyed;
};

/**
 * Stops current render loop that was started with {@link #start}. After this, {@link #isRunning} will return false.
 */
SceneJS.Scene.prototype.stop = function () {
    this._engine.stop();
};

/** Determines if node exists in this scene
 * @deprecated
 */
SceneJS.Scene.prototype.containsNode = function (nodeId) {
    return !!this._engine.findNode(nodeId);
};

/**
 * Finds nodes in this scene that have nodes IDs matching the given regular expression
 *
 * @param {String} nodeIdRegex Regular expression to match on node IDs
 * @return {[SceneJS.Node]} Array of nodes whose IDs match the given regex
 */
SceneJS.Scene.prototype.findNodes = function (nodeIdRegex) {
    return this._engine.findNodes(nodeIdRegex);
};

/**
 * Finds the node with the given ID in this scene
 * @deprecated
 * @param {String} nodeId Node ID
 * @param {Function} callback Callback through which we'll get the node asynchronously if it's being instantiated on-demand from a node type plugin
 * @return {SceneJS.Node} The node if found, else null
 */
SceneJS.Scene.prototype.findNode = function (nodeId, callback) {
    return this.getNode(nodeId, callback);
};

/**
 * @function Finds the node with the given ID in this scene
 * @param {String} nodeId Node ID
 * @param {Function} callback Callback through which we'll get the node asynchronously if it's being instantiated on-demand from a node type plugin
 * @return {SceneJS.Node} The node if found, else null
 */
SceneJS.Scene.prototype.getNode = function (nodeId, callback) {
    var node = this._engine.findNode(nodeId);
    if (node) {
        if (callback) {
            callback(node);
        }
        return node;
    } else {
        if (!callback) {
            return null;
        }
        // Subscribe to instantiation of node from plugin
        this.once("nodes/" + nodeId, callback);
    }
};

/**
 * Tests whether a node core of the given ID exists for the given node type
 * @param {String} type Node type
 * @param {String} coreId
 * @returns Boolean
 */
SceneJS.Scene.prototype.hasCore = function (type, coreId) {
    return this._engine.hasCore(type, coreId);
};

/**
 * Returns the current status of this scene.
 *
 * When the scene has been destroyed, the returned status will be a map like this:
 *
 * {
 *      destroyed: true
 * }
 *
 * Otherwise, the status will be:
 *
 * {
 *      numTasks: Total number of asset loads (eg. texture, geometry stream etc.) currently in progress for this scene
 * }
 *
 */
SceneJS.Scene.prototype.getStatus = function () {
    var sceneStatus = SceneJS_sceneStatusModule.sceneStatus[this.id];
    if (!sceneStatus) {
        return {
            destroyed: true
        };
    }
    return SceneJS._shallowClone(sceneStatus);
};
;new (function() {

    /**
     * The default state core singleton for {@link SceneJS.Shader} nodes
     */
    var defaultCore = {
        type: "shader",
        stateId: SceneJS._baseStateId++,
        hash: "",
        empty: true,
        shader : {}
    };

    var idStack = [];
    var shaderVertexCodeStack = [];
    var shaderVertexHooksStack = [];
    var shaderFragmentCodeStack = [];
    var shaderFragmentHooksStack = [];
    var shaderParamsStack = [];

    var stackLen = 0;

    var dirty = true;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {

                params.engine.display.shader = defaultCore;

                stackLen = 0;

                dirty = true;
            });

    SceneJS_events.addListener(
            SceneJS_events.OBJECT_COMPILING,
            function(params) {
                if (dirty) {

                    if (stackLen > 0) {

                        var core = {
                            type: "shader",
                            stateId: idStack[stackLen - 1],
                            hash: idStack.slice(0, stackLen).join("."),

                            shaders: {
                                fragment: {
                                    code: shaderFragmentCodeStack.slice(0, stackLen).join(""),
                                    hooks: combineMapStack(shaderFragmentHooksStack)
                                },
                                vertex: {
                                    code: shaderVertexCodeStack.slice(0, stackLen).join(""),
                                    hooks: combineMapStack(shaderVertexHooksStack)
                                }
                            },

                            paramsStack: shaderParamsStack.slice(0, stackLen)
                        };

                        params.display.shader = core;

                    } else {

                        params.display.shader = defaultCore;
                    }

                    dirty = false;
                }
            });

    function combineMapStack(maps) {
        var map1;
        var map2 = {};
        var name;
        for (var i = 0; i < stackLen; i++) {
            map1 = maps[i];
            for (name in map1) {
                if (map1.hasOwnProperty(name)) {
                    map2[name] = map1[name];
                }
            }
        }
        return map2;
    }

    function pushHooks(hooks, hookStacks) {
        var stack;
        for (var key in hooks) {
            if (hooks.hasOwnProperty(key)) {
                stack = hookStacks[key];
                if (!stack) {
                    stack = hookStacks[key] = [];
                }
                stack.push(hooks[key]);
            }
        }
    }

    SceneJS.Shader = SceneJS_NodeFactory.createNodeType("shader");

    SceneJS.Shader.prototype._init = function(params) {
        if (this._core.useCount == 1) { // This node is the resource definer
            this._setShaders(params.shaders);
            this.setParams(params.params);
        }
    };

    SceneJS.Shader.prototype._setShaders = function(shaders) {
        shaders = shaders || [];
        this._core.shaders = {};
        var shader;

        for (var i = 0, len = shaders.length; i < len; i++) {
            shader = shaders[i];

            if (!shader.stage) {
                throw SceneJS_error.fatalError(
                        SceneJS.errors.ILLEGAL_NODE_CONFIG,
                        "shader 'stage' attribute expected");
            }

            var code;
            if (shader.code) {
                if (SceneJS._isArray(shader.code)) {
                    code = shader.code.join("");
                } else {
                    code = shader.code;
                }
            }

            this._core.shaders[shader.stage] = {
                code: code,
                hooks: shader.hooks
            };
        }
    };

    SceneJS.Shader.prototype.setParams = function(params) {
        params = params || {};
        var coreParams = this._core.params;
        if (!coreParams) {
            coreParams = this._core.params = {};
        }
        for (var name in params) {
            if (params.hasOwnProperty(name)) {
                coreParams[name] = params[name];
            }
        }
        this._engine.display.imageDirty = true;
    };

    SceneJS.Shader.prototype.getParams = function() {
        var coreParams = this._core.params;
        if (!coreParams) {
            return {};
        }
        var params = {};
        for (var name in coreParams) {
            if (coreParams.hasOwnProperty(name)) {
                params[name] = coreParams[name];
            }
        }
        return params;
    };

    SceneJS.Shader.prototype._compile = function(ctx) {

        idStack[stackLen] = this._core.coreId; // Draw list node tied to core, not node

        var shaders = this._core.shaders;

        var fragment = shaders.fragment || {};
        var vertex = shaders.vertex || {};

        shaderFragmentCodeStack[stackLen] = fragment.code || "";
        shaderFragmentHooksStack[stackLen] = fragment.hooks || {};

        shaderVertexCodeStack[stackLen] = vertex.code || "";
        shaderVertexHooksStack[stackLen] = vertex.hooks || {};

        shaderParamsStack[stackLen] = this._core.params || {};

        stackLen++;
        dirty = true;

        this._compileNodes(ctx);

        stackLen--;
        dirty = true;
    };

})();;new (function() {

    /**
     * The default state core singleton for {@link SceneJS.ShaderParams} nodes
     */
    var defaultCore = {
        type: "shaderParams",
        stateId: SceneJS._baseStateId++,
        empty: true
    };

    var idStack = [];
    var shaderParamsStack = [];
    var stackLen = 0;
    var dirty;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {

                params.engine.display.shaderParams = defaultCore;

                stackLen = 0;
                dirty = true;
            });

    SceneJS_events.addListener(
            SceneJS_events.OBJECT_COMPILING,
            function(params) {
                if (dirty) {

                    if (stackLen > 0) {
                        var core = {
                            type: "shaderParams",
                            stateId: idStack[stackLen - 1],
                            paramsStack: shaderParamsStack.slice(0, stackLen)
                        };
                        params.display.shaderParams = core;

                    } else {
                        params.display.shaderParams = defaultCore;
                    }

                    dirty = false;
                }
            });

    SceneJS.ShaderParams = SceneJS_NodeFactory.createNodeType("shaderParams");

    SceneJS.ShaderParams.prototype._init = function(params) {
        if (this._core.useCount == 1) { // This node is the resource definer
            this.setParams(params.params);
        }
    };

    SceneJS.ShaderParams.prototype.setParams = function(params) {
        params = params || {};
        var core = this._core;
        if (!core.params) {
            core.params = {};
        }
        for (var name in params) {
            if (params.hasOwnProperty(name)) {
                core.params[name] = params[name];
            }
        }
        this._engine.display.imageDirty = true;
    };

    SceneJS.ShaderParams.prototype.getParams = function() {
        var coreParams = this._core.params;
        if (!coreParams) {
            return {};
        }
        var params = {};
        for (var name in coreParams) {
            if (coreParams.hasOwnProperty(name)) {
                params[name] = coreParams[name];
            }
        }
        return params;
    };

    SceneJS.ShaderParams.prototype._compile = function(ctx) {

        idStack[stackLen] = this._core.coreId; // Tie draw list state to core, not to scene node
        shaderParamsStack[stackLen] = this._core.params;
        stackLen++;
        dirty = true;

        this._compileNodes(ctx);

        stackLen--;
        dirty = true;
    };

})();;(function () {

    // The default state core singleton for {@link SceneJS.Line} nodes
    var defaultCore = {
        type:"style",
        stateId:SceneJS._baseStateId++,
        lineWidth:1.0
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.style = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which configures style parameters such as line width for subnodes
     * @extends SceneJS.Node
     */
    SceneJS.Style = SceneJS_NodeFactory.createNodeType("style");

    SceneJS.Style.prototype._init = function (params) {
        if (params.lineWidth != undefined) {
            this.setLineWidth(params.lineWidth);
        }
    };

    /**
     * Sets the line width
     *
     * Line width is initially 1.
     *
     * @param lineWidth The line width
     * @return {*}
     */
    SceneJS.Style.prototype.setLineWidth = function (lineWidth) {
        if (this._core.lineWidth != lineWidth) {
            this._core.lineWidth = lineWidth;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    /**
     * Gets the line width
     * Initial value will be 1.
     *
     * @return Boolean
     */
    SceneJS.Style.prototype.getLineWidth = function () {
        return this._core.lineWidth;
    };

    SceneJS.Style.prototype._compile = function (ctx) {
        this._engine.display.style = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.style = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

})();;(function() {

    /**
     * The default state core singleton for {@link SceneJS.Tag} nodes
     */
    var defaultCore = {
        type: "tag",
        stateId: SceneJS._baseStateId++,
        tag : null
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {
                params.engine.display.tag = defaultCore;
                stackLen = 0;
            });

    /**
     * @class Scene graph node which assigns a symbolic tag name to the {@link SceneJS.Geometry} nodes in its subgraph.
     * The subgraph can then be included or excluded from scene rendering using {@link SceneJS.Scene#setTagMask}.
     * @extends SceneJS.Node
     */
    SceneJS.Tag = SceneJS_NodeFactory.createNodeType("tag");

    SceneJS.Tag.prototype._init = function(params) {
        if (this._core.useCount == 1) { // This node defines the resource
            if (!params.tag) {
                throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "tag node attribute missing : 'tag'");
            }
            this.setTag(params.tag);
        }
    };

    SceneJS.Tag.prototype.setTag = function(tag) {

        var core = this._core;

        core.tag = tag;
        core.pattern = null;    // To be recomputed
        core.matched = false;   // To be rematched

        this._engine.display.drawListDirty = true;
    };

    SceneJS.Tag.prototype.getTag = function() {
        return this._core.tag;
    };

    SceneJS.Tag.prototype._compile = function(ctx) {
        this._engine.display.tag = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.tag = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };
})();;/**
 * @class Scene graph node which defines textures to apply to the objects in its subgraph
 * <p>This is the deprecated node type from SceneJS v3.2, which has been replaced by the "texture" node in ./texture.js</p>
 * @extends SceneJS.Node
 */
new (function () {

    // The default state core singleton for {@link SceneJS.Texture} nodes
    var defaultCore = {
        type: "texture",
        stateId: SceneJS._baseStateId++,
        empty: true,
        hash: ""
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.texture = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which defines one or more textures to apply to the {@link SceneJS.Geometry} nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Texture = SceneJS_NodeFactory.createNodeType("_texture");

    SceneJS.Texture.prototype._init = function (params) {

        if (this._core.useCount == 1) { // This node is the resource definer

            this._core.layers = [];
            this._core.params = {};

            // By default, wait for texture to load before building subgraph
            var waitForLoad = params.waitForLoad == undefined ? true : params.waitForLoad;

            if (!params.layers) {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.NODE_CONFIG_EXPECTED,
                    "texture layers missing");
            }

            if (!SceneJS._isArray(params.layers)) {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.NODE_CONFIG_EXPECTED,
                    "texture layers should be an array");
            }

            var layerParams;
            var gl = this._engine.canvas.gl;

            for (var i = 0; i < params.layers.length; i++) {

                layerParams = params.layers[i];

                if (!layerParams.source && !layerParams.uri && !layerParams.src && !layerParams.colorTarget && !layerParams.video) {

                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "texture layer " + i + "  has no uri, src, source, colorTarget, video or canvasId specified");
                }

                if (layerParams.applyFrom) {
                    if (layerParams.applyFrom != "uv" &&
                        layerParams.applyFrom != "uv2" &&
                        layerParams.applyFrom != "normal" &&
                        layerParams.applyFrom != "geometry") {
                        throw SceneJS_error.fatalError(
                            SceneJS.errors.NODE_CONFIG_EXPECTED,
                            "texture layer " + i + "  applyFrom value is unsupported - " +
                            "should be either 'uv', 'uv2', 'normal' or 'geometry'");
                    }
                }

                if (layerParams.applyTo) {
                    if (layerParams.applyTo != "baseColor" && // Colour map (deprecated)
                        layerParams.applyTo != "color" && // Colour map
                        layerParams.applyTo != "specular" && // Specular map
                        layerParams.applyTo != "emit" && // Emission map
                        layerParams.applyTo != "alpha" && // Alpha map
                        layerParams.applyTo != "normals" && // Normal map
                        layerParams.applyTo != "shine") { // Shininess map
                        throw SceneJS_error.fatalError(
                            SceneJS.errors.NODE_CONFIG_EXPECTED,
                            "texture layer " + i + " applyTo value is unsupported - " +
                            "should be either 'color', 'baseColor', 'specular' or 'normals'");
                    }
                }

                if (layerParams.blendMode) {
                    if (layerParams.blendMode != "add" && layerParams.blendMode != "multiply" && layerParams.blendMode != "mix") {
                        throw SceneJS_error.fatalError(
                            SceneJS.errors.NODE_CONFIG_EXPECTED,
                            "texture layer " + i + " blendMode value is unsupported - " +
                            "should be either 'add', 'multiply' or 'mix'");
                    }
                }

                if (layerParams.applyTo == "color") {
                    layerParams.applyTo = "baseColor";
                }

                var layer = SceneJS._apply(layerParams, {
                    waitForLoad: waitForLoad,
                    texture: null,
                    applyFrom: layerParams.applyFrom || "uv",
                    applyTo: layerParams.applyTo || "baseColor",
                    blendMode: layerParams.blendMode || "multiply",
                    blendFactor: (layerParams.blendFactor != undefined && layerParams.blendFactor != null) ? layerParams.blendFactor : 1.0,
                    translate: {x: 0, y: 0},
                    scale: {x: 1, y: 1},
                    rotate: {z: 0.0}
                });

                this._core.layers.push(layer);

                this._setLayerTransform(layerParams, layer);

                if (layer.colorTarget) { // Create from a colorTarget node preceeding this texture in the scene graph
                    var targetNode = this._engine.findNode(layer.colorTarget);
                    if (targetNode && targetNode.type == "colorTarget") {
                        layer.texture = targetNode._core.colorTarget.getTexture(); // TODO: what happens when the colorTarget is destroyed?
                    }
                } else { // Create from texture node's layer configs
                    this._loadLayerTexture(gl, layer);
                }

                if (layer.image && layer.applyTo == "baseColor" && !this._imagePublished) {
                    this.publish("image", layer.image);
                    this._imagePublished = true;
                }
            }

            var self = this;

            // WebGL restored handler - rebuilds the texture layers
            this._core.webglRestored = function () {

                var layers = self._core.layers;
                var gl = self._engine.canvas.gl;

                for (var i = 0, len = layers.length; i < len; i++) {
                    self._loadLayerTexture(gl, layers[i]);
                }
            };
        }
    };

    SceneJS.Texture.prototype._loadLayerTexture = function (gl, layer) {

        var self = this;

        var sourceConfigs = layer.source;

        if (sourceConfigs) {

            if (!sourceConfigs.type) {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "texture layer config expected: source.type");
            }

            SceneJS.Plugins.getPlugin(
                "texture",
                sourceConfigs.type,
                function (plugin) {

                    if (!plugin.getSource) {
                        throw SceneJS_error.fatalError(
                            SceneJS.errors.PLUGIN_INVALID,
                            "texture: 'getSource' method missing on plugin for texture source type '" + sourceConfigs.type + "'.");
                    }

                    var source = plugin.getSource({gl: gl});

                    if (!source.subscribe) {
                        throw SceneJS_error.fatalError(
                            SceneJS.errors.PLUGIN_INVALID,
                            "texture: 'subscribe' method missing on plugin for texture source type '" + sourceConfigs.type + "'");
                    }

                    var taskId = SceneJS_sceneStatusModule.taskStarted(self, "Loading texture");

                    source.subscribe(// Get notification whenever source updates the texture
                        (function () {
                            var loaded = false;
                            return function (texture) {
                                if (!loaded) { // Texture first initialised - create layer
                                    loaded = true;
                                    self._setLayerTexture(gl, layer, texture);
                                    SceneJS_sceneStatusModule.taskFinished(taskId);
                                } else { // Texture updated - layer already has the handle to it, so just signal a redraw
                                    self._engine.display.imageDirty = true;
                                }
                            };
                        })());

                    if (source.configure) {
                        source.configure(sourceConfigs); // Configure the source, which may cause it to update the texture
                    }

                    layer._source = source;
                });

        } else {

            /* Load from URL
             */

            var src = layer.uri || layer.src;
            var preloadSrc = layer.preloadURI || layer.preloadSrc;
            var preloadColor = layer.preloadColor || {r: 0.57735, g: 0.57735, b: 0.57735};
            preloadColor.a = preloadColor.a === undefined ? 1 : preloadColor.a;

            preloadColor = new Uint8Array([
                Math.floor(preloadColor.r * 255),
                Math.floor(preloadColor.g * 255),
                Math.floor(preloadColor.b * 255),
                Math.floor(preloadColor.a * 255)
            ]);

            var taskId = SceneJS_sceneStatusModule.taskStarted(this, "Loading texture");

            var texture = gl.createTexture();

            var loaded = false;
            var taskFinished = false;

            gl.bindTexture(gl.TEXTURE_2D, texture);

            if (layer.image) {
                self._setTextureImage(gl, texture, layer.image);
                self._setLayerTexture(gl, layer, texture);
                SceneJS_sceneStatusModule.taskFinished(taskId);
                return;
            }

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, preloadColor);
            self._setLayerTexture(gl, layer, texture);

            if (preloadSrc) {
                var preloadImage = new Image();

                preloadImage.onload = function () {
                    if (!loaded) {
                        self._setTextureImage(gl, texture, preloadImage);
                        self._setLayerTexture(gl, layer, texture);
                        SceneJS_sceneStatusModule.taskFinished(taskId);
                        taskFinished = true;
                    }
                };

                self._fetchImage(preloadImage, preloadSrc);
            }

            var image = new Image();

            image.onload = function () {
                self._setTextureImage(gl, texture, image);
                self._setLayerTexture(gl, layer, texture);
                if (!taskFinished) {
                    SceneJS_sceneStatusModule.taskFinished(taskId);
                }
                layer.image = image;
                loaded = true;

                self.publish("image", image);
            };

            image.onerror = function () {
                SceneJS_sceneStatusModule.taskFailed(taskId);
            };

            self._fetchImage(image, src);
        }
    };

    SceneJS.Texture.prototype._fetchImage = function (image, src) {
        if (src.indexOf("data") == 0) {  // Image data
            image.src = src;
        } else { // Image file
            image.crossOrigin = "Anonymous";
            image.src = src;
        }
    };

    SceneJS.Texture.prototype._setTextureImage = function (gl, texture, image) {
        gl.bindTexture(gl.TEXTURE_2D, texture);

        var maxTextureSize = SceneJS_configsModule.configs.maxTextureSize;
        if (maxTextureSize) {
            image = SceneJS._webgl.clampImageSize(image, maxTextureSize);
        }

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._ensureImageSizePowerOfTwo(image));
        this._engine.display.imageDirty = true;
        return image;
    };

    SceneJS.Texture.prototype._ensureImageSizePowerOfTwo = function (image) {

        if (!this._isPowerOfTwo(image.width) || !this._isPowerOfTwo(image.height)) {

            var canvas = document.createElement("canvas");
            canvas.width = this._nextHighestPowerOfTwo(image.width);
            canvas.height = this._nextHighestPowerOfTwo(image.height);

            var ctx = canvas.getContext("2d");

            ctx.drawImage(image,
                0, 0, image.width, image.height,
                0, 0, canvas.width, canvas.height);

            image = canvas;
            image.crossOrigin = "";
        }
        return image;
    };

    SceneJS.Texture.prototype._isPowerOfTwo = function (x) {
        return (x & (x - 1)) == 0;
    };

    SceneJS.Texture.prototype._nextHighestPowerOfTwo = function (x) {
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
    };

    SceneJS.Texture.prototype._setLayerTexture = function (gl, layer, texture) {

        layer.texture = new SceneJS._webgl.Texture2D(gl, {
            texture: texture, // WebGL texture object
            minFilter: this._getGLOption("minFilter", gl, layer, gl.LINEAR_MIPMAP_NEAREST),
            magFilter: this._getGLOption("magFilter", gl, layer, gl.LINEAR),
            wrapS: this._getGLOption("wrapS", gl, layer, gl.REPEAT),
            wrapT: this._getGLOption("wrapT", gl, layer, gl.REPEAT),
            isDepth: this._getOption(layer.isDepth, false),
            depthMode: this._getGLOption("depthMode", gl, layer, gl.LUMINANCE),
            depthCompareMode: this._getGLOption("depthCompareMode", gl, layer, gl.COMPARE_R_TO_TEXTURE),
            depthCompareFunc: this._getGLOption("depthCompareFunc", gl, layer, gl.LEQUAL),
            flipY: this._getOption(layer.flipY, true),
            width: this._getOption(layer.width, 1),
            height: this._getOption(layer.height, 1),
            internalFormat: this._getGLOption("internalFormat", gl, layer, gl.LEQUAL),
            sourceFormat: this._getGLOption("sourceType", gl, layer, gl.ALPHA),
            sourceType: this._getGLOption("sourceType", gl, layer, gl.UNSIGNED_BYTE),
            update: null
        });

        if (this.destroyed) { // Node was destroyed while loading
            layer.texture.destroy();
        }

        this._engine.display.imageDirty = true;
    };

    SceneJS.Texture.prototype._getGLOption = function (name, gl, layer, defaultVal) {
        var value = layer[name];
        if (value == undefined) {
            return defaultVal;
        }
        var glName = SceneJS._webgl.enumMap[value];
        if (glName == undefined) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Unrecognised value for texture node property '" + name + "' value: '" + value + "'");
        }
        var glValue = gl[glName];
        //                if (!glValue) {
        //                    throw new SceneJS.errors.WebGLUnsupportedNodeConfigException(
        //                            "This browser's WebGL does not support value of SceneJS.texture node property '" + name + "' value: '" + value + "'");
        //                }
        return glValue;
    };

    SceneJS.Texture.prototype._getOption = function (value, defaultVal) {
        return (value == undefined) ? defaultVal : value;
    };

    /**
     * Set some writeable properties on a layer
     */
    SceneJS.Texture.prototype.setLayer = function (cfg) {

        if (cfg.index == undefined || cfg.index == null) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Invalid texture set layer argument: index null or undefined");
        }

        if (cfg.index < 0 || cfg.index >= this._core.layers.length) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Invalid texture set layer argument: index out of range (" + this._core.layers.length + " layers defined)");
        }

        this._setLayer(parseInt(cfg.index), cfg);

        this._engine.display.imageDirty = true;
    };

    /**
     * Set some writeable properties on multiple layers
     */
    SceneJS.Texture.prototype.setLayers = function (layers) {
        var indexNum;
        for (var index in layers) {
            if (layers.hasOwnProperty(index)) {
                if (index != undefined || index != null) {
                    indexNum = parseInt(index);
                    if (indexNum < 0 || indexNum >= this._core.layers.length) {
                        throw SceneJS_error.fatalError(
                            SceneJS.errors.ILLEGAL_NODE_CONFIG,
                            "Invalid texture set layer argument: index out of range (" + this._core.layers.length + " layers defined)");
                    }
                    this._setLayer(indexNum, layers[index] || {});
                }
            }
        }
        this._engine.display.imageDirty = true;
    };

    SceneJS.Texture.prototype._setLayer = function (index, cfg) {

        cfg = cfg || {};

        var layer = this._core.layers[index];

        if (cfg.blendFactor != undefined && cfg.blendFactor != null) {
            layer.blendFactor = cfg.blendFactor;
        }

        if (cfg.source) {
            var source = layer._source;
            if (source && source.configure) {
                source.configure(cfg.source);
            }
        }

        if (cfg.translate || cfg.rotate || cfg.scale) {
            this._setLayerTransform(cfg, layer);
        }
    };

    SceneJS.Texture.prototype._setLayerTransform = function (cfg, layer) {

        var matrix;
        var t;

        if (cfg.translate) {
            var translate = cfg.translate;
            if (translate.x != undefined) {
                layer.translate.x = translate.x;
            }
            if (translate.y != undefined) {
                layer.translate.y = translate.y;
            }
            matrix = SceneJS_math_translationMat4v([translate.x || 0, translate.y || 0, 0]);
        }

        if (cfg.scale) {
            var scale = cfg.scale;
            if (scale.x != undefined) {
                layer.scale.x = scale.x;
            }
            if (scale.y != undefined) {
                layer.scale.y = scale.y;
            }
            t = SceneJS_math_scalingMat4v([scale.x || 1, scale.y || 1, 1]);
            matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
        }

        if (cfg.rotate) {
            var rotate = cfg.rotate;
            if (rotate.z != undefined) {
                layer.rotate.z = rotate.z || 0;
            }
            t = SceneJS_math_rotationMat4v(rotate.z * 0.0174532925, [0, 0, 1]);
            matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
        }

        if (matrix) {
            layer.matrix = matrix;
            if (!layer.matrixAsArray) {
                layer.matrixAsArray = new Float32Array(layer.matrix);
            } else {
                layer.matrixAsArray.set(layer.matrix);
            }

            layer.matrixAsArray = new Float32Array(layer.matrix); // TODO - reinsert into array
        }
    };

    SceneJS.Texture.prototype._compile = function (ctx) {
        if (!this._core.hash) {
            this._makeHash();
        }
        this._engine.display.texture = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.texture = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

    SceneJS.Texture.prototype._makeHash = function () {
        var core = this._core;
        var hash;
        if (core.layers && core.layers.length > 0) {
            var layers = core.layers;
            var hashParts = [];
            var texLayer;
            for (var i = 0, len = layers.length; i < len; i++) {
                texLayer = layers[i];
                hashParts.push("/");
                hashParts.push(texLayer.applyFrom);
                hashParts.push("/");
                hashParts.push(texLayer.applyTo);
                hashParts.push("/");
                hashParts.push(texLayer.blendMode);
                if (texLayer.matrix) {
                    hashParts.push("/anim");
                }
            }
            hash = hashParts.join("");
        } else {
            hash = "";
        }
        if (core.hash != hash) {
            core.hash = hash;
        }
    };

    SceneJS.Texture.prototype._destroy = function () {
        if (this._core.useCount == 1) { // Last resource user
            var layers = this._core.layers;
            var layer;
            var source;
            for (var i = 0, len = layers.length; i < len; i++) {
                layer = layers[i];
                if (layer.texture) {
                    layer.texture.destroy();
                }
                source = layer._source;
                if (source && source.destroy) {
                    source.destroy();
                }
            }
        }
    };

})();;/**
 * @class Scene graph node which defines textures to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
new (function () {

    // The default state core singleton for {@link SceneJS.Texture} nodes
    var defaultCore = {
        type: "texture",
        stateId: SceneJS._baseStateId++,
        empty: true,
        hash: ""
    };

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.texture = defaultCore;
            stackLen = 0;
        });

    var coreStack = [];
    var stackLen = 0;

    /**
     * @class Scene graph node which defines one or more textures to apply to the {@link SceneJS.Geometry} nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.TextureMap = SceneJS_NodeFactory.createNodeType("texture");

    SceneJS.TextureMap.prototype._init = function (params) {

        var self = this;

        if (this._core.useCount == 1) { // This node is the resource definer

            var applyFrom = params.applyFrom || "uv";
            if (applyFrom.substring(0,2) !== "uv") {
                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "texture applyFrom value is unsupported - should be 'uv<index>'");
            }
            var uvLayerIdx = 0;
            if (applyFrom !== "uv") {
                uvLayerIdx = applyFrom.substring(2);
                if (isNaN(uvLayerIdx)) {
                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "texture applyFrom value invalid - should be 'uv<index>'");
                }
            }

            if (params.applyTo) {

                var applyTo = params.applyTo;

                if (applyTo != "baseColor" && // Colour map (deprecated)
                    applyTo != "color" && // Colour map
                    applyTo != "specular" && // Specular map
                    applyTo != "emit" && // Emission map
                    applyTo != "alpha" && // Alpha map
                    applyTo != "normals" && // Normal map
                    applyTo != "shine") { // Shininess map

                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "texture applyTo value is unsupported - " +
                        "should be either 'color', 'baseColor', 'specular' or 'normals'");
                }
            }

            if (params.blendMode) {
                if (params.blendMode != "add" && params.blendMode != "multiply") {
                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "texture layer blendMode value is unsupported - " +
                        "should be either 'add' or 'multiply'");
                }
            }

            if (params.applyTo == "color") {
                params.applyTo = "baseColor";
            }

            SceneJS._apply({
                    waitForLoad: params.waitForLoad == undefined ? true : params.waitForLoad,
                    texture: null,
                    uvLayerIdx: uvLayerIdx,
                    isNormalMap: params.applyTo === "normals",
                    applyFrom: applyFrom,
                    applyTo: !!params.applyTo ? params.applyTo : "baseColor",
                    blendMode: !!params.blendMode ? params.blendMode : "multiply",
                    blendFactor: (params.blendFactor != undefined && params.blendFactor != null) ? params.blendFactor : 1.0,
                    translate: params.translate ? SceneJS._apply(params.translate, { x: 0, y: 0}) : {x: 0, y: 0},
                    scale: params.scale ? SceneJS._apply(params.scale, { x: 1, y: 1}) : {x: 1, y: 1},
                    rotate: params.rotate || 0,
                    matrix: null,
                    _matrixDirty: true,
                    buildMatrix: buildMatrix
                },
                this._core);

            buildMatrix.call(this._core);


            if (params.src) { // Load from URL
                this._initTexture(params.preloadColor);
                this._core.src = params.src;
                this._loadTexture(params.src, params.preloadSrc);

            } else if (params.image) { // Create from image
                this._initTexture(params.preloadColor);
                this._core.image = params.image;
                this._setTextureImage(params.image);

            } else if (params.target) { // Render to this texture
                this.getScene().getNode(params.target,
                    function (target) {
                        self.setTarget(target);
                    });
            }

            this._core.webglRestored = function () {

                if (self._core.image) {
                    self._initTexture(params.preloadColor);
                    self._setTextureImage(self._core.image);

                } else if (self._core.src) {
                    self._initTexture(params.preloadColor);
                    self._loadTexture(self._core.src);

                } else if (self._core.target) {
//                    self.getScene().getNode(params.target,
//                        function (target) {
//                            self.setTarget(self._core.target);
//                        });
                }
            };
        }
    };

    function buildMatrix() {
        var matrix;
        var t;
        if (this.translate.x != 0 || this.translate.y != 0) {
            matrix = SceneJS_math_translationMat4v([ this.translate.x || 0, this.translate.y || 0, 0]);
        }
        if (this.scale.x != 1 || this.scale.y != 1) {
            t = SceneJS_math_scalingMat4v([ this.scale.x || 1, this.scale.y || 1, 1]);
            matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
        }
        if (this.rotate != 0) {
            t = SceneJS_math_rotationMat4v(this.rotate * 0.0174532925, [0, 0, 1]);
            matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
        }
        if (matrix) {
            this.matrix = matrix;
            if (!this.matrixAsArray) {
                this.matrixAsArray = new Float32Array(this.matrix);
            } else {
                this.matrixAsArray.set(this.matrix);
            }
        }
        this._matrixDirty = false;
    }

    SceneJS.TextureMap.prototype._initTexture = function (preloadColor) {
        var gl = this._engine.canvas.gl;

        preloadColor = preloadColor || { r: 0.57735, g: 0.57735, b: 0.57735 };
        preloadColor.a = preloadColor.a === undefined ? 1 : preloadColor.a;

        preloadColor = new Uint8Array([
            Math.floor(preloadColor.r * 255),
            Math.floor(preloadColor.g * 255),
            Math.floor(preloadColor.b * 255),
            Math.floor(preloadColor.a * 255)
        ]);

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, preloadColor);
        this._setCoreTexture(texture);
    };

    SceneJS.TextureMap.prototype._loadTexture = function (src, preloadSrc) {
        var self = this;
        var taskId = SceneJS_sceneStatusModule.taskStarted(this, "Loading texture");
        var image = new Image();
        var loaded = false;
        var taskFinished = false;

        if (preloadSrc) {
            var preloadImage = new Image();

            preloadImage.onload = function () {
                if (!loaded) {
                    self._setTextureImage(preloadImage);
                    SceneJS_sceneStatusModule.taskFinished(taskId);
                    taskFinished = true;
                    self._engine.display.imageDirty = true;
                }
            };

            this._fetchImage(preloadImage, preloadSrc);
        }

        image.onload = function () {
            self._setTextureImage(image);
            if (!taskFinished) {
                SceneJS_sceneStatusModule.taskFinished(taskId);
            }
            loaded = true;
            self._engine.display.imageDirty = true;
        };
        image.onerror = function () {
            SceneJS_sceneStatusModule.taskFailed(taskId);
        };
        this._fetchImage(image, src);
    };

    SceneJS.TextureMap.prototype._fetchImage = function (image, src) {
        if (src.indexOf("data") == 0) {  // Image data
            image.src = src;
        } else { // Image file
            image.crossOrigin = "Anonymous";
            image.src = src;
        }
    };

    SceneJS.TextureMap.prototype._setTextureImage = function (image) {

        var gl = this._engine.canvas.gl;
        var core = this._core;
        var texture = core.texture && core.texture.texture ? core.texture.texture : gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);

        var maxTextureSize = SceneJS_configsModule.configs.maxTextureSize;
        if (maxTextureSize) {
            image = SceneJS._webgl.clampImageSize(image, maxTextureSize);
        }

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, SceneJS._webgl.ensureImageSizePowerOfTwo(image));

        core.image = image;

        this._setCoreTexture(texture);
    };

    SceneJS.TextureMap.prototype._setCoreTexture = function (texture) {
        var gl = this._engine.canvas.gl;

        this._core.texture = new SceneJS._webgl.Texture2D(gl, {
            texture: texture, // WebGL texture object
            minFilter: this._getGLOption("minFilter", gl.LINEAR_MIPMAP_NEAREST),
            magFilter: this._getGLOption("magFilter", gl.LINEAR),
            wrapS: this._getGLOption("wrapS", gl.REPEAT),
            wrapT: this._getGLOption("wrapT", gl.REPEAT),
            isDepth: this._getOption(this._core.isDepth, false),
            depthMode: this._getGLOption("depthMode", gl.LUMINANCE),
            depthCompareMode: this._getGLOption("depthCompareMode", gl.COMPARE_R_TO_TEXTURE),
            depthCompareFunc: this._getGLOption("depthCompareFunc", gl.LEQUAL),
            flipY: this._getOption(this._core.flipY, true),
            width: this._getOption(this._core.width, 1),
            height: this._getOption(this._core.height, 1),
            internalFormat: this._getGLOption("internalFormat", gl.ALPHA),
            sourceFormat: this._getGLOption("sourceFormat", gl.ALPHA),
            sourceType: this._getGLOption("sourceType", gl.UNSIGNED_BYTE),
            update: null
        });

        if (this.destroyed) { // Node was destroyed while loading
            this._core.texture.destroy();
        }

        this._engine.display.imageDirty = true;
    };

    SceneJS.TextureMap.prototype._getGLOption = function (name, defaultVal) {
        var gl = this._engine.canvas.gl;
        var value = this._core[name];
        if (value == undefined) {
            return defaultVal;
        }
        var glName = SceneJS._webgl.enumMap[value];
        if (glName == undefined) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Unrecognised value for texture node property '" + name + "' value: '" + value + "'");
        }
        return gl[glName];
    };

    SceneJS.TextureMap.prototype._getOption = function (value, defaultVal) {
        return (value == undefined) ? defaultVal : value;
    };

    SceneJS.TextureMap.prototype.setSrc = function (src) {
        this._core.image = null;
        this._core.src = src;
        this._core.target = null;
        this._loadTexture(src);
    };

    SceneJS.TextureMap.prototype.setImage = function (image) {
        this._core.image = image;
        this._core.src = null;
        this._core.target = null;
        this._setTextureImage(image);
    };

    SceneJS.TextureMap.prototype.setTarget = function (target) {
        if (target.type != "colorTarget" && target.type != "depthTarget") {
            console.log("Target node type not compatible: " + target.type);
            return;
        }
        delete this._core.src;
        this._core.target = target;
        this._core.src = null;
        this._core.image = null;
        this._core.texture = target._core.renderBuf.getTexture(); // TODO: what happens when the target is destroyed?
        this._core.texture.bufType = target._core.bufType;
        this._engine.display.imageDirty = true;
    };

    /**
     * Sets the texture's blend factor with respect to other active textures.
     * @param {number} blendFactor The blend factor, in range [0..1]
     */
    SceneJS.TextureMap.prototype.setBlendFactor = function (blendFactor) {
        this._core.blendFactor = blendFactor;
        this._engine.display.imageDirty = true;
    };

    SceneJS.TextureMap.prototype.getBlendFactor = function () {
        return this._core.blendFactor;
    };

    SceneJS.TextureMap.prototype.setTranslate = function (t) {
        if (!this._core.translate) {
            this._core.translate = {x: 0, y: 0};
        }
        this._core.translate.x = t.x;
        this._core.translate.y = t.y;
        this._core._matrixDirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.TextureMap.prototype.getTranslate = function () {
        return this._core.translate;
    };

    SceneJS.TextureMap.prototype.setScale = function (s) {
        if (!this._core.scale) {
            this._core.scale = {x: 0, y: 0};
        }
        this._core.scale.x = s.x;
        this._core.scale.y = s.y;
        this._core._matrixDirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.TextureMap.prototype.getScale = function () {
        return this._core.scale;
    };

    SceneJS.TextureMap.prototype.setRotate = function (angle) {
        this._core.rotate = angle;
        this._core._matrixDirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.TextureMap.prototype.getRotate = function () {
        return this._core.rotate;
    };

    SceneJS.TextureMap.prototype.getMatrix = function () {
        if (this._core._matrixDirty) {
            this._core.buildMatrix.call(this.core)()
        }
        return this.core.matrix;
    };

    SceneJS.TextureMap.prototype._compile = function (ctx) {
        if (!this.__core) {
            this.__core = this._engine._coreFactory.getCore("texture");
        }
        var parentCore = this._engine.display.texture;
        if (!this._core.empty) {
            this.__core.layers = (parentCore && parentCore.layers) ? parentCore.layers.concat([this._core]) : [this._core];
        }
        this._makeHash(this.__core);
        coreStack[stackLen++] = this.__core;
        this._engine.display.texture = this.__core;
        this._compileNodes(ctx);
        this._engine.display.texture = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

    SceneJS.TextureMap.prototype._makeHash = function (core) {
        var hash;
        if (core.layers && core.layers.length > 0) {
            var layers = core.layers;
            var hashParts = [];
            var texLayer;
            for (var i = 0, len = layers.length; i < len; i++) {
                texLayer = layers[i];
                hashParts.push("/");
                hashParts.push(texLayer.applyFrom);
                hashParts.push("/");
                hashParts.push(texLayer.applyTo);
                hashParts.push("/");
                hashParts.push(texLayer.blendMode);
                if (texLayer.matrix) {
                    hashParts.push("/anim");
                }
            }
            hash = hashParts.join("");
        } else {
            hash = "";
        }
        if (core.hash != hash) {
            core.hash = hash;
        }
    };

    SceneJS.TextureMap.prototype._destroy = function () {
        if (this._core.useCount == 1) { // Last core user
            if (this._core.texture && !this._core.target) { // Don't wipe out target texture
                this._core.texture.destroy();
                this._core.texture = null;
            }
        }
        if (this._core) {
            this._engine._coreFactory.putCore(this._core);
        }
    };

})();;/**
 * @class Scene graph node which defines fresnels to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
new (function () {

    // The default state core singleton for {@link SceneJS.Fresnel} nodes
    var defaultCore = {
        type: "fresnel",
        stateId: SceneJS._baseStateId++,
        centerBias: 1.0,
        edgeBias: 0.0,
        power: 1.0,
        centerColor:[ 1.0, 1.0, 1.0 ],
        edgeColor:[ 0.0, 0.0, 0.0 ],
        empty: true,
        hash: ""
    };

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.fresnel = defaultCore;
            stackLen = 0;
        });

    var coreStack = [];
    var stackLen = 0;

    /**
     * @class Scene graph node which defines a fresnel to apply to the {@link SceneJS.Geometry} nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Fresnel = SceneJS_NodeFactory.createNodeType("fresnel");

    SceneJS.Fresnel.prototype._init = function (params) {

        if (this._core.useCount == 1) { // This node is the resource definer

            if (params.applyTo) {
                if (params.applyTo != "color" &&
                    params.applyTo != "specular" &&
                    params.applyTo != "alpha" &&
                    params.applyTo != "reflect" &&
                    params.applyTo != "emit" &&
                    params.applyTo != "fragment") {

                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "fresnel applyTo value is unsupported - should be either 'color', 'specular', 'alpha', 'reflect', 'emit' or 'fragment'");
                }
            }

            this._core.applyTo = params.applyTo;

            this.setCenterBias(params.centerBias);
            this.setEdgeBias(params.edgeBias);
            this.setPower(params.power);
            this.setCenterColor(params.centerColor);
            this.setEdgeColor(params.edgeColor);
        }
    };

    SceneJS.Fresnel.prototype.getApplyTo = function () {
        return this._core.applyTo;
    };

    SceneJS.Fresnel.prototype.setCenterBias = function (centerBias) {
        this._core.centerBias = (centerBias !== undefined && centerBias !== null) ? centerBias : defaultCore.centerBias;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Fresnel.prototype.getCenterBias = function () {
        return this._core.centerBias;
    };

    SceneJS.Fresnel.prototype.setEdgeBias = function (edgeBias) {
        this._core.edgeBias = (edgeBias !== undefined && edgeBias !== null) ? edgeBias : defaultCore.edgeBias;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Fresnel.prototype.getEdgeBias = function () {
        return this._core.edgeBias;
    };

    SceneJS.Fresnel.prototype.setPower = function (power) {
        this._core.power = (power !== undefined && power !== null) ? power : defaultCore.power;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Fresnel.prototype.getPower = function () {
        return this._core.power;
    };

    SceneJS.Fresnel.prototype.setCenterColor = function (color) {
        var defaultCenterColor = defaultCore.centerColor;
        this._core.centerColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultCenterColor[0],
            color.g != undefined && color.g != null ? color.g : defaultCenterColor[1],
            color.b != undefined && color.b != null ? color.b : defaultCenterColor[2]
        ] : defaultCore.centerColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Fresnel.prototype.getCenterColor = function () {
        return {
            r:this._core.centerColor[0],
            g:this._core.centerColor[1],
            b:this._core.centerColor[2]
        };
    };

    SceneJS.Fresnel.prototype.setEdgeColor = function (color) {
        var defaultEdgeColor = defaultCore.edgeColor;
        this._core.edgeColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultEdgeColor[0],
            color.g != undefined && color.g != null ? color.g : defaultEdgeColor[1],
            color.b != undefined && color.b != null ? color.b : defaultEdgeColor[2]
        ] : defaultCore.edgeColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Fresnel.prototype.getEdgeColor = function () {
        return {
            r:this._core.edgeColor[0],
            g:this._core.edgeColor[1],
            b:this._core.edgeColor[2]
        };
    };
    
    SceneJS.Fresnel.prototype._compile = function (ctx) {

        if (!this.__core) {
            this.__core = this._engine._coreFactory.getCore("fresnel");
        }

        var parentCore = this._engine.display.fresnel;

        if (!this._core.empty) {
            this.__core.diffuse = this._core.applyTo == "color" ? this._core : parentCore.diffuse;
            this.__core.specular = this._core.applyTo == "specular" ? this._core : parentCore.specular;
            this.__core.alpha = this._core.applyTo == "alpha" ? this._core : parentCore.alpha;
            this.__core.reflect = this._core.applyTo == "reflect" ? this._core : parentCore.reflect;
            this.__core.emit = this._core.applyTo == "emit" ? this._core : parentCore.emit;
            this.__core.fragment = this._core.applyTo == "fragment" ? this._core : parentCore.fragment;
        }

        this._makeHash(this.__core);

        coreStack[stackLen++] = this.__core;

        this._engine.display.fresnel = this.__core;
        this._compileNodes(ctx);
        this._engine.display.fresnel = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

    SceneJS.Fresnel.prototype._makeHash = function (core) {
        var hash = [];
        if (core.diffuse) {
            hash.push("d;")
        }
        if (core.specular) {
            hash.push("s;")
        }
        if (core.alpha) {
            hash.push("a;")
        }
        if (core.reflect) {
            hash.push("r;")
        }
        if (core.emit) {
            hash.push("e;")
        }
        if (core.fragment) {
            hash.push("f;")
        }
        hash = hash.join("");
        if (core.hash != hash) {
            core.hash = hash;
        }
    };

    SceneJS.Fresnel.prototype._destroy = function () {
        if (this._core) {
            this._engine._coreFactory.putCore(this._core);
        }
    };

})();;(function () {

    // The default state core singleton for {@link SceneJS.ColorBuf} nodes
    var defaultCore = {
        type: "cubemap",
        stateId: SceneJS._baseStateId++,
        empty: true,
        texture: null,
        hash: ""
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.cubemap = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which configures the color buffer for its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Reflect = SceneJS_NodeFactory.createNodeType("reflect");

    SceneJS.Reflect.prototype._init = function (params) {
        if (this._core.useCount == 1) { // This node is first to reference the state core, so sets it up
            this._core.hash = "y";

            if (params.blendMode) {
                if (params.blendMode != "add" && params.blendMode != "multiply") {
                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                            "reflection blendMode value is unsupported - " +
                            "should be either 'add' or 'multiply'");
                }
            }

            this._core.blendMode = params.blendMode || "multiply";
            this._core.intensity = (params.intensity != undefined && params.intensity != null) ? params.intensity : 1.0;
            this._core.applyTo = "reflect";

            var self = this;

            var gl = this._engine.canvas.gl;
            var texture = gl.createTexture();

            var faces = [
                gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
            ];

            var images = [];
            var taskId = SceneJS_sceneStatusModule.taskStarted(this, "Loading reflection texture");
            var loadFailed = false;

            for (var i = 0; i < faces.length; i++) {

                var image = new Image();

                image.onload = (function() {

                    var _image = image;

                    return function () {

                        if (loadFailed) {
                            return;
                        }

                        images.push(_image);

                        if (images.length == faces.length) {

                            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

                            for (var j = 0, lenj = images.length; j < lenj; j++) {
                                gl.texImage2D(faces[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                                    SceneJS._webgl.ensureImageSizePowerOfTwo(images[j]));
                            }

                            self._core.texture = new SceneJS._webgl.Texture2D(gl, {
                                texture: texture,
                                target: gl.TEXTURE_CUBE_MAP,
                                minFilter: gl.LINEAR,
                                magFilter: gl.LINEAR,
                                wrapS: gl.CLAMP_TO_EDGE,
                                wrapT: gl.CLAMP_TO_EDGE
                            });

                            SceneJS_sceneStatusModule.taskFinished(taskId);

                            self._engine.display.imageDirty = true;
                        }
                    };
                })();

                image.onerror = function () {
                    loadFailed = true;
                    SceneJS_sceneStatusModule.taskFailed(taskId);
                };

                image.src = params.src[i];
            }
        }
    };

    SceneJS.Reflect.prototype._compile = function (ctx) {
        if (!this.__core) {
            this.__core = this._engine._coreFactory.getCore("cubemap");
        }
        var parentCore = this._engine.display.cubemap;
        if (!this._core.empty) {
            this.__core.layers = (parentCore && parentCore.layers) ? parentCore.layers.concat([this._core]) : [this._core];
        }
        this._makeHash(this.__core);
        coreStack[stackLen++] = this.__core;
        this._engine.display.cubemap = this.__core;
        this._compileNodes(ctx);
        this._engine.display.cubemap = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

    SceneJS.Reflect.prototype._makeHash = function (core) {
        var hash;
        if (core.layers && core.layers.length > 0) {
            var layers = core.layers;
            var hashParts = [];
            var texLayer;
            for (var i = 0, len = layers.length; i < len; i++) {
                texLayer = layers[i];
                hashParts.push("/");
                hashParts.push(texLayer.applyTo);
                hashParts.push("/");
                hashParts.push(texLayer.blendMode);
            }
            hash = hashParts.join("");
        } else {
            hash = "";
        }
        if (core.hash != hash) {
            core.hash = hash;
        }
    };

    SceneJS.Reflect.prototype._destroy = function () {
        if (this._core.useCount == 1) { // Last resource user
            if (this._core.texture) {
                this._core.texture.destroy();
                this._core.texture = null;
            }
        }
        if (this._core) {
            this._engine._coreFactory.putCore(this._core);
        }
    }

})();;/**
 * @class Scene graph node which defines textures to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
new (function () {

    // The default state core singleton for {@link SceneJS.RegionMap} nodes
    var defaultCore = {
        type: "regionMap",
        stateId: SceneJS._baseStateId++,
        empty: true,
        texture: null,
        regionColor:[ -1.0, -1.0, -1.0 ],    // Highlight off by default
        highlightFactor:[ 1.5, 1.5, 0.0 ],
        hideAlpha: 0.0,
        regionData: [],
        mode: "info",
        hash: ""
    };

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.regionMap = defaultCore;
            stackLen = 0;
        });

    var stackLen = 0;
    var validModes = {
        info: true,
        highlight: true,
        hide: true,
        isolate: true
    };

    /**
     * @class Scene graph node which defines a color-coded region map
     * @extends SceneJS.Node
     */
    SceneJS.RegionMap = SceneJS_NodeFactory.createNodeType("regionMap");

    SceneJS.RegionMap.prototype._init = function (params) {

        var self = this;

        if (this._core.useCount == 1) { // This node is the resource definer

            SceneJS._apply({
                    regionMap: null
                },
                this._core);

            // Index of UV layer for this region map

            var applyFrom = params.applyFrom || "uv";
            if (applyFrom.substring(0,2) !== "uv") {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.NODE_CONFIG_EXPECTED,
                    "texture applyFrom value is unsupported - should be 'uv<index>'");
            }
            var uvLayerIdx = 0;
            if (applyFrom !== "uv") {
                uvLayerIdx = applyFrom.substring(2);
                if (isNaN(uvLayerIdx)) {
                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "texture applyFrom value invalid - should be 'uv<index>'");
                }
            }
            this._core.uvLayerIdx = uvLayerIdx;

            if (params.src) {

                // Load from URL

                this._initTexture();
                this._core.src = params.src;
                this._loadTexture(params.src);

            } else if (params.image) {

                // Create from image

                this._initTexture(params.preloadColor);
                this._core.image = params.image;
                this._setTextureImage(params.image);

            } else if (params.target) {

                // Render to this region map

                this.getScene().getNode(params.target,
                    function (target) {
                        self.setTarget(target);
                    });
            }

            this._core.webglRestored = function () {

                if (self._core.image) {
                    self._initTexture();
                    self._setTextureImage(self._core.image);

                } else if (self._core.src) {
                    self._initTexture();
                    self._loadTexture(self._core.src);

                } else if (self._core.target) {
                    // Don't need to rebind anything for targets
                }
            };

            this.setRegionColor(params.regionColor);
            this.setHighlightFactor(params.highlightFactor);
            this.setHideAlpha(params.hideAlpha);
            this.setRegionData(params.regionData);
            this.setMode(params.mode);
        }
    };

    SceneJS.RegionMap.prototype._initTexture = function () {

        var gl = this._engine.canvas.gl;

        // Keep this for a little bit for debugging
        var preloadColor = {r: 0.57735, g: 0.57735, b: 0.57735};
        preloadColor.a = preloadColor.a === undefined ? 1 : preloadColor.a;
        preloadColor = new Uint8Array([
            Math.floor(preloadColor.r * 255),
            Math.floor(preloadColor.g * 255),
            Math.floor(preloadColor.b * 255),
            Math.floor(preloadColor.a * 255)
        ]);

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, preloadColor);
        this._setCoreTexture(texture);
    };

    SceneJS.RegionMap.prototype._loadTexture = function (src) {
        var self = this;
        var taskId = SceneJS_sceneStatusModule.taskStarted(this, "Loading texture");
        var image = new Image();
        var loaded = false;
        var taskFinished = false;

        image.onload = function () {
            self._setTextureImage(image);
            if (!taskFinished) {
                SceneJS_sceneStatusModule.taskFinished(taskId);
            }
            loaded = true;
            self._engine.display.imageDirty = true;
        };
        image.onerror = function () {
            SceneJS_sceneStatusModule.taskFailed(taskId);
        };
        this._fetchImage(image, src);
    };

    SceneJS.RegionMap.prototype._fetchImage = function (image, src) {
        if (src.indexOf("data") == 0) {  // Image data
            image.src = src;
        } else { // Image file
            image.crossOrigin = "Anonymous";
            image.src = src;
        }
    };

    SceneJS.RegionMap.prototype._setTextureImage = function (image) {
        var gl = this._engine.canvas.gl;
        var texture = this._core.texture ? this._core.texture.texture : gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, SceneJS._webgl.ensureImageSizePowerOfTwo(image));
        this._core.image = image;
        this._setCoreTexture(texture);
    };

    SceneJS.RegionMap.prototype._setCoreTexture = function (texture) {
        var gl = this._engine.canvas.gl;

        this._core.texture = new SceneJS._webgl.Texture2D(gl, {
            texture: texture, // WebGL texture object
            minFilter: this._getGLOption("minFilter", gl.NEAREST_MIPMAP_NEAREST),  // Don't want any interpolation
            magFilter: this._getGLOption("magFilter", gl.NEAREST),
            wrapS: this._getGLOption("wrapS", gl.REPEAT),
            wrapT: this._getGLOption("wrapT", gl.REPEAT),
            isDepth: this._getOption(this._core.isDepth, false),
            depthMode: this._getGLOption("depthMode", gl.LUMINANCE),
            depthCompareMode: this._getGLOption("depthCompareMode", gl.COMPARE_R_TO_TEXTURE),
            depthCompareFunc: this._getGLOption("depthCompareFunc", gl.LEQUAL),
            flipY: this._getOption(this._core.flipY, true),
            width: this._getOption(this._core.width, 1),
            height: this._getOption(this._core.height, 1),
            internalFormat: this._getGLOption("internalFormat", gl.ALPHA),
            sourceFormat: this._getGLOption("sourceFormat", gl.ALPHA),
            sourceType: this._getGLOption("sourceType", gl.UNSIGNED_BYTE),
            update: null
        });

        if (this.destroyed) { // Node was destroyed while loading
            this._core.texture.destroy();
        }

        this._engine.display.imageDirty = true;
    };

    SceneJS.RegionMap.prototype._getGLOption = function (name, defaultVal) {
        var gl = this._engine.canvas.gl;
        var value = this._core[name];
        if (value == undefined) {
            return defaultVal;
        }
        var glName = SceneJS._webgl.enumMap[value];
        if (glName == undefined) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Unrecognised value for texture node property '" + name + "' value: '" + value + "'");
        }
        return gl[glName];
    };

    SceneJS.RegionMap.prototype._getOption = function (value, defaultVal) {
        return (value == undefined) ? defaultVal : value;
    };

    SceneJS.RegionMap.prototype.setSrc = function (src) {
        this._core.image = null;
        this._core.src = src;
        this._core.target = null;
        this._loadTexture(src);
    };

    SceneJS.RegionMap.prototype.setImage = function (image) {
        this._core.image = image;
        this._core.src = null;
        this._core.target = null;
        this._setTextureImage(image);
    };

    SceneJS.RegionMap.prototype.setTarget = function (target) {
        if (target.type != "colorTarget" && target.type != "depthTarget") {
            console.log("Target node type not compatible: " + target.type);
            return;
        }
        delete this._core.src;
        this._core.target = target;
        this._core.src = null;
        this._core.image = null;
        this._core.texture = target._core.renderBuf.getTexture(); // TODO: what happens when the target is destroyed?
        this._core.texture.bufType = target._core.bufType;
        this._engine.display.imageDirty = true;
    };

    SceneJS.RegionMap.prototype.setRegionColor = function (color) {
        var defaultHighlightColor = defaultCore.regionColor;
        this._core.regionColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultHighlightColor[0],
            color.g != undefined && color.g != null ? color.g : defaultHighlightColor[1],
            color.b != undefined && color.b != null ? color.b : defaultHighlightColor[2]
        ] : defaultCore.regionColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.RegionMap.prototype.setHighlightFactor = function (color) {
        var defaultHighlightFactor = defaultCore.highlightFactor;
        this._core.highlightFactor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultHighlightFactor[0],
            color.g != undefined && color.g != null ? color.g : defaultHighlightFactor[1],
            color.b != undefined && color.b != null ? color.b : defaultHighlightFactor[2]
        ] : defaultCore.highlightFactor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.RegionMap.prototype.setHideAlpha = function (hideAlpha) {
        this._core.hideAlpha = hideAlpha != undefined ? hideAlpha : defaultCore.hideAlpha;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.RegionMap.prototype.setMode = function (mode) {
        this._core.mode = mode && validModes[mode] ? mode : defaultCore.mode;
        this._engine.branchDirty(this);
        this._engine.display.imageDirty = true;
        this._core.hash = "reg-" + mode;
        return this;
    };

    SceneJS.RegionMap.prototype.setRegionData = function (data) {
        this._core.regionData = data ? data : defaultCore.regionData;
        return this;
    };


    SceneJS.RegionMap.prototype._compile = function (ctx) {
        var parentCore = this._engine.display.regionMap;
        this._engine.display.regionMap = this._core;
        this._compileNodes(ctx);
        this._engine.display.regionMap = parentCore;
    };

    SceneJS.RegionMap.prototype._destroy = function () {
        if (this._core.useCount == 1) { // Last core user
            if (this._core.texture && !this._core.target) { // Don't wipe out target texture
                this._core.texture.destroy();
                this._core.texture = null;
            }
        }
    };

})();;/**
 * @class Scene graph node which defines the modelling transform to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
SceneJS.XForm = SceneJS_NodeFactory.createNodeType("xform");

SceneJS.XForm.prototype._init = function (params) {

    if (this._core.useCount == 1) { // This node is the resource definer

        SceneJS_modelXFormStack.buildCore(this._core);

        this.setElements(params.elements);
    }
};

/**
 * Get Model matrix
 * @return {*}
 */
SceneJS.XForm.prototype.getModelMatrix = function() {
    if (this._core.dirty) {
        this._core.build();
    }
    return this._core.matrix;
};

/**
 * Get World matrix. That's the multiplication of this node's Model matrix by the World matrix of the the next
 * tranform (scale, XForm, translate etc) node on the path to the scene root.
 * @return {*}
 */
SceneJS.XForm.prototype.getWorldMatrix = function() {
    if (this._core.dirty) {
        this._core.build();
    }
    return Array.apply( [], this._core.mat);
};


SceneJS.XForm.prototype.setElements = function (elements) {

    elements = elements || SceneJS_math_identityMat4();

    if (elements.length != 16) {
        throw SceneJS_error.fatalError(
            SceneJS.errors.ILLEGAL_NODE_CONFIG,
            "SceneJS.XForm elements should number 16");
    }

    var core = this._core;

    if (!core.matrix) {
        core.matrix = elements;

    } else {

        for (var i = 0; i < 16; i++) {
            core.matrix[i] = elements[i];
        }
    }

//    core.mat.set(core.matrix);
//    core.normalMat.set(
//        SceneJS_math_transposeMat4(
//            SceneJS_math_inverseMat4(core.matrix, SceneJS_math_mat4())));


    core.setDirty();

    this._engine.display.imageDirty = true;

    return this;
};

SceneJS.XForm.prototype._compile = function (ctx) {
    SceneJS_modelXFormStack.push(this._core);
    this._compileNodes(ctx);
    SceneJS_modelXFormStack.pop();
};
;
/**
 * @class Scene graph node which defines a modelling transform matrix to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
SceneJS.Matrix = SceneJS_NodeFactory.createNodeType("matrix");

SceneJS.Matrix.prototype._init = function(params) {

    if (this._core.useCount == 1) { // This node is the resource definer

        SceneJS_modelXFormStack.buildCore(this._core);

        this.setElements(params.elements);
    }
};

/**
 * Get Model matrix
 * @return {*}
 */
SceneJS.Matrix.prototype.getModelMatrix = function() {
    if (this._core.dirty) {
        this._core.build();
    }
    return this._core.matrix;
};

/**
 * Get World matrix. That's the multiplication of this node's Model matrix by the World matrix of the the next
 * tranform (scale, matrix, translate etc) node on the path to the scene root.
 * @return {*}
 */
SceneJS.Matrix.prototype.getWorldMatrix = function() {
    if (this._core.dirty) {
        this._core.build();
    }
    return Array.apply( [], this._core.mat);
};

/**
 * Sets the matrix elements
 * @type {Function}
 */
SceneJS.Matrix.prototype.setMatrix = function(elements) {

    elements = elements || SceneJS_math_identityMat4();

    if (elements.length != 16) {
        throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "SceneJS.Matrix elements should number 16");
    }

    var core = this._core;

    if (!core.matrix) {
        core.matrix = elements;

    } else {

        for (var i = 0; i < 16; i++) {
            core.matrix[i] = elements[i];
        }
    }

    core.setDirty();

    this._engine.display.imageDirty = true;

    return this;
};

/**
 * Sets the matrix elements
 * @deprecated
 * @type {Function}
 */
SceneJS.Matrix.prototype.setElements = SceneJS.Matrix.prototype.setMatrix;

SceneJS.Matrix.prototype._compile = function(ctx) {
    SceneJS_modelXFormStack.push(this._core);
    this._compileNodes(ctx);
    SceneJS_modelXFormStack.pop();
};
;/**
 * @class Scene graph node which defines a rotation modelling transform to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
SceneJS.Rotate = SceneJS_NodeFactory.createNodeType("rotate");

SceneJS.Rotate.prototype._init = function(params) {

    if (this._core.useCount == 1) { // This node is the resource definer

        SceneJS_modelXFormStack.buildCore(this._core);
        
        this.setMultOrder(params.multOrder);

        this.setAngle(params.angle);

        this.setXYZ({
            x: params.x,
            y: params.y,
            z: params.z
        });

        var core = this._core;

        this._core.buildMatrix = function() {
            core.matrix = SceneJS_math_rotationMat4v(core.angle * Math.PI / 180.0, [core.x, core.y, core.z]);
        };
    }
};

/**
 * Get Model matrix
 * @return {*}
 */
SceneJS.Rotate.prototype.getModelMatrix = function() {
    if (this._core.dirty) {
        this._core.build();
    }
    return this._core.matrix;
};

/**
 * Get World matrix. That's the multiplication of this node's Model matrix by the World matrix of the the next
 * tranform (scale, rotate, translate etc) node on the path to the scene root.
 * @return {*}
 */
SceneJS.Rotate.prototype.getWorldMatrix = function() {
    if (this._core.dirty) {
        this._core.build();
    }
    return Array.apply( [], this._core.mat);
};

/**
 * Sets the multiplication order of this node's transform matrix with respect to the parent modeling transform
 * in the scene graph.
 *
 * @param {String} multOrder Mulplication order - "post" and "pre"
 */
SceneJS.Rotate.prototype.setMultOrder = function(multOrder) {

    multOrder = multOrder || "post";

    if (multOrder != "post" && multOrder != "pre") {

        throw SceneJS_error.fatalError(
                SceneJS.errors.NODE_CONFIG_EXPECTED,
                "Illegal multOrder for rotate node - '" + multOrder + "' should be 'pre' or 'post'");
    }

    this._core.multOrder = multOrder;

    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Rotate.prototype.setAngle = function(angle) {
    this._core.angle = angle || 0;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Rotate.prototype.getAngle = function() {
    return this._core.angle;
};

SceneJS.Rotate.prototype.setXYZ = function(xyz) {

    xyz = xyz || {};

    this._core.x = xyz.x || 0;
    this._core.y = xyz.y || 0;
    this._core.z = xyz.z || 0;

    this._core.setDirty();

    this._engine.display.imageDirty = true;
};

SceneJS.Rotate.prototype.getXYZ = function() {
    return {
        x: this._core.x,
        y: this._core.y,
        z: this._core.z
    };
};

SceneJS.Rotate.prototype.setX = function(x) {
    this._core.x = x;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Rotate.prototype.getX = function() {
    return this._core.x;
};

SceneJS.Rotate.prototype.setY = function(y) {
    this._core.y = y;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Rotate.prototype.getY = function() {
    return this._core.y;
};

SceneJS.Rotate.prototype.setZ = function(z) {
    this._core.z = z;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Rotate.prototype.getZ = function() {
    return this._core.z;
};

SceneJS.Rotate.prototype.incAngle = function(angle) {
    this._core.angle += angle;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Rotate.prototype._compile = function(ctx) {
    SceneJS_modelXFormStack.push(this._core);
    this._compileNodes(ctx);
    SceneJS_modelXFormStack.pop();
};
;/**
 * @class Scene graph node which defines a translation modelling transform to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
SceneJS.Translate = SceneJS_NodeFactory.createNodeType("translate");

SceneJS.Translate.prototype._init = function(params) {

    if (this._core.useCount == 1) { // This node is the resource definer

        SceneJS_modelXFormStack.buildCore(this._core);
        
        this.setMultOrder(params.multOrder);

        this.setXYZ({
            x: params.x,
            y: params.y,
            z: params.z
        });

        var core = this._core;

        this._core.buildMatrix = function() {
            core.matrix = SceneJS_math_translationMat4v([core.x, core.y, core.z], core.matrix);
        };
    }
};

/**
 * Get Model matrix
 * @return {*}
 */
SceneJS.Translate.prototype.getModelMatrix = function() {
    if (this._core.dirty) {
        this._core.build();
    }
    return this._core.matrix;
};

/**
 * Get World matrix. That's the multiplication of this node's Model matrix by the World matrix of the the next
 * tranform (scale, translate, translate etc) node on the path to the scene root.
 * @return {*}
 */
SceneJS.Translate.prototype.getWorldMatrix = function() {
    if (this._core.dirty) {
        this._core.build();
    }
    return Array.apply( [], this._core.mat);
};


/**
 * Sets the multiplication order of this node's transform matrix with respect to the parent modeling transform
 * in the scene graph.
 *
 * @param {String} multOrder Mulplication order - "post" and "pre"
 */
SceneJS.Translate.prototype.setMultOrder = function(multOrder) {

    multOrder = multOrder || "post";

    if (multOrder != "post" && multOrder != "pre") {

        throw SceneJS_error.fatalError(
                SceneJS.errors.NODE_CONFIG_EXPECTED,
                "Illegal multOrder for translate node - '" + multOrder + "' should be 'pre' or 'post'");
    }

    this._core.multOrder = multOrder;

    this._core.setDirty();

    this._engine.display.imageDirty = true;
};

SceneJS.Translate.prototype.setXYZ = function(xyz) {

    xyz = xyz || {};

    this._core.x = xyz.x || 0;
    this._core.y = xyz.y || 0;
    this._core.z = xyz.z || 0;

    this._core.setDirty();

    this._engine.display.imageDirty = true;

    return this;
};

SceneJS.Translate.prototype.getXYZ = function() {
    return {
        x: this._core.x,
        y: this._core.y,
        z: this._core.z
    };
};

SceneJS.Translate.prototype.setX = function(x) {
    this._core.x = x;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
    return this;
};

SceneJS.Translate.prototype.setY = function(y) {
    this._core.y = y;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
    return this;
};

SceneJS.Translate.prototype.setZ = function(z) {
    this._core.z = z;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
    return this;
};

SceneJS.Translate.prototype.incX = function(x) {
    this._core.x += x;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
    return this;
};

SceneJS.Translate.prototype.incY = function(y) {
    this._core.y += y;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
    return this;
};

SceneJS.Translate.prototype.incZ = function(z) {
    this._core.z += z;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
    return this;
};

SceneJS.Translate.prototype.getX = function() {
    return this._core.x;
};

SceneJS.Translate.prototype.getY = function() {
    return this._core.y;
};

SceneJS.Translate.prototype.getZ = function() {
    return this._core.z;
};

SceneJS.Translate.prototype._compile = function(ctx) {
    SceneJS_modelXFormStack.push(this._core);
    this._compileNodes(ctx);
    SceneJS_modelXFormStack.pop();
};
;/**
 * @class Scene graph node which defines a rotation modelling transform to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
SceneJS.Scale = SceneJS_NodeFactory.createNodeType("scale");

SceneJS.Scale.prototype._init = function (params) {

    if (this._core.useCount == 1) { // This node is the resource definer

        SceneJS_modelXFormStack.buildCore(this._core);

        this.setMultOrder(params.multOrder);

        this.setXYZ({
            x:params.x,
            y:params.y,
            z:params.z
        });

        var core = this._core;

        this._core.buildMatrix = function () {
            core.matrix = SceneJS_math_scalingMat4v([core.x, core.y, core.z]);
        };
    }
};

/**
 * Get Model matrix
 * @return {*}
 */
SceneJS.Scale.prototype.getModelMatrix = function () {
    if (this._core.dirty) {
        this._core.build();
    }
    return this._core.matrix;
};

/**
 * Get World matrix. That's the multiplication of this node's Model matrix by the World matrix of the the next
 * tranform (scale, scale, translate etc) node on the path to the scene root.
 * @return {*}
 */
SceneJS.Scale.prototype.getWorldMatrix = function () {
    if (this._core.dirty) {
        this._core.build();
    }
    return Array.apply([], this._core.mat);
};

/**
 * Sets the multiplication order of this node's transform matrix with respect to the parent modeling transform
 * in the scene graph.
 *
 * @param {String} multOrder Mulplication order - "post" and "pre"
 */
SceneJS.Scale.prototype.setMultOrder = function (multOrder) {

    multOrder = multOrder || "post";

    if (multOrder != "post" && multOrder != "pre") {

        throw SceneJS_error.fatalError(
            SceneJS.errors.NODE_CONFIG_EXPECTED,
            "Illegal multOrder for scale node - '" + multOrder + "' should be 'pre' or 'post'");
    }

    this._core.multOrder = multOrder;

    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Scale.prototype.setXYZ = function (xyz) {

    xyz = xyz || {};

    this._core.x = xyz.x == undefined ? 1 : xyz.x;
    this._core.y = xyz.y == undefined ? 1 : xyz.y;
    this._core.z = xyz.z == undefined ? 1 : xyz.z;

    this._core.setDirty();

    this._engine.display.imageDirty = true;
};

SceneJS.Scale.prototype.getXYZ = function () {
    return {
        x:this._core.x,
        y:this._core.y,
        z:this._core.z
    };
};

SceneJS.Scale.prototype.setX = function (x) {
    this._core.x = x;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Scale.prototype.setY = function (y) {
    this._core.y = y;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Scale.prototype.setZ = function (z) {
    this._core.z = z;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Scale.prototype.getX = function () {
    return this._core.x;
};

SceneJS.Scale.prototype.getY = function () {
    return this._core.y;
};

SceneJS.Scale.prototype.getZ = function () {
    return this._core.z;
};

SceneJS.Scale.prototype.incX = function (x) {
    this._core.x += x;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Scale.prototype.incY = function (y) {
    this._core.y += y;
    this._core.matrixDirty = true;
};

SceneJS.Scale.prototype.incZ = function (z) {
    this._core.z += z;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Scale.prototype._compile = function (ctx) {
    SceneJS_modelXFormStack.push(this._core);
    this._compileNodes(ctx);
    SceneJS_modelXFormStack.pop();
};
;/**
 * Provides a model transform stack in front of the renderer.
 * Nodes peek push and pop to the stack, while the renderer peeks at
 * the transform on the top of the stack whenever it builds a renderer node.
 *
 */
var SceneJS_modelXFormStack = new (function () {

    var defaultMatrix = SceneJS_math_identityMat4();
    var defaultMat = new Float32Array(defaultMatrix);

    var defaultNormalMatrix = SceneJS_math_transposeMat4(
        SceneJS_math_inverseMat4(
            SceneJS_math_identityMat4(),
            SceneJS_math_mat4()));
    var defaultNormalMat = new Float32Array(defaultNormalMatrix);

    var defaultCore = {
        type:"xform",
        stateId:SceneJS._baseStateId++,

        matrix:defaultMatrix,
        mat:defaultMat,

        normalMatrix:defaultNormalMatrix,
        normalMat:defaultNormalMat,

        parent:null, // Parent transform core
        cores:[], // Child transform cores
        numCores:0, // Number of child transform cores
        dirty:false, // Does this subtree need matrices rebuilt
        matrixDirty:false
    };

    var transformStack = [];
    var stackLen = 0;

    this.top = defaultCore;

    var dirty;

    var self = this;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function () {
            stackLen = 0;
            self.top = defaultCore;
            dirty = true;
        });

    SceneJS_events.addListener(
        SceneJS_events.OBJECT_COMPILING,
        function (params) {

            if (dirty) {

                if (stackLen > 0) {

                    params.display.modelTransform = transformStack[stackLen - 1];

                } else {

                    params.display.modelTransform = defaultCore;
                }

                dirty = false;
            }
        });

    /**
     * Creates a fresh transformation core
     * @param core
     */
    this.buildCore = function (core) {

        /*
         * Transform tree node properties
         */
        core.parent = null;         // Parent transform core
        core.cores = [];            // Child transform cores
        core.numCores = 0;          // Number of child transform cores
        core.matrixDirty = false;

        core.matrix = SceneJS_math_identityMat4();

        core.mat = new Float32Array(core.matrix);
        core.normalMat = new Float32Array(
            SceneJS_math_transposeMat4(
                SceneJS_math_inverseMat4(core.matrix, SceneJS_math_mat4())));

        core.dirty = false;         // Does this subtree need matrices rebuilt

        core.setDirty = function () {

            core.matrixDirty = true;

            if (core.dirty) {
                // return;
            }

            setDirty(core);
        };

        /**
         * Recursively flag this subtree of transforms cores as dirty,
         * ie. needing their matrices rebuilt.
         */
        function setDirty(core) {

            core.dirty = true;
            core.matrixDirty = true;

            for (var i = 0, len = core.numCores; i < len; i++) {
                setDirty(core.cores[i]);
            }
        }

        /**
         * Pre-multiply matrices at cores on path up to root into matrix at this core
         */
        core.build = function () {

            if (core.matrixDirty) {
                if (core.buildMatrix) { // Matrix might be explicit property on some transform node types
                    core.buildMatrix();
                }
                core.matrixDirty = false;
            }

            var parent = core.parent;

            var matrix;

            if (parent) {

                matrix = core.matrix.slice(0);

                while (parent) {

                    if (parent.matrixDirty) {

                        if (parent.buildMatrix) { // Matrix might be explicit property on some transform node types
                            parent.buildMatrix();
                        }
                        parent.mat.set(parent.matrix);
                        parent.normalMat.set(
                            SceneJS_math_transposeMat4(
                                SceneJS_math_inverseMat4(parent.matrix, SceneJS_math_mat4())));

                        parent.matrixDirty = false;
                    }

                    SceneJS_math_mulMat4(parent.matrix, matrix, matrix);

                    if (!parent.dirty) {
                        //   break;
                    }

                    //  parent.dirty = false;

                    parent = parent.parent;
                }

            } else {

                matrix = core.matrix;
            }

            //            if (!core.mat) {
            //
            //                core.mat = new Float32Array(matrix);
            //
            //                core.normalMat = new Float32Array(
            //                        SceneJS_math_transposeMat4(
            //                                SceneJS_math_inverseMat4(matrix, SceneJS_math_mat4())));
            //            } else {

            core.mat.set(matrix);

            core.normalMat.set(
                SceneJS_math_transposeMat4(
                    SceneJS_math_inverseMat4(matrix, SceneJS_math_mat4())));
            //}

           core.dirty = false;
        };
    };

    this.push = function (core) {

        transformStack[stackLen++] = core;

        core.parent = this.top;
        core.dirty = true;

        if (this.top) {
            this.top.cores[this.top.numCores++] = core;
        }

        core.numCores = 0;

        this.top = core;

        dirty = true;
    };

    this.pop = function () {

        this.top = (--stackLen > 0) ? transformStack[stackLen - 1] : defaultCore;
        transformStack[stackLen] = null;  // Release previous top node

        dirty = true;
    };

})();
;/**
 * Container for custom node types
 */
SceneJS.Types = new (function () {

    /**
     * Installs a node type
     * @param typeName
     * @param methods
     */
    this.addType = function (typeName, methods) {
        SceneJS_NodeFactory.createNodeType(typeName, methods,
            // Augments the basic node type with our custom type's methods
            function (type) {
                var method;
                for (var methodName in methods) {
                    if (methods.hasOwnProperty(methodName)) {
                        method = methods[methodName];
                        switch (methodName) {
                            case "init": // Deprecated
                            case "construct":
                                (function () {
                                    var _method = methods[methodName];
                                    type.prototype._init = function (params) {
                                        _method.call(this, params);
                                    };

                                    // Mark node type as a plugin
                                    type.prototype._fromPlugin = true;
                                })();
                                break;
                            case "destroy": // Deprecated
                            case "destruct":
                                type.prototype._destroy = method;
                                break;
                            default:
                                type.prototype[methodName] = method;
                        }
                    }
                }
            });
    };

    /**
     * Tests if given node type is installed
     * @param typeName
     * @param methods
     */
    this.hasType = function (typeName) {
        return !!SceneJS_NodeFactory.nodeTypes[typeName];
    };
})();

;/**
 * @class Display compiled from a {@link SceneJS.Scene}, providing methods to render and pick.
 * @private
 *
 * <p>A Display is a container of {@link SceneJS_Object}s which are created (or updated) by a depth-first
 * <b>compilation traversal</b> of a {@link SceneJS.Scene}.</b>
 *
 * <h2>Rendering Pipeline</h2>
 *
 * <p>Conceptually, a Display implements a pipeline with the following stages:</p>
 *
 * <ol>
 * <li>Create or update {@link SceneJS_Object}s during scene compilation</li>
 * <li>Organise the {@link SceneJS_Object} into an <b>object list</b></li>
 * <li>Determine the GL state sort order for the object list</li>
 * <li>State sort the object list</li>
 * <li>Create a <b>draw list</b> containing {@link SceneJS_Chunk}s belonging to the {@link SceneJS_Object}s in the object list</li>
 * <li>Render the draw list to draw the image</li>
 * </ol>
 *
 * <p>An update to the scene causes the pipeline to be re-executed from one of these stages, and SceneJS is designed
 * so that the pipeline is always re-executed from the latest stage possible to avoid redoing work.</p>
 *
 * <p>For example:</p>
 *
 * <ul>
 * <li>when an object is created or updated, we need to (re)do stages 2, 3, 4, 5 and 6</li>
 * <li>when an object is made invisible, we need to redo stages 5 and 6</li>
 * <li>when an object is assigned to a different scene render layer (works like a render bin), we need to redo
 *   stages 3, 4, 5, and 6</li>
 *<li>when the colour of an object changes, or maybe when the viewpoint changes, we simplt redo stage 6</li>
 * </ul>
 *
 * <h2>Object Creation</h2>
 * <p>The object soup (stage 1) is constructed by a depth-first traversal of the scene graph, which we think of as
 * "compiling" the scene graph into the Display. As traversal visits each scene node, the node's state core is
 * set on the Display (such as {@link #flags}, {@link #layer}, {@link #renderer} etc), which we think of as the
 * cores that are active at that instant during compilation. Each of the scene's leaf nodes is always
 * a {@link SceneJS.Geometry}, and when traversal visits one of those it calls {@link #buildObject} to create an
 * object in the soup. For each of the currently active cores, the object is given a {@link SceneJS_Chunk}
 * containing the WebGL calls for rendering it.</p>
 *
 * <p>The object also gets a shader (implemented by {@link SceneJS_Program}), taylored to render those state cores.</p>
 *
 * <p>Limited re-compilation may also be done on portions of a scene that have been added or sufficiently modified. When
 * traversal visits a {@link SceneJS.Geometry} for which an object already exists in the display, {@link #buildObject}
 * may update the {@link SceneJS_Chunk}s on the object as required for any changes in the core soup since the
 * last time the object was built. If differences among the cores require it, then {@link #buildObject} may also replace
 * the object's {@link SceneJS_Program} in order to render the new core soup configuration.</p>
 *
 * <p>So in summary, to each {@link SceneJS_Object} it builds, {@link #buildObject} creates a list of
 * {@link SceneJS_Chunk}s to render the set of node state cores that are currently set on the {@link SceneJS_Display}.
 * When {@link #buildObject} is re-building an existing object, it may replace one or more {@link SceneJS_Chunk}s
 * for state cores that have changed from the last time the object was built or re-built.</p>

 * <h2>Object Destruction</h2>
 * <p>Destruction of a scene graph branch simply involves a call to {@link #removeObject} for each {@link SceneJS.Geometry}
 * in the branch.</p>
 *
 * <h2>Draw List</h2>
 * <p>The draw list is actually comprised of two lists of state chunks: a "pick" list to render a pick buffer
 * for colour-indexed GPU picking, along with a "draw" list for normal image rendering. The chunks in these lists
 * are held in the state-sorted order of their objects in #_objectList, with runs of duplicate states removed.</p>
 *
 * <p>After a scene update, we set a flag on the display to indicate the stage we will need to redo from. The pipeline is
 * then lazy-redone on the next call to #render or #pick.</p>
 */
var SceneJS_Display = function (cfg) {

    // Display is bound to the lifetime of an HTML5 canvas
    this._canvas = cfg.canvas;

    // Factory which creates and recycles {@link SceneJS_Program} instances
    this._programFactory = new SceneJS_ProgramFactory({
        canvas: cfg.canvas
    });

    // Factory which creates and recycles {@link SceneJS.Chunk} instances
    this._chunkFactory = new SceneJS_ChunkFactory();

    /**
     * True when the background is to be transparent
     * @type {boolean}
     */
    this.transparent = cfg.transparent === true;

    /**
     * Node state core for the last {@link SceneJS.Enable} visited during scene graph compilation traversal
     * @type Object
     */
    this.enable = null;

    /**
     * Node state core for the last {@link SceneJS.Flags} visited during scene graph compilation traversal
     * @type Object
     */
    this.flags = null;

    /**
     * Node state core for the last {@link SceneJS.Layer} visited during scene graph compilation traversal
     * @type Object
     */
    this.layer = null;

    /**
     * Node state core for the last {@link SceneJS.Stage} visited during scene graph compilation traversal
     * @type Object
     */
    this.stage = null;

    /**
     * Node state core for the last {@link SceneJS.Renderer} visited during scene graph compilation traversal
     * @type Object
     */
    this.renderer = null;

    /**
     * Node state core for the last {@link SceneJS.DepthBuf} visited during scene graph compilation traversal
     * @type Object
     */
    this.depthBuffer = null;

    /**
     * Node state core for the last {@link SceneJS.ColorBuf} visited during scene graph compilation traversal
     * @type Object
     */
    this.colorBuffer = null;

    /**
     * Node state core for the last {@link SceneJS.View} visited during scene graph compilation traversal
     * @type Object
     */
    this.view = null;

    /**
     * Node state core for the last {@link SceneJS.Lights} visited during scene graph compilation traversal
     * @type Object
     */
    this.lights = null;

    /**
     * Node state core for the last {@link SceneJS.Material} visited during scene graph compilation traversal
     * @type Object
     */
    this.material = null;

    /**
     * Node state core for the last {@link SceneJS.Texture} visited during scene graph compilation traversal
     * @type Object
     */
    this.texture = null;

    /**
     * Node state core for the last {@link SceneJS.Fresnel} visited during scene graph compilation traversal
     * @type Object
     */
    this.fresnel = null;

    /**
     * Node state core for the last {@link SceneJS.Reflect} visited during scene graph compilation traversal
     * @type Object
     */
    this.cubemap = null;

    /**
     * Node state core for the last {@link SceneJS.XForm} visited during scene graph compilation traversal
     * @type Object
     */
    this.modelTransform = null;

    /**
     * Node state core for the last {@link SceneJS.LookAt} visited during scene graph compilation traversal
     * @type Object
     */
    this.viewTransform = null;

    /**
     * Node state core for the last {@link SceneJS.Camera} visited during scene graph compilation traversal
     * @type Object
     */
    this.projTransform = null;

    /**
     * Node state core for the last {@link SceneJS.Billboard} visited during scene graph compilation traversal
     * @type Object
     */
    this.billboard = null;

    /**
     * Node state core for the last {@link SceneJS.RegionMap} visited during scene graph compilation traversal
     * @type Object
     */
    this.regionMap = null;

    /**
     * Node state core for the last {@link SceneJS.ColorTarget} visited during scene graph compilation traversal
     * @type Object
     */
    this.renderTarget = null;

    /**
     * Node state core for the last {@link SceneJS.Clips} visited during scene graph compilation traversal
     * @type Object
     */
    this.clips = null;

    /**
     * Node state core for the last {@link SceneJS.MorphGeometry} visited during scene graph compilation traversal
     * @type Object
     */
    this.morphGeometry = null;

    /**
     * Node state core for the last {@link SceneJS.Name} visited during scene graph compilation traversal
     * @type Object
     */
    this.name = null;

    /**
     * Node state core for the last {@link SceneJS.Tag} visited during scene graph compilation traversal
     * @type Object
     */
    this.tag = null;

    /**
     * Node state core for the last render {@link SceneJS.Node} listener encountered during scene graph compilation traversal
     * @type Object
     */
    this.renderListeners = null;

    /**
     * Node state core for the last {@link SceneJS.Shader} visited during scene graph compilation traversal
     * @type Object
     */
    this.shader = null;

    /**
     * Node state core for the last {@link SceneJS.ShaderParams} visited during scene graph compilation traversal
     * @type Object
     */
    this.shaderParams = null;

    /**
     * Node state core for the last {@link SceneJS.Style} visited during scene graph compilation traversal
     * @type Object
     */
    this.style = null;

    /**
     * Node state core for the last {@link SceneJS.Geometry} visited during scene graph compilation traversal
     * @type Object
     */
    this.geometry = null;

    /* Factory which creates and recycles {@link SceneJS_Object} instances
     */
    this._objectFactory = new SceneJS_ObjectFactory();

    /**
     * The objects in the display
     */
    this._objects = {};

    /**
     * Ambient color, which must be given to gl.clearColor before draw list iteration
     */
    this._ambientColor = [0, 0, 0, 1.0];

    /**
     * The object list, containing all elements of #_objects, kept in GL state-sorted order
     */
    this._objectList = [];
    this._objectListLen = 0;

    this._objectPickList = [null];  // Index 0 reserved for background (i.e. no pick)
    this._objectPickListLen = 1;


    /* The "draw list", comprised collectively of three lists of state chunks belong to visible objects
     * within #_objectList: a "pick" list to render a pick buffer for colour-indexed GPU picking, along with an
     * "draw" list for normal image rendering.  The chunks in these lists are held in the state-sorted order of
     * their objects in #_objectList, with runs of duplicate states removed.
     */
    this._drawList = [];                // State chunk list to render all objects
    this._drawListLen = 0;

    this._pickDrawList = [];            // State chunk list to render scene to pick buffer
    this._pickDrawListLen = 0;

    this._targetList = [];
    this._targetListLen = 0;

    this._objectDrawList = [];
    this._objectDrawListLen = 0;

    // Tracks the index of the first chunk in the transparency pass. The first run of chunks
    // in the list are for opaque objects, while the remainder are for transparent objects.
    // This supports a mode in which we only render the opaque chunks.
    this._drawListTransparentIndex = -1;

    /* The frame context holds state shared across a single render of the draw list, along with any results of
     * the render, such as pick hits
     */
    this._frameCtx = {
        pickNames: [], // Pick names of objects hit during pick render,
        regionData: [],
        canvas: this._canvas,           // The canvas
        VAO: null                       // Vertex array object extension
    };

    /* The frame context has this facade which is given to scene node "rendered" listeners
     * to allow application code to access things like transform matrices from within those listeners.
     */
    this._frameCtx.renderListenerCtx = new SceneJS.RenderContext(this._frameCtx);

    /*-------------------------------------------------------------------------------------
     * Flags which schedule what the display is to do when #render is next called.
     *------------------------------------------------------------------------------------*/

    /**
     * Flags the object list as needing to be rebuilt from existing objects on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #2 (see class comment),
     * causing object list rebuild, state order determination, state sort, draw list construction and image render.
     * @type Boolean
     */
    this.objectListDirty = true;

    /**
     * Flags the object list as needing state orders to be computed on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #3 (see class comment),
     * causing state order determination, state sort, draw list construction and image render.
     * @type Boolean
     */
    this.stateOrderDirty = true;

    /**
     * Flags the object list as needing to be state sorted on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #4 (see class comment),
     * causing state sort, draw list construction and image render.
     * @type Boolean
     */
    this.stateSortDirty = true;

    /**
     * Flags the draw list as needing to be rebuilt from the object list on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #5 (see class comment),
     * causing draw list construction and image render.
     * @type Boolean
     */
    this.drawListDirty = true;

    /**
     * Flags the image as needing to be redrawn from the draw list on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #6 (see class comment),
     * causing the image render.
     * @type Boolean
     */
    this.imageDirty = true;
};

/**
 * Reallocates WebGL resources for objects within this display
 */
SceneJS_Display.prototype.webglRestored = function () {
    this._programFactory.webglRestored();// Reallocate programs
    this._chunkFactory.webglRestored(); // Recache shader var locations
    var gl = this._canvas.gl;
    if (this.pickBuf) {
        this.pickBuf.webglRestored(gl);          // Rebuild pick buffers
    }
    this.imageDirty = true;             // Need redraw
};

/**
 * Internally creates (or updates) a {@link SceneJS_Object} of the given ID from whatever node state cores are currently set
 * on this {@link SceneJS_Display}. The object is created if it does not already exist in the display, otherwise it is
 * updated with the current state cores, possibly replacing cores already referenced by the object.
 *
 * @param {String} objectId ID of object to create or update
 */
SceneJS_Display.prototype.buildObject = function (objectId) {

    var object = this._objects[objectId];

    if (!object) { // Create object
        object = this._objects[objectId] = this._objectFactory.getObject(objectId);
        this.objectListDirty = true;
    }

    object.modelTransform = this.modelTransform;
    object.viewTransform = this.viewTransform;
    object.projTransform = this.projTransform;
    object.stage = this.stage;
    object.layer = this.layer;
    object.renderTarget = this.renderTarget;
    object.texture = this.texture;
    object.cubemap = this.cubemap;
    object.geometry = this.geometry;
    object.morphGeometry = this.morphGeometry;
    object.enable = this.enable;
    object.flags = this.flags;
    object.tag = this.tag;
    object.name = this.name;

    //if (!object.hash) {

    var hash = ([                   // Build current state hash
        this.geometry.hash,
        this.shader.hash,
        this.clips.hash,
        this.morphGeometry.hash,
        this.texture.hash,
        this.fresnel.hash,
        this.cubemap.hash,
        this.lights.hash,
        this.flags.hash,
        this.regionMap.hash,
        this.billboard.hash
    ]).join(";");

    if (!object.program || hash != object.hash) {
        // Get new program for object if no program or hash mismatch
        if (object.program) {
            this._programFactory.putProgram(object.program);
        }
        object.program = this._programFactory.getProgram(hash, this);
        object.hash = hash;
    }
    //}

    // Build draw chunks for object

    this._setChunk(object, 0, "program");          // Must be first
    this._setChunk(object, 1, "xform", this.modelTransform);
    this._setChunk(object, 2, "lookAt", this.viewTransform);
    this._setChunk(object, 3, "camera", this.projTransform);
    this._setChunk(object, 4, "flags", this.flags);
    this._setChunk(object, 5, "shader", this.shader);
    this._setChunk(object, 6, "shaderParams", this.shaderParams);
    this._setChunk(object, 7, "style", this.style);
    this._setChunk(object, 8, "depthBuffer", this.depthBuffer);
    this._setChunk(object, 9, "colorBuffer", this.colorBuffer);
    this._setChunk(object, 10, "view", this.view);
    this._setChunk(object, 11, "lights", this.lights);
    this._setChunk(object, 12, "material", this.material);
    this._setChunk(object, 13, "texture", this.texture);
    this._setChunk(object, 14, "regionMap", this.regionMap);
    this._setChunk(object, 15, "fresnel", this.fresnel);
    this._setChunk(object, 16, "cubemap", this.cubemap);
    this._setChunk(object, 17, "clips", this.clips);
    this._setChunk(object, 18, "renderer", this.renderer);
    this._setChunk(object, 19, "geometry", this.morphGeometry, this.geometry);
    this._setChunk(object, 20, "listeners", this.renderListeners);      // Must be after the above chunks
    this._setChunk(object, 21, "draw", this.geometry); // Must be last

    // At the very least, the object sort order
    // will need be recomputed

    this.stateOrderDirty = true;
};

SceneJS_Display.prototype._setChunk = function (object, order, chunkType, core, core2) {

    var chunkId;
    var chunkClass = this._chunkFactory.chunkTypes[chunkType];

    if (core) {

        // Core supplied
        if (core.empty) { // Only set default cores for state types that have them
            var oldChunk = object.chunks[order];
            if (oldChunk) {
                this._chunkFactory.putChunk(oldChunk); // Release previous chunk to pool
            }
            object.chunks[order] = null;
            return;
        }

        // Note that core.stateId can be either a number or a string, that's why we make
        // chunkId a string here.
        // TODO: Would it be better if all were numbers?
        chunkId = chunkClass.prototype.programGlobal
            ? '_' + core.stateId
            : 'p' + object.program.id + '_' + core.stateId;

        if (core2) {
            chunkId += '__' + core2.stateId;
        }

    } else {

        // No core supplied, probably a program.
        // Only one chunk of this type per program.
        chunkId = 'p' + object.program.id;
    }

    // This is needed so that chunkFactory can distinguish between draw and geometry
    // chunks with the same core.
    chunkId = order + '__' + chunkId;

    var oldChunk = object.chunks[order];

    if (oldChunk) {
        if (oldChunk.id == chunkId) { // Avoid needless chunk reattachment
            return;
        }
        this._chunkFactory.putChunk(oldChunk); // Release previous chunk to pool
    }

    object.chunks[order] = this._chunkFactory.getChunk(chunkId, chunkType, object.program, core, core2); // Attach new chunk

    // Ambient light is global across everything in display, and
    // can never be disabled, so grab it now because we want to
    // feed it to gl.clearColor before each display list render
    if (chunkType == "lights") {
        this._setAmbient(core);
    }
};

SceneJS_Display.prototype._setAmbient = function (core) {
    var lights = core.lights;
    var light;
    for (var i = 0, len = lights.length; i < len; i++) {
        light = lights[i];
        if (light.mode == "ambient") {
            this._ambientColor[0] = light.color[0];
            this._ambientColor[1] = light.color[1];
            this._ambientColor[2] = light.color[2];
        }
    }
};

/**
 * Removes an object from this display
 *
 * @param {String} objectId ID of object to remove
 */
SceneJS_Display.prototype.removeObject = function (objectId) {
    var object = this._objects[objectId];
    if (!object) {
        return;
    }
    this._programFactory.putProgram(object.program);
    object.program = null;
    object.hash = null;
    var chunk;
    for (var i = 0, len = object.chunks.length; i < len; i++) {
        chunk = object.chunks[i];
        if (chunk) {
            this._chunkFactory.putChunk(chunk);
        }
    }
    this._objectFactory.putObject(object);
    delete this._objects[objectId];
    this.objectListDirty = true;
};

/**
 * Set a tag selector to selectively activate objects that have matching SceneJS.Tag nodes
 */
SceneJS_Display.prototype.selectTags = function (tagSelector) {
    this._tagSelector = tagSelector;
    this.drawListDirty = true;
};

/**
 * Render this display. What actually happens in the method depends on what flags are set.
 *
 */
SceneJS_Display.prototype.render = function (params) {

    params = params || {};

    if (this.objectListDirty) {
        this._buildObjectList();          // Build object render bin
        this.objectListDirty = false;
        this.stateOrderDirty = true;        // Now needs state ordering
    }

    if (this.stateOrderDirty) {
        this._makeStateSortKeys();       // Compute state sort order
        this.stateOrderDirty = false;
        this.stateSortDirty = true;     // Now needs state sorting
    }

    if (this.stateSortDirty) {
        this._stateSort();              // State sort the object render bin
        this.stateSortDirty = false;
        this.drawListDirty = true;      // Now needs new visible object bin
        //this._logObjectList();
    }

    if (this.drawListDirty) {           // Render visible list while building transparent list
        this._buildDrawList();
        this.imageDirty = true;
        //this._logDrawList();
        //this._logPickList();
    }

    if (this.imageDirty || params.force) {
        SceneJS_events.fireEvent(SceneJS_events.RENDER, {
            forced: !!params.force
        });
        this._doDrawList({ // Render, no pick
            clear: (params.clear !== false), // Clear buffers by default
            opaqueOnly: params.opaqueOnly
        });
        this.imageDirty = false;
        this.pickBufDirty = true;       // Pick buff will now need rendering on next pick
    }
};

SceneJS_Display.prototype._buildObjectList = function () {
    var lastObjectListLen = this._objectListLen;
    this._objectListLen = 0;
    for (var objectId in this._objects) {
        if (this._objects.hasOwnProperty(objectId)) {
            this._objectList[this._objectListLen++] = this._objects[objectId];
        }
    }

    // Release memory

    if (lastObjectListLen > this._objectListLen) {
        for (i = this._objectListLen; i < lastObjectListLen; i++) {
            this._objectList[i] = null;
        }
    }

};

SceneJS_Display.prototype._makeStateSortKeys = function () {
    //  console.log("--------------------------------------------------------------------------------------------------");
    // console.log("SceneJS_Display_makeSortKeys");
    var object;
    for (var i = 0, len = this._objectListLen; i < len; i++) {
        object = this._objectList[i];
        if (!object.program) {
            // Non-visual object (eg. sound)
            object.sortKey = -1;
        } else {
            object.sortKey =
                ((object.stage.priority + 1) * 1000000000000)
                + ((object.flags.transparent ? 2 : 1) * 1000000000)
                + ((object.layer.priority + 1) * 1000000)
                + ((object.program.id + 1) * 1000)
                + object.texture.stateId;
        }
    }
    //  console.log("--------------------------------------------------------------------------------------------------");
};

SceneJS_Display.prototype._stateSort = function () {
    this._objectList.length = this._objectListLen;
    this._objectList.sort(this._stateSortObjects);
};

SceneJS_Display.prototype._stateSortObjects = function (a, b) {
    return a.sortKey - b.sortKey;
};

SceneJS_Display.prototype._logObjectList = function () {
    console.log("--------------------------------------------------------------------------------------------------");
    console.log(this._objectListLen + " objects");
    for (var i = 0, len = this._objectListLen; i < len; i++) {
        var object = this._objectList[i];
        console.log("SceneJS_Display : object[" + i + "] sortKey = " + object.sortKey);
    }
    console.log("--------------------------------------------------------------------------------------------------");
};

SceneJS_Display.prototype._buildDrawList = function () {

    this._lastStateId = this._lastStateId || [];
    this._lastPickStateId = this._lastPickStateId || [];

    var i;

    for (i = 0; i < 25; i++) {
        this._lastStateId[i] = null;
        this._lastPickStateId[i] = null;
    }

    var lastDrawListLen = this._drawListLen;
    var lastPickDrawListLen = this._pickDrawListLen;
    var lastObjectDrawListLen = this._objectDrawListLen;
    var lastObjectPickListLen = this._objectPickListLen;

    this._drawListLen = 0;
    this._pickDrawListLen = 0;
    this._objectDrawListLen = 0;
    this._objectPickListLen = 1;

    this._drawListTransparentIndex = -1;

    // For each render target, a list of objects to render to that target
    var targetObjectLists = {};

    // A list of all the render target object lists
    var targetListList = [];

    // List of all targets
    var targetList = [];

    var object;
    var tagMask;
    var tagRegex;
    var tagCore;
    var flags;

    if (this._tagSelector) {
        tagMask = this._tagSelector.mask;
        tagRegex = this._tagSelector.regex;
    }
    
    for (i = 0, len = this._objectListLen; i < len; i++) {

        object = this._objectList[i];

        // Cull invisible objects
        if (object.enable.enabled === false) {
            continue;
        }

        flags = object.flags;

        // Cull invisible objects
        if (flags.enabled === false) {
            continue;
        }

        // Cull objects in disabled layers
        if (!object.layer.enabled) {
            continue;
        }

        // Cull objects with unmatched tags
        if (tagMask) {
            tagCore = object.tag;
            if (tagCore.tag) {
                if (tagCore.mask != tagMask) { // Scene tag mask was updated since last render
                    tagCore.mask = tagMask;
                    tagCore.matches = tagRegex.test(tagCore.tag);
                }
                if (!tagCore.matches) {
                    continue;
                }
            }
        }

        // Put objects with render targets into a bin for each target
        if (object.renderTarget.targets) {
            var targets = object.renderTarget.targets;
            var target;
            var coreId;
            var list;
            for (var j = 0, lenj = targets.length; j < lenj; j++) {
                target = targets[j];
                coreId = target.coreId;
                list = targetObjectLists[coreId];
                if (!list) {
                    list = [];
                    targetObjectLists[coreId] = list;
                    targetListList.push(list);
                    targetList.push(this._chunkFactory.getChunk(target.stateId, "renderTarget", object.program, target));
                }
                list.push(object);
            }
        } else {

            //
            this._objectDrawList[this._objectDrawListLen++] = object;
        }
    }

    // Append chunks for objects within render targets first

    var list;
    var target;
    var object;
    var pickable;

    for (i = 0, len = targetListList.length; i < len; i++) {

        list = targetListList[i];
        target = targetList[i];

        this._appendRenderTargetChunk(target);

        for (var j = 0, lenj = list.length; j < lenj; j++) {
            object = list[j];
            pickable = object.stage && object.stage.pickable
                && object.flags && object.flags.picking; // We'll only pick objects in pickable stages
            this._appendObjectToDrawLists(object, pickable);
        }
    }

    if (object) {

        // Unbinds any render target bound previously
        this._appendRenderTargetChunk(this._chunkFactory.getChunk(-1, "renderTarget", object.program, {}));
    }

    // Append chunks for objects not in render targets

    for (i = 0, len = this._objectDrawListLen; i < len; i++) {
        object = this._objectDrawList[i];
        pickable = (!object.stage || (object.stage && object.stage.pickable))
            && (object.flags && object.flags.picking); // We'll only pick objects in pickable stages
        this._appendObjectToDrawLists(object, pickable);
    }

    // Release memory

    if (lastDrawListLen > this._drawListLen) {
        for (i = this._drawListLen; i < lastDrawListLen; i++) {
            this._drawList[i] = null;
        }
    }

    if (lastPickDrawListLen > this._pickDrawListLen) {
        for (i = this._pickDrawListLen; i < lastPickDrawListLen; i++) {
            this._pickDrawList[i] = null;
        }
    }

    if (lastObjectDrawListLen > this._objectDrawListLen) {
        for (i = this._objectDrawListLen; i < lastObjectDrawListLen; i++) {
            this._objectDrawList[i] = null;
        }
    }

    if (lastObjectPickListLen > this._objectPickListLen) {
        for (i = this._objectPickListLen; i < lastObjectPickListLen; i++) {
            this._objectPickList[i] = null;
        }
    }

    this.drawListDirty = false;
};


SceneJS_Display.prototype._appendRenderTargetChunk = function (chunk) {
    this._drawList[this._drawListLen++] = chunk;
};

/**
 * Appends an object to the draw and pick lists.
 * @param object
 * @param pickable
 * @private
 */
SceneJS_Display.prototype._appendObjectToDrawLists = function (object, pickable) {
    var chunks = object.chunks;
    var chunk;
    for (var i = 0, len = chunks.length; i < len; i++) {
        chunk = chunks[i];
        if (chunk) {

            // As we apply the state chunk lists we track the ID of most types of chunk in order
            // to cull redundant re-applications of runs of the same chunk - except for those chunks with a
            // 'unique' flag, because we don't want to cull runs of draw chunks because they contain the GL
            // drawElements calls which render the objects.

            if (chunk.draw) {
                if (chunk.unique || this._lastStateId[i] != chunk.id) { // Don't reapply repeated states
                    this._drawList[this._drawListLen] = chunk;
                    this._lastStateId[i] = chunk.id;

                    // Get index of first chunk in transparency pass

                    if (chunk.core && chunk.core && chunk.core.transparent) {
                        if (this._drawListTransparentIndex < 0) {
                            this._drawListTransparentIndex = this._drawListLen;
                        }
                    }
                    this._drawListLen++;
                }
            }

            if (chunk.pick) {
                if (pickable !== false) {   // Don't pick objects in unpickable stages
                    if (chunk.unique || this._lastPickStateId[i] != chunk.id) { // Don't reapply repeated states
                        this._pickDrawList[this._pickDrawListLen++] = chunk;
                        this._lastPickStateId[i] = chunk.id;
                    }
                }
            }
        }
    }
    if (pickable) {
        this._objectPickList[this._objectPickListLen++] = object;
    }
};

/**
 * Logs the contents of the draw list to the console.
 * @private
 */
SceneJS_Display.prototype._logDrawList = function () {
    console.log("--------------------------------------------------------------------------------------------------");
    console.log(this._drawListLen + " draw list chunks");
    for (var i = 0, len = this._drawListLen; i < len; i++) {
        var chunk = this._drawList[i];
        console.log("[chunk " + i + "] type = " + chunk.type);
        switch (chunk.type) {
            case "draw":
                console.log("\n");
                break;
            case "renderTarget":
                console.log(" bufType = " + chunk.core.bufType);
                break;
        }
    }
    console.log("--------------------------------------------------------------------------------------------------");
};

/**
 * Logs the contents of the pick list to the console.
 * @private
 */
SceneJS_Display.prototype._logPickList = function () {
    console.log("--------------------------------------------------------------------------------------------------");
    console.log(this._pickDrawListLen + " pick list chunks");
    for (var i = 0, len = this._pickDrawListLen; i < len; i++) {
        var chunk = this._pickDrawList[i];
        console.log("[chunk " + i + "] type = " + chunk.type);
        switch (chunk.type) {
            case "draw":
                console.log("\n");
                break;
            case "renderTarget":
                console.log(" bufType = " + chunk.core.bufType);
                break;
        }
    }
    console.log("--------------------------------------------------------------------------------------------------");
};

(function () {

// Cached vectors to avoid garbage collection

    var origin = SceneJS_math_vec3();
    var dir = SceneJS_math_vec3();

    var a = SceneJS_math_vec3();
    var b = SceneJS_math_vec3();
    var c = SceneJS_math_vec3();

    var na = SceneJS_math_vec3();
    var nb = SceneJS_math_vec3();
    var nc = SceneJS_math_vec3();

    var uva = SceneJS_math_vec3();
    var uvb = SceneJS_math_vec3();
    var uvc = SceneJS_math_vec3();

    var tempMat4 = SceneJS_math_mat4();
    var tempMat4b = SceneJS_math_mat4();

    var tempVec4 = SceneJS_math_vec4();
    var tempVec4b = SceneJS_math_vec4();
    var tempVec4c = SceneJS_math_vec4();

    var tempVec3 = SceneJS_math_vec3();
    var tempVec3b = SceneJS_math_vec3();
    var tempVec3c = SceneJS_math_vec3();
    var tempVec3d = SceneJS_math_vec3();
    var tempVec3e = SceneJS_math_vec3();
    var tempVec3f = SceneJS_math_vec3();
    var tempVec3g = SceneJS_math_vec3();
    var tempVec3h = SceneJS_math_vec3();
    var tempVec3i = SceneJS_math_vec3();
    var tempVec3j = SceneJS_math_vec3();


    // Given a GameObject and camvas coordinates, gets a ray
    // originating at the World-space eye position that passes
    // through the perspective projection plane. The ray is
    // returned via the origin and dir arguments.

    function getLocalRay(canvas, object, canvasCoords, origin, dir) {

        var modelMat = object.modelTransform.matrix;
        var viewMat = object.viewTransform.matrix;
        var projMat = object.projTransform.matrix;

        var vmMat = SceneJS_math_mulMat4(viewMat, modelMat, tempMat4);
        var pvMat = SceneJS_math_mulMat4(projMat, vmMat, tempMat4b);
        var pvMatInverse = SceneJS_math_inverseMat4(pvMat, tempMat4b);

        //var modelMatInverse = math.inverseMat4(modelMat, tempMat4c);

        // Calculate clip space coordinates, which will be in range
        // of x=[-1..1] and y=[-1..1], with y=(+1) at top

        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;

        var clipX = (canvasCoords[0] - canvasWidth / 2) / (canvasWidth / 2);  // Calculate clip space coordinates
        var clipY = -(canvasCoords[1] - canvasHeight / 2) / (canvasHeight / 2);

        var local1 = SceneJS_math_transformVector4(pvMatInverse, [clipX, clipY, -1, 1], tempVec4);
        local1 = SceneJS_math_mulVec4Scalar(local1, 1 / local1[3]);

        var local2 = SceneJS_math_transformVector4(pvMatInverse, [clipX, clipY, 1, 1], tempVec4b);
        local2 = SceneJS_math_mulVec4Scalar(local2, 1 / local2[3]);

        origin[0] = local1[0];
        origin[1] = local1[1];
        origin[2] = local1[2];

        SceneJS_math_subVec3(local2, local1, dir);

        SceneJS_math_normalizeVec3(dir);
    }

    /**
     * Performs a pick on the display graph and returns info on the result.
     * @param {*} params
     * @returns {*}
     */
    SceneJS_Display.prototype.pick = function (params) {

        var canvas = this._canvas.canvas;
        var resolutionScaling = this._canvas.resolutionScaling;
        var canvasX = params.canvasX * resolutionScaling;
        var canvasY = params.canvasY * resolutionScaling;
        var canvasPos = [canvasX, canvasY];
        var pickBuf = this.pickBuf;
        var hit = null;
        var object;
        var i;
        var len;

        // Lazy-create pick buffer

        if (!pickBuf) {
            pickBuf = this.pickBuf = new SceneJS._webgl.RenderBuffer({
                canvas: this._canvas
            });
        }

        this.render(); // Do any pending visible render

        //------------------------------------------------------------------
        // Pick an object using color-indexed render
        //------------------------------------------------------------------

        pickBuf.bind();

        pickBuf.clear();

        this._doDrawList({
            pickObject: true,
            clear: true
        });

        this._canvas.gl.finish();

        // Read pixel color in pick buffer at given coordinates,
        // convert to an index into the pick name list

        var pix = pickBuf.read(canvasX, canvasY);

        var pickedColorIndex = pix[0] + (pix[1] * 256) + (pix[2] * 256 * 256) + (pix[3] * 256 * 256 * 256);

        object = this._objectPickList[pickedColorIndex];

        if (object) {

            hit = {
                canvasPos: canvasPos
            };

            var name = object.name;

            if (name) {
                hit.name = name.name;
                hit.path = name.path;
                hit.nodeId = name.nodeId;
            }
        }

        if (params.pickRegion) {

            //------------------------------------------------------------------
            // Pick a region
            // Region picking is independent of having picked an object
            //------------------------------------------------------------------

            pickBuf.clear();

            this._doDrawList({
                pickRegion: true,
                object: object,
                clear: true
            });

            pix = pickBuf.read(canvasX, canvasY);

            if (pix[0] !== 0 || pix[1] !== 0 || pix[2] !== 0 || pix[3] !== 0) {

                hit = hit || {
                        canvasPos: canvasPos
                    };

                var regionColor = {r: pix[0] / 255, g: pix[1] / 255, b: pix[2] / 255, a: pix[3] / 255};
                var regionData = this._frameCtx.regionData;
                var tolerance = 0.01;
                var data = {};
                var color, delta;

                for (i = 0, len = regionData.length; i < len; i++) {
                    color = regionData[i].color;
                    if (regionColor && regionData[i].data) {
                        delta = Math.max(
                            Math.abs(regionColor.r - color.r),
                            Math.abs(regionColor.g - color.g),
                            Math.abs(regionColor.b - color.b),
                            Math.abs(regionColor.a - (color.a === undefined ? regionColor.a : color.a))
                        );

                        if (delta < tolerance) {
                            data = regionData[i].data;
                            break;
                        }
                    }
                }

                hit.color = regionColor;
                hit.regionData = data;
            }
        }

        if (params.pickTriangle && object) {

            //------------------------------------------------------------------
            // Pick a triangle on the picked object
            //------------------------------------------------------------------

            pickBuf.clear();

            this._doDrawList({
                pickTriangle: true,
                object: object,
                clear: true
            });

            pix = pickBuf.read(canvasX, canvasY);
            var primitiveIndex = pix[0] + (pix[1] * 256) + (pix[2] * 256 * 256) + (pix[3] * 256 * 256 * 256);
            primitiveIndex *= 3; // Convert from triangle number to first vertex in indices

            hit.primitiveIndex = primitiveIndex;

            var geometry = object.geometry;

            if (geometry.primitiveName === "triangles") {

                // Triangle picked; this only happens when the
                // GameObject has a Geometry that has primitives of type "triangle"

                hit.primitive = "triangle";

                // Attempt to ray-pick the triangle; in World-space, fire a ray
                // from the eye position through the mouse position
                // on the perspective projection plane

                getLocalRay(canvas, object, canvasPos, origin, dir);

                // Get triangle indices

                var indices = geometry.arrays.indices;

                var ia = indices[primitiveIndex];
                var ib = indices[primitiveIndex + 1];
                var ic = indices[primitiveIndex + 2];

                var ia3 = ia * 3;
                var ib3 = ib * 3;
                var ic3 = ic * 3;

                var triangleVertices = SceneJS_math_vec3();

                triangleVertices[0] = ia;
                triangleVertices[1] = ib;
                triangleVertices[2] = ic;

                hit.indices = triangleVertices;

                // Get World-space triangle vertex positions

                var morphGeometry = object.morphGeometry;
                var targets = morphGeometry.targets;

                if (targets && targets.length > 0 && targets[0].positions) {

                    // Positions from morphGeometry

                    this._lerpTargets(
                        morphGeometry.keys,
                        morphGeometry.targets,
                        "positions",
                        ia, ib, ic,
                        morphGeometry.factor,
                        a, b, c);

                } else {

                    // Positions from static geometry

                    var positions = geometry.arrays.positions;

                    a[0] = positions[ia3];
                    a[1] = positions[ia3 + 1];
                    a[2] = positions[ia3 + 2];

                    b[0] = positions[ib3];
                    b[1] = positions[ib3 + 1];
                    b[2] = positions[ib3 + 2];

                    c[0] = positions[ic3];
                    c[1] = positions[ic3 + 1];
                    c[2] = positions[ic3 + 2];
                }
                

                // Get Local-space cartesian coordinates of the ray-triangle intersection

                var position = hit.position = SceneJS_math_rayPlaneIntersect(origin, dir, a, b, c, SceneJS_math_vec3());

                // Get interpolated World-space coordinates

                // Need to transform homogeneous coords

                tempVec4.set(position);
                tempVec4[3] = 1;

                // Get World-space cartesian coordinates of the ray-triangle intersection

                SceneJS_math_transformVector4(object.modelTransform.matrix, tempVec4, tempVec4b);

                hit.worldPos = tempVec4b.slice(0, 3);

                // Get barycentric coordinates of the ray-triangle intersection

                var barycentric = hit.barycentric = SceneJS_math_cartesianToBarycentric2(position, a, b, c, SceneJS_math_vec3());
                
                // Get interpolated normal vector

                var gotNormals = false;

                if (targets && targets.length > 0 && targets[0].normals) {

                    // Normals from morphGeometry

                    this._lerpTargets(
                        morphGeometry.keys,
                        morphGeometry.targets,
                        "normals",
                        ia, ib, ic,
                        morphGeometry.factor,
                        na, nb, nc);

                    gotNormals = true;
                }

                if (!gotNormals) {

                    // Normals from static geometry

                    var normals = geometry.arrays.normals;

                    if (normals) {

                        na[0] = normals[ia3];
                        na[1] = normals[ia3 + 1];
                        na[2] = normals[ia3 + 2];

                        nb[0] = normals[ib3];
                        nb[1] = normals[ib3 + 1];
                        nb[2] = normals[ib3 + 2];

                        nc[0] = normals[ic3];
                        nc[1] = normals[ic3 + 1];
                        nc[2] = normals[ic3 + 2];

                        gotNormals = true;
                    }
                }

                if (gotNormals) {

                    // Interpolate on triangle

                    hit.normal = SceneJS_math_addVec3(SceneJS_math_addVec3(
                            SceneJS_math_mulVec3Scalar(na, barycentric[0], tempVec3),
                            SceneJS_math_mulVec3Scalar(nb, barycentric[1], tempVec3b), tempVec3c),
                        SceneJS_math_mulVec3Scalar(nc, barycentric[2], tempVec3d), SceneJS_math_vec3());
                }

                // Get interpolated UV coordinates in each UV layer

                var uvLayers = geometry.arrays.uvs;

                if (uvLayers && uvLayers.length > 0) {

                    hit.uvs = []; // TODO: Optimize for GC

                    var uvs;
                    var uv;
                    var ia2 = ia * 2;
                    var ib2 = ib * 2;
                    var ic2 = ic * 2;

                    for (i = 0, len = uvLayers.length; i < len; i++) {

                        uvs = uvLayers[i];

                        if (!uvs) {

                            uvs.push(null);

                        } else {

                            uva[0] = uvs[ia2];
                            uva[1] = uvs[ia2 + 1];

                            uvb[0] = uvs[ib2];
                            uvb[1] = uvs[ib2 + 1];

                            uvc[0] = uvs[ic2];
                            uvc[1] = uvs[ic2 + 1];

                            uv = SceneJS_math_addVec3(
                                SceneJS_math_addVec3(
                                    SceneJS_math_mulVec2Scalar(uva, barycentric[0], tempVec3f),
                                    SceneJS_math_mulVec2Scalar(uvb, barycentric[1], tempVec3g), tempVec3h),
                                SceneJS_math_mulVec2Scalar(uvc, barycentric[2], tempVec3i), SceneJS_math_vec3());

                            hit.uvs.push(uv);
                        }
                    }

                    if (uvLayers.length > 0) {
                        hit.uv = hit.uvs[0]; // Backward compatibility
                    }
                }
            }
        }

        pickBuf.unbind();

        return hit;
    };

    SceneJS_Display.prototype._lerpTargets = function (times,
                                                       targets,
                                                       arrayName,
                                                       ia, ib, ic,
                                                       time,
                                                       a, b, c) {

        // Trivial case in which we can just return the
        // positions at a target matching the given time

        for (var i = 0; i < times.length; i++) {
            if (times[i] === time) {

                var array = targets[i][arrayName];

                var ia3 = ia * 3;
                var ib3 = ib * 3;
                var ic3 = ic * 3;

                a[0] = array[ia3];
                a[1] = array[ia3 + 1];
                a[2] = array[ia3 + 2];

                b[0] = array[ib3];
                b[1] = array[ib3 + 1];
                b[2] = array[ib3 + 2];

                c[0] = array[ic3];
                c[1] = array[ic3 + 1];
                c[2] = array[ic3 + 2];

                return;
            }
        }

        // Find the indexes of the targets that enclose the given time

        var i2 = 0;

        while (times[i2] < time) {
            i2++;
        }

        var i1 = i2 - 1;

        this._lerpTargetPair(
            time,
            times[i1],
            times[i2],
            targets[i1][arrayName],
            targets[i2][arrayName],
            ia, ib, ic,
            a, b, c
        );
    };

    var a1 = SceneJS_math_vec3();
    var b1 = SceneJS_math_vec3();
    var c1 = SceneJS_math_vec3();
    var a2 = SceneJS_math_vec3();
    var b2 = SceneJS_math_vec3();
    var c2 = SceneJS_math_vec3();

    SceneJS_Display.prototype._lerpTargetPair = function (time, time1, time2, target1, target2, ia, ib, ic, a, b, c) {

        var ia3 = ia * 3;
        var ib3 = ib * 3;
        var ic3 = ic * 3;

        a1[0] = target1[ia3];
        a1[1] = target1[ia3 + 1];
        a1[2] = target1[ia3 + 2];

        b1[0] = target1[ib3];
        b1[1] = target1[ib3 + 1];
        b1[2] = target1[ib3 + 2];

        c1[0] = target1[ic3];
        c1[1] = target1[ic3 + 1];
        c1[2] = target1[ic3 + 2];

        a2[0] = target2[ia3];
        a2[1] = target2[ia3 + 1];
        a2[2] = target2[ia3 + 2];

        b2[0] = target2[ib3];
        b2[1] = target2[ib3 + 1];
        b2[2] = target2[ib3 + 2];

        c2[0] = target2[ic3];
        c2[1] = target2[ic3 + 1];
        c2[2] = target2[ic3 + 2];

        SceneJS_math_lerpVec3(time, time1, time2, a1, a2, a);
        SceneJS_math_lerpVec3(time, time1, time2, b1, b2, b);
        SceneJS_math_lerpVec3(time, time1, time2, c1, c2, c);
    };

})();

/** Renders either the draw or pick list.
 *
 * @param {*} params
 * @param {Boolean} params.clear Set true to clear the color, depth and stencil buffers first
 * @param {*} params.object Object to render chunks of, for pickTriangle or pickRegion modes
 * @param {Boolean} params.pickObject Set true to render for object-picking, using per-object indexed color
 * @param {Boolean} params.pickTriangle Set true to render for triangle-picking, using per-triangle indexed color
 * @param {Boolean} params.pickRegion Set true to render for region-picking
 * @param {Boolean} params.transparent Set false to only render opaque objects
 * @private
 */
SceneJS_Display.prototype._doDrawList = function (params) {

    var gl = this._canvas.gl;

    // Reset frame context
    var frameCtx = this._frameCtx;

    frameCtx.renderTarget = null;
    frameCtx.targetIndex = 0;
    frameCtx.renderBuf = null;
    frameCtx.viewMat = null;
    frameCtx.modelMat = null;
    frameCtx.cameraMat = null;
    frameCtx.renderer = null;
    frameCtx.depthbufEnabled = null;
    frameCtx.clearDepth = null;
    frameCtx.depthFunc = gl.LESS;
    frameCtx.scissorTestEnabled = false;
    frameCtx.blendEnabled = false;
    frameCtx.backfaces = true;
    frameCtx.frontface = "ccw";
    frameCtx.picking = !!params.pickObject || !!params.pickTriangle || !!params.pickRegion;
    frameCtx.pickObject = !!params.pickObject;
    frameCtx.pickTriangle = !!params.pickTriangle;
    frameCtx.pickRegion = !!params.pickRegion;
    frameCtx.pickIndex = 1;
    frameCtx.textureUnit = 0;
    frameCtx.lineWidth = 1;
    frameCtx.transparent = false;
    frameCtx.ambientColor = this._ambientColor;
    frameCtx.aspect = this._canvas.canvas.width / this._canvas.canvas.height;
    frameCtx.texture = null;
    frameCtx.normalMapUVLayerIdx = -1;
    frameCtx.regionMapUVLayerIdx = -1;

    // The extensions needs to be re-queried in case the context was lost and has been recreated.
    if (SceneJS.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"]) {
        gl.getExtension("OES_element_index_uint");
    }

    var VAO = gl.getExtension("OES_vertex_array_object");
    frameCtx.VAO = (VAO) ? VAO : null;

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    if (this.transparent || frameCtx.picking) {
        gl.clearColor(0, 0, 0, 0);
    } else {
        gl.clearColor(this._ambientColor[0], this._ambientColor[1], this._ambientColor[2], 1.0);
    }

    if (params.clear) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    }

    gl.frontFace(gl.CCW);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    if (params.pickObject) {

        // Pick object
        // Render whole draw list

        for (var i = 0, len = this._pickDrawListLen; i < len; i++) {
            this._pickDrawList[i].pick(frameCtx);
        }

    } else if (params.pickRegion || params.pickTriangle) {

        // Pick region or triangle

        if (params.object) {

            // Object was picked
            // Render just the chunks of the target object

            var chunks = params.object.chunks;
            var chunk;

            for (var i = 0, len = chunks.length; i < len; i++) {
                chunk = chunks[i];
                if (chunk && chunk.pick) {
                    chunk.pick(frameCtx);
                }
            }

        } else {

            // No object was picked
            // Render whole draw list

            if (params.pickRegion) {

                for (var i = 0, len = this._pickDrawListLen; i < len; i++) {
                    this._pickDrawList[i].pick(frameCtx);
                }
            }
        }

    } else {

        // Render scene
        // Render whole draw list

        // Option to only render opaque objects
        var len = (params.opaqueOnly && this._drawListTransparentIndex >= 0 ? this._drawListTransparentIndex : this._drawListLen);

        // Render for draw
        for (var i = 0; i < len; i++) {      // Push opaque rendering chunks
            this._drawList[i].draw(frameCtx);
        }
    }

    gl.flush();

    if (frameCtx.renderBuf) {
        frameCtx.renderBuf.unbind();
    }

    if (frameCtx.VAO) {
        frameCtx.VAO.bindVertexArrayOES(null);
        for (var i = 0; i < 10; i++) {
            gl.disableVertexAttribArray(i);
        }
    }
//
//    var numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
//    for (var ii = 0; ii < numTextureUnits; ++ii) {
//        gl.activeTexture(gl.TEXTURE0 + ii);
//        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
//        gl.bindTexture(gl.TEXTURE_2D, null);
//    }
};

SceneJS_Display.prototype.readPixels = function (entries, size, opaqueOnly) {

    if (!this._readPixelBuf) {
        this._readPixelBuf = new SceneJS._webgl.RenderBuffer({canvas: this._canvas});
    }

    this._readPixelBuf.bind();

    this._readPixelBuf.clear();

    this.render({
        force: true,
        opaqueOnly: opaqueOnly
    });

    var entry;
    var color;

    for (var i = 0; i < size; i++) {

        entry = entries[i] || (entries[i] = {});

        color = this._readPixelBuf.read(entry.x, entry.y);

        entry.r = color[0];
        entry.g = color[1];
        entry.b = color[2];
        entry.a = color[3];
    }

    this._readPixelBuf.unbind();
};

/**
 * Unpacks a color-encoded depth
 * @param {Array(Number)} depthZ Depth encoded as an RGBA color value
 * @returns {Number}
 * @private
 */
SceneJS_Display.prototype._unpackDepth = function (depthZ) {
    var vec = [depthZ[0] / 256.0, depthZ[1] / 256.0, depthZ[2] / 256.0, depthZ[3] / 256.0];
    var bitShift = [1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0];
    return SceneJS_math_dotVector4(vec, bitShift);
};


SceneJS_Display.prototype.destroy = function () {
    this._programFactory.destroy();
};
;/**
 * @class Manages creation, sharing and recycle of {@link SceneJS_ProgramSource} instances
 * @private
 */
var SceneJS_ProgramSourceFactory = new (function () {

    var cache = {}; // Source codes are shared across all scenes

    var states; // Cache rendering state
    var diffuseFresnel;
    var specularFresnel;
    var alphaFresnel;
    var reflectFresnel;
    var emitFresnel;
    var fragmentFresnel;
    var fresnel;
    var texturing;// True when rendering state contains textures
    var cubeMapping;
    var normals;// True when rendering state contains normals
    var solid;
    var skybox;  // True when object should be treated as a skybox
    var billboard;
    var tangents;
    var clipping;
    var morphing;
    var regionMapping;
    var regionInteraction;
    var depthTargeting;

    var src = ""; // Accumulates source code as it's being built

    /**
     * Get sourcecode for a program to render the given states
     */
    this.getSource = function (hash, _states) {

        var source = cache[hash];
        if (source) {
            source.useCount++;
            return source;
        }

        states = _states;

        diffuseFresnel = states.fresnel.diffuse;
        specularFresnel = states.fresnel.specular;
        alphaFresnel = states.fresnel.alpha;
        reflectFresnel = states.fresnel.reflect;
        emitFresnel = states.fresnel.emit;
        fragmentFresnel = states.fresnel.fragment;
        fresnel = diffuseFresnel || specularFresnel || alphaFresnel || reflectFresnel || emitFresnel || fragmentFresnel;
        texturing = hasTextures(states);
        cubeMapping = hasCubemap(states);
        normals = hasNormals(states);
        solid = states.flags.solid;
        skybox = states.flags.skybox;
        billboard = !states.billboard.empty;
        tangents = hasTangents(states);
        clipping = states.clips.clips.length > 0;
        morphing = !!states.morphGeometry.targets;
        regionMapping = hasRegionMap();
        regionInteraction = regionMapping && states.regionMap.mode !== "info";
        depthTargeting = hasDepthTarget();

        source = new SceneJS_ProgramSource(
            hash,

            vertexPicking(states),
            fragmentPicking(states),

            vertexRendering(states),
            fragmentRendering(states)
        );

        cache[hash] = source;

        return source;
    };

    /**
     * Releases program source code
     */
    this.putSource = function (hash) {
        var source = cache[hash];
        if (source) {
            if (--source.useCount == 0) {
                cache[source.hash] = null;
            }
        }
    };

    function vertexPicking() {

        begin();

        add("attribute vec3 SCENEJS_aVertex;");
        add("attribute vec4 SCENEJS_aColor;");
        add("uniform mat4 SCENEJS_uMMatrix;");
        add("uniform mat4 SCENEJS_uVMatrix;");
        add("uniform mat4 SCENEJS_uVNMatrix;");
        add("uniform mat4 SCENEJS_uPMatrix;");

        add("varying vec4 SCENEJS_vWorldVertex;");

        if (regionMapping) {
            add("attribute vec2 SCENEJS_aRegionMapUV;");
            add("varying vec2 SCENEJS_vRegionMapUV;");
        }

        if (morphing) {
            add("uniform float SCENEJS_uMorphFactor;");       // LERP factor for morph
            if (states.morphGeometry.targets[0].vertexBuf) {      // target2 has these arrays also
                add("attribute vec3 SCENEJS_aMorphVertex;");
            }
        }

        add("varying vec4 SCENEJS_vColor;");

        add("void main(void) {");

        add("   vec4 tmpVertex=vec4(SCENEJS_aVertex, 1.0); ");

        if (morphing) {
            if (states.morphGeometry.targets[0].vertexBuf) {
                add("  tmpVertex = vec4(mix(tmpVertex.xyz, SCENEJS_aMorphVertex, SCENEJS_uMorphFactor), 1.0); ");
            }
        }
        add("  SCENEJS_vWorldVertex = SCENEJS_uMMatrix * tmpVertex; ");

        add("mat4 vPosMatrix = SCENEJS_uVMatrix;");

        if (skybox) {
            add("vPosMatrix[3].xyz = vec3(0.0);");
        }

        add("  gl_Position =  SCENEJS_uPMatrix * (vPosMatrix * SCENEJS_vWorldVertex);");

        if (regionMapping) {
            add("SCENEJS_vRegionMapUV = SCENEJS_aRegionMapUV;");
        }

        add("SCENEJS_vColor = SCENEJS_aColor;");

        add("}");

        return end();
    }

    function fragmentPicking() {

        begin();

        add("precision " + getFSFloatPrecision(states._canvas.gl) + " float;");

        add("varying vec4 SCENEJS_vWorldVertex;");
        add("varying vec4  SCENEJS_vColor;");

        add("uniform float  SCENEJS_uPickMode;");                   // Z-pick mode when true else colour-pick
        add("uniform vec4  SCENEJS_uPickColor;");                   // Used in colour-pick mode
        add("uniform bool  SCENEJS_uClipping;");

        if (clipping) {
            for (var i = 0; i < states.clips.clips.length; i++) {
                add("uniform float SCENEJS_uClipMode" + i + ";");
                add("uniform vec4  SCENEJS_uClipNormalAndDist" + i + ";");
            }
        }

        if (regionMapping) {
            add("varying vec2 SCENEJS_vRegionMapUV;");
            add("uniform sampler2D SCENEJS_uRegionMapSampler;");
        }

        add("void main(void) {");

        if (clipping) {
            add("if (SCENEJS_uClipping) {");
            add("  float dist = 0.0;");
            for (var i = 0; i < states.clips.clips.length; i++) {
                add("  if (SCENEJS_uClipMode" + i + " != 0.0) {");
                add("      dist += clamp(dot(SCENEJS_vWorldVertex.xyz, SCENEJS_uClipNormalAndDist" + i + ".xyz) - SCENEJS_uClipNormalAndDist" + i + ".w, 0.0, 1000.0);");
                add("  }");
            }
            add("  if (dist > 0.0) { discard; }");
            add("}");
        }

        add("    if  (SCENEJS_uPickMode == 0.0) {");  // Pick object
        add("          gl_FragColor = SCENEJS_uPickColor;  ");

        add("    } else if (SCENEJS_uPickMode == 1.0) {"); // Pick triangle
        add("          gl_FragColor = SCENEJS_vColor;  ");

        add("    } else {"); // Pick region
        if (regionMapping) {
            add("          gl_FragColor = texture2D(SCENEJS_uRegionMapSampler, vec2(SCENEJS_vRegionMapUV.s, 1.0 - SCENEJS_vRegionMapUV.t));");
        } else {
            add("          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);");
        }
        add("    }");
        add("}");

        return end();
    }

    function hasRegionMap() {
        if (!states.regionMap.empty) {
            return hasUVs();
        }
        return false;
    }

    function hasTextures() {
        if (states.texture.layers && states.texture.layers.length > 0) {
            return hasUVs();
        }
        return false;
    }

    function hasUVs() {
        if (states.geometry.uvBufs) { // TODO only if there is at least one defined member in this array
            return true;
        }
        if (states.morphGeometry.targets && (states.morphGeometry.targets[0].uvBuf || states.morphGeometry.targets[0].uvBuf2)) {
            return true;
        }
        return false;
    }

    function hasCubemap(states) {
        return (states.flags.reflective && states.cubemap.layers && states.cubemap.layers.length > 0 && states.geometry.normalBuf);
    }

    function hasNormals(states) {
        if (states.geometry.normalBuf) {
            return true;
        }
        if (states.morphGeometry.targets && states.morphGeometry.targets[0].normalBuf) {
            return true;
        }
        return false;
    }

    function hasTangents(states) {
        if (states.texture) {
            var layers = states.texture.layers;
            if (!layers) {
                return false;
            }
            for (var i = 0, len = layers.length; i < len; i++) {
                if (layers[i].applyTo == "normals") {
                    return true;
                }
            }
        }
        return false;
    }

    function hasDepthTarget() {
        if (states.renderTarget && states.renderTarget.targets) {
            var targets = states.renderTarget.targets;
            for (var i = 0, len = targets.length; i < len; i++) {
                if (targets[i].bufType === "depth") {
                    return true;
                }
            }
        }
        return false;
    }

    function vertexRendering() {

        var customShaders = states.shader.shaders || {};

        // Do a full custom shader replacement if code supplied without hooks
        if (customShaders.vertex
            && customShaders.vertex.code
            && customShaders.vertex.code != ""
            && SceneJS._isEmpty(customShaders.vertex.hooks)) {
            return [customShaders.vertex.code];
        }

        var customVertexShader = customShaders.vertex || {};
        var vertexHooks = customVertexShader.hooks || {};

        var customFragmentShader = customShaders.fragment || {};
        var fragmentHooks = customFragmentShader.hooks || {};

        var i;
        var uvBufs;

        begin();

        add("uniform mat4 SCENEJS_uMMatrix;");             // Model matrix
        add("uniform mat4 SCENEJS_uVMatrix;");             // View matrix
        add("uniform mat4 SCENEJS_uPMatrix;");             // Projection matrix

        add("attribute vec3 SCENEJS_aVertex;");            // Model coordinates

        add("uniform vec3 SCENEJS_uWorldEye;");            // World-space eye position

        add("varying vec3 SCENEJS_vViewEyeVec;");          // View-space vector from origin to eye

        if (normals) {

            add("attribute vec3 SCENEJS_aNormal;");        // Normal vectors
            add("uniform   mat4 SCENEJS_uMNMatrix;");      // Model normal matrix
            add("uniform   mat4 SCENEJS_uVNMatrix;");      // View normal matrix

            add("varying   vec3 SCENEJS_vViewNormal;");    // Output view-space vertex normal

            if (fresnel) {
                add("varying   vec3 SCENEJS_vWorldNormal;");    // Output view-space vertex normal
            }

            if (tangents) {
                add("attribute vec4 SCENEJS_aTangent;");
                add("varying   vec3 SCENEJS_vTangent;");
            }
        }

        if (texturing) {

            uvBufs = states.geometry.uvBufs;

            if (uvBufs) {
                for (var i = 0, len = uvBufs.length; i < len; i++) {
                    if (uvBufs[i]) {
                        add("attribute vec2 SCENEJS_aUVCoord" + i + ";");
                    }
                }
            }
        }

        if (states.geometry.colorBuf) {
            add("attribute vec4 SCENEJS_aVertexColor;");
            add("varying vec4 SCENEJS_vColor;");               // Varying for fragment texturing
        }

        if (clipping || normals) {
            add("varying vec4 SCENEJS_vWorldVertex;");         // Varying for fragment clip or world pos hook
        }

        add("varying vec4 SCENEJS_vViewVertex;");              // Varying for fragment view clip hook

        if ( texturing) {                                            // Varyings for fragment texturing

            uvBufs = states.geometry.uvBufs;

            if (uvBufs) {
                for (i = 0, len = uvBufs.length; i < len; i++) {
                    if (uvBufs[i]) {
                        add("varying vec2 SCENEJS_vUVCoord" + i + ";");
                    }
                }
            }
        }

        if (regionInteraction) {
            add("attribute vec2 SCENEJS_aRegionMapUV;");
            add("varying vec2 SCENEJS_vRegionMapUV;");
        }

        if (morphing) {
            add("uniform float SCENEJS_uMorphFactor;");       // LERP factor for morph
            if (states.morphGeometry.targets[0].vertexBuf) {      // target2 has these arrays also
                add("attribute vec3 SCENEJS_aMorphVertex;");
            }
            if (normals) {
                if (states.morphGeometry.targets[0].normalBuf) {
                    add("attribute vec3 SCENEJS_aMorphNormal;");
                }
            }
            if (tangents) {
                //if (states.morphGeometry.targets[0].normalBuf) {
                    add("attribute vec3 SCENEJS_aMorphTangent;");
               // }
            }
        }

        if (customVertexShader.code) {
            add("\n" + customVertexShader.code + "\n");
        }

        if (billboard) {

            // Billboarding function which modifies the rotation
            // elements of the given matrix

            add("void billboard(inout mat4 mat) {");
            add("   mat[0][0] = 1.0;");
            add("   mat[0][1] = 0.0;");
            add("   mat[0][2] = 0.0;");
            if (states.billboard.spherical) {
                add("   mat[1][0] = 0.0;");
                add("   mat[1][1] = 1.0;");
                add("   mat[1][2] = 0.0;");
            }
            add("   mat[2][0] = 0.0;");
            add("   mat[2][1] = 0.0;");
            add("   mat[2][2] =1.0;");
            add("}");
        }

        add("void main(void) {");

        if (tangents) {
            add("vec3 modelTangent = SCENEJS_aTangent.xyz;");
        }

        add("  vec4 tmpVertex=vec4(SCENEJS_aVertex, 1.0); ");

        add("  vec4 modelVertex = tmpVertex; ");

        if (normals) {
            add("  vec4 modelNormal = vec4(SCENEJS_aNormal, 0.0); ");
        }

        // Morphing - morph targets are in same model space as the geometry
        if (morphing) {
            if (states.morphGeometry.targets[0].vertexBuf) {
                add("  vec4 vMorphVertex = vec4(SCENEJS_aMorphVertex, 1.0); ");
                add("  modelVertex = vec4(mix(modelVertex.xyz, vMorphVertex.xyz, SCENEJS_uMorphFactor), 1.0); ");
            }
            if (normals) {
                if (states.morphGeometry.targets[0].normalBuf) {
                    add("  vec4 vMorphNormal = vec4(SCENEJS_aMorphNormal, 1.0); ");
                    add("  modelNormal = vec4( mix(modelNormal.xyz, vMorphNormal.xyz, SCENEJS_uMorphFactor), 1.0); ");
                }
            }
            if (tangents) {
                add("  modelTangent = mix(modelTangent, SCENEJS_aMorphTangent, SCENEJS_uMorphFactor); ");
            }
        }

        add("mat4 modelMatrix = SCENEJS_uMMatrix;");
        add("mat4 viewMatrix = SCENEJS_uVMatrix;");

        if (normals) {
            add("mat4 modelNormalMatrix = SCENEJS_uMNMatrix;");
            add("mat4 viewNormalMatrix = SCENEJS_uVNMatrix;");
        }

        add("vec4 worldVertex;");
        add("vec4 viewVertex;");

        if (skybox) {
            add("viewMatrix[3].xyz = vec3(0.0);");
        }

        if (billboard) {

            // Since billboard effect is not preserved
            // in the product of two billboarded matrices,
            // we need to get the product of the model and
            // view matrices and billboard that

            add("   mat4 modelViewMatrix =  viewMatrix * modelMatrix;");

            add("   billboard(modelMatrix);");
            add("   billboard(viewMatrix);");
            add("   billboard(modelViewMatrix);");

            if (normals) {

                add("   mat4 modelViewNormalMatrix = viewNormalMatrix * modelNormalMatrix;");

                add("   billboard(modelNormalMatrix);");
                add("   billboard(viewNormalMatrix);");
                add("   billboard(modelViewNormalMatrix);");
            }

            if (vertexHooks.viewMatrix) {
                add("viewMatrix = " + vertexHooks.viewMatrix + "(viewMatrix);");
            }

            add("   worldVertex = modelMatrix * modelVertex;");
            add("   viewVertex = modelViewMatrix * modelVertex;");

        } else {

            if (vertexHooks.viewMatrix) {
                add("viewMatrix = " + vertexHooks.viewMatrix + "(viewMatrix);");
            }

            add("  worldVertex = modelMatrix * modelVertex;");
            add("  viewVertex  = viewMatrix * worldVertex; ");
        }

        if (vertexHooks.viewPos) {
            add("viewVertex=" + vertexHooks.viewPos + "(viewVertex);");    // Vertex hook function
        }

        if (normals) {
            add("  vec3 worldNormal = (modelNormalMatrix * modelNormal).xyz; ");
            add("  SCENEJS_vViewNormal = (viewNormalMatrix * vec4(worldNormal, 1.0)).xyz;");

            if (fresnel) {
                add("  SCENEJS_vWorldNormal = worldNormal;");
            }
        }

        if (clipping || normals || fragmentHooks.worldPos) {
            add("  SCENEJS_vWorldVertex = worldVertex;");                  // Varying for fragment world clip or hooks
        }

        add("  SCENEJS_vViewVertex = viewVertex;");                    // Varying for fragment hooks

        if (vertexHooks.projMatrix) {
            add("gl_Position = " + vertexHooks.projMatrix + "(SCENEJS_uPMatrix) * viewVertex;");
        } else {
            add("  gl_Position = SCENEJS_uPMatrix * viewVertex;");
        }

        if (tangents) {

            // Compute tangent-bitangent-normal matrix

            add("modelTangent = normalize((viewNormalMatrix * modelNormalMatrix * vec4(modelTangent, 1.0)).xyz);");
            add("vec3 bitangent = cross(SCENEJS_vViewNormal, modelTangent);");
            add("mat3 TBM = mat3(modelTangent, bitangent, SCENEJS_vViewNormal);");

            add("SCENEJS_vTangent = modelTangent;");
        }

        add("SCENEJS_vViewEyeVec = ((viewMatrix * vec4(SCENEJS_uWorldEye, 0.0)).xyz  - viewVertex.xyz);");

        if (tangents) {

            add("SCENEJS_vViewEyeVec *= TBM;");
        }

        if (texturing) {

            uvBufs = states.geometry.uvBufs;

            if (uvBufs) {
                for (i = 0, len = uvBufs.length; i < len; i++) {
                    if (uvBufs[i]) {
                        add("SCENEJS_vUVCoord" + i + " = SCENEJS_aUVCoord" + i + ";");
                    }
                }
            }
        }

        if (states.geometry.colorBuf) {
            add("SCENEJS_vColor = SCENEJS_aVertexColor;");
        }

        if (regionInteraction) {
            add("SCENEJS_vRegionMapUV = SCENEJS_aRegionMapUV;");
        }

        add("gl_PointSize = 3.0;");

        add("}");

        return end();
    }


    /*-----------------------------------------------------------------------------------------------------------------
     * Rendering Fragment shader
     *---------------------------------------------------------------------------------------------------------------*/

    function fragmentRendering() {

        var customShaders = states.shader.shaders || {};

        // Do a full custom shader replacement if code supplied without hooks
        if (customShaders.fragment
            && customShaders.fragment.code
            && customShaders.fragment.code != ""
            && SceneJS._isEmpty(customShaders.fragment.hooks)) {
            return [customShaders.fragment.code];
        }

        var customFragmentShader = customShaders.fragment || {};
        var fragmentHooks = customFragmentShader.hooks || {};


        var diffuseFresnel = states.fresnel.diffuse;
        var specularFresnel = states.fresnel.specular;
        var alphaFresnel = states.fresnel.alpha;
        var reflectFresnel = states.fresnel.reflect;
        var emitFresnel = states.fresnel.emit;
        var fragmentFresnel = states.fresnel.fragment;

        begin();

        add("precision " + getFSFloatPrecision(states._canvas.gl) + " float;");

        add("uniform mat4 SCENEJS_uVMatrix;");

        if (clipping || normals) {
            add("varying vec4 SCENEJS_vWorldVertex;");             // World-space vertex
        }

        //  if (fragmentHooks.viewPos) {
        add("varying vec4 SCENEJS_vViewVertex;");              // View-space vertex
        //  }

        add("uniform float SCENEJS_uZNear;");                      // Used in Z-pick mode
        add("uniform float SCENEJS_uZFar;");                       // Used in Z-pick mode

        add("uniform vec3 SCENEJS_uWorldEye;");


        /*-----------------------------------------------------------------------------------
         * Variables
         *----------------------------------------------------------------------------------*/

        if (clipping) {
            for (var i = 0; i < states.clips.clips.length; i++) {
                add("uniform float SCENEJS_uClipMode" + i + ";");
                add("uniform vec4  SCENEJS_uClipNormalAndDist" + i + ";");
            }
        }

        if (texturing) {
            var uvBufs = states.geometry.uvBufs;
            if (uvBufs) {
                for (var i = 0, len = uvBufs.length; i < len; i++) {
                    if (uvBufs[i]) {
                        add("varying vec2  SCENEJS_vUVCoord" + i + ";");
                    }
                }
            }

            if (texturing) {
                var layer;
                for (var i = 0, len = states.texture.layers.length; i < len; i++) {
                    layer = states.texture.layers[i];
                    add("uniform sampler2D SCENEJS_uSampler" + i + ";");
                    if (layer.matrix) {
                        add("uniform mat4 SCENEJS_uLayer" + i + "Matrix;");
                    }
                    add("uniform float SCENEJS_uLayer" + i + "BlendFactor;");
                }
            }
        }

        if (normals && cubeMapping) {

            var layer;
            for (var i = 0, len = states.cubemap.layers.length; i < len; i++) {
                layer = states.cubemap.layers[i];
                add("uniform samplerCube SCENEJS_uCubeMapSampler" + i + ";");
                add("uniform float SCENEJS_uCubeMapIntensity" + i + ";");
            }
        }

        if (regionInteraction) {
            add("varying vec2 SCENEJS_vRegionMapUV;");
            add("uniform sampler2D SCENEJS_uRegionMapSampler;");
            add("uniform vec3 SCENEJS_uRegionMapRegionColor;");
            add("uniform vec3 SCENEJS_uRegionMapHighlightFactor;");
            add("uniform float SCENEJS_uRegionMapHideAlpha;");
        }

        // True when lighting
        add("uniform bool  SCENEJS_uClipping;");

        if (solid) {
            add("uniform vec3  SCENEJS_uSolidColor;");
        }

        // Added in v4.0 to support depth targets
        add("uniform bool  SCENEJS_uDepthMode;");

        /* True when rendering transparency
         */
        add("uniform bool  SCENEJS_uTransparent;");

        /* Vertex color variable
         */
        if (states.geometry.colorBuf) {
            add("varying vec4 SCENEJS_vColor;");
        }

        add("uniform vec3  SCENEJS_uAmbientColor;");                         // Scene ambient colour - taken from clear colour

        add("uniform vec3  SCENEJS_uMaterialColor;");
        add("uniform vec3  SCENEJS_uMaterialSpecularColor;");
        add("uniform vec3  SCENEJS_uMaterialEmitColor;");

        add("uniform float SCENEJS_uMaterialSpecular;");
        add("uniform float SCENEJS_uMaterialShine;");
        add("uniform float SCENEJS_uMaterialAlpha;");
        add("uniform float SCENEJS_uMaterialEmit;");

        if (diffuseFresnel) {
            add("uniform float SCENEJS_uDiffuseFresnelCenterBias;");
            add("uniform float SCENEJS_uDiffuseFresnelEdgeBias;");
            add("uniform float SCENEJS_uDiffuseFresnelPower;");
            add("uniform vec3 SCENEJS_uDiffuseFresnelCenterColor;");
            add("uniform vec3 SCENEJS_uDiffuseFresnelEdgeColor;");
        }

        if (specularFresnel) {
            add("uniform float SCENEJS_uSpecularFresnelCenterBias;");
            add("uniform float SCENEJS_uSpecularFresnelEdgeBias;");
            add("uniform float SCENEJS_uSpecularFresnelPower;");
            add("uniform vec3 SCENEJS_uSpecularFresnelCenterColor;");
            add("uniform vec3 SCENEJS_uSpecularFresnelEdgeColor;");
        }

        if (alphaFresnel) {
            add("uniform float SCENEJS_uAlphaFresnelCenterBias;");
            add("uniform float SCENEJS_uAlphaFresnelEdgeBias;");
            add("uniform float SCENEJS_uAlphaFresnelPower;");
            add("uniform vec3 SCENEJS_uAlphaFresnelCenterColor;");
            add("uniform vec3 SCENEJS_uAlphaFresnelEdgeColor;");
        }

        if (reflectFresnel) {
            add("uniform float SCENEJS_uReflectFresnelCenterBias;");
            add("uniform float SCENEJS_uReflectFresnelEdgeBias;");
            add("uniform float SCENEJS_uReflectFresnelPower;");
            add("uniform vec3 SCENEJS_uReflectFresnelCenterColor;");
            add("uniform vec3 SCENEJS_uReflectFresnelEdgeColor;");
        }

        if (emitFresnel) {
            add("uniform float SCENEJS_uEmitFresnelCenterBias;");
            add("uniform float SCENEJS_uEmitFresnelEdgeBias;");
            add("uniform float SCENEJS_uEmitFresnelPower;");
            add("uniform vec3 SCENEJS_uEmitFresnelCenterColor;");
            add("uniform vec3 SCENEJS_uEmitFresnelEdgeColor;");
        }

        if (fragmentFresnel) {
            add("uniform float SCENEJS_uFragmentFresnelCenterBias;");
            add("uniform float SCENEJS_uFragmentFresnelEdgeBias;");
            add("uniform float SCENEJS_uFragmentFresnelPower;");
            add("uniform vec3 SCENEJS_uFragmentFresnelCenterColor;");
            add("uniform vec3 SCENEJS_uFragmentFresnelEdgeColor;");
        }

        add("varying vec3 SCENEJS_vViewEyeVec;");                          // Direction of world-space vertex from eye

        if (normals) {

            add("uniform mat4 SCENEJS_uVNMatrix;");
            add("varying vec3 SCENEJS_vViewNormal;");

            if (fresnel) {
                add("varying vec3 SCENEJS_vWorldNormal;");
            }

            if (tangents) {
                add("varying vec3 SCENEJS_vTangent;");
            }
            var light;
            for (var i = 0; i < states.lights.lights.length; i++) {
                light = states.lights.lights[i];
                if (light.mode == "ambient") {
                    continue;
                }
                add("uniform vec3  SCENEJS_uLightColor" + i + ";");

                if (light.mode == "dir") {
                    add("uniform vec3 SCENEJS_uLightDir" + i + ";");
                }

                if (light.mode == "point") {
                    add("uniform vec3  SCENEJS_uLightAttenuation" + i + ";");
                    add("uniform vec3 SCENEJS_uLightPos" + i + ";");
                }

                if (light.mode == "spot") {
                    add("uniform vec3  SCENEJS_uLightAttenuation" + i + ";");
                    add("uniform vec3 SCENEJS_uLightPos" + i + ";");
                    add("uniform vec3 SCENEJS_uLightDir" + i + ";");
                    add("uniform float SCENEJS_uInnerCone" + i + ";");
                    add("uniform float SCENEJS_uOuterCone" + i + ";");
                }

            }
        }

        if (customFragmentShader.code) {
            add("\n" + customFragmentShader.code + "\n");
        }

        if (diffuseFresnel || specularFresnel || alphaFresnel || reflectFresnel || emitFresnel || fragmentFresnel) {
            add("float fresnel(vec3 viewDirection, vec3 worldNormal, float edgeBias, float centerBias, float power) {");
            add("    float fr = abs(dot(viewDirection, worldNormal));");
            add("    float finalFr = clamp((fr - edgeBias) / (centerBias - edgeBias), 0.0, 1.0);");
            add("    return pow(finalFr, power);");
            add("}");
        }

        add("void main(void) {");

        // World-space arbitrary clipping planes

        if (clipping) {
            add("if (SCENEJS_uClipping) {");
            add("  float dist = 0.0;");
            for (var i = 0; i < states.clips.clips.length; i++) {
                add("  if (SCENEJS_uClipMode" + i + " != 0.0) {");
                add("      dist += clamp(dot(SCENEJS_vWorldVertex.xyz, SCENEJS_uClipNormalAndDist" + i + ".xyz) - SCENEJS_uClipNormalAndDist" + i + ".w, 0.0, 1000.0);");
                add("  }");
            }
            add("  if (dist > 0.0) { discard; }");
            add("}");
        }

        if (normals) {
            add("vec3 worldEyeVec = normalize(SCENEJS_uWorldEye - SCENEJS_vWorldVertex.xyz);");            // World-space eye position

            if (fresnel) {
                add("vec3 worldNormal = normalize(SCENEJS_vWorldNormal); ")
            }

            if (solid) {

                add("  if (gl_FrontFacing == false) {");
                add("     gl_FragColor = vec4(SCENEJS_uSolidColor.xyz, 1.0);");
                add("     return;");
                add("  }");
            }
        }

        add("  vec3 ambient= SCENEJS_uAmbientColor;");

        //if (texturing && states.geometry.uvBuf && fragmentHooks.texturePos) {
        //    add(fragmentHooks.texturePos + "(SCENEJS_vUVCoord);");
        //}

        if (fragmentHooks.viewPos) {
            add(fragmentHooks.viewPos + "(SCENEJS_vViewVertex);");
        }

        if (normals && fragmentHooks.viewNormal) {
            add(fragmentHooks.viewNormal + "(SCENEJS_vViewNormal);");
        }

        if (states.geometry.colorBuf) {
            add("  vec3    color   = SCENEJS_vColor.rgb;");
            add("  float   colorA  = SCENEJS_vColor.a;");
        } else {
            add("  vec3    color   = SCENEJS_uMaterialColor;")
        }

        add("  float alpha         = SCENEJS_uMaterialAlpha;");
        add("  float emit          = SCENEJS_uMaterialEmit;");
        add("  float specular      = SCENEJS_uMaterialSpecular;");
        add("  vec3  specularColor = SCENEJS_uMaterialSpecularColor;");
        add("  vec3  emitColor     = SCENEJS_uMaterialEmitColor;");
        add("  float shine         = SCENEJS_uMaterialShine;");

        if (fragmentHooks.materialBaseColor) {
            add("color=" + fragmentHooks.materialBaseColor + "(color);");
        }
        if (fragmentHooks.materialAlpha) {
            add("alpha=" + fragmentHooks.materialAlpha + "(alpha);");
        }
        if (fragmentHooks.materialEmit) {
            add("emit=" + fragmentHooks.materialEmit + "(emit);");
        }
        if (fragmentHooks.materialSpecular) {
            add("specular=" + fragmentHooks.materialSpecular + "(specular);");
        }
        if (fragmentHooks.materialSpecularColor) {
            add("specularColor=" + fragmentHooks.materialSpecularColor + "(specularColor);");
        }
        if (fragmentHooks.materialShine) {
            add("shine=" + fragmentHooks.materialShine + "(shine);");
        }

        if (normals) {
            add("  float   attenuation = 1.0;");
            if (tangents) {
                add("  vec3    viewNormalVec = vec3(0.0, 1.0, 0.0);");
            } else {

                // Normalize the interpolated normals in the per-fragment-fragment-shader,
                // because if we linear interpolated two nonparallel normalized vectors, the resulting vector won’t be of length 1
                add("  vec3    viewNormalVec = normalize(SCENEJS_vViewNormal);");
            }
            add("vec3 viewEyeVec = normalize(SCENEJS_vViewEyeVec);");
        }

        var layer;
        if (texturing) {

            add("  vec4    texturePos;");
            add("  vec2    textureCoord=vec2(0.0,0.0);");

            // ------------ Texture maps ------------------------------------

            if (texturing) {
                for (var i = 0, len = states.texture.layers.length; i < len; i++) {
                    layer = states.texture.layers[i];

                    var applyFrom = layer.applyFrom;

                    // Texture input

                    if (applyFrom == "normal" && normals) {

                        if (states.geometry.normalBuf) {
                            add("texturePos=vec4(viewNormalVec.xyz, 1.0);");
                        } else {
                            SceneJS.log.warn("Texture layer applyFrom='normal' but geo has no normal vectors");
                            continue;
                        }

                    } else {

                        // Apply from UV layers

                        var matches = applyFrom.match(/\d+$/);
                        var uvLayerIndex = matches ? parseInt(matches[0]) : 0;

                        var uvBufs = states.geometry.uvBufs;

                        if (uvBufs[uvLayerIndex]) {
                            add("texturePos = vec4(SCENEJS_vUVCoord" + uvLayerIndex + ".s, SCENEJS_vUVCoord" + uvLayerIndex + ".t, 1.0, 1.0);");
                        } else {
                            SceneJS.log.warn("Texture layer applyTo='uv' but geometry has no UV coordinates for layer " + uvLayerIndex);
                            continue;
                        }
                    }

                    /* Texture matrix
                     */
                    if (layer.matrix) {
                        add("textureCoord=(SCENEJS_uLayer" + i + "Matrix * texturePos).xy;");
                    } else {
                        add("textureCoord=texturePos.xy;");
                    }

                    /* Alpha from Texture
                     */
                    if (layer.applyTo == "alpha") {
                        if (layer.blendMode == "multiply") {
                            add("alpha = alpha * (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).b);");
                        } else if (layer.blendMode == "add") {
                            add("alpha = ((1.0 - SCENEJS_uLayer" + i + "BlendFactor) * alpha) + (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).b);");
                        }
                    }

                    /* Texture output
                     */
                    if (layer.applyTo == "baseColor") {
                        if (layer.blendMode == "multiply") {
                            add("color = color * (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb);");
                        } else {
                            add("color = ((1.0 - SCENEJS_uLayer" + i + "BlendFactor) * color) + (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb);");
                        }
                    }

                    if (layer.applyTo == "emit") {
                        if (layer.blendMode == "multiply") {
                            add("emit  = emit * (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        } else {
                            add("emit = ((1.0 - SCENEJS_uLayer" + i + "BlendFactor) * emit) + (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        }
                    }

                    if (layer.applyTo == "specular" && normals) {
                        if (layer.blendMode == "multiply") {
                            add("specular  = specular * (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        } else {
                            add("specular = ((1.0 - SCENEJS_uLayer" + i + "BlendFactor) * specular) + (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        }
                    }

                    if (layer.applyTo == "shine") {
                        if (layer.blendMode == "multiply") {
                            add("shine  = shine * (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        } else {
                            add("shine = ((1.0 - SCENEJS_uLayer" + i + "BlendFactor) * shine) + (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        }
                    }

                    if (layer.applyTo == "normals" && normals) {
                        add("viewNormalVec = normalize(texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, -textureCoord.y)).xyz * 2.0 - 1.0);");
                    }
                }
            }
        }

        if (normals && cubeMapping) {
            add("float reflectFactor = 1.0;");

            if (reflectFresnel) {
                add("float reflectFresnel = fresnel(worldEyeVec, worldNormal, SCENEJS_uReflectFresnelEdgeBias,  SCENEJS_uReflectFresnelCenterBias, SCENEJS_uReflectFresnelPower);");
                add("reflectFactor *= mix(SCENEJS_uReflectFresnelEdgeColor.b, SCENEJS_uReflectFresnelCenterColor.b, reflectFresnel);");
            }

            add("vec4 v = SCENEJS_uVNMatrix * vec4(SCENEJS_vViewEyeVec, 1.0);");
            add("vec3 v1 = v.xyz;");

            add("v = SCENEJS_uVNMatrix * vec4(viewNormalVec, 1.0);");
            add("vec3 v2 = v.xyz;");

            add("vec3 envLookup = reflect(v1, v2);");

            add("envLookup.y = envLookup.y * -1.0;"); // Need to flip textures on Y-axis for some reason
            add("vec4 envColor;");
            for (var i = 0, len = states.cubemap.layers.length; i < len; i++) {
                layer = states.cubemap.layers[i];
                add("envColor = textureCube(SCENEJS_uCubeMapSampler" + i + ", envLookup);");
                add("color = mix(color, envColor.rgb, reflectFactor * specular * SCENEJS_uCubeMapIntensity" + i + ");");
            }
        }

        add("  vec4    fragColor;");

        if (normals) {

            add("  vec3    lightValue      = vec3(0.0, 0.0, 0.0);");
            add("  vec3    specularValue   = vec3(0.0, 0.0, 0.0);");
            add("  vec3    viewLightVec;");
            add("  vec3    viewLightDir;")
            add("  float   dotN;");
            add("  float   spotDirRatio;");
            add("  float   lightDist;");

            if (tangents) {

                // Compute tangent-bitangent-normal matrix

                add("vec3 tangent = normalize(SCENEJS_vTangent);");
                add("vec3 bitangent = cross(SCENEJS_vViewNormal, tangent);");
                add("mat3 TBM = mat3(tangent, bitangent, SCENEJS_vViewNormal);");
            }

            var light;

            for (var i = 0, len = states.lights.lights.length; i < len; i++) {
                light = states.lights.lights[i];

                if (light.mode == "ambient") {
                    continue;
                }

                if (light.mode == "point") {

                    if (light.space == "world") {

                        // World space

                        add("viewLightVec = SCENEJS_uLightPos" + i + " - SCENEJS_vWorldVertex.xyz;"); // Vector from World coordinate to light pos

                        // Transform to View space
                        add("viewLightVec = vec3(SCENEJS_uVMatrix * vec4(viewLightVec, 0.0)).xyz;");

                        if (tangents) {

                            // Transform to Tangent space
                            add("viewLightVec *= TBM;");
                        }

                    } else {

                        // View space

                        add("viewLightVec = SCENEJS_uLightPos" + i + ".xyz - SCENEJS_vViewVertex.xyz;"); // Vector from View coordinate to light pos

                        if (tangents) {

                            // Transform to tangent space
                            add("viewLightVec *= TBM;");
                        }
                    }

                    add("dotN = max(dot(viewNormalVec, normalize(viewLightVec)), 0.0);");

                    add("lightDist = length( SCENEJS_uLightPos" + i + " - SCENEJS_vWorldVertex.xyz);");

                    add("attenuation = 1.0 - (" +
                        "  SCENEJS_uLightAttenuation" + i + ".x + " +
                        "  SCENEJS_uLightAttenuation" + i + ".y * lightDist + " +
                        "  SCENEJS_uLightAttenuation" + i + ".z * lightDist * lightDist);");

                    if (light.diffuse) {
                        add("      lightValue += dotN * SCENEJS_uLightColor" + i + " * attenuation;");
                    }

                    if (light.specular) {
                        add("    specularValue += specularColor * SCENEJS_uLightColor" + i +
                            " * specular * pow(max(dot(reflect(normalize(-viewLightVec), normalize(-viewNormalVec)), normalize(-SCENEJS_vViewVertex.xyz)), 0.0), shine) * attenuation;");
                    }
                }

                if (light.mode == "spot") {

                    add("viewLightDir = SCENEJS_uLightDir" + i + ";")

                    if (light.space == "world") {

                        // World space

                        add("viewLightVec = SCENEJS_uLightPos" + i + " - SCENEJS_vWorldVertex.xyz;"); // Vector from World coordinate to light pos

                        // Transform to View space
                        add("viewLightVec = vec3(SCENEJS_uVMatrix * vec4(viewLightVec, 0.0)).xyz;");
                        add("viewLightDir = vec3(SCENEJS_uVMatrix * vec4(viewLightDir, 0.0)).xyz;");

                        if (tangents) {

                            // Transform to Tangent space
                            add("viewLightVec *= TBM;");
                            add("viewLightDir *= TBM;");
                        }

                    } else {

                        // View space

                        add("viewLightVec = SCENEJS_uLightPos" + i + ".xyz - SCENEJS_vViewVertex.xyz;"); // Vector from View coordinate to light pos

                        if (tangents) {

                            // Transform to tangent space
                            add("viewLightVec *= TBM;");
                            add("viewLightDir *= TBM;");
                        }
                    }

                    add("dotN = max(dot(viewNormalVec, normalize(viewLightVec)), 0.0);");
                    add("spotDirRatio = 1.0 - max(dot(normalize(viewLightDir), normalize(-viewLightVec)), 0.0);");

                    add("lightDist = length( SCENEJS_uLightPos" + i + " - SCENEJS_vWorldVertex.xyz);");

                    add("attenuation = 1.0 - (" +
                        "  SCENEJS_uLightAttenuation" + i + ".x + " +
                        "  SCENEJS_uLightAttenuation" + i + ".y * lightDist + " +
                        "  SCENEJS_uLightAttenuation" + i + ".z * lightDist * lightDist);");

                    // Attenuations due to spotlight cones
                    add("attenuation *= 1.0 - clamp((spotDirRatio - SCENEJS_uInnerCone" + i + ") / max(SCENEJS_uOuterCone" + i + " - SCENEJS_uInnerCone" + i + ", 0.0001), 0.0, 1.0);");

                    if (light.diffuse) {
                        add("      lightValue += dotN * SCENEJS_uLightColor" + i + " * attenuation;");
                    }

                    if (light.specular) {
                        add("    specularValue += specularColor * SCENEJS_uLightColor" + i +
                            " * specular * pow(max(dot(reflect(normalize(-viewLightVec), normalize(-viewNormalVec)), normalize(-SCENEJS_vViewVertex.xyz)), 0.0), shine) * attenuation;");
                    }
                }

                if (light.mode == "dir") {

                    if (light.space == "world") {

                        // World space light

                        add("viewLightVec = normalize(SCENEJS_uLightDir" + i + ");");

                        // Transform to View space
                        add("viewLightVec = vec3(SCENEJS_uVMatrix * vec4(viewLightVec, 0.0)).xyz;");

                        if (tangents) {

                            // Transform to Tangent space
                            add("viewLightVec *= TBM;");
                        }

                    } else {

                        // View space light

                        add("viewLightVec = normalize(SCENEJS_uLightDir" + i + ");");

                        if (tangents) {

                            // Transform to Tangent space
                            add("viewLightVec *= TBM;");
                        }
                    }

                    add("viewLightVec = -viewLightVec;");

                    add("dotN = max(dot(viewNormalVec, normalize(viewLightVec)), 0.0);");

                    if (light.diffuse) {
                        add("lightValue += dotN * SCENEJS_uLightColor" + i + ";");
                    }

                    if (light.specular) {
                        add("specularValue += specularColor * SCENEJS_uLightColor" + i +
                            " * specular * pow(max(dot(reflect(normalize(-viewLightVec), normalize(-viewNormalVec)), normalize(-SCENEJS_vViewVertex.xyz)), 0.0), shine);");
                    }
                }
            }

            if (states.geometry.colorBuf) {
                add("alpha *= colorA;");
            }

            if (diffuseFresnel || specularFresnel || alphaFresnel || emitFresnel) {

                if (diffuseFresnel) {
                    add("float diffuseFresnel = fresnel(worldEyeVec, worldNormal, SCENEJS_uDiffuseFresnelEdgeBias, SCENEJS_uDiffuseFresnelCenterBias, SCENEJS_uDiffuseFresnelPower);");
                    add("color.rgb *= mix(SCENEJS_uDiffuseFresnelEdgeColor.rgb, SCENEJS_uDiffuseFresnelCenterColor.rgb, diffuseFresnel);");
                }

                if (specularFresnel) {
                    add("float specFresnel = fresnel(worldEyeVec, worldNormal, SCENEJS_uSpecularFresnelEdgeBias, SCENEJS_uSpecularFresnelCenterBias, SCENEJS_uSpecularFresnelPower);");
                    add("specularValue *= mix(SCENEJS_uSpecularFresnelEdgeColor.rgb, SCENEJS_uSpecularFresnelCenterColor.rgb, specFresnel);");
                }

                if (alphaFresnel) {
                    add("float alphaFresnel = fresnel(worldEyeVec, worldNormal, SCENEJS_uAlphaFresnelEdgeBias, SCENEJS_uAlphaFresnelCenterBias, SCENEJS_uAlphaFresnelPower);");
                    add("alpha *= mix(SCENEJS_uAlphaFresnelEdgeColor.r, SCENEJS_uAlphaFresnelCenterColor.r, alphaFresnel);");
                }

                if (emitFresnel) {
                    add("float emitFresnel = fresnel(worldEyeVec, worldNormal, SCENEJS_uEmitFresnelEdgeBias, SCENEJS_uEmitFresnelCenterBias, SCENEJS_uEmitFresnelPower);");
                    add("emitColor.rgb *= mix(SCENEJS_uEmitFresnelEdgeColor.rgb, SCENEJS_uEmitFresnelCenterColor.rgb, emitFresnel);");
                }
            }

            add("fragColor = vec4((specularValue.rgb + color.rgb * (lightValue.rgb + ambient.rgb)) + (emit * emitColor.rgb), alpha);");

        } else { // No normals
            add("fragColor = vec4((color.rgb + (emit * color.rgb)) *  (vec3(1.0, 1.0, 1.0) + ambient.rgb), alpha);");
        }

        if (regionInteraction) {

            // Region map highlighting

            add("vec3 regionColor = texture2D(SCENEJS_uRegionMapSampler, vec2(SCENEJS_vRegionMapUV.s, 1.0 - SCENEJS_vRegionMapUV.t)).rgb;");
            add("float tolerance = 0.01;");
            add("vec3 colorDelta = abs(SCENEJS_uRegionMapRegionColor - regionColor);");
            if (states.regionMap.mode === "highlight" || states.regionMap.mode === "hide") {
                add("if (max(colorDelta.x, max(colorDelta.y, colorDelta.z)) < tolerance) {");
                if (states.regionMap.mode === "highlight") {
                    add("  fragColor.rgb *= SCENEJS_uRegionMapHighlightFactor;");
                } else {
                    // mode = "hide"
                    add("  fragColor.a = SCENEJS_uRegionMapHideAlpha;");
                }
                add("}");
            } else {
                // mode = "isolate"
                add("if (max(colorDelta.x, max(colorDelta.y, colorDelta.z)) > tolerance) {");
                add("  fragColor.a = SCENEJS_uRegionMapHideAlpha;");
                add("}");
            }
        }

        if (fragmentHooks.pixelColor) {
            add("fragColor=" + fragmentHooks.pixelColor + "(fragColor);");
        }
        if (false && debugCfg.whitewash === true) {

            add("    fragColor = vec4(1.0, 1.0, 1.0, 1.0);");

        } else {

            if (depthTargeting) {

                // Only compile in depth mode support if a depth render target is present

                add("    if (SCENEJS_uDepthMode) {");
                add("          float depth = length(SCENEJS_vViewVertex) / (SCENEJS_uZFar - SCENEJS_uZNear);");
                add("          const vec4 bias = vec4(1.0 / 255.0,");
                add("          1.0 / 255.0,");
                add("          1.0 / 255.0,");
                add("          0.0);");
                add("          float r = depth;");
                add("          float g = fract(r * 255.0);");
                add("          float b = fract(g * 255.0);");
                add("          float a = fract(b * 255.0);");
                add("          vec4 colour = vec4(r, g, b, a);");
                add("          fragColor = colour - (colour.yzww * bias);");
                add("    }");
            }
        }

        if (fragmentFresnel) {
            add("float fragmentFresnel = fresnel(worldEyeVec, worldNormal, SCENEJS_uFragmentFresnelEdgeBias, SCENEJS_uFragmentFresnelCenterBias, SCENEJS_uFragmentFresnelPower);");
            add("fragColor.rgb *= mix(SCENEJS_uFragmentFresnelEdgeColor.rgb, SCENEJS_uFragmentFresnelCenterColor.rgb, fragmentFresnel);");
        }

        if (!depthTargeting) {
            add("fragColor.rgb *= fragColor.a;");
        }

        add("gl_FragColor = fragColor;");

        add("}");

//        console.log(src.join("\n"));
        return end();
    }

    // Start fresh program source
    function begin() {
        src = [];
    }

    // Append to program source
    function add(txt) {
        src.push(txt || "");
    }

    // Finish building program source
    function end() {
        return src;
    }

    function getFSFloatPrecision(gl) {
        if (!gl.getShaderPrecisionFormat) {
            return "mediump";
        }

        if (gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0) {
            return "highp";
        }

        if (gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {
            return "mediump";
        }

        return "lowp";
    }

})
();
;/**
 * @class Source code for pick and draw shader programs, to be compiled into one or more {@link SceneJS_Program}s
 * @private
 * 
 * @param {String} hash Hash code identifying the rendering capabilities of the programs
 * @param {String} pickVertexSrc Source code of the pick vertex shader
 * @param {String} pickFragmentSrc Source code of the pick fragment shader
 * @param {String} drawVertexSrc Source code of the draw vertex shader
 * @param {String} drawFragmentSrc Source code of the draw fragment shader
 */
var SceneJS_ProgramSource = function(hash, pickVertexSrc, pickFragmentSrc, drawVertexSrc, drawFragmentSrc) {

    /**
     * Hash code identifying the capabilities of the {@link SceneJS_Program} that is compiled from this source
     * @type String
     */
    this.hash = hash;

    /**
     * Source code for pick vertex shader
     * @type String
     */
    this.pickVertexSrc = pickVertexSrc;

    /**
     * Source code for pick fragment shader
     * @type String
     */
    this.pickFragmentSrc = pickFragmentSrc;

    /**
     * Source code for draw vertex shader
     * @type String
     */
    this.drawVertexSrc = drawVertexSrc;

    /**
     * Source code for draw fragment shader
     * @type String
     */
    this.drawFragmentSrc = drawFragmentSrc;

    /**
     * Count of {@link SceneJS_Program}s compiled from this program source code
     * @type Number
     */
    this.useCount = 0;
};

;/**  
 * @class Manages creation, sharing and recycle of {@link SceneJS_Program} instances
 * @private
 */
var SceneJS_ProgramFactory = function(cfg) {

    this._canvas = cfg.canvas;

    this._programs = {};

    this._nextProgramId = 0;
};

/**
 * Gets a program to render the given states
 */
SceneJS_ProgramFactory.prototype.getProgram = function(hash, states) {

    var program = this._programs[hash];

    if (!program) {

        var source = SceneJS_ProgramSourceFactory.getSource(hash, states);

        program = new SceneJS_Program(this._nextProgramId++, hash, source, this._canvas.gl);

        this._programs[hash] = program;
    }

    program.useCount++;

    return program;
};

/**
 * Releases a program back to the shader factory
 */
SceneJS_ProgramFactory.prototype.putProgram = function(program) {

    if (--program.useCount <= 0) {

        program.draw.destroy();
        program.pick.destroy();

        SceneJS_ProgramSourceFactory.putSource(program.hash);

       delete this._programs[program.hash];
    }
};

/**
 * Notifies this shader factory that the WebGL context has been restored after previously being lost
 */
SceneJS_ProgramFactory.prototype.webglRestored = function() {

    var gl = this._canvas.gl;
    var program;

    for (var id in this._programs) {
        if (this._programs.hasOwnProperty(id)) {
            program = this._programs[id];
            if (program && program.build) {
                program.build(gl);
            }
        }
    }
};

/**
 * Destroys this shader factory
 */
SceneJS_ProgramFactory.prototype.destroy = function() {
};
;/**
 * @class Vertex and fragment shaders for pick and draw
 * @private
 *
 * @param {Number} id ID unique among all programs in the owner {@link SceneJS_ProgramFactory}
 * @param {String} hash Hash code which uniquely identifies the capabilities of the program, computed from hashes on the {@link Scene_Core}s that the {@link SceneJS_ProgramSource} composed to render
 * @param {SceneJS_ProgramSource} source Sourcecode from which the the program is compiled in {@link #build}
 * @param {WebGLRenderingContext} gl WebGL context 
 */
var SceneJS_Program = function(id, hash, source, gl) {

    /**
     * ID for this program, unique among all programs in the display
     * @type Number
     */
    this.id = id;

    /**
     * Hash code for this program's capabilities, same as the hash on {@link #source}
     * @type String
     */
    this.hash = source.hash;

    /**
     * Source code for this program's shaders
     * @type SceneJS_ProgramSource
     */
    this.source = source;

    /**
     * WebGL context on which this program's shaders are allocated
     * @type WebGLRenderingContext
     */
    this.gl = gl;

    /**
     * The drawing program
     * @type SceneJS._webgl.Program
     */
    this.draw = null;

    /**
     * The picking program
     * @type SceneJS._webgl.Program
     */
    this.pick = null;

    /**
     * The count of display objects using this program
     * @type Number
     */
    this.useCount = 0;

    this.build(gl);
};

/**
 *  Creates the render and pick programs.
 * This is also re-called to re-create them after WebGL context loss.
 */
SceneJS_Program.prototype.build = function(gl) {

    this.gl = gl;
    this.draw = new SceneJS._webgl.Program(gl, [this.source.drawVertexSrc.join("\n")], [this.source.drawFragmentSrc.join("\n")]);
    this.pick = new SceneJS._webgl.Program(gl, [this.source.pickVertexSrc.join("\n")], [this.source.pickFragmentSrc.join("\n")]);
};
;/**
 * @class Manages creation and recycle of {@link SceneJS_Object} instances
 * @private
 */
var SceneJS_ObjectFactory = function() {

};

/**
 * @property {[SceneJS_Object]} _freeObjects Pool of free display objects, shared by all object factories
 */
SceneJS_ObjectFactory.prototype._freeObjects = [];

/**
 * @property {Number} _numFreeObjects Number of free objects
 */
SceneJS_ObjectFactory.prototype._numFreeObjects = 0;

/**
 * Gets a display object from this factory
 *
 * @param {String} id ID to assign to the object
 * @returns {SceneJS_Object} The object
 */
SceneJS_ObjectFactory.prototype.getObject = function(id) {

    var object;

    if (this._numFreeObjects > 0) {

        object = this._freeObjects[--this._numFreeObjects];
        object.id = id;

        return object;
    }

    return new SceneJS_Object(id);
};

/**
 * Releases a display object back to this factory
 * @param {SceneJS_Object} object Object to release
 */
SceneJS_ObjectFactory.prototype.putObject = function (object) {

  //  this._freeObjects[this._numFreeObjects++] = object;
};;/**
 * @class An object within a {@link SceneJS_Display}
 * @private
 */
var SceneJS_Object = function(id) {

    /**
     * ID for this objects, unique among all objects in the display
     * @type Number
     */
    this.id = id;

    /**
     * Hash code for this object, unique among all objects in the display
     * @type String
     */
    this.hash = null;

    /**
     * State sort key, computed from {@link #layer}, {@link #program} and {@link #texture}
     * @type Number
     */
    this.sortKey = null;

    /**
     * Sequence of state chunks applied to render this object
     * @type {[SceneJS_Chunk]} chunks
     */
    this.chunks = [];

    /**
     * Number of state chunks applied to render this object
     * @type Number
     */
    this.chunksLen = 0;

    /**
     * Shader programs that render this object, also used for (re)computing {@link #sortKey}
     * @type SceneJS_Program
     */
    this.program = null;

    /**
     * State core for the {@link SceneJS.Layer} that this object was compiled from, used for (re)computing {@link #sortKey} and visibility cull
     */
    this.layer = null;

     /**
     * State core for the {@link SceneJS.Texture} that this object was compiled from, used for (re)computing {@link #sortKey}
     */
    this.texture = null;

    /**
     * State core for the {@link SceneJS.Flags} that this object was compiled from, used for visibility cull
     */
    this.flags = null;

    /**
     * State core for the {@link SceneJS.Tag} that this object was compiled from, used for visibility cull
     */
    this.tag = null;
};;/**
 * @class A facade which exposes internal scene rendering state to "rendered" event listeners bound to scene graph nodes with {@link SceneJS.Node#bind}.
 *
 * <p>The listener is fired for each {@link SceneJS.Geometry} that is rendered within the subgraph of the bound node.
 * An instance of this facade is passed into the listener's handler, enabling the listener to obtain the various transform
 * matrices that are active at that {@link SceneJS.Geometry}.</p>
 *
 * <p>The facade instance is only valid within the callback's execution; internally, SceneJS reuses the same instance of the
 * facade with each scene.</p>
 */
SceneJS.RenderContext = function(frameCtx) {
    this._frameCtx = frameCtx;
};

/**
 * Get the projection matrix, as defined by the active {@link SceneJS.Camera} node.
 */
SceneJS.RenderContext.prototype.getCameraMatrix = function() {
    return this._frameCtx.cameraMat;
};

/**
 * Get the view matrix, as defined by the active {@link SceneJS.LookAt} node.
 */
SceneJS.RenderContext.prototype.getViewMatrix = function() {
    return this._frameCtx.viewMat;
};

/**
 * Get the model matrix, as defined by the active {@link SceneJS.XForm} node.
 */
SceneJS.RenderContext.prototype.getModelMatrix = function() {
    return this._frameCtx.modelMat;
};

/**
 * Transforms the given world coordinate by the model, view and projection matrices defined by the active {@link SceneJS.XForm}, {@link SceneJS.LookAt} and {@link SceneJS.Camera} nodes.
 * @returns [Number] The 2D Canvas-space coordinate
 */
SceneJS.RenderContext.prototype.getCanvasPos = function(offset) {

    this.getProjPos(offset);

    var canvas = this._frameCtx.canvas.canvas;
    var resolutionScaling = this._frameCtx.canvas.resolutionScaling;
    var canvasWidth = canvas.width / resolutionScaling;
    var canvasHeight = canvas.height / resolutionScaling;

    /* Projection division and map to canvas
     */
    var pc = this._pc;

    var x = (pc[0] / pc[3]) * canvasWidth * 0.5;
    var y = (pc[1] / pc[3]) * canvasHeight * 0.5;

    return {
        x: x + (canvasWidth * 0.5),
        y: canvasHeight - y - (canvasHeight * 0.5)
    };
};

/**
 * Transforms the given world coordinate by the model and view matrices defined by the active {@link SceneJS.XForm} and {@link SceneJS.LookAt} nodes.
 * @returns [Number] The 3D Projection-space coordinate
 */
SceneJS.RenderContext.prototype.getCameraPos = function(offset) {
    this.getProjPos(offset);
    this._camPos = SceneJS_math_normalizeVec3(this._pc, [0,0,0]);
    return { x: this._camPos[0], y: this._camPos[1], z: this._camPos[2] }; // TODO: return _camPos and lose the temp object
};


SceneJS.RenderContext.prototype.getProjPos = function(offset) {
    this.getViewPos(offset);
    this._pc = SceneJS_math_transformPoint3(this._frameCtx.cameraMat, this._vc);
    return { x: this._pc[0], y: this._pc[1], z: this._pc[2],  w: this._pc[3] };
};

SceneJS.RenderContext.prototype.getViewPos = function(offset) {
    this.getWorldPos(offset);
    this._vc = SceneJS_math_transformPoint3(this._frameCtx.viewMat, this._wc);
    return { x: this._vc[0], y: this._vc[1], z: this._vc[2],  w: this._vc[3] };
};

SceneJS.RenderContext.prototype.getWorldPos = function(offset) {
    this._wc = SceneJS_math_transformPoint3(this._frameCtx.modelMat, offset || [0,0,0]);
    return { x: this._wc[0], y: this._wc[1], z: this._wc[2],  w: this._wc[3] };
};
;/**
 * @class A chunk of WebGL state changes to render a {@link SceneJS_Core} for drawing and picking (if applicable to the core type).
 *
 * <p>Instances of this class are created and recycled by a {@link SceneJS_ChunkFactory}.</p>
 *
 * <p>Each {@link SceneJS_Object} has a list of chunks to render it's {@link SceneJS_Core}s</p>
 *
 * @private
 */
var SceneJS_Chunk = function() {};

/**
 * Initialises the chunk. This is called within the constructor, and also to by the owner {@link SceneJS_ChunkFactory}
 * when recycling a chunk from its free chunk pool. This method sets the given properties on the chunk, then calls the
 * chunk instance's <b>build</b> method if the chunk has been augmented with one.
 *
 * @param {String} id Chunk ID
 * @param {SceneJS_Program} program Program to render the chunk
 * @param {SceneJS_Core} core The state core rendered by this chunk
 * @param {SceneJS_Core} core2 Another state core rendered by this chunk, only used for geometry
 */
SceneJS_Chunk.prototype.init = function(id, program, core, core2) {

    this.id = id;
    this.program = program;
    this.core = core;
    this.core2 = core2;

    if (this.build) {
        this.build();
    }
};
;/**
 * @class Manages creation, reuse and destruction of {@link SceneJS_Chunk}s for the nodes within a single {@link SceneJS_Display}.
 * @private
 */
var SceneJS_ChunkFactory = function() {

    this._chunks = {};
    this.chunkTypes = SceneJS_ChunkFactory.chunkTypes;
};

/**
 * Sub-classes of {@link SceneJS_Chunk} provided by this factory
 */
SceneJS_ChunkFactory.chunkTypes = {};    // Supported chunk classes, installed by #createChunkType

/**
 * Free pool of unused {@link SceneJS_Chunk} instances
 */
SceneJS_ChunkFactory._freeChunks = {};    // Free chunk pool for each type

/**
 * Creates a chunk class for instantiation by this factory
 *
 * @param params Members to augment the chunk class prototype with
 * @param params.type Type name for the new chunk class
 * @param params.draw Method to render the chunk in draw render
 * @param params.pick Method to render the chunk in pick render
 * @param params.drawAndPick Method to render the chunk in both draw and pick renders
 */
SceneJS_ChunkFactory.createChunkType = function(params) {

    if (!params.type) {
        throw "'type' expected in params";
    }

    var supa = SceneJS_Chunk;

    var chunkClass = function() { // Create the class
        this.useCount = 0;
        this.init.apply(this, arguments);
    };

    chunkClass.prototype = new supa();              // Inherit from base class
    chunkClass.prototype.constructor = chunkClass;

    if (params.drawAndPick) {                       // Common method for draw and pick render
        params.draw = params.pick = params.drawAndPick;
    }

    SceneJS_ChunkFactory.chunkTypes[params.type] = chunkClass;

    SceneJS._apply(params, chunkClass.prototype);   // Augment subclass

    SceneJS_ChunkFactory._freeChunks[params.type] = { // Set up free chunk pool for this type
        chunks: [],
        chunksLen: 0
    };

    return chunkClass;
};

/**
 *
 */
SceneJS_ChunkFactory.prototype.getChunk = function(chunkId, type, program, core, core2) {

    var chunkClass = SceneJS_ChunkFactory.chunkTypes[type]; // Check type supported

    if (!chunkClass) {
        throw "chunk type not supported: '" + type + "'";
    }

    var chunk = this._chunks[chunkId];  // Try to reference an existing chunk

    if (chunk) {
        chunk.useCount++;
        return chunk;
    }

    //var freeChunks = SceneJS_ChunkFactory._freeChunks[type]; // Try to recycle a free chunk
    //
    //if (freeChunks.chunksLen > 0) {
    //    chunk = freeChunks.chunks[--freeChunks.chunksLen];
    //}
    //
    //if (chunk) {    // Reinitialise the recycled chunk
    //
    //    chunk.init(chunkId, program, core, core2);
    //
    //} else {        // Instantiate a fresh chunk

        chunk = new chunkClass(chunkId, program, core, core2); // Create new chunk

//    }

    chunk.type = type;

    chunk.useCount = 1;

    this._chunks[chunkId] = chunk;

    return chunk;
};

/**
 * Releases a display state chunk back to this factory, destroying it if the chunk's use count is then zero.
 *
 * @param {SceneJS_Chunk} chunk Chunk to release
 */
SceneJS_ChunkFactory.prototype.putChunk = function (chunk) {

    if (chunk.useCount == 0) {
        return; // In case of excess puts
    }

    if (--chunk.useCount <= 0) {    // Release shared core if use count now zero

        if (chunk.recycle) {
            chunk.recycle();
        }

        delete this._chunks[chunk.id];

    //    var freeChunks = SceneJS_ChunkFactory._freeChunks[chunk.type];

    //    freeChunks.chunks[freeChunks.chunksLen++] = chunk;
    }
};

/**
 * Re-cache shader variable locations for each active chunk and reset VAOs if any
 */
SceneJS_ChunkFactory.prototype.webglRestored = function () {

    var chunk;

    for (var chunkId in this._chunks) {

        if (this._chunks.hasOwnProperty(chunkId)) {

            chunk = this._chunks[chunkId]; // Re-cache chunk's shader variable locations

            if (chunk && chunk.build) {
                chunk.build();
            }
        }
    }
};
;SceneJS_ChunkFactory.createChunkType({

    type: "camera",

    build : function() {

        this._uPMatrixDraw = this.program.draw.getUniform("SCENEJS_uPMatrix");
        this._uZNearDraw = this.program.draw.getUniform("SCENEJS_uZNear");
        this._uZFarDraw = this.program.draw.getUniform("SCENEJS_uZFar");

        this._uPMatrixPick = this.program.pick.getUniform("SCENEJS_uPMatrix");
        this._uZNearPick = this.program.pick.getUniform("SCENEJS_uZNear");
        this._uZFarPick = this.program.pick.getUniform("SCENEJS_uZFar");
    },

    draw : function(frameCtx) {

        if (this.core.checkAspect) {
            this.core.checkAspect(this.core, frameCtx.aspect);
        }

        var gl = this.program.gl;

        if (this._uPMatrixDraw) {
            this._uPMatrixDraw.setValue(this.core.mat);
        }

        if (this._uZNearDraw) {
            this._uZNearDraw.setValue(this.core.optics.near);
        }

        if (this._uZFarDraw) {
            this._uZFarDraw.setValue(this.core.optics.far);
        }

        frameCtx.cameraMat = this.core.mat; // Query only in draw pass
    },


    pick : function(frameCtx) {

        if (this.core.checkAspect) {
            this.core.checkAspect(this.core, frameCtx.aspect);
        }

        var gl = this.program.gl;

        if (this._uPMatrixPick) {
            this._uPMatrixPick.setValue(this.core.mat);
        }

        if (frameCtx.rayPick) { // Z-pick pass: feed near and far clip planes into shader

            if (this._uZNearPick) {
                this._uZNearPick.setValue(this.core.optics.near);
            }

            if (this._uZFarPick) {
                this._uZFarPick.setValue(this.core.optics.far);
            }
        }

        frameCtx.cameraMat = this.core.mat; // Query only in draw pass
    }
});;/**
 * Create display state chunk type for draw and pick render of user clipping planes
 */
SceneJS_ChunkFactory.createChunkType({

    type: "clips",

    build : function() {

        this._draw = this._draw || [];

        var draw = this.program.draw;

        for (var i = 0, len = this.core.clips.length; i < len; i++) {
            this._draw[i] = {
                uClipMode :draw.getUniform("SCENEJS_uClipMode" + i),
                uClipNormalAndDist: draw.getUniform("SCENEJS_uClipNormalAndDist" + i)
            };
        }

        this._pick = this._pick || [];

        var pick = this.program.pick;

        for (var i = 0, len = this.core.clips.length; i < len; i++) {
            this._pick[i] = {
                uClipMode :pick.getUniform("SCENEJS_uClipMode" + i),
                uClipNormalAndDist: pick.getUniform("SCENEJS_uClipNormalAndDist" + i)
            };
        }
    },

    drawAndPick: function(frameCtx) {

        var picking = frameCtx.picking;
        var vars = picking ? this._pick : this._draw;
        var mode;
        var normalAndDist;
        var clips = this.core.clips;
        var clip;
        var gl = this.program.gl;

        for (var i = 0, len = clips.length; i < len; i++) {

            if (picking) {
                mode = vars[i].uClipMode;
                normalAndDist = vars[i].uClipNormalAndDist;
            } else {
                mode = vars[i].uClipMode;
                normalAndDist = vars[i].uClipNormalAndDist;
            }

            if (mode && normalAndDist) {

                clip = clips[i];

                if (clip.mode == "inside") {

                    mode.setValue(2);
                    normalAndDist.setValue(clip.normalAndDist);

                } else if (clip.mode == "outside") {

                    mode.setValue(1);
                    normalAndDist.setValue(clip.normalAndDist);

                } else { // disabled
                    mode.setValue(0);
                }
            }
        }
    }
});;/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type: "draw",

    /**
     * As we apply a list of state chunks in a {@link SceneJS_Display}, we track the ID of each chunk
     * in order to avoid redundantly re-applying the same chunk.
     *
     * We don't want that for draw chunks however, because they contain GL drawElements calls,
     * which we need to do for each object.
     */
    unique: true,

    build: function () {

        this._depthModeDraw = this.program.draw.getUniform("SCENEJS_uDepthMode");

        this._uPickColor = this.program.pick.getUniform("SCENEJS_uPickColor");
    },


    draw: function (frameCtx) {

        var core = this.core;
        var gl = this.program.gl;

        if (this._depthModeDraw) {
            this._depthModeDraw.setValue(frameCtx.depthMode);
        }

        gl.drawElements(core.primitive, core.indexBuf.numItems, core.indexBuf.itemType, 0);

        //frameCtx.textureUnit = 0;
    },

    pick: function (frameCtx) {

        var core = this.core;
        var gl = this.program.gl;

        if (frameCtx.pickObject || frameCtx.pickRegion) {

            if (frameCtx.pickObject) {

                if (this._uPickColor) {

                    var a = frameCtx.pickIndex >> 24 & 0xFF;
                    var b = frameCtx.pickIndex >> 16 & 0xFF;
                    var g = frameCtx.pickIndex >> 8 & 0xFF;
                    var r = frameCtx.pickIndex & 0xFF;

                    frameCtx.pickIndex++;

                    this._uPickColor.setValue([r / 255, g / 255, b / 255, a / 255]);
                }
            }

            gl.drawElements(core.primitive, core.indexBuf.numItems, core.indexBuf.itemType, 0);

        } else if (frameCtx.pickTriangle) {

            var pickPositions = core.getPickPositions();

            if (pickPositions) {
                gl.drawArrays(core.primitive, 0, pickPositions.numItems / 3);
            }
        }
    }
});
;/**
 *  Create display state chunk type for draw and pick render of flags
 */
SceneJS_ChunkFactory.createChunkType({

    type: "flags",

    build: function () {

        var draw = this.program.draw;

        this._uClippingDraw = draw.getUniform("SCENEJS_uClipping");
        this._uSolidDraw = draw.getUniform("SCENEJS_uSolid");
        this._uSolidColorDraw = draw.getUniform("SCENEJS_uSolidColor");

        var pick = this.program.pick;

        this._uClippingPick = pick.getUniform("SCENEJS_uClipping");
    },

    drawAndPick: function (frameCtx) {

        var gl = this.program.gl;

        var backfaces = this.core.backfaces;

        if (frameCtx.backfaces != backfaces) {
            if (backfaces) {
                gl.disable(gl.CULL_FACE);
            } else {
                gl.enable(gl.CULL_FACE);
            }
            frameCtx.backfaces = backfaces;
        }

        var frontface = this.core.frontface;

        if (frameCtx.frontface != frontface) {
            if (frontface == "ccw") {
                gl.frontFace(gl.CCW);
            } else {
                gl.frontFace(gl.CW);
            }
            frameCtx.frontface = frontface;
        }

        var picking = frameCtx.picking;

        if (picking) {

            if (this._uClippingPick) {
                this._uClippingPick.setValue(this.core.clipping);
            }

        } else {

            var transparent = this.core.transparent;

            if (frameCtx.transparent != transparent) {

                if (transparent) {

                    // Entering a transparency bin

                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                    frameCtx.blendEnabled = true;

                } else {

                    // Leaving a transparency bin

                    gl.disable(gl.BLEND);
                    frameCtx.blendEnabled = false;
                }

                frameCtx.transparent = transparent;
            }

            if (this._uClippingDraw) {
                this._uClippingDraw.setValue(this.core.clipping);
            }

            if (this._uSolidDraw) {
                this._uSolidDraw.setValue(this.core.solid);
            }

            if (this._uSolidColorDraw) {
                this._uSolidColorDraw.setValue(this.core.solidColor);
            }
        }
    }
});
;/**
 *   Create display state chunk type for draw and pick render of renderTarget
 */
SceneJS_ChunkFactory.createChunkType({

    type: "renderTarget",

    // Avoid reapplication of this chunk type after a program switch.
    programGlobal: true,

    draw: function (frameCtx) {

        var gl = this.program.gl;

        // Flush and unbind any render buffer already bound
        if (frameCtx.renderBuf) {
            gl.flush();
            frameCtx.renderBuf.unbind();
            frameCtx.renderBuf = null;
        }

        // Set depthMode false and bail if no render buffer for this chunk
        var renderBuf = this.core.renderBuf;
        if (!renderBuf) {
            frameCtx.depthMode = false;
            return;
        }

        // Bind this chunk's render buffer, set depthMode, enable blend if depthMode false, clear buffer
        renderBuf.bind();

        frameCtx.depthMode = (this.core.bufType === "depth");

        if (!frameCtx.depthMode) {

            //  Enable blending for non-depth targets
            if (frameCtx.blendEnabled) {
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            }
        }

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(frameCtx.ambientColor[0], frameCtx.ambientColor[1], frameCtx.ambientColor[2], 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
      //  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        frameCtx.renderBuf = renderBuf;
    }
});;/**
 *  Create display state chunk type for draw and pick render of geometry
 */
SceneJS_ChunkFactory.createChunkType({

    type: "geometry",

    build: function () {

        var draw = this.program.draw;

        this._aRegionMapUVDraw = draw.getAttribute("SCENEJS_aRegionMapUV");
        this._aVertexDraw = draw.getAttribute("SCENEJS_aVertex");
        this._aNormalDraw = draw.getAttribute("SCENEJS_aNormal");

        // Get attributes for unlimited UV layers

        this._aUVDraw = [];
        var aUV;
        for (var i = 0; i < 1000; i++) { // Assuming we'll never have more than 1000 UV layers
            aUV = draw.getAttribute("SCENEJS_aUVCoord" + i);
            if (!aUV) {
                break;
            }
            this._aUVDraw.push(aUV);
        }

        this._aTangentDraw = draw.getAttribute("SCENEJS_aTangent");
        this._aColorDraw = draw.getAttribute("SCENEJS_aVertexColor");

        this._aMorphVertexDraw = draw.getAttribute("SCENEJS_aMorphVertex");
        this._aMorphNormalDraw = draw.getAttribute("SCENEJS_aMorphNormal");
        this._aMorphTangentDraw = draw.getAttribute("SCENEJS_aMorphTangent");
        this._uMorphFactorDraw = draw.getUniform("SCENEJS_uMorphFactor");

        var pick = this.program.pick;

        this._aRegionMapUVPick = pick.getAttribute("SCENEJS_aRegionMapUV");
        this._aVertexPick = pick.getAttribute("SCENEJS_aVertex");
        this._aColorPick = pick.getAttribute("SCENEJS_aColor");
        this._aMorphVertexPick = pick.getAttribute("SCENEJS_aMorphVertex");
        this._uMorphFactorPick = pick.getUniform("SCENEJS_uMorphFactor");

        this.VAO = null;
        this.VAOMorphKey1 = 0;
        this.VAOMorphKey2 = 0;
        this.VAOHasInterleavedBuf = false;
    },

    recycle: function () {
        if (this.VAO) {
            // Guarantee that the old VAO is deleted immediately when recycling the object.
            var VAOExt = this.program.gl.getExtension("OES_vertex_array_object");
            VAOExt.deleteVertexArrayOES(this.VAO);
            this.VAO = null;
        }
    },

    morphDraw: function (frameCtx) {

        this.VAOMorphKey1 = this.core.key1;
        this.VAOMorphKey2 = this.core.key2;

        var key1 = this.core.key1;
        var key2 = this.core.key2;

        var target1 = this.core.targets[key1]; // Keys will update
        var target2 = this.core.targets[key2];

        if (this._aMorphVertexDraw) {
            this._aVertexDraw.bindFloatArrayBuffer(target1.vertexBuf);
            this._aMorphVertexDraw.bindFloatArrayBuffer(target2.vertexBuf);
        } else if (this._aVertexDraw) {
            this._aVertexDraw.bindFloatArrayBuffer(this.core2.vertexBuf);
        }

        if (this._aMorphNormalDraw) {
            this._aNormalDraw.bindFloatArrayBuffer(target1.normalBuf);
            this._aMorphNormalDraw.bindFloatArrayBuffer(target2.normalBuf);
        } else if (this._aNormalDraw) {
            this._aNormalDraw.bindFloatArrayBuffer(this.core2.normalBuf);
        }

        if (this._aMorphTangentDraw || this._aTangentDraw) {

            // Bind tangent arrays from geometry and morphGeometry

            // In the texture chunk we remembered which UV layer we're using for the normal
            // map so that we can lazy-generate the tangents from the appropriate UV layer
            // in the geometry chunk.

            // Note that only one normal map is allowed per drawable, so there
            // will be only one UV layer used for normal mapping.

            var normalMapUVLayerIdx = frameCtx.normalMapUVLayerIdx;
            if (normalMapUVLayerIdx >= 0) {
                if (this._aMorphTangentDraw) {
                    this._aTangentDraw.bindFloatArrayBuffer(this.core.getTangents(key1, this.core2.arrays.indices, this.core2.arrays.uvs[normalMapUVLayerIdx]));
                    this._aMorphTangentDraw.bindFloatArrayBuffer(this.core.getTangents(key2, this.core2.arrays.indices, this.core2.arrays.uvs[normalMapUVLayerIdx]));
                } else if (this._aTangentDraw) {

                    // TODO: What's this for?
                    //this._aTangentDraw.bindFloatArrayBuffer(this.core2.tangentBuf);
                }
            }
        }

        // Bind UV layer from geometry

        var uvBuf;
        for (var i = 0, len = this._aUVDraw.length; i < len; i++) {
            uvBuf = this.core2.uvBufs[i];
            if (uvBuf) {
                this._aUVDraw[i].bindFloatArrayBuffer(uvBuf);
            }
        }

        if (this._aColorDraw) {
            this._aColorDraw.bindFloatArrayBuffer(this.core2.colorBuf);
        }

        this.setDrawMorphFactor();
    },

    setDrawMorphFactor: function () {

        if (this._uMorphFactorDraw) {
            this._uMorphFactorDraw.setValue(this.core.factor); // Bind LERP factor
        }

    },

    draw: function (frameCtx) {
        var doMorph = this.core.targets && this.core.targets.length;
        var cleanInterleavedBuf = this.core2.interleavedBuf && !this.core2.interleavedBuf.dirty;

        if (this.VAO && frameCtx.VAO) { // Workaround for https://github.com/xeolabs/scenejs/issues/459
            frameCtx.VAO.bindVertexArrayOES(this.VAO);
            if (doMorph) {
                if (this.VAOMorphKey1 == this.core.key1 && this.VAOMorphKey2 == this.core.key2) {
                    this.setDrawMorphFactor();
                    return;
                }
            } else if (cleanInterleavedBuf || !this.VAOHasInterleavedBuf) {
                return;
            }
        } else if (frameCtx.VAO) {
            // Start creating a new VAO by switching to the default VAO, which doesn't have attribs enabled.
            frameCtx.VAO.bindVertexArrayOES(null);
            this.VAO = frameCtx.VAO.createVertexArrayOES();
            frameCtx.VAO.bindVertexArrayOES(this.VAO);
        }

        if (doMorph) {
            this.morphDraw(frameCtx);
        } else {
            if (cleanInterleavedBuf) {
                this.VAOHasInterleavedBuf = true;
                this.core2.interleavedBuf.bind();
                if (this._aVertexDraw) {
                    this._aVertexDraw.bindInterleavedFloatArrayBuffer(3, this.core2.interleavedStride, this.core2.interleavedPositionOffset);
                }
                if (this._aNormalDraw) {
                    this._aNormalDraw.bindInterleavedFloatArrayBuffer(3, this.core2.interleavedStride, this.core2.interleavedNormalOffset);
                }
                for (var i = 0, len = this._aUVDraw.length; i < len; i++) {
                    this._aUVDraw[i].bindInterleavedFloatArrayBuffer(2, this.core2.interleavedStride, this.core2.interleavedUVOffsets[i]);
                }
                if (this._aColorDraw) {
                    this._aColorDraw.bindInterleavedFloatArrayBuffer(4, this.core2.interleavedStride, this.core2.interleavedColorOffset);
                }
            } else {
                this.VAOHasInterleavedBuf = false;
                if (this._aVertexDraw) {
                    this._aVertexDraw.bindFloatArrayBuffer(this.core2.vertexBuf);
                }
                if (this._aNormalDraw) {
                    this._aNormalDraw.bindFloatArrayBuffer(this.core2.normalBuf);
                }
                var uvBuf;
                for (var i = 0, len = this._aUVDraw.length; i < len; i++) {
                    uvBuf = this.core2.uvBufs[i];
                    if (uvBuf) {
                        this._aUVDraw[i].bindFloatArrayBuffer(uvBuf);
                    }
                }
                if (this._aColorDraw) {
                    this._aColorDraw.bindFloatArrayBuffer(this.core2.colorBuf);
                }
            }

            if (this._aTangentDraw) {

                // In the texture chunk we remembered which UV layer we're using for the normal
                // map so that we can lazy-generate the tangents from the appropriate UV layer
                // in the geometry chunk.

                // Note that only one normal map is allowed per drawable, so there
                // will be only one UV layer used for normal mapping.

                var normalMapUVLayerIdx = frameCtx.normalMapUVLayerIdx;
                if (normalMapUVLayerIdx >= 0) {
                    this._aTangentDraw.bindFloatArrayBuffer(this.core2.getTangents(normalMapUVLayerIdx));
                }
            }
        }

        if (this._aRegionMapUVDraw) {
            var regionMapUVLayerIdx = frameCtx.regionMapUVLayerIdx; // Set by regionMapChunk
            if (regionMapUVLayerIdx >= 0) {
                var uvBufs = this.core2.uvBufs;
                if (regionMapUVLayerIdx < uvBufs.length) {
                    this._aRegionMapUVDraw.bindFloatArrayBuffer(uvBufs[regionMapUVLayerIdx]);
                }
            }
        }

        this.core2.indexBuf.bind();
    },

    morphPick: function (frameCtx) {

        var core = this.core;
        var core2 = this.core2;

        var target1 = core.targets[core.key1];
        var target2 = core.targets[core.key2];

        if (frameCtx.pickObject || frameCtx.pickRegion) {

            if (this._aMorphVertexPick) {

                this._aVertexPick.bindFloatArrayBuffer(target1.vertexBuf);
                this._aMorphVertexPick.bindFloatArrayBuffer(target2.vertexBuf);

            } else if (this._aVertexPick) {
                this._aVertexPick.bindFloatArrayBuffer(core2.vertexBuf);
            }

            core2.indexBuf.bind();

        } else if (frameCtx.pickTriangle) {

            if (this._aMorphVertexPick) {

                var pickPositionsBuf = core.getPickPositions(core.key1, core2.arrays.indices);
                if (pickPositionsBuf) {
                    this._aVertexPick.bindFloatArrayBuffer(pickPositionsBuf);
                }

                pickPositionsBuf = core.getPickPositions(core.key2, core2.arrays.indices);
                if (pickPositionsBuf) {
                    this._aMorphVertexPick.bindFloatArrayBuffer(pickPositionsBuf);
                }

                if (this._aColorPick) {
                    this._aColorPick.bindFloatArrayBuffer(core2.getPickColors());
                }

            } else if (this._aVertexPick) {

                this._aVertexPick.bindFloatArrayBuffer(core2.vertexBuf);

                core2.indexBuf.bind();
            }
        }

        if (this._uMorphFactorPick) {
            this._uMorphFactorPick.setValue(core.factor);
        }
    },

    pick: function (frameCtx) {

        var core = this.core;
        var core2 = this.core2;

        if (core.targets && core.targets.length) {

            this.morphPick(frameCtx);

        } else {

            if (frameCtx.pickObject || frameCtx.pickRegion) {

                if (this._aVertexPick) {
                    this._aVertexPick.bindFloatArrayBuffer(core2.vertexBuf);
                }

                if (this._aRegionMapUVPick) {
                    this._aRegionMapUVPick.bindFloatArrayBuffer(core2.uvBufs[frameCtx.regionMapUVLayerIdx]); // Set by regionMapChunk
                }

                core2.indexBuf.bind();

            } else if (frameCtx.pickTriangle) {

                if (this._aVertexPick) {
                    this._aVertexPick.bindFloatArrayBuffer(core2.getPickPositions());
                }

                if (this._aColorPick) {
                    this._aColorPick.bindFloatArrayBuffer(core2.getPickColors());
                }

            }
        }
    }
});
;/**
 *  Create display state chunk type for draw render of lights projection
 */
SceneJS_ChunkFactory.createChunkType({

    type:"lights",

    build:function () {

        this._uAmbientColor = this._uAmbientColor || [];
        this._uLightColor = this._uLightColor || [];
        this._uLightDir = this._uLightDir || [];
        this._uLightPos = this._uLightPos || [];
        this._uLightCutOff = this._uLightCutOff || [];
        this._uLightSpotExp = this._uLightSpotExp || [];
        this._uLightAttenuation = this._uLightAttenuation || [];
        this._uInnerCone = this._uInnerCone || [];
        this._uOuterCone = this._uOuterCone || [];

        var lights = this.core.lights;
        var program = this.program;

        for (var i = 0, len = lights.length; i < len; i++) {

            switch (lights[i].mode) {

                case "ambient":
                    this._uAmbientColor[i] = (program.draw.getUniform("SCENEJS_uAmbientColor"));
                    break;

                case "dir":
                    this._uLightColor[i] = program.draw.getUniform("SCENEJS_uLightColor" + i);
                    this._uLightPos[i] = null;
                    this._uLightDir[i] = program.draw.getUniform("SCENEJS_uLightDir" + i);
                    break;

                case "point":
                    this._uLightColor[i] = program.draw.getUniform("SCENEJS_uLightColor" + i);
                    this._uLightPos[i] = program.draw.getUniform("SCENEJS_uLightPos" + i);
                    this._uLightDir[i] = null;
                    this._uLightAttenuation[i] = program.draw.getUniform("SCENEJS_uLightAttenuation" + i);
                    break;

                case "spot":
                    this._uLightColor[i] = program.draw.getUniform("SCENEJS_uLightColor" + i);
                    this._uLightPos[i] = program.draw.getUniform("SCENEJS_uLightPos" + i);
                    this._uLightDir[i] = program.draw.getUniform("SCENEJS_uLightDir" + i);
                    this._uLightAttenuation[i] = program.draw.getUniform("SCENEJS_uLightAttenuation" + i);
                    this._uInnerCone[i] = program.draw.getUniform("SCENEJS_uInnerCone" + i);
                    this._uOuterCone[i] = program.draw.getUniform("SCENEJS_uOuterCone" + i);
                    break;
            }
        }
    },

    draw:function (frameCtx) {

        if (frameCtx.dirty) {
            this.build();
        }

        var lights = this.core.lights;
        var light;

        var gl = this.program.gl;

        for (var i = 0, len = lights.length; i < len; i++) {

            light = lights[i];

            if (this._uAmbientColor[i]) {
                this._uAmbientColor[i].setValue(light.color);

            } else {

                if (this._uLightColor[i]) {
                    this._uLightColor[i].setValue(light.color);
                }

                if (this._uLightPos[i]) {
                    this._uLightPos[i].setValue(light.pos);

                    if (this._uLightAttenuation[i]) {
                        this._uLightAttenuation[i].setValue(light.attenuation);
                    }
                }

                if (this._uLightDir[i]) {
                    this._uLightDir[i].setValue(light.dir);
                }

                if (this._uInnerCone[i]) {
                    this._uInnerCone[i].setValue(light.innerCone);
                }

                if (this._uOuterCone[i]) {
                    this._uOuterCone[i].setValue(light.outerCone);
                }
            }
        }
    }
});
;/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type: "listeners",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    build : function() {
    },

    draw : function(frameCtx) {

        var listeners = this.core.listeners;
        var renderListenerCtx = frameCtx.renderListenerCtx;

        for (var i = listeners.length - 1; i >= 0; i--) { // Child listeners first
            if (listeners[i](renderListenerCtx) === true) { // Call listener with query facade object as scope
                return true;
            }
        }
    }
});;/**
 * Create display state chunk type for draw and pick render of lookAt transform
 */
SceneJS_ChunkFactory.createChunkType({

    type: "lookAt",

    build : function() {

        this._uvMatrixDraw = this.program.draw.getUniform("SCENEJS_uVMatrix");
        this._uVNMatrixDraw = this.program.draw.getUniform("SCENEJS_uVNMatrix");
        this._uWorldEyeDraw = this.program.draw.getUniform("SCENEJS_uWorldEye");

        this._uvMatrixPick = this.program.pick.getUniform("SCENEJS_uVMatrix");
    },

    draw : function(frameCtx) {

        if (this.core.dirty) {
            this.core.rebuild();
        }

        var gl = this.program.gl;

        if (this._uvMatrixDraw) {
            this._uvMatrixDraw.setValue(this.core.mat);
        }

        if (this._uVNMatrixDraw) {
            this._uVNMatrixDraw.setValue(this.core.normalMat);
        }

        if (this._uWorldEyeDraw) {
            this._uWorldEyeDraw.setValue(this.core.lookAt.eye);
        }

        frameCtx.viewMat = this.core.mat;
    },

    pick : function(frameCtx) {

        var gl = this.program.gl;

        if (this._uvMatrixPick) {
            this._uvMatrixPick.setValue(this.core.mat);
        }

        frameCtx.viewMat = this.core.mat;
    }
});;SceneJS_ChunkFactory.createChunkType({

    type: "material",

    build: function () {

        var draw = this.program.draw;

        this._uMaterialBaseColor = draw.getUniform("SCENEJS_uMaterialColor");
        this._uMaterialSpecularColor = draw.getUniform("SCENEJS_uMaterialSpecularColor");
        this._uMaterialEmitColor = draw.getUniform("SCENEJS_uMaterialEmitColor");

        this._uMaterialSpecular = draw.getUniform("SCENEJS_uMaterialSpecular");
        this._uMaterialShine = draw.getUniform("SCENEJS_uMaterialShine");
        this._uMaterialEmit = draw.getUniform("SCENEJS_uMaterialEmit");

        this._uMaterialAlpha = draw.getUniform("SCENEJS_uMaterialAlpha");
    },

    draw: function () {

        var gl = this.program.gl;

        if (this._uMaterialBaseColor) {
            this._uMaterialBaseColor.setValue(this.core.baseColor);
        }

        if (this._uMaterialSpecularColor) {
            this._uMaterialSpecularColor.setValue(this.core.specularColor);
        }

        if (this._uMaterialEmitColor) {
            this._uMaterialEmitColor.setValue(this.core.emitColor);
        }

        if (this._uMaterialSpecular) {
            this._uMaterialSpecular.setValue(this.core.specular);
        }

        if (this._uMaterialShine) {
            this._uMaterialShine.setValue(this.core.shine);
        }

        if (this._uMaterialEmit) {
            this._uMaterialEmit.setValue(this.core.emit);
        }

        if (this._uMaterialAlpha) {
            this._uMaterialAlpha.setValue(this.core.alpha);
        }
    }
});
;SceneJS_ChunkFactory.createChunkType({

    type: "program",

    build: function () {

        // Note that "program" chunks are always after "renderTarget" chunks
        this._depthModeDraw = this.program.draw.getUniform("SCENEJS_uDepthMode");
        this._pickMode = this.program.pick.getUniform("SCENEJS_uPickMode");
    },

    draw: function (frameCtx) {
        var drawProgram = this.program.draw;
        drawProgram.bind();
        frameCtx.textureUnit = 0;
        var gl = this.program.gl;
        if (this._depthModeDraw) {
            this._depthModeDraw.setValue(frameCtx.depthMode);
        }
        if (!frameCtx.VAO) {
            for (var i = 0; i < 10; i++) {
                gl.disableVertexAttribArray(i);
            }
        }

        frameCtx.drawProgram = this.program.draw;
    },

    pick: function (frameCtx) {

        var pickProgram = this.program.pick;
        pickProgram.bind();

        var gl = this.program.gl;

        // Set the picking mode

        if (frameCtx.pickObject) {
            this._pickMode.setValue(0.0); // Pick object

        } else if (frameCtx.pickTriangle) {
            this._pickMode.setValue(1.0);// Pick triangle

        } else {
            this._pickMode.setValue(2.0); // Pick region
        }

        frameCtx.textureUnit = 0;

        for (var i = 0; i < 10; i++) {
            gl.disableVertexAttribArray(i);
        }
    }
});



;/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type: "renderer",

    build: function () {
    },

    drawAndPick: function (frameCtx) {

        if (this.core.props) {
            var gl = this.program.gl;
            if (frameCtx.renderer) {
                frameCtx.renderer.props.restoreProps(gl);
                frameCtx.renderer = this.core;
            }
            this.core.props.setProps(gl);
        }
    }
});
;SceneJS_ChunkFactory.createChunkType({

    type: "regionMap",

    build: function () {
        this._uRegionMapRegionColor = this.program.draw.getUniform("SCENEJS_uRegionMapRegionColor");
        this._uRegionMapHighlightFactor = this.program.draw.getUniform("SCENEJS_uRegionMapHighlightFactor");
        this._uRegionMapHideAlpha = this.program.draw.getUniform("SCENEJS_uRegionMapHideAlpha");
        this._uRegionMapSampler = "SCENEJS_uRegionMapSampler";
    },

    draw: function (frameCtx) {

        var texture = this.core.texture;

        if (texture) {

            this.program.draw.bindTexture(this._uRegionMapSampler, texture, frameCtx.textureUnit);
            frameCtx.textureUnit = (frameCtx.textureUnit + 1) % SceneJS.WEBGL_INFO.MAX_TEXTURE_UNITS;
        }

        var gl = this.program.gl;
        var transparent = this.core.mode === "hide" || this.core.mode === "isolate";

        if (frameCtx.transparent != transparent) {

            if (transparent) {

                // Entering a transparency bin

                gl.enable(gl.BLEND);
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                frameCtx.blendEnabled = true;

            } else {

                // Leaving a transparency bin

                gl.disable(gl.BLEND);
                frameCtx.blendEnabled = false;
            }

            frameCtx.transparent = transparent;
        }

        if (texture) {

            if (this._uRegionMapRegionColor) {
                this._uRegionMapRegionColor.setValue(this.core.regionColor);
            }

            if (this._uRegionMapHighlightFactor) {
                this._uRegionMapHighlightFactor.setValue(this.core.highlightFactor);
            }

            if (this._uRegionMapHideAlpha) {
                this._uRegionMapHideAlpha.setValue(this.core.hideAlpha);
            }

            frameCtx.regionMapUVLayerIdx = this.core.uvLayerIdx;

        } else {

            frameCtx.regionMapUVLayerIdx = -1;
        }
    },

    pick: function (frameCtx) {

        var texture = this.core.texture;

        if (texture) {

            frameCtx.regionData = this.core.regionData;

            frameCtx.textureUnit = 0;

            this.program.pick.bindTexture(this._uRegionMapSampler, texture, frameCtx.textureUnit);
            frameCtx.textureUnit = (frameCtx.textureUnit + 1) % SceneJS.WEBGL_INFO.MAX_TEXTURE_UNITS;

            frameCtx.regionMapUVLayerIdx = this.core.uvLayerIdx;

        } else {

            frameCtx.regionMapUVLayerIdx = -1;
        }
    }
});;/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type:"depthBuffer",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    drawAndPick:function (frameCtx) {

        var gl = this.program.gl;

        var enabled = this.core.enabled;

        if (frameCtx.depthbufEnabled != enabled) {
            if (enabled) {
                gl.enable(gl.DEPTH_TEST);
            } else {
                gl.disable(gl.DEPTH_TEST);
            }
            frameCtx.depthbufEnabled = enabled;
        }

        var clearDepth = this.core.clearDepth;

        if (frameCtx.clearDepth != clearDepth) {
            gl.clearDepth(clearDepth);
            frameCtx.clearDepth = clearDepth;
        }

        var depthFunc = this.core.depthFunc;

        if (frameCtx.depthFunc != depthFunc) {
            gl.depthFunc(depthFunc);
            frameCtx.depthFunc = depthFunc;
        }

        if (this.core.clear) {
            gl.clear(gl.DEPTH_BUFFER_BIT);
        }
    }
});
;/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type:"colorBuffer",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    build:function () {
    },

    drawAndPick:function (frameCtx) {

        if (!frameCtx.transparent) { // Blending forced when rendering transparent bin

            var blendEnabled = this.core.blendEnabled;

            var gl = this.program.gl;

            if (frameCtx.blendEnabled != blendEnabled) {
                if (blendEnabled) {
                    gl.enable(gl.BLEND);
                } else {
                    gl.disable(gl.BLEND);
                }
                frameCtx.blendEnabled = blendEnabled;
            }

            var colorMask = this.core.colorMask;
            gl.colorMask(colorMask.r, colorMask.g, colorMask.b, colorMask.a);
        }
    }
});
;/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type:"view",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    build:function () {
    },

    drawAndPick:function (frameCtx) {

        var scissorTestEnabled = this.core.scissorTestEnabled;

        if (frameCtx.scissorTestEnabled != scissorTestEnabled) {
            var gl = this.program.gl;
            if (scissorTestEnabled) {
                gl.enable(gl.SCISSOR_TEST);
            } else {
                gl.disable(gl.SCISSOR_TEST);
            }
            frameCtx.scissorTestEnabled = scissorTestEnabled;
        }
    }
});
;/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type: "shader",

    build : function() {
    },

    drawAndPick : function(frameCtx) {

        var paramsStack = this.core.paramsStack;

        if (paramsStack) {

            var program = frameCtx.picking ? this.program.pick : this.program.draw;
            var params;
            var name;

            for (var i = 0, len = paramsStack.length; i < len; i++) {
                params = paramsStack[i];
                for (name in params) {
                    if (params.hasOwnProperty(name)) {
                        program.setUniform(name, params[name]);  // TODO: cache locations
                    }
                }
            }
        }
    }
});;/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type: "shaderParams",

    build : function() {
    },

    drawAndPick: function(frameCtx) {

        var paramsStack = this.core.paramsStack;

        if (paramsStack) {

            var program = frameCtx.picking ? this.program.pick : this.program.draw;
            var params;
            var name;

            for (var i = 0, len = paramsStack.length; i < len; i++) {
                params = paramsStack[i];
                for (name in params) {
                    if (params.hasOwnProperty(name)) {
                        program.setUniform(name, params[name]);  // TODO: cache locations
                    }
                }
            }
        }
    }
});;/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type:"style",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    drawAndPick:function (frameCtx) {

        var lineWidth = this.core.lineWidth;

        if (frameCtx.lineWidth != lineWidth) {
            var gl = this.program.gl;
            gl.lineWidth(lineWidth);
            frameCtx.lineWidth = lineWidth;
        }
    }
});
;SceneJS_ChunkFactory.createChunkType({

    type: "texture",

    build : function() {

        this._uTexSampler = this._uTexSampler || [];
        this._uTexMatrix = this._uTexMatrix || [];
        this._uTexBlendFactor = this._uTexBlendFactor || [];

        var layers = this.core.layers;

        if (layers) {

            var layer;
            var draw = this.program.draw;

            for (var i = 0, len = layers.length; i < len; i++) {

                layer = layers[i];

                this._uTexSampler[i] = "SCENEJS_uSampler" + i;

                this._uTexMatrix[i] = draw.getUniform("SCENEJS_uLayer" + i + "Matrix");

                this._uTexBlendFactor[i] = draw.getUniform("SCENEJS_uLayer" + i + "BlendFactor");
            }
        }
    },

    draw : function(frameCtx) {

        frameCtx.textureUnit = 0;
        frameCtx.normalMapUVLayerIdx = -1;

        var layers = this.core.layers;

        if (layers) {

            var draw = this.program.draw;
            var layer;

            for (var i = 0, len = layers.length; i < len; i++) {

                layer = layers[i];

                if (this._uTexSampler[i] && layer.texture) {    // Lazy-loads

                    draw.bindTexture(this._uTexSampler[i], layer.texture, frameCtx.textureUnit);
                    frameCtx.textureUnit = (frameCtx.textureUnit + 1) % SceneJS.WEBGL_INFO.MAX_TEXTURE_UNITS;

                    if (layer._matrixDirty && layer.buildMatrix) {
                        layer.buildMatrix.call(layer);
                    }

                    if (this._uTexMatrix[i]) {
                        this._uTexMatrix[i].setValue(layer.matrixAsArray);
                    }

                    if (this._uTexBlendFactor[i]) {
                        this._uTexBlendFactor[i].setValue(layer.blendFactor);
                    }

                    if (layer.isNormalMap) {

                        // Remember which UV layer we're using for the normal
                        // map so that we can lazy-generate the tangents from the
                        // appropriate UV layer in the geometry chunk.

                        // Note that only one normal map is allowed per drawable, so there
                        // will be only one UV layer used for normal mapping.

                        frameCtx.normalMapUVLayerIdx = layer.uvLayerIdx;
                    }

                } else {
                     // draw.bindTexture(this._uTexSampler[i], null, i); // Unbind
                }
            }
        }

        frameCtx.texture = this.core;
    }
});;SceneJS_ChunkFactory.createChunkType({

    type: "fresnel",

    build: function () {

        var draw = this.program.draw;

        var core = this.core;

        if (core.diffuse) {
            this._uDiffuseFresnelCenterBias = draw.getUniform("SCENEJS_uDiffuseFresnelCenterBias");
            this._uDiffuseFresnelEdgeBias = draw.getUniform("SCENEJS_uDiffuseFresnelEdgeBias");
            this._uDiffuseFresnelPower = draw.getUniform("SCENEJS_uDiffuseFresnelPower");
            this._uDiffuseFresnelCenterColor = draw.getUniform("SCENEJS_uDiffuseFresnelCenterColor");
            this._uDiffuseFresnelEdgeColor = draw.getUniform("SCENEJS_uDiffuseFresnelEdgeColor");
        }

        if (core.specular) {
            this._uSpecularFresnelCenterBias = draw.getUniform("SCENEJS_uSpecularFresnelCenterBias");
            this._uSpecularFresnelEdgeBias = draw.getUniform("SCENEJS_uSpecularFresnelEdgeBias");
            this._uSpecularFresnelPower = draw.getUniform("SCENEJS_uSpecularFresnelPower");
            this._uSpecularFresnelCenterColor = draw.getUniform("SCENEJS_uSpecularFresnelCenterColor");
            this._uSpecularFresnelEdgeColor = draw.getUniform("SCENEJS_uSpecularFresnelEdgeColor");
        }

        if (core.alpha) {
            this._uAlphaFresnelCenterBias = draw.getUniform("SCENEJS_uAlphaFresnelCenterBias");
            this._uAlphaFresnelEdgeBias = draw.getUniform("SCENEJS_uAlphaFresnelEdgeBias");
            this._uAlphaFresnelPower = draw.getUniform("SCENEJS_uAlphaFresnelPower");
            this._uAlphaFresnelCenterColor = draw.getUniform("SCENEJS_uAlphaFresnelCenterColor");
            this._uAlphaFresnelEdgeColor = draw.getUniform("SCENEJS_uAlphaFresnelEdgeColor");
        }

        if (core.reflect) {
            this._uReflectFresnelCenterBias = draw.getUniform("SCENEJS_uReflectFresnelCenterBias");
            this._uReflectFresnelEdgeBias = draw.getUniform("SCENEJS_uReflectFresnelEdgeBias");
            this._uReflectFresnelPower = draw.getUniform("SCENEJS_uReflectFresnelPower");
            this._uReflectFresnelCenterColor = draw.getUniform("SCENEJS_uReflectFresnelCenterColor");
            this._uReflectFresnelEdgeColor = draw.getUniform("SCENEJS_uReflectFresnelEdgeColor");
        }

        if (core.emit) {
            this._uEmitFresnelCenterBias = draw.getUniform("SCENEJS_uEmitFresnelCenterBias");
            this._uEmitFresnelEdgeBias = draw.getUniform("SCENEJS_uEmitFresnelEdgeBias");
            this._uEmitFresnelPower = draw.getUniform("SCENEJS_uEmitFresnelPower");
            this._uEmitFresnelCenterColor = draw.getUniform("SCENEJS_uEmitFresnelCenterColor");
            this._uEmitFresnelEdgeColor = draw.getUniform("SCENEJS_uEmitFresnelEdgeColor");
        }

        if (core.fragment) {
            this._uFragmentFresnelCenterBias = draw.getUniform("SCENEJS_uFragmentFresnelCenterBias");
            this._uFragmentFresnelEdgeBias = draw.getUniform("SCENEJS_uFragmentFresnelEdgeBias");
            this._uFragmentFresnelPower = draw.getUniform("SCENEJS_uFragmentFresnelPower");
            this._uFragmentFresnelCenterColor = draw.getUniform("SCENEJS_uFragmentFresnelCenterColor");
            this._uFragmentFresnelEdgeColor = draw.getUniform("SCENEJS_uFragmentFresnelEdgeColor");
        }
    },

    draw: function () {

        var gl = this.program.gl;

        var core = this.core;

        if (core.diffuse) {
            
            if (this._uDiffuseFresnelCenterBias) {
                this._uDiffuseFresnelCenterBias.setValue(core.diffuse.centerBias);
            }

            if (this._uDiffuseFresnelEdgeBias) {
                this._uDiffuseFresnelEdgeBias.setValue(core.diffuse.edgeBias);
            }

            if (this._uDiffuseFresnelPower) {
                this._uDiffuseFresnelPower.setValue(core.diffuse.power);
            }

            if (this._uDiffuseFresnelCenterColor) {
                this._uDiffuseFresnelCenterColor.setValue(core.diffuse.centerColor);
            }

            if (this._uDiffuseFresnelEdgeColor) {
                this._uDiffuseFresnelEdgeColor.setValue(core.diffuse.edgeColor);
            }
        }

        if (core.specular) {

            if (this._uSpecularFresnelCenterBias) {
                this._uSpecularFresnelCenterBias.setValue(core.specular.centerBias);
            }

            if (this._uSpecularFresnelEdgeBias) {
                this._uSpecularFresnelEdgeBias.setValue(core.specular.edgeBias);
            }

            if (this._uSpecularFresnelPower) {
                this._uSpecularFresnelPower.setValue(core.specular.power);
            }

            if (this._uSpecularFresnelCenterColor) {
                this._uSpecularFresnelCenterColor.setValue(core.specular.centerColor);
            }

            if (this._uSpecularFresnelEdgeColor) {
                this._uSpecularFresnelEdgeColor.setValue(core.specular.edgeColor);
            }
        }

        if (core.alpha) {

            if (this._uAlphaFresnelCenterBias) {
                this._uAlphaFresnelCenterBias.setValue(core.alpha.centerBias);
            }

            if (this._uAlphaFresnelEdgeBias) {
                this._uAlphaFresnelEdgeBias.setValue(core.alpha.edgeBias);
            }

            if (this._uAlphaFresnelPower) {
                this._uAlphaFresnelPower.setValue(core.alpha.power);
            }

            if (this._uAlphaFresnelCenterColor) {
                this._uAlphaFresnelCenterColor.setValue(core.alpha.centerColor);
            }

            if (this._uAlphaFresnelEdgeColor) {
                this._uAlphaFresnelEdgeColor.setValue(core.alpha.edgeColor);
            }
        }

        if (core.reflect) {

            if (this._uReflectFresnelCenterBias) {
                this._uReflectFresnelCenterBias.setValue(core.reflect.centerBias);
            }

            if (this._uReflectFresnelEdgeBias) {
                this._uReflectFresnelEdgeBias.setValue(core.reflect.edgeBias);
            }

            if (this._uReflectFresnelPower) {
                this._uReflectFresnelPower.setValue(core.reflect.power);
            }

            if (this._uReflectFresnelCenterColor) {
                this._uReflectFresnelCenterColor.setValue(core.reflect.centerColor);
            }

            if (this._uReflectFresnelEdgeColor) {
                this._uReflectFresnelEdgeColor.setValue(core.reflect.edgeColor);
            }
        }

        if (core.emit) {

            if (this._uEmitFresnelCenterBias) {
                this._uEmitFresnelCenterBias.setValue(core.emit.centerBias);
            }

            if (this._uEmitFresnelEdgeBias) {
                this._uEmitFresnelEdgeBias.setValue(core.emit.edgeBias);
            }

            if (this._uEmitFresnelPower) {
                this._uEmitFresnelPower.setValue(core.emit.power);
            }

            if (this._uEmitFresnelCenterColor) {
                this._uEmitFresnelCenterColor.setValue(core.emit.centerColor);
            }

            if (this._uEmitFresnelEdgeColor) {
                this._uEmitFresnelEdgeColor.setValue(core.emit.edgeColor);
            }
        }

        if (core.fragment) {

            if (this._uFragmentFresnelCenterBias) {
                this._uFragmentFresnelCenterBias.setValue(core.fragment.centerBias);
            }

            if (this._uFragmentFresnelEdgeBias) {
                this._uFragmentFresnelEdgeBias.setValue(core.fragment.edgeBias);
            }

            if (this._uFragmentFresnelPower) {
                this._uFragmentFresnelPower.setValue(core.fragment.power);
            }

            if (this._uFragmentFresnelCenterColor) {
                this._uFragmentFresnelCenterColor.setValue(core.fragment.centerColor);
            }

            if (this._uFragmentFresnelEdgeColor) {
                this._uFragmentFresnelEdgeColor.setValue(core.fragment.edgeColor);
            }
        }
    }
});
;SceneJS_ChunkFactory.createChunkType({

    type: "cubemap",

    build: function () {
        this._uCubeMapSampler = this._uCubeMapSampler || [];
        this._uCubeMapIntensity = this._uCubeMapIntensity || [];
        var layers = this.core.layers;
        if (layers) {
            var layer;
            var draw = this.program.draw;
            for (var i = 0, len = layers.length; i < len; i++) {
                layer = layers[i];
                this._uCubeMapSampler[i] = "SCENEJS_uCubeMapSampler" + i;
                this._uCubeMapIntensity[i] = draw.getUniform("SCENEJS_uCubeMapIntensity" + i);
            }
        }
    },

    draw: function (frameCtx) {
        var layers = this.core.layers;
        if (layers) {
            var layer;
            var draw = this.program.draw;
            for (var i = 0, len = layers.length; i < len; i++) {
                layer = layers[i];
                if (this._uCubeMapSampler[i] && layer.texture) {

                    draw.bindTexture(this._uCubeMapSampler[i], layer.texture, frameCtx.textureUnit);
                    frameCtx.textureUnit = (frameCtx.textureUnit + 1) % SceneJS.WEBGL_INFO.MAX_TEXTURE_UNITS;

                    if (this._uCubeMapIntensity[i]) {
                        this._uCubeMapIntensity[i].setValue(layer.intensity);
                    }
                }
            }
        }
    }
});;SceneJS_ChunkFactory.createChunkType({

    type: "xform",

    build: function () {

        var draw = this.program.draw;

        this._uMatLocationDraw = draw.getUniform("SCENEJS_uMMatrix");
        this._uNormalMatLocationDraw = draw.getUniform("SCENEJS_uMNMatrix");

        var pick = this.program.pick;

        this._uMatLocationPick = pick.getUniform("SCENEJS_uMMatrix");
    },

    draw: function (frameCtx) {

        /* Rebuild core's matrix from matrices at cores on path up to root
         */
        if (SceneJS_configsModule.configs.forceXFormCoreRebuild === true || this.core.dirty && this.core.build) {
            this.core.build();
        }

        var gl = this.program.gl;

        if (this._uMatLocationDraw) {
            this._uMatLocationDraw.setValue(this.core.mat);
        }

        if (this._uNormalMatLocationDraw) {
            this._uNormalMatLocationDraw.setValue(this.core.normalMat);
        }

        frameCtx.modelMat = this.core.mat;
    },

    pick: function (frameCtx) {

        /* Rebuild core's matrix from matrices at cores on path up to root
         */
        if (this.core.dirty) {
            this.core.build();
        }

        var gl = this.program.gl;

        if (this._uMatLocationPick) {
            this._uMatLocationPick.setValue(this.core.mat);
        }

        frameCtx.modelMat = this.core.mat;
    }
});
