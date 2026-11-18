// Contrôle de la plage `@pasquelin/map3d` acceptée par les plugins. Elle est recopiée à la
// main dans le `package.json` de chaque paquet et dans la documentation : ce script la lit à
// UNE source — les peerDependencies de geopf, paquet publié — et sort en erreur, fichier et
// ligne à l'appui, dès qu'une copie s'en écarte.
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
const SKIPPED_DIRS = new Set(['.git', 'node_modules', 'dist'])

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

const read = (file) => readFileSync(resolve(root, file), 'utf8')

function* markdownFiles(dir = '') {
  for (const entry of readdirSync(resolve(root, dir), { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) yield* markdownFiles(path)
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
    const line = text.split('\n').findIndex((l) => l.includes(`"${LIB}"`)) + 1
    errors.push(`${file}${line ? `:${line}` : ''} : ${found ? `« ${found} »` : `peerDependency ${LIB} absente`}`)
  }

  let citations = 0
  for (const file of markdownFiles()) {
    const { count, errors: found } = checkText(read(file), expected)
    citations += count
    for (const e of found) errors.push(`${file}:${e.line} : « ${e.found} »`)
  }

  if (errors.length) {
    console.error(`Plage ${LIB} attendue : « ${expected.range} », de ${expected.minors.join(' à ')} (${SOURCE}).\n`)
    for (const e of errors) console.error(`  ${e}`)
    process.exit(1)
  }
  console.log(`Plage ${LIB} « ${expected.range} » : ${manifests.length} package.json, ${citations} citations.`)
}

// Lancé, pas importé : les tests importent `parseRange` et `checkText` sans rejouer le contrôle.
// `realpathSync` : Node résout les liens symboliques du script lancé, pas ceux de `argv`.
if (realpathSync(process.argv[1]) === self) {
  try {
    main()
  } catch (e) {
    console.error(`map3d-range : ${e.message}`)
    process.exit(1)
  }
}
