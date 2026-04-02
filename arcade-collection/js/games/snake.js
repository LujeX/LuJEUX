/**
 * ============================================
 * ARCADE ULTIMATE - SNAKE GAME
 * Le serpent classique avec graphismes premium
 * ============================================
 */

class SnakeGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Configuration du jeu
        this.gridSize = 20;
        this.tileCount = Math.floor(canvas.width / this.gridSize);
        
        // Système de particules
        this.particles = new ParticleSystem(100);
        
        // Initialiser
        this.init();
    }
    
    init() {
        // Réinitialiser le serpent
        const centerX = Math.floor(this.tileCount / 2);
        const centerY = Math.floor(this.tileCount / 2);
        
        this.snake = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY }
        ];
        
        // Direction initiale
        this.direction = { ...DIRECTIONS.RIGHT };
        this.nextDirection = { ...DIRECTIONS.RIGHT };
        
        // Pomme
        this.apple = this.spawnApple();
        this.applePulse = 0;
        
        // Score et vitesse
        this.score = 0;
        this.baseSpeed = 8; // Cases par seconde
        this.currentSpeed = this.baseSpeed;
        this.moveTimer = 0;
        this.moveInterval = 1 / this.currentSpeed;
        
        // Effets visuels
        this.screenShake = { x: 0, y: 0, intensity: 0 };
        this.flashAlpha = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
        
        // Stats
        this.applesEaten = 0;
        this.maxCombo = 0;
        
        // État
        this.gameOver = false;
        this.gameState = GAME_STATES.IDLE;
    }
    
    spawnApple() {
        let pos;
        let attempts = 0;
        
        do {
            pos = {
                x: MathUtils.randomInt(0, this.tileCount - 1),
                y: MathUtils.randomInt(0, this.tileCount - 1)
            };
            attempts++;
        } while (this.snake.some(s => s.x === pos.x && s.y === pos.y) && attempts < 1000);
        
        return pos;
    }
    
    update(dt) {
        super.update(dt);
        
        if (this.gameOver || this.gameState !== GAME_STATES.PLAYING) return;
        
        // Mettre à jour les particules
        this.particles.update(dt);
        
        // Animation de pulsation de la pomme
        this.applePulse += dt * 5;
        
        // Timer combo
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.comboCount = 0;
            }
        }
        
        // Screen shake decay
        if (this.screenShake.intensity > 0) {
            this.screenShake.intensity *= 0.9;
            if (this.screenShake.intensity < 0.1) {
                this.screenShake.intensity = 0;
            }
        }
        
        // Flash decay
        if (this.flashAlpha > 0) {
            this.flashAlpha -= dt * 3;
        }
        
        // Mouvement du serpent
        this.moveTimer += dt;
        
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            this.moveSnake();
        }
    }
    
    moveSnake() {
        // Appliquer la prochaine direction
        this.direction = { ...this.nextDirection };
        
        // Calculer la nouvelle tête
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        // Vérifier collision avec les murs
        if (newHead.x < 0 || newHead.x >= this.tileCount ||
            newHead.y < 0 || newHead.y >= this.tileCount) {
            this.die();
            return;
        }
        
        // Vérifier collision avec soi-même
        if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            this.die();
            return;
        }
        
        // Ajouter la nouvelle tête
        this.snake.unshift(newHead);
        
        // Vérifier si on mange une pomme
        if (newHead.x === this.apple.x && newHead.y === this.apple.y) {
            this.eatApple(newHead);
        } else {
            // Sinon retirer la queue
            this.snake.pop();
        }
    }
    
    eatApple(headPos) {
        // Incrémenter score
        this.comboCount++;
        this.comboTimer = 2; // 2 secondes pour le combo
        
        const basePoints = 10;
        const comboMultiplier = Math.min(this.comboCount, 10);
        const points = basePoints * comboMultiplier;
        
        this.score += points;
        this.applesEaten++;
        
        if (this.comboCount > this.maxCombo) {
            this.maxCombo = this.comboCount;
        }
        
        // Effets visuels
        this.screenShake.intensity = 5 + this.comboCount;
        this.flashAlpha = 0.3;
        
        // Particules d'explosion
        const appleX = this.apple.x * this.gridSize + this.gridSize / 2;
        const appleY = this.apple.y * this.gridSize + this.gridSize / 2;
        
        this.particles.emit(appleX, appleY, {
            count: 15 + this.comboCount * 3,
            speed: 4,
            size: 4,
            colors: ['#ef4444', '#fbbf24', '#ffffff'],
            life: 0.6,
            gravity: 100,
            spread: Math.PI * 2
        });
        
        // Son (si disponible)
        if (this.engine && this.engine.soundManager) {
            this.engine.soundManager.playCoin();
        }
        
        // Nouvelle pomme
        this.apple = this.spawnApple();
        
        // Augmenter la vitesse progressivement
        this.currentSpeed = this.baseSpeed + Math.floor(this.applesEaten / 3) * 0.5;
        this.currentSpeed = Math.min(this.currentSpeed, 20); // Vitesse max
        this.moveInterval = 1 / this.currentSpeed;
        
        // Mettre à jour l'affichage du score
        if (this.engine) {
            this.engine.score = this.score;
            this.engine.updateScoreDisplay();
        }
    }
    
    die() {
        this.gameOver = true;
        this.gameState = GAME_STATES.GAME_OVER;
        
        // Effet de mort spectaculaire
        this.screenShake.intensity = 20;
        
        // Particules de mort
        for (const segment of this.snake) {
            const x = segment.x * this.gridSize + this.gridSize / 2;
            const y = segment.y * this.gridSize + this.gridSize / 2;
            
            this.particles.emit(x, y, {
                count: 8,
                speed: 6,
                size: 5,
                colors: ['#4ade80', '#22c55e', '#ffffff'],
                life: 1,
                gravity: 200,
                spread: Math.PI * 2
            });
        }
        
        // Son
        if (this.engine && this.engine.soundManager) {
            this.engine.soundManager.playGameOver();
        }
        
        // Afficher le résultat après un court délai pour voir l'animation
        setTimeout(() => {
            this.endGame(false, '💀 GAME OVER', '💀');
        }, 500);
    }
    
    render() {
        const ctx = this.ctx;
        
        // Appliquer screen shake
        ctx.save();
        if (this.screenShake.intensity > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake.intensity * 2;
            const shakeY = (Math.random() - 0.5) * this.screenShake.intensity * 2;
            ctx.translate(shakeX, shakeY);
        }
        
        // Fond
        this.renderBackground(ctx);
        
        // Grille
        this.renderGrid(ctx);
        
        // Pomme
        this.renderApple(ctx);
        
        // Serpent
        this.renderSnake(ctx);
        
        // Particules
        this.particles.render(ctx);
        
        // Flash effect
        if (this.flashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // Combo display
        if (this.comboCount > 1 && this.comboTimer > 0) {
            this.renderCombo(ctx);
        }
        
        // UI overlay
        this.renderUI(ctx);
        
        ctx.restore();
    }
    
    renderBackground(ctx) {
        // Dégradé radial sombre
        const gradient = ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 1.5
        );
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0a0a12');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
    }
    
    renderGrid(ctx) {
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            // Lignes verticales
            ctx.beginPath();
            ctx.moveTo(i * this.gridSize, 0);
            ctx.lineTo(i * this.gridSize, this.height);
            ctx.stroke();
            
            // Lignes horizontales
            ctx.beginPath();
            ctx.moveTo(0, i * this.gridSize);
            ctx.lineTo(this.width, i * this.gridSize);
            ctx.stroke();
        }
    }
    
    renderApple(ctx) {
        const x = this.apple.x * this.gridSize + this.gridSize / 2;
        const y = this.apple.y * this.gridSize + this.gridSize / 2;
        const baseRadius = this.gridSize / 2 - 3;
        const pulseRadius = baseRadius + Math.sin(this.applePulse) * 2;
        
        // Glow effect
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, pulseRadius * 2);
        glowGradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        glowGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, pulseRadius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Pomme principale
        const appleGradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, pulseRadius);
        appleGradient.addColorStop(0, '#fca5a5');
        appleGradient.addColorStop(0.7, '#ef4444');
        appleGradient.addColorStop(1, '#dc2626');
        
        ctx.fillStyle = appleGradient;
        ctx.beginPath();
        ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Brillance
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(x - pulseRadius * 0.3, y - pulseRadius * 0.3, pulseRadius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Tige
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y - pulseRadius);
        ctx.quadraticCurveTo(x + 3, y - pulseRadius - 5, x + 5, y - pulseRadius - 8);
        ctx.stroke();
        
        // Feuille
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(x + 6, y - pulseRadius - 7, 5, 3, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderSnake(ctx) {
        const len = this.snake.length;
        
        for (let i = len - 1; i >= 0; i--) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const size = this.gridSize - 2;
            
            // Calculer la couleur basée sur la position
            const t = i / len;
            const isHead = i === 0;
            
            let fillColor, strokeColor;
            
            if (isHead) {
                // Tête plus brillante
                const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
                gradient.addColorStop(0, '#86efac');
                gradient.addColorStop(1, '#4ade80');
                fillColor = gradient;
                strokeColor = '#22c55e';
            } else {
                // Corps avec dégradé
                const brightness = 1 - t * 0.6;
                const r = Math.floor(74 * brightness);
                const g = Math.floor(222 * brightness);
                const b = Math.floor(128 * brightness);
                
                fillColor = `rgb(${r}, ${g}, ${b})`;
                strokeColor = `rgb(${Math.floor(34 * brightness)}, ${Math.floor(197 * brightness)}, ${Math.floor(94 * brightness)})`;
            }
            
            // Dessiner le segment
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            
            RenderUtils.roundRect(ctx, x + 1, y + 1, size, size, isHead ? 8 : 5);
            ctx.fill();
            ctx.stroke();
            
            // Motif sur le corps (pas sur la tête)
            if (!isHead && i % 2 === 0) {
                ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
                ctx.beginPath();
                ctx.arc(x + size / 2 + 1, y + size / 2 + 1, size / 4, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Yeux sur la tête
            if (isHead) {
                this.renderSnakeEyes(ctx, x, y, size);
            }
        }
    }
    
    renderSnakeEyes(ctx, x, y, size) {
        const eyeSize = 4;
        const pupilSize = 2;
        const eyeOffset = size * 0.2;
        
        let eye1X, eye1Y, eye2X, eye2Y;
        
        switch (this.direction.x) {
            case 1: // Droite
                eye1X = x + size - eyeOffset;
                eye1Y = y + eyeOffset;
                eye2X = x + size - eyeOffset;
                eye2Y = y + size - eyeOffset;
                break;
            case -1: // Gauche
                eye1X = x + eyeOffset;
                eye1Y = y + eyeOffset;
                eye2X = x + eyeOffset;
                eye2Y = y + size - eyeOffset;
                break;
            default:
                switch (this.direction.y) {
                    case -1: // Haut
                        eye1X = x + eyeOffset;
                        eye1Y = y + eyeOffset;
                        eye2X = x + size - eyeOffset;
                        eye2Y = y + eyeOffset;
                        break;
                    case 1: // Bas
                        eye1X = x + eyeOffset;
                        eye1Y = y + size - eyeOffset;
                        eye2X = x + size - eyeOffset;
                        eye2Y = y + size - eyeOffset;
                        break;
                }
        }
        
        // Blanc des yeux
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupilles
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(eye1X + this.direction.x, eye1Y + this.direction.y, pupilSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eye2X + this.direction.x, eye2Y + this.direction.y, pupilSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderCombo(ctx) {
        const alpha = Math.min(1, this.comboTimer);
        const scale = 1 + (this.comboCount - 1) * 0.1;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.width / 2, 80);
        ctx.scale(scale, scale);
        
        // Texte combo
        ctx.font = 'bold 28px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Glow
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`${this.comboCount}x COMBO!`, 0, 0);
        
        ctx.restore();
    }
    
    renderUI(ctx) {
        // Afficher les stats en bas
        ctx.font = '14px Rajdhani';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.textAlign = 'left';
        ctx.fillText(`🍎 ${this.applesEaten}`, 15, this.height - 35);
        ctx.fillText(`⚡ ${this.currentSpeed.toFixed(1)}x`, 15, this.height - 18);
        
        if (this.maxCombo > 1) {
            ctx.fillText(`🔥 Max Combo: ${this.maxCombo}x`, 120, this.height - 26);
        }
    }
    
    handleKey(key, code) {
        switch (code) {
            case 'ArrowUp':
            case 'KeyW':
                if (this.direction.y !== 1) {
                    this.nextDirection = { ...DIRECTIONS.UP };
                }
                break;
            case 'ArrowDown':
            case 'KeyS':
                if (this.direction.y !== -1) {
                    this.nextDirection = { ...DIRECTIONS.DOWN };
                }
                break;
            case 'ArrowLeft':
            case 'KeyA':
                if (this.direction.x !== 1) {
                    this.nextDirection = { ...DIRECTIONS.LEFT };
                }
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (this.direction.x !== -1) {
                    this.nextDirection = { ...DIRECTIONS.RIGHT };
                }
                break;
        }
    }
    
    handleMobileInput(direction, state) {
        if (state === 'down') {
            switch (direction) {
                case 'up':
                    if (this.direction.y !== 1) this.nextDirection = { ...DIRECTIONS.UP };
                    break;
                case 'down':
                    if (this.direction.y !== -1) this.nextDirection = { ...DIRECTIONS.DOWN };
                    break;
                case 'left':
                    if (this.direction.x !== 1) this.nextDirection = { ...DIRECTIONS.LEFT };
                    break;
                case 'right':
                    if (this.direction.x !== -1) this.nextDirection = { ...DIRECTIONS.RIGHT };
                    break;
            }
        }
    }
}
