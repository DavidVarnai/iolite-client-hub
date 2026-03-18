import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    if (!content || content.length < 30) {
      return new Response(JSON.stringify({ error: 'Content too short for extraction' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a strategic marketing analyst. Extract structured insights from the provided business/strategic brief document.

Return a JSON object with exactly these keys:
- audiences: string[] — target audience segments
- painPoints: string[] — customer or business pain points
- valueProps: string[] — value propositions
- differentiators: string[] — competitive differentiators
- positioning: string — one-paragraph positioning summary
- industries: string[] — industries/verticals mentioned
- inferredCompetitors: string[] — any competitors mentioned or strongly implied
- summary: string — 2-3 sentence executive summary of the brief

Rules:
- Extract only what is stated or strongly implied
- Keep each array item concise (5-15 words max)
- If a category has no relevant content, return an empty array
- For positioning, write a clear synthesis, not a quote
- Return ONLY valid JSON, no markdown, no explanation`;

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract insights from this brief:\n\n${content.slice(0, 15000)}` },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI API error:', errText);
      throw new Error(`AI service returned ${response.status}`);
    }

    const aiData = await response.json();
    const raw = aiData.choices?.[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract JSON from markdown fences
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = match ? JSON.parse(match[1]) : {};
    }

    // Ensure all expected keys exist
    const result = {
      audiences: Array.isArray(parsed.audiences) ? parsed.audiences : [],
      painPoints: Array.isArray(parsed.painPoints) ? parsed.painPoints : [],
      valueProps: Array.isArray(parsed.valueProps) ? parsed.valueProps : [],
      differentiators: Array.isArray(parsed.differentiators) ? parsed.differentiators : [],
      positioning: typeof parsed.positioning === 'string' ? parsed.positioning : '',
      industries: Array.isArray(parsed.industries) ? parsed.industries : [],
      inferredCompetitors: Array.isArray(parsed.inferredCompetitors) ? parsed.inferredCompetitors : [],
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Extract master brief error:', err);
    return new Response(JSON.stringify({
      error: 'Failed to extract insights',
      audiences: [], painPoints: [], valueProps: [], differentiators: [],
      positioning: '', industries: [], inferredCompetitors: [], summary: '',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
