// arcade-collection/js/games/tetris.js

/**
 * ============================================
 * ARCADE COLLECTION - TETRIS
 * Classique jeu de blocs qui tombent
 * Contrôles: Flèches pour déplacer/rotation, Espace pour drop
 * ============================================
 */

class TetrisGame extends BaseGame {
    constructor(ctx, width, height) {
        super(ctx, width, height);
        
        // Configuration du plateau
        this.config = {
            cols: 10,
            rows: 20,
            blockSize: 0, // Calculé dynamiquement
            previewSize: 4,
            baseSpeed: 1,
            speedIncrement: 0.1,
            maxSpeed: 10,
            softDropSpeed: 20,
            lockDelay: 500,
            dasDelay: 170,  // Delayed Auto Shift
            dasRepeat: 50
        };
        
        // Calculer la taille des blocs
        this.calculateBlockSize();
        
        // Couleurs des pièces (style néon)
        this.pieceColors = {
            I: '#64b5f6',  // Cyan
            O: '#fff176',  // Jaune
            T: '#ce93d8',  // Violet
            S: '#81c784',  // Vert
            Z: '#f48fb1',  // Rose
            J: '#90caf9',  // Bleu clair
            L: '#ffb74d'   // Orange
        };
        
        // Formes des pièces (matrices 4x4)
        this.pieces = {
            I: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            O: [
                [1, 1],
                [1, 1]
            ],
            T: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            S: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            Z: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            J: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            L: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ]
        };
        
        // État du jeu (initialisé dans init())
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropTimer = 0;
        this.lockTimer = 0;
        this.isLocking = false;
        this.gameOver = false;
        
        // Input state
        this.keys = {};
        this.dasTimer = {};
        this.dasActive = {};
        
