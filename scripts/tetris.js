/* ==========================================
   scripts/tetris.js
   O Motor do Jogo, Ultimates e Maldições
   ========================================== */

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24; 

let canvas, ctx;
let board = [];
let gameLoop, garbageInterval;
let dropCounter = 0;
let dropInterval = 1000; 
let lastTime = 0;

let matchState = { score: 0, lines: 0, startTime: 0, isGameOver: false, frenzyMultiplier: 1, frenzyTimer: null, slowTimer: null, activeCurses: [], equippedData: [] };
let piece = null, nextPiece = null, holdPieceObj = null, hasHeld = false, nextIsUltimate = null;

const TETROMINOS = {
    'shape-I': [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    'shape-J': [[1,0,0],[1,1,1],[0,0,0]],
    'shape-L': [[0,0,1],[1,1,1],[0,0,0]],
    'shape-O': [[1,1],[1,1]],
    'shape-S': [[0,1,1],[1,1,0],[0,0,0]],
    'shape-T': [[0,1,0],[1,1,1],[0,0,0]],
    'shape-Z': [[1,1,0],[0,1,1],[0,0,0]]
};

function startTetris() {
    document.getElementById('arena-prep-screen').classList.add('hidden');
    document.getElementById('tetris-game-area').classList.remove('hidden');
    
    document.querySelector('.top-bar').classList.add('hidden');
    
    canvas = document.getElementById('tetris-canvas');
    ctx = canvas.getContext('2d');
    
    board = Array.from({length: ROWS}, () => Array(COLS).fill(null));
    matchState = { score: 0, lines: 0, startTime: Date.now(), isGameOver: false, frenzyMultiplier: 1, activeCurses: [], equippedData: [] };
    dropInterval = 1000; hasHeld = false; holdPieceObj = null; nextIsUltimate = null;

    setupEquippedDeck();
    document.getElementById('tetris-hold-render').innerHTML = '';
    updateScoreBoard();
    
    nextPiece = createRandomPiece();
    spawnPiece();
    
    if(matchState.activeCurses.includes('blind')) document.querySelector('.next-box').style.opacity = '0.1';
    else document.querySelector('.next-box').style.opacity = '1';

    if(matchState.activeCurses.includes('garbage')) garbageInterval = setInterval(addGarbageLine, 15000);

    document.addEventListener('keydown', handleInput);
    setupMobileControls();

    lastTime = performance.now();
    requestAnimationFrame(update);
}

function setupEquippedDeck() {
    const container = document.getElementById('tetris-ultimates');
    container.innerHTML = '';
    
    gameState.player.equippedPieces.forEach((id, index) => {
        let p = gameState.capturedPieces.find(x => x.id === id);
        if(!p) return;
        
        let ultData = {
            id: p.id, shape: p.shape, color: p.color, power: p.power.id,
            efficacy: p.efficacy, 
            cost: p.cost < 20 ? 50 : p.cost, 
            charge: 0, ready: false, uses: 0
        };
        matchState.equippedData.push(ultData);
        if(p.curse) matchState.activeCurses.push(p.curse.id);

        let btn = document.createElement('div');
        btn.className = 'ultimate-btn';
        btn.id = `btn-ult-${p.id}`;
        // Reduzido para scale 0.4 para caber no novo botão menor
        btn.innerHTML = `
            <div class="tetromino-css ${p.shape}" style="color: ${p.color}; transform: scale(0.4); transform-origin: center;">
                <div class="t-block"></div><div class="t-block"></div><div class="t-block"></div><div class="t-block"></div>
            </div>
            <div class="ultimate-cooldown-overlay" id="overlay-ult-${p.id}"></div>
            <div style="position:absolute; top:2px; left:5px; color:white; font-size:10px; font-weight:bold; z-index:5;">${index + 1}</div>
        `;
        btn.onclick = () => activateUltimate(p.id);
        container.appendChild(btn);
    });
}

function update(time = 0) {
    if(matchState.isGameOver) return;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) { movePiece(1, 0); dropCounter = 0; }
    draw();
    gameLoop = requestAnimationFrame(update);
}

