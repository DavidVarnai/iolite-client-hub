import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SerpSearchRequest {
  query: string;
  location?: string;
  num?: number;
}

interface OrganicResult {
  position: number;
  title: string;
  link: string;
  domain: string;
  snippet?: string;
}

interface AdResult {
  position: number;
  title: string;
  link: string;
  domain: string;
}

interface SerpSearchResponse {
  query: string;
  organic_results: OrganicResult[];
  paid_results: AdResult[];
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('SerpAPI');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'SERPAPI_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { query, location, num = 15 }: SerpSearchRequest = await req.json();
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: query' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Build SerpAPI URL
    const params = new URLSearchParams({
      api_key: apiKey,
      engine: 'google',
      q: query,
      num: String(Math.min(num, 15)),
    });
    if (location) params.set('location', location);

    console.log(`[serp-search] Querying: "${query}" (location: ${location || 'none'})`);

    const serpRes = await fetch(`https://serpapi.com/search.json?${params}`);
    if (!serpRes.ok) {
      const errText = await serpRes.text();
      console.error('[serp-search] SerpAPI error:', errText);
      return new Response(
        JSON.stringify({ error: `SerpAPI returned ${serpRes.status}`, details: errText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await serpRes.json();

    // Extract organic results
    const organic_results: OrganicResult[] = (data.organic_results || [])
      .slice(0, 15)
      .map((r: any, i: number) => ({
        position: r.position ?? i + 1,
        title: r.title || '',
        link: r.link || '',
        domain: extractDomain(r.link || ''),
        snippet: r.snippet || '',
      }));

    // Extract paid/ads results
    const paid_results: AdResult[] = (data.ads || [])
      .slice(0, 10)
      .map((r: any, i: number) => ({
        position: r.position ?? i + 1,
        title: r.title || '',
        link: r.link || r.tracking_link || '',
        domain: extractDomain(r.link || r.tracking_link || ''),
      }));

    const result: SerpSearchResponse = { query, organic_results, paid_results };

    console.log(`[serp-search] Results: ${organic_results.length} organic, ${paid_results.length} paid`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[serp-search] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal error', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
