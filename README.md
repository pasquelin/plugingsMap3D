# plugingsMap3D

Monorepo des plugins officiels de [map3D](https://github.com/…) — `@map3d/plugin-*`.
**1 plugin = 1 package** (`packages/<nom>/`) + son exemple (`packages/<nom>/example/`).

## Dev
- Prérequis : `map3D` en sibling, `dist/` construit (`cd ../map3D && pnpm build`).
- `pnpm install` · `pnpm -r typecheck` · `pnpm test` · exemple d'un plugin : `pnpm --filter @map3d/plugin-<nom>-example dev`.

Registre des plugins officiels : `map3D/docs/{fr,en}/PLUGINS.md`.

---

# plugingsMap3D (EN)

Monorepo for map3D's official plugins — `@map3d/plugin-*`. **1 plugin = 1 package** + its own example.
Prereq: `map3D` sibling with a built `dist/`. `pnpm install`, `pnpm -r typecheck`, `pnpm test`.
