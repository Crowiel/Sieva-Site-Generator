/**
 * Gallery Lightbox Functionality
 * Handles image gallery lightbox interactions
 */

document.addEventListener('DOMContentLoaded', function() {
  // Add click listeners to all gallery links
  const galleryLinks = document.querySelectorAll('.gallery-link');
  
  galleryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const galleryId = this.getAttribute('data-gallery');
      const index = parseInt(this.getAttribute('data-index'));
      openLightbox(galleryId, index);
    });
  });
  
  // Close lightbox on background click
  document.querySelectorAll('.gallery-lightbox').forEach(lightbox => {
    lightbox.addEventListener('click', function(e) {
      if (e.target === this) {
        const galleryId = this.id.replace('lightbox-', '');
        closeLightbox(galleryId);
      }
    });
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    const activeLightbox = document.querySelector('.gallery-lightbox.active');
    if (!activeLightbox) return;
    
    const galleryId = activeLightbox.id.replace('lightbox-', '');
    
    if (e.key === 'Escape') {
      closeLightbox(galleryId);
    } else if (e.key === 'ArrowLeft') {
      navigateLightbox(galleryId, -1);
    } else if (e.key === 'ArrowRight') {
      navigateLightbox(galleryId, 1);
    }
  });
});

/**
 * Open the lightbox and display image at given index
 * @param {string} galleryId - The gallery identifier
 * @param {number} index - The image index to display
 */
function openLightbox(galleryId, index) {
  const lightbox = document.getElementById(`lightbox-${galleryId}`);
  if (!lightbox) return;
  
  // Get all images in this gallery
  const galleryLinks = document.querySelectorAll(`[data-gallery="${galleryId}"]`);
  if (index < 0 || index >= galleryLinks.length) return;
  
  // Get the clicked image info
  const link = galleryLinks[index];
  const img = link.querySelector('.gallery-image');
  
  // Update lightbox
  const lightboxImg = lightbox.querySelector(`#lightbox-image-${galleryId}`);
  const lightboxCaption = lightbox.querySelector(`#lightbox-caption-${galleryId}`);
  
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = img.alt;
  
  // Store current index
  lightbox.setAttribute('data-current-index', index);
  
  // Show lightbox
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

/**
 * Close the lightbox
 * @param {string} galleryId - The gallery identifier
 */
function closeLightbox(galleryId) {
  const lightbox = document.getElementById(`lightbox-${galleryId}`);
  if (!lightbox) return;
  
  lightbox.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
}

/**
 * Navigate to next or previous image in the lightbox
 * @param {string} galleryId - The gallery identifier
 * @param {number} direction - Navigation direction: -1 for previous, 1 for next
 */
function navigateLightbox(galleryId, direction) {
  const lightbox = document.getElementById(`lightbox-${galleryId}`);
  if (!lightbox) return;
  
  const currentIndex = parseInt(lightbox.getAttribute('data-current-index'));
  const galleryLinks = document.querySelectorAll(`[data-gallery="${galleryId}"]`);
  
  let newIndex = currentIndex + direction;
  
  // Wrap around
  if (newIndex < 0) {
    newIndex = galleryLinks.length - 1;
  } else if (newIndex >= galleryLinks.length) {
    newIndex = 0;
  }
  
  // Update the lightbox with new image
  const link = galleryLinks[newIndex];
  const img = link.querySelector('.gallery-image');
  
  const lightboxImg = lightbox.querySelector(`#lightbox-image-${galleryId}`);
  const lightboxCaption = lightbox.querySelector(`#lightbox-caption-${galleryId}`);
  
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = img.alt;
  
  lightbox.setAttribute('data-current-index', newIndex);
}
