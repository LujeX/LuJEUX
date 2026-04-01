const AudioEngine = {
    ctx: null, muted: false,
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if(this.ctx.state === 'suspended') this.ctx.resume();
    },
    toggleMute() {
        this.muted = !this.muted;
        document.getElementById('btn-mute').innerText = this.muted ? "🔇" : "🔊";
    },
    playTone(freq, type, duration, vol=0.1) {
        if (this.muted || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + duration);
    },
    sfxHover() { this.playTone(400, 'sine', 0.1, 0.05); },
    sfxClick() { this.playTone(800, 'square', 0.1, 0.1); },
    sfxDeal()  { this.playTone(300, 'triangle', 0.1, 0.1); },
    sfxWin()   { 
        if(this.muted) return;
        setTimeout(()=>this.playTone(440, 'square', 0.1, 0.1), 0);
        setTimeout(()=>this.playTone(554, 'square', 0.1, 0.1), 100);
        setTimeout(()=>this.playTone(659, 'square', 0.3, 0.1), 200);
    },
    sfxLose()  {
        if(this.muted) return;
        setTimeout(()=>this.playTone(300, 'sawtooth', 0.2, 0.1), 0);
        setTimeout(()=>this.playTone(250, 'sawtooth', 0.4, 0.1), 150);
    }
};

const App = {
    credits: parseInt(localStorage.getItem('neonCredits')) || 1000,
    init() {
        this.updateCreditsDisplay();
        document.querySelectorAll('.game-card, .btn-back').forEach(el => {
            el.addEventListener('mouseenter', () => AudioEngine.sfxHover());
            el.addEventListener('click', (e) => {
                AudioEngine.sfxClick();
                this.navigate(e.currentTarget.dataset.target);
            });
        });
        document.getElementById('btn-mute').addEventListener('click', () => AudioEngine.toggleMute());
        this.runBootSequence();
    },
    updateCredits(amount) {
        this.credits += amount;
        localStorage.setItem('neonCredits', this.credits);
        this.updateCreditsDisplay();
    },
    updateCreditsDisplay() { document.getElementById('user-credits').innerText = Math.floor(this.credits); },
    navigate(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        setTimeout(() => {
            document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
            const target = document.getElementById(screenId);
            target.classList.remove('hidden');
            void target.offsetWidth;
            target.classList.add('active');
            if(screenId !== 'screen-boot') document.getElementById('global-hud').classList.remove('hidden');
            if(screenId === 'screen-blackjack') Blackjack.init();
            if(screenId === 'screen-runner') Runner.init();
        }, 500);
    },
    runBootSequence() {
        const text = "> CONNEXION AU SERVEUR NEON...\n> ANALYSE DES PROTOCOLES...\n> DÉCRYPTAGE MATRICE...\n> ACCÈS AUTORISÉ.\n> BIENVENUE, UTILISATEUR.";
        const bootEl = document.getElementById('boot-text');
        let i = 0;
        const typeWriter = setInterval(() => {
            bootEl.textContent += text.charAt(i);
            if(text.charAt(i) !== ' ') AudioEngine.playTone(800 + Math.random()*200, 'square', 0.05, 0.02);
            i++;
            if (i >= text.length) {
                clearInterval(typeWriter);
                document.getElementById('btn-enter').classList.remove('hidden');
            }
        }, 50);
        document.getElementById('btn-enter').addEventListener('click', () => {
            AudioEngine.init(); 
            AudioEngine.sfxClick();
            this.navigate('screen-menu');
        });
    }
};

