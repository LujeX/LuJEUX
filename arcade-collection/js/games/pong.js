/**
 * ============================================
 * ARCADE ULTIMATE - PONG GAME
 * Le classique du tennis de table vs IA
 * ============================================
 */

class PongGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Configuration
        this.paddleWidth = 15;
        this.paddleHeight = 100;
        this.ballRadius = 10;
        this.winScore = 7;
        
        // Couleurs
        this.playerColor = '#4ade80';
        this.aiColor = '#ef4444';
        this.ballColor = '#ffffff';
        this.trailColor = 'rgba(233, 69, 96, 0.3)';
        
        // Système d'effets
        this.particles = new ParticleSystem(100);
        this.trailPositions = [];
        this.maxTrailLength = 15;
        
        // Initialiser
        this.init();
    }
    
    init() {
        // Position des paddles
        this.playerY = (this.height - this.paddleHeight) / 2;
        this.aiY = (this.height - this.paddleHeight) / 2;
        
        // Position X des paddles
        this.playerX = 30;
        this.aiX = this.width - 30 - this.paddleWidth;
        
        // Balle
        this.resetBall();
        
        // Score
        this.playerScore = 0;
        this.aiScore = 0;
        this.score = 0; // Score du joueur pour l'affichage
        
        // Vitesse de la balle
        this.baseBallSpeed = 6;
        this.maxBallSpeed = 16;
        this.ballSpeedX = this.baseBallSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ballSpeedY = (Math.random() - 0.5) * 4;
        
        // Configuration IA
        this.aiSpeed = 5;
        this.aiReactionDelay = 0.08; // Marge d'erreur pour ne pas être parfait
        this.aiTargetY = this.height / 2;
        this.aiPredictionError = 0;
        
        // Stats
        this.rallyCount = 0;
        this.maxRally = 0;
        this.totalHits = 0;
        
        // Effets visuels
        this.screenShake = { x: 0, y: 0, intensity: 0 };
        this.flashAlpha = 0;
        this.hitEffect = { active: false, x: 0, y: 0, timer: 0 };
        
        // État
        this.gameOver = false;
        this.gameState = GAME_STATES.IDLE;
        
        // Compteur avant début
        this.countdown = 3;
        this.countdownTimer = 0;
        this.isCountingDown = true;
    }
    
    resetBall(scorer = null) {
        this.ballX = this.width / 2;
        this.ballY = this.height / 2;
        
        // Direction basée sur qui a marqué (ou aléatoire au début)
        const direction = scorer === 'player' ? 1 : 
                          scorer === 'ai' ? -1 : 
                          (Math.random() > 0.5 ? 1 : -1);
        
        this.ballSpeedX = this.baseBallSpeed * direction;
        this.ballSpeedY = (Math.random() - 0.5) * 6;
        
        // Reset trail
        this.trailPositions = [];
        
        // Reset rally
        if (this.rallyCount > this.maxRally) {
            this.maxRally = this.rallyCount;
        }
        this.rallyCount = 0;
    }
    
    update(dt) {
        super.update(dt);
        
        if (this.gameOver) return;
        
        // Countdown au début
        if (this.isCountingDown) {
            this.countdownTimer += dt;
            if (this.countdownTimer >= 1) {
                this.countdownTimer = 0;
                this.countdown--;
                
                if (this.countdown <= 0) {
                    this.isCountingDown = false;
                    this.gameState = GAME_STATES.PLAYING;
                }
            }
            
            // Mettre à jour quand même les positions pour l'affichage
            this.updateAI(dt);
            return;
        }
        
        // Mise à jour particules
        this.particles.update(dt);
        
        // Mouvement du joueur (déjà géré par handleKey)
        // Limiter la position du joueur
        this.playerY = MathUtils.clamp(this.playerY, 0, this.height - this.paddleHeight);
        
        // Mouvement de la balle
        this.updateBall(dt);
        
        // Mouvement de l'IA
        this.updateAI(dt);
        
        // Effets visuels
        this.updateEffects(dt);
        
        // Trail de la balle
        this.updateTrail();
        
        // Mettre à jour le score affiché
        if (this.engine) {
            this.engine.score = this.playerScore;
            this.engine.updateScoreDisplay();
        }
    }
    
    updateBall(dt) {
        // Déplacer la balle
        this.ballX += this.ballSpeedX;
        this.ballY += this.ballSpeedY;
        
        // Collision avec le haut/bas
        if (this.ballY - this.ballRadius <= 0) {
            this.ballY = this.ballRadius;
            this.ballSpeedY *= -1;
            this.createWallHitEffect(this.ballX, 0);
        } else if (this.ballY + this.ballRadius >= this.height) {
            this.ballY = this.height - this.ballRadius;
            this.ballSpeedY *= -1;
            this.createWallHitEffect(this.ballX, this.height);
        }
        
        // Collision avec paddle du joueur
        if (this.ballX - this.ballRadius <= this.playerX + this.paddleWidth &&
            this.ballX + this.ballRadius >= this.playerX &&
            this.ballY + this.ballRadius >= this.playerY &&
            this.ballY - this.ballRadius <= this.playerY + this.paddleHeight &&
            this.ballSpeedX < 0) {
            
            this.handlePaddleHit('player');
        }
        
        // Collision avec paddle de l'IA
        if (this.ballX + this.ballRadius >= this.aiX &&
            this.ballX - this.ballRadius <= this.aiX + this.paddleWidth &&
            this.ballY + this.ballRadius >= this.aiY &&
            this.ballY - this.ballRadius <= this.aiY + this.paddleHeight &&
            this.ballSpeedX > 0) {
            
            this.handlePaddleHit('ai');
        }
        
        // Point marqué
        if (this.ballX < -50) {
            this.aiScore++;
            this.handleScore('ai');
        } else if (this.ballX > this.width + 50) {
            this.playerScore++;
            this.handleScore('player');
        }
    }
    
    handlePaddleHit(paddle) {
        const isPlayer = paddle === 'player';
        const paddleY = isPlayer ? this.playerY : this.aiY;
        const paddleCenter = paddleY + this.paddleHeight / 2;
        
        // Calculer où la balle touche la paddle (-1 à 1)
        const hitPos = (this.ballY - paddleCenter) / (this.paddleHeight / 2);
        hitPos = MathUtils.clamp(hitPos, -1, 1);
        
        // Inverser direction X et ajuster angle
        this.ballSpeedX *= -1.05; // Légère accélération
        
        // Ajuster vitesse Y selon point d'impact
        this.ballSpeedY = hitPos * 8;
        
        // Sortir la balle du paddle pour éviter les collisions multiples
        if (isPlayer) {
            this.ballX = this.playerX + this.paddleWidth + this.ballRadius + 1;
        } else {
            this.ballX = this.aiX - this.ballRadius - 1;
        }
        
        // Limiter la vitesse max
        const currentSpeed = Math.sqrt(this.ballSpeedX ** 2 + this.ballSpeedY ** 2);
        if (currentSpeed > this.maxBallSpeed) {
            const scale = this.maxBallSpeed / currentSpeed;
            this.ballSpeedX *= scale;
            this.ballSpeedY *= scale;
        }
        
        // Effets
        this.rallyCount++;
        this.totalHits++;
        this.createHitEffect(this.ballX, this.ballY, isPlayer ? this.playerColor : this.aiColor);
        
        // Screen shake léger
        this.screenShake.intensity = 3;
        
        // Son
        if (this.engine?.soundManager) {
            this.engine.soundManager.playClick();
        }
    }
    
    handleScore(scorer) {
        // Effet spectaculaire
        this.screenShake.intensity = 15;
        this.triggerFlash(scorer === 'player' ? '#4ade80' : '#ef4444', 0.3);
        
        // Particules
        const effectX = scorer === 'player' ? this.width - 100 : 100;
        this.particles.emit(effectX, this.height / 2, {
            count: 30,
            speed: 8,
            size: 6,
            colors: scorer === 'player' ? 
                ['#4ade80', '#22c55e', '#ffffff'] :
                ['#ef4444', '#dc2626', '#ffffff'],
            life: 1,
            gravity: 150,
            spread: Math.PI * 2
        });
        
        // Son
        if (scorer === 'player') {
            if (this.engine?.soundManager) this.engine.soundManager.playCoin();
        } else {
            if (this.engine?.soundManager) this.engine.soundManager.playGameOver();
        }
        
        // Vérifier victoire
        if (this.playerScore >= this.winScore || this.aiScore >= this.winScore) {
            this.gameOver = true;
            
            setTimeout(() => {
                if (this.playerScore >= this.winScore) {
                    this.endGame(true, '🎉 VICTOIRE!', '🏆');
                } else {
                    this.endGame(false, '🤖 VICTOIRE IA', '🤖');
                }
            }, 800);
        } else {
            // Reset ball après un délai
            setTimeout(() => this.resetBall(scorer), 1000);
        }
        
        // Désactiver temporairement la balle
        this.ballX = scorer === 'player' ? this.width + 100 : -100;
    }
    
    updateAI(dt) {
        // Prédire où la balle va arriver
        let targetY = this.height / 2;
        
        if (this.ballSpeedX > 0) { // La balle vient vers l'IA
            // Calculer le temps d'arrivée approximatif
            const timeToReach = (this.aiX - this.ballX) / this.ballSpeedX;
            
            if (timeToReach > 0 && Number.isFinite(timeToReach)) {
                // Prédire position Y
                let predictedY = this.ballY + this.ballSpeedY * timeToReach;
                
                // Rebonds sur murs
                while (predictedY < 0 || predictedY > this.height) {
                    if (predictedY < 0) predictedY = -predictedY;
                    if (predictedY > this.height) predictedY = 2 * this.height - predictedY;
                }
                
                targetY = predictedY;
                
                // Ajouter une erreur pour ne pas être invincible
                this.aiPredictionError += (Math.random() - 0.5) * 30 * dt;
                this.aiPredictionError = MathUtils.clamp(this.aiPredictionError, -40, 40);
                targetY += this.aiPredictionError;
            }
        } else {
            // Retourner progressivement au centre
            targetY = this.height / 2;
            this.aiPredictionError *= 0.95; // Réduire l'erreur
        }
        
        // Mouvement vers la cible avec limitation de vitesse
        const aiCenter = this.aiY + this.paddleHeight / 2;
        const diff = targetY - aiCenter;
        
        if (Math.abs(diff) > 5) {
            const moveAmount = Math.sign(diff) * this.aiSpeed;
            this.aiY += moveAmount;
        }
        
        // Limiter position
        this.aiY = MathUtils.clamp(this.aiY, 0, this.height - this.paddleHeight);
    }
    
    updateEffects(dt) {
        // Screen shake decay
        if (this.screenShake.intensity > 0) {
            this.screenShake.intensity *= 0.85;
            if (this.screenShake.intensity < 0.5) {
                this.screenShake.intensity = 0;
            }
        }
        
        // Flash decay
        if (this.flashAlpha > 0) {
            this.flashAlpha -= dt * 3;
        }
        
        // Hit effect
        if (this.hitEffect.active) {
            this.hitEffect.timer -= dt;
            if (this.hitEffect.timer <= 0) {
                this.hitEffect.active = false;
            }
        }
    }
    
    updateTrail() {
        // Ajouter position actuelle
        this.trailPositions.unshift({ x: this.ballX, y: this.ballY });
        
        // Limiter la longueur
        if (this.trailPositions.length > this.maxTrailLength) {
            this.trailPositions.pop();
        }
    }
    
    createHitEffect(x, y, color) {
        this.hitEffect = { active: true, x, y, timer: 0.2, color };
        
        this.particles.emit(x, y, {
            count: 12,
            speed: 5,
            size: 4,
            colors: [color, '#ffffff'],
            life: 0.4,
            spread: Math.PI * 0.8
        });
    }
    
    createWallHitEffect(x, y) {
        this.particles.emit(x, y, {
            count: 6,
            speed: 3,
            size: 3,
            colors: ['#94a3b8'],
            life: 0.3,
            spread: Math.PI * 0.5,
            direction: y < this.height / 2 ? Math.PI / 2 : -Math.PI / 2
        });
    }
    
    triggerFlash(color, alpha) {
        this.flashAlpha = alpha;
        this.flashColor = color;
    }
    
    render() {
        const ctx = this.ctx;
        
        ctx.save();
        
        // Appliquer screen shake
        if (this.screenShake.intensity > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake.intensity * 2;
            const shakeY = (Math.random() - 0.5) * this.screenShake.intensity * 2;
            ctx.translate(shakeX, shakeY);
        }
        
        // Fond
        this.renderBackground(ctx);
        
        // Ligne centrale
        this.renderCenterLine(ctx);
        
        // Scores
        this.renderScores(ctx);
        
        // Trail de la balle
        this.renderTrail(ctx);
        
        // Paddles
        this.renderPaddle(ctx, this.playerX, this.playerY, this.playerColor, true);
        this.renderPaddle(ctx, this.aiX, this.aiY, this.aiColor, false);
        
        // Balle
        this.renderBall(ctx);
        
        // Hit effect
        if (this.hitEffect.active) {
            ctx.strokeStyle = this.hitEffect.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = this.hitEffect.timer / 0.2;
            ctx.beginPath();
            ctx.arc(this.hitEffect.x, this.hitEffect.y, 30, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        // Particules
        this.particles.render(ctx);
        
        // Flash effect
        if (this.flashAlpha > 0) {
            ctx.fillStyle = `${this.flashColor}${Math.floor(this.flashAlpha * 255).toString(16).padStart(2, '0')}`;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // Countdown
        if (this.isCountingDown) {
            this.renderCountdown(ctx);
        }
        
        // Rally counter
        if (!this.isCountingDown && !this.gameOver) {
            ctx.font = '14px Rajdhani';
            ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
            ctx.textAlign = 'center';
            ctx.fillText(`Rally: ${this.rallyCount} | Max: ${this.maxRally}`, this.width / 2, this.height - 20);
            ctx.textAlign = 'left';
        }
        
        ctx.restore();
    }
    
    renderBackground(ctx) {
        // Gradient sombre
        const gradient = ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width * 0.7
        );
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0f0f17');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Grille subtile
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.height);
            ctx.stroke();
        }
    }
    
    renderCenterLine(ctx) {
        ctx.setLineDash([20, 15]);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(this.width / 2, this.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Cercle central
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, 50, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    renderScores(ctx) {
        // Score joueur
        ctx.font = 'bold 72px Orbitron';
        ctx.fillStyle = this.playerColor;
        ctx.textAlign = 'center';
        ctx.fillText(this.playerScore.toString(), this.width / 4, 90);
        
        // Label
        ctx.font = '16px Rajdhani';
        ctx.fillStyle = 'rgba(74, 222, 128, 0.5)';
        ctx.fillText('VOUS', this.width / 4, 120);
        
        // Score IA
        ctx.font = 'bold 72px Orbitron';
        ctx.fillStyle = this.aiColor;
        ctx.fillText(this.aiScore.toString(), this.width * 3 / 4, 90);
        
        // Label
        ctx.font = '16px Rajdhani';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.fillText('IA', this.width * 3 / 4, 120);
        
        ctx.textAlign = 'left';
    }
    
    renderTrail(ctx) {
        for (let i = 0; i < this.trailPositions.length; i++) {
            const pos = this.trailPositions[i];
            const alpha = (1 - i / this.trailPositions.length) * 0.4;
            const size = this.ballRadius * (1 - i / this.trailPositions.length * 0.5);
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderPaddle(ctx, x, y, color, isPlayer) {
        // Ombre
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        RenderUtils.roundRect(ctx, x + 3, y + 3, this.paddleWidth, this.paddleHeight, 6);
        ctx.fill();
        
        // Gradient
        const gradient = ctx.createLinearGradient(x, y, x + this.paddleWidth, y);
        if (isPlayer) {
            gradient.addColorStop(0, '#86efac');
            gradient.addColorStop(0.5, color);
            gradient.addColorStop(1, '#22c55e');
        } else {
            gradient.addColorStop(0, '#fca5a5');
            gradient.addColorStop(0.5, color);
            gradient.addColorStop(1, '#dc2626');
        }
        
        ctx.fillStyle = gradient;
        RenderUtils.roundRect(ctx, x, y, this.paddleWidth, this.paddleHeight, 6);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        RenderUtils.roundRect(ctx, x + 2, y + 2, this.paddleWidth - 4, this.paddleHeight / 3, 4);
        ctx.fill();
    }
    
    renderBall(ctx) {
        // Glow
        const glowGradient = ctx.createRadialGradient(
            this.ballX, this.ballY, 0,
            this.ballX, this.ballY, this.ballRadius * 2.5
        );
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, this.ballRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Balle principale
        const ballGradient = ctx.createRadialGradient(
            this.ballX - 3, this.ballY - 3, 0,
            this.ballX, this.ballY, this.ballRadius
        );
        ballGradient.addColorStop(0, '#ffffff');
        ballGradient.addColorStop(1, '#e2e8f0');
        
        ctx.fillStyle = ballGradient;
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderCountdown(ctx) {
        if (this.countdown > 0) {
            ctx.font = 'bold 150px Orbitron';
            ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.countdown.toString(), this.width / 2, this.height / 2);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
        } else {
            ctx.font = 'bold 36px Orbitron';
            ctx.fillStyle = '#4ade80';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('GO!', this.width / 2, this.height / 2);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
        }
    }
    
    handleKey(key, code) {
        const speed = 18;
        
        switch (code) {
            case 'ArrowUp':
            case 'KeyW':
                this.playerY -= speed;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.playerY += speed;
                break;
        }
        
        // Limiter
        this.playerY = MathUtils.clamp(this.playerY, 0, this.height - this.paddleHeight);
    }
    
    handleMobileInput(direction, state) {
        const speed = 18;
        if (state === 'down') {
            if (direction === 'up') this.playerY -= speed;
            if (direction === 'down') this.playerY += speed;
        }
        this.playerY = MathUtils.clamp(this.playerY, 0, this.height - this.paddleHeight);
    }
}
