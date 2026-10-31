import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import { site, siteUrl } from '@/lib/site';
import './globals.css';
const grotesk = localFont({ src: [{ path: '../public/fonts/grotesk-regular.ttf', weight: '400' }, { path: '../public/fonts/grotesk-bold.ttf', weight: '700' }], variable: '--font-grotesk', display: 'swap' });
const mono = localFont({ src: '../public/fonts/mono-regular.ttf', variable: '--font-mono', weight: '400', display: 'swap' });
export const metadata: Metadata = { metadataBase: new URL(siteUrl), title: { default: site.title, template: '%s — Aris NK' }, description: site.description, authors: [{ name: site.fullName, url: siteUrl }], creator: site.fullName, openGraph: { type: 'website', locale: 'fr_CD', siteName: site.name, title: site.title, description: site.description, images: ['/opengraph-image?v=2'] }, twitter: { card: 'summary_large_image', creator: '@aristote_nk' } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="fr"><body className={`${grotesk.variable} ${mono.variable}`}>{children}<Analytics /></body></html>; }
