export interface Taxonomia {
  nomeComum: string;
  outrosNomes: string[];
  nomeBotanico: string;
  sinonimosBotanicos: string[];
  nativa: boolean;
  origem: string[];
}

export interface Ecologia {
  exigenciaLuz: string;
  toleranciaSeca: string;
  toleranciaFrio: string;
  toleranciaAlagamento: string;
  umidadeSolo: string;
  tipoSubstrato: string[];
  profundidadeSolo: string;
  potencialInvasor: boolean;
}

export interface MorfologiaDistribuicao {
  min: number;
  max: number;
  unidade: string;
}

export interface MorfologiaAltura {
  media: MorfologiaDistribuicao;
  maxima: MorfologiaDistribuicao;
}

export interface MorfologiaCrescimento {
  velocidade: string;
  taxaEstimada: string;
}

export interface MorfologiaCopa {
  formato: string[];
  densidade: string | null;
}

export interface MorfologiaTronco {
  multiplosCaules: boolean;
  caracteristica: string;
}

export interface MorfologiaRaizes {
  agressividade: string;
  tipo: string;
}

export interface Morfologia {
  habito: string;
  altura: MorfologiaAltura;
  crescimento: MorfologiaCrescimento;
  copa: MorfologiaCopa;
  tronco: MorfologiaTronco;
  raizes: MorfologiaRaizes;
}

export interface FenologiaFolhagem {
  tipo: string;
  formato: string;
  textura: string[];
}

export interface FenologiaFloracao {
  cor: string;
  periodo: string[];
  valorOrnamental: string;
  inflorescencia: string;
}

export interface FenologiaFrutificacao {
  tipo: string;
  cor: string[];
  dispersao: string;
}

export interface Fenologia {
  folhagem: FenologiaFolhagem;
  floracao: FenologiaFloracao;
  frutificacao: FenologiaFrutificacao;
}

export interface UsoUrbanismoRecomendacoes {
  aves: boolean;
  abelhas: boolean | null;
}

export interface UsoUrbanismoRiscos {
  espinhos: boolean;
  toxicidade: boolean | null;
  quedaFrutos: boolean;
  quebraGalhos: boolean | null;
}

export interface UsoUrbanismo {
  recomendadoPaisagismo: boolean;
  manutencao: string;
  atracaoFauna: UsoUrbanismoRecomendacoes;
  riscos: UsoUrbanismoRiscos;
}

export interface Arvore {
  id: number;
  imagem: string;
  descricao: string;
  taxonomia: Taxonomia;
  ecologia: Ecologia;
  morfologia: Morfologia;
  fenologia: Fenologia;
  usoUrbanismo: UsoUrbanismo;
}

export type FiltroAtributo = 'todos' | 'nativas' | 'paisagismo' | 'sem_espinhos';
