// src/components/ShareOGMeta.jsx
// Injects dynamic Open Graph meta tags into <head> for client-side sharing.
// Note: WhatsApp reads og:image from the /api/share server response,
// but this helps for direct client-side sharing (Twitter, etc.)

import { useEffect } from 'react';

const DEFAULT_POSTER = 'https://irafilms.store/og-default.jpg';

function normalizeImage(raw) {
  if (!raw || typeof raw !== 'string') return DEFAULT_POSTER;
  const t = raw.trim();
  if (!t) return DEFAULT_POSTER;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith('//')) return `https:${t}`;
  if (t.startsWith('/')) return `https://irafilms.store${t}`;
  return t;
}

export default function ShareOGMeta({ title, description, image, url }) {
  useEffect(() => {
    const safeImage = normalizeImage(image);

    const setMeta = (attr, key, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', safeImage);
    setMeta('property', 'og:image:secure_url', safeImage);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', 'video.movie');
    setMeta('property', 'og:site_name', 'Irafilms');

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', safeImage);

    let link = document.querySelector('link[rel="image_src"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'image_src';
      document.head.appendChild(link);
    }
    link.href = safeImage;
  }, [title, description, image, url]);
  
  return null;
}