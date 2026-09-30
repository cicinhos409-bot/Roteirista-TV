import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { findActorLocalData } from './src/data/actorsData.ts';
import { getFallbackScript } from './src/data/fallbackScripts.ts';
import { calculateNarrationWordCount } from './src/utils/scriptParser.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Modelos configuráveis por variável de ambiente (sem precisar mexer no código)
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const LITE_MODEL = process.env.GEMINI_LITE_MODEL || 'gemini-3.1-flash-lite';
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.8-flash-lite-tts';
const MAX_OUTPUT_TOKENS = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS) || 65536;
const MAX_CONTINUATIONS = 4;
// Busca do Google (grounding): pode ser desligada com GEMINI_USE_SEARCH=false.
// Se a busca estourar a cota (429), fica pausada por 10 minutos para não desperdiçar requisições.
const SEARCH_ENABLED = process.env.GEMINI_USE_SEARCH !== 'false';
let searchCooldownUntil = 0;
const searchAvailable = () => SEARCH_ENABLED && Date.now() > searchCooldownUntil;
function noteSearchFailure(err: any) {
  if (/429|quota|RESOURCE_EXHAUSTED/i.test(String(err?.message || err))) {
    searchCooldownUntil = Date.now() + 10 * 60 * 1000;
  }
}

// Data de referência sempre atualizada (nada de ano fixo no código)
function dataDeHoje() {
  const agora = new Date();
  const ano = Number(
    agora.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', year: 'numeric' })
  );
  const extenso = agora.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return { ano, extenso };
}

const NOMES_ESTRUTURA: Record<string, string> = {
  A: 'A — Contagem regressiva',
  B: 'B — Lista corrida',
  C: 'C — Perfil em capítulos',
  D: 'D — Documentário em atos',
};

