'use strict';
const KEY='tfc-load-planner-v2-4';
const DEFAULTS=[
{id:'semi',name:'Semi tautliner',l:13200,w:2400,h:2700,payload:24000,max:4,on:true},
{id:'flat',name:'Flat top',l:13200,w:2400,h:0,payload:24000,max:4,on:true},
{id:'drop',name:'Drop deck (approx.)',l:13200,w:2400,h:3200,payload:24000,max:2,on:false},
{id:'mezz',name:'Mezzanine (approx.)',l:13200,w:2400,h:3000,payload:22000,max:2,on:false},
{id:'custom',name:'Custom trailer',l:13200,w:2400,h:2700,payload:24000,max:2,on:false}];
const colours=['#2f80ed','#26a69a','#ed8b24','#9b61d9','#ef6670','#7f8c8d','#00a0c6','#8d9d3b','#e0528d','#596fdf'];
let plans=[];const $=s=>document.querySelector(s);
function init(){renderTypes();bind();if(!restore()){addRow({ref:'B1',qty:1,l:1200,w:1000,h:1000,kg:0,rotatable:true,stack:false,max:1})}updateStats('Ready',0,0,totalQty(),totalKg())}
function bind(){$('#add').onclick=()=>{addRow({ref:'ITEM',qty:1,l:1200,w:1000,h:1000,kg:0,rotatable:true,stack:false,max:1});save()};$('#generate').onclick=generate;$('#clear').onclick=clearPlan;$('#print').onclick=()=>window.print();$('#sample').onclick=sample;$('#reset').onclick=reset;$('#csvOut').onclick=exportCsv;$('#csvIn').onchange=importCsv;document.addEventListener('change',save);document.addEventListener('input',e=>{if(e.target.matches('input'))save()})}
function renderTypes(data=DEFAULTS){$('#types').innerHTML='';data.forEach(t=>{const d=document.createElement('div');d.className='equip'+(t.on?' open':'');d.dataset.id=t.id;d.innerHTML=`<div class="ehead"><input class="on" type="checkbox" ${t.on?'checked':''}><label>${t.name}</label><button class="toggle">▾</button></div><div class="fields"><label>Length mm<input class="tl" type="number" min="1" value="${t.l}"></label><label>Usable width mm<input class="tw" type="number" min="1" value="${t.w}"></label><label>Height mm<input class="th" type="number" min="0" value="${t.h}"></label><label>Payload kg<input class="tp" type="number" min="0" value="${t.payload}"></label><label>Maximum available<input class="tm" type="number" min="1" max="20" value="${t.max}"></label></div>`;d.querySelector('.toggle').onclick=()=>d.classList.toggle('open');d.querySelector('.on').onchange=e=>d.classList.toggle('open',e.target.checked);$('#types').appendChild(d)})}
function addRow(x){const tr=document.createElement('tr');tr.innerHTML=`<td><input class="ref" value="${esc(x.ref)}"></td><td><input class="qty" type="number" min="1" value="${x.qty||1}"></td><td><input class="l" type="number" min="1" value="${x.l}"></td><td><input class="w" type="number" min="1" value="${x.w}"></td><td><input class="h" type="number" min="1" value="${x.h}"></td><td><input class="kg" type="number" min="0" value="${x.kg||0}"></td><td><input class="rot" type="checkbox" ${x.rotatable!==false?'checked':''}></td><td><input class="stack" type="checkbox" ${x.stack?'checked':''}></td><td><input class="max" type="number" min="1" value="${x.max||1}"></td><td><button class="del">×</button></td>`;tr.querySelector('.del').onclick=()=>{tr.remove();save()};$('#rows').appendChild(tr)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function getTypes(){return [...document.querySelectorAll('.equip')].map(d=>({id:d.dataset.id,name:DEFAULTS.find(x=>x.id===d.dataset.id).name,on:d.querySelector('.on').checked,l:+d.querySelector('.tl').value||0,w:+d.querySelector('.tw').value||0,h:+d.querySelector('.th').value||0,payload:+d.querySelector('.tp').value||0,max:+d.querySelector('.tm').value||1}))}
function getItems(){return [...$('#rows').rows].map((r,i)=>({ref:r.querySelector('.ref').value||`ITEM-${i+1}`,qty:+r.querySelector('.qty').value||1,l:+r.querySelector('.l').value||0,w:+r.querySelector('.w').value||0,h:+r.querySelector('.h').value||0,kg:+r.querySelector('.kg').value||0,rotatable:r.querySelector('.rot').checked,stack:r.querySelector('.stack').checked,max:+r.querySelector('.max').value||1,colour:colours[i%colours.length]}))}
function expand(items){let a=[];items.forEach(x=>{for(let i=1;i<=x.qty;i++)a.push({...x,id:`${x.ref}-${i}`,unit:i})});return a}
function generate(){save();const types=getTypes().filter(t=>t.on),items=getItems(),units=expand(items);alert([]);if(!types.length)return alert(['Select at least one trailer type.']);if(units.some(x=>!x.l||!x.w||!x.h))return alert(['Every item needs valid length, width and height.']);let candidates=$('#mixed').checked?[solve(types,units)]:types.map(t=>solve([t],units));candidates.sort((a,b)=>a.left.length-b.left.length||a.trailers.length-b.trailers.length||b.util-a.util);render(candidates[0],items)}
function solve(types,source){let left=source.map(x=>({...x})),trs=[],avail=new Map(types.map(t=>[t.id,t.max]));while(left.length&&[...avail.values()].some(x=>x>0)){let best=null;for(const t of types){if(avail.get(t.id)<=0)continue;const p=pack(t,left);const score=count(p)*1e12+p.area;if(!best||score>best.score)best={...p,type:t,score}}if(!best||!count(best))break;trs.push(best);avail.set(best.type.id,avail.get(best.type.id)-1);const used=new Set(best.placed.flatMap(x=>x.members.map(m=>m.id)));left=left.filter(x=>!used.has(x.id))}const cap=trs.reduce((n,x)=>n+x.type.l*x.type.w,0),use=trs.reduce((n,x)=>n+x.area,0);return{trailers:trs,left,util:cap?use/cap:0}}
function count(p){return p.placed.reduce((n,x)=>n+x.members.length,0)}
function stacks(units,t){const groups=new Map(),out=[];units.forEach(x=>{if(!groups.has(x.ref))groups.set(x.ref,[]);groups.get(x.ref).push(x)});for(const g of groups.values())while(g.length){const a=g.shift(),limit=$('#stacking').checked&&a.stack?Math.min(a.max,t.h?Math.floor(t.h/a.h):a.max):1,m=[a];while(m.length<limit&&g.length)m.push(g.shift());out.push({...a,members:m,stackH:a.h*m.length,weight:a.kg*m.length})}return out}
function pack(t,units){const sorters=[(a,b)=>b.l*b.w-a.l*a.w,(a,b)=>Math.max(b.l,b.w)-Math.max(a.l,a.w),(a,b)=>b.w-a.w,(a,b)=>b.l-a.l],tries=[];for(const sort of sorters)for(const pref of [0,1])tries.push(packTry(t,units,sort,pref));tries.sort((a,b)=>count(b)-count(a)||b.area-a.area||a.frag-b.frag);return tries[0]}
function packTry(t,units,sort,pref){const list=stacks(units,t).sort(sort),placed=[],failed=[];let free=[{x:0,y:0,l:t.l,w:t.w}],weight=0,area=0;for(const it of list){if(t.h&&it.stackH>t.h||weight+it.weight>t.payload){failed.push(...it.members);continue}let os=[{l:it.l,w:it.w,rot:false}],can=$('#rotation').checked&&it.rotatable&&it.l!==it.w;if(can)os.push({l:it.w,w:it.l,rot:true});if(pref&&can)os.reverse();let best=null;for(const r of free)for(const o of os)if(o.l<=r.l&&o.w<=r.w){const score=[Math.min(r.l-o.l,r.w-o.w),Math.max(r.l-o.l,r.w-o.w),r.y,r.x];if(!best||cmp(score,best.score)<0)best={...o,x:r.x,y:r.y,score}}if(!best){failed.push(...it.members);continue}free=split(free,best);placed.push({...it,...best});weight+=it.weight;area+=best.l*best.w}return{placed,failed,weight,area,frag:free.length}}
function cmp(a,b){for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]-b[i];return 0}
function hit(a,b){return a.x<b.x+b.l&&a.x+a.l>b.x&&a.y<b.y+b.w&&a.y+a.w>b.y}
function inside(a,b){return b.x>=a.x&&b.y>=a.y&&b.x+b.l<=a.x+a.l&&b.y+b.w<=a.y+a.w}
function split(free,u){let out=[];for(const r of free){if(!hit(r,u)){out.push(r);continue}const rr=r.x+r.l,rb=r.y+r.w,ur=u.x+u.l,ub=u.y+u.w;if(u.x>r.x)out.push({x:r.x,y:r.y,l:u.x-r.x,w:r.w});if(ur<rr)out.push({x:ur,y:r.y,l:rr-ur,w:r.w});if(u.y>r.y)out.push({x:r.x,y:r.y,l:r.l,w:u.y-r.y});if(ub<rb)out.push({x:r.x,y:ub,l:r.l,w:rb-ub})}return out.filter(r=>r.l>0&&r.w>0).filter((r,i,a)=>!a.some((q,j)=>i!==j&&inside(q,r)))}
function render(sol,items){plans=sol.trailers;updateStats(sol.left.length?'Incomplete':'Complete',plans.length,totalQty()-sol.left.length,totalQty(),totalKg());alert(sol.left.length?[`${sol.left.length} item(s) could not be placed within selected dimensions or availability.`]:[]);$('#plans').innerHTML='';plans.forEach((p,i)=>{const card=document.createElement('article');card.className='trailer';card.innerHTML=`<div class="title"><h2>Trailer ${i+1}: ${p.type.name}</h2><div class="badges"><span class="badge">${count(p)} item(s)</span><span class="badge">Floor ${(100*p.area/(p.type.l*p.type.w)).toFixed(1)}%</span><span class="badge">${fmt(p.weight)} / ${fmt(p.type.payload)} kg</span></div></div><div class="canvas"><div class="konva" id="k${i}"></div></div><div class="foot"><span>${fmt(p.type.l)} × ${fmt(p.type.w)} mm</span><span>${p.type.h?fmt(p.type.h)+' mm height':'Open height'}</span></div>`;$('#plans').appendChild(card);draw(p,i)})}
function draw(p,i){const q=.07,W=Math.max(720,p.type.l*q),H=Math.max(180,p.type.w*q),s=new Konva.Stage({container:`k${i}`,width:W,height:H}),bg=new Konva.Layer(),fg=new Konva.Layer();s.add(bg);s.add(fg);bg.add(new Konva.Rect({x:0,y:0,width:W,height:H,fill:'#fff',stroke:'#12344f',strokeWidth:4}));for(let m=1000;m<p.type.l;m+=1000){bg.add(new Konva.Line({points:[m*q,0,m*q,H],stroke:'#d4e0e8'}));bg.add(new Konva.Text({x:m*q+2,y:3,text:`${m/1000}m`,fontSize:9,fill:'#657b8c'}))}for(const x of p.placed){const g=new Konva.Group({x:x.x*q,y:x.y*q,draggable:true}),r=new Konva.Rect({width:x.l*q,height:x.w*q,fill:x.colour,opacity:.85,stroke:'#163b55',strokeWidth:1}),tx=new Konva.Text({x:4,y:4,width:Math.max(20,x.l*q-8),text:`${x.ref}${x.members.length>1?' STACK x'+x.members.length:''}\n${x.l} × ${x.w}`,fontSize:10,fontStyle:'bold',fill:'#fff'});g.add(r,tx);g.on('dragmove',()=>{g.x(Math.max(0,Math.min((p.type.l-x.l)*q,g.x())));g.y(Math.max(0,Math.min((p.type.w-x.w)*q,g.y())))});fg.add(g)}bg.draw();fg.draw();const wrap=s.container().parentElement,z=Math.min(1,(wrap.clientWidth-36)/W);s.container().style.transform=`scale(${z})`;s.container().style.transformOrigin='top left';s.container().style.marginRight=`${W*(z-1)}px`;s.container().style.marginBottom=`${H*(z-1)}px`}
function alert(a){$('#alerts').innerHTML=a.map(x=>`<div class="alert">${esc(x)}</div>`).join('')}
function updateStats(status,tr,placed,total,kg){const v=[status,tr,`${placed} / ${total}`,`${fmt(kg)} kg`];[...$('#stats').children].forEach((d,i)=>d.querySelector('b').textContent=v[i])}
function totalQty(){return getItems().reduce((n,x)=>n+x.qty,0)}function totalKg(){return getItems().reduce((n,x)=>n+x.qty*x.kg,0)}function fmt(n){return Math.round(n||0).toLocaleString('en-AU')}
function clearPlan(){plans=[];$('#plans').innerHTML='<div class="empty"><h2>No plan generated</h2><p>Choose equipment, enter freight and generate a plan.</p></div>';alert([]);updateStats('Ready',0,0,totalQty(),totalKg())}
function save(){try{localStorage.setItem(KEY,JSON.stringify({types:getTypes(),items:getItems(),mixed:$('#mixed').checked,rotation:$('#rotation').checked,stacking:$('#stacking').checked}))}catch(e){}}
function restore(){try{const d=JSON.parse(localStorage.getItem(KEY));if(!d)return false;renderTypes(d.types);$('#rows').innerHTML='';d.items.forEach(addRow);$('#mixed').checked=d.mixed!==false;$('#rotation').checked=d.rotation!==false;$('#stacking').checked=d.stacking!==false;return true}catch(e){return false}}
function reset(){localStorage.removeItem(KEY);renderTypes();$('#rows').innerHTML='';addRow({ref:'B1',qty:1,l:1200,w:1000,h:1000,kg:0,rotatable:true,stack:false,max:1});clearPlan();save()}
function sample() {

    $('#rows').innerHTML = '';

    const freight = [
        { ref:'MACHINE', qty:8, l:3200, w:1800, h:2200, kg:2800, rot:false, stk:false, top:false, max:1 },
        { ref:'FORKLIFT', qty:4, l:2400, w:1200, h:2100, kg:3500, rot:false, stk:false, top:false, max:1 },

        { ref:'CRATE-LARGE', qty:12, l:2390, w:1190, h:1344, kg:850, rot:true, stk:false, top:false, max:1 },

        { ref:'CRATE-MED', qty:18, l:1800, w:1000, h:1200, kg:500, rot:true, stk:true, top:false, max:2 },

        { ref:'CRATE-SMALL', qty:20, l:1200, w:1000, h:800, kg:350, rot:true, stk:true, top:false, max:3 },

        { ref:'PALLET-A', qty:10, l:1200, w:1165, h:900, kg:650, rot:true, stk:true, top:false, max:2 },

        { ref:'PALLET-B', qty:10, l:1100, w:1000, h:700, kg:300, rot:true, stk:true, top:true, max:2 },

        { ref:'PIPE-BUNDLE', qty:6, l:5800, w:900, h:900, kg:1200, rot:false, stk:false, top:false, max:1 },

        { ref:'TIMBER-PACK', qty:5, l:4800, w:1200, h:750, kg:900, rot:false, stk:true, top:false, max:2 },

        { ref:'TOOLBOX', qty:7, l:800, w:800, h:700, kg:150, rot:true, stk:true, top:true, max:3 }
    ];

    freight.forEach(item => add(item));

    generate();
}


function exportCsv(){const r=[['ref','qty','length_mm','width_mm','height_mm','weight_kg','rotatable','stackable','max_stack'],...getItems().map(x=>[x.ref,x.qty,x.l,x.w,x.h,x.kg,x.rotatable?'yes':'no',x.stack?'yes':'no',x.max])],a=document.createElement('a');a.href=URL.createObjectURL(new Blob([r.map(x=>x.join(',')).join('\n')],{type:'text/csv'}));a.download='load-planner-freight.csv';a.click()}
function importCsv(e){const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const lines=String(rd.result).trim().split(/\r?\n/);$('#rows').innerHTML='';lines.slice(1).forEach(z=>{const c=z.split(',');if(c.length>=9)addRow({ref:c[0],qty:+c[1]||1,l:+c[2],w:+c[3],h:+c[4],kg:+c[5],rotatable:/^(yes|true|1)$/i.test(c[6]),stack:/^(yes|true|1)$/i.test(c[7]),max:+c[8]||1})});save();clearPlan()};rd.readAsText(f)}
window.addEventListener('load',()=>{if(typeof Konva==='undefined'){document.body.innerHTML='<p>Konva failed to load.</p>';return}init()});
