import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { prepararDadosAuditoria } from '../lib/auditoria'
import { getMeusAtivosPendentes } from '../lib/ativosService'
import ModalAtivosP from '../components/ModalAtivosP'
import { VERSAO_TERMO } from '../lib/termoResponsabilidade'
import './Patrimonio.css'

export default function Patrimonio() {
  const [atribuicoes, setAtribuicoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [usuarioId, setUsuarioId] = useState(1) // TODO: Obter do contexto de usuário autenticado
  const [filtro, setFiltro] = useState('TODOS') // TODOS, PENDENTE, ACEITO
  const [modalTransferencia, setModalTransferencia] = useState(false)
  const [ativoSelecionado, setAtivoSelecionado] = useState(null)
  const [usuariosDisponveis, setUsuariosDisponveis] = useState([])
  const [usuarioDestino, setUsuarioDestino] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [modalTermosAberto, setModalTermosAberto] = useState(false)
  const [ativosParaAceitar, setAtivosParaAceitar] = useState([])

  useEffect(() => {
    carregarAtribuicoes()
    carregarUsuarios()
    // Verificar se há ativos pendentes para aceitar
    carregarAtivosPendentes()
  }, [])

  const carregarAtribuicoes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('atribuicoes')
        .select(`
          id,
          status_aceite,
          data_entrega,
          data_devolucao,
          data_aceite,
          ip_usuario,
          ativo:ativos(
            id,
            num_etiqueta,
            tipo,
            modelo,
            serial_number,
            status_atual
          )
        `)
        .eq('usuario_id', usuarioId)
        .order('data_entrega', { ascending: false })

      if (error) throw error
      setAtribuicoes(data || [])
      setErro(null)
    } catch (err) {
      console.error('Erro ao carregar atribuições:', err)
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  const carregarUsuarios = async () => {
    try {
      // TODO: Substituir por query real de usuários quando a tabela estiver pronta
      setUsuariosDisponveis([
        { id: 1, name: 'João Silva' },
        { id: 2, name: 'Maria Santos' },
        { id: 3, name: 'Pedro Costa' },
        { id: 4, name: 'Ana Lima' },
      ])
    } catch (err) {
      console.error('Erro ao carregar usuários:', err)
    }
  }

  const carregarAtivosPendentes = async () => {
    try {
      // Usar o novo serviço para buscar ativos pendentes
      const resultado = await getMeusAtivosPendentes(usuarioId)

      if (!resultado.success) {
        console.error('Erro ao carregar ativos pendentes:', resultado.error)
        return
      }
      
      if (resultado.data && resultado.data.length > 0) {
        setAtivosParaAceitar(resultado.data)
        setModalTermosAberto(true)
      }
    } catch (err) {
      console.error('Erro ao carregar ativos pendentes:', err)
    }
  }

  const handleAceitarComTermos = async () => {
    // Fechar modal e recarregar (o ModalAtivosP já gerencia o aceite)
    setModalTermosAberto(false)
    setAtivosParaAceitar([])
    carregarAtribuicoes()
  }

  const handleTransferencia = async () => {
    if (!usuarioDestino || !ativoSelecionado) {
      setErro('Selecione um usuário para transferência')
      return
    }

    try {
      const dadosAuditoria = await prepararDadosAuditoria(usuarioId)

      // Criar registro de transferência
      const { error } = await supabase
        .from('atribuicoes')
        .insert({
          ativo_id: ativoSelecionado.ativo.id,
          usuario_id: usuarioDestino,
          status_aceite: 'PENDENTE',
          data_entrega: new Date().toISOString(),
          ip_usuario: dadosAuditoria.ip_usuario,
          user_agent: dadosAuditoria.user_agent,
        })

      if (error) throw error

      // Atualizar o status do ativo anterior se necessário
      await supabase
        .from('atribuicoes')
        .update({ data_devolucao: new Date().toISOString() })
        .eq('id', ativoSelecionado.id)

      setModalTransferencia(false)
      setAtivoSelecionado(null)
      setUsuarioDestino(null)
      setMotivo('')
      carregarAtribuicoes()
    } catch (err) {
      console.error('Erro ao transferir:', err)
      setErro(err.message)
    }
  }

  const handleAceitarItem = (ativo) => {
    setAtivosParaAceitar([ativo])
    setModalTermosAberto(true)
  }

  const atribuicoesFiltradas = atribuicoes.filter(attr => {
    if (filtro === 'TODOS') return true
    return attr.status_aceite === filtro
  })

  const statusBadge = (status) => {
    const configs = {
      PENDENTE: { cor: '#ff6b6b', icon: '⏳', texto: 'Pendente' },
      ACEITO: { cor: '#51cf66', icon: '✓', texto: 'Aceito' },
      RECUSADO: { cor: '#ffa94d', icon: '✗', texto: 'Recusado' },
    }
    return configs[status] || configs.PENDENTE
  }

  if (loading) {
    return (
      <div className="patrimonio-container">
        <div style={{padding: '20px', textAlign: 'center'}}>
          <p>⏳ Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="patrimonio-container">
        <div style={{padding: '20px', textAlign: 'center', color: '#ff6b6b'}}>
          <p>❌ Erro ao carregar: {erro}</p>
          <button onClick={() => carregarAtribuicoes()} style={{marginTop: '10px', padding: '8px 16px', cursor: 'pointer'}}>
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="patrimonio-container">
      <div className="patrimonio-header">
        <h1>📦 Meu Patrimônio</h1>
        <p>Gerencie seus ativos, aceite novos itens e transfira responsabilidades</p>
      </div>

      <div className="patrimonio-filtros">
        <button
          className={`filtro-btn ${filtro === 'TODOS' ? 'active' : ''}`}
          onClick={() => setFiltro('TODOS')}
        >
          Todos ({atribuicoes.length})
        </button>
        <button
          className={`filtro-btn ${filtro === 'PENDENTE' ? 'active' : ''}`}
          onClick={() => setFiltro('PENDENTE')}
        >
          Pendentes ({atribuicoes.filter(a => a.status_aceite === 'PENDENTE').length})
        </button>
        <button
          className={`filtro-btn ${filtro === 'ACEITO' ? 'active' : ''}`}
          onClick={() => setFiltro('ACEITO')}
        >
          Aceitos ({atribuicoes.filter(a => a.status_aceite === 'ACEITO').length})
        </button>
      </div>

      {erro && (
        <div className="patrimonio-erro">
          ❌ {erro}
        </div>
      )}

      <div className="patrimonio-lista">
        {atribuicoesFiltradas.length === 0 ? (
          <div className="patrimonio-vazio">
            <p>Nenhum ativo encontrado</p>
          </div>
        ) : (
          atribuicoesFiltradas.map(attr => {
            const badge = statusBadge(attr.status_aceite)
            return (
              <div key={attr.id} className="patrimonio-card">
                <div className="card-header">
                  <div className="card-titulo">
                    <h3>{attr.ativo.tipo}</h3>
                    <p>{attr.ativo.modelo}</p>
                  </div>
                  <div
                    className="card-status"
                    style={{ backgroundColor: badge.cor }}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.texto}</span>
                  </div>
                </div>

                <div className="card-details">
                  <div className="detail-item">
                    <span className="label">TAG:</span>
                    <span className="value">{attr.ativo.num_etiqueta}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Serial:</span>
                    <span className="value">{attr.ativo.serial_number || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Entregue em:</span>
                    <span className="value">
                      {new Date(attr.data_entrega).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {attr.status_aceite === 'ACEITO' && attr.data_aceite && (
                    <div className="detail-item">
                      <span className="label">Aceito em:</span>
                      <span className="value">
                        {new Date(attr.data_aceite).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  {attr.status_aceite === 'PENDENTE' && (
                    <button 
                      className="btn-pequeno btn-aceitar"
                      onClick={() => handleAceitarItem(attr)}
                    >
                      ✓ Aceitar
                    </button>
                  )}
                  <button
                    className="btn-pequeno btn-transferir"
                    onClick={() => {
                      setAtivoSelecionado(attr)
                      setModalTransferencia(true)
                    }}
                  >
                    ↗ Transferir
                  </button>
                  {attr.status_aceite === 'ACEITO' && !attr.data_devolucao && (
                    <button className="btn-pequeno btn-devolver">
                      ← Devolver
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal de Transferência */}
      {modalTransferencia && ativoSelecionado && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Transferir Ativo</h2>
            <p>
              Transferindo: <strong>{ativoSelecionado.ativo.tipo}</strong> (
              {ativoSelecionado.ativo.num_etiqueta})
            </p>

            <div className="form-group">
              <label>Transferir para:</label>
              <select
                value={usuarioDestino || ''}
                onChange={(e) => setUsuarioDestino(Number(e.target.value))}
              >
                <option value="">Selecione um usuário</option>
                {usuariosDisponveis
                  .filter(u => u.id !== usuarioId)
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>Motivo da transferência (opcional):</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Mudança de departamento, Empréstimo, etc"
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancelar"
                onClick={() => {
                  setModalTransferencia(false)
                  setAtivoSelecionado(null)
                  setUsuarioDestino(null)
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-confirmar"
                onClick={handleTransferencia}
              >
                Transferir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Termos de Responsabilidade */}
      <ModalAtivosP
        ativos={ativosParaAceitar}
        usuarioId={usuarioId}
        onAceitar={handleAceitarComTermos}
        isOpen={modalTermosAberto}
      />
    </div>
  )
}
