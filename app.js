const rates={INR:1,USD:1/84,EUR:1/91,GBP:1/107,AED:1/22.9};const symbols={INR:"₹",USD:"$",EUR:"€",GBP:"£",AED:"د.إ "};
const state={currency:"INR",lang:"en"};
const qs=s=>document.querySelector(s), qsa=s=>document.querySelectorAll(s);
function money(v){return symbols[state.currency]+Math.round(v*rates[state.currency]).toLocaleString(state.lang==="hi"?"hi-IN":"en-IN")}
function refreshCurrency(){qsa(".money").forEach(x=>x.textContent=money(Number(x.dataset.inr)));if(!window.__livePortfolioMetrics) { /* live metrics module owns dashboard values when loaded */ }}
function show(view){qsa(".view").forEach(v=>v.classList.toggle("active",v.id===view));window.scrollTo({top:0,behavior:"smooth"})}
qsa("[data-view]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.view)));
qsa(".tab").forEach(b=>b.addEventListener("click",()=>{qsa(".tab").forEach(x=>x.classList.remove("active"));qsa(".tabview").forEach(x=>x.classList.remove("active"));b.classList.add("active");qs("#"+b.dataset.tab).classList.add("active")}));
qs("#currency").addEventListener("change",e=>{state.currency=e.target.value;refreshCurrency();toast("Currency updated — portfolio values recalculated")});
const hi={welcome:"आपका पूरा वेल्थ ओवरव्यू",dashboard:"पोर्टफोलियो डैशबोर्ड"};
qs("#lang").addEventListener("change",e=>{state.lang=e.target.value;qsa("[data-i18n]").forEach(x=>x.textContent=state.lang==="hi"?(hi[x.dataset.i18n]||x.textContent):({welcome:"Your complete wealth overview",dashboard:"Portfolio Dashboard"}[x.dataset.i18n]||x.textContent));refreshCurrency();toast(state.lang==="hi"?"भाषा हिन्दी की गई":"Language changed to English")});
qsa("[data-action]").forEach(b=>b.addEventListener("click",()=>toast(b.dataset.action==="addgoal"?"Goal creation flow ready":"Investment entry flow ready")));
qsa(".suggestions button").forEach(b=>b.addEventListener("click",()=>{qs("#question").value=b.textContent;qs("#ask").click()}));
qs("#ask").addEventListener("click",()=>{const q=qs("#question").value.trim();toast(q?`AI Advisor: "${q}" — personalized analysis will be connected in the next integration stage.`:"Type a question first.")});
function toast(t){const x=qs("#toast");x.textContent=t;x.style.display="block";clearTimeout(window.__t);window.__t=setTimeout(()=>x.style.display="none",2600)}
(function loadResponsiveFixes(){if(!document.querySelector('link[href="responsive-fixes.css"]')){const l=document.createElement("link");l.rel="stylesheet";l.href="responsive-fixes.css";document.head.appendChild(l)}})();
window.__livePortfolioMetrics=true;
refreshCurrency();