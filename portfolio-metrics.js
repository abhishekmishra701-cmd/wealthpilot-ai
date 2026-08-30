(() => {
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => document.querySelectorAll(s);
  const rates = { INR: 1, USD: 1/84, EUR: 1/91, GBP: 1/107, AED: 1/22.9 };
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ ' };
  let portfolios = [];
  let holdings = [];
  let transactions = [];

  const currency = () => qs('#currency')?.value || 'INR';
  const money = (value) => `${symbols[currency()]}${Math.round(value * (rates[currency()] || 1)).toLocaleString('en-IN')}`;

  function renderDashboard() {
    const invested = transactions.filter(t => t.transaction_type === 'BUY').reduce((sum, t) => sum + Number(t.quantity) * Number(t.price), 0)
      - transactions.filter(t => t.transaction_type === 'SELL').reduce((sum, t) => sum + Number(t.quantity) * Number(t.price), 0);
    const holdingCost = holdings.reduce((sum, h) => sum + Number(h.quantity) * Number(h.average_cost), 0);
    const investedValue = invested > 0 ? invested : holdingCost;
    const currentValue = holdingCost;
    const gain = currentValue - investedValue;
    qs('#netWorth')?.replaceChildren(document.createTextNode(money(currentValue)));
    qs('#invested')?.replaceChildren(document.createTextNode(money(investedValue)));
    qs('#gain')?.replaceChildren(document.createTextNode(money(gain)));
    const overall = qs('#overall');
    if (overall) overall.textContent = investedValue ? `${gain >= 0 ? '↑' : '↓'} ${Math.abs((gain / investedValue) * 100).toFixed(1)}% based on recorded cost` : 'No investment data yet';
  }

  async function loadMetrics() {
    try {
      const client = getSupabase();
      if (!client) return;
      const { data: { session } } = await client.auth.getSession();
      if (!session) return;
      portfolios = await listPortfolios();
      holdings = [];
      transactions = [];
      for (const p of portfolios) {
        const [hs, ts] = await Promise.all([listHoldings(p.id), listTransactions(p.id)]);
        holdings.push(...hs);
        transactions.push(...ts);
      }
      renderDashboard();
    } catch (error) {
      console.warn('Portfolio metrics unavailable:', error?.message || error);
    }
  }

  qs('#currency')?.addEventListener('change', renderDashboard);
  window.addEventListener('load', loadMetrics);
  window.addEventListener('wealthpilot:data-changed', loadMetrics);
})();
