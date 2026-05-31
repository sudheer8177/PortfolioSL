import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll, ScrollControls, Html, Line, Text } from '@react-three/drei'
import { EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { personal, projects, experience, skills } from '../data/portfolio'

/* ─── Path ─────────────────────────────────────────────────────── */
const PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3( 0, 0,  26),
  new THREE.Vector3( 0.3, 0,  20),
  new THREE.Vector3( 0, 0,  14),
  new THREE.Vector3(-0.3, 0,   8),
  new THREE.Vector3( 0, 0,   2),
  new THREE.Vector3( 0.3, 0,  -4),
  new THREE.Vector3( 0, 0, -10),
  new THREE.Vector3(-0.3, 0, -16),
  new THREE.Vector3( 0, 0, -22),
  new THREE.Vector3( 0.2, 0, -28),
  new THREE.Vector3( 0, 0, -34),
], false, 'catmullrom', 0.5)

const _aPos = new THREE.Vector3()
const _aFwd = new THREE.Vector3()
const _aDmy = new THREE.Object3D()
const _cPos = new THREE.Vector3()
const _cLk  = new THREE.Vector3()
const _cDmy = new THREE.PerspectiveCamera()

/* ─── Shared materials ─────────────────────────────────────────── */
const MAT = (color: string, emissive = '#000', ei = 0) =>
  new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: ei, roughness: 0.7, metalness: 0.1 })

const M_SKIN   = MAT('#c4835a')
const M_NAVY   = MAT('#2d3250')
const M_NAVY2  = MAT('#3d4580')
const M_PACK   = MAT('#7a6048')
const M_CREAM  = MAT('#c8be8a')
const M_CREAM2 = MAT('#a8966a')
const M_DARK   = MAT('#2a2a2a')
const M_HUB    = MAT('#888888')
const M_WIND   = new THREE.MeshStandardMaterial({ color: '#9ab4c8', transparent: true, opacity: 0.35 })

