import assert from 'node:assert/strict'
import * as T from 'three'
import { readModel } from './lib/read-model.mjs'
import { readSurface } from './lib/read-surface.mjs'
import { createRig } from '../src/exerciseRig.js'
const {geometry,stats}=await readSurface()
assert(stats.closedRemesh,'Surface must be rebuilt as a closed mesh')
const edges=new Map(),index=geometry.index
for(let i=0;i<index.count;i+=3)for(let j=0;j<3;j++){
  const a=index.getX(i+j),b=index.getX(i+(j+1)%3),key=a<b?`${a},${b}`:`${b},${a}`
  edges.set(key,(edges.get(key)||0)+1)
}
assert([...edges.values()].every(n=>n===2),'Every edge must have exactly two incident faces, without panel cracks')
const [muscles,skeleton]=await Promise.all(['muscles','skeleton'].map(n=>readModel(`public/models/${n}.glb`)))
const root=new T.Group();for(const m of [...muscles,...skeleton])root.add(m)
const rig=createRig({root,layers:{muscles:{meshes:muscles},skeleton:{meshes:skeleton}}})
assert.deepEqual(stats.jointOrder,Object.keys(rig.joints))
const skin=new T.SkinnedMesh(geometry,new T.MeshBasicMaterial());skin.bind(rig.skeleton,new T.Matrix4());root.add(skin)
const p=geometry.attributes.position,w=geometry.attributes.skinWeight,k=geometry.attributes.skinIndex
const points=new Float32Array(p.count*3),v=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3()
let maxShoulderStretch=0,maxShoulderElongation=0,maxLongEdgeStretch=0
for(let i=0;i<p.count;i++){
  assert(Math.abs([0,1,2,3].reduce((sum,j)=>sum+w.array[i*4+j],0)-1)<1e-5)
  for(let j=0;j<4;j++){assert(w.array[i*4+j]>=0);assert(k.array[i*4+j]<rig.skeleton.bones.length)}
  if(p.getY(i)>1.0&&p.getY(i)<1.24&&Math.abs(p.getX(i))<.16){
    for(let j=0;j<4;j++)if(w.array[i*4+j]>.05)assert(!/forearm|hand|fingers|tips/.test(stats.jointOrder[k.array[i*4+j]]),'Lower torso must not follow the forearm or hand')
  }
}
for(let step=0;step<=20;step++){
  rig.pose(step/20);root.updateMatrixWorld(true)
  for(let i=0;i<p.count;i++){skin.getVertexPosition(i,v);assert(v.toArray().every(Number.isFinite));v.toArray(points,i*3)}
  for(const key of edges.keys()){
    const [i,j]=key.split(',').map(Number)
    if(p.getY(i)<1.26||p.getY(i)>1.44)continue
    const rest=a.fromBufferAttribute(p,i).distanceTo(b.fromBufferAttribute(p,j));if(rest<.0005)continue
    const posed=a.fromArray(points,i*3).distanceTo(b.fromArray(points,j*3))
    maxShoulderStretch=Math.max(maxShoulderStretch,posed/rest)
    maxShoulderElongation=Math.max(maxShoulderElongation,posed-rest)
    if(rest>.004)maxLongEdgeStretch=Math.max(maxLongEdgeStretch,posed/rest)
  }
}
console.log({vertices:p.count,triangles:index.count/3,closedEdges:edges.size,poses:21,maxShoulderStretch,maxShoulderElongation,maxLongEdgeStretch})
// Very short marching-cubes edges can have large ratios for millimetre motion.
// Bound physical elongation as well as the ratio on edges over 4 mm.
assert(maxShoulderElongation<.03,'Shoulder edges must not elongate by more than 3 cm')
assert(maxLongEdgeStretch<6,'Shoulder edge loops must not stretch into long membranes')
console.log('Fitted surface passed: closed topology, normalized binding, no forearm influence on torso and finite deformation through the press.')
