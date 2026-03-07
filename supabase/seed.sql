-- ============================================
-- PlanteiCerto — Seed: 4 árvores do protótipo
-- Execute APÓS o schema.sql
-- ============================================

INSERT INTO public.trees (id, imagem, descricao, taxonomia, ecologia, morfologia, fenologia, uso_urbanismo) VALUES
  (
    1, 
    'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?auto=format&fit=crop&q=80&w=800',
    'Símbolo nacional, o Ipê-amarelo oferece uma floração espetacular no inverno. Excelente para absorver o CO₂ do ar graças à sua madeira resistente, mas precisa de calçadas largas para crescer bem.',
    '{"nomeComum": "Ipê-amarelo", "outrosNomes": ["Ipê-amarelo-cascudo", "Ipê-da-serra", "Pau-d''arco-amarelo", "Ipê-amarelo-do-brejo"], "nomeBotanico": "Handroanthus spp.", "sinonimosBotanicos": ["Tabebuia alba", "Tabebuia chrysotricha", "Tabebuia serratifolia", "Tabebuia umbellata"], "nativa": true, "origem": ["Mata Atlântica", "Cerrado", "Amazônia"]}'::jsonb,
    '{"exigenciaLuz": "Heliófita", "toleranciaSeca": "Variavel (xerófita em algumas espécies)", "toleranciaFrio": "Alta (especialmente H. albus)", "toleranciaAlagamento": "Alta para H. umbellatus (higrófito)", "umidadeSolo": "Adaptável (seco a úmido)", "tipoSubstrato": ["Encostas", "Solos pantanosos", "Solos argilosos"], "profundidadeSolo": "Profundos", "potencialInvasor": false}'::jsonb,
    '{"habito": "Árvore", "altura": {"media": {"min": 4, "max": 15, "unidade": "m"}, "maxima": {"min": 20, "max": 30, "unidade": "m"}}, "crescimento": {"velocidade": "Moderada a lenta", "taxaEstimada": "2.5m a 3.5m em 2 anos"}, "copa": {"formato": ["Arredondada", "Cônica", "Elíptica vertical"], "densidade": null}, "tronco": {"multiplosCaules": true, "caracteristica": "Tortuoso/Bifurcado"}, "raizes": {"agressividade": "Baixa", "tipo": "Não agressiva"}}'::jsonb,
    '{"folhagem": {"tipo": "Decídua", "formato": "Composta palmada (5 folíolos)", "textura": ["Coriácea", "Subcoriácea", "Pubescente"]}, "floracao": {"cor": "Amarela", "periodo": ["Julho", "Agosto", "Setembro", "Outubro", "Novembro"], "valorOrnamental": "Extremo", "inflorescencia": "Panículas terminais"}, "frutificacao": {"tipo": "Cápsulas alongadas", "cor": ["Ocrácea", "Marrom-escura"], "dispersao": "Anemocórica (vento)"}}'::jsonb,
    '{"recomendadoPaisagismo": true, "manutencao": "Baixa (sem podas frequentes)", "atracaoFauna": {"aves": false, "abelhas": null}, "riscos": {"espinhos": false, "toxicidade": null, "quedaFrutos": false, "quebraGalhos": null}}'::jsonb
  ),
  (
    2,
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=800',
    'A árvore mais popular no urbanismo pelas suas raízes profundas que não destroem as calçadas e pela sua copa densa que proporciona uma sombra excepcional.',
    '{"nomeComum": "Oiti", "outrosNomes": [], "nomeBotanico": "Licania tomentosa", "sinonimosBotanicos": [], "nativa": true, "origem": ["Mata Atlântica"]}'::jsonb,
    '{"exigenciaLuz": "Não informado", "toleranciaSeca": "Não informado", "toleranciaFrio": "Não informado", "toleranciaAlagamento": "Não informado", "umidadeSolo": "Não informado", "tipoSubstrato": [], "profundidadeSolo": "Não informado", "potencialInvasor": false}'::jsonb,
    '{"habito": "Árvore", "altura": {"media": {"min": 10, "max": 15, "unidade": "m"}, "maxima": {"min": 15, "max": 20, "unidade": "m"}}, "crescimento": {"velocidade": "Moderada", "taxaEstimada": "Não informado"}, "copa": {"formato": ["Arredondada"], "densidade": "Alta"}, "tronco": {"multiplosCaules": false, "caracteristica": "Reto"}, "raizes": {"agressividade": "Profunda", "tipo": "Segura para calçadas"}}'::jsonb,
    '{"folhagem": {"tipo": "Perenifólia", "formato": "Simples", "textura": []}, "floracao": {"cor": "Branco-amarelada", "periodo": [], "valorOrnamental": "Baixo", "inflorescencia": "Panículas"}, "frutificacao": {"tipo": "Drupa", "cor": ["Amarelo", "Marrom"], "dispersao": "Zoocórica"}}'::jsonb,
    '{"recomendadoPaisagismo": true, "manutencao": "Média", "atracaoFauna": {"aves": true, "abelhas": null}, "riscos": {"espinhos": false, "toxicidade": false, "quedaFrutos": true, "quebraGalhos": false}}'::jsonb
  ),
  (
    3,
    'https://upload.wikimedia.org/wikipedia/commons/a/ac/Quaresmeirasbicolores.jpg?auto=format&fit=crop&q=80&w=800',
    'Árvore de porte médio com florescimento vibrante. Ideal para fiação elétrica e calçadas estreitas, além de embelezar o ambiente urbano.',
    '{"nomeComum": "Quaresmeira", "outrosNomes": [], "nomeBotanico": "Tibouchina granulosa", "sinonimosBotanicos": [], "nativa": true, "origem": ["Mata Atlântica"]}'::jsonb,
    '{"exigenciaLuz": "Heliófita", "toleranciaSeca": "Média", "toleranciaFrio": "Média", "toleranciaAlagamento": "Baixa", "umidadeSolo": "Úmido", "tipoSubstrato": [], "profundidadeSolo": "Média", "potencialInvasor": false}'::jsonb,
    '{"habito": "Árvore", "altura": {"media": {"min": 8, "max": 12, "unidade": "m"}, "maxima": {"min": 12, "max": 15, "unidade": "m"}}, "crescimento": {"velocidade": "Rápida", "taxaEstimada": "Não informado"}, "copa": {"formato": ["Arredondada"], "densidade": "Média"}, "tronco": {"multiplosCaules": false, "caracteristica": "Texturizado"}, "raizes": {"agressividade": "Baixa", "tipo": "Fina e ramificada"}}'::jsonb,
    '{"folhagem": {"tipo": "Perenifólia", "formato": "Simples", "textura": ["Aspera"]}, "floracao": {"cor": "Roxa/Rosa", "periodo": ["Dezembro", "Janeiro", "Fevereiro", "Março", "Abril"], "valorOrnamental": "Alto", "inflorescencia": "Panículas"}, "frutificacao": {"tipo": "Cápsula", "cor": ["Marrom"], "dispersao": "Anemocórica"}}'::jsonb,
    '{"recomendadoPaisagismo": true, "manutencao": "Baixa", "atracaoFauna": {"aves": false, "abelhas": true}, "riscos": {"espinhos": false, "toxicidade": false, "quedaFrutos": false, "quebraGalhos": false}}'::jsonb
  ),
  (
    4,
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800',
    'Uma das maiores árvores para uso em cidades. Porém, por ser enorme e ter raízes fortes, é indicada apenas para praças, parques e grandes canteiros.',
    '{"nomeComum": "Sibipiruna", "outrosNomes": [], "nomeBotanico": "Caesalpinia pluviosa", "sinonimosBotanicos": [], "nativa": true, "origem": ["Mata Atlântica", "Pantanal"]}'::jsonb,
    '{"exigenciaLuz": "Heliófita", "toleranciaSeca": "Alta", "toleranciaFrio": "Média", "toleranciaAlagamento": "Baixa", "umidadeSolo": "Moderada", "tipoSubstrato": [], "profundidadeSolo": "Profunda", "potencialInvasor": false}'::jsonb,
    '{"habito": "Árvore", "altura": {"media": {"min": 18, "max": 25, "unidade": "m"}, "maxima": {"min": 25, "max": 30, "unidade": "m"}}, "crescimento": {"velocidade": "Rápida", "taxaEstimada": "Não informado"}, "copa": {"formato": ["Aparassolada"], "densidade": "Média"}, "tronco": {"multiplosCaules": false, "caracteristica": "Casca desprendendo"}, "raizes": {"agressividade": "Alta", "tipo": "Superficial e forte"}}'::jsonb,
    '{"folhagem": {"tipo": "Semidecídua", "formato": "Bipinada", "textura": []}, "floracao": {"cor": "Amarela", "periodo": ["Agosto", "Setembro", "Outubro", "Novembro"], "valorOrnamental": "Alto", "inflorescencia": "Cachos"}, "frutificacao": {"tipo": "Vagem", "cor": ["Marrom"], "dispersao": "Autocórica"}}'::jsonb,
    '{"recomendadoPaisagismo": true, "manutencao": "Alta (podas e limpeza)", "atracaoFauna": {"aves": true, "abelhas": true}, "riscos": {"espinhos": false, "toxicidade": false, "quedaFrutos": true, "quebraGalhos": true}}'::jsonb
  );

SELECT setval('trees_id_seq', 4);