/* ─── Scooter + Rider ──────────────────────────────────────────── */
function ScooterRider() {
  const root   = useRef<THREE.Group>(null!)
  const scroll = useScroll()
  const wRef   = [useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!)]

  useFrame((state) => {
    const t  = scroll.offset
    const t2 = Math.min(t + 0.022, 1)
    PATH.getPoint(t,  _aPos)
    PATH.getPoint(t2, _aFwd)
    _aPos.y = 0

    if (root.current) {
      root.current.position.lerp(_aPos, 0.1)
      _aDmy.position.copy(_aPos)
      _aDmy.lookAt(new THREE.Vector3(_aFwd.x, 0, _aFwd.z))
      root.current.quaternion.slerp(_aDmy.quaternion, 0.08)
    }

    // Wheel spin proportional to "speed"
    const spd = state.clock.elapsedTime * 8
    wRef.forEach(w => { if (w.current) w.current.rotation.x = spd })
  })

  return (
    <group ref={root} scale={1}>
      {/* ── SCOOTER BODY ────────────── */}

      {/* Main chassis — cream */}
      <mesh position={[0, 0.16, 0]} material={M_CREAM}>
        <boxGeometry args={[1.15, 0.22, 0.41]} />
      </mesh>

      {/* Under-chassis — darker cream */}
      <mesh position={[0, -0.02, 0]} material={M_CREAM2}>
        <boxGeometry args={[0.78, 0.16, 0.37]} />
      </mesh>

      {/* Rear body / fender */}
      <mesh position={[0.47, 0.22, 0]} material={M_CREAM}>
        <boxGeometry args={[0.28, 0.18, 0.39]} />
      </mesh>

      {/* Front fairing */}
      <mesh position={[-0.42, 0.2, 0]} material={M_CREAM}>
        <boxGeometry args={[0.3, 0.32, 0.39]} />
      </mesh>

      {/* Windscreen */}
      <mesh position={[-0.38, 0.44, 0]} rotation={[0.3, 0, 0]} material={M_WIND}>
        <boxGeometry args={[0.16, 0.22, 0.01]} />
      </mesh>

      {/* Seat */}
      <mesh position={[0.18, 0.32, 0]} material={M_DARK}>
        <boxGeometry args={[0.32, 0.08, 0.36]} />
      </mesh>

      {/* Handlebar post */}
      <mesh position={[-0.3, 0.42, 0]} material={M_DARK}>
        <boxGeometry args={[0.05, 0.28, 0.05]} />
      </mesh>
      {/* Handlebar grip */}
      <mesh position={[-0.25, 0.56, 0]} material={M_DARK}>
        <boxGeometry args={[0.05, 0.04, 0.48]} />
      </mesh>

      {/* Headlight */}
      <mesh position={[-0.58, 0.24, 0]} material={new THREE.MeshStandardMaterial({ color:'#e8e0c0', emissive:'#c8b870', emissiveIntensity:0.4 })}>
        <boxGeometry args={[0.06, 0.09, 0.18]} />
      </mesh>

      {/* Back wheel */}
      <mesh ref={wRef[0]} position={[0.52, -0.14, 0]} rotation={[0, 0, Math.PI/2]} material={M_DARK}>
        <cylinderGeometry args={[0.22, 0.22, 0.09, 18]} />
      </mesh>
      <mesh position={[0.52, -0.14, 0]} material={M_HUB}>
        <cylinderGeometry args={[0.07, 0.07, 0.12, 10]} rotation={[Math.PI/2, 0, 0] as any} />
      </mesh>

      {/* Front wheel */}
      <mesh ref={wRef[1]} position={[-0.54, -0.14, 0]} rotation={[0, 0, Math.PI/2]} material={M_DARK}>
        <cylinderGeometry args={[0.21, 0.21, 0.09, 18]} />
      </mesh>
      <mesh position={[-0.54, -0.14, 0]} material={M_HUB}>
        <cylinderGeometry args={[0.065, 0.065, 0.12, 10]} rotation={[Math.PI/2, 0, 0] as any} />
      </mesh>

      {/* Front fork */}
      <mesh position={[-0.5, 0.06, 0]} material={M_DARK}>
        <boxGeometry args={[0.04, 0.32, 0.04]} />
      </mesh>

      {/* ── RIDER ───────────────────── */}

      {/* Head */}
      <mesh position={[0.06, 1.02, 0]} material={M_SKIN}>
        <sphereGeometry args={[0.135, 16, 16]} />
      </mesh>

      {/* Neck */}
      <mesh position={[0.06, 0.86, 0]} material={M_SKIN}>
        <cylinderGeometry args={[0.055, 0.06, 0.1, 8]} />
      </mesh>

      {/* Shoulder bar */}
      <mesh position={[0.06, 0.78, 0]} material={M_NAVY}>
        <boxGeometry args={[0.44, 0.09, 0.22]} />
      </mesh>

      {/* Torso */}
      <mesh position={[0.08, 0.56, 0]} material={M_NAVY}>
        <boxGeometry args={[0.3, 0.4, 0.21]} />
      </mesh>

      {/* Backpack */}
      <mesh position={[0.16, 0.59, -0.2]} material={M_PACK}>
        <boxGeometry args={[0.16, 0.28, 0.13]} />
      </mesh>

      {/* Left arm — reaching to handlebar */}
      <mesh position={[-0.09, 0.68, 0.12]} rotation={[0.4, 0, 0.4]} material={M_NAVY}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
      </mesh>
      {/* Right arm */}
      <mesh position={[-0.09, 0.68, -0.12]} rotation={[0.4, 0, 0.4]} material={M_NAVY}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
      </mesh>

      {/* Upper legs (sitting — angled forward) */}
      <mesh position={[0.08, 0.36, 0.12]} rotation={[1.2, 0, 0]} material={M_NAVY2}>
        <boxGeometry args={[0.1, 0.28, 0.1]} />
      </mesh>
      <mesh position={[0.08, 0.36, -0.12]} rotation={[1.2, 0, 0]} material={M_NAVY2}>
        <boxGeometry args={[0.1, 0.28, 0.1]} />
      </mesh>

      {/* Lower legs hanging down */}
      <mesh position={[0.22, 0.12, 0.2]} material={M_NAVY2}>
        <boxGeometry args={[0.09, 0.28, 0.09]} />
      </mesh>
      <mesh position={[0.22, 0.12, -0.2]} material={M_NAVY2}>
        <boxGeometry args={[0.09, 0.28, 0.09]} />
      </mesh>

      {/* Shoes */}
      <mesh position={[0.3, -0.06, 0.22]} material={M_DARK}>
        <boxGeometry args={[0.16, 0.07, 0.12]} />
      </mesh>
      <mesh position={[0.3, -0.06, -0.22]} material={M_DARK}>
        <boxGeometry args={[0.16, 0.07, 0.12]} />
      </mesh>
    </group>
  )
}

