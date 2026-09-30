/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScriptWizard } from './components/ScriptWizard';
import { ScriptViewer } from './components/ScriptViewer';
import { FactCheckerModal } from './components/FactCheckerModal';
import { NovelasGuideModal } from './components/NovelasGuideModal';
import { SavedScriptsModal } from './components/SavedScriptsModal';
import { AudioPreviewModal } from './components/AudioPreviewModal';
import { ScriptProject, StructureType } from './types';
import { calculateWordCount, calculateEstimatedMinutes, calculateNarrationWordCount } from './utils/scriptParser';
import { NovelaReference } from './data/novelas';
import { Loader2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

const STORAGE_KEY = 'roteirista_tv_saved_projects_v1';

export default function App() {
  const [currentProject, setCurrentProject] = useState<ScriptProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<ScriptProject[]>([]);

  // Modals state
  const [isFactCheckerOpen, setIsFactCheckerOpen] = useState(false);
  const [factCheckerQuery, setFactCheckerQuery] = useState('');
  const [isNovelasGuideOpen, setIsNovelasGuideOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [audioSampleText, setAudioSampleText] = useState('');

  // Load saved projects from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedProjects(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved projects', e);
    }
  }, []);

  const handleSaveProject = (project: ScriptProject) => {
    const updated = [project, ...savedProjects.filter((p) => p.id !== project.id)];
    setSavedProjects(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
      setGenerationError('Não foi possível salvar no navegador (armazenamento cheio). Exclua roteiros antigos no Histórico.');
    }
  };

  const handleDeleteProject = (id: string) => {
    const updated = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
      setGenerationError('Não foi possível salvar no navegador (armazenamento cheio). Exclua roteiros antigos no Histórico.');
    }
  };

  const handleGenerate = async (params: {
    title: string;
    duration: string;
    durationMinutes: number;
    structureType: StructureType;
    channelName: string;
    observations: string;
  }) => {
    setIsGenerating(true);
    setStreamedText('');
    setGenerationError(null);
    setCurrentProject(null);

    let accumulated = '';
    let streamWarning: string | null = null;

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: params.title,
          duration: params.duration,
          durationMinutes: params.durationMinutes,
          observations: params.observations,
          channelName: params.channelName,
          structureType: params.structureType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha no servidor (${response.status})`);
      }

      if (!response.body) {
        throw new Error('Nenhum dado retornado.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            let parsed: any;
            try {
              parsed = JSON.parse(dataStr);
            } catch {
              continue; // JSON parcial: ignora
            }
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.warning) {
              streamWarning = parsed.warning;
            }
            if (parsed.text) {
              accumulated += parsed.text;
              setStreamedText(accumulated);
            }
          }
        }
      }

      if (!accumulated.trim()) {
        throw new Error('O roteiro veio vazio. Tente novamente em alguns instantes.');
      }

      const words = calculateNarrationWordCount(accumulated);
      const estMins = calculateEstimatedMinutes(words);

      const project: ScriptProject = {
        id: `script_${Date.now()}`,
        title: params.title,
        durationMinutes: params.durationMinutes,
        structureType: params.structureType,
        channelName: params.channelName,
        observations: params.observations,
        rawScript: accumulated,
        createdAt: new Date().toISOString(),
        wordCount: words,
        estimatedMinutes: estMins,
      };

      setCurrentProject(project);
      handleSaveProject(project);
      if (streamWarning) setGenerationError(streamWarning);
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || 'Erro ao gerar roteiro.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenFactCheckerForActor = (name?: string) => {
    if (name) setFactCheckerQuery(name);
    setIsFactCheckerOpen(true);
  };

  const handleSelectNovelaFromGuide = (novela: NovelaReference) => {
    // We can pre-fill search or trigger generation with template
    handleOpenFactCheckerForActor(`${novela.nome} ${novela.ano}`);
  };

  const handlePlayTTS = (sample: string) => {
    setAudioSampleText(sample);
    setIsAudioModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Header
        onNewScript={() => {
          setCurrentProject(null);
          setStreamedText('');
          setGenerationError(null);
        }}
        onOpenFactChecker={() => handleOpenFactCheckerForActor()}
        onOpenNovelasGuide={() => setIsNovelasGuideOpen(true)}
        savedCount={savedProjects.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      <main className="flex-1">
        {/* Streaming / Generation Progress Overlay */}
        {isGenerating && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      <span>Roteirista em Ação</span>
                      <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded font-mono">
                        Pesquisando dados factuais
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Checando novelas, idades atuais, ganchos e marcações para o editor...
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs text-zinc-400">
                  <div>{calculateWordCount(streamedText).toLocaleString()} palavras</div>
                  <div className="text-amber-400">
                    ~{calculateEstimatedMinutes(calculateWordCount(streamedText))} min de narração
                  </div>
                </div>
              </div>

              {/* Streaming Content Live Area */}
              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800/80 font-mono text-xs text-zinc-300 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {streamedText || 'Iniciando pesquisa e estruturação do roteiro...'}
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {generationError && !isGenerating && (
          <div className="max-w-4xl mx-auto px-4 pt-6">
            <div className="p-4 bg-red-950/40 border border-red-800 rounded-xl flex items-center justify-between gap-3 text-red-300 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{generationError}</span>
              </div>
              <button
                onClick={() => setGenerationError(null)}
                className="px-3 py-1 bg-red-900/60 hover:bg-red-800 rounded text-white"
              >
                Dispensar
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {!isGenerating && currentProject ? (
          <ScriptViewer
            project={currentProject}
            onBack={() => setCurrentProject(null)}
            onSave={handleSaveProject}
            onPlayTTS={handlePlayTTS}
            isTTSPlaying={false}
            onOpenFactChecker={handleOpenFactCheckerForActor}
          />
        ) : !isGenerating ? (
          <ScriptWizard onGenerate={handleGenerate} isGenerating={isGenerating} />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">Roteirista TV</span>
            <span aria-hidden="true">·</span>
            <span>Estúdio para Canais de Novelas &amp; Famosos</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Fórmula de Idade Dupla</span>
            <span aria-hidden="true">·</span>
            <span>Marcações de Vídeo &amp; Áudio</span>
            <span aria-hidden="true">·</span>
            <span>SEO &amp; Thumbnails</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FactCheckerModal
        isOpen={isFactCheckerOpen}
        onClose={() => setIsFactCheckerOpen(false)}
        initialQuery={factCheckerQuery}
      />

      <NovelasGuideModal
        isOpen={isNovelasGuideOpen}
        onClose={() => setIsNovelasGuideOpen(false)}
        onSelectNovela={handleSelectNovelaFromGuide}
      />

      <SavedScriptsModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedScripts={savedProjects}
        onSelectScript={(script) => {
          setCurrentProject(script);
          setIsHistoryOpen(false);
        }}
        onDeleteScript={handleDeleteProject}
      />

      <AudioPreviewModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        sampleText={audioSampleText}
      />
    </div>
  );
}
