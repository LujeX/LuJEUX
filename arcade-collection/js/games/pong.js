// arcade-collection/js/games/pong.js

/**
 * ============================================
 * ARCADE COLLECTION - PONG
 * Classique jeu de tennis électronique
 * Contrôles: Souris ou Flèches (Joueur 1) / ZS (Joueur 2)
 * ============================================
 */

class PongGame extends BaseGame {
    constructor(ctx, width, height) {
        super(ctx, width, height);
        
        // Configuration du jeu
        this.config = {
            paddleWidth: 12,
            paddleHeight: 100,
            paddleSpeed: 8,
            ballSize: 12,
            ballSpeedInitial: 6,
            ballSpeedMax: 15,
            ballAcceleration: 0.2,
            winScore: 7
        };
        
        // État initialisé à false
        this.initialized = false;
        
        // Objets du jeu (seront initialisés dans init())
        this.ball = null;
        this.paddle1 = null;  // Joueur (gauche)
        this.paddle2 = null;  // IA (droite)
        
        // Scores
        this.score1 = 0;
        this.score2 = 0;
        
        // Mode de jeu
        this.isTwoPlayer = false;
        
        // Couleurs spécifiques au jeu
        this.colors = {
            ...this.colors,
            background: '#0a0a12',
            primary: '#64b5f6',
            secondary: '#81c784',
            accent: '#f48fb1',
            paddle1: '#64b5f6',
            paddle2: '#f48fb1',
            ball: '#ffffff'
        };
    }

    /**
     * Initialiser le jeu
     */
    init() {
        super.init();
        
        // Initialiser la balle au centre
        this.ball = {
            x: this.width / 2,
            y: this.height / 2,
            vx: this.config.ballSpeedInitial * (Math.random() > 0.5 ? 1 : -1),
            vy: this.config.ballSpeedInitial * (Math.random() - 0.5),
            size: this.config.ballSize,
            trail: []
        };
        
        // Initialiser les raquettes
        const paddleY = this.height / 2 - this.config.paddleHeight / 2;
        
        this.paddle1 = {
            x: 30,
            y: paddleY,
            width: this.config.paddleWidth,
            height: this.config.paddleHeight,
            score: 0,
            targetY: paddleY
        };
        
        this.paddle2 = {
            x: this.width - 30 - this.config.paddleWidth,
            y: paddleY,
            width: this.config.paddleWidth,
            height: this.config.paddleHeight,
            score: 0,
            targetY: paddleY
        };
        
        // Réinitialiser les scores
        this.score1 = 0;
        this.score2 = 0;
        this.score = 0;
        
        console.log('[Pong] Jeu initialisé');
    }

    /**
     * Mettre à jour le jeu
     */
    update(deltaTime) {
        if (this.gameOver) return;
        
        // Mettre à jour la balle
        this.updateBall();
        
        // Mettre à jour les raquettes
        this.updatePaddles(deltaTime);
        
        // Vérifier les collisions
        this.checkCollisions();
        
        // Vérifier les points
        this.checkScoring();
        
        // Vérifier la victoire
        if (this.score1 >= this.config.winScore || this.score2 >= this.config.winScore) {
            this.endGame();
        }
    }

    /**
     * Mettre à jour la position de la balle
     */
    updateBall() {
        // Ajouter à la traînée
        this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
        if (this.ball.trail.length > 10) {
            this.ball.trail.shift();
        }
        
        // Déplacer la balle
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
        
        // Rebond sur les bords haut/bas
        if (this.ball.y <= this.ball.size || this.ball.y >= this.height - this.ball.size) {
            this.ball.vy *= -1;
            this.ball.y = Utils.clamp(this.ball.y, this.ball.size, this.height - this.ball.size);
            Utils.audio.playBounce();
        }
    }

