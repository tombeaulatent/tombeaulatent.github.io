# Documentation technique
---

## Prérequis

- **Node.js** ≥ 22.12.0
- **npm** (fourni avec Node)

Cloner ou ouvrir le dépôt, puis se placer à la racine du projet :

```sh
cd tombeaulatent.github.io
```

---

## Lancer le serveur en local

1. Installer les dépendances (une fois, ou après un changement de `package.json`) :

```sh
npm install
```

2. Démarrer le serveur de développement :

```sh
npm run dev
```

3. Ouvrir dans le navigateur : [http://localhost:4321](http://localhost:4321)

Le site se recharge automatiquement à chaque modification de fichier.

### Autres commandes utiles

| Commande            | Rôle                                              |
| ------------------- | ------------------------------------------------- |
| `npm run build`     | Génère le site de production dans `dist/`         |
| `npm run preview`   | Prévisualise le build localement avant déploiement |
| `npm run astro …`   | Accès au CLI Astro (`astro check`, etc.)           |

---

## Créer une nouvelle page

Astro mappe chaque fichier de `src/pages/` vers une URL.

| Fichier                         | URL                    |
| ------------------------------- | ---------------------- |
| `src/pages/index.astro`         | `/`                    |
| `src/pages/a-propos.astro`      | `/a-propos`            |
| `src/pages/portfolio.astro`     | `/portfolio`           |
| `src/pages/ma-page.astro`       | `/ma-page`             |

### Démarches

1. **Créer le fichier** dans `src/pages/`, par exemple `contact.astro` :

```astro
---
import Layout from "../layouts/Layout.astro";
---

<Layout title="Contact">
  <section class="page-screen">
    <h1>Contact</h1>
    <!-- contenu de la page -->
  </section>
</Layout>
```

2. **Ajouter le lien dans la navigation** -> éditer `src/data/nav.ts` :

```ts
export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/curriculum-vitae", label: "Curriculum vitæ" },
  { href: "/contact", label: "Contact" }, // ← nouveau
];
```

3. **Vérifier** sur [http://localhost:4321/contact](http://localhost:4321/contact) que la page s’affiche et que le lien apparaît dans le menu.

Le layout (`Layout.astro`) fournit déjà l’en-tête, le pied de page et la barre d’outillage : inutile de les réimporter dans chaque page. :)

---

## Structure des dossiers

```text
tombeaulatent.github.io/
├── public/                 # Fichiers servis tels quels (URL racine)
│   ├── audio/              # Pistes audio du lecteur
│   ├── fonts/              # Polices locales
│   ├── icons/              # SVG (Instagram, play, etc.)
│   └── images/             # Images statiques
├── src/
│   ├── components/react/   # Îles React (UI interactive)
│   ├── data/               # Données partagées (nav, musique)
│   ├── hooks/              # Logique React réutilisable
│   ├── layouts/            # Coque HTML commune aux pages
│   ├── pages/              # Routes du site (fichiers .astro)
│   └── styles/             # Feuilles de style CSS
├── astro.config.mjs        # Config Astro (+ intégration React)
├── package.json            # Dépendances et scripts npm
└── doc.md                  # Ce guide
```

### Rôle de chaque dossier

| Dossier / fichier        | Utilité |
| ------------------------ | ------- |
| **`public/`**            | Assets statiques. Un fichier `public/icons/play.svg` est accessible à `/icons/play.svg`. |
| **`src/pages/`**         | Pages du site. Un fichier = une route. |
| **`src/layouts/`**       | Gabarit partagé (`Layout.astro`) : `<head>`, nav, footer, outillage, transitions. |
| **`src/components/react/`** | Composants React hydratés côté navigateur (menu, dock, fond ASCII). |
| **`src/hooks/`**         | Hooks React : menu mobile, animations GSAP, lecteur audio, loupe, chemin Astro. |
| **`src/data/`**          | Constantes : liens de navigation (`nav.ts`), métadonnées audio (`musique.ts`). |
| **`src/styles/`**        | CSS du projet (`tokens`, `global`, `menu`, `hero`, `outillage`). |

### Composants React (îles)

| Fichier           | Rôle |
| ----------------- | ---- |
| `SiteHeader.tsx`  | Navigation desktop + menu mobile animé |
| `Outillage.tsx`   | Barre du bas : réseaux + lecteur audio |
| `AuroraBg.tsx`    | Fond ASCII animé (page d’accueil) |

Ils sont montés depuis des fichiers `.astro` avec une directive client, par exemple `client:load` ou `client:idle`.

---

## Technologies utilisées

| Technologie | Rôle dans le projet |
| ----------- | ------------------- |
| **[Astro](https://docs.astro.build)** | Framework principal : pages HTML statiques, routing fichier, View Transitions. |
| **[@astrojs/react](https://docs.astro.build/en/guides/integrations-guide/react/)** | Intégration qui permet d’hydrater des composants React (« îles »). |
| **React** | UI interactive (menu, dock, fond). |
| **TypeScript** | Typage des composants, hooks et données. |
| **[GSAP](https://gsap.com/)** | Animations du menu mobile et effet loupe du dock. |
| **[Howler](https://howlerjs.com/)** | Lecture audio dans la barre d’outillage. |
| **[@asciitopia](https://www.npmjs.com/package/@asciitopia/react)** | Motif ASCII « aurora » en fond de hero. |
| **Vite** | Bundler utilisé en interne par Astro (dev + build). |

### Architecture en bref

- **Astro** génère le HTML et gère le contenu des pages.
- **React** n’intervient que là où il faut du JS vivant (nav, musique, effet visuel).
- Les styles sont du **CSS classique** (variables dans `tokens.css`).
- Le site est prévu pour un déploiement statique (ex. GitHub Pages : `https://tombeaulatent.github.io`).

---

## Musique (lecteur)

La config audio est centralisée dans `src/data/musique.ts` :

```ts
export const MUSIQUE = {
  source: "", // ex. "/audio/ma-piste.mp3"
  titre: "Titre de la musique",
  artiste: "Artiste",
};
```

1. Placer le fichier dans `public/audio/`
2. Renseigner `source` (chemin public, ex. `/audio/ma-piste.mp3`)
3. Mettre à jour `titre` et `artiste`

---

## Ressources

- [Documentation Astro](https://docs.astro.build)
- [Îles / directives client](https://docs.astro.build/en/guides/framework-components/)
- [View Transitions](https://docs.astro.build/en/guides/view-transitions/)
