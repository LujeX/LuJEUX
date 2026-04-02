/**
 * ============================================
 * ARCADE ULTIMATE - MORPION GAME (TIC-TAC-TOE)
 * Jeu de plateau 3x3 vs IA Minimax Parfaite
 * ============================================
 */

class MorpionGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Configuration
        this.gridSize = 3;
        this.cellSize = 110;
        this.padding = 30;
        
        // Couleurs
        this.playerColor = '#ef4444';   // X - Joueur
        this.playerSymbol = 'X';
        this.aiColor = '#3b82f6';       // O - IA
        this.aiSymbol = 'O';
        this.lineColor = '#10b981';
        this.bgColor = '#0f172a';
        
        // Système d'effets
        this.particles = new ParticleSystem(80);
        this.winningLine = null;
        this.winningAnimation = { active: false, timer: 0 };
        
        // Initialiser
        this.init();
    }
    
    init() {
        // Grille vide (0 = vide, 1 = joueur/X, 2 = IA/O)
        this.board = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
        
        // Tour actuel
        this.currentPlayer = 1; // Le joueur commence toujours
        
        // État du jeu
        this.winner = null;
        this.gameOver = false;
        this.isAnimating = false;
        
        // Animation de placement
        this.placingAnimation = {
            active: false,
            row: 0,
            col: 0,
            player: 0,
            scale: 0,
            targetScale: 1
        };
        
        // Score et stats
        this.score = 0;
        this.movesCount = 0;
        this.playerWins = 0;
        this.aiWins = 0;
        const storedStats = JSON.parse(localStorage.getItem('morpion_stats') || '{"wins":0,"losses":0,"draws":0}');
        this.playerWins = storedStats.wins || 0;
        this.aiWins = storedStats.losses || 0;
        this.draws = storedStats.draws || 0;
        
        // Hover effect
        this.hoverCell = { row: -1, col: -1 };
        
        // Historique pour l'analyse
        this.moveHistory = [];
        
        // Conseils stratégiques
        this.tipText = '';
        this.showTip = true;
        
        // État
        this.gameState = GAME_STATES.IDLE;
    }
    
    saveStats() {
        localStorage.setItem('morpion_stats', JSON.stringify({
            wins: this.playerWins,
            losses: this.aiWins,
            draws: this.draws
        }));
    }
    
    checkWin(player) {
        const b = this.board;
        
        // Lignes horizontales
        for (let r = 0; r < 3; r++) {
            if (b[r][0] === player && b[r][1] === player && b[r][2] === player) {
                return [[r,0], [r,1], [r,2]];
            }
        }
        
        // Colonnes verticales
        for (let c = 0; c < 3; c++) {
            if (b[0][c] === player && b[1][c] === player && b[2][c] === player) {
                return [[0,c], [1,c], [2,c]];
            }
        }
        
        // Diagonale principale
        if (b[0][0] === player && b[1][1] === player && b[2][2] === player) {
            return [[0,0], [1,1], [2,2]];
        }
        
        // Diagonale secondaire
        if (b[0][2] === player && b[1][1] === player && b[2][0] === player) {
            return [[0,2], [1,1], [2,0]];
        }
        
        return null;
    }
    
    isBoardFull() {
        return this.board.every(row => row.every(cell => cell !== 0));
    }
    
    isEmpty(cells) {
        return cells.every(c => c === 0);
    }
    
    // ============================================
    // IA MINIMAX PARFAITE - IMBATTABLE
    // ============================================
    
    minimax(board, isMaximizing) {
        // Vérifier les terminaux
        const humanWin = this.checkWinForBoard(board, 1);
        const aiWin = this.checkWinForBoard(board, 2);
        
        if (aiWin) return { score: 10 }; // IA gagne
        if (humanWin) return { score: -10 }; // Humain gagne
        if (this.isBoardFullForBoard(board)) return { score: 0 }; // Match nul
        
        if (isMaximizing) {
            let best = { score: -Infinity };
            
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    if (board[r][c] === 0) {
                        board[r][c] = 2; // IA joue
                        const result = this.minimax(board, false);
                        board[r][c] = 0; // Undo
                        
                        if (result.score > best.score) {
                            best = { score: result.score, row: r, col: c };
                        }
                    }
                }
            }
            
            return best;
        } else {
            let best = { score: Infinity };
            
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    if (board[r][c] === 0) {
                        board[r][c] = 1; // Humain joue
                        const result = this.minimax(board, true);
                        board[r][c] = 0; // Undo
                        
                        if (result.score < best.score) {
                            best = { score: result.score, row: r, col: c };
                        }
                    }
                }
            }
            
            return best;
        }
    }
    
    getBestMove() {
        const result = this.minimax(this.board.map(r => [...r]), true);
        return { row: result.row, col: result.col };
    }
    
    checkWinForBoard(board, player) {
        const b = board;
        
        // Toutes les combinaisons gagnantes
        const winPatterns = [
            // Lignes
            [[0,0],[0,1],[0,2]],
            [[1,0],[1,1],[1,2]],
            [[2,0],[2,1],[2,2]],
            // Colonnes
            [[0,0],[1,0],[2,0]],
            [[0,1],[1,1],[2,1]],
            [[0,2],[1,2],[2,2]],
            // Diagonales
            [[0,0],[1,1],[2,2]],
            [[0,2],[1,1],[2,0]]
        ];
        
        for (const pattern of winPatterns) {
            if (pattern.every(([r,c]) => b[r][c] === player)) {
                return true;
            }
        }
        
        return false;
    }
    
    isBoardFullForBoard(board) {
        return board.every(row => row.every(c => c !== 0));
    }
    
    makeAIMove() {
        if (this.gameOver || this.currentPlayer !== 2 || this.isAnimating) return;
        
        // Délai pour l'effet "réflexion"
        setTimeout(() => {
            const move = this.getBestMove();
            this.startPlacingAnimation(move.row, move.col, 2);
        }, 350 + Math.random() * 250);
    }
    
    startPlacingAnimation(row, col, player) {
        this.isAnimating = true;
        this.placingAnimation = {
            active: true,
            row: row,
            col: col,
            player: player,
            scale: 0,
            targetScale: 1
        };
    }
    
    completeMove() {
        const { row, col, player } = this.placingAnimation;
        
        // Placer le symbole
        this.board[row][col] = player;
        this.movesCount++;
        this.moveHistory.push({ row, col, player });
        
        this.isAnimating = false;
        this.placingAnimation.active = false;
        
        // Particules d'impact
        const x = col * this.cellSize + this.cellSize / 2 + this.padding;
        const y = row * this.cellSize + this.cellSize / 2 + this.padding;
        
        this.particles.emit(x, y, {
            count: 15,
            speed: 6,
            size: 5,
            colors: player === 1 ? 
                ['#ef4444', '#fca5a5', '#ffffff'] : 
                ['#3b82f6', '#93c5fd', '#ffffff'],
            life: 0.6,
            gravity: 100,
            spread: Math.PI * 2
        });
        
        if (this.engine?.soundManager) {
            this.engine.soundManager.playClick();
        }
        
        // Vérifier victoire
        const winLine = this.checkWin(player);
        if (winLine) {
            this.winner = player;
            this.winningLine = winLine;
            this.gameOver = true;
            
            // Animation de victoire
            this.winningAnimation = { active: true, timer: 3 };
            
            if (player === 1) {
                this.score = 50;
                this.playerWins++;
                this.saveStats();
                
                setTimeout(() => {
                    this.endGame(true, '🎉 IMPRESSIONNANT!', '🏆');
                }, 1200);
            } else {
                this.score = 0;
                this.aiWins++;
                this.saveStats();
                
                this.tipText = "L'IA est imbattable au Tic-Tac-Toe optimal...";
                
                setTimeout(() => {
                    this.endGame(false, '🤖 VICTOIRE IA', '🤖');
                }, 1200);
            }
            
            return;
        }
        
        // Vérifier match nul
        if (this.isBoardFull()) {
            this.gameOver = true;
            this.draws++;
            this.saveStats();
            this.score = 20;
            this.tipText = "Match nul ! C'est déjà une performance contre cette IA.";
            
            setTimeout(() => {
                this.endGame(null, '🤝 MATCH NUL!', '🤝');
            }, 800);
            
            return;
        }
        
        // Changer de joueur
        this.currentPlayer = player === 1 ? 2 : 1;
        
        // Si c'est le tour de l'IA
        if (this.currentPlayer === 2) {
            this.makeAIMove();
        }
        
        // Générer un conseil
        this.generateTip();
    }
    
    generateTip() {
        const tips = [
            "Le centre est la case la plus puissante",
            "Contrôlez les coins si possible",
            "Bloquez les menaces immédiates",
            "Créez deux possibilités de victoire",
            "Forcez l'IA à défendre"
        ];
        
        this.tipText = tips[MathUtils.randomInt(0, tips.length - 1)];
    }
    
    update(dt) {
        super.update(dt);
        
        // Mise à jour particules
        this.particles.update(dt);
        
        // Animation de placement
        if (this.placingAnimation.active) {
            const anim = this.placingAnimation;
            anim.scale += (anim.targetScale - anim.scale) * 12 * dt;
            
            if (anim.scale >= anim.targetScale - 0.01) {
                anim.scale = anim.targetScale;
                this.completeMove();
            }
        }
        
        // Animation de ligne gagnante
        if (this.winningAnimation.active) {
            this.winningAnimation.timer -= dt;
        }
    }
    
    render() {
        const ctx = this.ctx;
        const gridWidth = this.gridSize * this.cellSize + this.padding * 2;
        const gridHeight = this.gridSize * this.cellSize + this.padding * 2;
        const offsetX = (this.width - gridWidth) / 2;
        const offsetY = (this.height - gridHeight) / 2 + 25;
        
        // Fond
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Décor subtil
        this.renderBackgroundPattern(ctx);
        
        ctx.save();
        ctx.translate(offsetX, offsetY);
        
        // Grille
        this.renderGrid(ctx, gridWidth, gridHeight);
        
        // Symboles placés
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const cellValue = this.board[r][c];
                if (cellValue !== 0) {
                    const x = c * this.cellSize + this.cellSize / 2 + this.padding;
                    const y = r * this.cellSize + this.cellSize / 2 + this.padding;
                    
                    const isWinning = this.winningLine?.some(([wr, wc]) => wr === r && wc === c);
                    
                    if (cellValue === 1) {
                        this.renderX(ctx, x, y, isWinning);
                    } else {
                        this.renderO(ctx, x, y, isWinning);
                    }
                }
            }
        }
        
        // Animation de placement en cours
        if (this.placingAnimation.active) {
            const { row, col, player, scale } = this.placingAnimation;
            const x = col * this.cellSize + this.cellSize / 2 + this.padding;
            const y = row * this.cellSize + this.cellSize / 2 + this.padding;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
            
            if (player === 1) {
                this.renderX(ctx, x, y, false);
            } else {
                this.renderO(ctx, x, y, false);
            }
            
            ctx.restore();
        }
        
        // Hover preview
        if (!this.gameOver && !this.isAnimating && 
            this.currentPlayer === 1 && 
            this.hoverCell.row >= 0 && this.hoverCell.col >= 0 &&
            this.board[this.hoverCell.row][this.hoverCell.col] === 0) {
            
            const x = this.hoverCell.col * this.cellSize + this.cellSize / 2 + this.padding;
            const y = this.hoverCell.row * this.cellSize + this.cellSize / 2 + this.padding;
            
            ctx.globalAlpha = 0.25;
            this.renderX(ctx, x, y, false);
            ctx.globalAlpha = 1;
        }
        
        // Ligne gagnante
        if (this.winningLine && this.winner) {
            this.renderWinningLine(ctx);
        }
        
        // Particules
        this.particles.render(ctx);
        
        ctx.restore();
        
        // UI
        this.renderUI(ctx);
    }
    
    renderBackgroundPattern(ctx) {
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.03)';
        ctx.lineWidth = 1;
        
        const size = 40;
        for (let x = 0; x < this.width; x += size) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        for (let y = 0; y < this.height; y += size) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    }
    
    renderGrid(ctx, width, height) {
        // Fond de grille
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        RenderUtils.roundRect(ctx, 0, 0, width, height, 16);
        ctx.fill();
        
        // Bordure glow
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 2;
        RenderUtils.roundRect(ctx, 0, 0, width, height, 16);
        ctx.stroke();
        
        // Lignes de grille
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 2;
        
        // Verticales
        for (let i = 1; i < this.gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i * this.cellSize + this.padding, this.padding);
            ctx.lineTo(i * this.cellSize + this.padding, height - this.padding);
            ctx.stroke();
        }
        
        // Horizontales
        for (let i = 1; i < this.gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(this.padding, i * this.cellSize + this.padding);
            ctx.lineTo(width - this.padding, i * this.cellSize + this.padding);
            ctx.stroke();
        }
    }
    
    renderX(ctx, x, y, isWinning) {
        const size = this.cellSize * 0.32;
        
        ctx.save();
        ctx.translate(x, y);
        
        if (isWinning) {
            ctx.shadowColor = this.playerColor;
            ctx.shadowBlur = 15 + Math.sin(Date.now() * 0.01) * 8;
        }
        
        ctx.strokeStyle = this.playerColor;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(-size, -size);
        ctx.lineTo(size, size);
        ctx.moveTo(size, -size);
        ctx.lineTo(-size, size);
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderO(ctx, x, y, isWinning) {
        const radius = this.cellSize * 0.3;
        
        ctx.save();
        ctx.translate(x, y);
        
        if (isWinning) {
            ctx.shadowColor = this.aiColor;
            ctx.shadowBlur = 15 + Math.sin(Date.now() * 0.01) * 8;
        }
        
        ctx.strokeStyle = this.aiColor;
        ctx.lineWidth = 10;
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderWinningLine(ctx) {
        if (!this.winningLine || this.winningLine.length < 2) return;
        
        const start = this.winningLine[0];
        const end = this.winningLine[2];
        
        const startX = start[1] * this.cellSize + this.cellSize / 2 + this.padding;
        const startY = start[0] * this.cellSize + this.cellSize / 2 + this.padding;
        const endX = end[1] * this.cellSize + this.cellSize / 2 + this.padding;
        const endY = end[0] * this.cellSize + this.cellSize / 2 + this.padding;
        
        // Glow effect
        ctx.save();
        ctx.shadowColor = this.lineColor;
        ctx.shadowBlur = 20;
        
        ctx.strokeStyle = this.lineColor;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderUI(ctx) {
        // Titre du tour
        ctx.font = 'bold 22px Orbitron';
        ctx.textAlign = 'center';
        
        if (!this.gameOver && !this.isAnimating) {
            if (this.currentPlayer === 1) {
                ctx.fillStyle = this.playerColor;
                ctx.fillText(`❌ VOTRE TOUR (${this.playerSymbol})`, this.width / 2, 28);
            } else {
                ctx.fillStyle = this.aiColor;
                ctx.fillText(`⭕ IA JOUE (${this.aiSymbol})...`, this.width / 2, 28);
            }
        } else if (this.winner) {
            ctx.font = 'bold 26px Orbitron';
            ctx.fillStyle = this.winner === 1 ? '#10b981' : '#ef4444';
            ctx.fillText(
                this.winner === 1 ? '✨ VOUS AVEZ GAGNÉ! ✨' : '🤖 IA GAGNE',
                this.width / 2, 28
            );
        }
        
        // Stats
        ctx.font = '14px Rajdhani';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'left';
        ctx.fillText(`V: ${this.playerWins} | D: ${this.draws} | DÉF: ${this.aiWins}`, 15, this.height - 15);
        
        // Tip
        if (this.showTip && this.tipText && !this.gameOver) {
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
            ctx.font = '13px Rajdhani';
            ctx.fillText(`💡 ${this.tipText}`, this.width / 2, this.height - 15);
        }
        
        ctx.textAlign = 'left';
    }
    
    handleClick(x, y) {
        if (this.gameOver || this.isAnimating || this.currentPlayer !== 1) return;
        
        const gridWidth = this.gridSize * this.cellSize + this.padding * 2;
        const offsetX = (this.width - gridWidth) / 2;
        const offsetY = (this.height - (this.gridSize * this.cellSize + this.padding * 2)) / 2 + 25;
        
        const relX = x - offsetX - this.padding;
        const relY = y - offsetY - this.padding;
        
        const col = Math.floor(relX / this.cellSize);
        const row = Math.floor(relY / this.cellSize);
        
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            if (this.board[row][col] === 0) {
                this.startPlacingAnimation(row, col, 1);
                
                if (this.engine?.soundManager) {
                    this.engine.soundManager.playClick();
                }
            }
        }
    }
    
    handleMouseMove(x, y) {
        if (this.gameOver || this.isAnimating || this.currentPlayer !== 1) {
            this.hoverCell = { row: -1, col: -1 };
            return;
        }
        
        const gridWidth = this.gridSize * this.cellSize + this.padding * 2;
        const offsetX = (this.width - gridWidth) / 2;
        const offsetY = (this.height - (this.gridSize * this.cellSize + this.padding * 2)) / 2 + 25;
        
        const relX = x - offsetX - this.padding;
        const relY = y - offsetY - this.padding;
        
        this.hoverCell = {
            row: Math.floor(relY / this.cellSize),
            col: Math.floor(relX / this.cellSize)
        };
    }
}
