// ===== DONNÉES DES JEUX =====
const games = [
    {
        id: 'snake',
        name: 'Snake',
        category: 'classique',
        icon: '🐍',
        description: 'Le classique jeu du serpent. Mangez les pommes pour grandir.',
        instructions: 'Utilisez les flèches directionnelles pour vous déplacer'
    },
    {
        id: 'space-invaders',
        name: 'Space Invaders',
        category: 'arcade',
        icon: '👾',
        description: 'Détruisez les envahisseurs spatiaux avant qu\'ils n\'arrivent.',
        instructions: 'Flèches pour se déplacer, Espace pour tirer'
    },
    {
        id: 'tetris',
        name: 'Tetris',
        category: 'puzzle',
        icon: '🧱',
        description: 'Assemblez les blocs tombants pour compléter les lignes.',
        instructions: 'Flèches gauche/droite pour déplacer, Haut pour tourner'
    },
    {
        id: 'pong',
        name: 'Pong',
        category: 'classique',
        icon: '🏓',
        description: 'Le jeu de tennis classique contre l\'ordinateur.',
        instructions: 'Déplacez la souris ou utilisez les flèches haut/bas'
    },
    {
        id: 'memory',
        name: 'Memory',
        category: 'puzzle',
        icon: '🧠',
        description: 'Trouvez les paires de cartes identiques.',
        instructions: 'Cliquez sur les cartes pour les retourner'
    },
    {
        id: 'tictactoe',
        name: 'Morpion',
        category: 'strategie',
        icon: '⭕',
        description: 'Alignez 3 symboles pour gagner contre l\'IA.',
        instructions: 'Cliquez sur une case pour jouer'
    },
    {
        id: 'breakout',
        name: 'Breakout',
        category: 'arcade',
        icon: '🧱',
        description: 'Cassez toutes les briques avec la balle.',
        instructions: 'Souris ou flèches pour déplacer la raquette'
    },
    {
        id: '2048',
        name: '2048',
        category: 'puzzle',
        icon: '🔢',
        description: 'Fusionnez les nombres pour atteindre 2048.',
        instructions: 'Flèches directionnelles pour déplacer les tuiles'
    },
    {
        id: 'reaction',
        name: 'Test de Réaction',
        category: 'reflexe',
        icon: '⚡',
        description: 'Testez vos réflexes en cliquant le plus vite possible.',
        instructions: 'Attendez le vert puis cliquez vite !'
    },
    {
        id: 'clickspeed',
        name: 'Click Speed Test',
        category: 'reflexe',
        icon: '🖱️',
        description: 'Combien de clics pouvez-vous faire en 10 secondes ?',
        instructions: 'Cliquez le plus vite possible !'
    },
    {
        id: 'quiz',
        name: 'Quiz Culture Générale',
        category: 'strategie',
        icon: '❓',
        description: 'Testez vos connaissances avec ce quiz interactif.',
        instructions: 'Choisissez la bonne réponse parmi les 4 propositions'
    },
    {
        id: 'numberguess',
        name: 'Nombre Mystère',
        category: 'strategie',
        icon: '🔢',
        description: 'Devinez le nombre entre 1 et 100 en moins de coups possibles.',
        instructions: 'Entrez un nombre et suivez les indices'
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

// ===== RENDU DES JEUX =====
function renderGames(filter = 'all') {
    const gamesGrid = document.getElementById('gamesGrid');
    gamesGrid.innerHTML = '';

    const filteredGames = filter === 'all' 
        ? games 
        : games.filter(game => game.category === filter);

    filteredGames.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.innerHTML = `
            <div class="game-preview">${game.icon}</div>
            <div class="game-info">
                <h3>${game.name}</h3>
                <div class="game-meta">
                    <span class="game-category-tag">${game.category}</span>
                </div>
                <p class="game-description">${game.description}</p>
                <button class="play-btn" onclick="openGame('${game.id}')">
                    Jouer →
                </button>
            </div>
        `;
        gamesGrid.appendChild(gameCard);
    });
}

// ===== ÉVÉNEMENTS =====
function setupEventListeners() {
    // Thème sombre/clair
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Catégories
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            renderGames(category);
            scrollToSection('jeux');
        });
    });

    // Fermer modal avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeGame();
    });

    // Fermer modal en cliquant à l'extérieur
    document.getElementById('gameModal').addEventListener('click', (e) => {
        if (e.target.id === 'gameModal') closeGame();
    });
}

