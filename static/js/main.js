// Sieva Site Generator (v2) - Lightweight Vanilla Utilities (<2.5 KB)
(function () {
  'use strict';

  // 1. Theme Management
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
      html.setAttribute('data-theme', saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: next } }));
    });
  }

  initTheme();

  // 2. Mobile Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 3. Lightbox Dialog Helper
  const lightbox = document.getElementById('lightbox-dialog');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCap = document.getElementById('lightbox-caption');

  window.openLightbox = function (src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    if (lightboxCap) {
      lightboxCap.textContent = alt || '';
    }
    lightbox.showModal();
  };

  window.openGanttModal = function () {
    const dialog = document.getElementById('gantt-dialog');
    if (dialog) dialog.showModal();
  };

  // 4. Code Block Copy Buttons
  document.querySelectorAll('pre').forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code) return;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
    copyBtn.innerText = 'Copy';
    copyBtn.style.cssText = 'position:absolute;top:6px;right:6px;font-size:11px;font-family:var(--font-mono);background:var(--color-bg-card);color:var(--color-text-muted);border:1px solid var(--color-border);border-radius:3px;padding:2px 6px;cursor:pointer;';

    pre.style.position = 'relative';
    pre.appendChild(copyBtn);

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.innerText);
        copyBtn.innerText = 'Copied!';
        setTimeout(() => (copyBtn.innerText = 'Copy'), 2000);
      } catch (err) {
        copyBtn.innerText = 'Failed';
      }
    });
  });

  // 5. Pullout Timeline Sidebar
  window.toggleTimelineSidebar = function (e) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    const sidebar = document.getElementById('timeline-sidebar');
    const tabBtn = document.getElementById('timeline-tab-btn');
    if (!sidebar) return;
    const willOpen = !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', willOpen);
    if (tabBtn) tabBtn.classList.toggle('open', willOpen);
  };

  window.onTimelineClick = function (e, link) {
    if (!link) return;
    if (link.startsWith('#')) {
      const targetId = link.substring(1);
      let target = document.querySelector('.article-body #' + targetId) ||
                   document.querySelector('.article-body [id="' + targetId + '"]') ||
                   document.getElementById(targetId);
      if (target === document.getElementById('timeline-sidebar')) {
        target = document.querySelector('.article-body [id="' + targetId + '"]');
      }
      if (!target) {
        try { target = document.querySelector(link); } catch (_) {}
      }
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        try { history.pushState(null, null, link); } catch (_) {}
        document.querySelectorAll('.timeline-nav-item').forEach((el) => el.classList.remove('active'));
        if (e.currentTarget) e.currentTarget.classList.add('active');
        if (window.innerWidth <= 768) {
          toggleTimelineSidebar(e);
        }
      }
    }
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const sidebar = document.getElementById('timeline-sidebar');
      const tabBtn = document.getElementById('timeline-tab-btn');
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (tabBtn) tabBtn.classList.remove('open');
      }
    }
  });

  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('timeline-sidebar');
    const tabBtn = document.getElementById('timeline-tab-btn');
    if (sidebar && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && (!tabBtn || !tabBtn.contains(e.target))) {
        sidebar.classList.remove('open');
        if (tabBtn) tabBtn.classList.remove('open');
      }
    }
  });
})();

