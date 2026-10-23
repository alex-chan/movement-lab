import * as T from 'three'
import { readSurface } from './lib/read-surface.mjs'
import { writeSurface } from './lib/write-surface.mjs'

const {geometry,stats}=await readSurface(process.argv[2]||'public/models/fitness-surface.glb')
if(stats.polishVersion===1){console.log('Surface already polished. Rebuild the source before applying again.');process.exit(0)}
const position=geometry.attributes.position,count=position.count,index=geometry.index
const neighbors=Array.from({length:count},()=>new Set())
for(let i=0;i<index.count;i+=3){const f=[0,1,2].map(j=>index.getX(i+j));for(let j=0;j<3;j++){neighbors[f[j]].add(f[(j+1)%3]);neighbors[f[j]].add(f[(j+2)%3])}}
const offsets=new Uint32Array(count+1)
for(let i=0;i<count;i++)offsets[i+1]=offsets[i]+neighbors[i].size
const adjacent=new Uint32Array(offsets[count]);for(let i=0;i<count;i++)adjacent.set([...neighbors[i]],offsets[i])
const original=new Float32Array(position.array),smoothAmount=new Float32Array(count)
for(let i=0;i<count;i++){
  const x=Math.abs(position.getX(i)),y=position.getY(i)
  // Preserve the face, fingers and toes. Smooth the muscle envelope and joints.
  smoothAmount[i]=T.MathUtils.smoothstep(y,.14,.22)*(1-T.MathUtils.smoothstep(y,1.43,1.49))
  if(x>.205&&y<.88)smoothAmount[i]=0
}
let points=new Float32Array(original),scratch=new Float32Array(points.length)
const diffuse=(source,target,width,amount,mask)=>{
  for(let i=0;i<count;i++){
    const n=offsets[i+1]-offsets[i],strength=amount*(mask?mask[i]:1)
    for(let k=0;k<width;k++){
      let sum=0;for(let j=offsets[i];j<offsets[i+1];j++)sum+=source[adjacent[j]*width+k]
      target[i*width+k]=source[i*width+k]+strength*(sum/n-source[i*width+k])
    }
  }
}
// Non-shrinking Taubin filtering removes ripples while keeping body volume.
for(let pass=0;pass<36;pass++){
  diffuse(points,scratch,3,.5,smoothAmount);diffuse(scratch,points,3,-.53,smoothAmount)
}
let maxDisplacement=0
for(let i=0;i<count;i++){
  const base=i*3,delta=new T.Vector3(points[base]-original[base],points[base+1]-original[base+1],points[base+2]-original[base+2])
  if(delta.length()>.006)delta.setLength(.006)
  maxDisplacement=Math.max(maxDisplacement,delta.length())
  position.setXYZ(i,original[base]+delta.x,original[base+1]+delta.y,original[base+2]+delta.z)
}
// Clean role masks first, then feather them on the connected surface. This
// removes nearest-triangle speckles without introducing glossy red textures.
const sourcePalette=['#e8ecef','#961c38','#df8d87'].map(value=>new T.Color(value)),palette=['#e8ecef','#b94f5a','#e4aaa1'].map(value=>new T.Color(value)),color=geometry.attributes.color
let masks=new Float32Array(count*3),next=new Float32Array(masks.length)
for(let i=0;i<count;i++){
  let best=Infinity,role=0
  for(let r=0;r<3;r++){const c=sourcePalette[r],d=(color.getX(i)-c.r)**2+(color.getY(i)-c.g)**2+(color.getZ(i)-c.b)**2;if(d<best){best=d;role=r}}
  masks[i*3+role]=1
}
for(let pass=0;pass<32;pass++){diffuse(masks,next,3,.5);const swap=masks;masks=next;next=swap}
for(let i=0;i<count;i++){
  const amounts=[0,1,2].map(r=>T.MathUtils.smoothstep(masks[i*3+r],.03,.97))
  // The sternum separates the two pectorals; keep that anatomical midline clear.
  const midline=T.MathUtils.smoothstep(Math.abs(position.getX(i)),.005,.014),removed=amounts[1]*(1-midline)
  amounts[1]-=removed;amounts[0]+=removed
  const total=amounts.reduce((sum,v)=>sum+v,0),c=new T.Color(0,0,0)
  for(let r=0;r<3;r++)c.add(palette[r].clone().multiplyScalar(amounts[r]/total))
  color.setXYZ(i,c.r,c.g,c.b)
}
geometry.computeVertexNormals()
// Average lighting normals over the same continuous edge loops, so residual
// sub-millimetre remesh ripples do not read as crumpled or damp skin.
let normals=new Float32Array(geometry.attributes.normal.array),normalScratch=new Float32Array(normals.length)
for(let pass=0;pass<12;pass++){
  diffuse(normals,normalScratch,3,.5,smoothAmount)
  for(let i=0;i<count;i++){
    const j=i*3,length=Math.hypot(normalScratch[j],normalScratch[j+1],normalScratch[j+2])||1
    for(let k=0;k<3;k++)normalScratch[j+k]/=length
  }
  const swap=normals;normals=normalScratch;normalScratch=swap
}
geometry.attributes.normal.array.set(normals)
await writeSurface(geometry,{...stats,polishVersion:1,smoothingPasses:36,colorFeatherPasses:32,normalSmoothingPasses:12,maxPolishDisplacement:maxDisplacement},stats.jointOrder)
console.log('Surface polished:',{maxDisplacementMeters:maxDisplacement,positionPasses:36,colorFeatherPasses:32})
