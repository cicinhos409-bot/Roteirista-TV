import React, { useState, useEffect } from 'react';
import { Volume2, X, Play, Pause, Loader2, Sparkles } from 'lucide-react';

interface AudioPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleText: string;
}

export const AudioPreviewModal: React.FC<AudioPreviewModalProps> = ({
  isOpen,
  onClose,
  sampleText,
}) => {
  const [selectedVoice, setSelectedVoice] = useState('Fenrir');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && sampleText) {
      handleGenerateAudio();
    }
    if (!isOpen) {
      // Para qualquer áudio ao fechar o modal
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      audioElement?.pause();
      if (audioUrl && audioUrl !== 'browser-tts') URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setAudioElement(null);
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sampleText]);

  const handleGenerateAudio = async (voice = selectedVoice) => {
    setLoading(true);
    setError(null);
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }

    try {
      const response = await fetch('/api/generate-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleText.slice(0, 380),
          voiceName: voice,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao gerar voz');
      }

      if (data.fallbackSpeech || !data.audioBase64) {
        // Fallback to Web Speech API
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.text || sampleText.slice(0, 350));
          utterance.lang = 'pt-BR';
          utterance.rate = 0.95;
          utterance.pitch = voice === 'Fenrir' ? 0.85 : voice === 'Puck' ? 1.05 : 1.0;
          utterance.onstart = () => setIsPlaying(true);
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
          setAudioUrl('browser-tts');
          return;
        }
      }

      // Convert base64 to Blob URL
      const byteCharacters = atob(data.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      audio.play().then(() => setIsPlaying(true)).catch(() => setError('Clique em play para ouvir a narração.'));
      setAudioElement(audio);
    } catch (err: any) {
      console.warn('Falling back to browser speech synthesis:', err);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(sampleText.slice(0, 350));
        utterance.lang = 'pt-BR';
        utterance.rate = 0.95;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setAudioUrl('browser-tts');
      } else {
        setError(err.message || 'Erro ao sintetizar voz.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (audioUrl === 'browser-tts') {
      if ('speechSynthesis' in window) {
        if (isPlaying) {
          window.speechSynthesis.pause();
          setIsPlaying(false);
        } else {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        }
      }
      return;
    }
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">
              Prévia de Narração com Voz IA
            </h3>
            <p className="text-xs text-zinc-400">
              Teste o ritmo, a entonação nostálgica e a cadência do roteiro
            </p>
          </div>
        </div>

        {/* Voice Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Perfil de Voz Gemini
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Fenrir', label: 'Fenrir', desc: 'Grave & Documentário' },
              { id: 'Kore', label: 'Kore', desc: 'Feminina & Empática' },
              { id: 'Puck', label: 'Puck', desc: 'Jornalístico Dinâmico' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedVoice(v.id);
                  handleGenerateAudio(v.id);
                }}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  selectedVoice === v.id
                    ? 'border-amber-400 bg-amber-400/10 text-white'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold text-zinc-200">{v.label}</div>
                <div className="text-[10px] text-zinc-500">{v.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Narration Excerpt Preview */}
        <div className="mb-5 p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 leading-relaxed max-h-36 overflow-y-auto font-serif">
          &ldquo;{sampleText.slice(0, 350)}...&rdquo;
        </div>

        {/* Audio Player State */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-4 bg-zinc-950 rounded-xl border border-zinc-850 text-amber-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Gerando áudio com modelo de fala...</span>
          </div>
        ) : error ? (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs">
            {error}
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-xl border border-zinc-850">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 flex items-center justify-center font-bold transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div>
                <div className="text-xs font-semibold text-zinc-200">
                  {isPlaying ? 'Reproduzindo narração...' : 'Áudio pronto para ouvir'}
                </div>
                <div className="text-[10px] text-zinc-400">
                  Voz: {selectedVoice} · Formato WAV 24kHz
                </div>
              </div>
            </div>

            <button
              onClick={() => handleGenerateAudio(selectedVoice)}
              className="text-xs text-amber-400 hover:underline"
            >
              Regerar
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-750 rounded-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