// ===== NAVIGATION =====
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

// ===== GESTION DES JEUX =====
function openGame(gameId) {
    currentGame = gameId;
    score = 0;
    level = 1;
    
    const game = games.find(g => g.id === gameId);
    document.getElementById('modalTitle').textContent = game.name;
    updateScoreDisplay();
    
    // Charger le jeu correspondant
    loadGame(gameId);
    
    // Afficher le modal
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
        setTimeout(() => openGame(currentGame), 100);
    }
}

function updateScoreDisplay() {
    document.getElementById('gameScore').textContent = `Score: ${score}`;
    document.getElementById('gameLevel').textContent = `Niveau: ${level}`;
}

// ===== CHARGEMENT DES JEUX =====
function loadGame(gameId) {
    const container = document.getElementById('gameContainer');
    
    switch(gameId) {
        case 'snake':
            loadSnake(container);
            break;
        case 'space-invaders':
            loadSpaceInvaders(container);
            break;
        case 'tetris':
            loadTetris(container);
            break;
        case 'pong':
            loadPong(container);
            break;
        case 'memory':
            loadMemory(container);
            break;
        case 'tictactoe':
            loadTicTacToe(container);
            break;
        case 'breakout':
            loadBreakout(container);
            break;
        case '2048':
            load2048(container);
            break;
        case 'reaction':
            loadReactionTest(container);
            break;
        case 'clickspeed':
            loadClickSpeed(container);
            break;
        case 'quiz':
            loadQuiz(container);
            break;
        case 'numberguess':
            loadNumberGuess(container);
            break;
    }
}

// ====================================================================
// ===== JEUX FONCTIONNELS ============================================
// ====================================================================

// ===== 1. SNAKE =====
function loadSnake(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="snakeCanvas" width="400" height="400" style="background:#f0f0f0;border:2px solid #ddd;"></canvas>
            <p class="game-instructions">Utilisez les flèches pour diriger le serpent</p>
        </div>
    `;
    
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    let snake = [{x: 10, y: 10}];
    let food = {x: 15, y: 15};
    let dx = 0;
    let dy = 0;
    
    function drawGame() {
        // Fond
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Serpent
        ctx.fillStyle = '#2563eb';
        snake.forEach((segment, index) => {
            if (index === 0) ctx.fillStyle = '#1d4ed8';
            else ctx.fillStyle = '#3b82f6';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });
        
        // Nourriture
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Déplacement
        if (dx !== 0 || dy !== 0) {
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            
            // Collision murs
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                gameOver();
                return;
            }
            
            // Collision soi-même
            for (let segment of snake) {
                if (head.x === segment.x && head.y === segment.y) {
                    gameOver();
                    return;
                }
            }
            
            snake.unshift(head);
            
            // Manger nourriture
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
    
    function gameOver() {
        clearInterval(gameInterval);
        alert(`Game Over ! Score: ${score}`);
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
    
    gameInterval = setInterval(drawGame, 150);
}

// ===== 2. SPACE INVADERS =====
function loadSpaceInvaders(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="spaceCanvas" width="500" height="400" style="background:#1a1a2e;border:2px solid #333;"></canvas>
            <p class="game-instructions" style="color:#fff;">← → pour se déplacer, ESPACE pour tirer</p>
        </div>
    `;
    
    const canvas = document.getElementById('spaceCanvas');
    const ctx = canvas.getContext('2d');
    
    let player = { x: 225, y: 360, width: 50, height: 20 };
    let bullets = [];
    let enemies = [];
    let enemyDirection = 1;
    
    // Créer ennemis
    for (let i = 0; i < 8; i++) {
        enemies.push({ x: 50 + i * 55, y: 50, width: 40, height: 30, alive: true });
    }
    
    function draw() {
        // Fond
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Joueur
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Balles
        ctx.fillStyle = '#fbbf24';
        bullets.forEach((bullet, index) => {
            bullet.y -= 8;
            ctx.fillRect(bullet.x, bullet.y, 4, 12);
            if (bullet.y < 0) bullets.splice(index, 1);
        });
        
        // Ennemis
        enemies.forEach(enemy => {
            if (enemy.alive) {
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                
                enemy.x += enemyDirection;
                
                // Collision balle-enemi
                bullets.forEach((bullet, bIndex) => {
                    if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width &&
                        bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
                        enemy.alive = false;
                        bullets.splice(bIndex, 1);
                        score += 50;
                        updateScoreDisplay();
                    }
                });
            }
        });
        
        // Direction ennemis
        if (enemies.some(e => e.alive && (e.x <= 0 || e.x >= canvas.width - e.width))) {
            enemyDirection *= -1;
            enemies.forEach(e => e.y += 20);
        }
        
        // Victoire
        if (enemies.every(e => !e.alive)) {
            clearInterval(gameInterval);
            alert(`Victoire ! Score: ${score}`);
        }
    }
    
    document.addEventListener('keydown', (e) => {
        if (currentGame !== 'space-invaders') return;
        
        if (e.key === 'ArrowLeft' && player.x > 0) player.x -= 15;
        if (e.key === 'ArrowRight' && player.x < canvas.width - player.width) player.x += 15;
        if (e.key === ' ') {
            bullets.push({ x: player.x + player.width/2 - 2, y: player.y });
        }
    });
    
    gameInterval = setInterval(draw, 50);
}

