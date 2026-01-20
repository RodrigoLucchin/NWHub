import React, { useState } from 'react'
import { confirmarAceite } from '../lib/ativosService'
import { TEXTO_TERMO, TEXTO_TERMO_RESUMO } from '../lib/termoResponsabilidade'
import './ModalAtivosP.css'

export default function ModalAtivosP({ ativos, usuarioId, onAceitar, isOpen }) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [termosLidos, setTermosLidos] = useState(false)
  const [aceitouTermo, setAceitouTermo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  if (!isOpen || !ativos || ativos.length === 0) return null

  const handleScroll = (e) => {
    const element = e.target
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight
    const clientHeight = element.clientHeight
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight
    setScrollPosition(scrollPercentage)
    if (scrollPercentage >= 0.95) {
      setTermosLidos(true)
    }
  }

  const handleAceitar = async () => {
    if (!aceitouTermo) {
      setErro('Você deve concordar com os termos para aceitar ativos')
      return
    }

    setLoading(true)
    setErro(null)

    try {
      // Obter IDs das atribuições
      const atribuicoesIds = ativos.map(ativo => ativo.id)
      
      // Usar o novo serviço para confirmar aceite
      const resultado = await confirmarAceite(atribuicoesIds, usuarioId)

      if (!resultado.success) {
        throw new Error(resultado.error || 'Erro ao aceitar ativos')
      }

      // Resetar estados antes de chamar callback
      setTermosLidos(false)
      setAceitouTermo(false)
      
      if (onAceitar) onAceitar()
    } catch (err) {
      console.error('Erro ao aceitar ativos:', err)
      setErro(err.message || 'Erro ao aceitar ativos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-ativos-backdrop">
      <div className="modal-ativos-container">
        <div className="modal-ativos-header">
          <h2>⚠️ CONFIRMAÇÃO DE ATIVOS PENDENTE</h2>
          <p>O departamento de TI atribuiu os seguintes itens a você:</p>
        </div>

        <div className="modal-ativos-content">
          <div className="ativos-lista">
            {ativos.map((attr, idx) => (
              <div key={attr.id} className="ativo-item">
                <span className="ativo-numero">{idx + 1}.</span>
                <div className="ativo-info">
                  <strong>{attr.ativo?.tipo || 'Ativo'}</strong>
                  <span className="ativo-modelo">
                    {attr.ativo?.modelo || 'Modelo desconhecido'}
                  </span>
                  <span className="ativo-tag">
                    TAG: {attr.ativo?.num_etiqueta || 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-ativos-divider"></div>

          <div className="termo-section">
            <h4>📋 TERMO DE RESPONSABILIDADE</h4>
            <div 
              className="termo-box"
              onScroll={handleScroll}
            >
              {TEXTO_TERMO}
            </div>
            <div className="termo-scroll-hint">
              {termosLidos ? '✓ Você atingiu o fim dos termos' : '👇 Scroll para visualizar os termos completos'}
            </div>
          </div>

          <label className="checkbox-termo">
            <input
              type="checkbox"
              checked={aceitouTermo}
              onChange={(e) => setAceitouTermo(e.target.checked)}
              disabled={!termosLidos}
            />
            <span>
              {TEXTO_TERMO_RESUMO}
            </span>
          </label>

          {erro && (
            <div className="modal-ativos-erro">
              ❌ {erro}
            </div>
          )}
        </div>

        <div className="modal-ativos-footer">
          <button
            className="btn-reportar"
            disabled={loading}
          >
            📞 REPORTAR ERRO
          </button>
          <button
            className="btn-aceitar"
            onClick={handleAceitar}
            disabled={!aceitouTermo || !termosLidos || loading}
          >
            {loading ? 'Processando...' : '✓ ACEITAR ITENS'}
          </button>
        </div>
      </div>
    </div>
  )
}
