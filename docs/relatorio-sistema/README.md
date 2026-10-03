# Relatório do Sistema PlanteiCerto

Documentação completa de telas, fluxos, arquitetura, modelo de dados e algoritmo de recomendação,
gerada automaticamente em 10/09/2026 a partir do código-fonte (commit `0b7b650`) e da execução real
da aplicação (Vite local + Supabase local em Docker com dados de demonstração).

| Arquivo | Conteúdo |
|---|---|
| `PlanteiCerto-Relatorio-Sistema.pdf` | Relatório principal (A4, ~249 páginas, 222 capturas de tela, 5 diagramas, sumário e bookmarks). Texto pesquisável; cada captura tem descrição textual. |
| `anexo-relatorio-projeto-gerado-pelo-app.pdf` | Exemplo real do PDF de projeto gerado pela própria aplicação (jsPDF), citado no capítulo "Relatório PDF do projeto". |
| `verificacao.txt` | Saída do verificador automático (páginas, tamanho, extração de texto, bookmarks, cobertura das capturas, varredura de segredos). |
| `fontes-relatorio.zip` | Fontes para regenerar: capítulos em Markdown (`capitulos/`), imagens (`shots-web/`), scripts Playwright de captura (`flows/`, `harness/`, `setup/`), manifestos, dumps do banco e o HTML montado. |

## Como foi gerado

1. Stack local: `npx supabase start` + migrations + `seed.sql` (167 espécies). Fotos reapontadas para o storage
   de produção; 12 PDFs de guias/critérios copiados para o storage local; 4 contas e 2 projetos de demonstração.
2. Capturas: Playwright 1.62 (Chromium headless), viewports 1440×900 (desktop) e 390×844 (mobile), temas claro e escuro.
3. Redação: capítulos em Markdown por área (público, recomendação, projetos, administração, técnico).
4. Montagem: Markdown → HTML (marked) → PDF (Chromium `page.pdf`, `outline` + `tagged`), diagramas Mermaid.

Para regenerar apenas o PDF a partir das fontes: descompactar o zip, `npm install` (instala `playwright@1.62.1`,
`marked`, `sharp`), recriar `harness/config.mjs` (ver `docs/README-agentes.md` dentro do zip) e rodar
`node harness/build-pdf.mjs`.

Nenhum arquivo do repositório foi alterado para produzir este relatório. Os dados de demonstração existem
apenas no banco local.
