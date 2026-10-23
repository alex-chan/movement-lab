import { readFile } from 'node:fs/promises'
import * as T from 'three'
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js'
import { MeshBVH } from 'three-mesh-bvh'
import { writeSurface } from './lib/write-surface.mjs'
const bytes=await readFile('work/surface/fitted.glb'),jsonLength=bytes.readUInt32LE(12)
const data=JSON.parse(bytes.subarray(20,20+jsonLength)),binary=bytes.subarray(28+jsonLength),primitive=data.meshes[0].primitives[0]
const attribute=index=>{const a=data.accessors[index],view=data.bufferViews[a.bufferView],array={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}[a.componentType],width={VEC3:3,VEC4:4,SCALAR:1}[a.type];const copy=new Uint8Array(binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength));return new T.BufferAttribute(new array(copy.buffer),width)}
const source=new T.BufferGeometry();source.setIndex(attribute(primitive.indices));for(const[key,name]of Object.entries({POSITION:'position',NORMAL:'normal',COLOR_0:'color',JOINTS_0:'skinIndex',WEIGHTS_0:'skinWeight'}))source.setAttribute(name,attribute(primitive.attributes[key]))
const ply=await readFile('work/surface/remesh.ply'),geometry=new PLYLoader().parse(ply.buffer.slice(ply.byteOffset,ply.byteOffset+ply.byteLength))
const tree=new MeshBVH(source),point=new T.Vector3(),hit={point:new T.Vector3()},a=point.clone(),b=point.clone(),c=point.clone(),bary=point.clone()
const count=geometry.attributes.position.count,colors=new Float32Array(count*3),weights=new Float32Array(count*4),indices=new Uint16Array(count*4)
for(let i=0;i<count;i++){
  point.fromBufferAttribute(geometry.attributes.position,i);tree.closestPointToPoint(point,hit)
  const ids=[0,1,2].map(n=>source.index.getX(hit.faceIndex*3+n));a.fromBufferAttribute(source.attributes.position,ids[0]);b.fromBufferAttribute(source.attributes.position,ids[1]);c.fromBufferAttribute(source.attributes.position,ids[2]);T.Triangle.getBarycoord(hit.point,a,b,c,bary)
  bary.set(Math.max(0,bary.x),Math.max(0,bary.y),Math.max(0,bary.z));if(bary.lengthSq()<1e-12)bary.set(1,0,0);else bary.divideScalar(bary.x+bary.y+bary.z)
  const sums=new Map(),color=new T.Color(0,0,0)
  ids.forEach((id,n)=>{const f=bary.getComponent(n);color.add(new T.Color().fromBufferAttribute(source.attributes.color,id).multiplyScalar(f));for(let j=0;j<4;j++){const key=source.attributes.skinIndex.array[id*4+j],w=source.attributes.skinWeight.array[id*4+j]*f;sums.set(key,(sums.get(key)||0)+w)}})
  const pairs=[...sums].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=pairs.reduce((s,p)=>s+p[1],0)
  pairs.forEach(([k,w],j)=>{indices[i*4+j]=k;weights[i*4+j]=w/sum});if(color.r<color.g*1.18)color.set('#e8ecef');color.toArray(colors,i*3)
}
// The remeshed surface has shared edge loops. Smooth the shoulder field on
// this topology, rather than across disconnected atlas panels.
const jointCount=data.extras.jointOrder.length,neighbors=Array.from({length:count},()=>new Set())
for(let i=0;i<geometry.index.count;i+=3){const f=[0,1,2].map(j=>geometry.index.getX(i+j));for(let j=0;j<3;j++){neighbors[f[j]].add(f[(j+1)%3]);neighbors[f[j]].add(f[(j+2)%3])}}
const active=[]
for(let i=0;i<count;i++){const y=geometry.attributes.position.getY(i);if(y>1.14&&y<1.46)active.push(i)}
let field=new Float32Array(count*jointCount),next=new Float32Array(count*jointCount)
for(let i=0;i<count;i++)for(let j=0;j<4;j++)field[i*jointCount+indices[i*4+j]]+=weights[i*4+j]
next.set(field)
for(let pass=0;pass<70;pass++){
  for(const i of active){const base=i*jointCount,scale=.45/neighbors[i].size;for(let k=0;k<jointCount;k++)next[base+k]=field[base+k]*.55;for(const j of neighbors[i])for(let k=0;k<jointCount;k++)next[base+k]+=field[j*jointCount+k]*scale}
  const swap=field;field=next;next=swap
}
for(const i of active){
  const pairs=Array.from({length:jointCount},(_,k)=>[k,field[i*jointCount+k]]).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=pairs.reduce((s,p)=>s+p[1],0)
  pairs.forEach(([k,w],j)=>{indices[i*4+j]=k;weights[i*4+j]=w/sum})
}
// Return the remeshed A-pose to the existing rig's bind coordinates using
// each vertex's blended inverse. Remeshing with separated arms prevents the
// voxel operation from joining the inner arms to the sides of the torso.
if (data.extras.remeshMatrices) {
  const matrices=data.extras.remeshMatrices.map(array=>new T.Matrix4().fromArray(array)),blend=new T.Matrix4(),point=new T.Vector3()
  for(let i=0;i<count;i++){
    blend.elements.fill(0)
    for(let j=0;j<4;j++){const m=matrices[indices[i*4+j]],w=weights[i*4+j];for(let k=0;k<16;k++)blend.elements[k]+=m.elements[k]*w}
    point.fromBufferAttribute(geometry.attributes.position,i).applyMatrix4(blend.invert())
    geometry.attributes.position.setXYZ(i,point.x,point.y,point.z)
  }
}
geometry.setAttribute('color',new T.BufferAttribute(colors,3));geometry.setAttribute('skinIndex',new T.BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new T.BufferAttribute(weights,4));geometry.computeVertexNormals()
const { remeshMatrices, ...stats }=data.extras
await writeSurface(geometry,{...stats,vertices:count,triangles:geometry.index.count/3,closedRemesh:true},data.extras.jointOrder)
