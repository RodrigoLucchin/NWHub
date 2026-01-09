import React, { useRef, useEffect } from 'react'

const apps = ['📊','⚙️','🛰️','🗺️','📁','📡','📈','🔒']

function getAngle(cx, cy, x, y){
  return Math.atan2(y - cy, x - cx)
}

export default function WelcomeHub({userName='Usuário'}){
  const orbitRef = useRef(null)
  const angleRef = useRef(0) // radians
  const velocityRef = useRef(0) // radians per second
  const baseSpeedRef = useRef((2*Math.PI) / 20) // base rotation: one full turn every 20s
  const draggingRef = useRef(false)
  const lastPointerAngleRef = useRef(0)
  const lastTRef = useRef(0)
  const samplesRef = useRef([])

  useEffect(()=>{
    const orbit = orbitRef.current
    if(!orbit) return

    let rafId
    const friction = 1.6 // damping

    function update(t){
      if(!lastTRef.current) lastTRef.current = t
      const dt = (t - lastTRef.current)/1000
      lastTRef.current = t

      // always apply base rotation + any extra velocity from user interaction
      angleRef.current += (baseSpeedRef.current + velocityRef.current) * dt
      if(!draggingRef.current){
        // apply friction only to the extra velocity (base stays constant)
        velocityRef.current *= Math.exp(-friction * dt)
        if(Math.abs(velocityRef.current) < 0.0005) velocityRef.current = 0
      }

      orbit.style.transform = `rotate(${angleRef.current}rad)`

      // keep icons upright by rotating their inner span inversely
      const spans = orbit.querySelectorAll('.app-icon > span')
      spans.forEach(s => {
        s.style.transform = `rotate(${ -angleRef.current }rad)`
      })

      rafId = requestAnimationFrame(update)
    }
    rafId = requestAnimationFrame(update)

    return ()=> cancelAnimationFrame(rafId)
  },[])

  useEffect(()=>{
    const orbit = orbitRef.current
    if(!orbit) return

    function onPointerDown(e){
      orbit.setPointerCapture(e.pointerId)
      draggingRef.current = true
      samplesRef.current = []
      const rect = orbit.getBoundingClientRect()
      const cx = rect.left + rect.width/2
      const cy = rect.top + rect.height/2
      const a = getAngle(cx, cy, e.clientX, e.clientY)
      lastPointerAngleRef.current = a
      velocityRef.current = 0
    }

    function onPointerMove(e){
      if(!draggingRef.current) return
      const rect = orbit.getBoundingClientRect()
      const cx = rect.left + rect.width/2
      const cy = rect.top + rect.height/2
      const a = getAngle(cx, cy, e.clientX, e.clientY)
      let delta = a - lastPointerAngleRef.current
      // normalize delta to [-PI, PI]
      if(delta > Math.PI) delta -= 2*Math.PI
      if(delta < -Math.PI) delta += 2*Math.PI
      angleRef.current += delta
      const now = performance.now()
      samplesRef.current.push({dt: now, delta})
      // keep last few samples
      if(samplesRef.current.length > 8) samplesRef.current.shift()
      lastPointerAngleRef.current = a
    }

    function onPointerUp(e){
      try{ orbit.releasePointerCapture(e.pointerId) }catch(_){}
      draggingRef.current = false
      // estimate velocity from samples
      const s = samplesRef.current
      if(s.length >= 2){
        // compute weighted avg delta / time
        let totalDelta = 0
        let totalTime = 0
        for(let i=1;i<s.length;i++){
          const dt = (s[i].dt - s[i-1].dt)/1000
          if(dt <= 0) continue
          totalDelta += s[i].delta
          totalTime += dt
        }
        if(totalTime > 0){
          velocityRef.current = totalDelta / totalTime
        }
      }
      samplesRef.current = []
    }

    orbit.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    // support touch cancel
    window.addEventListener('pointercancel', onPointerUp)

    return ()=>{
      orbit.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  },[])

  return (
    <div className="hub" role="main">
      <div className="center">
        <div className="center-text">
          <h1>Bem-vindo! {userName}</h1>
          <p>Gire os ícones clicando e arrastando sobre o círculo</p>
        </div>

        <div className="orbit" aria-hidden ref={orbitRef}>
          {apps.map((ic,i)=> (
            <div key={i} className="app-icon"><span>{ic}</span></div>
          ))}
        </div>
      </div>
    </div>
  )
}
