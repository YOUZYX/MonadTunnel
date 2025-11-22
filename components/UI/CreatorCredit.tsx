
import React from 'react';


const youzyPfp = "https://avatars.githubusercontent.com/u/80650550?v=4";

export function CreatorCredit() {
  return (
    <div 
    className="creator-credit-container"
    style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      zIndex: 100,
      background: 'rgba(20, 20, 35, 0.05)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease',
      cursor: 'default',
      userSelect: 'none'
    }}
    onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(20, 20, 35, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(131, 110, 249, 0.4)';
    }}
    onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(20, 20, 35, 0.05)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }}
    >
      {/* PFP */}
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid rgba(131, 110, 249, 0.5)',
        flexShrink: 0,
        background: '#000'
      }}>
        <img
          src={youzyPfp} 
          alt="Youzy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            // Fallback if local image fails
            e.currentTarget.src = "https://github.com/YOUZYX.png"; 
          }}
        />
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.85rem',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.9)',
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap'
        }}>
          Built By YOUZY
        </span>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Github */}
          <a 
            href="https://github.com/YOUZYX" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s', display: 'flex' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            title="GitHub"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* X (Twitter) */}
          <a 
            href="https://x.com/YOUZYPOOR" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s', display: 'flex' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            title="X (Twitter)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
