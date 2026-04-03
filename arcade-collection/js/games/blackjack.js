// arcade-collection/js/games/blackjack.js

/**
 * ============================================
 * ARCADE COLLECTION - BLACKJACK (21)
 * Classique jeu de cartes contre le croupier
 * Contrôles: Clic souris pour les actions
 * ============================================
 */

class BlackjackGame extends BaseGame {
    constructor(ctx, width, height) {
        super(ctx, width, height);
        
        // Configuration
        this.config = {
            deckCount: 1,
            blackjackPayout: 1.5,
            dealerStandsOn: 17,
            chipValue: 10,
            startingChips: 1000
        };
        
        // Valeurs des cartes
        this.cardValues = {
            'A': 11, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
            '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10
        };
        
        // Couleurs des symboles
        this.suits = {
            'hearts': { symbol: '♥', color: '#ef5350' },
            'diamonds': { symbol: '♦', color: '#ef5350' },
            'clubs': { symbol: '♣', color: '#ffffff' },
            'spades': { symbol: '♠', color: '#ffffff' }
        };
        
        // État du jeu (initialisé dans init())
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.playerChips = this.config.startingChips;
        this.currentBet = 0;
        this.gamePhase = 'betting'; // betting, playing, dealerTurn, result
        this.resultMessage = '';
        this.canHit = true;
        this.canStand = true;
        this.canDouble = true;
        
        // Animation
        this.dealAnimationProgress = 0;
        this.isDealing = false;
        
        // Boutons
        this.buttons = [];
        
        // Couleurs
        this.colors = {
            ...this.colors,
            background: '#0d4f2a',
            tableFelt: '#1b5e20',
            tableBorder: '#2e7d32',
            cardWhite: '#fafafa',
            cardBack: '#1565c0',
            chipRed: '#d32f2f',
            chipGold: '#ffa000',
            textGold: '#ffd700'
        };
    }

    /**
     * Créer un nouveau deck mélangé
     */
    createDeck() {
        const suits = Object.keys(this.suits);
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck = [];
        
        for (let d = 0; d < this.config.deckCount; d++) {
            for (const suit of suits) {
                for (const value of values) {
                    deck.push({ suit, value });
                }
            }
        }
        
        return Utils.shuffle(deck);
    }

    /**
     * Tirer une carte du deck
     */
    drawCard() {
        if (this.deck.length === 0) {
            this.deck = this.createDeck();
        }
        return this.deck.pop();
    }

    /**
     * Calculer la valeur d'une main
     */
    calculateHand(hand) {
        let value = 0;
        let aces = 0;
        
        for (const card of hand) {
            value += this.cardValues[card.value];
            if (card.value === 'A') aces++;
        }
        
        // Ajuster les As (11 ou 1)
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        
        return value;
    }

    /**
     * Vérifier si c'est un Blackjack
     */
    isBlackjack(hand) {
        return hand.length === 2 && this.calculateHand(hand) === 21;
    }

    /**
     * Initialiser le jeu
     */
    init() {
        super.init();
        
        // Créer un nouveau deck
        this.deck = this.createDeck();
        
        // Réinitialiser les mains
        this.playerHand = [];
        this.dealerHand = [];
        
        // Réinitialiser l'état
        this.currentBet = 0;
        this.gamePhase = 'betting';
        this.resultMessage = '';
        this.canHit = true;
        this.canStand = true;
        this.canDouble = true;
        this.isDealing = false;
        this.dealAnimationProgress = 0;
        
        console.log('[Blackjack] Jeu initialisé');
    }

    /**
     * Placer une mise
     * @param {number} amount - Montant de la mise
     */
    placeBet(amount) {
        if (this.gamePhase !== 'betting') return;
        if (this.playerChips < amount) return;
        
        this.currentBet += amount;
        this.playerChips -= amount;
        
        // Démarrer le jeu si mise minimale atteinte
        if (this.currentBet >= this.config.chipValue) {
            this.startRound();
        }
    }

