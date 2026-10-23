import * as T from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { MeshBVH } from 'three-mesh-bvh'

const V=(...v)=>new T.Vector3(...v), smooth=(a,b,value)=>T.MathUtils.smoothstep(value,a,b)
const neutral=new T.Color('#e8ecef'), primary=new T.Color('#961c38'), assist=new T.Color('#df8d87')
const armNames=/brachii|brachialis|coracobrachialis|deltoid|anconeus|carpi|digitorum|pollicis|indicis|digiti minimi|palmar|pronator|supinator|brachioradialis|lumbrical|interosse/i
function region(name, center) {
  if(center.y>1.48) return 'head'
  const side=center.x<0?'-1':'1'
  if(/arm|bicipital|cubital|elbow|wrist|foveola|palm|hand|deltoid|nail plate(?! \(foot\))/i.test(name)&&!/foot/i.test(name))return 'arm'+side
  if(/thigh|femoral|gluteal|hip region|knee|popliteal|leg\.|malleol|ankle|foot|sole|heel|metatarsal|hallucial/i.test(name))return 'leg'+side
  return 'torso'
}
function weightPairs(part,p) {
  const s=p.x<0?-1:1,y=p.y,x=Math.abs(p.x)
  if(part==='head'||y>1.49)return [['head',1]]
  if(part.startsWith('arm')){
    if(y>1.31){const w=smooth(.115,.20,x);return [['torso',1-w],['arm'+s,w]]}
    if(y>.92){const w=1-smooth(1.065,1.135,y);return [['arm'+s,1-w],['forearm'+s,w]]}
    if(y>.79){const w=1-smooth(.825,.89,y);return [['forearm'+s,1-w],['hand'+s,w]]}
    // Keep the thumb attached to the palm rather than folding it with the fingers.
    if(x>.315&&y>.745)return [['hand'+s,1]]
    if(y>.73){const w=1-smooth(.748,.785,y);return [['hand'+s,1-w],['fingers'+s,w]]}
    const w=1-smooth(.70,.735,y);return [['fingers'+s,1-w],['tips'+s,w]]
  }
  if(part.startsWith('leg')||y<.96){
    if(y>.72){const w=1-smooth(.79,.93,y);return [['torso',1-w],['thigh'+s,w]]}
    if(y>.15){const w=1-smooth(.40,.47,y);return [['thigh'+s,1-w],['shin'+s,w]]}
    const w=1-smooth(.065,.13,y);return [['shin'+s,1-w],['foot'+s,w]]
  }
  if(y>1.43){const w=smooth(1.43,1.51,y);return [['torso',1-w],['head',w]]}
  // Torso vertices below the armpit must never follow the elbow/forearm.
  // Only a compact shoulder attachment blends towards the upper arm.
  const w=smooth(.125,.205,x)*smooth(1.29,1.40,y)*.65
  return [['torso',1-w],['arm'+s,w]]
}
function donorTree(meshes){
  const parts=meshes.map(mesh=>{
    const g=new T.BufferGeometry();g.setAttribute('position',mesh.geometry.attributes.position.clone());g.setIndex(mesh.geometry.index.clone())
    const role=/pectoralis major/i.test(mesh.userData.zname)?primary:/triceps brachii|clavicular part of deltoid/i.test(mesh.userData.zname)?assist:neutral
    const colors=new Float32Array(g.attributes.position.count*3);for(let i=0;i<colors.length;i+=3)role.toArray(colors,i)
    g.setAttribute('color',new T.BufferAttribute(colors,3));return g
  })
  const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose())
  return {geometry,tree:new MeshBVH(geometry)}
}

