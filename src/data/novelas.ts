import { StructureInfo } from '../types';

export const STRUCTURES: StructureInfo[] = [
  {
    id: 'B',
    name: 'Estrutura B — Lista Corrida',
    subtitle: 'Elencos, "Por Onde Andam", "Que Já Partiram"',
    durationRange: '15 a 25 min',
    itemsRange: '8 a 50 atores',
    description: 'Sem números falados. Conectores fluídos ("Já...", "Quem também..."). Fórmula obrigatória da idade dupla: "Aos [X] anos interpretou... Hoje, aos [Y] anos..."',
    idealFor: [
      '[N] ANOS DEPOIS: POR ONDE ANDAM [N] ATORES DE [NOVELA]',
      '[N] ATORES DE [NOVELA] QUE JÁ MORRERAM',
      'FALIDAS, ESQUECIDAS E MAIS: [N] MUSAS HOJE',
      '[N] ATORES QUE SÃO PAIS E FILHOS NA VIDA REAL',
    ],
  },
  {
    id: 'A',
    name: 'Estrutura A — Contagem Regressiva',
    subtitle: 'Musas que partiram, Mansões, Fim trágico',
    durationRange: '28 a 33 min',
    itemsRange: '15 a 20 itens',
    description: 'Contagem regressiva de [N] até 1. Cada item com 1:30 a 2:30 min. Bloco A completo, ganchos com teaser, CTA pedágio de TV aos 40% e Top 1 emocionante.',
    idealFor: [
      '[N] MUSAS DA TV QUE JÁ NOS DEIXARAM: O DESTINO TRÁGICO',
      '[N] MANSÕES ABANDONADAS DOS FAMOSOS',
      '[N] FAMOSOS QUE MORRERAM AO VIVO NO PALCO',
      '[N] GALÃS DOS ANOS 80 QUE NINGUÉM RECONHECE HOJE',
    ],
  },
  {
    id: 'C',
    name: 'Estrutura C — Perfil em Capítulos',
    subtitle: 'Uma pessoa ou imóvel de luxo/abandonado',
    durationRange: '15 a 30 min',
    itemsRange: '6 a 10 capítulos',
    description: 'História aprofundada com 3 revelações prometidas no gancho. Cada capítulo com 2 a 3 min e gancho para o próximo. Declarações reais com veículo e ano.',
    idealFor: [
      'POR DENTRO DA MANSÃO DE [VALOR] DE [PESSOA]',
      'AOS [X] ANOS, [PESSOA] FINALMENTE ADMITE...',
      'RECLUSA HÁ [N] ANOS, [PESSOA] QUEBRA O SILÊNCIO',
    ],
  },
  {
    id: 'D',
    name: 'Estrutura D — Documentário em Atos',
    subtitle: 'Trajetórias completas e biografias dramáticas',
    durationRange: '40 a 60 min',
    itemsRange: '5 Atos dramáticos',
    description: 'Abre no momento mais dramático e volta no tempo. Ato 1 Origem, Ato 2 Ascensão, Ato 3 Bastidores, Ato 4 Queda/Tragédia, Ato 5 O que ficou. Sem acusações infundadas.',
    idealFor: [
      'ASSIM FOI A VIDA DE [PESSOA] — O SEGREDO QUE...',
      'A VERDADE SOBRE AS ÚLTIMAS HORAS DE [PESSOA]',
    ],
  },
];

export interface PresetTopic {
  title: string;
  structure: 'A' | 'B' | 'C' | 'D';
  durationMinutes: number;
  category: string;
  observations: string;
}

