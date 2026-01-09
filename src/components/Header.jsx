import React from 'react'
import logo from '../images/flavicon.png'
import discordIcon from '../assets/discord.png'
import instaIcon from '../assets/instagram.png'

export default function Header(){
  return (
    <header className="app-header">
      <div className="header-left">
        <nav className="top-tabs" aria-label="Top application tabs">
          <a className="top-tab" href="https://www.nwdrones.com.br/" target="_blank" rel="noopener noreferrer">Site</a>
          <a className="top-tab" href="https://crmnwdrones.bitrix24.com.br/" target="_blank" rel="noopener noreferrer">Bitrix</a>
          <a className="top-tab" href="https://portal.omie.com.br/meus-aplicativos" target="_blank" rel="noopener noreferrer">Omie</a>
          <a className="top-tab" href="https://panel-u.baselinker.com/" target="_blank" rel="noopener noreferrer">Baselinker</a>
          <a className="top-tab" href="https://www.nwdrones.com.br/nwd_admin" target="_blank" rel="noopener noreferrer">Magento</a>
          <a className="top-tab" href="https://bi.nwdrones.com.br/" target="_blank" rel="noopener noreferrer">Metabase</a>
          <a className="top-tab" href="https://web.marqponto.com.br/" target="_blank" rel="noopener noreferrer">Ponto Eletrônico</a>
        </nav>
      </div>

      <div className="header-right">
        <div className="social-icons">
          <a className="social-link" href="https://discord.gg/qhZ2hVpZQu" target="_blank" rel="noopener noreferrer" aria-label="Discord">
            <img src={discordIcon} alt="Discord" style={{width:20,height:20,display:'block'}} />
          </a>
          <a className="social-link" href="https://www.instagram.com/nwdrones.com.br/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <img src={instaIcon} alt="Instagram" style={{width:20,height:20,display:'block'}} />
          </a>
        </div>
      </div>
    </header>
  )
}
