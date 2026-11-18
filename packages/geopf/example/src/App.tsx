import { useMemo } from 'react'
import { Map, useBuildingEnrichment } from '@pasquelin/map3d'
import { geopfBatiments } from '@pasquelin/map3d-plugin-geopf'

/**
 * Enrichissement geopf au pick — enfant de <Map> (le hook exige le contexte carte).
 * Le pick reste instantané ; les attributs BDTOPO arrivent après.
 */
function GeopfBuildingInfo() {
  const e = useBuildingEnrichment()
  if (e.loading) return <div className="geopf-enrich">Chargement…</div>
  if (e.error) return <div className="geopf-enrich">Indisponible : {e.error.message}</div>
  if (!e.data) return null
  return (
    <div className="geopf-enrich">
      {Object.entries(e.data).map(([k, v]) => (
        <div key={k}>
          <b>{k}</b> : {String(v)}
        </div>
      ))}
    </div>
  )
}

/**
 * Exemple autonome : la carte + geopf ; activer l'outil « sélectionner un bâtiment » puis cliquer.
 * Sources par défaut de map3d et démarrage en 3D : l'outil n'existe que sur le volume interne
 * (bâtiments extrudés), ni sur la carte plate ni sur des tuiles 3D photoréalistes.
 */
export function App() {
  const plugins = useMemo(() => [geopfBatiments()], [])
  return (
    <Map center={{ lat: 48.8566, lng: 2.3522 }} zoom={17} mapMode="3d" style={{ height: '100%' }} plugins={plugins}>
      <GeopfBuildingInfo />
    </Map>
  )
}