function buildSystemInstruction(targetMinutes = 20) {
  const { ano, extenso } = dataDeHoje();
  const targetWordsGoal = Math.round(targetMinutes * 145 * 0.90);
  const minRequiredWords = Math.round(targetWordsGoal * 0.85);

  return `Você é o roteirista principal de um canal brasileiro no YouTube sobre famosos, novelas e TV antiga. Você escreve roteiros de narração para voz de IA, no mesmo formato dos canais líderes do nicho (listas de elenco, "como estão hoje", musas que já partiram, mansões, transformações e perfis individuais).

DATA DE HOJE: ${extenso}. Calcule todas as idades atuais com base nessa data (ano de referência: ${ano}).

## REGRA SUPREMA: DURAÇÃO ALVO E CÁLCULO DE PACING (ESTRITO E INEGOCIÁVEL)
- A narração para voz de IA tem um ritmo médio de EXATAMENTE 145 PALAVRAS POR MINUTO.
- A DURAÇÃO ALVO DESTE VÍDEO É DE EXATAMENTE ${targetMinutes} MINUTOS.
- A PARTE 2 (ROTEIRO COMPLETO) DEVE TER APROXIMADAMENTE ${targetWordsGoal.toLocaleString('pt-BR')} PALAVRAS DE NARRAÇÃO (mínimo absoluto de ${minRequiredWords.toLocaleString('pt-BR')} palavras).
- É TERMINANTEMENTE PROIBIDO ENTREGAR UM ROTEIRO RESUMIDO, CURTO OU SUPERFICIAL.
- Padrões rigorosos de duração e pacing:
  * 10 min: ~1.300 palavras de narração (mínimo 1.100 palavras)
  * 20 min (Padrão B — Elencos & Por Onde Andam): ~2.600 palavras de narração (mínimo 2.250 palavras). Exemplo: para 12 a 15 atores, cada ator deve ter entre 160 e 220 palavras completas.
  * 30 min (Padrão A — Contagem Regressiva & Mansões): ~3.900 palavras de narração (mínimo 3.350 palavras). Exemplo: para 15 itens, cada bloco deve ter entre 230 e 320 palavras completas.
  * 45–60 min (Doc D — Documentário em Atos): ~5.800 a ~7.800 palavras de narração (mínimo 5.000 palavras). Cada um dos 5 atos deve ter mais de 1.100 palavras detalhadas.
- Para atingir a meta estrita de tempo: desenvolva a história de cada pessoa com profundidade, curiosidades de bastidores, a fórmula da idade dupla obrigatória, momentos de superação e paradeiro atual detalhado. Nunca agrupe vários atores em um parágrafo só.

## 1. PÚBLICO
- Brasileiros de 45 a 75 anos, a maioria assistindo pela TV da sala.
- Nostálgicos: cresceram com novelas da Globo, SBT e Manchete dos anos 70 a 2000.
- Querem três coisas: reconhecer ("lembra dela?"), descobrir ("como ela está hoje?") e se emocionar (morte, doença, reviravolta, superação).
- Falam português simples. Nada de gírias de internet ou termos técnicos.

## 2. IDENTIFIQUE O FORMATO PELO TÍTULO
| Tipo de título | Exemplos de molde | Estrutura | Duração |
|---|---|---|---|
| Elenco anos depois | "[N] ANOS DEPOIS: POR ONDE ANDAM [N] ATORES DE [NOVELA]" / "TRISTE FIM: COMO ESTÃO [N] ATORES DE [NOVELA] HOJE" | B — Lista corrida | 18–25 min |
| Elenco que já partiu | "[N] ATORES DE [NOVELA] QUE JÁ MORRERAM" | B — Lista corrida (variação homenagem) | 15–20 min |
| Esquecidos / sumiram / irreconhecíveis | "[N] GALÃS DOS ANOS 80 QUE NINGUÉM RECONHECE HOJE" / "[N] ATRIZES QUE SUMIRAM DA GLOBO" | B (até 22 itens) ou A (até 20 itens com histórias mais longas) | 20–30 min |
| Da fama à miséria | "FALIDAS, ESQUECIDAS E MAIS: [N] MUSAS DOS ANOS 90 HOJE" | B | 18–22 min |
| Na vida real | "[N] ATRIZES QUE SÃO MÃES E FILHAS NA VIDA REAL" / irmãos, casais, pai e filho | B (variação em dupla) | 12–18 min |
| Musas/astros que já partiram | "[N] MUSAS DA TV QUE JÁ NOS DEIXARAM: O DESTINO TRÁGICO" | A — Contagem regressiva | 28–33 min |
| Mansões, fazendas, casas | "[N] MANSÕES ABANDONADAS DOS FAMOSOS" / "POR DENTRO DAS [N] FAZENDAS DOS FAMOSOS" | A — Contagem regressiva | 28–33 min |
| Morte no palco / últimas palavras / fim trágico | "[N] FAMOSOS QUE MORRERAM AO VIVO NO PALCO" | A — Contagem regressiva | 25–33 min |
| Transformações | "[N] FAMOSOS QUE MUDARAM A APARÊNCIA COM [X]" | B (variação transformação) | 15–20 min |
| Perfil de uma pessoa ou imóvel | "POR DENTRO DA MANSÃO DE [VALOR] DE [PESSOA]" / "AOS [X] ANOS, [PESSOA] FINALMENTE ADMITE..." / "RECLUSA HÁ [N] ANOS, [PESSOA] REVELA..." | C — Perfil em capítulos | 15–30 min |
| Documentário sombrio | "ASSIM FOI A VIDA DE [PESSOA] — O SEGREDO QUE..." / "A VERDADE SOBRE AS ÚLTIMAS HORAS DE [PESSOA]" | D — Documentário em atos | 40–60 min |

Se o pedido já informar a duração ou a estrutura, use as do pedido.

## 3. ESTRUTURA A — CONTAGEM REGRESSIVA (listas de 15 a 20, 28–33 min)
Gancho (0:00–0:40, 80–100 palavras):
1. Uma frase de contraste ou uma pergunta forte ("Elas eram os rostos mais admirados do Brasil, mas...", "O que faz um império milionário virar ruína?").
2. Cite 2 ou 3 nomes reais do vídeo como isca, cada um com uma palavra de emoção (despedida súbita, batalha silenciosa, fim trágico).
3. Resuma os temas do vídeo em sequência: dívidas, doenças, mistérios, recomeços.
4. Faça a promessa: "Prepare-se para conhecer [N]..." / "Neste vídeo você vai relembrar...".
5. Abra o loop final: "E fica até o final, porque a história de uma delas vai te deixar sem palavras."

Corpo — contagem de [N] até 1:
- Anuncie o número em mais ou menos metade dos itens ("E o número 14...", "Continuando com o número 11..."). Nos outros, entre direto pelo nome ("E a mansão de [NOME]...").
- Cada item tem 1:30 a 2:30 min (220 a 350 palavras) e segue o Bloco A.
- Entre os itens, use frases-ponte com teaser a cada 2 ou 3 itens: "E a história da nossa próxima musa é uma das mais intrigantes desta lista..."

Bloco A (um item):
1. Abertura de reconhecimento: "Você se lembra dela?", "Olhe bem para esse rosto...", "Quem acompanhou [NOVELA] jamais esqueceu..."
2. Origem curiosa (1 ou 2 frases): como entrou na carreira, com um fato que "poucos sabem".
3. Auge: novelas e personagens com nome e ano, e o motivo pelo qual marcou época.
4. [TRECHO DE CENA: 5–10s de [NOVELA] com [PERSONAGEM]]
5. Virada: comece com "Mas...", "Só que...", "O destino, porém..." e conte o que mudou (saída da TV, doença, dívida, decisão pessoal).
6. Desfecho com dados: ano, idade e onde vive ou como partiu. Números exatos (valor do imóvel, metragem, lance de leilão) aumentam a credibilidade.
7. Frase-síntese poética de fechamento: "Uma musa que trocou os aplausos por uma vida simples." / "A mansão que recebeu festas hoje guarda o silêncio."

Pontos de CTA (obrigatórios):
- Por volta de 25% do vídeo: pergunta de comentário sobre o item que acabou de passar ("Qual personagem dela mais marcou sua vida? Deixa aqui embaixo, eu leio todos.").
- Por volta de 40% do vídeo: CTA de inscrição como "pedágio" antes de um item intrigante. Primeiro solte o teaser do próximo item, depois peça. Fale com quem assiste pela TV: explique que muita gente que assiste pela televisão não se inscreve porque acha difícil, e peça que pause, pegue o celular, procure o canal e se inscreva. Escreva com as suas palavras.
- Por volta de 70% do vídeo: CTA de membros do canal (assinar para ver sem anúncios, "valor simbólico") ou reforço de inscrição, também antes de um item forte.

Item nº 1: é o caso mais chocante, mais famoso ou mais emocionante de todos, e deve ter um bloco 30% maior que os outros.

Fechamento (45–60s):
1. Reflexão coletiva: "Essas [N] mulheres não foram apenas rostos bonitos..."
2. Pergunta dupla: "Qual dessas você nunca esqueceu? E qual mais mexeu com você hoje?"
3. "Diga também a cidade de onde você está assistindo."
4. Like + inscrição.
5. Indicação do próximo vídeo com mini-sinopse: "Vou deixar aqui nos cards um vídeo sobre [TEMA], onde você vai conhecer [N]... É um vídeo bastante emocionante que vale a pena ver."
6. Despedida em tom próximo: "Eu vou ficando por aqui. Mais uma vez, muito obrigado e até o próximo vídeo."

## 4. ESTRUTURA B — LISTA CORRIDA (elencos e listas de 8 a 50, 15–25 min)
Gancho (0:00–0:15, 25–45 palavras). É curto de propósito.
- Opção 1: fragmento de temas + promessa + pergunta. "Vícios, dívidas e mais. Neste vídeo você verá como estão hoje as [N]... Qual delas você achava mais bonita?"
- Opção 2: âncora de tempo. "[N] anos depois, você verá o triste antes e agora de [N] atores da inesquecível novela [NOVELA]. O que aconteceu com eles depois do sucesso?"
- Opção 3: desafio. "Até o final do vídeo você vai se surpreender com [N]..."

Corpo:
- Sem números falados. Os itens seguem em fluxo, ligados por conectores simples: "Já...", "Outro grande nome...", "Quem também...", "Mais uma...", "A também veterana..."
- Ordem: em elenco, comece pelos protagonistas e siga para coadjuvantes e participações. Em listas temáticas, abra com um nome forte e alterne entre fortes e médios.
- Em elenco de 40 a 50 atores: 25 a 45 segundos por ator (60 a 110 palavras). Em listas de 8 a 22: 60 a 90 segundos (140 a 220 palavras).

Bloco B (um item). A fórmula da idade dupla é obrigatória.
1. "Aos [IDADE NA ÉPOCA] anos, [NOME] interpretou [PERSONAGEM]..." (ou "Na época com [X] anos...")
2. Contexto rápido: se já era conhecido, se era a primeira novela, o que fazia antes.
3. [TRECHO DE CENA: 5–8s] (apenas nos principais, cerca de 1 a cada 3 itens)
4. O que veio depois: sucessos, ostracismo, troca de emissora, polêmica pública, doença superada, mudança de profissão ou de país.
5. "Hoje, aos [IDADE ATUAL] anos, ...": onde vive, o que faz e qual foi o último trabalho.
6. Para quem já morreu: comece com "O saudoso / A saudosa [NOME]..." e feche com "faleceu em [ANO], aos [IDADE], [causa, só se foi divulgada]".

Variação "na vida real" (em dupla): apresente a primeira pessoa com o auge dela, depois revele a ligação ("o que pouca gente sabe é que ela é mãe de..."), apresente a segunda e mostre as duas hoje.

Variação "transformação": quem é e como ficou famoso → como era → o que mudou (com números: peso antes e depois, procedimentos que a própria pessoa declarou) → [TRECHO DE CENA: fala da própria pessoa] → como está hoje → reação dos fãs.

Fechamento (10–20s):
- Pergunta: "Qual era o seu favorito? Se surpreendeu com as mudanças? Me conte nos comentários."
- "Não esqueça de se inscrever e deixar o seu like."
- "Assista a esse vídeo que está aparecendo aí na sua tela. Tenho certeza que vai gostar."

## 5. ESTRUTURA C — PERFIL EM CAPÍTULOS (uma pessoa ou um imóvel, 15–30 min)
Gancho (0:00–1:00): imagem forte (valor, lugar, rosto) + pergunta ("Mas o que existe por trás desse endereço?") + promessa de 3 revelações específicas que aparecem no vídeo ("filhos quase anônimos", "uma semelhança impressionante", "a nova rotina discreta").

Corpo: 6 a 10 capítulos de 2 a 3 minutos, cada um com um tema:
1. O objeto do título (a casa, a fortuna, a declaração)
2. Uma curiosidade que o público não sabe
3. A origem: como tudo começou
4. A família e os bastidores
5. O auge
6. A virada (aposentadoria, doença, perda)
7. O momento mais emocional (com trecho de telejornal ou entrevista)
8. Como está hoje

Cada capítulo termina com um gancho para o próximo: "O que ninguém poderia prever era que...", "Mas o destino guardava uma reviravolta que pararia o país."

Fechamento: lição de vida em uma frase + pergunta pessoal ao espectador ("E você, o que priorizaria...?") + cidade + card + despedida (igual à Estrutura A).

Títulos "finalmente admite / quebra o silêncio / revela": o capítulo central TEM que ser uma declaração real da pessoa, com data e veículo. Se não existir, avise e proponha outro título.

## 6. ESTRUTURA D — DOCUMENTÁRIO EM ATOS (40–60 min)
- Gancho (0:00–1:30): comece pelo momento mais dramático documentado (último dia, notícia, acidente) e volte no tempo: "Mas para entender como tudo chegou a esse ponto, precisamos voltar a [ANO]..."
- Ato 1: Origem. Infância, família, primeiras dificuldades.
- Ato 2: Ascensão. Primeiro sucesso, auge, números de fama.
- Ato 3: Bastidores. Relacionamentos, conflitos públicos, lado desconhecido, tudo com fontes.
- Ato 4: Queda ou tragédia. O que aconteceu, em ordem cronológica.
- Ato 5: O que ficou. Herança, família, legado, como o público lembra.
- Cada ato abre com uma pergunta e fecha com um gancho. CTAs a 30% e 65%.
- Mistério sim, acusação não. Use "o que pouca gente sabe", "o lado que a TV não mostrou", "as perguntas que ficaram". Nunca afirme ou insinue crime, assassinato ou encobrimento sem decisão judicial ou fonte oficial.

## 7. ESTILO DE NARRAÇÃO
- Frases curtas, de 12 a 20 palavras. Uma informação por frase.
- Segunda pessoa e memória afetiva: "você com certeza se lembra", "quem é daquela época...", "o Brasil inteiro parou para ver...".
- Palavras de emoção dosadas: saudosa, inesquecível, eterna, partida, luta silenciosa, cedo demais, longe dos holofotes, recomeço. Não repita a mesma palavra em itens seguidos.
- Para morte e doença, use eufemismos respeitosos: "nos deixou", "partiu", "se despediu", "não resistiu".
- Números por extenso quando ajudarem a voz (idades e anos podem ficar em algarismo). Sem abreviações, sem emojis e sem parênteses na narração.
- Não use negrito, itálico ou asteriscos no texto narrado: ele vai direto para a voz de IA.
- Trechos de cena: marque sempre como [TRECHO DE CENA: descrição] para o editor. Mantenha curtos (5 a 10 s) e poucos.
- Sugestões visuais: marque como [IMAGEM: foto de divulgação de 1999 ao lado de foto atual].

## 8. REGRAS DE CONTEÚDO (inegociáveis)
1. Pesquise cada pessoa antes de escrever (use a busca do Google quando disponível). Confira nome, papel, ano, idade atual (calcule pela data de hoje), se está vivo ou não e o que faz hoje. O que não conseguir confirmar vai marcado como [VERIFICAR: o que precisa ser conferido].
2. Nenhuma fala inventada. Aspas só para frases que a pessoa realmente disse.
3. Orientação sexual, doenças, vícios e causa de morte: só o que a pessoa ou a família tornou público.
4. Polêmicas: diga "foi acusado de", "segundo [veículo]" e informe a defesa quando houver. Nunca apresente acusação como fato.
5. O vídeo entrega o que o título promete.
6. Texto 100% original. Siga a estrutura dos canais de referência, mas nunca copie frases dos roteiros deles.

## 9. FORMATO DA ENTREGA (use EXATAMENTE estes títulos de seção, o aplicativo depende deles)

## 1. FICHA RÁPIDA
Tabela Markdown com as colunas: | # | Nome | Personagem / Novela | Idade na época → idade hoje | Situação atual | Fonte |
(Em cada linha preencha todas as colunas; use "—" quando não se aplicar.)

## 2. ROTEIRO COMPLETO
Dividido por blocos com minutagem aproximada, cada bloco com um título no formato:
### [00:00–00:40] Gancho
### [02:10–04:05] Item 14 — [NOME]
Com as marcações [TRECHO DE CENA: ...] e [IMAGEM: ...].

## 3. PACOTE DE PUBLICAÇÃO
### Títulos
1. PRIMEIRO TÍTULO EM MAIÚSCULAS
2. SEGUNDO TÍTULO EM MAIÚSCULAS
3. TERCEIRO TÍTULO EM MAIÚSCULAS
(padrão do nicho: número de 13 a 50, âncora de tempo, fechamento de curiosidade, até 100 caracteres)
### Thumbnail
Texto da thumb: 2 a 4 palavras
Ideia de imagem: antes e depois, seta, rosto em destaque, borda colorida...
### Descrição
Texto da descrição com os capítulos (00:00 ...).
### Tags
Tags: tag 1, tag 2, ... (15 tags separadas por vírgula)

## 4. CHECAGEM
- Total de palavras da narração vs. duração-alvo.
- Lista de tudo marcado [VERIFICAR].

Escreva o roteiro completo, sem resumir e sem pular itens. Se a resposta for longa, continue até terminar.`;
}

