# Aris NK

Portfolio Next.js / TypeScript, back-office intégré et Supabase. Les fichiers BMAD existants sont conservés dans `_bmad` et `.agents`.

## Démarrage local

Node.js 22.13+ (testé avec Node 24), npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Ouvrir http://localhost:3000. Sans configuration Supabase, le site présente les contenus personnels et des listes vides ; `/admin/login` affiche un état de configuration sans autoriser la connexion. Aucun jeu de données fictif n’est chargé. Une erreur de connexion sur une instance configurée affiche une erreur plutôt qu’un faux état vide.

## Connecter Supabase

1. Créer un projet Supabase. Dans le SQL Editor, exécuter les fichiers de `supabase/migrations` **une seule fois chacun, dans l’ordre de leur nom**, sur un projet neuf. Le script crée les tables, les politiques RLS et le bucket **privé** `project-media`.
2. Dans Authentication → Providers → Email, désactiver les nouvelles inscriptions publiques (« Allow new users to sign up »). Garder la connexion par e-mail/mot de passe activée.
3. Dans Authentication → Users → Add user, créer votre utilisateur administrateur avec e-mail, mot de passe robuste et confirmation de l’e-mail. Aucun mot de passe n’est dans le dépôt.
4. Copier l’UUID du compte et l’inscrire via SQL Editor :

```sql
insert into public.administrators (user_id)
values ('REMPLACER_PAR_UUID_DU_COMPTE');
```

La contrainte `singleton` autorise un seul administrateur. Seul le SQL Editor ou un contexte privilégié peut changer cette liste ; un utilisateur authentifié ne peut pas s’octroyer le rôle.

