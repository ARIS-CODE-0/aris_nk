export const site = {
  name: 'Aris NK',
  title: 'Aris NK — SaaS builder à Lubumbashi',
  description: 'SaaS builder à Lubumbashi, en RDC. Je construis mes produits, explore des idées et partage mon parcours de développeur autodidacte.',
  email: 'mail.pro@arislabs.online',
  whatsapp: 'https://wa.me/243827296237',
  location: 'Lubumbashi, RDC',
  bio: 'SaaS builder basé à Lubumbashi, en RDC, je transforme mes idées en produits web. Développeur full stack autodidacte depuis 2023, j’apprends en construisant. Depuis début 2026, je me consacre plus sérieusement à la création de SaaS et je partage mes essais, mes apprentissages et les étapes de ce parcours.',
  socials: [
    { label: 'GitHub', href: 'https://github.com/ARIS-CODE-0' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@aris.nk0' },
    { label: 'X / Twitter', href: 'https://x.com/aristote_nk' },
  ],
  journey: [
    { date: '2023', title: 'Apprendre en faisant.', text: 'Je découvre le développement web en autodidacte. La curiosité devient une pratique : apprendre, essayer, comprendre et recommencer.' },
    { date: '2023 — 2025', title: 'Des idées aux premiers projets.', text: 'Je développe mes compétences à travers des projets personnels. Chaque réalisation est une occasion de mieux comprendre comment construire pour le web.' },
    { date: '2026', title: 'Le cap sur le SaaS.', text: 'Je décide de me lancer plus sérieusement dans la création de produits SaaS, avec l’envie de transformer des problèmes concrets en solutions utiles.' },
    { date: 'Aujourd’hui', title: 'Construire et partager.', text: 'Je poursuis mes projets et me lance dans la création de contenu pour partager ce que j’apprends au fil du chemin.' },
  ],
};
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
