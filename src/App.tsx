import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import { Loading } from './components/Loading'
import { UI } from './components/UI'

export default function App() {
  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 14], fov: 60, near: 0.1, far: 120 }}
        style={{ position: 'fixed', inset: 0 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <Loading />
      <UI />
    </>
  )
}
