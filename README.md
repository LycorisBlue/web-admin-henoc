
```markdown
# 📦 Structure du projet – Next.js (App Router)

Ce projet utilise **Next.js avec App Router** pour construire une application web modulaire, évolutive et maintenable. Voici l’explication de chaque dossier clé du projet.

---

## 🗂️ Arborescence du projet

```

├── app/
├── components/
├── lib/
├── services/
├── types/
├── public/
├── styles/
├── middleware.ts
├── next.config.js
├── tailwind.config.js
├── tsconfig.json

````

---

## 📁 Détails des dossiers

### `app/`  
Contient **l’ensemble des pages** de l’application, structurées par routes.  
Fonctionne avec **App Router** (`layout.tsx`, `page.tsx`, `loading.tsx`, etc.).

- `layout.tsx` : Layout global (header/footer/providers)
- `page.tsx` : Page d’accueil (`/`)
- `[param]/` : Routes dynamiques (`/user/[id]`)
- `(group)/` : Groupement logique de routes sans impact sur l’URL

---

### `components/`  
Composants UI réutilisables, découpés par **type ou ressource**.

- `ui/` : Boutons, modales, formulaires génériques
- `layout/` : Header, Sidebar, Footer
- `resourceX/` : Composants liés à une entité métier (ex: `UserCard`)

---

### `lib/`  
Fonctions **utilitaires, hooks, validators et gestion d’état**.

- `api/` : Fonctions pour appeler l’API via `fetch`, `axios`, etc.
- `hooks/` : Hooks personnalisés (`useAuth`, `useForm`, etc.)
- `auth/` : Gestion d’authentification (JWT, sessions, etc.)
- `validators/` : Schémas de validation (Zod/Yup)

---

### `services/`  
Couche **intermédiaire entre le front et l’API**. Contient la logique métier, appels réseau, mapping des données.

- `user.service.ts` : Exemples de fonctions `getUser`, `createUser`, etc.

---

### `types/`  
Déclarations **TypeScript** centralisées pour les types partagés.

- `api.ts` : Interfaces des réponses API
- `user.ts`, `product.ts` : Types métier
- `common.ts` : Types génériques (Paginations, Responses)

---

### `public/`  
Fichiers statiques (images, icônes, fonts). Accessibles via `/public` dans l’URL.

---

### `styles/`  
Feuilles de styles globales ou spécifiques, ex : `globals.css`.

---

### Fichiers racines

- `middleware.ts` : Middlewares pour gestion des accès, redirections
- `next.config.js` : Configuration Next.js
- `tailwind.config.js` : Configuration Tailwind CSS (si utilisé)
- `tsconfig.json` : Configuration TypeScript
- `.env.local` : Variables d’environnement

---

## ✅ Bonnes pratiques

- **Favoriser les Server Components**, sauf si interaction client nécessaire.
- **Modulariser par ressource métier**.
- **Valider toutes les données** côté client et serveur.
- **Séparer** clairement UI, logique métier et appels API.

---

## 🚀 Lancer le projet

```bash
npm install
npm run dev
````

---
```
