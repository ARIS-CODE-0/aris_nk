'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
export function Logo() { return <span className="wordmark">aris<span className="wordmark-dot">.</span><span className="wordmark-nk">NK</span></span>; }
export function Navigation() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links = [{ href: '/', label: 'Accueil' }, { href: '/projets', label: 'Projets' }, { href: '/services', label: 'Services' }, { href: '/contact', label: 'Contact' }];
  return <header className="nav-wrap"><div className="nav-island">
    <Link href="/" aria-label="Aris NK — accueil" onClick={() => setOpen(false)}><Logo /></Link>
    <nav aria-label="Navigation principale" className="desktop-nav">{links.map(link => <Link key={link.href} href={link.href} aria-current={(link.href === '/' ? path === '/' : path.startsWith(link.href)) ? 'page' : undefined}>{link.label}</Link>)}</nav>
    <Link className="nav-cta" href="/projets">Voir mes projets <ArrowUpRight size={16} /></Link>
    <button className="menu-toggle" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
  </div>{open && <nav id="mobile-nav" className="mobile-nav" aria-label="Navigation mobile">{links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={path === link.href ? 'page' : undefined}>{link.label}<ArrowUpRight size={18} /></Link>)}</nav>}</header>;
}
