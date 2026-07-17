// =====================
// YouTube Players Integration
// =====================
let bgPlayer;
let lightboxPlayer;
const videoId = 'tNboS5Ie4zI';

window.onYouTubeIframeAPIReady = function() {
    // 1. Background Player
    bgPlayer = new YT.Player('bg-video-player', {
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'mute': 1,
            'loop': 1,
            'playlist': videoId,
            'controls': 0,
            'showinfo': 0,
            'rel': 0,
            'modestbranding': 1,
            'playsinline': 1,
            'disablekb': 1,
            'fs': 0
        },
        events: {
            'onReady': onBgPlayerReady,
            'onStateChange': onBgPlayerStateChange
        }
    });

    // 2. Lightbox Player (Loaded but paused initially)
    lightboxPlayer = new YT.Player('lightbox-player', {
        videoId: videoId,
        playerVars: {
            'autoplay': 0,
            'controls': 1,
            'rel': 0,
            'modestbranding': 1,
            'playsinline': 1
        }
    });
};

function onBgPlayerReady(event) {
    event.target.mute();
    event.target.playVideo();
}

function onBgPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        const fallback = document.querySelector('.video-fallback');
        if (fallback) {
            fallback.classList.add('fade-out');
        }
    }
    if (event.data === YT.PlayerState.ENDED) {
        event.target.playVideo(); // Force continuous loop
    }
}

// In case the YouTube API script loaded before main.js executed
if (window.YT && window.YT.Player) {
    window.onYouTubeIframeAPIReady();
}

