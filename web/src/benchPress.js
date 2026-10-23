import { localizedExercise, guideFor, browserLocale } from './localization.js'
import * as THREE from 'three'
import './benchPress.css'
import { markBenchMuscles } from './benchMuscles.js'
import { addBenchInstructions } from './benchInstructions.js'
import { loadFittedSurface } from './fittedSurface.js'

export { createRig } from './exerciseRig.js'
import { createRig } from './exerciseRig.js'

const V = (x, y, z) => new THREE.Vector3(x, y, z)
const smooth = (a, b, v) => THREE.MathUtils.smoothstep(v, a, b)

function equipment(scene) {
  const group = new THREE.Group(); scene.add(group)
  const steel = new THREE.MeshStandardMaterial({ color: '#9caebc', metalness: .9, roughness: .23 })
  const frame = new THREE.MeshStandardMaterial({ color: '#25303b', metalness: .75, roughness: .35 })
  const pad = new THREE.MeshStandardMaterial({ color: '#152a33', roughness: .82 })
  const rubber = new THREE.MeshStandardMaterial({ color: '#19242d', roughness: .65, metalness: .2 })
  const accent = new THREE.MeshStandardMaterial({ color: '#37e5c8', metalness: .45, roughness: .3 })
  function box(w, h, d, x, y, z, mat) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
    m.position.set(x, y, z); group.add(m); return m
  }
  box(.32, .075, 1.28, 0, .435, -.08, pad)
  box(.13, .055, 1.17, 0, .35, -.08, frame)
  for (const z of [-.50, .40]) {
    box(.075, .32, .075, 0, .18, z, frame)
    box(.60, .045, .16, 0, .025, z, frame)
    for (const s of [-1, 1]) box(.055, .015, .16, s * .27, .054, z, accent)
  }
  // Uprights sit behind the head and outside the athlete's shoulder path.
  for (const s of [-1, 1]) {
    box(.065, 1.22, .065, s * .70, .61, -.54, frame)
    box(.22, .045, .65, s * .70, .027, -.40, frame)
    box(.10, .045, .18, s * .70, 1.04, -.49, accent)
  }
  box(1.4, .055, .055, 0, .12, -.54, frame)
  const bar = new THREE.Group(); group.add(bar)
  function cylinder(radius, length, x, mat) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 48), mat)
    m.rotation.z = Math.PI / 2; m.position.x = x; bar.add(m)
  }
  cylinder(.014, 1.92, 0, steel)
  for (const s of [-1, 1]) {
    cylinder(.024, .37, s * .77, steel)
    cylinder(.175, .052, s * .66, rubber)
    cylinder(.145, .04, s * .715, rubber)
    cylinder(.046, .026, s * .76, accent)
    cylinder(.04, .018, s * .59, steel)
    // Two grip markers make the wrist/bar relationship readable.
    cylinder(.0148, .10, s * .31, accent)
    for (const x of [.645, .675]) cylinder(.176, .003, s * x, frame)
  }
  return bar
}

