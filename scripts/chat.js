/* ==========================================
   scripts/chat.js
   Motor de Conversa, Upgrades e Sinergias
   ========================================== */

document.getElementById('chat-input-field').addEventListener('keypress', function (e) { 
    if (e.key === 'Enter') sendChatMessage(); 
});

function renderChatList() {
    const view = document.getElementById('chat-list-view'); 
    view.innerHTML = '';
    
    if(gameState.capturedPieces.length === 0) { 
        view.innerHTML = '<p style="color:var(--text-muted); text-align:center; margin-top:20px;">Nenhum Match. Continue a fazer Swipe!</p>'; 
        return; 
    }
    
    gameState.capturedPieces.forEach(p => {
        const div = document.createElement('div'); 
        div.className = 'chat-list-item';
        let equipped = gameState.player.equippedPieces.includes(p.id) ? '<span style="color:var(--accent-gold); font-size:12px;">[No Grid]</span>' : '';
        
        div.innerHTML = `
            <div style="display:flex; align-items:center;">
                <div class="mini-avatar">${renderPieceRealHTML(p, 0.3)}</div>
                <div>
                    <b style="color:var(--accent-blue)">${p.name}</b> ${equipped}<br>
                    <small style="color:var(--text-muted);">Afinidade: ${p.affinity} | Nv. ${p.level}</small>
                </div>
            </div>
            <span style="color:var(--accent-green); font-size:20px;">💬</span>
        `;
        div.onclick = () => openChatWindow(p.id);
        view.appendChild(div);
    });
}

function openChatWindow(id) {
    activeChatId = id; 
    const p = gameState.capturedPieces.find(x => x.id === id);
    
    document.getElementById('chat-active-mini').innerHTML = renderPieceRealHTML(p, 0.3); 
    document.getElementById('chat-active-name').innerText = p.name;
    document.getElementById('chat-list-view').classList.add('hidden'); 
    document.getElementById('chat-window').classList.remove('hidden'); 
    
    renderChatMessages();
}

function closeChatWindow() { 
    activeChatId = null; 
    document.getElementById('chat-window').classList.add('hidden'); 
    document.getElementById('chat-list-view').classList.remove('hidden'); 
    renderChatList(); 
}

function renderChatMessages() {
    const c = document.getElementById('chat-messages-container'); 
    c.innerHTML = '';
    
    const p = gameState.capturedPieces.find(x => x.id === activeChatId); 
    if(!p) return;
    
    if(p.messages.length === 0) {
        p.messages.push({ sender: 'monster', text: `E aí! Onde eu me encaixo? (Usa os comandos)` });
    }
    
    p.messages.forEach(msg => { 
        const div = document.createElement('div'); 
        div.className = `bubble ${msg.sender}`; 
        div.innerText = msg.text; 
        c.appendChild(div); 
    });
    
    c.scrollTop = c.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById('chat-input-field'); 
    let cmdRaw = input.value.trim().toLowerCase();
    
    if(!cmdRaw || !activeChatId) return; 
    const p = gameState.capturedPieces.find(x => x.id === activeChatId); 
    input.value = ''; 
    
    const playerDialogueMap = {
        'segredo': ["Me conta um segredo seu?", "Tem alguma fofoca do grid?", "O que você esconde?"],
        'status': ["Ei, me mostra como você tá.", "Qual é o seu status atual?", "Quero ver seus atributos."],
        'upar poder': ["Vamos deixar seu poder mais forte!", "Hora do treino: Aumentar Eficácia!", "Investindo em você: Upar Poder."],
        'upar custo': ["Preciso que você carregue mais rápido.", "Vamos diminuir esse custo de energia.", "Treino de agilidade: Reduzir Custo."],
        'foto': ["Manda aquela foto da sinergia?", "Quero ver onde você se encaixa melhor.", "Revela sua combinação perfeita."],
        'bloquear': ["Não tá dando certo. Tchau.", "Vou ter que te reciclar...", "Fim da linha pra nós."]
    };

    let playerText = cmdRaw;
    if (playerDialogueMap[cmdRaw]) {
        const options = playerDialogueMap[cmdRaw];
        playerText = options[Math.floor(Math.random() * options.length)];
    }

    p.messages.push({ sender: 'player', text: playerText }); 
    renderChatMessages();

    const botReplies = { 
        'segredo': ["Escuta só:", "Fofoca rápida:", "Isso fica entre nós:"], 
        'confuso': ["Não entendi.", "Manda 'segredo', 'status', 'upar poder', 'upar custo' ou 'foto'."] 
    };

    setTimeout(() => {
        if(cmdRaw === 'segredo' || cmdRaw === 'status') {
            let secrets = [ 
                `Poder: ${p.power.desc}`, 
                `Custo de Carga: ${p.cost} peças`, 
                `Nível de Eficácia: ${p.efficacy}`, 
                p.curse ? `Maldição: ${p.curse.desc}` : `Sem Maldições`, 
                `Fofoca: Adoro encaixar-me perto de peças com a cor ${p.bff.color}.` 
            ];
            
            let unknown = secrets.filter(s => !p.knownStats.includes(s));
            
            if(unknown.length > 0) { 
                let rev = unknown[Math.floor(Math.random()*unknown.length)]; 
                p.knownStats.push(rev); 
                p.affinity += 2; 
                let prefix = cmdRaw === 'segredo' ? botReplies['segredo'][Math.floor(Math.random()*3)] + " " : "";
                p.messages.push({ sender: 'monster', text: prefix + rev }); 
            } else { 
                p.messages.push({ sender: 'monster', text: `Tu já sabes tudo sobre mim. Abre o meu perfil lá em cima!` }); 
            }
        }
        else if(cmdRaw === 'upar poder' || cmdRaw === 'upar custo') {
            if(gameState.player.likesEnergy >= 1 && gameState.player.money >= 20) {
                gameState.player.likesEnergy--; 
                gameState.player.money -= 20; 
                if (typeof updateHUD === 'function') updateHUD();
                
                if(Math.random() <= (p.compatibility / 100) + 0.15) { 
                    if(cmdRaw === 'upar poder') p.efficacy += 1; 
                    if(cmdRaw === 'upar custo') p.cost = Math.max(20, p.cost - 5); // Cai de 5 em 5. Mínimo 20.
                    p.affinity += 5; 
                    p.messages.push({ sender: 'monster', text: `Aí sim! Sinto o poder aumentando!` }); 
                } else { 
                    p.messages.push({ sender: 'monster', text: `Ugh... o treino não rendeu. Tenta de novo.` }); 
                }
            } else { 
                p.messages.push({ sender: 'monster', text: `Tô sem energia ou você tá sem grana. (Requer 1 Like, 20 Moedas)` }); 
            }
        }
        else if(cmdRaw === 'foto') {
            if(gameState.player.likesEnergy < 3) { 
                p.messages.push({ sender: 'monster', text: `Mandar a foto perfeita custa energia! (3 Likes)` }); 
            } else {
                gameState.player.likesEnergy -= 3; 
                if (typeof updateHUD === 'function') updateHUD();
                
                if(p.affinity >= 20) { 
                    p.messages.push({ sender: 'monster', text: `Tá na mão. Olha essa combinação de milhões!` }); 
                    renderChatMessages(); 
                    setTimeout(() => openPhotoOverlay(p), 1000); 
                    return; 
                } else { 
                    p.messages.push({ sender: 'monster', text: `A gente ainda não tem essa intimidade toda... (Requer 20+ Afinidade)` }); 
                }
            }
        }
        else if(cmdRaw === 'bloquear') { 
            p.messages.push({ sender: 'monster', text: `Fui.` }); 
            renderChatMessages(); 
            setTimeout(() => { blockPiece(); }, 1000); 
            return; 
        }
        else { 
            p.messages.push({ sender: 'monster', text: botReplies['confuso'][Math.floor(Math.random()*2)] }); 
        }
        
        renderChatMessages();
    }, 1000);
}

