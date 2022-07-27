window.addEventListener("load", () => {
    "use strict";
    const game = new Reversible();
    game.initializeGame();



    let userTurn = false;




    // function initializeGame() {
    //   prepareSelectBoxes();
    //   activateEventListeners();

    // //   function prepareSelectBox() {
    // //     for (let i = 1; i <= 50; i++) {
    // //       const option = document.createElement('option');
    // //       option.value = i;
    // //       option.innerText = i;
    // //       doms.select1.append(option);
    // //     }
    // //   }

    // //   function activateEventListeners() {
    // //     doms.helperBtn.addEventListener("click", firstStep);
    // //     doms.difficulty1.addEventListener("click", () => {
    // //       changeDifficulty(config.difficulty.easy);
    // //       restartGame();
    // //     });
    // //     doms.difficulty2.addEventListener("click", () => {
    // //       changeDifficulty(config.difficulty.medium);
    // //       restartGame();
    // //     });
    // //     doms.difficulty3.addEventListener("click", () => {
    // //       changeDifficulty(config.difficulty.hard);
    // //       restartGame();
    // //     });
    // //     doms.plowBtn.addEventListener("click", plowMode);
    // //     doms.acornBtn.addEventListener("click", acornMode);
    // //     document.addEventListener("keydown", changeClickMode);
    // //     doms.select1.addEventListener("input", () => {
    // //       doms.inputInfo.textContent = `どんぐり${Math.floor(doms.select1.value * doms.select1.value * difficultyValue)}個で難易度${difficultyName}`;
    // //     });
    // //   }
    // }
    // function restartGame() {
    //   resetContents();
    //   resetBoard();
    //   const acorns = [];
    //   buryAcorns();
    //   countNearbyAcorns();

    //   function resetContents() {
    //     tiles = [];
    //     gameInAction = true; // リファクタ removeEventListenerで代替できるか？
    //     isFirstClick = true;
    //     clearInterval(gameTimer);
    //     doms.timer.textContent = `00:00:00`;
    //     doms.showSettingsCheck.checked = false;
    //     doms.helperBtn.className = "";
    //     doms.helperBtnMessage.textContent = "";
    //     remainingAcorns = doms.select2.value;
    //     changeRemainingAcorns();
    //     doms.clearMessage.textContent = "";
    //     doms.clearImage.className = "hidden squirrel-happy";
    //   }
    //   function resetBoard() {
    //     doms.board.innerHTML = "";
    //     doms.board.className = "minesweeper-board";
    //     const sides = Number(doms.select1.value);
    //     for (let i = 0; i < sides; i++) {
    //       const tr = document.createElement("tr");
    //       for (let j = 0; j < sides; j++) {
    //         const index = i * sides + j;
    //         const td = document.createElement("td");
    //         td.className = "tile-closed";
    //         td.index = index;
    //         td.id = `tile${index}`;
    //         td.style.height = `${65 / sides}vmin`;
    //         td.style.width = `${65 / sides}vmin`;
    //         td.onclick = click;
    //         tr.appendChild(td);
    //         tiles.push(td);
    //       }
    //       doms.board.appendChild(tr);
    //     }
    //   }
    // }
    // function click(e) {
    //   if (isFirstClick) {
    //     gameTimer = startTimer(gameTimer);
    //     isFirstClick = false;
    //   }
    //   if (isAcornMode) {
    //     rightClick(e);
    //     return null;
    //   }
    //   if (!gameInAction) {
    //     return null;
    //   }
    //   const clicked = e.srcElement;
    //   if (clicked.className == "tile-open" || clicked.className == "acorn-mark") {
    //     return null;
    //   } else if (clicked.value == "A") {
    //     clicked.className = "tile-broken";
    //     gameOver();
    //   } else if (clicked.value != null) {
    //     clicked.className = "tile-open";
    //     clicked.style.fontSize = `${35 / Number(doms.select1.value)}vmin`;
    //     judge();
    //   } else if (clicked.value == null) {
    //     clicked.className = "tile-open";
    //     clicked.style.fontSize = `${35 / Number(doms.select1.value)}vmin`;
    //     clickBlank(clicked);
    //   }
    // }
    // function judge() { // 判定結果だけ返すように変える
    //   const closedTiles = document.getElementsByClassName("tile-closed");
    //   if (closedTiles.length == 0 && remainingAcorns == 0) {
    //     clearInterval(gameTimer);
    //     doms.clearMessage.textContent = "おめでとう！リスも大喜び";
    //     doms.clearImage.className = "squirrel-happy";
    //     doms.board.className = "minesweeper-board-clear";
    //   }
    // }
});