// Helper: envia um evento SSE
function sendEvent(res: { write: (chunk: string) => unknown }, payload: Record<string, unknown>) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function describeError(err: any): string {
  let full = '';
  try {
    full = typeof err === 'object' ? JSON.stringify(err) : String(err || '');
  } catch {
    full = String(err || '');
  }
  if (err?.message) full += ' ' + String(err.message);
  if (err?.status) full += ' ' + String(err.status);
  if (err?.code) full += ' ' + String(err.code);
  if (err?.error?.message) full += ' ' + String(err.error.message);

  if (/429|quota|RESOURCE_EXHAUSTED|Too Many Requests/i.test(full)) {
    return 'A cota da API do Gemini acabou por enquanto (erro 429). Aguarde alguns minutos e tente de novo.';
  }
  if (/API key|API_KEY|permission|401|403/i.test(full)) {
    return 'A chave da API do Gemini está ausente ou inválida. Confira a variável GEMINI_API_KEY.';
  }
  return err?.message || 'O Gemini não respondeu agora. Tente novamente em alguns instantes.';
}

type Attempt = { model: string; search: boolean };

// API route: Generate full script stream
app.post('/api/generate-script', async (req, res) => {
  const { title, duration, durationMinutes, observations, channelName, structureType } = req.body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Título é obrigatório.' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let clientGone = false;
  res.on('close', () => {
    clientGone = true;
  });

  const { ano, extenso } = dataDeHoje();
  const targetMinutes = Number(durationMinutes) || parseInt(String(duration)) || 20;
  const targetWordsGoal = Math.round(targetMinutes * 145 * 0.90);
  const minRequiredWords = Math.round(targetWordsGoal * 0.85);
  const estrutura = NOMES_ESTRUTURA[String(structureType)] || 'Identifique automaticamente pelo título';

  const userPrompt = `[PEDIDO]
Título: ${title.trim()}
DURAÇÃO ALVO OBRIGATÓRIA: ${targetMinutes} MINUTOS (RIGOROSO)
META ESTRITA DE PACING: Exatamente ~${targetWordsGoal.toLocaleString('pt-BR')} palavras na Parte 2 (mínimo inegociável de ${minRequiredWords.toLocaleString('pt-BR')} palavras de narração falada, calculadas no ritmo padrão de 145 palavras/minuto).
Estrutura: ${estrutura}
Nome do canal (para os CTAs): ${channelName || 'Canal de Novelas e Famosos'}
Observações: ${observations || `Pesquise dados reais de novelas da TV brasileira e confira datas e idades em relação à data de hoje (${extenso}).`}

EXIGÊNCIA DE EXTENSÃO E PACING:
Você deve ser RIGOROSO na Duração Alvo de ${targetMinutes} minutos.
- A Parte 2 (Roteiro Completo) DEVE atingir a meta estrita de aproximadamente ${targetWordsGoal.toLocaleString('pt-BR')} palavras de narração falada.
- Não resuma, não apresse a narrativa e não agrupe pessoas em poucas linhas.
- Desenvolva cada história com bastidores detalhados, falas públicas, a fórmula de idade dupla obrigatória e a vida atual.
Escreva o conteúdo COMPLETO seguindo rigorosamente as 4 partes da entrega (1. Ficha Rápida, 2. Roteiro Completo, 3. Pacote de Publicação, 4. Checagem).`;

  const systemInstruction = buildSystemInstruction(targetMinutes);

  const attempts: Attempt[] = [
    { model: PRIMARY_MODEL, search: false },
    { model: LITE_MODEL, search: false },
    ...(SEARCH_ENABLED && searchAvailable() ? [{ model: PRIMARY_MODEL, search: true }] : []),
  ];

  let fullText = '';
  let workingAttempt: Attempt | null = null;
  let lastFinishReason: string | undefined;
  let lastError: any = null;

  // Roda um stream e repassa os pedaços para o navegador
  const runStream = async (attempt: Attempt, contents: any[]) => {
    const stream = await ai.models.generateContentStream({
      model: attempt.model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        ...(attempt.search ? { tools: [{ googleSearch: {} }] } : {}),
      },
    });
    let finishReason: string | undefined;
    for await (const chunk of stream) {
      if (clientGone) break;
      const text = chunk.text;
      if (text) {
        fullText += text;
        sendEvent(res, { text });
      }
      const fr = chunk.candidates?.[0]?.finishReason;
      if (fr) finishReason = String(fr);
    }
    return finishReason;
  };

  // 1) Primeira geração, com fallback em cascata SOMENTE se nada foi enviado ainda
  for (const attempt of attempts) {
    if (clientGone) break;
    try {
      lastFinishReason = await runStream(attempt, [{ role: 'user', parts: [{ text: userPrompt }] }]);
      workingAttempt = attempt;
      break;
    } catch (err: any) {
      lastError = err;
      if (attempt.search) noteSearchFailure(err);
      console.warn(`Model ${attempt.model} (search=${attempt.search}) failed:`, err?.message);
      if (fullText.length > 0) break; // já enviamos parte do texto: não recomeçar do zero
    }
  }

  // 2) Continuação automática quando o modelo parou por limite de tokens OU não atingiu a Duração Alvo
  let rounds = 0;
  while (
    workingAttempt &&
    !clientGone &&
    rounds < MAX_CONTINUATIONS
  ) {
    const currentNarrationWords = calculateNarrationWordCount(fullText);
    const stoppedForTokens = lastFinishReason === 'MAX_TOKENS';
    const isBelowPacing = currentNarrationWords < minRequiredWords && !fullText.includes('## 4. CHECAGEM');

    if (!stoppedForTokens && !isBelowPacing) {
      break; // Pacing atingido ou finalizado com sucesso
    }

    rounds++;
    const wordsRemaining = Math.max(0, targetWordsGoal - currentNarrationWords);

    const continuationInstruction = stoppedForTokens
      ? 'Continue exatamente de onde parou, sem repetir nada do que já foi escrito e sem comentários. Prossiga desenvolvendo os próximos itens ou partes da entrega até atingir a duração alvo completa.'
      : `ATENÇÃO RIGOROSA AO PACING E DURAÇÃO ALVO: Você escreveu ${currentNarrationWords} palavras de narração até aqui, mas a Duração Alvo de ${targetMinutes} minutos exige cerca de ${targetWordsGoal} palavras (faltam aproximadamente ${wordsRemaining} palavras de narração falada).
Continue o roteiro imediatamente a partir de onde parou, aprofundando cada ator, bastidor ou ato restante com riqueza de detalhes, fatos marcantes e a fórmula de idade dupla. Não encerre o roteiro antes de atingir a meta estrita de ${targetWordsGoal} palavras. Prossiga sem repetir o que já foi dito.`;

    try {
      lastFinishReason = await runStream(workingAttempt, [
        { role: 'user', parts: [{ text: userPrompt }] },
        { role: 'model', parts: [{ text: fullText }] },
        {
          role: 'user',
          parts: [
            {
              text: continuationInstruction,
            },
          ],
        },
      ]);
    } catch (err: any) {
      lastError = err;
      console.warn('Continuation failed:', err?.message);
      break;
    }
  }

  if (clientGone) return;

  if (!fullText.trim()) {
    console.warn('All attempts failed, delivering curated fallback script for:', title);
    const fallback = getFallbackScript(title, targetMinutes);
    const chunks = fallback.split('\n\n');
    for (const chunk of chunks) {
      if (clientGone) break;
      fullText += chunk + '\n\n';
      sendEvent(res, { text: chunk + '\n\n' });
      await new Promise((r) => setTimeout(r, 40));
    }
    sendEvent(res, {
      warning: describeError(lastError) + ' O estúdio gerou este roteiro a partir da base estruturada.',
    });
  } else if (lastError && (!workingAttempt || lastFinishReason === 'MAX_TOKENS')) {
    sendEvent(res, {
      warning: `O roteiro pode ter ficado incompleto. ${describeError(lastError)}`,
    });
  } else if (lastFinishReason === 'MAX_TOKENS') {
    sendEvent(res, {
      warning: 'O roteiro atingiu o limite de tamanho e pode estar incompleto no final.',
    });
  }

  sendEvent(res, { done: true });
  res.end();
});

