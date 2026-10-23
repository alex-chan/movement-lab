import draco from 'draco3dgltf'

export async function compressSurface(geometry) {
  const module=await draco.createEncoderModule({}),builder=new module.MeshBuilder(),mesh=new module.Mesh(),encoder=new module.Encoder()
  builder.AddFacesToMesh(mesh,geometry.index.count/3,new Uint32Array(geometry.index.array))
  const semantics={position:['POSITION',module.POSITION],normal:['NORMAL',module.NORMAL],color:['COLOR_0',module.COLOR],skinIndex:['JOINTS_0',module.GENERIC],skinWeight:['WEIGHTS_0',module.GENERIC]},attributes={}
  for(const[name,[semantic,type]]of Object.entries(semantics)){
    const a=geometry.attributes[name]
    attributes[semantic]=name==='skinIndex'?builder.AddInt32AttributeToMesh(mesh,type,a.count,a.itemSize,new Int32Array(a.array)):builder.AddFloatAttributeToMesh(mesh,type,a.count,a.itemSize,a.array)
  }
  encoder.SetSpeedOptions(5,5)
  encoder.SetAttributeQuantization(module.POSITION,16)
  encoder.SetAttributeQuantization(module.NORMAL,12)
  encoder.SetAttributeQuantization(module.COLOR,10)
  const output=new module.DracoInt8Array(),length=encoder.EncodeMeshToDracoBuffer(mesh,output)
  if(length<=0)throw new Error('Surface compression failed')
  const buffer=Buffer.alloc(Math.ceil(length/4)*4)
  for(let i=0;i<length;i++)buffer[i]=output.GetValue(i)
  for(const value of [output,encoder,mesh,builder])module.destroy(value)
  return {buffer,length,attributes}
}
