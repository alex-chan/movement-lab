import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { compressSurface } from './compress-surface.mjs'

export async function writeSurface(geometry,stats,jointOrder,path='public/models/fitness-surface.glb') {
// Standard glTF geometry, with the exercise rig attached by the viewer at runtime.
const binary=[],bufferViews=[],accessors=[];let offset=0
const append=(attribute,type,componentType)=>{
  const bytes=Buffer.from(attribute.array.buffer,attribute.array.byteOffset,attribute.array.byteLength)
  const padded=Buffer.alloc(Math.ceil(bytes.length/4)*4);bytes.copy(padded);binary.push(padded)
  bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length});offset+=padded.length
  const accessor={bufferView:bufferViews.length-1,componentType,count:attribute.count,type}
  if(type==='VEC3'&&attribute===geometry.attributes.position){geometry.computeBoundingBox();accessor.min=geometry.boundingBox.min.toArray();accessor.max=geometry.boundingBox.max.toArray()}
  accessors.push(accessor);return accessors.length-1
}
const attributes={POSITION:append(geometry.attributes.position,'VEC3',5126),NORMAL:append(geometry.attributes.normal,'VEC3',5126),COLOR_0:append(geometry.attributes.color,'VEC3',5126),JOINTS_0:append(geometry.attributes.skinIndex,'VEC4',5123),WEIGHTS_0:append(geometry.attributes.skinWeight,'VEC4',5126)}
const indices=append(geometry.index,'SCALAR',geometry.index.array instanceof Uint32Array?5125:5123)
const json={asset:{version:'2.0',generator:'Movement Lab fitted-surface builder',copyright:'Adapted from the attributed anatomy atlas. See CREDITS.md.'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0,name:'Fitted muscle envelope'}],meshes:[{primitives:[{attributes,indices}]}],accessors,bufferViews,buffers:[{byteLength:offset}],extras:{...stats,jointOrder:jointOrder,surfaceVersion:1}}
if(stats.closedRemesh){
  const compressed=await compressSurface(geometry)
  binary.splice(0,binary.length,compressed.buffer);offset=compressed.buffer.length
  json.bufferViews=[{buffer:0,byteOffset:0,byteLength:compressed.length}];json.buffers=[{byteLength:offset}]
  for(const accessor of json.accessors)delete accessor.bufferView
  json.meshes[0].primitives[0].extensions={KHR_draco_mesh_compression:{bufferView:0,attributes:compressed.attributes}}
  json.extensionsUsed=json.extensionsRequired=['KHR_draco_mesh_compression']
}
const text=Buffer.from(JSON.stringify(json)),jsonBytes=Buffer.alloc(Math.ceil(text.length/4)*4,0x20);text.copy(jsonBytes)
const header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+jsonBytes.length+offset,8);header.writeUInt32LE(jsonBytes.length,12);header.writeUInt32LE(0x4e4f534a,16)
const binHeader=Buffer.alloc(8);binHeader.writeUInt32LE(offset);binHeader.writeUInt32LE(0x004e4942,4)
await mkdir(dirname(path), {recursive:true})
await writeFile(path,Buffer.concat([header,jsonBytes,binHeader,...binary]))
console.log('Fitted surface built:',{vertices:stats.vertices,triangles:stats.triangles,closedRemesh:!!stats.closedRemesh},`${offset} geometry bytes`)

}
