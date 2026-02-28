/* ==========================================
   scripts/data.js
   Banco de Dados Estático (Constantes e Questionário)
   ========================================== */

// --- BANCO DE DADOS DAS PEÇAS ---
const PIECE_SHAPES = ['shape-I', 'shape-O', 'shape-T', 'shape-L', 'shape-J', 'shape-S', 'shape-Z'];
const PIECE_COLORS = ['#ff2a55', '#00f0ff', '#00ff88', '#ffc107', '#b537f2', '#ffffff'];
const PIECE_PATTERNS = ['', 'pattern-stripes', 'pattern-dots'];

// --- PODERES ATIVOS (CANDY CRUSH) ---
const ACTIVE_POWERS = [
    { id: 'bomb', name: 'Bomba Explosiva', desc: 'Destrói blocos num raio de 3x3.' },
    { id: 'laser', name: 'Laser Cruzado', desc: 'Limpa a linha e coluna atual.' },
    { id: 'color_wipe', name: 'Limpeza de Cor', desc: 'Apaga todos os blocos da mesma cor.' },
    { id: 'time_slow', name: 'Manipulação de Tempo', desc: 'Desacelera a queda em 80% por 10s.' },
    { id: 'frenzy', name: 'Frenesi de Pontos', desc: 'Multiplica a pontuação ganha por 3x durante 15s.' }
];

// --- MALDIÇÕES (HIGH RISK, HIGH REWARD) ---
const CURSES = [
    { id: 'blind', name: 'Cegueira', desc: 'Oculta a próxima peça. +50% Vel. de Carga.' },
    { id: 'heavy', name: 'Gravidade Pesada', desc: 'Peças não deslizam no chão. +200% XP e Pontos.' },
    { id: 'garbage', name: 'Chuva de Lixo', desc: 'Sobe lixo a cada 15s. +300% Poeira ao limpar.' }
];

// --- SINERGIAS DE COR (SET BONUS) ---
const COLOR_SYNERGIES = {
    2: 'Dupla: Custo de carga de todas as peças cai 15%.',
    3: 'Trio: Ganha +50 Pontos adicionais por cada linha limpa.',
    4: 'Mono-Cor: O tempo dos poderes ativos é dobrado.',
    rainbow: 'Arco-Íris (4 Cores): +20% XP no final da partida.'
};

