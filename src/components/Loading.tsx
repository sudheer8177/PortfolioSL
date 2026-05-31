import { useProgress } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export function Loading() {
  const { progress, active } = useProgress()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setVisible(false), 700)
      return () => clearTimeout(t)
    }
  }, [active, progress])

  // Failsafe
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#0c0906',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '40px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ fontFamily: 'Cormorant Garamond', fontSize: '13px', letterSpacing: '8px', color: 'rgba(200,149,108,0.6)', fontStyle: 'italic' }}
          >
            Sudheer Kumar
          </motion.div>

          <div style={{ width: '180px' }}>
            <div style={{ width: '100%', height: '1px', background: 'rgba(155,110,74,0.15)' }}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress / 100 }}
                transition={{ ease: 'easeOut' }}
                style={{ height: '100%', background: '#c8956c', transformOrigin: 'left', boxShadow: '0 0 8px rgba(200,149,108,0.5)' }}
              />
            </div>
            <div style={{
              fontFamily: 'Space Mono', fontSize: '9px', letterSpacing: '3px',
              color: 'rgba(155,110,74,0.35)', textAlign: 'center', marginTop: '12px',
            }}>
              {Math.round(progress) >= 100 ? 'ENTERING' : 'LOADING'}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute', bottom: '40px',
              fontFamily: 'Space Mono', fontSize: '36px', fontWeight: 700,
              color: 'rgba(155,110,74,0.05)', letterSpacing: '2px',
            }}
          >
            {Math.round(progress).toString().padStart(3, '0')}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
