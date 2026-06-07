import { useState, useEffect } from 'react';
import { BookOpen, Info, X, Scale, Binary, Hash, FileText, Award } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const getPdfUrl = (filename: string) => `${supabaseUrl}/storage/v1/object/public/guias/${filename}`;
const getCriteriosPdfUrl = (filename: string) => `${supabaseUrl}/storage/v1/object/public/criterios/${filename}`;

const documentosCriterios = [
  {
    id: 'escala-1-5',
    titulo: 'Parametrização Simplificada',
    subtitulo: 'Versão para Leigos',
    descricao: 'Uma explicação em linguagem simples e acessível sobre o funcionamento das escalas de avaliação e critérios das espécies.',
    url: getCriteriosPdfUrl('parametrizacao_simples.pdf'),
  },
  {
    id: 'escala-0-1-numericas',
    titulo: 'Parametrização Técnica',
    subtitulo: 'Detalhamento Avançado',
    descricao: 'Detalhamento explícito sobre as regras, pontuações e parâmetros científicos que definem a avaliação de cada critério.',
    url: getCriteriosPdfUrl('parametrizacao_tecnica.pdf'),
  },
];

const guias = [
  { id: 1, titulo: '1 - Porque as árvores da cidade', url: getPdfUrl('guia1.pdf') },
  { id: 2, titulo: '2 - Onde estão e quantas são as árvores da cidade?', url: getPdfUrl('guia2.pdf') },
  { id: 3, titulo: '3 - Planejando o plantio - o quê e onde plantar', url: getPdfUrl('guia3.pdf') },
  { id: 4, titulo: '4 - Áreas verdes públicas e de preservação', url: getPdfUrl('guia4.pdf') },
  { id: 5, titulo: '5 - Plantando', url: getPdfUrl('guia5.pdf') },
  { id: 6, titulo: '6 - Depois do plantio - mantendo a muda', url: getPdfUrl('guia6.pdf') },
  { id: 7, titulo: '7 - Poda', url: getPdfUrl('guia7.pdf') },
  { id: 8, titulo: '8 - Pragas e doenças em árvores. O que fazer?', url: getPdfUrl('guia8.pdf') },
  { id: 9, titulo: '9 - Extração de árvores urbanas', url: getPdfUrl('guia9.pdf') },
  { id: 10, titulo: '10 - Os resíduos do manejo da arborização urbana', url: getPdfUrl('guia10.pdf') },
];

export function AboutPage() {
  const [selectedPdf, setSelectedPdf] = useState<{ titulo: string; url: string } | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  useEffect(() => {
    if (!selectedPdf) {
      setBlobUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
      return;
    }
    setLoadingPdf(true);
    setBlobUrl(null);
    fetch(selectedPdf.url)
      .then(res => res.blob())
      .then(blob => setBlobUrl(URL.createObjectURL(blob)))
      .catch(() => setBlobUrl(null))
      .finally(() => setLoadingPdf(false));
  }, [selectedPdf]);

  const closePdf = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setSelectedPdf(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <Info className="text-primary w-8 h-8" />
        <h1 className="text-3xl font-serif font-bold text-foreground">Quem Somos</h1>
      </div>

      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border mb-12">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Sobre o PlanteiCerto</h2>
        <div className="prose prose-green dark:prose-invert max-w-none text-muted-foreground space-y-4">
          <p>
            O <strong>PlanteiCerto</strong> é uma plataforma dedicada a auxiliar cidadãos, profissionais e gestores públicos na escolha adequada de espécies arbóreas para o plantio urbano e rural. 
            Nosso objetivo é promover a arborização consciente, garantindo que a árvore certa seja plantada no lugar certo.
          </p>
          <p>
            Acreditamos que a informação é a principal ferramenta para evitar problemas futuros com infraestrutura, fiação elétrica e calçadas, além de maximizar os benefícios ambientais e estéticos que as árvores proporcionam às nossas cidades.
          </p>
        </div>
      </div>

      <div className="mb-12 animate-in fade-in duration-500 delay-100">
        <div className="flex items-center gap-3 mb-6">
          <Award className="text-primary w-7 h-7" />
          <h2 className="text-2xl font-serif font-bold text-foreground">Metodologia e Critérios de Avaliação</h2>
        </div>
        
        <p className="text-muted-foreground mb-8">
          A classificação e pontuação das espécies no <strong>PlanteiCerto</strong> baseiam-se em critérios metodológicos que analisam a compatibilidade urbana e ecológica. Os dados são estruturados em três tipos de escalas para refletir as diferentes características de cada árvore:
        </p>

        {/* Grid de Explicação das Escalas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 a 5 */}
          <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between hover:border-primary/30 hover:shadow-md transition-all duration-300">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Scale size={20} />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Escalas de 1 a 5</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Mensuram graus qualitativos e de tolerância. Utilizada para classificar o nível de resistência a estresses ambientais e potenciais ecológicos ou de impactos urbanos.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 text-xs text-primary font-medium font-mono">
              1 = Muito Baixo | 5 = Muito Alto
            </div>
          </div>

          {/* Card 0 ou 1 */}
          <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between hover:border-primary/30 hover:shadow-md transition-all duration-300">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Binary size={20} />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Escalas de 0 a 1</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Escala binária de presença ou ausência. Define de forma objetiva se a espécie apresenta espinhos, substâncias irritantes ou características específicas de insolação.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 text-xs text-primary font-medium font-mono">
              0 = Não / Ausente | 1 = Sim / Presente
            </div>
          </div>

          {/* Card Numéricas */}
          <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between hover:border-primary/30 hover:shadow-md transition-all duration-300">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Hash size={20} />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Escalas Numéricas</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Valores quantitativos e dimensionais físicos. Indicam medidas técnicas necessárias como largura mínima da calçada, área de berço e recuos para fiação elétrica.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 text-xs text-primary font-medium font-mono">
              Unidades métricas (m, m²) e absolutas
            </div>
          </div>
        </div>

        {/* Links para Documentos Completos */}
        <div className="bg-muted/30 border border-border rounded-2xl p-6">
          <h3 className="font-bold text-foreground mb-4 text-center sm:text-left font-serif">Documentos de Parametrização</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documentosCriterios.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedPdf({ titulo: doc.titulo, url: doc.url })}
                className="flex items-center gap-4 p-4 bg-card hover:bg-muted/70 hover:border-primary/40 transition-all duration-200 rounded-xl border border-border text-left group cursor-pointer w-full"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-primary mb-0.5">{doc.subtitulo}</div>
                  <h4 className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {doc.titulo}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {doc.descricao}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="text-primary w-7 h-7" />
        <h2 className="text-2xl font-serif font-bold text-foreground">Guias de Arborização</h2>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Acesse nossos materiais educativos para aprender mais sobre planejamento, plantio e manutenção de árvores.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {guias.map((guia) => (
          <button
            key={guia.id}
            onClick={() => setSelectedPdf(guia)}
            className="flex flex-col items-start p-5 bg-card hover:bg-muted transition-colors rounded-xl border border-border text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen size={20} />
            </div>
            <h3 className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
              {guia.titulo}
            </h3>
          </button>
        ))}
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closePdf}
          />
          <div className="relative bg-background w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
              <h3 className="font-bold text-foreground pr-8 truncate">
                {selectedPdf.titulo}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={selectedPdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
                >
                  Abrir em nova aba
                </a>
                <button
                  onClick={closePdf}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-muted/30 relative">
              {loadingPdf && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  Carregando...
                </div>
              )}
              {blobUrl && (
                <iframe
                  src={blobUrl}
                  className="w-full h-full border-none"
                  title={selectedPdf.titulo}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