function createRandomPiece() {
    const s = PIECE_SHAPES[Math.floor(Math.random() * PIECE_SHAPES.length)];
    const c = PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)];
    return { shapeName: s, matrix: TETROMINOS[s], color: c, isUltimate: false };
}

function spawnPiece() {
    if(nextIsUltimate) {
        let ult = matchState.equippedData.find(x => x.id === nextIsUltimate);
        piece = { shapeName: ult.shape, matrix: TETROMINOS[ult.shape], color: ult.color, isUltimate: true, power: ult.power, efficacy: ult.efficacy };
        nextIsUltimate = null;
    } else {
        piece = nextPiece;
        nextPiece = createRandomPiece();
    }
    
    piece.pos = { x: 3, y: 0 };
    hasHeld = false;
    
    if(!matchState.activeCurses.includes('blind')) {
        // Ajustado para scale 0.45 para alinhar no menu lateral estreito
        document.getElementById('tetris-next-render').innerHTML = `
            <div class="tetromino-css ${nextPiece.shapeName}" style="color: ${nextPiece.color}; transform: scale(0.45); transform-origin: center;">
                <div class="t-block"></div><div class="t-block"></div><div class="t-block"></div><div class="t-block"></div>
            </div>`;
    }

    if (collide(board, piece)) gameOver();
}

function draw() {
    ctx.fillStyle = '#0a0a0c'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(board, {x: 0, y: 0}); 
    
    let ghost = { matrix: piece.matrix, pos: { x: piece.pos.x, y: piece.pos.y }, color: 'rgba(255,255,255,0.1)' };
    while (!collide(board, ghost)) { ghost.pos.y++; }
    ghost.pos.y--;
    drawMatrix(ghost.matrix, ghost.pos, ghost.color, true);

    drawMatrix(piece.matrix, piece.pos, piece.color, false, piece.isUltimate);
}

function drawMatrix(matrix, offset, forcedColor = null, isGhost = false, isGlow = false) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0 && value !== null) {
                let color = forcedColor || value;
                ctx.fillStyle = color;
                ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                if(!isGhost) {
                    ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE - 1, 3);
                    ctx.fillStyle = 'rgba(0,0,0,0.4)';
                    ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE + BLOCK_SIZE - 4, BLOCK_SIZE - 1, 3);
                }
                if(isGlow) {
                    ctx.shadowBlur = 10; ctx.shadowColor = 'gold'; ctx.strokeStyle = 'white';
                    ctx.strokeRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                    ctx.shadowBlur = 0; 
                }
            }
        });
    });
}

function collide(board, p) {
    const m = p.matrix; const o = p.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (board[y + o.y] && board[y + o.y][x + o.x]) !== null) return true;
        }
    }
    return false;
}

function movePiece(dy, dx) {
    piece.pos.y += dy; piece.pos.x += dx;
    if (collide(board, piece)) {
        piece.pos.y -= dy; piece.pos.x -= dx;
        if (dy > 0) lockPiece(); 
    }
}

function rotatePiece() {
    const m = piece.matrix;
    const rotated = m[0].map((val, index) => m.map(row => row[index]).reverse());
    const prevMatrix = piece.matrix;
    piece.matrix = rotated;
    let offset = 1;
    while(collide(board, piece)) {
        piece.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > m[0].length) { piece.matrix = prevMatrix; piece.pos.x -= offset; return; }
    }
}

function hardDrop() { while (!collide(board, piece)) { piece.pos.y++; } piece.pos.y--; lockPiece(); }