export async function startBenchPress(anatomy) {
  document.body.classList.add('bench-mode')
  anatomy.live = false; anatomy.scanner = false; anatomy.scanOverride = -10
  anatomy.controls.autoRotate = false
  anatomy.setQuality('high')
  anatomy.stage.visible = false
  anatomy.scene.fog = null
  anatomy.scene.background = new THREE.Color('#090f18')
  anatomy.scene.environmentIntensity = .5
  anatomy.bloom.enabled = false
  anatomy.scene.children.filter(o => o.isDirectionalLight).forEach(o => { o.intensity *= .4 })
  anatomy.renderer.shadowMap.enabled = true
  anatomy.renderer.shadowMap.type = THREE.PCFSoftShadowMap
  anatomy.renderer.toneMappingExposure = .95
  for (const key of Object.keys(anatomy.layers)) anatomy.setVisible(key, key === 'muscles')
  const rig = createRig(anatomy), bar = equipment(anatomy.scene)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#111c28', roughness: .9 }))
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.012; anatomy.scene.add(floor)
  const grid = new THREE.GridHelper(8, 40, '#293c4c', '#172633'); grid.position.y = -.01; anatomy.scene.add(grid)
  const light = new THREE.DirectionalLight('#fff2de', 2.2); light.position.set(1, 4, 2); anatomy.scene.add(light)
  light.castShadow = true; light.shadow.mapSize.set(2048, 2048)
  Object.assign(light.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: .1, far: 10 })
  light.shadow.bias = -.0002; light.shadow.normalBias = .012
  anatomy.scene.traverse(o => { if (o.isMesh) { o.castShadow = o !== floor; o.receiveShadow = true } })
  anatomy.homeTarget = V(0, .57, .10)
  const views = { perspective: V(2.8, 2.05, 2.8), side: V(3.6, 1.1, .12), head: V(.06, 1.6, -3.7) }
  anatomy.homePos = views.perspective.clone()
  anatomy.camera.clearViewOffset()
  const view = name => {
    anatomy._camAnim = null
    const distanceFactor = Math.max(1, .95 / anatomy.camera.aspect)
    anatomy.camera.position.copy(anatomy.homeTarget).add(views[name].clone().sub(anatomy.homeTarget).multiplyScalar(distanceFactor)); anatomy.controls.target.copy(anatomy.homeTarget)
    anatomy.controls.update()
  }
  anatomy.controls.minDistance = 1.5; anatomy.controls.maxDistance = 7
  view('perspective')
  const panel = document.createElement('section')
  panel.className = 'bench-ui'
  panel.innerHTML = `
    <header class="bench-heading"><a href="./" class="bench-back">← 全部动作</a><span class="bench-kicker">MOVEMENT LAB / 01</span><h1>仰卧杠铃胸推</h1><p>BARBELL BENCH PRESS</p></header>
    <aside class="bench-readout"><span class="bench-status">循环演示中</span><strong id="press-phase">下放</strong><div class="press-meter"><i></i></div><label class="press-scrub-label">动作进度<input id="press-scrub" type="range" aria-label="动作进度" min="0" max="5" step="0.01" value="0"></label><p id="press-phase-cue" class="press-phase-cue"></p><small>点击「动作说明」查看完整要领</small></aside>
    <nav class="bench-toolbar" aria-label="卧推动画控制">
      <button id="press-play">暂停</button><button id="press-reset">重新开始</button>
      <label>速度 <select id="press-speed" aria-label="动作速度"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option></select></label>
      <span class="bench-divider"></span><button data-press-view="perspective" class="active">斜侧视角</button><button data-press-view="side">侧面</button><button data-press-view="head">头侧</button>
      <span class="bench-divider"></span><button id="press-surface">解剖视图</button><button id="press-layer">查看骨骼</button>
    </nav><p class="bench-hint">拖动旋转 · 滚轮缩放 <span>／</span> 动作示意 · 未模拟真实负重和软组织力学</p>`
  const locale=browserLocale()
  if(locale!=='zh')panel.querySelector('h1').textContent=localizedExercise({id:'bench',muscles:[],equipment:[]},locale).title
  const muscleMarks = markBenchMuscles(anatomy, panel)
  // Keep the fitted surface opt-in while the bench sample is evaluated.
  const requestedSurface = new URLSearchParams(location.search).get('surface')
  let surface = null
  if (['fitted', 'experimental'].includes(requestedSurface)) {
    try { surface = await loadFittedSurface(anatomy, rig) }
    catch (error) { console.warn('Fitted surface unavailable; showing muscle anatomy.', error) }
  }
  if (surface) anatomy.setVisible('muscles', false)
  document.body.append(panel)
  const instructions = addBenchInstructions(panel)
  const preview = new URLSearchParams(location.search).has('preview')
  if (preview) panel.style.display = 'none'
  let playing = !preview, speed = 1, elapsed = preview ? 3.7 : 0, boneView = false
  const phaseEl = panel.querySelector('#press-phase'), fill = panel.querySelector('.press-meter i'), play = panel.querySelector('#press-play')
  play.onclick = () => { playing = !playing; play.textContent = playing ? '暂停' : '播放'; panel.querySelector('.bench-status').textContent = playing ? '循环演示中' : '已暂停' }
  const scrub = panel.querySelector('#press-scrub')
  scrub.oninput = () => { elapsed = +scrub.value; playing = false; play.textContent = '播放'; panel.querySelector('.bench-status').textContent = '已暂停'; poseFrame() }
  panel.querySelector('#press-speed').onchange = e => { speed = +e.target.value }
  panel.querySelector('#press-reset').onclick = () => { elapsed = 0; poseFrame() }
  panel.querySelectorAll('[data-press-view]').forEach(b => { b.onclick = () => { view(b.dataset.pressView); panel.querySelectorAll('[data-press-view]').forEach(x => x.classList.toggle('active', x === b)) } })
  panel.querySelector('#press-layer').onclick = e => {
    boneView = !boneView
    anatomy.setVisible('muscles', !boneView && !surfaceMode); anatomy.setVisible('skeleton', boneView)
    surface?.setVisible(!boneView && surfaceMode)
    e.target.textContent = boneView ? (surface ? '返回外观' : '查看肌肉') : '查看骨骼'
    muscleMarks.setVisible(!boneView)
  }
  let surfaceMode = !!surface
  const surfaceButton = panel.querySelector('#press-surface')
  surfaceButton.hidden = !surface
  surfaceButton.onclick = () => {
    surfaceMode = !surfaceMode; boneView = false
    anatomy.setVisible('skeleton', false); anatomy.setVisible('muscles', !surfaceMode)
    surface.setVisible(surfaceMode); muscleMarks.setVisible(true)
    surfaceButton.textContent = surfaceMode ? '解剖视图' : '白模视图'
    panel.querySelector('#press-layer').textContent = '查看骨骼'
    document.body.dataset.exerciseSurface = surfaceMode ? 'fitted' : 'muscles'
  }
  document.body.dataset.exerciseSurface = surfaceMode ? 'fitted' : 'muscles'
  function poseFrame() {
    const time = elapsed % 5
    let extension, phase
    if (time < 2.4) { extension = 1 - smooth(0, 2.4, time); phase = '下放' }
    else if (time < 2.9) { extension = 0; phase = '底部停顿' }
    else if (time < 4.5) { extension = smooth(2.9, 4.5, time); phase = '推起' }
    else { extension = 1; phase = '顶部停顿' }
    const state = rig.pose(extension)
    bar.position.set(0, state.barHeight, state.barZ)
    scrub.value = time
    instructions.update(phase)
    phaseEl.textContent = locale==='zh'?phase:guideFor('bench',locale).phases[['下放','底部停顿','推起','顶部停顿'].indexOf(phase)]; fill.style.width = `${extension * 100}%`
    panel.dataset.extension = extension.toFixed(3)
  }
  poseFrame()
  // Run before Anatomy.update renders, using wall time so cadence is frame-rate independent.
  let last = performance.now()
  anatomy.updateExercise = () => {
    const now = performance.now(), dt = Math.min((now - last) / 1000, .1); last = now
    if (playing && !document.hidden) elapsed += dt * speed
    poseFrame()
  }
  anatomy.updateExerciseLabels = () => muscleMarks.update()
  document.body.dataset.exerciseReady = 'bench'
}
