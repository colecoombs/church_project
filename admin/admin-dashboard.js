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
        this.loadContacts();
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
            const [videosResponse, settingsResponse] = await Promise.all([
                fetch('/.netlify/functions/videos', {
                    headers: adminAuth.getAuthHeaders(),
                    credentials: 'include'
                }),
                fetch('/.netlify/functions/settings', {
                    headers: adminAuth.getAuthHeaders(),
                    credentials: 'include'
                })
            ]);

            if (!videosResponse.ok || !settingsResponse.ok) {
                throw new Error('Failed to load content');
            }

            const videosData = await videosResponse.json();
            const settingsData = await settingsResponse.json();

            this.contentData = {
                currentVideo: videosData.data.find(v => v.featured) || null,
                previousVideos: videosData.data || [],
                settings: settingsData.data || {}
            };
        } catch (error) {
            console.error('Error loading content:', error);
            this.showNotification('Error loading content data', 'error');
            this.contentData = {
                currentVideo: null,
                previousVideos: [],
                settings: {}
            };
        }
    }

    async populateUserInfo() {
        const sessionData = await adminAuth.getSessionData();
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
        if (this.contentData.settings) {
            const settings = this.contentData.settings;
            const facebookInput = document.getElementById('facebookUrl');
            const youtubeInput = document.getElementById('youtubeUrl');
            
            if (facebookInput) facebookInput.value = settings.facebook || '';
            if (youtubeInput) youtubeInput.value = settings.youtube || '';
        }
    }

    loadSettingsForm() {
        if (this.contentData.settings) {
            const settings = this.contentData.settings;
            document.getElementById('churchName').value = settings.churchName || '';
            document.getElementById('churchPhone').value = settings.phone || '';
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
            description: formData.get('videoDescription'),
            featured: true
        };

        if (videoData.type === 'youtube') {
            videoData.url = formData.get('youtubeUrl');
        } else if (videoData.type === 'upload') {
            const file = document.getElementById('videoFile').files[0];
            if (file) {
                this.showNotification('File upload not yet implemented. Please use YouTube links.', 'error');
                return;
            }
        }

        try {
            // First, unfeature all existing videos
            if (this.contentData && this.contentData.previousVideos) {
                for (const video of this.contentData.previousVideos) {
                    if (video.featured) {
                        await this.updateVideoFeatured(video.id, false);
                    }
                }
            }

            // Add new featured video
            const response = await fetch('/.netlify/functions/videos', {
                method: 'POST',
                headers: adminAuth.getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(videoData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save video');
            }

            await this.loadContent();
            this.showNotification('Current video updated successfully!', 'success');
        } catch (error) {
            console.error('Error saving video:', error);
            this.showNotification('Error saving video: ' + error.message, 'error');
        }
    }

    async updateVideoFeatured(videoId, featured) {
        // This would need a PUT endpoint, for now we'll skip
        console.log('Would update video', videoId, 'featured status to', featured);
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
        
        // Add social media links to settings
        this.contentData.settings = {
            ...this.contentData.settings,
            facebook: formData.get('facebook'),
            youtube: formData.get('youtube')
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
        if (!confirm('Are you sure you want to delete this video?')) {
            return;
        }

        try {
            const response = await fetch(`/.netlify/functions/videos?id=${videoId}`, {
                method: 'DELETE',
                headers: adminAuth.getAuthHeaders(),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete video');
            }

            // Reload content from server
            await this.loadContent();
            this.loadVideoLibrary();
            this.updateDashboardStats();
            this.showNotification('Video deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting video:', error);
            this.showNotification('Error deleting video: ' + error.message, 'error');
        }
    }

    async saveContent() {
        try {
            // Save settings to the backend
            const response = await fetch('/.netlify/functions/settings', {
                method: 'PUT',
                headers: adminAuth.getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(this.contentData.settings)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save settings');
            }

            const result = await response.json();
            console.log('Settings saved successfully:', result);
            
            // Also keep in localStorage as backup
            localStorage.setItem('churchContent', JSON.stringify(this.contentData));
            
        } catch (error) {
            console.error('Error saving content:', error);
            this.showNotification('Error saving content: ' + error.message, 'error');
            throw error;
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

    // Contact Management Methods
    async loadContacts() {
        try {
            const response = await fetch('/.netlify/functions/contacts', {
                method: 'GET',
                headers: adminAuth.getAuthHeaders(),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to load contacts');
            }

            const result = await response.json();
            this.contacts = result.data || [];
            this.displayContacts(this.contacts);
            this.setupContactFilters();
        } catch (error) {
            console.error('Error loading contacts:', error);
            const contactsList = document.getElementById('contactsList');
            if (contactsList) {
                contactsList.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load contact submissions</p>
                    </div>
                `;
            }
        }
    }

    displayContacts(contacts) {
        const contactsList = document.getElementById('contactsList');
        
        if (!contacts || contacts.length === 0) {
            contactsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No contact submissions yet</p>
                </div>
            `;
            return;
        }

        contactsList.innerHTML = contacts.map(contact => `
            <div class="contact-item ${contact.status === 'new' ? 'unread' : ''}" data-id="${contact.id}" data-status="${contact.status}">
                <div class="contact-header">
                    <div class="contact-info">
                        <strong>${this.escapeHtml(contact.name)}</strong>
                        <span class="contact-email">${this.escapeHtml(contact.email)}</span>
                        ${contact.phone ? `<span class="contact-phone">${this.escapeHtml(contact.phone)}</span>` : ''}
                    </div>
                    <div class="contact-meta">
                        <span class="contact-date">${this.formatContactDate(contact.createdat)}</span>
                        <span class="contact-status status-${contact.status}">${contact.status}</span>
                    </div>
                </div>
                <div class="contact-subject">
                    <strong>Subject:</strong> ${this.escapeHtml(contact.subject)}
                </div>
                <div class="contact-message">
                    ${this.escapeHtml(contact.message)}
                </div>
                <div class="contact-actions">
                    ${contact.status === 'new' ? 
                        `<button class="btn btn-sm btn-secondary" onclick="adminDashboard.markAsRead(${contact.id})">
                            <i class="fas fa-check"></i> Mark as Read
                        </button>` : 
                        `<button class="btn btn-sm btn-secondary" onclick="adminDashboard.markAsNew(${contact.id})">
                            <i class="fas fa-undo"></i> Mark as New
                        </button>`
                    }
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteContact(${contact.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupContactFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                this.filterContacts(filter);
            });
        });
    }

    filterContacts(filter) {
        let filtered = this.contacts;
        
        if (filter === 'new') {
            filtered = this.contacts.filter(c => c.status === 'new');
        } else if (filter === 'read') {
            filtered = this.contacts.filter(c => c.status === 'read');
        }
        
        this.displayContacts(filtered);
    }

    async markAsRead(contactId) {
        await this.updateContactStatus(contactId, 'read');
    }

    async markAsNew(contactId) {
        await this.updateContactStatus(contactId, 'new');
    }

    async updateContactStatus(contactId, status) {
        try {
            const response = await fetch('/.netlify/functions/contacts', {
                method: 'PUT',
                headers: adminAuth.getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({ id: contactId, status })
            });

            if (!response.ok) {
                throw new Error('Failed to update contact status');
            }

            await this.loadContacts();
            this.showNotification('Contact status updated', 'success');
        } catch (error) {
            console.error('Error updating contact:', error);
            this.showNotification('Failed to update contact status', 'error');
        }
    }

    async deleteContact(contactId) {
        if (!confirm('Are you sure you want to delete this contact submission?')) {
            return;
        }

        try {
            const response = await fetch(`/.netlify/functions/contacts?id=${contactId}`, {
                method: 'DELETE',
                headers: adminAuth.getAuthHeaders(),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to delete contact');
            }

            await this.loadContacts();
            this.showNotification('Contact deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting contact:', error);
            this.showNotification('Failed to delete contact', 'error');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatContactDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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