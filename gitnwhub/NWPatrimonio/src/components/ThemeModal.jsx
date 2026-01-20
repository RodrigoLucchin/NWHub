import React from 'react'

export default function ThemeModal({open, onClose, onSelect, current}){
  if(!open) return null
  return (
    <div className="theme-modal-backdrop" onClick={onClose}>
      <div className="theme-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}>
        <h3>Escolher Tema</h3>
        <p className="theme-modal-sub">Selecione o esquema de cores que prefere para a interface.</p>
        <div className="theme-options">
          <button className={"theme-option" + (current==='dark'? ' active':'')} onClick={()=>onSelect('dark')}>
            <div className="theme-option-label">Escuro</div>
            <div className="theme-option-desc">Contraste alto — ideal para ambientes com pouca luz</div>
          </button>
          <button className={"theme-option" + (current==='light'? ' active':'')} onClick={()=>onSelect('light')}>
            <div className="theme-option-label">Claro</div>
            <div className="theme-option-desc">Tons neutros e fundo claro — ótima legibilidade</div>
          </button>
        </div>
        <div style={{textAlign:'right',marginTop:14}}>
          <button className="btn btn-primary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}
