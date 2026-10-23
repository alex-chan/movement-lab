import { readFile } from 'node:fs/promises'
import * as T from 'three'
import { readModel } from './read-model.mjs'

export async function readSurface(path='public/models/fitness-surface.glb') {
  const bytes=await readFile(path),length=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+length)),binary=bytes.subarray(28+length)
  const primitive=json.meshes[0].primitives[0]
  if(primitive.extensions?.KHR_draco_mesh_compression)return {geometry:(await readModel(path))[0].geometry,stats:json.extras}
  const attribute=id=>{
    const a=json.accessors[id],view=json.bufferViews[a.bufferView],ArrayType={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}[a.componentType]
    const copy=new Uint8Array(binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength))
    return new T.BufferAttribute(new ArrayType(copy.buffer),{VEC3:3,VEC4:4,SCALAR:1}[a.type])
  }
  const geometry=new T.BufferGeometry();geometry.setIndex(attribute(primitive.indices))
  for(const[k,name]of Object.entries({POSITION:'position',NORMAL:'normal',COLOR_0:'color',JOINTS_0:'skinIndex',WEIGHTS_0:'skinWeight'}))geometry.setAttribute(name,attribute(primitive.attributes[k]))
  return {geometry,stats:json.extras}
}
