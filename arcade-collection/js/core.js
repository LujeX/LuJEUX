// arcade-collection/js/core.js

/**
 * ============================================
 * ARCADE COLLECTION - MOTEUR DE JEU PRINCIPAL
 * Gestion du cycle de vie des jeux, rendu, et état
 * ============================================
 */

'use strict';

/**
 * Classe GameEngine - Moteur de jeu principal
 * Gère le cycle de vie, le rendu, l'état et les interactions
 */
class GameEngine {
    constructor() {
        // État du moteur
        this.currentGame = null;
        this.isRunning = false;
        this.isPaused = false;
        this.animationId = null;
        
        // Canvas et contexte
        this.canvas = null;
        this.ctx = null;
        
        // Configuration
        this.config = {
            targetFPS: 60,
            width: 800,
            height: 600
        };
        
        // Score actuel
        this.score = 0;
        
        // Callbacks
        this.callbacks = {
            onScoreUpdate: null,
            onGameOver: null,
            onPause: null,
            onResume: null
        };
        
        // Instance du jeu en cours
        this.gameInstance = null;
    }

    /**
     * Initialiser le moteur
     * @param {HTMLCanvasElement} canvas - Élément canvas à utiliser
     */
    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configurer la taille du canvas
        this.resizeCanvas();
        
        // Écouter le redimensionnement
        window.addEventListener('resize', Utils.debounce(() => this.resizeCanvas(), 250));
        
