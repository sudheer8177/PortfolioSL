import { useRef, useMemo, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  useScroll, ScrollControls, Stars, Text3D, Center, Html, Line, useProgress,
} from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import { personal, projects, experience, skills } from '../data/portfolio'

/* ══════════════════════════════════════════════════════════════════
   CAMERA PATH  — gentle S-curve through the city, 5 stations
══════════════════════════════════════════════════════════════════ */
const PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0,   0.4, 22),
  new THREE.Vector3(0.6, 0.2, 16),
  new THREE.Vector3(0,   0,   10),  // Station 1 — Intro
  new THREE.Vector3(-0.8, -0.1, 4),
  new THREE.Vector3(0,   0,   -2),  // Station 2 — About
  new THREE.Vector3(0.6, 0.1, -8),
  new THREE.Vector3(0,   0,  -14),  // Station 3 — Projects
  new THREE.Vector3(-0.6, -0.1,-20),
  new THREE.Vector3(0,   0,  -26),  // Station 4 — Experience
  new THREE.Vector3(0.4, 0.1, -32),
  new THREE.Vector3(0,   0,  -38),  // Station 5 — Contact
], false, 'catmullrom', 0.5)

const _pos   = new THREE.Vector3()
const _look  = new THREE.Vector3()
const _dummy = new THREE.PerspectiveCamera()

function CameraRig() {
  const scroll  = useScroll()
  const { camera } = useThree()

  useFrame(() => {
    const t = scroll.offset
    PATH.getPoint(t, _pos)
    camera.position.lerp(_pos, 0.055)

    PATH.getPoint(Math.min(t + 0.018, 1), _look)
    _dummy.position.copy(camera.position)
    _dummy.lookAt(_look)
    camera.quaternion.slerp(_dummy.quaternion, 0.055)
  })
  return null
}

/* ══════════════════════════════════════════════════════════════════
   ENVIRONMENT — Neural City
══════════════════════════════════════════════════════════════════ */

// Ground plane
function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.8, -8]}>
        <planeGeometry args={[60, 80]} />
        <meshStandardMaterial color="#0a0704" roughness={1} />
      </mesh>
      {/* Grid overlay */}
      <gridHelper args={[60, 40, '#2a1a0e', '#1a0d06']} position={[0, -2.79, -8]} />
    </group>
  )
}

// Procedural city buildings
const BUILDING_DATA = [
  // Left corridor
  { p: [-5,  0,  18], s: [1.6, 5,  1.6] },
  { p: [-8,  0,  14], s: [2.2, 9,  2.2] },
  { p: [-5.5,0,   9], s: [1.2,13,  1.2] },
  { p: [-9,  0,   5], s: [2.5, 7,  2.5] },
  { p: [-6,  0,   1], s: [1.5,16,  1.5] },
  { p: [-8.5,0,  -4], s: [2,  11,  2  ] },
  { p: [-5,  0,  -8], s: [1.2,18,  1.2] },
  { p: [-9,  0, -13], s: [2.8, 8,  2.8] },
  { p: [-6,  0, -18], s: [1.5,12,  1.5] },
  { p: [-8,  0, -23], s: [2,  10,  2  ] },
  { p: [-5,  0, -28], s: [1.2,15,  1.2] },
  { p: [-9,  0, -33], s: [2.5, 9,  2.5] },
  // Right corridor
  { p: [ 5,  0,  18], s: [1.6, 7,  1.6] },
  { p: [ 8,  0,  13], s: [2.2,11,  2.2] },
  { p: [ 5.5,0,   8], s: [1.2,15,  1.2] },
  { p: [ 9,  0,   4], s: [2.5, 9,  2.5] },
  { p: [ 6,  0,  -1], s: [1.5,14,  1.5] },
  { p: [ 8.5,0,  -5], s: [2,  13,  2  ] },
  { p: [ 5,  0,  -9], s: [1.2,20,  1.2] },
  { p: [ 9,  0, -14], s: [2.8,10,  2.8] },
  { p: [ 6,  0, -19], s: [1.5,17,  1.5] },
  { p: [ 8,  0, -24], s: [2,  12,  2  ] },
  { p: [ 5,  0, -29], s: [1.2,14,  1.2] },
  { p: [ 9,  0, -34], s: [2.5,11,  2.5] },
]

