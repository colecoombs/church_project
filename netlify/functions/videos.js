const { connect } = require('@planetscale/database');

// PlanetScale database connection
const config = {
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD
};

const conn = connect(config);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Get all videos or current featured video
      if (event.queryStringParameters?.path === 'current') {
        const results = await conn.execute(
          'SELECT * FROM videos WHERE featured = 1 ORDER BY date DESC LIMIT 1'
        );
        const featuredVideo = results.rows[0];
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            video: featuredVideo || null
          })
        };
      }

      // Get all videos
      const results = await conn.execute(
        'SELECT * FROM videos ORDER BY date DESC'
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          videos: results.rows
        })
      };
    }

    if (event.httpMethod === 'POST') {
      // Add new video (admin only - would need auth check)
      const { title, url, type, thumbnail, duration, description, featured = 0 } = JSON.parse(event.body);
      
      const results = await conn.execute(
        'INSERT INTO videos (title, url, type, thumbnail, duration, description, featured, date) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())',
        [title, url, type || 'youtube', thumbnail, duration, description, featured]
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Video added successfully',
          id: results.insertId
        })
      };
    }

    if (event.httpMethod === 'DELETE') {
      // Delete video (admin only - would need auth check)
      const videoId = parseInt(event.queryStringParameters?.id);
      
      await conn.execute('DELETE FROM videos WHERE id = ?', [videoId]);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Video deleted'
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Videos error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};