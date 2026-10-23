import * as THREE from 'three'

// This asset is fitted and weighted offline; it does not inherit nearest-donor
// weights at runtime. The atlas remains available as the comparison view.
export async function loadFittedSurface(anatomy, rig) {
  const gltf = await anatomy.loader.loadAsync(import.meta.env.BASE_URL + 'models/fitness-surface.glb')
  const order = gltf.parser.json.extras?.jointOrder
  if (JSON.stringify(order) !== JSON.stringify(Object.keys(rig.joints))) throw new Error('Fitted surface rig version mismatch')
  let geometry
  gltf.scene.traverse(node => { if (node.isMesh) geometry = node.geometry })
  if (!geometry?.attributes.skinWeight || !geometry.attributes.skinIndex) throw new Error('Fitted surface has no skin binding')
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .68, metalness: 0, side: THREE.DoubleSide })
  const mesh = new THREE.SkinnedMesh(geometry, material)
  mesh.name = 'Fitted fitness surface';mesh.frustumCulled = false
  mesh.castShadow = true;mesh.receiveShadow = true
  mesh.bind(rig.skeleton, new THREE.Matrix4())
  anatomy.root.add(mesh)
  return { setVisible(visible) { mesh.visible = visible }, vertexCount: geometry.attributes.position.count }
}
