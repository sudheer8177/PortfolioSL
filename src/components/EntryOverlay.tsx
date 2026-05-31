import { useEffect, useState, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'

/* City skyline SVG — line-art style like sebastien's */
function CitySkyline() {
  return (
    <svg viewBox="0 0 700 240" width="600" height="200"
      style={{ display: 'block', margin: '0 auto' }}>
      {/* Style: thin line art, no fill */}
      <g stroke="#1a1a1a" strokeWidth="1.1" fill="none" opacity="0.55">
        {/* Far left building */}
        <rect x="60" y="130" width="55" height="110" />
        <rect x="70" y="145" width="10" height="14" /> {/* window */}
        <rect x="90" y="145" width="10" height="14" />
        <rect x="70" y="168" width="10" height="14" />
        <rect x="90" y="168" width="10" height="14" />

        {/* Second building — tall */}
        <rect x="125" y="80" width="65" height="160" />
        <line x1="157" y1="80" x2="157" y2="240" />
        <rect x="133" y="100" width="16" height="12" />
        <rect x="158" y="100" width="16" height="12" />
        <rect x="133" y="122" width="16" height="12" />
        <rect x="158" y="122" width="16" height="12" />
        <rect x="133" y="144" width="16" height="12" />
        <rect x="158" y="144" width="16" height="12" />
        <rect x="133" y="166" width="16" height="12" />
        <rect x="158" y="166" width="16" height="12" />
        {/* Antenna on top */}
        <line x1="157" y1="80" x2="157" y2="50" />
        <line x1="147" y1="65" x2="167" y2="65" />

        {/* Third - medium */}
        <rect x="202" y="140" width="50" height="100" />
        <rect x="212" y="155" width="10" height="10" />
        <rect x="232" y="155" width="10" height="10" />
        <rect x="212" y="175" width="10" height="10" />
        <rect x="232" y="175" width="10" height="10" />

        {/* CENTER — tallest (like Eiffel / distinctive) */}
        <polygon points="330,20 360,120 300,120" />   {/* triangle top */}
        <rect x="314" y="120" width="32" height="120" />
        <line x1="280" y1="240" x2="380" y2="240" />  {/* base */}
        <line x1="290" y1="200" x2="370" y2="200" />  {/* mid support */}
        <line x1="298" y1="160" x2="362" y2="160" />  {/* upper support */}
        {/* Cross lines */}
        <line x1="280" y1="240" x2="314" y2="120" />
        <line x1="380" y1="240" x2="346" y2="120" />
        <line x1="290" y1="200" x2="314" y2="140" />
        <line x1="370" y1="200" x2="346" y2="140" />

        {/* Right of center - medium tall */}
        <rect x="400" y="100" width="60" height="140" />
        <rect x="410" y="116" width="14" height="12" />
        <rect x="432" y="116" width="14" height="12" />
        <rect x="410" y="136" width="14" height="12" />
        <rect x="432" y="136" width="14" height="12" />
        <rect x="410" y="156" width="14" height="12" />
        <rect x="432" y="156" width="14" height="12" />
        {/* Dome top */}
        <path d="M400,100 Q430,70 460,100" />

        {/* Second right building */}
        <rect x="472" y="125" width="55" height="115" />
        <rect x="482" y="140" width="12" height="10" />
        <rect x="502" y="140" width="12" height="10" />
        <rect x="482" y="160" width="12" height="10" />
        <rect x="502" y="160" width="10" height="10" />
        <rect x="482" y="180" width="12" height="10" />
        <rect x="502" y="180" width="10" height="10" />

        {/* Far right — squat wide */}
        <rect x="539" y="155" width="100" height="85" />
        <rect x="549" y="168" width="16" height="12" />
        <rect x="573" y="168" width="16" height="12" />
        <rect x="597" y="168" width="16" height="12" />
        <rect x="549" y="189" width="16" height="12" />
        <rect x="573" y="189" width="16" height="12" />
        <rect x="597" y="189" width="16" height="12" />
        {/* Step top */}
        <rect x="555" y="140" width="68" height="15" />

        {/* Ground line */}
        <line x1="0" y1="240" x2="700" y2="240" strokeWidth="1.5" />
      </g>
    </svg>
  )
}

/* Bottom credentials bar — matching sebastien's awards row */
function CredentialBar() {
  const items = [
    { top: 'SK.', sub: 'PORTFOLIO 2024' },
    { top: 'FULLSTACK', sub: 'DEVELOPER' },
    { top: 'ML', sub: 'ENGINEER' },
    { top: '2ND PRIZE', sub: 'SPAN THE MACHINE' },
    { top: 'INDIA', sub: 'GUNTUR, AP' },
  ]
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      gap: '48px', padding: '20px 40px', borderTop: '1px solid rgba(26,26,26,0.1)',
    }}>
      {items.map((item) => (
        <div key={item.top} style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Space Mono', fontSize: '11px', fontWeight: 700,
            letterSpacing: '1px', color: 'rgba(26,26,26,0.75)' }}>{item.top}</div>
          <div style={{ fontFamily: 'Space Mono', fontSize: '8px',
            color: 'rgba(26,26,26,0.4)', letterSpacing: '1px' }}>{item.sub}</div>
        </div>
      ))}
    </div>
  )
}

interface Props {
  onStart: () => void
}

export function EntryOverlay({ onStart }: Props) {
  const { progress, active } = useProgress()
  const [ready, setReady] = useState(false)
  const [count, setCount] = useState(0)

  /* Animated counter 0 → 100 */
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        const next = Math.min(prev + Math.ceil(Math.random() * 4 + 1), Math.round(progress))
        return next
      })
    }, 40)
    return () => clearInterval(interval)
  }, [progress])

  /* Failsafe: mark ready after 5s even if progress stalls */
  useEffect(() => {
    if (!active && progress >= 100) setReady(true)
    const t = setTimeout(() => setReady(true), 5000)
    return () => clearTimeout(t)
  }, [active, progress])

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: '#e8e7e4',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        {!ready ? (
          /* ── LOADING STATE ─────────────────────────────── */
          <>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontFamily: 'Space Mono', fontSize: '120px', fontWeight: 700,
                  color: 'rgba(26,26,26,0.08)', letterSpacing: '-4px',
                  lineHeight: 1, userSelect: 'none',
                }}
              >
                {String(count).padStart(3, '0')}
              </motion.div>
            </div>
            <CredentialBar />
          </>
        ) : (
          /* ── START STATE ───────────────────────────────── */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{ width: '100%', height: '100%', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative' }}
          >
            {/* City illustration */}
            <div style={{ marginBottom: '28px' }}>
              <CitySkyline />
            </div>

            {/* START button — mauve/purple like sebastien's */}
            <motion.button
              onClick={onStart}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'linear-gradient(135deg, #8b5e8f, #5c3a6e)',
                color: '#fff',
                border: 'none',
                padding: '16px 80px',
                fontSize: '15px',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500,
                letterSpacing: '6px',
                cursor: 'pointer',
                borderRadius: '3px',
                marginBottom: '22px',
                boxShadow: '0 4px 24px rgba(107,74,109,0.3)',
              }}
            >
              START
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ textAlign: 'center', color: 'rgba(26,26,26,0.5)',
                fontSize: '13px', lineHeight: 1.8, letterSpacing: '0.5px' }}
            >
              For the best experience<br />
              Switch to desktop
            </motion.p>

            <CredentialBar />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