/* ─── Camera — third person behind rider ───────────────────────── */
function CameraRig() {
  const scroll = useScroll()
  const { camera } = useThree()

  useFrame(() => {
    const t    = scroll.offset
    const tCam = Math.max(0, t - 0.028)
    const tLk  = Math.min(t + 0.012, 1)

    PATH.getPoint(tCam, _cPos)
    PATH.getPoint(tLk,  _cLk)

    _cPos.y  = 1.7    // camera height above ground
    _cPos.z += 0.3    // slight extra offset

    camera.position.lerp(_cPos, 0.055)
    _cDmy.position.copy(camera.position)
    _cDmy.lookAt(new THREE.Vector3(_cLk.x, 0.4, _cLk.z))
    camera.quaternion.slerp(_cDmy.quaternion, 0.055)
  })

  return null
}

/* ─── Ground ───────────────────────────────────────────────────── */
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.38, -4]}>
        <planeGeometry args={[50, 80]} />
        <meshStandardMaterial color="#dddbd8" roughness={1} />
      </mesh>
      {/* Road markings — dashed center line */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI/2, 0, 0]}
          position={[0, -0.37, 22 - i * 4]}>
          <planeGeometry args={[0.08, 1.5]} />
          <meshStandardMaterial color="#c4c2be" />
        </mesh>
      ))}
    </>
  )
}

/* ─── City — barely-visible silhouette buildings ───────────────── */
const BLDGS = [
  // Left side
  [-4.5, 5,  22], [-7, 9,  18], [-5, 12, 14], [-8, 7,  10],
  [-5,  15,   6], [-7.5,10,  2], [-5, 17, -2], [-8, 8,  -6],
  [-5,  11, -10], [-7,  9, -14], [-5, 14, -18], [-8, 7, -22],
  [-5,  12, -26], [-7, 10, -30],
  // Right side
  [ 4.5, 7,  20], [ 7,  11, 16], [ 5, 14, 12], [ 8,  9,  8],
  [ 5,  16,   4], [ 7.5, 11, 0], [ 5, 18, -4], [ 8,  8, -8],
  [ 5,  12, -12], [ 7,  10,-16], [ 5, 15, -20], [ 8,  8, -24],
  [ 5,  13, -28], [ 7,  11, -32],
]

const _bGeo = new THREE.BoxGeometry(1, 1, 1)
const _bMat = new THREE.MeshStandardMaterial({ color: '#ccc9c4', roughness: 1 })

function CityBuildings() {
  const W = 2.2, D = 2.2, base = -0.38

  return (
    <group>
      {BLDGS.map(([bx, h, bz], i) => (
        <mesh key={i}
          position={[bx, base + h / 2, bz]}
          scale={[W, h, D]}
          geometry={_bGeo}
          material={_bMat}
        />
      ))}
    </group>
  )
}

/* ─── Visibility helper — controls Html panels ─────────────────── */
function useVis(
  g:  React.RefObject<THREE.Group>,
  hs: React.RefObject<HTMLDivElement>[],
  s: number, pk: number, fd: number, e: number
) {
  const scroll = useScroll()
  useFrame(() => {
    const p = scroll.offset
    let op = 0
    if (p >= s && p <= e) {
      if      (p < pk) op = (p - s)  / (pk - s)
      else if (p > fd) op = 1 - (p - fd) / (e - fd)
      else             op = 1
    }
    op = Math.max(0, Math.min(1, op))
    if (g.current) g.current.visible = op > 0.01
    hs.forEach(r => {
      if (r.current) {
        r.current.style.opacity = String(op)
        r.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none'
      }
    })
  })
}

