import { useMemo } from 'react'
import { Map } from '@pasquelin/map3d'
import { windyWebcams } from '@pasquelin/map3d-plugin-windy'

/** Exemple autonome : la carte + Windy Webcams (clé via VITE_WINDY_API_KEY ; active-le via le hub). */
export function App() {
  const plugins = useMemo(() => [windyWebcams({ apiKey: import.meta.env.VITE_WINDY_API_KEY })], [])
  return (
    <Map
      center={{ lat: 48.8566, lng: 2.3522 }}
      zoom={13}
      style={{ height: '100%' }}
      cesiumIonToken={import.meta.env.VITE_CESIUM_ION_TOKEN}
      plugins={plugins}
    />
  )
}
