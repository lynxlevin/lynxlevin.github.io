window.addEventListener('DOMContentLoaded', ()=> {
  const bellSound = document.querySelector("#bgm1");
  const button = document.querySelector('#button');
  button.addEventListener("click", () => {
    button.classList.add('hidden');
    bellSound.play();
    bellSound.pause();
  })
});