        console.log('[GameEngine] Initialisé');
    }

    /**
     * Redimensionner le canvas pour s'adapter au conteneur
     */
    resizeCanvas() {
        if (!this.canvas || !this.canvas.parentElement) return;
        
        const container = this.canvas.parentElement;
        const maxWidth = container.clientWidth - 40;
        const maxHeight = container.clientHeight - 40;
        
        // Maintenir le ratio d'aspect
        const aspectRatio = this.config.width / this.config.height;
        let width = Math.min(maxWidth, this.config.width);
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        
        // Mettre à jour le contexte
        this.ctx = this.canvas.getContext('2d');
        
        // Notifier le jeu si nécessaire
        if (this.gameInstance && typeof this.gameInstance.onResize === 'function') {
            this.gameInstance.onResize(width, height);
        }
    }

    /**
     * Charger un jeu
     * @param {string} gameName - Nom du jeu à charger
     * @returns {boolean} Succès du chargement
     */
    loadGame(gameName) {
        // Vérifier que le jeu existe
        if (!Games[gameName]) {
            console.error(`[GameEngine] Jeu "${gameName}" non trouvé`);
            return false;
        }
        
        this.currentGame = gameName;
        const GameClass = Games[gameName];
        
        // Créer une instance du jeu
        this.gameInstance = new GameClass(this.ctx, this.canvas.width, this.canvas.height);
        
        console.log(`[GameEngine] Jeu "${gameName}" chargé`);
        return true;
    }

    /**
     * Démarrer le jeu
     */
    start() {
        if (!this.gameInstance) {
            console.error('[GameEngine] Aucun jeu chargé');
            return false;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;
        
        // Réinitialiser l'audio
        Utils.audio.init();
        Utils.audio.resume();
        
        // Démarrer le jeu
        if (typeof this.gameInstance.init === 'function') {
            this.gameInstance.init();
        }
        
        // Démarrer la boucle de jeu
        this.lastTime = performance.now();
        this.gameLoop();
        
        console.log(`[GameEngine] Jeu démarré: ${this.currentGame}`);
        return true;
    }

    /**
     * Boucle de jeu principale
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // En secondes
        this.lastTime = currentTime;
        
        if (!this.isPaused) {
            // Mettre à jour le jeu
            if (typeof this.gameInstance.update === 'function') {
                this.gameInstance.update(deltaTime);
            }
            
            // Rendre le jeu
            if (typeof this.gameInstance.render === 'function') {
                this.gameInstance.render(this.ctx);
            }
            
            // Mettre à jour le score affiché
            if (typeof this.gameInstance.getScore === 'function') {
                const newScore = this.gameInstance.getScore();
                if (newScore !== this.score) {
                    this.score = newScore;
                    this.triggerCallback('onScoreUpdate', this.score);
                }
            }
            
            // Vérifier game over
            if (typeof this.gameInstance.isGameOver === 'function' && this.gameInstance.isGameOver()) {
                this.handleGameOver();
                return;
            }
        } else {
            // Rendre même en pause (pour montrer l'état figé)
            if (typeof this.gameInstance.render === 'function') {
                this.gameInstance.render(this.ctx);
            }
            
            // Dessiner l'overlay de pause
            this.drawPauseOverlay();
        }
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Dessiner l'overlay de pause
     */
    drawPauseOverlay() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Fond semi-transparent
        ctx.fillStyle = 'rgba(10, 10, 15, 0.7)';
        ctx.fillRect(0, 0, width, height);
        
        // Texte PAUSE
        Utils.canvas.drawGlowText(ctx, 'PAUSE', width / 2, height / 2, {
            font: 'bold 48px Orbitron',
            color: '#ffffff',
            glowColor: '#64b5f6',
            glowSize: 20
        });
        
        // Sous-texte
        ctx.font = '18px Rajdhani';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText('Appuyez sur ESC ou Espace pour reprendre', width / 2, height / 2 + 50);
    }

    /**
     * Mettre en pause
     */
    pause() {
        if (!this.isRunning || this.isPaused) return;
        
        this.isPaused = true;
        this.triggerCallback('onPause');
        console.log('[GameEngine] Jeu en pause');
    }

    /**
     * Reprendre après pause
     */
    resume() {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        this.lastTime = performance.now(); // Éviter un saut de temps
        this.triggerCallback('onResume');
        console.log('[GameEngine] Jeu repris');
    }

    /**
     * Toggle pause/reprise
     */
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    /**
     * Gérer le game over
     */
    handleGameOver() {
        this.isRunning = false;
        
        // Jouer le son de game over
        Utils.audio.playGameOver();
        
        // Sauvegarder le score
        if (this.currentGame && this.score > 0) {
            Utils.storage.saveScore(this.currentGame, this.score);
        }
        
        // Déclencher le callback
        this.triggerCallback('onGameOver', {
            score: this.score,
            game: this.currentGame
        });
        
        console.log(`[GameEngine] Game Over! Score: ${this.score}`);
    }

    /**
     * Redémarrer le jeu actuel
     */
    restart() {
        this.stop();
        this.loadGame(this.currentGame);
        this.start();
    }

    /**
     * Arrêter le jeu
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Nettoyer le jeu
        if (this.gameInstance && typeof this.gameInstance.destroy === 'function') {
            this.gameInstance.destroy();
        }
        
        this.score = 0;
        console.log('[GameEngine] Jeu arrêté');
    }

    /**
     * Obtenir les instructions du jeu actuel
     * @returns {string} Instructions formatées
     */
    getInstructions() {
        if (this.gameInstance && typeof this.gameInstance.getInstructions === 'function') {
            return this.gameInstance.getInstructions();
        }
        return '';
    }

    /**
     * Enregistrer un callback
     * @param {string} event - Nom de l'événement
     * @param {Function} callback - Fonction callback
     */
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        }
    }

    /**
     * Déclencher un callback
     * @param {string} event - Nom de l'événement
     * @param {*} data - Données à passer
     */
    triggerCallback(event, data) {
        if (typeof this.callbacks[event] === 'function') {
            this.callbacks[event](data);
        }
    }

    /**
     * Gérer les entrées clavier
     * @param {KeyboardEvent} e - Événement clavier
     */
    handleKeyDown(e) {
        // Contrôles globaux
        if (e.key === 'Escape' || e.code === 'Escape') {
            if (this.isRunning) {
                this.togglePause();
            }
            return;
        }
        
        if (e.key === ' ' || e.code === 'Space') {
            if (this.isRunning) {
                e.preventDefault(); // Empêcher le scroll
                this.togglePause();
            }
            return;
        }
        
        // Passer au jeu si pas en pause
        if (this.isRunning && !this.isPaused && this.gameInstance) {
            if (typeof this.gameInstance.handleKeyDown === 'function') {
                this.gameInstance.handleKeyDown(e);
            }
        }
    }

    /**
     * Gérer les entrées souris
     * @param {MouseEvent} e - Événement souris
     */
    handleMouseDown(e) {
        if (this.isRunning && !this.isPaused && this.gameInstance) {
            if (typeof this.gameInstance.handleMouseDown === 'function') {
                // Calculer la position relative au canvas
                const rect = this.canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
                const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
                
                this.gameInstance.handleMouseDown({ x, y, button: e.button });
            }
        }
    }

    /**
     * Gérer le mouvement de souris
     * @param {MouseEvent} e - Événement souris
     */
    handleMouseMove(e) {
        if (this.isRunning && !this.isPaused && this.gameInstance) {
            if (typeof this.gameInstance.handleMouseMove === 'function') {
                const rect = this.canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
                const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
                
                this.gameInstance.handleMouseMove({ x, y });
            }
        }
    }
}

