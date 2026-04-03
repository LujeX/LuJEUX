// arcade-collection/js/games/snake.js

/**
 * ============================================
 * ARCADE COLLECTION - SNAKE
 * Classique jeu du serpent
 * Contrôles: Flèches directionnelles ou ZQSD
 * ============================================
 */

class SnakeGame extends BaseGame {
    constructor(ctx, width, height) {
        super(ctx, width, height);
        
        // Configuration
        this.config = {
            gridSize: 20,
            initialLength: 3,
            baseSpeed: 8,
            maxSpeed: 15,
            speedIncrement: 0.2
        };
        
        // Calculer les dimensions de la grille
        this.gridWidth = Math.floor(this.width / this.config.gridSize);
        this.gridHeight = Math.floor(this.height / this.config.gridSize);
        
        // État du jeu (initialisé dans init())
        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = null;
        this.speed = this.config.baseSpeed;
        this.moveTimer = 0;
        this.specialFood = null;
        this.specialFoodTimer = 0;
        
        // Couleurs
        this.colors = {
            ...this.colors,
            background: '#0a0a12',
            grid: 'rgba(255, 255, 255, 0.03)',
            snakeHead: '#64b5f6',
            snakeBody: '#4fc3f7',
            snakeTail: '#29b6f6',
            food: '#81c784',
            specialFood: '#f48fb1'
        };
    }

    /**
     * Initialiser le jeu
     */
    init() {
        super.init();
        
        // Recalculer la grille si redimensionné
        this.gridWidth = Math.floor(this.width / this.config.gridSize);
        this.gridHeight = Math.floor(this.height / this.config.gridSize);
        
        // Créer le serpent initial au centre
        const startX = Math.floor(this.gridWidth / 2);
        const startY = Math.floor(this.gridHeight / 2);
        
        this.snake = [];
        for (let i = 0; i < this.config.initialLength; i++) {
            this.snake.push({ x: startX - i, y: startY });
        }
        
        // Direction initiale
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // Réinitialiser la vitesse et le score
        this.speed = this.config.baseSpeed;
        this.score = 0;
        this.moveTimer = 0;
        
        // Générer la première nourriture
        this.spawnFood();
        this.specialFood = null;
        this.specialFoodTimer = 0;
        
        console.log('[Snake] Jeu initialisé');
    }

    /**
     * Mettre à jour le jeu
     */
    update(deltaTime) {
        if (this.gameOver) return;
        
        // Mettre à jour le timer de mouvement
        this.moveTimer += deltaTime * this.speed;
        
        // Vérifier s'il faut bouger
        if (this.moveTimer >= 1) {
            this.moveSnake();
            this.moveTimer = 0;
        }
        
        // Gérer la nourriture spéciale
        if (this.specialFood) {
            this.specialFoodTimer -= deltaTime;
            if (this.specialFoodTimer <= 0) {
                this.specialFood = null;
            }
        } else {
            // Chance de faire apparaître une nourriture spéciale
            if (Math.random() < 0.002 && !this.specialFood) {
                this.spawnSpecialFood();
            }
        }
    }

    /**
     * Déplacer le serpent
     */
    moveSnake() {
        // Appliquer la prochaine direction
        this.direction = { ...this.nextDirection };
        
        // Calculer la nouvelle tête
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        // Vérifier les collisions
        if (this.checkCollision(newHead)) {
            this.endGame();
            return;
        }
        
        // Ajouter la nouvelle tête
        this.snake.unshift(newHead);
        
        // Vérifier si on mange
        let ate = false;
        
        // Nourriture normale
        if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
            this.eatFood(false);
            ate = true;
        }
        
        // Nourriture spéciale
        if (this.specialFood && newHead.x === this.specialFood.x && newHead.y === this.specialFood.y) {
            this.eatFood(true);
            ate = true;
        }
        
