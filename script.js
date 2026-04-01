// ══════════════════════════════════════════════════════════════╗
// ║  LUJEUX ULTRA - MOTEUR DE JEU PROFESSIONNEL                    ║
// ║  Version: 4.0 Ultra Pro | Auteur: Expert Developer                ║
// ║  Caractéristiques:                                             ║
//  • 9 Jeux complets et fonctionnels                             ║
//  • Moteur Delta Time pour 60 FPS constants                   ║
//  • IA Minimax pour Puissance 4 et Morpion                      ║
//  • IA Pathfinding BFS pour Pac-Man                              ║
//  • Physique réaliste pour Air Hockey                           ║
//  • Design Cyberpunk Nuit                                     ║
//  • Code ultra propre et commenté                                 ║
// ╚═══════════════════════════════════════════════════════════════╝

// ============================================================
// PARTIE 1: SYSTÈME DE BASE DU MOTEUR DE JEU
// ============================================================

/**
 * GameEngine - Le cœur de l'application
 * 
 * Ce système gère:
 * - La boucle de rendu principale (requestAnimationFrame)
 * - Le calcul du Delta Time pour fluidité 60 FPS
 * - L'étatut global du jeu en cours
 * - Le score et le niveau actuel
 * 
 * Utilisation:
 *   GameEngine.startLoop(updateFunction, renderFunction) - Démarre la boucle
 *   GameEngine.stopLoop() - Arrêter la boucle proprement
 *   GameEngine.score - Accéder/modifier le score
 */
const GameEngine = {
    // État global du moteur
    currentGame: null,          // ID du jeu actuellement lancé
    gameLoop: null,            // Référence à requestAnimationFrame
    lastTime: 0,              // Timestamp de la frame précédente
    deltaTime: 0,           // Temps écoulé depuis la dernière frame (en secondes)
    score: 0,                 // Score actuel du joueur
    level: 1,                  // Niveau actuel (pour Tetris, etc.)
    isRunning: false,         // Si le jeu est en cours
    
    /**
     * Initialise ou réinitialise le moteur de jeu
     * Doit être appelé avant chaque nouveau jeu
     */
    reset() {
        this.currentGame = null;
        this.gameLoop = null;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.score = 0;
        this.level = 1;
        this.isRunning = false;
        
        // Mettre à jour l'affichage du score dans le modal
        if (document.getElementById('currentScoreValue')) {
            document.getElementById('currentScoreValue').textContent = `Score: ${this.score}`;
        }
    },
    
    /**
     * Calcule le Delta Time entre deux frames
     * 
     * @param {number} currentTime - Timestamp fourni par requestAnimationFrame
     * 
     * Le Delta Time permet d'avoir un mouvement constant
     * indépendamment de la puissance de l'ordinateur
     * 
     * Limite automatiquement à ~60 FPS maximum
     */
    calculateDelta(currentTime) {
        // Initialisation au premier appel
        if (!this.lastTime) {
            this.lastTime = currentTime;
        }
        
        // Calcul du temps écoulé en secondes
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        
        // Mise à jour le timestamp
        this.lastTime = currentTime;
        
        // Protection contre les sauts de temps énormes
        // (ex: quand l'onglet est minimisé puis remaximisée)
        if (this.deltaTime > 0.15) {
            this.deltaTime = 0.016; // ~60 FPS max
        }
        
        return this.deltaTime;
    },
    
    /**
     * Démarre la boucle de rendu principal
     * 
     * Cette fonction utilise requestAnimationFrame pour un rendu fluide
     * 
     * @param {Function} updateFn - Fonction de mise à jour (logique du jeu)
     * @param {Function} renderFn - Fonction de rendu (dessin)
     */
    startLoop(updateFn, renderFn) {
        this.isRunning = true;
        
        // Créer la boucle de jeu optimisée
        const gameLoop = (timestamp) => {
            // Si le jeu est arrêté, ne pas continuer
            if (!this.isRunning) return;
            
            // Calculer le delta time
            this.calculateDelta(timestamp);
            
            // Exécuter la logique du jeu
            updateFn(this.deltaTime);
            
            // Rendre le frame
            renderFn();
            
            // Demander la prochaine frame
            this.gameLoop = requestAnimationFrame(gameLoop);
        };
        
        // Démarrer toute boucle précédente s'il y en a une
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        
        // Démarrer le compteur
        this.lastTime = 0;
        
        // Lancer la nouvelle boucle
        this.gameLoop = requestAnimationFrame(gameLoop);
    },
    
    /**
     * Arrêter proprement le jeu en cours
     * Nettoie toutes les ressources
     */
    stopLoop() {
        this.isRunning = false;
        
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        this.lastTime = 0;
    },
    
    /**
     * Mettre à jour l'affichage du score dans le modal
     */
    updateScoreDisplay() {
        const scoreElement = document.getElementById('currentScoreValue');
        const levelElement = document.getElementById('currentLevelValue');
        
        if (scoreElement) {
            scoreElement.innerHTML = `<i class="fas fa-star"></i> Score: ${this.score}`;
        }
        
        if (levelElement && this.level > 1) {
            levelElement.parentElement.style.display = 'inline-flex';
            levelElement.innerHTML = `<i class="fas fa-layer-group"></i> Niveau: ${this.level}`;
        }
    }
};

