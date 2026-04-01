// ============================================================
// LUJEUX - SCRIPT PRINCIPAL AVEC 12 JEUX FONCTIONNELS
// ============================================================

// ===== DONNÉES DES JEUX =====
const games = [
    {
        id: 'snake',
        name: 'Snake 🐍',
        category: 'classique',
        icon: '🐍',
        description: 'Le classique jeu du serpent. Mangez pour grandir !'
    },
    {
        id: 'space-invaders',
        name: 'Space Invaders 👾',
        category: 'arcade',
        icon: '👾',
        description: 'Détruisez les envahisseurs spatiaux !'
    },
    {
        id: 'tetris',
        name: 'Tetris 🧱',
        category: 'puzzle',
        icon: '🧱',
        description: 'Assemblez les blocs tombants.'
    },
    {
        id: 'pong',
        name: 'Pong 🏓',
        category: 'classique',
        icon: '🏓',
        description: 'Le tennis classique contre l\'IA.'
    },
    {
        id: 'memory',
        name: 'Memory 🧠',
        category: 'puzzle',
        icon: '🧠',
        description: 'Trouvez les paires de cartes.'
    },
    {
        id: 'tictactoe',
        name: 'Morpion ⭕',
        category: 'strategie',
        icon: '⭕',
        description: 'Alignez 3 symboles pour gagner.'
    },
    {
        id: 'breakout',
        name: 'Breakout 🔴',
        category: 'arcade',
        icon: '🔴',
        description: 'Cassez toutes les briques !'
    },
    {
        id: '2048',
        name: '2048 🔢',
        category: 'puzzle',
        icon: '🔢',
        description: 'Fusionnez les tuiles pour atteindre 2048.'
    },
    {
        id: 'reaction',
        name: 'Test Réaction ⚡',
        category: 'reflexe',
        icon: '⚡',
        description: 'Testez vos réflexes !'
    },
    {
        id: 'clickspeed',
        name: 'Click Speed 🖱️',
        category: 'reflexe',
        icon: '🖱️',
        description: 'Clics rapides en 10 secondes.'
    },
    {
        id: 'quiz',
        name: 'Quiz Culture ❓',
        category: 'strategie',
        icon: '❓',
        description: 'Testez vos connaissances.'
    },
    {
        id: 'numberguess',
        name: 'Nombre Mystère 🔮',
        category: 'strategie',
        icon: '🔮',
        description: 'Devinez le nombre secret.'
    }
];

// ===== VARIABLES GLOBALES =====
let currentGame = null;
let gameInterval = null;
let score = 0;
let level = 1;

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    renderGames();
    setupEventListeners();
});

// ===== FONCTIONS UTILITAIRES =====
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

function updateScoreDisplay() {
    document.getElementById('gameScore').innerHTML = `<i class="fas fa-star"></i> Score: ${score}`;
    document.getElementById('gameLevel').innerHTML = `<i class="fas fa-layer-group"></i> Niveau: ${level}`;
}

// ===== RENDU DES JEUX =====
function renderGames(filter = 'all') {
    const gamesGrid = document.getElementById('gamesGrid');
    gamesGrid.innerHTML = '';

    const filteredGames = filter === 'all' 
        ? games 
        : games.filter(game => game.category === filter);

    filteredGames.forEach((game, index) => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.style.animationDelay = `${index * 0.1}s`;
        
        // Dégradés différents pour chaque carte
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
        ];
        
        gameCard.innerHTML = `
            <div class="game-preview" style="background: ${gradients[index % gradients.length]}">
                ${game.icon}
            </div>
            <div class="game-info">
                <h3>${game.name}</h3>
                <div class="game-meta">
                    <span class="game-tag">${game.category}</span>
                </div>
                <p class="game-description">${game.description}</p>
                <button class="play-button" onclick="openGame('${game.id}')">
                    <i class="fas fa-play"></i> Jouer
                </button>
            </div>
        `;
        
        gamesGrid.appendChild(gameCard);
    });
}

function filterGames(category) {
    renderGames(category);
    scrollToSection('jeux');
}

// ===== ÉVÉNEMENTS =====
function setupEventListeners() {
    // Fermer modal avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeGame();
    });

    // Fermer modal en cliquant à l'extérieur
    document.getElementById('gameModal').addEventListener('click', (e) => {
        if (e.target.id === 'gameModal') closeGame();
    });
}

