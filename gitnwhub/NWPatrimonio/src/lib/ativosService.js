/**
 * Serviço para gerenciar ativos e confirmação de aceite
 */
import { supabase } from './supabase'
import { prepararDadosAuditoria } from './auditoria'
import { VERSAO_TERMO } from './termoResponsabilidade'

/**
 * Endpoint GET /meus-ativos-pendentes
 * Consulta itens vinculados ao usuário logado com status "Pendente"
 * 
 * @param {number} usuarioId - ID do usuário logado
 * @returns {Object} { success: boolean, data: Array, error: string }
 */
export async function getMeusAtivosPendentes(usuarioId) {
  try {
    if (!usuarioId) {
      return {
        success: false,
        error: 'ID do usuário não fornecido',
        data: []
      }
    }

    const { data, error } = await supabase
      .from('atribuicoes')
      .select(`
        id,
        ativo_id,
        usuario_id,
        data_entrega,
        status_aceite,
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
      .eq('status_aceite', 'PENDENTE')
      .order('data_entrega', { ascending: true })

    if (error) {
      console.error('Erro ao buscar ativos pendentes:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }

    return {
      success: true,
      data: data || [],
      error: null
    }
  } catch (err) {
    console.error('Erro inesperado ao buscar ativos pendentes:', err)
    return {
      success: false,
      error: err.message || 'Erro inesperado',
      data: []
    }
  }
}

/**
 * Endpoint POST /confirmar-aceite
 * Recebe os IDs dos ativos, valida propriedade, atualiza status e registra auditoria
 * 
 * @param {Array<number>} atribuicoesIds - Array com IDs das atribuições a confirmar
 * @param {number} usuarioId - ID do usuário logado
 * @returns {Object} { success: boolean, message: string, error: string, details: Object }
 */
export async function confirmarAceite(atribuicoesIds, usuarioId) {
  try {
    // Validação de entrada
    if (!atribuicoesIds || !Array.isArray(atribuicoesIds) || atribuicoesIds.length === 0) {
      return {
        success: false,
        error: 'IDs das atribuições não fornecidos ou inválidos',
        details: { atribuicoesProcessadas: 0 }
      }
    }

    if (!usuarioId) {
      return {
        success: false,
        error: 'ID do usuário não fornecido',
        details: { atribuicoesProcessadas: 0 }
      }
    }

    // 1. VALIDAR SE OS ATIVOS REALMENTE PERTENCEM AO USUÁRIO
    const validacao = await validarPropriedadeAtivos(atribuicoesIds, usuarioId)
    
    if (!validacao.success) {
      return {
        success: false,
        error: validacao.error,
        details: validacao.details
      }
    }

    // 2. PREPARAR DADOS DE AUDITORIA
    const dadosAuditoria = await prepararDadosAuditoria(usuarioId)
    const dataAceite = new Date().toISOString()

    // 3. ATUALIZAR STATUS NA TABELA ATRIBUICOES
    const resultadosAtualizacao = []
    let sucessos = 0
    let falhas = 0

    for (const atribuicaoId of atribuicoesIds) {
      try {
        const { data, error } = await supabase
          .from('atribuicoes')
          .update({
            status_aceite: 'ACEITO',
            data_aceite: dataAceite,
            ip_usuario: dadosAuditoria.ip_usuario,
            user_agent: dadosAuditoria.user_agent,
            versao_termo: VERSAO_TERMO
          })
          .eq('id', atribuicaoId)
          .eq('usuario_id', usuarioId) // Garantir que pertence ao usuário
          .select()

        if (error) {
          falhas++
          resultadosAtualizacao.push({
            atribuicaoId,
            success: false,
            error: error.message
          })
        } else {
          sucessos++
          resultadosAtualizacao.push({
            atribuicaoId,
            success: true,
            data: data
          })
          
          // 4. LOG DE AUDITORIA JÁ ESTÁ GRAVADO NA TABELA ATRIBUIÇÕES
          // Os campos ip_usuario, user_agent, data_aceite e versao_termo
          // servem como registro de auditoria completo
        }
      } catch (err) {
        falhas++
        resultadosAtualizacao.push({
          atribuicaoId,
          success: false,
          error: err.message
        })
      }
    }

    // Retornar resultado
    if (falhas === 0) {
      return {
        success: true,
        message: `${sucessos} ativo(s) aceito(s) com sucesso`,
        details: {
          atribuicoesProcessadas: sucessos,
          resultados: resultadosAtualizacao
        }
      }
    } else if (sucessos > 0) {
      return {
        success: true,
        message: `${sucessos} ativo(s) aceito(s), ${falhas} com erro`,
        warning: `Algumas atribuições não puderam ser processadas`,
        details: {
          atribuicoesProcessadas: sucessos,
          atribuicoesFalhas: falhas,
          resultados: resultadosAtualizacao
        }
      }
    } else {
      return {
        success: false,
        error: 'Nenhuma atribuição pôde ser processada',
        details: {
          atribuicoesProcessadas: 0,
          atribuicoesFalhas: falhas,
          resultados: resultadosAtualizacao
        }
      }
    }

  } catch (err) {
    console.error('Erro inesperado ao confirmar aceite:', err)
    return {
      success: false,
      error: err.message || 'Erro inesperado ao processar aceite',
      details: { atribuicoesProcessadas: 0 }
    }
  }
}

/**
 * VALIDAR SE O ATIVO REALMENTE PERTENCE AO USUÁRIO
 * Garante que o usuário só pode aceitar ativos que foram atribuídos a ele
 * 
 * @param {Array<number>} atribuicoesIds - Array com IDs das atribuições
 * @param {number} usuarioId - ID do usuário logado
 * @returns {Object} { success: boolean, error: string, details: Object }
 */
async function validarPropriedadeAtivos(atribuicoesIds, usuarioId) {
  try {
    const { data, error } = await supabase
      .from('atribuicoes')
      .select('id, usuario_id, status_aceite, ativo_id')
      .in('id', atribuicoesIds)

    if (error) {
      return {
        success: false,
        error: 'Erro ao validar propriedade dos ativos',
        details: { supabaseError: error.message }
      }
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'Nenhuma atribuição encontrada com os IDs fornecidos',
        details: { idsRecebidos: atribuicoesIds }
      }
    }

    // Validar cada atribuição
    const idsNaoEncontrados = atribuicoesIds.filter(
      id => !data.some(attr => attr.id === id)
    )

    const atribuicoesNaoPertencem = data.filter(
      attr => attr.usuario_id !== usuarioId
    )

    const atribuicoesJaAceitas = data.filter(
      attr => attr.status_aceite !== 'PENDENTE'
    )

    // Verificar se há problemas
    if (idsNaoEncontrados.length > 0) {
      return {
        success: false,
        error: 'Algumas atribuições não foram encontradas',
        details: {
          idsNaoEncontrados,
          totalNaoEncontrados: idsNaoEncontrados.length
        }
      }
    }

    if (atribuicoesNaoPertencem.length > 0) {
      return {
        success: false,
        error: 'Você não tem permissão para aceitar estes ativos',
        details: {
          mensagemSeguranca: 'Tentativa de aceitar ativos de outro usuário',
          atribuicoesNegadas: atribuicoesNaoPertencem.map(a => a.id),
          totalNegadas: atribuicoesNaoPertencem.length
        }
      }
    }

    if (atribuicoesJaAceitas.length > 0) {
      return {
        success: false,
        error: 'Alguns ativos já foram aceitos ou recusados',
        details: {
          atribuicoesJaProcessadas: atribuicoesJaAceitas.map(a => ({
            id: a.id,
            status: a.status_aceite
          })),
          totalJaProcessadas: atribuicoesJaAceitas.length
        }
      }
    }

    // Tudo OK
    return {
      success: true,
      details: {
        atribuicoesValidadas: data.length,
        message: 'Todas as atribuições são válidas e pertencem ao usuário'
      }
    }

  } catch (err) {
    console.error('Erro ao validar propriedade:', err)
    return {
      success: false,
      error: err.message || 'Erro inesperado na validação',
      details: {}
    }
  }
}

/**
 * NOTA: LOG DE AUDITORIA
 * 
 * Os dados de auditoria (IP, User Agent, Data/Hora) já são gravados
 * diretamente na tabela 'atribuicoes' nos campos:
 * - ip_usuario: IP do usuário que aceitou
 * - user_agent: Navegador/dispositivo usado
 * - data_aceite: Data e hora do aceite
 * - versao_termo: Versão do termo aceito
 * 
 * Isso elimina a necessidade de uma tabela separada de auditoria
 * para este caso de uso específico.
 */

/**
 * Obter histórico de aceites de um usuário
 * 
 * @param {number} usuarioId - ID do usuário
 * @returns {Object} { success: boolean, data: Array, error: string }
 */
export async function getHistoricoAceites(usuarioId) {
  try {
    const { data, error } = await supabase
      .from('atribuicoes')
      .select(`
        id,
        status_aceite,
        data_entrega,
        data_aceite,
        ip_usuario,
        versao_termo,
        ativo:ativos(
          id,
          num_etiqueta,
          tipo,
          modelo,
          serial_number
        )
      `)
      .eq('usuario_id', usuarioId)
      .eq('status_aceite', 'ACEITO')
      .order('data_aceite', { ascending: false })

    if (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }

    return {
      success: true,
      data: data || [],
      error: null
    }
  } catch (err) {
    return {
      success: false,
      error: err.message,
      data: []
    }
  }
}
