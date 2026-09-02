# Diagnostic Netlify — « Adresse introuvable »

## Conclusion

Le dépôt produit une SPA Netlify publiable, mais aucune URL Netlify de production n’a été fournie dans l’environnement d’audit. L’erreur « Adresse introuvable » ne peut donc pas être attribuée au runtime React, au login ou au backend sans vérifier d’abord le domaine réellement déployé. Sur la base des preuves disponibles, la catégorie à vérifier en premier est **B — URL/domaine/DNS ou publication Netlify externe**, et non **G — authentification/session**.

## Preuves vérifiées dans le dépôt

| Contrôle | Résultat | Preuve |
|---|---|---|
| Commande Netlify | PASS | `pnpm build` |
| Répertoire publié | PASS | `dist/public` |
| Version Node | PASS | `NODE_VERSION = "22"` dans `netlify.toml` |
| Shell SPA | PASS | `dist/public/index.html` présent |
| Assets | PASS | assets JavaScript/CSS générés dans `dist/public/assets` |
| Variables non résolues | PASS | aucun `%VITE_*%` non résolu dans le HTML de production |
| Fallback SPA | PASS | `/* → /index.html`, statut 200 dans `netlify.toml` |
| Headers | PASS | cache immutable des assets, HTML/API no-store, CSP et headers de sécurité |
| Debug/HMR production | PASS | le debug collector est désormais limité à Vite `serve`; aucun bootstrap HMR dans le HTML de production |
| Routes du preview | PASS | les routes principales répondent au shell dans le serveur géré |

## Cause racine et limites

Aucun défaut de build ou de configuration de publication n’a été confirmé dans le dépôt. La cause exacte de « Adresse introuvable » reste **non déterminable sans l’URL Netlify réelle et l’état de publication correspondant**. Si le domaine `*.netlify.app` lui-même ne résout pas, l’incident est externe au code: site non publié, URL obsolète/incorrecte, DNS ou domaine personnalisé mal configuré. Si le domaine résout et affiche l’application, le fallback SPA existant couvre les navigations directes et les rafraîchissements.

Le frontend/backend, CORS, cookies, JWT/session, OAuth, SSE, X.509 et RBAC ont été vérifiés dans le code et les tests disponibles. La validation authentifiée depuis un domaine Netlify réel vers un backend HTTPS réel reste un contrôle de déploiement, non simulé et non revendiqué sans ces domaines et un storage state protégé.

## Réglages externes nécessaires

Netlify doit utiliser le dépôt et la commande `pnpm build`, publier `dist/public`, et disposer d’un site effectivement créé et publié. Après résolution du domaine, configurer `VITE_API_BASE_URL` avec l’origine HTTPS réelle du backend, sans valeur localhost ni placeholder. Côté backend, configurer `CORS_ALLOWED_ORIGINS` avec l’origine exacte Netlify, enregistrer le callback OAuth exact et vérifier cookies HTTPS, SSE credentialé, JWT/session et stockage persistant.

## Verdict

**Code et configuration du dépôt: READY FOR DEPLOYMENT.** **Déploiement réel: NOT READY TO CONFIRM** tant que l’URL Netlify, l’état de publication/DNS, le backend HTTPS et le flux authentifié de bout en bout ne sont pas vérifiés.
