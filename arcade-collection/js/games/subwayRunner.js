/**
 * ============================================
 * ARCADE ULTIMATE - SUBWAY RUNNER GAME
 * Course infinie style Subway Surfers
 * ============================================
 */

class SubwayRunnerGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Configuration des voies
        this.laneCount = 3;
        this.laneWidth = 120;
        this.lanes = [];
        
        // Système de particules
        this.particles = new ParticleSystem(150);
        this.trailParticles = [];
        
        // Initialiser
        this.init();
    }
    
    init() {
        // Calculer les positions des voies
        const totalWidth = this.laneCount * this.laneWidth;
        const startX = (this.width - totalWidth) / 2 + this.laneWidth / 2;
        
        for (let i = 0; i < this.laneCount; i++) {
            this.lanes.push(startX + i * this.laneWidth);
        }
        
        // Joueur
        this.currentLane = 1; // Commence au centre
        this.targetLane = 1;
        this.playerX = this.lanes[1];
        this.playerY = this.height - 150;
        this.groundY = this.height - 150;
        
        // Physique du saut
        this.isJumping = false;
        this.isSliding = false;
        this.jumpVelocity = 0;
        this.gravity = 2800;
        this.jumpForce = -750;
        this.slideTimer = 0;
        this.slideDuration = 0.5;
        
        // Animation du joueur
        this.runAnimation = 0;
        this.tiltAngle = 0;
        
        // Vitesse et distance
        this.baseSpeed = 350;
        this.speed = this.baseSpeed;
        this.distance = 0;
        this.maxDistance = 0;
        
        // Obstacles
        this.obstacles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1.2;
        this.obstacleTypes = ['train', 'barrier', 'cone', 'truck'];
        
        // Pièces
        this.coins = [];
        this.coinSpawnTimer = 0;
        this.coinSpawnInterval = 0.6;
        this.coinValue = 50;
        this.totalCoins = 0;
        
        // Score
        this.score = 0;
        this.multiplier = 1;
        this.multiplierTimer = 0;
        
        // Effets visuels
        this.speedLines = [];
        this.screenOffset = 0; // Pour l'effet de parallaxe
        this.flashEffect = { active: false, alpha: 0, color: '#fff' };
        
        // Ground scrolling
        this.groundLines = [];
        for (let i = 0; i < 20; i++) {
            this.groundLines.push({
                y: i * 60,
                speed: 1
            });
        }
        
        // Stats
        this.obstaclesDodged = 0;
        this.jumpsMade = 0;
        
        // État
        this.gameOver = false;
        this.gameState = GAME_STATES.IDLE;
    }
    
    spawnObstacle() {
        const lane = MathUtils.randomInt(0, this.laneCount - 1);
        const type = this.obstacleTypes[MathUtils.randomInt(0, this.obstacleTypes.length - 1)];
        
        let obstacle = {
            x: this.lanes[lane],
            y: -200,
            type: type,
            lane: lane,
            passed: false
        };
        
        switch (type) {
            case 'train':
                obstacle.width = 90;
                obstacle.height = 180;
                obstacle.color = '#ef4444';
                obstacle.points = 100;
                break;
            case 'barrier':
                obstacle.width = 80;
                obstacle.height = 70;
                obstacle.color = '#f59e0b';
                obstacle.points = 25;
                break;
            case 'cone':
                obstacle.width = 40;
                obstacle.height = 55;
                obstacle.color = '#f97316';
                obstacle.points = 15;
                break;
            case 'truck':
                obstacle.width = 100;
                obstacle.height = 140;
                obstacle.color = '#6366f1';
                obstacle.points = 75;
                break;
        }
        
        this.obstacles.push(obstacle);
    }
    
    spawnCoin() {
        const lane = MathUtils.randomInt(0, this.laneCount - 1);
        const isHigh = Math.random() > 0.4; // Pièce en hauteur pour le saut
        
        this.coins.push({
            x: this.lanes[lane],
            y: -30,
            radius: 18,
            collected: false,
            isHigh: isHigh,
            targetY: isHigh ? this.groundY - 120 : this.groundY - 40,
            rotation: 0,
            bobPhase: Math.random() * Math.PI * 2
        });
    }
    
    update(dt) {
        super.update(dt);
        
        if (this.gameOver || this.gameState !== GAME_STATES.PLAYING) return;
        
        // Mettre à jour la distance
        this.distance += this.speed * dt;
        if (this.distance > this.maxDistance) {
            this.maxDistance = this.distance;
        }
        
        // Score basé sur la distance
        this.score = Math.floor(this.distance / 5) + this.totalCoins * this.coinValue;
        
        // Augmenter la difficulté progressivement
        const difficultyMultiplier = 1 + Math.floor(this.distance / 1000) * 0.15;
        this.speed = this.baseSpeed * difficultyMultiplier;
        this.speed = Math.min(this.speed, 700); // Vitesse max
        
        // Ajuster le spawn rate
        this.spawnInterval = Math.max(0.5, 1.2 - difficultyMultiplier * 0.1);
        
        // Mettre à jour le multiplicateur
        if (this.multiplierTimer > 0) {
            this.multiplierTimer -= dt;
            if (this.multiplierTimer <= 0) {
                this.multiplier = 1;
            }
        }
        
        // Mouvement du joueur entre les voies (smooth)
        const targetX = this.lanes[this.currentLane];
        this.playerX += (targetX - this.playerX) * 12 * dt;
        
        // Inclinaison lors du changement de voie
        const laneDiff = this.currentLane - this.targetLane;
        this.tiltAngle = laneDiff * 0.15;
        if (Math.abs(this.playerX - targetX) < 1) {
            this.targetLane = this.currentLane;
        }
        
        // Physique du saut
        if (this.isJumping) {
            this.jumpVelocity += this.gravity * dt;
            this.playerY += this.jumpVelocity * dt;
            
            if (this.playerY >= this.groundY) {
                this.playerY = this.groundY;
                this.isJumping = false;
                this.jumpVelocity = 0;
                
                // Landing particles
                this.particles.emit(this.playerX, this.playerY + 20, {
                    count: 8,
                    speed: 3,
                    size: 3,
                    colors: ['#94a3b8', '#64748b'],
                    life: 0.4,
                    gravity: 150,
                    spread: Math.PI
                });
            }
        }
        
        // Slide timer
        if (this.isSliding) {
            this.slideTimer -= dt;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
            }
        }
        
        // Animation de course
        this.runAnimation += dt * (this.isJumping ? 10 : 18);
        
        // Spawn obstacles
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            
            // Parfois spawner plusieurs obstacles
            const count = Math.random() > 0.7 ? 2 : 1;
            for (let i = 0; i < count; i++) {
                this.spawnObstacle();
            }
        }
        
        // Spawn coins
        this.coinSpawnTimer += dt;
        if (this.coinSpawnTimer >= this.coinSpawnInterval) {
            this.coinSpawnTimer = 0;
            this.spawnCoin();
        }
        
        // Update obstacles
        this.updateObstacles(dt);
        
        // Update coins
        this.updateCoins(dt);
        
        // Update ground lines (parallaxe)
        this.updateGround(dt);
        
        // Speed lines effect
        this.updateSpeedLines(dt);
        
        // Particules
        this.particles.update(dt);
        
        // Flash effect
        if (this.flashEffect.active) {
            this.flashEffect.alpha -= dt * 4;
            if (this.flashEffect.alpha <= 0) {
                this.flashEffect.active = false;
            }
        }
        
        // Trail particles when moving fast
        if (this.speed > 450 && Math.random() > 0.7) {
            this.trailParticles.push({
                x: this.playerX + (Math.random() - 0.5) * 20,
                y: this.playerY - 20,
                size: MathUtils.random(2, 5),
                life: 0.5,
                color: `hsla(${MathUtils.random(180, 220)}, 70%, 60%, `
            });
        }
        
        // Update trail particles
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const p = this.trailParticles[i];
            p.life -= dt * 2;
            p.y += dt * 100;
            if (p.life <= 0) {
                this.trailParticles.splice(i, 1);
            }
        }
        
        // Mettre à jour le score affiché
        if (this.engine) {
            this.engine.score = this.score;
            this.engine.updateScoreDisplay();
        }
    }
    
    updateObstacles(dt) {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.y += this.speed * dt;
            
            // Supprimer si hors écran
            if (obs.y > this.height + 300) {
                this.obstacles.splice(i, 1);
                continue;
            }
            
            // Marquer comme passé (pour le score)
            if (!obs.passed && obs.y > this.playerY + 50) {
                obs.passed = true;
                this.obstaclesDodged++;
                
                // Petit bonus d'évitement
                this.score += obs.points;
            }
            
            // Collision detection
            if (this.checkCollision(obs)) {
                this.crash(obs);
                return;
            }
        }
    }
    
    updateCoins(dt) {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            coin.y += this.speed * dt;
            coin.rotation += dt * 5;
            coin.bobPhase += dt * 4;
            
            // Supprimer si hors écran
            if (coin.y > this.height + 50) {
                this.coins.splice(i, 1);
                continue;
            }
            
            // Collection
            if (!coin.collected) {
                const coinDisplayY = Math.min(coin.y, coin.targetY);
                const dist = Math.hypot(
                    this.playerX - coin.x,
                    (this.playerY - 35) - coinDisplayY
                );
                
                if (dist < 45) {
                    coin.collected = true;
                    this.collectCoin(coin);
                }
            }
        }
    }
    
    collectCoin(coin) {
        this.totalCoins++;
        
        // Augmenter le multiplicateur
        this.multiplier = Math.min(this.multiplier + 0.5, 5);
        this.multiplierTimer = 2;
        
        // Particules
        this.particles.emit(coin.x, Math.min(coin.y, coin.targetY), {
            count: 12,
            speed: 5,
            size: 4,
            colors: ['#fbbf24', '#fcd34d', '#ffffff'],
            life: 0.6,
            gravity: 80,
            spread: Math.PI * 2
        });
        
        // Son
        if (this.engine?.soundManager) {
            this.engine.soundManager.playCoin();
        }
        
        // Flash
        this.triggerFlash('#fbbf24', 0.15);
    }
    
    checkCollision(obs) {
        const playerBox = this.getPlayerHitbox();
        const obsBox = {
            x: obs.x - obs.width / 2,
            y: obs.y - obs.height / 2,
            width: obs.width,
            height: obs.height
        };
        
        // AABB collision
        return playerBox.x < obsBox.x + obsBox.width &&
               playerBox.x + playerBox.width > obsBox.x &&
               playerBox.y < obsBox.y + obsBox.height &&
               playerBox.y + playerBox.height > obsBox.y;
    }
    
    getPlayerHitbox() {
        const width = 40;
        let height = 70;
        let yOffset = 0;
        
        if (this.isJumping) {
            height = 65;
            yOffset = 0;
        } else if (this.isSliding) {
            height = 35;
            yOffset = 35;
        }
        
        return {
            x: this.playerX - width / 2,
            y: this.playerY - height - yOffset,
            width: width,
            height: height
        };
    }
    
    crash(obs) {
        this.gameOver = true;
        this.gameState = GAME_STATES.GAME_OVER;
        
        // Explosion de particules
        this.particles.emit(this.playerX, this.playerY - 30, {
            count: 40,
            speed: 8,
            size: 6,
            colors: ['#f472b6', '#ec4899', '#ffffff', '#fbbf24'],
            life: 1.2,
            gravity: 300,
            spread: Math.PI * 2
        });
        
        // Screen shake (via flash)
        this.triggerFlash('#ef4444', 0.5);
        
        // Son
        if (this.engine?.soundManager) {
            this.engine.soundManager.playGameOver();
        }
        
        setTimeout(() => {
            this.endGame(false, '💥 CRASH!', '💥');
        }, 800);
    }
    
    updateGround(dt) {
        for (const line of this.groundLines) {
            line.y += this.speed * dt;
            if (line.y > this.height) {
                line.y = -60;
            }
        }
    }
    
    updateSpeedLines(dt) {
        // Ajouter de nouvelles lignes de vitesse quand on va vite
        if (this.speed > 400 && Math.random() > 0.85) {
            this.speedLines.push({
                x: MathUtils.random(0, this.width),
                length: MathUtils.random(50, 150),
                speed: this.speed * 0.8,
                alpha: MathUtils.random(0.1, 0.3),
                width: MathUtils.random(1, 3)
            });
        }
        
        // Mettre à jour les lignes existantes
        for (let i = this.speedLines.length - 1; i >= 0; i--) {
            const line = this.speedLines[i];
            line.y = line.y !== undefined ? line.y + line.speed * dt : 0;
            line.y = (line.y || 0) + line.speed * dt;
            
            if ((line.y || 0) > this.height) {
                this.speedLines.splice(i, 1);
            }
        }
    }
    
    triggerFlash(color, alpha) {
        this.flashEffect.active = true;
        this.flashEffect.alpha = alpha;
        this.flashEffect.color = color;
    }
    
    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.isJumping = true;
            this.jumpVelocity = this.jumpForce;
            this.jumpsMade++;
            
            // Jump particles
            this.particles.emit(this.playerX, this.playerY + 10, {
                count: 10,
                speed: 4,
                size: 3,
                colors: ['#94a3b8', '#cbd5e1'],
                life: 0.4,
                gravity: 200,
                spread: Math.PI * 0.8,
                direction: -Math.PI / 2
            });
            
            if (this.engine?.soundManager) {
                this.engine.soundManager.playJump();
            }
        }
    }
    
    slide() {
        if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            this.slideTimer = this.slideDuration;
        }
    }
    
    changeLane(direction) {
        const newLane = this.currentLane + direction;
        if (newLane >= 0 && newLane < this.laneCount) {
            this.currentLane = newLane;
            
            // Lane change particles
            this.particles.emit(
                this.playerX - direction * 25,
                this.playerY - 30,
                {
                    count: 5,
                    speed: 2,
                    size: 3,
                    colors: ['#6366f1', '#818cf8'],
                    life: 0.3,
                    gravity: 50,
                    spread: Math.PI * 0.5,
                    direction: direction > 0 ? 0 : Math.PI
                }
            );
        }
    }
    
    render() {
        const ctx = this.ctx;
        
        // Fond avec gradient dynamique basé sur la vitesse
        const speedRatio = (this.speed - this.baseSpeed) / (700 - this.baseSpeed);
        const bgDarkness = Math.floor(10 + speedRatio * 10);
        
        const bgGradient = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGradient.addColorStop(0, `rgb(${bgDarkness}, ${bgDarkness}, ${bgDarkness + 10})`);
        bgGradient.addColorStop(0.6, `rgb(${bgDarkness + 5}, ${bgDarkness + 5}, ${bgDarkness + 15})`);
        bgGradient.addColorStop(1, `rgb(${bgDarkness + 10}, ${bgDarkness + 10}, ${bgDarkness + 20})`);
        
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Speed lines
        this.renderSpeedLines(ctx);
        
        // Ground/Road
        this.renderGround(ctx);
        
        // Coins
        this.renderCoins(ctx);
        
        // Obstacles
        this.renderObstacles(ctx);
        
        // Player
        this.renderPlayer(ctx);
        
        // Particules
        this.particles.render(ctx);
        
        // Trail particles
        this.renderTrailParticles(ctx);
        
        // Flash effect
        if (this.flashEffect.active) {
            ctx.fillStyle = `${this.flashEffect.color}${Math.floor(this.flashEffect.alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // UI
        this.renderUI(ctx);
    }
    
    renderGround(ctx) {
        // Route principale
        const roadLeft = this.lanes[0] - this.laneWidth / 2 - 30;
        const roadRight = this.lanes[this.laneCount - 1] + this.laneWidth / 2 + 30;
        
        // Surface de route
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(roadLeft, 0, roadRight - roadLeft, this.height);
        
        // Bordures de route
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(roadLeft - 5, 0, 5, this.height);
        ctx.fillRect(roadRight, 0, 5, this.height);
        
        // Lignes de séparation des voies
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.setLineDash([40, 30]);
        
        for (let i = 0; i < this.laneCount - 1; i++) {
            const x = (this.lanes[i] + this.lanes[i + 1]) / 2;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
        
        // Lignes de sol animées (parallaxe)
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
        ctx.lineWidth = 2;
        
        for (const line of this.groundLines) {
            ctx.beginPath();
            ctx.moveTo(roadLeft, line.y);
            ctx.lineTo(roadRight, line.y);
            ctx.stroke();
        }
        
        // Sol en bas
        ctx.fillStyle = '#374151';
        ctx.fillRect(0, this.groundY + 50, this.width, this.height - this.groundY);
    }
    
    renderSpeedLines(ctx) {
        for (const line of this.speedLines) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${line.alpha})`;
            ctx.lineWidth = line.width;
            ctx.beginPath();
            ctx.moveTo(line.x, 0);
            ctx.lineTo(line.x, line.length);
            ctx.stroke();
        }
    }
    
    renderCoins(ctx) {
        for (const coin of this.coins) {
            if (coin.collected) continue;
            
            const displayY = Math.min(coin.y, coin.targetY);
            const bobOffset = Math.sin(coin.bobPhase) * 5;
            
            ctx.save();
            ctx.translate(coin.x, displayY + bobOffset);
            ctx.rotate(coin.rotation);
            
            // Glow
            const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coin.radius * 2);
            glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
            glowGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(0, 0, coin.radius * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Coin principal
            const coinGrad = ctx.createRadialGradient(-4, -4, 0, 0, 0, coin.radius);
            coinGrad.addColorStop(0, '#fef08a');
            coinGrad.addColorStop(0.7, '#fbbf24');
            coinGrad.addColorStop(1, '#f59e0b');
            
            ctx.fillStyle = coinGrad;
            ctx.beginPath();
            ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Symbole $
            ctx.fillStyle = '#b45309';
            ctx.font = `bold ${coin.radius}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 1);
            
            ctx.restore();
        }
    }
    
    renderObstacles(ctx) {
        for (const obs of this.obstacles) {
            ctx.save();
            ctx.translate(obs.x, obs.y);
            
            switch (obs.type) {
                case 'train':
                    this.renderTrain(ctx, obs);
                    break;
                case 'barrier':
                    this.renderBarrier(ctx, obs);
                    break;
                case 'cone':
                    this.renderCone(ctx, obs);
                    break;
                case 'truck':
                    this.renderTruck(ctx, obs);
                    break;
            }
            
            ctx.restore();
        }
    }
    
    renderTrain(ctx, obs) {
        // Corps du train
        const grad = ctx.createLinearGradient(-obs.width/2, 0, obs.width/2, 0);
        grad.addColorStop(0, '#dc2626');
        grad.addColorStop(0.5, '#ef4444');
        grad.addColorStop(1, '#dc2626');
        
        ctx.fillStyle = grad;
        RenderUtils.roundRect(ctx, -obs.width/2, -obs.height/2, obs.width, obs.height, 10);
        ctx.fill();
        
        // Fenêtres
        ctx.fillStyle = '#1e293b';
        RenderUtils.roundRect(ctx, -obs.width/2 + 10, -obs.height/2 + 15, 25, 30, 5);
        ctx.fill();
        RenderUtils.roundRect(ctx, obs.width/2 - 35, -obs.height/2 + 15, 25, 30, 5);
        ctx.fill();
        
        // Bande décorative
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-obs.width/2, -10, obs.width, 8);
        
        // Phares
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(-obs.width/2 + 15, obs.height/2 - 10, 8, 0, Math.PI * 2);
        ctx.arc(obs.width/2 - 15, obs.height/2 - 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    renderBarrier(ctx, obs) {
        // Barrière orange/blanche
        ctx.fillStyle = obs.color;
        RenderUtils.roundRect(ctx, -obs.width/2, -obs.height/2, obs.width, obs.height, 5);
        ctx.fill();
        
        // Rayures
        ctx.fillStyle = '#fff';
        const stripeWidth = obs.width / 4;
        for (let i = 0; i < 4; i++) {
            if (i % 2 === 0) {
                ctx.fillRect(-obs.width/2 + i * stripeWidth, -obs.height/2, stripeWidth, obs.height);
            }
        }
        
        // Support
        ctx.fillStyle = '#78716c';
        ctx.fillRect(-5, obs.height/2 - 5, 10, 15);
    }
    
    renderCone(ctx, obs) {
        // Cône orange
        ctx.fillStyle = obs.color;
        ctx.beginPath();
        ctx.moveTo(0, -obs.height/2);
        ctx.lineTo(-obs.width/2, obs.height/2);
        ctx.lineTo(obs.width/2, obs.height/2);
        ctx.closePath();
        ctx.fill();
        
        // Bandes blanches
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(-obs.width/3, obs.height/6);
        ctx.lineTo(obs.width/3, obs.height/6);
        ctx.lineTo(obs.width/4, obs.height/3);
        ctx.lineTo(-obs.width/4, obs.height/3);
        ctx.closePath();
        ctx.fill();
        
        // Base
        ctx.fillStyle = '#78716c';
        ctx.fillRect(-obs.width/2 - 3, obs.height/2 - 5, obs.width + 6, 8);
    }
    
    renderTruck(ctx, obs) {
        // Camionnette
        const grad = ctx.createLinearGradient(-obs.width/2, 0, obs.width/2, 0);
        grad.addColorStop(0, '#4338ca');
        grad.addColorStop(0.5, '#6366f1');
        grad.addColorStop(1, '#4338ca');
        
        ctx.fillStyle = grad;
        RenderUtils.roundRect(ctx, -obs.width/2, -obs.height/2 + 20, obs.width, obs.height - 20, 8);
        ctx.fill();
        
        // Cabine
        ctx.fillStyle = '#3730a3';
        RenderUtils.roundRect(ctx, obs.width/2 - 40, -obs.height/2, 40, 50, 8);
        ctx.fill();
        
        // Fenêtre cabine
        ctx.fillStyle = '#93c5fd';
        RenderUtils.roundRect(ctx, obs.width/2 - 35, -obs.height/2 + 8, 28, 22, 4);
        ctx.fill();
        
        // Roues
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(-obs.width/3, obs.height/2 - 15, 12, 0, Math.PI * 2);
        ctx.arc(obs.width/3, obs.height/2 - 15, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Jantes
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.arc(-obs.width/3, obs.height/2 - 15, 6, 0, Math.PI * 2);
        ctx.arc(obs.width/3, obs.height/2 - 15, 6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderPlayer(ctx) {
        ctx.save();
        ctx.translate(this.playerX, this.playerY);
        ctx.rotate(this.tiltAngle);
        
        const isRunning = !this.isJumping;
        const runBob = isRunning ? Math.sin(this.runAnimation) * 4 : 0;
        const squash = this.isJumping ? 1 : (isRunning ? 1 + Math.abs(Math.sin(this.runAnimation * 2)) * 0.05 : 1);
        
        ctx.scale(1 / squash, squash);
        ctx.translate(0, -runBob);
        
        // Ombre au sol
        if (!this.isJumping) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(0, 5, 25, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Corps
        const bodyHeight = this.isSliding ? 35 : 55;
        const bodyY = this.isSliding ? 17 : -bodyHeight / 2;
        
        const bodyGrad = ctx.createLinearGradient(-20, bodyY, 20, bodyY + bodyHeight);
        bodyGrad.addColorStop(0, '#f9a8d4');
        bodyGrad.addColorStop(1, '#ec4899');
        
        ctx.fillStyle = bodyGrad;
        RenderUtils.roundRect(ctx, -20, bodyY, 40, bodyHeight, 12);
        ctx.fill();
        
        // Tête
        if (!this.isSliding) {
            const headGrad = ctx.createRadialGradient(-3, -bodyHeight/2 - 18, 0, 0, -bodyHeight/2 - 12, 18);
            headGrad.addColorStop(0, '#fef08a');
            headGrad.addColorStop(1, '#fcd34d');
            
            ctx.fillStyle = headGrad;
            ctx.beginPath();
            ctx.arc(0, -bodyHeight/2 - 12, 18, 0, Math.PI * 2);
            ctx.fill();
            
            // Yeux
            ctx.fillStyle = '#1f2937';
            ctx.beginPath();
            ctx.arc(-6, -bodyHeight/2 - 14, 3, 0, Math.PI * 2);
            ctx.arc(6, -bodyHeight/2 - 14, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Sourire
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(0, -bodyHeight/2 - 8, 7, 0.2, Math.PI - 0.2);
            ctx.stroke();
            
            // Cheveux (style)
            ctx.fillStyle = '#7c3aed';
            ctx.beginPath();
            ctx.ellipse(0, -bodyHeight/2 - 26, 14, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Jambes (animation de course)
        if (!this.isSliding && !this.isJumping) {
            const legAngle = Math.sin(this.runAnimation) * 0.5;
            
            ctx.fillStyle = '#3b82f6';
            ctx.save();
            ctx.translate(-10, bodyY + bodyHeight - 5);
            ctx.rotate(legAngle);
            RenderUtils.roundRect(ctx, -6, 0, 12, 25, 5);
            ctx.fill();
            ctx.restore();
            
            ctx.save();
            ctx.translate(10, bodyY + bodyHeight - 5);
            ctx.rotate(-legAngle);
            RenderUtils.roundRect(ctx, -6, 0, 12, 25, 5);
            ctx.fill();
            ctx.restore();
        } else if (this.isSliding) {
            // Position slide
            ctx.fillStyle = '#3b82f6';
            RenderUtils.roundRect(ctx, -25, 25, 50, 12, 6);
            ctx.fill();
        }
        
        // Bras
        if (!this.isSliding) {
            const armSwing = Math.sin(this.runAnimation) * 0.4;
            
            ctx.fillStyle = '#f9a8d4';
            ctx.save();
            ctx.translate(-22, bodyY + 10);
            ctx.rotate(-armSwing - 0.3);
            RenderUtils.roundRect(ctx, -5, 0, 10, 22, 5);
            ctx.fill();
            ctx.restore();
            
            ctx.save();
            ctx.translate(22, bodyY + 10);
            ctx.rotate(armSwing + 0.3);
            RenderUtils.roundRect(ctx, -5, 0, 10, 22, 5);
            ctx.fill();
            ctx.restore();
        }
        
        // Effect de vitesse (lorsque rapide)
        if (this.speed > 450) {
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = '#6366f1';
                ctx.beginPath();
                ctx.arc(-30 - i * 15, -runBob + (Math.random() - 0.5) * 10, 5 - i, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
        
        ctx.restore();
    }
    
    renderTrailParticles(ctx) {
        for (const p of this.trailParticles) {
            ctx.fillStyle = p.color + p.life + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderUI(ctx) {
        // Distance
        ctx.font = 'bold 32px Orbitron';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText(`${Math.floor(this.distance)}m`, 20, 45);
        ctx.shadowBlur = 0;
        
        // Multiplicateur
        if (this.multiplier > 1) {
            ctx.font = 'bold 20px Orbitron';
            ctx.fillStyle = '#fbbf24';
            ctx.fillText(`x${this.multiplier.toFixed(1)}`, 20, 75);
        }
        
        // Pièces
        ctx.font = '20px Rajdhani';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`🪙 ${this.totalCoins}`, this.width - 20, 45);
        
        // Vitesse
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px Rajdhani';
        ctx.fillText(`${Math.floor(this.speed)} km/h`, this.width - 20, 70);
        
        // Indicateur de voie
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '14px Rajdhani';
        for (let i = 0; i < this.laneCount; i++) {
            const indicator = i === this.currentLane ? '▲' : '○';
            ctx.fillText(indicator, this.lanes[i], this.height - 15);
        }
    }
    
    handleKey(key, code) {
        switch (code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.changeLane(-1);
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.changeLane(1);
                break;
            case 'ArrowUp':
            case 'Space':
            case 'KeyW':
            case 'KeyZ':
                this.jump();
                break;
            case 'ArrowDown':
            case 'ShiftLeft':
            case 'KeyS':
                this.slide();
                break;
        }
    }
    
    handleMobileInput(direction, state) {
        if (state === 'down') {
            switch (direction) {
                case 'left': this.changeLane(-1); break;
                case 'right': this.changeLane(1); break;
                case 'up': this.jump(); break;
                case 'down': this.slide(); break;
            }
        }
    }
    
    handleMobileAction(action, state) {
        if (state === 'down') {
            if (action === 'a') this.jump();
            if (action === 'b') this.slide();
        }
    }
}
