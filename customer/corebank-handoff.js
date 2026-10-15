/* Demo-only bridge. Platform credentials remain in the server-side function. */
(function(){
const endpoint='https://usa.api.demo.wonderful.ai/api/public/functions/07a1d9a6-8c73-4692-8888-f673051c5149/166dbd8c-42a9-4324-bb75-565b62bda5ba/ys-corebank-handoff';let busy=false;
function banner(text,error){let box=document.getElementById('corebank-handoff');if(!box){box=document.createElement('div');box.id='corebank-handoff';box.setAttribute('role','status');box.style.cssText='position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:9999;background:white;border:1px solid #0f5f46;border-radius:10px;padding:14px 20px;box-shadow:0 4px 20px #0002;max-width:90vw;font:14px Arial';document.body.append(box)}box.textContent=text;box.style.borderColor=error?'#a00':'#0f5f46';return box}
async function submit(card){if(busy)return;busy=true;let application;
try{const reference=card.data.claim_ref;const key='corebank-handoff:'+reference;let saved;try{saved=JSON.parse(sessionStorage.getItem(key)||'null')}catch{}
if(saved&&saved.task_id){banner('CoreBank entry queued · '+reference);return;}
if(window.DEMO_CONFIG.mode==='mock'){application=await fetch('../fixture.json').then(r=>{if(!r.ok)throw Error('Fixture unavailable');return r.json()});application.reference=reference;}
else{application=card.data.application;if(!application)throw Error('Live application payload is missing. No back-office task was started.');}
const request_id=saved?.request_id||crypto.randomUUID();sessionStorage.setItem(key,JSON.stringify({request_id}));banner('Sending application to CoreBank…');
const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({request_id,application})});const raw=await response.json(),data=raw.result||raw.data?.result||raw.data||raw;
if(!response.ok||!data.accepted)throw Error(data.error||'Task was not accepted.');sessionStorage.setItem(key,JSON.stringify({request_id,task_id:data.task_id}));
const box=banner('CoreBank entry queued · '+reference+' ');const a=document.createElement('a');a.href='https://usa.app.demo.wonderful.ai';a.target='_blank';a.rel='noopener';a.textContent='Open Wonderful to watch';box.append(a);const detail=document.createElement('div');detail.style.cssText='font-size:11px;margin-top:5px;color:#666';detail.textContent='Task '+data.task_id;box.append(detail);
}catch(e){const box=banner('CoreBank handoff: '+e.message+' ',true);const retry=document.createElement('button');retry.textContent='Retry';retry.onclick=()=>submit(card);box.append(retry);}finally{busy=false;}}
window.CoreBankHandoff={submit};
})();
