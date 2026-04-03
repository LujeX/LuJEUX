// arcade-collection/js/main.js

/**
 * ============================================
 * ARCADE COLLECTION - APPLICATION PRINCIPALE
 * Point d'entrée, gestionnaire d'UI, et orchestrateur
 * ============================================
 */

'use strict';

/**
 * Classe principale ArcadeCollection
 * Gère l'ensemble de l'application
 */
class ArcadeCollection {
    constructor() {
        // État de l'application
        this.currentSection = 'home';
        this.currentGame = null;
        this.engine = null;
        this.games = [];
        
        // Configuration des jeux
        this.gamesConfig = [
            {
                id: 'pong',
                name: 'Pong',
                description: 'Le classique du tennis électronique. Affrontez l\'IA dans ce jeu intemporel!',
                icon: '🏓',
                difficulty: 2,
                color: '#64b5f6'
            },
            {
                id: 'snake',
                name: 'Snake',
                description: 'Guidez le serpent affamé pour manger les pommes et grandir indéfiniment!',
                icon: '🐍',
                difficulty: 2,
                color: '#81c784'
            },
            {
                id: 'tetris',
                name: 'Tetris',
                description: 'Empilez les blocs tombants de manière stratégique pour compléter les lignes!',
                icon: '🧱',
                difficulty: 3,
                color: '#ce93d8'
            },
            {
                id: 'pacman',
                name: 'Pac-Man',
                description: 'Mangez toutes les pastilles tout en évitant les fantômes dans ce labyrinthe!',
                icon: '🟡',
                difficulty: 3,
                color: '#ffb300'
            },
            {
                id: 'morpion',
                name: 'Morpion',
                description: 'Le classique Tic-Tac-Toe! Battez l\'IA dans ce jeu de stratégie.',
                icon: '⭕',
                difficulty: 1,
                color: '#f48fb1'
            },
            {
                id: 'puissance4',
                name: 'Puissance 4',
                description: 'Alignez 4 jetons verticalement, horizontalement ou en diagonale!',
                icon: '🔴',
                difficulty: 2,
                color: '#ef5350'
            },
            {
                id: 'blackjack',
                name: 'Blackjack',
                description: 'Faites 21 ou approchez-vous-en sans dépasser contre le croupier!',
                icon: '🃏',
                difficulty: 2,
                color: '#4caf50'
            },
            {
                id: 'airHockey',
                name: 'Air Hockey',
                description: 'Un match de hockey sur table intense! Marquez des buts contre l\'IA!',
                icon: '🏒',
                difficulty: 3,
                color: '#90caf9'
            },
            {
                id: 'subwayRunner',
                name: 'Subway Runner',
                description: 'Course infinie à travers la ville! Évitez les obstacles et collectez des pièces!',
                icon: '🏃',
                difficulty: 3,
                color: '#ff7043'
            }
        ];
        
        // Références DOM
        this.elements = {};
        
        // Initialiser
        this.init();
    }

    /**
     * Initialiser l'application
     */
    init() {
        console.log('[ArcadeCollection] Initialisation...');
        
        // Mettre en cache les éléments DOM
        this.cacheElements();
        
        // Initialiser les systèmes utilitaires
        Utils.input.init();
        Utils.particles.init(document.getElementById('particles-canvas'), {
            count: 60,
            colors: ['#64b5f6', '#81c784', '#f48fb1', '#ce93d8', '#ffd54f']
        });
        
        // Générer la grille de jeux
        this.generateGamesGrid();
        
        // Configurer les écouteurs d'événements
        this.setupEventListeners();
        
        // Charger les scores sauvegardés
        this.loadScores();
        
        // Afficher la section d'accueil
        this.showSection('home');
        
        console.log('[ArcadeCollection] Prêt!');
    }

