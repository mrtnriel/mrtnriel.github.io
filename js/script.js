// --- 1. Live Time Clock ---
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-GB', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  const timeElement = document.getElementById('live-time');
  if (timeElement) {
    timeElement.textContent = timeString;
  }
}

updateTime();
setInterval(updateTime, 1000);

// --- 2. Text Scramble Effect ---
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="highlight">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// Initialize the scramble effects
document.addEventListener('DOMContentLoaded', () => {
  const nameElement = document.querySelector('.highlight');
  if (nameElement) {
    const fx = new TextScramble(nameElement);
    fx.setText(nameElement.textContent);
  }

  const paths = document.querySelectorAll('.path');
  paths.forEach(path => {
    const text = path.textContent;
    const fx = new TextScramble(path);
    path.addEventListener('mouseenter', () => fx.setText(text));
  });
});

// --- 3. Scroll Fade-Up Observer ---
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-up').forEach(el => {
    observer.observe(el);
  });
});

// --- 4. Interactive Dropdown for Artifacts ---
document.addEventListener('DOMContentLoaded', () => {
  const artifactItems = document.querySelectorAll('.artifact-item');
  
  artifactItems.forEach(item => {
    item.addEventListener('click', () => {
      // Check if the clicked item is already open
      const isAlreadyActive = item.classList.contains('active');
      
      // Close all other dropdowns automatically (optional, but keeps the screen clean)
      artifactItems.forEach(otherItem => {
        otherItem.classList.remove('active');
      });

      // If it wasn't open, open it. If it was open, it stays closed.
      if (!isAlreadyActive) {
        item.classList.add('active');
      }
    });
  });
});