        // Couleurs
        this.colors = {
            ...this.colors,
            background: '#0a0a12',
            boardBg: 'rgba(18, 18, 26, 0.9)',
            gridLine: 'rgba(255, 255, 255, 0.05)',
            ghostPiece: 'rgba(255, 255, 255, 0.15)'
        };
    }

    /**
     * Calculer la taille des blocs selon l'espace disponible
     */
    calculateBlockSize() {
        const maxWidth = this.width * 0.7; // 70% pour le plateau
        const maxHeight = this.height * 0.95;
        
        this.config.blockSize = Math.min(
            Math.floor(maxWidth / this.config.cols),
            Math.floor(maxHeight / this.config.rows)
        );
        
        // Ajuster si trop petit
        if (this.config.blockSize < 15) {
            this.config.blockSize = 15;
        }
    }

    /**
     * Initialiser le jeu
     */
    init() {
        super.init();
        
        // Recalculer les dimensions
        this.calculateBlockSize();
        
        // Créer le plateau vide
        this.board = Array(this.config.rows).fill(null).map(() => 
            Array(this.config.cols).fill(null)
        );
        
        // Réinitialiser les stats
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropTimer = 0;
        this.isLocking = false;
        this.lockTimer = 0;
        
        // Générer les premières pièces
        this.nextPiece = this.createRandomPiece();
        this.spawnPiece();
        
        console.log('[Tetris] Jeu initialisé');
    }

    /**
     * Créer une pièce aléatoire
     */
    createRandomPiece() {
        const types = Object.keys(this.pieces);
        const type = types[Utils.randomInt(0, types.length - 1)];
        return {
            type: type,
            shape: this.pieces[type].map(row => [...row]),
            color: this.pieceColors[type],
            x: 0,
            y: 0
        };
    }

    /**
     * Faire apparaître une nouvelle pièce
     */
    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createRandomPiece();
        
        // Position initiale (centré en haut)
        const pieceWidth = this.currentPiece.shape[0].length;
        this.currentPiece.x = Math.floor((this.config.cols - pieceWidth) / 2);
        this.currentPiece.y = 0;
        
        // Vérifier game over immédiat
        if (!this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
            this.endGame();
        }
        
        this.isLocking = false;
        this.lockTimer = 0;
    }

    /**
     * Mettre à jour le jeu
     */
    update(deltaTime) {
        if (this.gameOver) return;
        
        // Gérer DAS (Delayed Auto Shift)
        this.handleDAS(deltaTime);
        
        // Gravité
        this.dropTimer += deltaTime * this.getDropSpeed();
        
        if (this.dropTimer >= 1) {
            this.movePiece(0, 1);
            this.dropTimer = 0;
        }
        
        // Lock delay
        if (this.isLocking && this.isOnGround()) {
            this.lockTimer += deltaTime * 1000;
            
            if (this.lockTimer >= this.config.lockDelay) {
                this.lockPiece();
            }
        } else if (!this.isOnGround()) {
            this.isLocking = false;
            this.lockTimer = 0;
        }
    }

    /**
     * Obtenir la vitesse de chute actuelle
     */
    getDropSpeed() {
        return this.config.baseSpeed + (this.level - 1) * this.config.speedIncrement;
    }

    /**
     * Gérer DAS pour le mouvement fluide
     */
    handleDAS(deltaTime) {
        const moveKeys = ['arrowleft', 'arrowright', 'a', 'd'];
        
        for (const key of moveKeys) {
            if (Utils.input.isKeyPressed(key)) {
                if (!this.dasActive[key]) {
                    // Premier mouvement immédiat
                    this.handleKeyPress(key);
                    this.dasActive[key] = true;
                    this.dasTimer[key] = 0;
                } else {
                    // Répétition après DAS delay
                    this.dasTimer[key] += deltaTime * 1000;
                    
                    if (this.dasTimer[key] >= this.config.dasDelay) {
                        if ((this.dasTimer[key] - this.config.dasDelay) % this.config.dasRepeat < deltaTime * 1000) {
                            this.handleKeyPress(key);
                        }
                    }
                }
            } else {
                this.dasActive[key] = false;
                this.dasTimer[key] = 0;
            }
        }
        
        // Soft drop
        if (Utils.input.isKeyPressed('arrowdown') || Utils.input.isKeyPressed('s')) {
            this.dropTimer += deltaTime * this.config.softDropSpeed;
        }
    }

    /**
     * Gérer une touche pressée
     */
    handleKeyPress(key) {
        switch (key.toLowerCase()) {
            case 'arrowleft':
            case 'a':
            case 'q':
                this.movePiece(-1, 0);
                break;
            case 'arrowright':
            case 'd':
                this.movePiece(1, 0);
                break;
        }
    }

    /**
     * Déplacer la pièce
     */
    movePiece(dx, dy) {
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (this.isValidPosition(this.currentPiece.shape, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            
            if (dy > 0 && this.isOnGround()) {
                this.isLocking = true;
                this.lockTimer = 0;
            } else {
                this.isLocking = false;
                this.lockTimer = 0;
            }
            
            return true;
        }
        
        return false;
    }

    /**
     * Faire tourner la pièce
     */
    rotatePiece(direction = 1) { // 1 = horaire, -1 = anti-horaire
        const rotated = this.rotateMatrix(this.currentPiece.shape, direction);
        
        // Essayer la rotation normale
        if (this.isValidPosition(rotated, this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.shape = rotated;
            Utils.audio.playClick();
            return true;
        }
        
        // Wall kicks (essayer différentes positions)
        const kicks = [[-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1], [-1, -1], [1, -1]];
        
        for (const [kickX, kickY] of kicks) {
            if (this.isValidPosition(rotated, this.currentPiece.x + kickX, this.currentPiece.y + kickY)) {
                this.currentPiece.shape = rotated;
                this.currentPiece.x += kickX;
                this.currentPiece.y += kickY;
                Utils.audio.playClick();
                return true;
            }
        }
        
        return false;
    }

    /**
     * Rotation d'une matrice
     */
    rotateMatrix(matrix, direction) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (direction === 1) { // Horaire
                    rotated[c][rows - 1 - r] = matrix[r][c];
                } else { // Anti-horaire
                    rotated[cols - 1 - c][r] = matrix[r][c];
                }
            }
        }
        
        return rotated;
    }

    /**
     * Hard drop (chute instantanée)
     */
    hardDrop() {
        let distance = 0;
        while (this.movePiece(0, 1)) {
            distance++;
        }
        this.addScore(distance * 2);
        this.lockPiece();
        Utils.audio.playBounce();
    }

    /**
     * Vérifier si une position est valide
     */
    isValidPosition(shape, offsetX, offsetY) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const newX = offsetX + c;
                    const newY = offsetY + r;
                    
                    // Hors limites
                    if (newX < 0 || newX >= this.config.cols || newY >= this.config.rows) {
                        return false;
                    }
                    
                    // Collision avec le plateau
                    if (newY >= 0 && this.board[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Vérifier si la pièce touche le sol ou un autre bloc
     */
    isOnGround() {
        return !this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1);
    }

    /**
     * Verrouiller la pièce sur le plateau
     */
    lockPiece() {
        const shape = this.currentPiece.shape;
        
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const boardY = this.currentPiece.y + r;
                    const boardX = this.currentPiece.x + c;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        // Vérifier les lignes complètes
        this.clearLines();
        
        // Nouvelle pièce
        this.spawnPiece();
        this.dropTimer = 0;
        
        Utils.audio.playBounce();
    }

    /**
     * Effacer les lignes complètes
     */
    clearLines() {
        let linesCleared = 0;
        
        for (let r = this.config.rows - 1; r >= 0; r--) {
            if (this.board[r].every(cell => cell !== null)) {
                // Supprimer la ligne
                this.board.splice(r, 1);
                // Ajouter une ligne vide en haut
                this.board.unshift(Array(this.config.cols).fill(null));
                
                linesCleared++;
                r++; // Revérifier cette ligne
            }
        }
        
        if (linesCleared > 0) {
            // Calculer les points
            const points = [0, 100, 300, 500, 800]; // 1, 2, 3, 4 lignes
            this.addScore(points[linesCleared] * this.level);
            this.lines += linesCleared;
            
            // Augmenter le niveau
            this.level = Math.floor(this.lines / 10) + 1;
            
            Utils.audio.playSuccess();
        }
    }

    /**
     * Obtenir la position ghost piece (projection au sol)
     */
    getGhostPosition() {
        let ghostY = this.currentPiece.y;
        
        while (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, ghostY + 1)) {
            ghostY++;
        }
        
        return ghostY;
    }

    /**
     * Rendre le jeu
     */
    render(ctx) {
        // Fond
        Utils.canvas.clear(ctx, this.width, this.height, this.colors.background);
        
        // Calculer les offsets pour centrer le plateau
        const boardWidth = this.config.cols * this.config.blockSize;
        const boardHeight = this.config.rows * this.config.blockSize;
        const offsetX = (this.width - boardWidth) / 2;
        const offsetY = (this.height - boardHeight) / 2;
        
        // Dessiner le plateau
        this.drawBoard(ctx, offsetX, offsetY);
        
        // Dessiner la pièce courante
        if (this.currentPiece && !this.gameOver) {
            // Ghost piece
            this.drawGhostPiece(ctx, offsetX, offsetY);
            
            // Pièce actuelle
            this.drawPiece(ctx, this.currentPiece, offsetX, offsetY);
        }
        
        // Dessiner le next piece preview
        this.drawNextPreview(ctx, offsetX + boardWidth + 20, offsetY);
        
        // Dessiner les stats
        this.drawStats(ctx, offsetX, offsetY + boardHeight + 20);
    }

    /**
     * Dessiner le plateau
     */
    drawBoard(ctx, offsetX, offsetY) {
        const bs = this.config.blockSize;
        
        // Fond du plateau
        ctx.fillStyle = this.colors.boardBg;
        ctx.fillRect(offsetX - 2, offsetY - 2, 
                     this.config.cols * bs + 4, 
                     this.config.rows * bs + 4);
        
        // Bordure
        ctx.strokeStyle = 'rgba(100, 181, 246, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX - 2, offsetY - 2, 
                       this.config.cols * bs + 4, 
                       this.config.rows * bs + 4);
        
        // Grille et blocs
        for (let r = 0; r < this.config.rows; r++) {
            for (let c = 0; c < this.config.cols; c++) {
                const x = offsetX + c * bs;
                const y = offsetY + r * bs;
                
                if (this.board[r][c]) {
                    // Bloc rempli
                    this.drawBlock(ctx, x, y, bs, this.board[r][c]);
                } else {
                    // Cellule vide avec grille subtile
                    ctx.strokeStyle = this.colors.gridLine;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, bs, bs);
                }
            }
        }
    }

    /**
     * Dessiner un bloc
     */
    drawBlock(ctx, x, y, size, color) {
        const padding = 1;
        
        // Bloc principal
        ctx.fillStyle = color;
        ctx.fillRect(x + padding, y + padding, size - padding * 2, size - padding * 2);
        
        // Highlight (haut-gauche)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x + padding, y + padding, size - padding * 2, 3);
        ctx.fillRect(x + padding, y + padding, 3, size - padding * 2);
        
        // Shadow (bas-droite)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x + size - padding - 3, y + padding + 3, 3, size - padding * 2 - 3);
        ctx.fillRect(x + padding + 3, y + size - padding - 3, size - padding * 2 - 3, 3);
    }

    /**
     * Dessiner une pièce
     */
    drawPiece(ctx, piece, offsetX, offsetY) {
        const bs = this.config.blockSize;
        
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    const x = offsetX + (piece.x + c) * bs;
                    const y = offsetY + (piece.y + r) * bs;
                    this.drawBlock(ctx, x, y, bs, piece.color);
                }
            }
        }
    }

    /**
     * Dessiner la ghost piece
     */
    drawGhostPiece(ctx, offsetX, offsetY) {
        const bs = this.config.blockSize;
        const ghostY = this.getGhostPosition();
        
        ctx.globalAlpha = 0.3;
        
        for (let r = 0; r < this.currentPiece.shape.length; r++) {
            for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
                if (this.currentPiece.shape[r][c]) {
                    const x = offsetX + (this.currentPiece.x + c) * bs;
                    const y = offsetY + (ghostY + r) * bs;
                    
                    ctx.strokeStyle = this.currentPiece.color;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x + 2, y + 2, bs - 4, bs - 4);
                }
            }
        }
        
        ctx.globalAlpha = 1;
    }

    /**
     * Dessiner le preview de la prochaine pièce
     */
    drawNextPreview(ctx, x, y) {
        // Titre
        ctx.font = 'bold 14px Orbitron';
        ctx.fillStyle = this.colors.textMuted;
        ctx.textAlign = 'left';
        ctx.fillText('SUIVANT', x, y - 10);
        
        // Fond
        ctx.fillStyle = this.colors.boardBg;
        ctx.fillRect(x, y, 90, 70);
        ctx.strokeStyle = 'rgba(100, 181, 246, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 90, 70);
        
        if (this.nextPiece) {
            const shape = this.nextPiece.shape;
            const blockSize = 18;
            const pieceWidth = shape[0].length * blockSize;
            const pieceHeight = shape.length * blockSize;
            const px = x + (90 - pieceWidth) / 2;
            const py = y + (70 - pieceHeight) / 2;
            
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        this.drawBlock(ctx, px + c * blockSize, py + r * blockSize, 
                                      blockSize, this.nextPiece.color);
                    }
                }
            }
        }
    }

    /**
     * Dessiner les statistiques
     */
    drawStats(ctx, x, y) {
        const stats = [
            { label: 'SCORE', value: Utils.formatScore(this.score), color: this.colors.primary },
            { label: 'LIGNES', value: this.lines.toString(), color: this.colors.secondary },
            { label: 'NIVEAU', value: this.level.toString(), color: this.colors.accent }
        ];
        
        ctx.font = 'bold 14px Orbitron';
        ctx.textAlign = 'center';
        
        stats.forEach((stat, i) => {
            const statX = x + (i * (this.config.cols * this.config.blockSize / 3)) + 
                         (this.config.cols * this.config.blockSize / 6);
            
            ctx.fillStyle = this.colors.textMuted;
            ctx.font = '11px Orbitron';
            ctx.fillText(stat.label, statX, y);
            
            ctx.fillStyle = stat.color;
            ctx.font = 'bold 20px Orbitron';
            ctx.fillText(stat.value, statX, y + 25);
        });
    }

    /**
     * Gérer les touches pressées
     */
    handleKeyDown(e) {
        if (this.gameOver) {
            if (e.key === 'r') {
                this.init();
            }
            return;
        }
        
        switch (e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
            case 'x':
                this.rotatePiece(1);
                break;
            case 'z':
            case 'control':
                this.rotatePiece(-1); // Rotation anti-horaire
                break;
            case ' ':
                e.preventDefault();
                this.hardDrop();
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
            <strong>🧱 Tetris</strong> - Le puzzle classique!<br>
            <span style="color: var(--neon-blue)">⬅️➡️</span> Déplacer | 
            <span style="color: var(--neon-green)">⬆️</span> Rotation | 
            <span style="color: var(--neon-pink)">⬇️</span> Chute rapide | 
            <span style="color: var(--neon-yellow)">Espace</span> Drop instantané!
        `;
    }
}

// Enregistrer le jeu
window.Games.tetris = TetrisGame;