    /**
     * Mettre en cache les éléments DOM
     */
    cacheElements() {
        this.elements = {
            // Navigation
            navLinks: document.querySelectorAll('.nav-link'),
            mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
            navMenu: document.querySelector('.nav-menu'),
            
            // Sections
            sections: document.querySelectorAll('.section'),
            gamesGrid: document.getElementById('games-grid'),
            scoresContainer: document.getElementById('scores-container'),
            
            // Modal de jeu
            gameModal: document.getElementById('game-modal'),
            gameCanvas: document.getElementById('game-canvas'),
            gameCanvasContainer: document.getElementById('game-canvas-container'),
            modalGameTitle: document.getElementById('modal-game-title'),
            modalScore: document.getElementById('modal-score'),
            gameInstructions: document.getElementById('game-instructions'),
            
            // Contrôles du modal
            soundToggle: document.getElementById('sound-toggle'),
            pauseBtn: document.getElementById('pause-btn'),
            closeGameBtn: document.getElementById('close-game'),
            globalFullscreenBtn: document.getElementById('global-fullscreen'),
            
            // Overlay
            gameOverlay: document.getElementById('game-overlay'),
            overlayTitle: document.getElementById('overlay-title'),
            overlayMessage: document.getElementById('overlay-message'),
            overlayStats: document.getElementById('overlay-stats'),
            resumeBtn: document.getElementById('resume-btn'),
            restartBtn: document.getElementById('restart-btn'),
            quitBtn: document.getElementById('quit-btn'),
            
            // Hero CTA
            exploreGamesBtn: document.getElementById('explore-games')
        };
    }

