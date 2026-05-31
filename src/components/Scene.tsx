import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll, ScrollControls, Stars, Float, Text3D, Center, Html, Line } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { personal, projects, experience, skills } from '../data/portfolio'

/* ─── Camera path (5 stations) ─────────────────────────────────── */
const PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 14),
  new THREE.Vector3(0.4, 0.1, 9),
  new THREE.Vector3(-0.3, -0.1, 4),   // About
  new THREE.Vector3(0.2, 0.15, -1),
  new THREE.Vector3(-0.2, 0, -6),      // Projects
  new THREE.Vector3(0.3, -0.1, -11),
  new THREE.Vector3(0, 0.1, -16),      // Experience
  new THREE.Vector3(-0.2, 0, -21),
  new THREE.Vector3(0, 0, -26),        // Contact
], false, 'catmullrom', 0.5)

const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()
const _dummy = new THREE.PerspectiveCamera()

function CameraRig() {
  const scroll = useScroll()
  const { camera } = useThree()

  useFrame(() => {
    const t = scroll.offset
    PATH.getPoint(t, _pos)
    camera.position.lerp(_pos, 0.06)
    PATH.getPoint(Math.min(t + 0.02, 1), _look)
    _dummy.position.copy(camera.position)
    _dummy.lookAt(_look)
    camera.quaternion.slerp(_dummy.quaternion, 0.06)
  })
  return null
}

/* ─── Background particles ──────────────────────────────────────── */
function WarmParticles() {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() => Array.from({ length: 1200 }, () => ({
    x: (Math.random() - 0.5) * 40,
    y: (Math.random() - 0.5) * 20,
    z: (Math.random() - 0.5) * 60 - 10,
    s: 0.015 + Math.random() * 0.04,
    phase: Math.random() * Math.PI * 2,
    speed: 0.3 + Math.random() * 0.5,
  })), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    data.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed * 0.3 + p.phase) * 0.15,
        p.y + Math.cos(t * p.speed * 0.2 + p.phase) * 0.1,
        p.z
      )
      dummy.scale.setScalar(p.s)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 1200]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={0.6}
        transparent opacity={0.35} />
    </instancedMesh>
  )
}

