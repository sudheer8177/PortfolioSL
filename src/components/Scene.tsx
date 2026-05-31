import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  useScroll, ScrollControls, Stars,
  Text3D, Center, Html, Line, Float, Trail,
} from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import { personal, projects, experience, skills } from '../data/portfolio'

/* ─────────────────────────────────────────────────────────────────
   CAMERA PATH  (camera is always behind the avatar)
───────────────────────────────────────────────────────────────── */
const PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3( 0,    0,   26),
  new THREE.Vector3( 0.5,  0,   20),
  new THREE.Vector3( 0,    0,   14),   // Station 1 — Intro
  new THREE.Vector3(-0.6,  0,    8),
  new THREE.Vector3( 0,    0,    2),   // Station 2 — About
  new THREE.Vector3( 0.5,  0,   -4),
  new THREE.Vector3( 0,    0,  -10),   // Station 3 — Projects
  new THREE.Vector3(-0.5,  0,  -16),
  new THREE.Vector3( 0,    0,  -22),   // Station 4 — Experience
  new THREE.Vector3( 0.4,  0,  -28),
  new THREE.Vector3( 0,    0,  -34),   // Station 5 — Contact
], false, 'catmullrom', 0.5)

/* ─────────────────────────────────────────────────────────────────
   AVATAR  — the "character" the camera follows (like the scooter)
───────────────────────────────────────────────────────────────── */
const _avatarPos  = new THREE.Vector3()
const _avatarFwd  = new THREE.Vector3()
const _avatarDummy = new THREE.Object3D()

function Avatar() {
  const groupRef = useRef<THREE.Group>(null!)
  const ringRef  = useRef<THREE.Mesh>(null!)
  const coreRef  = useRef<THREE.Mesh>(null!)
  const scroll   = useScroll()

  useFrame((state) => {
    const t   = scroll.offset
    const t2  = Math.min(t + 0.025, 1)
    PATH.getPoint(t,  _avatarPos)
    PATH.getPoint(t2, _avatarFwd)

    // Position avatar slightly ahead of camera view
    _avatarPos.y += 0.15
    if (groupRef.current) {
      groupRef.current.position.lerp(_avatarPos, 0.12)
      _avatarDummy.position.copy(groupRef.current.position)
      _avatarDummy.lookAt(_avatarFwd)
      groupRef.current.quaternion.slerp(_avatarDummy.quaternion, 0.1)
    }

    // Spin ring and pulse core
    const et = state.clock.elapsedTime
    if (ringRef.current) {
      ringRef.current.rotation.x = et * 1.2
      ringRef.current.rotation.z = et * 0.8
    }
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.6 + Math.sin(et * 3) * 0.4
      coreRef.current.scale.setScalar(1 + Math.sin(et * 4) * 0.04)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Trail behind avatar */}
      <Trail
        width={0.6}
        length={8}
        color={new THREE.Color('#c8956c')}
        attenuation={(t) => t * t}
      >
        {/* Core orb */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial
            color="#e8ddd0"
            emissive="#c8956c"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
      </Trail>

      {/* Orbiting ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.38, 0.018, 8, 60]} />
        <meshStandardMaterial
          color="#c8956c"
          emissive="#c8956c"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>

      {/* Secondary smaller ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.01, 6, 60]} />
        <meshStandardMaterial
          color="#9b6e4a"
          emissive="#9b6e4a"
          emissiveIntensity={1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Point light on avatar — lights up city as it passes */}
      <pointLight color="#c8956c" intensity={3.5} distance={8} />
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────
   CAMERA RIG — third-person: stays behind and slightly above avatar
───────────────────────────────────────────────────────────────── */
const _camPos  = new THREE.Vector3()
const _camLook = new THREE.Vector3()
const _camDummy = new THREE.PerspectiveCamera()

function CameraRig() {
  const scroll = useScroll()
  const { camera } = useThree()

  useFrame(() => {
    const t = scroll.offset

    // Camera is behind the avatar on the path
    const tCam  = Math.max(0, t - 0.02)
    const tLook = Math.min(t + 0.015, 1)

    PATH.getPoint(tCam,  _camPos)
    PATH.getPoint(tLook, _camLook)

    // Lift camera above path (looking slightly down at avatar)
    _camPos.y += 0.55

    camera.position.lerp(_camPos, 0.06)

    _camDummy.position.copy(camera.position)
    _camDummy.lookAt(_camLook)
    camera.quaternion.slerp(_camDummy.quaternion, 0.06)
  })

  return null
}

/* ─────────────────────────────────────────────────────────────────
   GROUND + CITY BUILDINGS
───────────────────────────────────────────────────────────────── */
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, -4]}>
        <planeGeometry args={[60, 90]} />
        <meshStandardMaterial color="#0b0804" roughness={1} />
      </mesh>
      <gridHelper
        args={[60, 45, '#1e1008', '#140c05']}
        position={[0, -2.59, -4]}
      />
    </>
  )
}

