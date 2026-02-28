/* ==========================================
   scripts/state.js
   Estado Global e Save/Load
   ========================================== */

// --- ESTADO GLOBAL DO JOGO ---
let gameState = {
    player: { 
        level: 1, 
        xp: 0,               // NOVO: Controle de experiência para a barra de perfil
        likesEnergy: 5, 
        maxLikesEnergy: 5, 
        money: 0, 
        dust: 0, 
        lastEnergyTime: Date.now(),
        gridWidth: 2,        // Inicia em 2x2 no Nível 1
        gridHeight: 2,
        equippedPieces: [], 
        // Os 5 parâmetros de personalidade (Roda da Vida)
        traits: { agressivo: 0, estrategista: 0, caotico: 0, calmo: 0, misterioso: 0 } 
    },
    inventoryItems: [],
    capturedPieces: [], 
    pendingAnalysis: [], 
    stats: { totalSwipes: 0 },
    inGame: false
};

// Variáveis de controle de tela abertas
let currentPiece = null;
let activeChatId = null;

// --- FUNÇÕES DE SAVE / LOAD ---
function downloadSave() {
    const saveString = btoa(JSON.stringify(gameState));
    const blob = new Blob([saveString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PolyMatch_Save_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    if (typeof showNotification === 'function') showNotification("Save Exportado com Sucesso!");
}

function loadGame() {
    const inputCode = document.getElementById('save-code-input').value.trim();
    if(!inputCode) { alert("Cole o código do save primeiro!"); return; }
    try {
        const loadedState = JSON.parse(atob(inputCode));
        if(loadedState && loadedState.player && loadedState.player.traits) {
            gameState = loadedState;
            alert("Progresso Importado com Sucesso!");
            
            // Força a atualização da interface visual se as funções já estiverem carregadas
            if (typeof updateHUD === "function") updateHUD();
            
            if(gameState.inGame) {
                if (typeof showScreen === "function") showScreen('screen-hub');
                if (typeof renderChatList === "function") renderChatList();
            } else {
                if (typeof showScreen === "function") showScreen('screen-menu');
            }
        } else { alert("O código inserido não é um Save válido."); }
    } catch (e) { alert("Erro ao ler o código de Save!"); console.error(e); }
}
