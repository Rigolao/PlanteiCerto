import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { Projeto, Ponto } from '../types/project';
import type { Arvore } from '../types/tree';

// ── Design System para o PDF ──────────────────────────────────────────────
const COLORS = {
  primary: [34, 100, 55] as const,    // #226437
  secondary: [236, 246, 239] as const, // Accent light
  text: [28, 40, 32] as const,        // Foreground
  muted: [110, 120, 114] as const,    // Muted
  border: [220, 228, 222] as const,   // Border
  white: [255, 255, 255] as const,
  bg: [247, 249, 247] as const,       // Background light
};

function setFill(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setText(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setDraw(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
}



export async function generateProjectPDF(
  project: Projeto,
  points: Ponto[],
  trees: Arvore[],
  mapElement: HTMLElement
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const m = 16; // margem
  const contentW = pageW - (m * 2);
  let y = m;

  // ─── Header Minimalista (Igual ao App) ───────────────────────────────────
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(0, 24, pageW, 24); // Borda inferior do header

  setText(doc, COLORS.text);
  doc.setFontSize(18);
  doc.setFont(undefined as any, 'bold');
  doc.text('PlanteiCerto', m, 16);

  setText(doc, COLORS.muted);
  doc.setFontSize(8);
  doc.setFont(undefined as any, 'normal');
  doc.text('Relatório de Arborização Urbana', m, 21);

  const hoje = new Date().toLocaleDateString('pt-BR');
  doc.text(`Doc: ${hoje}`, pageW - m, 16, { align: 'right' });

  y = 32;

  // ─── Project Info Card ──────────────────────────────────────────────────
  setFill(doc, COLORS.secondary);
  setDraw(doc, COLORS.border);
  doc.roundedRect(m, y, contentW, 28, 3, 3, 'FD');

  setText(doc, COLORS.primary);
  doc.setFontSize(14);
  doc.setFont(undefined as any, 'bold');
  doc.text(project.nome, m + 6, y + 10);

  setText(doc, COLORS.text);
  doc.setFontSize(9);
  doc.setFont(undefined as any, 'normal');
  if (project.descricao) {
    const desc = doc.splitTextToSize(project.descricao, contentW - 12);
    doc.text(desc, m + 6, y + 16);
  }
  
  const stats = `${points.length} arvores mapeadas | Ribeirão Preto, SP`;
  setText(doc, COLORS.muted);
  doc.text(stats, m + 6, y + 24);

  y += 36;

  // ─── Mapa com Bordas Arredondadas ─────────────────────────────────────────
  try {
    const canvas = await html2canvas(mapElement, {
      useCORS: true,
      scale: 2,
      logging: false,
      backgroundColor: null,
      ignoreElements: (el) => {
        // Ignora botões de zoom, atribuições e barra de busca do mapa na foto
        return el.classList.contains('leaflet-control-container') || el.classList.contains('absolute');
      }
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    const imgW = contentW;
    const imgH = Math.min((canvas.height / canvas.width) * imgW, 95);

    setDraw(doc, COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(m, y, imgW, imgH, 2, 2, 'D');
    doc.addImage(imgData, 'JPEG', m, y, imgW, imgH);
    y += imgH + 12;
  } catch (err) {
    console.warn('Falha ao capturar mapa:', err);
    // Placeholder se o mapa falhar (CORS ou erro de renderização)
    setDraw(doc, COLORS.border);
    setFill(doc, [250, 250, 250]);
    doc.roundedRect(m, y, contentW, 40, 2, 2, 'FD');
    setText(doc, COLORS.muted);
    doc.setFontSize(8);
    doc.text('Visualização do mapa indisponível neste relatório.', pageW / 2, y + 20, { align: 'center' });
    y += 48;
  }

  // ─── Lista Unificada de Espécies (Agrupamento) ────────────────────────────────────────────────────
  setText(doc, COLORS.text);
  doc.setFontSize(14);
  doc.setFont(undefined as any, 'bold');
  doc.text('Espécies Selecionadas (Plantio Unificado)', m, y);
  
  y += 8;

  // Agrupar Pontos por Árvore
  const speciesMap = new Map<number, { tree: Arvore, count: number }>();
  points.forEach((point) => {
    const tree = trees.find(t => t.id === point.tree_id);
    if (!tree) return;
    if (!speciesMap.has(tree.id)) {
      speciesMap.set(tree.id, { tree, count: 0 });
    }
    speciesMap.get(tree.id)!.count++;
  });
  
  const groupedSpecies = Array.from(speciesMap.values()).sort((a,b) => b.count - a.count);

  // Cabeçalho da Tabela
  const cols = {
    foto: m,
    nome: m + 20,
    cientifico: m + 70,
    qtd: m + 118,
    nativa: m + 138,
    floracao: m + 155,
  };

  setFill(doc, [250, 250, 250]);
  doc.rect(m, y, contentW, 8, 'F');
  setDraw(doc, COLORS.border);
  doc.line(m, y, m + contentW, y);
  doc.line(m, y + 8, m + contentW, y + 8);

  setText(doc, COLORS.muted);
  doc.setFontSize(7);
  doc.setFont(undefined as any, 'bold');
  const headerY = y + 5;
  doc.text('FOTO DO PORTE', cols.foto + 2, headerY);
  doc.text('ESPÉCIE', cols.nome, headerY);
  doc.text('NOME CIENTÍFICO', cols.cientifico, headerY);
  doc.text('QUANTIDADE', cols.qtd, headerY);
  doc.text('NATIVA BR?', cols.nativa, headerY);
  doc.text('MESES DE FLORAÇÃO', cols.floracao, headerY);
  
  y += 8;

  // Linhas da Tabela
  const rowH = 28; // enough space for multi-line text + photo
  
  for (const item of groupedSpecies) {
    const { tree, count } = item;

    if (y + rowH > pageH - 25) {
      addFooter(doc, pageW, pageH);
      doc.addPage();
      y = m + 10;

      // Re-draw header
      setFill(doc, [250, 250, 250]);
      doc.rect(m, y, contentW, 8, 'F');
      setDraw(doc, COLORS.border);
      doc.line(m, y, m + contentW, y);
      doc.line(m, y + 8, m + contentW, y + 8);

      setText(doc, COLORS.muted);
      doc.setFontSize(7);
      doc.setFont(undefined as any, 'bold');
      const hdrY = y + 5;
      doc.text('FOTO DO PORTE', cols.foto + 2, hdrY);
      doc.text('ESPÉCIE', cols.nome, hdrY);
      doc.text('NOME CIENTÍFICO', cols.cientifico, hdrY);
      doc.text('QUANTIDADE', cols.qtd, hdrY);
      doc.text('NATIVA BR?', cols.nativa, hdrY);
      doc.text('MESES DE FLORAÇÃO', cols.floracao, hdrY);

      y += 8;
    }

    setDraw(doc, [245, 245, 245]);
    doc.line(m, y + rowH, m + contentW, y + rowH);

    // Foto (assíncrona converte pra canvas cover quadrado)
    if (tree.imagem) {
      try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = tree.imagem;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        if (ctx) {
           const scale = Math.max(150 / img.width, 150 / img.height);
           const w = img.width * scale;
           const h = img.height * scale;
           const dx = (150 - w) / 2;
           const dy = (150 - h) / 2;
           
           ctx.drawImage(img, dx, dy, w, h);
           const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
           
           // Apply a simple rounded border logic by just drawing it
           doc.addImage(dataUrl, 'JPEG', cols.foto + 1, y + 3, 16, 16);
           setDraw(doc, COLORS.border);
           doc.roundedRect(cols.foto + 1, y + 3, 16, 16, 1, 1, 'D');
        }
      } catch (err) {
         console.warn("PDF Image load failed for:", tree.imagem);
      }
    }

    const textY = y + 13; // Middle vertical alignment roughly
    const textBaseY = y + 10;

    // Nomes
    setText(doc, COLORS.text);
    doc.setFont(undefined as any, 'bold');
    doc.setFontSize(9);
    const splitName = doc.splitTextToSize(tree.taxonomia.nomeComum, 45);
    doc.text(splitName, cols.nome, textBaseY);
    
    setText(doc, COLORS.muted);
    doc.setFont(undefined as any, 'italic');
    doc.setFontSize(7.5);
    const splitSci = doc.splitTextToSize(tree.taxonomia.nomeBotanico, 43);
    doc.text(splitSci, cols.cientifico, textBaseY);

    // Qtd
    setText(doc, COLORS.primary);
    doc.setFontSize(12);
    doc.setFont(undefined as any, 'bold');
    doc.text(`${count} UN`, cols.qtd, textY);

    // Info Addicionais
    doc.setFontSize(9);
    doc.setFont(undefined as any, 'normal');
    
    // Nativa
    setText(doc, COLORS.text);
    doc.text(tree.taxonomia.nativa ? 'Sim' : 'Não', cols.nativa, textY);

    // Floracao
    const floracaoStr = tree.fenologia?.floracao?.periodo?.join(', ') || 'Desconhecida';
    const splitFlor = doc.splitTextToSize(floracaoStr, 38);
    doc.text(splitFlor, cols.floracao, textBaseY);

    y += rowH;
  }

  // ─── Rodapé ───────────────────────────────────────────────────────────────
  addFooter(doc, pageW, pageH);

  // ─── Download ─────────────────────────────────────────────────────────────
  const fileName = `Relatorio_${project.nome.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

function addFooter(doc: jsPDF, pageW: number, pageH: number) {
  const m = 16;
  const footerY = pageH - 12;
  
  setDraw(doc, COLORS.border);
  doc.line(m, footerY - 4, pageW - m, footerY - 4);
  
  setText(doc, COLORS.muted);
  doc.setFontSize(7);
  doc.setFont(undefined as any, 'normal');
  doc.text('PlanteiCerto - Democratizando a arborização urbana', m, footerY);
  
  const pageNumber = (doc as any).internal.getCurrentPageInfo().pageNumber;
  doc.text(`Página ${pageNumber}`, pageW / 2, footerY, { align: 'center' });
  doc.text('www.planteicerto.com.br', pageW - m, footerY, { align: 'right' });
}