const BUILDINGS = [
  // Left side
  { p: [-5,  0,  22], h: 6  }, { p: [-8,  0,  18], h: 10 },
  { p: [-5.5,0,  14], h: 14 }, { p: [-9,  0,  10], h: 8  },
  { p: [-6,  0,   6], h: 17 }, { p: [-8.5,0,   2], h: 11 },
  { p: [-5,  0,  -2], h: 19 }, { p: [-9,  0,  -6], h: 9  },
  { p: [-6,  0, -10], h: 13 }, { p: [-8,  0, -14], h: 15 },
  { p: [-5,  0, -18], h: 10 }, { p: [-9,  0, -22], h: 8  },
  { p: [-6,  0, -26], h: 16 }, { p: [-8,  0, -30], h: 12 },
  // Right side
  { p: [ 5,  0,  20], h: 8  }, { p: [ 8,  0,  16], h: 12 },
  { p: [ 5.5,0,  12], h: 16 }, { p: [ 9,  0,   8], h: 10 },
  { p: [ 6,  0,   4], h: 18 }, { p: [ 8.5,0,   0], h: 13 },
  { p: [ 5,  0,  -4], h: 20 }, { p: [ 9,  0,  -8], h: 9  },
  { p: [ 6,  0, -12], h: 14 }, { p: [ 8,  0, -16], h: 11 },
  { p: [ 5,  0, -20], h: 16 }, { p: [ 9,  0, -24], h: 8  },
  { p: [ 6,  0, -28], h: 14 }, { p: [ 8,  0, -32], h: 10 },
]

const bGeo   = new THREE.BoxGeometry(1, 1, 1)
const bMat   = new THREE.MeshStandardMaterial({ color: '#110905', roughness: 0.95 })
const winMat = new THREE.MeshStandardMaterial({
  color: '#c8956c', emissive: '#c8956c', emissiveIntensity: 0.5,
  transparent: true, opacity: 0.45,
})
const topMat = new THREE.MeshStandardMaterial({
  color: '#c8956c', emissive: '#c8956c', emissiveIntensity: 1.0,
  transparent: true, opacity: 0.6,
})

