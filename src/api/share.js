// api/share.js — Vercel Serverless Function
// Returns HTML with Open Graph meta tags so WhatsApp/Telegram/Facebook
// show the movie poster + title when the link is shared.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const escapeHtml = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export default async function handler(req, res) {
  const { id, type = 'movie' } = req.query;
  const siteUrl = 'https://irafilms.store';

  if (!id) {
    return res.status(400).send('Missing id');
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).send('Supabase env vars not set');
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/movies?id=eq.${encodeURIComponent(id)}&select=id,title,description,poster,background,type`;

    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!r.ok) {
      return res.status(404).send('Not found');
    }

    const rows = await r.json();
    const data = Array.isArray(rows) ? rows[0] : null;

    if (!data) {
      return res.status(404).send('Not found');
    }

    const title = data.title || 'Untitled';
    const poster = data.poster || data.background || '';
    const isSeries = data.type === 'series' || type === 'series';
    const redirectPath = isSeries ? `/series-player/${id}` : `/player/${id}`;
    const redirectUrl = `${siteUrl}${redirectPath}`;

    const shareTitle = `Watch ${title} on Irafilms`;
    const shareDesc = `✔️😍✔️😍 Dore website shyashya twakuraho flm byoroshye zishyashya mumbaze mbayobore`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');

    return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(shareTitle)}</title>
<meta name="description" content="${escapeHtml(shareDesc)}" />

<meta property="og:type" content="video.movie" />
<meta property="og:site_name" content="Irafilms" />
<meta property="og:title" content="${escapeHtml(shareTitle)}" />
<meta property="og:description" content="${escapeHtml(shareDesc)}" />
<meta property="og:image" content="${escapeHtml(poster)}" />
<meta property="og:image:secure_url" content="${escapeHtml(poster)}" />
<meta property="og:image:width" content="800" />
<meta property="og:image:height" content="1200" />
<meta property="og:url" content="${escapeHtml(redirectUrl)}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(shareTitle)}" />
<meta name="twitter:description" content="${escapeHtml(shareDesc)}" />
<meta name="twitter:image" content="${escapeHtml(poster)}" />

<meta http-equiv="refresh" content="0;url=${escapeHtml(redirectUrl)}" />
<link rel="canonical" href="${escapeHtml(redirectUrl)}" />
<style>
  body{background:#060d0a;color:#e5e7eb;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center;}
  img{max-width:220px;border-radius:12px;margin-bottom:16px;box-shadow:0 20px 60px rgba(16,185,129,.3);}
  a{color:#34d399;font-weight:600;text-decoration:none;}
</style>
</head>
<body>
  <div>
    ${poster ? `<img src="${escapeHtml(poster)}" alt="${escapeHtml(title)}" />` : ''}
    <h1>${escapeHtml(shareTitle)}</h1>
    <p>Redirecting… <a href="${escapeHtml(redirectUrl)}">Click here if nothing happens</a></p>
  </div>
  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</body>
</html>`);

  } catch (err) {
    return res.status(500).send('Server error: ' + (err?.message || err));
  }
}