window.addEventListener("load", () => {
    "use strict";
    const game = new Reversi();
    game.start();
    // MYMEMO: refactor
    const restartBtn = document.getElementById("restart-game");
    restartBtn.onclick = (function() {game.initialize();});
});

class Reversi {
    constructor() {
        this.board;
        this.cpu;

        this.cpuTimer;

        // MYMEMO: 表示を管理するクラスを作りたい
        this.doms = {
            // select1: document.getElementById("select1"),
            userInfoColor: document.getElementById("player_info_color"),
            cpuInfoColor: document.getElementById("cpu_info_color"),
            userInfo: document.getElementById("player_info_num"),
            cpuInfo: document.getElementById("cpu_info_num"),
            board: document.getElementById("board"),
            clearMessage: document.getElementById("clear-message"),
        };

        // MYMEMO: boardと二重で保持しているのをどうにかしたい
        this.colors = {
            black: 1,
            white: 2,
        };
        // MYMEMO: player class を作るまでの暫定
        this.userColor = "white";
        this.cpuColor = "black";

        // MYMEMO: 先攻、後攻選べるように。そうすると、自分の色を変える方がいいかも
        this.userTurn = false;
    }

    start() {
        this.board = new Board();
        this.cpu = new Computer(this.colors[this.cpuColor]);
        this.initialize();
    }

    initialize() {
        clearTimeout(this.cpuTimer);
        this.userTurn = false;
        this.clearScreen();
        this.doms.userInfoColor.textContent = this.userColor === "black" ? "黒" : "白";
        this.doms.cpuInfoColor.textContent = this.cpuColor === "black" ? "黒" : "白";
        this.board.generate(this.doms.board, this);
        this.putInitialStones();
        this.endTurn();
    }

    clearScreen() {
        const parent = this.doms.board
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        this.doms.userInfo.textContent = "";
        this.doms.cpuInfo.textContent = "";
        this.doms.clearMessage.textContent = "";
    }

    putInitialStones() {
        this.putStone(3, 3, this.colors.black);
        this.putStone(4, 4, this.colors.black);
        this.putStone(3, 4, this.colors.white);
        this.putStone(4, 3, this.colors.white);
    }

    endTurn() {
        const scores = this.board.calcScore();
        this.updateScoreInfo(scores);
        this.judge(scores);
        const self = this;
        if (!self.userTurn) {
            // MYMEMO: Computer classに持っていきたい
            this.cpuTimer = setTimeout(function() {
                const target = self.cpu.think(self.board);
                self.flipStones(target.i, target.j, target.color);
                self.endTurn();
            }, 750);
        }
    }

    clickCell(e) {
        if (!this.userTurn) return;
        const id = e.target.id;
        const i = parseInt(id.charAt(4));
        const j = parseInt(id.charAt(5));
        const result = this.flipStones(i, j, this.colors[this.userColor]);
        if (result) this.endTurn();
    }

    flipStones(i, j, color) {
        if (i < 0 || j < 0) return;

        let result = false;
        const flipped = this.board.getFlipCells(i, j, color);

        if (flipped.length > 0) {
            for (let k = 0; k < flipped.length; k++) {
                this.putStone(flipped[k][0], flipped[k][1], color);
            }
            this.putStone(i, j, color);
            result = true;
        }

        return result;
    }

    putStone(i, j, color) {
        const cell = document.getElementById("cell" + i + j);
        // MYMEMO: cssを使うように
        cell.textContent = "●";
        // MYMEMO: classList使いたい
        cell.className = "cell " + (color === this.colors.black ? "black" : "white");
        this.board.putStone(i, j, color);
    }

    updateScoreInfo(scores) {
        this.doms.userInfo.textContent = scores[this.userColor];
        this.doms.cpuInfo.textContent = scores[this.cpuColor];
    }

    judge(scores) {
        const canFlipBlack = this.board.canFlip(this.colors.black);
        const canFlipWhite = this.board.canFlip(this.colors.white);

        const allCellsFilled = scores.black + scores.white === 64;

        if (allCellsFilled || !(canFlipBlack || canFlipWhite)) {
            // MYMEMO: 結果をちゃんと表示したい
            this.showMessage("ゲームセット");
        } else if (!canFlipBlack) {
            // MYMEMO: しばらくしたらメッセージを消したい
            this.showMessage("黒スキップ");
            this.userTurn = this.userColor === "black" ? false : true;
        } else if (!canFlipWhite) {
            // MYMEMO: しばらくしたらメッセージを消したい
            this.showMessage("白スキップ");
            this.userTurn = this.userColor === "white" ? false : true;
        } else {
            this.userTurn = !this.userTurn;
        }
    }

    showMessage(message) {
        this.doms.clearMessage.textContent = message;
        // MYMEMO: 本ではここでメッセージクリアのタイムアウト
    }
}

class Board {
    constructor() {
        this.cells = [];
        this.boadSize = 8;

        this.empty = 0;
        this.colors = {
            black: 1,
            white: 2,
        }
    }

    generate(targetEl, game) {
        for (let i = 0; i < this.boadSize; i++) {
            const tr = document.createElement('tr');
            // MYMEMO: refactor
            this.cells[i] = [this.empty, this.empty, this.empty, this.empty, this.empty, this.empty, this.empty, this.empty];
            for (let j = 0; j < this.boadSize; j++) {
                const td = document.createElement('td');
                td.className = 'cell';
                td.id = 'cell' + i + j;
                td.onclick = (function(e) {game.clickCell(e)});
                tr.appendChild(td);
            }
            targetEl.appendChild(tr);
        }
    }

    putStone(i, j, color) {
        this.cells[i][j] = color;
    }

    calcScore() {
        let scoreBlack = 0;
        let scoreWhite = 0;
        for (let x = 0; x < this.boadSize; x++) {
            for (let y = 0; y < this.boadSize; y++) {
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

        const xOutOfBound = x < 0 || x > (this.boadSize - 1);
        const yOutOfBound = y < 0 || y > (this.boadSize - 1);
        if (xOutOfBound || yOutOfBound) return [];

        const sameColor = this.cells[x][y] === color;
        const emptyCell = this.cells[x][y] === this.empty;
        if (sameColor || emptyCell) return [];

        const flipped = [];
        flipped.push([x, y]);

        while (true) {
            x += dx;
            y += dy;

            const xOutOfBound = x < 0 || x > (this.boadSize - 1);
            const yOutOfBound = y < 0 || y > (this.boadSize - 1);
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
    constructor(color) {
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
    }

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

        return ({i: px, j: py, color: this.color});
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

module.exports = {
    Reversi,
    Board,
    Computer,
};
