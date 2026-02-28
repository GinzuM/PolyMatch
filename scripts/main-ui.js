/* ==========================================
   scripts/main-ui.js
   HUD, Navegação, Notificações e Perfil do Jogador
   ========================================== */

function showNotification(msg) {
    const notif = document.getElementById('notification-area');
    notif.innerText = msg;
    notif.classList.remove('hidden');
    notif.style.opacity = '1';
    setTimeout(() => { 
        notif.style.opacity = '0'; 
        setTimeout(() => notif.classList.add('hidden'), 300);
    }, 3500);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function switchTab(tabId, navBtn) {
    if(gameState.inGame && document.getElementById('tetris-game-area') && !document.getElementById('tetris-game-area').classList.contains('hidden')) {
        alert("Saia da partida de Tetris antes de trocar de aba!");
        return;
    }
    
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    navBtn.classList.add('active');
    
    if(tabId === 'tab-chat' && typeof renderChatList === 'function') { 
        if(typeof closeChatWindow === 'function') closeChatWindow(); 
        renderChatList(); 
    }
    if(tabId === 'tab-shop' && typeof renderShop === 'function') renderShop();
    if(tabId === 'tab-deck' && typeof renderInventoryGrid === 'function') { 
        renderInventoryGrid(); 
        if(typeof renderAvailablePieces === 'function') renderAvailablePieces(); 
    }
}

// --- FUNÇÃO DO NOVO SLIDER DE ESCALA DA UI ---
window.currentUIScale = 1; // Variável global de escala

function changeUIScale() {
    const scale = document.getElementById('ui-scale-slider').value;
    window.currentUIScale = parseFloat(scale);
    
    const container = document.getElementById('game-container');
    container.style.transform = `scale(${window.currentUIScale})`;
    
    // Se a tela encolher, centraliza no meio. Se aumentar, alinha pelo topo para não cortar.
    container.style.transformOrigin = window.currentUIScale < 1 ? 'center center' : 'top center';
}

function openSettings() { showScreen('screen-settings'); }
function closeSettings() { gameState.inGame ? showScreen('screen-hub') : showScreen('screen-menu'); }

function toggleMobileControls() {
    const isChecked = document.getElementById('toggle-mobile').checked;
    const dpad = document.getElementById('virtual-dpad');
    if(dpad) {
        if(isChecked) dpad.classList.remove('hidden');
        else dpad.classList.add('hidden');
    }
}

function updateHUD() {
    document.getElementById('ui-level').innerText = gameState.player.level;
    document.getElementById('ui-money').innerText = gameState.player.money;
    document.getElementById('ui-dust').innerText = gameState.player.dust;
    document.getElementById('ui-energy').innerText = `${gameState.player.likesEnergy}/${gameState.player.maxLikesEnergy}`;
}

function checkEnergyTime() {
    if(gameState.player.likesEnergy >= gameState.player.maxLikesEnergy) {
        showNotification("Sua energia (Likes) já está no máximo!");
    } else {
        let timeLeft = 300000 - (Date.now() - gameState.player.lastEnergyTime);
        let mins = Math.floor(timeLeft / 60000);
        let secs = Math.floor((timeLeft % 60000) / 1000);
        showNotification(`Próxima energia em: ${mins}m ${secs}s`);
    }
}

function closeModal(modalId) { document.getElementById(modalId).classList.add('hidden'); }

let currentQuestionIndex = 0;

function startGame() {
    gameState.player.traits = { agressivo: 0, estrategista: 0, caotico: 0, calmo: 0, misterioso: 0 };
    currentQuestionIndex = 0;
    gameState.inGame = false;
    showScreen('screen-creation');
    renderQuestion();
}

function renderQuestion() {
    const q = questions[currentQuestionIndex];
    document.getElementById('question-counter').innerText = `${currentQuestionIndex + 1}/${questions.length}`;
    document.getElementById('question-text').innerText = q.text;
    
    const container = document.getElementById('options-container'); 
    container.innerHTML = '';
    
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn-option';
        btn.innerText = opt.text;
        
        btn.onclick = () => {
            for (let trait in opt.traits) {
                gameState.player.traits[trait] += opt.traits[trait];
            }
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) renderQuestion();
            else finishCreation();
        };
        container.appendChild(btn);
    });
}

