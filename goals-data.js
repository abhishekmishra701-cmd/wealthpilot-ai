(() => {
  const qs = (s) => document.querySelector(s);
  const container = () => qs('#goals');
  const status = (message, error = false) => {
    const el = qs('#goalDataStatus');
    if (el) { el.textContent = message; el.classList.toggle('error', error); }
  };
  const escapeHtml = (v) => String(v).replace(/[&<>\'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const money = (v, currency = 'INR') => `${{INR:'₹',USD:'$',EUR:'€',GBP:'£',AED:'د.إ ' }[currency] || ''}${Number(v || 0).toLocaleString('en-IN')}`;

  async function loadGoals() {
    try {
      const items = await listGoals();
      const grid = qs('#goalGrid'); if (!grid) return;
      if (!items.length) { grid.innerHTML = '<div class="empty">No goals yet. Create your first financial goal.</div>'; return; }
      grid.innerHTML = items.map(g => `<article class="panel goal"><h2>${escapeHtml(g.name)}</h2><strong>${money(g.target_amount, g.currency || 'INR')}</strong><p>Target: ${escapeHtml(g.target_date || 'Not set')}</p><div class="progress"><i style="width:${Math.min(100, Math.max(0, Number(g.progress_percent || 0)))}%"></i></div><small>${Number(g.progress_percent || 0)}% complete</small></article>`).join('');
    } catch (e) { status(e?.message || 'Unable to load goals.', true); }
  }

  function bind() {
    const button = qs('#goalOpen'); const form = qs('#goalForm');
    button?.addEventListener('click', () => { if (form) form.hidden = false; qs('#goalName')?.focus(); });
    qs('#goalCancel')?.addEventListener('click', () => { if (form) form.hidden = true; });
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const save = qs('#goalSave'); if (save) save.disabled = true;
      try {
        await createGoal({ name: qs('#goalName').value.trim(), target_amount: Number(qs('#goalAmount').value), currency: qs('#goalCurrency').value, target_date: qs('#goalDate').value || null, progress_percent: 0 });
        form.reset(); form.hidden = true; status('Goal created successfully in Supabase.'); await loadGoals();
      } catch (e) { status(e?.message || 'Unable to create goal.', true); }
      finally { if (save) save.disabled = false; }
    });
    qs('#goalRefresh')?.addEventListener('click', loadGoals);
    window.addEventListener('wealthpilot:data-changed', loadGoals);
  }

  window.addEventListener('load', () => { if (container()) { bind(); loadGoals(); } });
})();
