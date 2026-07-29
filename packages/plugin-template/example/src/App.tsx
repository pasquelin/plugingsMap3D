import { useMemo } from 'react'
import { Map } from 'map3d'
import { template } from '@map3d/plugin-template'

/** Exemple autonome : la carte + le hub + le seul plugin modèle (preuve qu'il tourne seul). */
export function App() {
  const plugins = useMemo(() => [template()], [])
  return <Map plugins={plugins} toolbar controls layers />
}