function finishCreation() {
    gameState.inGame = true;
    gameState.player.likesEnergy = gameState.player.maxLikesEnergy;
    gameState.player.lastEnergyTime = Date.now();
    updateHUD();
    if(typeof generatePiece === 'function') generatePiece();
    showScreen('screen-hub');
    showNotification("Perfil Concluído! Bem-vindo ao Poly Match.");
}

function openPlayerProfile() {
    const modal = document.getElementById('modal-player-profile');
    document.getElementById('modal-pl-level').innerText = gameState.player.level;
    document.getElementById('modal-pl-grid-size').innerText = `Tamanho do Inventário: ${gameState.player.gridWidth}x${gameState.player.gridHeight}`;
    
    let xpReq = gameState.player.level * 500;
    let currentXp = gameState.player.xp || 0;
    document.getElementById('modal-pl-xp-text').innerText = `${Math.floor(currentXp)} / ${xpReq} XP`;
    let pct = Math.min((currentXp / xpReq) * 100, 100);
    document.getElementById('modal-pl-xp-fill').style.width = `${pct}%`;
    
    modal.classList.remove('hidden');
    setTimeout(drawRadarChart, 50); 
}

function drawRadarChart() {
    const canvas = document.getElementById('radar-chart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2; const cy = canvas.height / 2; const radius = 80; 
    const traitNames = ['Agressivo', 'Estrategista', 'Caótico', 'Calmo', 'Misterioso'];
    const traitKeys = ['agressivo', 'estrategista', 'caotico', 'calmo', 'misterioso'];
    const numPoints = traitKeys.length;
    
    let maxVal = 1;
    traitKeys.forEach(k => { if(gameState.player.traits[k] > maxVal) maxVal = gameState.player.traits[k]; });

    const getCoordinates = (angle, dist) => { return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }; };

    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    for (let ring = 1; ring <= 3; ring++) {
        let ringRadius = radius * (ring / 3);
        ctx.beginPath();
        for (let i = 0; i < numPoints; i++) {
            let angle = (Math.PI * 2 * i / numPoints) - (Math.PI / 2); 
            let pos = getCoordinates(angle, ringRadius);
            if (i === 0) ctx.moveTo(pos.x, pos.y); else ctx.lineTo(pos.x, pos.y);
        }
        ctx.closePath(); ctx.stroke();
    }

    ctx.font = '12px Roboto'; ctx.fillStyle = '#888890'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < numPoints; i++) {
        let angle = (Math.PI * 2 * i / numPoints) - (Math.PI / 2);
        let endPos = getCoordinates(angle, radius);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(endPos.x, endPos.y); ctx.stroke();
        let labelPos = getCoordinates(angle, radius + 20);
        ctx.fillText(traitNames[i], labelPos.x, labelPos.y);
    }

    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
        let val = gameState.player.traits[traitKeys[i]];
        let scale = val / maxVal; 
        let angle = (Math.PI * 2 * i / numPoints) - (Math.PI / 2);
        let pos = getCoordinates(angle, radius * scale);
        if (i === 0) ctx.moveTo(pos.x, pos.y); else ctx.lineTo(pos.x, pos.y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 240, 255, 0.4)'; ctx.fill(); ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2; ctx.stroke();
}

function showLevelUpModal(gridMessage) {
    document.getElementById('lu-new-level').innerText = gameState.player.level;
    document.getElementById('lu-new-energy').innerText = gameState.player.maxLikesEnergy;
    document.getElementById('lu-grid-msg').innerHTML = gridMessage;
    document.getElementById('modal-levelup').classList.remove('hidden');
}

function applyLevelUpTrait(traitKey) {
    gameState.player.traits[traitKey]++;
    document.getElementById('modal-levelup').classList.add('hidden');
    if (typeof showNotification === 'function') { showNotification(`Traço ${traitKey.toUpperCase()} aprimorado!`); }
    document.getElementById('tetris-game-area').classList.add('hidden');
    document.getElementById('arena-prep-screen').classList.remove('hidden');
    if (typeof switchTab === 'function') switchTab('tab-deck', document.querySelectorAll('.nav-item')[2]);
}
