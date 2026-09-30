import React, { useState } from 'react';
import {
  Wand2,
  Clock,
  Sparkles,
  Layers,
  Film,
  AlertCircle,
  HelpCircle,
  Flame,
  Check,
  Tv,
} from 'lucide-react';
import { StructureType } from '../types';
import { STRUCTURES, PRESET_TOPICS, PresetTopic } from '../data/novelas';
import { detectStructureFromTitle } from '../utils/scriptParser';

// Duração padrão de cada estrutura (Prompt Mestre)
const DEFAULT_DURATION: Record<StructureType, number> = { A: 30, B: 20, C: 20, D: 50 };

interface ScriptWizardProps {
  onGenerate: (data: {
    title: string;
    duration: string;
    durationMinutes: number;
    structureType: StructureType;
    channelName: string;
    observations: string;
  }) => void;
  isGenerating: boolean;
}

export const ScriptWizard: React.FC<ScriptWizardProps> = ({
  onGenerate,
  isGenerating,
}) => {
  const [title, setTitle] = useState('');
  const [structureType, setStructureType] = useState<StructureType>('B');
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [channelName, setChannelName] = useState('Nostalgia TV Brasil');
  const [observations, setObservations] = useState('');
  const [autoDetected, setAutoDetected] = useState(true);

  // Focus filters
  const [focusAlive, setFocusAlive] = useState(false);
  const [focusDeceased, setFocusDeceased] = useState(false);
  const [includeValues, setIncludeValues] = useState(false);
  const [emphasizeNostalgia, setEmphasizeNostalgia] = useState(true);

  // When user types title, suggest structure if autoDetected is true
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (autoDetected && val.length > 5) {
      const detected = detectStructureFromTitle(val);
      if (detected !== structureType) {
        setStructureType(detected);
        setDurationMinutes(DEFAULT_DURATION[detected]);
      }
    }
  };

  const handleApplyPreset = (preset: PresetTopic) => {
    setTitle(preset.title);
    setStructureType(preset.structure);
    setDurationMinutes(preset.durationMinutes);
    setObservations(preset.observations);
    setAutoDetected(false);
  };

  const calculatedWords = Math.round(durationMinutes * 145 * 0.9); // ~145 words/min minus 10% scene clips

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isGenerating) return;

    let compiledObs = observations.trim();
    const flags: string[] = [];
    if (focusAlive) flags.push('Focar preferencialmente em atores que estão vivos.');
    if (focusDeceased) flags.push('Focar no elenco que já partiu, informando ano da morte, idade e causa médica divulgada.');
    if (includeValues) flags.push('Incluir detalhes monetários concretos (valores de imóveis, metragem, lances de leilão, patrimônio).');
    if (emphasizeNostalgia) flags.push('Reforçar tom de memória afetiva para quem assiste pela TV da sala (anos 70 a 2000).');

    if (flags.length > 0) {
      compiledObs = `${compiledObs}\nDiretrizes adicionais: ${flags.join(' ')}`.trim();
    }

    onGenerate({
      title: title.trim(),
      duration: `${durationMinutes} minutos`,
      durationMinutes,
      structureType,
      channelName: channelName.trim() || 'Canal Famosos & Novelas',
      observations: compiledObs,
    });
  };

  const selectedStructure = STRUCTURES.find((s) => s.id === structureType) || STRUCTURES[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Welcome banner */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
          <span>Estúdio de Roteiros YouTube</span>
          <span aria-hidden="true">·</span>
          <span>Baseado no Prompt Mestre</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
          Crie roteiros cinematográficos sobre novelas e famosos
        </h1>
        <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
          Formatação perfeita para voz de inteligência artificial (145 palavras/min), com
          fórmula de idade dupla, checagem factual em tempo real e pacote de publicação completo.
        </p>
      </div>

      {/* Preset Topics Carousel */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Ideias &amp; Modelos Prontos do Nicho
          </span>
          <span className="text-xs text-zinc-400">Clique para carregar</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_TOPICS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-left p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 hover:border-amber-500/40 transition-all group"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
                <span className="text-amber-400/90 font-medium">{preset.category}</span>
                <span className="text-zinc-400 font-mono">{preset.durationMinutes} min</span>
              </div>
              <h3 className="text-xs font-semibold text-zinc-200 group-hover:text-white line-clamp-2 leading-snug">
                {preset.title}
              </h3>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 shadow-xl">
        {/* Title Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Título do Vídeo (Padrão em Maiúsculas)
            </label>
            <span className="text-xs text-zinc-400">
              {title.length > 0 ? `${title.length} caracteres` : 'Até 100 caracteres recomendado'}
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="EX.: 30 ANOS DEPOIS: POR ONDE ANDAM 15 ATORES DE O REI DO GADO HOJE"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-400 font-mono tracking-wide"
            />
          </div>
          {title && (
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Estrutura detectada: <strong className="text-zinc-200">{selectedStructure.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setAutoDetected(!autoDetected)}
                className="hover:text-zinc-200 underline text-xs"
              >
                {autoDetected ? 'Trocar manualmente' : 'Auto-detectar'}
              </button>
            </div>
          )}
        </div>

        {/* Structure Selector Cards */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
            Estrutura do Roteiro (Conforme o Formato)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STRUCTURES.map((struct) => {
              const isSelected = structureType === struct.id;
              return (
                <div
                  key={struct.id}
                  onClick={() => {
                    setStructureType(struct.id);
                    setDurationMinutes(DEFAULT_DURATION[struct.id]);
                    setAutoDetected(false);
                  }}
                  className={`cursor-pointer p-4 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'border-amber-400/80 bg-amber-500/10'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-zinc-200'}`}>
                      {struct.name}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">{struct.durationRange}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-2 leading-relaxed">{struct.subtitle}</p>
                  <div className="text-[11px] text-zinc-400 line-clamp-2">
                    {struct.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Duration & Pacing Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Duração Alvo do Vídeo (Rigoroso)
              </label>
              <span className="text-xs font-bold text-amber-400 font-mono bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded">
                {durationMinutes} minutos
              </span>
            </div>

            {/* Quick buttons for official format standards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {[
                { min: 10, label: '10 min', sub: 'Rápido (Top 8)', targetWords: '~1.300 pal' },
                { min: 20, label: '20 min', sub: 'Padrão B (Elencos)', targetWords: '~2.600 pal' },
                { min: 30, label: '30 min', sub: 'Padrão A (Contagem)', targetWords: '~3.900 pal' },
                { min: 50, label: '45–60 min', sub: 'Doc D (Atos)', targetWords: '~6.500 pal' },
              ].map((item) => {
                const isSelected = item.label === '45–60 min'
                  ? durationMinutes >= 45 && durationMinutes <= 60
                  : durationMinutes === item.min;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setDurationMinutes(item.min)}
                    className={`py-2 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/15 text-white shadow-sm'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono text-zinc-100">{item.label}</div>
                    <div className="text-[10px] text-amber-400/90 font-medium">{item.targetWords}</div>
                    <div className="text-[9px] text-zinc-400 truncate mt-0.5">{item.sub}</div>
                  </button>
                );
              })}
            </div>

            <input
              type="range"
              min="10"
              max="60"
              step="1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full accent-amber-400 h-2 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
              <span>10 min</span>
              <span>20 min (Padrão B)</span>
              <span>30 min (Padrão A)</span>
              <span>45–60 min (Doc D)</span>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Cálculo de Pacing Rigoroso (145 Palavras/Minuto)
            </span>
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base sm:text-lg font-bold text-amber-400 font-mono">
                    ~{calculatedWords.toLocaleString()} palavras de narração
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {durationMinutes} min × 145 pal/min (com -10% para trechos de novela e vinhetas)
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-400 font-semibold block">Ritmo Natural</span>
                  <span className="text-[10px] text-zinc-400">Voz de IA fluída (TV)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                <div>
                  <strong className="text-zinc-300 block">Tempo de Locução Falada:</strong>
                  ~{Math.round(calculatedWords / 145)} min falados + ~{Math.max(1, Math.round(durationMinutes * 0.1))} min cenas
                </div>
                <div>
                  <strong className="text-zinc-300 block">Meta Média por Bloco:</strong>
                  {structureType === 'B'
                    ? '~160 a 220 palavras / ator'
                    : structureType === 'A'
                    ? '~240 a 320 palavras / item'
                    : structureType === 'C'
                    ? '~250 a 350 palavras / capítulo'
                    : '~1.100 a 1.400 palavras / ato'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Name & Specific Directives */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Nome do Canal (Para CTAs Personalizadas)
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Ex.: Nostalgia TV Brasil"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-lg px-3.5 py-2 text-xs text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Ano de Referência Temporal
            </label>
            <div className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-zinc-300 flex items-center justify-between">
              <span>Ano Atual: <strong>{new Date().getFullYear()}</strong></span>
              <span className="text-[11px] text-emerald-400">Idades calculadas com exatidão</span>
            </div>
          </div>
        </div>

        {/* Focus checkboxes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
            Filtros &amp; Regras Específicas de Conteúdo
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2 rounded bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700">
              <input
                type="checkbox"
                checked={focusAlive}
                onChange={(e) => {
                  setFocusAlive(e.target.checked);
                  if (e.target.checked) setFocusDeceased(false);
                }}
                className="accent-amber-400 rounded"
              />
              <span className="text-zinc-300">Focar preferencialmente em atores vivos</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700">
              <input
                type="checkbox"
                checked={focusDeceased}
                onChange={(e) => {
                  setFocusDeceased(e.target.checked);
                  if (e.target.checked) setFocusAlive(false);
                }}
                className="accent-amber-400 rounded"
              />
              <span className="text-zinc-300">Homenagear elenco que já partiu (com causa divulgada)</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700">
              <input
                type="checkbox"
                checked={includeValues}
                onChange={(e) => setIncludeValues(e.target.checked)}
                className="accent-amber-400 rounded"
              />
              <span className="text-zinc-300">Citar valores de imóveis, metragem e leilões</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700">
              <input
                type="checkbox"
                checked={emphasizeNostalgia}
                onChange={(e) => setEmphasizeNostalgia(e.target.checked)}
                className="accent-amber-400 rounded"
              />
              <span className="text-zinc-300">Enfatizar nostalgia para TV da sala (45–75 anos)</span>
            </label>
          </div>
        </div>

        {/* Freeform observations */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
            Observações Adicionais (Atores específicos, curiosidades de bastidores, etc.)
          </label>
          <textarea
            rows={3}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ex.: Incluir Antônio Fagundes, Patrícia Pillar e Raul Cortez; destacar que a novela foi exibida em 1996 e bateu recordes de audiência..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-500 leading-relaxed"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!title.trim() || isGenerating}
            className={`w-full py-3.5 px-6 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              !title.trim() || isGenerating
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-lg shadow-amber-500/10 cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Escrevendo Roteiro &amp; Checando Fatos na Web...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Gerar Roteiro Completo com Gemini (Pesquisa em Tempo Real)</span>
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-zinc-400 mt-2">
            Inclui Ficha Rápida com Idades Atuais, Narração Completa com Minutagem e Pacote de Publicação
          </p>
        </div>
      </form>
    </div>
  );
};