    /**
     * Mettre à jour les raquettes
     */
    updatePaddles(deltaTime) {
        // Raquette du joueur (suit la souris ou clavier)
        if (Utils.input.isKeyPressed('arrowup') || Utils.input.isKeyPressed('z')) {
            this.paddle1.targetY -= this.config.paddleSpeed;
        }
        if (Utils.input.isKeyPressed('arrowdown') || Utils.input.isKeyPressed('s')) {
            this.paddle1.targetY += this.config.paddleSpeed;
        }
        
        // Limiter la position cible
        this.paddle1.targetY = Utils.clamp(
            this.paddle1.targetY,
            0,
            this.height - this.paddle1.height
        );
        
        // Mouvement fluide vers la cible
        this.paddle1.y += (this.paddle1.targetY - this.paddle1.y) * 0.2;
        
        // Raquette de l'IA (ou joueur 2)
        if (!this.isTwoPlayer) {
            this.updateAI();
        } else {
            // Contrôles Joueur 2
            if (Utils.input.isKeyPressed('w') || Utils.input.isKeyPressed('up')) { // Up pour pavé numérique
                this.paddle2.targetY -= this.config.paddleSpeed;
            }
            if (Utils.input.isKeyPressed('down')) {
                this.paddle2.targetY += this.config.paddleSpeed;
            }
            
            this.paddle2.targetY = Utils.clamp(
                this.paddle2.targetY,
                0,
                this.height - this.paddle2.height
            );
        }
        
        this.paddle2.y += (this.paddle2.targetY - this.paddle2.y) * 0.15;
    }

    /**
     * IA pour la raquette 2
     */
    updateAI() {
        const paddleCenter = this.paddle2.y + this.paddle2.height / 2;
        const targetY = this.ball.y;
        
        // L'IA ne réagit que si la balle vient vers elle
        if (this.ball.vx > 0) {
            const diff = targetY - paddleCenter;
            const speed = 4 + Math.abs(this.ball.vx) * 0.3; // S'adapte à la vitesse
            
            if (Math.abs(diff) > 10) {
                this.paddle2.targetY += Math.sign(diff) * Math.min(speed, Math.abs(diff));
            }
        } else {
            // Retourner au centre quand la balle s'éloigne
            const centerDiff = (this.height / 2) - paddleCenter;
            this.paddle2.targetY += centerDiff * 0.02;
        }
        
        // Limiter
        this.paddle2.targetY = Utils.clamp(
            this.paddle2.targetY,
            0,
            this.height - this.paddle2.height
        );
    }

    /**
     * Vérifier les collisions
     */
    checkCollisions() {
        // Collision raquette 1 (gauche)
        if (
            this.ball.x - this.ball.size <= this.paddle1.x + this.paddle1.width &&
            this.ball.x + this.ball.size >= this.paddle1.x &&
            this.ball.y >= this.paddle1.y &&
            this.ball.y <= this.paddle1.y + this.paddle1.height &&
            this.ball.vx < 0
        ) {
            this.handlePaddleCollision(this.paddle1, 1);
        }
        
        // Collision raquette 2 (droite)
        if (
            this.ball.x + this.ball.size >= this.paddle2.x &&
            this.ball.x - this.ball.size <= this.paddle2.x + this.paddle2.width &&
            this.ball.y >= this.paddle2.y &&
            this.ball.y <= this.paddle2.y + this.paddle2.height &&
            this.ball.vx > 0
        ) {
            this.handlePaddleCollision(this.paddle2, -1);
        }
    }

    /**
     * Gérer la collision avec une raquette
     */
    handlePaddleCollision(paddle, direction) {
        // Calculer l'angle de rebond selon où la balle touche la raquette
        const relativeIntersectY = (paddle.y + paddle.height / 2) - this.ball.y;
        const normalizedRelativeY = relativeIntersectY / (paddle.height / 2);
        const bounceAngle = normalizedRelativeY * (Math.PI / 4); // Max 45°
        
        // Augmenter légèrement la vitesse
        const currentSpeed = Math.sqrt(this.ball.vx ** 2 + this.ball.vy ** 2);
        const newSpeed = Math.min(currentSpeed + this.config.ballAcceleration, this.config.ballSpeedMax);
        
        // Nouvelle vélocité
        this.ball.vx = direction * newSpeed * Math.cos(bounceAngle);
        this.ball.vy = -newSpeed * Math.sin(bounceAngle);
        
        // Sortir de la raquette
        this.ball.x = direction === 1 
            ? paddle.x + paddle.width + this.ball.size 
            : paddle.x - this.ball.size;
        
        Utils.audio.playBounce();
        this.addScore(1);
    }

