import { useMemo } from 'react'
import { Map } from '@pasquelin/map3d'
import type { PartialConfig } from '@pasquelin/map3d'
import { cesiumIon } from '@pasquelin/map3d/cesium-ion'
import { windyWebcams } from '@pasquelin/map3d-plugin-windy'

/** Jeton Cesium ion, facultatif : sans lui, la carte garde les sources par défaut de map3d. */
const CESIUM_ION_TOKEN: string | undefined = import.meta.env.VITE_CESIUM_ION_TOKEN

// Les tuiles 3D photoréalistes demandent la source (`tileset3d`) ET ce réglage : avec le défaut
// `'internal'`, map3d garde le volume de son serveur de tuiles et laisse la source gelée.
const PHOTOREALISTIC: PartialConfig = { providers: { tiles3d: { provider: 'external' } } }

/** Exemple autonome : la carte + Windy Webcams (clé via VITE_WINDY_API_KEY ; active-le via le hub). */
export function App() {
  const plugins = useMemo(() => [windyWebcams({ apiKey: import.meta.env.VITE_WINDY_API_KEY })], [])
  return (
    <Map
      center={{ lat: 48.8566, lng: 2.3522 }}
      zoom={13}
      style={{ height: '100%' }}
      tileset3d={cesiumIon({ token: CESIUM_ION_TOKEN })}
      config={CESIUM_ION_TOKEN ? PHOTOREALISTIC : undefined}
      plugins={plugins}
    />
  )
}
