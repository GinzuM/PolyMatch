/* ==========================================
   scripts/deck.js
   Deckbuilder, Grid RE4, Drag & Drop e Rotação
   ========================================== */

const SHAPE_MATRICES = {
    'shape-I': [[1], [1], [1], [1]],
    'shape-O': [[1, 1], [1, 1]],
    'shape-T': [[1, 1, 1], [0, 1, 0]],
    'shape-L': [[1, 0], [1, 0], [1, 1]],
    'shape-J': [[0, 1], [0, 1], [1, 1]],
    'shape-S': [[0, 1, 1], [1, 1, 0]],
    'shape-Z': [[1, 1, 0], [0, 1, 1]]
};

let draggedPieceId = null;
let dragGhost = null; 
const CELL_SIZE = 40; 

function rotateMatrix(matrix) {
    return matrix[0].map((val, index) => matrix.map(row => row[index]).reverse());
}

function getRotatedMatrix(baseMatrix, rotationDeg) {
    let m = baseMatrix;
    let rotations = ((rotationDeg || 0) / 90) % 4;
    for(let i = 0; i < rotations; i++) { m = rotateMatrix(m); }
    return m;
}

function generateRotatedBlocksHTML(p, rotation) {
    let matrix = getRotatedMatrix(SHAPE_MATRICES[p.shape], rotation || 0);
    let cols = matrix[0].length;
    let rows = matrix.length;
    
    let html = `<div style="position:relative; width:${cols * CELL_SIZE}px; height:${rows * CELL_SIZE}px;">`;
    for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] === 1) {
                html += `<div class="t-block" style="position:absolute; left:${c * CELL_SIZE}px; top:${r * CELL_SIZE}px; width:${CELL_SIZE}px; height:${CELL_SIZE}px; background-color:${p.color}; box-shadow: inset 0 0 8px rgba(0,0,0,0.4); border-radius:4px;"></div>`;
            }
        }
    }
    html += `</div>`;
    return html;
}

function renderInventoryGrid() {
    const gridContainer = document.getElementById('inventory-grid');
    gridContainer.innerHTML = '';
    
    let gw = gameState.player.gridWidth;
    let gh = gameState.player.gridHeight;
    
    gridContainer.style.gridTemplateColumns = `repeat(${gw}, ${CELL_SIZE}px)`;
    gridContainer.style.gridTemplateRows = `repeat(${gh}, ${CELL_SIZE}px)`;
    gridContainer.style.width = `${gw * CELL_SIZE}px`;
    gridContainer.style.height = `${gh * CELL_SIZE}px`;

    for (let r = 0; r < gh; r++) {
        for (let c = 0; c < gw; c++) {
            let cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            gridContainer.appendChild(cell);
        }
    }

    let gridMap = Array(gh).fill().map(() => Array(gw).fill(null));

    gameState.player.equippedPieces.forEach(pieceId => {
        let p = gameState.capturedPieces.find(x => x.id === pieceId);
        if(!p || p.gridX === undefined || p.gridY === undefined) return;

        let matrix = getRotatedMatrix(SHAPE_MATRICES[p.shape], p.rotation || 0);

        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] === 1) {
                    if(gridMap[p.gridY + r] !== undefined) {
                        gridMap[p.gridY + r][p.gridX + c] = p.id;
                    }
                }
            }
        }

        let pieceDom = document.createElement('div');
        pieceDom.className = 'equipped-piece';
        pieceDom.style.left = `${p.gridX * CELL_SIZE}px`;
        pieceDom.style.top = `${p.gridY * CELL_SIZE}px`;
        pieceDom.innerHTML = generateRotatedBlocksHTML(p, p.rotation);
        
        pieceDom.onclick = (e) => { e.stopPropagation(); unequipPiece(p.id); };
        gridContainer.appendChild(pieceDom);
    });

    gridContainer.dataset.map = JSON.stringify(gridMap);
    updateEquippedSummary();
}

