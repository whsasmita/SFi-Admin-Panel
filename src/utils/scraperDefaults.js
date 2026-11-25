/**
 * Default Scraper Configurations and Presets for Apify Actors
 * Supports Cheerio Scraper (Fast HTTP) & Web Scraper (Playwright / Dynamic Browser)
 */

export const SUGGESTED_START_URLS = [
  {
    id: 'thairath_tag',
    label: 'Thairath (Tag: น้ำท่วม)',
    portal: 'Thairath',
    url: 'https://www.thairath.co.th/tags/%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%97%E0%B9%88%E0%B8%A7%E0%B8%A1',
  },
  {
    id: 'matichon_tag',
    label: 'Matichon (Tag: น้ำท่วม)',
    portal: 'Matichon',
    url: 'https://www.matichon.co.th/tag/%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%97%E0%B9%88%E0%B8%A7%E0%B8%A1',
  },
  {
    id: 'khaosod_tag',
    label: 'Khaosod (Tag: น้ำท่วม)',
    portal: 'Khaosod',
    url: 'https://www.khaosod.co.th/tags/%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%97%E0%B9%88%E0%B8%A7%E0%B8%A1',
  },
  {
    id: 'dailynews_tag',
    label: 'Dailynews (Tag: น้ำท่วม)',
    portal: 'Dailynews',
    url: 'https://www.dailynews.co.th/tags/%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%97%E0%B9%88%E0%B8%A7%E0%B8%A1/',
  },
  {
    id: 'thaipbs_tag',
    label: 'ThaiPBS (Tag: น้ำท่วม)',
    portal: 'ThaiPBS',
    url: 'https://www.thaipbs.or.th/tag/%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%97%E0%B9%88%E0%B8%A7%E0%B8%A1',
  },
  {
    id: 'thaipbs_active',
    label: 'ThaiPBS (The Active Disaster)',
    portal: 'ThaiPBS',
    url: 'https://theactive.thaipbs.or.th/news/disaster-20240924-3-2',
  },
  {
    id: 'thainews_prd',
    label: 'ThaiNews PRD (Gov Bulletin)',
    portal: 'ThaiNews',
    url: 'https://thainews.prd.go.th/thainews/news/view/278279/?bid=1',
  },
  {
    id: 'naewna_local',
    label: 'Naewna (Local Flood Report)',
    portal: 'Naewna',
    url: 'https://www.naewna.com/local/661168',
  },
  {
    id: 'matichon_region',
    label: 'Matichon (Region News Sample)',
    portal: 'Matichon',
    url: 'https://www.matichon.co.th/region/news_4951971',
  },
];

export const ALL_PORTALS = [
  { id: 'thairath', name: 'Thairath', domain: 'thairath.co.th', pattern: 'thairath\\.co\\.th\\/news\\/' },
  { id: 'matichon', name: 'Matichon', domain: 'matichon.co.th', pattern: 'matichon\\.co\\.th\\/[\\w-]+\\/news_' },
  { id: 'khaosod', name: 'Khaosod', domain: 'khaosod.co.th', pattern: 'khaosod\\.co\\.th' },
  { id: 'dailynews', name: 'Dailynews', domain: 'dailynews.co.th', pattern: 'dailynews\\.co\\.th\\/news' },
  { id: 'naewna', name: 'Naewna', domain: 'naewna.com', pattern: 'naewna\\.com' },
  { id: 'thaipbs', name: 'ThaiPBS', domain: 'thaipbs.or.th', pattern: 'thaipbs\\.or\\.th\\/news\\/content' },
  { id: 'bangkokpost', name: 'BangkokPost', domain: 'bangkokpost.com', pattern: 'bangkokpost\\.com\\/thailand' },
];

