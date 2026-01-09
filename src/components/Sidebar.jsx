import React, {useState, useRef, useEffect} from 'react'
import logo from '../images/flavicon2.png'
import { NavLink } from 'react-router-dom'
// Floating drones removed per request

const apps = [
  {id:1,name:'Comercial',path:'/dashboard'},
  {id:2,name:'Licitação',path:'/operacoes'},
  {id:3,name:'Financeiro',path:'/frotas'},
  {id:4,name:'RH',path:'/telemetria'},
  {id:5,name:'Relatórios',path:'/relatorios'},
  {id:6,name:'Desenvolvimento',path:'/configuracoes'},
]

export default function Sidebar({collapsed=false,onToggle,onOpenTheme}){
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(()=>{
    function onDocClick(e){
      if(profileRef.current && !profileRef.current.contains(e.target)){
        setProfileOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return ()=> document.removeEventListener('click', onDocClick)
  },[])

  const user = {name: 'João Silva', avatar: null}

  return (
    <aside className="sidebar">
      <div className="brand">
        <NavLink to="/" className="brand-link" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none'}}>
          <div className="icon-box logo" role="button" tabIndex={0} style={{cursor:'pointer'}}>
            <img src={logo} alt="NWDrones" className="logo-img no-border" />
          </div>
          <div style={{display: collapsed ? 'none' : 'block'}}>
            <div className="company">NWDrones</div>
            <div style={{fontSize:12,color:'var(--muted)'}}>Portal de Aplicativos</div>
          </div>
        </NavLink>
      </div>

      <nav className="menu" aria-label="apps">
        {apps.map(a=> (
          <NavLink key={a.id} to={a.path} className={({isActive})=>"menu-btn" + (isActive? ' active':'' )} title={a.name}>
            <div style={{flex:1,display: collapsed ? 'none' : 'block', paddingLeft:8}}>{a.name}</div>
          </NavLink>
        ))}
      </nav>

      {/* collapse removed - sidebar is fixed open */}

      <div className="profile" ref={profileRef}>
        <button className="profile-btn" onClick={()=>setProfileOpen(s=>!s)}>
          <div className="icon-box avatar">{user.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
          {!collapsed && <div className="profile-name">{user.name}</div>}
        </button>

        {profileOpen && (
          <div className="profile-menu">
            <button className="pm-item">Perfil</button>
            <button className="pm-item">Visualização</button>
            <button className="pm-item" onClick={()=>{ if(onOpenTheme) onOpenTheme(); setProfileOpen(false) }}>Tema</button>
            <button className="pm-item">Configurações</button>
            <div className="pm-divider" />
            <button className="pm-item logout">Sair</button>
          </div>
        )}
      </div>
      {/* Drones removed */}
    </aside>
  )
}