export const PRESET_TOPICS: PresetTopic[] = [
  {
    title: '30 ANOS DEPOIS: POR ONDE ANDAM 15 ATORES DE O REI DO GADO HOJE',
    structure: 'B',
    durationMinutes: 20,
    category: 'Elenco Anos Depois',
    observations: 'Novela exibida em 1996 pela TV Globo. Focar na fórmula da idade dupla dos atores (idade em 1996 vs idade atual), citar nomes como Antônio Fagundes, Patrícia Pillar, Raul Cortez, Fábio Assunção, Glória Pires, Silvia Pfeifer, Carlos Vereza e Almir Sater. Destacar quem ainda atua e quem vive no campo.',
  },
  {
    title: '14 ATORES DE CHOCOLATE COM PIMENTA QUE JÁ NOS DEIXARAM: O FIM TRÁGICO',
    structure: 'B',
    durationMinutes: 18,
    category: 'Que Já Partiram',
    observations: 'Novela exibida em 2003 pela Globo. Homenagear os atores saudosos com respeito e elegância: Cláudio Corrêa e Castro (Conde Klaus), Jorge Fernando (Crispim), Miriam Pires, Hilda Rebello, Lucy Mafra, etc. Indicar ano e causa divulgada.',
  },
  {
    title: 'FALIDAS, ESQUECIDAS E RECLUSAS: 12 MUSAS DOS ANOS 90 QUE SUMIRAM DA GLOBO',
    structure: 'A',
    durationMinutes: 25,
    category: 'Musas & Esquecidas',
    observations: 'Contagem regressiva de 12 a 1. Mostrar atrizes que marcaram os anos 90 e optaram por viver longe da fama ou enfrentaram dificuldades financeiras e de saúde. Usar a CTA de quem assiste pela TV da sala aos 40%.',
  },
  {
    title: 'POR DENTRO DA MANSÃO ABANDONADA DE CLODOVIL HERNANDES EM UBATUBA',
    structure: 'C',
    durationMinutes: 20,
    category: 'Mansões & Patrimônio',
    observations: 'Perfil em 7 capítulos sobre a famosa mansão de Clodovil na praia do Léo em Ubatuba: valor estimado, leilões frustrados, ruína da natureza, cômodos lendários, vaso sanitário ao ar livre e a memória do estilista e apresentador.',
  },
  {
    title: 'A VERDADE SOBRE A VIDA E AS ÚLTIMAS HORAS DE LEILA DINIZ — O DESTINO DA MUSA',
    structure: 'D',
    durationMinutes: 45,
    category: 'Documentário',
    observations: 'Documentário em 5 Atos. A revolução de Leila nos anos 60 e 70, a gravidez de biquíni em Ipanema, o sucesso na TV e cinema, o fatídico voo 407 da Japan Airlines em Nova Déli em 1972 aos 27 anos, e o legado eterno.',
  },
  {
    title: '12 ATORES DE NOVELAS QUE SÃO PAIS E FILHOS NA VIDA REAL E VOCÊ NÃO SABIA',
    structure: 'B',
    durationMinutes: 15,
    category: 'Na Vida Real',
    observations: 'Variação em dupla da Estrutura B. Apresentar o auge do veterano, a revelação do parentesco e como os dois estão hoje. Exemplos: Tarcísio Meira e Tarcísio Filho, Débora Duarte e Paloma Duarte, Bruno Fagundes e Antônio Fagundes.',
  },
];

export interface NovelaReference {
  nome: string;
  ano: number;
  emissora: string;
  autor: string;
  destaques: string;
}

