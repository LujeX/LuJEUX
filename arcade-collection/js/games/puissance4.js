class Puissance4Game extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.cols = 7; this.rows = 6;
        this.cellSize = 70; this.padding = 15;
        this.playerColor = '#ef4444'; this.aiColor = '#fbbf24';
        this.particles = new ParticleSystem(100);
        this.aiDepth = 4;
        this.init();
    }
    
    init() {
        this.board = Array(this.rows).fill(null).map(()=>Array(this.cols).fill(0));
        this.currentPlayer = 1; this.winner = null; this.winningCells = [];
        this.gameOver = false; this.isAnimating = false; this.score = 0;
        this.hoverCol = -1;
        this.fallingPiece = { active:false, col:0, targetRow:0, y:0, player:0, speed:18 };
        this.gameState = GAME_STATES.IDLE;
    }
    
    getLowestEmptyRow(col) { for(let r=this.rows-1;r>=0;r--) if(this.board[r][col]===0) return r; return -1; }
    canPlay(col) { return col>=0&&col<this.cols&&this.board[0][col]===0; }
    
    checkWin(player) {
        for(let r=0;r<this.rows;r++) for(let c=0;c<=this.cols-4;c++)
            if(this.board[r][c]===player&&this.board[r][c+1]===player&&this.board[r][c+2]===player&&this.board[r][c+3]===player)
                return [[r,c],[r,c+1],[r,c+2],[r,c+3]];
        for(let r=0;r<=this.rows-4;r++) for(let c=0;c<this.cols;c++)
            if(this.board[r][c]===player&&this.board[r+1][c]===player&&this.board[r+2][c]===player&&this.board[r+3][c]===player)
                return [[r,c],[r+1,c],[r+2,c],[r+3,c]];
        for(let r=0;r<=this.rows-4;r++) for(let c=0;c<=this.cols-4;c++)
            if(this.board[r][c]===player&&this.board[r+1][c+1]===player&&this.board[r+2][c+2]===player&&this.board[r+3][c+3]===player)
                return [[r,c],[r+1,c+1],[r+2,c+2],[r+3,c+3]];
        for(let r=3;r<this.rows;r++) for(let c=0;c<=this.cols-4;c++)
            if(this.board[r][c]===player&&this.board[r-1][c+1]===player&&this.board[r-2][c+2]===player&&this.board[r-3][c+3]===player)
                return [[r,c],[r-1,c+1],[r-2,c+2],[r-3,c+3]];
        return null;
    }
    
    isBoardFull() { return this.board[0].every(c=>c!==0); }
    
    evaluateBoard(board) {
        let score = 0;
        for(let r=0;r<this.rows;r++) for(let c=0;c<this.cols;c++) {
            if(board[r][c]===2) score+=(4-Math.abs(c-3))*3;
            else if(board[r][c]===1) score-=(4-Math.abs(c-3))*3;
        }
        return score;
    }
    
    minimax(board, depth, alpha, beta, isMax) {
        const aiW = board.flat().some((v,i)=>{const r=Math.floor(i/this.cols),c=i%this.cols;return v===2&&this.checkWinForBoard(board,2,r,c);});
        const pW = board.flat().some((v,i)=>{const r=Math.floor(i/this.cols),c=i%this.cols;return v===1&&this.checkWinForBoard(board,1,r,c);});
        if(aiW) return 10000+depth;
        if(pW) return -10000-depth;
        if(depth===0||board[0].every(c=>c!==0)) return this.evaluateBoard(board);
        const order=[3,2,4,1,5,0,6];
        if(isMax){
            let max=-Infinity;
            for(const col of order){
                if(board[0][col]===0){
                    const nb=board.map(r=>[...r]); let tr=-1;
                    for(let rr=this.rows-1;rr>=0;rr--)if(nb[rr][col]===0){tr=rr;break;}
                    if(tr>=0){nb[tr][col]=2;const ev=this.minimax(nb,depth-1,alpha,beta,false);max=Math.max(max,ev);alpha=Math.max(alpha,ev);if(beta<=alpha)break;}
                }
            }
            return max;
        } else {
            let min=Infinity;
            for(const col of order){
                if(board[0][col]===0){
                    const nb=board.map(r=>[...r]); let tr=-1;
                    for(let rr=this.rows-1;rr>=0;rr--)if(nb[rr][col]===0){tr=rr;break;}
                    if(tr>=0){nb[tr][col]=1;const ev=this.minimax(nb,depth-1,alpha,beta,true);min=Math.min(min,ev);beta=Math.min(beta,ev);if(beta<=alpha)break;}
                }
            }
            return min;
        }
    }
    
    checkWinForBoard(board,p,r,c){
        if(c<=this.cols-4&&board[r][c]===p&&board[r][c+1]===p&&board[r][c+2]===p&&board[r][c+3]===p)return true;
        if(r<=this.rows-4&&board[r][c]===p&&board[r+1][c]===p&&board[r+2][c]===p&&board[r+3][c]===p)return true;
        return false;
    }
    
    getBestMove(){
        let best=-Infinity,bestCol=3;
        const order=[3,2,4,1,5,0,6];
        for(const col of order){
            if(this.canPlay(col)){
                const nb=this.board.map(r=>[...r]);
                const row=this.getLowestEmptyRow(col);
                if(row>=0){nb[row][col]=2;const sc=this.minimax(nb,this.aiDepth,-Infinity,Infinity,false);if(sc>best){best=sc;bestCol=col;}}
            }
        }
        return bestCol;
    }
    
    makeAIMove(){
        if(this.gameOver||this.currentPlayer!==2||this.isAnimating)return;
        setTimeout(()=>{const col=this.getBestMove();this.startFallingAnimation(col,2);},400+Math.random()*300);
    }
    
    startFallingAnimation(col,player){
        const tr=this.getLowestEmptyRow(col);
        if(tr<0)return;
        this.isAnimating=true;
        this.fallingPiece={active:true,col,row:0,targetRow:tr,y:0,player,speed:18};
    }
    
    completeMove(){
        const{col,targetRow,player}=this.fallingPiece;
        this.board[targetRow][col]=player;
        this.isAnimating=false;this.fallingPiece.active=false;
        const x=col*this.cellSize+this.cellSize/2+this.padding,y=targetRow*this.cellSize+this.cellSize/2+this.padding;
        this.particles.emit(x,y,{count:12,speed:5,size:4,colors:player===1?['#ef4444','#fca5a5']:['#fbbf24','#fef08a'],life:0.5,gravity:150,spread:Math.PI*2});
        const winCells=this.checkWin(player);
        if(winCells){
            this.winner=player;this.winningCells=winCells;this.gameOver=true;
            if(player===1){this.score=100+(this.rows-winCells[0][0])*20;this.endGame(true,'🎉 VICTOIRE!','🏆');}
            else{this.score=0;this.endGame(false,'🤖 IA GAGNE','🤖');}return;
        }
        if(this.isBoardFull()){this.gameOver=true;this.score=25;this.endGame(null,'🤝 MATCH NUL','🤝');return;}
        this.currentPlayer=player===1?2:1;
        if(this.currentPlayer===2)this.makeAIMove();
    }
    
    update(dt){
        this.particles.update(dt);
        if(this.fallingPiece.active){this.fallingPiece.y+=this.fallingPiece.speed;if(this.fallingPiece.y>=this.fallingPiece.targetRow)this.completeMove();}
    }
    
    render(){
        const ctx=this.ctx;
        const bw=this.cols*this.cellSize+this.padding*2,bh=this.rows*this.cellSize+this.padding*2;
        const ox=(this.width-bw)/2,oy=(this.height-bh)/2+20;
        ctx.fillStyle='#0a0a12';ctx.fillRect(0,0,this.width,this.height);
        ctx.save();ctx.translate(ox,oy);
        ctx.fillStyle='#1e293b';RenderUtils.roundRect(ctx,-8,-8,bw+16,bh+16,12);ctx.fill();
        const grad=ctx.createLinearGradient(0,0,0,bh);grad.addColorStop(0,'#2563eb');grad.addColorStop(1,'#1d4ed8');
        ctx.fillStyle=grad;RenderUtils.roundRect(ctx,0,0,bw,bh,12);ctx.fill();
        for(let r=0;r<this.rows;r++)for(let c=0;c<this.cols;c++){
            const x=c*this.cellSize+this.cellSize/2+this.padding,y=r*this.cellSize+this.cellSize/2+this.padding,rad=this.cellSize/2-5;
            ctx.fillStyle='#0f172a';ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
            if(this.board[r][c]!==0)this.renderDisc(ctx,x,y,rad,this.board[r][c],this.winningCells?.some(([wr,wc])=>wr===r&&wc===c));
        }
        if(this.fallingPiece.active){
            const x=this.fallingPiece.col*this.cellSize+this.cellSize/2+this.padding,y=this.fallingPiece.y*this.cellSize+this.cellSize/2+this.padding;
            this.renderDisc(ctx,x,y,this.cellSize/2-5,this.fallingPiece.player,false);
        }
        if(!this.gameOver&&!this.isAnimating&&this.currentPlayer===1&&this.hoverCol>=0&&this.canPlay(this.hoverCol)){
            const x=this.hoverCol*this.cellSize+this.cellSize/2+this.padding;
            ctx.globalAlpha=0.4;this.renderDisc(ctx,x,-this.cellSize,this.cellSize/2-5,1,false);ctx.globalAlpha=1;
            ctx.fillStyle=this.playerColor;ctx.beginPath();ctx.moveTo(x,15);ctx.lineTo(x-10,0);ctx.lineTo(x+10,0);ctx.closePath();ctx.fill();
        }
        this.particles.render(ctx);ctx.restore();
        ctx.font='bold 20px Orbitron';ctx.textAlign='center';
        if(!this.gameOver&&!this.isAnimating){ctx.fillStyle=this.currentPlayer===1?this.playerColor:this.aiColor;ctx.fillText(this.currentPlayer===1?'⬇️ VOTRE TOUR':'🤖 IA RÉFLÉCHIT...',this.width/2,30);}
    }
    
    renderDisc(ctx,x,y,rad,player,isWin){
        const color=player===1?this.playerColor:this.aiColor;
        if(isWin){ctx.shadowColor=color;ctx.shadowBlur=20;}
        const g=ctx.createRadialGradient(x-rad*0.3,y-rad*0.3,0,x,y,rad);
        if(player===1){g.addColorStop(0,'#fca5a5');g.addColorStop(0.7,color);g.addColorStop(1,'#b91c1c');}
        else{g.addColorStop(0,'#fef08a');g.addColorStop(0.7,color);g.addColorStop(1,'#d97706');}
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.35)';ctx.beginPath();ctx.arc(x-rad*0.3,y-rad*0.3,rad*0.35,0,Math.PI*2);ctx.fill();
        if(isWin){ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();}
        ctx.shadowBlur=0;
    }
    
    handleClick(x,y){
        if(this.gameOver||this.isAnimating||this.currentPlayer!==1)return;
        const bw=this.cols*this.cellSize+this.padding*2,ox=(this.width-bw)/2;
        const col=Math.floor((x-ox-this.padding)/this.cellSize);
        if(col>=0&&col<this.cols&&this.canPlay(col))this.startFallingAnimation(col,1);
    }
    
    handleMouseMove(x,y){
        if(this.gameOver||this.isAnimating||this.currentPlayer!==1){this.hoverCol=-1;return;}
        const bw=this.cols*this.cellSize+this.padding*2,ox=(this.width-bw)/2;
        this.hoverCol=Math.floor((x-ox-this.padding)/this.cellSize);
    }
}
