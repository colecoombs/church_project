const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { promisify } = require('util');

class Video {
  constructor() {
    this.dbPath = path.join(__dirname, '../database/church.db');
  }

  getDb() {
    return new sqlite3.Database(this.dbPath);
  }

  // Promisify database methods
  async runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      db.all(query, params, (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async runStatement(query, params = []) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      db.run(query, params, function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // Find all videos
  async findAll() {
    try {
      const videos = await this.runQuery(`
        SELECT v.*, u.username as createdByUsername
        FROM videos v
        LEFT JOIN users u ON v.createdBy = u.id
        ORDER BY v.createdAt DESC
      `);
      
      return videos.map(video => ({
        ...video,
        createdAt: new Date(video.createdAt),
        updatedAt: new Date(video.updatedAt),
        publishedAt: video.publishedAt ? new Date(video.publishedAt) : null
      }));
    } catch (error) {
      console.error('Error finding all videos:', error);
      throw error;
    }
  }

  // Find video by ID
  async findById(id) {
    try {
      const videos = await this.runQuery(`
        SELECT v.*, u.username as createdByUsername
        FROM videos v
        LEFT JOIN users u ON v.createdBy = u.id
        WHERE v.id = ?
      `, [id]);
      
      if (videos.length === 0) return null;
      
      const video = videos[0];
      return {
        ...video,
        createdAt: new Date(video.createdAt),
        updatedAt: new Date(video.updatedAt),
        publishedAt: video.publishedAt ? new Date(video.publishedAt) : null
      };
    } catch (error) {
      console.error('Error finding video by ID:', error);
      throw error;
    }
  }

  // Find current video
  async findCurrent() {
    try {
      const videos = await this.runQuery(`
        SELECT v.*, u.username as createdByUsername
        FROM videos v
        LEFT JOIN users u ON v.createdBy = u.id
        WHERE v.isCurrentVideo = 1
        ORDER BY v.updatedAt DESC
        LIMIT 1
      `);
      
      if (videos.length === 0) return null;
      
      const video = videos[0];
      return {
        ...video,
        createdAt: new Date(video.createdAt),
        updatedAt: new Date(video.updatedAt),
        publishedAt: video.publishedAt ? new Date(video.publishedAt) : null
      };
    } catch (error) {
      console.error('Error finding current video:', error);
      throw error;
    }
  }

  // Create new video
  async create(videoData) {
    try {
      const {
        title,
        description = '',
        type,
        url = '',
        thumbnail = '',
        createdBy,
        publishedAt = null
      } = videoData;

      const result = await this.runStatement(`
        INSERT INTO videos (
          title, description, type, url, thumbnail, 
          isCurrentVideo, viewCount, createdBy, publishedAt,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, datetime('now'), datetime('now'))
      `, [title, description, type, url, thumbnail, createdBy, publishedAt]);

      return await this.findById(result.lastID);
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  }

  // Update video
  async update(id, updateData) {
    try {
      const fields = [];
      const values = [];

      // Build dynamic update query
      for (const [key, value] of Object.entries(updateData)) {
        if (['title', 'description', 'thumbnail', 'publishedAt'].includes(key)) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) {
        return false; // No valid fields to update
      }

      fields.push('updatedAt = datetime(\'now\')');
      values.push(id);

      const result = await this.runStatement(`
        UPDATE videos 
        SET ${fields.join(', ')}
        WHERE id = ?
      `, values);

      return result.changes > 0;
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  }

  // Set video as current
  async setAsCurrent(id) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      
      // Start transaction manually
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // First, unset all current videos
        db.run('UPDATE videos SET isCurrentVideo = 0', (err) => {
          if (err) {
            db.run('ROLLBACK');
            db.close();
            return reject(err);
          }
          
          // Then set the specified video as current
          db.run(`
            UPDATE videos 
            SET isCurrentVideo = 1, updatedAt = datetime('now')
            WHERE id = ?
          `, [id], function(err) {
            if (err) {
              db.run('ROLLBACK');
              db.close();
              return reject(err);
            }
            
            db.run('COMMIT', (err) => {
              db.close();
              if (err) {
                return reject(err);
              }
              resolve(this.changes > 0);
            });
          });
        });
      });
    });
  }

