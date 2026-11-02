const DEF={theme:'koi',deek:true,strength:1,glass:true,deekSize:112,ui:true};
const sel=document.getElementById('theme');
chrome.storage.local.get(['xot','xotCustoms'],o=>{const S={...DEF,...(o.xot||{})};
 sel.innerHTML='<option value="off">Off</option>'+XOT.scenes.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')+(o.xotCustoms||[]).map(c=>`<option value="c:${c.id}">★ ${c.name.replace(/</g,'')}</option>`).join('');
 sel.value=S.theme;deek.checked=S.deek;ui.checked=S.ui;
 const save=()=>chrome.storage.local.set({xot:S});
 sel.onchange=()=>{S.theme=sel.value;save()};deek.onchange=()=>{S.deek=deek.checked;save()};ui.onchange=()=>{S.ui=ui.checked;save()};});
document.getElementById('open').onclick=()=>chrome.tabs.create({url:'https://beta.xo.market'});
