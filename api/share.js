// api/share.js — Vercel Serverless Function for WhatsApp previews
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const SITE_URL = 'https://cinevamovies.vercel.app';
const DEFAULT_POSTER = `${SITE_URL}/og-default.jpg`;
const BRAND_NAME = 'Irafilms';

const escapeHtml = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

function normalizePosterUrl(raw) {
  if (!raw || typeof raw !== 'string') return DEFAULT_POSTER;
  const t = raw.trim();
  if (!t) return DEFAULT_POSTER;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith('//')) return `https:${t}`;
  if (t.startsWith('/')) return `${SITE_URL}${t}`;
  if (SUPABASE_URL && !t.includes('/')) {
    return `${SUPABASE_URL}/storage/v1/object/public/${t}`;
  }
  return `${SITE_URL}/${t}`;
}

export default async function handler(req, res) {
  const { id, type = 'movie' } = req.query;

  if (!id) return res.status(400).send('Missing id');
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return res.status(500).send('Supabase env vars not set');

  try {
    const url = `${SUPABASE_URL}/rest/v1/movies?id=eq.${encodeURIComponent(id)}&select=id,title,description,poster,background,type`;

    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!r.ok) return res.status(404).send('Not found');

    const rows = await r.json();
    const data = Array.isArray(rows) ? rows[0] : null;
    if (!data) return res.status(404).send('Not found');

    const title = data.title || 'Untitled';
    const rawPoster = data.poster || data.background || '';
    const poster = normalizePosterUrl(rawPoster);

    const isSeries = data.type === 'series' || type === 'series';
    const redirectPath = isSeries ? `/series-player/${id}` : `/player/${id}`;
    const redirectUrl = `${SITE_URL}${redirectPath}`;

    const shareTitle = `Watch ${title} on ${BRAND_NAME}`;
    const shareDesc = `✔️😍✔️😍 Dore website shyashya twakuraho flm byoroshye zishyashya mumbaze mbayobore`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(shareTitle)}</title>
<meta name="description" content="${escapeHtml(shareDesc)}" />
<meta property="og:type" content="video.movie" />
<meta property="og:site_name" content="${escapeHtml(BRAND_NAME)}" />
<meta property="og:title" content="${escapeHtml(shareTitle)}" />
<meta property="og:description" content="${escapeHtml(shareDesc)}" />
<meta property="og:url" content="${escapeHtml(redirectUrl)}" />
<meta property="og:image" content="${escapeHtml(poster)}" />
<meta property="og:image:secure_url" content="${escapeHtml(poster)}" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(shareTitle)}" />
<meta name="twitter:description" content="${escapeHtml(shareDesc)}" />
<meta name="twitter:image" content="${escapeHtml(poster)}" />
<link rel="image_src" href="${escapeHtml(poster)}" />
<meta http-equiv="refresh" content="0;url=${escapeHtml(redirectUrl)}" />
</head>
<body>
<div style="background:#060d0a;color:#fff;font-family:system-ui;text-align:center;padding:24px;">
${poster ? `<img src="${escapeHtml(poster)}" style="max-width:220px;border-radius:12px;" alt="${escapeHtml(title)}" />` : ''}
<h1>${escapeHtml(shareTitle)}</h1>
<p><a href="${escapeHtml(redirectUrl)}" style="color:#34d399;">Click here if nothing happens</a></p>
</div>
<script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</body>
</html>`);
  } catch (err) {
    return res.status(500).send('Server error: ' + (err?.message || err));
  }
}