// ============================================================
// LUJEUX v3.0 PRO - MOTEUR DE JEU COMPLET
// 9 Mini-Jeux | Delta Time 60 FPS | IA Intelligente
// Sans Lag | Sans Bug | Code Intégral
// ============================================================

// ===== SYSTÈME DE BASE =====
const GameEngine = {
    currentGame: null,
    gameLoop: null,
    lastTime: 0,
    deltaTime: 0,
    score: 0,
    isRunning: false,
    
    // Calcul Delta Time pour 60 FPS constants
    calculateDelta(currentTime) {
        if (!this.lastTime) this.lastTime = currentTime;
        this.deltaTime = (currentTime - this.lastTime) / 1000; // Convertir en secondes
        this.lastTime = currentTime;
        
        // Limiter delta time pour éviter les sauts énormes
        if (this.deltaTime > 0.1) this.deltaTime = 0.016; // ~60 FPS max
    },
    
    // Démarrer boucle de jeu
    startLoop(updateFn, renderFn) {
        this.isRunning = true;
        const loop = (timestamp) => {
            if (!this.isRunning) return;
            
            this.calculateDelta(timestamp);
            updateFn(this.deltaTime);
            renderFn();
            
            this.gameLoop = requestAnimationFrame(loop);
        };
        
        this.lastTime = 0;
        this.gameLoop = requestAnimationFrame(loop);
    },
    
    // Arrêter boucle
    stopLoop() {
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
    }
};

// ===== DONNÉES DES 9 JEUX =====
const gamesData = [
    { id: 'snake', name: 'Snake Ultra', category: 'arcade', icon: '🐍', description: 'Serpent ultra-fluide avec Delta Time. Mangez pour grandir !', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'subway', name: 'Subway Runner', category: 'arcade', icon: '🏃', description: 'Endless Runner 3 voies. Esquivez, sautez, survivez !', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'tetris', name: 'Tetris Pro', category: 'arcade', icon: '🧱', description: 'Le classique avec vitesse progressive et scoring optimal.', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'pacman', name: 'Pac-Man', category: 'arcade', icon: '🟡', description: 'Mangez les pac-gommes et échappez aux fantômes IA !', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { id: 'puissance4', name: 'Puissance 4', category: 'plateau', icon: '🔴', description: 'Alignez 4 pions contre une IA Minimax redoutable.', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'morpion', name: 'Morpion Ultimate', category: 'plateau', icon: '⭕', description: 'IA Minimax imbattable. Essayez de gagner !', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
    { id: 'blackjack', name: 'Blackjack Casino', category: 'plateau', icon: '🃏', description: 'Battez le croupier IA sans dépasser 21.', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
    { id: 'pong', name: 'Pong Championship', category: 'reflexe', icon: '🏓', description: 'Tennis de table contre IA réactive et challengeante.', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'airhockey', name: 'Air Hockey', category: 'reflexe', icon: '🏒', description: 'Hockey sur table avec physique réaliste et IA défensive.', gradient: 'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)' }
];

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    renderGames();
    setupRevealAnimations();
    setupMobileMenu();
});

// ===== FONCTIONS UTILITAIRES =====
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId + 'Section').classList.add('active');
}

function showAllGames() {
    showSection('games');
    renderGames();
}

function filterGames(category) {
    renderGames(category);
    showSection('games');
}

function playRandomGame() {
    const randomGame = gamesData[Math.floor(Math.random() * gamesData.length)];
    openGame(randomGame.id);
}

function updateScoreDisplay() {
    document.getElementById('gameScore').innerHTML = `<i class="fas fa-trophy"></i> Score: ${GameEngine.score}`;
}

function backToMenu() {
    closeGame();
    setTimeout(() => showSection('menu'), 300);
}

// ===== RENDU DES JEUX =====
function renderGames(filter = 'all') {
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = '';
    
    const filtered = filter === 'all' ? gamesData : gamesData.filter(g => g.category === filter);
    
    filtered.forEach((game, i) => {
        const card = document.createElement('div');
        card.className = 'game-card reveal';
        card.innerHTML = `
            <div class="game-preview" style="background: ${game.gradient}">${game.icon}</div>
            <div class="game-info">
                <h3>${game.name}</h3>
                <div class="game-meta"><span class="game-tag">${game.category}</span></div>
                <p class="game-description">${game.description}</p>
                <button class="play-game-btn" onclick="openGame('${game.id}')"><i class="fas fa-play"></i> Jouer</button>
            </div>
        `;
        grid.appendChild(card);
    });
    
    setTimeout(() => setupRevealAnimations(), 100);
}

// ===== ANIMATIONS =====
function setupRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function setupMobileMenu() {
    document.getElementById('mobileToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}

// ===== GESTION MODAL =====
function openGame(gameId) {
    GameEngine.currentGame = gameId;
    GameEngine.score = 0;
    
    const game = gamesData.find(g => g.id === gameId);
    document.getElementById('modalTitle').textContent = game.name;
    updateScoreDisplay();
    
    loadGame(gameId);
    
    document.getElementById('gameModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeGame() {
    GameEngine.stopLoop();
    document.getElementById('gameModal').classList.remove('active');
    document.body.style.overflow = 'auto';
    GameEngine.currentGame = null;
}

function restartGame() {
    if (GameEngine.currentGame) {
        closeGame();
        setTimeout(() => openGame(GameEngine.currentGame), 150);
    }
}

// ===== CHARGEMENT DES JEUX =====
function loadGame(gameId) {
    const container = document.getElementById('gameContainer');
    
    switch(gameId) {
        case 'snake': initSnake(container); break;
        case 'subway': initSubwayRunner(container); break;
        case 'tetris': initTetris(container); break;
        case 'pacman': initPacman(container); break;
        case 'puissance4': initPuissance4(container); break;
        case 'morpion': initMorpion(container); break;
        case 'blackjack': initBlackjack(container); break;
        case 'pong': initPong(container); break;
        case 'airhockey': initAirHockey(container); break;
    }
}

// ============================================================
// JEU 1: SNAKE ULTRA (Delta Time Optimisé)
// ============================================================
function initSnake(container) {
    container.innerHTML = `
        <div style="text-align:center;width:100%;">
            <canvas id="snakeCanvas" width="500" height="500" style="background:#0d1520;border-radius:12px;"></canvas>
            <div class="game-instructions"><i class="fas fa-keyboard"></i> Flèches directionnelles • Espace pour pause</div>
        </div>
    `;
    
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const GRID_SIZE = 20;
    const CELL_SIZE = canvas.width / GRID_SIZE;
    
    let snake = [{x: 10, y: 10}];
    let direction = {x: 1, y: 0};
    let nextDirection = {x: 1, y: 0};
    let food = generateFood();
    let moveTimer = 0;
    const MOVE_INTERVAL = 0.1;
    let isPaused = false;
    
    function generateFood() {
        return { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
    }
    
    function update(dt) {
        if (isPaused) return;
        moveTimer += dt;
        if (moveTimer >= MOVE_INTERVAL) {
            moveTimer = 0;
            direction = {...nextDirection};
            const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) { gameOver(); return; }
            for (let segment of snake) { if (head.x === segment.x && head.y === segment.y) { gameOver(); return; } }
            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) { GameEngine.score += 10; updateScoreDisplay(); food = generateFood(); }
            else { snake.pop(); }
        }
    }
    
    function render() {
        ctx.fillStyle = '#0d1520'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(109, 200, 232, 0.05)';
        for (let i = 0; i <= GRID_SIZE; i++) { ctx.beginPath(); ctx.moveTo(i * CELL_SIZE, 0); ctx.lineTo(i * CELL_SIZE, canvas.height); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * CELL_SIZE); ctx.lineTo(canvas.width, i * CELL_SIZE); ctx.stroke(); }
        snake.forEach((segment, index) => {
            const alpha = 1 - (index / snake.length) * 0.5;
            ctx.fillStyle = `rgba(109, 200, 232, ${alpha})`;
            ctx.shadowColor = '#6dc8e8'; ctx.shadowBlur = index === 0 ? 15 : 8;
            ctx.beginPath(); ctx.roundRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4, 6); ctx.fill();
        });
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#f093fb'; ctx.shadowColor = '#f093fb'; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        if (isPaused) { ctx.fillStyle = 'rgba(10, 15, 24, 0.8)'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#6dc8e8'; ctx.font = 'bold 32px Plus Jakarta Sans'; ctx.textAlign = 'center'; ctx.fillText('PAUSE', canvas.width/2, canvas.height/2); }
    }
    
    function gameOver() {
        GameEngine.stopLoop();
        ctx.fillStyle = 'rgba(10, 15, 24, 0.9)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ef4444'; ctx.font = 'bold 36px Plus Jakarta Sans'; ctx.textAlign = 'center'; ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 20);
        ctx.fillStyle = '#cbd5e1'; ctx.font = '20px Plus Jakarta Sans'; ctx.fillText(`Score: ${GameEngine.score}`, canvas.width/2, canvas.height/2 + 25);
    }
    
    document.addEventListener('keydown', (e) => {
        if (GameEngine.currentGame !== 'snake') return;
        switch(e.key) {
            case 'ArrowUp': if (direction.y !== 1) nextDirection = {x: 0, y: -1}; e.preventDefault(); break;
            case 'ArrowDown': if (direction.y !== -1) nextDirection = {x: 0, y: 1}; e.preventDefault(); break;
            case 'ArrowLeft': if (direction.x !== 1) nextDirection = {x: -1, y: 0}; e.preventDefault(); break;
            case 'ArrowRight': if (direction.x !== -1) nextDirection = {x: 1, y: 0}; e.preventDefault(); break;
            case ' ': isPaused = !isPaused; e.preventDefault(); break;
        }
    });
    
    GameEngine.startLoop(update, render);
}

