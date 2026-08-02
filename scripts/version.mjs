// Bump de version UNIFIÉ des plugins publiables (miroir du `npm version` mono-package de
// map3D, adapté au monorepo). Écrit la même version dans la racine et dans chaque paquet
// publié, pour que le garde-fou `tag == version` du release.yml passe.
//
//   node scripts/version.mjs 0.2.0
//
// N'ajoute pas le tag git : comme map3D, on committe puis `git tag vX.Y.Z` à la main.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Paquets PUBLIÉS uniquement (plan-3d = placeholder, plugin-template = gabarit : privés).
const targets = ['.', 'packages/geopf', 'packages/windy']

const version = process.argv[2]
if (!version || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error('Usage : node scripts/version.mjs X.Y.Z')
  process.exit(1)
}

for (const dir of targets) {
  const file = resolve(root, dir, 'package.json')
  const pkg = JSON.parse(readFileSync(file, 'utf8'))
  pkg.version = version
  writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n')
  console.log(`${pkg.name} → ${version}`)
}

console.log('\nEnsuite : git add -A && git commit -m "chore(release): X.Y.Z" && git tag vX.Y.Z')
