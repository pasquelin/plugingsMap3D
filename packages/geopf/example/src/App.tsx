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

/** Exemple autonome : la carte + geopf ; activer l'outil « sélectionner un bâtiment » puis cliquer. */
export function App() {
  const plugins = useMemo(() => [geopfBatiments()], [])
  return (
    <Map
      center={{ lat: 48.8566, lng: 2.3522 }}
      zoom={17}
      style={{ height: '100%' }}
      cesiumIonToken={import.meta.env.VITE_CESIUM_ION_TOKEN}
      plugins={plugins}
    >
      <GeopfBuildingInfo />
    </Map>
  )
}