    /**
     * Configurer les écouteurs d'événements
     */
    setupEventListeners() {
        // Navigation
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                if (section) {
                    this.showSection(section);
                    this.updateActiveNav(link);
                }
            });
        });
        
        // Menu mobile
        this.elements.mobileMenuToggle.addEventListener('click', () => {
            this.elements.mobileMenuToggle.classList.toggle('active');
            this.elements.navMenu.classList.toggle('active');
        });
        
        // Bouton explorer les jeux
        if (this.elements.exploreGamesBtn) {
            this.elements.exploreGamesBtn.addEventListener('click', () => {
                this.showSection('games');
                this.updateActiveNav(document.querySelector('[data-section="games"]'));
            });
        }
        
        // Contrôles du modal de jeu
        this.elements.soundToggle.addEventListener('click', () => this.toggleSound());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.closeGameBtn.addEventListener('click', () => this.closeGame());
        
        // Boutons de l'overlay
        this.elements.resumeBtn.addEventListener('click', () => this.resumeGame());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        this.elements.quitBtn.addEventListener('click', () => this.closeGame());
        
        // Plein écran global
        this.elements.globalFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Événements clavier globaux
        window.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
        
        // Redimensionnement
        window.addEventListener('resize', Utils.debounce(() => this.handleResize(), 250));
        
        // Scroll pour la navbar
        window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 100));
    }

    /**
     * Générer la grille de jeux
     */
    generateGamesGrid() {
        const grid = this.elements.gamesGrid;
        grid.innerHTML = '';
        
        this.gamesConfig.forEach(game => {
            const card = this.createGameCard(game);
            grid.appendChild(card);
        });
    }

    /**
     * Créer une carte de jeu
     */
    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.dataset.gameId = game.id;
        
        // Obtenir le high score
        const highScore = Utils.storage.getHighScore(game.id);
        
        card.innerHTML = `
            <div class="game-card-preview">
                <span class="game-preview-animation">${game.icon}</span>
                <div class="game-card-overlay">
                    <div class="play-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="game-card-info">
                <h3 class="game-card-title">${game.name}</h3>
                <p class="game-card-description">${game.description}</p>
                <div class="game-card-meta">
                    <div class="game-difficulty" title="Difficulté">
                        ${this.generateDifficultyDots(game.difficulty)}
                    </div>
                    <span class="game-high-score">🏆 ${highScore > 0 ? Utils.formatScore(highScore) : '-'}</span>
                </div>
            </div>
        `;
        
        // Animation au survol
        card.addEventListener('mouseenter', () => {
            card.style.setProperty('--card-color', game.color);
        });
        
        // Clic pour lancer le jeu
        card.addEventListener('click', () => this.launchGame(game.id));
        
        return card;
    }

    /**
     * Générer les points de difficulté
     */
    generateDifficultyDots(level) {
        let dots = '';
        for (let i = 1; i <= 3; i++) {
            dots += `<span class="difficulty-dot ${i <= level ? 'filled' : ''}"></span>`;
        }
        return dots;
    }

    /**
     * Afficher une section
     */
    showSection(sectionId) {
        // Masquer toutes les sections
        this.elements.sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Si c'est la section scores, rafraîchir
            if (sectionId === 'scores') {
                this.refreshScores();
            }
        }
        
        // Fermer le menu mobile si ouvert
        this.elements.navMenu.classList.remove('active');
        this.elements.mobileMenuToggle.classList.remove('active');
    }

    /**
     * Mettre à jour la navigation active
     */
    updateActiveNav(activeLink) {
        this.elements.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Lancer un jeu
     */
    launchGame(gameId) {
        // Vérifier que le jeu existe
        if (!Games[gameId]) {
            console.error(`[ArcadeCollection] Jeu "${gameId}" non trouvé`);
            return;
        }
        
        // Trouver la config du jeu
        const gameConfig = this.gamesConfig.find(g => g.id === gameId);
        
        // Mettre à jour le titre du modal
        this.elements.modalGameTitle.textContent = `${gameConfig.icon} ${gameConfig.name}`;
        
        // Afficher le modal
        this.elements.gameModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Initialiser le moteur de jeu
        this.engine = new GameEngine();
        this.engine.init(this.elements.gameCanvas);
        
        // Configurer les callbacks
        this.engine.on('onScoreUpdate', (score) => {
            this.elements.modalScore.textContent = Utils.formatScore(score);
        });
        
        this.engine.on('onGameOver', (data) => {
            this.showGameOver(data);
        });
        
        this.engine.on('onPause', () => {
            this.showPause();
        });
        
        this.engine.on('onResume', () => {
            this.hideOverlay();
        });
        
        // Charger et démarrer le jeu
        this.engine.loadGame(gameId);
        this.engine.start();
        this.currentGame = gameId;
        
        // Afficher les instructions
        this.elements.gameInstructions.innerHTML = this.engine.getInstructions();
        
        // Réinitialiser l'affichage du score
        this.elements.modalScore.textContent = '0';
        
        // Initialiser l'audio au premier clic
        Utils.audio.init();
        
        console.log(`[ArcadeCollection] Lancement du jeu: ${gameId}`);
    }

    /**
     * Fermer le jeu actuel
     */
    closeGame() {
        if (this.engine) {
            this.engine.stop();
            this.engine = null;
        }
        
        this.elements.gameModal.classList.remove('active');
        this.elements.gameOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        this.currentGame = null;
        
        // Rafraîchir la grille pour mettre à jour les high scores
        this.generateGamesGrid();
        
        console.log('[ArcadeCollection] Jeu fermé');
    }

    /**
     * Toggle pause
     */
    togglePause() {
        if (this.engine) {
            this.engine.togglePause();
        }
    }

    /**
     * Reprendre le jeu
     */
    resumeGame() {
        if (this.engine) {
            this.engine.resume();
            this.hideOverlay();
        }
    }

    /**
     * Redémarrer le jeu
     */
    restartGame() {
        if (this.engine) {
            this.hideOverlay();
            this.engine.restart();
        }
    }

    /**
     * Toggle son
     */
    toggleSound() {
        const muted = Utils.audio.toggleMute();
        this.elements.soundToggle.innerHTML = muted ? `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="1" y1="1" x2="23" y2="23"/>
                <path d="M9 9v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h0a2 2 0 0 0-2-2"/>
                <path d="M15 4l-4 4"/>
                <path d="M19 8l-4 4"/>
            </svg>
        ` : `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
        `;
    }

    /**
     * Afficher l'écran de pause
     */
    showPause() {
        this.elements.overlayTitle.textContent = '⏸️ Pause';
        this.elements.overlayMessage.textContent = 'Prenez une pause, respirez un coup!';
        this.elements.overlayStats.innerHTML = '';
        this.elements.resumeBtn.style.display = 'inline-flex';
        this.elements.restartBtn.style.display = 'inline-flex';
        this.elements.gameOverlay.classList.add('active');
    }

    /**
     * Afficher l'écran de game over
     */
    showGameOver(data) {
        const isWin = data.score > 0;
        
        this.elements.overlayTitle.textContent = isWin ? '🎮 Game Over' : '💥 Game Over';
        this.elements.overlayMessage.textContent = isWin 
            ? `Bien joué! Score final: ${Utils.formatScore(data.score)}`
            : 'Pas de chance! Essayez encore!';
        
        this.elements.overlayStats.innerHTML = `
            <div class="overlay-stat">
                <span class="overlay-stat-value">${Utils.formatScore(data.score)}</span>
                <span class="overlay-stat-label">Score</span>
            </div>
        `;
        
        this.elements.resumeBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-flex';
        this.elements.gameOverlay.classList.add('active');
    }

    /**
     * Masquer l'overlay
     */
    hideOverlay() {
        this.elements.gameOverlay.classList.remove('active');
    }

    /**
     * Toggle plein écran
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Erreur plein écran: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Charger et afficher les scores
     */
    loadScores() {
        this.refreshScores();
    }

    /**
     * Rafraîchir l'affichage des scores
     */
    refreshScores() {
        const container = this.elements.scoresContainer;
        const allScores = Utils.storage.getScores();
        
        // Aplatir et trier les scores
        let flatScores = [];
        
        for (const [gameId, scores] of Object.entries(allScores)) {
            const gameConfig = this.gamesConfig.find(g => g.id === gameId);
            const gameName = gameConfig ? `${gameConfig.icon} ${gameConfig.name}` : gameId;
            
            scores.forEach((scoreData, index) => {
                flatScores.push({
                    rank: index + 1,
                    game: gameName,
                    score: scoreData.score,
                    date: new Date(scoreData.date).toLocaleDateString('fr-FR')
                });
            });
        }
        
        // Trier par score décroissant
        flatScores.sort((a, b) => b.score - a.score);
        // Garder seulement les 20 meilleurs
        flatScores = flatScores.slice(0, 20);
        
        if (flatScores.length === 0) {
            container.innerHTML = `
                <div class="no-scores">
                    <span class="no-scores-icon">🏆</span>
                    <p>Jouez pour établir vos premiers records!</p>
                </div>
            `;
            return;
        }
        
        // Générer le tableau
        let html = `
            <table class="score-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Jeu</th>
                        <th>Score</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        flatScores.forEach(entry => {
            html += `
                <tr>
                    <td class="score-rank">#${entry.rank}</td>
                    <td class="score-game">${entry.game}</td>
                    <td class="score-value">${Utils.formatScore(entry.score)}</td>
                    <td class="score-date">${entry.date}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    /**
     * Gérer les touches clavier globales
     */
    handleGlobalKeyDown(e) {
        // Passer au moteur de jeu si un jeu est actif
        if (this.engine && this.currentGame) {
            this.engine.handleKeyDown(e);
        }
        
        // Échappement pour fermer le jeu ou le modal
        if (e.key === 'Escape') {
            if (this.elements.gameOverlay.classList.contains('active')) {
                if (this.engine && !this.engine.isGameOver) {
                    this.resumeGame();
                } else {
                    this.closeGame();
                }
            } else if (this.elements.gameModal.classList.contains('active')) {
                this.closeGame();
            }
        }
    }

    /**
     * Gérer le redimensionnement
     */
    handleResize() {
        if (this.engine) {
            this.engine.resizeCanvas();
        }
    }

    /**
     * Gérer le scroll
     */
    handleScroll() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}

// ============================================================
// INITIALISATION DE L'APPLICATION AU CHARGEMENT DE LA PAGE
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Attendre que toutes les ressources soient chargées
    window.addEventListener('load', () => {
        // Créer l'instance principale
        window.arcadeApp = new ArcadeCollection();
        
        console.log('%c🎮 Arcade Collection', 'font-size: 24px; font-weight: bold; color: #64b5f6;');
        console.log('%cChargé avec succès!', 'color: #81c784;');
        console.log('%cProfitez de 9 jeux rétro modernes!', 'color: #f48fb1;');
    });
});

// Export global
window.ArcadeCollection = ArcadeCollection;
