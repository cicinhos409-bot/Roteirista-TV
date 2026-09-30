export interface ActorBio {
  nome: string;
  aliases: string[];
  nascimento: string;
  idade2026: number;
  falecimento?: {
    data: string;
    idade: number;
    causa: string;
  };
  novelasMarcantes: {
    ano: number;
    novela: string;
    personagem: string;
    emissora: string;
  }[];
  situacaoAtual: string;
  fontes: string[];
}

export const ACTORS_DATABASE: ActorBio[] = [
  {
    nome: 'Antônio Fagundes',
    aliases: ['fagundes', 'antonio fagundes'],
    nascimento: '18/04/1949',
    idade2026: 77,
    novelasMarcantes: [
      { ano: 1996, novela: 'O Rei do Gado', personagem: 'Bruno Mezenga / Antonio Mezenga', emissora: 'TV Globo' },
      { ano: 1993, novela: 'Renascer', personagem: 'José Inocêncio', emissora: 'TV Globo' },
      { ano: 1997, novela: 'Por Amor', personagem: 'Atílio', emissora: 'TV Globo' },
      { ano: 1979, novela: 'Carga Pesada', personagem: 'Pedro', emissora: 'TV Globo' },
      { ano: 2019, novela: 'Bom Sucesso', personagem: 'Alberto Prado Monteiro', emissora: 'TV Globo' },
    ],
    situacaoAtual: 'Ativo no teatro e streaming, produzindo peças aclamadas em São Paulo e mantendo canal cultural na internet.',
    fontes: ['Memória Globo', 'Enciclopédia Itaú Cultural', 'Entrevistas públicas'],
  },
  {
    nome: 'Patrícia Pillar',
    aliases: ['patricia pillar', 'pillar'],
    nascimento: '11/01/1964',
    idade2026: 62,
    novelasMarcantes: [
      { ano: 1996, novela: 'O Rei do Gado', personagem: 'Luana / Marieta Berdinazzi', emissora: 'TV Globo' },
      { ano: 2008, novela: 'A Favorita', personagem: 'Flora Pereira da Silva', emissora: 'TV Globo' },
      { ano: 1993, novela: 'Renascer', personagem: 'Eliana', emissora: 'TV Globo' },
      { ano: 1986, novela: 'Sinhá Moça', personagem: 'Sinhá Moça', emissora: 'TV Globo' },
    ],
    situacaoAtual: 'Atriz e diretora premiada, atua em projetos seletos de cinema, documentários e produções de streaming.',
    fontes: ['Memória Globo', 'Portal Arte e Cultura'],
  },
  {
    nome: 'Raul Cortez',
    aliases: ['raul cortez'],
    nascimento: '28/08/1932',
    idade2026: 94,
    falecimento: {
      data: '18/07/2006',
      idade: 73,
      causa: 'Complicações decorrentes de câncer no pâncreas e intestino',
    },
    novelasMarcantes: [
      { ano: 1996, novela: 'O Rei do Gado', personagem: 'Geremias Berdinazzi', emissora: 'TV Globo' },
      { ano: 1999, novela: 'Terra Nostra', personagem: 'Francesco Magliano', emissora: 'TV Globo' },
      { ano: 1993, novela: 'Mulheres de Areia', personagem: 'Virgílio Assunção', emissora: 'TV Globo' },
      { ano: 2002, novela: 'Esperança', personagem: 'Genaro', emissora: 'TV Globo' },
    ],
    situacaoAtual: 'Falecido em 2006. Considerado um dos maiores atores da história do teatro e da televisão brasileira.',
    fontes: ['Hospital Sírio-Libanês (Boletim 2006)', 'Memória Globo'],
  },
  {
    nome: 'Cláudio Corrêa e Castro',
    aliases: ['claudio correa e castro', 'claudio correa', 'conde klaus'],
    nascimento: '27/02/1928',
    idade2026: 98,
    falecimento: {
      data: '16/08/2005',
      idade: 77,
      causa: 'Falência múltipla de órgãos após complicações cardíacas',
    },
    novelasMarcantes: [
      { ano: 2003, novela: 'Chocolate com Pimenta', personagem: 'Conde Klaus Von Burgo', emissora: 'TV Globo' },
      { ano: 2000, novela: 'O Cravo e a Rosa', personagem: 'Normando Cordeiro', emissora: 'TV Globo' },
      { ano: 1993, novela: 'A Viagem', personagem: 'Daniel', emissora: 'TV Globo' },
      { ano: 1989, novela: 'Tieta', personagem: 'Padre Mariano', emissora: 'TV Globo' },
    ],
    situacaoAtual: 'Falecido em 2005 no Rio de Janeiro. Deixou legado com mais de 40 telenovelas marcantes.',
    fontes: ['Obituário Folha de S.Paulo', 'Memória Globo'],
  },
  {
    nome: 'Glória Pires',
    aliases: ['gloria pires'],
    nascimento: '23/08/1963',
    idade2026: 63,
    novelasMarcantes: [
      { ano: 1993, novela: 'Mulheres de Areia', personagem: 'Ruth e Raquel Araújo', emissora: 'TV Globo' },
      { ano: 1988, novela: 'Vale Tudo', personagem: 'Maria de Fátima Accioli', emissora: 'TV Globo' },
      { ano: 1996, novela: 'O Rei do Gado', personagem: 'Rafaela Berdinazzi', emissora: 'TV Globo' },
      { ano: 2023, novela: 'Terra e Paixão', personagem: 'Irene La Selva', emissora: 'TV Globo' },
    ],
    situacaoAtual: 'Trabalhando em projetos independentes, cinema nacional e plataformas de streaming.',
    fontes: ['Memória Globo', 'Biografia Oficial'],
  },
  {
    nome: 'Clodovil Hernandes',
    aliases: ['clodovil', 'mansao de clodovil'],
    nascimento: '17/06/1937',
    idade2026: 89,
    falecimento: {
      data: '17/03/2009',
      idade: 71,
      causa: 'Acidente vascular cerebral (AVC) hemorrágico',
    },
    novelasMarcantes: [
      { ano: 1980, novela: 'TV Mulher / Noite de Gala', personagem: 'Apresentador e estilista', emissora: 'TV Globo / Rede Manchete / RedeTV' },
    ],
    situacaoAtual: 'Falecido em 2009. Sua mansão lendária na praia do Léo em Ubatuba permaneceu em disputa judicial e foi a leilão por diversas ocasiões.',
    fontes: ['Folha de S.Paulo', 'G1', 'Tribunal de Justiça de SP'],
  },
  {
    nome: 'Leila Diniz',
    aliases: ['leila diniz'],
    nascimento: '25/03/1945',
    idade2026: 81,
    falecimento: {
      data: '14/06/1972',
      idade: 27,
      causa: 'Acidente aéreo do voo Japan Airlines 407 em Nova Déli, Índia',
    },
    novelasMarcantes: [
      { ano: 1965, novela: 'Ilusões Perdidas', personagem: 'Lígia', emissora: 'TV Globo' },
      { ano: 1969, novela: 'Vidas em Conflito', personagem: 'Mônica', emissora: 'TV Excelsior' },
    ],
    situacaoAtual: 'Falecida tragicamente em 1972 aos 27 anos. Ícone eterno da revolução comportamental e liberdade feminina no Brasil.',
    fontes: ['Acervo O Globo', 'Jornal do Brasil', 'Dicionário da MPB e TV'],
  },
  {
    nome: 'Fábio Assunção',
    aliases: ['fabio assuncao', 'fabio assunção'],
    nascimento: '10/08/1971',
    idade2026: 55,
    novelasMarcantes: [
      { ano: 1996, novela: 'O Rei do Gado', personagem: 'Marcos Mezenga', emissora: 'TV Globo' },
      { ano: 1997, novela: 'Por Amor', personagem: 'Marcelo de Barros Mota', emissora: 'TV Globo' },
      { ano: 1993, novela: 'Sonho Meu', personagem: 'Jorge', emissora: 'TV Globo' },
      { ano: 2022, novela: 'Todas as Flores', personagem: 'Humberto', emissora: 'Globoplay' },
    ],
    situacaoAtual: 'Ativo e premiado na televisão, cinema e teatro. Formou-se em Ciências Sociais e mantém carreira produtiva.',
    fontes: ['Memória Globo', 'Entrevistas Folha de S.Paulo'],
  },
  {
    nome: 'Silvia Pfeifer',
    aliases: ['silvia pfeifer'],
    nascimento: '24/02/1958',
    idade2026: 68,
    novelasMarcantes: [
      { ano: 1996, novela: 'O Rei do Gado', personagem: 'Léia Mezenga', emissora: 'TV Globo' },
      { ano: 1990, novela: 'Meu Bem, Meu Mal', personagem: 'Isadora Venturini', emissora: 'TV Globo' },
      { ano: 1994, novela: 'Tropicaliente', personagem: 'Letícia', emissora: 'TV Globo' },
    ],
    situacaoAtual: 'Atua em peças de teatro, novelas em Portugal e produções de streaming, mantendo vida discreta no Rio de Janeiro.',
    fontes: ['Memória Globo', 'Imprensa Portuguesa'],
  },
  {
    nome: 'Ary Fontoura',
    aliases: ['ary fontoura'],
    nascimento: '27/01/1933',
    idade2026: 93,
    novelasMarcantes: [
      { ano: 2003, novela: 'Chocolate com Pimenta', personagem: 'Ludovico Canto e Mello', emissora: 'TV Globo' },
      { ano: 1989, novela: 'Tieta', personagem: 'Coronel Artur da Tapitanga', emissora: 'TV Globo' },
      { ano: 1985, novela: 'Roque Santeiro', personagem: 'Prefeito Florindo Abelha (Seu Flô)', emissora: 'TV Globo' },
      { ano: 1997, novela: 'A Indomada', personagem: 'Deputado Pitágoras', emissora: 'TV Globo' },
    ],
    situacaoAtual: 'Com mais de 90 anos, é um fenômeno vibrante nas redes sociais com milhões de seguidores, além de manter atuações no teatro e TV.',
    fontes: ['Memória Globo', 'Redes Oficiais'],
  },
  {
    nome: 'Jorge Fernando',
    aliases: ['jorge fernando', 'jorginho fernando'],
    nascimento: '29/03/1955',
    idade2026: 71,
    falecimento: {
      data: '27/10/2019',
      idade: 64,
      causa: 'Parada cardíaca em decorrência de dissecção de aorta completa',
    },
    novelasMarcantes: [
      { ano: 2003, novela: 'Chocolate com Pimenta', personagem: 'Diretor de núcleo e ator convidado', emissora: 'TV Globo' },
      { ano: 1991, novela: 'Vamp', personagem: 'Diretor geral', emissora: 'TV Globo' },
      { ano: 1993, novela: 'A Próxima Vítima', personagem: 'Diretor geral', emissora: 'TV Globo' },
      { ano: 2016, novela: 'Êta Mundo Bom!', personagem: 'Diretor geral', emissora: 'TV Globo' },
    ],
    situacaoAtual: 'Falecido em 2019. Foi um dos maiores e mais festejados diretores de dramaturgia e comédia da TV Globo.',
    fontes: ['Hospital Copa Star (Boletim)', 'G1'],
  },
  {
    nome: 'Miriam Pires',
    aliases: ['miriam pires'],
    nascimento: '20/04/1927',
    idade2026: 99,
    falecimento: {
      data: '07/09/2004',
      idade: 77,
      causa: 'Insuficiência respiratória decorrente de toxoplasmose',
    },
    novelasMarcantes: [
      { ano: 2003, novela: 'Chocolate com Pimenta', personagem: 'Dona Hortênsia', emissora: 'TV Globo' },
      { ano: 2004, novela: 'Senhora do Destino', personagem: 'Clementina', emissora: 'TV Globo' },
      { ano: 1989, novela: 'Tieta', personagem: 'Dona Milu', emissora: 'TV Globo' },
    ],
    situacaoAtual: 'Faleceu durante as gravações de Senhora do Destino em 2004, sendo homenageada com a publicação póstuma de seu livro de receitas.',
    fontes: ['Memória Globo', 'Folha de S.Paulo'],
  },
];

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Calcula a idade exata a partir de "dd/mm/aaaa" até a data de referência
function idadeEm(nascimento: string, referencia: Date): number | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(nascimento.trim());
  if (!m) return null;
  const [, d, mo, a] = m.map(Number);
  let idade = referencia.getFullYear() - a;
  const mesRef = referencia.getMonth() + 1;
  if (mesRef < mo || (mesRef === mo && referencia.getDate() < d)) idade--;
  return idade;
}