export function generatePageFunctionCode({
  isWebScraper = false,
  cutoffStart = '2024-01-01',
  cutoffEnd = '2026-12-31',
  selectedPortals = ['thairath', 'matichon', 'khaosod', 'dailynews', 'naewna', 'thaipbs', 'bangkokpost'],
}) {
  const activePortalPatterns = ALL_PORTALS.filter((p) => selectedPortals.includes(p.id))
    .map((p) => `/${p.pattern}/.test(absHref)`)
    .join(' || \n                              ');

  if (isWebScraper) {
    return `async function pageFunction(context) {
    const { request, log, enqueueRequest, waitFor } = context;
    const $ = context.jQuery;
    const url = request.url;

    const isTagPage = url.includes('/tags/') || url.includes('/tag/') || url.includes('?s=') || url.includes('/search/') || decodeURIComponent(url).includes('น้ำท่วม');

    if (isTagPage) {
        // Tunggu halaman search load, lalu scroll ke bawah untuk mentrigger lazy-load/infinite scroll
        await waitFor(2000);
        window.scrollBy(0, document.body.scrollHeight);
        await waitFor(2000);

        let foundArticles = 0;
        let foundPagination = 0;

        $('a[href]').each((i, el) => {
            const href = $(el).attr('href') || '';
            let absHref = href;
            if (href.startsWith('/')) {
                absHref = 'https://' + (new URL(url).hostname) + href;
            } else if (!href.startsWith('http')) {
                absHref = 'https://' + href.replace(/^\\/\\//, '');
            }
            
            const isArticle = ${activePortalPatterns || 'true'};

            // Queue Link Artikel
            if (isArticle && !absHref.includes('/tags/') && !absHref.includes('/tag/')) {
                enqueueRequest({ url: absHref });
                foundArticles++;
            }

            // Queue Link Halaman Berikutnya (Pagination)
            const isPagination = absHref.includes('page') || absHref.includes('/p/') || $(el).text().toLowerCase().includes('next') || $(el).text().includes('ถัดไป');
            if (isPagination && (absHref.includes('/tags/') || absHref.includes('/tag/'))) {
                enqueueRequest({ url: absHref });
                foundPagination++;
            }
        });
        log.info(\`[TAG] Menemukan \${foundArticles} artikel & \${foundPagination} halaman paginasi di: \${url}\`);
        return null;
    }

    // ── Halaman ARTIKEL ──
    await waitFor(1000); // Tunggu sebentar agar text kerender sempurna

    const rawDate = $('meta[property="article:published_time"]').attr('content') || $('meta[name="pubdate"]').attr('content') || $('meta[name="date"]').attr('content') || null;

    if (!rawDate) {
        log.warning(\`[SKIP] Tidak ada tanggal: \${url}\`);
        return null;
    }

    const normalizedDate = rawDate.replace(/\\//g, '-').replace(' ', 'T');
    const publishedDate = new Date(normalizedDate);
    const cutoffStart = new Date('${cutoffStart}T00:00:00Z');
    const cutoffEnd   = new Date('${cutoffEnd}T23:59:59Z');

    if (publishedDate < cutoffStart || publishedDate > cutoffEnd) {
        return null;
    }

    const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || $('title').text().trim();

    let content = '';
    if (url.includes('thairath')) {
        content = $('.detail-content p, .article-body p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    } else if (url.includes('matichon')) {
        content = $('.entry-content p, .content-body p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    } else if (url.includes('khaosod')) {
        content = $('.article-body p, .article-content p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    } else if (url.includes('dailynews')) {
        content = $('.entry-content p, .content-article p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    } else if (url.includes('naewna')) {
        content = $('.news-content p, .detail p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    } else if (url.includes('thaipbs')) {
        content = $('.content-details p, article p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    } else if (url.includes('bangkokpost')) {
        content = $('.articl-content p, .article-content p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    }

    if (!content) {
        content = $('article p, [class*="content"] p, [class*="body"] p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    }

    if (!content || !title) {
        return null;
    }

    let sumber = 'Unknown';
    if (url.includes('thairath')) sumber = 'Thairath';
    else if (url.includes('matichon')) sumber = 'Matichon';
    else if (url.includes('khaosod')) sumber = 'Khaosod';
    else if (url.includes('dailynews')) sumber = 'Dailynews';
    else if (url.includes('naewna')) sumber = 'Naewna';
    else if (url.includes('thaipbs')) sumber = 'ThaiPBS';
    else if (url.includes('bangkokpost')) sumber = 'BangkokPost';

    log.info(\`[OK] [\${sumber}] \${title}\`);
    return {
        url,
        sumber,
        judul: title,
        tanggal: rawDate,
        konten: content
    };
}`;
  }

  // Cheerio Scraper Default
  return `async function pageFunction(context) {
    const { $, request, log, enqueueRequest } = context;
    const url = request.url;

    const isTagPage = url.includes('/tags/') || url.includes('/tag/') || decodeURIComponent(url).includes('น้ำท่วม');

    if (isTagPage) {
        let foundArticles = 0;
        let foundPagination = 0;

        $('a[href]').each((i, el) => {
            const href = $(el).attr('href') || '';
            const absHref = href.startsWith('http') ? href : 'https://' + href.replace(/^\\/\\//, '');
            
            // 1. Enqueue Link Artikel
            const isArticle = ${activePortalPatterns || 'true'};

            if (isArticle && !absHref.includes('/tags/') && !absHref.includes('/tag/')) {
                enqueueRequest({ url: absHref });
                foundArticles++;
            }

            // 2. Enqueue Link Paginasi (Halaman Selanjutnya)
            const isPagination = absHref.includes('page') || absHref.includes('/p/') || $(el).text().toLowerCase().includes('next') || $(el).text().includes('ถัดไป');
            if (isPagination && (absHref.includes('/tags/') || absHref.includes('/tag/'))) {
                enqueueRequest({ url: absHref });
                foundPagination++;
            }
        });

        log.info(\`[TAG] Menemukan \${foundArticles} artikel & \${foundPagination} halaman paginasi di: \${url}\`);
        return null;
    }

    const rawDate = $('meta[property="article:published_time"]').attr('content') || $('meta[name="pubdate"]').attr('content') || $('meta[name="date"]').attr('content') || null;

    if (!rawDate) {
        log.warning(\`[SKIP] Tidak ada tanggal: \${url}\`);
        return null;
    }

    const normalizedDate = rawDate.replace(/\\//g, '-').replace(' ', 'T');
    const publishedDate  = new Date(normalizedDate);
    const cutoffStart    = new Date('${cutoffStart}T00:00:00Z');
    const cutoffEnd      = new Date('${cutoffEnd}T23:59:59Z');

    if (publishedDate < cutoffStart || publishedDate > cutoffEnd) {
        return null;
    }

    const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || $('title').text().trim();

    let content = '';
    if (url.includes('thairath')) {
        content = $('.detail-content p, .article-body p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    } else if (url.includes('matichon')) {
        content = $('.entry-content p, .content-body p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    } else if (url.includes('khaosod')) {
        content = $('.article-body p, .article-content p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    } else if (url.includes('dailynews')) {
        content = $('.entry-content p, .content-article p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    } else if (url.includes('naewna')) {
        content = $('.news-content p, .detail p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    } else if (url.includes('thaipbs')) {
        content = $('.content-details p, article p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    } else if (url.includes('bangkokpost')) {
        content = $('.articl-content p, .article-content p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    }

    if (!content) {
        content = $('article p, [class*="content"] p, [class*="body"] p').map((i, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ');
    }

    if (!content || !title) {
        return null;
    }

    let sumber = 'Unknown';
    if (url.includes('thairath')) sumber = 'Thairath';
    else if (url.includes('matichon')) sumber = 'Matichon';
    else if (url.includes('khaosod')) sumber = 'Khaosod';
    else if (url.includes('dailynews')) sumber = 'Dailynews';
    else if (url.includes('naewna')) sumber = 'Naewna';
    else if (url.includes('thaipbs')) sumber = 'ThaiPBS';
    else if (url.includes('bangkokpost')) sumber = 'BangkokPost';

    log.info(\`[OK] [\${sumber}] \${title}\`);
    return { url, sumber, judul: title, tanggal: rawDate, konten: content };
}`;
}

