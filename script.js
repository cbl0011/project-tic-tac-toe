const x = 'X';
const o = 'O';

const Player = ((shape) => {
    let isWinner = false;
    let winningPositions = [];
    let name;

    const reset = () => {
        isWinner = false;
        winningPositions = [];
    }

    return { shape, name, isWinner, winningPositions };
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

    const printBoard = () => {
        let boardString = "";
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                boardString += (board[i][j] ? board[i][j] : " ");
                if (j < boardSize - 1) boardString += "|";
            }
            boardString += "\n";
        }
        console.log(boardString);
    };

    const addShape = (player, id) => {
        board[Math.floor(id / boardSize)][id % boardSize] = player.shape;
        checkWinner(player);
    };

    const checkWinner = (player) => {
        // Check across
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (board[i][j] !== player.shape) {
                    break;
                } else if (j === boardSize - 1) {
                    win(player, [i, j], [i, j-1], [i, j-2]);
                    return;
                }
            }
        }

        // Check down
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (board[j][i] !== player.shape) {
                    break;
                } else if (j === boardSize - 1) {
                    win(player, [j, i], [j-1, i], [j-2, i]);
                    return;
                }
            }
        }

        // Check diagonal
        for (let i = 0; i < boardSize; i++) {
            if (board[i][i] !== player.shape) {
                break;
            } else if (i === boardSize - 1) {
                win(player, [i, i], [i-1, i-1], [i-2, i-2]);
                return;
            }
        }

        // Check backwards diagonal
        for (let i = 0; i < boardSize; i++) {
            if (board[boardSize - i - 1][i] !== player.shape) {
                break;
            } else if (i === boardSize - 1) {
                win(player, [boardSize - i - 1, i], [boardSize - i, i-1], [boardSize - i + 1, i-2]);
                return;
            }
        }
    };

    const win = (player, p1, p2, p3) => {
        player.isWinner = true;
        player.winningPositions = [p1, p2, p3];
    }

    const checkForDraw = () => {
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (board[j][i] === null) {
                    return false;
                }
            }
        }

        return true;
    }

    resetBoard();
    return { printBoard, addShape, checkForDraw, resetBoard };
})();

const Game = (() => {
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
            element.style.display = "none";
            element.style.display = "flex";

            if (curPlayer.isWinner || Gameboard.checkForDraw()) {
                gameover = true;
                updatePlayerUI(curPlayer);
            } else {
                swapPlayer();
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

    const reset = () => {
        for (let i = 0; i < cells.length; i++) {
            cells[i].innerHTML = "";
            cells[i].classList.add("hvr-back-pulse");
            cells[i].classList.remove("win-cell");
        }

        resetBtn.style.display = "none";
        players = [Player(x), Player(o)];
        players[0].name = player1name;
        players[1].name = player2name;
        curPlayer = players[0];
        gameover = false;
        Gameboard.resetBoard();
        updatePlayerUI(curPlayer);
    }

    const promptNames = () => {
        player1name = prompt("Player 1 name?");
        if (player1name && player1name.length < 16) {
            player2name = prompt("Player 2 name?");
            if(player2name && player2name.length < 16) {
                players[0].name = player1name;
                players[1].name = player2name;
                updatePlayerUI(curPlayer);
            }
        }
    }

    reset();
    return { elementClicked, elementHovered, elementHoveredOff, reset, promptNames };
})();