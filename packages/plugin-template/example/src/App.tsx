import { useMemo } from 'react'
import { Map } from '@pasquelin/map3d'
import { template } from '@pasquelin/map3d-plugin-template'

/** Exemple autonome : la carte + le seul plugin modèle (le hub de la barre l'active). */
export function App() {
  const plugins = useMemo(() => [template()], [])
  return (
    <Map
      center={{ lat: 48.8566, lng: 2.3522 }}
      zoom={16}
      style={{ height: '100%' }}
      cesiumIonToken={import.meta.env.VITE_CESIUM_ION_TOKEN}
      plugins={plugins}
    />
  )
}
