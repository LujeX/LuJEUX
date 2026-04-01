/* ==========================================================
   ONYX ARCADE — Code JavaScript
   ========================================================== */

// Polyfill roundRect pour anciens navigateurs Safari/Mobile
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        r = Math.min(Math.max(0, r), w / 2, h / 2);
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.arcTo(x + w, y, x + w, y + r, r);
        this.lineTo(x + w, y + h - r);
        this.arcTo(x + w, y + h, x + w - r, y + h, r);
        this.lineTo(x + r, y + h);
        this.arcTo(x, y + h, x, y + h - r, r);
        this.lineTo(x, y + r);
        this.arcTo(x, y, x + r, y, r);
        this.closePath();
    };
}

// ===== Utilitaires DOM =====
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const delay = ms => new Promise(r => setTimeout(r, ms));

// ===== Toast (Notifications) =====
function showToast(msg, dur = 2400) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('show'), dur);
}

// ===== Audio (Web Audio API) =====
let audioCtx;
function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}
function playSound(type) {
    try {
        ensureAudio();
        const t = audioCtx.currentTime;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        switch (type) {
            case 'click':
                o.type='sine'; o.frequency.setValueAtTime(500,t); o.frequency.exponentialRampToValueAtTime(250,t+.05);
                g.gain.setValueAtTime(.06,t); g.gain.exponentialRampToValueAtTime(.001,t+.05);
                o.start(t); o.stop(t+.05); break;
            case 'card':
                o.type='triangle'; o.frequency.setValueAtTime(1000,t); o.frequency.exponentialRampToValueAtTime(500,t+.07);
                g.gain.setValueAtTime(.06,t); g.gain.exponentialRampToValueAtTime(.001,t+.07);
                o.start(t); o.stop(t+.07); break;
            case 'chip':
                o.type='sine'; o.frequency.setValueAtTime(1600,t);
                g.gain.setValueAtTime(.04,t); g.gain.exponentialRampToValueAtTime(.001,t+.04);
                o.start(t); o.stop(t+.04); break;
            case 'win':
                o.type='sine'; o.frequency.setValueAtTime(523,t); o.frequency.setValueAtTime(659,t+.08);
                o.frequency.setValueAtTime(784,t+.16); o.frequency.setValueAtTime(1047,t+.24);
                g.gain.setValueAtTime(.08,t); g.gain.exponentialRampToValueAtTime(.001,t+.4);
                o.start(t); o.stop(t+.4); break;
            case 'lose':
                o.type='sawtooth'; o.frequency.setValueAtTime(250,t); o.frequency.exponentialRampToValueAtTime(80,t+.35);
                g.gain.setValueAtTime(.06,t); g.gain.exponentialRampToValueAtTime(.001,t+.35);
                o.start(t); o.stop(t+.35); break;
            case 'gameover':
                o.type='square'; o.frequency.setValueAtTime(180,t); o.frequency.exponentialRampToValueAtTime(40,t+.5);
                g.gain.setValueAtTime(.08,t); g.gain.exponentialRampToValueAtTime(.001,t+.5);
                o.start(t); o.stop(t+.5); break;
            case 'dodge':
                o.type='sine'; o.frequency.setValueAtTime(800,t); o.frequency.exponentialRampToValueAtTime(1200,t+.04);
                g.gain.setValueAtTime(.03,t); g.gain.exponentialRampToValueAtTime(.001,t+.06);
                o.start(t); o.stop(t+.06); break;
        }
    } catch(e) {}
}

// ===== Scores (localStorage) =====
const Scores = {
    _g(k) { try { return parseInt(localStorage.getItem('onyx_'+k))||0; } catch{ return 0; } },
    _s(k,v) { try { localStorage.setItem('onyx_'+k,v); } catch{} },
    get bjBest() { return this._g('bj'); },
    set bjBest(v) { if(v>this.bjBest) this._s('bj',v); },
    get runBest() { return this._g('run'); },
    set runBest(v) { if(v>this.runBest) this._s('run',v); }
};

// ===== Routeur SPA =====
const Router = {
    cur: 'landing',
    go(page) {
        if (page === this.cur) return;
        if (this.cur === 'runner') Runner.stop();
        const old = $(`#page-${this.cur}`);
        const nxt = $(`#page-${page}`);
        if (!nxt) return;
        
        old.classList.remove('active');
        setTimeout(() => {
            nxt.classList.add('active');
            this.cur = page;
            $('#main-nav').classList.toggle('visible', page !== 'landing');
            if (page === 'blackjack') BJ.init();
            if (page === 'runner') Runner.init();
            if (page === 'menu') {
                $('#menu-bj-score').textContent = Scores.bjBest;
                $('#menu-runner-score').textContent = Scores.runBest;
            }
        }, 320);
    }
};

