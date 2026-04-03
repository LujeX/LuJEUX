// arcade-collection/js/games/airHockey.js

/**
 * ============================================
 * ARCADE COLLECTION - AIR HOCKEY
 * Jeu de hockey sur table virtuel
 * Contrôles: Souris pour déplacer la raquette du joueur
 * ============================================
 */

class AirHockeyGame extends BaseGame {
    constructor(ctx, width, height) {
        super(ctx, width, height);
        
        // Configuration
        this.config = {
            paddleRadius: 35,
            puckRadius: 18,
            goalWidth: 150,
            maxPuckSpeed: 15,
            paddleFriction: 0.98,
            puckFriction: 0.995,
            bounceEnergy: 0.9,
            winScore: 7,
            aiSpeed: 4,
            aiReactionDelay: 0.1,
            aiDifficulty: 0.85 // 0-1, plus élevé = plus difficile
        };
        
        // État du jeu (initialisé dans init())
        this.player = null;
        this.ai = null;
        this.puck = null;
        
        // Scores
        this.playerScore = 0;
        this.aiScore = 0;
        
        // IA
        this.aiTargetX = null;
        this.aiTargetY = null;
        this.aiLastUpdate = 0;
        
        // But récent pour l'animation
        this.lastScorer = null;
        this.goalAnimationTimer = 0;
        
        // Traînée du palet
        this.puckTrail = [];
        
        // Couleurs
        this.colors = {
            ...this.colors,
            background: '#1a1a2e',
            rink: '#16213e',
            border: '#0f3460',
            centerLine: 'rgba(100, 181, 246, 0.3)',
            centerCircle: 'rgba(100, 181, 246, 0.2)',
            goalZone: 'rgba(239, 83, 80, 0.3)',
            player: '#64b5f6',
            ai: '#f48fb1',
            puck: '#ffffff',
            puckGlow: '#ffffff'
        };
    }

    /**
     * Initialiser le jeu
     */
    init() {
        super.init();
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Initialiser le joueur (en bas)
        this.player = {
            x: centerX,
            y: this.height - 80,
            vx: 0,
            vy: 0,
            radius: this.config.paddleRadius,
            targetX: centerX,
            targetY: this.height - 80
        };
        
        // Initialiser l'IA (en haut)
        this.ai = {
            x: centerX,
            y: 80,
            vx: 0,
            vy: 0,
            radius: this.config.paddleRadius
        };
        
        // Initialiser le palet au centre
        this.puck = {
            x: centerX,
            y: centerY,
            vx: 0,
            vy: 0,
            radius: this.config.puckRadius
        };
        
        // Réinitialiser les scores
        this.playerScore = 0;
        this.aiScore = 0;
        this.score = 0;
        
        // Réinitialiser l'état
        this.goalAnimationTimer = 0;
        this.lastScorer = null;
        this.puckTrail = [];
        this.aiLastUpdate = 0;
        
        console.log('[AirHockey] Jeu initialisé');
    }

    /**
     * Mettre à jour le jeu
     */
    update(deltaTime) {
        if (this.gameOver) return;
        
        // Animation de but
        if (this.goalAnimationTimer > 0) {
            this.goalAnimationTimer -= deltaTime;
            return; // Pause pendant l'animation de but
        }
        
        // Mettre à jour le joueur (suit la souris)
        this.updatePlayer(deltaTime);
        
        // Mettre à jour l'IA
        this.updateAI(deltaTime);
        
        // Mettre à jour le palet
        this.updatePuck(deltaTime);
        
        // Vérifier les collisions
        this.checkCollisions();
        
        // Vérifier les buts
        this.checkGoals();
        
        // Mettre à jour la traînée
        this.updateTrail();
        
        // Vérifier la victoire
        if (this.playerScore >= this.config.winScore || this.aiScore >= this.config.winScore) {
            this.endGame();
        }
    }

