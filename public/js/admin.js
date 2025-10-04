// Notification helper
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type} show`;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Update featured video
document.getElementById('featured-video-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    const response = await fetch('/api/video/featured', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showNotification('Featured video updated successfully!');
    } else {
      showNotification('Failed to update featured video', 'error');
    }
  } catch (error) {
    showNotification('Error updating featured video', 'error');
    console.error(error);
  }
});

// Add archived video
document.getElementById('add-video-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    const response = await fetch('/api/video/archived', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showNotification('Video added successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      showNotification('Failed to add video', 'error');
    }
  } catch (error) {
    showNotification('Error adding video', 'error');
    console.error(error);
  }
});

// Delete archived video
document.querySelectorAll('.delete-video').forEach(button => {
  button.addEventListener('click', async (e) => {
    const id = e.currentTarget.dataset.id;
    
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/video/archived/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        showNotification('Video deleted successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showNotification('Failed to delete video', 'error');
      }
    } catch (error) {
      showNotification('Error deleting video', 'error');
      console.error(error);
    }
  });
});

// Update settings
document.getElementById('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    churchName: formData.get('churchName'),
    socialMedia: {
      facebook: formData.get('facebook'),
      twitter: formData.get('twitter'),
      instagram: formData.get('instagram'),
      youtube: formData.get('youtube'),
    }
  };
  
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showNotification('Settings updated successfully!');
    } else {
      showNotification('Failed to update settings', 'error');
    }
  } catch (error) {
    showNotification('Error updating settings', 'error');
    console.error(error);
  }
});