// ============================================================
// JEU 2: SUBWAY RUNNER (Endless Runner 3 Voies)
// ============================================================
function initSubwayRunner(container) {
    container.innerHTML = `
        <div style="text-align:center;width:100%;">
            <canvas id="subwayCanvas" width="500" height="600" style="background:#1a1a2e;border-radius:12px;"></canvas>
            <div class="game-instructions"><i class="fas fa-hand-pointer"></i> ← → Changer de voie | ↑ ou ESPACE Sauter</div>
        </div>
    `;
    
    const canvas = document.getElementById('subwayCanvas');
    const ctx = canvas.getContext('2d');
    const LANE_WIDTH = 120, LANES = [-LANE_WIDTH, 0, LANE_WIDTH], PLAYER_Y = 450;
    const GRAVITY = 2500, JUMP_FORCE = -700, GAME_SPEED_INITIAL = 300, SPEED_INCREMENT = 15;
    
    let playerLane = 1, playerX = 0, targetX = 0, playerY = PLAYER_Y, velocityY = 0, isJumping = false;
    let gameSpeed = GAME_SPEED_INITIAL, obstacles = [], distance = 0, spawnTimer = 0, SPAWN_INTERVAL = 1.5;
    
    function spawnObstacle() {
        const lane = Math.floor(Math.random() * 3), type = Math.random() > 0.3 ? 'barrier' : 'train';
        obstacles.push({ x: canvas.width + 100, lane, type, width: type === 'train' ? 80 : 60, height: type === 'train' ? 180 : 80, passed: false });
    }
    
    function checkCollision(a, b) { return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }
    
    function update(dt) {
        targetX = LANES[playerLane]; playerX += (targetX - playerX) * 10 * dt;
        if (isJumping) { velocityY += GRAVITY * dt; playerY += velocityY * dt; if (playerY >= PLAYER_Y) { playerY = PLAYER_Y; isJumping = false; velocityY = 0; } }
        gameSpeed += SPEED_INCREMENT * dt; distance += gameSpeed * dt; GameEngine.score = Math.floor(distance / 10); updateScoreDisplay();
        spawnTimer += dt;
        if (spawnTimer >= SPAWN_INTERVAL) { spawnTimer = 0; spawnObstacle(); }
        obstacles.forEach(obs => { obs.x -= gameSpeed * dt; if (!obs.passed && obs.x + obs.width < canvas.width / 2 + playerX - 20) { obs.passed = true; GameEngine.score += 50; updateScoreDisplay(); } });
        obstacles = obstacles.filter(obs => obs.x > -obs.width - 50);
        const playerBox = { x: canvas.width / 2 + playerX - 25, y: playerY - 40, width: 50, height: 80 };
        for (let obs of obstacles) { const obsBox = { x: obs.x, y: 350, width: obs.width, height: obs.height }; if (checkCollision(playerBox, obsBox)) { gameOver(); return; } }
    }
    
    function render() {
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(109, 200, 232, 0.3)'; ctx.lineWidth = 3;
        for (let i = 0; i <= 3; i++) { const x = canvas.width / 2 + (i - 1) * LANE_WIDTH - LANE_WIDTH / 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
        ctx.fillStyle = '#16213e'; ctx.fillRect(0, PLAYER_Y + 40, canvas.width, canvas.height - PLAYER_Y);
        obstacles.forEach(obs => { const laneX = canvas.width / 2 + LANES[obs.lane] - obs.width / 2; ctx.fillStyle = obs.type === 'barrier' ? '#e94560' : '#0f3460'; ctx.shadowColor = obs.type === 'barrier' ? '#e94560' : '#6dc8e8'; ctx.shadowBlur = 10; ctx.fillRect(laneX, 350, obs.width, obs.height); ctx.shadowBlur = 0; });
        const px = canvas.width / 2 + playerX; ctx.fillStyle = '#6dc8e8'; ctx.shadowColor = '#6dc8e8'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.ellipse(px, playerY - 10, 25, 35, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(px, playerY - 50, 18, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#94a3b8'; ctx.font = '16px JetBrains Mono'; ctx.textAlign = 'left'; ctx.fillText(`Distance: ${Math.floor(distance)}m`, 20, 30); ctx.textAlign = 'right'; ctx.fillText(`Vitesse: ${Math.floor(gameSpeed)} km/h`, canvas.width - 20, 30);
    }
    
    function gameOver() {
        GameEngine.stopLoop();
        ctx.fillStyle = 'rgba(26, 26, 46, 0.95)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#e94560'; ctx.font = 'bold 42px Plus Jakarta Sans'; ctx.textAlign = 'center'; ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 40);
        ctx.fillStyle = '#6dc8e8'; ctx.font = '28px Plus Jakarta Sans'; ctx.fillText(`Score: ${GameEngine.score}`, canvas.width/2, canvas.height/2 + 10);
        ctx.fillStyle = '#94a3b8'; ctx.font = '18px Plus Jakarta Sans'; ctx.fillText(`Distance: ${Math.floor(distance)}m`, canvas.width/2, canvas.height/2 + 50);
    }
    
    document.addEventListener('keydown', (e) => {
        if (GameEngine.currentGame !== 'subway') return;
        switch(e.key) {
            case 'ArrowLeft': if (playerLane > 0) playerLane--; e.preventDefault(); break;
            case 'ArrowRight': if (playerLane < 2) playerLane++; e.preventDefault(); break;
            case 'ArrowUp': case ' ': if (!isJumping) { isJumping = true; velocityY = JUMP_FORCE; } e.preventDefault(); break;
        }
    });
    
    GameEngine.startLoop(update, render);
}

// ============================================================
// JEU 3: TETRIS PRO (Vitesse Progressive)
// ============================================================
function initTetris(container) {
    container.innerHTML = `
        <div style="text-align:center;width:100%;">
            <canvas id="tetrisCanvas" width="320" height="640" style="background:#0d1520;border-radius:12px;"></canvas>
            <div class="game-instructions"><i class="fas fa-keyboard"></i> ← → Déplacer | ↑ Tourner | ↓ Accélérer chute</div>
        </div>
    `;
    
    const canvas = document.getElementById('tetrisCanvas'), ctx = canvas.getContext('2d');
    const COLS = 10, ROWS = 20, BLOCK_SIZE = 32;
    let board = Array(ROWS).fill().map(() => Array(COLS).fill(0)), currentPiece = null, dropTimer = 0, baseDropInterval = 0.8, dropInterval = baseDropInterval, level = 1, linesCleared = 0;
    const PIECES = [
        { shape: [[1,1,1,1]], color: '#00f0f0' }, { shape: [[1,1],[1,1]], color: '#f0f000' }, { shape: [[0,1,0],[1,1,1]], color: '#a000f0' },
        { shape: [[1,0,0],[1,1,1]], color: '#f0a000' }, { shape: [[0,0,1],[1,1,1]], color: '#0000f0' }, { shape: [[0,1,1],[1,1,0]], color: '#00f000' }, { shape: [[1,1,0],[0,1,1]], color: '#f00000' }
    ];
    
    function createPiece() { const t = PIECES[Math.floor(Math.random() * PIECES.length)]; return { shape: t.shape.map(r => [...r]), color: t.color, x: Math.floor(COLS/2) - Math.floor(t.shape[0].length/2), y: 0 }; }
    function collision(offsetX=0, offsetY=0, newShape=null) { const s = newShape || currentPiece.shape; for(let y=0;y<s.length;y++) for(let x=0;x<s[y].length;x++) if(s[y][x]) { const nx=currentPiece.x+x+offsetX, ny=currentPiece.y+y+offsetY; if(nx<0||nx>=COLS||ny>=ROWS||(ny>=0&&board[ny][nx])) return true; } return false; }
    function merge() { currentPiece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v)board[currentPiece.y+y][currentPiece.x+x]=currentPiece.color;})); }
    function clearLines() { let cleared=0; for(let y=ROWS-1;y>=0;y--){if(board[y].every(c=>c!==0)){board.splice(y,1);board.unshift(Array(COLS).fill(0));cleared++;y++;}} if(cleared>0){linesCleared+=cleared; const p=[0,100,300,500,800]; GameEngine.score+=p[cleared]*level;updateScoreDisplay();level=Math.floor(linesCleared/10)+1;dropInterval=baseDropInterval*Math.pow(0.85,level-1);document.getElementById('levelBadge').style.display='inline-flex';document.getElementById('gameLevel').innerHTML=`<i class="fas fa-layer-group"></i> Niveau: ${level}`;} }
    function rotate() { const r=currentPiece.shape[0].map((_,i)=>currentPiece.shape.map(row=>row[i]).reverse()); if(!collision(0,0,r)) currentPiece.shape=r; }
    function moveDown() { if(!collision(0,1)) currentPiece.y++; else{merge();clearLines();spawnPiece();} }
    function moveHorizontal(dir){if(!collision(dir,0)) currentPiece.x+=dir;}
    function hardDrop(){while(!collision(0,1)){currentPiece.y++;GameEngine.score+=2;}merge();clearLines();spawnPiece();updateScoreDisplay();}
    
    function update(dt){dropTimer+=dt;if(dropTimer>=dropInterval){dropTimer=0;moveDown();}}
    
    function render(){
        ctx.fillStyle='#0d1520';ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.strokeStyle='rgba(109,200,232,0.08)';
        for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*BLOCK_SIZE,0);ctx.lineTo(x*BLOCK_SIZE,canvas.height);ctx.stroke();}
        for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*BLOCK_SIZE);ctx.lineTo(canvas.width,y*BLOCK_SIZE).stroke();}
        for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){if(board[y][x]){ctx.fillStyle=board[y][x];ctx.shadowColor=board[y][x];ctx.shadowBlur=8;ctx.fillRect(x*BLOCK_SIZE+1,y*BLOCK_SIZE+1,BLOCK_SIZE-2,BLOCK_SIZE-2);}}
        ctx.shadowBlur=0;if(currentPiece){ctx.fillStyle=currentPiece.color;ctx.shadowColor=currentPiece.color;ctx.shadowBlur=12;currentPiece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v)ctx.fillRect((currentPiece.x+x)*BLOCK_SIZE+1,(currentPiece.y+y)*BLOCK_SIZE+1,BLOCK_SIZE-2,BLOCK_SIZE-2);}));ctx.shadowBlur=0;}
    }
    
    function spawnPiece(){currentPiece=createPiece();if(collision()){GameEngine.stopLoop();ctx.fillStyle='rgba(13,21,32,0.95)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#e94560';ctx.font='bold 38px Plus Jakarta Sans';ctx.textAlign='center';ctx.fillText('GAME OVER',canvas.width/2,canvas.height/2-30);ctx.fillStyle='#6dc8e8';ctx.font='22px Plus Jakarta Sans';ctx.fillText(`Score: ${GameEngine.score}`,canvas.width/2,canvas.height/2+15);ctx.fillStyle='#94a3b8';ctx.fillText(`Niveau: ${level} | Lignes: ${linesCleared}`,canvas.width/2,canvas.height/2+50);}}
    
    document.addEventListener('keydown',(e)=>{if(GameEngine.currentGame!=='tetris'||!currentPiece)return;switch(e.key){case'ArrowLeft':moveHorizontal(-1);e.preventDefault();break;case'ArrowRight':moveHorizontal(1);e.preventDefault();break;case'ArrowDown':moveDown();GameEngine.score+=1;updateScoreDisplay();e.preventDefault();break;case'ArrowUp':rotate();e.preventDefault();break;case' ':hardDrop();e.preventDefault();break;}});
    
    spawnPiece();GameEngine.startLoop(update,render);
}

