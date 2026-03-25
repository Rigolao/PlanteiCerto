# PlanteiCerto — Guia de Estilo Visual

Padrões visuais definidos no redesign da página de Projetos. Usar como referência para todas as páginas do app.

---

## Princípio geral

O visual do PlanteiCerto é **orgânico e terroso** — tons quentes, formas com peso, hierarquia clara. Evitar qualquer padrão que pareça "template de IA": botões pill, gradientes decorativos, simetria previsível, tudo com o mesmo peso visual.

---

## Cores de ação

| Papel | Classe Tailwind | Quando usar |
|-------|----------------|-------------|
| **CTA principal** | `bg-nature-dark text-white` | Botões de submit, ações primárias (Criar, Salvar, Confirmar) |
| **CTA principal hover** | `hover:bg-nature-dark/90` | Sempre no lugar de `hover:brightness-110` |
| **Ação secundária** | `border border-border text-muted-foreground bg-transparent` | Cancelar, voltar, ações alternativas |
| **Ação secundária hover** | `hover:bg-muted` ou `hover:border-primary/40` | Feedback sutil |
| **Acento / status** | `text-primary`, `bg-primary/10` | Badges, indicadores, rings, ícones de destaque |
| **Destrutiva** | `text-destructive`, `bg-destructive/10` | Exclusão, remoção |

### Exemplos concretos

```tsx
{/* Botão primário */}
<button className="px-4 py-2 rounded-lg bg-nature-dark text-white font-semibold text-sm hover:bg-nature-dark/90 transition-all border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
  Criar
</button>

{/* Botão secundário */}
<button className="px-4 py-2 rounded-lg border border-border text-muted-foreground font-semibold text-sm hover:bg-muted transition-colors bg-transparent cursor-pointer">
  Cancelar
</button>

{/* Botão com ícone (header) */}
<button className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors bg-transparent cursor-pointer">
  <ArrowLeft size={16} />
</button>
```

---

## Cantos (border-radius)

| Elemento | Classe | Valor |
|----------|--------|-------|
| Botões, inputs | `rounded-lg` | 8px |
| Containers, cards, painéis | `rounded-xl` | 12px |
| Badges de status | `rounded-full` | pill (exceção única) |
| Botões **nunca** | ~~`rounded-full`~~ | Proibido — parece IA |

---

## Tipografia

| Uso | Fonte | Classe |
|-----|-------|--------|
| Títulos de página (h1, h2) | Lora (serif) | `font-serif` |
| Títulos contextuais (nome de projeto, seção) | Geist (sans) | `font-bold text-[17px]` ou `text-lg` |
| Body, labels, botões | Geist (sans) | (default, sem classe extra) |
| Labels de formulário | Geist | `text-[11px] font-bold uppercase tracking-wider text-earth` |
| Subtítulos | Geist | `text-sm text-muted-foreground` |

### Exemplo de header de página

```tsx
<div className="mb-6">
  <h1 className="text-3xl font-bold text-foreground font-serif">Meus Projetos</h1>
  <p className="text-muted-foreground text-sm mt-1">3 projetos · 17 árvores plantadas no total</p>
</div>
```

---

## Inputs e formulários

```tsx
{/* Label */}
<label className="block text-[11px] font-bold text-earth uppercase tracking-wider mb-1.5">
  Nome
</label>

{/* Input */}
<input className="w-full px-4 py-3 rounded-lg bg-input-bg border-[1.5px] border-border-subtle text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring" />

{/* Textarea */}
<textarea className="w-full px-4 py-3 rounded-lg bg-input-bg border-[1.5px] border-border-subtle text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring resize-none" />

{/* Contador de caracteres */}
<span className="block text-right text-xs text-muted-foreground mt-1">21/100</span>
```