// ===== GESTION DES JEUX =====
function openGame(gameId) {
    currentGame = gameId;
    score = 0;
    level = 1;
    
    const game = games.find(g => g.id === gameId);
    document.getElementById('modalTitle').textContent = game.name;
    updateScoreDisplay();
    
    loadGame(gameId);
    
    document.getElementById('gameModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    document.getElementById('gameModal').classList.remove('active');
    document.body.style.overflow = 'auto';
    currentGame = null;
}

function restartGame() {
    if (currentGame) {
        closeGame();
        setTimeout(() => openGame(currentGame), 150);
    }
}

// ===== CHARGEMENT DES JEUX =====
function loadGame(gameId) {
    const container = document.getElementById('gameContainer');
    
    switch(gameId) {
        case 'snake': initSnake(container); break;
        case 'space-invaders': initSpaceInvaders(container); break;
        case 'tetris': initTetris(container); break;
        case 'pong': initPong(container); break;
        case 'memory': initMemory(container); break;
        case 'tictactoe': initTicTacToe(container); break;
        case 'breakout': initBreakout(container); break;
        case '2048': init2048(container); break;
        case 'reaction': initReactionTest(container); break;
        case 'clickspeed': initClickSpeed(container); break;
        case 'quiz': initQuiz(container); break;
        case 'numberguess': initNumberGuess(container); break;
    }
}

// ============================================================
// JEUX FONCTIONNELS
// ============================================================

// ===== 1. SNAKE =====
function initSnake(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="snakeCanvas" width="400" height="400" 
                    style="background:#f8f9fa;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            </canvas>
            <p style="margin-top:1rem;color:#718096;font-size:0.9rem;">
                <i class="fas fa-keyboard"></i> Utilisez les flèches directionnelles
            </p>
        </div>
    `;
    
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    let snake = [{x: 10, y: 10}];
    let food = {x: 15, y: 15};
    let dx = 0, dy = 0;
    
    function draw() {
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Serpent
        snake.forEach((segment, i) => {
            ctx.fillStyle = i === 0 ? '#667eea' : '#764ba2';
            ctx.beginPath();
            ctx.roundRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2, 4);
            ctx.fill();
        });
        
        // Nourriture
        ctx.fillStyle = '#f093fb';
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouvement
        if (dx !== 0 || dy !== 0) {
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount ||
                snake.some(s => s.x === head.x && s.y === head.y)) {
                clearInterval(gameInterval);
                alert(`Game Over! Score: ${score}`);
                return;
            }
            
            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                updateScoreDisplay();
                placeFood();
            } else {
                snake.pop();
            }
        }
    }
    
    function placeFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    }
    
    document.addEventListener('keydown', (e) => {
        if (currentGame !== 'snake') return;
        switch(e.key) {
            case 'ArrowUp': if (dy !== 1) { dx = 0; dy = -1; } break;
            case 'ArrowDown': if (dy !== -1) { dx = 0; dy = 1; } break;
            case 'ArrowLeft': if (dx !== 1) { dx = -1; dy = 0; } break;
            case 'ArrowRight': if (dx !== -1) { dx = 1; dy = 0; } break;
        }
    });
    
    gameInterval = setInterval(draw, 120);
}

// ===== 2. SPACE INVADERS =====
function initSpaceInvaders(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="spaceCanvas" width="500" height="400"
                    style="background:#1a1a2e;border-radius:12px;"></canvas>
            <p style="margin-top:1rem;color:#718096;font-size:0.9rem;">
                <i class="fas fa-arrows-alt"></i> Flèches: déplacer | Espace: tirer
            </p>
        </div>
    `;
    
    const canvas = document.getElementById('spaceCanvas');
    const ctx = canvas.getContext('2d');
    
    let player = { x: 225, y: 360, w: 50, h: 16 };
    let bullets = [];
    let enemies = [];
    let dir = 1;
    
    for (let i = 0; i < 8; i++) {
        enemies.push({ x: 50 + i * 55, y: 50, w: 40, h: 28, alive: true });
    }
    
    function draw() {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Joueur
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.roundRect(player.x, player.y, player.w, player.h, 4);
        ctx.fill();
        
        // Balles
        ctx.fillStyle = '#fbbf24';
        bullets.forEach((b, i) => {
            b.y -= 7;
            ctx.fillRect(b.x, b.y, 4, 12);
            if (b.y < 0) bullets.splice(i, 1);
        });
        
        // Ennemis
        enemies.forEach(e => {
            if (e.alive) {
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.roundRect(e.x, e.y, e.w, e.h, 4);
                ctx.fill();
                
                e.x += dir * 1.5;
                
                bullets.forEach((b, bi) => {
                    if (b.x > e.x && b.x < e.x + e.w && b.y > e.y && b.y < e.y + e.h) {
                        e.alive = false;
                        bullets.splice(bi, 1);
                        score += 50;
                        updateScoreDisplay();
                    }
                });
            }
        });
        
        if (enemies.some(e => e.alive && (e.x <= 0 || e.x >= canvas.width - e.w))) {
            dir *= -1;
            enemies.forEach(e => e.y += 15);
        }
        
        if (enemies.every(e => !e.alive)) {
            clearInterval(gameInterval);
            alert(`Victoire! Score: ${score}`);
        }
    }
    
    document.addEventListener('keydown', (e) => {
        if (currentGame !== 'space-invaders') return;
        if (e.key === 'ArrowLeft' && player.x > 0) player.x -= 18;
        if (e.key === 'ArrowRight' && player.x < canvas.width - player.w) player.x += 18;
        if (e.key === ' ') bullets.push({ x: player.x + player.w/2 - 2, y: player.y });
    });
    
    gameInterval = setInterval(draw, 50);
}

// ===== 3. TETRIS =====
function initTetris(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="tetrisCanvas" width="300" height="600"
                    style="background:#f1f3f5;border-radius:12px;"></canvas>
            <p style="margin-top:1rem;color:#718096;font-size:0.9rem;">
                <i class="fas fa-arrows-alt"></i> ← → déplacer | ↑ tourner | ↓ descendre
            </p>
        </div>
    `;
    
    const canvas = document.getElementById('tetrisCanvas');
    const ctx = canvas.getContext('2d');
    const COLS = 10, ROWS = 20, BLOCK = 30;
    
    let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    let piece = newPiece();
    
    const SHAPES = [
        [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]],
        [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]], [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]]
    ];
    const COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#0000f0', '#00f000', '#f00000'];
    
    function newPiece() {
        const t = Math.floor(Math.random() * SHAPES.length);
        return { shape: SHAPES[t], color: COLORS[t], x: Math.floor(COLS/2)-1, y: 0 };
    }
    
    function draw() {
        ctx.fillStyle = '#f1f3f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        board.forEach((row, y) => row.forEach((v, x) => {
            if (v) { ctx.fillStyle = v; ctx.fillRect(x*BLOCK, y*BLOCK, BLOCK-1, BLOCK-1); }
        }));
        
        ctx.fillStyle = piece.color;
        piece.shape.forEach((r, y) => r.forEach((v, x) => {
            if (v) ctx.fillRect((piece.x+x)*BLOCK, (piece.y+y)*BLOCK, BLOCK-1, BLOCK-1);
        }));
        
        // Grille
        ctx.strokeStyle = '#dee2e6';
        for(let i=0;i<=COLS;i++) { ctx.beginPath(); ctx.moveTo(i*BLOCK,0); ctx.lineTo(i*BLOCK,canvas.height); ctx.stroke(); }
        for(let i=0;i<=ROWS;i++) { ctx.beginPath(); ctx.moveTo(0,i*BLOCK); ctx.lineTo(canvas.width,i*BLOCK); ctx.stroke(); }
    }
    
    function moveDown() {
        piece.y++;
        if (collision()) {
            piece.y--;
            merge();
            clearLines();
            piece = newPiece();
            if (collision()) { clearInterval(gameInterval); alert(`Game Over! Score: ${score}`); }
        }
    }
    
    function collision() {
        return piece.shape.some((r,y) => r.some((v,x) => 
            v && (piece.x+x<0 || piece.x+x>=COLS || piece.y+y>=ROWS || (piece.y+y>=0 && board[piece.y+y][piece.x+x]))
        ));
    }
    
    function merge() {
        piece.shape.forEach((r,y) => r.forEach((v,x) => {
            if (v) board[piece.y+y][piece.x+x] = piece.color;
        }));
    }
    
    function clearLines() {
        let cleared = 0;
        board.forEach((row, y) => {
            if (row.every(c => c)) { board.splice(y,1); board.unshift(Array(COLS).fill(0)); cleared++; }
        });
        if (cleared) { score += cleared * 100; updateScoreDisplay(); }
    }
    
    function rotate() {
        const rot = piece.shape[0].map((_,i) => piece.shape.map(row => row[i]).reverse());
        const prev = piece.shape;
        piece.shape = rot;
        if (collision()) piece.shape = prev;
    }
    
    document.addEventListener('keydown', (e) => {
        if (currentGame !== 'tetris') return;
        if (e.key === 'ArrowLeft') { piece.x--; if (collision()) piece.x++; }
        if (e.key === 'ArrowRight') { piece.x++; if (collision()) piece.x--; }
        if (e.key === 'ArrowDown') moveDown();
        if (e.key === 'ArrowUp') rotate();
    });
    
    draw();
    gameInterval = setInterval(moveDown, 800);
}

// ===== 4. PONG =====
function initPong(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="pongCanvas" width="600" height="400"
                    style="background:#ffffff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);"></canvas>
            <p style="margin-top:1rem;color:#718096;font-size:0.9rem;">
                <i class="fas fa-mouse-pointer"></i> Déplacez la souris pour contrôler votre raquette
            </p>
        </div>
    `;
    
    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');
    
    let py = 175, aiY = 175, bx=300, by=200, bdx=5, bdy=3, pS=0, aiS=0;
    
    function draw() {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        
        // Ligne centrale
        ctx.setLineDash([10,10]);
        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath(); ctx.moveTo(canvas.width/2,0); ctx.lineTo(canvas.width/2,canvas.height); ctx.stroke();
        ctx.setLineDash([]);
        
        // Raquettes
        ctx.fillStyle = '#667eea';
        ctx.beginPath(); ctx.roundRect(20,py,10,50,5); ctx.fill();
        ctx.fillStyle = '#f093fb';
        ctx.beginPath(); ctx.roundRect(canvas.width-30,aiY,10,50,5); ctx.fill();
        
        // Balle
        ctx.fillStyle = '#2d3748';
        ctx.beginPath(); ctx.arc(bx,by,8,0,Math.PI*2); ctx.fill();
        
        // Scores
        ctx.font = 'bold 28px Inter'; ctx.fillStyle='#667eea'; ctx.fillText(pS, canvas.width/4,50);
        ctx.fillStyle='#f093fb'; ctx.fillText(aiS, 3*canvas.width/4,50);
        
        bx+=bdx; by+=bdy;
        if(by<=8||by>=canvas.height-8) bdy*=-1;
        if(bx<=30&&by>py&&by<py+50){bdx*=1.05;bx=31;}
        if(bx>=canvas.width-30&&by>aiY&&by<aiY+50){bdx*=-1.05;bx=canvas.width-31;}
        if(bx<0){aiS++;reset();}
        if(bx>canvas.width){pS++;score+=10;updateScoreDisplay();reset();}
        
        if(aiY+25<by-20) aiY+=4; else if(aiY+25>by+20) aiY-=4;
    }
    
    function reset(){bx=canvas.width/2;by=canvas.height/2;bdx=5*(Math.random()>.5?1:-1);bdy=3*(Math.random()>.5?1:-1);}
    
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        py = e.clientY - rect.top - 25;
        py = Math.max(0, Math.min(py, canvas.height-50));
    });
    
    gameInterval = setInterval(draw, 16);
}