// --- QUESTIONÁRIO DE PERFIL (10 Perguntas, 10 Opções cada, EMBARALHADO) ---
const questions = [
    {
        text: "1. Como você lida com um tabuleiro (ou vida) cheio de problemas?",
        options: [
            { text: "Respiro fundo, pauso se precisar, e organizo aos poucos.", traits: { calmo: 1 } },
            { text: "Bato no teclado e jogo de forma totalmente imprevisível.", traits: { agressivo: 0.5, caotico: 0.5 } },
            { text: "Calculo a posição exata de cada peça para um combo.", traits: { estrategista: 1 } },
            { text: "Aceito a derrota iminente com um sorriso enigmático.", traits: { calmo: 0.5, misterioso: 0.5 } },
            { text: "Acelero o ritmo e limpo tudo na força bruta.", traits: { agressivo: 1 } },
            { text: "Faço uma jogada bizarra e arriscada que surpreende todos.", traits: { misterioso: 0.5, caotico: 0.5 } },
            { text: "Uso táticas que ninguém entende, mas que funcionam.", traits: { misterioso: 1 } },
            { text: "Acelero, mas mantendo o olho no próximo combo.", traits: { agressivo: 0.5, estrategista: 0.5 } },
            { text: "Jogo as peças em qualquer buraco e torço pelo melhor.", traits: { caotico: 1 } },
            { text: "Planejo em total silêncio meu próximo movimento.", traits: { estrategista: 0.5, calmo: 0.5 } }
        ]
    },
    {
        text: "2. Qual o seu estilo musical favorito para jogar?",
        options: [
            { text: "Músicas que parecem mensagens subliminares de trás pra frente.", traits: { misterioso: 0.5, caotico: 0.5 } },
            { text: "Hyperpop / Músicas experimentais estouradas.", traits: { caotico: 1 } },
            { text: "Heavy Metal / Hardcore (Volume no máximo).", traits: { agressivo: 1 } },
            { text: "Trilhas sonoras ambientes mas que exigem atenção.", traits: { estrategista: 0.5, calmo: 0.5 } },
            { text: "Dark Ambient / Synthwave obscuro.", traits: { misterioso: 1 } },
            { text: "Rock alternativo com mudanças bruscas de ritmo.", traits: { agressivo: 0.5, caotico: 0.5 } },
            { text: "Lo-Fi Beats / Jazz suave.", traits: { calmo: 1 } },
            { text: "Música eletrônica com batidas matemáticas e intensas.", traits: { agressivo: 0.5, estrategista: 0.5 } },
            { text: "Música Clássica / Instrumental focado.", traits: { estrategista: 1 } },
            { text: "Sons da natureza com um toque sombrio.", traits: { calmo: 0.5, misterioso: 0.5 } }
        ]
    },
    {
        text: "3. Se você fosse uma peça de Tetris, qual seria seu lema?",
        options: [
            { text: "'Eu sou a chave para o combo perfeito.'", traits: { estrategista: 1 } },
            { text: "'Ninguém sabe onde eu vou me meter.'", traits: { caotico: 1 } },
            { text: "'Apareço do nada e confundo a mente de todos.'", traits: { misterioso: 0.5, caotico: 0.5 } },
            { text: "'Eu quebro tudo por onde passo!'", traits: { agressivo: 1 } },
            { text: "'Flutuo no vazio até chegar minha hora.'", traits: { calmo: 0.5, misterioso: 0.5 } },
            { text: "'Eu finalizo a jogada com precisão letal.'", traits: { agressivo: 0.5, estrategista: 0.5 } },
            { text: "'Minhas intenções estão além da sua compreensão.'", traits: { misterioso: 1 } },
            { text: "'Gero pânico, mas causo muito dano.'", traits: { agressivo: 0.5, caotico: 0.5 } },
            { text: "'Eu apenas me encaixo onde for mais confortável.'", traits: { calmo: 1 } },
            { text: "'Construo bases sólidas em silêncio.'", traits: { estrategista: 0.5, calmo: 0.5 } }
        ]
    },
    {
        text: "4. Qual a sua reação ao perder uma partida por um detalhe bobo?",
        options: [
            { text: "Desligo o monitor e fico no escuro refletindo.", traits: { calmo: 0.5, misterioso: 0.5 } },
            { text: "Dou risada e começo a jogar de um jeito pior ainda.", traits: { caotico: 1 } },
            { text: "Pauso, reflito sobre a vida e volto a jogar concentrado.", traits: { estrategista: 0.5, calmo: 0.5 } },
            { text: "Tudo bem, faz parte do jogo. Tomo uma água.", traits: { calmo: 1 } },
            { text: "Soco a mesa e dou 'Restart' imediatamente!", traits: { agressivo: 1 } },
            { text: "Fecho o jogo em silêncio sem dizer uma palavra.", traits: { misterioso: 1 } },
            { text: "Finjo que perdi de propósito só pra testar o sistema.", traits: { misterioso: 0.5, caotico: 0.5 } },
            { text: "Xingo tudo e mudo todas as minhas configurações de controle.", traits: { agressivo: 0.5, caotico: 0.5 } },
            { text: "Analiso o replay mentalmente para não repetir o erro.", traits: { estrategista: 1 } },
            { text: "Fico com raiva, mas prometo jogar perfeito na próxima.", traits: { agressivo: 0.5, estrategista: 0.5 } }
        ]
    },
    {
        text: "5. Em uma equipe de RPG de mesa, você seria o(a):",
        options: [
            { text: "Necromante (Usa os mortos para gerar o caos na taverna).", traits: { misterioso: 0.5, caotico: 0.5 } },
            { text: "Clérigo (Manter todos vivos e seguros).", traits: { calmo: 1 } },
            { text: "Bárbaro (Bater primeiro, perguntar depois).", traits: { agressivo: 1 } },
            { text: "Arqueiro Focado (Fica longe e atira com paciência).", traits: { estrategista: 0.5, calmo: 0.5 } },
            { text: "Warlock (Magia das sombras, isolado).", traits: { misterioso: 1 } },
            { text: "Mago (Controle do campo de batalha).", traits: { estrategista: 1 } },
            { text: "Berserker Maluco (Não distingue amigo de inimigo).", traits: { agressivo: 0.5, caotico: 0.5 } },
            { text: "Paladino de Combate (Tático mas violento).", traits: { agressivo: 0.5, estrategista: 0.5 } },
            { text: "Ladino/Bardo (Fazer o que der na telha).", traits: { caotico: 1 } },
            { text: "Monge Obscuro (Curandeiro com um passado sombrio).", traits: { calmo: 0.5, misterioso: 0.5 } }
        ]
    },
    {
        text: "6. Qual a sua arma favorita em jogos de tiro/ação?",
        options: [
            { text: "Submetralhadora Tática (Rush calculado).", traits: { agressivo: 0.5, estrategista: 0.5 } },
            { text: "Sniper (Cálculo, vento, distância).", traits: { estrategista: 1 } },
            { text: "Gás tóxico lançado por dutos de ar.", traits: { misterioso: 0.5, caotico: 0.5 } },
            { text: "Rifle de Assalto com Silenciador (Controle e paz).", traits: { calmo: 1 } },
            { text: "Armadilhas de aproximação bem escondidas.", traits: { estrategista: 0.5, calmo: 0.5 } },
            { text: "Escopeta (Perto e destrutivo).", traits: { agressivo: 1 } },
            { text: "Lança-Foguetes (Área de dano, fogo amigo ativado).", traits: { caotico: 1 } },
            { text: "Facas de arremesso envenenadas (Silencioso).", traits: { misterioso: 1 } },
            { text: "Arco e Flecha nas sombras.", traits: { calmo: 0.5, misterioso: 0.5 } },
            { text: "Duas metralhadoras, uma em cada mão, atirando sem parar.", traits: { agressivo: 0.5, caotico: 0.5 } }
        ]
    },
    {
        text: "7. O que você procura em uma Peça/Amizade?",
        options: [
            { text: "Alguém que não faça muitas perguntas.", traits: { misterioso: 1 } },
            { text: "Um parceiro de debates acalorados mas inteligentes.", traits: { agressivo: 0.5, estrategista: 0.5 } },
            { text: "Alguém para observar o céu noturno em silêncio.", traits: { calmo: 0.5, misterioso: 0.5 } },
            { text: "Alguém inteligente que pensa 3 passos à frente.", traits: { estrategista: 1 } },
            { text: "Um amigo que topa briga de rua por qualquer motivo.", traits: { agressivo: 0.5, caotico: 0.5 } },
            { text: "Alguém que seja um porto seguro para conversar.", traits: { calmo: 1 } },
            { text: "Alguém que gosta de explorar lugares abandonados às 3h da manhã.", traits: { misterioso: 0.5, caotico: 0.5 } },
            { text: "Alguém que não tem medo de explodir coisas comigo.", traits: { agressivo: 1 } },
            { text: "Alguém para me acompanhar em ideias horríveis.", traits: { caotico: 1 } },
            { text: "Um companheiro para jogar xadrez tomando chá.", traits: { estrategista: 0.5, calmo: 0.5 } }
        ]
    },
    {
        text: "8. Seu estilo de vestuário na vida real é mais para:",
        options: [
            { text: "Tudo preto. O tempo todo. Óculos escuros.", traits: { misterioso: 1 } },
            { text: "Minimalista, cores neutras, sem estampa.", traits: { estrategista: 0.5, calmo: 0.5 } },
            { text: "Jaqueta de couro ou roupa de academia intensa.", traits: { agressivo: 1 } },
            { text: "Misturo estampas que não têm nada a ver.", traits: { caotico: 1 } },
            { text: "Moletom gigante, roupas confortáveis.", traits: { calmo: 1 } },
            { text: "Techwear (Roupas táticas utilitárias e estilosas).", traits: { agressivo: 0.5, estrategista: 0.5 } },
            { text: "Gótico de brechó com acessórios estranhos.", traits: { misterioso: 0.5, caotico: 0.5 } },
            { text: "Camiseta de banda de Metal rasgada.", traits: { agressivo: 0.5, caotico: 0.5 } },
            { text: "Roupas largas e antigas com capuz.", traits: { calmo: 0.5, misterioso: 0.5 } },
            { text: "Social moderno, impecável, cada peça combina.", traits: { estrategista: 1 } }
        ]
    },
    {
        text: "9. Se você tivesse um superpoder inútil, seria:",
        options: [
            { text: "Soltar faíscas inofensivas pelos dedos quando irritado.", traits: { agressivo: 0.5, caotico: 0.5 } },
            { text: "Mudar a cor dos olhos aleatoriamente a cada piscada.", traits: { misterioso: 0.5, caotico: 0.5 } },
            { text: "Saber o ponto exato para chutar uma porta e abri-la.", traits: { agressivo: 0.5, estrategista: 0.5 } },
            { text: "Ler livros apenas tocando a capa, mas só a sinopse.", traits: { estrategista: 0.5, calmo: 0.5 } },
            { text: "Poder se esconder em sombras rasas.", traits: { misterioso: 1 } },
            { text: "Fazer o som de uma explosão com a boca muito alto.", traits: { agressivo: 1 } },
            { text: "Fazer a água do copo ficar sempre na temperatura ideal.", traits: { calmo: 1 } },
            { text: "Fazer aparelhos eletrônicos darem curto quando toco.", traits: { caotico: 1 } },
            { text: "Saber exatamente quantos graus tem um ângulo olhando pra ele.", traits: { estrategista: 1 } },
            { text: "Fazer as pessoas esquecerem qual era a cor da sua camisa.", traits: { calmo: 0.5, misterioso: 0.5 } }
        ]
    },
    {
        text: "10. Por fim, o que te motiva a jogar Poly Match?",
        options: [
            { text: "Apenas relaxar enquanto minha mente resolve puzzles.", traits: { estrategista: 0.5, calmo: 0.5 } },
            { text: "Quero usar as maldições pra ver o circo pegar fogo.", traits: { agressivo: 0.5, caotico: 0.5 } },
            { text: "Dominar o placar e amassar o jogo.", traits: { agressivo: 1 } },
            { text: "Criar conexões sombrias entre peças estranhas.", traits: { misterioso: 0.5, caotico: 0.5 } },
            { text: "Encaixar os blocos é quase uma terapia pra mim.", traits: { calmo: 1 } },
            { text: "Ver o caos das habilidades destruindo o tabuleiro.", traits: { caotico: 1 } },
            { text: "Admirar a estética dark do jogo à noite.", traits: { calmo: 0.5, misterioso: 0.5 } },
            { text: "Descobrir as fofocas e os segredos escondidos do código.", traits: { misterioso: 1 } },
            { text: "Achar a sinergia perfeita para quebrar o sistema.", traits: { estrategista: 1 } },
            { text: "Montar uma build focada em dano e limpeza rápida.", traits: { agressivo: 0.5, estrategista: 0.5 } }
        ]
    }
];