function renderAvailablePieces() {
    const list = document.getElementById('available-pieces-list');
    list.innerHTML = '';
    
    let available = gameState.capturedPieces.filter(p => !gameState.player.equippedPieces.includes(p.id));
    if(available.length === 0) { list.innerHTML = '<p style="color:var(--text-muted); font-size:12px; margin:auto;">Nenhuma peça disponível.</p>'; return; }

    available.forEach(p => {
        let div = document.createElement('div');
        div.className = 'inventory-piece';
        div.draggable = true;
        
        div.addEventListener('click', () => { p.rotation = ((p.rotation || 0) + 90) % 360; renderAvailablePieces(); });
        div.addEventListener('dragstart', (e) => handleDragStart(e, p));
        div.addEventListener('dragend', handleDragEnd);

        if (typeof renderPieceRealHTML === 'function') {
            div.innerHTML = `
                <div class="level-badge">${p.level}</div>
                <div style="transform: rotate(${p.rotation || 0}deg); transform-origin: center; transition: transform 0.2s;">
                    ${renderPieceRealHTML(p, 0.6)}
                </div>
                <small style="margin-top:8px; color:var(--text-muted); font-size:10px;">${p.name}</small>
                <small style="color:var(--accent-gold); font-size:9px; margin-top:2px;">(Clique p/ Girar)</small>
            `;
        }
        list.appendChild(div);
    });
}

// --- DRAG AND DROP COM ESCALA ---
function handleDragStart(e, p) {
    draggedPieceId = p.id;
    e.currentTarget.classList.add('dragging');
    
    // Pega a escala atual pra criar o fantasma do tamanho exato da tela
    const scale = window.currentUIScale || 1;
    
    dragGhost = document.createElement('div');
    dragGhost.style.position = 'absolute';
    dragGhost.style.top = '-1000px'; 
    dragGhost.style.background = 'transparent';
    dragGhost.style.border = 'none';
    dragGhost.style.pointerEvents = 'none';

    // Aplica a escala na imagem gerada para o mouse segurar
    dragGhost.innerHTML = `
        <div style="transform: scale(${scale}); transform-origin: ${CELL_SIZE/2}px ${CELL_SIZE/2}px;">
            ${generateRotatedBlocksHTML(p, p.rotation)}
        </div>`;
    
    document.body.appendChild(dragGhost);
    e.dataTransfer.setDragImage(dragGhost, (CELL_SIZE/2) * scale, (CELL_SIZE/2) * scale); 
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    draggedPieceId = null;
    if(dragGhost) { document.body.removeChild(dragGhost); dragGhost = null; }
    clearHighlights();
}

const gridContainer = document.getElementById('inventory-grid');

gridContainer.addEventListener('dragover', (e) => {
    e.preventDefault(); 
    if(!draggedPieceId) return;

    const targetPos = calculateTargetCell(e);
    if(!targetPos) return clearHighlights();
    
    const p = gameState.capturedPieces.find(x => x.id === draggedPieceId);
    const matrix = getRotatedMatrix(SHAPE_MATRICES[p.shape], p.rotation);
    const isValid = canPlacePiece(matrix, targetPos.row, targetPos.col);

    drawHighlights(matrix, targetPos.row, targetPos.col, isValid);
});

gridContainer.addEventListener('dragleave', (e) => { if (e.target === gridContainer) clearHighlights(); });

gridContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    if(!draggedPieceId) return;
    
    const targetPos = calculateTargetCell(e);
    if(!targetPos) return;

    const p = gameState.capturedPieces.find(x => x.id === draggedPieceId);
    const matrix = getRotatedMatrix(SHAPE_MATRICES[p.shape], p.rotation);

    if(canPlacePiece(matrix, targetPos.row, targetPos.col)) {
        p.gridX = targetPos.col;
        p.gridY = targetPos.row;
        gameState.player.equippedPieces.push(p.id);
        
        if (typeof showNotification === 'function') showNotification(`${p.name} Equipado!`);
        renderInventoryGrid(); renderAvailablePieces();
    } else {
        if (typeof showNotification === 'function') showNotification("Posição inválida!");
        clearHighlights();
    }
});

