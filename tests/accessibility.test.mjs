import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { bindSelectControl } from '../docs/select-control.js';
import { bindPopoverFocus, bindSkipLinks, tabStops } from '../docs/keyboard-focus.js';
import { previewDescription, createPreviewAnnouncer } from '../docs/accessibility.js';
import { normalizeSettings } from '../docs/layout.js';
import { LANGUAGES, translate } from '../docs/i18n.js';

class Element extends EventTarget {
  constructor(id=''){super();this.id=id;this.attrs=new Map();this.children=[];this.dataset={};this.style={};this.tabIndex=0;this.hidden=false;this.offsetTop=0;this.offsetHeight=38;this.clientHeight=200;this.scrollTop=0;}
  setAttribute(k,v){this.attrs.set(k,String(v));}getAttribute(k){return this.attrs.get(k)??null;}removeAttribute(k){this.attrs.delete(k);}
  append(...items){for(const item of items){item.parent=this;this.children.push(item);}}
  replaceChildren(...items){this.children=[];this.append(...items);}get firstChild(){return this.children[0];}
  getBoundingClientRect(){return{left:20,right:120,top:20,bottom:56,width:100};}
  contains(item){return item===this||this.children.some(child=>child.contains?.(item));}
  focus(){this.ownerDocument.activeElement=this;}
  animate(){return{finished:Promise.resolve(),cancel(){}};}
  querySelector(){return this.valueLabel;} querySelectorAll(){return this.stops||[];}
  matches(){return this.disabled===true;}closest(){return this.excluded?this:null;}getClientRects(){return this.visible===false?[]:[{}];}
}
function key(target,value,extra={}){const e=new Event('keydown',{cancelable:true});Object.assign(e,{key:value,...extra});target.dispatchEvent(e);return e;}

test('configuration combobox keeps DOM focus, announces the active option, commits with Enter/Tab and cancels with Escape',t=>{
 const previous={document:globalThis.document,window:globalThis.window,getComputedStyle:globalThis.getComputedStyle,innerWidth:globalThis.innerWidth,innerHeight:globalThis.innerHeight};
 t.after(()=>{for(const[k,v]of Object.entries(previous)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}});
 const doc=new EventTarget();doc.body=new Element();doc.documentElement=new Element();doc.createElement=()=>{const e=new Element();e.ownerDocument=doc;return e;};doc.createTextNode=text=>({textContent:text});
 Object.assign(globalThis,{document:doc,window:new EventTarget(),innerWidth:800,innerHeight:600,getComputedStyle:()=>({opacity:1,transform:'none',getPropertyValue:key=>key==='--motion-duration'?'0ms':'ease'})});
 const select=new Element(),button=new Element('paper-button'),menu=new Element('paper-menu');menu.hidden=true;button.ownerDocument=doc;button.valueLabel={};button.focus();
 select.options=[{value:'A4',textContent:'A4'},{value:'A3',textContent:'A3'},{value:'LETTER',textContent:'Carta'}];select.value='A4';Object.defineProperty(select,'selectedIndex',{get(){return this.options.findIndex(o=>o.value===this.value);}});
 let changes=0;select.addEventListener('change',()=>changes++);bindSelectControl(select,button,menu);
 key(button,'ArrowDown');assert.equal(doc.activeElement,button);assert.equal(button.getAttribute('aria-activedescendant'),'paper-menu-option-0');
 key(button,'ArrowDown');assert.equal(select.value,'A4');assert.equal(button.getAttribute('aria-activedescendant'),'paper-menu-option-1');
 key(button,'Escape');assert.equal(select.value,'A4');assert.equal(button.getAttribute('aria-activedescendant'),null);
 key(button,'End');key(button,'Enter');assert.equal(select.value,'LETTER');assert.equal(changes,1);assert.equal(button.getAttribute('aria-expanded'),'false');
 key(button,'Home');const tab=key(button,'Tab');assert.equal(select.value,'A4');assert.equal(tab.defaultPrevented,false);
 key(button,'c');assert.equal(button.getAttribute('aria-activedescendant'),'paper-menu-option-2');key(button,'Escape');
});

