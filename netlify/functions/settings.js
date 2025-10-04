// Simple in-memory storage for demo - replace with cloud database
let settings = {
  churchName: "Grace Community Church",
  welcomeMessage: "Welcome to our church family! We're glad you're here.",
  about: "Grace Community Church has been serving our community for over 25 years. We believe in creating a welcoming environment where people can grow in their faith and connect with others.",
  pastor: "Pastor John Smith",
  service_times: "Sunday: 9:00 AM & 11:00 AM, Wednesday: 7:00 PM",
  address: "123 Faith Avenue, Your City, ST 12345",
  phone: "(555) 123-4567",
  email: "info@gracecommunity.church",
  social: {
    facebook: "https://facebook.com/gracecommunity",
    instagram: "https://instagram.com/gracecommunity",
    youtube: "https://youtube.com/gracecommunity"
  }
};

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
      // Get public settings
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
      settings = { ...settings, ...updatedSettings };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          settings: settings
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