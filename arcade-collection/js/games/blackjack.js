/**
 * ============================================
 * ARCADE ULTIMATE - BLACKJACK GAME
 * 21 points contre le Croupier IA
 * ============================================
 */

class BlackjackGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Configuration des cartes
        this.suits = ['♠', '♥', '♦', '♣'];
        this.suitColors = { '♠': '#1f2937', '♥': '#dc2626', '♦': '#dc2626', '♣': '#1f2937' };
        this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        // Dimensions des cartes
        this.cardWidth = 80;
        this.cardHeight = 115;
        
        // Système d'effets
        this.particles = new ParticleSystem(100);
        this.dealAnimation = { active: false, timer: 0, phase: 0 };
        
        // Initialiser
        this.init();
    }
    
    init() {
        // Deck
        this.deck = [];
        this.createDeck();
        this.shuffleDeck();
        
        // Mains
        this.playerHand = [];
        this.dealerHand = [];
        
        // État du jeu
        this.gamePhase = 'betting'; // betting, playing, dealerTurn, ended
        this.message = 'Placez votre mise ou appuyez sur DEAL';
        this.resultMessage = '';
        
        // Mise et score
        this.bet = 100;
        this.balance = 1000;
        this.score = 0;
        
        // Stats
        this.handsPlayed = 0;
        this.wins = 0;
        this.losses = 0;
        this.pushes = 0;
        this.blackjacks = 0;
        
        // Animation
        this.cardAnimations = [];
        this.showDealerHoleCard = false;
        this.resultTimer = 0;
        
        // Boutons actifs
        this.buttonsEnabled = {
            deal: true,
            hit: false,
            stand: false,
            double: false,
            newGame: false
        };
        
        // État
        this.gameOver = false;
        this.gameState = GAME_STATES.IDLE;
    }
    
    createDeck() {
        this.deck = [];
        for (const suit of this.suits) {
            for (const value of this.values) {
                this.deck.push({ suit, value });
            }
        }
        // Utiliser plusieurs decks pour plus de réalisme (6 decks comme dans les casinos)
        const tempDeck = [...this.deck];
        for (let i = 0; i < 5; i++) {
            this.deck.push(...tempDeck.map(c => ({...c})));
        }
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    drawCard() {
        if (this.deck.length === 0) {
            this.createDeck();
            this.shuffleDeck();
        }
        return this.deck.pop();
    }
    
    getHandValue(hand) {
        let value = 0;
        let aces = 0;
        
        for (const card of hand) {
            if (card.value === 'A') {
                aces++;
                value += 11;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                value += 10;
            } else {
                value += parseInt(card.value);
            }
        }
        
        // Ajuster la valeur des As
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        
        return value;
    }
    
    isBlackjack(hand) {
        return hand.length === 2 && this.getHandValue(hand) === 21;
    }
    
    startNewRound() {
        if (this.balance < this.bet) {
            this.bet = this.balance;
        }
        
        // Vérifier si assez d'argent
        if (this.balance <= 0) {
            this.balance = 1000; // Reset
            this.message = "💰 Nouveau solde accordé !";
        }
        
        // Reset
        this.playerHand = [];
        this.dealerHand = [];
        this.showDealerHoleCard = false;
        this.gamePhase = 'playing';
        this.resultMessage = '';
        
        // Distribuer les cartes initiales avec animation
        this.dealInitialCards();
    }
    
    dealInitialCards() {
        // Distribution alternée (comme dans un vrai casino)
        this.playerHand.push(this.drawCard());
        this.dealerHand.push(this.drawCard());
        this.playerHand.push(this.drawCard());
        this.dealerHand.push(this.drawCard());
        
        // Vérifier blackjacks
        if (this.isBlackjack(this.playerHand)) {
            if (this.isBlackjack(this.dealerHand)) {
                // Double blackjack = push
                setTimeout(() => this.endRound('push'), 500);
            } else {
                // Blackjack du joueur = 1.5x la mise
                this.blackjacks++;
                setTimeout(() => this.endRound('blackjack'), 500);
            }
        } else if (this.isBlackjack(this.dealerHand)) {
            // Blackjack du croupier
            setTimeout(() => this.endRound('dealerBlackjack'), 800);
        } else {
            // Jeu normal
            this.updateButtons();
            this.message = 'Votre tour - H: Hit | S: Stand | D: Double';
        }
        
        this.handsPlayed++;
    }
    
    hit() {
        if (this.gamePhase !== 'playing') return;
        
        this.playerHand.push(this.drawCard());
        
        // Particules
        this.particles.emit(this.width / 2, this.height / 2 + 50, {
            count: 10,
            speed: 4,
            size: 4,
            colors: ['#22c55e', '#ffffff'],
            life: 0.4,
            spread: Math.PI
        });
        
        if (this.engine?.soundManager) {
            this.engine.soundManager.playClick();
        }
        
        const playerValue = this.getHandValue(this.playerHand);
        
        if (playerValue > 21) {
            // Bust!
            this.showDealerHoleCard = true;
            setTimeout(() => this.endRound('bust'), 500);
        } else if (playerValue === 21) {
            // Stand automatique à 21
            this.stand();
        } else {
            // Plus de double après hit
            this.buttonsEnabled.double = false;
            this.message = `Total: ${playerValue} - H: Hit | S: Stand`;
        }
    }
    
    stand() {
        if (this.gamePhase !== 'playing') return;
        
        this.gamePhase = 'dealerTurn';
        this.showDealerHoleCard = true;
        this.message = 'Tour du croupier...';
        
        // Le croupie joue automatiquement
        this.dealerPlay();
    }
    
    doubleDown() {
        if (this.gamePhase !== 'playing' || this.playerHand.length !== 2) return;
        if (this.balance < this.bet) {
            this.message = "Pas assez pour doubler !";
            return;
        }
        
        this.bet *= 2;
        this.hit(); // Une seule carte puis stand automatique
        
        if (!this.gameOver) {
            setTimeout(() => this.stand(), 600);
        }
    }
    
    dealerPlay() {
        const playInterval = setInterval(() => {
            const dealerValue = this.getHandValue(this.dealerHand);
            
            // Règle du croupier: tire jusqu'à 17, reste sur soft 17 ou plus
            if (dealerValue < 17) {
                this.dealerHand.push(this.drawCard());
                
                if (this.engine?.soundManager) {
                    this.engine.soundManager.playClick();
                }
            } else {
                clearInterval(playInterval);
                
                // Déterminer le résultat
                setTimeout(() => {
                    const playerValue = this.getHandValue(this.playerHand);
                    const finalDealerValue = this.getHandValue(this.dealerHand);
                    
                    if (finalDealerValue > 21) {
                        this.endRound('dealerBust');
                    } else if (finalDealerValue > playerValue) {
                        this.endRound('lose');
                    } else if (playerValue > finalDealerValue) {
                        this.endRound('win');
                    } else {
                        this.endRound('push');
                    }
                }, 500);
            }
        }, 400);
    }
    
    endRound(result) {
        this.gamePhase = 'ended';
        this.gameOver = true;
        
        const playerValue = this.getHandValue(this.playerHand);
        const dealerValue = this.getHandValue(this.dealerHand);
        
        switch (result) {
            case 'blackjack':
                this.resultMessage = '🎉 BLACKJACK! 3:2!';
                this.balance += Math.floor(this.bet * 2.5);
                this.wins++;
                this.score = this.bet * 15;
                break;
                
            case 'win':
                this.resultMessage = `✨ Vous gagnez! (${playerValue} vs ${dealerValue})`;
                this.balance += this.bet * 2;
                this.wins++;
                this.score = this.bet * 10;
                break;
                
            case 'dealerBust':
                this.resultMessage = `🎉 Le croupier bust! Vous gagnez!`;
                this.balance += this.bet * 2;
                this.wins++;
                this.score = this.bet * 10;
                break;
                
            case 'lose':
                this.resultMessage = `😢 Le croupier gagne (${playerValue} vs ${dealerValue})`;
                this.losses++;
                this.score = 0;
                break;
                
            case 'bust':
                this.resultMessage = `💥 Bust! ${playerValue} points`;
                this.losses++;
                this.score = 0;
                break;
                
            case 'push':
                this.resultMessage = `🤝 Égalité! (${playerValue} vs ${dealerValue})`;
                this.balance += this.bet; // Retour de la mise
                this.pushes++;
                this.score = this.bet * 5;
                break;
                
            case 'dealerBlackjack':
                this.resultMessage = '😱 Blackjack du croupier!';
                this.losses++;
                this.score = 0;
                break;
        }
        
        this.updateButtons();
        
        // Effets visuels selon le résultat
        if (['win', 'blackjack', 'dealerBust'].includes(result)) {
            this.particles.emit(this.width / 2, this.height / 2, {
                count: 40,
                speed: 8,
                size: 6,
                colors: ['#22c55e', '#fbbf24', '#ffffff'],
                life: 1.2,
                gravity: 150,
                spread: Math.PI * 2
            });
            
            if (this.engine?.soundManager) {
                this.engine.soundManager.playVictory();
            }
        } else if (['lose', 'bust', 'dealerBlackjack'].includes(result)) {
            if (this.engine?.soundManager) {
                this.engine.soundManager.playGameOver();
            }
        }
        
        // Mettre à jour le score affiché
        if (this.engine) {
            this.engine.score = this.score;
            this.engine.updateScoreDisplay();
        }
        
        // Afficher le modal après un délai
        setTimeout(() => {
            const icon = ['win', 'blackjack', 'dealerBust'].includes(result) ? '🏆' :
                         result === 'push' ? '🤝' : '😢';
            const title = ['win', 'blackjack', 'dealerBust'].includes(result) ? 'VICTOIRE!' :
                          result === 'push' ? 'ÉGALITÉ' : 'DÉFAITE';
            
            const statsHtml = `
                <span>🃏 Mains jouées: ${this.handsPlayed}</span>
                <span>✅ Victoires: ${this.wins}</span>
            `;
            
            this.engine?.showModal(icon, title, this.balance, statsHtml);
        }, 1500);
    }
    
    updateButtons() {
        switch (this.gamePhase) {
            case 'betting':
                this.buttonsEnabled = { deal: true, hit: false, stand: false, double: false, newGame: false };
                break;
            case 'playing':
                const canDouble = this.playerHand.length === 2 && this.balance >= this.bet;
                this.buttonsEnabled = { deal: false, hit: true, stand: true, double: canDouble, newGame: false };
                break;
            case 'ended':
                this.buttonsEnabled = { deal: false, hit: false, stand: false, double: false, newGame: true };
                break;
            default:
                this.buttonsEnabled = { deal: false, hit: false, stand: false, double: false, newGame: false };
        }
    }
    
    newGame() {
        this.startNewRound();
        this.gameOver = false;
        this.gameState = GAME_STATES.PLAYING;
    }
    
    update(dt) {
        super.update(dt);
        this.particles.update(dt);
    }
    
    render() {
        const ctx = this.ctx;
        
        // Fond table de casino
        this.renderTableBackground(ctx);
        
        // Zone du croupier
        this.renderDealerArea(ctx);
        
        // Zone du joueur
        this.renderPlayerArea(ctx);
        
        // Informations
        this.renderInfoPanel(ctx);
        
        // Boutons
        this.renderButtons(ctx);
        
        // Particules
        this.particles.render(ctx);
    }
    
    renderTableBackground(ctx) {
        // Gradient radial vert casino
        const gradient = ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width * 0.7
        );
        gradient.addColorStop(0, '#166534');
        gradient.addColorStop(0.7, '#14532d');
        gradient.addColorStop(1, '#052e16');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Bordure dorée
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 8;
        RenderUtils.roundRect(ctx, 10, 10, this.width - 20, this.height - 20, 20);
        ctx.stroke();
        
        // Motif subtil
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.width; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.height);
            ctx.stroke();
        }
    }
    
    renderDealerArea(ctx) {
        const centerY = 130;
        
        // Label
        ctx.font = 'bold 18px Orbitron';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText('CROUPIER', this.width / 2, 35);
        
        // Cartes du croupier
        const startX = this.width / 2 - (this.dealerHand.length * (this.cardWidth + 15)) / 2;
        
        for (let i = 0; i < this.dealerHand.length; i++) {
            const x = startX + i * (this.cardWidth + 15);
            const y = centerY - this.cardHeight / 2;
            
            if (i === 1 && !this.showDealerHoleCard) {
                // Carte cachée (dos)
                this.renderCardBack(ctx, x, y);
            } else {
                this.renderCard(ctx, x, y, this.dealerHand[i]);
            }
        }
        
        // Valeur du croupier (si révélée)
        if (this.showDealerHoleCard || this.gamePhase === 'ended') {
            const dealerValue = this.getHandValue(this.dealerHand);
            ctx.font = 'bold 24px Orbitron';
            ctx.fillStyle = dealerValue > 21 ? '#ef4444' : '#ffffff';
            ctx.fillText(dealerValue.toString(), this.width / 2, centerY + this.cardHeight / 2 + 30);
        }
        
        ctx.textAlign = 'left';
    }
    
    renderPlayerArea(ctx) {
        const centerY = this.height - 180;
        
        // Label
        ctx.font = 'bold 18px Orbitron';
        ctx.fillStyle = '#4ade80';
        ctx.textAlign = 'center';
        ctx.fillText('VOS CARTES', this.width / 2, this.height - 280);
        
        // Cartes du joueur
        const startX = this.width / 2 - (this.playerHand.length * (this.cardWidth + 15)) / 2;
        
        for (let i = 0; i < this.playerHand.length; i++) {
            const x = startX + i * (this.cardWidth + 15);
            const y = centerY - this.cardHeight / 2;
            this.renderCard(ctx, x, y, this.playerHand[i]);
        }
        
        // Valeur du joueur
        const playerValue = this.getHandValue(this.playerHand);
        ctx.font = 'bold 28px Orbitron';
        ctx.fillStyle = playerValue > 21 ? '#ef4444' : 
                             playerValue === 21 ? '#fbbf24' : '#4ade80';
        ctx.fillText(playerValue.toString(), this.width / 2, centerY + this.cardHeight / 2 + 35);
        
        // Blackjack indicator
        if (this.isBlackjack(this.playerHand)) {
            ctx.font = 'bold 20px Orbitron';
            ctx.fillStyle = '#fbbf24';
            ctx.fillText('⭐ BLACKJACK! ⭐', this.width / 2, centerY + this.cardHeight / 2 + 60);
        }
        
        ctx.textAlign = 'left';
    }
    
    renderCard(ctx, x, y, card) {
        // Ombre
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        RenderUtils.roundRect(ctx, x + 4, y + 4, this.cardWidth, this.cardHeight, 8);
        ctx.fill();
        
        // Carte blanche
        ctx.fillStyle = '#ffffff';
        RenderUtils.roundRect(ctx, x, y, this.cardWidth, this.cardHeight, 8);
        ctx.fill();
        
        // Couleur de la carte
        const color = this.suitColors[card.suit];
        
        // Valeur en haut à gauche
        ctx.fillStyle = color;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(card.value, x + 8, y + 25);
        
        // Symbole en haut à gauche
        ctx.font = '18px Arial';
        ctx.fillText(card.suit, x + 8, y + 45);
        
        // Grand symbole au centre
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(card.suit, x + this.cardWidth / 2, y + this.cardHeight / 2 + 12);
        
        // Valeur en bas à droite (inversée)
        ctx.save();
        ctx.translate(x + this.cardWidth - 8, y + this.cardHeight - 8);
        ctx.rotate(Math.PI);
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(card.value, 0, 0);
        ctx.font = '18px Arial';
        ctx.fillText(card.suit, 0, 20);
        ctx.restore();
        
        // Bordure subtile
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        RenderUtils.roundRect(ctx, x, y, this.cardWidth, this.cardHeight, 8);
        ctx.stroke();
    }
    
    renderCardBack(ctx, x, y) {
        // Ombre
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        RenderUtils.roundRect(ctx, x + 4, y + 4, this.cardWidth, this.cardHeight, 8);
        ctx.fill();
        
        // Dos de carte
        ctx.fillStyle = '#1e40af';
        RenderUtils.roundRect(ctx, x, y, this.cardWidth, this.cardHeight, 8);
        ctx.fill();
        
        // Pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 12 + i * 11);
            ctx.lineTo(x + this.cardWidth - 10, y + 12 + i * 11);
            ctx.stroke();
        }
        
        // Logo central
        ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
        ctx.beginPath();
        ctx.arc(x + this.cardWidth / 2, y + this.cardHeight / 2, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('?', x + this.cardWidth / 2, y + this.cardHeight / 2 + 6);
    }
    
    renderInfoPanel(ctx) {
        // Solde
        ctx.font = 'bold 20px Orbitron';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'left';
        ctx.fillText(`💰 ${this.balance}`, 25, 45);
        
        // Mise actuelle
        ctx.font = '16px Rajdhani';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Mise: ${this.bet}`, 25, 70);
        
        // Message
        ctx.font = '18px Rajdhani';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.resultMessage ? 
            (this.resultMessage.includes('gagne') || this.resultMessage.includes('Blackjack')) ? '#4ade80' :
            this.resultMessage.includes('bust') || this.resultMessage.includes('perte') ? '#ef4444' : '#fbbf24'
            : '#e2e8f0';
        ctx.fillText(this.message || this.resultMessage, this.width / 2, this.height - 55);
        
        // Stats
        ctx.font = '13px Rajdhani';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'right';
        ctx.fillText(`V:${this.wins} D:${this.losses} N:${this.pushes} BJ:${this.blackjacks}`, this.width - 25, 45);
        
        ctx.textAlign = 'left';
    }
    
    renderButtons(ctx) {
        const buttons = [
            { id: 'deal', text: 'DEAL', key: 'D', enabled: this.buttonsEnabled.deal },
            { id: 'hit', text: 'HIT', key: 'H', enabled: this.buttonsEnabled.hit },
            { id: 'stand', text: 'STAND', key: 'S', enabled: this.buttonsEnabled.stand },
            { id: 'double', text: 'DOUBLE', key: 'D (x2)', enabled: this.buttonsEnabled.double },
            { id: 'newGame', text: 'NEW GAME', key: 'N', enabled: this.buttonsEnabled.newGame }
        ];
        
        const buttonY = this.height - 42;
        const buttonWidth = 95;
        const buttonHeight = 34;
        const startX = (this.width - (buttons.filter(b => b.enabled).length * (buttonWidth + 10))) / 2;
        
        let currentX = startX;
        
        for (const btn of buttons) {
            if (!btn.enabled) continue;
            
            const isHovered = false; // Pourrait être implémenté
            
            ctx.save();
            
            // Fond bouton
            if (btn.id === 'hit' || btn.id === 'newGame') {
                ctx.fillStyle = isHovered ? '#22c55e' : '#16a34a';
            } else if (btn.id === 'stand') {
                ctx.fillStyle = isHovered ? '#ef4444' : '#dc2626';
            } else {
                ctx.fillStyle = isHovered ? '#6366f1' : '#4f46e5';
            }
            
            RenderUtils.roundRect(ctx, currentX, buttonY, buttonWidth, buttonHeight, 8);
            ctx.fill();
            
            // Texte
            ctx.font = 'bold 12px Orbitron';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(btn.text, currentX + buttonWidth / 2, buttonY + buttonHeight / 2);
            
            // Raccourci clavier
            ctx.font = '10px Rajdhani';
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillText(`[${btn.key}]`, currentX + buttonWidth / 2, buttonY + buttonHeight - 6);
            
            ctx.restore();
            
            currentX += buttonWidth + 10;
        }
    }
    
    handleKey(key, code) {
        switch (code) {
            case 'KeyH':
            case 'KeyZ':
                if (this.buttonsEnabled.hit) this.hit();
                break;
            case 'KeyS':
            case 'KeyQ':
                if (this.buttonsEnabled.stand) this.stand();
                break;
            case 'KeyD':
                if (this.buttonsEnabled.double) this.doubleDown();
                else if (this.buttonsEnabled.deal) this.startNewRound();
                else if (this.buttonsEnabled.newGame) this.newGame();
                break;
            case 'Enter':
            case 'Space':
                if (this.buttonsEnabled.deal) this.startNewRound();
                else if (this.buttonsEnabled.newGame) this.newGame();
                break;
        }
    }
    
    handleClick(x, y) {
        // Vérifier clics sur les boutons
        const buttonY = this.height - 42;
        const buttonHeight = 34;
        
        if (y >= buttonY && y <= buttonY + buttonHeight) {
            if (this.buttonsEnabled.deal) this.startNewRound();
            else if (this.buttonsEnabled.hit) this.hit();
            else if (this.buttonsEnabled.stand) this.stand();
            else if (this.buttonsEnabled.double) this.doubleDown();
            else if (this.buttonsEnabled.newGame) this.newGame();
        }
    }
}
