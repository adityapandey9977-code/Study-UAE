export function setMetaTag(type, attrName, attrValue, content) {
  const selector = type === 'name'
    ? `meta[name="${attrValue}"]`
    : `meta[property="${attrValue}"]`;

  const existing = document.querySelector(selector);
  if (existing) {
    existing.setAttribute('content', content);
    return;
  }

  const meta = document.createElement('meta');
  if (type === 'name') {
    meta.name = attrValue;
  } else {
    meta.property = attrValue;
  }
  meta.content = content;
  document.head.appendChild(meta);
}

export function setCanonicalUrl(url) {
  const existing = document.querySelector('link[rel="canonical"]');
  if (existing) {
    existing.setAttribute('href', url);
    return;
  }

  const link = document.createElement('link');
  link.rel = 'canonical';
  link.href = url;
  document.head.appendChild(link);
}

export function applyPageSeo(pageSeo = {}) {
  const title = pageSeo.title || 'Study in UAE | Find Universities & Programs';
  const description = pageSeo.description || 'Discover top universities, programs, scholarships, and guided admissions in the UAE.';
  const keywords = pageSeo.keywords;
  const canonicalUrl = pageSeo.canonicalUrl;
  const ogTitle = pageSeo.ogTitle || title;
  const ogDescription = pageSeo.ogDescription || description;
  const ogImage = pageSeo.ogImage;

  document.title = title;
  setMetaTag('name', 'name', 'description', description);
  setMetaTag('name', 'name', 'keywords', keywords || 'study in UAE, universities in UAE');
  setMetaTag('property', 'property', 'og:title', ogTitle);
  setMetaTag('property', 'property', 'og:description', ogDescription);
  if (ogImage) {
    setMetaTag('property', 'property', 'og:image', ogImage);
  }
  if (canonicalUrl) {
    setCanonicalUrl(canonicalUrl);
  }
}

export function getPageSettingsForPath(pathname, pageSettings = {}) {
  const normalizedPath = (pathname || '/').split('?')[0].split('#')[0];
  const pathMap = {
    '/': 'landingPage',
    '/about-study-in-uae': 'aboutPage',
    '/contact-us': 'contactPage',
    '/university/:name': 'universityDetailPage'
  };

  const pageKey = pathMap[normalizedPath] || 'landingPage';
  return pageSettings?.[pageKey] || pageSettings?.landingPage || {};
}
