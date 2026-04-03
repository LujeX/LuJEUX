// arcade-collection/js/games/subwayRunner.js

/**
 * ============================================
 * ARCADE COLLECTION - SUBWAY RUNNER
 * Jeu de course infini style endless runner
 * Contrôles: Flèches gauche/droite pour changer de voie, haut pour sauter, bas pour glisser
 * ============================================
 */

class SubwayRunnerGame extends BaseGame {
    constructor(ctx, width, height) {
        super(ctx, width, height);
        
        // Configuration
        this.config = {
            lanes: 3,
            laneWidth: 0,
            playerSize: 40,
            obstacleTypes: ['train', 'barrier', 'coin'],
            baseSpeed: 8,
            maxSpeed: 18,
            speedIncrement: 0.001,
            spawnRate: 1.5,
            jumpHeight: 120,
            jumpDuration: 0.5,
            slideDuration: 0.6,
            gravity: 2000,
            coinValue: 10
        };
        
        // Calculer la largeur des voies
        this.calculateLaneWidth();
        
        // État du jeu (initialisé dans init())
        this.player = null;
        this.obstacles = [];
        this.coins = [];
        this.laneObjects = [];
        
        // Position et mouvement
        this.currentLane = 1; // 0, 1, 2 (gauche, centre, droite)
        this.targetLane = 1;
        this.speed = this.config.baseSpeed;
        this.distance = 0;
        
        // Saut et glissade
        this.isJumping = false;
        this.isSliding = false;
        this.jumpVelocity = 0;
        this.jumpTimer = 0;
        this.slideTimer = 0;
        this.playerY = 0; // Y offset pour le saut/glissade
        
        // Animation
        this.roadOffset = 0;
        this.buildings = [];
        
        // Couleurs
        this.colors = {
            ...this.colors,
            background: '#1a1a2e',
            road: '#16213e',
            roadLine: '#f39c12',
            building: '#0f3460',
            buildingWindow: 'rgba(255, 255, 150, 0.5)',
            player: '#64b5f6',
            train: '#e74c3c',
            barrier: '#f39c12',
            coin: '#f1c40f',
            ground: '#2c3e50'
        };
    }

    /**
     * Calculer la largeur des voies
     */
    calculateLaneWidth() {
        this.config.laneWidth = Math.min(150, (this.width - 100) / this.config.lanes);
    }

    /**
     * Obtenir la position X d'une voie
     */
    getLaneX(lane) {
        const totalWidth = this.config.laneWidth * this.config.lanes;
        const startX = (this.width - totalWidth) / 2;
        return startX + lane * this.config.laneWidth + this.config.laneWidth / 2;
    }

    /**
     * Initialiser le jeu
     */
    init() {
        super.init();
        
        // Recalculer les dimensions
        this.calculateLaneWidth();
        
        // Position du sol (bas de l'écran)
        const groundY = this.height - 80;
        
        // Initialiser le joueur
        this.player = {
            x: this.getLaneX(1),
            y: groundY,
            width: this.config.playerSize,
            height: this.config.playerSize * 1.5,
            baseY: groundY
        };
        
        // Réinitialiser l'état
        this.currentLane = 1;
        this.targetLane = 1;
        this.speed = this.config.baseSpeed;
        this.distance = 0;
        this.obstacles = [];
        this.coins = [];
        this.isJumping = false;
        this.isSliding = false;
        this.jumpVelocity = 0;
        this.jumpTimer = 0;
        this.slideTimer = 0;
        this.playerY = 0;
        this.roadOffset = 0;
        this.score = 0;
        
        // Générer les bâtiments en arrière-plan
        this.generateBuildings();
        
        console.log('[SubwayRunner] Jeu initialisé');
    }

    /**
     * Générer les bâtiments en arrière-plan
     */
    generateBuildings() {
        this.buildings = [];
        for (let i = 0; i < 10; i++) {
            this.buildings.push({
                x: Math.random() * this.width,
                width: 50 + Math.random() * 100,
                height: 100 + Math.random() * 200,
                windows: Math.floor(Math.random() * 4) + 2
            });
        }
    }

