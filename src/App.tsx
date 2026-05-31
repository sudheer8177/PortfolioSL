import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import { Scene } from './components/Scene'
import { EntryOverlay } from './components/EntryOverlay'

export default function App() {
  const [started, setStarted] = useState(false)

  return (
    <>
      {/* 3D Canvas — always rendered, revealed after START */}
      <Canvas
        camera={{ position: [0, 1.7, 26], fov: 52, near: 0.1, far: 80 }}
        style={{
          position: 'fixed', inset: 0,
          background: '#e8e7e4',
          opacity: started ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* Entry overlay — covers canvas until START is clicked */}
      <AnimatePresence>
        {!started && (
          <motion.div
            key="entry"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200 }}
          >
            <EntryOverlay onStart={() => setStarted(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