function holdPiece() {
    if(hasHeld) return;
    if(!holdPieceObj) {
        holdPieceObj = { shapeName: piece.shapeName, color: piece.color }; spawnPiece();
    } else {
        let temp = { shapeName: piece.shapeName, color: piece.color };
        piece = { shapeName: holdPieceObj.shapeName, matrix: TETROMINOS[holdPieceObj.shapeName], color: holdPieceObj.color, isUltimate: false };
        piece.pos = { x: 3, y: 0 }; holdPieceObj = temp;
    }
    hasHeld = true;
    // Ajustado para scale 0.45 para alinhar no menu lateral estreito
    document.getElementById('tetris-hold-render').innerHTML = `
        <div class="tetromino-css ${holdPieceObj.shapeName}" style="color: ${holdPieceObj.color}; transform: scale(0.45); transform-origin: center;">
            <div class="t-block"></div><div class="t-block"></div><div class="t-block"></div><div class="t-block"></div>
        </div>`;
}

function lockPiece() {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) board[y + piece.pos.y][x + piece.pos.x] = piece.color;
        });
    });

    chargeUltimates(piece.shapeName);
    if(piece.isUltimate) triggerCandyCrushEffect(piece);

    clearLines();
    spawnPiece();
}

function chargeUltimates(shapeUsed) {
    matchState.equippedData.forEach(ult => {
        if(!ult.ready) {
            ult.charge += (ult.shape === shapeUsed) ? 2 : 1;
            
            let percent = (ult.charge / ult.cost) * 100;
            let overlay = document.getElementById(`overlay-ult-${ult.id}`);
            let btn = document.getElementById(`btn-ult-${ult.id}`);
            
            if(ult.charge >= ult.cost) {
                ult.ready = true;
                overlay.style.height = '0%';
                btn.classList.add('ready');
            } else {
                overlay.style.height = `${100 - percent}%`;
            }
        }
    });
}

function activateUltimate(id) {
    let ult = matchState.equippedData.find(x => x.id === id);
    if(ult && ult.ready) {
        nextIsUltimate = id;
        ult.ready = false; ult.charge = 0; ult.uses++;
        
        let overlay = document.getElementById(`overlay-ult-${ult.id}`);
        let btn = document.getElementById(`btn-ult-${ult.id}`);
        overlay.style.height = '100%';
        btn.classList.remove('ready');
        
        if (typeof showNotification === 'function') showNotification("Ultimate Invocada! A próxima peça brilhará.");
    }
}

function triggerCandyCrushEffect(ultPiece) {
    const py = ultPiece.pos.y; const px = ultPiece.pos.x; const eff = ultPiece.efficacy; 
    
    if (typeof showNotification === 'function') showNotification(`Ativando: ${ultPiece.power.toUpperCase()} (Nível ${eff})!`);

    if(ultPiece.power === 'bomb') {
        let radius = eff; 
        for(let r = py - radius; r <= py + 2 + radius; r++) { 
            for(let c = px - radius; c <= px + 2 + radius; c++) {
                if(r >= 0 && r < ROWS && c >= 0 && c < COLS) board[r][c] = null;
            }
        }
        applyStickyGravity();
    }
    else if(ultPiece.power === 'laser') {
        let spread = Math.floor((eff - 1) / 2); 
        let centerRow = py + 1; let centerCol = px + 1;
        
        for(let r = centerRow - spread; r <= centerRow + spread; r++) { if(r >= 0 && r < ROWS) board[r].fill(null); }
        for(let c = centerCol - spread; c <= centerCol + spread; c++) {
            if(c >= 0 && c < COLS) { for(let i=0; i<ROWS; i++) board[i][c] = null; }
        }
        applyStickyGravity();
    }
    else if(ultPiece.power === 'color_wipe') {
        let colorsToWipe = [ultPiece.color];
        if(eff > 1) colorsToWipe.push(PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)]);
        for(let r=0; r<ROWS; r++) {
            for(let c=0; c<COLS; c++) {
                if(colorsToWipe.includes(board[r][c])) board[r][c] = null;
            }
        }
        applyStickyGravity();
    }
    else if(ultPiece.power === 'time_slow') {
        let duration = 5000 + (eff * 1000); 
        dropInterval = 3000; 
        if(matchState.slowTimer) clearTimeout(matchState.slowTimer);
        matchState.slowTimer = setTimeout(() => { dropInterval = Math.max(100, 1000 - (matchState.lines * 10)); }, duration);
    }
    else if(ultPiece.power === 'frenzy') {
        matchState.frenzyMultiplier = 1 + eff; 
        if(matchState.frenzyTimer) clearTimeout(matchState.frenzyTimer);
        matchState.frenzyTimer = setTimeout(() => { matchState.frenzyMultiplier = 1; }, 15000 + (eff*2000));
    }
}

