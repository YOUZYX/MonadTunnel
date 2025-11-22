import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { getAiRecommendation } from '../../services/aiClient';
import { MonadLogoFill } from '../Scene/MonadLogoFill';
import { audio } from '../../services/audioEngine';

interface SearchInterfaceProps {
  data: any[];
  onSearch: (filteredData: any[]) => void;
  onClose: () => void;
}

// -- Constants --
const CATEGORIES = ['All', 'App', 'Infra'];

const APP_TAGS = [
  'AI', 'Betting', 'DeFi', 'DePIN', 'Gaming', 'Governance', 
  'NFT', 'Other', 'Payments', 'Prediction', 'RWA', 'Social'
];

const INFRA_TAGS = [
  'Account', 'Abstraction', 'Analytics', 'Cross-Chain', 'Dev', 'Tooling', 
  'Gaming', 'Identity', 'Indexer', 'Onramp', 'Oracle', 'Other', 'Infra', 
  'Privacy', 'RPC', 'Stablecoin', 'Wallet', 'Zero-Knowledge'
];

const THEME_COLOR = '#836EF9';

const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;

// --- Icons ---

const AiIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: active ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none', transition: 'all 0.3s' }}>
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
    <path d="M19 17L20 20L23 21L20 22L19 25L18 22L15 21L18 20L19 17Z" fill="currentColor" />
    <path d="M5 17L6 20L9 21L6 22L5 25L4 22L1 21L4 20L5 17Z" fill="currentColor" />
  </svg>
);

const FilterIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: active ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none', transition: 'all 0.3s' }}>
    <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// --- Components ---

