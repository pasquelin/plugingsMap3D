import { useMemo } from 'react'
import { Map } from 'map3d'
import { cameras } from '@map3d/plugin-cameras'

/** Exemple autonome : la carte + le plugin caméras (active-le via le hub de la barre). */
export function App() {
  const plugins = useMemo(() => [cameras()], [])
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
