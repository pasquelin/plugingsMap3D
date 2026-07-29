import * as THREE from 'three'
import type { Layer, FrameContext, PluginLayerContext } from 'map3d'

type Cfg = { lat: number; lng: number; size: number; color: string }

/**
 * PLACEHDER voie C : dépose un volume repère à (lat,lng), reprojeté chaque frame (le
 * groupe globe peut bouger). Le vrai « Plan 3D » reste à spécifier. Respecte la
 * séparation lecture/écriture : positionnement en `update` (lecture), rien en `project`.
 */
export function createPlanLayer(ctx: PluginLayerContext<Cfg>): Layer {
  const { engine, config } = ctx
  const group = new THREE.Group()
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(config.size, config.size, config.size),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(config.color), transparent: true, opacity: 0.6 }),
  )
  group.add(mesh)
  engine.scene.add(group)

  // Position monde de la dernière frame : l'objet est STATIQUE (lat/lng fixes), sa position
  // ne change qu'au rebase LOD du globe. On ne demande donc une frame QUE quand elle bouge
  // vraiment — invalider à chaque frame épinglerait le compteur et tuerait le render-on-demand.
  const last = new THREE.Vector3(NaN, NaN, NaN)

  return {
    update(_ctx: FrameContext) {
      engine.projection.latLngToWorld({ lat: config.lat, lng: config.lng }, group.position, config.size / 2)
      if (!group.position.equals(last)) {
        last.copy(group.position)
        _ctx.invalidate() // la position a bougé (pose initiale ou rebase) : repeindre une fois
      }
    },
    project() {},
    dispose() {
      engine.scene.remove(group)
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    },
  }
}