  // Delete video
  async delete(id) {
    try {
      const result = await this.runStatement('DELETE FROM videos WHERE id = ?', [id]);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  // Increment view count
  async incrementViewCount(id) {
    try {
      const result = await this.runStatement(`
        UPDATE videos 
        SET viewCount = viewCount + 1, updatedAt = datetime('now')
        WHERE id = ?
      `, [id]);
      return result.changes > 0;
    } catch (error) {
      console.error('Error incrementing view count:', error);
      throw error;
    }
  }

  // Search videos
  async search(query) {
    try {
      const videos = await this.runQuery(`
        SELECT v.*, u.username as createdByUsername
        FROM videos v
        LEFT JOIN users u ON v.createdBy = u.id
        WHERE v.title LIKE ? OR v.description LIKE ?
        ORDER BY v.createdAt DESC
      `, [`%${query}%`, `%${query}%`]);
      
      return videos.map(video => ({
        ...video,
        createdAt: new Date(video.createdAt),
        updatedAt: new Date(video.updatedAt),
        publishedAt: video.publishedAt ? new Date(video.publishedAt) : null
      }));
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  }

  // Get videos by type
  async findByType(type) {
    try {
      const videos = await this.runQuery(`
        SELECT v.*, u.username as createdByUsername
        FROM videos v
        LEFT JOIN users u ON v.createdBy = u.id
        WHERE v.type = ?
        ORDER BY v.createdAt DESC
      `, [type]);
      
      return videos.map(video => ({
        ...video,
        createdAt: new Date(video.createdAt),
        updatedAt: new Date(video.updatedAt),
        publishedAt: video.publishedAt ? new Date(video.publishedAt) : null
      }));
    } catch (error) {
      console.error('Error finding videos by type:', error);
      throw error;
    }
  }

  // Get videos by user
  async findByUser(userId) {
    try {
      const videos = await this.runQuery(`
        SELECT v.*, u.username as createdByUsername
        FROM videos v
        LEFT JOIN users u ON v.createdBy = u.id
        WHERE v.createdBy = ?
        ORDER BY v.createdAt DESC
      `, [userId]);
      
      return videos.map(video => ({
        ...video,
        createdAt: new Date(video.createdAt),
        updatedAt: new Date(video.updatedAt),
        publishedAt: video.publishedAt ? new Date(video.publishedAt) : null
      }));
    } catch (error) {
      console.error('Error finding videos by user:', error);
      throw error;
    }
  }

  // Get video statistics
  async getStats() {
    try {
      const totalVideosResult = await this.runQuery('SELECT COUNT(*) as count FROM videos');
      const totalViewsResult = await this.runQuery('SELECT SUM(viewCount) as total FROM videos');
      const youtubeCountResult = await this.runQuery('SELECT COUNT(*) as count FROM videos WHERE type = "youtube"');
      const uploadCountResult = await this.runQuery('SELECT COUNT(*) as count FROM videos WHERE type = "upload"');
      
      const mostViewed = await this.runQuery(`
        SELECT title, viewCount 
        FROM videos 
        ORDER BY viewCount DESC 
        LIMIT 5
      `);

      const recentlyAdded = await this.runQuery(`
        SELECT title, createdAt 
        FROM videos 
        ORDER BY createdAt DESC 
        LIMIT 5
      `);

      return {
        totalVideos: totalVideosResult[0]?.count || 0,
        totalViews: totalViewsResult[0]?.total || 0,
        youtubeCount: youtubeCountResult[0]?.count || 0,
        uploadCount: uploadCountResult[0]?.count || 0,
        mostViewed,
        recentlyAdded: recentlyAdded.map(video => ({
          ...video,
          createdAt: new Date(video.createdAt)
        }))
      };
    } catch (error) {
      console.error('Error getting video stats:', error);
      throw error;
    }
  }

  // Bulk delete videos
  async bulkDelete(ids) {
    try {
      const placeholders = ids.map(() => '?').join(',');
      const result = await this.runStatement(`DELETE FROM videos WHERE id IN (${placeholders})`, ids);
      return result.changes;
    } catch (error) {
      console.error('Error bulk deleting videos:', error);
      throw error;
    }
  }
}

module.exports = new Video();