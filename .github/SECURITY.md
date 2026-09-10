# Politique de sécurité

## Versions supportées

Les plugins publiables (`@pasquelin/map3d-plugin-geopf`, `@pasquelin/map3d-plugin-windy`) partagent
une **version unifiée**. Le projet est en `0.x` : seule la **dernière version publiée** reçoit des
correctifs de sécurité.

| Version | Supportée |
|---|---|
| dernière `0.x` publiée | ✅ |
| versions antérieures | ❌ |

Vérifier la version courante : `npm view @pasquelin/map3d-plugin-geopf version`.

## Signaler une faille

**N'ouvrez pas d'issue publique** pour une vulnérabilité.

1. De préférence, utilisez le
   [signalement privé de GitHub](https://github.com/pasquelin/map3d-plugins/security/advisories/new)
   (onglet *Security* → *Report a vulnerability*).
2. À défaut, écrivez à **alban.pasquelin@gmail.com** avec `[SECURITY]` en objet.

Merci d'inclure : la version concernée, les étapes de reproduction, l'impact estimé et, si possible,
un correctif ou une piste. Réponse sous **72 h**, correctif publié dès que possible sous forme d'une
nouvelle version (une version publiée n'est jamais republiée).

## Périmètre

Sont dans le périmètre de ce dépôt :

- le code des packages `packages/*/src` publié sur npm ;
- la chaîne de publication (`.github/workflows/release.yml`, provenance OIDC) ;
- l'exposition involontaire d'un secret dans un paquet publié ou dans le dépôt.

Sont **hors** périmètre : les vulnérabilités de la lib hôte
[map3D](https://github.com/pasquelin/map3D) (à signaler sur son propre dépôt), celles des services
tiers interrogés (Géoplateforme IGN, Windy) et celles des dépendances amont — à signaler à leurs
mainteneurs, même si elles remontent ici via `pnpm audit`.

## Clés d'API — le rappel qui compte

`@pasquelin/map3d-plugin-windy` requiert une clé d'API Windy. Elle n'est **jamais** committée :
elle vit dans `packages/windy/example/.env` (gitignoré), documentée sans valeur réelle dans
`.env.example`, et le hub des plugins la traite comme un champ `secret` (jamais affichée en clair).

⚠️ Dans une application **web**, toute clé embarquée dans le bundle est lisible par le client :
pour un déploiement public, faites transiter les appels par un proxy côté serveur et restreignez la
clé chez le fournisseur.

## Intégrité des paquets

Les paquets sont publiés par GitHub Actions via **npm Trusted Publishing (OIDC)** — aucun token de
publication — avec **provenance signée**. Vérifier :

```bash
npm audit signatures
npm view @pasquelin/map3d-plugin-geopf --json | grep -i provenance
```
