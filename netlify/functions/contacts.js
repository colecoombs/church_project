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
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
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
      // Get all contact submissions (admin only)
      const authResult = verifyAuth(event);
      if (!authResult.authorized || !isAdmin(authResult.user)) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Unauthorized. Admin access required.' })
        };
      }

      const client = await pool.connect();
      const results = await client.query(
        'SELECT * FROM contacts ORDER BY createdat DESC'
      );
      client.release();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: results.rows
        })
      };
    }

    if (event.httpMethod === 'PUT') {
      // Update contact status (admin only)
      const authResult = verifyAuth(event);
      if (!authResult.authorized || !isAdmin(authResult.user)) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Unauthorized. Admin access required.' })
        };
      }

      const { id, status } = JSON.parse(event.body);
      
      const client = await pool.connect();
      await client.query(
        'UPDATE contacts SET status = $1 WHERE id = $2',
        [status, id]
      );
      client.release();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Contact status updated'
        })
      };
    }

    if (event.httpMethod === 'DELETE') {
      // Delete contact submission (admin only)
      const authResult = verifyAuth(event);
      if (!authResult.authorized || !isAdmin(authResult.user)) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Unauthorized. Admin access required.' })
        };
      }

      const contactId = parseInt(event.queryStringParameters?.id);
      
      const client = await pool.connect();
      await client.query('DELETE FROM contacts WHERE id = $1', [contactId]);
      client.release();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Contact deleted'
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Contacts error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