    /**
     * Mettre à jour la position du joueur
     */
    updatePlayer(deltaTime) {
        // Mouvement fluide vers la cible (souris)
        const dx = this.player.targetX - this.player.x;
        const dy = this.player.targetY - this.player.y;
        
        // Limiter à la moitié inférieure du terrain
        const minY = this.height / 2 + this.player.radius;
        const maxY = this.height - this.player.radius - 20;
        const minX = this.player.radius + 10;
        const maxX = this.width - this.player.radius - 10;
        
        // Appliquer le mouvement avec lissage
        this.player.x += dx * 0.3;
        this.player.y += dy * 0.3;
        
        // Contraindre aux limites
        this.player.x = Utils.clamp(this.player.x, minX, maxX);
        this.player.y = Utils.clamp(this.player.y, minY, maxY);
        
        // Calculer la vélocité pour les collisions
        this.player.vx = dx * 0.3 / deltaTime;
        this.player.vy = dy * 0.3 / deltaTime;
    }

    /**
     * Mettre à jour l'IA
     */
    updateAI(deltaTime) {
        this.aiLastUpdate += deltaTime;
        
        // Mettre à jour la cible périodiquement (simuler un temps de réaction)
        if (this.aiLastUpdate >= this.config.aiReactionDelay) {
            this.aiLastUpdate = 0;
            
            // Stratégie de l'IA
            if (this.puck.vy < 0 || this.puck.y < this.height / 2) {
                // Le palet va vers l'IA ou est dans sa zone
                if (Math.random() > this.config.aiDifficulty * 0.3) {
                    // Prédire où le palet va arriver
                    const prediction = this.predictPuckPosition();
                    this.aiTargetX = prediction.x;
                    this.aiTargetY = Math.max(prediction.y, 40 + this.ai.radius);
                } else {
                    // Parfois l'IA fait une erreur
                    this.aiTargetX = this.puck.x + (Math.random() - 0.5) * 100;
                    this.aiTargetY = 60 + this.ai.radius;
                }
            } else {
                // Retourner à une position défensive
                this.aiTargetX = this.width / 2 + (Math.random() - 0.5) * 50;
                this.aiTargetY = 60 + this.ai.radius;
            }
        }
        
        // Se déplacer vers la cible
        if (this.aiTargetX !== null && this.aiTargetY !== null) {
            const dx = this.aiTargetX - this.ai.x;
            const dy = this.aiTargetY - this.ai.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 1) {
                const speed = Math.min(this.config.aiSpeed, dist * 0.1);
                this.ai.vx = (dx / dist) * speed;
                this.ai.vy = (dy / dist) * speed;
                
                this.ai.x += this.ai.vx;
                this.ai.y += this.ai.vy;
            } else {
                this.ai.vx = 0;
                this.ai.vy = 0;
            }
        }
        
        // Contraindre l'IA à sa zone (moitié supérieure)
        const minY = 20 + this.ai.radius;
        const maxY = this.height / 2 - this.ai.radius;
        const minX = this.ai.radius + 10;
        const maxX = this.width - this.ai.radius - 10;
        
