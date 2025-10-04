const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Video = require('../models/Video');
const { authenticateToken: auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/videos');
    // Use synchronous mkdir for multer callback
    const fsSync = require('fs');
    if (!fsSync.existsSync(uploadDir)) {
      fsSync.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|wmv|flv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
});

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.findAll();
    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos'
    });
  }
});

// Get current video
router.get('/current', async (req, res) => {
  try {
    const currentVideo = await Video.findCurrent();
    res.json({
      success: true,
      data: currentVideo
    });
  } catch (error) {
    console.error('Error fetching current video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current video'
    });
  }
});

// Create new video (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, type, url, thumbnail } = req.body;

    // Validate required fields
    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title and type are required'
      });
    }

    // Validate type
    if (!['youtube', 'upload'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "youtube" or "upload"'
      });
    }

    // For YouTube videos, URL is required
    if (type === 'youtube' && !url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required for YouTube videos'
      });
    }

    const videoData = {
      title,
      description,
      type,
      url,
      thumbnail,
      createdBy: req.user.id
    };

    const video = await Video.create(videoData);

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video
    });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create video'
    });
  }
});

// Upload video file (requires authentication)
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    const { title, description } = req.body;

    if (!title) {
      // Clean up uploaded file if title is missing
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const videoData = {
      title,
      description,
      type: 'upload',
      url: `/uploads/videos/${req.file.filename}`,
      createdBy: req.user.id
    };

    const video = await Video.create(videoData);

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: video
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload video'
    });
  }
});

// Set video as current (requires authentication)
router.put('/:id/current', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const success = await Video.setAsCurrent(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      message: 'Video set as current successfully'
    });
  } catch (error) {
    console.error('Error setting current video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set current video'
    });
  }
});

// Update video (requires authentication)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (thumbnail) updateData.thumbnail = thumbnail;

    const success = await Video.update(id, updateData);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      message: 'Video updated successfully'
    });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video'
    });
  }
});

// Delete video (requires authentication)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get video info before deletion to clean up files
    const video = await Video.findById(id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Delete video record
    const success = await Video.delete(id);

    if (success) {
      // Clean up uploaded file if it exists
      if (video.type === 'upload' && video.url) {
        const filePath = path.join(__dirname, '../../', video.url);
        await fs.unlink(filePath).catch(console.error);
      }

      res.json({
        success: true,
        message: 'Video deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete video'
      });
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video'
    });
  }
});

// Increment video view count
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await Video.incrementViewCount(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      message: 'View count updated'
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update view count'
    });
  }
});

module.exports = router;