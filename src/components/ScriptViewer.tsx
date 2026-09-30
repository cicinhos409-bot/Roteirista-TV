import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Share2,
  Bookmark,
  Volume2,
  FileText,
  Video,
  ListOrdered,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  Film,
  Camera,
  Layers,
  Search,
} from 'lucide-react';
import { ScriptProject } from '../types';
import { TeleprompterView } from './TeleprompterView';
import {
  calculateWordCount,
  calculateNarrationWordCount,
  extractTeleprompterText,
  calculateEstimatedMinutes,
  extractCues,
  extractCastTable,
  extractPublicationPackage,
} from '../utils/scriptParser';

interface ScriptViewerProps {
  project: ScriptProject;
  onBack: () => void;
  onSave: (project: ScriptProject) => void;
  onPlayTTS: (sampleText: string) => void;
  isTTSPlaying: boolean;
  onOpenFactChecker: (query?: string) => void;
}

type TabType = 'full' | 'teleprompter' | 'cast' | 'youtube' | 'cues';

export const ScriptViewer: React.FC<ScriptViewerProps> = ({
  project,
  onBack,
  onSave,
  onPlayTTS,
  isTTSPlaying,
  onOpenFactChecker,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('full');
  const [copiedFull, setCopiedFull] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiedTitleIndex, setCopiedTitleIndex] = useState<number | null>(null);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);

  const wordCount = calculateNarrationWordCount(project.rawScript);
  const anoRef = new Date(project.createdAt || Date.now()).getFullYear();
  const estMins = calculateEstimatedMinutes(wordCount);
  const targetWords = Math.max(1, Math.round(project.durationMinutes * 145 * 0.9)); // desconta ~10% de trechos de cena
  const progressPercent = Math.min(100, Math.round((wordCount / targetWords) * 100));

  const cues = extractCues(project.rawScript);
  const cast = extractCastTable(project.rawScript);
  const pubPackage = extractPublicationPackage(project.rawScript);

  const handleCopyFull = () => {
    navigator.clipboard.writeText(project.rawScript);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleSave = () => {
    onSave(project);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([project.rawScript], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.slice(0, 40).replace(/[^a-zA-Z0-9]/g, '_')}_roteiro.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyTitle = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTitleIndex(idx);
    setTimeout(() => setCopiedTitleIndex(null), 2000);
  };

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(pubPackage.description || project.rawScript);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  const handleCopyTags = () => {
    navigator.clipboard.writeText(pubPackage.tags.join(', '));
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  };

  // Syntax highlighter for the markdown script
  const renderHighlightedScript = () => {
    const lines = project.rawScript.split('\n');
    return (
      <div className="space-y-2 font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {lines.map((line, idx) => {
          // Major sections
          if (line.startsWith('## ')) {
            return (
              <h2
                key={idx}
                className="text-base sm:text-lg font-bold text-amber-400 pt-6 pb-2 border-b border-zinc-800"
              >
                {line.replace(/^##\s*/, '')}
              </h2>
            );
          }

          // Minor sections / timestamps
          if (line.startsWith('### ')) {
            return (
              <h3
                key={idx}
                className="text-xs sm:text-sm font-bold text-zinc-100 pt-4 pb-1 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {line.replace(/^###\s*/, '')}
              </h3>
            );
          }

          // Tables
          if (line.startsWith('|')) {
            return (
              <div key={idx} className="overflow-x-auto text-[11px] text-zinc-300 font-mono py-0.5">
                {line}
              </div>
            );
          }

          // Video Editor cues
          let element: React.ReactNode = line;

          if (line.includes('[TRECHO DE CENA:') || line.includes('[IMAGEM:') || line.includes('[VERIFICAR:')) {
            const parts = line.split(/(\[[^\]]+\])/g);
            element = parts.map((part, pIdx) => {
              if (part.startsWith('[TRECHO DE CENA:')) {
                return (
                  <span
                    key={pIdx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 my-0.5 bg-blue-950/80 border border-blue-600/50 text-blue-300 rounded font-semibold text-xs"
                  >
                    <Film className="w-3 h-3 text-blue-400" />
                    {part}
                  </span>
                );
              }
              if (part.startsWith('[IMAGEM:')) {
                return (
                  <span
                    key={pIdx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 my-0.5 bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 rounded font-semibold text-xs"
                  >
                    <Camera className="w-3 h-3 text-emerald-400" />
                    {part}
                  </span>
                );
              }
              if (part.startsWith('[VERIFICAR:')) {
                return (
                  <span
                    key={pIdx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 my-0.5 bg-amber-950/90 border border-amber-500/60 text-amber-300 rounded font-bold text-xs"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    {part}
                  </span>
                );
              }
              return part;
            });
          }

          return (
            <p key={idx} className="min-h-[1.25rem]">
              {element}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Breadcrumb & Metadata summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Gerador</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Audio TTS preview button */}
          <button
            onClick={() => onPlayTTS(extractTeleprompterText(project.rawScript).slice(0, 600))}
            disabled={isTTSPlaying}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-400 rounded-lg transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isTTSPlaying ? 'Gerando Voz...' : 'Ouvir Narração (IA)'}</span>
          </button>

          {/* Save to Browser */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-lg transition-colors"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{saved ? 'Salvo!' : 'Salvar Projeto'}</span>
          </button>

          {/* Download file */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Baixar .MD</span>
          </button>

          {/* Copy Full */}
          <button
            onClick={handleCopyFull}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-lg transition-colors"
          >
            {copiedFull ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFull ? 'Copiado!' : 'Copiar Roteiro'}</span>
          </button>
        </div>
      </div>

      {/* Script Header Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>Estrutura {project.structureType}</span>
            <span aria-hidden="true">·</span>
            <span>Canal: {project.channelName}</span>
            <span aria-hidden="true">·</span>
            <span>Ano Base {anoRef}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <span>
              Palavras: <strong className="text-zinc-100">{wordCount.toLocaleString()}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Tempo: <strong className="text-amber-400">~{estMins} min</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Alvo: <strong className="text-zinc-300">{project.durationMinutes} min</strong>
            </span>
          </div>
        </div>

        <h1 className="text-lg sm:text-xl font-extrabold text-zinc-100 leading-snug">
          {project.title}
        </h1>

        {/* Progress pacing bar */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-300">Pacing de Narração (145 pal/min):</span>
              <span
                className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                  progressPercent >= 85 && progressPercent <= 115
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : progressPercent < 85
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-blue-950 text-blue-400 border border-blue-800'
                }`}
              >
                {progressPercent >= 85 && progressPercent <= 115
                  ? 'Pacing Perfeito (Meta Atingida)'
                  : progressPercent < 85
                  ? `Abaixo da Meta (~${Math.max(0, targetWords - wordCount).toLocaleString()} pal faltantes)`
                  : 'Acima da Meta (Super Aprofundado)'}
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              <strong className="text-zinc-200">{wordCount.toLocaleString()}</strong> / ~{targetWords.toLocaleString()} palavras ({progressPercent}%)
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
              <div
                className={`h-full transition-all ${
                  progressPercent >= 85 && progressPercent <= 115
                    ? 'bg-emerald-400'
                    : progressPercent < 85
                    ? 'bg-amber-400'
                    : 'bg-blue-400'
                }`}
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">
              ~{estMins} min falados (+ ~{Math.max(1, Math.round(project.durationMinutes * 0.1))} min de cenas)
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl mb-6 overflow-x-auto">
        {[
          { id: 'full', label: 'Roteiro Completo', icon: FileText, count: null },
          { id: 'teleprompter', label: 'Modo Locução IA & Teleprompter', icon: Volume2, count: null },
          { id: 'cast', label: 'Ficha Rápida do Elenco', icon: ListOrdered, count: cast.length || null },
          { id: 'youtube', label: 'Pacote YouTube (SEO & Thumb)', icon: Sparkles, count: pubPackage.titles.length || null },
          { id: 'cues', label: 'Guia do Editor (Cenas & Fotos)', icon: Video, count: cues.length || null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-950 font-mono text-zinc-400">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'full' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-inner">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800 text-xs text-zinc-400">
            <span>Visualização Completa com Marcações de Edição</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-blue-400">
                <Film className="w-3 h-3" /> Trecho de Cena
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Camera className="w-3 h-3" /> Imagem
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <AlertTriangle className="w-3 h-3" /> Verificar
              </span>
            </div>
          </div>
          {renderHighlightedScript()}
        </div>
      )}

      {activeTab === 'teleprompter' && (
        <TeleprompterView
          rawScript={project.rawScript}
          onPlayTTS={onPlayTTS}
          isTTSPlaying={isTTSPlaying}
        />
      )}

      {activeTab === 'cast' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Ficha Rápida do Elenco e Idades</h3>
              <p className="text-xs text-zinc-400">
                Fórmula de idade dupla conferida para o ano de {anoRef}
              </p>
            </div>
            <button
              onClick={() => onOpenFactChecker()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Conferir Ator</span>
            </button>
          </div>

          {cast.length > 0 ? (
            <div className="overflow-x-auto border border-zinc-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Nome do Ator</th>
                    <th className="py-2.5 px-3">Personagem / Novela</th>
                    <th className="py-2.5 px-3">Idade na Época → Hoje ({anoRef})</th>
                    <th className="py-2.5 px-3">Situação Atual / Falecimento</th>
                    <th className="py-2.5 px-3">Checagem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {cast.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-850/50">
                      <td className="py-2.5 px-3 font-mono text-zinc-500">{item.number || idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-zinc-200">{item.name}</td>
                      <td className="py-2.5 px-3 text-zinc-300">{item.roleAndSoap}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-400 font-medium">
                        {item.ageThenAndNow}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300">{item.currentStatus}</td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => onOpenFactChecker(item.name)}
                          className="text-[11px] text-zinc-400 hover:text-amber-400 hover:underline"
                        >
                          Verificar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-zinc-400 text-xs">
              A tabela de elenco pode ser visualizada na aba "Roteiro Completo".
            </div>
          )}
        </div>
      )}

      {activeTab === 'youtube' && (
        <div className="space-y-6">
          {/* SEO Titles */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
              3 Opções de Títulos no Padrão do Nicho (MAIÚSCULAS)
            </h3>
            <div className="space-y-3">
              {(pubPackage.titles.length > 0 ? pubPackage.titles : [project.title]).map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 p-3.5 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-xs text-amber-400 font-bold">{idx + 1}.</span>
                    <div>
                      <span className="font-mono text-xs sm:text-sm font-bold text-zinc-100 tracking-wide">
                        {t}
                      </span>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {t.length} caracteres · Âncora de curiosidade
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyTitle(t, idx)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-md transition-colors"
                  >
                    {copiedTitleIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedTitleIndex === idx ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Thumbnail Concept */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
              Ideia &amp; Texto da Miniatura (Thumbnail)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Texto na Imagem (2 a 4 Palavras)
                </span>
                <div className="text-base font-extrabold text-amber-400 font-mono tracking-wider">
                  {pubPackage.thumbText || 'TRISTE FIM / COMO ESTÃO HOJE'}
                </div>
                <p className="text-[11px] text-zinc-400 mt-2">
                  Colocar em caixa alta, fonte pesada com borda preta ou amarela para contraste.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Composição Visual da Imagem
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {pubPackage.thumbConcept ||
                    'Montagem lado a lado: foto de arquivo da novela em alta saturação à esquerda e foto recente à direita, com seta amarela ou destaque dramático no olhar.'}
                </p>
              </div>
            </div>
          </div>

          {/* Description & Chapters */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Descrição com Capítulos &amp; Timestamps
              </h3>
              <button
                onClick={handleCopyDescription}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md"
              >
                {copiedDesc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDesc ? 'Copiada!' : 'Copiar Descrição'}</span>
              </button>
            </div>
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto">
              {pubPackage.description ||
                `Neste vídeo você vai relembrar o que aconteceu com o elenco inesquecível da novela... Confira como estão hoje, os que já nos deixaram e os bastidores emocionantes!\n\nCapítulos:\n00:00 - Introdução e Ganchos\n01:15 - Atores e Personagens Históricos\n...`}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                15 Tags Estratégicas para o YouTube
              </h3>
              <button
                onClick={handleCopyTags}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md"
              >
                {copiedTags ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTags ? 'Copiadas!' : 'Copiar Tags'}</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {pubPackage.tags.length > 0
                ? pubPackage.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 font-mono"
                    >
                      #{tag}
                    </span>
                  ))
                : ['novelas antigas', 'por onde andam', 'tv globo', 'atores que ja morreram', 'antes e depois'].map(
                    (tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 font-mono"
                      >
                        #{tag}
                      </span>
                    )
                  )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cues' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Guia da Edição de Vídeo (Cue Sheet)</h3>
              <p className="text-xs text-zinc-400">
                Cortes de novela e montagens fotográficas extraídos do roteiro
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400">
              {cues.length} marcações encontradas
            </span>
          </div>

          <div className="space-y-2.5">
            {cues.length > 0 ? (
              cues.map((cue, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                >
                  <span className="font-mono text-zinc-500 text-[11px] mt-0.5">
                    {cue.timestamp || '00:00'}
                  </span>
                  <div className="flex-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mr-2 ${
                        cue.type === 'CENA'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : cue.type === 'IMAGEM'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {cue.type === 'CENA' && <Film className="w-3 h-3" />}
                      {cue.type === 'IMAGEM' && <Camera className="w-3 h-3" />}
                      {cue.type === 'VERIFICAR' && <AlertTriangle className="w-3 h-3" />}
                      {cue.type}
                    </span>
                    <span className="text-zinc-200">{cue.text}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-500 text-xs">
                Nenhuma marcação explícita de cena encontrada. As marcações aparecem no formato [TRECHO DE CENA: ...] e [IMAGEM: ...].
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
