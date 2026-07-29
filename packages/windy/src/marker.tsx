import { mdiContentCopy, mdiOpenInNew } from '@mdi/js'
import Icon from '@mdi/react'
import type { MarkerData, MenuItem } from 'map3d'
import type { ReactNode } from 'react'

/** Payload porté par chaque marker webcam (assemblé par `api.ts#mapWebcams`). */
export type WindyMarkerData = { place: string; detail?: string; thumb?: string }

// `Plugin['markerLayer'].tooltip`/`.menu` sont typés `(p: MarkerData<unknown>) => …` (position
// contravariante du registre hétérogène de plugins, cf. `map3d/src/plugins/types.ts`) : le
// paramètre DOIT rester `MarkerData<unknown>` pour s'assigner à ces champs — `m.data` est donc
// recasté en interne, jamais élargi dans la signature exportée.

/** Infobulle au survol : vignette de la webcam + titre + localisation. */
export function webcamTooltip(m: MarkerData<unknown>): { title?: ReactNode; content?: ReactNode } | null {
  const data = m.data as WindyMarkerData
  return {
    title: m.title,
    content: (
      <div className="m3d-windy-tooltip">
        {data.thumb ? <img src={data.thumb} alt="" /> : null}
        {data.place ? <div>{data.place}</div> : null}
      </div>
    ),
  }
}

/** Menu contextuel : ouvrir la webcam / copier le lien — inertes sans `detail`. */
export function webcamMenu(m: MarkerData<unknown>): MenuItem[] {
  const data = m.data as WindyMarkerData
  return [
    {
      icon: <Icon path={mdiOpenInNew} size={0.7} />,
      label: 'Ouvrir la webcam',
      disabled: !data.detail,
      onSelect: () => window.open(data.detail, '_blank', 'noopener'),
    },
    {
      icon: <Icon path={mdiContentCopy} size={0.7} />,
      label: 'Copier le lien',
      disabled: !data.detail,
      onSelect: () => void navigator.clipboard?.writeText(data.detail ?? ''),
    },
  ]
}