test('Tab leaves a modeless body-level panel beside its opener and Shift+Tab returns to the opener',()=>{
 const panel=new Element(),before=new Element(),opener=new Element(),after=new Element(),first=new Element(),last=new Element(),hidden=new Element();hidden.excluded=true;
 const doc=Object.assign(new EventTarget(),{activeElement:last,querySelectorAll:()=>[before,opener,after,first,last,hidden]});
 for(const node of [before,opener,after,first,last,hidden])node.ownerDocument=doc;
 panel.ownerDocument=doc;panel.append(first,last);panel.stops=[first,last];
 let closes=0;bindPopoverFocus(panel,{trigger:()=>opener,close:()=>closes++});
 assert.equal(key(panel,'Tab').defaultPrevented,true);assert.equal(doc.activeElement,after);assert.equal(closes,1);
 doc.activeElement=first;key(panel,'Tab',{shiftKey:true});assert.equal(doc.activeElement,opener);assert.equal(closes,2);
 doc.activeElement=first;assert.equal(key(panel,'Tab').defaultPrevented,false);assert.equal(closes,2);
 assert.equal(tabStops(doc).includes(hidden),false);
 doc.dispatchEvent(new Event('wheel'));assert.equal(closes,3);assert.equal(doc.activeElement,opener);
});

test('preview announcements are quiet initially, coalesce rapid edits and retain warnings',()=>{
 const output={textContent:''},jobs=new Map();let id=0;
 const announce=createPreviewAnnouncer(output,{schedule:fn=>{jobs.set(++id,fn);return id;},cancel:key=>jobs.delete(key)});
 announce('Initial');assert.equal(jobs.size,0);announce('10 staves');announce('11 staves');announce('11 staves');assert.equal(jobs.size,1);
 [...jobs.values()][0]();assert.equal(output.textContent,'11 staves');announce('Does not fit');[...jobs.values()].at(-1)();assert.equal(output.textContent,'Does not fit');
});

test('all locales expose full sheet descriptions and valid keyboard skip destinations on editor and catalogue pages',async()=>{
 const settings=normalizeSettings({mode:'blocks',blocks:[{count:3,inside:9,after:12}],duplex:{enabled:true},notes:{enabled:true},pageText:{nameDate:true,title:'Activitat',instructions:'Explica',footer:'Escola'}});
 for(const locale of Object.keys(LANGUAGES)){
   const t=(key,vars)=>translate(locale,key,vars),description=previewDescription(settings,t);
   for(const content of ['Activitat','Explica','Escola','40%'])assert.ok(description.includes(content));
   assert.ok(description.includes(t('marginInside')));assert.ok(!description.includes('undefined'));
   for(const [route,target]of [[locale+'/','main-content'],[locale+'/templates/','template-guide']]){
    const html=await readFile(new URL('../docs/'+route+'index.html',import.meta.url),'utf8');
    assert.ok(html.includes('class="skip-link" href="#'+target+'"'));assert.ok(html.includes('id="'+target+'"'));
    assert.ok(!html.includes('data-i18n="skipMain"></a>'));
    const ids=[...html.matchAll(/\bid="([^" ]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
   }
 }
});


test('skip links preserve localized routes and configuration hashes while moving focus',t=>{
 const previous=globalThis.location;t.after(()=>{if(previous===undefined)delete globalThis.location;else globalThis.location=previous;});
 globalThis.location={pathname:'/ca/',search:'',hash:'#P2-layout'};
 const target=new Element('main-content'),link=new Element();link.setAttribute('href','#main-content');
 const doc={activeElement:null,querySelectorAll:()=>[link],getElementById:id=>id==='main-content'?target:null};target.ownerDocument=doc;
 bindSkipLinks(doc);assert.equal(link.href,'/ca/#main-content');const click=new Event('click',{cancelable:true});link.dispatchEvent(click);
 assert.equal(click.defaultPrevented,true);assert.equal(doc.activeElement,target);assert.equal(location.hash,'#P2-layout');
});