// ===== 5. MEMORY GAME =====
function initMemory(container) {
    const emojis = ['🎮','🎲','🎯','🎨','🎭','🎪','🎬','🎤'];
    let cards = [...emojis,...emojis].sort(()=>Math.random()-0.5);
    let flipped = [], matched = 0, canFlip = true;
    
    container.innerHTML = `<div style="text-align:center;"><div id="memGrid" style="display:inline-grid;grid-template-columns:repeat(4,85px);gap:10px;"></div>
        <p style="margin-top:1rem;color:#718096;"><i class="fas fa-hand-pointer"></i> Cliquez pour retourner les cartes</p></div>`;
    
    const grid = document.getElementById('memGrid');
    
    cards.forEach((emoji, i) => {
        const card = document.createElement('div');
        card.style.cssText = `width:85px;height:85px;cursor:pointer;perspective:1000px;`;
        card.innerHTML = `
            <div class="mem-card" data-i="${i}" data-e="${emoji}" style="
                width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform 0.5s;
            ">
                <div style="position:absolute;width:100%;height:100%;backface-visibility:hidden;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:1.8rem;font-weight:bold;">?</div>
                <div style="position:absolute;width:100%;height:100%;backface-visibility:hidden;background:#f8f9fa;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;transform:rotateY(180deg);border:2px solid #e2e8f0;">${emoji}</div>
            </div>`;
        card.addEventListener('click', () => flip(card));
        grid.appendChild(card);
    });
    
    function flip(card) {
        if(!canFlip||flipped.includes(card)||card.querySelector('.mem-card').style.transform==='rotateY(180deg)') return;
        card.querySelector('.mem-card').style.transform='rotateY(180deg)';
        flipped.push(card);
        if(flipped.length===2){
            canFlip=false;
            const [c1,c2]=flipped;
            if(c1.dataset.e===c2.dataset.e){
                matched++; score+=50; updateScoreDisplay(); flipped=[];
                canFlip=true;
                if(matched===emojis.length) setTimeout(()=>alert(`Félicitations! Score: ${score}`),300);
            }else{
                setTimeout(()=>{
                    c1.querySelector('.mem-card').style.transform='';
                    c2.querySelector('.mem-card').style.transform='';
                    flipped=[]; canFlip=true;
                },1000);
            }
        }
    }
}

