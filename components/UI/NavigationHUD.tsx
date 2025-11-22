
import React from 'react';

interface NavigationHUDProps {
  onReset: () => void;
}

export function NavigationHUD({ onReset }: NavigationHUDProps) {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 20,
      display: 'flex',
      gap: '10px'
    }}>
      <button
        onClick={onReset}
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid #00f0ff',
          color: '#00f0ff',
          padding: '10px 20px',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          borderRadius: '4px',
          textTransform: 'uppercase',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.2)';
        }}
      >
        ↺ Return to Start
      </button>
    </div>
  );
}
