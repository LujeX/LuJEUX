/**
 * ============================================
 * ARCADE ULTIMATE - CORE ENGINE
 * Moteur de jeu principal
 * Gestion du Delta Time, Game Loop, Menu Manager
 * ============================================
 */

// ============================================
// CONFIGURATION GLOBALE
// ============================================
const CONFIG = {
    TARGET_FPS: 60,
    DELTA_TIME_CAP: 0.1, // Cap à 100ms pour éviter les sauts
    PARTICLE_COUNT: 80,
    LOADING_DURATION: 2000,
    ANIMATION_SPEED: 1,
    DEBUG_MODE: false
};

// ============================================
// CLASSE PRINCIPALE - GAME ENGINE
// ============================================
class GameEngine {
    constructor() {
        // État du moteur
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
        
        // Références DOM
        this.canvas = null;
        this.ctx = null;
        
        // Jeu actuel
        this.currentGame = null;
        this.currentGameName = '';
        
        // Score global
        this.score = 0;
        
        // Éléments UI
        this.elements = {};
        
        // Système de particules
        this.particles = [];
        
        // Audio context (pour sons futurs)
        this.audioContext = null;
        
        // Initialiser
        this.init();
    }
    
    // ============================================
    // INITIALISATION
    // ============================================
    init() {
        console.log('🎮 [GameEngine] Initialisation...');
        
        // Récupérer les éléments DOM
        this.cacheElements();
        
        // Initialiser les événements
        this.bindEvents();
        
        // Initialiser les particules de fond
        this.initParticles();
        
        // Démarrer l'animation des particules
        this.animateParticles();
        
        // Animation de typing
        this.startTypingAnimation();
        
        // Effet de suivi souris sur les cartes
        this.initCardHoverEffect();
        
        console.log('✅ [GameEngine] Prêt !');
    }
    
    cacheElements() {
        this.elements = {
            loadingScreen: document.getElementById('loadingScreen'),
            loadingBar: document.getElementById('loadingBar'),
            loadingPercent: document.getElementById('loadingPercent'),
            mainMenu: document.getElementById('mainMenu'),
            gameContainer: document.getElementById('gameContainer'),
            canvas: document.getElementById('gameCanvas'),
            gameTitle: document.getElementById('gameTitle'),
            scoreValue: document.getElementById('scoreValue'),
            controlsInfo: document.getElementById('controlsInfo'),
            canvasOverlay: document.getElementById('canvasOverlay'),
            overlayTitle: document.getElementById('overlayTitle'),
            overlayMessage: document.getElementById('overlayMessage'),
            startGameBtn: document.getElementById('startGameBtn'),
            backBtn: document.getElementById('backBtn'),
            restartBtn: document.getElementById('restartBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            mobileControls: document.getElementById('mobileControls'),
            resultModal: document.getElementById('resultModal'),
            modalIcon: document.getElementById('modalIcon'),
            modalTitle: document.getElementById('modalTitle'),
            modalScore: document.getElementById('modalScore'),
            modalStats: document.getElementById('modalStats'),
            modalRestart: document.getElementById('modalRestart'),
            modalMenu: document.getElementById('modalMenu')
        };
        
        this.canvas = this.elements.canvas;
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
    }
    
    bindEvents() {
        // Boutons de navigation
        if (this.elements.backBtn) {
            this.elements.backBtn.addEventListener('click', () => this.returnToMenu());
        }
        
        if (this.elements.restartBtn) {
            this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        }
        
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        if (this.elements.startGameBtn) {
            this.elements.startGameBtn.addEventListener('click', () => this.hideOverlay());
        }
        
        // Modal
        if (this.elements.modalRestart) {
            this.elements.modalRestart.addEventListener('click', () => {
                this.hideModal();
                this.restartGame();
            });
        }
        
        if (this.elements.modalMenu) {
            this.elements.modalMenu.addEventListener('click', () => {
                this.hideModal();
                this.returnToMenu();
            });
        }
        
        // Cartes de jeux
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.addEventListener('click', () => {
                const gameName = card.dataset.game;
                if (gameName) {
                    this.launchGame(gameName);
                }
            });
        });
        
