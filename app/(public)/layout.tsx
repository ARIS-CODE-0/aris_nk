import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
export const dynamic = 'force-dynamic';
export default function PublicLayout({ children }: { children: React.ReactNode }) { return <><a className="skip-link" href="#contenu">Aller au contenu</a><Navigation /><main id="contenu">{children}</main><Footer /></>; }
