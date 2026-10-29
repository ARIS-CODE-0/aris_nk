import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { logout } from '../actions';
import { Logo } from '@/components/navigation';
import { labels, type Kind } from '@/lib/types';
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) { await requireAdmin(); return <div className="admin-body"><header className="admin-header"><Link href="/admin" aria-label="Tableau de bord"><Logo /></Link><div><Link href="/">Voir le site ↗︎</Link><form action={logout}><button>Déconnexion</button></form></div></header><div className="admin-shell"><nav className="admin-nav" aria-label="Administration"><Link href="/admin">Vue d’ensemble</Link>{(Object.keys(labels) as Kind[]).map(k => <Link key={k} href={`/admin/${k}`}>{labels[k]}</Link>)}</nav>{children}</div></div>; }
