/**
 * ============================================
 * ARCADE ULTIMATE - TETRIS GAME
 * Le classique des blocs tombants
 * ============================================
 */

class TetrisGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Configuration de la grille
        this.cols = 10;
        this.rows = 20;
        this.blockSize = Math.floor((canvas.width - 120) / this.cols); // Espace pour le panel
        
        // Formes Tétris (térominos)
        this.shapes = {
            I: { shape: [[1,1,1,1]], color: '#00f5ff' },
            O: { shape: [[1,1],[1,1]], color: '#ffff00' },
            T: { shape: [[0,1,0],[1,1,1]], color: '#a855f7' },
            L: { shape: [[1,0,0],[1,1,1]], color: '#f97316' },
            J: { shape: [[0,0,1],[1,1,1]], color: '#3b82f6' },
            S: { shape: [[0,1,1],[1,1,0]], color: '#22c55e' },
            Z: { shape: [[1,1,0],[0,1,1]], color: '#ef4444' }
        };
        
        // Système d'effets
        this.particles = new ParticleSystem(200);
        this.lineClearEffects = [];
        
        // Initialiser
        this.init();
    }
    
    init() {
        // Grille vide
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        
        // Pièce courante
        this.currentPiece = null;
        this.nextPiece = null;
        
        // Score et niveau
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.comboCount = -1; // -1 car le premier clear ne compte pas comme combo
        
        // Timing
        this.dropTimer = 0;
        this.baseDropInterval = 1.0;
        this.dropInterval = this.baseDropInterval;
        this.lockDelay = 500;
        this.lockTimer = 0;
        this.canHold = true;
        this.heldPiece = null;
        
        // Contrôles (soft drop, etc.)
        this.softDropping = false;
        this.moveLeftTimer = 0;
        this.moveRightTimer = 0;
        this.autoRepeatRate = 0.05;
        this.dasDelay = 0.17; // Delayed Auto Shift
        
        // État spécial
        this.isSpinning = false; // T-Spin detection simplifiée
        this.lastAction = '';
        
        // Stats
        this.piecesPlaced = 0;
        this.maxCombo = 0;
        this.tetrisCount = 0; // 4 lignes en même temps
        
        // Animation de ligne complétée
        this.clearingLines = [];
        this.clearAnimationTimer = 0;
        this.clearAnimationDuration = 0.4;
        
        // Générer les premières pièces
        this.nextPiece = this.createRandomPiece();
        this.spawnNewPiece();
        
        // État
        this.gameOver = false;
        this.gameState = GAME_STATES.IDLE;
    }
    
    createRandomPiece() {
        const shapeNames = Object.keys(this.shapes);
        const name = shapeNames[MathUtils.randomInt(0, shapeNames.length - 1)];
        const shapeData = this.shapes[name];
        
        return {
            name: name,
            shape: shapeData.shape.map(row => [...row]),
            color: shapeData.color,
            x: Math.floor(this.cols / 2) - Math.ceil(shapeData.shape[0].length / 2),
            y: 0,
            rotation: 0
        };
    }
    
    spawnNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createRandomPiece();
        this.canHold = true;
        this.lockTimer = 0;
        
        // Vérifier game over immédiat
        if (!this.isValidPosition(this.currentPiece, 0, 0)) {
            this.gameOverSequence();
        }
        
        this.piecesPlaced++;
    }
    
    isValidPosition(piece, offsetX, offsetY, newShape = null) {
        const shape = newShape || piece.shape;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = piece.x + col + offsetX;
                    const newY = piece.y + row + offsetY;
                    
                    // Hors limites
                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return false;
                    }
                    
                    // Collision avec bloc existant
                    if (newY >= 0 && this.board[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    rotatePiece(clockwise = true) {
        if (!this.currentPiece || this.clearingLines.length > 0) return;
        
        const piece = this.currentPiece;
        const shape = piece.shape;
        const rows = shape.length;
        const cols = shape[0].length;
        
        // Créer la matice rotée
        const rotated = [];
        if (clockwise) {
            for (let c = 0; c < cols; c++) {
                rotated[c] = [];
                for (let r = rows - 1; r >= 0; r--) {
                    rotated[c][rows - 1 - r] = shape[r][c];
                }
            }
        } else {
            for (let c = cols - 1; c >= 0; c--) {
                rotated[cols - 1 - c] = [];
                for (let r = 0; r < rows; r++) {
                    rotated[cols - 1 - c][r] = shape[r][c];
                }
            }
        }
        
        // Wall kicks - essayer différentes positions
        const kicks = [0, -1, 1, -2, 2]; // Offsets à essayer
        
        for (const kick of kicks) {
            if (this.isValidPosition(piece, kick, 0, rotated)) {
                piece.shape = rotated;
                piece.x += kick;
                piece.rotation = (piece.rotation + 1) % 4;
                
                // Son de rotation
                if (this.engine?.soundManager) {
                    this.engine.soundManager.playClick();
                }
                
                return true;
            }
        }
        
        return false;
    }
    
    movePiece(dir) {
        if (!this.currentPiece || this.clearingLines.length > 0) return false;
        
        if (this.isValidPosition(this.currentPiece, dir, 0)) {
            this.currentPiece.x += dir;
            
            if (this.engine?.soundManager && Math.random() > 0.7) {
                this.engine.soundManager.playClick();
            }
            
            return true;
        }
        
        return false;
    }
    
    moveDown(instant = false) {
        if (!this.currentPiece || this.clearingLines.length > 0) return false;
        
        if (this.isValidPosition(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
            
            if (instant) {
                this.score += 1;
            }
            
            return true;
        } else {
            // Ne peut plus descendre = lock
            this.lockPiece();
            return false;
        }
    }
    
    hardDrop() {
        if (!this.currentPiece || this.clearingLines.length > 0) return;
        
        let dropDistance = 0;
        while (this.isValidPosition(this.currentPiece, 0, dropDistance + 1)) {
            dropDistance++;
        }
        
        this.currentPiece.y += dropDistance;
        this.score += dropDistance * 2;
        
        // Particules de hard drop
        const pieceX = (this.currentPiece.x + this.currentPiece.shape[0].length / 2) * this.blockSize;
        const pieceY = (this.currentPiece.y + this.currentPiece.shape.length / 2) * this.blockSize;
        
        this.particles.emit(pieceX, pieceY, {
            count: 15,
            speed: 8,
            size: 4,
            colors: ['#ffffff', this.currentPiece.color],
            life: 0.5,
            gravity: 300,
            spread: Math.PI * 2
        });
        
        if (this.engine?.soundManager) {
            this.engine.soundManager.playHit();
        }
        
        this.lockPiece();
    }
    
    lockPiece() {
        if (!this.currentPiece) return;
        
        // Placer la pièce sur le board
        const piece = this.currentPiece;
        
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    const boardY = piece.y + row;
                    const boardX = piece.x + col;
                    
                    if (boardY >= 0 && boardY < this.rows && boardX >= 0 && boardX < this.cols) {
                        this.board[boardY][boardX] = {
                            color: piece.color,
                            locked: true
                        };
                    }
                }
            }
        }
        
        // Vérifier les lignes complètes
        this.checkLines();
    }
    
    checkLines() {
        const completedLines = [];
        
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                completedLines.push(row);
            }
        }
        
        if (completedLines.length > 0) {
            // Démarrer l'animation de clear
            this.clearingLines = completedLines;
            this.clearAnimationTimer = this.clearAnimationDuration;
            
            // Calcul du score
            this.comboCount++;
            const linePoints = [0, 100, 300, 500, 800]; // Points par nombre de lignes
            const points = linePoints[completedLines.length] * this.level;
            const comboBonus = this.comboCount > 1 ? 50 * this.comboCount * this.level : 0;
            
            this.score += points + comboBonus;
            this.lines += completedLines.length;
            
            if (completedLines.length === 4) {
                this.tetrisCount++;
            }
            
            if (this.comboCount > this.maxCombo) {
                this.maxCombo = this.comboCount;
            }
            
            // Particules pour chaque ligne
            for (const lineRow of completedLines) {
                const y = lineRow * this.blockSize + this.blockSize / 2;
                for (let x = 0; x < this.cols; x++) {
                    this.particles.emit(x * this.blockSize + this.blockSize / 2, y, {
                        count: 3,
                        speed: 6,
                        size: 5,
                        colors: ['#ffffff', '#fbbf24', this.board[lineRow][x]?.color || '#fff'],
                        life: 0.8,
                        gravity: 200,
                        spread: Math.PI * 2
                    });
                }
            }
            
            // Son
            if (this.engine?.soundManager) {
                if (completedLines.length === 4) {
                    this.engine.soundManager.playVictory();
                } else {
                    this.engine.soundManager.playCoin();
                }
            }
            
            // Mettre à jour le niveau
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(0.05, this.baseDropInterval - (this.level - 1) * 0.08);
            
            // Mettre à jour l'affichage
            if (this.engine) {
                this.engine.score = this.score;
                this.engine.updateScoreDisplay();
            }
        } else {
            // Pas de lignes, reset combo
            this.comboCount = -1;
            
            // Spawner nouvelle pièce
            this.spawnNewPiece();
        }
    }
    
    completeLineClear() {
        // Supprimer les lignes complétées (de bas en haut)
        const sortedLines = [...this.clearingLines].sort((a, b) => b - a);
        
        for (const line of sortedLines) {
            this.board.splice(line, 1);
            this.board.unshift(Array(this.cols).fill(0));
        }
        
        this.clearingLines = [];
        
        // Spawner nouvelle pièce
        this.spawnNewPiece();
    }
    
    holdPiece() {
        if (!this.canHold || !this.currentPiece || this.clearingLines.length > 0) return;
        
        const currentName = this.currentPiece.name;
        
        if (this.heldPiece) {
            // Échanger avec le held
            const temp = this.heldPiece;
            this.heldPiece = currentName;
            
            // Créer la pièce tenue
            const shapeData = this.shapes[temp];
            this.currentPiece = {
                name: temp,
                shape: shapeData.shape.map(row => [...row]),
                color: shapeData.color,
                x: Math.floor(this.cols / 2) - Math.ceil(shapeData.shape[0].length / 2),
                y: 0,
                rotation: 0
            };
        } else {
            // Premier hold
            this.heldPiece = currentName;
            this.spawnNewPiece();
        }
        
        this.canHold = false;
        
        if (this.engine?.soundManager) {
            this.engine.soundManager.playClick();
        }
    }
    
    gameOverSequence() {
        this.gameOver = true;
        this.gameState = GAME_STATES.GAME_OVER;
        
        // Effet de game over - faire clignoter le board
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col]) {
                    const x = col * this.blockSize + this.blockSize / 2;
                    const y = row * this.blockSize + this.blockSize / 2;
                    
                    setTimeout(() => {
                        this.particles.emit(x, y, {
                            count: 5,
                            speed: 4,
                            size: 4,
                            colors: ['#ef4444', '#ffffff'],
                            life: 1,
                            gravity: 150,
                            spread: Math.PI * 2
                        });
                    }, (row * this.cols + col) * 10);
                }
            }
        }
        
        if (this.engine?.soundManager) {
            this.engine.soundManager.playGameOver();
        }
        
        setTimeout(() => {
            this.endGame(false, '💀 GAME OVER', '💀');
        }, 1500);
    }
    
    getGhostPosition() {
        if (!this.currentPiece) return null;
        
        let ghostY = this.currentPiece.y;
        while (this.isValidPosition(this.currentPiece, 0, ghostY - this.currentPiece.y + 1)) {
            ghostY++;
        }
        
        return ghostY;
    }
    
    update(dt) {
        super.update(dt);
        
        if (this.gameOver || this.gameState !== GAME_STATES.PLAYING) return;
        
        // Mise à jour particules
        this.particles.update(dt);
        
        // Animation de clear de lignes
        if (this.clearingLines.length > 0) {
            this.clearAnimationTimer -= dt;
            
            if (this.clearAnimationTimer <= 0) {
                this.completeLineClear();
            }
            return; // Pas de mouvement pendant l'animation
        }
        
        // Auto-drop
        const currentInterval = this.softDropping ? this.dropInterval * 0.1 : this.dropInterval;
        this.dropTimer += dt;
        
        if (this.dropTimer >= currentInterval) {
            this.dropTimer = 0;
            this.moveDown();
        }
        
        // Lock delay
        if (this.currentPiece && !this.isValidPosition(this.currentPiece, 0, 1)) {
            this.lockTimer += dt * 1000;
            
            if (this.lockTimer >= this.lockDelay) {
                this.lockPiece();
            }
        } else {
            this.lockTimer = 0;
        }
        
        // Auto-repeat pour les touches maintenues
        if (this.moveLeftTimer > 0) {
            this.moveLeftTimer -= dt;
            if (this.moveLeftTimer <= 0) {
                this.movePiece(-1);
                this.moveLeftTimer = -this.autoRepeatRate; // Continue tant que la touche est pressée
            }
        }
        
        if (this.moveRightTimer > 0) {
            this.moveRightTimer -= dt;
            if (this.moveRightTimer <= 0) {
                this.movePiece(1);
                this.moveRightTimer = -this.autoRepeatRate;
            }
        }
    }
    
    render() {
        const ctx = this.ctx;
        const panelWidth = 115;
        const playAreaWidth = this.cols * this.blockSize;
        const offsetX = (this.width - playAreaWidth - panelWidth) / 2;
        const offsetY = (this.height - this.rows * this.blockSize) / 2;
        
        // Fond
        ctx.fillStyle = '#0a0a12';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Zone de jeu
        ctx.save();
        ctx.translate(offsetX, offsetY);
        
        // Fond de la grille
        ctx.fillStyle = '#111118';
        RenderUtils.roundRect(ctx, -5, -5, playAreaWidth + 10, this.rows * this.blockSize + 10, 10);
        ctx.fill();
        
        // Bordure glow
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 2;
        RenderUtils.roundRect(ctx, -5, -5, playAreaWidth + 10, this.rows * this.blockSize + 10, 10);
        ctx.stroke();
        
        // Grille
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * this.blockSize, 0);
            ctx.lineTo(i * this.blockSize, this.rows * this.blockSize);
            ctx.stroke();
        }
        
        for (let i = 0; i <= this.rows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * this.blockSize);
            ctx.lineTo(playAreaWidth, i * this.blockSize);
            ctx.stroke();
        }
        
        // Board (blocs placés)
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                if (cell) {
                    const isClearing = this.clearingLines.includes(row);
                    
                    if (isClearing) {
                        // Animation de flash blanc
                        const flashAlpha = this.clearAnimationTimer / this.clearAnimationDuration;
                        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
                    } else {
                        this.renderBlock(ctx, col * this.blockSize, row * this.blockSize, cell.color);
                    }
                    
                    if (!isClearing) {
                        this.renderBlock(ctx, col * this.blockSize, row * this.blockSize, cell.color);
                    } else {
                        ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.5;
                        this.renderBlock(ctx, col * this.blockSize, row * this.blockSize, '#ffffff');
                        ctx.globalAlpha = 1;
                    }
                }
            }
        }
        
        // Ghost piece
        if (this.currentPiece && this.clearingLines.length === 0) {
            const ghostY = this.getGhostPosition();
            
            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (this.currentPiece.shape[row][col]) {
                        const x = (this.currentPiece.x + col) * this.blockSize;
                        const y = (ghostY + row) * this.blockSize;
                        
                        ctx.strokeStyle = this.currentPiece.color;
                        ctx.lineWidth = 2;
                        ctx.globalAlpha = 0.3;
                        RenderUtils.roundRect(ctx, x + 2, y + 2, this.blockSize - 4, this.blockSize - 4, 4);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }
            }
        }
        
        // Pièce courante
        if (this.currentPiece && this.clearingLines.length === 0) {
            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (this.currentPiece.shape[row][col]) {
                        const x = (this.currentPiece.x + col) * this.blockSize;
                        const y = (this.currentPiece.y + row) * this.blockSize;
                        
                        this.renderBlock(ctx, x, y, this.currentPiece.color);
                    }
                }
            }
        }
        
        ctx.restore();
        
        // Particules
        this.particles.render(ctx);
        
        // Panel d'info
        this.renderPanel(ctx, offsetX + playAreaWidth + 20, offsetY);
    }
    
    renderBlock(ctx, x, y, color) {
        const size = this.blockSize;
        const padding = 2;
        
        // Bloc principal avec gradient
        const grad = ctx.createLinearGradient(x, y, x + size, y + size);
        grad.addColorStop(0, this.lightenColor(color, 30));
        grad.addColorStop(0.5, color);
        grad.addColorStop(1, this.darkenColor(color, 20));
        
        ctx.fillStyle = grad;
        RenderUtils.roundRect(ctx, x + padding, y + padding, size - padding * 2, size - padding * 2, 5);
        ctx.fill();
        
        // Highlight en haut à gauche
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        RenderUtils.roundRect(ctx, x + padding + 2, y + padding + 2, size - padding * 2 - 4, (size - padding * 2) / 3, 3);
        ctx.fill();
        
        // Shadow en bas à droite
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        RenderUtils.roundRect(ctx, x + padding + 2, y + size - padding - (size - padding * 2) / 3, size - padding * 2 - 4, (size - padding * 2) / 3 - 2, 3);
        ctx.fill();
    }
    
    renderPanel(ctx, x, y) {
        // Fond du panel
        ctx.fillStyle = 'rgba(17, 17, 24, 0.9)';
        RenderUtils.roundRect(ctx, x - 10, y - 10, 130, this.rows * this.blockSize + 20, 10);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.lineWidth = 1;
        RenderUtils.roundRect(ctx, x - 10, y - 10, 130, this.rows * this.blockSize + 20, 10);
        ctx.stroke();
        
        let currentY = y + 20;
        
        // NEXT PIECE
        ctx.font = 'bold 14px Orbitron';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('SUIVANT', x + 55, currentY);
        currentY += 25;
        
        if (this.nextPiece) {
            this.renderMiniPiece(ctx, x + 55, currentY, this.nextPiece);
        }
        currentY += 100;
        
        // HOLD
        ctx.font = 'bold 14px Orbitron';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('HOLD', x + 55, currentY);
        currentY += 25;
        
        if (this.heldPiece) {
            const heldShapeData = this.shapes[this.heldPiece];
            const alpha = this.canHold ? 1 : 0.4;
            ctx.globalAlpha = alpha;
            this.renderMiniPieceFromShape(ctx, x + 55, currentY, heldShapeData.shape, heldShapeData.color);
            ctx.globalAlpha = 1;
        }
        currentY += 80;
        
        // SCORE
        ctx.font = 'bold 14px Orbitron';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('SCORE', x + 55, currentY);
        currentY += 22;
        
        ctx.font = 'bold 22px Orbitron';
        ctx.fillStyle = '#10b981';
        ctx.fillText(this.score.toLocaleString(), x + 55, currentY);
        currentY += 40;
        
        // NIVEAU
        ctx.font = 'bold 14px Orbitron';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('NIVEAU', x + 55, currentY);
        currentY += 22;
        
        ctx.font = 'bold 22px Orbitron';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText(this.level.toString(), x + 55, currentY);
        currentY += 40;
        
        // LIGNES
        ctx.font = 'bold 14px Orbitron';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('LIGNES', x + 55, currentY);
        currentY += 22;
        
        ctx.font = 'bold 22px Orbitron';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(this.lines.toString(), x + 55, currentY);
        currentY += 50;
        
        // Combo actuel
        if (this.comboCount > 0) {
            ctx.font = 'bold 16px Orbitron';
            ctx.fillStyle = '#ec4899';
            ctx.fillText(`${this.comboCount}x COMBO`, x + 55, currentY);
        }
        
        ctx.textAlign = 'left';
    }
    
    renderMiniPiece(ctx, centerX, centerY, piece) {
        this.renderMiniPieceFromShape(ctx, centerX, centerY, piece.shape, piece.color);
    }
    
    renderMiniPieceFromShape(ctx, centerX, centerY, shape, color) {
        const miniBlockSize = 18;
        const width = shape[0].length * miniBlockSize;
        const height = shape.length * miniBlockSize;
        const startX = centerX - width / 2;
        const startY = centerY - height / 2;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = startX + col * miniBlockSize;
                    const y = startY + row * miniBlockSize;
                    
                    ctx.fillStyle = color;
                    RenderUtils.roundRect(ctx, x, y, miniBlockSize - 2, miniBlockSize - 2, 3);
                    ctx.fill();
                }
            }
        }
    }
    
    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `rgb(${R}, ${G}, ${B})`;
    }
    
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `rgb(${R}, ${G}, ${B})`;
    }
    
    handleKey(key, code) {
        if (this.gameOver || this.clearingLines.length > 0) return;
        
        switch (code) {
            case 'ArrowLeft':
                if (this.movePiece(-1)) {
                    this.moveLeftTimer = this.dasDelay;
                }
                break;
            case 'ArrowRight':
                if (this.movePiece(1)) {
                    this.moveRightTimer = this.dasDelay;
                }
                break;
            case 'ArrowDown':
                this.softDropping = true;
                this.moveDown(true);
                break;
            case 'ArrowUp':
            case 'KeyX':
                this.rotatePiece(true);
                break;
            case 'KeyZ':
            case 'ControlLeft':
                this.rotatePiece(false);
                break;
            case 'Space':
                this.hardDrop();
                break;
            case 'ShiftLeft':
            case 'KeyC':
                this.holdPiece();
                break;
        }
    }
    
    handleKeyUp(key, code) {
        switch (code) {
            case 'ArrowDown':
                this.softDropping = false;
                break;
            case 'ArrowLeft':
                this.moveLeftTimer = 0;
                break;
            case 'ArrowRight':
                this.moveRightTimer = 0;
                break;
        }
    }
}
