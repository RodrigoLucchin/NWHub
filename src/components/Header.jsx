import React from 'react'

export default function Header(){
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-mark">NW</div>
        <div className="brand-name">NWDrones</div>

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
          <a className="social-link" href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 3L4 3C3 3 2.5 3.6 2.5 4.4L3.2 14.6C3.2 15.4 3.7 16 4.5 16.2C6 16.6 7 17.2 7.4 17.4C8 17.8 8.6 18.4 9.2 18.8C10.4 19.6 11.8 19.8 12 19.8C12.2 19.8 13.6 19.6 14.8 18.8C15.4 18.4 16 17.8 16.6 17.4C17 17.2 18 16.6 19.5 16.2C20.3 16 20.8 15.4 20.8 14.6L21.5 4.4C21.5 3.6 21 3 20 3Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a className="social-link" href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1"/><path d="M16 11.4C15.8 12.3 15.1 13 14.2 13.2C13.3 13.4 12.4 12.8 12 12C11.6 12.8 10.7 13.4 9.8 13.2C8.9 13 8.2 12.3 8 11.4C7.8 10.5 8.4 9.6 9.2 9.2C10 8.8 10.9 9 11.6 9.6C12.3 9 13.2 8.8 14 9.2C14.8 9.6 15.4 10.5 15.2 11.4Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </div>
    </header>
  )
}
