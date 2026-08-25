# 🏨 Babydja — Plateforme de Réservation d'Hôtels & Véhicules

**Babydja** est une plateforme fullstack de réservation en ligne d'hôtels et de véhicules, pensée pour le marché africain. Elle intègre un système de paiement local (CinetPay), des notifications SMS (Africa's Talking), du stockage média (Cloudflare R2), ainsi qu'un programme de parrainage.

---

## 📦 Architecture du projet

Ce projet est un **monorepo npm workspaces** composé de deux applications :

```
babidja_with_bini/
├── apps/
│   ├── api/          # Backend NestJS (REST API + WebSockets)
│   └── web/          # Frontend Next.js 16 (React 19)
├── docker-compose.yml
└── package.json
```

---

## 🛠️ Stack technique

### Backend (`apps/api`)
| Technologie | Rôle |
|---|---|
| **NestJS 10** | Framework API REST |
| **Prisma 5** | ORM & migrations PostgreSQL |
| **PostgreSQL 15** | Base de données principale |
| **Redis 7** | Cache & queues BullMQ |
| **Socket.io** | Messagerie temps réel |
| **Passport + JWT** | Authentification (local + Google OAuth) |
| **Swagger** | Documentation API auto-générée |
| **CinetPay** | Paiement en ligne (Afrique) |
| **Africa's Talking** | Notifications SMS |
| **Cloudflare R2** | Stockage des médias (photos hôtels/véhicules) |
| **Firebase Admin** | Notifications push |

### Frontend (`apps/web`)
| Technologie | Rôle |
|---|---|
| **Next.js 16** | Framework React SSR/SSG |
| **React 19** | Interface utilisateur |
| **TailwindCSS 4** | Styles utilitaires |
| **TanStack Query** | Gestion des données serveur |
| **Zustand** | State management global |
| **React Hook Form + Zod** | Formulaires et validation |
| **Socket.io-client** | Messagerie temps réel |
| **Recharts** | Graphiques (dashboard admin) |
| **next-pwa** | Support Progressive Web App |

---

## ✅ Prérequis

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (pour PostgreSQL & Redis)
- npm v9+

---

