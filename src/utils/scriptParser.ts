import { CastMember, CueItem, PublicationPackage } from '../types';

export function calculateWordCount(text: string): number {
  if (!text) return 0;
  const matches = text.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

export function calculateEstimatedMinutes(words: number): number {
  // Narration baseline: ~145 words per minute
  return Math.round((words / 145) * 10) / 10;
}

// Localiza o conteúdo de uma seção "## N. NOME" até a próxima seção de nível 2
function extractSection(script: string, num: number, names: string): string | null {
  const re = new RegExp(
    `^\\s*(?:##\\s*${num}\\.?|${num}\\.\\s*##)\\s*\\**\\s*(?:${names})[^\\n]*\\n([\\s\\S]*?)(?=^\\s*(?:##\\s*\\d\\.?|\\d\\.\\s*##)\\s|(?![\\s\\S]))`,
    'im'
  );
  const m = script.match(re);
  return m ? m[1] : null;
}

export function extractTeleprompterText(script: string): string {
  if (!script) return '';

  // Extract only Section 2 (Roteiro Completo) if sections exist
  const section = extractSection(script, 2, 'ROTEIRO COMPLETO|ROTEIRO DE NARRA[ÇC][ÃA]O');
  const targetText = section ?? script;

  return targetText
    // Remove editor cue tags (com ou sem dois-pontos, ex.: [VERIFICAR])
    .replace(/\[(?:TRECHO DE CENA|IMAGEM|VERIFICAR)[^\]]*\]/gi, '')
    // Remove markdown headers, tables and separators
    .replace(/^\s*#{1,6}\s.*$/gm, '')
    .replace(/^\s*\|.*$/gm, '')
    .replace(/^\s*(-{3,}|\*{3,})\s*$/gm, '')
    // Remove bold/italic markers so the AI voice doesn't read them
    .replace(/\*\*|__|\*|`/g, '')
    // Clean excessive empty lines and spaces
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Palavras apenas da narração (sem ficha, pacote, marcações de editor)
export function calculateNarrationWordCount(script: string): number {
  return calculateWordCount(extractTeleprompterText(script));
}

export function extractCues(script: string): CueItem[] {
  const cues: CueItem[] = [];
  if (!script) return cues;

  const lines = script.split('\n');
  let currentTimestamp = '00:00';

  for (const line of lines) {
    const timestampMatch = line.match(/###\s*\[(\d{1,2}:\d{2})(?:\s*[-–—]\s*\d{1,2}:\d{2})?\]/);
    if (timestampMatch) {
      currentTimestamp = timestampMatch[1];
    }

    const tagMatches = line.matchAll(/\[(TRECHO DE CENA|IMAGEM|VERIFICAR)\s*:?\s*([^\]]*)\]/gi);
    for (const match of tagMatches) {
      const tag = match[1].toUpperCase();
      cues.push({
        type: tag.startsWith('TRECHO') ? 'CENA' : tag === 'IMAGEM' ? 'IMAGEM' : 'VERIFICAR',
        text: match[2].trim() || line.replace(/\[[^\]]*\]/g, '').replace(/[*_#]/g, '').trim() || 'Conferir este trecho',
        timestamp: currentTimestamp,
      });
    }
  }

  return cues;
}

export function extractCastTable(script: string): CastMember[] {
  const cast: CastMember[] = [];
  if (!script) return cast;

  const textToScan = extractSection(script, 1, 'FICHA R[ÁA]PIDA') ?? script;

  const lines = textToScan.split('\n');
  let foundHeader = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) {
      if (foundHeader && cast.length > 0) break; // fim da primeira tabela
      continue;
    }
    if (/^\|\s*:?-{3,}/.test(trimmed)) {
      foundHeader = true;
      continue;
    }
    if (!foundHeader) continue;

    // Mantém células vazias para não desalinhar as colunas
    const parts = trimmed.replace(/^\||\|$/g, '').split('|').map((p) => p.replace(/\*\*/g, '').trim());
    if (parts.length >= 4) {
      cast.push({
        number: parts[0] || '',
        name: parts[1] || '',
        roleAndSoap: parts[2] || '',
        ageThenAndNow: parts[3] || '',
        currentStatus: parts[4] || '',
        source: parts[5] || 'Pesquisa Factual',
      });
    }
  }

  return cast;
}

function stripLabel(line: string): string {
  return line
    .replace(/[*_`]/g, '')
    .replace(/^\s*[-•]\s*/, '')
    .replace(/^[^:]{0,40}:\s*/, '')
    .trim();
}