/**
 * Classe BaseGame - Classe de base pour tous les jeux
 * Fournit une structure commune et des méthodes utilitaires
 */
class BaseGame {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.score = 0;
        this.gameOver = false;
        this.initialized = false;
        
        // Couleurs par défaut (peuvent être surchargées)
        this.colors = {
            background: '#0a0a0f',
            primary: '#64b5f6',
            secondary: '#81c784',
            accent: '#f48fb1',
            text: '#ffffff',
            textMuted: 'rgba(255, 255, 255, 0.6)'
        };
    }

    /**
     * Initialiser le jeu (à surcharger)
     */
    init() {
        this.initialized = true;
        this.gameOver = false;
        this.score = 0;
    }

    /**
     * Mettre à jour le jeu (à surcharger)
     * @param {number} deltaTime - Temps écoulé depuis la dernière frame
     */
    update(deltaTime) {
        // À implémenter dans les sous-classes
    }

    /**
     * Rendre le jeu (à surcharger)
     * @param {CanvasRenderingContext2D} ctx - Contexte de rendu
     */
    render(ctx) {
        // Effacer le canvas
        Utils.canvas.clear(ctx, this.width, this.height, this.colors.background);
    }

    /**
     * Gérer les touches pressées (à surcharger)
     * @param {KeyboardEvent} e - Événement clavier
     */
    handleKeyDown(e) {
        // À implémenter dans les sous-classes
    }

    /**
     * Gérer les clics souris (à surcharger)
     * @param {Object} pos - Position {x, y, button}
     */
    handleMouseDown(pos) {
        // À implémenter dans les sous-classes
    }

    /**
     * Gérer le mouvement de souris (à surcharger)
     * @param {Object} pos - Position {x, y}
     */
    handleMouseMove(pos) {
        // À implémenter dans les sous-classes
    }

    /**
     * Redimensionnement du canvas
     * @param {number} width - Nouvelle largeur
     * @param {number} height - Nouvelle hauteur
     */
    onResize(width, height) {
        this.width = width;
        this.height = height;
    }

    /**
     * Obtenir le score actuel
     * @returns {number} Score
     */
    getScore() {
        return this.score;
    }

    /**
     * Vérifier si le jeu est terminé
     * @returns {boolean} Game over
     */
    isGameOver() {
        return this.gameOver;
    }

    /**
     * Obtenir les instructions du jeu
     * @returns {string} Instructions HTML
     */
    getInstructions() {
        return '<p>Utilisez le clavier ou la souris pour jouer</p>';
    }

    /**
     * Nettoyage lors de la destruction
     */
    destroy() {
        // À implémenter si nécessaire
    }

    /**
     * Ajouter des points au score
     * @param {number} points - Points à ajouter
     */
    addScore(points) {
        this.score += points;
    }

    /**
     * Terminer le jeu
     */
    endGame() {
        this.gameOver = true;
    }

    /**
     * Dessiner le score sur le canvas
     */
    drawScore() {
        Utils.canvas.drawGlowText(this.ctx, `Score: ${Utils.formatScore(this.score)}`, 50, 30, {
            font: 'bold 20px Orbitron',
            color: this.colors.text,
            glowColor: this.colors.primary,
            glowSize: 10,
            align: 'left'
        });
    }

    /**
     * Dessiner l'écran de game over
     */
    drawGameOver() {
        const ctx = this.ctx;
        
        // Fond semi-transparent
        ctx.fillStyle = 'rgba(10, 10, 15, 0.85)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Texte GAME OVER
        Utils.canvas.drawGlowText(ctx, 'GAME OVER', this.width / 2, this.height / 2 - 30, {
            font: 'bold 48px Orbitron',
            color: '#f48fb1',
            glowColor: '#f48fb1',
            glowSize: 25
        });
        
        // Score final
        Utils.canvas.drawGlowText(ctx, `Score: ${Utils.formatScore(this.score)}`, this.width / 2, this.height / 2 + 30, {
            font: 'bold 28px Orbitron',
            color: '#fff176',
            glowColor: '#fff176',
            glowSize: 15
        });
        
        // Instruction
        ctx.font = '16px Rajdhani';
        ctx.fillStyle = this.colors.textMuted;
        ctx.textAlign = 'center';
        ctx.fillText('Appuyez sur R pour recommencer ou ESC pour quitter', this.width / 2, this.height / 2 + 80);
    }
}

// Registre global des jeux
window.Games = {};
window.BaseGame = BaseGame;
window.GameEngine = GameEngine;