export function buildFittedSurface(skinParts,muscles,joints) {
  const donorSets={torso:[],arm1:[], 'arm-1':[],leg1:[],'leg-1':[]}
  for(const mesh of muscles){
    mesh.geometry.computeBoundingBox();const c=mesh.geometry.boundingBox.getCenter(V())
    if(c.y>1.48)continue
    const part=c.y<.94?'leg'+(c.x<0?-1:1):armNames.test(mesh.userData.zname)?'arm'+(c.x<0?-1:1):'torso'
    donorSets[part].push(mesh)
  }
  const donors=Object.fromEntries(Object.entries(donorSets).map(([k,v])=>[k,donorTree(v)]))
  const vertices=[],faces=[],grid=new Map(),tolerance=.00025
  function addVertex(p,part){
    const cell=p.toArray().map(v=>Math.floor(v/tolerance)),key=cell.join(',')
    let index
    outer:for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
      for(const i of grid.get(`${cell[0]+x},${cell[1]+y},${cell[2]+z}`)||[]){if(vertices[i].p.distanceToSquared(p)<tolerance*tolerance){index=i;break outer}}
    }
    if(index===undefined){index=vertices.length;vertices.push({p:p.clone(),parts:new Map()});if(!grid.has(key))grid.set(key,[]);grid.get(key).push(index)}
    const parts=vertices[index].parts;parts.set(part,(parts.get(part)||0)+1);return index
  }
  for(const mesh of skinParts){
    const name=mesh.userData.zname
    if(/hairs|eyelashes|eyebrow|cornea|iris|sclera|nail plate|modesty/i.test(name))continue
    const g=mesh.geometry;g.computeBoundingBox();const c=g.boundingBox.getCenter(V()),part=/modesty/i.test(name)?'cover':region(name,c)
    const map=[];for(let i=0;i<g.attributes.position.count;i++)map.push(addVertex(V().fromBufferAttribute(g.attributes.position,i),part))
    for(let i=0;i<g.index.count;i+=3){const f=[0,1,2].map(j=>map[g.index.getX(i+j)]);if(new Set(f).size===3)faces.push(f)}
  }
  // Add edge loops before fitting, so the shoulder and chest can follow contours.
  let triangles=faces
  for(let pass=0;pass<2;pass++){
    const split=new Map()
    // Uniform triangle subdivision if one edge is long avoids T-junctions:
    // mark all edges of affected triangles, then propagate across neighbours.
    const marked=new Set()
    for(const f of triangles)for(let i=0;i<3;i++){const a=f[i],b=f[(i+1)%3];if(vertices[a].p.distanceTo(vertices[b].p)>.014)marked.add(a<b?`${a},${b}`:`${b},${a}`)}
    const midpoint=(a,b)=>{const key=a<b?`${a},${b}`:`${b},${a}`;if(!marked.has(key))return null
      if(split.has(key))return split.get(key)
      const parts=new Map();for(const i of[a,b])for(const[k,w]of vertices[i].parts)parts.set(k,(parts.get(k)||0)+w)
      const idx=vertices.length;vertices.push({p:vertices[a].p.clone().add(vertices[b].p).multiplyScalar(.5),parts});split.set(key,idx);return idx}
    const next=[]
    for(const [a,b,c]of triangles){const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a),n=[ab,bc,ca].filter(v=>v!==null).length
      if(n===0)next.push([a,b,c])
      else if(n===3)next.push([a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca])
      else if(n===1){if(ab!==null)next.push([a,ab,c],[ab,b,c]);else if(bc!==null)next.push([b,bc,a],[bc,c,a]);else next.push([c,ca,b],[ca,a,b])}
      else if(ab===null)next.push([c,ca,bc],[ca,a,b],[ca,b,bc])
      else if(bc===null)next.push([a,ab,ca],[ab,b,c],[ab,c,ca])
      else next.push([b,bc,ab],[bc,c,a],[bc,a,ab])
    }
    triangles=next
  }
  const geometry=new T.BufferGeometry(),positions=new Float32Array(vertices.length*3)
  vertices.forEach((v,i)=>v.p.toArray(positions,i*3));geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setIndex(triangles.flat());geometry.computeVertexNormals()
  const normals=geometry.attributes.normal,adjacency=vertices.map(()=>new Set())
  for(const f of triangles)for(let i=0;i<3;i++){adjacency[f[i]].add(f[(i+1)%3]);adjacency[f[i]].add(f[(i+2)%3])}
  const displacements=[],colors=[],allWeights=[],bary=V(),a=V(),b=V(),c=V(),normal=V(),hit={point:V()},cloth=neutral
  let fitted=0,maxFit=0
  vertices.forEach((v,i)=>{
    const total=[...v.parts.values()].reduce((s,w)=>s+w,0),weights=new Map(),delta=V(),color=new T.Color(0,0,0)
    normal.fromBufferAttribute(normals,i)
    for(const[part,count]of v.parts){const factor=count/total
      for(const[key,w]of weightPairs(part,v.p))weights.set(key,(weights.get(key)||0)+w*factor)
      const donor=donors[part],tint=neutral.clone()
      // Preserve the face, fingers, feet and modesty cover; fit the muscle envelope.
      if(donor&&v.p.y>.17&&!(part.startsWith('arm')&&v.p.y<.88)){
        donor.tree.closestPointToPoint(v.p,hit)
        if(hit.distance<.055){
          const offset=hit.point.clone().addScaledVector(normal,.0025).sub(v.p)
          if(offset.length()>.025)offset.setLength(.025)
          delta.addScaledVector(offset,factor*.85)
          const ids=[0,1,2].map(n=>donor.geometry.index.getX(hit.faceIndex*3+n))
          a.fromBufferAttribute(donor.geometry.attributes.position,ids[0]);b.fromBufferAttribute(donor.geometry.attributes.position,ids[1]);c.fromBufferAttribute(donor.geometry.attributes.position,ids[2]);T.Triangle.getBarycoord(hit.point,a,b,c,bary)
          tint.setRGB(0,0,0);ids.forEach((id,n)=>tint.add(new T.Color().fromBufferAttribute(donor.geometry.attributes.color,id).multiplyScalar(bary.getComponent(n))))
        }
      }
      color.add((part==='cover'?cloth:tint).clone().multiplyScalar(factor))
    }
    if(delta.length()>.0005)fitted++;maxFit=Math.max(maxFit,delta.length())
    displacements.push(delta);colors.push(color);allWeights.push(weights)
  })
  // Smooth the displacement, not the body, to preserve muscle volume and welds.
  for(let pass=0;pass<3;pass++){
    const next=displacements.map((d,i)=>{const avg=V();for(const j of adjacency[i])avg.add(displacements[j]);if(adjacency[i].size)avg.divideScalar(adjacency[i].size);return d.clone().lerp(avg,.3)})
    next.forEach((v,i)=>displacements[i]=v)
  }
  // Diffuse weights only around shoulder/hip seams to avoid abrupt region borders.
  for(let pass=0;pass<8;pass++){
    const next=allWeights.map((weights,i)=>{
      const p=vertices[i].p;if(!(p.y>1.26&&p.y<1.44||p.y>.77&&p.y<.95))return weights
      const sums=new Map([...weights].map(([k,w])=>[k,w*.65]));const factor=.35/Math.max(1,adjacency[i].size)
      for(const j of adjacency[i])for(const[k,w]of allWeights[j])sums.set(k,(sums.get(k)||0)+w*factor)
      return sums
    });next.forEach((v,i)=>allWeights[i]=v)
  }
  const indices=new Uint16Array(vertices.length*4),weights=new Float32Array(vertices.length*4),tints=new Float32Array(vertices.length*3)
  vertices.forEach((v,i)=>{
    v.p.clone().add(displacements[i]).toArray(positions,i*3);colors[i].toArray(tints,i*3)
    const pairs=[...allWeights[i]].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=pairs.reduce((s,p)=>s+p[1],0)
    pairs.forEach(([key,w],j)=>{indices[i*4+j]=joints[key].index;weights[i*4+j]=w/sum})
  })
  geometry.setAttribute('skinIndex',new T.BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new T.BufferAttribute(weights,4));geometry.setAttribute('color',new T.BufferAttribute(tints,3));geometry.computeVertexNormals()
  for(const {geometry}of Object.values(donors))geometry.dispose()
  return {geometry,stats:{vertices:vertices.length,triangles:triangles.length,fittedVertices:fitted,maxFitMeters:maxFit}}
}