    /**
     * Démarrer un tour
     */
    startRound() {
        this.gamePhase = 'playing';
        this.isDealing = true;
        this.dealAnimationProgress = 0;
        
        // Distribuer les cartes initiales
        setTimeout(() => {
            this.playerHand.push(this.drawCard());
            this.dealerHand.push(this.drawCard());
            
            setTimeout(() => {
                this.playerHand.push(this.drawCard());
                this.dealerHand.push(this.drawCard());
                
                this.isDealing = false;
                
                // Vérifier les blackjacks immédiats
                if (this.isBlackjack(this.playerHand)) {
                    if (this.isBlackjack(this.dealerHand)) {
                        this.endRound('push');
                    } else {
                        this.endRound('blackjack');
                    }
                } else if (this.isBlackjack(this.dealerHand)) {
                    this.endRound('dealerBlackjack');
                } else {
                    // Le double n'est possible qu'avec exactement 2 cartes et assez de jetons
                    this.canDouble = this.playerChips >= this.currentBet;
                }
                
                Utils.audio.playClick();
            }, 200);
        }, 200);
    }

    /**
     * Tirer une carte (Hit)
     */
    hit() {
        if (!this.canHit || this.gamePhase !== 'playing') return;
        
        this.playerHand.push(this.drawCard());
        this.canDouble = false;
        Utils.audio.playClick();
        
        const playerValue = this.calculateHand(this.playerHand);
        
        if (playerValue > 21) {
            this.endRound('bust');
        } else if (playerValue === 21) {
            this.stand(); // Auto-stand à 21
        }
    }

    /**
     * Rester (Stand)
     */
    stand() {
        if (!this.canStand || this.gamePhase !== 'playing') return;
        
        this.gamePhase = 'dealerTurn';
        this.canHit = false;
        this.canStand = false;
        this.canDouble = false;
        
        // Tour du croupier
        this.playDealerTurn();
    }

    /**
     * Doubler la mise
     */
    doubleDown() {
        if (!this.canDouble || this.gamePhase !== 'playing') return;
        
        this.playerChips -= this.currentBet;
        this.currentBet *= 2;
        
        // Une seule carte puis stand automatique
        this.playerHand.push(this.drawCard());
        this.canDouble = false;
        Utils.audio.playClick();
        
        if (this.calculateHand(this.playerHand) > 21) {
            this.endRound('bust');
        } else {
            this.stand();
        }
    }

    /**
     * Tour du croupier
     */
    playDealerTurn() {
        const drawNextCard = () => {
            const dealerValue = this.calculateHand(this.dealerHand);
            
            if (dealerValue < this.config.dealerStandsOn) {
                this.dealerHand.push(this.drawCard());
                Utils.audio.playBounce();
                setTimeout(drawNextCard, 600);
            } else {
                this.determineWinner();
            }
        };
        
        setTimeout(drawNextCard, 500);
    }

    /**
     * Déterminer le gagnant
     */
    determineWinner() {
        const playerValue = this.calculateHand(this.playerHand);
        const dealerValue = this.calculateHand(this.dealerHand);
        
        if (dealerValue > 21) {
            this.endRound('dealerBust');
        } else if (playerValue > dealerValue) {
            this.endRound('win');
        } else if (dealerValue > playerValue) {
            this.endRound('lose');
        } else {
            this.endRound('push');
        }
    }