// ============================================================
// PARTIE 2: DONNÉES DES JEUX
// ============================================================

/**
 * Liste complète des 9 jeux disponibles
 * 
 * Chaque jeu contient:
 * - Identifiant unique (id)
 * - Nom affiché
 * - Catégorie (arcade, plateau, reflexe)
 * - Icône emoji
 * - Description courte
 * - Gradient de couleur pour la carte
 */
const GAMES_DATA = [
    {
        id: 'snake',
        name: 'Snake Ultra',
        category: 'arcade',
        icon: '🐍',
        description: 'Serpent ultra-fluide avec Delta Time. Mangez les pommes pour grandir sans jamais vous arrêter.',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
        id: 'subway',
        name: 'Subway Runner',
        category: 'arcade',
        icon: '🏃',
        description: 'Course infinie sur 3 voies. Esquivez les obstacles et sautez par-dessus pour survivre.',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    },
    {
        id: 'tetris',
        name: 'Tetris Pro',
        category: 'puzzle',
        icon: '🧱',
        description: 'Le classique absolu. Empilez les blocs tombants, complétez les lignes et augmentez la vitesse progressivement.',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
        id: 'pacman',
        name: 'Pac-Man',
        category: 'arcade',
        icon: '🟡',
        description: 'Le légendaire Pac-Man. Mangez les pac-gommes et échappez aux fantômes gérés par IA pathfinding.',
        gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
    },
    {
        id: 'puissance4',
        name: 'Puissance 4',
        category: 'plateau',
        icon: '🔴',
        description:Alignez 4 pions verticalement, horizontalement ou diagonalement. Affrontez une IA Minimax redoutable.',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
        id: 'morpion',
        name: 'Morpion Ultimate',
        category: 'plateau',
        icon: '⭕',
        description: 'Le jeu de morpion ultime. Essayez de battre l'IA Minimax imbattable si vous en êtes capable !',
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
    },
    {
        id: 'blackjack',
        name: 'Blackjack Casino',
        genre: 'cartes',
        icon: '🃏',
        description: 'Battez le croupier en tirant des cartes. Ne dépassez jamais 21. Le croupeur tire jusqu\'à 17.',
        gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
    },
    {
        'id': 'pong',
        'name': 'Pong Championship',
        'genre': 'reflexe',
        'icon': '🏓',
        'description': 'Le tennis de table ultime. Contrôlez votre raquette face à une IA réactive et challengeante.',
        'gradient': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
        'id': 'airhockey',
        'name': 'Air Hockey',
        'genre': 'reflexe',
        'icon': '🏒',
        'description: 'Hockey sur table avec physique réaliste. Frappez le palet avec votre souris et marquez dans le but adverse.',
        'gradient': 'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)'
    }
];

// ============================================================
// PARTIE 3: FONCTIONS UTILITAIRES GLOBALES
// ============================================================

/**
 * Affiche une section spécifique du DOM
 * Cache les sections pour éviter les recherches répétitives
 */