function parseData(s: string): Date | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s.trim());
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;
}

export function findActorLocalData(query: string): string | null {
  const q = normalizar(query);
  if (q.length < 4) return null;

  // Só casa quando o nome (ou apelido) completo aparece na busca, ou a busca é parte clara do nome
  const matched = ACTORS_DATABASE.find((a) => {
    const nomes = [a.nome, ...a.aliases].map(normalizar);
    return nomes.some((n) => q.includes(n) || (q.length >= 6 && n.includes(q)));
  });

  if (!matched) return null;

  const hoje = new Date();
  let text = `Nome: ${matched.nome}\nData de Nascimento: ${matched.nascimento}\n`;
  if (matched.falecimento) {
    const dataMorte = parseData(matched.falecimento.data);
    const idadeMorte = (dataMorte && idadeEm(matched.nascimento, dataMorte)) ?? matched.falecimento.idade;
    text += `Situação: Saudoso(a) - Faleceu em ${matched.falecimento.data}, aos ${idadeMorte} anos.\nCausa de falecimento divulgada: ${matched.falecimento.causa}.\n`;
  } else {
    const idade = idadeEm(matched.nascimento, hoje) ?? matched.idade2026;
    text += `Situação: Vivo(a) - Idade hoje (${hoje.toLocaleDateString('pt-BR')}): ${idade} anos.\nAtualmente: ${matched.situacaoAtual}\n`;
  }

  text += `\nNovelas de Maior Sucesso:\n`;
  matched.novelasMarcantes.forEach((n) => {
    const idadeNaEpoca = idadeEm(matched.nascimento, new Date(n.ano, 6, 1));
    text += `- ${n.novela} (${n.ano}, ${n.emissora}) - Papel: ${n.personagem}${idadeNaEpoca !== null ? ` - tinha cerca de ${idadeNaEpoca} anos` : ''}\n`;
  });

  text += `\nFontes Consultadas: ${matched.fontes.join(', ')}`;
  text += `\n\nObservação: dados da base local do app. Para informações muito recentes, confirme em fontes atualizadas.`;
  return text;
}
