/**
 * CORE ENGINE - Moteur de jeu principal
 * Gère : GameLoop, Particules, Navigation, Input
 */

class ParticleSystem {
    constructor(maxParticles = 200) {
        this.particles = [];
        this.max = maxParticles;
    }

    emit(x, y, options = {}) {
        const count = options.count || 10;
        for (let i = 0; i < count && this.particles.length < this.max; i++) {
            const angle = options.spread === Math.PI * 2 
                ? Math.random() * Math.PI * 2 
                : (options.spread || Math.random() * Math.PI * 2);
            const speed = (options.speed || 3) * (0.5 + Math.random() * 0.5);
            const colors = options.colors || ['#ffffff'];
            
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: (options.size || 4) * (0.5 + Math.random()),
                color: colors[Math.floor(Math.random() * colors.length)],
                life: options.life || 1,
                maxLife: options.life || 1,
                gravity: options.gravity || 0,
                decay: 0.98
            });
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity * dt;
            p.vx *= p.decay;
            p.vy *= p.decay;
            p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    render(ctx) {
        for (const p of this.particles) {
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}

class BaseGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.score = 0;
        this.gameOver = false;
        this.gameState = GAME_STATES.IDLE;
        this.engine = null;
    }

    init() {}
    update(dt) {}
    render() {}
    handleKey(key, code) {}
    handleKeyUp(key, code) {}
    handleClick(x, y) {}
    handleMouseMove(x, y) {}
    handleMobileInput(dir, state) {}
    handleMobileAction(action, state) {}
    onStart() {}
    destroy() {}

    endGame(won, title, icon) {
        if (this.engine) {
            this.engine.showModal(icon || '🎮', title, this.score);
        }
    }
}

