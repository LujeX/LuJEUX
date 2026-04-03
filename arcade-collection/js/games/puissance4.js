// arcade-collection/js/games/puissance4.js

/**
 * ============================================
 * ARCADE COLLECTION - PUISSANCE 4 (Connect Four)
 * Classique jeu de stratégies en colonnes
 * Contrôles: Clic souris pour placer un jeton
 * ============================================
 */

class Puissance4Game extends BaseGame {
    constructor(ctx, width, height) {
        super(ctx, width, height);
        
        // Configuration
        this.config = {
            cols: 7,
            rows: 6,
            cellPadding: 8,
            animationSpeed: 0.15,
            winLength: 4
        };
        
        // État du jeu (initialisé dans init())
        this.board = [];
        this.currentPlayer = 1; // 1 = joueur (rouge), 2 = IA (jaune)
        this.winner = null;
        this.winningCells = [];
        this.isDraw = false;
        
        // Animation du jeton qui tombe
        this.fallingToken = null;
        
        // Hover state
        this.hoverCol = -1;
        
        // Couleurs
        this.colors = {
            ...this.colors,
            background: '#0a0a12',
            board: '#1a237e',
            boardBorder: '#3949ab',
            player1: '#ef5350',   // Rouge
            player2: '#ffee58',   // Jaune
            empty: 'rgba(26, 35, 126, 0.4)',
            hover: 'rgba(239, 83, 80, 0.3)',
            winning: 'rgba(129, 199, 132, 0.5)'
        };
    }

    /**
     * Calculer la taille des cellules
     */
    getCellSize() {
        const maxWidth = this.width - 100;
        const maxHeight = this.height - 150;
        
        return Math.min(
            Math.floor(maxWidth / this.config.cols),
            Math.floor(maxHeight / this.config.rows)
        );
    }

    /**
     * Initialiser le jeu
     */
    init() {
        super.init();
        
        // Créer le plateau vide
        this.board = Array(this.config.rows).fill(null).map(() => 
            Array(this.config.cols).fill(0)
        );
        
        // Réinitialiser l'état
        this.currentPlayer = 1;
        this.winner = null;
        this.winningCells = [];
        this.isDraw = false;
        this.fallingToken = null;
        this.hoverCol = -1;
        this.score = 0;
        
        console.log('[Puissance4] Jeu initialisé');
    }

    /**
     * Mettre à jour le jeu
     */
    update(deltaTime) {
        if (this.gameOver) return;
        
        // Animation du jeton qui tombe
        if (this.fallingToken) {
            this.fallingToken.velocity += 800 * deltaTemps; // Gravité
            this.fallingToken.y += this.fallingToken.velocity * deltaTime;
            
            const targetY = this.fallingToken.targetY;
            
            if (this.fallingToken.y >= targetY) {
                // Le jeton a atteint sa destination
                this.board[this.fallingToken.row][this.fallingToken.col] = this.fallingToken.player;
                
                // Vérifier la victoire
                const winResult = this.checkWin(this.fallingToken.row, this.fallingToken.col);
                if (winResult) {
                    this.winner = this.fallingToken.player;
                    this.winningCells = winResult;
                    
                    setTimeout(() => {
                        if (this.winner === 1) {
                            this.addScore(100);
                            Utils.audio.playSuccess();
                        } else {
                            Utils.audio.playError();
                        }
                        this.endGame();
                    }, 500);
                } else if (this.checkDraw()) {
                    this.isDraw = true;
                    Utils.audio.playClick();
                    setTimeout(() => this.endGame(), 300);
                } else {
                    // Changer de joueur
                    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                    
                    // Tour de l'IA
                    if (this.currentPlayer === 2) {
                        setTimeout(() => this.makeAIMove(), 500);
                    }
                }
                
                this.fallingToken = null;
            }
        }
    }

    /**
     * Effectuer un coup dans une colonne
     * @param {number} col - Colonne choisie
     * @returns {boolean} Succès du coup
     */
    makeMove(col) {
        // Vérifier si la colonne est valide
        if (col < 0 || col >= this.config.cols) {
            return false;
        }
        
        // Vérifier si la colonne n'est pas pleine
        if (this.board[0][col] !== 0) {
            return false;
        }
        
        // Vérifier si le jeu est terminé ou en cours d'animation
        if (this.winner !== null || this.isDraw || this.fallingToken !== null) {
            return false;
        }
        
        // Trouver la première case vide depuis le bas
        let targetRow = -1;
        for (let row = this.config.rows - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                targetRow = row;
                break;
            }
        }
        
        if (targetRow === -1) return false;
        
