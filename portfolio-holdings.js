(() => {
  const qs = (s) => document.querySelector(s);
  let selectedPortfolioId = null;

  function status(message, error = false) {
    const el = qs('#portfolioDataStatus');
    if (el) { el.textContent = message; el.classList.toggle('error', error); }
  }

  function renderHoldings(items) {
    const tbody = qs('#holdings tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="4"><div class="empty">No holdings yet. Add your first holding.</div></td></tr>';
      return;
    }
    items.forEach((item) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(item.symbol)}<br><small>${escapeHtml(item.name)}</small></td><td>${escapeHtml(item.currency)} ${Number(item.quantity * item.average_cost).toLocaleString()}</td><td>—</td><td><span class="pill">Connected</span></td>`;
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  async function loadHoldings() {
    if (!selectedPortfolioId) return;
    try {
      const items = await listHoldings(selectedPortfolioId);
      renderHoldings(items);
    } catch (e) { status(e?.message || 'Unable to load holdings.', true); }
  }

  function portfolioRows() {
    return [...document.querySelectorAll('.portfolio-row')];
  }

  function selectPortfolio(id) {
    selectedPortfolioId = id;
    portfolioRows().forEach((row) => row.classList.toggle('selected', row.dataset.portfolioId === id));
    loadHoldings();
  }

  function addForm() {
    if (qs('#addHoldingForm')) return;
    const manager = qs('#portfolioManager');
    const form = document.createElement('form');
    form.id = 'addHoldingForm';
    form.className = 'inline-form';
    form.innerHTML = `<label>Symbol<input id="holdingSymbol" maxlength="20" required placeholder="VOO"></label><label>Name<input id="holdingName" maxlength="100" required placeholder="Vanguard S&P 500 ETF"></label><label>Asset class<select id="holdingAssetClass"><option>Equity</option><option>Debt</option><option>ETF</option><option>Mutual Fund</option><option>Other</option></select></label><label>Quantity<input id="holdingQuantity" type="number" min="0.000001" step="any" required></label><label>Average cost<input id="holdingCost" type="number" min="0" step="any" required></label><label>Currency<select id="holdingCurrency"><option>INR</option><option>USD</option><option>EUR</option><option>GBP</option><option>AED</option></select></label><div class="form-actions"><button class="primary" type="submit">Add holding</button></div>`;
    manager?.appendChild(form);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!selectedPortfolioId) { status('Select a portfolio first.', true); return; }
      try {
        await createHolding(selectedPortfolioId, {
          symbol: qs('#holdingSymbol').value.trim().toUpperCase(), name: qs('#holdingName').value.trim(),
          asset_class: qs('#holdingAssetClass').value, quantity: Number(qs('#holdingQuantity').value),
          average_cost: Number(qs('#holdingCost').value), currency: qs('#holdingCurrency').value
        });
        form.reset(); status('Holding created successfully in Supabase.'); await loadHoldings();
      } catch (e) { status(e?.message || 'Unable to create holding.', true); }
    });
  }

  function observePortfolioList() {
    const list = qs('#portfolioList');
    if (!list) return;
    const observer = new MutationObserver(() => {
      portfolioRows().forEach((row) => row.onclick = () => selectPortfolio(row.dataset.portfolioId));
      if (portfolioRows().length && !selectedPortfolioId) selectPortfolio(portfolioRows()[0].dataset.portfolioId);
      addForm();
    });
    observer.observe(list, { childList: true, subtree: true });
    portfolioRows().forEach((row) => row.onclick = () => selectPortfolio(row.dataset.portfolioId));
    addForm();
  }

  window.addEventListener('load', observePortfolioList);
})();
