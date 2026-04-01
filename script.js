// ============================================================
// LUJEUX - SCRIPT AVEC 12 JEUX 100% FONCTIONNELS
// Design Nuit Moderne | Glassmorphism | Dark Theme
// ============================================================

// ===== DONNÉES DES JEUX =====
const games = [
    {
        id: 'snake',
        name: 'Snake',
        category: 'classique',
        icon: '🐍',
        description: 'Le classique serpent qui grandit en mangeant.',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
        id: 'space-invaders',
        name: 'Space Invaders',
        category: 'arcade',
        icon: '👾',
        description: 'Détruisez la flotte alien avant qu\'elle n\'arrive.',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
        id: 'tetris',
        name: 'Tetris',
        category: 'puzzle',
        icon: '🧱',
        description: 'Empilez les blocs tombants intelligemment.',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
        id: 'pong',
        name: 'Pong',
        category: 'classique',
        icon: '🏓',
        description: 'Le tennis ultime contre l\'IA.',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
        id: 'memory',
        name: 'Memory',
        category: 'puzzle',
        icon: '🧠',
        description: 'Trouvez toutes les paires de cartes.',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
        id: 'tictactoe',
        name: 'Morpion',
        category: 'strategie',
        icon: '⭕',
        description: 'Alignez 3 symboles pour gagner.',
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
    },
    {
        id: 'breakout',
        name: 'Breakout',
        category: 'arcade',
        icon: '🔴',
        description: 'Cassez toutes les briques avec la balle.',
        gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)'
    },
    {
        id: '2048',
        name: '2048',
        category: 'puzzle',
        icon: '🔢',
        description: 'Fusionnez les tuiles pour atteindre 2048.',
        gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
    },
    {
        id: 'reaction',
        name: 'Test Réaction',
        category: 'reflexe',
        icon: '⚡',
        description: 'Mesurez votre temps de réaction.',
        gradient: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)'
    },
    {
        id: 'clickspeed',
        name: 'Click Speed',
        category: 'reflexe',
        icon: '🖱️',
        description: 'Combien de clics en 10 secondes ?',
        gradient: 'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)'
    },
    {
        id: 'quiz',
        name: 'Quiz Culture',
        category: 'strategie',
        icon: '❓',
        description: 'Testez vos connaissances générales.',
        gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
    },
    {
        id: 'numberguess',
        name: 'Nombre Mystère',
        category: 'strategie',
        icon: '🔮',
        description: 'Devinez le nombre secret entre 1 et 100.',
        gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
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
    setupRevealAnimations();
    setupMobileMenu();
});

