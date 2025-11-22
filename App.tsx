
import React, { useState, useEffect } from 'react';
import { TunnelScene } from './components/Scene/TunnelScene';
import { SpaceVoid } from './components/Scene/SpaceVoid';
import { DappPanel } from './components/UI/DappPanel';
import { SearchInterface } from './components/UI/SearchInterface';
import { AppLogo } from './components/UI/AppLogo';
import { CreatorCredit } from './components/UI/CreatorCredit';
import { SoundControl } from './components/UI/SoundControl';
import { audio } from './services/audioEngine';

// Helper to generate cyberpunk colors
const getCyberpunkColor = (index: number) => {
  const colors = ['#833ab4', '#fd1d1d', '#fcb045', '#00f0ff', '#00ff00', '#ff00aa'];
  return colors[index % colors.length];
};

type ViewMode = 'TUNNEL' | 'WARP' | 'VOID';

function App() {
  const [selectedDapp, setSelectedDapp] = useState<any>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [monEcoData, setMonEcoData] = useState<any[]>([]);
  
  // New States
  const [viewMode, setViewMode] = useState<ViewMode>('TUNNEL');
  const [showSearchUI, setShowSearchUI] = useState(false);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  
  // Animation States
  const [isReversing, setIsReversing] = useState(false);
  const [cameraTargetZ, setCameraTargetZ] = useState<number | null>(null);
  
  // Mobile Detection & Menu
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    // Initialize Audio on first interaction
    const handleInteraction = () => {
      audio.init();
      audio.resume();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  useEffect(() => {
    fetch('/data/MonEco.json')
      .then(res => res.json())
      .then(data => {
        const processed = data.map((item: any, index: number) => ({
            ...item,
            id: item.NAME, // Use Name as ID
            name: item.NAME,
            description: item.INFO,
            logo: item.LOGO,
            banner: item.BANNER,
            web: item.WEB,
            tags: item.TAGS ? item.TAGS.split(',').map((t: string) => t.trim()) : [],
            color: getCyberpunkColor(index)
        }));
        setMonEcoData(processed);
        setFilteredData(processed); // Default to all
      })
      .catch(err => console.error("Failed to load ecosystem data", err));
  }, []);

  const handleSearchSubmit = (results: any[]) => {
    setFilteredData(results);
    setShowSearchUI(false);
    
    // Trigger Warp sequence
    setViewMode('WARP');
    audio.playWarp(); // SFX
    setTimeout(() => {
        setViewMode('VOID');
    }, 2000); // 2 second warp
  };

  const handleBackToTunnel = () => {
      // 1. Trigger Reverse Warp Mode
      setIsReversing(true);
      setViewMode('WARP');
      audio.playWarp(); // SFX
      
      // 2. Reset data immediately so we warp through the populated tunnel
      setFilteredData(monEcoData);
      setCameraTargetZ(0); // Reset tracking

      // 3. After warp duration, settle into standard Tunnel mode
      setTimeout(() => {
          setViewMode('TUNNEL');
          setIsReversing(false);
          setCameraTargetZ(0); // Force alignment to start
          setTimeout(() => setCameraTargetZ(null), 100);
      }, 2500); // Slightly longer for impact
  };
  
  // Calculate tunnel end position based on mobile/desktop spacing to stop accurately
  const getTunnelEndPosition = () => {
    const zSpacing = isMobile ? 22 : 15;
    const itemsLength = monEcoData.length * zSpacing;
    return -itemsLength - 50;
  };

  const handleTimeTravelToOracle = () => {
    const logoZ = getTunnelEndPosition();
    // Buffer to stop slightly before the logo
    setCameraTargetZ(logoZ + 20); 
    audio.playWarp(); // SFX
    // Reset trigger after animation starts (CameraController will handle dampening)
    setTimeout(() => setCameraTargetZ(null), 500);
  };

  const handleReturnToStart = () => {
    setCameraTargetZ(0);
    audio.playWarp(); // SFX
    setTimeout(() => setCameraTargetZ(null), 500);
  };

  const handleSelectDapp = (dapp: any) => {
      audio.playClick();
      setSelectedDapp(dapp);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      
      {/* SCENE RENDERER */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        {viewMode !== 'VOID' && (
            <TunnelScene 
                data={filteredData} // Use filteredData here to support warp visualization
                isMobile={isMobile}
                onSelectDapp={handleSelectDapp} 
                highlightId={highlightedId}
                onLogoClick={() => {
                    audio.playClick();
                    setShowSearchUI(true);
                }}
                warpActive={viewMode === 'WARP'}
                reverseWarp={isReversing}
                customTargetZ={cameraTargetZ}
                onTimeTravelStart={handleTimeTravelToOracle}
                onTimeTravelReset={handleReturnToStart}
            />
        )}
        
        {viewMode === 'VOID' && (
            <SpaceVoid 
                data={filteredData}
                onSelectDapp={handleSelectDapp}
                onBack={handleBackToTunnel}
            />
        )}
      </div>

      {/* NEW HOLOGRAPHIC LOGO - Removed status prop */}
      <AppLogo onClick={() => audio.playClick()} />

      {/* Futuristic Portal Back Button */}
      {viewMode === 'VOID' && (
          <button 
            className="portal-btn"
            onClick={handleBackToTunnel}
            onMouseEnter={() => audio.playHover()}
            title="Return to Tunnel"
          >
              <span className="portal-label">RETURN</span>
          </button>
      )}

      {/* OVERLAYS */}
      {showSearchUI && (
          <SearchInterface 
            data={monEcoData} 
            onSearch={handleSearchSubmit} 
            onClose={() => {
                audio.playClick();
                setShowSearchUI(false);
            }} 
          />
      )}

      <DappPanel 
        dapp={selectedDapp} 
        onClose={() => {
            audio.playClick();
            setSelectedDapp(null);
        }} 
      />
      
      {/* Desktop Controls (Bottom corners) */}
      {!isMobile && (
        <>
          <CreatorCredit />
          <SoundControl />
        </>
      )}

      {/* Mobile Menu Burger & Modal */}
      {isMobile && (
        <>
          <div 
            onClick={() => {
              audio.playClick();
              setMobileMenuOpen(true);
            }}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'rgba(131, 110, 249, 0.1)',
              border: '1px solid rgba(131, 110, 249, 0.4)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              zIndex: 100,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ width: '24px', height: '2px', background: '#fff', borderRadius: '2px' }}></div>
            <div style={{ width: '24px', height: '2px', background: '#fff', borderRadius: '2px' }}></div>
            <div style={{ width: '24px', height: '2px', background: '#fff', borderRadius: '2px' }}></div>
          </div>

          {/* Mobile Modal Overlay */}
          {mobileMenuOpen && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fade-in 0.2s ease-out'
            }}
            onClick={(e) => {
              // Close when clicking outside content
              if(e.target === e.currentTarget) setMobileMenuOpen(false);
            }}
            >
              <div style={{
                background: 'rgba(20, 20, 35, 0.8)',
                border: '1px solid rgba(131, 110, 249, 0.4)',
                borderRadius: '24px',
                padding: '30px',
                width: '85%',
                maxWidth: '320px',
                display: 'flex',
                flexDirection: 'column',
                gap: '25px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                position: 'relative'
              }}>
                {/* Close Button */}
                <div 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    color: 'white',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    width: '30px', height: '30px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }}
                >✕</div>

                <h3 style={{ color: 'white', margin: '0 0 10px 0', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>SETTINGS</h3>
                
                <SoundControl isMobile={true} />
                <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                <CreatorCredit isMobile={true} />
              </div>
            </div>
          )}
        </>
      )}
      
    </div>
  );
}

export default App;