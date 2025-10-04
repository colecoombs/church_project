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
          settings: settings
        })
      };
    }

    if (event.httpMethod === 'PUT') {
      // Update settings (admin only - would need auth check)
      const updatedSettings = JSON.parse(event.body);
      
      // Update each setting in the database
      const client = await pool.connect();
      for (const [key, value] of Object.entries(updatedSettings)) {
        await client.query(
          'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
          [key, value]
        );
      }
      client.release();

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