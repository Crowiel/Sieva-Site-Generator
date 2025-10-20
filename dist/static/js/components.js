// Main components initialization and global utilities
document.addEventListener('DOMContentLoaded', () => {
    // Initialize responsive navigation
    initializeNavigation();
    
    // Initialize smooth scrolling for anchor links
    initializeSmoothScrolling();
    
    // Initialize copy-to-clipboard for code blocks
    initializeCodeCopyButtons();
    
    // Initialize lazy loading for images
    initializeLazyLoading();
    
    // Initialize floating navigation
    initializeFloatingNav();
    
    // Initialize theme toggle
    initializeThemeToggle();
});

function initializeNavigation() {
    const nav = document.querySelector('.nav');
    const navToggle = document.querySelector('#navToggle');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            nav.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', 
                nav.classList.contains('nav-open') ? 'true' : 'false'
            );
        });
        
        // Close nav when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target)) {
                nav.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close nav when pressing Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
                nav.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.focus();
            }
        });
    }
}

function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without jumping
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            }
        });
    });
}

function initializeCodeCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(codeBlock => {
        const pre = codeBlock.parentElement;
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        copyButton.setAttribute('title', 'Copy code to clipboard');
        
        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(codeBlock.textContent);
                copyButton.textContent = 'Copied!';
                copyButton.classList.add('copied');
                
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                    copyButton.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy code:', err);
                copyButton.textContent = 'Failed';
                
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                }, 2000);
            }
        });
        
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
    });
}

function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in globalThis) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Theme switcher
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const floatingThemeToggle = document.getElementById('floatingThemeToggle');
    const themeIcons = document.querySelectorAll('.theme-toggle-icon');
    
    if (!themeToggle && !floatingThemeToggle) return;
    
    // Get saved theme or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = globalThis.matchMedia && globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let currentTheme = savedTheme || (systemDark ? 'dark' : 'light');
    
    // Apply initial theme
    applyTheme(currentTheme);
    
    // Toggle theme on button click
    function handleThemeToggle() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', handleThemeToggle);
    }
    
    if (floatingThemeToggle) {
        floatingThemeToggle.addEventListener('click', handleThemeToggle);
    }
    
    function applyTheme(theme) {
        const html = document.documentElement;
        const allThemeButtons = document.querySelectorAll('.theme-toggle');
        
        if (theme === 'dark') {
            html.classList.add('dark-theme');
            html.classList.remove('light-theme');
            allThemeButtons.forEach(btn => btn.setAttribute('aria-label', 'Switch to light mode'));
        } else {
            html.classList.add('light-theme');
            html.classList.remove('dark-theme');
            allThemeButtons.forEach(btn => btn.setAttribute('aria-label', 'Switch to dark mode'));
        }
    }
    
    // Listen for system theme changes
    if (globalThis.matchMedia) {
        globalThis.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                currentTheme = e.matches ? 'dark' : 'light';
                applyTheme(currentTheme);
            }
        });
    }
}

function initializeFloatingNav() {
    // Only enable floating nav on desktop (above 1080px)
    if (globalThis.innerWidth < 1081) {
        return;
    }
    
    const floatingNav = document.getElementById('floatingNav');
    const header = document.querySelector('.site-header');
    
    if (!floatingNav || !header) {
        console.log('Floating nav elements not found:', { floatingNav: !!floatingNav, header: !!header });
        return;
    }
    
    let isVisible = false;
    
    function toggleFloatingNav() {
        const currentScrollY = globalThis.scrollY || document.documentElement.scrollTop || 0;
        const headerHeight = header.offsetHeight;
        
        // Show floating nav when scrolled past header (with small buffer)
        const shouldShow = currentScrollY > (headerHeight + 50);
        
        if (shouldShow && !isVisible) {
            floatingNav.classList.add('visible');
            isVisible = true;
        } else if (!shouldShow && isVisible) {
            floatingNav.classList.remove('visible');
            isVisible = false;
        }
    }
    
    // Use simple scroll listener
    function handleScroll() {
        toggleFloatingNav();
    }
    
    // Add scroll event listener
    document.addEventListener('scroll', handleScroll, { passive: true });
    globalThis.addEventListener('scroll', handleScroll, { passive: true });
    
    // Handle window resize to hide/show floating nav based on screen size
    function handleResize() {
        if (globalThis.innerWidth < 1081) {
            floatingNav.classList.remove('visible');
            isVisible = false;
        } else {
            toggleFloatingNav();
        }
    }
    
    globalThis.addEventListener('resize', handleResize, { passive: true });
    
    // Initial check after a small delay to ensure layout is ready
    setTimeout(() => {
        toggleFloatingNav();
    }, 100);
}

// Export utilities for use by other components
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        debounce,
        initializeNavigation,
        initializeSmoothScrolling,
        initializeCodeCopyButtons,
        initializeLazyLoading,
        initializeThemeToggle,
        initializeFloatingNav
    };
}