    /**
     * Terminer le tour
     */
    endRound(result) {
        this.gamePhase = 'result';
        
        let winnings = 0;
        
        switch (result) {
            case 'blackjack':
                winnings = Math.floor(this.currentBet * (1 + this.config.blackjackPayout));
                this.resultMessage = `🎉 BLACKJACK! +${winnings}`;
                Utils.audio.playSuccess();
                break;
                
            case 'win':
                winnings = this.currentBet * 2;
                this.resultMessage = `✨ Vous gagnez! +${winnings}`;
                Utils.audio.playSuccess();
                break;
                
            case 'dealerBust':
                winnings = this.currentBet * 2;
                this.resultMessage = `🎊 Le croupier bust! +${winnings}`;
                Utils.audio.playSuccess();
                break;
                
            case 'push':
                winnings = this.currentBet;
                this.resultMessage = `🤝 Push - Égalité`;
                Utils.audio.playClick();
                break;
                
            case 'lose':
                winnings = 0;
                this.resultMessage = `😔 Vous perdez -${this.currentBet}`;
                Utils.audio.playError();
                break;
                
            case 'bust':
                winnings = 0;
                this.resultMessage = `💥 Bust! -${this.currentBet}`;
                Utils.audio.playError();
                break;
                
            case 'dealerBlackjack':
                winnings = 0;
                this.resultMessage = `😱 Blackjack du croupier!`;
                Utils.audio.playError();
                break;
        }
        
        this.playerChips += winnings;
        this.addScore(winnings);
        
        // Vérifier si le joueur est ruiné
        if (this.playerChips <= 0) {
            this.playerChips = this.config.startingChips;
            this.resultMessage += ' | Jetons rechargeés!';
        }
    }

    /**
     * Nouvelle partie
     */
    newGame() {
        this.init();
    }

    /**
     * Mettre à jour le jeu
     */
    update(deltaTime) {
        if (this.isDealing) {
            this.dealAnimationProgress += deltaTime * 3;
            if (this.dealAnimationProgress >= 1) {
                this.dealAnimationProgress = 1;
            }
        }
    }

    /**
     * Rendre le jeu
     */
    render(ctx) {
        // Fond (table de casino)
        const gradient = ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 1.5
        );
        gradient.addColorStop(0, this.colors.tableFelt);
        gradient.addColorStop(1, this.colors.background);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Bordure de table
        ctx.strokeStyle = this.colors.tableBorder;
        ctx.lineWidth = 15;
        Utils.canvas.roundRect(ctx, 20, 20, this.width - 40, this.height - 40, 30, null, this.colors.tableBorder);
        
        // Titre
        Utils.canvas.drawGlowText(ctx, 'BLACKJACK', this.width / 2, 50, {
            font: 'bold 32px Orbitron',
            color: this.colors.textGold,
            glowColor: this.colors.textGold,
            glowSize: 20
        });
        
        // Zone du croupier
        this.drawDealerArea(ctx);
        
        // Zone du joueur
        this.drawPlayerArea(ctx);
        
        // Informations de mise et jetons
        this.drawInfoPanel(ctx);
        
        // Boutons d'action
        if (this.gamePhase === 'playing' || this.gamePhase === 'betting') {
            this.drawActionButtons(ctx);
        }
        
