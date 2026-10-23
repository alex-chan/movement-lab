import assert from 'node:assert/strict'
import * as THREE from 'three'
import { createExerciseSurface } from '../src/exerciseSurface.js'

// A translated surface must inherit the donor's rig and color, including
// duplicate vertices across separate atlas patches and the rigid head region.
const root = new THREE.Group(), bones = [new THREE.Bone(), new THREE.Bone(), new THREE.Bone()]
bones.forEach(bone => root.add(bone)); root.updateMatrixWorld(true)
const skeleton = new THREE.Skeleton(bones)
const donor = new THREE.BufferGeometry()
donor.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3))
donor.setIndex([0, 1, 2])
donor.setAttribute('skinIndex', new THREE.Uint16BufferAttribute([0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0], 4))
donor.setAttribute('skinWeight', new THREE.Float32BufferAttribute([.25, .75, 0, 0, .25, .75, 0, 0, .25, .75, 0, 0], 4))
const muscle = new THREE.Mesh(donor, new THREE.MeshStandardMaterial({ color: '#961c38' }))
const skinGroup = new THREE.Group(); root.add(skinGroup)
const patch = (name, points) => {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); geometry.setIndex([0, 1, 2])
  const mesh = new THREE.Mesh(geometry); mesh.userData.zname = name; skinGroup.add(mesh); return mesh
}
const skin = { loaded: true, group: skinGroup, meshes: [
  patch('skin A', [.1, .1, .02, .2, .1, .02, .1, .2, .02]),
  patch('skin B', [.1, .1, .02, .2, .1, .02, .1, .2, .02]),
  patch('head', [0, 1.6, 0, .05, 1.6, 0, 0, 1.65, 0]),
  patch('Hairs of head', [0, 1.7, 0, .05, 1.7, 0, 0, 1.75, 0]),
] }
const anatomy = { layers: { muscles: { meshes: [muscle] }, skin }, setVisible(key, value) { this.layers[key].group.visible = value } }
const surface = createExerciseSurface(anatomy, { skeleton, joints: { head: { index: 2 } } })
assert.equal(surface.vertexCount, 9)
assert.equal(skin.meshes.length, 3)
assert.equal(skinGroup.children.length, 3, 'hair geometry must be removed, not merely hidden until the next isolation pass')
const point = new THREE.Vector3()
for (const mesh of skin.meshes) {
  assert(mesh.isSkinnedMesh)
  const weights = mesh.geometry.attributes.skinWeight.array
  for (let i = 0; i < weights.length; i += 4) assert(Math.abs(weights.slice(i, i + 4).reduce((a, b) => a + b, 0) - 1) < 1e-6)
}
assert.deepEqual([...skin.meshes[0].geometry.attributes.skinWeight.array], [...skin.meshes[1].geometry.attributes.skinWeight.array])
assert(Math.abs(skin.meshes[0].geometry.attributes.color.getX(0) - muscle.material.color.r) < 1e-6)
for (let step = 0; step <= 20; step++) {
  bones[1].position.z = step * .01; bones[2].position.x = step * .005
  root.updateMatrixWorld(true)
  skin.meshes[0].getVertexPosition(0, point)
  assert(Math.abs(point.z - (.02 + bones[1].position.z * .75)) < 1e-6)
  skin.meshes[2].getVertexPosition(0, point)
  assert(Math.abs(point.x - bones[2].position.x) < 1e-6)
  assert([point.x, point.y, point.z].every(Number.isFinite))
}
surface.setVisible(false); assert.equal(skinGroup.visible, false)
surface.setVisible(true); assert.equal(skinGroup.visible, true)
console.log('Surface checks passed: weight transfer, normalization, patch seams, colors, head binding, hair removal and visibility.')
