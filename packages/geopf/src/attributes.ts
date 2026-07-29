/** Champs BDTOPO retenus → étiquette stable affichée. Seule la liste connue est remontée. */
const FIELDS: Record<string, string> = {
  nature: 'Nature',
  usage_1: 'Usage',
  hauteur: 'Hauteur (m)',
  nombre_d_etages: 'Étages',
  date_creation: 'Créé le',
  materiaux_des_murs: 'Murs',
}

const isEmpty = (v: unknown): boolean => v === null || v === undefined || v === ''

/** Projette les properties BDTOPO sur des étiquettes stables ; élague les vides sauf showEmpty. */
export function mapAttributes(props: Record<string, unknown>, opts: { showEmpty: boolean }): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, label] of Object.entries(FIELDS)) {
    if (!(key in props)) continue
    const v = props[key]
    if (!opts.showEmpty && isEmpty(v)) continue
    out[label] = v
  }
  return out
}
