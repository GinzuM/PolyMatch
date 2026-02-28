# 🧩 Poly Match

**Construa. Sobreviva. Dê Match.**

Poly Match é um jogo de puzzle e estratégia *roguelite* que mistura a física clássica do **Tetris** com mecânicas de aplicativos de relacionamento (**Tinder**), gerenciamento de inventário espacial (**Resident Evil 4**) e habilidades especiais ativas (**Candy Crush**).

O objetivo do projeto é criar um loop de gameplay viciante onde a sua personalidade fora da arena define os aliados que você leva para dentro dela.

---

## 🎯 Objetivo e Visão do Projeto

O jogo foi desenhado para testar os limites de aplicações web rodando puramente no lado do cliente (Client-side), utilizando Vanilla JavaScript e a API de Canvas do HTML5. 

O grande diferencial do Poly Match é a sua **progressão em camadas**:
1. **Perfil Psicológico:** O jogador responde a um questionário que molda seus traços (Agressivo, Estrategista, Caótico, Calmo, Misterioso) em um Gráfico de Radar (Roda da Vida).
2. **Gacha & Swipe:** O jogador dá "Likes" em peças geradas proceduralmente. A compatibilidade de "Match" é calculada matematicamente baseada no perfil do jogador e da peça.
3. **Social & Upgrades:** As peças que dão Match vão para um Chat responsivo, onde o jogador descobre segredos, fofocas de sinergia e gasta recursos para upar os atributos da peça.
4. **Deckbuilding:** O jogador precisa organizar suas peças num inventário físico (estilo *Resident Evil 4*). O espaço é limitado e cresce conforme o jogador sobe de nível.
5. **Combate (Arena):** Um motor de Tetris completo. As peças equipadas no inventário funcionam como "Ultimates" que carregam energia e ativam poderes (bombas, lasers, manipulação de tempo) ou maldições para multiplicar os ganhos.

---

## 📁 Organização e Arquitetura do Código

Para garantir escalabilidade, manutenção fácil e evitar conflitos (como bugs de CSS no Chat ou no motor de física), o projeto foi reestruturado em uma arquitetura estritamente modularizada:

\`\`\`text
📁 PolyMatch/
├── 📄 index.html         # Estrutura principal, carregamento de scripts e modais.
├── 📄 README.md          # Documentação do projeto.
│
├── 📁 styles/            # CSS modularizado
│   ├── 📄 base.css       # Variáveis de cor (Dark/Cyberpunk), tipografia e reset.
│   ├── 📄 ui.css         # Estilização de Menus, Chat Flexbox, Loja e Modais.
│   └── 📄 game.css       # CSS Grid do Inventário (RE4) e estilização da Arena Tetris.
│
└── 📁 scripts/           # Lógica JavaScript dividida por domínio
    ├── 📄 data.js        # Banco de Dados puro: Constantes, Poderes, Maldições e Perguntas.
    ├── 📄 state.js       # Estado global (gameState), controle de XP e motor de Save/Load.
    ├── 📄 main-ui.js     # Troca de abas, HUD, Notificações e renderização do Canvas de Perfil.
    ├── 📄 swipe.js       # Motor Gacha (geração procedural), Swipe e Loja de Poeira/Moedas.
    ├── 📄 chat.js        # Lógica de interações de texto, Upgrades e revelação de Sinergias.
    ├── 📄 deck.js        # Sistema de Drag & Drop, colisão de matrizes e Sinergia de Cores.
    └── 📄 tetris.js      # Loop de animação (RequestAnimationFrame), física e Ultimates.
\`\`\`

---

## 🛠️ Ferramentas e Tecnologias

O projeto foi construído focando em performance nativa, sem a necessidade de frameworks pesados de interface (como React ou Vue) ou *Game Engines* (como Unity ou Godot).

* **HTML5 & CSS3:** Utilização intensiva de `CSS Grid` (para o inventário geométrico) e `Flexbox` (para a responsividade do layout simulando um smartphone e o comportamento fixo do Chat).
* **Vanilla JavaScript (ES6+):** Manipulação de DOM nativa, gerenciamento de arrays/objetos complexos para o estado do jogo e uso de `setInterval`/`setTimeout` para background loops (recarga de energia e fila de matches).
* **HTML5 Canvas API:** * Motor de renderização customizado para a física do Tetris e efeitos visuais (Glow, Drop Shadows).
    * Cálculos de trigonometria (Seno/Cosseno) utilizados para gerar dinamicamente o **Gráfico de Radar** da personalidade do jogador.
* **Biblioteca Externa:** `html2canvas` (Utilizada exclusivamente para permitir que o jogador faça download da fotografia de "Dica de Sinergia" gerada no chat).

---

## ⚙️ Análise de Game Design

* **Economia Dual:** O jogo possui duas moedas distintas. "Moedas" ganhas jogando Tetris (usadas para upgrades de peças) e "Poeira" ganha ao reciclar peças no Chat (usada para girar a roleta Gacha). Isso cria um ciclo onde jogar alimenta o social, e reciclar alimenta o combate.
* **Hard Cap Flexível:** O inventário inicial começa claustrofóbico (2x2) forçando escolhas difíceis. Ele escala até um limite matemático (10x10) no *Endgame*, garantindo que o jogador sinta a progressão sem quebrar o layout da interface.
* **Fator "High Risk, High Reward":** A introdução de "Maldições" nas peças obriga o jogador a decidir se vale a pena prejudicar sua própria visão ou física no Tetris em troca de multiplicadores massivos de XP e Ouro.

---

## 🚀 Como Rodar

O Poly Match é um jogo executado inteiramente no navegador do cliente (Client-side).
Não é necessário instalar `Node.js`, `Python` ou configurar servidores locais.

1. Faça o clone ou o download do repositório.
2. Extraia os arquivos mantendo a estrutura original de pastas.
3. Dê um duplo-clique no arquivo `index.html` para abri-lo em qualquer navegador moderno (Chrome, Edge, Firefox, Brave).
4. Divirta-se! *(Dica: Pressione 1, 2, 3 ou 4 durante o combate para invocar suas Ultimates!)*
