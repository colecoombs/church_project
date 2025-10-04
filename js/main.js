// Church Website Main JavaScript
class ChurchWebsite {
    constructor() {
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadContent();
        this.setupVideoPlayer();
        this.loadPreviousVideos();
        this.setupSocialLinks();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupContactForm();
        this.updateContactInfo();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    async loadContent() {
        try {
            const [settingsResponse, videosResponse, currentVideoResponse] = await Promise.all([
                fetch('/api/settings/public'),
                fetch('/api/videos'),
                fetch('/api/videos/current')
            ]);
            
            const settings = settingsResponse.ok ? await settingsResponse.json() : { data: {} };
            const videos = videosResponse.ok ? await videosResponse.json() : { data: [] };
            const currentVideo = currentVideoResponse.ok ? await currentVideoResponse.json() : { data: null };
            
            this.content = {
                currentVideo: currentVideo.data,
                previousVideos: videos.data.filter(v => !v.isCurrentVideo),
                churchName: settings.data.churchName || "Grace Community Church",
                tagline: "Faith • Community • Hope",
                description: settings.data.churchDescription || "Join us every Sunday for worship, fellowship, and spiritual growth.",
                socialLinks: {
                    facebook: settings.data.facebookUrl || "",
                    instagram: settings.data.instagramUrl || "",
                    twitter: settings.data.twitterUrl || "",
                    youtube: settings.data.youtubeUrl || ""
                },
                settings: settings.data
            };
        } catch (error) {
            console.error('Error loading content:', error);
            this.content = {
                currentVideo: null,
                previousVideos: [],
                churchName: "Grace Community Church",
                tagline: "Faith • Community • Hope",
                description: "Join us every Sunday for worship, fellowship, and spiritual growth.",
                socialLinks: {
                    facebook: "",
                    instagram: "",
                    twitter: "",
                    youtube: ""
                }
            };
        }
    }

    setupVideoPlayer() {
        const mainVideo = document.getElementById('main-video');
        if (!mainVideo || !this.content.currentVideo) return;

        const video = this.content.currentVideo;
        this.displayVideo(mainVideo, video);
    }

    displayVideo(container, video) {
        container.innerHTML = '';

        if (video.type === 'youtube') {
            const iframe = document.createElement('iframe');
            iframe.src = video.url;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            container.appendChild(iframe);
        } else if (video.type === 'upload') {
            const videoElement = document.createElement('video');
            videoElement.src = video.url;
            videoElement.controls = true;
            videoElement.setAttribute('controlsList', 'nodownload');
            container.appendChild(videoElement);
        }
    }

    loadPreviousVideos() {
        const videoGrid = document.getElementById('video-grid');
        if (!videoGrid || !this.content.previousVideos) return;

        videoGrid.innerHTML = '';

        this.content.previousVideos.forEach(video => {
            const videoCard = this.createVideoCard(video);
            videoGrid.appendChild(videoCard);
        });
    }

    createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card fade-in-up';
        card.addEventListener('click', () => this.playVideo(video));

        const thumbnail = video.thumbnail || this.getDefaultThumbnail(video);
        const formattedDate = this.formatDate(video.date);

        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${thumbnail}" alt="${video.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkY2NzU3Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iMjUiIGZpbGw9IndoaXRlIi8+Cjxwb2x5Z29uIHBvaW50cz0iMTQ1LDkwIDE0NSw5MCAxNjUsMTAwIDE0NSwxMTAiIGZpbGw9IiNGRjY3NTciLz4KPC9zdmc+'">
                <div class="play-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="video-info">
                <h3>${video.title}</h3>
                <p>${video.description}</p>
                <div class="video-date">${formattedDate}</div>
            </div>
        `;

        return card;
    }

    getDefaultThumbnail(video) {
        if (video.type === 'youtube' && video.url) {
            const videoId = this.extractYouTubeVideoId(video.url);
            if (videoId) {
                return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }
        }
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkY2NzU3Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iMjUiIGZpbGw9IndoaXRlIi8+Cjxwb2x5Z29uIHBvaW50cz0iMTQ1LDkwIDE0NSw5MCAxNjUsMTAwIDE0NSwxMTAiIGZpbGw9IiNGRjY3NTciLz4KPC9zdmc+';
    }

    extractYouTubeVideoId(url) {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    playVideo(video) {
        const mainVideo = document.getElementById('main-video');
        if (mainVideo) {
            this.displayVideo(mainVideo, video);
            // Scroll to video
            document.getElementById('home').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    setupSocialLinks() {
        if (!this.content.socialMedia) return;

        document.querySelectorAll('.social-link').forEach(link => {
            const platform = link.getAttribute('data-platform');
            if (this.content.socialMedia[platform]) {
                link.href = this.content.socialMedia[platform];
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        });
    }

    setupMobileMenu() {
        // Additional mobile menu functionality
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const headerHeight = document.querySelector('.header').offsetHeight;
                        const targetPosition = target.offsetTop - headerHeight;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    setupSmoothScrolling() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Header scroll effect
        let lastScrollTop = 0;
        const header = document.querySelector('.header');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        });
    }

    // Public method to refresh content (used by admin panel)
    async refreshContent() {
        await this.loadContent();
        this.setupVideoPlayer();
        this.loadPreviousVideos();
        this.setupSocialLinks();
        this.updateContactInfo();
    }

    // Update contact information from settings
    updateContactInfo() {
        if (!this.content) return;

        const addressEl = document.getElementById('church-address');
        const phoneEl = document.getElementById('church-phone');
        const emailEl = document.getElementById('church-email');
        const serviceTimesEl = document.getElementById('service-times');

        if (addressEl && this.content.settings?.address) {
            addressEl.textContent = this.content.settings.address;
        }
        if (phoneEl && this.content.settings?.phone) {
            phoneEl.textContent = this.content.settings.phone;
        }
        if (emailEl && this.content.settings?.email) {
            emailEl.textContent = this.content.settings.email;
        }
        if (serviceTimesEl && this.content.settings?.serviceTime) {
            serviceTimesEl.textContent = this.content.settings.serviceTime;
        }
    }

    // Setup contact form
    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<div class="loading"></div> Sending...';
            submitBtn.disabled = true;

            try {
                // In a real implementation, you would send this to a server endpoint
                // For now, we'll simulate a successful submission
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Show success message
                document.getElementById('contact-success').style.display = 'block';
                document.getElementById('contact-error').style.display = 'none';
                
                // Reset form
                contactForm.reset();
                
                // Show notification
                showNotification('Thank you! Your message has been sent successfully.', 'success');
                
            } catch (error) {
                console.error('Contact form error:', error);
                document.getElementById('contact-error').style.display = 'block';
                document.getElementById('contact-success').style.display = 'none';
                showNotification('Sorry, there was an error sending your message.', 'error');
            } finally {
                // Restore button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add notification animations to CSS
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.churchWebsite = new ChurchWebsite();
});

// Export for use in admin panel
window.ChurchWebsite = ChurchWebsite;
window.showNotification = showNotification;