// 1. 3D Tilt Container
const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!panelRef.current) return;
        const rect = panelRef.current.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        // Max tilt 5 degrees for subtle liquid feel
        const rotateX = -(y / (rect.height / 2)) * 5; 
        const rotateY = (x / (rect.width / 2)) * 5;
        setTilt({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    return (
        <div 
            ref={panelRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
            style={{
                transform: `perspective(1500px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.2s ease-out',
                transformStyle: 'preserve-3d',
            }}
        >
            {children}
        </div>
    );
};

// 2. Liquid Switch with Icons
const ModeSwitch = ({ mode, setMode }: { mode: 'AI' | 'MANUAL', setMode: (m: 'AI' | 'MANUAL') => void }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const toggle = () => {
        audio.playClick();
        setMode(mode === 'AI' ? 'MANUAL' : 'AI');
    }

    return (
        <div 
            style={{
                width: '320px',
                height: '64px',
                background: 'rgba(131, 110, 249, 0.05)',
                borderRadius: '32px',
                border: `1px solid ${THEME_COLOR}40`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px',
                cursor: 'pointer',
                boxShadow: `0 0 30px ${THEME_COLOR}20, inset 0 0 20px rgba(0,0,0,0.5)`,
                backdropFilter: 'blur(16px)',
                marginBottom: '40px',
                userSelect: 'none',
                transition: 'all 0.3s ease'
            }}
            onMouseEnter={() => {
                setIsHovered(true);
                audio.playHover();
            }}
            onMouseLeave={() => setIsHovered(false)}
            onClick={toggle}
        >
            {/* Moving Liquid Thumb */}
            <div 
                style={{
                    position: 'absolute',
                    left: mode === 'AI' ? '4px' : '160px',
                    width: '156px',
                    height: '54px',
                    borderRadius: '28px',
                    background: THEME_COLOR,
                    boxShadow: `0 0 25px ${THEME_COLOR}, inset 0 2px 10px rgba(255,255,255,0.4)`,
                    transition: 'left 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    zIndex: 1,
                }}
            />

            {/* Label: AI */}
            <div style={{ 
                flex: 1, 
                zIndex: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '10px',
                color: mode === 'AI' ? '#fff' : 'rgba(255,255,255,0.4)', 
                fontWeight: '800', 
                fontSize: '0.9rem',
                letterSpacing: '1px',
                transition: 'color 0.3s' 
            }}>
                <AiIcon active={mode === 'AI'} />
                ORACLE
            </div>

            {/* Label: Manual */}
            <div style={{ 
                flex: 1, 
                zIndex: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '10px',
                color: mode === 'MANUAL' ? '#fff' : 'rgba(255,255,255,0.4)', 
                fontWeight: '800', 
                fontSize: '0.9rem',
                letterSpacing: '1px',
                transition: 'color 0.3s' 
            }}>
                <FilterIcon active={mode === 'MANUAL'} />
                FILTERS
            </div>
        </div>
    );
};

// 3. Liquid Crystal 3D Button
const Button3D = ({ onClick, children, primary = false, disabled = false }: any) => {
    const [hover, setHover] = useState(false);
    return (
        <button
            onClick={(e) => {
                if(!disabled) audio.playClick();
                onClick(e);
            }}
            disabled={disabled}
            onMouseEnter={() => {
                setHover(true);
                if(!disabled) audio.playHover();
            }}
            onMouseLeave={() => setHover(false)}
            style={{
                width: '100%',
                padding: '20px',
                background: disabled 
                    ? 'rgba(50,50,50,0.3)' 
                    : primary 
                        ? 'rgba(131, 110, 249, 0.8)' // Semi-transparent solid for glass effect
                        : 'rgba(255,255,255,0.05)',
                border: primary ? `1px solid ${THEME_COLOR}` : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                color: disabled ? '#888' : 'white',
                fontWeight: 900,
                fontSize: '1.1rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: disabled ? 'not-allowed' : 'pointer',
                // Liquid Glow Shadow
                boxShadow: primary && !disabled 
                    ? (hover ? `0 0 40px ${THEME_COLOR}80, inset 0 0 20px rgba(255,255,255,0.4)` : `0 0 20px ${THEME_COLOR}40, inset 0 0 10px rgba(255,255,255,0.1)`)
                    : 'none',
                transform: hover && !disabled ? 'scale(1.02) translateY(-2px)' : 'scale(1) translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Internal shine effect */}
            <div style={{
                position: 'absolute',
                top: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s',
                left: hover ? '100%' : '-100%',
            }} />
            
            {children}
        </button>
    );
};


// --- Main Interface ---

export function SearchInterface({ data, onSearch, onClose }: SearchInterfaceProps) {
  const [mode, setMode] = useState<'AI' | 'MANUAL'>('AI');

  // -- AI State --
  const [query, setQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [oracleMessage, setOracleMessage] = useState('');

  // -- Manual State --
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [monadOnly, setMonadOnly] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // -- Filter Logic --
  const visibleTags = useMemo(() => {
    if (activeCategory === 'App') return APP_TAGS;
    if (activeCategory === 'Infra') return INFRA_TAGS;
    return Array.from(new Set([...APP_TAGS, ...INFRA_TAGS])).sort();
  }, [activeCategory]);

  const filterResults = (ids: string[] = []) => {
    let results = data;
    if (ids.length > 0) {
        return results.filter(d => ids.includes(d.id));
    }
    if (activeCategory !== 'All') {
        results = results.filter(d => {
            const type = (d["PJ TYPE"] || "").toLowerCase();
            return type.includes(activeCategory.toLowerCase());
        });
    }
    if (selectedTags.length > 0) {
        results = results.filter(d => {
            const itemTags = d.tags || [];
            return selectedTags.some(tag => 
                itemTags.some((t: string) => t.toLowerCase().includes(tag.toLowerCase()))
            );
        });
    }
    if (monadOnly) {
        results = results.filter(d => d["ONLY on Monad"] === "Yes");
    }
    return results;
  };

  const manualMatches = filterResults([]);
  const matchCount = manualMatches.length;

  // -- Handlers --
  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!query.trim()) return;
    setIsAiLoading(true);
    setOracleMessage("INITIALIZING NEURAL LINK...");
    audio.playClick(); // Confirm submission
    try {
        const aiResult = await getAiRecommendation(query, data);
        setOracleMessage(aiResult.reasoning);
        // Success sound
        audio.playHover(); 
        setTimeout(() => {
            const results = filterResults(aiResult.recommendedAppIds);
            onSearch(results);
        }, 2000);
    } catch (error) {
        setOracleMessage("LINK SEVERED. MANUAL OVERRIDE REQUIRED.");
        setIsAiLoading(false);
    }
  };

  const scrollTags = (dir: 'left' | 'right') => {
    audio.playHover();
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(5, 3, 15, 0.7)', // Darker, cleaner background
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        perspective: '1500px'
    }}>
        
        {/* Floating Close Button */}
        <div 
            onClick={onClose}
            style={{
                position: 'absolute', top: '40px', right: '40px',
                width: '56px', height: '56px',
                background: 'rgba(131, 110, 249, 0.1)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '1.4rem',
                cursor: 'pointer',
                border: `1px solid ${THEME_COLOR}40`,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                zIndex: 1000,
                boxShadow: `0 0 15px ${THEME_COLOR}20`
            }}
            onMouseEnter={e => { 
                audio.playHover();
                e.currentTarget.style.background = THEME_COLOR; 
                e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'; 
                e.currentTarget.style.boxShadow = `0 0 30px ${THEME_COLOR}`;
            }}
            onMouseLeave={e => { 
                e.currentTarget.style.background = 'rgba(131, 110, 249, 0.1)'; 
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; 
                e.currentTarget.style.boxShadow = `0 0 15px ${THEME_COLOR}20`;
            }}
        >
            ✕
        </div>

        {/* Mode Switcher */}
        <ModeSwitch mode={mode} setMode={setMode} />

        {/* --- AI PANEL --- */}
        {mode === 'AI' && (
            <TiltCard className="ai-panel" >
                <div style={{
                    width: '620px',
                    minHeight: '520px',
                    // Liquid Glass Background
                    background: 'rgba(20, 20, 35, 0.6)',
                    borderRadius: '32px',
                    border: `1px solid ${THEME_COLOR}40`,
                    boxShadow: `0 25px 80px -10px rgba(0,0,0,0.6), inset 0 0 60px rgba(131, 110, 249, 0.05)`,
                    padding: '45px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    backdropFilter: 'blur(24px)'
                }}>
                    <h2 style={{ 
                        color: '#fff', 
                        fontSize: '2.2rem', 
                        fontWeight: '800',
                        margin: '0 0 12px 0', 
                        textTransform: 'uppercase', 
                        textShadow: `0 0 20px ${THEME_COLOR}`,
                        transform: 'translateZ(30px)',
                        letterSpacing: '2px'
                    }}>
                        Monad Oracle
                    </h2>
                    <p style={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        textAlign: 'center', 
                        marginBottom: '35px', 
                        transform: 'translateZ(15px)',
                        fontSize: '1.05rem',
                        lineHeight: '1.5'
                    }}>
                        The Oracle listens. Describe your intent to reveal the path.
                    </p>

                    {isAiLoading ? (
                         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: 'translateZ(40px)' }}>
                            <div style={{ width: '240px', height: '240px' }}>
                                <Canvas camera={{ position: [0, 0, 4] }} gl={{ alpha: true }}>
                                    <AmbientLight intensity={1} />
                                    <PointLight position={[10, 10, 10]} intensity={2} />
                                    <MonadLogoFill position={[0,0,0]} onClick={() => {}} />
                                </Canvas>
                            </div>
                            <div style={{ 
                                marginTop: '25px', 
                                color: THEME_COLOR, 
                                fontFamily: 'monospace', 
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                letterSpacing: '3px', 
                                animation: 'pulse 1.5s infinite ease-in-out',
                                textShadow: `0 0 15px ${THEME_COLOR}`
                            }}>
                                {oracleMessage}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleAiSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '25px', flex: 1, transform: 'translateZ(25px)' }}>
                             <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="ASK THE MONAD ORACLE (e.g., 'Where I can Trade with low fees ?' or 'I want to Play games')"
                                style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(131, 110, 249, 1)',
                                    borderRadius: '20px',
                                    padding: '24px',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    flex: 1,
                                    resize: 'none',
                                    outline: 'none',
                                    fontFamily: "'Inter', sans-serif",
                                    boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.4)',
                                    transition: 'border 0.3s'
                                }}
                                onFocus={(e) => {
                                    audio.playHover();
                                    e.target.style.border = `1px solid ${THEME_COLOR}`;
                                }}
                                onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                            />
                            <Button3D primary type="submit">AI SCAN</Button3D>
                        </form>
                    )}
                </div>
            </TiltCard>
        )}

        {/* --- MANUAL PANEL --- */}
        {mode === 'MANUAL' && (
            <TiltCard className="manual-panel">
                <div style={{
                    width: '720px',
                    minHeight: '580px',
                    background: 'rgba(20, 20, 35, 0.6)',
                    borderRadius: '32px',
                    border: `1px solid ${THEME_COLOR}40`,
                    boxShadow: `0 25px 80px -10px rgba(0,0,0,0.6)`,
                    padding: '45px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    backdropFilter: 'blur(24px)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', transform: 'translateZ(15px)' }}>
                        <h2 style={{ color: 'white', fontSize: '2rem', margin: 0, fontWeight: '800', letterSpacing: '1px' }}>Manual Filter</h2>
                        <span style={{ 
                            background: matchCount === 0 ? '#ff003c' : 'rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '8px 18px',
                            borderRadius: '20px',
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            border: `1px solid ${matchCount === 0 ? '#ff003c' : 'rgba(255,255,255,0.2)'}`,
                            boxShadow: matchCount === 0 ? '0 0 15px #ff003c' : 'none'
                        }}>
                            {matchCount} NODES FOUND
                        </span>
                    </div>

                    {/* Categories */}
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '6px', marginBottom: '30px', transform: 'translateZ(20px)' }}>
                        {CATEGORIES.map(cat => (
                             <button
                                key={cat}
                                onClick={() => {
                                    audio.playClick();
                                    setActiveCategory(cat);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: activeCategory === cat ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: activeCategory === cat ? 'white' : '#888',
                                    border: activeCategory === cat ? `1px solid ${THEME_COLOR}60` : '1px solid transparent',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 800,
                                    transition: 'all 0.3s',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1.5px',
                                    boxShadow: activeCategory === cat ? `0 0 15px ${THEME_COLOR}20` : 'none'
                                }}
                                onMouseEnter={() => audio.playHover()}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Tag Carousel */}
                    <div style={{ position: 'relative', marginBottom: '35px', transform: 'translateZ(25px)' }}>
                        <button 
                            onClick={() => scrollTags('left')}
                            style={{
                                position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
                                background: '#000', border: '1px solid #333', color: 'white',
                                borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', zIndex: 5,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                            }}
                        >‹</button>
                         <div 
                            ref={scrollContainerRef}
                            className="no-scrollbar"
                            style={{
                                display: 'flex',
                                gap: '12px',
                                overflowX: 'auto',
                                padding: '5px 20px',
                                scrollBehavior: 'smooth',
                                maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
                            }}
                        >
                             {visibleTags.map(tag => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            audio.playClick();
                                            setSelectedTags(prev => 
                                                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                                            );
                                        }}
                                        style={{
                                            whiteSpace: 'nowrap',
                                            padding: '10px 22px',
                                            background: isSelected ? THEME_COLOR : 'rgba(255,255,255,0.05)',
                                            border: isSelected ? `1px solid ${THEME_COLOR}` : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '24px',
                                            color: isSelected ? 'white' : '#aaa',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            transition: 'all 0.2s',
                                            boxShadow: isSelected ? `0 0 20px ${THEME_COLOR}60` : 'none'
                                        }}
                                        onMouseEnter={() => audio.playHover()}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                        <button 
                            onClick={() => scrollTags('right')}
                            style={{
                                position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
                                background: '#000', border: '1px solid #333', color: 'white',
                                borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', zIndex: 5,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                            }}
                        >›</button>
                    </div>

                    {/* Checkbox */}
                    <div 
                        onClick={() => {
                            audio.playClick();
                            setMonadOnly(!monadOnly);
                        }}
                        onMouseEnter={() => audio.playHover()}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '14px', 
                            cursor: 'pointer', marginBottom: 'auto',
                            padding: '14px 20px', borderRadius: '16px',
                            background: 'rgba(255,255,255,0.03)',
                            width: 'fit-content',
                            transform: 'translateZ(15px)',
                            border: `1px solid ${monadOnly ? THEME_COLOR : 'transparent'}`,
                            transition: 'all 0.2s'
                        }}
                    >
                         <div style={{
                            width: '24px', height: '24px', 
                            border: `2px solid ${monadOnly ? THEME_COLOR : '#666'}`,
                            borderRadius: '6px',
                            background: monadOnly ? THEME_COLOR : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                            boxShadow: monadOnly ? `0 0 10px ${THEME_COLOR}60` : 'none'
                        }}>
                            {monadOnly && <span style={{color:'white', fontSize: '16px', fontWeight:'bold'}}>✓</span>}
                        </div>
                        <span style={{ color: '#eee', fontSize: '1rem', fontWeight: '500' }}>Exclusive to Monad</span>
                    </div>

                    {/* Action Button or Glitch */}
                    <div style={{ marginTop: '35px', transform: 'translateZ(30px)' }}>
                        {matchCount === 0 ? (
                            <div style={{
                                padding: '24px',
                                background: 'rgba(255, 0, 60, 0.1)',
                                border: '1px solid rgba(255, 0, 60, 0.3)',
                                borderRadius: '20px',
                                display: 'flex', justifyContent: 'center'
                            }}>
                                 <div 
                                    className="glitch" 
                                    data-text="SCAN COMPLETE. NO DAPPS MATCH YOUR FILTERS."
                                    style={{ fontSize: '1rem', textAlign: 'center', fontWeight: 'bold' }}
                                >
                                    SCAN COMPLETE. NO DAPPS MATCH YOUR FILTERS.
                                </div>
                            </div>
                        ) : (
                            <Button3D 
                                primary 
                                onClick={() => onSearch(manualMatches)}
                            >
                                FILTRE SEARCH
                            </Button3D>
                        )}
                    </div>
                </div>
            </TiltCard>
        )}
    </div>
  );
}