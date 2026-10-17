// Image Gallery Component
// Generates responsive image galleries from MDX content

export interface GalleryImage {
  filename: string;
  path: string;
  alt?: string;
}

export function renderGallery(images: GalleryImage[], galleryId: string = 'gallery'): string {
  if (!images || images.length === 0) {
    return '';
  }

  const galleryItems = images.map((img, index) => `<div class="gallery-item">
      <a href="${img.path}" 
         class="gallery-link" 
         data-gallery="${galleryId}"
         data-index="${index}">
        <div class="gallery-image-wrapper">
          <img src="${img.path}" 
               alt="${img.alt || img.filename}" 
               loading="lazy"
               class="gallery-image">
          <div class="gallery-overlay">
            <span class="gallery-icon">🔍</span>
          </div>
        </div>
      </a>
    </div>`).join('\n    ');

  return `<div class="gallery" id="${galleryId}">
    ${galleryItems}
  </div>
  <div class="gallery-lightbox" id="lightbox-${galleryId}">
    <button class="lightbox-close" onclick="closeLightbox('${galleryId}')">&times;</button>
    <button class="lightbox-prev" onclick="navigateLightbox('${galleryId}', -1)">&#10094;</button>
    <button class="lightbox-next" onclick="navigateLightbox('${galleryId}', 1)">&#10095;</button>
    <div class="lightbox-content">
      <img src="" alt="" id="lightbox-image-${galleryId}">
    </div>
    <div class="lightbox-caption" id="lightbox-caption-${galleryId}"></div>
  </div>`;
}

// Helper function to parse gallery syntax from MDX
// Example: Gallery: test1.png, test2.png, test3.png
export function parseGalleryString(galleryStr: string, basePath: string): GalleryImage[] {
  const filenames = galleryStr
    .split(',')
    .map(f => f.trim())
    .filter(f => f.length > 0);

  return filenames.map(filename => ({
    filename,
    path: `${basePath}/${filename}`,
    alt: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
  }));
}