function showSection(sectionId) {
    // Masquer toutes les sections
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Afficher la section demandée
    const targetSection = document.getElementById(sectionId + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

/**
 * Affiche la grille de tous les jeux
 * Peut filtrer par catégorie si nécessaire
 */
function showAllGames() {
    showSection('jeux');
    renderAllGames();
}

/**
 * Filtre les jeux par catégorie et les affiche
 * @param {string} category - Catégorie à afficher ('all' pour tous)
 */
function filterGames(category) {
    showSection('jeux');
    
    const grid = document.getElementById('gamesGridContainer');
    grid.innerHTML = '';
    
    const filteredGames = category === 'all' 
        ? GAMES_DATA 
        : GAMES_DATA.filter(game => game.category === category || game.genre === category);
    
    filteredGames.forEach((game, index) => {
        createGameCard(game, index);
    });
}

/**
 * Jouer un jeu aléatoire
 */
function playRandomGame() {
    const randomIndex = Math.floor(Math.random() * GAMES_DATA.length);
    const randomGame = GAMES_DATA[randomIndex];
    openGame(randomGame.id);
}

/**
 * Mettre à jour l'affichage du score dans le modal
 * Appelé après chaque gain de points
 */
function updateScoreDisplay() {
    GameEngine.updateScoreDisplay();
}

/**
 * Retourne au menu principal
 * Ferme le jeu en cours si nécessaire
 */
function backToMainMenu() {
    closeGame();
    setTimeout(() => {
        showSection('accueil');
    }, 300);
}

/**
 * Recommencer le jeu actuel
 * Réinitialise complètement le jeu
 */
function restartCurrentGame() {
    if (GameEngine.currentGame) {
        const gameId = GameEngine.currentGame;
        closeGame();
        // Petite pause pour permettre au DOM de se mettre à jour
        setTimeout(() => {
            openGame(gameId);
        }, 200);
    }
}

// ============================================================
// PARTIE 4: GESTION DES CARTES DE JEUX
// ============================================================

/**
 * Crée une carte de jeu interactive
 * Chaque carte contient:
 * - Zone de prévisualisation avec dégradé animé
 * - Titre et description du jeu
 * - Badge de catégorie
 * - Bouton "Jouer" avec effet hover
 * 
 * @param {Object} game - Objet contenant les données du jeu
 * @param {number} index - Index pour l'animation d'apparition
 */
function createGameCard(game, index) {
    const grid = document.getElementById('gamesGridContainer');
    
    // Créer l'élément de carte
    const card = document.createElement('div');
    card.className = 'game-card reveal-element';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Contenu HTML de la carte
    card.innerHTML = `
        <div class="game-preview-area" style="background: ${game.gradient}">
            ${game.icon}
        </div>
        <div class="game-info">
            <h3 class="game-title">${game.name}</h3>
            <div class="game-meta-row">
                <span class="category-label">${game.category || game.genre}</span>
            </div>
            <p class="game-description">${game.description}</p>
            <button class="play-button" onclick="openGame('${game.id}')">
                <i class="fas fa-play"></i> Jouer Maintenant
            </button>
        </div>
    `;
    
    // Ajouter à la grille
    grid.appendChild(card);
}

/**
 * Génère et affiche toutes les cartes de jeux
 * Utilise les données de GAMES_DATA
 */
function renderAllGames(filter = 'all') {
    const grid = document.getElementById('gamesGridContainer');
    grid.innerHTML = '';
    
    let gamesToRender = GAMES_DATA;
    
    // Filtrer si nécessaire
    if (filter !== 'all') {
        gamesToRender = GAMES_DATA.filter(game => 
            game.category === filter || game.genre === filter
        );
    }
    
    // Générer chaque carte
    gamesToRender.forEach((game, index) => {
        createGameCard(game, index);
    });
}

// ============================================================
// PARTIE 5: GESTION DU MODAL DE JEU
// ============================================================

/**
 * Ouvre le modal et lance un jeu spécifique
 * 
 * @param {string} gameId - Identifiant unique du jeu à lancer
 */
function openGame(gameId) {
    // Mettre à jour l'état du moteur
    GameEngine.reset();
    GameEngine.currentGame = gameId;
    
    // Trouver les données du jeu
    const gameData = GAMES_DATA.find(g => g.id === gameId);
    
    if (!gameData) {
        console.error(`Jeu non trouvé: ${gameId}`);
        return;
    }
    
    // Mettre le titre du jeu dans le modal
    const titleElement = document.getElementById('masqueTitleDisplay');
    if (titleElement) {
        titleElement.textContent = gameData.name;
    }
    
    // Cacher le niveau par défaut (sera affiché si nécessaire)
    const levelDisplay = document.getElementById('levelDisplay');
    if (levelDisplay) {
        levelDisplay.style.display = 'none';
    }
    
    // Afficher le modal
    const modal = document.getElementById('gameModalOverlay');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Charger le jeu spécifique
    loadGameById(gameId);
}

/**
 * Ferme le modal et arrête le jeu proprement
 * Nettoye toutes les ressources
 */
function closeGame() {
    GameEngine.stopLoop();
    
    const modal = document.getElementById('gameModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    GameEngine.currentGame = null;
}

// ============================================================
// PARTIE 6: ANIMATIONS ET EFFETS VISUELS
// ============================================================

/**
 * Système d'animation au scroll (Reveal on Scroll)
 * Les éléments avec la classe .reveal-element apparaissent
 * lorsqu'ils entrent dans le viewport
 */
function setupScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);
    
    // Observer tous les éléments révélables
    const revealElements = document.querySelectorAll('.reveal-element');
    revealElements.forEach(el => observer.observe(el));
}

/**
 * Animation de pulsation néon pour les éléments importants
 * Appliqué aux logos, badges, boutons principaux
 */
function addNeonPulse(element) {
    element.style.animation = 'neon-pulse 2s ease-in-out infinite';
}

// ============================================================
// PARTIE 7: NAVIGATION MOBILE
// ============================================================

/**
 * Toggle (ouvrir/fermer) le menu mobile
 * Transforme la sidebar pour la faire apparaître/disparaître
 */
function toggleMobileMenu() {
    const sidebar = document.getElementById('mainSidebar');
    const btn = document.getElementById('mobileMenuBtn');
    
    sidebar.classList.toggle('open');
    
    // Changer l'icône du bouton
    const isOpen = sidebar.classList.contains('open');
    btn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
}

// ============================================================
// ============================================================
// PARTIE 8: LES 9 JEUX COMPLETS
// Chaque jeu est une fonction auto-contenue qui crée son propre canvas
// Tous utilisent le système Delta Time de GameEngine
// ============================================================

// ============================================================
// JEU 1: SNAKE ULTRA
// Serpent ultra-fluide avec gestion Delta Time
// Contrôles: Flèches directionnelles
// Objectif: Manger des pommes, éviter les collisions
// Difficulté: Progressive (le serpent s'accélère)
// ============================================================

/**
 * Initialise et lance le jeu Snake
 * 
 * Fonctionnalités:
 * - Grille de 20x20 cellules
 * - Serpent composé de segments
 * - Pommes qui apparaissent aléatoirement
 * - Score basé sur les pommes mangées
 * - Vitesse ajustable
 * - Mode pause
 * 
 * Contrôles:
 *   Flèche haut/bas/gauche/droite: Direction
 *   Espace: Pause/Reprendre pause
 */

function initSnake() {
    // ===== CONFIGURATION =====
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;
    const GRID_SIZE = 20; // Taille de chaque cellule
    const CELL_SIZE = CANVAS_WIDTH / GRID_SIZE; // Taille en pixels
    const GRID_COUNT = CANVAS_WIDTH / CELL_SIZE; // Nombre de colonnes/lignes
    
    // Vitesse initiale du serpent (cellules/seconde)
    const INITIAL_SPEED = 8;
    // Intervalle de mise à jour (secondes)
    const MOVE_INTERVAL = 0.12;
    
    // État du jeu
    let snake = []; // Tableau de segments du serpent [{x: 10, y: 10}]
    let direction = { x: 1, y: 0 }; // Direction actuelle
    let nextDirection = { x: 1, y: 0 }; // Prochaine direction (buffer)
    let food = {}; // Position de la nourriture
    let moveTimer = 0; // Timer pour le mouvement
    let isPaused = false; // État de pause
    let score = 0; // Score local
    
    // ===== CRÉATION DU CANVAS =====
    const container = document.getElementById('gameContainerArea');
    container.innerHTML = `
        <div style="text-align:center;width:100%;position:relative;">
            <canvas id="snakeCanvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" 
                    style="
                        background:#000000;
                        border-radius:16px;
                        box-shadow: 0 8px 32px rgba(0,245,255,0.2);
                        border: 2px solid rgba(0,245,255,0.3);
                        image-rendering: crisp-edges;
                    ">
            </canvas>
            <div style="
                margin-top:20px;
                padding: 16px 24px;
                background: rgba(10, 15, 25, 0.85);
                border: 1px solid rgba(0, 245,255, 0.15);
                border-radius: 12px;
                color: var(--text-muted);
                font-size: 14px;
                line-height: 1.5;
            ">
                <i class="fas fa-keyboard"></i> Flèches directionnelles<br>
                <span style="color:#00f5ff;font-weight:600;">Espace</span> pour pause
            </div>
        </div>
    `;
    
    // Récupérer le canvas
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    
    /**
     * Génère une position aléatoire pour la nourriture
     * S'assure que la position n'est pas sur le serpent
     */
    function generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_COUNT),
                y: 
                Math.floor(Math.random() * GRID_COUNT)
            };
        } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        return newFood;
    }
    
    /**
     * Met à jour la logique du jeu (appelé par GameEngine à chaque frame)
     * 
     * @param {number} dt - Delta time en secondes depuis la dernière frame
     */
    function update(dt) {
        // Ne pas mettre à jour si en pause
        if (isPaused) return;
        
        // Accumuler le temps de mouvement
        moveTimer += dt;
        
        // Vérifier si le temps de mouvement est atteint
        if (moveTimer >= MOVE_INTERVAL) {
            // Remplacer la direction actuelle par la prochaine
            direction = {...nextDirection};
            
            // Calculer la nouvelle position de la tête
            const head = {
                x: snake[0].x + direction.x,
                y: 0.5 + snake[0].y + direction.y
            };
            
            // Vérifier collision avec les murs
            if (head.x < 0 || head.x >= GRID_COUNT ||
                head.y < 0 || head.y >= GRID_COUNT) {
                gameOver();
                return;
            }
            
            // Vérifier collision avec soi-même
            for (let i = 0; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    gameOver();
                    return;
                }
            }
            
            // Ajouter la nouvelle tête
            snake.unshift(head);
            
            // Vérifier si le serpent a mangé la nourriture
            if (head.x === food.x && head.y === food.y) {
                // Augmenter le score
                score += 10;
                GameEngine.score += 10;
                GameEngine.updateScoreDisplay();
                
                // Générer une nouvelle nourriture
                food = generateFood();
                
                // Faire grandir le serpent (ne pas de queue)
            } else {
                // Supprimer la queue (la queue ne grandit pas)
                snake.pop();
            }
            
            // Réinitialiser le timer
            moveTimer = 0;
        }
    }
    
    /**
     * Dessine le cadre de jeu
     * Inclut:
     * - Fond noir profond
     *   - Grille subtile cyan transparente
     *   - Serpent avec dégradé de couleurs
     *   - Nourriture avec effet de lueur
     *   - Indicateur de pause si activé
     */
    function render() {
        // Effacer le canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dessiner la grille de fond
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // Lignes verticales
        for (let i = 0; i <= GRID_COUNT; i++) {
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, canvas.height);
            ctx.stroke();
        }
        
        // Lignes horizontales
        for (let j = 0; j <= GRID_COUNT; j++) {
            ctx.moveTo(0, j * CELL_SIZE);
            ctx.lineTo(canvas.width, j * CELL_SIZE);
            ctx.stroke();
        }
        
        // Dessiner le serpent
        snake.forEach((segment, index) => {
            // Couleur avec dégradé basé sur l'index
            const alpha = 1 - (index / snake.length) * 0.5;
            
            ctx.fillStyle = `rgba(0, 245, 255, ${alpha})`;
            ctx.shadowColor = '#00f5ff';
            ctx.shadowBlur = index === 0 ? 20 : 12;
            
            // Dessiner le segment comme un rectangle arrondi
            ctx.beginPath();
            ctx.roundRect(
                segment.x * CELL_SIZE + 2,
                segment.y * CELL_SIZE + 2,
                CELL_SIZE - 4,
                CELL_SIZE - 4,
                8
            );
            ctx.fill();
        });
        
        ctx.shadowBlur = 0;
        
        // Dessiner la nourriture
        ctx.fillStyle = '#ff00aa';
        ctx.shadowColor = '#ff00aa';
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(
            food.x * CELL_SIZE + CELL_SIZE / 2,
            food.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 2 - 4,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Indicateur de pause
        if (isPaused) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#00f5ff';
            ctx.font = 'bold 36px Orbitron, sans-serif';
            ctx.textAlign = center;
            ctx.fillText('⏸ PAUSE', canvas.width / 2, canvas.height / 2);
        }
    }
    
    /**
     * Gère le game over
     * Affiche l'écran de fin avec le score final
     */
    function gameOver() {
        GameEngine.stopLoop();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 42px Orbitron, sans-serif';
        ctx.textAlign = center;
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.fillStyle = '#c0c8d4';
        ctx.font = '22px Inter, sans-serif';
        ctx.fillText(`Score Final: ${score}`, canvas.width / 2, canvas.height / 20);
    }
    
    // ===== GESTION DES CONTRÔLES =====
    document.addEventListener('keydown', (event) => {
        // Ne traiter que si ce n'est PAS le jeu snake
        if (GameEngine.currentGame !== 'snake') return;
        
        switch(event.key) {
            case 'ArrowUp':
                // Ne peut pas aller vers le haut si va vers le bas
                if (direction.y !== 1) {
                    nextDirection = {x: 0, y: -1};
                }
                event.preventDefault();
                break;
                
            case 'ArrowDown':
                // Ne peut pas aller vers le bas si va vers le haut
                if (direction.y !== -1) {
                    nextDirection = {x: 0, y: 1};
                event.preventDefault();
                break;
                
            case 'ArrowLeft':
                if (direction.x !== 1) {
                    nextDirection = {x: -1, y: 0};
                }
                event.preventDefault();
                break;
                
            case 'ArrowRight':
                if (direction.x !== -1) {
                    nextDirection = {x: 1, y: 0};
                event.preventDefault();
                break;
                
            case ' ': // Espace
                isPaused = !isPaused;
                event.preventDefault();
                break;
        }
    });
    
    // Initialiser le jeu
    food = generateFood();
    GameEngine.startLoop(update, render);
}


// ============================================================
// JEU 2: SUBWAY RUNNER
// Course infinie style Subway Surfers
// 3 voies de circulation
// Obstacles générés dynamiquement
// Mécanisme de saut
// Score basé sur la distance parcourue
// ============================================================

/**
 * Initialise et lance le jeu Subway Runner
 * 
 * Fonctionnalités:
 * - 3 voies de circulation (gauche, centre, droite)
 * - Obstacles de type barrière ou train
 * - Saut avec physique réaliste
 * - Vitesse progressive
 * - Score basé sur la distance
 * 
 * Contrôles:
 *   ← → Changer de voie vers la gauche
 *   → Changer de voie vers la droite  
 *   ↑ ou ESPACE -> Sauter
 */

function initSubwayRunner() {
    // ===== CONFIGURATION =====
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 600;
    
    // Dimensions du terrain
    const LANE_WIDTH = 140; // Largeur de chaque voie
    const LANES = [-LANE_WIDTH, 0, LANE_WIDTH]; // Positions X des 3 voies
    const PLAYER_Y = 450; // Position Y du joueur
    const GOAL_WIDTH = 130; // Largeur du but
    
    // Physique
    const GRAVITY = 2500;      // Accélération gravitationnelle
    const JUMP_FORCE = -700;    // Force du saut initial (négatif = vers le haut)
    const GAME_SPEED_INITIAL = 350; // Vitesse initiale du jeu (pixels/seconde)
    const SPEED_INCREMENT = 15;       // Augmentation de vitesse par seconde
    const SPAWN_INTERVAL = 1.8;       | // Intervalle d'apparition des obstacles
    const TRAIN_RATIO = 0.35;       % de chance d'avoir un train (vs barrière)
    
    // État du jeu
    let playerLane = 1;          // Voie actuelle du joueur (0=gauche, 1=centre, 2=droite)
    let playerX = 0;          // Position X calculée (interpolée)
    let targetX = 0;        // Position X cible
    let playerY = PLAYER_Y;      // Position Y actuelle
    let velocityY = 0;        // Vitesse verticale actuelle
    let isJumping = false;     // En train de saut ?
    
    let gameSpeed = GAME_SPEED_INITIAL;
    let distance = 0;          // Distance totale parcourue
    let obstacles = [];        // Liste des obstacles actifs
    let spawnTimer = 0;          // Timer pour spawn
    let score = 0;              // Score local
    
    // ===== CRÉATION DE L'INTERFACE =====
    const container = document.getElementById('gameContainerArea');
    container.innerHTML = `
        <div style="text-align:center;width:100%;">
            <canvas id="subwayCanvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" 
                    style="
                        background: linear-gradient(180deg, #0a1628 0%, #1a1a2e 100%);
                        border-radius: 16px;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                        border: 2px solid rgba(0, 245, 255, 0.25);
                        image-rendering: crisp-edges;
                    ">
            </canvas>
            <div style="
                margin-top: 20px;
                padding: 16px 28px;
                background: rgba(26, 35, 50, 0.9);
                border: 1px solid rgba(0, 245, 255, 0.15);
                border-radius: 14px;
                color: var(--text-muted);
                font-size: 15px;
                line-height: 1.6;
            ">
                <i class="fas fa-running"></i> ← → Changer de voie
                <span style="margin: 0 15px;">|</span>
                ↑ ou ESPACE pour sauter
            </div>
        </div>
    `;
    
    const canvas = document.getElementById('subwayCanvas');
    const ctx = canvas.getContext('2d');
    
    /**
     * Génère un obstacle (barrière ou train)
     * 
     * Types disponibles:
     * - barrier: Obstacle basique, facile à esquiver
     * - train: Obstacle plus difficile, donne plus de points
     */
    function spawnObstacle() {
        const lane = Math.floor(Math.random() * 3); // 0=gauche, 1=centre, 2=droite
        const type = Math.random() < TRAIN_RATIO ? 'train' : 'barrier';
        
        return {
            x: CANVAS_WIDTH + 150, // Commence hors écran
            lane: lane,
            type: type,
            width: type === 'train' ? 80 : 65,
            height: type === 'train' ? 180 : 90,
            passed: false          // Si le joueur a passé cet obstacle
        };
    }
    
    /**
     * Vérifie si deux rectangles se chevauchent
     * Utilisé pour détecter les collisions
     */
    function checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
    
    /**
     * Met à jour la logique du jeu
     * 
     * @param {number} dt - Delta time
     */
    function update(dt) {
        // Mouvement horizontal fluide (interpolation)
        targetX = LANES[playerLane];
        playerX += (targetX - playerX) * 12 * dt;
        
        // Physique du saut
        if (isJumping) {
            velocityY += GRAVITY * dt;
            playerY += velocityY * dt;
            
            // Atterrissage
            if (playerY >= PLAYER_Y) {
                playerY = PLAYER_Y;
                isJumping = false;
                velocityY = 0;
            }
        }
        
        // Augmenter la vitesse progressivement
        gameSpeed += SPEED_INCREMENT * dt;
        
        // Mettre à jour la distance
        distance += gameSpeed * dt;
        score = Math.floor(distance / 10);
        GameEngine.score = score;
        GameEngine.updateScoreDisplay();
        
        // Spawn des obstacles
        spawnTimer += dt;
        if (spawnTimer >= SPAWN_INTERVAL) {
            obstacles.push(spawnObstacle());
            spawnTimer = 0;
        }
        
        // Déplacer les obstacles
        obstacles.forEach((obs, index) => {
            obs.x -= gameSpeed * dt;
            
            // Supprimer les obstacles sortis
            if (obs.x + obs.width < -50) {
                obstacles.splice(index, 1);
            }
            
            // Vérifier si l'obstacle a été passé
            if (!obs.passed && obs.x + obs.width < canvas.width/2 + playerX - 25) {
                obs.passed = true;
                score += 50;
                GameEngine.score += 50;
                GameEngine.updateScoreDisplay();
            }
        });
        
        // Collision avec le joueur
        const playerBox = {
            x: canvas.width/2 + playerX - 25,
            y: playerY - 40,
            width: 50,
            height: 80
        };
        
        for (let obs of obstacles) {
            const obsBox = {
                x: obs.x,
                y: 350,
                width: obs.width,
                height: obs.height
            };
            
            if (checkCollision(playerBox, obsBox)) {
                gameOver();
                return;
            }
        }
    }
    
    /**
     * Affichage du jeu
     */
    function render() {
        // Fond avec dégradé animé
        const bgGradient = ctx.createLinearGradient(180deg, 
            'rgba(26, 26, 40, 1) 0%', 
            'rgba(10, 14, 26, 1) 100%'
        );
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Lignes de voies
        ctx.strokeStyle = 'rgba(109, 200, 232, 0.3)';
        ctx.lineWidth = 3;
        ctx.setLineDash([15, 15]);
        
        for (let i = 1; i <= 3; i++) {
            const x = canvas.width/2 + (i - 1.5) * LANE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
        
        // Sol
        ctx.fillStyle = '#16213e';
        ctx.fillRect(0, PLAYER_Y + 40, canvas.width, canvas.height - PLAYER_Y - 40);
        
        // Obstacles
        obstacles.forEach(obs => {
            const laneX = canvas.width/2 + obs.lane * LANE_WIDTH - obs.width/2;
            const obsY = 350;
            
            ctx.fillStyle = obs.type === 'train' ? '#0f3434' : '#e94560';
            ctx.shadowColor = obs.type === 'train' ? '#0f3434' : '#e94560';
            ctx.shadowBlur = 12;
            
            ctx.fillRect(laneX, obsY, obs.width, obs.height);
            ctx.shadowBlur = 0;
        });
        
        // Joueur
        const px = canvas.width/2 + playerX;
        const py = playerY;
        
        // Corps du joueur
        ctx.fillStyle = '#00f5ff';
        ctx.shadowColor = '#00f5ff';
        ctx.shadowBlur = 20;
        
        ctx.beginPath();
        ctx.ellipse(px, py - 10, 28, 56, 48, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Tête du joueur
        ctx.beginPath();
        ctx.arc(px, py - 55, 18, 0, Math.PI * 2);
        ctx.fill();
        
        // Score et distance
        ctx.font = 'bold 20px JetBrains Mono, monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign: left;
        ctx.fillText(`Distance: ${Math.floor(distance)}m`, 20, 30);
        ctx.textAlign = right;
        ctx.fillText(`Vitesse: ${Math.floor(gameSpeed)} km/h`, canvas.width - 20, 30);
    }
    
    /**
     * Game Over - Fin de partie
     */
    function gameOver() {
        GameEngine.stopLoop();
        
        ctx.fillStyle = 'rgba(26, 26, 40, 0.95)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 48px Orbitron, sans-serif;
        ctx.textAlign = center;
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 40);
        
        ctx.fillStyle = '#00f5ff';
        ctx.font = '24px Inter, sans-serif;
        ctx.fillText(`Score Final: ${score}`, canvas.width/2, canvas.height/2 + 20);
        
        ctx.fillStyle = '#c0c8d4';
        ctx.font = '16px Inter, sans-serif;
        ctx.fillText(`Distance: ${Math.floor(distance)} mètres`, canvas.width/2, canvas.height/2 + 55);
    }
    
    // Démarrer le jeu
    document.addEventListener('keydown', (e) => {
        if (GameEngine.currentGame !== 'subway') return;
        
        switch(e.key) {
            case 'ArrowLeft':
                if (playerLane > 0) playerLane--;
                e.preventDefault();
                break;
                
            case 'ArrowRight':
                if (playerLane < 2) playerLane++;
                e.preventDefault();
                break;
                
            case 'ArrowUp':
            case ' ' ':
                if (!isJumping) {
                    isJumping = true;
                    velocityY = JUMP_FORCE;
                }
                e.preventDefault();
                break;
        }
    });
    
    // Initialiser
    GameEngine.startLoop(update, render);
}