        // Message de résultat
        if (this.gamePhase === 'result') {
            this.drawResultMessage(ctx);
        }
    }

    /**
     * Dessiner la zone du croupier
     */
    drawDealerArea(ctx) {
        const y = 120;
        
        // Label
        ctx.font = '16px Orbitron';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('CROUPIER', this.width / 2, y);
        
        // Cartes du croupier
        const startX = this.width / 2 - (this.dealerHand.length * 45) / 2;
        
        this.dealerHand.forEach((card, i) => {
            const x = startX + i * 50;
            const hideCard = (i === 1 && this.gamePhase === 'playing');
            this.drawCard(ctx, x, y + 20, card, hideCard);
        });
        
        // Score du croupier (visible seulement après le tour du joueur)
        if (this.gamePhase !== 'playing' && this.dealerHand.length > 0) {
            const score = this.calculateHand(this.dealerHand);
            Utils.canvas.drawGlowText(ctx, score.toString(), this.width / 2, y + 145, {
                font: 'bold 24px Orbitron',
                color: score > 21 ? '#ef5350' : this.colors.textGold,
                glowColor: this.colors.textGold,
                glowSize: 10
            });
        }
    }

    /**
     * Dessiner la zone du joueur
     */
    drawPlayerArea(ctx) {
        const y = this.height - 220;
        
        // Label
        ctx.font = '16px Orbitron';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('VOS CARTES', this.width / 2, y);
        
        // Cartes du joueur
        const startX = this.width / 2 - (this.playerHand.length * 45) / 2;
        
        this.playerHand.forEach((card, i) => {
            const x = startX + i * 50;
            this.drawCard(ctx, x, y + 20, card, false);
        });
        
        // Score du joueur
        if (this.playerHand.length > 0) {
            const score = this.calculateHand(this.playerHand);
            Utils.canvas.drawGlowText(ctx, score.toString(), this.width / 2, y + 145, {
                font: 'bold 28px Orbitron',
                color: score > 21 ? '#ef5350' : this.colors.textGold,
                glowColor: this.colors.textGold,
                glowSize: 12
            });
        }
    }

    /**
     * Dessiner une carte
     */
    drawCard(ctx, x, y, card, faceDown = false) {
        const width = 70;
        const height = 100;
        const radius = 8;
        
        if (faceDown) {
            // Dos de la carte
            ctx.fillStyle = this.colors.cardBack;
            Utils.canvas.roundRect(ctx, x, y, width, height, radius, this.colors.cardBack);
            
            // Pattern sur le dos
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 7; j++) {
                    ctx.strokeRect(x + 8 + i * 12, y + 8 + j * 13, 10, 11);
                }
            }
        } else {
            // Face de la carte
            ctx.fillStyle = this.colors.cardWhite;
            Utils.canvas.roundRect(ctx, x, y, width, height, radius, this.colors.cardWhite);
            
            // Symbole et valeur
            const suit = this.suits[card.suit];
            ctx.fillStyle = suit.color;
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(card.value, x + 6, y + 22);
            ctx.fillText(suit.symbol, x + 6, y + 42);
            
            // Grand symbole au centre
            ctx.font = '36px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(suit.symbol, x + width / 2, y + height / 2 + 12);
            
            // Valeur en bas (inversée)
            ctx.save();
            ctx.translate(x + width - 6, y + height - 8);
            ctx.rotate(Math.PI);
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(card.value, 0, 14);
            ctx.fillText(suit.symbol, 0, 34);
            ctx.restore();
        }
    }

    /**
     * Dessiner le panneau d'informations
     */
    drawInfoPanel(ctx) {
        const panelY = this.height - 80;
        
        // Jetons
        ctx.font = 'bold 18px Orbitron';
        ctx.fillStyle = this.colors.textGold;
        ctx.textAlign = 'left';
        ctx.fillText(`💰 ${Utils.formatScore(this.playerChips)}`, 40, panelY);
        
        // Mise actuelle
        ctx.textAlign = 'right';
        ctx.fillText(`Mise: ${this.currentBet}`, this.width - 40, panelY);
    }

    /**
     * Dessiner les boutons d'action
     */
    drawActionButtons(ctx) {
        const buttonY = this.height - 55;
        const buttons = [];
        
        if (this.gamePhase === 'betting') {
            buttons.push(
                { label: `${this.config.chipValue}€`, action: () => this.placeBet(this.config.chipValue), x: this.width / 2 - 120 },
                { label: `${this.config.chipValue * 5}€`, action: () => this.placeBet(this.config.chipValue * 5), x: this.width / 2 },
                { label: `${this.config.chipValue * 25}€`, action: () => this.placeBet(this.config.chipValue * 25), x: this.width / 2 + 120 }
            );
        } else if (this.gamePhase === 'playing') {
            if (this.canHit) {
                buttons.push({ label: 'HIT', action: () => this.hit(), x: this.width / 2 - 100 });
            }
            if (this.canStand) {
                buttons.push({ label: 'STAND', action: () => this.stand(), x: this.width / 2 });
            }
            if (this.canDouble) {
                buttons.push({ label: 'DOUBLE', action: () => this.doubleDown(), x: this.width / 2 + 110 });
            }
        }
        
        this.buttons = buttons;
        
        buttons.forEach(btn => {
            const width = btn.label.length > 6 ? 90 : 75;
            const height = 36;
            const x = btn.x - width / 2;
            const y = buttonY - height / 2;
            
            // Fond du bouton
            const isActive = (
                (btn.label === 'HIT' && this.canHit) ||
                (btn.label === 'STAND' && this.canStand) ||
                (btn.label === 'DOUBLE' && this.canDouble) ||
                this.gamePhase === 'betting'
            );
            
            ctx.fillStyle = isActive ? 'rgba(33, 150, 243, 0.9)' : 'rgba(100, 100, 100, 0.5)';
            Utils.canvas.roundRect(ctx, x, y, width, height, 18, ctx.fillStyle);
            
            // Texte
            ctx.font = 'bold 14px Orbitron';
            ctx.fillStyle = isActive ? '#fff' : 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'center';
            ctx.fillText(btn.label, btn.x, buttonY + 5);
        });
    }

    /**
     * Dessiner le message de résultat
     */
    drawResultMessage(ctx) {
        // Fond semi-transparent
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        Utils.canvas.roundRect(ctx, this.width / 2 - 180, this.height / 2 - 50, 360, 100, 15, ctx.fillStyle);
        
        // Message
        ctx.font = 'bold 24px Orbitron';
        ctx.textAlign = 'center';
        
        if (this.resultMessage.includes('+')) {
            ctx.fillStyle = '#81c784';
        } else if (this.resultMessage.includes('-')) {
            ctx.fillStyle = '#ef5350';
        } else {
            ctx.fillStyle = this.colors.textGold;
        }
        
        ctx.fillText(this.resultMessage, this.width / 2, this.height / 2 + 8);
        
        // Bouton Nouvelle Partie
        const btnX = this.width / 2 - 70;
        const btnY = this.height / 2 + 60;
        ctx.fillStyle = 'rgba(76, 175, 80, 0.9)';
        Utils.canvas.roundRect(ctx, btnX, btnY, 140, 40, 20, ctx.fillStyle);
        
        ctx.font = 'bold 16px Orbitron';
        ctx.fillStyle = '#fff';
        ctx.fillText('NOUVELLE PARTIE', this.width / 2, btnY + 26);
    }

    /**
     * Gérer les clics souris
     */
    handleMouseDown(pos) {
        // Vérifier les clics sur les boutons
        for (const btn of this.buttons) {
            const width = btn.label.length > 6 ? 90 : 75;
            const height = 36;
            const x = btn.x - width / 2;
            const y = this.height - 55 - height / 2;
            
            if (pos.x >= x && pos.x <= x + width && pos.y >= y && pos.y <= y + height) {
                btn.action();
                Utils.audio.playClick();
                return;
            }
        }
        
        // Bouton nouvelle partie
        if (this.gamePhase === 'result') {
            const btnX = this.width / 2 - 70;
            const btnY = this.height / 2 + 60;
            
            if (pos.x >= btnX && pos.x <= btnX + 140 && pos.y >= btnY && pos.y <= btnY + 40) {
                this.newGame();
                Utils.audio.playClick();
            }
        }
    }

    /**
     * Gérer les touches pressées
     */
    handleKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case 'h':
                this.hit();
                break;
            case 's':
                this.stand();
                break;
            case 'd':
                this.doubleDown();
                break;
            case 'r':
            case 'enter':
                if (this.gamePhase === 'result') {
                    this.newGame();
                }
                break;
        }
    }

    /**
     * Obtenir les instructions
     */
    getInstructions() {
        return `
            <strong>🃏 Blackjack</strong> - Faites 21 ou approchez-vous-en!<br>
            <span style="color: var(--neon-blue)">H</span> Hit | 
            <span style="color: var(--neon-green)">S</span> Stand | 
            <span style="color: var(--neon-pink)">D</span> Double | 
            <span style="color: var(--neon-yellow)">🖱️ Cliquez</span> pour miser!
        `;
    }
}

// Enregistrer le jeu
window.Games.blackjack = BlackjackGame;