/* ─── Panel style helper ───────────────────────────────────────── */
const panel: React.CSSProperties = {
  fontFamily: 'DM Sans, sans-serif',
  background: 'rgba(232,231,228,0.92)',
  backdropFilter: 'blur(16px)',
  borderLeft: '2px solid rgba(26,26,26,0.18)',
  color: '#1a1a1a',
}

/* ─── STATION 1 — Intro ─────────────────────────────────────────── */
function Intro() {
  const g = useRef<THREE.Group>(null!)
  useVis(g, [], 0, 0.01, 0.08, 0.16)

  return (
    <group ref={g} position={[0, 2.5, 14]}>
      <Text
        font="https://fonts.gstatic.com/s/dmsans/v15/rP2tp2ywxg089UriI5-g4vlH9VoD8CxBi6tYggc.woff2"
        fontSize={0.7} color="#1a1a1a" anchorX="center" anchorY="middle"
        letterSpacing={0.04} position={[0, 0.5, 0]}
      >
        SUDHEER KUMAR
      </Text>
      <Text
        font="https://fonts.gstatic.com/s/spacemono/v13/i7dPIFZifjKcF5UAWdDRUEZ2RFq7AwU.woff2"
        fontSize={0.18} color="rgba(26,26,26,0.5)" anchorX="center" anchorY="middle"
        letterSpacing={0.08} position={[0, -0.2, 0]}
      >
        FULLSTACK DEVELOPER · ML ENGINEER
      </Text>
    </group>
  )
}