    /**
     * Vérifier les points marqués
     */
    checkScoring() {
        // Point pour le joueur 2 (balle sort à gauche)
        if (this.ball.x < -this.ball.size) {
            this.score2++;
            this.resetBall(-1);
            Utils.audio.playError();
        }
        
        // Point pour le joueur 1 (balle sort à droite)
        if (this.ball.x > this.width + this.ball.size) {
            this.score1++;
            this.resetBall(1);
            Utils.audio.playSuccess();
        }
    }

    /**
     * Réinitialiser la balle après un point
     */
    resetBall(direction) {
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        this.ball.vx = this.config.ballSpeedInitial * direction;
        this.ball.vy = this.config.ballSpeedInitial * (Math.random() - 0.5);
        this.ball.trail = [];
    }

    /**
     * Rendre le jeu
     */
    render(ctx) {
        // Fond
        Utils.canvas.clear(ctx, this.width, this.height, this.colors.background);
        
        // Ligne centrale
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(this.width / 2, this.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Cercle central
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, 60, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Traînée de la balle
        this.ball.trail.forEach((pos, i) => {
            const alpha = (i / this.ball.trail.length) * 0.4;
            const size = this.ball.size * (i / this.ball.trail.length);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        });
        
        // Balle avec glow
        ctx.shadowColor = this.colors.ball;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.ball;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Raquette 1 (joueur)
        ctx.shadowColor = this.colors.paddle1;
        ctx.shadowBlur = 15;
        Utils.canvas.roundRect(
            ctx,
            this.paddle1.x,
            this.paddle1.y,
            this.paddle1.width,
            this.paddle1.height,
            6,
            this.colors.paddle1
        );
        ctx.shadowBlur = 0;
        
        // Raquette 2 (IA/Joueur 2)
        ctx.shadowColor = this.colors.paddle2;
        ctx.shadowBlur = 15;
        Utils.canvas.roundRect(
            ctx,
            this.paddle2.x,
            this.paddle2.y,
            this.paddle2.width,
            this.paddle2.height,
            6,
            this.colors.paddle2
        );
        ctx.shadowBlur = 0;
        
        // Scores
        this.drawScores();
    }

    /**
     * Dessiner les scores
     */
    drawScores() {
        const fontSize = Math.min(72, this.width / 8);
        
        // Score Joueur 1
        Utils.canvas.drawGlowText(this.ctx, this.score1.toString(), this.width / 4, this.height / 2, {
            font: `bold ${fontSize}px Orbitron`,
            color: 'rgba(100, 181, 246, 0.3)',
            glowColor: this.colors.paddle1,
            glowSize: 20
        });
        
        // Score Joueur 2
        Utils.canvas.drawGlowText(this.ctx, this.score2.toString(), (this.width / 4) * 3, this.height / 2, {
            font: `bold ${fontSize}px Orbitron`,
            color: 'rgba(244, 143, 177, 0.3)',
            glowColor: this.colors.paddle2,
            glowSize: 20
        });
    }

    /**
     * Gérer les touches pressées
     */
    handleKeyDown(e) {
        // R pour redémarrer
        if (e.key === 'r' && this.gameOver) {
            this.init();
        }
    }

    /**
     * Gérer le mouvement de souris (contrôle raquette 1)
     */
    handleMouseMove(pos) {
        this.paddle1.targetY = pos.y - this.paddle1.height / 2;
    }

    /**
     * Obtenir les instructions
     */
    getInstructions() {
        return `
            <strong>🎮 Pong</strong> - Le classique du tennis électronique!<br>
            <span style="color: var(--neon-blue)">🖱️ Souris</span> ou 
            <span style="color: var(--neon-green)">⬆️⬇️ Flèches/ZS</span> pour déplacer votre raquette | 
            Premier à <strong>${this.config.winScore}</strong> points gagne!
        `;
    }

    /**
     * Obtenir le score combiné
     */
    getScore() {
        return Math.max(this.score1, this.score2) * 100 + this.score;
    }
}

// Enregistrer le jeu
window.Games.pong = PongGame;