    /**
     * Mettre à jour le jeu
     */
    update(deltaTime) {
        if (this.gameOver) return;
        
        // Augmenter progressivement la vitesse
        this.speed = Math.min(this.speed + this.config.speedIncrement, this.config.maxSpeed);
        this.distance += this.speed * deltaTime * 10;
        
        // Mettre à jour l'offset de route (effet de défilement)
        this.roadOffset += this.speed * deltaTime * 50;
        if (this.roadOffset > 50) {
            this.roadOffset -= 50;
        }
        
        // Mouvement latéral du joueur (changement de voie)
        const targetX = this.getLaneX(this.targetLane);
        this.player.x += (targetX - this.player.x) * 0.15;
        this.currentLane = this.targetLane;
        
        // Gérer le saut
        if (this.isJumping) {
            this.jumpTimer -= deltaTime;
            
            if (this.jumpTimer > 0) {
                // Phase ascendante ou descendante
                const progress = 1 - (this.jumpTimer / this.config.jumpDuration);
                // Parabole pour le saut
                this.playerY = -Math.sin(progress * Math.PI) * this.config.jumpHeight;
                
                if (progress > 0.5 && this.jumpVelocity <= 0) {
                    // Descente
                    this.playerY = -Math.sin(progress * Math.PI) * this.config.jumpHeight;
                }
            } else {
                // Atterrissage
                this.isJumping = false;
                this.playerY = 0;
            }
        }
        
        // Gérer la glissade
        if (this.isSliding) {
            this.slideTimer -= deltaTime;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
            }
        }
        
        // Générer des obstacles
        this.spawnObstacles(deltaTime);
        
        // Mettre à jour les obstacles
        this.updateObstacles(deltaTime);
        
        // Mettre à jour les pièces
        this.updateCoins(deltaTime);
        