function openPieceProfile() {
    const modal = document.getElementById('modal-piece-profile'); 
    if(!activeChatId) return; 
    
    const p = gameState.capturedPieces.find(x => x.id === activeChatId);
    
    document.getElementById('modal-p-name').innerText = p.name; 
    document.getElementById('modal-p-render').innerHTML = renderPieceRealHTML(p, 1);
    
    let statsHTML = `<b>Nível:</b> ${p.level} (XP: ${p.xp})<br><b>Afinidade:</b> ${p.affinity}<br><b>Poder:</b> ${p.power.name} (Nv. ${p.efficacy})<br><b>Custo:</b> ${p.cost} Peças<br><br><b>Anotações Descobertas:</b><br>`;
    statsHTML += p.knownStats.map(s => `• ${s}`).join('<br>'); 
    
    document.getElementById('modal-p-stats').innerHTML = statsHTML;
    modal.classList.remove('hidden');
}

function blockPiece() {
    if(!activeChatId) return; 
    const p = gameState.capturedPieces.find(x => x.id === activeChatId);
    
    if(confirm(`Queres mesmo reciclar a peça ${p.name}? Ganharás Poeira e Moedas, mas perderás a peça permanentemente.`)) {
        gameState.player.money += 20; 
        gameState.player.dust += 15;
        
        if(gameState.player.equippedPieces.includes(p.id)) { 
            gameState.player.equippedPieces.splice(gameState.player.equippedPieces.indexOf(p.id), 1); 
        }
        
        gameState.capturedPieces = gameState.capturedPieces.filter(x => x.id !== p.id);
        
        if (typeof showNotification === 'function') showNotification(`Peça Reciclada! +20 Moedas, +15 Poeira.`); 
        if (typeof updateHUD === 'function') updateHUD(); 
        if (typeof closeModal === 'function') closeModal('modal-piece-profile'); 
        
        closeChatWindow();
    }
}

function openPhotoOverlay(p) {
    const overlay = document.getElementById('modal-photo'); 
    const canvas = document.getElementById('photo-canvas-area');
    
    let bffFakePiece = { shape: p.bff.shape, color: p.bff.color, pattern: '', eyeStyle: '' };
    
    canvas.style.background = `linear-gradient(135deg, ${p.color}, #111)`;
    canvas.innerHTML = `
        <div style="text-align:center; font-weight:bold; color:white; margin-top:20px; text-shadow:2px 2px 5px black;">Dica de Encaixe Perfeito</div>
        <div style="display:flex; justify-content:center; align-items:center; gap: 5px; margin-top: 50px; background:rgba(0,0,0,0.5); padding:20px; border-radius:10px;">
            ${renderPieceRealHTML(p, 1)}
            <span style="color:white; font-size:24px;">➕</span>
            ${renderPieceRealHTML(bffFakePiece, 1)}
        </div>
        <div style="position:absolute; bottom:20px; width:100%; text-align:center; color:rgba(255,255,255,0.7); font-size:12px;">Coloque-os lado a lado no Grid para bônus!</div>
    `;
    
    overlay.classList.remove('hidden');
}

function downloadWallpaper() { 
    html2canvas(document.getElementById('photo-canvas-area'), { backgroundColor: null, scale: 2 }).then(canvas => { 
        let link = document.createElement('a'); 
        link.download = `Sinergia_${Date.now()}.png`; 
        link.href = canvas.toDataURL("image/png"); 
        link.click(); 
    }); 
}
