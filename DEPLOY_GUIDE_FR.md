# OhFrame — Guide de déploiement (MVP)

Ce guide t'accompagne **pas à pas**.

## 1) Prérequis
- Compte **Supabase** (gratuit) — https://supabase.com
- Compte **Vercel** — https://vercel.com
- Compte **Stripe** — https://dashboard.stripe.com
- Clé **Anthropic** — https://console.anthropic.com
- Node.js 18+ et PNPM ou NPM

## 2) Supabase
1. Crée un projet. Récupère:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`
   - **JWT secret** → `SUPABASE_JWT_SECRET`
2. Dans **SQL Editor**, colle le contenu de `supabase/schema.sql` et exécute.
3. (Optionnel) Crée un **bucket** `videos` si tu veux stocker les vidéos.

## 3) Stripe
1. Crée un compte et une clé **secret** → `STRIPE_SECRET_KEY`.
2. Configure un **endpoint webhook** sur `https://<ton-domaine>/api/webhooks/stripe` et copie la valeur → `STRIPE_WEBHOOK_SECRET`.

## 4) Anthropic (Claude)
- Crée une API key → `ANTHROPIC_API_KEY`.

## 5) Variables d'environnement
Copie `.env.example` vers `.env` et renseigne TOUTES les clés.

## 6) Lancer en local
```bash
npm install
npm run dev
```
Va sur http://localhost:3000

## 7) Déploiement Vercel
1. Import du repo dans Vercel (ou drag&drop).
2. Ajoute **toutes les variables** d'environnement dans Project Settings → Environment Variables.
3. Déploie. Vérifie `/login` puis la redirection vers `/dashboard` après magic-link.

## 8) Webhooks Stripe
- Dans Stripe → Developers → Webhooks, ajoute l'URL de prod `https://<domaine>/api/webhooks/stripe`.
- Colle la secret dans Vercel → ENV.

## 9) Notes sécurité & prod
- `jobs`/`candidates` ont RLS permissif pour MVP. **À restreindre** par `org_id/user_id`.
- Ajoute une **signature HMAC** pour le token mobile vidéo (cf. TODO dans `/api/upload/video`).
- Active `redirectTo` du magic link vers `/dashboard`.
- Ajoute monitoring (Logflare/Better Stack) et métriques.

Bon déploiement !
