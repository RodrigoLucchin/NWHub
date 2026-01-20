-- ============================================
-- EXEMPLO: Script SQL para Supabase
-- ============================================
-- Execute estas queries no Supabase SQL Editor
-- em: https://app.supabase.com/project/[SEU_PROJETO]/sql

-- ============================================
-- 1. CRIAR TABELA ATIVOS (se não existir)
-- ============================================

CREATE TABLE IF NOT EXISTS public.ativos (
  id serial NOT NULL,
  num_etiqueta character varying(50) NOT NULL UNIQUE,
  tipo character varying(50) NOT NULL,
  modelo character varying(100),
  serial_number character varying(100),
  status_atual character varying(20) DEFAULT 'DISPONIVEL'::character varying,
  data_criacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ativos_pkey PRIMARY KEY (id),
  CONSTRAINT chk_status_ativos CHECK (
    (status_atual)::text = ANY (
      ARRAY['DISPONIVEL'::character varying, 
            'EM_USO'::character varying, 
            'MANUTENCAO'::character varying, 
            'BAIXADO'::character varying]::text[]
    )
  )
) TABLESPACE pg_default;

-- ============================================
-- 2. CRIAR TABELA ATRIBUICOES (se não existir)
-- ============================================

CREATE TABLE IF NOT EXISTS public.atribuicoes (
  id serial NOT NULL,
  ativo_id integer NOT NULL,
  usuario_id integer NOT NULL,
  data_entrega timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  data_devolucao timestamp without time zone,
  status_aceite character varying(20) DEFAULT 'PENDENTE'::character varying,
  data_aceite timestamp without time zone,
  ip_usuario character varying(45),
  user_agent text,
  versao_termo character varying(20),
  CONSTRAINT atribuicoes_pkey PRIMARY KEY (id),
  CONSTRAINT fk_ativo FOREIGN KEY (ativo_id) 
    REFERENCES public.ativos(id) ON DELETE CASCADE,
  CONSTRAINT chk_status_aceite CHECK (
    (status_aceite)::text = ANY (
      ARRAY['PENDENTE'::character varying, 
            'ACEITO'::character varying, 
            'RECUSADO'::character varying]::text[]
    )
  )
) TABLESPACE pg_default;

-- ============================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_atribuicoes_usuario_id 
  ON public.atribuicoes(usuario_id);

CREATE INDEX IF NOT EXISTS idx_atribuicoes_status 
  ON public.atribuicoes(status_aceite);

CREATE INDEX IF NOT EXISTS idx_atribuicoes_ativo_id 
  ON public.atribuicoes(ativo_id);

-- ============================================
-- 4. INSERIR DADOS DE EXEMPLO
-- ============================================

-- Inserir alguns ativos de exemplo
INSERT INTO public.ativos (num_etiqueta, tipo, modelo, serial_number, status_atual) VALUES
('NW-001', 'Notebook', 'Dell Latitude 5530', 'DELL123456', 'EM_USO'),
('NW-002', 'Monitor', 'LG 24" FHD', 'LG987654', 'EM_USO'),
('NW-003', 'Teclado', 'Logitech MX Keys', 'LOG456789', 'DISPONIVEL'),
('NW-004', 'Mouse', 'Logitech MX Master 3', 'LOG111222', 'EM_USO'),
('NW-005', 'Webcam', 'Logitech C920', 'LOG333444', 'DISPONIVEL'),
('NW-006', 'Fone', 'Sony WH-1000XM5', 'SONY555666', 'EM_USO'),
('NW-007', 'Notebook', 'MacBook Pro 14"', 'APPLE777888', 'DISPONIVEL'),
('NW-008', 'Docking Station', 'Thunderbolt 4', 'TBOLT999000', 'EM_USO'),
ON CONFLICT (num_etiqueta) DO NOTHING;

-- Inserir atribuições de exemplo (alguns pendentes)
INSERT INTO public.atribuicoes (ativo_id, usuario_id, data_entrega, status_aceite) VALUES
(1, 1, NOW() - INTERVAL '5 days', 'ACEITO'),
(2, 1, NOW() - INTERVAL '3 days', 'ACEITO'),
(3, 1, NOW() - INTERVAL '1 day', 'PENDENTE'),
(4, 2, NOW() - INTERVAL '2 days', 'ACEITO'),
(5, 2, NOW(), 'PENDENTE'),
(6, 3, NOW() - INTERVAL '7 days', 'ACEITO'),
(7, 3, NOW() - INTERVAL '1 day', 'PENDENTE'),
(8, 4, NOW() - INTERVAL '10 days', 'ACEITO');

-- ============================================
-- 5. ATUALIZAR STATUS DE ACEITE COM DADOS
-- ============================================

-- Atualizar alguns aceites com dados de auditoria
UPDATE public.atribuicoes SET 
  data_aceite = data_entrega + INTERVAL '2 hours',
  ip_usuario = '192.168.1.100',
  user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  versao_termo = '1.0'
WHERE status_aceite = 'ACEITO' AND data_aceite IS NULL;

-- ============================================
-- 6. HABILITAR POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

-- Ativar RLS nas tabelas
ALTER TABLE public.ativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atribuicoes ENABLE ROW LEVEL SECURITY;

-- Políticas para ativos (leitura pública, escrita apenas admin)
CREATE POLICY "ativos_select" ON public.ativos
  FOR SELECT USING (true);

-- Políticas para atribuições (cada usuário vê apenas suas)
CREATE POLICY "atribuicoes_select" ON public.atribuicoes
  FOR SELECT USING (usuario_id = (SELECT auth.uid()::int));

-- ============================================
-- 7. VERIFICAR DADOS
-- ============================================

-- Ver todos os ativos
SELECT * FROM public.ativos;

-- Ver todas as atribuições
SELECT * FROM public.atribuicoes;

-- Ver atribuições pendentes
SELECT a.*, at.tipo, at.modelo, at.num_etiqueta
FROM public.atribuicoes a
JOIN public.ativos at ON a.ativo_id = at.id
WHERE a.status_aceite = 'PENDENTE';

-- Ver atribuições por usuário
SELECT usuario_id, COUNT(*) as total, 
  COUNT(CASE WHEN status_aceite = 'PENDENTE' THEN 1 END) as pendentes
FROM public.atribuicoes
GROUP BY usuario_id;