// ===== 6. TIC-TAC-TOE =====
function initTicTacToe(container) {
    let board = Array(9).fill('');
    let turn = 'X', active = true;
    
    container.innerHTML = `<div style="text-align:center;">
        <div id="tttBoard" style="display:inline-grid;grid-template-columns:repeat(3,100px);gap:8px;"></div>
        <p id="tttStatus" style="margin-top:1.2rem;font-size:1.1rem;color:#667eea;font-weight:600;">Tour de X</p></div>`;
    
    const boardEl = document.getElementById('tttBoard');
    const status = document.getElementById('tttStatus');
    
    board.forEach((_,i)=>{
        const cell=document.createElement('div');
        cell.style.cssText=`width:100px;height:100px;background:#f8f9fa;border:2px solid #e2e8f0;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;font-weight:bold;cursor:pointer;transition:all 0.2s;`;
        cell.addEventListener('click',()=>move(i,cell));
        boardEl.appendChild(cell);
    });
    
    function move(i,cell){
        if(board[i]||!active)return;
        board[i]=turn;
        cell.textContent=turn;
        cell.style.color=turn==='X'?'#667eea':'#f093fb';
        
        if(checkWin()){status.textContent=`${turn} a gagné!`; active=false; score+=100; updateScoreDisplay(); return;}
        if(board.every(c=>c)){status.textContent='Match nul!'; active=false; return;}
        turn=turn==='X'?'O':'X';
        status.textContent=`Tour de ${turn}`;
    }
    
    function checkWin(){
        const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        return wins.some(([a,b,c])=>board[a]&&board[a]===board[b]&&board[a]===board[c]);
    }
}

