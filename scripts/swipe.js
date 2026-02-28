/* ==========================================
   scripts/swipe.js
   Geração de Peças, Mecânica de Swipe e Loja
   ========================================== */

function getPieceHTML(p, scale = 1) {
    let eyeHtml = p.eyeStyle === 'eye-cyclops' ? '<div class="eye"></div>' : '<div class="eye"></div><div class="eye"></div>';
    return `<div class="tetromino-css ${p.shape} ${p.pattern}" style="color: ${p.color}; transform: scale(${scale});">
                <div class="t-block"></div><div class="t-block"></div><div class="t-block"></div><div class="t-block"></div>
                <div class="monster-eyes ${p.eyeStyle}">${eyeHtml}</div>
            </div>`;
}

function renderPieceRealHTML(p, scale = 1) {
    let blocks = '';
    for(let i=0; i<4; i++) blocks += `<div class="t-block"></div>`;
    let eyeTransform = p.shape === 'shape-diamond' ? 'rotate(-45deg)' : 'none';
    let eyeHtml = p.eyeStyle === 'eye-cyclops' ? '<div class="eye"></div>' : '<div class="eye"></div><div class="eye"></div>';
    return `<div class="tetromino-css ${p.shape} ${p.pattern}" style="color: ${p.color}; transform: scale(${scale});">
                ${blocks}
                <div class="monster-eyes ${p.eyeStyle}" style="transform: ${eyeTransform}; z-index: 5;">${eyeHtml}</div>
            </div>`;
}

function generateName() {
    const syl = ['tet', 'ro', 'min', 'ka', 'zu', 'la', 'pi', 'xo', 'bl', 'oc', 'ky'];
    return syl[Math.floor(Math.random()*syl.length)] + syl[Math.floor(Math.random()*syl.length)] + (Math.random()>0.5 ? syl[Math.floor(Math.random()*syl.length)] : '');
}

function generatePiece(isGacha = false) {
    let traitKeys = ['agressivo', 'estrategista', 'caotico', 'calmo', 'misterioso'];
    let t = traitKeys[Math.floor(Math.random() * traitKeys.length)];
    
    let power = ACTIVE_POWERS[Math.floor(Math.random() * ACTIVE_POWERS.length)];
    let curse = null;
    if(Math.random() <= 0.20) curse = CURSES[Math.floor(Math.random() * CURSES.length)];
    
    let bffShape = PIECE_SHAPES[Math.floor(Math.random() * PIECE_SHAPES.length)];
    let bffColor = PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)];

    let pColor = PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)];
    let pShape = PIECE_SHAPES[Math.floor(Math.random() * PIECE_SHAPES.length)];

    let initialStats = [
        `Vibe: ${t.toUpperCase()}`,
        `Poder: ${power.name}`,
        curse ? `Maldito(a): ${curse.name}` : `Personalidade Estável`,
        `Custo Base: 50 Peças`
    ];

    let piece = {
        id: 'p_' + Date.now() + Math.floor(Math.random()*1000),
        name: generateName().toUpperCase(),
        shape: pShape, color: pColor,
        pattern: PIECE_PATTERNS[Math.floor(Math.random() * PIECE_PATTERNS.length)],
        eyeStyle: ['','eye-slit','eye-cyclops'][Math.floor(Math.random() * 3)],
        mainTrait: t, power: power, curse: curse, bff: { shape: bffShape, color: bffColor },
        efficacy: 1, cost: 50, level: 1, xp: 0,
        timestamp: null, compatibility: 0, affinity: 0,
        messages: [],
        knownStats: initialStats.sort(()=>Math.random()-0.5).slice(0, 2),
        lastCommands: {},
        rotation: 0
    };

    if(isGacha) return piece;

    currentPiece = piece;
    document.getElementById('pc-name').innerText = currentPiece.name;
    document.getElementById('pc-render-area').innerHTML = renderPieceRealHTML(currentPiece, 1.2);
    document.getElementById('pc-info').innerText = currentPiece.knownStats.join(' | ');
}

