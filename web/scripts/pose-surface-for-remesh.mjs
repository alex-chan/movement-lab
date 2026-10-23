import { readFile } from 'node:fs/promises'
import * as T from 'three'
import { readModel } from './lib/read-model.mjs'
import { createRig } from '../src/exerciseRig.js'
import { writeSurface } from './lib/write-surface.mjs'
const b=await readFile('work/surface/fitted.glb'),n=b.readUInt32LE(12),json=JSON.parse(b.subarray(20,20+n)),bin=b.subarray(28+n),primitive=json.meshes[0].primitives[0]
const attribute=id=>{const a=json.accessors[id],v=json.bufferViews[a.bufferView],ArrayType={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}[a.componentType];return new T.BufferAttribute(new ArrayType(new Uint8Array(bin.subarray(v.byteOffset,v.byteOffset+v.byteLength)).buffer),{VEC3:3,VEC4:4,SCALAR:1}[a.type])}
const g=new T.BufferGeometry();g.setIndex(attribute(primitive.indices));for(const[k,v]of Object.entries({POSITION:'position',NORMAL:'normal',COLOR_0:'color',JOINTS_0:'skinIndex',WEIGHTS_0:'skinWeight'}))g.setAttribute(v,attribute(primitive.attributes[k]))
const [muscles,skeleton]=await Promise.all(['muscles','skeleton'].map(n=>readModel(`public/models/${n}.glb`))),root=new T.Group();for(const mesh of [...muscles,...skeleton])root.add(mesh)
const rig=createRig({root,layers:{muscles:{meshes:muscles},skeleton:{meshes:skeleton}}});root.rotation.set(0,0,0);root.position.set(0,0,0)
for(const s of [-1,1]){
  const shoulder=rig.joints['arm'+s].rest,q=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),s*.75)
  for(const segment of ['arm','forearm','hand','fingers','tips']){const j=rig.joints[segment+s];j.bone.position.copy(j.rest).sub(shoulder).applyQuaternion(q).add(shoulder);j.bone.quaternion.copy(q)}
}
root.updateMatrixWorld(true)
const matrices=rig.skeleton.bones.map((bone,i)=>new T.Matrix4().multiplyMatrices(bone.matrixWorld,rig.skeleton.boneInverses[i]))
const p=new T.Vector3(),posed=new T.Vector3(),v=new T.Vector3()
for(let i=0;i<g.attributes.position.count;i++){p.fromBufferAttribute(g.attributes.position,i);posed.set(0,0,0);for(let j=0;j<4;j++){const w=g.attributes.skinWeight.array[i*4+j],k=g.attributes.skinIndex.array[i*4+j];posed.addScaledVector(v.copy(p).applyMatrix4(matrices[k]),w)}g.attributes.position.setXYZ(i,...posed)}
g.computeVertexNormals()
await writeSurface(g,{...json.extras,remeshMatrices:matrices.map(m=>m.toArray())},json.extras.jointOrder,'work/surface/fitted.glb')
