'use strict';
const TYPES=[
 {id:'semi',name:'Semi tautliner',l:13600,w:2450,h:2700,payload:24000,max:4,on:true,note:''},
 {id:'flat',name:'Flat top',l:13600,w:2490,h:0,payload:24000,max:4,on:true,note:'Height is not used as an enclosed clearance.'},
 {id:'drop',name:'Drop deck',l:13600,w:2490,h:3200,payload:24000,max:2,on:false,note:'Modelled as one rectangular usable deck in this release.'},
 {id:'mezz',name:'Mezzanine (approx.)',l:13600,w:2450,h:3000,payload:22000,max:2,on:false,note:'Approximation only; separate deck zones are not modelled.'},
 {id:'custom',name:'Custom trailer',l:12000,w:2450,h:2700,payload:24000,max:2,on:false,note:''}
];
const COLOURS=['#2f80ed','#26a69a','#ed8b24','#9b61d9','#ef6670','#7f8c8d','#00a0c6','#8d9d3b','#e0528d','#596fdf'];
let rowNo=1,currentPlans=[];const $=s=>document.querySelector(s);
function start(){renderTypes();addRow({ref:'B1',qty:1,l:5460,w:1490,h:880,kg:0,rotatable:true,stack:false,max:1});addRow({ref:'B2',qty:1,l:2578,w:1678,h:1004,kg:0,rotatable:true,stack:false,max:1});bind();updateOverview('Ready',0,0,0,0);}
function bind(){$('#add').onclick=()=>addRow({ref:'B'+(++rowNo),qty:1,l:1200,w:1000,h:1000,kg:0,rotatable:true,stack:false,max:1});$('#generate').onclick=generateBest;$('#clear').onclick=clearPlan;$('#reset').onclick=reset;$('#sample').onclick=sample;$('#export').onclick=()=>window.print();$('#csvOut').onclick=exportCsv;$('#csvIn').onchange=importCsv;}
function renderTypes(){const box=$('#types');box.innerHTML='';TYPES.forEach(t=>{const d=document.createElement('div');d.className='equipment'+(t.on?' open':'');d.dataset.id=t.id;d.innerHTML=`<div class="equipmentHead"><input class="enabled" type="checkbox" ${t.on?'checked':''}><label>${t.name}</label><button class="chev">▾</button></div><div class="equipmentFields"><label>Length mm<input class="tl" type="number" value="${t.l}" min="1"></label><label>Width mm<input class="tw" type="number" value="${t.w}" min="1"></label><label>Height mm<input class="th" type="number" value="${t.h}" min="0"></label><label>Payload kg<input class="tp" type="number" value="${t.payload}" min="0"></label><label>Maximum available<input class="tm" type="number" value="${t.max}" min="1" max="20"></label>${t.note?`<p class="sub">${t.note}</p>`:''}</div>`;d.querySelector('.chev').onclick=()=>d.classList.toggle('open');d.querySelector('.enabled').onchange=e=>{d.classList.toggle('open',e.target.checked)};box.appendChild(d);});}
function addRow(x){const tr=document.createElement('tr');tr.innerHTML=`<td><input class="ref" value="${safe(x.ref)}"></td><td><input class="qty" type="number" min="1" value="${x.qty||1}"></td><td><input class="l" type="number" min="1" value="${x.l}"></td><td><input class="w" type="number" min="1" value="${x.w}"></td><td><input class="h" type="number" min="1" value="${x.h}"></td><td><input class="kg" type="number" min="0" value="${x.kg||0}"></td><td><input class="rotate" type="checkbox" ${x.rotatable!==false?'checked':''}></td><td><input class="stack" type="checkbox" ${x.stack?'checked':''}></td><td><input class="max" type="number" min="1" value="${x.max||1}"></td><td><button class="remove">×</button></td>`;tr.querySelector('.remove').onclick=()=>tr.remove();$('#rows').appendChild(tr);}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function readTypes(){return [...document.querySelectorAll('.equipment')].map(d=>({id:d.dataset.id,name:TYPES.find(t=>t.id===d.dataset.id).name,on:d.querySelector('.enabled').checked,l:+d.querySelector('.tl').value||0,w:+d.querySelector('.tw').value||0,h:+d.querySelector('.th').value||0,payload:+d.querySelector('.tp').value||0,max:Math.min(20,+d.querySelector('.tm').value||1)}));}
function readItems(){return [...$('#rows').rows].map((r,i)=>({ref:r.querySelector('.ref').value||`ITEM-${i+1}`,qty:Math.max(1,+r.querySelector('.qty').value||1),l:+r.querySelector('.l').value||0,w:+r.querySelector('.w').value||0,h:+r.querySelector('.h').value||0,kg:+r.querySelector('.kg').value||0,rotatable:r.querySelector('.rotate').checked,stack:r.querySelector('.stack').checked,max:Math.max(1,+r.querySelector('.max').value||1),colour:COLOURS[i%COLOURS.length]}));}
function expand(src){const a=[];src.forEach(x=>{for(let n=1;n<=x.qty;n++)a.push({...x,unit:n,id:`${x.ref}-${n}`})});return a.sort((a,b)=>(b.l*b.w)-(a.l*a.w));}
function generateBest(){const types=readTypes().filter(t=>t.on),src=readItems(),units=expand(src);setAlerts([]);if(!types.length)return setAlerts(['Select at least one trailer type.'],true);if(!units.length)return setAlerts(['Add at least one freight line.'],true);const invalid=units.filter(x=>!x.l||!x.w||!x.h);if(invalid.length)return setAlerts(['Every freight line needs valid length, width and height values.'],true);
 const mixed=$('#mixed').checked, candidates=[];if(mixed)candidates.push(solve(types,units));else types.forEach(t=>candidates.push(solve([t],units)));candidates.sort(compareSolutions);const best=candidates[0];currentPlans=best.trailers;renderPlans(best,src);}
