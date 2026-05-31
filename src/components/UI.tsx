import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { personal } from '../data/portfolio'

const STATIONS = [
  { label: 'Intro',      range: [0, 0.16] },
  { label: 'About',      range: [0.16, 0.38] },
  { label: 'Projects',   range: [0.38, 0.60] },
  { label: 'Experience', range: [0.60, 0.83] },
  { label: 'Contact',    range: [0.83, 1.00] },
]

export function UI() {
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1800)
    return () => clearTimeout(t)
  }, [])

  // Read scroll from ScrollControls' managed div
  useEffect(() => {
    const el = document.querySelector('[data-scroll]') as HTMLElement
    if (!el) return
    const onScroll = () => {
      const p = el.scrollTop / (el.scrollHeight - el.clientHeight)
      setProgress(p)
      const idx = STATIONS.findIndex(s => p >= s.range[0] && p < s.range[1])
      setActive(idx === -1 ? STATIONS.length - 1 : idx)
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {loaded && (
        <>
          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
              padding: '22px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontFamily: 'Space Mono', fontSize: '11px', letterSpacing: '4px', color: 'rgba(200,149,108,0.7)' }}>
              SK
            </span>
            <span style={{ fontFamily: 'Space Mono', fontSize: '9px', letterSpacing: '3px', color: 'rgba(200,149,108,0.4)' }}>
              {STATIONS[active]?.label.toUpperCase()}
            </span>
          </motion.div>

          {/* Right station dots */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            style={{
              position: 'fixed', right: '28px', top: '50%', transform: 'translateY(-50%)',
              zIndex: 100, display: 'flex', flexDirection: 'column', gap: '14px', pointerEvents: 'none',
            }}
          >
            {STATIONS.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                <span style={{
                  fontFamily: 'Space Mono', fontSize: '8px', letterSpacing: '2px',
                  color: active === i ? 'rgba(200,149,108,0.8)' : 'transparent',
                  transition: 'color 0.4s ease',
                }}>{s.label.toUpperCase()}</span>
                <div style={{
                  width: active === i ? '6px' : '3px',
                  height: active === i ? '6px' : '3px',
                  borderRadius: '50%',
                  background: active === i ? '#c8956c' : 'rgba(155,110,74,0.35)',
                  boxShadow: active === i ? '0 0 8px rgba(200,149,108,0.6)' : 'none',
                  transition: 'all 0.4s ease',
                }} />
              </div>
            ))}
          </motion.div>

          {/* Left progress line */}
          <div style={{
            position: 'fixed', left: 0, top: 0, width: '1px', height: '100vh',
            background: 'rgba(155,110,74,0.12)', zIndex: 100, pointerEvents: 'none',
          }}>
            <div style={{
              width: '100%', height: `${progress * 100}%`,
              background: 'linear-gradient(to bottom, #9b6e4a, #c8956c)',
              transition: 'height 0.1s ease',
            }} />
          </div>

          {/* Bottom info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              position: 'fixed', bottom: '24px', left: '36px',
              zIndex: 100, pointerEvents: 'none',
            }}
          >
            <span style={{ fontFamily: 'Space Mono', fontSize: '8px', letterSpacing: '2px', color: 'rgba(155,110,74,0.4)' }}>
              {personal.location.toUpperCase()}
            </span>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