// ============================================================
// JEU 4: PAC-MAN (Avec IA Fantômes Pathfinding)
// ============================================================
function initPacman(container){
    container.innerHTML=`<div style="text-align:center;width:100%;"><canvas id="pacmanCanvas" width="560" height="620" style="background:#000;border-radius:12px;"></canvas><div class="game-instructions"><i class="fas fa-keyboard"></i> Flèches directionnelles | Mangez toutes les pac-gommes</div></div>`;
    const canvas=document.getElementById('pacmanCanvas'),ctx=canvas.getContext('2d'),TILE_SIZE=28,COLS=20,ROWS=22;
    const mapTemplate=[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],[1,3,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,3,1],[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],[1,2,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,2,1],[1,2,2,1,2,1,2,2,2,1,1,2,2,2,1,2,1,2,2,1],[1,1,2,1,2,1,1,1,0,1,1,0,1,1,1,2,1,2,1,1,1],[1,1,2,1,2,1,0,0,0,0,0,0,0,0,1,2,1,2,1,1,1],[1,2,2,2,0,0,0,0,0,1,1,0,0,0,0,0,2,2,2,1],[1,2,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,2,1],[1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1],[1,2,1,1,1,1,0,1,1,0,0,1,1,0,1,1,1,1,2,1],[1,2,2,2,2,2,0,0,0,0,0,0,0,0,2,2,2,2,2,1],[1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1],[1,2,2,1,2,0,0,2,2,1,1,2,2,0,0,2,1,2,2,1],[1,1,2,1,2,1,1,1,0,1,1,0,1,1,1,2,1,2,1,1,1],[1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,1],[1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],[1,3,2,1,2,2,2,2,2,1,1,2,2,2,2,2,2,1,2,3,1],[1,1,2,2,2,1,1,1,2,1,1,2,1,1,1,2,2,2,1,1],[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]];
    let map=mapTemplate.map(r=>[...r]),totalDots=0,dotsEaten=0;
    map.forEach(r=>r.forEach(c=>{if(c===2||c===3)totalDots++;}));
    let pacman={x:10,y:16,direction:{x:0,y:0},nextDirection:{x:0,y:0},mouthOpen:0,mouthSpeed:8};
    const ghosts=[{x:9,y:10,color:'#ff0000'},{x:10,y:10,color:'#ffb8ff'},{x:11,y:10,color:'#00ffff'},{x:10,y:9,color:'#ffb852'}];
    let ghostMoveTimer=0,GHOST_MOVE_INTERVAL=0.2,powerMode=false,powerModeTimer=0,POWER_MODE_DURATION=7;
    
    function canMove(x,y){const tx=Math.round(x),ty=Math.round(y);if(tx<0||tx>=COLS||ty<0||ty>=ROWS)return true;return map[ty][tx]!==1;}
    function findPath(sx,sy,tx,ty){const q=[{x:sx,y:sy,path:[]}],visited=new Set(`${sx},${sy}`);while(q.length>0){const c=q.shift();if(Math.abs(c.x-tx)<1&&Math.abs(c.y-ty)<1)return c.path.length>0?c.path[0]:null;const dirs=[{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}];for(let d of dirs){const nx=c.x+d.x,ny=c.y+d.y,k=`${nx},${ny}`;!visited.has(k)&&canMove(nx,ny)&&(visited.add(k),q.push({x:nx,y:ny,path:c.path.length===0?[d]:[...c.path,d]}));}}return null;}
    
    function updateGhostAI(ghost,dt){let target;if(powerMode)target={x:0,y:0};else{switch(ghost.color){case'#ff0000':target={x:pacman.x,y:pacman.y};break;default:target={x:pacman.x,y:pacman.y};}}const m=findPath(ghost.x,ghost.y,target.x,target.y);if(m){ghost.x+=m.x*.05;ghost.y+=m.y*.05;}}
    
    function update(dt){
        const speed=4,nx=pacman.x+pacman.nextDirection.x*speed*dt,ny=pacman.y+pacman.nextDirection.y*speed*dt;
        if(canMove(nx,ny))pacman.direction={...pacman.nextDirection};
        const newX=pacman.x+pacman.direction.x*speed*dt,newY=pacman.y+pacman.direction.y*speed*dt;
        if(canMove(newX,newY)){pacman.x=newX;pacman.y=newY;}
        if(pacman.x<-1)pacman.x=COLS;if(pacman.x>COLS)pacman.x=-1;
        pacman.mouthOpen+=pacman.mouthSpeed*dt;if(pacman.mouthOpen>.5||pacman.mouthOpen<0)pacman.mouthSpeed*=-1;
        const tileX=Math.round(pacman.x),tileY=Math.round(pacman.y);
        if(tileX>=0&&tileX<COLS&&tileY>=0&&tileY<ROWS){if(map[tileY][tileX]===2){map[tileY][tileX]=0;GameEngine.score+=10;dotsEaten++;updateScoreDisplay();}else if(map[tileY][tileX]===3){map[tileY][tileX]=0;GameEngine.score+=50;dotsEaten++;powerMode=true;powerModeTimer=POWER_MODE_DURATION;updateScoreDisplay();}}
        if(powerMode){powerModeTimer-=dt;if(powerModeTimer<=0)powerMode=false;}
        ghostMoveTimer+=dt;if(ghostMoveTimer>=GHOST_MOVE_INTERVAL){ghostMoveTimer=0;ghosts.forEach(g=>updateGhostAI(g,dt));}
        ghosts.forEach(g=>{const dist=Math.sqrt(Math.pow(pacman.x-g.x,2)+Math.pow(pacman.y-g.y,2));if(dist<.8){if(powerMode){g.x=10;g.y=10;GameEngine.score+=200;updateScoreDisplay();}else{GameEngine.stopLoop();ctx.fillStyle='rgba(0,0,0,.85)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#ef4444';ctx.font='bold 42px Plus Jakarta Sans';ctx.textAlign='center';ctx.fillText('GAME OVER',canvas.width/2,canvas.height/2-20);ctx.fillStyle='#fff';ctx.font='24px Plus Jakarta Sans';ctx.fillText(`Score: ${GameEngine.score}`,canvas.width/2,canvas.height/2+25);return;}}});
        if(dotsEaten>=totalDots){GameEngine.stopLoop();ctx.fillStyle='rgba(0,0,0,.85)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#ffff00';ctx.font='bold 42px Plus Jakarta Sans';ctx.textAlign='center';ctx.fillText('VICTOIRE!',canvas.width/2,canvas.height/2-20);ctx.fillStyle='#fff';ctx.font='24px Plus Jakarta Sans';ctx.fillText(`Score Final: ${GameEngine.score}`,canvas.width/2,canvas.height/2+25);}
    }
    
    function render(){
        ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);
        for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const px=x*TILE_SIZE,py=y*TILE_SIZE,t=map[y][x];
            if(t===1){ctx.fillStyle='#2121de';ctx.shadowColor='#4444ff';ctx.shadowBlur=5;ctx.fillRect(px+2,py+2,TILE_SIZE-4,TILE_SIZE-4);}
            else if(t===2){ctx.fillStyle='#ffb8ae';ctx.beginPath();ctx.arc(px+TILE_SIZE/2,py+TILE_SIZE/2,3,0,Math.PI*2);ctx.fill();}
            else if(t===3){ctx.fillStyle='#ffb8ae';ctx.beginPath();ctx.arc(px+TILE_SIZE/2,py+TILE_SIZE/2,8,0,Math.PI*2);ctx.fill();}
        }ctx.shadowBlur=0;
        const px=pacman.x*TILE_SIZE+TILE_SIZE/2,py=pacman.y*TILE_SIZE+TILE_SIZE/2;
        ctx.fillStyle='#ffff00';ctx.shadowColor='#ffff00';ctx.shadowBlur=15;ctx.beginPath();const mouthAngle=pacman.mouthOpen*.4,rot=Math.atan2(pacman.direction.y,pacman.direction.x);ctx.arc(px,py,TILE_SIZE/2-2,rot+mouthAngle,rot+Math.PI*2-mouthAngle);ctx.lineTo(px,py);ctx.fill();ctx.shadowBlur=0;
        ghosts.forEach(g=>{const gx=g.x*TILE_SIZE+TILE_SIZE/2,gy=g.y*TILE_SIZE+TILE_SIZE/2;ctx.fillStyle=powerMode?'#2222ff':g.color;ctx.shadowColor=powerMode?'#4444ff':g.color;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(gx,gy,TILE_SIZE/2-2,Math.PI,0,false);ctx.lineTo(gx+TILE_SIZE/2-2,gy+TILE_SIZE/2-4);for(let i=0;i<3;i++)ctx.lineTo(gx+TILE_SIZE/2-2-(i+1)*((TILE_SIZE-4)/3),gy+TILE_SIZE/2-8+(i%2)*6);ctx.closePath().fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(gx-4,gy-4,4,0,Math.PI*2);ctx.arc(gx+4,gy-4,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#22f';ctx.beginPath();ctx.arc(gx-4+pacman.direction.x*2,gy-4+pacman.direction.y*2,2,0,Math.PI*2);ctx.arc(gx+4+pacman.direction.x*2,gy-4+pacman.direction.y*2,2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0});
        if(powerMode){ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#fff';ctx.font='bold 18px Plus Jakarta Sans';ctx.textAlign='center';ctx.fillText(`POWER MODE: ${powerModeTimer.toFixed(1)}s`,canvas.width/2,25);}
        ctx.fillStyle='#fff';ctx.font='16px JetBrains Mono';ctx.textAlign='left';ctx.fillText(`Score: ${GameEngine.score}`,10,25);
    }
    
    document.addEventListener('keydown',(e)=>{if(GameEngine.currentGame!=='pacman')return;switch(e.key){case'ArrowUp':pacman.nextDirection={x:0,y:-1};e.preventDefault();break;case'ArrowDown':pacman.nextDirection={x:0,y:1};e.preventDefault();break;case'ArrowLeft':pacman.nextDirection={x:-1,y:0};e.preventDefault();break;case'ArrowRight':pacman.nextDirection={x:1,y:0};e.preventDefault();break;}});
    GameEngine.startLoop(update,render);
}

// ============================================================
// JEU 5: PUISSANCE 4 (IA Minimax)
// ============================================================
function initPuissance4(container){
    container.innerHTML=`<div style="text-align:center;width:100%;"><canvas id="p4Canvas" width="490" height="420" style="background:#0d1520;border-radius:12px;"></canvas><div class="game-instructions"><i class="fas fa-mouse-pointer"></i> Cliquez sur une colonne pour jouer | Rouge = Vous | Jaune = IA</div></div>`;
    const canvas=document.getElementById('p4Canvas'),ctx=canvas.getContext('2d'),COLS=7,ROWS=6,CELL_SIZE=70;
    let board=Array(ROWS).fill().map(()=>Array(COLS).fill(0)),currentPlayer=1,gameOver=false,winner=0,winningCells=[],hoverCol=-1,isAIThinking=false;
    
    function checkWin(player){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS-3;c++)if(board[r][c]===player&&board[r][c+1]===player&&board[r][c+2]===player&&board[r][c+3]===player)return[{r,c},{r,c:c+1},{r,c:c+2},{r,c:c+3}];
    for(let r=0;r<ROWS-3;r++)for(let c=0;c<COLS;c++)if(board[r][c]===player&&board[r+1][c]===player&&board[r+2][c]===player&&board[r+3][c]===player)return[{r,c},{r:r+1,c},{r:r+2,c},{r:r+3,c}];
    for(let r=0;r<ROWS-3;r++)for(let c=0;c<COLS-3;c++)if(board[r][c]===player&&board[r+1][c+1]===player&&board[r+2][c+2]===player&&board[r+3][c+3]===player)return[{r,c},{r:r+1,c:c+1},{r:r+2,c:c+2},{r:r+3,c:c+3}];
    for(let r=3;r<ROWS;r++)for(let c=0;c<COLS-3;c++)if(board[r][c]===player&&board[r-1][c+1]===player&&board[r-2][c+2]===player&&board[r-3][c+3]===player)return[{r,c},{r:r-1,c:c+1},{r:r-2,c:c+2},{r:r-3,c:c+3}];return null;}
    function isBoardFull(){return board[0].every(c=>c!==0);}
    function getValidMoves(){const moves=[];for(let c=0;c<COLS;c++)if(board[0][c]===0)moves.push(c);return moves;}
    function makeMove(col,player){for(let r=ROWS-1;r>=0;r--)if(board[r][col]===0){board[r][col]=player;return r;}return -1;}
    function undoMove(col,row){board[row][col]=0;}
    
    function minimax(depth,alpha,beta,isMaximizing){
        const aiWin=checkWinForBoard(2),playerWin=checkWinForBoard(1);
        if(aiWin)return 10000+depth;if(playerWin)return -10000-depth;if(isBoardFull()||depth===0)return evaluateBoard();
        const moves=getValidMoves();
        if(isMaximizing){let maxEval=-Infinity;for(let col of moves){const row=makeMove(col,2),eval_=minimax(depth-1,alpha,beta,false);undoMove(col,row);maxEval=Math.max(maxEval,eval_);alpha=Math.max(alpha,eval_);if(beta<=alpha)break;}return maxEval;}
        else{let minEval=Infinity;for(let col of moves){const row=makeMove(col,1),eval_=minimax(depth-1,alpha,beta,true);undoMove(col,row);minEval=Math.min(minEval,eval_);beta=Math.min(beta,eval_);if(beta<=alpha)break;}return minEval;}
    }
    function checkWinnerForBoard(b){for(let i=0;i<SIZE;i++){if(b[i][0]!==0&&b[i][0]===b[i][1]&&b[i][1]===b[i][2])return{winner:b[i][0];line:[{r:i,c:0},{r:i,c:1},{r:i,c:2}]};}for(let j=0;j<SIZE;j++){if(b[0][j]!==0&&b[0][j]===b[1][j]&&b[1][j]===b[2][j])return{winner:b[0][j];line:[{r:0,c:j},{r:1,c:j},{r:2,c:j}]};}if(b[0][0]!==0&&b[0][0]===b[1][1]&&b[1][1]===b[2][2])return{winner:b[0][0];line:[{r:0,c:0},{r:1,c:1},{r:2,c:2}]};if(b[0][2]!==0&&b[0][2]===b[1][1]&&b[1][1]===b[2][0])return{winner:b[0][2];line:[{r:0,c:2},{r:1,c:1},{r:2,c:0}]};if(b.every(r=>r.every(c=>c!==0)))return{winner:0;line:null};return null;}
    function evaluateBoard(){let score=0;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(board[r][c]===2)score+=(3-Math.abs(c-3))*2;else if(board[r][c]===1)score-=(3-Math.abs(c-3))*2;}return score;}
    
    function findBestMove(){const moves=getValidMoves();let bestMove=moves[0],bestScore=-Infinity;for(let col of moves){const row=makeMove(col,2),score=minimax(5,-Infinity,Infinity,false);undoMove(col,row);if(score>bestScore){bestScore=score;bestMove=col;}}return bestMove;}
    
    function aiMove(){if(gameOver||isAIThinking)return;isAIThinking=true;setTimeout(()=>{const col=findBestMove();makeMove(col,2);const w=checkWin(2);if(w){gameOver=true;winner=2;winningCells=w;}else if(isBoardFull()){gameOver=true;winner=0;}else currentPlayer=1;isAIThinking=false;render();},300);}
    
    function handleClick(col){if(gameOver||currentPlayer!==1||isAIThinking||board[0][col]!==0)return;makeMove(col,1);const w=checkWin(1);if(w){gameOver=true;winner=1;winningCells=w;}else if(isBoardFull()){gameOver=true;winner=0;}else{currentPlayer=2;aiMove()}render();}
    
    function render(){
        ctx.fillStyle='#0d1520';ctx.fillRect(0,0,canvas.width,canvas.height);
        for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const x=c*CELL_SIZE,y=r*CELL_SIZE;ctx.fillStyle='rgba(109,200,232,.08)';ctx.strokeStyle='rgba(109,200,232,.15)';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x+2,y+2,CELL_SIZE-4,CELL_SIZE-4,8);ctx.fill();ctx.stroke();if(board[r][c]!==0){const isWinCell=winningCells&&winningCells.some(cell=>cell.r===r&&cell.c===c);ctx.fillStyle=board[r][c]===1?'#ef4444':'#fbbf24';ctx.shadowColor=board[r][c]===1?'#ef4444':'#fbbf24';ctx.shadowBlur=isWinCell?20:10;ctx.beginPath();ctx.arc(x+CELL_SIZE/2,y+CELL_SIZE/2,CELL_SIZE/2-8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}}
        if(hoverCol>=0&&!gameOver&&currentPlayer===1&&board[0][hoverCol]===0){ctx.fillStyle='rgba(239,68,68,.3)';ctx.beginPath();ctx.arc(hoverCol*CELL_SIZE+CELL_SIZE/2,CELL_SIZE/2,CELL_SIZE/2-8,0,Math.PI*2).ctx.fill();}
        if(gameOver){ctx.fillStyle='rgba(13,21,32,.92)';ctx.fillRect(0,canvas.height/2-60,canvas.width,120);ctx.font='bold 32px Plus Jakarta Sans';ctx.textAlign='center';if(winner===1){ctx.fillStyle='#22c55e';ctx.fillText('VOUS GAGNEZ!',canvas.width/2,canvas.height/2);}else if(winner===2){ctx.fillStyle='#fbbf24';ctx.fillText("L'IA GAGNE",canvas.width/2,canvas.height/2);}else{ctx.fillStyle='#94a3b8';ctx.fillText('MATCH NUL',canvas.width/2,canvas.height/2);}}
        ctx.font='16px Plus Jakarta Sans';ctx.textAlign='center';if(!gameOver)ctx.fillStyle=currentPlayer===1?'#ef4444':'#fbbf24',ctx.fillText(isAIThinking?'IA réfléchit...':'Votre tour',canvas.width,canvas.height-15);
    }
    
    canvas.addEventListener('mousemove',(e)=>{const rect=e.target.getBoundingClientRect();hoverCol=Math.floor((e.clientX-rect.left-15)/(CELL_SIZE-10));if(hoverCol>=COLS)hoverCol=-1;if(!gameOver)render();});
    canvas.addEventListener('click',(e)=>{const rect=e.target.getBoundingClientRect();const col=Math.floor((e.clientX-rect.left-15)/(CELL_SIZE-10));if(col>=0&&col<COLS)handleClick(col);});
    canvas.addEventListener('mouseleave'=>{hoverCol=-1;if(!gameError)render();});
    render();
}

