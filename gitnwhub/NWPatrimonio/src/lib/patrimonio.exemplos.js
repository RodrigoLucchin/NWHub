// ============================================
// EXEMPLOS DE USO DO SISTEMA DE PATRIMÔNIO
// ============================================

// ============================================
// 1. CARREGAR ATRIBUIÇÕES DE UM USUÁRIO
// ============================================

import { supabase } from './lib/supabase'

async function carregarMinhasAtribuicoes(usuarioId) {
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

  if (error) {
    console.error('Erro ao carregar atribuições:', error)
    return []
  }

  return data || []
}

// ============================================
// 2. ACEITAR UM ATIVO COM AUDITORIA
// ============================================

import { prepararDadosAuditoria } from './lib/auditoria'
import { VERSAO_TERMO } from './lib/termoResponsabilidade'

async function aceitarAtivo(atribuicaoId, usuarioId) {
  // 1. Preparar dados de auditoria
  const dadosAuditoria = await prepararDadosAuditoria(usuarioId)

  // 2. Atualizar status
  const { error } = await supabase
    .from('atribuicoes')
    .update({
      status_aceite: 'ACEITO',
      data_aceite: new Date().toISOString(),
      ip_usuario: dadosAuditoria.ip_usuario,
      user_agent: dadosAuditoria.user_agent,
      versao_termo: VERSAO_TERMO
    })
    .eq('id', atribuicaoId)

  if (error) {
    console.error('Erro ao aceitar ativo:', error)
    throw error
  }

  console.log('✓ Ativo aceito com sucesso')
  return true
}

// ============================================
// 3. TRANSFERIR ATIVO PARA OUTRO USUÁRIO
// ============================================

async function transferirAtivo(
  ativoId,
  usuarioOrigemId,
  usuarioDestinoId,
  motivo = ''
) {
  // 1. Preparar dados de auditoria
  const dadosAuditoria = await prepararDadosAuditoria(usuarioOrigemId)

  // 2. Criar nova atribuição (pendente)
  const { data: novaAtribuicao, error: erroInsert } = await supabase
    .from('atribuicoes')
    .insert({
      ativo_id: ativoId,
      usuario_id: usuarioDestinoId,
      data_entrega: new Date().toISOString(),
      status_aceite: 'PENDENTE',
      ip_usuario: dadosAuditoria.ip_usuario,
      user_agent: dadosAuditoria.user_agent,
      versao_termo: VERSAO_TERMO
    })
    .select()

  if (erroInsert) {
    console.error('Erro ao criar transferência:', erroInsert)
    throw erroInsert
  }

  // 3. Marcar devolução na atribuição anterior
  const { error: erroUpdate } = await supabase
    .from('atribuicoes')
    .update({ data_devolucao: new Date().toISOString() })
    .eq('ativo_id', ativoId)
    .eq('usuario_id', usuarioOrigemId)
    .eq('status_aceite', 'ACEITO')

  if (erroUpdate) {
    console.error('Erro ao marcar devolução:', erroUpdate)
  }

  console.log(`✓ Ativo transferido para usuário ${usuarioDestinoId}`)
  return novaAtribuicao
}

// ============================================
// 4. OBTER RELATÓRIO DE AUDITORIA
// ============================================

async function obterRelatorioAuditoria(ativoId) {
  const { data, error } = await supabase
    .from('atribuicoes')
    .select(`
      id,
      usuario_id,
      data_entrega,
      data_devolucao,
      data_aceite,
      status_aceite,
      ip_usuario,
      user_agent,
      versao_termo,
      ativo:ativos(
        num_etiqueta,
        tipo,
        modelo,
        serial_number
      )
    `)
    .eq('ativo_id', ativoId)
    .order('data_entrega', { ascending: false })

  if (error) {
    console.error('Erro ao obter auditoria:', error)
    return []
  }

  // Formatar para exibição
  return (data || []).map(item => ({
    ...item,
    data_entrega_fmt: new Date(item.data_entrega).toLocaleString('pt-BR'),
    data_aceite_fmt: item.data_aceite ? new Date(item.data_aceite).toLocaleString('pt-BR') : '-',
    data_devolucao_fmt: item.data_devolucao ? new Date(item.data_devolucao).toLocaleString('pt-BR') : '-'
  }))
}

// ============================================
// 5. CONTAR ATIVOS PENDENTES
// ============================================

async function contarAtivosPendentes(usuarioId) {
  const { count, error } = await supabase
    .from('atribuicoes')
    .select('id', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)
    .eq('status_aceite', 'PENDENTE')

  if (error) {
    console.error('Erro ao contar pendentes:', error)
    return 0
  }

  return count || 0
}

// ============================================
// 6. OBTER ESTATÍSTICAS DE PATRIMÔNIO
// ============================================