// ===== 7. BREAKOUT =====
function initBreakout(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="breakCanvas" width="480" height="320"
                    style="background:#f8f9fa;border-radius:12px;"></canvas>
            <p style="margin-top:1rem;color:#718096;"><i class="fas fa-mouse-pointer"></i> Souris pour déplacer la raquette</p></div>`;
    
    const canvas = document.getElementById('breakCanvas');
    const ctx = canvas.getContext('2d');
    
    let pw=80, px=(canvas.width-pw)/2, bx=240, by=300, bdx=4, bdy=-4;
    let bricks=[];
    for(let c=0;c<8;c++){bricks[c]=[];for(let r=0;r<4;r++)bricks[c][r]={status:1};}
    
    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        bricks.forEach((col,c)=>col.forEach((b,r)=>{if(b.status){
            ctx.fillStyle=['#ef4444','#f97316','#eab308','#22c55e'][r];
            ctx.beginPath();ctx.roundRect(c*(54+4)+14,r*(18+4)+30,54,18,4);ctx.fill();
            b.x=c*(54+4)+14;b.y=r*(18+4)+30;b.w=54;b.h=18;
        }}));
        ctx.fillStyle='#667eea';ctx.beginPath();ctx.roundRect(px,canvas.height-20,pw,10,5);ctx.fill();
        ctx.fillStyle='#2d3748';ctx.beginPath();ctx.arc(bx,by,6,0,Math.PI*2);ctx.fill();
        
        bx+=bdx;by+=bdy;
        if(bx<6||bx>canvas.width-6)bdx*=-1;if(by<6)bdy*=-1;
        if(by>canvas.height-26&&bx>px&&bx<px+pw){bdy*=-1;}
        if(by>canvas.height-6){clearInterval(gameInterval);alert(`Game Over! Score: ${score}`);}
        
        bricks.forEach(col=>col.forEach(b=>{
            if(b.status&&bx>b.x&&bx<b.x+b.w&&by>b.y&&by<b.y+b.h){bdy*=-1;b.status=0;score+=10;updateScoreDisplay();}
        }));
        
        if(bricks.every(col=>col.every(b=>!b.status))){clearInterval(gameInterval);alert(`Victoire! Score: ${score}`);}
    }
    
    canvas.addEventListener('mousemove',e=>{
        const rect=canvas.getBoundingClientRect();
        px=e.clientX-rect.left-pw/2;
        px=Math.max(0,Math.min(px,canvas.width-pw));
    });
    
    gameInterval=setInterval(draw,16);
}

// ===== 8. 2048 =====
function init2048(container) {
    let grid=Array(4).fill().map(()=>Array(4).fill(0));
    addTile();addTile();
    
    container.innerHTML=`<div style="text-align:center;">
        <div id="g2048" style="display:inline-grid;grid-template-columns:repeat(4,90px);gap:8px;background:#bbada0;padding:12px;border-radius:10px;"></div>
        <p style="margin-top:1rem;color:#718096;"><i class="fas fa-arrows-alt"></i> Flèches directionnelles</p></div>`;
    
    const g=document.getElementById('g2048');
    
    function render(){
        g.innerHTML='';
        grid.forEach(row=>row.forEach(v=>{
            const c=document.createElement('div');
            c.style.cssText=`width:90px;height:90px;display:flex;align-items:center;justify-content:center;font-size:${v>512?'24px':'32px'};font-weight:bold;background:${getColor(v)};color:${v>4?'#fff':'#776e65'};border-radius:6px;transition:all 0.15s;`;
            c.textContent=v||'';g.appendChild(c);
        }));
    }
    
    function getColor(v){return{0:'#cdc1b4',2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e'}[v]||'#3c3a32'}
    
    function addTile(){
        const empty=[];
        grid.forEach((r,y)=>r.forEach((c,x)=>{if(!c)empty.push({x,y});}));
        if(empty.length){const{x,y}=empty[Math.floor(Math.random()*empty.length)];grid[y][x]=Math.random()<0.9?2:4;}
    }
    
    function move(dir){
        let moved=false;
        if(dir==='left'||dir==='right'){
            grid.forEach(row=>{
                if(dir==='right')row.reverse();
                let nr=row.filter(v=>v);
                for(let i=0;i<nr.length-1;i++){
                    if(nr[i]===nr[i+1]){nr[i]*=2;score+=nr[i];updateScoreDisplay();nr[i+1]=0;}
                }
                nr=nr.filter(v=>v);
                while(nr.length<4)nr.push(0);
                if(dir==='right')nr.reverse();
                if(row.join(',')!==nr.join(','))moved=true;
                row.splice(0,4,...nr);
            });
        }else{
            for(let x=0;x<4;x++){
                let col=[grid[0][x],grid[1][x],grid[2][x],grid[3][x]];
                if(dir==='down')col.reverse();
                let nc=col.filter(v=>v);
                for(let i=0;i<nc.length-1;i++){if(nc[i]===nc[i+1]){nc[i]*=2;score+=nc[i];updateScoreDisplay();nc[i+1]=0;}}
                nc=nc.filter(v=>v);while(nc.length<4)nc.push(0);
                if(dir==='down')nc.reverse();
                if(col.join(',')!==nc.join(','))moved=true;
                grid[0][x]=nc[0];grid[1][x]=nc[1];grid[2][x]=nc[2];grid[3][x]=nc[3];
            }
        }
        if(moved){addTile();render();}
    }
    
    render();
    document.addEventListener('keydown',e=>{
        if(currentGame!=='2048')return;
        const m={'ArrowLeft':'left','ArrowRight':'right','ArrowUp':'up','ArrowDown':'down'};
        if(m[e.key])move(m[e.key]);
    });
}

// ===== 9. TEST DE RÉACTION =====
function initReactionTest(container) {
    let state='waiting', start=0, timeout;
    
    container.innerHTML=`<div style="text-align:center;">
        <div id="reactBox" style="
            width:380px;height:280px;border-radius:16px;display:flex;flex-direction:column;
            align-items:center;justify-content:center;font-size:1.4rem;font-weight:600;
            cursor:pointer;background:#ef4444;color:white;transition:all 0.3s;user-select:none;
        ">Cliquez pour commencer</div>
        <p id="reactResult" style="margin-top:1rem;font-size:1.1rem;"></p></div>`;
    
    const box=document.getElementById('reactBox'), res=document.getElementById('reactResult');
    
    box.addEventListener('click',()=>{
        if(state==='waiting'||state==='result'){
            state='ready';box.style.background='#ef4444';box.textContent='Attendez le vert...';res.textContent='';
            timeout=setTimeout(()=>{state='go';box.style.background='#22c55e';box.textContent='CLIQUEZ!';start=Date.now();},Math.random()*3000+2000);
        }else if(state==='ready'){
            clearTimeout(timeout);state='waiting';box.style.background='#3b82f6';box.textContent='Trop tôt! Réessayez';res.textContent='';
        }else if(state==='go'){
            const t=Date.now()-start;state='result';
            box.style.background='#3b82f6';box.textContent=t+'ms';
            res.textContent=t<200?'⚡ Excellent!':t<300?'👏 Très bien!':t<400?'🙂 Bien':'💪 Peut mieux faire';
            score=Math.max(score,1000-t);updateScoreDisplay();
        }
    });
}

// ===== 10. CLICK SPEED =====
function initClickSpeed(container) {
    let clicks=0, time=10, running=false, interval;
    
    container.innerHTML=`<div style="text-align:center;">
        <div id="clickArea" style="
            width:340px;height:240px;border-radius:16px;display:flex;flex-direction:column;
            align-items:center;justify-content:center;font-size:2rem;font-weight:bold;
            cursor:pointer;background:#f8f9fa;border:3px dashed #cbd5e1;transition:all 0.1s;user-select:none;
        "><div id="clickCnt">0</div><div id="clickTimer" style="font-size:3.5rem;margin:10px 0;">10</div><div>Cliquez pour commencer</div></div>
        <p id="clickRes" style="margin-top:1rem;"></p></div>`;
    
    const area=document.getElementById('clickArea'), cnt=document.getElementById('clickCnt'), timer=document.getElementById('clickTimer'), res=document.getElementById('clickRes');
    
    area.addEventListener('click',()=>{
        if(!running){
            running=true;clicks=0;time=10;cnt.textContent=clicks;timer.textContent=time;
            area.style.borderColor='#667eea';res.textContent='';
            interval=setInterval(()=>{time--;timer.textContent=time;
                if(time<=0){clearInterval(interval);running=false;area.style.borderColor='#22c55e';
                    const cps=(clicks/10).toFixed(1);res.textContent=`Résultat: ${clicks} clics (${cps} CPS)`;
                    score=clicks*10;updateScoreDisplay();
                    setTimeout(()=>{area.style.borderColor='#cbd5e1';area.lastElementChild.textContent='Réessayer';},2000);
                }
            },1000);
        }else{
            clicks++;cnt.textContent=clicks;area.style.transform='scale(0.96)';
            setTimeout(()=>area.style.transform='scale(1)',50);
        }
    });
}

// ===== 11. QUIZ =====
function initQuiz(container) {
    const qs=[
        {q:'Capitale de la France?',o:['Londres','Berlin','Paris','Madrid'],a:2},
        {q:'Combien de continents?',o:['5','6','7','8'],a:2},
        {q:'Qui a peint la Joconde?',o:['Van Gogh','Picasso','Léonard de Vinci','Michel-Ange'],a:2},
        {q:'Plus grand océan?',o:['Atlantique','Indien','Arctique','Pacifique'],a:3},
        {q:'Année premier pas lune?',o:['1965','1969','1972','1975'],a:1}
    ];
    let qi=0, correct=0;
    
    container.innerHTML=`<div style="max-width:600px;margin:0 auto;text-align:left;">
        <div id="quizQ" style="font-size:1.3rem;font-weight:600;margin-bottom:1.5rem;"></div>
        <div id="quizOpts" style="display:flex;flex-direction:column;gap:0.8rem;"></div>
        <div id="quizProg" style="margin-top:1.5rem;text-align:center;color:#718096;"></div></div>`;
    
    const qEl=document.getElementById('quizQ'), oEl=document.getElementById('quizOpts'), pEl=document.getElementById('quizProg');
    
    function showQ(){
        const q=qs[qi];qEl.textContent=`Question ${qi+1}/${qs.length}: ${q.q}`;
        oEl.innerHTML='';q.o.forEach((opt,i)=>{
            const btn=document.createElement('button');
            btn.style.cssText=`padding:1rem 1.5rem;background:#f8f9fa;border:2px solid #e2e8f0;border-radius:10px;cursor:pointer;font-size:1rem;text-align:left;transition:all 0.2s;`;
            btn.textContent=opt;btn.addEventListener('click',()=>sel(i,btn));oEl.appendChild(btn);
        });pEl.textContent=`${qi+1}/${qs.length}`;
    }
    
    function sel(i,btn){
        const btns=oEl.querySelectorAll('button');btns.forEach(b=>b.disabled=true);
        if(i===qs[qi].a){btn.classList.add('correct');btn.style.background='#22c55e';btn.style.color='white';btn.style.borderColor='#22c55e';correct++;score+=100;}
        else{btn.classList.add('incorrect');btn.style.background='#ef4444';btn.style.color='white';btn.style.borderColor='#ef4444';btns[qs[qi].a].style.background='#22c55e';btns[qs[qi].a].style.color='white';}
        updateScoreDisplay();
        setTimeout(()=>{qi++;if(qi<qs.length)showQ();else showRes();},1200);
    }
    
    function showRes(){
        const pct=Math.round((correct/qs.length)*100);
        qEl.textContent='Quiz terminé!';
        oEl.innerHTML=`<div style="text-align:center;padding:2.5rem;">
            <div style="font-size:3.5rem;font-weight:bold;color:#667eea;margin-bottom:1rem;">${correct}/${qs.length}</div>
            <div style="color:#718096;margin-bottom:1rem;">${pct}% de bonnes réponses</div>
            <div>${pct>=80?'🌟 Excellent!':pct>=60?'👏 Bien joué!':'📚 Continuez à apprendre!'}</div></div>`;
        pEl.textContent='';
    }
    
    showQ();
}

