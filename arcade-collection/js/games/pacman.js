/**
 * ============================================
 * ARCADE ULTIMATE - PAC-MAN GAME
 * Le classique des fantômes et pac-gommes
 * ============================================
 */

class PacManGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Configuration du labyrinthe
        this.tileSize = 28;
        
        // Map originale simplifiée (19x21)
        this.originalMap = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
            [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
            [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
            [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
            [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
            [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
            [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
            [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
            [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
            [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
            [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
            [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
            [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
            [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        // Légende: 0=vide, 1=mur, 2=pac-gomme, 3=super pac-gomme
        
        this.mapWidth = 19;
        this.mapHeight = 21;
        
        // Système de particules
        this.particles = new ParticleSystem(150);
        
        // Initialiser
        this.init();
    }
    
    init() {
        // Copier la map
        this.map = this.originalMap.map(row => [...row]);
        
        // Compter les dots
        this.totalDots = 0;
        for (let row of this.map) {
            for (let cell of row) {
                if (cell === 2 || cell === 3) this.totalDots++;
            }
        }
        this.dotsEaten = 0;
        
        // Pac-Man
        this.pacman = {
            x: 9.5,
            y: 15,
            direction: { x: 0, y: 0 },
            nextDirection: { x: 0, y: 0 },
            speed: 5,
            mouthAngle: 0,
            mouthOpen: true,
            mouthSpeed: 12
        };
        
        // Fantômes avec IA
        this.ghosts = [
            {   // Blinky (Rouge) - Aggressif, cible directe
                name: 'blinky',
                x: 9,
                y: 9,
                color: '#ff0000',
                scaredColor: '#2563eb',
                direction: { x: 1, y: 0 },
                mode: 'scatter', // scatter, chase, frightened, eaten
                speed: 4,
                targetX: 18,
                targetY: 0,
                homeX: 9,
                homeY: 9,
                inHouse: false
            },
            {   // Pinky (Rose) - Cible 4 cases devant Pac-Man
                name: 'pinky',
                x: 8,
                y: 10,
                color: '#ffb8ff',
                scaredColor: '#2563eb',
                direction: { x: -1, y: 0 },
                mode: 'scatter',
                speed: 3.8,
                targetX: 2,
                targetY: 0,
                homeX: 8,
                homeY: 10,
                inHouse: false
            },
            {   // Inky (Cyan) - Comportement complexe
                name: 'inky',
                x: 10,
                y: 10,
                color: '#00ffff',
                scaredColor: '#2563eb',
                direction: { x: 1, y: 0 },
                mode: 'scatter',
                speed: 3.6,
                targetX: 18,
                targetY: 17,
                homeX: 10,
                homeY: 10,
                inHouse: false
            },
            {   // Clyde (Orange) - Aléatoire quand proche
                name: 'clyde',
                x: 9,
                y: 10,
                color: '#ffb852',
                scaredColor: '#2563eb',
                direction: { x: 0, y: 1 },
                mode: 'scatter',
                speed: 3.5,
                targetX: 0,
                targetY: 17,
                homeX: 9,
                homeY: 10,
                inHouse: false
            }
        ];
        
        // Power mode
        this.powerMode = false;
        this.powerTimer = 0;
        this.powerDuration = 7;
        
        // Score
        this.score = 0;
        this.lives = 3;
        this.ghostsEaten = 0;
        
        // Timers pour changements de mode
        this.modeTimer = 0;
        this.scatterDuration = 7;
        this.chaseDuration = 20;
        this.currentModeTimer = 0;
        this.isScatterPhase = true;
        
        // Animation
        this.deathAnimation = false;
        this.deathTimer = 0;
        this.levelComplete = false;
        this.readyState = true;
        this.readyTimer = 2;
        
        // Stats
        this.timePlayed = 0;
        
        // État
        this.gameOver = false;
        this.gameState = GAME_STATES.IDLE;
    }
    
    canMoveTo(x, y) {
        const tileX = Math.floor(x);
        const tileY = Math.floor(y);
        
        // Tunnel (bords gauche/droite)
        if (tileX < 0 || tileX >= this.mapWidth) return true;
        if (tileY < 0 || tileY >= this.mapHeight) return true;
        
        return this.map[tileY][tileX] !== 1;
    }
    
    getTileCenter(tileX, tileY) {
        return {
            x: tileX * this.tileSize + this.tileSize / 2,
            y: tileY * this.tileSize + this.tileSize / 2
        };
    }
    
    update(dt) {
        super.update(dt);
        
        if (this.gameOver || this.gameState !== GAME_STATES.PLAYING) return;
        
        // Ready state au début
        if (this.readyState) {
            this.readyTimer -= dt;
            if (this.readyTimer <= 0) {
                this.readyState = false;
            }
            this.render();
            return;
        }
        
        // Death animation
        if (this.deathAnimation) {
            this.deathTimer -= dt;
            if (this.deathTimer <= 0) {
                this.lives--;
                
                if (this.lives <= 0) {
                    this.endGame(false, '💀 GAME OVER', '💀');
                } else {
                    // Reset positions
                    this.resetPositions();
                    this.deathAnimation = false;
                    this.readyState = true;
                    this.readyTimer = 2;
                }
            }
            this.render();
            return;
        }
        
        // Level complete check
        if (this.dotsEaten >= this.totalDots && !this.levelComplete) {
            this.levelComplete = true;
            if (this.engine?.soundManager) {
                this.engine.soundManager.playVictory();
            }
            setTimeout(() => {
                this.endGame(true, '🎉 NIVEAU TERMINÉ!', '🏆');
            }, 1500);
        }
        
        // Mise à jour temps
        this.timePlayed += dt;
        
        // Power mode timer
        if (this.powerMode) {
            this.powerTimer -= dt;
            
            // Clignotement quand il reste peu de temps
            if (this.powerTimer <= 2 && Math.floor(this.powerTimer * 4) % 2 === 0) {
                for (const ghost of this.ghosts) {
                    if (ghost.mode === 'frightened') {
                        ghost.displayColor = '#ffffff';
                    }
                }
            } else {
                for (const ghost of this.ghosts) {
                    if (ghost.mode === 'frightened') {
                        ghost.displayColor = ghost.scaredColor;
                    }
                }
            }
            
            if (this.powerTimer <= 0) {
                this.powerMode = false;
                this.ghostsEaten = 0;
                for (const ghost of this.ghosts) {
                    if (ghost.mode === 'frightened') {
                        ghost.mode = this.isScatterPhase ? 'scatter' : 'chase';
                        ghost.speed = ghost.baseSpeed || ghost.speed;
                    }
                }
            }
        }
        
        // Mode scatter/chase alternance
        this.currentModeTimer -= dt;
        if (this.currentModeTimer <= 0) {
            this.isScatterPhase = !this.isScatterPhase;
            this.currentModeTimer = this.isScatterPhase ? this.scatterDuration : this.chaseDuration;
            
            for (const ghost of this.ghosts) {
                if (ghost.mode !== 'frightened' && ghost.mode !== 'eaten') {
                    ghost.mode = this.isScatterPhase ? 'scatter' : 'chase';
                }
            }
        }
        
        // Update Pac-Man
        this.updatePacMan(dt);
        
        // Update Ghosts
        for (const ghost of this.ghosts) {
            this.updateGhost(ghost, dt);
        }
        
        // Check collisions
        this.checkCollisions();
        
        // Particules
        this.particles.update(dt);
        
        // Score display
        if (this.engine) {
            this.engine.score = this.score;
            this.engine.updateScoreDisplay();
        }
    }
    
    updatePacMan(dt) {
        // Changer de direction si possible
        const nextX = this.pacman.x + this.pacman.nextDirection.x * this.pacman.speed * dt;
        const nextY = this.pacman.y + this.pacman.nextDirection.y * this.pacman.speed * dt;
        
        if (this.canMoveTo(nextX, nextY)) {
            this.pacman.direction = { ...this.pacman.nextDirection };
        }
        
        // Mouvement
        const moveX = this.pacman.x + this.pacman.direction.x * this.pacman.speed * dt;
        const moveY = this.pacman.y + this.pacman.direction.y * this.pacman.speed * dt;
        
        if (this.canMoveTo(moveX, this.pacman.y)) {
            this.pacman.x = moveX;
        }
        if (this.canMoveTo(this.pacman.x, moveY)) {
            this.pacman.y = moveY;
        }
        
        // Tunnel
        if (this.pacman.x < -0.5) {
            this.pacman.x = this.mapWidth - 0.5;
        } else if (this.pacman.x > this.mapWidth - 0.5) {
            this.pacman.x = -0.5;
        }
        
        // Animation bouche
        this.pacman.mouthAngle += this.pacman.mouthSpeed * dt;
        if (this.pacman.mouthAngle >= 0.45) {
            this.pacman.mouthOpen = false;
        }
        if (this.pacman.mouthAngle >= 0.9) {
            this.pacman.mouthAngle = 0;
            this.pacman.mouthOpen = true;
        }
        
        // Manger dots
        const tileX = Math.floor(this.pacman.x);
        const tileY = Math.floor(this.pacman.y);
        
        if (tileX >= 0 && tileX < this.mapWidth && tileY >= 0 && tileY < this.mapHeight) {
            const cell = this.map[tileY][tileX];
            
            if (cell === 2) {
                this.map[tileY][tileX] = 0;
                this.score += 10;
                this.dotsEaten++;
                
                // Petit effet particule
                const pos = this.getTileCenter(tileX, tileY);
                this.particles.emit(pos.x, pos.y, {
                    count: 5,
                    speed: 3,
                    size: 3,
                    colors: ['#fcd34d', '#fbbf24'],
                    life: 0.3,
                    spread: Math.PI * 2
                });
                
                if (this.engine?.soundManager) {
                    this.engine.soundManager.playClick();
                }
            } else if (cell === 3) {
                this.map[tileY][tileX] = 0;
                this.score += 50;
                this.dotsEaten++;
                
                // Activer power mode
                this.powerMode = true;
                this.powerTimer = this.powerDuration;
                this.ghostsEaten = 0;
                
                // Effet spectaculaire
                const pos = this.getTileCenter(tileX, tileY);
                this.particles.emit(pos.x, pos.y, {
                    count: 25,
                    speed: 6,
                    size: 5,
                    colors: ['#fbbf24', '#ffffff', '#06b6d4'],
                    life: 0.8,
                    spread: Math.PI * 2
                });
                
                // Effrayer les fantômes
                for (const ghost of this.ghosts) {
                    if (ghost.mode !== 'eaten') {
                        ghost.mode = 'frightened';
                        ghost.speed = ghost.speed * 0.5;
                        ghost.displayColor = ghost.scaredColor;
                        
                        // Inverser la direction
                        ghost.direction = {
                            x: -ghost.direction.x,
                            y: -ghost.direction.y
                        };
                    }
                }
                
                if (this.engine?.soundManager) {
                    this.engine.soundManager.playCoin();
                }
            }
        }
    }
    
    updateGhost(ghost, dt) {
        // Position sur la grille
        const tileX = Math.floor(ghost.x + 0.5);
        const tileY = Math.floor(ghost.y + 0.5);
        const centerX = tileX + 0.5;
        const centerY = tileY + 0.5;
        
        // Vérifier si on est au centre d'une case (pour changer de direction)
        const atCenter = Math.abs(ghost.x - centerX) < 0.08 && Math.abs(ghost.y - centerY) < 0.08;
        
        if (atCenter) {
            ghost.x = centerX;
            ghost.y = centerY;
            
            // Déterminer la cible selon le mode et le type de fantôme
            let targetX, targetY;
            
            switch (ghost.mode) {
                case 'scatter':
                    targetX = ghost.targetX + 0.5;
                    targetY = ghost.targetY + 0.5;
                    break;
                    
                case 'chase':
                    switch (ghost.name) {
                        case 'blinky':
                            // Cible directe Pac-Man
                            targetX = this.pacman.x;
                            targetY = this.pacman.y;
                            break;
                            
                        case 'pinky':
                            // Cible 4 cases devant Pac-Man
                            targetX = this.pacman.x + this.pacman.direction.x * 4;
                            targetY = this.pacman.y + this.pacman.direction.y * 4;
                            break;
                            
                        case 'inky':
                            // Comportement complexe basé sur Blinky et Pac-Man
                            const blinky = this.ghosts[0];
                            const pacmanAhead = {
                                x: this.pacman.x + this.pacman.direction.x * 2,
                                y: this.pacman.y + this.pacman.direction.y * 2
                            };
                            targetX = pacmanAhead.x + (pacmanAhead.x - blinky.x);
                            targetY = pacmanAhead.y + (pacmanAhead.y - blinky.y);
                            break;
                            
                        case 'clyde':
                            // Si loin, chase; si proche, scatter
                            const distToPac = MathUtils.distance(
                                ghost.x, ghost.y,
                                this.pacman.x, this.pacman.y
                            );
                            
                            if (distToPac > 8) {
                                targetX = this.pacman.x;
                                targetY = this.pacman.y;
                            } else {
                                targetX = ghost.targetX + 0.5;
                                targetY = ghost.targetY + 0.5;
                            }
                            break;
                    }
                    break;
                    
                case 'frightened':
                    // Aléatoire
                    targetX = MathUtils.random(0, this.mapWidth);
                    targetY = MathUtils.random(0, this.mapHeight);
                    break;
                    
                case 'eaten':
                    // Retour à la maison
                    targetX = ghost.homeX + 0.5;
                    targetY = ghost.homeY + 0.5;
                    
                    // Vérifier si arrivé
                    if (Math.abs(ghost.x - targetX) < 1 && Math.abs(ghost.y - targetY) < 1) {
                        ghost.mode = this.isScatterPhase ? 'scatter' : 'chase';
                        ghost.speed = ghost.baseSpeed || ghost.speed;
                    }
                    break;
                    
                default:
                    targetX = ghost.homeX + 0.5;
                    targetY = ghost.homeY + 0.5;
            }
            
            // Trouver la meilleure direction
            const directions = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 }
            ];
            
            // Filtrer les directions valides (pas demi-tour)
            const validDirs = directions.filter(d => {
                // Pas de demi-tour
                if (d.x === -ghost.direction.x && d.y === -ghost.direction.y) return false;
                
                const nextTileX = tileX + d.x;
                const nextTileY = tileY + d.y;
                
                // Vérifier les limites et murs
                if (nextTileX < 0 || nextTileX >= this.mapWidth) return true; // Tunnel
                if (nextTileY < 0 || nextTileY >= this.mapHeight) return false;
                return this.map[nextTileY][nextTileX] !== 1;
            });
            
            if (validDirs.length > 0) {
                // Choisir la direction qui rapproche le plus de la cible
                let bestDir = validDirs[0];
                let bestDist = Infinity;
                
                for (const dir of validDirs) {
                    const nextX = ghost.x + dir.x;
                    const nextY = ghost.y + dir.y;
                    const dist = MathUtils.distance(nextX, nextY, targetX, targetY);
                    
                    if (ghost.mode === 'frightened') {
                        // En mode effrayé, préférer s'éloigner
                        if (dist > bestDist) {
                            bestDist = dist;
                            bestDir = dir;
                        }
                    } else {
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestDir = dir;
                        }
                    }
                }
                
                // Ajouter un peu d'aléatoire pour ne pas être trop parfait
                if (Math.random() < 0.15 && validDirs.length > 1) {
                    bestDir = validDirs[MathUtils.randomInt(0, validDirs.length - 1)];
                }
                
                ghost.direction = bestDir;
            }
        }
        
        // Mouvement
        const speed = ghost.mode === 'eaten' ? ghost.speed * 2 : ghost.speed;
        ghost.x += ghost.direction.x * speed * dt;
        ghost.y += ghost.direction.y * speed * dt;
        
        // Tunnel
        if (ghost.x < -0.5) ghost.x = this.mapWidth - 0.5;
        if (ghost.x > this.mapWidth - 0.5) ghost.x = -0.5;
    }
    
    checkCollisions() {
        for (let i = 0; i < this.ghosts.length; i++) {
            const ghost = this.ghosts[i];
            const dist = MathUtils.distance(
                this.pacman.x, this.pacman.y,
                ghost.x, ghost.y
            );
            
            if (dist < 0.75) {
                if (ghost.mode === 'frightened') {
                    // Manger le fantôme
                    ghost.mode = 'eaten';
                    this.ghostsEaten++;
                    
                    // Points croissants pour chaque fantôme mangé
                    const points = [200, 400, 800, 1600];
                    this.score += points[Math.min(this.ghostsEaten - 1, 3)];
                    
                    // Particules
                    this.particles.emit(
                        ghost.x * this.tileSize + this.tileSize / 2,
                        ghost.y * this.tileSize + this.tileSize / 2,
                        {
                            count: 20,
                            speed: 8,
                            size: 6,
                            colors: [ghost.color, '#ffffff', '#fbbf24'],
                            life: 1,
                            gravity: 100,
                            spread: Math.PI * 2
                        }
                    );
                    
                    if (this.engine?.soundManager) {
                        this.engine.soundManager.playCoin();
                    }
                } else if (ghost.mode !== 'eaten') {
                    // Pac-Man meurt
                    this.die();
                    return;
                }
            }
        }
    }
    
    die() {
        this.deathAnimation = true;
        this.deathTimer = 1.5;
        
        // Particules de mort
        this.particles.emit(
            this.pacman.x * this.tileSize + this.tileSize / 2,
            this.pacman.y * this.tileSize + this.tileSize / 2,
            {
                count: 30,
                speed: 7,
                size: 5,
                colors: ['#fbbf24', '#ffffff', '#f59e0b'],
                life: 1,
                gravity: 150,
                spread: Math.PI * 2
            }
        );
        
        if (this.engine?.soundManager) {
            this.engine.soundManager.playGameOver();
        }
    }
    
    resetPositions() {
        this.pacman.x = 9.5;
        this.pacman.y = 15;
        this.pacman.direction = { x: 0, y: 0 };
        this.pacman.nextDirection = { x: 0, y: 0 };
        
        // Reset ghosts
        const startPositions = [
            { x: 9, y: 9 },
            { x: 8, y: 10 },
            { x: 10, y: 10 },
            { x: 9, y: 10 }
        ];
        
        for (let i = 0; i < this.ghosts.length; i++) {
            this.ghosts[i].x = startPositions[i].x;
            this.ghosts[i].y = startPositions[i].y;
            this.ghosts[i].mode = this.isScatterPhase ? 'scatter' : 'chase';
        }
    }
    
    render() {
        const ctx = this.ctx;
        const offsetX = (this.width - this.mapWidth * this.tileSize) / 2;
        const offsetY = (this.height - this.mapHeight * this.tileSize) / 2;
        
        ctx.save();
        ctx.translate(offsetX, offsetY);
        
        // Fond
        ctx.fillStyle = '#000000';
        ctx.fillRect(-offsetX, -offsetY, this.width, this.height);
        
        // Map
        this.renderMap(ctx);
        
        // Particules
        this.particles.render(ctx);
        
        // Ghosts
        for (const ghost of this.ghosts) {
            this.renderGhost(ctx, ghost);
        }
        
        // Pac-Man
        if (!this.deathAnimation) {
            this.renderPacMan(ctx);
        } else {
            this.renderDeathAnimation(ctx);
        }
        
        // UI overlay
        this.renderUI(ctx);
        
        ctx.restore();
    }
    
    renderMap(ctx) {
        for (let row = 0; row < this.mapHeight; row++) {
            for (let col = 0; col < this.mapWidth; col++) {
                const cell = this.map[row][col];
                const x = col * this.tileSize;
                const y = row * this.tileSize;
                
                if (cell === 1) {
                    // Mur
                    ctx.fillStyle = '#1e40af';
                    RenderUtils.roundRect(ctx, x + 1, y + 1, this.tileSize - 2, this.tileSize - 2, 4);
                    ctx.fill();
                    
                    // Bordure lumineuse
                    ctx.strokeStyle = '#3b82f6';
                    ctx.lineWidth = 2;
                    RenderUtils.roundRect(ctx, x + 1, y + 1, this.tileSize - 2, this.tileSize - 2, 4);
                    ctx.stroke();
                    
                } else if (cell === 2) {
                    // Pac-gomme
                    ctx.fillStyle = '#fcd34d';
                    ctx.beginPath();
                    ctx.arc(x + this.tileSize/2, y + this.tileSize/2, 3, 0, Math.PI * 2);
                    ctx.fill();
                    
                } else if (cell === 3) {
                    // Super pac-gomme (clignotante)
                    const alpha = 0.5 + Math.sin(Date.now() * 0.008) * 0.5;
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = '#fbbf24';
                    ctx.beginPath();
                    ctx.arc(x + this.tileSize/2, y + this.tileSize/2, 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }
        }
    }
    
    renderPacMan(ctx) {
        const x = this.pacman.x * this.tileSize;
        const y = this.pacman.y * this.tileSize;
        const radius = this.tileSize / 2 - 2;
        
        // Corps
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        
        let startAngle, endAngle;
        const mouth = this.pacman.mouthOpen ? this.pacman.mouthAngle : 0.05;
        
        // Orienter selon la direction
        if (this.pacman.direction.x === 1) {
            startAngle = mouth * Math.PI;
            endAngle = (2 - mouth) * Math.PI;
        } else if (this.pacman.direction.x === -1) {
            startAngle = (1 + mouth) * Math.PI;
            endAngle = (1 - mouth) * Math.PI;
        } else if (this.pacman.direction.y === -1) {
            startAngle = (1.5 + mouth) * Math.PI;
            endAngle = (1.5 - mouth) * Math.PI;
        } else {
            startAngle = (0.5 + mouth) * Math.PI;
            endAngle = (0.5 - mouth) * Math.PI;
        }
        
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
    }
    
    renderDeathAnimation(ctx) {
        const x = this.pacman.x * this.tileSize;
        const y = this.pacman.y * this.tileSize;
        const radius = this.tileSize / 2 - 2;
        
        const progress = 1 - (this.deathTimer / 1.5); // 0 à 1
        
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        
        // S'efface progressivement
        const startAngle = progress * Math.PI;
        const endAngle = (2 - progress) * Math.PI;
        
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
    }
    
    renderGhost(ctx, ghost) {
        const x = ghost.x * this.tileSize;
        const y = ghost.y * this.tileSize;
        const radius = this.tileSize / 2 - 2;
        
        // Couleur selon le mode
        let color;
        if (ghost.mode === 'eaten') {
            // Juste les yeux visibles
            color = null;
        } else if (ghost.mode === 'frightened') {
            color = ghost.displayColor || ghost.scaredColor;
        } else {
            color = ghost.color;
        }
        
        // Corps
        if (color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y - radius * 0.2, radius, Math.PI, 0); // Demi-cercle supérieur
            
            // Bas ondulé
            const waveCount = 4;
            const waveWidth = (radius * 2) / waveCount;
            const baseY = y + radius * 0.8;
            
            ctx.lineTo(x + radius, baseY);
            
            for (let i = 0; i < waveCount; i++) {
                const waveX = x + radius - (i + 0.5) * waveWidth;
                const waveY = baseY + (i % 2 === 0 ? 5 : 0);
                ctx.lineTo(waveX, waveY);
            }
            
            ctx.lineTo(x - radius, y - radius * 0.2);
            ctx.closePath();
            ctx.fill();
        }
        
        // Yeux (toujours visibles sauf en mode eaten où juste les yeux)
        const eyeOffsetX = radius * 0.35;
        const eyeOffsetY = -radius * 0.2;
        const eyeRadius = radius * 0.28;
        const pupilRadius = eyeRadius * 0.5;
        
        // Blanc des yeux
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - eyeOffsetX, y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.arc(x + eyeOffsetX, y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupilles (regardent vers Pac-Man ou dans une direction fixe si effrayé)
        ctx.fillStyle = ghost.mode === 'frightened' ? '#ffffff' : '#1e293b';
        
        let lookX = 0, lookY = 0;
        
        if (ghost.mode !== 'frightened') {
            const dx = this.pacman.x - ghost.x;
            const dy = this.pacman.y - ghost.y;
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;
            lookX = (dx / dist) * pupilRadius * 0.5;
            lookY = (dy / dist) * pupilRadius * 0.5;
        }
        
        ctx.beginPath();
        ctx.arc(x - eyeOffsetX + lookX, y + eyeOffsetY + lookY, pupilRadius, 0, Math.PI * 2);
        ctx.arc(x + eyeOffsetX + lookX, y + eyeOffsetY + lookY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderUI(ctx) {
        // Score
        ctx.font = 'bold 20px Orbitron';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${this.score}`, 10, -15);
        
        // Lives
        ctx.textAlign = 'right';
        ctx.fillText('VIES:', this.mapWidth * this.tileSize - 80, -15);
        
        for (let i = 0; i < this.lives; i++) {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(this.mapWidth * this.tileSize - 60 + i * 25, -20, 10, 0.25 * Math.PI, 1.75 * Math.PI);
            ctx.lineTo(this.mapWidth * this.tileSize - 60 + i * 25, -20);
            ctx.fill();
        }
        
        // Ready text
        if (this.readyState) {
            ctx.font = 'bold 28px Orbitron';
            ctx.fillStyle = '#fbbf24';
            ctx.textAlign = 'center';
            ctx.fillText('PRÊT!', this.mapWidth * this.tileSize / 2, this.mapHeight * this.tileSize / 2);
        }
        
        // Power mode indicator
        if (this.powerMode) {
            ctx.font = 'bold 16px Orbitron';
            ctx.fillStyle = '#06b6d4';
            ctx.textAlign = 'center';
            ctx.fillText(`⚡ ${Math.ceil(this.powerTimer)}s`, this.mapWidth * this.tileSize / 2, 30);
        }
        
        ctx.textAlign = 'left';
    }
    
    handleKey(key, code) {
        if (this.readyState || this.deathAnimation || this.gameOver) return;
        
        switch (code) {
            case 'ArrowUp':
            case 'KeyW':
                this.pacman.nextDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.pacman.nextDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.pacman.nextDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.pacman.nextDirection = { x: 1, y: 0 };
                break;
        }
    }
    
    handleMobileInput(direction, state) {
        if (state === 'down' && !this.readyState && !this.deathAnimation) {
            switch (direction) {
                case 'up': this.pacman.nextDirection = { x: 0, y: -1 }; break;
                case 'down': this.pacman.nextDirection = { x: 0, y: 1 }; break;
                case 'left': this.pacman.nextDirection = { x: -1, y: 0 }; break;
                case 'right': this.pacman.nextDirection = { x: 1, y: 0 }; break;
            }
        }
    }
}