const Blackjack = {
    deck: [], playerHand: [], dealerHand: [], bet: 100, playing: false,
    init() {
        this.resetTable();
        document.getElementById('bj-message').innerText = "PLACEZ VOTRE MISE";
        this.updateBetDisplay();
    },
    buildDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
        this.deck = [];
        for(let s of suits) {
            for(let v of values) { this.deck.push({suit: s, value: v, color: (s==='♥'||s==='♦') ? 'red' : 'black'}); }
        }
        for(let i = this.deck.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    },
    adjustBet(amount) {
        AudioEngine.sfxHover();
        if(this.bet + amount > 0 && this.bet + amount <= App.credits) {
            this.bet += amount; this.updateBetDisplay();
        }
    },
    updateBetDisplay() { document.getElementById('bj-current-bet').innerText = this.bet; },
    getScore(hand) {
        let score = 0, aces = 0;
        for(let c of hand) {
            if(['J','Q','K'].includes(c.value)) score += 10;
            else if(c.value === 'A') { score += 11; aces += 1; }
            else score += parseInt(c.value);
        }
        while(score > 21 && aces > 0) { score -= 10; aces -= 1; }
        return score;
    },
    createCardHTML(card, isHidden = false) {
        return `
            <div class="card-3d-wrapper ${isHidden ? '' : 'revealed'}">
                <div class="card-face card-front ${card.color}">
                    <div class="card-value">${card.value}</div>
                    <div class="card-suit">${card.suit}</div>
                    <div class="card-value bottom">${card.value}</div>
                </div>
                <div class="card-face card-back"></div>
            </div>`;
    },
    async deal() {
        if(App.credits < this.bet) { document.getElementById('bj-message').innerText = "FONDS INSUFFISANTS"; return; }
        App.updateCredits(-this.bet); 
        AudioEngine.sfxClick();
        document.getElementById('bj-bet-controls').classList.add('hidden');
        document.getElementById('bj-message').innerText = "DISTRIBUTION...";
        this.resetTable(); this.buildDeck(); this.playing = true;
        await this.addCardToHand(this.playerHand, 'bj-player-cards', false);
        await this.addCardToHand(this.dealerHand, 'bj-dealer-cards', false);
        await this.addCardToHand(this.playerHand, 'bj-player-cards', false);
        await this.addCardToHand(this.dealerHand, 'bj-dealer-cards', true); 
        this.updateScores(false);
        if(this.getScore(this.playerHand) === 21) {
            this.endGame("BLACKJACK ! PAIEMENT 3:2", this.bet * 2.5);
        } else {
            document.getElementById('bj-play-controls').classList.remove('hidden');
            document.getElementById('bj-message').innerText = "A VOUS DE JOUER";
        }
    },
    async addCardToHand(hand, elementId, isHidden) {
        return new Promise(resolve => {
            setTimeout(() => {
                const card = this.deck.pop(); hand.push(card);
                document.getElementById(elementId).insertAdjacentHTML('beforeend', this.createCardHTML(card, isHidden));
                AudioEngine.sfxDeal(); resolve();
            }, 500);
        });
    },
    updateScores(revealDealer) {
        document.getElementById('bj-player-score').innerText = this.getScore(this.playerHand);
        if(revealDealer) document.getElementById('bj-dealer-score').innerText = this.getScore(this.dealerHand);
    },
    async hit() {
        if(!this.playing) return;
        document.getElementById('bj-play-controls').classList.add('hidden');
        await this.addCardToHand(this.playerHand, 'bj-player-cards', false);
        this.updateScores(false);
        if(this.getScore(this.playerHand) > 21) this.endGame("SURCHARGE ! VOUS PERDEZ.", 0);
        else if (this.getScore(this.playerHand) === 21) this.stand();
        else document.getElementById('bj-play-controls').classList.remove('hidden');
    },
    async stand() {
        if(!this.playing) return;
        this.playing = false;
        document.getElementById('bj-play-controls').classList.add('hidden');
        document.getElementById('bj-dealer-cards').children[1].classList.add('revealed');
        this.updateScores(true);
        document.getElementById('bj-message').innerText = "TOUR DU CROUPIER...";
        while(this.getScore(this.dealerHand) < 17) {
            await this.addCardToHand(this.dealerHand, 'bj-dealer-cards', false);
            this.updateScores(true);
        }
        this.checkWinner();
    },
    checkWinner() {
        const pScore = this.getScore(this.playerHand), dScore = this.getScore(this.dealerHand);
        if(dScore > 21) this.endGame("CROUPIER CRASH ! VOUS GAGNEZ.", this.bet * 2);
        else if(pScore > dScore) this.endGame("VICTOIRE !", this.bet * 2);
        else if(pScore < dScore) this.endGame("DÉFAITE...", 0);
        else this.endGame("ÉGALITÉ. MISE REMBOURSÉE.", this.bet);
    },
    endGame(msg, payout) {
        this.playing = false;
        document.getElementById('bj-play-controls').classList.add('hidden');
        document.getElementById('bj-message').innerText = msg;
        if(payout > 0) { App.updateCredits(payout); AudioEngine.sfxWin(); }
        else if (payout === 0) { AudioEngine.sfxLose(); }
        setTimeout(() => {
            document.getElementById('bj-bet-controls').classList.remove('hidden');
            if(this.bet > App.credits) this.bet = App.credits;
            this.updateBetDisplay();
        }, 2000);
    },
    resetTable() {
        this.playerHand = []; this.dealerHand = [];
        document.getElementById('bj-player-cards').innerHTML = '';
        document.getElementById('bj-dealer-cards').innerHTML = '';
        document.getElementById('bj-player-score').innerText = '0';
        document.getElementById('bj-dealer-score').innerText = '?';
    }
};