document.addEventListener("DOMContentLoaded", function() {

    // =====================
    // Video Controls & Lightbox Interaction
    // =====================
    const toggleSoundBtn = document.getElementById('toggle-sound-btn');
    const watchTourBtn = document.getElementById('watch-tour-btn');
    const videoLightbox = document.getElementById('video-lightbox');
    const closeModalBtn = videoLightbox ? videoLightbox.querySelector('.close-modal') : null;

    if (toggleSoundBtn) {
        toggleSoundBtn.addEventListener('click', function() {
            if (bgPlayer && typeof bgPlayer.isMuted === 'function') {
                if (bgPlayer.isMuted()) {
                    bgPlayer.unMute();
                    toggleSoundBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
                    toggleSoundBtn.setAttribute('aria-label', 'كتم الصوت');
                } else {
                    bgPlayer.mute();
                    toggleSoundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
                    toggleSoundBtn.setAttribute('aria-label', 'تشغيل الصوت');
                }
            }
        });
    }

    if (watchTourBtn && videoLightbox) {
        watchTourBtn.addEventListener('click', function() {
            videoLightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Pause background video to save bandwidth
            if (bgPlayer && typeof bgPlayer.pauseVideo === 'function') {
                bgPlayer.pauseVideo();
            }
            
            // Play lightbox video with sound
            if (lightboxPlayer && typeof lightboxPlayer.playVideo === 'function') {
                lightboxPlayer.unMute();
                lightboxPlayer.playVideo();
            }
        });
    }

    function closeVideoLightbox() {
        if (videoLightbox) {
            videoLightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            
            // Pause lightbox video
            if (lightboxPlayer && typeof lightboxPlayer.pauseVideo === 'function') {
                lightboxPlayer.pauseVideo();
            }
            
            // Resume background video (muted)
            if (bgPlayer && typeof bgPlayer.playVideo === 'function') {
                bgPlayer.mute();
                // Update sound button state back to muted
                if (toggleSoundBtn) {
                    toggleSoundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
                    toggleSoundBtn.setAttribute('aria-label', 'تشغيل الصوت');
                }
                bgPlayer.playVideo();
            }
        }
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeVideoLightbox);
    }

    if (videoLightbox) {
        // Close modal if clicked outside the content box
        videoLightbox.addEventListener('click', function(e) {
            if (e.target === videoLightbox) {
                closeVideoLightbox();
            }
        });
    }

    // =====================
    // Scroll Animation (Intersection Observer)
    // =====================
    const fadeElements = document.querySelectorAll('.fade-in');

    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    fadeElements.forEach(el => {
        appearOnScroll.observe(el);
    });

    // =====================
    // Gallery Tab Filtering & Advanced Lightbox
    // =====================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // 1. Filtering Logic
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    item.classList.remove('hidden');
                    // Force display block for animation triggers
                    setTimeout(() => {
                        const img = item.querySelector('.gallery-img');
                        if (img) img.classList.add('appear');
                    }, 50);
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    // 2. Lightbox with Navigation
    if (galleryItems.length > 0) {
        let activeItems = [];
        let currentIndex = 0;

        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 8, 3, 0.95); display: none; justify-content: center;
            align-items: center; z-index: 2000; direction: ltr;
        `;
        document.body.appendChild(lightbox);

        // Container for image and info
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = 'position: relative; max-width: 85%; max-height: 80%; display: flex; flex-direction: column; align-items: center;';
        lightbox.appendChild(contentContainer);

        const lightboxImg = document.createElement('img');
        lightboxImg.style.cssText = 'max-width: 100%; max-height: 80vh; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); object-fit: contain; transition: opacity 0.25s ease-in-out; pointer-events: none; -webkit-user-drag: none; user-select: none;';
        contentContainer.appendChild(lightboxImg);

        // Caption
        const caption = document.createElement('div');
        caption.style.cssText = 'color: #fff; margin-top: 15px; font-family: var(--font-family); font-weight: 700; font-size: 1.1rem; text-align: center; width: 100%; direction: rtl;';
        contentContainer.appendChild(caption);

        // Navigation arrows
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        prevBtn.style.cssText = `
            position: absolute; left: 30px; top: 50%; transform: translateY(-50%);
            background: rgba(192, 138, 75, 0.2); border: 1px solid rgba(192, 138, 75, 0.4);
            color: #fff; width: 56px; height: 56px; border-radius: 50%; cursor: pointer;
            font-size: 1.5rem; display: flex; align-items: center; justify-content: center;
            transition: all 0.3s ease; z-index: 2100;
        `;
        lightbox.appendChild(prevBtn);

        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        nextBtn.style.cssText = `
            position: absolute; right: 30px; top: 50%; transform: translateY(-50%);
            background: rgba(192, 138, 75, 0.2); border: 1px solid rgba(192, 138, 75, 0.4);
            color: #fff; width: 56px; height: 56px; border-radius: 50%; cursor: pointer;
            font-size: 1.5rem; display: flex; align-items: center; justify-content: center;
            transition: all 0.3s ease; z-index: 2100;
        `;
        lightbox.appendChild(nextBtn);

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        closeBtn.style.cssText = `
            position: absolute; top: 20px; right: 30px;
            background: none; border: none; color: #fff; cursor: pointer;
            font-size: 2.2rem; display: flex; align-items: center; justify-content: center;
            transition: color 0.3s ease; z-index: 2100;
        `;
        lightbox.appendChild(closeBtn);

        // Hover effects
        [prevBtn, nextBtn].forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'var(--primary-color)';
                btn.style.borderColor = 'transparent';
                btn.style.boxShadow = '0 0 15px rgba(192, 138, 75, 0.5)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(192, 138, 75, 0.2)';
                btn.style.borderColor = 'rgba(192, 138, 75, 0.4)';
                btn.style.boxShadow = 'none';
            });
        });

        closeBtn.addEventListener('mouseenter', () => closeBtn.style.color = 'var(--primary-color)');
        closeBtn.addEventListener('mouseleave', () => closeBtn.style.color = '#fff');

        // Functions
        function updateActiveItems() {
            activeItems = Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
        }

        function showImage(index) {
            if (index < 0) index = activeItems.length - 1;
            if (index >= activeItems.length) index = 0;
            currentIndex = index;

            const item = activeItems[currentIndex];
            const img = item.querySelector('.gallery-img');
            
            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.src = img.src;
                caption.textContent = img.alt || '';
                lightboxImg.style.opacity = '1';
            }, 150);
        }

        // Event Listeners
        galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                updateActiveItems();
                const index = activeItems.indexOf(item);
                if (index !== -1) {
                    showImage(index);
                    lightbox.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showImage(currentIndex - 1);
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showImage(currentIndex + 1);
        });

        closeBtn.addEventListener('click', () => {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === contentContainer) {
                lightbox.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (lightbox.style.display === 'flex') {
                if (e.key === 'ArrowLeft') {
                    showImage(currentIndex - 1);
                } else if (e.key === 'ArrowRight') {
                    showImage(currentIndex + 1);
                } else if (e.key === 'Escape') {
                    lightbox.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            }
        });

        // 3. Image protection: Disable contextmenu (right click) and dragstart on all gallery elements
        lightbox.addEventListener('contextmenu', e => e.preventDefault());
    }

    const disableImageProtection = () => {
        document.querySelectorAll('.gallery-img, #lightbox img').forEach(img => {
            img.addEventListener('contextmenu', e => e.preventDefault());
            img.addEventListener('dragstart', e => e.preventDefault());
        });
    };
    disableImageProtection();
    // Run again in case elements are updated or rendered
    window.addEventListener('load', disableImageProtection);
});