function swipePiece(isLike, isSuperLike = false) {
    gameState.stats.totalSwipes++;
    
    if (isLike || isSuperLike) {
        if (gameState.player.likesEnergy <= 0 && !isSuperLike) { 
            showNotification("Sem energia! Aguarde recarregar."); 
            return; 
        }
        if(!isSuperLike) {
            gameState.player.likesEnergy--;
            currentPiece.timestamp = Date.now();
            gameState.pendingAnalysis.push(currentPiece);
            showNotification(`Curtiu ${currentPiece.name}. Aguarde a análise.`);
        } else {
            currentPiece.compatibility = 100; 
            currentPiece.affinity = 10;
            gameState.capturedPieces.push(currentPiece);
            showNotification(`🌟 SUPER LIKE! ${currentPiece.name} já está no seu Chat!`);
        }
        if (typeof updateHUD === 'function') updateHUD();
    }
    
    const card = document.getElementById('piece-card');
    card.style.transform = isLike ? 'translateX(100px) rotate(10deg)' : 'translateX(-100px) rotate(-10deg)'; 
    card.style.opacity = '0';
    
    setTimeout(() => { 
        generatePiece(); 
        card.style.transition = 'none'; 
        card.style.transform = 'translateX(0) rotate(0)'; 
        setTimeout(() => { 
            card.style.transition = 'transform 0.3s, opacity 0.3s'; 
            card.style.opacity = '1'; 
        }, 50); 
    }, 300);
}

function useSuperLike() {
    let slItem = gameState.inventoryItems.find(i => i.id === 'super_like');
    if(slItem && slItem.qty > 0) { 
        slItem.qty--; 
        swipePiece(true, true); 
    } else { 
        showNotification("Você não tem Super Likes! Compre na Loja."); 
    }
}

function renderShop() {
    const shop = document.getElementById('shop-container');
    shop.innerHTML = `
        <div class="shop-item">
            <div class="shop-item-info">
                <h4>Caixa Misteriosa de Tetromino</h4>
                <p>Receba 1 peça aleatória IMEDIATAMENTE. (Custa 50 Poeira)</p>
            </div>
            <button class="btn-buy" onclick="buyGachaBox()">Comprar</button>
        </div>
        <div class="shop-item">
            <div class="shop-item-info">
                <h4>Super Like (x1)</h4>
                <p>Garante 100% de Match instantâneo no Swipe. (Custa 100 Moedas)</p>
            </div>
            <button class="btn-buy" onclick="buyItem('super_like', 'Super Like', 100, 'money')">Comprar</button>
        </div>
    `;
}

function buyGachaBox() {
    if(gameState.player.dust >= 50) { 
        gameState.player.dust -= 50; 
        if (typeof updateHUD === 'function') updateHUD(); 
        
        let newPiece = generatePiece(true); 
        newPiece.compatibility = 100; 
        gameState.capturedPieces.push(newPiece); 
        
        showNotification(`📦 Encontrou: ${newPiece.name}! Veja no Chat.`); 
    } else { 
        showNotification("Poeira insuficiente. Recicle peças no Chat para ganhar poeira."); 
    }
}

function buyItem(id, name, cost, currency) {
    if(gameState.player[currency] >= cost) { 
        gameState.player[currency] -= cost; 
        let item = gameState.inventoryItems.find(i => i.id === id); 
        if(item) item.qty++; 
        else gameState.inventoryItems.push({ id: id, name: name, qty: 1 }); 
        
        if (typeof updateHUD === 'function') updateHUD(); 
        showNotification(`Comprado: ${name}`); 
    } else { 
        showNotification(`Saldo insuficiente.`); 
    }
}

setInterval(() => {
    if(!gameState.inGame) return;
    
    if (gameState.player.likesEnergy < gameState.player.maxLikesEnergy) { 
        if(Date.now() - gameState.player.lastEnergyTime >= 300000) { 
            gameState.player.likesEnergy++; 
            gameState.player.lastEnergyTime = Date.now(); 
            if (typeof updateHUD === 'function') updateHUD(); 
        } 
    } else { 
        gameState.player.lastEnergyTime = Date.now(); 
    }
    
    let matchesFound = 0; 
    const now = Date.now();
    
    gameState.pendingAnalysis = gameState.pendingAnalysis.filter(p => {
        if (now - p.timestamp >= 60000) { 
            let maxTrait = Math.max(...Object.values(gameState.player.traits));
            p.compatibility = 40 + (maxTrait > 0 ? (gameState.player.traits[p.mainTrait] / maxTrait) * 60 : 0);
            
            if (p.compatibility >= 60 && Math.random() <= 0.50) { 
                gameState.capturedPieces.push(p); 
                matchesFound++; 
            }
            return false; 
        } 
        return true; 
    });
    
    if(matchesFound > 0) { 
        showNotification(`🔥 Você tem ${matchesFound} novo(s) match(es)!`); 
        if(document.getElementById('tab-chat') && !document.getElementById('tab-chat').classList.contains('hidden') && !activeChatId) { 
            if (typeof renderChatList === 'function') renderChatList(); 
        } 
    }
}, 1000);