class Reversible {
    constructor() {
        this.doms = {
            restartBtn: document.getElementById("restart-game"),
            // select1: document.getElementById("select1"),
            // timer: document.getElementById("timer"),
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
        this.userTurn = true;
        this.numBlack = 0;
        this.numWhite = 0;
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
        this.calcScore();
        this.judge();
    }

    clickCell(e, cls) {
        if (!cls.userTurn) return;
        const id = e.target.id;
        const i = parseInt(id.charAt(4));
        const j = parseInt(id.charAt(5));

        const flipped = cls.getFlipCells(i, j, this.black);

        if (flipped.length > 0) {
            for (let k = 0; k < flipped.length; k++) {
                this.putStone(flipped[k][0], flipped[k][1], this.black);
            }
            this.putStone(i, j, this.black);
            this.calcScore();
            this.judge();
        }
    }

    refreshBoard() {
        const parent = this.doms.board
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }


    putStone(i, j, color) {
        const cell = document.getElementById("cell" + i + j);
        // MYMEMO: cssを使うように
        cell.textContent = "●";
        cell.className = "cell " + (color === this.black ? "black" : "white");
        this.cells[i][j] = color;
    }

    calcScore() {
        this.numBlack = 0;
        this.numWhite = 0;
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                switch (this.cells[x][y]) {
                    case this.black:
                        this.numBlack++;
                        break;
                    case this.white:
                        this.numWhite++;
                        break;
                }
            }
        }
        this.doms.blackInfo.textContent = this.numBlack;
        this.doms.whiteInfo.textContent = this.numWhite;
    }

    judge() {
        const canFlipBlack = this.canFlip(this.black);
        const canFlipWhite = this.canFlip(this.white);

        const allCellsFilled = this.numBlack + this.numWhite === 64;

        if (allCellsFilled || !(canFlipBlack || canFlipWhite)) {
            this.showMessage("ゲームセット");
        } else if (!canFlipBlack) {
            showMessage("黒スキップ");
            this.userTurn = false;
        } else if (!canFlipWhite) {
            showMessage("白スキップ");
            this.userTurn = true;
        } else {
            this.userTurn = !this.userTurn;
        }

        const cls = this;
        if (!this.userTurn) {
            setTimeout(function() {cls.think(cls)}, 750);
        }
    }

    // MYMEMO: 効率化できるかも
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
            const emptyCell = this.cells[x][y] === this.empty;
            if (xOutOfBound || yOutOfBound || emptyCell) return [];

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
                const tmpCells = cls.copyCells();
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
            const flipped = cls.getFlipCells(px, py, cls.white);
            if (flipped.length > 0) {
                for (let k = 0; k < flipped.length; k++) {
                    cls.putStone(flipped[k][0], flipped[k][1], cls.white);
                }
            }
            cls.putStone(px, py, cls.white);
        }
        cls.calcScore();
        cls.judge();
    }

    copyCells() {
        const tmpCells = [];
        // MYMEMO: tmpCells = this.cellsではダメなのか？
        for (let x = 0; x < 8; x++) {
            tmpCells[x] = [];
            for (let y = 0; y < 8; y++) {
                tmpCells[x][y] = this.cells[x][y];
            }
        }
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

  // utils
//   function startTimer(gameTimer) {
//     let elapsedTime = 0;
//     gameTimer = setInterval(() => {
//       elapsedTime++;
//       let hour = Math.floor(elapsedTime / 3600);
//       let minute = Math.floor(elapsedTime / 60);
//       let second = Math.floor(elapsedTime % 60);
//       hour = ("0" + hour).slice(-2);
//       minute = ("0" + minute).slice(-2);
//       second = ("0" + second).slice(-2);
//       document.getElementById("timer").textContent = `${hour}:${minute}:${second}`;
//     }, 1000);
//     return gameTimer;
//   }