        // Calculer les positions pour l'animation
        const cellSize = this.getCellSize();
        const gridSize = cellSize * this.config.cols;
        const offsetX = (this.width - gridSize) / 2;
        const offsetY = (this.height - cellSize * this.config.rows) / 2 + 40;
        
        const startX = offsetX + col * cellSize + cellSize / 2;
        const startY = offsetY - cellSize; // Au-dessus du plateau
        const endX = startX;
        const endY = offsetY + targetRow * cellSize + cellSize / 2;
        
        // Démarrer l'animation de chute
        this.fallingToken = {
            col: col,
            row: targetRow,
            player: this.currentPlayer,
            x: startX,
            y: startY,
            targetY: endY,
            velocity: 0
        };
        
        Utils.audio.playClick();
        
        return true;
    }

    /**
     * Coup de l'IA
     */
    makeAIMove() {
        if (this.winner !== null || this.isDraw || this.currentPlayer !== 2) return;
        
        const col = this.findBestMove();
        if (col !== -1) {
            this.makeMove(col);
        }
    }

    /**
     * Trouver le meilleur coup pour l'IA
     */
    findBestMove() {
        // 1. Vérifier si l'IA peut gagner immédiatement
        for (let col = 0; col < this.config.cols; col++) {
            if (this.canPlayInColumn(col)) {
                const row = this.getNextRowInColumn(col);
                this.board[row][col] = 2;
                if (this.checkWinSimple(row, col, 2)) {
                    this.board[row][col] = 0;
                    return col;
                }
                this.board[row][col] = 0;
            }
        }
        
        // 2. Bloquer le joueur s'il peut gagner
        for (let col = 0; col < this.config.cols; col++) {
            if (this.canPlayInColumn(col)) {
                const row = this.getNextRowInColumn(col);
                this.board[row][col] = 1;
                if (this.checkWinSimple(row, col, 1)) {
                    this.board[row][col] = 0;
                    return col;
                }
                this.board[row][col] = 0;
            }
        }
        
        // 3. Préférer le centre
        const centerCol = Math.floor(this.config.cols / 2);
        if (this.canPlayInColumn(centerCol)) {
            return centerCol;
        }
        
        // 4. Évaluer chaque colonne
        let bestScore = -Infinity;
        let bestCol = -1;
        
        for (let col = 0; col < this.config.cols; col++) {
            if (this.canPlayInColumn(col)) {
                const score = this.evaluateColumn(col);
                if (score > bestScore) {
                    bestScore = score;
                    bestCol = col;
                }
            }
        }
        
        return bestCol;
    }

    /**
     * Vérifier si on peut jouer dans une colonne
     */
    canPlayInColumn(col) {
        return col >= 0 && col < this.config.cols && this.board[0][col] === 0;
    }

    /**
     * Obtenir la prochaine ligne vide dans une colonne
     */
    getNextRowInColumn(col) {
        for (let row = this.config.rows - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) return row;
        }
        return -1;
    }

    /**
     * Évaluer la qualité d'une colonne
     */
    evaluateColumn(col) {
        const row = this.getNextRowInColumn(col);
        if (row === -1) return -Infinity;
        
        let score = 0;
        
        // Privilégier le centre
        const centerDistance = Math.abs(col - Math.floor(this.config.cols / 2));
        score += (this.config.cols / 2 - centerDistance) * 10;
        
        // Simuler le coup et évaluer
        this.board[row][col] = 2;
        score += this.countThreats(row, col, 2) * 20;
        this.board[row][col] = 0;
        
        // Ajouter un peu d'aléatoire pour varier
        score += Math.random() * 5;
        
        return score;
    }

    /**
     * Compter les menaces autour d'une position
     */
    countThreats(row, col, player) {
        let threats = 0;
        const directions = [
            [0, 1],   // Horizontal
            [1, 0],   // Vertical
            [1, 1],   // Diagonale \
            [1, -1]   // Diagonale /
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            
            // Direction positive
            for (let i = 1; i < this.config.winLength; i++) {
                const r = row + dy * i;
                const c = col + dx * i;
                if (r >= 0 && r < this.config.rows && c >= 0 && c < this.config.cols) {
                    if (this.board[r][c] === player) count++;
                    else break;
                } else break;
            }
            
            // Direction négative
            for (let i = 1; i < this.config.winLength; i++) {
                const r = row - dy * i;
                const c = col - dx * i;
                if (r >= 0 && r < this.config.rows && c >= 0 && c < this.config.cols) {
                    if (this.board[r][c] === player) count++;
                    else break;
                } else break;
            }
            
            if (count >= this.config.winLength - 1) threats++;
        }
        
        return threats;
    }

    /**
     * Vérifier la victoire (version simple)
     */
    checkWinSimple(row, col, player) {
        const directions = [
            [0, 1],   // Horizontal
            [1, 0],   // Vertical
            [1, 1],   // Diagonale \
            [1, -1]   // Diagonale /
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            const cells = [{row, col}];
            
            // Direction positive
            for (let i = 1; i < this.config.winLength; i++) {
                const r = row + dy * i;
                const c = col + dx * i;
                if (r >= 0 && r < this.config.rows && c >= 0 && c < this.config.cols) {
                    if (this.board[r][c] === player) {
                        count++;
                        cells.push({row: r, col: c});
                    } else break;
                } else break;
            }
            
            // Direction négative
            for (let i = 1; i < this.config.winLength; i++) {
                const r = row - dy * i;
                const c = col - dx * i;
                if (r >= 0 && r < this.config.rows && c >= 0 && c < this.config.cols) {
                    if (this.board[r][c] === player) {
                        count++;
                        cells.unshift({row: r, col: c});
                    } else break;
                } else break;
            }
            
            if (count >= this.config.winLength) return cells;
        }
        
        return null;
    }

    /**
     * Vérifier la victoire avec retour des cellules gagnantes
     */
    checkWin(row, col) {
        return this.checkWinSimple(row, col, this.board[row][col]);
    }

    /**
     * Vérifier match nul
     */
    checkDraw() {
        return this.board[0].every(cell => cell !== 0);
    }

    /**
     * Rendre le jeu
     */
    render(ctx) {
        // Fond
        Utils.canvas.clear(ctx, this.width, this.height, this.colors.background);
        
        const cellSize = this.getCellSize();
        const gridWidth = cellSize * this.config.cols;
        const gridHeight = cellSize * this.config.rows;
        const offsetX = (this.width - gridWidth) / 2;
        const offsetY = (this.height - gridHeight) / 2 + 40;
        
        // Dessiner le plateau
        this.drawBoard(ctx, offsetX, offsetY, cellSize);
        
        // Dessiner les jetons sur le plateau
        this.drawTokens(ctx, offsetX, offsetY, cellSize);
        
        // Dessiner le jeton qui tombe
        if (this.fallingToken) {
            this.drawFallingToken(ctx, cellSize);
        }
        
        // Dessiner l'aperçu au survol
        if (this.hoverCol >= 0 && !this.fallingToken && !this.winner && !this.isDraw) {
            this.drawHoverPreview(ctx, offsetX, offsetY, cellSize);
        }
        
        // Dessiner les cellules gagnantes
        if (this.winningCells.length > 0) {
            this.drawWinningHighlight(ctx, offsetX, offsetY, cellSize);
        }
        
        // UI
        this.drawUI(ctx);
    }

    /**
     * Dessiner le plateau
     */
    drawBoard(ctx, offsetX, offsetY, cellSize) {
        const width = cellSize * this.config.cols + this.config.cellPadding * 2;
        const height = cellSize * this.config.rows + this.config.cellPadding * 2;
        
        // Fond du plateau
        ctx.fillStyle = this.colors.board;
        Utils.canvas.roundRect(
            ctx,
            offsetX - this.config.cellPadding,
            offsetY - this.config.cellPadding,
            width,
            height,
            15,
            this.colors.board,
            this.colors.boardBorder
        );
        
        // Trous pour les jetons
        for (let row = 0; row < this.config.rows; row++) {
            for (let col = 0; col < this.config.cols; col++) {
                const x = offsetX + col * cellSize + cellSize / 2;
                const y = offsetY + row * cellSize + cellSize / 2;
                const radius = cellSize / 2 - this.config.cellPadding;
                
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = this.colors.empty;
                ctx.fill();
            }
        }
    }

    /**
     * Dessiner les jetons placés
     */
    drawTokens(ctx, offsetX, offsetY, cellSize) {
        for (let row = 0; row < this.config.rows; row++) {
            for (let col = 0; col < this.config.cols; col++) {
                const value = this.board[row][col];
                if (value === 0) continue;
                
                const x = offsetX + col * cellSize + cellSize / 2;
                const y = offsetY + row * cellSize + cellSize / 2;
                const radius = cellSize / 2 - this.config.cellPadding - 2;
                
                this.drawToken(ctx, x, y, radius, value);
            }
        }
    }

    /**
     * Dessiner un jeton individuel
     */
    drawToken(ctx, x, y, radius, player) {
        const color = player === 1 ? this.colors.player1 : this.colors.player2;
        
        // Ombre/glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        
        // Jeton principal
        const gradient = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        );
        gradient.addColorStop(0, this.lightenColor(color, 30));
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, this.darkenColor(color, 20));
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Reflet
        ctx.beginPath();
        ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }

    /**
     * Dessiner le jeton qui tombe
     */
    drawFallingToken(ctx, cellSize) {
        const token = this.fallingToken;
        const radius = cellSize / 2 - this.config.cellPadding - 2;
        
        this.drawToken(ctx, token.x, token.y, radius, token.player);
    }

    /**
     * Dessiner l'aperçu au survol
     */
    drawHoverPreview(ctx, offsetX, offsetY, cellSize) {
        if (!this.canPlayInColumn(this.hoverCol)) return;
        
        const x = offsetX + this.hoverCol * cellSize + cellSize / 2;
        const y = offsetY - cellSize / 2;
        const radius = cellSize / 2 - this.config.cellPadding - 2;
        const color = this.currentPlayer === 1 ? this.colors.player1 : this.colors.player2;
        
        ctx.globalAlpha = 0.5;
        this.drawToken(ctx, x, y, radius, this.currentPlayer);
        ctx.globalAlpha = 1;
        
        // Flèche indiquant où le jeton va tomber
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x, y + radius + 5);
        ctx.lineTo(x, offsetY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    /**
     * Mettre en évidence les cellules gagnantes
     */
    drawWinningHighlight(ctx, offsetX, offsetY, cellSize) {
        ctx.fillStyle = this.colors.winning;
        
        for (const cell of this.winningCells) {
            const x = offsetX + cell.col * cellSize + cellSize / 2;
            const y = offsetY + cell.row * cellSize + cellSize / 2;
            const radius = cellSize / 2 + 5;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Dessiner l'interface utilisateur
     */
    drawUI(ctx) {
        // Tour actuel ou résultat
        let message = '';
        let color = this.colors.text;
        
        if (this.winner) {
            if (this.winner === 1) {
                message = '🎉 Vous avez gagné!';
                color = this.colors.player1;
            } else {
                message = '😔 L\'IA a gagné!';
                color = this.colors.player2;
            }
        } else if (this.isDraw) {
            message = '🤝 Match nul!';
            color = this.colors.secondary;
        } else {
            message = `Tour: ${this.currentPlayer === 1 ? '🔴 Vous' : '🟡 IA'}`;
            color = this.currentPlayer === 1 ? this.colors.player1 : this.colors.player2;
        }
        
        Utils.canvas.drawGlowText(ctx, message, this.width / 2, 30, {
            font: 'bold 22px Orbitron',
            color: color,
            glowColor: color,
            glowSize: 15
        });
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
        const cellSize = this.getCellSize();
        const gridWidth = cellSize * this.config.cols;
        const offsetX = (this.width - gridWidth) / 2;
        
        this.hoverCol = Math.floor((pos.x - offsetX) / cellSize);
        
        // Limiter aux bornes valides
        if (this.hoverCol < 0 || this.hoverCol >= this.config.cols) {
            this.hoverCol = -1;
        }
    }

    /**
     * Gérer les clics souris
     */
    handleMouseDown(pos) {
        if (this.gameOver || this.winner || this.isDraw) return;
        if (this.currentPlayer !== 1) return;
        if (this.fallingToken !== null) return;
        
        this.makeMove(this.hoverCol);
    }

    /**
     * Gérer les touches pressées
     */
    handleKeyDown(e) {
        if (e.key === 'r') {
            this.init();
        }
        
        // Navigation au clavier
        if (e.key === 'ArrowLeft') {
            this.hoverCol = Math.max(0, (this.hoverCol >= 0 ? this.hoverCol : Math.floor(this.config.cols / 2)) - 1);
        }
        if (e.key === 'ArrowRight') {
            this.hoverCol = Math.min(this.config.cols - 1, (this.hoverCol >= 0 ? this.hoverCol : Math.floor(this.config.cols / 2)) + 1);
        }
        if (e.key === 'Enter' || e.key === ' ') {
            if (this.hoverCol >= 0) {
                this.makeMove(this.hoverCol);
            }
        }
    }

    /**
     * Obtenir les instructions
     */
    getInstructions() {
        return `
            <strong>🔴 Puissance 4</strong> - Connect Four classique!<br>
            <span style="color: var(--neon-blue)">🖱️ Cliquez</span> sur une colonne | 
            <span style="color: #ef5350">⬅️➡️</span> pour naviguer | 
            Alignez <strong>4</strong> jetons pour gagner!
        `;
    }
}

// Enregistrer le jeu
window.Games.puissance4 = Puissance4Game;
