import * as THREE from 'three'

const V = (x, y, z) => new THREE.Vector3(x, y, z)
const smooth = (a, b, v) => THREE.MathUtils.smoothstep(v, a, b)

// These landmarks are measured in the GLBs' baked, metre-scale coordinates.
// All layers share the same bind skeleton, so muscle and bone views stay aligned.
export function createRig(anatomy) {
  const bones = [], joints = {}
  const add = (key, position) => {
    const bone = new THREE.Bone()
    bone.name = key; bone.position.copy(position)
    anatomy.root.add(bone)
    joints[key] = { bone, rest: position.clone(), index: bones.length }
    bones.push(bone)
  }
  add('torso', V(0, 0, 0))
  add('head', V(0, 1.47, -.025))
  for (const s of [-1, 1]) {
    add(`arm${s}`, V(s * .17, 1.385, -.03))
    add(`forearm${s}`, V(s * .225, 1.10, -.025))
    add(`hand${s}`, V(s * .272, .856, .005))
    add(`fingers${s}`, V(s * .289, .766, .02))
    add(`tips${s}`, V(s * .295, .716, .022))
    add(`thigh${s}`, V(s * .08, .85, -.03))
    add(`shin${s}`, V(s * .085, .43, -.025))
    add(`foot${s}`, V(s * .075, .075, -.035))
  }
  // Capture bind matrices before lying the root down or posing any joint.
  anatomy.root.position.set(0, 0, 0)
  anatomy.root.updateMatrixWorld(true)
  const skeleton = new THREE.Skeleton(bones)
  const isArm = /brachii|brachialis|coracobrachialis|deltoid|anconeus|forearm|carpi|digitorum|pollicis|indicis|digiti minimi|palmar|pronator|supinator|brachioradialis|humerus|radius|ulna|carpal|metacarpal|pisiform|scaphoid|lunate|triquetr|trapezium|trapezoid|capitate|hamate/i
  const isLeg = /gluteus|tensor fasciae|iliotibial|femoris|vastus|sartorius|gracilis|adductor|semitendin|semimembran|pectineus|tibialis|fibular|gastrocnem|soleus|plantaris|popliteus|hallucis|digitorum|foot|femur|patella|tibia|fibula|tarsal|metatarsal|calcaneus|calcaneal|talus|navicular|cuneiform|cuboid|toe/i
  for (const key of ['muscles', 'skeleton']) {
    const layer = anatomy.layers[key]
    layer.meshes = layer.meshes.map(mesh => {
      const geo = mesh.geometry, pos = geo.attributes.position
      const indices = new Uint16Array(pos.count * 4), weights = new Float32Array(pos.count * 4)
      geo.computeBoundingBox()
      const center = geo.boundingBox.getCenter(V(0, 0, 0))
      const name = mesh.userData.zname + ' ' + mesh.userData.zgroup
      const arm = center.y > .60 && (isArm.test(name) || /phalanx|lumbrical|interosse/i.test(name) && center.y > .60)
      const leg = center.y < .95 && (isLeg.test(name) || /phalanx|lumbrical|interosse/i.test(name))
      const chest = /pectoralis major|latissimus|teres major|teres minor|infraspinatus|supraspinatus|subscapularis/i.test(name)
      // Rigid bones do not stretch; soft tissues blend across the joint zones.
      const rigid = key === 'skeleton'
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), s = center.x < 0 ? -1 : 1
        let pairs = [['torso', 1]]
        if (y > 1.44 && center.y > 1.43) {
          const w = smooth(1.44, 1.51, y)
          pairs = [['torso', 1 - w], ['head', w]]
        } else if (arm) {
          if (rigid) {
            const segment = /humerus/i.test(name) ? 'arm' : /radius|ulna/i.test(name) ? 'forearm' : /phalanx/i.test(name) ? (center.y < .716 ? 'tips' : 'fingers') : 'hand'
            pairs = [[segment + s, 1]]
          } else if (y > 1.32) {
            const w = smooth(.10, .205, Math.abs(x))
            pairs = [['torso', 1 - w], ['arm' + s, w]]
          } else if (y > .92) {
            const w = 1 - smooth(1.06, 1.135, y)
            pairs = [['arm' + s, 1 - w], ['forearm' + s, w]]
          } else if (y > .79) {
            const w = 1 - smooth(.825, .89, y)
            pairs = [['forearm' + s, 1 - w], ['hand' + s, w]]
          } else if (/pollicis|thumb/i.test(name)) {
            pairs = [['hand' + s, 1]]
          } else if (y > .73) {
            const w = 1 - smooth(.748, .785, y)
            pairs = [['hand' + s, 1 - w], ['fingers' + s, w]]
          } else {
            const w = 1 - smooth(.70, .735, y)
            pairs = [['fingers' + s, 1 - w], ['tips' + s, w]]
          }
        } else if (leg) {
          if (rigid) {
            pairs = [[(/femur|patella/i.test(name) ? 'thigh' : /tibia|fibula/i.test(name) ? 'shin' : 'foot') + s, 1]]
          } else if (y > .72) {
            const w = 1 - smooth(.79, .93, y)
            pairs = [['torso', 1 - w], ['thigh' + s, w]]
          } else if (y > .15) {
            const w = 1 - smooth(.40, .47, y)
            pairs = [['thigh' + s, 1 - w], ['shin' + s, w]]
          } else {
            const w = 1 - smooth(.065, .13, y)
            pairs = [['shin' + s, 1 - w], ['foot' + s, w]]
          }
        } else if (chest) {
          const w = smooth(.105, .21, Math.abs(x)) * .85
          pairs = [['torso', 1 - w], ['arm' + s, w]]
        }
        pairs.forEach(([joint, weight], j) => { indices[i * 4 + j] = joints[joint].index; weights[i * 4 + j] = weight })
      }
      geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4))
      geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4))
      const skinned = new THREE.SkinnedMesh(geo, mesh.material)
      skinned.name = mesh.name; skinned.userData = mesh.userData
      skinned.frustumCulled = false
      // Bind identity: geometry positions already use the common model coordinates.
      skinned.bind(skeleton, new THREE.Matrix4())
      mesh.parent.add(skinned); mesh.removeFromParent()
      return skinned
    })
  }
  anatomy.root.rotation.x = -Math.PI / 2
  anatomy.root.position.set(0, .57, 1.20)
  const direction = (a, b) => b.clone().sub(a).normalize()
  function aim(key, endKey, start, end) {
    const joint = joints[key]
    joint.bone.position.copy(start)
    joint.bone.quaternion.setFromUnitVectors(direction(joint.rest, joints[endKey].rest), direction(start, end))
  }
  const handRestDir = V(.02, -.09, .015).normalize()
  function pose(extension) {
    const barHeight = THREE.MathUtils.lerp(.75, 1.10, extension)
    const barZ = THREE.MathUtils.lerp(-.07, -.19, extension)
    for (const s of [-1, 1]) {
      const shoulder = joints[`arm${s}`].rest
      const wrist = V(s * .31, 1.20 - barZ, barHeight - .57 - .060)
      const delta = wrist.clone().sub(shoulder), distance = delta.length(), axis = delta.normalize()
      const upper = joints[`arm${s}`].rest.distanceTo(joints[`forearm${s}`].rest)
      const lower = joints[`forearm${s}`].rest.distanceTo(joints[`hand${s}`].rest)
      const along = (upper ** 2 - lower ** 2 + distance ** 2) / (2 * distance)
      const pole = V(s * .65, 1.02, -.06).sub(shoulder)
      pole.addScaledVector(axis, -pole.dot(axis)).normalize()
      const elbow = shoulder.clone().addScaledVector(axis, along).addScaledVector(pole, Math.sqrt(Math.max(0, upper ** 2 - along ** 2)))
      aim(`arm${s}`, `forearm${s}`, shoulder, elbow)
      aim(`forearm${s}`, `hand${s}`, elbow, wrist)
      const hand = joints[`hand${s}`].bone
      hand.position.copy(wrist)
      hand.quaternion.setFromUnitVectors(V(s * handRestDir.x, handRestDir.y, handRestDir.z), V(0, 0, 1))
      const finger = joints[`fingers${s}`], tip = joints[`tips${s}`]
      const curl = new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), -1.45)
      finger.bone.position.copy(finger.rest).sub(joints[`hand${s}`].rest).applyQuaternion(hand.quaternion).add(wrist)
      finger.bone.quaternion.copy(hand.quaternion).multiply(curl)
      tip.bone.position.copy(tip.rest).sub(finger.rest).applyQuaternion(finger.bone.quaternion).add(finger.bone.position)
      tip.bone.quaternion.copy(finger.bone.quaternion).multiply(curl)
      const hip = joints[`thigh${s}`].rest
      const knee = V(s * .18, .445, -.08)
      const ankle = V(s * .23, .45, -.432)
      aim(`thigh${s}`, `shin${s}`, hip, knee)
      aim(`shin${s}`, `foot${s}`, knee, ankle)
      joints[`foot${s}`].bone.position.copy(ankle)
      joints[`foot${s}`].bone.quaternion.setFromAxisAngle(V(1, 0, 0), 1.40)
    }
    return { barHeight, barZ }
  }
  return { pose, joints, aim, skeleton }
}