function compareSolutions(a,b){if(a.unplaced.length!==b.unplaced.length)return a.unplaced.length-b.unplaced.length;if(a.trailers.length!==b.trailers.length)return a.trailers.length-b.trailers.length;return b.util-a.util;}
function solve(types,unitSource){let unplaced=unitSource.map(x=>({...x})),trailers=[];const availability=new Map(types.map(t=>[t.id,t.max]));while(unplaced.length&&[...availability.values()].some(n=>n>0)){let best=null;types.forEach(t=>{if(availability.get(t.id)<=0)return;const packed=packTrailer(t,unplaced);const score=packed.placed.length*1e12+packed.usedArea;if(!best||score>best.score)best={...packed,type:t,score};});if(!best||!best.placed.length)break;best.index=trailers.length+1;trailers.push(best);availability.set(best.type.id,availability.get(best.type.id)-1);const ids=new Set(best.placed.flatMap(p=>p.members.map(m=>m.id)));unplaced=unplaced.filter(x=>!ids.has(x.id));}
 const area=trailers.reduce((n,t)=>n+t.type.l*t.type.w,0),used=trailers.reduce((n,t)=>n+t.usedArea,0);return {trailers,unplaced,util:area?used/area:0};}
function makeStacks(units,type){const useStack=$('#stacking').checked,groups=new Map(),out=[];units.forEach(u=>{const key=u.ref;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(u)});groups.forEach(g=>{while(g.length){const a=g.shift(),max=useStack&&a.stack?Math.min(a.max,type.h?Math.floor(type.h/a.h):a.max):1,count=Math.max(1,Math.min(max,g.length+1)),members=[a];while(members.length<count)members.push(g.shift());out.push({...a,count,members,stackH:a.h*members.length,weight:a.kg*members.length});}});return out.sort((a,b)=>b.l*b.w-a.l*a.w);}
function packTrailer(type,units){
 const sorters=[
  (a,b)=>b.l*b.w-a.l*a.w,
  (a,b)=>Math.max(b.l,b.w)-Math.max(a.l,a.w),
  (a,b)=>Math.max(b.w,b.l)-Math.max(a.w,a.l),
  (a,b)=>b.w-a.w,
  (a,b)=>b.l-a.l
 ];
 const attempts=[];
 for(const sorter of sorters){
  for(const preferRotated of [false,true]) attempts.push(packVariant(type,units,sorter,preferRotated));
 }
 attempts.sort((a,b)=>b.placed.reduce((n,x)=>n+x.members.length,0)-a.placed.reduce((n,x)=>n+x.members.length,0)||b.usedArea-a.usedArea||a.shelfWaste-b.shelfWaste);
 return attempts[0];
}
function packVariant(type,units,sorter,preferRotated){
 const stacks=makeStacks(units,type).slice().sort(sorter),placed=[],failed=[],shelves=[];let weight=0,usedArea=0;
 for(const item of stacks){
  if(type.h&&item.stackH>type.h){failed.push(...item.members);continue}
  if(weight+item.weight>type.payload){failed.push(...item.members);continue}
  const canRotate=$('#rotation').checked&&item.rotatable!==false&&item.l!==item.w;
  let ors=[[item.l,item.w,false]];if(canRotate)ors.push([item.w,item.l,true]);if(preferRotated&&canRotate)ors.reverse();
  const candidates=[];
  for(const [l,w,rot] of ors){
   if(l>type.l||w>type.w)continue;
   for(let s=0;s<shelves.length;s++){
    const sh=shelves[s];
    if(w<=sh.depth&&sh.x+l<=type.l){
     const widthWaste=sh.depth-w, endWaste=type.l-(sh.x+l);
     candidates.push({x:sh.x,y:sh.y,l,w,rot,s,newShelf:false,score:widthWaste*100000+endWaste});
    }
   }
   const y=shelves.reduce((m,s)=>Math.max(m,s.y+s.depth),0);
   if(y+w<=type.w)candidates.push({x:0,y,l,w,rot,s:shelves.length,newShelf:true,score:(type.w-(y+w))*100000+(type.l-l)+50000000});
  }
  if(!candidates.length){failed.push(...item.members);continue}
  candidates.sort((a,b)=>a.score-b.score);const pos=candidates[0];
  if(pos.newShelf)shelves.push({x:0,y:pos.y,depth:pos.w});shelves[pos.s].x+=pos.l;
  placed.push({...item,...pos});weight+=item.weight;usedArea+=pos.l*pos.w;
 }
 const shelfWaste=shelves.reduce((n,s)=>n+(type.l-s.x)*s.depth,0);
 return {placed,failed,weight,usedArea,shelfWaste};
}
function renderPlans(sol,src){const total=src.reduce((n,x)=>n+x.qty,0),placed=total-sol.unplaced.length,totalKg=src.reduce((n,x)=>n+x.qty*x.kg,0);updateOverview(sol.unplaced.length?'Incomplete':'Complete',sol.trailers.length,placed,total,totalKg);const alerts=[];if(sol.unplaced.length){const reasons=explain(sol.unplaced,readTypes().filter(t=>t.on));alerts.push(`${sol.unplaced.length} item(s) remain unplaced: ${reasons.join('; ')}`)}setAlerts(alerts,!!sol.unplaced.length);const box=$('#plans');box.innerHTML='';sol.trailers.forEach((p,i)=>{const card=document.createElement('article');card.className='trailerCard card';const pct=100*p.usedArea/(p.type.l*p.type.w);card.innerHTML=`<div class="trailerTitle"><h2>Trailer ${i+1}: ${p.type.name}</h2><div class="badges"><span class="badge">${p.placed.reduce((n,x)=>n+x.members.length,0)} item(s)</span><span class="badge">Floor ${pct.toFixed(1)}%</span><span class="badge">${fmt(p.weight)} / ${fmt(p.type.payload)} kg</span></div></div><div class="canvasWrap"><div class="konva" id="stage-${i}"></div></div><div class="trailerFoot"><span>${fmt(p.type.l)} × ${fmt(p.type.w)} mm deck</span><span>${p.type.h?fmt(p.type.h)+' mm usable height':'Open height'}</span><span>Double-click freight to rotate; drag to fine-tune.</span></div>`;box.appendChild(card);drawStage(p,i);});if(!sol.trailers.length)box.innerHTML='<div class="empty card"><h2>No selected trailer can accept the freight</h2><p>Review equipment dimensions, freight dimensions and maximum equipment availability.</p></div>';}
function drawStage(plan,i){const ppm=0.07,W=Math.max(720,plan.type.l*ppm),H=Math.max(185,plan.type.w*ppm),stage=new Konva.Stage({container:`stage-${i}`,width:W,height:H}),bg=new Konva.Layer(),fg=new Konva.Layer();stage.add(bg);stage.add(fg);bg.add(new Konva.Rect({x:0,y:0,width:W,height:H,fill:'#fff',stroke:'#12344f',strokeWidth:4}));for(let m=1000;m<plan.type.l;m+=1000){const x=m*ppm;bg.add(new Konva.Line({points:[x,0,x,H],stroke:'#d7e1e8'}));bg.add(new Konva.Text({x:x+2,y:3,text:`${m/1000}m`,fontSize:9,fill:'#667d90'}));}plan.placed.forEach(p=>{const g=new Konva.Group({x:p.x*ppm,y:p.y*ppm,draggable:true}),r=new Konva.Rect({width:p.l*ppm,height:p.w*ppm,fill:p.colour,opacity:.84,stroke:'#173a54',strokeWidth:1.3,cornerRadius:3}),txt=new Konva.Text({x:4,y:4,width:Math.max(20,p.l*ppm-8),height:Math.max(18,p.w*ppm-8),text:`${p.ref}${p.members.length>1?' STACK ×'+p.members.length:''}\n${p.l} × ${p.w}`,fontSize:Math.max(9,Math.min(13,p.w*ppm/3)),fontStyle:'bold',fill:'#fff',ellipsis:true});g.add(r,txt);g.on('dragmove',()=>{g.x(Math.max(0,Math.min((plan.type.l-p.l)*ppm,g.x())));g.y(Math.max(0,Math.min((plan.type.w-p.w)*ppm,g.y())))});g.on('dragend',()=>{p.x=g.x()/ppm;p.y=g.y()/ppm;checkOverlap(plan,i)});g.on('dblclick dbltap',()=>{if(!$('#rotation').checked||p.rotatable===false)return;if(p.w<=plan.type.l&&p.l<=plan.type.w){[p.l,p.w]=[p.w,p.l];drawAll()}});fg.add(g)});bg.draw();fg.draw();const wrap=stage.container().parentElement,scale=Math.min(1,(wrap.clientWidth-36)/W);stage.container().style.transform=`scale(${scale})`;stage.container().style.transformOrigin='top left';stage.container().style.marginRight=`${W*(scale-1)}px`;stage.container().style.marginBottom=`${H*(scale-1)}px`;plan.stage=stage;}
function drawAll(){const sol={trailers:currentPlans,unplaced:[],util:0};renderPlans(sol,readItems())}
function checkOverlap(plan,i){const overlap=[];for(let a=0;a<plan.placed.length;a++)for(let b=a+1;b<plan.placed.length;b++){const x=plan.placed[a],y=plan.placed[b];if(x.x<y.x+y.l&&x.x+x.l>y.x&&x.y<y.y+y.w&&x.y+x.w>y.y)overlap.push(`${x.ref}/${y.ref}`)}if(overlap.length)setAlerts([`Trailer ${i+1} has overlap after manual movement: ${overlap.join(', ')}`],true);}
function explain(items,types){const counts=new Map();items.forEach(x=>{let reason='No valid placement found within available trailer limits';if(types.every(t=>x.l>t.l&&x.w>t.l))reason=`${x.ref} exceeds every selected trailer length`;else if(types.every(t=>x.w>t.w&&x.l>t.w))reason=`${x.ref} exceeds every selected trailer width`;else if(types.every(t=>t.h&&x.h>t.h))reason=`${x.ref} exceeds every selected trailer height`;else if(types.every(t=>x.kg>t.payload))reason=`${x.ref} exceeds every selected trailer payload`;counts.set(reason,(counts.get(reason)||0)+1)});return [...counts].map(([r,n])=>`${r} (${n})`);}
function updateOverview(status,tr,placed,total,kg){const vals=[status,String(tr),`${placed} / ${total}`,`${fmt(kg)} kg`];[...$('#headline').children].forEach((d,i)=>d.querySelector('strong').textContent=vals[i]);}
function setAlerts(msgs,error=false){$('#alerts').innerHTML=msgs.map(m=>`<div class="alert ${error?'error':''}">${safe(m)}</div>`).join('');}
function clearPlan(){currentPlans.forEach(p=>p.stage?.destroy());currentPlans=[];$('#plans').innerHTML='<div class="empty card"><h2>No plan generated</h2><p>Select available equipment, enter freight and choose <b>Generate Best Load Plan</b>.</p></div>';setAlerts([]);updateOverview('Ready',0,0,readItems().reduce((n,x)=>n+x.qty,0),readItems().reduce((n,x)=>n+x.qty*x.kg,0));}
function reset(){$('#rows').innerHTML='';rowNo=1;renderTypes();addRow({ref:'B1',qty:1,l:1200,w:1000,h:1000,kg:0,rotatable:true,stack:false,max:1});clearPlan();}
function sample(){$('#rows').innerHTML='';[{ref:'MACHINE',qty:2,l:3200,w:1800,h:2100,kg:2800,rotatable:true,stack:false,max:1},{ref:'CRATE-A',qty:8,l:1200,w:1000,h:950,kg:420,stack:true,max:2},{ref:'PALLET',qty:12,l:1200,w:1165,h:1100,kg:650,rotatable:true,stack:false,max:1},{ref:'CRATE-B',qty:4,l:2390,w:1190,h:1344,kg:850,rotatable:true,stack:false,max:1}].forEach(addRow);generateBest();}
function exportCsv(){const rows=[['ref','qty','length_mm','width_mm','height_mm','weight_kg','rotatable','stackable','max_stack'],...readItems().map(x=>[x.ref,x.qty,x.l,x.w,x.h,x.kg,x.rotatable?'yes':'no',x.stack?'yes':'no',x.max])];download('load-planner-freight.csv',rows.map(r=>r.map(csv).join(',')).join('\n'));}
function csv(v){const s=String(v);return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}function download(n,s){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'text/csv'}));a.download=n;a.click();}
function importCsv(e){const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const lines=String(rd.result).trim().split(/\r?\n/);$('#rows').innerHTML='';lines.slice(1).forEach(line=>{const c=parseLine(line);if(c.length>=8){const modern=c.length>=9;addRow({ref:c[0],qty:+c[1]||1,l:+c[2],w:+c[3],h:+c[4],kg:+c[5],rotatable:modern?/^(yes|true|1)$/i.test(c[6]):true,stack:/^(yes|true|1)$/i.test(c[modern?7:6]),max:+c[modern?8:7]||1})}});clearPlan()};rd.readAsText(f)}
function parseLine(line){let q=false,s='',a=[];for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&q&&line[i+1]==='"'){s+='"';i++}else if(c==='"')q=!q;else if(c===','&&!q){a.push(s);s=''}else s+=c}a.push(s);return a}
function fmt(n){return Math.round(n||0).toLocaleString('en-AU')}
window.addEventListener('load',()=>{if(typeof Konva==='undefined'){document.body.innerHTML='<p style="padding:30px">Konva could not load. Check the CDN connection.</p>';return}start()});
