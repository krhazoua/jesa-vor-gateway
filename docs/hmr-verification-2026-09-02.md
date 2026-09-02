# Vérification HMR — 2026-09-02

Après redémarrage du serveur géré, une navigation fraîche vers la route racine a correctement redirigé vers `/login`, ce qui confirme que la frontière d’authentification reste active et que le rendu de la page Login est présent. La page contient le titre VoR Gateway, le formulaire de démarrage OAuth sécurisé et le message d’authentification serveur. La console navigateur fraîche ne contient aucun message WebSocket/HMR ni erreur JavaScript. Les contrôles ciblés précédents ont validé TypeScript et les tests HMR; le correctif final doit encore être couvert par la suite complète et un checkpoint.

## Contrôle complémentaire

Le HTML servi avec `Accept: text/html` répond en 200 avec `Cache-Control: no-store, no-cache, must-revalidate`; il contient le collector de debug de preview et le module source attendu, mais aucun `/@vite/client` ni `/@react-refresh`. Après un nouveau chargement navigateur cache-busté, la route racine redirige vers `/login`, l’interface JESA est rendue et la console fraîche ne contient aucun message HMR/WebSocket. Les erreurs du journal historique à 01:06, 01:14, 01:15 et 01:16 précèdent ou concernent des onglets legacy; elles ne sont pas reproduites par le document frais actuel.
