// arcade-collection/js/games/morpion.js

/**
 * ============================================
 * ARCADE COLLECTION - MORPION (Tic-Tac-Toe)
 * Classique jeu du morpion contre l'IA
 * Contrôles: Clic souris pour placer son symbole
 * ============================================
 */

class MorpionGame extends BaseGame {
    constructor(ctx, width, height) {
        super(ctx, width, height);
        
        // Configuration
        this.config = {
            gridSize: 3,
            cellPadding: 15,
            winLength: 3,
            animationSpeed: 0.1
        };
        
        // État du jeu (initialisé dans init())
        this.board = [];
        this.currentPlayer = 'X'; // X = joueur, O = IA
        this.gameMode = 'ai'; // 'ai' ou 'pvp'
        this.winner = null;
        this.winningLine = null;
        this.isDraw = false;
        this.moveHistory = [];
        
        // Animation
        this.cellAnimations = [];
        this.lineAnimationProgress = 0;
        
        // Couleurs
        this.colors = {
            ...this.colors,
            background: '#0a0a12',
            gridLine: 'rgba(100, 181, 246, 0.4)',
            playerX: '#64b5f6',
            playerO: '#f48fb1',
            winningHighlight: 'rgba(129, 199, 132, 0.3)',
            hoverCell: 'rgba(255, 255, 255, 0.05)'
        };
    }

    /**
     * Calculer la taille des cellules
     */
    getCellSize() {
        const size = Math.min(this.width, this.height) - 80;
        return Math.floor(size / this.config.gridSize);
    }

    /**
     * Initialiser le jeu
     */
    init() {
        super.init();
        
        // Créer le plateau vide
        this.board = Array(this.config.gridSize).fill(null).map(() => 
            Array(this.config.gridSize).fill(null)
        );
        
        // Réinitialiser l'état
        this.currentPlayer = 'X';
        this.winner = null;
        this.winningLine = null;
        this.isDraw = false;
        this.moveHistory = [];
        this.score = 0;
        this.cellAnimations = [];
        this.lineAnimationProgress = 0;
        
        console.log('[Morpion] Jeu initialisé');
    }

    /**
     * Mettre à jour le jeu
     */
    update(deltaTime) {
        if (this.gameOver) return;
        
        // Mettre à jour les animations des cellules
        this.cellAnimations.forEach((anim, index) => {
            if (!anim.complete) {
                anim.progress += deltaTime / 0.2; // 200ms pour l'animation
                if (anim.progress >= 1) {
                    anim.progress = 1;
                    anim.complete = true;
                }
            }
        });
        
        // Animation de la ligne gagnante
        if (this.winner && !this.gameOver) {
            this.lineAnimationProgress += deltaTime / 0.5;
            if (this.lineAnimationProgress >= 1) {
                this.lineAnimationProgress = 1;
                
                // Marquer game over après l'animation
                setTimeout(() => {
                    if (this.winner === 'X') {
                        this.addScore(100);
                        Utils.audio.playSuccess();
                    } else if (this.winner === 'O') {
                        Utils.audio.playError();
                    } else {
                        Utils.audio.playClick();
                    }
                    this.endGame();
                }, 300);
            }
        }
    }

    /**
     * Effectuer un coup
     * @param {number} row - Ligne
     * @param {number} col - Colonne
     * @returns {boolean} Succès du coup
     */
    makeMove(row, col) {
        // Vérifier si la case est valide
        if (row < 0 || row >= this.config.gridSize || 
            col < 0 || col >= this.config.gridSize) {
            return false;
        }
        
        // Vérifier si la case est vide
        if (this.board[row][col] !== null) {
            return false;
        }
        
        // Vérifier si le jeu est terminé
        if (this.winner !== null || this.isDraw) {
            return false;
        }
        
        // Placer le symbole
        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({ row, col, player: this.currentPlayer });
        
        // Ajouter une animation
        this.cellAnimations.push({
            row,
            col,
            progress: 0,
            complete: false
        });
        
        // Jouer un son
        Utils.audio.playClick();
        
        // Vérifier la victoire
        const winResult = this.checkWin(row, col);
        if (winResult) {
            this.winner = this.currentPlayer;
            this.winningLine = winResult;
            return true;
        }
        
        // Vérifier match nul
        if (this.checkDraw()) {
            this.isDraw = true;
            this.winner = 'draw';
            this.lineAnimationProgress = 1;
            return true;
        }
        
        // Changer de joueur
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        
        // Si c'est le tour de l'IA, jouer automatiquement
        if (this.currentPlayer === 'O' && this.gameMode === 'ai') {
            setTimeout(() => this.makeAIMove(), 400);
        }
        
        return true;
    }

