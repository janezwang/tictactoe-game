
const options = document.querySelector(".options");
const computerBtn = document.querySelector(".computer");
const friendBtn = document.querySelector(".friend");
const xBtn = document.querySelector(".x");
const oBtn = document.querySelector(".o");
const playBtn = document.querySelector(".play");
const gameOverElement = document.querySelector(".gameover");

const player = new Object;
let OPPONENT;

oBtn.addEventListener("click", function(){
    player.man = "O";
    player.computer = "X";
    player.friend = "X";

    switchActive(xBtn, oBtn);
});

xBtn.addEventListener("click", function(){
    player.man = "X";
    player.computer = "O";
    player.friend = "O";

    switchActive(oBtn, xBtn);
});
 
computerBtn.addEventListener("click", function(){
    OPPONENT = "computer";
    switchActive(friendBtn, computerBtn);
});

friendBtn.addEventListener("click", function(){
    OPPONENT = "friend";
    switchActive(computerBtn, friendBtn);
});

playBtn.addEventListener("click", function(){
    if( !OPPONENT){
        computerBtn.style.backgroundColor = "red";
        friendBtn.style.backgroundColor = "red";
        return;
    }

    if( !player.man ){
        oBtn.style.backgroundColor = "red";
        xBtn.style.backgroundColor = "red";
        return;
    }
    
    init(player, OPPONENT);
    options.classList.add("hide");
});

function switchActive(off, on){
    off.classList.remove("active");
    on.classList.add("active");
}

function init(player, OPPONENT){
   
    const canvas = document.getElementById("cvs");
    const ctx = canvas.getContext("2d");

    let board = [];
    const COLUMN = 3;
    const ROW = 3;
    const SPACE_SIZE = 150;

    // 棋盘棋子数据
    let gameData = new Array(9);

    // 默认当前选手
    let currentPlayer = player.man;

    const xImage = new Image();
    xImage.src = "img/X.png";

    const oImage = new Image();
    oImage.src = "img/O.png";

    // 胜利的几种情况
    const COMBOS = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    // 失败校验
    let GAME_OVER = false;

    // 画棋盘
    function drawBoard(){
   
        let id = 0
        for(let i = 0; i < ROW; i++){
            board[i] = [];
            for(let j = 0; j < COLUMN; j++){
                board[i][j] = id;
                id++;

                ctx.strokeStyle = "#000";
                ctx.strokeRect(j * SPACE_SIZE, i * SPACE_SIZE, SPACE_SIZE, SPACE_SIZE);
            }
        }
    }
    drawBoard();

    // 监听点击事件
    canvas.addEventListener("click", function(event){

        if(GAME_OVER) return;

        // 鼠标点击坐标
        let X = event.clientX - canvas.getBoundingClientRect().x;
        let Y = event.clientY - canvas.getBoundingClientRect().y;

        // 计算棋盘上鼠标点击的空位
        let i = Math.floor(Y/SPACE_SIZE);
        let j = Math.floor(X/SPACE_SIZE);

        // 获取棋盘空格ID
        let id = board[i][j];

        // 已有棋子，返回，同一个格子不能重复下子
        if(gameData[id]) return;

        // 保存下棋人的动作至 gameData
        gameData[id] = currentPlayer;

        // 在棋盘上画出来下棋的结果
        drawOnBoard(currentPlayer, i, j);

        // 校验当前选手是否胜出
        if(isWinner(gameData, currentPlayer)){
            showGameOver(currentPlayer);
            GAME_OVER = true;
            return;
        }

        // 校验是否平局
        if(isTie(gameData)){
            showGameOver("tie");
            GAME_OVER = true;
            return;
        }

        if( OPPONENT == "computer"){
            // 用最小最大算法获取棋盘上空白位置的ID
            let id = minimax( gameData, player.computer ).id;

            // 保存下棋人的动作至 gameData
            gameData[id] = player.computer;

            let space = getIJ(id);

            drawOnBoard(player.computer, space.i, space.j);

            if(isWinner(gameData, player.computer)){
                showGameOver(player.computer);
                GAME_OVER = true;
                return;
            }

            if(isTie(gameData)){
                showGameOver("tie");
                GAME_OVER = true;
                return;
            }
        }else{
            // 如果是双人对战，换另外一个人下棋
            currentPlayer = currentPlayer == player.man ? player.friend : player.man;
        }

    });

    // 极小极大算法
    function minimax(gameData, PLAYER){
        
        if( isWinner(gameData, player.computer) ) return { evaluation : +10 };
        if( isWinner(gameData, player.man)      ) return { evaluation : -10 };
        if( isTie(gameData)                     ) return { evaluation : 0 };

        // 找空白位置
        let EMPTY_SPACES = getEmptySpaces(gameData);

        // 保存所有下棋选择和评估值
        let moves = [];

        // 对所有空白位置进行评估
        for( let i = 0; i < EMPTY_SPACES.length; i++){
            // 获取棋盘空格ID
            let id = EMPTY_SPACES[i];
            let backup = gameData[id];
            gameData[id] = PLAYER;
     
            let move = {};
            move.id = id;
            // 下棋动作评估
            if( PLAYER == player.computer){
                move.evaluation = minimax(gameData, player.man).evaluation;
            }else{
                move.evaluation = minimax(gameData, player.computer).evaluation;
            }

            gameData[id] = backup;

            // 保存下棋人的动作
            moves.push(move);
        }

        
        let bestMove;

        if(PLAYER == player.computer){
            // 最大化收益
            let bestEvaluation = -Infinity;
            for(let i = 0; i < moves.length; i++){
                if( moves[i].evaluation > bestEvaluation ){
                    bestEvaluation = moves[i].evaluation;
                    bestMove = moves[i];
                }
            }
        }else{
            // 最小化收益
            let bestEvaluation = +Infinity;
            for(let i = 0; i < moves.length; i++){
                if( moves[i].evaluation < bestEvaluation ){
                    bestEvaluation = moves[i].evaluation;
                    bestMove = moves[i];
                }
            }
        }

        return bestMove;
    }

  
    function getEmptySpaces(gameData){
        let EMPTY = [];

        for( let id = 0; id < gameData.length; id++){
            if(!gameData[id]) EMPTY.push(id);
        }

        return EMPTY;
    }

    
    function getIJ(id){
        for(let i = 0; i < board.length; i++){
            for(let j = 0; j < board[i].length; j++){
                if(board[i][j] == id) return { i : i, j : j}
            }
        }
    }

    
    function isWinner(gameData, player){
        for(let i = 0; i < COMBOS.length; i++){
            let won = true;

            for(let j = 0; j < COMBOS[i].length; j++){
                let id = COMBOS[i][j];
                won = gameData[id] == player && won;
            }

            if(won){
                return true;
            }
        }
        return false;
    }

    function isTie(gameData){
        let isBoardFill = true;
        for(let i = 0; i < gameData.length; i++){
            isBoardFill = gameData[i] && isBoardFill;
        }
        if(isBoardFill){
            return true;
        }
        return false;
    }

    // 展示最后结果
    function showGameOver(player){
        let message = player == "tie" ? "平局" : "胜者是";
        let imgSrc = 'img/'+player+'.png';
        gameOverElement.innerHTML = '<h1>'+message+'</1><img class="winner-img" src='+imgSrc+'></img><div class="play" onclick="location.reload()">再玩一盘!</div>';

        gameOverElement.classList.remove("hide");
    }

    // 在棋盘上画图片
    function drawOnBoard(player, i, j){
        let img = player == "X" ? xImage : oImage;

        ctx.drawImage(img, j * SPACE_SIZE, i * SPACE_SIZE);
    }
}