        this.ai.x = Utils.clamp(this.ai.x, minX, maxX);
        this.ai.y = Utils.clamp(this.ai.y, minY, maxY);
    }

    /**
     * Prédire la position future du palet
     */
    predictPuckPosition() {
        let px = this.puck.x;
        let py = this.puck.y;
        let vx = this.puck.vx;
        let vy = this.puck.vy;
        
        // Simuler quelques frames en avant
        for (let i = 0; i < 30; i++) {
            px += vx;
            py += vy;
            
            // Rebonds sur les murs latéraux
            if (px <= this.puck.radius || px >= this.width - this.puck.radius) {
                vx *= -0.9;
            }
            
            // Arrêter si le palet atteint la zone de l'IA
            if (py <= this.height / 3) break;
        }
        
        return { x: px, y: py };
    }

    /**
     * Mettre à jour le palet
     */
    updatePuck(deltaTime) {
        // Appliquer la friction
        this.puck.vx *= this.config.puckFriction;
        this.puck.vy *= this.config.puckFriction;
        
        // Limiter la vitesse maximale
        const speed = Math.sqrt(this.puck.vx ** 2 + this.puck.vy ** 2);
        if (speed > this.config.maxPuckSpeed) {
            const scale = this.config.maxPuckSpeed / speed;
            this.puck.vx *= scale;
            this.puck.vy *= scale;
        }
        
        // Déplacer le palet
        this.puck.x += this.puck.vx;
        this.puck.y += this.puck.vy;
        
        // Rebond sur les murs latéraux
        if (this.puck.x <= this.puck.radius) {
            this.puck.x = this.puck.radius;
            this.puck.vx *= -this.config.bounceEnergy;
            Utils.audio.playBounce();
        }
        if (this.puck.x >= this.width - this.puck.radius) {
            this.puck.x = this.width - this.puck.radius;
            this.puck.vx *= -this.config.bounceEnergy;
            Utils.audio.playBounce();
        }
        
        // Rebond sur les murs haut/bas (hors des buts)
        const goalLeft = (this.width - this.config.goalWidth) / 2;
        const goalRight = (this.width + this.config.goalWidth) / 2;
        
        // Mur du haut (zone de l'IA)
        if (this.puck.y <= this.puck.radius) {
            if (this.puck.x < goalLeft || this.puck.x > goalRight) {
                this.puck.y = this.puck.radius;
                this.puck.vy *= -this.config.bounceEnergy;
                Utils.audio.playBounce();
            }
        }
        
        // Mur du bas (zone du joueur)
        if (this.puck.y >= this.height - this.puck.radius) {
            if (this.puck.x < goalLeft || this.puck.x > goalRight) {
                this.puck.y = this.height - this.puck.radius;
                this.puck.vy *= -this.config.bounceEnergy;
                Utils.audio.playBounce();
            }
        }
    }

    /**
     * Vérifier les collisions entre objets
     */
    checkCollisions() {
        // Collision palet-joueur
        this.checkPaddleCollision(this.player);
        
        // Collision palet-IA
        this.checkPaddleCollision(this.ai);
    }

    /**
     * Vérifier la collision entre le palet et une raquette
     */
    checkPaddleCollision(paddle) {
        const dx = this.puck.x - paddle.x;
        const dy = this.puck.y - paddle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = this.puck.radius + paddle.radius;
        
        if (distance < minDist && distance > 0) {
            // Normaliser le vecteur de collision
            const nx = dx / distance;
            const ny = dy / distance;
            
            // Séparer les objets
            const overlap = minDist - distance;
            this.puck.x += nx * overlap;
            this.puck.y += ny * overlap;
            
            // Calculer la nouvelle vélocité du palet
            const relVx = this.puck.vx - (paddle.vx || 0);
            const relVy = this.puck.vy - (paddle.vy || 0);
            
            const dotProduct = relVx * nx + relVy * ny;
            
            this.puck.vx = this.puck.vx - 2 * dotProduct * nx + (paddle.vx || 0) * 0.8;
            this.puck.vy = this.puck.vy - 2 * dotProduct * ny + (paddle.vy || 0) * 0.8;
            
            // Ajouter un peu d'énergie
            this.puck.vx *= 1.05;
            this.puck.vy *= 1.05;
            
            Utils.audio.playBounce();
            this.addScore(1);
        }
    }

    /**
     * Vérifier les buts
     */
    checkGoals() {
        const goalLeft = (this.width - this.config.goalWidth) / 2;
        const goalRight = (this.width + this.config.goalWidth) / 2;
        
        // But du joueur (palet sort en haut)
        if (this.puck.y <= -this.puck.radius && 
            this.puck.x > goalLeft && 
            this.puck.x < goalRight) {
            this.aiScore++;
            this.lastScorer = 'ai';
            this.goalAnimationTimer = 1.5;
            Utils.audio.playError();
            this.resetPuck(-1);
        }
        
        // But de l'IA (palet sort en bas)
        if (this.puck.y >= this.height + this.puck.radius && 
            this.puck.x > goalLeft && 
            this.puck.x < goalRight) {
            this.playerScore++;
            this.lastScorer = 'player';
            this.goalAnimationTimer = 1.5;
            Utils.audio.playSuccess();
            this.resetPuck(1);
        }
    }

    /**
     * Réinitialiser le palet après un but
     */
    resetPuck(direction) {
        this.puck.x = this.width / 2;
        this.puck.y = this.height / 2;
        this.puck.vx = (Math.random() - 0.5) * 3;
        this.puck.vy = direction * 3;
        this.puckTrail = [];
    }

    /**
     * Mettre à jour la traînée du palet
     */
    updateTrail() {
        // Ajouter la position actuelle
        this.puckTrail.push({ x: this.puck.x, y: this.puck.y });
        
        // Garder seulement les dernières positions
        while (this.puckTrail.length > 15) {
            this.puckTrail.shift();
        }
    }

    /**
     * Rendre le jeu
     */
    render(ctx) {
        // Fond
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Dessiner la patinoire
        this.drawRink(ctx);
        
        // Dessiner la traînée du palet
        this.drawTrail(ctx);
        
        // Dessiner le palet
        this.drawPuck(ctx);
        
        // Dessiner les raquettes
        this.drawPaddle(ctx, this.player, this.colors.player);
        this.drawPaddle(ctx, this.ai, this.colors.ai);
        
        // Dessiner les scores
        this.drawScores(ctx);
        
        // Animation de but
        if (this.goalAnimationTimer > 0) {
            this.drawGoalAnimation(ctx);
        }
    }

    /**
     * Dessiner la patinoire
     */
    drawRink(ctx) {
        const padding = 15;
        
        // Fond de la patinoire
        ctx.fillStyle = this.colors.rink;
        Utils.canvas.roundRect(
            ctx,
            padding,
            padding,
            this.width - padding * 2,
            this.height - padding * 2,
            20,
            this.colors.rink,
            this.colors.border
        );
        
        // Ligne centrale
        ctx.strokeStyle = this.colors.centerLine;
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(padding, this.height / 2);
        ctx.lineTo(this.width - padding, this.height / 2);
        ctx.stroke();
        
        // Cercle central
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, 60, 0, Math.PI * 2);
        ctx.strokeStyle = this.colors.centerCircle;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Point central
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, 5, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.centerCircle;
        ctx.fill();
        
        // Zones de but
        const goalLeft = (this.width - this.config.goalWidth) / 2;
        const goalRight = (this.width + this.config.goalWidth) / 2;
        
        // But du haut (IA)
        ctx.fillStyle = this.colors.goalZone;
        ctx.fillRect(goalLeft, padding, this.config.goalWidth, 25);
        
        // But du bas (Joueur)
        ctx.fillRect(goalLeft, this.height - padding - 25, this.config.goalWidth, 25);
        
        // Bordures des buts
        ctx.strokeStyle = '#ef5350';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(goalLeft, padding);
        ctx.lineTo(goalLeft, padding + 30);
        ctx.moveTo(goalRight, padding);
        ctx.lineTo(goalRight, padding + 30);
        ctx.moveTo(goalLeft, this.height - padding);
        ctx.lineTo(goalLeft, this.height - padding - 30);
        ctx.moveTo(goalRight, this.height - padding);
        ctx.lineTo(goalRight, this.height - padding - 30);
        ctx.stroke();
    }

    /**
     * Dessiner la traînée du palet
     */
    drawTrail(ctx) {
        if (this.puckTrail.length < 2) return;
        
        for (let i = 0; i < this.puckTrail.length - 1; i++) {
            const alpha = (i / this.puckTrail.length) * 0.4;
            const size = (i / this.puckTrail.length) * this.puck.radius;
            
            ctx.beginPath();
            ctx.arc(this.puckTrail[i].x, this.puckTrail[i].y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        }
    }

    /**
     * Dessiner le palet
     */
    drawPuck(ctx) {
        // Glow effect
        ctx.shadowColor = this.colors.puckGlow;
        ctx.shadowBlur = 20;
        
        // Corps du palet
        const gradient = ctx.createRadialGradient(
            this.puck.x - this.puck.radius * 0.3,
            this.puck.y - this.puck.radius * 0.3,
            0,
            this.puck.x,
            this.puck.y,
            this.puck.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.8, '#e0e0e0');
        gradient.addColorStop(1, '#bdbdbd');
        
        ctx.beginPath();
        ctx.arc(this.puck.x, this.puck.y, this.puck.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Détail intérieur
        ctx.beginPath();
        ctx.arc(this.puck.x, this.puck.y, this.puck.radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }

    /**
     * Dessiner une raquette
     */
    drawPaddle(ctx, paddle, color) {
        // Glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        
        // Corps principal
        const gradient = ctx.createRadialGradient(
            paddle.x - paddle.radius * 0.3,
            paddle.y - paddle.radius * 0.3,
            0,
            paddle.x,
            paddle.y,
            paddle.radius
        );
        gradient.addColorStop(0, this.lightenColor(color, 30));
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, this.darkenColor(color, 20));
        
        ctx.beginPath();
        ctx.arc(paddle.x, paddle.y, paddle.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Bordure
        ctx.strokeStyle = this.lightenColor(color, 50);
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Poignée centrale
        ctx.beginPath();
        ctx.arc(paddle.x, paddle.y, paddle.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = this.darkenColor(color, 30);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }

    /**
     * Dessiner les scores
     */
    drawScores(ctx) {
        const fontSize = Math.min(48, this.width / 12);
        
        // Score IA (en haut)
        Utils.canvas.drawGlowText(ctx, this.aiScore.toString(), this.width / 2, 70, {
            font: `bold ${fontSize}px Orbitron`,
            color: 'rgba(244, 143, 177, 0.4)',
            glowColor: this.colors.ai,
            glowSize: 20
        });
        
        // Score Joueur (en bas)
        Utils.canvas.drawGlowText(ctx, this.playerScore.toString(), this.width / 2, this.height - 50, {
            font: `bold ${fontSize}px Orbitron`,
            color: 'rgba(100, 181, 246, 0.4)',
            glowColor: this.colors.player,
            glowSize: 20
        });
    }

    /**
     * Dessiner l'animation de but
     */
    drawGoalAnimation(ctx) {
        const alpha = this.goalAnimationTimer / 1.5;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Flash
        ctx.fillStyle = this.lastScorer === 'player' ? 'rgba(100, 181, 246, 0.3)' : 'rgba(244, 143, 177, 0.3)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Texte GOAL!
        const text = this.lastScorer === 'player' ? '⚽ BUT!' : '😢 BUT ADVERSE!';
        Utils.canvas.drawGlowText(ctx, text, this.width / 2, this.height / 2, {
            font: 'bold 56px Orbitron',
            color: '#ffffff',
            glowColor: this.lastScorer === 'player' ? this.colors.player : this.colors.ai,
            glowSize: 30
        });
        
        ctx.restore();
    }

    /**
     * Utilitaires de couleur
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `rgb(${R}, ${G}, ${B})`;
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `rgb(${R}, ${G}, ${B})`;
    }

    /**
     * Gérer le mouvement de souris
     */
    handleMouseMove(pos) {
        this.player.targetX = pos.x;
        this.player.targetY = pos.y;
    }

    /**
     * Gérer les touches pressées
     */
    handleKeyDown(e) {
        if (e.key === 'r' && this.gameOver) {
            this.init();
        }
    }

    /**
     * Obtenir les instructions
     */
    getInstructions() {
        return `
            <strong>🏒 Air Hockey</strong> - Hockey sur table!<br>
            <span style="color: var(--neon-blue)">🖱️ Déplacez la souris</span> pour contrôler votre raquette | 
            Marquez <strong>${this.config.winScore}</strong> buts pour gagner! | 
            Faites glisser le palet dans le but adverse!
        `;
    }
}

// Enregistrer le jeu
window.Games.airHockey = AirHockeyGame;