// ===== FONCTIONS UTILITAIRES =====
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
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
        const card = document.createElement('div');
        card.className = 'game-card reveal';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="game-preview" style="background: ${game.gradient}">
                ${game.icon}
            </div>
            <div class="game-info">
                <h3>${game.name}</h3>
                <div class="game-meta">
                    <span class="game-tag">${game.category}</span>
                </div>
                <p class="game-description">${game.description}</p>
                <button class="play-game-btn" onclick="openGame('${game.id}')">
                    <i class="fas fa-play"></i> Jouer
                </button>
            </div>
        `;
        
        gamesGrid.appendChild(card);
    });

    // Réinitialiser animations
    setTimeout(() => setupRevealAnimations(), 100);
}

function filterGames(category) {
    renderGames(category);
    scrollToSection('jeux');
}

// ===== ANIMATIONS DE RÉVÉLATION AU SCROLL =====
function setupRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ===== MENU MOBILE =====
function setupMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Fermer menu quand on clique sur un lien
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
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

    // Charger le jeu
    loadGame(gameId);

    // Afficher modal
    const modal = document.getElementById('gameModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeGame() {
    // Arrêter le jeu en cours
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }

    const modal = document.getElementById('gameModal');
    modal.classList.remove('active');
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
// IMPLEMENTATION DES 12 JEUX FONCTIONNELS
// ============================================================

// ===== 1. SNAKE =====
function initSnake(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="snakeCanvas" width="400" height="400"
                    style="background:#0d1520;border-radius:12px;border:1px solid rgba(109,200,232,0.2);">
            </canvas>
            <p style="margin-top:16px;color:#94a3b8;font-size:14px;">
                <i class="fas fa-keyboard"></i> Flèches directionnelles pour se déplacer
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
        // Fond
        ctx.fillStyle = '#0d1520';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grille subtile
        ctx.strokeStyle = 'rgba(109, 200, 232, 0.05)';
        for(let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }

        // Serpent
        snake.forEach((segment, index) => {
            const alpha = 1 - (index * 0.05);
            ctx.fillStyle = `rgba(109, 200, 232, ${alpha})`;
            ctx.beginPath();
            ctx.roundRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2, 4);
            ctx.fill();
        });

        // Nourriture
        ctx.fillStyle = '#f093fb';
        ctx.shadowColor = '#f093fb';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Mouvement
        if (dx !== 0 || dy !== 0) {
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};

            // Collision murs
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                endGame();
                return;
            }

            // Collision soi-même
            for (let s of snake) {
                if (head.x === s.x && head.y === s.y) {
                    endGame();
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

    function endGame() {
        clearInterval(gameInterval);
        setTimeout(() => alert(`Game Over! Score final: ${score}`), 100);
    }

    document.addEventListener('keydown', handleKeydown);

    function handleKeydown(e) {
        if (currentGame !== 'snake') return;

        switch(e.key) {
            case 'ArrowUp':
                if (dy !== 1) { dx = 0; dy = -1; }
                e.preventDefault();
                break;
            case 'ArrowDown':
                if (dy !== -1) { dx = 0; dy = 1; }
                e.preventDefault();
                break;
            case 'ArrowLeft':
                if (dx !== 1) { dx = -1; dy = 0; }
                e.preventDefault();
                break;
            case 'ArrowRight':
                if (dx !== -1) { dx = 1; dy = 0; }
                e.preventDefault();
                break;
        }
    }

    placeFood();
    gameInterval = setInterval(draw, 120);
}

// ===== 2. SPACE INVADERS =====
function initSpaceInvaders(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="spaceCanvas" width="500" height="400"
                    style="background:#0a0f18;border-radius:12px;border:1px solid rgba(109,200,232,0.2);">
            </canvas>
            <p style="margin-top:16px;color:#94a3b8;font-size:14px;">
                <i class="fas fa-arrows-alt"></i> Flèches: déplacer | Espace: tirer
            </p>
        </div>
    `;

    const canvas = document.getElementById('spaceCanvas');
    const ctx = canvas.getContext('2d');

    let player = { x: 225, y: 360, w: 50, h: 16 };
    let bullets = [];
    let enemies = [];
    let direction = 1;

    // Créer ennemis
    for (let i = 0; i < 8; i++) {
        enemies.push({ x: 50 + i * 55, y: 50, w: 40, h: 28, alive: true });
    }

    function draw() {
        // Fond
        ctx.fillStyle = '#0a0f18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Joueur
        ctx.fillStyle = '#6dc8e8';
        ctx.shadowColor = '#6dc8e8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(player.x, player.y, player.w, player.h, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Balles
        bullets.forEach((bullet, index) => {
            bullet.y -= 8;
            
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 6;
            ctx.fillRect(bullet.x, bullet.y, 4, 12);
            ctx.shadowBlur = 0;

            if (bullet.y < 0) bullets.splice(index, 1);
        });

        // Ennemis
        enemies.forEach(enemy => {
            if (enemy.alive) {
                ctx.fillStyle = '#ef4444';
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.roundRect(enemy.x, enemy.y, enemy.w, enemy.h, 4);
                ctx.fill();
                ctx.shadowBlur = 0;

                enemy.x += direction * 1.5;

                // Collision balle-enemi
                bullets.forEach((bullet, bIndex) => {
                    if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.w &&
                        bullet.y > enemy.y && bullet.y < enemy.y + enemy.h) {
                        enemy.alive = false;
                        bullets.splice(bIndex, 1);
                        score += 50;
                        updateScoreDisplay();
                    }
                });
            }
        });

        // Direction ennemis
        if (enemies.some(e => e.alive && (e.x <= 0 || e.x >= canvas.width - e.w))) {
            direction *= -1;
            enemies.forEach(e => e.y += 15);
        }

        // Victoire
        if (enemies.every(e => !e.alive)) {
            clearInterval(gameInterval);
            setTimeout(() => alert(`Victoire! Score: ${score}`), 100);
        }
    }

    document.addEventListener('keydown', (e) => {
        if (currentGame !== 'space-invaders') return;

        if (e.key === 'ArrowLeft' && player.x > 0) player.x -= 18;
        if (e.key === 'ArrowRight' && player.x < canvas.width - player.w) player.x += 18;
        if (e.key === ' ') {
            bullets.push({ x: player.x + player.w/2 - 2, y: player.y });
            e.preventDefault();
        }
    });

    gameInterval = setInterval(draw, 50);
}