/* ─── STATION 2 — About ─────────────────────────────────────────── */
function About() {
  const g = useRef<THREE.Group>(null!)
  const p = useRef<HTMLDivElement>(null)
  useVis(g, [p], 0.16, 0.23, 0.30, 0.38)

  return (
    <group ref={g} position={[0, 0, 2]}>
      <Html position={[0, 1.2, 2]} center distanceFactor={9} zIndexRange={[1,10]}>
        <div ref={p} style={{ opacity:0, pointerEvents:'none', transition:'none' }}>
          <div style={{ ...panel, width:'400px', padding:'30px' }}>
            <p style={{ fontFamily:'Space Mono', fontSize:'8px', letterSpacing:'4px',
              color:'rgba(26,26,26,0.45)', marginBottom:'14px' }}>01 — ABOUT</p>
            <h2 style={{ fontSize:'24px', fontWeight:300, lineHeight:1.3,
              color:'#1a1a1a', marginBottom:'14px' }}>
              Bridging code<br />&amp; intelligence.
            </h2>
            <p style={{ fontSize:'13px', lineHeight:1.8, fontWeight:300,
              color:'rgba(26,26,26,0.6)', marginBottom:'18px' }}>{personal.about}</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
              {skills.slice(0,10).map(s => (
                <span key={s} style={{ fontFamily:'Space Mono', fontSize:'7px',
                  padding:'3px 8px', border:'1px solid rgba(26,26,26,0.18)',
                  color:'rgba(26,26,26,0.55)', letterSpacing:'1px' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ─── STATION 3 — Projects ──────────────────────────────────────── */
function Projects() {
  const g  = useRef<THREE.Group>(null!)
  const lb = useRef<HTMLDivElement>(null)
  const c0 = useRef<HTMLDivElement>(null)
  const c1 = useRef<HTMLDivElement>(null)
  const c2 = useRef<HTMLDivElement>(null)
  useVis(g, [lb,c0,c1,c2], 0.37, 0.44, 0.52, 0.60)

  const POS: [number,number,number][] = [[-3,0.8,-10],[0,-0.2,-11.5],[3,0.8,-10]]
  const ROT: [number,number,number][] = [[0,0.18,0],[0,0,0],[0,-0.18,0]]
  const refs = [c0,c1,c2]

  return (
    <group ref={g}>
      <Html position={[0,3,-9]} center distanceFactor={10} zIndexRange={[1,10]}>
        <div ref={lb} style={{ opacity:0, pointerEvents:'none', textAlign:'center', transition:'none' }}>
          <p style={{ fontFamily:'Space Mono', fontSize:'8px', letterSpacing:'5px',
            color:'rgba(26,26,26,0.45)', marginBottom:'6px' }}>02 — SELECTED WORK</p>
          <h2 style={{ fontFamily:'DM Sans', fontSize:'26px', fontWeight:300, color:'#1a1a1a' }}>Things I've built.</h2>
        </div>
      </Html>

      {projects.map((proj,i)=>(
        <group key={proj.id} position={POS[i]} rotation={ROT[i]}>
          <mesh>
            <boxGeometry args={[3.2,2.4,0.05]} />
            <meshStandardMaterial color="#e2e0dd" transparent opacity={0.95}
              roughness={0.8} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(3.2,2.4,0.05)]} />
            <lineBasicMaterial color="#1a1a1a" transparent opacity={0.12} />
          </lineSegments>
          <Html position={[0,0,0.04]} center distanceFactor={6} zIndexRange={[1,10]}>
            <div ref={refs[i]} style={{ opacity:0, pointerEvents:'none', transition:'none' }}>
              <a href={proj.link} target="_blank" rel="noopener noreferrer"
                style={{ display:'block', width:'185px', padding:'14px', textDecoration:'none',
                  cursor:'pointer', fontFamily:'DM Sans, sans-serif', color:'#1a1a1a' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'7px' }}>
                  <span style={{ fontFamily:'Space Mono', fontSize:'8px',
                    color:'rgba(26,26,26,0.4)', letterSpacing:'2px' }}>{proj.year}</span>
                  <span style={{ color:'rgba(26,26,26,0.35)', fontSize:'11px' }}>↗</span>
                </div>
                <h3 style={{ fontSize:'14px', fontWeight:500, marginBottom:'7px', lineHeight:1.3 }}>{proj.title}</h3>
                <p style={{ fontSize:'10px', fontWeight:300, color:'rgba(26,26,26,0.5)',
                  lineHeight:1.6, marginBottom:'9px' }}>{proj.description.slice(0,90)}…</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'3px' }}>
                  {proj.tags.slice(0,3).map(t=>(
                    <span key={t} style={{ fontFamily:'Space Mono', fontSize:'7px',
                      padding:'2px 6px', border:'1px solid rgba(26,26,26,0.14)',
                      color:'rgba(26,26,26,0.5)' }}>{t}</span>
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

/* ─── STATION 4 — Experience ────────────────────────────────────── */
function Experience() {
  const g  = useRef<THREE.Group>(null!)
  const lb = useRef<HTMLDivElement>(null)
  const e0 = useRef<HTMLDivElement>(null)
  const e1 = useRef<HTMLDivElement>(null)
  useVis(g, [lb,e0,e1], 0.59, 0.65, 0.73, 0.80)

  const LINE: [number,number,number][] = [[-0.8,2.4,-20],[-0.8,-2,-20]]

  return (
    <group ref={g}>
      <Line points={LINE} color="rgba(26,26,26,0.2)" lineWidth={1} />
      <Html position={[0.4,3.1,-19]} distanceFactor={9} zIndexRange={[1,10]}>
        <div ref={lb} style={{ opacity:0, pointerEvents:'none', transition:'none' }}>
          <p style={{ fontFamily:'Space Mono', fontSize:'8px', letterSpacing:'5px',
            color:'rgba(26,26,26,0.45)', marginBottom:'6px' }}>03 — EXPERIENCE</p>
          <h2 style={{ fontFamily:'DM Sans', fontSize:'24px', fontWeight:300, color:'#1a1a1a' }}>Where I've worked.</h2>
        </div>
      </Html>
      {[
        { y:1.5, r:e0, exp:experience[0] },
        { y:-1.3, r:e1, exp:experience[1] },
      ].map(({y,r,exp})=>(
        <group key={exp.company}>
          <mesh position={[-0.8,y,-20]}>
            <sphereGeometry args={[0.07,10,10]} />
            <meshStandardMaterial color="#2d3250" />
          </mesh>
          <Html position={[-0.4,y,-20]} distanceFactor={9} zIndexRange={[1,10]}>
            <div ref={r} style={{ opacity:0, pointerEvents:'none', transition:'none' }}>
              <div style={{ ...panel, width:'260px', padding:'12px 16px', marginLeft:'10px', borderLeft:'1px solid rgba(26,26,26,0.18)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                  <span style={{ fontSize:'15px', fontWeight:500 }}>{exp.company}</span>
                  <span style={{ fontFamily:'Space Mono', fontSize:'8px', color:'rgba(26,26,26,0.4)' }}>{exp.period}</span>
                </div>
                <p style={{ fontFamily:'Space Mono', fontSize:'8px', color:'rgba(26,26,26,0.5)',
                  letterSpacing:'1px', marginBottom:'7px' }}>{exp.role}</p>
                <p style={{ fontSize:'11px', fontWeight:300, color:'rgba(26,26,26,0.55)', lineHeight:1.65 }}>{exp.description}</p>
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}

/* ─── STATION 5 — Contact ───────────────────────────────────────── */
function Contact() {
  const g = useRef<THREE.Group>(null!)
  const p = useRef<HTMLDivElement>(null)
  useVis(g, [p], 0.80, 0.87, 0.96, 1.0)

  return (
    <group ref={g} position={[0, 0, -34]}>
      <Html position={[0,1.2,0.8]} center distanceFactor={10} zIndexRange={[1,10]}>
        <div ref={p} style={{ opacity:0, pointerEvents:'none', transition:'none', textAlign:'center' }}>
          <div style={{ ...panel, width:'300px', padding:'32px',
            borderLeft:'none', borderTop:'2px solid rgba(26,26,26,0.15)' }}>
            <div style={{ width:'1px', height:'24px', background:'rgba(26,26,26,0.2)', margin:'0 auto 14px' }} />
            <p style={{ fontFamily:'Space Mono', fontSize:'8px', letterSpacing:'4px',
              color:'rgba(26,26,26,0.4)', marginBottom:'12px' }}>04 — CONTACT</p>
            <h2 style={{ fontSize:'26px', fontWeight:300, color:'#1a1a1a', lineHeight:1.2, marginBottom:'8px' }}>
              Let's build<br />something great.
            </h2>
            <p style={{ fontSize:'12px', fontWeight:300,
              color:'rgba(26,26,26,0.45)', marginBottom:'22px' }}>
              Open to fullstack &amp; ML opportunities.
            </p>
            <a href={`mailto:${personal.email}`} style={{
              display:'inline-block', padding:'10px 28px',
              background:'linear-gradient(135deg,#8b5e8f,#5c3a6e)',
              color:'#fff', fontFamily:'DM Sans', fontSize:'12px',
              letterSpacing:'3px', textDecoration:'none', borderRadius:'2px',
              marginBottom:'16px', cursor:'pointer' }}>
              SEND A MESSAGE
            </a>
            <div style={{ display:'flex', gap:'16px', justifyContent:'center' }}>
              {[['GITHUB',personal.github],['RESUME',personal.resume],['EMAIL',`mailto:${personal.email}`]].map(([l,h])=>(
                <a key={l} href={h} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily:'Space Mono', fontSize:'8px', letterSpacing:'2px',
                    color:'rgba(26,26,26,0.4)', textDecoration:'none' }}>{l} ↗</a>
              ))}
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ─── Scene root ────────────────────────────────────────────────── */
export function Scene() {
  return (
    <ScrollControls pages={8} damping={0.45}>
      <CameraRig />

      {/* Soft bright lighting — matches sebastien's light aesthetic */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} castShadow={false} />
      <hemisphereLight args={['#e8e7e4', '#ccc9c4', 0.4]} />

      {/* Light gray fog creates the misty city depth effect */}
      <fog attach="fog" args={['#e8e7e4', 10, 40]} />

      <Ground />
      <CityBuildings />
      <ScooterRider />

      <Intro />
      <About />
      <Projects />
      <Experience />
      <Contact />

      <EffectComposer multisampling={0}>
        <Vignette offset={0.3} darkness={0.6} />
      </EffectComposer>
    </ScrollControls>
  )
}
