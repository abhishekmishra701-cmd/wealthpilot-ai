(() => {
  const cache = new Map();
  const TTL = 5 * 60 * 1000;

  async function fetchPrice(symbol) {
    const key = String(symbol || '').trim().toUpperCase();
    if (!key) return null;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < TTL) return cached.price;
    // Provider is intentionally injectable. No paid API or secret is embedded in the browser.
    const provider = window.WEALTHPILOT_MARKET_PROVIDER;
    if (typeof provider !== 'function') return null;
    try {
      const price = await provider(key);
      const value = Number(price);
      if (!Number.isFinite(value) || value < 0) return null;
      cache.set(key, { price: value, at: Date.now() });
      return value;
    } catch (e) { console.warn(`Market price unavailable for ${key}:`, e?.message || e); return null; }
  }

  window.getMarketPrice = fetchPrice;
})();
