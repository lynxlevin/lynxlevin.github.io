window.addEventListener("load", () => {
    "use strict";
    const game = new Reversi();
    game.start();
});

class Reversi {
    constructor() {
        this.cpuTimer;

        this.colors = {
            black: 1,
            white: 2,
        };
        this.colorNames = {
            black: "black",
            white: "white",
        }
        // MYMEMO: player class を作るまでの暫定
        this.userColor = this.colorNames.white;
        this.cpuColor = this.colorNames.black;

        // MYMEMO: 先攻、後攻選べるように。
        this.userTurn = false;

        this.board = new Board();
        this.cpu = new Computer(this.colors[this.cpuColor], this.cpuColor);
        this.screen = new ScreenDoms(this.userColor, this.cpuColor);
    }

    start() {
        const self = this;
        this.screen.setRestartBtn(function() {self.initialize();});
        this.initialize();
    }

    initialize() {
        clearTimeout(this.cpuTimer);
        this.userTurn = false;
        this.screen.initializeScreen();
        const self = this;
        this.board.generate(this.screen, function(e) {self.clickCell(e)});
        this.putInitialStones();
        this.endTurn();
    }

    putInitialStones() {
        this.putStone(3, 3, this.colorNames.black);
        this.putStone(4, 4, this.colorNames.black);
        this.putStone(3, 4, this.colorNames.white);
        this.putStone(4, 3, this.colorNames.white);
    }

    endTurn() {
        const scores = this.board.calcScore();
        this.screen.updateScoreInfo(scores);
        this.judge(scores);
        const self = this;
        if (!self.userTurn) {
            // MYMEMO: Computer classに持っていきたい
            this.cpuTimer = setTimeout(function() {
                const target = self.cpu.think(self.board);
                self.flipStones(target.i, target.j, target.colorName);
                self.endTurn();
            }, 750);
        }
    }

    clickCell(e) {
        if (!this.userTurn) return;
        const id = e.target.id;
        const i = parseInt(id.charAt(4));
        const j = parseInt(id.charAt(5));
        const result = this.flipStones(i, j, this.userColor);
        if (result) this.endTurn();
    }

    flipStones(i, j, colorName) {
        if (i < 0 || j < 0) return;
        const color = this.colors[colorName];

        let result = false;
        const flipped = this.board.getFlipCells(i, j, color);

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
            this.userTurn = this.userColor === "black" ? false : true;
        } else if (!canFlipWhite) {
            // MYMEMO: しばらくしたらメッセージを消したい
            this.screen.showMessage("白スキップ");
            this.userTurn = this.userColor === "white" ? false : true;
        } else {
            this.userTurn = !this.userTurn;
        }
    }
}

class Board {
    constructor() {
        this.cells = [];
        this.boardSize = 8;

        this.empty = 0;
        this.colors = {
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
        this.cells[i][j] = this.colors[colorName];
    }

    calcScore() {
        let scoreBlack = 0;
        let scoreWhite = 0;
        for (let x = 0; x < this.boardSize; x++) {
            for (let y = 0; y < this.boardSize; y++) {
                switch (this.cells[x][y]) {
                    case this.colors.black:
                        scoreBlack++;
                        break;
                    case this.colors.white:
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

    canFlip(color) {
        let result = false;

        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const flipped = this.getFlipCells(x, y, color);
                if (flipped.length > 0) {
                    result = true;
                }
            }
        }

        return result;
    }

    getFlipCells(i, j, color) {
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
    constructor(color, colorName) {
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

        this.color = color;
        this.colorName = colorName;
    }

    // MYMEMO: decouple board
    think(board) {
        let highScore = -1000;
        let px = -1;
        let py = -1;

        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const tmpCells = board.copyCells();
                const flipped = board.getFlipCells(x, y, this.color);
                if (flipped.length > 0) {
                    for (var i = 0; i < flipped.length; i++) {
                        const p = flipped[i][0];
                        const q = flipped[i][1];
                        tmpCells[p][q] = this.color;
                        tmpCells[x][y] = this.color;
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

        return ({i: px, j: py, colorName: this.colorName});
    }

    calcWeightData(tmpCells) {
        let score = 0;
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if (tmpCells[x][y] === this.color) {
                    score += this.weightData[x][y];
                }
            }
        }
        return score;
    }
}

class ScreenDoms {
    constructor(userColor, cpuColor) {
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

        this.userColor = userColor;
        this.cpuColor = cpuColor;
    }

    initializeScreen() {
        const parent = this.doms.board
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        this.doms.userInfoColor.textContent = this.userColor === "black" ? "黒" : "白";
        this.doms.cpuInfoColor.textContent = this.cpuColor === "black" ? "黒" : "白";
        this.doms.userInfo.textContent = "";
        this.doms.cpuInfo.textContent = "";
        this.doms.clearMessage.textContent = "";
    }

    showMessage(message) {
        this.doms.clearMessage.textContent = message;
        // MYMEMO: 本ではここでメッセージクリアのタイムアウト
    }

    updateScoreInfo(scores) {
        this.doms.userInfo.textContent = scores[this.userColor];
        this.doms.cpuInfo.textContent = scores[this.cpuColor];
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
