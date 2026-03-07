import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { Projeto, Ponto } from '../types/project';
import type { Arvore } from '../types/tree';

export async function generateProjectPDF(
  project: Projeto,
  points: Ponto[],
  trees: Arvore[],
  mapElement: HTMLElement
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  // --- Header ---
  doc.setFillColor(46, 125, 50);
  doc.rect(0, 0, pageW, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined as unknown as string, 'bold');
  doc.text('Plantei Certo', pageW / 2, 13, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont(undefined as unknown as string, 'normal');
  doc.text('Relatório de Projeto de Arborização', pageW / 2, 22, { align: 'center' });

  y = 40;

  // --- Project Info ---
  doc.setTextColor(46, 125, 50);
  doc.setFontSize(16);
  doc.setFont(undefined as unknown as string, 'bold');
  doc.text(project.nome, 15, y);
  y += 7;

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont(undefined as unknown as string, 'normal');
  if (project.descricao) {
    doc.text(project.descricao, 15, y);
    y += 5;
  }
  const dataStr = new Date(project.created_at).toLocaleDateString('pt-BR');
  doc.text(`Criado em: ${dataStr}  |  Total de árvores: ${points.length}`, 15, y);
  y += 10;

  // --- Map Capture ---
  try {
    const canvas = await html2canvas(mapElement, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      logging: false,
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    const imgW = pageW - 30;
    const imgH = (canvas.height / canvas.width) * imgW;
    const finalImgH = Math.min(imgH, 110);

    doc.addImage(imgData, 'JPEG', 15, y, imgW, finalImgH);
    y += finalImgH + 10;
  } catch {
    y += 5;
  }

  // --- Tree Table ---
  doc.setTextColor(46, 125, 50);
  doc.setFontSize(13);
  doc.setFont(undefined as unknown as string, 'bold');
  doc.text('Árvores Plantadas', 15, y);
  y += 7;

  // Table header
  doc.setFillColor(232, 245, 233);
  doc.rect(15, y - 4, pageW - 30, 8, 'F');
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(9);
  doc.setFont(undefined as unknown as string, 'bold');
  doc.text('#', 18, y);
  doc.text('Árvore', 28, y);
  doc.text('Calçada', 90, y);
  doc.text('Clima', 115, y);
  doc.text('Observação', 138, y);
  y += 7;

  // Table rows
  doc.setFont(undefined as unknown as string, 'normal');
  doc.setFontSize(9);
  points.forEach((ponto, idx) => {
    const arvore = trees.find(a => a.id === ponto.tree_id);
    if (!arvore) return;

    if (y > 270) {
      doc.addPage();
      y = 15;
    }

    if (idx % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(15, y - 4, pageW - 30, 7, 'F');
    }

    doc.setTextColor(51, 51, 51);
    doc.text(`${idx + 1}`, 18, y);
    doc.setTextColor(46, 125, 50);
    doc.setFont(undefined as unknown as string, 'bold');
    doc.text(arvore.nomePopular, 28, y);
    doc.setFont(undefined as unknown as string, 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text(`${arvore.atributos.compatibilidade.nota}/5`, 90, y);
    doc.text(`${arvore.atributos.clima.nota}/5`, 115, y);
    doc.text(ponto.observacao || '-', 138, y);
    y += 7;
  });

  // --- Footer ---
  y = doc.internal.pageSize.getHeight() - 10;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text(
    `Plantei Certo - Ribeirão Preto | Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
    pageW / 2,
    y,
    { align: 'center' }
  );

  // --- Download ---
  const nomeArquivo = `PlanteiCerto_${project.nome.replace(/\s+/g, '_')}.pdf`;
  doc.save(nomeArquivo);
}
