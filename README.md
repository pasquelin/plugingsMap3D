# plugingsMap3D

Monorepo des plugins officiels de [map3D](https://github.com/…) — `@pasquelin/map3d-plugin-*`.
**1 plugin = 1 package** (`packages/<nom>/`) + son exemple (`packages/<nom>/example/`).

## Dev
- Dépend de `@pasquelin/map3d` (npm, peerDep `^0.2.0`) — plus besoin du sibling `map3D` buildé.
- `pnpm install` · `pnpm validater` · `pnpm build` · exemple d'un plugin : `pnpm --filter @pasquelin/map3d-plugin-<nom>-example dev`.
- Publication : cf. `CLAUDE.md` (version unifiée + tag `vX.Y.Z` → release OIDC).

Registre des plugins officiels : `map3D/docs/{fr,en}/PLUGINS.md`.

---

# plugingsMap3D (EN)

Monorepo for map3D's official plugins — `@pasquelin/map3d-plugin-*`. **1 plugin = 1 package** + its own example.
Depends on `@pasquelin/map3d` (npm peerDep `^0.2.0`). `pnpm install`, `pnpm validater`, `pnpm build`.
