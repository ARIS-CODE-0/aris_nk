import { ImageResponse } from 'next/og';
export const alt = 'Aristote Nkomba (Aris NK) — Développeur web et SaaS builder à Lubumbashi, RDC';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() { return new ImageResponse(<div style={{ background: '#f9f9ff', color: '#1a1b21', width: '100%', height: '100%', padding: 80, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}><div style={{ fontSize: 32, color: '#2563eb' }}>ARISTOTE NKOMBA · ARIS NK / LUBUMBASHI, RDC</div><div style={{ fontSize: 86, fontWeight: 700, lineHeight: 1.05, display: 'flex', flexDirection: 'column' }}><span>Des idées. Du code.</span><span style={{ color: '#2563eb' }}>Des produits.</span></div><div style={{ fontSize: 26 }}>Développeur web & SaaS builder · RDC</div></div>, size); }
