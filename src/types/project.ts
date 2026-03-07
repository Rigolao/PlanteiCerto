export interface CentroMapa {
  lat: number;
  lng: number;
  zoom: number;
}

export interface Ponto {
  id: string;
  project_id: string;
  tree_id: number;
  lat: number;
  lng: number;
  observacao: string;
  created_at?: string;
}

export interface Projeto {
  id: string;
  user_id: string;
  nome: string;
  descricao: string;
  centro_lat: number;
  centro_lng: number;
  centro_zoom: number;
  created_at: string;
  pontos?: Ponto[];
}
