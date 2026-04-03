// arcade-collection/js/games/pacman.js

/**
 * ============================================
 * ARCADE COLLECTION - PAC-MAN
 * Classique jeu du mangeur de pastilles
 * Contrôles: Flèches directionnelles
 * ============================================
 */

class PacManGame extends BaseGame {
    constructor(ctx, width, height) {
        super(ctx, width, height);
        
        // Configuration
        this.config = {
            tileSize: 0, // Calculé dynamiquement
            pacmanSpeed: 3,
            ghostSpeed: 2,
            powerUpDuration: 8000,
            totalDots: 0
        };
        
        // Labyrinthe simplifié (1 = mur, 0 = chemin, 2 = pastille, 3 = super pastille)
        this.mapTemplate = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,1,2,2,2,2,2,2,1],
            [1,3,1,1,2,1,2,2,2,1,2,1,1,3,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,2,1,1,2,1,2,1,1,2,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,2,1,2,1,1,1,2,1,2,1,1,1],
            [1,2,2,2,2,2,2,0,2,2,2,2,2,2,1],
            [1,1,1,2,1,2,1,1,1,2,1,2,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,2,1,1,2,1,2,1,1,2,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,3,1,1,2,1,2,1,2,1,2,1,1,3,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        // État du jeu (initialisé dans init())
        this.map = [];
        this.pacman = null;
        this.ghosts = [];
        this.dotsRemaining = 0;
        this.powerMode = false;
        this.powerTimer = 0;
        this.mouthAngle = 0;
        this.mouthDirection = 1;
        
        // Directions
        this.nextDirection = { x: 0, y: 0 };
        
        // Couleurs
        this.colors = {
            ...this.colors,
            background: '#000000',
            wall: '#1919a6',
            dot: '#ffb8ff',
            superDot: '#ffb8ff',
            pacman: '#ffff00',
            ghostScared: '#2121de',
            ghostColors: ['#ff0000', '#00ffff', '#ffb8ff', '#ffb852']
        };
    }

    /**
     * Calculer la taille des tuiles
     */
    calculateTileSize() {
        const mapWidth = this.mapTemplate[0].length;
        const mapHeight = this.mapTemplate.length;
        
        this.config.tileSize = Math.min(
            (this.width - 40) / mapWidth,
            (this.height - 40) / mapHeight
        );
    }

    /**
     * Initialiser le jeu
     */
    init() {
        super.init();
        
        // Recalculer la taille des tuiles
        this.calculateTileSize();
        
        // Copier et parser le labyrinthe
        this.parseMap();
        
        // Initialiser Pac-Man
        this.pacman = {
            x: 7,
            y: 11,
            targetX: 7,
            targetY: 11,
            pixelX: 7 * this.config.tileSize + this.config.tileSize / 2,
            pixelY: 11 * this.config.tileSize + this.config.tileSize / 2,
            direction: { x: 1, y: 0 },
            mouthOpen: true
        };
        
        // Initialiser les fantômes
        this.ghosts = [
            { x: 7, y: 7, color: this.colors.ghostColors[0], name: 'Blinky', mode: 'scatter' },
            { x: 6, y: 7, color: this.colors.ghostColors[1], name: 'Inky', mode: 'scatter' },
            { x: 8, y: 7, color: this.colors.ghostColors[2], name: 'Pinky', mode: 'scatter' },
            { x: 7, y: 8, color: this.colors.ghostColors[3], name: 'Clyde', mode: 'scatter' }
        ].map(ghost => ({
            ...ghost,
            pixelX: ghost.x * this.config.tileSize + this.config.tileSize / 2,
            pixelY: ghost.y * this.config.tileSize + this.config.tileSize / 2,
            direction: { x: 0, y: -1 }
        }));
        
        // Réinitialiser l'état
        this.powerMode = false;
        this.powerTimer = 0;
        this.score = 0;
        this.nextDirection = { x: 0, y: 0 };
        
        console.log('[PacMan] Jeu initialisé');
    }