// ===== 3. TETRIS =====
function loadTetris(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="tetrisCanvas" width="300" height="600" style="background:#e5e7eb;border:2px solid #ccc;"></canvas>
            <p class="game-instructions">← → déplacer, ↑ tourner, ↓ descendre</p>
        </div>
    `;
    
    const canvas = document.getElementById('tetrisCanvas');
    const ctx = canvas.getContext('2d');
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 30;
    
    let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    let currentPiece = generatePiece();
    let nextPiece = generatePiece();
    
    const PIECES = [
        [[1,1,1,1]], // I
        [[1,1],[1,1]], // O
        [[0,1,0],[1,1,1]], // T
        [[1,0,0],[1,1,1]], // L
        [[0,0,1],[1,1,1]], // J
        [[0,1,1],[1,1,0]], // S
        [[1,1,0],[0,1,1]]  // Z
    ];
    
    const COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#0000f0', '#00f000', '#f00000'];
    
    function generatePiece() {
        const type = Math.floor(Math.random() * PIECES.length);
        return {
            shape: PIECES[type],
            color: COLORS[type],
            x: Math.floor(COLS / 2) - 1,
            y: 0
        };
    }
    
    function draw() {
        // Fond
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Grille
        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillStyle = value;
                    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                }
            });
        });
        
        // Pièce courante
        ctx.fillStyle = currentPiece.color;
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillRect(
                        (currentPiece.x + x) * BLOCK_SIZE,
                        (currentPiece.y + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            });
        });
        
        // Grille
        ctx.strokeStyle = '#d1d5db';
        for (let i = 0; i <= COLS; i++) {
            ctx.beginPath();
            ctx.moveTo(i * BLOCK_SIZE, 0);
            ctx.lineTo(i * BLOCK_SIZE, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i <= ROWS; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * BLOCK_SIZE);
            ctx.lineTo(canvas.width, i * BLOCK_SIZE);
            ctx.stroke();
        }
    }
    
    function moveDown() {
        currentPiece.y++;
        if (collision()) {
            currentPiece.y--;
            mergePiece();
            clearLines();
            currentPiece = nextPiece;
            nextPiece = generatePiece();
            if (collision()) {
                clearInterval(gameInterval);
                alert(`Game Over ! Score: ${score}`);
            }
        }
    }
    
    function collision() {
        return currentPiece.shape.some((row, y) => {
            return row.some((value, x) => {
                if (!value) return false;
                const newX = currentPiece.x + x;
                const newY = currentPiece.y + y;
                return newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX]);
            });
        });
    }
    
    function mergePiece() {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
                }
            });
        });
    }
    
    function clearLines() {
        let linesCleared = 0;
        board.forEach((row, y) => {
            if (row.every(cell => cell)) {
                board.splice(y, 1);
                board.unshift(Array(COLS).fill(0));
                linesCleared++;
            }
        });
        if (linesCleared > 0) {
            score += linesCleared * 100;
            updateScoreDisplay();
        }
    }
    
    function rotate() {
        const rotated = currentPiece.shape[0].map((_, i) =>
            currentPiece.shape.map(row => row[i]).reverse()
        );
        const prevShape = currentPiece.shape;
        currentPiece.shape = rotated;
        if (collision()) currentPiece.shape = prevShape;
    }
    
    document.addEventListener('keydown', (e) => {
        if (currentGame !== 'tetris') return;
        
        switch(e.key) {
            case 'ArrowLeft':
                currentPiece.x--;
                if (collision()) currentPiece.x++;
                break;
            case 'ArrowRight':
                currentPiece.x++;
                if (collision()) currentPiece.x--;
                break;
            case 'ArrowDown':
                moveDown();
                break;
            case 'ArrowUp':
                rotate();
                break;
        }
    });
    
    draw();
    gameInterval = setInterval(moveDown, 800);
}

// ===== 4. PONG =====
function loadPong(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="pongCanvas" width="600" height="400" style="background:#fafafa;border:2px solid #ddd;"></canvas>
            <p class="game-instructions">Déplacez la souris pour contrôler votre raquette</p>
        </div>
    `;
    
    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');
    
    let playerY = 175;
    let aiY = 175;
    let ballX = 300;
    let ballY = 200;
    let ballDX = 5;
    let ballDY = 3;
    let playerScore = 0;
    let aiScore = 0;
    
    function draw() {
        // Fond
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Ligne centrale
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = '#ddd';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Raquettes
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(20, playerY, 10, 50);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(canvas.width - 30, aiY, 10, 50);
        
        // Balle
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Scores
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(playerScore, canvas.width / 4, 40);
        ctx.fillStyle = '#ef4444';
        ctx.fillText(aiScore, 3 * canvas.width / 4, 40);
        
        // Mouvement balle
        ballX += ballDX;
        ballY += ballDY;
        
        // Rebond haut/bas
        if (ballY <= 8 || ballY >= canvas.height - 8) ballDY *= -1;
        
        // Collision joueur
        if (ballX <= 30 && ballY > playerY && ballY < playerY + 50) {
            ballDX *= -1.1;
            ballX = 31;
        }
        
        // Collision IA
        if (ballX >= canvas.width - 30 && ballY > aiY && ballY < aiY + 50) {
            ballDX *= -1.1;
            ballX = canvas.width - 31;
        }
        
        // Point marqué
        if (ballX < 0) {
            aiScore++;
            resetBall();
        }
        if (ballX > canvas.width) {
            playerScore++;
            score += 10;
            updateScoreDisplay();
            resetBall();
        }
        
        // IA
        if (aiY + 25 < ballY - 20) aiY += 4;
        else if (aiY + 25 > ballY + 20) aiY -= 4;
    }
    
    function resetBall() {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballDX = 5 * (Math.random() > 0.5 ? 1 : -1);
        ballDY = 3 * (Math.random() > 0.5 ? 1 : -1);
    }
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        playerY = e.clientY - rect.top - 25;
        if (playerY < 0) playerY = 0;
        if (playerY > canvas.height - 50) playerY = canvas.height - 50;
    });
    
    gameInterval = setInterval(draw, 16);
}

