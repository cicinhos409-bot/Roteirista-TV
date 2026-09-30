import React from 'react';
import { FileText, X, Trash2, ExternalLink, Calendar, Clock, Tv } from 'lucide-react';
import { ScriptProject } from '../types';

interface SavedScriptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedScripts: ScriptProject[];
  onSelectScript: (script: ScriptProject) => void;
  onDeleteScript: (id: string) => void;
}

export const SavedScriptsModal: React.FC<SavedScriptsModalProps> = ({
  isOpen,
  onClose,
  savedScripts,
  onSelectScript,
  onDeleteScript,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Roteiros Salvos no Navegador
              </h3>
              <p className="text-xs text-zinc-400">
                Acesse seus roteiros anteriores ou continue a edição
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

        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {savedScripts.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <Tv className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              <p>Nenhum roteiro salvo ainda. Gere e salve seu primeiro projeto!</p>
            </div>
          ) : (
            savedScripts.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 transition-all flex items-center justify-between gap-4"
              >
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => {
                    onSelectScript(item);
                    onClose();
                  }}
                >
                  <h4 className="text-xs font-bold text-zinc-200 hover:text-amber-400 transition-colors line-clamp-2 mb-1.5">
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                    <span className="font-semibold text-amber-400/90">
                      Estrutura {item.structureType}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.durationMinutes} min</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.wordCount.toLocaleString()} palavras</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectScript(item);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-200 rounded-lg transition-colors"
                  >
                    Abrir
                  </button>
                  <button
                    onClick={() => onDeleteScript(item.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