    /**
     * Coup de l'IA (algorithme Minimax)
     */
    makeAIMove() {
        if (this.winner !== null || this.isDraw) return;
        
        const bestMove = this.findBestMove();
        if (bestMove) {
            this.makeMove(bestMove.row, bestMove.col);
        }
    }

    /**
     * Trouver le meilleur coup (Minimax)
     */
    findBestMove() {
        let bestScore = -Infinity;
        let move = null;
        
        for (let row = 0; row < this.config.gridSize; row++) {
            for (let col = 0; col < this.config.gridSize; col++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = 'O';
                    const score = this.minimax(this.board, 0, false);
                    this.board[row][col] = null;
                    
                    if (score > bestScore) {
                        bestScore = score;
                        move = { row, col };
                    }
                }
            }
        }
        
        return move;
    }

    /**
     * Algorithme Minimax
     */
    minimax(board, depth, isMaximizing) {
        // Vérifier les conditions de fin
        const winner = this.checkWinnerSimple();
        
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (this.isBoardFull()) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let row = 0; row < this.config.gridSize; row++) {
                for (let col = 0; col < this.config.gridSize; col++) {
                    if (board[row][col] === null) {
                        board[row][col] = 'O';
                        const score = this.minimax(board, depth + 1, false);
                        board[row][col] = null;
                        bestScore = Math.max(score, bestScore);
                    }
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let row = 0; row < this.config.gridSize; row++) {
                for (let col = 0; col < this.config.gridSize; col++) {
                    if (board[row][col] === null) {
                        board[row][col] = 'X';
                        const score = this.minimax(board, depth + 1, true);
                        board[row][col] = null;
                        bestScore = Math.min(score, bestScore);
                    }
                }
            }
            return bestScore;
        }
    }

    /**
     * Vérifier le vainqueur (version simple pour minimax)
     */
    checkWinnerSimple() {
        // Lignes
        for (let row = 0; row < this.config.gridSize; row++) {
            if (this.board[row][0] && 
                this.board[row][0] === this.board[row][1] && 
                this.board[row][1] === this.board[row][2]) {
                return this.board[row][0];
            }
        }
        
        // Colonnes
        for (let col = 0; col < this.config.gridSize; col++) {
            if (this.board[0][col] && 
                this.board[0][col] === this.board[1][col] && 
                this.board[1][col] === this.board[2][col]) {
                return this.board[0][col];
            }
        }
        
        // Diagonales
        if (this.board[0][0] && 
            this.board[0][0] === this.board[1][1] && 
            this.board[1][1] === this.board[2][2]) {
            return this.board[0][0];
        }
        
        if (this.board[0][2] && 
            this.board[0][2] === this.board[1][1] && 
            this.board[1][1] === this.board[2][0]) {
            return this.board[0][2];
        }
        
        return null;
    }

    /**
     * Vérifier la victoire et retourner la ligne gagnante
     */
    checkWin(lastRow, lastCol) {
        const player = this.board[lastRow][lastCol];
        
        // Vérifier la ligne
        let count = 0;
        const lineCells = [];
        for (let col = 0; col < this.config.gridSize; col++) {
            if (this.board[lastRow][col] === player) {
                count++;
                lineCells.push({ row: lastRow, col });
            }
        }
        if (count >= this.config.winLength) return lineCells;
        
        // Vérifier la colonne
        count = 0;
        const colCells = [];
        for (let row = 0; row < this.config.gridSize; row++) {
            if (this.board[row][lastCol] === player) {
                count++;
                colCells.push({ row, col: lastCol });
            }
        }
        if (count >= this.config.winLength) return colCells;
        
        // Vérifier diagonale principale
        if (lastRow === lastCol) {
            count = 0;
            const diag1Cells = [];
            for (let i = 0; i < this.config.gridSize; i++) {
                if (this.board[i][i] === player) {
                    count++;
                    diag1Cells.push({ row: i, col: i });
                }
            }
            if (count >= this.config.winLength) return diag1Cells;
        }
        
        // Vérifier diagonale secondaire
        if (lastRow + lastCol === this.config.gridSize - 1) {
            count = 0;
            const diag2Cells = [];
            for (let i = 0; i < this.config.gridSize; i++) {
                if (this.board[i][this.config.gridSize - 1 - i] === player) {
                    count++;
                    diag2Cells.push({ row: i, col: this.config.gridSize - 1 - i });
                }
            }
            if (count >= this.config.winLength) return diag2Cells;
        }
        
        return null;
    }

    /**
     * Vérifier match nul
     */
    checkDraw() {
        return this.isBoardFull() && !this.winner;
    }

    /**
     * Vérifier si le plateau est plein
     */
    isBoardFull() {
        for (let row = 0; row < this.config.gridSize; row++) {
            for (let col = 0; col < this.config.gridSize; col++) {
                if (this.board[row][col] === null) return false;
            }
        }
        return true;
    }

    /**
     * Rendre le jeu
     */
    render(ctx) {
        // Fond
        Utils.canvas.clear(ctx, this.width, this.height, this.colors.background);
        
        const cellSize = this.getCellSize();
        const gridSize = cellSize * this.config.gridSize;
        const offsetX = (this.width - gridSize) / 2;
        const offsetY = (this.height - gridSize) / 2;
        
        // Dessiner la grille
        this.drawGrid(ctx, offsetX, offsetY, cellSize);
        
        // Dessiner les symboles
        this.drawSymbols(ctx, offsetX, offsetY, cellSize);
        
        // Dessiner la ligne gagnante
        if (this.winningLine && this.lineAnimationProgress > 0) {
            this.drawWinningLine(ctx, offsetX, offsetY, cellSize);
        }
        
        // Dessiner l'UI
        this.drawUI(ctx);
    }

    /**
     * Dessiner la grille
     */
    drawGrid(ctx, offsetX, offsetY, cellSize) {
        ctx.strokeStyle = this.colors.gridLine;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        // Lignes verticales
        for (let i = 1; i < this.config.gridSize; i++) {
            const x = offsetX + i * cellSize;
            
            ctx.beginPath();
            ctx.moveTo(x, offsetY + 10);
            ctx.lineTo(x, offsetY + this.config.gridSize * cellSize - 10);
            ctx.stroke();
        }
        
        // Lignes horizontales
        for (let i = 1; i < this.config.gridSize; i++) {
            const y = offsetY + i * cellSize;
            
            ctx.beginPath();
            ctx.moveTo(offsetX + 10, y);
            ctx.lineTo(offsetX + this.config.gridSize * cellSize - 10, y);
            ctx.stroke();
        }
    }

    /**
     * Dessiner les symboles X et O
     */
    drawSymbols(ctx, offsetX, offsetY, cellSize) {
        const padding = cellSize * this.config.cellPadding / 100;
        
        for (let row = 0; row < this.config.gridSize; row++) {
            for (let col = 0; col < this.config.gridSize; col++) {
                const value = this.board[row][col];
                if (!value) continue;
                
                const centerX = offsetX + col * cellSize + cellSize / 2;
                const centerY = offsetY + row * cellSize + cellSize / 2;
                
                // Trouver l'animation pour cette cellule
                const anim = this.cellAnimations.find(a => a.row === row && a.col === col);
                const scale = anim ? this.easeOutBack(anim.progress) : 1;
                
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.scale(scale, scale);
                ctx.translate(-centerX, -centerY);
                
                if (value === 'X') {
                    this.drawX(ctx, centerX, centerY, cellSize / 2 - padding);
                } else if (value === 'O') {
                    this.drawO(ctx, centerX, centerY, cellSize / 2 - padding);
                }
                
                ctx.restore();
            }
        }
    }

    /**
     * Dessiner un X
     */
    drawX(ctx, x, y, size) {
        const offset = size * 0.7;
        
        ctx.strokeStyle = this.colors.playerX;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.shadowColor = this.colors.playerX;
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.moveTo(x - offset, y - offset);
        ctx.lineTo(x + offset, y + offset);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + offset, y - offset);
        ctx.lineTo(x - offset, y + offset);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }

    /**
     * Dessiner un O
     */
    drawO(ctx, x, y, size) {
        ctx.strokeStyle = this.colors.playerO;
        ctx.lineWidth = 8;
        ctx.shadowColor = this.colors.playerO;
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }

    /**
     * Dessiner la ligne gagnante
     */
    drawWinningLine(ctx, offsetX, offsetY, cellSize) {
        if (!this.winningLine || this.winningLine.length < 2) return;
        
        const first = this.winningLine[0];
        const last = this.winningLine[this.winningLine.length - 1];
        
        const x1 = offsetX + first.col * cellSize + cellSize / 2;
        const y1 = offsetY + first.row * cellSize + cellSize / 2;
        const x2 = offsetX + last.col * cellSize + cellSize / 2;
        const y2 = offsetY + last.row * cellSize + cellSize / 2;
        
        // Interpolation pour l'animation
        const currentX2 = Utils.lerp(x1, x2, this.easeOutCubic(this.lineAnimationProgress));
        const currentY2 = Utils.lerp(y1, y2, this.easeOutCubic(this.lineAnimationProgress));
        
        // Fond highlight
        ctx.strokeStyle = this.colors.winningHighlight;
        ctx.lineWidth = cellSize * 0.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(currentX2, currentY2);
        ctx.stroke();
        
        // Ligne principale
        ctx.strokeStyle = '#81c784';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#81c784';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(currentX2, currentY2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    /**
     * Dessiner l'interface utilisateur
     */
    drawUI(ctx) {
        // Tour actuel ou résultat
        let message = '';
        let color = this.colors.text;
        
        if (this.winner) {
            if (this.winner === 'X') {
                message = '🎉 Vous avez gagné!';
                color = this.colors.playerX;
            } else if (this.winner === 'O') {
                message = '😔 L\'IA a gagné!';
                color = this.colors.playerO;
            } else {
                message = '🤝 Match nul!';
                color = this.colors.secondary;
            }
        } else {
            message = `Tour: ${this.currentPlayer === 'X' ? '👤 Vous' : '🤖 IA'}`;
            color = this.currentPlayer === 'X' ? this.colors.playerX : this.colors.playerO;
        }
        
        Utils.canvas.drawGlowText(ctx, message, this.width / 2, 35, {
            font: 'bold 20px Orbitron',
            color: color,
            glowColor: color,
            glowSize: 15
        });
        
        // Score
        Utils.canvas.drawGlowText(ctx, `Score: ${Utils.formatScore(this.score)}`, this.width - 60, 35, {
            font: 'bold 16px Orbitron',
            color: this.colors.primary,
            glowColor: this.colors.primary,
            glowSize: 10,
            align: 'right'
        });
    }

    /**
     * Fonctions d'easing pour les animations
     */
    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Gérer les clics souris
     */
    handleMouseDown(pos) {
        if (this.gameOver || this.winner) return;
        if (this.currentPlayer !== 'X') return; // Seulement au tour du joueur
        
        const cellSize = this.getCellSize();
        const gridSize = cellSize * this.config.gridSize;
        const offsetX = (this.width - gridSize) / 2;
        const offsetY = (this.height - gridSize) / 2;
        
        // Convertir la position en coordonnées de grille
        const col = Math.floor((pos.x - offsetX) / cellSize);
        const row = Math.floor((pos.y - offsetY) / cellSize);
        
        // Effectuer le coup
        this.makeMove(row, col);
    }

    /**
     * Gérer les touches pressées
     */
    handleKeyDown(e) {
        if (e.key === 'r') {
            this.init();
        }
    }

    /**
     * Obtenir les instructions
     */
    getInstructions() {
        return `
            <strong>⭕ Morpion</strong> - Le classique Tic-Tac-Toe!<br>
            <span style="color: var(--neon-blue)">🖱️ Cliquez</span> sur une case pour jouer | 
            Alignez <strong>3</strong> symboles pour gagner | 
            Battez l'<span style="color: var(--neon-pink)">🤖 IA</span>!
        `;
    }
}

// Enregistrer le jeu
window.Games.morpion = MorpionGame;