## 🚀 Démarrage rapide

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd babidja_with_bini
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Éditez ensuite `apps/api/.env` avec vos clés (voir section [Variables d'environnement](#-variables-denvironnement)).

### 4. Démarrer les services Docker (PostgreSQL + Redis)

> ⚠️ **Docker Desktop doit être lancé avant cette étape.**

```bash
docker compose up -d
```

Vérifiez que les containers sont bien démarrés :
```bash
docker compose ps
```

### 5. Exécuter les migrations Prisma

```bash
npm run prisma:migrate --workspace=apps/api
```

_(Optionnel)_ Alimenter la base avec des données de test :
```bash
npm run prisma:seed --workspace=apps/api
```

### 6. Lancer le projet en développement

Dans deux terminaux séparés :

```bash
# Terminal 1 — API (http://localhost:3001)
npm run dev:api

# Terminal 2 — Frontend (http://localhost:3000)
npm run dev:web
```

---

## 🌐 URLs de développement

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API REST | http://localhost:3001/api/v1 |
| Swagger (docs API) | http://localhost:3001/api/docs |
| Health check | http://localhost:3001/health |
| Prisma Studio | `npm run prisma:studio --workspace=apps/api` |

---

## 🔑 Comptes de test

Une fois le script `create-test-users.ts` exécuté, vous pouvez utiliser ces identifiants pour tester les différents tableaux de bord (le mot de passe est toujours `password123`) :

| Rôle | Email | Mot de passe | Accès |
|---|---|---|---|
| **Super Administrateur** | `admin@babydja.com` | `password123` | [http://localhost:3000/admin](http://localhost:3000/admin) |
| **Gérant Hôtel** | `hotel@babydja.ci` | `password123` | [http://localhost:3000/gerant](http://localhost:3000/gerant) |
| **Gérant Auto** | `auto@babydja.ci` | `password123` | [http://localhost:3000/gerant](http://localhost:3000/gerant) |

> **Note :** Si ces comptes n'existent pas encore, générez-les depuis le backend (`apps/api`) avec la commande : `npx ts-node create-test-users.ts`

---

## 🔐 Variables d'environnement

### `apps/api/.env`

```env
# Base de données
DATABASE_URL=postgresql://babydja:babydja@localhost:5432/babydja
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=<secret_long_aleatoire_min_64_chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<autre_secret_long>
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=<depuis_google_cloud_console>
GOOGLE_CLIENT_SECRET=<depuis_google_cloud_console>
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback

# Paiement CinetPay
CINETPAY_API_KEY=<depuis_dashboard_cinetpay>
CINETPAY_SITE_ID=<depuis_dashboard_cinetpay>
CINETPAY_WEBHOOK_SECRET=<secret_hmac_cinetpay>
CINETPAY_NOTIFY_URL=http://localhost:3001/api/v1/payments/webhook
CINETPAY_RETURN_URL=http://localhost:3000/reservation/confirmation

# SMS — Africa's Talking
SMS_PROVIDER=africastalking
AT_API_KEY=<depuis_dashboard_africastalking>
AT_USERNAME=babydja
AT_SENDER_ID=BABYDJA

# Stockage média — Cloudflare R2
R2_ACCOUNT_ID=<cloudflare_account_id>
R2_ACCESS_KEY_ID=<r2_access_key>
R2_SECRET_ACCESS_KEY=<r2_secret>
R2_BUCKET_NAME=babydja-media
R2_PUBLIC_URL=https://media.babydja.com

# Firebase (notifications push)
FIREBASE_PROJECT_ID=babydja-prod
FIREBASE_PRIVATE_KEY=<depuis_firebase_console>
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@babydja-prod.iam.gserviceaccount.com

# Parrainage & dépôt
REFERRAL_REWARD_AMOUNT=<montant_en_XOF>
DEPOSIT_RATE_DEFAULT=0.30

# Serveur
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## 📋 Commandes disponibles

### Racine du monorepo

```bash
npm run dev:api          # Démarrer l'API en mode watch
npm run dev:web          # Démarrer le frontend
npm run build:api        # Build de production API
npm run build:web        # Build de production frontend
npm run test:api         # Lancer les tests API
```

### API (`apps/api`)

```bash
npm run prisma:migrate   # Créer et appliquer une migration
npm run prisma:deploy    # Appliquer les migrations en production
npm run prisma:generate  # Régénérer le client Prisma
npm run prisma:studio    # Ouvrir Prisma Studio (GUI base de données)
npm run prisma:seed      # Alimenter la base avec des données de test
npm run test:cov         # Couverture de tests
npm run test:e2e         # Tests end-to-end
```

---

## 🗂️ Modules API

| Module | Description |
|---|---|
| `auth` | Inscription, connexion, JWT, Google OAuth, refresh tokens |
| `users` | Gestion des profils utilisateurs |
| `hotels` | CRUD hôtels, chambres, photos |
| `vehicles` | CRUD véhicules |
| `bookings` | Création et gestion des réservations |
| `payments` | Paiement CinetPay, webhook, remboursements |
| `availability` | Calendrier de disponibilité |
| `messaging` | Messagerie en temps réel (WebSockets) |
| `notifications` | Notifications push (Firebase) & SMS |
| `referral` | Programme de parrainage |
| `tenants` | Gestion multi-tenants (hôteliers/loueurs) |
| `admin` | Dashboard administrateur |
| `storage` | Upload de fichiers vers Cloudflare R2 |

---

## 🐳 Docker

Le fichier `docker-compose.yml` démarre les services nécessaires au développement :

```bash
docker compose up -d      # Démarrer en arrière-plan
docker compose down       # Arrêter les containers
docker compose logs -f    # Suivre les logs
```

| Service | Port | Credentials |
|---|---|---|
| PostgreSQL | 5432 | user: `babydja` / pass: `babydja` / db: `babydja` |
| Redis | 6379 | — |

---

## 🧪 Tests

```bash
# Tests unitaires
npm run test:api

# Tests avec couverture
npm run test:cov --workspace=apps/api

# Tests e2e
npm run test:e2e --workspace=apps/api
```

---

## 📁 Structure du code API

```
apps/api/src/
├── auth/            # Stratégies Passport, guards, DTOs auth
├── users/           # Module utilisateurs
├── hotels/          # Module hôtels et chambres
├── vehicles/        # Module véhicules
├── bookings/        # Module réservations
├── payments/        # Module paiements CinetPay
├── availability/    # Gestion des disponibilités
├── messaging/       # WebSockets temps réel
├── notifications/   # Push & SMS
├── referral/        # Système de parrainage
├── tenants/         # Multi-tenancy
├── admin/           # Routes administrateur
├── storage/         # Upload Cloudflare R2
├── prisma/          # Service Prisma
├── redis/           # Service Redis/BullMQ
├── config/          # Configuration Joi
├── common/          # Guards, interceptors, decorators partagés
└── main.ts          # Point d'entrée
```

---

## 🤝 Contribution

1. Créez une branche depuis `main` : `git checkout -b feature/ma-fonctionnalite`
2. Committez vos changements : `git commit -m "feat: description"`
3. Ouvrez une Pull Request

---

## 📄 Licence

Projet privé — tous droits réservés © Babydja.
