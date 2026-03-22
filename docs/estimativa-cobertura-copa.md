# Estimativa de Cobertura de Copa

No Dashboard do projeto, a métrica de "Estimativa de Cobertura de Copa" calcula a projeção de sombra que todas as árvores juntas gerarão quando atingirem o seu tamanho adulto máximo.

## A Física por Trás do Cálculo

Essa métrica converte o diâmetro linear da copa das árvores (fornecido em metros na base de dados) em uma área bidimensional (**Metros Quadrados - m²**).

### Fórmula Utilizada
A sombra projetada por uma copa de árvore se aproxima do formato de um círculo projetado horizontalmente no solo. Para isso, utilizamos a fórmula matemática de área do círculo: 

`Área = π * Raio²`

Onde:
1. **Diâmetro**: Obtido pelo campo `diametro_copa_adulto_max_m` do banco de dados para a espécie correspondente.
2. **Raio**: Metade do diâmetro (`r = d / 2`).
3. **π (Pi)**: Aproximadamente 3.14159.

### Exemplo Prático (Resedá)
Tome como exemplo uma árvore com **5 metros** de diâmetro de copa (ex: Resedá).
- **Raio**: 5m / 2 = 2.5m
- **Cálculo**: 3.14159 * (2.5 * 2.5) => 3.14159 * 6.25 = **19.63 m²**

O painel de estatísticas, ao agregar dados, faz um arredondamento e exibirá que **um Resedá cobre aproximadamente 20 m²** de solo com sua copa no pico da fase adulta. 

### Relação de Crescimento Espacial
Áreas crescem com o **quadrado do raio**, o que significa que aumentos aparentemente pequenos no diâmetro geram saltos massivos na área de cobertura sombreada:
| Diâmetro da Copa | Raio | Cobertura Gerada (Área) |
| -- | -- | -- |
| 3 metros | 1.5m | ~7 m² |
| 5 metros | 2.5m | ~20 m² |
| 8 metros | 4.0m | ~50 m² |
| 10 metros | 5.0m | ~78 m² |

### Por Que Utilizar Essa Métrica?
Apresentar a cobertura agregada ajuda gestores e usuários do app a compreender o real volume de compensação ambiental e sombreamento urbano que o projeto causará, métrica esta que muitas prefeituras exigem para licenciamentos.
