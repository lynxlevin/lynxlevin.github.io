
    window.addEventListener('DOMContentLoaded', ()=> {
      // Shutter button
      const shutter = document.querySelector('.shutter-closed');
      shutter.addEventListener('click', () => {
        shutter.classList.remove('shutter-closed');
        shutter.classList.add('shutter');
      });


      // Let it snow button
      const container = document.querySelector('.snow-container');
      const letItSnow = document.querySelector('.let-it-snow');
      let count = 0;

      letItSnow.addEventListener("click", () => {
        if (count < 3) {
          count++;
          // 雪を生成する間隔をミリ秒で指定
          setInterval(() => {createSnow(container)}, 100);
        }
      });

      // JingleBells button
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
    });