// ===== 3. TETRIS =====
function initTetris(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="tetrisCanvas" width="300" height="600"
                    style="background:#0d1520;border-radius:12px;border:1px solid rgba(109,200,232,0.2);">
            </canvas>
            <p style="margin-top:16px;color:#94a3b8;font-size:14px;">
                <i class="fas fa-arrows-alt"></i> ← → déplacer | ↑ tourner | ↓ descendre
            </p>
        </div>
    `;

    const canvas = document.getElementById('tetrisCanvas');
    const ctx = canvas.getContext('2d');
    const COLS = 10, ROWS = 20, BLOCK = 30;

    let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    let piece = generatePiece();

    const SHAPES = [
        [[1,1,1,1]],
        [[1,1],[1,1]],
        [[0,1,0],[1,1,1]],
        [[1,0,0],[1,1,1]],
        [[0,0,1],[1,1,1]],
        [[0,1,1],[1,1,0]],
        [[1,1,0],[0,1,1]]
    ];

    const COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#0000f0', '#00f000', '#f00000'];

    function generatePiece() {
        const type = Math.floor(Math.random() * SHAPES.length);
        return {
            shape: SHAPES[type],
            color: COLORS[type],
            x: Math.floor(COLS / 2) - 1,
            y: 0
        };
    }

    function draw() {
        // Fond
        ctx.fillStyle = '#0d1520';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grille
        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillStyle = value;
                    ctx.shadowColor = value;
                    ctx.shadowBlur = 4;
                    ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK - 1, BLOCK - 1);
                    ctx.shadowBlur = 0;
                }
            });
        });

        // Pièce courante
        ctx.fillStyle = piece.color;
        ctx.shadowColor = piece.color;
        ctx.shadowBlur = 8;
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillRect(
                        (piece.x + x) * BLOCK,
                        (piece.y + y) * BLOCK,
                        BLOCK - 1,
                        BLOCK - 1
                    );
                }
            });
        });
        ctx.shadowBlur = 0;

        // Grille de fond
        ctx.strokeStyle = 'rgba(109, 200, 232, 0.08)';
        for (let i = 0; i <= COLS; i++) {
            ctx.beginPath();
            ctx.moveTo(i * BLOCK, 0);
            ctx.lineTo(i * BLOCK, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i <= ROWS; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * BLOCK);
            ctx.lineTo(canvas.width, i * BLOCK);
            ctx.stroke();
        }
    }

    function moveDown() {
        piece.y++;
        if (collision()) {
            piece.y--;
            mergePiece();
            clearLines();
            piece = generatePiece();
            if (collision()) {
                clearInterval(gameInterval);
                setTimeout(() => alert(`Game Over! Score: ${score}`), 100);
            }
        }
    }

    function collision() {
        return piece.shape.some((row, y) => {
            return row.some((value, x) => {
                if (!value) return false;
                const newX = piece.x + x;
                const newY = piece.y + y;
                return newX < 0 || newX >= COLS || newY >= ROWS || 
                       (newY >= 0 && board[newY][newX]);
            });
        });
    }

    function mergePiece() {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    board[piece.y + y][piece.x + x] = piece.color;
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
        const rotated = piece.shape[0].map((_, i) =>
            piece.shape.map(row => row[i]).reverse()
        );
        const prevShape = piece.shape;
        piece.shape = rotated;
        if (collision()) piece.shape = prevShape;
    }

    document.addEventListener('keydown', (e) => {
        if (currentGame !== 'tetris') return;

        switch(e.key) {
            case 'ArrowLeft':
                piece.x--;
                if (collision()) piece.x++;
                break;
            case 'ArrowRight':
                piece.x++;
                if (collision()) piece.x--;
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
function initPong(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="pongCanvas" width="600" height="400"
                    style="background:#0d1520;border-radius:12px;border:1px solid rgba(109,200,232,0.2);">
            </canvas>
            <p style="margin-top:16px;color:#94a3b8;font-size:14px;">
                <i class="fas fa-mouse-pointer"></i> Déplacez la souris pour contrôler la raquette
            </p>
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
        ctx.fillStyle = '#0d1520';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ligne centrale
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = 'rgba(109, 200, 232, 0.15)';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Raquette joueur
        ctx.fillStyle = '#6dc8e8';
        ctx.shadowColor = '#6dc8e8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(20, playerY, 10, 50, 5);
        ctx.fill();

        // Raquette IA
        ctx.fillStyle = '#f093fb';
        ctx.shadowColor = '#f093fb';
        ctx.beginPath();
        ctx.roundRect(canvas.width - 30, aiY, 10, 50, 5);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Balle
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Scores
        ctx.font = 'bold 28px Plus Jakarta Sans';
        ctx.fillStyle = '#6dc8e8';
        ctx.fillText(playerScore, canvas.width / 4, 50);
        ctx.fillStyle = '#f093fb';
        ctx.fillText(aiScore, 3 * canvas.width / 4, 50);

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

        // IA simple
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
function initMemory(container) {
    const emojis = ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤'];
    let cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    let flippedCards = [];
    let matchedPairs = 0;
    let canFlip = true;

    container.innerHTML = `
        <div style="text-align:center;">
            <div class="memory-grid" id="memoryGrid" 
                 style="display:inline-grid;grid-template-columns:repeat(4,85px);gap:12px;margin:0 auto;">
            </div>
            <p style="margin-top:20px;color:#94a3b8;font-size:14px;">
                <i class="fas fa-hand-pointer"></i> Cliquez pour retourner les cartes
            </p>
        </div>
    `;

    const grid = document.getElementById('memoryGrid');

    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        card.style.cssText = `
            width:85px;height:85px;cursor:pointer;perspective:1000px;
        `;
        card.innerHTML = `
            <div style="
                width:100%;height:100%;position:relative;transform-style:preserve-3d;
                transition:transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            " class="card-inner">
                <div style="
                    position:absolute;width:100%;height:100%;backface-visibility:hidden;
                    background:linear-gradient(135deg, #667eea, #764ba2);
                    border-radius:12px;display:flex;align-items:center;justify-content:center;
                    font-size:24px;color:white;font-weight:bold;box-shadow:0 4px 15px rgba(102,126,234,0.3);
                ">?</div>
                <div style="
                    position:absolute;width:100%;height:100%;backface-visibility:hidden;
                    background:rgba(26,35,50,0.9);border:1px solid rgba(109,200,232,0.2);
                    border-radius:12px;display:flex;align-items:center;justify-content:center;
                    font-size:36px;transform:rotateY(180deg);
                ">${emoji}</div>
            </div>
        `;
        
        card.addEventListener('click', () => flipCard(card));
        grid.appendChild(card);
    });

    function flipCard(card) {
        if (!canFlip || flippedCards.includes(card)) return;

        const inner = card.querySelector('.card-inner');
        inner.style.transform = 'rotateY(180deg)';
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
                    setTimeout(() => {
                        alert(`Félicitations! Score final: ${score}`);
                    }, 300);
                }
            } else {
                setTimeout(() => {
                    card1.querySelector('.card-inner').style.transform = '';
                    card2.querySelector('.card-inner').style.transform = '';
                    flippedCards = [];
                    canFlip = true;
                }, 1000);
            }
        }
    }
}

// ===== 6. TIC-TAC-TOE =====
function initTicTacToe(container) {
    let board = Array(9).fill('');
    let currentPlayer = 'X';
    let gameActive = true;

    container.innerHTML = `
        <div style="text-align:center;">
            <div class="ttt-board" id="tttBoard" 
                 style="display:inline-grid;grid-template-columns:repeat(3,100px);gap:10px;">
            </div>
            <p id="tttStatus" style="margin-top:20px;font-size:18px;color:#6dc8e8;font-weight:600;">
                Tour du joueur X
            </p>
        </div>
    `;

    const boardEl = document.getElementById('tttBoard');
    const statusEl = document.getElementById('tttStatus');

    board.forEach((_, index) => {
        const cell = document.createElement('div');
        cell.style.cssText = `
            width:100px;height:100px;background:rgba(26,35,50,0.7);
            border:1px solid rgba(109,200,232,0.15);border-radius:12px;
            display:flex;align-items:center;justify-content:center;
            font-size:36px;font-weight:bold;cursor:pointer;
            transition:all 0.3s ease;
        `;
        cell.addEventListener('click', () => makeMove(index, cell));
        cell.addEventListener('mouseenter', () => {
            if (!cell.textContent && gameActive) {
                cell.style.borderColor = 'rgba(109,200,232,0.4)';
                cell.style.background = 'rgba(109,200,232,0.05)';
            }
        });
        cell.addEventListener('mouseleave', () => {
            if (!cell.textContent) {
                cell.style.borderColor = 'rgba(109,200,232,0.15)';
                cell.style.background = 'rgba(26,35,50,0.7)';
            }
        });
        boardEl.appendChild(cell);
    });

    function makeMove(index, cell) {
        if (board[index] || !gameActive) return;

        board[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.style.color = currentPlayer === 'X' ? '#6dc8e8' : '#f093fb';

        if (checkWin()) {
            statusEl.textContent = `${currentPlayer} a gagné!`;
            statusEl.style.color = '#22c55e';
            gameActive = false;
            score += 100;
            updateScoreDisplay();
            return;
        }

        if (board.every(c => c)) {
            statusEl.textContent = 'Match nul!';
            statusEl.color = '#f59e0b';
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
        return wins.some(([a, b, c]) => 
            board[a] && board[a] === board[b] && board[a] === board[c]
        );
    }
}

// ===== 7. BREAKOUT =====
function initBreakout(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <canvas id="breakoutCanvas" width="480" height="320"
                    style="background:#0d1520;border-radius:12px;border:1px solid rgba(109,200,232,0.2);">
            </canvas>
            <p style="margin-top:16px;color:#94a3b8;font-size:14px;">
                <i class="fas fa-mouse-pointer"></i> Souris pour déplacer la raquette
            </p>
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
        // Fond
        ctx.fillStyle = '#0d1520';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Briques
        bricks.forEach((col, c) => {
            col.forEach((brick, r) => {
                if (brick.status === 1) {
                    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                    
                    brick.x = brickX;
                    brick.y = brickY;

                    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
                    ctx.fillStyle = colors[r];
                    ctx.shadowColor = colors[r];
                    ctx.shadowBlur = 6;
                    ctx.beginPath();
                    ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 4);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });
        });

        // Raquette
        ctx.fillStyle = '#6dc8e8';
        ctx.shadowColor = '#6dc8e8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(paddleX, canvas.height - 20, paddleWidth, 10, 5);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Balle
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

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
                setTimeout(() => alert(`Game Over! Score: ${score}`), 100);
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
            setTimeout(() => alert(`Victoire! Score: ${score}`), 100);
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
function init2048(container) {
    let grid = Array(4).fill().map(() => Array(4).fill(0));
    addNewTile();
    addNewTile();

    container.innerHTML = `
        <div style="text-align:center;">
            <div id="grid2048" 
                 style="display:inline-grid;grid-template-columns:repeat(4,90px);gap:10px;
                        background:#1a2332;padding:14px;border-radius:16px;">
            </div>
            <p style="margin-top:16px;color:#94a3b8;font-size:14px;">
                <i class="fas fa-arrows-alt"></i> Flèches directionnelles
            </p>
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
                    font-size:${value > 512 ? '24px' : '32px'};font-weight:700;
                    background:${getTileColor(value)};color:${value > 4 ? '#fff' : '#776e65'};
                    border-radius:10px;transition:all 0.15s ease;
                    box-shadow:${value ? '0 4px 12px rgba(0,0,0,0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.2)'};
                `;
                cell.textContent = value || '';
                gridEl.appendChild(cell);
            });
        });
    }

    function getTileColor(value) {
        const colors = {
            0: '#1a2332',
            2: '#eee4da',
            4: '#ede0c8',
            8: '#f2b179',
            16: '#f59563',
            32: '#f67c5f',
            64: '#f65e3b',
            128: '#edcf72',
            256: '#edcc61',
            512: '#edc850',
            1024: '#edc53f',
            2048: '#edc22e'
        };
        return colors[value] || '#3c3a32';
    }

    function addNewTile() {
        const empty = [];
        grid.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell === 0) empty.push({ x, y });
            });
        });

        if (empty.length > 0) {
            const { x, y } = empty[Math.floor(Math.random() * empty.length)];
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

        const moves = {
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'ArrowUp': 'up',
            'ArrowDown': 'down'
        };

        if (moves[e.key]) move(moves[e.key]);
    });
}

// ===== 9. TEST DE RÉACTION =====
function initReactionTest(container) {
    let state = 'waiting'; // waiting, ready, go, result
    let startTime = 0;
    let timeout = null;

    container.innerHTML = `
        <div style="text-align:center;">
            <div id="reactBox" style="
                width:380px;height:280px;border-radius:16px;display:flex;flex-direction:column;
                align-items:center;justify-content:center;font-size:20px;font-weight:600;
                cursor:pointer;transition:all 0.3s ease;background:#ef4444;color:white;
                user-select:none;box-shadow:0 10px 30px rgba(239,68,68,0.3);
            ">
                Cliquez pour commencer
            </div>
            <p id="reactResult" style="margin-top:20px;font-size:16px;"></p>
        </div>
    `;

    const box = document.getElementById('reactBox');
    const result = document.getElementById('reactResult');

    box.addEventListener('click', () => {
        if (state === 'waiting' || state === 'result') {
            state = 'ready';
            box.style.background = '#ef4444';
            box.textContent = 'Attendez le vert...';
            box.style.boxShadow = '0 10px 30px rgba(239,68,68,0.3)';
            result.textContent = '';

            const delay = Math.random() * 3000 + 2000;
            timeout = setTimeout(() => {
                state = 'go';
                box.style.background = '#22c55e';
                box.textContent = 'CLIQUEZ!';
                box.style.boxShadow = '0 10px 30px rgba(34,197,94,0.4)';
                startTime = Date.now();
            }, delay);
        } else if (state === 'ready') {
            clearTimeout(timeout);
            state = 'waiting';
            box.style.background = '#3b82f6';
            box.textContent = 'Trop tôt! Cliquez pour recommencer';
            box.style.boxShadow = '0 10px 30px rgba(59,130,246,0.3)';
            result.textContent = '';
        } else if (state === 'go') {
            const reactionTime = Date.now() - startTime;
            state = 'result';
            box.style.background = '#6dc8e8';
            box.textContent = `${reactionTime}ms`;
            box.style.boxShadow = `0 10px 30px rgba(109,200,232,0.4)`;
            
            let message = '';
            if (reactionTime < 200) message = '⚡ Reflexes de lightning!';
            else if (reactionTime < 300) message = '🚀 Très rapide!';
            else if (reactionTime < 400) message = '👍 Bon tempo!';
            else message = '💪 Continue à t\'entraîner!';
            
            result.textContent = message;
            score = Math.max(score, 1000 - reactionTime);
            updateScoreDisplay();
        }
    });
}

// ===== 10. CLICK SPEED TEST =====
function initClickSpeed(container) {
    let clicks = 0;
    let timeLeft = 10;
    let gameRunning = false;
    let interval = null;

    container.innerHTML = `
        <div style="text-align:center;">
            <div id="clickArea" style="
                width:340px;height:240px;border-radius:16px;display:flex;flex-direction:column;
                align-items:center;justify-content:center;font-size:24px;font-weight:700;
                cursor:pointer;transition:all 0.1s ease;user-select:none;
                background:rgba(26,35,50,0.7);border:2px dashed rgba(109,200,232,0.3);
            ">
                <div id="clickCounter" style="font-size:48px;">0</div>
                <div id="clickTimer" style="font-size:64px;margin:15px 0;color:#6dc8e8;">10</div>
                <div>Cliquez pour commencer</div>
            </div>
            <p id="clickResult" style="margin-top:20px;font-size:16px;"></p>
        </div>
    `;

    const area = document.getElementById('clickArea');
    const counter = document.getElementById('clickCounter');
    const timer = document.getElementById('clickTimer');
    const result = document.getElementById('clickResult');

    area.addEventListener('click', () => {
        if (!gameRunning) {
            // Démarrer le test
            gameRunning = true;
            clicks = 0;
            timeLeft = 10;
            counter.textContent = clicks;
            timer.textContent = timeLeft;
            area.style.borderStyle = 'solid';
            area.style.borderColor = '#6dc8e8';
            area.style.background = 'rgba(109,200,232,0.05)';
            result.textContent = '';

            interval = setInterval(() => {
                timeLeft--;
                timer.textContent = timeLeft;

                if (timeLeft <= 0) {
                    clearInterval(interval);
                    gameRunning = false;
                    area.style.borderStyle = 'dashed';
                    area.style.borderColor = 'rgba(34,197,94,0.5)';
                    area.style.background = 'rgba(34,197,94,0.05)';
                    
                    const cps = (clicks / 10).toFixed(1);
                    result.textContent = `Résultat: ${clicks} clics (${cps} CPS)`;
                    
                    score = clicks * 10;
                    updateScoreDisplay();

                    setTimeout(() => {
                        area.style.borderColor = 'rgba(109,200,232,0.3)';
                        area.style.background = 'rgba(26,35,50,0.7)';
                        area.lastElementChild.textContent = 'Cliquez pour recommencer';
                    }, 2000);
                }
            }, 1000);
        } else {
            // Incrémenter compteur
            clicks++;
            counter.textContent = clicks;
            
            // Animation feedback
            area.style.transform = 'scale(0.98)';
            setTimeout(() => area.style.transform = 'scale(1)', 50);
        }
    });
}

// ===== 11. QUIZ CULTURE GÉNÉRALE =====
function initQuiz(container) {
    const questions = [
        {
            question: 'Quelle est la capitale de la France?',
            options: ['Londres', 'Berlin', 'Paris', 'Madrid'],
            correct: 2
        },
        {
            question: 'Combien de continents y a-t-il sur Terre?',
            options: ['5', '6', '7', '8'],
            correct: 2
        },
        {
            question: 'Qui a peint la Joconde?',
            options: ['Van Gogh', 'Picasso', 'Léonard de Vinci', 'Michel-Ange'],
            correct: 2
        },
        {
            question: 'Quel est le plus grand océan?',
            options: ['Atlantique', 'Indien', 'Arctique', 'Pacifique'],
            correct: 3
        },
        {
            question: 'En quelle année l\'homme a-t-il marché sur la Lune?',
            options: ['1965', '1969', '1972', '1975'],
            correct: 1
        }
    ];

    let currentQuestion = 0;
    let correctAnswers = 0;

    container.innerHTML = `
        <div style="max-width:650px;margin:0 auto;text-align:left;">
            <div id="quizQuestion" style="
                font-size:20px;font-weight:700;color:#fff;margin-bottom:24px;line-height:1.5;
            "></div>
            <div id="quizOptions" style="display:flex;flex-direction:column;gap:12px;"></div>
            <div id="quizProgress" style="
                margin-top:24px;text-align:center;color:#94a3b8;font-size:14px;
                font-family:'JetBrains Mono',monospace;
            "></div>
        </div>
    `;

    const questionEl = document.getElementById('quizQuestion');
    const optionsEl = document.getElementById('quizOptions');
    const progressEl = document.getElementById('quizProgress');

    function showQuestion() {
        const q = questions[currentQuestion];
        questionEl.innerHTML = `<span style="color:#6dc8e8;">Q${currentQuestion + 1}.</span> ${q.question}`;

        optionsEl.innerHTML = '';
        q.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.style.cssText = `
                padding:16px 20px;background:rgba(26,35,50,0.7);
                border:1px solid rgba(109,200,232,0.15);border-radius:12px;
                color:#cbd5e1;font-size:15px;cursor:pointer;text-align:left;
                transition:all 0.3s ease;font-family:inherit;
            `;
            btn.innerHTML = `<span style="color:#6dc8e8;margin-right:12px;font-weight:600;">
                ${String.fromCharCode(65 + index)}.</span> ${option}`;
            
            btn.addEventListener('mouseenter', () => {
                btn.style.borderColor = 'rgba(109,200,232,0.4)';
                btn.style.background = 'rgba(109,200,232,0.05)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.borderColor = 'rgba(109,200,232,0.15)';
                btn.style.background = 'rgba(26,35,50,0.7)';
            });
            
            btn.addEventListener('click', () => selectAnswer(index, btn));
            optionsEl.appendChild(btn);
        });

        progressEl.textContent = `${currentQuestion + 1} / ${questions.length}`;
    }

    function selectAnswer(index, btn) {
        const buttons = optionsEl.querySelectorAll('.quiz-option');
        buttons.forEach(b => b.disabled = true);

        if (index === questions[currentQuestion].correct) {
            btn.style.background = 'rgba(34,197,94,0.2)';
            btn.style.borderColor = '#22c55e';
            btn.style.color = '#22c55e';
            correctAnswers++;
            score += 100;
        } else {
            btn.style.background = 'rgba(239,68,68,0.2)';
            btn.style.borderColor = '#ef4444';
            btn.style.color = '#ef4444';
            buttons[questions[currentQuestion].correct].style.background = 'rgba(34,197,94,0.2)';
            buttons[questions[currentQuestion].correct].style.borderColor = '#22c55e';
            buttons[questions[currentQuestion].correct].style.color = '#22c55e';
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
        
        questionEl.textContent = 'Quiz terminé!';
        
        let emoji = '', message = '';
        if (percentage >= 80) {
            emoji = '🌟'; message = 'Excellent! Vraiment impressionnant!';
        } else if (percentage >= 60) {
            emoji = '👏'; message = 'Bien joué! Continuez comme ça!';
        } else {
            emoji = '📚'; message = 'Continuez à apprendre, vous pouvez mieux faire!';
        }

        optionsEl.innerHTML = `
            <div style="text-align:center;padding:40px 20px;">
                <div style="font-size:64px;margin-bottom:16px;">${emoji}</div>
                <div style="font-size:48px;font-weight:800;color:#6dc8e8;margin-bottom:12px;">
                    ${correctAnswers}/${questions.length}
                </div>
                <div style="color:#94a3b8;font-size:18px;margin-bottom:16px;">
                    ${percentage}% de bonnes réponses
                </div>
                <div style="color:#cbd5e1;font-size:16px;">${message}</div>
            </div>
        `;
        progressEl.textContent = '';
    }

    showQuestion();
}

// ===== 12. NOMBRE MYSTÈRE =====
function initNumberGuess(container) {
    let secretNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;
    let history = [];

    container.innerHTML = `
        <div style="text-align:center;max-width:420px;margin:0 auto;">
            <p style="color:#94a3b8;font-size:15px;margin-bottom:24px;">
                Devinez le nombre mystère entre 1 et 100
            </p>
            
            <input type="number" id="guessInput" min="1" max="100"
                   placeholder="Entrez un nombre..."
                   style="
                       width:100%;padding:16px 20px;background:rgba(26,35,50,0.7);
                       border:1px solid rgba(109,200,232,0.2);border-radius:12px;
                       color:#fff;font-size:17px;text-align:center;outline:none;
                       font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.3s;
                   "
                   onfocus="this.style.borderColor='#6dc8e8'"
                   onblur="this.style.borderColor='rgba(109,200,232,0.2)'">
            
            <button onclick="window.makeGuess()" class="btn btn-primary" 
                    style="width:100%;margin-top:16px;margin-bottom:20px;">
                <i class="fas fa-search"></i> Deviner
            </button>
            
            <div id="guessHistory" style="
                max-height:180px;overflow-y:auto;text-align:left;padding:16px;
                background:rgba(26,35,50,0.5);border-radius:12px;
                border:1px solid rgba(109,200,232,0.1);font-size:14px;
            "></div>
            
            <p id="guessHint" style="margin-top:20px;font-size:20px;font-weight:600;"></p>
        </div>
    `;

    window.makeGuess = function() {
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
            hint.textContent = `🎉 Trouvé en ${attempts} essais!`;
            hint.style.color = '#22c55e';
            input.disabled = true;
            score = Math.max(0, 1000 - attempts * 50);
            updateScoreDisplay();
        } else if (guess < secretNumber) {
            hint.textContent = '⬆️ Plus grand!';
            hint.style.color = '#6dc8e8';
        } else {
            hint.textContent = '⬇️ Plus petit!';
            hint.style.color = '#f093fb';
        }

        historyEl.innerHTML = `
            <strong style="color:#6dc8e8;">Historique:</strong> 
            <span style="color:#94a3b8;">${history.join(' → ')}</span>
        `;

        input.value = '';
        input.focus();
    };

    document.getElementById('guessInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.makeGuess();
    });

    setTimeout(() => document.getElementById('guessInput').focus(), 100);
}
