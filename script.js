const x = 'X';
const o = 'O';

const Player = ((shape) => {
    // Competing should only be true for the two real players, not if checking for wins, etc
    let competing = true;
    let isWinner = false;
    let isBot = false;
    let winningPositions = [];
    let name;

    const reset = () => {
        isWinner = false;
        winningPositions = [];
    }

    return { shape, name, isWinner, winningPositions, isBot, competing };
});

const Gameboard = (() => {
    let boardSize = 3;
    let board = [];

    const resetBoard = () => {
        board = [];

        for (let i = 0; i < boardSize; i++) {
            board.push(new Array(boardSize).fill(null));
        }
    }

    const printBoard = (myBoard=board) => {
        let boardString = "";
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                boardString += (myBoard[i][j] ? myBoard[i][j] : " ");
                if (j < boardSize - 1) boardString += "|";
            }
            boardString += "\n";
        }
        console.log(boardString);
    };

    const copyBoard = (board) => {
        let copy = [];
        for (let i = 0; i < boardSize; i++) {
            let rowCopy = [];
            for (let j = 0; j < boardSize; j++) {
                rowCopy.push(board[i][j]);
            }
            copy.push(rowCopy);
        }
        return copy;
    }

    const addShape = (player, id) => {
        if (isSpaceEmpty(board, id)) {
            board[Math.floor(id / boardSize)][id % boardSize] = player.shape;
        }
        checkWinner(board, player);
    };

    const checkWinner = (board, player) => {
        // Check across
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (board[i][j] !== player.shape) {
                    break;
                } else if (j === boardSize - 1) {
                    win(player, [i, j], [i, j - 1], [i, j - 2]);
                    return true;
                }
            }
        }

        // Check down
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (board[j][i] !== player.shape) {
                    break;
                } else if (j === boardSize - 1) {
                    win(player, [j, i], [j - 1, i], [j - 2, i]);
                    return true;
                }
            }
        }

        // Check diagonal
        for (let i = 0; i < boardSize; i++) {
            if (board[i][i] !== player.shape) {
                break;
            } else if (i === boardSize - 1) {
                win(player, [i, i], [i - 1, i - 1], [i - 2, i - 2]);
                return true;
            }
        }

        // Check backwards diagonal
        for (let i = 0; i < boardSize; i++) {
            if (board[boardSize - i - 1][i] !== player.shape) {
                break;
            } else if (i === boardSize - 1) {
                win(player, [boardSize - i - 1, i], [boardSize - i, i - 1], [boardSize - i + 1, i - 2]);
                return true;
            }
        }

        return false;
    };

    const win = (player, p1, p2, p3) => {
        player.isWinner = true;
        player.winningPositions = [p1, p2, p3];
    }

    const checkForDraw = (myBoard=board) => {
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (myBoard[j][i] === null) {
                    return false;
                }
            }
        }

        return true;
    }

    const randomMove = (player) => {
        let randNo;
        while (true) {
            randNo = Math.floor(Math.random() * 9);
            if (isSpaceEmpty(board, randNo)) {
                return randNo;
            }
        }
    }


    // Smart move methods below this
    const smartMove = (player, opponent) => {
        let bestMove;
        let bestMoveVal = Number.NEGATIVE_INFINITY;

        console.log("Evaluating board:");
        printBoard();

        for (let id = 0; id < 9; id++) {
            if (isSpaceEmpty(board, id)) {
                let playerCopy = Player(player.shape);
                let opponentCopy = Player(opponent.shape);
                Object.assign(playerCopy, player);
                Object.assign(opponentCopy, opponent);
                playerCopy.competing = false;
                opponentCopy.competing = false;

                console.log("Evaluating space " + id + "..");
                let curMove = minimax(board, true, playerCopy, opponentCopy, 0);
                if (curMove[1] > bestMoveVal) {
                    console.log("       New best: " + curMove[1] + " at space " + curMove[0] + ".");
                    console.log("       Old best: " + bestMoveVal + " at space " + bestMove + ".");
                    bestMove = curMove[0];
                    bestMoveVal = curMove[1];
                }
            }
        }

        console.log("best move", bestMoveVal)
        return bestMove;
    }


    const minimax = (board, isMaximizingPlayer, maximizingPlayer, minimizingPlayer, depth) => {
        
        let bestVal, curVal, bestId;

        if (checkWinner(board, maximizingPlayer)) {
            return [null, 10 - depth];
        } else if (checkWinner(board, minimizingPlayer)) {
            return [null, -10 + depth];
        } else if (checkForDraw(board)) {
            return [null, 0];
        }

        if (isMaximizingPlayer) {
            bestVal = Number.NEGATIVE_INFINITY;
            for (let id = 0; id < 9; id++) {
                if (isSpaceEmpty(board, id)) {
                    let newBoard = copyBoard(board);
                    placeShapeOnBoard(maximizingPlayer, id, newBoard);
                    curVal = minimax(newBoard, !isMaximizingPlayer, maximizingPlayer, minimizingPlayer, depth+1)[1];
                    if (curVal > bestVal) {
                        bestVal = curVal;
                        bestId = id;
                    }
                }
            }
        } else {
            bestVal = Number.POSITIVE_INFINITY;
            for (let id = 0; id < 9; id++) {
                if (isSpaceEmpty(board, id)) {
                    let newBoard = copyBoard(board);
                    placeShapeOnBoard(minimizingPlayer, id, newBoard);
                    curVal = minimax(newBoard, !isMaximizingPlayer, maximizingPlayer, minimizingPlayer, depth+1)[1];
                    if (bestVal > curVal) {
                        bestVal = curVal;
                        bestId = id;
                    }
                }
            }
        }

        return [bestId, bestVal];
    }

    const placeShapeOnBoard = (player, id, board) => {
        if (isSpaceEmpty(board, id)) {
            board[Math.floor(id / boardSize)][id % boardSize] = player.shape;
        }

        if (player.competing) {
            checkWinner(board, player);
        }
    };

    const isSpaceEmpty = (board, id) => {
        return board[Math.floor(id / 3)][id % 3] === null;
    }

    resetBoard();
    return { printBoard, addShape, checkForDraw, resetBoard, randomMove, smartMove };
})();

