-- ============================================
-- CRIAR TABELA DE LOGS DE AUDITORIA
-- ============================================
-- Execute este script no Supabase SQL Editor
-- em: https://app.supabase.com/project/[SEU_PROJETO]/sql

-- Criar tabela tb_logs_auditoria
CREATE TABLE IF NOT EXISTS public.tb_logs_auditoria (
  id serial NOT NULL,
  atribuicao_id integer,
  usuario_id integer NOT NULL,
  acao character varying(50) NOT NULL,
  ip_usuario character varying(45) NOT NULL,
  user_agent text,
  timestamp timestamp without time zone NOT NULL,
  detalhes jsonb,
  data_criacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tb_logs_auditoria_pkey PRIMARY KEY (id),
  CONSTRAINT fk_atribuicao FOREIGN KEY (atribuicao_id) 
    REFERENCES public.atribuicoes(id) ON DELETE SET NULL,
  CONSTRAINT chk_acao CHECK (
    (acao)::text = ANY (
      ARRAY[
        'ACEITE_ATIVO'::character varying,
        'RECUSA_ATIVO'::character varying,
        'TRANSFERENCIA_ATIVO'::character varying,
        'DEVOLUCAO_ATIVO'::character varying,
        'VISUALIZACAO_TERMO'::character varying,
        'LOGIN'::character varying,
        'LOGOUT'::character varying,
        'ALTERACAO_DADOS'::character varying
      ]::text[]
    )
  )
) TABLESPACE pg_default;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_usuario_id 
  ON public.tb_logs_auditoria(usuario_id);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_atribuicao_id 
  ON public.tb_logs_auditoria(atribuicao_id);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_acao 
  ON public.tb_logs_auditoria(acao);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_timestamp 
  ON public.tb_logs_auditoria(timestamp);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_ip 
  ON public.tb_logs_auditoria(ip_usuario);

-- Adicionar comentários para documentação
COMMENT ON TABLE public.tb_logs_auditoria IS 'Tabela de auditoria para registrar todas as ações dos usuários no sistema';
COMMENT ON COLUMN public.tb_logs_auditoria.atribuicao_id IS 'ID da atribuição relacionada (se aplicável)';
COMMENT ON COLUMN public.tb_logs_auditoria.usuario_id IS 'ID do usuário que executou a ação';
COMMENT ON COLUMN public.tb_logs_auditoria.acao IS 'Tipo de ação executada';
COMMENT ON COLUMN public.tb_logs_auditoria.ip_usuario IS 'Endereço IP do usuário no momento da ação';
COMMENT ON COLUMN public.tb_logs_auditoria.user_agent IS 'User agent do navegador do usuário';
COMMENT ON COLUMN public.tb_logs_auditoria.timestamp IS 'Data e hora da ação';
COMMENT ON COLUMN public.tb_logs_auditoria.detalhes IS 'Detalhes adicionais da ação em formato JSON';

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.tb_logs_auditoria ENABLE ROW LEVEL SECURITY;

-- Política de segurança: Apenas admins podem ver logs
-- TODO: Ajustar conforme o modelo de permissões do seu sistema
CREATE POLICY "logs_select_admin" ON public.tb_logs_auditoria
  FOR SELECT USING (false); -- Por padrão, ninguém lê (apenas backend/admin)

-- Política de segurança: Apenas o sistema pode inserir logs
CREATE POLICY "logs_insert_system" ON public.tb_logs_auditoria
  FOR INSERT WITH CHECK (true); -- Permitir inserção

-- ============================================
-- INSERIR LOGS DE EXEMPLO (OPCIONAL)
-- ============================================

-- Exemplo de logs de aceite
INSERT INTO public.tb_logs_auditoria 
  (atribuicao_id, usuario_id, acao, ip_usuario, user_agent, timestamp, detalhes)
VALUES
  (1, 1, 'ACEITE_ATIVO', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '5 days', 
   '{"versao_termo": "1.0", "status_anterior": "PENDENTE", "status_novo": "ACEITO"}'::jsonb),
  (2, 1, 'ACEITE_ATIVO', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '3 days',
   '{"versao_termo": "1.0", "status_anterior": "PENDENTE", "status_novo": "ACEITO"}'::jsonb),
  (4, 2, 'ACEITE_ATIVO', '192.168.1.150', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL '2 days',
   '{"versao_termo": "1.0", "status_anterior": "PENDENTE", "status_novo": "ACEITO"}'::jsonb);

-- ============================================
-- QUERIES ÚTEIS PARA CONSULTAR LOGS
-- ============================================

-- Ver todos os logs de um usuário específico
-- SELECT * FROM public.tb_logs_auditoria WHERE usuario_id = 1 ORDER BY timestamp DESC;

-- Ver todos os aceites de ativos
-- SELECT * FROM public.tb_logs_auditoria WHERE acao = 'ACEITE_ATIVO' ORDER BY timestamp DESC;

-- Ver logs das últimas 24 horas
-- SELECT * FROM public.tb_logs_auditoria WHERE timestamp > NOW() - INTERVAL '24 hours' ORDER BY timestamp DESC;

-- Contar ações por usuário
-- SELECT usuario_id, acao, COUNT(*) as total 
-- FROM public.tb_logs_auditoria 
-- GROUP BY usuario_id, acao 
-- ORDER BY usuario_id, total DESC;

-- Ver logs com detalhes de uma atribuição específica
-- SELECT l.*, a.status_aceite, at.num_etiqueta, at.tipo
-- FROM public.tb_logs_auditoria l
-- JOIN public.atribuicoes a ON l.atribuicao_id = a.id
-- JOIN public.ativos at ON a.ativo_id = at.id
-- WHERE l.atribuicao_id = 1;

-- Análise de segurança: IPs mais ativos
-- SELECT ip_usuario, COUNT(*) as total_acoes, COUNT(DISTINCT usuario_id) as usuarios_distintos
-- FROM public.tb_logs_auditoria
-- GROUP BY ip_usuario
-- ORDER BY total_acoes DESC
-- LIMIT 10;
