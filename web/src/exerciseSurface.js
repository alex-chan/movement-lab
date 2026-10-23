import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { MeshBVH } from 'three-mesh-bvh'

// Transfer the existing exercise rig onto the exported outer surface in bind
// space. The nearest muscle triangle supplies both weights and role colors.
// Coincident patch vertices share one result so their edges cannot separate.
export function createExerciseSurface(anatomy, rig) {
  const skin = anatomy.layers.skin
  if (!skin?.loaded) return null
  const parts = anatomy.layers.muscles.meshes.map(mesh => {
    const geometry = new THREE.BufferGeometry()
    for (const name of ['position', 'skinIndex', 'skinWeight']) geometry.setAttribute(name, mesh.geometry.getAttribute(name).clone())
    if (mesh.geometry.index) geometry.setIndex(mesh.geometry.index.clone())
    const values = new Float32Array(geometry.attributes.position.count * 3)
    for (let i = 0; i < values.length; i += 3) mesh.material.color.toArray(values, i)
    geometry.setAttribute('color', new THREE.BufferAttribute(values, 3))
    return geometry
  })
  const source = mergeGeometries(parts)
  const tree = new MeshBVH(source)
  const pos = source.attributes.position, colors = source.attributes.color
  const indices = source.attributes.skinIndex, weights = source.attributes.skinWeight
  const cache = new Map(), point = new THREE.Vector3(), closest = { point: new THREE.Vector3() }
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), bary = new THREE.Vector3()
  const white = new THREE.Color('#e8ecef'), scratch = new THREE.Color()
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .79, side: THREE.DoubleSide })
  let vertexCount = 0
  skin.meshes = skin.meshes.filter(mesh => {
    if (!/hairs|eyelashes|eyebrow/i.test(mesh.userData.zname)) return true
    mesh.removeFromParent()
    return false
  }).map(mesh => {
    const geometry = mesh.geometry
    const positions = geometry.attributes.position
    const skinIndices = new Uint16Array(positions.count * 4), skinWeights = new Float32Array(positions.count * 4), tint = new Float32Array(positions.count * 3)
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i)
      const key = `${Math.round(point.x * 100000)},${Math.round(point.y * 100000)},${Math.round(point.z * 100000)}`
      let result = cache.get(key)
      if (!result) {
        tree.closestPointToPoint(point, closest)
        const triangle = [0, 1, 2].map(n => source.index.getX(closest.faceIndex * 3 + n))
        a.fromBufferAttribute(pos, triangle[0]); b.fromBufferAttribute(pos, triangle[1]); c.fromBufferAttribute(pos, triangle[2])
        THREE.Triangle.getBarycoord(closest.point, a, b, c, bary)
        const sums = new Map(), color = new THREE.Color(0, 0, 0)
        triangle.forEach((vertex, n) => {
          const factor = bary.getComponent(n)
          scratch.fromBufferAttribute(colors, vertex); color.add(scratch.clone().multiplyScalar(factor))
          for (let j = 0; j < 4; j++) {
            const index = indices.array[vertex * 4 + j], weight = weights.array[vertex * 4 + j] * factor
            sums.set(index, (sums.get(index) || 0) + weight)
          }
        })
        const pairs = [...sums].sort((x, y) => y[1] - x[1]).slice(0, 4)
        const sum = pairs.reduce((total, pair) => total + pair[1], 0)
        result = { pairs: pairs.map(([index, weight]) => [index, weight / sum]), color }
        if (point.y > 1.48) result = { pairs: [[rig.joints.head.index, 1]], color: white }
        if (closest.distance > .10) result.color = white
        cache.set(key, result)
      }
      result.pairs.forEach(([index, weight], j) => { skinIndices[i * 4 + j] = index; skinWeights[i * 4 + j] = weight })
      result.color.toArray(tint, i * 3)
    }
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4))
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(tint, 3))
    const surface = new THREE.SkinnedMesh(geometry, material)
    surface.name = mesh.name; surface.userData = { ...mesh.userData, baseMat: material }
    surface.frustumCulled = false; surface.castShadow = true; surface.receiveShadow = true
    surface.bind(rig.skeleton, new THREE.Matrix4())
    mesh.parent.add(surface); mesh.removeFromParent()
    vertexCount += positions.count
    return surface
  })
  const setVisible = visible => {
    anatomy.setVisible('skin', visible)
  }
  parts.forEach(part => part.dispose()); source.dispose()
  setVisible(true)
  return { setVisible, vertexCount }
}
