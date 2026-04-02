/**
 * SNAKE GAME - Le serpent classique
 */

class SnakeGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.gridSize = 20;
        this.tileCount = Math.floor(canvas.width / this.gridSize);
        this.particles = new ParticleSystem(150);
        this.init();
    }

    init() {
        const cx = Math.floor(this.tileCount / 2);
        this.snake = [
            { x: cx, y: cx },
            { x: cx - 1, y: cx },
            { x: cx - 2, y: cx }
        ];
        this.direction = { ...DIRECTIONS.RIGHT };
        this.nextDirection = { ...DIRECTIONS.RIGHT };
        this.apple = this.spawnApple();
        this.applePulse = 0;
        this.score = 0;
        this.baseSpeed = 8;
        this.currentSpeed = this.baseSpeed;
        this.moveTimer = 0;
        this.moveInterval = 1 / this.currentSpeed;
        this.screenShake = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
        this.applesEaten = 0;
        this.gameOver = false;
        this.gameState = GAME_STATES.IDLE;
    }

    spawnApple() {
        let pos, attempts = 0;
        do {
            pos = {
                x: MathUtils.randomInt(0, this.tileCount - 1),
                y: MathUtils.randomInt(0, this.tileCount - 1)
            };
            attempts++;
        } while (this.snake.some(s => s.x === pos.x && s.y === pos.y) && attempts < 1000);
        return pos;
    }

    update(dt) {
        if (this.gameOver) return;
        this.particles.update(dt);
        this.applePulse += dt * 5;
        
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) this.comboCount = 0;
        }
        if (this.screenShake > 0) this.screenShake *= 0.9;

        this.moveTimer += dt;
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            this.moveSnake();
        }
    }

    moveSnake() {
        this.direction = { ...this.nextDirection };
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };

        // Collision murs ou soi-même
        if (newHead.x < 0 || newHead.x >= this.tileCount ||
            newHead.y < 0 || newHead.y >= this.tileCount ||
            this.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
            this.die();
            return;
        }

        this.snake.unshift(newHead);

        if (newHead.x === this.apple.x && newHead.y === this.apple.y) {
            this.eatApple(newHead);
        } else {
            this.snake.pop();
        }
    }

    eatApple(pos) {
        this.comboCount++;
        this.comboTimer = 2;
        const pts = 10 * Math.min(this.comboCount, 10);
        this.score += pts;
        this.applesEaten++;
        this.screenShake = 5 + this.comboCount;

        const ax = this.apple.x * this.gridSize + this.gridSize / 2;
        const ay = this.apple.y * this.gridSize + this.gridSize / 2;
        this.particles.emit(ax, ay, {
            count: 15 + this.comboCount * 3,
            speed: 4, size: 4,
            colors: ['#ef4444', '#fbbf24', '#ffffff'],
            life: 0.6, gravity: 100,
            spread: Math.PI * 2
        });

        this.apple = this.spawnApple();
        this.currentSpeed = Math.min(this.baseSpeed + Math.floor(this.applesEaten / 3) * 0.5, 20);
        this.moveInterval = 1 / this.currentSpeed;
        if (this.engine) this.engine.score = this.score;
    }

    die() {
        this.gameOver = true;
        this.gameState = GAME_STATES.GAME_OVER;
        this.screenShake = 20;

        for (const s of this.snake) {
            this.particles.emit(
                s.x * this.gridSize + this.gridSize / 2,
                s.y * this.gridSize + this.gridSize / 2,
                { count: 8, speed: 6, size: 5, colors: ['#4ade80', '#22c55e'], life: 1, gravity: 200, spread: Math.PI * 2 }
            );
        }
        setTimeout(() => this.endGame(false, '💀 GAME OVER', '💀'), 500);
    }

    render() {
        const ctx = this.ctx;
        ctx.save();

        if (this.screenShake > 0.5) {
            ctx.translate(
                (Math.random() - 0.5) * this.screenShake * 2,
                (Math.random() - 0.5) * this.screenShake * 2
            );
        }

        // Background
        const bgGrad = ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 1.5
        );
        bgGrad.addColorStop(0, '#1a1a2e');
        bgGrad.addColorStop(1, '#0a0a12');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Grid
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * this.gridSize, 0);
            ctx.lineTo(i * this.gridSize, this.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * this.gridSize);
            ctx.lineTo(this.width, i * this.gridSize);
            ctx.stroke();
        }

        // Apple
        const ax = this.apple.x * this.gridSize + this.gridSize / 2;
        const ay = this.apple.y * this.gridSize + this.gridSize / 2;
        const ar = this.gridSize / 2 - 3 + Math.sin(this.applePulse) * 2;

        const glow = ctx.createRadialGradient(ax, ay, 0, ax, ay, ar * 2);
        glow.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(ax, ay, ar * 2, 0, Math.PI * 2);
        ctx.fill();

        const appleG = ctx.createRadialGradient(ax - 3, ay - 3, 0, ax, ay, ar);
        appleG.addColorStop(0, '#fca5a5');
        appleG.addColorStop(0.7, '#ef4444');
        appleG.addColorStop(1, '#dc2626');
        ctx.fillStyle = appleG;
        ctx.beginPath();
        ctx.arc(ax, ay, ar, 0, Math.PI * 2);
        ctx.fill();

        // Snake
        const len = this.snake.length;
        for (let i = len - 1; i >= 0; i--) {
            const s = this.snake[i];
            const x = s.x * this.gridSize + 1;
            const y = s.y * this.gridSize + 1;
            const sz = this.gridSize - 2;
            const isH = i === 0;
            
            let fc, sc;
            if (isH) {
                const g = ctx.createLinearGradient(x, y, x + sz, y + sz);
                g.addColorStop(0, '#86efac');
                g.addColorStop(1, '#4ade80');
                fc = g;
                sc = '#22c55e';
            } else {
                const b = 1 - (i / len) * 0.6;
                fc = `rgb(${Math.floor(74 * b)}, ${Math.floor(222 * b)}, ${Math.floor(128 * b)})`;
                sc = `rgb(${Math.floor(34 * b)}, ${Math.floor(197 * b)}, ${Math.floor(94 * b)})`;
            }

            ctx.fillStyle = fc;
            ctx.strokeStyle = sc;
            ctx.lineWidth = 2;
            RenderUtils.roundRect(ctx, x, y, sz, sz, isH ? 8 : 5);
            ctx.fill();
            ctx.stroke();

            if (isH) this.renderEyes(ctx, x, y, sz);
        }

        this.particles.render(ctx);

        // Combo display
        if (this.comboCount > 1 && this.comboTimer > 0) {
            ctx.font = 'bold 24px Orbitron';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#fbbf24';
            ctx.fillText(`${this.comboCount}x COMBO!`, this.width / 2, 50);
            ctx.shadowBlur = 0;
        }

        // UI stats
        ctx.font = '14px Rajdhani';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.textAlign = 'left';
        ctx.fillText(`🍎 ${this.applesEaten}`, 15, this.height - 35);
        ctx.fillText(`⚡ ${this.currentSpeed.toFixed(1)}x`, 15, this.height - 18);

        ctx.restore();
    }

    renderEyes(ctx, x, y, sz) {
        let e1x, e1y, e2x, e2y;
        const off = sz * 0.2;

        if (this.direction.x === 1) {
            e1x = x + sz - off; e1y = y + off;
            e2x = x + sz - off; e2y = y + sz - off;
        } else if (this.direction.x === -1) {
            e1x = x + off; e1y = y + off;
            e2x = x + off; e2y = y + sz - off;
        } else if (this.direction.y === -1) {
            e1x = x + off; e1y = y + off;
            e2x = x + sz - off; e2y = y + off;
        } else {
            e1x = x + off; e1y = y + sz - off;
            e2x = x + sz - off; e2y = y + sz - off;
        }

        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(e1x, e1y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2x, e2y, 4, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(e1x + this.direction.x, e1y + this.direction.y, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2x + this.direction.x, e2y + this.direction.y, 2, 0, Math.PI * 2); ctx.fill();
    }

    handleKey(key, code) {
        if (code === 'ArrowUp' || code === 'KeyW') {
            if (this.direction.y !== 1) this.nextDirection = { ...DIRECTIONS.UP };
        } else if (code === 'ArrowDown' || code === 'KeyS') {
            if (this.direction.y !== -1) this.nextDirection = { ...DIRECTIONS.DOWN };
        } else if (code === 'ArrowLeft' || code === 'KeyA') {
            if (this.direction.x !== 1) this.nextDirection = { ...DIRECTIONS.LEFT };
        } else if (code === 'ArrowRight' || code === 'KeyD') {
            if (this.direction.x !== -1) this.nextDirection = { ...DIRECTIONS.RIGHT };
        }
    }

    handleMobileInput(dir, state) {
        if (state === 'down') {
            if (dir === 'up' && this.direction.y !== 1) this.nextDirection = { ...DIRECTIONS.UP };
            else if (dir === 'down' && this.direction.y !== -1) this.nextDirection = { ...DIRECTIONS.DOWN };
            else if (dir === 'left' && this.direction.x !== 1) this.nextDirection = { ...DIRECTIONS.LEFT };
            else if (dir === 'right' && this.direction.x !== -1) this.nextDirection = { ...DIRECTIONS.RIGHT };
        }
    }
}
