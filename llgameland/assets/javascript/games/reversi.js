window.addEventListener("load", () => {
    "use strict";
    const game = new Reversi();
    game.start();
});

class Reversi {
    constructor() {
        this.cpuTimer;

        this.colors = {
            black: "black",
            white: "white",
        }

        this.player1Color = this.colors.white;
        this.player2Color = this.colors.black;

        this.board = new Board();
        this.cpu = new Computer(this.player2Color);
        this.screen = new ScreenDoms(this.player1Color, this.player2Color);
        this.player1 = new Player();
        this.player2 = new Computer(this.player2Color);
        this.currentPlayer;
    }

    start() {
        const self = this;
        this.screen.setRestartBtn(function() {self.initialize();});
        this.initialize();
    }

    initialize() {
        // MYMEMO: この依存をなくしたい
        clearTimeout(this.player2.timer);
        // MYMEMO: 先攻、後攻選べるように。
        this.currentPlayer = this.player2;
        this.screen.initializeScreen();
        const self = this;
        this.board.generate(this.screen, function(e) {self.clickCell(e)});
        this.putInitialStones();
        // MYMEMO: ここでendTurnしないようにしたい。どちらが先行か分かりづらいので
        this.endTurn();
    }

    putInitialStones() {
        this.putStone(3, 3, this.colors.black);
        this.putStone(4, 4, this.colors.black);
        this.putStone(3, 4, this.colors.white);
        this.putStone(4, 3, this.colors.white);
    }

    player1Act(i, j) {
        if (this.currentPlayer !== this.player1) return;
        const result = this.flipStones(i, j, this.player1Color);
        if (result) this.endTurn();
    }

    player2Act(i, j) {
        if (this.currentPlayer !== this.player2) return;
        const result = this.flipStones(i, j, this.player2Color);
        if (result) this.endTurn();
    }

    endTurn() {
        const scores = this.board.calcScore();
        this.screen.updateScoreInfo(scores);
        this.judge(scores);
        this.currentPlayer.play(this.board, this);
    }

    clickCell(e) {
        const id = e.target.id;
        const i = parseInt(id.charAt(4));
        const j = parseInt(id.charAt(5));
        this.player1Act(i, j);
    }

    flipStones(i, j, colorName) {
        let result = false;
        if (i < 0 || j < 0) return result;

        const flipped = this.board.getFlipCells(i, j, colorName);

        if (flipped.length > 0) {
            for (let k = 0; k < flipped.length; k++) {
                this.putStone(flipped[k][0], flipped[k][1], colorName);
            }
            this.putStone(i, j, colorName);
            result = true;
        }

        return result;
    }

    putStone(i, j, colorName) {
        this.screen.putStone(i, j, colorName)
        this.board.putStone(i, j, colorName);
    }

    judge(scores) {
        const canFlipBlack = this.board.canFlip(this.colors.black);
        const canFlipWhite = this.board.canFlip(this.colors.white);

        const allCellsFilled = scores.black + scores.white === 64;

        if (allCellsFilled || !(canFlipBlack || canFlipWhite)) {
            // MYMEMO: 結果をちゃんと表示したい
            this.screen.showMessage("ゲームセット");
        } else if (!canFlipBlack) {
            // MYMEMO: しばらくしたらメッセージを消したい
            this.screen.showMessage("黒スキップ");
            this.currentPlayer = this.player1Color === "black" ? this.player2 : this.player1;
        } else if (!canFlipWhite) {
            // MYMEMO: しばらくしたらメッセージを消したい
            this.screen.showMessage("白スキップ");
            this.currentPlayer = this.player1Color === "white" ? this.player2 : this.player1;
        } else {
            this.changeCurrentPlayer();
        }
    }

    changeCurrentPlayer() {
        this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
    }
}

class Board {
    constructor() {
        this.cells = [];
        this.boardSize = 8;

        this.empty = 0;
        this.colorValues = {
            black: 1,
            white: 2,
        };
    }

    generate(screen, func) {
        screen.generateBoard(this.boardSize, func);
        for (let i = 0; i < this.boardSize; i++) {
            this.cells[i] = [this.empty, this.empty, this.empty, this.empty, this.empty, this.empty, this.empty, this.empty];
        }
    }

    putStone(i, j, colorName) {
        this.cells[i][j] = this.colorValues[colorName];
    }

    calcScore() {
        let scoreBlack = 0;
        let scoreWhite = 0;
        for (let x = 0; x < this.boardSize; x++) {
            for (let y = 0; y < this.boardSize; y++) {
                switch (this.cells[x][y]) {
                    case this.colorValues.black:
                        scoreBlack++;
                        break;
                    case this.colorValues.white:
                        scoreWhite++;
                        break;
                }
            }
        }
        return {
            black: scoreBlack,
            white: scoreWhite,
        };
    }

    copyCells() {
        const tmpCells = JSON.parse(JSON.stringify(this.cells));
        return tmpCells;
    }

