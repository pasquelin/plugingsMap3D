# @pasquelin/map3d-plugin-template
Modèle à copier. `cp -r packages/plugin-template packages/<mon-plugin>`, renomme `name`/`meta.id`,
ajuste `config` et `data.fetch`. Lance son exemple : `pnpm --filter @pasquelin/map3d-plugin-template-example dev`.

L'exemple copié nomme encore le gabarit, à renommer ensemble : `example/package.json` (`name`
et la dépendance), l'import de `example/src/App.tsx`, la clé `paths` de
`example/tsconfig.json` et l'alias de `example/vite.config.ts` — et, pour la forme, le
`<title>` de `example/index.html`. Un renommage partiel peut passer sans aucune erreur : alias
renommé, import et dépendance laissés sur `plugin-template`, l'exemple charge le gabarit à la
place du plugin.
