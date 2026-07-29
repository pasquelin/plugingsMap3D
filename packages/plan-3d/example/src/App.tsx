import { useMemo } from 'react'
import { Map } from 'map3d'
import { plan3d } from '@map3d/plugin-plan-3d'

/** Exemple autonome : la carte + le plugin Plan 3D (placeholder voie C) ; active-le via le hub. */
export function App() {
  const plugins = useMemo(() => [plan3d()], [])
  return (
    <Map
      center={{ lat: 48.8566, lng: 2.3522 }}
      zoom={17}
      style={{ height: '100%' }}
      cesiumIonToken={import.meta.env.VITE_CESIUM_ION_TOKEN}
      plugins={plugins}
    />
  )
}
