import { writeSurface } from './lib/write-surface.mjs'
import * as T from 'three'
import { readModel } from './lib/read-model.mjs'
import { buildFittedSurface } from './lib/fitted-surface.mjs'
import { createRig } from '../src/exerciseRig.js'
const [muscles,skin,skeleton]=await Promise.all(['muscles','skin','skeleton'].map(name=>readModel(`public/models/${name}.glb`)))
const root=new T.Group();for(const mesh of [...muscles,...skeleton])root.add(mesh)
const anatomy={root,layers:{muscles:{meshes:muscles},skeleton:{meshes:skeleton}}}
// Use a featureless anatomical pelvis volume rather than a garment hem.
const pelvis=new T.Mesh(new T.SphereGeometry(1,32,24))
pelvis.geometry.scale(.145,.115,.115);pelvis.geometry.translate(0,.86,-.015)
pelvis.userData.zname='Neutral pelvic surface';skin.push(pelvis)
const rig=createRig(anatomy)
const {geometry,stats}=buildFittedSurface(skin,anatomy.layers.muscles.meshes,rig.joints)
await writeSurface(geometry,stats,Object.keys(rig.joints),'work/surface/fitted.glb')