        // Contrôles mobiles
        const dpadButtons = document.querySelectorAll('.dpad-btn[data-dir]');
        dpadButtons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleMobileInput(btn.dataset.dir, 'down');
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleMobileInput(btn.dataset.dir, 'up');
            });
            btn.addEventListener('mousedown', () => this.handleMobileInput(btn.dataset.dir, 'down'));
            btn.addEventListener('mouseup', () => this.handleMobileInput(btn.dataset.dir, 'up'));
        });
        
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleMobileAction(btn.dataset.action, 'down');
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleMobileAction(btn.dataset.action, 'up');
            });
        });
        
        // Clavier global
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Souris sur canvas
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => this.handleClick(e));
            this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }
        
        // Redimensionnement fenêtre
        window.addEventListener('resize', () => this.handleResize());
    }
    
    // ============================================
    // SYSTÈME DE CHARGEMENT
    // ============================================
    simulateLoading() {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    
                    if (this.elements.loadingBar) {
                        this.elements.loadingBar.style.width = '100%';
                    }
                    if (this.elements.loadingPercent) {
                        this.elements.loadingPercent.textContent = '100%';
                    }
                    
                    setTimeout(() => {
                        if (this.elements.loadingScreen) {
                            this.elements.loadingScreen.classList.add('hidden');
                        }
                        if (this.elements.mainMenu) {
                            this.elements.mainMenu.classList.remove('hidden');
                        }
                        resolve();
                    }, 500);
                } else {
                    if (this.elements.loadingBar) {
                        this.elements.loadingBar.style.width = `${progress}%`;
                    }
                    if (this.elements.loadingPercent) {
                        this.elements.loadingPercent.textContent = `${Math.floor(progress)}%`;
                    }
                }
            }, 100);
        });
    }
    
    // ============================================
    // PARTICULES DE FOND
    // ============================================
    initParticles() {
        const particleCanvas = document.getElementById('particlesBg');
        if (!particleCanvas) return;
        
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
        
        const ctx = particleCanvas.getContext('2d');
        this.particles = [];
        
        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            this.particles.push({
                x: Math.random() * particleCanvas.width,
                y: Math.random() * particleCanvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                color: `hsla(${220 + Math.random() * 60}, 70%, 60%, `
            });
        }
        
        this.particleCanvas = particleCanvas;
        this.particleCtx = ctx;
    }
    
    animateParticles() {
        if (!this.particleCtx || !this.particleCanvas) return;
        
        const ctx = this.particleCtx;
        const canvas = this.particleCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let p of this.particles) {
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Rebondir sur les bords
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
            
            // Dessiner la particule
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.opacity + ')';
            ctx.fill();
            
            // Ajouter un glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = p.color + (p.opacity * 0.3) + ')';
            ctx.fill();
        }
        
        // Lignes entre particules proches
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(() => this.animateParticles());
    }
    
    updateParticleCanvasSize() {
        if (this.particleCanvas) {
            this.particleCanvas.width = window.innerWidth;
            this.particleCanvas.height = window.innerHeight;
        }
    }
    
    // ============================================
    // ANIMATION TYPING
    // ============================================
    startTypingAnimation() {
        const typingElement = document.querySelector('.typing-text');
        if (!typingElement) return;
        
        const texts = [
            '9 Jeux Classiques',
            'IA Intelligente',
            '60 FPS Fluides',
            'Design Premium',
            '100% Gratuit'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const type = () => {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let typeSpeed = isDeleting ? 50 : 100;
            
            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typeSpeed = 500;
            }
            
            setTimeout(type, typeSpeed);
        };
        
        type();
    }
    
    // ============================================
    // EFFET HOVER SUR CARTES
    // ============================================
    initCardHoverEffect() {
        const cards = document.querySelectorAll('.game-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
            });
        });
    }
    
    // ============================================
    // LANCEMENT DE JEU
    // ============================================
    launchGame(gameName) {
        console.log(`🚀 [GameEngine] Lancement: ${gameName}`);
        
        // Masquer le menu
        if (this.elements.mainMenu) {
            this.elements.mainMenu.classList.add('hidden');
        }
        
        // Afficher le conteneur de jeu
        if (this.elements.gameContainer) {
            this.elements.gameContainer.classList.remove('hidden');
        }
        
        // Stocker le nom du jeu
        this.currentGameName = gameName;
        
        // Configurer selon le jeu
        this.setupGame(gameName);
        
        // Afficher l'overlay
        this.showOverlay();
        
        // Reset score
        this.score = 0;
        this.updateScoreDisplay();
        
        // Démarrer le game loop
        this.lastTime = performance.now();
        this.isRunning = true;
        this.isPaused = true; // En pause jusqu'au clic sur "Commencer"
        
        if (!this.animationFrameId) {
            this.gameLoop();
        }
    }
    
    setupGame(gameName) {
        // Configuration spécifique à chaque jeu
        const gameConfigs = {
            snake: {
                title: '🐍 SNAKE',
                width: 600,
                height: 600,
                controls: '<kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> Déplacer',
                showMobile: true,
                overlayTitle: 'PRÊT ?',
                overlayMessage: 'Mangez les pommes pour grandir'
            },
            subway: {
                title: '🏃 SUBWAY RUNNER',
                width: 450,
                height: 700,
                controls: '<kbd>←</kbd><kbd>→</kbd> Changer voie | <kbd>Espace</kbd> Sauter',
                showMobile: true,
                overlayTitle: 'COURREZ !',
                overlayMessage: 'Évitez les obstacles et collectez les pièces'
            },
            tetris: {
                title: '🧱 TETRIS',
                width: 420,
                height: 720,
                controls: '<kbd>←</kbd><kbd>→</kbd> Déplacer | <kbd>↑</kbd> Rotation | <kbd>↓</kbd> Drop',
                showMobile: false,
                overlayTitle: 'TETRIS',
                overlayMessage: 'Complétez les lignes pour gagner'
            },
            pacman: {
                title: '👻 PAC-MAN',
                width: 560,
                height: 620,
                controls: '<kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> Déplacer',
                showMobile: true,
                overlayTitle: 'PAC-MAN',
                overlayMessage: 'Mangez toutes les pac-gommes !'
            },
            puissance4: {
                title: '🔴 PUISSANCE 4',
                width: 560,
                height: 520,
                controls: '<kbd>Clic</kbd> sur une colonne pour jouer',
                showMobile: false,
                overlayTitle: 'PUISSANCE 4',
                overlayMessage: 'Alignez 4 pions avant l\'IA !'
            },
            morpion: {
                title: '⭕ MORPION',
                width: 400,
                height: 480,
                controls: '<kbd>Clic</kbd> sur une case pour jouer',
                showMobile: false,
                overlayTitle: 'MORPION',
                overlayMessage: 'Tic-Tac-Toe contre IA imbattable'
            },
            blackjack: {
                title: '🃏 BLACKJACK',
                width: 750,
                height: 550,
                controls: '<kbd>H</kbd> Hit | <kbd>S</kbd> Stand | <kbd>D</kbd> Double',
                showMobile: false,
                overlayTitle: 'BLACKJACK',
                overlayMessage: 'Faites 21 points sans les dépasser'
            },
            pong: {
                title: '🏓 PONG',
                width: 850,
                height: 520,
                controls: '<kbd>↑</kbd><kbd>↓</kbd> Déplacer raquette',
                showMobile: true,
                overlayTitle: 'PONG',
                overlayMessage: 'Le classique du tennis de table'
            },
            airhockey: {
                title: '🥅 AIR HOCKEY',
                width: 850,
                height: 520,
                controls: '<kbd>Souris</kbd> Contrôler le maillet',
                showMobile: false,
                overlayTitle: 'AIR HOCKEY',
                overlayMessage: 'Marquez dans le but adverse !'
            }
        };
        
        const config = gameConfigs[gameName] || gameConfigs.snake;
        
        // Appliquer la configuration
        if (this.canvas) {
            this.canvas.width = config.width;
            this.canvas.height = config.height;
        }
        
        if (this.elements.gameTitle) {
            this.elements.gameTitle.textContent = config.title;
        }
        
        if (this.elements.controlsInfo) {
            this.elements.controlsInfo.innerHTML = config.controls;
        }
        
        if (this.elements.overlayTitle) {
            this.elements.overlayTitle.textContent = config.overlayTitle;
        }
        
        if (this.elements.overlayMessage) {
            this.elements.overlayMessage.textContent = config.overlayMessage;
        }
        
        // Afficher/masquer contrôles mobiles
        if (this.elements.mobileControls) {
            this.elements.mobileControls.style.display = config.showMobile ? 'flex' : 'none';
        }
        
        // Créer l'instance du jeu
        this.createGameInstance(gameName);
    }
    
    createGameInstance(gameName) {
        switch(gameName) {
            case 'snake':
                this.currentGame = new SnakeGame(this.canvas, this.ctx);
                break;
            case 'subway':
                this.currentGame = new SubwayRunnerGame(this.canvas, this.ctx);
                break;
            case 'tetris':
                this.currentGame = new TetrisGame(this.canvas, this.ctx);
                break;
            case 'pacman':
                this.currentGame = new PacManGame(this.canvas, this.ctx);
                break;
            case 'puissance4':
                this.currentGame = new Puissance4Game(this.canvas, this.ctx);
                break;
            case 'morpion':
                this.currentGame = new MorpionGame(this.canvas, this.ctx);
                break;
            case 'blackjack':
                this.currentGame = new BlackjackGame(this.canvas, this.ctx);
                break;
            case 'pong':
                this.currentGame = new PongGame(this.canvas, this.ctx);
                break;
            case 'airhockey':
                this.currentGame = new AirHockeyGame(this.canvas, this.ctx);
                break;
            default:
                console.error(`[GameEngine] Jeu inconnu: ${gameName}`);
                return;
        }
        
        // Passer les références au jeu
        if (this.currentGame) {
            this.currentGame.engine = this;
        }
    }
    
    // ============================================
    // GAME LOOP PRINCIPAL
    // ============================================
    gameLoop() {
        if (!this.isRunning) return;
        
        // Calculer Delta Time
        const now = performance.now();
        this.deltaTime = (now - this.lastTime) / 1000; // Convertir en secondes
        this.deltaTime = Math.min(this.deltaTime, CONFIG.DELTA_TIME_CAP); // Cap
        this.lastTime = now;
        
        // Calculer FPS
        this.frameCount++;
        if (now - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = now;
            
            if (CONFIG.DEBUG_MODE) {
                console.log(`[FPS] ${this.fps}`);
            }
        }
        
        // Mettre à jour et rendre si pas en pause
        if (!this.isPaused && this.currentGame && !this.currentGame.gameOver) {
            this.currentGame.update(this.deltaTime);
            this.currentGame.render();
            
            // Mettre à jour le score depuis le jeu
            if (typeof this.currentGame.score !== 'undefined') {
                this.score = this.currentGame.score;
                this.updateScoreDisplay();
            }
        } else if (this.currentGame) {
            // Continuer de render même en pause (pour animations)
            this.currentGame.render();
        }
        
        // Prochaine frame
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
    
    // ============================================
    // GESTION DES ÉTATS
    // ============================================
    hideOverlay() {
        if (this.elements.canvasOverlay) {
            this.elements.canvasOverlay.classList.add('hidden');
        }
        this.isPaused = false;
        
        if (this.currentGame && typeof this.currentGame.onStart === 'function') {
            this.currentGame.onStart();
        }
    }
    
    showOverlay() {
        if (this.elements.canvasOverlay) {
            this.elements.canvasOverlay.classList.remove('hidden');
        }
        this.isPaused = true;
    }
    
    togglePause() {
        if (this.currentGame && this.currentGame.gameOver) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.elements.pauseBtn) {
            const icon = this.elements.pauseBtn.querySelector('svg');
            if (icon) {
                icon.innerHTML = this.isPaused 
                    ? '<polygon points="5,3 19,12 5,21"/>'
                    : '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
            }
        }
        
        if (this.isPaused && !this.elements.canvasOverlay?.classList.contains('hidden')) {
            // Ne rien faire, overlay déjà visible
        }
    }
    
    showModal(icon, title, finalScore, stats = '') {
        if (this.elements.modalIcon) this.elements.modalIcon.textContent = icon;
        if (this.elements.modalTitle) this.elements.modalTitle.textContent = title;
        if (this.elements.modalScore) this.elements.modalScore.textContent = finalScore.toLocaleString();
        if (this.elements.modalStats) this.elements.modalStats.innerHTML = stats;
        if (this.elements.resultModal) this.elements.resultModal.classList.remove('hidden');
        
        this.isPaused = true;
    }
    
    hideModal() {
        if (this.elements.resultModal) {
            this.elements.resultModal.classList.add('hidden');
        }
    }
    
    // ============================================
    // NAVIGATION
    // ============================================
    returnToMenu() {
        console.log('🏠 [GameEngine] Retour au menu');
        
        // Arrêter le game loop
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Nettoyer le jeu
        if (this.currentGame && typeof this.currentGame.destroy === 'function') {
            this.currentGame.destroy();
        }
        this.currentGame = null;
        
        // Masquer le conteneur de jeu
        if (this.elements.gameContainer) {
            this.elements.gameContainer.classList.add('hidden');
        }
        
        // Afficher le menu
        if (this.elements.mainMenu) {
            this.elements.mainMenu.classList.remove('hidden');
        }
        
        // Cacher modal
        this.hideModal();
        
        // Mettre à jour les particules
        this.updateParticleCanvasSize();
    }
    
    restartGame() {
        console.log('🔄 [GameEngine] Redémarrage');
        
        // Recréer le jeu
        this.createGameInstance(this.currentGameName);
        
        // Reset
        this.score = 0;
        this.updateScoreDisplay();
        
        // Montrer overlay
        this.showOverlay();
        this.isPaused = true;
    }
    
    // ============================================
    // AFFICHAGE DU SCORE
    // ============================================
    updateScoreDisplay() {
        if (this.elements.scoreValue) {
            this.elements.scoreValue.textContent = this.score.toLocaleString();
            
            // Animation de pulse
            this.elements.scoreValue.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.elements.scoreValue.style.transform = 'scale(1)';
            }, 150);
        }
    }
    
    // ============================================
    // GESTION DES INPUTS
    // ============================================
    handleKeyDown(e) {
        // Ignorer si on est dans le menu
        if (!this.currentGame || this.isPaused || this.currentGame.gameOver) return;
        
        // Empêcher le scroll avec les flèches
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }
        
        // Passer au jeu
        if (this.currentGame && typeof this.currentGame.handleKey === 'function') {
            this.currentGame.handleKey(e.key, e.code);
        }
        
        // Raccourcis globaux
        if (e.code === 'Escape') {
            this.togglePause();
        }
        if (e.code === 'KeyR' && e.ctrlKey) {
            e.preventDefault();
            this.restartGame();
        }
    }
    
    handleKeyUp(e) {
        if (!this.currentGame || this.isPaused) return;
        
        if (this.currentGame && typeof this.currentGame.handleKeyUp === 'function') {
            this.currentGame.handleKeyUp(e.key, e.code);
        }
    }
    
    handleClick(e) {
        if (!this.currentGame || this.isPaused || this.currentGame.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        if (this.currentGame && typeof this.currentGame.handleClick === 'function') {
            this.currentGame.handleClick(x, y);
        }
    }
    
    handleMouseMove(e) {
        if (!this.currentGame || this.isPaused || this.currentGame.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        if (this.currentGame && typeof this.currentGame.handleMouseMove === 'function') {
            this.currentGame.handleMouseMove(x, y);
        }
    }
    
    handleMobileInput(direction, state) {
        if (!this.currentGame || this.isPaused || this.currentGame.gameOver) return;
        
        if (this.currentGame && typeof this.currentGame.handleMobileInput === 'function') {
            this.currentGame.handleMobileInput(direction, state);
        }
    }
    
    handleMobileAction(action, state) {
        if (!this.currentGame || this.isPaused || this.currentGame.gameOver) return;
        
        if (this.currentGame && typeof this.currentGame.handleMobileAction === 'function') {
            this.currentGame.handleMobileAction(action, state);
        }
    }
    
    handleResize() {
        this.updateParticleCanvasSize();
        
        if (this.currentGame && typeof this.currentGame.handleResize === 'function') {
            this.currentGame.handleResize();
        }
    }
    
    // ============================================
    // UTILITAIRES AUDIO (préparés pour futur)
    // ============================================
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('[GameEngine] Web Audio API non supportée');
        }
    }
    
    playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
}

// ============================================
// INSTANCE GLOBALE DU MOTEUR
// ============================================
const engine = new GameEngine();

// ============================================
// DÉMARRAGE AU CHARGEMENT
// ============================================
window.addEventListener('DOMContentLoaded', async () => {
    await engine.simulateLoading();
});
