import { ImageResponse } from 'next/og';
export const alt = 'Aristote Nkomba (Aris NK) — Développeur web et SaaS builder à Lubumbashi, RDC';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(
    <div style={{ background: '#f9f9ff', color: '#1a1b21', width: '100%', height: '100%', padding: 72, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 30, color: '#2563eb' }}>ARISTOTE NKOMBA · ARIS NK</span>
        <span style={{ fontSize: 22, color: '#55596a' }}>LUBUMBASHI, RDC</span>
      </div>
      <div style={{ fontSize: 82, fontWeight: 700, lineHeight: 1.05, display: 'flex', flexDirection: 'column' }}>
        <span>Des idées. Du code.</span>
        <span style={{ color: '#2563eb' }}>Des produits.</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <span style={{ fontSize: 24 }}>Développeur web & SaaS builder</span>
        <span style={{ fontSize: 23, background: '#2563eb', color: '#fff', padding: '20px 26px', borderRadius: 8 }}>Découvrir mes projets →</span>
      </div>
    </div>,
    size,
  );
}
