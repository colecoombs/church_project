exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'Set-Cookie': [
        'accessToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
        'refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
      ].join(', ')
    },
    body: JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    })
  };
};