export const DEFAULT_CHEERIO_CONFIG = {
  additionalMimeTypes: ['text/html'],
  debugLog: false,
  excludes: [{ glob: '/**/*.{png,jpg,jpeg,pdf,gif,mp4,webp}' }],
  forceResponseEncoding: false,
  globs: [
    { glob: 'https://www.thairath.co.th/news/**' },
    { glob: 'https://www.matichon.co.th/*/news_**' },
    { glob: 'https://www.khaosod.co.th/*/news_**' },
    { glob: 'https://www.khaosod.co.th/breaking-news/**' },
    { glob: 'https://www.dailynews.co.th/news/**' },
    { glob: 'https://www.naewna.com/**' },
    { glob: 'https://www.thaipbs.or.th/news/content/**' },
    { glob: 'https://www.bangkokpost.com/thailand/general/**' },
    { glob: 'https://www.thairath.co.th/tags/**' },
    { glob: 'https://www.matichon.co.th/tag/**' },
    { glob: 'https://www.khaosod.co.th/tags/**' },
    { glob: 'https://www.thaipbs.or.th/tag/**' },
  ],
  ignoreSslErrors: false,
  keepUrlFragments: false,
  maxPagesPerCrawl: 200,
  pageFunction: generatePageFunctionCode({ isWebScraper: false }),
  postNavigationHooks: '[\n    async (crawlingContext) => {\n        // no-op\n    },\n]',
  preNavigationHooks:
    '[\n    async (crawlingContext, requestAsBrowserOptions) => {\n        requestAsBrowserOptions.headers = {\n            ...requestAsBrowserOptions.headers,\n            \'Accept-Language\': \'th-TH,th;q=0.9,en;q=0.8\',\n            \'Accept\': \'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\',\n            \'User-Agent\': \'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\'\n        };\n    },\n]',
  proxyConfiguration: { useApifyProxy: true },
  respectRobotsTxtFile: false,
  startUrls: [
    { url: 'https://www.thairath.co.th/tags/%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%97%E0%B9%88%E0%B8%A7%E0%B8%A1' },
    { url: 'https://www.matichon.co.th/tag/%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%97%E0%B9%88%E0%B8%A7%E0%B8%A1' },
    { url: 'https://www.matichon.co.th/region/news_4951971' },
    { url: 'https://www.thairath.co.th/news/local/north/2642245' },
    { url: 'https://www.dailynews.co.th/news/5285950/' },
    { url: 'https://www.naewna.com/local/661168' },
    { url: 'https://thainews.prd.go.th/thainews/news/view/278279/?bid=1' },
    { url: 'https://theactive.thaipbs.or.th/news/disaster-20240924-3-2' },
  ],
};

