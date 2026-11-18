// Contrôle de la plage `@pasquelin/map3d` acceptée par les plugins. Elle est recopiée à la
// main dans le `package.json` de chaque paquet et dans la documentation : ce script la lit à
// UNE source — les peerDependencies de geopf, paquet publié — et sort en erreur, fichier et
// ligne à l'appui, dès qu'une copie s'en écarte. Il tient aussi la dépendance de développement
// de la racine sur la mineure la plus récente de la plage : la CI ne vérifie la borne haute
// que par elle.
//
//   node scripts/map3d-range.mjs          # contrôle, rejoué par `pnpm validater`
//   node scripts/map3d-range.mjs --min    # affiche la borne basse (lue par la CI)
//
// Toute plage écrite dans un `.md` est tenue pour celle de map3d : la documentation n'en cite
// pas d'autre. `CHANGELOG.md` est un historique, il garde les plages de son époque.
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const self = fileURLToPath(import.meta.url)
const root = resolve(dirname(self), '..')

const LIB = '@pasquelin/map3d'
const SOURCE = 'packages/geopf/package.json'

// Les dossiers cachés sont ceux des outils (`.git`, éditeur, notes locales) : `.github` seul
// porte de la documentation.
export const skipped = (name) =>
  name === 'node_modules' || name === 'dist' || (name.startsWith('.') && name !== '.github')

// Les deux écritures d'une plage, bornes capturées. Les blancs couvrent le retour à la ligne :
// « 0.2\nthrough 0.7 » est une seule citation. Les garde-fous autour de la seconde écartent
// les versions à trois nombres (« de 0.2.0 à 0.7.0 »), qui ne sont pas des mineures.
const SEMVER = />=\s*(\d+\.\d+\.\d+)\s+<\s*(\d+\.\d+\.\d+)/g
const MINORS = /(?<![\d.])(\d+\.\d+)\s+(?:à|to|through)\s+(\d+\.\d+)(?!\.?\d)/g

/** Bornes `[basse, haute]` attendues sous chaque écriture : `>=0.2.0 <0.8.0` se dit aussi « de 0.2 à 0.7 ». */
export function parseRange(range) {
  const m = /^>=(\d+)\.(\d+)\.(\d+) <(\d+)\.(\d+)\.0$/.exec(range)
  if (!m || m[1] !== m[4] || Number(m[5]) <= Number(m[2])) {
    throw new Error(`plage « ${range} » non gérée (forme attendue : >=X.Y.Z <X.W.0, avec W > Y)`)
  }
  const [, major, minor, patch, , upper] = m
  const min = `${major}.${minor}.${patch}`
  return {
    range,
    min,
    semver: [min, `${major}.${upper}.0`],
    minors: [`${major}.${minor}`, `${major}.${Number(upper) - 1}`],
  }
}

/** Citations de plage d'un texte : leur nombre, et celles qui s'écartent de la plage attendue (ligne, texte lu). */
export function checkText(text, expected) {
  let count = 0
  const errors = []
  for (const [pattern, [low, high]] of [
    [SEMVER, expected.semver],
    [MINORS, expected.minors],
  ]) {
    for (const m of text.matchAll(pattern)) {
      count++
      if (m[1] === low && m[2] === high) continue
      errors.push({ line: text.slice(0, m.index).split('\n').length, found: m[0].replace(/\s+/g, ' ') })
    }
  }
  return { count, errors }
}

/** La devDependency tient-elle sur la mineure la plus récente de la plage (`^0.7.0` pour « de 0.2 à 0.7 ») ? */
export function tracksUpperMinor(spec, expected) {
  return /^[~^]?(\d+\.\d+)\.\d+$/.exec(spec ?? '')?.[1] === expected.minors[1]
}

const read = (file) => readFileSync(resolve(root, file), 'utf8')

/** `fichier:ligne` de la ligne d'un `package.json` qui nomme la lib ; le fichier seul si elle n'y est pas. */
function where(file, text) {
  const line = text.split('\n').findIndex((l) => l.includes(`"${LIB}"`)) + 1
  return line ? `${file}:${line}` : file
}

function* markdownFiles(dir = '') {
  for (const entry of readdirSync(resolve(root, dir), { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!skipped(entry.name)) yield* markdownFiles(path)
    } else if (entry.name.endsWith('.md') && path !== 'CHANGELOG.md') yield path
  }
}

function main() {
  const expected = parseRange(JSON.parse(read(SOURCE)).peerDependencies?.[LIB] ?? '')
  if (process.argv[2] === '--min') {
    console.log(expected.min)
    return
  }

  const errors = []

  // Tous les paquets, privés compris : le gabarit se copie, sa plage part avec lui.
  const manifests = readdirSync(resolve(root, 'packages'))
    .map((name) => join('packages', name, 'package.json'))
    .filter((file) => existsSync(resolve(root, file)))
  for (const file of manifests) {
    const text = read(file)
    const found = JSON.parse(text).peerDependencies?.[LIB]
    if (found === expected.range) continue
    errors.push(`${where(file, text)} : ${found ? `« ${found} »` : `peerDependency ${LIB} absente`}`)
  }

  const rootText = read('package.json')
  const dev = JSON.parse(rootText).devDependencies?.[LIB]
  if (!tracksUpperMinor(dev, expected)) {
    const shown = dev ? `« ${dev} »` : 'absente'
    errors.push(
      `${where('package.json', rootText)} : devDependency ${shown}, attendue sur la mineure ${expected.minors[1]}`,
    )
  }

  let citations = 0
  for (const file of markdownFiles()) {
    const { count, errors: mismatches } = checkText(read(file), expected)
    citations += count
    for (const e of mismatches) errors.push(`${file}:${e.line} : « ${e.found} »`)
  }

  if (errors.length) {
    console.error(`Plage ${LIB} attendue : « ${expected.range} », de ${expected.minors.join(' à ')} (${SOURCE}).\n`)
    for (const e of errors) console.error(`  ${e}`)
    process.exit(1)
  }
  console.log(
    `Plage ${LIB} « ${expected.range} » :`,
    `${manifests.length} package.json, ${citations} citations, devDependency « ${dev} ».`,
  )
}

// Lancé, pas importé : les tests importent les fonctions sans rejouer le contrôle.
// `realpathSync` : Node résout les liens symboliques du script lancé, pas ceux de `argv`.
// Sans `argv[1]` (`node -e`), le module ne peut qu'être importé.
if (process.argv[1] && realpathSync(process.argv[1]) === self) {
  try {
    main()
  } catch (e) {
    console.error(`map3d-range : ${e.message}`)
    process.exit(1)
  }
}
