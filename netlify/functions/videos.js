// Simple in-memory storage for demo - replace with cloud database
let videos = [
  {
    id: 1,
    title: "Sunday Service - October 1, 2025",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    type: "youtube",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    date: "2025-10-01",
    featured: true,
    duration: "45:30",
    description: "Join us for our weekly Sunday service with Pastor John."
  },
  {
    id: 2,
    title: "Bible Study - Wednesday Evening",
    url: "https://www.youtube.com/watch?v=example2",
    type: "youtube",
    thumbnail: "https://img.youtube.com/vi/example2/maxresdefault.jpg",
    date: "2025-09-27",
    featured: false,
    duration: "30:15",
    description: "Weekly Bible study exploring the Gospel of Matthew."
  }
];

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
      if (event.path.includes('/current')) {
        const featuredVideo = videos.find(v => v.featured);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            video: featuredVideo || videos[0]
          })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          videos: videos
        })
      };
    }

    if (event.httpMethod === 'POST') {
      // Add new video (admin only - would need auth check)
      const videoData = JSON.parse(event.body);
      const newVideo = {
        id: Date.now(), // Simple ID generation
        ...videoData,
        date: new Date().toISOString().split('T')[0]
      };
      
      videos.push(newVideo);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          video: newVideo
        })
      };
    }

    if (event.httpMethod === 'DELETE') {
      // Delete video (admin only - would need auth check)
      const videoId = parseInt(event.queryStringParameters?.id);
      videos = videos.filter(v => v.id !== videoId);

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