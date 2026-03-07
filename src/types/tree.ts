export interface Atributo {
  nota: number;
  legenda: string;
  sub: string[];
}

export interface Atributos {
  compatibilidade: Atributo;
  limpeza: Atributo;
  clima: Atributo;
}

export interface Arvore {
  id: number;
  nomePopular: string;
  nomeCientifico: string;
  imagem: string;
  descricao: string;
  altura: string;
  raiz: string;
  espacamento: string;
  atributos: Atributos;
}

export type FiltroAtributo = 'todos' | 'compatibilidade' | 'limpeza' | 'clima';
