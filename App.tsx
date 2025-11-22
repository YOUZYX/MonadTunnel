
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

  // Initialize Audio on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      audio.init();
      audio.resume();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
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
  
  const handleTimeTravelToOracle = () => {
    const zSpacing = 15;
    const itemsLength = monEcoData.length * zSpacing;
    const logoZ = -itemsLength - 50;
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
      
      {/* Creator Credit - Bottom Left */}
      <CreatorCredit />

      {/* Audio Control - Bottom Right */}
      <SoundControl />
      
    </div>
  );
}

export default App;
