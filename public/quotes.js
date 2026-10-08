
(()=> {
const $=id=>document.getElementById(id);
const prices={operations:999,connected:2499,intelligence:4999,enterprise:7500,jworks:399,trace:899,cmms:599,custom:0};
const num=id=>Math.max(0,Number($(id)?.value)||0);
const money=n=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:2}).format(n);
const safe=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','&quot;':'&quot;',"'":'&#39;'}[c]));
const fields=['qCompany','qContact','qEmail','qNumber','qValid','qPlan','qUsers','qPlc','qBms','qOther','qOnboard','qMonthly','qFirst','qNext','qMid','qBulk','qBFirst','qBNext','qOtherRate','qComplex','qDiscount','qNotes'];
function calc(){
const plc=Math.floor(num('qPlc')), bms=Math.floor(num('qBms')), other=Math.floor(num('qOther'));
const plc1=plc?num('qFirst'):0;
const plc2=Math.min(Math.max(plc-1,0),9)*num('qNext');
const plc3=Math.min(Math.max(plc-10,0),40)*num('qMid');
const plc4=Math.max(plc-50,0)*num('qBulk');
const bmsCost=(bms?num('qBFirst'):0)+Math.max(bms-1,0)*num('qBNext');
const otherCost=other*num('qOtherRate');
const integration=(plc1+plc2+plc3+plc4+bmsCost+otherCost)*Number($('qComplex').value);
const implementation=Math.max(0,num('qOnboard')+integration-num('qDiscount'));
const monthly=num('qMonthly'), annual=monthly*12;
const rows=[['Software subscription — '+$('qPlan').selectedOptions[0].text.split(' —')[0],money(monthly)+'/month'],['Onboarding and training',money(num('qOnboard'))],['PLC integration ('+plc+' controllers)',money((plc1+plc2+plc3+plc4)*Number($('qComplex').value))],['BMS integration ('+bms+' systems)',money(bmsCost*Number($('qComplex').value))],['Other system integration ('+other+')',money(otherCost*Number($('qComplex').value))],['Implementation discount','−'+money(num('qDiscount'))]];
$('qPreview').innerHTML=`<div class="quote-paper"><div class="quote-brand"><div><strong>JELIX</strong><small> SYSTEMS · COMMERCIAL PROPOSAL</small></div><span>QUOTATION</span></div><div class="quote-meta"><div><small>PREPARED FOR</small><h3>${safe($('qCompany').value||'Customer organization')}</h3><p>${safe($('qContact').value)}<br>${safe($('qEmail').value)}</p></div><div><small>QUOTE NO.</small><p>${safe($('qNumber').value)}</p><small>VALID UNTIL</small><p>${safe($('qValid').value)}</p></div></div><h3>Proposed solution</h3><p>${safe($('qPlan').selectedOptions[0].text.split(' —')[0])} · ${safe($('qUsers').value||'User allocation subject to agreement')}</p><table class="quote-table"><thead><tr><th>DESCRIPTION</th><th>AMOUNT (CAD)</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table><div class="quote-totals"><div><span>One-time implementation</span><b>${money(implementation)}</b></div><div><span>Monthly subscription</span><b>${money(monthly)}</b></div><div><span>Year-one estimated total</span><strong>${money(implementation+annual)}</strong></div></div><h4>Scope and assumptions</h4><p class="quote-notes">${safe($('qNotes').value)}</p><p class="quote-fine">Subscription calculated for 12 months. Taxes, hardware, travel and third-party licenses excluded. Pricing is indicative until technical discovery and a signed statement of work. All prices CAD.</p><div class="quote-footer">JELIX SYSTEMS · OPERATIONAL SOFTWARE FOR THE PHYSICAL WORLD</div></div>`;
}
$('qPlan').addEventListener('change',()=>{$('qMonthly').value=prices[$('qPlan').value];calc()});
$('qCalculate').addEventListener('click',calc);
$('qSave').addEventListener('click',()=>{localStorage.setItem('jelix.quote.draft',JSON.stringify(Object.fromEntries(fields.map(id=>[id,$(id).value]))));alert('Quote draft saved in this browser. Export a PDF for durable records.')});
$('qPrint').addEventListener('click',()=>{calc();document.body.classList.add('printing-quote');window.print();document.body.classList.remove('printing-quote')});
window.addEventListener('afterprint',()=>document.body.classList.remove('printing-quote'));
try{const draft=JSON.parse(localStorage.getItem('jelix.quote.draft')||'null');if(draft)for(const id of fields)if(draft[id]!==undefined)$(id).value=draft[id]}catch{}
if(!$('qNumber').value)$('qNumber').value='JX-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-001';
if(!$('qValid').value){const d=new Date();d.setDate(d.getDate()+30);$('qValid').value=d.toISOString().slice(0,10)}
calc();
})();
