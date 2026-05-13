import React, { useEffect, useRef, useState } from 'react';

/**
 * Reusable Google AdSense banner component.
 * Shows a visible placeholder on localhost so you can see where ads are placed.
 */
export default function AdBanner({ className = '', style = {}, format = 'auto', slot = '', layout = '' }) {
  const adRef = useRef(null);
  const pushed = useRef(false);
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    // Detect localhost
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168')) {
      setIsLocal(true);
      return;
    }

    if (pushed.current) return;
    try {
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch (e) {
      console.error('AdSense push error:', e);
    }
  }, []);

  // On localhost, show a visible placeholder
  if (isLocal) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '4px',
          background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.06) 10px, rgba(255,255,255,0.06) 20px)',
          border: '2px dashed rgba(0, 255, 65, 0.3)',
          borderRadius: '12px',
          minHeight: style.height || '90px',
          ...style,
        }}
      >
        <span style={{ fontSize: '11px', color: '#00ff41', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.7 }}>
          📢 GOOGLE ADSENSE
        </span>
        <span style={{ fontSize: '9px', color: '#666', fontWeight: 700, letterSpacing: '2px' }}>
          {format === 'horizontal' ? '468×60' : format === 'rectangle' ? '336×280' : 'ADAPTIVE'} • PLACEHOLDER
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-5950937373084402"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layout ? { 'data-ad-layout': layout } : {})}
      />
    </div>
  );
}