**Regras:**
- Sempre label acima do input (nunca placeholder-only)
- Background: `bg-input-bg` (off-white claro, cinza no dark mode)
- Borda: `border-[1.5px] border-border-subtle` (mais espessa que o padrão, melhor definição)
- Labels opcionais: `<span className="normal-case font-normal text-muted-foreground">opcional</span>`

---

## Hierarquia visual

### Elementos vazios / inativos
```tsx
{/* Opacity reduzida */}
<div className="opacity-65">
  {/* conteúdo inativo */}
</div>

{/* Texto em itálico para estado vazio */}
<span className="italic text-muted-foreground">Nenhuma árvore adicionada</span>

{/* Borda tracejada para placeholder */}
<div className="border-[1.5px] border-dashed border-muted-foreground/30 rounded-xl">
```

### Seleção
```tsx
{/* Item selecionado — border-left colorida, NOT background tintado inteiro */}
<div className={`border-l-[3px] transition-all duration-150
  ${isSelected
    ? 'border-l-blue-500 bg-blue-500/[0.06]'
    : 'border-l-transparent hover:bg-muted/40'
  }`}>
```

### Separadores
```tsx
{/* Linhas finas entre itens (não gaps grandes) */}
<div className="border-b border-separator">

{/* Seções maiores */}
<div className="border-b border-border">
```

---

## Ações contextuais

### Desktop: aparecem no hover
```tsx
<div className="group">
  {/* Conteúdo */}
  <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
    <button>Editar</button>
    <button>Excluir</button>
  </div>
</div>
```

### Mobile: sempre visíveis (compactas)
```tsx
{/* Desktop */}
<div className="hidden sm:flex opacity-0 group-hover:opacity-100 ...">
  <button><Pencil size={15} /></button>
</div>

{/* Mobile */}
<div className="flex sm:hidden">
  <button><Pencil size={14} /></button>
</div>
```

### Menu dropdown (⋮)
```tsx
{/* Usar quando há 2+ ações num item de lista */}
<button aria-haspopup="menu" aria-expanded={open}>
  <MoreVertical size={16} />
</button>

{open && (
  <div role="menu" className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
    <button role="menuitem" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted">
      <Pencil size={14} className="text-muted-foreground" /> Editar
    </button>
    <button role="menuitem" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
      <Trash2 size={14} /> Remover
    </button>
  </div>
)}
```

---

## Badges de status

```tsx
{/* Nativa */}
<span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
  Nativa
</span>

{/* Exótica */}
<span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
  Exótica
</span>

{/* Neutro (porte, categoria) */}
<span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
  Grande
</span>
```

---

## Alertas e estados pendentes

```tsx
{/* Seção amber para itens pendentes */}
<div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/30 p-4">
  <div className="flex items-center gap-2 mb-3">
    <AlertCircle size={15} className="text-amber-600 dark:text-amber-500" />
    <h4 className="text-amber-800 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
      Pendentes (2)
    </h4>
  </div>
  {/* itens */}
</div>

{/* Botão de ação em contexto amber */}
<button className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border-none shadow-sm transition-colors cursor-pointer">
  Vincular
</button>
```

---

## Overlays no mapa

```tsx
{/* Hint no fundo do mapa */}
<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-nature-dark/80 text-white/90 text-xs px-4 py-2 rounded-lg backdrop-blur-sm z-[20] pointer-events-none">
  Clique no mapa para adicionar um ponto
</div>
```

---

## Skeletons (loading)

Usar o componente `Skeleton` existente. Formato deve espelhar o layout real:

```tsx
{/* Row skeleton */}
<div className="bg-card rounded-xl p-4 flex items-center gap-4">
  <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
  <div className="flex-1 space-y-2">
    <Skeleton className="h-4 w-3/5" />
    <Skeleton className="h-3 w-2/5" />
  </div>
</div>

{/* Item de lista skeleton */}
<div className="px-4 py-3 flex items-center gap-3">
  <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
  <div className="flex-1 space-y-1.5">
    <Skeleton className="h-3.5 w-28" />
    <Skeleton className="h-3 w-20" />
    <div className="flex gap-1.5">
      <Skeleton className="h-4 w-14 rounded-full" />
      <Skeleton className="h-4 w-12 rounded-full" />
    </div>
  </div>
</div>
```

