import React, { useState } from 'react';
import { BookOpen, X, Search, Film, Calendar, User, ArrowRight } from 'lucide-react';
import { NOVELAS_DATABASE, NovelaReference } from '../data/novelas';

interface NovelasGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNovela: (novela: NovelaReference) => void;
}

export const NovelasGuideModal: React.FC<NovelasGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectNovela,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [broadcasterFilter, setBroadcasterFilter] = useState('TODAS');

  if (!isOpen) return null;

  const filtered = NOVELAS_DATABASE.filter((n) => {
    const matchesSearch =
      n.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.destaques.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBroadcaster =
      broadcasterFilter === 'TODAS' ||
      n.emissora.toLowerCase().includes(broadcasterFilter.toLowerCase());

    return matchesSearch && matchesBroadcaster;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Guia Rápido de Novelas Clássicas da TV
              </h3>
              <p className="text-xs text-zinc-400">
                Anos de exibição, autores lendários e elencos marcantes para seus roteiros
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar novela, autor ou ator marcante..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
            {['TODAS', 'Globo', 'Manchete', 'SBT'].map((channel) => (
              <button
                key={channel}
                onClick={() => setBroadcasterFilter(channel)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  broadcasterFilter === channel
                    ? 'bg-amber-400 text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {channel}
              </button>
            ))}
          </div>
        </div>

        {/* Novelas Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((novela, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-amber-500/40 hover:bg-zinc-900 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold text-zinc-100">{novela.nome}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{novela.ano}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                  <span>{novela.emissora}</span>
                  <span aria-hidden="true">·</span>
                  <span>Autor: {novela.autor}</span>
                </div>

                <div className="text-xs text-zinc-300 bg-zinc-900/80 p-2 rounded border border-zinc-850 mb-3">
                  <strong className="text-zinc-400 block text-[10px] uppercase tracking-wider mb-0.5">
                    Elenco de Destaque:
                  </strong>
                  {novela.destaques}
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectNovela(novela);
                  onClose();
                }}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-zinc-850 hover:bg-amber-400 hover:text-zinc-950 text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Usar no Gerador de Roteiro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>{filtered.length} novelas catalogadas</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
