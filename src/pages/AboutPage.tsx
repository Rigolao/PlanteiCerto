import { useState } from 'react';
import { BookOpen, Info, X } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const getPdfUrl = (filename: string) => `${supabaseUrl}/storage/v1/object/public/guias/${filename}`;

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
            onClick={() => setSelectedPdf(null)}
          />
          <div className="relative bg-background w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
              <h3 className="font-bold text-foreground pr-8 truncate">
                {selectedPdf.titulo}
              </h3>
              <button
                onClick={() => setSelectedPdf(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-muted/30">
              <iframe
                src={selectedPdf.url}
                className="w-full h-full border-none"
                title={selectedPdf.titulo}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
