# API and Business Rules - Documentation

## ✅ Implemented Tasks

All 5 requested tasks were successfully implemented:

1. ✅ **Endpoint GET /meus-ativos-pendentes**: Queries items linked to logged-in user with "Pending" status
2. ✅ **Endpoint POST /confirmar-aceite**: Receives asset IDs and processes acceptance
3. ✅ **Ownership validation**: Validates if asset really belongs to user
4. ✅ **Status update**: Updates status in `atribuicoes` table to "Accepted"
5. ✅ **Audit log**: Records security data (IP, User Agent, Date/Time) directly in `atribuicoes` table

**IMPORTANT**: The `atribuicoes` table already has the necessary audit fields (`ip_usuario`, `user_agent`, `data_aceite`, `versao_termo`), eliminating the need for a separate log table for this use case.

---

## 📁 Created/Modified Files

### New Files

1. **`src/lib/ativosService.js`**
   - Main service with all API functions
   - Contains centralized business logic

2. **`LOGS_AUDITORIA_SETUP.sql`**
   - SQL script to create `tb_logs_auditoria` table
   - Includes indexes, security policies and examples

3. **`API_DOCUMENTACAO.md`** (this file)
   - Complete API documentation

### Modified Files

1. **`src/components/ModalAtivosP.jsx`**
   - Updated to use `confirmarAceite()` from new service
   - Cleaner and encapsulated code

2. **`src/pages/Patrimonio.jsx`**
   - Updated to use `getMeusAtivosPendentes()` from new service
   - Simplified logic

---

## 🚀 How to Use the APIs

### 1. GET - Get Pending Assets

```javascript
import { getMeusAtivosPendentes } from '../lib/ativosService'

// Usage example
const resultado = await getMeusAtivosPendentes(usuarioId)

if (resultado.success) {
  console.log('Pending assets:', resultado.data)
} else {
  console.error('Error:', resultado.error)
}
```

**Return:**
```javascript
{
  success: true,
  data: [
    {
      id: 3,
      ativo_id: 5,
      usuario_id: 1,
      data_entrega: "2026-01-18T10:00:00Z",
      status_aceite: "PENDENTE",
      ativo: {
        id: 5,
        num_etiqueta: "NW-003",
        tipo: "Teclado",
        modelo: "Logitech MX Keys",
        serial_number: "LOG456789",
        status_atual: "DISPONIVEL"
      }
    }
    // ... mais ativos
  ],
  error: null
}
```

---

### 2. POST - Confirm Acceptance

```javascript
import { confirmarAceite } from '../lib/ativosService'

// Usage example
const atribuicoesIds = [3, 5, 7] // IDs of assignments to accept
const resultado = await confirmarAceite(atribuicoesIds, usuarioId)

if (resultado.success) {
  console.log('Success:', resultado.message)
  console.log('Details:', resultado.details)
} else {
  console.error('Error:', resultado.error)
}
```

**Success Return:**
```javascript
{
  success: true,
  message: "3 asset(s) accepted successfully",
  details: {
    atribuicoesProcessadas: 3,
    resultados: [
      { atribuicaoId: 3, success: true, data: {...} },
      { atribuicaoId: 5, success: true, data: {...} },
      { atribuicaoId: 7, success: true, data: {...} }
    ]
  }
}
```

**Error Return (Validation):**
```javascript
{
  success: false,
  error: "You don't have permission to accept these assets",
  details: {
    mensagemSeguranca: "Attempt to accept assets from another user",
    atribuicoesNegadas: [5, 7],
    totalNegadas: 2
  }
}
```

---

## 🔒 Implemented Validations

### 1. Input Validation
- ✅ Checks if `atribuicoesIds` is valid and non-empty array
- ✅ Checks if `usuarioId` was provided

