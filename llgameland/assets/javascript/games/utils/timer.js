export function startTimer(gameTimer) {
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
