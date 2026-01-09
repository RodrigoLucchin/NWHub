import React, {useRef, useEffect} from 'react'

export default function DronesCorner(){
  const droneRefs = useRef([])
  const pupilPos = useRef([])
  const pointer = useRef({x: window.innerWidth/2, y: window.innerHeight/2})

  useEffect(()=>{
    const onMove = (e)=>{
      pointer.current.x = e.clientX
      pointer.current.y = e.clientY
    }
    window.addEventListener('mousemove', onMove)

    for(let i=0;i<3;i++) pupilPos.current[i] = [{x:0,y:0},{x:0,y:0}]

    let raf = 0
    const animate = ()=>{
      for(let i=0;i<3;i++){
        const root = droneRefs.current[i]
        if(!root) continue

        const eyeL = root.querySelector('.eye-left')
        const eyeR = root.querySelector('.eye-right')
        const pupL = root.querySelector('.pupil-left')
        const pupR = root.querySelector('.pupil-right')
        if(!eyeL || !eyeR || !pupL || !pupR) continue

        const bL = eyeL.getBoundingClientRect()
        const bR = eyeR.getBoundingClientRect()
        const exL = bL.left + bL.width/2
        const eyL = bL.top + bL.height/2
        const exR = bR.left + bR.width/2
        const eyR = bR.top + bR.height/2

        const targets = [ {x:pointer.current.x - exL, y: pointer.current.y - eyL}, {x:pointer.current.x - exR, y: pointer.current.y - eyR} ]

        for(let e=0;e<2;e++){
          const t = targets[e]
          const dist = Math.sqrt(t.x*t.x + t.y*t.y) || 1
          const max = 6
          const nx = t.x / dist
          const ny = t.y / dist
          const tx = nx * Math.min(dist, max)
          const ty = ny * Math.min(dist, max)

          const cur = pupilPos.current[i][e]
          const lerp = (a,b,t)=> a + (b-a)*t
          cur.x = lerp(cur.x, tx, 0.18)
          cur.y = lerp(cur.y, ty, 0.18)

          const pup = e===0 ? pupL : pupR
          pup.style.transform = `translate(${cur.x}px, ${cur.y}px)`
        }
      }
      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return ()=>{
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  },[])

  const drones = [0,1,2]

  return (
    <div className="drones-corner" aria-hidden>
      {drones.map((_,i)=> (
        <div key={i} className={`drone-wrap drone-wrap-${i}`} style={{pointerEvents:'none'}}>
          <svg ref={el=> droneRefs.current[i]=el} className={`drone drone-${i}`} width="104" height="72" viewBox="0 0 104 72" xmlns="http://www.w3.org/2000/svg">
            <g className="drone-root" transform="translate(2,2)">
              {/* thin arms */}
              <g stroke="var(--drone-stroke, #e6e9ec)" strokeWidth="2.2" strokeLinecap="round">
                <line x1="20" y1="18" x2="6" y2="6" />
                <line x1="84" y1="18" x2="98" y2="6" />
                <line x1="20" y1="54" x2="6" y2="66" />
                <line x1="84" y1="54" x2="98" y2="66" />
              </g>

              {/* rotors - soft rings with thin spinning blades */}
              <g className="rotor rotor-tl" transform="translate(6,6)">
                <circle r="8" fill="var(--drone-rotor, #eef2f4)" stroke="var(--drone-stroke, #e6e9ec)" strokeWidth="1" />
                <g className="blades">
                  <rect x="-14" y="-1" width="28" height="2" rx="1" fill="rgba(11,18,32,0.06)" opacity="0.9" />
                  <rect x="-1" y="-14" width="2" height="28" rx="1" fill="rgba(11,18,32,0.06)" opacity="0.9" />
                </g>
              </g>

              <g className="rotor rotor-tr" transform="translate(98,6)">
                <circle r="8" fill="var(--drone-rotor, #eef2f4)" stroke="var(--drone-stroke, #e6e9ec)" strokeWidth="1" />
                <g className="blades">
                  <rect x="-14" y="-1" width="28" height="2" rx="1" fill="rgba(11,18,32,0.06)" opacity="0.9" />
                  <rect x="-1" y="-14" width="2" height="28" rx="1" fill="rgba(11,18,32,0.06)" opacity="0.9" />
                </g>
              </g>

              <g className="rotor rotor-bl" transform="translate(6,66)">
                <circle r="8" fill="var(--drone-rotor, #eef2f4)" stroke="var(--drone-stroke, #e6e9ec)" strokeWidth="1" />
                <g className="blades">
                  <rect x="-14" y="-1" width="28" height="2" rx="1" fill="rgba(11,18,32,0.06)" opacity="0.9" />
                  <rect x="-1" y="-14" width="2" height="28" rx="1" fill="rgba(11,18,32,0.06)" opacity="0.9" />
                </g>
              </g>

              <g className="rotor rotor-br" transform="translate(98,66)">
                <circle r="8" fill="var(--drone-rotor, #eef2f4)" stroke="var(--drone-stroke, #e6e9ec)" strokeWidth="1" />
                <g className="blades">
                  <rect x="-14" y="-1" width="28" height="2" rx="1" fill="rgba(11,18,32,0.06)" opacity="0.9" />
                  <rect x="-1" y="-14" width="2" height="28" rx="1" fill="rgba(11,18,32,0.06)" opacity="0.9" />
                </g>
              </g>

              {/* body: more rounded, pale */}
              <g>
                <rect x="16" y="14" rx="16" ry="16" width="72" height="44" fill="var(--drone-fill, #f3f5f6)" stroke="var(--drone-stroke, #e6e9ec)" strokeWidth="1" />
                {/* small legs */}
                <rect x="36" y="56" width="6" height="6" rx="2" fill="var(--drone-stroke, #e6e9ec)" />
                <rect x="62" y="56" width="6" height="6" rx="2" fill="var(--drone-stroke, #e6e9ec)" />

                {/* camera/nose with eyes */}
                <g transform="translate(44,30)">
                  <rect x="-16" y="-10" width="32" height="20" rx="6" ry="6" fill="var(--drone-eye-box, #ffffff)" opacity="0.98" />
                  <g className="eyes">
                    <g className="eye-left" transform="translate(-7,0)">
                      <circle r="6" fill="#ffffff" />
                      <circle className="pupil-left" r="3" fill="#222" style={{transform:'translate(0px,0px)', transition:'transform .06s linear'}} />
                      <circle className="pupil-glint" cx="-1" cy="-1" r="0.9" fill="#fff" opacity="0.9" />
                    </g>
                    <g className="eye-right" transform="translate(7,0)">
                      <circle r="6" fill="#ffffff" />
                      <circle className="pupil-right" r="3" fill="#222" style={{transform:'translate(0px,0px)', transition:'transform .06s linear'}} />
                      <circle className="pupil-glint" cx="-1" cy="-1" r="0.9" fill="#fff" opacity="0.9" />
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>
      ))}
    </div>
  )
}
