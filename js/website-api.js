/**
 * Tapir LP — Carrega o JSON completo do hotel via API WebSite.
 *
 * URL é a mesma para todos os hotéis (DEFAULTS).
 * Cada hotel traz só a apiKey no bootstrap (configs/{slug}.json → websiteApi),
 * injetada no build em window.HOTEL_CONFIG.
 */
const WebsiteApi = {
  /** Endpoint compartilhado — altere aqui se a URL da API mudar para todos. */
  DEFAULTS: {
    url: 'https://tapirapi-gcacg8dve2hmd9a2.southcentralus-01.azurewebsites.net/api/v1/WebSite',
    headerName: 'x-api-key',
    timeoutMs: 15000,
  },

  resolve(bootstrap) {
    const api = bootstrap?.websiteApi;
    if (!api) return null;
    return {
      enabled: Boolean(api.enabled),
      url: api.url || this.DEFAULTS.url,
      apiKey: String(api.apiKey || '').trim(),
      headerName: api.headerName || this.DEFAULTS.headerName,
      timeoutMs: Number(api.timeoutMs) || this.DEFAULTS.timeoutMs,
    };
  },

  isEnabled(bootstrap) {
    const api = this.resolve(bootstrap);
    return Boolean(api?.enabled && api?.apiKey);
  },

  /**
   * @param {object} bootstrap Config local (precisa de websiteApi.apiKey)
   * @returns {Promise<object>} Payload no formato do hotel.schema.json
   */
  async fetchConfig(bootstrap) {
    const api = this.resolve(bootstrap);
    if (!api?.enabled || !api.apiKey) {
      throw new Error('websiteApi não configurada (enabled + apiKey)');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), api.timeoutMs);

    try {
      const res = await fetch(api.url, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          [api.headerName]: api.apiKey,
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`API respondeu ${res.status}`);
      }

      const data = await res.json();
      if (!data || typeof data !== 'object' || !data.hotel) {
        throw new Error('Payload inválido da API');
      }

      return data;
    } finally {
      clearTimeout(timer);
    }
  },
};

window.WebsiteApi = WebsiteApi;
