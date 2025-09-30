import { ImageResponse } from '@vercel/og';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    // Get parameters from URL
    const title = (query.title as string) || 'Real-time Typing Trainer';
    const description = (query.description as string) || 'Practice typing with real-time collaboration';
    const type = (query.type as string) || 'default';
    const sessionId = (query.sessionId as string) || '';

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

    // Create the JSX element structure
    const element = {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: styles.bgColor,
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        },
        children: [
          // Background pattern
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              },
            },
          },
          // Main content container
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: '24px',
                padding: '60px 80px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                maxWidth: '900px',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              },
              children: [
                // Icon
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '100px',
                      marginBottom: '30px',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                    },
                    children: styles.icon,
                  },
                },
                // Title
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '56px',
                      fontWeight: 'bold',
                      color: styles.accentColor,
                      marginBottom: '24px',
                      lineHeight: '1.2',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    },
                    children: title,
                  },
                },
                // Description
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '32px',
                      color: '#374151',
                      marginBottom: '40px',
                      lineHeight: '1.4',
                      maxWidth: '700px',
                    },
                    children: description,
                  },
                },
                // Session ID if available
                ...(sessionId
                  ? [{
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '24px',
                          color: '#6B7280',
                          backgroundColor: '#F3F4F6',
                          padding: '16px 32px',
                          borderRadius: '16px',
                          fontFamily: 'monospace',
                          border: '2px solid #E5E7EB',
                          marginBottom: '30px',
                        },
                        children: `Session: ${sessionId}`,
                      },
                    }]
                  : []),
                // Footer
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '24px',
                      color: '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    },
                    children: '🌐 Real-time Typing Practice',
                  },
                },
              ],
            },
          },
          // Decorative elements
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '50px',
                right: '50px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                zIndex: 0,
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '50px',
                left: '50px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.08)',
                zIndex: 0,
              },
            },
          },
        ],
      },
    };

    // Generate OG image using @vercel/og
    return new ImageResponse(element, {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  }
  catch (e: any) {
    console.log(`Error: ${e.message}`);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate the image',
    });
  }
});
