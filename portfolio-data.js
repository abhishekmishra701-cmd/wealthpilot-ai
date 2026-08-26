(() => {
  const qs = (s) => document.querySelector(s);

  function setStatus(message, isError = false) {
    const el = qs('#portfolioDataStatus');
    if (!el) return;
    el.textContent = message;
    el.classList.toggle('error', isError);
  }

  function renderPortfolios(items) {
    const list = qs('#portfolioList');
    if (!list) return;
    list.innerHTML = '';
    if (!items.length) {
      list.innerHTML = '<div class="empty" id="portfolioEmpty">No portfolios yet. Create your first portfolio to connect WealthPilot to real data.</div>';
      return;
    }
    items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'portfolio-row';
      row.dataset.portfolioId = item.id;
      row.innerHTML = `<div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.base_currency || 'INR')}</small></div><span>Connected</span>`;
      list.appendChild(row);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  async function loadPortfolios() {
    try {
      const client = getSupabase();
      if (!client) return;
      const { data: { session } } = await client.auth.getSession();
      if (!session) return;
      setStatus('Loading your portfolios…');
      const items = await listPortfolios();
      renderPortfolios(items);
      setStatus(`${items.length} portfolio${items.length === 1 ? '' : 's'} loaded from Supabase.`);
    } catch (error) {
      setStatus(error?.message || 'Unable to load portfolios.', true);
    }
  }

  async function createPortfolioFromForm(event) {
    event.preventDefault();
    const name = qs('#portfolioName')?.value.trim();
    const currency = qs('#portfolioCurrency')?.value || 'INR';
    if (!name) {
      setStatus('Enter a portfolio name.', true);
      return;
    }

    const button = qs('#createPortfolioBtn');
    if (button) button.disabled = true;
    try {
      await createPortfolio(name, currency);
      qs('#createPortfolioForm')?.reset();
      setStatus('Portfolio created successfully in Supabase.');
      await loadPortfolios();
    } catch (error) {
      setStatus(error?.message || 'Unable to create portfolio.', true);
    } finally {
      if (button) button.disabled = false;
    }
  }

  function init() {
    qs('#createPortfolioForm')?.addEventListener('submit', createPortfolioFromForm);
    qs('#portfolioRefresh')?.addEventListener('click', loadPortfolios);
    const client = getSupabase();
    if (client) client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') loadPortfolios();
      if (event === 'SIGNED_OUT') renderPortfolios([]);
    });
    loadPortfolios();
  }

  window.addEventListener('load', init);
})();