export const DEFAULT_WEBSCRAPER_CONFIG = {
  breakpointLocation: 'NONE',
  browserLog: false,
  closeCookieModals: true,
  debugLog: false,
  downloadCss: false,
  downloadMedia: false,
  excludes: [{ glob: '/**/*.{png,jpg,jpeg,pdf,gif,mp4,webp,svg}' }],
  globs: [
    { glob: 'https://www.thairath.co.th/news/**' },
    { glob: 'https://www.thairath.co.th/tags/**' },
    { glob: 'https://www.matichon.co.th/*/news_**' },
    { glob: 'https://www.matichon.co.th/tag/**' },
    { glob: 'https://www.khaosod.co.th/*/news_**' },
    { glob: 'https://www.khaosod.co.th/breaking-news/**' },
    { glob: 'https://www.khaosod.co.th/tags/**' },
    { glob: 'https://www.dailynews.co.th/news/**' },
    { glob: 'https://www.dailynews.co.th/tags/**' },
    { glob: 'https://www.naewna.com/**' },
    { glob: 'https://www.thaipbs.or.th/news/content/**' },
    { glob: 'https://www.thaipbs.or.th/tag/**' },
    { glob: 'https://www.bangkokpost.com/thailand/general/**' },
  ],
  headless: true,
  ignoreCorsAndCsp: false,
  ignoreSslErrors: true,
  injectJQuery: true,
  keepUrlFragments: false,
  linkSelector: 'a[href]',
  maxCrawlingDepth: 10,
  maxPagesPerCrawl: 200,
  pageFunction: generatePageFunctionCode({ isWebScraper: true }),
  pageFunctionTimeoutSecs: 120,
  pageLoadTimeoutSecs: 90,
  postNavigationHooks: '[\n    async (crawlingContext) => {\n        // no-op\n    },\n]',
  preNavigationHooks:
    '[\n    async (crawlingContext, gotoOptions) => {\n        const { page } = crawlingContext;\n        await page.setExtraHTTPHeaders({\n            \'Accept-Language\': \'th-TH,th;q=0.9,en;q=0.8\',\n            \'Accept\': \'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\',\n            \'User-Agent\': \'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\'\n        });\n        await page.evaluateOnNewDocument(() => {\n            Object.defineProperty(navigator, \'webdriver\', { get: () => false });\n            window.chrome = { runtime: {} };\n        });\n        gotoOptions.waitUntil = \'networkidle2\';\n    },\n]',
  proxyConfiguration: { useApifyProxy: true },
  respectRobotsTxtFile: false,
  runMode: 'PRODUCTION',
  startUrls: [
    { url: 'https://www.thairath.co.th/tags/%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%97%E0%B9%88%E0%B8%A7%E0%B8%A1' },
    { url: 'https://www.matichon.co.th/tag/%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%97%E0%B9%88%E0%B8%A7%E0%B8%A1' },
    { url: 'https://www.khaosod.co.th/tags/%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%97%E0%B9%88%E0%B8%A7%E0%B8%A1' },
    { url: 'https://www.dailynews.co.th/tags/%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%97%E0%B9%88%E0%B8%A7%E0%B8%A1/' },
    { url: 'https://www.thaipbs.or.th/tag/%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%97%E0%B9%88%E0%B8%A7%E0%B8%A1' },
  ],
  useChrome: true,
  waitUntil: ['networkidle2'],
};
