window.addEventListener("load", () => {
  "use strict";
  const config = getConfig();
  const doms = getDoms();

  let tiles = [];
  let isAcornMode = false;
  let gameTimer, isFirstClick, gameInAction, remainingAcorns, difficultyName, difficultyValue;
  initializeGame();
  restartGame();
  doms.restartBtn.onclick = restartGame;

  function initializeGame() {
    activateEventListeners();
    changeDifficulty(config.difficulty.easy);

    function activateEventListeners() {
      doms.helperBtn.addEventListener("click", firstStep);
      doms.difficulty1.addEventListener("click", () => {
        changeDifficulty(config.difficulty.easy);
        restartGame();
      });
      doms.difficulty2.addEventListener("click", () => {
        changeDifficulty(config.difficulty.medium);
        restartGame();
      });
      doms.difficulty3.addEventListener("click", () => {
        changeDifficulty(config.difficulty.hard);
        restartGame();
      });
      doms.plowBtn.addEventListener("click", plowMode);
      doms.acornBtn.addEventListener("click", acornMode);
      document.addEventListener("keydown", changeClickMode);
      doms.select1.addEventListener("input", () => {
        doms.inputInfo.textContent = `どんぐり${Math.floor(doms.select1.value * doms.select1.value * difficultyValue)}個で難易度${difficultyName}`;
      });
    }
    function changeDifficulty(diff) {
      difficultyName = diff.name;
      doms.select1.value = diff.select1;
      doms.select2.value = diff.select2;
      difficultyValue = diff.difficultyValue;
      doms.inputInfo.textContent = "";
    }
  }
  function restartGame() {
    resetContents();
    resetBoard();
    const acorns = [];
    buryAcorns();
    countNearbyAcorns();

    function resetContents() {
      tiles = [];
      gameInAction = true; // リファクタ removeEventListenerで代替できるか？
      isFirstClick = true;
      clearInterval(gameTimer);
      doms.timer.textContent = `00:00:00`;
      doms.showSettingsCheck.checked = false;
      doms.helperBtn.className = "";
      doms.helperBtnMessage.textContent = "";
      remainingAcorns = doms.select2.value;
      changeRemainingAcorns();
      doms.clearMessage.textContent = "";
      doms.clearImage.className = "hidden squirrel-happy";
    }
    function resetBoard() {
      doms.board.innerHTML = "";
      doms.board.className = "minesweeper-board";
      const sides = Number(doms.select1.value);
      for (let i = 0; i < sides; i++) {
        const tr = document.createElement("tr");
        for (let j = 0; j < sides; j++) {
          const index = i * sides + j;
          const td = document.createElement("td");
          td.className = "tile-closed";
          td.index = index;
          td.id = `tile${index}`;
          td.style.height = `${65 / sides}vmin`;
          td.style.width = `${65 / sides}vmin`;
          td.onclick = click;
          tr.appendChild(td);
          tiles.push(td);
        }
        doms.board.appendChild(tr);
      }
    }
    function buryAcorns() {
      const tileIndexes = [];
      for (let i = 0; i < Number(doms.select1.value) ** 2; i++) {
        tileIndexes.push(i);
      }
      for (let i = 0; i < doms.select2.value; i++) {
        const random = Math.floor(Math.random() * tileIndexes.length);
        acorns.push(tileIndexes[random]);
        tileIndexes.splice(random, 1);
      }
      acorns.forEach((acorn) => {
        tiles[acorn].value = "A";
      });
    }
    function countNearbyAcorns() {
      tiles.forEach((tile, i) => {
        if (tile.value == "A") {
          return null;
        }
        const condition = (x) => { return acorns.includes(x); };
        const adjacentTilesWithAcorns = getConditionedAdjacentTiles(i, condition);
        const adjacentAcorns = adjacentTilesWithAcorns.length;
        if (adjacentAcorns != 0) {
          tile.textContent = adjacentAcorns;
          tile.value = adjacentAcorns;
        }
      });
    }
  }
  function click(e) {
    if (isFirstClick) {
      gameTimer = startTimer(gameTimer);
      isFirstClick = false;
    }
    if (isAcornMode) {
      rightClick(e);
      return null;
    }
    if (!gameInAction) {
      return null;
    }
    const clicked = e.srcElement;
    if (clicked.className == "tile-open" || clicked.className == "acorn-mark") {
      return null;
    } else if (clicked.value == "A") {
      clicked.className = "tile-broken";
      gameOver();
    } else if (clicked.value != null) {
      clicked.className = "tile-open";
      clicked.style.fontSize = `${35 / Number(doms.select1.value)}vmin`;
      judge();
    } else if (clicked.value == null) {
      clicked.className = "tile-open";
      clicked.style.fontSize = `${35 / Number(doms.select1.value)}vmin`;
      clickBlank(clicked);
    }
  }
  function clickBlank(clicked) {
    const sides = Number(doms.select1.value);
    const i = clicked.index;
    const condition = (x) => { return tiles[x].className != "tile-open"; };
    const array = getConditionedAdjacentTiles(i, condition);
    array.forEach(tile => {
      if (tile.className == "tile-open" || tile.className == "acorn-mark") return;
      tile.className = "tile-open";
      tile.style.fontSize = `${35 / sides}vmin`;
      if (tile.value == null) clickBlank(tile);
    });
    judge();
  }
  function rightClick(e) {
    const clicked = e.srcElement;
    if (!gameInAction || clicked.className === "tile-open") return;
    if (isFirstClick) {
      gameTimer = startTimer(gameTimer);
      isFirstClick = false;
    }
    if (clicked.className == "acorn-mark") {
      clicked.className = "tile-closed";
      remainingAcorns++;
      changeRemainingAcorns();
    } else {
      clicked.className = "acorn-mark";
      remainingAcorns--;
      changeRemainingAcorns();
      judge();
    }
  }
  function changeRemainingAcorns() {
    doms.info1.textContent = `残りのどんぐりの数 ${remainingAcorns}`;
  }
  function judge() { // 判定結果だけ返すように変える
    const closedTiles = document.getElementsByClassName("tile-closed");
    if (closedTiles.length == 0 && remainingAcorns == 0) {
      clearInterval(gameTimer);
      doms.clearMessage.textContent = "おめでとう！リスも大喜び";
      doms.clearImage.className = "squirrel-happy";
      doms.board.className = "minesweeper-board-clear";
    }
  }
  function gameOver() {
    clearInterval(gameTimer);
    doms.clearMessage.textContent = "どんぐり踏んじゃった";
    gameInAction = false;
  }
  function firstStep(e) {
    plowMode();
    doms.showSettingsCheck.checked = false;
    if (tiles.find(tile => tile.value == null) === undefined) {
      doms.helperBtnMessage.textContent = "ごめんなさい。どんぐりが多すぎて、お力になれません。";
      return;
    }
    e.srcElement.className = "hidden";
    const random = Math.floor(Math.random() * tiles.length);
    if (tiles[random].value == null) {
      tiles[random].click();
    } else {
      firstStep(e);
    }
  }
  function changeClickMode(e) {
    if (e.key == "z") {
      plowMode();
    } else if (e.key == "x") {
      acornMode();
    }
  }
  function plowMode() {
    isAcornMode = false;
    doms.plowBtn.className = "plow-btn game-btn-on";
    doms.acornBtn.className = "acorn-btn game-btn-off";
  }
  function acornMode() {
    isAcornMode = true;
    doms.plowBtn.className = "plow-btn game-btn-off";
    doms.acornBtn.className = "acorn-btn game-btn-on";
  }

  /**
   * 条件に合致した隣接マスの配列を返却
   * @param {number} centerIndex - このマスの隣接マスを検証する
   * @param {Function} condition - 検証の条件
   * @return {array} array - 条件に合致した隣接マスの配列
   */
  function getConditionedAdjacentTiles(centerIndex, condition) {
    const array = [];
    const sides = Number(doms.select1.value);
    const isTopMost = Math.floor(centerIndex / sides) == 0;
    const isBottomMost = Math.floor(centerIndex / sides) == (sides - 1);
    const isLeftMost = Math.floor(centerIndex % sides) == 0;
    const isRightMost = Math.floor(centerIndex % sides) == (sides - 1);
    // 一番上でない → 上を見る
    if (!isTopMost && condition(centerIndex - sides)) array.push(tiles[centerIndex - sides]);
    // 一番下でない → 下を見る
    if (!isBottomMost && condition(centerIndex + sides)) array.push(tiles[centerIndex + sides]);
    // 一番左でない → 左を見る
    if (!isLeftMost && condition(centerIndex - 1)) array.push(tiles[centerIndex - 1]);
    // 一番右でない → 右を見る
    if (!isRightMost && condition(centerIndex + 1)) array.push(tiles[centerIndex + 1]);
    // 一番上でなく、左でもない → 左上を見る
    if (!isTopMost && !isLeftMost && condition(centerIndex - sides - 1)) array.push(tiles[centerIndex - sides - 1]);
    // 一番上でなく、右でもない → 右上を見る
    if (!isTopMost && !isRightMost && condition(centerIndex - sides + 1)) array.push(tiles[centerIndex - sides + 1]);
    // 一番下でなく、左でもない → 左下を見る
    if (!isBottomMost && !isLeftMost && condition(centerIndex + sides - 1)) array.push(tiles[centerIndex + sides - 1]);
    // 一番下でなく、右でもない → 右下を見る
    if (!isBottomMost && !isRightMost && condition(centerIndex + sides + 1)) array.push(tiles[centerIndex + sides + 1]);
    return array;
  }
  function getConfig() {
    return {
      difficulty: {
        easy: {
          name: "EASY",
          select1: 9,
          select2: 10,
          difficultyValue: 0.123
        },
        medium: {
          name: "MEDIUM",
          select1: 16,
          select2: 40,
          difficultyValue: 0.15625
        },
        hard: {
          name: "HARD",
          select1: 22,
          select2: 99,
          difficultyValue: 0.2045
        },
      },
    };
  };
  function getDoms() {
    return {
      select1: document.getElementById("select1"),
      select2: document.getElementById("select2"),
      helperBtn: document.getElementById("helper-btn"),
      difficulty1: document.getElementById("difficulty1"),
      difficulty2: document.getElementById("difficulty2"),
      difficulty3: document.getElementById("difficulty3"),
      inputInfo: document.getElementById("input-info"),
      timer: document.getElementById("timer"),
      helperBtnMessage: document.getElementById("helper-btn-message"),
      clearMessage: document.getElementById("clear-message"),
      clearImage: document.getElementById("clear-image"),
      info1: document.getElementById("info1"),
      board: document.getElementById("board"),
      showSettingsCheck: document.getElementById("show-settings-check"),
      plowBtn: document.getElementById("game-btn1"),
      acornBtn: document.getElementById("game-btn2"),
      restartBtn: document.getElementById("restart-game"),
    };
  };
});

// utils
function startTimer(gameTimer) {
  let elapsedTime = 0;
  gameTimer = setInterval(() => {
    elapsedTime++;
    let hour = Math.floor(elapsedTime / 3600);
    let minute = Math.floor(elapsedTime / 60);
    let second = Math.floor(elapsedTime % 60);
    hour = ("0" + hour).slice(-2);
    minute = ("0" + minute).slice(-2);
    second = ("0" + second).slice(-2);
    document.getElementById("timer").textContent = `${hour}:${minute}:${second}`;
  }, 1000);
  return gameTimer;
}
