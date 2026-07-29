// `windyConfig` (src/index.ts) est la SEULE source du schéma (`PluginField[]`) et de ses
// défauts. Ce type est écrit à la main plutôt que dérivé de `ConfigOf<typeof windyConfig>`
// (cf. `geopf/src/config.ts`) car `apiKey` a un défaut seedé au runtime depuis l'env
// (`init.apiKey`), et `thumbnailSize` doit rester une union littérale (le schéma déclaratif
// `PluginConfigOf` élargit tout champ `select` à `string` — cf. `map3d/src/plugins/types.ts`).
export type WindyConfig = {
  apiKey: string
  category: string
  maxWebcams: number
  thumbnailSize: 'thumbnail' | 'preview' | 'daylight'
}
