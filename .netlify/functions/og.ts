export async function handler(event: any) {
  try {
    const query = new URLSearchParams(event.queryStringParameters || {});

    // Get parameters from URL
    const title = query.get('title') || 'Real-time Typing Trainer';
    const description = query.get('description') || 'Practice typing with real-time collaboration';
    const type = query.get('type') || 'default';
    const sessionId = query.get('sessionId') || '';

    // Define colors and styles based on type
    const getTypeStyles = (type: string) => {
      switch (type) {
        case 'session':
          return {
            bgColor: '#3B82F6',
            accentColor: '#1E40AF',
            icon: '⌨️',
          };
        case 'spectator':
          return {
            bgColor: '#10B981',
            accentColor: '#047857',
            icon: '👀',
          };
        case 'solo':
          return {
            bgColor: '#6B7280',
            accentColor: '#374151',
            icon: '🎯',
          };
        default:
          return {
            bgColor: '#8B5CF6',
            accentColor: '#7C3AED',
            icon: '🚀',
          };
      }
    };

    const styles = getTypeStyles(type);

    // Create SVG-based OG image
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${styles.bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${styles.accentColor};stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.15)"/>
          </filter>
        </defs>

        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bg)"/>

        <!-- Background pattern -->
        <circle cx="240" cy="504" r="100" fill="rgba(255,255,255,0.1)"/>
        <circle cx="960" cy="126" r="60" fill="rgba(255,255,255,0.08)"/>

        <!-- Main content container -->
        <rect x="150" y="90" width="900" height="450" rx="24" fill="rgba(255,255,255,0.95)" filter="url(#shadow)"/>

        <!-- Icon -->
        <text x="600" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="100" text-anchor="middle" fill="${styles.accentColor}">
          ${styles.icon}
        </text>

        <!-- Title -->
        <text x="600" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="${styles.accentColor}">
          ${title.length > 30 ? `${title.substring(0, 30)}...` : title}
        </text>

        <!-- Description -->
        <text x="600" y="330" font-family="system-ui, -apple-system, sans-serif" font-size="28" text-anchor="middle" fill="#374151">
          ${description.length > 50 ? `${description.substring(0, 50)}...` : description}
        </text>

        ${sessionId
          ? `
        <!-- Session ID -->
        <rect x="400" y="360" width="400" height="40" rx="16" fill="#F3F4F6" stroke="#E5E7EB" stroke-width="2"/>
        <text x="600" y="385" font-family="monospace" font-size="20" text-anchor="middle" fill="#6B7280">
          Session: ${sessionId}
        </text>
        `
          : ''}

        <!-- Footer -->
        <text x="600" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="24" text-anchor="middle" fill="#9CA3AF">
          🌐 Real-time Typing Practice
        </text>
      </svg>
    `;

    // Convert SVG to PNG using a simple approach
    const svgBuffer = Buffer.from(svg, 'utf-8');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
      body: svgBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  }
  catch (e: any) {
    console.log(`Error: ${e.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate the image' }),
    };
  }
}