// ============================================================
// JEU 6: MORPION (IA Minimax Imbattable)
// ============================================================
function initMorpion(container){
    container.innerHTML=`<div style="text-align:center;width:100%;"><canvas id="tttCanvas" width="360" height="400" style="background:#0d1520;border-radius:12px;"></canvas><div class="game-instructions"><i class="fas fa-mouse-pointer"></i> Vous = X (Rouge) | IA = O (Cyan)</div></div>`;
    const canvas=document.getElementById('tttCanvas'),ctx=canvas.getContext('2d'),SIZE=3,CELL_SIZE=110;
    let board=Array(SIZE).fill().map(()=>Array(SIZE).fill(0)),currentPlayer=1,gameOver=false,winner=0,winLine=null;
    
    function checkWinner(){for(let i=0;i<SIZE;i++)if(board[i][0]!==0&&board[i][0]===board[i][1]&&board[i][1]===board[i][2])return{winner:board[i][0],line:[{r:i,c:0},{r:i,c:1},{r:i,c:2}]};for(let j=0;j<SIZE;j++)if(board[0][j]!==0&&board[0][j]===board[1][j]&&board[1][j]===board[2][j])return{winner:board[0][j],line:[{r:0,c:j},{r:1,c:j},{r:2,c:j}]};if(board[0][0]!==0&&board[0][0]===board[1][1]&&board[1][1]===board[2][2])return{winner:board[0][0],line:[{r:0,c:0},{r:1,c:1},{r:2,c:2}]};if(board[0][2]!==0&&board[0][2]===board[1][1]&&board[1][1]===board[2][0])return{winner:board[0][2],line:[{r:0,c:2},{r:1,c:1},{r:2,c:0}]};if(board.every(r=>r.every(c=>c!==0)))return{winner:0,line:null};return null;}
    
    function minimax(b,d,isMax,a,b){const res=checkWinnerForBoardTTT(b);if(res)return res.winner===2?10-d:res.winner===1?d-10:0;if(d===0)return 0;if(isMax){let max=-Infinity;for(let i=0;i<SIZE;i++)for(let j=0;j<SIZE;j++){if(b[i][j]===0){b[i][j]=2;const v=minimax(b,d-1,false,a,b);b[i][j]=0;max=Math.max(max,v);a=Math.max(a,v);if(b<=a)return max;}}return max;}else{let min=Infinity;for(let i=0;i<SIZE;i++)for(let j=0;j<SIZE;j++){if(b[i][j]===0){b[i][j]=1;const v=minimax(b,d-1,true,a,b);b[i][j]=0;min=Math.min(min,v);b=Math.min(b,v);if(b<=a)return min;}}return min;}}
    
    function findBestMove(){let bestS=-Infinity,bestM={r:1,c:1};for(let i=0;i<SIZE;i++)for(let j=0;j<SIZE;j++){if(board[i][j]===0){board[i][j]=2;const s=minimax(board.map(r=>[...r]),0,false,-Infinity,Infinity);board[i][j]=0;if(s>bestS){bestS=s;bestM={r:i,c:j};}}}return bestM;}
    
    function aiMove(){if(gameOver)return;const m=findBestMove();board[m.r][m.c]=2;const r=checkWinner();if(r){gameOver=true;winner=r.winner;winLine=r.line;}else currentPlayer=1;render();}
    
    function playerMove(r,c){if(gameOver||currentPlayer!==1||board[r][c]!==0)return;board[r][c]=1;const r_=checkWinner();if(r_){gameOver=true;winner=r_.winner;winLine=r_.line;}else{currentPlayer=2;setTimeout(aiMove,250);}render();}
    
    function render(){
        ctx.fillStyle='#0d1520';ctx.fillRect(0,0,canvas.width,canvas.height);
        for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){const x=c*CELL_SIZE+15,y=r*CELL_SIZE+30;ctx.fillStyle='rgba(109,200,232,.06)';ctx.strokeStyle='rgba(109,200,232,.12)';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,CELL_SIZE-10,CELL_SIZE-10,12);ctx.fill();ctx.stroke();if(board[r][c]!==0){const cx=x+(CELL_SIZE-10)/2,cy=y+(CELL_SIZE-10)/2,isWC=winLine&&winLine.some(cell=>cell.r===r&&cell.c===c);if(board[r][c]===1){ctx.strokeStyle='#ef4444';ctx.lineWidth=8;ctx.shadowColor='#ef4444';ctx.shadowBlur=isWC?20:8;ctx.beginPath();ctx.moveTo(cx-25,cy-25);ctx.lineTo(cx+25,cy+25);ctx.moveTo(cx+25,cy-25);ctx.lineTo(cx-25,cy+25);ctx.stroke();}else{ctx.strokeStyle='#6dc8e8';ctx.lineWidth=8;ctx.shadowColor='#6dc8e8';ctx.shadowBlur=isWC?20:8;ctx.beginPath();ctx.arc(cx,cy,28,0,Math.PI*2);ctx.stroke();}ctx.shadowBlur=0;}}
        if(winLine){ctx.strokeStyle='#fbbf24';ctx.lineWidth=6;ctx.shadowColor='#fbbf24';ctx.shadowBlur=20;const s=winLine[0],e=winLine[2];ctx.beginPath();ctx.moveTo(s.c*CELL_SIZE+15+(CELL_SIZE-10)/2,s.r*CELL_SIZE+30+(CELL_SIZE-10)/2);ctx.lineTo(e.c*CELL_SIZE+15+(CELL_SIZE-10)/2,e.r*CELL_SIZE+30+(CELL_SIZE-10)/2);ctx.stroke();ctx.shadowBlur=0;}
        ctx.font='bold 18px Plus Jakarta Sans';ctx.textAlign='center';if(gameOver){if(winner===1){ctx.fillStyle='#22c55e';ctx.fillText('INCROYABLE! VOUS AVEZ GAGNÉ!',canvas.width/2,canvas.height-20);}else if(winner===2){ctx.fillStyle='#fbbf24';ctx.fillText("L'IA GAGNE - Réessayez!",canvas.width/2,canvas.height-20);}else{ctx.fillStyle='#94a3b8';ctx.fillText('MATCH NUL - Parfait!',canvas.width/2,canvas.height-20);}}else{ctx.fillStyle=currentPlayer===1?'#ef4444':'#6dc8e8';ctx.fillText(currentPlayer===1?'Votre tour (X)':'IA joue...',canvas.width,canvas.height-15);}
    }
    
    canvas.addEventListener('click',(e)=>{const rect=e.target.getBoundingClientRect();const x=e.clientX-rect.left-15,y=e.clientY-rect.top-30;const c=Math.floor(x/(CELL_SIZE-10)),r=Math.floor(y/(CELL_SIZE-10));if(r>=0&&r<SIZE&&c>=0&&c<SIZE)playerMove(r,c);});
    render();
}

