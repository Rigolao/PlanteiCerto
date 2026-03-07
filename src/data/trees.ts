import type { Arvore } from '../types/tree';

export const staticTrees: Arvore[] = [
  {
    id: 1,
    nomePopular: "Ipê-amarelo",
    nomeCientifico: "Handroanthus albus",
    imagem: "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?auto=format&fit=crop&q=80&w=800",
    descricao: "Símbolo nacional, o Ipê-amarelo oferece uma floração espetacular no inverno. Excelente para absorver o CO₂ do ar graças à sua madeira resistente, mas precisa de calçadas largas para crescer bem.",
    altura: "15 a 20 metros",
    raiz: "Profunda (cresce para baixo, não danifica calçada)",
    espacamento: "Mínimo de 4 metros livres",
    atributos: {
      compatibilidade: {
        nota: 3,
        legenda: "Nota 3: Risco moderado. Precisa de calçadas médias ou largas para crescer bem.",
        sub: ["Risco à calçada: Moderado", "Problema com fios elétricos: Médio"]
      },
      limpeza: {
        nota: 4,
        legenda: "Nota 4: Pouca limpeza necessária na maior parte do ano.",
        sub: ["Queda de folhas: Alta (apenas na época de floração)", "O que cai: Folhas secas e leves"]
      },
      clima: {
        nota: 5,
        legenda: "Nota 5: Excelente para o meio ambiente e para deixar a cidade mais fresca.",
        sub: [
          "ODS13::CO₂ absorvido: Alto (A madeira densa guarda mais CO₂ do ar)",
          "ODS11::Sombra e frescor: Excelente no verão"
        ]
      }
    }
  },
  {
    id: 2,
    nomePopular: "Oiti",
    nomeCientifico: "Licania tomentosa",
    imagem: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=800",
    descricao: "A árvore mais popular no urbanismo pelas suas raízes profundas que não destroem as calçadas e pela sua copa densa que proporciona uma sombra excepcional, essencial para os dias quentes.",
    altura: "10 a 15 metros",
    raiz: "Profunda (muito segura para calçadas)",
    espacamento: "Mínimo de 3 metros livres",
    atributos: {
      compatibilidade: {
        nota: 5,
        legenda: "Nota 5: Perfeita para calçadas. A raiz não aparece na superfície e se adapta bem em espaços pequenos.",
        sub: ["Risco à calçada: Nulo/Muito baixo", "Problema com fios elétricos: Baixo (aceita poda de formação)"]
      },
      limpeza: {
        nota: 4,
        legenda: "Nota 4: Sempre verde, não perde muitas folhas durante o ano.",
        sub: ["Queda de folhas: Baixa", "Frutos: Pequenos e não causam sujeira escorregadia"]
      },
      clima: {
        nota: 4,
        legenda: "Nota 4: Cria uma área bem mais fresca ao redor, como um oásis na cidade.",
        sub: [
          "ODS11::Sombra e frescor: Excelente (Copa densa o ano todo)",
          "Limpeza do ar: Moderada"
        ]
      }
    }
  },
  {
    id: 3,
    nomePopular: "Quaresmeira",
    nomeCientifico: "Tibouchina granulosa",
    imagem: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Quaresmeirasbicolores.jpg?auto=format&fit=crop&q=80&w=800",
    descricao: "Árvore de porte médio com florescimento vibrante. Ideal para fiação elétrica e calçadas estreitas, além de embelezar o ambiente urbano.",
    altura: "8 a 12 metros",
    raiz: "Raiz fina e ramificada (não danifica a calçada)",
    espacamento: "Mínimo de 2.5 metros livres",
    atributos: {
      compatibilidade: {
        nota: 5,
        legenda: "Nota 5: Ideal para calçadas estreitas e para ruas com fios elétricos.",
        sub: ["Risco à calçada: Nulo", "Convivência com fios elétricos: Excelente (árvore de médio porte)"]
      },
      limpeza: {
        nota: 3,
        legenda: "Nota 3: Precisa de varrição moderada quando as flores caem.",
        sub: ["Queda de flores: Moderada (flores pequenas)", "O que cai: Flores e folhinhas finas"]
      },
      clima: {
        nota: 3,
        legenda: "Nota 3: Por ser menor, absorve menos CO₂ do que árvores grandes.",
        sub: [
          "ODS13::CO₂ absorvido: Baixo (É uma árvore de médio porte)",
          "Vida silvestre: Atrai abelhas e borboletas"
        ]
      }
    }
  },
  {
    id: 4,
    nomePopular: "Sibipiruna",
    nomeCientifico: "Caesalpinia pluviosa",
    imagem: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800",
    descricao: "Uma das maiores árvores para uso em cidades. Muito eficiente para limpar o ar e absorver CO₂. Porém, por ser enorme e ter raízes fortes, é indicada apenas para praças, parques e jardins no meio de avenidas largas.",
    altura: "18 a 25 metros",
    raiz: "Superficial e forte (pode danificar calçadas)",
    espacamento: "Mínimo de 6 metros livres",
    atributos: {
      compatibilidade: {
        nota: 2,
        legenda: "Nota 2: Não é adequada para calçadas estreitas. Use em praças ou jardins amplos.",
        sub: ["Risco à calçada: Alto (raízes muito fortes)", "Problema com fios elétricos: Altíssimo"]
      },
      limpeza: {
        nota: 5,
        legenda: "Nota 5: Em parques e praças, as folhas caídas adubarão o solo sem causar problemas.",
        sub: ["O que cai: Folhinhas bem pequenas", "Quanto tempo leva para sumir: Rápido"]
      },
      clima: {
        nota: 5,
        legenda: "Nota 5: Ótima para limpar o ar e absorver CO₂ da atmosfera.",
        sub: [
          "ODS13::CO₂ absorvido: Altíssimo (É uma árvore muito grande)",
          "ODS11::Limpeza do ar: Captura muito bem a poeira e fumaça da cidade"
        ]
      }
    }
  }
];
