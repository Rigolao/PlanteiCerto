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

  // ─── Lista de Espécies ────────────────────────────────────────────────────
  setText(doc, COLORS.text);
  doc.setFontSize(12);
  doc.setFont(undefined as any, 'bold');
  doc.text('Espécies Selecionadas', m, y);
  
  y += 6;

  // Cabeçalho da Tabela
  const cols = {
    n: m,
    nome: m + 8,
    cientifico: m + 60,
    calcada: m + 105,
    limpeza: m + 125,
    clima: m + 145,
    obs: m + 165
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
  doc.text('#', cols.n + 2, headerY);
  doc.text('ESPÉCIE', cols.nome, headerY);
  doc.text('NOME CIENTÍFICO', cols.cientifico, headerY);
  doc.text('NATIVA', cols.calcada, headerY);
  doc.text('PAISAGISMO', cols.limpeza, headerY);
  doc.text('ESPINHOS', cols.clima, headerY);
  
  y += 8;

  // Linhas da Tabela
  doc.setFontSize(8);
  points.forEach((point, i) => {
    const tree = trees.find(t => t.id === point.tree_id);
    if (!tree) return;

    if (y > pageH - 25) {
      addFooter(doc, pageW, pageH);
      doc.addPage();
      y = m + 10;
    }

    const rowH = 10;
    
    // Separador
    setDraw(doc, [245, 245, 245]);
    doc.line(m, y + rowH, m + contentW, y + rowH);

    // Número
    setText(doc, COLORS.muted);
    doc.setFont(undefined as any, 'normal');
    doc.text(`${i + 1}`, cols.n + 2, y + 6);

    // Nomes
    setText(doc, COLORS.text);
    doc.setFont(undefined as any, 'bold');
    doc.text(tree.taxonomia.nomeComum, cols.nome, y + 6);
    
    setText(doc, COLORS.muted);
    doc.setFont(undefined as any, 'italic');
    doc.setFontSize(7);
    doc.text(tree.taxonomia.nomeBotanico, cols.cientifico, y + 6);

    // Scores com Texto
    doc.setFontSize(8);
    doc.setFont(undefined as any, 'normal');
    
    // Nativa
    setText(doc, COLORS.text);
    doc.text(tree.taxonomia.nativa ? 'Sim' : 'Não', cols.calcada, y + 6);

    // Paisagismo
    setText(doc, COLORS.text);
    doc.text(tree.usoUrbanismo.recomendadoPaisagismo ? 'Sim' : 'Não', cols.limpeza, y + 6);

    // Espinhos
    setText(doc, COLORS.text);
    doc.text(tree.usoUrbanismo.riscos.espinhos ? 'Sim' : 'Não', cols.clima, y + 6);

    y += rowH;
  });

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