async function obterEstatisticas() {
  // Total de ativos
  const { count: totalAtivos, error: e1 } = await supabase
    .from('ativos')
    .select('id', { count: 'exact', head: true })

  // Total em uso
  const { count: emUso, error: e2 } = await supabase
    .from('ativos')
    .select('id', { count: 'exact', head: true })
    .eq('status_atual', 'EM_USO')

  // Total de aceites pendentes
  const { count: aceitesPendentes, error: e3 } = await supabase
    .from('atribuicoes')
    .select('id', { count: 'exact', head: true })
    .eq('status_aceite', 'PENDENTE')

  // Total de transferências
  const { count: totalTransferencias, error: e4 } = await supabase
    .from('atribuicoes')
    .select('id', { count: 'exact', head: true })
    .not('data_devolucao', 'is', null)

  return {
    totalAtivos: totalAtivos || 0,
    emUso: emUso || 0,
    aceitesPendentes: aceitesPendentes || 0,
    totalTransferencias: totalTransferencias || 0
  }
}

// ============================================
// 7. EXPORTAR RELATÓRIO DE AUDITORIA (CSV)
// ============================================

async function exportarAuditoriaCSV() {
  const { data, error } = await supabase
    .from('atribuicoes')
    .select(`
      id,
      usuario_id,
      data_entrega,
      data_aceite,
      status_aceite,
      ip_usuario,
      user_agent,
      versao_termo,
      ativo:ativos(num_etiqueta, tipo, modelo)
    `)
    .order('data_entrega', { ascending: false })

  if (error) {
    console.error('Erro ao exportar:', error)
    return
  }

  // Criar CSV
  let csv = 'ID,Usuario,TAG,Tipo,Data Entrega,Data Aceite,Status,IP,Termo\n'
  
  data.forEach(item => {
    const linha = [
      item.id,
      item.usuario_id,
      item.ativo.num_etiqueta,
      item.ativo.tipo,
      item.data_entrega,
      item.data_aceite || '-',
      item.status_aceite,
      item.ip_usuario || '-',
      item.versao_termo || '-'
    ].join(',')
    csv += linha + '\n'
  })

  // Download
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv))
  element.setAttribute('download', `auditoria-${new Date().toISOString().split('T')[0]}.csv`)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

// ============================================
// 8. BUSCAR ATIVO POR TAG
// ============================================

async function buscarAtivoPorTag(tag) {
  const { data, error } = await supabase
    .from('ativos')
    .select(`
      *,
      atribuicoes:atribuicoes(
        id,
        usuario_id,
        status_aceite,
        data_entrega,
        data_aceite
      )
    `)
    .eq('num_etiqueta', tag)
    .single()

  if (error) {
    console.error('Ativo não encontrado:', error)
    return null
  }

  return data
}

// ============================================
// 9. LISTENER EM TEMPO REAL (SUPABASE REALTIME)
// ============================================

function ouvirMudan\u00e7asAtivosPendentes(usuarioId, callback) {
  return supabase
    .channel('atribuicoes-pendentes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'atribuicoes',
        filter: `usuario_id=eq.${usuarioId}`,
      },
      (payload) => {
        console.log('Mudança detectada:', payload)
        callback(payload)
      }
    )
    .subscribe()
}

// Uso:
// const subscription = ouvirMudan\u00e7asAtivosPendentes(1, (payload) => {
//   console.log('Nova atribuição:', payload)
// })

// ============================================
// 10. RECUSAR UM ATIVO
// ============================================

async function recusarAtivo(atribuicaoId, usuarioId, motivo) {
  const dadosAuditoria = await prepararDadosAuditoria(usuarioId)

  const { error } = await supabase
    .from('atribuicoes')
    .update({
      status_aceite: 'RECUSADO',
      data_aceite: new Date().toISOString(),
      ip_usuario: dadosAuditoria.ip_usuario,
      user_agent: dadosAuditoria.user_agent,
      versao_termo: VERSAO_TERMO
    })
    .eq('id', atribuicaoId)

  if (error) {
    console.error('Erro ao recusar:', error)
    throw error
  }

  // TODO: Notificar TI via email
  console.log(`✓ Ativo recusado. Motivo: ${motivo}`)
  return true
}

// ============================================
// EXPORTAR PARA USO EM OUTROS COMPONENTES
// ============================================

export {
  carregarMinhasAtribuicoes,
  aceitarAtivo,
  transferirAtivo,
  obterRelatorioAuditoria,
  contarAtivosPendentes,
  obterEstatisticas,
  exportarAuditoriaCSV,
  buscarAtivoPorTag,
  ouvirMudan\u00e7asAtivosPendentes,
  recusarAtivo
}