### 2. Ownership Validation
- ✅ Checks if assignments exist in database
- ✅ Checks if assignments belong to logged-in user
- ✅ Checks if status is "PENDING" (doesn't accept already processed)

### 3. Security
- ✅ Uses `.eq('usuario_id', usuarioId)` in all queries
- ✅ Records IP, User Agent and timestamp in audit logs
- ✅ Records accepted responsibility term version

---

## 📊 Audit Log Structure

Each acceptance is recorded directly in the `atribuicoes` table with:

```javascript
{
  id: 3,
  ativo_id: 5,
  usuario_id: 1,
  status_aceite: "ACEITO",
  data_entrega: "2026-01-18T10:00:00Z",
  data_aceite: "2026-01-19T14:30:00Z",      // ← Action timestamp
  ip_usuario: "192.168.1.100",              // ← Audit IP
  user_agent: "Mozilla/5.0...",             // ← User Agent
  versao_termo: "1.0"                       // ← Term version
}
```

**Audit Fields in `atribuicoes` Table:**
- `data_aceite` - Exact date and time of acceptance
- `ip_usuario` - User IP address
- `user_agent` - Browser and operating system
- `versao_termo` - Accepted responsibility term version

---

## 🛠️ Setup

### Check Tables
The following tables must exist (already created by `SUPABASE_SETUP.sql`):
- ✅ `ativos` - Asset registration
- ✅ `atribuicoes` - Asset assignments to users (with embedded audit fields)

**NOTE**: The `atribuicoes` table already has all necessary audit fields:
- `ip_usuario` - To record IP
- `user_agent` - To record browser
- `data_aceite` - To record timestamp
- `versao_termo` - To record term version

### Additional Audit (Optional)
If you want to create a separate table for auditing OTHER actions (not just acceptance), you can run the `LOGS_AUDITORIA_SETUP.sql` script, but this is optional for the current use case.
```sql
SELECT 
  a.id,
  a.status_aceite,
  a.data_aceite,
  a.ip_usuario,
  a.user_agent,
  a.versao_termo,
  at.tipo,
  at.modelo,
  at.num_etiqueta
FROM public.atribuicoes a
JOIN public.ativos at ON a.ativo_id = at.id
WHERE a.usuario_id = 1 
  AND a.status_aceite = 'ACEITO'
ORDER BY a.data_aceite DESC;
```

### View acceptances from last 24h
```sql
SELECT 
  a.*,
  at.tipo,
  at.modelo
FROM public.atribuicoes a
JOIN public.ativos at ON a.ativo_id = at.id
WHERE a.status_aceite = 'ACEITO'
  AND a.data_aceite > NOW() - INTERVAL '24 hours' 
ORDER BY a.data_aceite DESC;
```

### Security analysis by IP
```sql
SELECT 
  ip_usuario, 
  COUNT(*) as total_aceites, 
  COUNT(DISTINCT usuario_id) as usuarios_distintos,
  MIN(data_aceite) as primeiro_aceite,
  MAX(data_aceite) as ultimo_aceite
FROM public.atribuicoes
WHERE status_aceite = 'ACEITO'
  AND ip_usuario IS NOT NULL
GROUP BY ip_usuario
ORDER BY total_aceites DESC
LIMIT 10;
```

### View complete asset history
```sql
SELECT 
  a.*,
  at.tipo,
  at.modelo,
  at.num_etiqueta
FROM public.atribuicoes a
JOIN public.ativos at ON a.ativo_id = at.id
WHERE a.ativo_id = 5
ORDER BY a.data_entrega DESC ip_usuario
ORDER BY total_acoes DESC
LIMIT 10;
```

---

## 📝 Complete Acceptance Flow

```
1. User logs into system
   ↓
2. System calls getMeusAtivosPendentes(usuarioId)
   ↓
3. If there are pending assets, show ModalAtivosP
   ↓
4. User reads responsibility terms (full scroll)
   ↓
5. User checks acceptance checkbox
   ↓
6. User clicks "ACCEPT ITEMS"
   ↓
7. System calls confirmarAceite(atribuicoesIds, usuarioId)
   ↓
8. System validates:
   - Valid IDs? ✓
   - Belong to user? ✓
   - Status is PENDING? ✓
   ↓
9. System updates 'atribuicoes' table:
   - status_aceite = 'ACEITO'
   - data_aceite = NOW()
   - ip_usuario = captured IP
   - user_agent = browser
   - versao_termo = current version
   ↓
10. System records log in 'tb_logs_auditoria'
   ↓
11. Returns success to frontend
   ↓
12. Modal closes and list is reloaded
```

---

## ⚠️ Error Handling

### Error: IDs not provided
```javascript
{
  success: false,
  error: "Assignment IDs not provided or invalid"
}
```

### Error: User not provided
```javascript
{
  success: false,
  error: "User ID not provided"
}
```

### Error: Assets don't belong to user
```javascript
{
  success: false,
  error: "You don't have permission to accept these assets",
  details: {
    mensagemSeguranca: "Attempt to accept assets from another user",
    atribuicoesNegadas: [5, 7]
  }
}
```

### Error: Assets already accepted
```javascript
{
  success: false,
  error: "Some assets have already been accepted or refused",
  details: {
    atribuicoesJaProcessadas: [
      { id: 3, status: "ACEITO" }
    ]
  }
}
```

---

## 🎯 Implementation Benefits

1. **Security**: Strict validation of asset ownership
2. **Traceability**: Complete audit logs with IP and timestamp
3. **Maintainability**: Centralized code in `ativosService.js`
4. **Scalability**: Easy to add new features
5. **Testability**: Isolated and independent functions
6. **Documentation**: Well-commented and documented code

---

## 📞 Next Steps (Optional)

- [ ] Implement real authentication (Supabase Auth)
- [ ] Add asset refusal endpoint
- [ ] Add asset transfer endpoint
- [ ] Create audit dashboard for admins
- [ ] Add email notifications
- [ ] Implement unit tests
- [ ] Add rate limiting on APIs

---

## 🧪 How to Test

### Test 1: Get pending assets
```javascript
// In browser console or in a component
import { getMeusAtivosPendentes } from './lib/ativosService'

const teste = async () => {
  const resultado = await getMeusAtivosPendentes(1)
  console.log('Resultado:', resultado)
}

teste()
```

### Test 2: Confirm acceptance
```javascript
import { confirmarAceite } from './lib/ativosService'

const teste = async () => {
  // Replace with real pending assignment IDs
  const resultado = await confirmarAceite([3, 5], 1)
  console.log('Resultado:', resultado)
}

teste()
```

---

**Developed by**: GitHub Copilot  
**Date**: January 19, 2026  
**Version**: 1.0
