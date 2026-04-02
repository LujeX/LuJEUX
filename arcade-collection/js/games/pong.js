class PongGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.paddleH = 80; this.paddleW = 12; this.ballSize = 12;
        this.particles = new ParticleSystem(50);
        this.init();
    }
    init() {
        this.playerY = this.height/2-this.paddleH/2; this.aiY = this.height/2-this.paddleH/2;
        this.ballX = this.width/2; this.ballY = this.height/2;
        this.ballVX = 5; this.ballVY = 3;
        this.playerScore = 0; this.aiScore = 0; this.score = 0;
        this.gameOver = false; this.gameState = GAME_STATES.IDLE; this.aiSpeed = 4;
    }
    update(dt) {
        if(this.gameOver) return;
        this.particles.update(dt);
        this.ballX+=this.ballVX; this.ballY+=this.ballVY;
        if(this.ballY<=this.ballSize||this.ballY>=this.height-this.ballSize) this.ballVY*=-1;
        if(this.ballX<=25+this.paddleW&&this.ballY>=this.playerY&&this.ballY<=this.playerY+this.paddleH){
            this.ballVX=Math.abs(this.ballVX)*1.05;this.ballVY+=(this.ballY-(this.playerY+this.paddleH/2))*0.1;
            this.particles.emit(this.ballX,this.ballY,{count:5,speed:3,size:3,colors:['#4ade80','#fff'],life:0.3,spread:Math.PI/2});}
        if(this.ballX>=this.width-25-this.paddleW-this.ballSize&&this.ballY>=this.aiY&&this.ballY<=this.aiY+this.paddleH){
            this.ballVX=-Math.abs(this.ballVX)*1.05;this.ballVY+=(this.ballY-(this.aiY+this.paddleH/2))*0.1;
            this.particles.emit(this.ballX,this.ballY,{count:5,speed:3,size:3,colors:['#ef4444','#fff'],life:0.3,spread:Math.PI/2});}
        this.ballVX=MathUtils.clamp(this.ballVX,-15,15);this.ballVY=MathUtils.clamp(this.ballVY,-10,10);
        if(this.ballX<0){this.aiScore++;this.resetBall(-1);}
        if(this.ballX>this.width){this.playerScore++;this.resetBall(1);}
        const aiCenter=this.aiY+this.paddleH/2;
        if(aiCenter<this.ballY-20) this.aiY+=this.aiSpeed;
        else if(aiCenter>this.ballY+20) this.aiY-=this.aiSpeed;
        this.aiY=MathUtils.clamp(this.aiY,0,this.height-this.paddleH);
        this.score=this.playerScore*10;
        if(this.engine) this.engine.score=this.score;
        if(this.playerScore>=5){this.gameOver=true;this.endGame(true,'🏆 VICTOIRE!','🏆');}
        else if(this.aiScore>=5){this.gameOver=true;this.endGame(false,'💻 Défaite','😢');}
    }
    resetBall(dir){this.ballX=this.width/2;this.ballY=this.height/2;this.ballVX=5*dir;this.ballVY=(Math.random()-0.5)*6;}
    render(){
        const ctx=this.ctx;ctx.fillStyle='#0a0a12';ctx.fillRect(0,0,this.width,this.height);
        ctx.setLineDash([10,10]);ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(this.width/2,0);ctx.lineTo(this.width/2,this.height);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='#4ade80';RenderUtils.roundRect(ctx,20,this.playerY,this.paddleW,this.paddleH,6);ctx.fill();
        ctx.fillStyle='#ef4444';RenderUtils.roundRect(ctx,this.width-20-this.paddleW,this.aiY,this.paddleW,this.paddleH,6);ctx.fill();
        ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=15;
        ctx.beginPath();ctx.arc(this.ballX,this.ballY,this.ballSize,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        this.particles.render(ctx);
        ctx.font='bold 48px Orbitron';ctx.textAlign='center';ctx.fillStyle='rgba(255,255,255,0.2)';
        ctx.fillText(this.playerScore,this.width/4,this.height/2);ctx.fillText(this.aiScore,this.width*3/4,this.height/2);
    }
    handleKey(key,code){
        if(code==='ArrowUp'||code==='KeyW') this.playerY-=25;
        if(code==='ArrowDown'||code==='KeyS') this.playerY+=25;
        this.playerY=MathUtils.clamp(this.playerY,0,this.height-this.paddleH);
    }
    handleMobileInput(dir,state){
        if(state==='down'){if(dir==='up')this.playerY-=25;if(dir==='down')this.playerY+=25;
            this.playerY=MathUtils.clamp(this.playerY,0,this.height-this.paddleH);}
    }
}
