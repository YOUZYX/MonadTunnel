
import React, { useState, useEffect } from 'react';
import { audio } from '../../services/audioEngine';

export function SoundControl() {
  const [isMuted, setIsMuted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Ensure audio context is running on user click
    audio.init();
    audio.resume();
    
    const muted = audio.toggleMute();
    setIsMuted(muted);
    if (!muted) audio.playClick();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    audio.setVolume(newVol);
    if (isMuted && newVol > 0) {
        audio.toggleMute(); // Auto-unmute on slide
        setIsMuted(false);
    }
  };

  return (
    <div 
      className="sound-control-container"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 100,
      }}
    >
      {/* Volume Slider Container */}
      <div style={{
          width: '48px',
          height: hovered ? '120px' : '0px',
          marginBottom: '10px',
          background: 'rgba(20, 20, 35, 0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '24px',
          border: `1px solid ${hovered ? 'rgba(131, 110, 249, 0.4)' : 'transparent'}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? 'auto' : 'none'
      }}>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={handleVolumeChange}
            style={{
                width: '100px', // Actual width before rotation
                height: '4px',
                transform: 'rotate(-90deg)',
                background: 'transparent',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none'
            }}
          />
      </div>

      {/* Button */}
      <div
        onClick={toggleSound}
        style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(20, 20, 35, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${hovered ? '#836EF9' : 'rgba(255, 255, 255, 0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: hovered ? '0 0 20px rgba(131, 110, 249, 0.4)' : '0 4px 15px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            color: hovered ? '#fff' : 'rgba(255,255,255,0.7)'
        }}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2V15H6L11 19V5Z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
        ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2V15H6L11 19V5Z" />
            <path d="M19.07 4.93L19.07 4.93C20.9753 6.83553 22.0455 9.41928 22.0455 12.114C22.0455 14.8087 20.9753 17.3925 19.07 19.298" />
            <path d="M15.54 8.46L15.54 8.46C16.5083 9.42853 17.0523 10.7418 17.0523 12.1115C17.0523 13.4812 16.5083 14.7945 15.54 15.763" />
            </svg>
        )}
        
        {/* Equalizer Visualizer */}
        {!isMuted && (
            <div style={{
                position: 'absolute',
                bottom: '6px',
                display: 'flex',
                gap: '2px',
                height: '4px',
                alignItems: 'flex-end'
            }}>
                <div style={{ width: '2px', height: '3px', background: '#836EF9', animation: 'bounce 0.5s infinite alternate' }} />
                <div style={{ width: '2px', height: '5px', background: '#836EF9', animation: 'bounce 0.7s infinite alternate-reverse' }} />
                <div style={{ width: '2px', height: '4px', background: '#836EF9', animation: 'bounce 0.6s infinite alternate' }} />
            </div>
        )}
      </div>
      
      {/* Custom CSS for Range Input Styling */}
      <style>{`
        @keyframes bounce {
            0% { height: 2px; opacity: 0.5; }
            100% { height: 8px; opacity: 1; }
        }
        input[type=range] {
            -webkit-appearance: none;
        }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #836EF9;
            cursor: pointer;
            margin-top: -6px;
            box-shadow: 0 0 10px #836EF9;
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
        }
        input[type=range]:focus {
            outline: none;
        }
      `}</style>
    </div>
  );
}