export function extractPublicationPackage(script: string): PublicationPackage {
  const result: PublicationPackage = {
    titles: [],
    thumbText: '',
    thumbConcept: '',
    description: '',
    tags: [],
  };

  if (!script) return result;

  const text = extractSection(script, 3, 'PACOTE DE PUBLICA[ÇC][ÃA]O') ?? '';
  if (!text) return result;

  const lines = text.split('\n');
  let mode: 'none' | 'titles' | 'thumb' | 'desc' | 'tags' = 'none';
  const descLines: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    const lower = line.toLowerCase().replace(/[*_#]/g, '').trim();

    // Subtítulos da seção
    if (/^#{2,4}\s/.test(line) || /^\*\*[^*]+\*\*:?$/.test(line)) {
      if (lower.includes('títul') || lower.includes('titul')) mode = 'titles';
      else if (lower.includes('thumb') || lower.includes('miniatura')) mode = 'thumb';
      else if (lower.includes('descri')) mode = 'desc';
      else if (lower.includes('tag')) mode = 'tags';
      else mode = 'none';
      continue;
    }

    if (/^[-*•]?\s*\**tags\**\s*:/i.test(line)) {
      const tagsString = line.split(/tags\**\s*:/i)[1] || '';
      result.tags = tagsString
        .split(',')
        .map((t) => t.replace(/[*_#]/g, '').trim())
        .filter(Boolean);
      mode = 'none';
      continue;
    }

    if (/^[-*•]?\s*\**descri[çc][ãa]o\**\s*:?/i.test(line) && mode !== 'desc') {
      mode = 'desc';
      const rest = stripLabel(line);
      if (rest && !/^descri/i.test(rest)) descLines.push(rest);
      continue;
    }

    if (lower.startsWith('texto da thumb') || lower.startsWith('texto da miniatura') || lower.startsWith('texto na imagem')) {
      result.thumbText = stripLabel(line);
      continue;
    }
    if (lower.startsWith('ideia de imagem') || lower.startsWith('ideia visual') || lower.startsWith('composição')) {
      result.thumbConcept = stripLabel(line);
      continue;
    }

    if (mode === 'titles' || (mode === 'none' && result.titles.length < 3)) {
      const t = line.match(/^(?:[1-9][.)-]|[-•])\s*(.+)$/);
      if (t) {
        const title = t[1].replace(/[*_"]/g, '').trim();
        if (title.length >= 15 && title === title.toUpperCase()) {
          result.titles.push(title);
          continue;
        }
      }
    }

    if (mode === 'desc') {
      descLines.push(raw.replace(/\*\*/g, ''));
    }
  }

  result.description = descLines.join('\n').replace(/```/g, '').trim();
  result.titles = result.titles.slice(0, 5);
  return result;
}

function normalizeTitle(title: string): string {
  return title
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function detectStructureFromTitle(title: string): 'A' | 'B' | 'C' | 'D' {
  const upper = normalizeTitle(title);

  if (
    upper.includes('ASSIM FOI A VIDA') ||
    upper.includes('ULTIMAS HORAS') ||
    upper.includes('DOCUMENTARIO') ||
    upper.includes('A VERDADE SOBRE')
  ) {
    return 'D';
  }

  // Perfil de UMA pessoa/imóvel (sem número de lista no início)
  const startsWithListNumber = /^\s*\d{1,2}\s/.test(upper) || /:\s*\d{1,2}\s/.test(upper);
  if (
    upper.includes('FINALMENTE ADMITE') ||
    upper.includes('RECLUSA HA') ||
    upper.includes('RECLUSO HA') ||
    upper.includes('QUEBRA O SILENCIO') ||
    upper.includes(' REVELA') ||
    (/POR DENTRO DA (MANSAO|CASA|FAZENDA|COBERTURA)/.test(upper) && !startsWithListNumber) ||
    (/^AOS \d+ ANOS,/.test(upper))
  ) {
    return 'C';
  }

  // Elenco de novela (inclusive quem já partiu) é lista corrida
  if (/ATORES DE |ATRIZES DE |ELENCO DE /.test(upper)) {
    return 'B';
  }

  if (
    upper.includes('JA NOS DEIXARAM') ||
    upper.includes('MORRERAM AO VIVO') ||
    upper.includes('MORTE NO PALCO') ||
    upper.includes('ULTIMAS PALAVRAS') ||
    upper.includes('DESTINO TRAGICO') ||
    upper.includes('MANSOES') ||
    upper.includes('FAZENDAS') ||
    upper.includes('CASAS DOS FAMOSOS')
  ) {
    return 'A';
  }

  // Default to B for "X ANOS DEPOIS", "POR ONDE ANDAM", "JÁ MORRERAM", "GALÃS", "NA VIDA REAL", transformações
  return 'B';
}
