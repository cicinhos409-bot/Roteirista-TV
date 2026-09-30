import React, { useState } from 'react';
import { Copy, Check, Play, Pause, RotateCcw, Volume2, Type } from 'lucide-react';
import { extractTeleprompterText, calculateWordCount, calculateEstimatedMinutes } from '../utils/scriptParser';

interface TeleprompterViewProps {
  rawScript: string;
  onPlayTTS: (sampleText: string) => void;
  isTTSPlaying: boolean;
}

export const TeleprompterView: React.FC<TeleprompterViewProps> = ({
  rawScript,
  onPlayTTS,
  isTTSPlaying,
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<number>(20);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1);

  const cleanText = extractTeleprompterText(rawScript);
  const wordCount = calculateWordCount(cleanText);
  const estMins = calculateEstimatedMinutes(wordCount);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-scroll effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoScrolling) {
      interval = setInterval(() => {
        window.scrollBy({ top: scrollSpeed * 2, behavior: 'smooth' });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAutoScrolling, scrollSpeed]);

  return (
    <div className="space-y-4">
      {/* Teleprompter Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Modo Locução IA &amp; Teleprompter
          </span>
          <span className="text-xs text-zinc-400">
            (Livre de marcações de cena para ElevenLabs, Clipchamp, CapCut)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Font size control */}
          <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800 text-xs text-zinc-300">
            <Type className="w-3.5 h-3.5 text-zinc-400" />
            <button
              onClick={() => setFontSize(Math.max(16, fontSize - 2))}
              className="px-1.5 py-0.5 hover:bg-zinc-800 rounded font-mono"
              title="Diminuir fonte"
            >
              A-
            </button>
            <span className="font-mono text-zinc-400">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(32, fontSize + 2))}
              className="px-1.5 py-0.5 hover:bg-zinc-800 rounded font-mono"
              title="Aumentar fonte"
            >
              A+
            </button>
          </div>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isAutoScrolling
                ? 'bg-amber-400 text-zinc-950 border-amber-400 font-semibold'
                : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            {isAutoScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoScrolling ? 'Pausar Rolagem' : 'Rolar Tela'}</span>
          </button>

          {/* Test TTS */}
          <button
            onClick={() => onPlayTTS(cleanText.slice(0, 300))}
            disabled={isTTSPlaying}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-amber-400 rounded-lg transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isTTSPlaying ? 'Gerando Áudio...' : 'Ouvir Abertura (IA)'}</span>
          </button>

          {/* Copy Clean Narration */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto Limpo'}</span>
          </button>
        </div>
      </div>

      {/* Teleprompter Content */}
      <div
        className="p-8 sm:p-12 rounded-xl bg-zinc-950 border border-zinc-850 shadow-inner font-serif leading-relaxed text-zinc-200 tracking-wide select-text transition-all"
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
      >
        {cleanText ? (
          cleanText.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-6 hover:text-white transition-colors">
              {paragraph.trim()}
            </p>
          ))
        ) : (
          <p className="text-zinc-500 italic text-center py-12">
            Nenhum texto de narração disponível. Gere um roteiro primeiro.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 px-2">
        <span>{wordCount.toLocaleString()} palavras para locução</span>
        <span>Tempo estimado de fala: ~{estMins} min (145 palavras/min)</span>
      </div>
    </div>
  );
};