// ===== Parallax Accueil =====
let mx = 0, my = 0, parallaxId = 0;
document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - .5) * 2;
    my = (e.clientY / window.innerHeight - .5) * 2;
});
function parallaxLoop() {
    parallaxId = requestAnimationFrame(parallaxLoop);
    if (Router.cur !== 'landing') return;
    $$('.float-shape').forEach((s, i) => {
        const d = (i % 3 + 1) * 10;
        s.style.translate = `${mx*d}px ${my*d}px`;
    });
}
parallaxLoop();

// ===== Effet 3D Cartes Menu =====
function initTilt() {
    $$('.game-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - .5;
            const y = (e.clientY - r.top) / r.height - .5;
            card.style.transform = `perspective(700px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-6px) scale(1.01)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
}

// ===================================================================
//  JEU 1 : BLACKJACK
// ===================================================================
const BJ = {
    deck:[], pH:[], dH:[], chips:1000, bet:0, selChip:10, phase:'betting', _init:false,

    init() {
        if (!this._init) {
            this._init = true;
            $$('.chip').forEach(c => {
                c.addEventListener('click', () => this.pickChip(c));
                c.addEventListener('keydown', e => { if(e.key==='Enter') this.pickChip(c); });
            });
            $('#bj-deal').addEventListener('click', () => this.deal());
            $('#bj-clear').addEventListener('click', () => this.clearBet());
            $('#bj-hit').addEventListener('click', () => this.hit());
            $('#bj-stand').addEventListener('click', () => this.stand());
            $('#bj-double').addEventListener('click', () => this.double());
        }
        this.updUI();
    },
    pickChip(el) {
        if (this.phase !== 'betting') return;
        playSound('chip');
        $$('.chip').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        this.selChip = parseInt(el.dataset.value);
        this.addBet(this.selChip);
    },
    addBet(v) {
        if (this.phase !== 'betting' || this.chips < v) { if(this.chips<v) showToast('Jetons insuffisants'); return; }
        this.chips -= v; this.bet += v; playSound('chip'); this.updUI();
    },
    clearBet() {
        if (this.phase !== 'betting') return;
        this.chips += this.bet; this.bet = 0; playSound('click'); this.updUI();
    },
    mkDeck() {
        const suits=['♠','♥','♦','♣'], vals=['A','2','3','4','5','6','7','8','9','10','J','Q','K'], d=[];
        for(let n=0;n<6;n++) for(let s of suits) for(let v of vals) d.push({s,v});
        for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}
        return d;
    },
    cVal(c) { if(c.v==='A') return 11; if('KQJ'.includes(c.v)) return 10; return parseInt(c.v); },
    hVal(h) { let t=0,a=0; for(let c of h){t+=this.cVal(c);if(c.v==='A')a++;} while(t>21&&a>0){t-=10;a--;} return t; },
    isBJ(h) { return h.length===2 && this.hVal(h)===21; },
    mkCardEl(c, fd=false) {
        const d=document.createElement('div');
        const red = c.s==='♥'||c.s==='♦';
        d.className='bj-card '+(red?'card-red':'card-black')+(fd?' face-down':'');
        d.innerHTML=`<div class="card-face"><div class="card-corner tl"><span class="cv">${c.v}</span><span class="cs">${c.s}</span></div><div class="card-center-suit">${c.s}</div><div class="card-corner br"><span class="cv">${c.v}</span><span class="cs">${c.s}</span></div></div><div class="card-back-face"></div>`;
        return d;
    },
    async deal() {
        if(this.phase!=='betting'||this.bet===0) return;
        this.phase='playing';
        if(this.deck.length<60) this.deck=this.mkDeck();
        this.pH=[]; this.dH=[];
        $('#player-hand').innerHTML=''; $('#dealer-hand').innerHTML='';
        $('#bj-result').className='bj-result-banner'; $('#bj-result').textContent='';
        this.showAct('play');

        const c=[this.deck.pop(),this.deck.pop(),this.deck.pop(),this.deck.pop()];
        this.pH.push(c[0]); $('#player-hand').appendChild(this.mkCardEl(c[0])); playSound('card'); await delay(220);
        this.dH.push(c[1]); $('#dealer-hand').appendChild(this.mkCardEl(c[1])); playSound('card'); await delay(220);
        this.pH.push(c[2]); $('#player-hand').appendChild(this.mkCardEl(c[2])); playSound('card'); await delay(220);
        this.dH.push(c[3]); $('#dealer-hand').appendChild(this.mkCardEl(c[3],true)); playSound('card'); await delay(280);
        this.updScores();

        if(this.isBJ(this.pH)){ await this.reveal(); this.end(this.isBJ(this.dH)?'push':'blackjack'); return; }
        if(this.isBJ(this.dH)){ await this.reveal(); this.end('lose'); return; }
        $('#bj-double').disabled = this.chips < this.bet;
    },
    async hit() {
        if(this.phase!=='playing') return;
        const c=this.deck.pop(); this.pH.push(c);
        $('#player-hand').appendChild(this.mkCardEl(c)); playSound('card');
        this.updScores(); $('#bj-double').disabled=true;
        if(this.hVal(this.pH)>21){ await delay(350); await this.reveal(); this.end('lose'); }
        else if(this.hVal(this.pH)===21) await this.stand();
    },
    async stand() {
        if(this.phase!=='playing') return;
        this.phase='dealer'; this.showAct('none');
        await this.reveal(); await delay(350);
        while(this.hVal(this.dH)<17){
            const c=this.deck.pop(); this.dH.push(c);
            $('#dealer-hand').appendChild(this.mkCardEl(c)); playSound('card');
            this.updScores(); await delay(420);
        }
        await delay(250);
        const pv=this.hVal(this.pH), dv=this.hVal(this.dH);
        if(dv>21) this.end('win');
        else if(pv>dv) this.end('win');
        else if(pv<dv) this.end('lose');
        else this.end('push');
    },
    async double() {
        if(this.phase!=='playing'||this.chips<this.bet) return;
        this.chips-=this.bet; this.bet*=2; this.updUI();
        await this.hit();
        if(this.phase==='playing') await this.stand();
    },
    async reveal() {
        const fd=$('#dealer-hand .bj-card.face-down');
        if(fd){ fd.classList.remove('face-down'); playSound('card'); await delay(350); }
        this.updScores();
    },
    end(r) {
        this.phase='result';
        const b=$('#bj-result'); let w=0;
        if(r==='blackjack'){ w=Math.floor(this.bet*2.5); b.textContent=`BLACKJACK ! +${w}`; b.className='bj-result-banner blackjack show'; playSound('win'); }
        else if(r==='win'){ w=this.bet*2; b.textContent=`VICTOIRE ! +${w}`; b.className='bj-result-banner win show'; playSound('win'); }
        else if(r==='push'){ w=this.bet; b.textContent='ÉGALITÉ — Mise rendue'; b.className='bj-result-banner push show'; playSound('click'); }
        else { w=0; b.textContent=`DÉFAITE — -${this.bet}`; b.className='bj-result-banner lose show'; playSound('lose'); }
        
        this.chips+=w;
        if(r==='win'||r==='blackjack') Scores.bjBest=Math.max(Scores.bjBest,this.chips);
        this.bet=0; this.updUI();
        
        setTimeout(()=>{
            this.phase='betting'; this.showAct('bet');
            this.pH=[]; this.dH=[];
            $('#player-hand').innerHTML=''; $('#dealer-hand').innerHTML='';
            $('#bj-result').className='bj-result-banner';
            $('#player-score').textContent=''; $('#dealer-score').textContent='';
            if(this.chips<=0){ this.chips=1000; showToast('Jetons rechargés à 1000'); this.updUI(); }
        },2000);
    },
    showAct(m) {
        $('#bj-actions-bet').style.display=m==='bet'?'flex':'none';
        $('#bj-actions-play').style.display=m==='play'?'flex':'none';
    },
    updScores() {
        const pv=this.hVal(this.pH), dv=this.hVal(this.dH);
        $('#player-score').textContent=pv>0?pv:'';
        $('#dealer-score').textContent=this.phase==='playing'?(this.cVal(this.dH[0])+' + ?'):(dv>0?dv:'');
    },
    updUI() { 
        $('#bj-chips').textContent=this.chips; 
        $('#bj-bet').textContent=this.bet; 
        $('#bj-deal').disabled=this.bet===0; 
    }
};

// ===================================================================
//  JEU 2 : DODGE RUSH (5 couloirs)
// ===================================================================
const Runner = {
    canvas:null, ctx:null, running:false, animId:null, _init:false,
    s: null, W:0, H:0, LANE_W:0, ROAD_X:0, ROAD_W:0, P_SIZE:0, WAVE_BASE:65,

    init() {
        if(!this._init){
            this._init=true;
            this.canvas=$('#runner-canvas');
            this.ctx=this.canvas.getContext('2d');
            
            document.addEventListener('keydown', e => {
                if(Router.cur!=='runner'||!this.s||!this.s.started||this.s.over) return;
                if(e.key==='ArrowLeft'||e.key==='a'||e.key==='q'){ this.move(-1); e.preventDefault(); }
                if(e.key==='ArrowRight'||e.key==='d'){ this.move(1); e.preventDefault(); }
            });
            $$('#runner-touch .touch-left').forEach(el=>el.addEventListener('touchstart',e=>{e.preventDefault();this.move(-1);}));
            $$('#runner-touch .touch-right').forEach(el=>el.addEventListener('touchstart',e=>{e.preventDefault();this.move(1);}));
            $('#runner-start-btn').addEventListener('click',()=>this.start());
        }
        this.resize();
        this.drawIdle();
        
        const ov=$('#runner-overlay');
        ov.classList.remove('hidden');
        $('#runner-overlay-title').textContent='Dodge Rush';
        $('#runner-final-score').style.display='none';
        $('#runner-high-text').style.display='none';
        $('#runner-start-btn').textContent='Jouer';
        $('#runner-hint').style.display='';
        $('#runner-hud-score').textContent='0';
        $('#runner-hud-speed').textContent='x1.0';
    },

    resize() {
        if(!this.canvas) return;
        const r=this.canvas.parentElement.getBoundingClientRect();
        const dpr=Math.min(window.devicePixelRatio||1,2);
        this.W=r.width; this.H=r.height;
        this.canvas.width=this.W*dpr; this.canvas.height=this.H*dpr;
        this.canvas.style.width=this.W+'px'; this.canvas.style.height=this.H+'px';
        this.ctx.setTransform(dpr,0,0,dpr,0,0);
        this.ROAD_W=Math.min(this.W*.72,320);
        this.ROAD_X=(this.W-this.ROAD_W)/2;
        this.LANE_W=this.ROAD_W/5;
        this.P_SIZE=this.LANE_W*.38;
    },

    laneX(l) { return this.ROAD_X+this.LANE_W*l+this.LANE_W/2; },

    move(dir) {
        if(!this.s) return;
        const nl=Math.max(0,Math.min(4,this.s.pl+dir));
        if(nl!==this.s.pl){ this.s.pl=nl; playSound('dodge'); }
    },

    start() {
        this.resize();
        this.s = {
            pl:2, vx:this.laneX(2), py:this.H - this.P_SIZE*3.5,
            obs:[], speed:3.2, score:0, frame:0, over:false, started:true,
            particles:[], waveTimer:0
        };
        $('#runner-overlay').classList.add('hidden');
        $('#runner-hud-score').textContent='0';
        $('#runner-hud-speed').textContent='x1.0';
        this.running=true;
        this.loop();
    },

    stop() { this.running=false; if(this.animId) cancelAnimationFrame(this.animId); },

    loop() {
        if(!this.running) return;
        this.animId=requestAnimationFrame(()=>this.loop());
        this.update(); this.draw();
    },

    update() {
        const s=this.s;
        s.frame++;
        
        // Vitesse progressive
        s.speed = 3.2 + s.frame * 0.0009;
        const sm = s.speed / 3.2;

        // Score
        if(s.frame%5===0){
            s.score+=Math.ceil(sm);
            $('#runner-hud-score').textContent=s.score;
            $('#runner-hud-speed').textContent='x'+sm.toFixed(1);
        }

        // Interpolation joueur
        const tx=this.laneX(s.pl);
        s.vx+=(tx-s.vx)*.2;

        // Spawn vague
        s.waveTimer++;
        const interval=Math.max(28, this.WAVE_BASE - s.frame*0.012);
        if(s.waveTimer>=interval){
            s.waveTimer=0;
            this.spawnWave();
        }

        // Déplacer obstacles
        for(let i=s.obs.length-1;i>=0;i--){
            s.obs[i].y+=s.speed;
            if(s.obs[i].y>this.H+50) s.obs.splice(i,1);
        }

        // Collision
        const ps=this.P_SIZE*.75;
        for(let o of s.obs){
            const ox=this.laneX(o.lane);
            const ow=this.LANE_W*.78, oh=36;
            if(Math.abs(s.vx-ox)<(ps/2+ow/2) && Math.abs(s.py-o.y)<(ps/2+oh/2)){
                this.gameOver(); return;
            }
        }

        // Particules trail
        if(s.frame%2===0){
            s.particles.push({
                x:s.vx+(Math.random()-.5)*6, y:s.py+this.P_SIZE*.35,
                vx:(Math.random()-.5)*.4, vy:Math.random()*1.2+.4,
                life:1, decay:Math.random()*.025+.018,
                size:Math.random()*2.5+.8,
                color:Math.random()>.5?'201,149,60':'184,92,56'
            });
        }
        for(let i=s.particles.length-1;i>=0;i--){
            const p=s.particles[i];
            p.x+=p.vx; p.y+=p.vy; p.life-=p.decay;
            if(p.life<=0) s.particles.splice(i,1);
        }
    },

    spawnWave() {
        // Toujours bloquer 2 ou 3 couloirs sur 5 — garantit un chemin libre
        const numBlocked = (this.s.frame > 3000 && Math.random() < .4) ? 3 : 2;
        const lanes=[0,1,2,3,4];
        for(let i=4;i>0;i--){const j=Math.floor(Math.random()*(i+1));[lanes[i],lanes[j]]=[lanes[j],lanes[i]];}
        const blocked=lanes.slice(0,numBlocked);
        for(const l of blocked) this.s.obs.push({lane:l, y:-40});
    },

    gameOver() {
        const s=this.s;
        s.over=true; s.started=false; this.running=false;
        playSound('gameover');
        
        // Explosion
        for(let i=0;i<35;i++){
            const a=Math.random()*Math.PI*2, sp=Math.random()*3.5+1;
            s.particles.push({
                x:s.vx, y:s.py,
                vx:Math.cos(a)*sp, vy:Math.sin(a)*sp,
                life:1, decay:Math.random()*.015+.008,
                size:Math.random()*3.5+1.5,
                color:Math.random()>.5?'196,78,78':'201,149,60'
            });
        }
        
        let fr=0;
        const exp=()=>{
            if(fr>45) return; fr++;
            for(let i=s.particles.length-1;i>=0;i--){
                const p=s.particles[i]; p.x+=p.vx; p.y+=p.vy; p.vx*=.96; p.vy*=.96; p.life-=p.decay;
                if(p.life<=0) s.particles.splice(i,1);
            }
            this.draw(); requestAnimationFrame(exp);
        };
        exp();

        const isNew=s.score>Scores.runBest;
        if(isNew) Scores.runBest=s.score;
        
        setTimeout(()=>{
            const ov=$('#runner-overlay'); ov.classList.remove('hidden');
            $('#runner-overlay-title').textContent='Game Over';
            $('#runner-final-score').style.display=''; $('#runner-final-score').textContent=s.score;
            $('#runner-high-text').style.display='';
            $('#runner-high-text').textContent=isNew?'Nouveau record !':'Record : '+Scores.runBest;
            $('#runner-high-text').style.color=isNew?'var(--accent)':'var(--muted)';
            $('#runner-start-btn').textContent='Rejouer';
            $('#runner-hint').style.display='none';
        }, 550);
    },

    draw() {
        const ctx=this.ctx, s=this.s, W=this.W, H=this.H;
        
        // Fond
        ctx.fillStyle='#09090e'; ctx.fillRect(0,0,W,H);

        // Zone de route
        const rg=ctx.createLinearGradient(this.ROAD_X,0,this.ROAD_X+this.ROAD_W,0);
        rg.addColorStop(0,'rgba(201,149,60,0.015)');
        rg.addColorStop(.5,'rgba(0,0,0,0)');
        rg.addColorStop(1,'rgba(184,92,56,0.015)');
        ctx.fillStyle=rg; ctx.fillRect(this.ROAD_X,0,this.ROAD_W,H);

        // Bordures route
        ctx.strokeStyle='rgba(201,149,60,0.18)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(this.ROAD_X,0); ctx.lineTo(this.ROAD_X,H); ctx.stroke();
        ctx.strokeStyle='rgba(184,92,56,0.18)';
        ctx.beginPath(); ctx.moveTo(this.ROAD_X+this.ROAD_W,0); ctx.lineTo(this.ROAD_X+this.ROAD_W,H); ctx.stroke();

        // Lignes pointillées (animation rapide)
        const dashOff=(s.frame*s.speed*.7)%36;
        ctx.setLineDash([18,18]); ctx.lineDashOffset=-dashOff;
        ctx.strokeStyle='rgba(236,230,218,0.04)'; ctx.lineWidth=1;
        for(let i=1;i<5;i++){
            const x=this.ROAD_X+this.LANE_W*i;
            ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
        }
        ctx.setLineDash([]);

        // Highlight couloir
        const plx=this.ROAD_X+this.LANE_W*s.pl;
        ctx.fillStyle='rgba(201,149,60,0.03)';
        ctx.fillRect(plx,0,this.LANE_W,H);

        // Particules (trail & explosion)
        for(const p of s.particles){
            ctx.beginPath();
            ctx.arc(p.x,p.y,Math.max(.4,p.size*p.life),0,Math.PI*2);
            ctx.fillStyle=`rgba(${p.color},${p.life*.6})`;
            ctx.fill();
        }

        // Obstacles
        for(const o of s.obs){
            const ox=this.laneX(o.lane), ow=this.LANE_W*.78, oh=36, r=5;
            ctx.fillStyle='rgba(184,92,56,0.15)';
            ctx.strokeStyle='rgba(184,92,56,0.7)';
            ctx.lineWidth=1.5;
            ctx.shadowColor='rgba(184,92,56,0.25)'; ctx.shadowBlur=10;
            ctx.beginPath(); ctx.roundRect(ox-ow/2,o.y-oh/2,ow,oh,r); ctx.fill(); ctx.stroke();
            ctx.shadowBlur=0;
            ctx.strokeStyle='rgba(184,92,56,0.2)'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.roundRect(ox-ow/2+4,o.y-oh/2+4,ow-8,oh-8,3); ctx.stroke();
        }

        // Vaisseau (losange doré)
        if(!s.over){
            const px=s.vx, py=s.py, sz=this.P_SIZE;
            ctx.shadowColor='rgba(201,149,60,0.35)'; ctx.shadowBlur=14;
            ctx.fillStyle='rgba(201,149,60,0.2)';
            ctx.strokeStyle='rgba(201,149,60,0.85)'; ctx.lineWidth=2;
            ctx.beginPath();
            ctx.moveTo(px,py-sz*.55); ctx.lineTo(px+sz*.45,py);
            ctx.lineTo(px,py+sz*.4); ctx.lineTo(px-sz*.45,py);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.shadowBlur=0;
            ctx.beginPath(); ctx.arc(px,py-sz*.05,2.5,0,Math.PI*2);
            ctx.fillStyle='rgba(201,149,60,0.9)'; ctx.fill();
        }
    },

    drawIdle() {
        const ctx=this.ctx, W=this.W, H=this.H;
        ctx.fillStyle='#09090e'; ctx.fillRect(0,0,W,H);
        ctx.strokeStyle='rgba(201,149,60,0.1)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(this.ROAD_X,0); ctx.lineTo(this.ROAD_X,H); ctx.stroke();
        ctx.strokeStyle='rgba(184,92,56,0.1)';
        ctx.beginPath(); ctx.moveTo(this.ROAD_X+this.ROAD_W,0); ctx.lineTo(this.ROAD_X+this.ROAD_W,H); ctx.stroke();
        ctx.setLineDash([18,18]); ctx.strokeStyle='rgba(236,230,218,0.03)'; ctx.lineWidth=1;
        for(let i=1;i<5;i++){
            const x=this.ROAD_X+this.LANE_W*i;
            ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
        }
        ctx.setLineDash([]);
    }
};

// ===== Initialisation Globale =====
document.addEventListener('DOMContentLoaded', () => {
    $('#btn-enter').addEventListener('click', () => { ensureAudio(); playSound('click'); Router.go('menu'); });
    $('#nav-menu').addEventListener('click', () => { playSound('click'); Router.go('menu'); });
    
    $$('.game-card').forEach(card => {
        const h = () => { playSound('click'); Router.go(card.dataset.game); };
        card.addEventListener('click', h);
        card.addEventListener('keydown', e => { if(e.key==='Enter') h(); });
    });
    
    initTilt();
    
    window.addEventListener('resize', () => {
        if(Router.cur==='runner' && Runner._init){ 
            Runner.resize(); 
            if(!Runner.s||!Runner.s.started) Runner.drawIdle(); 
        }
    });
});