// ===== 12. NOMBRE MYSTÈRE =====
function initNumberGuess(container) {
    let secret=Math.floor(Math.random()*100)+1, attempts=0, hist=[];
    
    container.innerHTML=`<div style="text-align:center;max-width:420px;margin:0 auto;">
        <p style="color:#718096;margin-bottom:1.5rem;font-size:1.05rem;">Devinez le nombre entre 1 et 100</p>
        <input type="number" id="guessInput" min="1" max="100" placeholder="Votre nombre..."
               style="width:100%;padding:1rem;font-size:1.2rem;border:2px solid #e2e8f0;border-radius:10px;text-align:center;margin-bottom:1rem;outline:none;transition:border 0.3s;"
               onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#e2e8f0'">
        <button onclick="window.makeGuess()" class="play-button" style="width:100%;margin-bottom:1.5rem;">
            <i class="fas fa-search"></i> Deviner
        </button>
        <div id="guessHist" style="max-height:180px;overflow-y:auto;text-align:left;padding:1rem;background:#f8f9fa;border-radius:10px;font-size:0.95rem;"></div>
        <p id="guessHint" style="margin-top:1.2rem;font-size:1.2rem;font-weight:600;"></p></div>`;
    
    window.makeGuess=()=>{
        const input=document.getElementById('guessInput'), guess=parseInt(input.value),
              hint=document.getElementById('guessHint'), histEl=document.getElementById('guessHist');
        if(isNaN(guess)||guess<1||guess>100){hint.textContent='⚠️ Entre 1 et 100!';hint.style.color='#f59e0b';return;}
        attempts++;
        hist.push(guess);
        if(guess===secret){
            hint.textContent=`🎉 Trouvé en ${attempts} essais!`;hint.style.color='#22c55e';
            score=Math.max(0,1000-attempts*50);updateScoreDisplay();input.disabled=true;
        }else if(guess<secret){hint.textContent='⬆️ Plus grand!';hint.style.color='#3b82f6';}
        else{hint.textContent='⬇️ Plus petit!';hint.style.color='#3b82f6';}
        histEl.innerHTML=`<strong>Historique:</strong> ${hist.join(' → ')}`;
        input.value='';input.focus();
    };
    
    document.getElementById('guessInput').addEventListener('keypress',e=>{if(e.key==='Enter')window.makeGuess();});
    setTimeout(()=>document.getElementById('guessInput').focus(),100);
}
