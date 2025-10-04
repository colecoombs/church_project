// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.contentData = null;
        this.init();
    }

    async init() {
        // Check if user is logged in
        if (!adminAuth.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        this.setupNavigation();
        this.setupEventListeners();
        await this.loadContent();
        this.populateUserInfo();
        this.updateDashboardStats();
        this.loadCurrentVideoForm();
        this.loadSocialMediaForm();
        this.loadSettingsForm();
        this.loadVideoLibrary();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const contentSections = document.querySelectorAll('.content-section');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all nav items and sections
                navItems.forEach(nav => nav.classList.remove('active'));
                contentSections.forEach(section => section.classList.remove('active'));
                
                // Add active class to clicked nav item
                item.classList.add('active');
                
                // Show corresponding section
                const sectionId = item.getAttribute('data-section');
                const section = document.getElementById(sectionId);
                if (section) {
                    section.classList.add('active');
                }
            });
        });
    }

    setupEventListeners() {
        // Current Video Form
        document.getElementById('currentVideoForm').addEventListener('submit', (e) => this.handleCurrentVideoSubmit(e));
        
        // Video Library Form
        document.getElementById('addVideoForm').addEventListener('submit', (e) => this.handleAddVideoSubmit(e));
        
        // Social Media Form
        document.getElementById('socialMediaForm').addEventListener('submit', (e) => this.handleSocialMediaSubmit(e));
        
        // Settings Form
        document.getElementById('settingsForm').addEventListener('submit', (e) => this.handleSettingsSubmit(e));

        // File drag and drop
        this.setupFileUpload();
    }

    setupFileUpload() {
        const fileUploads = document.querySelectorAll('.file-upload');
        
        fileUploads.forEach(upload => {
            upload.addEventListener('dragover', (e) => {
                e.preventDefault();
                upload.classList.add('dragover');
            });

            upload.addEventListener('dragleave', () => {
                upload.classList.remove('dragover');
            });

            upload.addEventListener('drop', (e) => {
                e.preventDefault();
                upload.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                const fileInput = upload.querySelector('input[type="file"]');
                if (files.length > 0 && fileInput) {
                    fileInput.files = files;
                    this.updateFileUploadDisplay(upload, files[0]);
                }
            });
        });

        // File input change handlers
        document.getElementById('videoFile').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const upload = e.target.closest('.file-upload');
                this.updateFileUploadDisplay(upload, e.target.files[0]);
            }
        });

        document.getElementById('libraryVideoFile').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const upload = e.target.closest('.file-upload');
                this.updateFileUploadDisplay(upload, e.target.files[0]);
            }
        });
    }

    updateFileUploadDisplay(upload, file) {
        const fileInfo = upload.querySelector('.file-info');
        fileInfo.textContent = `Selected: ${file.name} (${this.formatFileSize(file.size)})`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async loadContent() {
        try {
            const response = await fetch('/api/videos');
            if (!response.ok) {
                throw new Error('Failed to load content');
            }
            this.contentData = await response.json();
        } catch (error) {
            console.error('Error loading content:', error);
            this.showNotification('Error loading content data', 'error');
            this.contentData = {
                currentVideo: null,
                previousVideos: [],
                socialMedia: {},
                settings: {}
            };
        }
    }

    populateUserInfo() {
        const sessionData = adminAuth.getSessionData();
        if (sessionData) {
            document.getElementById('currentUser').textContent = sessionData.username;
        }
    }

    updateDashboardStats() {
        const totalVideos = this.contentData.previousVideos ? this.contentData.previousVideos.length : 0;
        document.getElementById('totalVideos').textContent = totalVideos;
        
        const lastUpdated = new Date().toLocaleDateString();
        document.getElementById('lastUpdated').textContent = lastUpdated;
    }

    loadCurrentVideoForm() {
        if (this.contentData.currentVideo) {
            const video = this.contentData.currentVideo;
            document.getElementById('videoType').value = video.type || 'youtube';
            document.getElementById('videoTitle').value = video.title || '';
            document.getElementById('videoDescription').value = video.description || '';
            
            if (video.type === 'youtube') {
                document.getElementById('youtubeUrl').value = video.url || '';
            }
            
            toggleVideoInputs();
        }
    }

    loadSocialMediaForm() {
        if (this.contentData.socialMedia) {
            const social = this.contentData.socialMedia;
            document.getElementById('facebookUrl').value = social.facebook || '';
            document.getElementById('instagramUrl').value = social.instagram || '';
            document.getElementById('youtubeChannelUrl').value = social.youtube || '';
            document.getElementById('twitterUrl').value = social.twitter || '';
        }
    }

    loadSettingsForm() {
        if (this.contentData.settings) {
            const settings = this.contentData.settings;
            document.getElementById('churchName').value = settings.churchName || '';
            document.getElementById('churchPhone').value = settings.phone || '';
            document.getElementById('churchAddress').value = settings.address || '';
            document.getElementById('churchEmail').value = settings.email || '';
        }
    }

    loadVideoLibrary() {
        const libraryList = document.getElementById('videoLibraryList');
        libraryList.innerHTML = '';

        if (!this.contentData.previousVideos || this.contentData.previousVideos.length === 0) {
            libraryList.innerHTML = '<p>No videos in library</p>';
            return;
        }

        this.contentData.previousVideos.forEach(video => {
            const videoItem = this.createVideoLibraryItem(video);
            libraryList.appendChild(videoItem);
        });
    }

    createVideoLibraryItem(video) {
        const item = document.createElement('div');
        item.className = 'video-item';
        
        const thumbnail = video.thumbnail || this.getYouTubeThumbnail(video.url);
        const formattedDate = this.formatDate(video.date);

        item.innerHTML = `
            <img src="${thumbnail}" alt="${video.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjY4IiB2aWV3Qm94PSIwIDAgMTIwIDY4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjY4IiBmaWxsPSIjRkY2NzU3Ii8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iMzQiIHI9IjEwIiBmaWxsPSJ3aGl0ZSIvPgo8cG9seWdvbiBwb2ludHM9IjU3LDI5IDU3LDI5IDY2LDM0IDU3LDM5IiBmaWxsPSIjRkY2NzU3Ii8+Cjwvc3ZnPg=='">
            <div class="video-item-info">
                <div class="video-item-title">${video.title}</div>
                <div class="video-item-desc">${video.description}</div>
                <div class="video-item-date">${formattedDate}</div>
            </div>
            <div class="video-item-actions">
                <button class="btn btn-small btn-secondary" onclick="adminDashboard.makeCurrentVideo(${video.id})">
                    Make Current
                </button>
                <button class="btn btn-small btn-danger" onclick="adminDashboard.deleteVideo(${video.id})">
                    Delete
                </button>
            </div>
        `;

        return item;
    }

    getYouTubeThumbnail(url) {
        const videoId = this.extractYouTubeVideoId(url);
        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        }
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjY4IiB2aWV3Qm94PSIwIDAgMTIwIDY4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjY4IiBmaWxsPSIjRkY2NzU3Ii8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iMzQiIHI9IjEwIiBmaWxsPSJ3aGl0ZSIvPgo8cG9seWdvbiBwb2ludHM9IjU3LDI5IDU3LDI5IDY2LDM0IDU3LDM5IiBmaWxsPSIjRkY2NzU3Ii8+Cjwvc3ZnPg==';
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

    async handleCurrentVideoSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const videoData = {
            type: formData.get('videoType'),
            title: formData.get('videoTitle'),
            description: formData.get('videoDescription')
        };

        if (videoData.type === 'youtube') {
            videoData.url = this.convertToEmbedUrl(formData.get('youtubeUrl'));
        } else if (videoData.type === 'upload') {
            const file = document.getElementById('videoFile').files[0];
            if (file) {
                // In a real implementation, you would upload the file to a server
                videoData.url = URL.createObjectURL(file);
            }
        }

        this.contentData.currentVideo = videoData;
        await this.saveContent();
        this.showNotification('Current video updated successfully!', 'success');
    }

    async handleAddVideoSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const videoData = {
            id: Date.now(), // Simple ID generation
            type: formData.get('libraryVideoType'),
            title: formData.get('libraryVideoTitle'),
            description: formData.get('libraryVideoDescription'),
            date: formData.get('libraryVideoDate')
        };

        if (videoData.type === 'youtube') {
            const url = formData.get('libraryYoutubeUrl');
            videoData.url = this.convertToEmbedUrl(url);
            videoData.thumbnail = this.getYouTubeThumbnail(url);
        } else if (videoData.type === 'upload') {
            const file = document.getElementById('libraryVideoFile').files[0];
            if (file) {
                // In a real implementation, you would upload the file to a server
                videoData.url = URL.createObjectURL(file);
            }
        }

        if (!this.contentData.previousVideos) {
            this.contentData.previousVideos = [];
        }
        
        this.contentData.previousVideos.unshift(videoData); // Add to beginning
        
        await this.saveContent();
        this.loadVideoLibrary();
        this.updateDashboardStats();
        e.target.reset();
        this.showNotification('Video added to library successfully!', 'success');
    }

    async handleSocialMediaSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        this.contentData.socialMedia = {
            facebook: formData.get('facebookUrl'),
            instagram: formData.get('instagramUrl'),
            youtube: formData.get('youtubeChannelUrl'),
            twitter: formData.get('twitterUrl')
        };

        await this.saveContent();
        this.showNotification('Social media links updated successfully!', 'success');
    }

    async handleSettingsSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        this.contentData.settings = {
            churchName: formData.get('churchName'),
            phone: formData.get('churchPhone'),
            address: formData.get('churchAddress'),
            email: formData.get('churchEmail')
        };

        await this.saveContent();
        this.showNotification('Settings updated successfully!', 'success');
    }

    convertToEmbedUrl(url) {
        if (!url) return '';
        
        const videoId = this.extractYouTubeVideoId(url);
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        
        return url;
    }

    async makeCurrentVideo(videoId) {
        const video = this.contentData.previousVideos.find(v => v.id === videoId);
        if (video) {
            this.contentData.currentVideo = { ...video };
            await this.saveContent();
            this.loadCurrentVideoForm();
            this.showNotification('Video set as current successfully!', 'success');
        }
    }

    async deleteVideo(videoId) {
        if (confirm('Are you sure you want to delete this video?')) {
            this.contentData.previousVideos = this.contentData.previousVideos.filter(v => v.id !== videoId);
            await this.saveContent();
            this.loadVideoLibrary();
            this.updateDashboardStats();
            this.showNotification('Video deleted successfully!', 'success');
        }
    }

    async saveContent() {
        try {
            // In a real implementation, this would save to a server
            // For now, we'll simulate saving by storing in localStorage
            localStorage.setItem('churchContent', JSON.stringify(this.contentData));
            
            // Also try to update the JSON file (this would need server support)
            // For demonstration, we'll just log it
            console.log('Content saved:', this.contentData);
            
        } catch (error) {
            console.error('Error saving content:', error);
            this.showNotification('Error saving content', 'error');
        }
    }

    showNotification(message, type = 'info') {
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
}

