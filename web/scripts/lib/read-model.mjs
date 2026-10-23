import { readFile } from 'node:fs/promises'
import * as THREE from 'three'
import draco from 'draco3dgltf'

let decoderPromise
const decoderModule=()=>decoderPromise ||= draco.createDecoderModule({})

// The atlas exports baked positions without node transforms or textures.
export async function readModel(path) {
  const bytes = await readFile(path), jsonLength = bytes.readUInt32LE(12)
  const json = JSON.parse(bytes.subarray(20,20+jsonLength)), bin = bytes.subarray(28+jsonLength)
  const module = await decoderModule(), result = []
  for (const node of json.nodes) {
    if (node.mesh == null) continue
    if (node.matrix || node.translation || node.rotation || node.scale) throw new Error('Expected baked atlas coordinates')
    for (const primitive of json.meshes[node.mesh].primitives) {
      const ext = primitive.extensions.KHR_draco_mesh_compression, view = json.bufferViews[ext.bufferView]
      const decoder = new module.Decoder(), buffer = new module.DecoderBuffer(), mesh = new module.Mesh()
      const encoded = bin.subarray(view.byteOffset || 0,(view.byteOffset || 0)+view.byteLength)
      buffer.Init(new Int8Array(encoded),encoded.length)
      const status = decoder.DecodeBufferToMesh(buffer,mesh)
      if (!status.ok()) throw new Error(status.error_msg())
      const geometry = new THREE.BufferGeometry()
      for (const [semantic,id] of Object.entries(ext.attributes)) {
        const name={POSITION:'position',NORMAL:'normal',COLOR_0:'color',JOINTS_0:'skinIndex',WEIGHTS_0:'skinWeight'}[semantic]
        if (!name) continue
        const attribute = decoder.GetAttributeByUniqueId(mesh,id), data = new module.DracoFloat32Array()
        decoder.GetAttributeFloatForAllPoints(mesh,attribute,data)
        const values = new Float32Array(data.size())
        for(let i=0;i<values.length;i++)values[i]=data.GetValue(i)
        geometry.setAttribute(name,new THREE.BufferAttribute(semantic==='JOINTS_0'?new Uint16Array(values):values,attribute.num_components()))
        module.destroy(data)
      }
      const indices = new Uint32Array(mesh.num_faces()*3), face = new module.DracoInt32Array()
      for(let i=0;i<mesh.num_faces();i++){decoder.GetFaceFromMesh(mesh,i,face);for(let j=0;j<3;j++)indices[i*3+j]=face.GetValue(j)}
      geometry.setIndex(new THREE.BufferAttribute(indices,1))
      const part = new THREE.Mesh(geometry);part.userData={...node.extras};part.name=node.name
      result.push(part)
      for(const object of [face,mesh,buffer,decoder])module.destroy(object)
    }
  }
  return result
}
