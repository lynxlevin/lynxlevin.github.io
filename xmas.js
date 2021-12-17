class Aframe {
  constructor() {
      this.register();
  }

  register() {
    //マーカーの前に読み込まないと動かない
    AFRAME.registerComponent('registerevents', {
      init: function () {
        const marker = this.el;
        const container = document.querySelector('.snow-container');

        // マーカーを検出したイベントの登録
        marker.addEventListener('markerFound', async function () {
          console.log(marker.dataset.contentid);
          setInterval(() => {createSnow(container)}, 100);
        });

        // マーカーを見失ったイベントの登録
        marker.addEventListener('markerLost', async function () {
        });
      }
    });
  }
}






window.addEventListener('DOMContentLoaded', ()=> {
  const jingleBells = document.querySelector('.jingle-bells');
  const bellSound = new Audio('assets/bells.mp3');

  jingleBells.addEventListener("click", () => {
    if (!jingleBells.classList.contains('playing')) {
      jingleBells.classList.add('playing');
      bellSound.currentTime = 1;
      bellSound.play();
    } else {
      jingleBells.classList.remove('playing');
      bellSound.pause();
    }
  });


});
const createSnow = (container) => {
  const snowEl = document.createElement('span');
  snowEl.className = 'snow';
  const minSize = 5;
  const maxSize = 10;
  const size = Math.random() * (maxSize - minSize) + minSize;
  snowEl.style.width = `${size}px`;
  snowEl.style.height = `${size}px`;
  snowEl.style.left = Math.random() * 100 + '%';
  container.appendChild(snowEl);

  // 一定時間が経てば雪を消す
  setTimeout(() => {
    snowEl.remove();
  }, 10000);
}