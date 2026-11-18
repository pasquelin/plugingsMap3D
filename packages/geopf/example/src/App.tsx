import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { Map, useBuildingEnrichment } from '@pasquelin/map3d'
import { geopfBatiments } from '@pasquelin/map3d-plugin-geopf'

/**
 * Le canvas de la carte est en position absolue : un enfant de <Map> laissé dans le flux reste
 * dessous. D'où la position (centré en haut, à 16 px des bords) et le niveau « HUD flottant » de
 * map3d (au-dessus de la carte, sous ses barres) ; fond, bordure et arrondi viennent de son thème,
 * texte et police en sont hérités.
 */
const panel: CSSProperties = {
  position: 'absolute',
  top: 16,
  left: 16,
  right: 16,
  width: 'fit-content',
  margin: '0 auto',
  zIndex: 'var(--m3d-z-floating-hud)',
  padding: '10px 14px',
  border: '1px solid var(--m3d-border)',
  borderRadius: 'var(--m3d-radius-lg)',
  background: 'var(--m3d-panel)',
  fontSize: 'var(--m3d-size-sm)',
  lineHeight: 1.5,
}

/**
 * Enrichissement geopf au pick — enfant de <Map> (le hook exige le contexte carte).
 * Le pick reste instantané ; les attributs BDTOPO arrivent après.
 */
function GeopfBuildingInfo() {
  const e = useBuildingEnrichment()
  if (e.loading) return <div style={panel}>Chargement…</div>
  if (e.error) return <div style={panel}>Indisponible : {e.error.message}</div>
  if (!e.data) return null
  const attrs = Object.entries(e.data)
  // Le plugin répond `{}` quand il n'a aucun attribut à remonter : le plus souvent, aucun bâtiment BDTOPO autour du point.
  if (attrs.length === 0) return <div style={panel}>Aucun attribut IGN pour ce bâtiment</div>
  return (
    <div style={panel}>
      {attrs.map(([k, v]) => (
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