    canFlip(colorName) {
        let result = false;

        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const flipped = this.getFlipCells(x, y, colorName);
                if (flipped.length > 0) {
                    result = true;
                }
            }
        }

        return result;
    }

    getFlipCells(i, j, colorName) {
        const color = this.colorValues[colorName];
        const stoneAlreadyExists = this.cells[i][j] !== this.empty;
        if (stoneAlreadyExists) return [];

        const directions = [
            [1, 1],
            [1, 0],
            [1, -1],
            [0, 1],
            [0, -1],
            [-1, 1],
            [-1, 0],
            [-1, -1],
        ];
        const result = [];
        // MYMEMO: refactor, foreach?
        for (let p = 0; p < directions.length; p++) {
            const flipped = this.getFlipCellsOneDir(i, j, directions[p][0], directions[p][1], color);
            result.push(...flipped);
        }
        return result;
    }

    getFlipCellsOneDir(i, j, dx, dy, color) {
        let x = i + dx;
        let y = j + dy;

        const xOutOfBound = x < 0 || x > (this.boardSize - 1);
        const yOutOfBound = y < 0 || y > (this.boardSize - 1);
        if (xOutOfBound || yOutOfBound) return [];

        const sameColor = this.cells[x][y] === color;
        const emptyCell = this.cells[x][y] === this.empty;
        if (sameColor || emptyCell) return [];

        const flipped = [];
        flipped.push([x, y]);

        while (true) {
            x += dx;
            y += dy;

            const xOutOfBound = x < 0 || x > (this.boardSize - 1);
            const yOutOfBound = y < 0 || y > (this.boardSize - 1);
            if (xOutOfBound || yOutOfBound) return [];
            const emptyCell = this.cells[x][y] === this.empty;
            if (emptyCell) return [];

            const sameColor = this.cells[x][y] === color;
            if (sameColor) {
                return flipped;
            } else {
                flipped.push([x, y]);
            }
        }
    }
}

class Computer {
    constructor(colorName) {
        this.weightData = [
            [30, -12, 0, -1, -1, 0, -12, 30],
            [-12, -15, -3, -3, -3, -3, -15, -12],
            [0, -3, 0, -1, -1, 0, -3, 0],
            [-1, -3, -1, -1, -1, -1, -3, -1],
            [-1, -3, -1, -1, -1, -1, -3, -1],
            [0, -3, 0, -1, -1, 0, -3, 0],
            [-12, -15, -3, -3, -3, -3, -15, -12],
            [30, -12, 0, -1, -1, 0, -12, 30],
        ];

        this.colorName = colorName;
        this.colorValues = {
            black: 1,
            white: 2,
        };
        this.timer;
    }

    // MYMEMO: decouple cells
    play(board, game) {
        let highScore = -1000;
        let px = -1;
        let py = -1;

        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const tmpCells = board.copyCells();
                const flipped = board.getFlipCells(x, y, this.colorName);
                if (flipped.length > 0) {
                    for (var i = 0; i < flipped.length; i++) {
                        const p = flipped[i][0];
                        const q = flipped[i][1];
                        tmpCells[p][q] = this.colorValues[this.colorName];
                        tmpCells[x][y] = this.colorValues[this.colorName];
                    }
                    const score = this.calcWeightData(tmpCells);
                    if (score > highScore) {
                        highScore = score;
                        px = x;
                        py = y;
                    }
                }
            }
        }

        this.timer = setTimeout(
            () => {game.player2Act(px, py);},
            750,
        );
    }

    calcWeightData(tmpCells) {
        let score = 0;
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if (tmpCells[x][y] === this.colorValues[this.colorName]) {
                    score += this.weightData[x][y];
                }
            }
        }
        return score;
    }
}

class Player {
    play() {
        return;
    }
}

class ScreenDoms {
    constructor(player1Color, player2Color) {
        this.doms = {
            // select1: document.getElementById("select1"),
            // MYMEMO: player1ColorName
            userInfoColor: document.getElementById("player_info_color"),
            // MYMEMO: player2ColorName
            cpuInfoColor: document.getElementById("cpu_info_color"),
            // MYMEMO: player1Score
            userInfo: document.getElementById("player_info_num"),
            // MYMEMO: player2Score
            cpuInfo: document.getElementById("cpu_info_num"),
            board: document.getElementById("board"),
            clearMessage: document.getElementById("clear-message"),
            restartBtn: document.getElementById("restart-game"),
        };

        this.player1Color = player1Color;
        this.player2Color = player2Color;
    }

    initializeScreen() {
        const parent = this.doms.board
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        this.doms.userInfoColor.textContent = this.player1Color === "black" ? "黒" : "白";
        this.doms.cpuInfoColor.textContent = this.player2Color === "black" ? "黒" : "白";
        this.doms.userInfo.textContent = "";
        this.doms.cpuInfo.textContent = "";
        this.doms.clearMessage.textContent = "";
    }

    showMessage(message) {
        this.doms.clearMessage.textContent = message;
        // MYMEMO: 本ではここでメッセージクリアのタイムアウト
    }

    updateScoreInfo(scores) {
        this.doms.userInfo.textContent = scores[this.player1Color];
        this.doms.cpuInfo.textContent = scores[this.player2Color];
    }

    putStone(i, j, colorName) {
        const cell = document.getElementById("cell" + i + j);
        // MYMEMO: cssを使うように
        cell.textContent = "●";
        // MYMEMO: classList使いたい
        cell.className = "cell " + colorName;
    }

    setRestartBtn(func) {
        this.doms.restartBtn.onclick = func;
    }

    generateBoard(boardSize, func) {
        for (let i = 0; i < boardSize; i++) {
            const tr = document.createElement('tr');
            for (let j = 0; j < boardSize; j++) {
                const td = document.createElement('td');
                td.className = 'cell';
                td.id = 'cell' + i + j;
                td.onclick = func;
                tr.appendChild(td);
            }
            this.doms.board.appendChild(tr);
        }
    }
}

module.exports = {
    Reversi,
    Board,
    Computer,
    ScreenDoms,
};
