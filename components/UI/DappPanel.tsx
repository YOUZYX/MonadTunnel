
import React, { useState, useRef, useEffect } from 'react';
import { audio } from '../../services/audioEngine';

interface DappPanelProps {
  dapp: any;
  onClose: () => void;
}

export function DappPanel({ dapp, onClose }: DappPanelProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dapp) {
      audio.playOpen();
    }
  }, [dapp]);

  if (!dapp) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!panelRef.current) return;
    
    const rect = panelRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to center of panel
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    
    // Normalize and scale for rotation (max 10 degrees)
    const rotateX = -(y / (rect.height / 2)) * 10; 
    const rotateY = (x / (rect.width / 2)) * 10;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            pointerEvents: 'none' // Allow interaction with background scene if needed, but panel captures events
        }}
    >
        <div 
            ref={panelRef}
            className="dapp-panel-scroll"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                width: '450px',
                maxWidth: '90%',
                maxHeight: '85vh',
                overflowY: 'auto',
                background: 'rgba(15, 10, 35, 0.65)', // Glassy dark background
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                borderRadius: '24px',
                padding: '40px',
                color: 'white',
                fontFamily: 'Inter, sans-serif',
                boxShadow: `
                    0 25px 50px -12px rgba(0, 0, 0, 0.5), 
                    0 0 40px ${dapp.color}40,
                    inset 0 0 20px rgba(255, 255, 255, 0.05)
                `,
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.1s ease-out, box-shadow 0.3s ease',
                pointerEvents: 'auto',
                position: 'relative'
            }}
        >
            {/* Close Button */}
            <button 
                onClick={onClose}
                style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    right: '20px', 
                    background: 'rgba(255,255,255,0.1)', 
                    border: 'none', 
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    color: '#fff', 
                    fontSize: '1rem', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                    audio.playHover();
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
                ✕
            </button>

            {/* Header Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ 
                    position: 'relative',
                    width: '100px', 
                    height: '100px', 
                    marginBottom: '20px',
                    borderRadius: '24px',
                    background: `linear-gradient(135deg, ${dapp.color}20, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 10px 30px -10px ${dapp.color}60`
                }}>
                    {dapp.logo && (
                        <img 
                            src={dapp.logo} 
                            alt={dapp.name} 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                borderRadius: '24px', 
                                objectFit: 'cover', 
                                padding: '4px'
                            }} 
                        />
                    )}
                </div>
                
                <h2 style={{ 
                    margin: 0, 
                    color: '#fff', 
                    fontSize: '2.2rem', 
                    fontWeight: '800',
                    textShadow: `0 0 20px ${dapp.color}80`,
                    textAlign: 'center',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase'
                }}>
                    {dapp.name}
                </h2>
                
                <span style={{ 
                    marginTop: '8px',
                    padding: '6px 16px',
                    background: `linear-gradient(90deg, ${dapp.color}20, ${dapp.color}05)`,
                    border: `1px solid ${dapp.color}40`,
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    color: dapp.color,
                    fontWeight: '600',
                    letterSpacing: '0.05em'
                }}>
                    {dapp["PJ TYPE"]}
                </span>
            </div>

            {/* Banner */}
            {dapp.banner && dapp.banner !== "NONE" && (
                <div style={{ 
                    width: '100%', 
                    height: '140px', 
                    borderRadius: '16px',
                    overflow: 'hidden',
                    marginBottom: '24px',
                    position: 'relative',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${dapp.banner})`, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center'
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 100%)'
                    }} />
                </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '30px' }}>
                <p style={{ 
                    lineHeight: '1.7', 
                    color: 'rgba(255, 255, 255, 0.85)', 
                    fontSize: '1rem',
                    fontWeight: '400',
                    textAlign: 'center'
                }}>
                    {dapp.description}
                </p>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '35px' }}>
                {dapp.tags.map((tag: string) => (
                <span key={tag} style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '6px 14px', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem',
                    color: '#ccc',
                }}>
                    #{tag}
                </span>
                ))}
            </div>
            
            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <a 
                    href={dapp.web} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        textAlign: 'center',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                        audio.playHover();
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    onClick={() => audio.playClick()}
                >
                    <span className="flex items-center gap-2 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        viewBox="0 0 24 24" fill="none" preserveAspectRatio="xMidYMid meet"
                        aria-hidden="true">
                      <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM9.71 19.667C8.72341 17.5743 8.15187 15.3102 8.027 13H4.062C4.25659 14.5389 4.89392 
                      15.9882 5.89657 17.1717C6.89922 18.3552 8.22401 19.2221 9.71 19.667V19.667ZM10.03 13C10.181 15.439 
                      10.878 17.73 12 19.752C13.1523 17.6766 13.8254 15.3695 13.97 13H10.03V13ZM19.938 
                      13H15.973C15.8481 15.3102 15.2766 17.5743 14.29 19.667C15.776 19.2221 17.1008 18.3552 
                      18.1034 17.1717C19.1061 15.9882 19.7434 14.5389 19.938 13V13ZM4.062 
                      11H8.027C8.15187 8.68979 8.72341 6.42569 9.71 4.333C8.22401 4.77788 
                      6.89922 5.64475 5.89657 6.8283C4.89392 8.01184 4.25659 9.4611 4.062 11V11ZM10.031 
                      11H13.969C13.8248 8.6306 13.152 6.32353 12 4.248C10.8477 6.32345 10.1746 8.63052 
                      10.03 11H10.031ZM14.29 4.333C15.2766 6.42569 15.8481 8.68979 15.973 
                      11H19.938C19.7434 9.4611 19.1061 8.01184 18.1034 6.8283C17.1008 5.64475 
                      15.776 4.77788 14.29 4.333V4.333Z" fill="currentColor"></path>
                    </svg>
                  </span>
                  VISIT SITE
                </a>
                
                <a 
                    href={dapp.X} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                        padding: '16px',
                        background: `linear-gradient(135deg, ${dapp.color}, ${dapp.color}dd)`,
                        border: 'none',
                        borderRadius: '12px',
                        color: '#231340',
                        textAlign: 'center',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        fontWeight: '800',
                        boxShadow: `0 4px 15px ${dapp.color}40`,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                        audio.playHover();
                        e.currentTarget.style.filter = 'brightness(1.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 8px 25px ${dapp.color}60`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'brightness(1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = `0 4px 15px ${dapp.color}40`;
                    }}
                    onClick={() => audio.playClick()}
                >
                    <span style={{ fontSize: '1.1em' }}>𝕏</span> FOLLOW
                </a>
            </div>
        </div>
    </div>
  );
}
