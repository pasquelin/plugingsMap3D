import type { PluginField } from '@pasquelin/map3d'

// map3d n'EXPORTE pas son helper interne `PluginConfigOf` (c'est un `declare type`
// privé utilisé par `definePlugin`). On réplique la même dérivation localement — le
// schéma `geopfConfig` reste la SEULE source des valeurs par défaut.
type ConfigOf<S extends readonly PluginField[]> = {
  [F in S[number] as F['key']]: F extends { type: 'boolean' } ? boolean : F extends { type: 'number' } ? number : string
}

export const geopfConfig = [
  { key: 'searchRadius', type: 'number', default: 25, min: 5, max: 100, refetch: true, label: 'Rayon (m)' },
  { key: 'count', type: 'number', default: 20, min: 1, max: 100, refetch: true, label: 'Nombre de features' },
  { key: 'matchContaining', type: 'boolean', default: true, refetch: true, label: 'Polygone contenant le point' },
  { key: 'showEmpty', type: 'boolean', default: false, label: 'Afficher les attributs vides' },
  {
    key: 'apiUrl',
    type: 'string',
    default: 'https://data.geopf.fr/wfs/ows',
    refetch: true,
    label: 'Endpoint WFS',
    placeholder: 'https://data.geopf.fr/wfs/ows',
  },
] as const

export type GeopfConfig = ConfigOf<typeof geopfConfig>
