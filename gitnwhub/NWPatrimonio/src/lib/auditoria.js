/**
 * Utility functions for capturing audit data
 */

export async function obterIPUsuario() {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error('Error getting IP:', error)
    return 'UNKNOWN'
  }
}

export function obterUserAgent() {
  return navigator.userAgent
}

export function obterTimestamp() {
  return new Date().toISOString()
}

export function obterDataHoraLocal() {
  return new Date().toLocaleString('pt-BR')
}

/**
 * Prepare audit data for database recording
 */
export async function prepararDadosAuditoria(usuarioId) {
  return {
    ip_usuario: await obterIPUsuario(),
    user_agent: obterUserAgent(),
    timestamp: obterTimestamp(),
    usuario_id: usuarioId
  }
}
