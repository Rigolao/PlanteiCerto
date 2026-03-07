-- ============================================
-- PlanteiCerto — Seed: 4 árvores do protótipo
-- Execute APÓS o schema.sql
-- ============================================

INSERT INTO public.trees
  (id, nome_popular, nome_cientifico, imagem, descricao, altura, raiz, espacamento,
   compat_nota, compat_legenda, compat_sub,
   limpeza_nota, limpeza_legenda, limpeza_sub,
   clima_nota, clima_legenda, clima_sub)
VALUES
  (1, 'Ipê-amarelo', 'Handroanthus albus',
   'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?auto=format&fit=crop&q=80&w=800',
   'Símbolo nacional, o Ipê-amarelo oferece uma floração espetacular no inverno. Excelente para absorver o CO₂ do ar graças à sua madeira resistente, mas precisa de calçadas largas para crescer bem.',
   '15 a 20 metros',
   'Profunda (cresce para baixo, não danifica calçada)',
   'Mínimo de 4 metros livres',
   3, 'Nota 3: Risco moderado. Precisa de calçadas médias ou largas para crescer bem.',
   ARRAY['Risco à calçada: Moderado', 'Problema com fios elétricos: Médio'],
   4, 'Nota 4: Pouca limpeza necessária na maior parte do ano.',
   ARRAY['Queda de folhas: Alta (apenas na época de floração)', 'O que cai: Folhas secas e leves'],
   5, 'Nota 5: Excelente para o meio ambiente e para deixar a cidade mais fresca.',
   ARRAY['ODS13::CO₂ absorvido: Alto (A madeira densa guarda mais CO₂ do ar)', 'ODS11::Sombra e frescor: Excelente no verão']),

  (2, 'Oiti', 'Licania tomentosa',
   'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=800',
   'A árvore mais popular no urbanismo pelas suas raízes profundas que não destroem as calçadas e pela sua copa densa que proporciona uma sombra excepcional, essencial para os dias quentes.',
   '10 a 15 metros',
   'Profunda (muito segura para calçadas)',
   'Mínimo de 3 metros livres',
   5, 'Nota 5: Perfeita para calçadas. A raiz não aparece na superfície e se adapta bem em espaços pequenos.',
   ARRAY['Risco à calçada: Nulo/Muito baixo', 'Problema com fios elétricos: Baixo (aceita poda de formação)'],
   4, 'Nota 4: Sempre verde, não perde muitas folhas durante o ano.',
   ARRAY['Queda de folhas: Baixa', 'Frutos: Pequenos e não causam sujeira escorregadia'],
   4, 'Nota 4: Cria uma área bem mais fresca ao redor, como um oásis na cidade.',
   ARRAY['ODS11::Sombra e frescor: Excelente (Copa densa o ano todo)', 'Limpeza do ar: Moderada']),

  (3, 'Quaresmeira', 'Tibouchina granulosa',
   'https://upload.wikimedia.org/wikipedia/commons/a/ac/Quaresmeirasbicolores.jpg?auto=format&fit=crop&q=80&w=800',
   'Árvore de porte médio com florescimento vibrante. Ideal para fiação elétrica e calçadas estreitas, além de embelezar o ambiente urbano.',
   '8 a 12 metros',
   'Raiz fina e ramificada (não danifica a calçada)',
   'Mínimo de 2.5 metros livres',
   5, 'Nota 5: Ideal para calçadas estreitas e para ruas com fios elétricos.',
   ARRAY['Risco à calçada: Nulo', 'Convivência com fios elétricos: Excelente (árvore de médio porte)'],
   3, 'Nota 3: Precisa de varrição moderada quando as flores caem.',
   ARRAY['Queda de flores: Moderada (flores pequenas)', 'O que cai: Flores e folhinhas finas'],
   3, 'Nota 3: Por ser menor, absorve menos CO₂ do que árvores grandes.',
   ARRAY['ODS13::CO₂ absorvido: Baixo (É uma árvore de médio porte)', 'Vida silvestre: Atrai abelhas e borboletas']),

  (4, 'Sibipiruna', 'Caesalpinia pluviosa',
   'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800',
   'Uma das maiores árvores para uso em cidades. Muito eficiente para limpar o ar e absorver CO₂. Porém, por ser enorme e ter raízes fortes, é indicada apenas para praças, parques e jardins no meio de avenidas largas.',
   '18 a 25 metros',
   'Superficial e forte (pode danificar calçadas)',
   'Mínimo de 6 metros livres',
   2, 'Nota 2: Não é adequada para calçadas estreitas. Use em praças ou jardins amplos.',
   ARRAY['Risco à calçada: Alto (raízes muito fortes)', 'Problema com fios elétricos: Altíssimo'],
   5, 'Nota 5: Em parques e praças, as folhas caídas adubarão o solo sem causar problemas.',
   ARRAY['O que cai: Folhinhas bem pequenas', 'Quanto tempo leva para sumir: Rápido'],
   5, 'Nota 5: Ótima para limpar o ar e absorver CO₂ da atmosfera.',
   ARRAY['ODS13::CO₂ absorvido: Altíssimo (É uma árvore muito grande)', 'ODS11::Limpeza do ar: Captura muito bem a poeira e fumaça da cidade']);

SELECT setval('trees_id_seq', 4);
