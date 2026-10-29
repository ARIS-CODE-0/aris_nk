import Link from 'next/link';
import { configured } from '@/lib/supabase/server';
import { LoginForm } from '@/components/admin-forms';
import { Logo } from '@/components/navigation';
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) { const enabled = configured(); const { error } = await searchParams; return <main className="login-wrap"><div className="login-card"><Link href="/" aria-label="Aris NK — accueil"><Logo /></Link><h1>Le côté coulisses<span className="text-blue">.</span></h1><p>Connecte-toi pour gérer tes projets, services et compétences.</p>{!enabled && <p className="admin-note">L’espace administrateur sera disponible une fois Supabase configuré. Consulte le guide d’installation du projet.</p>}{error === 'access' && <p className="error-message" role="alert">Ce compte n’a pas accès à l’administration.</p>}<LoginForm enabled={enabled} /><Link className="text-link" href="/">← Retour au site</Link></div></main>; }
