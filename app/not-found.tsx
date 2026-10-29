import Link from 'next/link';
export default function NotFound() { return <div className="standalone-state"><span className="eyebrow">404 // PAGE INTROUVABLE</span><h1>Un détour imprévu<span className="text-blue">.</span></h1><p>Cette page n’existe pas ou n’est pas publiée.</p><Link className="button" href="/">Retour à l’accueil ↗︎</Link></div>; }