const Runner = {
    canvas: null, ctx: null, animFrame: null, isPlaying: false,
    width: window.innerWidth, height: window.innerHeight,
    player: { targetX: 0, x: 0, y: 0, size: 30 },
    lanes: [-200, 0, 200], currentLane: 1,
    speed: 10, baseSpeed: 10, distance: 0, multiplier: 1.0,
    obstacles: [], particles: [], renderExplosionOnly: false,
    init() {
        this.canvas = document.getElementById('runner-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize(); window.addEventListener('resize', () => this.resize());
        this.ctx.fillStyle = '#07070a'; this.ctx.fillRect(0, 0, this.width, this.height);
        
        window.addEventListener('keydown', (e) => {
            if(!this.isPlaying) return;
            if(e.key === 'ArrowLeft' && this.currentLane > 0) this.currentLane--;
            if(e.key === 'ArrowRight' && this.currentLane < 2) this.currentLane++;
            this.player.targetX = this.lanes[this.currentLane];
        });
        this.canvas.addEventListener('mousedown', (e) => this.touchControl(e.clientX));
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.touchControl(e.touches[0].clientX); }, {passive: false});
    },
    touchControl(clientX) {
        if(!this.isPlaying) return;
        if(clientX < this.width/2 && this.currentLane > 0) this.currentLane--;
        else if(clientX > this.width/2 && this.currentLane < 2) this.currentLane++;
        this.player.targetX = this.lanes[this.currentLane];
    },
    resize() {
        if(!this.canvas) return;
        this.width = window.innerWidth; this.height = window.innerHeight;
        this.canvas.width = this.width; this.canvas.height = this.height;
        this.player.y = this.height - 150;
    },
    start() {
        document.getElementById('rn-overlay').classList.add('hidden');
        this.isPlaying = true; this.distance = 0; this.speed = this.baseSpeed;
        this.obstacles = []; this.particles = []; this.renderExplosionOnly = false;
        this.currentLane = 1; this.player.targetX = this.lanes[1]; this.player.x = this.lanes[1];
        AudioEngine.sfxClick(); this.loop();
    },
    exit() { this.isPlaying = false; cancelAnimationFrame(this.animFrame); },
    gameOver() {
        this.isPlaying = false; AudioEngine.sfxLose();
        this.createExplosion(this.width/2 + this.player.x, this.player.y);
        const gain = Math.floor(this.distance / 100);
        if(gain > 0) App.updateCredits(gain);
        document.getElementById('rn-modal-title').innerText = "CRASH MATRICIEL";
        document.getElementById('rn-modal-desc').innerHTML = `Distance: ${Math.floor(this.distance)}m<br>Gains transférés: <span class="neon-text-green">+${gain} ¤</span>`;
        document.getElementById('rn-overlay').classList.remove('hidden');
        this.renderExplosionOnly = true;
    },
    createExplosion(x, y) {
        for(let i=0; i<30; i++) this.particles.push({x: x, y: y, vx: (Math.random()-0.5)*20, vy: (Math.random()-0.5)*20, life: 1.0, color: Math.random()>0.5 ? '#00f3ff' : '#ff007f'});
    },
    loop() {
        if(!this.isPlaying && !this.renderExplosionOnly) return;
        this.update(); this.draw();
        this.animFrame = requestAnimationFrame(() => this.loop());
        if(!this.isPlaying && this.particles.length === 0) this.renderExplosionOnly = false;
    },
    update() {
        if(this.isPlaying) {
            this.distance += this.speed / 10; this.speed += 0.005;
            this.multiplier = (this.speed / this.baseSpeed).toFixed(1);
            document.getElementById('rn-score').innerText = Math.floor(this.distance);
            document.getElementById('rn-mult').innerText = this.multiplier;
            this.player.x += (this.player.targetX - this.player.x) * 0.2;
            if(Math.random() < 0.03 + (this.speed * 0.001)) {
                let laneId = Math.floor(Math.random() * 3);
                if(this.obstacles.filter(o => o.y < 150).length < 2) this.obstacles.push({ x: this.lanes[laneId], y: -100, width: 80, height: 20 });
            }
        }
        for(let i = this.obstacles.length - 1; i >= 0; i--) {
            let obs = this.obstacles[i];
            if(this.isPlaying) obs.y += this.speed;
            if(this.isPlaying && obs.y + obs.height > this.player.y - this.player.size && obs.y < this.player.y + this.player.size) {
                if(Math.abs(this.player.x - obs.x) < 40) this.gameOver();
            }
            if(obs.y > this.height) this.obstacles.splice(i, 1);
        }
        for(let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.03;
            if(p.life <= 0) this.particles.splice(i, 1);
        }
    },
    draw() {
        const cx = this.width / 2;
        this.ctx.fillStyle = 'rgba(7, 7, 10, 0.4)'; this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)'; this.ctx.lineWidth = 2; this.ctx.beginPath();
        this.ctx.moveTo(cx - 100, 0); this.ctx.lineTo(cx - 100, this.height);
        this.ctx.moveTo(cx + 100, 0); this.ctx.lineTo(cx + 100, this.height); this.ctx.stroke();
        this.ctx.fillStyle = '#ff003c'; this.ctx.shadowColor = '#ff003c'; this.ctx.shadowBlur = 15;
        for(let obs of this.obstacles) this.ctx.fillRect(cx + obs.x - obs.width/2, obs.y, obs.width, obs.height);
        if(this.isPlaying) {
            this.ctx.fillStyle = '#00f3ff'; this.ctx.shadowColor = '#00f3ff'; this.ctx.beginPath();
            this.ctx.moveTo(cx + this.player.x, this.player.y - this.player.size);
            this.ctx.lineTo(cx + this.player.x + this.player.size, this.player.y + this.player.size);
            this.ctx.lineTo(cx + this.player.x - this.player.size, this.player.y + this.player.size); this.ctx.fill();
        }
        this.ctx.shadowBlur = 10;
        for(let p of this.particles) {
            this.ctx.fillStyle = p.color; this.ctx.shadowColor = p.color; this.ctx.globalAlpha = Math.max(0, p.life);
            this.ctx.beginPath(); this.ctx.arc(p.x, p.y, 4, 0, Math.PI*2); this.ctx.fill();
        }
        this.ctx.globalAlpha = 1.0; this.ctx.shadowBlur = 0;
    }
};

document.addEventListener('DOMContentLoaded', () => { App.init(); });
