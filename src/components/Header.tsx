import React from 'react';
import { Tv, Sparkles, Search, BookOpen, Clock, FileText, PlusCircle } from 'lucide-react';

interface HeaderProps {
  onNewScript: () => void;
  onOpenFactChecker: () => void;
  onOpenNovelasGuide: () => void;
  savedCount: number;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewScript,
  onOpenFactChecker,
  onOpenNovelasGuide,
  savedCount,
  onOpenHistory,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-zinc-100">
                Roteirista TV
              </span>
              <span className="text-xs text-amber-400/90 font-medium">
                Famosos &amp; Novelas
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Padrão YouTube TV</span>
              <span aria-hidden="true">·</span>
              <span>Público 45–75 anos</span>
              <span aria-hidden="true">·</span>
              <span>145 pal/min</span>
              <span aria-hidden="true">·</span>
              <span className="text-zinc-300 font-mono">Ano {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* Studio Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFactChecker}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
            title="Conferir dados reais, ano de estreia, idade atual e situação de atores"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Checar Ator / Novela</span>
          </button>

          <button
            onClick={onOpenNovelasGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
            title="Guia com mais de 30 novelas históricas (Globo, Manchete, SBT)"
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span>Guia de Novelas</span>
          </button>

          {savedCount > 0 && (
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Salvos ({savedCount})</span>
            </button>
          )}

          <button
            onClick={onNewScript}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors font-semibold"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Novo Roteiro</span>
          </button>
        </div>
      </div>
    </header>
  );
};