function applyStickyGravity() {
    for(let c = 0; c < COLS; c++) {
        let emptySpots = 0;
        for(let r = ROWS - 1; r >= 0; r--) {
            if(board[r][c] === null) { emptySpots++; } 
            else if(emptySpots > 0) { board[r + emptySpots][c] = board[r][c]; board[r][c] = null; }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    outer: for (let y = ROWS - 1; y >= 0; --y) {
        for (let x = 0; x < COLS; ++x) { if (board[y][x] === null) continue outer; }
        const row = board.splice(y, 1)[0].fill(null);
        board.unshift(row); ++y; linesCleared++;
    }

    if (linesCleared > 0) {
        matchState.lines += linesCleared;
        let basePoints = [0, 40, 100, 300, 1200][linesCleared];
        matchState.score += (basePoints * matchState.frenzyMultiplier);
        if(!matchState.slowTimer) dropInterval = Math.max(100, 1000 - (matchState.lines * 10));
        updateScoreBoard();
    }
}

function updateScoreBoard() {
    document.getElementById('t-score').innerText = matchState.score;
    document.getElementById('t-lines').innerText = matchState.lines;
}

function addGarbageLine() {
    if(matchState.isGameOver) return;
    board.shift(); 
    let newRow = Array(COLS).fill('#555'); 
    newRow[Math.floor(Math.random() * COLS)] = null; 
    board.push(newRow);
}

function gameOver() {
    matchState.isGameOver = true;
    cancelAnimationFrame(gameLoop);
    if(garbageInterval) clearInterval(garbageInterval);
    document.removeEventListener('keydown', handleInput);
    
    document.querySelector('.top-bar').classList.remove('hidden');
    
    let timeSurvived = Math.floor((Date.now() - matchState.startTime) / 1000);
    let xpGained = matchState.score / 10;
    let coinsGained = Math.floor(matchState.score / 50);

    if(matchState.activeCurses.includes('heavy')) { xpGained *= 3; coinsGained *= 3; }

    gameState.player.money += coinsGained;
    
    matchState.equippedData.forEach(ult => {
        let p = gameState.capturedPieces.find(x => x.id === ult.id);
        if(p && ult.uses > 0) {
            p.xp += (xpGained * ult.uses);
            if(p.xp >= p.level * 100) { p.level++; p.xp = 0; }
        }
    });

    gameState.player.xp += xpGained;
    let xpReq = gameState.player.level * 500;
    let leveledUp = false;
    let gridMsg = "";

    if(gameState.player.xp >= xpReq) {
        gameState.player.xp -= xpReq; 
        gameState.player.level++;
        gameState.player.maxLikesEnergy++; 
        gameState.player.likesEnergy = gameState.player.maxLikesEnergy;
        leveledUp = true;

        const MAX_GRID_WIDTH = 10; const MAX_GRID_HEIGHT = 10;
        if (gameState.player.gridWidth < MAX_GRID_WIDTH || gameState.player.gridHeight < MAX_GRID_HEIGHT) {
            if(gameState.player.gridWidth <= gameState.player.gridHeight && gameState.player.gridWidth < MAX_GRID_WIDTH) {
                gameState.player.gridWidth++;
            } else if (gameState.player.gridHeight < MAX_GRID_HEIGHT) {
                gameState.player.gridHeight++;
            }
            gridMsg = "Seu Inventário Cresceu!";
        } else {
            gameState.player.money += 200; gameState.player.dust += 100;
            gridMsg = "Inventário Máximo! Bônus de 200 Moedas.";
        }
    }

    if (typeof updateHUD === 'function') updateHUD();

    const modal = document.getElementById('modal-piece-profile');
    document.getElementById('modal-p-name').innerText = "FIM DE JOGO";
    document.getElementById('modal-p-render').innerHTML = `<h1 style="color:var(--accent-red); margin:20px 0;">GAME OVER</h1>`;
    
    let statsHTML = `<b>Sobrevivência:</b> ${timeSurvived}s<br><b>Linhas:</b> ${matchState.lines}<br><b>Score:</b> ${matchState.score}<br><br><b style="color:var(--accent-green);">Recompensas:</b><br>+ ${coinsGained} Moedas<br>+ ${xpGained.toFixed(0)} XP`;
    document.getElementById('modal-p-stats').innerHTML = statsHTML;
    
    let btns = modal.querySelectorAll('button');
    btns.forEach(b => b.style.display = 'none');
    
    let closeBtn = document.createElement('button');
    closeBtn.className = 'btn-primary'; closeBtn.innerText = "Continuar";
    closeBtn.style.marginTop = '15px';
    
    closeBtn.onclick = () => {
        modal.classList.add('hidden');
        btns.forEach(b => b.style.display = 'block'); 
        closeBtn.remove();
        
        if(leveledUp) {
            if(typeof showLevelUpModal === 'function') showLevelUpModal(gridMsg);
        } else {
            document.getElementById('tetris-game-area').classList.add('hidden');
            document.getElementById('arena-prep-screen').classList.remove('hidden');
            if (typeof switchTab === 'function') switchTab('tab-deck', document.querySelectorAll('.nav-item')[2]); 
        }
    };
    modal.querySelector('.modal-content').appendChild(closeBtn);
    modal.classList.remove('hidden');
}

function handleInput(e) {
    if(matchState.isGameOver) return;
    if(document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

    switch(e.key) {
        case 'ArrowLeft': case 'a': case 'A': movePiece(0, -1); break;
        case 'ArrowRight': case 'd': case 'D': movePiece(0, 1); break;
        case 'ArrowDown': case 's': case 'S': movePiece(1, 0); break;
        case 'ArrowUp': case 'w': case 'W': rotatePiece(); break;
        case ' ': hardDrop(); break;
        case 'c': case 'C': case 'Shift': holdPiece(); break;
        case '1': if(matchState.equippedData[0]) activateUltimate(matchState.equippedData[0].id); break;
        case '2': if(matchState.equippedData[1]) activateUltimate(matchState.equippedData[1].id); break;
        case '3': if(matchState.equippedData[2]) activateUltimate(matchState.equippedData[2].id); break;
        case '4': if(matchState.equippedData[3]) activateUltimate(matchState.equippedData[3].id); break;
    }
}

function setupMobileControls() {
    const dpad = document.getElementById('virtual-dpad');
    if(!dpad) return;
    dpad.innerHTML = `
        <div class="dpad-btn" onclick="holdPiece()">🔄</div>
        <div class="dpad-btn" onclick="rotatePiece()">↻</div>
        <div class="dpad-btn" onclick="hardDrop()">⏬</div>
        <div class="dpad-btn" onclick="movePiece(0, -1)">⬅️</div>
        <div class="dpad-btn" onclick="movePiece(1, 0)">⬇️</div>
        <div class="dpad-btn" onclick="movePiece(0, 1)">➡️</div>
    `;
}
