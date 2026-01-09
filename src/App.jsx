import React, {useState, useEffect} from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import WelcomeHub from './components/WelcomeHub'
import Header from './components/Header'
import ThemeModal from './components/ThemeModal'
import Dashboard from './pages/Dashboard'
import Operacoes from './pages/Operacoes'
import Frotas from './pages/Frotas'
import Telemetria from './pages/Telemetria'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'

export default function App(){
  const [collapsed, setCollapsed] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [theme, setTheme] = useState(() => (typeof window !== 'undefined' && localStorage.getItem('nw-theme')) || 'dark')

  useEffect(()=>{
    try{
      if(theme === 'light') document.documentElement.classList.add('theme-light')
      else document.documentElement.classList.remove('theme-light')
      localStorage.setItem('nw-theme', theme)
    }catch(e){}
  },[theme])

  return (
    <div className={`app-root ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={()=>setCollapsed(!collapsed)} onOpenTheme={()=>setThemeOpen(true)} />
      <div style={{flex:1,display:'flex',flexDirection:'column'}}>
        <Header />
        <ThemeModal open={themeOpen} onClose={()=>setThemeOpen(false)} onSelect={(t)=>{setTheme(t); setThemeOpen(false)}} current={theme} />
        <main className="main-area">
          <Routes>
            <Route path="/" element={<WelcomeHub userName="Usuário"/>} />
            <Route path="/dashboard" element={<Dashboard/>} />
            <Route path="/operacoes" element={<Operacoes/>} />
            <Route path="/frotas" element={<Frotas/>} />
            <Route path="/telemetria" element={<Telemetria/>} />
            <Route path="/relatorios" element={<Relatorios/>} />
            <Route path="/configuracoes" element={<Configuracoes/>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
