# 🌳 PlanteiCerto

PlanteiCerto é uma aplicação web moderna voltada para o registro, gerenciamento e visualização de plantios de árvores e projetos ambientais. Desenvolvida com uma stack focada em performance e usabilidade, a plataforma permite mapear, acompanhar e extrair relatórios das suas ações em prol do meio ambiente.

## ✨ Funcionalidades Principais
- **Mapeamento de Árvores:** Registro visual e interativo das árvores mapeadas na plataforma utilizando geolocalização e mapas reais.
- **Gerenciamento de Projetos:** Criação de grandes agrupamentos ou campanhas de plantio (projetos) para acompanhar metas globais.
- **Busca e Filtros:** Localização fácil e rápida de árvores específicas usando pesquisa e categorias.
- **Exportação de Relatórios:** Geração instantânea de relatórios em PDF com dados cartográficos e métricas ambientais, muito útil para certificados.

## 🛠️ Tecnologias Utilizadas
- **Frontend:** React 19, TypeScript e Vite.
- **Estilização:** Tailwind CSS v4 para garantir uma navegação fluida e responsiva em qualquer dispositivo.
- **Mapas:** `leaflet` e `react-leaflet`, entregando alto nível de interação no navegador.
- **Exportação (PDF):** Bibliotecas `jspdf` e `html2canvas` para criação de fáceis emitíveis e relatórios gráficos.
- **Base de Dados / Backend:** Supabase (PostgreSQL para dados e regras de segurança na nuvem).

## 🚀 Como rodar o projeto localmente

### 1. Pré-requisitos
Certifique-se de ter as seguintes ferramentas instaladas:
- **[Node.js](https://nodejs.org/)** (recomenda-se a versão mais recente em LTS)
- Gerenciador de pacotes npm (nativo do Node)

### 2. Instalação das Dependências
Após fazer o download/clone do projeto para a sua máquina, abra seu terminal na raiz da pasta do repositório (`PlanteiCerto`) e execute:

```bash
npm install
```

### 3. Configuração do Ambiente e Supabase
Para que as listagens e operações de banco de dados funcionem corretamente, é necessário criar o arquivo de variáveis de ambiente. Você verá que há um arquivo chamado `.env.example` na mesma pasta. 

Basta fazer uma cópia dele e nomear como `.env.local` (ou `.env`).

```bash
# Exemplo de comando no macOS, copiado na raiz do projeto:
cp .env.example .env.local
```

*(O `env.example` já inclui a URL e Chave Pública padrão para que a aplicação de teste estabeleça conexão com o Supabase com as informações iniciais).*

### 4. Executando o Servidor de Desenvolvimento
Com todas as etapas anteriores cumpridas, suba a aplicação:

```bash
npm run dev
```

Você verá no terminal uma mensagem de sucesso indicando em qual endereço o Vite preparou as telas. Geralmente, basta abrir o seu navegador no link: **[http://localhost:5173/](http://localhost:5173/)**

---

### Outros Comandos Úteis
- **Verificar erros no código fonte via Lint:** `npm run lint`
- **Fazer a construção de Produção (Building):** `npm run build`
- **Visualizar como ficará o projeto em Produção:** `npm run preview`

---
*Construindo um amanhã mais verde.* 🌱