// A Matemática atualizada que lê a barra de escala!
function calculateTargetCell(e) {
    const gridRect = document.getElementById('inventory-grid').getBoundingClientRect();
    const relativeX = e.clientX - gridRect.left;
    const relativeY = e.clientY - gridRect.top;
    
    const scale = window.currentUIScale || 1;
    const physicalCellSize = CELL_SIZE * scale;
    
    let col = Math.floor((relativeX - physicalCellSize/2) / physicalCellSize);
    let row = Math.floor((relativeY - physicalCellSize/2) / physicalCellSize);

    if ((relativeX % physicalCellSize) < physicalCellSize / 3) col = Math.floor(relativeX / physicalCellSize) -1;
    if ((relativeY % physicalCellSize) < physicalCellSize / 3) row = Math.floor(relativeY / physicalCellSize) -1;
    
    if (relativeX >= 0 && relativeX < physicalCellSize) col = 0;
    if (relativeY >= 0 && relativeY < physicalCellSize) row = 0;

    return { row, col };
}

function canPlacePiece(matrix, startRow, startCol) {
    const gridContainer = document.getElementById('inventory-grid');
    const gridMap = JSON.parse(gridContainer.dataset.map);
    const maxRow = gridMap.length;
    const maxCol = gridMap[0].length;

    for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] === 1) {
                let targetRow = startRow + r;
                let targetCol = startCol + c;
                if (targetRow < 0 || targetRow >= maxRow || targetCol < 0 || targetCol >= maxCol) return false;
                if (gridMap[targetRow][targetCol] !== null) return false;
            }
        }
    }
    return true;
}

function clearHighlights() { document.querySelectorAll('.grid-cell').forEach(c => c.style.backgroundColor = ''); }

function drawHighlights(matrix, startRow, startCol, isValid) {
    clearHighlights();
    const color = isValid ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 42, 85, 0.5)';
    
    for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] === 1) {
                let cell = document.querySelector(`.grid-cell[data-row="${startRow + r}"][data-col="${startCol + c}"]`);
                if (cell) cell.style.backgroundColor = color;
            }
        }
    }
}

function unequipPiece(pieceId) {
    gameState.player.equippedPieces = gameState.player.equippedPieces.filter(id => id !== pieceId);
    const p = gameState.capturedPieces.find(x => x.id === pieceId);
    if(p) { p.gridX = undefined; p.gridY = undefined; p.rotation = 0;}
    renderInventoryGrid(); renderAvailablePieces();
}

function updateEquippedSummary() {
    const summary = document.getElementById('equipped-summary');
    if(!summary) return;
    if(gameState.player.equippedPieces.length === 0) { summary.innerHTML = "Seu time está vazio. Tetris clássico (sem poderes)."; return; }

    let teamColors = {}; let html = "<b>Seu Time:</b><br>";
    
    gameState.player.equippedPieces.forEach(id => {
        let p = gameState.capturedPieces.find(x => x.id === id);
        html += `• ${p.name} (${p.power.name})<br>`;
        teamColors[p.color] = (teamColors[p.color] || 0) + 1;
    });

    let maxSameColor = Math.max(...Object.values(teamColors));
    let uniqueColors = Object.keys(teamColors).length;
    html += "<br><b>Sinergias Ativas:</b><br>";
    let hasSynergy = false;
    
    if (typeof COLOR_SYNERGIES !== 'undefined') {
        if(maxSameColor === 4) { html += "• " + COLOR_SYNERGIES[4] + "<br>"; hasSynergy = true; }
        else if(maxSameColor === 3) { html += "• " + COLOR_SYNERGIES[3] + "<br>"; hasSynergy = true; }
        else if(maxSameColor === 2 && uniqueColors === 2) { html += "• " + COLOR_SYNERGIES[2] + "<br>"; hasSynergy = true; }
        else if(uniqueColors >= 4) { html += "• " + COLOR_SYNERGIES['rainbow'] + "<br>"; hasSynergy = true; }
    }
    if(!hasSynergy) html += "• Nenhuma sinergia de cor ativa.";
    summary.innerHTML = html;
}