// Utility functions for the dashboard
function toggleVideoInputs() {
    const videoType = document.getElementById('videoType').value;
    const youtubeInput = document.getElementById('youtubeInput');
    const uploadInput = document.getElementById('uploadInput');
    
    if (videoType === 'youtube') {
        youtubeInput.style.display = 'block';
        uploadInput.style.display = 'none';
    } else {
        youtubeInput.style.display = 'none';
        uploadInput.style.display = 'block';
    }
}

function toggleLibraryVideoInputs() {
    const videoType = document.getElementById('libraryVideoType').value;
    const youtubeInput = document.getElementById('libraryYoutubeInput');
    const uploadInput = document.getElementById('libraryUploadInput');
    
    if (videoType === 'youtube') {
        youtubeInput.style.display = 'block';
        uploadInput.style.display = 'none';
    } else {
        youtubeInput.style.display = 'none';
        uploadInput.style.display = 'block';
    }
}

function previewCurrentVideo() {
    const videoType = document.getElementById('videoType').value;
    const preview = document.getElementById('currentVideoPreview');
    
    if (videoType === 'youtube') {
        const url = document.getElementById('youtubeUrl').value;
        if (url) {
            const videoId = adminDashboard.extractYouTubeVideoId(url);
            if (videoId) {
                preview.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
            }
        }
    } else if (videoType === 'upload') {
        const file = document.getElementById('videoFile').files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            preview.innerHTML = `<video src="${url}" controls></video>`;
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});