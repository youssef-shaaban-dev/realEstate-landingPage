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
    // Lightbox for Gallery Images
    // =====================
    const galleryImages = document.querySelectorAll('.gallery-img');

    if (galleryImages.length > 0) {
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.92); display: none; justify-content: center;
            align-items: center; z-index: 2000; cursor: pointer;
        `;
        document.body.appendChild(lightbox);

        const lightboxImg = document.createElement('img');
        lightboxImg.style.cssText = 'max-width: 90%; max-height: 90%; border-radius: 12px; box-shadow: 0 0 40px rgba(0,0,0,0.6);';
        lightbox.appendChild(lightboxImg);

        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
        });

        lightbox.addEventListener('click', () => {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
});
