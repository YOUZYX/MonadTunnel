import React, { useState } from 'react';
import { getAiRecommendation } from '../../services/aiClient';

interface AIHUDProps {
  data: any[];
  onRecommendation: (dappId: string | null) => void;
}

export function AIHUD({ data, onRecommendation }: AIHUDProps) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setResponse(null); // Clear previous
    onRecommendation(null); // Reset highlight

    try {
      const result = await getAiRecommendation(input, data);
      setResponse(result.reasoning);
      if (result.recommendedAppIds && result.recommendedAppIds.length > 0) {
        onRecommendation(result.recommendedAppIds[0]);
      }
    } catch (err) {
      setResponse("Connection to Oracle failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '500px',
      maxWidth: '90%',
      zIndex: 20
    }}>
      {response && (
        <div style={{
          background: 'rgba(0, 240, 255, 0.1)',
          border: '1px solid #00f0ff',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          color: '#00f0ff',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)'
        }}>
          <strong style={{ display: 'block', fontSize: '0.7rem', opacity: 0.7, marginBottom: '4px' }}>ORACLE RESPONSE:</strong>
          {response}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the Oracle (e.g., 'Where can I trade tokens?')"
          style={{
            flex: 1,
            background: 'rgba(0,0,0,0.8)',
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '12px 16px',
            color: 'white',
            fontFamily: 'monospace',
            outline: 'none'
          }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{
            background: '#200052',
            border: '1px solid #833ab4',
            color: '#fff',
            padding: '0 20px',
            borderRadius: '8px',
            cursor: loading ? 'wait' : 'pointer',
            fontWeight: 'bold',
            fontFamily: 'monospace'
          }}
        >
          {loading ? 'SCANNING...' : 'QUERY'}
        </button>
      </form>
    </div>
  );
}