/* ─── Section 1: Intro ──────────────────────────────────────────── */
function Intro() {
  const ref = useRef<THREE.Group>(null!)
  const scroll = useScroll()

  useFrame(() => {
    const p = scroll.offset
    const op = Math.max(0, 1 - p * 12)
    if (ref.current) ref.current.visible = op > 0.01
  })

  return (
    <group ref={ref} position={[0, 0, 10]}>
      <pointLight position={[0, 2, 3]} color="#c8956c" intensity={4} distance={15} />
      <pointLight position={[-3, -1, 0]} color="#9b6e4a" intensity={2} distance={10} />

      <Float speed={0.5} rotationIntensity={0.02} floatIntensity={0.15}>
        <Center position={[0, 0.8, 0]}>
          <Text3D font="/fonts/helvetiker_bold.typeface.json" size={0.7} height={0.1}
            curveSegments={8} bevelEnabled bevelThickness={0.01} bevelSize={0.008} bevelSegments={3}>
            SUDHEER
            <meshStandardMaterial color="#e8ddd0" emissive="#c8956c" emissiveIntensity={0.2}
              metalness={0.6} roughness={0.3} />
          </Text3D>
        </Center>
        <Center position={[0, -0.2, 0]}>
          <Text3D font="/fonts/helvetiker_bold.typeface.json" size={0.7} height={0.1}
            curveSegments={8} bevelEnabled bevelThickness={0.01} bevelSize={0.008} bevelSegments={3}>
            KUMAR
            <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={0.35}
              metalness={0.7} roughness={0.25} />
          </Text3D>
        </Center>
        <Center position={[0, -1.1, 0]}>
          <Text3D font="/fonts/helvetiker_bold.typeface.json" size={0.18} height={0.02} curveSegments={6}>
            FULLSTACK DEVELOPER  &amp;  ML ENGINEER
            <meshStandardMaterial color="#9b6e4a" emissive="#9b6e4a" emissiveIntensity={0.5} />
          </Text3D>
        </Center>
      </Float>

      {/* Scroll indicator */}
      <Html position={[0, -2.2, 0]} center distanceFactor={12}>
        <div style={{ textAlign: 'center', opacity: 0.5, fontFamily: 'Space Mono', fontSize: '10px',
          letterSpacing: '4px', color: '#c8956c' }}>
          SCROLL TO EXPLORE
        </div>
      </Html>

      {/* Floating ring */}
      <mesh position={[0, 0, -1]} rotation={[0.1, 0, 0.05]}>
        <torusGeometry args={[4, 0.015, 6, 80]} />
        <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={0.8}
          transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

/* ─── Section 2: About ──────────────────────────────────────────── */
function About() {
  const ref = useRef<THREE.Group>(null!)
  const panelRef = useRef<HTMLDivElement>(null)
  const scroll = useScroll()

  useFrame(() => {
    const p = scroll.offset
    let op = 0
    if (p >= 0.16 && p <= 0.38) {
      if (p < 0.22) op = (p - 0.16) / 0.06
      else if (p > 0.32) op = 1 - (p - 0.32) / 0.06
      else op = 1
    }
    op = Math.max(0, Math.min(1, op))
    if (ref.current) ref.current.visible = op > 0.01
    if (panelRef.current) {
      panelRef.current.style.opacity = String(op)
      panelRef.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none'
    }
  })

  return (
    <group ref={ref} position={[0, 0, 1]}>
      <pointLight position={[3, 2, 2]} color="#c8956c" intensity={2} distance={12} />

      {/* Floating icosahedron */}
      <Float speed={1} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh position={[-4, 0.5, -1]}>
          <icosahedronGeometry args={[0.9, 1]} />
          <meshStandardMaterial color="#9b6e4a" emissive="#9b6e4a" emissiveIntensity={0.3} wireframe />
        </mesh>
      </Float>

      <Html position={[0, 0, 1.5]} center distanceFactor={9} zIndexRange={[1, 10]}>
        <div ref={panelRef} style={{ opacity: 0, pointerEvents: 'none', transition: 'none' }}>
          <div className="ui-panel" style={{
            width: '460px', padding: '40px',
            background: 'rgba(12, 9, 6, 0.88)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(200, 149, 108, 0.2)',
            borderRadius: '2px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '32px', height: '1px', background: '#c8956c' }} />
              <span style={{ fontFamily: 'Space Mono', fontSize: '9px', letterSpacing: '4px', color: '#9b6e4a' }}>
                ABOUT
              </span>
            </div>
            <h2 style={{ fontSize: '34px', fontWeight: 300, lineHeight: 1.15, color: '#e8ddd0', marginBottom: '20px', fontStyle: 'italic' }}>
              Bridging code<br />& intelligence.
            </h2>
            <p style={{ fontSize: '15px', fontWeight: 300, color: 'rgba(232,221,208,0.65)', lineHeight: 1.8, marginBottom: '28px' }}>
              {personal.about}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skills.slice(0, 10).map((s) => (
                <span key={s} style={{
                  fontFamily: 'Space Mono', fontSize: '8px', padding: '4px 10px',
                  border: '1px solid rgba(200,149,108,0.3)', color: 'rgba(200,149,108,0.8)',
                  letterSpacing: '1px',
                }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ─── Section 3: Projects ───────────────────────────────────────── */
function Projects() {
  const ref = useRef<THREE.Group>(null!)
  const labelRef = useRef<HTMLDivElement>(null)
  const cardRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]
  const scroll = useScroll()

  useFrame(() => {
    const p = scroll.offset
    let op = 0
    if (p >= 0.38 && p <= 0.60) {
      if (p < 0.44) op = (p - 0.38) / 0.06
      else if (p > 0.54) op = 1 - (p - 0.54) / 0.06
      else op = 1
    }
    op = Math.max(0, Math.min(1, op))
    if (ref.current) ref.current.visible = op > 0.01
    if (labelRef.current) { labelRef.current.style.opacity = String(op); labelRef.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none' }
    cardRefs.forEach(r => { if (r.current) { r.current.style.opacity = String(op); r.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none' } })
  })

  const positions: [number, number, number][] = [[-4, 1, -9], [0, -0.2, -10.5], [4, 1, -9]]
  const rotations: [number, number, number][] = [[0, 0.25, 0], [0, 0, 0], [0, -0.25, 0]]

  return (
    <group ref={ref}>
      <pointLight position={[0, 4, -8]} color="#c8956c" intensity={2.5} distance={18} />

      <Html position={[0, 3.5, -8]} center distanceFactor={10} zIndexRange={[1, 10]}>
        <div ref={labelRef} style={{ opacity: 0, pointerEvents: 'none', textAlign: 'center', transition: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '6px' }}>
            <div style={{ width: '28px', height: '1px', background: '#c8956c' }} />
            <span style={{ fontFamily: 'Space Mono', fontSize: '9px', letterSpacing: '4px', color: '#9b6e4a' }}>SELECTED WORK</span>
            <div style={{ width: '28px', height: '1px', background: '#c8956c' }} />
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 300, color: '#e8ddd0', fontStyle: 'italic' }}>Things I've built.</h2>
        </div>
      </Html>

      {projects.map((proj, i) => (
        <group key={proj.id} position={positions[i]} rotation={rotations[i]}>
          {/* Card geometry */}
          <mesh>
            <boxGeometry args={[4.2, 2.8, 0.05]} />
            <meshStandardMaterial color="#180e08" transparent opacity={0.9}
              emissive="#9b6e4a" emissiveIntensity={0.04} metalness={0.2} roughness={0.8} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(4.2, 2.8, 0.05)]} />
            <lineBasicMaterial color="#c8956c" transparent opacity={0.35} />
          </lineSegments>
          <Html position={[0, 0, 0.06]} center distanceFactor={7} zIndexRange={[1, 10]}>
            <div ref={cardRefs[i]} style={{ opacity: 0, pointerEvents: 'none', transition: 'none' }}>
              <a href={proj.link} target="_blank" rel="noopener noreferrer"
                className="ui-panel"
                style={{ display: 'block', width: '230px', padding: '18px', textDecoration: 'none', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'Space Mono', fontSize: '9px', color: '#9b6e4a', letterSpacing: '2px' }}>{proj.year}</span>
                  <span style={{ color: 'rgba(200,149,108,0.5)', fontSize: '12px' }}>↗</span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 400, color: '#e8ddd0', marginBottom: '10px', lineHeight: 1.3 }}>{proj.title}</h3>
                <p style={{ fontSize: '11px', color: 'rgba(232,221,208,0.5)', lineHeight: 1.6, marginBottom: '12px', fontFamily: 'inherit', fontWeight: 300 }}>{proj.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {proj.tags.map(t => (
                    <span key={t} style={{ fontFamily: 'Space Mono', fontSize: '8px', padding: '2px 7px',
                      border: '1px solid rgba(155,110,74,0.3)', color: 'rgba(200,149,108,0.7)', letterSpacing: '0.5px' }}>{t}</span>
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

/* ─── Section 4: Experience ─────────────────────────────────────── */
function Experience() {
  const ref = useRef<THREE.Group>(null!)
  const labelRef = useRef<HTMLDivElement>(null)
  const card0Ref = useRef<HTMLDivElement>(null)
  const card1Ref = useRef<HTMLDivElement>(null)
  const scroll = useScroll()

  useFrame(() => {
    const p = scroll.offset
    let op = 0
    if (p >= 0.60 && p <= 0.82) {
      if (p < 0.66) op = (p - 0.60) / 0.06
      else if (p > 0.76) op = 1 - (p - 0.76) / 0.06
      else op = 1
    }
    op = Math.max(0, Math.min(1, op))
    if (ref.current) ref.current.visible = op > 0.01
    ;[labelRef, card0Ref, card1Ref].forEach(r => {
      if (r.current) { r.current.style.opacity = String(op); r.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none' }
    })
  })

  const linePoints: [number, number, number][] = [[-1.5, 2.8, -16], [-1.5, -2.2, -16]]
  const nodeY = [1.8, -1.2]
  const cardRefs = [card0Ref, card1Ref]

  return (
    <group ref={ref}>
      <pointLight position={[-1, 1, -13]} color="#c8956c" intensity={2} distance={14} />

      <Line points={linePoints} color="#9b6e4a" lineWidth={1} transparent opacity={0.4} />

      <Html position={[1, 3.4, -15]} distanceFactor={9} zIndexRange={[1, 10]}>
        <div ref={labelRef} style={{ opacity: 0, pointerEvents: 'none', transition: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '20px', height: '1px', background: '#c8956c' }} />
            <span style={{ fontFamily: 'Space Mono', fontSize: '9px', letterSpacing: '4px', color: '#9b6e4a' }}>EXPERIENCE</span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 300, color: '#e8ddd0', fontStyle: 'italic' }}>Where I've worked.</h2>
        </div>
      </Html>

      {experience.map((exp, i) => (
        <group key={exp.company}>
          {/* Timeline node */}
          <mesh position={[-1.5, nodeY[i], -16]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={1} />
          </mesh>
          <Html position={[-0.8, nodeY[i], -16]} distanceFactor={9} zIndexRange={[1, 10]}>
            <div ref={cardRefs[i]} style={{ opacity: 0, pointerEvents: 'none', transition: 'none' }}>
              <div className="ui-panel" style={{
                width: '280px', padding: '16px 20px',
                background: 'rgba(12,9,6,0.9)', backdropFilter: 'blur(16px)',
                borderLeft: '1px solid rgba(200,149,108,0.4)',
                borderRight: 'none', borderTop: 'none', borderBottom: 'none',
                marginLeft: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 400, color: '#e8ddd0' }}>{exp.company}</div>
                    <div style={{ fontFamily: 'Space Mono', fontSize: '9px', color: '#c8956c', letterSpacing: '1px', marginTop: '2px' }}>{exp.role}</div>
                  </div>
                  <span style={{ fontFamily: 'Space Mono', fontSize: '9px', color: 'rgba(200,149,108,0.4)', marginTop: '2px' }}>{exp.period}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(232,221,208,0.5)', lineHeight: 1.65, fontWeight: 300 }}>{exp.description}</p>
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}

/* ─── Section 5: Contact ────────────────────────────────────────── */
function Contact() {
  const ref = useRef<THREE.Group>(null!)
  const panelRef = useRef<HTMLDivElement>(null)
  const scroll = useScroll()
  const ring1 = useRef<THREE.Mesh>(null!)
  const ring2 = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const p = scroll.offset
    const op = p >= 0.83 ? Math.min(1, (p - 0.83) / 0.07) : 0
    if (ref.current) ref.current.visible = op > 0.01
    if (panelRef.current) { panelRef.current.style.opacity = String(op); panelRef.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none' }
    const t = state.clock.elapsedTime
    if (ring1.current) ring1.current.rotation.z = t * 0.25
    if (ring2.current) ring2.current.rotation.z = -t * 0.18
  })

  return (
    <group ref={ref} position={[0, 0, -26]}>
      <pointLight position={[0, 0, 4]} color="#c8956c" intensity={4} distance={20} />

      {/* Portal rings */}
      <mesh ref={ring1}>
        <torusGeometry args={[4.2, 0.04, 8, 100]} />
        <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={1.2} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[3.0, 0.025, 8, 100]} />
        <meshStandardMaterial color="#9b6e4a" emissive="#9b6e4a" emissiveIntensity={1} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0, -0.3]}>
        <circleGeometry args={[3.5, 64]} />
        <meshStandardMaterial color="#c8956c" emissive="#c8956c" emissiveIntensity={0.03} transparent opacity={0.04} />
      </mesh>

      <Html position={[0, 0, 0.8]} center distanceFactor={10} zIndexRange={[1, 10]}>
        <div ref={panelRef} style={{ opacity: 0, pointerEvents: 'none', transition: 'none', textAlign: 'center' }}>
          <div className="ui-panel" style={{ width: '340px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ width: '24px', height: '1px', background: '#c8956c' }} />
              <span style={{ fontFamily: 'Space Mono', fontSize: '9px', letterSpacing: '4px', color: '#9b6e4a' }}>CONTACT</span>
              <div style={{ width: '24px', height: '1px', background: '#c8956c' }} />
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: 300, color: '#e8ddd0', fontStyle: 'italic', marginBottom: '8px', lineHeight: 1.2 }}>
              Let's build<br />something great.
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(232,221,208,0.5)', marginBottom: '28px', fontWeight: 300 }}>
              Open to fullstack & ML opportunities.
            </p>
            <a href={`mailto:${personal.email}`} style={{
              display: 'inline-block', padding: '12px 28px',
              border: '1px solid rgba(200,149,108,0.6)',
              color: '#c8956c', fontFamily: 'Space Mono', fontSize: '10px', letterSpacing: '3px',
              textDecoration: 'none', marginBottom: '20px',
              background: 'rgba(200,149,108,0.06)',
            }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(200,149,108,0.15)' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(200,149,108,0.06)' }}
            >
              GET IN TOUCH
            </a>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <a href={personal.github} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'Space Mono', fontSize: '9px', color: 'rgba(200,149,108,0.5)', letterSpacing: '2px', textDecoration: 'none' }}>GITHUB ↗</a>
              <a href={personal.resume} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'Space Mono', fontSize: '9px', color: 'rgba(200,149,108,0.5)', letterSpacing: '2px', textDecoration: 'none' }}>RESUME ↗</a>
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ─── Post-processing ───────────────────────────────────────────── */
function FX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.25} luminanceSmoothing={0.9} intensity={0.6} mipmapBlur />
      <Vignette offset={0.35} darkness={0.9} />
    </EffectComposer>
  )
}

/* ─── Main scene export ─────────────────────────────────────────── */
export function Scene() {
  return (
    <ScrollControls pages={7} damping={0.35} distance={1}>
      <CameraRig />

      {/* Ambient star field */}
      <Stars radius={60} depth={40} count={800} factor={2} fade speed={0.2} saturation={0} />
      <WarmParticles />

      {/* Global lighting */}
      <ambientLight intensity={0.06} />
      <fog attach="fog" args={['#0c0906', 12, 45]} />

      <Intro />
      <About />
      <Projects />
      <Experience />
      <Contact />

      <FX />
    </ScrollControls>
  )
}