// ===== 5. MEMORY GAME =====
function loadMemory(container) {
    const emojis = ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤'];
    let cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    let flippedCards = [];
    let matchedPairs = 0;
    let canFlip = true;
    
    container.innerHTML = `
        <div style="text-align:center;">
            <div class="memory-grid" id="memoryGrid"></div>
            <p class="game-instructions">Trouvez les paires de cartes identiques</p>
        </div>
    `;
    
    const grid = document.getElementById('memoryGrid');
    
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        card.innerHTML = `
            <div class="memory-card-front">?</div>
            <div class="memory-card-back">${emoji}</div>
        `;
        card.addEventListener('click', () => flipCard(card));
        grid.appendChild(card);
    });
    
    function flipCard(card) {
        if (!canFlip || card.classList.contains('flipped') || flippedCards.includes(card)) return;
        
        card.classList.add('flipped');
        flippedCards.push(card);
        
        if (flippedCards.length === 2) {
            canFlip = false;
            const [card1, card2] = flippedCards;
            
            if (card1.dataset.emoji === card2.dataset.emoji) {
                matchedPairs++;
                score += 50;
                updateScoreDisplay();
                flippedCards = [];
                canFlip = true;
                
                if (matchedPairs === emojis.length) {
                    setTimeout(() => alert(`Félicitations ! Score: ${score}`), 300);
                }
            } else {
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    flippedCards = [];
                    canFlip = true;
                }, 1000);
            }
        }
    }
}