        // Si on n'a pas mangé, retirer la queue
        if (!ate) {
            this.snake.pop();
        }
    }

    /**
     * Vérifier les collisions
     */
    checkCollision(pos) {
        // Murs
        if (pos.x < 0 || pos.x >= this.gridWidth || pos.y < 0 || pos.y >= this.gridHeight) {
            return true;
        }
        
        // Soi-même (sauf la queue qui va disparaître)
        for (let i = 0; i < this.snake.length - 1; i++) {
            if (this.snake[i].x === pos.x && this.snake[i].y === pos.y) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Manger de la nourriture
     */
    eatFood(isSpecial) {
        const points = isSpecial ? 50 : 10;
        this.addScore(points);
        
        if (isSpecial) {
            Utils.audio.playSuccess();
            this.specialFood = null;
        } else {
            Utils.audio.playClick();
            this.spawnFood();
            
            // Augmenter la vitesse progressivement
            this.speed = Math.min(this.speed + this.config.speedIncrement, this.config.maxSpeed);
        }
    }

    /**
     * Générer de la nourriture
     */
    spawnFood() {
        let pos;
        do {
            pos = {
                x: Utils.randomInt(0, this.gridWidth - 1),
                y: Utils.randomInt(0, this.gridHeight - 1)
            };
        } while (this.isOccupied(pos));
        
        this.food = pos;
    }

    /**
     * Générer de la nourriture spéciale
     */
    spawnSpecialFood() {
        let pos;
        do {
            pos = {
                x: Utils.randomInt(0, this.gridWidth - 1),
                y: Utils.randomInt(0, this.gridHeight - 1)
            };
        } while (this.isOccupied(pos));
        
        this.specialFood = pos;
        this.specialFoodTimer = 5; // Disparait après 5 secondes
    }

    /**
     * Vérifier si une position est occupée
     */
    isOccupied(pos) {
        // Serpent
        for (const segment of this.snake) {
            if (segment.x === pos.x && segment.y === pos.y) {
                return true;
            }
        }
        
        // Nourriture existante
        if (this.food && this.food.x === pos.x && this.food.y === pos.y) {
            return true;
        }
        
        return false;
    }

    /**
     * Rendre le jeu
     */
    render(ctx) {
        // Fond
        Utils.canvas.clear(ctx, this.width, this.height, this.colors.background);
        
        // Grille subtile
        this.drawGrid(ctx);
        
        // Nourriture spéciale (en dessous pour l'effet de glow)
        if (this.specialFood) {
            this.drawSpecialFood(ctx);
        }
        
        // Nourriture normale
        if (this.food) {
            this.drawFood(ctx);
        }
        
        // Serpent
        this.drawSnake(ctx);
        
        // UI
        this.drawUI(ctx);
    }

    /**
     * Dessiner la grille
     */
    drawGrid(ctx) {
        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.gridWidth; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.config.gridSize, 0);
            ctx.lineTo(x * this.config.gridSize, this.height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= this.gridHeight; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.config.gridSize);
            ctx.lineTo(this.width, y * this.config.gridSize);
            ctx.stroke();
        }
    }

    /**
     * Dessiner le serpent
     */
    drawSnake(ctx) {
        const size = this.config.gridSize - 2;
        const offset = 1;
        
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.config.gridSize + offset;
            const y = segment.y * this.config.gridSize + offset;
            
            // Calculer la couleur en fonction de la position
            const progress = index / this.snake.length;
            
            if (index === 0) {
                // Tête avec glow
                ctx.shadowColor = this.colors.snakeHead;
                ctx.shadowBlur = 15;
                ctx.fillStyle = this.colors.snakeHead;
                
                // Forme arrondie pour la tête
                Utils.canvas.roundRect(ctx, x, y, size, size, 5, this.colors.snakeHead);
                ctx.shadowBlur = 0;
                
                // Yeux
                this.drawEyes(ctx, segment, x, y, size);
            } else {
                // Corps avec dégradé de couleur
                const r = Math.floor(79 + (100 - 79) * progress);
                const g = Math.floor(195 + (195 - 195) * progress);
                const b = Math.floor(247 + (246 - 247) * progress);
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                
                // Légèrement plus petit vers la queue
                const shrink = progress * 2;
                Utils.canvas.roundRect(
                    ctx,
                    x + shrink,
                    y + shrink,
                    size - shrink * 2,
                    size - shrink * 2,
                    3,
                    ctx.fillStyle
                );
            }
        });
    }

    /**
     * Dessiner les yeux du serpent
     */
    drawEyes(ctx, segment, x, y, size) {
        ctx.fillStyle = '#ffffff';
        
        const eyeSize = size / 4;
        const eyeOffset = size / 4;
        
        let eye1X, eye1Y, eye2X, eye2Y;
        
        switch (`${this.direction.x},${this.direction.y}`) {
            case '1,0': // Droite
                eye1X = x + size - eyeOffset;
                eye1Y = y + eyeOffset;
                eye2X = x + size - eyeOffset;
                eye2Y = y + size - eyeOffset;
                break;
            case '-1,0': // Gauche
                eye1X = x + eyeOffset;
                eye1Y = y + eyeOffset;
                eye2X = x + eyeOffset;
                eye2Y = y + size - eyeOffset;
                break;
            case '0,1': // Bas
                eye1X = x + eyeOffset;
                eye1Y = y + size - eyeOffset;
                eye2X = x + size - eyeOffset;
                eye2Y = y + size - eyeOffset;
                break;
            case '0,-1': // Haut
                eye1X = x + eyeOffset;
                eye1Y = y + eyeOffset;
                eye2X = x + size - eyeOffset;
                eye2Y = y + eyeOffset;
                break;
            default:
                eye1X = x + eyeOffset;
                eye1Y = y + eyeOffset;
                eye2X = x + size - eyeOffset;
                eye2Y = y + size - eyeOffset;
        }
        
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Dessiner la nourriture
     */
    drawFood(ctx) {
        const x = this.food.x * this.config.gridSize + this.config.gridSize / 2;
        const y = this.food.y * this.config.gridSize + this.config.gridSize / 2;
        const radius = this.config.gridSize / 2 - 2;
        
        // Glow
        ctx.shadowColor = this.colors.food;
        ctx.shadowBlur = 15;
        
        // Pomme stylisée
        ctx.fillStyle = this.colors.food;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Petit reflet
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(x - radius / 3, y - radius / 3, radius / 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }

    /**
     * Dessiner la nourriture spéciale
     */
    drawSpecialFood(ctx) {
        const x = this.specialFood.x * this.config.gridSize + this.config.gridSize / 2;
        const y = this.specialFood.y * this.config.gridSize + this.config.gridSize / 2;
        const radius = this.config.gridSize / 2 - 1;
        
        // Pulsation basée sur le temps restant
        const pulse = 1 + Math.sin(Date.now() / 100) * 0.2;
        
        // Glow intense
        ctx.shadowColor = this.colors.specialFood;
        ctx.shadowBlur = 25 * pulse;
        
        // Étoile/pomme dorée
        ctx.fillStyle = this.colors.specialFood;
        ctx.beginPath();
        
        // Forme d'étoile
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const px = x + Math.cos(angle) * radius * pulse;
            const py = y + Math.sin(angle) * radius * pulse;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // Timer visuel
        ctx.font = '10px Orbitron';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(this.specialFoodTimer).toString(), x, y + radius + 12);
        
        ctx.shadowBlur = 0;
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
        
        // Longueur du serpent
        Utils.canvas.drawGlowText(ctx, `Longueur: ${this.snake.length}`, this.width - 60, 25, {
            font: 'bold 16px Orbitron',
            color: this.colors.textMuted,
            glowColor: this.colors.secondary,
            glowSize: 8,
            align: 'right'
        });
    }

    /**
     * Gérer les touches pressées
     */
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        
        // Empêcher de faire demi-tour
        switch (key) {
            case 'arrowup':
            case 'z':
            case 'w':
                if (this.direction.y !== 1) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'arrowdown':
            case 's':
                if (this.direction.y !== -1) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'arrowleft':
            case 'q':
            case 'a':
                if (this.direction.x !== 1) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'arrowright':
            case 'd':
                if (this.direction.x !== -1) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
            case 'r':
                if (this.gameOver) {
                    this.init();
                }
                break;
        }
    }

    /**
     * Obtenir les instructions
     */
    getInstructions() {
        return `
            <strong>🐍 Snake</strong> - Le classique jeu du serpent!<br>
            <span style="color: var(--neon-green)">⬆️⬇️⬅️➡️ Flèches</span> ou 
            <span style="color: var(--neon-blue)">ZQSD</span> pour diriger | 
            Mangez les <span style="color: var(--neon-green)">🟢 pommes</span> (+10pts) et 
            <span style="color: var(--neon-pink)">⭐ étoiles</span> (+50pts)!
        `;
    }
}

// Enregistrer le jeu
window.Games.snake = SnakeGame;
