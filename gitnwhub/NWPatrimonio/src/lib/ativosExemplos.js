/**
 * EXEMPLOS DE USO DAS APIs DE ATIVOS
 * 
 * Este arquivo contém exemplos práticos de como usar as funções
 * do ativosService.js em diferentes cenários.
 */

import { 
  getMeusAtivosPendentes, 
  confirmarAceite, 
  getHistoricoAceites 
} from './ativosService'

// ============================================
// EXEMPLO 1: Buscar e Exibir Ativos Pendentes
// ============================================

export async function exemploListarPendentes() {
  const usuarioId = 1 // ID do usuário logado

  console.log('🔍 Buscando ativos pendentes...')
  
  const resultado = await getMeusAtivosPendentes(usuarioId)

  if (resultado.success) {
    console.log('✅ Ativos encontrados:', resultado.data.length)
    
    resultado.data.forEach((atribuicao, index) => {
      console.log(`\n${index + 1}. Ativo:`)
      console.log(`   - ID Atribuição: ${atribuicao.id}`)
      console.log(`   - Tipo: ${atribuicao.ativo.tipo}`)
      console.log(`   - Modelo: ${atribuicao.ativo.modelo}`)
      console.log(`   - Etiqueta: ${atribuicao.ativo.num_etiqueta}`)
      console.log(`   - Data Entrega: ${new Date(atribuicao.data_entrega).toLocaleDateString('pt-BR')}`)
    })
  } else {
    console.error('❌ Erro ao buscar:', resultado.error)
  }

  return resultado
}

// ============================================
// EXEMPLO 2: Confirmar Aceite de Múltiplos Ativos
// ============================================

export async function exemploConfirmarMultiplos() {
  const usuarioId = 1
  const atribuicoesIds = [3, 5, 7] // IDs das atribuições a aceitar

  console.log('📝 Confirmando aceite de', atribuicoesIds.length, 'ativos...')
  
  const resultado = await confirmarAceite(atribuicoesIds, usuarioId)

  if (resultado.success) {
    console.log('✅', resultado.message)
    console.log('📊 Detalhes:', resultado.details)
  } else {
    console.error('❌ Erro:', resultado.error)
    console.error('📊 Detalhes:', resultado.details)
  }

  return resultado
}

// ============================================
// EXEMPLO 3: Confirmar Aceite de Um Único Ativo
// ============================================

export async function exemploConfirmarUnico(atribuicaoId) {
  const usuarioId = 1
  const atribuicoesIds = [atribuicaoId] // Array com apenas um ID

  console.log('📝 Confirmando aceite do ativo', atribuicaoId, '...')
  
  const resultado = await confirmarAceite(atribuicoesIds, usuarioId)

  if (resultado.success) {
    console.log('✅ Ativo aceito com sucesso!')
  } else {
    console.error('❌ Erro ao aceitar:', resultado.error)
  }

  return resultado
}

// ============================================
// EXEMPLO 4: Fluxo Completo (Listar + Aceitar)
// ============================================

