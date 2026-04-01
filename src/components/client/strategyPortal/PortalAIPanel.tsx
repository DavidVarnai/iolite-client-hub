import { useState } from 'react';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';

interface PortalAIPanelProps {
  fieldContext: string;
  currentValue: string;
  onApply: (text: string) => void;
  onClose: () => void;
}

export default function PortalAIPanel({ fieldContext, currentValue, onApply, onClose }: PortalAIPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/strategy-portal-ai`;
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          fieldContext,
          currentValue,
          userPrompt: prompt,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          setResult('Rate limited — please try again in a moment.');
          return;
        }
        if (resp.status === 402) {
          setResult('Credits exhausted — please add funds in Settings → Workspace → Usage.');
          return;
        }
        setResult('AI generation failed. Please try again.');
        return;
      }

      // Stream SSE response
      const reader = resp.body?.getReader();
      if (!reader) { setResult('No response body'); return; }
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setResult(accumulated);
            }
          } catch { /* partial JSON */ }
        }
      }
    } catch (e) {
      setResult('AI generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sp-ai-panel">
      <div className="sp-ai-header">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <span className="text-sm font-semibold">AI Assist</span>
        </div>
        <button onClick={onClose} className="sp-ai-close"><X size={16} /></button>
      </div>

      <div className="sp-ai-context">
        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Field Context</div>
        <div className="text-xs text-foreground">{fieldContext}</div>
      </div>

      {currentValue && (
        <div className="sp-ai-current">
          <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Current Value</div>
          <div className="text-xs text-muted-foreground line-clamp-4">{currentValue}</div>
        </div>
      )}

      <div className="sp-ai-prompt-area">
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. Make it more compelling, add specific metrics, rewrite for CFO audience..."
          className="sp-ai-prompt-input"
          rows={3}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
        />
        <button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="sp-ai-send">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>

      {result && (
        <div className="sp-ai-result">
          <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Suggestion</div>
          <div className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">{result}</div>
          <button onClick={() => onApply(result)} className="sp-ai-apply">
            Apply to field
          </button>
        </div>
      )}
    </div>
  );
}
