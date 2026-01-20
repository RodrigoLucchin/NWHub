import React from 'react'
import logo from '../images/flavicon.png'

export default function Header(){
  return (
    <header className="app-header">
      <div className="header-left">
        <img src={logo} alt="NWDrones" style={{height: 32, marginRight: 16}} />
        <h1 style={{margin: 0, fontSize: 20, fontWeight: 600}}>Sistema de Gestão de Patrimônio</h1>
      </div>

      <div className="header-right">
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <span style={{fontSize: 12, color: '#666'}}>NWDrones Patrimônio</span>
        </div>
      </div>
    </header>
  )
}
