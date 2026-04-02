/**
 * ============================================
 * ARCADE ULTIMATE - PUISSANCE 4 GAME
 * Connect Four avec IA Minimax Alpha-Beta
 * ============================================
 */

class Puissance4Game extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Configuration
        this.cols = 7;
        this.rows = 6;
        this.cellSize = 75;
        this.padding = 15;
        
        // Couleurs
        this.playerColor = '#ef4444';   // Rouge - Joueur
        this.aiColor = '#fbbf24';       // Jaune - IA
        this.emptyColor = '#0f172a';
        this.boardColor = '#1e40af';
        
        // Système d'effets
        this.particles = new ParticleSystem(100);
        this.winningAnimation = { active: false, timer: 0, cells: [] };
        
        // Initialiser
        this.init();
    }
    
    init() {
        // Grille vide (0 = vide, 1 = joueur, 2 = IA)
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        
        // Tour actuel (1 = joueur, 2 = IA)
        this.currentPlayer = 1;
        
        // État du jeu
        this.winner = null;
        this.winningCells = [];
        this.gameOver = false;
        this.isAnimating = false;
        
        // Animation de chute
        this.fallingPiece = {
            active: false,
            col: 0,
            row: 0,
            targetRow: 0,
            y: 0,
            player: 0,
            speed: 15
        };
        
        // Score
        this.score = 0;
        this.movesCount = 0;
        
        // Hover effect
        this.hoverCol = -1;
        
        // Stats
        this.playerWins = 0;
        this.aiWins = 0;
        this.draws = 0;
        
        // Difficulté IA (1-5)
        this.aiDepth = 5; // Profondeur de recherche Minimax
        
        // État
        this.gameState = GAME_STATES.IDLE;
    }
    
    getLowestEmptyRow(col) {
        for (let r = this.rows - 1; r >= 0; r--) {
            if (this.board[r][col] === 0) return r;
        }
        return -1;
    }
    
    canPlay(col) {
        return col >= 0 && col < this.cols && this.board[0][col] === 0;
    }
    
    playMove(col, player) {
        const row = this.getLowestEmptyRow(col);
        if (row === -1) return false;
        
        this.board[row][col] = player;
        this.movesCount++;
        
        return row;
    }
    
    checkWin(player) {
        // Horizontal
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c <= this.cols - 4; c++) {
                if (this.board[r][c] === player &&
                    this.board[r][c+1] === player &&
                    this.board[r][c+2] === player &&
                    this.board[r][c+3] === player) {
                    return [[r,c], [r,c+1], [r,c+2], [r,c+3]];
                }
            }
        }
        
        // Vertical
        for (let r = 0; r <= this.rows - 4; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] === player &&
                    this.board[r+1][c] === player &&
                    this.board[r+2][c] === player &&
                    this.board[r+3][c] === player) {
                    return [[r,c], [r+1,c], [r+2,c], [r+3,c]];
                }
            }
        }
        
        // Diagonale \
        for (let r = 0; r <= this.rows - 4; r++) {
            for (let c = 0; c <= this.cols - 4; c++) {
                if (this.board[r][c] === player &&
                    this.board[r+1][c+1] === player &&
                    this.board[r+2][c+2] === player &&
                    this.board[r+3][c+3] === player) {
                    return [[r,c], [r+1,c+1], [r+2,c+2], [r+3,c+3]];
                    }
                }
            }
        }
        
        // Diagonale /
        for (let r = 3; r < this.rows; r++) {
            for (let c = 0; c <= this.cols - 4; c++) {
                if (this.board[r][c] === player &&
                    this.board[r-1][c+1] === player &&
                    this.board[r-2][c+2] === player &&
                    this.board[r-3][c+3] === player) {
                    return [[r,c], [r-1,c+1], [r-2,c+2], [r-3,c+3]];
                    }
                }
            }
        }
        
        return null;
    }
    
    isBoardFull() {
        return this.board[0].every(cell => cell !== 0);
    }
    
    // ============================================
    // IA MINIMAX AVEC ALPHA-BETA PRUNING
    // ============================================
    
    evaluateBoard(board) {
        let score = 0;
        
        // Évaluer les positions centrales (plus importantes)
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (board[r][c] === 2) { // IA
                    score += (4 - Math.abs(c - 3)) * 3;
                } else if (board[r][c] === 1) { // Joueur
                    score -= (4 - Math.abs(c - 3)) * 3;
                }
            }
        }
        
        // Évaluer les alignements potentiels
        score += this.evaluateLines(board, 2) * 10; // IA
        score -= this.evaluateLines(board, 1) * 10; // Joueur
        
        return score;
    }
    
    evaluateLines(board, player) {
        let score = 0;
        const opponent = player === 1 ? 2 : 1;
        
        // Vérifier toutes les lignes possibles de 4
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c <= this.cols - 4; c++) {
                const line = [
                    board[r][c],
                    board[r][c+1],
                    board[r][c+2],
                    board[r][c+3]
                ];
                score += this.evaluateLine(line, player, opponent);
            }
        }
        
        for (let r = 0; r <= this.rows - 4; r++) {
            for (let c = 0; c < this.cols; c++) {
                const line = [
                    board[r][c],
                    board[r+1][c],
                    board[r+2][c],
                    board[r+3][c]
                ];
                score += this.evaluateLine(line, player, opponent);
            }
        }
        
        return score;
    }
    
    evaluateLine(line, player, opponent) {
        let score = 0;
        const playerCount = line.filter(c => c === player).length;
        const emptyCount = line.filter(c => c === 0).length;
        const opponentCount = line.filter(c => c === opponent).length;
        
        // Si l'adversaire a des pièces dans cette ligne, ignorer
        if (opponentCount > 0) return 0;
        
        if (playerCount === 4) score += 1000; // Victoire !
        else if (playerCount === 3 && emptyCount === 1) score += 50; // Presque gagnant
        else if (playerCount === 2 && emptyCount === 2) score += 10; // Potentiel
        
        return score;
    }
    
    minimax(board, depth, alpha, beta, isMaximizing) {
        // Vérifier les conditions de fin
        const aiWin = this.checkWinForBoard(board, 2);
        const playerWin = this.checkWinForBoard(board, 1);
        
        if (aiWin) return 10000 + depth;
        if (playerWin) return -10000 - depth;
        if (depth === 0 || this.isBoardFullForBoard(board)) {
            return this.evaluateBoard(board);
        }
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            
            // Essayer chaque colonne (priorité au centre)
            const colOrder = [3, 2, 4, 1, 5, 0, 6];
            
            for (const col of colOrder) {
                if (board[0][col] === 0) {
                    const newBoard = board.map(r => [...r]);
                    const row = this.getRowForBoard(newBoard, col);
                    if (row >= 0) {
                        newBoard[row][col] = 2;
                        const evalScore = this.minimax(newBoard, depth - 1, alpha, beta, false);
                        maxEval = Math.max(maxEval, evalScore);
                        alpha = Math.max(alpha, evalScore);
                        if (beta <= alpha) break; // Beta cutoff
                    }
                }
            }
            
            return maxEval;
        } else {
            let minEval = Infinity;
            
            const colOrder = [3, 2, 4, 1, 5, 0, 6];
            
            for (const col of colOrder) {
                if (board[0][col] === 0) {
                    const newBoard = board.map(r => [...r]);
                    const row = this.getRowForBoard(newBoard, col);
                    if (row >= 0) {
                        newBoard[row][col] = 1;
                        const evalScore = this.minimax(newBoard, depth - 1, alpha, beta, true);
                        minEval = Math.min(minEval, evalScore);
                        beta = Math.min(beta, evalScore);
                        if (beta <= alpha) break; // Alpha cutoff
                    }
                }
            }
            
            return minEval;
        }
    }
    
    checkWinForBoard(board, player) {
        // Version simplifiée pour l'IA
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c <= this.cols - 4; c++) {
                if (board[r][c] === player && board[r][c+1] === player && 
                    board[r][c+2] === player && board[r][c+3] === player) {
                    return true;
                }
            }
        }
        for (let r = 0; r <= this.rows - 4; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (board[r][c] === player && board[r+1][c] === player && 
                    board[r+2][c] === player && board[r+3][c] === player) {
                    return true;
                }
            }
        }
        return false;
    }
    
    isBoardFullForBoard(board) {
        return board[0].every(cell => cell !== 0);
    }
    
    getRowForBoard(board, col) {
        for (let r = this.rows - 1; r >= 0; r--) {
            if (board[r][col] === 0) return r;
        }
        return -1;
    }
    
    getBestMove() {
        let bestScore = -Infinity;
        let bestCol = 3; // Défaut: centre
        
        const colOrder = [3, 2, 4, 1, 5, 0, 6];
        
        for (const col of colOrder) {
            if (this.canPlay(col)) {
                const newBoard = this.board.map(r => [...r]);
                const row = this.getLowestEmptyRow(col);
                newBoard[row][col] = 2;
                
                const score = this.minimax(newBoard, this.aiDepth, -Infinity, Infinity, false);
                
                console.log(`Col ${col}: ${score}`);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestCol = col;
                }
            }
        }
        
        return bestCol;
    }
    
    makeAIMove() {
        if (this.gameOver || this.currentPlayer !== 2 || this.isAnimating) return;
        
        // Petit délai pour l'effet "réflexion"
        setTimeout(() => {
            const col = this.getBestMove();
            this.startFallingAnimation(col, 2);
        }, 400 + Math.random() * 300);
    }
    
    startFallingAnimation(col, player) {
        const targetRow = this.getLowestEmptyRow(col);
        if (targetRow === -1) return;
        
        this.isAnimating = true;
        this.fallingPiece = {
            active: true,
            col: col,
            row: 0,
            targetRow: targetRow,
            y: 0,
            player: player,
            speed: 18
        };
    }
    
    completeMove() {
        const { col, targetRow, player } = this.fallingPiece;
        
        // Placer la pièce
        this.board[targetRow][col] = player;
        this.isAnimating = false;
        this.fallingPiece.active = false;
        
        // Particules d'impact
        const x = col * this.cellSize + this.cellSize / 2 + this.padding;
        const y = targetRow * this.cellSize + this.cellSize / 2 + this.padding;
        
        this.particles.emit(x, y, {
            count: 12,
            speed: 5,
            size: 4,
            colors: player === 1 ? 
                ['#ef4444', '#fca5a5', '#ffffff'] : 
                ['#fbbf24', '#fde047', '#ffffff'],
            life: 0.5,
            gravity: 150,
            spread: Math.PI * 2
        });
        
        if (this.engine?.soundManager) {
            this.engine.soundManager.playHit();
        }
        
        // Vérifier victoire
        const winCells = this.checkWin(player);
        if (winCells) {
            this.winner = player;
            this.winningCells = winCells;
            this.gameOver = true;
            
            // Animation de victoire
            this.winningAnimation = {
                active: true,
                timer: 3,
                cells: winCells
            };
            
            // Score
            if (player === 1) {
                this.score = 100 + (this.rows - winCells[0][0]) * 20; // Bonus pour victoire rapide
                this.playerWins++;
                this.endGame(true, '🎉 VICTOIRE!', '🏆');
            } else {
                this.score = 0;
                this.aiWins++;
                this.endGame(false, '🤖 IA GAGNE', '🤖');
            }
            
            return;
        }
        
        // Vérifier match nul
        if (this.isBoardFull()) {
            this.gameOver = true;
            this.draws++;
            this.score = 25;
            this.endGame(null, '🤝 MATCH NUL', '🤝');
            return;
        }
        
        // Changer de joueur
        this.currentPlayer = player === 1 ? 2 : 1;
        
        // Si c'est le tour de l'IA
        if (this.currentPlayer === 2) {
            this.makeAIMove();
        }
    }
    
    update(dt) {
        super.update(dt);
        
        // Mise à jour particules
        this.particles.update(dt);
        
        // Animation de chute
        if (this.fallingPiece.active) {
            this.fallingPiece.y += this.fallingPiece.speed;
            
            if (this.fallingPiece.y >= this.fallingPiece.targetRow) {
                this.completeMove();
            }
        }
        
        // Animation de victoire
        if (this.winningAnimation.active) {
            this.winningAnimation.timer -= dt;
            
            if (Math.floor(this.winningAnimation.timer * 10) % 2 === 0) {
                // Effet de pulsation sur les cases gagnantes
            }
        }
    }
    
    render() {
        const ctx = this.ctx;
        const boardWidth = this.cols * this.cellSize + this.padding * 2;
        const boardHeight = this.rows * this.cellSize + this.padding * 2;
        const offsetX = (this.width - boardWidth) / 2;
        const offsetY = (this.height - boardHeight) / 2 + 20;
        
        // Fond
        ctx.fillStyle = '#0a0a12';
        ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.save();
        ctx.translate(offsetX, offsetY);
        
        // Bordure du plateau
        ctx.fillStyle = '#1e293b';
        RenderUtils.roundRect(ctx, -8, -8, boardWidth + 16, boardHeight + 16, 16);
        ctx.fill();
        
        // Plateau principal
        const gradient = ctx.createLinearGradient(0, 0, 0, boardHeight);
        gradient.addColorStop(0, '#2563eb');
        gradient.addColorStop(1, '#1d4ed8');
        ctx.fillStyle = gradient;
        RenderUtils.roundRect(ctx, 0, 0, boardWidth, boardHeight, 12);
        ctx.fill();
        
        // Cases et jetons
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = c * this.cellSize + this.cellSize / 2 + this.padding;
                const y = r * this.cellSize + this.cellSize / 2 + this.padding;
                const radius = this.cellSize / 2 - 6;
                
                // Trou (fond sombre)
                ctx.fillStyle = this.emptyColor;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Jeton si présent
                const cellValue = this.board[r][c];
                if (cellValue !== 0) {
                    const isWinning = this.winningCells.some(([wr, wc]) => wr === r && wc === c);
                    this.renderDisc(ctx, x, y, radius, cellValue, isWinning);
                }
            }
        }
        
        // Pièce en train de tomber
        if (this.fallingPiece.active) {
            const x = this.fallingPiece.col * this.cellSize + this.cellSize / 2 + this.padding;
            const y = this.fallingPiece.y * this.cellSize + this.cellSize / 2 + this.padding;
            const radius = this.cellSize / 2 - 6;
            this.renderDisc(ctx, x, y, radius, this.fallingPiece.player, false);
        }
        
        // Jeton de prévisualisation (hover)
        if (!this.gameOver && !this.isAnimating && this.currentPlayer === 1 && this.hoverCol >= 0) {
            if (this.canPlay(this.hoverCol)) {
                const x = this.hoverCol * this.cellSize + this.cellSize / 2 + this.padding;
                const radius = this.cellSize / 2 - 6;
                
                ctx.globalAlpha = 0.4;
                this.renderDisc(ctx, x, -this.cellSize, radius, 1, false);
                ctx.globalAlpha = 1;
                
                // Flèche indicatrice
                ctx.fillStyle = this.playerColor;
                ctx.beginPath();
                ctx.moveTo(x, 15);
                ctx.lineTo(x - 10, 0);
                ctx.lineTo(x + 10, 0);
                ctx.closePath();
                ctx.fill();
            }
        }
        
        // Particules
        this.particles.render(ctx);
        
        ctx.restore();
        
        // UI
        this.renderUI(ctx);
    }
    
    renderDisc(ctx, x, y, radius, player, isWinning) {
        const color = player === 1 ? this.playerColor : this.aiColor;
        
        // Glow pour case gagnante
        if (isWinning) {
            const glowIntensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
            ctx.shadowColor = color;
            ctx.shadowBlur = 20 * glowIntensity;
        }
        
        // Gradient 3D
        const gradient = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        );
        
        if (player === 1) {
            gradient.addColorStop(0, '#fca5a5');
            gradient.addColorStop(0.7, color);
            gradient.addColorStop(1, '#b91c1c');
        } else {
            gradient.addColorStop(0, '#fef08a');
            gradient.addColorStop(0.7, color);
            gradient.addColorStop(1, '#d97706');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        // Border pour winning
        if (isWinning) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
    }
    
    renderUI(ctx) {
        // Titre du tour
        ctx.font = 'bold 22px Orbitron';
        ctx.textAlign = 'center';
        
        if (!this.gameOver && !this.isAnimating) {
            if (this.currentPlayer === 1) {
                ctx.fillStyle = this.playerColor;
                ctx.fillText('⬇️ VOTRE TOUR', this.width / 2, 30);
            } else {
                ctx.fillStyle = this.aiColor;
                ctx.fillText('🤖 IA RÉFLÉCHIT...', this.width / 2, 30);
            }
        } else if (this.winner) {
            ctx.fillStyle = this.winner === 1 ? '#10b981' : '#ef4444';
            ctx.fillText(
                this.winner === 1 ? '✨ VICTOIRE! ✨' : '🤖 VICTOIRE IA',
                this.width / 2, 30
            );
        }
        
        ctx.textAlign = 'left';
    }
    
    handleClick(x, y) {
        if (this.gameOver || this.isAnimating || this.currentPlayer !== 1) return;
        
        // Calculer la colonne cliquée
        const boardWidth = this.cols * this.cellSize + this.padding * 2;
        const offsetX = (this.width - boardWidth) / 2;
        const offsetY = (this.height - (this.rows * this.cellSize + this.padding * 2)) / 2 + 20;
        
        const relX = x - offsetX - this.padding;
        const col = Math.floor(relX / this.cellSize);
        
        if (col >= 0 && col < this.cols && this.canPlay(col)) {
            this.startFallingAnimation(col, 1);
            
            if (this.engine?.soundManager) {
                this.engine.soundManager.playClick();
            }
        }
    }
    
    handleMouseMove(x, y) {
        if (this.gameOver || this.isAnimating || this.currentPlayer !== 1) {
            this.hoverCol = -1;
            return;
        }
        
        const boardWidth = this.cols * this.cellSize + this.padding * 2;
        const offsetX = (this.width - boardWidth) / 2;
        const relX = x - offsetX - this.padding;
        this.hoverCol = Math.floor(relX / this.cellSize);
    }
}