function City() {
  const w = 2, d = 2
  const base = -2.6

  return (
    <group>
      {BUILDINGS.map((b, i) => {
        const [bx, , bz] = b.p as [number, number, number]
        const cy = base + b.h / 2
        return (
          <group key={i}>
            {/* Body */}
            <mesh position={[bx, cy, bz]} scale={[w, b.h, d]} geometry={bGeo} material={bMat} />
            {/* Top glow */}
            <mesh position={[bx, base + b.h, bz]} scale={[w * 0.85, 0.06, d * 0.85]}
              geometry={bGeo} material={topMat} />
            {/* Window rings at every 2.4 units */}
            {Array.from({ length: Math.floor(b.h / 2.4) }, (_, wi) => (
              <mesh key={wi}
                position={[bx, base + wi * 2.4 + 1.2, bz]}
                scale={[w + 0.06, 0.04, d + 0.06]}
                geometry={bGeo}
                material={winMat}
              />
            ))}
          </group>
        )
      })}

      {/* Street lights */}
      {[-2, -8, -14, -20, -26, -32].map((z, i) => (
        <group key={i}>
          <pointLight position={[-3.2, 0.4, z]} color="#c8956c" intensity={1.5} distance={7} />
          <pointLight position={[ 3.2, 0.4, z]} color="#c8956c" intensity={1.5} distance={7} />
        </group>
      ))}

      {/* Neural connection wires between buildings */}
      {[
        [[-5,3,22],[-8,5,18],[-5.5,7,14]],
        [[ 5,4,20],[ 8,6,16],[ 5.5,8,12]],
        [[-6,9, 6],[-8.5,5.5,2],[-5,9.5,-2]],
        [[ 6,9, 4],[ 8.5,6.5, 0],[ 5,10,-4]],
        [[-9,4.5,-6],[-6,6.5,-10],[-8,7.5,-14]],
        [[ 9,4.5,-8],[ 6,7,-12],[ 8,5.5,-16]],
        [[-5,3,14],[5.5,8,12]],
        [[-6,9, 6],[6,9, 4]],
        [[-5,9.5,-2],[5,10,-4]],
      ].map((pts, i) => (
        <Line key={i}
          points={pts as [number,number,number][]}
          color="#7a4e2a"
          lineWidth={0.6}
          transparent opacity={0.2}
        />
      ))}
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────
   FLOATING DATA PARTICLES  (flow along corridors like traffic)
───────────────────────────────────────────────────────────────── */
function DataFlow() {
  const ref   = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const pts   = useMemo(() => Array.from({ length: 500 }, (_, i) => ({
    side:  i % 2 === 0 ? -4 : 4,
    y:     -2.4 + Math.random() * 0.5,
    z:     (Math.random() - 0.5) * 80 - 4,
    speed: 2 + Math.random() * 3,
    phase: Math.random() * Math.PI * 2,
  })), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    pts.forEach((p, i) => {
      const z = ((p.z - t * p.speed) % 80 + 80) % 80 - 44
      dummy.position.set(p.side, p.y, z)
      dummy.scale.setScalar(0.055)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 500]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial
        color="#c8956c" emissive="#c8956c"
        emissiveIntensity={1.5} transparent opacity={0.55}
      />
    </instancedMesh>
  )
}

/* ─────────────────────────────────────────────────────────────────
   VISIBILITY HELPER
───────────────────────────────────────────────────────────────── */
function useVisibility(
  groupRef: React.RefObject<THREE.Group>,
  htmlRefs: React.RefObject<HTMLDivElement>[],
  start: number, peak: number, fade: number, end: number
) {
  const scroll = useScroll()
  useFrame(() => {
    const p = scroll.offset
    let op = 0
    if (p >= start && p <= end) {
      if      (p < peak) op = (p - start) / (peak - start)
      else if (p > fade) op = 1 - (p - fade) / (end - fade)
      else               op = 1
    }
    op = Math.max(0, Math.min(1, op))
    if (groupRef.current) groupRef.current.visible = op > 0.01
    htmlRefs.forEach(r => {
      if (r.current) {
        r.current.style.opacity = String(op)
        r.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none'
      }
    })
  })
}

/* ─────────────────────────────────────────────────────────────────
   STATION 1 — INTRO
───────────────────────────────────────────────────────────────── */
function Intro() {
  const grp  = useRef<THREE.Group>(null!)
  useVisibility(grp, [], 0, 0, 0.1, 0.17)
  return (
    <group ref={grp} position={[0, 1.8, 14]}>
      <Float speed={0.5} rotationIntensity={0.015} floatIntensity={0.1}>
        <Center position={[0, 0.6, 0]}>
          <Text3D font="/fonts/helvetiker_bold.typeface.json"
            size={0.65} height={0.1} curveSegments={8}
            bevelEnabled bevelThickness={0.008} bevelSize={0.006} bevelSegments={3}>
            SUDHEER KUMAR
            <meshStandardMaterial color="#e8ddd0" emissive="#c8956c"
              emissiveIntensity={0.15} metalness={0.7} roughness={0.2} />
          </Text3D>
        </Center>
        <Center position={[0, -0.45, 0]}>
          <Text3D font="/fonts/helvetiker_bold.typeface.json"
            size={0.17} height={0.02} curveSegments={5}>
            FULLSTACK DEVELOPER  ·  ML ENGINEER
            <meshStandardMaterial color="#9b6e4a" emissive="#9b6e4a" emissiveIntensity={0.6} />
          </Text3D>
        </Center>
      </Float>
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────
   STATION 2 — ABOUT
───────────────────────────────────────────────────────────────── */
function About() {
  const grp   = useRef<THREE.Group>(null!)
  const panel = useRef<HTMLDivElement>(null)
  useVisibility(grp, [panel], 0.16, 0.24, 0.30, 0.38)

  return (
    <group ref={grp} position={[0, 0.8, 2]}>
      <Html position={[0, 0, 2]} center distanceFactor={9} zIndexRange={[1,10]}>
        <div ref={panel} style={{ opacity:0, pointerEvents:'none', transition:'none' }}>
          <div style={{
            width:'420px', padding:'36px',
            background:'rgba(9,6,3,0.93)', backdropFilter:'blur(24px)',
            borderLeft:'2px solid rgba(200,149,108,0.45)',
            fontFamily:'Cormorant Garamond, Georgia, serif',
          }}>
            <p style={{ fontFamily:'Space Mono', fontSize:'8px', letterSpacing:'5px',
              color:'#9b6e4a', marginBottom:'18px' }}>01 — ABOUT</p>
            <h2 style={{ fontSize:'30px', fontWeight:300, fontStyle:'italic',
              color:'#e8ddd0', lineHeight:1.2, marginBottom:'16px' }}>
              Bridging code<br />&amp; intelligence.
            </h2>
            <p style={{ fontSize:'14px', fontWeight:300,
              color:'rgba(232,221,208,0.58)', lineHeight:1.85, marginBottom:'24px' }}>
              {personal.about}
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
              {skills.slice(0,10).map(s => (
                <span key={s} style={{ fontFamily:'Space Mono', fontSize:'7px',
                  padding:'3px 9px', border:'1px solid rgba(155,110,74,0.3)',
                  color:'rgba(200,149,108,0.7)', letterSpacing:'1px' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────
   STATION 3 — PROJECTS
───────────────────────────────────────────────────────────────── */
function Projects() {
  const grp   = useRef<THREE.Group>(null!)
  const lbl   = useRef<HTMLDivElement>(null)
  const c0    = useRef<HTMLDivElement>(null)
  const c1    = useRef<HTMLDivElement>(null)
  const c2    = useRef<HTMLDivElement>(null)
  useVisibility(grp, [lbl, c0, c1, c2], 0.37, 0.44, 0.52, 0.60)

  const CARD_POS: [number,number,number][] = [[-3.5, 0.6,-10],[0,-0.4,-11.5],[3.5, 0.6,-10]]
  const CARD_ROT: [number,number,number][] = [[0,0.2,0],[0,0,0],[0,-0.2,0]]
  const cardRefs = [c0, c1, c2]

  return (
    <group ref={grp}>
      <Html position={[0,3.2,-9]} center distanceFactor={10} zIndexRange={[1,10]}>
        <div ref={lbl} style={{ opacity:0, pointerEvents:'none', textAlign:'center', transition:'none' }}>
          <p style={{ fontFamily:'Space Mono', fontSize:'8px', letterSpacing:'5px',
            color:'#9b6e4a', marginBottom:'8px' }}>02 — SELECTED WORK</p>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'30px',
            fontWeight:300, fontStyle:'italic', color:'#e8ddd0' }}>Things I've built.</h2>
        </div>
      </Html>

      {projects.map((proj, i) => (
        <group key={proj.id} position={CARD_POS[i]} rotation={CARD_ROT[i]}>
          <mesh>
            <boxGeometry args={[3.4, 2.5, 0.055]} />
            <meshStandardMaterial color="#0f0805" transparent opacity={0.94}
              emissive="#9b6e4a" emissiveIntensity={0.035} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(3.4, 2.5, 0.055)]} />
            <lineBasicMaterial color="#9b6e4a" transparent opacity={0.3} />
          </lineSegments>
          <Html position={[0,0,0.05]} center distanceFactor={6} zIndexRange={[1,10]}>
            <div ref={cardRefs[i]} style={{ opacity:0, pointerEvents:'none', transition:'none' }}>
              <a href={proj.link} target="_blank" rel="noopener noreferrer"
                style={{ display:'block', width:'195px', padding:'15px',
                  textDecoration:'none', cursor:'pointer',
                  fontFamily:'Cormorant Garamond, Georgia, serif' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'7px' }}>
                  <span style={{ fontFamily:'Space Mono', fontSize:'8px',
                    color:'#9b6e4a', letterSpacing:'2px' }}>{proj.year}</span>
                  <span style={{ color:'rgba(200,149,108,0.4)', fontSize:'11px' }}>↗</span>
                </div>
                <h3 style={{ fontSize:'15px', fontWeight:400, color:'#e8ddd0',
                  marginBottom:'7px', lineHeight:1.25 }}>{proj.title}</h3>
                <p style={{ fontSize:'10px', fontWeight:300,
                  color:'rgba(232,221,208,0.45)', lineHeight:1.6, marginBottom:'9px' }}>
                  {proj.description.slice(0,88)}…
                </p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'3px' }}>
                  {proj.tags.slice(0,3).map(t => (
                    <span key={t} style={{ fontFamily:'Space Mono', fontSize:'7px',
                      padding:'2px 6px', border:'1px solid rgba(155,110,74,0.3)',
                      color:'rgba(200,149,108,0.6)' }}>{t}</span>
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

/* ─────────────────────────────────────────────────────────────────
   STATION 4 — EXPERIENCE
───────────────────────────────────────────────────────────────── */
function Experience() {
  const grp = useRef<THREE.Group>(null!)
  const lbl = useRef<HTMLDivElement>(null)
  const e0  = useRef<HTMLDivElement>(null)
  const e1  = useRef<HTMLDivElement>(null)
  useVisibility(grp, [lbl, e0, e1], 0.59, 0.66, 0.73, 0.81)

  const LINE: [number,number,number][] = [[-1, 2.8,-22],[-1,-2.2,-22]]

  return (
    <group ref={grp}>
      <Line points={LINE} color="#7a4e2a" lineWidth={1} transparent opacity={0.35} />

      <Html position={[0.5,3.5,-21]} distanceFactor={9} zIndexRange={[1,10]}>
        <div ref={lbl} style={{ opacity:0, pointerEvents:'none', transition:'none' }}>
          <p style={{ fontFamily:'Space Mono', fontSize:'8px', letterSpacing:'5px',
            color:'#9b6e4a', marginBottom:'6px' }}>03 — EXPERIENCE</p>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'26px',
            fontWeight:300, fontStyle:'italic', color:'#e8ddd0' }}>Where I've worked.</h2>
        </div>
      </Html>

      {[
        { y: 1.6, r: e0, exp: experience[0] },
        { y:-1.4, r: e1, exp: experience[1] },
      ].map(({ y, r, exp }) => (
        <group key={exp.company}>
          <mesh position={[-1, y, -22]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={1.5} />
          </mesh>
          <Html position={[-0.5, y,-22]} distanceFactor={9} zIndexRange={[1,10]}>
            <div ref={r} style={{ opacity:0, pointerEvents:'none', transition:'none' }}>
              <div style={{ width:'270px', padding:'13px 16px',
                background:'rgba(9,6,3,0.93)', backdropFilter:'blur(14px)',
                borderLeft:'1px solid rgba(200,149,108,0.3)',
                fontFamily:'Cormorant Garamond, Georgia, serif', marginLeft:'10px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                  <span style={{ fontSize:'16px', fontWeight:400, color:'#e8ddd0' }}>{exp.company}</span>
                  <span style={{ fontFamily:'Space Mono', fontSize:'8px', color:'rgba(200,149,108,0.4)' }}>{exp.period}</span>
                </div>
                <p style={{ fontFamily:'Space Mono', fontSize:'8px', color:'#9b6e4a',
                  letterSpacing:'1px', marginBottom:'7px' }}>{exp.role}</p>
                <p style={{ fontSize:'11px', fontWeight:300,
                  color:'rgba(232,221,208,0.5)', lineHeight:1.65 }}>{exp.description}</p>
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────
   STATION 5 — CONTACT
───────────────────────────────────────────────────────────────── */
function Contact() {
  const grp   = useRef<THREE.Group>(null!)
  const panel = useRef<HTMLDivElement>(null)
  const r1    = useRef<THREE.Mesh>(null!)
  const r2    = useRef<THREE.Mesh>(null!)
  useVisibility(grp, [panel], 0.80, 0.87, 0.96, 1)

  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (r1.current) r1.current.rotation.z = t * 0.22
    if (r2.current) r2.current.rotation.z = -t * 0.16
  })

  return (
    <group ref={grp} position={[0, 0.3,-34]}>
      <pointLight color="#c8956c" intensity={8} distance={22} />
      <mesh ref={r1}><torusGeometry args={[4,0.045,8,100]} />
        <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <mesh ref={r2}><torusGeometry args={[2.9,0.025,8,100]} />
        <meshStandardMaterial color="#9b6e4a" emissive="#9b6e4a" emissiveIntensity={1.4} transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <mesh position={[0,0,-0.5]}>
        <circleGeometry args={[3.2,64]} />
        <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={0.02} transparent opacity={0.05} />
      </mesh>

      <Html position={[0,0,1]} center distanceFactor={10} zIndexRange={[1,10]}>
        <div ref={panel} style={{ opacity:0, pointerEvents:'none', transition:'none',
          textAlign:'center', fontFamily:'Cormorant Garamond, Georgia, serif' }}>
          <div style={{ width:'300px' }}>
            <div style={{ width:'1px', height:'26px', background:'rgba(200,149,108,0.25)', margin:'0 auto 14px' }} />
            <p style={{ fontFamily:'Space Mono', fontSize:'8px', letterSpacing:'4px',
              color:'#9b6e4a', marginBottom:'12px' }}>04 — CONTACT</p>
            <h2 style={{ fontSize:'32px', fontWeight:300, fontStyle:'italic',
              color:'#e8ddd0', lineHeight:1.15, marginBottom:'8px' }}>
              Let's build<br />something great.
            </h2>
            <p style={{ fontSize:'12px', fontWeight:300,
              color:'rgba(232,221,208,0.4)', marginBottom:'24px' }}>
              Open to fullstack & ML opportunities.
            </p>
            <a href={`mailto:${personal.email}`} style={{
              display:'inline-block', padding:'10px 24px',
              border:'1px solid rgba(200,149,108,0.45)',
              color:'#c8956c', fontFamily:'Space Mono', fontSize:'9px',
              letterSpacing:'3px', textDecoration:'none',
              background:'rgba(200,149,108,0.05)', marginBottom:'16px', cursor:'pointer' }}
              onMouseEnter={e=>{(e.target as HTMLElement).style.background='rgba(200,149,108,0.12)'}}
              onMouseLeave={e=>{(e.target as HTMLElement).style.background='rgba(200,149,108,0.05)'}}
            >SEND A MESSAGE</a>
            <div style={{ display:'flex', gap:'16px', justifyContent:'center' }}>
              {[['GITHUB',personal.github],['RESUME',personal.resume],['EMAIL',`mailto:${personal.email}`]].map(([l,h])=>(
                <a key={l} href={h} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily:'Space Mono', fontSize:'8px', letterSpacing:'2px',
                    color:'rgba(200,149,108,0.4)', textDecoration:'none' }}>{l} ↗</a>
              ))}
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────
   POST-PROCESSING
───────────────────────────────────────────────────────────────── */
const CA = new THREE.Vector2(0.0005, 0.0004)
function FX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.18} luminanceSmoothing={0.9}
        intensity={0.8} mipmapBlur />
      <ChromaticAberration offset={CA} />
      <Vignette offset={0.38} darkness={1.1} />
    </EffectComposer>
  )
}

/* ─────────────────────────────────────────────────────────────────
   SCENE ROOT
───────────────────────────────────────────────────────────────── */
export function Scene() {
  return (
    <ScrollControls pages={8} damping={0.42} distance={1}>
      <CameraRig />

      <ambientLight intensity={0.035} />
      <fog attach="fog" args={['#0c0906', 12, 52]} />

      {/* Environment */}
      <Ground />
      <City />
      <DataFlow />
      <Stars radius={80} depth={50} count={500} factor={2}
        fade speed={0.12} saturation={0} />

      {/* The character — camera follows this */}
      <Avatar />

      {/* Content stations */}
      <Intro />
      <About />
      <Projects />
      <Experience />
      <Contact />

      <FX />
    </ScrollControls>
  )
}
