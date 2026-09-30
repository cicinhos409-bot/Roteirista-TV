import React, { useState } from 'react';
import { Search, X, Loader2, CheckCircle2, AlertTriangle, ExternalLink, User } from 'lucide-react';

interface FactCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const FactCheckerModal: React.FC<FactCheckerModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Atualiza a busca quando o modal é aberto a partir de outro ator
  React.useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setResult(null);
      setError(null);
    }
  }, [isOpen, initialQuery]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar checagem');
      }

      setResult(data.source ? `${data.result}\n\nFonte: ${data.source}` : data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao consultar fontes verificadas.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Checador Factual de Atores &amp; Novelas
              </h3>
              <p className="text-xs text-zinc-400">
                Verificação com busca na web · Idades calculadas para o ano de <strong>{new Date().getFullYear()}</strong>
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

        {/* Search Bar */}
        <div className="p-5 border-b border-zinc-800/80 bg-zinc-950/40">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex.: Cláudio Corrêa e Castro, Patrícia Pillar, O Rei do Gado 1996..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-lg px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className={`px-4 py-2.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                !query.trim() || loading
                  ? 'bg-zinc-800 text-zinc-500'
                  : 'bg-amber-400 hover:bg-amber-300 text-zinc-950'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checando...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Verificar Fatos</span>
                </>
              )}
            </button>
          </form>

          {/* Quick chips */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] text-zinc-400">
            <span>Sugestões rápidas:</span>
            {['Antônio Fagundes', 'Raul Cortez', 'Clodovil Hernandes', 'Leila Diniz', 'Chocolate com Pimenta'].map(
              (name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setQuery(name);
                  }}
                  className="text-amber-400/90 hover:underline"
                >
                  {name}
                </button>
              )
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs text-zinc-200">
          {loading && (
            <div className="py-12 text-center text-zinc-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-400" />
              <p>Consultando registros biográficos, novelas da época e situação atual...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Dados factuais conferidos com ano base {new Date().getFullYear()}:</span>
              </div>
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl leading-relaxed whitespace-pre-wrap font-sans text-zinc-300">
                {result}
              </div>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="py-8 text-center text-zinc-500">
              <User className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              <p className="text-xs">
                Digite o nome de qualquer ator ou novela para obter idade precisa em {new Date().getFullYear()},
                data de falecimento com causa divulgada e papéis históricos.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>Regra de ouro: Nenhuma fala inventada · Apenas fontes públicas</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
