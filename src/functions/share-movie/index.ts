// supabase/functions/share-movie/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const escapeHtml = (str: string): string =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req: Request) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const type = url.searchParams.get("type") || "movie";
    const site = url.searchParams.get("site") || "https://irafilms.store";

    if (!id) {
      return new Response("Missing id", { status: 400, headers: corsHeaders });
    }

    // Fetch the movie/series from the movies table
    const { data, error } = await supabase
      .from("movies")
      .select("id, title, description, poster, background, type")
      .eq("id", id)
      .single();

    if (error || !data) {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    const title: string = data.title || "Untitled";
    const poster: string = data.poster || data.background || "";
    const description: string = (data.description || "").slice(0, 160);

    const isSeries = data.type === "series" || type === "series";
    const redirectUrl = isSeries
      ? `${site}/series-player/${id}`
      : `${site}/player/${id}`;

    const shareTitle = `Watch ${title} on Irafilms`;

    const shareDesc = description
      ? `${description} ✔️😍✔️😍 Dore website shyashya twakuraho flm byoroshye zishyashya mumbaze mbayobore`
      : `✔️😍✔️😍 Dore website shyashya twakuraho flm byoroshye zishyashya mumbaze mbayobore`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(shareTitle)}</title>
  <meta name="description" content="${escapeHtml(shareDesc)}" />

  <!-- Open Graph (WhatsApp, Telegram, Facebook) -->
  <meta property="og:type" content="video.movie" />
  <meta property="og:site_name" content="Irafilms" />
  <meta property="og:title" content="${escapeHtml(shareTitle)}" />
  <meta property="og:description" content="${escapeHtml(shareDesc)}" />
  <meta property="og:image" content="${escapeHtml(poster)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(poster)}" />
  <meta property="og:image:width" content="800" />
  <meta property="og:image:height" content="1200" />
  <meta property="og:url" content="${escapeHtml(redirectUrl)}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(shareTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(shareDesc)}" />
  <meta name="twitter:image" content="${escapeHtml(poster)}" />

  <!-- Instant redirect for real visitors -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(redirectUrl)}" />
  <link rel="canonical" href="${escapeHtml(redirectUrl)}" />

  <style>
    body { background: #060d0a; color: #e5e7eb; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .wrap { text-align: center; padding: 24px; }
    .poster { max-width: 200px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 20px 60px rgba(16,185,129,0.3); }
    a { color: #34d399; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrap">
    ${poster ? `<img class="poster" src="${escapeHtml(poster)}" alt="${escapeHtml(title)}" />` : ""}
    <h1>${escapeHtml(shareTitle)}</h1>
    <p>Redirecting… <a href="${escapeHtml(redirectUrl)}">Click here if nothing happens</a></p>
  </div>
  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response("Server error: " + message, { status: 500, headers: corsHeaders });
  }
});