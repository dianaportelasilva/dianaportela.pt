import './styles.scss';
import 'normalize.css';
import * as data from './data.json';

const nav = document.querySelector('nav');
const animPath = nav.querySelector('svg path');
const timeline = document.querySelector('.timeline');
const blob = timeline.querySelector('.blob');
const cards = document.querySelectorAll('.item');
const dots = [];
const configs = { speed: 8, details: 14 };
let animTime = 0;
let currentColor = 0;

const app = {
  init: () => {
    // Header age
    app.setAge();

    // Nav animation init
    app.navAnimation();
    nav.querySelector('svg').classList.remove('loading');

    // Read more / less
    app.initReadMoreLinks();

    // Footer Links
    app.initFooterLinks();

    // Timeline
    app.timeline.init();

    // On scroll event
    app.onScroll.init();
  },

  navAnimation: () => {
    const xs = [];
    let x = 0;
    const w = document.body.clientWidth;
    const wm = w / 2;

    if (window.innerWidth <= 1280) {
      // Mobile
      for (x = 0; x < w; x += configs.details * 0.6) {
        xs.push([
          x,
          110 + ((12 * x) / w) * Math.sin((x + animTime) / 50),
        ]);
      }
      xs.push([w, 110 + 12 * Math.sin((w + animTime) / 50)]);
    } else {
      // Desktop
      for (x = 0; x < wm; x += configs.details) {
        xs.push([
          x,
          120 + ((32 * x) / wm) * Math.sin((x + animTime) / 50),
        ]);
      }
      xs.push([wm, 120 + 32 * Math.sin((wm + animTime) / 50)]);
      for (let i = xs.length - 1; i > 0; i -= 1) {
        xs.push([w - xs[i][0], xs[i][1]]);
      }
    }

    // Set path
    animPath?.setAttribute('d', `M0 152 ${xs.map(p => `${p[0]} ${p[1]}`).join(' L')} h${w} V0 H0`);

    if (configs.speed > 1) configs.speed *= 0.95;

    animTime += configs.speed;
    requestAnimationFrame(app.navAnimation);
  },

  initReadMoreLinks: () => {
    document.querySelectorAll('.read').forEach(read => {
      if (read.childElementCount < 2) {
        read.classList.remove('read');
      } else {
        const more = document.createElement('p');
        more.className = 'read-more';
        if (!read.querySelector('.read-more')) read.querySelectorAll('div')[0]?.insertAdjacentElement('afterend', more);

        const less = document.createElement('p');
        less.className = 'read-less';
        read.querySelectorAll('div')[1]?.appendChild(less);

        read.querySelectorAll('.read-more, .read-less').forEach(
          p => p.onclick = () => {
            p.closest('.read').classList.toggle('active');
            app.timeline.setPositions();
            app.onScroll.timeline();
          }
        );
      }
    });
  },

  initFooterLinks: () => {
    document.querySelectorAll('footer .icons .link').forEach(elem => {
      elem.onmousemove = e => {
        const span = elem.nextElementSibling;
        span.style.left = `${e.offsetX}px`;
        span.style.top = `${e.offsetY}px`;
      };
    });
  },

  onScroll: {
    init: () => {
      (document.onscroll = () => {
        app.onScroll.timeline();
        app.onScroll.sections();
      })();

      cards.forEach(card => card.classList.remove('on'));
    },

    timeline: () => {
      const bottom = nav.offsetHeight - timeline.offsetTop + 60;
      const pos = Math.max(0, window.pageYOffset + bottom);
      const max = document.body.offsetHeight - window.innerHeight + bottom;
      const percent = timeline.offsetHeight * (pos / (max + 200));

      for (let i = 0; i < cards.length; i += 1) {
        if (cards[i].offsetTop > percent) {
          blob.style.setProperty('--position', `${dots[i].offsetTop || 0}px`);

          cards.forEach((card, j) => card.classList.toggle('active', i === j));
          dots.forEach((dot, j) => dot.classList.toggle('active', i === j));
          break;
        }
      }

      for (let i = 0; i < cards.length; i += 1) {
        if (cards[i].offsetTop <= percent + 460) {
          cards[i].classList.add('on');
        }
      }
    },

    sections: () => {
      const yPos = window.pageYOffset;
      const breaks = [
        timeline.offsetTop - 200,
        document.body.offsetHeight - window.innerHeight - 200,
      ];
      let anim;

      if (yPos < breaks[0]) {
        if (currentColor > 0) {
          anim = 'BA';
          currentColor = 0;
        }
      } else if (yPos > breaks[0] && yPos < breaks[1]) {
        if (currentColor === 0) {
          anim = 'AB';
          currentColor = 1;
        } else if (currentColor === 2) {
          anim = 'CB';
          currentColor = 1;
        }
      } else if (currentColor < 2) {
        anim = 'BC';
        currentColor = 2;
      }

      if (anim) {
        document
          .querySelectorAll(`.anim${anim}`)
          .forEach(e => e.beginElement());
      }
    },
  },

  setAge: () => {
    // eslint-disable-next-line max-len
    window.age.innerHTML = new Date((data.death || Date.now()) - data.birth).getUTCFullYear() - 1970;
  },

  timeline: {
    init: () => {
      app.timeline.initDots();
      app.timeline.initDates();
      app.timeline.initClock();
      app.timeline.setPositions();
    },

    initDots: () => {
      const container = timeline.querySelector('.dots');

      cards.forEach(() => {
        const dot = document.createElement('div');
        container.appendChild(dot);
        dots.push(dot);
      });
    },

    initDates: () => {
      const dates = timeline.querySelectorAll('.item .date');

      const dateFormatter = date => `${date.toLocaleString('en-UK', { month: 'short' })} ${date.getFullYear()}`;

      dates.forEach(item => {
        const dateA = new Date(item.getAttribute('start'));
        const dateB = item.getAttribute('end') ? new Date(item.getAttribute('end')) : new Date();

        // Date formatting
        let result = dateFormatter(dateA);
        if (dateA.getDate() !== dateB.getDate()) { result += ` → ${item.getAttribute('end') ? dateFormatter(dateB) : 'Current'}`; }

        // Current
        const diff = (dateB - dateA) / 31536e6;
        const y = diff | 0;
        const m = ((diff % 1) * 12) | 0;
        result += y + m
          ? ` (${y ? `${y} year${y > 1 ? 's' : ''}` : ''}${m ? `${(y ? ', ' : '') + m} month${m > 1 ? 's' : ''}` : ''})`
          : '';

        item.innerText = result;
      });
    },

    initClock: () => {
      setInterval(() => {
        window.elapsed.innerHTML = ((((data.death || new Date().getTime()) - data.birth) / 1e3) | 0)
          .toLocaleString()
          .replace(/,/g, ' ');
      }, 1e3);

      if (data.death) {
        const p = window.elapsed.closest('p');
        p.innerHTML = p.innerHTML.replace("it's been", 'it was');
      }
    },

    setPositions: () => {
      cards.forEach((card, i) => dots[i].style.top = `${card.offsetTop + 10}px`);
    },
  },
};

app.init();
