/**
 * API Client for SFi-admin-service REST Endpoints (http://localhost:5000/api)
 */

const BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  getToken() {
    return localStorage.getItem('sfi_admin_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('sfi_admin_token', token);
    } else {
      localStorage.removeItem('sfi_admin_token');
    }
  },

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        // Token expired or invalid
        this.setToken(null);
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let msg = data.message || `HTTP ${response.status}: ${response.statusText}`;
        if (data.error && data.message && !data.message.includes(data.error)) {
          msg = `${data.message} (${data.error})`;
        }
        const err = new Error(msg);
        err.data = data;
        err.status = response.status;
        throw err;
      }

      return data;
    } catch (error) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
      throw error;
    }
  },

  // Auth Endpoints
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  getProfile() {
    return this.request('/auth/me');
  },

  // Article Staging Endpoints
  getArticles({ page = 1, limit = 20, status = '', search = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    return this.request(`/articles?${params.toString()}`);
  },

  getArticleById(id) {
    return this.request(`/articles/${id}`);
  },

  updateArticle(id, payload) {
    return this.request(`/articles/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  batchUpdateArticleStatus(ids, status) {
    return this.request('/articles/batch-status', {
      method: 'PATCH',
      body: { ids, status },
    });
  },

  approveAllArticleEntities(id) {
    return this.request(`/articles/${id}/approve-all`, {
      method: 'POST',
    });
  },

  createLocation(articleId, payload) {
    return this.request(`/articles/${articleId}/locations`, {
      method: 'POST',
      body: payload,
    });
  },

  updateLocation(locationId, payload) {
    return this.request(`/articles/locations/${locationId}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  deleteLocation(locationId) {
    return this.request(`/articles/locations/${locationId}`, {
      method: 'DELETE',
    });
  },

  createImpact(articleId, payload) {
    return this.request(`/articles/${articleId}/impacts`, {
      method: 'POST',
      body: payload,
    });
  },

  updateImpact(impactId, payload) {
    return this.request(`/articles/impacts/${impactId}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  deleteImpact(impactId) {
    return this.request(`/articles/impacts/${impactId}`, {
      method: 'DELETE',
    });
  },

  createTime(articleId, payload) {
    return this.request(`/articles/${articleId}/times`, {
      method: 'POST',
      body: payload,
    });
  },

  updateTime(timeId, payload) {
    return this.request(`/articles/times/${timeId}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  deleteTime(timeId) {
    return this.request(`/articles/times/${timeId}`, {
      method: 'DELETE',
    });
  },

  // Pipeline & Knowledge Graph Publishing Endpoints
  publishArticleToKG(articleId) {
    return this.request(`/pipeline/publish/${articleId}`, {
      method: 'POST',
    });
  },

  publishBatchValidated(payload = {}) {
    return this.request('/pipeline/publish-batch', {
      method: 'POST',
      body: payload,
    });
  },

  getPipelineHealth() {
    return this.request('/pipeline/health');
  },

  // Apify Web Scraper Crawler Endpoints
  getCrawlerConfig() {
    return this.request('/crawler/config');
  },

  getCrawlerStats() {
    return this.request('/crawler/stats');
  },

  triggerCrawler(payload = {}) {
    return this.request('/crawler/trigger', {
      method: 'POST',
      body: payload,
    });
  },

  getCrawlerStatus(runId) {
    return this.request(`/crawler/status/${runId}`);
  },

  syncCrawlerDataset(payload = {}) {
    return this.request('/crawler/sync', {
      method: 'POST',
      body: payload,
    });
  },

  // NLP Microservice Endpoints
  getNlpHealth() {
    return this.request('/nlp/health');
  },

  triggerTranslation(articleId) {
    return this.request(`/nlp/translate/${articleId}`, {
      method: 'POST',
    });
  },

  triggerExtraction(articleId) {
    return this.request(`/nlp/extract/${articleId}`, {
      method: 'POST',
    });
  },

  triggerFullProcessing(articleId) {
    return this.request(`/nlp/process-full/${articleId}`, {
      method: 'POST',
    });
  },

  triggerBatchNlp(payload = {}) {
    return this.request('/nlp/batch', {
      method: 'POST',
      body: payload,
    });
  },
};