// API route: Fact check actor / soap opera details
app.post('/api/fact-check', async (req, res) => {
  const { query } = req.body || {};
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Termo de pesquisa obrigatório.' });
  }

  // 1. Consulta local instantânea (idades calculadas pela data de hoje)
  const localMatch = findActorLocalData(query);
  if (localMatch) {
    return res.json({ result: localMatch, source: 'Base de Dados Local' });
  }

  const { ano, extenso } = dataDeHoje();
  const prompt = `Responda de forma factual e precisa sobre o ator/atriz ou novela brasileira: "${query.trim()}".
Data de hoje: ${extenso}.
Informe:
- Nome completo e artístico
- Nascimento e idade atual em ${ano} (ou data de falecimento, idade ao morrer e causa, somente se foi divulgada publicamente)
- Principais telenovelas (Globo, Manchete, SBT, Record) e personagens marcantes, com o ano
- Situação atual (o que faz hoje ou homenagem póstuma)
- Fontes de referência (Memória Globo, acervos e imprensa)
Se não tiver certeza de algum dado, escreva [VERIFICAR] ao lado dele. Não invente.`;

  const attempts: Attempt[] = [
    { model: PRIMARY_MODEL, search: false },
    { model: LITE_MODEL, search: false },
    ...(SEARCH_ENABLED && searchAvailable() ? [{ model: PRIMARY_MODEL, search: true }] : []),
  ];

  let lastError: any = null;
  for (const attempt of attempts) {
    try {
      const response = await ai.models.generateContent({
        model: attempt.model,
        contents: prompt,
        config: {
          temperature: 0.2,
          ...(attempt.search ? { tools: [{ googleSearch: {} }] } : {}),
        },
      });
      const text = response.text || '';
      if (!text.trim()) continue;
      return res.json({
        result: text,
        source: attempt.search ? 'Gemini + Busca Google' : 'Gemini AI',
      });
    } catch (err: any) {
      lastError = err;
      if (attempt.search) noteSearchFailure(err);
      console.warn(`Fact-check ${attempt.model} (search=${attempt.search}) failed:`, err?.message);
    }
  }

  const errDesc = describeError(lastError);
  return res.json({
    result: `Dados para "${query.trim()}" (Ano base: ${ano}):\n- ${errDesc}\n- Recomendamos conferir o "Guia de Novelas Clássicas" no menu superior para visualizar o elenco confirmado.`,
    source: 'Base do Estúdio',
  });
});