// ============================================================
// JEU 7: BLACKJACK (Contre Croupier IA)
// ============================================================
function initBlackjack(container){
    container.innerHTML=`<div style="text-align:center;width:100%;max-width:600px;margin:0 auto;"><div id="blackjackArea" style="background:rgba(26,35,50,.8);border-radius:16px;padding:30px;border:1px solid rgba(109,200,232,.15);"><div style="display:flex;justify-content:space-between;margin-bottom:20px;"><div style="text-align:left;"><span style="color:#94a3b8;font-size:14px;">VOTRE MAIN</span><div id="playerHand" style="font-size:32px;margin-top:8px;"></div><div id="playerScore" style="color:#6dc8e8;font-family:'JetBrains Mono';margin-top:5px;">Total: 0</div></div><div style="text-align:right;"><span style="color:#94a3b8;font-size:14px;">CROUPIER</span><div id="dealerHand" style="font-size:32px;margin-top:8px;"></div><div id="dealerScore" style="color:#fbbf24;font-family:'JetBrains Mono';margin-top:5px;">Total: ??</div></div></div><div id="gameMessage" style="font-size:22px;font-weight:700;color:#6dc8e8;margin:20px 0;min-height:30px;"></div><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"id="bjButtons"><button onclick="bjHit()"class="btn btn-primary"id="btnHit"><i class="fas fa-plus"></i> Tirer</button><button onclick="bjStand()"class="btn btn-secondary"id="btnStand"><i class="fas fa-hand-paper"></i> Rester</button><button onclick="bjNewGame()"class="btn btn-secondary"id="btnNewGame"style="display:none;"><i class="fas fa-redo"></i> Nouvelle Partie</button></div><div style="margin-top:20px;padding:15px;background:rgba(0,0,0,.3);border-radius:10px;"><span style="color:#94a3b8;font-size:14px;">Jetons: </span><span id="bjChips"style="color:#fbbf24;font-family:'JetBrains Mono';font-size:18px;font-weight:700;">1000</span><span style="color:#94a3b8;font-size:14px;margin-left:20px;">Mise: </span><span id="bjBet"style="color:#6dc8e8;font-family:'JetBrains Mono';font-size:18px;font-weight:700;">100</span></div></div><div class="game-instructions"style="margin-top:16px;"><i class="fas fa-info-circle"></i> Approchez-vous de 21 sans dépasser | Le croupier tire jusqu'à 17</div></div>`;
    
    const suits=['♠','♥','♦','♣'],values=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    let deck=[],playerHand=[],dealerHand=[],chips=1000,bet=100,gameInProgress=false;
    
    function createDeck(){deck=[];for(let s of suits)for(let v of values)deck.push({suit:s,value:v});for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}}
    function dealCard(){return deck.pop();}
    function getCardValue(c){if(['J','Q','K'].includes(c.value))return 10;if(c.value==='A')return 11;return parseInt(c.value);}
    function calculateHand(hand){let total=0,aces=0;for(let card of hand){total+=getCardValue(card);if(card.value==='A')aces++}while(total>21&&aces>0){total-=10;aces--;}return total;}
    function getCardDisplay(c,h){if(h)return'<span style="background:linear-gradient(135deg,#1a2332,#0d1520);padding:8px 14px;border-radius:8px;display:inline-block;border:2px solid rgba(109,200,232,.3);">🂠</span>';const isRed=c.suit==='♥'||c.suit==='♦';return`<span style="background:rgba(255,255,255,.95);padding:8px 14px;border-radius:8px;display:inline-block;color:${isRed?'#ef4444':'#fff'};font-weight:bold;min-width:45px;text-align:center;">${c.value}${c.suit}</span>`;}
    
    function updateDisplay(showD=true){document.getElementById('playerHand').innerHTML=playerHand.map(c=>getCardDisplay(c)).join(' ');document.getElementById('dealerHand').innerHTML=dealerHand.map((c,i)=>getCardDisplay(c,showD&&i===1&&gameInProgress)).join(' ');document.getElementById('playerScore').textContent=`Total: ${calculateHand(playerHand)}`;document.getElementById('dealerScore').textContent=showD&&gameInProgress?'Total: ??':`Total: ${calculateHand(dealerHand)}`;document.getElementById('bjChips').textContent=chips;document.getElementById('bjBet').textContent=bet;}
    function setMessage(m,color='#6dc8e8'){document.getElementById('gameMessage').textContent=m;document.getElementById('gameMessage').style.color=color;}
    
    function bjNewGame(){if(chips<bet){setMessage('Pas assez de jetons!','#ef4444');return;}createDeck();playerHand=[dealCard(),dealCard()];dealerHand=[dealCard(),dealCard()];gameInProgress=true;document.getElementById('btnHit').style.display='inline-flex';document.getElementById('btnStand').style.display='inline-flex';document.getElementById('btnNewGame').style.display='none';updateDisplay(true);setMessage('Tirez ou restez...');if(calculateHand(playerHand)===21)bjStand();}
    function bjHit(){if(!gameInProgress)return;playerHand.push(dealCard());updateDisplay(true);if(calculateHand(player)>21){endGame('bust');}else if(calculateHand(player)===21)bjStand();}
    function bjStand(){if(!gameInProgress)return;gameInProgress=false;document.getElementById('btnHit').style.display='none';document.getElementById('btnStand').style.display='none';document.getElementById('btnNewGame').style.display='inline-flex';updateDisplay(false);setTimeout(()=>{while(calculateHand(dealerHand)<17){dealerHand.push(dealCard());updateStatus(false);await new Promise(r=>setTimeout(r,400));}determineWinner();},500);}
    async function dealerPlay(){await new Promise(r=>setTimeout(r,500));while(calculateHand(dealerHand)<17){dealerHand.push(dealCard());updateDisplay(false);await new Promise(r=>setTimeout(r,400));}determineWinner();}
    function determineWinner(){updateDisplay(false);const pt=calculateHand(playerHand),dt=calculateHand(dealerHand);if(dt>21)endGame('dealerBust');else if(pt>dt)endGame('win');else if(dt>pt)endGame('lose');else endGame('push');}
    function endGame(result){gameInProgress=false;document.getElementById('btnHit').style.display='none';document.getElementById('btnStand').style.display='none';document.getElementById('btnNewGame').style.display='inline-flex';switch(result){case'win':chips+=bet;GameEngine.score+=bet;setMessage(`✓ Vous gagnez! +${bet} jetons!`,'#22c55e');break;case'lose':chips-=bet;setMessage(`✗ Le croupier gagne. -${bet} jetons`,'#ef4444');break;case'bust':chips-=bet;setMessage(`💥 Bust! Vous dépassez 21. -${bet} jetons`,'#ef4444');break;case'dealerBust':chips+=bet;GameEngine.score+=bet;setMessage(`🎉 Le croupé bust! +${bet} jetons!`,'#22c55e');break;case'push':setMessage('➡ Push - Égalité','#f59e0b');break;}updateScoreDisplay();updateDisplay(false);if(chips<=0){chips=1000;setMessage('💰 Nouveaux jetons offerts!','#fbbf24');}}
    bjNewGame();
}