        // Vérifier les collisions
        this.checkCollisions();
    }

    /**
     * Générer des obstacles
     */
    spawnObstacles(deltaTime) {
        // Simple spawn basé sur le temps et la distance
        if (Math.random() < this.config.spawnRate * deltaTime * 0.5) {
            const lane = Utils.randomInt(0, 2);
            const type = Math.random() > 0.7 ? 'barrier' : 'train';
            
            // Vérifier qu'il n'y a pas déjà un obstacle trop proche
            const tooClose = this.obstacles.some(obs => 
                obs.lane === lane && obs.y < 200
            );
            
            if (!tooClose) {
                this.obstacles.push({
                    type: type,
                    lane: lane,
                    x: this.getLaneX(lane),
                    y: -100,
                    width: type === 'train' ? this.config.laneWidth - 20 : this.config.laneWidth - 30,
                    height: type === 'train' ? 80 : 40,
                    passed: false
                });
            }
        }
        
        // Générer des pièces
        if (Math.random() < 0.03) {
            const lane = Utils.randomInt(0, 2);
            const height = Math.random() > 0.5 ? 0 : -60; // Au sol ou en l'air
            
            this.coins.push({
                lane: lane,
                x: this.getLaneX(lane),
                y: -50,
                radius: 15,
                collected: false,
                yOffset: height
            });
        }
    }

    /**
     * Mettre à jour les obstacles
     */
    updateObstacles(deltaTime) {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.y += this.speed * deltaTime * 60;
            
            // Supprimer les obstacles sortis de l'écran
            if (obs.y > this.height + 100) {
                this.obstacles.splice(i, 1);
                continue;
            }
            
            // Marquer comme passé (pour le score)
            if (!obs.passed && obs.y > this.player.y) {
                obs.passed = true;
                this.addScore(10);
            }
        }
    }

    /**
     * Mettre à jour les pièces
     */
    updateCoins(deltaTime) {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            coin.y += this.speed * deltaTime * 60;
            
            // Supprimer les pièces sorties de l'écran
            if (coin.y > this.height + 50) {
                this.coins.splice(i, 1);
            }
        }
    }

    /**
     * Vérifier les collisions
     */
    checkCollisions() {
        const playerBox = this.getPlayerHitbox();
        
        // Collision avec les obstacles
        for (const obs of this.obstacles) {
            const obsBox = {
                x: obs.x - obs.width / 2,
                y: obs.y - obs.height / 2,
                width: obs.width,
                height: obs.height
            };
            
            // Ajustement pour le saut et la glissade
            let playerHitbox = { ...playerBox };
            
            if (this.isJumping && playerHitbox.y < obsBox.y + obsBox.height) {
                // En l'air, peut passer au-dessus des barrières basses
                if (obs.type === 'barrier') continue;
            }
            
            if (this.isSliding && obs.type === 'train') {
                // En glissant, réduit la hauteur du joueur
                playerHitbox.height *= 0.4;
                playerHitbox.y += playerBox.height * 0.6;
            }
            
            if (Utils.checkAABBCollision(playerHitbox, obsBox)) {
                this.endGame();
                Utils.audio.playError();
                return;
            }
        }
        
        // Collecte des pièces
        for (const coin of this.coins) {
            if (coin.collected) continue;
            
            const coinPos = {
                x: coin.x,
                y: coin.y + coin.yOffset,
                radius: coin.radius
            };
            
            const playerCenter = {
                x: this.player.x,
                y: this.player.y + this.playerY + this.player.height / 2,
                radius: this.player.width / 2
            };
            
            if (Utils.checkCircleCollision(playerCenter, coinPos)) {
                coin.collected = true;
                this.addScore(this.config.coinValue);
                Utils.audio.playClick();
            }
        }
    }

    /**
     * Obtenir la hitbox du joueur
     */
    getPlayerHitbox() {
        return {
            x: this.player.x - this.player.width / 2,
            y: this.player.y + this.playerY - (this.isSliding ? this.player.height * 0.4 : this.player.height),
            width: this.player.width,
            height: this.isSliding ? this.player.height * 0.4 : this.player.height
        };
    }

    /**
     * Faire sauter le joueur
     */
    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.isJumping = true;
            this.jumpTimer = this.config.jumpDuration;
            this.jumpVelocity = -this.config.gravity * this.config.jumpDuration / 2;
            Utils.audio.playBounce();
        }
    }

    /**
     * Faire glisser le joueur
     */
    slide() {
        if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            this.slideTimer = this.config.slideDuration;
            Utils.audio.playClick();
        }
    }

    /**
     * Changer de voie
     */
    changeLane(direction) {
        const newLane = this.targetLane + direction;
        if (newLane >= 0 && newLane < this.config.lanes) {
            this.targetLane = newLane;
        }
    }

    /**
     * Rendre le jeu
     */
    render(ctx) {
        // Fond
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Ciel dégradé
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.height * 0.6);
        skyGradient.addColorStop(0, '#1a1a2e');
        skyGradient.addColorStop(1, '#16213e');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.width, this.height * 0.6);
        
        // Bâtiments en arrière-plan
        this.drawBuildings(ctx);
        
        // Route
        this.drawRoad(ctx);
        
        // Pièces
        this.drawCoins(ctx);
        
        // Obstacles
        this.drawObstacles(ctx);
        
        // Joueur
        this.drawPlayer(ctx);
        
        // Interface utilisateur
        this.drawUI(ctx);
    }

    /**
     * Dessiner les bâtiments
     */
    drawBuildings(ctx) {
        this.buildings.forEach(building => {
            const y = this.height - 80 - building.height;
            
            // Corps du bâtiment
            ctx.fillStyle = this.colors.building;
            ctx.fillRect(building.x, y, building.width, building.height);
            
            // Fenêtres
            ctx.fillStyle = this.colors.buildingWindow;
            const windowWidth = 10;
            const windowHeight = 15;
            const windowSpacingX = building.width / (building.windows + 1);
            const windowSpacingY = 25;
            
            for (let row = 0; row < Math.floor(building.height / windowSpacingY); row++) {
                for (let col = 0; col < building.windows; col++) {
                    const wx = building.x + windowSpacingX * (col + 1) - windowWidth / 2;
                    const wy = y + 20 + row * windowSpacingY;
                    
                    // Certaines fenêtres sont éteintes
                    if (Math.random() > 0.3 || (row + col) % 3 !== 0) {
                        ctx.fillRect(wx, wy, windowWidth, windowHeight);
                    }
                }
            }
        });
    }

    /**
     * Dessiner la route
     */
    drawRoad(ctx) {
        const roadTop = this.height - 180;
        const roadBottom = this.height - 80;
        
        // Surface de la route
        ctx.fillStyle = this.colors.road;
        ctx.fillRect(0, roadTop, this.width, roadBottom - roadTop);
        
        // Bordures de la route
        ctx.fillStyle = this.colors.ground;
        ctx.fillRect(0, roadBottom, this.width, this.height - roadBottom);
        
        // Lignes de voie
        ctx.strokeStyle = this.colors.roadLine;
        ctx.lineWidth = 3;
        ctx.setLineDash([30, 30]);
        
        for (let i = 1; i < this.config.lanes; i++) {
            const x = this.getLaneX(i);
            ctx.beginPath();
            ctx.moveTo(x, roadTop - this.roadOffset);
            ctx.lineTo(x, roadBottom);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
        
        // Ligne de départ/arrivée
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, roadTop);
        ctx.lineTo(this.width, roadTop);
        ctx.stroke();
    }

    /**
     * Dessiner les obstacles
     */
    drawObstacles(ctx) {
        this.obstacles.forEach(obs => {
            const x = obs.x - obs.width / 2;
            const y = obs.y - obs.height / 2;
            
            if (obs.type === 'train') {
                // Train (rectangle arrondi rouge)
                ctx.shadowColor = this.colors.train;
                ctx.shadowBlur = 10;
                ctx.fillStyle = this.colors.train;
                Utils.canvas.roundRect(ctx, x, y, obs.width, obs.height, 8, this.colors.train);
                
                // Fenêtres du train
                ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
                ctx.fillRect(x + 10, y + 10, obs.width - 20, 20);
                ctx.fillRect(x + 10, y + obs.height - 30, obs.width - 20, 20);
                
                ctx.shadowBlur = 0;
            } else {
                // Barrière (orange avec rayures)
                ctx.shadowColor = this.colors.barrier;
                ctx.shadowBlur = 8;
                ctx.fillStyle = this.colors.barrier;
                Utils.canvas.roundRect(ctx, x, y, obs.width, obs.height, 4, this.colors.barrier);
                
                // Rayures
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(x + i * (obs.width / 3), y, obs.width / 6, obs.height);
                }
                
                ctx.shadowBlur = 0;
            }
        });
    }

    /**
     * Dessiner les pièces
     */
    drawCoins(ctx) {
        const time = Date.now() / 200;
        
        this.coins.forEach(coin => {
            if (coin.collected) return;
            
            const x = coin.x;
            const y = coin.y + coin.yOffset;
            
            // Rotation visuelle
            const scaleX = Math.cos(time + coin.x);
            
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scaleScaleX, 1);
            
            // Glow
            ctx.shadowColor = this.colors.coin;
            ctx.shadowBlur = 15;
            
            // Pièce
            ctx.beginPath();
            ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.colors.coin;
            ctx.fill();
            
            // Symbole $
            ctx.fillStyle = '#b8860b';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 1);
            
            ctx.shadowBlur = 0;
            ctx.restore();
        });
    }

    /**
     * Dessiner le joueur
     */
    drawPlayer(ctx) {
        const x = this.player.x;
        const y = this.player.y + this.playerY;
        
        ctx.save();
        
        if (this.isSliding) {
            // Position glissée
            ctx.translate(x, y - this.player.height * 0.3);
            ctx.scale(1.3, 0.5);
        } else {
            ctx.translate(x, y - this.player.height / 2);
        }
        
        // Ombre sous le personnage
        if (!this.isJumping) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(0, this.player.height / 2, this.player.width / 2, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Corps du personnage
        ctx.shadowColor = this.colors.player;
        ctx.shadowBlur = 15;
        
        // Tête
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath();
        ctx.arc(0, -this.player.height * 0.35, this.player.width * 0.28, 0, Math.PI * 2);
        ctx.fill();
        
        // Corps
        ctx.fillStyle = this.colors.player;
        Utils.canvas.roundRect(
            ctx,
            -this.player.width * 0.32,
            -this.player.height * 0.15,
            this.player.width * 0.64,
            this.player.height * 0.55,
            8,
            this.colors.player
        );
        
        // Jambes (si pas en glissade)
        if (!this.isSliding) {
            ctx.fillStyle = '#1565c0';
            const legOffset = Math.sin(Date.now() / 100) * 5;
            ctx.fillRect(-this.player.width * 0.22, this.player.height * 0.32, this.player.width * 0.18, this.player.height * 0.25 + legOffset);
            ctx.fillRect(this.player.width * 0.04, this.player.height * 0.32, this.player.width * 0.18, this.player.height * 0.25 - legOffset);
        }
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    /**
     * Dessiner l'interface utilisateur
     */
    drawUI(ctx) {
        // Distance parcourue
        Utils.canvas.drawGlowText(ctx, `${Math.floor(this.distance)}m`, 70, 35, {
            font: 'bold 24px Orbitron',
            color: this.colors.text,
            glowColor: this.colors.primary,
            glowSize: 12,
            align: 'left'
        });
        
        // Score
        Utils.canvas.drawGlowText(ctx, `Score: ${Utils.formatScore(this.score)}`, this.width - 70, 35, {
            font: 'bold 20px Orbitron',
            color: this.colors.coin,
            glowColor: this.colors.coin,
            glowSize: 12,
            align: 'right'
        });
        
        // Vitesse
        ctx.font = '14px Rajdhani';
        ctx.fillStyle = this.colors.textMuted;
        ctx.textAlign = 'center';
        ctx.fillText(`Vitesse: ${this.speed.toFixed(1)} km/h`, this.width / 2, 35);
    }

    /**
     * Gérer les touches pressées
     */
    handleKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case 'arrowleft':
            case 'a':
            case 'q':
                this.changeLane(-1);
                break;
            case 'arrowright':
            case 'd':
                this.changeLane(1);
                break;
            case 'arrowup':
            case 'w':
            case 'z':
            case ' ':
                e.preventDefault();
                this.jump();
                break;
            case 'arrowdown':
            case 's':
                this.slide();
                break;
            case 'r':
                if (this.gameOver) this.init();
                break;
        }
    }

    /**
     * Obtenir les instructions
     */
    getInstructions() {
        return `
            <strong>🏃 Subway Runner</strong> - Course infinie!<br>
            <span style="color: var(--neon-blue)">⬅️➡️</span> Changer de voie | 
            <span style="color: var(--neon-green)">⬆️/Espace</span> Sauter | 
            <span style="color: var(--neon-pink)">⬇️</span> Glisser | 
            Évitez les trains 🚂 et collectez les 💰!
        `;
    }
}

// Enregistrer le jeu
window.Games.subwayRunner = SubwayRunnerGame;