export const NOVELAS_DATABASE: NovelaReference[] = [
  { nome: 'O Rei do Gado', ano: 1996, emissora: 'TV Globo', autor: 'Benedito Ruy Barbosa', destaques: 'Antônio Fagundes, Patrícia Pillar, Raul Cortez, Glória Pires, Fábio Assunção' },
  { nome: 'Chocolate com Pimenta', ano: 2003, emissora: 'TV Globo', autor: 'Walcyr Carrasco', destaques: 'Mariana Ximenes, Murilo Benício, Priscila Fantin, Cláudio Corrêa e Castro' },
  { nome: 'Senhora do Destino', ano: 2004, emissora: 'TV Globo', autor: 'Aguinaldo Silva', destaques: 'Susana Vieira, Renata Sorrah (Nazaré Tedesco), José Wilker, Carolina Dieckmann' },
  { nome: 'Vale Tudo', ano: 1988, emissora: 'TV Globo', autor: 'Gilberto Braga, Aguinaldo Silva, Leonor Bassères', destaques: 'Regina Duarte, Glória Pires (Maria de Fátima), Beatriz Segall (Odete Roitman)' },
  { nome: 'Tieta', ano: 1989, emissora: 'TV Globo', autor: 'Aguinaldo Silva, Ricardo Linhares, Ana Maria Moretzsohn', destaques: 'Betty Faria, Joana Fomm (Perpétua), José Mayer, Ary Fontoura' },
  { nome: 'Mulheres de Areia', ano: 1993, emissora: 'TV Globo', autor: 'Ivani Ribeiro', destaques: 'Glória Pires (Ruth e Raquel), Guilherme Fontes (Marcos), Marcos Frota (Tonho da Lua)' },
  { nome: 'Roque Santeiro', ano: 1985, emissora: 'TV Globo', autor: 'Dias Gomes, Aguinaldo Silva', destaques: 'Regina Duarte (Viúva Porcina), Lima Duarte (Sinhozinho Malta), José Wilker' },
  { nome: 'Por Amor', ano: 1997, emissora: 'TV Globo', autor: 'Manoel Carlos', destaques: 'Regina Duarte (Helena), Gabriela Duarte (Eduarda), Antonio Fagundes, Vivianne Pasmanter' },
  { nome: 'Laços de Família', ano: 2000, emissora: 'TV Globo', autor: 'Manoel Carlos', destaques: 'Vera Fischer, Carolina Dieckmann (Camila), Reynaldo Gianecchini, Deborah Secco' },
  { nome: 'A Viagem', ano: 1994, emissora: 'TV Globo', autor: 'Ivani Ribeiro', destaques: 'Christiane Torloni, Antônio Fagundes, Guilherme Fontes (Alexandre), Maurício Mattar' },
  { nome: 'Pantanal', ano: 1990, emissora: 'Rede Manchete', autor: 'Benedito Ruy Barbosa', destaques: 'Cristiana Oliveira (Juma), Claudio Marzo (José Leôncio), Marcos Winter, Paulo Gorgulho' },
  { nome: 'Renascer', ano: 1993, emissora: 'TV Globo', autor: 'Benedito Ruy Barbosa', destaques: 'Antônio Fagundes (José Inocêncio), Marcos Palmeira, Adriana Esteves (Mariana)' },
  { nome: 'Terra Nostra', ano: 1999, emissora: 'TV Globo', autor: 'Benedito Ruy Barbosa', destaques: 'Thiago Lacerda (Matteo), Ana Paula Arósio (Giuliana), Raul Cortez, Maria Fernanda Cândido' },
  { nome: 'Vamp', ano: 1991, emissora: 'TV Globo', autor: 'Antônio Calmon', destaques: 'Cláudia Ohana (Natasha), Ney Latorraca (Conde Vlad), Reginaldo Faria, Fábio Assunção' },
  { nome: 'Que Rei Sou Eu?', ano: 1989, emissora: 'TV Globo', autor: 'Cassiano Gabus Mendes', destaques: 'Edson Celulari (Jean Pierre), Giulia Gam, Tereza Rachel, Antônio Abujamra' },
  { nome: 'Alma Gêmea', ano: 2005, emissora: 'TV Globo', autor: 'Walcyr Carrasco', destaques: 'Priscila Fantin (Serena), Eduardo Moscovis (Rafael), Flávia Alessandra (Débora)' },
  { nome: 'Xica da Silva', ano: 1996, emissora: 'Rede Manchete', autor: 'Walcyr Carrasco (Adamo Angel)', destaques: 'Taís Araújo, Victor Wagner, Drica Moraes (Violante), Zezé Motta' },
  { nome: 'Dona Beija', ano: 1986, emissora: 'Rede Manchete', autor: 'Wilson Aguiar Filho', destaques: 'Maitê Proença, Gracindo Júnior, Edson Celulari, Maria Fernanda' },
  { nome: 'Éramos Seis', ano: 1994, emissora: 'SBT', autor: 'Silvio de Abreu, Rubens Ewald Filho', destaques: 'Irene Ravache (Dona Lola), Othon Bastos, Tarcísio Filho, Jussara Freire' },
  { nome: 'A Escrava Isaura', ano: 1976, emissora: 'TV Globo', autor: 'Gilberto Braga', destaques: 'Lucélia Santos (Isaura), Rubens de Falco (Leôncio), Léa Garcia, Edwin Luisi' },
];
