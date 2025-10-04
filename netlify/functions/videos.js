const { Pool } = require('pg');

// Neon PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

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
        const client = await pool.connect();
        const results = await client.query(
          'SELECT * FROM videos WHERE featured = true ORDER BY date DESC LIMIT 1'
        );
        client.release();
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
      const client = await pool.connect();
      const results = await client.query(
        'SELECT * FROM videos ORDER BY date DESC'
      );
      client.release();

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
      
      const client = await pool.connect();
      const results = await client.query(
        'INSERT INTO videos (title, url, type, thumbnail, duration, description, featured, date) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE) RETURNING id',
        [title, url, type || 'youtube', thumbnail, duration, description, featured]
      );
      client.release();

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
      
      const client = await pool.connect();
      await client.query('DELETE FROM videos WHERE id = $1', [videoId]);
      client.release();

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