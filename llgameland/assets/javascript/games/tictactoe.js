let count = 0;
let gameInAction = true;

window.addEventListener("load", () => {
  const gameRestartBtn = document.getElementById("restart-game");
  startGame();
  gameRestartBtn.onclick = startGame;
});

function startGame() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  gameInAction = true;
  document.getElementById("info1").textContent = "";
  count = 0;
  for (let i = 0 ; i < 3 ; i++) {
    const tr = document.createElement("tr");
    for (let j = 0 ; j < 3 ; j++) {
      const td = `
      <td class="cell" id="c${i}${j}"></td>`;
      tr.insertAdjacentHTML("beforeend", td);
    }
    board.appendChild(tr);
  }
  board.onclick = tickCell;
}
function tickCell(e) {
  if (e.target.textContent == "" && gameInAction) {
    count = ++count;
    e.target.textContent = (count % 2 == 0) ? "X" : "O";
    checkWinner(e);
  }
}
function checkWinner(e) {
  const row = e.target.id.slice(1,2);
  const column = e.target.id.slice(2,3);
  const cellrc = document.getElementById("c" + row + column).textContent;

  const cellr0 = document.getElementById("c" + row + "0").textContent;
  const cellr1 = document.getElementById("c" + row + "1").textContent;
  const cellr2 = document.getElementById("c" + row + "2").textContent;

  const cell0c = document.getElementById("c" + "0" + column).textContent;
  const cell1c = document.getElementById("c" + "1" + column).textContent;
  const cell2c = document.getElementById("c" + "2" + column).textContent;

  const cell00 = document.getElementById("c" + "0" + "0").textContent;
  const cell11 = document.getElementById("c" + "1" + "1").textContent;
  const cell22 = document.getElementById("c" + "2" + "2").textContent;

  const cell02 = document.getElementById("c" + "0" + "2").textContent;
  const cell20 = document.getElementById("c" + "2" + "0").textContent;

  switch (true) {
    case cellr0 == cellr1 && cellr0 == cellr2:
      endGame(cellrc); break;
    case cell0c == cell1c && cell0c == cell2c:
      endGame(cellrc); break;
    case row == column && (cell00 == cell11 && cell00 == cell22):
      endGame(cellrc); break;
    case Number(row) + Number(column) == 2 && (cell02 == cell11 && cell02 == cell20):
      endGame(cellrc); break;
  }
}
function endGame(e) {
  document.getElementById("info1").textContent = e + " Wins!!";
  gameInAction = false;
}