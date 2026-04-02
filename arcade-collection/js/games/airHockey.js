/**
 * ============================================
 * ARCADE ULTIMATE - AIR HOCKEY GAME
 * Palet avec physique réaliste vs IA
 * ============================================
 */

class AirHockeyGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Configuration de la table
        this.tableMargin = 30;
        this.goalWidth = 140;
        
        // Dimensions du palet et des maillets
        this.puckRadius = 18;
        this.malletRadius = 35;
        
        // Physique
        this.friction = 0.995;
        this.puckMaxSpeed = 20;
        this.restitution = 1.15; // Rebond élastique (légèrement > 1 pour le fun)
        
        // Couleurs
        this.tableColor = '#1e40af';
        this.borderColor = '#fbbf24';
        this.puckColor = '#1f2937';
        this.playerMalletColor = '#4ade80';
        this.aiMalletColor = '#ef4444';
        
        // Système d'effets
        this.particles = new ParticleSystem(120);
        this.trailPositions = [];
        this.maxTrailLength = 20;
        this.goalEffect = { active: false, team: null, timer: 0 };
        this.hitEffects = [];
        
        // Initialiser
        this.init();
    }
    
    init() {
        // Palet
        this.puck = {
            x: this.width / 2,
            y: this.height / 2,
            vx: 0,
            vy: 0
        };
        
        // Maillet joueur (gauche)
        this.playerMallet = {
            x: 150,
            y: this.height / 2,
            vx: 0,
            vy: 0,
            prevX: 150,
            prevY: this.height / 2
        };
        
        // Maillet IA (droite)
        this.aiMallet = {
            x: this.width - 150,
            y: this.height / 2,
            vx: 0,
            vy: 0,
            targetX: this.width - 150,
            targetY: this.height / 2
        };
        
        // Score
        this.playerScore = 0;
        this.aiScore = 0;
        this.score = 0; // Score affiché
        
        // Configuration IA
        this.aiSpeed = 10;
        this.aiReactionTime = 0.08;
        this.aiDefensiveZone = this.width * 0.6; // Zone défensive
        
        // Stats
        this.totalHits = 0;
        this.maxRally = 0;
        this.currentRally = 0;
        this.playerShots = 0;
        this.aiShots = 0;
        
        // État
        this.gameOver = false;
        this.winScore = 7;
        this.gameState = GAME_STATES.IDLE;
        
        // Compteur début
        this.countdown = 3;
        this.countdownTimer = 0;
        this.isCountingDown = true;
    }
    
    resetPuck(scorer = null) {
        this.puck.x = this.width / 2;
        this.puck.y = this.height / 2;
        
        // Direction basée sur qui a encaissé
        const direction = scorer === 'player' ? -1 : 
                          scorer === 'ai' ? 1 : 
                          (Math.random() > 0.5 ? 1 : -1);
        
        const speed = 4 + Math.random() * 2;
        this.puck.vx = speed * direction;
        this.puck.vy = (Math.random() - 0.5) * 4;
        
        // Reset trail
        this.trailPositions = [];
        
        // Reset rally
        if (this.currentRally > this.maxRally) {
            this.maxRally = this.currentRally;
        }
        this.currentRally = 0;
    }
    
    update(dt) {
        super.update(dt);
        
        if (this.gameOver) return;
        
        // Countdown
        if (this.isCountingDown) {
            this.countdownTimer += dt;
            if (this.countdownTimer >= 1) {
                this.countdownTimer = 0;
                this.countdown--;
                if (this.countdown <= 0) {
                    this.isCountingDown = false;
                    this.gameState = GAME_STATES.PLAYING;
                }
            }
            
            // Mettre à jour IA quand même pour l'affichage
            this.updateAI(dt);
            return;
        }
        
        // Particules
        this.particles.update(dt);
        
        // Sauvegarder position précédente du maillet joueur
        this.playerMallet.prevX = this.playerMallet.x;
        this.playerMallet.prevY = this.playerMallet.y;
        
        // Calculer vélocité du maillet joueur (pour transfert d'énergie)
        this.playerMallet.vx = (this.playerMallet.x - this.playerMallet.prevX) / dt;
        this.playerMallet.vy = (this.playerMallet.y - this.playerMallet.prevY) / dt;
        
        // Limiter vélocité du maillet
        const maxMalletSpeed = 25;
        const malletSpeed = Math.sqrt(this.playerMallet.vx**2 + this.playerMallet.vy**2);
        if (malletSpeed > maxMalletSpeed) {
            const scale = maxMalletSpeed / malletSpeed;
            this.playerMallet.vx *= scale;
            this.playerMallet.vy *= scale;
        }
        
        // Physique du palet
        this.updatePuckPhysics(dt);
        
        // Collision maillets
        this.checkMalletCollision(this.playerMallet, true);
        this.checkMalletCollision(this.aiMallet, false);
        
        // Buts
        this.checkGoals();
        
        // IA
        this.updateAI(dt);
        
        // Effets
        this.updateEffects(dt);
        
        // Trail
        this.updateTrail();
        
        // Limiter positions
        this.constrainMallet(this.playerMallet, true); // Joueur = moitié gauche
        this.constrainMallet(this.aiMallet, false);   // IA = moitié droite
        
        // Score display
        if (this.engine) {
            this.engine.score = this.playerScore;
            this.engine.updateScoreDisplay();
        }
    }
    
    updatePuckPhysics(dt) {
        // Appliquer friction
        this.puck.vx *= this.friction;
        this.puck.vy *= this.friction;
        
        // Déplacer
        this.puck.x += this.puck.vx;
        this.puck.y += this.puck.vy;
        
        // Limiter vitesse max
        const speed = Math.sqrt(this.puck.vx**2 + this.puck.vy**2);
        if (speed > this.puckMaxSpeed) {
            const scale = this.puckMaxSpeed / speed;
            this.puck.vx *= scale;
            this.puck.vy *= scale;
        }
        
        // Murs haut/bas (sauf dans les buts)
        const goalTop = (this.height - this.goalWidth) / 2;
        const goalBottom = goalTop + this.goalWidth;
        
        if (this.puck.y - this.puckRadius < this.tableMargin) {
            if (this.puck.x < this.width/2 - this.goalWidth/2 || 
                this.puck.x > this.width/2 + this.goalWidth/2 ||
                this.puck.x < this.tableMargin + this.width*0.35 ||
                this.puck.x > this.width - this.tableMargin - this.width*0.35) {
                
                this.puck.y = this.tableMargin + this.puckRadius;
                this.puck.vy *= -0.9;
                this.createWallHitEffect(this.puck.x, this.tableMargin);
            }
        }
        
        if (this.puck.y + this.puckRadius > this.height - this.tableMargin) {
            if (this.puck.x < this.width/2 - this.goalWidth/2 || 
                this.puck.x > this.width/2 + this.goalWidth/2 ||
                this.puck.x < this.tableMargin + this.width*0.35 ||
                this.puck.x > this.width - this.tableMargin - this.width*0.35) {
                
                this.puck.y = this.height - this.tableMargin - this.puckRadius;
                this.puck.vy *= -0.9;
                this.createWallHitEffect(this.puck.x, this.height - this.tableMargin);
            }
        }
    }
    
    checkMalletCollision(mallet, isPlayer) {
        const dx = this.puck.x - mallet.x;
        const dy = this.puck.y - mallet.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const minDist = this.puckRadius + this.malletRadius;
        
        if (dist < minDist && dist > 0) {
            // Normaliser la direction
            const nx = dx / dist;
            const ny = dy / dist;
            
            // Séparer les objets
            const overlap = minDist - dist;
            this.puck.x += nx * overlap;
            this.puck.y += ny * overlap;
            
            // Calculer vélocité relative
            const dvx = this.puck.vx - mallet.vx;
            const dvy = this.puck.vy - mallet.vy;
            
            // Vélocité relative le long de la normale
            const dvn = dvx * nx + dvy * ny;
            
            // Ne résoudre que si les objets se rapprochent
            if (dvn < 0) {
                // Appliquer restitution (rebond élastique)
                const impulse = -(1 + this.restitution) * dvn;
                
                this.puck.vx += impulse * nx + mallet.vx * 0.5;
                this.puck.vy += impulse * ny + mallet.vy * 0.5;
                
                // Stats
                this.currentRally++;
                this.totalHits++;
                if (isPlayer) this.playerShots++;
                else this.aiShots++;
                
                // Effet visuel
                this.createHitEffect(
                    mallet.x + nx * this.malletRadius,
                    mallet.y + ny * this.malletRadius,
                    isPlayer ? this.playerMalletColor : this.aiMalletColor,
                    Math.abs(impulse)
                );
                
                // Son
                if (this.engine?.soundManager && Math.abs(impulse) > 5) {
                    this.engine.soundManager.playHit();
                } else if (this.engine?.soundManager) {
                    this.engine.soundManager.playClick();
                }
            }
        }
    }
    
    checkGoals() {
        // But du joueur (à droite)
        if (this.puck.x + this.puckRadius > this.width - this.tableMargin) {
            const goalTop = (this.height - this.goalWidth) / 2;
            const goalBottom = goalTop + this.goalWidth;
            
            if (this.puck.y > goalTop && this.puck.y < goalBottom) {
                // BUT POUR LE JOUEUR!
                this.playerScore++;
                this.handleGoal('player');
                return;
            } else {
                // Rebond sur le mur droit (hors but)
                this.puck.x = this.width - this.tableMargin - this.puckRadius;
                this.puck.vx *= -0.9;
                this.createWallHitEffect(this.width - this.tableMargin, this.puck.y);
            }
        }
        
        // But de l'IA (à gauche)
        if (this.puck.x - this.puckRadius < this.tableMargin) {
            const goalTop = (this.height - this.goalWidth) / 2;
            const goalBottom = goalTop + this.goalWidth;
            
            if (this.puck.y > goalTop && this.puck.y < goalBottom) {
                // BUT POUR L'IA!
                this.aiScore++;
                this.handleGoal('ai');
                return;
            } else {
                // Rebond sur le mur gauche (hors but)
                this.puck.x = this.tableMargin + this.puckRadius;
                this.puck.vx *= -0.9;
                this.createWallHitEffect(this.tableMargin, this.puck.y);
            }
        }
    }
    
    handleGoal(team) {
        // Effet spectaculaire
        this.goalEffect = { active: true, team, timer: 1.5 };
        
        const goalX = team === 'player' ? this.width - 60 : 60;
        const color = team === 'player' ? '#4ade80' : '#ef4444';
        
        // Particules d'explosion
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.particles.emit(goalX, this.height / 2, {
                    count: 8,
                    speed: 10,
                    size: 6,
                    colors: [color, '#ffffff', '#fbbf24'],
                    life: 1.5,
                    gravity: 100,
                    spread: Math.PI * 2
                });
            }, i * 20);
        }
        
        // Son
        if (team === 'player') {
            if (this.engine?.soundManager) this.engine.soundManager.playVictory();
        } else {
            if (this.engine?.soundManager) this.engine.soundManager.playGameOver();
        }
        
        // Vérifier victoire
        if (this.playerScore >= this.winScore || this.aiScore >= this.winScore) {
            this.gameOver = true;
            
            setTimeout(() => {
                if (this.playerScore >= this.winScore) {
                    this.endGame(true, '🏆 VICTOIRE!', '🏆');
                } else {
                    this.endGame(false, '🤖 DÉFAITE', '😢');
                }
            }, 1500);
        } else {
            // Reset après délai
            setTimeout(() => this.resetPuck(team === 'player' ? 'ai' : 'player'), 1500);
        }
        
        // Désactiver temporairement le palet
        this.puck.x = team === 'player' ? -100 : this.width + 100;
        this.puck.vx = 0;
        this.puck.vy = 0;
    }
    
    constrainMallet(mallet, isPlayer) {
        const minX = isPlayer ? 
            this.tableMargin + this.malletRadius :
            this.width / 2 + this.malletRadius;
        const maxX = isPlayer ?
            this.width / 2 - this.malletRadius :
            this.width - this.tableMargin - this.malletRadius;
        const minY = this.tableMargin + this.malletRadius;
        const maxY = this.height - this.tableMargin - this.malletRadius;
        
        mallet.x = MathUtils.clamp(mallet.x, minX, maxX);
        mallet.y = MathUtils.clamp(mallet.y, minY, maxY);
    }
    
    updateAI(dt) {
        let targetX = this.width - 150;
        let targetY = this.height / 2;
        
        // Comportement stratégique de l'IA
        if (this.puck.vx > 0 || this.puck.x > this.width * 0.4) {
            // Le palet vient vers nous ou est dans notre zone
            
            if (this.puck.x > this.width / 2) {
                // Palet dans notre moitié - mode attaque/défense
                if (this.puck.vx > 0) {
                    // Le palet avance vers notre but - défendre ET contrattaquer
                    // Prédire où le palet va arriver
                    const timeToReach = (this.aiMallet.x - this.puck.x) / Math.max(this.puck.vx, 1);
                    let predictedY = this.puck.y + this.puck.vy * timeToReach * 0.8;
                    
                    // Ajouter erreur de prédiction
                    predictedY += (Math.random() - 0.5) * 30;
                    
                    targetY = predictedY;
                    
                    // Si le palet est proche, aller vers lui pour frapper
                    if (this.puck.x > this.width * 0.65) {
                        targetX = this.puck.x + this.malletRadius + this.puckRadius + 10;
                        targetY = this.puck.y;
                    }
                } else {
                    // Le palet recule mais est dans notre zone - le suivre
                    targetY = this.puck.y;
                }
            } else {
                // Palet dans la zone adverse - revenir au centre-défense
                targetX = this.width - 150;
                targetY = this.height / 2 + (this.puck.y - this.height/2) * 0.3;
            }
        } else {
            // Position défensive par défaut
            targetX = this.width - 150;
            targetY = this.height / 2;
        }
        
        // Mouvement vers la cible avec limitation
        const dx = targetX - this.aiMallet.x;
        const dy = targetY - this.aiMallet.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 5) {
            const moveSpeed = Math.min(this.aiSpeed, dist);
            this.aiMallet.vx = (dx / dist) * moveSpeed;
            this.aiMallet.vy = (dy / dist) * moveSpeed;
            this.aiMallet.x += this.aiMallet.vx;
            this.aiMallet.y += this.aiMallet.vy;
        } else {
            this.aiMallet.vx = 0;
            this.aiMallet.vy = 0;
        }
    }
    
    updateEffects(dt) {
        // Goal effect timer
        if (this.goalEffect.active) {
            this.goalEffect.timer -= dt;
            if (this.goalEffect.timer <= 0) {
                this.goalEffect.active = false;
            }
        }
        
        // Hit effects
        for (let i = this.hitEffects.length - 1; i >= 0; i--) {
            this.hitEffects[i].timer -= dt;
            if (this.hitEffects[i].timer <= 0) {
                this.hitEffects.splice(i, 1);
            }
        }
    }
    
    updateTrail() {
        this.trailPositions.unshift({ 
            x: this.puck.x, 
            y: this.puck.y,
            speed: Math.sqrt(this.puck.vx**2 + this.puck.vy**2)
        });
        
        if (this.trailPositions.length > this.maxTrailLength) {
            this.trailPositions.pop();
        }
    }
    
    createHitEffect(x, y, color, intensity) {
        this.hitEffects.push({
            x, y, color, intensity,
            radius: 10 + intensity * 2,
            timer: 0.2
        });
        
        // Particules
        const particleCount = Math.min(15, Math.floor(intensity * 3));
        this.particles.emit(x, y, {
            count: particleCount,
            speed: 4 + intensity,
            size: 3 + intensity * 0.5,
            colors: [color, '#ffffff'],
            life: 0.4,
            spread: Math.PI * 0.8
        });
    }
    
    createWallHitEffect(x, y) {
        this.particles.emit(x, y, {
            count: 6,
            speed: 3,
            size: 3,
            colors: ['#fbbf24'],
            life: 0.3,
            spread: Math.PI * 0.5,
            direction: x < this.width/2 ? 0 : Math.PI
        });
    }
    
    render() {
        const ctx = this.ctx;
        
        // Fond
        this.renderTable(ctx);
        
        // Trail du palet
        this.renderTrail(ctx);
        
        // Palet
        this.renderPuck(ctx);
        
        // Maillets
        this.renderMallet(ctx, this.playerMallet, this.playerMalletColor, true);
        this.renderMallet(ctx, this.aiMallet, this.aiMalletColor, false);
        
        // Hit effects
        this.renderHitEffects(ctx);
        
        // Particules
        this.particles.render(ctx);
        
        // Goal effect
        if (this.goalEffect.active) {
            this.renderGoalEffect(ctx);
        }
        
        // Scores
        this.renderScores(ctx);
        
        // Countdown
        if (this.isCountingDown) {
            this.renderCountdown(ctx);
        }
        
        // Stats
        if (!this.isCountingDown && !this.gameOver) {
            ctx.font = '13px Rajdhani';
            ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
            ctx.textAlign = 'center';
            ctx.fillText(
                `Rally: ${this.currentRally} | Max: ${this.maxRally} | Hits: ${this.totalHits}`,
                this.width / 2, this.height - 12
            );
            ctx.textAlign = 'left';
        }
    }
    
    renderTable(ctx) {
        // Fond table
        const gradient = ctx.createRadialGradient(
            this.width/2, this.height/2, 0,
            this.width/2, this.height/2, this.width * 0.6
        );
        gradient.addColorStop(0, '#2563eb');
        gradient.addColorStop(1, '#1e40af');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Bordure
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = this.tableMargin * 2;
        RenderUtils.roundRect(
            ctx, 
            this.tableMargin, this.tableMargin, 
            this.width - this.tableMargin * 2, 
            this.height - this.tableMargin * 2, 
            15
        );
        ctx.stroke();
        
        // Ligne médiane
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 3;
        ctx.setLineDash([15, 10]);
        ctx.beginPath();
        ctx.moveTo(this.width/2, this.tableMargin);
        ctx.lineTo(this.width/2, this.height - this.tableMargin);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Centre
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.width/2, this.height/2, 60, 0, Math.PI * 2);
        ctx.stroke();
        
        // Buts
        const goalTop = (this.height - this.goalWidth) / 2;
        
        // But gauche (joueur)
        ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
        ctx.fillRect(0, goalTop, this.tableMargin, this.goalWidth);
        ctx.strokeStyle = this.playerMalletColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.tableMargin, goalTop);
        ctx.lineTo(0, goalTop);
        ctx.lineTo(0, goalTop + this.goalWidth);
        ctx.lineTo(this.tableMargin, goalTop + this.goalWidth);
        ctx.stroke();
        
        // But droit (IA)
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(this.width - this.tableMargin, goalTop, this.tableMargin, this.goalWidth);
        ctx.strokeStyle = this.aiMalletColor;
        ctx.beginPath();
        ctx.moveTo(this.width - this.tableMargin, goalTop);
        ctx.lineTo(this.width, goalTop);
        ctx.lineTo(this.width, goalTop + this.goalWidth);
        ctx.lineTo(this.width - this.tableMargin, goalTop + this.goalWidth);
        ctx.stroke();
    }
    
    renderTrail(ctx) {
        for (let i = 0; i < this.trailPositions.length; i++) {
            const pos = this.trailPositions[i];
            const alpha = (1 - i / this.trailPositions.length) * 0.5;
            const size = this.puckRadius * (1 - i / this.trailPositions.length * 0.6);
            const speedFactor = Math.min(pos.speed / 10, 1);
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * speedFactor})`;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderPuck(ctx) {
        // Ombre
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(this.puck.x + 3, this.puck.y + 3, this.puckRadius, this.puckRadius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Palet principal
        const gradient = ctx.createRadialGradient(
            this.puck.x - 5, this.puck.y - 5, 0,
            this.puck.x, this.puck.y, this.puckRadius
        );
        gradient.addColorStop(0, '#374151');
        gradient.addColorStop(1, '#111827');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.puck.x, this.puck.y, this.puckRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Reflet
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.puck.x - 5, this.puck.y - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Bordure
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.puck.x, this.puck.y, this.puckRadius - 1, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    renderMallet(ctx, mallet, color, isPlayer) {
        // Ombre
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(mallet.x + 3, mallet.y + 3, this.malletRadius, this.malletRadius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Corps du maillet
        const gradient = ctx.createRadialGradient(
            mallet.x - 10, mallet.y - 10, 0,
            mallet.x, mallet.y, this.malletRadius
        );
        
        if (isPlayer) {
            gradient.addColorStop(0, '#86efac');
            gradient.addColorStop(0.7, color);
            gradient.addColorStop(1, '#16a34a');
        } else {
            gradient.addColorStop(0, '#fca5a5');
            gradient.addColorStop(0.7, color);
            gradient.addColorStop(1, '#dc2626');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mallet.x, mallet.y, this.malletRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Poignée centrale
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(mallet.x, mallet.y, this.malletRadius * 0.45, 0, Math.PI * 2);
        ctx.fill();
        
        // Bordure
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(mallet.x, mallet.y, this.malletRadius - 2, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    renderHitEffects(ctx) {
        for (const effect of this.hitEffects) {
            const alpha = effect.timer / 0.2;
            
            ctx.strokeStyle = effect.color;
            ctx.globalAlpha = alpha * 0.6;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius * (1 - alpha * 0.3), 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.globalAlpha = 1;
        }
    }
    
    renderGoalEffect(ctx) {
        const alpha = Math.min(1, this.goalEffect.timer);
        const color = this.goalEffect.team === 'player' ? '#4ade80' : '#ef4444';
        
        ctx.fillStyle = `${color}${Math.floor(alpha * 100).toString(16).padStart(2, '0')}`;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Texte GOAL
        if (alpha > 0.5) {
            ctx.font = 'bold 80px Orbitron';
            ctx.fillStyle = `rgba(255, 255, 255, ${(alpha - 0.5) * 2})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚽ GOAL! ⚽', this.width / 2, this.height / 2);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
        }
    }
    
    renderScores(ctx) {
        // Score joueur
        ctx.font = 'bold 56px Orbitron';
        ctx.fillStyle = this.playerMalletColor;
        ctx.textAlign = 'center';
        ctx.fillText(this.playerScore.toString(), this.width / 4, 70);
        
        ctx.font = '14px Rajdhani';
        ctx.fillStyle = 'rgba(74, 222, 128, 0.6)';
        ctx.fillText('VOUS', this.width / 4, 95);
        
        // Score IA
        ctx.font = 'bold 56px Orbitron';
        ctx.fillStyle = this.aiMalletColor;
        ctx.fillText(this.aiScore.toString(), this.width * 3 / 4, 70);
        
        ctx.font = '14px Rajdhani';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.fillText('IA', this.width * 3 / 4, 95);
        
        ctx.textAlign = 'left';
    }
    
    renderCountdown(ctx) {
        if (this.countdown > 0) {
            ctx.font = 'bold 120px Orbitron';
            ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.countdown.toString(), this.width / 2, this.height / 2);
        } else {
            ctx.font = 'bold 36px Orbitron';
            ctx.fillStyle = '#4ade80';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('GO!', this.width / 2, this.height / 2);
        }
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
    }
    
    handleKey(key, code) {
        const speed = 15;
        
        switch (code) {
            case 'ArrowUp':
            case 'KeyW':
                this.playerMallet.vy = -speed;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.playerMallet.vy = speed;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.playerMallet.vx = -speed;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.playerMallet.vx = speed;
                break;
        }
    }
    
    handleKeyUp(key, code) {
        // Arrêter le mouvement quand on relâche
        switch (code) {
            case 'ArrowUp':
            case 'KeyW':
            case 'ArrowDown':
            case 'KeyS':
                this.playerMallet.vy = 0;
                break;
            case 'ArrowLeft':
            case 'KeyA':
            case 'ArrowRight':
            case 'KeyD':
                this.playerMallet.vx = 0;
                break;
        }
    }
    
    handleMouseMove(x, y) {
        // Contrôle fluide avec la souris
        const targetX = x;
        const targetY = y;
        
        // Interpolation douce
        this.playerMallet.x += (targetX - this.playerMallet.x) * 0.3;
        this.playerMallet.y += (targetY - this.playerMallet.y) * 0.3;
    }
}