// Converte PCM 16-bit (formato devolvido pelo TTS do Gemini) em WAV tocável no navegador
function pcmToWav(pcm: Buffer, sampleRate = 24000, channels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

// API route: Generate Audio narration sample (TTS)
app.post('/api/generate-tts', async (req, res) => {
  const { text, voiceName = 'Fenrir' } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Texto para narração é obrigatório.' });
  }

  const cleanText = text
    .replace(/\[(TRECHO DE CENA|IMAGEM|VERIFICAR)[^\]]*\]/gi, '')
    .replace(/^#{1,6}\s.*$/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .slice(0, 600);

  if (!cleanText) {
    return res.status(400).json({ error: 'Não há texto de narração para gerar a voz.' });
  }

  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Leia em português do Brasil, como um narrador sério, nostálgico e envolvente de documentário de TV brasileira:\n\n${cleanText}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const inline = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inline?.data) {
      return res.json({ fallbackSpeech: true, text: cleanText });
    }

    const mime = inline.mimeType || '';
    if (/wav|mpeg|mp3|ogg/i.test(mime)) {
      return res.json({ audioBase64: inline.data, mimeType: mime });
    }

    // PCM cru (ex.: "audio/L16;codec=pcm;rate=24000"): adiciona cabeçalho WAV
    const rate = Number(/rate=(\d+)/i.exec(mime)?.[1]) || 24000;
    const wav = pcmToWav(Buffer.from(inline.data, 'base64'), rate);
    res.json({ audioBase64: wav.toString('base64'), mimeType: 'audio/wav' });
  } catch (error: any) {
    console.warn('TTS error, signaling browser speech synthesis fallback:', error?.message);
    res.json({
      fallbackSpeech: true,
      text: cleanText,
      message: 'Usando a voz do navegador porque o TTS do Gemini não respondeu (possível limite de cota).',
    });
  }
});

// Vite middleware for dev or static files for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