const Game = (() => {
    let hasBot = false;
    let botName = "Bot";
    let smartBot = false;
    let cells = document.getElementById("cell-holder").getElementsByTagName('*');
    let resetBtn = document.getElementById("reset-btn");
    let player1name = "Player 1";
    let player2name = "Player 2";
    let players, curPlayer, gameover;

    const elementClicked = (element) => {
        if (!gameover && element.classList.contains("hvr-back-pulse")) {
            element.innerHTML = curPlayer.shape;
            Gameboard.addShape(curPlayer, element.id);
            element.classList.remove("hvr-back-pulse");
            element.classList.add("full");
            element.style.display = "none";
            element.style.display = "flex";

            if (curPlayer.isWinner || Gameboard.checkForDraw()) {
                gameover = true;
                updatePlayerUI(curPlayer);
            } else {
                swapPlayer();
                if (curPlayer.isBot) {
                    if (smartBot) {
                        elementClicked(document.getElementById(Gameboard.smartMove(curPlayer, curPlayer === players[0] ? players[1] : players[0])));
                    } else {
                        elementClicked(document.getElementById(Gameboard.randomMove(curPlayer)));
                    }
                }
            }
        }
    };

    const elementHovered = (element) => {
        if (element.classList.contains("hvr-back-pulse")) {
            element.innerHTML = curPlayer.shape;
        }
    }

    const elementHoveredOff = (element) => {
        if (element.classList.contains("hvr-back-pulse")) {
            element.innerHTML = "";
        }
    }

    const swapPlayer = () => {
        if (curPlayer === players[0]) {
            curPlayer = players[1];
        } else {
            curPlayer = players[0];
        }
        updatePlayerUI(curPlayer);
    };

    const updatePlayerUI = (player) => {
        let playerTurnUI = document.getElementById("turn-message");

        if (gameover) {
            if (player.isWinner) {
                for (let i = 0; i < cells.length; i++) {
                    cells[i].classList.remove("hvr-back-pulse");
                }

                player.winningPositions.forEach((xy) => {
                    document.getElementById((xy[0] * 3 + xy[1]).toString()).classList.add("win-cell");
                });

                playerTurnUI.innerHTML = curPlayer.name + " wins!";
            } else {
                playerTurnUI.innerHTML = "It's a draw!";
            }

            resetBtn.style.display = "inline-block";
        } else {
            playerTurnUI.innerHTML = curPlayer.name + "'s turn";
        }
    };

    const logToConsole = () => {
        Gameboard.printBoard();
        console.log(curPlayer.name + "'s turn")
    }

    const reset = (player1 = Player(x), player2 = Player(o)) => {
        for (let i = 0; i < cells.length; i++) {
            cells[i].innerHTML = "";
            cells[i].classList.add("hvr-back-pulse");
            cells[i].classList.remove("win-cell");
            cells[i].classList.remove("full");
        }

        resetBtn.style.display = "none";
        players = [player1, player2];
        players[0].name = player1name ? player1name : "Player 1";
        if (hasBot) {
            players[1].name = botName;
            players[1].isBot = true;
        } else {
            players[1].name = player2name ? player2name : "Player 2";
        }
        curPlayer = players[0];
        gameover = false;
        Gameboard.resetBoard();
        updatePlayerUI(curPlayer);
    }

    const promptNames = () => {
        player1name = prompt("Player 1 name?");
        if (players[1].isBot) {
            players[0].name = player1name;
        } else if (player1name && player1name.length < 16 && player1name.trim().toLocaleLowerCase() !== botName.toLocaleLowerCase()) {
            player2name = prompt("Player 2 name?");
            if (player2name && player1name !== player2name && player2name.length < 16 && player2name.trim().toLocaleLowerCase() !== botName.toLocaleLowerCase()) {
                players[0].name = player1name;
                players[1].name = player2name;
                updatePlayerUI(curPlayer);
            }
        }

        if (player1name.trim().toLocaleLowerCase() === botName.toLocaleLowerCase()) {
            player1name = "Player 1";
        }

        if (player2name.trim().toLocaleLowerCase() === botName.toLocaleLowerCase()) {
            player2name = "Player 1";
        }
    }

    const playBot = () => {
        hasBot = !hasBot;

        if (players[1].isBot) {
            player2name = "Player 2";
            reset();
        } else {
            let bot = Player(o);
            bot.isBot = true;
            player2name = botName;
            reset(Player(x), bot);
        }
    }

    const toggleSmartBot = () => {
        if (smartBot) {
            botName = "Bot";
        } else {
            botName = "SmartBot";
        }

        smartBot = !smartBot;

        if (hasBot) {
            updatePlayerUI(curPlayer);
        }
    }

    reset();
    return { elementClicked, elementHovered, elementHoveredOff, reset, promptNames, playBot, toggleSmartBot };
})();