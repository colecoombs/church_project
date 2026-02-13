const { Pool } = require('pg');
const { verifyAuth, isAdmin } = require('./utils/auth-middleware');

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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
      // Get public settings from database
      const client = await pool.connect();
      const results = await client.query('SELECT key, value FROM settings');
      client.release();
      
      const settings = {};
      results.rows.forEach(row => {
        settings[row.key] = row.value;
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: settings
        })
      };
    }

    if (event.httpMethod === 'PUT') {
      // Update settings (admin only)
      const authResult = verifyAuth(event);
      if (!authResult.authorized || !isAdmin(authResult.user)) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Unauthorized. Admin access required.' })
        };
      }

      const updatedSettings = JSON.parse(event.body);
      
      // Update each setting in the database
      const client = await pool.connect();
      
      try {
        // Begin transaction
        await client.query('BEGIN');
        
        for (const [key, value] of Object.entries(updatedSettings)) {
          await client.query(
            'INSERT INTO settings (key, value, updatedAt) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updatedAt = NOW()',
            [key, value]
          );
        }
        
        // Commit transaction
        await client.query('COMMIT');
      } catch (err) {
        // Rollback on error
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Settings updated successfully'
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Settings error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};