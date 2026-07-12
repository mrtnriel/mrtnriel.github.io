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

// --- 4. Interactive Dropdown for Artifacts (mouse + keyboard accessible) ---
document.addEventListener('DOMContentLoaded', () => {
  const artifactItems = document.querySelectorAll('.artifact-item');

  const toggleItem = (item) => {
    const isAlreadyActive = item.classList.contains('active');

    // Close all other dropdowns automatically (keeps the screen clean)
    artifactItems.forEach(otherItem => {
      otherItem.classList.remove('active');
      otherItem.setAttribute('aria-expanded', 'false');
    });

    // If it wasn't open, open it. If it was open, it stays closed.
    if (!isAlreadyActive) {
      item.classList.add('active');
      item.setAttribute('aria-expanded', 'true');
    }
  };

  artifactItems.forEach(item => {
    // Mouse support
    item.addEventListener('click', () => toggleItem(item));

    // Keyboard support (Enter or Space, like a real button)
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // stop the page from scrolling on Space
        toggleItem(item);
      }
    });
  });
});

// --- 5. Scroll Spy & Mobile Sidebar Navigation ---
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.scroll-section');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileToggleBtn = document.getElementById('mobile-nav-toggle');
  const sidebar = document.getElementById('sidebar');

  // Scroll Spy Observer
  const spyOptions = {
    root: null,
    // Triggers when a section crosses the middle of the viewport
    rootMargin: '-50% 0px -50% 0px', 
    threshold: 0
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Remove active class from all links
        navLinks.forEach(link => link.classList.remove('active-nav'));
        
        // Add active class to corresponding link
        const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
        if (activeLink) {
          activeLink.classList.add('active-nav');
        }
      }
    });
  }, spyOptions);

  sections.forEach(section => spyObserver.observe(section));

  // Mobile Menu Toggle Logic
  if (mobileToggleBtn && sidebar) {
    mobileToggleBtn.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      mobileToggleBtn.setAttribute('aria-expanded', isOpen);
      
      // Visual feedback on the button
      if (isOpen) {
        mobileToggleBtn.innerHTML = '<span style="color:#ff5555">[ CLOSE ]</span>';
      } else {
        mobileToggleBtn.innerHTML = '<span>[ MENU ]</span>';
      }
    });

    // Close mobile menu when a navigation link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 950) {
          sidebar.classList.remove('open');
          mobileToggleBtn.setAttribute('aria-expanded', 'false');
          mobileToggleBtn.innerHTML = '<span>[ MENU ]</span>';
        }
      });
    });

    
  }
});

// --- 6. Theme Toggle Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  
  if (!themeToggle) return;
  
  // Updated symbols here:
  const sunSymbol = '☼';
  const moonSymbol = '☾';

  // 1. Check local storage for the user's saved theme preference
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    // If we are in light mode, show the moon to toggle dark mode
    themeToggle.textContent = moonSymbol; 
  } else {
    // If we are in dark mode (default), show the sun to toggle light mode
    themeToggle.textContent = sunSymbol;
  }

  // 2. Listen for clicks on the button
  themeToggle.addEventListener('click', () => {
    const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    
    if (isLightMode) {
      // Switch back to Default Dark Mode
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('portfolio-theme', 'dark');
      themeToggle.textContent = sunSymbol; // Now dark, show sun
    } else {
      // Switch to Light Mode
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('portfolio-theme', 'light');
      themeToggle.textContent = moonSymbol; // Now light, show moon
    }
  });
});