export async function exemploFluxoCompleto() {
  const usuarioId = 1

  console.log('🚀 Iniciando fluxo completo...\n')

  // Passo 1: Buscar ativos pendentes
  console.log('PASSO 1: Buscando ativos pendentes')
  const pendentes = await getMeusAtivosPendentes(usuarioId)

  if (!pendentes.success) {
    console.error('❌ Erro ao buscar pendentes:', pendentes.error)
    return
  }

  if (pendentes.data.length === 0) {
    console.log('✅ Nenhum ativo pendente para aceitar!')
    return
  }

  console.log(`✅ Encontrados ${pendentes.data.length} ativos pendentes\n`)

  // Passo 2: Exibir lista
  console.log('PASSO 2: Lista de ativos')
  pendentes.data.forEach((atribuicao, index) => {
    console.log(`${index + 1}. ${atribuicao.ativo.tipo} - ${atribuicao.ativo.modelo}`)
  })

  // Passo 3: Confirmar aceite de todos
  console.log('\nPASSO 3: Confirmando aceite de todos os ativos')
  const idsParaAceitar = pendentes.data.map(a => a.id)
  const resultadoAceite = await confirmarAceite(idsParaAceitar, usuarioId)

  if (resultadoAceite.success) {
    console.log('✅', resultadoAceite.message)
  } else {
    console.error('❌ Erro no aceite:', resultadoAceite.error)
  }

  // Passo 4: Verificar histórico
  console.log('\nPASSO 4: Verificando histórico de aceites')
  const historico = await getHistoricoAceites(usuarioId)

  if (historico.success) {
    console.log(`✅ Total de ativos aceitos: ${historico.data.length}`)
    console.log('Últimos 3 aceites:')
    historico.data.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.ativo.tipo} - Aceito em ${new Date(item.data_aceite).toLocaleDateString('pt-BR')}`)
    })
  }

  console.log('\n🎉 Fluxo completo finalizado!')
}

// ============================================
// EXEMPLO 5: Tratamento de Erros Específicos
// ============================================

export async function exemploTratamentoErros() {
  const usuarioId = 1
  const atribuicoesIds = [999, 998] // IDs que provavelmente não existem

  console.log('🧪 Testando tratamento de erros...')
  
  const resultado = await confirmarAceite(atribuicoesIds, usuarioId)

  if (!resultado.success) {
    // Identificar tipo de erro
    if (resultado.error.includes('não foram encontradas')) {
      console.warn('⚠️ Atribuições não encontradas no banco de dados')
      console.log('Sugestão: Verificar se os IDs estão corretos')
    } 
    else if (resultado.error.includes('não tem permissão')) {
      console.error('🚫 Tentativa de aceitar ativos de outro usuário!')
      console.log('Detalhes de segurança:', resultado.details)
    }
    else if (resultado.error.includes('já foram aceitos')) {
      console.info('ℹ️ Ativos já foram processados anteriormente')
      console.log('Atribuições já processadas:', resultado.details.atribuicoesJaProcessadas)
    }
    else {
      console.error('❌ Erro desconhecido:', resultado.error)
    }
  }

  return resultado
}

// ============================================
// EXEMPLO 6: Uso em Componente React
// ============================================

export function exemploComponenteReact() {
  return `
import React, { useState, useEffect } from 'react'
import { getMeusAtivosPendentes, confirmarAceite } from '../lib/ativosService'

export default function MeusAtivos() {
  const [pendentes, setPendentes] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const usuarioId = 1 // Obter do contexto de autenticação

  useEffect(() => {
    carregarPendentes()
  }, [])

  const carregarPendentes = async () => {
    setLoading(true)
    const resultado = await getMeusAtivosPendentes(usuarioId)
    
    if (resultado.success) {
      setPendentes(resultado.data)
    } else {
      setErro(resultado.error)
    }
    setLoading(false)
  }

  const handleAceitarTodos = async () => {
    const ids = pendentes.map(p => p.id)
    const resultado = await confirmarAceite(ids, usuarioId)
    
    if (resultado.success) {
      alert(resultado.message)
      carregarPendentes() // Recarregar lista
    } else {
      alert('Erro: ' + resultado.error)
    }
  }

  if (loading) return <div>Carregando...</div>
  if (erro) return <div>Erro: {erro}</div>

  return (
    <div>
      <h2>Ativos Pendentes ({pendentes.length})</h2>
      
      {pendentes.map(item => (
        <div key={item.id}>
          <strong>{item.ativo.tipo}</strong> - {item.ativo.modelo}
        </div>
      ))}

      {pendentes.length > 0 && (
        <button onClick={handleAceitarTodos}>
          Aceitar Todos
        </button>
      )}
    </div>
  )
}
`
}

// ============================================
// EXEMPLO 7: Uso com Async/Await e Try/Catch
// ============================================

export async function exemploComTryCatch() {
  const usuarioId = 1
  const atribuicoesIds = [3, 5]

  try {
    console.log('🔄 Processando aceite...')
    
    const resultado = await confirmarAceite(atribuicoesIds, usuarioId)
    
    if (!resultado.success) {
      throw new Error(resultado.error)
    }

    console.log('✅ Sucesso!', resultado.message)
    return resultado

  } catch (error) {
    console.error('❌ Erro capturado:', error.message)
    
    // Aqui você pode:
    // - Mostrar notificação para o usuário
    // - Enviar erro para sistema de monitoramento (Sentry, etc)
    // - Registrar em log local
    // - Tentar novamente
    
    throw error // Re-lançar se necessário
  }
}

// ============================================
// EXEMPLO 8: Validação Antes de Enviar
// ============================================

export async function exemploComValidacao(atribuicoesIds, usuarioId) {
  // Validações no frontend antes de enviar
  if (!usuarioId) {
    console.error('❌ Usuário não está logado')
    return { success: false, error: 'Usuário não autenticado' }
  }

  if (!atribuicoesIds || atribuicoesIds.length === 0) {
    console.error('❌ Nenhuma atribuição selecionada')
    return { success: false, error: 'Selecione pelo menos um ativo' }
  }

  if (atribuicoesIds.some(id => !Number.isInteger(id) || id <= 0)) {
    console.error('❌ IDs inválidos')
    return { success: false, error: 'IDs devem ser números inteiros positivos' }
  }

  // Se passou nas validações, enviar
  console.log('✅ Validações passaram, enviando...')
  return await confirmarAceite(atribuicoesIds, usuarioId)
}

// ============================================
// EXEMPLO 9: Aceitar com Confirmação do Usuário
// ============================================

export async function exemploComConfirmacao(atribuicoesIds, usuarioId) {
  // Buscar detalhes dos ativos para mostrar ao usuário
  const pendentes = await getMeusAtivosPendentes(usuarioId)
  
  if (!pendentes.success) {
    console.error('Erro ao buscar ativos:', pendentes.error)
    return
  }

  // Filtrar apenas os que o usuário quer aceitar
  const ativosParaAceitar = pendentes.data.filter(p => 
    atribuicoesIds.includes(p.id)
  )

  // Montar mensagem de confirmação
  const mensagem = `Você está prestes a aceitar:\n\n` +
    ativosParaAceitar.map((a, i) => 
      `${i + 1}. ${a.ativo.tipo} - ${a.ativo.modelo}`
    ).join('\n') +
    `\n\nAo aceitar, você se responsabiliza por estes itens.`

  // Confirmar com usuário
  const confirmar = window.confirm(mensagem)

  if (!confirmar) {
    console.log('❌ Usuário cancelou o aceite')
    return { success: false, error: 'Cancelado pelo usuário' }
  }

  // Prosseguir com aceite
  console.log('✅ Usuário confirmou, processando...')
  return await confirmarAceite(atribuicoesIds, usuarioId)
}

// ============================================
// EXEMPLO 10: Monitoramento e Analytics
// ============================================

export async function exemploComAnalytics(atribuicoesIds, usuarioId) {
  const inicioProcessamento = Date.now()

  console.log('📊 [Analytics] Iniciando aceite de ativos')
  console.log('📊 [Analytics] Quantidade:', atribuicoesIds.length)
  console.log('📊 [Analytics] Usuário:', usuarioId)

  const resultado = await confirmarAceite(atribuicoesIds, usuarioId)

  const tempoProcessamento = Date.now() - inicioProcessamento

  console.log('📊 [Analytics] Tempo de processamento:', tempoProcessamento, 'ms')
  console.log('📊 [Analytics] Resultado:', resultado.success ? 'Sucesso' : 'Falha')

  if (resultado.success) {
    console.log('📊 [Analytics] Ativos processados:', resultado.details.atribuicoesProcessadas)
    
    // Aqui você poderia enviar para Google Analytics, Mixpanel, etc.
    // analytics.track('Ativos Aceitos', {
    //   quantidade: resultado.details.atribuicoesProcessadas,
    //   tempo: tempoProcessamento,
    //   usuario_id: usuarioId
    // })
  } else {
    console.log('📊 [Analytics] Erro:', resultado.error)
    
    // analytics.track('Erro ao Aceitar Ativos', {
    //   erro: resultado.error,
    //   usuario_id: usuarioId
    // })
  }

  return resultado
}

// ============================================
// Como executar os exemplos:
// ============================================
// 
// No console do navegador ou em um arquivo de teste:
// 
// import * as exemplos from './lib/ativosExemplos'
// 
// // Executar exemplo específico
// await exemplos.exemploListarPendentes()
// await exemplos.exemploConfirmarMultiplos()
// await exemplos.exemploFluxoCompleto()
// 
// ============================================