    /**
     * Parser le labyrinthe
     */
    parseMap() {
        this.map = [];
        this.config.totalDots = 0;
        
        for (let r = 0; r < this.mapTemplate.length; r++) {
            this.map[r] = [];
            for (let c = 0; c < this.mapTemplate[r].length; c++) {
                const cell = this.mapTemplate[r][c];
                
                if (cell === 1) {
                    this.map[r][c] = { type: 'wall' };
                } else if (cell === 2) {
                    this.map[r][c] = { type: 'dot' };
                    this.config.totalDots++;
                } else if (cell === 3) {
                    this.map[r][c] = { type: 'superDot' };
                    this.config.totalDots++;
                } else {
                    this.map[r][c] = { type: 'empty' };
                }
            }
        }
        
        this.dotsRemaining = this.config.totalDots;
    }

    /**
     * Mettre à jour le jeu
     */
    update(deltaTime) {
        if (this.gameOver) return;
        
        // Animation de la bouche
        this.mouthAngle += 0.15 * this.mouthDirection;
        if (this.mouthAngle > 0.4 || this.mouthAngle < 0) {
            this.mouthDirection *= -1;
        }
        
        // Gérer le mode power-up
        if (this.powerMode) {
            this.powerTimer -= deltaTime * 1000;
            if (this.powerTimer <= 0) {
                this.powerMode = false;
                this.ghosts.forEach(g => g.mode = 'chase');
            }
        }
        
        // Déplacer Pac-Man
        this.updatePacman(deltaTime);
        
        // Déplacer les fantômes
        this.updateGhosts(deltaTime);
        
        // Vérifier les collisions
        this.checkCollisions();
        
        // Victoire si toutes les pastilles mangées
        if (this.dotsRemaining <= 0) {
            Utils.audio.playSuccess();
            this.addScore(1000);
            this.init(); // Niveau suivant
        }
    }

