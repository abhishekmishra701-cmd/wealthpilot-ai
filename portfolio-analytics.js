(() => {
  const qs = (s) => document.querySelector(s);
  const symbols = { INR:'₹', USD:'$', EUR:'€', GBP:'£', AED:'د.إ ' };
  const rates = { INR:1, USD:1/84, EUR:1/91, GBP:1/107, AED:1/22.9 };
  let holdings = [];
  let transactions = [];

  const inr = (v, currency) => Number(v || 0) * (rates[currency] || 1);
  const money = (v) => `${symbols[qs('#currency')?.value || 'INR'] || ''}${Math.round(Number(v || 0) * (rates[qs('#currency')?.value || 'INR'] || 1)).toLocaleString('en-IN')}`;

  function renderAllocation() {
    const totals = {};
    holdings.forEach(h => { const value = inr(Number(h.quantity) * Number(h.average_cost), h.currency); totals[h.asset_class || 'Other'] = (totals[h.asset_class || 'Other'] || 0) + value; });
    const total = Object.values(totals).reduce((a,b) => a+b, 0);
    const box = qs('#allocation .allocation'); if (!box) return;
    if (!total) { box.innerHTML = '<div class="donut"></div><div><b>No holdings yet</b><small>Add holdings to calculate allocation.</small></div>'; return; }
    const rows = Object.entries(totals).sort((a,b)=>b[1]-a[1]).map(([name,value])=>`<b>${name} ${Math.round(value/total*100)}% · ${money(value)}</b>`).join('');
    box.innerHTML = `<div class="donut"></div><div>${rows}</div>`;
  }

  function renderPerformance() {
    const buys = transactions.filter(t => t.transaction_type === 'BUY').reduce((s,t)=>s+inr(Number(t.quantity)*Number(t.price),t.currency),0);
    const sells = transactions.filter(t => t.transaction_type === 'SELL').reduce((s,t)=>s+inr(Number(t.quantity)*Number(t.price),t.currency),0);
    const dividends = transactions.filter(t => t.transaction_type === 'DIVIDEND').reduce((s,t)=>s+inr(Number(t.quantity)*Number(t.price),t.currency),0);
    const net = buys - sells;
    const metric = qs('#performance .bigmetric');
    const text = qs('#performance .muted');
    if (metric) metric.textContent = money(net + dividends);
    if (text) text.textContent = `Recorded net investment ${money(net)} · dividends ${money(dividends)}. Current-market return requires live pricing.`;
  }

  async function load() {
    try {
      const ps = await listPortfolios(); holdings=[]; transactions=[];
      for (const p of ps) { const [h,t] = await Promise.all([listHoldings(p.id), listTransactions(p.id)]); holdings.push(...h); transactions.push(...t); }
      renderAllocation(); renderPerformance();
    } catch (e) { console.warn('Portfolio analytics unavailable:', e?.message || e); }
  }
  qs('#currency')?.addEventListener('change',()=>{renderAllocation();renderPerformance();});
  window.addEventListener('load',load);
  window.addEventListener('wealthpilot:data-changed',load);
})();
