window.addEventListener('DOMContentLoaded', ()=> {
  // Shutter button
  const bellSound = document.querySelector("#bgm1");
  const shutter = document.querySelector('.shutter-closed');
  shutter.addEventListener('click', () => {
    shutter.classList.remove('shutter-closed');
    shutter.classList.add('shutter');
    bellSound.play();
    bellSound.pause();
  });
});