class GameEngine {
    constructor() {
        this.isRunning = false;
        this.isPaused = true;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.currentGame = null;
        this.currentGameName = '';
        this.score = 0;
        this.animationFrameId = null;
        
        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.initParticles();
        this.animateParticles();
        this.startTypingAnimation();
        this.initCardHoverEffect();
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
            modalRestart: document.getElementById('modalRestart'),
            modalMenu: document.getElementById('modalMenu')
        };
    }

    bindEvents() {
        // Boutons navigation
        if (this.elements.backBtn) 
            this.elements.backBtn.addEventListener('click', () => this.returnToMenu());
        if (this.elements.restartBtn) 
            this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        if (this.elements.pauseBtn) 
            this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        if (this.elements.startGameBtn) 
            this.elements.startGameBtn.addEventListener('click', () => this.hideOverlay());
        
        // Modal
        if (this.elements.modalRestart)
            this.elements.modalRestart.addEventListener('click', () => { this.hideModal(); this.restartGame(); });
        if (this.elements.modalMenu)
            this.elements.modalMenu.addEventListener('click', () => { this.hideModal(); this.returnToMenu(); });

        // Cartes de jeux
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const name = card.dataset.game;
                if (name) this.launchGame(name);
            });
        });

        // Contrôles mobiles
        document.querySelectorAll('.dpad-btn[data-dir]').forEach(btn => {
            btn.addEventListener('touchstart', e => { e.preventDefault(); this.handleMobileInput(btn.dataset.dir, 'down'); });
            btn.addEventListener('touchend', e => { e.preventDefault(); this.handleMobileInput(btn.dataset.dir, 'up'); });
            btn.addEventListener('mousedown', () => this.handleMobileInput(btn.dataset.dir, 'down'));
            btn.addEventListener('mouseup', () => this.handleMobileInput(btn.dataset.dir, 'up'));
        });

        // Clavier global
        document.addEventListener('keydown', e => this.handleKeyDown(e));
        document.addEventListener('keyup', e => this.handleKeyUp(e));

        // Souris sur canvas
        if (this.elements.canvas) {
            this.elements.canvas.addEventListener('click', e => this.handleClick(e));
            this.elements.canvas.addEventListener('mousemove', e => this.handleMouseMove(e));
        }

        // Resize
        window.addEventListener('resize', () => this.handleResize());
    }

    simulateLoading() {
        return new Promise(resolve => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    if (this.elements.loadingBar) this.elements.loadingBar.style.width = '100%';
                    if (this.elements.loadingPercent) this.elements.loadingPercent.textContent = '100%';
                    setTimeout(() => {
                        if (this.elements.loadingScreen) this.elements.loadingScreen.classList.add('hidden');
                        if (this.elements.mainMenu) this.elements.mainMenu.classList.add('visible');
                        resolve();
                    }, 500);
                } else {
                    if (this.elements.loadingBar) this.elements.loadingBar.style.width = `${progress}%`;
                    if (this.elements.loadingPercent) this.elements.loadingPercent.textContent = `${Math.floor(progress)}%`;
                }
            }, 100);
        });
    }

    initParticles() {
        const canvas = document.getElementById('particlesBg');
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.particleCanvas = canvas;
        this.particleCtx = canvas.getContext('2d');
        this.bgParticles = [];
        for (let i = 0; i < 60; i++) {
            this.bgParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    animateParticles() {
        if (!this.particleCtx || !this.particleCanvas) return;
        const ctx = this.particleCtx;
        const c = this.particleCanvas;
        ctx.clearRect(0, 0, c.width, c.height);

        for (const p of this.bgParticles) {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0 || p.x > c.width) p.speedX *= -1;
            if (p.y < 0 || p.y > c.height) p.speedY *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
            ctx.fill();
        }

        // Lignes entre particules proches
        for (let i = 0; i < this.bgParticles.length; i++) {
            for (let j = i + 1; j < this.bgParticles.length; j++) {
                const dx = this.bgParticles[i].x - this.bgParticles[j].x;
                const dy = this.bgParticles[i].y - this.bgParticles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(this.bgParticles[i].x, this.bgParticles[i].y);
                    ctx.lineTo(this.bgParticles[j].x, this.bgParticles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(() => this.animateParticles());
    }

    startTypingAnimation() {
        const el = document.getElementById('typingText');
        if (!el) return;
        const texts = ['9 Jeux Classiques', 'IA Intelligente', '60 FPS Fluides', 'Design Premium', '100% Gratuit'];
        let ti = 0, ci = 0, del = false;
        const type = () => {
            const t = texts[ti];
            el.textContent = del ? t.substring(0, ci - 1) : t.substring(0, ci + 1);
            ci += del ? -1 : 1;
            let sp = del ? 50 : 100;
            if (!del && ci === t.length) { sp = 2000; del = true; }
            else if (del && ci === 0) { del = false; ti = (ti + 1) % texts.length; sp = 500; }
            setTimeout(type, sp);
        };
        type();
    }

    initCardHoverEffect() {
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
                card.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
            });
        });
    }

    launchGame(name) {
        console.log(`🚀 Lancement: ${name}`);
        
        // Masquer menu
        if (this.elements.mainMenu) this.elements.mainMenu.classList.remove('visible');
        setTimeout(() => { 
            if (this.elements.mainMenu) this.elements.mainMenu.style.display = 'none'; 
        }, 500);

        // Afficher conteneur jeu
        if (this.elements.gameContainer) {
            this.elements.gameContainer.classList.add('active');
            this.elements.gameContainer.style.display = 'flex';
        }

        this.currentGameName = name;
        this.setupGame(name);
        this.showOverlay();
        this.score = 0;
        this.updateScoreDisplay();

        this.lastTime = performance.now();
        this.isRunning = true;
        this.isPaused = true;

        if (!this.animationFrameId) this.gameLoop();
    }

    setupGame(name) {
        const configs = {
            snake: { title: '🐍 SNAKE', w: 600, h: 600, ctrl: '<kbd>↑↓←→</kbd> ou <kbd>WASD</kbd>', mobile: true, oTitle: 'PRÊT ?', oMsg: 'Mangez les pommes' },
            subwayRunner: { title: '🏃 SUBWAY RUNNER', w: 450, h: 650, ctrl: '<kbd>←→</kbd> Voie | <kbd>Espace</kbd> Saut', mobile: true, oTitle: 'COURREZ !', oMsg: 'Évitez les obstacles' },
            tetris: { title: '🧱 TETRIS', w: 400, h: 650, ctrl: '<kbd>←→</kbd> Déplacer | <kbd>↑</kbd> Rotation', mobile: false, oTitle: 'TETRIS', oMsg: 'Complétez les lignes' },
            pacman: { title: '👻 PAC-MAN', w: 560, h: 620, ctrl: '<kbd>↑↓←→</kbd> Déplacer', mobile: true, oTitle: 'PAC-MAN', oMsg: 'Mangez les pac-gommes' },
            puissance4: { title: '🔴 PUISSANCE 4', w: 560, h: 520, ctrl: '<kbd>Clic</kbd> colonne', mobile: false, oTitle: 'PUISSANCE 4', oMsg: 'Alignez 4 pions !' },
            morpion: { title: '⭕ MORPION', w: 380, h: 420, ctrl: '<kbd>Clic</kbd> case', mobile: false, oTitle: 'MORPION', oMsg: 'Tic-Tac-Toe vs IA' },
            blackjack: { title: '🃏 BLACKJACK', w: 700, h: 500, ctrl: '<kbd>H</kbd> Hit | <kbd>S</kbd> Stand', mobile: false, oTitle: 'BLACKJACK', oMsg: 'Faites 21 points' },
            pong: { title: '🏓 PONG', w: 800, h: 500, ctrl: '<kbd>↑↓</kbd> Raquette', mobile: true, oTitle: 'PONG', oMsg: 'Tennis de table !' },
            airHockey: { title: '🥅 AIR HOCKEY', w: 800, h: 500, ctrl: '<kbd>Souris</kbd> Maillet', mobile: false, oTitle: 'AIR HOCKEY', oMsg: 'Marquez un but !' }
        };

        const cfg = configs[name] || configs.snake;
        const cvs = this.elements.canvas;
        if (cvs) { cvs.width = cfg.w; cvs.height = cfg.h; }
        if (this.elements.gameTitle) this.elements.gameTitle.textContent = cfg.title;
        if (this.elements.controlsInfo) this.elements.controlsInfo.innerHTML = cfg.ctrl;
        if (this.elements.overlayTitle) this.elements.overlayTitle.textContent = cfg.oTitle;
        if (this.elements.overlayMessage) this.elements.overlayMessage.textContent = cfg.oMsg;
        if (this.elements.mobileControls) this.elements.mobileControls.style.display = cfg.mobile ? 'flex' : 'none';

        this.createGameInstance(name);
    }

    createGameInstance(name) {
        const ctx = this.elements.canvas?.getContext('2d');
        
        // Mapping des classes de jeux
        const gameClasses = {
            snake: typeof SnakeGame !== 'undefined' ? SnakeGame : null,
            puissance4: typeof Puissance4Game !== 'undefined' ? Puissance4Game : null,
            morpion: typeof MorpionGame !== 'undefined' ? MorpionGame : null,
            pong: typeof PongGame !== 'undefined' ? PongGame : null,
            tetris: typeof TetrisGame !== 'undefined' ? TetrisGame : null,
            pacman: typeof PacManGame !== 'undefined' ? PacManGame : null,
            subwayRunner: typeof SubwayRunnerGame !== 'undefined' ? SubwayRunnerGame : null,
            blackjack: typeof BlackjackGame !== 'undefined' ? BlackjackGame : null,
            airHockey: typeof AirHockeyGame !== 'undefined' ? AirHockeyGame : null
        };

        const GameClass = gameClasses[name];
        
        if (GameClass) {
            this.currentGame = new GameClass(this.elements.canvas, ctx);
        } else {
            // Placeholder si le jeu n'est pas encore implémenté
            this.currentGame = new BaseGame(this.elements.canvas, ctx);
            this.currentGame.render = function() {
                this.ctx.fillStyle = '#0a0a12';
                this.ctx.fillRect(0, 0, this.width, this.height);
                this.ctx.fillStyle = '#6366f1';
                this.ctx.font = 'bold 28px Orbitron';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('🚧 En construction...', this.width / 2, this.height / 2 - 20);
                this.ctx.font = '18px Rajdhani';
                this.ctx.fillStyle = '#94a3b8';
                this.ctx.fillText(`Jeu: ${name}`, this.width / 2, this.height / 2 + 20);
            };
            console.warn(`[GameEngine] Jeu "${name}" pas encore implémenté, affichage placeholder`);
        }

        if (this.currentGame) this.currentGame.engine = this;
    }

    gameLoop() {
        if (!this.isRunning) return;

        const now = performance.now();
        this.deltaTime = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;

        if (!this.isPaused && this.currentGame && !this.currentGame.gameOver) {
            try {
                this.currentGame.update(this.deltaTime);
                this.currentGame.render();
                
                if (typeof this.currentGame.score !== 'undefined') {
                    this.score = this.currentGame.score;
                    this.updateScoreDisplay();
                }
            } catch (e) {
                console.error('[GameLoop] Erreur:', e);
            }
        } else if (this.currentGame) {
            try { this.currentGame.render(); } catch (e) {}
        }

        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    hideOverlay() {
        if (this.elements.canvasOverlay) this.elements.canvasOverlay.classList.add('hidden');
        this.isPaused = false;
        if (this.currentGame && typeof this.currentGame.onStart === 'function') 
            this.currentGame.onStart();
    }

    showOverlay() {
        if (this.elements.canvasOverlay) this.elements.canvasOverlay.classList.remove('hidden');
        this.isPaused = true;
    }

    togglePause() {
        if (this.currentGame?.gameOver) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) this.showOverlay(); else this.hideOverlay();
    }

    showModal(icon, title, score) {
        if (this.elements.modalIcon) this.elements.modalIcon.textContent = icon;
        if (this.elements.modalTitle) this.elements.modalTitle.textContent = title;
        if (this.elements.modalScore) this.elements.modalScore.textContent = score.toLocaleString();
        if (this.elements.resultModal) this.elements.resultModal.classList.add('show');
        this.isPaused = true;
    }

    hideModal() {
        if (this.elements.resultModal) this.elements.resultModal.classList.remove('show');
    }

    updateScoreDisplay() {
        if (this.elements.scoreValue) {
            this.elements.scoreValue.textContent = this.score.toLocaleString();
        }
    }

    returnToMenu() {
        console.log('🏠 Retour au menu');
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.currentGame?.destroy) this.currentGame.destroy();
        this.currentGame = null;

        if (this.elements.gameContainer) {
            this.elements.gameContainer.classList.remove('active');
            this.elements.gameContainer.style.display = 'none';
        }
        if (this.elements.mainMenu) {
            this.elements.mainMenu.style.display = 'block';
            this.elements.mainMenu.classList.add('visible');
        }
        this.hideModal();
    }

    restartGame() {
        console.log('🔄 Redémarrage');
        this.createGameInstance(this.currentGameName);
        this.score = 0;
        this.updateScoreDisplay();
        this.showOverlay();
        this.isPaused = true;
    }

    handleKeyDown(e) {
        if (!this.currentGame || this.isPaused || this.currentGame.gameOver) return;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) 
            e.preventDefault();
        if (this.currentGame.handleKey) 
            this.currentGame.handleKey(e.key, e.code);
        if (e.code === 'Escape') this.togglePause();
    }

    handleKeyUp(e) {
        if (!this.currentGame || this.isPaused) return;
        if (this.currentGame.handleKeyUp) 
            this.currentGame.handleKeyUp(e.key, e.code);
    }

    handleClick(e) {
        if (!this.currentGame || this.isPaused || this.currentGame.gameOver) return;
        const rect = this.elements.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * this.elements.canvas.width;
        const y = ((e.clientY - rect.top) / rect.height) * this.elements.canvas.height;
        if (this.currentGame.handleClick) 
            this.currentGame.handleClick(x, y);
    }

    handleMouseMove(e) {
        if (!this.currentGame || this.isPaused || this.currentGame.gameOver) return;
        const rect = this.elements.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * this.elements.canvas.width;
        const y = ((e.clientY - rect.top) / rect.height) * this.elements.canvas.height;
        if (this.currentGame.handleMouseMove) 
            this.currentGame.handleMouseMove(x, y);
    }

    handleMobileInput(dir, state) {
        if (!this.currentGame || this.isPaused || this.currentGame.gameOver) return;
        if (this.currentGame.handleMobileInput) 
            this.currentGame.handleMobileInput(dir, state);
    }

    handleResize() {
        if (this.particleCanvas) {
            this.particleCanvas.width = window.innerWidth;
            this.particleCanvas.height = window.innerHeight;
        }
    }
}

// Instance globale du moteur
const engine = new GameEngine();