5. Dans `.env.local`, renseigner les valeurs publiques du projet, depuis Project Settings → API :

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=VOTRE_CLE_PUBLIQUE
```

La clé publique moderne `sb_publishable_…` est attendue (la clé legacy `anon` fonctionne aussi). **Ne jamais utiliser de clé `service_role` ou `sb_secret_…` dans ces variables.** L’application n’en a pas besoin. Redémarrer le serveur après configuration.

6. Configurer Authentication → URL Configuration avec l’URL finale du site. Se connecter sur `/admin/login`. La session est rafraîchie par `proxy.ts` ; chaque action et page privée contrôle à nouveau l’identité et le rôle.

## Gestion des contenus

- Ouvrir **Compétences** : cette page liste les catégories et permet d’en ajouter. Ouvrir une catégorie pour consulter ses compétences et en ajouter ; la catégorie est déjà choisie. Les anciennes adresses `/admin/categories` redirigent vers ce parcours.
- Chaque nouveau contenu (catégorie, compétence, service, projet, image) reçoit automatiquement la position suivante à l’enregistrement, sans champ à remplir. Les compétences sont ordonnées par catégorie et les images par projet. Les positions existantes sont conservées. Un changement de catégorie place la compétence à la fin du nouveau groupe. Réordonner ensuite avec le champ « Ordre » sur les formulaires de modification : le plus petit nombre est affiché en premier. À ordre égal, la création la plus ancienne passe d’abord.
- Une catégorie en brouillon masque ses compétences. Les catégories sans compétence publiée sont masquées. Les accordéons publics sont fermés initialement ; ils peuvent être ouverts indépendamment et au clavier.
- Les services comportent titre, résumé et description, sans tarif. `/services` affiche des cartes avec titre et résumé uniquement ; « Voir plus » ouvre la fiche `/services/[id]` avec la description complète et le bouton de contact. La prévisualisation privée montre cette fiche complète, même pour un brouillon. Les fiches en brouillon ou supprimées renvoient une 404 publique. Les adresses restent stables si le titre change.
- Les projets comportent titre, slug, résumé, description, type, technologies libres et liens facultatifs. Enregistrer le projet avant d’ajouter des images. Modifier son slug change son adresse, sans redirection automatique.
- L’image au plus petit ordre est la couverture. Les suivantes constituent la galerie. JPEG/PNG/WebP/AVIF uniquement, **3 Mo maximum** pour rester compatible avec les limites de requête Vercel. Le serveur vérifie aussi la signature du fichier ; SVG refusé. Texte alternatif obligatoire.
- « Publier sur le site » active la publication ; décocher retire le contenu. Les changements invalident la navigation en cache, sans redéploiement. La prévisualisation authentifiée permet de consulter les brouillons.
- Une catégorie contenant des compétences ne peut pas être supprimée : déplacer ou supprimer ses compétences d’abord. Les suppressions de contenus et images demandent une confirmation.
- Les descriptions utilisent du texte simple, avec retours à la ligne ; aucun HTML saisi n’est interprété.

Les tables sont protégées par RLS. Les visiteurs et les comptes non administrateurs ne peuvent pas écrire. Les images ne sont lisibles qu’après publication du projet ; elles sont servies par URL signée expirant après **5 minutes**. Une URL déjà émise peut rester utilisable jusqu’à expiration après dépublication ; aucune nouvelle URL publique n’est alors accordée. Les pages dynamiques ne mettent pas ces URLs en cache. Les objets téléversés mais non rattachés ne sont pas publics.

## Personnalisation et ressources

- Identité, biographie, parcours et contacts : `lib/site.ts`.
- Portrait : `public/portrait.jpg`. Logo typographique : composant `Logo`.
- Styles : `app/globals.css`. Le site Netlify fourni prime sur les divergences de `DESIGN.md`.
- Polices hébergées localement ; licences SIL Open Font License dans `public/fonts`.
- Pas de formulaire, appel téléphonique, blog, paiement ou suivi d’audience.

## Déploiement Vercel

1. Placer ce dossier dans un dépôt Git et l’importer dans Vercel ; sélectionner le dossier `aris_nk` comme Root Directory si le dépôt contient d’autres dossiers.
2. Framework : Next.js, Node 24, installation `npm ci`, build `npm run build`.
3. Ajouter les trois variables ci-dessus aux environnements voulus. `NEXT_PUBLIC_SITE_URL` doit être l’origine HTTPS canonique, sans slash final. Ne pas utiliser automatiquement le domaine de l’adresse e-mail.
4. Appliquer la migration et provisionner l’administrateur dans Supabase avant de connecter ses variables.
5. Déployer, régler l’URL du site dans Supabase et vérifier la connexion admin, un brouillon, sa publication et une image.
6. Ajouter un domaine seulement lorsqu’il a été choisi. Redéployer après toute modification d’une variable publique.

Aucune ressource distante n’est créée par ce dépôt. Les comptes Supabase et Vercel restent nécessaires. Pour un déploiement de prévisualisation public, envisager la protection Vercel afin de ne pas indexer un doublon ; l’administration possède ses propres directives `noindex` et `robots.txt`.

## Vérifications

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

- Tests unitaires : validations de contenus, liens, limites et signatures d’images.
- Tests PostgreSQL avec PGlite : migration réelle, RLS des visiteurs/comptes ordinaires/admin, brouillons, stockage, publication/dépublication, unicité du slug et suppression d’une catégorie non vide. Les contrats `auth`/`storage` de Supabase sont simulés en SQL, pas son API HTTP.
- Tests Chromium desktop/mobile : navigation réelle, contacts, états vides, protection des pages et prévisualisations, 404, sitemap. À lancer sur une instance **sans variables Supabase**. Un test de composant couvre l’interaction native des accordéons avec données de test, sans fixture exposée dans le site.

Avant mise en production avec Supabase réel, vérifier dans l’interface : login/logout, création des quatre types, prévisualisation, classement, déplacement de compétence, publication/dépublication, upload et suppression d’image, suppression confirmée. Vérifier aussi avec une session privée qu’un brouillon reste inaccessible. Surveiller les erreurs Vercel et les quotas Supabase ; conserver les sauvegardes offertes par le plan Supabase choisi.
