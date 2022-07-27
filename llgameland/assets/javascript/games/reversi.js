window.addEventListener("load", () => {
    "use strict";
    const game = new Reversi();
    game.initializeGame();
    // MYMEMO: refactor
    const restartBtn = document.getElementById("restart-game");
    restartBtn.onclick = (function() {const game = new Reversi(); game.initializeGame();});
});

class Reversi {
    constructor() {
        this.doms = {
            // select1: document.getElementById("select1"),
            blackInfo: document.getElementById("black_info"),
            whiteInfo: document.getElementById("white_info"),
            board: document.getElementById("board"),
            clearMessage: document.getElementById("clear-message"),
        };

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
        this.empty = 0;
        this.black = 1;
        this.white = 2;

        this.cells = [];
        // MYMEMO: 先攻、後攻選べるように。そうすると、自分の色を変える方がいいかも
        this.userTurn = false;
    }

    initializeGame() {
        this.refreshBoard();
        for (let i = 0; i < 8; i++) {
            const tr = document.createElement('tr');
            // MYMEMO: refactor
            this.cells[i] = [this.empty, this.empty, this.empty, this.empty, this.empty, this.empty, this.empty, this.empty];
            for (let j = 0; j < 8; j++) {
                const td = document.createElement('td');
                td.className = 'cell';
                td.id = 'cell' + i + j;
                const self = this;
                td.onclick = (function(e) {self.clickCell(e, self)});
                tr.appendChild(td);
            }
            this.doms.board.appendChild(tr);
        }
        this.putStone(3, 3, this.black);
        this.putStone(4, 4, this.black);
        this.putStone(3, 4, this.white);
        this.putStone(4, 3, this.white);
        this.endTurn();
    }

    refreshBoard() {
        const parent = this.doms.board
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    endTurn() {
        const scores = this.calcScore(this.cells);
        this.updateScoreInfo(scores);
        this.judge(scores);
        const self = this;
        if (!self.userTurn) {
            setTimeout(function() {self.think(self)}, 750);
        }
    }

    clickCell(e, cls) {
        if (!cls.userTurn) return;
        const id = e.target.id;
        const i = parseInt(id.charAt(4));
        const j = parseInt(id.charAt(5));
        const result = cls.flipStones(i, j, cls.black, cls);
        if (result) cls.endTurn();
    }

    flipStones(i, j, color, cls) {
        let result = false;
        const flipped = cls.getFlipCells(i, j, color);

        if (flipped.length > 0) {
            for (let k = 0; k < flipped.length; k++) {
                cls.putStone(flipped[k][0], flipped[k][1], color);
            }
            cls.putStone(i, j, color);
            result = true;
        }

        return result;
    }

    putStone(i, j, color) {
        const cell = document.getElementById("cell" + i + j);
        // MYMEMO: cssを使うように
        cell.textContent = "●";
        cell.className = "cell " + (color === this.black ? "black" : "white");
        this.cells[i][j] = color;
    }

    calcScore(cells) {
        let scoreBlack = 0;
        let scoreWhite = 0;
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                switch (cells[x][y]) {
                    case this.black:
                        scoreBlack++;
                        break;
                    case this.white:
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

    updateScoreInfo(scores) {
        this.doms.blackInfo.textContent = scores.black;
        this.doms.whiteInfo.textContent = scores.white;
    }

    judge(scores) {
        const canFlipBlack = this.canFlip(this.black);
        const canFlipWhite = this.canFlip(this.white);

        const allCellsFilled = scores.black + scores.white === 64;

        if (allCellsFilled || !(canFlipBlack || canFlipWhite)) {
            // MYMEMO: 結果をちゃんと表示したい
            this.showMessage("ゲームセット");
        } else if (!canFlipBlack) {
            // MYMEMO: しばらくしたらメッセージを消したい
            this.showMessage("黒スキップ");
            this.userTurn = false;
        } else if (!canFlipWhite) {
            // MYMEMO: しばらくしたらメッセージを消したい
            this.showMessage("白スキップ");
            this.userTurn = true;
        } else {
            this.userTurn = !this.userTurn;
        }
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

        const xOutOfBound = x < 0 || x > 7;
        const yOutOfBound = y < 0 || y > 7;
        if (xOutOfBound || yOutOfBound) return [];

        const sameColor = this.cells[x][y] === color;
        const emptyCell = this.cells[x][y] === this.empty;
        if (sameColor || emptyCell) return [];

        const flipped = [];
        flipped.push([x, y]);

        while (true) {
            x += dx;
            y += dy;

            const xOutOfBound = x < 0 || x > 7;
            const yOutOfBound = y < 0 || y > 7;
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

    showMessage(message) {
        this.doms.clearMessage.textContent = message;
        // MYMEMO: 本ではここでメッセージクリアのタイムアウト
    }

    think(cls) {
        let highScore = -1000;
        let px = -1;
        let py = -1;

        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const tmpCells = cls.copyCells(cls.cells);
                const flipped = cls.getFlipCells(x, y, cls.white);
                if (flipped.length > 0) {
                    for (var i = 0; i < flipped.length; i++) {
                        const p = flipped[i][0];
                        const q = flipped[i][1];
                        tmpCells[p][q] = cls.white;
                        tmpCells[x][y] = cls.white;
                    }
                    const score = cls.calcWeightData(tmpCells);
                    if (score > highScore) {
                        highScore = score;
                        px = x;
                        py = y;
                    }
                }
            }
        }
        if (px >= 0 && py >= 0) {
            cls.flipStones(px, py, cls.white, cls);
        }
        cls.endTurn();
    }

    copyCells(cells) {
        const tmpCells = JSON.parse(JSON.stringify(cells));
        return tmpCells;
    }

    calcWeightData(tmpCells) {
        let score = 0;
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if (tmpCells[x][y] === this.white) {
                    score += this.weightData[x][y];
                }
            }
        }
        return score;
    }
}

module.exports = Reversi;