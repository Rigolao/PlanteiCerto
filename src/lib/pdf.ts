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
  doc.setFont('helvetica', 'bold');
  doc.text('PlanteiCerto', m, 16);

  setText(doc, COLORS.muted);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
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
  doc.setFont('helvetica', 'bold');
  doc.text(project.nome, m + 6, y + 10);

  setText(doc, COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (project.descricao) {
    const desc = doc.splitTextToSize(project.descricao, contentW - 12);
    doc.text(desc, m + 6, y + 16);
  }
  
  const locRaw = `${points.length} árvores mapeadas | Coordenadas: ${project.centro_lat.toFixed(4)}, ${project.centro_lng.toFixed(4)}`;
  setText(doc, COLORS.muted);
  doc.text(locRaw, m + 6, y + 24);

  y += 34;

  // ─── Resumo Ambiental (Dashboard Stats) ──────────────────────────────────
  let nativasCount = 0;
  let areaCopa = 0;
  const especiesUnicas = new Set<number>();
  points.forEach(p => {
    const t = trees.find(x => x.id === p.tree_id);
    if (!t) return;
    especiesUnicas.add(t.id);
    if (t.origem === 'Nativa BR') nativasCount++;
    if (t.diametro_copa_adulto_max_m) {
      areaCopa += Math.PI * Math.pow(t.diametro_copa_adulto_max_m / 2, 2);
    }
  });
  const nativasPct = points.length > 0 ? Math.round((nativasCount / points.length) * 100) : 0;

  setText(doc, COLORS.text);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Estatísticas e Impacto Ambiental', m, y);
  
  y += 6;
  
  // Caixas de estatísticas
  const statBoxW = (contentW - 10) / 3;
  
  // Box 1: Diversidade
  setFill(doc, [248, 250, 248]);
  setDraw(doc, COLORS.border);
  doc.roundedRect(m, y, statBoxW, 16, 2, 2, 'FD');
  setText(doc, COLORS.muted);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('DIVERSIDADE', m + 4, y + 6);
  setText(doc, COLORS.primary);
  doc.setFontSize(12);
  doc.text(`${especiesUnicas.size} Espécies`, m + 4, y + 12);

  // Box 2: Copas
  setFill(doc, [248, 250, 248]);
  setDraw(doc, COLORS.border);
  doc.roundedRect(m + statBoxW + 5, y, statBoxW, 16, 2, 2, 'FD');
  setText(doc, COLORS.muted);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('COBERTURA DE COPA', m + statBoxW + 9, y + 6);
  setText(doc, COLORS.primary);
  doc.setFontSize(12);
  doc.text(`${Math.round(areaCopa || 0)} m²`, m + statBoxW + 9, y + 12);

  // Box 3: Nativas
  setFill(doc, [248, 250, 248]);
  setDraw(doc, COLORS.border);
  doc.roundedRect(m + (statBoxW * 2) + 10, y, statBoxW, 16, 2, 2, 'FD');
  setText(doc, COLORS.muted);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('ORIGEM (NATIVAS)', m + (statBoxW * 2) + 14, y + 6);
  setText(doc, COLORS.primary);
  doc.setFontSize(12);
  doc.text(`${nativasPct}% Nativas`, m + (statBoxW * 2) + 14, y + 12);

  y += 24;

  // ─── Mapa com Bordas Arredondadas ─────────────────────────────────────────
  try {
    const canvas = await html2canvas(mapElement, {
      useCORS: true,
      scale: 2,
      logging: false,
      backgroundColor: null,
      ignoreElements: (el) => {
        try {
          if (!el) return false;
          if (el.classList && typeof el.classList.contains === 'function') {
            return el.classList.contains('leaflet-control-container') || 
                   el.classList.contains('leaflet-control') ||
                   el.classList.contains('absolute');
          }
          return false;
        } catch (e) {
          return false;
        }
      }
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    
    // Calcula Aspect Ratio seguro (Sem esmagar imagem)
    const aspectRatio = canvas.height / canvas.width;
    let renderW = contentW;
    let renderH = renderW * aspectRatio;

    // Se o mapa for muito alto (Ex: Tela de celular em pé)
    if (renderH > 90) {
      renderH = 90;
      renderW = renderH / aspectRatio;
    }

    // Centralizar no Eixo X caso a largura tenha encolhido
    const xPos = m + (contentW - renderW) / 2;

    setDraw(doc, COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(xPos, y, renderW, renderH, 2, 2, 'D');
    doc.addImage(imgData, 'JPEG', xPos, y, renderW, renderH);
    y += renderH + 12;
  } catch (err) {
    console.warn('Falha ao capturar mapa:', err);
    setDraw(doc, COLORS.border);
    setFill(doc, [250, 250, 250]);
    doc.roundedRect(m, y, contentW, 40, 2, 2, 'FD');
    setText(doc, COLORS.muted);
    doc.setFontSize(8);
    doc.text('Visualização do mapa indisponível neste relatório.', pageW / 2, y + 20, { align: 'center' });
    y += 48;
  }

  // ─── Lista de Árvores de Plantio ────────────────────────────────────────────────────
  setText(doc, COLORS.text);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Lista de Plantio e Coordenadas', m, y);
  
  y += 8;

  // Cabeçalho da Tabela
  const cols = {
    nome: m,            // 16
    nativa: m + 65,     // 81
    coordenadas: m + 90,// 106
    altura: m + 135,    // 151
    copa: m + 160,      // 176
  };

  setFill(doc, [250, 250, 250]);
  doc.rect(m, y, contentW, 8, 'F');
  setDraw(doc, COLORS.border);
  doc.line(m, y, m + contentW, y);
  doc.line(m, y + 8, m + contentW, y + 8);

  setText(doc, COLORS.muted);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  const headerY = y + 5;
  doc.text('ESPÉCIE', cols.nome, headerY);
  doc.text('ORIGEM', cols.nativa, headerY);
  doc.text('LAT(Y) / LNG(X)', cols.coordenadas, headerY);
  doc.text('ALTURA MÁX', cols.altura, headerY);
  doc.text('COPA MÁX', cols.copa, headerY);
  
  y += 8;

  // Linhas da Tabela
  const rowH = 15;
  
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const tree = trees.find(t => t.id === point.tree_id);
    if (!tree) continue;

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
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      const hdrY = y + 5;
      doc.text('ESPÉCIE', cols.nome, hdrY);
      doc.text('ORIGEM', cols.nativa, hdrY);
      doc.text('LAT(Y) / LNG(X)', cols.coordenadas, hdrY);
      doc.text('ALTURA MÁX', cols.altura, hdrY);
      doc.text('COPA MÁX', cols.copa, hdrY);

      y += 8;
    }

    setDraw(doc, [245, 245, 245]);
    doc.line(m, y + rowH, m + contentW, y + rowH);

    // Alinhamento Y Centralizado para todos os blocos de texto
    const textBaseY = y + 6.5;

    // Coluna 1: Nome Popular e Cientifico
    setText(doc, COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const splitName = doc.splitTextToSize(tree.nome_popular, 62);
    doc.text(splitName, cols.nome, textBaseY);

    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    const splitSci = doc.splitTextToSize(tree.nome_cientifico, 62);
    // Para simplificar e reduzir altura vertical no rowH curto, colocar logo na linha abaixo.
    doc.text(splitSci, cols.nome, textBaseY + 3.5);

    // Coluna 2: Nativa
    setText(doc, COLORS.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const isNativa = tree.origem === 'Nativa BR';
    if (isNativa) {
        setText(doc, COLORS.primary);
        doc.setFont('helvetica', 'bold');
        doc.text('Brasil', cols.nativa, textBaseY + 1.5);
    } else {
        doc.text('Exótica', cols.nativa, textBaseY + 1.5);
    }

    // Coluna 3: Coordenadas
    setText(doc, COLORS.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const coordStr1 = `Lat: ${point.lat.toFixed(6)}`;
    const coordStr2 = `Lng: ${point.lng.toFixed(6)}`;
    doc.text(coordStr1, cols.coordenadas, textBaseY);
    doc.text(coordStr2, cols.coordenadas, textBaseY + 3.5);

    // Colunas de Porte
    doc.setFontSize(7);
    const adultoStr = `${tree.altura_adulta_max_m ? tree.altura_adulta_max_m + 'm' : '—'}`;
    const copaStr = `${tree.diametro_copa_adulto_max_m ? tree.diametro_copa_adulto_max_m + 'm' : '—'}`;
    doc.text(adultoStr, cols.altura, textBaseY + 2);
    doc.text(copaStr, cols.copa, textBaseY + 2);

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
  doc.setFont('helvetica', 'normal');
  doc.text('PlanteiCerto - Democratizando a arborização urbana', m, footerY);
  
  // @ts-expect-error jsPDF internal API
  const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
  doc.text(`Página ${pageNumber}`, pageW / 2, footerY, { align: 'center' });
  doc.text('www.planteicerto.com.br', pageW - m, footerY, { align: 'right' });
}
