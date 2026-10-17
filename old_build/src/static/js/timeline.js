// Timeline Sidebar Component
class TimelineSidebar {
    constructor() {
        this.sidebar = null;
        this.overlay = null;
        this.toggle = null;
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        this.sidebar = document.getElementById('timeline-sidebar');
        this.overlay = document.getElementById('timeline-overlay');
        this.toggle = document.querySelector('.timeline-toggle');
        
        console.log('Timeline init - sidebar:', this.sidebar, 'toggle:', this.toggle);
        
        if (this.sidebar) {
            this.bindEvents();
            this.highlightCurrentSection();
        }
    }
    
    bindEvents() {
        // Prevent clicks on sidebar from closing it (stop propagation to overlay)
        this.sidebar.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Timeline toggle button (mobile)
        if (this.toggle) {
            this.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSidebar();
            });
        }
        
        // Timeline close button
        const closeButton = this.sidebar.querySelector('.timeline-close');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                console.log('Close button clicked');
                e.preventDefault();
                e.stopPropagation();
                this.close();
            });
        } else {
            console.log('Close button not found');
        }
        
        // Timeline item clicks
        const timelineItems = this.sidebar.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleTimelineClick(e, item);
            });
        });
        
        // Scroll spy to highlight current section
        globalThis.addEventListener('scroll', () => {
            this.updateActiveSection();
        });
    }
    
    open() {
        if (!this.isOpen) {
            this.sidebar.classList.add('open');
            this.isOpen = true;
            // No overlay - timeline is just a sidebar panel
        }
    }
    
    close() {
        console.log('Timeline close() called, isOpen:', this.isOpen);
        if (this.isOpen) {
            console.log('Closing timeline');
            this.sidebar.classList.remove('open');
            this.isOpen = false;
            console.log('Timeline closed successfully');
        } else {
            console.log('Timeline was already closed');
        }
    }
    
    toggleSidebar() {
        console.log('toggleSidebar called, isOpen:', this.isOpen, 'width:', globalThis.innerWidth);
        
        // Allow toggle on all screen sizes
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    handleTimelineClick(e, item) {
        const href = item.getAttribute('href');
        
        if (href && href.startsWith('#')) {
            e.preventDefault();
            e.stopPropagation(); // Prevent click from bubbling to overlay
            
            // Update active state
            this.sidebar.querySelectorAll('.timeline-item').forEach(el => {
                el.classList.remove('active');
            });
            item.classList.add('active');
            
            // Find target element
            const targetId = href.substring(1); // Remove the #
            const target = document.getElementById(targetId);
            
            if (target) {
                // Update URL hash without triggering page jump
                if (history.pushState) {
                    history.pushState(null, null, href);
                } else {
                    window.location.hash = href;
                }
                
                // Smooth scroll to section
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Keep timeline open after navigation - don't auto-close
            } else {
                console.warn('Timeline target not found:', href);
            }
        } else if (href && !href.startsWith('#')) {
            // External link - close sidebar and navigate
            e.stopPropagation();
            this.close();
        }
    }
    
    highlightCurrentSection() {
        // Initial highlight based on URL hash
        const hash = globalThis.location.hash;
        if (hash) {
            const activeItem = this.sidebar.querySelector(`[href="${hash}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
            
            // Scroll to the target element if hash exists
            const targetId = hash.substring(1); // Remove the #
            const target = document.getElementById(targetId);
            if (target) {
                // Use setTimeout to ensure page is fully loaded
                setTimeout(() => {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        }
    }
    
    updateActiveSection() {
        // Update active section based on scroll position (works even when closed)
        const timelineItems = this.sidebar.querySelectorAll('.timeline-item[href^="#"]');
        let activeFound = false;
        
        timelineItems.forEach(item => {
            const href = item.getAttribute('href');
            const targetId = href.substring(1); // Remove the #
            const target = document.getElementById(targetId);
            
            if (target) {
                const rect = target.getBoundingClientRect();
                // Consider element active if it's near the top of the viewport
                const isVisible = rect.top <= 150 && rect.bottom >= 100;
                
                if (isVisible && !activeFound) {
                    item.classList.add('active');
                    activeFound = true;
                    
                    // Update URL hash if this is a different section
                    if (globalThis.location.hash !== href) {
                        if (history.replaceState) {
                            history.replaceState(null, null, href);
                        }
                    }
                } else {
                    item.classList.remove('active');
                }
            }
        });
    }
}

// Global functions for HTML onclick handlers
globalThis.toggleTimelineSidebar = function() {
    if (globalThis.timelineSidebar) {
        globalThis.timelineSidebar.toggleSidebar();
    }
};

globalThis.closeTimelineSidebar = function() {
    console.log('closeTimelineSidebar called');
    if (globalThis.timelineSidebar) {
        console.log('Calling timelineSidebar.close()');
        globalThis.timelineSidebar.close();
    } else {
        console.log('timelineSidebar instance not found');
    }
};

// Initialize timeline sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready, looking for timeline sidebar');
    const timelineSidebarElement = document.getElementById('timeline-sidebar');
    console.log('Timeline sidebar element:', timelineSidebarElement);
    
    if (timelineSidebarElement) {
        console.log('Creating TimelineSidebar instance');
        globalThis.timelineSidebar = new TimelineSidebar();
    }
});

// Handle responsive behavior - removed auto-open/close on resize
// Timeline is now always user-controlled via toggle button

class Timeline {
    constructor(container, timelineData) {
        this.container = container;
        this.timelineData = timelineData || [];
        this.init();
    }
    
    init() {
        this.container.classList.add('interactive-timeline');
        this.addInteractivity();
    }
    
    addInteractivity() {
        const items = this.container.querySelectorAll('.timeline-item');
        
        items.forEach((item, index) => {
            // Add click handler for timeline navigation
            item.addEventListener('click', () => {
                this.handleTimelineClick(item, index);
            });
            
            // Add hover effects
            item.addEventListener('mouseenter', () => {
                item.classList.add('hovered');
                this.showTimelinePreview(item, index);
            });
            
            item.addEventListener('mouseleave', () => {
                item.classList.remove('hovered');
                this.hideTimelinePreview();
            });
            
            // Add keyboard navigation
            item.setAttribute('tabindex', '0');
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleTimelineClick(item, index);
                }
            });
        });
        
        // Add navigation arrows between timeline items
        this.addNavigationArrows();
    }
    
    handleTimelineClick(item, index) {
        // Remove active class from all items
        this.container.querySelectorAll('.timeline-item').forEach(el => {
            el.classList.remove('active');
        });
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Check if item has a link
        const link = item.querySelector('.timeline-link');
        if (link) {
            // If it's an internal link (starts with /), navigate smoothly
            const href = link.getAttribute('href');
            if (href && href.startsWith('/')) {
                this.smoothNavigate(href);
            } else if (href) {
                // External link, open in new tab
                globalThis.open(href, '_blank');
            }
        }
        
        // Scroll to related content if available
        this.scrollToContent(index);
        
        // Emit custom event for other components to listen to
        this.container.dispatchEvent(new CustomEvent('timeline-item-selected', {
            detail: { index, item, data: this.timelineData[index] }
        }));
    }
    
    showTimelinePreview(item, _index) {
        const preview = document.createElement('div');
        preview.className = 'timeline-preview';
        preview.innerHTML = `
            <div class="preview-content">
                <h4>${item.querySelector('h3')?.textContent || 'Timeline Item'}</h4>
                <p>Click to navigate or view details</p>
            </div>
        `;
        
        // Position preview near the item
        const rect = item.getBoundingClientRect();
        preview.style.position = 'fixed';
        preview.style.left = `${rect.right + 10}px`;
        preview.style.top = `${rect.top}px`;
        preview.style.zIndex = '1000';
        
        document.body.appendChild(preview);
        this.currentPreview = preview;
        
        // Fade in
        setTimeout(() => preview.classList.add('visible'), 10);
    }
    
    hideTimelinePreview() {
        if (this.currentPreview) {
            this.currentPreview.classList.remove('visible');
            setTimeout(() => {
                if (this.currentPreview && this.currentPreview.parentNode) {
                    this.currentPreview.parentNode.removeChild(this.currentPreview);
                }
                this.currentPreview = null;
            }, 200);
        }
    }
    
    addNavigationArrows() {
        const items = this.container.querySelectorAll('.timeline-item');
        
        items.forEach((item, index) => {
            if (index < items.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'timeline-arrow';
                arrow.innerHTML = '→';
                arrow.addEventListener('click', (e) => {
                    e.stopPropagation();
                    items[index + 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    items[index + 1].focus();
                });
                
                item.appendChild(arrow);
            }
        });
    }
    
    smoothNavigate(href) {
        // Simple smooth navigation for internal links
        if (href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            globalThis.location.href = href;
        }
    }
    
    scrollToContent(index) {
        // Look for content sections that might be related to this timeline item
        const contentSections = document.querySelectorAll('.post-content h2, .post-content h3');
        if (contentSections[index]) {
            contentSections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    // Method to programmatically select a timeline item
    selectItem(index) {
        const items = this.container.querySelectorAll('.timeline-item');
        if (items[index]) {
            this.handleTimelineClick(items[index], index);
        }
    }
    
    // Method to add new timeline items dynamically
    addTimelineItem(itemData, position = -1) {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-date">${new Date(itemData.date).toLocaleDateString()}</div>
            <div class="timeline-content">
                <h3>${itemData.title}</h3>
                ${itemData.link ? `<a href="${itemData.link}" class="timeline-link">View Details</a>` : ''}
            </div>
        `;
        
        if (position === -1 || position >= this.container.children.length) {
            this.container.appendChild(item);
        } else {
            this.container.insertBefore(item, this.container.children[position]);
        }
        
        // Re-initialize interactivity for new item
        this.addInteractivityToItem(item, this.container.querySelectorAll('.timeline-item').length - 1);
    }
    
    addInteractivityToItem(item, index) {
        item.addEventListener('click', () => {
            this.handleTimelineClick(item, index);
        });
        
        item.addEventListener('mouseenter', () => {
            item.classList.add('hovered');
            this.showTimelinePreview(item, index);
        });
        
        item.addEventListener('mouseleave', () => {
            item.classList.remove('hovered');
            this.hideTimelinePreview();
        });
        
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleTimelineClick(item, index);
            }
        });
    }
}

// Initialize timelines on page load
document.addEventListener('DOMContentLoaded', () => {
    const timelineContainers = document.querySelectorAll('.timeline');
    
    timelineContainers.forEach(container => {
        // Get timeline data from data attribute if available
        let timelineData = [];
        const dataAttr = container.getAttribute('data-timeline');
        if (dataAttr) {
            try {
                timelineData = JSON.parse(dataAttr);
            } catch (e) {
                console.warn('Failed to parse timeline data:', e);
            }
        }
        
        new Timeline(container, timelineData);
    });
});