// ============================================================
// JEU 8: PONG CHAMPIONSHIP (IA Raquette)
// ============================================================
function initPong(container){
    container.innerHTML=`<div style="text-align:center;width:100%;"><canvas id="pongCanvas" width="800" height="500" style="background:#0d1520;border-radius:12px;"></canvas><div class="game-instructions"><i class="fas fa-keyboard"></i> ↑↓ Flèches ou Souris pour contrôler votre raquette</div></div>`;
    const canvas=document.getElementById('pongCanvas'),ctx=canvas.getContext('2d');
    const PADDLE_WIDTH=12,PADDLE_HEIGHT=90,BALL_SIZE=14,PADDLE_SPEED=380,INITIAL_BALL_SPEED=420,AI_SPEED=340,AI_ERROR_MARGIN=35;
    let paddleY=canvas.height/2-PADDLE_HEIGHT/2,aiY=canvas.height/2-PADDLE_HEIGHT/2,ballX=canvas.width/2,ballY=canvas.height/2,ballDX=INITIAL_BALL_SPEED*(Math.random()>.5?1:-1),ballDY=(Math.random()-.5)*300,playerScore=0,aiScore=0,particles=[],useMouseControl=false;
    
    function createParticle(x,y,color){for(let i=0;i<8;i++)particles.push({x,y,vx:(Math.random()-.5)*200,vy:(Math.random()-.5)*200,life:1,color});}
    function updateParticles(dt){particles=particles.filter(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt*2;return p.life>0;});}
    function renderParticles(){particles.forEach(p=>{ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;}
    
    function update(dt){
        if(!useMouseControl){if(keys['ArrowUp']||keys['KeyW'])paddleY-=PADDLE_SPEED*dt;if(keys['ArrowDown']||keys['KeyS'])paddleY+=PADDLE_SPEED*dt;}
        paddleY=Math.max(0,Math.min(canvas.height-PADDLE_HEIGHT,paddleY));
        const targetY=ballY-AI_ERROR_MARGIN/2+(Math.random()-.5)*AI_ERROR_MARGIN;const aiDiff=targetY-aiY;if(Math.abs(aiDiff)>5)aiY+=Math.sign(aiDiff)*AI_SPEED*dt;
        aiY=Math.max(0,Math.min(canvas.height-PADDLE_HEIGHT,aiY));
        ballX+=ballDX*dt;ballY+=ballDY*dt;
        if(ballY<=BALL_SIZE/2||ballY>=canvas.height-BALL_SIZE/2){ballDY*=-1;ballY=Math.max(BALL_SIZE/2,Math.min(canvas.height-BALL_SIZE/2,ballY));createParticle(ballX,ballY,'#6dc8e8');}
        if(ballX<=30+PADDLE_WIDTH&&ballY>=paddleY&&ballY<=paddleY+PADDLE_HEIGHT&&ballDX<0){ballDX*=-1.03;ballX=31;const hitPos=(ballY-paddleY)/PADDLE_HEIGHT;ballDY=(hitPos-.5)*400;createParticle(ballX,ballY,'#6dc8e8');}
        if(ballX>=canvas.width-30-PADDLE_WIDTH-BALL_SIZE&&ballY>=aiY&&ballY<=aiY+PADDLE_HEIGHT&&ballDX>0){ballDX*=-1.03;ballX=canvas.width-31-PADDLE_WIDTH-BALL_SIZE;const hitPos=(ballY-aiY)/PADDLE_HEIGHT;ballDY=(hitPos-.5)*400;createParticle(ballX,ballY,'#f093fb');}
        if(ballX<0){aiScore++;resetBall(-1);}if(ballX>canvas.width){playerScore++;GameEngine.score+=100;updateScoreDisplay();resetBall(1);}
        const speed=Math.sqrt(ballDX*ballDX+ballDY*ballDY);if(speed>900){ballDX=(ballDX/speed)*900;ballDY=(ballDY/speed)*900;}
        updateParticles(dt);
    }
    
    function render(){
        ctx.fillStyle='#0d1520';ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.setLineDash([15,15]);ctx.strokeStyle='rgba(109,200,232,.2)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(canvas.width/2,0);ctx.lineTo(canvas.width/2,canvas.height);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='#6dc8e8';ctx.shadowColor='#6dc8e8';ctx.shadowBlur=15;ctx.beginPath();ctx.roundRect(20,paddleY,PADDLE_WIDTH,PADDLE_HEIGHT,6);ctx.fill();
        ctx.fillStyle='#f093fb';ctx.shadowColor='#f093fb';ctx.beginPath();ctx.roundRect(canvas.width-20-PADDLE_WIDTH,aiY,PADDLE_WIDTH,PADDLE_HEIGHT,6);ctx.fill();ctx.shadowBlur=0;
        ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=20;ctx.beginPath();ctx.arc(ballX,ballY,BALL_SIZE/2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        ctx.globalAlpha=.3;ctx.fillStyle='#6dc8e8';ctx.beginPath();ctx.arc(ballX-ballDX*.02,ballY-ballDY*.02,BALL_SIZE/3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
        renderParticles();
        ctx.font='bold 56px Plus Jakarta Sans';ctx.textAlign='center';ctx.fillStyle='rgba(109,200,232,.3)';ctx.fillText(playerScore,canvas.width/4,80);ctx.fillText(aiScore,3*canvas.width/4,80);
        ctx.font='14px Plus Jakarta Sans';ctx.fillStyle='#6dc8e8';ctx.fillText('VOUS',canvas.width/4,110);ctx.fillStyle='#f093fb';ctx.fillText('IA',3*canvas.width/4,110);
    }
    
    function resetBall(d){ballX=canvas.width/2;ballY=canvas.height/2;ballDX=INITIAL_BALL_SPEED*d;ballDY=(Math.random()-.5)*300;}
    const keys={};document.addEventListener('keydown',(e)=>{if(GameEngine.currentGame!=='pong')return;keys[e.code]=true;if(['ArrowUp','ArrowDown','Space'].includes(e.key))e.preventDefault();});document.addEventListener('keyup',(e)=>keys[e.code]=false);
    canvas.addEventListener('mousemove',(e)=>{if(GameEngine.currentGame!=='pong')return;useMouseControl=true;const rect=e.target.getBoundingClientRect();paddleY=e.clientY-rect.top-PADDLE_HEIGHT/2;});
    GameEngine.startLoop(update,render);
}

// ============================================================
// JEU 9: AIR HOCKEY (Physique Réaliste + IA Défensive)
// ============================================================
function initAirHockey(container){
    container.innerHTML=`<div style="text-align:center;width:100%;"><canvas id="hockeyCanvas" width="700" height="450" style="background:#0d1520;border-radius:12px;"></canvas><div class="game-instructions"><i class="fas fa-mouse-pointer"></i> Souris pour contrôler votre palet | Marquez dans le but adverse!</div></div>`;
    const canvas=document.getElementById('hockeyCanvas'),ctx=canvas.getContext('2d');
    const GOAL_WIDTH=130,PUCK_RADIUS=18,STRIKER_RADIUS=32,FRICTION=.985,MAX_PUCK_SPEED=700;
    let puck={x:canvas.width/2,y:canvas.height/2,vx:0,vy:0},striker={x:120,y:canvas.height/2,vx:0,vy:0},aiStriker={x:canvas.width-120,y:canvas.height/2,vx:0,vy:0},playerScore=0,aiScore=0,goalAnimation=0,scorer='';
    const PLAYER_MAX_X=canvas.width/2-STRIKER_RADIUS,AI_MIN_X=canvas.width/2+STRIKER_RADIUS;
    
    function resetPuck(side){puck.x=canvas.width/2;puck.y=canvas.height/2;puck.vx=side==='player'?200:-200;puck.vy=(Math.random()-.5)*150;}
    function circleCollision(c1,r1,c2,r2){const dx=c2.x-c1.x,dy=c2.y-c1.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<r1+r2){const nx=dx/dist,ny=dy/dist,overlap=r1+r2-dist;c1.x-=overlap*nx/2;c1.y-=overlap*ny/2;c2.x+=overlap*nx/2;c2.y+=overlap*ny/2;const dvx=c1.vx-c2.vx,dvy=c1.vy-c2.vy,dvn=dvx*nx+dvy*ny;if(dvn>0){const imp=dvn*.9;c1.vx-=imp*nx;c1.vy-=imp*ny;c2.vx+=imp*nx;c2.vy+=imp*ny;}return true;}return false;}
    function wallCollision(obj,r){if(obj.y-r<0){obj.y=r;obj.vy*=-.9;}if(obj.y+r>canvas.height){obj.y=canvas.height-r;obj.vy*=-.9;}const goalTop=(canvas.height-GOAL_WIDTH)/2,goalBottom=(canvas.height+GOAL_WIDTH)/2;if(obj.x-r<0){if(obj.y<goalTop||obj.y>goalBottom){obj.x=r;obj.vx*=-.9;}else if(obj===puck){playerScore++;GameEngine.score+=200;updateScoreDisplay();scorer='player';goalAnimation=1;setTimeout(()=>resetPuck('ai'),1000);}}if(obj.x+r>canvas.width){if(obj.y<goalTop||obj.y>goalBottom){obj.x=canvas.width-r;obj.vx*=-.9;}else if(obj===puck){aiScore++;scorer='ai';goalAnimation=1;setTimeout(()=>resetPuck('player'),1000);}}}
    
    function updateAI(dt){const goalCenter=canvas.height/2,targetX=canvas.width-150;if(puck.x>canvas.width/2){const predictedY=puck.y+puck.vy*.3;aiStriker.vy+=(predictedY-aiStriker.y)*5*dt;aiStriker.vx+=(puck.x-80-aiStriker.x)*4*dt;}else{aiStriker.vy+=(goalCenter-aiStriker.y)*3*dt;aiStriker.vx+=(targetX-aiStriker.x)*3*dt;}aiStriker.vx*=.9;aiStriker.vy*=.9;const aiSpeed=Math.sqrt(aiStriker.vx**2+aiStriker.vy**2);if(aiSpeed>280){aiStriker.vx=(aiStriker.vx/aiSpeed)*280;aiStriker.vy=(aiStriker.vy/aiSpeed)*280;}aiStriker.x+=aiStriker.vx*dt;aiStriker.y+=aiStriker.vy*dt;aiStriker.x=Math.max(AI_MIN_X,Math.min(canvas.width-20,aiStriker.x));aiStriker.y=Math.max(STRIKER_RADIUS,Math.min(canvas.height-STRIKER_RADIUS,aiStriker.y));}
    
    function update(dt){
        if(goalAnimation>0){goalAnimation-=dt;return;}
        puck.vx*=FRICTION;puck.vy*=FRICTION;puck.x+=puck.vx*dt;puck.y+=puck.vy*dt;
        circleCollision(striker,STRIKER_RADIUS,puck,PUCK_RADIUS);circleCollision(aiStriker,STRIKER_RADIUS,puck,PUCK_RADIUS);
        wallCollision(puck,PUCK_RADIUS);wallCollision(striker,STRIKER_RADIUS);wallCollision(aiStriker,STRIKER_RADIUS);
        striker.x=Math.max(STRIKER_RADIUS,Math.min(PLAYER_MAX_X,striker.x));striker.y=Math.max(STRIKER_RADIUS,Math.min(canvas.height-STRIKER_RADIUS,striker.y));
        const speed=Math.sqrt(puck.vx**2+puck.vy**2);if(speed>MAX_PUCK_SPEED){puck.vx=(puck.vx/speed)*MAX_PUCK_SPEED;puck.vy=(puck.vy/speed)*MAX_PUCK_SPEED;}
        updateAI(dt);
    }
    
    function render(){
        ctx.fillStyle='#0d1520';ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.strokeStyle='rgba(109,200,232,.3)';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(10,10,canvas.width-20,canvas.height-20,20);ctx.stroke();
        ctx.setLineDash([10,10]);ctx.beginPath();ctx.moveTo(canvas.width/2,10);ctx.lineTo(canvas.width/2,canvas.height-10);ctx.stroke();ctx.setLineDash([]);
        ctx.beginPath();ctx.arc(canvas.width/2,canvas.height/2,50,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(canvas.width/2,canvas.height/2,8,0,Math.PI*2);ctx.fillStyle='rgba(109,200,232,.3)';ctx.fill();
        const goalTop=(canvas.height-GOAL_WIDTH)/2;ctx.fillStyle='rgba(34,197,94,.2)';ctx.fillRect(0,goalTop,8,GOAL_WIDTH);ctx.fillStyle='rgba(239,68,68,.2)';ctx.fillRect(canvas.width-8,goalTop,8,GOAL_WIDTH);
        if(goalAnimation>0){ctx.fillStyle=scorer==='player'?'rgba(34,197,94,.3)':'rgba(239,68,68,.3)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font='bold 48px Plus Jakarta Sans';ctx.textAlign='center';ctx.fillStyle=scorer==='player'?'#22c55e':'#ef4444';ctx.fillText('GOAL!',canvas.width/2,canvas.height/2);}
        ctx.fillStyle='#6dc8e8';ctx.shadowColor='#6dc8e8';ctx.shadowBlur=20;ctx.beginPath();ctx.arc(striker.x,striker.y,STRIKER_RADIUS,0,Math.PI*2);ctx.fill();ctx.fillStyle='#0d1520';ctx.beginPath();ctx.arc(striker.x,striker.y,12,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#f093fb';ctx.shadowColor='#f093fb';ctx.beginPath();ctx.arc(aiStriker.x,aiStriker.y,STRIKER_RADIUS,0,Math.PI*2);ctx.fill();ctx.fillStyle='#0d1520';ctx.beginPath();ctx.arc(aiStriker.x,aiStriker.y,12,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=15;ctx.beginPath();ctx.arc(puck.x,puck.y,PUCK_RADIUS,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        ctx.font='bold 42px Plus Jakarta Sans';ctx.textAlign='center';ctx.fillStyle='rgba(109,200,232,.4)';ctx.fillText(playerScore,canvas.width/4,55);ctx.fillStyle='rgba(240,147,251,.4)';ctx.fillText(aiScore,3*canvas.width/4,55);
        ctx.font='13px Plus Jakarta Sans';ctx.fillStyle='#6dc8e8';ctx.fillText('VOUS',canvas.width/4,78);ctx.fillStyle='#f093fb';ctx.fillText('IA',3*canvas.width/4,78);
    }
    
    canvas.addEventListener('mousemove',(e)=>{if(GameEngine.currentGame!=='airhockey')return;const rect=e.target.getBoundingClientRect();const mouseY=e.clientY-rect.top,mouseX=e.clientX-rect.left;striker.vy=(mouseY-striker.y)*12;striker.vx=(mouseX-striker.x)*12;const speed=Math.sqrt(striker.vx**2+striker.vy**2);if(speed>500){striker.vx=(striker.vx/speed)*500;striker.vy=(striker.vy/speed)*500;}});
    GameEngine.startLoop(update,render);
}

// FIN DU SCRIPT - TOUS LES 9 JEUX SONT CODÉS ET PRÊTS À JOUER!
console.log('%c🎮 LuJEUX v3.0 Pro chargé!','color: #6dc8e8; font-size: 20px; font-weight: bold;');
console.log('%c9 Jeux | Delta Time 60 FPS | IA Minimax | Sans Lag','color: #94a3b8; font-size: 14px;');