// Connection lines between buildings (neural edges)
const CONNECTIONS = [
  [[-5,2,18],[-8,4,14]], [[-8,4,14],[-5.5,6,9]], [[-5.5,6,9],[-9,3,5]],
  [[-9,3,5], [-6,8,-4]], [[-6,8,-4],[-5,9,-8]],  [[-5,9,-8],[-9,4,-13]],
  [[5,3,18], [8,5,13]],  [[8,5,13], [5.5,7,8]],  [[5.5,7,8],[9,4,4]],
  [[9,4,4],  [6,7,-1]],  [[6,7,-1], [5,10,-9]],  [[5,10,-9],[9,5,-14]],
  // Cross connections
  [[-5,5,9],  [5.5,7,8]],
  [[-6,8,-4], [6,7,-1]],
  [[-5,9,-8], [5,10,-9]],
]

function NeuralCity() {
  const buildingMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#130c07',
    emissive: '#9b6e4a',
    emissiveIntensity: 0.025,
    roughness: 0.9,
    metalness: 0.1,
  }), [])

  const windowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c8956c',
    emissive: '#c8956c',
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.5,
  }), [])

  return (
    <group>
      {BUILDING_DATA.map((b, i) => {
        const [bx, by, bz] = b.p as [number,number,number]
        const [sx, sy, sz] = b.s as [number,number,number]
        const top = by + sy / 2 - 2.8
        return (
          <group key={i}>
            {/* Main building */}
            <mesh position={[bx, top / 2 - 2.8 + sy / 2, bz]} material={buildingMat}>
              <boxGeometry args={[sx, sy, sz]} />
            </mesh>
            {/* Top glow cap */}
            <mesh position={[bx, top, bz]} material={windowMat}>
              <boxGeometry args={[sx * 0.9, 0.06, sz * 0.9]} />
            </mesh>
            {/* Window strips (every ~2 units height) */}
            {Array.from({ length: Math.floor(sy / 2.5) }, (_, wi) => (
              <mesh key={wi}
                position={[bx, -2.8 + wi * 2.5, bz]}
                material={windowMat}>
                <boxGeometry args={[sx + 0.05, 0.04, sz + 0.05]} />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* Neural connection lines */}
      {CONNECTIONS.map((conn, i) => (
        <Line
          key={i}
          points={conn as [number,number,number][]}
          color="#9b6e4a"
          lineWidth={0.5}
          transparent
          opacity={0.25}
        />
      ))}

      {/* Street lights along path */}
      {[-6,-2,2,-4,-8,-12,-16,-20,-24,-28,-32].map((z, i) => (
        <group key={i}>
          <pointLight position={[-3.5, 1.5, z]} color="#c8956c" intensity={1.2} distance={6} />
          <pointLight position={[ 3.5, 1.5, z]} color="#c8956c" intensity={1.2} distance={6} />
          {/* Light pole meshes */}
          <mesh position={[-3.5, -1, z]}>
            <cylinderGeometry args={[0.05, 0.05, 3.6, 6]} />
            <meshStandardMaterial color="#1a0e08" />
          </mesh>
          <mesh position={[ 3.5, -1, z]}>
            <cylinderGeometry args={[0.05, 0.05, 3.6, 6]} />
            <meshStandardMaterial color="#1a0e08" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Data stream particles flowing down the corridors
function DataStreams() {
  const ref  = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data  = useMemo(() => Array.from({ length: 600 }, (_, i) => ({
    side:  i % 2 === 0 ? -4.5 : 4.5,
    y:     -2 + Math.random() * 6,
    z:     (Math.random() - 0.5) * 70 - 8,
    speed: 0.04 + Math.random() * 0.08,
    phase: Math.random() * Math.PI * 2,
  })), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    data.forEach((p, i) => {
      const z = ((p.z + t * p.speed * 5) % 70) - 43
      dummy.position.set(
        p.side + Math.sin(t * 0.5 + p.phase) * 0.3,
        p.y,
        z
      )
      dummy.scale.setScalar(0.06)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 600]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial color="#c8956c" emissive="#c8956c"
        emissiveIntensity={1.5} transparent opacity={0.6} />
    </instancedMesh>
  )
}

/* ══════════════════════════════════════════════════════════════════
   STATION 1 — INTRO
══════════════════════════════════════════════════════════════════ */
function Intro() {
  const ref = useRef<THREE.Group>(null!)
  const scroll = useScroll()

  useFrame(() => {
    const p = scroll.offset
    const op = p < 0.14 ? 1 : Math.max(0, 1 - (p - 0.14) / 0.06)
    if (ref.current) ref.current.visible = op > 0.01
  })

  return (
    <group ref={ref} position={[0, 1.2, 10]}>
      <pointLight position={[0, 3, 3]} color="#c8956c" intensity={5} distance={18} />

      <Float speed={0.4} rotationIntensity={0.02} floatIntensity={0.12}>
        <group>
          <Center position={[0, 0.9, 0]}>
            <Text3D font="/fonts/helvetiker_bold.typeface.json"
              size={0.72} height={0.12} curveSegments={8}
              bevelEnabled bevelThickness={0.01} bevelSize={0.007} bevelSegments={3}>
              SUDHEER
              <meshStandardMaterial color="#e8ddd0" emissive="#c8956c"
                emissiveIntensity={0.18} metalness={0.7} roughness={0.25} />
            </Text3D>
          </Center>
          <Center position={[0, -0.12, 0]}>
            <Text3D font="/fonts/helvetiker_bold.typeface.json"
              size={0.72} height={0.12} curveSegments={8}
              bevelEnabled bevelThickness={0.01} bevelSize={0.007} bevelSegments={3}>
              KUMAR
              <meshStandardMaterial color="#c8956c" emissive="#c8956c"
                emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
            </Text3D>
          </Center>
          <Center position={[0, -1.05, 0]}>
            <Text3D font="/fonts/helvetiker_bold.typeface.json"
              size={0.16} height={0.02} curveSegments={5}>
              FULLSTACK DEVELOPER  &amp;  ML ENGINEER
              <meshStandardMaterial color="#9b6e4a" emissive="#9b6e4a" emissiveIntensity={0.7} />
            </Text3D>
          </Center>
        </group>
      </Float>

      <Html position={[0, -1.8, 0]} center distanceFactor={12}>
        <div style={{ textAlign: 'center', fontFamily: 'Space Mono',
          fontSize: '9px', letterSpacing: '5px', color: 'rgba(200,149,108,0.4)',
          pointerEvents: 'none' }}>
          SCROLL TO EXPLORE ↓
        </div>
      </Html>
    </group>
  )
}

/* ══════════════════════════════════════════════════════════════════
   STATION 2 — ABOUT
══════════════════════════════════════════════════════════════════ */
function About() {
  const ref    = useRef<THREE.Group>(null!)
  const panel  = useRef<HTMLDivElement>(null)
  const scroll = useScroll()

  useFrame(() => {
    const p = scroll.offset
    let op = 0
    if (p >= 0.18 && p <= 0.36) {
      if (p < 0.24) op = (p - 0.18) / 0.06
      else if (p > 0.30) op = 1 - (p - 0.30) / 0.06
      else op = 1
    }
    op = Math.max(0, Math.min(1, op))
    if (ref.current) ref.current.visible = op > 0.01
    if (panel.current) {
      panel.current.style.opacity = String(op)
      panel.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none'
    }
  })

  return (
    <group ref={ref} position={[0, 0, -2]}>
      <Html position={[0, 1, 1.5]} center distanceFactor={9} zIndexRange={[1, 10]}>
        <div ref={panel} style={{ opacity: 0, pointerEvents: 'none', transition: 'none' }}>
          <div style={{
            width: '440px', padding: '38px',
            background: 'rgba(10, 7, 4, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(155,110,74,0.25)',
            borderLeft: '2px solid rgba(200,149,108,0.5)',
            fontFamily: 'Cormorant Garamond, Georgia, serif',
          }}>
            <p style={{ fontFamily: 'Space Mono', fontSize: '8px', letterSpacing: '4px',
              color: '#9b6e4a', marginBottom: '20px' }}>ABOUT ME</p>
            <h2 style={{ fontSize: '30px', fontWeight: 300, fontStyle: 'italic',
              color: '#e8ddd0', lineHeight: 1.2, marginBottom: '18px' }}>
              Bridging code<br />& intelligence.
            </h2>
            <p style={{ fontSize: '14px', fontWeight: 300, color: 'rgba(232,221,208,0.6)',
              lineHeight: 1.85, marginBottom: '26px' }}>
              {personal.about}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {skills.slice(0, 10).map(s => (
                <span key={s} style={{
                  fontFamily: 'Space Mono', fontSize: '7px', padding: '3px 9px',
                  border: '1px solid rgba(155,110,74,0.3)',
                  color: 'rgba(200,149,108,0.7)', letterSpacing: '1px',
                }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ══════════════════════════════════════════════════════════════════
   STATION 3 — PROJECTS
══════════════════════════════════════════════════════════════════ */
function Projects() {
  const ref    = useRef<THREE.Group>(null!)
  const label  = useRef<HTMLDivElement>(null)
  const cardRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]
  const scroll = useScroll()

  useFrame(() => {
    const p = scroll.offset
    let op = 0
    if (p >= 0.36 && p <= 0.58) {
      if (p < 0.42) op = (p - 0.36) / 0.06
      else if (p > 0.52) op = 1 - (p - 0.52) / 0.06
      else op = 1
    }
    op = Math.max(0, Math.min(1, op))
    if (ref.current) ref.current.visible = op > 0.01
    ;[label, ...cardRefs].forEach(r => {
      if (r.current) {
        r.current.style.opacity = String(op)
        r.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none'
      }
    })
  })

  const POS: [number,number,number][] = [[-3.8, 0.8, -14], [0, -0.2, -15.5], [3.8, 0.8, -14]]
  const ROT: [number,number,number][] = [[0, 0.22, 0], [0, 0, 0], [0, -0.22, 0]]

  return (
    <group ref={ref}>
      <Html position={[0, 3.2, -13]} center distanceFactor={10} zIndexRange={[1, 10]}>
        <div ref={label} style={{ opacity: 0, pointerEvents: 'none', textAlign: 'center', transition: 'none' }}>
          <div style={{ width: '1px', height: '30px', background: 'rgba(200,149,108,0.3)', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'Space Mono', fontSize: '8px', letterSpacing: '5px', color: '#9b6e4a', marginBottom: '6px' }}>SELECTED WORK</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '30px',
            fontWeight: 300, fontStyle: 'italic', color: '#e8ddd0' }}>Things I've built.</h2>
        </div>
      </Html>

      {projects.map((proj, i) => (
        <group key={proj.id} position={POS[i]} rotation={ROT[i]}>
          <mesh>
            <boxGeometry args={[3.5, 2.4, 0.06]} />
            <meshStandardMaterial color="#100908" emissive="#9b6e4a"
              emissiveIntensity={0.04} transparent opacity={0.94} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(3.5, 2.4, 0.06)]} />
            <lineBasicMaterial color="#9b6e4a" transparent opacity={0.35} />
          </lineSegments>
          <Html position={[0, 0, 0.05]} center distanceFactor={6} zIndexRange={[1, 10]}>
            <div ref={cardRefs[i]} style={{ opacity: 0, pointerEvents: 'none', transition: 'none' }}>
              <a href={proj.link} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', width: '200px', padding: '16px',
                  textDecoration: 'none', cursor: 'pointer',
                  fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'Space Mono', fontSize: '8px',
                    color: '#9b6e4a', letterSpacing: '2px' }}>{proj.year}</span>
                  <span style={{ color: 'rgba(200,149,108,0.4)', fontSize: '11px' }}>↗</span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 400, color: '#e8ddd0',
                  marginBottom: '8px', lineHeight: 1.25 }}>{proj.title}</h3>
                <p style={{ fontSize: '10px', color: 'rgba(232,221,208,0.45)',
                  lineHeight: 1.6, marginBottom: '10px', fontWeight: 300 }}>{proj.description.slice(0, 90)}…</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                  {proj.tags.slice(0,3).map(t => (
                    <span key={t} style={{ fontFamily: 'Space Mono', fontSize: '7px',
                      padding: '2px 6px', border: '1px solid rgba(155,110,74,0.3)',
                      color: 'rgba(200,149,108,0.6)' }}>{t}</span>
                  ))}
                </div>
              </a>
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}

/* ══════════════════════════════════════════════════════════════════
   STATION 4 — EXPERIENCE
══════════════════════════════════════════════════════════════════ */
function Experience() {
  const ref    = useRef<THREE.Group>(null!)
  const label  = useRef<HTMLDivElement>(null)
  const c0     = useRef<HTMLDivElement>(null)
  const c1     = useRef<HTMLDivElement>(null)
  const scroll = useScroll()

  useFrame(() => {
    const p = scroll.offset
    let op = 0
    if (p >= 0.58 && p <= 0.78) {
      if (p < 0.64) op = (p - 0.58) / 0.06
      else if (p > 0.72) op = 1 - (p - 0.72) / 0.06
      else op = 1
    }
    op = Math.max(0, Math.min(1, op))
    if (ref.current) ref.current.visible = op > 0.01
    ;[label, c0, c1].forEach(r => {
      if (r.current) { r.current.style.opacity = String(op); r.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none' }
    })
  })

  const LINE: [number,number,number][] = [[-1.2, 3.2, -26], [-1.2, -2.5, -26]]

  return (
    <group ref={ref}>
      <Line points={LINE} color="#9b6e4a" lineWidth={1} transparent opacity={0.35} />

      <Html position={[0.5, 3.8, -25]} distanceFactor={9} zIndexRange={[1, 10]}>
        <div ref={label} style={{ opacity: 0, pointerEvents: 'none', transition: 'none' }}>
          <p style={{ fontFamily: 'Space Mono', fontSize: '8px', letterSpacing: '4px',
            color: '#9b6e4a', marginBottom: '6px' }}>EXPERIENCE</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px',
            fontWeight: 300, fontStyle: 'italic', color: '#e8ddd0' }}>Where I've worked.</h2>
        </div>
      </Html>

      {[
        { y: 1.6, ref: c0, exp: experience[0] },
        { y: -1.4, ref: c1, exp: experience[1] },
      ].map(({ y, ref: cr, exp }) => (
        <group key={exp.company}>
          <mesh position={[-1.2, y, -26]}>
            <sphereGeometry args={[0.1, 10, 10]} />
            <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={1.2} />
          </mesh>
          <Html position={[-0.6, y, -26]} distanceFactor={9} zIndexRange={[1, 10]}>
            <div ref={cr} style={{ opacity: 0, pointerEvents: 'none', transition: 'none' }}>
              <div style={{
                width: '280px', padding: '14px 18px',
                background: 'rgba(10,7,4,0.92)', backdropFilter: 'blur(16px)',
                borderLeft: '1px solid rgba(200,149,108,0.35)',
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                marginLeft: '10px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 400, color: '#e8ddd0' }}>{exp.company}</span>
                  <span style={{ fontFamily: 'Space Mono', fontSize: '8px',
                    color: 'rgba(200,149,108,0.4)' }}>{exp.period}</span>
                </div>
                <p style={{ fontFamily: 'Space Mono', fontSize: '8px', color: '#9b6e4a',
                  letterSpacing: '1px', marginBottom: '8px' }}>{exp.role}</p>
                <p style={{ fontSize: '11px', fontWeight: 300,
                  color: 'rgba(232,221,208,0.5)', lineHeight: 1.65 }}>{exp.description}</p>
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}

/* ══════════════════════════════════════════════════════════════════
   STATION 5 — CONTACT
══════════════════════════════════════════════════════════════════ */
function Contact() {
  const ref    = useRef<THREE.Group>(null!)
  const panel  = useRef<HTMLDivElement>(null)
  const r1     = useRef<THREE.Mesh>(null!)
  const r2     = useRef<THREE.Mesh>(null!)
  const scroll = useScroll()

  useFrame((state) => {
    const p = scroll.offset
    const op = p >= 0.80 ? Math.min(1, (p - 0.80) / 0.08) : 0
    if (ref.current) ref.current.visible = op > 0.01
    if (panel.current) { panel.current.style.opacity = String(op); panel.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none' }
    const t = state.clock.elapsedTime
    if (r1.current) r1.current.rotation.z = t * 0.22
    if (r2.current) r2.current.rotation.z = -t * 0.15
  })

  return (
    <group ref={ref} position={[0, 0.5, -38]}>
      <pointLight position={[0, 0, 4]} color="#c8956c" intensity={6} distance={20} />
      <mesh ref={r1}>
        <torusGeometry args={[4, 0.04, 8, 100]} />
        <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={1.5} />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[2.8, 0.025, 8, 100]} />
        <meshStandardMaterial color="#9b6e4a" emissive="#9b6e4a" emissiveIntensity={1.2} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0, -0.4]}>
        <circleGeometry args={[3.2, 64]} />
        <meshStandardMaterial color="#c8956c" emissive="#c8956c"
          emissiveIntensity={0.02} transparent opacity={0.04} />
      </mesh>

      <Html position={[0, 0, 0.9]} center distanceFactor={10} zIndexRange={[1, 10]}>
        <div ref={panel} style={{ opacity: 0, pointerEvents: 'none', transition: 'none', textAlign: 'center',
          fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          <div style={{ width: '320px' }}>
            <div style={{ width: '1px', height: '28px', background: 'rgba(200,149,108,0.3)', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'Space Mono', fontSize: '8px', letterSpacing: '4px',
              color: '#9b6e4a', marginBottom: '14px' }}>GET IN TOUCH</p>
            <h2 style={{ fontSize: '34px', fontWeight: 300, fontStyle: 'italic',
              color: '#e8ddd0', lineHeight: 1.15, marginBottom: '8px' }}>
              Let's build<br />something great.
            </h2>
            <p style={{ fontSize: '13px', fontWeight: 300,
              color: 'rgba(232,221,208,0.45)', marginBottom: '28px' }}>
              Open to fullstack & ML opportunities.
            </p>
            <a href={`mailto:${personal.email}`}
              style={{ display: 'inline-block', padding: '11px 26px',
                border: '1px solid rgba(200,149,108,0.5)', color: '#c8956c',
                fontFamily: 'Space Mono', fontSize: '9px', letterSpacing: '3px',
                textDecoration: 'none', background: 'rgba(200,149,108,0.05)',
                marginBottom: '18px', cursor: 'pointer' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(200,149,108,0.12)' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(200,149,108,0.05)' }}
            >SEND A MESSAGE</a>
            <div style={{ display: 'flex', gap: '18px', justifyContent: 'center' }}>
              {[
                { label: 'GITHUB', href: personal.github },
                { label: 'RESUME', href: personal.resume },
                { label: 'EMAIL',  href: `mailto:${personal.email}` },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: 'Space Mono', fontSize: '8px', letterSpacing: '2px',
                    color: 'rgba(200,149,108,0.4)', textDecoration: 'none' }}>
                  {label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ══════════════════════════════════════════════════════════════════
   POST-PROCESSING
══════════════════════════════════════════════════════════════════ */
const CA_OFFSET = new THREE.Vector2(0.0006, 0.0005)
function FX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.22} luminanceSmoothing={0.9} intensity={0.55} mipmapBlur />
      <ChromaticAberration offset={CA_OFFSET} />
      <Vignette offset={0.4} darkness={1.05} />
    </EffectComposer>
  )
}

/* ══════════════════════════════════════════════════════════════════
   SCENE ROOT — export
══════════════════════════════════════════════════════════════════ */
export function Scene() {
  return (
    <ScrollControls pages={8} damping={0.4} distance={1}>
      <CameraRig />

      <ambientLight intensity={0.04} />
      <fog attach="fog" args={['#0c0906', 10, 55]} />

      <Ground />
      <NeuralCity />
      <DataStreams />

      <Stars radius={80} depth={50} count={600} factor={2} fade speed={0.15} saturation={0} />

      <Intro />
      <About />
      <Projects />
      <Experience />
      <Contact />

      <FX />
    </ScrollControls>
  )
}
