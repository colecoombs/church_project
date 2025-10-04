const express = require('express');
const { authenticateToken: auth } = require('../middleware/auth');

const router = express.Router();

// In-memory settings store (in production, use database)
let settings = {
  churchName: 'Grace Community Church',
  churchDescription: 'Welcome to our church family! Join us for worship, fellowship, and spiritual growth.',
  pastorName: 'Pastor John Smith',
  serviceTime: 'Sundays at 10:00 AM',
  address: '123 Main Street, Anytown, ST 12345',
  phone: '(555) 123-4567',
  email: 'info@gracechurch.org',
  facebookUrl: 'https://facebook.com/gracechurch',
  instagramUrl: 'https://instagram.com/gracechurch',
  twitterUrl: 'https://twitter.com/gracechurch',
  youtubeUrl: 'https://youtube.com/gracechurch',
  livestreamUrl: '',
  theme: 'default',
  showDonateButton: true,
  donateUrl: ''
};

// Get all settings (requires authentication)
router.get('/', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// Get public settings (no authentication required)
router.get('/public', async (req, res) => {
  try {
    // Only return publicly visible settings
    const publicSettings = {
      churchName: settings.churchName,
      churchDescription: settings.churchDescription,
      pastorName: settings.pastorName,
      serviceTime: settings.serviceTime,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      twitterUrl: settings.twitterUrl,
      youtubeUrl: settings.youtubeUrl,
      livestreamUrl: settings.livestreamUrl,
      theme: settings.theme,
      showDonateButton: settings.showDonateButton,
      donateUrl: settings.donateUrl
    };

    res.json({
      success: true,
      data: publicSettings
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// Update a specific setting (requires authentication)
router.put('/:key', auth, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    // Validate that the setting key exists
    if (!(key in settings)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid setting key'
      });
    }

    // Validate value based on setting type
    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: 'Setting value is required'
      });
    }

    // Special validation for URLs
    const urlFields = ['facebookUrl', 'instagramUrl', 'twitterUrl', 'youtubeUrl', 'livestreamUrl', 'donateUrl'];
    if (urlFields.includes(key) && value) {
      try {
        new URL(value);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid URL format'
        });
      }
    }

    // Special validation for email
    if (key === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }
    }

    // Special validation for boolean fields
    if (key === 'showDonateButton') {
      if (typeof value !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Value must be true or false'
        });
      }
    }

    // Update the setting
    settings[key] = value;

    res.json({
      success: true,
      message: `Setting '${key}' updated successfully`,
      data: { [key]: value }
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update setting'
    });
  }
});

// Update multiple settings at once (requires authentication)
router.put('/', auth, async (req, res) => {
  try {
    const updates = req.body;

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body'
      });
    }

    const validationErrors = [];
    const validUpdates = {};

    // Validate each setting
    for (const [key, value] of Object.entries(updates)) {
      // Check if setting key exists
      if (!(key in settings)) {
        validationErrors.push(`Invalid setting key: ${key}`);
        continue;
      }

      // Validate value
      if (value === undefined || value === null) {
        validationErrors.push(`Value required for setting: ${key}`);
        continue;
      }

      // URL validation
      const urlFields = ['facebookUrl', 'instagramUrl', 'twitterUrl', 'youtubeUrl', 'livestreamUrl', 'donateUrl'];
      if (urlFields.includes(key) && value) {
        try {
          new URL(value);
        } catch (error) {
          validationErrors.push(`Invalid URL format for ${key}`);
          continue;
        }
      }

      // Email validation
      if (key === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          validationErrors.push(`Invalid email format for ${key}`);
          continue;
        }
      }

      // Boolean validation
      if (key === 'showDonateButton' && typeof value !== 'boolean') {
        validationErrors.push(`Value for ${key} must be true or false`);
        continue;
      }

      validUpdates[key] = value;
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors
      });
    }

    // Apply valid updates
    Object.assign(settings, validUpdates);

    res.json({
      success: true,
      message: `${Object.keys(validUpdates).length} settings updated successfully`,
      data: validUpdates
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// Reset settings to defaults (requires authentication and admin role)
router.post('/reset', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Reset to default settings
    settings = {
      churchName: 'Grace Community Church',
      churchDescription: 'Welcome to our church family! Join us for worship, fellowship, and spiritual growth.',
      pastorName: 'Pastor John Smith',
      serviceTime: 'Sundays at 10:00 AM',
      address: '123 Main Street, Anytown, ST 12345',
      phone: '(555) 123-4567',
      email: 'info@gracechurch.org',
      facebookUrl: 'https://facebook.com/gracechurch',
      instagramUrl: 'https://instagram.com/gracechurch',
      twitterUrl: 'https://twitter.com/gracechurch',
      youtubeUrl: 'https://youtube.com/gracechurch',
      livestreamUrl: '',
      theme: 'default',
      showDonateButton: true,
      donateUrl: ''
    };

    res.json({
      success: true,
      message: 'Settings reset to defaults',
      data: settings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings'
    });
  }
});

// Export settings for backup (requires authentication and admin role)
router.get('/export', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `church-settings-${timestamp}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.json({
      exportDate: new Date().toISOString(),
      settings: settings
    });
  } catch (error) {
    console.error('Error exporting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export settings'
    });
  }
});

// Import settings from backup (requires authentication and admin role)
router.post('/import', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { settings: importedSettings } = req.body;

    if (!importedSettings || typeof importedSettings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings data'
      });
    }

    // Validate imported settings structure
    const requiredKeys = Object.keys(settings);
    const importedKeys = Object.keys(importedSettings);
    
    const missingKeys = requiredKeys.filter(key => !importedKeys.includes(key));
    if (missingKeys.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required settings',
        missingKeys: missingKeys
      });
    }

    // Apply imported settings
    settings = { ...settings, ...importedSettings };

    res.json({
      success: true,
      message: 'Settings imported successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error importing settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import settings'
    });
  }
});

module.exports = router;