---

## Modais

```tsx
{/* Título */}
<h2 className="text-foreground text-xl font-bold">Título do Modal</h2>
<p className="text-muted-foreground text-sm mt-1">Subtítulo explicativo</p>

{/* Footer com dois botões */}
<div className="flex gap-3">
  <button className="flex-1 py-3 rounded-lg border border-border text-muted-foreground font-semibold hover:bg-muted transition-colors bg-transparent cursor-pointer">
    Cancelar
  </button>
  <button className="flex-1 py-3 rounded-lg bg-nature-dark text-white font-bold hover:bg-nature-dark/90 transition-all border-none cursor-pointer disabled:opacity-50">
    Confirmar
  </button>
</div>
```

**Regras:**
- Título sempre `text-foreground` (nunca `text-primary`)
- Sempre ter botão Cancelar
- Submit usa `bg-nature-dark` (não `bg-primary`)

---

## Layout side-by-side (padrão para telas com mapa)

```tsx
{/* Desktop: flex horizontal */}
<div className="hidden lg:flex flex-1 min-h-0">
  <div className="flex-1 min-w-0 relative">
    {/* conteúdo principal (mapa, etc) */}
  </div>
  <div className="w-[340px] flex-shrink-0 border-l border-border">
    {/* painel lateral */}
  </div>
</div>

{/* Mobile: empilhado + bottom sheet */}
<div className="lg:hidden flex-1 min-h-0 relative">
  {/* conteúdo principal */}
  {isMobile && (
    <BottomSheet snapPoints={['150px', 0.5, 0.9]} ...>
      {/* painel */}
    </BottomSheet>
  )}
</div>
```

**Nota:** O BottomSheet usa portal (vaul), então `lg:hidden` no parent não o esconde. Sempre condicionar com `{isMobile && ...}` via `matchMedia`.

---

## Anti-padrões (EVITAR)

| Proibido | Alternativa |
|----------|-------------|
| `rounded-full` em botões | `rounded-lg` (8px) |
| `bg-gradient-to-br` em elementos pequenos | `bg-input-bg` ou cor sólida |
| `hover:brightness-110` | `hover:bg-nature-dark/90` ou `hover:bg-muted` |
| Ícone + texto + seta no mesmo botão | Separar ações, usar ícone-only ou texto-only |
| Cards idênticos em grid simétrico | Lista com hierarquia (ring, opacity, border-left) |
| Ícones genéricos de placeholder (pasta, etc) | Componentes com dados reais (ProgressRing, thumbnails) |
| Placeholder-only em inputs | Label acima + placeholder |
| Ações sempre visíveis em listas | Hover no desktop, compactas no mobile |
| `EmptyState` genérico com texto longo | Estado vazio integrado ao layout (ex: row dashed) |

---

## CSS Variables disponíveis

Definidas em `src/index.css` dentro do `@theme`:

| Variable | Classe Tailwind | Uso |
|----------|----------------|-----|
| `--color-nature-dark` | `bg-nature-dark`, `text-nature-dark` | CTAs principais |
| `--color-earth` | `text-earth` | Labels de formulário |
| `--color-input-bg` | `bg-input-bg` | Background de inputs |
| `--color-border-subtle` | `border-border-subtle` | Bordas de inputs (1.5px) |
| `--color-separator` | `border-separator` | Linhas entre itens de lista |

Todas têm overrides para dark mode no bloco `.dark`.

---

## Transições

```
transition-all duration-150 ease-out   → hover states (border, opacity, bg)
transition-colors                       → mudanças simples de cor
```

Sem spring animations no desktop. Manter snappy.
