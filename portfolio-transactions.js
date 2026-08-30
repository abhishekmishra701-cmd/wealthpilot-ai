(() => {
  const qs = (s) => document.querySelector(s);
  let selectedPortfolioId = null;

  const status = (message, error = false) => {
    const el = qs('#portfolioDataStatus');
    if (el) { el.textContent = message; el.classList.toggle('error', error); }
  };

  const escapeHtml = (value) => String(value).replace(/[&<>\'"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));

  function render(items) {
    const list = qs('#transactionList');
    if (!list) return;
    if (!items.length) {
      list.innerHTML = '<div class="empty">No transactions yet.</div>';
      return;
    }
    list.innerHTML = `<div class="tablewrap"><table><thead><tr><th>Symbol</th><th>Type</th><th>Quantity</th><th>Price</th><th>Currency</th><th>Date</th></tr></thead><tbody>${items.map((item) => `<tr><td>${escapeHtml(item.symbol)}</td><td>${escapeHtml(item.transaction_type)}</td><td>${escapeHtml(item.quantity)}</td><td>${escapeHtml(item.price)}</td><td>${escapeHtml(item.currency)}</td><td>${escapeHtml(item.transaction_date)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  async function load() {
    if (!selectedPortfolioId) return;
    try { render(await listTransactions(selectedPortfolioId)); }
    catch (e) { status(e?.message || 'Unable to load transactions.', true); }
  }

  function selectPortfolio(id) {
    selectedPortfolioId = id;
    document.querySelectorAll('.portfolio-row').forEach((row) => row.classList.toggle('selected', row.dataset.portfolioId === id));
    load();
  }

  function bindPortfolioRows() {
    document.querySelectorAll('.portfolio-row').forEach((row) => row.onclick = () => selectPortfolio(row.dataset.portfolioId));
    if (!selectedPortfolioId) {
      const first = document.querySelector('.portfolio-row');
      if (first) selectPortfolio(first.dataset.portfolioId);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (!selectedPortfolioId) { status('Select a portfolio first.', true); return; }
    const button = qs('#addTransactionBtn');
    if (button) button.disabled = true;
    try {
      await createTransaction(selectedPortfolioId, {
        symbol: qs('#transactionSymbol').value.trim().toUpperCase(),
        transaction_type: qs('#transactionType').value,
        quantity: Number(qs('#transactionQuantity').value),
        price: Number(qs('#transactionPrice').value),
        currency: qs('#transactionCurrency').value,
        transaction_date: qs('#transactionDate').value
      });
      qs('#addTransactionForm')?.reset();
      status('Transaction created successfully in Supabase.');
      await load();
    } catch (e) { status(e?.message || 'Unable to create transaction.', true); }
    finally { if (button) button.disabled = false; }
  }

  function init() {
    qs('#addTransactionForm')?.addEventListener('submit', submit);
    const list = qs('#portfolioList');
    if (list) new MutationObserver(bindPortfolioRows).observe(list, { childList: true, subtree: true });
    bindPortfolioRows();
    const client = getSupabase();
    if (client) client.auth.onAuthStateChange((event) => { if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') bindPortfolioRows(); if (event === 'SIGNED_OUT') { selectedPortfolioId = null; render([]); } });
  }

  window.addEventListener('load', init);
})();
