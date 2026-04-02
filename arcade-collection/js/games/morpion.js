class MorpionGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.cellSize = 100; this.padding = 30;
        this.particles = new ParticleSystem(50);
        this.init();
    }
    init() {
        this.board = Array(3).fill(null).map(()=>Array(3).fill(0));
        this.currentPlayer = 1; this.winner = null; this.gameOver = false;
        this.winLine = null; this.score = 0; this.moves = 0;
        this.gameState = GAME_STATES.IDLE;
    }
    checkWin() {
        const lines = [[[0,0],[0,1],[0,2]],[[1,0],[1,1],[1,2]],[[2,0],[2,1],[2,2]],
            [[0,0],[1,0],[2,0]],[[0,1],[1,1],[2,1]],[[0,2],[1,2],[2,2]],
            [[0,0],[1,1],[2,2]],[[0,2],[1,1],[2,0]]];
        for(const line of lines){const[a,b,c]=line;
            if(this.board[a[0]][a[1]]&&this.board[a[0]][a[1]]===this.board[b[0]][b[1]]&&this.board[b[0]][b[1]]===this.board[c[0]][c[1]])
                return{winner:this.board[a[0]][a[1]],line};}
        return null;
    }
    isFull(){return this.board.every(r=>r.every(c=>c!==0));}
    aiMove(){for(const[r,c]of[[1,1],[0,0],[0,2],[2,0],[2,2],[0,1],[1,0],[1,2]])if(this.board[r][c]===0){this.board[r][c]=2;return;}}
    makeMove(r,c){
        if(this.board[r][c]!==0||this.gameOver||this.currentPlayer!==1)return;
        this.board[r][c]=1;this.moves++;const res=this.checkWin();
        if(res){this.winner=res.winner;this.winLine=res.line;this.gameOver=true;
            if(res.winner===1){this.score=100;this.endGame(true,'🎉 VICTOIRE!','🏆');}
            else{this.score=0;this.endGame(false,'🤖 IA Gagne','🤖');}return;}
        if(this.isFull()){this.gameOver=true;this.score=10;this.endGame(null,'🤝 Égalité','🤝');return;}
        this.currentPlayer=2;
        setTimeout(()=>{this.aiMove();this.moves++;const res=this.checkWin();
            if(res){this.winner=res.winner;this.winLine=res.line;this.gameOver=true;if(res.winner===2){this.score=0;this.endGame(false,'🤖 IA Gagne','🤮');}return;}
            if(this.isFull()){this.gameOver=true;this.score=10;this.endGame(null,'🤝 Égalité','🤝');return;}
            this.currentPlayer=1;},400);
    }
    render(){
        const ctx=this.ctx;ctx.fillStyle='#0a0a12';ctx.fillRect(0,0,this.width,this.height);
        const size=this.cellSize*3+this.padding*2,ox=(this.width-size)/2,oy=(this.height-size)/2;
        ctx.save();ctx.translate(ox,oy);
        ctx.strokeStyle='rgba(99,102,241,0.5)';ctx.lineWidth=4;ctx.lineCap='round';
        for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(this.padding+i*this.cellSize,this.padding);ctx.lineTo(this.padding+i*this.cellSize,this.padding+3*this.cellSize);ctx.stroke();
            ctx.beginPath();ctx.moveTo(this.padding,this.padding+i*this.cellSize);ctx.lineTo(this.padding+3*this.cellSize,this.padding+i*this.cellSize);ctx.stroke();}
        if(this.winLine){ctx.strokeStyle='#fbbf24';ctx.lineWidth=6;ctx.shadowColor='#fbbf24';ctx.shadowBlur=20;
            const[[r1,c1],[r2,c2]]=this.winLine;
            ctx.beginPath();ctx.moveTo(this.padding+c1*this.cellSize+this.cellSize/2,this.padding+r1*this.cellSize+this.cellSize/2);
            ctx.lineTo(this.padding+c2*this.cellSize+this.cellSize/2,this.padding+r2*this.cellSize+this.cellSize/2);ctx.stroke();ctx.shadowBlur=0;}
        for(let r=0;r<3;r++)for(let c=0;c<3;c++){
            const cx=this.padding+c*this.cellSize+this.cellSize/2,cy=this.padding+r*this.cellSize+this.cellSize/2;
            if(this.board[r][c]===1){ctx.strokeStyle='#ef4444';ctx.lineWidth=8;ctx.lineCap='round';
                const off=this.cellSize*0.3;ctx.beginPath();ctx.moveTo(cx-off,cy-off);ctx.lineTo(cx+off,cy+off);ctx.stroke();
                ctx.beginPath();ctx.moveTo(cx+off,cy-off);ctx.lineTo(cx-off,cy+off);ctx.stroke();}
            else if(this.board[r][c]===2){ctx.strokeStyle='#3b82f6';ctx.lineWidth=8;ctx.beginPath();ctx.arc(cx,cy,this.cellSize*0.35,0,Math.PI*2);ctx.stroke();}
        }
        ctx.restore();ctx.font='bold 20px Orbitron';ctx.textAlign='center';ctx.fillStyle='#94a3b8';
        ctx.fillText(!this.gameOver?(this.currentPlayer===1?'⬇️ Votre tour':'🤖 Tour IA'):'',this.width/2,30);
    }
    handleClick(x,y){
        const size=this.cellSize*3+this.padding*2,ox=(this.width-size)/2,oy=(this.height-size)/2;
        const rx=x-ox,ry=y-oy;
        if(rx>this.padding&&rx<size-this.padding&&ry>this.padding&&ry<size-this.padding){
            const c=Math.floor((rx-this.padding)/this.cellSize),r=Math.floor((ry-this.padding)/this.cellSize);
            if(r>=0&&r<3&&c>=0&&c<3)this.makeMove(r,c);
        }
    }
}