// ===== 6. TIC-TAC-TOE =====
function loadTicTacToe(container) {
    let board = Array(9).fill('');
    let currentPlayer = 'X';
    let gameActive = true;
    
    container.innerHTML = `
        <div style="text-align:center;">
            <div class="tictactoe-board" id="tttBoard"></div>
            <p class="game-instructions" id="tttStatus">Tour du joueur X</p>
        </div>
    `;
    
    const boardEl = document.getElementById('tttBoard');
    const statusEl = document.getElementById('tttStatus');
    
    board.forEach((cell, index) => {
        const cellEl = document.createElement('div');
        cellEl.className = 'tictactoe-cell';
        cellEl.dataset.index = index;
        cellEl.addEventListener('click', () => makeMove(index, cellEl));
        boardEl.appendChild(cellEl);
    });
    
    function makeMove(index, cellEl) {
        if (board[index] || !gameActive) return;
        
        board[index] = currentPlayer;
        cellEl.textContent = currentPlayer;
        cellEl.style.color = currentPlayer === 'X' ? '#2563eb' : '#ef4444';
        
        if (checkWin()) {
            statusEl.textContent = `${currentPlayer} a gagné !`;
            gameActive = false;
            score += 100;
            updateScoreDisplay();
            return;
        }
        
        if (board.every(cell => cell)) {
            statusEl.textContent = 'Match nul !';
            gameActive = false;
            return;
        }
        
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusEl.textContent = `Tour du joueur ${currentPlayer}`;
    }
    
    function checkWin() {
        const wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return wins.some(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
    }
}

// ===== 7. BREAKOUT =====
function loadBreakout(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="breakoutCanvas" width="480" height="320" style="background:#f3f4f6;border:2px solid #ddd;"></canvas>
            <p class="game-instructions">Souris ou flèches pour déplacer la raquette</p>
        </div>
    `;
    
    const canvas = document.getElementById('breakoutCanvas');
    const ctx = canvas.getContext('2d');
    
    let paddleWidth = 80;
    let paddleX = (canvas.width - paddleWidth) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height - 30;
    let ballDX = 4;
    let ballDY = -4;
    
    let bricks = [];
    const brickRowCount = 4;
    const brickColumnCount = 8;
    const brickWidth = 54;
    const brickHeight = 18;
    const brickPadding = 4;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 14;
    
    // Créer briques
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Briques
        bricks.forEach((col, c) => {
            col.forEach((brick, r) => {
                if (brick.status === 1) {
                    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                    brick.x = brickX;
                    brick.y = brickY;
                    
                    ctx.fillStyle = ['#ef4444', '#f97316', '#eab308', '#22c55e'][r];
                    ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
                }
            });
        });
        
        // Raquette
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(paddleX, canvas.height - 20, paddleWidth, 10);
        
        // Balle
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouvement balle
        ballX += ballDX;
        ballY += ballDY;
        
        // Rebonds murs
        if (ballX + ballDX > canvas.width - 6 || ballX + ballDX < 6) ballDX = -ballDX;
        if (ballY + ballDY < 6) ballDY = -ballDY;
        
        // Rebond raquette
        if (ballY + ballDY > canvas.height - 26) {
            if (ballX > paddleX && ballX < paddleX + paddleWidth) {
                ballDY = -ballDY;
            } else if (ballY + ballDY > canvas.height - 6) {
                clearInterval(gameInterval);
                alert(`Game Over ! Score: ${score}`);
            }
        }
        
        // Collision briques
        bricks.forEach(col => {
            col.forEach(brick => {
                if (brick.status === 1) {
                    if (ballX > brick.x && ballX < brick.x + brickWidth &&
                        ballY > brick.y && ballY < brick.y + brickHeight) {
                        ballDY = -ballDY;
                        brick.status = 0;
                        score += 10;
                        updateScoreDisplay();
                    }
                }
            });
        });
        
        // Victoire
        if (bricks.every(col => col.every(brick => brick.status === 0))) {
            clearInterval(gameInterval);
            alert(`Victoire ! Score: ${score}`);
        }
    }
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        paddleX = mouseX - paddleWidth / 2;
        if (paddleX < 0) paddleX = 0;
        if (paddleX + paddleWidth > canvas.width) paddleX = canvas.width - paddleWidth;
    });
    
    gameInterval = setInterval(draw, 16);
}

// ===== 8. 2048 =====
function load2048(container) {
    let grid = Array(4).fill().map(() => Array(4).fill(0));
    addNewTile();
    addNewTile();
    
    container.innerHTML = `
        <div style="text-align:center;">
            <div id="grid2048" style="display:inline-grid;grid-template-columns:repeat(4,90px);gap:8px;background:#bbada0;padding:10px;border-radius:8px;"></div>
            <p class="game-instructions">Flèches directionnelles pour déplacer les tuiles</p>
        </div>
    `;
    
    const gridEl = document.getElementById('grid2048');
    
    function render() {
        gridEl.innerHTML = '';
        grid.forEach(row => {
            row.forEach(value => {
                const cell = document.createElement('div');
                cell.style.cssText = `
                    width:90px;height:90px;display:flex;align-items:center;justify-content:center;
                    font-size:${value > 512 ? '24px' : '32px'};font-weight:bold;
                    background:${getTileColor(value)};color:${value > 4 ? '#fff' : '#776e65'};
                    border-radius:6px;
                `;
                cell.textContent = value || '';
                gridEl.appendChild(cell);
            });
        });
    }
    
    function getTileColor(value) {
        const colors = {
            0: '#cdc1b4', 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179',
            16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72',
            256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e'
        };
        return colors[value] || '#3c3a32';
    }
    
    function addNewTile() {
        const empty = [];
        grid.forEach((row, y) => row.forEach((cell, x) => {
            if (cell === 0) empty.push({x, y});
        }));
        if (empty.length > 0) {
            const {x, y} = empty[Math.floor(Math.random() * empty.length)];
            grid[y][x] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    function move(direction) {
        let moved = false;
        
        if (direction === 'left' || direction === 'right') {
            grid.forEach(row => {
                if (direction === 'right') row.reverse();
                let newRow = row.filter(val => val !== 0);
                for (let i = 0; i < newRow.length - 1; i++) {
                    if (newRow[i] === newRow[i + 1]) {
                        newRow[i] *= 2;
                        score += newRow[i];
                        updateScoreDisplay();
                        newRow[i + 1] = 0;
                    }
                }
                newRow = newRow.filter(val => val !== 0);
                while (newRow.length < 4) newRow.push(0);
                if (direction === 'right') newRow.reverse();
                if (row.join(',') !== newRow.join(',')) moved = true;
                row.splice(0, 4, ...newRow);
            });
        } else {
            for (let x = 0; x < 4; x++) {
                let col = [grid[0][x], grid[1][x], grid[2][x], grid[3][x]];
                if (direction === 'down') col.reverse();
                let newCol = col.filter(val => val !== 0);
                for (let i = 0; i < newCol.length - 1; i++) {
                    if (newCol[i] === newCol[i + 1]) {
                        newCol[i] *= 2;
                        score += newCol[i];
                        updateScoreDisplay();
                        newCol[i + 1] = 0;
                    }
                }
                newCol = newCol.filter(val => val !== 0);
                while (newCol.length < 4) newCol.push(0);
                if (direction === 'down') newCol.reverse();
                if (col.join(',') !== newCol.join(',')) moved = true;
                grid[0][x] = newCol[0];
                grid[1][x] = newCol[1];
                grid[2][x] = newCol[2];
                grid[3][x] = newCol[3];
            }
        }
        
        if (moved) {
            addNewTile();
            render();
        }
    }
    
    render();
    
    document.addEventListener('keydown', (e) => {
        if (currentGame !== '2048') return;
        const moves = {'ArrowLeft': 'left', 'ArrowRight': 'right', 'ArrowUp': 'up', 'ArrowDown': 'down'};
        if (moves[e.key]) move(moves[e.key]);
    });
}

// ===== 9. TEST DE RÉACTION =====
function loadReactionTest(container) {
    let state = 'waiting'; // waiting, ready, go, result
    let startTime = 0;
    let timeout = null;
    
    container.innerHTML = `
        <div style="text-align:center;">
            <div id="reactionBox" style="
                width:400px;height:300px;border-radius:12px;display:flex;
                align-items:center;justify-content:center;font-size:24px;
                font-weight:bold;cursor:pointer;background:#ef4444;color:white;
                transition:background 0.3s;
            ">
                Cliquez pour commencer
            </div>
            <p class="game-instructions" id="reactionResult"></p>
        </div>
    `;
    
    const box = document.getElementById('reactionBox');
    const result = document.getElementById('reactionResult');
    
    box.addEventListener('click', () => {
        if (state === 'waiting' || state === 'result') {
            state = 'ready';
            box.style.background = '#ef4444';
            box.textContent = 'Attendez le vert...';
            result.textContent = '';
            
            const delay = Math.random() * 3000 + 2000;
            timeout = setTimeout(() => {
                state = 'go';
                box.style.background = '#22c55e';
                box.textContent = 'CLIQUEZ !';
                startTime = Date.now();
            }, delay);
        } else if (state === 'ready') {
            clearTimeout(timeout);
            state = 'waiting';
            box.style.background = '#3b82f6';
            box.textContent = 'Trop tôt ! Cliquez pour recommencer';
            result.textContent = '';
        } else if (state === 'go') {
            const reactionTime = Date.now() - startTime;
            state = 'result';
            box.style.background = '#3b82f6';
            box.textContent = `${reactionTime}ms`;
            result.textContent = reactionTime < 200 ? 'Excellent ! ⚡' :
                                  reactionTime < 300 ? 'Très bien ! 👏' :
                                  reactionTime < 400 ? 'Bien 🙂' : 'Peut mieux faire 💪';
            score = Math.max(score, 1000 - reactionTime);
            updateScoreDisplay();
        }
    });
}

// ===== 10. CLICK SPEED TEST =====
function loadClickSpeed(container) {
    let clicks = 0;
    let timeLeft = 10;
    let gameRunning = false;
    let interval = null;
    
    container.innerHTML = `
        <div style="text-align:center;">
            <div id="clickArea" style="
                width:350px;height:250px;border-radius:12px;display:flex;
                flex-direction:column;align-items:center;justify-content:center;
                font-size:28px;font-weight:bold;cursor:pointer;
                background:#f3f4f6;border:3px dashed #cbd5e1;
                transition:all 0.1s;user-select:none;
            ">
                <div id="clickCounter">0</div>
                <div id="clickTimer" style="font-size:48px;margin:10px 0;">10</div>
                <div>Cliquez pour commencer</div>
            </div>
            <p class="game-instructions" id="clickResult"></p>
        </div>
    `;
    
    const area = document.getElementById('clickArea');
    const counter = document.getElementById('clickCounter');
    const timer = document.getElementById('clickTimer');
    const result = document.getElementById('clickResult');
    
    area.addEventListener('click', () => {
        if (!gameRunning) {
            // Démarrer
            gameRunning = true;
            clicks = 0;
            timeLeft = 10;
            counter.textContent = clicks;
            timer.textContent = timeLeft;
            area.style.borderColor = '#2563eb';
            result.textContent = '';
            
            interval = setInterval(() => {
                timeLeft--;
                timer.textContent = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    gameRunning = false;
                    area.style.borderColor = '#22c55e';
                    const cps = (clicks / 10).toFixed(1);
                    result.textContent = `Résultat: ${clicks} clics (${cps} CPS)`;
                    score = clicks * 10;
                    updateScoreDisplay();
                    
                    setTimeout(() => {
                        area.style.borderColor = '#cbd5e1';
                        area.lastElementChild.textContent = 'Cliquez pour recommencer';
                    }, 2000);
                }
            }, 1000);
        } else {
            clicks++;
            counter.textContent = clicks;
            area.style.transform = 'scale(0.95)';
            setTimeout(() => area.style.transform = 'scale(1)', 50);
        }
    });
}

// ===== 11. QUIZ =====
function loadQuiz(container) {
    const questions = [
        {
            question: "Quelle est la capitale de la France ?",
            options: ["Londres", "Berlin", "Paris", "Madrid"],
            correct: 2
        },
        {
            question: "Combien de continents y a-t-il sur Terre ?",
            options: ["5", "6", "7", "8"],
            correct: 2
        },
        {
            question: "Qui a peint la Joconde ?",
            options: ["Van Gogh", "Picasso", "Léonard de Vinci", "Michel-Ange"],
            correct: 2
        },
        {
            question: "Quel est le plus grand océan ?",
            options: ["Atlantique", "Indien", "Arctique", "Pacifique"],
            correct: 3
        },
        {
            question: "En quelle année l'homme a-t-il marché sur la Lune ?",
            options: ["1965", "1969", "1972", "1975"],
            correct: 1
        }
    ];
    
    let currentQuestion = 0;
    let correctAnswers = 0;
    
    container.innerHTML = `
        <div style="text-align:left;max-width:600px;margin:0 auto;">
            <div id="quizQuestion" style="font-size:1.3rem;font-weight:600;margin-bottom:1.5rem;"></div>
            <div class="quiz-options" id="quizOptions"></div>
            <div id="quizProgress" style="margin-top:1.5rem;text-align:center;color:#6c757d;"></div>
        </div>
    `;
    
    const questionEl = document.getElementById('quizQuestion');
    const optionsEl = document.getElementById('quizOptions');
    const progressEl = document.getElementById('quizProgress');
    
    function showQuestion() {
        const q = questions[currentQuestion];
        questionEl.textContent = `Question ${currentQuestion + 1}/${questions.length}: ${q.question}`;
        
        optionsEl.innerHTML = '';
        q.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = option;
            btn.addEventListener('click', () => selectAnswer(index, btn));
            optionsEl.appendChild(btn);
        });
        
        progressEl.textContent = `${currentQuestion + 1} / ${questions.length}`;
    }
    
    function selectAnswer(index, btn) {
        const buttons = optionsEl.querySelectorAll('.quiz-option');
        buttons.forEach(b => b.disabled = true);
        
        if (index === questions[currentQuestion].correct) {
            btn.classList.add('correct');
            correctAnswers++;
            score += 100;
        } else {
            btn.classList.add('incorrect');
            buttons[questions[currentQuestion].correct].classList.add('correct');
        }
        
        updateScoreDisplay();
        
        setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < questions.length) {
                showQuestion();
            } else {
                showResults();
            }
        }, 1500);
    }
    
    function showResults() {
        const percentage = Math.round((correctAnswers / questions.length) * 100);
        questionEl.textContent = `Quiz terminé !`;
        optionsEl.innerHTML = `
            <div style="text-align:center;padding:2rem;">
                <div style="font-size:3rem;font-weight:bold;color:#2563eb;margin-bottom:1rem;">
                    ${correctAnswers}/${questions.length}
                </div>
                <div style="color:#6c757d;margin-bottom:1rem;">${percentage}% de bonnes réponses</div>
                <div style="font-size:1.1rem;">
                    ${percentage >= 80 ? 'Excellent ! 🌟' : percentage >= 60 ? 'Bien joué ! 👍' : 'Continuez à apprendre ! 📚'}
                </div>
            </div>
        `;
        progressEl.textContent = '';
    }
    
    showQuestion();
}

// ===== 12. NOMBRE MYSTÈRE =====
function loadNumberGuess(container) {
    let secretNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;
    let history = [];
    
    container.innerHTML = `
        <div style="text-align:center;max-width:400px;margin:0 auto;">
            <p style="font-size:1.1rem;margin-bottom:1.5rem;color:#6c757d;">
                Devinez le nombre entre 1 et 100
            </p>
            <input type="number" id="guessInput" min="1" max="100"
                   style="width:100%;padding:1rem;font-size:1.2rem;border:2px solid #dee2e6;
                          border-radius:8px;text-align:center;margin-bottom:1rem;"
                   placeholder="Entrez un nombre...">
            <button onclick="makeGuess()" class="btn-primary" style="width:100%;margin-bottom:1.5rem;">
                Deviner
            </button>
            <div id="guessHistory" style="max-height:200px;overflow-y:auto;text-align:left;"></div>
            <p id="guessHint" style="font-size:1.2rem;font-weight:600;margin-top:1rem;"></p>
        </div>
    `;
    
    window.makeGuess = () => {
        const input = document.getElementById('guessInput');
        const guess = parseInt(input.value);
        const hint = document.getElementById('guessHint');
        const historyEl = document.getElementById('guessHistory');
        
        if (isNaN(guess) || guess < 1 || guess > 100) {
            hint.textContent = '⚠️ Entrez un nombre entre 1 et 100';
            hint.style.color = '#f59e0b';
            return;
        }
        
        attempts++;
        history.push(guess);
        
        if (guess === secretNumber) {
            hint.textContent = `🎉 Bravo ! Vous avez trouvé en ${attempts} essais !`;
            hint.style.color = '#22c55e';
            score = Math.max(0, 1000 - attempts * 50);
            updateScoreDisplay();
            input.disabled = true;
        } else if (guess < secretNumber) {
            hint.textContent = '⬆️ Plus grand !';
            hint.style.color = '#3b82f6';
        } else {
            hint.textContent = '⬇️ Plus petit !';
            hint.style.color = '#3b82f6';
        }
        
        historyEl.innerHTML = `<strong>Historique:</strong> ${history.join(' → ')}`;
        input.value = '';
        input.focus();
    };
    
    document.getElementById('guessInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') makeGuess();
    });
    
    document.getElementById('guessInput').focus();
}