    /**
     * Mettre à jour Pac-Man
     */
    updatePacman(deltaTime) {
        const ts = this.config.tileSize;
        const speed = this.config.pacmanSpeed * ts * deltaTime;
        
        // Essayer de changer de direction
        const nextTileX = this.pacman.x + this.nextDirection.x;
        const nextTileY = this.pacman.y + this.nextDirection.y;
        
        if (this.canMoveTo(nextTileX, nextTileY)) {
            this.pacman.direction = { ...this.nextDirection };
        }
        
        // Calculer la position cible
        const targetPixelX = this.pacman.x * ts + ts / 2 + this.pacman.direction.x * ts;
        const targetPixelY = this.pacman.y * ts + ts / 2 + this.pacman.direction.y * ts;
        
        // Se déplacer vers la cible
        const dx = targetPixelX - this.pacman.pixelX;
        const dy = targetPixelY - this.pacman.pixelY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0 && dist <= speed) {
            // Atteindre la case suivante
            this.pacman.pixelX = targetPixelX;
            this.pacman.pixelY = targetPixelY;
            
            // Mettre à jour la position en tuiles
            this.pacman.x += this.pacman.direction.x;
            this.pacman.y += this.pacman.direction.y;
            
            // Tunnel (passer d'un côté à l'autre)
            if (this.pacman.x < 0) {
                this.pacman.x = this.map[0].length - 1;
                this.pacman.pixelX = this.pacman.x * ts + ts / 2;
            } else if (this.pacman.x >= this.map[0].length) {
                this.pacman.x = 0;
                this.pacman.pixelX = ts / 2;
            }
            
            // Manger la pastille sur cette case
            this.eatDot(this.pacman.x, this.pacman.y);
            
        } else if (dist > speed) {
            // Se déplacer progressivement
            this.pacman.pixelX += (dx / dist) * speed;
            this.pacman.pixelY += (dy / dist) * speed;
        }
    }

    /**
     * Vérifier si on peut se déplacer vers une case
     */
    canMoveTo(tileX, tileY) {
        // Hors limites (pour le tunnel)
        if (tileX < 0 || tileX >= this.map[0].length) return true;
        if (tileY < 0 || tileY >= this.map.length) return false;
        
        return this.map[tileY][tileX].type !== 'wall';
    }

    /**
     * Manger une pastille
     */
    eatDot(x, y) {
        if (x >= 0 && x < this.map[0].length && y >= 0 && y < this.map.length) {
            const cell = this.map[y][x];
            
            if (cell.type === 'dot') {
                cell.type = 'empty';
                this.addScore(10);
                this.dotsRemaining--;
                Utils.audio.playClick();
            } else if (cell.type === 'superDot') {
                cell.type = 'empty';
                this.addScore(50);
                this.dotsRemaining--;
                this.activatePowerMode();
                Utils.audio.playSuccess();
            }
        }
    }

    /**
     * Activer le mode power-up
     */
    activatePowerMode() {
        this.powerMode = true;
        this.powerTimer = this.config.powerUpDuration;
        this.ghosts.forEach(g => g.mode = 'scared');
    }

    /**
     * Mettre à jour les fantômes
     */
    updateGhosts(deltaTime) {
        const ts = this.config.tileSize;
        const speed = (this.powerMode ? this.config.ghostSpeed * 0.5 : this.config.ghostSpeed) * ts * deltaTime;
        
        this.ghosts.forEach(ghost => {
            // IA simple: se déplacer aléatoirement ou vers Pac-Man
            const currentTileX = Math.round((ghost.pixelX - ts/2) / ts);
            const currentTileY = Math.round((ghost.pixelY - ts/2) / ts);
            
            // Vérifier si on est au centre d'une case
            const centerX = currentTileX * ts + ts / 2;
            const centerY = currentTileY * ts + ts / 2;
            const atCenter = Math.abs(ghost.pixelX - centerX) < speed && 
                            Math.abs(ghost.pixelY - centerY) < speed;
            
            if (atCenter) {
                ghost.x = currentTileX;
                ghost.y = currentTileY;
                
                // Choisir une nouvelle direction
                const possibleDirections = [
                    { x: 0, y: -1 }, // Haut
                    { x: 0, y: 1 },  // Bas
                    { x: -1, y: 0 }, // Gauche
                    { x: 1, y: 0 }   // Droite
                ].filter(dir => 
                    this.canMoveTo(currentTileX + dir.x, currentTileY + dir.y) &&
                    !(dir.x === -ghost.direction.x && dir.y === -ghost.direction.y) // Pas demi-tour
                );
                
                if (possibleDirections.length > 0) {
                    if (ghost.mode === 'chase' && Math.random() > 0.3) {
                        // Vers Pac-Man
                        possibleDirections.sort((a, b) => {
                            const distA = Utils.getDistance(
                                currentTileX + a.x, currentTileY + a.y,
                                this.pacman.x, this.pacman.y
                            );
                            const distB = Utils.getDistance(
                                currentTileX + b.x, currentTileY + b.y,
                                this.pacman.x, this.pacman.y
                            );
                            return distA - distB;
                        });
                        ghost.direction = possibleDirections[0];
                    } else if (ghost.mode === 'scared' && Math.random() > 0.3) {
                        // Fuir Pac-Man
                        possibleDirections.sort((a, b) => {
                            const distA = Utils.getDistance(
                                currentTileX + a.x, currentTileY + a.y,
                                this.pacman.x, this.pacman.y
                            );
                            const distB = Utils.getDistance(
                                currentTileX + b.x, currentTileY + b.y,
                                this.pacman.x, this.pacman.y
                            );
                            return distB - distA;
                        });
                        ghost.direction = possibleDirections[0];
                    } else {
                        // Aléatoire
                        ghost.direction = possibleDirections[Utils.randomInt(0, possibleDirections.length - 1)];
                    }
                }
            }
            
            // Déplacer
            const targetX = ghost.x * ts + ts / 2 + ghost.direction.x * ts;
            const targetY = ghost.y * ts + ts / 2 + ghost.direction.y * ts;
            const dx = targetX - ghost.pixelX;
            const dy = targetY - ghost.pixelY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0 && dist <= speed) {
                ghost.pixelX = targetX;
                ghost.pixelY = targetY;
                ghost.x += ghost.direction.x;
                ghost.y += ghost.direction.y;
                
                // Tunnel
                if (ghost.x < 0) {
                    ghost.x = this.map[0].length - 1;
                    ghost.pixelX = ghost.x * ts + ts / 2;
                } else if (ghost.x >= this.map[0].length) {
                    ghost.x = 0;
                    ghost.pixelX = ts / 2;
                }
            } else if (dist > speed) {
                ghost.pixelX += (dx / dist) * speed;
                ghost.pixelY += (dy / dist) * speed;
            }
        });
    }

    /**
     * Vérifier les collisions avec les fantômes
     */
    checkCollisions() {
        const pacRadius = this.config.tileSize / 2 - 2;
        const ghostRadius = this.config.tileSize / 2 - 2;
        
        this.ghosts.forEach(ghost => {
            if (Utils.checkCircleCollision(
                { x: this.pacman.pixelX, y: this.pacman.pixelY, radius: pacRadius },
                { x: ghost.pixelX, y: ghost.pixelY, radius: ghostRadius }
            )) {
                if (this.powerMode && ghost.mode === 'scared') {
                    // Manger le fantôme
                    this.addScore(200);
                    ghost.x = 7;
                    ghost.y = 7;
                    ghost.pixelX = 7 * this.config.tileSize + this.config.tileSize / 2;
                    ghost.pixelY = 7 * this.config.tileSize + this.config.tileSize / 2;
                    ghost.mode = 'chase';
                    Utils.audio.playSuccess();
                } else if (!this.powerMode) {
                    // Game Over
                    this.endGame();
                }
            }
        });
    }

    /**
     * Rendre le jeu
     */
    render(ctx) {
        // Fond noir
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Calculer l'offset pour centrer
        const ts = this.config.tileSize;
        const mapWidth = this.mapTemplate[0].length * ts;
        const mapHeight = this.mapTemplate.length * ts;
        const offsetX = (this.width - mapWidth) / 2;
        const offsetY = (this.height - mapHeight) / 2;
        
        // Dessiner le labyrinthe
        this.drawMap(ctx, offsetX, offsetY);
        
        // Dessiner les fantômes
        this.drawGhosts(ctx, offsetX, offsetY);
        
        // Dessiner Pac-Man
        this.drawPacMan(ctx, offsetX, offsetY);
        
        // UI
        this.drawUI(ctx);
    }

    /**
     * Dessiner le labyrinthe
     */
    drawMap(ctx, offsetX, offsetY) {
        const ts = this.config.tileSize;
        
        for (let r = 0; r < this.map.length; r++) {
            for (let c = 0; c < this.map[r].length; c++) {
                const x = offsetX + c * ts;
                const y = offsetY + r * ts;
                const cell = this.map[r][c];
                
                switch (cell.type) {
                    case 'wall':
                        ctx.fillStyle = this.colors.wall;
                        ctx.fillRect(x, y, ts, ts);
                        
                        // Bordure arrondie pour l'esthétique
                        ctx.strokeStyle = '#4444ff';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(x + 1, y + 1, ts - 2, ts - 2);
                        break;
                        
                    case 'dot':
                        ctx.fillStyle = this.colors.dot;
                        ctx.beginPath();
                        ctx.arc(x + ts/2, y + ts/2, 2, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                        
                    case 'superDot':
                        // Super pastille qui pulse
                        const pulse = 1 + Math.sin(Date.now() / 200) * 0.3;
                        ctx.fillStyle = this.colors.superDot;
                        ctx.shadowColor = this.colors.superDot;
                        ctx.shadowBlur = 10;
                        ctx.beginPath();
                        ctx.arc(x + ts/2, y + ts/2, 6 * pulse, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                        break;
                }
            }
        }
    }

    /**
     * Dessiner Pac-Man
     */
    drawPacMan(ctx, offsetX, offsetY) {
        const x = this.pacman.pixelX + offsetX;
        const y = this.pacman.pixelY + offsetY;
        const radius = this.config.tileSize / 2 - 2;
        
        // Calculer l'angle de rotation selon la direction
        let rotation = 0;
        if (this.pacman.direction.x === 1) rotation = 0;
        else if (this.pacman.direction.x === -1) rotation = Math.PI;
        else if (this.pacman.direction.y === 1) rotation = Math.PI / 2;
        else if (this.pacman.direction.y === -1) rotation = -Math.PI / 2;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        // Corps de Pac-Man
        ctx.fillStyle = this.colors.pacman;
        ctx.shadowColor = this.colors.pacman;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, radius, this.mouthAngle, Math.PI * 2 - this.mouthAngle);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.restore();
    }

    /**
     * Dessiner les fantômes
     */
    drawGhosts(ctx, offsetX, offsetY) {
        const ts = this.config.tileSize;
        const radius = ts / 2 - 2;
        
        this.ghosts.forEach(ghost => {
            const x = ghost.pixelX + offsetX;
            const y = ghost.pixelY + offsetY;
            
            // Couleur selon le mode
            let color = ghost.color;
            if (this.powerMode && ghost.mode === 'scared') {
                // Clignotement quand le temps est presque écoulé
                if (this.powerTimer < 2000 && Math.floor(Date.now() / 200) % 2 === 0) {
                    color = '#ffffff';
                } else {
                    color = this.colors.ghostScared;
                }
            }
            
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            
            // Forme du fantôme (demi-cercle + corps ondulé)
            ctx.beginPath();
            ctx.arc(x, y - radius/3, radius, Math.PI, 0, false);
            
            // Bas ondulé
            const waveCount = 4;
            const waveWidth = (radius * 2) / waveCount;
            for (let i = 0; i < waveCount; i++) {
                const wx = x - radius + i * waveWidth;
                const wy = y + radius/3;
                ctx.lineTo(wx + waveWidth/2, wy + (i % 2 === 0 ? 4 : 0));
                ctx.lineTo(wx + waveWidth, wy);
            }
            
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Yeux
            if (!this.powerMode || ghost.mode !== 'scared') {
                // Yeux normaux
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.ellipse(x - radius/3, y - radius/3, radius/4, radius/3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(x + radius/3, y - radius/3, radius/4, radius/3, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Pupilles (regardent Pac-Man)
                const lookDir = {
                    x: this.pacman.pixelX - ghost.pixelX,
                    y: this.pacman.pixelY - ghost.pixelY
                };
                const lookDist = Math.sqrt(lookDir.x ** 2 + lookDir.y ** 2);
                const pupilOffset = {
                    x: lookDist > 0 ? (lookDir.x / lookDist) * 2 : 0,
                    y: lookDist > 0 ? (lookDir.y / lookDist) * 2 : 0
                };
                
                ctx.fillStyle = '#0000aa';
                ctx.beginPath();
                ctx.arc(x - radius/3 + pupilOffset.x, y - radius/3 + pupilOffset.y, radius/6, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + radius/3 + pupilOffset.x, y - radius/3 + pupilOffset.y, radius/6, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Yeux effrayés
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(x - radius/3, y - radius/3, radius/5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + radius/3, y - radius/3, radius/5, 0, Math.PI * 2);
                ctx.fill();
                
                // Bouche en forme de vagues
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x - radius/2, y + radius/4);
                for (let i = 0; i < 4; i++) {
                    ctx.lineTo(x - radius/2 + (i+0.5) * radius/2, y + radius/4 + (i % 2 === 0 ? 3 : -3));
                }
                ctx.stroke();
            }
        });
    }

    /**
     * Dessiner l'interface utilisateur
     */
    drawUI(ctx) {
        // Score
        Utils.canvas.drawGlowText(ctx, `Score: ${Utils.formatScore(this.score)}`, 60, 25, {
            font: 'bold 18px Orbitron',
            color: this.colors.text,
            glowColor: this.colors.primary,
            glowSize: 10,
            align: 'left'
        });
        
        // Pastilles restantes
        Utils.canvas.drawGlowText(ctx, `Pastilles: ${this.dotsRemaining}`, this.width - 60, 25, {
            font: 'bold 16px Orbitron',
            color: this.colors.dot,
            glowColor: this.colors.dot,
            glowSize: 8,
            align: 'right'
        });
        
        // Indicateur Power Mode
        if (this.powerMode) {
            const barWidth = 100;
            const barHeight = 8;
            const x = this.width / 2 - barWidth / 2;
            const y = 15;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x, y, barWidth, barHeight);
            
            ctx.fillStyle = this.colors.superDot;
            ctx.shadowColor = this.colors.superDot;
            ctx.shadowBlur = 10;
            ctx.fillRect(x, y, barWidth * (this.powerTimer / this.config.powerUpDuration), barHeight);
            ctx.shadowBlur = 0;
        }
    }

    /**
     * Gérer les touches pressées
     */
    handleKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
            case 'z':
                this.nextDirection = { x: 0, y: -1 };
                break;
            case 'arrowdown':
            case 's':
                this.nextDirection = { x: 0, y: 1 };
                break;
            case 'arrowleft':
            case 'a':
            case 'q':
                this.nextDirection = { x: -1, y: 0 };
                break;
            case 'arrowright':
            case 'd':
                this.nextDirection = { x: 1, y: 0 };
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
            <strong>🟡 Pac-Man</strong> - Mangez toutes les pastilles!<br>
            <span style="color: var(--neon-blue)">⬆️⬇️⬅️➡️ Flèches</span> pour vous déplacer | 
            Évitez les 👻 ou mangez-les avec les <span style="color: #ffb8ff">⭐ super pastilles!</span>
        `;
    }
}

// Enregistrer le jeu
window.Games.pacman = PacManGame;
