import { useMemo } from 'react'
import { Map } from 'map3d'
import { demo } from '@map3d/plugin-demo'

/** Exemple autonome : la carte + le plugin de démo (markers + enrichissement au pick). */
export function App() {
  const plugins = useMemo(() => [demo()], [])
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
